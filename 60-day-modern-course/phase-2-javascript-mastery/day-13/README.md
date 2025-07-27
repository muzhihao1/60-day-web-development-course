# Day 13: JavaScript 现代语法 (ES6+)

## 学习目标

今天我们将深入学习ES6（ECMAScript 2015）及之后版本引入的现代JavaScript语法特性。这些特性让JavaScript代码更简洁、更易读、更强大。

完成今天的学习后，你将能够：
- 理解并使用 `let` 和 `const` 替代 `var`
- 掌握解构赋值的各种用法
- 熟练使用模板字符串
- 理解箭头函数及其this绑定机制
- 使用默认参数、展开运算符和剩余参数
- 运用对象字面量增强语法
- 将传统代码重构为现代ES6+风格

## 1. let/const vs var

### 为什么要使用 let 和 const？

```javascript
// 问题1：var 的函数作用域
function varProblem() {
    if (true) {
        var x = 1;
    }
    console.log(x); // 1 - x在if块外也能访问！
}

// 解决方案：let 有块级作用域
function letSolution() {
    if (true) {
        let x = 1;
    }
    // console.log(x); // ReferenceError: x is not defined
}

// 问题2：var 的变量提升
console.log(myVar); // undefined（不是错误！）
var myVar = 5;

// let 不会提升
// console.log(myLet); // ReferenceError
let myLet = 5;

// 问题3：循环中的 var
for (var i = 0; i < 3; i++) {
    setTimeout(() => console.log(i), 100); // 输出: 3, 3, 3
}

// 使用 let 修复
for (let j = 0; j < 3; j++) {
    setTimeout(() => console.log(j), 100); // 输出: 0, 1, 2
}
```

### const 的特点

```javascript
// const 声明常量，必须初始化
const PI = 3.14159;
// PI = 3.14; // TypeError: Assignment to constant variable

// 注意：const 只保证引用不变，对象内容可以修改
const user = { name: 'Alice' };
user.name = 'Bob'; // 这是允许的
user.age = 25;     // 可以添加属性

// 但不能重新赋值
// user = { name: 'Charlie' }; // TypeError

// 数组也是如此
const numbers = [1, 2, 3];
numbers.push(4);    // 允许
numbers[0] = 10;    // 允许
// numbers = [5, 6]; // TypeError
```

### 最佳实践
1. 默认使用 `const`
2. 需要重新赋值时使用 `let`
3. 永远不要使用 `var`

## 2. 解构赋值 (Destructuring)

### 数组解构

```javascript
// 基本用法
const colors = ['red', 'green', 'blue'];
const [first, second, third] = colors;
console.log(first);  // 'red'
console.log(second); // 'green'

// 跳过元素
const [primary, , tertiary] = colors;
console.log(primary);  // 'red'
console.log(tertiary); // 'blue'

// 默认值
const [a, b, c, d = 'yellow'] = colors;
console.log(d); // 'yellow'

// 交换变量
let x = 1, y = 2;
[x, y] = [y, x];
console.log(x, y); // 2, 1

// 剩余元素
const [head, ...tail] = [1, 2, 3, 4, 5];
console.log(head); // 1
console.log(tail); // [2, 3, 4, 5]
```

### 对象解构

```javascript
// 基本用法
const person = {
    name: 'Alice',
    age: 30,
    city: 'Beijing'
};

const { name, age, city } = person;
console.log(name); // 'Alice'
console.log(age);  // 30

// 重命名变量
const { name: personName, age: personAge } = person;
console.log(personName); // 'Alice'

// 默认值
const { name, age, country = 'China' } = person;
console.log(country); // 'China'

// 嵌套解构
const user = {
    id: 1,
    profile: {
        username: 'alice123',
        email: 'alice@example.com'
    }
};

const { profile: { username, email } } = user;
console.log(username); // 'alice123'

// 函数参数解构
function greet({ name, age = 18 }) {
    console.log(`Hello ${name}, you are ${age} years old`);
}

greet({ name: 'Bob' }); // Hello Bob, you are 18 years old
```

## 3. 模板字符串 (Template Literals)

```javascript
// 传统字符串拼接
const name = 'Alice';
const age = 30;
const oldWay = 'Hello, my name is ' + name + ' and I am ' + age + ' years old.';

// 模板字符串
const newWay = `Hello, my name is ${name} and I am ${age} years old.`;

// 多行字符串
const multiline = `
    This is a
    multi-line
    string
`;

// 表达式计算
const price = 99.99;
const tax = 0.08;
console.log(`Total: $${(price * (1 + tax)).toFixed(2)}`); // Total: $107.99

// 标签模板
function highlight(strings, ...values) {
    return strings.reduce((result, str, i) => {
        return result + str + (values[i] ? `<strong>${values[i]}</strong>` : '');
    }, '');
}

const product = 'iPhone';
const cost = 999;
const html = highlight`The ${product} costs $${cost}.`;
console.log(html); // The <strong>iPhone</strong> costs $<strong>999</strong>.
```

## 4. 箭头函数 (Arrow Functions)

### 基本语法

```javascript
// 传统函数
function add(a, b) {
    return a + b;
}

// 箭头函数
const add = (a, b) => a + b;

// 单参数可省略括号
const double = x => x * 2;

// 无参数需要空括号
const greet = () => console.log('Hello!');

// 多行函数体需要花括号和return
const calculate = (x, y) => {
    const sum = x + y;
    const product = x * y;
    return { sum, product };
};
```

### this 绑定差异

```javascript
// 传统函数的 this
const obj1 = {
    name: 'Object 1',
    greet: function() {
        console.log(this.name); // 'Object 1'
        
        setTimeout(function() {
            console.log(this.name); // undefined (this 指向 window)
        }, 1000);
    }
};

// 箭头函数的 this
const obj2 = {
    name: 'Object 2',
    greet: function() {
        console.log(this.name); // 'Object 2'
        
        setTimeout(() => {
            console.log(this.name); // 'Object 2' (继承外层 this)
        }, 1000);
    }
};

// 注意：箭头函数不适合作为方法
const obj3 = {
    name: 'Object 3',
    greet: () => {
        console.log(this.name); // undefined (箭头函数没有自己的 this)
    }
};
```

### 使用场景

```javascript
// 数组方法中特别有用
const numbers = [1, 2, 3, 4, 5];

// 传统写法
const doubled1 = numbers.map(function(n) {
    return n * 2;
});

// 箭头函数
const doubled2 = numbers.map(n => n * 2);

// 链式调用
const result = numbers
    .filter(n => n % 2 === 0)
    .map(n => n * n)
    .reduce((sum, n) => sum + n, 0);
```

## 5. 默认参数 (Default Parameters)

```javascript
// 传统方式
function greetOld(name, greeting) {
    greeting = greeting || 'Hello';
    return greeting + ', ' + name + '!';
}

// ES6 默认参数
function greetNew(name, greeting = 'Hello') {
    return `${greeting}, ${name}!`;
}

console.log(greetNew('Alice'));           // 'Hello, Alice!'
console.log(greetNew('Bob', 'Hi'));       // 'Hi, Bob!'

// 默认参数可以是表达式
function createUser(name, id = Date.now()) {
    return { name, id };
}

// 后面的参数可以使用前面的参数
function greetWithTitle(first, last, title = `Mr. ${last}`) {
    return `${title}, ${first} ${last}`;
}
```

## 6. 展开运算符和剩余参数 (Spread & Rest)

### 展开运算符 (Spread)

```javascript
// 数组展开
const arr1 = [1, 2, 3];
const arr2 = [4, 5, 6];
const combined = [...arr1, ...arr2]; // [1, 2, 3, 4, 5, 6]

// 复制数组
const original = [1, 2, 3];
const copy = [...original]; // 创建新数组，而不是引用

// 函数调用
const numbers = [5, 6, 7];
console.log(Math.max(...numbers)); // 7

// 对象展开 (ES2018)
const person = { name: 'Alice', age: 30 };
const details = { city: 'Beijing', country: 'China' };
const fullProfile = { ...person, ...details };
// { name: 'Alice', age: 30, city: 'Beijing', country: 'China' }

// 覆盖属性
const updated = { ...person, age: 31 };
// { name: 'Alice', age: 31 }
```

### 剩余参数 (Rest)

```javascript
// 函数参数
function sum(...numbers) {
    return numbers.reduce((total, n) => total + n, 0);
}

console.log(sum(1, 2, 3));       // 6
console.log(sum(1, 2, 3, 4, 5)); // 15

// 结合普通参数
function introduce(greeting, ...names) {
    return `${greeting} ${names.join(' and ')}!`;
}

console.log(introduce('Hello', 'Alice', 'Bob', 'Charlie'));
// 'Hello Alice and Bob and Charlie!'

// 解构中的剩余
const [first, ...rest] = [1, 2, 3, 4, 5];
console.log(first); // 1
console.log(rest);  // [2, 3, 4, 5]

const { name, ...otherInfo } = { name: 'Alice', age: 30, city: 'Beijing' };
console.log(name);      // 'Alice'
console.log(otherInfo); // { age: 30, city: 'Beijing' }
```

## 7. 对象字面量增强 (Enhanced Object Literals)

```javascript
// 属性简写
const name = 'Alice';
const age = 30;

// 传统方式
const person1 = {
    name: name,
    age: age
};

// ES6 简写
const person2 = { name, age };

// 方法简写
const calculator = {
    // 传统方式
    add: function(a, b) {
        return a + b;
    },
    
    // ES6 简写
    subtract(a, b) {
        return a - b;
    }
};

// 计算属性名
const prefix = 'user';
const id = 123;

const user = {
    [`${prefix}_${id}`]: 'Alice',
    [`${prefix}_age`]: 30
};
// { user_123: 'Alice', user_age: 30 }

// 综合示例
function createPerson(name, age) {
    return {
        // 属性简写
        name,
        age,
        
        // 方法简写
        greet() {
            console.log(`Hello, I'm ${this.name}`);
        },
        
        // 计算属性
        [`is${age >= 18 ? 'Adult' : 'Minor'}`]: true
    };
}
```

## 常见陷阱和最佳实践

### 1. 箭头函数陷阱

```javascript
// 错误：箭头函数作为构造函数
// const Person = (name) => {
//     this.name = name; // TypeError: Person is not a constructor
// };

// 正确：使用传统函数或class
class Person {
    constructor(name) {
        this.name = name;
    }
}

// 错误：箭头函数没有 arguments
const sum = () => {
    // console.log(arguments); // ReferenceError
};

// 正确：使用剩余参数
const sum = (...args) => {
    return args.reduce((a, b) => a + b, 0);
};
```

### 2. 解构陷阱

```javascript
// 小心 undefined 和 null
const { name } = null; // TypeError

// 使用默认值保护
const { name = 'Unknown' } = person || {};

// 深层解构的安全处理
const user = {};
// const { profile: { email } } = user; // TypeError

// 安全的方式
const { profile: { email } = {} } = user;
```

### 3. const 误解

```javascript
// const 不意味着值不可变
const obj = { count: 0 };
obj.count++; // 这是允许的

// 真正的不可变需要 Object.freeze
const frozen = Object.freeze({ count: 0 });
// frozen.count++; // 静默失败或在严格模式下报错
```

## 自测题目

### 1. 作用域理解
```javascript
// 这段代码的输出是什么？为什么？
for (let i = 0; i < 3; i++) {
    setTimeout(() => console.log(i), 100);
}

for (var j = 0; j < 3; j++) {
    setTimeout(() => console.log(j), 200);
}
```

### 2. 解构练习
```javascript
// 使用解构完成以下任务：
const data = {
    user: {
        name: 'Alice',
        scores: [85, 92, 78, 95]
    }
};

// 任务：提取name和第一个分数，给它们起别名
// 你的代码：
```

### 3. 箭头函数this绑定
```javascript
// 修复这段代码，使其正确输出计数
const counter = {
    count: 0,
    increment: () => {
        this.count++;
        console.log(this.count);
    }
};

counter.increment(); // 应该输出 1
```

### 4. 现代语法综合
```javascript
// 将这个传统函数改写为使用ES6+特性
function processUsers(users) {
    var results = [];
    for (var i = 0; i < users.length; i++) {
        var user = users[i];
        if (user.age >= 18) {
            results.push({
                name: user.name,
                email: user.email,
                isAdult: true
            });
        }
    }
    return results;
}
```

## 今日总结

今天我们学习了ES6+的核心语法特性，这些特性是现代JavaScript开发的基础。熟练掌握这些语法不仅能让你的代码更简洁优雅，还能避免许多传统JavaScript的陷阱。

记住：
- 始终使用 `const` 和 `let`，避免 `var`
- 解构赋值让数据提取更简单
- 箭头函数简化语法但要注意this绑定
- 模板字符串让字符串处理更直观
- 展开运算符和默认参数提高代码灵活性

明天我们将学习如何操作DOM，将JavaScript与网页元素连接起来！