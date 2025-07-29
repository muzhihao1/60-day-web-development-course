---
day: 19
exerciseTitle: "构建模块化组件库"
approach: "使用ES Modules、Rollup打包和TypeScript类型定义构建现代化组件库"
files:
  - path: "ui-library-complete.js"
    language: "javascript"
    description: "完整的组件库实现，包含构建配置和使用示例"
keyTakeaways:
  - "ES Modules是组织现代JavaScript库的最佳方式"
  - "提供多种构建格式确保最大兼容性"
  - "Tree Shaking需要正确的模块导出方式"
  - "类型定义提升开发体验"
  - "插件系统增强库的可扩展性"
commonMistakes:
  - "混用CommonJS和ES Modules导致Tree Shaking失效"
  - "忘记在package.json中声明sideEffects"
  - "循环依赖导致构建失败"
  - "没有正确配置external防止打包依赖"
  - "类型定义与实际实现不匹配"
extensions:
  - title: "添加React组件支持"
    description: "扩展库支持React组件和hooks"
  - title: "实现CSS-in-JS"
    description: "添加运行时样式生成系统"
  - title: "创建CLI工具"
    description: "开发脚手架工具快速创建组件"
---

# 解决方案：模块化组件库

## 实现思路

这个解决方案展示了如何构建一个生产级的JavaScript组件库：
1. **模块化架构** - 清晰的目录结构和导出策略
2. **多格式构建** - 支持ES Module、CommonJS和UMD
3. **类型支持** - 完整的TypeScript定义
4. **插件系统** - 可扩展的架构设计
5. **优化策略** - Tree Shaking和按需加载

## 完整实现

### ui-library-complete.js

```javascript
// ========================================
// 1. 项目结构和配置文件
// ========================================

// package.json
const packageJson = {
  "name": "@myorg/ui-lib",
  "version": "1.0.0",
  "description": "A modern, modular UI component library",
  "main": "dist/index.cjs.js",
  "module": "dist/index.esm.js",
  "unpkg": "dist/index.umd.js",
  "types": "dist/index.d.ts",
  "sideEffects": [
    "*.css",
    "*.scss",
    "dist/styles/*"
  ],
  "files": [
    "dist",
    "src"
  ],
  "scripts": {
    "build": "npm run clean && npm run build:js && npm run build:types && npm run build:styles",
    "build:js": "rollup -c",
    "build:types": "tsc --emitDeclarationOnly",
    "build:styles": "postcss src/styles/index.css -o dist/styles.css",
    "clean": "rimraf dist",
    "dev": "rollup -c -w",
    "test": "jest",
    "lint": "eslint src --ext .js,.ts",
    "prepublishOnly": "npm run test && npm run build"
  },
  "exports": {
    ".": {
      "import": "./dist/index.esm.js",
      "require": "./dist/index.cjs.js",
      "types": "./dist/index.d.ts"
    },
    "./styles": "./dist/styles.css"
  },
  "devDependencies": {
    "@rollup/plugin-commonjs": "^21.0.0",
    "@rollup/plugin-node-resolve": "^13.0.0",
    "@rollup/plugin-typescript": "^8.3.0",
    "rollup": "^2.60.0",
    "rollup-plugin-terser": "^7.0.0",
    "typescript": "^4.5.0"
  }
};

// rollup.config.js
const rollupConfig = `
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';
import postcss from 'rollup-plugin-postcss';
import pkg from './package.json';

const input = 'src/index.ts';
const external = [
  ...Object.keys(pkg.peerDependencies || {}),
  ...Object.keys(pkg.dependencies || {})
];

const plugins = [
  nodeResolve(),
  commonjs(),
  typescript({
    tsconfig: './tsconfig.json',
    declaration: false
  }),
  postcss({
    modules: true,
    extract: 'styles.css',
    minimize: true
  })
];

export default [
  // ES Module build
  {
    input,
    external,
    plugins,
    output: {
      file: pkg.module,
      format: 'es',
      sourcemap: true
    }
  },
  
  // CommonJS build
  {
    input,
    external,
    plugins,
    output: {
      file: pkg.main,
      format: 'cjs',
      sourcemap: true,
      exports: 'named'
    }
  },
  
  // UMD build
  {
    input,
    external: Object.keys(pkg.peerDependencies || {}),
    plugins: [...plugins, terser()],
    output: {
      file: pkg.unpkg,
      format: 'umd',
      name: 'UILib',
      sourcemap: true,
      globals: {
        react: 'React',
        'react-dom': 'ReactDOM'
      }
    }
  }
];
`;

// tsconfig.json
const tsConfig = {
  "compilerOptions": {
    "target": "ES2018",
    "module": "ESNext",
    "lib": ["ES2018", "DOM"],
    "declaration": true,
    "declarationDir": "./dist",
    "outDir": "./dist",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
};

// ========================================
// 2. 核心基础类
// ========================================

// src/core/Component.ts
class Component {
  constructor(options = {}) {
    this.options = { ...this.constructor.defaultOptions, ...options };
    this.element = null;
    this.mounted = false;
    this.destroyed = false;
    this._events = new Map();
    this._uid = this.generateUID();
  }
  
  static defaultOptions = {};
  
  generateUID() {
    return `ui-${this.constructor.name.toLowerCase()}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  init() {
    if (this.destroyed) {
      throw new Error('Cannot initialize destroyed component');
    }
    this.createElement();
    this.bindEvents();
    return this;
  }
  
  createElement() {
    // 子类实现
    throw new Error('createElement must be implemented');
  }
  
  bindEvents() {
    // 子类实现
  }
  
  on(event, handler) {
    if (!this._events.has(event)) {
      this._events.set(event, []);
    }
    this._events.get(event).push(handler);
    return this;
  }
  
  off(event, handler) {
    if (!handler) {
      this._events.delete(event);
    } else {
      const handlers = this._events.get(event);
      if (handlers) {
        const index = handlers.indexOf(handler);
        if (index > -1) handlers.splice(index, 1);
      }
    }
    return this;
  }
  
  emit(event, ...args) {
    const handlers = this._events.get(event);
    if (handlers) {
      handlers.forEach(handler => handler.apply(this, args));
    }
    return this;
  }
  
  mount(container) {
    if (this.mounted) return this;
    
    if (typeof container === 'string') {
      container = document.querySelector(container);
    }
    
    if (!container) {
      throw new Error('Container element not found');
    }
    
    container.appendChild(this.element);
    this.mounted = true;
    this.emit('mount');
    return this;
  }
  
  unmount() {
    if (!this.mounted) return this;
    
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    
    this.mounted = false;
    this.emit('unmount');
    return this;
  }
  
  destroy() {
    if (this.destroyed) return;
    
    this.unmount();
    this.unbindEvents();
    this._events.clear();
    this.element = null;
    this.destroyed = true;
    this.emit('destroy');
  }
  
  unbindEvents() {
    // 子类实现
  }
}

// ========================================
// 3. UI组件实现
// ========================================

// src/components/Button/Button.ts
class Button extends Component {
  static defaultOptions = {
    text: 'Button',
    type: 'primary',
    size: 'medium',
    disabled: false,
    loading: false,
    icon: null,
    block: false,
    htmlType: 'button'
  };
  
  createElement() {
    this.element = document.createElement('button');
    this.element.type = this.options.htmlType;
    this.element.className = this.getClassName();
    this.element.disabled = this.options.disabled;
    this.element.id = this._uid;
    
    this.updateContent();
  }
  
  getClassName() {
    const classes = ['ui-button'];
    const { type, size, block, loading, disabled } = this.options;
    
    classes.push(`ui-button--${type}`);
    classes.push(`ui-button--${size}`);
    
    if (block) classes.push('ui-button--block');
    if (loading) classes.push('ui-button--loading');
    if (disabled) classes.push('ui-button--disabled');
    
    return classes.join(' ');
  }
  
  updateContent() {
    const { icon, text, loading } = this.options;
    let content = '';
    
    if (loading) {
      content = '<span class="ui-button__loading-icon">⟳</span>';
    } else if (icon) {
      content = `<span class="ui-button__icon">${icon}</span>`;
    }
    
    content += `<span class="ui-button__text">${text}</span>`;
    this.element.innerHTML = content;
  }
  
  bindEvents() {
    this._handleClick = (e) => {
      if (!this.options.disabled && !this.options.loading) {
        this.emit('click', e);
        if (this.options.onClick) {
          this.options.onClick.call(this, e);
        }
      }
    };
    
    this.element.addEventListener('click', this._handleClick);
  }
  
  unbindEvents() {
    if (this._handleClick) {
      this.element.removeEventListener('click', this._handleClick);
    }
  }
  
  setLoading(loading) {
    this.options.loading = loading;
    this.element.className = this.getClassName();
    this.element.disabled = loading || this.options.disabled;
    this.updateContent();
    return this;
  }
  
  setDisabled(disabled) {
    this.options.disabled = disabled;
    this.element.disabled = disabled;
    this.element.className = this.getClassName();
    return this;
  }
  
  setText(text) {
    this.options.text = text;
    this.updateContent();
    return this;
  }
}

// src/components/Modal/Modal.ts
class Modal extends Component {
  static defaultOptions = {
    title: '',
    content: '',
    footer: true,
    closable: true,
    maskClosable: true,
    keyboard: true,
    width: 520,
    centered: false,
    destroyOnClose: false,
    visible: false
  };
  
  static instances = new Map();
  
  createElement() {
    this.element = document.createElement('div');
    this.element.className = 'ui-modal-wrapper';
    this.element.innerHTML = `
      <div class="ui-modal-mask"></div>
      <div class="ui-modal" style="width: ${this.options.width}px">
        <div class="ui-modal__content">
          ${this.options.closable ? '<button class="ui-modal__close">×</button>' : ''}
          ${this.options.title ? `<div class="ui-modal__header">
            <h3 class="ui-modal__title">${this.options.title}</h3>
          </div>` : ''}
          <div class="ui-modal__body"></div>
          ${this.options.footer ? '<div class="ui-modal__footer"></div>' : ''}
        </div>
      </div>
    `;
    
    this.maskElement = this.element.querySelector('.ui-modal-mask');
    this.modalElement = this.element.querySelector('.ui-modal');
    this.bodyElement = this.element.querySelector('.ui-modal__body');
    this.footerElement = this.element.querySelector('.ui-modal__footer');
    
    this.setContent(this.options.content);
    this.setFooter(this.options.footer);
    
    if (this.options.centered) {
      this.modalElement.classList.add('ui-modal--centered');
    }
  }
  
  bindEvents() {
    // 关闭按钮
    const closeBtn = this.element.querySelector('.ui-modal__close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.hide());
    }
    
    // 遮罩点击
    if (this.options.maskClosable) {
      this.maskElement.addEventListener('click', () => this.hide());
    }
    
    // 键盘事件
    if (this.options.keyboard) {
      this._handleKeydown = (e) => {
        if (e.key === 'Escape' && this.visible) {
          this.hide();
        }
      };
      document.addEventListener('keydown', this._handleKeydown);
    }
  }
  
  unbindEvents() {
    if (this._handleKeydown) {
      document.removeEventListener('keydown', this._handleKeydown);
    }
  }
  
  setContent(content) {
    if (typeof content === 'string') {
      this.bodyElement.innerHTML = content;
    } else if (content instanceof HTMLElement) {
      this.bodyElement.innerHTML = '';
      this.bodyElement.appendChild(content);
    }
    return this;
  }
  
  setFooter(footer) {
    if (!this.footerElement) return this;
    
    if (footer === true) {
      // 默认按钮
      this.footerElement.innerHTML = `
        <button class="ui-button ui-button--default" data-action="cancel">取消</button>
        <button class="ui-button ui-button--primary" data-action="ok">确定</button>
      `;
      
      this.footerElement.addEventListener('click', (e) => {
        const action = e.target.dataset.action;
        if (action === 'ok') {
          this.handleOk();
        } else if (action === 'cancel') {
          this.handleCancel();
        }
      });
    } else if (typeof footer === 'string') {
      this.footerElement.innerHTML = footer;
    } else if (footer instanceof HTMLElement) {
      this.footerElement.innerHTML = '';
      this.footerElement.appendChild(footer);
    } else if (!footer) {
      this.footerElement.remove();
      this.footerElement = null;
    }
    
    return this;
  }
  
  show() {
    if (this.visible) return this;
    
    document.body.appendChild(this.element);
    
    // 触发重排以启动动画
    this.element.offsetHeight;
    
    this.element.classList.add('ui-modal-wrapper--visible');
    this.visible = true;
    this.emit('show');
    
    Modal.instances.set(this._uid, this);
    return this;
  }
  
  hide() {
    if (!this.visible) return this;
    
    this.element.classList.remove('ui-modal-wrapper--visible');
    
    const handleTransitionEnd = () => {
      this.element.removeEventListener('transitionend', handleTransitionEnd);
      document.body.removeChild(this.element);
      this.visible = false;
      this.emit('hide');
      
      if (this.options.destroyOnClose) {
        this.destroy();
      }
    };
    
    this.element.addEventListener('transitionend', handleTransitionEnd);
    
    Modal.instances.delete(this._uid);
    return this;
  }
  
  handleOk() {
    const result = this.emit('ok');
    if (result !== false) {
      this.hide();
    }
  }
  
  handleCancel() {
    this.emit('cancel');
    this.hide();
  }
  
  // 静态方法
  static confirm(options) {
    return new Promise((resolve) => {
      const modal = new Modal({
        ...options,
        destroyOnClose: true
      });
      
      modal.on('ok', () => resolve(true));
      modal.on('cancel', () => resolve(false));
      modal.init().show();
    });
  }
  
  static alert(message, title = '提示') {
    return new Promise((resolve) => {
      const modal = new Modal({
        title,
        content: message,
        closable: false,
        maskClosable: false,
        footer: '<button class="ui-button ui-button--primary" data-action="ok">确定</button>',
        destroyOnClose: true
      });
      
      modal.on('ok', () => resolve());
      modal.init().show();
    });
  }
  
  static closeAll() {
    Modal.instances.forEach(modal => modal.hide());
  }
}

// src/components/Form/Form.ts
class Form extends Component {
  static defaultOptions = {
    layout: 'vertical', // vertical, horizontal, inline
    labelWidth: 100,
    requiredMark: true,
    validateTrigger: 'change' // change, blur, submit
  };
  
  constructor(options) {
    super(options);
    this.fields = new Map();
    this.values = {};
    this.errors = {};
  }
  
  createElement() {
    this.element = document.createElement('form');
    this.element.className = `ui-form ui-form--${this.options.layout}`;
    this.element.noValidate = true;
  }
  
  bindEvents() {
    this.element.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });
  }
  
  addField(name, field) {
    this.fields.set(name, field);
    field.on('change', (value) => {
      this.values[name] = value;
      if (this.options.validateTrigger === 'change') {
        this.validateField(name);
      }
    });
    field.on('blur', () => {
      if (this.options.validateTrigger === 'blur') {
        this.validateField(name);
      }
    });
  }
  
  async validateField(name) {
    const field = this.fields.get(name);
    if (!field || !field.rules) return true;
    
    const value = this.values[name];
    const errors = [];
    
    for (const rule of field.rules) {
      if (rule.required && !value) {
        errors.push(rule.message || `${name} is required`);
      } else if (rule.pattern && !rule.pattern.test(value)) {
        errors.push(rule.message || `${name} format is invalid`);
      } else if (rule.validator) {
        try {
          const result = await rule.validator(value, this.values);
          if (result !== true) {
            errors.push(result || `${name} validation failed`);
          }
        } catch (error) {
          errors.push(error.message);
        }
      }
    }
    
    if (errors.length > 0) {
      this.errors[name] = errors;
      field.setError(errors[0]);
      return false;
    } else {
      delete this.errors[name];
      field.clearError();
      return true;
    }
  }
  
  async validate() {
    const results = await Promise.all(
      Array.from(this.fields.keys()).map(name => this.validateField(name))
    );
    return results.every(result => result);
  }
  
  async handleSubmit() {
    const isValid = await this.validate();
    if (isValid) {
      this.emit('submit', this.values);
      if (this.options.onSubmit) {
        this.options.onSubmit(this.values);
      }
    } else {
      this.emit('error', this.errors);
    }
  }
  
  getValues() {
    return { ...this.values };
  }
  
  setValues(values) {
    Object.entries(values).forEach(([name, value]) => {
      const field = this.fields.get(name);
      if (field) {
        field.setValue(value);
        this.values[name] = value;
      }
    });
  }
  
  reset() {
    this.values = {};
    this.errors = {};
    this.fields.forEach(field => field.reset());
  }
}

// ========================================
// 4. 工具函数
// ========================================

// src/utils/dom.ts
export const dom = {
  create(tag, props = {}, children = []) {
    const element = document.createElement(tag);
    
    Object.entries(props).forEach(([key, value]) => {
      if (key === 'className') {
        element.className = value;
      } else if (key === 'style' && typeof value === 'object') {
        Object.assign(element.style, value);
      } else if (key.startsWith('on') && typeof value === 'function') {
        const event = key.slice(2).toLowerCase();
        element.addEventListener(event, value);
      } else if (key === 'innerHTML') {
        element.innerHTML = value;
      } else {
        element.setAttribute(key, value);
      }
    });
    
    children.forEach(child => {
      if (typeof child === 'string') {
        element.appendChild(document.createTextNode(child));
      } else if (child instanceof HTMLElement) {
        element.appendChild(child);
      }
    });
    
    return element;
  },
  
  query(selector, context = document) {
    return context.querySelector(selector);
  },
  
  queryAll(selector, context = document) {
    return Array.from(context.querySelectorAll(selector));
  },
  
  addClass(element, ...classNames) {
    element.classList.add(...classNames);
  },
  
  removeClass(element, ...classNames) {
    element.classList.remove(...classNames);
  },
  
  toggleClass(element, className, force) {
    return element.classList.toggle(className, force);
  },
  
  hasClass(element, className) {
    return element.classList.contains(className);
  },
  
  on(element, event, handler, options) {
    element.addEventListener(event, handler, options);
  },
  
  off(element, event, handler, options) {
    element.removeEventListener(event, handler, options);
  },
  
  once(element, event, handler) {
    element.addEventListener(event, handler, { once: true });
  },
  
  delegate(element, event, selector, handler) {
    element.addEventListener(event, (e) => {
      const target = e.target.closest(selector);
      if (target && element.contains(target)) {
        handler.call(target, e);
      }
    });
  }
};

// src/utils/event.ts
export class EventEmitter {
  constructor() {
    this.events = new Map();
  }
  
  on(event, handler) {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event).push(handler);
    return this;
  }
  
  off(event, handler) {
    if (!handler) {
      this.events.delete(event);
    } else {
      const handlers = this.events.get(event);
      if (handlers) {
        const index = handlers.indexOf(handler);
        if (index > -1) {
          handlers.splice(index, 1);
        }
      }
    }
    return this;
  }
  
  emit(event, ...args) {
    const handlers = this.events.get(event);
    if (handlers) {
      handlers.forEach(handler => handler(...args));
    }
    
    // 支持通配符事件
    const wildcardHandlers = this.events.get('*');
    if (wildcardHandlers) {
      wildcardHandlers.forEach(handler => handler(event, ...args));
    }
    
    return this;
  }
  
  once(event, handler) {
    const onceHandler = (...args) => {
      handler(...args);
      this.off(event, onceHandler);
    };
    return this.on(event, onceHandler);
  }
}

// ========================================
// 5. 插件系统
// ========================================

// src/core/PluginSystem.ts
class PluginSystem {
  constructor() {
    this.plugins = new Map();
    this.hooks = new Map();
    this.components = new Map();
  }
  
  use(plugin, options = {}) {
    if (this.plugins.has(plugin.name)) {
      console.warn(`Plugin ${plugin.name} is already installed`);
      return this;
    }
    
    if (typeof plugin === 'function') {
      plugin(this, options);
    } else if (plugin && typeof plugin.install === 'function') {
      plugin.install(this, options);
    }
    
    this.plugins.set(plugin.name || 'anonymous', plugin);
    return this;
  }
  
  registerComponent(name, component) {
    this.components.set(name, component);
  }
  
  extendComponent(name, extensions) {
    const Component = this.components.get(name);
    if (!Component) {
      throw new Error(`Component ${name} not found`);
    }
    
    Object.entries(extensions).forEach(([key, value]) => {
      if (typeof value === 'function') {
        Component.prototype[key] = value;
      } else {
        Component[key] = value;
      }
    });
  }
  
  hook(name, handler) {
    if (!this.hooks.has(name)) {
      this.hooks.set(name, []);
    }
    this.hooks.get(name).push(handler);
  }
  
  async callHook(name, ...args) {
    const handlers = this.hooks.get(name) || [];
    const results = [];
    
    for (const handler of handlers) {
      results.push(await handler(...args));
    }
    
    return results;
  }
}

// 示例插件
const ThemePlugin = {
  name: 'theme',
  install(pluginSystem, options) {
    const themes = options.themes || {};
    let currentTheme = options.default || 'light';
    
    // 添加主题切换方法
    pluginSystem.extendComponent('Button', {
      setTheme(theme) {
        this.element.dataset.theme = theme;
      }
    });
    
    pluginSystem.extendComponent('Modal', {
      setTheme(theme) {
        this.element.dataset.theme = theme;
      }
    });
    
    // 全局主题管理
    window.UILib = window.UILib || {};
    window.UILib.setTheme = (theme) => {
      if (themes[theme]) {
        currentTheme = theme;
        document.documentElement.dataset.theme = theme;
        
        // 应用主题变量
        const root = document.documentElement;
        Object.entries(themes[theme]).forEach(([key, value]) => {
          root.style.setProperty(`--${key}`, value);
        });
      }
    };
  }
};

// ========================================
// 6. 主入口文件
// ========================================

// src/index.ts
const pluginSystem = new PluginSystem();

// 注册所有组件
pluginSystem.registerComponent('Button', Button);
pluginSystem.registerComponent('Modal', Modal);
pluginSystem.registerComponent('Form', Form);

// 导出
export { Button } from './components/Button';
export { Modal } from './components/Modal';
export { Form, Input, Select } from './components/Form';
export { dom } from './utils/dom';
export { EventEmitter } from './utils/event';

// 默认导出
export default {
  Button,
  Modal,
  Form,
  // ... 其他组件
  install(plugin, options) {
    return pluginSystem.use(plugin, options);
  }
};

// 如果是UMD构建，自动挂载到window
if (typeof window !== 'undefined' && window) {
  window.UILib = exports.default;
}

// ========================================
// 7. 样式文件
// ========================================

// src/styles/variables.css
const stylesVariables = `
:root {
  /* Colors */
  --ui-primary: #1890ff;
  --ui-success: #52c41a;
  --ui-warning: #faad14;
  --ui-error: #f5222d;
  --ui-text: #333333;
  --ui-text-secondary: #666666;
  --ui-border: #d9d9d9;
  --ui-background: #f5f5f5;
  
  /* Sizes */
  --ui-size-xs: 24px;
  --ui-size-sm: 28px;
  --ui-size-md: 32px;
  --ui-size-lg: 36px;
  --ui-size-xl: 40px;
  
  /* Spacing */
  --ui-spacing-xs: 4px;
  --ui-spacing-sm: 8px;
  --ui-spacing-md: 16px;
  --ui-spacing-lg: 24px;
  --ui-spacing-xl: 32px;
  
  /* Border Radius */
  --ui-radius-sm: 2px;
  --ui-radius-md: 4px;
  --ui-radius-lg: 8px;
  
  /* Shadows */
  --ui-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.08);
  --ui-shadow-md: 0 2px 8px rgba(0, 0, 0, 0.12);
  --ui-shadow-lg: 0 4px 16px rgba(0, 0, 0, 0.16);
  
  /* Transitions */
  --ui-transition-fast: 0.2s ease;
  --ui-transition-normal: 0.3s ease;
  --ui-transition-slow: 0.4s ease;
}

/* Dark Theme */
[data-theme="dark"] {
  --ui-text: #ffffff;
  --ui-text-secondary: #b3b3b3;
  --ui-background: #1a1a1a;
  --ui-border: #404040;
}
`;

// src/styles/components/button.css
const buttonStyles = `
.ui-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--ui-spacing-xs);
  padding: 0 var(--ui-spacing-md);
  height: var(--ui-size-md);
  font-size: 14px;
  font-weight: 400;
  line-height: 1;
  border: 1px solid transparent;
  border-radius: var(--ui-radius-md);
  cursor: pointer;
  transition: all var(--ui-transition-fast);
  outline: none;
  user-select: none;
}

/* Types */
.ui-button--primary {
  background-color: var(--ui-primary);
  color: white;
  border-color: var(--ui-primary);
}

.ui-button--primary:hover {
  background-color: #40a9ff;
  border-color: #40a9ff;
}

.ui-button--default {
  background-color: white;
  color: var(--ui-text);
  border-color: var(--ui-border);
}

.ui-button--default:hover {
  color: var(--ui-primary);
  border-color: var(--ui-primary);
}

/* Sizes */
.ui-button--small {
  height: var(--ui-size-sm);
  padding: 0 var(--ui-spacing-sm);
  font-size: 12px;
}

.ui-button--large {
  height: var(--ui-size-lg);
  padding: 0 var(--ui-spacing-lg);
  font-size: 16px;
}

/* States */
.ui-button--loading {
  opacity: 0.6;
  cursor: not-allowed;
}

.ui-button--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.ui-button--block {
  width: 100%;
}

/* Loading Icon */
.ui-button__loading-icon {
  animation: ui-spin 1s linear infinite;
}

@keyframes ui-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
`;

// src/styles/components/modal.css
const modalStyles = `
.ui-modal-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  visibility: hidden;
  transition: all var(--ui-transition-normal);
}

.ui-modal-wrapper--visible {
  opacity: 1;
  visibility: visible;
}

.ui-modal-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.45);
}

.ui-modal {
  position: relative;
  background-color: white;
  border-radius: var(--ui-radius-lg);
  box-shadow: var(--ui-shadow-lg);
  transform: scale(0.9);
  transition: transform var(--ui-transition-normal);
}

.ui-modal-wrapper--visible .ui-modal {
  transform: scale(1);
}

.ui-modal__content {
  position: relative;
}

.ui-modal__close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  background: none;
  border: none;
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
  color: var(--ui-text-secondary);
  transition: color var(--ui-transition-fast);
}

.ui-modal__close:hover {
  color: var(--ui-text);
}

.ui-modal__header {
  padding: 16px 24px;
  border-bottom: 1px solid var(--ui-border);
}

.ui-modal__title {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: var(--ui-text);
}

.ui-modal__body {
  padding: 24px;
  font-size: 14px;
}

.ui-modal__footer {
  padding: 16px 24px;
  border-top: 1px solid var(--ui-border);
  text-align: right;
  display: flex;
  gap: var(--ui-spacing-sm);
  justify-content: flex-end;
}

/* Centered */
.ui-modal--centered {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}
`;

// ========================================
// 8. 使用示例
// ========================================

// examples/demo.html
const demoHTML = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>UI Library Demo</title>
  <link rel="stylesheet" href="../dist/styles.css">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      padding: 40px;
      background-color: #f5f5f5;
    }
    
    .demo-section {
      background: white;
      padding: 24px;
      margin-bottom: 24px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    
    .demo-section h2 {
      margin-bottom: 16px;
    }
    
    .demo-row {
      margin-bottom: 16px;
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }
  </style>
</head>
<body>
  <h1>UI Library Demo</h1>
  
  <div class="demo-section">
    <h2>Buttons</h2>
    <div class="demo-row" id="button-demo"></div>
  </div>
  
  <div class="demo-section">
    <h2>Modals</h2>
    <div class="demo-row">
      <button id="modal-basic">Basic Modal</button>
      <button id="modal-confirm">Confirm Modal</button>
      <button id="modal-alert">Alert Modal</button>
    </div>
  </div>
  
  <div class="demo-section">
    <h2>Forms</h2>
    <div id="form-demo"></div>
  </div>
  
  <!-- UMD版本 -->
  <script src="../dist/index.umd.js"></script>
  <script>
    const { Button, Modal, Form } = UILib;
    
    // Button示例
    const buttonDemo = document.getElementById('button-demo');
    
    const types = ['primary', 'default', 'success', 'warning', 'danger'];
    const sizes = ['small', 'medium', 'large'];
    
    types.forEach(type => {
      const btn = new Button({
        text: type.charAt(0).toUpperCase() + type.slice(1),
        type: type,
        onClick: () => console.log(\`\${type} button clicked\`)
      });
      btn.init().mount(buttonDemo);
    });
    
    // Modal示例
    document.getElementById('modal-basic').addEventListener('click', () => {
      const modal = new Modal({
        title: 'Basic Modal',
        content: 'This is a basic modal dialog.',
        onOk: () => console.log('OK clicked'),
        onCancel: () => console.log('Cancel clicked')
      });
      modal.init().show();
    });
    
    document.getElementById('modal-confirm').addEventListener('click', async () => {
      const result = await Modal.confirm({
        title: 'Confirm',
        content: 'Are you sure you want to proceed?'
      });
      console.log('Confirm result:', result);
    });
    
    document.getElementById('modal-alert').addEventListener('click', async () => {
      await Modal.alert('This is an alert message!', 'Alert');
      console.log('Alert closed');
    });
    
    // 安装主题插件
    UILib.install(ThemePlugin, {
      themes: {
        light: {
          'ui-primary': '#1890ff',
          'ui-background': '#ffffff'
        },
        dark: {
          'ui-primary': '#177ddc',
          'ui-background': '#141414'
        }
      },
      default: 'light'
    });
  </script>
  
  <!-- ES Module版本 -->
  <script type="module">
    import { Button, Modal } from '../dist/index.esm.js';
    
    // ES Module使用示例
    console.log('ES Module loaded:', { Button, Modal });
  </script>
</body>
</html>
`;

// ========================================
// 9. TypeScript定义文件
// ========================================

// dist/index.d.ts
const typeDefinitions = `
// Type definitions for @myorg/ui-lib
// Project: https://github.com/myorg/ui-lib

export interface ComponentOptions {
  [key: string]: any;
}

export declare class Component {
  constructor(options?: ComponentOptions);
  element: HTMLElement | null;
  mounted: boolean;
  destroyed: boolean;
  
  init(): this;
  mount(container: string | HTMLElement): this;
  unmount(): this;
  destroy(): void;
  on(event: string, handler: Function): this;
  off(event: string, handler?: Function): this;
  emit(event: string, ...args: any[]): this;
}

export interface ButtonOptions extends ComponentOptions {
  text?: string;
  type?: 'primary' | 'default' | 'success' | 'warning' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  block?: boolean;
  htmlType?: 'button' | 'submit' | 'reset';
  onClick?: (event: MouseEvent) => void;
}

export declare class Button extends Component {
  constructor(options?: ButtonOptions);
  setLoading(loading: boolean): this;
  setDisabled(disabled: boolean): this;
  setText(text: string): this;
}

export interface ModalOptions extends ComponentOptions {
  title?: string;
  content?: string | HTMLElement;
  footer?: boolean | string | HTMLElement;
  closable?: boolean;
  maskClosable?: boolean;
  keyboard?: boolean;
  width?: number;
  centered?: boolean;
  destroyOnClose?: boolean;
  visible?: boolean;
  onOk?: () => void | boolean | Promise<void | boolean>;
  onCancel?: () => void;
}

export declare class Modal extends Component {
  constructor(options?: ModalOptions);
  visible: boolean;
  
  show(): this;
  hide(): this;
  setContent(content: string | HTMLElement): this;
  setFooter(footer: boolean | string | HTMLElement): this;
  
  static confirm(options: ModalOptions): Promise<boolean>;
  static alert(message: string, title?: string): Promise<void>;
  static closeAll(): void;
}

export declare const dom: {
  create(tag: string, props?: object, children?: Array<string | HTMLElement>): HTMLElement;
  query(selector: string, context?: Document | HTMLElement): HTMLElement | null;
  queryAll(selector: string, context?: Document | HTMLElement): HTMLElement[];
  addClass(element: HTMLElement, ...classNames: string[]): void;
  removeClass(element: HTMLElement, ...classNames: string[]): void;
  toggleClass(element: HTMLElement, className: string, force?: boolean): boolean;
  hasClass(element: HTMLElement, className: string): boolean;
  on(element: HTMLElement, event: string, handler: EventListener, options?: AddEventListenerOptions): void;
  off(element: HTMLElement, event: string, handler: EventListener, options?: EventListenerOptions): void;
  once(element: HTMLElement, event: string, handler: EventListener): void;
  delegate(element: HTMLElement, event: string, selector: string, handler: Function): void;
};

export declare class EventEmitter {
  on(event: string, handler: Function): this;
  off(event: string, handler?: Function): this;
  emit(event: string, ...args: any[]): this;
  once(event: string, handler: Function): this;
}

export interface Plugin {
  name: string;
  install(pluginSystem: any, options?: any): void;
}

declare const UILib: {
  Button: typeof Button;
  Modal: typeof Modal;
  Form: typeof Form;
  install(plugin: Plugin, options?: any): void;
};

export default UILib;
`;

// ========================================
// 10. 发布配置
// ========================================

// .npmignore
const npmIgnore = `
# Source files
src/
examples/
docs/

# Config files
rollup.config.js
tsconfig.json
jest.config.js
.eslintrc.js

# Test files
**/*.test.js
**/*.spec.js
__tests__/

# Development files
.vscode/
.idea/
*.log
.DS_Store

# Build tools
node_modules/
coverage/
`;

// README.md
const readme = `
# @myorg/ui-lib

A modern, modular UI component library with TypeScript support.

## Installation

\`\`\`bash
npm install @myorg/ui-lib
# or
yarn add @myorg/ui-lib
\`\`\`

## Usage

### ES Modules
\`\`\`javascript
import { Button, Modal } from '@myorg/ui-lib';
import '@myorg/ui-lib/styles';

const button = new Button({
  text: 'Click me',
  type: 'primary',
  onClick: () => console.log('Clicked!')
});

button.init().mount('#app');
\`\`\`

### CommonJS
\`\`\`javascript
const { Button, Modal } = require('@myorg/ui-lib');
require('@myorg/ui-lib/styles');
\`\`\`

### Browser (UMD)
\`\`\`html
<link rel="stylesheet" href="https://unpkg.com/@myorg/ui-lib/dist/styles.css">
<script src="https://unpkg.com/@myorg/ui-lib"></script>
<script>
  const { Button, Modal } = UILib;
</script>
\`\`\`

## Components

- Button
- Modal
- Form
- Table
- Tabs
- Tooltip
- Notification

## License

MIT
`;

console.log('UI Library implementation complete!');
```

## 关键实现细节

### 1. 模块组织策略

- 清晰的目录结构
- 统一的导出策略
- 支持Tree Shaking的具名导出
- 桶文件(barrel)模式简化导入

### 2. 多格式构建

- ES Module：现代打包工具和Tree Shaking
- CommonJS：Node.js兼容性
- UMD：浏览器直接使用
- 类型定义：TypeScript支持

### 3. 组件设计模式

- 继承基础Component类
- 事件驱动架构
- 生命周期管理
- 插件系统支持扩展

### 4. 性能优化

- 按需加载支持
- CSS变量实现主题切换
- 事件委托减少内存占用
- 懒加载和代码分割

### 5. 开发体验

- 完整的TypeScript类型
- 详细的文档和示例
- 插件系统便于扩展
- 多种使用方式支持

## 扩展建议

1. **添加更多组件** - Table、Select、DatePicker等
2. **测试覆盖** - 单元测试和E2E测试
3. **文档系统** - 使用Storybook或类似工具
4. **CI/CD** - 自动化构建和发布流程
5. **性能监控** - Bundle大小分析和运行时性能

这个解决方案展示了如何构建一个专业的、可维护的JavaScript组件库！