---
title: "npm scripts常用模式"
description: "掌握npm scripts的高级用法和最佳实践"
---

# npm Scripts常用模式

## 基础脚本示例

```json
{
  "scripts": {
    // 开发服务器
    "start": "node server.js",
    "dev": "nodemon server.js",
    
    // 构建脚本
    "build": "webpack --mode production",
    "build:dev": "webpack --mode development",
    
    // 测试脚本
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    
    // 代码质量
    "lint": "eslint src/**/*.js",
    "lint:fix": "eslint src/**/*.js --fix",
    "format": "prettier --write \"src/**/*.{js,json,css,md}\""
  }
}
```

## 生命周期钩子

```json
{
  "scripts": {
    // npm install时的钩子
    "preinstall": "echo '即将安装依赖...'",
    "install": "node scripts/install.js",
    "postinstall": "echo '依赖安装完成！'",
    
    // npm publish时的钩子
    "prepublishOnly": "npm run lint && npm test && npm run build",
    "prepack": "echo '准备打包...'",
    "postpack": "echo '打包完成！'",
    
    // npm version时的钩子
    "preversion": "npm test",
    "version": "npm run build && git add -A dist",
    "postversion": "git push && git push --tags",
    
    // 通用prepare钩子（install后和publish前都会运行）
    "prepare": "husky install"
  }
}
```

## 自定义脚本的pre和post钩子

```json
{
  "scripts": {
    // build脚本的钩子
    "prebuild": "npm run clean",
    "build": "webpack",
    "postbuild": "npm run optimize",
    
    // deploy脚本的钩子
    "predeploy": "npm test && npm run build",
    "deploy": "gh-pages -d dist",
    "postdeploy": "echo '部署完成！访问: https://example.com'",
    
    // 清理脚本
    "clean": "rimraf dist coverage .cache",
    "optimize": "imagemin dist/images/* --out-dir=dist/images"
  }
}
```

## 传递参数和环境变量

```json
{
  "scripts": {
    // 使用 -- 传递参数
    "test": "jest",
    "test:file": "jest -- user.test.js",
    "test:debug": "node --inspect-brk ./node_modules/.bin/jest --runInBand",
    
    // 设置环境变量（Unix）
    "start:prod": "NODE_ENV=production node server.js",
    "start:dev": "NODE_ENV=development nodemon server.js",
    
    // 跨平台设置环境变量（使用cross-env）
    "build:prod": "cross-env NODE_ENV=production webpack",
    "build:analyze": "cross-env ANALYZE=true webpack",
    
    // 使用npm配置变量
    "start": "node server.js --port $npm_package_config_port",
    "config:port": "npm config set my-app:port 3001"
  },
  "config": {
    "port": 3000
  }
}
```

## 串行和并行执行

```json
{
  "scripts": {
    // 串行执行（使用 &&）
    "build": "npm run clean && npm run compile && npm run minify",
    
    // 并行执行（使用 &）- 仅Unix
    "dev": "npm run watch:js & npm run watch:css & npm run server",
    
    // 使用npm-run-all实现跨平台串行
    "build:all": "run-s clean compile minify",
    
    // 使用npm-run-all实现跨平台并行
    "dev:all": "run-p watch:* server",
    
    // 使用concurrently实现并行
    "start": "concurrently \"npm run server\" \"npm run watch\"",
    
    // 通配符匹配
    "watch:js": "webpack --watch",
    "watch:css": "sass --watch src/styles:dist/styles",
    "watch:all": "npm-run-all --parallel watch:*"
  }
}
```

## 条件执行和错误处理

```json
{
  "scripts": {
    // 条件执行（Unix）
    "test:ci": "if [ \"$CI\" = \"true\" ]; then npm test -- --coverage; else npm test; fi",
    
    // 忽略错误继续执行
    "clean": "rimraf dist || true",
    
    // 使用Node.js脚本处理复杂逻辑
    "deploy": "node scripts/deploy.js",
    
    // 链式错误处理
    "safe-build": "npm run lint && npm run test && npm run build || echo '构建失败！'"
  }
}
```

## 文件监听和自动化

```json
{
  "scripts": {
    // 使用nodemon监听文件变化
    "dev": "nodemon --watch src --exec 'npm run build && node dist/index.js'",
    
    // 使用chokidar监听
    "watch": "chokidar 'src/**/*.js' -c 'npm run build'",
    
    // 使用onchange
    "watch:test": "onchange 'src/**/*.js' 'test/**/*.js' -- npm test",
    
    // Webpack开发服务器
    "serve": "webpack serve --mode development --open",
    
    // 文件变化时运行多个命令
    "watch:all": "chokidar '**/*.{js,css,html}' -c 'npm run lint && npm run build'"
  }
}
```

## 实用工具脚本

```json
{
  "scripts": {
    // 版本管理
    "release": "standard-version",
    "release:patch": "npm version patch && npm publish",
    "release:minor": "npm version minor && npm publish",
    "release:major": "npm version major && npm publish",
    
    // 依赖管理
    "deps:check": "npm-check -u",
    "deps:update": "npm update",
    "deps:clean": "npm prune",
    
    // 安全检查
    "security": "npm audit",
    "security:fix": "npm audit fix",
    
    // 文档生成
    "docs": "jsdoc -c jsdoc.json",
    "docs:serve": "http-server ./docs -p 8080",
    
    // 性能分析
    "analyze": "webpack-bundle-analyzer stats.json",
    "size": "size-limit",
    
    // Git钩子
    "precommit": "lint-staged",
    "prepush": "npm test"
  }
}
```

## 复杂项目的脚本组织

```json
{
  "scripts": {
    // 开发环境
    "dev": "npm run dev:prepare && npm run dev:start",
    "dev:prepare": "npm run clean && npm run copy:assets",
    "dev:start": "concurrently \"npm:watch:*\" \"npm:server:dev\"",
    
    // 构建流程
    "build": "npm run build:prepare && npm run build:compile && npm run build:optimize",
    "build:prepare": "npm run clean && npm run lint",
    "build:compile": "npm run build:js && npm run build:css",
    "build:optimize": "npm run minify && npm run compress",
    
    // 子任务
    "build:js": "babel src -d dist",
    "build:css": "sass src/styles:dist/styles --style compressed",
    "minify": "terser dist/js/*.js -o dist/js/",
    "compress": "gzip -k -f dist/**/*.{js,css}",
    
    // 测试套件
    "test": "npm run test:unit && npm run test:integration && npm run test:e2e",
    "test:unit": "jest --testMatch='**/*.unit.test.js'",
    "test:integration": "jest --testMatch='**/*.integration.test.js'",
    "test:e2e": "cypress run",
    
    // 部署流程
    "deploy": "npm run deploy:staging",
    "deploy:staging": "npm run build && rsync -avz dist/ user@staging:/var/www",
    "deploy:production": "npm run test && npm run build:prod && npm run upload:prod",
    
    // 工具命令
    "clean": "rimraf dist coverage .cache",
    "copy:assets": "cp -r src/assets dist/",
    "server:dev": "webpack-dev-server --mode development",
    "watch:js": "babel src -d dist --watch",
    "watch:css": "sass --watch src/styles:dist/styles"
  }
}
```

## 使用npx运行一次性命令

```json
{
  "scripts": {
    // 使用npx运行未安装的包
    "create:component": "npx generate-react-cli component",
    "analyze:bundle": "npx webpack-bundle-analyzer stats.json",
    "check:licenses": "npx license-checker",
    
    // 运行特定版本
    "test:legacy": "npx jest@26 --config=jest.legacy.config.js",
    
    // 初始化工具
    "init:eslint": "npx eslint --init",
    "init:prettier": "npx prettier --write ."
  }
}
```

## 最佳实践示例

```json
{
  "scripts": {
    // 🚀 启动命令
    "start": "node dist/server.js",
    "dev": "nodemon src/server.js",
    
    // 🏗️ 构建命令
    "build": "run-s clean lint test build:*",
    "build:client": "webpack --mode production",
    "build:server": "babel src -d dist",
    "build:types": "tsc --emitDeclarationOnly",
    
    // 🧪 测试命令
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --ci --coverage --maxWorkers=2",
    
    // 🔍 代码质量
    "lint": "run-p lint:*",
    "lint:js": "eslint src --ext .js,.jsx,.ts,.tsx",
    "lint:css": "stylelint 'src/**/*.{css,scss}'",
    "lint:fix": "run-p 'lint:* -- --fix'",
    
    // 📦 发布流程
    "prepublishOnly": "run-s clean build test",
    "release": "run-s release:*",
    "release:version": "standard-version",
    "release:publish": "npm publish",
    "release:tag": "git push --follow-tags origin main",
    
    // 🛠️ 工具命令
    "clean": "rimraf dist coverage",
    "format": "prettier --write '**/*.{js,json,css,md}'",
    "validate": "run-s lint test build",
    
    // 📊 分析命令
    "analyze": "run-s analyze:*",
    "analyze:bundle": "webpack-bundle-analyzer dist/stats.json",
    "analyze:deps": "depcheck",
    "analyze:size": "size-limit"
  }
}
```

## 技巧和窍门

### 1. 使用简短别名

```json
{
  "scripts": {
    "s": "npm start",
    "d": "npm run dev",
    "t": "npm test",
    "b": "npm run build"
  }
}
```

### 2. 脚本说明文档

```json
{
  "scripts": {
    "help": "echo 'Available scripts:\n  start - 启动生产服务器\n  dev - 启动开发服务器\n  build - 构建项目\n  test - 运行测试'"
  }
}
```

### 3. 环境特定配置

```json
{
  "scripts": {
    "start": "node -r dotenv/config server.js",
    "start:dev": "NODE_ENV=development npm start",
    "start:prod": "NODE_ENV=production npm start",
    "start:local": "NODE_ENV=local npm start"
  }
}
```

### 4. 错误通知

```json
{
  "scripts": {
    "build": "webpack || (echo '❌ 构建失败！' && exit 1)",
    "notify:success": "node -e \"console.log('✅ 构建成功！')\"",
    "notify:error": "node -e \"console.log('❌ 构建失败！')\" && exit 1"
  }
}
```

记住：npm scripts是自动化项目任务的强大工具。合理使用可以大大提高开发效率！