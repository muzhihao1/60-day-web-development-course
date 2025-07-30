---
day: 8
title: "package.json配置示例"
description: "展示package.json的各种配置选项和最佳实践"
category: "tooling"
language: "json"
---

## 基础配置

```json
{
  "name": "my-awesome-project",
  "version": "1.0.0",
  "description": "一个很棒的JavaScript项目",
  "main": "index.js",
  "author": "Your Name <email@example.com>",
  "license": "MIT"
}
```

## 完整配置示例

```json
{
  "name": "@myorg/utils",
  "version": "2.1.0",
  "description": "组织内部工具库",
  "keywords": ["utils", "helpers", "tools"],
  "homepage": "https://github.com/myorg/utils#readme",
  "bugs": {
    "url": "https://github.com/myorg/utils/issues",
    "email": "support@myorg.com"
  },
  "license": "MIT",
  "author": {
    "name": "开发团队",
    "email": "dev@myorg.com",
    "url": "https://myorg.com"
  },
  "files": [
    "dist",
    "src",
    "!src/__tests__"
  ],
  "main": "./dist/index.js",
  "module": "./dist/index.esm.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "require": "./dist/index.js",
      "import": "./dist/index.esm.js",
      "types": "./dist/index.d.ts"
    }
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/myorg/utils.git"
  },
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "build": "rollup -c",
    "test": "jest",
    "lint": "eslint src/**/*.js",
    "prepublishOnly": "npm run test && npm run build"
  },
  "dependencies": {
    "lodash": "^4.17.21"
  },
  "devDependencies": {
    "jest": "^29.0.0",
    "eslint": "^8.0.0",
    "rollup": "^3.0.0"
  },
  "peerDependencies": {
    "react": ">=16.8.0"
  },
  "engines": {
    "node": ">=14.0.0",
    "npm": ">=6.0.0"
  }
}
```

## Monorepo配置

```json
{
  "name": "my-monorepo",
  "private": true,
  "workspaces": [
    "packages/*",
    "apps/*"
  ],
  "scripts": {
    "dev": "lerna run dev --parallel",
    "build": "lerna run build",
    "test": "lerna run test",
    "publish": "lerna publish"
  },
  "devDependencies": {
    "lerna": "^6.0.0"
  }
}
```

## 发布配置

```json
{
  "name": "my-public-package",
  "version": "1.0.0",
  "publishConfig": {
    "registry": "https://registry.npmjs.org/",
    "access": "public",
    "tag": "latest"
  },
  "files": [
    "dist/**/*",
    "README.md",
    "LICENSE"
  ],
  "prepublishOnly": "npm run build && npm test"
}
```