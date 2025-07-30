---
day: 7
title: "Git Rebase和交互式历史编辑"
description: "演示rebase的使用和交互式历史编辑功能"
category: "version-control"
language: "bash"
---

## Git Rebase操作

### 基础Rebase

```bash
# 创建功能分支并添加提交
git checkout -b feature-nav
echo "导航功能1" > nav.txt
git add nav.txt && git commit -m "添加导航功能"

echo "导航功能2" >> nav.txt
git add nav.txt && git commit -m "改进导航"

# main分支有新提交
git checkout main
echo "主线更新" > main.txt
git add main.txt && git commit -m "更新主线"

# 使用rebase整合历史
git checkout feature-nav
git rebase main

# 查看线性历史
git log --oneline --graph
```

### 交互式Rebase

```bash
# 交互式编辑最近3个提交
git rebase -i HEAD~3

# 编辑器中显示的内容：
# pick abc1234 第一个提交
# pick def5678 第二个提交
# pick ghi9012 第三个提交

# 可用的命令：
# p, pick = 使用提交
# r, reword = 使用提交，但修改提交信息
# e, edit = 使用提交，但停下来修改
# s, squash = 使用提交，但合并到前一个提交
# f, fixup = 类似squash，但丢弃提交信息
# d, drop = 删除提交
```

### 常用交互式Rebase场景

```bash
# 1. 合并多个提交
git rebase -i HEAD~3
# 将后两个提交改为squash
# pick abc1234 功能：开始实现
# squash def5678 功能：继续开发
# squash ghi9012 功能：完成

# 2. 修改历史提交信息
git rebase -i HEAD~2
# 将需要修改的提交改为reword
# reword abc1234 旧的提交信息
# pick def5678 保持不变

# 3. 删除某个提交
git rebase -i HEAD~4
# 将要删除的提交改为drop或直接删除该行
# pick abc1234 保留
# drop def5678 删除这个提交
# pick ghi9012 保留
```

### Rebase的黄金法则

```bash
# ❌ 错误：不要rebase公共分支
git checkout main
git rebase feature-branch  # 危险！

# ✅ 正确：只rebase自己的功能分支
git checkout feature-branch
git rebase main  # 安全

# 推送rebase后的分支（需要强制推送）
git push --force-with-lease origin feature-branch
```

### 解决Rebase冲突

```bash
# Rebase过程中遇到冲突
git rebase main
# 冲突！

# 1. 解决冲突
# 编辑冲突文件
git add <冲突文件>

# 2. 继续rebase
git rebase --continue

# 或者跳过当前提交
git rebase --skip

# 或者中止rebase
git rebase --abort
```