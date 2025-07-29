---
title: "Flexbox布局完整指南"
description: "Flexbox弹性盒布局的全面示例，包括容器属性、项目属性和实际应用"
category: "layout"
language: "css"
day: 4
concepts:
  - "Flexbox布局"
  - "弹性容器"
  - "弹性项目"
relatedTopics:
  - "响应式设计"
  - "现代布局"
---

# Flexbox布局完整示例

## Flexbox基础概念

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Flexbox布局演示</title>
    <style>
        /* Flex容器基础 */
        .flex-container {
            display: flex;  /* 或 inline-flex */
            background-color: #f0f0f0;
            padding: 10px;
            margin-bottom: 20px;
        }
        
        .flex-item {
            background-color: #007bff;
            color: white;
            padding: 20px;
            margin: 5px;
            text-align: center;
            font-size: 20px;
        }
        
        /* 可视化演示 */
        .demo-container {
            border: 2px dashed #333;
            min-height: 100px;
        }
    </style>
</head>
<body>
    <h1>Flexbox布局演示</h1>
    
    <div class="flex-container demo-container">
        <div class="flex-item">1</div>
        <div class="flex-item">2</div>
        <div class="flex-item">3</div>
    </div>
</body>
</html>
```

## Flex容器属性

### flex-direction（主轴方向）

```css
/* 主轴方向 */
.flex-row {
    display: flex;
    flex-direction: row;  /* 默认值：从左到右 */
}

.flex-row-reverse {
    display: flex;
    flex-direction: row-reverse;  /* 从右到左 */
}

.flex-column {
    display: flex;
    flex-direction: column;  /* 从上到下 */
}

.flex-column-reverse {
    display: flex;
    flex-direction: column-reverse;  /* 从下到上 */
}
```

### flex-wrap（换行）

```css
/* 换行控制 */
.flex-nowrap {
    display: flex;
    flex-wrap: nowrap;  /* 默认值：不换行 */
}

.flex-wrap {
    display: flex;
    flex-wrap: wrap;  /* 换行 */
    width: 300px;  /* 限制宽度以演示换行 */
}

.flex-wrap-reverse {
    display: flex;
    flex-wrap: wrap-reverse;  /* 反向换行 */
}

/* 简写属性 */
.flex-flow {
    display: flex;
    flex-flow: row wrap;  /* direction wrap */
}
```

### justify-content（主轴对齐）

```css
/* 主轴对齐方式 */
.justify-start {
    display: flex;
    justify-content: flex-start;  /* 默认值：起点对齐 */
}

.justify-end {
    display: flex;
    justify-content: flex-end;  /* 终点对齐 */
}

.justify-center {
    display: flex;
    justify-content: center;  /* 居中对齐 */
}

.justify-between {
    display: flex;
    justify-content: space-between;  /* 两端对齐，项目间隔相等 */
}

.justify-around {
    display: flex;
    justify-content: space-around;  /* 项目两侧间隔相等 */
}

.justify-evenly {
    display: flex;
    justify-content: space-evenly;  /* 项目间隔完全相等 */
}
```

### align-items（交叉轴对齐）

```css
/* 交叉轴对齐方式 */
.align-stretch {
    display: flex;
    align-items: stretch;  /* 默认值：拉伸 */
    height: 150px;
}

.align-start {
    display: flex;
    align-items: flex-start;  /* 起点对齐 */
    height: 150px;
}

.align-end {
    display: flex;
    align-items: flex-end;  /* 终点对齐 */
    height: 150px;
}

.align-center {
    display: flex;
    align-items: center;  /* 居中对齐 */
    height: 150px;
}

.align-baseline {
    display: flex;
    align-items: baseline;  /* 基线对齐 */
    height: 150px;
}
```

### align-content（多行对齐）

```css
/* 多行内容对齐 */
.align-content-start {
    display: flex;
    flex-wrap: wrap;
    align-content: flex-start;
    height: 300px;
}

.align-content-end {
    display: flex;
    flex-wrap: wrap;
    align-content: flex-end;
    height: 300px;
}

.align-content-center {
    display: flex;
    flex-wrap: wrap;
    align-content: center;
    height: 300px;
}

.align-content-between {
    display: flex;
    flex-wrap: wrap;
    align-content: space-between;
    height: 300px;
}

.align-content-around {
    display: flex;
    flex-wrap: wrap;
    align-content: space-around;
    height: 300px;
}

.align-content-stretch {
    display: flex;
    flex-wrap: wrap;
    align-content: stretch;  /* 默认值 */
    height: 300px;
}
```

### gap（间距）

```css
/* Flex间距 */
.flex-gap {
    display: flex;
    gap: 20px;  /* 行列间距相同 */
}

.flex-gap-separate {
    display: flex;
    row-gap: 20px;    /* 行间距 */
    column-gap: 10px; /* 列间距 */
}
```

## Flex项目属性

### order（排序）

```css
/* 项目排序 */
.item-order {
    display: flex;
}

.item-order .item-1 { order: 3; }
.item-order .item-2 { order: 1; }
.item-order .item-3 { order: 2; }
/* 显示顺序：2, 3, 1 */
```

### flex-grow（放大）

```css
/* 项目放大 */
.flex-grow-demo {
    display: flex;
    width: 600px;
}

.grow-0 { flex-grow: 0; }  /* 默认值：不放大 */
.grow-1 { flex-grow: 1; }  /* 占据剩余空间 */
.grow-2 { flex-grow: 2; }  /* 占据2倍剩余空间 */
```

### flex-shrink（缩小）

```css
/* 项目缩小 */
.flex-shrink-demo {
    display: flex;
    width: 300px;
}

.shrink-0 { 
    flex-shrink: 0;  /* 不缩小 */
    width: 200px;
}
.shrink-1 { 
    flex-shrink: 1;  /* 默认值：可缩小 */
    width: 200px;
}
.shrink-2 { 
    flex-shrink: 2;  /* 2倍速缩小 */
    width: 200px;
}
```

### flex-basis（基准大小）

```css
/* 项目基准大小 */
.flex-basis-demo {
    display: flex;
}

.basis-auto { flex-basis: auto; }      /* 默认值 */
.basis-200 { flex-basis: 200px; }      /* 固定基准 */
.basis-50p { flex-basis: 50%; }        /* 百分比基准 */
.basis-content { flex-basis: content; } /* 基于内容 */
```

### flex简写

```css
/* flex简写属性 */
.flex-shorthand {
    display: flex;
}

.flex-initial { 
    flex: initial;     /* 0 1 auto */
}
.flex-auto { 
    flex: auto;        /* 1 1 auto */
}
.flex-none { 
    flex: none;        /* 0 0 auto */
}
.flex-1 { 
    flex: 1;           /* 1 1 0% */
}
.flex-custom { 
    flex: 2 1 300px;   /* grow shrink basis */
}
```

### align-self（单独对齐）

```css
/* 单个项目对齐 */
.align-self-demo {
    display: flex;
    align-items: center;
    height: 200px;
}

.self-auto { align-self: auto; }        /* 默认值 */
.self-start { align-self: flex-start; }
.self-end { align-self: flex-end; }
.self-center { align-self: center; }
.self-baseline { align-self: baseline; }
.self-stretch { align-self: stretch; }
```

## 实用布局示例

### 导航栏

```css
/* 响应式导航栏 */
.navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background-color: #333;
    color: white;
}

.nav-brand {
    font-size: 1.5rem;
    font-weight: bold;
}

.nav-menu {
    display: flex;
    list-style: none;
    gap: 2rem;
    margin: 0;
    padding: 0;
}

.nav-menu a {
    color: white;
    text-decoration: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    transition: background-color 0.3s;
}

.nav-menu a:hover {
    background-color: rgba(255, 255, 255, 0.1);
}

/* 移动端响应式 */
@media (max-width: 768px) {
    .navbar {
        flex-direction: column;
        gap: 1rem;
    }
    
    .nav-menu {
        flex-direction: column;
        width: 100%;
        text-align: center;
    }
}
```

### 卡片布局

```css
/* 卡片网格 */
.card-container {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    padding: 20px;
}

.card {
    flex: 1 1 300px;  /* 最小300px，可增长和缩小 */
    max-width: 400px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    overflow: hidden;
}

.card-header {
    padding: 1rem;
    background-color: #f8f9fa;
    border-bottom: 1px solid #dee2e6;
}

.card-body {
    padding: 1rem;
}

.card-footer {
    padding: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #f8f9fa;
    border-top: 1px solid #dee2e6;
}
```

### 侧边栏布局

```css
/* 应用布局 */
.app-layout {
    display: flex;
    min-height: 100vh;
}

.sidebar {
    flex: 0 0 250px;  /* 固定宽度，不增长不缩小 */
    background-color: #2c3e50;
    color: white;
    padding: 2rem;
}

.main-content {
    flex: 1;  /* 占据剩余空间 */
    padding: 2rem;
    background-color: #ecf0f1;
}

/* 响应式侧边栏 */
@media (max-width: 768px) {
    .app-layout {
        flex-direction: column;
    }
    
    .sidebar {
        flex: 0 0 auto;
        width: 100%;
    }
}
```

### 垂直居中

```css
/* 完美居中 */
.center-perfect {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
}

/* 多种居中方式 */
.center-variants {
    display: flex;
    
    /* 水平居中 */
    justify-content: center;
    
    /* 垂直居中 */
    align-items: center;
    
    /* 或使用 place-content (简写) */
    place-content: center;
}
```

### 圣杯布局

```css
/* 圣杯布局 */
.holy-grail {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
}

.holy-grail-header {
    flex: 0 0 auto;
    background: #333;
    color: white;
    padding: 1rem;
}

.holy-grail-body {
    flex: 1;
    display: flex;
}

.holy-grail-nav {
    flex: 0 0 200px;
    background: #f0f0f0;
    padding: 1rem;
    order: -1;  /* 移到最左边 */
}

.holy-grail-main {
    flex: 1;
    padding: 1rem;
}

.holy-grail-aside {
    flex: 0 0 200px;
    background: #f0f0f0;
    padding: 1rem;
}

.holy-grail-footer {
    flex: 0 0 auto;
    background: #333;
    color: white;
    padding: 1rem;
}

/* 移动端调整 */
@media (max-width: 768px) {
    .holy-grail-body {
        flex-direction: column;
    }
    
    .holy-grail-nav {
        order: 0;
        flex: 0 0 auto;
    }
}
```

### 媒体对象

```css
/* 媒体对象模式 */
.media-object {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    padding: 1rem;
}

.media-figure {
    flex: 0 0 auto;
}

.media-figure img {
    width: 100px;
    height: 100px;
    object-fit: cover;
    border-radius: 8px;
}

.media-body {
    flex: 1;
}

/* 反向媒体对象 */
.media-object-reverse {
    flex-direction: row-reverse;
}
```

### 等高列

```css
/* 等高列布局 */
.equal-height-container {
    display: flex;
    gap: 20px;
}

.equal-height-column {
    flex: 1;
    padding: 20px;
    background: #f8f9fa;
    border: 1px solid #dee2e6;
    /* 所有列自动等高 */
}
```

### 粘性页脚

```css
/* 粘性页脚 */
.page-wrapper {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
}

.page-header {
    background: #333;
    color: white;
    padding: 1rem;
}

.page-content {
    flex: 1;  /* 占据所有剩余空间 */
    padding: 2rem;
}

.page-footer {
    background: #333;
    color: white;
    padding: 1rem;
    margin-top: auto;  /* 推到底部 */
}
```

这些示例涵盖了Flexbox的所有主要属性和常见布局模式，可以作为开发时的参考。