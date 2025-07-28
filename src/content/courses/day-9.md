---
day: 9
phase: "modern-web"
title: "Build Tools深入：Webpack与Vite完全指南"
description: "深入理解现代前端构建工具的原理和使用，掌握Webpack和Vite的配置与优化技巧"
objectives:
  - "理解为什么需要构建工具"
  - "掌握模块系统的演进历史"
  - "学会配置Webpack的核心功能"
  - "理解Vite的革命性特性"
  - "对比两种工具的优缺点"
  - "实践开发和生产环境配置"
estimatedTime: 90
difficulty: "intermediate"
prerequisites: [1, 8]
tags:
  - "webpack"
  - "vite"
  - "构建工具"
  - "模块打包"
  - "HMR"
resources:
  - title: "Webpack官方文档"
    url: "https://webpack.js.org/concepts/"
    type: "documentation"
  - title: "Vite官方文档"
    url: "https://cn.vitejs.dev/guide/"
    type: "documentation"
  - title: "深入浅出Webpack"
    url: "https://webpack.wuhaolin.cn/"
    type: "documentation"
  - title: "ESM vs CommonJS"
    url: "https://www.sitepoint.com/understanding-es6-modules/"
    type: "article"
---

# Day 09: Build Tools深入：Webpack与Vite完全指南

## 📋 学习目标

今天我们将深入探索现代前端构建工具的世界。构建工具是现代Web开发的基石，它们让我们能够使用最新的JavaScript特性、模块化开发、资源优化等。

- 理解为什么需要构建工具
- 掌握模块系统的演进历史
- 学会配置Webpack的核心功能
- 理解Vite的革命性特性
- 对比两种工具的优缺点
- 实践开发和生产环境配置

## ⏱️ 每日代码仪式（5分钟）

### 环境准备

```bash
# 创建今天的练习目录
mkdir day09-build-tools
cd day09-build-tools

# 创建两个项目目录
mkdir webpack-demo vite-demo

# 初始化项目结构
mkdir -p webpack-demo/{src,dist,public}
mkdir -p vite-demo/{src,public}

# 创建基础文件
touch webpack-demo/src/index.js
touch vite-demo/src/main.js
touch webpack-demo/public/index.html
touch vite-demo/index.html
```

### 准备测试文件

```bash
# 创建一些模块文件用于测试
cat > webpack-demo/src/math.js << 'EOF'
export function add(a, b) {
  return a + b;
}

export function subtract(a, b) {
  return a - b;
}

export function multiply(a, b) {
  return a * b;
}

export function divide(a, b) {
  if (b === 0) {
    throw new Error('Division by zero');
  }
  return a / b;
}
EOF

# 复制到vite项目
cp webpack-demo/src/math.js vite-demo/src/
```

## 🤔 为什么需要构建工具？（15分钟）

### 前端开发的痛点

在没有构建工具之前，前端开发面临许多挑战：

1. **浏览器兼容性问题**
   - 新的JavaScript特性不被老浏览器支持
   - CSS前缀需要手动添加
   - 不同浏览器的API差异

2. **代码组织困难**
   - 全局变量污染
   - 依赖关系难以管理
   - 代码复用困难

3. **性能优化复杂**
   - 手动合并和压缩文件
   - 资源加载顺序管理
   - 缓存策略实施困难

4. **开发体验差**
   - 修改代码需要手动刷新
   - 错误调试困难
   - 缺少现代开发工具支持

### 构建工具解决了什么？

```javascript
// 使用ES6+语法
import { format } from 'date-fns';
import './styles/main.scss';
import logo from './assets/logo.png';

// 使用最新的JavaScript特性
const greeting = (name = 'World') => {
  const message = `Hello, ${name}!`;
  console.log(message);
  return message;
};

// 使用async/await
async function fetchData() {
  try {
    const response = await fetch('/api/data');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch data:', error);
  }
}

// 使用CSS Modules
import styles from './Button.module.css';

// 构建工具会：
// 1. 转译ES6+到ES5
// 2. 编译SCSS到CSS
// 3. 处理图片导入
// 4. 打包所有模块
// 5. 优化输出文件
```

### 构建工具的核心功能

1. **模块打包** - 将多个模块合并成一个或多个bundle
2. **代码转译** - 将新语法转换为浏览器兼容的代码
3. **资源处理** - 处理CSS、图片、字体等资源
4. **代码优化** - 压缩、Tree Shaking、代码分割
5. **开发服务器** - 提供热更新、代理等功能
6. **Source Map** - 方便调试的源码映射

## 📦 模块系统演进史（20分钟）

### 1. 全局函数模式（最原始）

```javascript
// math.js
function add(a, b) {
  return a + b;
}

function subtract(a, b) {
  return a - b;
}

// main.js
var result = add(5, 3); // 全局函数，容易冲突
```

### 2. 命名空间模式

```javascript
// 使用对象作为命名空间
var MyApp = MyApp || {};

MyApp.math = {
  add: function(a, b) {
    return a + b;
  },
  subtract: function(a, b) {
    return a - b;
  }
};

// 使用
var result = MyApp.math.add(5, 3);
```

### 3. IIFE模式（立即执行函数）

```javascript
// 模块模式
var mathModule = (function() {
  // 私有变量
  var privateCounter = 0;
  
  // 私有函数
  function log(message) {
    console.log(`[Math Module]: ${message}`);
    privateCounter++;
  }
  
  // 公开的API
  return {
    add: function(a, b) {
      log(`Adding ${a} + ${b}`);
      return a + b;
    },
    getCallCount: function() {
      return privateCounter;
    }
  };
})();

// 使用
mathModule.add(5, 3); // 8
mathModule.getCallCount(); // 1
```

### 4. CommonJS（Node.js）

```javascript
// math.js
const privateHelper = () => {
  console.log('This is private');
};

function add(a, b) {
  return a + b;
}

function subtract(a, b) {
  return a - b;
}

// 导出
module.exports = {
  add,
  subtract
};

// 或者
exports.multiply = function(a, b) {
  return a * b;
};

// main.js
// 导入
const math = require('./math');
const { add, subtract } = require('./math');

console.log(math.add(5, 3));
console.log(add(5, 3));
```

### 5. AMD（Asynchronous Module Definition）

```javascript
// 定义模块
define('math', ['dependency'], function(dep) {
  return {
    add: function(a, b) {
      return a + b;
    },
    subtract: function(a, b) {
      return a - b;
    }
  };
});

// 使用模块
require(['math'], function(math) {
  console.log(math.add(5, 3));
});
```

### 6. UMD（Universal Module Definition）

```javascript
// 同时支持CommonJS、AMD和全局变量
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD
    define(['exports'], factory);
  } else if (typeof exports === 'object' && typeof exports.nodeName !== 'string') {
    // CommonJS
    factory(exports);
  } else {
    // 全局变量
    factory((root.mathModule = {}));
  }
}(typeof self !== 'undefined' ? self : this, function (exports) {
  exports.add = function(a, b) {
    return a + b;
  };
}));
```

### 7. ES Modules（ES6标准）

```javascript
// math.js
// 命名导出
export function add(a, b) {
  return a + b;
}

export function subtract(a, b) {
  return a - b;
}

// 默认导出
export default {
  add,
  subtract
};

// 导出变量
export const PI = 3.14159;

// 导出类
export class Calculator {
  constructor() {
    this.result = 0;
  }
}

// main.js
// 导入命名导出
import { add, subtract, PI } from './math.js';

// 导入默认导出
import math from './math.js';

// 混合导入
import mathDefault, { add as addition } from './math.js';

// 导入所有
import * as mathLib from './math.js';

// 动态导入
const loadMath = async () => {
  const math = await import('./math.js');
  return math.add(5, 3);
};
```

### 模块系统对比

| 特性 | CommonJS | AMD | ES Modules |
|------|----------|-----|------------|
| 加载方式 | 同步 | 异步 | 静态/异步 |
| 运行环境 | Node.js | 浏览器 | 通用 |
| 语法 | require/exports | define/require | import/export |
| 动态导入 | 支持 | 原生支持 | 支持 |
| Tree Shaking | 不支持 | 不支持 | 支持 |
| 循环依赖 | 支持 | 支持 | 支持 |

## ⚙️ Webpack核心概念（25分钟）

### Webpack是什么？

Webpack是一个现代JavaScript应用程序的静态模块打包器。它将应用程序所需的每个模块打包成一个或多个bundle。

### 核心概念

#### 1. Entry（入口）

指示Webpack应该使用哪个模块作为构建依赖图的开始：

```javascript
// webpack.config.js
module.exports = {
  // 单入口
  entry: './src/index.js',
  
  // 多入口
  entry: {
    app: './src/app.js',
    admin: './src/admin.js',
    vendor: ['react', 'react-dom']
  },
  
  // 动态入口
  entry: () => {
    return {
      app: './src/app.js',
      theme: `./src/themes/${process.env.THEME}.js`
    };
  }
};
```

#### 2. Output（输出）

告诉Webpack在哪里输出bundles以及如何命名：

```javascript
const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    // 输出目录
    path: path.resolve(__dirname, 'dist'),
    
    // 输出文件名
    filename: 'bundle.js',
    
    // 使用占位符
    filename: '[name].[contenthash].js',
    
    // 公共路径
    publicPath: '/assets/',
    
    // 清理输出目录
    clean: true
  }
};
```

#### 3. Loaders（加载器）

Webpack只能理解JavaScript和JSON文件。Loaders让Webpack能够处理其他类型的文件：

```javascript
module.exports = {
  module: {
    rules: [
      // 处理CSS
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      
      // 处理SCSS
      {
        test: /\.scss$/,
        use: ['style-loader', 'css-loader', 'sass-loader']
      },
      
      // 处理图片
      {
        test: /\.(png|jpg|gif|svg)$/,
        type: 'asset/resource',
        generator: {
          filename: 'images/[name].[hash][ext]'
        }
      },
      
      // 处理字体
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[name][ext]'
        }
      },
      
      // 使用Babel转译JS
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: ['@babel/plugin-transform-runtime']
          }
        }
      },
      
      // 处理TypeScript
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  }
};
```

#### 4. Plugins（插件）

插件用于执行范围更广的任务，如打包优化、资源管理、环境变量注入等：

```javascript
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { DefinePlugin } = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  plugins: [
    // 生成HTML文件
    new HtmlWebpackPlugin({
      template: './public/index.html',
      title: 'My App',
      meta: {
        viewport: 'width=device-width, initial-scale=1'
      }
    }),
    
    // 提取CSS到单独文件
    new MiniCssExtractPlugin({
      filename: 'css/[name].[contenthash].css'
    }),
    
    // 定义环境变量
    new DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      'process.env.API_URL': JSON.stringify('https://api.example.com')
    }),
    
    // 复制静态资源
    new CopyWebpackPlugin({
      patterns: [
        { from: 'public/favicon.ico', to: 'favicon.ico' },
        { from: 'public/robots.txt', to: 'robots.txt' }
      ]
    })
  ]
};
```

#### 5. Mode（模式）

告诉Webpack使用相应模式的内置优化：

```javascript
module.exports = {
  mode: 'development', // 或 'production' 或 'none'
  
  // 不同模式的配置
  mode: process.env.NODE_ENV || 'development'
};

// 开发模式特性：
// - 更好的错误提示
// - 更快的增量构建
// - 详细的Source Map

// 生产模式特性：
// - 代码压缩
// - Tree Shaking
// - Scope Hoisting
// - 更小的bundle体积
```

### 完整的Webpack配置示例

```javascript
// webpack.config.js
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const webpack = require('webpack');

const isDev = process.env.NODE_ENV === 'development';

module.exports = {
  // 入口
  entry: {
    app: './src/index.js'
  },
  
  // 输出
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: isDev ? '[name].js' : '[name].[contenthash].js',
    publicPath: '/'
  },
  
  // 模式
  mode: isDev ? 'development' : 'production',
  
  // 开发工具
  devtool: isDev ? 'eval-source-map' : 'source-map',
  
  // 开发服务器
  devServer: {
    static: './dist',
    hot: true,
    port: 3000,
    open: true,
    historyApiFallback: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  },
  
  // 模块
  module: {
    rules: [
      // JavaScript
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            cacheDirectory: true
          }
        }
      },
      
      // CSS
      {
        test: /\.css$/,
        use: [
          isDev ? 'style-loader' : MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              modules: true,
              importLoaders: 1
            }
          },
          'postcss-loader'
        ]
      },
      
      // 图片
      {
        test: /\.(png|jpg|gif|svg)$/,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 8 * 1024 // 8kb以下转为base64
          }
        }
      }
    ]
  },
  
  // 插件
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: './public/index.html',
      favicon: './public/favicon.ico'
    }),
    !isDev && new MiniCssExtractPlugin({
      filename: 'css/[name].[contenthash].css'
    }),
    new webpack.DefinePlugin({
      'process.env.API_URL': JSON.stringify(process.env.API_URL || '')
    }),
    isDev && new webpack.HotModuleReplacementPlugin()
  ].filter(Boolean),
  
  // 优化
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: 10
        }
      }
    },
    runtimeChunk: 'single'
  },
  
  // 解析
  resolve: {
    extensions: ['.js', '.jsx', '.json'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@utils': path.resolve(__dirname, 'src/utils')
    }
  }
};
```

## ⚡ Vite革命性特性（20分钟）

### Vite是什么？

Vite（法语意为"快速的"）是一种新型前端构建工具，能够显著提升前端开发体验。它主要由两部分组成：

1. **开发服务器** - 基于原生ES模块提供极快的热更新
2. **生产构建** - 使用Rollup打包，输出高度优化的静态资源

### Vite的核心优势

#### 1. 极速的冷启动

传统构建工具需要先打包再启动服务器，Vite直接启动服务器：

```javascript
// 传统构建工具流程
Entry → Bundle → Server → Browser

// Vite流程
Server → Browser → ES Module Request → Transform → Response
```

#### 2. 即时的热更新

基于ES模块的HMR，只需要更新改变的模块：

```javascript
// Vite的HMR API
if (import.meta.hot) {
  import.meta.hot.accept('./module.js', (newModule) => {
    // 处理更新的模块
    console.log('Module updated:', newModule);
  });
  
  // 处理自身更新
  import.meta.hot.accept((newModule) => {
    // 更新逻辑
  });
  
  // 清理副作用
  import.meta.hot.dispose(() => {
    // 清理代码
  });
}
```

#### 3. 真正的按需编译

只有当浏览器请求某个模块时，Vite才会编译它：

```javascript
// index.html
<script type="module" src="/src/main.js"></script>

// main.js
import { createApp } from 'vue' // 浏览器请求时才编译vue
import App from './App.vue'     // 按需编译App.vue

createApp(App).mount('#app')
```

### Vite配置

#### 基础配置

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
  // 插件
  plugins: [vue()],
  
  // 服务器选项
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  
  // 构建选项
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['vue', 'vue-router', 'vuex'],
          'ui': ['element-plus']
        }
      }
    }
  },
  
  // 解析选项
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components')
    }
  },
  
  // CSS选项
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/variables.scss";`
      }
    }
  },
  
  // 依赖优化
  optimizeDeps: {
    include: ['axios', 'lodash-es'],
    exclude: ['your-local-package']
  }
});
```

#### 环境变量配置

```javascript
// .env
VITE_APP_TITLE=My App
VITE_API_URL=http://localhost:5000

// .env.production
VITE_API_URL=https://api.example.com

// 在代码中使用
console.log(import.meta.env.VITE_APP_TITLE);
console.log(import.meta.env.VITE_API_URL);
console.log(import.meta.env.MODE); // 'development' or 'production'
console.log(import.meta.env.DEV);  // true in dev
console.log(import.meta.env.PROD); // true in production
```

### Vite插件系统

```javascript
// 自定义插件
function myPlugin() {
  return {
    name: 'my-plugin',
    
    // 钩子函数
    configResolved(config) {
      console.log('配置已解析');
    },
    
    transformIndexHtml(html) {
      return html.replace(
        '</head>',
        '<script>console.log("Injected by plugin")</script></head>'
      );
    },
    
    transform(code, id) {
      if (id.endsWith('.js')) {
        // 转换代码
        return code.replace('__VERSION__', '1.0.0');
      }
    }
  };
}

// 使用插件
export default defineConfig({
  plugins: [myPlugin()]
});
```

## 🆚 Webpack vs Vite对比（10分钟）

### 性能对比

| 指标 | Webpack | Vite |
|------|---------|------|
| 冷启动 | 10-30秒 | <1秒 |
| 热更新 | 1-5秒 | <50ms |
| 首次页面加载 | 快（打包后） | 稍慢（需要加载多个模块） |
| 生产构建 | 成熟稳定 | 基于Rollup，同样优秀 |

### 功能对比

| 特性 | Webpack | Vite |
|------|---------|------|
| 浏览器兼容性 | 可配置到IE11 | 现代浏览器（支持ES Modules） |
| 插件生态 | 非常丰富 | 快速增长 |
| 配置复杂度 | 较高 | 简单 |
| TypeScript支持 | 需要配置 | 开箱即用 |
| CSS处理 | 需要loader | 内置支持 |
| 静态资源处理 | 需要配置 | 内置支持 |
| Web Workers | 需要loader | 原生支持 |

### 选择建议

**选择Webpack如果：**
- 需要支持老旧浏览器
- 项目已经使用Webpack
- 需要复杂的自定义构建逻辑
- 依赖特定的Webpack插件

**选择Vite如果：**
- 新项目或可以迁移
- 目标用户使用现代浏览器
- 重视开发体验
- 使用Vue 3或React
- 想要更简单的配置

### 迁移策略

从Webpack迁移到Vite：

```javascript
// 1. 安装Vite
npm install -D vite @vitejs/plugin-react

// 2. 创建vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // 迁移Webpack的alias配置
      '@': '/src'
    }
  }
});

// 3. 更新package.json scripts
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}

// 4. 将index.html移到根目录
// 5. 更新环境变量（process.env → import.meta.env）
// 6. 处理require()调用（改为import）
```

## 🚀 实战演练：搭建开发环境（20分钟）

### Webpack项目实战

```bash
# 进入webpack项目
cd webpack-demo

# 初始化项目
npm init -y

# 安装依赖
npm i -D webpack webpack-cli webpack-dev-server
npm i -D html-webpack-plugin mini-css-extract-plugin
npm i -D css-loader style-loader sass-loader sass
npm i -D babel-loader @babel/core @babel/preset-env
npm i -D clean-webpack-plugin copy-webpack-plugin

# 创建配置文件
touch webpack.config.js
touch .babelrc
```

创建完整的Webpack配置：

```javascript
// webpack.config.js
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const isDev = process.env.NODE_ENV !== 'production';

module.exports = {
  mode: isDev ? 'development' : 'production',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: isDev ? '[name].js' : '[name].[contenthash].js'
  },
  devServer: {
    static: './dist',
    hot: true,
    port: 8080,
    open: true
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader'
      },
      {
        test: /\.s?css$/,
        use: [
          isDev ? 'style-loader' : MiniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader'
        ]
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 8 * 1024
          }
        }
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: './public/index.html',
      title: 'Webpack Demo'
    }),
    !isDev && new MiniCssExtractPlugin({
      filename: '[name].[contenthash].css'
    })
  ].filter(Boolean),
  optimization: {
    splitChunks: {
      chunks: 'all'
    }
  }
};
```

### Vite项目实战

```bash
# 进入vite项目
cd ../vite-demo

# 使用Vite创建项目（手动方式）
npm init -y
npm i -D vite
npm i -D @vitejs/plugin-legacy

# 或使用官方模板
npm create vite@latest my-vite-app -- --template vanilla
```

创建Vite配置：

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import legacy from '@vitejs/plugin-legacy';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    legacy({
      targets: ['defaults', 'not IE 11']
    })
  ],
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
});
```

### 创建示例应用

```javascript
// src/index.js (Webpack) 或 src/main.js (Vite)
import './styles/main.scss';
import { add, multiply } from './math';
import logo from './assets/logo.png';

// 创建应用
function createApp() {
  const app = document.getElementById('app');
  
  app.innerHTML = `
    <div class="container">
      <img src="${logo}" alt="Logo" class="logo">
      <h1>Build Tools Demo</h1>
      <div class="calculator">
        <input type="number" id="num1" value="5">
        <input type="number" id="num2" value="3">
        <button id="addBtn">Add</button>
        <button id="multiplyBtn">Multiply</button>
        <div id="result"></div>
      </div>
    </div>
  `;
  
  // 事件处理
  document.getElementById('addBtn').addEventListener('click', () => {
    const num1 = Number(document.getElementById('num1').value);
    const num2 = Number(document.getElementById('num2').value);
    const result = add(num1, num2);
    document.getElementById('result').textContent = `Result: ${result}`;
  });
  
  document.getElementById('multiplyBtn').addEventListener('click', () => {
    const num1 = Number(document.getElementById('num1').value);
    const num2 = Number(document.getElementById('num2').value);
    const result = multiply(num1, num2);
    document.getElementById('result').textContent = `Result: ${result}`;
  });
}

// 热模块替换
if (module.hot) {
  module.hot.accept('./math', () => {
    console.log('Math module updated!');
  });
}

// Vite HMR
if (import.meta.hot) {
  import.meta.hot.accept('./math', (newMath) => {
    console.log('Math module updated in Vite!');
  });
}

// 启动应用
document.addEventListener('DOMContentLoaded', createApp);
```

```scss
// src/styles/main.scss
$primary-color: #3498db;
$secondary-color: #2ecc71;

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: #f5f5f5;
  color: #333;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}

.logo {
  width: 100px;
  height: 100px;
  margin-bottom: 2rem;
}

h1 {
  color: $primary-color;
  margin-bottom: 2rem;
}

.calculator {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  
  input {
    padding: 0.5rem;
    margin: 0 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
    width: 100px;
  }
  
  button {
    padding: 0.5rem 1rem;
    margin: 0 0.5rem;
    background-color: $primary-color;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.3s;
    
    &:hover {
      background-color: darken($primary-color, 10%);
    }
    
    &:nth-of-type(2) {
      background-color: $secondary-color;
      
      &:hover {
        background-color: darken($secondary-color, 10%);
      }
    }
  }
  
  #result {
    margin-top: 2rem;
    font-size: 1.5rem;
    font-weight: bold;
    color: $primary-color;
  }
}
```

### 运行和测试

```bash
# Webpack项目
cd webpack-demo
npm run dev     # 开发模式
npm run build   # 生产构建

# Vite项目
cd vite-demo
npm run dev     # 开发模式
npm run build   # 生产构建
npm run preview # 预览生产构建
```

## 📚 学习资源

### 官方文档
- [Webpack中文文档](https://webpack.docschina.org/) - 完整的中文文档
- [Vite中文文档](https://cn.vitejs.dev/) - 官方中文指南
- [Rollup文档](https://rollupjs.org/guide/zh/) - Vite底层使用的打包器

### 深入学习
- [Webpack深入浅出](https://webpack.wuhaolin.cn/) - 系统学习Webpack
- [ESM规范详解](https://hacks.mozilla.org/2018/03/es-modules-a-cartoon-deep-dive/) - 理解ES模块
- [构建工具对比](https://www.snowpack.dev/comparisons) - 各种构建工具对比

### 实战教程
- [从零搭建Vue3+Vite项目](https://juejin.cn/post/6951649464637636622) - 实战指南
- [Webpack性能优化](https://juejin.cn/post/6844904088961056782) - 优化技巧
- [Vite插件开发](https://cn.vitejs.dev/guide/api-plugin.html) - 插件开发指南

## ✅ 今日检查清单

确保你已经掌握了以下内容：

- [ ] 理解为什么需要构建工具
- [ ] 了解JavaScript模块系统的演进
- [ ] 掌握Webpack的五个核心概念
- [ ] 能够配置基础的Webpack项目
- [ ] 理解Vite的工作原理
- [ ] 能够创建Vite项目
- [ ] 了解HMR的工作原理
- [ ] 理解开发和生产环境的区别
- [ ] 知道如何选择合适的构建工具
- [ ] 能够进行基本的构建优化

## 🤔 自测问题

1. **为什么Vite的冷启动速度比Webpack快？**

2. **解释一下Tree Shaking是什么，为什么ES Modules支持而CommonJS不支持？**

3. **Webpack的loader和plugin有什么区别？各自的使用场景是什么？**

4. **什么是代码分割（Code Splitting）？如何在Webpack和Vite中实现？**

5. **解释一下Hot Module Replacement的工作原理**

6. **如何优化构建速度和产物体积？**

7. **Source Map有哪些类型？开发和生产环境应该使用哪种？**

## 🎯 拓展练习

1. **配置多页应用**
   - 使用Webpack配置多入口
   - 为每个页面生成独立的HTML
   - 提取公共代码

2. **实现构建优化**
   - 配置代码分割
   - 实现懒加载
   - 优化图片资源
   - 配置Gzip压缩

3. **开发Vite插件**
   - 创建自定义转换插件
   - 实现虚拟模块
   - 添加自定义中间件

4. **构建库项目**
   - 配置UMD输出
   - 支持多种模块格式
   - 生成类型定义文件

## 💡 今日总结

今天我们深入学习了现代前端构建工具：

- **构建工具的价值**：解决兼容性、模块化、优化等问题
- **模块系统演进**：从全局函数到ES Modules的发展历程
- **Webpack核心**：Entry、Output、Loaders、Plugins、Mode
- **Vite革命**：基于ES Modules的极速开发体验
- **工具选择**：根据项目需求选择合适的工具

构建工具是现代前端开发的基础设施，掌握它们能够：
- 提高开发效率
- 优化应用性能
- 使用最新的语言特性
- 更好地组织代码

明天我们将学习前端测试，包括单元测试、集成测试和E2E测试！

## 🚀 预习提示

明天（Day 10）我们将学习：
- Jest测试框架
- 单元测试最佳实践
- 组件测试策略
- E2E测试工具
- 测试驱动开发（TDD）

准备好为你的代码添加测试保障了吗？明天见！👋