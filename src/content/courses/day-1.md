---
day: 1
phase: "modern-web"
title: "开发环境与版本控制"
description: "搭建专业的开发环境，掌握Git版本控制的基础知识"
objectives:
  - "安装并配置VS Code编辑器"
  - "掌握必备的VS Code插件和快捷键"
  - "理解Git版本控制的核心概念"
  - "创建GitHub账号并管理代码仓库"
  - "完成第一次代码提交"
estimatedTime: 60
difficulty: "beginner"
tags:
  - "Git"
  - "版本控制"
  - "开发工具"
  - "VS Code"
  - "GitHub"
resources:
  - title: "VS Code文档"
    url: "https://code.visualstudio.com/docs"
    type: "documentation"
  - title: "Git官方教程"
    url: "https://git-scm.com/book/zh/v2"
    type: "documentation"
  - title: "GitHub文档"
    url: "https://docs.github.com/zh"
    type: "documentation"
---

# Day 01: 开发环境与版本控制

## 📋 学习目标

今天是你Web开发之旅的第一天！我们将搭建专业的开发环境，并掌握版本控制的基础知识。

- 安装并配置VS Code编辑器
- 掌握必备的VS Code插件和快捷键
- 理解Git版本控制的核心概念
- 创建GitHub账号并管理代码仓库
- 完成第一次代码提交

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

### 今日目标

- 搭建完整的开发环境
- 理解版本控制的重要性
- 完成第一个Git提交

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
  "workbench.colorTheme": "Default Dark+",
  "terminal.integrated.fontSize": 14
}
```

### 3. 必备插件安装

打开扩展面板（Cmd/Ctrl + Shift + X），搜索并安装：

#### 核心插件
1. **Live Server** - 实时预览HTML文件
2. **Prettier** - 代码格式化工具
3. **ESLint** - JavaScript代码检查
4. **GitLens** - Git增强功能
5. **Auto Rename Tag** - 自动重命名配对的HTML标签
6. **Path Intellisense** - 路径自动补全

#### 视觉增强
1. **Material Icon Theme** - 美观的文件图标
2. **Bracket Pair Colorizer** - 括号配对着色
3. **indent-rainbow** - 缩进彩虹指示

### 4. 快捷键掌握

必须掌握的快捷键：
- `Cmd/Ctrl + S` - 保存文件
- `Cmd/Ctrl + /` - 注释/取消注释
- `Cmd/Ctrl + D` - 选中下一个相同的文本
- `Cmd/Ctrl + P` - 快速打开文件
- `Cmd/Ctrl + Shift + P` - 命令面板
- `Cmd/Ctrl + B` - 切换侧边栏
- `Cmd/Ctrl + `` - 切换终端

## 🔧 Git基础与GitHub账号设置（30分钟）

### 1. 什么是Git？

Git是一个分布式版本控制系统，它能够：
- 追踪代码的每一次修改
- 多人协作开发
- 回退到任何历史版本
- 创建不同的开发分支

### 2. 安装Git

#### Windows
下载 [Git for Windows](https://git-scm.com/download/win) 并安装

#### macOS
```bash
# 使用Homebrew安装
brew install git

# 或下载安装包
# https://git-scm.com/download/mac
```

#### Linux
```bash
# Ubuntu/Debian
sudo apt-get install git

# Fedora
sudo dnf install git
```

### 3. Git配置

打开终端（VS Code内置终端：Ctrl + `），执行：

```bash
# 设置用户名（使用你的真实姓名）
git config --global user.name "Your Name"

# 设置邮箱（使用你的常用邮箱）
git config --global user.email "your.email@example.com"

# 设置默认分支名为main
git config --global init.defaultBranch main

# 查看配置
git config --list
```

### 4. 创建GitHub账号

1. 访问 [GitHub](https://github.com)
2. 点击 "Sign up" 注册账号
3. 选择用户名（建议专业且易记）
4. 验证邮箱
5. 完成个人资料设置

### 5. SSH密钥配置（可选但推荐）

```bash
# 生成SSH密钥
ssh-keygen -t ed25519 -C "your.email@example.com"

# 查看公钥
cat ~/.ssh/id_ed25519.pub

# 复制输出的内容
# 在GitHub设置中添加SSH密钥：
# Settings > SSH and GPG keys > New SSH key
```

### 6. Git核心概念

#### 工作区域
- **工作区（Working Directory）**：你的项目文件夹
- **暂存区（Staging Area）**：准备提交的文件
- **仓库（Repository）**：保存所有历史记录

#### 基本工作流程
```bash
# 1. 初始化仓库
git init

# 2. 添加文件到暂存区
git add filename.txt
git add .  # 添加所有文件

# 3. 提交到仓库
git commit -m "描述这次修改的内容"

# 4. 查看状态
git status

# 5. 查看历史
git log --oneline
```

## 🚀 创建第一个仓库并提交（10分钟）

### 实践练习：创建你的学习仓库

1. **在本地创建项目文件夹**
```bash
# 创建文件夹
mkdir web-learning-journey
cd web-learning-journey

# 初始化Git仓库
git init
```

2. **创建README文件**
```bash
# 创建README.md
echo "# 我的Web开发学习之旅" > README.md
echo "" >> README.md
echo "这是我学习Web开发的记录仓库。" >> README.md
echo "" >> README.md
echo "## 学习计划" >> README.md
echo "- [ ] 第一阶段：现代Web基础" >> README.md
echo "- [ ] 第二阶段：JavaScript与编程思维" >> README.md
echo "- [ ] 第三阶段：React现代前端开发" >> README.md
echo "- [ ] 第四阶段：后端开发与数据库" >> README.md
echo "- [ ] 第五阶段：全栈整合与部署" >> README.md
```

3. **创建.gitignore文件**
```bash
# 创建.gitignore
echo "# 系统文件" > .gitignore
echo ".DS_Store" >> .gitignore
echo "Thumbs.db" >> .gitignore
echo "" >> .gitignore
echo "# 编辑器文件" >> .gitignore
echo ".vscode/" >> .gitignore
echo ".idea/" >> .gitignore
echo "" >> .gitignore
echo "# 依赖文件" >> .gitignore
echo "node_modules/" >> .gitignore
echo "" >> .gitignore
echo "# 环境变量" >> .gitignore
echo ".env" >> .gitignore
```

4. **进行第一次提交**
```bash
# 查看状态
git status

# 添加所有文件
git add .

# 提交
git commit -m "初始化项目：添加README和.gitignore"

# 查看提交历史
git log --oneline
```

5. **在GitHub创建远程仓库**
- 登录GitHub
- 点击右上角 "+" > "New repository"
- 仓库名：`web-learning-journey`
- 描述：`我的60天Web开发学习记录`
- 选择 "Public"
- 不要初始化README（我们已经有了）
- 点击 "Create repository"

6. **连接远程仓库**
```bash
# 添加远程仓库（替换YOUR_USERNAME）
git remote add origin https://github.com/YOUR_USERNAME/web-learning-journey.git

# 或使用SSH（如果配置了SSH密钥）
git remote add origin git@github.com:YOUR_USERNAME/web-learning-journey.git

# 推送到远程仓库
git push -u origin main
```

## 📚 学习资源

### 官方文档
- [VS Code文档](https://code.visualstudio.com/docs)
- [Git官方教程](https://git-scm.com/book/zh/v2)
- [GitHub文档](https://docs.github.com/zh)

### 推荐教程
- [VS Code快捷键大全](https://code.visualstudio.com/shortcuts/keyboard-shortcuts-windows.pdf)
- [图解Git](https://marklodato.github.io/visual-git-guide/index-zh-cn.html)
- [GitHub技能课程](https://skills.github.com/)

### 视频资源
- [VS Code入门教程](https://www.youtube.com/watch?v=VqCgcpAypFQ)
- [Git入门到精通](https://www.youtube.com/watch?v=8JJ101D3knE)

## ✅ 今日检查清单

确保你已完成以下任务：

- [ ] VS Code已安装并完成基础配置
- [ ] 安装了所有推荐的VS Code插件
- [ ] Git已安装并完成用户配置
- [ ] GitHub账号已创建
- [ ] 创建了第一个Git仓库
- [ ] 完成了第一次commit
- [ ] 成功推送到GitHub远程仓库
- [ ] 能够熟练使用基本的Git命令

## 🤔 自测问题

1. **Git的三个工作区域分别是什么？它们的作用是什么？**

2. **解释以下Git命令的作用：**
   - `git init`
   - `git add .`
   - `git commit -m "message"`
   - `git status`
   - `git log`

3. **为什么需要.gitignore文件？列举3种应该被忽略的文件类型。**

4. **VS Code中，如何快速打开命令面板？如何切换终端？**

5. **什么是版本控制？为什么它对开发者很重要？**

## 🎯 拓展练习

如果你完成了今天的内容，可以尝试：

1. 探索更多VS Code快捷键
2. 自定义VS Code主题和设置
3. 学习Git分支的基本概念
4. 在GitHub上找一个感兴趣的开源项目并Star
5. 阅读优秀项目的README文件，学习如何写好文档

## 💡 今日总结

恭喜你完成了第一天的学习！今天你已经：
- 搭建了专业的开发环境
- 掌握了Git版本控制的基础
- 完成了人生中第一次代码提交

这些工具和知识将贯穿你整个开发生涯。明天我们将开始学习HTML5的语义化标签和Web可访问性，正式进入Web开发的世界！

记住：**好的开始是成功的一半**。保持学习的热情，明天见！ 🚀