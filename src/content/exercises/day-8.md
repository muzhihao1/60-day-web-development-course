---
day: 8
title: "创建并发布一个npm工具包"
description: "从零开始创建一个实用的npm包，包含完整的配置、测试和发布流程"
difficulty: "intermediate"
estimatedTime: 45
requirements:
  - "创建一个名为easy-datetime-utils的npm包"
  - "实现日期格式化功能（多种格式、相对时间）"
  - "实现日期计算功能（加减、差值计算）"
  - "实现日期验证功能（格式验证、闰年检查）"
  - "编写完整的单元测试（覆盖率80%以上）"
  - "配置ESLint和Prettier代码规范"
  - "编写README和API文档"
  - "准备npm发布配置"
---

# Day 08 练习：创建并发布一个npm工具包

## 🎯 练习目标

通过创建一个实际的npm包，掌握包开发的完整流程。你将创建一个日期时间处理工具库，包含常用的日期格式化和计算功能。

## 📋 项目需求

### 功能需求

创建一个名为 `easy-datetime-utils` 的npm包，实现以下功能：

1. **日期格式化**
   - 格式化为不同的日期格式
   - 相对时间显示（如"3天前"）
   - 自定义格式模板

2. **日期计算**
   - 添加/减去天数、月份、年份
   - 计算两个日期之间的差异
   - 获取特定时间单位的开始/结束

3. **日期验证**
   - 验证日期字符串格式
   - 检查是否为闰年
   - 检查是否为周末/工作日

4. **时区处理**
   - 基本的时区转换
   - 获取当前时区信息

## 🏗️ 项目结构

```
easy-datetime-utils/
├── src/
│   ├── index.js          # 主入口文件
│   ├── format.js         # 格式化功能
│   ├── calculate.js      # 计算功能
│   ├── validate.js       # 验证功能
│   └── timezone.js       # 时区功能
├── tests/
│   ├── format.test.js
│   ├── calculate.test.js
│   ├── validate.test.js
│   └── timezone.test.js
├── examples/             # 使用示例
│   └── demo.js
├── docs/                # 文档
│   └── API.md
├── .gitignore
├── .npmignore
├── .eslintrc.json
├── .prettierrc
├── jest.config.js
├── package.json
├── README.md
├── CHANGELOG.md
└── LICENSE
```

## 📝 实现步骤

### 第一步：项目初始化

```bash
# 创建项目目录
mkdir easy-datetime-utils
cd easy-datetime-utils

# 初始化Git仓库
git init

# 初始化npm项目
npm init

# 回答初始化问题
# name: easy-datetime-utils
# version: 0.1.0
# description: 一个简单易用的JavaScript日期时间处理工具库
# entry point: src/index.js
# test command: jest
# git repository: https://github.com/yourusername/easy-datetime-utils
# keywords: date, time, datetime, format, utility
# author: Your Name
# license: MIT
```

### 第二步：安装依赖

```bash
# 安装开发依赖
npm install --save-dev jest eslint prettier husky lint-staged
npm install --save-dev @babel/core @babel/preset-env babel-jest

# 初始化ESLint
npx eslint --init

# 安装husky
npx husky install
```

### 第三步：配置文件

创建各种配置文件：

1. **Jest配置** (`jest.config.js`)
2. **Babel配置** (`.babelrc`)
3. **ESLint配置** (`.eslintrc.json`)
4. **Prettier配置** (`.prettierrc`)
5. **Git忽略文件** (`.gitignore`)
6. **npm忽略文件** (`.npmignore`)

### 第四步：实现核心功能

按照以下顺序实现各个模块：

1. **格式化模块** (`src/format.js`)
   - `format(date, pattern)` - 格式化日期
   - `formatRelative(date)` - 相对时间
   - `formatDuration(ms)` - 格式化时长

2. **计算模块** (`src/calculate.js`)
   - `addDays(date, days)` - 添加天数
   - `addMonths(date, months)` - 添加月份
   - `diffInDays(date1, date2)` - 计算天数差
   - `startOfDay(date)` - 获取一天的开始

3. **验证模块** (`src/validate.js`)
   - `isValidDate(dateString)` - 验证日期字符串
   - `isLeapYear(year)` - 是否闰年
   - `isWeekend(date)` - 是否周末

4. **主入口** (`src/index.js`)
   - 导出所有功能

### 第五步：编写测试

为每个功能编写单元测试，确保测试覆盖率达到80%以上。

### 第六步：编写文档

1. **README.md** - 项目介绍和快速开始
2. **API.md** - 详细的API文档
3. **CHANGELOG.md** - 版本更新日志

### 第七步：准备发布

1. 运行所有测试
2. 检查代码质量
3. 更新版本号
4. 创建npm账号（如果没有）
5. 登录npm
6. 发布包

## 💡 实现提示

### 日期格式化实现示例

```javascript
// src/format.js
const formatTokens = {
  'YYYY': (date) => date.getFullYear(),
  'MM': (date) => String(date.getMonth() + 1).padStart(2, '0'),
  'DD': (date) => String(date.getDate()).padStart(2, '0'),
  'HH': (date) => String(date.getHours()).padStart(2, '0'),
  'mm': (date) => String(date.getMinutes()).padStart(2, '0'),
  'ss': (date) => String(date.getSeconds()).padStart(2, '0')
};

function format(date, pattern = 'YYYY-MM-DD') {
  // 实现格式化逻辑
}

function formatRelative(date) {
  // 实现相对时间逻辑
  // 返回如 "2小时前", "3天后" 等
}
```

### 测试示例

```javascript
// tests/format.test.js
const { format, formatRelative } = require('../src/format');

describe('Date Formatting', () => {
  test('format() should format date correctly', () => {
    const date = new Date('2024-01-27T10:30:00');
    expect(format(date, 'YYYY-MM-DD')).toBe('2024-01-27');
    expect(format(date, 'HH:mm:ss')).toBe('10:30:00');
  });

  test('formatRelative() should return relative time', () => {
    const now = new Date();
    const yesterday = new Date(now - 24 * 60 * 60 * 1000);
    expect(formatRelative(yesterday)).toBe('1天前');
  });
});
```

### package.json脚本配置

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint src/**/*.js",
    "lint:fix": "eslint src/**/*.js --fix",
    "format": "prettier --write \"src/**/*.js\"",
    "prepare": "husky install",
    "prepublishOnly": "npm run lint && npm test",
    "version": "npm run format && git add -A src",
    "postversion": "git push && git push --tags"
  }
}
```

## 🔍 评估标准

### 基础要求（60分）

- [ ] 完成所有核心功能的实现
- [ ] 通过所有单元测试
- [ ] 代码符合ESLint规范
- [ ] 有完整的package.json配置

### 进阶要求（30分）

- [ ] 测试覆盖率达到80%以上
- [ ] 提供完整的API文档
- [ ] 支持CommonJS和ES模块
- [ ] 包含TypeScript类型定义

### 加分项（10分）

- [ ] 成功发布到npm
- [ ] 提供在线演示
- [ ] 支持国际化（i18n）
- [ ] 性能优化（如缓存）

## 🎯 挑战任务

### 挑战1：支持链式调用

实现链式API，例如：
```javascript
datetime('2024-01-27')
  .add(3, 'days')
  .startOf('month')
  .format('YYYY-MM-DD');
```

### 挑战2：插件系统

设计一个插件系统，允许用户扩展功能：
```javascript
datetime.use(customPlugin);
```

### 挑战3：性能基准测试

创建性能基准测试，与其他流行的日期库（如moment.js、dayjs）进行对比。

## 📊 交付要求

完成练习后，你应该有：

1. **功能完整的npm包**
   - 所有功能正常工作
   - 通过所有测试
   - 代码质量良好

2. **完善的文档**
   - README包含安装和使用说明
   - API文档详细完整
   - 包含使用示例

3. **专业的项目配置**
   - 合理的目录结构
   - 完整的配置文件
   - Git提交历史清晰

4. **发布准备**
   - npm账号已登录
   - 版本号符合语义化规范
   - 包名称可用

## 🚀 提交方式

1. 将代码推送到GitHub仓库
2. 在README中添加npm包链接（如果已发布）
3. 提供测试覆盖率报告
4. 记录开发过程中遇到的问题和解决方案

## 📚 参考资源

- [npm包发布指南](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)
- [Jest测试框架](https://jestjs.io/docs/getting-started)
- [语义化版本规范](https://semver.org/lang/zh-CN/)
- [开源许可证选择](https://choosealicense.com/)

记住：创建一个高质量的npm包不仅需要好的代码，还需要良好的文档、测试和维护。专注于用户体验和代码质量！