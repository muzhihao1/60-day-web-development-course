---
title: "解决合并冲突"
description: "演示如何识别和解决Git合并冲突"
---

## 解决合并冲突

### 创建冲突场景

```bash
# 在main分支修改文件
git checkout main
echo "body { background: red; }" > style.css
git add style.css
git commit -m "设置红色背景"

# 在功能分支修改同一文件
git checkout -b feature-blue-theme
echo "body { background: blue; }" > style.css
git add style.css
git commit -m "设置蓝色背景"

# 尝试合并（产生冲突）
git checkout main
git merge feature-blue-theme
# 输出：CONFLICT (content): Merge conflict in style.css
```

### 冲突文件格式

```css
/* style.css 冲突时的内容 */
<<<<<<< HEAD
body { background: red; }
=======
body { background: blue; }
>>>>>>> feature-blue-theme
```

### 解决冲突步骤

```bash
# 1. 查看冲突状态
git status
# 输出：both modified: style.css

# 2. 手动编辑文件，选择保留的内容
# 例如：决定使用渐变色
echo "body { background: linear-gradient(red, blue); }" > style.css

# 3. 标记冲突已解决
git add style.css

# 4. 完成合并
git commit -m "merge: 解决样式冲突，使用渐变背景"
```

### 使用工具解决冲突

```bash
# 使用内置合并工具
git mergetool

# 查看冲突文件的三个版本
git show :1:style.css  # 共同祖先版本
git show :2:style.css  # 当前分支版本（ours）
git show :3:style.css  # 合并分支版本（theirs）

# 选择特定版本
git checkout --ours style.css    # 保留当前分支版本
git checkout --theirs style.css  # 使用合并分支版本
```

### 中止合并

```bash
# 如果想放弃合并，恢复到合并前状态
git merge --abort

# 或者使用reset
git reset --hard HEAD
```