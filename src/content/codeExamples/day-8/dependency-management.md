---
title: "依赖管理最佳实践"
description: "如何有效管理项目依赖，避免常见陷阱"
---

# 依赖管理最佳实践

## 依赖类型详解

### dependencies（生产依赖）

应用运行时必需的包。这些包会在生产环境中使用。

```bash
# 安装生产依赖
npm install express axios lodash

# package.json
{
  "dependencies": {
    "express": "^4.18.2",
    "axios": "^1.4.0",
    "lodash": "^4.17.21"
  }
}
```

### devDependencies（开发依赖）

仅在开发和构建时需要的包。

```bash
# 安装开发依赖
npm install --save-dev webpack jest eslint

# package.json
{
  "devDependencies": {
    "webpack": "^5.88.0",
    "jest": "^29.5.0",
    "eslint": "^8.44.0"
  }
}
```

### peerDependencies（同级依赖）

表示你的包需要宿主项目提供的依赖。常用于插件开发。

```json
{
  "peerDependencies": {
    "react": ">=16.8.0",
    "react-dom": ">=16.8.0"
  },
  "peerDependenciesMeta": {
    "react-dom": {
      "optional": true
    }
  }
}
```

### optionalDependencies（可选依赖）

安装失败不会导致整个安装过程失败。

```json
{
  "optionalDependencies": {
    "fsevents": "^2.3.2",
    "node-sass": "^7.0.0"
  }
}
```

## 版本管理策略

### 语义化版本（Semver）

```
主版本号.次版本号.修订号
MAJOR.MINOR.PATCH
```

- **MAJOR**：不兼容的API修改
- **MINOR**：向后兼容的功能新增
- **PATCH**：向后兼容的问题修复

### 版本范围符号

```json
{
  "dependencies": {
    // 精确版本
    "package-a": "1.2.3",
    
    // 补丁版本范围：>=1.2.3 <1.3.0
    "package-b": "~1.2.3",
    
    // 次版本范围：>=1.2.3 <2.0.0（最常用）
    "package-c": "^1.2.3",
    
    // 任意版本（危险！）
    "package-d": "*",
    
    // 最新版本
    "package-e": "latest",
    
    // 范围
    "package-f": ">=1.2.3 <2.0.0",
    
    // 或条件
    "package-g": "1.2.3 || >=2.0.0"
  }
}
```

### 版本锁定最佳实践

```bash
# 1. 使用package-lock.json
git add package-lock.json
git commit -m "chore: update dependencies"

# 2. CI环境使用npm ci
npm ci  # 比npm install更快更可靠

# 3. 定期更新依赖
npm outdated  # 查看过时的包
npm update    # 更新到允许的最新版本

# 4. 精确版本控制
npm config set save-exact true  # 总是保存精确版本
```

## 依赖审查和安全

### 安全审计

```bash
# 运行安全审计
npm audit

# 查看详细报告
npm audit --json > audit-report.json

# 自动修复（谨慎使用）
npm audit fix

# 强制修复（可能破坏兼容性）
npm audit fix --force

# 仅审计生产依赖
npm audit --production
```

### 依赖分析

```bash
# 查看依赖树
npm ls
npm ls express  # 查看特定包

# 查找重复包
npm dedupe

# 分析包大小
npx bundle-phobia-cli express

# 检查未使用的依赖
npx depcheck
```

## 管理依赖的工具和技巧

### 1. 使用.npmrc配置

```bash
# 项目级.npmrc
cat > .npmrc << EOF
# 保存精确版本
save-exact=true

# 不保存可选依赖
save-optional=false

# 审计级别
audit-level=moderate

# 使用特定注册表
registry=https://registry.npmjs.org/

# 缓存配置
cache-min=86400

# 安装时显示进度条
progress=true
EOF
```

### 2. 依赖版本固定策略

```json
{
  "dependencies": {
    // 核心依赖：使用精确版本
    "express": "4.18.2",
    "database-driver": "3.1.0",
    
    // 工具库：允许补丁更新
    "lodash": "~4.17.21",
    "moment": "~2.29.4",
    
    // UI组件：允许次版本更新
    "react": "^18.2.0",
    "antd": "^5.0.0"
  }
}
```

### 3. 依赖更新工作流

```bash
# 检查过时的包
npm outdated

# 交互式更新（使用npm-check）
npx npm-check -u

# 使用npm-check-updates
npx npm-check-updates  # 查看可更新的包
npx ncu -u            # 更新package.json
npm install           # 安装更新

# 分阶段更新
npm update --save     # 只更新符合版本范围的包
```

### 4. Monorepo依赖管理

```json
// 根package.json
{
  "workspaces": [
    "packages/*"
  ],
  "devDependencies": {
    // 共享的开发依赖
    "eslint": "^8.0.0",
    "jest": "^29.0.0"
  }
}

// packages/app/package.json
{
  "dependencies": {
    "@myproject/utils": "workspace:*",
    "express": "^4.18.0"
  }
}
```

## 常见问题和解决方案

### 1. 解决版本冲突

```bash
# 查看冲突
npm ls package-name

# 强制使用特定版本（package.json）
{
  "overrides": {
    "package-a": "1.0.0",
    "package-b": {
      "package-c": "2.0.0"
    }
  }
}

# Yarn的resolutions
{
  "resolutions": {
    "package-a": "1.0.0"
  }
}
```

### 2. 处理大型依赖

```bash
# 分析包大小
npm pack --dry-run
npx webpack-bundle-analyzer

# 使用更轻量的替代品
# moment.js (67.9kb) -> dayjs (2.7kb)
# lodash (71.5kb) -> lodash-es (tree-shakeable)
```

### 3. 离线安装

```bash
# 缓存依赖
npm install --prefer-offline

# 完全离线
npm install --offline

# 使用本地缓存
npm config get cache  # 查看缓存位置
```

### 4. 私有包管理

```bash
# 配置私有注册表
npm config set @mycompany:registry https://npm.mycompany.com/

# .npmrc
@mycompany:registry=https://npm.mycompany.com/
//npm.mycompany.com/:_authToken=${NPM_TOKEN}

# 发布私有包
npm publish --access restricted
```

## 企业级依赖管理

### 1. 依赖白名单

```json
{
  "scripts": {
    "preinstall": "node scripts/check-dependencies.js"
  }
}
```

```javascript
// scripts/check-dependencies.js
const package = require('../package.json');
const whitelist = require('./dependency-whitelist.json');

const allDeps = {
  ...package.dependencies,
  ...package.devDependencies
};

for (const dep in allDeps) {
  if (!whitelist.approved.includes(dep)) {
    console.error(`❌ 未批准的依赖: ${dep}`);
    process.exit(1);
  }
}
```

### 2. 自动化依赖更新

```yaml
# .github/workflows/update-dependencies.yml
name: Update Dependencies
on:
  schedule:
    - cron: '0 0 * * 1'  # 每周一
jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: |
          npx npm-check-updates -u
          npm install
          npm test
      - uses: peter-evans/create-pull-request@v4
        with:
          title: 'chore: update dependencies'
          commit-message: 'chore: update dependencies'
          branch: update-dependencies
```

### 3. 依赖缓存优化

```yaml
# CI缓存配置
- name: Cache node modules
  uses: actions/cache@v3
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-node-
```

## 最佳实践总结

1. **定期审查依赖**
   - 每月检查过时的包
   - 每季度做一次大的更新
   - 关注安全公告

2. **保持依赖最小化**
   - 评估每个新依赖的必要性
   - 定期清理未使用的依赖
   - 考虑自己实现简单功能

3. **版本策略**
   - 核心依赖使用精确版本
   - 工具类允许补丁更新
   - 开发依赖可以更宽松

4. **文档化决策**
   - 记录为什么选择某个包
   - 记录版本固定的原因
   - 维护依赖更新日志

5. **自动化流程**
   - 使用CI检查安全问题
   - 自动化依赖更新PR
   - 集成依赖分析工具