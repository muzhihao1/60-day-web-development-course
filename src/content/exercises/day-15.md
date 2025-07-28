---
day: 15
title: "异步图片画廊：掌握异步编程技巧"
description: "构建一个功能完整的异步图片画廊，实践Promise、async/await、并发控制和错误处理"
difficulty: "intermediate"
estimatedTime: 90
requirements:
  - "实现异步加载图片列表"
  - "显示实时加载进度"
  - "优雅的错误处理和重试机制"
  - "支持取消正在进行的加载"
  - "实现图片懒加载"
  - "控制并发加载数量"
hints:
  - "使用Promise.allSettled处理部分失败"
  - "使用AbortController实现取消功能"
  - "使用Intersection Observer API实现懒加载"
  - "创建一个并发池来限制同时加载的图片数"
  - "为每个图片显示独立的加载状态"
checkpoints:
  - task: "创建图片数据获取函数"
    completed: false
  - task: "实现进度跟踪系统"
    completed: false
  - task: "添加错误处理和重试"
    completed: false
  - task: "实现取消加载功能"
    completed: false
  - task: "添加懒加载支持"
    completed: false
  - task: "实现并发控制"
    completed: false
  - task: "创建用户界面"
    completed: false
starterCode:
  language: "javascript"
  path: "/exercises/day-15/async-gallery.html"
---

# 练习：异步图片画廊

## 🎯 任务目标

创建一个现代化的异步图片画廊，展示你对异步编程的掌握。这个画廊不仅要能加载和显示图片，还要提供出色的用户体验，包括加载进度、错误处理、取消操作等功能。

## 📋 功能需求

### 1. 基础功能
- 从API获取图片列表（模拟）
- 异步加载图片
- 显示加载状态
- 基础错误处理

### 2. 进阶功能
- 实时显示加载进度（已加载/总数）
- 单个图片加载失败时的重试机制
- 支持取消所有正在进行的加载
- 限制并发加载数量（如最多3张同时加载）

### 3. 高级功能
- 图片懒加载（只加载视口内的图片）
- 加载优先级（优先加载可见图片）
- 缓存已加载的图片
- 批量操作（全选、批量下载等）

## 🔧 技术要求

1. **必须使用async/await语法**
2. **合理使用Promise并发方法**（all、allSettled、race）
3. **实现自定义的错误处理和重试逻辑**
4. **使用AbortController处理取消操作**
5. **使用Intersection Observer实现懒加载**

## 📝 初始代码

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>异步图片画廊</title>
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
            padding-bottom: 75%; /* 4:3 宽高比 */
            background: #f0f0f0;
        }
        
        .image-container img {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
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

    <script>
        // TODO: 实现异步图片画廊
        
        // 1. 模拟图片数据源
        const generateImageData = (count = 20) => {
            // 生成模拟的图片数据
            // 使用 Lorem Picsum 或其他图片服务
        };
        
        // 2. 图片加载器类
        class ImageLoader {
            constructor(options = {}) {
                // 初始化配置
                // - maxConcurrency: 最大并发数
                // - retryAttempts: 重试次数
                // - retryDelay: 重试延迟
                // - timeout: 超时时间
            }
            
            async loadImage(imageData) {
                // 加载单张图片
                // 实现超时控制
                // 实现错误处理
            }
            
            async loadImages(images) {
                // 批量加载图片
                // 实现并发控制
                // 实现进度跟踪
                // 支持取消操作
            }
            
            cancel() {
                // 取消所有正在进行的加载
            }
        }
        
        // 3. 并发控制器
        class ConcurrencyController {
            constructor(limit) {
                // 实现并发限制
            }
            
            async run(fn) {
                // 执行任务，确保不超过并发限制
            }
        }
        
        // 4. 进度跟踪器
        class ProgressTracker {
            constructor(total) {
                // 初始化进度跟踪
            }
            
            update(loaded, failed) {
                // 更新进度
                // 触发UI更新
            }
        }
        
        // 5. 懒加载管理器
        class LazyLoader {
            constructor() {
                // 使用 Intersection Observer
            }
            
            observe(element, callback) {
                // 观察元素是否进入视口
            }
        }
        
        // 6. UI控制器
        class GalleryUI {
            constructor() {
                // 初始化UI元素
                // 绑定事件
            }
            
            renderImage(imageData, index) {
                // 渲染单个图片卡片
            }
            
            updateProgress(progress) {
                // 更新进度条
            }
            
            updateStats(stats) {
                // 更新统计信息
            }
        }
        
        // 7. 主应用类
        class AsyncGallery {
            constructor() {
                // 组合所有组件
                // 初始化应用
            }
            
            async loadGallery() {
                // 主加载流程
            }
        }
        
        // 初始化应用
        const gallery = new AsyncGallery();
    </script>
</body>
</html>
```

## 🎨 期望效果

1. **加载流程**
   - 点击"加载图片"开始异步加载
   - 进度条实时显示加载进度
   - 每张图片显示独立的加载状态

2. **错误处理**
   - 加载失败的图片显示错误信息
   - 提供单独的重试按钮
   - 支持批量重试失败的图片

3. **性能优化**
   - 限制同时加载的图片数量
   - 实现懒加载，只加载可见图片
   - 缓存已加载的图片避免重复请求

4. **用户体验**
   - 流畅的加载动画
   - 清晰的状态反馈
   - 可随时取消操作

## 💡 实现提示

### 并发控制实现
```javascript
class ConcurrencyPool {
    constructor(limit) {
        this.limit = limit;
        this.running = 0;
        this.queue = [];
    }
    
    async run(fn) {
        while (this.running >= this.limit) {
            await new Promise(resolve => this.queue.push(resolve));
        }
        
        this.running++;
        try {
            return await fn();
        } finally {
            this.running--;
            const next = this.queue.shift();
            if (next) next();
        }
    }
}
```

### 超时控制
```javascript
const withTimeout = (promise, ms) => {
    return Promise.race([
        promise,
        new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), ms)
        )
    ]);
};
```

### 重试机制
```javascript
const retry = async (fn, attempts = 3, delay = 1000) => {
    try {
        return await fn();
    } catch (error) {
        if (attempts <= 1) throw error;
        await new Promise(r => setTimeout(r, delay));
        return retry(fn, attempts - 1, delay * 2);
    }
};
```

## 🚀 额外挑战

1. **高级懒加载**
   - 预加载即将进入视口的图片
   - 根据滚动方向调整加载优先级

2. **智能重试**
   - 根据错误类型决定是否重试
   - 实现指数退避算法

3. **性能监控**
   - 记录每张图片的加载时间
   - 生成性能报告

4. **离线支持**
   - 使用 Service Worker 缓存图片
   - 支持离线浏览

## 📚 参考资源

- [MDN - Promise](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise)
- [MDN - async/await](https://developer.mozilla.org/zh-CN/docs/Learn/JavaScript/Asynchronous/Promises)
- [MDN - Intersection Observer](https://developer.mozilla.org/zh-CN/docs/Web/API/Intersection_Observer_API)
- [MDN - AbortController](https://developer.mozilla.org/zh-CN/docs/Web/API/AbortController)

记住：**优秀的异步代码不仅要功能正确，还要提供出色的用户体验！**