---
day: 7
title: "Git分支操作完整示例"
description: "展示Git分支的创建、切换、合并等基础操作"
category: "version-control"
language: "bash"
---

# Git分支操作示例

## 基础分支操作

```bash
# 1. 查看分支
git branch              # 查看本地分支
git branch -r          # 查看远程分支
git branch -a          # 查看所有分支
git branch -v          # 查看分支的最后提交
git branch -vv         # 查看分支的跟踪关系

# 2. 创建分支
git branch feature-login        # 创建分支但不切换
git checkout -b feature-navbar   # 创建并切换分支（传统方式）
git switch -c feature-footer    # 创建并切换分支（新方式）

# 3. 切换分支
git checkout main              # 切换到main分支（传统）
git switch develop            # 切换到develop分支（推荐）
git checkout -              # 切换到上一个分支

# 4. 重命名分支
git branch -m old-name new-name  # 重命名分支
git branch -m new-name          # 重命名当前分支

# 5. 删除分支
git branch -d feature-done      # 删除已合并的分支
git branch -D feature-abandon   # 强制删除分支
git push origin --delete branch-name  # 删除远程分支
```

## 分支合并示例

```bash
# Fast-forward合并
git checkout main
git merge feature-simple    # 如果main没有新提交，会fast-forward

# 创建合并提交
git merge --no-ff feature-complex -m "Merge: 添加复杂功能"

# 压缩合并
git merge --squash feature-many-commits
git commit -m "feat: 添加新功能（压缩多个提交）"

# 终止合并
git merge --abort  # 发生冲突时放弃合并
```

## 查看分支历史

```bash
# 图形化显示分支历史
git log --graph --oneline --all

# 美化的分支历史
git log --graph --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit

# 查看分支之间的差异
git log main..feature-branch    # feature-branch有但main没有的提交
git log feature-branch..main    # main有但feature-branch没有的提交
git log main...feature-branch   # 两个分支的差异提交

# 查看两个分支的差异
git diff main..feature-branch   # 代码差异
git diff main...feature-branch  # 从分叉点开始的差异
```

## 分支管理最佳实践

```bash
# 1. 从最新的主分支创建功能分支
git checkout main
git pull origin main
git checkout -b feature/new-feature

# 2. 定期同步主分支的更改
git checkout feature/new-feature
git fetch origin
git rebase origin/main  # 或 git merge origin/main

# 3. 推送分支到远程
git push -u origin feature/new-feature  # 第一次推送
git push  # 后续推送

# 4. 清理已合并的分支
git branch --merged main | grep -v main | xargs -n 1 git branch -d
git remote prune origin  # 清理远程已删除的分支引用
```

## 高级分支操作

```bash
# 1. 基于特定提交创建分支
git branch hotfix-urgent abc123  # 从提交abc123创建分支
git checkout -b fix-bug HEAD~3   # 从3个提交前创建分支

# 2. 追踪远程分支
git checkout -b local-feature origin/feature
git branch -u origin/feature local-feature  # 设置追踪关系

# 3. 查看分支包含的提交
git branch --contains abc123    # 哪些分支包含特定提交
git branch --no-contains abc123 # 哪些分支不包含特定提交

# 4. 分支比较
git show-branch main feature-1 feature-2  # 比较多个分支
```

## 实用别名配置

```bash
# 配置实用的Git别名
git config --global alias.br branch
git config --global alias.co checkout
git config --global alias.sw switch
git config --global alias.brd "branch -d"
git config --global alias.brD "branch -D"

# 查看所有分支的最后提交
git config --global alias.branches "branch -av --format='%(HEAD) %(color:yellow)%(refname:short)%(color:reset) - %(contents:subject) - %(authorname) (%(color:green)%(committerdate:relative)%(color:reset))'"

# 交互式分支清理
git config --global alias.branch-cleanup "!git branch --merged | grep -v '\\*\\|main\\|develop' | xargs -n 1 git branch -d"
```