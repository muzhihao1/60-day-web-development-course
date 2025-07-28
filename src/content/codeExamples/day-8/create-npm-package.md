---
title: "创建npm包的完整示例"
description: "从零开始创建一个功能完整的npm包"
---

## 项目结构

```
my-string-utils/
├── src/
│   ├── index.js
│   ├── capitalize.js
│   ├── camelCase.js
│   └── truncate.js
├── tests/
│   ├── capitalize.test.js
│   ├── camelCase.test.js
│   └── truncate.test.js
├── examples/
│   └── demo.js
├── .gitignore
├── .npmignore
├── .eslintrc.json
├── .prettierrc
├── package.json
├── README.md
├── LICENSE
└── CHANGELOG.md
```

## 主入口文件

```javascript
// src/index.js
const capitalize = require('./capitalize');
const camelCase = require('./camelCase');
const truncate = require('./truncate');

module.exports = {
  capitalize,
  camelCase,
  truncate
};

// 支持ES模块
module.exports.default = module.exports;
```

## 功能实现

```javascript
// src/capitalize.js
/**
 * 将字符串的首字母大写
 * @param {string} str - 输入字符串
 * @returns {string} 首字母大写的字符串
 * @example
 * capitalize('hello world') // 'Hello world'
 */
function capitalize(str) {
  if (typeof str !== 'string') {
    throw new TypeError('Expected a string');
  }
  
  if (str.length === 0) {
    return str;
  }
  
  return str.charAt(0).toUpperCase() + str.slice(1);
}

module.exports = capitalize;
```

```javascript
// src/camelCase.js
/**
 * 将字符串转换为驼峰格式
 * @param {string} str - 输入字符串
 * @returns {string} 驼峰格式字符串
 * @example
 * camelCase('hello world') // 'helloWorld'
 * camelCase('foo-bar-baz') // 'fooBarBaz'
 */
function camelCase(str) {
  if (typeof str !== 'string') {
    throw new TypeError('Expected a string');
  }
  
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    })
    .replace(/[\s-_]+/g, '');
}

module.exports = camelCase;
```

## 测试用例

```javascript
// tests/capitalize.test.js
const capitalize = require('../src/capitalize');

describe('capitalize', () => {
  test('capitalizes first letter', () => {
    expect(capitalize('hello')).toBe('Hello');
    expect(capitalize('WORLD')).toBe('WORLD');
  });
  
  test('handles empty string', () => {
    expect(capitalize('')).toBe('');
  });
  
  test('handles single character', () => {
    expect(capitalize('a')).toBe('A');
    expect(capitalize('A')).toBe('A');
  });
  
  test('throws on non-string input', () => {
    expect(() => capitalize(123)).toThrow(TypeError);
    expect(() => capitalize(null)).toThrow(TypeError);
  });
});
```

## package.json完整配置

```json
{
  "name": "my-string-utils",
  "version": "1.0.0",
  "description": "A collection of useful string manipulation functions",
  "keywords": [
    "string",
    "utils",
    "utility",
    "capitalize",
    "camelcase",
    "truncate"
  ],
  "homepage": "https://github.com/username/my-string-utils#readme",
  "bugs": {
    "url": "https://github.com/username/my-string-utils/issues"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/username/my-string-utils.git"
  },
  "license": "MIT",
  "author": {
    "name": "Your Name",
    "email": "you@example.com",
    "url": "https://yourwebsite.com"
  },
  "main": "src/index.js",
  "files": [
    "src"
  ],
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint src tests",
    "lint:fix": "eslint src tests --fix",
    "format": "prettier --write \"**/*.{js,json,md}\"",
    "prepare": "husky install",
    "prepublishOnly": "npm run lint && npm test",
    "preversion": "npm run lint",
    "version": "npm run format && git add -A",
    "postversion": "git push && git push --tags"
  },
  "devDependencies": {
    "@babel/core": "^7.20.0",
    "@babel/preset-env": "^7.20.0",
    "babel-jest": "^29.0.0",
    "eslint": "^8.0.0",
    "husky": "^8.0.0",
    "jest": "^29.0.0",
    "lint-staged": "^13.0.0",
    "prettier": "^2.8.0"
  },
  "engines": {
    "node": ">=12.0.0"
  },
  "lint-staged": {
    "*.js": [
      "eslint --fix",
      "prettier --write",
      "jest --findRelatedTests"
    ],
    "*.{json,md}": [
      "prettier --write"
    ]
  },
  "jest": {
    "testEnvironment": "node",
    "coverageDirectory": "coverage",
    "collectCoverageFrom": [
      "src/**/*.js"
    ]
  }
}
```

## README模板

```markdown
# my-string-utils

> A collection of useful string manipulation functions

[![npm version](https://badge.fury.io/js/my-string-utils.svg)](https://www.npmjs.com/package/my-string-utils)
[![Build Status](https://github.com/username/my-string-utils/workflows/CI/badge.svg)](https://github.com/username/my-string-utils/actions)
[![Coverage Status](https://coveralls.io/repos/github/username/my-string-utils/badge.svg)](https://coveralls.io/github/username/my-string-utils)

## Installation

```bash
npm install my-string-utils
```

## Usage

```javascript
const { capitalize, camelCase, truncate } = require('my-string-utils');

// Capitalize first letter
console.log(capitalize('hello world')); // 'Hello world'

// Convert to camelCase
console.log(camelCase('foo-bar-baz')); // 'fooBarBaz'

// Truncate string
console.log(truncate('Lorem ipsum dolor sit amet', 10)); // 'Lorem ipsu...'
```

## API

### capitalize(string)

Capitalizes the first letter of a string.

### camelCase(string)

Converts a string to camelCase.

### truncate(string, length, [suffix])

Truncates a string to specified length.

## License

MIT © [Your Name](https://yourwebsite.com)
```

## 使用示例

```javascript
// examples/demo.js
const { capitalize, camelCase, truncate } = require('../src');

// 基本使用
console.log('=== 基本使用示例 ===');
console.log(capitalize('hello world'));        // Hello world
console.log(camelCase('foo-bar-baz'));        // fooBarBaz
console.log(truncate('这是一个很长的字符串', 10)); // 这是一个很长的字符...

// 实际应用场景
console.log('\n=== 实际应用场景 ===');

// 处理用户输入
const userInput = '  john doe  ';
const formattedName = capitalize(userInput.trim());
console.log(`欢迎, ${formattedName}!`); // 欢迎, John doe!

// 转换API响应字段
const apiResponse = {
  'user-name': 'Alice',
  'last-login-time': '2024-01-27',
  'is-active': true
};

const camelCased = {};
for (const [key, value] of Object.entries(apiResponse)) {
  camelCased[camelCase(key)] = value;
}
console.log(camelCased);
// { userName: 'Alice', lastLoginTime: '2024-01-27', isActive: true }

// 显示摘要
const articles = [
  { title: '如何学习JavaScript', content: '学习JavaScript需要耐心和练习...' },
  { title: 'Node.js入门指南', content: 'Node.js是一个基于Chrome V8引擎的JavaScript运行环境...' }
];

articles.forEach(article => {
  console.log(`${article.title}: ${truncate(article.content, 20)}`);
});
```