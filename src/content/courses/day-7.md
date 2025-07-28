---
day: 7
phase: "modern-web"
title: "Git进阶：分支策略与团队协作"
description: "深入学习Git的分支管理、合并策略和冲突解决，掌握团队协作的最佳实践"
objectives:
  - "理解Git分支的工作原理和最佳实践"
  - "掌握分支创建、切换、合并和删除"
  - "学会解决合并冲突的多种方法"
  - "了解Git Flow和GitHub Flow工作流"
  - "掌握git rebase、cherry-pick等高级操作"
  - "学习使用Pull Request进行代码审查"
estimatedTime: 90
difficulty: "intermediate"
prerequisites: [1]
tags:
  - "Git"
  - "版本控制"
  - "团队协作"
  - "工作流"
  - "代码审查"
resources:
  - title: "Pro Git Book 中文版"
    url: "https://git-scm.com/book/zh/v2"
    type: "documentation"
  - title: "GitHub Flow 指南"
    url: "https://guides.github.com/introduction/flow/"
    type: "documentation"
  - title: "Atlassian Git 教程"
    url: "https://www.atlassian.com/git/tutorials"
    type: "documentation"
  - title: "Git分支交互式学习"
    url: "https://learngitbranching.js.org/?locale=zh_CN"
    type: "tool"
---

# Day 07: Git进阶：分支策略与团队协作

## 📋 学习目标

今天我们将深入学习Git的高级功能，掌握专业的团队协作方式。这些技能是每个开发者必备的，无论是个人项目还是团队合作。

- 理解Git分支的工作原理和最佳实践
- 掌握分支创建、切换、合并和删除
- 学会解决合并冲突的多种方法
- 了解Git Flow和GitHub Flow工作流
- 掌握git rebase、cherry-pick等高级操作
- 学习使用Pull Request进行代码审查

## ⏱️ 每日代码仪式（5分钟）

### 项目准备

今天我们将创建一个模拟的团队项目来练习Git协作：

```bash
# 创建今天的项目目录
mkdir day07-git-advanced
cd day07-git-advanced

# 初始化Git仓库
git init

# 创建初始文件
echo "# 团队协作项目" > README.md
echo "console.log('Hello Team!');" > app.js
echo "/* 项目样式 */" > style.css

# 第一次提交
git add .
git commit -m "初始化项目"
```

### 配置Git别名（提高效率）

```bash
# 设置常用命令的别名
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.st status
git config --global alias.lg "log --oneline --graph --all"

# 现在可以使用简短命令
git st  # 等同于 git status
git lg  # 查看美观的提交历史
```

## 🌳 Git分支深入理解（10分钟）

### 分支的本质

Git分支本质上是指向提交对象的可移动指针。创建分支的成本极低，因为Git只是创建了一个新的指针。

```bash
# 查看当前分支指向的提交
git log -1 --oneline

# 查看.git/refs/heads/目录
ls .git/refs/heads/
# main文件包含了main分支指向的提交SHA

# HEAD是什么？
cat .git/HEAD
# ref: refs/heads/main - HEAD指向当前分支
```

### 分支操作基础

```bash
# 1. 创建分支
git branch feature-login     # 创建分支但不切换
git branch -v               # 查看所有分支及其最新提交

# 2. 切换分支
git checkout feature-login  # 切换到feature-login分支
# 或使用新命令
git switch feature-login    # Git 2.23+ 推荐方式

# 3. 创建并切换分支（常用）
git checkout -b feature-navbar
# 或
git switch -c feature-footer

# 4. 查看分支
git branch                  # 本地分支
git branch -r              # 远程分支
git branch -a              # 所有分支
git branch -vv             # 查看分支跟踪关系
```

### 理解分支的独立性

让我们通过实践来理解分支的独立性：

```bash
# 在main分支
git checkout main
echo "Main branch content" > main.txt
git add main.txt
git commit -m "Add main.txt in main branch"

# 切换到feature分支
git checkout -b feature-test
echo "Feature branch content" > feature.txt
git add feature.txt
git commit -m "Add feature.txt in feature branch"

# 查看文件
ls  # 可以看到 feature.txt，但看不到其他分支的独有文件

# 切回main分支
git checkout main
ls  # 可以看到 main.txt，但看不到 feature.txt

# 可视化查看分支
git lg
```

## 🔀 分支合并策略（20分钟）

### Fast-forward合并

当目标分支没有新的提交时，Git执行快进合并：

```bash
# 创建并开发功能分支
git checkout -b feature-header
echo "<header>网站头部</header>" > header.html
git add header.html
git commit -m "添加网站头部"

# 切回main并合并
git checkout main
git merge feature-header  # Fast-forward合并

# 查看历史
git log --oneline
# 注意：提交历史是线性的
```

### Three-way合并

当两个分支都有新提交时，Git执行三方合并：

```bash
# 在main分支添加内容
echo "主页内容" >> index.html
git add index.html
git commit -m "更新主页"

# 创建并切换到功能分支
git checkout -b feature-sidebar
echo "<aside>侧边栏</aside>" > sidebar.html
git add sidebar.html
git commit -m "添加侧边栏"

# 同时main分支也有更新（模拟其他人的提交）
git checkout main
echo "底部内容" > footer.html
git add footer.html
git commit -m "添加页脚"

# 合并feature-sidebar
git merge feature-sidebar -m "合并侧边栏功能"

# 查看合并后的历史
git lg
# 可以看到分支合并的图形
```

### 解决合并冲突

冲突是团队协作中常见的情况，让我们学习如何优雅地解决：

```bash
# 创建冲突场景
git checkout -b feature-style
echo "body { background: blue; }" > style.css
git add style.css
git commit -m "设置蓝色背景"

git checkout main
echo "body { background: red; }" > style.css
git add style.css
git commit -m "设置红色背景"

# 尝试合并（会产生冲突）
git merge feature-style

# Git会提示冲突
# 查看冲突状态
git status

# 查看冲突内容
cat style.css
```

冲突文件会显示为：
```css
<<<<<<< HEAD
body { background: red; }
=======
body { background: blue; }
>>>>>>> feature-style
```

解决冲突的步骤：

```bash
# 1. 手动编辑文件，决定保留哪些内容
# 例如，我们决定使用渐变色
echo "body { background: linear-gradient(red, blue); }" > style.css

# 2. 标记冲突已解决
git add style.css

# 3. 完成合并
git commit -m "解决样式冲突：使用渐变背景"

# 查看合并结果
git lg
```

### 合并策略选项

```bash
# 强制创建合并提交（即使可以fast-forward）
git merge feature-branch --no-ff

# 只允许fast-forward合并
git merge feature-branch --ff-only

# 合并时压缩提交
git merge feature-branch --squash
```

## 🔄 Git Rebase（15分钟）

### Rebase vs Merge

Rebase是另一种整合分支的方法，它会改变提交历史：

```bash
# 创建新的功能分支
git checkout -b feature-navigation
echo "<nav>导航栏</nav>" > nav.html
git add nav.html
git commit -m "添加导航栏"

echo "nav { display: flex; }" >> style.css
git add style.css
git commit -m "添加导航样式"

# main分支有新提交
git checkout main
echo "更新内容" >> README.md
git add README.md
git commit -m "更新文档"

# 使用rebase而不是merge
git checkout feature-navigation
git rebase main

# 查看历史
git lg
# 注意：历史是线性的，就像功能分支的提交发生在main的最新提交之后
```

### Interactive Rebase

交互式rebase允许你重写历史：

```bash
# 创建多个提交
git checkout -b feature-interactive
echo "Step 1" > feature.txt
git add feature.txt
git commit -m "WIP: 开始功能"

echo "Step 2" >> feature.txt
git add feature.txt
git commit -m "WIP: 继续开发"

echo "Step 3" >> feature.txt
git add feature.txt
git commit -m "完成功能"

# 交互式rebase最近3个提交
git rebase -i HEAD~3

# 在编辑器中，你可以：
# - pick: 保留提交
# - reword: 修改提交信息
# - squash: 合并到前一个提交
# - drop: 删除提交
# - edit: 修改提交内容
```

### Rebase的黄金法则

⚠️ **永远不要rebase公共分支的提交！**

```bash
# ❌ 错误示例（不要这样做）
git checkout main
git rebase feature-branch  # 危险！会改变main的历史

# ✅ 正确示例
git checkout feature-branch
git rebase main  # 安全，只改变功能分支的历史
```

## 🍒 Cherry-pick和其他高级操作（10分钟）

### Cherry-pick：挑选特定提交

有时你只想要某个分支的特定提交：

```bash
# 查看其他分支的提交
git log feature-test --oneline

# 挑选特定提交到当前分支
git cherry-pick <commit-sha>

# 挑选多个提交
git cherry-pick <commit1> <commit2>

# 挑选但不自动提交
git cherry-pick -n <commit-sha>
```

### Git Stash：临时保存工作

当你需要快速切换分支但不想提交当前工作时：

```bash
# 保存当前工作
git stash
# 或带描述信息
git stash push -m "正在开发的登录功能"

# 查看stash列表
git stash list

# 恢复最近的stash
git stash pop

# 应用特定的stash
git stash apply stash@{1}

# 删除stash
git stash drop stash@{0}

# 清空所有stash
git stash clear
```

### 撤销操作

```bash
# 撤销最后一次提交（保留更改）
git reset --soft HEAD~1

# 撤销最后一次提交（丢弃更改）
git reset --hard HEAD~1

# 撤销特定文件的修改
git checkout -- filename.txt

# 创建一个撤销提交
git revert <commit-sha>
```

## 👥 团队协作工作流（15分钟）

### Git Flow模型

Git Flow是一个成熟的分支管理模型：

```bash
# Git Flow分支结构
# - main: 生产环境代码
# - develop: 开发主分支
# - feature/*: 功能分支
# - release/*: 发布分支
# - hotfix/*: 热修复分支

# 模拟Git Flow
git checkout -b develop
echo "开发版本" > version.txt
git add version.txt
git commit -m "初始化develop分支"

# 创建功能分支
git checkout -b feature/user-auth
echo "用户认证功能" > auth.js
git add auth.js
git commit -m "实现用户认证"

# 合并回develop
git checkout develop
git merge --no-ff feature/user-auth -m "合并: 用户认证功能"

# 创建发布分支
git checkout -b release/1.0
echo "1.0" > version.txt
git add version.txt
git commit -m "准备1.0版本发布"

# 合并到main和develop
git checkout main
git merge --no-ff release/1.0 -m "发布1.0版本"
git tag -a v1.0 -m "版本1.0"

git checkout develop
git merge --no-ff release/1.0 -m "同步1.0版本到develop"
```

### GitHub Flow（简化版）

GitHub Flow更简单，适合持续部署：

```bash
# GitHub Flow只有两类分支
# - main: 始终可部署的代码
# - feature branches: 所有开发都在功能分支

# 1. 创建功能分支
git checkout -b feature/add-search

# 2. 开发并提交
echo "搜索功能" > search.js
git add search.js
git commit -m "添加搜索功能"

# 3. 推送到远程
git push origin feature/add-search

# 4. 创建Pull Request（在GitHub网站上）
# 5. 代码审查和讨论
# 6. 合并到main
# 7. 部署main分支
```

### Pull Request最佳实践

创建PR的模板：

```markdown
## 概述
简要描述这个PR的目的和所做的更改

## 更改类型
- [ ] Bug修复
- [ ] 新功能
- [ ] 重构
- [ ] 文档更新
- [ ] 性能优化

## 更改详情
- 具体说明做了哪些更改
- 为什么要做这些更改
- 可能的副作用

## 测试
- [ ] 单元测试通过
- [ ] 手动测试完成
- [ ] 无破坏性更改

## 截图（如果适用）
添加UI更改的截图

## 相关Issue
Fixes #123
```

### 代码审查要点

```bash
# 审查者应该关注：
# 1. 代码质量和可读性
# 2. 是否遵循项目规范
# 3. 潜在的bug或安全问题
# 4. 性能影响
# 5. 测试覆盖率

# 提供建设性反馈的例子：
# ❌ "这代码写得太糟了"
# ✅ "建议将这个函数拆分成更小的单元，这样更容易测试和维护"

# 使用GitHub建议功能
# ```suggestion
# function improvedCode() {
#   // 改进的实现
# }
# ```
```

## 🏗️ 模拟团队协作项目（10分钟）

让我们创建一个完整的团队协作场景：

```bash
# 1. 初始化团队项目
mkdir team-project
cd team-project
git init

# 2. 创建初始结构
cat > README.md << EOF
# 团队项目

## 项目结构
- index.html: 主页
- style.css: 样式
- app.js: 应用逻辑

## 开发规范
1. 所有功能在feature分支开发
2. 通过PR合并代码
3. 至少需要一个人审查
EOF

git add README.md
git commit -m "初始化项目"

# 3. 模拟多人开发
# 开发者A：添加首页
git checkout -b feature/homepage
cat > index.html << EOF
<!DOCTYPE html>
<html>
<head>
    <title>团队项目</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <h1>欢迎来到我们的项目</h1>
    <script src="app.js"></script>
</body>
</html>
EOF

git add index.html
git commit -m "创建首页HTML结构"

# 开发者B：添加样式（在另一个分支）
git checkout main
git checkout -b feature/styling
cat > style.css << EOF
body {
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 20px;
    background-color: #f5f5f5;
}

h1 {
    color: #333;
}
EOF

git add style.css
git commit -m "添加基础样式"

# 模拟PR和合并流程
git checkout main
git merge --no-ff feature/homepage -m "Merge PR #1: 创建首页"
git merge --no-ff feature/styling -m "Merge PR #2: 添加样式"

# 查看项目历史
git lg
```

## 🛠️ Git配置优化（5分钟）

### 全局Git配置

```bash
# 设置默认编辑器
git config --global core.editor "code --wait"  # VS Code

# 自动纠正拼写错误的命令
git config --global help.autocorrect 1

# 设置默认分支名
git config --global init.defaultBranch main

# 美化diff输出
git config --global diff.colorMoved zebra

# 设置pull策略
git config --global pull.rebase true  # pull时自动rebase

# 配置更好的日志格式
git config --global format.pretty "format:%C(yellow)%h %C(blue)%ad %C(reset)%s%C(red)%d %C(green)[%an]"
git config --global log.date short
```

### 创建有用的Git别名

```bash
# 查看最后一次提交
git config --global alias.last "log -1 HEAD"

# 撤销上次提交
git config --global alias.undo "reset HEAD~1 --mixed"

# 查看今天的提交
git config --global alias.today "log --since=00:00:00 --all --no-merges --oneline"

# 查看贡献者统计
git config --global alias.contributors "shortlog -sn"

# 查找包含特定内容的提交
git config --global alias.find "log --all --grep"
```

## 🧪 实践练习：完整的功能开发流程

创建一个待办事项应用，练习完整的Git工作流：

```bash
# 1. 初始化项目
mkdir todo-app
cd todo-app
git init

# 2. 创建基础文件
cat > index.html << 'EOF'
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>待办事项</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <h1>我的待办事项</h1>
        <div id="app"></div>
    </div>
    <script src="app.js"></script>
</body>
</html>
EOF

git add index.html
git commit -m "初始化：创建HTML结构"

# 3. 功能开发分支
git checkout -b feature/add-todo-form

cat > app.js << 'EOF'
// 待办事项应用
let todos = [];

function addTodo(text) {
    todos.push({
        id: Date.now(),
        text: text,
        completed: false
    });
    renderTodos();
}

function renderTodos() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <form id="todo-form">
            <input type="text" id="todo-input" placeholder="添加新任务...">
            <button type="submit">添加</button>
        </form>
        <ul id="todo-list">
            ${todos.map(todo => `
                <li class="${todo.completed ? 'completed' : ''}">
                    ${todo.text}
                </li>
            `).join('')}
        </ul>
    `;
}

document.addEventListener('DOMContentLoaded', () => {
    renderTodos();
    
    document.addEventListener('submit', (e) => {
        if (e.target.id === 'todo-form') {
            e.preventDefault();
            const input = document.getElementById('todo-input');
            if (input.value.trim()) {
                addTodo(input.value.trim());
                input.value = '';
            }
        }
    });
});
EOF

git add app.js
git commit -m "功能：添加待办事项表单和基础功能"

# 4. 添加样式（新分支）
git checkout main
git checkout -b feature/styling

cat > style.css << 'EOF'
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background-color: #f5f5f5;
    color: #333;
}

.container {
    max-width: 600px;
    margin: 50px auto;
    padding: 20px;
    background-color: white;
    border-radius: 10px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

h1 {
    text-align: center;
    color: #2c3e50;
    margin-bottom: 30px;
}

#todo-form {
    display: flex;
    margin-bottom: 20px;
}

#todo-input {
    flex: 1;
    padding: 10px;
    border: 2px solid #ddd;
    border-radius: 5px 0 0 5px;
    font-size: 16px;
}

button {
    padding: 10px 20px;
    background-color: #3498db;
    color: white;
    border: none;
    border-radius: 0 5px 5px 0;
    cursor: pointer;
    font-size: 16px;
}

button:hover {
    background-color: #2980b9;
}

#todo-list {
    list-style: none;
}

#todo-list li {
    padding: 15px;
    border-bottom: 1px solid #eee;
    transition: all 0.3s ease;
}

#todo-list li:hover {
    background-color: #f8f9fa;
}

.completed {
    text-decoration: line-through;
    opacity: 0.6;
}
EOF

git add style.css
git commit -m "样式：添加现代化UI设计"

# 5. 合并功能
git checkout main
git merge --no-ff feature/add-todo-form -m "合并：待办事项表单功能"
git merge --no-ff feature/styling -m "合并：UI样式"

# 6. 发现bug，创建修复分支
git checkout -b hotfix/empty-todo
# 修复：防止添加空待办事项的逻辑已经在代码中

# 7. 添加新功能：标记完成
git checkout -b feature/toggle-complete

# 更新app.js添加切换完成状态功能
cat >> app.js << 'EOF'

function toggleTodo(id) {
    todos = todos.map(todo => 
        todo.id === id ? {...todo, completed: !todo.completed} : todo
    );
    renderTodos();
}

// 更新renderTodos函数中的li元素
// <li class="${todo.completed ? 'completed' : ''}" onclick="toggleTodo(${todo.id})">
EOF

git add app.js
git commit -m "功能：点击待办事项标记完成状态"

# 8. 最终合并
git checkout main
git merge --no-ff feature/toggle-complete -m "合并：标记完成功能"

# 查看完整的开发历史
git lg
```

## 📚 学习资源

### 官方文档
- [Pro Git Book 中文版](https://git-scm.com/book/zh/v2) - Git权威指南
- [GitHub Flow 指南](https://guides.github.com/introduction/flow/) - GitHub的工作流
- [Atlassian Git 教程](https://www.atlassian.com/git/tutorials) - 详细的Git教程

### 交互式学习
- [Learn Git Branching](https://learngitbranching.js.org/?locale=zh_CN) - 可视化学习Git分支
- [GitHub Skills](https://skills.github.com/) - GitHub官方技能课程
- [Oh My Git!](https://ohmygit.org/) - Git游戏化学习

### 工具推荐
- [GitKraken](https://www.gitkraken.com/) - 强大的Git GUI客户端
- [Sourcetree](https://www.sourcetreeapp.com/) - 免费的Git可视化工具
- [Git Graph](https://marketplace.visualstudio.com/items?itemName=mhutchie.git-graph) - VS Code扩展

### 最佳实践文章
- [如何写好Git提交信息](https://chris.beams.io/posts/git-commit/)
- [Git分支命名规范](https://deepsource.io/blog/git-branch-naming-conventions/)
- [代码审查最佳实践](https://github.com/thoughtbot/guides/tree/main/code-review)

## ✅ 今日检查清单

确保你已经掌握了以下内容：

- [ ] 理解Git分支的本质和工作原理
- [ ] 能够熟练创建、切换、合并和删除分支
- [ ] 掌握解决合并冲突的方法
- [ ] 理解merge和rebase的区别
- [ ] 会使用interactive rebase整理提交历史
- [ ] 掌握cherry-pick和stash的使用场景
- [ ] 了解Git Flow和GitHub Flow工作流
- [ ] 能够创建规范的Pull Request
- [ ] 理解代码审查的重要性和方法
- [ ] 配置了实用的Git别名

## 🤔 自测问题

1. **Git分支的本质是什么？创建分支为什么这么快？**

2. **什么情况下Git会执行fast-forward合并？什么情况下会创建合并提交？**

3. **解释rebase和merge的区别。什么时候应该使用rebase？**

4. **如何撤销已经推送到远程仓库的提交？有哪些注意事项？**

5. **描述一个完整的功能开发流程：从创建分支到合并到主分支。**

6. **什么是Git Flow？它的五种分支类型分别用于什么场景？**

7. **如何使用git stash？列举三个使用场景。**

8. **在代码审查中，审查者应该关注哪些方面？**

## 🎯 拓展练习

1. **模拟冲突解决**
   - 创建一个多文件项目
   - 模拟3个开发者同时修改同一文件
   - 练习不同的冲突解决策略

2. **重写历史练习**
   - 创建10个混乱的提交
   - 使用interactive rebase整理成3个有意义的提交
   - 练习修改提交信息和合并提交

3. **工作流实践**
   - 选择Git Flow或GitHub Flow
   - 创建一个完整的项目开发周期
   - 包括功能开发、bug修复、版本发布

4. **自动化工作流**
   - 创建Git hooks自动检查提交信息格式
   - 设置pre-commit检查代码质量
   - 配置CI/CD自动运行测试

## 💡 今日总结

今天我们深入学习了Git的高级功能和团队协作最佳实践：

- **分支管理**：Git分支是轻量级的，要善用分支进行功能隔离
- **合并策略**：理解不同的合并方式，选择适合的策略
- **历史管理**：保持提交历史的清晰和有意义
- **团队协作**：规范的工作流程让团队协作更高效
- **代码审查**：好的代码审查文化提升整体代码质量

记住：**Git不仅是版本控制工具，更是团队协作的桥梁**。掌握Git的高级功能，将让你在团队开发中游刃有余。

明天我们将学习现代包管理工具npm和yarn的深入使用，继续构建你的现代开发工具链！

## 🚀 实战项目预告

在接下来的几天里，我们会逐步构建一个完整的项目，综合运用所学知识：
- Day 8: 使用npm/yarn管理项目依赖
- Day 9: 使用构建工具打包项目
- Day 10: 优化项目性能
- Day 11: 使用DevTools调试和分析
- Day 12: 完成个人作品集网站

保持学习热情，明天见！👨‍💻👩‍💻