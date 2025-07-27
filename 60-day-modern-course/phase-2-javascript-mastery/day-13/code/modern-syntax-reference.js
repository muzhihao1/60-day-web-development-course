/**
 * ES6+ 语法速查手册
 * 包含 ES6 (ES2015) 到 ES2022 的主要特性
 */

// ========================================
// ES6 (ES2015) 特性
// ========================================

console.log('=== ES6 (ES2015) 特性 ===\n');

// 1. let 和 const
const PI = 3.14159; // 常量，不可重新赋值
let counter = 0;    // 变量，块级作用域
// var old = 'deprecated'; // 避免使用

// 2. 模板字符串
const name = 'ES6';
const message = `Welcome to ${name}!`;
const multiline = `
  第一行
  第二行
`;

// 3. 解构赋值
const [a, b, ...rest] = [1, 2, 3, 4, 5];
const { x, y, z = 0 } = { x: 1, y: 2 };

// 4. 默认参数
function greet(name = 'Guest') {
    return `Hello, ${name}!`;
}

// 5. 剩余参数和展开运算符
function sum(...numbers) {
    return numbers.reduce((a, b) => a + b, 0);
}
const arr = [1, 2, 3];
const expanded = [...arr, 4, 5];

// 6. 箭头函数
const double = x => x * 2;
const add = (a, b) => a + b;

// 7. 对象字面量增强
const prop = 'value';
const obj = {
    prop,              // 属性简写
    method() {         // 方法简写
        return 'Hello';
    },
    [`dynamic_${prop}`]: true  // 计算属性名
};

// 8. 类
class Person {
    constructor(name) {
        this.name = name;
    }
    
    greet() {
        return `Hello, I'm ${this.name}`;
    }
    
    static create(name) {
        return new Person(name);
    }
}

class Student extends Person {
    constructor(name, grade) {
        super(name);
        this.grade = grade;
    }
}

// 9. 模块
// export const myFunc = () => {};
// export default MyClass;
// import MyClass, { myFunc } from './module';

// 10. Promise
const promise = new Promise((resolve, reject) => {
    setTimeout(() => resolve('Done!'), 1000);
});

// 11. Symbol
const sym = Symbol('description');
const obj2 = {
    [sym]: 'Symbol value'
};

// 12. 迭代器和生成器
function* generator() {
    yield 1;
    yield 2;
    yield 3;
}

// 13. Map 和 Set
const map = new Map();
map.set('key', 'value');

const set = new Set([1, 2, 3, 3]); // 自动去重

// 14. WeakMap 和 WeakSet
const weakMap = new WeakMap();
const weakSet = new WeakSet();

// 15. Proxy 和 Reflect
const proxy = new Proxy({}, {
    get(target, prop) {
        return `Property ${prop}`;
    }
});

// 16. for...of 循环
for (const value of [1, 2, 3]) {
    // console.log(value);
}

// ========================================
// ES7 (ES2016) 特性
// ========================================

console.log('\n=== ES7 (ES2016) 特性 ===\n');

// 1. 指数运算符
const squared = 2 ** 3; // 8

// 2. Array.prototype.includes
const hasValue = [1, 2, 3].includes(2); // true

// ========================================
// ES8 (ES2017) 特性
// ========================================

console.log('\n=== ES8 (ES2017) 特性 ===\n');

// 1. async/await
async function fetchData() {
    try {
        const response = await fetch('/api/data');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error:', error);
    }
}

// 2. Object.values() 和 Object.entries()
const obj3 = { a: 1, b: 2, c: 3 };
const values = Object.values(obj3); // [1, 2, 3]
const entries = Object.entries(obj3); // [['a', 1], ['b', 2], ['c', 3]]

// 3. String padding
const padded = '5'.padStart(3, '0'); // '005'
const paddedEnd = '5'.padEnd(3, '0'); // '500'

// 4. Object.getOwnPropertyDescriptors()
const descriptors = Object.getOwnPropertyDescriptors(obj3);

// 5. 函数参数列表和调用中的尾逗号
function func(
    param1,
    param2,  // 尾逗号
) {}

// ========================================
// ES9 (ES2018) 特性
// ========================================

console.log('\n=== ES9 (ES2018) 特性 ===\n');

// 1. 异步迭代
async function* asyncGenerator() {
    yield await Promise.resolve(1);
    yield await Promise.resolve(2);
}

// 使用 for await...of
(async () => {
    for await (const value of asyncGenerator()) {
        // console.log(value);
    }
})();

// 2. Rest/Spread 属性
const { a: extracted, ...remaining } = { a: 1, b: 2, c: 3 };
const merged = { ...obj, ...{ d: 4 } };

// 3. Promise.finally()
Promise.resolve()
    .then(() => console.log('Success'))
    .catch(() => console.log('Error'))
    .finally(() => console.log('Cleanup'));

// 4. 正则表达式改进
const regex = /(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/;
const match = '2024-01-15'.match(regex);
// match.groups.year === '2024'

// ========================================
// ES10 (ES2019) 特性
// ========================================

console.log('\n=== ES10 (ES2019) 特性 ===\n');

// 1. Array.prototype.flat() 和 flatMap()
const nested = [1, [2, 3], [[4]]];
const flattened = nested.flat(); // [1, 2, 3, [4]]
const deepFlattened = nested.flat(2); // [1, 2, 3, 4]

const mapped = [1, 2, 3].flatMap(x => [x, x * 2]); // [1, 2, 2, 4, 3, 6]

// 2. Object.fromEntries()
const entries2 = [['a', 1], ['b', 2]];
const obj4 = Object.fromEntries(entries2); // { a: 1, b: 2 }

// 3. String.prototype.trimStart() 和 trimEnd()
const trimmed = '  hello  '.trimStart(); // 'hello  '
const trimmedEnd = '  hello  '.trimEnd(); // '  hello'

// 4. Optional catch binding
try {
    // risky operation
} catch {  // 不需要错误参数
    console.log('Error occurred');
}

// 5. Symbol.description
const sym2 = Symbol('My Symbol');
console.log(sym2.description); // 'My Symbol'

// ========================================
// ES11 (ES2020) 特性
// ========================================

console.log('\n=== ES11 (ES2020) 特性 ===\n');

// 1. 可选链操作符 (?.)
const user = {
    profile: {
        name: 'Alice'
    }
};
const city = user?.profile?.address?.city; // undefined，不会报错

// 2. 空值合并操作符 (??)
const value = null ?? 'default'; // 'default'
const zero = 0 ?? 'default'; // 0 (只有 null 和 undefined 才使用默认值)

// 3. BigInt
const bigNumber = 123n;
const anotherBig = BigInt('9007199254740993');

// 4. Promise.allSettled()
Promise.allSettled([
    Promise.resolve(1),
    Promise.reject('error'),
    Promise.resolve(3)
]).then(results => {
    // results 包含所有 promise 的结果，无论成功还是失败
});

// 5. globalThis
const global = globalThis; // 在所有环境中都可用

// 6. 动态 import()
// const module = await import('./module.js');

// 7. String.prototype.matchAll()
const str = 'test1test2';
const matches = [...str.matchAll(/test(\d)/g)];

// ========================================
// ES12 (ES2021) 特性
// ========================================

console.log('\n=== ES12 (ES2021) 特性 ===\n');

// 1. String.prototype.replaceAll()
const replaced = 'hello world'.replaceAll('l', 'L'); // 'heLLo worLd'

// 2. Promise.any()
Promise.any([
    Promise.reject('Error 1'),
    Promise.resolve('Success'),
    Promise.reject('Error 2')
]).then(result => {
    console.log(result); // 'Success' - 第一个成功的结果
});

// 3. WeakRef 和 FinalizationRegistry
const weakRef = new WeakRef({ data: 'value' });
const registry = new FinalizationRegistry(heldValue => {
    console.log('Object was garbage collected:', heldValue);
});

// 4. 逻辑赋值运算符
let x1 = 1;
x1 &&= 2; // x1 = x1 && 2
x1 ||= 3; // x1 = x1 || 3
x1 ??= 4; // x1 = x1 ?? 4

// 5. 数字分隔符
const largeNumber = 1_000_000; // 更易读的大数字

// ========================================
// ES13 (ES2022) 特性
// ========================================

console.log('\n=== ES13 (ES2022) 特性 ===\n');

// 1. 类的私有字段和方法
class MyClass {
    #privateField = 'private';
    #privateMethod() {
        return 'private method';
    }
    
    publicMethod() {
        return this.#privateMethod();
    }
    
    // 静态私有字段和方法
    static #staticPrivate = 'static private';
    static #staticMethod() {
        return MyClass.#staticPrivate;
    }
}

// 2. Top-level await
// const data = await fetch('/api').then(r => r.json());

// 3. at() 方法
const array = [1, 2, 3, 4, 5];
console.log(array.at(-1)); // 5 - 负索引从末尾开始

// 4. Object.hasOwn()
const hasOwn = Object.hasOwn(obj, 'prop'); // 替代 obj.hasOwnProperty('prop')

// 5. Error Cause
try {
    throw new Error('Something went wrong', { cause: 'Network error' });
} catch (error) {
    console.log(error.cause); // 'Network error'
}

// 6. 正则表达式 d 标志
const regexD = /test/d;
const matchD = regexD.exec('testing');
// matchD.indices 包含匹配的索引信息

// ========================================
// 实用代码片段
// ========================================

console.log('\n=== 实用代码片段 ===\n');

// 1. 对象深拷贝（简单版）
const deepClone = obj => JSON.parse(JSON.stringify(obj));

// 2. 数组去重
const unique = arr => [...new Set(arr)];

// 3. 对象合并
const merge = (...objects) => Object.assign({}, ...objects);

// 4. 延迟函数
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// 5. 管道函数
const pipe = (...fns) => x => fns.reduce((v, f) => f(v), x);

// 6. 柯里化
const curry = fn => (...args) =>
    args.length >= fn.length
        ? fn(...args)
        : curry(fn.bind(null, ...args));

// 7. 防抖
const debounce = (fn, delay) => {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn(...args), delay);
    };
};

// 8. 节流
const throttle = (fn, delay) => {
    let lastCall = 0;
    return (...args) => {
        const now = Date.now();
        if (now - lastCall >= delay) {
            lastCall = now;
            fn(...args);
        }
    };
};

// 9. 异步串行执行
const series = async (tasks) => {
    const results = [];
    for (const task of tasks) {
        results.push(await task());
    }
    return results;
};

// 10. 异步并行执行
const parallel = async (tasks) => {
    return Promise.all(tasks.map(task => task()));
};

console.log('\n=== ES6+ 语法速查手册完成 ===');

// ========================================
// 导出一些实用工具
// ========================================

// 如果在模块环境中，可以导出这些工具
// export {
//     deepClone,
//     unique,
//     merge,
//     delay,
//     pipe,
//     curry,
//     debounce,
//     throttle,
//     series,
//     parallel
// };