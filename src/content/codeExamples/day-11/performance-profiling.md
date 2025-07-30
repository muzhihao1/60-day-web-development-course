---
day: 11
title: "性能分析与优化"
description: "使用Performance面板进行CPU分析、内存分析、火焰图解读"
category: "debugging"
language: "javascript"
---

## Performance面板深度使用

### 1. 性能录制与分析基础

```javascript
// 性能标记API使用
class PerformanceAnalyzer {
    constructor() {
        this.marks = new Map();
        this.measures = new Map();
    }
    
    // 标记开始时间
    markStart(name) {
        performance.mark(`${name}-start`);
        this.marks.set(`${name}-start`, performance.now());
    }
    
    // 标记结束时间并测量
    markEnd(name) {
        performance.mark(`${name}-end`);
        performance.measure(name, `${name}-start`, `${name}-end`);
        
        const measure = performance.getEntriesByName(name, 'measure')[0];
        this.measures.set(name, measure);
        
        return measure.duration;
    }
    
    // 获取详细报告
    getReport() {
        const report = {};
        
        this.measures.forEach((measure, name) => {
            report[name] = {
                duration: `${measure.duration.toFixed(2)}ms`,
                startTime: `${measure.startTime.toFixed(2)}ms`,
                timestamp: new Date(performance.timeOrigin + measure.startTime)
            };
        });
        
        return report;
    }
    
    // 清理标记
    clear() {
        performance.clearMarks();
        performance.clearMeasures();
        this.marks.clear();
        this.measures.clear();
    }
}

// 使用示例
const analyzer = new PerformanceAnalyzer();

// 分析数据处理性能
analyzer.markStart('data-processing');

// 模拟数据处理
const data = Array(100000).fill(0).map((_, i) => ({
    id: i,
    value: Math.random(),
    timestamp: Date.now()
}));

// 排序操作
analyzer.markStart('sorting');
data.sort((a, b) => b.value - a.value);
analyzer.markEnd('sorting');

// 过滤操作
analyzer.markStart('filtering');
const filtered = data.filter(item => item.value > 0.5);
analyzer.markEnd('filtering');

// 映射操作
analyzer.markStart('mapping');
const mapped = filtered.map(item => ({
    ...item,
    category: item.value > 0.8 ? 'high' : 'medium'
}));
analyzer.markEnd('mapping');

analyzer.markEnd('data-processing');

console.table(analyzer.getReport());
```

### 2. 长任务检测与优化

```javascript
// 长任务监控和分解
class LongTaskOptimizer {
    constructor(threshold = 50) {
        this.threshold = threshold;
        this.observer = null;
        this.init();
    }
    
    init() {
        if ('PerformanceObserver' in window) {
            this.observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    this.handleLongTask(entry);
                }
            });
            
            try {
                this.observer.observe({ entryTypes: ['longtask'] });
            } catch (e) {
                console.warn('Long task monitoring not supported');
            }
        }
    }
    
    handleLongTask(entry) {
        console.warn(`长任务检测: ${entry.duration.toFixed(2)}ms`, {
            name: entry.name,
            startTime: entry.startTime,
            attribution: entry.attribution
        });
        
        // 记录到性能日志
        this.logPerformanceIssue({
            type: 'long-task',
            duration: entry.duration,
            timestamp: Date.now()
        });
    }
    
    // 将长任务分解为小块
    async breakDownTask(items, processor, chunkSize = 100) {
        const chunks = [];
        
        for (let i = 0; i < items.length; i += chunkSize) {
            chunks.push(items.slice(i, i + chunkSize));
        }
        
        const results = [];
        
        for (const chunk of chunks) {
            // 使用requestIdleCallback处理每个块
            await new Promise(resolve => {
                requestIdleCallback(() => {
                    const chunkResults = chunk.map(processor);
                    results.push(...chunkResults);
                    resolve();
                }, { timeout: 16 }); // 一帧的时间
            });
            
            // 让出主线程
            await new Promise(resolve => setTimeout(resolve, 0));
        }
        
        return results;
    }
    
    // 性能问题日志
    logPerformanceIssue(issue) {
        const issues = JSON.parse(localStorage.getItem('performanceIssues') || '[]');
        issues.push(issue);
        
        // 只保留最近100条
        if (issues.length > 100) {
            issues.shift();
        }
        
        localStorage.setItem('performanceIssues', JSON.stringify(issues));
    }
}

// 使用示例：优化大数据渲染
async function renderLargeList(items) {
    const optimizer = new LongTaskOptimizer();
    
    performance.mark('render-start');
    
    // 分批创建DOM元素
    const elements = await optimizer.breakDownTask(
        items,
        (item) => {
            const element = document.createElement('div');
            element.className = 'list-item';
            element.textContent = item.name;
            element.dataset.id = item.id;
            return element;
        },
        50 // 每批处理50个
    );
    
    // 使用DocumentFragment批量插入
    const fragment = document.createDocumentFragment();
    elements.forEach(el => fragment.appendChild(el));
    
    document.getElementById('list-container').appendChild(fragment);
    
    performance.mark('render-end');
    performance.measure('render-duration', 'render-start', 'render-end');
    
    const measure = performance.getEntriesByName('render-duration')[0];
    console.log(`渲染${items.length}个项目耗时: ${measure.duration.toFixed(2)}ms`);
}
```

### 3. 内存分析工具

```javascript
// 内存泄漏检测器
class MemoryLeakDetector {
    constructor() {
        this.snapshots = [];
        this.leakThreshold = 5 * 1024 * 1024; // 5MB
        this.checkInterval = 10000; // 10秒
    }
    
    // 开始监控
    startMonitoring() {
        if (!performance.memory) {
            console.warn('Memory API not available');
            return;
        }
        
        this.captureSnapshot('initial');
        
        this.intervalId = setInterval(() => {
            this.checkMemory();
        }, this.checkInterval);
    }
    
    // 停止监控
    stopMonitoring() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }
    
    // 捕获内存快照
    captureSnapshot(label) {
        const snapshot = {
            label,
            timestamp: Date.now(),
            usedJSHeapSize: performance.memory.usedJSHeapSize,
            totalJSHeapSize: performance.memory.totalJSHeapSize,
            jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
        };
        
        this.snapshots.push(snapshot);
        
        // 只保留最近20个快照
        if (this.snapshots.length > 20) {
            this.snapshots.shift();
        }
        
        return snapshot;
    }
    
    // 检查内存使用
    checkMemory() {
        const current = this.captureSnapshot('check');
        
        if (this.snapshots.length < 2) return;
        
        // 比较最近的快照
        const previous = this.snapshots[this.snapshots.length - 2];
        const delta = current.usedJSHeapSize - previous.usedJSHeapSize;
        
        if (delta > this.leakThreshold) {
            console.warn('可能的内存泄漏检测:', {
                增长量: `${(delta / 1024 / 1024).toFixed(2)}MB`,
                当前使用: `${(current.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
                总堆大小: `${(current.totalJSHeapSize / 1024 / 1024).toFixed(2)}MB`
            });
            
            this.analyzePotentialLeaks();
        }
    }
    
    // 分析潜在泄漏
    analyzePotentialLeaks() {
        // 检查常见泄漏源
        const checks = {
            事件监听器: this.countEventListeners(),
            DOM节点数: document.getElementsByTagName('*').length,
            定时器数: this.countTimers()
        };
        
        console.table(checks);
    }
    
    // 计算事件监听器数量
    countEventListeners() {
        let count = 0;
        const allElements = document.getElementsByTagName('*');
        
        for (let element of allElements) {
            const listeners = getEventListeners(element);
            for (let type in listeners) {
                count += listeners[type].length;
            }
        }
        
        return count;
    }
    
    // 估算定时器数量
    countTimers() {
        // 这是一个估算方法
        let count = 0;
        const originalSetTimeout = window.setTimeout;
        const originalSetInterval = window.setInterval;
        
        window.activeTimers = window.activeTimers || new Set();
        
        window.setTimeout = function(...args) {
            const id = originalSetTimeout.apply(this, args);
            window.activeTimers.add(id);
            return id;
        };
        
        window.setInterval = function(...args) {
            const id = originalSetInterval.apply(this, args);
            window.activeTimers.add(id);
            return id;
        };
        
        return window.activeTimers.size;
    }
    
    // 生成内存报告
    generateReport() {
        const report = {
            快照数量: this.snapshots.length,
            监控时长: `${((Date.now() - this.snapshots[0].timestamp) / 1000 / 60).toFixed(2)}分钟`,
            内存趋势: this.calculateTrend(),
            当前状态: this.getCurrentStatus()
        };
        
        return report;
    }
    
    // 计算内存趋势
    calculateTrend() {
        if (this.snapshots.length < 2) return '数据不足';
        
        const first = this.snapshots[0];
        const last = this.snapshots[this.snapshots.length - 1];
        const delta = last.usedJSHeapSize - first.usedJSHeapSize;
        const rate = delta / (last.timestamp - first.timestamp) * 1000 * 60; // MB/分钟
        
        return {
            总增长: `${(delta / 1024 / 1024).toFixed(2)}MB`,
            增长率: `${(rate / 1024 / 1024).toFixed(2)}MB/分钟`,
            趋势: delta > 0 ? '上升' : '下降'
        };
    }
    
    // 获取当前状态
    getCurrentStatus() {
        const current = performance.memory;
        const usage = (current.usedJSHeapSize / current.jsHeapSizeLimit) * 100;
        
        return {
            使用率: `${usage.toFixed(2)}%`,
            已用堆: `${(current.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
            总堆大小: `${(current.totalJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
            堆限制: `${(current.jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB`,
            状态: usage > 90 ? '危险' : usage > 70 ? '警告' : '正常'
        };
    }
}
```

### 4. 火焰图分析工具

```javascript
// 自定义性能分析器
class FlameGraphAnalyzer {
    constructor() {
        this.callStack = [];
        this.samples = [];
        this.sampling = false;
    }
    
    // 开始采样
    startSampling(sampleRate = 1) {
        this.sampling = true;
        this.samples = [];
        
        const captureStack = () => {
            if (!this.sampling) return;
            
            // 捕获当前调用栈
            const stack = this.captureCallStack();
            this.samples.push({
                timestamp: performance.now(),
                stack
            });
            
            setTimeout(captureStack, sampleRate);
        };
        
        captureStack();
    }
    
    // 停止采样
    stopSampling() {
        this.sampling = false;
        return this.analyzeSamples();
    }
    
    // 捕获调用栈
    captureCallStack() {
        const stack = new Error().stack;
        return stack.split('\n')
            .slice(2) // 移除Error和captureCallStack
            .map(line => {
                const match = line.match(/at\s+(.+?)\s+\((.+?):(\d+):(\d+)\)/);
                if (match) {
                    return {
                        function: match[1],
                        file: match[2],
                        line: match[3],
                        column: match[4]
                    };
                }
                return null;
            })
            .filter(Boolean);
    }
    
    // 分析采样数据
    analyzeSamples() {
        const functionTimes = new Map();
        const callPaths = new Map();
        
        this.samples.forEach(sample => {
            // 统计函数时间
            sample.stack.forEach(frame => {
                const key = `${frame.function}@${frame.file}:${frame.line}`;
                functionTimes.set(key, (functionTimes.get(key) || 0) + 1);
            });
            
            // 统计调用路径
            const path = sample.stack.map(f => f.function).join(' -> ');
            callPaths.set(path, (callPaths.get(path) || 0) + 1);
        });
        
        // 转换为百分比
        const total = this.samples.length;
        const topFunctions = Array.from(functionTimes.entries())
            .map(([func, count]) => ({
                function: func,
                samples: count,
                percentage: (count / total * 100).toFixed(2) + '%'
            }))
            .sort((a, b) => b.samples - a.samples)
            .slice(0, 20);
        
        return {
            totalSamples: total,
            topFunctions,
            callPaths: Array.from(callPaths.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10)
        };
    }
}
```

### 5. 渲染性能分析

```javascript
// 渲染性能监控
class RenderPerformanceMonitor {
    constructor() {
        this.metrics = {
            fps: [],
            frameTimes: [],
            longFrames: 0,
            paintTimes: []
        };
        this.monitoring = false;
    }
    
    // 开始监控
    start() {
        this.monitoring = true;
        this.lastTime = performance.now();
        this.frameCount = 0;
        
        // FPS监控
        this.monitorFPS();
        
        // Paint事件监控
        this.monitorPaintEvents();
        
        // 布局抖动检测
        this.detectLayoutThrashing();
    }
    
    // FPS监控
    monitorFPS() {
        const measure = () => {
            if (!this.monitoring) return;
            
            const currentTime = performance.now();
            const deltaTime = currentTime - this.lastTime;
            
            this.frameCount++;
            
            // 每秒计算一次FPS
            if (deltaTime >= 1000) {
                const fps = (this.frameCount * 1000) / deltaTime;
                this.metrics.fps.push({
                    timestamp: currentTime,
                    value: Math.round(fps)
                });
                
                // 保留最近60秒的数据
                if (this.metrics.fps.length > 60) {
                    this.metrics.fps.shift();
                }
                
                this.frameCount = 0;
                this.lastTime = currentTime;
            }
            
            // 检测长帧
            if (deltaTime > 16.67) { // 超过16.67ms (60fps)
                this.metrics.longFrames++;
                this.metrics.frameTimes.push({
                    timestamp: currentTime,
                    duration: deltaTime
                });
            }
            
            requestAnimationFrame(measure);
        };
        
        requestAnimationFrame(measure);
    }
    
    // Paint事件监控
    monitorPaintEvents() {
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    this.metrics.paintTimes.push({
                        name: entry.name,
                        startTime: entry.startTime,
                        duration: entry.duration || 0
                    });
                }
            });
            
            try {
                observer.observe({ entryTypes: ['paint'] });
            } catch (e) {
                console.warn('Paint monitoring not supported');
            }
        }
    }
    
    // 布局抖动检测
    detectLayoutThrashing() {
        const originalGetBoundingClientRect = Element.prototype.getBoundingClientRect;
        const originalOffsetHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetHeight');
        const originalOffsetWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetWidth');
        
        let readCount = 0;
        let writeCount = 0;
        let lastResetTime = performance.now();
        
        // 监控读取操作
        Element.prototype.getBoundingClientRect = function() {
            readCount++;
            return originalGetBoundingClientRect.call(this);
        };
        
        // 监控写入操作
        ['style', 'classList'].forEach(prop => {
            const original = Object.getOwnPropertyDescriptor(Element.prototype, prop);
            Object.defineProperty(Element.prototype, prop, {
                get() {
                    return original.get.call(this);
                },
                set(value) {
                    writeCount++;
                    return original.set.call(this, value);
                }
            });
        });
        
        // 定期检查
        setInterval(() => {
            const currentTime = performance.now();
            const timeElapsed = currentTime - lastResetTime;
            
            if (readCount > 100 && writeCount > 100) {
                console.warn('可能的布局抖动检测:', {
                    读取次数: readCount,
                    写入次数: writeCount,
                    时间段: `${(timeElapsed / 1000).toFixed(2)}秒`
                });
            }
            
            readCount = 0;
            writeCount = 0;
            lastResetTime = currentTime;
        }, 5000);
    }
    
    // 获取性能报告
    getReport() {
        const avgFPS = this.metrics.fps.reduce((sum, f) => sum + f.value, 0) / this.metrics.fps.length;
        const currentFPS = this.metrics.fps[this.metrics.fps.length - 1]?.value || 0;
        
        return {
            当前FPS: currentFPS,
            平均FPS: avgFPS.toFixed(2),
            长帧数量: this.metrics.longFrames,
            丢帧率: `${(this.metrics.longFrames / (this.metrics.fps.length * 60) * 100).toFixed(2)}%`,
            Paint事件: this.metrics.paintTimes.length,
            最后Paint: this.metrics.paintTimes[this.metrics.paintTimes.length - 1]
        };
    }
}
```

### 6. Web Vitals监控

```javascript
// Core Web Vitals监控实现
class WebVitalsMonitor {
    constructor() {
        this.metrics = {
            LCP: null,
            FID: null,
            CLS: null,
            FCP: null,
            TTFB: null,
            INP: null
        };
        
        this.init();
    }
    
    init() {
        // LCP (Largest Contentful Paint)
        new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            const lastEntry = entries[entries.length - 1];
            this.metrics.LCP = {
                value: lastEntry.renderTime || lastEntry.loadTime,
                element: lastEntry.element,
                url: lastEntry.url,
                rating: this.getRating('LCP', lastEntry.renderTime || lastEntry.loadTime)
            };
            this.reportMetric('LCP', this.metrics.LCP);
        }).observe({ entryTypes: ['largest-contentful-paint'] });
        
        // FID (First Input Delay)
        new PerformanceObserver((entryList) => {
            const firstInput = entryList.getEntries()[0];
            this.metrics.FID = {
                value: firstInput.processingStart - firstInput.startTime,
                target: firstInput.target,
                type: firstInput.name,
                rating: this.getRating('FID', firstInput.processingStart - firstInput.startTime)
            };
            this.reportMetric('FID', this.metrics.FID);
        }).observe({ entryTypes: ['first-input'] });
        
        // CLS (Cumulative Layout Shift)
        let clsValue = 0;
        let clsEntries = [];
        
        new PerformanceObserver((entryList) => {
            for (const entry of entryList.getEntries()) {
                if (!entry.hadRecentInput) {
                    clsValue += entry.value;
                    clsEntries.push(entry);
                }
            }
            
            this.metrics.CLS = {
                value: clsValue,
                entries: clsEntries,
                rating: this.getRating('CLS', clsValue)
            };
            this.reportMetric('CLS', this.metrics.CLS);
        }).observe({ entryTypes: ['layout-shift'] });
        
        // FCP (First Contentful Paint)
        new PerformanceObserver((entryList) => {
            const fcp = entryList.getEntriesByName('first-contentful-paint')[0];
            if (fcp) {
                this.metrics.FCP = {
                    value: fcp.startTime,
                    rating: this.getRating('FCP', fcp.startTime)
                };
                this.reportMetric('FCP', this.metrics.FCP);
            }
        }).observe({ entryTypes: ['paint'] });
        
        // TTFB (Time to First Byte)
        window.addEventListener('load', () => {
            const navigationTiming = performance.getEntriesByType('navigation')[0];
            this.metrics.TTFB = {
                value: navigationTiming.responseStart - navigationTiming.requestStart,
                rating: this.getRating('TTFB', navigationTiming.responseStart - navigationTiming.requestStart)
            };
            this.reportMetric('TTFB', this.metrics.TTFB);
        });
    }
    
    getRating(metric, value) {
        const thresholds = {
            LCP: { good: 2500, needsImprovement: 4000 },
            FID: { good: 100, needsImprovement: 300 },
            CLS: { good: 0.1, needsImprovement: 0.25 },
            FCP: { good: 1800, needsImprovement: 3000 },
            TTFB: { good: 800, needsImprovement: 1800 }
        };
        
        const threshold = thresholds[metric];
        if (!threshold) return 'unknown';
        
        if (value <= threshold.good) return 'good';
        if (value <= threshold.needsImprovement) return 'needs-improvement';
        return 'poor';
    }
    
    reportMetric(name, data) {
        const emoji = {
            good: '🟢',
            'needs-improvement': '🟡',
            poor: '🔴'
        };
        
        console.log(`${emoji[data.rating]} ${name}: ${data.value.toFixed(2)}${name === 'CLS' ? '' : 'ms'} [${data.rating}]`);
        
        // 发送到分析服务
        if (navigator.sendBeacon) {
            const payload = {
                metric: name,
                value: data.value,
                rating: data.rating,
                timestamp: Date.now(),
                url: window.location.href
            };
            
            // navigator.sendBeacon('/api/metrics', JSON.stringify(payload));
        }
    }
    
    getReport() {
        return this.metrics;
    }
}

// 初始化监控
const performanceMonitor = new RenderPerformanceMonitor();
const vitalsMonitor = new WebVitalsMonitor();

// 开始监控
performanceMonitor.start();

// 定期输出报告
setInterval(() => {
    console.group('性能监控报告');
    console.table(performanceMonitor.getReport());
    console.table(vitalsMonitor.getReport());
    console.groupEnd();
}, 10000);
```

这些性能分析工具和技术能帮助你深入了解应用的性能状况，找出瓶颈并进行优化！