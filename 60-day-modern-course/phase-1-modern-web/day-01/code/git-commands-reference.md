# Git 命令参考手册

## 基础命令

### 初始化和配置

```bash
# 初始化新的Git仓库
git init

# 克隆远程仓库
git clone <repository-url>

# 设置用户信息
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# 查看配置信息
git config --list
```

### 基本操作

```bash
# 查看仓库状态
git status

# 查看简洁状态
git status -s

# 添加文件到暂存区
git add <file>
git add .                    # 添加所有文件
git add *.js                # 添加所有.js文件
git add src/                # 添加整个目录

# 提交更改
git commit -m "提交信息"

# 修改最后一次提交
git commit --amend -m "新的提交信息"
```

### 查看历史

```bash
# 查看提交历史
git log

# 查看简洁的提交历史
git log --oneline

# 查看最近n次提交
git log -n 3

# 图形化显示分支历史
git log --oneline --graph --all

# 查看文件的修改历史
git log <file>
```

### 比较差异

```bash
# 查看工作区的修改
git diff

# 查看暂存区的修改
git diff --staged

# 比较两个提交之间的差异
git diff <commit1> <commit2>
```

## 分支操作

```bash
# 查看所有分支
git branch

# 创建新分支
git branch <branch-name>

# 切换分支
git checkout <branch-name>

# 创建并切换到新分支
git checkout -b <branch-name>

# 合并分支
git merge <branch-name>

# 删除分支
git branch -d <branch-name>

# 强制删除分支
git branch -D <branch-name>
```

## 远程操作

```bash
# 查看远程仓库
git remote -v

# 添加远程仓库
git remote add origin <repository-url>

# 推送到远程仓库
git push origin <branch-name>

# 设置上游分支并推送
git push -u origin <branch-name>

# 从远程仓库拉取
git pull origin <branch-name>

# 获取远程仓库更新（不合并）
git fetch origin
```

## 撤销操作

```bash
# 撤销工作区的修改
git checkout -- <file>

# 取消暂存
git reset HEAD <file>

# 回退到上一个提交
git reset --hard HEAD^

# 回退到指定提交
git reset --hard <commit-id>

# 撤销某个提交（创建新提交）
git revert <commit-id>
```

## 实用技巧

### 临时保存工作

```bash
# 保存当前工作进度
git stash

# 查看保存的进度
git stash list

# 恢复最近的进度
git stash pop

# 恢复指定的进度
git stash apply stash@{n}

# 删除进度
git stash drop stash@{n}
```

### 标签管理

```bash
# 创建标签
git tag v1.0.0

# 创建带注释的标签
git tag -a v1.0.0 -m "版本1.0.0发布"

# 查看所有标签
git tag

# 推送标签到远程
git push origin v1.0.0

# 推送所有标签
git push origin --tags
```

### 别名设置

```bash
# 设置常用别名
git config --global alias.st status
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.unstage 'reset HEAD --'
git config --global alias.last 'log -1 HEAD'
```

## 常见场景解决方案

### 场景1：提交了错误文件

```bash
# 如果还没推送到远程
git reset HEAD~1
# 修改后重新提交
git add .
git commit -m "正确的提交"
```

### 场景2：修改提交信息

```bash
# 修改最后一次提交信息
git commit --amend -m "新的提交信息"

# 如果已经推送，需要强制推送
git push --force origin <branch-name>
```

### 场景3：合并冲突

```bash
# 1. 尝试合并
git merge <branch-name>

# 2. 如果有冲突，编辑冲突文件
# 3. 标记冲突已解决
git add <conflicted-file>

# 4. 完成合并
git commit -m "解决合并冲突"
```

### 场景4：删除已提交的文件

```bash
# 从仓库中删除，但保留工作区文件
git rm --cached <file>

# 从仓库和工作区都删除
git rm <file>

# 提交删除
git commit -m "删除文件"
```

## Git工作流程最佳实践

### 1. 功能分支工作流

```bash
# 1. 从主分支创建功能分支
git checkout -b feature/new-feature

# 2. 在功能分支上工作
git add .
git commit -m "实现新功能"

# 3. 推送功能分支
git push origin feature/new-feature

# 4. 创建Pull Request进行代码审查

# 5. 合并后删除功能分支
git branch -d feature/new-feature
```

### 2. 提交信息规范

```
<类型>: <简短描述>

<详细描述>

<关联问题>

类型包括：
- feat: 新功能
- fix: 修复bug
- docs: 文档更新
- style: 代码格式调整
- refactor: 代码重构
- test: 测试相关
- chore: 构建过程或辅助工具的变动
```

示例：
```
feat: 添加用户登录功能

实现了基本的用户登录功能，包括：
- 登录表单验证
- JWT token生成
- 记住我功能

Closes #123
```

## 故障排除

### 问题1：Permission denied (publickey)

```bash
# 生成SSH密钥
ssh-keygen -t ed25519 -C "your.email@example.com"

# 添加到ssh-agent
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519

# 复制公钥到GitHub
cat ~/.ssh/id_ed25519.pub
```

### 问题2：拒绝合并不相关的历史

```bash
# 允许合并不相关的历史
git pull origin main --allow-unrelated-histories
```

### 问题3：大文件无法推送

```bash
# 安装Git LFS
git lfs install

# 跟踪大文件
git lfs track "*.psd"

# 添加.gitattributes
git add .gitattributes

# 正常提交和推送
git add .
git commit -m "添加大文件"
git push
```

记住：Git是一个强大的工具，掌握这些基本命令就能应对大部分日常开发场景！

