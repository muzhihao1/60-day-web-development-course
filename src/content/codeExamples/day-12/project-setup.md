---
title: "项目初始化与环境配置"
description: "使用Git、npm和Vite搭建现代化开发环境"
---

## 完整项目初始化指南

### 1. 项目基础设置

```bash
#!/bin/bash
# 项目初始化脚本

# 1. 创建项目目录
PROJECT_NAME="developer-portfolio"
mkdir $PROJECT_NAME
cd $PROJECT_NAME

# 2. 初始化Git仓库
echo "=== 初始化Git仓库 ==="
git init
git branch -M main

# 3. 创建.gitignore
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
.pnp
.pnp.js

# Production
dist/
build/

# Testing
coverage/

# Environment
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*
.pnpm-debug.log*

# Editor
.vscode/
!.vscode/extensions.json
!.vscode/settings.json.example
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Cache
.eslintcache
.stylelintcache
.parcel-cache

# Misc
*.log
*.bak
*.tmp
*.temp
EOF

# 4. 创建README.md
cat > README.md << 'EOF'
# Developer Portfolio

一个现代化的开发者作品集网站，展示项目、技能和博客文章。

## 技术栈

- **构建工具**: Vite 5.x
- **CSS框架**: Tailwind CSS 3.x
- **JavaScript**: ES6+ Modules
- **版本控制**: Git with Git Flow
- **包管理**: npm
- **部署**: Vercel/Netlify

## 快速开始

### 安装依赖
```bash
npm install
```

### 开发服务器
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

### 预览生产版本
```bash
npm run preview
```

## 项目结构

```
.
├── src/                # 源代码
│   ├── assets/        # 静态资源
│   ├── components/    # 可复用组件
│   ├── data/         # 数据文件
│   ├── pages/        # 页面文件
│   ├── scripts/      # JavaScript模块
│   └── styles/       # 样式文件
├── public/            # 公共资源
├── dist/             # 构建输出
└── package.json      # 项目配置
```

## 开发规范

### Git提交规范
- `feat:` 新功能
- `fix:` 修复问题
- `docs:` 文档更新
- `style:` 代码格式
- `refactor:` 代码重构
- `test:` 测试相关
- `chore:` 构建或辅助工具

### 分支策略
- `main`: 生产分支
- `develop`: 开发分支
- `feature/*`: 功能分支
- `hotfix/*`: 热修复分支

## 性能目标

- Lighthouse Performance > 90
- First Contentful Paint < 1.8s
- Time to Interactive < 3s
- Cumulative Layout Shift < 0.1

## 贡献指南

1. Fork项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建Pull Request

## 许可证

MIT License
EOF

# 5. 初始化npm项目
echo "=== 初始化npm项目 ==="
npm init -y

# 6. 更新package.json
node -e "
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
pkg.name = 'developer-portfolio';
pkg.version = '0.1.0';
pkg.description = '现代化的开发者作品集网站';
pkg.author = 'Your Name';
pkg.license = 'MIT';
pkg.private = true;
pkg.type = 'module';
pkg.scripts = {
  'dev': 'vite',
  'build': 'vite build',
  'preview': 'vite preview',
  'lint': 'eslint src/**/*.js',
  'lint:fix': 'eslint src/**/*.js --fix',
  'format': 'prettier --write src/**/*.{js,css,html}',
  'format:check': 'prettier --check src/**/*.{js,css,html}',
  'test': 'echo \"No tests yet\"',
  'analyze': 'vite build --mode analyze',
  'clean': 'rm -rf dist node_modules',
  'lighthouse': 'lighthouse http://localhost:3000 --view',
  'serve': 'npx serve dist'
};
pkg.keywords = ['portfolio', 'vite', 'tailwindcss', 'javascript'];
pkg.engines = {
  'node': '>=18.0.0',
  'npm': '>=8.0.0'
};
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
"

echo "=== 项目初始化完成！ ==="
```

### 2. 安装项目依赖

```bash
# 开发依赖
echo "=== 安装开发依赖 ==="
npm install -D \
  vite@^5.0.0 \
  @vitejs/plugin-legacy \
  terser \
  rollup-plugin-visualizer

# CSS相关
npm install -D \
  tailwindcss@^3.4.0 \
  postcss \
  autoprefixer \
  cssnano \
  postcss-import

# 代码质量
npm install -D \
  eslint \
  eslint-config-prettier \
  prettier \
  husky \
  lint-staged

# 优化插件
npm install -D \
  vite-plugin-compression \
  vite-plugin-imagemin \
  vite-plugin-pwa

# 生产依赖
echo "=== 安装生产依赖 ==="
npm install \
  marked \
  gsap \
  lazysizes
```

### 3. 创建配置文件

#### vite.config.js
```javascript
import { defineConfig } from 'vite';
import { resolve } from 'path';
import legacy from '@vitejs/plugin-legacy';
import compression from 'vite-plugin-compression';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  root: 'src',
  publicDir: '../public',
  
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@components': resolve(__dirname, './src/components'),
      '@scripts': resolve(__dirname, './src/scripts'),
      '@styles': resolve(__dirname, './src/styles'),
      '@utils': resolve(__dirname, './src/scripts/utils')
    }
  },
  
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    sourcemap: process.env.NODE_ENV === 'development',
    
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/index.html'),
        about: resolve(__dirname, 'src/pages/about.html'),
        projects: resolve(__dirname, 'src/pages/projects.html'),
        blog: resolve(__dirname, 'src/pages/blog.html'),
        contact: resolve(__dirname, 'src/pages/contact.html')
      },
      
      output: {
        manualChunks: {
          'vendor': ['marked', 'gsap'],
          'utils': []
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: ({ name }) => {
          if (/\.(gif|jpe?g|png|svg|webp)$/.test(name ?? '')) {
            return 'assets/images/[name]-[hash][extname]';
          }
          if (/\.css$/.test(name ?? '')) {
            return 'assets/css/[name]-[hash][extname]';
          }
          if (/\.(woff2?|eot|ttf|otf)$/.test(name ?? '')) {
            return 'assets/fonts/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        }
      }
    },
    
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log'],
        passes: 2
      },
      mangle: {
        safari10: true
      },
      format: {
        comments: false
      }
    },
    
    cssCodeSplit: true,
    chunkSizeWarningLimit: 500,
    assetsInlineLimit: 4096
  },
  
  plugins: [
    legacy({
      targets: ['defaults', 'not IE 11'],
      additionalLegacyPolyfills: ['regenerator-runtime/runtime']
    }),
    
    compression({
      verbose: true,
      disable: false,
      threshold: 10240,
      algorithm: 'gzip',
      ext: '.gz'
    }),
    
    compression({
      verbose: true,
      disable: false,
      threshold: 10240,
      algorithm: 'brotliCompress',
      ext: '.br'
    }),
    
    process.env.ANALYZE && visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true,
      filename: 'dist/stats.html'
    })
  ].filter(Boolean),
  
  server: {
    port: 3000,
    strictPort: false,
    open: true,
    cors: true,
    hmr: {
      overlay: true
    }
  },
  
  preview: {
    port: 4173,
    open: true
  },
  
  optimizeDeps: {
    include: ['marked', 'gsap'],
    exclude: []
  }
});
```

### 4. 项目目录结构创建

```bash
#!/bin/bash
# 创建完整的项目目录结构

echo "=== 创建项目目录结构 ==="

# 创建主要目录
mkdir -p src/{assets,components,data,pages,scripts,styles}
mkdir -p src/assets/{fonts,icons,images}
mkdir -p src/scripts/{modules,utils}
mkdir -p src/styles/{components,utilities}
mkdir -p src/data/blog-posts
mkdir -p public/{images,fonts}

# 创建空白保持文件
touch src/assets/fonts/.gitkeep
touch src/assets/icons/.gitkeep
touch src/assets/images/.gitkeep
touch public/fonts/.gitkeep

# 创建基础HTML模板
cat > src/index.html << 'EOF'
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="开发者作品集 - 展示我的项目和技能">
  <title>开发者作品集</title>
  <link rel="stylesheet" href="/styles/main.css">
</head>
<body>
  <h1>欢迎来到我的作品集</h1>
  <p>项目正在建设中...</p>
  <script type="module" src="/scripts/main.js"></script>
</body>
</html>
EOF

# 创建基础CSS文件
cat > src/styles/main.css << 'EOF'
@import 'tailwindcss/base';
@import 'tailwindcss/components';
@import 'tailwindcss/utilities';

/* 自定义样式 */
@layer base {
  html {
    scroll-behavior: smooth;
  }
}
EOF

# 创建基础JS文件
cat > src/scripts/main.js << 'EOF'
// 主入口文件
console.log('Portfolio App Initialized');

// 应用初始化
class App {
  constructor() {
    this.init();
  }
  
  init() {
    console.log('App started');
  }
}

// 启动应用
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new App());
} else {
  new App();
}
EOF

echo "=== 项目结构创建完成！ ==="
```

### 5. Git Flow工作流设置

```bash
#!/bin/bash
# Git Flow初始化和使用示例

echo "=== Git Flow工作流设置 ==="

# 1. 安装git-flow（如果未安装）
# macOS: brew install git-flow
# Ubuntu/Debian: apt-get install git-flow
# Windows: 使用Git for Windows自带

# 2. 初始化Git Flow
git flow init -d

# 3. 创建初始提交
git add .
git commit -m "chore: initial project setup with Vite and Tailwind CSS"

# 4. 推送到远程仓库
# git remote add origin https://github.com/yourusername/developer-portfolio.git
# git push -u origin main
# git push -u origin develop

# 5. 功能开发流程示例
echo "=== 功能开发流程示例 ==="

# 开始新功能
git flow feature start navigation-component

# 在功能分支上工作
echo "开发导航组件..."
# ... 编写代码 ...

# 提交更改
git add src/components/Navigation.js
git commit -m "feat: add responsive navigation component"

# 完成功能
git flow feature finish navigation-component

# 6. 发布流程示例
echo "=== 发布流程示例 ==="

# 开始发布
git flow release start v0.1.0

# 更新版本号
node -e "
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
pkg.version = '0.1.0';
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
"

git add package.json
git commit -m "chore: bump version to 0.1.0"

# 完成发布
git flow release finish v0.1.0

# 推送标签
git push origin --tags
```

### 6. Pre-commit钩子设置

```bash
# 设置Husky和lint-staged
npx husky-init && npm install

# 创建pre-commit钩子
cat > .husky/pre-commit << 'EOF'
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
EOF

# 配置lint-staged
cat > .lintstagedrc.json << 'EOF'
{
  "*.{js,jsx}": [
    "eslint --fix",
    "prettier --write"
  ],
  "*.{css,scss}": [
    "prettier --write"
  ],
  "*.{html,md}": [
    "prettier --write"
  ]
}
EOF
```

### 7. VS Code配置

```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "files.exclude": {
    "**/node_modules": true,
    "**/dist": true
  },
  "emmet.includeLanguages": {
    "javascript": "javascriptreact"
  },
  "tailwindCSS.includeLanguages": {
    "html": "html",
    "javascript": "javascript"
  },
  "files.associations": {
    "*.css": "tailwindcss"
  }
}
```

```json
// .vscode/extensions.json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "csstools.postcss",
    "ritwickdey.liveserver"
  ]
}
```

这个完整的项目设置脚本提供了从零开始创建一个现代化Web项目所需的所有步骤，包括Git、npm、Vite配置和开发规范的建立。