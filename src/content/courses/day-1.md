---
day: 1
phase: modern-web
title: 开发环境与版本控制
description: 今天是你Web开发之旅的第一天！我们将搭建专业的开发环境，并掌握版本控制的基础知识。
objectives:
  - 安装并配置VS Code编辑器
  - 掌握必备的VS Code插件和快捷键
  - 理解Git版本控制的核心概念
  - 创建GitHub账号并管理代码仓库
  - 完成第一次代码提交
estimatedTime: 60
difficulty: beginner
tags:
  - modern-web
  - day-1
  - git
  - vscode
resources:
  - title: VS Code官方文档
    url: https://code.visualstudio.com/docs
    type: documentation
  - title: Git入门教程
    url: https://git-scm.com/book/zh/v2
    type: documentation
---

## ⏱️ 课程介绍与目标设定（5分钟）

### 为什么选择Web开发？

Web开发是当今最具活力和需求的技能之一。通过这60天的学习：
- 你将掌握构建现代网站和应用的完整技能栈
- 从零基础到能够独立开发项目
- 建立良好的编程习惯和工程化思维

### 学习方法论

1. **每日一小时**：保持稳定的学习节奏
2. **实践优先**：动手写代码比看教程更重要
3. **项目驱动**：通过实际项目巩固知识
4. **独立思考**：培养自主解决问题的能力

## 💻 VS Code配置与插件安装（15分钟）

### 1. 下载并安装VS Code

访问 [VS Code官网](https://code.visualstudio.com/) 下载适合你操作系统的版本。

### 2. 初始配置

安装完成后，进行基础配置：

```json
// 文件 > 首选项 > 设置 (或 Cmd/Ctrl + ,)
// 搜索并修改以下设置
{
  "editor.fontSize": 16,
  "editor.tabSize": 2,
  "editor.wordWrap": "on",
  "editor.formatOnSave": true,
  "files.autoSave": "afterDelay",
  "files.autoSaveDelay": 1000
}
```

### 3. 必装插件推荐

在扩展商店（Cmd/Ctrl + Shift + X）中搜索并安装：

1. **Live Server** - 实时预览HTML页面
2. **Prettier** - 代码格式化工具
3. **ESLint** - JavaScript代码检查
4. **GitLens** - 增强Git功能
5. **Auto Rename Tag** - 自动重命名配对标签
6. **Path Intellisense** - 路径智能提示

### 4. 主题设置（可选）

推荐主题：
- One Dark Pro
- Dracula Official
- Material Theme

## 🔧 Git基础与GitHub设置（20分钟）

### 什么是Git？

Git是一个分布式版本控制系统，它能够：
- 记录代码的每次修改
- 回退到任意历史版本
- 多人协作开发
- 分支管理

### 安装Git

1. **Windows**: 访问 [git-scm.com](https://git-scm.com/) 下载安装
2. **Mac**: 使用Homebrew `brew install git` 或下载安装包
3. **Linux**: 使用包管理器 `sudo apt-get install git`

### 配置Git

打开终端（Terminal/命令提示符），执行：

```bash
# 设置用户名（使用你的真实姓名）
git config --global user.name "你的名字"

# 设置邮箱（使用GitHub注册邮箱）
git config --global user.email "your.email@example.com"

# 验证配置
git config --list
```

### 创建GitHub账号

1. 访问 [github.com](https://github.com/)
2. 点击 "Sign up" 注册账号
3. 验证邮箱
4. 完善个人资料

## 🎯 实战：创建第一个仓库（15分钟）

### 1. 在GitHub创建仓库

1. 登录GitHub后，点击右上角 "+" → "New repository"
2. 仓库名称：`my-web-journey`
3. 描述：`我的60天Web开发学习之旅`
4. 选择 "Public"（公开）
5. 勾选 "Add a README file"
6. 点击 "Create repository"

### 2. 克隆到本地

```bash
# 在终端中执行（替换为你的用户名）
git clone https://github.com/你的用户名/my-web-journey.git

# 进入项目目录
cd my-web-journey

# 在VS Code中打开
code .
```

### 3. 创建学习日志

在VS Code中创建文件 `day-01.md`：

```markdown
# Day 01 - 开发环境搭建

## 今日完成
- ✅ 安装配置VS Code
- ✅ 安装必要插件
- ✅ 配置Git环境
- ✅ 创建GitHub账号
- ✅ 创建第一个仓库

## 学习笔记
- Git的工作原理：工作区 → 暂存区 → 仓库
- VS Code快捷键：
  - Cmd/Ctrl + S: 保存
  - Cmd/Ctrl + P: 快速打开文件
  - Cmd/Ctrl + Shift + P: 命令面板

## 明日计划
- 学习HTML基础
- 创建第一个网页
```

### 4. 提交代码

```bash
# 查看状态
git status

# 添加文件到暂存区
git add day-01.md

# 提交到本地仓库
git commit -m "Day 01: 完成开发环境搭建"

# 推送到GitHub
git push origin main
```

## 🌟 总结与作业

### 今日要点回顾

1. **开发环境**：VS Code + 插件 = 高效开发
2. **版本控制**：Git记录每一次改变
3. **代码托管**：GitHub保存和分享代码
4. **工作流程**：编辑 → 暂存 → 提交 → 推送

### 课后作业

1. 探索VS Code的更多功能和快捷键
2. 在GitHub上浏览优秀的开源项目
3. 创建 `README.md` 文件，介绍你的学习计划
4. 尝试使用Markdown语法写日志

### 常见问题

**Q: Git push失败怎么办？**
A: 检查网络连接，确认GitHub用户名密码正确，或配置SSH密钥。

**Q: VS Code中文乱码？**
A: 文件 → 首选项 → 设置 → 搜索 "encoding" → 设为 "UTF-8"

**Q: 如何撤销Git提交？**
A: 使用 `git reset --soft HEAD~1` 撤销最后一次提交

---

🎉 恭喜你完成第一天的学习！明天我们将开始HTML的学习之旅。