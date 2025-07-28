---
title: "网络分析模式"
description: "HAR文件分析、请求拦截、响应模拟等网络调试技巧"
---

## Network面板高级使用技巧

### 1. 网络请求监控与分析

```javascript
// 网络请求监控器
class NetworkMonitor {
    constructor() {
        this.requests = new Map();
        this.stats = {
            totalRequests: 0,
            failedRequests: 0,
            totalSize: 0,
            totalTime: 0
        };
        this.interceptors = [];
        this.init();
    }
    
    init() {
        // 拦截Fetch
        this.interceptFetch();
        
        // 拦截XMLHttpRequest
        this.interceptXHR();
        
        // 监听资源加载
        this.observeResources();
    }
    
    // Fetch拦截器
    interceptFetch() {
        const originalFetch = window.fetch;
        
        window.fetch = async (...args) => {
            const requestId = this.generateRequestId();
            const [resource, config] = args;
            const request = new Request(resource, config);
            
            // 记录请求开始
            const requestInfo = {
                id: requestId,
                url: request.url,
                method: request.method,
                headers: Object.fromEntries(request.headers),
                startTime: performance.now(),
                type: 'fetch'
            };
            
            this.requests.set(requestId, requestInfo);
            this.stats.totalRequests++;
            
            // 执行拦截器
            for (const interceptor of this.interceptors) {
                if (interceptor.request) {
                    await interceptor.request(requestInfo);
                }
            }
            
            try {
                const response = await originalFetch.apply(this, args);
                const responseClone = response.clone();
                
                // 记录响应
                const responseInfo = {
                    status: response.status,
                    statusText: response.statusText,
                    headers: Object.fromEntries(response.headers),
                    endTime: performance.now(),
                    duration: performance.now() - requestInfo.startTime
                };
                
                // 获取响应大小
                if (response.headers.get('content-length')) {
                    responseInfo.size = parseInt(response.headers.get('content-length'));
                } else {
                    const blob = await responseClone.blob();
                    responseInfo.size = blob.size;
                }
                
                Object.assign(requestInfo, responseInfo);
                this.stats.totalSize += responseInfo.size || 0;
                this.stats.totalTime += responseInfo.duration;
                
                // 执行响应拦截器
                for (const interceptor of this.interceptors) {
                    if (interceptor.response) {
                        await interceptor.response(requestInfo);
                    }
                }
                
                this.logRequest(requestInfo);
                
                return response;
            } catch (error) {
                requestInfo.error = error.message;
                requestInfo.endTime = performance.now();
                requestInfo.duration = requestInfo.endTime - requestInfo.startTime;
                this.stats.failedRequests++;
                
                this.logRequest(requestInfo, true);
                throw error;
            }
        };
    }
    
    // XMLHttpRequest拦截器
    interceptXHR() {
        const XHR = XMLHttpRequest.prototype;
        const originalOpen = XHR.open;
        const originalSend = XHR.send;
        const originalSetRequestHeader = XHR.setRequestHeader;
        
        XHR.open = function(method, url, ...args) {
            this._networkMonitor = {
                method,
                url: new URL(url, window.location.href).href,
                headers: {},
                startTime: null
            };
            return originalOpen.apply(this, [method, url, ...args]);
        };
        
        XHR.setRequestHeader = function(name, value) {
            if (this._networkMonitor) {
                this._networkMonitor.headers[name] = value;
            }
            return originalSetRequestHeader.apply(this, arguments);
        };
        
        XHR.send = function(data) {
            if (this._networkMonitor) {
                const requestId = this.generateRequestId();
                this._networkMonitor.id = requestId;
                this._networkMonitor.startTime = performance.now();
                this._networkMonitor.type = 'xhr';
                this._networkMonitor.data = data;
                
                const monitor = this._networkMonitor;
                this.requests.set(requestId, monitor);
                this.stats.totalRequests++;
                
                // 监听完成事件
                this.addEventListener('loadend', () => {
                    monitor.endTime = performance.now();
                    monitor.duration = monitor.endTime - monitor.startTime;
                    monitor.status = this.status;
                    monitor.statusText = this.statusText;
                    monitor.responseSize = this.responseText ? this.responseText.length : 0;
                    
                    this.stats.totalSize += monitor.responseSize;
                    this.stats.totalTime += monitor.duration;
                    
                    if (this.status >= 400) {
                        this.stats.failedRequests++;
                    }
                    
                    this.logRequest(monitor, this.status >= 400);
                });
            }
            
            return originalSend.apply(this, arguments);
        }.bind(this);
    }
    
    // 监听资源加载
    observeResources() {
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    const resourceInfo = {
                        id: this.generateRequestId(),
                        url: entry.name,
                        type: 'resource',
                        startTime: entry.startTime,
                        duration: entry.duration,
                        size: entry.transferSize,
                        protocol: entry.nextHopProtocol,
                        initiatorType: entry.initiatorType
                    };
                    
                    this.requests.set(resourceInfo.id, resourceInfo);
                    this.stats.totalRequests++;
                    this.stats.totalSize += resourceInfo.size || 0;
                    this.stats.totalTime += resourceInfo.duration;
                    
                    this.logRequest(resourceInfo);
                }
            });
            
            observer.observe({ entryTypes: ['resource'] });
        }
    }
    
    // 生成请求ID
    generateRequestId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    
    // 记录请求
    logRequest(request, isError = false) {
        const logStyle = isError ? 
            'color: red; font-weight: bold;' : 
            'color: green;';
        
        console.log(
            `%c[Network] ${request.method || 'GET'} ${request.url}`,
            logStyle,
            {
                duration: `${request.duration?.toFixed(2)}ms`,
                size: request.size ? `${(request.size / 1024).toFixed(2)}KB` : 'N/A',
                status: request.status || 'N/A'
            }
        );
    }
    
    // 添加拦截器
    addInterceptor(interceptor) {
        this.interceptors.push(interceptor);
    }
    
    // 获取统计信息
    getStats() {
        return {
            ...this.stats,
            averageTime: this.stats.totalRequests > 0 ? 
                (this.stats.totalTime / this.stats.totalRequests).toFixed(2) : 0,
            totalSizeFormatted: `${(this.stats.totalSize / 1024 / 1024).toFixed(2)}MB`,
            successRate: this.stats.totalRequests > 0 ?
                ((this.stats.totalRequests - this.stats.failedRequests) / this.stats.totalRequests * 100).toFixed(2) : 0
        };
    }
    
    // 获取慢请求
    getSlowRequests(threshold = 1000) {
        return Array.from(this.requests.values())
            .filter(req => req.duration > threshold)
            .sort((a, b) => b.duration - a.duration);
    }
    
    // 导出HAR格式
    exportHAR() {
        const har = {
            log: {
                version: '1.2',
                creator: {
                    name: 'NetworkMonitor',
                    version: '1.0'
                },
                entries: Array.from(this.requests.values()).map(req => ({
                    startedDateTime: new Date(performance.timeOrigin + req.startTime).toISOString(),
                    time: req.duration || 0,
                    request: {
                        method: req.method || 'GET',
                        url: req.url,
                        headers: Object.entries(req.headers || {}).map(([name, value]) => ({ name, value })),
                        queryString: this.parseQueryString(req.url),
                        bodySize: -1
                    },
                    response: {
                        status: req.status || 0,
                        statusText: req.statusText || '',
                        headers: [],
                        content: {
                            size: req.size || 0,
                            mimeType: req.headers?.['content-type'] || ''
                        }
                    },
                    cache: {},
                    timings: {
                        send: 0,
                        wait: req.duration || 0,
                        receive: 0
                    }
                }))
            }
        };
        
        return har;
    }
    
    // 解析查询字符串
    parseQueryString(url) {
        try {
            const urlObj = new URL(url);
            return Array.from(urlObj.searchParams).map(([name, value]) => ({ name, value }));
        } catch {
            return [];
        }
    }
}
```

### 2. 请求模拟与Mock

```javascript
// 网络请求Mock工具
class NetworkMocker {
    constructor() {
        this.mocks = new Map();
        this.delays = new Map();
        this.failures = new Map();
        this.enabled = true;
    }
    
    // 添加Mock规则
    mock(pattern, response, options = {}) {
        const mockRule = {
            pattern: this.createPattern(pattern),
            response: typeof response === 'function' ? response : () => response,
            options: {
                delay: options.delay || 0,
                status: options.status || 200,
                headers: options.headers || {},
                once: options.once || false
            }
        };
        
        this.mocks.set(pattern, mockRule);
        return this;
    }
    
    // 创建匹配模式
    createPattern(pattern) {
        if (pattern instanceof RegExp) {
            return pattern;
        }
        
        if (typeof pattern === 'string') {
            // 支持通配符
            const regexPattern = pattern
                .replace(/\*/g, '.*')
                .replace(/\?/g, '.');
            return new RegExp(regexPattern);
        }
        
        return pattern;
    }
    
    // 模拟网络延迟
    delay(pattern, milliseconds) {
        this.delays.set(this.createPattern(pattern), milliseconds);
        return this;
    }
    
    // 模拟网络失败
    fail(pattern, error) {
        this.failures.set(this.createPattern(pattern), error);
        return this;
    }
    
    // 应用Mock
    apply() {
        const originalFetch = window.fetch;
        
        window.fetch = async (...args) => {
            if (!this.enabled) {
                return originalFetch.apply(this, args);
            }
            
            const [resource, config] = args;
            const url = typeof resource === 'string' ? resource : resource.url;
            
            // 检查失败规则
            for (const [pattern, error] of this.failures) {
                if (pattern.test(url)) {
                    throw new Error(error || 'Network request failed');
                }
            }
            
            // 检查延迟规则
            for (const [pattern, delay] of this.delays) {
                if (pattern.test(url)) {
                    await new Promise(resolve => setTimeout(resolve, delay));
                    break;
                }
            }
            
            // 检查Mock规则
            for (const [key, rule] of this.mocks) {
                if (rule.pattern.test(url)) {
                    const mockResponse = await rule.response({ url, ...config });
                    
                    // 如果是一次性Mock，使用后删除
                    if (rule.options.once) {
                        this.mocks.delete(key);
                    }
                    
                    // 应用延迟
                    if (rule.options.delay) {
                        await new Promise(resolve => setTimeout(resolve, rule.options.delay));
                    }
                    
                    // 返回Mock响应
                    return new Response(
                        JSON.stringify(mockResponse),
                        {
                            status: rule.options.status,
                            headers: {
                                'Content-Type': 'application/json',
                                ...rule.options.headers
                            }
                        }
                    );
                }
            }
            
            // 没有匹配的Mock，使用原始fetch
            return originalFetch.apply(this, args);
        };
    }
    
    // 启用/禁用Mock
    enable() {
        this.enabled = true;
    }
    
    disable() {
        this.enabled = false;
    }
    
    // 清除所有Mock
    clear() {
        this.mocks.clear();
        this.delays.clear();
        this.failures.clear();
    }
}

// 使用示例
const mocker = new NetworkMocker();

// Mock API响应
mocker.mock('/api/users', {
    users: [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' }
    ]
});

// 动态Mock
mocker.mock(/\/api\/user\/(\d+)/, (request) => {
    const id = request.url.match(/\/api\/user\/(\d+)/)[1];
    return {
        id: parseInt(id),
        name: `User ${id}`,
        email: `user${id}@example.com`
    };
});

// 模拟延迟
mocker.delay('/api/slow', 2000);

// 模拟失败
mocker.fail('/api/error', 'Internal Server Error');

// 应用Mock
mocker.apply();
```

### 3. 性能瀑布图分析

```javascript
// 瀑布图分析器
class WaterfallAnalyzer {
    constructor() {
        this.entries = [];
        this.startTime = 0;
    }
    
    // 分析页面加载性能
    analyze() {
        const navigation = performance.getEntriesByType('navigation')[0];
        const resources = performance.getEntriesByType('resource');
        
        this.startTime = navigation.fetchStart;
        
        // 导航时间线
        this.analyzeNavigation(navigation);
        
        // 资源时间线
        this.analyzeResources(resources);
        
        // 生成瀑布图数据
        return this.generateWaterfall();
    }
    
    // 分析导航时间
    analyzeNavigation(navigation) {
        const phases = [
            { name: 'DNS Lookup', start: 'domainLookupStart', end: 'domainLookupEnd', color: '#5B9BD5' },
            { name: 'TCP Connect', start: 'connectStart', end: 'connectEnd', color: '#70AD47' },
            { name: 'SSL/TLS', start: 'secureConnectionStart', end: 'connectEnd', color: '#FFC000' },
            { name: 'Request', start: 'requestStart', end: 'responseStart', color: '#ED7D31' },
            { name: 'Response', start: 'responseStart', end: 'responseEnd', color: '#A5A5A5' },
            { name: 'DOM Processing', start: 'domLoading', end: 'domComplete', color: '#4472C4' }
        ];
        
        phases.forEach(phase => {
            if (navigation[phase.start] > 0) {
                this.entries.push({
                    name: phase.name,
                    type: 'navigation',
                    startTime: navigation[phase.start] - this.startTime,
                    duration: navigation[phase.end] - navigation[phase.start],
                    color: phase.color,
                    details: {
                        phase: phase.name,
                        start: navigation[phase.start],
                        end: navigation[phase.end]
                    }
                });
            }
        });
    }
    
    // 分析资源加载
    analyzeResources(resources) {
        resources.forEach(resource => {
            const entry = {
                name: this.getResourceName(resource.name),
                url: resource.name,
                type: resource.initiatorType,
                startTime: resource.startTime,
                duration: resource.duration,
                size: resource.transferSize,
                details: this.getResourceDetails(resource)
            };
            
            this.entries.push(entry);
        });
        
        // 按开始时间排序
        this.entries.sort((a, b) => a.startTime - b.startTime);
    }
    
    // 获取资源名称
    getResourceName(url) {
        try {
            const urlObj = new URL(url);
            return urlObj.pathname.split('/').pop() || urlObj.hostname;
        } catch {
            return url;
        }
    }
    
    // 获取资源详细信息
    getResourceDetails(resource) {
        return {
            dns: resource.domainLookupEnd - resource.domainLookupStart,
            tcp: resource.connectEnd - resource.connectStart,
            ssl: resource.secureConnectionStart > 0 ? 
                resource.connectEnd - resource.secureConnectionStart : 0,
            request: resource.responseStart - resource.requestStart,
            response: resource.responseEnd - resource.responseStart,
            blocked: resource.startTime - resource.fetchStart,
            protocol: resource.nextHopProtocol,
            cached: resource.transferSize === 0 && resource.decodedBodySize > 0
        };
    }
    
    // 生成瀑布图数据
    generateWaterfall() {
        const maxTime = Math.max(...this.entries.map(e => e.startTime + e.duration));
        
        return {
            totalTime: maxTime,
            entries: this.entries.map(entry => ({
                ...entry,
                percentage: (entry.duration / maxTime) * 100,
                offset: (entry.startTime / maxTime) * 100
            })),
            summary: this.generateSummary()
        };
    }
    
    // 生成摘要信息
    generateSummary() {
        const summary = {
            totalRequests: this.entries.filter(e => e.type !== 'navigation').length,
            totalSize: 0,
            totalTime: 0,
            byType: {},
            criticalPath: []
        };
        
        this.entries.forEach(entry => {
            if (entry.type !== 'navigation') {
                summary.totalSize += entry.size || 0;
                summary.totalTime = Math.max(summary.totalTime, entry.startTime + entry.duration);
                
                if (!summary.byType[entry.type]) {
                    summary.byType[entry.type] = {
                        count: 0,
                        size: 0,
                        time: 0
                    };
                }
                
                summary.byType[entry.type].count++;
                summary.byType[entry.type].size += entry.size || 0;
                summary.byType[entry.type].time += entry.duration;
            }
        });
        
        // 识别关键路径
        summary.criticalPath = this.identifyCriticalPath();
        
        return summary;
    }
    
    // 识别关键路径
    identifyCriticalPath() {
        // 找出阻塞渲染的资源
        const criticalResources = this.entries.filter(entry => {
            return (entry.type === 'script' && !entry.async && !entry.defer) ||
                   (entry.type === 'stylesheet') ||
                   (entry.type === 'navigation');
        });
        
        return criticalResources.map(r => ({
            name: r.name,
            impact: r.duration,
            blocking: true
        }));
    }
}
```

### 4. 带宽和连接分析

```javascript
// 网络质量分析器
class NetworkQualityAnalyzer {
    constructor() {
        this.measurements = [];
        this.connectionInfo = this.getConnectionInfo();
    }
    
    // 获取连接信息
    getConnectionInfo() {
        const connection = navigator.connection || 
                          navigator.mozConnection || 
                          navigator.webkitConnection;
        
        if (!connection) {
            return null;
        }
        
        return {
            type: connection.effectiveType,
            downlink: connection.downlink,
            rtt: connection.rtt,
            saveData: connection.saveData,
            downlinkMax: connection.downlinkMax
        };
    }
    
    // 测量下载速度
    async measureDownloadSpeed(url, size) {
        const startTime = performance.now();
        
        try {
            const response = await fetch(url);
            const reader = response.body.getReader();
            let receivedBytes = 0;
            
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                receivedBytes += value.length;
            }
            
            const endTime = performance.now();
            const duration = (endTime - startTime) / 1000; // 秒
            const speed = (receivedBytes * 8) / duration / 1024 / 1024; // Mbps
            
            const measurement = {
                timestamp: Date.now(),
                bytesReceived: receivedBytes,
                duration: duration * 1000,
                speed: speed,
                url: url
            };
            
            this.measurements.push(measurement);
            
            return measurement;
        } catch (error) {
            console.error('Speed test failed:', error);
            return null;
        }
    }
    
    // 测量延迟
    async measureLatency(url, samples = 5) {
        const latencies = [];
        
        for (let i = 0; i < samples; i++) {
            const startTime = performance.now();
            
            try {
                await fetch(url, { method: 'HEAD' });
                const endTime = performance.now();
                latencies.push(endTime - startTime);
            } catch (error) {
                console.error('Latency test failed:', error);
            }
            
            // 等待一小段时间再进行下一次测试
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        return {
            min: Math.min(...latencies),
            max: Math.max(...latencies),
            avg: latencies.reduce((a, b) => a + b) / latencies.length,
            samples: latencies
        };
    }
    
    // 分析网络稳定性
    analyzeStability() {
        if (this.measurements.length < 2) {
            return null;
        }
        
        const speeds = this.measurements.map(m => m.speed);
        const avgSpeed = speeds.reduce((a, b) => a + b) / speeds.length;
        const variance = speeds.reduce((sum, speed) => 
            sum + Math.pow(speed - avgSpeed, 2), 0) / speeds.length;
        const stdDev = Math.sqrt(variance);
        
        return {
            averageSpeed: avgSpeed,
            standardDeviation: stdDev,
            variability: (stdDev / avgSpeed) * 100, // 变异系数
            stability: this.calculateStability(stdDev / avgSpeed)
        };
    }
    
    // 计算稳定性评级
    calculateStability(cv) {
        if (cv < 0.1) return 'excellent';
        if (cv < 0.2) return 'good';
        if (cv < 0.3) return 'fair';
        return 'poor';
    }
    
    // 推荐优化策略
    getOptimizationSuggestions() {
        const suggestions = [];
        
        if (this.connectionInfo) {
            // 基于连接类型的建议
            switch (this.connectionInfo.type) {
                case 'slow-2g':
                case '2g':
                    suggestions.push({
                        priority: 'high',
                        category: 'assets',
                        suggestion: '使用更激进的图片压缩和懒加载策略'
                    });
                    suggestions.push({
                        priority: 'high',
                        category: 'code',
                        suggestion: '实现代码分割，减少初始加载大小'
                    });
                    break;
                case '3g':
                    suggestions.push({
                        priority: 'medium',
                        category: 'assets',
                        suggestion: '考虑使用WebP格式图片'
                    });
                    break;
            }
            
            // 基于RTT的建议
            if (this.connectionInfo.rtt > 200) {
                suggestions.push({
                    priority: 'high',
                    category: 'network',
                    suggestion: '减少请求数量，考虑使用HTTP/2推送'
                });
            }
            
            // 省流量模式
            if (this.connectionInfo.saveData) {
                suggestions.push({
                    priority: 'high',
                    category: 'data',
                    suggestion: '检测到省流量模式，应减少非必要资源加载'
                });
            }
        }
        
        // 基于测量结果的建议
        const stability = this.analyzeStability();
        if (stability && stability.stability === 'poor') {
            suggestions.push({
                priority: 'medium',
                category: 'reliability',
                suggestion: '网络不稳定，建议实现重试机制和离线缓存'
            });
        }
        
        return suggestions;
    }
}

// 使用示例
const analyzer = new NetworkQualityAnalyzer();

// 进行速度测试
async function runSpeedTest() {
    console.log('开始网络质量测试...');
    
    // 测试下载速度
    const speedResult = await analyzer.measureDownloadSpeed(
        '/test-file-1mb.bin',
        1024 * 1024
    );
    
    console.log('下载速度:', speedResult ? `${speedResult.speed.toFixed(2)} Mbps` : '测试失败');
    
    // 测试延迟
    const latencyResult = await analyzer.measureLatency('/api/ping');
    console.log('延迟测试:', latencyResult);
    
    // 获取优化建议
    const suggestions = analyzer.getOptimizationSuggestions();
    console.table(suggestions);
}
```

### 5. HAR文件分析工具

```javascript
// HAR文件分析器
class HARAnalyzer {
    constructor(harData) {
        this.har = typeof harData === 'string' ? JSON.parse(harData) : harData;
        this.entries = this.har.log.entries;
    }
    
    // 基础统计
    getBasicStats() {
        const stats = {
            totalRequests: this.entries.length,
            totalSize: 0,
            totalTime: 0,
            cachedRequests: 0,
            failedRequests: 0,
            domains: new Set(),
            mimeTypes: {}
        };
        
        this.entries.forEach(entry => {
            // 大小统计
            stats.totalSize += entry.response.content.size;
            
            // 时间统计
            stats.totalTime = Math.max(
                stats.totalTime,
                new Date(entry.startedDateTime).getTime() + entry.time
            );
            
            // 缓存统计
            if (entry.response.status === 304 || 
                (entry.response.content.size === 0 && entry.response.status === 200)) {
                stats.cachedRequests++;
            }
            
            // 失败统计
            if (entry.response.status >= 400) {
                stats.failedRequests++;
            }
            
            // 域名统计
            try {
                const url = new URL(entry.request.url);
                stats.domains.add(url.hostname);
            } catch {}
            
            // MIME类型统计
            const mimeType = entry.response.content.mimeType;
            if (mimeType) {
                const type = mimeType.split(';')[0];
                stats.mimeTypes[type] = (stats.mimeTypes[type] || 0) + 1;
            }
        });
        
        stats.domains = Array.from(stats.domains);
        stats.cacheHitRate = (stats.cachedRequests / stats.totalRequests * 100).toFixed(2);
        stats.failureRate = (stats.failedRequests / stats.totalRequests * 100).toFixed(2);
        
        return stats;
    }
    
    // 性能分析
    getPerformanceMetrics() {
        const metrics = {
            timing: this.getTimingMetrics(),
            size: this.getSizeMetrics(),
            domains: this.getDomainMetrics()
        };
        
        return metrics;
    }
    
    // 时间指标
    getTimingMetrics() {
        const timings = this.entries.map(entry => ({
            url: entry.request.url,
            time: entry.time,
            blocked: entry.timings.blocked,
            dns: entry.timings.dns,
            connect: entry.timings.connect,
            send: entry.timings.send,
            wait: entry.timings.wait,
            receive: entry.timings.receive,
            ssl: entry.timings.ssl || -1
        }));
        
        // 找出最慢的请求
        const slowest = timings.sort((a, b) => b.time - a.time).slice(0, 10);
        
        // 计算平均值
        const avgTimings = {
            total: timings.reduce((sum, t) => sum + t.time, 0) / timings.length,
            blocked: this.calculateAverage(timings, 'blocked'),
            dns: this.calculateAverage(timings, 'dns'),
            connect: this.calculateAverage(timings, 'connect'),
            wait: this.calculateAverage(timings, 'wait'),
            receive: this.calculateAverage(timings, 'receive')
        };
        
        return {
            slowest,
            average: avgTimings
        };
    }
    
    // 大小指标
    getSizeMetrics() {
        const sizeByType = {};
        const largestResources = [];
        
        this.entries.forEach(entry => {
            const size = entry.response.content.size;
            const type = this.getResourceType(entry);
            
            if (!sizeByType[type]) {
                sizeByType[type] = {
                    count: 0,
                    totalSize: 0,
                    avgSize: 0
                };
            }
            
            sizeByType[type].count++;
            sizeByType[type].totalSize += size;
            
            largestResources.push({
                url: entry.request.url,
                size: size,
                type: type
            });
        });
        
        // 计算平均值
        Object.keys(sizeByType).forEach(type => {
            sizeByType[type].avgSize = 
                sizeByType[type].totalSize / sizeByType[type].count;
        });
        
        // 获取最大的资源
        largestResources.sort((a, b) => b.size - a.size);
        
        return {
            byType: sizeByType,
            largest: largestResources.slice(0, 10)
        };
    }
    
    // 域名指标
    getDomainMetrics() {
        const domainStats = {};
        
        this.entries.forEach(entry => {
            try {
                const url = new URL(entry.request.url);
                const domain = url.hostname;
                
                if (!domainStats[domain]) {
                    domainStats[domain] = {
                        requests: 0,
                        size: 0,
                        time: 0
                    };
                }
                
                domainStats[domain].requests++;
                domainStats[domain].size += entry.response.content.size;
                domainStats[domain].time += entry.time;
            } catch {}
        });
        
        // 转换为数组并排序
        const domains = Object.entries(domainStats)
            .map(([domain, stats]) => ({
                domain,
                ...stats
            }))
            .sort((a, b) => b.requests - a.requests);
        
        return domains;
    }
    
    // 优化建议
    getOptimizationSuggestions() {
        const suggestions = [];
        const stats = this.getBasicStats();
        const metrics = this.getPerformanceMetrics();
        
        // 检查缓存使用
        if (parseFloat(stats.cacheHitRate) < 30) {
            suggestions.push({
                category: '缓存',
                issue: '缓存命中率低',
                suggestion: '配置适当的缓存头，利用浏览器缓存减少请求'
            });
        }
        
        // 检查请求数量
        if (stats.totalRequests > 100) {
            suggestions.push({
                category: '请求数',
                issue: '请求数量过多',
                suggestion: '考虑合并资源、使用雪碧图或实施懒加载'
            });
        }
        
        // 检查大文件
        metrics.size.largest.forEach(resource => {
            if (resource.size > 1024 * 1024) { // 1MB
                suggestions.push({
                    category: '文件大小',
                    issue: `大文件: ${resource.url}`,
                    suggestion: `优化或压缩该资源 (${(resource.size / 1024 / 1024).toFixed(2)}MB)`
                });
            }
        });
        
        // 检查慢请求
        metrics.timing.slowest.forEach(request => {
            if (request.time > 3000) { // 3秒
                suggestions.push({
                    category: '性能',
                    issue: `慢请求: ${request.url}`,
                    suggestion: `优化该请求，当前耗时 ${(request.time / 1000).toFixed(2)}秒`
                });
            }
        });
        
        return suggestions;
    }
    
    // 辅助方法
    getResourceType(entry) {
        const mimeType = entry.response.content.mimeType;
        if (!mimeType) return 'other';
        
        if (mimeType.includes('javascript')) return 'script';
        if (mimeType.includes('css')) return 'stylesheet';
        if (mimeType.includes('html')) return 'document';
        if (mimeType.includes('image')) return 'image';
        if (mimeType.includes('font')) return 'font';
        if (mimeType.includes('json') || mimeType.includes('xml')) return 'data';
        
        return 'other';
    }
    
    calculateAverage(items, property) {
        const validItems = items.filter(item => item[property] >= 0);
        if (validItems.length === 0) return 0;
        
        return validItems.reduce((sum, item) => 
            sum + item[property], 0) / validItems.length;
    }
    
    // 导出分析报告
    exportReport() {
        return {
            summary: this.getBasicStats(),
            performance: this.getPerformanceMetrics(),
            suggestions: this.getOptimizationSuggestions(),
            timestamp: new Date().toISOString()
        };
    }
}

// 使用示例
// 从Network面板导出HAR文件后
const harData = { /* HAR JSON数据 */ };
const analyzer = new HARAnalyzer(harData);

const report = analyzer.exportReport();
console.log('HAR分析报告:', report);
```

这些网络分析工具和技术能帮助你深入理解应用的网络性能，优化加载速度和用户体验！