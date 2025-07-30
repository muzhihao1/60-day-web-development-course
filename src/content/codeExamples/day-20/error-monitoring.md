---
day: 20
title: "错误监控与报告系统"
description: "学习和掌握错误监控与报告系统的实际应用"
category: "system"
language: "javascript"
---

# 错误监控与报告系统

## 完整错误监控系统

```javascript
// 1. 核心错误监控器
class ErrorMonitor {
  constructor(config = {}) {
    this.config = {
      maxErrors: 100,
      maxErrorRate: 10, // 每分钟最大错误数
      sampleRate: 1, // 采样率 0-1
      endpoint: '/api/errors',
      batchSize: 10,
      flushInterval: 30000, // 30秒
      ...config
    };
    
    this.errors = [];
    this.errorCounts = new Map();
    this.metadata = {};
    this.filters = [];
    this.transformers = [];
    this.initialized = false;
  }
  
  // 初始化监控
  init() {
    if (this.initialized) return;
    
    // 捕获全局错误
    window.addEventListener('error', (event) => {
      this.captureError({
        type: 'javascript',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
      });
    });
    
    // 捕获未处理的Promise
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError({
        type: 'unhandled-promise',
        reason: event.reason,
        promise: event.promise
      });
    });
    
    // 捕获资源加载错误
    window.addEventListener('error', (event) => {
      if (event.target !== window) {
        this.captureError({
          type: 'resource',
          tagName: event.target.tagName,
          src: event.target.src || event.target.href,
          message: 'Resource failed to load'
        });
      }
    }, true);
    
    // 定期发送错误
    this.startBatchSending();
    
    this.initialized = true;
  }
  
  // 捕获错误
  captureError(errorInfo) {
    // 采样率控制
    if (Math.random() > this.config.sampleRate) {
      return;
    }
    
    // 速率限制
    if (this.isRateLimited()) {
      return;
    }
    
    // 创建错误对象
    const error = this.createErrorObject(errorInfo);
    
    // 应用过滤器
    if (!this.shouldCapture(error)) {
      return;
    }
    
    // 应用转换器
    const transformedError = this.transform(error);
    
    // 添加到队列
    this.addError(transformedError);
  }
  
  // 创建错误对象
  createErrorObject(errorInfo) {
    const error = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      type: errorInfo.type || 'unknown',
      message: this.extractMessage(errorInfo),
      stack: this.extractStack(errorInfo),
      metadata: {
        ...this.metadata,
        ...this.collectEnvironment()
      },
      fingerprint: this.generateFingerprint(errorInfo),
      ...errorInfo
    };
    
    return error;
  }
  
  // 提取错误消息
  extractMessage(errorInfo) {
    if (errorInfo.message) return errorInfo.message;
    if (errorInfo.error && errorInfo.error.message) return errorInfo.error.message;
    if (errorInfo.reason) return String(errorInfo.reason);
    return 'Unknown error';
  }
  
  // 提取堆栈信息
  extractStack(errorInfo) {
    if (errorInfo.error && errorInfo.error.stack) {
      return this.parseStackTrace(errorInfo.error.stack);
    }
    if (errorInfo.stack) {
      return this.parseStackTrace(errorInfo.stack);
    }
    return null;
  }
  
  // 解析堆栈追踪
  parseStackTrace(stack) {
    const lines = stack.split('\n');
    const frames = [];
    
    for (const line of lines) {
      const match = line.match(/at\s+(.+?)\s+\((.+?):(\d+):(\d+)\)/);
      if (match) {
        frames.push({
          function: match[1],
          file: match[2],
          line: parseInt(match[3], 10),
          column: parseInt(match[4], 10)
        });
      }
    }
    
    return {
      raw: stack,
      frames
    };
  }
  
  // 生成错误指纹
  generateFingerprint(errorInfo) {
    const key = [
      errorInfo.type,
      errorInfo.message,
      errorInfo.filename,
      errorInfo.lineno
    ].filter(Boolean).join(':');
    
    return this.hash(key);
  }
  
  // 简单哈希函数
  hash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }
  
  // 收集环境信息
  collectEnvironment() {
    return {
      url: window.location.href,
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      screen: {
        width: screen.width,
        height: screen.height
      },
      memory: performance.memory ? {
        used: Math.round(performance.memory.usedJSHeapSize / 1048576),
        total: Math.round(performance.memory.totalJSHeapSize / 1048576),
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576)
      } : null,
      connection: navigator.connection ? {
        effectiveType: navigator.connection.effectiveType,
        downlink: navigator.connection.downlink,
        rtt: navigator.connection.rtt
      } : null
    };
  }
  
  // 速率限制检查
  isRateLimited() {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    
    // 清理旧记录
    for (const [timestamp] of this.errorCounts) {
      if (timestamp < oneMinuteAgo) {
        this.errorCounts.delete(timestamp);
      }
    }
    
    // 检查当前速率
    if (this.errorCounts.size >= this.config.maxErrorRate) {
      console.warn('Error rate limit exceeded');
      return true;
    }
    
    this.errorCounts.set(now, true);
    return false;
  }
  
  // 应用过滤器
  shouldCapture(error) {
    return this.filters.every(filter => filter(error));
  }
  
  // 应用转换器
  transform(error) {
    return this.transformers.reduce(
      (err, transformer) => transformer(err),
      error
    );
  }
  
  // 添加错误到队列
  addError(error) {
    this.errors.push(error);
    
    // 限制队列大小
    if (this.errors.length > this.config.maxErrors) {
      this.errors.shift();
    }
    
    // 检查是否需要立即发送
    if (this.errors.length >= this.config.batchSize) {
      this.flush();
    }
  }
  
  // 批量发送
  startBatchSending() {
    setInterval(() => {
      if (this.errors.length > 0) {
        this.flush();
      }
    }, this.config.flushInterval);
  }
  
  // 发送错误
  async flush() {
    if (this.errors.length === 0) return;
    
    const batch = this.errors.splice(0, this.config.batchSize);
    
    try {
      await this.send(batch);
    } catch (error) {
      console.error('Failed to send errors:', error);
      // 将错误放回队列前面
      this.errors.unshift(...batch);
    }
  }
  
  // 发送到服务器
  async send(errors) {
    const response = await fetch(this.config.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        errors,
        session: this.getSessionInfo()
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
  }
  
  // 获取会话信息
  getSessionInfo() {
    return {
      sessionId: this.getSessionId(),
      startTime: this.sessionStartTime || new Date().toISOString(),
      duration: Date.now() - (this.sessionStart || Date.now())
    };
  }
  
  // 获取或创建会话ID
  getSessionId() {
    if (!this.sessionId) {
      this.sessionId = this.generateId();
      this.sessionStart = Date.now();
      this.sessionStartTime = new Date().toISOString();
    }
    return this.sessionId;
  }
  
  // 生成唯一ID
  generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  // 添加过滤器
  addFilter(filter) {
    this.filters.push(filter);
  }
  
  // 添加转换器
  addTransformer(transformer) {
    this.transformers.push(transformer);
  }
  
  // 设置元数据
  setMetadata(metadata) {
    this.metadata = { ...this.metadata, ...metadata };
  }
  
  // 手动记录错误
  logError(error, context = {}) {
    this.captureError({
      type: 'manual',
      error,
      context,
      message: error.message || String(error)
    });
  }
}

// 2. 错误分析器
class ErrorAnalyzer {
  constructor(monitor) {
    this.monitor = monitor;
    this.patterns = new Map();
  }
  
  // 分析错误模式
  analyze() {
    const errors = this.monitor.errors;
    const analysis = {
      total: errors.length,
      byType: this.groupBy(errors, 'type'),
      byFingerprint: this.groupBy(errors, 'fingerprint'),
      timeline: this.createTimeline(errors),
      topErrors: this.getTopErrors(errors),
      errorRate: this.calculateErrorRate(errors),
      patterns: this.detectPatterns(errors)
    };
    
    return analysis;
  }
  
  // 分组统计
  groupBy(errors, key) {
    const groups = {};
    
    errors.forEach(error => {
      const value = error[key] || 'unknown';
      groups[value] = (groups[value] || 0) + 1;
    });
    
    return Object.entries(groups)
      .sort(([, a], [, b]) => b - a)
      .map(([key, count]) => ({ key, count }));
  }
  
  // 创建时间线
  createTimeline(errors) {
    const timeline = new Map();
    const interval = 60000; // 1分钟
    
    errors.forEach(error => {
      const time = new Date(error.timestamp).getTime();
      const bucket = Math.floor(time / interval) * interval;
      timeline.set(bucket, (timeline.get(bucket) || 0) + 1);
    });
    
    return Array.from(timeline.entries())
      .sort(([a], [b]) => a - b)
      .map(([timestamp, count]) => ({
        timestamp: new Date(timestamp).toISOString(),
        count
      }));
  }
  
  // 获取最常见错误
  getTopErrors(errors, limit = 10) {
    const errorCounts = new Map();
    
    errors.forEach(error => {
      const key = error.fingerprint;
      if (!errorCounts.has(key)) {
        errorCounts.set(key, {
          error: error,
          count: 0,
          firstSeen: error.timestamp,
          lastSeen: error.timestamp
        });
      }
      
      const entry = errorCounts.get(key);
      entry.count++;
      entry.lastSeen = error.timestamp;
    });
    
    return Array.from(errorCounts.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }
  
  // 计算错误率
  calculateErrorRate(errors) {
    if (errors.length === 0) return 0;
    
    const now = Date.now();
    const timeWindow = 300000; // 5分钟
    const recentErrors = errors.filter(error => {
      const errorTime = new Date(error.timestamp).getTime();
      return now - errorTime < timeWindow;
    });
    
    return (recentErrors.length / (timeWindow / 60000)).toFixed(2);
  }
  
  // 检测模式
  detectPatterns(errors) {
    const patterns = [];
    
    // 检测突发错误
    const burst = this.detectBurst(errors);
    if (burst) patterns.push(burst);
    
    // 检测周期性错误
    const periodic = this.detectPeriodic(errors);
    if (periodic) patterns.push(periodic);
    
    // 检测相关错误
    const correlated = this.detectCorrelated(errors);
    if (correlated.length > 0) patterns.push(...correlated);
    
    return patterns;
  }
  
  // 检测突发错误
  detectBurst(errors) {
    const threshold = 5; // 5个错误
    const timeWindow = 60000; // 1分钟
    
    for (let i = 0; i < errors.length - threshold; i++) {
      const startTime = new Date(errors[i].timestamp).getTime();
      const endTime = new Date(errors[i + threshold - 1].timestamp).getTime();
      
      if (endTime - startTime < timeWindow) {
        return {
          type: 'burst',
          message: `${threshold} errors in ${(endTime - startTime) / 1000}s`,
          errors: errors.slice(i, i + threshold)
        };
      }
    }
    
    return null;
  }
  
  // 检测周期性错误
  detectPeriodic(errors) {
    // 简化版本：检测固定时间间隔的错误
    const intervals = [];
    
    for (let i = 1; i < errors.length; i++) {
      const prev = new Date(errors[i - 1].timestamp).getTime();
      const curr = new Date(errors[i].timestamp).getTime();
      intervals.push(curr - prev);
    }
    
    // 计算平均间隔和标准差
    const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance = intervals.reduce((sum, interval) => {
      return sum + Math.pow(interval - avg, 2);
    }, 0) / intervals.length;
    const stdDev = Math.sqrt(variance);
    
    // 如果标准差很小，说明可能是周期性的
    if (stdDev < avg * 0.1) {
      return {
        type: 'periodic',
        message: `Errors occur every ~${Math.round(avg / 1000)}s`,
        interval: avg
      };
    }
    
    return null;
  }
  
  // 检测相关错误
  detectCorrelated(errors) {
    const correlated = [];
    const timeWindow = 5000; // 5秒
    
    // 按时间分组
    const groups = [];
    let currentGroup = [errors[0]];
    
    for (let i = 1; i < errors.length; i++) {
      const prevTime = new Date(errors[i - 1].timestamp).getTime();
      const currTime = new Date(errors[i].timestamp).getTime();
      
      if (currTime - prevTime < timeWindow) {
        currentGroup.push(errors[i]);
      } else {
        if (currentGroup.length > 1) {
          groups.push(currentGroup);
        }
        currentGroup = [errors[i]];
      }
    }
    
    if (currentGroup.length > 1) {
      groups.push(currentGroup);
    }
    
    // 分析每个组
    groups.forEach(group => {
      if (group.length >= 3) {
        correlated.push({
          type: 'correlated',
          message: `${group.length} errors occurred together`,
          errors: group
        });
      }
    });
    
    return correlated;
  }
}
```

## 用户行为追踪

```javascript
// 用户行为记录器
class UserActionTracker {
  constructor(options = {}) {
    this.actions = [];
    this.maxActions = options.maxActions || 50;
    this.captureClicks = options.captureClicks !== false;
    this.captureKeyboard = options.captureKeyboard !== false;
    this.captureScroll = options.captureScroll !== false;
    this.captureNavigation = options.captureNavigation !== false;
    
    this.init();
  }
  
  init() {
    if (this.captureClicks) {
      document.addEventListener('click', this.handleClick.bind(this), true);
    }
    
    if (this.captureKeyboard) {
      document.addEventListener('keydown', this.handleKeyboard.bind(this), true);
    }
    
    if (this.captureScroll) {
      let scrollTimer;
      window.addEventListener('scroll', () => {
        clearTimeout(scrollTimer);
        scrollTimer = setTimeout(() => {
          this.handleScroll();
        }, 500);
      });
    }
    
    if (this.captureNavigation) {
      window.addEventListener('popstate', this.handleNavigation.bind(this));
      
      // 拦截pushState和replaceState
      const originalPushState = history.pushState;
      const originalReplaceState = history.replaceState;
      
      history.pushState = (...args) => {
        this.handleNavigation({ type: 'pushstate', args });
        return originalPushState.apply(history, args);
      };
      
      history.replaceState = (...args) => {
        this.handleNavigation({ type: 'replacestate', args });
        return originalReplaceState.apply(history, args);
      };
    }
  }
  
  handleClick(event) {
    const target = event.target;
    const action = {
      type: 'click',
      timestamp: new Date().toISOString(),
      target: {
        tagName: target.tagName,
        id: target.id,
        className: target.className,
        text: target.textContent?.substring(0, 50),
        href: target.href
      },
      position: {
        x: event.clientX,
        y: event.clientY
      }
    };
    
    this.addAction(action);
  }
  
  handleKeyboard(event) {
    // 不记录密码输入
    if (event.target.type === 'password') return;
    
    const action = {
      type: 'keyboard',
      timestamp: new Date().toISOString(),
      key: event.key,
      code: event.code,
      target: {
        tagName: event.target.tagName,
        id: event.target.id,
        type: event.target.type
      }
    };
    
    this.addAction(action);
  }
  
  handleScroll() {
    const action = {
      type: 'scroll',
      timestamp: new Date().toISOString(),
      position: {
        x: window.scrollX,
        y: window.scrollY
      },
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    };
    
    this.addAction(action);
  }
  
  handleNavigation(event) {
    const action = {
      type: 'navigation',
      timestamp: new Date().toISOString(),
      url: window.location.href,
      event: event.type || 'unknown'
    };
    
    this.addAction(action);
  }
  
  addAction(action) {
    this.actions.push(action);
    
    // 限制数组大小
    if (this.actions.length > this.maxActions) {
      this.actions.shift();
    }
  }
  
  getActions() {
    return [...this.actions];
  }
  
  clear() {
    this.actions = [];
  }
}

// 性能监控
class PerformanceMonitor {
  constructor() {
    this.metrics = {};
    this.observers = [];
  }
  
  init() {
    // 监控页面加载性能
    this.collectLoadMetrics();
    
    // 监控资源加载
    this.observeResources();
    
    // 监控长任务
    this.observeLongTasks();
    
    // 监控FCP和LCP
    this.observePaintMetrics();
    
    // 监控内存使用
    this.monitorMemory();
  }
  
  collectLoadMetrics() {
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0];
      
      if (navigation) {
        this.metrics.navigation = {
          // DNS查询
          dns: navigation.domainLookupEnd - navigation.domainLookupStart,
          // TCP连接
          tcp: navigation.connectEnd - navigation.connectStart,
          // 请求响应
          request: navigation.responseEnd - navigation.requestStart,
          // DOM解析
          domParsing: navigation.domInteractive - navigation.domLoading,
          // DOM内容加载
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          // 完整加载
          load: navigation.loadEventEnd - navigation.loadEventStart,
          // 总时间
          total: navigation.loadEventEnd - navigation.fetchStart
        };
      }
      
      // 自定义指标
      this.metrics.custom = {
        firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime,
        firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime
      };
    });
  }
  
  observeResources() {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      
      entries.forEach(entry => {
        if (entry.entryType === 'resource') {
          if (!this.metrics.resources) {
            this.metrics.resources = [];
          }
          
          this.metrics.resources.push({
            name: entry.name,
            type: entry.initiatorType,
            duration: entry.duration,
            size: entry.transferSize,
            protocol: entry.nextHopProtocol
          });
        }
      });
    });
    
    observer.observe({ entryTypes: ['resource'] });
    this.observers.push(observer);
  }
  
  observeLongTasks() {
    if ('PerformanceObserver' in window && 'TaskAttributionTiming' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        
        entries.forEach(entry => {
          if (!this.metrics.longTasks) {
            this.metrics.longTasks = [];
          }
          
          this.metrics.longTasks.push({
            duration: entry.duration,
            startTime: entry.startTime,
            attribution: entry.attribution
          });
          
          console.warn('Long task detected:', entry.duration + 'ms');
        });
      });
      
      observer.observe({ entryTypes: ['longtask'] });
      this.observers.push(observer);
    }
  }
  
  observePaintMetrics() {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      
      entries.forEach(entry => {
        if (entry.name === 'largest-contentful-paint') {
          this.metrics.lcp = entry.startTime;
        }
      });
    });
    
    observer.observe({ entryTypes: ['largest-contentful-paint'] });
    this.observers.push(observer);
  }
  
  monitorMemory() {
    if (performance.memory) {
      setInterval(() => {
        this.metrics.memory = {
          used: Math.round(performance.memory.usedJSHeapSize / 1048576),
          total: Math.round(performance.memory.totalJSHeapSize / 1048576),
          limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576)
        };
      }, 10000);
    }
  }
  
  getMetrics() {
    return { ...this.metrics };
  }
  
  destroy() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// 集成错误和性能监控
class MonitoringSystem {
  constructor(config) {
    this.errorMonitor = new ErrorMonitor(config.error);
    this.actionTracker = new UserActionTracker(config.actions);
    this.performanceMonitor = new PerformanceMonitor();
    this.analyzer = new ErrorAnalyzer(this.errorMonitor);
  }
  
  init() {
    this.errorMonitor.init();
    this.performanceMonitor.init();
    
    // 错误发生时附加用户行为
    this.errorMonitor.addTransformer((error) => {
      error.userActions = this.actionTracker.getActions();
      error.performance = this.performanceMonitor.getMetrics();
      return error;
    });
    
    // 设置用户信息
    this.setUser({
      id: 'user123',
      email: 'user@example.com'
    });
  }
  
  setUser(user) {
    this.errorMonitor.setMetadata({ user });
  }
  
  logError(error, context) {
    this.errorMonitor.logError(error, context);
  }
  
  getAnalysis() {
    return {
      errors: this.analyzer.analyze(),
      performance: this.performanceMonitor.getMetrics(),
      actions: this.actionTracker.getActions()
    };
  }
}

// 使用示例
const monitoring = new MonitoringSystem({
  error: {
    endpoint: '/api/errors',
    sampleRate: 1
  },
  actions: {
    maxActions: 100
  }
});

monitoring.init();
```