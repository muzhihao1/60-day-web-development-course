---
title: "CSS盒模型详解"
description: "深入理解CSS盒模型，包括内容、内边距、边框、外边距的计算和应用"
category: "css"
language: "css"
day: 4
concepts:
  - "盒模型"
  - "box-sizing"
  - "边距折叠"
relatedTopics:
  - "CSS布局"
  - "响应式设计"
---

# CSS盒模型完整示例

## 盒模型基础

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CSS盒模型演示</title>
    <style>
        /* 标准盒模型 */
        .box-content {
            width: 300px;
            height: 200px;
            padding: 20px;
            border: 5px solid #333;
            margin: 10px;
            background-color: #f0f0f0;
            
            /* 实际宽度 = 300 + 20*2 + 5*2 = 350px */
            /* 实际高度 = 200 + 20*2 + 5*2 = 250px */
        }
        
        /* 边框盒模型 */
        .box-border {
            box-sizing: border-box;
            width: 300px;
            height: 200px;
            padding: 20px;
            border: 5px solid #333;
            margin: 10px;
            background-color: #e0e0e0;
            
            /* 实际宽度 = 300px (包含padding和border) */
            /* 内容宽度 = 300 - 20*2 - 5*2 = 250px */
        }
        
        /* 全局设置边框盒模型（推荐） */
        *, *::before, *::after {
            box-sizing: border-box;
        }
        
        /* 可视化盒模型 */
        .box-visual {
            width: 400px;
            height: 300px;
            margin: 50px auto;
            padding: 40px;
            border: 10px solid #007bff;
            background-color: #e3f2fd;
            position: relative;
        }
        
        .box-visual::before {
            content: 'Content Area';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 10px;
            border-radius: 4px;
        }
        
        /* 显示各个部分 */
        .box-demo {
            width: 300px;
            margin: 20px auto;
            background-color: #bbdefb;  /* content */
            border: 20px solid #1976d2;  /* border */
            outline: 20px solid #64b5f6;  /* 模拟margin */
            padding: 30px;
        }
    </style>
</head>
<body>
    <h1>CSS盒模型演示</h1>
    
    <div class="box-content">
        <p>标准盒模型 (content-box)</p>
        <p>宽度只包括内容区域</p>
    </div>
    
    <div class="box-border">
        <p>边框盒模型 (border-box)</p>
        <p>宽度包括内容、内边距和边框</p>
    </div>
    
    <div class="box-visual">
        <!-- 内容区域 -->
    </div>
</body>
</html>
```

## Margin（外边距）详解

```css
/* 外边距基础 */
.margin-demo {
    /* 单个值：应用到所有边 */
    margin: 20px;
    
    /* 两个值：垂直 | 水平 */
    margin: 20px 10px;
    
    /* 三个值：上 | 水平 | 下 */
    margin: 20px 10px 30px;
    
    /* 四个值：上 | 右 | 下 | 左（顺时针） */
    margin: 20px 10px 30px 15px;
}

/* 单独设置各边 */
.margin-individual {
    margin-top: 20px;
    margin-right: 10px;
    margin-bottom: 30px;
    margin-left: 15px;
}

/* 自动外边距（水平居中） */
.center-block {
    width: 600px;
    margin: 0 auto;  /* 上下0，左右自动 */
}

/* 负外边距 */
.negative-margin {
    margin-top: -20px;    /* 向上移动 */
    margin-left: -10px;   /* 向左移动 */
}

/* 百分比外边距（相对于父元素宽度） */
.percentage-margin {
    margin: 5%;  /* 所有方向都是父元素宽度的5% */
}

/* 外边距折叠示例 */
.parent {
    background: #f0f0f0;
    padding: 1px;  /* 防止边距折叠 */
}

.child {
    margin-top: 20px;
    margin-bottom: 20px;
    background: #e0e0e0;
}

/* 相邻元素边距折叠 */
.sibling-1 {
    margin-bottom: 30px;
    background: #ffeb3b;
}

.sibling-2 {
    margin-top: 20px;
    background: #4caf50;
    /* 实际间距是30px，不是50px */
}

/* 防止边距折叠的方法 */
.no-collapse {
    /* 方法1：添加padding */
    padding-top: 1px;
    
    /* 方法2：添加border */
    border-top: 1px solid transparent;
    
    /* 方法3：创建BFC */
    overflow: hidden;
    
    /* 方法4：使用伪元素 */
    &::before {
        content: '';
        display: table;
    }
}
```

## Padding（内边距）详解

```css
/* 内边距基础 */
.padding-demo {
    /* 单个值 */
    padding: 20px;
    
    /* 两个值 */
    padding: 10px 20px;
    
    /* 三个值 */
    padding: 10px 20px 30px;
    
    /* 四个值 */
    padding: 10px 20px 30px 40px;
}

/* 单独设置 */
.padding-individual {
    padding-top: 10px;
    padding-right: 20px;
    padding-bottom: 30px;
    padding-left: 40px;
}

/* 百分比内边距 */
.responsive-padding {
    /* 创建固定比例的容器 */
    width: 100%;
    padding-bottom: 56.25%;  /* 16:9 比例 */
    position: relative;
}

.responsive-padding > * {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

/* 内边距与背景 */
.padding-background {
    padding: 20px;
    background-color: #f0f0f0;
    background-clip: padding-box;  /* 默认值 */
    /* background-clip: content-box; */  /* 背景只在内容区 */
    /* background-clip: border-box; */   /* 背景延伸到边框 */
}
```

## Border（边框）详解

```css
/* 边框基础 */
.border-demo {
    /* 简写语法：宽度 | 样式 | 颜色 */
    border: 2px solid #333;
    
    /* 分别设置 */
    border-width: 2px;
    border-style: solid;
    border-color: #333;
}

/* 单独设置各边 */
.border-individual {
    border-top: 1px solid #ccc;
    border-right: 2px dashed #999;
    border-bottom: 3px dotted #666;
    border-left: 4px double #333;
}

/* 边框样式 */
.border-styles {
    /* none: 无边框 */
    /* hidden: 隐藏边框 */
    /* solid: 实线 */
    /* dashed: 虚线 */
    /* dotted: 点线 */
    /* double: 双线 */
    /* groove: 3D凹槽 */
    /* ridge: 3D脊 */
    /* inset: 3D内嵌 */
    /* outset: 3D外凸 */
}

/* 圆角边框 */
.border-radius {
    /* 所有角 */
    border-radius: 10px;
    
    /* 左上右下 | 右上左下 */
    border-radius: 10px 20px;
    
    /* 左上 | 右上左下 | 右下 */
    border-radius: 10px 20px 30px;
    
    /* 左上 | 右上 | 右下 | 左下 */
    border-radius: 10px 20px 30px 40px;
    
    /* 椭圆角 */
    border-radius: 50px / 25px;
    
    /* 圆形 */
    width: 100px;
    height: 100px;
    border-radius: 50%;
}

/* 边框图像 */
.border-image {
    border: 10px solid transparent;
    border-image: url('border.png') 30 round;
    /* border-image: source slice width outset repeat */
}
```

## 盒模型实际应用

```css
/* 卡片组件 */
.card {
    box-sizing: border-box;
    width: 300px;
    margin: 20px;
    padding: 0;
    border: 1px solid #dee2e6;
    border-radius: 0.25rem;
    overflow: hidden;
    box-shadow: 0 0.125rem 0.25rem rgba(0,0,0,0.075);
}

.card-header {
    padding: 0.75rem 1.25rem;
    margin-bottom: 0;
    background-color: #f8f9fa;
    border-bottom: 1px solid #dee2e6;
}

.card-body {
    padding: 1.25rem;
}

.card-footer {
    padding: 0.75rem 1.25rem;
    background-color: #f8f9fa;
    border-top: 1px solid #dee2e6;
}

/* 按钮组件 */
.btn {
    box-sizing: border-box;
    display: inline-block;
    padding: 0.375rem 0.75rem;
    margin: 0.25rem;
    border: 1px solid transparent;
    border-radius: 0.25rem;
    font-size: 1rem;
    line-height: 1.5;
    text-decoration: none;
    cursor: pointer;
    transition: all 0.15s ease-in-out;
}

.btn-primary {
    color: #fff;
    background-color: #007bff;
    border-color: #007bff;
}

.btn-primary:hover {
    background-color: #0056b3;
    border-color: #004085;
}

/* 输入框组件 */
.form-control {
    box-sizing: border-box;
    width: 100%;
    padding: 0.375rem 0.75rem;
    margin-bottom: 1rem;
    border: 1px solid #ced4da;
    border-radius: 0.25rem;
    font-size: 1rem;
    line-height: 1.5;
}

.form-control:focus {
    border-color: #80bdff;
    outline: 0;
    box-shadow: 0 0 0 0.2rem rgba(0,123,255,0.25);
}

/* 网格布局中的盒模型 */
.grid-container {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    padding: 20px;
}

.grid-item {
    box-sizing: border-box;
    padding: 20px;
    border: 2px solid #007bff;
    background-color: #e3f2fd;
}

/* 响应式盒模型 */
.responsive-box {
    box-sizing: border-box;
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

@media (min-width: 768px) {
    .responsive-box {
        padding: 40px;
    }
}

@media (min-width: 1200px) {
    .responsive-box {
        padding: 60px;
    }
}
```

## 盒模型调试技巧

```css
/* 可视化所有元素的盒模型 */
* {
    outline: 1px solid red !important;
}

/* 显示元素尺寸 */
.debug::after {
    content: attr(data-size);
    position: absolute;
    top: 0;
    right: 0;
    background: rgba(0,0,0,0.8);
    color: white;
    padding: 2px 5px;
    font-size: 12px;
}

/* 高亮不同的盒模型部分 */
.debug-box {
    background-color: rgba(255, 0, 0, 0.1);  /* 内容区 */
    outline: 2px solid blue;                  /* 边框 */
    box-shadow: 0 0 0 20px rgba(0, 255, 0, 0.1);  /* 外边距 */
}

/* 使用CSS计数器显示尺寸 */
body {
    counter-reset: box-width box-height;
}

.measure::before {
    counter-increment: box-width;
    content: "W: " counter(box-width) "px";
}

.measure::after {
    counter-increment: box-height;
    content: "H: " counter(box-height) "px";
}
```

这些示例展示了CSS盒模型的各个方面，从基础概念到实际应用，帮助理解和掌握盒模型的使用。