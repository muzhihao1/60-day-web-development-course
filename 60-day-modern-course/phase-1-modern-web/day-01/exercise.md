# Day 01 练习：搭建你的学习环境

## 🎯 练习目标

通过本练习，你将：
- 完成开发环境的搭建
- 创建并管理你的第一个Git仓库
- 建立良好的项目组织习惯
- 熟悉基本的Git工作流程

## 📝 练习要求

### 任务1：环境准备检查表 ✓

确保以下所有项目都已完成：

1. **VS Code安装与配置**
   - [ ] VS Code已成功安装
   - [ ] 字体大小调整为16px
   - [ ] 自动保存已开启
   - [ ] 选择了喜欢的主题

2. **VS Code插件安装**
   - [ ] Live Server
   - [ ] Prettier
   - [ ] ESLint
   - [ ] GitLens
   - [ ] Auto Rename Tag
   - [ ] Path Intellisense

3. **Git环境配置**
   - [ ] Git已安装（终端输入`git --version`能看到版本号）
   - [ ] 用户名已配置
   - [ ] 邮箱已配置
   - [ ] 默认分支设置为main

### 任务2：创建个人学习仓库 📁

创建一个专门用于记录60天学习历程的仓库。

**目录结构要求：**
```
web-learning-journey/
├── README.md
├── .gitignore
├── daily-notes/
│   ├── day-01.md
│   └── ...
├── projects/
│   └── README.md
└── resources/
    └── README.md
```

### 任务3：编写学习计划 📋

在`README.md`中编写你的学习计划，包含：

1. **个人介绍**（2-3句话）
2. **学习目标**（你希望通过这60天达到什么水平）
3. **学习承诺**（例如：每天学习1小时）
4. **项目规划**（列出你想要完成的项目类型）

**示例模板：**
```markdown
# 我的Web开发学习之旅

## 关于我
[简单的自我介绍]

## 学习目标
通过60天的学习，我希望能够：
- 掌握HTML、CSS和JavaScript基础
- 能够独立开发响应式网站
- 了解现代前端框架React
- 具备基本的后端开发能力

## 学习承诺
- 每天投入至少1小时学习时间
- 完成所有练习和项目
- 记录学习笔记和心得
- 独立解决遇到的问题

## 项目规划
- [ ] 个人作品集网站
- [ ] 待办事项应用
- [ ] 天气预报应用
- [ ] 个人博客系统
- [ ] 最终毕业项目

## 学习进度
- [x] Day 1: 开发环境搭建 ✅
- [ ] Day 2: HTML5语义化
- [ ] Day 3: HTML5表单
...
```

### 任务4：记录今日学习笔记 📝

在`daily-notes/day-01.md`中记录：

1. **今日学到的内容**（列出3-5个要点）
2. **遇到的问题及解决方案**
3. **明日学习计划**
4. **学习心得**

### 任务5：Git操作练习 🔄

完成以下Git操作序列：

```bash
# 1. 创建项目并初始化
mkdir web-learning-journey
cd web-learning-journey
git init

# 2. 创建必要的文件和文件夹
# (使用VS Code或命令行创建上述目录结构)

# 3. 第一次提交
git add .
git commit -m "初始化学习仓库"

# 4. 修改README.md，添加更多内容

# 5. 第二次提交
git add README.md
git commit -m "更新学习计划和目标"

# 6. 创建并提交学习笔记
git add daily-notes/day-01.md
git commit -m "添加第一天学习笔记"

# 7. 查看提交历史
git log --oneline

# 8. 创建GitHub仓库并推送
# (按照README中的步骤)
```

## 🎨 预期效果

完成练习后，你应该：

1. **本地效果**
   - VS Code可以正常打开项目
   - 终端中可以看到Git提交历史
   - 项目结构清晰有序

2. **GitHub效果**
   - 仓库已成功创建
   - 可以看到至少3次提交记录
   - README.md在仓库首页正确显示

## 💡 提示

1. **VS Code技巧**
   - 使用 `Ctrl+Shift+E` 打开文件资源管理器
   - 使用 `Ctrl+~` 打开集成终端
   - 右键文件夹可以快速创建新文件

2. **Git技巧**
   - 使用 `git status` 随时查看仓库状态
   - commit信息要清晰描述所做的修改
   - 养成频繁提交的好习惯

3. **Markdown技巧**
   - 使用 `#` 创建标题（数量表示级别）
   - 使用 `- [ ]` 创建待办事项
   - 使用 ``` 包裹代码块

## 📊 评分标准

| 评分项 | 分值 | 要求 |
|--------|------|------|
| 环境搭建 | 20分 | VS Code和Git正确安装配置 |
| 仓库结构 | 20分 | 按要求创建所有文件夹和文件 |
| README内容 | 20分 | 包含所有要求的部分，内容充实 |
| Git操作 | 20分 | 至少3次有意义的提交 |
| 学习笔记 | 20分 | 认真记录学习内容和心得 |

**优秀标准（90分以上）：**
- 所有任务完成
- README.md格式美观，内容详实
- Git提交信息规范清晰
- 学习笔记有自己的思考和总结

## 🚨 常见问题

1. **Git推送失败**
   - 检查是否正确添加了远程仓库
   - 确认用户名和密码/token是否正确
   - 尝试使用HTTPS而不是SSH

2. **VS Code插件安装失败**
   - 检查网络连接
   - 尝试重启VS Code
   - 手动搜索插件名称

3. **命令行报错"command not found"**
   - 确保Git已正确安装
   - Windows用户使用Git Bash
   - Mac/Linux用户检查PATH环境变量

## 🎯 挑战任务（可选）

如果你提前完成了基础练习，可以尝试：

1. **美化你的README**
   - 添加徽章（shields.io）
   - 加入表情符号
   - 创建目录索引

2. **探索Git分支**
   ```bash
   git branch feature-test
   git checkout feature-test
   # 做一些修改
   git checkout main
   ```

3. **配置Git别名**
   ```bash
   git config --global alias.st status
   git config --global alias.co checkout
   git config --global alias.br branch
   ```

完成练习后，记得：
- 截图保存你的GitHub仓库页面作为学习记录
- 回顾今天学到的知识点
- 规划明天的学习内容

祝你学习愉快！💪