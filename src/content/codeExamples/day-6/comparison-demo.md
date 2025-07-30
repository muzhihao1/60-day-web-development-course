---
day: 6
title: "传统CSS vs Tailwind CSS对比"
description: "展示传统CSS和Tailwind CSS两种开发方式的对比"
category: "comparison"
language: "html"
---

# 传统CSS vs Tailwind CSS对比演示

这个示例展示了使用传统CSS和Tailwind CSS创建相同产品卡片的不同方法。

## 完整代码

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>传统CSS vs Tailwind CSS对比</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        /* 传统CSS方式 */
        .traditional-card {
            display: flex;
            flex-direction: column;
            padding: 1.5rem;
            background-color: white;
            border-radius: 0.5rem;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            transition: box-shadow 0.3s ease;
            margin-bottom: 2rem;
        }
        
        .traditional-card:hover {
            box-shadow: 0 10px 15px rgba(0,0,0,0.1);
        }
        
        .traditional-title {
            font-size: 1.25rem;
            font-weight: 600;
            color: #1a202c;
            margin-bottom: 0.5rem;
        }
        
        .traditional-description {
            font-size: 0.875rem;
            color: #718096;
            margin-bottom: 1rem;
            line-height: 1.5;
        }
        
        .traditional-price {
            font-size: 1.5rem;
            font-weight: 700;
            color: #3182ce;
            margin-bottom: 1rem;
        }
        
        .traditional-button {
            display: inline-block;
            padding: 0.5rem 1rem;
            background-color: #3182ce;
            color: white;
            border-radius: 0.375rem;
            text-decoration: none;
            font-weight: 500;
            text-align: center;
            transition: background-color 0.2s ease;
        }
        
        .traditional-button:hover {
            background-color: #2563eb;
        }
    </style>
</head>
<body class="bg-gray-100">
    <div class="max-w-6xl mx-auto p-8">
        <h1 class="text-3xl font-bold mb-8 text-center">传统CSS vs Tailwind CSS 对比演示</h1>
        
        <!-- 传统CSS示例 -->
        <section class="mb-12">
            <h2 class="text-2xl font-bold mb-4 text-gray-800">传统CSS方式</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div class="traditional-card">
                    <h3 class="traditional-title">高级JavaScript课程</h3>
                    <p class="traditional-description">
                        深入学习JavaScript的高级特性，包括闭包、原型链、异步编程等核心概念。
                    </p>
                    <p class="traditional-price">¥299.00</p>
                    <a href="#" class="traditional-button">立即购买</a>
                </div>
            </div>
        </section>
        
        <!-- Tailwind CSS示例 -->
        <section class="mb-12">
            <h2 class="text-2xl font-bold mb-4 text-gray-800">Tailwind CSS方式</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div class="flex flex-col p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-300">
                    <h3 class="text-xl font-semibold text-gray-800 mb-2">高级JavaScript课程</h3>
                    <p class="text-sm text-gray-600 mb-4 leading-relaxed">
                        深入学习JavaScript的高级特性，包括闭包、原型链、异步编程等核心概念。
                    </p>
                    <p class="text-2xl font-bold text-blue-600 mb-4">¥299.00</p>
                    <a href="#" class="inline-block px-4 py-2 bg-blue-600 text-white rounded-md font-medium text-center hover:bg-blue-700 transition-colors duration-200">
                        立即购买
                    </a>
                </div>
            </div>
        </section>
    </div>
</body>
</html>
```

## 关键对比点

### 传统CSS方式
```css
/* 需要单独的CSS文件 */
.traditional-card {
    display: flex;
    flex-direction: column;
    padding: 1.5rem;
    background-color: white;
    border-radius: 0.5rem;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}
```

```html
<!-- HTML结构 -->
<div class="traditional-card">
    <h3 class="traditional-title">产品标题</h3>
    <p class="traditional-description">产品描述</p>
    <p class="traditional-price">¥299.00</p>
    <a href="#" class="traditional-button">立即购买</a>
</div>
```

### Tailwind CSS方式
```html
<!-- 不需要CSS文件，直接在HTML中使用工具类 -->
<div class="flex flex-col p-6 bg-white rounded-lg shadow hover:shadow-lg">
    <h3 class="text-xl font-semibold text-gray-800 mb-2">产品标题</h3>
    <p class="text-sm text-gray-600 mb-4">产品描述</p>
    <p class="text-2xl font-bold text-blue-600 mb-4">¥299.00</p>
    <a href="#" class="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
        立即购买
    </a>
</div>
```

## 主要区别

1. **开发速度**
   - 传统CSS：需要在HTML和CSS文件间切换
   - Tailwind：直接在HTML中编写样式

2. **命名负担**
   - 传统CSS：需要思考类名命名
   - Tailwind：使用预定义的工具类

3. **文件大小**
   - 传统CSS：随项目增长而增长
   - Tailwind：生产环境自动优化，移除未使用的CSS

4. **设计一致性**
   - 传统CSS：依赖团队规范
   - Tailwind：框架内置的设计系统保证一致性

5. **可维护性**
   - 传统CSS：样式分散在不同文件
   - Tailwind：样式和结构在同一位置