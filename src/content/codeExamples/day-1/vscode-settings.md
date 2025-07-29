---
title: "VS Code配置示例"
description: "VS Code编辑器的基础配置和常用设置"
category: "tools"
language: "json"
day: 1
concepts:
  - "开发环境"
  - "编辑器配置"
  - "快捷键设置"
relatedTopics:
  - "VS Code插件"
  - "开发工具"
---

# VS Code配置示例

## 基础设置 (settings.json)

```json
{
  // 编辑器基础设置
  "editor.fontSize": 16,
  "editor.fontFamily": "'Fira Code', 'Cascadia Code', Consolas, monospace",
  "editor.fontLigatures": true,
  "editor.tabSize": 2,
  "editor.insertSpaces": true,
  "editor.wordWrap": "on",
  "editor.formatOnSave": true,
  "editor.formatOnPaste": true,
  "editor.lineHeight": 1.6,
  "editor.letterSpacing": 0.5,
  
  // 光标和滚动
  "editor.cursorBlinking": "smooth",
  "editor.cursorStyle": "line",
  "editor.smoothScrolling": true,
  "editor.scrollBeyondLastLine": false,
  
  // 代码提示和自动完成
  "editor.quickSuggestions": {
    "other": true,
    "comments": false,
    "strings": true
  },
  "editor.suggestSelection": "first",
  "editor.snippetSuggestions": "top",
  "editor.tabCompletion": "on",
  
  // 括号和缩进
  "editor.bracketPairColorization.enabled": true,
  "editor.guides.bracketPairs": true,
  "editor.guides.indentation": true,
  "editor.renderWhitespace": "selection",
  
  // 文件管理
  "files.autoSave": "afterDelay",
  "files.autoSaveDelay": 1000,
  "files.trimTrailingWhitespace": true,
  "files.insertFinalNewline": true,
  "files.encoding": "utf8",
  
  // 工作台设置
  "workbench.colorTheme": "One Dark Pro",
  "workbench.iconTheme": "material-icon-theme",
  "workbench.startupEditor": "newUntitledFile",
  "workbench.sideBar.location": "left",
  "workbench.activityBar.visible": true,
  "workbench.statusBar.visible": true,
  
  // 终端设置
  "terminal.integrated.fontSize": 14,
  "terminal.integrated.fontFamily": "'Fira Code', monospace",
  "terminal.integrated.cursorStyle": "block",
  "terminal.integrated.cursorBlinking": true,
  
  // Git设置
  "git.enableSmartCommit": true,
  "git.confirmSync": false,
  "git.autofetch": true,
  
  // 格式化工具
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[html]": {
    "editor.defaultFormatter": "vscode.html-language-features"
  },
  "[css]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  
  // Emmet设置
  "emmet.includeLanguages": {
    "javascript": "javascriptreact"
  },
  "emmet.triggerExpansionOnTab": true
}
```

## 用户代码片段 (snippets)

### HTML代码片段

```json
{
  "HTML5 Boilerplate": {
    "prefix": "html5",
    "body": [
      "<!DOCTYPE html>",
      "<html lang=\"${1:zh-CN}\">",
      "<head>",
      "  <meta charset=\"UTF-8\">",
      "  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">",
      "  <meta name=\"description\" content=\"$2\">",
      "  <title>$3</title>",
      "  <link rel=\"stylesheet\" href=\"${4:styles.css}\">",
      "</head>",
      "<body>",
      "  $0",
      "  <script src=\"${5:script.js}\"></script>",
      "</body>",
      "</html>"
    ],
    "description": "HTML5模板"
  },
  
  "Semantic Section": {
    "prefix": "section",
    "body": [
      "<section>",
      "  <h2>$1</h2>",
      "  <p>$2</p>",
      "  $0",
      "</section>"
    ],
    "description": "语义化section"
  }
}
```

### CSS代码片段

```json
{
  "CSS Reset": {
    "prefix": "reset",
    "body": [
      "* {",
      "  margin: 0;",
      "  padding: 0;",
      "  box-sizing: border-box;",
      "}",
      "",
      "body {",
      "  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;",
      "  line-height: 1.6;",
      "  color: #333;",
      "}"
    ],
    "description": "CSS重置样式"
  },
  
  "Flexbox Container": {
    "prefix": "flex",
    "body": [
      "display: flex;",
      "justify-content: ${1|flex-start,flex-end,center,space-between,space-around|};",
      "align-items: ${2|stretch,flex-start,flex-end,center,baseline|};",
      "gap: ${3:1rem};"
    ],
    "description": "Flexbox容器"
  }
}
```

## 快捷键配置 (keybindings.json)

```json
[
  // 自定义快捷键
  {
    "key": "ctrl+alt+f",
    "command": "editor.action.formatDocument"
  },
  {
    "key": "ctrl+alt+l",
    "command": "editor.action.formatSelection"
  },
  {
    "key": "ctrl+shift+d",
    "command": "editor.action.duplicateSelection"
  },
  {
    "key": "alt+up",
    "command": "editor.action.moveLinesUpAction"
  },
  {
    "key": "alt+down",
    "command": "editor.action.moveLinesDownAction"
  },
  {
    "key": "ctrl+shift+t",
    "command": "workbench.action.terminal.new"
  }
]
```

## 推荐的扩展配置

### Prettier配置 (.prettierrc)

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "arrowParens": "avoid",
  "endOfLine": "lf"
}
```

### ESLint配置 (.eslintrc.json)

```json
{
  "env": {
    "browser": true,
    "es2021": true,
    "node": true
  },
  "extends": ["eslint:recommended"],
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module"
  },
  "rules": {
    "indent": ["error", 2],
    "linebreak-style": ["error", "unix"],
    "quotes": ["error", "single"],
    "semi": ["error", "always"]
  }
}
```

## 工作区设置示例

```json
{
  // 项目特定设置
  "folders": [
    {
      "path": "."
    }
  ],
  "settings": {
    // 项目专用设置
    "editor.tabSize": 2,
    "files.exclude": {
      "**/.git": true,
      "**/.DS_Store": true,
      "**/node_modules": true,
      "**/dist": true
    },
    "search.exclude": {
      "**/node_modules": true,
      "**/dist": true,
      "**/build": true
    }
  }
}
```

## 调试配置 (launch.json)

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Launch Chrome",
      "url": "http://localhost:5500",
      "webRoot": "${workspaceFolder}"
    },
    {
      "type": "node",
      "request": "launch",
      "name": "Launch Node",
      "skipFiles": ["<node_internals>/**"],
      "program": "${workspaceFolder}/index.js"
    }
  ]
}
```

## 实用技巧

### 多光标编辑
```
Alt + Click: 添加光标
Ctrl + Alt + ↑/↓: 向上/下添加光标
Ctrl + D: 选择下一个相同的词
Ctrl + Shift + L: 选择所有相同的词
```

### 代码折叠
```
Ctrl + Shift + [: 折叠代码块
Ctrl + Shift + ]: 展开代码块
Ctrl + K, Ctrl + 0: 折叠所有
Ctrl + K, Ctrl + J: 展开所有
```

### 导航快捷键
```
Ctrl + P: 快速打开文件
Ctrl + Shift + P: 命令面板
Ctrl + G: 跳转到行
Ctrl + Shift + O: 跳转到符号
```

这些配置将帮助你打造一个高效的开发环境！