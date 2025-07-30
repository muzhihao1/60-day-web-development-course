---
day: 6
title: "Tailwind CSS组件示例集合"
description: "展示各种常用UI组件的Tailwind CSS实现方式"
category: "components"
language: "html"
---

# Tailwind CSS组件示例集合

这个示例展示了使用Tailwind CSS创建各种常用UI组件的方法，包括按钮、卡片、表单、导航等。

## 完整代码

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tailwind CSS 组件示例集合</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        /* 使用@layer和@apply创建可复用组件类 */
        @layer components {
            .btn {
                @apply px-4 py-2 rounded font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2;
            }
            
            .btn-primary {
                @apply btn bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500;
            }
            
            .btn-secondary {
                @apply btn bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500;
            }
            
            .btn-danger {
                @apply btn bg-red-600 text-white hover:bg-red-700 focus:ring-red-500;
            }
            
            .card {
                @apply bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300;
            }
            
            .form-input {
                @apply w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent;
            }
            
            .badge {
                @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium;
            }
        }
    </style>
</head>
<body class="bg-gray-50">
    <div class="container mx-auto px-4 py-8 max-w-7xl">
        <h1 class="text-4xl font-bold text-center mb-12 text-gray-800">Tailwind CSS 组件示例</h1>
        
        <!-- 按钮组件部分... -->
        <!-- 卡片组件部分... -->
        <!-- 表单组件部分... -->
        <!-- 导航组件部分... -->
        <!-- 标记和标签部分... -->
        <!-- 警告和通知部分... -->
        <!-- 模态框部分... -->
        <!-- 进度条部分... -->
    </div>
</body>
</html>
```

## 关键组件示例

### 1. 按钮组件

#### 基础按钮
```html
<!-- 使用@apply创建的可复用按钮类 -->
<button class="btn-primary">主要按钮</button>
<button class="btn-secondary">次要按钮</button>
<button class="btn-danger">危险按钮</button>

<!-- 直接使用工具类 -->
<button class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">成功按钮</button>
```

#### 按钮尺寸
```html
<button class="px-2 py-1 text-xs bg-blue-600 text-white rounded">极小</button>
<button class="px-3 py-1.5 text-sm bg-blue-600 text-white rounded">小号</button>
<button class="px-4 py-2 bg-blue-600 text-white rounded">默认</button>
<button class="px-6 py-3 text-lg bg-blue-600 text-white rounded">大号</button>
```

#### 加载状态按钮
```html
<button class="px-4 py-2 bg-blue-600 text-white rounded flex items-center">
    <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    加载中...
</button>
```

### 2. 卡片组件

#### 基础卡片
```html
<div class="card">
    <h3 class="text-xl font-semibold mb-2">基础卡片</h3>
    <p class="text-gray-600 mb-4">这是一个使用@apply创建的可复用卡片组件。</p>
    <button class="btn-primary">了解更多</button>
</div>
```

#### 图片卡片
```html
<div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
    <img src="image.jpg" alt="产品" class="w-full h-48 object-cover">
    <div class="p-6">
        <h3 class="text-xl font-semibold mb-2">图片卡片</h3>
        <p class="text-gray-600 mb-4">包含图片的卡片组件示例。</p>
        <div class="flex justify-between items-center">
            <span class="text-2xl font-bold text-blue-600">¥199</span>
            <button class="btn-primary">添加到购物车</button>
        </div>
    </div>
</div>
```

### 3. 表单组件

#### 输入框
```html
<div>
    <label class="block text-sm font-medium text-gray-700 mb-2">文本输入框</label>
    <input type="text" placeholder="请输入文本" class="form-input">
</div>
```

#### 选择框
```html
<select class="form-input">
    <option>请选择选项</option>
    <option>选项 1</option>
    <option>选项 2</option>
</select>
```

#### 开关组件
```html
<button type="button" 
    class="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    onclick="this.classList.toggle('bg-blue-600'); this.querySelector('span').classList.toggle('translate-x-6')">
    <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1"></span>
</button>
```

### 4. 导航组件

#### 水平导航
```html
<nav class="flex space-x-1 p-2">
    <a href="#" class="px-4 py-2 rounded-md bg-blue-600 text-white">首页</a>
    <a href="#" class="px-4 py-2 rounded-md text-gray-700 hover:bg-gray-100">产品</a>
    <a href="#" class="px-4 py-2 rounded-md text-gray-700 hover:bg-gray-100">服务</a>
</nav>
```

#### 面包屑导航
```html
<nav class="flex" aria-label="Breadcrumb">
    <ol class="flex items-center space-x-2">
        <li><a href="#" class="text-gray-500 hover:text-gray-700">首页</a></li>
        <li><span class="mx-2 text-gray-400">/</span></li>
        <li><a href="#" class="text-gray-500 hover:text-gray-700">产品</a></li>
        <li><span class="mx-2 text-gray-400">/</span></li>
        <li><span class="text-gray-700">详情页</span></li>
    </ol>
</nav>
```

### 5. 标记和标签

#### 状态标签
```html
<span class="badge bg-green-100 text-green-800">成功</span>
<span class="badge bg-red-100 text-red-800">错误</span>
<span class="badge bg-yellow-100 text-yellow-800">警告</span>
<span class="badge bg-blue-100 text-blue-800">信息</span>
```

#### 计数标签
```html
<button class="relative">
    <svg class="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <!-- 图标内容 -->
    </svg>
    <span class="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">3</span>
</button>
```

### 6. 警告和通知

#### 成功提示
```html
<div class="bg-green-50 border-l-4 border-green-500 p-4 rounded">
    <div class="flex items-center">
        <svg class="h-5 w-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <p class="text-green-700">
            <strong>成功！</strong> 您的操作已成功完成。
        </p>
    </div>
</div>
```

### 7. 模态框

```html
<!-- 触发按钮 -->
<button onclick="document.getElementById('modal').classList.remove('hidden')" class="btn-primary">
    打开模态框
</button>

<!-- 模态框结构 -->
<div id="modal" class="hidden fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
    <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
            <h3 class="text-lg font-medium leading-6 text-gray-900 mb-4">模态框标题</h3>
            <p class="text-sm text-gray-500 mb-4">模态框内容</p>
            <div class="flex gap-4 justify-end">
                <button onclick="document.getElementById('modal').classList.add('hidden')" class="btn-secondary">取消</button>
                <button class="btn-primary">确认</button>
            </div>
        </div>
    </div>
</div>
```

### 8. 进度条

#### 基础进度条
```html
<div>
    <div class="flex justify-between mb-1">
        <span class="text-sm font-medium text-gray-700">基础进度条</span>
        <span class="text-sm font-medium text-gray-700">70%</span>
    </div>
    <div class="w-full bg-gray-200 rounded-full h-2.5">
        <div class="bg-blue-600 h-2.5 rounded-full" style="width: 70%"></div>
    </div>
</div>
```

#### 动画进度条
```html
<div class="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
    <div class="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full animate-pulse" style="width: 75%"></div>
</div>
```

## 使用技巧

1. **组件化思维**：使用`@apply`创建可复用的组件类
2. **状态管理**：利用JavaScript切换类名实现交互效果
3. **响应式设计**：在组件中使用响应式前缀适配不同屏幕
4. **动画效果**：结合`transition`和`animate`类创建流畅的动画
5. **无障碍性**：添加适当的ARIA属性提升可访问性