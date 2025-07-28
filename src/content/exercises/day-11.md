---
title: "DevTools侦探挑战"
day: 11
description: "使用Chrome DevTools调试和优化一个充满问题的电商网站，包括JavaScript错误、性能瓶颈、内存泄漏等"
difficulty: "intermediate"
tags: ["devtools", "debugging", "performance", "optimization"]
estimatedTime: 90
requirements:
  - "使用Console面板找出并修复所有JavaScript错误"
  - "使用Performance面板识别并优化性能瓶颈"
  - "使用Memory面板查找并修复内存泄漏"
  - "使用Network面板优化网络请求"
  - "达到90+的Lighthouse性能分数"
---

# DevTools侦探挑战 🔍

## 任务背景

你是一名Web性能专家，被雇佣来调试和优化一个性能糟糕的电商网站。这个网站存在多个问题：JavaScript错误、性能瓶颈、内存泄漏、网络请求问题等。你需要使用Chrome DevTools找出并修复所有问题。

## 初始代码（有问题的版本）

### index.html
```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>优品商城 - 需要调试的版本</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <header class="header">
        <h1>优品商城</h1>
        <nav class="nav">
            <input type="search" class="search" placeholder="搜索商品...">
            <button class="cart-btn">购物车 (<span id="cart-count">0</span>)</button>
        </nav>
    </header>

    <main class="main">
        <aside class="filters">
            <h2>筛选</h2>
            <div class="filter-group">
                <label>
                    <input type="checkbox" name="category" value="electronics"> 电子产品
                </label>
                <label>
                    <input type="checkbox" name="category" value="clothing"> 服装
                </label>
                <label>
                    <input type="checkbox" name="category" value="books"> 图书
                </label>
            </div>
            <div class="price-filter">
                <label>最高价格: <span id="price-display">1000</span>元</label>
                <input type="range" id="price-range" min="0" max="1000" value="1000">
            </div>
        </aside>

        <section class="products" id="products">
            <!-- 产品将通过JavaScript加载 -->
        </section>
    </main>

    <div class="modal" id="product-modal">
        <div class="modal-content">
            <span class="close">&times;</span>
            <div id="modal-body"></div>
        </div>
    </div>

    <script src="app.js"></script>
</body>
</html>
```

### styles.css
```css
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: Arial, sans-serif;
    background: #f5f5f5;
}

.header {
    background: #333;
    color: white;
    padding: 1rem;
    position: sticky;
    top: 0;
    z-index: 100;
}

.nav {
    display: flex;
    gap: 1rem;
    margin-top: 1rem;
}

.search {
    flex: 1;
    padding: 0.5rem;
    border: none;
    border-radius: 4px;
}

.cart-btn {
    background: #007bff;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
}

.main {
    display: flex;
    max-width: 1200px;
    margin: 2rem auto;
    gap: 2rem;
}

.filters {
    background: white;
    padding: 1rem;
    border-radius: 8px;
    width: 250px;
    height: fit-content;
}

.filter-group label {
    display: block;
    margin: 0.5rem 0;
}

.price-filter {
    margin-top: 1rem;
}

#price-range {
    width: 100%;
    margin-top: 0.5rem;
}

.products {
    flex: 1;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1rem;
}

.product-card {
    background: white;
    border-radius: 8px;
    overflow: hidden;
    transition: transform 0.3s;
    cursor: pointer;
}

.product-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.product-image {
    width: 100%;
    height: 200px;
    object-fit: cover;
}

.product-info {
    padding: 1rem;
}

.product-title {
    font-size: 1.1rem;
    margin-bottom: 0.5rem;
}

.product-price {
    color: #007bff;
    font-size: 1.2rem;
    font-weight: bold;
}

.add-to-cart {
    background: #28a745;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    width: 100%;
    margin-top: 0.5rem;
}

.modal {
    display: none;
    position: fixed;
    z-index: 1000;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0,0,0,0.5);
}

.modal-content {
    background-color: white;
    margin: 15% auto;
    padding: 20px;
    border-radius: 8px;
    width: 80%;
    max-width: 600px;
}

.close {
    color: #aaa;
    float: right;
    font-size: 28px;
    font-weight: bold;
    cursor: pointer;
}

.close:hover {
    color: black;
}

/* 性能问题：使用了昂贵的CSS选择器 */
body * div * span * {
    letter-spacing: 0.05em;
}

/* 性能问题：过度使用动画 */
* {
    animation: subtle-move 10s infinite;
}

@keyframes subtle-move {
    0%, 100% { transform: translateX(0); }
    50% { transform: translateX(1px); }
}
```

### app.js (包含多个需要调试的问题)
```javascript
// 问题1: 全局变量污染
products = [];
cart = [];
filters = {
    categories: [],
    maxPrice: 1000
};

// 问题2: 内存泄漏 - 事件监听器没有清理
const eventListeners = [];

// 问题3: 错误的API端点
const API_BASE = 'https://api.example.com/v1';

// 问题4: 同步XHR请求（已废弃）
function loadProductsSync() {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', API_BASE + '/products', false); // 同步请求
    xhr.send();
    
    if (xhr.status === 200) {
        return JSON.parse(xhr.responseText);
    }
    return [];
}

// 问题5: 性能问题 - 没有防抖的搜索
document.querySelector('.search').addEventListener('input', function(e) {
    searchProducts(e.target.value);
});

// 问题6: 错误处理不当
function searchProducts(query) {
    fetch(`${API_BASE}/search?q=${query}`)
        .then(res => res.json())
        .then(data => {
            // 问题7: 直接操作DOM，没有优化
            renderProducts(data);
        });
    // 没有catch处理错误
}

// 问题8: 内存泄漏 - 闭包持有大对象
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    // 问题9: 图片没有懒加载
    card.innerHTML = `
        <img src="${product.image}" class="product-image" alt="${product.name}">
        <div class="product-info">
            <h3 class="product-title">${product.name}</h3>
            <p class="product-price">¥${product.price}</p>
            <button class="add-to-cart">加入购物车</button>
        </div>
    `;
    
    // 问题10: 内存泄漏 - 循环引用
    card.product = product;
    product.element = card;
    
    // 问题11: 事件监听器累积
    card.addEventListener('click', function() {
        showProductDetail(product);
    });
    
    const addToCartBtn = card.querySelector('.add-to-cart');
    addToCartBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        addToCart(product);
    });
    
    return card;
}

// 问题12: 性能问题 - 强制同步布局
function renderProducts(productList) {
    const container = document.getElementById('products');
    container.innerHTML = ''; // 问题13: 清空DOM没有清理事件监听器
    
    productList.forEach(product => {
        const card = createProductCard(product);
        container.appendChild(card);
        
        // 问题14: 在循环中读取布局属性
        console.log(card.offsetHeight); // 强制重排
    });
}

// 问题15: 没有使用事件委托
function addToCart(product) {
    cart.push(product);
    
    // 问题16: 没有去重
    updateCartCount();
    
    // 问题17: 每次都保存到localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
}

// 问题18: 低效的计数方法
function updateCartCount() {
    let count = 0;
    for (let i = 0; i < cart.length; i++) {
        count = count + 1;
    }
    document.getElementById('cart-count').innerText = count;
}

// 问题19: 模态框内存泄漏
function showProductDetail(product) {
    const modal = document.getElementById('product-modal');
    const modalBody = document.getElementById('modal-body');
    
    // 问题20: 使用innerHTML可能导致XSS
    modalBody.innerHTML = `
        <h2>${product.name}</h2>
        <img src="${product.image}" style="width: 100%;">
        <p>${product.description}</p>
        <p class="product-price">¥${product.price}</p>
    `;
    
    modal.style.display = 'block';
    
    // 问题21: 重复添加事件监听器
    document.querySelector('.close').addEventListener('click', () => {
        modal.style.display = 'none';
    });
}

// 问题22: 价格筛选性能问题
document.getElementById('price-range').addEventListener('input', function(e) {
    document.getElementById('price-display').textContent = e.target.value;
    filters.maxPrice = parseInt(e.target.value);
    
    // 问题23: 每次都重新渲染所有产品
    filterProducts();
});

// 问题24: 低效的筛选算法
function filterProducts() {
    let filtered = products;
    
    // 问题25: 多次遍历数组
    if (filters.categories.length > 0) {
        filtered = filtered.filter(p => {
            for (let i = 0; i < filters.categories.length; i++) {
                if (p.category === filters.categories[i]) {
                    return true;
                }
            }
            return false;
        });
    }
    
    filtered = filtered.filter(p => p.price <= filters.maxPrice);
    
    renderProducts(filtered);
}

// 问题26: 分类筛选没有防抖
document.querySelectorAll('input[name="category"]').forEach(checkbox => {
    checkbox.addEventListener('change', function() {
        if (this.checked) {
            filters.categories.push(this.value);
        } else {
            filters.categories = filters.categories.filter(c => c !== this.value);
        }
        filterProducts();
    });
});

// 问题27: 页面加载时的性能问题
window.onload = function() {
    // 模拟加载产品数据（实际应该是异步的）
    products = generateMockProducts(100);
    renderProducts(products);
    
    // 问题28: 定时器内存泄漏
    setInterval(function() {
        // 问题29: 不必要的DOM查询
        document.querySelectorAll('.product-card').forEach(card => {
            // 问题30: 强制样式计算
            card.style.opacity = Math.random() > 0.5 ? '1' : '0.99';
        });
    }, 100);
};

// 生成模拟数据
function generateMockProducts(count) {
    const categories = ['electronics', 'clothing', 'books'];
    const products = [];
    
    for (let i = 0; i < count; i++) {
        products.push({
            id: i,
            name: `产品 ${i + 1}`,
            price: Math.floor(Math.random() * 1000),
            category: categories[Math.floor(Math.random() * categories.length)],
            image: `https://via.placeholder.com/250?text=Product+${i + 1}`,
            description: `这是产品 ${i + 1} 的详细描述。`
        });
    }
    
    return products;
}

// 问题31: console.log留在生产代码中
console.log('App loaded');
console.log('Products:', products);
console.log('Cart:', cart);
```

## 调试任务清单

使用Chrome DevTools完成以下任务：

### 1. Console错误修复（15分）
- [ ] 打开Console面板，查看所有错误信息
- [ ] 修复未定义变量错误
- [ ] 修复API请求失败的问题
- [ ] 移除生产环境的console.log

### 2. 性能问题诊断（20分）
- [ ] 使用Performance面板录制页面加载
- [ ] 识别长任务和主线程阻塞
- [ ] 找出强制同步布局的代码
- [ ] 分析CSS动画的性能影响

### 3. 内存泄漏排查（20分）
- [ ] 使用Memory面板拍摄堆快照
- [ ] 执行添加/删除产品操作
- [ ] 对比堆快照找出泄漏对象
- [ ] 修复事件监听器累积问题

### 4. 网络优化（15分）
- [ ] 使用Network面板分析请求
- [ ] 将同步XHR改为异步请求
- [ ] 实现请求缓存策略
- [ ] 添加适当的错误处理

### 5. DOM和样式优化（10分）
- [ ] 使用Elements面板检查DOM结构
- [ ] 移除昂贵的CSS选择器
- [ ] 优化动画性能
- [ ] 实现虚拟滚动或分页

### 6. 交互优化（10分）
- [ ] 为搜索输入添加防抖
- [ ] 使用事件委托优化事件处理
- [ ] 实现图片懒加载
- [ ] 优化筛选器性能

## 性能目标

修复所有问题后，你的应用应该达到：

- **首次内容绘制(FCP)**: < 1.8秒
- **最大内容绘制(LCP)**: < 2.5秒
- **总阻塞时间(TBT)**: < 300毫秒
- **累积布局偏移(CLS)**: < 0.1
- **JavaScript堆大小**: 不随操作持续增长
- **无控制台错误**

## 额外挑战

1. **使用Coverage工具**：找出未使用的CSS和JavaScript代码
2. **使用Lighthouse**：生成完整的性能报告
3. **设置Performance Budget**：创建性能预算并监控
4. **创建自定义Snippets**：编写调试辅助代码片段

## 提交要求

1. 修复后的完整代码
2. 性能优化前后的对比截图
3. 详细的问题分析报告，包括：
   - 发现的每个问题
   - 使用的DevTools功能
   - 解决方案说明
4. Performance录制文件（导出的JSON）

## 评分标准

- 问题识别完整性（30%）
- 修复方案正确性（30%）
- 性能提升效果（20%）
- DevTools使用熟练度（20%）

## 提示

1. 先使用Console查看明显的错误
2. 使用Network面板的Preserve log选项
3. 在Performance面板中寻找红色三角警告
4. 使用Memory面板的对比功能
5. 别忘了检查Application面板的存储使用

祝你调试愉快！记住，优秀的开发者不仅会写代码，更要会调试代码。 🔍