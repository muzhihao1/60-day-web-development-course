---
title: "资源提示（Resource Hints）使用指南"
description: "深入了解dns-prefetch、preconnect、preload、prefetch等资源提示的使用"
---

## 资源提示类型概览

```html
<!-- DNS预解析 -->
<link rel="dns-prefetch" href="//example.com">

<!-- 预连接 -->
<link rel="preconnect" href="https://example.com">

<!-- 预加载 -->
<link rel="preload" href="font.woff2" as="font" crossorigin>

<!-- 预获取 -->
<link rel="prefetch" href="next-page-data.json">

<!-- 预渲染 (已废弃，用于兼容) -->
<link rel="prerender" href="next-page.html">

<!-- 模块预加载 -->
<link rel="modulepreload" href="module.js">
```

## DNS预解析 (dns-prefetch)

### 基本使用

```html
<!-- 预解析第三方域名 -->
<link rel="dns-prefetch" href="//fonts.googleapis.com">
<link rel="dns-prefetch" href="//www.google-analytics.com">
<link rel="dns-prefetch" href="//cdn.example.com">
```

### 动态DNS预解析

```javascript
// 动态添加DNS预解析
function addDnsPrefetch(domain) {
  const link = document.createElement('link');
  link.rel = 'dns-prefetch';
  link.href = domain;
  document.head.appendChild(link);
}

// 根据用户行为预解析
document.addEventListener('mouseover', (e) => {
  const link = e.target.closest('a');
  if (link && link.hostname !== location.hostname) {
    addDnsPrefetch(`//${link.hostname}`);
  }
});

// 批量预解析
const domains = [
  '//api.example.com',
  '//images.example.com',
  '//static.example.com'
];

domains.forEach(domain => addDnsPrefetch(domain));
```

## 预连接 (preconnect)

### 基本使用

```html
<!-- 预连接包括DNS查询、TCP握手和TLS协商 -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

<!-- 对于需要CORS的资源添加crossorigin -->
<link rel="preconnect" href="https://api.example.com" crossorigin>
```

### 智能预连接

```javascript
class SmartPreconnect {
  constructor() {
    this.connected = new Set();
    this.init();
  }
  
  init() {
    // 监听用户交互
    document.addEventListener('mouseover', this.handleHover.bind(this));
    
    // 基于Intersection Observer的预连接
    this.observeLinks();
  }
  
  handleHover(e) {
    const link = e.target.closest('a[href]');
    if (link) {
      const url = new URL(link.href);
      this.preconnect(url.origin);
    }
  }
  
  observeLinks() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const link = entry.target;
          const url = new URL(link.href);
          this.preconnect(url.origin);
        }
      });
    }, {
      rootMargin: '0px 0px 50px 0px'
    });
    
    document.querySelectorAll('a[href^="http"]').forEach(link => {
      observer.observe(link);
    });
  }
  
  preconnect(origin) {
    if (this.connected.has(origin) || origin === location.origin) {
      return;
    }
    
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = origin;
    
    // 检查是否需要CORS
    if (this.needsCORS(origin)) {
      link.crossOrigin = 'anonymous';
    }
    
    document.head.appendChild(link);
    this.connected.add(origin);
  }
  
  needsCORS(origin) {
    // 判断是否需要CORS的逻辑
    const corsOrigins = [
      'https://api.example.com',
      'https://fonts.gstatic.com'
    ];
    return corsOrigins.includes(origin);
  }
}

// 使用
new SmartPreconnect();
```

## 预加载 (preload)

### 关键资源预加载

```html
<!-- 字体预加载 -->
<link rel="preload" href="/fonts/main.woff2" as="font" type="font/woff2" crossorigin>

<!-- CSS预加载 -->
<link rel="preload" href="/css/critical.css" as="style">

<!-- JavaScript预加载 -->
<link rel="preload" href="/js/app.js" as="script">

<!-- 图片预加载 -->
<link rel="preload" href="/img/hero.webp" as="image" type="image/webp">

<!-- 带媒体查询的预加载 -->
<link rel="preload" href="mobile.css" as="style" media="(max-width: 768px)">
```

### 动态预加载管理

```javascript
class PreloadManager {
  constructor() {
    this.preloaded = new Map();
  }
  
  // 预加载资源
  preload(url, options = {}) {
    if (this.preloaded.has(url)) {
      return this.preloaded.get(url);
    }
    
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;
    
    // 设置资源类型
    if (options.as) {
      link.as = options.as;
    }
    
    // 设置MIME类型
    if (options.type) {
      link.type = options.type;
    }
    
    // 设置CORS
    if (options.crossorigin) {
      link.crossOrigin = options.crossorigin;
    }
    
    // 设置媒体查询
    if (options.media) {
      link.media = options.media;
    }
    
    // 监听加载完成
    const promise = new Promise((resolve, reject) => {
      link.onload = () => resolve(url);
      link.onerror = () => reject(new Error(`Failed to preload ${url}`));
    });
    
    document.head.appendChild(link);
    this.preloaded.set(url, promise);
    
    return promise;
  }
  
  // 预加载并执行
  async preloadAndExecute(url, options = {}) {
    await this.preload(url, options);
    
    switch (options.as) {
      case 'script':
        return this.loadScript(url);
      case 'style':
        return this.loadStyle(url);
      default:
        return url;
    }
  }
  
  loadScript(url) {
    const script = document.createElement('script');
    script.src = url;
    document.body.appendChild(script);
    return script;
  }
  
  loadStyle(url) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url;
    document.head.appendChild(link);
    return link;
  }
}

// 使用示例
const preloader = new PreloadManager();

// 预加载关键资源
preloader.preload('/fonts/main.woff2', {
  as: 'font',
  type: 'font/woff2',
  crossorigin: 'anonymous'
});

// 预加载并执行脚本
preloader.preloadAndExecute('/js/feature.js', {
  as: 'script'
}).then(() => {
  console.log('Feature script loaded');
});
```

## 预获取 (prefetch)

### 智能预获取

```javascript
class SmartPrefetch {
  constructor() {
    this.prefetched = new Set();
    this.init();
  }
  
  init() {
    // 在空闲时预获取
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => this.prefetchResources());
    } else {
      setTimeout(() => this.prefetchResources(), 1000);
    }
    
    // 基于用户行为预获取
    this.setupBehaviorPrefetch();
  }
  
  prefetchResources() {
    // 检查网络状况
    if (this.shouldPrefetch()) {
      // 预获取下一页资源
      this.prefetch('/api/next-page-data.json');
      this.prefetch('/js/next-page.js');
      this.prefetch('/css/next-page.css');
    }
  }
  
  shouldPrefetch() {
    // 检查网络连接
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    
    if (connection) {
      // 不在慢速网络或省流量模式下预获取
      if (connection.saveData || connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
        return false;
      }
    }
    
    return true;
  }
  
  setupBehaviorPrefetch() {
    // 鼠标悬停时预获取
    document.addEventListener('mouseover', (e) => {
      const link = e.target.closest('a[href]');
      if (link && this.isInternalLink(link)) {
        this.prefetchPage(link.href);
      }
    });
    
    // 视口内链接预获取
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const link = entry.target;
          this.prefetchPage(link.href);
        }
      });
    }, {
      rootMargin: '0px 0px 100px 0px'
    });
    
    document.querySelectorAll('a[href]').forEach(link => {
      if (this.isInternalLink(link)) {
        observer.observe(link);
      }
    });
  }
  
  isInternalLink(link) {
    return link.hostname === location.hostname;
  }
  
  prefetch(url) {
    if (this.prefetched.has(url)) return;
    
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    document.head.appendChild(link);
    
    this.prefetched.add(url);
  }
  
  async prefetchPage(url) {
    if (this.prefetched.has(url)) return;
    
    try {
      // 解析页面获取资源
      const response = await fetch(url);
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      // 预获取页面的CSS
      doc.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
        this.prefetch(link.href);
      });
      
      // 预获取页面的JS
      doc.querySelectorAll('script[src]').forEach(script => {
        this.prefetch(script.src);
      });
      
      this.prefetched.add(url);
    } catch (error) {
      console.error('Prefetch failed:', error);
    }
  }
}

// 初始化
new SmartPrefetch();
```

## 模块预加载 (modulepreload)

```html
<!-- ES模块预加载 -->
<link rel="modulepreload" href="/js/app.mjs">
<link rel="modulepreload" href="/js/utils.mjs">
```

```javascript
// 动态模块预加载
class ModulePreloader {
  constructor() {
    this.modules = new Map();
  }
  
  preload(moduleUrl) {
    if (this.modules.has(moduleUrl)) {
      return this.modules.get(moduleUrl);
    }
    
    const link = document.createElement('link');
    link.rel = 'modulepreload';
    link.href = moduleUrl;
    document.head.appendChild(link);
    
    // 创建模块Promise
    const modulePromise = import(moduleUrl);
    this.modules.set(moduleUrl, modulePromise);
    
    return modulePromise;
  }
  
  // 预加载模块依赖图
  async preloadDependencies(entryModule) {
    const visited = new Set();
    const queue = [entryModule];
    
    while (queue.length > 0) {
      const moduleUrl = queue.shift();
      if (visited.has(moduleUrl)) continue;
      
      visited.add(moduleUrl);
      
      try {
        // 获取模块内容
        const response = await fetch(moduleUrl);
        const code = await response.text();
        
        // 简单的import语句解析
        const imports = code.match(/import.*from\s+['"](.+?)['"]/g) || [];
        
        imports.forEach(importStatement => {
          const match = importStatement.match(/from\s+['"](.+?)['"]/);
          if (match) {
            const importUrl = new URL(match[1], moduleUrl).href;
            this.preload(importUrl);
            queue.push(importUrl);
          }
        });
      } catch (error) {
        console.error(`Failed to preload dependencies for ${moduleUrl}:`, error);
      }
    }
  }
}

// 使用
const moduleLoader = new ModulePreloader();
moduleLoader.preloadDependencies('/js/app.mjs');
```

## 优先级提示 (Priority Hints)

```html
<!-- 高优先级 -->
<link rel="preload" href="critical.css" as="style" importance="high">
<img src="hero.jpg" importance="high" alt="重要图片">

<!-- 低优先级 -->
<link rel="prefetch" href="next-page.js" importance="low">
<img src="decorative.jpg" importance="low" alt="装饰图片">

<!-- 自动优先级 -->
<script src="analytics.js" importance="auto"></script>
```

## 完整的资源提示策略

```javascript
class ResourceHintStrategy {
  constructor() {
    this.init();
  }
  
  init() {
    // 立即执行的预连接
    this.immediatePreconnects();
    
    // DOM加载完成后的预加载
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.criticalPreloads());
    } else {
      this.criticalPreloads();
    }
    
    // 窗口加载完成后的预获取
    window.addEventListener('load', () => {
      requestIdleCallback(() => this.idlePrefetch());
    });
  }
  
  immediatePreconnects() {
    const connections = [
      { href: 'https://fonts.googleapis.com' },
      { href: 'https://fonts.gstatic.com', crossorigin: true },
      { href: 'https://www.google-analytics.com' },
      { href: 'https://api.example.com', crossorigin: true }
    ];
    
    connections.forEach(conn => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = conn.href;
      if (conn.crossorigin) {
        link.crossOrigin = 'anonymous';
      }
      document.head.appendChild(link);
    });
  }
  
  criticalPreloads() {
    const preloads = [
      {
        href: '/fonts/main.woff2',
        as: 'font',
        type: 'font/woff2',
        crossorigin: true
      },
      {
        href: '/css/critical.css',
        as: 'style'
      },
      {
        href: '/js/main.js',
        as: 'script'
      }
    ];
    
    preloads.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      Object.assign(link, resource);
      document.head.appendChild(link);
    });
  }
  
  idlePrefetch() {
    // 检查网络和设备状态
    if (!this.canPrefetch()) return;
    
    // 预获取可能需要的资源
    const prefetchUrls = [
      '/api/user-data.json',
      '/js/feature-module.js',
      '/css/feature-styles.css'
    ];
    
    prefetchUrls.forEach(url => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = url;
      document.head.appendChild(link);
    });
  }
  
  canPrefetch() {
    // 检查网络连接
    const connection = navigator.connection;
    if (connection) {
      if (connection.saveData) return false;
      if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') return false;
    }
    
    // 检查设备内存
    if ('deviceMemory' in navigator && navigator.deviceMemory < 4) {
      return false;
    }
    
    return true;
  }
}

// 初始化策略
new ResourceHintStrategy();
```