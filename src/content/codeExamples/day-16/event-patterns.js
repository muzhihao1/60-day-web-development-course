// 事件处理模式 - Day 16

// ============================================
// 1. 基础事件处理
// ============================================

console.log('=== 基础事件处理 ===\n');

// 创建测试元素
document.body.innerHTML = `
    <div class="demo-container">
        <h2>事件处理示例</h2>
        
        <!-- 基础事件示例 -->
        <section class="basic-events">
            <h3>基础事件</h3>
            <button id="clickBtn">点击我</button>
            <input id="textInput" type="text" placeholder="输入文本">
            <div id="hoverBox" style="width: 200px; height: 100px; background: #f0f0f0; margin: 10px 0;">
                鼠标悬停区域
            </div>
        </section>
        
        <!-- 事件委托示例 -->
        <section class="event-delegation">
            <h3>事件委托</h3>
            <ul id="taskList">
                <li data-id="1">任务 1 <button class="delete">删除</button></li>
                <li data-id="2">任务 2 <button class="delete">删除</button></li>
                <li data-id="3">任务 3 <button class="delete">删除</button></li>
            </ul>
            <button id="addTask">添加任务</button>
        </section>
        
        <!-- 自定义事件示例 -->
        <section class="custom-events">
            <h3>自定义事件</h3>
            <div id="notificationArea"></div>
            <button id="triggerNotification">触发通知</button>
        </section>
        
        <!-- 表单事件示例 -->
        <section class="form-events">
            <h3>表单事件</h3>
            <form id="demoForm">
                <input name="username" type="text" placeholder="用户名" required>
                <input name="email" type="email" placeholder="邮箱" required>
                <button type="submit">提交</button>
            </form>
        </section>
    </div>
`;

// ============================================
// 2. 事件处理的不同方式
// ============================================

const clickBtn = document.getElementById('clickBtn');

// 方式1: addEventListener (推荐)
clickBtn.addEventListener('click', function(event) {
    console.log('点击事件 (addEventListener)');
});

// 方式2: 可以添加多个监听器
clickBtn.addEventListener('click', (event) => {
    console.log('第二个点击监听器');
});

// 方式3: 带选项的监听器
clickBtn.addEventListener('click', function handler(event) {
    console.log('只触发一次的监听器');
}, { once: true });

// ============================================
// 3. 事件对象的使用
// ============================================

const textInput = document.getElementById('textInput');

// 键盘事件
textInput.addEventListener('keydown', (event) => {
    console.log('按下键:', event.key);
    
    // 检测特殊键
    if (event.key === 'Enter') {
        console.log('按下了Enter键');
    }
    
    // 检测组合键
    if (event.ctrlKey && event.key === 's') {
        event.preventDefault(); // 阻止默认保存行为
        console.log('Ctrl+S 被按下');
    }
});

// 输入事件
textInput.addEventListener('input', (event) => {
    console.log('输入值:', event.target.value);
});

// 焦点事件
textInput.addEventListener('focus', () => console.log('获得焦点'));
textInput.addEventListener('blur', () => console.log('失去焦点'));

// ============================================
// 4. 鼠标事件处理
// ============================================

const hoverBox = document.getElementById('hoverBox');
let mouseEventCount = 0;

// 鼠标事件序列
hoverBox.addEventListener('mouseenter', () => {
    hoverBox.style.background = '#e0e0e0';
    console.log('鼠标进入');
});

hoverBox.addEventListener('mouseleave', () => {
    hoverBox.style.background = '#f0f0f0';
    console.log('鼠标离开');
});

hoverBox.addEventListener('mousemove', throttle((event) => {
    const rect = hoverBox.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    hoverBox.textContent = `坐标: ${Math.round(x)}, ${Math.round(y)}`;
}, 50));

// 右键菜单
hoverBox.addEventListener('contextmenu', (event) => {
    event.preventDefault();
    console.log('右键菜单被阻止');
});

// ============================================
// 5. 事件委托模式
// ============================================

const taskList = document.getElementById('taskList');
const addTaskBtn = document.getElementById('addTask');
let taskId = 4;

// 使用事件委托处理所有删除按钮
taskList.addEventListener('click', (event) => {
    // 检查是否点击了删除按钮
    if (event.target.classList.contains('delete')) {
        const li = event.target.closest('li');
        if (li) {
            const id = li.dataset.id;
            console.log(`删除任务 ${id}`);
            li.remove();
        }
    }
});

// 添加新任务
addTaskBtn.addEventListener('click', () => {
    const li = document.createElement('li');
    li.dataset.id = taskId;
    li.innerHTML = `任务 ${taskId} <button class="delete">删除</button>`;
    taskList.appendChild(li);
    taskId++;
    console.log('添加新任务');
});

// ============================================
// 6. 自定义事件
// ============================================

const notificationArea = document.getElementById('notificationArea');
const triggerBtn = document.getElementById('triggerNotification');

// 监听自定义事件
notificationArea.addEventListener('notification', (event) => {
    const { type, message, timestamp } = event.detail;
    
    const notification = document.createElement('div');
    notification.style.cssText = `
        padding: 10px;
        margin: 5px 0;
        background: ${type === 'success' ? '#4CAF50' : '#f44336'};
        color: white;
        border-radius: 4px;
    `;
    notification.textContent = `[${new Date(timestamp).toLocaleTimeString()}] ${message}`;
    
    notificationArea.appendChild(notification);
    
    // 3秒后自动移除
    setTimeout(() => notification.remove(), 3000);
});

// 触发自定义事件
triggerBtn.addEventListener('click', () => {
    const event = new CustomEvent('notification', {
        detail: {
            type: Math.random() > 0.5 ? 'success' : 'error',
            message: '这是一条自定义事件消息',
            timestamp: Date.now()
        },
        bubbles: true,
        cancelable: true
    });
    
    notificationArea.dispatchEvent(event);
});

// ============================================
// 7. 表单事件处理
// ============================================

const demoForm = document.getElementById('demoForm');

// 表单提交事件
demoForm.addEventListener('submit', (event) => {
    event.preventDefault(); // 阻止默认提交
    
    const formData = new FormData(demoForm);
    const data = Object.fromEntries(formData);
    
    console.log('表单数据:', data);
    
    // 模拟提交
    showNotification('表单提交成功！', 'success');
    demoForm.reset();
});

// 实时验证
demoForm.addEventListener('input', (event) => {
    const input = event.target;
    
    if (input.name === 'email') {
        const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value);
        input.style.borderColor = isValid ? 'green' : 'red';
    }
});

// ============================================
// 8. 事件传播控制
// ============================================

console.log('\n=== 事件传播控制 ===\n');

// 创建嵌套结构演示事件传播
const propagationDemo = document.createElement('div');
propagationDemo.innerHTML = `
    <div id="outer" style="padding: 20px; background: #f0f0f0;">
        外层
        <div id="middle" style="padding: 20px; background: #e0e0e0;">
            中层
            <div id="inner" style="padding: 20px; background: #d0d0d0;">
                内层
                <button id="propagationBtn">点击测试传播</button>
            </div>
        </div>
    </div>
`;
document.body.appendChild(propagationDemo);

// 捕获阶段
document.getElementById('outer').addEventListener('click', () => {
    console.log('外层 (捕获阶段)');
}, true);

document.getElementById('middle').addEventListener('click', () => {
    console.log('中层 (捕获阶段)');
}, true);

// 冒泡阶段
document.getElementById('outer').addEventListener('click', () => {
    console.log('外层 (冒泡阶段)');
});

document.getElementById('middle').addEventListener('click', () => {
    console.log('中层 (冒泡阶段)');
});

document.getElementById('inner').addEventListener('click', () => {
    console.log('内层 (冒泡阶段)');
});

// 阻止传播示例
document.getElementById('propagationBtn').addEventListener('click', (event) => {
    console.log('按钮被点击');
    // event.stopPropagation(); // 取消注释以阻止事件传播
});

// ============================================
// 9. 高级事件模式
// ============================================

// 事件代理类
class EventProxy {
    constructor(element) {
        this.element = element;
        this.handlers = new Map();
        this.element.addEventListener('click', this.handleClick.bind(this));
    }
    
    on(selector, eventType, handler) {
        const key = `${selector}:${eventType}`;
        if (!this.handlers.has(key)) {
            this.handlers.set(key, new Set());
        }
        this.handlers.get(key).add(handler);
    }
    
    off(selector, eventType, handler) {
        const key = `${selector}:${eventType}`;
        const handlers = this.handlers.get(key);
        if (handlers) {
            handlers.delete(handler);
        }
    }
    
    handleClick(event) {
        for (const [key, handlers] of this.handlers) {
            const [selector, eventType] = key.split(':');
            if (eventType === 'click') {
                const target = event.target.closest(selector);
                if (target && this.element.contains(target)) {
                    handlers.forEach(handler => handler.call(target, event));
                }
            }
        }
    }
}

// 使用事件代理
const proxy = new EventProxy(document.body);
proxy.on('.delete', 'click', function(event) {
    console.log('通过代理删除:', this);
});

// ============================================
// 10. 性能优化：防抖和节流
// ============================================

// 防抖函数
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 节流函数
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

// 示例：搜索输入防抖
const searchInput = document.createElement('input');
searchInput.placeholder = '搜索（防抖）';
document.body.appendChild(searchInput);

const debouncedSearch = debounce((value) => {
    console.log('搜索:', value);
}, 500);

searchInput.addEventListener('input', (event) => {
    debouncedSearch(event.target.value);
});

// 示例：滚动事件节流
const scrollInfo = document.createElement('div');
scrollInfo.style.cssText = 'position: fixed; top: 10px; right: 10px; background: white; padding: 10px;';
scrollInfo.textContent = '滚动位置: 0';
document.body.appendChild(scrollInfo);

const throttledScroll = throttle(() => {
    scrollInfo.textContent = `滚动位置: ${window.scrollY}`;
}, 100);

window.addEventListener('scroll', throttledScroll);

// ============================================
// 11. 移动端事件处理
// ============================================

console.log('\n=== 移动端事件 ===\n');

// 触摸事件处理
const touchArea = document.createElement('div');
touchArea.style.cssText = `
    width: 300px;
    height: 200px;
    background: #e3f2fd;
    margin: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    user-select: none;
`;
touchArea.textContent = '触摸区域';
document.body.appendChild(touchArea);

let touchStartX = 0;
let touchStartY = 0;

touchArea.addEventListener('touchstart', (event) => {
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
    touchArea.style.background = '#bbdefb';
});

touchArea.addEventListener('touchmove', (event) => {
    event.preventDefault(); // 阻止滚动
    const touch = event.touches[0];
    const deltaX = touch.clientX - touchStartX;
    const deltaY = touch.clientY - touchStartY;
    touchArea.textContent = `移动: ${Math.round(deltaX)}, ${Math.round(deltaY)}`;
});

touchArea.addEventListener('touchend', () => {
    touchArea.style.background = '#e3f2fd';
    touchArea.textContent = '触摸结束';
});

// ============================================
// 12. 事件性能监控
// ============================================

class EventPerformanceMonitor {
    constructor() {
        this.metrics = new Map();
    }
    
    wrap(eventName, handler) {
        return (...args) => {
            const start = performance.now();
            const result = handler(...args);
            const duration = performance.now() - start;
            
            if (!this.metrics.has(eventName)) {
                this.metrics.set(eventName, []);
            }
            this.metrics.get(eventName).push(duration);
            
            if (duration > 16) { // 超过一帧的时间
                console.warn(`事件处理器 "${eventName}" 执行时间过长: ${duration.toFixed(2)}ms`);
            }
            
            return result;
        };
    }
    
    getStats(eventName) {
        const times = this.metrics.get(eventName) || [];
        if (times.length === 0) return null;
        
        const avg = times.reduce((a, b) => a + b, 0) / times.length;
        const max = Math.max(...times);
        const min = Math.min(...times);
        
        return { avg, max, min, count: times.length };
    }
}

// 使用性能监控
const monitor = new EventPerformanceMonitor();

const heavyHandler = monitor.wrap('heavyClick', (event) => {
    // 模拟繁重操作
    let sum = 0;
    for (let i = 0; i < 1000000; i++) {
        sum += Math.random();
    }
    console.log('繁重操作完成');
});

const perfTestBtn = document.createElement('button');
perfTestBtn.textContent = '性能测试按钮';
perfTestBtn.addEventListener('click', heavyHandler);
document.body.appendChild(perfTestBtn);

// 显示性能统计
setTimeout(() => {
    const stats = monitor.getStats('heavyClick');
    if (stats) {
        console.log('性能统计:', stats);
    }
}, 5000);

// ============================================
// 工具函数
// ============================================

function showNotification(message, type = 'info') {
    const notification = new CustomEvent('notification', {
        detail: { message, type, timestamp: Date.now() },
        bubbles: true
    });
    document.getElementById('notificationArea').dispatchEvent(notification);
}

// 导出事件工具
module.exports = {
    EventProxy,
    EventPerformanceMonitor,
    debounce,
    throttle
};