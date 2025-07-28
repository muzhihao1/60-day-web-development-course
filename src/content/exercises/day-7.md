---
title: "团队博客项目：Git协作实战"
day: 7
difficulty: "intermediate"
estimatedTime: 90
description: "通过构建一个团队博客项目，实践Git分支管理、团队协作和冲突解决"
requirements:
  - "使用Git Flow分支策略"
  - "模拟3个开发者的协作"
  - "处理并解决合并冲突"
  - "执行代码审查流程"
  - "创建版本发布"
  - "实施紧急修复"
checkpoints:
  - task: "初始化项目和Git仓库"
    completed: false
  - task: "创建develop分支并制定开发规范"
    completed: false
  - task: "开发者A：创建首页功能分支"
    completed: false
  - task: "开发者B：创建样式系统分支"
    completed: false
  - task: "开发者C：创建文章功能分支"
    completed: false
  - task: "解决合并冲突"
    completed: false
  - task: "创建release分支并发布"
    completed: false
  - task: "模拟并修复生产环境bug"
    completed: false
hints:
  - "使用git log --graph查看分支历史"
  - "合并前先pull最新代码避免冲突"
  - "使用--no-ff保留合并历史"
  - "标签用于标记重要版本"
---

# Day 7 练习：团队博客项目 - Git协作实战

## 项目背景

你的团队决定开发一个技术博客网站。团队有3名开发者：
- **开发者A**：负责前端架构和首页开发
- **开发者B**：负责UI/UX设计和样式系统
- **开发者C**：负责内容管理和JavaScript功能

通过这个项目，你将学习如何在真实的团队环境中使用Git进行协作。

## 学习目标

1. 实践Git Flow分支管理策略
2. 模拟多人协作开发流程
3. 学习解决合并冲突
4. 掌握代码审查流程
5. 实施版本发布管理
6. 处理紧急bug修复

## 练习任务

### 第一部分：项目初始化（15分钟）

#### 1.1 创建项目目录和Git仓库

```bash
# 创建项目目录
mkdir team-blog-exercise
cd team-blog-exercise

# 初始化Git仓库
git init

# 配置用户信息（模拟不同开发者时需要切换）
git config user.name "团队领导"
git config user.email "leader@team.com"
```

#### 1.2 创建项目基础文件

创建以下文件结构：
- `README.md` - 项目说明和开发规范
- `.gitignore` - Git忽略文件
- 创建基础目录：`css/`, `js/`, `images/`

**README.md内容要求：**
- 项目介绍
- 开发规范（分支命名、提交信息格式）
- 团队成员和职责分工

#### 1.3 建立分支策略

```bash
# 初始提交
git add .
git commit -m "chore: 初始化项目结构"

# 创建develop分支
git checkout -b develop
```

### 第二部分：功能开发（45分钟）

#### 2.1 开发者A - 首页结构

切换身份并创建功能分支：
```bash
# 模拟开发者A
git config user.name "开发者A"
git config user.email "dev-a@team.com"

# 从develop创建功能分支
git checkout -b feature/homepage
```

**任务：**
1. 创建 `index.html` 文件，包含：
   - 网站头部（logo、导航菜单）
   - 主要内容区域（文章列表占位）
   - 页脚信息
2. 创建基础的HTML结构
3. 提交更改（使用规范的提交信息）

#### 2.2 开发者B - 样式系统

```bash
# 切回develop分支
git checkout develop

# 模拟开发者B
git config user.name "开发者B"
git config user.email "dev-b@team.com"

# 创建样式分支
git checkout -b feature/design-system
```

**任务：**
1. 创建 `css/style.css` 文件，包含：
   - CSS变量定义（颜色、字体、间距）
   - 基础样式重置
   - 响应式布局系统
   - 组件样式（卡片、按钮等）
2. 实现深色模式支持
3. 提交更改

#### 2.3 开发者C - 文章功能

```bash
# 切回develop分支
git checkout develop

# 模拟开发者C
git config user.name "开发者C"
git config user.email "dev-c@team.com"

# 创建功能分支
git checkout -b feature/articles
```

**任务：**
1. 创建 `article.html` - 文章详情页模板
2. 创建 `js/main.js` - JavaScript功能：
   - 主题切换功能
   - 文章列表动态加载
   - 平滑滚动效果
3. 创建 `about.html` - 关于我们页面
4. 提交更改

### 第三部分：分支合并与冲突解决（20分钟）

#### 3.1 合并到develop分支

```bash
# 切换到develop分支
git checkout develop

# 依次合并各功能分支
git merge --no-ff feature/homepage -m "Merge: 首页功能"
git merge --no-ff feature/design-system -m "Merge: 样式系统"
git merge --no-ff feature/articles -m "Merge: 文章功能"
```

#### 3.2 创建并解决冲突

**冲突场景设计：**
1. 两个开发者同时修改了 `index.html` 的导航部分
2. 手动解决冲突，保留两者的更改
3. 完成合并提交

**练习冲突解决：**
```bash
# 创建冲突场景
git checkout -b feature/nav-update
# 修改导航
# ...提交

git checkout develop
git checkout -b feature/nav-style
# 也修改导航
# ...提交

# 合并时产生冲突
git checkout develop
git merge feature/nav-update
git merge feature/nav-style  # 这里会产生冲突
```

### 第四部分：版本发布（10分钟）

#### 4.1 创建发布分支

```bash
# 从develop创建release分支
git checkout -b release/1.0

# 更新版本号
echo "1.0.0" > VERSION
git add VERSION
git commit -m "chore: 准备1.0版本发布"
```

#### 4.2 发布到生产

```bash
# 合并到main分支
git checkout main
git merge --no-ff release/1.0 -m "Release: 版本1.0"

# 创建标签
git tag -a v1.0 -m "版本1.0：首个正式版本"

# 同步回develop
git checkout develop
git merge --no-ff release/1.0
```

### 第五部分：紧急修复（10分钟）

#### 5.1 模拟生产环境bug

假设发现移动端导航无法正常显示

```bash
# 从main创建hotfix分支
git checkout main
git checkout -b hotfix/mobile-nav

# 修复bug
# 编辑css/style.css，添加移动端修复

# 提交修复
git add css/style.css
git commit -m "hotfix: 修复移动端导航显示问题"
```

#### 5.2 部署修复

```bash
# 合并到main和develop
git checkout main
git merge --no-ff hotfix/mobile-nav
git tag -a v1.0.1 -m "版本1.0.1：修复移动端导航"

git checkout develop
git merge --no-ff hotfix/mobile-nav
```

## 进阶挑战

### 1. Interactive Rebase
清理功能分支的提交历史：
```bash
git checkout feature/your-branch
git rebase -i HEAD~3
# 合并相关的提交
```

### 2. Cherry-pick
从其他分支选择特定提交：
```bash
git log other-branch --oneline
git cherry-pick <commit-sha>
```

### 3. Stash使用
保存临时工作：
```bash
git stash save "WIP: 正在开发的功能"
git stash list
git stash pop
```

## 评分标准

### 1. Git使用规范（40%）
- 分支命名是否规范
- 提交信息是否清晰
- 是否正确使用合并策略

### 2. 冲突解决（30%）
- 能否正确识别冲突
- 解决冲突的方法是否合理
- 合并后代码是否正常工作

### 3. 工作流程（20%）
- 是否遵循Git Flow
- 版本发布流程是否完整
- 热修复处理是否正确

### 4. 代码质量（10%）
- HTML/CSS/JS代码质量
- 项目结构是否清晰
- 文档是否完善

## 提交要求

1. 使用 `git log --graph --all --oneline` 截图展示分支历史
2. 提交最终的项目代码
3. 编写项目总结，包含：
   - 遇到的问题和解决方法
   - 对Git工作流的理解
   - 团队协作的心得体会

## 额外学习资源

1. [Pro Git Book](https://git-scm.com/book/zh/v2)
2. [Learn Git Branching](https://learngitbranching.js.org/)
3. [GitHub Flow Guide](https://guides.github.com/introduction/flow/)

## 常见问题

**Q: 如何查看分支图？**
```bash
git log --graph --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit --all
```

**Q: 如何撤销错误的合并？**
```bash
git reset --hard HEAD~1  # 撤销最后一次提交
git revert -m 1 <merge-commit>  # 创建反向提交
```

**Q: 如何同步远程仓库？**
```bash
git remote add origin <url>
git push -u origin main
git push --all origin  # 推送所有分支
git push --tags  # 推送所有标签
```

祝你在Git协作的道路上越走越远！🚀