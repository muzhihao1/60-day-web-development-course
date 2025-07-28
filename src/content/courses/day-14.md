---
day: 14
phase: "javascript-mastery"
title: "函数式编程基础：纯函数与数组方法"
description: "深入理解函数式编程核心概念，掌握纯函数、不可变性、高阶函数和数组方法的实际应用"
objectives:
  - "理解函数式编程的核心原则和优势"
  - "掌握纯函数和不可变性的概念"
  - "熟练使用map、filter、reduce等数组方法"
  - "学会函数组合和高阶函数的应用"
  - "能够使用函数式编程解决实际问题"
estimatedTime: 90
difficulty: "intermediate"
prerequisites: [13]
tags:
  - "函数式编程"
  - "纯函数"
  - "数组方法"
  - "高阶函数"
  - "不可变性"
resources:
  - title: "JavaScript函数式编程指南"
    url: "https://github.com/MostlyAdequate/mostly-adequate-guide"
    type: "article"
  - title: "MDN Array方法文档"
    url: "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array"
    type: "documentation"
  - title: "函数式编程术语解释"
    url: "https://github.com/hemanth/functional-programming-jargon"
    type: "article"
  - title: "Ramda.js函数式编程库"
    url: "https://ramdajs.com/"
    type: "tool"
codeExamples:
  - title: "纯函数示例"
    language: "javascript"
    path: "/code-examples/day-14/pure-functions.js"
  - title: "数组方法链式调用"
    language: "javascript"
    path: "/code-examples/day-14/array-methods.js"
  - title: "函数组合实践"
    language: "javascript"
    path: "/code-examples/day-14/composition.js"
---

# Day 14: 函数式编程基础：纯函数与数组方法

## 📋 学习目标

今天我们将深入函数式编程（Functional Programming, FP）的世界。函数式编程是一种编程范式，它将计算视为数学函数的求值，强调使用函数来解决问题。在现代JavaScript开发中，函数式编程的思想无处不在，特别是在React、Redux等流行框架中。

## 🎯 为什么要学习函数式编程？

### 函数式编程的优势

```javascript
// 命令式编程（告诉计算机怎么做）
const numbers = [1, 2, 3, 4, 5];
const doubled = [];
for (let i = 0; i < numbers.length; i++) {
    doubled.push(numbers[i] * 2);
}

// 函数式编程（告诉计算机做什么）
const doubled = numbers.map(n => n * 2);

// 函数式编程的优势：
// 1. 代码更简洁
// 2. 更容易理解
// 3. 更容易测试
// 4. 更少的bug
// 5. 更好的可组合性
```

## 🔑 核心概念1：纯函数（Pure Functions）

### 什么是纯函数？

纯函数是函数式编程的基石。一个纯函数必须满足两个条件：
1. **相同的输入总是产生相同的输出**
2. **没有副作用**

```javascript
// ✅ 纯函数示例
const add = (a, b) => a + b;
const multiply = (a, b) => a * b;
const toUpperCase = (str) => str.toUpperCase();

// 总是返回相同结果
console.log(add(2, 3)); // 5
console.log(add(2, 3)); // 5（相同输入，相同输出）

// ❌ 非纯函数示例
let counter = 0;
const increment = () => {
    counter++; // 修改外部变量（副作用）
    return counter;
};

// 随机数不是纯函数
const getRandom = () => Math.random(); // 每次调用结果不同

// 依赖外部状态
const user = { name: '张三', age: 25 };
const greetUser = () => `Hello, ${user.name}`; // 依赖外部变量
```

### 纯函数的好处

```javascript
// 1. 可测试性
const calculateDiscount = (price, discountRate) => {
    return price * (1 - discountRate);
};

// 测试非常简单
console.assert(calculateDiscount(100, 0.2) === 80);
console.assert(calculateDiscount(50, 0.1) === 45);

// 2. 可缓存（记忆化）
const memoize = (fn) => {
    const cache = {};
    return (...args) => {
        const key = JSON.stringify(args);
        if (key in cache) {
            console.log('从缓存返回');
            return cache[key];
        }
        const result = fn(...args);
        cache[key] = result;
        return result;
    };
};

const expensiveOperation = (n) => {
    console.log('执行昂贵计算...');
    return n * n;
};

const memoizedOperation = memoize(expensiveOperation);
memoizedOperation(5); // 执行昂贵计算...
memoizedOperation(5); // 从缓存返回

// 3. 并行执行
// 纯函数可以安全地并行执行，因为它们不会相互影响
```

## 🔐 核心概念2：不可变性（Immutability）

### 什么是不可变性？

不可变性意味着数据一旦创建就不能被修改。在JavaScript中，我们通过创建新的数据来"修改"数据。

```javascript
// ❌ 可变的方式
const user = { name: '张三', age: 25 };
user.age = 26; // 直接修改

const numbers = [1, 2, 3];
numbers.push(4); // 修改原数组

// ✅ 不可变的方式
const user = { name: '张三', age: 25 };
const updatedUser = { ...user, age: 26 }; // 创建新对象

const numbers = [1, 2, 3];
const newNumbers = [...numbers, 4]; // 创建新数组

// 深度不可变更新
const state = {
    user: {
        profile: {
            name: '张三',
            settings: {
                theme: 'dark'
            }
        }
    }
};

// 更新嵌套属性
const newState = {
    ...state,
    user: {
        ...state.user,
        profile: {
            ...state.user.profile,
            settings: {
                ...state.user.profile.settings,
                theme: 'light'
            }
        }
    }
};
```

### 不可变性的实用技巧

```javascript
// 数组的不可变操作
const todos = [
    { id: 1, text: '学习JavaScript', done: false },
    { id: 2, text: '学习React', done: false }
];

// 添加元素
const addTodo = (todos, newTodo) => [...todos, newTodo];

// 删除元素
const removeTodo = (todos, id) => todos.filter(todo => todo.id !== id);

// 更新元素
const toggleTodo = (todos, id) => todos.map(todo =>
    todo.id === id ? { ...todo, done: !todo.done } : todo
);

// 对象的不可变操作
const updateNestedProperty = (obj, path, value) => {
    const keys = path.split('.');
    const lastKey = keys.pop();
    
    const deepClone = (obj, keys) => {
        if (keys.length === 0) {
            return { ...obj, [lastKey]: value };
        }
        const [head, ...rest] = keys;
        return {
            ...obj,
            [head]: deepClone(obj[head], rest)
        };
    };
    
    return deepClone(obj, keys);
};
```

## 🚀 高阶函数（Higher-Order Functions）

高阶函数是函数式编程的另一个核心概念。高阶函数是指：
1. 接受一个或多个函数作为参数
2. 返回一个函数

```javascript
// 1. 函数作为参数
const numbers = [1, 2, 3, 4, 5];

// filter接受一个函数作为参数
const evens = numbers.filter(n => n % 2 === 0);

// 2. 返回函数
const createMultiplier = (factor) => {
    return (number) => number * factor;
};

const double = createMultiplier(2);
const triple = createMultiplier(3);

console.log(double(5)); // 10
console.log(triple(5)); // 15

// 3. 实用的高阶函数
const withLogging = (fn) => {
    return (...args) => {
        console.log(`调用 ${fn.name} 参数:`, args);
        const result = fn(...args);
        console.log(`结果:`, result);
        return result;
    };
};

const add = (a, b) => a + b;
const loggedAdd = withLogging(add);
loggedAdd(2, 3); // 打印日志并返回5

// 4. 函数装饰器
const withTiming = (fn) => {
    return (...args) => {
        const start = performance.now();
        const result = fn(...args);
        const end = performance.now();
        console.log(`${fn.name} 执行时间: ${end - start}ms`);
        return result;
    };
};

const slowFunction = (n) => {
    let sum = 0;
    for (let i = 0; i < n; i++) {
        sum += i;
    }
    return sum;
};

const timedFunction = withTiming(slowFunction);
timedFunction(1000000);
```

## 🛠️ 数组方法深度解析

### 1. map - 转换数组

```javascript
// map的本质：对每个元素应用函数，返回新数组
const map = (array, fn) => {
    const result = [];
    for (let i = 0; i < array.length; i++) {
        result.push(fn(array[i], i, array));
    }
    return result;
};

// 实际应用
const users = [
    { id: 1, name: '张三', age: 25 },
    { id: 2, name: '李四', age: 30 },
    { id: 3, name: '王五', age: 28 }
];

// 提取特定属性
const names = users.map(user => user.name);

// 转换数据结构
const userCards = users.map(user => ({
    userId: user.id,
    displayName: `${user.name} (${user.age}岁)`,
    isAdult: user.age >= 18
}));

// 与索引一起使用
const numberedNames = users.map((user, index) => 
    `${index + 1}. ${user.name}`
);
```

### 2. filter - 过滤数组

```javascript
// filter的本质：保留满足条件的元素
const filter = (array, predicate) => {
    const result = [];
    for (let i = 0; i < array.length; i++) {
        if (predicate(array[i], i, array)) {
            result.push(array[i]);
        }
    }
    return result;
};

// 实际应用
const products = [
    { name: '笔记本', price: 5000, category: '电子产品' },
    { name: '鼠标', price: 100, category: '电子产品' },
    { name: '水杯', price: 50, category: '生活用品' },
    { name: '键盘', price: 300, category: '电子产品' }
];

// 单条件过滤
const electronics = products.filter(p => p.category === '电子产品');

// 多条件过滤
const affordableElectronics = products.filter(p => 
    p.category === '电子产品' && p.price < 500
);

// 组合过滤器
const createFilter = (filters) => (item) => 
    Object.entries(filters).every(([key, value]) => {
        if (typeof value === 'function') {
            return value(item[key]);
        }
        return item[key] === value;
    });

const complexFilter = createFilter({
    category: '电子产品',
    price: (price) => price < 1000
});

const filtered = products.filter(complexFilter);
```

### 3. reduce - 聚合数组

```javascript
// reduce的本质：将数组归纳为单个值
const reduce = (array, fn, initial) => {
    let accumulator = initial;
    for (let i = 0; i < array.length; i++) {
        accumulator = fn(accumulator, array[i], i, array);
    }
    return accumulator;
};

// 基础应用
const numbers = [1, 2, 3, 4, 5];

// 求和
const sum = numbers.reduce((acc, n) => acc + n, 0);

// 求积
const product = numbers.reduce((acc, n) => acc * n, 1);

// 高级应用
const orders = [
    { product: '笔记本', quantity: 2, price: 5000 },
    { product: '鼠标', quantity: 5, price: 100 },
    { product: '键盘', quantity: 3, price: 300 }
];

// 计算总价
const total = orders.reduce((sum, order) => 
    sum + (order.quantity * order.price), 0
);

// 分组
const groupBy = (array, key) => {
    return array.reduce((groups, item) => {
        const group = item[key];
        groups[group] = groups[group] || [];
        groups[group].push(item);
        return groups;
    }, {});
};

const people = [
    { name: '张三', age: 25, city: '北京' },
    { name: '李四', age: 30, city: '上海' },
    { name: '王五', age: 28, city: '北京' }
];

const byCity = groupBy(people, 'city');
// { 北京: [{...}, {...}], 上海: [{...}] }

// 实现其他数组方法
const mapUsingReduce = (array, fn) => 
    array.reduce((acc, item, index) => 
        [...acc, fn(item, index, array)], []
    );

const filterUsingReduce = (array, predicate) =>
    array.reduce((acc, item, index) => 
        predicate(item, index, array) ? [...acc, item] : acc, []
    );
```

### 4. 其他重要数组方法

```javascript
// find - 找到第一个满足条件的元素
const users = [
    { id: 1, name: '张三', active: true },
    { id: 2, name: '李四', active: false },
    { id: 3, name: '王五', active: true }
];

const firstActiveUser = users.find(user => user.active);

// findIndex - 找到第一个满足条件的索引
const index = users.findIndex(user => user.name === '李四');

// some - 至少有一个满足条件
const hasActiveUser = users.some(user => user.active);

// every - 所有都满足条件
const allActive = users.every(user => user.active);

// flatMap - map + flatten
const sentences = ['Hello World', 'How are you'];
const words = sentences.flatMap(sentence => sentence.split(' '));
// ['Hello', 'World', 'How', 'are', 'you']

// 实际应用：处理嵌套数据
const departments = [
    {
        name: '技术部',
        employees: [
            { name: '张三', salary: 10000 },
            { name: '李四', salary: 12000 }
        ]
    },
    {
        name: '市场部',
        employees: [
            { name: '王五', salary: 8000 },
            { name: '赵六', salary: 9000 }
        ]
    }
];

// 获取所有高薪员工
const highSalaryEmployees = departments
    .flatMap(dept => dept.employees)
    .filter(emp => emp.salary > 10000);
```

## 🎨 函数组合（Function Composition）

函数组合是将多个简单函数组合成一个复杂函数的技术。

```javascript
// 基础组合
const compose = (f, g) => (x) => f(g(x));

const addOne = x => x + 1;
const double = x => x * 2;

const doubleThenAddOne = compose(addOne, double);
console.log(doubleThenAddOne(5)); // 11 (5 * 2 + 1)

// 多函数组合
const pipe = (...fns) => (x) => 
    fns.reduce((acc, fn) => fn(acc), x);

const compose2 = (...fns) => (x) => 
    fns.reduceRight((acc, fn) => fn(acc), x);

// 实际应用：数据处理管道
const users = [
    { name: '张三', age: 25, salary: 10000 },
    { name: '李四', age: 30, salary: 15000 },
    { name: '王五', age: 28, salary: 12000 },
    { name: '赵六', age: 22, salary: 8000 }
];

// 步骤函数
const filterAdults = users => users.filter(u => u.age >= 25);
const sortBySalary = users => [...users].sort((a, b) => b.salary - a.salary);
const getNames = users => users.map(u => u.name);
const take = n => arr => arr.slice(0, n);

// 组合：获取薪资最高的3个成年人的名字
const getTopEarners = pipe(
    filterAdults,
    sortBySalary,
    take(3),
    getNames
);

console.log(getTopEarners(users)); // ['李四', '王五', '张三']

// 可重用的管道
const createPipeline = (...transforms) => (data) => 
    transforms.reduce((result, transform) => transform(result), data);

const dataProcessingPipeline = createPipeline(
    // 数据验证
    data => {
        if (!Array.isArray(data)) throw new Error('数据必须是数组');
        return data;
    },
    // 数据清洗
    data => data.filter(item => item !== null && item !== undefined),
    // 数据转换
    data => data.map(item => ({
        ...item,
        processed: true,
        timestamp: new Date()
    }))
);
```

## 🔥 柯里化（Currying）

柯里化是将接受多个参数的函数转换为一系列接受单个参数的函数。

```javascript
// 基础柯里化
const curry = (fn) => {
    return function curried(...args) {
        if (args.length >= fn.length) {
            return fn.apply(this, args);
        }
        return function(...nextArgs) {
            return curried.apply(this, args.concat(nextArgs));
        };
    };
};

// 使用示例
const add = (a, b, c) => a + b + c;
const curriedAdd = curry(add);

console.log(curriedAdd(1)(2)(3)); // 6
console.log(curriedAdd(1, 2)(3)); // 6
console.log(curriedAdd(1)(2, 3)); // 6

// 实际应用
const createLogger = curry((level, module, message) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${level}] [${module}] ${message}`);
});

// 创建特定级别的logger
const infoLogger = createLogger('INFO');
const errorLogger = createLogger('ERROR');

// 创建特定模块的logger
const authInfo = infoLogger('AUTH');
const authError = errorLogger('AUTH');

// 使用
authInfo('用户登录成功');
authError('登录失败：密码错误');

// 柯里化的数据处理
const filter = curry((predicate, array) => array.filter(predicate));
const map = curry((fn, array) => array.map(fn));
const reduce = curry((fn, initial, array) => array.reduce(fn, initial));

// 创建可重用的函数
const getAdults = filter(person => person.age >= 18);
const getNames = map(person => person.name);
const sumAges = reduce((sum, person) => sum + person.age, 0);

// 组合使用
const people = [
    { name: '张三', age: 25 },
    { name: '李四', age: 17 },
    { name: '王五', age: 30 }
];

const adultNames = pipe(
    getAdults,
    getNames
)(people); // ['张三', '王五']
```

## 💡 函数式编程最佳实践

### 1. 避免副作用

```javascript
// ❌ 有副作用的函数
let total = 0;
const addToTotal = (value) => {
    total += value; // 修改外部变量
    console.log(total); // I/O操作
    return total;
};

// ✅ 无副作用的函数
const add = (a, b) => a + b;
const createAdder = (initial) => (value) => initial + value;

// 处理必要的副作用
const withSideEffect = (pureFunction, sideEffect) => (...args) => {
    const result = pureFunction(...args);
    sideEffect(result);
    return result;
};

const pureCalculation = (a, b) => a + b;
const logResult = (result) => console.log(`Result: ${result}`);

const calculateAndLog = withSideEffect(pureCalculation, logResult);
```

### 2. 使用函数式工具库

```javascript
// 模拟Ramda风格的工具函数
const R = {
    // 组合
    compose: (...fns) => x => fns.reduceRight((acc, fn) => fn(acc), x),
    pipe: (...fns) => x => fns.reduce((acc, fn) => fn(acc), x),
    
    // 柯里化
    curry: (fn) => {
        const arity = fn.length;
        return function curried(...args) {
            if (args.length >= arity) {
                return fn(...args);
            }
            return (...nextArgs) => curried(...args, ...nextArgs);
        };
    },
    
    // 常用函数
    map: R.curry((fn, arr) => arr.map(fn)),
    filter: R.curry((pred, arr) => arr.filter(pred)),
    reduce: R.curry((fn, init, arr) => arr.reduce(fn, init)),
    
    // 工具函数
    prop: R.curry((key, obj) => obj[key]),
    path: R.curry((keys, obj) => keys.reduce((acc, key) => acc?.[key], obj)),
    pick: R.curry((keys, obj) => 
        keys.reduce((acc, key) => ({ ...acc, [key]: obj[key] }), {})
    ),
    omit: R.curry((keys, obj) => {
        const result = { ...obj };
        keys.forEach(key => delete result[key]);
        return result;
    })
};

// 使用示例
const users = [
    { id: 1, name: '张三', age: 25, city: '北京' },
    { id: 2, name: '李四', age: 30, city: '上海' },
    { id: 3, name: '王五', age: 28, city: '北京' }
];

const getUserInfo = R.pipe(
    R.filter(user => user.age >= 25),
    R.map(R.pick(['name', 'city'])),
    R.map(user => `${user.name} (${user.city})`)
);

console.log(getUserInfo(users));
```

## 🎯 实战案例：构建数据处理管道

让我们构建一个完整的数据处理管道，处理电商订单数据：

```javascript
// 订单数据
const orders = [
    {
        id: 1,
        customer: '张三',
        items: [
            { product: '笔记本', price: 5000, quantity: 1 },
            { product: '鼠标', price: 100, quantity: 2 }
        ],
        date: '2024-01-15',
        status: 'completed'
    },
    {
        id: 2,
        customer: '李四',
        items: [
            { product: '键盘', price: 300, quantity: 1 },
            { product: '显示器', price: 2000, quantity: 2 }
        ],
        date: '2024-01-16',
        status: 'completed'
    },
    {
        id: 3,
        customer: '王五',
        items: [
            { product: '耳机', price: 500, quantity: 1 }
        ],
        date: '2024-01-17',
        status: 'cancelled'
    }
];

// 工具函数
const calculateOrderTotal = (order) => ({
    ...order,
    total: order.items.reduce((sum, item) => 
        sum + (item.price * item.quantity), 0
    )
});

const addItemCount = (order) => ({
    ...order,
    itemCount: order.items.reduce((count, item) => 
        count + item.quantity, 0
    )
});

const filterByStatus = (status) => (orders) => 
    orders.filter(order => order.status === status);

const filterByDateRange = (startDate, endDate) => (orders) => 
    orders.filter(order => {
        const orderDate = new Date(order.date);
        return orderDate >= new Date(startDate) && 
               orderDate <= new Date(endDate);
    });

const sortBy = (key, direction = 'asc') => (orders) => 
    [...orders].sort((a, b) => {
        const aVal = a[key];
        const bVal = b[key];
        return direction === 'asc' ? 
            (aVal > bVal ? 1 : -1) : 
            (bVal > aVal ? 1 : -1);
    });

const getTopN = (n) => (orders) => orders.slice(0, n);

const summarize = (orders) => ({
    totalOrders: orders.length,
    totalRevenue: orders.reduce((sum, order) => sum + order.total, 0),
    averageOrderValue: orders.length > 0 ? 
        orders.reduce((sum, order) => sum + order.total, 0) / orders.length : 0,
    topCustomers: orders
        .reduce((customers, order) => {
            const existing = customers.find(c => c.name === order.customer);
            if (existing) {
                existing.orders++;
                existing.total += order.total;
            } else {
                customers.push({
                    name: order.customer,
                    orders: 1,
                    total: order.total
                });
            }
            return customers;
        }, [])
        .sort((a, b) => b.total - a.total)
});

// 构建处理管道
const processOrders = pipe(
    // 1. 添加计算字段
    orders => orders.map(calculateOrderTotal),
    orders => orders.map(addItemCount),
    
    // 2. 过滤
    filterByStatus('completed'),
    filterByDateRange('2024-01-01', '2024-12-31'),
    
    // 3. 排序
    sortBy('total', 'desc'),
    
    // 4. 获取前N个
    getTopN(10),
    
    // 5. 生成报告
    orders => ({
        orders: orders,
        summary: summarize(orders)
    })
);

// 执行管道
const report = processOrders(orders);
console.log('订单报告:', report);
```

## 🔍 调试函数式代码

```javascript
// 调试工具
const trace = (label) => (value) => {
    console.log(`${label}:`, value);
    return value;
};

const tap = (fn) => (value) => {
    fn(value);
    return value;
};

// 使用调试工具
const debugPipeline = pipe(
    trace('原始数据'),
    filterAdults,
    trace('过滤后'),
    sortBySalary,
    trace('排序后'),
    take(3),
    trace('取前3个'),
    getNames,
    trace('最终结果')
);

// 性能监控
const withPerformance = (name, fn) => (...args) => {
    const start = performance.now();
    const result = fn(...args);
    const end = performance.now();
    console.log(`${name} took ${end - start}ms`);
    return result;
};
```

## 📚 今日练习预览

今天的练习中，你将构建一个数据处理管道，处理学生成绩数据：

1. 过滤有效成绩
2. 计算各种统计指标
3. 按不同维度分组
4. 生成成绩报告
5. 不使用任何for循环，只用函数式方法

## 🚀 下一步

明天我们将学习异步编程的精髓：
- Promise的深入理解
- async/await的优雅使用
- 并发控制
- 错误处理策略
- 实战异步数据流

## 💭 思考题

1. 为什么说"纯函数是可测试的"？
2. 不可变性会不会导致性能问题？如何优化？
3. 什么时候使用reduce比使用for循环更合适？
4. 函数组合和管道有什么区别？
5. 柯里化在实际开发中的应用场景有哪些？

记住：**函数式编程不是目的，而是让代码更可靠、更易理解的手段**。掌握这些概念将让你在处理复杂数据和业务逻辑时更加得心应手！