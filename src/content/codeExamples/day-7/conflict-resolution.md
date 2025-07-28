---
title: "Git冲突解决实战"
description: "详细演示如何识别和解决各种类型的Git冲突"
---

# Git冲突解决示例

## 创建冲突场景

```bash
# 初始化测试仓库
mkdir conflict-demo
cd conflict-demo
git init

# 创建初始文件
cat > app.js << 'EOF'
function greet(name) {
    console.log("Hello, " + name);
}

greet("World");
EOF

git add app.js
git commit -m "初始版本"

# 创建两个分支，修改同一行
git checkout -b feature-es6
# 修改为ES6语法
cat > app.js << 'EOF'
const greet = (name) => {
    console.log(`Hello, ${name}!`);
};

greet("ES6 World");
EOF
git add app.js
git commit -m "使用ES6语法"

# 切换回main，做不同的修改
git checkout main
cat > app.js << 'EOF'
function greet(name) {
    console.log("Hello, " + name + "!");
    console.log("Welcome to our app");
}

greet("Main World");
EOF
git add app.js
git commit -m "添加欢迎信息"

# 尝试合并（会产生冲突）
git merge feature-es6
```

## 冲突文件的结构

```javascript
// 冲突后的app.js文件内容
<<<<<<< HEAD
function greet(name) {
    console.log("Hello, " + name + "!");
    console.log("Welcome to our app");
}

greet("Main World");
=======
const greet = (name) => {
    console.log(`Hello, ${name}!`);
};

greet("ES6 World");
>>>>>>> feature-es6
```

## 解决冲突的不同策略

### 策略1：手动编辑解决

```javascript
// 手动编辑，结合两边的更改
const greet = (name) => {
    console.log(`Hello, ${name}!`);
    console.log("Welcome to our app");
};

greet("World");
```

```bash
# 标记冲突已解决
git add app.js
git commit -m "merge: 结合ES6语法和欢迎信息"
```

### 策略2：选择一方的版本

```bash
# 完全采用当前分支的版本
git checkout --ours app.js
git add app.js

# 或完全采用要合并分支的版本
git checkout --theirs app.js
git add app.js

# 提交解决
git commit -m "merge: 解决冲突，采用[ours/theirs]版本"
```

### 策略3：使用合并工具

```bash
# 配置合并工具（以VS Code为例）
git config --global merge.tool vscode
git config --global mergetool.vscode.cmd 'code --wait $MERGED'

# 使用合并工具
git mergetool

# 清理备份文件
git clean -f *.orig
```

## 复杂冲突场景

### 多文件冲突

```bash
# 创建多个冲突文件的场景
git checkout -b feature-multi
echo "Feature: Style Update" > style.css
echo "export const API_URL = 'https://api.feature.com';" > config.js
git add .
git commit -m "添加样式和配置"

git checkout main
echo "Main: Style Update" > style.css
echo "export const API_URL = 'https://api.main.com';" > config.js
echo "# Production Build" > README.md
git add .
git commit -m "更新样式、配置和文档"

# 合并产生多个冲突
git merge feature-multi

# 查看冲突状态
git status
# 输出：
# Unmerged paths:
#   both modified:   style.css
#   both modified:   config.js

# 逐个解决
git add style.css  # 解决后添加
git add config.js  # 解决后添加
git commit -m "merge: 解决多文件冲突"
```

### 重命名冲突

```bash
# 一个分支重命名，另一个分支修改内容
git checkout -b feature-rename
git mv app.js application.js
git commit -m "重命名主文件"

git checkout main
echo "// Added comment" >> app.js
git commit -am "添加注释"

git merge feature-rename
# Git通常能智能处理，但有时需要手动确认
```

## 冲突预防最佳实践

```bash
# 1. 合并前先拉取最新代码
git fetch origin
git merge origin/main  # 或 rebase

# 2. 使用rebase保持线性历史（减少冲突）
git checkout feature-branch
git rebase main

# 3. 频繁同步主分支
# 在功能分支上定期执行
git fetch origin
git rebase origin/main

# 4. 小步提交，避免大规模冲突
# 每完成一个小功能就提交
git add -p  # 分块添加
git commit -m "feat: 完成用户验证部分"
```

## 冲突解决工作流

```bash
#!/bin/bash
# 标准的冲突解决流程脚本

echo "=== Git冲突解决助手 ==="

# 1. 检查冲突状态
echo "1. 检查冲突文件..."
git status --short | grep "^UU"

# 2. 显示冲突数量
CONFLICTS=$(git diff --name-only --diff-filter=U | wc -l)
echo "发现 $CONFLICTS 个冲突文件"

# 3. 逐个处理冲突
git diff --name-only --diff-filter=U | while read file; do
    echo "处理冲突文件: $file"
    echo "选择操作："
    echo "1) 编辑文件"
    echo "2) 使用我们的版本(--ours)"
    echo "3) 使用他们的版本(--theirs)"
    echo "4) 使用合并工具"
    read -p "请选择 (1-4): " choice
    
    case $choice in
        1) $EDITOR "$file";;
        2) git checkout --ours "$file";;
        3) git checkout --theirs "$file";;
        4) git mergetool "$file";;
    esac
    
    git add "$file"
done

# 4. 完成合并
echo "所有冲突已解决，准备提交..."
git commit --no-edit  # 使用默认合并信息
```

## 查看冲突历史

```bash
# 查看合并历史
git log --merges --oneline

# 查看特定合并的冲突解决
git show --cc <merge-commit-hash>

# 查找产生冲突的原始提交
git log --merge --oneline

# 显示冲突的详细信息
git diff --cc

# 三方对比（base, ours, theirs）
git diff --base   # 与共同祖先比较
git diff --ours   # 与当前分支比较
git diff --theirs # 与要合并的分支比较
```

## 高级冲突处理

```bash
# 1. 交互式解决特定文件的冲突块
git checkout --conflict=diff3 file.txt  # 显示三方对比

# 2. 撤销失败的合并
git merge --abort  # 回到合并前的状态
git reset --hard HEAD~1  # 如果已经提交了

# 3. 重新应用合并
git merge --rerere-autoupdate feature-branch
# rerere = reuse recorded resolution

# 4. 查看冲突的图形化历史
gitk --merge  # 图形界面
git log --graph --oneline --merge  # 命令行
```