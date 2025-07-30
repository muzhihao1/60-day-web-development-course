---
day: 6
title: "Tailwind CSS响应式设计示例"
description: "展示Tailwind CSS响应式设计的完整实现，包括导航、网格、间距等"
category: "responsive"
language: "html"
---

# Tailwind CSS响应式设计示例

这个示例展示了如何使用Tailwind CSS创建完全响应式的网页，包括响应式导航、网格布局、间距控制和暗色模式。

## 完整代码

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tailwind CSS 响应式设计示例</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            darkMode: 'class'
        }
    </script>
</head>
<body class="bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
    <!-- 内容见下方示例代码 -->
</body>
</html>
```

## 响应式断点

Tailwind CSS使用以下默认断点：

| 前缀 | 最小宽度 | CSS |
|------|----------|-----|
| `sm` | 640px | `@media (min-width: 640px) { ... }` |
| `md` | 768px | `@media (min-width: 768px) { ... }` |
| `lg` | 1024px | `@media (min-width: 1024px) { ... }` |
| `xl` | 1280px | `@media (min-width: 1280px) { ... }` |
| `2xl` | 1536px | `@media (min-width: 1536px) { ... }` |

## 关键响应式组件

### 1. 响应式导航栏

```html
<nav class="bg-white dark:bg-gray-800 shadow-lg">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
            <!-- Logo -->
            <div class="flex-shrink-0 flex items-center">
                <span class="text-xl font-bold text-gray-800 dark:text-white">响应式网站</span>
            </div>
            
            <!-- 桌面端导航菜单 -->
            <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
                <a href="#" class="text-gray-900 dark:text-white inline-flex items-center px-1 pt-1 border-b-2 border-indigo-500 text-sm font-medium">
                    首页
                </a>
                <a href="#" class="text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-gray-300 text-sm font-medium">
                    产品
                </a>
            </div>
            
            <!-- 移动端菜单按钮 -->
            <button onclick="toggleMobileMenu()" class="sm:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none">
                <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                </svg>
            </button>
        </div>
    </div>
    
    <!-- 移动端菜单 -->
    <div id="mobile-menu" class="hidden sm:hidden">
        <div class="pt-2 pb-3 space-y-1">
            <a href="#" class="bg-indigo-50 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200 block pl-3 pr-4 py-2 text-base font-medium">首页</a>
            <a href="#" class="text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 block pl-3 pr-4 py-2 text-base font-medium">产品</a>
        </div>
    </div>
</nav>
```

### 2. 响应式标题

```html
<!-- 文字大小根据屏幕变化 -->
<h1 class="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-center text-gray-800 dark:text-white">
    响应式设计演示
</h1>
```

### 3. 断点指示器

```html
<!-- 显示当前屏幕断点 -->
<div class="text-center">
    <span class="inline-block px-4 py-2 rounded-full bg-red-500 text-white sm:hidden">XS (< 640px)</span>
    <span class="hidden sm:inline-block md:hidden px-4 py-2 rounded-full bg-orange-500 text-white">SM (640px - 768px)</span>
    <span class="hidden md:inline-block lg:hidden px-4 py-2 rounded-full bg-yellow-500 text-white">MD (768px - 1024px)</span>
    <span class="hidden lg:inline-block xl:hidden px-4 py-2 rounded-full bg-green-500 text-white">LG (1024px - 1280px)</span>
    <span class="hidden xl:inline-block 2xl:hidden px-4 py-2 rounded-full bg-blue-500 text-white">XL (1280px - 1536px)</span>
    <span class="hidden 2xl:inline-block px-4 py-2 rounded-full bg-purple-500 text-white">2XL (> 1536px)</span>
</div>
```

### 4. 响应式网格

```html
<!-- 列数根据屏幕大小变化 -->
<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
    <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 class="font-semibold text-gray-800 dark:text-white mb-2">卡片 1</h3>
        <p class="text-gray-600 dark:text-gray-300 text-sm">
            移动端：全宽<br>
            平板：半宽<br>
            桌面：1/4宽
        </p>
    </div>
    <!-- 更多卡片... -->
</div>
```

### 5. 响应式间距

```html
<!-- 内边距根据屏幕大小变化 -->
<div class="bg-white dark:bg-gray-800 p-4 sm:p-6 md:p-8 lg:p-10 rounded-lg shadow">
    <p class="text-gray-600 dark:text-gray-300">
        这个容器的内边距会根据屏幕大小变化：<br>
        移动端：p-4 (1rem)<br>
        小屏幕：p-6 (1.5rem)<br>
        中屏幕：p-8 (2rem)<br>
        大屏幕：p-10 (2.5rem)
    </p>
</div>
```

### 6. 响应式显示/隐藏

```html
<!-- 根据屏幕大小显示不同内容 -->
<div class="space-y-4">
    <div class="bg-red-200 p-4 rounded-lg sm:hidden">
        <p class="font-medium">仅在移动端显示（< 640px）</p>
    </div>
    <div class="hidden sm:block md:hidden bg-orange-200 p-4 rounded-lg">
        <p class="font-medium">仅在小屏幕显示（640px - 768px）</p>
    </div>
    <div class="hidden md:block lg:hidden bg-yellow-200 p-4 rounded-lg">
        <p class="font-medium">仅在中屏幕显示（768px - 1024px）</p>
    </div>
</div>
```

### 7. 响应式Flex布局

```html
<!-- Flex方向根据屏幕变化 -->
<div class="flex flex-col sm:flex-row gap-4">
    <div class="flex-1 bg-purple-200 dark:bg-purple-800 p-6 rounded-lg">
        <h3 class="font-semibold text-gray-800 dark:text-white mb-2">侧边栏</h3>
        <p class="text-sm text-gray-600 dark:text-gray-300">
            移动端：垂直排列<br>
            桌面端：水平排列
        </p>
    </div>
    <div class="flex-1 sm:flex-2 md:flex-3 bg-purple-300 dark:bg-purple-700 p-6 rounded-lg">
        <h3 class="font-semibold text-gray-800 dark:text-white mb-2">主要内容</h3>
        <p class="text-sm text-gray-600 dark:text-gray-300">占据更多空间</p>
    </div>
</div>
```

### 8. 响应式表单

```html
<form class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">姓名</label>
            <input type="text" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white">
        </div>
        <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">邮箱</label>
            <input type="email" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white">
        </div>
        <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">消息</label>
            <textarea rows="4" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"></textarea>
        </div>
    </div>
    <div class="mt-6 flex flex-col sm:flex-row gap-4">
        <button type="submit" class="flex-1 sm:flex-none bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition duration-300">
            提交
        </button>
        <button type="reset" class="flex-1 sm:flex-none bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-white px-6 py-2 rounded-md hover:bg-gray-400 dark:hover:bg-gray-700 transition duration-300">
            重置
        </button>
    </div>
</form>
```

### 9. 响应式图片

```html
<!-- 图片自适应容器宽度 -->
<img src="example.jpg" 
     alt="示例图片" 
     class="w-full h-auto rounded-lg shadow">

<!-- 16:9 响应式视频容器 -->
<div class="relative pb-[56.25%] bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
    <div class="absolute inset-0 flex items-center justify-center">
        <span class="text-gray-500 dark:text-gray-400">16:9 视频占位符</span>
    </div>
</div>
```

## JavaScript功能

```javascript
// 主题切换
function toggleTheme() {
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', 
        document.documentElement.classList.contains('dark') ? 'dark' : 'light'
    );
}

// 移动端菜单切换
function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    menu.classList.toggle('hidden');
}

// 初始化主题
if (localStorage.getItem('theme') === 'dark' || 
    (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
}
```

## 响应式设计最佳实践

1. **移动优先**：从小屏幕开始设计，逐步添加大屏幕样式
2. **断点选择**：使用Tailwind预设断点，保持一致性
3. **内容优先**：根据内容需求选择断点，而不是设备
4. **测试验证**：在真实设备上测试，不只依赖浏览器调试工具
5. **性能考虑**：避免在小屏幕上加载大图片，使用响应式图片