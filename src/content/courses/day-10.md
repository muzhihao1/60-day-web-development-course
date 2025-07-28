---
day: 10
phase: "modern-web"
title: "Web性能优化：让网站飞起来"
description: "深入学习Web性能优化技术，掌握性能指标、优化策略和监控工具"
objectives:
  - "理解Core Web Vitals等关键性能指标"
  - "掌握各种性能优化技术"
  - "学会使用性能监控和分析工具"
  - "实践常见的性能优化方案"
estimatedTime: 90
difficulty: "intermediate"
prerequisites: [9]
tags: ["performance", "optimization", "core-web-vitals", "lighthouse"]
resources:
  - title: "Web.dev性能指南"
    url: "https://web.dev/performance/"
    type: "documentation"
  - title: "Chrome DevTools性能分析"
    url: "https://developer.chrome.com/docs/devtools/performance/"
    type: "documentation"
---

# Day 10: Web性能优化

## 🎯 今日目标

今天我们将深入学习Web性能优化，这是前端开发中极其重要的一环。你知道吗？亚马逊发现页面加载时间每增加1秒，就会损失16亿美元的销售额！让我们一起学习如何让网站飞起来。

## 📚 性能为什么重要？

### 业务影响

- **用户体验**：53%的移动用户会放弃加载超过3秒的网站
- **转化率**：页面加载时间每减少0.1秒，转化率可提升8%
- **SEO排名**：Google将页面速度作为重要的排名因素
- **用户留存**：性能差的网站会导致用户流失

### 性能预算

```javascript
// 性能预算示例
const performanceBudget = {
  // 时间指标
  fcp: 1800,        // First Contentful Paint < 1.8s
  lcp: 2500,        // Largest Contentful Paint < 2.5s
  fid: 100,         // First Input Delay < 100ms
  cls: 0.1,         // Cumulative Layout Shift < 0.1
  
  // 资源大小
  js: 300,          // JavaScript < 300KB
  css: 60,          // CSS < 60KB
  images: 500,      // 图片总计 < 500KB
  total: 1000       // 总大小 < 1MB
};
```

## 1. 理解性能指标

### Core Web Vitals（核心网页指标）

#### LCP (Largest Contentful Paint)
最大内容绘制 - 衡量加载性能

```javascript
// 监测LCP
new PerformanceObserver((list) => {
  const entries = list.getEntries();
  const lastEntry = entries[entries.length - 1];
  console.log('LCP:', lastEntry.startTime);
}).observe({ entryTypes: ['largest-contentful-paint'] });

// 优化LCP的方法
// 1. 优化服务器响应时间
// 2. 使用CDN
// 3. 优化关键资源加载
// 4. 优化图片和字体
```

#### FID (First Input Delay)
首次输入延迟 - 衡量交互性

```javascript
// 监测FID
new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log('FID:', entry.processingStart - entry.startTime);
  }
}).observe({ entryTypes: ['first-input'] });

// 优化FID的方法
// 1. 减少JavaScript执行时间
// 2. 分解长任务
// 3. 使用Web Workers
// 4. 减少第三方脚本影响
```

#### CLS (Cumulative Layout Shift)
累积布局偏移 - 衡量视觉稳定性

```javascript
// 监测CLS
let clsValue = 0;
new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (!entry.hadRecentInput) {
      clsValue += entry.value;
      console.log('Current CLS:', clsValue);
    }
  }
}).observe({ entryTypes: ['layout-shift'] });

// 优化CLS的方法
// 1. 为图片和视频预留空间
// 2. 避免动态插入内容
// 3. 使用CSS transform而不是改变位置
// 4. 预加载字体
```

### RAIL性能模型

```javascript
// RAIL模型指导原则
const RAIL = {
  Response: {
    target: 100,  // 100ms内响应用户输入
    description: "用户点击后的反馈时间"
  },
  Animation: {
    target: 16,   // 16ms内完成每帧（60fps）
    description: "动画和滚动的流畅度"
  },
  Idle: {
    target: 50,   // 50ms的空闲时间块
    description: "利用空闲时间完成延迟工作"
  },
  Load: {
    target: 1000, // 1秒内完成首次加载
    description: "页面可交互时间"
  }
};
```

## 2. 加载性能优化

### 关键渲染路径优化

```html
<!-- 优化前 -->
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="style.css">
  <script src="app.js"></script>
</head>
<body>
  <div id="content"></div>
</body>
</html>

<!-- 优化后 -->
<!DOCTYPE html>
<html>
<head>
  <!-- 关键CSS内联 -->
  <style>
    /* 首屏关键样式 */
    body { margin: 0; font-family: sans-serif; }
    .header { background: #333; color: white; }
  </style>
  
  <!-- 非关键CSS异步加载 -->
  <link rel="preload" href="style.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link rel="stylesheet" href="style.css"></noscript>
  
  <!-- JavaScript延迟加载 -->
  <script src="app.js" defer></script>
</head>
<body>
  <div id="content"></div>
</body>
</html>
```

### 资源提示（Resource Hints）

```html
<!-- DNS预解析 -->
<link rel="dns-prefetch" href="//api.example.com">

<!-- 预连接（包括DNS、TCP、TLS） -->
<link rel="preconnect" href="https://fonts.googleapis.com">

<!-- 预加载（当前页面需要的资源） -->
<link rel="preload" href="font.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="critical.css" as="style">
<link rel="preload" href="main.js" as="script">

<!-- 预获取（未来页面可能需要的资源） -->
<link rel="prefetch" href="next-page.js">

<!-- 预渲染（预加载整个页面） -->
<link rel="prerender" href="https://example.com/next-page">
```

### Script加载策略

```html
<!-- 1. 普通加载（阻塞HTML解析） -->
<script src="script.js"></script>

<!-- 2. async（异步加载，加载完立即执行） -->
<script async src="analytics.js"></script>

<!-- 3. defer（异步加载，DOM解析完成后执行） -->
<script defer src="app.js"></script>

<!-- 4. 动态加载 -->
<script>
  // 按需加载脚本
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
  
  // 条件加载
  if ('IntersectionObserver' in window) {
    loadScript('modern-features.js');
  } else {
    loadScript('polyfills.js').then(() => {
      loadScript('modern-features.js');
    });
  }
</script>
```

## 3. 运行时性能优化

### JavaScript优化

```javascript
// 1. 避免长任务
// 不好的做法
function processLargeArray(array) {
  for (let i = 0; i < array.length; i++) {
    // 复杂处理
    complexOperation(array[i]);
  }
}

// 好的做法：分批处理
function processLargeArrayOptimized(array) {
  const chunkSize = 100;
  let index = 0;
  
  function processChunk() {
    const endIndex = Math.min(index + chunkSize, array.length);
    
    for (let i = index; i < endIndex; i++) {
      complexOperation(array[i]);
    }
    
    index = endIndex;
    
    if (index < array.length) {
      // 让出主线程
      requestIdleCallback(processChunk);
    }
  }
  
  processChunk();
}

// 2. 使用Web Workers处理繁重计算
// main.js
const worker = new Worker('worker.js');

worker.postMessage({ cmd: 'calculate', data: largeDataSet });

worker.onmessage = (e) => {
  console.log('计算结果：', e.data);
};

// worker.js
self.onmessage = (e) => {
  if (e.data.cmd === 'calculate') {
    const result = performHeavyCalculation(e.data.data);
    self.postMessage(result);
  }
};
```

### DOM操作优化

```javascript
// 1. 批量DOM操作
// 不好的做法
for (let i = 0; i < 1000; i++) {
  const div = document.createElement('div');
  div.textContent = `Item ${i}`;
  document.body.appendChild(div);
}

// 好的做法：使用DocumentFragment
const fragment = document.createDocumentFragment();
for (let i = 0; i < 1000; i++) {
  const div = document.createElement('div');
  div.textContent = `Item ${i}`;
  fragment.appendChild(div);
}
document.body.appendChild(fragment);

// 2. 虚拟滚动
class VirtualScroller {
  constructor(container, items, itemHeight) {
    this.container = container;
    this.items = items;
    this.itemHeight = itemHeight;
    this.visibleItems = Math.ceil(container.clientHeight / itemHeight);
    
    this.setup();
  }
  
  setup() {
    // 创建滚动容器
    this.scrollContainer = document.createElement('div');
    this.scrollContainer.style.height = `${this.items.length * this.itemHeight}px`;
    
    // 创建可视区域
    this.viewport = document.createElement('div');
    this.viewport.style.transform = 'translateY(0)';
    
    this.container.appendChild(this.scrollContainer);
    this.container.appendChild(this.viewport);
    
    this.container.addEventListener('scroll', () => this.handleScroll());
    this.render();
  }
  
  handleScroll() {
    const scrollTop = this.container.scrollTop;
    const startIndex = Math.floor(scrollTop / this.itemHeight);
    const endIndex = startIndex + this.visibleItems;
    
    this.render(startIndex, endIndex);
  }
  
  render(start = 0, end = this.visibleItems) {
    this.viewport.innerHTML = '';
    this.viewport.style.transform = `translateY(${start * this.itemHeight}px)`;
    
    for (let i = start; i < end && i < this.items.length; i++) {
      const item = document.createElement('div');
      item.style.height = `${this.itemHeight}px`;
      item.textContent = this.items[i];
      this.viewport.appendChild(item);
    }
  }
}
```

### 防抖和节流

```javascript
// 防抖（Debounce）
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

// 使用防抖优化搜索
const searchInput = document.getElementById('search');
const handleSearch = debounce((e) => {
  console.log('搜索：', e.target.value);
  // 执行搜索请求
}, 300);

searchInput.addEventListener('input', handleSearch);

// 节流（Throttle）
function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// 使用节流优化滚动
const handleScroll = throttle(() => {
  console.log('滚动位置：', window.scrollY);
  // 更新UI
}, 100);

window.addEventListener('scroll', handleScroll);
```

## 4. 资源优化

### 图片优化

```html
<!-- 1. 响应式图片 -->
<picture>
  <source 
    media="(min-width: 800px)" 
    srcset="large.webp" 
    type="image/webp">
  <source 
    media="(min-width: 800px)" 
    srcset="large.jpg">
  <source 
    srcset="small.webp" 
    type="image/webp">
  <img 
    src="small.jpg" 
    alt="描述"
    loading="lazy"
    decoding="async">
</picture>

<!-- 2. srcset和sizes -->
<img 
  srcset="
    small.jpg 300w,
    medium.jpg 600w,
    large.jpg 1200w"
  sizes="
    (max-width: 300px) 300px,
    (max-width: 600px) 600px,
    1200px"
  src="medium.jpg"
  alt="响应式图片">

<!-- 3. 懒加载 -->
<img 
  src="placeholder.jpg" 
  data-src="actual-image.jpg" 
  loading="lazy"
  class="lazyload">
```

```javascript
// 使用Intersection Observer实现懒加载
class LazyImageLoader {
  constructor() {
    this.imageObserver = null;
    this.init();
  }
  
  init() {
    // 配置观察器
    const config = {
      rootMargin: '50px 0px', // 提前50px开始加载
      threshold: 0.01
    };
    
    this.imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.loadImage(entry.target);
        }
      });
    }, config);
    
    // 观察所有懒加载图片
    document.querySelectorAll('img[data-src]').forEach(img => {
      this.imageObserver.observe(img);
    });
  }
  
  loadImage(img) {
    const src = img.dataset.src;
    
    // 预加载图片
    const tempImg = new Image();
    tempImg.onload = () => {
      img.src = src;
      img.classList.add('loaded');
      this.imageObserver.unobserve(img);
    };
    tempImg.src = src;
  }
}

// 初始化
new LazyImageLoader();
```

### 字体优化

```css
/* 1. font-display优化 */
@font-face {
  font-family: 'CustomFont';
  src: url('font.woff2') format('woff2');
  font-display: swap; /* 立即显示备用字体，加载完成后切换 */
}

/* font-display选项：
   - auto: 浏览器默认行为
   - block: 短暂隐藏文本(FOIT)
   - swap: 立即显示备用字体(FOUT)
   - fallback: 短暂隐藏，然后使用备用字体
   - optional: 类似fallback，但允许浏览器放弃下载
*/

/* 2. 字体子集化 */
@font-face {
  font-family: 'CustomFont';
  src: url('font-subset.woff2') format('woff2');
  unicode-range: U+0000-00FF; /* 基本拉丁字符 */
}

/* 3. 可变字体 */
@font-face {
  font-family: 'VariableFont';
  src: url('variable-font.woff2') format('woff2-variations');
  font-weight: 100 900;
  font-stretch: 50% 200%;
}
```

```html
<!-- 预加载关键字体 -->
<link 
  rel="preload" 
  href="font.woff2" 
  as="font" 
  type="font/woff2" 
  crossorigin>
```

### CSS优化

```javascript
// 1. 关键CSS提取
const critical = require('critical');

critical.generate({
  inline: true,
  base: 'dist/',
  src: 'index.html',
  target: 'index-critical.html',
  width: 1300,
  height: 900,
  css: ['dist/styles.css']
});

// 2. 移除未使用的CSS
// postcss.config.js
module.exports = {
  plugins: [
    require('@fullhuman/postcss-purgecss')({
      content: ['./src/**/*.html', './src/**/*.js'],
      defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || [],
      safelist: ['dynamic-class', /^modal-/]
    })
  ]
};

// 3. CSS-in-JS优化
import { css } from '@emotion/react';

// 使用CSS prop进行运行时优化
const dynamicStyle = css`
  color: ${props => props.primary ? 'blue' : 'black'};
  &:hover {
    color: ${props => props.primary ? 'darkblue' : 'gray'};
  }
`;
```

## 5. 高级优化技术

### 代码分割

```javascript
// 1. 动态导入
button.addEventListener('click', async () => {
  const module = await import('./heavy-feature.js');
  module.init();
});

// 2. React懒加载
import React, { lazy, Suspense } from 'react';

const HeavyComponent = lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <Suspense fallback={<div>加载中...</div>}>
      <HeavyComponent />
    </Suspense>
  );
}

// 3. 路由级代码分割
// Vue Router示例
const routes = [
  {
    path: '/about',
    component: () => import('./views/About.vue')
  }
];

// 4. Webpack配置
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: 10
        },
        common: {
          minChunks: 2,
          priority: 5,
          reuseExistingChunk: true
        }
      }
    }
  }
};
```

### Service Worker缓存

```javascript
// service-worker.js
const CACHE_NAME = 'my-site-v1';
const urlsToCache = [
  '/',
  '/styles/main.css',
  '/scripts/main.js'
];

// 安装Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// 缓存策略
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 缓存优先
        if (response) {
          return response;
        }
        
        // 网络请求
        return fetch(event.request).then(response => {
          // 检查是否是有效响应
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // 克隆响应
          const responseToCache = response.clone();
          
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
          
          return response;
        });
      })
  );
});

// 注册Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => console.log('SW registered'))
      .catch(err => console.log('SW registration failed'));
  });
}
```

### HTTP缓存策略

```javascript
// Express服务器缓存配置
const express = require('express');
const app = express();

// 静态资源缓存
app.use('/static', express.static('public', {
  maxAge: '1y',  // 1年
  etag: true,
  lastModified: true,
  setHeaders: (res, path) => {
    if (path.endsWith('.html')) {
      // HTML文件不缓存
      res.setHeader('Cache-Control', 'no-cache');
    } else if (path.match(/\.(js|css)$/)) {
      // JS和CSS文件缓存1年（使用版本hash）
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    } else if (path.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
      // 图片缓存1个月
      res.setHeader('Cache-Control', 'public, max-age=2592000');
    }
  }
}));

// API响应缓存
app.get('/api/data', (req, res) => {
  res.set({
    'Cache-Control': 'private, max-age=300', // 5分钟
    'ETag': generateETag(data),
    'Last-Modified': lastModified.toUTCString()
  });
  
  // 检查条件请求
  if (req.headers['if-none-match'] === currentETag) {
    return res.status(304).end();
  }
  
  res.json(data);
});
```

## 6. 性能监控

### Performance API

```javascript
// 1. Navigation Timing
window.addEventListener('load', () => {
  const perfData = performance.getEntriesByType('navigation')[0];
  
  console.log('性能数据：', {
    DNS查询: perfData.domainLookupEnd - perfData.domainLookupStart,
    TCP连接: perfData.connectEnd - perfData.connectStart,
    请求响应: perfData.responseEnd - perfData.requestStart,
    DOM解析: perfData.domInteractive - perfData.domLoading,
    DOM完成: perfData.domComplete - perfData.domInteractive,
    载入完成: perfData.loadEventEnd - perfData.loadEventStart,
    总时间: perfData.loadEventEnd - perfData.fetchStart
  });
});

// 2. Resource Timing
const resources = performance.getEntriesByType('resource');
resources.forEach(resource => {
  console.log(`${resource.name}: ${resource.duration}ms`);
});

// 3. User Timing
// 标记时间点
performance.mark('myFeature-start');

// 执行功能
myFeature();

performance.mark('myFeature-end');

// 测量时间
performance.measure('myFeature', 'myFeature-start', 'myFeature-end');

const measure = performance.getEntriesByName('myFeature')[0];
console.log(`功能执行时间: ${measure.duration}ms`);
```

### 实时性能监控

```javascript
// 创建性能监控类
class PerformanceMonitor {
  constructor() {
    this.metrics = {
      fcp: 0,
      lcp: 0,
      fid: 0,
      cls: 0,
      ttfb: 0
    };
    
    this.initObservers();
  }
  
  initObservers() {
    // FCP
    new PerformanceObserver((list) => {
      const entry = list.getEntries()[0];
      this.metrics.fcp = entry.startTime;
      this.report('FCP', entry.startTime);
    }).observe({ entryTypes: ['paint'] });
    
    // LCP
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.metrics.lcp = lastEntry.startTime;
      this.report('LCP', lastEntry.startTime);
    }).observe({ entryTypes: ['largest-contentful-paint'] });
    
    // FID
    new PerformanceObserver((list) => {
      const entry = list.getEntries()[0];
      this.metrics.fid = entry.processingStart - entry.startTime;
      this.report('FID', this.metrics.fid);
    }).observe({ entryTypes: ['first-input'] });
    
    // CLS
    let clsValue = 0;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
          this.metrics.cls = clsValue;
        }
      }
      this.report('CLS', clsValue);
    }).observe({ entryTypes: ['layout-shift'] });
    
    // TTFB
    window.addEventListener('load', () => {
      const navTiming = performance.getEntriesByType('navigation')[0];
      this.metrics.ttfb = navTiming.responseStart - navTiming.requestStart;
      this.report('TTFB', this.metrics.ttfb);
    });
  }
  
  report(metric, value) {
    console.log(`${metric}: ${value}`);
    
    // 发送到分析服务
    if (navigator.sendBeacon) {
      const data = JSON.stringify({
        metric,
        value,
        url: window.location.href,
        timestamp: Date.now()
      });
      
      navigator.sendBeacon('/api/metrics', data);
    }
  }
  
  getMetrics() {
    return this.metrics;
  }
}

// 初始化监控
const monitor = new PerformanceMonitor();
```

### Lighthouse CI

```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI
on: [push]
jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v1
      - run: npm install && npm run build
      - uses: treosh/lighthouse-ci-action@v7
        with:
          urls: |
            https://example.com
            https://example.com/about
          budgetPath: ./budget.json
          uploadArtifacts: true
```

```json
// budget.json
[
  {
    "path": "/*",
    "resourceSizes": [
      {
        "resourceType": "script",
        "budget": 300
      },
      {
        "resourceType": "image",
        "budget": 500
      }
    ],
    "resourceCounts": [
      {
        "resourceType": "third-party",
        "budget": 10
      }
    ]
  }
]
```

## 实战项目：性能优化实践

让我们通过一个实际项目来应用所学的优化技术：

```html
<!-- index.html - 优化前 -->
<!DOCTYPE html>
<html>
<head>
  <title>图片画廊</title>
  <link rel="stylesheet" href="styles.css">
  <script src="jquery.min.js"></script>
  <script src="gallery.js"></script>
</head>
<body>
  <h1>我的图片画廊</h1>
  <div class="gallery">
    <img src="photo1-large.jpg" alt="Photo 1">
    <img src="photo2-large.jpg" alt="Photo 2">
    <img src="photo3-large.jpg" alt="Photo 3">
    <!-- 更多图片... -->
  </div>
</body>
</html>
```

优化后的版本会在练习部分详细实现。

## 🚀 性能优化检查清单

### 加载优化
- [ ] 启用Gzip/Brotli压缩
- [ ] 使用CDN分发静态资源
- [ ] 实现资源预加载和预连接
- [ ] 优化关键渲染路径
- [ ] 实现代码分割和懒加载

### 资源优化
- [ ] 优化图片（格式、大小、懒加载）
- [ ] 优化字体加载
- [ ] 移除未使用的CSS
- [ ] 压缩JavaScript和CSS
- [ ] 使用现代图片格式（WebP、AVIF）

### 缓存策略
- [ ] 配置HTTP缓存头
- [ ] 实现Service Worker缓存
- [ ] 使用内容hash进行版本控制
- [ ] 实现离线优先策略

### 运行时优化
- [ ] 优化JavaScript执行
- [ ] 减少重排和重绘
- [ ] 使用Web Workers
- [ ] 实现虚拟滚动
- [ ] 添加防抖和节流

### 监控和分析
- [ ] 设置性能预算
- [ ] 配置实时性能监控
- [ ] 定期运行Lighthouse审计
- [ ] 监控真实用户指标(RUM)
- [ ] 设置性能告警

## 📚 扩展阅读

- [Web性能权威指南](https://hpbn.co/)
- [Google Web性能最佳实践](https://developers.google.com/web/fundamentals/performance)
- [MDN性能优化指南](https://developer.mozilla.org/zh-CN/docs/Web/Performance)
- [Chrome DevTools性能分析](https://developers.google.com/web/tools/chrome-devtools/evaluate-performance)

## 💡 每日一练

今天的练习是优化一个性能较差的网站，通过应用各种优化技术，将Lighthouse分数从40分提升到90分以上。这将帮助你深入理解每个优化技术的实际效果。

记住：性能优化是一个持续的过程，需要不断测量、优化和监控。让我们一起打造飞快的网站体验！