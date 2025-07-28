---
title: "npm Scripts模式和技巧"
description: "展示各种npm scripts的使用模式和最佳实践"
---

## 基础脚本

```json
{
  "scripts": {
    "start": "node server.js",
    "test": "jest",
    "build": "webpack",
    "dev": "webpack serve --mode development"
  }
}
```

## 生命周期钩子

```json
{
  "scripts": {
    "pretest": "npm run lint",
    "test": "jest",
    "posttest": "echo '测试完成！'",
    
    "prebuild": "rimraf dist",
    "build": "webpack --mode production",
    "postbuild": "echo '构建完成，文件在dist目录'",
    
    "prepublishOnly": "npm test && npm run build",
    "preversion": "npm test",
    "version": "npm run build && git add -A dist",
    "postversion": "git push && git push --tags"
  }
}
```

## 串行和并行执行

```json
{
  "scripts": {
    "// 串行执行（使用 &&）": "",
    "validate": "npm run lint && npm run test && npm run build",
    
    "// 并行执行（使用 &）- 仅Unix": "",
    "dev": "npm run watch:css & npm run watch:js & npm run serve",
    
    "// 使用npm-run-all（跨平台）": "",
    "watch:all": "npm-run-all --parallel watch:*",
    "watch:css": "sass --watch src/styles:dist/styles",
    "watch:js": "webpack --watch",
    "watch:server": "nodemon server.js"
  }
}
```

## 环境变量和参数

```json
{
  "scripts": {
    "// 设置环境变量": "",
    "build:dev": "NODE_ENV=development webpack",
    "build:prod": "NODE_ENV=production webpack",
    
    "// 使用cross-env（跨平台）": "",
    "build:win": "cross-env NODE_ENV=production webpack",
    
    "// 传递参数": "",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:file": "jest -- src/utils.test.js",
    
    "// 使用npm配置": "",
    "serve": "node server.js --port $npm_package_config_port",
    "deploy": "deploy-script --env $npm_config_env"
  },
  "config": {
    "port": 3000
  }
}
```

## 复杂工作流

```json
{
  "scripts": {
    "// 开发工作流": "",
    "dev": "npm run clean && npm run dev:prepare && npm run dev:start",
    "dev:prepare": "npm run db:migrate && npm run db:seed",
    "dev:start": "concurrently \"npm:watch:*\" \"npm:serve\"",
    
    "// 构建工作流": "",
    "build": "run-s clean lint test build:*",
    "build:js": "rollup -c",
    "build:css": "postcss src/styles/main.css -o dist/styles.css",
    "build:html": "html-minifier src/index.html -o dist/index.html",
    
    "// 发布工作流": "",
    "release": "run-s release:*",
    "release:test": "npm test",
    "release:build": "npm run build",
    "release:version": "standard-version",
    "release:publish": "git push --follow-tags && npm publish",
    
    "// 清理": "",
    "clean": "rimraf dist coverage .cache",
    "clean:all": "npm run clean && rimraf node_modules"
  }
}
```

## 工具集成

```json
{
  "scripts": {
    "// 代码质量": "",
    "lint": "eslint src/**/*.js",
    "lint:fix": "eslint src/**/*.js --fix",
    "format": "prettier --write \"src/**/*.{js,json,css,md}\"",
    "typecheck": "tsc --noEmit",
    
    "// 测试": "",
    "test": "jest",
    "test:unit": "jest --testPathPattern=unit",
    "test:integration": "jest --testPathPattern=integration",
    "test:e2e": "cypress run",
    
    "// 文档": "",
    "docs": "jsdoc -c jsdoc.json",
    "docs:serve": "docsify serve docs",
    
    "// 分析": "",
    "analyze": "webpack-bundle-analyzer stats.json",
    "size": "size-limit",
    "audit": "npm audit --production"
  }
}
```

## Git集成

```json
{
  "scripts": {
    "// Git钩子（使用husky）": "",
    "prepare": "husky install",
    "pre-commit": "lint-staged",
    
    "// 提交相关": "",
    "commit": "cz",
    "changelog": "conventional-changelog -p angular -i CHANGELOG.md -s"
  },
  "lint-staged": {
    "*.js": ["eslint --fix", "prettier --write"],
    "*.{json,css,md}": ["prettier --write"]
  }
}
```