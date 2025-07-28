---
title: "图片优化技术详解"
description: "包括响应式图片、现代格式、懒加载等图片优化的完整方案"
category: "performance"
language: "javascript"
---

## 响应式图片实现

### 使用srcset和sizes

```html
<!-- 基本的srcset使用 -->
<img 
  src="image-medium.jpg"
  srcset="image-small.jpg 400w,
          image-medium.jpg 800w,
          image-large.jpg 1200w,
          image-xlarge.jpg 1600w"
  sizes="(max-width: 480px) 100vw,
         (max-width: 768px) 80vw,
         (max-width: 1200px) 60vw,
         800px"
  alt="响应式图片示例">

<!-- 像素密度描述符 -->
<img 
  src="logo.png"
  srcset="logo.png 1x,
          logo@2x.png 2x,
          logo@3x.png 3x"
  alt="高DPI适配Logo">
```

### Picture元素的艺术指导

```html
<!-- 不同场景使用不同图片 -->
<picture>
  <!-- 移动端竖屏 -->
  <source 
    media="(max-width: 768px) and (orientation: portrait)"
    srcset="hero-mobile-portrait.jpg">
  
  <!-- 移动端横屏 -->
  <source 
    media="(max-width: 768px) and (orientation: landscape)"
    srcset="hero-mobile-landscape.jpg">
  
  <!-- 平板 -->
  <source 
    media="(max-width: 1024px)"
    srcset="hero-tablet.jpg">
  
  <!-- 桌面端 -->
  <source 
    media="(min-width: 1025px)"
    srcset="hero-desktop.jpg">
  
  <!-- 降级方案 -->
  <img src="hero-default.jpg" alt="英雄图片">
</picture>

<!-- 支持多种格式 -->
<picture>
  <!-- AVIF (最新格式) -->
  <source 
    type="image/avif"
    srcset="image.avif">
  
  <!-- WebP -->
  <source 
    type="image/webp"
    srcset="image.webp">
  
  <!-- JPEG XL -->
  <source 
    type="image/jxl"
    srcset="image.jxl">
  
  <!-- 传统格式降级 -->
  <img 
    src="image.jpg" 
    alt="多格式图片"
    loading="lazy">
</picture>
```

## 现代图片格式处理

### JavaScript格式检测

```javascript
class ImageFormatDetector {
  constructor() {
    this.supportedFormats = {
      webp: false,
      avif: false,
      jxl: false
    };
    this.checkSupport();
  }
  
  async checkSupport() {
    // 检测WebP支持
    this.supportedFormats.webp = await this.checkWebP();
    
    // 检测AVIF支持
    this.supportedFormats.avif = await this.checkAVIF();
    
    // 检测JPEG XL支持
    this.supportedFormats.jxl = await this.checkJXL();
    
    // 添加类到HTML元素
    this.applyClasses();
  }
  
  checkWebP() {
    return new Promise((resolve) => {
      const webP = new Image();
      webP.onload = webP.onerror = () => {
        resolve(webP.height === 2);
      };
      webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
    });
  }
  
  checkAVIF() {
    return new Promise((resolve) => {
      const avif = new Image();
      avif.onload = () => resolve(true);
      avif.onerror = () => resolve(false);
      avif.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAABcAAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAEAAAABAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQAMAAAAABNjb2xybmNseAACAAIABoAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAAB9tZGF0EgAKCBgABogQEDQgMgkQAAAAB8dSLfI=';
    });
  }
  
  checkJXL() {
    // JPEG XL检测逻辑
    return new Promise((resolve) => {
      // 暂时返回false，因为浏览器支持有限
      resolve(false);
    });
  }
  
  applyClasses() {
    const html = document.documentElement;
    Object.entries(this.supportedFormats).forEach(([format, supported]) => {
      if (supported) {
        html.classList.add(`${format}-supported`);
      } else {
        html.classList.add(`no-${format}`);
      }
    });
  }
  
  getBestFormat(formats) {
    // 按优先级返回最佳格式
    const priority = ['avif', 'jxl', 'webp', 'jpg'];
    
    for (const format of priority) {
      if (this.supportedFormats[format] && formats.includes(format)) {
        return format;
      }
    }
    
    return 'jpg'; // 默认降级
  }
}

// 使用格式检测器
const formatDetector = new ImageFormatDetector();
```

### 动态图片加载器

```javascript
class DynamicImageLoader {
  constructor(formatDetector) {
    this.formatDetector = formatDetector;
  }
  
  loadImage(imageName, options = {}) {
    const format = this.formatDetector.getBestFormat(['avif', 'webp', 'jpg']);
    const size = this.getOptimalSize(options.width);
    
    const img = new Image();
    img.src = `/images/${imageName}-${size}.${format}`;
    
    if (options.lazy) {
      img.loading = 'lazy';
    }
    
    if (options.sizes) {
      img.sizes = options.sizes;
    }
    
    if (options.srcset) {
      img.srcset = this.generateSrcset(imageName, format);
    }
    
    return img;
  }
  
  getOptimalSize(requestedWidth) {
    const sizes = [400, 800, 1200, 1600, 2400];
    const dpr = window.devicePixelRatio || 1;
    const targetWidth = requestedWidth * dpr;
    
    return sizes.find(size => size >= targetWidth) || sizes[sizes.length - 1];
  }
  
  generateSrcset(imageName, format) {
    const sizes = [400, 800, 1200, 1600];
    return sizes.map(size => 
      `/images/${imageName}-${size}.${format} ${size}w`
    ).join(', ');
  }
}
```

## 低质量图片占位符 (LQIP)

### LQIP实现

```javascript
class LQIPLoader {
  constructor() {
    this.init();
  }
  
  init() {
    const images = document.querySelectorAll('[data-lqip]');
    images.forEach(img => this.setupLQIP(img));
  }
  
  setupLQIP(img) {
    const wrapper = img.parentElement;
    
    // 创建占位符
    const placeholder = document.createElement('div');
    placeholder.className = 'lqip-placeholder';
    placeholder.style.backgroundImage = `url(${img.dataset.lqip})`;
    
    // 插入占位符
    wrapper.insertBefore(placeholder, img);
    
    // 加载高质量图片
    const hdImage = new Image();
    
    hdImage.onload = () => {
      img.src = hdImage.src;
      img.classList.add('loaded');
      
      // 淡出占位符
      requestAnimationFrame(() => {
        placeholder.style.opacity = '0';
        setTimeout(() => placeholder.remove(), 300);
      });
    };
    
    hdImage.src = img.dataset.src;
  }
}

// CSS支持
const lqipStyles = `
  .lqip-placeholder {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-size: cover;
    background-position: center;
    filter: blur(20px);
    transform: scale(1.1);
    transition: opacity 0.3s ease-out;
  }
  
  img.loaded {
    animation: fadeIn 0.3s ease-out;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;
```

### 渐进式图片加载

```javascript
class ProgressiveImageLoader {
  constructor() {
    this.queue = [];
    this.loading = false;
  }
  
  load(element, sources) {
    return new Promise((resolve, reject) => {
      this.queue.push({ element, sources, resolve, reject });
      this.processQueue();
    });
  }
  
  async processQueue() {
    if (this.loading || this.queue.length === 0) return;
    
    this.loading = true;
    const { element, sources, resolve, reject } = this.queue.shift();
    
    try {
      // 加载缩略图
      if (sources.thumbnail) {
        await this.loadStage(element, sources.thumbnail, 'thumbnail');
      }
      
      // 加载低质量
      if (sources.low) {
        await this.loadStage(element, sources.low, 'low-quality');
      }
      
      // 加载高质量
      await this.loadStage(element, sources.high, 'high-quality');
      
      resolve();
    } catch (error) {
      reject(error);
    }
    
    this.loading = false;
    this.processQueue();
  }
  
  loadStage(element, src, className) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        element.src = src;
        element.classList.add(className);
        resolve();
      };
      
      img.onerror = reject;
      img.src = src;
    });
  }
}
```

## 图片压缩和优化

### 客户端图片压缩

```javascript
class ClientImageCompressor {
  constructor(options = {}) {
    this.maxWidth = options.maxWidth || 1920;
    this.maxHeight = options.maxHeight || 1080;
    this.quality = options.quality || 0.8;
    this.format = options.format || 'webp';
  }
  
  async compressImage(file) {
    // 读取图片
    const bitmap = await createImageBitmap(file);
    
    // 计算新尺寸
    const { width, height } = this.calculateDimensions(
      bitmap.width,
      bitmap.height
    );
    
    // 创建画布
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    
    const ctx = canvas.getContext('2d');
    
    // 设置白色背景（对于透明图片）
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);
    
    // 绘制图片
    ctx.drawImage(bitmap, 0, 0, width, height);
    
    // 转换为Blob
    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => resolve(blob),
        `image/${this.format}`,
        this.quality
      );
    });
  }
  
  calculateDimensions(originalWidth, originalHeight) {
    let width = originalWidth;
    let height = originalHeight;
    
    // 保持宽高比缩放
    if (width > this.maxWidth) {
      height = (this.maxWidth / width) * height;
      width = this.maxWidth;
    }
    
    if (height > this.maxHeight) {
      width = (this.maxHeight / height) * width;
      height = this.maxHeight;
    }
    
    return { width: Math.round(width), height: Math.round(height) };
  }
  
  async compressMultiple(files, onProgress) {
    const results = [];
    
    for (let i = 0; i < files.length; i++) {
      const compressed = await this.compressImage(files[i]);
      results.push({
        original: files[i],
        compressed,
        reduction: ((files[i].size - compressed.size) / files[i].size * 100).toFixed(2)
      });
      
      if (onProgress) {
        onProgress((i + 1) / files.length * 100);
      }
    }
    
    return results;
  }
}

// 使用示例
const compressor = new ClientImageCompressor({
  maxWidth: 1200,
  quality: 0.85,
  format: 'webp'
});

// 文件输入处理
document.getElementById('fileInput').addEventListener('change', async (e) => {
  const files = Array.from(e.target.files);
  
  const results = await compressor.compressMultiple(files, (progress) => {
    console.log(`压缩进度: ${progress}%`);
  });
  
  results.forEach(result => {
    console.log(`压缩率: ${result.reduction}%`);
  });
});
```

## 智能图片加载策略

### 自适应图片质量

```javascript
class AdaptiveImageLoader {
  constructor() {
    this.networkInfo = this.getNetworkInfo();
    this.init();
  }
  
  getNetworkInfo() {
    const connection = navigator.connection || 
                      navigator.mozConnection || 
                      navigator.webkitConnection;
    
    return {
      type: connection?.effectiveType || '4g',
      saveData: connection?.saveData || false,
      downlink: connection?.downlink || 10,
      rtt: connection?.rtt || 50
    };
  }
  
  init() {
    // 监听网络变化
    if (navigator.connection) {
      navigator.connection.addEventListener('change', () => {
        this.networkInfo = this.getNetworkInfo();
        this.updateImages();
      });
    }
    
    // 处理所有自适应图片
    this.updateImages();
  }
  
  updateImages() {
    const images = document.querySelectorAll('[data-adaptive-src]');
    images.forEach(img => this.loadAdaptiveImage(img));
  }
  
  loadAdaptiveImage(img) {
    const sources = JSON.parse(img.dataset.adaptiveSrc);
    const quality = this.determineQuality();
    
    // 选择合适的图片源
    const selectedSource = sources[quality] || sources.medium;
    
    // 如果是新源，则加载
    if (img.src !== selectedSource) {
      const tempImg = new Image();
      
      tempImg.onload = () => {
        img.src = selectedSource;
        img.classList.add(`quality-${quality}`);
      };
      
      tempImg.src = selectedSource;
    }
  }
  
  determineQuality() {
    // 省流量模式
    if (this.networkInfo.saveData) {
      return 'low';
    }
    
    // 根据网络类型
    switch (this.networkInfo.type) {
      case 'slow-2g':
      case '2g':
        return 'low';
      case '3g':
        return 'medium';
      case '4g':
      default:
        // 根据具体速度进一步判断
        if (this.networkInfo.downlink < 1.5) {
          return 'medium';
        }
        return 'high';
    }
  }
}

// HTML使用示例
/*
<img 
  data-adaptive-src='{
    "low": "/images/product-low.jpg",
    "medium": "/images/product-medium.jpg",
    "high": "/images/product-high.jpg"
  }'
  alt="自适应质量图片">
*/
```

## 图片性能监控

```javascript
class ImagePerformanceMonitor {
  constructor() {
    this.metrics = {
      totalImages: 0,
      loadedImages: 0,
      failedImages: 0,
      totalSize: 0,
      loadTimes: []
    };
    
    this.init();
  }
  
  init() {
    // 使用PerformanceObserver监控图片加载
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.initiatorType === 'img') {
            this.recordImageMetrics(entry);
          }
        }
      });
      
      observer.observe({ entryTypes: ['resource'] });
    }
    
    // 监控DOM中的图片
    this.monitorDOMImages();
  }
  
  monitorDOMImages() {
    const images = document.getElementsByTagName('img');
    this.metrics.totalImages = images.length;
    
    Array.from(images).forEach(img => {
      if (img.complete) {
        this.metrics.loadedImages++;
      } else {
        img.addEventListener('load', () => {
          this.metrics.loadedImages++;
          this.checkAllLoaded();
        });
        
        img.addEventListener('error', () => {
          this.metrics.failedImages++;
          console.error(`图片加载失败: ${img.src}`);
        });
      }
    });
  }
  
  recordImageMetrics(entry) {
    this.metrics.loadTimes.push({
      url: entry.name,
      duration: entry.duration,
      size: entry.transferSize,
      startTime: entry.startTime
    });
    
    this.metrics.totalSize += entry.transferSize || 0;
  }
  
  checkAllLoaded() {
    if (this.metrics.loadedImages + this.metrics.failedImages === this.metrics.totalImages) {
      this.reportMetrics();
    }
  }
  
  reportMetrics() {
    const avgLoadTime = this.metrics.loadTimes.reduce((sum, item) => 
      sum + item.duration, 0) / this.metrics.loadTimes.length;
    
    console.log('图片加载性能报告:', {
      总图片数: this.metrics.totalImages,
      成功加载: this.metrics.loadedImages,
      加载失败: this.metrics.failedImages,
      总大小: `${(this.metrics.totalSize / 1024 / 1024).toFixed(2)} MB`,
      平均加载时间: `${avgLoadTime.toFixed(2)} ms`,
      最慢图片: this.metrics.loadTimes.sort((a, b) => 
        b.duration - a.duration)[0]
    });
  }
  
  getMetrics() {
    return this.metrics;
  }
}

// 初始化监控
const imageMonitor = new ImagePerformanceMonitor();
```