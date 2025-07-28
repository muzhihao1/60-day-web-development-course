---
title: "npm包发布工作流"
description: "展示如何准备和发布npm包的完整流程"
---

## 发布前准备

```bash
# 1. 创建npm账号（如果没有）
npm adduser

# 2. 登录npm
npm login
# Username: your-username
# Password: ********
# Email: your-email@example.com

# 3. 验证登录
npm whoami

# 4. 检查包名是否可用
npm view your-package-name
```

## 包配置

```json
// package.json
{
  "name": "my-awesome-package",
  "version": "1.0.0",
  "description": "一个很棒的npm包",
  "main": "dist/index.js",
  "files": [
    "dist",
    "README.md",
    "LICENSE"
  ],
  "scripts": {
    "build": "rollup -c",
    "test": "jest",
    "prepublishOnly": "npm run test && npm run build",
    "prepare": "npm run build"
  },
  "keywords": ["awesome", "utility"],
  "author": "Your Name <email@example.com>",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/username/repo.git"
  },
  "publishConfig": {
    "access": "public",
    "registry": "https://registry.npmjs.org/"
  }
}
```

## .npmignore配置

```
# 源文件
src/
tests/
examples/

# 配置文件
.eslintrc
.prettierrc
jest.config.js
rollup.config.js
tsconfig.json

# 开发文件
.editorconfig
.gitignore
.npmignore

# CI/CD
.github/
.travis.yml
.circleci/

# 文档
docs/
*.md
!README.md

# 其他
coverage/
.nyc_output/
*.log
.DS_Store
```

## 版本管理

```bash
# 查看当前版本
npm version

# 更新版本（自动创建git标签）
npm version patch  # 1.0.0 -> 1.0.1
npm version minor  # 1.0.1 -> 1.1.0
npm version major  # 1.1.0 -> 2.0.0

# 更新版本并添加消息
npm version patch -m "版本升级到 %s - 修复了XX bug"

# 预发布版本
npm version prerelease --preid=beta  # 1.0.0 -> 1.0.1-beta.0
npm version prerelease               # 1.0.1-beta.0 -> 1.0.1-beta.1

# 自定义版本
npm version 1.2.3
```

## 发布流程

```bash
# 1. 运行测试
npm test

# 2. 构建项目
npm run build

# 3. 检查将要发布的文件
npm pack --dry-run

# 4. 创建压缩包查看内容
npm pack
tar -tf package-name-1.0.0.tgz

# 5. 发布到npm
npm publish

# 发布范围包（scoped package）
npm publish --access public

# 发布带标签
npm publish --tag beta
npm publish --tag next

# 6. 查看发布的包
npm info your-package-name
```

## 发布后维护

```bash
# 添加标签到已发布版本
npm dist-tag add package@1.0.0 latest
npm dist-tag add package@2.0.0-beta.1 beta

# 查看所有标签
npm dist-tag ls package

# 废弃某个版本
npm deprecate package@1.0.0 "此版本有严重bug，请升级到1.0.1"

# 撤销发布（24小时内）
npm unpublish package@1.0.0

# 查看包的所有版本
npm view package versions --json

# 查看包的下载统计
npm view package downloads
```

## 自动化发布

```json
// package.json - 使用GitHub Actions
{
  "scripts": {
    "release": "np",
    "release:beta": "np --tag beta --any-branch",
    "version": "conventional-changelog -p angular -i CHANGELOG.md -s && git add CHANGELOG.md"
  }
}
```

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
      - run: npm run build
      - run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{secrets.NPM_TOKEN}}
```

## 私有包发布

```bash
# 发布到私有注册表
npm publish --registry https://npm.company.com

# 配置范围注册表
npm config set @mycompany:registry https://npm.company.com

# 发布私有范围包
npm publish

# 使用.npmrc配置
echo "@mycompany:registry=https://npm.company.com" >> .npmrc
echo "//npm.company.com/:_authToken=${NPM_TOKEN}" >> .npmrc
```