---
day: 15
exerciseTitle: "异步图片画廊：掌握异步编程技巧"
approach: "使用async/await、Promise并发控制、懒加载和错误处理构建高性能图片画廊"
files:
  - path: "async-gallery.html"
    language: "html"
    description: "完整的异步图片画廊实现"
keyTakeaways:
  - "使用Promise.allSettled处理部分失败的情况"
  - "通过并发池限制同时加载的资源数量"
  - "AbortController提供了标准的取消异步操作方式"
  - "Intersection Observer是实现懒加载的最佳方案"
  - "合理的错误处理和重试机制提升用户体验"
commonMistakes:
  - "在forEach中使用async/await导致并发问题"
  - "没有正确清理定时器和观察器"
  - "忽略内存管理，导致内存泄漏"
  - "过度使用try-catch而不是Promise的错误处理"
  - "没有考虑用户快速操作导致的竞态条件"
extensions:
  - title: "添加图片预览功能"
    description: "点击图片显示大图预览，支持键盘导航"
  - title: "实现虚拟滚动"
    description: "处理数千张图片时保持高性能"
  - title: "添加筛选和排序"
    description: "按日期、大小、类型筛选和排序图片"
---

# 解决方案：异步图片画廊

## 实现思路

这个解决方案展示了如何构建一个生产级的异步图片画廊，综合运用了：
1. **并发控制**：限制同时加载的图片数量，避免浏览器过载
2. **错误处理**：优雅地处理加载失败，提供重试机制
3. **懒加载**：只加载可见图片，提升初始加载性能
4. **取消操作**：允许用户随时中断加载过程
5. **进度跟踪**：实时反馈加载状态

## 完整实现

### async-gallery.html

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>异步图片画廊 - 完整解决方案</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: #f5f5f5;
            padding: 20px;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        
        header {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            margin-bottom: 20px;
        }
        
        .controls {
            display: flex;
            gap: 10px;
            align-items: center;
            flex-wrap: wrap;
        }
        
        button {
            padding: 10px 20px;
            border: none;
            border-radius: 4px;
            background: #4CAF50;
            color: white;
            cursor: pointer;
            font-size: 14px;
            transition: background 0.3s;
        }
        
        button:hover:not(:disabled) {
            background: #45a049;
        }
        
        button:disabled {
            background: #ccc;
            cursor: not-allowed;
        }
        
        button.danger {
            background: #f44336;
        }
        
        button.danger:hover:not(:disabled) {
            background: #da190b;
        }
        
        .progress {
            flex: 1;
            background: #e0e0e0;
            height: 30px;
            border-radius: 15px;
            overflow: hidden;
            position: relative;
            min-width: 200px;
        }
        
        .progress-bar {
            height: 100%;
            background: linear-gradient(90deg, #4CAF50, #8BC34A);
            transition: width 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 14px;
        }
        
        .gallery {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }
        
        .image-card {
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            transition: transform 0.3s;
        }
        
        .image-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        
        .image-container {
            position: relative;
            padding-bottom: 75%;
            background: #f0f0f0;
        }
        
        .image-container img {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
            opacity: 0;
            transition: opacity 0.3s;
        }
        
        .image-container img.loaded {
            opacity: 1;
        }
        
        .image-status {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            text-align: center;
        }
        
        .spinner {
            border: 3px solid #f3f3f3;
            border-top: 3px solid #4CAF50;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 0 auto 10px;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .error {
            color: #f44336;
            font-size: 14px;
        }
        
        .retry-btn {
            margin-top: 10px;
            padding: 5px 10px;
            font-size: 12px;
        }
        
        .image-info {
            padding: 15px;
        }
        
        .image-title {
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .image-meta {
            font-size: 12px;
            color: #666;
        }
        
        .stats {
            margin-top: 20px;
            padding: 15px;
            background: white;
            border-radius: 8px;
            display: flex;
            gap: 20px;
            flex-wrap: wrap;
        }
        
        .stat-item {
            flex: 1;
            min-width: 150px;
            text-align: center;
        }
        
        .stat-value {
            font-size: 24px;
            font-weight: bold;
            color: #4CAF50;
        }
        
        .stat-label {
            font-size: 14px;
            color: #666;
        }
        
        .loading-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            display: none;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        }
        
        .loading-overlay.active {
            display: flex;
        }
        
        .loading-content {
            background: white;
            padding: 30px;
            border-radius: 8px;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>异步图片画廊</h1>
            <p>使用 Promise 和 async/await 构建的高性能图片加载器</p>
        </header>
        
        <div class="controls">
            <button id="loadBtn">加载图片</button>
            <button id="cancelBtn" class="danger" disabled>取消加载</button>
            <button id="retryFailedBtn" disabled>重试失败的图片</button>
            <button id="clearBtn">清空画廊</button>
            <label>
                并发数：
                <select id="concurrencySelect">
                    <option value="1">1</option>
                    <option value="3" selected>3</option>
                    <option value="5">5</option>
                    <option value="10">10</option>
                </select>
            </label>
            
            <div class="progress">
                <div class="progress-bar" id="progressBar" style="width: 0%">
                    <span id="progressText">0%</span>
                </div>
            </div>
        </div>
        
        <div class="stats">
            <div class="stat-item">
                <div class="stat-value" id="totalImages">0</div>
                <div class="stat-label">总图片数</div>
            </div>
            <div class="stat-item">
                <div class="stat-value" id="loadedImages">0</div>
                <div class="stat-label">已加载</div>
            </div>
            <div class="stat-item">
                <div class="stat-value" id="failedImages">0</div>
                <div class="stat-label">加载失败</div>
            </div>
            <div class="stat-item">
                <div class="stat-value" id="loadingTime">0s</div>
                <div class="stat-label">加载时间</div>
            </div>
        </div>
        
        <div class="gallery" id="gallery"></div>
    </div>
    
    <div class="loading-overlay" id="loadingOverlay">
        <div class="loading-content">
            <div class="spinner"></div>
            <p>正在准备图片数据...</p>
        </div>
    </div>

    <script>
        // ============================================
        // 1. 图片数据生成器
        // ============================================
        
        const generateImageData = (count = 20) => {
            const categories = ['nature', 'city', 'people', 'tech', 'animals'];
            const images = [];
            
            for (let i = 0; i < count; i++) {
                const width = 400 + Math.floor(Math.random() * 200);
                const height = 300 + Math.floor(Math.random() * 150);
                const category = categories[Math.floor(Math.random() * categories.length)];
                
                images.push({
                    id: i + 1,
                    url: `https://picsum.photos/${width}/${height}?random=${i}`,
                    title: `图片 ${i + 1}`,
                    category: category,
                    size: `${width}x${height}`,
                    // 模拟一些图片会加载失败
                    simulateError: Math.random() < 0.1
                });
            }
            
            return images;
        };
        
        // ============================================
        // 2. 并发控制器
        // ============================================
        
        class ConcurrencyController {
            constructor(limit = 3) {
                this.limit = limit;
                this.running = 0;
                this.queue = [];
            }
            
            async run(fn) {
                // 等待有可用的并发槽位
                while (this.running >= this.limit) {
                    await new Promise(resolve => this.queue.push(resolve));
                }
                
                this.running++;
                
                try {
                    return await fn();
                } finally {
                    this.running--;
                    // 释放下一个等待的任务
                    const next = this.queue.shift();
                    if (next) next();
                }
            }
            
            get activeCount() {
                return this.running;
            }
            
            get queueLength() {
                return this.queue.length;
            }
        }
        
        // ============================================
        // 3. 图片加载器
        // ============================================
        
        class ImageLoader {
            constructor(options = {}) {
                this.options = {
                    maxConcurrency: 3,
                    retryAttempts: 3,
                    retryDelay: 1000,
                    timeout: 10000,
                    ...options
                };
                
                this.concurrencyController = new ConcurrencyController(this.options.maxConcurrency);
                this.abortController = null;
                this.cache = new Map();
            }
            
            // 带超时的图片加载
            async loadImageWithTimeout(url, timeout) {
                return new Promise((resolve, reject) => {
                    const img = new Image();
                    let timeoutId;
                    
                    const cleanup = () => {
                        clearTimeout(timeoutId);
                        img.onload = null;
                        img.onerror = null;
                    };
                    
                    timeoutId = setTimeout(() => {
                        cleanup();
                        reject(new Error('图片加载超时'));
                    }, timeout);
                    
                    img.onload = () => {
                        cleanup();
                        resolve(img);
                    };
                    
                    img.onerror = () => {
                        cleanup();
                        reject(new Error('图片加载失败'));
                    };
                    
                    // 检查是否已取消
                    if (this.abortController?.signal.aborted) {
                        cleanup();
                        reject(new Error('操作已取消'));
                        return;
                    }
                    
                    img.src = url;
                });
            }
            
            // 带重试的图片加载
            async loadImageWithRetry(imageData) {
                const { url, simulateError } = imageData;
                
                // 检查缓存
                if (this.cache.has(url)) {
                    return this.cache.get(url);
                }
                
                // 模拟错误
                if (simulateError && Math.random() < 0.8) {
                    throw new Error('模拟加载错误');
                }
                
                let lastError;
                
                for (let attempt = 0; attempt < this.options.retryAttempts; attempt++) {
                    try {
                        // 检查是否已取消
                        if (this.abortController?.signal.aborted) {
                            throw new Error('操作已取消');
                        }
                        
                        const img = await this.loadImageWithTimeout(url, this.options.timeout);
                        
                        // 缓存成功的图片
                        this.cache.set(url, img);
                        
                        return img;
                    } catch (error) {
                        lastError = error;
                        
                        // 如果是取消操作，立即抛出
                        if (error.message === '操作已取消') {
                            throw error;
                        }
                        
                        // 如果还有重试机会，等待后继续
                        if (attempt < this.options.retryAttempts - 1) {
                            const delay = this.options.retryDelay * Math.pow(2, attempt);
                            await new Promise(resolve => setTimeout(resolve, delay));
                        }
                    }
                }
                
                throw lastError;
            }
            
            // 加载单张图片
            async loadImage(imageData, onProgress) {
                return this.concurrencyController.run(async () => {
                    try {
                        const img = await this.loadImageWithRetry(imageData);
                        if (onProgress) onProgress(imageData, 'success', img);
                        return { imageData, status: 'success', img };
                    } catch (error) {
                        if (onProgress) onProgress(imageData, 'error', null, error);
                        return { imageData, status: 'error', error };
                    }
                });
            }
            
            // 批量加载图片
            async loadImages(imagesData, onProgress) {
                this.abortController = new AbortController();
                
                const promises = imagesData.map(imageData => 
                    this.loadImage(imageData, onProgress)
                );
                
                // 使用 allSettled 确保所有操作都完成
                const results = await Promise.allSettled(promises);
                
                return results.map((result, index) => {
                    if (result.status === 'fulfilled') {
                        return result.value;
                    } else {
                        return {
                            imageData: imagesData[index],
                            status: 'error',
                            error: result.reason
                        };
                    }
                });
            }
            
            // 取消所有加载
            cancel() {
                if (this.abortController) {
                    this.abortController.abort();
                    this.abortController = null;
                }
            }
            
            // 更新并发限制
            updateConcurrency(limit) {
                this.options.maxConcurrency = limit;
                this.concurrencyController = new ConcurrencyController(limit);
            }
            
            // 清理缓存
            clearCache() {
                this.cache.clear();
            }
        }
        
        // ============================================
        // 4. 进度跟踪器
        // ============================================
        
        class ProgressTracker {
            constructor(total, onUpdate) {
                this.total = total;
                this.loaded = 0;
                this.failed = 0;
                this.onUpdate = onUpdate;
                this.startTime = Date.now();
            }
            
            update(status) {
                if (status === 'success') {
                    this.loaded++;
                } else if (status === 'error') {
                    this.failed++;
                }
                
                const progress = {
                    total: this.total,
                    loaded: this.loaded,
                    failed: this.failed,
                    percentage: Math.round(((this.loaded + this.failed) / this.total) * 100),
                    elapsedTime: Math.round((Date.now() - this.startTime) / 1000)
                };
                
                if (this.onUpdate) {
                    this.onUpdate(progress);
                }
                
                return progress;
            }
            
            reset() {
                this.loaded = 0;
                this.failed = 0;
                this.startTime = Date.now();
            }
        }
        
        // ============================================
        // 5. 懒加载管理器
        // ============================================
        
        class LazyLoader {
            constructor(options = {}) {
                this.options = {
                    rootMargin: '50px',
                    threshold: 0.01,
                    ...options
                };
                
                this.observer = null;
                this.callbacks = new WeakMap();
            }
            
            init() {
                this.observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const callback = this.callbacks.get(entry.target);
                            if (callback) {
                                callback(entry.target);
                                this.unobserve(entry.target);
                            }
                        }
                    });
                }, this.options);
            }
            
            observe(element, callback) {
                if (!this.observer) {
                    this.init();
                }
                
                this.callbacks.set(element, callback);
                this.observer.observe(element);
            }
            
            unobserve(element) {
                if (this.observer) {
                    this.observer.unobserve(element);
                    this.callbacks.delete(element);
                }
            }
            
            disconnect() {
                if (this.observer) {
                    this.observer.disconnect();
                    this.observer = null;
                }
            }
        }
        
        // ============================================
        // 6. UI控制器
        // ============================================
        
        class GalleryUI {
            constructor() {
                this.elements = {
                    gallery: document.getElementById('gallery'),
                    loadBtn: document.getElementById('loadBtn'),
                    cancelBtn: document.getElementById('cancelBtn'),
                    retryFailedBtn: document.getElementById('retryFailedBtn'),
                    clearBtn: document.getElementById('clearBtn'),
                    concurrencySelect: document.getElementById('concurrencySelect'),
                    progressBar: document.getElementById('progressBar'),
                    progressText: document.getElementById('progressText'),
                    totalImages: document.getElementById('totalImages'),
                    loadedImages: document.getElementById('loadedImages'),
                    failedImages: document.getElementById('failedImages'),
                    loadingTime: document.getElementById('loadingTime'),
                    loadingOverlay: document.getElementById('loadingOverlay')
                };
                
                this.imageElements = new Map();
                this.failedImages = new Set();
            }
            
            // 渲染图片卡片
            renderImageCard(imageData, index) {
                const card = document.createElement('div');
                card.className = 'image-card';
                card.dataset.imageId = imageData.id;
                
                card.innerHTML = `
                    <div class="image-container">
                        <div class="image-status">
                            <div class="spinner"></div>
                            <p>准备加载...</p>
                        </div>
                        <img alt="${imageData.title}" style="display: none;">
                    </div>
                    <div class="image-info">
                        <div class="image-title">${imageData.title}</div>
                        <div class="image-meta">
                            ${imageData.category} | ${imageData.size}
                        </div>
                    </div>
                `;
                
                this.elements.gallery.appendChild(card);
                this.imageElements.set(imageData.id, card);
                
                return card;
            }
            
            // 更新图片状态
            updateImageStatus(imageData, status, img = null, error = null) {
                const card = this.imageElements.get(imageData.id);
                if (!card) return;
                
                const container = card.querySelector('.image-container');
                const statusEl = card.querySelector('.image-status');
                const imgEl = card.querySelector('img');
                
                if (status === 'loading') {
                    statusEl.innerHTML = `
                        <div class="spinner"></div>
                        <p>加载中...</p>
                    `;
                } else if (status === 'success' && img) {
                    imgEl.src = img.src;
                    imgEl.style.display = 'block';
                    imgEl.classList.add('loaded');
                    statusEl.style.display = 'none';
                    this.failedImages.delete(imageData.id);
                } else if (status === 'error') {
                    statusEl.innerHTML = `
                        <p class="error">加载失败</p>
                        <p class="error">${error?.message || '未知错误'}</p>
                        <button class="retry-btn" data-image-id="${imageData.id}">重试</button>
                    `;
                    
                    const retryBtn = statusEl.querySelector('.retry-btn');
                    retryBtn.addEventListener('click', () => {
                        if (this.onRetryImage) {
                            this.onRetryImage(imageData);
                        }
                    });
                    
                    this.failedImages.add(imageData.id);
                }
            }
            
            // 更新进度
            updateProgress(progress) {
                const { percentage, loaded, failed, total, elapsedTime } = progress;
                
                this.elements.progressBar.style.width = `${percentage}%`;
                this.elements.progressText.textContent = `${percentage}%`;
                
                this.elements.totalImages.textContent = total;
                this.elements.loadedImages.textContent = loaded;
                this.elements.failedImages.textContent = failed;
                this.elements.loadingTime.textContent = `${elapsedTime}s`;
                
                // 更新按钮状态
                if (failed > 0) {
                    this.elements.retryFailedBtn.disabled = false;
                }
                
                if (percentage === 100) {
                    this.setLoadingState(false);
                }
            }
            
            // 设置加载状态
            setLoadingState(isLoading) {
                this.elements.loadBtn.disabled = isLoading;
                this.elements.cancelBtn.disabled = !isLoading;
                this.elements.clearBtn.disabled = isLoading;
                this.elements.concurrencySelect.disabled = isLoading;
            }
            
            // 显示加载覆盖层
            showLoadingOverlay(show) {
                this.elements.loadingOverlay.classList.toggle('active', show);
            }
            
            // 清空画廊
            clearGallery() {
                this.elements.gallery.innerHTML = '';
                this.imageElements.clear();
                this.failedImages.clear();
                this.resetStats();
            }
            
            // 重置统计
            resetStats() {
                this.elements.progressBar.style.width = '0%';
                this.elements.progressText.textContent = '0%';
                this.elements.totalImages.textContent = '0';
                this.elements.loadedImages.textContent = '0';
                this.elements.failedImages.textContent = '0';
                this.elements.loadingTime.textContent = '0s';
                this.elements.retryFailedBtn.disabled = true;
            }
            
            // 获取失败的图片数据
            getFailedImages() {
                return Array.from(this.failedImages);
            }
        }
        
        // ============================================
        // 7. 主应用类
        // ============================================
        
        class AsyncGallery {
            constructor() {
                this.ui = new GalleryUI();
                this.imageLoader = new ImageLoader();
                this.lazyLoader = new LazyLoader();
                this.progressTracker = null;
                this.currentImages = [];
                
                this.init();
            }
            
            init() {
                // 绑定事件
                this.ui.elements.loadBtn.addEventListener('click', () => this.loadGallery());
                this.ui.elements.cancelBtn.addEventListener('click', () => this.cancelLoading());
                this.ui.elements.retryFailedBtn.addEventListener('click', () => this.retryFailed());
                this.ui.elements.clearBtn.addEventListener('click', () => this.clearGallery());
                this.ui.elements.concurrencySelect.addEventListener('change', (e) => {
                    this.imageLoader.updateConcurrency(parseInt(e.target.value));
                });
                
                // 设置重试回调
                this.ui.onRetryImage = (imageData) => {
                    this.loadSingleImage(imageData);
                };
            }
            
            async loadGallery() {
                // 显示加载覆盖层
                this.ui.showLoadingOverlay(true);
                
                // 清空现有内容
                this.ui.clearGallery();
                
                // 生成图片数据
                await new Promise(resolve => setTimeout(resolve, 1000)); // 模拟准备时间
                this.currentImages = generateImageData(30);
                
                // 隐藏加载覆盖层
                this.ui.showLoadingOverlay(false);
                
                // 设置UI状态
                this.ui.setLoadingState(true);
                
                // 创建进度跟踪器
                this.progressTracker = new ProgressTracker(
                    this.currentImages.length,
                    (progress) => this.ui.updateProgress(progress)
                );
                
                // 渲染所有图片卡片
                this.currentImages.forEach((imageData, index) => {
                    const card = this.ui.renderImageCard(imageData, index);
                    
                    // 设置懒加载
                    this.lazyLoader.observe(card, () => {
                        this.loadSingleImage(imageData);
                    });
                });
            }
            
            async loadSingleImage(imageData) {
                this.ui.updateImageStatus(imageData, 'loading');
                
                const result = await this.imageLoader.loadImage(
                    imageData,
                    (data, status, img, error) => {
                        this.ui.updateImageStatus(data, status, img, error);
                        if (this.progressTracker) {
                            this.progressTracker.update(status);
                        }
                    }
                );
            }
            
            cancelLoading() {
                this.imageLoader.cancel();
                this.ui.setLoadingState(false);
                
                // 标记所有未完成的图片为已取消
                this.currentImages.forEach(imageData => {
                    const card = this.ui.imageElements.get(imageData.id);
                    if (card) {
                        const imgEl = card.querySelector('img');
                        if (!imgEl.src) {
                            this.ui.updateImageStatus(
                                imageData, 
                                'error', 
                                null, 
                                new Error('加载已取消')
                            );
                        }
                    }
                });
            }
            
            async retryFailed() {
                const failedIds = this.ui.getFailedImages();
                const failedImages = this.currentImages.filter(img => 
                    failedIds.includes(img.id)
                );
                
                if (failedImages.length === 0) return;
                
                // 重置失败图片的状态
                this.ui.setLoadingState(true);
                
                // 创建新的进度跟踪器
                this.progressTracker = new ProgressTracker(
                    failedImages.length,
                    (progress) => {
                        // 更新部分进度
                        const totalProgress = {
                            ...progress,
                            total: this.currentImages.length,
                            loaded: parseInt(this.ui.elements.loadedImages.textContent) + progress.loaded,
                            failed: failedImages.length - progress.loaded
                        };
                        this.ui.updateProgress(totalProgress);
                    }
                );
                
                // 重新加载失败的图片
                for (const imageData of failedImages) {
                    await this.loadSingleImage(imageData);
                }
            }
            
            clearGallery() {
                this.ui.clearGallery();
                this.imageLoader.clearCache();
                this.lazyLoader.disconnect();
                this.currentImages = [];
                this.progressTracker = null;
            }
        }
        
        // ============================================
        // 8. 初始化应用
        // ============================================
        
        const gallery = new AsyncGallery();
        
        // 添加一些调试信息
        window.gallery = gallery;
        console.log('异步图片画廊已初始化！');
        console.log('可以使用 window.gallery 访问实例进行调试');
    </script>
</body>
</html>
```

## 关键实现细节

### 1. 并发控制

```javascript
class ConcurrencyController {
    async run(fn) {
        // 等待直到有可用的槽位
        while (this.running >= this.limit) {
            await new Promise(resolve => this.queue.push(resolve));
        }
        
        this.running++;
        
        try {
            return await fn();
        } finally {
            this.running--;
            // 释放等待的任务
            const next = this.queue.shift();
            if (next) next();
        }
    }
}
```

这种实现确保同时运行的任务不超过限制，避免浏览器过载。

### 2. 超时和重试

```javascript
async loadImageWithTimeout(url, timeout) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        let timeoutId;
        
        // 设置超时
        timeoutId = setTimeout(() => {
            cleanup();
            reject(new Error('图片加载超时'));
        }, timeout);
        
        // 成功加载时清理超时
        img.onload = () => {
            cleanup();
            resolve(img);
        };
        
        img.src = url;
    });
}
```

### 3. 懒加载实现

```javascript
const lazyLoader = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // 元素进入视口，触发加载
            const callback = this.callbacks.get(entry.target);
            if (callback) {
                callback(entry.target);
                this.unobserve(entry.target);
            }
        }
    });
}, { rootMargin: '50px' }); // 提前50px开始加载
```

### 4. 取消操作

使用AbortController提供标准的取消机制：

```javascript
cancel() {
    if (this.abortController) {
        this.abortController.abort();
        this.abortController = null;
    }
}
```

### 5. 错误处理策略

- 使用Promise.allSettled确保所有操作完成
- 为每个图片提供独立的重试机会
- 记录失败的图片，支持批量重试
- 提供清晰的错误信息反馈

## 性能优化

1. **图片缓存**：避免重复加载相同的图片
2. **并发限制**：防止同时发起过多请求
3. **懒加载**：只加载可见区域的图片
4. **进度反馈**：让用户了解加载状态

## 扩展建议

1. **虚拟滚动**：处理大量图片时只渲染可见部分
2. **Service Worker**：实现离线缓存
3. **WebP支持**：检测并使用更高效的图片格式
4. **预加载策略**：根据用户行为预测并预加载图片

这个解决方案展示了如何构建一个生产级的异步应用，不仅功能完整，还考虑了用户体验和性能优化。