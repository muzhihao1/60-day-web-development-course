---
title: "第一次Git提交流程"
description: "完整的Git初始化、配置和第一次提交的示例流程"
category: "version-control"
language: "bash"
day: 1
concepts:
  - "Git初始化"
  - "版本控制"
  - "提交流程"
relatedTopics:
  - "GitHub"
  - "远程仓库"
---

# 第一次Git提交完整流程

## 1. Git全局配置

```bash
# 设置用户名（使用你的真实姓名）
git config --global user.name "张三"

# 设置邮箱（使用你的常用邮箱）
git config --global user.email "zhangsan@example.com"

# 设置默认分支名为main
git config --global init.defaultBranch main

# 设置默认编辑器（可选）
git config --global core.editor "code --wait"  # VS Code
# git config --global core.editor "vim"        # Vim
# git config --global core.editor "nano"       # Nano

# 查看所有配置
git config --list

# 查看特定配置
git config user.name
git config user.email
```

## 2. 创建新项目并初始化Git

```bash
# 创建项目文件夹
mkdir my-first-project
cd my-first-project

# 初始化Git仓库
git init

# 查看初始化结果
ls -la
# 输出应该包含 .git 文件夹
```

## 3. 创建项目文件

```bash
# 创建README文件
echo "# 我的第一个项目" > README.md
echo "" >> README.md
echo "这是我学习Git的第一个项目！" >> README.md
echo "" >> README.md
echo "## 项目说明" >> README.md
echo "- 学习Git基础命令" >> README.md
echo "- 理解版本控制概念" >> README.md
echo "- 掌握协作开发流程" >> README.md

# 创建.gitignore文件
cat > .gitignore << EOF
# 操作系统文件
.DS_Store
Thumbs.db

# 编辑器文件
.vscode/
.idea/
*.swp
*.swo

# 日志文件
*.log

# 依赖目录
node_modules/
vendor/

# 编译输出
dist/
build/
*.out

# 环境变量
.env
.env.local
EOF

# 创建项目主文件
cat > index.html << EOF
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>我的第一个项目</title>
</head>
<body>
    <h1>Hello, Git!</h1>
    <p>这是我的第一个使用Git管理的项目。</p>
</body>
</html>
EOF
```

## 4. 查看仓库状态

```bash
# 查看当前状态
git status

# 输出示例：
# On branch main
# 
# No commits yet
# 
# Untracked files:
#   (use "git add <file>..." to include in what will be committed)
#     .gitignore
#     README.md
#     index.html

# 查看更简洁的状态
git status -s
# ?? .gitignore
# ?? README.md
# ?? index.html
```

## 5. 添加文件到暂存区

```bash
# 添加单个文件
git add README.md

# 添加多个文件
git add .gitignore index.html

# 或者添加所有文件
git add .

# 添加所有.md文件
git add *.md

# 交互式添加
git add -i
```

## 6. 查看暂存区状态

```bash
# 再次查看状态
git status

# 查看暂存区和工作区的差异
git diff

# 查看已暂存的内容
git diff --staged
# 或
git diff --cached
```

## 7. 进行第一次提交

```bash
# 提交并输入消息
git commit -m "初始提交：添加README、.gitignore和首页"

# 或者使用编辑器写详细的提交信息
git commit

# 提交信息格式建议：
# <类型>: <简短描述>
# 
# <详细说明>
# 
# 例如：
# feat: 添加项目初始文件
# 
# - 创建README.md说明文档
# - 添加.gitignore忽略规则
# - 创建index.html首页
```

## 8. 查看提交历史

```bash
# 查看提交日志
git log

# 单行显示
git log --oneline

# 图形化显示
git log --graph --oneline --all

# 显示最近n次提交
git log -3

# 显示每次提交的改动统计
git log --stat

# 显示每次提交的详细改动
git log -p
```

## 9. 连接远程仓库（GitHub）

```bash
# 添加远程仓库
git remote add origin https://github.com/username/my-first-project.git

# 或使用SSH（推荐）
git remote add origin git@github.com:username/my-first-project.git

# 查看远程仓库
git remote -v

# 推送到远程仓库
git push -u origin main
# -u 参数会设置上游分支，之后可以直接使用 git push
```

## 10. 后续提交流程

```bash
# 修改文件后的标准流程

# 1. 查看改动
git status
git diff

# 2. 添加改动
git add .
# 或选择性添加
git add file1.html file2.css

# 3. 提交改动
git commit -m "feat: 添加样式文件"

# 4. 推送到远程
git push

# 5. 拉取远程更新（协作时）
git pull
```

## 常用Git命令速查

```bash
# 基础命令
git init                    # 初始化仓库
git clone <url>            # 克隆远程仓库
git status                 # 查看状态
git add <file>            # 添加到暂存区
git commit -m "msg"       # 提交
git push                  # 推送
git pull                  # 拉取

# 分支操作
git branch                # 查看分支
git branch <name>        # 创建分支
git checkout <name>      # 切换分支
git checkout -b <name>   # 创建并切换
git merge <branch>       # 合并分支
git branch -d <name>     # 删除分支

# 查看信息
git log                  # 查看历史
git diff                 # 查看改动
git show <commit>        # 查看某次提交
git remote -v            # 查看远程仓库

# 撤销操作
git checkout -- <file>   # 撤销工作区改动
git reset HEAD <file>    # 取消暂存
git reset --hard HEAD^   # 回退到上一版本
git revert <commit>      # 撤销某次提交

# 标签操作
git tag                  # 查看标签
git tag v1.0.0          # 创建标签
git push --tags         # 推送标签
```

## 最佳实践建议

### 提交信息规范

```bash
# 类型
feat:     新功能
fix:      修复bug
docs:     文档更新
style:    代码格式（不影响功能）
refactor: 重构
test:     测试相关
chore:    构建过程或辅助工具的变动

# 示例
git commit -m "feat: 添加用户登录功能"
git commit -m "fix: 修复首页加载错误"
git commit -m "docs: 更新README安装说明"
```

### .gitignore最佳实践

```bash
# 项目开始时就创建.gitignore
# 使用gitignore.io生成模板
curl -L https://www.gitignore.io/api/node,macos,windows,visualstudiocode > .gitignore

# 常见忽略项
*.log              # 日志文件
*.tmp             # 临时文件
.env              # 环境变量
node_modules/     # 依赖目录
dist/             # 构建输出
.DS_Store         # macOS系统文件
```

通过这个完整的流程，你已经掌握了Git的基础使用方法！记得经常提交，保持良好的版本控制习惯。