---
title: "Git分支基础操作"
description: "演示Git分支的创建、切换、合并等基础操作"
---

## Git分支基础操作

### 创建和切换分支

```bash
# 查看所有分支
git branch -a

# 创建新分支
git branch feature-login

# 切换到新分支
git checkout feature-login

# 创建并切换分支（一步完成）
git checkout -b feature-navbar

# 使用新命令（Git 2.23+）
git switch -c feature-footer
```

### 分支信息查看

```bash
# 查看本地分支
git branch

# 查看远程分支
git branch -r

# 查看所有分支（包括远程）
git branch -a

# 查看分支详细信息
git branch -v

# 查看分支跟踪关系
git branch -vv
```

### 分支合并

```bash
# Fast-forward合并
git checkout main
git merge feature-login

# 创建合并提交（保留分支历史）
git merge --no-ff feature-navbar -m "Merge: 导航栏功能"

# 只允许fast-forward合并
git merge --ff-only feature-footer
```

### 分支删除

```bash
# 删除已合并的分支
git branch -d feature-login

# 强制删除分支（未合并也删除）
git branch -D feature-experimental

# 删除远程分支
git push origin --delete feature-old
```