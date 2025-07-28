---
title: "Phase 1 Capstone Project - 开发者作品集"
type: "project"
difficulty: "advanced"
estimatedHours: 8
tags: ["project", "portfolio", "git", "npm", "vite", "performance"]
---

# Phase 1 Capstone Project：构建专业开发者作品集

## 🎯 项目目标

恭喜你到达Phase 1的终点！现在是时候将所有学到的知识整合到一个真实的项目中了。你将从零开始构建一个现代化的开发者作品集网站，这不仅是一个学习项目，更是展示你技能的专业平台。

## 📋 项目需求清单

### 必须实现的功能

#### 1. 基础架构（25分）
- [ ] 使用Git进行版本控制，遵循Git Flow工作流
- [ ] 使用npm管理项目依赖
- [ ] 使用Vite作为构建工具
- [ ] 配置Tailwind CSS框架
- [ ] 实现响应式设计（移动端、平板、桌面）

#### 2. 页面结构（20分）
- [ ] 首页 - 个人简介和技能展示
- [ ] 关于页 - 详细的个人介绍
- [ ] 项目页 - 作品展示和筛选
- [ ] 博客页 - 文章列表（至少3篇示例文章）
- [ ] 联系页 - 联系表单

#### 3. 核心功能（25分）
- [ ] 深色/浅色主题切换（保存用户偏好）
- [ ] 项目筛选功能（按技术栈）
- [ ] 博客文章加载（从Markdown文件）
- [ ] 平滑的页面过渡动画
- [ ] 表单验证（客户端）

#### 4. 性能优化（20分）
- [ ] Lighthouse性能分数 > 90
- [ ] 实现图片懒加载
- [ ] 代码分割和按需加载
- [ ] 资源压缩和优化
- [ ] 实现基础缓存策略

#### 5. DevTools调试（10分）
- [ ] 使用Performance面板分析性能
- [ ] 使用Network面板优化资源加载
- [ ] 修复Console中的所有错误和警告
- [ ] 使用Coverage工具移除未使用的代码

## 🚀 项目启动模板

### Step 1: 初始化项目

```bash
# 创建项目目录
mkdir my-portfolio && cd my-portfolio

# 初始化Git仓库
git init
git flow init -d

# 创建.gitignore
cat > .gitignore << EOF
node_modules/
dist/
.env
.DS_Store
*.log
.vscode/
.idea/
EOF

# 初始化npm项目
npm init -y

# 安装核心依赖
npm install -D vite @vitejs/plugin-legacy
npm install -D tailwindcss postcss autoprefixer
npm install -D prettier eslint

# 项目依赖
npm install marked gsap
```

### Step 2: 项目结构

```bash
# 创建目录结构
mkdir -p src/{assets,styles,scripts,data,pages,components}
mkdir -p src/assets/{images,fonts,icons}
mkdir -p src/scripts/{modules,utils}
mkdir -p src/data/blog-posts
mkdir -p public

# 创建基础文件
touch vite.config.js
touch tailwind.config.js
touch postcss.config.js
touch src/index.html
touch src/styles/main.css
touch src/scripts/main.js
touch README.md
```

### Step 3: 配置文件

#### vite.config.js
```javascript
import { defineConfig } from 'vite';
import { resolve } from 'path';
import legacy from '@vitejs/plugin-legacy';

export default defineConfig({
  root: 'src',
  publicDir: '../public',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/index.html'),
        // 添加其他页面
      }
    }
  },
  plugins: [
    legacy({
      targets: ['defaults', 'not IE 11']
    })
  ]
});
```

#### tailwind.config.js
```javascript
module.exports = {
  content: ["./src/**/*.{html,js}"],
  darkMode: 'class',
  theme: {
    extend: {
      // 自定义主题
    },
  },
  plugins: [],
};
```

#### postcss.config.js
```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

### Step 4: 基础HTML模板

```html
<!-- src/index.html -->
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>我的作品集</title>
  <link rel="stylesheet" href="/styles/main.css">
</head>
<body class="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
  <!-- 导航栏 -->
  <nav class="fixed top-0 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-50">
    <div class="container mx-auto px-4 py-4">
      <div class="flex justify-between items-center">
        <a href="/" class="text-2xl font-bold">Portfolio</a>
        
        <div class="flex items-center gap-6">
          <a href="/" class="hover:text-primary-600">首页</a>
          <a href="/about" class="hover:text-primary-600">关于</a>
          <a href="/projects" class="hover:text-primary-600">项目</a>
          <a href="/blog" class="hover:text-primary-600">博客</a>
          <a href="/contact" class="hover:text-primary-600">联系</a>
          
          <button id="theme-toggle" class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
            🌙
          </button>
        </div>
      </div>
    </div>
  </nav>
  
  <!-- 主要内容 -->
  <main class="pt-20">
    <!-- 在这里添加页面内容 -->
  </main>
  
  <script type="module" src="/scripts/main.js"></script>
</body>
</html>
```

### Step 5: CSS基础

```css
/* src/styles/main.css */
@import 'tailwindcss/base';
@import 'tailwindcss/components';
@import 'tailwindcss/utilities';

/* 自定义样式 */
@layer base {
  html {
    scroll-behavior: smooth;
  }
  
  body {
    @apply transition-colors duration-300;
  }
}

@layer components {
  .container {
    @apply max-w-6xl mx-auto px-4;
  }
  
  .btn {
    @apply inline-block px-6 py-3 rounded-lg font-medium transition-all duration-300;
  }
  
  .btn-primary {
    @apply bg-primary-600 text-white hover:bg-primary-700;
  }
}
```

### Step 6: JavaScript基础

```javascript
// src/scripts/main.js
import './modules/theme.js';

// 应用初始化
class App {
  constructor() {
    this.init();
  }
  
  init() {
    console.log('Portfolio App Initialized');
    
    // 初始化模块
    this.initTheme();
    this.initNavigation();
    this.initAnimations();
  }
  
  initTheme() {
    // 主题切换逻辑
  }
  
  initNavigation() {
    // 导航逻辑
  }
  
  initAnimations() {
    // 动画逻辑
  }
}

// 启动应用
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new App());
} else {
  new App();
}
```

## 📝 开发里程碑

### Milestone 1: 项目设置（Day 1）
- [ ] 完成项目初始化
- [ ] 配置所有构建工具
- [ ] 创建基础页面结构
- [ ] 实现导航功能
- [ ] Git: 创建develop分支

### Milestone 2: 核心功能（Day 2-3）
- [ ] 实现主题切换
- [ ] 完成首页设计
- [ ] 创建项目展示组件
- [ ] 实现博客系统
- [ ] Git: 为每个功能创建feature分支

### Milestone 3: 内容填充（Day 4）
- [ ] 添加个人信息
- [ ] 添加至少3个项目
- [ ] 写3篇博客文章
- [ ] 完成所有页面内容
- [ ] Git: 合并所有feature到develop

### Milestone 4: 优化和调试（Day 5-6）
- [ ] 性能优化
- [ ] DevTools调试
- [ ] 响应式测试
- [ ] 浏览器兼容性
- [ ] Git: 创建release分支

### Milestone 5: 部署上线（Day 7）
- [ ] 最终测试
- [ ] 构建生产版本
- [ ] 部署到托管平台
- [ ] Git: 合并到main分支并打tag

## 🐛 调试挑战

在开发过程中，你需要解决以下问题：

### 性能问题
1. **首次内容绘制时间过长**
   - 提示：检查关键渲染路径
   - 工具：Performance面板

2. **大量未使用的CSS**
   - 提示：使用Coverage工具
   - 解决：PurgeCSS配置

3. **JavaScript包体积过大**
   - 提示：分析bundle大小
   - 解决：代码分割

### 功能问题
1. **主题切换不持久**
   - 提示：localStorage
   - 注意：初始闪烁问题

2. **图片加载缓慢**
   - 提示：实现懒加载
   - 工具：Intersection Observer

3. **表单验证不工作**
   - 提示：事件委托
   - 工具：Console调试

## 🎨 设计要求

### 配色方案
- 主色：自选（建议使用品牌色）
- 背景：浅色 #FFFFFF，深色 #111827
- 文字：浅色 #111827，深色 #F9FAFB

### 字体
- 标题：System UI或自选
- 正文：Inter或同等
- 代码：Fira Code或等宽字体

### 间距系统
- 使用Tailwind默认间距
- 保持一致的节奏感

## 📊 评分标准

### 技术实现（70分）
- Git使用和工作流：10分
- 代码组织和质量：15分
- 功能完整性：20分
- 性能优化：15分
- 调试和测试：10分

### 设计和用户体验（20分）
- 视觉设计：10分
- 响应式设计：5分
- 可访问性：5分

### 项目管理（10分）
- 文档完整性：5分
- 部署成功：5分

## 🚦 提交要求

1. **GitHub仓库**
   - 完整的Git历史
   - 清晰的README文档
   - 正确的.gitignore

2. **在线演示**
   - 部署到Vercel/Netlify/GitHub Pages
   - 提供访问链接

3. **性能报告**
   - Lighthouse报告截图
   - 优化前后对比

4. **项目文档**
   - 技术选型说明
   - 遇到的问题和解决方案
   - 未来改进计划

## 💡 提示和技巧

### Git工作流
```bash
# 功能开发
git flow feature start header-component
# ... 开发代码 ...
git add .
git commit -m "feat: add responsive header component"
git flow feature finish header-component

# 发布准备
git flow release start v1.0.0
# ... 测试和修复 ...
git flow release finish v1.0.0
```

### 性能优化技巧
1. **使用WebP图片格式**
2. **启用Gzip压缩**
3. **预加载关键资源**
4. **使用CDN加速**
5. **实现Service Worker**

### DevTools调试技巧
1. **使用Lighthouse CI自动化测试**
2. **Performance录制分析渲染性能**
3. **Network面板识别慢请求**
4. **Coverage找出未使用代码**
5. **Memory面板检查内存泄漏**

## 🎯 完成标准

当你完成以下所有项目时，就可以提交项目了：

- [ ] 所有必需功能已实现
- [ ] Lighthouse四项指标均>90分
- [ ] 没有Console错误或警告
- [ ] 响应式设计在所有设备上正常
- [ ] Git历史清晰，符合规范
- [ ] 项目已成功部署上线
- [ ] README文档完整详细
- [ ] 代码通过ESLint检查

## 🌟 加分项

如果你还有余力，可以尝试：

1. **添加动画效果**（GSAP、Framer Motion）
2. **实现搜索功能**
3. **添加评论系统**（使用第三方服务）
4. **PWA功能**（离线访问）
5. **国际化支持**（多语言）
6. **自动化测试**（Vitest）
7. **CI/CD pipeline**（GitHub Actions）
8. **A11y完全合规**（WCAG 2.1 AA）

祝你项目顺利！记住，这个作品集将伴随你的整个职业生涯，值得投入时间打造好它。🚀