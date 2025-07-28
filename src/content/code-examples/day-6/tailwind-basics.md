---
title: "Tailwind CSS基础工具类示例"
description: "展示Tailwind CSS核心工具类的使用方法，包括布局、间距、颜色、文字等"
category: "basics"
language: "html"
---

# Tailwind CSS基础工具类示例

这个示例全面展示了Tailwind CSS的核心工具类，帮助你快速掌握基础用法。

## 完整代码

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tailwind CSS 基础示例</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50">
    <div class="container mx-auto px-4 py-8 max-w-6xl">
        <h1 class="text-4xl font-bold text-center mb-12 text-gray-800">Tailwind CSS 基础工具类示例</h1>
        <!-- 各个示例部分 -->
    </div>
</body>
</html>
```

## 核心工具类详解

### 1. 布局 (Layout)

#### Flexbox布局
```html
<!-- 等分布局 -->
<div class="flex gap-4">
    <div class="flex-1 bg-blue-200 p-4 rounded">flex-1</div>
    <div class="flex-1 bg-blue-300 p-4 rounded">flex-1</div>
    <div class="flex-1 bg-blue-400 p-4 rounded">flex-1</div>
</div>

<!-- 对齐方式 -->
<div class="flex justify-between items-center">
    <div class="bg-green-200 p-4 rounded">左对齐</div>
    <div class="bg-green-300 p-4 rounded">居中</div>
    <div class="bg-green-400 p-4 rounded">右对齐</div>
</div>
```

#### Grid布局
```html
<!-- 3列网格 -->
<div class="grid grid-cols-3 gap-4">
    <div class="bg-purple-200 p-4 rounded">1</div>
    <div class="bg-purple-300 p-4 rounded">2</div>
    <div class="bg-purple-400 p-4 rounded">3</div>
    <div class="bg-purple-200 p-4 rounded col-span-2">跨2列</div>
    <div class="bg-purple-300 p-4 rounded">6</div>
</div>
```

### 2. 间距 (Spacing)

#### Padding示例
```html
<div class="space-y-4">
    <div class="bg-indigo-100 p-2 rounded">p-2 (0.5rem)</div>
    <div class="bg-indigo-200 p-4 rounded">p-4 (1rem)</div>
    <div class="bg-indigo-300 p-6 rounded">p-6 (1.5rem)</div>
    <div class="bg-indigo-400 px-8 py-2 rounded text-white">px-8 py-2</div>
</div>
```

#### Margin示例
```html
<div class="bg-gray-100 p-4 rounded">
    <div class="bg-pink-200 p-4 mb-2 rounded">mb-2</div>
    <div class="bg-pink-300 p-4 mb-4 rounded">mb-4</div>
    <div class="bg-pink-400 p-4 rounded">最后一个元素</div>
</div>
```

### 3. 颜色 (Colors)

#### 背景颜色
```html
<div class="grid grid-cols-4 gap-4">
    <div class="bg-red-500 text-white p-4 rounded text-center">bg-red-500</div>
    <div class="bg-blue-500 text-white p-4 rounded text-center">bg-blue-500</div>
    <div class="bg-green-500 text-white p-4 rounded text-center">bg-green-500</div>
    <div class="bg-yellow-500 text-white p-4 rounded text-center">bg-yellow-500</div>
</div>
```

#### 文字颜色
```html
<div class="space-y-2">
    <p class="text-red-600 font-medium">text-red-600 - 红色文字</p>
    <p class="text-blue-600 font-medium">text-blue-600 - 蓝色文字</p>
    <p class="text-green-600 font-medium">text-green-600 - 绿色文字</p>
    <p class="text-gray-600 font-medium">text-gray-600 - 灰色文字</p>
</div>
```

#### 渐变背景
```html
<div class="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-white p-8 rounded-lg text-center font-bold text-xl">
    渐变背景示例
</div>
```

### 4. 文字样式 (Typography)

#### 字体大小
```html
<div class="space-y-2">
    <p class="text-xs">text-xs - 极小文字 (0.75rem)</p>
    <p class="text-sm">text-sm - 小号文字 (0.875rem)</p>
    <p class="text-base">text-base - 基础大小 (1rem)</p>
    <p class="text-lg">text-lg - 大号文字 (1.125rem)</p>
    <p class="text-xl">text-xl - 加大文字 (1.25rem)</p>
    <p class="text-2xl">text-2xl - 2倍大小 (1.5rem)</p>
    <p class="text-3xl">text-3xl - 3倍大小 (1.875rem)</p>
</div>
```

#### 字体粗细
```html
<div class="space-y-2">
    <p class="font-thin">font-thin - 极细体</p>
    <p class="font-light">font-light - 细体</p>
    <p class="font-normal">font-normal - 正常</p>
    <p class="font-medium">font-medium - 中等</p>
    <p class="font-semibold">font-semibold - 半粗体</p>
    <p class="font-bold">font-bold - 粗体</p>
    <p class="font-extrabold">font-extrabold - 特粗体</p>
</div>
```

#### 文字装饰
```html
<div class="space-y-2">
    <p class="italic">italic - 斜体文字</p>
    <p class="underline">underline - 下划线文字</p>
    <p class="line-through">line-through - 删除线文字</p>
    <p class="uppercase">uppercase - 大写转换</p>
    <p class="lowercase">LOWERCASE - 小写转换</p>
    <p class="capitalize">capitalize - 首字母大写</p>
</div>
```

### 5. 边框和圆角 (Borders)

#### 边框宽度
```html
<div class="grid grid-cols-4 gap-4">
    <div class="border border-gray-400 p-4 text-center">border</div>
    <div class="border-2 border-gray-400 p-4 text-center">border-2</div>
    <div class="border-4 border-gray-400 p-4 text-center">border-4</div>
    <div class="border-8 border-gray-400 p-4 text-center">border-8</div>
</div>
```

#### 圆角
```html
<div class="grid grid-cols-4 gap-4">
    <div class="bg-blue-200 p-4 rounded-none text-center">rounded-none</div>
    <div class="bg-blue-300 p-4 rounded text-center">rounded</div>
    <div class="bg-blue-400 p-4 rounded-lg text-center">rounded-lg</div>
    <div class="bg-blue-500 p-4 rounded-full text-center text-white">rounded-full</div>
</div>
```

#### 边框样式
```html
<div class="grid grid-cols-3 gap-4">
    <div class="border-2 border-solid border-gray-400 p-4 text-center">border-solid</div>
    <div class="border-2 border-dashed border-gray-400 p-4 text-center">border-dashed</div>
    <div class="border-2 border-dotted border-gray-400 p-4 text-center">border-dotted</div>
</div>
```

### 6. 效果 (Effects)

#### 阴影
```html
<div class="grid grid-cols-3 gap-6">
    <div class="bg-white p-6 rounded shadow-sm">shadow-sm</div>
    <div class="bg-white p-6 rounded shadow">shadow</div>
    <div class="bg-white p-6 rounded shadow-md">shadow-md</div>
    <div class="bg-white p-6 rounded shadow-lg">shadow-lg</div>
    <div class="bg-white p-6 rounded shadow-xl">shadow-xl</div>
    <div class="bg-white p-6 rounded shadow-2xl">shadow-2xl</div>
</div>
```

#### 透明度
```html
<div class="grid grid-cols-5 gap-4">
    <div class="bg-blue-500 p-4 rounded text-white text-center opacity-100">100%</div>
    <div class="bg-blue-500 p-4 rounded text-white text-center opacity-75">75%</div>
    <div class="bg-blue-500 p-4 rounded text-white text-center opacity-50">50%</div>
    <div class="bg-blue-500 p-4 rounded text-white text-center opacity-25">25%</div>
    <div class="bg-blue-500 p-4 rounded text-white text-center opacity-0">0%</div>
</div>
```

### 7. 交互状态 (Interactive States)

```html
<!-- Hover效果 -->
<button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300">
    Hover效果按钮
</button>

<!-- Active效果 -->
<button class="bg-green-500 active:bg-green-700 text-white font-bold py-2 px-4 rounded">
    Active效果按钮（点击试试）
</button>

<!-- Focus效果 -->
<input type="text" placeholder="Focus效果输入框" 
       class="border border-gray-300 focus:border-blue-500 focus:outline-none px-4 py-2 rounded">

<!-- Group状态 -->
<div class="group bg-gray-100 p-4 rounded hover:bg-gray-200 cursor-pointer">
    <p class="group-hover:text-blue-600 font-medium">鼠标悬停父元素，子元素变色</p>
    <p class="text-sm text-gray-600 group-hover:text-gray-800">子元素也会响应</p>
</div>
```

### 8. 动画 (Animations)

```html
<div class="grid grid-cols-4 gap-6 text-center">
    <div>
        <div class="animate-spin bg-blue-500 text-white p-4 rounded-lg inline-block">旋转</div>
        <p class="text-sm text-gray-600">animate-spin</p>
    </div>
    <div>
        <div class="animate-ping bg-green-500 text-white p-4 rounded-lg inline-block">脉冲</div>
        <p class="text-sm text-gray-600">animate-ping</p>
    </div>
    <div>
        <div class="animate-pulse bg-purple-500 text-white p-4 rounded-lg inline-block">呼吸</div>
        <p class="text-sm text-gray-600">animate-pulse</p>
    </div>
    <div>
        <div class="animate-bounce bg-red-500 text-white p-4 rounded-lg inline-block">弹跳</div>
        <p class="text-sm text-gray-600">animate-bounce</p>
    </div>
</div>
```

## 常用工具类速查表

### 间距单位
- `0` = 0px
- `1` = 0.25rem (4px)
- `2` = 0.5rem (8px)
- `4` = 1rem (16px)
- `6` = 1.5rem (24px)
- `8` = 2rem (32px)
- `10` = 2.5rem (40px)
- `12` = 3rem (48px)

### 颜色级别
每种颜色都有10个级别：
- `50` - 最浅
- `100` - `900` - 逐渐加深
- `950` - 最深（部分颜色）

### 响应式前缀
- 无前缀 = 所有屏幕
- `sm:` = ≥640px
- `md:` = ≥768px
- `lg:` = ≥1024px
- `xl:` = ≥1280px
- `2xl:` = ≥1536px