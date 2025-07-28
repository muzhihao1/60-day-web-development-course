---
title: "Console高级调试技巧"
description: "超越console.log的高级调试方法"
category: "debugging"
language: "javascript"
---

## Console API完整指南

### 1. 日志分组和格式化

```javascript
// 基础分组
console.group('用户操作流程');
console.log('1. 用户点击登录按钮');
console.log('2. 验证表单数据');
console.group('API请求');
console.log('3. 发送登录请求');
console.log('4. 接收响应数据');
console.groupEnd();
console.log('5. 更新UI状态');
console.groupEnd();

// 折叠分组
console.groupCollapsed('详细调试信息');
console.log('时间戳:', Date.now());
console.log('用户代理:', navigator.userAgent);
console.log('窗口大小:', window.innerWidth, 'x', window.innerHeight);
console.groupEnd();
```

### 2. 表格显示复杂数据

```javascript
// 显示用户数据表格
const users = [
    { id: 1, name: '张三', age: 25, role: 'admin', lastLogin: '2024-01-15' },
    { id: 2, name: '李四', age: 30, role: 'user', lastLogin: '2024-01-14' },
    { id: 3, name: '王五', age: 28, role: 'user', lastLogin: '2024-01-13' }
];

console.table(users);
// 只显示特定列
console.table(users, ['name', 'role']);

// 显示对象的属性
const product = {
    id: 'PRD001',
    name: 'MacBook Pro',
    price: 12999,
    specs: {
        cpu: 'M1 Pro',
        ram: '16GB',
        storage: '512GB'
    }
};
console.table(product);
```

### 3. 样式化输出

```javascript
// 基础样式
console.log('%c成功消息', 'color: green; font-size: 16px; font-weight: bold;');
console.log('%c警告信息', 'color: orange; font-size: 16px; background: #fff3cd; padding: 5px;');
console.log('%c错误信息', 'color: white; background: red; font-size: 20px; padding: 10px;');

// 多样式组合
console.log(
    '%c前端%c开发%c工具',
    'color: #e91e63; font-size: 20px;',
    'color: #2196f3; font-size: 20px;',
    'color: #4caf50; font-size: 20px;'
);

// ASCII艺术
console.log(`%c
 ____              _____           _     
|  _ \\  _____   __|_   _|__   ___ | |___ 
| | | |/ _ \\ \\ / /  | |/ _ \\ / _ \\| / __|
| |_| |  __/\\ V /   | | (_) | (_) | \\__ \\
|____/ \\___| \\_/    |_|\\___/ \\___/|_|___/
`, 'color: #2196f3; font-family: monospace;');
```

### 4. 性能计时

```javascript
// 简单计时
console.time('数据处理');
// 模拟数据处理
const data = Array(1000000).fill(0).map((_, i) => ({
    id: i,
    value: Math.random()
}));
console.timeEnd('数据处理');

// 多个计时器
console.time('总耗时');
console.time('步骤1');
// 步骤1代码
console.timeEnd('步骤1');

console.time('步骤2');
// 步骤2代码
console.timeEnd('步骤2');
console.timeEnd('总耗时');

// 使用timeLog查看中间时间
console.time('长任务');
setTimeout(() => {
    console.timeLog('长任务', '第一阶段完成');
    setTimeout(() => {
        console.timeLog('长任务', '第二阶段完成');
        console.timeEnd('长任务');
    }, 1000);
}, 1000);
```

### 5. 条件日志和断言

```javascript
// console.assert - 只在条件为假时输出
const userAge = 15;
console.assert(userAge >= 18, '用户年龄不满18岁', { age: userAge });

// 函数参数验证
function calculateDiscount(price, discount) {
    console.assert(typeof price === 'number', 'Price must be a number');
    console.assert(discount >= 0 && discount <= 1, 'Discount must be between 0 and 1');
    
    return price * (1 - discount);
}

// 测试断言
const result = calculateDiscount(100, 1.5); // 将触发断言
```

### 6. 计数器使用

```javascript
// 基础计数
function processItem(item) {
    console.count('处理项目');
    // 处理逻辑
}

[1, 2, 3, 4, 5].forEach(processItem);
console.countReset('处理项目'); // 重置计数器

// 分类计数
function handleEvent(event) {
    console.count(`事件类型: ${event.type}`);
    
    switch(event.type) {
        case 'click':
            console.count('鼠标事件');
            break;
        case 'keydown':
        case 'keyup':
            console.count('键盘事件');
            break;
    }
}
```

### 7. 堆栈跟踪

```javascript
// console.trace - 显示调用堆栈
function functionA() {
    functionB();
}

function functionB() {
    functionC();
}

function functionC() {
    console.trace('调用堆栈追踪');
}

functionA();

// 错误追踪
try {
    throw new Error('自定义错误');
} catch (error) {
    console.error('捕获错误:', error);
    console.trace('错误发生位置');
}
```

### 8. 内存和性能分析

```javascript
// 内存使用情况
if (performance.memory) {
    console.table({
        '总堆大小': `${(performance.memory.totalJSHeapSize / 1048576).toFixed(2)} MB`,
        '已用堆大小': `${(performance.memory.usedJSHeapSize / 1048576).toFixed(2)} MB`,
        '堆大小限制': `${(performance.memory.jsHeapSizeLimit / 1048576).toFixed(2)} MB`
    });
}

// 性能标记
performance.mark('myOperation-start');
// 执行操作
performance.mark('myOperation-end');
performance.measure('myOperation', 'myOperation-start', 'myOperation-end');

const measure = performance.getEntriesByName('myOperation')[0];
console.log(`操作耗时: ${measure.duration.toFixed(2)}ms`);
```

### 9. 对象和DOM检查

```javascript
// console.dir - 显示对象的所有属性
const element = document.querySelector('body');
console.log(element); // 显示DOM元素
console.dir(element); // 显示JavaScript对象视图

// console.dirxml - XML格式显示
console.dirxml(document.body);

// 显示对象的原型链
function Person(name) {
    this.name = name;
}
Person.prototype.greet = function() {
    return `Hello, I'm ${this.name}`;
};

const person = new Person('Alice');
console.dir(person);
```

### 10. 自定义Console方法

```javascript
// 创建自定义logger
class Logger {
    constructor(prefix) {
        this.prefix = prefix;
        this.startTime = Date.now();
    }
    
    log(...args) {
        const timestamp = new Date().toISOString();
        const elapsed = Date.now() - this.startTime;
        console.log(
            `%c[${this.prefix}]%c [${timestamp}] [+${elapsed}ms]`,
            'color: #2196f3; font-weight: bold;',
            'color: #666;',
            ...args
        );
    }
    
    error(...args) {
        console.error(`[${this.prefix}]`, ...args);
    }
    
    table(data, columns) {
        console.group(`[${this.prefix}] Table`);
        console.table(data, columns);
        console.groupEnd();
    }
    
    time(label) {
        console.time(`[${this.prefix}] ${label}`);
    }
    
    timeEnd(label) {
        console.timeEnd(`[${this.prefix}] ${label}`);
    }
}

// 使用自定义logger
const apiLogger = new Logger('API');
apiLogger.log('发送请求到 /api/users');
apiLogger.time('请求耗时');

setTimeout(() => {
    apiLogger.log('收到响应');
    apiLogger.table([
        { status: 200, time: '125ms', size: '2.3KB' }
    ]);
    apiLogger.timeEnd('请求耗时');
}, 1000);
```

### 11. Console实用工具函数

```javascript
// 监控对象变化
function watchObject(obj, name) {
    const handler = {
        get(target, prop) {
            console.log(`%c[读取] ${name}.${prop}`, 'color: green');
            return target[prop];
        },
        set(target, prop, value) {
            console.log(`%c[设置] ${name}.${prop} = ${value}`, 'color: blue');
            target[prop] = value;
            return true;
        },
        deleteProperty(target, prop) {
            console.log(`%c[删除] ${name}.${prop}`, 'color: red');
            delete target[prop];
            return true;
        }
    };
    
    return new Proxy(obj, handler);
}

// 使用示例
const user = watchObject({ name: 'Alice', age: 25 }, 'user');
user.name = 'Bob'; // 触发set日志
const age = user.age; // 触发get日志
delete user.age; // 触发delete日志

// 性能测试工具
function benchmark(name, fn, iterations = 1000) {
    console.group(`⚡ Benchmark: ${name}`);
    
    const results = [];
    
    for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        fn();
        const end = performance.now();
        results.push(end - start);
    }
    
    const avg = results.reduce((a, b) => a + b) / results.length;
    const min = Math.min(...results);
    const max = Math.max(...results);
    
    console.table({
        '平均耗时': `${avg.toFixed(3)}ms`,
        '最小耗时': `${min.toFixed(3)}ms`,
        '最大耗时': `${max.toFixed(3)}ms`,
        '总耗时': `${results.reduce((a, b) => a + b).toFixed(3)}ms`,
        '迭代次数': iterations
    });
    
    console.groupEnd();
}

// 测试示例
benchmark('数组操作', () => {
    const arr = Array(1000).fill(0).map((_, i) => i);
    const filtered = arr.filter(n => n % 2 === 0);
    const mapped = filtered.map(n => n * 2);
});
```

### 12. DevTools专用命令

```javascript
// 这些命令只在DevTools Console中可用

// $0 - $4: 最近选中的元素
// $0 // 当前选中的元素
// $1 // 上一个选中的元素

// $_: 上一个表达式的结果
// 2 + 2
// $_ * 3 // 12

// $(selector): document.querySelector的别名
// $('body')

// $$(selector): document.querySelectorAll的别名
// $$('.class-name')

// $x(xpath): XPath查询
// $x('//div[@class="container"]')

// clear(): 清空控制台
// clear()

// copy(object): 复制到剪贴板
// copy({name: 'test', value: 123})

// getEventListeners(element): 获取元素的事件监听器
// getEventListeners(document.body)

// monitor(function): 监控函数调用
// function test() { console.log('called'); }
// monitor(test)
// test() // 会显示函数被调用的信息

// monitorEvents(element, events): 监控元素事件
// monitorEvents(window, ['resize', 'scroll'])
// unmonitorEvents(window) // 停止监控

// profile/profileEnd: CPU分析
// profile('MyProfile')
// // 执行一些代码
// profileEnd('MyProfile')

// queryObjects(Constructor): 查找所有实例
// queryObjects(Promise) // 查找所有Promise实例
```

这些Console高级技巧能帮助你更高效地调试JavaScript代码，提升开发效率！