---
title: "模块化架构设计"
description: "学习和掌握模块化架构设计的实际应用"
category: "advanced"
language: "javascript"
---

# 模块化架构设计

## 企业级模块结构

```javascript
// src/core/index.js - 核心模块聚合
export { EventBus } from './EventBus.js';
export { Store } from './Store.js';
export { Router } from './Router.js';
export { Logger } from './Logger.js';
export { Config } from './Config.js';

// src/core/EventBus.js - 事件总线
export class EventBus {
  constructor() {
    this.events = new Map();
    this.onceEvents = new Map();
  }
  
  on(event, handler, context = null) {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event).push({ handler, context });
    return this;
  }
  
  once(event, handler, context = null) {
    if (!this.onceEvents.has(event)) {
      this.onceEvents.set(event, []);
    }
    this.onceEvents.get(event).push({ handler, context });
    return this;
  }
  
  off(event, handler = null) {
    if (handler === null) {
      this.events.delete(event);
      this.onceEvents.delete(event);
    } else {
      const removeHandler = (handlers) => {
        const index = handlers.findIndex(h => h.handler === handler);
        if (index > -1) handlers.splice(index, 1);
      };
      
      if (this.events.has(event)) {
        removeHandler(this.events.get(event));
      }
      if (this.onceEvents.has(event)) {
        removeHandler(this.onceEvents.get(event));
      }
    }
    return this;
  }
  
  emit(event, ...args) {
    const emitHandlers = (handlers) => {
      handlers.forEach(({ handler, context }) => {
        handler.apply(context, args);
      });
    };
    
    if (this.events.has(event)) {
      emitHandlers(this.events.get(event).slice());
    }
    
    if (this.onceEvents.has(event)) {
      const handlers = this.onceEvents.get(event).slice();
      this.onceEvents.delete(event);
      emitHandlers(handlers);
    }
    
    return this;
  }
}

// src/core/Store.js - 状态管理
export class Store {
  constructor(initialState = {}) {
    this.state = initialState;
    this.listeners = new Set();
    this.middleware = [];
  }
  
  use(middleware) {
    this.middleware.push(middleware);
    return this;
  }
  
  getState() {
    return { ...this.state };
  }
  
  setState(updates) {
    const prevState = this.getState();
    const nextState = { ...prevState, ...updates };
    
    // 应用中间件
    const context = { prevState, nextState, updates };
    for (const mw of this.middleware) {
      const result = mw(context);
      if (result === false) return; // 中间件可以阻止更新
    }
    
    this.state = nextState;
    this.notify(prevState, nextState);
  }
  
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  
  notify(prevState, nextState) {
    this.listeners.forEach(listener => {
      listener(nextState, prevState);
    });
  }
}

// src/core/Logger.js - 日志系统
export class Logger {
  static levels = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3
  };
  
  constructor(name, level = Logger.levels.INFO) {
    this.name = name;
    this.level = level;
    this.handlers = [];
  }
  
  addHandler(handler) {
    this.handlers.push(handler);
    return this;
  }
  
  log(level, message, ...args) {
    if (level < this.level) return;
    
    const record = {
      name: this.name,
      level,
      levelName: Object.keys(Logger.levels).find(key => Logger.levels[key] === level),
      message,
      args,
      timestamp: new Date(),
      stack: new Error().stack
    };
    
    this.handlers.forEach(handler => handler(record));
  }
  
  debug(message, ...args) {
    this.log(Logger.levels.DEBUG, message, ...args);
  }
  
  info(message, ...args) {
    this.log(Logger.levels.INFO, message, ...args);
  }
  
  warn(message, ...args) {
    this.log(Logger.levels.WARN, message, ...args);
  }
  
  error(message, ...args) {
    this.log(Logger.levels.ERROR, message, ...args);
  }
}

// 默认控制台处理器
Logger.consoleHandler = (record) => {
  const method = record.levelName.toLowerCase();
  console[method](`[${record.name}]`, record.message, ...record.args);
};
```

## 插件系统架构

```javascript
// src/plugin-system/PluginManager.js
export class PluginManager {
  constructor(app) {
    this.app = app;
    this.plugins = new Map();
    this.hooks = new Map();
  }
  
  // 注册插件
  async register(plugin) {
    if (typeof plugin === 'function') {
      plugin = { install: plugin };
    }
    
    if (!plugin.name) {
      throw new Error('Plugin must have a name');
    }
    
    if (this.plugins.has(plugin.name)) {
      throw new Error(`Plugin ${plugin.name} already registered`);
    }
    
    // 安装插件
    const context = this.createContext(plugin);
    await plugin.install(context, plugin.options || {});
    
    this.plugins.set(plugin.name, plugin);
    console.log(`Plugin ${plugin.name} registered`);
  }
  
  // 创建插件上下文
  createContext(plugin) {
    return {
      app: this.app,
      hook: (name, handler) => this.addHook(name, handler, plugin),
      emit: (name, ...args) => this.runHooks(name, ...args),
      store: this.app.store,
      logger: new Logger(`plugin:${plugin.name}`)
    };
  }
  
  // 添加钩子
  addHook(name, handler, plugin) {
    if (!this.hooks.has(name)) {
      this.hooks.set(name, []);
    }
    this.hooks.get(name).push({
      handler,
      plugin: plugin.name,
      priority: plugin.priority || 0
    });
    // 按优先级排序
    this.hooks.get(name).sort((a, b) => b.priority - a.priority);
  }
  
  // 运行钩子
  async runHooks(name, ...args) {
    if (!this.hooks.has(name)) return;
    
    const hooks = this.hooks.get(name);
    let result = args[0];
    
    for (const { handler, plugin } of hooks) {
      try {
        const hookResult = await handler(result, ...args.slice(1));
        if (hookResult !== undefined) {
          result = hookResult;
        }
      } catch (error) {
        console.error(`Error in hook ${name} from plugin ${plugin}:`, error);
      }
    }
    
    return result;
  }
}

// 示例插件
export const routerPlugin = {
  name: 'router',
  priority: 100,
  install(context, options) {
    const router = new Router(options);
    
    // 添加到应用
    context.app.router = router;
    
    // 监听路由变化
    router.on('change', (route) => {
      context.emit('route:change', route);
    });
    
    // 添加钩子
    context.hook('app:init', () => {
      router.init();
    });
  }
};

export const authPlugin = {
  name: 'auth',
  priority: 90,
  install(context) {
    const auth = {
      user: null,
      token: localStorage.getItem('token'),
      
      async login(credentials) {
        const result = await context.emit('auth:login', credentials);
        if (result.success) {
          this.user = result.user;
          this.token = result.token;
          localStorage.setItem('token', this.token);
        }
        return result;
      },
      
      logout() {
        this.user = null;
        this.token = null;
        localStorage.removeItem('token');
        context.emit('auth:logout');
      },
      
      isAuthenticated() {
        return !!this.token;
      }
    };
    
    context.app.auth = auth;
    
    // 拦截路由
    context.hook('route:before', (route) => {
      if (route.meta?.requiresAuth && !auth.isAuthenticated()) {
        return { name: 'login', query: { redirect: route.path } };
      }
    });
  }
};
```

## 依赖注入容器

```javascript
// src/di/Container.js
export class Container {
  constructor() {
    this.services = new Map();
    this.singletons = new Map();
  }
  
  // 注册服务
  register(name, factory, options = {}) {
    this.services.set(name, {
      factory,
      singleton: options.singleton !== false,
      dependencies: options.dependencies || []
    });
  }
  
  // 注册值
  value(name, value) {
    this.singletons.set(name, value);
  }
  
  // 获取服务
  get(name) {
    // 如果是已创建的单例
    if (this.singletons.has(name)) {
      return this.singletons.get(name);
    }
    
    // 如果服务未注册
    if (!this.services.has(name)) {
      throw new Error(`Service ${name} not found`);
    }
    
    const service = this.services.get(name);
    
    // 解析依赖
    const deps = service.dependencies.map(dep => this.get(dep));
    
    // 创建实例
    const instance = service.factory(...deps);
    
    // 如果是单例，缓存起来
    if (service.singleton) {
      this.singletons.set(name, instance);
    }
    
    return instance;
  }
  
  // 检查循环依赖
  checkCircularDependency(name, chain = []) {
    if (chain.includes(name)) {
      throw new Error(`Circular dependency detected: ${chain.join(' -> ')} -> ${name}`);
    }
    
    if (!this.services.has(name)) return;
    
    const service = this.services.get(name);
    const newChain = [...chain, name];
    
    service.dependencies.forEach(dep => {
      this.checkCircularDependency(dep, newChain);
    });
  }
  
  // 装饰器支持
  static inject(...dependencies) {
    return function(target) {
      target.dependencies = dependencies;
      return target;
    };
  }
}

// 使用示例
const container = new Container();

// 注册服务
container.register('config', () => ({
  apiUrl: 'https://api.example.com',
  timeout: 5000
}));

container.register('http', (config) => {
  return {
    async get(url) {
      const response = await fetch(config.apiUrl + url, {
        timeout: config.timeout
      });
      return response.json();
    }
  };
}, { dependencies: ['config'] });

container.register('userService', (http) => {
  return {
    async getUser(id) {
      return http.get(`/users/${id}`);
    },
    async getUsers() {
      return http.get('/users');
    }
  };
}, { dependencies: ['http'] });

// 使用装饰器
@Container.inject('http', 'logger')
class PostService {
  constructor(http, logger) {
    this.http = http;
    this.logger = logger;
  }
  
  async getPosts() {
    this.logger.info('Fetching posts');
    return this.http.get('/posts');
  }
}

container.register('postService', PostService, {
  dependencies: PostService.dependencies
});
```

## 模块联邦示例

```javascript
// host-app/webpack.config.js
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'host',
      filename: 'remoteEntry.js',
      remotes: {
        shared: 'shared@http://localhost:3001/remoteEntry.js',
        analytics: 'analytics@http://localhost:3002/remoteEntry.js'
      },
      shared: {
        react: { singleton: true },
        'react-dom': { singleton: true }
      }
    })
  ]
};

// shared-lib/webpack.config.js
module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'shared',
      filename: 'remoteEntry.js',
      exposes: {
        './Button': './src/components/Button',
        './utils': './src/utils/index'
      },
      shared: {
        react: { singleton: true }
      }
    })
  ]
};

// host-app/src/App.js
import React, { Suspense, lazy } from 'react';

// 动态导入远程模块
const RemoteButton = lazy(() => import('shared/Button'));
const Analytics = lazy(() => import('analytics/Analytics'));

function App() {
  return (
    <div>
      <h1>Host Application</h1>
      <Suspense fallback="Loading Button...">
        <RemoteButton onClick={() => console.log('Clicked!')}>
          Remote Button
        </RemoteButton>
      </Suspense>
      <Suspense fallback="Loading Analytics...">
        <Analytics />
      </Suspense>
    </div>
  );
}

// 运行时动态加载
async function loadRemoteModule(scope, module) {
  await __webpack_init_sharing__('default');
  const container = window[scope];
  await container.init(__webpack_share_scopes__.default);
  const factory = await container.get(module);
  return factory();
}

// 使用
loadRemoteModule('shared', './utils').then(utils => {
  console.log(utils.formatDate(new Date()));
});
```

## 微前端架构

```javascript
// micro-frontend-framework.js
export class MicroFrontendFramework {
  constructor() {
    this.apps = new Map();
    this.activeApp = null;
  }
  
  // 注册微应用
  registerApp(config) {
    const app = {
      name: config.name,
      entry: config.entry,
      container: config.container,
      activeRule: config.activeRule,
      props: config.props || {},
      loader: null,
      instance: null,
      status: 'NOT_LOADED'
    };
    
    this.apps.set(config.name, app);
  }
  
  // 启动框架
  start() {
    // 监听路由变化
    window.addEventListener('popstate', () => this.reroute());
    this.reroute();
  }
  
  // 路由匹配
  async reroute() {
    const path = window.location.pathname;
    
    // 找到匹配的应用
    const app = Array.from(this.apps.values()).find(app => {
      if (typeof app.activeRule === 'function') {
        return app.activeRule(path);
      }
      return path.startsWith(app.activeRule);
    });
    
    if (app && app !== this.activeApp) {
      // 卸载当前应用
      if (this.activeApp) {
        await this.unmountApp(this.activeApp);
      }
      
      // 加载并挂载新应用
      await this.loadApp(app);
      await this.mountApp(app);
      
      this.activeApp = app;
    }
  }
  
  // 加载应用
  async loadApp(app) {
    if (app.status !== 'NOT_LOADED') return;
    
    app.status = 'LOADING';
    
    try {
      // 动态导入应用
      const module = await import(app.entry);
      app.loader = module;
      app.status = 'LOADED';
    } catch (error) {
      app.status = 'LOAD_ERROR';
      throw error;
    }
  }
  
  // 挂载应用
  async mountApp(app) {
    if (app.status !== 'LOADED') return;
    
    app.status = 'MOUNTING';
    
    try {
      const { mount } = app.loader;
      app.instance = await mount({
        container: document.querySelector(app.container),
        props: app.props,
        onGlobalStateChange: this.onGlobalStateChange.bind(this),
        setGlobalState: this.setGlobalState.bind(this)
      });
      
      app.status = 'MOUNTED';
    } catch (error) {
      app.status = 'MOUNT_ERROR';
      throw error;
    }
  }
  
  // 卸载应用
  async unmountApp(app) {
    if (app.status !== 'MOUNTED') return;
    
    app.status = 'UNMOUNTING';
    
    try {
      const { unmount } = app.loader;
      await unmount(app.instance);
      app.instance = null;
      app.status = 'LOADED';
    } catch (error) {
      app.status = 'UNMOUNT_ERROR';
      throw error;
    }
  }
  
  // 全局状态管理
  globalState = {};
  stateChangeCallbacks = [];
  
  onGlobalStateChange(callback) {
    this.stateChangeCallbacks.push(callback);
    return () => {
      const index = this.stateChangeCallbacks.indexOf(callback);
      if (index > -1) {
        this.stateChangeCallbacks.splice(index, 1);
      }
    };
  }
  
  setGlobalState(state) {
    this.globalState = { ...this.globalState, ...state };
    this.stateChangeCallbacks.forEach(cb => cb(this.globalState));
  }
}

// 使用示例
const framework = new MicroFrontendFramework();

framework.registerApp({
  name: 'dashboard',
  entry: '/apps/dashboard/main.js',
  container: '#app-container',
  activeRule: '/dashboard',
  props: { theme: 'dark' }
});

framework.registerApp({
  name: 'settings',
  entry: '/apps/settings/main.js',
  container: '#app-container',
  activeRule: (path) => path.startsWith('/settings')
});

framework.start();
```