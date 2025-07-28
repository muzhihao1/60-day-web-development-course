---
day: 8
phase: "modern-web"
title: "Package Management深入：npm与yarn完全指南"
description: "深入理解JavaScript包管理生态系统，掌握npm和yarn的高级使用技巧，学习包发布和依赖管理最佳实践"
objectives:
  - "深入理解package.json的所有配置项"
  - "掌握依赖管理的最佳实践"
  - "学会编写和使用npm scripts"
  - "理解语义化版本控制(semver)"
  - "对比npm和yarn的特性差异"
  - "学习发布和维护npm包"
estimatedTime: 90
difficulty: "intermediate"
prerequisites: [1, 6]
tags:
  - "npm"
  - "yarn"
  - "包管理"
  - "依赖管理"
  - "npm scripts"
resources:
  - title: "npm官方文档"
    url: "https://docs.npmjs.com/"
    type: "documentation"
  - title: "yarn官方文档"
    url: "https://yarnpkg.com/getting-started"
    type: "documentation"
  - title: "语义化版本规范"
    url: "https://semver.org/lang/zh-CN/"
    type: "documentation"
  - title: "npm最佳实践指南"
    url: "https://github.com/npm/cli/wiki/Best-Practices"
    type: "documentation"
---

# Day 08: Package Management深入：npm与yarn完全指南

## 📋 学习目标

今天我们将深入探索JavaScript包管理的世界。无论是构建小型项目还是大型应用，包管理都是现代Web开发的核心技能。

- 深入理解package.json的所有配置项
- 掌握依赖管理的最佳实践
- 学会编写和使用npm scripts
- 理解语义化版本控制(semver)
- 对比npm和yarn的特性差异
- 学习发布和维护npm包

## ⏱️ 每日代码仪式（5分钟）

### 环境检查和准备

```bash
# 检查npm版本
npm --version

# 更新npm到最新版本
npm install -g npm@latest

# 检查yarn版本（如果已安装）
yarn --version

# 安装yarn（如果未安装）
npm install -g yarn

# 创建今天的练习目录
mkdir day08-package-management
cd day08-package-management

# 初始化一个新的npm项目
npm init -y
```

### 配置npm

```bash
# 查看npm配置
npm config list

# 设置默认作者信息
npm config set init-author-name "你的名字"
npm config set init-author-email "your.email@example.com"
npm config set init-license "MIT"

# 查看全局安装位置
npm config get prefix

# 设置淘宝镜像（加速下载）
npm config set registry https://registry.npmmirror.com

# 验证镜像设置
npm config get registry
```

## 📦 深入理解package.json（20分钟）

### package.json完整解析

package.json是Node.js项目的核心配置文件，让我们深入了解每个字段的作用：

```json
{
  // 基本信息
  "name": "my-awesome-package",              // 包名，必须唯一
  "version": "1.0.0",                       // 版本号，遵循semver规范
  "description": "一个很棒的npm包",          // 简短描述
  "keywords": ["utility", "helper", "tool"], // 关键词，帮助搜索
  "homepage": "https://github.com/user/repo#readme", // 项目主页
  "bugs": {
    "url": "https://github.com/user/repo/issues",
    "email": "project@example.com"
  },
  "license": "MIT",                         // 许可证
  
  // 作者和贡献者
  "author": {
    "name": "张三",
    "email": "zhangsan@example.com",
    "url": "https://zhangsan.com"
  },
  "contributors": [                         // 贡献者列表
    {
      "name": "李四",
      "email": "lisi@example.com"
    }
  ],
  
  // 文件和目录
  "files": [                               // 发布时包含的文件
    "dist",
    "src",
    "!src/test"
  ],
  "main": "./dist/index.js",               // 主入口文件（CommonJS）
  "module": "./dist/index.esm.js",         // ES模块入口
  "types": "./dist/index.d.ts",            // TypeScript类型定义
  "bin": {                                 // 可执行文件
    "my-cli": "./cli.js"
  },
  "man": "./man/doc.1",                    // man手册页面
  "directories": {                         // 目录结构说明
    "lib": "lib",
    "bin": "bin",
    "doc": "doc",
    "example": "examples",
    "test": "test"
  },
  
  // 仓库信息
  "repository": {
    "type": "git",
    "url": "git+https://github.com/user/repo.git"
  },
  
  // 脚本命令
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "build": "webpack --mode production",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint src/**/*.js",
    "format": "prettier --write \"src/**/*.js\"",
    "prebuild": "npm run lint",            // pre钩子
    "postbuild": "npm run test",           // post钩子
    "prepare": "husky install",            // 特殊生命周期钩子
    "prepublishOnly": "npm run build && npm test"
  },
  
  // 配置
  "config": {                              // 脚本可以访问的配置
    "port": 3000,
    "reporter": "spec"
  },
  
  // 依赖关系
  "dependencies": {                        // 生产依赖
    "express": "^4.18.2",
    "lodash": "~4.17.21",
    "axios": "0.27.2"
  },
  "devDependencies": {                     // 开发依赖
    "jest": "^29.0.0",
    "eslint": "^8.0.0",
    "webpack": "^5.0.0"
  },
  "peerDependencies": {                    // 同级依赖
    "react": ">=16.8.0",
    "react-dom": ">=16.8.0"
  },
  "peerDependenciesMeta": {               // 同级依赖元数据
    "react-dom": {
      "optional": true
    }
  },
  "optionalDependencies": {               // 可选依赖
    "fsevents": "^2.3.2"
  },
  "bundledDependencies": [                // 打包依赖
    "some-internal-module"
  ],
  
  // 引擎要求
  "engines": {
    "node": ">=14.0.0",
    "npm": ">=6.0.0"
  },
  "os": ["darwin", "linux"],              // 操作系统限制
  "cpu": ["x64", "arm64"],                // CPU架构限制
  
  // 发布配置
  "private": false,                       // 是否私有包
  "publishConfig": {
    "registry": "https://registry.npmjs.org/",
    "tag": "latest",
    "access": "public"
  },
  
  // 工作空间（monorepo）
  "workspaces": [
    "packages/*"
  ],
  
  // 其他元数据
  "sideEffects": false,                   // 用于tree shaking
  "unpkg": "./dist/index.umd.js",        // unpkg CDN入口
  "jsdelivr": "./dist/index.min.js",     // jsDelivr CDN入口
  "browserslist": [                       // 浏览器兼容性
    "> 1%",
    "last 2 versions",
    "not dead"
  ]
}
```

### 创建一个完整的package.json

让我们创建一个实际的例子：

```bash
# 使用交互式初始化
npm init

# 回答以下问题：
# package name: (day08-package-management) my-utils
# version: (1.0.0) 0.1.0
# description: 一个实用的JavaScript工具库
# entry point: (index.js) src/index.js
# test command: jest
# git repository: https://github.com/username/my-utils
# keywords: utils, helpers, javascript
# author: Your Name
# license: (ISC) MIT
```

## 🔗 依赖管理深入理解（15分钟）

### 依赖类型详解

#### 1. dependencies（生产依赖）

应用运行时必需的包：

```bash
# 安装生产依赖
npm install express axios lodash

# 简写
npm i express axios lodash
```

#### 2. devDependencies（开发依赖）

仅在开发时需要的包：

```bash
# 安装开发依赖
npm install --save-dev jest eslint webpack
# 或
npm i -D jest eslint webpack

# 安装所有依赖（包括dev）
npm install

# 仅安装生产依赖
npm install --production
```

#### 3. peerDependencies（同级依赖）

表示你的包需要宿主环境提供的依赖：

```json
{
  "peerDependencies": {
    "react": "^16.8.0 || ^17.0.0 || ^18.0.0"
  }
}
```

#### 4. optionalDependencies（可选依赖）

安装失败不会导致npm install失败：

```bash
# 添加可选依赖
npm install --save-optional fsevents
```

### 版本范围详解

```json
{
  "dependencies": {
    "exact": "1.2.3",           // 精确版本
    "patch": "~1.2.3",         // >=1.2.3 <1.3.0
    "minor": "^1.2.3",         // >=1.2.3 <2.0.0
    "major": "*",              // 任意版本
    "range": ">=1.2.3 <2.0.0", // 版本范围
    "or": "1.2.3 || >=2.0.0",  // 或条件
    "x-range": "1.2.x",        // 1.2.0 - 1.2.999...
    "latest": "latest",        // 最新版本
    "git": "git://github.com/user/repo.git#commit",
    "file": "file:../local-module",
    "link": "link:../local-module"
  }
}
```

### 理解package-lock.json

package-lock.json锁定了确切的依赖版本：

```bash
# 查看为什么安装了某个包
npm ls lodash

# 查看包的详细信息
npm view express

# 检查过时的包
npm outdated

# 更新包
npm update              # 根据package.json更新
npm update express      # 更新特定包

# 审计安全漏洞
npm audit
npm audit fix          # 自动修复
npm audit fix --force  # 强制修复（可能有breaking changes）
```

## 📜 npm Scripts完全指南（20分钟）

### 基础脚本

```json
{
  "scripts": {
    // 基本命令
    "start": "node server.js",
    "test": "jest",
    
    // 传递参数
    "dev": "nodemon server.js --port 3000",
    
    // 使用环境变量
    "build:prod": "NODE_ENV=production webpack",
    
    // 串行执行（&&）
    "build": "npm run clean && npm run compile",
    
    // 并行执行（&）- Unix系统
    "watch": "npm run watch:js & npm run watch:css",
    
    // 使用npm-run-all（跨平台）
    "watch:all": "npm-run-all --parallel watch:*",
    
    // 条件执行
    "test:ci": "if [ \"$CI\" = \"true\" ]; then npm test -- --coverage; fi"
  }
}
```

### 生命周期脚本

npm在特定时机自动运行的脚本：

```json
{
  "scripts": {
    // 安装相关
    "preinstall": "echo 安装前执行",
    "install": "echo 安装时执行",
    "postinstall": "echo 安装后执行",
    
    // 发布相关
    "prepublishOnly": "npm test && npm run build",
    "prepare": "husky install",
    "prepublish": "已废弃，使用prepublishOnly",
    "prepack": "echo 打包前执行",
    "postpack": "echo 打包后执行",
    
    // 自定义脚本的钩子
    "pretest": "npm run lint",
    "test": "jest",
    "posttest": "echo 测试完成",
    
    // 卸载相关
    "preuninstall": "echo 卸载前",
    "uninstall": "echo 卸载时",
    "postuninstall": "echo 卸载后"
  }
}
```

### 高级脚本技巧

```json
{
  "scripts": {
    // 使用Node执行脚本
    "script": "node scripts/build.js",
    
    // 跨平台设置环境变量（使用cross-env）
    "build:prod": "cross-env NODE_ENV=production webpack",
    
    // 使用npx运行未安装的包
    "analyze": "npx webpack-bundle-analyzer stats.json",
    
    // 组合脚本
    "ci": "npm run lint && npm run test && npm run build",
    
    // 监听文件变化
    "watch": "nodemon --watch src --exec npm run build",
    
    // 清理脚本
    "clean": "rimraf dist coverage .cache",
    
    // 生成文档
    "docs": "jsdoc -c jsdoc.json",
    
    // 版本管理
    "version": "npm run build && git add -A dist",
    "postversion": "git push && git push --tags"
  }
}
```

### 实用的npm scripts模板

```bash
# 创建一个完整的脚本配置
cat > package.json << 'EOF'
{
  "name": "my-project",
  "version": "1.0.0",
  "scripts": {
    "start": "node dist/server.js",
    "dev": "nodemon src/server.js",
    "build": "npm run clean && npm run build:js && npm run build:css",
    "build:js": "babel src -d dist",
    "build:css": "sass src/styles:dist/styles",
    "clean": "rimraf dist",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint src/**/*.js",
    "lint:fix": "eslint src/**/*.js --fix",
    "format": "prettier --write \"src/**/*.{js,json,css,md}\"",
    "validate": "npm run lint && npm run test && npm run build",
    "prepare": "husky install",
    "pre-commit": "lint-staged"
  },
  "lint-staged": {
    "*.js": ["eslint --fix", "prettier --write"],
    "*.{json,css,md}": ["prettier --write"]
  }
}
EOF
```

## 🆚 npm vs yarn对比（15分钟）

### 特性对比

| 特性 | npm | yarn |
|------|-----|------|
| 速度 | 较快（v7+） | 非常快 |
| 缓存 | 有 | 更高效 |
| 离线模式 | npm@5+ | 原生支持 |
| 锁文件 | package-lock.json | yarn.lock |
| 工作空间 | npm@7+ | 原生支持 |
| PnP模式 | 不支持 | 支持 |
| 安全性 | npm audit | yarn audit |

### 命令对比

```bash
# npm vs yarn 命令对照
npm install            # yarn / yarn install
npm install express    # yarn add express
npm install -D jest    # yarn add -D jest
npm install -g nodemon # yarn global add nodemon
npm uninstall express  # yarn remove express
npm update            # yarn upgrade
npm outdated          # yarn outdated
npm run test          # yarn test
npm init              # yarn init
npm publish           # yarn publish
npm cache clean       # yarn cache clean
```

### yarn独特功能

```bash
# 交互式更新依赖
yarn upgrade-interactive

# 检查为什么安装了某个包
yarn why lodash

# 创建.yarnrc.yml配置
yarn config set npmRegistryServer "https://registry.npmmirror.com"

# 使用yarn workspaces
# package.json
{
  "private": true,
  "workspaces": ["packages/*"]
}

# 在workspace中执行命令
yarn workspace package-name add express
yarn workspaces run test
```

### 选择建议

- **选择npm如果**：
  - 使用Node.js内置包管理器
  - 团队已经使用npm
  - 需要npm特定功能
  
- **选择yarn如果**：
  - 需要更快的安装速度
  - 需要更好的monorepo支持
  - 需要Plug'n'Play特性

## 📤 发布npm包（15分钟）

### 准备发布

1. **创建npm账号**
```bash
# 注册账号（如果没有）
npm adduser

# 登录
npm login

# 验证登录
npm whoami
```

2. **准备包文件**
```bash
# 创建一个简单的工具库
mkdir my-first-npm-package
cd my-first-npm-package
npm init -y

# 创建主文件
cat > index.js << 'EOF'
// 字符串工具函数
function capitalize(str) {
  if (typeof str !== 'string') return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function camelCase(str) {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    })
    .replace(/\s+/g, '');
}

function truncate(str, length = 30, suffix = '...') {
  if (str.length <= length) return str;
  return str.slice(0, length) + suffix;
}

module.exports = {
  capitalize,
  camelCase,
  truncate
};
EOF

# 创建README.md
cat > README.md << 'EOF'
# My String Utils

一个简单的字符串处理工具库。

## 安装

```bash
npm install my-string-utils-demo
```

## 使用

```javascript
const { capitalize, camelCase, truncate } = require('my-string-utils-demo');

console.log(capitalize('hello')); // Hello
console.log(camelCase('hello world')); // helloWorld
console.log(truncate('这是一个很长的字符串', 10)); // 这是一个很长的字符...
```

## API

### capitalize(str)
将字符串首字母大写

### camelCase(str)
将字符串转换为驼峰格式

### truncate(str, length, suffix)
截断字符串
EOF

# 创建测试文件
cat > test.js << 'EOF'
const { capitalize, camelCase, truncate } = require('./index');

console.assert(capitalize('hello') === 'Hello', 'capitalize测试失败');
console.assert(camelCase('hello world') === 'helloWorld', 'camelCase测试失败');
console.assert(truncate('hello world', 5) === 'hello...', 'truncate测试失败');

console.log('所有测试通过！');
EOF

# 更新package.json
cat > package.json << 'EOF'
{
  "name": "my-string-utils-demo-20240127",
  "version": "0.1.0",
  "description": "一个简单的字符串处理工具库",
  "main": "index.js",
  "scripts": {
    "test": "node test.js"
  },
  "keywords": ["string", "utils", "utility"],
  "author": "Your Name",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/yourusername/my-string-utils"
  }
}
EOF
```

### 发布流程

```bash
# 1. 运行测试
npm test

# 2. 检查将要发布的文件
npm pack --dry-run

# 3. 创建.npmignore（如果需要）
cat > .npmignore << 'EOF'
test.js
.git
.gitignore
*.log
.DS_Store
EOF

# 4. 更新版本
npm version patch  # 0.1.0 -> 0.1.1
npm version minor  # 0.1.1 -> 0.2.0
npm version major  # 0.2.0 -> 1.0.0

# 5. 发布
npm publish

# 6. 查看发布的包
npm info my-string-utils-demo-20240127
```

### 发布范围包（Scoped Packages）

```bash
# 创建范围包
npm init --scope=@myusername

# package.json
{
  "name": "@myusername/utils",
  "publishConfig": {
    "access": "public"  // 范围包默认私有
  }
}

# 发布范围包
npm publish --access public
```

### 更新和维护

```bash
# 打标签
npm version patch -m "版本升级到 %s - 修复bug"

# 废弃版本
npm deprecate my-package@1.0.0 "存在严重bug，请使用1.0.1"

# 撤销发布（24小时内）
npm unpublish my-package@1.0.0

# 查看包的所有版本
npm view my-package versions
```

## 🔒 安全最佳实践（10分钟）

### 1. 定期审计

```bash
# 检查漏洞
npm audit

# 查看详细报告
npm audit --json

# 自动修复
npm audit fix

# 强制更新（可能破坏兼容性）
npm audit fix --force

# 仅审计生产依赖
npm audit --production
```

### 2. 使用npm ci

```bash
# 在CI/CD环境中使用npm ci而不是npm install
npm ci  # 更快、更可靠、更安全
```

### 3. 锁定依赖版本

```json
{
  "dependencies": {
    "express": "4.18.2",  // 使用精确版本
    "lodash": "~4.17.21"  // 只允许补丁更新
  }
}
```

### 4. 检查包内容

```bash
# 发布前检查包内容
npm pack
tar -tf my-package-1.0.0.tgz

# 查看包的依赖树
npm ls

# 查找重复的包
npm dedupe
```

### 5. 使用.npmrc配置

```bash
# 创建项目级.npmrc
cat > .npmrc << 'EOF'
# 使用精确版本
save-exact=true

# 不保存可选依赖
save-optional=false

# 审计级别
audit-level=moderate

# 注册表地址
registry=https://registry.npmjs.org/

# 作用域注册表
@mycompany:registry=https://npm.mycompany.com/
EOF
```

## 🏗️ 实战项目：创建一个实用工具库（10分钟）

让我们创建一个完整的npm包项目：

```bash
# 创建项目
mkdir awesome-utils && cd awesome-utils
npm init -y

# 安装开发依赖
npm i -D jest eslint prettier husky lint-staged

# 创建源码目录
mkdir src tests

# 创建主文件
cat > src/index.js << 'EOF'
/**
 * 数组工具函数
 */
const arrayUtils = {
  // 数组去重
  unique(arr) {
    return [...new Set(arr)];
  },
  
  // 数组分块
  chunk(arr, size) {
    const chunks = [];
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }
    return chunks;
  },
  
  // 扁平化数组
  flatten(arr, depth = 1) {
    return depth > 0
      ? arr.reduce((acc, val) => 
          acc.concat(Array.isArray(val) ? this.flatten(val, depth - 1) : val), [])
      : arr.slice();
  }
};

/**
 * 对象工具函数
 */
const objectUtils = {
  // 深拷贝
  deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map(item => this.deepClone(item));
    
    const cloned = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = this.deepClone(obj[key]);
      }
    }
    return cloned;
  },
  
  // 对象选择字段
  pick(obj, keys) {
    return keys.reduce((acc, key) => {
      if (key in obj) acc[key] = obj[key];
      return acc;
    }, {});
  },
  
  // 对象排除字段
  omit(obj, keys) {
    const result = { ...obj };
    keys.forEach(key => delete result[key]);
    return result;
  }
};

/**
 * 函数工具
 */
const functionUtils = {
  // 防抖
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },
  
  // 节流
  throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },
  
  // 一次性函数
  once(func) {
    let called = false;
    let result;
    return function(...args) {
      if (!called) {
        called = true;
        result = func.apply(this, args);
      }
      return result;
    };
  }
};

module.exports = {
  ...arrayUtils,
  ...objectUtils,
  ...functionUtils
};
EOF

# 创建测试文件
cat > tests/index.test.js << 'EOF'
const utils = require('../src');

describe('Array Utils', () => {
  test('unique removes duplicates', () => {
    expect(utils.unique([1, 2, 2, 3, 3, 3])).toEqual([1, 2, 3]);
  });
  
  test('chunk splits array', () => {
    expect(utils.chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
  });
});

describe('Object Utils', () => {
  test('deepClone creates deep copy', () => {
    const obj = { a: 1, b: { c: 2 } };
    const cloned = utils.deepClone(obj);
    cloned.b.c = 3;
    expect(obj.b.c).toBe(2);
  });
  
  test('pick selects properties', () => {
    const obj = { a: 1, b: 2, c: 3 };
    expect(utils.pick(obj, ['a', 'c'])).toEqual({ a: 1, c: 3 });
  });
});
EOF

# 配置Jest
cat > jest.config.js << 'EOF'
module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.js'
  ]
};
EOF

# 配置ESLint
cat > .eslintrc.json << 'EOF'
{
  "env": {
    "es2021": true,
    "node": true,
    "jest": true
  },
  "extends": "eslint:recommended",
  "parserOptions": {
    "ecmaVersion": 12
  },
  "rules": {
    "indent": ["error", 2],
    "quotes": ["error", "single"],
    "semi": ["error", "always"]
  }
}
EOF

# 配置Prettier
cat > .prettierrc << 'EOF'
{
  "singleQuote": true,
  "semi": true,
  "tabWidth": 2
}
EOF

# 更新package.json
cat > package.json << 'EOF'
{
  "name": "awesome-utils",
  "version": "1.0.0",
  "description": "一个包含常用工具函数的JavaScript库",
  "main": "src/index.js",
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint src/**/*.js",
    "lint:fix": "eslint src/**/*.js --fix",
    "format": "prettier --write \"src/**/*.js\"",
    "prepare": "husky install",
    "prepublishOnly": "npm run lint && npm test"
  },
  "keywords": ["utils", "helpers", "utility", "tools"],
  "author": "Your Name",
  "license": "MIT",
  "devDependencies": {
    "eslint": "^8.0.0",
    "husky": "^8.0.0",
    "jest": "^29.0.0",
    "lint-staged": "^13.0.0",
    "prettier": "^2.8.0"
  },
  "files": [
    "src",
    "README.md"
  ],
  "engines": {
    "node": ">=12.0.0"
  }
}
EOF

# 设置Git hooks
npx husky install
npx husky add .husky/pre-commit "npx lint-staged"

# 配置lint-staged
cat >> package.json << 'EOF'

{
  "lint-staged": {
    "*.js": ["eslint --fix", "prettier --write", "jest --findRelatedTests"]
  }
}
EOF
```

## 📚 学习资源

### 官方文档
- [npm文档](https://docs.npmjs.com/) - npm官方完整文档
- [yarn文档](https://yarnpkg.com/getting-started) - yarn官方指南
- [语义化版本规范](https://semver.org/lang/zh-CN/) - 版本号规范详解

### 最佳实践
- [npm最佳实践](https://github.com/npm/cli/wiki/Best-Practices) - 官方最佳实践
- [发布npm包指南](https://zellwk.com/blog/publish-to-npm/) - 详细发布教程
- [npm scripts指南](https://www.freecodecamp.org/news/introduction-to-npm-scripts-1dbb2ae01633/) - 脚本使用技巧

### 工具推荐
- [npm trends](https://npmtrends.com/) - 包流行度对比
- [bundlephobia](https://bundlephobia.com/) - 检查包大小
- [npms.io](https://npms.io/) - 更好的npm搜索
- [npm-check-updates](https://github.com/raineorshine/npm-check-updates) - 更新依赖工具

## ✅ 今日检查清单

确保你已经掌握了以下内容：

- [ ] 理解package.json的所有重要字段
- [ ] 掌握不同类型依赖的区别和用途
- [ ] 熟练使用npm scripts编写自动化任务
- [ ] 理解语义化版本控制规则
- [ ] 知道npm和yarn的主要区别
- [ ] 能够创建和发布npm包
- [ ] 了解npm安全最佳实践
- [ ] 会使用npm审计工具
- [ ] 理解package-lock.json的作用
- [ ] 掌握常用的npm命令

## 🤔 自测问题

1. **dependencies和devDependencies的区别是什么？什么时候使用peerDependencies？**

2. **解释以下版本范围的含义：`^1.2.3`、`~1.2.3`、`>=1.2.3 <2.0.0`**

3. **npm scripts中的pre和post钩子是如何工作的？**

4. **package-lock.json的作用是什么？为什么要提交到版本控制？**

5. **如何处理npm审计发现的安全漏洞？**

6. **发布npm包前需要做哪些准备工作？**

7. **npm ci和npm install的区别是什么？什么时候应该使用npm ci？**

8. **如何创建一个私有的npm包？**

## 🎯 拓展练习

1. **创建一个CLI工具**
   - 创建一个命令行工具包
   - 添加bin字段配置
   - 实现基本的命令功能
   - 发布并全局安装测试

2. **搭建私有npm仓库**
   - 使用Verdaccio搭建私有仓库
   - 配置npm使用私有仓库
   - 发布私有包测试

3. **自动化发布流程**
   - 使用semantic-release自动化版本
   - 配置GitHub Actions自动发布
   - 生成CHANGELOG

4. **性能优化**
   - 分析项目依赖大小
   - 找出并移除无用依赖
   - 优化安装速度

## 💡 今日总结

今天我们深入学习了JavaScript包管理的方方面面：

- **package.json**：项目的身份证和配置中心
- **依赖管理**：合理区分和管理不同类型的依赖
- **npm scripts**：强大的任务自动化工具
- **版本控制**：遵循语义化版本规范
- **包发布**：分享你的代码给全世界

包管理是现代JavaScript开发的基石。掌握这些知识将帮助你：
- 更好地组织和管理项目
- 提高开发效率
- 与团队更好地协作
- 为开源社区做贡献

明天我们将学习现代构建工具Webpack和Vite，继续探索现代前端工具链！

## 🚀 预习提示

明天（Day 9）我们将学习：
- Webpack 5的核心概念
- Vite的革命性特性
- 模块打包原理
- 构建优化技巧
- 开发服务器配置

准备好进入构建工具的世界了吗？明天见！👋