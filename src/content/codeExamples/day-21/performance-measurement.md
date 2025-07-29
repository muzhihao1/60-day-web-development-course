---
title: "性能测量与分析"
description: "学习和掌握性能测量与分析的实际应用"
category: "advanced"
language: "javascript"
---

# 性能测量与分析

## Performance API完整使用

```javascript
// 性能测量工具类
class PerformanceMeasurement {
    constructor() {
        this.marks = new Map();
        this.measures = new Map();
        this.observers = new Map();
    }
    
    // 标记时间点
    mark(name) {
        performance.mark(name);
        this.marks.set(name, performance.now());
        return this;
    }
    
    // 测量两个标记之间的时间
    measure(name, startMark, endMark) {
        performance.measure(name, startMark, endMark);
        
        const measure = performance.getEntriesByName(name, 'measure')[0];
        this.measures.set(name, {
            duration: measure.duration,
            startTime: measure.startTime,
            timestamp: Date.now()
        });
        
        return measure.duration;
    }
    
    // 自动测量函数执行时间
    async measureFunction(name, fn, ...args) {
        const startMark = `${name}-start`;
        const endMark = `${name}-end`;
        
        this.mark(startMark);
        
        try {
            const result = await fn(...args);
            this.mark(endMark);
            const duration = this.measure(name, startMark, endMark);
            
            console.log(`⏱ ${name}: ${duration.toFixed(2)}ms`);
            return result;
        } catch (error) {
            this.mark(endMark);
            this.measure(name, startMark, endMark);
            throw error;
        }
    }
    
    // 获取统计信息
    getStats(measureName) {
        const entries = performance.getEntriesByName(measureName, 'measure');
        
        if (entries.length === 0) return null;
        
        const durations = entries.map(e => e.duration);
        const sum = durations.reduce((a, b) => a + b, 0);
        
        return {
            count: entries.length,
            total: sum,
            average: sum / entries.length,
            min: Math.min(...durations),
            max: Math.max(...durations),
            median: this.calculateMedian(durations)
        };
    }
    
    calculateMedian(values) {
        const sorted = [...values].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        
        return sorted.length % 2 !== 0
            ? sorted[mid]
            : (sorted[mid - 1] + sorted[mid]) / 2;
    }
    
    // 清理标记和测量
    clear(name) {
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
}

// 使用示例
const perf = new PerformanceMeasurement();

// 测量单个操作
perf.mark('operation-start');
// 执行操作
performOperation();
perf.mark('operation-end');
const duration = perf.measure('operation', 'operation-start', 'operation-end');

// 自动测量函数
await perf.measureFunction('fetchData', async () => {
    return await fetch('/api/data').then(r => r.json());
});
```

## 资源加载性能分析

```javascript
// 资源性能分析器
class ResourceAnalyzer {
    constructor() {
        this.resources = [];
        this.categories = {
            script: [],
            style: [],
            image: [],
            font: [],
            xhr: [],
            fetch: [],
            other: []
        };
    }
    
    analyze() {
        this.resources = performance.getEntriesByType('resource');
        this.categorizeResources();
        
        return {
            summary: this.getSummary(),
            byCategory: this.getCategoryStats(),
            slowest: this.getSlowestResources(),
            largest: this.getLargestResources(),
            timeline: this.getTimeline()
        };
    }
    
    categorizeResources() {
        this.resources.forEach(resource => {
            const category = this.getResourceCategory(resource);
            this.categories[category].push(resource);
        });
    }
    
    getResourceCategory(resource) {
        const { name, initiatorType } = resource;
        
        if (initiatorType === 'script') return 'script';
        if (initiatorType === 'css' || initiatorType === 'link' && name.includes('.css')) return 'style';
        if (initiatorType === 'img' || initiatorType === 'image') return 'image';
        if (name.includes('.woff') || name.includes('.ttf')) return 'font';
        if (initiatorType === 'xmlhttprequest') return 'xhr';
        if (initiatorType === 'fetch') return 'fetch';
        
        return 'other';
    }
    
    getSummary() {
        const totalDuration = this.resources.reduce((sum, r) => sum + r.duration, 0);
        const totalSize = this.resources.reduce((sum, r) => sum + (r.transferSize || 0), 0);
        
        return {
            totalResources: this.resources.length,
            totalDuration: Math.round(totalDuration),
            totalSize: this.formatBytes(totalSize),
            averageDuration: Math.round(totalDuration / this.resources.length),
            averageSize: this.formatBytes(totalSize / this.resources.length)
        };
    }
    
    getCategoryStats() {
        const stats = {};
        
        Object.entries(this.categories).forEach(([category, resources]) => {
            if (resources.length === 0) return;
            
            const totalDuration = resources.reduce((sum, r) => sum + r.duration, 0);
            const totalSize = resources.reduce((sum, r) => sum + (r.transferSize || 0), 0);
            
            stats[category] = {
                count: resources.length,
                totalDuration: Math.round(totalDuration),
                totalSize: this.formatBytes(totalSize),
                averageDuration: Math.round(totalDuration / resources.length)
            };
        });
        
        return stats;
    }
    
    getSlowestResources(limit = 10) {
        return [...this.resources]
            .sort((a, b) => b.duration - a.duration)
            .slice(0, limit)
            .map(resource => ({
                name: this.getResourceName(resource.name),
                duration: Math.round(resource.duration),
                size: this.formatBytes(resource.transferSize || 0),
                type: this.getResourceCategory(resource)
            }));
    }
    
    getLargestResources(limit = 10) {
        return [...this.resources]
            .filter(r => r.transferSize)
            .sort((a, b) => b.transferSize - a.transferSize)
            .slice(0, limit)
            .map(resource => ({
                name: this.getResourceName(resource.name),
                size: this.formatBytes(resource.transferSize),
                duration: Math.round(resource.duration),
                type: this.getResourceCategory(resource)
            }));
    }
    
    getTimeline() {
        const timeline = [];
        const bucketSize = 100; // 100ms buckets
        
        this.resources.forEach(resource => {
            const startBucket = Math.floor(resource.startTime / bucketSize);
            const endBucket = Math.floor((resource.startTime + resource.duration) / bucketSize);
            
            for (let i = startBucket; i <= endBucket; i++) {
                timeline[i] = (timeline[i] || 0) + 1;
            }
        });
        
        return timeline.map((count, index) => ({
            time: index * bucketSize,
            count: count || 0
        }));
    }
    
    getResourceName(url) {
        try {
            const urlObj = new URL(url);
            return urlObj.pathname.split('/').pop() || urlObj.pathname;
        } catch {
            return url;
        }
    }
    
    formatBytes(bytes) {
        if (bytes === 0) return '0 B';
        
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    // 生成报告
    generateReport() {
        const analysis = this.analyze();
        
        console.group('📊 Resource Performance Report');
        
        console.log('Summary:', analysis.summary);
        
        console.group('By Category:');
        Object.entries(analysis.byCategory).forEach(([category, stats]) => {
            console.log(`${category}:`, stats);
        });
        console.groupEnd();
        
        console.table(analysis.slowest);
        console.table(analysis.largest);
        
        console.groupEnd();
        
        return analysis;
    }
}

// 使用示例
const analyzer = new ResourceAnalyzer();
window.addEventListener('load', () => {
    setTimeout(() => {
        analyzer.generateReport();
    }, 100);
});
```

## 用户体验指标监控

```javascript
// Web Vitals监控
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
        
        this.thresholds = {
            FCP: { good: 1800, needsImprovement: 3000 },
            LCP: { good: 2500, needsImprovement: 4000 },
            FID: { good: 100, needsImprovement: 300 },
            CLS: { good: 0.1, needsImprovement: 0.25 },
            TTFB: { good: 800, needsImprovement: 1800 },
            INP: { good: 200, needsImprovement: 500 }
        };
        
        this.init();
    }
    
    init() {
        // First Contentful Paint
        this.observePaint();
        
        // Largest Contentful Paint
        this.observeLCP();
        
        // First Input Delay
        this.observeFID();
        
        // Cumulative Layout Shift
        this.observeCLS();
        
        // Time to First Byte
        this.observeTTFB();
        
        // Interaction to Next Paint (新指标)
        this.observeINP();
    }
    
    observePaint() {
        const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach(entry => {
                if (entry.name === 'first-contentful-paint') {
                    this.metrics.FCP = Math.round(entry.startTime);
                    this.reportMetric('FCP', this.metrics.FCP);
                }
            });
        });
        
        observer.observe({ entryTypes: ['paint'] });
    }
    
    observeLCP() {
        const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            
            this.metrics.LCP = Math.round(lastEntry.startTime);
            this.reportMetric('LCP', this.metrics.LCP);
        });
        
        observer.observe({ entryTypes: ['largest-contentful-paint'] });
    }
    
    observeFID() {
        const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const firstInput = entries[0];
            
            if (firstInput) {
                this.metrics.FID = Math.round(firstInput.processingStart - firstInput.startTime);
                this.reportMetric('FID', this.metrics.FID);
            }
        });
        
        observer.observe({ entryTypes: ['first-input'] });
    }
    
    observeCLS() {
        let clsValue = 0;
        let clsEntries = [];
        let sessionValue = 0;
        let sessionEntries = [];
        
        const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            
            entries.forEach(entry => {
                if (!entry.hadRecentInput) {
                    const firstSessionEntry = sessionEntries[0];
                    const lastSessionEntry = sessionEntries[sessionEntries.length - 1];
                    
                    if (sessionValue && entry.startTime - lastSessionEntry.startTime < 1000 && 
                        entry.startTime - firstSessionEntry.startTime < 5000) {
                        sessionValue += entry.value;
                        sessionEntries.push(entry);
                    } else {
                        sessionValue = entry.value;
                        sessionEntries = [entry];
                    }
                    
                    if (sessionValue > clsValue) {
                        clsValue = sessionValue;
                        clsEntries = sessionEntries;
                        this.metrics.CLS = Math.round(clsValue * 1000) / 1000;
                        this.reportMetric('CLS', this.metrics.CLS);
                    }
                }
            });
        });
        
        observer.observe({ entryTypes: ['layout-shift'] });
    }
    
    observeTTFB() {
        const navigationEntry = performance.getEntriesByType('navigation')[0];
        
        if (navigationEntry) {
            this.metrics.TTFB = Math.round(navigationEntry.responseStart - navigationEntry.fetchStart);
            this.reportMetric('TTFB', this.metrics.TTFB);
        }
    }
    
    observeINP() {
        let worstINP = 0;
        
        const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            
            entries.forEach(entry => {
                if (entry.interactionId) {
                    const inputDelay = entry.processingStart - entry.startTime;
                    const processingTime = entry.processingEnd - entry.processingStart;
                    const presentationDelay = entry.duration - inputDelay - processingTime;
                    
                    const inp = entry.duration;
                    
                    if (inp > worstINP) {
                        worstINP = inp;
                        this.metrics.INP = Math.round(worstINP);
                        this.reportMetric('INP', this.metrics.INP);
                    }
                }
            });
        });
        
        observer.observe({ entryTypes: ['event'] });
    }
    
    reportMetric(name, value) {
        const rating = this.getRating(name, value);
        const emoji = rating === 'good' ? '✅' : rating === 'needs-improvement' ? '⚠️' : '❌';
        
        console.log(`${emoji} ${name}: ${value}ms (${rating})`);
        
        // 发送到分析服务
        this.sendToAnalytics(name, value, rating);
    }
    
    getRating(metric, value) {
        const threshold = this.thresholds[metric];
        
        if (!threshold) return 'unknown';
        
        if (value <= threshold.good) return 'good';
        if (value <= threshold.needsImprovement) return 'needs-improvement';
        return 'poor';
    }
    
    sendToAnalytics(metric, value, rating) {
        // 实际项目中发送到分析服务
        if (typeof gtag !== 'undefined') {
            gtag('event', metric, {
                value: Math.round(value),
                metric_rating: rating,
                page_path: window.location.pathname
            });
        }
    }
    
    getReport() {
        const report = {
            metrics: { ...this.metrics },
            ratings: {},
            score: 0
        };
        
        let totalScore = 0;
        let metricCount = 0;
        
        Object.entries(this.metrics).forEach(([name, value]) => {
            if (value !== null) {
                const rating = this.getRating(name, value);
                report.ratings[name] = rating;
                
                if (rating === 'good') totalScore += 100;
                else if (rating === 'needs-improvement') totalScore += 50;
                
                metricCount++;
            }
        });
        
        report.score = metricCount > 0 ? Math.round(totalScore / metricCount) : 0;
        
        return report;
    }
}

// 初始化监控
const vitals = new WebVitalsMonitor();

// 页面卸载时获取最终报告
window.addEventListener('beforeunload', () => {
    const report = vitals.getReport();
    
    // 使用sendBeacon发送最终数据
    if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/analytics/vitals', JSON.stringify(report));
    }
});
```

## 内存泄漏检测

```javascript
// 内存泄漏检测器
class MemoryLeakDetector {
    constructor() {
        this.snapshots = [];
        this.leaks = [];
        this.monitoring = false;
        this.interval = null;
    }
    
    start(intervalMs = 5000) {
        if (this.monitoring) return;
        
        this.monitoring = true;
        console.log('🔍 Memory leak detection started');
        
        // 初始快照
        this.takeSnapshot('initial');
        
        // 定期快照
        this.interval = setInterval(() => {
            this.takeSnapshot('periodic');
            this.analyze();
        }, intervalMs);
    }
    
    stop() {
        if (!this.monitoring) return;
        
        this.monitoring = false;
        clearInterval(this.interval);
        
        // 最终快照
        this.takeSnapshot('final');
        
        console.log('🛑 Memory leak detection stopped');
        this.generateReport();
    }
    
    takeSnapshot(label) {
        if (!performance.memory) {
            console.warn('Performance.memory not available');
            return;
        }
        
        const snapshot = {
            label,
            timestamp: Date.now(),
            memory: {
                usedJSHeapSize: performance.memory.usedJSHeapSize,
                totalJSHeapSize: performance.memory.totalJSHeapSize,
                jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
            },
            // 自定义指标
            domNodes: document.getElementsByTagName('*').length,
            eventListeners: this.countEventListeners(),
            timers: this.countTimers()
        };
        
        this.snapshots.push(snapshot);
        
        // 限制快照数量
        if (this.snapshots.length > 50) {
            this.snapshots.shift();
        }
    }
    
    analyze() {
        if (this.snapshots.length < 3) return;
        
        const recent = this.snapshots.slice(-10);
        const memoryTrend = this.calculateTrend(recent.map(s => s.memory.usedJSHeapSize));
        const domTrend = this.calculateTrend(recent.map(s => s.domNodes));
        
        // 检测持续增长
        if (memoryTrend.slope > 1000) { // 每秒增长1KB
            this.leaks.push({
                type: 'memory',
                severity: memoryTrend.slope > 10000 ? 'high' : 'medium',
                message: `Memory growing at ${this.formatBytes(memoryTrend.slope)}/s`,
                timestamp: Date.now()
            });
        }
        
        if (domTrend.slope > 1) { // 每秒增长1个节点
            this.leaks.push({
                type: 'dom',
                severity: domTrend.slope > 10 ? 'high' : 'medium',
                message: `DOM nodes growing at ${domTrend.slope.toFixed(2)}/s`,
                timestamp: Date.now()
            });
        }
    }
    
    calculateTrend(values) {
        const n = values.length;
        if (n < 2) return { slope: 0, intercept: 0 };
        
        // 简单线性回归
        let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
        
        for (let i = 0; i < n; i++) {
            sumX += i;
            sumY += values[i];
            sumXY += i * values[i];
            sumX2 += i * i;
        }
        
        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;
        
        return { slope, intercept };
    }
    
    countEventListeners() {
        // 这是一个近似值，实际项目中可能需要更复杂的方法
        let count = 0;
        const allElements = document.getElementsByTagName('*');
        
        for (const element of allElements) {
            const listeners = getEventListeners ? getEventListeners(element) : {};
            count += Object.keys(listeners).reduce((sum, event) => 
                sum + (listeners[event] ? listeners[event].length : 0), 0);
        }
        
        return count;
    }
    
    countTimers() {
        // 这需要自定义包装setTimeout/setInterval来准确跟踪
        // 这里返回一个占位值
        return 0;
    }
    
    formatBytes(bytes) {
        return (bytes / 1024).toFixed(2) + ' KB';
    }
    
    generateReport() {
        console.group('📊 Memory Leak Detection Report');
        
        if (this.snapshots.length >= 2) {
            const first = this.snapshots[0];
            const last = this.snapshots[this.snapshots.length - 1];
            
            console.log('Memory Growth:', {
                initial: this.formatBytes(first.memory.usedJSHeapSize),
                final: this.formatBytes(last.memory.usedJSHeapSize),
                increase: this.formatBytes(last.memory.usedJSHeapSize - first.memory.usedJSHeapSize),
                duration: ((last.timestamp - first.timestamp) / 1000).toFixed(2) + 's'
            });
            
            console.log('DOM Growth:', {
                initial: first.domNodes,
                final: last.domNodes,
                increase: last.domNodes - first.domNodes
            });
        }
        
        if (this.leaks.length > 0) {
            console.warn('Potential Leaks Detected:');
            console.table(this.leaks);
        } else {
            console.log('✅ No significant memory leaks detected');
        }
        
        console.groupEnd();
    }
}

// 使用示例
const detector = new MemoryLeakDetector();

// 开始检测
detector.start(5000);

// 一段时间后停止
setTimeout(() => {
    detector.stop();
}, 60000);
```