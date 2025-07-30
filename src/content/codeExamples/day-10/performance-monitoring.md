---
day: 10
title: "性能监控与分析"
description: "使用Performance API和其他工具监控Web应用性能"
category: "performance"
language: "javascript"
---

## Performance API基础

### Navigation Timing

```javascript
// 获取页面加载性能数据
window.addEventListener('load', () => {
  const perfData = performance.getEntriesByType('navigation')[0];
  
  // 计算关键性能指标
  const metrics = {
    // DNS查询时间
    dns: perfData.domainLookupEnd - perfData.domainLookupStart,
    
    // TCP连接时间
    tcp: perfData.connectEnd - perfData.connectStart,
    
    // SSL/TLS握手时间
    ssl: perfData.requestStart - perfData.secureConnectionStart,
    
    // 服务器响应时间
    ttfb: perfData.responseStart - perfData.requestStart,
    
    // 内容下载时间
    download: perfData.responseEnd - perfData.responseStart,
    
    // DOM解析时间
    domParsing: perfData.domInteractive - perfData.domLoading,
    
    // DOM内容加载时间
    domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
    
    // 完整页面加载时间
    pageLoad: perfData.loadEventEnd - perfData.fetchStart
  };
  
  console.table(metrics);
});
```

### Resource Timing

```javascript
class ResourceMonitor {
  constructor() {
    this.resources = new Map();
    this.init();
  }
  
  init() {
    // 获取已加载的资源
    this.collectResources();
    
    // 监听新资源
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.processResource(entry);
        }
      });
      
      observer.observe({ entryTypes: ['resource'] });
    }
  }
  
  collectResources() {
    const resources = performance.getEntriesByType('resource');
    resources.forEach(resource => this.processResource(resource));
  }
  
  processResource(resource) {
    const type = this.getResourceType(resource.name);
    
    if (!this.resources.has(type)) {
      this.resources.set(type, []);
    }
    
    this.resources.get(type).push({
      name: resource.name,
      duration: resource.duration,
      size: resource.transferSize,
      protocol: resource.nextHopProtocol,
      cached: resource.transferSize === 0 && resource.decodedBodySize > 0,
      timing: {
        dns: resource.domainLookupEnd - resource.domainLookupStart,
        tcp: resource.connectEnd - resource.connectStart,
        ssl: resource.secureConnectionStart > 0 ? 
             resource.requestStart - resource.secureConnectionStart : 0,
        request: resource.responseStart - resource.requestStart,
        response: resource.responseEnd - resource.responseStart
      }
    });
  }
  
  getResourceType(url) {
    const extension = url.split('.').pop().split('?')[0].toLowerCase();
    const typeMap = {
      'js': 'script',
      'css': 'style',
      'jpg': 'image',
      'jpeg': 'image',
      'png': 'image',
      'gif': 'image',
      'webp': 'image',
      'avif': 'image',
      'woff': 'font',
      'woff2': 'font',
      'ttf': 'font',
      'otf': 'font',
      'json': 'data',
      'xml': 'data'
    };
    
    return typeMap[extension] || 'other';
  }
  
  getReport() {
    const report = {};
    
    this.resources.forEach((resources, type) => {
      const totalSize = resources.reduce((sum, r) => sum + (r.size || 0), 0);
      const totalDuration = resources.reduce((sum, r) => sum + r.duration, 0);
      const cached = resources.filter(r => r.cached).length;
      
      report[type] = {
        count: resources.length,
        totalSize: `${(totalSize / 1024).toFixed(2)} KB`,
        avgDuration: `${(totalDuration / resources.length).toFixed(2)} ms`,
        cached: `${cached}/${resources.length}`,
        resources: resources.sort((a, b) => b.duration - a.duration).slice(0, 5)
      };
    });
    
    return report;
  }
}

// 使用
const resourceMonitor = new ResourceMonitor();
setTimeout(() => {
  console.log('资源加载报告:', resourceMonitor.getReport());
}, 5000);
```

## Core Web Vitals监控

### 完整的Web Vitals监控器

```javascript
class WebVitalsMonitor {
  constructor() {
    this.metrics = {
      FCP: null,
      LCP: null,
      FID: null,
      CLS: null,
      TTFB: null,
      INP: null
    };
    
    this.clsValue = 0;
    this.clsEntries = [];
    this.sessionValue = 0;
    this.sessionEntries = [];
    
    this.init();
  }
  
  init() {
    // First Contentful Paint
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          this.metrics.FCP = entry.startTime;
          this.report('FCP', entry.startTime);
        }
      }
    }).observe({ entryTypes: ['paint'] });
    
    // Largest Contentful Paint
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.metrics.LCP = lastEntry.startTime;
      this.report('LCP', lastEntry.startTime);
    }).observe({ entryTypes: ['largest-contentful-paint'] });
    
    // First Input Delay
    new PerformanceObserver((list) => {
      const firstInput = list.getEntries()[0];
      this.metrics.FID = firstInput.processingStart - firstInput.startTime;
      this.report('FID', this.metrics.FID);
    }).observe({ entryTypes: ['first-input'] });
    
    // Cumulative Layout Shift
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          this.clsValue += entry.value;
          this.clsEntries.push(entry);
        }
      }
      this.metrics.CLS = this.clsValue;
      this.report('CLS', this.clsValue);
    }).observe({ entryTypes: ['layout-shift'] });
    
    // Time to First Byte
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0];
      this.metrics.TTFB = navigation.responseStart - navigation.requestStart;
      this.report('TTFB', this.metrics.TTFB);
    });
    
    // Interaction to Next Paint (INP)
    if ('PerformanceEventTiming' in window) {
      let maxDuration = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > maxDuration) {
            maxDuration = entry.duration;
            this.metrics.INP = maxDuration;
            this.report('INP', maxDuration);
          }
        }
      }).observe({ entryTypes: ['event'] });
    }
  }
  
  report(metric, value) {
    // 评估性能等级
    const rating = this.getRating(metric, value);
    
    console.log(`${metric}: ${value.toFixed(2)}ms [${rating}]`);
    
    // 发送到分析服务
    this.sendToAnalytics(metric, value, rating);
  }
  
  getRating(metric, value) {
    const thresholds = {
      FCP: { good: 1800, poor: 3000 },
      LCP: { good: 2500, poor: 4000 },
      FID: { good: 100, poor: 300 },
      CLS: { good: 0.1, poor: 0.25 },
      TTFB: { good: 800, poor: 1800 },
      INP: { good: 200, poor: 500 }
    };
    
    const threshold = thresholds[metric];
    if (!threshold) return 'unknown';
    
    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  }
  
  sendToAnalytics(metric, value, rating) {
    if ('sendBeacon' in navigator) {
      const data = JSON.stringify({
        metric,
        value,
        rating,
        url: window.location.href,
        timestamp: Date.now(),
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        },
        connection: this.getConnectionInfo()
      });
      
      navigator.sendBeacon('/api/metrics', data);
    }
  }
  
  getConnectionInfo() {
    if ('connection' in navigator) {
      const conn = navigator.connection;
      return {
        type: conn.effectiveType,
        downlink: conn.downlink,
        rtt: conn.rtt,
        saveData: conn.saveData
      };
    }
    return null;
  }
  
  getMetrics() {
    return this.metrics;
  }
}

// 初始化监控
const vitalsMonitor = new WebVitalsMonitor();
```

## User Timing API

### 自定义性能标记

```javascript
class PerformanceTracker {
  constructor() {
    this.marks = new Map();
    this.measures = new Map();
  }
  
  // 标记时间点
  mark(name, detail = {}) {
    try {
      performance.mark(name, { detail });
      this.marks.set(name, performance.now());
    } catch (e) {
      // 降级方案
      this.marks.set(name, performance.now());
    }
  }
  
  // 测量时间段
  measure(name, startMark, endMark = null) {
    try {
      if (endMark) {
        performance.measure(name, startMark, endMark);
      } else {
        performance.measure(name, startMark);
      }
      
      const measure = performance.getEntriesByName(name, 'measure')[0];
      this.measures.set(name, measure.duration);
      
      return measure.duration;
    } catch (e) {
      // 降级方案
      const startTime = this.marks.get(startMark) || 0;
      const endTime = endMark ? this.marks.get(endMark) : performance.now();
      const duration = endTime - startTime;
      
      this.measures.set(name, duration);
      return duration;
    }
  }
  
  // 获取所有标记
  getMarks() {
    return performance.getEntriesByType('mark');
  }
  
  // 获取所有测量
  getMeasures() {
    return performance.getEntriesByType('measure');
  }
  
  // 清理
  clear(name = null) {
    if (name) {
      performance.clearMarks(name);
      performance.clearMeasures(name);
      this.marks.delete(name);
      this.measures.delete(name);
    } else {
      performance.clearMarks();
      performance.clearMeasures();
      this.marks.clear();
      this.measures.clear();
    }
  }
  
  // 生成报告
  generateReport() {
    const report = {
      marks: {},
      measures: {}
    };
    
    this.marks.forEach((time, name) => {
      report.marks[name] = `${time.toFixed(2)}ms`;
    });
    
    this.measures.forEach((duration, name) => {
      report.measures[name] = `${duration.toFixed(2)}ms`;
    });
    
    return report;
  }
}

// 使用示例
const tracker = new PerformanceTracker();

// 标记应用初始化开始
tracker.mark('app-init-start');

// 模拟初始化过程
setTimeout(() => {
  tracker.mark('app-init-end');
  
  // 测量初始化时间
  const initTime = tracker.measure('app-initialization', 'app-init-start', 'app-init-end');
  console.log(`应用初始化耗时: ${initTime}ms`);
  
  // 标记数据加载
  tracker.mark('data-fetch-start');
  
  fetch('/api/data')
    .then(response => response.json())
    .then(data => {
      tracker.mark('data-fetch-end');
      tracker.measure('data-fetching', 'data-fetch-start', 'data-fetch-end');
      
      console.log('性能报告:', tracker.generateReport());
    });
}, 1000);
```

## 长任务监控

```javascript
class LongTaskMonitor {
  constructor(threshold = 50) {
    this.threshold = threshold;
    this.tasks = [];
    this.init();
  }
  
  init() {
    if ('PerformanceObserver' in window && 'PerformanceLongTaskTiming' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.handleLongTask(entry);
        }
      });
      
      observer.observe({ entryTypes: ['longtask'] });
    } else {
      // 降级方案：使用 requestIdleCallback
      this.polyfillLongTaskDetection();
    }
  }
  
  handleLongTask(entry) {
    const task = {
      duration: entry.duration,
      startTime: entry.startTime,
      name: entry.name,
      attribution: entry.attribution
    };
    
    this.tasks.push(task);
    
    // 记录警告
    console.warn(`检测到长任务: ${task.duration.toFixed(2)}ms`, task);
    
    // 分析任务来源
    if (task.attribution && task.attribution.length > 0) {
      const culprit = task.attribution[0];
      console.warn('任务来源:', {
        containerType: culprit.containerType,
        containerSrc: culprit.containerSrc,
        containerId: culprit.containerId,
        containerName: culprit.containerName
      });
    }
  }
  
  polyfillLongTaskDetection() {
    let lastTime = performance.now();
    
    const checkLongTask = () => {
      const currentTime = performance.now();
      const taskDuration = currentTime - lastTime;
      
      if (taskDuration > this.threshold) {
        this.handleLongTask({
          duration: taskDuration,
          startTime: lastTime,
          name: 'unknown',
          attribution: []
        });
      }
      
      lastTime = currentTime;
      requestAnimationFrame(checkLongTask);
    };
    
    requestAnimationFrame(checkLongTask);
  }
  
  getReport() {
    const totalDuration = this.tasks.reduce((sum, task) => sum + task.duration, 0);
    const avgDuration = this.tasks.length > 0 ? totalDuration / this.tasks.length : 0;
    
    return {
      count: this.tasks.length,
      totalDuration: `${totalDuration.toFixed(2)}ms`,
      avgDuration: `${avgDuration.toFixed(2)}ms`,
      maxDuration: this.tasks.length > 0 ? 
        `${Math.max(...this.tasks.map(t => t.duration)).toFixed(2)}ms` : '0ms',
      tasks: this.tasks.sort((a, b) => b.duration - a.duration).slice(0, 10)
    };
  }
}

// 初始化长任务监控
const longTaskMonitor = new LongTaskMonitor();
```

## 内存监控

```javascript
class MemoryMonitor {
  constructor() {
    this.samples = [];
    this.interval = null;
    this.init();
  }
  
  init() {
    if ('memory' in performance) {
      // 开始定期采样
      this.startSampling();
      
      // 监听内存压力事件（如果支持）
      if ('deviceMemory' in navigator) {
        console.log(`设备内存: ${navigator.deviceMemory}GB`);
      }
    } else {
      console.warn('Performance.memory API 不可用');
    }
  }
  
  startSampling(intervalMs = 1000) {
    this.interval = setInterval(() => {
      this.takeSample();
    }, intervalMs);
  }
  
  stopSampling() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }
  
  takeSample() {
    const memory = performance.memory;
    const sample = {
      timestamp: Date.now(),
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
      usage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
    };
    
    this.samples.push(sample);
    
    // 保留最近5分钟的样本
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    this.samples = this.samples.filter(s => s.timestamp > fiveMinutesAgo);
    
    // 检查内存使用情况
    this.checkMemoryPressure(sample);
  }
  
  checkMemoryPressure(sample) {
    if (sample.usage > 90) {
      console.error('严重内存压力！', `${sample.usage.toFixed(2)}% 已使用`);
      this.onMemoryPressure('critical', sample);
    } else if (sample.usage > 70) {
      console.warn('内存使用率高', `${sample.usage.toFixed(2)}% 已使用`);
      this.onMemoryPressure('high', sample);
    }
  }
  
  onMemoryPressure(level, sample) {
    // 触发内存清理
    if (level === 'critical') {
      // 清理缓存
      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => caches.delete(name));
        });
      }
      
      // 触发垃圾回收（如果可能）
      if (window.gc) {
        window.gc();
      }
    }
    
    // 发送警报
    this.sendAlert(level, sample);
  }
  
  sendAlert(level, sample) {
    if ('sendBeacon' in navigator) {
      navigator.sendBeacon('/api/memory-alert', JSON.stringify({
        level,
        usage: sample.usage,
        timestamp: sample.timestamp
      }));
    }
  }
  
  getStats() {
    if (this.samples.length === 0) return null;
    
    const latestSample = this.samples[this.samples.length - 1];
    const usages = this.samples.map(s => s.usage);
    
    return {
      current: {
        usage: `${latestSample.usage.toFixed(2)}%`,
        used: `${(latestSample.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
        total: `${(latestSample.totalJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
        limit: `${(latestSample.jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB`
      },
      trend: {
        min: `${Math.min(...usages).toFixed(2)}%`,
        max: `${Math.max(...usages).toFixed(2)}%`,
        avg: `${(usages.reduce((a, b) => a + b, 0) / usages.length).toFixed(2)}%`
      }
    };
  }
}

// 初始化内存监控
const memoryMonitor = new MemoryMonitor();
```

## 性能预算监控

```javascript
class PerformanceBudget {
  constructor(budgets) {
    this.budgets = budgets;
    this.violations = [];
    this.init();
  }
  
  init() {
    window.addEventListener('load', () => {
      this.checkBudgets();
    });
  }
  
  async checkBudgets() {
    // 检查资源大小预算
    if (this.budgets.resources) {
      this.checkResourceBudgets();
    }
    
    // 检查性能指标预算
    if (this.budgets.metrics) {
      this.checkMetricBudgets();
    }
    
    // 报告违规
    this.reportViolations();
  }
  
  checkResourceBudgets() {
    const resources = performance.getEntriesByType('resource');
    const resourcesByType = {};
    
    resources.forEach(resource => {
      const type = this.getResourceType(resource.name);
      if (!resourcesByType[type]) {
        resourcesByType[type] = {
          count: 0,
          totalSize: 0
        };
      }
      
      resourcesByType[type].count++;
      resourcesByType[type].totalSize += resource.transferSize || 0;
    });
    
    // 检查每种资源类型
    Object.entries(this.budgets.resources).forEach(([type, budget]) => {
      const actual = resourcesByType[type];
      if (!actual) return;
      
      if (budget.count && actual.count > budget.count) {
        this.addViolation('resource-count', type, budget.count, actual.count);
      }
      
      if (budget.size && actual.totalSize > budget.size * 1024) {
        this.addViolation('resource-size', type, 
          `${budget.size}KB`, 
          `${(actual.totalSize / 1024).toFixed(2)}KB`
        );
      }
    });
  }
  
  checkMetricBudgets() {
    const navigation = performance.getEntriesByType('navigation')[0];
    
    // 检查各项性能指标
    Object.entries(this.budgets.metrics).forEach(([metric, budget]) => {
      let actual;
      
      switch (metric) {
        case 'loadTime':
          actual = navigation.loadEventEnd - navigation.fetchStart;
          break;
        case 'domContentLoaded':
          actual = navigation.domContentLoadedEventEnd - navigation.fetchStart;
          break;
        case 'firstPaint':
          const fp = performance.getEntriesByName('first-paint')[0];
          actual = fp ? fp.startTime : null;
          break;
        case 'firstContentfulPaint':
          const fcp = performance.getEntriesByName('first-contentful-paint')[0];
          actual = fcp ? fcp.startTime : null;
          break;
      }
      
      if (actual && actual > budget) {
        this.addViolation('metric', metric, `${budget}ms`, `${actual.toFixed(2)}ms`);
      }
    });
  }
  
  addViolation(type, name, expected, actual) {
    this.violations.push({
      type,
      name,
      expected,
      actual,
      severity: this.getSeverity(type, expected, actual)
    });
  }
  
  getSeverity(type, expected, actual) {
    const ratio = parseFloat(actual) / parseFloat(expected);
    
    if (ratio > 2) return 'critical';
    if (ratio > 1.5) return 'high';
    if (ratio > 1.2) return 'medium';
    return 'low';
  }
  
  reportViolations() {
    if (this.violations.length === 0) {
      console.log('✅ 所有性能预算检查通过！');
      return;
    }
    
    console.group('⚠️ 性能预算违规');
    this.violations.forEach(violation => {
      const emoji = {
        critical: '🔴',
        high: '🟠',
        medium: '🟡',
        low: '🟢'
      }[violation.severity];
      
      console.log(
        `${emoji} ${violation.name}: 期望 ${violation.expected}, 实际 ${violation.actual}`
      );
    });
    console.groupEnd();
    
    // 发送到监控服务
    this.sendViolations();
  }
  
  sendViolations() {
    if ('sendBeacon' in navigator && this.violations.length > 0) {
      navigator.sendBeacon('/api/budget-violations', JSON.stringify({
        url: window.location.href,
        violations: this.violations,
        timestamp: Date.now()
      }));
    }
  }
  
  getResourceType(url) {
    if (/\.(js|mjs)$/i.test(url)) return 'script';
    if (/\.css$/i.test(url)) return 'style';
    if (/\.(jpg|jpeg|png|gif|webp|avif|svg)$/i.test(url)) return 'image';
    if (/\.(woff|woff2|ttf|otf|eot)$/i.test(url)) return 'font';
    return 'other';
  }
}

// 定义性能预算
const budgets = {
  resources: {
    script: { count: 10, size: 300 }, // 最多10个JS文件，总计300KB
    style: { count: 5, size: 100 },   // 最多5个CSS文件，总计100KB
    image: { count: 30, size: 1000 }, // 最多30张图片，总计1MB
    font: { count: 5, size: 200 }     // 最多5个字体文件，总计200KB
  },
  metrics: {
    loadTime: 3000,           // 页面加载时间 < 3秒
    domContentLoaded: 1500,   // DOM内容加载 < 1.5秒
    firstPaint: 1000,         // 首次绘制 < 1秒
    firstContentfulPaint: 1800 // 首次内容绘制 < 1.8秒
  }
};

// 初始化预算监控
const budgetMonitor = new PerformanceBudget(budgets);
```