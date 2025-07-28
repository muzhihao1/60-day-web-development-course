---
title: "Git工作流实例"
description: "演示Git Flow和GitHub Flow的实际应用"
---

## Git工作流实例

### Git Flow工作流

```bash
# 1. 初始化Git Flow结构
git checkout -b develop
git push -u origin develop

# 2. 创建功能分支
git checkout develop
git checkout -b feature/user-auth
# 开发功能...
git add .
git commit -m "feat: 实现用户认证功能"

# 3. 完成功能开发
git checkout develop
git merge --no-ff feature/user-auth -m "Merge: 用户认证功能"
git branch -d feature/user-auth

# 4. 创建发布分支
git checkout -b release/1.0.0
echo "1.0.0" > VERSION
git add VERSION
git commit -m "chore: 准备1.0.0版本"

# 5. 完成发布
git checkout main
git merge --no-ff release/1.0.0 -m "Release: 1.0.0版本"
git tag -a v1.0.0 -m "版本1.0.0"

git checkout develop
git merge --no-ff release/1.0.0
git branch -d release/1.0.0

# 6. 紧急修复
git checkout -b hotfix/security-fix main
# 修复bug...
git add .
git commit -m "fix: 修复安全漏洞"

git checkout main
git merge --no-ff hotfix/security-fix
git tag -a v1.0.1 -m "版本1.0.1：安全修复"

git checkout develop
git merge --no-ff hotfix/security-fix
git branch -d hotfix/security-fix
```

### GitHub Flow（简化版）

```bash
# 1. 创建功能分支
git checkout -b feature/add-search

# 2. 开发并提交
git add .
git commit -m "feat: 添加搜索功能"

# 3. 推送到远程
git push -u origin feature/add-search

# 4. 创建Pull Request（在GitHub上）
# 5. 代码审查
# 6. 合并到main
# 7. 部署
```

### Cherry-pick使用

```bash
# 从其他分支选择特定提交
git log feature-xyz --oneline
# 找到需要的提交：abc1234

git checkout main
git cherry-pick abc1234

# 选择多个提交
git cherry-pick abc1234 def5678

# 不自动提交
git cherry-pick -n abc1234
```

### Git Stash使用

```bash
# 保存当前工作
git stash
# 或带描述
git stash save "正在开发的登录功能"

# 查看stash列表
git stash list

# 恢复最近的stash
git stash pop

# 应用特定stash但不删除
git stash apply stash@{1}

# 查看stash内容
git stash show -p stash@{0}

# 创建分支从stash
git stash branch feature-from-stash
```

### 实用Git别名配置

```bash
# 配置别名提高效率
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.st status

# 美化日志输出
git config --global alias.lg "log --graph --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit"

# 查看今日提交
git config --global alias.today "log --since=00:00:00 --all --no-merges --oneline"

# 撤销上次提交
git config --global alias.undo "reset HEAD~1 --mixed"
```