# 示例项目结构

这是一个标准的Web项目结构示例，你可以参考这个结构来组织你的学习项目。

## 基础项目结构

```
my-web-project/
├── index.html          # 主页面
├── README.md          # 项目说明文档
├── .gitignore         # Git忽略文件
├── assets/            # 资源文件夹
│   ├── css/          # 样式文件
│   │   ├── style.css
│   │   └── reset.css
│   ├── js/           # JavaScript文件
│   │   └── main.js
│   ├── images/       # 图片资源
│   │   ├── logo.png
│   │   └── hero.jpg
│   └── fonts/        # 字体文件
│       └── custom-font.woff2
├── pages/            # 其他页面
│   ├── about.html
│   └── contact.html
└── docs/             # 文档
    └── notes.md
```

## Git忽略文件示例 (.gitignore)

```gitignore
# 操作系统文件
.DS_Store
Thumbs.db
desktop.ini

# 编辑器配置
.vscode/
.idea/
*.sublime-project
*.sublime-workspace

# 日志文件
*.log
logs/

# 依赖目录
node_modules/
bower_components/

# 编译输出
dist/
build/
*.min.css
*.min.js

# 环境变量
.env
.env.local
.env.*.local

# 临时文件
*.tmp
*.temp
*.swp
*~

# 个人配置
config.local.js
settings.local.json
```

## VS Code 工作区设置示例

创建 `.vscode/settings.json` 文件：

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "files.autoSave": "afterDelay",
  "files.autoSaveDelay": 1000,
  "liveServer.settings.port": 5500,
  "liveServer.settings.root": "/",
  "emmet.includeLanguages": {
    "javascript": "javascriptreact"
  }
}
```

## 示例 README.md 模板

```markdown
# 项目名称

简短的项目描述，说明这个项目是做什么的。

## 🚀 快速开始

### 前置要求

- 安装了最新版本的现代浏览器
- 安装了 VS Code
- 安装了 Live Server 插件

### 安装步骤

1. 克隆仓库
   ```bash
   git clone https://github.com/yourusername/project-name.git
   ```

2. 进入项目目录
   ```bash
   cd project-name
   ```

3. 使用 Live Server 打开 index.html

## 📁 项目结构

```
project-name/
├── index.html
├── assets/
│   ├── css/
│   ├── js/
│   └── images/
└── README.md
```

## 🛠️ 使用的技术

- HTML5
- CSS3
- JavaScript (ES6+)
- [其他技术栈]

## 📝 功能特性

- ✅ 功能1
- ✅ 功能2
- ⏳ 功能3 (开发中)
- 📋 功能4 (计划中)

## 🤝 贡献

欢迎提交 Pull Request 或创建 Issue。

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 👨‍💻 作者

- **你的名字** - [GitHub Profile](https://github.com/yourusername)

## 🙏 致谢

- 感谢 [参考项目1]
- 灵感来源于 [参考项目2]
```

## 使用提示

1. **保持一致性**：在整个项目中保持文件命名和文件夹结构的一致性。

2. **使用小写**：文件名使用小写字母，单词之间用连字符分隔（kebab-case）。
   - ✅ `my-style.css`
   - ❌ `MyStyle.css` 或 `my_style.css`

3. **有意义的命名**：使用描述性的名称。
   - ✅ `navigation-menu.js`
   - ❌ `nav.js` 或 `script1.js`

4. **组织资源**：将相关文件放在一起。
   - 所有样式文件放在 `css/` 文件夹
   - 所有脚本文件放在 `js/` 文件夹
   - 所有图片放在 `images/` 文件夹

5. **版本控制**：定期提交你的更改，使用清晰的提交信息。

记住，良好的项目组织习惯会让你的开发过程更加顺畅！