// 纯函数示例 - Day 14

// ============================================
// 1. 纯函数基础
// ============================================

// ✅ 纯函数 - 相同输入总是产生相同输出，没有副作用
const add = (a, b) => a + b;
const multiply = (a, b) => a * b;
const square = (x) => x * x;
const toUpperCase = (str) => str.toUpperCase();
const getLength = (arr) => arr.length;

// 测试纯函数的特性
console.log('纯函数测试:');
console.log(add(2, 3)); // 5
console.log(add(2, 3)); // 5 (相同输入，相同输出)
console.log(multiply(4, 5)); // 20
console.log(toUpperCase('hello')); // 'HELLO'

// ❌ 非纯函数示例
let counter = 0;
const incrementCounter = () => {
    counter++; // 修改外部状态（副作用）
    return counter;
};

const getRandomNumber = () => Math.random(); // 每次返回不同结果

const logAndReturn = (value) => {
    console.log(value); // I/O操作（副作用）
    return value;
};

// ============================================
// 2. 纯函数的实际应用
// ============================================

// 购物车相关的纯函数
const calculateSubtotal = (items) => {
    return items.reduce((total, item) => 
        total + (item.price * item.quantity), 0
    );
};

const calculateTax = (subtotal, taxRate) => subtotal * taxRate;

const calculateDiscount = (subtotal, discountRate) => subtotal * discountRate;

const calculateTotal = (subtotal, tax, discount) => 
    subtotal + tax - discount;

// 使用纯函数组合计算
const items = [
    { name: '笔记本', price: 5000, quantity: 1 },
    { name: '鼠标', price: 100, quantity: 2 },
    { name: '键盘', price: 300, quantity: 1 }
];

const subtotal = calculateSubtotal(items);
const tax = calculateTax(subtotal, 0.1); // 10%税率
const discount = calculateDiscount(subtotal, 0.05); // 5%折扣
const total = calculateTotal(subtotal, tax, discount);

console.log('\n购物车计算:');
console.log(`小计: ￥${subtotal}`);
console.log(`税费: ￥${tax}`);
console.log(`折扣: ￥${discount}`);
console.log(`总计: ￥${total}`);

// ============================================
// 3. 纯函数的优势：可测试性
// ============================================

// 简单的测试框架
const test = (description, fn) => {
    try {
        fn();
        console.log(`✅ ${description}`);
    } catch (error) {
        console.log(`❌ ${description}: ${error.message}`);
    }
};

const assert = (condition, message) => {
    if (!condition) {
        throw new Error(message || 'Assertion failed');
    }
};

// 测试纯函数
console.log('\n测试纯函数:');
test('add函数应该正确计算和', () => {
    assert(add(2, 3) === 5);
    assert(add(-1, 1) === 0);
    assert(add(0, 0) === 0);
});

test('calculateSubtotal应该正确计算小计', () => {
    const testItems = [
        { price: 100, quantity: 2 },
        { price: 50, quantity: 3 }
    ];
    assert(calculateSubtotal(testItems) === 350);
    assert(calculateSubtotal([]) === 0);
});

// ============================================
// 4. 纯函数的优势：可缓存性（记忆化）
// ============================================

const memoize = (fn) => {
    const cache = new Map();
    return (...args) => {
        const key = JSON.stringify(args);
        if (cache.has(key)) {
            console.log(`从缓存返回: ${key}`);
            return cache.get(key);
        }
        console.log(`计算: ${key}`);
        const result = fn(...args);
        cache.set(key, result);
        return result;
    };
};

// 模拟昂贵的计算
const fibonacci = (n) => {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
};

// 使用记忆化优化
const memoizedFibonacci = memoize((n) => {
    if (n <= 1) return n;
    return memoizedFibonacci(n - 1) + memoizedFibonacci(n - 2);
});

console.log('\n记忆化示例:');
console.log('第一次调用:');
console.log(`fib(5) = ${memoizedFibonacci(5)}`);
console.log('第二次调用:');
console.log(`fib(5) = ${memoizedFibonacci(5)}`); // 从缓存返回

// ============================================
// 5. 将非纯函数转换为纯函数
// ============================================

// 非纯函数：依赖外部配置
let config = { apiUrl: 'https://api.example.com', timeout: 5000 };
const makeRequest = (endpoint) => {
    return `${config.apiUrl}${endpoint}?timeout=${config.timeout}`;
};

// 纯函数版本：将配置作为参数传入
const makeRequestPure = (config, endpoint) => {
    return `${config.apiUrl}${endpoint}?timeout=${config.timeout}`;
};

// 使用柯里化创建配置好的函数
const createRequestMaker = (config) => (endpoint) => 
    `${config.apiUrl}${endpoint}?timeout=${config.timeout}`;

const requestMaker = createRequestMaker({ 
    apiUrl: 'https://api.example.com', 
    timeout: 5000 
});

console.log('\n纯函数转换:');
console.log(requestMaker('/users')); // 纯函数，配置被封装

// ============================================
// 6. 处理必要的副作用
// ============================================

// 将副作用与纯计算分离
const calculateWithLogging = (operation, logger) => (...args) => {
    const result = operation(...args);
    logger(`Operation ${operation.name} with args ${args} = ${result}`);
    return result;
};

// 纯函数
const addPure = (a, b) => a + b;
const multiplyPure = (a, b) => a * b;

// 添加日志副作用
const addWithLog = calculateWithLogging(addPure, console.log);
const multiplyWithLog = calculateWithLogging(multiplyPure, console.log);

console.log('\n分离副作用:');
addWithLog(3, 4);
multiplyWithLog(5, 6);

// ============================================
// 7. 实战示例：用户数据处理
// ============================================

// 所有函数都是纯函数
const validateUser = (user) => {
    const errors = [];
    if (!user.name || user.name.trim() === '') {
        errors.push('姓名不能为空');
    }
    if (!user.email || !user.email.includes('@')) {
        errors.push('邮箱格式不正确');
    }
    if (user.age && (user.age < 0 || user.age > 150)) {
        errors.push('年龄不合理');
    }
    return {
        isValid: errors.length === 0,
        errors
    };
};

const normalizeUser = (user) => ({
    ...user,
    name: user.name?.trim(),
    email: user.email?.toLowerCase(),
    createdAt: user.createdAt || new Date().toISOString()
});

const enrichUser = (user) => ({
    ...user,
    displayName: `${user.name} (${user.email})`,
    isAdult: user.age >= 18,
    ageGroup: user.age < 18 ? '未成年' : 
              user.age < 60 ? '成年' : '老年'
});

// 组合使用
const processUser = (userData) => {
    const validation = validateUser(userData);
    if (!validation.isValid) {
        return { success: false, errors: validation.errors };
    }
    
    const normalized = normalizeUser(userData);
    const enriched = enrichUser(normalized);
    
    return { success: true, data: enriched };
};

console.log('\n用户数据处理:');
const user1 = { name: ' 张三 ', email: 'ZHANG@EXAMPLE.COM', age: 25 };
const user2 = { name: '', email: 'invalid-email', age: 200 };

console.log('用户1:', processUser(user1));
console.log('用户2:', processUser(user2));

// ============================================
// 导出纯函数工具
// ============================================

module.exports = {
    // 基础纯函数
    add,
    multiply,
    square,
    
    // 购物车函数
    calculateSubtotal,
    calculateTax,
    calculateDiscount,
    calculateTotal,
    
    // 工具函数
    memoize,
    test,
    assert,
    
    // 用户处理函数
    validateUser,
    normalizeUser,
    enrichUser,
    processUser
};