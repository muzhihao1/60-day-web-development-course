---
day: 8
title: "npm包发布完整指南"
description: "从零到一发布你的第一个npm包"
category: "tooling"
language: "json"
---

# npm包发布完整指南

## 发布前准备

### 1. 创建npm账号

```bash
# 注册新账号（如果还没有）
npm adduser

# 或者登录现有账号
npm login

# 验证登录状态
npm whoami

# 查看当前配置
npm config list
```

### 2. 包名称检查

```bash
# 检查包名是否可用
npm view your-package-name

# 如果返回404错误，说明名称可用
# 如果返回包信息，需要换个名字

# 使用作用域包避免命名冲突
npm init --scope=@yourusername
# 包名将是 @yourusername/package-name
```

### 3. 初始化项目

```bash
# 创建项目目录
mkdir my-awesome-package
cd my-awesome-package

# 初始化Git
git init

# 交互式创建package.json
npm init

# 或使用默认值
npm init -y
```

## 项目结构最佳实践

```
my-awesome-package/
├── src/                 # 源代码
│   ├── index.js
│   └── utils.js
├── dist/               # 构建输出（如果需要）
├── test/               # 测试文件
│   └── index.test.js
├── examples/           # 使用示例
│   └── basic.js
├── docs/              # 文档
│   └── API.md
├── .gitignore
├── .npmignore
├── .eslintrc.json
├── .prettierrc
├── package.json
├── README.md
├── CHANGELOG.md
├── LICENSE
└── CONTRIBUTING.md
```

## 必要的配置文件

### package.json必需字段

```json
{
  "name": "my-awesome-package",
  "version": "1.0.0",
  "description": "一个很棒的npm包",
  "main": "src/index.js",
  "files": [
    "src",
    "dist"
  ],
  "scripts": {
    "test": "jest",
    "lint": "eslint src",
    "prepublishOnly": "npm test && npm run lint"
  },
  "keywords": ["awesome", "package", "npm"],
  "author": "Your Name <email@example.com>",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/username/my-awesome-package.git"
  },
  "bugs": {
    "url": "https://github.com/username/my-awesome-package/issues"
  },
  "homepage": "https://github.com/username/my-awesome-package#readme"
}
```

### .npmignore文件

```
# 开发文件
src/
test/
examples/
docs/

# 配置文件
.eslintrc*
.prettierrc*
.babelrc*
jest.config.js
webpack.config.js
rollup.config.js
tsconfig.json

# CI/CD
.github/
.gitlab-ci.yml
.travis.yml

# 编辑器
.vscode/
.idea/
*.swp
*.swo

# 其他
.DS_Store
*.log
coverage/
.nyc_output/

# 如果发布dist目录，不要忽略
!dist/
```

### README.md模板

```markdown
# My Awesome Package

简短的包描述，说明这个包是做什么的。

## 特性

- ✨ 特性1
- 🚀 特性2
- 💡 特性3

## 安装

```bash
npm install my-awesome-package
```

或使用yarn：

```bash
yarn add my-awesome-package
```

## 快速开始

```javascript
const awesome = require('my-awesome-package');

// 基本用法示例
const result = awesome.doSomething('input');
console.log(result);
```

## API文档

### `doSomething(input)`

功能描述...

#### 参数

- `input` (string) - 参数描述

#### 返回值

- `result` (any) - 返回值描述

#### 示例

```javascript
const result = awesome.doSomething('hello');
// => 'HELLO'
```

## 高级用法

更复杂的使用示例...

## 贡献

欢迎贡献！请查看[贡献指南](CONTRIBUTING.md)。

## 许可证

[MIT](LICENSE) © Your Name
```

### LICENSE文件（MIT示例）

```
MIT License

Copyright (c) 2024 Your Name

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 发布前检查清单

### 1. 代码质量检查

```bash
# 运行测试
npm test

# 检查代码规范
npm run lint

# 检查类型（如果使用TypeScript）
npm run type-check

# 运行所有检查
npm run validate
```

### 2. 检查将要发布的文件

```bash
# 查看将要打包的文件
npm pack --dry-run

# 或者实际打包查看
npm pack
tar -tf my-awesome-package-1.0.0.tgz

# 检查包大小
npm publish --dry-run
```

### 3. 版本管理

```bash
# 查看当前版本
npm version

# 更新版本（自动创建git tag）
npm version patch   # 1.0.0 -> 1.0.1
npm version minor   # 1.0.1 -> 1.1.0
npm version major   # 1.1.0 -> 2.0.0

# 带消息的版本更新
npm version patch -m "版本升级到 %s - 修复了XYZ问题"

# 预发布版本
npm version prepatch --preid=beta  # 1.0.0 -> 1.0.1-beta.0
npm version prerelease             # 1.0.1-beta.0 -> 1.0.1-beta.1
```

## 发布流程

### 1. 首次发布

```bash
# 确保已登录
npm whoami

# 发布到npm
npm publish

# 如果是作用域包，需要设置为公开
npm publish --access public
```

### 2. 更新发布

```bash
# 1. 更新代码并提交
git add .
git commit -m "feat: 添加新功能"

# 2. 运行测试
npm test

# 3. 更新版本
npm version minor

# 4. 发布
npm publish

# 5. 推送到Git仓库
git push origin main --tags
```

### 3. 发布标签版本

```bash
# 发布beta版本
npm publish --tag beta

# 发布next版本
npm publish --tag next

# 安装特定标签
npm install my-package@beta
```

## 发布后管理

### 1. 查看发布信息

```bash
# 查看包信息
npm view my-awesome-package

# 查看所有版本
npm view my-awesome-package versions

# 查看特定版本
npm view my-awesome-package@1.0.0

# 查看包的元数据
npm view my-awesome-package --json
```

### 2. 废弃版本

```bash
# 废弃特定版本
npm deprecate my-awesome-package@1.0.0 "存在严重bug，请使用1.0.1"

# 废弃版本范围
npm deprecate my-awesome-package@"< 2.0.0" "请升级到2.0.0或更高版本"
```

### 3. 撤销发布

```bash
# 撤销特定版本（发布后72小时内）
npm unpublish my-awesome-package@1.0.0

# 撤销整个包（谨慎使用！）
npm unpublish my-awesome-package --force
```

## 自动化发布

### GitHub Actions示例

```yaml
# .github/workflows/publish.yml
name: Publish to npm

on:
  release:
    types: [created]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: '16'
          registry-url: 'https://registry.npmjs.org'
      
      - run: npm ci
      
      - run: npm test
      
      - run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{secrets.NPM_TOKEN}}
```

### 使用semantic-release

```bash
# 安装
npm install --save-dev semantic-release

# package.json配置
{
  "scripts": {
    "semantic-release": "semantic-release"
  },
  "release": {
    "branches": ["main"]
  }
}

# .releaserc.json
{
  "branches": ["main"],
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "@semantic-release/changelog",
    "@semantic-release/npm",
    "@semantic-release/github",
    "@semantic-release/git"
  ]
}
```

## 最佳实践建议

### 1. 语义化版本

遵循语义化版本规范：
- **MAJOR**：不兼容的API变更
- **MINOR**：向后兼容的新功能
- **PATCH**：向后兼容的问题修复

### 2. 变更日志

维护CHANGELOG.md文件：

```markdown
# Changelog

## [2.0.0] - 2024-01-27
### Breaking Changes
- 改变了API接口

### Added
- 新增功能X

### Fixed
- 修复问题Y

## [1.1.0] - 2024-01-20
### Added
- 新增功能Z
```

### 3. 测试覆盖

```json
{
  "scripts": {
    "test": "jest --coverage",
    "test:ci": "jest --ci --coverage --maxWorkers=2"
  },
  "jest": {
    "coverageThreshold": {
      "global": {
        "branches": 80,
        "functions": 80,
        "lines": 80,
        "statements": 80
      }
    }
  }
}
```

### 4. 文档完善

- 提供清晰的安装说明
- 包含完整的API文档
- 添加使用示例
- 说明配置选项
- 提供迁移指南

### 5. 社区建设

- 及时响应Issue
- 欢迎Pull Request
- 维护行为准则
- 建立贡献指南
- 创建模板文件

记住：发布npm包不仅是分享代码，更是承担维护责任。确保你的包是高质量、文档完善且持续维护的！