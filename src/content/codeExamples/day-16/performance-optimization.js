// DOM性能优化技巧 - Day 16

// ============================================
// 1. 批量DOM操作优化
// ============================================

console.log('=== 批量DOM操作优化 ===\n');

// 创建测试容器
document.body.innerHTML = `
    <div class="performance-demo">
        <h2>DOM性能优化示例</h2>
        
        <section class="batch-operations">
            <h3>批量操作对比</h3>
            <button id="slowBtn">慢速方法（逐个添加）</button>
            <button id="fastBtn">快速方法（批量添加）</button>
            <button id="clearBtn">清空</button>
            <div id="results"></div>
            <ul id="testList"></ul>
        </section>
        
        <section class="virtual-scroll">
            <h3>虚拟滚动示例</h3>
            <div id="scrollContainer" style="height: 400px; overflow-y: auto; border: 1px solid #ccc;">
                <div id="scrollContent"></div>
            </div>
        </section>
        
        <section class="lazy-rendering">
            <h3>延迟渲染示例</h3>
            <div id="lazyContainer"></div>
        </section>
    </div>
`;

// ============================================
// 2. 性能测量工具
// ============================================

class PerformanceTracker {
    static measure(name, fn) {
        const start = performance.now();
        fn();
        const end = performance.now();
        const duration = end - start;
        
        console.log(`${name}: ${duration.toFixed(2)}ms`);
        
        // 显示结果
        const results = document.getElementById('results');
        const result = document.createElement('div');
        result.textContent = `${name}: ${duration.toFixed(2)}ms`;
        result.style.color = duration > 100 ? 'red' : 'green';
        results.appendChild(result);
        
        return duration;
    }
    
    static async measureAsync(name, fn) {
        const start = performance.now();
        await fn();
        const end = performance.now();
        const duration = end - start;
        
        console.log(`${name}: ${duration.toFixed(2)}ms`);
        return duration;
    }
}

// ============================================
// 3. 批量DOM操作对比
// ============================================

const testList = document.getElementById('testList');
const ITEM_COUNT = 1000;

// 慢速方法：逐个添加到DOM
document.getElementById('slowBtn').addEventListener('click', () => {
    testList.innerHTML = '';
    
    PerformanceTracker.measure('慢速方法', () => {
        for (let i = 0; i < ITEM_COUNT; i++) {
            const li = document.createElement('li');
            li.textContent = `项目 ${i + 1}`;
            li.className = 'list-item';
            li.dataset.id = i;
            testList.appendChild(li); // 每次都触发重排
        }
    });
});

// 快速方法1：使用DocumentFragment
document.getElementById('fastBtn').addEventListener('click', () => {
    testList.innerHTML = '';
    
    PerformanceTracker.measure('DocumentFragment方法', () => {
        const fragment = document.createDocumentFragment();
        
        for (let i = 0; i < ITEM_COUNT; i++) {
            const li = document.createElement('li');
            li.textContent = `项目 ${i + 1}`;
            li.className = 'list-item';
            li.dataset.id = i;
            fragment.appendChild(li);
        }
        
        testList.appendChild(fragment); // 只触发一次重排
    });
});

// 清空按钮
document.getElementById('clearBtn').addEventListener('click', () => {
    testList.innerHTML = '';
    document.getElementById('results').innerHTML = '';
});

// ============================================
// 4. 虚拟滚动实现
// ============================================

class VirtualScroller {
    constructor(container, items, itemHeight = 50) {
        this.container = container;
        this.items = items;
        this.itemHeight = itemHeight;
        this.visibleCount = Math.ceil(container.offsetHeight / itemHeight);
        this.bufferSize = 5; // 缓冲区大小
        this.currentScrollTop = 0;
        
        this.init();
    }
    
    init() {
        // 创建内容容器
        this.content = document.createElement('div');
        this.content.style.position = 'relative';
        this.content.style.height = `${this.items.length * this.itemHeight}px`;
        
        // 创建可见项容器
        this.visibleContainer = document.createElement('div');
        this.visibleContainer.style.position = 'absolute';
        this.visibleContainer.style.top = '0';
        this.visibleContainer.style.left = '0';
        this.visibleContainer.style.right = '0';
        
        this.content.appendChild(this.visibleContainer);
        this.container.appendChild(this.content);
        
        // 绑定滚动事件
        this.container.addEventListener('scroll', this.handleScroll.bind(this));
        
        // 初始渲染
        this.render();
    }
    
    handleScroll = throttle(() => {
        this.currentScrollTop = this.container.scrollTop;
        this.render();
    }, 16); // 约60fps
    
    render() {
        const startIndex = Math.max(0, 
            Math.floor(this.currentScrollTop / this.itemHeight) - this.bufferSize
        );
        const endIndex = Math.min(this.items.length,
            startIndex + this.visibleCount + this.bufferSize * 2
        );
        
        // 清空当前内容
        this.visibleContainer.innerHTML = '';
        
        // 渲染可见项
        for (let i = startIndex; i < endIndex; i++) {
            const item = this.createItem(this.items[i], i);
            item.style.position = 'absolute';
            item.style.top = `${i * this.itemHeight}px`;
            item.style.left = '0';
            item.style.right = '0';
            item.style.height = `${this.itemHeight}px`;
            this.visibleContainer.appendChild(item);
        }
        
        console.log(`渲染项目: ${startIndex} - ${endIndex}, 共 ${endIndex - startIndex} 个`);
    }
    
    createItem(data, index) {
        const div = document.createElement('div');
        div.className = 'virtual-item';
        div.style.cssText = `
            padding: 10px;
            border-bottom: 1px solid #eee;
            background: ${index % 2 === 0 ? '#f9f9f9' : 'white'};
        `;
        div.textContent = `${data.title} - ${data.description}`;
        return div;
    }
}

// 初始化虚拟滚动
const scrollContainer = document.getElementById('scrollContainer');
const largeDataset = Array.from({ length: 10000 }, (_, i) => ({
    title: `项目 ${i + 1}`,
    description: `这是第 ${i + 1} 个项目的描述`
}));

const virtualScroller = new VirtualScroller(scrollContainer, largeDataset);

// ============================================
// 5. 延迟渲染和渐进式渲染
// ============================================

class LazyRenderer {
    constructor(container, items, batchSize = 20) {
        this.container = container;
        this.items = items;
        this.batchSize = batchSize;
        this.currentIndex = 0;
        this.isRendering = false;
    }
    
    async renderBatch() {
        if (this.isRendering || this.currentIndex >= this.items.length) {
            return;
        }
        
        this.isRendering = true;
        const endIndex = Math.min(this.currentIndex + this.batchSize, this.items.length);
        
        // 使用requestAnimationFrame确保不阻塞主线程
        await new Promise(resolve => {
            requestAnimationFrame(() => {
                const fragment = document.createDocumentFragment();
                
                for (let i = this.currentIndex; i < endIndex; i++) {
                    const element = this.createCard(this.items[i]);
                    fragment.appendChild(element);
                }
                
                this.container.appendChild(fragment);
                this.currentIndex = endIndex;
                this.isRendering = false;
                resolve();
            });
        });
        
        // 显示进度
        const progress = (this.currentIndex / this.items.length * 100).toFixed(1);
        console.log(`渲染进度: ${progress}%`);
        
        // 继续渲染下一批
        if (this.currentIndex < this.items.length) {
            // 给浏览器一些时间处理其他任务
            setTimeout(() => this.renderBatch(), 0);
        }
    }
    
    createCard(data) {
        const card = document.createElement('div');
        card.className = 'lazy-card';
        card.style.cssText = `
            border: 1px solid #ddd;
            padding: 10px;
            margin: 5px;
            border-radius: 4px;
            background: white;
        `;
        card.innerHTML = `
            <h4>${data.title}</h4>
            <p>${data.content}</p>
        `;
        return card;
    }
    
    start() {
        this.renderBatch();
    }
}

// 创建大量数据用于延迟渲染
const lazyData = Array.from({ length: 500 }, (_, i) => ({
    title: `卡片 ${i + 1}`,
    content: `这是卡片 ${i + 1} 的内容，包含一些描述性文字。`
}));

const lazyContainer = document.getElementById('lazyContainer');
const lazyRenderer = new LazyRenderer(lazyContainer, lazyData);

// 添加开始按钮
const startLazyBtn = document.createElement('button');
startLazyBtn.textContent = '开始延迟渲染';
startLazyBtn.addEventListener('click', () => {
    lazyContainer.innerHTML = '';
    lazyRenderer.currentIndex = 0;
    lazyRenderer.start();
});
lazyContainer.before(startLazyBtn);

// ============================================
// 6. DOM操作优化技巧
// ============================================

console.log('\n=== DOM优化技巧 ===\n');

// 技巧1：批量样式修改
class StyleBatcher {
    static applyStyles(element, styles) {
        // 不好的方式：逐个设置样式属性
        // element.style.width = '100px';
        // element.style.height = '100px';
        // element.style.background = 'red';
        
        // 好的方式：使用cssText一次性设置
        const cssText = Object.entries(styles)
            .map(([key, value]) => `${this.camelToKebab(key)}: ${value}`)
            .join('; ');
        
        element.style.cssText = cssText;
    }
    
    static camelToKebab(str) {
        return str.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
    }
}

// 技巧2：离线DOM操作
class OfflineDOM {
    static modifyOffline(element, modifyFn) {
        // 将元素从DOM中移除
        const parent = element.parentNode;
        const nextSibling = element.nextSibling;
        const removedElement = parent.removeChild(element);
        
        // 执行修改
        modifyFn(removedElement);
        
        // 重新插入DOM
        if (nextSibling) {
            parent.insertBefore(removedElement, nextSibling);
        } else {
            parent.appendChild(removedElement);
        }
    }
}

// 技巧3：缓存DOM查询
class DOMCache {
    constructor() {
        this.cache = new Map();
    }
    
    get(selector) {
        if (!this.cache.has(selector)) {
            const elements = document.querySelectorAll(selector);
            this.cache.set(selector, elements);
        }
        return this.cache.get(selector);
    }
    
    clear() {
        this.cache.clear();
    }
}

// ============================================
// 7. 重排和重绘优化
// ============================================

class ReflowOptimizer {
    // 批量读取DOM属性
    static batchRead(elements, properties) {
        const results = [];
        
        // 先批量读取所有属性（触发一次重排）
        elements.forEach(element => {
            const values = {};
            properties.forEach(prop => {
                values[prop] = element[prop];
            });
            results.push(values);
        });
        
        return results;
    }
    
    // 批量写入DOM属性
    static batchWrite(operations) {
        // 使用requestAnimationFrame确保在下一帧执行
        requestAnimationFrame(() => {
            operations.forEach(({ element, property, value }) => {
                element[property] = value;
            });
        });
    }
    
    // 使用transform代替位置属性
    static optimizedMove(element, x, y) {
        // 不好的方式：改变left/top会触发重排
        // element.style.left = x + 'px';
        // element.style.top = y + 'px';
        
        // 好的方式：使用transform只触发重绘
        element.style.transform = `translate(${x}px, ${y}px)`;
    }
}

// ============================================
// 8. 事件委托性能优化
// ============================================

class OptimizedEventDelegation {
    constructor(root) {
        this.root = root;
        this.handlers = new Map();
        
        // 使用单一事件监听器
        this.root.addEventListener('click', this.handleEvent.bind(this), true);
    }
    
    on(selector, handler) {
        if (!this.handlers.has(selector)) {
            this.handlers.set(selector, new Set());
        }
        this.handlers.get(selector).add(handler);
    }
    
    handleEvent(event) {
        // 使用缓存避免重复查询
        const path = event.composedPath();
        
        for (const [selector, handlers] of this.handlers) {
            // 检查路径中是否有匹配的元素
            const target = path.find(el => el.matches && el.matches(selector));
            
            if (target) {
                handlers.forEach(handler => {
                    handler.call(target, event);
                });
            }
        }
    }
}

// ============================================
// 9. Web Workers 处理繁重计算
// ============================================

class WorkerPool {
    constructor(workerScript, poolSize = 4) {
        this.workers = [];
        this.queue = [];
        this.poolSize = poolSize;
        
        // 创建Worker池
        for (let i = 0; i < poolSize; i++) {
            const worker = new Worker(workerScript);
            worker.onmessage = this.handleMessage.bind(this, i);
            this.workers.push({ worker, busy: false });
        }
    }
    
    execute(data) {
        return new Promise((resolve, reject) => {
            const task = { data, resolve, reject };
            this.queue.push(task);
            this.processQueue();
        });
    }
    
    processQueue() {
        if (this.queue.length === 0) return;
        
        const availableWorker = this.workers.find(w => !w.busy);
        if (!availableWorker) return;
        
        const task = this.queue.shift();
        availableWorker.busy = true;
        availableWorker.currentTask = task;
        availableWorker.worker.postMessage(task.data);
    }
    
    handleMessage(workerIndex, event) {
        const worker = this.workers[workerIndex];
        const task = worker.currentTask;
        
        worker.busy = false;
        worker.currentTask = null;
        
        if (task) {
            task.resolve(event.data);
        }
        
        // 处理队列中的下一个任务
        this.processQueue();
    }
}

// ============================================
// 10. Intersection Observer 优化
// ============================================

class LazyLoadManager {
    constructor(options = {}) {
        this.options = {
            root: null,
            rootMargin: '50px',
            threshold: 0.01,
            ...options
        };
        
        this.observer = new IntersectionObserver(
            this.handleIntersection.bind(this),
            this.options
        );
        
        this.callbacks = new WeakMap();
    }
    
    observe(element, callback) {
        this.callbacks.set(element, callback);
        this.observer.observe(element);
    }
    
    handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const callback = this.callbacks.get(entry.target);
                if (callback) {
                    // 使用requestIdleCallback在空闲时执行
                    if ('requestIdleCallback' in window) {
                        requestIdleCallback(() => callback(entry.target));
                    } else {
                        setTimeout(() => callback(entry.target), 0);
                    }
                    
                    // 执行后取消观察
                    this.observer.unobserve(entry.target);
                    this.callbacks.delete(entry.target);
                }
            }
        });
    }
}

// ============================================
// 11. 内存管理和清理
// ============================================

class MemoryManager {
    constructor() {
        this.references = new WeakMap();
        this.timers = new Set();
        this.observers = new Set();
    }
    
    // 注册需要清理的资源
    register(type, resource, cleanup) {
        switch (type) {
            case 'timer':
                this.timers.add({ resource, cleanup });
                break;
            case 'observer':
                this.observers.add({ resource, cleanup });
                break;
            default:
                this.references.set(resource, cleanup);
        }
    }
    
    // 清理所有资源
    cleanup() {
        // 清理定时器
        this.timers.forEach(({ cleanup }) => cleanup());
        this.timers.clear();
        
        // 清理观察器
        this.observers.forEach(({ resource, cleanup }) => {
            if (cleanup) cleanup();
            if (resource.disconnect) resource.disconnect();
        });
        this.observers.clear();
        
        // 清理其他引用
        // WeakMap会自动垃圾回收
    }
}

// ============================================
// 12. 性能监控工具
// ============================================

class PerformanceMonitor {
    constructor() {
        this.metrics = {
            fps: 0,
            memory: {},
            renderTime: []
        };
        
        this.startMonitoring();
    }
    
    startMonitoring() {
        // FPS监控
        let lastTime = performance.now();
        let frames = 0;
        
        const measureFPS = () => {
            frames++;
            const currentTime = performance.now();
            
            if (currentTime >= lastTime + 1000) {
                this.metrics.fps = Math.round((frames * 1000) / (currentTime - lastTime));
                frames = 0;
                lastTime = currentTime;
            }
            
            requestAnimationFrame(measureFPS);
        };
        
        measureFPS();
        
        // 内存监控（如果可用）
        if (performance.memory) {
            setInterval(() => {
                this.metrics.memory = {
                    used: Math.round(performance.memory.usedJSHeapSize / 1048576),
                    total: Math.round(performance.memory.totalJSHeapSize / 1048576),
                    limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576)
                };
            }, 1000);
        }
    }
    
    measureRender(name, fn) {
        const start = performance.now();
        fn();
        const duration = performance.now() - start;
        
        this.metrics.renderTime.push({ name, duration });
        
        // 只保留最近100条记录
        if (this.metrics.renderTime.length > 100) {
            this.metrics.renderTime.shift();
        }
        
        return duration;
    }
    
    getReport() {
        const avgRenderTime = this.metrics.renderTime.length > 0
            ? this.metrics.renderTime.reduce((sum, item) => sum + item.duration, 0) / this.metrics.renderTime.length
            : 0;
        
        return {
            fps: this.metrics.fps,
            memory: this.metrics.memory,
            avgRenderTime: avgRenderTime.toFixed(2),
            slowRenders: this.metrics.renderTime.filter(item => item.duration > 16.67)
        };
    }
}

// 创建性能监控实例
const perfMonitor = new PerformanceMonitor();

// 显示性能信息
const perfDisplay = document.createElement('div');
perfDisplay.style.cssText = `
    position: fixed;
    top: 10px;
    left: 10px;
    background: rgba(0, 0, 0, 0.8);
    color: lime;
    padding: 10px;
    font-family: monospace;
    font-size: 12px;
    z-index: 9999;
`;
document.body.appendChild(perfDisplay);

setInterval(() => {
    const report = perfMonitor.getReport();
    perfDisplay.innerHTML = `
        FPS: ${report.fps}<br>
        Memory: ${report.memory.used || 'N/A'} MB<br>
        Avg Render: ${report.avgRenderTime}ms<br>
        Slow Renders: ${report.slowRenders.length}
    `;
}, 1000);

// ============================================
// 工具函数
// ============================================

function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// 导出优化工具
module.exports = {
    PerformanceTracker,
    VirtualScroller,
    LazyRenderer,
    StyleBatcher,
    ReflowOptimizer,
    OptimizedEventDelegation,
    LazyLoadManager,
    MemoryManager,
    PerformanceMonitor
};