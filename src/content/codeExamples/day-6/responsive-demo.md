---
title: "Tailwind CSS 响应式设计"
description: "展示如何使用Tailwind实现响应式设计"
---

# Tailwind CSS 响应式设计示例

## 完整示例代码

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tailwind CSS 响应式设计示例</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100">
    <!-- 响应式导航栏 -->
    <nav class="bg-white shadow-lg">
        <div class="max-w-7xl mx-auto px-4">
            <div class="flex justify-between">
                <div class="flex space-x-7">
                    <!-- Logo -->
                    <div class="flex items-center py-4">
                        <span class="font-semibold text-gray-800 text-lg">Logo</span>
                    </div>
                    <!-- 桌面端导航 -->
                    <div class="hidden md:flex items-center space-x-1">
                        <a href="#" class="py-4 px-2 text-gray-700 hover:text-blue-500 
                                       border-b-2 border-transparent hover:border-blue-500 
                                       transition duration-300">
                            首页
                        </a>
                        <a href="#" class="py-4 px-2 text-gray-700 hover:text-blue-500 
                                       transition duration-300">
                            产品
                        </a>
                        <a href="#" class="py-4 px-2 text-gray-700 hover:text-blue-500 
                                       transition duration-300">
                            关于
                        </a>
                        <a href="#" class="py-4 px-2 text-gray-700 hover:text-blue-500 
                                       transition duration-300">
                            联系
                        </a>
                    </div>
                </div>
                <!-- 移动端菜单按钮 -->
                <div class="md:hidden flex items-center">
                    <button class="outline-none mobile-menu-button">
                        <svg class="w-6 h-6 text-gray-700 hover:text-blue-500"
                             fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" 
                                  stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
        <!-- 移动端菜单 -->
        <div class="hidden mobile-menu">
            <ul>
                <li><a href="#" class="block text-sm px-2 py-4 hover:bg-blue-500 
                                     hover:text-white transition duration-300">首页</a></li>
                <li><a href="#" class="block text-sm px-2 py-4 hover:bg-blue-500 
                                     hover:text-white transition duration-300">产品</a></li>
                <li><a href="#" class="block text-sm px-2 py-4 hover:bg-blue-500 
                                     hover:text-white transition duration-300">关于</a></li>
                <li><a href="#" class="block text-sm px-2 py-4 hover:bg-blue-500 
                                     hover:text-white transition duration-300">联系</a></li>
            </ul>
        </div>
    </nav>

    <div class="container mx-auto px-4 py-8">
        <!-- 响应式标题 -->
        <section class="mb-12">
            <h1 class="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold 
                       text-center text-gray-800 mb-4">
                响应式设计示例
            </h1>
            <p class="text-sm sm:text-base md:text-lg text-center text-gray-600">
                调整窗口大小查看响应式效果
            </p>
        </section>

        <!-- 响应式网格布局 -->
        <section class="mb-12">
            <h2 class="text-xl sm:text-2xl font-semibold mb-6 text-gray-700">
                响应式网格系统
            </h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                <div class="bg-blue-500 text-white p-6 rounded-lg text-center">
                    <p class="font-bold">卡片 1</p>
                    <p class="text-sm mt-2">移动端全宽</p>
                    <p class="text-xs mt-1">平板端半宽</p>
                    <p class="text-xs">桌面端1/3宽</p>
                </div>
                <div class="bg-green-500 text-white p-6 rounded-lg text-center">
                    <p class="font-bold">卡片 2</p>
                    <p class="text-sm mt-2">自适应布局</p>
                </div>
                <div class="bg-purple-500 text-white p-6 rounded-lg text-center">
                    <p class="font-bold">卡片 3</p>
                    <p class="text-sm mt-2">响应式设计</p>
                </div>
                <div class="bg-red-500 text-white p-6 rounded-lg text-center">
                    <p class="font-bold">卡片 4</p>
                    <p class="text-sm mt-2">灵活布局</p>
                </div>
            </div>
        </section>

        <!-- 响应式Flexbox -->
        <section class="mb-12">
            <h2 class="text-xl sm:text-2xl font-semibold mb-6 text-gray-700">
                响应式Flexbox布局
            </h2>
            <div class="flex flex-col md:flex-row gap-4">
                <div class="flex-1 bg-indigo-500 text-white p-6 rounded-lg">
                    <h3 class="font-bold mb-2">主要内容</h3>
                    <p class="text-sm">在移动端占满宽度，在桌面端占据更多空间</p>
                </div>
                <div class="w-full md:w-1/3 bg-indigo-700 text-white p-6 rounded-lg">
                    <h3 class="font-bold mb-2">侧边栏</h3>
                    <p class="text-sm">在移动端占满宽度，在桌面端占据1/3宽度</p>
                </div>
            </div>
        </section>

        <!-- 响应式间距 -->
        <section class="mb-12">
            <h2 class="text-xl sm:text-2xl font-semibold mb-6 text-gray-700">
                响应式间距和大小
            </h2>
            <div class="bg-white rounded-lg shadow-lg p-4 sm:p-6 md:p-8 lg:p-10">
                <h3 class="text-lg sm:text-xl md:text-2xl font-semibold mb-4">
                    自适应内边距
                </h3>
                <p class="text-sm sm:text-base md:text-lg mb-4">
                    这个容器的内边距会随着屏幕大小而变化
                </p>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 md:gap-6">
                    <div class="bg-gray-200 p-4 rounded">
                        <p class="text-sm">间距也会自适应</p>
                    </div>
                    <div class="bg-gray-200 p-4 rounded">
                        <p class="text-sm">优化不同设备体验</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- 响应式显示/隐藏 -->
        <section class="mb-12">
            <h2 class="text-xl sm:text-2xl font-semibold mb-6 text-gray-700">
                响应式显示控制
            </h2>
            <div class="space-y-4">
                <div class="bg-red-200 p-4 rounded-lg block sm:hidden">
                    <p class="font-semibold">仅在移动端显示</p>
                    <p class="text-sm">屏幕宽度 < 640px 时可见</p>
                </div>
                <div class="bg-yellow-200 p-4 rounded-lg hidden sm:block md:hidden">
                    <p class="font-semibold">仅在平板端显示</p>
                    <p class="text-sm">640px ≤ 屏幕宽度 < 768px 时可见</p>
                </div>
                <div class="bg-green-200 p-4 rounded-lg hidden md:block lg:hidden">
                    <p class="font-semibold">仅在小型桌面显示</p>
                    <p class="text-sm">768px ≤ 屏幕宽度 < 1024px 时可见</p>
                </div>
                <div class="bg-blue-200 p-4 rounded-lg hidden lg:block">
                    <p class="font-semibold">仅在大型桌面显示</p>
                    <p class="text-sm">屏幕宽度 ≥ 1024px 时可见</p>
                </div>
            </div>
        </section>

        <!-- 响应式表格 -->
        <section class="mb-12">
            <h2 class="text-xl sm:text-2xl font-semibold mb-6 text-gray-700">
                响应式表格
            </h2>
            <div class="overflow-x-auto bg-white rounded-lg shadow">
                <table class="min-w-full">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-4 sm:px-6 py-3 text-left text-xs font-medium 
                                     text-gray-500 uppercase tracking-wider">
                                名称
                            </th>
                            <th class="px-4 sm:px-6 py-3 text-left text-xs font-medium 
                                     text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                                描述
                            </th>
                            <th class="px-4 sm:px-6 py-3 text-left text-xs font-medium 
                                     text-gray-500 uppercase tracking-wider">
                                价格
                            </th>
                            <th class="px-4 sm:px-6 py-3 text-left text-xs font-medium 
                                     text-gray-500 uppercase tracking-wider hidden md:table-cell">
                                状态
                            </th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        <tr>
                            <td class="px-4 sm:px-6 py-4 whitespace-nowrap text-sm">产品 A</td>
                            <td class="px-4 sm:px-6 py-4 text-sm hidden sm:table-cell">
                                这是产品A的描述
                            </td>
                            <td class="px-4 sm:px-6 py-4 whitespace-nowrap text-sm">¥99</td>
                            <td class="px-4 sm:px-6 py-4 whitespace-nowrap hidden md:table-cell">
                                <span class="px-2 inline-flex text-xs leading-5 font-semibold 
                                           rounded-full bg-green-100 text-green-800">
                                    有货
                                </span>
                            </td>
                        </tr>
                        <tr>
                            <td class="px-4 sm:px-6 py-4 whitespace-nowrap text-sm">产品 B</td>
                            <td class="px-4 sm:px-6 py-4 text-sm hidden sm:table-cell">
                                这是产品B的描述
                            </td>
                            <td class="px-4 sm:px-6 py-4 whitespace-nowrap text-sm">¥149</td>
                            <td class="px-4 sm:px-6 py-4 whitespace-nowrap hidden md:table-cell">
                                <span class="px-2 inline-flex text-xs leading-5 font-semibold 
                                           rounded-full bg-red-100 text-red-800">
                                    缺货
                                </span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </section>

        <!-- 响应式卡片布局 -->
        <section class="mb-12">
            <h2 class="text-xl sm:text-2xl font-semibold mb-6 text-gray-700">
                响应式卡片组件
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <!-- 卡片1 -->
                <div class="bg-white rounded-lg shadow-md overflow-hidden 
                          hover:shadow-xl transition-shadow duration-300">
                    <div class="h-48 bg-gradient-to-r from-blue-400 to-blue-600"></div>
                    <div class="p-4 sm:p-6">
                        <h3 class="text-lg sm:text-xl font-semibold mb-2">响应式卡片标题</h3>
                        <p class="text-sm sm:text-base text-gray-600 mb-4">
                            这是一个响应式卡片组件，会根据屏幕大小自动调整布局和间距。
                        </p>
                        <button class="w-full sm:w-auto px-4 py-2 bg-blue-500 text-white 
                                     rounded hover:bg-blue-600 transition duration-300">
                            查看详情
                        </button>
                    </div>
                </div>
                <!-- 卡片2 -->
                <div class="bg-white rounded-lg shadow-md overflow-hidden 
                          hover:shadow-xl transition-shadow duration-300">
                    <div class="h-48 bg-gradient-to-r from-green-400 to-green-600"></div>
                    <div class="p-4 sm:p-6">
                        <h3 class="text-lg sm:text-xl font-semibold mb-2">灵活的布局系统</h3>
                        <p class="text-sm sm:text-base text-gray-600 mb-4">
                            Tailwind CSS让响应式设计变得简单直观，只需要添加相应的前缀即可。
                        </p>
                        <button class="w-full sm:w-auto px-4 py-2 bg-green-500 text-white 
                                     rounded hover:bg-green-600 transition duration-300">
                            了解更多
                        </button>
                    </div>
                </div>
                <!-- 卡片3 -->
                <div class="bg-white rounded-lg shadow-md overflow-hidden 
                          hover:shadow-xl transition-shadow duration-300 
                          md:col-span-2 lg:col-span-1">
                    <div class="h-48 bg-gradient-to-r from-purple-400 to-purple-600"></div>
                    <div class="p-4 sm:p-6">
                        <h3 class="text-lg sm:text-xl font-semibold mb-2">移动优先设计</h3>
                        <p class="text-sm sm:text-base text-gray-600 mb-4">
                            从移动端开始设计，逐步增强到更大的屏幕，确保所有设备上的体验。
                        </p>
                        <button class="w-full sm:w-auto px-4 py-2 bg-purple-500 text-white 
                                     rounded hover:bg-purple-600 transition duration-300">
                            开始使用
                        </button>
                    </div>
                </div>
            </div>
        </section>

        <!-- 断点提示器 -->
        <div class="fixed bottom-4 right-4 bg-black text-white px-4 py-2 rounded-lg 
                  text-sm font-mono">
            <span class="sm:hidden">xs (< 640px)</span>
            <span class="hidden sm:inline md:hidden">sm (640px - 767px)</span>
            <span class="hidden md:inline lg:hidden">md (768px - 1023px)</span>
            <span class="hidden lg:inline xl:hidden">lg (1024px - 1279px)</span>
            <span class="hidden xl:inline 2xl:hidden">xl (1280px - 1535px)</span>
            <span class="hidden 2xl:inline">2xl (≥ 1536px)</span>
        </div>
    </div>

    <script>
        // 移动端菜单切换
        const btn = document.querySelector("button.mobile-menu-button");
        const menu = document.querySelector(".mobile-menu");

        btn.addEventListener("click", () => {
            menu.classList.toggle("hidden");
        });
    </script>
</body>
</html>
```

## 响应式设计关键概念

### 1. 断点系统
```css
/* Tailwind CSS 默认断点 */
sm: 640px   /* 小屏幕（平板竖屏） */
md: 768px   /* 中等屏幕（平板横屏） */
lg: 1024px  /* 大屏幕（笔记本） */
xl: 1280px  /* 超大屏幕（桌面） */
2xl: 1536px /* 超大桌面屏幕 */
```

### 2. 移动优先原则
- 默认样式适用于所有屏幕
- 使用断点前缀逐步增强
- 例如：`text-sm md:text-base lg:text-lg`

### 3. 常用响应式模式

#### 网格列数变化
```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  <!-- 移动端1列，平板2列，桌面3列 -->
</div>
```

#### Flex方向变化
```html
<div class="flex flex-col md:flex-row">
  <!-- 移动端垂直排列，桌面端水平排列 -->
</div>
```

#### 显示/隐藏元素
```html
<div class="hidden md:block">桌面端显示</div>
<div class="block md:hidden">移动端显示</div>
```

#### 间距自适应
```html
<div class="p-4 md:p-6 lg:p-8">
  <!-- 随屏幕变大增加内边距 -->
</div>
```

### 4. 响应式技巧
- 使用容器类：`container mx-auto px-4`
- 文字大小渐进：`text-sm md:text-base lg:text-lg`
- 灵活宽度：`w-full md:w-1/2 lg:w-1/3`
- 条件显示：结合 `hidden` 和 `block`