---
title: "图片懒加载实现方法"
description: "使用Intersection Observer API和其他技术实现高效的图片懒加载"
---

## 基础懒加载实现

### 使用Intersection Observer

```javascript
// 创建懒加载类
class LazyLoader {
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
    
    // 配置观察器
    const config = {
      // 提前50px开始加载
      rootMargin: '50px 0px',
      // 元素露出1%就触发
      threshold: 0.01
    };
    
    // 创建观察器
    this.imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.loadImage(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, config);
    
    // 开始观察
    this.observeImages();
  }
  
  observeImages() {
    const images = document.querySelectorAll('img[data-src]');
    images.forEach(img => {
      this.imageObserver.observe(img);
    });
  }
  
  loadImage(img) {
    const src = img.dataset.src;
    const srcset = img.dataset.srcset;
    
    // 预加载图片
    const tempImg = new Image();
    
    tempImg.onload = () => {
      // 设置真实图片源
      if (src) img.src = src;
      if (srcset) img.srcset = srcset;
      
      // 添加加载完成类
      img.classList.add('loaded');
      
      // 清理data属性
      delete img.dataset.src;
      delete img.dataset.srcset;
    };
    
    tempImg.onerror = () => {
      img.classList.add('error');
    };
    
    // 开始加载
    tempImg.src = src;
  }
  
  // 降级方案：加载所有图片
  loadAllImages() {
    const images = document.querySelectorAll('img[data-src]');
    images.forEach(img => {
      img.src = img.dataset.src;
      if (img.dataset.srcset) {
        img.srcset = img.dataset.srcset;
      }
    });
  }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  new LazyLoader();
});
```

## 高级懒加载功能

### 带渐进式加载效果

```javascript
class ProgressiveLazyLoader {
  constructor() {
    this.init();
  }
  
  init() {
    const images = document.querySelectorAll('.lazy-image');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.loadProgressiveImage(entry.target);
          observer.unobserve(entry.target);
        }
      });
    });
    
    images.forEach(img => imageObserver.observe(img));
  }
  
  loadProgressiveImage(img) {
    const wrapper = img.closest('.image-wrapper');
    const placeholder = wrapper.querySelector('.placeholder');
    
    // 加载低质量图片
    const lqip = new Image();
    lqip.src = img.dataset.lqip;
    
    lqip.onload = () => {
      placeholder.style.backgroundImage = `url(${lqip.src})`;
      placeholder.classList.add('loaded');
      
      // 加载高质量图片
      const hdImage = new Image();
      
      hdImage.onload = () => {
        img.src = hdImage.src;
        img.classList.add('loaded');
        
        // 淡出占位符
        setTimeout(() => {
          placeholder.style.opacity = '0';
        }, 50);
      };
      
      hdImage.src = img.dataset.src;
    };
  }
}
```

### 响应式图片懒加载

```javascript
class ResponsiveLazyLoader {
  constructor() {
    this.breakpoints = {
      small: 640,
      medium: 1024,
      large: 1920
    };
    this.init();
  }
  
  init() {
    const images = document.querySelectorAll('img.lazy-responsive');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.loadResponsiveImage(entry.target);
          observer.unobserve(entry.target);
        }
      });
    });
    
    images.forEach(img => observer.observe(img));
  }
  
  loadResponsiveImage(img) {
    const sources = JSON.parse(img.dataset.sources);
    const currentWidth = window.innerWidth;
    
    // 选择合适的图片
    let selectedSrc = sources.small;
    
    if (currentWidth > this.breakpoints.medium) {
      selectedSrc = sources.large;
    } else if (currentWidth > this.breakpoints.small) {
      selectedSrc = sources.medium;
    }
    
    // 设置srcset
    const srcset = `
      ${sources.small} ${this.breakpoints.small}w,
      ${sources.medium} ${this.breakpoints.medium}w,
      ${sources.large} ${this.breakpoints.large}w
    `;
    
    img.srcset = srcset;
    img.sizes = `(max-width: ${this.breakpoints.small}px) 100vw,
                 (max-width: ${this.breakpoints.medium}px) 50vw,
                 33vw`;
    img.src = selectedSrc;
  }
}
```

## 原生懒加载

### 使用loading属性

```html
<!-- 浏览器原生懒加载 -->
<img 
  src="image.jpg" 
  loading="lazy"
  alt="懒加载图片">

<!-- 结合Intersection Observer作为降级方案 -->
<img 
  class="lazyload"
  src="placeholder.jpg"
  data-src="actual-image.jpg" 
  loading="lazy"
  alt="渐进增强的懒加载">
```

```javascript
// 检测原生懒加载支持
if ('loading' in HTMLImageElement.prototype) {
  // 浏览器支持原生懒加载
  const images = document.querySelectorAll('img[loading="lazy"]');
  images.forEach(img => {
    img.src = img.dataset.src;
  });
} else {
  // 降级到Intersection Observer
  const script = document.createElement('script');
  script.src = '/js/lazy-load-polyfill.js';
  document.body.appendChild(script);
}
```

## 懒加载性能优化

### 批量加载优化

```javascript
class BatchLazyLoader {
  constructor() {
    this.loadQueue = [];
    this.isLoading = false;
    this.batchSize = 3;
    this.init();
  }
  
  init() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.addToQueue(entry.target);
          observer.unobserve(entry.target);
        }
      });
      
      this.processBatch();
    });
    
    document.querySelectorAll('img[data-src]').forEach(img => {
      observer.observe(img);
    });
  }
  
  addToQueue(img) {
    this.loadQueue.push(img);
  }
  
  async processBatch() {
    if (this.isLoading || this.loadQueue.length === 0) return;
    
    this.isLoading = true;
    const batch = this.loadQueue.splice(0, this.batchSize);
    
    // 并行加载批次中的图片
    const promises = batch.map(img => this.loadImage(img));
    await Promise.all(promises);
    
    this.isLoading = false;
    
    // 继续处理队列
    if (this.loadQueue.length > 0) {
      requestIdleCallback(() => this.processBatch());
    }
  }
  
  loadImage(img) {
    return new Promise((resolve, reject) => {
      const tempImg = new Image();
      
      tempImg.onload = () => {
        img.src = tempImg.src;
        img.classList.add('loaded');
        resolve();
      };
      
      tempImg.onerror = reject;
      tempImg.src = img.dataset.src;
    });
  }
}
```

### 内存优化

```javascript
class MemoryOptimizedLazyLoader {
  constructor() {
    this.loadedImages = new WeakSet();
    this.observer = null;
    this.init();
  }
  
  init() {
    // 配置观察器
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.loadImage(entry.target);
        } else {
          // 图片离开视口时的处理
          this.unloadImage(entry.target);
        }
      });
    }, {
      rootMargin: '50px 0px',
      threshold: [0, 0.01, 1]
    });
    
    // 观察图片
    this.observeImages();
    
    // 监听内存压力
    if ('memory' in performance) {
      this.monitorMemory();
    }
  }
  
  observeImages() {
    document.querySelectorAll('img[data-src]').forEach(img => {
      this.observer.observe(img);
    });
  }
  
  loadImage(img) {
    if (this.loadedImages.has(img)) return;
    
    const src = img.dataset.src;
    img.src = src;
    this.loadedImages.add(img);
  }
  
  unloadImage(img) {
    // 对于离开视口很远的图片，可以考虑释放
    const rect = img.getBoundingClientRect();
    const viewHeight = window.innerHeight;
    
    if (rect.bottom < -viewHeight * 2 || rect.top > viewHeight * 3) {
      // 可选：将图片源替换为占位符以释放内存
      if (img.dataset.placeholder) {
        img.src = img.dataset.placeholder;
        this.loadedImages.delete(img);
      }
    }
  }
  
  monitorMemory() {
    setInterval(() => {
      const memoryInfo = performance.memory;
      const usageRatio = memoryInfo.usedJSHeapSize / memoryInfo.jsHeapSizeLimit;
      
      if (usageRatio > 0.9) {
        console.warn('内存使用率过高，考虑释放一些图片');
        // 实施内存释放策略
      }
    }, 30000);
  }
}
```

## 视频懒加载

```javascript
class VideoLazyLoader {
  constructor() {
    this.init();
  }
  
  init() {
    const videos = document.querySelectorAll('video[data-src]');
    
    const videoObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const video = entry.target;
          
          // 加载视频源
          if (video.dataset.src) {
            video.src = video.dataset.src;
          }
          
          // 加载多个源
          video.querySelectorAll('source[data-src]').forEach(source => {
            source.src = source.dataset.src;
          });
          
          // 加载视频
          video.load();
          
          // 可选：自动播放
          if (video.dataset.autoplay === 'true') {
            video.play().catch(e => console.log('自动播放失败:', e));
          }
          
          videoObserver.unobserve(video);
        }
      });
    }, {
      rootMargin: '100px 0px'
    });
    
    videos.forEach(video => videoObserver.observe(video));
  }
}
```

## iframe懒加载

```javascript
class IframeLazyLoader {
  constructor() {
    this.init();
  }
  
  init() {
    const iframes = document.querySelectorAll('iframe[data-src]');
    
    const iframeObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const iframe = entry.target;
          
          // 加载iframe
          iframe.src = iframe.dataset.src;
          
          // 添加加载状态
          iframe.addEventListener('load', () => {
            iframe.classList.add('loaded');
          });
          
          iframeObserver.unobserve(iframe);
        }
      });
    });
    
    iframes.forEach(iframe => iframeObserver.observe(iframe));
  }
}
```

## 完整示例

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    .image-wrapper {
      position: relative;
      overflow: hidden;
      background: #f0f0f0;
    }
    
    .lazy-image {
      display: block;
      width: 100%;
      opacity: 0;
      transition: opacity 0.3s;
    }
    
    .lazy-image.loaded {
      opacity: 1;
    }
    
    .placeholder {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-size: cover;
      filter: blur(20px);
      transform: scale(1.1);
    }
  </style>
</head>
<body>
  <!-- 响应式懒加载图片 -->
  <div class="image-wrapper">
    <div class="placeholder"></div>
    <img 
      class="lazy-image"
      data-src="image-large.jpg"
      data-lqip="image-lqip.jpg"
      data-srcset="image-small.jpg 400w,
                   image-medium.jpg 800w,
                   image-large.jpg 1200w"
      data-sizes="(max-width: 400px) 100vw,
                  (max-width: 800px) 50vw,
                  33vw"
      alt="懒加载示例">
  </div>
  
  <script>
    // 初始化所有懒加载器
    document.addEventListener('DOMContentLoaded', () => {
      new LazyLoader();
      new VideoLazyLoader();
      new IframeLazyLoader();
    });
  </script>
</body>
</html>
```