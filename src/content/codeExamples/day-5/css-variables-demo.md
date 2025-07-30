---
day: 5
title: "CSS自定义属性（变量）完整演示"
description: "展示CSS自定义属性的完整用法，包括主题切换、动态更新、响应式设计和JavaScript集成"
category: "advanced"
language: "css"
---

# CSS自定义属性（变量）完整演示

展示CSS变量的强大功能，包括主题系统、响应式变量和动态控制。

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CSS自定义属性（变量）完整演示</title>
    <style>
        /* 全局CSS变量定义 */
        :root {
            /* 颜色系统 */
            --primary: #3498db;
            --secondary: #2ecc71;
            --danger: #e74c3c;
            --warning: #f39c12;
            --info: #00bcd4;
            --dark: #2c3e50;
            --light: #ecf0f1;
            --white: #ffffff;
            
            /* 间距系统 */
            --space-xs: 0.25rem;
            --space-sm: 0.5rem;
            --space-md: 1rem;
            --space-lg: 1.5rem;
            --space-xl: 2rem;
            --space-2xl: 3rem;
            
            /* 字体系统 */
            --font-xs: 0.75rem;
            --font-sm: 0.875rem;
            --font-base: 1rem;
            --font-lg: 1.125rem;
            --font-xl: 1.25rem;
            --font-2xl: 1.5rem;
            --font-3xl: 2rem;
            
            /* 圆角系统 */
            --radius-sm: 0.25rem;
            --radius-md: 0.5rem;
            --radius-lg: 1rem;
            --radius-full: 9999px;
            
            /* 阴影系统 */
            --shadow-sm: 0 2px 4px rgba(0,0,0,0.1);
            --shadow-md: 0 4px 8px rgba(0,0,0,0.15);
            --shadow-lg: 0 8px 16px rgba(0,0,0,0.2);
            --shadow-xl: 0 16px 32px rgba(0,0,0,0.25);
            
            /* 过渡系统 */
            --transition-fast: 150ms ease;
            --transition-base: 300ms ease;
            --transition-slow: 500ms ease;
            
            /* 主题颜色 */
            --bg-primary: #f5f7fa;
            --bg-secondary: #ffffff;
            --text-primary: #2c3e50;
            --text-secondary: #7f8c8d;
            --border-color: #e0e0e0;
        }
        
        /* 深色主题 */
        [data-theme="dark"] {
            --bg-primary: #1a1a1a;
            --bg-secondary: #2d2d2d;
            --text-primary: #ffffff;
            --text-secondary: #b0b0b0;
            --border-color: #404040;
            
            /* 调整颜色亮度 */
            --primary: #5dade2;
            --secondary: #58d68d;
            --danger: #ec7063;
            --warning: #f7b84b;
        }
        
        /* 基础样式 */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            line-height: 1.6;
            background: var(--bg-primary);
            color: var(--text-primary);
            transition: background-color var(--transition-base),
                        color var(--transition-base);
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: var(--space-xl);
        }
        
        /* 按钮组件 */
        .btn {
            padding: var(--space-sm) var(--space-lg);
            border: none;
            border-radius: var(--radius-md);
            font-size: var(--font-base);
            cursor: pointer;
            transition: all var(--transition-base);
            text-decoration: none;
            display: inline-block;
        }
        
        .btn-primary {
            background: var(--primary);
            color: var(--white);
        }
        
        .btn-secondary {
            background: var(--secondary);
            color: var(--white);
        }
        
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: var(--shadow-md);
            filter: brightness(1.1);
        }
        
        /* 卡片组件 */
        .card {
            background: var(--bg-secondary);
            border-radius: var(--radius-lg);
            padding: var(--space-xl);
            box-shadow: var(--shadow-sm);
            transition: var(--transition);
        }
        
        .card:hover {
            transform: translateY(-4px);
            box-shadow: var(--shadow-lg);
        }
        
        /* 间距演示 */
        .spacing-item {
            background: var(--primary);
            color: var(--white);
            padding: var(--space-md);
            border-radius: var(--radius-sm);
            margin: var(--space-sm) 0;
        }
        
        .spacing-xs { padding: var(--space-xs); }
        .spacing-sm { padding: var(--space-sm); }
        .spacing-md { padding: var(--space-md); }
        .spacing-lg { padding: var(--space-lg); }
        .spacing-xl { padding: var(--space-xl); }
        
        /* 动态Grid */
        .dynamic-grid {
            --columns: 3;
            --gap: var(--space-lg);
            
            display: grid;
            grid-template-columns: repeat(var(--columns), 1fr);
            gap: var(--gap);
            margin-bottom: var(--space-lg);
        }
        
        /* 响应式变量 */
        @media (max-width: 768px) {
            :root {
                --font-3xl: 1.5rem;
                --font-2xl: 1.25rem;
                --space-xl: 1.5rem;
                --space-2xl: 2rem;
            }
            
            .dynamic-grid {
                --columns: 2;
            }
        }
        
        @media (max-width: 480px) {
            :root {
                --font-3xl: 1.25rem;
                --font-2xl: 1.125rem;
                --space-lg: 1rem;
                --space-xl: 1.25rem;
            }
            
            .dynamic-grid {
                --columns: 1;
            }
        }
        
        /* 性能优化：使用CSS变量减少重复 */
        .performance-demo {
            --item-size: 100px;
            --item-color: var(--primary);
            
            display: grid;
            grid-template-columns: repeat(auto-fit, var(--item-size));
            gap: var(--space-md);
            justify-content: center;
        }
        
        .perf-item {
            width: var(--item-size);
            height: var(--item-size);
            background: var(--item-color);
            border-radius: var(--radius-md);
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--white);
            font-weight: bold;
        }
    </style>
</head>
<body data-theme="light">
    <div class="container">
        <h1>CSS自定义属性（变量）完整演示</h1>
        
        <!-- 主题切换 -->
        <div class="theme-switcher">
            <button class="btn btn-primary" onclick="setTheme('light')">浅色主题</button>
            <button class="btn btn-primary" onclick="setTheme('dark')">深色主题</button>
        </div>
        
        <!-- 颜色系统展示 -->
        <section>
            <h2>颜色系统</h2>
            <div class="color-grid">
                <div class="card" style="background: var(--primary); color: white;">
                    Primary - var(--primary)
                </div>
                <div class="card" style="background: var(--secondary); color: white;">
                    Secondary - var(--secondary)
                </div>
            </div>
        </section>
        
        <!-- 间距系统 -->
        <section>
            <h2>间距系统</h2>
            <div class="spacing-item spacing-xs">XS间距 - var(--space-xs)</div>
            <div class="spacing-item spacing-sm">SM间距 - var(--space-sm)</div>
            <div class="spacing-item spacing-md">MD间距 - var(--space-md)</div>
            <div class="spacing-item spacing-lg">LG间距 - var(--space-lg)</div>
            <div class="spacing-item spacing-xl">XL间距 - var(--space-xl)</div>
        </section>
        
        <!-- 响应式Grid -->
        <section>
            <h2>响应式Grid（使用CSS变量）</h2>
            <div class="dynamic-grid">
                <div class="card">项目 1</div>
                <div class="card">项目 2</div>
                <div class="card">项目 3</div>
                <div class="card">项目 4</div>
                <div class="card">项目 5</div>
                <div class="card">项目 6</div>
            </div>
            <p>调整窗口大小查看列数变化</p>
        </section>
        
        <!-- 动态控制 -->
        <section>
            <h2>动态控制</h2>
            <input type="color" id="custom-color" value="#3498db">
            <button class="btn btn-primary" onclick="applyCustomColor()">应用颜色</button>
            
            <div class="performance-demo" id="perfDemo">
                <div class="perf-item">1</div>
                <div class="perf-item">2</div>
                <div class="perf-item">3</div>
                <div class="perf-item">4</div>
                <div class="perf-item">5</div>
            </div>
        </section>
    </div>
    
    <script>
        // 主题切换
        function setTheme(theme) {
            document.body.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme);
        }
        
        // 加载保存的主题
        const savedTheme = localStorage.getItem('theme') || 'light';
        setTheme(savedTheme);
        
        // 应用自定义颜色
        function applyCustomColor() {
            const color = document.getElementById('custom-color').value;
            document.documentElement.style.setProperty('--primary', color);
        }
        
        // 更新性能演示
        function updatePerfDemo() {
            const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6'];
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            document.getElementById('perfDemo').style.setProperty('--item-color', randomColor);
        }
    </script>
</body>
</html>
```

## 关键概念

### 1. CSS变量定义
```css
:root {
    --primary: #3498db;
    --space-md: 1rem;
}
```

### 2. 使用CSS变量
```css
.element {
    color: var(--primary);
    padding: var(--space-md);
}
```

### 3. 动态修改
```javascript
document.documentElement.style.setProperty('--primary', newColor);
```

### 4. 响应式变量
```css
@media (max-width: 768px) {
    :root {
        --space-md: 0.75rem;
    }
}
```

### 5. 作用域变量
```css
.component {
    --local-color: #333;
    color: var(--local-color);
}
```

## 最佳实践

1. **命名规范**：使用清晰的语义化命名
2. **组织结构**：按功能分组（颜色、间距、字体等）
3. **回退值**：`var(--color, #000)` 提供默认值
4. **性能考虑**：避免过度嵌套和复杂计算
5. **浏览器兼容**：检查目标浏览器支持情况