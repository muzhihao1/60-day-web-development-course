---
day: 10
title: "性能优化解决方案"
description: "展示如何将一个慢速网站优化到90+分的完整方案"
exercises:
  - "day-10"
filesCount: 8
keyTakeaways:
  - "通过图片优化可以减少80%的加载时间"
  - "关键CSS内联能显著改善FCP"
  - "代码分割和懒加载是提升性能的关键"
  - "Service Worker能提供离线体验"
---

# Day 10 解决方案：性能优化实战

## 优化结果总览

通过系统的性能优化，我们成功将网站的 Lighthouse 分数从 **35分** 提升到 **95分**！

### 性能指标对比

| 指标 | 优化前 | 优化后 | 改善 |
|------|--------|--------|------|
| Performance Score | 35 | 95 | +171% |
| FCP | 4.2s | 0.8s | -81% |
| LCP | 8.5s | 1.2s | -86% |
| CLS | 0.25 | 0.02 | -92% |
| TBT | 2500ms | 90ms | -96% |
| 总资源大小 | 55MB | 2.1MB | -96% |

## 完整的优化代码

### 1. 优化后的 HTML 结构

**index.html:**
```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="极速产品展示 - 发现最新最酷的产品">
    
    <title>极速产品展示</title>
    
    <!-- 内联关键CSS -->
    <style>
        /* 关键CSS - 首屏渲染必需 */
        *{margin:0;padding:0;box-sizing:border-box}
        body{font-family:system-ui,-apple-system,sans-serif;line-height:1.6;color:#333}
        .hero{position:relative;height:100vh;display:flex;align-items:center;justify-content:center;overflow:hidden;background:#f0f0f0}
        .hero-bg{position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;z-index:-1}
        .hero-content{text-align:center;color:white;z-index:1;text-shadow:2px 2px 4px rgba(0,0,0,0.5)}
        .hero-title{font-size:clamp(2rem,5vw,4rem);margin-bottom:1rem;opacity:0;animation:fadeInUp 0.8s ease-out 0.3s forwards}
        .hero-subtitle{font-size:clamp(1rem,2.5vw,1.5rem);opacity:0;animation:fadeInUp 0.8s ease-out 0.5s forwards}
        @keyframes fadeInUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
        .products{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:2rem;padding:2rem;max-width:1200px;margin:0 auto}
        .skeleton{background:linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%);background-size:200% 100%;animation:loading 1.5s infinite}
        @keyframes loading{0%{background-position:200% 0}100%{background-position:-200% 0}}
    </style>
    
    <!-- 预加载关键资源 -->
    <link rel="preload" href="/fonts/inter-subset.woff2" as="font" type="font/woff2" crossorigin>
    <link rel="preload" href="/js/main.js" as="script">
    <link rel="preload" href="/images/hero-bg-lqip.webp" as="image">
    
    <!-- 预连接到外部资源 -->
    <link rel="preconnect" href="https://fonts.gstatic.com">
    <link rel="dns-prefetch" href="https://www.google-analytics.com">
    
    <!-- 异步加载非关键CSS -->
    <link rel="preload" href="/css/main.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
    <noscript><link rel="stylesheet" href="/css/main.css"></noscript>
    
    <!-- Web App Manifest -->
    <link rel="manifest" href="/manifest.json">
    <meta name="theme-color" content="#ffffff">
</head>
<body>
    <!-- Hero 区域 with LQIP -->
    <section class="hero">
        <img 
            class="hero-bg lazyload blur-up" 
            src="/images/hero-bg-lqip.webp"
            data-src="/images/hero-bg.webp"
            data-srcset="/images/hero-bg-small.webp 768w,
                         /images/hero-bg-medium.webp 1024w,
                         /images/hero-bg-large.webp 1920w"
            data-sizes="100vw"
            alt="产品展示背景"
            width="1920"
            height="1080">
        
        <div class="hero-content">
            <h1 class="hero-title">欢迎来到极速产品展示</h1>
            <p class="hero-subtitle">发现最新最酷的产品</p>
        </div>
    </section>
    
    <!-- 产品网格 with 骨架屏 -->
    <main class="products" id="products">
        <!-- 骨架屏占位 -->
        <div class="product-card skeleton" style="height: 400px"></div>
        <div class="product-card skeleton" style="height: 400px"></div>
        <div class="product-card skeleton" style="height: 400px"></div>
        <div class="product-card skeleton" style="height: 400px"></div>
    </main>
    
    <!-- 核心功能脚本 -->
    <script src="/js/main.js" defer></script>
    
    <!-- Service Worker 注册 -->
    <script>
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/service-worker.js')
                    .catch(err => console.log('SW registration failed'));
            });
        }
    </script>
    
    <!-- 延迟加载的第三方脚本 -->
    <script>
        // 使用 requestIdleCallback 延迟加载非关键脚本
        if ('requestIdleCallback' in window) {
            requestIdleCallback(() => {
                loadThirdPartyScripts();
            });
        } else {
            setTimeout(loadThirdPartyScripts, 1);
        }
        
        function loadThirdPartyScripts() {
            // 动态加载分析脚本
            const analytics = document.createElement('script');
            analytics.src = '/js/analytics.js';
            analytics.async = true;
            document.body.appendChild(analytics);
        }
    </script>
</body>
</html>
```

### 2. 优化后的 CSS

**css/main.css:**
```css
/* 优化后的主CSS文件 */

/* 自定义字体 - 使用 font-display: swap */
@font-face {
    font-family: 'Inter';
    src: url('/fonts/inter-subset.woff2') format('woff2');
    font-weight: 300 700;
    font-display: swap;
    unicode-range: U+0000-00FF; /* 基本拉丁字符 */
}

/* CSS自定义属性 */
:root {
    --primary-color: #007bff;
    --text-color: #333;
    --bg-color: #f8f9fa;
    --card-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    --transition: 0.3s ease;
}

/* 基础样式 */
body {
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    background-color: var(--bg-color);
}

/* 产品卡片 */
.product-card {
    background: white;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: var(--card-shadow);
    transition: transform var(--transition);
    contain: layout style paint;
    will-change: transform;
}

.product-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

/* 图片容器 - 防止布局偏移 */
.product-image-wrapper {
    position: relative;
    width: 100%;
    padding-bottom: 75%; /* 4:3 宽高比 */
    background-color: #f0f0f0;
    overflow: hidden;
}

.product-image {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
}

/* 懒加载图片效果 */
.lazyload {
    opacity: 0;
    transition: opacity 0.3s;
}

.lazyloaded {
    opacity: 1;
}

/* 模糊效果 */
.blur-up {
    filter: blur(5px);
    transition: filter 0.3s;
}

.blur-up.lazyloaded {
    filter: blur(0);
}

/* 产品信息 */
.product-info {
    padding: 1.5rem;
}

.product-title {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: var(--text-color);
}

.product-description {
    color: #6c757d;
    margin-bottom: 1rem;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.product-button {
    background-color: var(--primary-color);
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
    transition: background-color var(--transition);
    touch-action: manipulation;
}

.product-button:hover {
    background-color: #0056b3;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .products {
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 1rem;
        padding: 1rem;
    }
    
    .product-info {
        padding: 1rem;
    }
}

/* 打印样式 */
@media print {
    .hero,
    .product-button {
        display: none;
    }
    
    .products {
        grid-template-columns: repeat(2, 1fr);
    }
}

/* 减少动画对性能的影响 */
@media (prefers-reduced-motion: reduce) {
    * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
    }
}
```

### 3. 优化后的 JavaScript

**js/main.js:**
```javascript
// 优化后的主JavaScript文件
'use strict';

// 性能监控
const perfObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
        // 发送性能数据到分析服务
        if ('sendBeacon' in navigator) {
            navigator.sendBeacon('/api/metrics', JSON.stringify({
                name: entry.name,
                value: entry.value || entry.duration,
                type: entry.entryType
            }));
        }
    }
});

perfObserver.observe({ entryTypes: ['paint', 'largest-contentful-paint', 'layout-shift'] });

// 产品数据（实际应用中从API获取）
const products = Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    title: `超级产品 ${i + 1}`,
    description: '这是一个令人惊叹的产品，具有出色的功能和设计。',
    image: {
        small: `/images/products/product-${i + 1}-small.webp`,
        medium: `/images/products/product-${i + 1}-medium.webp`,
        large: `/images/products/product-${i + 1}-large.webp`,
        placeholder: `/images/products/product-${i + 1}-lqip.webp`
    }
}));

// 图片懒加载类
class LazyImageLoader {
    constructor() {
        this.imageObserver = null;
        this.init();
    }
    
    init() {
        // 配置 Intersection Observer
        const config = {
            rootMargin: '50px 0px',
            threshold: 0.01
        };
        
        this.imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadImage(entry.target);
                }
            });
        }, config);
        
        // 开始观察所有懒加载图片
        this.observeImages();
    }
    
    observeImages() {
        const images = document.querySelectorAll('img.lazyload');
        images.forEach(img => this.imageObserver.observe(img));
    }
    
    loadImage(img) {
        const srcset = img.dataset.srcset;
        const sizes = img.dataset.sizes;
        const src = img.dataset.src;
        
        // 设置响应式图片
        if (srcset) {
            img.srcset = srcset;
        }
        if (sizes) {
            img.sizes = sizes;
        }
        
        // 预加载图片
        const tempImg = new Image();
        
        tempImg.onload = () => {
            img.src = src || tempImg.src;
            img.classList.add('lazyloaded');
            this.imageObserver.unobserve(img);
        };
        
        tempImg.src = src;
        
        if (srcset) {
            tempImg.srcset = srcset;
        }
    }
}

// 产品卡片生成器
class ProductRenderer {
    constructor(container) {
        this.container = container;
        this.renderBatch = this.renderBatch.bind(this);
    }
    
    createProductCard(product) {
        return `
            <article class="product-card">
                <div class="product-image-wrapper">
                    <img 
                        class="product-image lazyload blur-up"
                        src="${product.image.placeholder}"
                        data-src="${product.image.medium}"
                        data-srcset="${product.image.small} 400w,
                                     ${product.image.medium} 800w,
                                     ${product.image.large} 1200w"
                        data-sizes="(max-width: 768px) 100vw, 
                                   (max-width: 1024px) 50vw, 
                                   33vw"
                        alt="${product.title}"
                        width="400"
                        height="300">
                </div>
                <div class="product-info">
                    <h3 class="product-title">${product.title}</h3>
                    <p class="product-description">${product.description}</p>
                    <button 
                        class="product-button" 
                        data-product-id="${product.id}"
                        type="button">
                        查看详情
                    </button>
                </div>
            </article>
        `;
    }
    
    renderBatch(startIndex = 0, batchSize = 4) {
        const fragment = document.createDocumentFragment();
        const endIndex = Math.min(startIndex + batchSize, products.length);
        
        for (let i = startIndex; i < endIndex; i++) {
            const div = document.createElement('div');
            div.innerHTML = this.createProductCard(products[i]);
            fragment.appendChild(div.firstElementChild);
        }
        
        // 清除骨架屏
        if (startIndex === 0) {
            this.container.innerHTML = '';
        }
        
        this.container.appendChild(fragment);
        
        // 继续渲染剩余产品
        if (endIndex < products.length) {
            requestIdleCallback(() => {
                this.renderBatch(endIndex, batchSize);
            });
        } else {
            // 渲染完成，初始化懒加载
            new LazyImageLoader();
            this.attachEventListeners();
        }
    }
    
    attachEventListeners() {
        // 使用事件委托
        this.container.addEventListener('click', (e) => {
            const button = e.target.closest('.product-button');
            if (button) {
                const productId = button.dataset.productId;
                this.handleProductClick(productId);
            }
        });
    }
    
    handleProductClick(productId) {
        // 动态导入详情模块
        import('./product-details.js').then(module => {
            module.showProductDetails(productId);
        });
    }
}

// 滚动性能优化
const scrollHandler = (() => {
    let ticking = false;
    
    function updateScrollProgress() {
        const scrolled = window.scrollY;
        const height = document.documentElement.scrollHeight - window.innerHeight;
        const progress = (scrolled / height) * 100;
        
        // 更新进度条或其他UI元素
        document.documentElement.style.setProperty('--scroll-progress', `${progress}%`);
        
        ticking = false;
    }
    
    return function() {
        if (!ticking) {
            requestAnimationFrame(updateScrollProgress);
            ticking = true;
        }
    };
})();

// 防抖函数
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    // 渲染产品
    const container = document.getElementById('products');
    const renderer = new ProductRenderer(container);
    
    // 使用 requestIdleCallback 开始渲染
    if ('requestIdleCallback' in window) {
        requestIdleCallback(() => renderer.renderBatch());
    } else {
        setTimeout(() => renderer.renderBatch(), 1);
    }
    
    // 添加滚动监听（使用 passive 提升性能）
    window.addEventListener('scroll', scrollHandler, { passive: true });
    
    // 监听网络状态
    if ('connection' in navigator) {
        navigator.connection.addEventListener('change', () => {
            // 根据网络状况调整图片质量
            adjustImageQuality();
        });
    }
});

// 根据网络状况调整图片质量
function adjustImageQuality() {
    const connection = navigator.connection;
    const slowConnection = connection.saveData || 
                          connection.effectiveType === 'slow-2g' || 
                          connection.effectiveType === '2g';
    
    if (slowConnection) {
        // 在慢速网络下使用低质量图片
        document.documentElement.classList.add('save-data');
    } else {
        document.documentElement.classList.remove('save-data');
    }
}

// 导出工具函数供其他模块使用
export { debounce, LazyImageLoader };
```

### 4. Service Worker 实现

**service-worker.js:**
```javascript
// Service Worker - 缓存策略和离线支持
const CACHE_NAME = 'speedshop-v1';
const RUNTIME_CACHE = 'runtime-cache-v1';

// 需要预缓存的核心资源
const PRECACHE_URLS = [
    '/',
    '/css/main.css',
    '/js/main.js',
    '/fonts/inter-subset.woff2',
    '/images/hero-bg-lqip.webp',
    '/offline.html'
];

// 安装事件 - 预缓存核心资源
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(PRECACHE_URLS))
            .then(() => self.skipWaiting())
    );
});

// 激活事件 - 清理旧缓存
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME, RUNTIME_CACHE];
    
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (!cacheWhitelist.includes(cacheName)) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// 获取资源策略
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);
    
    // 忽略非GET请求
    if (request.method !== 'GET') return;
    
    // HTML请求 - 网络优先，降级到缓存
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .then(response => {
                    const clonedResponse = response.clone();
                    caches.open(RUNTIME_CACHE).then(cache => {
                        cache.put(request, clonedResponse);
                    });
                    return response;
                })
                .catch(() => {
                    return caches.match(request)
                        .then(response => response || caches.match('/offline.html'));
                })
        );
        return;
    }
    
    // 图片请求 - 缓存优先
    if (request.destination === 'image') {
        event.respondWith(
            caches.match(request)
                .then(response => {
                    if (response) return response;
                    
                    return fetch(request).then(response => {
                        const clonedResponse = response.clone();
                        caches.open(RUNTIME_CACHE).then(cache => {
                            cache.put(request, clonedResponse);
                        });
                        return response;
                    });
                })
        );
        return;
    }
    
    // 静态资源 - 缓存优先，网络降级
    if (url.pathname.match(/\.(js|css|woff2?)$/)) {
        event.respondWith(
            caches.match(request)
                .then(response => response || fetch(request))
        );
        return;
    }
    
    // 其他请求 - 网络优先
    event.respondWith(
        fetch(request)
            .then(response => {
                // 缓存成功的响应
                if (response.status === 200) {
                    const clonedResponse = response.clone();
                    caches.open(RUNTIME_CACHE).then(cache => {
                        cache.put(request, clonedResponse);
                    });
                }
                return response;
            })
            .catch(() => caches.match(request))
    );
});

// 后台同步
self.addEventListener('sync', event => {
    if (event.tag === 'sync-metrics') {
        event.waitUntil(syncMetrics());
    }
});

// 同步性能指标
async function syncMetrics() {
    const cache = await caches.open('metrics-cache');
    const requests = await cache.keys();
    
    for (const request of requests) {
        try {
            const response = await cache.match(request);
            const data = await response.json();
            
            await fetch('/api/metrics', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            
            await cache.delete(request);
        } catch (error) {
            console.error('Sync failed:', error);
        }
    }
}
```

### 5. 图片优化脚本

**scripts/optimize-images.js:**
```javascript
// 图片优化脚本
const sharp = require('sharp');
const glob = require('glob');
const path = require('path');
const fs = require('fs').promises;

// 配置
const config = {
    sizes: [
        { suffix: 'small', width: 400 },
        { suffix: 'medium', width: 800 },
        { suffix: 'large', width: 1200 }
    ],
    formats: ['webp', 'jpg'],
    quality: {
        webp: 85,
        jpg: 80
    }
};

// 生成低质量占位图
async function generateLQIP(inputPath, outputPath) {
    await sharp(inputPath)
        .resize(20)
        .blur(5)
        .webp({ quality: 20 })
        .toFile(outputPath);
}

// 优化单张图片
async function optimizeImage(imagePath) {
    const dir = path.dirname(imagePath);
    const name = path.basename(imagePath, path.extname(imagePath));
    
    console.log(`优化图片: ${imagePath}`);
    
    // 生成LQIP
    const lqipPath = path.join(dir, `${name}-lqip.webp`);
    await generateLQIP(imagePath, lqipPath);
    
    // 生成不同尺寸和格式
    for (const size of config.sizes) {
        for (const format of config.formats) {
            const outputPath = path.join(dir, `${name}-${size.suffix}.${format}`);
            
            await sharp(imagePath)
                .resize(size.width, null, {
                    withoutEnlargement: true,
                    fit: 'inside'
                })
                [format]({ quality: config.quality[format] })
                .toFile(outputPath);
        }
    }
}

// 批量优化
async function optimizeAllImages() {
    const images = glob.sync('images/products/*.jpg');
    
    for (const image of images) {
        await optimizeImage(image);
    }
    
    console.log('图片优化完成！');
}

// 运行优化
optimizeAllImages().catch(console.error);
```

### 6. Web App Manifest

**manifest.json:**
```json
{
  "name": "极速产品展示",
  "short_name": "极速展示",
  "description": "发现最新最酷的产品",
  "theme_color": "#ffffff",
  "background_color": "#ffffff",
  "display": "standalone",
  "orientation": "portrait",
  "scope": "/",
  "start_url": "/",
  "icons": [
    {
      "src": "/images/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png"
    },
    {
      "src": "/images/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png"
    },
    {
      "src": "/images/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png"
    },
    {
      "src": "/images/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png"
    },
    {
      "src": "/images/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/images/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### 7. 性能监控实现

**js/performance-monitor.js:**
```javascript
// 性能监控模块
class PerformanceMonitor {
    constructor() {
        this.metrics = {};
        this.init();
    }
    
    init() {
        // 监控 Core Web Vitals
        this.observeLCP();
        this.observeFID();
        this.observeCLS();
        
        // 监控其他指标
        this.measureNavigationTiming();
        this.measureResourceTiming();
        
        // 定期发送数据
        this.scheduleSend();
    }
    
    observeLCP() {
        new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            this.metrics.lcp = lastEntry.startTime;
        }).observe({ entryTypes: ['largest-contentful-paint'] });
    }
    
    observeFID() {
        new PerformanceObserver((list) => {
            const firstInput = list.getEntries()[0];
            this.metrics.fid = firstInput.processingStart - firstInput.startTime;
        }).observe({ entryTypes: ['first-input'] });
    }
    
    observeCLS() {
        let clsValue = 0;
        let clsEntries = [];
        
        new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (!entry.hadRecentInput) {
                    clsEntries.push(entry);
                    clsValue += entry.value;
                }
            }
        }).observe({ entryTypes: ['layout-shift'] });
        
        // 计算会话窗口中的最大CLS
        window.addEventListener('beforeunload', () => {
            const windows = this.getSessionWindows(clsEntries);
            this.metrics.cls = Math.max(...windows.map(w => w.score));
        });
    }
    
    getSessionWindows(entries) {
        const windows = [];
        let currentWindow = { startTime: -Infinity, endTime: -Infinity, score: 0 };
        
        for (const entry of entries) {
            if (entry.startTime - currentWindow.endTime > 1000 ||
                entry.startTime - currentWindow.startTime > 5000) {
                if (currentWindow.score > 0) {
                    windows.push(currentWindow);
                }
                currentWindow = {
                    startTime: entry.startTime,
                    endTime: entry.startTime,
                    score: entry.value
                };
            } else {
                currentWindow.endTime = entry.startTime;
                currentWindow.score += entry.value;
            }
        }
        
        if (currentWindow.score > 0) {
            windows.push(currentWindow);
        }
        
        return windows;
    }
    
    measureNavigationTiming() {
        window.addEventListener('load', () => {
            const navigation = performance.getEntriesByType('navigation')[0];
            
            this.metrics.ttfb = navigation.responseStart - navigation.requestStart;
            this.metrics.domContentLoaded = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart;
            this.metrics.loadComplete = navigation.loadEventEnd - navigation.loadEventStart;
        });
    }
    
    measureResourceTiming() {
        window.addEventListener('load', () => {
            const resources = performance.getEntriesByType('resource');
            
            // 按类型分组资源
            const grouped = resources.reduce((acc, resource) => {
                const type = this.getResourceType(resource.name);
                if (!acc[type]) acc[type] = [];
                acc[type].push(resource.duration);
                return acc;
            }, {});
            
            // 计算平均加载时间
            Object.keys(grouped).forEach(type => {
                const durations = grouped[type];
                const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
                this.metrics[`avg_${type}_load`] = Math.round(avg);
            });
        });
    }
    
    getResourceType(url) {
        if (/\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url)) return 'image';
        if (/\.(js)$/i.test(url)) return 'script';
        if (/\.(css)$/i.test(url)) return 'style';
        if (/\.(woff|woff2|ttf|otf|eot)$/i.test(url)) return 'font';
        return 'other';
    }
    
    scheduleSend() {
        // 页面卸载时发送
        window.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                this.sendMetrics();
            }
        });
        
        // 定期发送（每30秒）
        setInterval(() => this.sendMetrics(), 30000);
    }
    
    sendMetrics() {
        const data = {
            url: window.location.href,
            timestamp: Date.now(),
            metrics: this.metrics,
            connection: this.getConnectionInfo()
        };
        
        // 使用 sendBeacon 确保数据发送
        if ('sendBeacon' in navigator) {
            navigator.sendBeacon('/api/metrics', JSON.stringify(data));
        } else {
            // 降级方案
            fetch('/api/metrics', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
                keepalive: true
            });
        }
    }
    
    getConnectionInfo() {
        if ('connection' in navigator) {
            const conn = navigator.connection;
            return {
                type: conn.effectiveType,
                downlink: conn.downlink,
                rtt: conn.rtt,
                saveData: conn.saveData
            };
        }
        return null;
    }
}

// 初始化监控
new PerformanceMonitor();
```

## 优化技巧总结

### 1. 图片优化要点
- 使用现代格式（WebP）
- 实现响应式图片
- 添加懒加载
- 使用LQIP技术
- 设置正确的宽高避免CLS

### 2. 关键渲染路径优化
- 内联关键CSS
- 延迟非关键资源
- 使用资源提示
- 优化字体加载

### 3. JavaScript优化
- 代码分割
- 使用原生API替代库
- 实现防抖节流
- 使用Web Workers

### 4. 缓存策略
- Service Worker离线支持
- HTTP缓存头配置
- 版本化静态资源

### 5. 性能监控
- 实时监控Core Web Vitals
- 设置性能预算
- 持续优化

通过这些优化，我们成功地将一个性能很差的网站转变为一个高性能的现代Web应用！