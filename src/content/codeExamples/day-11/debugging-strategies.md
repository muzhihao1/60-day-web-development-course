---
day: 11
title: "高级调试策略"
description: "断点类型、条件调试、异步调试等高级技巧"
category: "debugging"
language: "javascript"
---

## 断点调试完全指南

### 1. 各类断点详解

```javascript
// 1. 行断点 - 最基础的断点类型
function calculatePrice(quantity, unitPrice, discount = 0) {
    // 在此行设置断点（点击行号）
    const subtotal = quantity * unitPrice;
    const discountAmount = subtotal * discount;
    const total = subtotal - discountAmount;
    return total;
}

// 2. 条件断点 - 只在特定条件下暂停
function processOrder(order) {
    // 右键行号 -> Add conditional breakpoint
    // 条件: order.total > 1000
    console.log(`Processing order ${order.id}`);
    
    if (order.items.length === 0) {
        throw new Error('Order has no items');
    }
    
    return order;
}

// 3. 日志断点 - 不暂停执行，只记录日志
function trackUserAction(action) {
    // 右键行号 -> Add logpoint
    // 日志: "Action:", action.type, "at", new Date().toISOString()
    
    analytics.track(action);
}

// 4. 异常断点
function riskyOperation() {
    try {
        // 可能抛出异常的代码
        JSON.parse('invalid json');
    } catch (e) {
        // Sources -> Pause on exceptions
        console.error('Operation failed:', e);
    }
}
```

### 2. DOM断点设置

```javascript
// DOM变化断点示例
class DOMDebugger {
    // 监控子树修改
    watchSubtreeModifications(element) {
        // Elements面板 -> 右键元素 -> Break on -> Subtree modifications
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                console.log('DOM变化:', mutation);
            });
        });
        
        observer.observe(element, {
            childList: true,
            subtree: true
        });
        
        return observer;
    }
    
    // 监控属性修改
    watchAttributeModifications(element) {
        // Elements面板 -> 右键元素 -> Break on -> Attribute modifications
        const originalSetAttribute = element.setAttribute;
        
        element.setAttribute = function(name, value) {
            debugger; // 手动断点
            console.log(`属性修改: ${name} = ${value}`);
            originalSetAttribute.call(this, name, value);
        };
    }
    
    // 监控节点移除
    watchNodeRemoval(element) {
        // Elements面板 -> 右键元素 -> Break on -> Node removal
        const parent = element.parentNode;
        const originalRemoveChild = parent.removeChild;
        
        parent.removeChild = function(child) {
            if (child === element) {
                debugger;
                console.log('节点被移除');
            }
            return originalRemoveChild.call(this, child);
        };
    }
}
```

### 3. XHR/Fetch断点

```javascript
// 网络请求断点
class NetworkDebugger {
    // Sources -> XHR/fetch Breakpoints -> Add breakpoint
    // URL包含: /api/
    
    async fetchWithDebug(url, options = {}) {
        console.log(`请求开始: ${url}`);
        
        try {
            const response = await fetch(url, options);
            
            if (!response.ok) {
                // 在此处会触发断点
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log(`请求成功:`, data);
            
            return data;
        } catch (error) {
            console.error(`请求失败:`, error);
            throw error;
        }
    }
    
    // 拦截所有fetch请求
    interceptFetch() {
        const originalFetch = window.fetch;
        
        window.fetch = async function(...args) {
            const [url, options] = args;
            
            // 条件断点
            if (url.includes('/user/')) {
                debugger;
            }
            
            console.log('Fetch请求:', url, options);
            
            try {
                const response = await originalFetch.apply(this, args);
                console.log('Fetch响应:', response.status);
                return response;
            } catch (error) {
                console.error('Fetch错误:', error);
                throw error;
            }
        };
    }
}
```

### 4. 事件监听器断点

```javascript
// 事件断点示例
class EventDebugger {
    // Sources -> Event Listener Breakpoints
    
    setupEventDebugging() {
        // 监控所有点击事件
        document.addEventListener('click', (e) => {
            // 会在任何点击时触发断点
            console.log('点击事件:', e.target);
        }, true);
        
        // 自定义事件调试
        const originalAddEventListener = EventTarget.prototype.addEventListener;
        
        EventTarget.prototype.addEventListener = function(type, listener, options) {
            // 记录所有事件监听器
            console.log(`添加事件监听器: ${type} on`, this);
            
            // 包装监听器函数
            const wrappedListener = function(event) {
                if (type === 'submit' || type === 'change') {
                    debugger; // 特定事件类型断点
                }
                
                return listener.call(this, event);
            };
            
            return originalAddEventListener.call(this, type, wrappedListener, options);
        };
    }
}
```

### 5. 异步代码调试

```javascript
// 异步调试技巧
class AsyncDebugger {
    // 启用异步堆栈跟踪
    // DevTools Settings -> Enable async stack traces
    
    // Promise调试
    async debugPromiseChain() {
        try {
            // 第一步
            const user = await this.fetchUser()
                .catch(e => {
                    debugger; // Promise rejection断点
                    throw e;
                });
            
            // 第二步
            const profile = await this.fetchProfile(user.id);
            
            // 第三步
            const posts = await this.fetchPosts(user.id);
            
            return { user, profile, posts };
        } catch (error) {
            // 异步错误处理
            console.error('异步操作失败:', error);
            // 查看完整的异步调用栈
            console.trace();
        }
    }
    
    // 异步函数包装器
    wrapAsync(fn, name) {
        return async function(...args) {
            console.log(`[${name}] 开始执行`);
            const startTime = performance.now();
            
            try {
                const result = await fn.apply(this, args);
                const duration = performance.now() - startTime;
                console.log(`[${name}] 成功完成 (${duration.toFixed(2)}ms)`);
                return result;
            } catch (error) {
                const duration = performance.now() - startTime;
                console.error(`[${name}] 失败 (${duration.toFixed(2)}ms)`, error);
                throw error;
            }
        };
    }
    
    // setTimeout/setInterval调试
    debugTimers() {
        const originalSetTimeout = window.setTimeout;
        const originalSetInterval = window.setInterval;
        
        window.setTimeout = function(callback, delay, ...args) {
            const stack = new Error().stack;
            
            const wrappedCallback = function() {
                console.log(`setTimeout回调执行 (延迟: ${delay}ms)`);
                console.log('调用栈:', stack);
                return callback.apply(this, args);
            };
            
            return originalSetTimeout(wrappedCallback, delay);
        };
        
        window.setInterval = function(callback, interval, ...args) {
            let count = 0;
            
            const wrappedCallback = function() {
                count++;
                console.log(`setInterval回调执行 (第${count}次, 间隔: ${interval}ms)`);
                return callback.apply(this, args);
            };
            
            return originalSetInterval(wrappedCallback, interval);
        };
    }
}
```

### 6. 调试工具类

```javascript
// 实用调试工具
class DebugUtils {
    // 变量监视器
    static watch(obj, prop, handler) {
        let value = obj[prop];
        
        Object.defineProperty(obj, prop, {
            get() {
                handler('get', prop, value);
                return value;
            },
            set(newValue) {
                const oldValue = value;
                value = newValue;
                handler('set', prop, newValue, oldValue);
                return true;
            }
        });
    }
    
    // 函数执行跟踪
    static trace(obj, methods) {
        methods.forEach(method => {
            const original = obj[method];
            
            obj[method] = function(...args) {
                console.group(`${method} called`);
                console.log('Arguments:', args);
                console.log('This:', this);
                console.trace('Call stack');
                
                const result = original.apply(this, args);
                
                console.log('Return value:', result);
                console.groupEnd();
                
                return result;
            };
        });
    }
    
    // 性能监控装饰器
    static perfMonitor(target, propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        
        descriptor.value = async function(...args) {
            const start = performance.now();
            const startMemory = performance.memory?.usedJSHeapSize;
            
            try {
                const result = await originalMethod.apply(this, args);
                
                const duration = performance.now() - start;
                const memoryDelta = performance.memory ? 
                    performance.memory.usedJSHeapSize - startMemory : 0;
                
                console.log(`${propertyKey} 性能:`, {
                    duration: `${duration.toFixed(2)}ms`,
                    memoryDelta: `${(memoryDelta / 1024).toFixed(2)}KB`
                });
                
                return result;
            } catch (error) {
                console.error(`${propertyKey} 错误:`, error);
                throw error;
            }
        };
        
        return descriptor;
    }
}

// 使用示例
class UserService {
    constructor() {
        this.cache = {};
        
        // 监视缓存变化
        DebugUtils.watch(this.cache, 'users', (action, prop, value, oldValue) => {
            console.log(`Cache ${action}: ${prop}`, { value, oldValue });
        });
        
        // 跟踪方法调用
        DebugUtils.trace(this, ['getUser', 'updateUser']);
    }
    
    @DebugUtils.perfMonitor
    async getUser(id) {
        if (this.cache.users?.[id]) {
            return this.cache.users[id];
        }
        
        const user = await fetch(`/api/users/${id}`).then(r => r.json());
        
        if (!this.cache.users) {
            this.cache.users = {};
        }
        this.cache.users[id] = user;
        
        return user;
    }
    
    async updateUser(id, data) {
        // 更新逻辑
    }
}
```

### 7. 远程调试配置

```javascript
// 远程调试设置
class RemoteDebugger {
    // Chrome远程调试
    static setupChromeRemoteDebugging() {
        // 启动Chrome with debugging
        // chrome --remote-debugging-port=9222
        
        // 连接到调试端口
        const debuggerUrl = 'http://localhost:9222/json';
        
        fetch(debuggerUrl)
            .then(res => res.json())
            .then(tabs => {
                console.log('可调试的标签页:', tabs);
                // 选择要调试的标签页
                const targetTab = tabs[0];
                console.log('调试URL:', targetTab.webSocketDebuggerUrl);
            });
    }
    
    // 移动端调试
    static setupMobileDebugging() {
        // Android Chrome调试
        // 1. 启用开发者选项和USB调试
        // 2. chrome://inspect/#devices
        
        // iOS Safari调试
        // 1. 启用Safari开发菜单
        // 2. iOS设置 -> Safari -> 高级 -> Web检查器
        
        // 模拟移动环境
        if ('ontouchstart' in window) {
            console.log('Touch device detected');
            
            document.addEventListener('touchstart', (e) => {
                console.log('Touch start:', e.touches);
            });
        }
    }
}
```

### 8. 生产环境调试

```javascript
// 生产环境安全调试
class ProductionDebugger {
    static init() {
        // 只在特定条件下启用调试
        const debugEnabled = 
            localStorage.getItem('debug') === 'true' ||
            window.location.hash === '#debug';
        
        if (!debugEnabled) {
            // 禁用console
            ['log', 'debug', 'info', 'warn', 'error'].forEach(method => {
                console[method] = () => {};
            });
            return;
        }
        
        // 创建调试面板
        this.createDebugPanel();
        
        // 错误监控
        this.setupErrorMonitoring();
        
        // 性能监控
        this.setupPerformanceMonitoring();
    }
    
    static createDebugPanel() {
        const panel = document.createElement('div');
        panel.id = 'debug-panel';
        panel.style.cssText = `
            position: fixed;
            bottom: 10px;
            right: 10px;
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 10px;
            border-radius: 5px;
            font-family: monospace;
            font-size: 12px;
            z-index: 10000;
        `;
        
        panel.innerHTML = `
            <div>Debug Mode: ON</div>
            <div>Errors: <span id="error-count">0</span></div>
            <div>FPS: <span id="fps">0</span></div>
            <div>Memory: <span id="memory">0</span>MB</div>
        `;
        
        document.body.appendChild(panel);
    }
    
    static setupErrorMonitoring() {
        let errorCount = 0;
        
        window.addEventListener('error', (event) => {
            errorCount++;
            document.getElementById('error-count').textContent = errorCount;
            
            console.error('Global error:', {
                message: event.message,
                source: event.filename,
                line: event.lineno,
                column: event.colno,
                error: event.error
            });
        });
        
        window.addEventListener('unhandledrejection', (event) => {
            errorCount++;
            document.getElementById('error-count').textContent = errorCount;
            
            console.error('Unhandled promise rejection:', event.reason);
        });
    }
    
    static setupPerformanceMonitoring() {
        // FPS监控
        let lastTime = performance.now();
        let frames = 0;
        
        function measureFPS() {
            frames++;
            const currentTime = performance.now();
            
            if (currentTime >= lastTime + 1000) {
                const fps = Math.round((frames * 1000) / (currentTime - lastTime));
                document.getElementById('fps').textContent = fps;
                frames = 0;
                lastTime = currentTime;
            }
            
            requestAnimationFrame(measureFPS);
        }
        
        measureFPS();
        
        // 内存监控
        if (performance.memory) {
            setInterval(() => {
                const memory = (performance.memory.usedJSHeapSize / 1048576).toFixed(1);
                document.getElementById('memory').textContent = memory;
            }, 1000);
        }
    }
}

// 初始化生产环境调试
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ProductionDebugger.init());
} else {
    ProductionDebugger.init();
}
```

这些调试策略和技巧能帮助你快速定位和解决各种复杂的问题！