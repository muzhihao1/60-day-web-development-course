---
day: 8
title: "依赖管理最佳实践"
description: "展示如何有效管理项目依赖"
category: "tooling"
language: "json"
---

## 依赖类型和安装

```bash
# 生产依赖（运行时需要）
npm install express axios lodash

# 开发依赖（仅开发时需要）
npm install --save-dev webpack jest eslint
npm i -D prettier husky lint-staged

# 可选依赖（安装失败不影响项目）
npm install --save-optional fsevents

# 精确版本安装
npm install express@4.18.2

# 安装特定标签版本
npm install react@next
npm install vue@latest
```

## 版本范围语法

```json
{
  "dependencies": {
    "exact-version": "1.2.3",
    "patch-range": "~1.2.3",
    "minor-range": "^1.2.3",
    "major-range": "*",
    "latest": "latest",
    "range": ">=1.0.0 <2.0.0",
    "or-range": "1.0.0 || >=2.0.0",
    "x-range": "1.2.x",
    "tilde-range": "~1.2.0",
    "caret-range": "^1.0.0"
  }
}
```

## 查看和更新依赖

```bash
# 查看已安装的包
npm ls
npm ls --depth=0  # 只显示顶级依赖
npm ls express    # 查看特定包

# 查看过时的包
npm outdated
npm outdated --global

# 更新包
npm update              # 根据package.json更新
npm update express      # 更新特定包
npm update --save       # 更新并保存到package.json

# 检查包信息
npm view express
npm view express versions  # 查看所有版本
npm view express version   # 查看最新版本
```

## 安全审计

```bash
# 运行安全审计
npm audit

# 查看详细报告
npm audit --json

# 自动修复
npm audit fix

# 强制修复（可能破坏兼容性）
npm audit fix --force

# 只审计生产依赖
npm audit --production

# 设置审计级别
npm audit --audit-level=moderate
```

## package-lock.json管理

```bash
# 使用npm ci（推荐用于CI/CD）
npm ci  # 更快、更可靠

# 更新package-lock.json
npm install --package-lock-only

# 清理和重建
rm -rf node_modules package-lock.json
npm install

# 同步package-lock.json
npm install --save --package-lock-only
```

## 依赖清理和优化

```bash
# 查找未使用的依赖
npx depcheck

# 查找重复的包
npm dedupe

# 分析包大小
npx bundle-phobia-cli express

# 查看包的依赖树
npm ls --prod --depth=0

# 清理缓存
npm cache clean --force
npm cache verify
```

## Yarn命令对照

```bash
# npm vs yarn
npm install          → yarn / yarn install
npm i express        → yarn add express
npm i -D jest        → yarn add -D jest
npm i -g nodemon     → yarn global add nodemon
npm uninstall express → yarn remove express
npm update           → yarn upgrade
npm outdated         → yarn outdated
npm run test         → yarn test

# Yarn独特功能
yarn upgrade-interactive  # 交互式更新
yarn why lodash          # 查看为什么安装了某个包
yarn workspaces run test # 工作空间命令
```

## Monorepo依赖管理

```json
// 根目录package.json
{
  "private": true,
  "workspaces": [
    "packages/*",
    "apps/*"
  ],
  "scripts": {
    "install:all": "npm install --workspaces",
    "build:all": "npm run build --workspaces",
    "test:all": "npm test --workspaces"
  }
}
```

```bash
# npm workspaces命令
npm install express --workspace=packages/api
npm run test --workspace=apps/web
npm run build --workspaces --if-present
```