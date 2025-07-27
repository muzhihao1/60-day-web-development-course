---
title: "Git命令示例"
day: 1
language: "bash"
description: "Git基本命令的使用示例"
concepts:
  - "版本控制"
  - "Git基础"
  - "命令行操作"
relatedTopics:
  - "GitHub"
  - "版本管理"
---

# Git基本命令示例

```bash
# 初始化Git仓库
git init

# 查看仓库状态
git status

# 添加文件到暂存区
git add filename.txt
git add .  # 添加所有文件

# 提交更改
git commit -m "Your commit message"

# 查看提交历史
git log
git log --oneline

# 创建分支
git branch feature-branch

# 切换分支
git checkout feature-branch

# 创建并切换到新分支
git checkout -b new-feature
```

更多示例即将添加...