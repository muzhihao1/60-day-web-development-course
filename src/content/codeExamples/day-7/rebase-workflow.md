---
day: 7
title: "Git Rebase工作流详解"
description: "深入理解rebase的使用场景和最佳实践"
category: "version-control"
language: "bash"
---

# Git Rebase工作流

## Rebase基础概念

```bash
# Rebase的基本原理：
# 1. 找到两个分支的共同祖先
# 2. 提取当前分支的所有提交
# 3. 将这些提交依次应用到目标分支的最新提交上

# 基础rebase操作
git checkout feature-branch
git rebase main

# 等价于以下操作：
# 1. git checkout main
# 2. 将feature-branch的提交临时保存
# 3. 将feature-branch重置到main的最新提交
# 4. 依次应用保存的提交
```

## Rebase vs Merge对比

```bash
# 创建测试场景
mkdir rebase-demo && cd rebase-demo
git init

# 初始提交
echo "Initial" > file.txt
git add file.txt
git commit -m "Initial commit"

# 创建功能分支
git checkout -b feature
echo "Feature 1" >> file.txt
git commit -am "Add feature 1"
echo "Feature 2" >> file.txt
git commit -am "Add feature 2"

# 主分支有新提交
git checkout main
echo "Main update" > main.txt
git add main.txt
git commit -m "Update from main"

# 方式1：Merge（保留分支历史）
git checkout feature
git merge main
# 结果：创建合并提交，保留分叉历史

# 方式2：Rebase（线性历史）
git checkout feature
git rebase main
# 结果：feature的提交被重新应用在main之后，历史是线性的
```

## Interactive Rebase（交互式变基）

```bash
# 交互式rebase：重写历史
git rebase -i HEAD~3  # 编辑最近3个提交

# 编辑器中显示：
# pick abc123 第一个提交
# pick def456 第二个提交
# pick ghi789 第三个提交

# 可用的命令：
# p, pick = 使用提交
# r, reword = 使用提交，但修改提交信息
# e, edit = 使用提交，但停下来修改
# s, squash = 使用提交，但融合到前一个提交
# f, fixup = 类似squash，但丢弃提交信息
# x, exec = 执行shell命令
# d, drop = 删除提交
```

### 实战：整理提交历史

```bash
# 场景：有多个混乱的提交需要整理
git log --oneline -5
# abc123 修复拼写错误
# def456 WIP: 添加功能
# ghi789 继续开发功能
# jkl012 功能完成
# mno345 修复功能bug

# 使用interactive rebase整理
git rebase -i HEAD~5

# 在编辑器中重新组织：
# pick def456 WIP: 添加功能
# squash ghi789 继续开发功能
# squash jkl012 功能完成
# fixup mno345 修复功能bug
# drop abc123 修复拼写错误

# 保存后，Git会提示编辑合并后的提交信息
# 最终得到一个干净的提交："feat: 添加新功能"
```

## 高级Rebase技巧

### 1. 挑选部分提交

```bash
# 只rebase特定范围的提交
git rebase --onto main feature~3 feature
# 将feature分支最近3个提交rebase到main上

# 图解：
# Before: A---B---C---D---E (feature)
#              \
#               F---G (main)
#
# After:  A---B (feature)
#              \
#               F---G---C'---D'---E' (feature)
```

### 2. 解决Rebase冲突

```bash
# Rebase过程中遇到冲突
git rebase main
# CONFLICT (content): Merge conflict in file.txt

# 解决冲突的步骤：
# 1. 编辑冲突文件
vim file.txt

# 2. 标记冲突已解决
git add file.txt

# 3. 继续rebase
git rebase --continue

# 如果想放弃某个提交
git rebase --skip

# 如果想完全放弃rebase
git rebase --abort
```

### 3. 自动化的Rebase

```bash
# 配置自动rebase
git config --global pull.rebase true

# 拉取时自动rebase而不是merge
git pull  # 等同于 git pull --rebase

# 为特定分支配置
git config branch.feature.rebase true
```

## Rebase最佳实践

### 1. 安全的Rebase工作流

```bash
#!/bin/bash
# safe-rebase.sh - 安全的rebase脚本

BRANCH=$(git rev-parse --abbrev-ref HEAD)
TARGET=${1:-main}

echo "准备将 $BRANCH rebase 到 $TARGET"

# 1. 确保工作目录干净
if [[ -n $(git status -s) ]]; then
    echo "错误：工作目录有未提交的更改"
    exit 1
fi

# 2. 备份当前分支
git branch backup-$BRANCH

# 3. 获取最新的目标分支
git fetch origin $TARGET

# 4. 执行rebase
if git rebase origin/$TARGET; then
    echo "Rebase成功完成！"
    echo "如需撤销：git reset --hard backup-$BRANCH"
else
    echo "Rebase失败，可以："
    echo "1. 解决冲突后运行: git rebase --continue"
    echo "2. 放弃并恢复: git rebase --abort"
fi
```

### 2. 清理本地提交

```bash
# 在推送前清理本地提交
# 假设有以下提交历史：
# * 7d3f2a1 (HEAD -> feature) 修复测试
# * 9b4c5e2 添加测试
# * 3a1b2c3 修复bug
# * 8f5e6d7 WIP
# * 2c3d4e5 实现功能
# * 1a2b3c4 (main) 基础版本

# 清理成一个有意义的提交
git rebase -i main

# 编辑器中：
# pick 2c3d4e5 实现功能
# squash 8f5e6d7 WIP
# squash 3a1b2c3 修复bug
# squash 9b4c5e2 添加测试
# squash 7d3f2a1 修复测试

# 结果：一个干净的提交包含完整功能
```

### 3. 分支同步策略

```bash
# 保持功能分支与主分支同步
# 方法1：定期rebase（推荐用于私有分支）
git checkout feature-branch
git fetch origin
git rebase origin/main

# 方法2：merge主分支（推荐用于共享分支）
git checkout feature-branch
git fetch origin
git merge origin/main

# 方法3：创建新的基于最新main的分支
git checkout main
git pull
git checkout -b feature-branch-v2
git cherry-pick <commit-range>
```

## Rebase的注意事项

```bash
# 黄金法则：不要rebase公共分支！

# ❌ 错误示例
git checkout main
git rebase feature-branch  # 永远不要这样做！

# ✅ 正确示例
git checkout feature-branch
git rebase main  # 只rebase你自己的分支

# 如果不小心rebase了已推送的分支
# 需要强制推送（谨慎使用）
git push --force-with-lease origin feature-branch
# --force-with-lease 比 --force 更安全
```

## 实用的Rebase别名

```bash
# 配置实用别名
# 交互式rebase最近的提交
git config --global alias.rb "rebase -i HEAD~3"

# 继续rebase
git config --global alias.rbc "rebase --continue"

# 中止rebase
git config --global alias.rba "rebase --abort"

# 自动squash fixup提交
git config --global alias.fixup "commit --fixup"
git config --global alias.squash "rebase -i --autosquash"

# 同步主分支的别名
git config --global alias.sync '!git fetch origin && git rebase origin/main'
```

## Rebase工作流总结

```bash
# 完整的功能开发流程with rebase
# 1. 创建功能分支
git checkout -b feature/amazing-feature

# 2. 开发过程中保持同步
git fetch origin
git rebase origin/main

# 3. 开发完成后清理历史
git rebase -i origin/main

# 4. 推送到远程
git push origin feature/amazing-feature

# 5. 创建Pull Request

# 6. 如果需要更新
git fetch origin
git rebase origin/main
git push --force-with-lease origin feature/amazing-feature
```