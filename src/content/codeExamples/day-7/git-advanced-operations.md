---
day: 7
title: "Git高级操作"
description: "演示Git的高级命令和撤销操作"
category: "version-control"
language: "bash"
---

## Git高级操作

### 撤销操作对比

```bash
# 1. git reset - 移动HEAD和分支指针
# --soft: 只移动HEAD，保留暂存区和工作区
git reset --soft HEAD~1

# --mixed: 移动HEAD，重置暂存区，保留工作区（默认）
git reset --mixed HEAD~1
git reset HEAD~1  # 同上

# --hard: 移动HEAD，重置暂存区和工作区
git reset --hard HEAD~1  # 危险！会丢失更改

# 2. git revert - 创建新提交来撤销
git revert abc1234  # 创建新提交撤销abc1234的更改
git revert HEAD     # 撤销最新提交
git revert -n HEAD  # 撤销但不自动提交

# 3. git checkout - 切换或恢复文件
git checkout -- file.txt  # 丢弃工作区更改
git checkout HEAD~2 file.txt  # 恢复文件到2个提交前的状态
```

### Git Reflog - 找回丢失的提交

```bash
# 查看所有HEAD移动历史
git reflog

# 输出示例：
# abc1234 HEAD@{0}: reset: moving to HEAD~1
# def5678 HEAD@{1}: commit: 重要功能
# ghi9012 HEAD@{2}: commit: 初始提交

# 恢复到之前的状态
git reset --hard HEAD@{1}  # 恢复到"重要功能"提交

# 找回删除的分支
git reflog | grep feature-lost
git checkout -b feature-lost abc1234  # 使用reflog中的SHA恢复
```

### 清理和维护

```bash
# 清理未跟踪文件
git clean -n    # 预览将删除的文件
git clean -f    # 删除未跟踪文件
git clean -fd   # 删除未跟踪文件和目录
git clean -fdx  # 包括.gitignore中的文件

# 压缩仓库
git gc  # 垃圾回收，压缩对象
git gc --aggressive  # 更彻底的压缩

# 验证仓库完整性
git fsck
```

### 高级日志查询

```bash
# 搜索提交信息
git log --grep="fix"

# 搜索代码更改
git log -S "function_name"  # 查找添加或删除function_name的提交

# 查看文件历史
git log --follow file.txt  # 包括重命名前的历史

# 查看特定作者的提交
git log --author="开发者A"

# 查看日期范围
git log --since="2024-01-01" --until="2024-01-31"

# 查看某个文件的每行最后修改
git blame file.txt
```

### 子模块管理

```bash
# 添加子模块
git submodule add https://github.com/example/lib.git libs/lib

# 克隆包含子模块的仓库
git clone --recursive <repository-url>

# 更新子模块
git submodule update --init --recursive

# 移除子模块
git submodule deinit libs/lib
git rm libs/lib
rm -rf .git/modules/libs/lib
```

### 工作树（Worktree）

```bash
# 创建新的工作树
git worktree add ../project-hotfix hotfix/urgent

# 列出所有工作树
git worktree list

# 移除工作树
git worktree remove ../project-hotfix

# 清理已删除的工作树信息
git worktree prune
```