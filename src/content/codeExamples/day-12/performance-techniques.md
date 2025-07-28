---
title: "性能优化技术详解"
description: "实现90+Lighthouse分数的优化策略"
---

## 性能优化完整指南

### 1. 图片优化策略

```javascript
// 图片懒加载实现
class ImageLazyLoader {
  constructor() {
    this.imageObserver = null;
    this.init();
  }
  
  init() {
    // 检查浏览器支持
    if (!('IntersectionObserver' in window)) {
      this.loadAllImages();
      return;
    }
    
    // 创建观察器
    this.imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.loadImage(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '50px 0px', // 提前50px开始加载
      threshold: 0.01
    });
    
    // 观察所有懒加载图片
    this.observeImages();
  }
  
  observeImages() {
    const lazyImages = document.querySelectorAll('[data-src]');
    lazyImages.forEach(img => this.imageObserver.observe(img));
  }
  
  loadImage(img) {
    const src = img.dataset.src;
    const srcset = img.dataset.srcset;
    
    // 预加载图片
    const tempImg = new Image();
    tempImg.onload = () => {
      // 添加淡入动画
      img.classList.add('fade-in');
      
      // 设置图片源
      if (src) img.src = src;
      if (srcset) img.srcset = srcset;
      
      // 清理data属性
      delete img.dataset.src;
      delete img.dataset.srcset;
    };
    
    tempImg.src = src;
  }
  
  loadAllImages() {
    // 降级方案：直接加载所有图片
    const lazyImages = document.querySelectorAll('[data-src]');
    lazyImages.forEach(img => {
      img.src = img.dataset.src;
      if (img.dataset.srcset) {
        img.srcset = img.dataset.srcset;
      }
    });
  }
}

// 使用示例
const lazyLoader = new ImageLazyLoader();
```

```html
<!-- 优化的图片标签 -->
<picture>
  <source
    type="image/webp"
    data-srcset="
      /images/hero-320w.webp 320w,
      /images/hero-640w.webp 640w,
      /images/hero-1280w.webp 1280w
    "
    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 1280px"
  >
  <source
    type="image/jpeg"
    data-srcset="
      /images/hero-320w.jpg 320w,
      /images/hero-640w.jpg 640w,
      /images/hero-1280w.jpg 1280w
    "
    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 1280px"
  >
  <img
    data-src="/images/hero-640w.jpg"
    alt="Hero图片"
    class="lazyload"
    loading="lazy"
    decoding="async"
    width="1280"
    height="720"
  >
</picture>

<!-- 占位符样式 -->
<style>
.lazyload {
  background: #f0f0f0;
  filter: blur(5px);
  transition: filter 0.3s;
}

.lazyload.fade-in {
  filter: blur(0);
}
</style>
```

### 2. 资源预加载和预连接

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <!-- 预连接到外部域名 -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  
  <!-- DNS预解析 -->
  <link rel="dns-prefetch" href="https://cdn.jsdelivr.net">
  <link rel="dns-prefetch" href="https://www.google-analytics.com">
  
  <!-- 预加载关键资源 -->
  <link rel="preload" href="/fonts/inter-var.woff2" as="font" 
        type="font/woff2" crossorigin>
  <link rel="preload" href="/styles/critical.css" as="style">
  <link rel="preload" href="/scripts/main.js" as="script">
  
  <!-- 预获取下一页资源 -->
  <link rel="prefetch" href="/about">
  <link rel="prefetch" href="/projects">
  
  <!-- 关键CSS内联 -->
  <style>
    /* 首屏关键样式 */
    body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, sans-serif; }
    .navbar { position: fixed; top: 0; width: 100%; background: white; }
    .hero { min-height: 100vh; display: flex; align-items: center; }
    /* ... 其他关键样式 ... */
  </style>
  
  <!-- 非关键CSS异步加载 -->
  <link rel="preload" href="/styles/main.css" as="style" 
        onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link rel="stylesheet" href="/styles/main.css"></noscript>
</head>
```

### 3. JavaScript代码分割和动态导入

```javascript
// 路由级别的代码分割
class Router {
  constructor() {
    this.routes = {
      '/': () => import('./pages/home.js'),
      '/about': () => import('./pages/about.js'),
      '/projects': () => import('./pages/projects.js'),
      '/blog': () => import('./pages/blog.js'),
      '/contact': () => import('./pages/contact.js')
    };
  }
  
  async loadPage(path) {
    const loader = this.routes[path];
    if (!loader) return;
    
    try {
      // 显示加载指示器
      this.showLoader();
      
      // 动态导入页面模块
      const module = await loader();
      const Page = module.default;
      
      // 实例化页面
      const page = new Page();
      await page.render();
      
      // 隐藏加载指示器
      this.hideLoader();
    } catch (error) {
      console.error('页面加载失败:', error);
      this.showError();
    }
  }
  
  showLoader() {
    document.body.classList.add('loading');
  }
  
  hideLoader() {
    document.body.classList.remove('loading');
  }
  
  showError() {
    // 显示错误页面
  }
}

// 条件加载大型库
async function loadHeavyFeature() {
  if (!window.GSAP) {
    const { gsap } = await import(
      /* webpackChunkName: "gsap" */
      'gsap'
    );
    window.GSAP = gsap;
  }
  
  // 使用GSAP
  window.GSAP.to('.hero-title', {
    opacity: 1,
    y: 0,
    duration: 1
  });
}

// 基于用户交互的延迟加载
document.getElementById('show-map').addEventListener('click', async () => {
  const { initMap } = await import(
    /* webpackChunkName: "map" */
    './modules/map.js'
  );
  initMap();
}, { once: true });
```

### 4. 关键渲染路径优化

```javascript
// 优先加载首屏内容
class CriticalLoader {
  constructor() {
    this.criticalResources = [];
    this.deferredResources = [];
  }
  
  // 标记关键资源
  markCritical(resource) {
    this.criticalResources.push(resource);
  }
  
  // 延迟非关键资源
  defer(resource) {
    this.deferredResources.push(resource);
  }
  
  // 加载策略
  async load() {
    // 1. 首先加载关键资源
    await Promise.all(
      this.criticalResources.map(r => this.loadResource(r))
    );
    
    // 2. 页面可交互后加载延迟资源
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        this.loadDeferredResources();
      });
    } else {
      setTimeout(() => {
        this.loadDeferredResources();
      }, 1);
    }
  }
  
  loadResource(resource) {
    if (resource.type === 'script') {
      return this.loadScript(resource.src);
    } else if (resource.type === 'style') {
      return this.loadStyle(resource.href);
    }
  }
  
  loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
  
  loadStyle(href) {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.onload = resolve;
      link.onerror = reject;
      document.head.appendChild(link);
    });
  }
  
  loadDeferredResources() {
    this.deferredResources.forEach(resource => {
      this.loadResource(resource);
    });
  }
}

// 使用示例
const loader = new CriticalLoader();

// 关键资源
loader.markCritical({ type: 'style', href: '/styles/critical.css' });
loader.markCritical({ type: 'script', src: '/scripts/core.js' });

// 延迟资源
loader.defer({ type: 'script', src: '/scripts/analytics.js' });
loader.defer({ type: 'script', src: '/scripts/animations.js' });

// 开始加载
loader.load();
```

### 5. Service Worker缓存策略

```javascript
// service-worker.js
const CACHE_NAME = 'portfolio-v1';
const urlsToCache = [
  '/',
  '/styles/main.css',
  '/scripts/main.js',
  '/fonts/inter-var.woff2',
  '/images/logo.svg',
  '/offline.html'
];

// 安装Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('缓存已打开');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// 激活Service Worker
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('删除旧缓存:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 请求拦截策略
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // API请求：网络优先
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request));
    return;
  }
  
  // 静态资源：缓存优先
  if (request.destination === 'style' || 
      request.destination === 'script' ||
      request.destination === 'font' ||
      request.destination === 'image') {
    event.respondWith(cacheFirst(request));
    return;
  }
  
  // HTML：网络优先，离线时返回缓存
  event.respondWith(networkFirst(request));
});

// 缓存优先策略
async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  
  if (cached) {
    // 后台更新缓存
    fetch(request).then(response => {
      if (response && response.status === 200) {
        cache.put(request, response.clone());
      }
    });
    return cached;
  }
  
  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    return new Response('网络错误', { status: 408 });
  }
}

// 网络优先策略
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    return cached || caches.match('/offline.html');
  }
}

// 注册Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('SW注册成功:', registration);
        
        // 检查更新
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // 显示更新提示
              showUpdateNotification();
            }
          });
        });
      })
      .catch(err => console.log('SW注册失败:', err));
  });
}
```

### 6. 性能监控和分析

```javascript
// 性能监控工具
class PerformanceMonitor {
  constructor() {
    this.metrics = {};
    this.init();
  }
  
  init() {
    // 监听页面加载完成
    if (document.readyState === 'complete') {
      this.collectMetrics();
    } else {
      window.addEventListener('load', () => this.collectMetrics());
    }
    
    // 监控Web Vitals
    this.observeWebVitals();
  }
  
  collectMetrics() {
    const perfData = performance.getEntriesByType('navigation')[0];
    
    this.metrics = {
      // 网络相关
      dns: perfData.domainLookupEnd - perfData.domainLookupStart,
      tcp: perfData.connectEnd - perfData.connectStart,
      ttfb: perfData.responseStart - perfData.requestStart,
      
      // 文档处理
      domParsing: perfData.domInteractive - perfData.responseEnd,
      domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
      domComplete: perfData.domComplete - perfData.domInteractive,
      
      // 总体性能
      loadTime: perfData.loadEventEnd - perfData.fetchStart,
      
      // 资源
      resources: performance.getEntriesByType('resource').length
    };
    
    console.table(this.metrics);
    this.sendToAnalytics();
  }
  
  observeWebVitals() {
    // Largest Contentful Paint (LCP)
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.metrics.lcp = lastEntry.renderTime || lastEntry.loadTime;
    }).observe({ entryTypes: ['largest-contentful-paint'] });
    
    // First Input Delay (FID)
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        this.metrics.fid = entry.processingStart - entry.startTime;
      });
    }).observe({ entryTypes: ['first-input'] });
    
    // Cumulative Layout Shift (CLS)
    let clsValue = 0;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      }
      this.metrics.cls = clsValue;
    }).observe({ entryTypes: ['layout-shift'] });
  }
  
  sendToAnalytics() {
    // 发送到分析服务
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/metrics', JSON.stringify(this.metrics));
    }
  }
  
  // 性能标记
  mark(name) {
    performance.mark(name);
  }
  
  // 性能测量
  measure(name, startMark, endMark) {
    performance.measure(name, startMark, endMark);
    const measure = performance.getEntriesByName(name)[0];
    console.log(`${name}: ${measure.duration.toFixed(2)}ms`);
  }
}

// 使用示例
const monitor = new PerformanceMonitor();

// 标记关键时刻
monitor.mark('hero-start');
// ... 渲染hero区域 ...
monitor.mark('hero-end');
monitor.measure('hero-render', 'hero-start', 'hero-end');
```

### 7. Vite生产构建优化

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import { compression } from 'vite-plugin-compression2';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  build: {
    // 启用CSS代码分割
    cssCodeSplit: true,
    
    // 设置chunk大小警告限制
    chunkSizeWarningLimit: 500,
    
    // Rollup配置
    rollupOptions: {
      output: {
        // 手动chunk分割
        manualChunks: {
          // 将React相关的库打包在一起
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // 工具库
          'vendor-utils': ['lodash-es', 'axios', 'date-fns'],
          // UI库
          'vendor-ui': ['@headlessui/react', 'framer-motion']
        },
        
        // 资源文件名
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? 
            chunkInfo.facadeModuleId.split('/').pop().split('.')[0] : 'chunk';
          return `js/${facadeModuleId}-[hash].js`;
        },
        
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `images/[name]-[hash][extname]`;
          } else if (/woff|woff2|eot|ttf|otf/i.test(ext)) {
            return `fonts/[name]-[hash][extname]`;
          } else {
            return `assets/[name]-[hash][extname]`;
          }
        }
      }
    },
    
    // Terser压缩配置
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info'],
        passes: 2
      },
      mangle: {
        safari10: true
      }
    }
  },
  
  plugins: [
    // Gzip和Brotli压缩
    compression({
      algorithm: 'gzip',
      exclude: [/\.(br)$/, /\.(gz)$/],
      threshold: 10240,
      deleteOriginalAssets: false
    }),
    
    compression({
      algorithm: 'brotliCompress',
      exclude: [/\.(br)$/, /\.(gz)$/],
      threshold: 10240,
      deleteOriginalAssets: false
    }),
    
    // 图片优化
    ViteImageOptimizer({
      jpg: {
        quality: 80,
        progressive: true
      },
      png: {
        quality: 80
      },
      webp: {
        quality: 80
      }
    }),
    
    // PWA配置
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: '开发者作品集',
        short_name: '作品集',
        theme_color: '#3b82f6',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1年
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ]
});
```

这个性能优化指南涵盖了实现90+Lighthouse分数所需的所有关键技术，包括图片优化、资源预加载、代码分割、Service Worker缓存、性能监控和构建优化。