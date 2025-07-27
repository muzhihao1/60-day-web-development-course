---
day: 4
phase: "modern-web"
title: "CSS3核心概念"
description: "掌握样式化网页的核心概念和现代布局技术"
objectives:
  - "理解CSS选择器的层次和优先级"
  - "掌握盒模型及其计算方式"
  - "学习各种定位方式及其应用场景"
  - "理解CSS层叠和特异性规则"
  - "掌握Flexbox布局系统"
estimatedTime: 60
difficulty: "beginner"
tags:
  - "CSS3"
  - "选择器"
  - "盒模型"
  - "Flexbox"
  - "布局"
resources:
  - title: "MDN: CSS基础"
    url: "https://developer.mozilla.org/zh-CN/docs/Learn/CSS"
    type: "documentation"
  - title: "MDN: CSS选择器"
    url: "https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_Selectors"
    type: "documentation"
  - title: "MDN: Flexbox完整指南"
    url: "https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_Flexible_Box_Layout"
    type: "documentation"
---

# Day 04: CSS3核心概念

## 📋 学习目标

今天我们开始学习CSS3，掌握样式化网页的核心概念和现代布局技术。

- 理解CSS选择器的层次和优先级
- 掌握盒模型及其计算方式
- 学习各种定位方式及其应用场景
- 理解CSS层叠和特异性规则
- 掌握Flexbox布局系统

## ⏱️ CSS基础语法（5分钟）

### CSS的三种引入方式

```html
<!-- 1. 内联样式（优先级最高） -->
<p style="color: red; font-size: 16px;">内联样式</p>

<!-- 2. 内部样式表 -->
<head>
    <style>
        p {
            color: blue;
            font-size: 16px;
        }
    </style>
</head>

<!-- 3. 外部样式表（推荐） -->
<head>
    <link rel="stylesheet" href="styles.css">
</head>
```

### CSS规则结构

```css
/* 选择器 { 属性: 值; } */
selector {
    property: value;
    another-property: another-value;
}

/* 注释语法 */
/* 这是单行注释 */

/*
 * 这是
 * 多行注释
 */
```

## 📝 CSS选择器深入理解（15分钟）

### 基础选择器

#### 1. 元素选择器

```css
/* 选择所有p元素 */
p {
    color: #333;
    line-height: 1.6;
}

/* 选择多个元素 */
h1, h2, h3 {
    font-family: 'Arial', sans-serif;
    margin-bottom: 1rem;
}
```

#### 2. 类选择器

```css
/* 选择class为"highlight"的元素 */
.highlight {
    background-color: yellow;
    padding: 2px 4px;
}

/* 多类选择器 */
.card.featured {
    border: 2px solid gold;
}

/* 类选择器组合 */
p.intro {
    font-size: 1.2em;
    font-weight: bold;
}
```

#### 3. ID选择器

```css
/* 选择id为"header"的元素 */
#header {
    background-color: #333;
    color: white;
    padding: 1rem;
}

/* ID和类的组合 */
#main-nav.sticky {
    position: fixed;
    top: 0;
}
```

#### 4. 通用选择器

```css
/* 选择所有元素 */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

/* 特定范围内的所有元素 */
.container * {
    font-family: inherit;
}
```

### 组合选择器

#### 1. 后代选择器（空格）

```css
/* article内的所有p元素 */
article p {
    margin-bottom: 1em;
}

/* 多层嵌套 */
nav ul li a {
    text-decoration: none;
    color: #333;
}
```

#### 2. 子选择器（>）

```css
/* 只选择直接子元素 */
ul > li {
    list-style: none;
    padding: 0.5rem;
}

/* 与后代选择器的区别 */
.parent > .child {
    /* 只选择直接子元素 */
}

.parent .child {
    /* 选择所有后代元素 */
}
```

#### 3. 相邻兄弟选择器（+）

```css
/* 选择紧跟在h2后面的p */
h2 + p {
    font-size: 1.1em;
    font-weight: bold;
}

/* 常用场景：列表项间距 */
li + li {
    margin-top: 0.5rem;
}
```

#### 4. 通用兄弟选择器（~）

```css
/* 选择h2之后的所有同级p元素 */
h2 ~ p {
    text-indent: 2em;
}

/* 实用示例：切换效果 */
input:checked ~ .content {
    display: block;
}
```

### 属性选择器

```css
/* 存在属性 */
a[target] {
    color: red;
}

/* 精确匹配 */
input[type="text"] {
    border: 1px solid #ccc;
}

/* 包含某个值 */
a[href*="example"] {
    color: green;
}

/* 以某个值开头 */
a[href^="https"] {
    background: url('secure.png') no-repeat right;
}

/* 以某个值结尾 */
a[href$=".pdf"] {
    background: url('pdf.png') no-repeat right;
}

/* 包含空格分隔的值 */
div[class~="warning"] {
    border: 2px solid orange;
}

/* 以某个值开头或精确匹配 */
p[lang|="en"] {
    /* 匹配 lang="en" 或 lang="en-US" */
}
```

### 伪类选择器

#### 1. 结构伪类

```css
/* 第一个和最后一个子元素 */
li:first-child {
    font-weight: bold;
}

li:last-child {
    margin-bottom: 0;
}

/* 第n个子元素 */
li:nth-child(3) {
    color: red;
}

/* 偶数/奇数 */
tr:nth-child(even) {
    background-color: #f5f5f5;
}

tr:nth-child(odd) {
    background-color: white;
}

/* 自定义公式 */
li:nth-child(3n+1) {
    /* 第1、4、7、10...个元素 */
}

/* 倒数第n个 */
li:nth-last-child(2) {
    /* 倒数第二个 */
}

/* 特定类型的第n个 */
p:nth-of-type(2) {
    /* 第二个p元素 */
}

/* 唯一子元素 */
p:only-child {
    /* 父元素只有这一个子元素 */
}

/* 空元素 */
p:empty {
    display: none;
}

/* 非选择器 */
li:not(.completed) {
    opacity: 1;
}
```

#### 2. 状态伪类

```css
/* 链接状态 */
a:link { color: blue; }
a:visited { color: purple; }
a:hover { color: red; }
a:active { color: orange; }

/* 表单状态 */
input:focus {
    outline: 2px solid #3498db;
}

input:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

input:checked + label {
    font-weight: bold;
}

input:required {
    border-color: red;
}

input:valid {
    border-color: green;
}

input:invalid {
    border-color: red;
}

/* 目标伪类 */
section:target {
    background-color: yellow;
}
```

### 伪元素选择器

```css
/* 首字母和首行 */
p::first-letter {
    font-size: 2em;
    float: left;
}

p::first-line {
    font-weight: bold;
}

/* 前后插入内容 */
.required::after {
    content: " *";
    color: red;
}

blockquote::before {
    content: """;
    font-size: 3em;
}

blockquote::after {
    content: """;
    font-size: 3em;
}

/* 选中文本样式 */
::selection {
    background: #3498db;
    color: white;
}

/* 占位符样式 */
::placeholder {
    color: #999;
    font-style: italic;
}
```

## 🎬 盒模型与定位（30分钟）

### CSS盒模型

#### 1. 盒模型组成

```css
/* 标准盒模型 */
.box {
    width: 300px;          /* 内容宽度 */
    height: 200px;         /* 内容高度 */
    padding: 20px;         /* 内边距 */
    border: 5px solid #333; /* 边框 */
    margin: 10px;          /* 外边距 */
    
    /* 实际宽度 = 300 + 20*2 + 5*2 = 350px */
    /* 实际高度 = 200 + 20*2 + 5*2 = 250px */
}

/* box-sizing改变计算方式 */
.box-border {
    box-sizing: border-box;
    width: 300px;  /* 包含padding和border */
    padding: 20px;
    border: 5px solid #333;
    
    /* 内容宽度 = 300 - 20*2 - 5*2 = 250px */
}
```

#### 2. margin详解

```css
/* 单个值：应用到所有边 */
.element { margin: 20px; }

/* 两个值：垂直 水平 */
.element { margin: 20px 10px; }

/* 三个值：上 水平 下 */
.element { margin: 20px 10px 30px; }

/* 四个值：上 右 下 左（顺时针） */
.element { margin: 20px 10px 30px 15px; }

/* 单独设置 */
.element {
    margin-top: 20px;
    margin-right: 10px;
    margin-bottom: 30px;
    margin-left: 15px;
}

/* 自动外边距（居中） */
.container {
    width: 1200px;
    margin: 0 auto; /* 水平居中 */
}

/* 负外边距 */
.overlap {
    margin-top: -20px; /* 向上移动 */
}

/* 外边距折叠 */
.paragraph {
    margin-bottom: 20px;
}
.paragraph + .paragraph {
    margin-top: 30px;
    /* 实际间距是30px，不是50px */
}
```

#### 3. padding详解

```css
/* padding不能为负值 */
.content {
    padding: 20px; /* 所有方向 */
    padding: 10px 20px; /* 垂直 水平 */
    padding: 10px 20px 30px; /* 上 水平 下 */
    padding: 10px 20px 30px 40px; /* 上右下左 */
}

/* 百分比padding */
.responsive-box {
    width: 100%;
    padding-bottom: 56.25%; /* 16:9比例 */
    position: relative;
}
```

#### 4. border详解

```css
/* 简写语法 */
.box {
    border: 2px solid #333;
    /* 等同于： */
    border-width: 2px;
    border-style: solid;
    border-color: #333;
}

/* 单独设置各边 */
.box {
    border-top: 1px solid #ccc;
    border-right: 2px dashed #999;
    border-bottom: 3px dotted #666;
    border-left: none;
}

/* 圆角边框 */
.rounded {
    border-radius: 10px; /* 所有角 */
    border-radius: 10px 20px; /* 左上右下 右上左下 */
    border-radius: 10px 20px 30px 40px; /* 顺时针 */
}

/* 圆形 */
.circle {
    width: 100px;
    height: 100px;
    border-radius: 50%;
}

/* 边框图像 */
.fancy-border {
    border-image: url('border.png') 30 round;
}
```

### CSS定位

#### 1. position: static（默认）

```css
.default {
    position: static;
    /* 正常文档流，不受top/right/bottom/left影响 */
}
```

#### 2. position: relative（相对定位）

```css
.relative-box {
    position: relative;
    top: 20px;    /* 相对于原位置向下20px */
    left: 30px;   /* 相对于原位置向右30px */
    /* 原始空间保留 */
}

/* 作为绝对定位的参考 */
.parent {
    position: relative;
}
```

#### 3. position: absolute（绝对定位）

```css
.absolute-box {
    position: absolute;
    top: 50px;
    right: 20px;
    /* 相对于最近的非static父元素定位 */
    /* 脱离文档流 */
}

/* 居中技巧 */
.center-absolute {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}

/* 覆盖整个父元素 */
.overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    /* 或者 */
    width: 100%;
    height: 100%;
}
```

#### 4. position: fixed（固定定位）

```css
/* 固定在视口 */
.fixed-header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: white;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    z-index: 1000;
}

/* 返回顶部按钮 */
.back-to-top {
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 50px;
    height: 50px;
}
```

#### 5. position: sticky（粘性定位）

```css
/* 结合relative和fixed特性 */
.sticky-nav {
    position: sticky;
    top: 0;
    background: white;
    /* 滚动到顶部时固定 */
}

/* 表格标题固定 */
thead th {
    position: sticky;
    top: 0;
    background: #f5f5f5;
    z-index: 10;
}
```

### z-index层叠上下文

```css
/* z-index只对定位元素有效 */
.layer-1 {
    position: relative;
    z-index: 1;
}

.layer-2 {
    position: absolute;
    z-index: 10;
}

.layer-3 {
    position: fixed;
    z-index: 100;
}

/* 创建新的层叠上下文 */
.stacking-context {
    position: relative;
    z-index: 0;
    /* 或者 */
    opacity: 0.99;
    /* 或者 */
    transform: translateZ(0);
}
```

## 🏗️ CSS层叠与特异性（10分钟）

### 特异性计算

```css
/* 特异性：(内联, ID, 类/伪类/属性, 元素) */

/* (0, 0, 0, 1) */
p { color: blue; }

/* (0, 0, 1, 0) */
.text { color: green; }

/* (0, 0, 1, 1) */
p.text { color: yellow; }

/* (0, 1, 0, 0) */
#header { color: red; }

/* (0, 1, 1, 0) */
#header.active { color: orange; }

/* (1, 0, 0, 0) */
<p style="color: purple;">内联样式</p>

/* !important 最高优先级 */
p { color: black !important; }
```

### 层叠规则

```css
/* 1. 重要性 */
/* !important > 内联 > ID > 类 > 元素 */

/* 2. 特异性相同时，后面的覆盖前面的 */
.text { color: blue; }
.text { color: red; } /* 生效 */

/* 3. 继承的样式特异性最低 */
body { color: #333; }
p { } /* p会继承body的颜色 */

/* 4. 通配符特异性为0 */
* { margin: 0; }
p { } /* p的margin仍然是0 */
```

## 💪 Flexbox布局系统（30分钟）

### Flex容器属性

#### 1. 创建Flex容器

```css
.container {
    display: flex; /* 块级flex容器 */
    /* 或 */
    display: inline-flex; /* 行内flex容器 */
}
```

#### 2. flex-direction（主轴方向）

```css
.container {
    flex-direction: row; /* 默认：从左到右 */
    flex-direction: row-reverse; /* 从右到左 */
    flex-direction: column; /* 从上到下 */
    flex-direction: column-reverse; /* 从下到上 */
}
```

#### 3. flex-wrap（换行）

```css
.container {
    flex-wrap: nowrap; /* 默认：不换行 */
    flex-wrap: wrap; /* 换行 */
    flex-wrap: wrap-reverse; /* 反向换行 */
}

/* 简写 */
.container {
    flex-flow: row wrap;
}
```

#### 4. justify-content（主轴对齐）

```css
.container {
    justify-content: flex-start; /* 默认：起点对齐 */
    justify-content: flex-end; /* 终点对齐 */
    justify-content: center; /* 居中对齐 */
    justify-content: space-between; /* 两端对齐 */
    justify-content: space-around; /* 均匀分布 */
    justify-content: space-evenly; /* 完全均匀 */
}
```

#### 5. align-items（交叉轴对齐）

```css
.container {
    align-items: stretch; /* 默认：拉伸 */
    align-items: flex-start; /* 起点对齐 */
    align-items: flex-end; /* 终点对齐 */
    align-items: center; /* 居中对齐 */
    align-items: baseline; /* 基线对齐 */
}
```

#### 6. align-content（多行对齐）

```css
.container {
    flex-wrap: wrap;
    align-content: flex-start;
    align-content: flex-end;
    align-content: center;
    align-content: space-between;
    align-content: space-around;
    align-content: stretch; /* 默认 */
}
```

#### 7. gap（间距）

```css
.container {
    gap: 20px; /* 行列间距 */
    row-gap: 20px; /* 行间距 */
    column-gap: 10px; /* 列间距 */
}
```

### Flex项目属性

#### 1. order（排序）

```css
.item {
    order: 0; /* 默认值 */
    order: -1; /* 排在前面 */
    order: 1; /* 排在后面 */
}
```

#### 2. flex-grow（放大）

```css
.item {
    flex-grow: 0; /* 默认：不放大 */
    flex-grow: 1; /* 占据剩余空间 */
    flex-grow: 2; /* 占据2倍剩余空间 */
}
```

#### 3. flex-shrink（缩小）

```css
.item {
    flex-shrink: 1; /* 默认：可缩小 */
    flex-shrink: 0; /* 不缩小 */
    flex-shrink: 2; /* 2倍速缩小 */
}
```

#### 4. flex-basis（基准大小）

```css
.item {
    flex-basis: auto; /* 默认 */
    flex-basis: 200px; /* 固定基准 */
    flex-basis: 30%; /* 百分比基准 */
}
```

#### 5. flex简写

```css
.item {
    flex: 0 1 auto; /* 默认值 */
    flex: 1; /* flex: 1 1 0% */
    flex: auto; /* flex: 1 1 auto */
    flex: none; /* flex: 0 0 auto */
}
```

#### 6. align-self（单独对齐）

```css
.item {
    align-self: auto; /* 默认 */
    align-self: flex-start;
    align-self: flex-end;
    align-self: center;
    align-self: baseline;
    align-self: stretch;
}
```

### Flexbox实用示例

#### 1. 导航栏

```css
.navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
}

.nav-links {
    display: flex;
    gap: 2rem;
}

.nav-logo {
    font-size: 1.5rem;
    font-weight: bold;
}
```

#### 2. 卡片布局

```css
.card-container {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    justify-content: center;
}

.card {
    flex: 1 1 300px; /* 弹性增长，最小300px */
    max-width: 400px;
}
```

#### 3. 侧边栏布局

```css
.app-layout {
    display: flex;
    min-height: 100vh;
}

.sidebar {
    flex: 0 0 250px; /* 固定宽度 */
    background: #f5f5f5;
}

.main-content {
    flex: 1; /* 占据剩余空间 */
    padding: 2rem;
}
```

#### 4. 垂直居中

```css
.center-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
}
```

#### 5. 等高列

```css
.equal-height-container {
    display: flex;
}

.column {
    flex: 1;
    padding: 20px;
    /* 自动等高 */
}
```

#### 6. 圣杯布局

```css
.holy-grail {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
}

.header, .footer {
    flex: 0 0 auto;
}

.body {
    flex: 1;
    display: flex;
}

.nav {
    flex: 0 0 200px;
    order: -1; /* 左侧 */
}

.main {
    flex: 1;
}

.aside {
    flex: 0 0 200px;
}
```

## 🎨 实践项目：个人简历页面（10分钟）

创建一个使用Flexbox布局的响应式个人简历页面：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>个人简历 - 张三</title>
    <style>
        /* CSS重置 */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f5f5f5;
        }
        
        /* 容器 */
        .resume-container {
            max-width: 900px;
            margin: 2rem auto;
            background: white;
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
        }
        
        /* 头部 */
        .resume-header {
            display: flex;
            align-items: center;
            gap: 2rem;
            padding: 3rem;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        
        .profile-image {
            flex: 0 0 150px;
            height: 150px;
            border-radius: 50%;
            border: 5px solid white;
            object-fit: cover;
        }
        
        .header-info {
            flex: 1;
        }
        
        .header-info h1 {
            font-size: 2.5rem;
            margin-bottom: 0.5rem;
        }
        
        .header-info .title {
            font-size: 1.25rem;
            opacity: 0.9;
            margin-bottom: 1rem;
        }
        
        .contact-info {
            display: flex;
            flex-wrap: wrap;
            gap: 1rem;
        }
        
        .contact-item {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        /* 主体内容 */
        .resume-body {
            display: flex;
            gap: 2rem;
            padding: 3rem;
        }
        
        /* 侧边栏 */
        .sidebar {
            flex: 0 0 300px;
        }
        
        .section {
            margin-bottom: 2rem;
        }
        
        .section h2 {
            color: #667eea;
            border-bottom: 2px solid #667eea;
            padding-bottom: 0.5rem;
            margin-bottom: 1rem;
        }
        
        /* 技能条 */
        .skill-item {
            margin-bottom: 1rem;
        }
        
        .skill-name {
            display: flex;
            justify-content: space-between;
            margin-bottom: 0.25rem;
        }
        
        .skill-bar {
            height: 8px;
            background: #e0e0e0;
            border-radius: 4px;
            overflow: hidden;
        }
        
        .skill-progress {
            height: 100%;
            background: #667eea;
            transition: width 0.3s ease;
        }
        
        /* 主要内容 */
        .main-content {
            flex: 1;
        }
        
        /* 时间线 */
        .timeline {
            position: relative;
            padding-left: 2rem;
        }
        
        .timeline::before {
            content: '';
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            width: 2px;
            background: #e0e0e0;
        }
        
        .timeline-item {
            position: relative;
            margin-bottom: 2rem;
        }
        
        .timeline-item::before {
            content: '';
            position: absolute;
            left: -2.5rem;
            top: 0;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: #667eea;
            border: 2px solid white;
        }
        
        .timeline-date {
            color: #666;
            font-size: 0.875rem;
            margin-bottom: 0.5rem;
        }
        
        .timeline-title {
            font-size: 1.125rem;
            font-weight: bold;
            margin-bottom: 0.5rem;
        }
        
        .timeline-company {
            color: #667eea;
            margin-bottom: 0.5rem;
        }
        
        /* 标签 */
        .tags {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
            margin-top: 1rem;
        }
        
        .tag {
            padding: 0.25rem 0.75rem;
            background: #f0f0f0;
            border-radius: 15px;
            font-size: 0.875rem;
        }
        
        /* 响应式设计 */
        @media (max-width: 768px) {
            .resume-header {
                flex-direction: column;
                text-align: center;
            }
            
            .contact-info {
                justify-content: center;
            }
            
            .resume-body {
                flex-direction: column;
            }
            
            .sidebar {
                flex: 1;
            }
        }
        
        /* 打印样式 */
        @media print {
            .resume-container {
                box-shadow: none;
                margin: 0;
            }
            
            .resume-header {
                background: none;
                color: #333;
                border-bottom: 2px solid #333;
            }
            
            .section h2 {
                color: #333;
                border-color: #333;
            }
        }
    </style>
</head>
<body>
    <div class="resume-container">
        <!-- 头部信息 -->
        <header class="resume-header">
            <img src="https://via.placeholder.com/150" alt="个人照片" class="profile-image">
            <div class="header-info">
                <h1>张三</h1>
                <p class="title">高级前端开发工程师</p>
                <div class="contact-info">
                    <div class="contact-item">
                        <span>📧</span>
                        <span>zhangsan@email.com</span>
                    </div>
                    <div class="contact-item">
                        <span>📱</span>
                        <span>138-0000-0000</span>
                    </div>
                    <div class="contact-item">
                        <span>🏠</span>
                        <span>北京市朝阳区</span>
                    </div>
                    <div class="contact-item">
                        <span>🔗</span>
                        <span>github.com/zhangsan</span>
                    </div>
                </div>
            </div>
        </header>
        
        <!-- 主体内容 -->
        <div class="resume-body">
            <!-- 侧边栏 -->
            <aside class="sidebar">
                <!-- 技能 -->
                <section class="section">
                    <h2>专业技能</h2>
                    <div class="skill-item">
                        <div class="skill-name">
                            <span>HTML/CSS</span>
                            <span>90%</span>
                        </div>
                        <div class="skill-bar">
                            <div class="skill-progress" style="width: 90%"></div>
                        </div>
                    </div>
                    <div class="skill-item">
                        <div class="skill-name">
                            <span>JavaScript</span>
                            <span>85%</span>
                        </div>
                        <div class="skill-bar">
                            <div class="skill-progress" style="width: 85%"></div>
                        </div>
                    </div>
                    <div class="skill-item">
                        <div class="skill-name">
                            <span>React/Vue</span>
                            <span>80%</span>
                        </div>
                        <div class="skill-bar">
                            <div class="skill-progress" style="width: 80%"></div>
                        </div>
                    </div>
                    <div class="skill-item">
                        <div class="skill-name">
                            <span>Node.js</span>
                            <span>70%</span>
                        </div>
                        <div class="skill-bar">
                            <div class="skill-progress" style="width: 70%"></div>
                        </div>
                    </div>
                </section>
                
                <!-- 语言 -->
                <section class="section">
                    <h2>语言能力</h2>
                    <div class="skill-item">
                        <div class="skill-name">
                            <span>中文</span>
                            <span>母语</span>
                        </div>
                    </div>
                    <div class="skill-item">
                        <div class="skill-name">
                            <span>英语</span>
                            <span>CET-6</span>
                        </div>
                    </div>
                </section>
                
                <!-- 兴趣爱好 -->
                <section class="section">
                    <h2>兴趣爱好</h2>
                    <div class="tags">
                        <span class="tag">开源贡献</span>
                        <span class="tag">技术博客</span>
                        <span class="tag">摄影</span>
                        <span class="tag">阅读</span>
                    </div>
                </section>
            </aside>
            
            <!-- 主要内容 -->
            <main class="main-content">
                <!-- 个人简介 -->
                <section class="section">
                    <h2>个人简介</h2>
                    <p>
                        5年前端开发经验，精通现代Web技术栈，熟悉前端工程化和性能优化。
                        具备良好的团队协作能力和项目管理经验，热衷于探索新技术，
                        在多个开源项目中有所贡献。追求代码质量和用户体验的完美结合。
                    </p>
                </section>
                
                <!-- 工作经历 -->
                <section class="section">
                    <h2>工作经历</h2>
                    <div class="timeline">
                        <div class="timeline-item">
                            <div class="timeline-date">2021.03 - 至今</div>
                            <div class="timeline-title">高级前端开发工程师</div>
                            <div class="timeline-company">ABC科技有限公司</div>
                            <ul>
                                <li>负责公司核心产品的前端架构设计和开发</li>
                                <li>带领团队完成了性能优化，页面加载速度提升60%</li>
                                <li>推动前端工程化建设，建立了完整的CI/CD流程</li>
                                <li>指导初级开发人员，进行代码审查和技术分享</li>
                            </ul>
                        </div>
                        
                        <div class="timeline-item">
                            <div class="timeline-date">2019.07 - 2021.02</div>
                            <div class="timeline-title">前端开发工程师</div>
                            <div class="timeline-company">XYZ互联网公司</div>
                            <ul>
                                <li>参与电商平台的前端开发，负责商品详情和购物车模块</li>
                                <li>使用React重构老旧项目，提升了用户体验</li>
                                <li>优化移动端适配，支持多终端访问</li>
                            </ul>
                        </div>
                    </div>
                </section>
                
                <!-- 教育背景 -->
                <section class="section">
                    <h2>教育背景</h2>
                    <div class="timeline">
                        <div class="timeline-item">
                            <div class="timeline-date">2015.09 - 2019.06</div>
                            <div class="timeline-title">计算机科学与技术专业 本科</div>
                            <div class="timeline-company">某某大学</div>
                            <p>主修课程：数据结构、算法、操作系统、计算机网络、软件工程等</p>
                        </div>
                    </div>
                </section>
                
                <!-- 项目经验 -->
                <section class="section">
                    <h2>项目经验</h2>
                    <div class="timeline">
                        <div class="timeline-item">
                            <div class="timeline-date">2022.01 - 2022.06</div>
                            <div class="timeline-title">企业级管理系统</div>
                            <p>
                                使用Vue 3 + TypeScript开发的企业管理系统，包含权限管理、
                                数据可视化、工作流等模块。负责整体架构设计和核心模块开发。
                            </p>
                            <div class="tags">
                                <span class="tag">Vue 3</span>
                                <span class="tag">TypeScript</span>
                                <span class="tag">Element Plus</span>
                                <span class="tag">ECharts</span>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    </div>
</body>
</html>
```

## 📚 学习资源

### 官方文档
- [MDN: CSS基础](https://developer.mozilla.org/zh-CN/docs/Learn/CSS)
- [MDN: CSS选择器](https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_Selectors)
- [MDN: Flexbox完整指南](https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_Flexible_Box_Layout)

### 在线工具
- [CSS选择器测试器](https://www.w3schools.com/cssref/trysel.asp)
- [Flexbox可视化](https://flexbox.help/)
- [CSS特异性计算器](https://specificity.keegan.st/)

### 游戏化学习
- [Flexbox Froggy](https://flexboxfroggy.com/) - 通过游戏学习Flexbox
- [CSS Diner](https://flukeout.github.io/) - 练习CSS选择器
- [Flexbox Defense](http://www.flexboxdefense.com/) - 塔防游戏学Flexbox

## ✅ 今日检查清单

- [ ] 理解CSS的三种引入方式
- [ ] 掌握各种CSS选择器的使用
- [ ] 理解盒模型的计算方式
- [ ] 掌握五种定位方式的区别
- [ ] 理解CSS特异性和层叠规则
- [ ] 熟练使用Flexbox布局
- [ ] 完成个人简历页面项目
- [ ] 能够解决常见的布局问题

## 🤔 自测问题

1. **CSS选择器的优先级是如何计算的？**

2. **box-sizing: border-box和content-box的区别是什么？**

3. **position的五个值分别有什么特点？**

4. **如何使用Flexbox实现垂直和水平居中？**

5. **flex: 1是什么的简写？它包含哪些属性？**

## 🎯 拓展练习

1. **创建一个响应式导航栏**
   - 使用Flexbox布局
   - 移动端显示汉堡菜单
   - 包含下拉菜单

2. **实现一个卡片网格布局**
   - 使用Flexbox创建响应式网格
   - 卡片hover效果
   - 自适应不同屏幕

3. **构建一个仪表板布局**
   - 固定侧边栏
   - 可滚动主内容区
   - 粘性顶部导航

## 💡 今日总结

今天我们深入学习了CSS3的核心概念：

- **选择器系统**：从基础到高级，掌握精确选择元素的方法
- **盒模型理解**：内容、内边距、边框、外边距的计算
- **定位机制**：五种定位方式各有用途
- **层叠规则**：理解样式优先级的计算
- **Flexbox布局**：现代化的一维布局解决方案

记住：**CSS不仅是样式，更是构建优雅界面的艺术！**

明天我们将学习CSS Grid布局系统，探索二维布局的强大功能。准备好迎接更复杂的布局挑战了吗？🎨