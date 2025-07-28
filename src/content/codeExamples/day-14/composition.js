// 函数组合实践 - Day 14

// ============================================
// 1. 函数组合基础
// ============================================

// compose - 从右到左组合（数学风格）
const compose = (...fns) => x => 
    fns.reduceRight((acc, fn) => fn(acc), x);

// pipe - 从左到右组合（Unix管道风格）
const pipe = (...fns) => x => 
    fns.reduce((acc, fn) => fn(acc), x);

// 基础函数
const add = x => y => x + y;
const multiply = x => y => x * y;
const subtract = x => y => x - y;

// 简单组合示例
const addOne = add(1);
const double = multiply(2);
const subtractTen = subtract(10);

// compose示例：先加1，再乘2
const addOneThenDouble = compose(double, addOne);
console.log('Compose: (5 + 1) * 2 =', addOneThenDouble(5)); // 12

// pipe示例：先乘2，再加1
const doubleThenAddOne = pipe(double, addOne);
console.log('Pipe: (5 * 2) + 1 =', doubleThenAddOne(5)); // 11

// ============================================
// 2. 实用函数组合
// ============================================

// 字符串处理函数
const trim = str => str.trim();
const toLowerCase = str => str.toLowerCase();
const removeSpaces = str => str.replace(/\s+/g, '');
const reverse = str => str.split('').reverse().join('');
const capitalize = str => str.charAt(0).toUpperCase() + str.slice(1);

// 组合字符串处理
const normalizeString = pipe(
    trim,
    toLowerCase,
    removeSpaces
);

const fancyTransform = pipe(
    trim,
    toLowerCase,
    capitalize,
    reverse
);

console.log('\n字符串处理:');
console.log('规范化:', normalizeString('  Hello World  ')); // 'helloworld'
console.log('花式转换:', fancyTransform('  hello  ')); // 'olleh'

// ============================================
// 3. 数据处理管道
// ============================================

// 用户数据
const users = [
    { id: 1, name: '张三', age: 25, salary: 10000, department: '技术部' },
    { id: 2, name: '李四', age: 30, salary: 15000, department: '产品部' },
    { id: 3, name: '王五', age: 28, salary: 12000, department: '技术部' },
    { id: 4, name: '赵六', age: 22, salary: 8000, department: '市场部' },
    { id: 5, name: '钱七', age: 35, salary: 20000, department: '技术部' }
];

// 数据处理函数
const filterByDepartment = dept => users => 
    users.filter(user => user.department === dept);

const filterByAge = minAge => users => 
    users.filter(user => user.age >= minAge);

const sortBySalary = (order = 'asc') => users => 
    [...users].sort((a, b) => 
        order === 'asc' ? a.salary - b.salary : b.salary - a.salary
    );

const mapToNames = users => users.map(user => user.name);

const take = n => arr => arr.slice(0, n);

// 组合：获取技术部薪资最高的3个成年人的名字
const getTopTechEmployees = pipe(
    filterByDepartment('技术部'),
    filterByAge(25),
    sortBySalary('desc'),
    take(3),
    mapToNames
);

console.log('\n技术部高薪员工:', getTopTechEmployees(users));

// ============================================
// 4. 柯里化与组合
// ============================================

// 通用柯里化函数
const curry = (fn, arity = fn.length) => {
    return function curried(...args) {
        if (args.length >= arity) {
            return fn.apply(this, args);
        }
        return function(...nextArgs) {
            return curried.apply(this, args.concat(nextArgs));
        };
    };
};

// 柯里化的函数
const addThreeNumbers = curry((a, b, c) => a + b + c);
const multiplyThreeNumbers = curry((a, b, c) => a * b * c);

// 部分应用
const add5 = addThreeNumbers(5);
const add5and10 = add5(10);
console.log('\n柯里化:', add5and10(15)); // 30

// 数据验证函数
const prop = curry((key, obj) => obj[key]);
const equals = curry((a, b) => a === b);
const gt = curry((a, b) => b > a);
const lt = curry((a, b) => b < a);

// 组合验证器
const isAdult = compose(gt(17), prop('age'));
const isHighEarner = compose(gt(15000), prop('salary'));
const isDepartment = dept => compose(equals(dept), prop('department'));

// 复杂验证
const isQualifiedTechLead = user => 
    isAdult(user) && 
    isHighEarner(user) && 
    isDepartment('技术部')(user);

const techLeads = users.filter(isQualifiedTechLead);
console.log('技术主管候选人:', techLeads);

// ============================================
// 5. 高级组合模式
// ============================================

// 带日志的组合
const trace = label => value => {
    console.log(`[${label}]:`, value);
    return value;
};

const withLogging = pipe(
    trace('输入'),
    filterByDepartment('技术部'),
    trace('技术部员工'),
    filterByAge(25),
    trace('成年员工'),
    mapToNames,
    trace('最终结果')
);

console.log('\n带日志的处理:');
withLogging(users);

// 条件组合
const when = (predicate, fn) => x => 
    predicate(x) ? fn(x) : x;

const unless = (predicate, fn) => x => 
    predicate(x) ? x : fn(x);

// 数字处理示例
const processNumber = pipe(
    when(x => x < 0, Math.abs),         // 负数转正
    unless(x => x > 100, x => x * 2),   // 小于100则翻倍
    Math.round                          // 四舍五入
);

console.log('\n条件处理:');
console.log(processNumber(-5.7));   // 12 (|-5.7| * 2)
console.log(processNumber(150.3));  // 150
console.log(processNumber(45.8));   // 92

// ============================================
// 6. 实战案例：订单处理系统
// ============================================

const orders = [
    {
        id: 'ORD001',
        customer: { name: '张三', vip: true },
        items: [
            { product: '笔记本', price: 5000, quantity: 1 },
            { product: '鼠标', price: 100, quantity: 2 }
        ],
        status: 'pending',
        date: '2024-01-15'
    },
    {
        id: 'ORD002',
        customer: { name: '李四', vip: false },
        items: [
            { product: '键盘', price: 300, quantity: 1 },
            { product: '显示器', price: 2000, quantity: 1 }
        ],
        status: 'completed',
        date: '2024-01-16'
    },
    {
        id: 'ORD003',
        customer: { name: '王五', vip: true },
        items: [
            { product: '耳机', price: 500, quantity: 2 }
        ],
        status: 'pending',
        date: '2024-01-17'
    }
];

// 订单处理函数
const calculateOrderTotal = order => ({
    ...order,
    subtotal: order.items.reduce((sum, item) => 
        sum + (item.price * item.quantity), 0
    )
});

const applyVipDiscount = order => ({
    ...order,
    discount: order.customer.vip ? order.subtotal * 0.1 : 0
});

const calculateFinalPrice = order => ({
    ...order,
    total: order.subtotal - (order.discount || 0)
});

const addShipping = order => ({
    ...order,
    shipping: order.total > 1000 ? 0 : 100,
    finalTotal: order.total + (order.total > 1000 ? 0 : 100)
});

const formatCurrency = amount => `￥${amount.toFixed(2)}`;

const formatOrder = order => ({
    orderId: order.id,
    customer: order.customer.name,
    vip: order.customer.vip,
    items: order.items.length,
    subtotal: formatCurrency(order.subtotal),
    discount: formatCurrency(order.discount),
    shipping: formatCurrency(order.shipping),
    total: formatCurrency(order.finalTotal),
    status: order.status
});

// 组合订单处理管道
const processOrder = pipe(
    calculateOrderTotal,
    applyVipDiscount,
    calculateFinalPrice,
    addShipping,
    formatOrder
);

const processedOrders = orders.map(processOrder);
console.log('\n处理后的订单:', processedOrders);

// ============================================
// 7. 异步函数组合
// ============================================

// 异步pipe
const pipeAsync = (...fns) => async (x) => {
    let result = x;
    for (const fn of fns) {
        result = await fn(result);
    }
    return result;
};

// 模拟异步操作
const fetchUser = async (id) => {
    console.log(`获取用户 ${id}...`);
    return new Promise(resolve => 
        setTimeout(() => resolve({ id, name: `用户${id}` }), 100)
    );
};

const fetchUserPosts = async (user) => {
    console.log(`获取 ${user.name} 的文章...`);
    return new Promise(resolve => 
        setTimeout(() => resolve({
            ...user,
            posts: [`文章1`, `文章2`, `文章3`]
        }), 100)
    );
};

const fetchPostComments = async (userWithPosts) => {
    console.log(`获取评论...`);
    return new Promise(resolve => 
        setTimeout(() => resolve({
            ...userWithPosts,
            totalComments: userWithPosts.posts.length * 5
        }), 100)
    );
};

// 组合异步操作
const getUserData = pipeAsync(
    fetchUser,
    fetchUserPosts,
    fetchPostComments
);

// 执行异步管道
console.log('\n异步组合:');
getUserData(1).then(result => {
    console.log('最终结果:', result);
});

// ============================================
// 8. 函数组合工具库
// ============================================

const FP = {
    // 基础组合
    compose,
    pipe,
    
    // 工具函数
    identity: x => x,
    constant: x => () => x,
    
    // 逻辑组合
    not: fn => (...args) => !fn(...args),
    and: (...fns) => (...args) => fns.every(fn => fn(...args)),
    or: (...fns) => (...args) => fns.some(fn => fn(...args)),
    
    // 条件组合
    when,
    unless,
    ifElse: (predicate, onTrue, onFalse) => x =>
        predicate(x) ? onTrue(x) : onFalse(x),
    
    // 实用工具
    tap: fn => x => { fn(x); return x; },
    converge: (fn, fns) => (...args) => 
        fn(...fns.map(f => f(...args))),
    
    // 柯里化
    curry,
    partial: (fn, ...presetArgs) => (...laterArgs) => 
        fn(...presetArgs, ...laterArgs),
    
    // 异步
    pipeAsync,
    composeAsync: (...fns) => x => 
        fns.reduceRight((acc, fn) => acc.then(fn), Promise.resolve(x))
};

// 使用工具库
const isEven = n => n % 2 === 0;
const isPositive = n => n > 0;

const isOdd = FP.not(isEven);
const isEvenAndPositive = FP.and(isEven, isPositive);

console.log('\n工具库示例:');
console.log('isOdd(5):', isOdd(5)); // true
console.log('isEvenAndPositive(4):', isEvenAndPositive(4)); // true
console.log('isEvenAndPositive(-4):', isEvenAndPositive(-4)); // false

// 复杂组合示例
const average = nums => nums.reduce((a, b) => a + b) / nums.length;
const length = arr => arr.length;
const sum = nums => nums.reduce((a, b) => a + b);

// converge: 对同一输入应用多个函数，然后将结果传给另一个函数
const calculateAverage = FP.converge(
    (total, count) => total / count,
    [sum, length]
);

console.log('平均值:', calculateAverage([1, 2, 3, 4, 5])); // 3

// ============================================
// 导出
// ============================================

module.exports = {
    compose,
    pipe,
    curry,
    FP,
    // 实用函数
    processOrder,
    getTopTechEmployees,
    normalizeString
};