---
title: "可复用Tailwind CSS组件库"
description: "构建高性能的UI组件系统"
category: "project"
language: "html"
---

## Tailwind CSS组件开发指南

### 1. 按钮组件系统

```html
<!-- 基础按钮组件 -->
<div class="space-y-4">
  <!-- 主要按钮 -->
  <button class="btn btn-primary">
    主要按钮
  </button>
  
  <!-- 次要按钮 -->
  <button class="btn btn-secondary">
    次要按钮
  </button>
  
  <!-- 轮廓按钮 -->
  <button class="btn btn-outline">
    轮廓按钮
  </button>
  
  <!-- 文字按钮 -->
  <button class="btn btn-text">
    文字按钮
  </button>
  
  <!-- 危险按钮 -->
  <button class="btn btn-danger">
    删除
  </button>
  
  <!-- 加载状态 -->
  <button class="btn btn-primary" disabled>
    <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    加载中...
  </button>
</div>

<style>
/* 按钮基础样式 */
@layer components {
  .btn {
    @apply inline-flex items-center justify-center px-6 py-2.5 
           font-medium rounded-lg transition-all duration-200 
           focus:outline-none focus:ring-2 focus:ring-offset-2
           disabled:opacity-50 disabled:cursor-not-allowed;
  }
  
  .btn-primary {
    @apply bg-blue-600 text-white hover:bg-blue-700 
           focus:ring-blue-500 dark:bg-blue-500 
           dark:hover:bg-blue-600;
  }
  
  .btn-secondary {
    @apply bg-gray-600 text-white hover:bg-gray-700 
           focus:ring-gray-500 dark:bg-gray-500 
           dark:hover:bg-gray-600;
  }
  
  .btn-outline {
    @apply border-2 border-gray-300 text-gray-700 
           hover:border-gray-400 hover:bg-gray-50
           focus:ring-gray-500 dark:border-gray-600 
           dark:text-gray-300 dark:hover:bg-gray-800;
  }
  
  .btn-text {
    @apply text-blue-600 hover:bg-blue-50 
           focus:ring-blue-500 dark:text-blue-400 
           dark:hover:bg-blue-900/20;
  }
  
  .btn-danger {
    @apply bg-red-600 text-white hover:bg-red-700 
           focus:ring-red-500 dark:bg-red-500 
           dark:hover:bg-red-600;
  }
  
  /* 按钮尺寸 */
  .btn-sm {
    @apply px-4 py-1.5 text-sm;
  }
  
  .btn-lg {
    @apply px-8 py-3.5 text-lg;
  }
  
  /* 圆形按钮 */
  .btn-icon {
    @apply p-2.5 rounded-full;
  }
}
</style>
```

### 2. 卡片组件

```html
<!-- 项目卡片组件 -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <!-- 基础卡片 -->
  <article class="card">
    <div class="card-image">
      <img src="/project-1.jpg" alt="项目截图" 
           class="w-full h-48 object-cover">
      <div class="card-overlay">
        <button class="btn btn-primary btn-sm">查看详情</button>
      </div>
    </div>
    
    <div class="card-body">
      <h3 class="card-title">项目标题</h3>
      <p class="card-text">
        项目简介，描述项目的主要功能和技术栈。
      </p>
      
      <div class="card-tags">
        <span class="tag">React</span>
        <span class="tag">TypeScript</span>
        <span class="tag">Tailwind</span>
      </div>
    </div>
    
    <div class="card-footer">
      <a href="#" class="card-link">
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"/>
          <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z"/>
        </svg>
        在线演示
      </a>
      <a href="#" class="card-link">
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clip-rule="evenodd"/>
        </svg>
        源代码
      </a>
    </div>
  </article>
  
  <!-- 悬停效果卡片 -->
  <article class="card card-hover">
    <div class="card-body">
      <div class="card-icon">
        <svg class="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/>
        </svg>
      </div>
      <h3 class="card-title">响应式设计</h3>
      <p class="card-text">
        完美适配各种设备，从手机到桌面电脑。
      </p>
    </div>
  </article>
</div>

<style>
@layer components {
  /* 卡片基础样式 */
  .card {
    @apply bg-white dark:bg-gray-800 rounded-lg shadow-md 
           overflow-hidden transition-all duration-300;
  }
  
  .card-hover {
    @apply hover:shadow-xl hover:-translate-y-1;
  }
  
  .card-image {
    @apply relative overflow-hidden;
  }
  
  .card-overlay {
    @apply absolute inset-0 bg-black/60 opacity-0 
           hover:opacity-100 transition-opacity duration-300
           flex items-center justify-center;
  }
  
  .card-body {
    @apply p-6;
  }
  
  .card-title {
    @apply text-xl font-semibold mb-2 text-gray-900 
           dark:text-gray-100;
  }
  
  .card-text {
    @apply text-gray-600 dark:text-gray-400 mb-4;
  }
  
  .card-tags {
    @apply flex flex-wrap gap-2 mt-4;
  }
  
  .card-footer {
    @apply px-6 py-4 bg-gray-50 dark:bg-gray-900/50 
           border-t border-gray-200 dark:border-gray-700
           flex items-center justify-between;
  }
  
  .card-link {
    @apply inline-flex items-center gap-2 text-sm 
           text-blue-600 dark:text-blue-400 
           hover:text-blue-800 dark:hover:text-blue-300
           transition-colors;
  }
  
  .card-icon {
    @apply mb-4;
  }
  
  /* 标签样式 */
  .tag {
    @apply inline-block px-3 py-1 text-xs font-medium 
           bg-gray-100 dark:bg-gray-700 text-gray-700 
           dark:text-gray-300 rounded-full;
  }
  
  .tag-primary {
    @apply bg-blue-100 dark:bg-blue-900/30 
           text-blue-700 dark:text-blue-300;
  }
}
</style>
```

### 3. 导航组件

```html
<!-- 响应式导航栏 -->
<nav class="navbar">
  <div class="navbar-container">
    <!-- Logo -->
    <div class="navbar-brand">
      <a href="/" class="text-2xl font-bold text-primary">
        Portfolio
      </a>
    </div>
    
    <!-- 桌面菜单 -->
    <div class="navbar-menu hidden md:flex">
      <a href="/" class="navbar-link active">首页</a>
      <a href="/about" class="navbar-link">关于</a>
      <a href="/projects" class="navbar-link">项目</a>
      <a href="/blog" class="navbar-link">博客</a>
      <a href="/contact" class="navbar-link">联系</a>
    </div>
    
    <!-- 工具栏 -->
    <div class="navbar-tools">
      <!-- 主题切换 -->
      <button id="theme-toggle" class="tool-btn" 
              aria-label="切换主题">
        <svg class="w-5 h-5 hidden dark:block" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" fill-rule="evenodd" clip-rule="evenodd"/>
        </svg>
        <svg class="w-5 h-5 block dark:hidden" fill="currentColor" viewBox="0 0 20 20">
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/>
        </svg>
      </button>
      
      <!-- 移动菜单按钮 -->
      <button id="mobile-menu-toggle" class="tool-btn md:hidden"
              aria-label="菜单">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path class="menu-icon" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
          <path class="close-icon hidden" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
    </div>
  </div>
  
  <!-- 移动菜单 -->
  <div id="mobile-menu" class="navbar-mobile hidden">
    <a href="/" class="mobile-link active">首页</a>
    <a href="/about" class="mobile-link">关于</a>
    <a href="/projects" class="mobile-link">项目</a>
    <a href="/blog" class="mobile-link">博客</a>
    <a href="/contact" class="mobile-link">联系</a>
  </div>
</nav>

<style>
@layer components {
  /* 导航栏容器 */
  .navbar {
    @apply fixed top-0 w-full bg-white/90 dark:bg-gray-900/90 
           backdrop-blur-md shadow-sm z-50 transition-all duration-300;
  }
  
  .navbar-container {
    @apply container mx-auto px-4 py-4 flex items-center justify-between;
  }
  
  /* 桌面菜单 */
  .navbar-menu {
    @apply flex items-center gap-8;
  }
  
  .navbar-link {
    @apply text-gray-700 dark:text-gray-300 font-medium 
           hover:text-blue-600 dark:hover:text-blue-400 
           transition-colors relative;
  }
  
  .navbar-link.active {
    @apply text-blue-600 dark:text-blue-400;
  }
  
  .navbar-link::after {
    @apply content-[''] absolute bottom-0 left-0 w-0 h-0.5 
           bg-blue-600 dark:bg-blue-400 transition-all duration-300;
  }
  
  .navbar-link:hover::after,
  .navbar-link.active::after {
    @apply w-full;
  }
  
  /* 工具栏 */
  .navbar-tools {
    @apply flex items-center gap-4;
  }
  
  .tool-btn {
    @apply p-2 rounded-lg text-gray-600 dark:text-gray-400 
           hover:bg-gray-100 dark:hover:bg-gray-800 
           transition-colors;
  }
  
  /* 移动菜单 */
  .navbar-mobile {
    @apply md:hidden border-t border-gray-200 dark:border-gray-700 
           bg-white dark:bg-gray-900;
  }
  
  .mobile-link {
    @apply block px-4 py-3 text-gray-700 dark:text-gray-300 
           hover:bg-gray-50 dark:hover:bg-gray-800 
           transition-colors;
  }
  
  .mobile-link.active {
    @apply text-blue-600 dark:text-blue-400 bg-blue-50 
           dark:bg-blue-900/20;
  }
}
</style>

<script>
// 导航栏交互逻辑
class Navigation {
  constructor() {
    this.mobileToggle = document.getElementById('mobile-menu-toggle');
    this.mobileMenu = document.getElementById('mobile-menu');
    this.menuIcon = this.mobileToggle.querySelector('.menu-icon');
    this.closeIcon = this.mobileToggle.querySelector('.close-icon');
    
    this.init();
  }
  
  init() {
    // 移动菜单切换
    this.mobileToggle.addEventListener('click', () => {
      this.toggleMobileMenu();
    });
    
    // 点击外部关闭菜单
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.navbar')) {
        this.closeMobileMenu();
      }
    });
    
    // 滚动时的导航栏效果
    this.handleScroll();
  }
  
  toggleMobileMenu() {
    this.mobileMenu.classList.toggle('hidden');
    this.menuIcon.classList.toggle('hidden');
    this.closeIcon.classList.toggle('hidden');
  }
  
  closeMobileMenu() {
    this.mobileMenu.classList.add('hidden');
    this.menuIcon.classList.remove('hidden');
    this.closeIcon.classList.add('hidden');
  }
  
  handleScroll() {
    let lastScrollY = 0;
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > 100) {
        navbar.classList.add('navbar-scrolled');
      } else {
        navbar.classList.remove('navbar-scrolled');
      }
      
      // 隐藏/显示导航栏
      if (currentScrollY > lastScrollY && currentScrollY > 200) {
        navbar.style.transform = 'translateY(-100%)';
      } else {
        navbar.style.transform = 'translateY(0)';
      }
      
      lastScrollY = currentScrollY;
    });
  }
}

// 初始化
new Navigation();
</script>
```

### 4. 表单组件

```html
<!-- 联系表单组件 -->
<form class="form" id="contact-form">
  <div class="form-group">
    <label for="name" class="form-label">姓名</label>
    <input type="text" id="name" name="name" 
           class="form-input" required>
    <span class="form-error hidden">请输入您的姓名</span>
  </div>
  
  <div class="form-group">
    <label for="email" class="form-label">邮箱</label>
    <input type="email" id="email" name="email" 
           class="form-input" required>
    <span class="form-error hidden">请输入有效的邮箱地址</span>
  </div>
  
  <div class="form-group">
    <label for="subject" class="form-label">主题</label>
    <select id="subject" name="subject" class="form-select">
      <option value="">请选择主题</option>
      <option value="project">项目合作</option>
      <option value="job">工作机会</option>
      <option value="other">其他</option>
    </select>
  </div>
  
  <div class="form-group">
    <label for="message" class="form-label">留言</label>
    <textarea id="message" name="message" rows="5" 
              class="form-textarea" required></textarea>
    <span class="form-help">最少10个字符</span>
  </div>
  
  <div class="form-group">
    <label class="form-checkbox">
      <input type="checkbox" name="subscribe">
      <span>订阅邮件通知</span>
    </label>
  </div>
  
  <div class="form-actions">
    <button type="submit" class="btn btn-primary">
      发送消息
    </button>
    <button type="reset" class="btn btn-outline">
      重置
    </button>
  </div>
</form>

<style>
@layer components {
  /* 表单容器 */
  .form {
    @apply space-y-6;
  }
  
  .form-group {
    @apply space-y-2;
  }
  
  /* 标签 */
  .form-label {
    @apply block text-sm font-medium text-gray-700 
           dark:text-gray-300;
  }
  
  /* 输入框 */
  .form-input,
  .form-select,
  .form-textarea {
    @apply w-full px-4 py-2 border border-gray-300 
           dark:border-gray-600 rounded-lg
           bg-white dark:bg-gray-800 
           text-gray-900 dark:text-gray-100
           focus:ring-2 focus:ring-blue-500 focus:border-transparent
           transition-all duration-200;
  }
  
  .form-input:invalid:not(:placeholder-shown),
  .form-textarea:invalid:not(:placeholder-shown) {
    @apply border-red-500 focus:ring-red-500;
  }
  
  /* 错误提示 */
  .form-error {
    @apply text-sm text-red-600 dark:text-red-400;
  }
  
  /* 帮助文本 */
  .form-help {
    @apply text-sm text-gray-500 dark:text-gray-400;
  }
  
  /* 复选框 */
  .form-checkbox {
    @apply flex items-center gap-2 cursor-pointer;
  }
  
  .form-checkbox input[type="checkbox"] {
    @apply w-4 h-4 text-blue-600 border-gray-300 
           rounded focus:ring-blue-500;
  }
  
  /* 操作按钮 */
  .form-actions {
    @apply flex gap-4 pt-4;
  }
}
</style>
```

### 5. 工具类组件

```css
/* 实用工具类 */
@layer utilities {
  /* 文字渐变 */
  .text-gradient {
    @apply bg-gradient-to-r from-blue-600 to-purple-600 
           bg-clip-text text-transparent;
  }
  
  /* 动画 */
  .animate-fade-in {
    animation: fadeIn 0.5s ease-in-out;
  }
  
  .animate-slide-up {
    animation: slideUp 0.5s ease-out;
  }
  
  .animate-scale-in {
    animation: scaleIn 0.3s ease-out;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes slideUp {
    from { 
      opacity: 0;
      transform: translateY(20px);
    }
    to { 
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes scaleIn {
    from { 
      opacity: 0;
      transform: scale(0.9);
    }
    to { 
      opacity: 1;
      transform: scale(1);
    }
  }
  
  /* 滚动条样式 */
  .custom-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: theme('colors.gray.400') transparent;
  }
  
  .custom-scrollbar::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb {
    @apply bg-gray-400 dark:bg-gray-600 rounded-full;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    @apply bg-gray-500 dark:bg-gray-500;
  }
  
  /* 背景效果 */
  .bg-dots {
    background-image: radial-gradient(circle, #e5e7eb 1px, transparent 1px);
    background-size: 20px 20px;
  }
  
  .bg-grid {
    background-image: 
      linear-gradient(to right, #e5e7eb 1px, transparent 1px),
      linear-gradient(to bottom, #e5e7eb 1px, transparent 1px);
    background-size: 20px 20px;
  }
  
  /* 玻璃态效果 */
  .glass {
    @apply bg-white/70 dark:bg-gray-900/70 backdrop-blur-lg;
  }
  
  /* 光晕效果 */
  .glow {
    box-shadow: 0 0 20px theme('colors.blue.500/20');
  }
  
  .glow-hover {
    @apply transition-all duration-300;
  }
  
  .glow-hover:hover {
    box-shadow: 0 0 30px theme('colors.blue.500/40');
  }
}
```

### 6. 响应式网格系统

```html
<!-- 项目展示网格 -->
<div class="project-grid">
  <div class="project-item">项目1</div>
  <div class="project-item">项目2</div>
  <div class="project-item">项目3</div>
  <div class="project-item">项目4</div>
  <div class="project-item">项目5</div>
  <div class="project-item">项目6</div>
</div>

<style>
@layer components {
  /* 自适应网格 */
  .project-grid {
    @apply grid gap-6;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  }
  
  /* Masonry布局 */
  .masonry-grid {
    column-count: 1;
    column-gap: 1.5rem;
  }
  
  @screen sm {
    .masonry-grid {
      column-count: 2;
    }
  }
  
  @screen lg {
    .masonry-grid {
      column-count: 3;
    }
  }
  
  .masonry-item {
    @apply mb-6;
    break-inside: avoid;
  }
}
</style>
```

这个组件库提供了构建现代化作品集网站所需的所有UI组件，包括按钮系统、卡片、导航、表单和各种实用工具类。所有组件都支持深色模式和响应式设计。