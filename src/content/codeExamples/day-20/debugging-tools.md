---
title: "调试工具与技巧"
category: "tools"
language: "javascript"
---

# 调试工具与技巧

## 高级Console调试

```javascript
// 1. Console API完整使用
class ConsoleDebugger {
  constructor(namespace) {
    this.namespace = namespace;
    this.timers = new Map();
    this.counters = new Map();
  }
  
  // 带命名空间的日志
  log(...args) {
    console.log(`[${this.namespace}]`, ...args);
  }
  
  // 条件日志
  logIf(condition, ...args) {
    if (condition) {
      this.log(...args);
    }
  }
  
  // 格式化日志
  logFormatted(message, data) {
    console.log(
      `%c[${this.namespace}] ${message}`,
      'color: blue; font-weight: bold',
      data
    );
  }
  
  // 性能计时
  time(label) {
    const key = `${this.namespace}:${label}`;
    this.timers.set(key, performance.now());
    console.time(key);
  }
  
  timeEnd(label) {
    const key = `${this.namespace}:${label}`;
    if (this.timers.has(key)) {
      const duration = performance.now() - this.timers.get(key);
      console.timeEnd(key);
      this.timers.delete(key);
      return duration;
    }
  }
  
  // 计数器
  count(label) {
    const key = `${this.namespace}:${label}`;
    const current = this.counters.get(key) || 0;
    this.counters.set(key, current + 1);
    console.count(key);
  }
  
  // 表格显示
  table(data, columns) {
    console.group(`[${this.namespace}] Table`);
    console.table(data, columns);
    console.groupEnd();
  }
  
  // 堆栈追踪
  trace(message) {
    console.group(`[${this.namespace}] Trace: ${message}`);
    console.trace();
    console.groupEnd();
  }
  
  // 内存快照
  memory(label) {
    if (performance.memory) {
      const memory = {
        used: (performance.memory.usedJSHeapSize / 1048576).toFixed(2) + ' MB',
        total: (performance.memory.totalJSHeapSize / 1048576).toFixed(2) + ' MB',
        limit: (performance.memory.jsHeapSizeLimit / 1048576).toFixed(2) + ' MB'
      };
      console.log(`[${this.namespace}] Memory (${label}):`, memory);
    }
  }
}

// 使用示例
const debug = new ConsoleDebugger('MyApp');

// 2. 自定义断言
function assert(condition, message, data = {}) {
  if (!condition) {
    console.error(
      `%cAssertion Failed: ${message}`,
      'color: red; font-size: 14px; font-weight: bold',
      data
    );
    
    // 在开发环境抛出错误
    if (process.env.NODE_ENV === 'development') {
      throw new Error(`Assertion Failed: ${message}`);
    }
  }
}

// 3. 性能监控
class PerformanceMonitor {
  constructor() {
    this.marks = new Map();
    this.measures = [];
  }
  
  mark(name) {
    performance.mark(name);
    this.marks.set(name, performance.now());
  }
  
  measure(name, startMark, endMark) {
    performance.measure(name, startMark, endMark);
    
    const measure = performance.getEntriesByName(name, 'measure')[0];
    this.measures.push({
      name,
      duration: measure.duration,
      start: measure.startTime,
      timestamp: new Date()
    });
    
    console.log(
      `%c⏱ ${name}: ${measure.duration.toFixed(2)}ms`,
      'color: green; font-weight: bold'
    );
  }
  
  getReport() {
    const report = {
      marks: Array.from(this.marks.entries()),
      measures: this.measures,
      summary: {
        totalMeasures: this.measures.length,
        averageDuration: this.measures.reduce((sum, m) => sum + m.duration, 0) / this.measures.length,
        slowest: this.measures.sort((a, b) => b.duration - a.duration)[0]
      }
    };
    
    console.group('Performance Report');
    console.table(report.measures);
    console.log('Summary:', report.summary);
    console.groupEnd();
    
    return report;
  }
  
  clear() {
    performance.clearMarks();
    performance.clearMeasures();
    this.marks.clear();
    this.measures = [];
  }
}
```

## 断点调试高级技巧

```javascript
// 1. 条件断点辅助函数
const DebugHelpers = {
  // 条件断点助手
  breakIf(condition, message = 'Conditional breakpoint') {
    if (condition) {
      console.log(`🔴 ${message}`);
      debugger;
    }
  },
  
  // 计数断点
  breakAfter(count, message = 'Count breakpoint') {
    if (!this._counters) this._counters = new Map();
    
    const current = (this._counters.get(message) || 0) + 1;
    this._counters.set(message, current);
    
    if (current >= count) {
      console.log(`🔴 ${message} (count: ${current})`);
      debugger;
    }
  },
  
  // 变化断点
  breakOnChange(obj, property, message = 'Change breakpoint') {
    let value = obj[property];
    
    Object.defineProperty(obj, property, {
      get() {
        return value;
      },
      set(newValue) {
        if (newValue !== value) {
          console.log(`🔴 ${message}: ${value} → ${newValue}`);
          debugger;
        }
        value = newValue;
      }
    });
  },
  
  // 异步断点
  async breakAsync(promise, message = 'Async breakpoint') {
    console.log(`⏳ ${message} - waiting...`);
    
    try {
      const result = await promise;
      console.log(`✅ ${message} - resolved:`, result);
      return result;
    } catch (error) {
      console.error(`❌ ${message} - rejected:`, error);
      debugger;
      throw error;
    }
  }
};

// 2. 智能日志系统
class SmartLogger {
  constructor(options = {}) {
    this.enabled = options.enabled !== false;
    this.level = options.level || 'info';
    this.filters = options.filters || [];
    this.formatters = new Map();
    
    this.levels = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3
    };
  }
  
  // 注册格式化器
  registerFormatter(type, formatter) {
    this.formatters.set(type, formatter);
  }
  
  // 智能格式化
  format(data) {
    if (data === null) return 'null';
    if (data === undefined) return 'undefined';
    
    const type = typeof data;
    if (this.formatters.has(type)) {
      return this.formatters.get(type)(data);
    }
    
    if (type === 'object') {
      if (data instanceof Date) {
        return data.toISOString();
      }
      if (data instanceof Error) {
        return `${data.name}: ${data.message}\n${data.stack}`;
      }
      if (Array.isArray(data)) {
        return `[${data.map(item => this.format(item)).join(', ')}]`;
      }
      
      // 循环引用检测
      try {
        return JSON.stringify(data, null, 2);
      } catch (e) {
        return '[Circular Reference]';
      }
    }
    
    return String(data);
  }
  
  // 日志输出
  log(level, message, ...data) {
    if (!this.enabled) return;
    if (this.levels[level] < this.levels[this.level]) return;
    
    // 应用过滤器
    if (this.filters.some(filter => !filter(level, message, data))) {
      return;
    }
    
    const timestamp = new Date().toISOString();
    const formattedData = data.map(d => this.format(d));
    
    const styles = {
      debug: 'color: gray',
      info: 'color: blue',
      warn: 'color: orange',
      error: 'color: red; font-weight: bold'
    };
    
    console[level](
      `%c[${timestamp}] ${message}`,
      styles[level],
      ...formattedData
    );
  }
  
  debug(message, ...data) { this.log('debug', message, ...data); }
  info(message, ...data) { this.log('info', message, ...data); }
  warn(message, ...data) { this.log('warn', message, ...data); }
  error(message, ...data) { this.log('error', message, ...data); }
}

// 3. 状态快照调试
class StateDebugger {
  constructor() {
    this.snapshots = [];
    this.maxSnapshots = 50;
  }
  
  // 创建快照
  snapshot(label, state) {
    const snapshot = {
      label,
      timestamp: Date.now(),
      state: this.deepClone(state),
      stackTrace: new Error().stack
    };
    
    this.snapshots.push(snapshot);
    
    // 限制快照数量
    if (this.snapshots.length > this.maxSnapshots) {
      this.snapshots.shift();
    }
    
    return snapshot;
  }
  
  // 深度克隆
  deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj);
    if (obj instanceof Array) return obj.map(item => this.deepClone(item));
    if (obj instanceof RegExp) return new RegExp(obj);
    
    const cloned = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = this.deepClone(obj[key]);
      }
    }
    return cloned;
  }
  
  // 比较快照
  diff(snapshot1, snapshot2) {
    const differences = [];
    
    const compare = (obj1, obj2, path = '') => {
      const keys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]);
      
      for (const key of keys) {
        const currentPath = path ? `${path}.${key}` : key;
        
        if (!(key in obj1)) {
          differences.push({
            path: currentPath,
            type: 'added',
            value: obj2[key]
          });
        } else if (!(key in obj2)) {
          differences.push({
            path: currentPath,
            type: 'removed',
            value: obj1[key]
          });
        } else if (obj1[key] !== obj2[key]) {
          if (typeof obj1[key] === 'object' && typeof obj2[key] === 'object') {
            compare(obj1[key], obj2[key], currentPath);
          } else {
            differences.push({
              path: currentPath,
              type: 'changed',
              oldValue: obj1[key],
              newValue: obj2[key]
            });
          }
        }
      }
    };
    
    compare(snapshot1.state, snapshot2.state);
    return differences;
  }
  
  // 时间旅行调试
  getSnapshotAt(timestamp) {
    return this.snapshots.find(s => s.timestamp >= timestamp) || null;
  }
  
  // 查找变化
  findChanges(property) {
    const changes = [];
    
    for (let i = 1; i < this.snapshots.length; i++) {
      const prev = this.snapshots[i - 1];
      const curr = this.snapshots[i];
      
      const prevValue = this.getPropertyValue(prev.state, property);
      const currValue = this.getPropertyValue(curr.state, property);
      
      if (prevValue !== currValue) {
        changes.push({
          from: prev,
          to: curr,
          oldValue: prevValue,
          newValue: currValue
        });
      }
    }
    
    return changes;
  }
  
  getPropertyValue(obj, path) {
    return path.split('.').reduce((acc, key) => acc?.[key], obj);
  }
  
  // 可视化快照
  visualize() {
    console.group('State Snapshots');
    
    this.snapshots.forEach((snapshot, index) => {
      console.group(`${index}: ${snapshot.label} (${new Date(snapshot.timestamp).toLocaleTimeString()})`);
      console.log('State:', snapshot.state);
      
      if (index > 0) {
        const diff = this.diff(this.snapshots[index - 1], snapshot);
        if (diff.length > 0) {
          console.log('Changes:', diff);
        }
      }
      
      console.groupEnd();
    });
    
    console.groupEnd();
  }
}
```

## 网络调试工具

```javascript
// 1. 网络请求监控
class NetworkMonitor {
  constructor() {
    this.requests = [];
    this.interceptors = [];
    this.setupInterceptors();
  }
  
  setupInterceptors() {
    // 拦截fetch
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const request = this.createRequestObject(...args);
      this.onRequest(request);
      
      try {
        const response = await originalFetch(...args);
        await this.onResponse(request, response);
        return response;
      } catch (error) {
        this.onError(request, error);
        throw error;
      }
    };
    
    // 拦截XMLHttpRequest
    const XHR = XMLHttpRequest.prototype;
    const originalOpen = XHR.open;
    const originalSend = XHR.send;
    
    XHR.open = function(method, url, ...args) {
      this._monitor = {
        method,
        url,
        startTime: Date.now()
      };
      return originalOpen.apply(this, [method, url, ...args]);
    };
    
    XHR.send = function(body) {
      const monitor = this._monitor;
      
      this.addEventListener('load', () => {
        monitor.endTime = Date.now();
        monitor.status = this.status;
        monitor.response = this.responseText;
        console.log('XHR Complete:', monitor);
      });
      
      return originalSend.apply(this, [body]);
    };
  }
  
  createRequestObject(input, init = {}) {
    const url = typeof input === 'string' ? input : input.url;
    const method = init.method || 'GET';
    
    return {
      id: Date.now() + Math.random(),
      url,
      method,
      headers: init.headers || {},
      body: init.body,
      timestamp: new Date(),
      startTime: performance.now()
    };
  }
  
  onRequest(request) {
    this.requests.push(request);
    
    console.group(`🌐 ${request.method} ${request.url}`);
    console.log('Headers:', request.headers);
    if (request.body) {
      console.log('Body:', request.body);
    }
    console.groupEnd();
  }
  
  async onResponse(request, response) {
    request.endTime = performance.now();
    request.duration = request.endTime - request.startTime;
    request.status = response.status;
    request.ok = response.ok;
    
    // 克隆响应以便读取
    const clone = response.clone();
    try {
      request.responseData = await clone.json();
    } catch {
      try {
        request.responseData = await clone.text();
      } catch {
        request.responseData = null;
      }
    }
    
    const statusEmoji = response.ok ? '✅' : '❌';
    console.group(`${statusEmoji} ${request.method} ${request.url} (${request.duration.toFixed(2)}ms)`);
    console.log('Status:', response.status);
    console.log('Response:', request.responseData);
    console.groupEnd();
  }
  
  onError(request, error) {
    request.error = error;
    request.endTime = performance.now();
    request.duration = request.endTime - request.startTime;
    
    console.error(`❌ ${request.method} ${request.url} failed:`, error);
  }
  
  // 获取请求统计
  getStats() {
    const stats = {
      total: this.requests.length,
      successful: this.requests.filter(r => r.ok).length,
      failed: this.requests.filter(r => r.error || !r.ok).length,
      averageDuration: this.requests.reduce((sum, r) => sum + (r.duration || 0), 0) / this.requests.length,
      byStatus: {},
      byMethod: {},
      slowest: this.requests.sort((a, b) => (b.duration || 0) - (a.duration || 0)).slice(0, 5)
    };
    
    this.requests.forEach(request => {
      // 按状态统计
      const status = request.status || 'error';
      stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;
      
      // 按方法统计
      stats.byMethod[request.method] = (stats.byMethod[request.method] || 0) + 1;
    });
    
    return stats;
  }
  
  // 导出HAR格式
  exportHAR() {
    return {
      log: {
        version: '1.2',
        creator: {
          name: 'NetworkMonitor',
          version: '1.0'
        },
        entries: this.requests.map(request => ({
          startedDateTime: request.timestamp.toISOString(),
          time: request.duration || 0,
          request: {
            method: request.method,
            url: request.url,
            headers: Object.entries(request.headers || {}).map(([name, value]) => ({ name, value })),
            postData: request.body ? {
              text: typeof request.body === 'string' ? request.body : JSON.stringify(request.body)
            } : undefined
          },
          response: {
            status: request.status || 0,
            statusText: '',
            headers: [],
            content: {
              text: JSON.stringify(request.responseData)
            }
          }
        }))
      }
    };
  }
}

// 2. Mock服务器
class MockServer {
  constructor() {
    this.routes = new Map();
    this.middlewares = [];
    this.delay = 0;
  }
  
  // 添加路由
  route(method, pattern, handler) {
    const key = `${method.toUpperCase()} ${pattern}`;
    this.routes.set(key, {
      pattern: new RegExp(pattern.replace(/:\w+/g, '([^/]+)')),
      handler,
      paramNames: (pattern.match(/:\w+/g) || []).map(p => p.slice(1))
    });
  }
  
  // 添加中间件
  use(middleware) {
    this.middlewares.push(middleware);
  }
  
  // 处理请求
  async handle(method, url, options = {}) {
    const urlObj = new URL(url, window.location.origin);
    const pathname = urlObj.pathname;
    
    // 查找匹配的路由
    for (const [key, route] of this.routes) {
      if (key.startsWith(method.toUpperCase())) {
        const match = pathname.match(route.pattern);
        if (match) {
          // 提取参数
          const params = {};
          route.paramNames.forEach((name, index) => {
            params[name] = match[index + 1];
          });
          
          // 创建请求对象
          const request = {
            method,
            url,
            pathname,
            params,
            query: Object.fromEntries(urlObj.searchParams),
            headers: options.headers || {},
            body: options.body
          };
          
          // 创建响应对象
          const response = {
            status: 200,
            headers: {},
            body: null
          };
          
          // 应用中间件
          for (const middleware of this.middlewares) {
            await middleware(request, response);
          }
          
          // 模拟延迟
          if (this.delay > 0) {
            await new Promise(resolve => setTimeout(resolve, this.delay));
          }
          
          // 调用处理器
          const result = await route.handler(request, response);
          
          return {
            ok: response.status >= 200 && response.status < 300,
            status: response.status,
            json: async () => result,
            text: async () => JSON.stringify(result)
          };
        }
      }
    }
    
    // 未找到路由
    return {
      ok: false,
      status: 404,
      json: async () => ({ error: 'Not Found' }),
      text: async () => 'Not Found'
    };
  }
  
  // 设置延迟
  setDelay(ms) {
    this.delay = ms;
  }
  
  // 快捷方法
  get(pattern, handler) { this.route('GET', pattern, handler); }
  post(pattern, handler) { this.route('POST', pattern, handler); }
  put(pattern, handler) { this.route('PUT', pattern, handler); }
  delete(pattern, handler) { this.route('DELETE', pattern, handler); }
}

// 使用示例
const mockServer = new MockServer();

// 添加日志中间件
mockServer.use((req, res) => {
  console.log(`Mock: ${req.method} ${req.pathname}`);
});

// 添加路由
mockServer.get('/api/users/:id', (req) => {
  return {
    id: req.params.id,
    name: `User ${req.params.id}`,
    email: `user${req.params.id}@example.com`
  };
});

// 覆盖fetch使用mock
window.fetch = async (url, options = {}) => {
  return mockServer.handle(options.method || 'GET', url, options);
};
```