---
title: "ES Modules基础用法"
category: "basic"
language: "javascript"
---

# ES Modules基础用法

## 导出语法

```javascript
// math.js - 各种导出方式
// 1. 命名导出
export const PI = 3.14159;
export const E = 2.71828;

// 2. 导出函数
export function add(a, b) {
  return a + b;
}

export function subtract(a, b) {
  return a - b;
}

// 3. 导出类
export class Calculator {
  constructor() {
    this.result = 0;
  }
  
  add(value) {
    this.result += value;
    return this;
  }
  
  subtract(value) {
    this.result -= value;
    return this;
  }
  
  getResult() {
    return this.result;
  }
}

// 4. 批量导出
const multiply = (a, b) => a * b;
const divide = (a, b) => a / b;
const power = (a, b) => Math.pow(a, b);

export { multiply, divide, power };

// 5. 重命名导出
const sqrt = Math.sqrt;
export { sqrt as squareRoot };

// 6. 默认导出
export default {
  name: 'Math Utils',
  version: '1.0.0',
  constants: { PI, E }
};
```

## 导入语法

```javascript
// main.js - 各种导入方式
// 1. 命名导入
import { PI, E } from './math.js';
console.log(`PI = ${PI}, E = ${E}`);

// 2. 导入多个成员
import { add, subtract, multiply, divide } from './math.js';
console.log(add(5, 3)); // 8

// 3. 重命名导入
import { squareRoot as sqrt } from './math.js';
console.log(sqrt(16)); // 4

// 4. 导入所有
import * as MathUtils from './math.js';
console.log(MathUtils.PI); // 3.14159
console.log(MathUtils.add(2, 3)); // 5

// 5. 默认导入
import mathInfo from './math.js';
console.log(mathInfo.name); // 'Math Utils'

// 6. 混合导入
import defaultExport, { Calculator, power } from './math.js';

// 7. 仅执行模块（副作用）
import './init.js'; // 只执行模块代码，不导入任何内容
```

## 模块作用域和特性

```javascript
// scope.js - 模块作用域演示
// 私有变量（不导出的内容外部无法访问）
const privateSecret = 'This is hidden';
let moduleState = 0;

// 公共函数可以访问私有变量
export function incrementState() {
  moduleState++;
  console.log(`State is now: ${moduleState}`);
}

export function getState() {
  return moduleState;
}

// 模块级别的初始化代码（只执行一次）
console.log('Module initialized!');

// IIFE不再需要
// 传统方式
// (function() {
//   // 私有作用域
// })();

// 模块自动提供私有作用域
```

## 循环依赖处理

```javascript
// moduleA.js
import { functionB } from './moduleB.js';

export function functionA() {
  console.log('Function A calling B');
  functionB();
}

// 在模块初始化时调用会有问题
// functionB(); // 可能是 undefined

// 延迟调用没问题
setTimeout(() => {
  functionB(); // 正常工作
}, 0);

// moduleB.js
import { functionA } from './moduleA.js';

export function functionB() {
  console.log('Function B');
}

// 导出后再调用A是安全的
export function callA() {
  functionA();
}
```

## 动态导入

```javascript
// dynamic-import.js
// 1. 基本动态导入
async function loadMathModule() {
  const math = await import('./math.js');
  console.log(math.PI);
  console.log(math.add(5, 3));
}

// 2. 条件导入
async function loadFeature(featureName) {
  try {
    const module = await import(`./features/${featureName}.js`);
    return module.default;
  } catch (error) {
    console.error(`Failed to load feature: ${featureName}`);
    return null;
  }
}

// 3. 懒加载组件
class LazyComponent {
  constructor(componentPath) {
    this.componentPath = componentPath;
    this.component = null;
  }
  
  async load() {
    if (!this.component) {
      const module = await import(this.componentPath);
      this.component = module.default;
    }
    return this.component;
  }
}

// 4. 路由懒加载
const routes = [
  {
    path: '/home',
    component: () => import('./pages/Home.js')
  },
  {
    path: '/about',
    component: () => import('./pages/About.js')
  },
  {
    path: '/user/:id',
    component: () => import('./pages/User.js')
  }
];

// 5. 按需加载polyfills
async function loadPolyfills() {
  const promises = [];
  
  if (!window.Promise) {
    promises.push(import('promise-polyfill'));
  }
  
  if (!window.fetch) {
    promises.push(import('whatwg-fetch'));
  }
  
  if (!Element.prototype.closest) {
    promises.push(import('element-closest-polyfill'));
  }
  
  await Promise.all(promises);
}
```

## 模块模式实践

```javascript
// 1. 单例模式
// singleton.js
class Database {
  constructor() {
    this.connection = null;
  }
  
  connect() {
    if (!this.connection) {
      this.connection = { /* 数据库连接 */ };
      console.log('Database connected');
    }
    return this.connection;
  }
}

// 导出单例实例
export default new Database();

// 使用
// import db from './singleton.js';
// db.connect(); // 首次调用建立连接
// db.connect(); // 后续调用返回相同连接

// 2. 工厂模式
// factory.js
class Product {
  constructor(name, price) {
    this.name = name;
    this.price = price;
  }
}

class DigitalProduct extends Product {
  constructor(name, price, downloadUrl) {
    super(name, price);
    this.downloadUrl = downloadUrl;
  }
}

class PhysicalProduct extends Product {
  constructor(name, price, weight) {
    super(name, price);
    this.weight = weight;
  }
}

export function createProduct(type, ...args) {
  switch (type) {
    case 'digital':
      return new DigitalProduct(...args);
    case 'physical':
      return new PhysicalProduct(...args);
    default:
      throw new Error(`Unknown product type: ${type}`);
  }
}

// 3. 观察者模式
// observer.js
export class EventEmitter {
  constructor() {
    this.events = new Map();
  }
  
  on(event, callback) {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event).push(callback);
  }
  
  off(event, callback) {
    if (this.events.has(event)) {
      const callbacks = this.events.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }
  
  emit(event, ...args) {
    if (this.events.has(event)) {
      this.events.get(event).forEach(callback => {
        callback(...args);
      });
    }
  }
}
```

## 在HTML中使用模块

```html
<!DOCTYPE html>
<html>
<head>
  <title>ES Modules in Browser</title>
</head>
<body>
  <!-- 使用type="module"启用ES模块 -->
  <script type="module">
    import { greet } from './modules/greet.js';
    greet('World');
  </script>
  
  <!-- 外部模块脚本 -->
  <script type="module" src="./app.js"></script>
  
  <!-- 传统脚本（非模块） -->
  <script nomodule>
    // 为不支持模块的浏览器提供降级方案
    console.log('Your browser does not support ES modules');
  </script>
  
  <!-- 预加载模块 -->
  <link rel="modulepreload" href="./modules/heavy.js">
</body>
</html>
```