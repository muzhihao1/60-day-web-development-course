---
title: "JavaScript模块系统对比"
description: "比较不同的JavaScript模块系统及其使用场景"
---

## CommonJS (CJS)

```javascript
// math.js - CommonJS导出
const add = (a, b) => a + b;
const subtract = (a, b) => a - b;

module.exports = {
  add,
  subtract
};

// 或者单独导出
module.exports.multiply = (a, b) => a * b;
exports.divide = (a, b) => a / b;

// main.js - CommonJS导入
const math = require('./math');
const { add, subtract } = require('./math');

console.log(math.add(5, 3));        // 8
console.log(add(5, 3));             // 8

// 动态导入
const moduleName = './math';
const dynamicMath = require(moduleName);

// 条件导入
if (process.env.NODE_ENV === 'production') {
  const prodModule = require('./prod-module');
}
```

## ES Modules (ESM)

```javascript
// math.js - ES模块导出
export const add = (a, b) => a + b;
export const subtract = (a, b) => a - b;

// 默认导出
export default class Calculator {
  add(a, b) { return a + b; }
  subtract(a, b) { return a - b; }
}

// 命名导出
export { multiply, divide };

function multiply(a, b) { return a * b; }
function divide(a, b) { return a / b; }

// main.js - ES模块导入
import Calculator from './math.js';
import { add, subtract } from './math.js';
import * as math from './math.js';

// 重命名导入
import { add as addition } from './math.js';

// 动态导入（返回Promise）
const loadMath = async () => {
  const math = await import('./math.js');
  console.log(math.add(5, 3));
};

// 条件动态导入
if (condition) {
  import('./optional-module.js').then(module => {
    module.doSomething();
  });
}
```

## AMD (Asynchronous Module Definition)

```javascript
// math.js - AMD定义模块
define('math', [], function() {
  return {
    add: function(a, b) { return a + b; },
    subtract: function(a, b) { return a - b; }
  };
});

// 带依赖的模块
define('calculator', ['math', 'utils'], function(math, utils) {
  return {
    calculate: function(a, b) {
      const sum = math.add(a, b);
      return utils.format(sum);
    }
  };
});

// main.js - AMD加载模块
require(['math'], function(math) {
  console.log(math.add(5, 3));
});

// 配置RequireJS
requirejs.config({
  baseUrl: 'js/lib',
  paths: {
    app: '../app',
    jquery: 'jquery-3.6.0.min'
  },
  shim: {
    'backbone': {
      deps: ['underscore', 'jquery'],
      exports: 'Backbone'
    }
  }
});
```

## UMD (Universal Module Definition)

```javascript
// math.js - UMD模块定义
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD
    define(['exports'], factory);
  } else if (typeof module === 'object' && typeof module.exports === 'object') {
    // CommonJS
    factory(module.exports);
  } else {
    // 浏览器全局变量
    root.Math = {};
    factory(root.Math);
  }
}(typeof self !== 'undefined' ? self : this, function (exports) {
  // 模块代码
  exports.add = function(a, b) { return a + b; };
  exports.subtract = function(a, b) { return a - b; };
}));
```

## SystemJS

```javascript
// math.js - SystemJS模块
System.register([], function(exports) {
  'use strict';
  
  function add(a, b) {
    return a + b;
  }
  
  function subtract(a, b) {
    return a - b;
  }
  
  exports('add', add);
  exports('subtract', subtract);
  
  return {
    execute: function() {
      console.log('Math module loaded');
    }
  };
});

// 加载模块
System.import('math').then(function(math) {
  console.log(math.add(5, 3));
});

// 配置SystemJS
System.config({
  baseURL: '/app',
  map: {
    'plugin-babel': 'path/to/plugin-babel.js',
    'systemjs-babel-build': 'path/to/systemjs-babel-browser.js'
  },
  transpiler: 'plugin-babel'
});
```

## 在构建工具中的配置

### Webpack配置不同模块系统

```javascript
// webpack.config.js
module.exports = {
  // 输出格式配置
  output: {
    library: 'MyLibrary',
    libraryTarget: 'umd',  // 可选: 'var', 'commonjs', 'commonjs2', 'amd', 'umd', 'system'
    globalObject: 'this'
  },
  
  // 外部依赖配置
  externals: {
    react: {
      commonjs: 'react',
      commonjs2: 'react',
      amd: 'react',
      root: 'React'
    }
  },
  
  // 解析配置
  resolve: {
    mainFields: ['browser', 'module', 'main'],  // 解析顺序
    extensions: ['.mjs', '.js', '.json']
  }
};
```

### Vite中的模块处理

```javascript
// vite.config.js
export default {
  // 构建输出格式
  build: {
    lib: {
      entry: './src/index.js',
      formats: ['es', 'cjs', 'umd'],
      fileName: (format) => `my-lib.${format}.js`
    },
    rollupOptions: {
      external: ['react'],
      output: {
        globals: {
          react: 'React'
        }
      }
    }
  },
  
  // 优化依赖
  optimizeDeps: {
    include: ['some-cjs-module'],  // 强制预构建
    exclude: ['some-es-module']     // 排除预构建
  }
};
```

## 模块系统转换

### Babel配置

```javascript
// .babelrc
{
  "presets": [
    ["@babel/preset-env", {
      "modules": false,  // 保留ES模块，让打包工具处理
      "targets": {
        "browsers": ["last 2 versions"]
      }
    }]
  ],
  "plugins": [
    "@babel/plugin-transform-modules-commonjs",  // 转换为CommonJS
    "@babel/plugin-transform-modules-amd",        // 转换为AMD
    "@babel/plugin-transform-modules-umd"         // 转换为UMD
  ]
}
```

### TypeScript配置

```json
// tsconfig.json
{
  "compilerOptions": {
    "module": "esnext",        // 输出模块格式: "none", "commonjs", "amd", "system", "umd", "es2015", "esnext"
    "moduleResolution": "node", // 模块解析策略
    "esModuleInterop": true,   // 启用ES模块互操作
    "allowSyntheticDefaultImports": true
  }
}
```

## 实际应用示例

### 同构JavaScript（同时支持Node和浏览器）

```javascript
// utils.js
(function(global, factory) {
  // 检测环境并适配
  if (typeof module === 'object' && typeof module.exports === 'object') {
    // Node.js
    module.exports = factory(require('fs'), require('path'));
  } else if (typeof define === 'function' && define.amd) {
    // AMD
    define(['fs', 'path'], factory);
  } else {
    // 浏览器
    global.Utils = factory();
  }
}(typeof window !== 'undefined' ? window : this, function(fs, path) {
  // 条件代码
  const isNode = typeof process !== 'undefined' && process.versions && process.versions.node;
  
  return {
    readFile: isNode ? 
      function(filename) { return fs.readFileSync(filename, 'utf8'); } :
      function(url) { return fetch(url).then(r => r.text()); },
      
    joinPath: isNode ?
      function(...args) { return path.join(...args); } :
      function(...args) { return args.join('/'); }
  };
}));
```

### 动态导入示例

```javascript
// router.js - 路由懒加载
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
    path: '/admin',
    component: () => import(
      /* webpackChunkName: "admin" */
      './pages/Admin.js'
    )
  }
];

// 条件加载polyfill
async function loadPolyfills() {
  if (!window.Promise) {
    await import('promise-polyfill');
  }
  if (!window.fetch) {
    await import('whatwg-fetch');
  }
}

// 按需加载大型库
document.getElementById('chart-btn').addEventListener('click', async () => {
  const { Chart } = await import('chart.js');
  new Chart(ctx, config);
});
```