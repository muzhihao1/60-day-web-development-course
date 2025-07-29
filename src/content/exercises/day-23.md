---
day: 23
title: "构建现代化开发环境"
description: "从零开始搭建一个完整的现代JavaScript开发环境"
difficulty: "advanced"
requirements:
  - "配置构建工具（Vite或Webpack）"
  - "设置代码质量工具（ESLint、Prettier）"
  - "配置测试框架（Jest、Testing Library）"
  - "实现Git钩子和提交规范"
  - "创建CI/CD流水线"
estimatedTime: 300
---

# 构建现代化开发环境 🛠️

## 项目概述

今天的练习将带你从零开始搭建一个生产级的JavaScript项目开发环境。你将配置所有必要的工具，创建自动化流程，并建立最佳实践，为团队协作和持续交付打下坚实基础。

## 项目要求

### 1. 项目初始化

```bash
# 创建项目结构
mkdir modern-dev-setup
cd modern-dev-setup

# 初始化package.json
npm init -y

# 创建基础目录结构
mkdir -p src/{components,utils,hooks,services,types}
mkdir -p tests/{unit,integration,e2e}
mkdir -p .github/workflows
mkdir -p scripts
mkdir -p docs

# 创建必要的配置文件
touch .gitignore .env.example README.md
```

### 2. 构建工具配置

选择并配置一个现代构建工具：

```javascript
// 如果选择Vite，创建 vite.config.js
// 配置要求：
// - TypeScript支持
// - 路径别名
// - CSS预处理器
// - 环境变量
// - 优化选项
// - 开发服务器代理

// 如果选择Webpack，创建 webpack.config.js
// 配置要求：
// - 多环境配置
// - 代码分割
// - 资源优化
// - Source Map
// - HMR支持
```

### 3. TypeScript配置

```javascript
// tsconfig.json
{
  "compilerOptions": {
    // 配置严格的类型检查
    // 设置模块解析
    // 配置路径别名
    // 启用所有严格检查选项
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

### 4. 代码质量工具

配置ESLint和Prettier：

```javascript
// .eslintrc.js
module.exports = {
  // 配置规则集
  // TypeScript支持
  // React/Vue规则（如适用）
  // 导入排序规则
  // 自定义规则
};

// .prettierrc.js
module.exports = {
  // 代码格式化规则
  // 与ESLint集成
  // 文件特定配置
};
```

### 5. 测试环境搭建

```javascript
// jest.config.js
module.exports = {
  // 测试环境配置
  // 覆盖率设置
  // 路径映射
  // Mock配置
  // 报告器设置
};

// 创建测试示例
// src/utils/calculator.ts
export class Calculator {
  add(a: number, b: number): number {
    return a + b;
  }
  
  divide(a: number, b: number): number {
    if (b === 0) throw new Error('Division by zero');
    return a / b;
  }
}

// tests/unit/calculator.test.ts
// 编写单元测试
```

### 6. Git Hooks配置

使用Husky和lint-staged：

```json
// package.json
{
  "scripts": {
    "prepare": "husky install"
  },
  "lint-staged": {
    "*.{js,ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md}": ["prettier --write"]
  }
}
```

配置提交消息规范：

```javascript
// commitlint.config.js
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // 自定义提交规则
  }
};
```

### 7. CI/CD流水线

创建GitHub Actions工作流：

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  quality:
    name: Code Quality
    runs-on: ubuntu-latest
    steps:
      # 检出代码
      # 安装依赖
      # 运行linter
      # 类型检查
      
  test:
    name: Tests
    runs-on: ubuntu-latest
    steps:
      # 运行单元测试
      # 生成覆盖率报告
      # 上传结果
      
  build:
    name: Build
    needs: [quality, test]
    runs-on: ubuntu-latest
    steps:
      # 构建项目
      # 上传构建产物
```

### 8. 开发脚本

在package.json中配置完整的脚本：

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint . --ext .js,.jsx,.ts,.tsx",
    "lint:fix": "npm run lint -- --fix",
    "format": "prettier --write \"src/**/*.{js,jsx,ts,tsx,json,css,md}\"",
    "type-check": "tsc --noEmit",
    "validate": "npm run type-check && npm run lint && npm run test",
    "prepare": "husky install"
  }
}
```

## 项目结构示例

```
modern-dev-setup/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml
│   │   └── release.yml
│   └── ISSUE_TEMPLATE/
├── .husky/
│   ├── pre-commit
│   └── commit-msg
├── .vscode/
│   ├── settings.json
│   └── extensions.json
├── docs/
│   ├── architecture.md
│   └── contributing.md
├── scripts/
│   ├── setup.js
│   └── release.js
├── src/
│   ├── components/
│   │   └── Button/
│   │       ├── Button.tsx
│   │       ├── Button.test.tsx
│   │       └── Button.module.css
│   ├── hooks/
│   ├── services/
│   ├── types/
│   ├── utils/
│   └── index.tsx
├── tests/
│   ├── e2e/
│   ├── integration/
│   └── unit/
├── .editorconfig
├── .env.example
├── .eslintignore
├── .eslintrc.js
├── .gitignore
├── .prettierignore
├── .prettierrc.js
├── commitlint.config.js
├── jest.config.js
├── package.json
├── README.md
├── tsconfig.json
└── vite.config.ts
```

## 技术要求

### 1. 依赖管理
- 使用lockfile确保依赖版本一致
- 区分开发依赖和生产依赖
- 定期更新依赖并检查安全性

### 2. 环境配置
- 支持多环境配置（开发、测试、生产）
- 使用环境变量管理敏感信息
- 提供环境变量示例文件

### 3. 文档要求
- README包含项目设置步骤
- 贡献指南
- 架构文档
- API文档（如适用）

### 4. 性能优化
- 配置代码分割
- 实现懒加载
- 优化构建输出
- 配置缓存策略

### 5. 开发体验
- 快速的HMR
- 有用的错误提示
- 自动格式化
- 智能代码补全支持

## 额外挑战

### 1. 添加更多工具
- Storybook组件文档
- Bundle分析工具
- 性能监控
- 错误追踪

### 2. 高级CI/CD
- 自动版本发布
- 变更日志生成
- Docker镜像构建
- 多环境部署

### 3. 开发者工具
- 自定义CLI工具
- 代码生成器
- 迁移脚本
- 项目模板

## 评分标准

1. **工具配置完整性 (30%)**
   - 所有必需工具正确配置
   - 配置文件组织良好
   - 工具之间集成顺畅

2. **自动化程度 (25%)**
   - Git hooks正常工作
   - CI/CD流水线完整
   - 脚本命令实用

3. **代码质量保障 (25%)**
   - ESLint规则合理
   - 测试覆盖率良好
   - 类型安全严格

4. **开发体验 (20%)**
   - 构建速度快
   - 错误提示清晰
   - 文档完善

## 提交要求

1. 创建Git仓库并推送到GitHub
2. 确保CI/CD流水线通过
3. 在README中包含：
   - 项目设置步骤
   - 可用的脚本命令
   - 项目结构说明
   - 贡献指南

## 提示

1. 从小处着手，逐步添加工具
2. 确保每个工具都真正有用
3. 保持配置简洁明了
4. 考虑团队的实际需求
5. 记录所有重要决策

加油！构建一个现代化的开发环境是每个开发者的必备技能！🚀