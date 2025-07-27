# Day 04 练习：创建弹性卡片布局系统

## 🎯 练习目标

通过本练习，你将：
- 综合运用各种CSS选择器
- 理解并实践盒模型计算
- 掌握不同定位方式的应用
- 熟练使用Flexbox创建响应式布局
- 实现交互式悬停效果和动画

## 📝 练习要求

### 项目：产品展示卡片系统

创建一个现代化的产品展示页面，包含：
1. 响应式卡片网格布局
2. 卡片悬停效果
3. 固定导航栏
4. 浮动操作按钮
5. 模态框展示详情

### 页面结构要求

```
产品展示页面
├── 固定导航栏
│   ├── Logo
│   ├── 导航链接
│   └── 搜索框
├── 主要内容区
│   ├── 筛选侧边栏
│   │   ├── 分类选择
│   │   ├── 价格范围
│   │   └── 排序选项
│   └── 产品卡片网格
│       ├── 产品卡片×N
│       │   ├── 产品图片
│       │   ├── 产品信息
│       │   ├── 价格标签
│       │   └── 操作按钮
│       └── 加载更多按钮
└── 浮动操作按钮
    └── 返回顶部
```

## 📋 具体任务

### 任务1：设置项目基础

创建以下文件结构：
```
day-04-exercise/
├── index.html
├── styles.css
└── images/
    └── (产品图片占位)
```

### 任务2：HTML结构搭建

创建 `index.html`：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>现代产品展示 - CSS练习</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <!-- 导航栏 -->
    <nav class="navbar">
        <!-- 导航内容 -->
    </nav>
    
    <!-- 主容器 -->
    <div class="container">
        <!-- 侧边栏 -->
        <aside class="sidebar">
            <!-- 筛选选项 -->
        </aside>
        
        <!-- 产品网格 -->
        <main class="product-grid">
            <!-- 产品卡片 -->
        </main>
    </div>
    
    <!-- 浮动按钮 -->
    <button class="fab">↑</button>
</body>
</html>
```

### 任务3：实现导航栏样式

要求：
- 使用 `position: fixed` 固定在顶部
- 使用 Flexbox 布局内容
- 添加阴影效果
- 响应式设计

```css
/* 导航栏样式 */
.navbar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 60px;
    background: white;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    z-index: 1000;
    
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 2rem;
}

/* 导航链接使用 Flexbox */
.nav-links {
    display: flex;
    gap: 2rem;
    list-style: none;
}

/* 使用伪类选择器 */
.nav-links a:hover {
    color: #3498db;
    transform: translateY(-2px);
}
```

### 任务4：创建产品卡片

设计要求：
1. **卡片容器**
   - 使用 `box-shadow` 创建立体效果
   - 圆角边框
   - 悬停时上浮效果

2. **图片容器**
   - 固定宽高比（使用padding技巧）
   - 图片覆盖效果
   - 悬停时缩放

3. **内容区域**
   - 使用 Flexbox 排列
   - 价格标签绝对定位
   - 按钮组底部对齐

```css
/* 产品卡片 */
.product-card {
    background: white;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    transition: all 0.3s ease;
    
    display: flex;
    flex-direction: column;
    height: 100%;
}

.product-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 20px rgba(0,0,0,0.15);
}

/* 图片容器 - 16:9 比例 */
.product-image {
    position: relative;
    padding-bottom: 56.25%;
    overflow: hidden;
}

.product-image img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
}

.product-card:hover .product-image img {
    transform: scale(1.1);
}

/* 价格标签 - 绝对定位 */
.price-tag {
    position: absolute;
    top: 10px;
    right: 10px;
    background: #e74c3c;
    color: white;
    padding: 5px 10px;
    border-radius: 20px;
    font-weight: bold;
}

/* 内容区域 - Flexbox */
.product-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 1.5rem;
}

.product-title {
    font-size: 1.25rem;
    margin-bottom: 0.5rem;
    color: #2c3e50;
}

.product-description {
    flex: 1;
    color: #7f8c8d;
    line-height: 1.6;
    margin-bottom: 1rem;
}

/* 按钮组 */
.product-actions {
    display: flex;
    gap: 10px;
    margin-top: auto;
}

.btn {
    flex: 1;
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.btn-primary {
    background: #3498db;
    color: white;
}

.btn-primary:hover {
    background: #2980b9;
}

.btn-secondary {
    background: white;
    color: #3498db;
    border: 1px solid #3498db;
}

.btn-secondary:hover {
    background: #3498db;
    color: white;
}
```

### 任务5：实现响应式网格布局

要求：
- 使用 Flexbox 创建网格
- 自适应不同屏幕尺寸
- 保持卡片等高

```css
/* 主容器 */
.container {
    display: flex;
    gap: 2rem;
    max-width: 1200px;
    margin: 80px auto 2rem;
    padding: 0 1rem;
}

/* 侧边栏 */
.sidebar {
    flex: 0 0 250px;
    background: white;
    padding: 1.5rem;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    align-self: flex-start;
    position: sticky;
    top: 80px;
}

/* 产品网格 */
.product-grid {
    flex: 1;
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
}

/* 卡片响应式 */
.product-card {
    flex: 1 1 300px;
    max-width: 400px;
}

/* 响应式断点 */
@media (max-width: 768px) {
    .container {
        flex-direction: column;
    }
    
    .sidebar {
        position: static;
        flex: 1;
    }
    
    .product-grid {
        justify-content: center;
    }
    
    .product-card {
        flex: 1 1 100%;
        max-width: 100%;
    }
}
```

### 任务6：添加高级选择器和伪元素

要求使用多种选择器：

```css
/* 属性选择器 */
input[type="range"] {
    width: 100%;
    margin: 10px 0;
}

/* 伪类选择器组合 */
.product-card:nth-child(3n+1):hover {
    transform: translateY(-5px) rotate(-1deg);
}

.product-card:nth-child(3n+2):hover {
    transform: translateY(-5px);
}

.product-card:nth-child(3n):hover {
    transform: translateY(-5px) rotate(1deg);
}

/* 第一个和最后一个特殊样式 */
.product-card:first-child .price-tag {
    background: #f39c12;
}

.product-card:last-child {
    border: 2px solid #3498db;
}

/* 伪元素装饰 */
.product-title::before {
    content: "🔥 ";
    opacity: 0;
    transition: opacity 0.3s;
}

.product-card:hover .product-title::before {
    opacity: 1;
}

/* "新品"标签 */
.product-card:nth-child(-n+3)::after {
    content: "NEW";
    position: absolute;
    top: 20px;
    left: 20px;
    background: #2ecc71;
    color: white;
    padding: 5px 10px;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: bold;
}

/* 空状态 */
.product-grid:empty::after {
    content: "暂无产品";
    display: block;
    text-align: center;
    color: #95a5a6;
    font-size: 1.5rem;
    padding: 3rem;
}
```

### 任务7：实现浮动操作按钮（FAB）

```css
/* 浮动操作按钮 */
.fab {
    position: fixed;
    bottom: 30px;
    right: 30px;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: #3498db;
    color: white;
    border: none;
    font-size: 24px;
    cursor: pointer;
    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    transition: all 0.3s ease;
    z-index: 999;
}

.fab:hover {
    transform: scale(1.1);
    box-shadow: 0 5px 20px rgba(0,0,0,0.3);
}

.fab:active {
    transform: scale(0.95);
}

/* 隐藏/显示动画 */
.fab.hidden {
    transform: translateY(100px);
    opacity: 0;
}
```

### 任务8：创建完整示例

构建至少包含9个产品卡片的完整页面，展示：
- 不同的产品类型
- 价格标签
- 悬停效果
- 响应式布局

## 🎨 设计规范

### 颜色方案
```css
:root {
    --primary: #3498db;
    --secondary: #2ecc71;
    --danger: #e74c3c;
    --warning: #f39c12;
    --dark: #2c3e50;
    --gray: #95a5a6;
    --light-gray: #ecf0f1;
    --white: #ffffff;
}
```

### 间距系统
```css
/* 使用一致的间距 */
--spacing-xs: 0.25rem;
--spacing-sm: 0.5rem;
--spacing-md: 1rem;
--spacing-lg: 1.5rem;
--spacing-xl: 2rem;
```

### 阴影效果
```css
--shadow-sm: 0 2px 5px rgba(0,0,0,0.1);
--shadow-md: 0 5px 15px rgba(0,0,0,0.1);
--shadow-lg: 0 10px 30px rgba(0,0,0,0.15);
```

## 💡 提示

### Flexbox 技巧
```css
/* 等高卡片 */
.product-grid {
    display: flex;
    align-items: stretch;
}

/* 自动边距对齐 */
.product-actions {
    margin-top: auto; /* 推到底部 */
}

/* 灵活的网格 */
.product-card {
    flex: 1 1 calc(33.333% - 1rem);
}
```

### 定位技巧
```css
/* 居中绝对定位元素 */
.centered {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}

/* Sticky 侧边栏 */
.sidebar {
    position: sticky;
    top: 80px; /* 导航栏高度 + 间距 */
}
```

### 选择器优化
```css
/* 避免过度嵌套 */
/* 不好 */
.container .product-grid .product-card .product-content .product-title { }

/* 好 */
.product-title { }

/* 使用组合 */
.product-card:hover .product-title,
.product-card:focus .product-title {
    color: var(--primary);
}
```

## 📊 评分标准

| 评分项 | 分值 | 要求 |
|--------|------|------|
| HTML结构 | 15分 | 语义化标签，结构清晰 |
| CSS选择器使用 | 20分 | 使用至少5种不同类型的选择器 |
| Flexbox布局 | 25分 | 正确使用容器和项目属性 |
| 定位应用 | 15分 | 合理使用不同定位方式 |
| 响应式设计 | 15分 | 至少3个断点，流畅适配 |
| 交互效果 | 10分 | 平滑的过渡和悬停效果 |

**优秀标准（90分以上）：**
- 像素级还原设计
- 创新的交互效果
- 优秀的代码组织
- 完美的响应式体验

## 🚨 常见问题

### 1. Flexbox 子元素高度不一致
```css
/* 解决方案：设置 align-items */
.container {
    display: flex;
    align-items: stretch; /* 默认值，拉伸到等高 */
}
```

### 2. 绝对定位元素超出容器
```css
/* 父容器需要相对定位 */
.parent {
    position: relative;
    overflow: hidden; /* 隐藏超出部分 */
}
```

### 3. z-index 不生效
```css
/* 确保元素有定位 */
.element {
    position: relative; /* 或 absolute/fixed */
    z-index: 10;
}
```

### 4. Flex 项目不换行
```css
.container {
    display: flex;
    flex-wrap: wrap; /* 允许换行 */
}
```

## 🎯 进阶挑战

1. **添加筛选功能**
   - 使用 CSS 实现筛选效果
   - `:checked` 伪类控制显示
   - 平滑的过渡动画

2. **实现标签过滤**
   ```css
   /* 使用兄弟选择器 */
   input[type="checkbox"]:checked ~ .product-grid .product-card[data-category="electronics"] {
       display: block;
   }
   ```

3. **创建加载动画**
   - 使用伪元素
   - CSS 动画
   - 骨架屏效果

4. **优化性能**
   - 使用 CSS 变量
   - 减少重绘重排
   - 优化选择器

## 🔍 测试要点

### 布局测试
- [ ] 不同屏幕尺寸下布局正常
- [ ] 卡片保持等高
- [ ] 内容不溢出
- [ ] 间距一致

### 交互测试
- [ ] 悬停效果流畅
- [ ] 点击反馈明显
- [ ] 动画不卡顿
- [ ] 焦点状态清晰

### 兼容性测试
- [ ] Chrome/Firefox/Safari 表现一致
- [ ] 移动端触摸正常
- [ ] 不同分辨率适配
- [ ] 打印样式合理

## 📤 提交要求

1. **文件组织**
   ```
   day-04-exercise/
   ├── index.html
   ├── styles.css
   ├── README.md (项目说明)
   └── screenshots/
       ├── desktop.png
       ├── tablet.png
       └── mobile.png
   ```

2. **代码规范**
   - CSS 属性按类型分组
   - 使用有意义的类名
   - 添加必要的注释
   - 保持一致的缩进

3. **自我评估**
   - 列出使用的 CSS 特性
   - 说明遇到的挑战
   - 分享学到的技巧

祝你完成出色的作品！记住：**CSS 是将设计变为现实的魔法！** 🎨✨
