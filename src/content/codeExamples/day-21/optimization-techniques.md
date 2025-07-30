---
day: 21
title: "优化技巧实践"
description: "学习和掌握优化技巧实践的实际应用"
category: "practice"
language: "javascript"
---

# 优化技巧实践

## 防抖与节流优化

```javascript
// 高级防抖实现
function debounce(fn, delay, options = {}) {
    let timeoutId;
    let lastCallTime;
    let lastInvokeTime = 0;
    let leading = options.leading || false;
    let maxWait = options.maxWait;
    let trailing = options.trailing !== false;
    
    function invokeFunc(time) {
        const args = lastArgs;
        const thisArg = lastThis;
        
        lastArgs = lastThis = undefined;
        lastInvokeTime = time;
        result = fn.apply(thisArg, args);
        return result;
    }
    
    function leadingEdge(time) {
        lastInvokeTime = time;
        timeoutId = setTimeout(timerExpired, delay);
        return leading ? invokeFunc(time) : result;
    }
    
    function remainingWait(time) {
        const timeSinceLastCall = time - lastCallTime;
        const timeSinceLastInvoke = time - lastInvokeTime;
        const timeWaiting = delay - timeSinceLastCall;
        
        return maxWait !== undefined
            ? Math.min(timeWaiting, maxWait - timeSinceLastInvoke)
            : timeWaiting;
    }
    
    function shouldInvoke(time) {
        const timeSinceLastCall = time - lastCallTime;
        const timeSinceLastInvoke = time - lastInvokeTime;
        
        return lastCallTime === undefined || 
               timeSinceLastCall >= delay ||
               timeSinceLastCall < 0 ||
               (maxWait !== undefined && timeSinceLastInvoke >= maxWait);
    }
    
    function timerExpired() {
        const time = Date.now();
        
        if (shouldInvoke(time)) {
            return trailingEdge(time);
        }
        
        timeoutId = setTimeout(timerExpired, remainingWait(time));
    }
    
    function trailingEdge(time) {
        timeoutId = undefined;
        
        if (trailing && lastArgs) {
            return invokeFunc(time);
        }
        
        lastArgs = lastThis = undefined;
        return result;
    }
    
    function cancel() {
        if (timeoutId !== undefined) {
            clearTimeout(timeoutId);
        }
        lastInvokeTime = 0;
        lastArgs = lastCallTime = lastThis = timeoutId = undefined;
    }
    
    function flush() {
        return timeoutId === undefined ? result : trailingEdge(Date.now());
    }
    
    function debounced(...args) {
        const time = Date.now();
        const isInvoking = shouldInvoke(time);
        
        lastArgs = args;
        lastThis = this;
        lastCallTime = time;
        
        if (isInvoking) {
            if (timeoutId === undefined) {
                return leadingEdge(lastCallTime);
            }
            if (maxWait !== undefined) {
                timeoutId = setTimeout(timerExpired, delay);
                return invokeFunc(lastCallTime);
            }
        }
        
        if (timeoutId === undefined) {
            timeoutId = setTimeout(timerExpired, delay);
        }
        
        return result;
    }
    
    let lastArgs;
    let lastThis;
    let result;
    
    debounced.cancel = cancel;
    debounced.flush = flush;
    
    return debounced;
}

// 高级节流实现
function throttle(fn, wait, options = {}) {
    let leading = options.leading !== false;
    let trailing = options.trailing !== false;
    
    const debounced = debounce(fn, wait, {
        leading,
        maxWait: wait,
        trailing
    });
    
    return debounced;
}

// 请求防抖
class RequestDebouncer {
    constructor(delay = 300) {
        this.delay = delay;
        this.pending = new Map();
    }
    
    async request(key, requestFn) {
        // 取消之前的请求
        if (this.pending.has(key)) {
            this.pending.get(key).cancel();
        }
        
        return new Promise((resolve, reject) => {
            const abortController = new AbortController();
            
            const debouncedRequest = debounce(async () => {
                try {
                    const result = await requestFn(abortController.signal);
                    resolve(result);
                } catch (error) {
                    if (error.name !== 'AbortError') {
                        reject(error);
                    }
                } finally {
                    this.pending.delete(key);
                }
            }, this.delay);
            
            this.pending.set(key, {
                cancel: () => {
                    debouncedRequest.cancel();
                    abortController.abort();
                    reject(new Error('Request cancelled'));
                }
            });
            
            debouncedRequest();
        });
    }
}

// 使用示例
const searchDebouncer = new RequestDebouncer(500);

async function handleSearch(query) {
    try {
        const results = await searchDebouncer.request('search', async (signal) => {
            const response = await fetch(`/api/search?q=${query}`, { signal });
            return response.json();
        });
        
        displayResults(results);
    } catch (error) {
        if (error.message !== 'Request cancelled') {
            console.error('Search failed:', error);
        }
    }
}
```

## 懒加载与虚拟化

```javascript
// 通用懒加载器
class LazyLoader {
    constructor(options = {}) {
        this.options = {
            root: null,
            rootMargin: '50px',
            threshold: 0.01,
            ...options
        };
        
        this.observer = null;
        this.callbacks = new WeakMap();
        this.init();
    }
    
    init() {
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const callback = this.callbacks.get(entry.target);
                    if (callback) {
                        callback(entry.target);
                        
                        // 默认只触发一次
                        if (this.options.once !== false) {
                            this.unobserve(entry.target);
                        }
                    }
                }
            });
        }, this.options);
    }
    
    observe(element, callback) {
        if (element && callback) {
            this.callbacks.set(element, callback);
            this.observer.observe(element);
        }
    }
    
    unobserve(element) {
        if (element) {
            this.callbacks.delete(element);
            this.observer.unobserve(element);
        }
    }
    
    disconnect() {
        this.observer.disconnect();
        this.callbacks = new WeakMap();
    }
}

// 图片懒加载
class ImageLazyLoader extends LazyLoader {
    constructor(options) {
        super(options);
        this.loadedImages = new Set();
    }
    
    loadImage(img) {
        const src = img.dataset.src;
        const srcset = img.dataset.srcset;
        
        if (!src || this.loadedImages.has(img)) return;
        
        // 创建新图片对象预加载
        const tempImg = new Image();
        
        tempImg.onload = () => {
            img.src = src;
            if (srcset) img.srcset = srcset;
            
            img.classList.add('loaded');
            this.loadedImages.add(img);
            
            // 清理
            delete img.dataset.src;
            delete img.dataset.srcset;
        };
        
        tempImg.onerror = () => {
            img.classList.add('error');
        };
        
        tempImg.src = src;
        if (srcset) tempImg.srcset = srcset;
    }
    
    observeImages(container = document) {
        const images = container.querySelectorAll('img[data-src]');
        
        images.forEach(img => {
            this.observe(img, () => this.loadImage(img));
        });
    }
}

// 虚拟列表
class VirtualList {
    constructor(container, options) {
        this.container = container;
        this.options = {
            itemHeight: 50,
            buffer: 5,
            renderItem: null,
            getItemHeight: null,
            ...options
        };
        
        this.items = [];
        this.scrollTop = 0;
        this.visibleStart = 0;
        this.visibleEnd = 0;
        this.heights = new Map();
        
        this.init();
    }
    
    init() {
        // 创建容器结构
        this.wrapper = document.createElement('div');
        this.wrapper.style.position = 'relative';
        this.wrapper.style.overflow = 'auto';
        this.wrapper.style.height = '100%';
        
        this.scroller = document.createElement('div');
        this.content = document.createElement('div');
        this.content.style.position = 'absolute';
        this.content.style.top = '0';
        this.content.style.left = '0';
        this.content.style.right = '0';
        
        this.scroller.appendChild(this.content);
        this.wrapper.appendChild(this.scroller);
        this.container.appendChild(this.wrapper);
        
        // 绑定滚动事件
        this.wrapper.addEventListener('scroll', this.handleScroll.bind(this));
        
        // 监听容器大小变化
        this.resizeObserver = new ResizeObserver(() => {
            this.handleResize();
        });
        this.resizeObserver.observe(this.wrapper);
    }
    
    setItems(items) {
        this.items = items;
        this.heights.clear();
        this.updateScroller();
        this.render();
    }
    
    updateScroller() {
        const totalHeight = this.getTotalHeight();
        this.scroller.style.height = `${totalHeight}px`;
    }
    
    getTotalHeight() {
        if (this.options.getItemHeight) {
            let total = 0;
            for (let i = 0; i < this.items.length; i++) {
                total += this.getItemHeight(i);
            }
            return total;
        }
        
        return this.items.length * this.options.itemHeight;
    }
    
    getItemHeight(index) {
        if (this.heights.has(index)) {
            return this.heights.get(index);
        }
        
        const height = this.options.getItemHeight
            ? this.options.getItemHeight(this.items[index], index)
            : this.options.itemHeight;
        
        this.heights.set(index, height);
        return height;
    }
    
    getItemOffset(index) {
        let offset = 0;
        
        for (let i = 0; i < index; i++) {
            offset += this.getItemHeight(i);
        }
        
        return offset;
    }
    
    handleScroll() {
        this.scrollTop = this.wrapper.scrollTop;
        this.render();
    }
    
    handleResize() {
        this.render();
    }
    
    render() {
        const containerHeight = this.wrapper.clientHeight;
        const { buffer } = this.options;
        
        // 计算可见范围
        let accumulatedHeight = 0;
        let visibleStart = 0;
        
        for (let i = 0; i < this.items.length; i++) {
            const itemHeight = this.getItemHeight(i);
            
            if (accumulatedHeight + itemHeight > this.scrollTop) {
                visibleStart = Math.max(0, i - buffer);
                break;
            }
            
            accumulatedHeight += itemHeight;
        }
        
        accumulatedHeight = this.getItemOffset(visibleStart);
        let visibleEnd = visibleStart;
        
        for (let i = visibleStart; i < this.items.length; i++) {
            if (accumulatedHeight > this.scrollTop + containerHeight) {
                visibleEnd = Math.min(this.items.length - 1, i + buffer);
                break;
            }
            
            accumulatedHeight += this.getItemHeight(i);
        }
        
        // 只在范围变化时重新渲染
        if (visibleStart !== this.visibleStart || visibleEnd !== this.visibleEnd) {
            this.visibleStart = visibleStart;
            this.visibleEnd = visibleEnd;
            this.renderItems();
        }
    }
    
    renderItems() {
        this.content.innerHTML = '';
        
        const fragment = document.createDocumentFragment();
        const startOffset = this.getItemOffset(this.visibleStart);
        
        for (let i = this.visibleStart; i <= this.visibleEnd; i++) {
            const item = this.items[i];
            if (!item) continue;
            
            const element = this.options.renderItem(item, i);
            const offset = this.getItemOffset(i) - startOffset;
            
            element.style.position = 'absolute';
            element.style.top = `${offset}px`;
            element.style.left = '0';
            element.style.right = '0';
            
            fragment.appendChild(element);
        }
        
        this.content.style.transform = `translateY(${startOffset}px)`;
        this.content.appendChild(fragment);
    }
    
    scrollToIndex(index, behavior = 'smooth') {
        const offset = this.getItemOffset(index);
        
        this.wrapper.scrollTo({
            top: offset,
            behavior
        });
    }
    
    destroy() {
        this.resizeObserver.disconnect();
        this.wrapper.removeEventListener('scroll', this.handleScroll);
        this.container.innerHTML = '';
    }
}

// 使用示例
const imageLoader = new ImageLazyLoader({
    rootMargin: '100px'
});

// 初始化图片懒加载
imageLoader.observeImages();

// 创建虚拟列表
const virtualList = new VirtualList(document.getElementById('list-container'), {
    itemHeight: 60,
    renderItem: (item, index) => {
        const div = document.createElement('div');
        div.className = 'list-item';
        div.textContent = `Item ${index}: ${item.name}`;
        return div;
    }
});

// 设置数据
const data = Array.from({ length: 10000 }, (_, i) => ({
    id: i,
    name: `Item ${i}`
}));

virtualList.setItems(data);
```

## 计算密集型任务优化

```javascript
// Web Worker池
class WorkerPool {
    constructor(workerScript, poolSize = navigator.hardwareConcurrency || 4) {
        this.workerScript = workerScript;
        this.poolSize = poolSize;
        this.workers = [];
        this.availableWorkers = [];
        this.taskQueue = [];
        this.taskCallbacks = new Map();
        
        this.init();
    }
    
    init() {
        for (let i = 0; i < this.poolSize; i++) {
            const worker = new Worker(this.workerScript);
            
            worker.addEventListener('message', (event) => {
                this.handleWorkerMessage(worker, event.data);
            });
            
            worker.addEventListener('error', (error) => {
                this.handleWorkerError(worker, error);
            });
            
            this.workers.push(worker);
            this.availableWorkers.push(worker);
        }
    }
    
    async execute(data) {
        return new Promise((resolve, reject) => {
            const taskId = this.generateTaskId();
            
            this.taskCallbacks.set(taskId, { resolve, reject });
            this.taskQueue.push({ id: taskId, data });
            
            this.processQueue();
        });
    }
    
    processQueue() {
        while (this.taskQueue.length > 0 && this.availableWorkers.length > 0) {
            const task = this.taskQueue.shift();
            const worker = this.availableWorkers.shift();
            
            worker.postMessage({
                id: task.id,
                data: task.data
            });
        }
    }
    
    handleWorkerMessage(worker, message) {
        const { id, result, error } = message;
        const callback = this.taskCallbacks.get(id);
        
        if (callback) {
            if (error) {
                callback.reject(new Error(error));
            } else {
                callback.resolve(result);
            }
            
            this.taskCallbacks.delete(id);
        }
        
        // 将worker返回池中
        this.availableWorkers.push(worker);
        this.processQueue();
    }
    
    handleWorkerError(worker, error) {
        console.error('Worker error:', error);
        
        // 重新创建worker
        const index = this.workers.indexOf(worker);
        if (index !== -1) {
            worker.terminate();
            
            const newWorker = new Worker(this.workerScript);
            newWorker.addEventListener('message', (event) => {
                this.handleWorkerMessage(newWorker, event.data);
            });
            newWorker.addEventListener('error', (error) => {
                this.handleWorkerError(newWorker, error);
            });
            
            this.workers[index] = newWorker;
            this.availableWorkers.push(newWorker);
        }
    }
    
    generateTaskId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    
    terminate() {
        this.workers.forEach(worker => worker.terminate());
        this.workers = [];
        this.availableWorkers = [];
        this.taskQueue = [];
        this.taskCallbacks.clear();
    }
}

// Worker脚本示例 (worker.js)
/*
self.addEventListener('message', async (event) => {
    const { id, data } = event.data;
    
    try {
        let result;
        
        switch (data.type) {
            case 'sort':
                result = performSort(data.array);
                break;
            case 'search':
                result = performSearch(data.array, data.target);
                break;
            case 'process':
                result = await processData(data.input);
                break;
            default:
                throw new Error('Unknown task type');
        }
        
        self.postMessage({ id, result });
    } catch (error) {
        self.postMessage({ id, error: error.message });
    }
});

function performSort(array) {
    // 执行排序算法
    return array.sort((a, b) => a - b);
}

function performSearch(array, target) {
    // 执行搜索算法
    return array.filter(item => item.includes(target));
}

async function processData(input) {
    // 执行复杂数据处理
    // ...
    return processedData;
}
*/

// 分块处理大数据
class ChunkProcessor {
    constructor(options = {}) {
        this.chunkSize = options.chunkSize || 1000;
        this.delay = options.delay || 0;
        this.onProgress = options.onProgress || (() => {});
    }
    
    async process(data, processor) {
        const results = [];
        const totalChunks = Math.ceil(data.length / this.chunkSize);
        
        for (let i = 0; i < data.length; i += this.chunkSize) {
            const chunk = data.slice(i, i + this.chunkSize);
            const chunkIndex = Math.floor(i / this.chunkSize);
            
            // 处理块
            const chunkResult = await processor(chunk, chunkIndex);
            results.push(...chunkResult);
            
            // 报告进度
            const progress = ((chunkIndex + 1) / totalChunks) * 100;
            this.onProgress(progress, chunkIndex + 1, totalChunks);
            
            // 让出主线程
            if (this.delay > 0) {
                await this.sleep(this.delay);
            } else {
                await this.yieldToMain();
            }
        }
        
        return results;
    }
    
    async processAsync(data, asyncProcessor) {
        const results = [];
        const totalChunks = Math.ceil(data.length / this.chunkSize);
        const promises = [];
        
        for (let i = 0; i < data.length; i += this.chunkSize) {
            const chunk = data.slice(i, i + this.chunkSize);
            const chunkIndex = Math.floor(i / this.chunkSize);
            
            const promise = asyncProcessor(chunk, chunkIndex).then(result => {
                const progress = ((chunkIndex + 1) / totalChunks) * 100;
                this.onProgress(progress, chunkIndex + 1, totalChunks);
                return result;
            });
            
            promises.push(promise);
        }
        
        const chunkResults = await Promise.all(promises);
        chunkResults.forEach(chunkResult => results.push(...chunkResult));
        
        return results;
    }
    
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    yieldToMain() {
        return new Promise(resolve => {
            if ('scheduler' in window && 'yield' in scheduler) {
                scheduler.yield().then(resolve);
            } else {
                setTimeout(resolve, 0);
            }
        });
    }
}

// 使用示例
const workerPool = new WorkerPool('/worker.js', 4);

async function processLargeDataset(dataset) {
    const processor = new ChunkProcessor({
        chunkSize: 5000,
        onProgress: (progress, current, total) => {
            console.log(`Processing: ${progress.toFixed(2)}% (${current}/${total})`);
        }
    });
    
    // 使用Worker池处理
    const results = await processor.processAsync(dataset, async (chunk) => {
        return await workerPool.execute({
            type: 'process',
            input: chunk
        });
    });
    
    return results;
}
```

## 内存管理优化

```javascript
// 对象池实现
class ObjectPool {
    constructor(factory, reset, validate = () => true) {
        this.factory = factory;
        this.reset = reset;
        this.validate = validate;
        this.pool = [];
        this.activeObjects = new WeakSet();
        this.maxSize = 100;
        this.created = 0;
    }
    
    acquire() {
        let obj = null;
        
        // 从池中查找可用对象
        while (this.pool.length > 0) {
            obj = this.pool.pop();
            
            if (this.validate(obj)) {
                break;
            }
            
            // 无效对象，丢弃
            obj = null;
        }
        
        // 如果没有可用对象，创建新的
        if (!obj) {
            obj = this.factory();
            this.created++;
        }
        
        this.activeObjects.add(obj);
        return obj;
    }
    
    release(obj) {
        if (!this.activeObjects.has(obj)) {
            console.warn('Object not from this pool');
            return;
        }
        
        this.activeObjects.delete(obj);
        
        // 重置对象
        this.reset(obj);
        
        // 如果池未满，将对象返回池中
        if (this.pool.length < this.maxSize) {
            this.pool.push(obj);
        }
    }
    
    clear() {
        this.pool = [];
    }
    
    getStats() {
        return {
            poolSize: this.pool.length,
            created: this.created,
            active: this.activeObjects.size
        };
    }
}

// 弱引用缓存
class WeakCache {
    constructor(loader) {
        this.loader = loader;
        this.cache = new WeakMap();
        this.keyMap = new Map();
    }
    
    async get(key) {
        // 获取或创建键对象
        let keyObj = this.keyMap.get(key);
        
        if (!keyObj) {
            keyObj = { key };
            this.keyMap.set(key, keyObj);
        }
        
        // 检查缓存
        let value = this.cache.get(keyObj);
        
        if (value === undefined) {
            // 加载数据
            value = await this.loader(key);
            this.cache.set(keyObj, value);
        }
        
        return value;
    }
    
    clear(key) {
        if (key) {
            const keyObj = this.keyMap.get(key);
            if (keyObj) {
                this.cache.delete(keyObj);
                this.keyMap.delete(key);
            }
        } else {
            this.cache = new WeakMap();
            this.keyMap.clear();
        }
    }
}

// 内存监控器
class MemoryMonitor {
    constructor(threshold = 0.9) {
        this.threshold = threshold;
        this.callbacks = new Set();
        this.monitoring = false;
        this.interval = null;
    }
    
    start(intervalMs = 5000) {
        if (this.monitoring || !performance.memory) return;
        
        this.monitoring = true;
        
        this.interval = setInterval(() => {
            this.check();
        }, intervalMs);
    }
    
    stop() {
        if (!this.monitoring) return;
        
        this.monitoring = false;
        clearInterval(this.interval);
    }
    
    check() {
        const memoryInfo = this.getMemoryInfo();
        
        if (memoryInfo.usageRatio > this.threshold) {
            this.notifyHighMemory(memoryInfo);
        }
    }
    
    getMemoryInfo() {
        const memory = performance.memory;
        
        return {
            used: memory.usedJSHeapSize,
            total: memory.totalJSHeapSize,
            limit: memory.jsHeapSizeLimit,
            usageRatio: memory.usedJSHeapSize / memory.jsHeapSizeLimit
        };
    }
    
    onHighMemory(callback) {
        this.callbacks.add(callback);
        
        return () => {
            this.callbacks.delete(callback);
        };
    }
    
    notifyHighMemory(memoryInfo) {
        this.callbacks.forEach(callback => {
            try {
                callback(memoryInfo);
            } catch (error) {
                console.error('Memory callback error:', error);
            }
        });
    }
}

// 资源管理器
class ResourceManager {
    constructor() {
        this.resources = new Map();
        this.cleanupCallbacks = new Map();
    }
    
    register(id, resource, cleanup) {
        if (this.resources.has(id)) {
            this.cleanup(id);
        }
        
        this.resources.set(id, resource);
        
        if (cleanup) {
            this.cleanupCallbacks.set(id, cleanup);
        }
    }
    
    get(id) {
        return this.resources.get(id);
    }
    
    cleanup(id) {
        const resource = this.resources.get(id);
        const cleanup = this.cleanupCallbacks.get(id);
        
        if (cleanup && resource) {
            try {
                cleanup(resource);
            } catch (error) {
                console.error(`Cleanup error for ${id}:`, error);
            }
        }
        
        this.resources.delete(id);
        this.cleanupCallbacks.delete(id);
    }
    
    cleanupAll() {
        const ids = Array.from(this.resources.keys());
        ids.forEach(id => this.cleanup(id));
    }
    
    // 自动清理未使用的资源
    autoCleanup(maxAge = 300000) { // 5分钟
        const now = Date.now();
        
        this.resources.forEach((resource, id) => {
            if (resource.lastUsed && now - resource.lastUsed > maxAge) {
                this.cleanup(id);
            }
        });
    }
}

// 使用示例
// 创建粒子对象池
const particlePool = new ObjectPool(
    // 工厂函数
    () => ({
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        color: '#000000',
        size: 1,
        life: 100
    }),
    // 重置函数
    (particle) => {
        particle.x = 0;
        particle.y = 0;
        particle.vx = 0;
        particle.vy = 0;
        particle.life = 100;
    }
);

// 内存监控
const memoryMonitor = new MemoryMonitor(0.8);

memoryMonitor.onHighMemory((info) => {
    console.warn('High memory usage:', info);
    
    // 触发清理
    resourceManager.autoCleanup();
    particlePool.clear();
});

memoryMonitor.start();

// 资源管理
const resourceManager = new ResourceManager();

// 注册资源
resourceManager.register('canvas', canvas, (canvas) => {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});

// 页面卸载时清理
window.addEventListener('beforeunload', () => {
    memoryMonitor.stop();
    resourceManager.cleanupAll();
    particlePool.clear();
});
```