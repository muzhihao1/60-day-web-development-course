---
day: 5
phase: "modern-web"
title: "CSS Grid与现代布局"
description: "学习CSS Grid布局系统，掌握二维布局的强大功能，并学习现代CSS技术"
objectives:
  - "掌握CSS Grid的核心概念和属性"
  - "理解Grid与Flexbox的区别和适用场景"
  - "学习响应式Grid布局模式"
  - "掌握CSS自定义属性（CSS变量）"
  - "实现复杂的现代布局技术"
estimatedTime: 60
difficulty: "beginner"
tags:
  - "CSS Grid"
  - "布局"
  - "CSS变量"
  - "响应式"
  - "现代CSS"
resources:
  - title: "MDN: CSS Grid Layout"
    url: "https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_Grid_Layout"
    type: "documentation"
  - title: "MDN: CSS Custom Properties"
    url: "https://developer.mozilla.org/zh-CN/docs/Web/CSS/Using_CSS_custom_properties"
    type: "documentation"
  - title: "Grid Garden"
    url: "https://cssgridgarden.com/"
    type: "game"
---

# Day 05: CSS Grid与现代布局

## 📋 学习目标

今天我们将学习CSS Grid布局系统，掌握二维布局的强大功能，并学习现代CSS技术。

- 掌握CSS Grid的核心概念和属性
- 理解Grid与Flexbox的区别和适用场景
- 学习响应式Grid布局模式
- 掌握CSS自定义属性（CSS变量）
- 实现复杂的现代布局技术

## ⏱️ Grid基础概念（5分钟）

### 什么是CSS Grid？

CSS Grid是一个二维布局系统，可以同时处理行和列，是创建复杂网页布局的理想选择。

```css
/* 创建Grid容器 */
.grid-container {
    display: grid;
    /* 或 */
    display: inline-grid;
}
```

### Grid vs Flexbox

| 特性 | Flexbox | Grid |
|------|---------|------|
| 维度 | 一维（行或列） | 二维（行和列） |
| 适用场景 | 组件内部布局 | 页面整体布局 |
| 内容驱动 | 是 | 否 |
| 复杂布局 | 困难 | 简单 |

## 📝 Grid容器属性（15分钟）

### 1. 定义网格结构

#### grid-template-columns / grid-template-rows

```css
/* 固定尺寸 */
.grid {
    display: grid;
    grid-template-columns: 200px 300px 200px;
    grid-template-rows: 100px 200px;
}

/* 弹性尺寸 - fr单位 */
.grid {
    grid-template-columns: 1fr 2fr 1fr;
    grid-template-rows: 100px 1fr;
}

/* repeat()函数 */
.grid {
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(2, 100px);
}

/* auto-fill 和 auto-fit */
.grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
}

/* 混合使用 */
.grid {
    grid-template-columns: 200px repeat(3, 1fr) 200px;
}

/* 命名网格线 */
.grid {
    grid-template-columns: [start] 1fr [content-start] 3fr [content-end] 1fr [end];
    grid-template-rows: [header] 100px [main] 1fr [footer] 100px;
}
```

#### grid-template-areas

```css
.grid {
    display: grid;
    grid-template-columns: 200px 1fr 200px;
    grid-template-rows: auto 1fr auto;
    grid-template-areas:
        "header header header"
        "sidebar main aside"
        "footer footer footer";
}

/* 使用命名区域 */
.header { grid-area: header; }
.sidebar { grid-area: sidebar; }
.main { grid-area: main; }
.aside { grid-area: aside; }
.footer { grid-area: footer; }

/* 空白单元格 */
.grid {
    grid-template-areas:
        "header header ."
        "sidebar main aside"
        ". footer footer";
}
```

### 2. 网格间距

```css
.grid {
    /* 新语法（推荐） */
    gap: 20px; /* 行列间距相同 */
    row-gap: 20px;
    column-gap: 10px;
    
    /* 旧语法（仍被支持） */
    grid-gap: 20px;
    grid-row-gap: 20px;
    grid-column-gap: 10px;
}
```

### 3. 对齐属性

#### justify-items / align-items（项目在单元格内）

```css
.grid {
    /* 水平对齐 */
    justify-items: start; /* 默认 */
    justify-items: end;
    justify-items: center;
    justify-items: stretch;
    
    /* 垂直对齐 */
    align-items: start;
    align-items: end;
    align-items: center;
    align-items: stretch; /* 默认 */
    
    /* 简写 */
    place-items: center center;
    place-items: center; /* 两个值相同时 */
}
```

#### justify-content / align-content（网格在容器内）

```css
.grid {
    /* 当网格小于容器时 */
    justify-content: start;
    justify-content: end;
    justify-content: center;
    justify-content: stretch;
    justify-content: space-between;
    justify-content: space-around;
    justify-content: space-evenly;
    
    align-content: start;
    align-content: end;
    align-content: center;
    align-content: stretch;
    align-content: space-between;
    align-content: space-around;
    align-content: space-evenly;
    
    /* 简写 */
    place-content: center center;
}
```

### 4. 自动布局

```css
.grid {
    /* 自动放置算法 */
    grid-auto-flow: row; /* 默认：按行填充 */
    grid-auto-flow: column; /* 按列填充 */
    grid-auto-flow: row dense; /* 密集填充 */
    
    /* 隐式网格尺寸 */
    grid-auto-rows: 100px;
    grid-auto-columns: 100px;
    grid-auto-rows: minmax(100px, auto);
}
```

## 🎬 Grid项目属性（30分钟）

### 1. 网格线定位

```css
/* 基于线号 */
.item {
    grid-column-start: 1;
    grid-column-end: 3;
    grid-row-start: 1;
    grid-row-end: 2;
}

/* 简写 */
.item {
    grid-column: 1 / 3;
    grid-row: 1 / 2;
}

/* 更简洁的写法 */
.item {
    grid-area: 1 / 1 / 2 / 3; /* row-start / col-start / row-end / col-end */
}

/* 跨越多个轨道 */
.item {
    grid-column: span 2; /* 跨越2列 */
    grid-row: span 3; /* 跨越3行 */
}

/* 负数线号（从末尾计算） */
.item {
    grid-column: 1 / -1; /* 从第一列到最后一列 */
}

/* 基于命名线 */
.item {
    grid-column: content-start / content-end;
    grid-row: header / footer;
}
```

### 2. 单个项目对齐

```css
.item {
    /* 水平对齐（在单元格内） */
    justify-self: start;
    justify-self: end;
    justify-self: center;
    justify-self: stretch;
    
    /* 垂直对齐（在单元格内） */
    align-self: start;
    align-self: end;
    align-self: center;
    align-self: stretch;
    
    /* 简写 */
    place-self: center center;
}
```

## 🏗️ 高级Grid技术（10分钟）

### 1. 响应式Grid模式

#### Auto-fit vs Auto-fill

```css
/* auto-fill: 尽可能多地创建列 */
.grid-fill {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 20px;
}

/* auto-fit: 拉伸列以填充容器 */
.grid-fit {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
}
```

#### RAM模式（Repeat, Auto, Minmax）

```css
.responsive-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
}

/* 高级响应式网格 */
.advanced-grid {
    display: grid;
    grid-template-columns: 
        repeat(auto-fit, 
            minmax(
                clamp(200px, 30%, 400px), 
                1fr
            )
        );
}
```

### 2. 嵌套网格和子网格

```css
/* 嵌套网格 */
.parent-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
}

.nested-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    /* 独立的网格上下文 */
}

/* 子网格（较新特性） */
.subgrid-item {
    display: grid;
    grid-template-columns: subgrid;
    grid-template-rows: subgrid;
}
```

### 3. 网格模板简写

```css
/* grid-template简写 */
.grid {
    grid-template:
        "header header header" 100px
        "sidebar main aside" 1fr
        "footer footer footer" 100px
        / 200px 1fr 200px;
}

/* grid简写（最完整） */
.grid {
    grid: 
        "header header" 100px
        "sidebar main" 1fr
        / 200px 1fr;
}
```

## 💪 CSS自定义属性（30分钟）

### 1. 定义和使用变量

```css
/* 全局变量 */
:root {
    --primary-color: #3498db;
    --secondary-color: #2ecc71;
    --spacing: 1rem;
    --border-radius: 8px;
    --transition: all 0.3s ease;
}

/* 局部变量 */
.component {
    --component-padding: 2rem;
    --component-bg: #f5f5f5;
}

/* 使用变量 */
.button {
    background: var(--primary-color);
    padding: var(--spacing);
    border-radius: var(--border-radius);
    transition: var(--transition);
}

/* 带回退值 */
.element {
    color: var(--text-color, #333); /* 如果--text-color未定义，使用#333 */
}
```

### 2. 动态主题切换

```css
/* 浅色主题 */
:root {
    --bg-color: #ffffff;
    --text-color: #333333;
    --border-color: #e0e0e0;
}

/* 深色主题 */
[data-theme="dark"] {
    --bg-color: #1a1a1a;
    --text-color: #ffffff;
    --border-color: #404040;
}

/* 使用主题变量 */
body {
    background: var(--bg-color);
    color: var(--text-color);
}

.card {
    border: 1px solid var(--border-color);
}
```

### 3. 响应式变量

```css
:root {
    --grid-columns: 1;
    --gap: 1rem;
    --font-size: 14px;
}

@media (min-width: 768px) {
    :root {
        --grid-columns: 2;
        --gap: 1.5rem;
        --font-size: 16px;
    }
}

@media (min-width: 1200px) {
    :root {
        --grid-columns: 3;
        --gap: 2rem;
        --font-size: 18px;
    }
}

.responsive-grid {
    display: grid;
    grid-template-columns: repeat(var(--grid-columns), 1fr);
    gap: var(--gap);
    font-size: var(--font-size);
}
```

### 4. 计算和组合

```css
:root {
    --base-size: 1rem;
    --scale: 1.5;
    
    /* 计算值 */
    --size-sm: calc(var(--base-size) / var(--scale));
    --size-md: var(--base-size);
    --size-lg: calc(var(--base-size) * var(--scale));
    --size-xl: calc(var(--base-size) * var(--scale) * var(--scale));
    
    /* 复杂计算 */
    --golden-ratio: 1.618;
    --width: 300px;
    --height: calc(var(--width) / var(--golden-ratio));
}

/* 空间系统 */
:root {
    --space-unit: 0.5rem;
    --space-xs: calc(var(--space-unit) * 0.5);
    --space-sm: var(--space-unit);
    --space-md: calc(var(--space-unit) * 2);
    --space-lg: calc(var(--space-unit) * 3);
    --space-xl: calc(var(--space-unit) * 4);
}
```

## 🎨 现代布局模式（10分钟）

### 1. 圣杯布局（Grid版本）

```css
.holy-grail {
    display: grid;
    grid-template-areas:
        "header header header"
        "nav main aside"
        "footer footer footer";
    grid-template-columns: 200px 1fr 200px;
    grid-template-rows: auto 1fr auto;
    min-height: 100vh;
    gap: 20px;
}

.header { grid-area: header; }
.nav { grid-area: nav; }
.main { grid-area: main; }
.aside { grid-area: aside; }
.footer { grid-area: footer; }

/* 响应式调整 */
@media (max-width: 768px) {
    .holy-grail {
        grid-template-areas:
            "header"
            "nav"
            "main"
            "aside"
            "footer";
        grid-template-columns: 1fr;
    }
}
```

### 2. 卡片网格布局

```css
.card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    padding: 2rem;
}

/* 特色卡片 */
.card:first-child {
    grid-column: span 2;
    grid-row: span 2;
}

/* 交错布局 */
.card:nth-child(4n+1) {
    grid-column: span 2;
}
```

### 3. 杂志布局

```css
.magazine-layout {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 20px;
    grid-auto-rows: minmax(100px, auto);
}

.article {
    background: white;
    padding: 20px;
}

/* 不同文章尺寸 */
.article--featured {
    grid-column: span 4;
    grid-row: span 3;
}

.article--medium {
    grid-column: span 2;
    grid-row: span 2;
}

.article--small {
    grid-column: span 2;
    grid-row: span 1;
}

/* 创造视觉节奏 */
.article:nth-child(5n+1) {
    grid-column: span 3;
}

.article:nth-child(5n+3) {
    grid-row: span 2;
}
```

### 4. 砌体布局（Masonry）

```css
/* 使用Grid实现伪砌体布局 */
.masonry-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    grid-auto-rows: 10px;
    gap: 20px;
}

.masonry-item {
    background: white;
    padding: 20px;
}

/* 动态高度 */
.masonry-item--small {
    grid-row-end: span 20;
}

.masonry-item--medium {
    grid-row-end: span 30;
}

.masonry-item--large {
    grid-row-end: span 40;
}
```

## 🏆 综合实践项目：现代仪表板（10分钟）

创建一个使用Grid和CSS变量的响应式仪表板：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>现代仪表板 - Grid布局示例</title>
    <style>
        /* CSS变量定义 */
        :root {
            --primary: #3498db;
            --secondary: #2ecc71;
            --danger: #e74c3c;
            --warning: #f39c12;
            --dark: #2c3e50;
            --light: #ecf0f1;
            --white: #ffffff;
            
            --sidebar-width: 250px;
            --header-height: 60px;
            --spacing: 1rem;
            --radius: 8px;
            --shadow: 0 2px 10px rgba(0,0,0,0.1);
            
            --transition: all 0.3s ease;
        }
        
        /* 深色主题 */
        [data-theme="dark"] {
            --bg-primary: #1a1a1a;
            --bg-secondary: #2d2d2d;
            --text-primary: #ffffff;
            --text-secondary: #b0b0b0;
            --border: #404040;
        }
        
        /* 浅色主题 */
        [data-theme="light"] {
            --bg-primary: #f5f7fa;
            --bg-secondary: #ffffff;
            --text-primary: #2c3e50;
            --text-secondary: #7f8c8d;
            --border: #e0e0e0;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: var(--bg-primary);
            color: var(--text-primary);
            transition: var(--transition);
        }
        
        /* 主布局Grid */
        .dashboard {
            display: grid;
            grid-template-areas:
                "sidebar header"
                "sidebar main";
            grid-template-columns: var(--sidebar-width) 1fr;
            grid-template-rows: var(--header-height) 1fr;
            min-height: 100vh;
        }
        
        /* 头部 */
        .header {
            grid-area: header;
            background: var(--bg-secondary);
            border-bottom: 1px solid var(--border);
            padding: 0 calc(var(--spacing) * 2);
            display: flex;
            align-items: center;
            justify-content: space-between;
            box-shadow: var(--shadow);
        }
        
        /* 侧边栏 */
        .sidebar {
            grid-area: sidebar;
            background: var(--bg-secondary);
            border-right: 1px solid var(--border);
            padding: var(--spacing);
        }
        
        /* 主内容区 */
        .main {
            grid-area: main;
            padding: calc(var(--spacing) * 2);
            overflow-y: auto;
        }
        
        /* 卡片网格 */
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: calc(var(--spacing) * 1.5);
            margin-bottom: calc(var(--spacing) * 2);
        }
        
        .stat-card {
            background: var(--bg-secondary);
            padding: calc(var(--spacing) * 1.5);
            border-radius: var(--radius);
            box-shadow: var(--shadow);
            display: grid;
            gap: var(--spacing);
            transition: var(--transition);
        }
        
        .stat-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 20px rgba(0,0,0,0.15);
        }
        
        /* 图表网格 */
        .charts-grid {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: calc(var(--spacing) * 1.5);
            margin-bottom: calc(var(--spacing) * 2);
        }
        
        .chart-container {
            background: var(--bg-secondary);
            padding: calc(var(--spacing) * 1.5);
            border-radius: var(--radius);
            box-shadow: var(--shadow);
            min-height: 300px;
        }
        
        /* 表格区域 */
        .table-container {
            background: var(--bg-secondary);
            border-radius: var(--radius);
            box-shadow: var(--shadow);
            overflow: hidden;
        }
        
        /* 响应式调整 */
        @media (max-width: 1024px) {
            :root {
                --sidebar-width: 200px;
            }
            
            .charts-grid {
                grid-template-columns: 1fr;
            }
        }
        
        @media (max-width: 768px) {
            .dashboard {
                grid-template-areas:
                    "header"
                    "main";
                grid-template-columns: 1fr;
                grid-template-rows: var(--header-height) 1fr;
            }
            
            .sidebar {
                display: none;
            }
            
            .stats-grid {
                grid-template-columns: 1fr;
            }
        }
        
        /* 主题切换按钮 */
        .theme-toggle {
            background: var(--primary);
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: var(--radius);
            cursor: pointer;
            transition: var(--transition);
        }
        
        .theme-toggle:hover {
            background: var(--dark);
        }
        
        /* 装饰性样式 */
        h1 {
            font-size: 1.5rem;
            color: var(--text-primary);
        }
        
        h2 {
            font-size: 1.25rem;
            margin-bottom: var(--spacing);
            color: var(--text-primary);
        }
        
        .stat-value {
            font-size: 2rem;
            font-weight: bold;
            color: var(--primary);
        }
        
        .stat-label {
            color: var(--text-secondary);
            font-size: 0.875rem;
        }
        
        /* Grid区域可视化（仅用于演示） */
        .grid-demo {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 10px;
            padding: 20px;
            background: var(--light);
            border-radius: var(--radius);
            margin-top: calc(var(--spacing) * 2);
        }
        
        .grid-item {
            background: var(--primary);
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: var(--radius);
        }
        
        /* 特殊网格项 */
        .grid-item:first-child {
            grid-column: span 2;
            background: var(--secondary);
        }
        
        .grid-item:nth-child(4) {
            grid-row: span 2;
            background: var(--danger);
        }
        
        .grid-item:last-child {
            grid-column: span 3;
            background: var(--warning);
        }
    </style>
</head>
<body data-theme="light">
    <div class="dashboard">
        <!-- 侧边栏 -->
        <aside class="sidebar">
            <h2>仪表板</h2>
            <nav>
                <!-- 导航菜单 -->
            </nav>
        </aside>
        
        <!-- 头部 -->
        <header class="header">
            <h1>现代仪表板示例</h1>
            <button class="theme-toggle" onclick="toggleTheme()">切换主题</button>
        </header>
        
        <!-- 主内容 -->
        <main class="main">
            <!-- 统计卡片 -->
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-value">1,234</div>
                    <div class="stat-label">总用户数</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">567</div>
                    <div class="stat-label">活跃用户</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">89%</div>
                    <div class="stat-label">转化率</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">¥12.3k</div>
                    <div class="stat-label">总收入</div>
                </div>
            </div>
            
            <!-- 图表区域 -->
            <div class="charts-grid">
                <div class="chart-container">
                    <h2>销售趋势</h2>
                    <div style="height: 250px; display: flex; align-items: center; justify-content: center; color: var(--text-secondary);">
                        图表区域
                    </div>
                </div>
                <div class="chart-container">
                    <h2>用户分布</h2>
                    <div style="height: 250px; display: flex; align-items: center; justify-content: center; color: var(--text-secondary);">
                        饼图区域
                    </div>
                </div>
            </div>
            
            <!-- 表格区域 -->
            <div class="table-container">
                <h2 style="padding: var(--spacing);">最近订单</h2>
                <div style="padding: var(--spacing); color: var(--text-secondary);">
                    表格内容区域
                </div>
            </div>
            
            <!-- Grid演示 -->
            <div class="grid-demo">
                <div class="grid-item">跨2列</div>
                <div class="grid-item">普通项</div>
                <div class="grid-item">普通项</div>
                <div class="grid-item">跨2行</div>
                <div class="grid-item">普通项</div>
                <div class="grid-item">普通项</div>
                <div class="grid-item">跨3列</div>
            </div>
        </main>
    </div>
    
    <script>
        function toggleTheme() {
            const body = document.body;
            const currentTheme = body.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            body.setAttribute('data-theme', newTheme);
        }
    </script>
</body>
</html>
```

## 📚 学习资源

### 官方文档
- [MDN: CSS Grid Layout](https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_Grid_Layout)
- [MDN: CSS Custom Properties](https://developer.mozilla.org/zh-CN/docs/Web/CSS/Using_CSS_custom_properties)
- [CSS Grid规范](https://www.w3.org/TR/css-grid-1/)

### 在线工具
- [Grid Garden](https://cssgridgarden.com/) - Grid学习游戏
- [CSS Grid Generator](https://cssgrid-generator.netlify.app/) - 可视化Grid生成器
- [Grid by Example](https://gridbyexample.com/) - Grid示例集合

### 推荐阅读
- [CSS Grid完整指南](https://css-tricks.com/snippets/css/complete-guide-grid/)
- [Grid布局实战](https://www.smashingmagazine.com/2017/06/building-production-ready-css-grid-layout/)
- [CSS变量实用指南](https://developer.mozilla.org/zh-CN/docs/Web/CSS/--*)

## ✅ 今日检查清单

- [ ] 理解CSS Grid的基本概念
- [ ] 掌握Grid容器的所有属性
- [ ] 熟练使用Grid项目定位
- [ ] 理解Grid与Flexbox的区别
- [ ] 掌握响应式Grid布局技巧
- [ ] 学会使用CSS自定义属性
- [ ] 实现至少3种Grid布局模式
- [ ] 完成仪表板项目

## 🤔 自测问题

1. **CSS Grid和Flexbox的主要区别是什么？分别适合什么场景？**

2. **如何创建一个响应式的网格布局，让列数自动适应容器宽度？**

3. **grid-template-areas有什么优势？如何使用？**

4. **CSS自定义属性（变量）相比预处理器变量有什么优势？**

5. **如何实现一个既有固定列又有弹性列的网格布局？**

## 🎯 拓展练习

1. **创建照片墙布局**
   - 使用Grid创建Pinterest风格布局
   - 实现响应式列数变化
   - 添加悬停放大效果

2. **构建复杂表单**
   - 使用Grid对齐表单元素
   - 实现多列表单布局
   - 响应式调整为单列

3. **实现日历界面**
   - 使用Grid创建月历视图
   - 高亮今天和选中日期
   - 添加事件标记

4. **开发价格表组件**
   - 使用Grid对齐价格卡片
   - 实现特色方案高亮
   - 响应式堆叠布局

## 💡 今日总结

今天我们深入学习了CSS Grid布局系统和现代CSS技术：

- **Grid布局**：二维布局的强大工具，适合页面整体布局
- **灵活定位**：通过网格线和区域名称精确控制元素位置
- **响应式模式**：使用auto-fit/auto-fill创建自适应网格
- **CSS变量**：实现动态主题和可维护的样式系统
- **现代布局**：结合Grid和Flexbox创建复杂而优雅的界面

记住：**Grid让复杂布局变简单，CSS变量让样式更智能！**

明天我们将学习Tailwind CSS，探索实用优先的CSS框架。准备好体验全新的CSS开发方式了吗？🚀