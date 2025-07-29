---
title: "实际应用模式"
category: "tips"
language: "javascript"
---

# 实际应用模式

## 实时搜索实现（带防抖和取消）

```javascript
class SearchController {
  constructor(searchEndpoint, options = {}) {
    this.searchEndpoint = searchEndpoint;
    this.debounceTime = options.debounceTime || 300;
    this.minQueryLength = options.minQueryLength || 2;
    this.currentController = null;
    this.cache = new Map();
  }
  
  // 防抖函数
  debounce(func, wait) {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }
  
  // 搜索方法
  async search(query) {
    // 检查查询长度
    if (query.length < this.minQueryLength) {
      return { results: [], cached: false };
    }
    
    // 检查缓存
    if (this.cache.has(query)) {
      return { results: this.cache.get(query), cached: true };
    }
    
    // 取消之前的请求
    if (this.currentController) {
      this.currentController.abort();
    }
    
    // 创建新的控制器
    this.currentController = new AbortController();
    
    try {
      const response = await fetch(
        `${this.searchEndpoint}?q=${encodeURIComponent(query)}`,
        { signal: this.currentController.signal }
      );
      
      if (!response.ok) {
        throw new Error('搜索请求失败');
      }
      
      const results = await response.json();
      
      // 缓存结果
      this.cache.set(query, results);
      
      // 限制缓存大小
      if (this.cache.size > 50) {
        const firstKey = this.cache.keys().next().value;
        this.cache.delete(firstKey);
      }
      
      return { results, cached: false };
      
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('搜索请求被取消');
        return { results: [], canceled: true };
      }
      throw error;
    } finally {
      this.currentController = null;
    }
  }
  
  // 创建防抖搜索
  createDebouncedSearch() {
    return this.debounce(this.search.bind(this), this.debounceTime);
  }
}

// 使用示例
const searchController = new SearchController('/api/search');
const debouncedSearch = searchController.createDebouncedSearch();

// 绑定到输入框
document.getElementById('searchInput').addEventListener('input', async (e) => {
  const query = e.target.value.trim();
  const searchResults = document.getElementById('searchResults');
  
  if (!query) {
    searchResults.innerHTML = '';
    return;
  }
  
  searchResults.innerHTML = '<div class="loading">搜索中...</div>';
  
  try {
    const { results, cached, canceled } = await debouncedSearch(query);
    
    if (canceled) {
      return; // 请求被取消，不更新UI
    }
    
    if (results.length === 0) {
      searchResults.innerHTML = '<div class="empty">没有找到结果</div>';
    } else {
      searchResults.innerHTML = results
        .map(item => `
          <div class="result-item ${cached ? 'cached' : ''}">
            <h3>${item.title}</h3>
            <p>${item.description}</p>
            ${cached ? '<span class="cache-indicator">缓存</span>' : ''}
          </div>
        `)
        .join('');
    }
  } catch (error) {
    searchResults.innerHTML = '<div class="error">搜索失败，请重试</div>';
  }
});
```

## 无限滚动加载

```javascript
class InfiniteScroll {
  constructor(container, loadMoreFn, options = {}) {
    this.container = container;
    this.loadMoreFn = loadMoreFn;
    this.threshold = options.threshold || 200;
    this.loading = false;
    this.hasMore = true;
    this.page = 1;
    
    this.setupObserver();
  }
  
  setupObserver() {
    // 创建sentinel元素
    this.sentinel = document.createElement('div');
    this.sentinel.className = 'infinite-scroll-sentinel';
    this.container.appendChild(this.sentinel);
    
    // 使用Intersection Observer
    const observerOptions = {
      root: null,
      rootMargin: `${this.threshold}px`,
      threshold: 0.1
    };
    
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.loading && this.hasMore) {
          this.loadMore();
        }
      });
    }, observerOptions);
    
    this.observer.observe(this.sentinel);
  }
  
  async loadMore() {
    if (this.loading || !this.hasMore) return;
    
    this.loading = true;
    this.showLoading();
    
    try {
      const { items, hasMore } = await this.loadMoreFn(this.page);
      
      if (items.length > 0) {
        this.appendItems(items);
        this.page++;
      }
      
      this.hasMore = hasMore;
      
      if (!hasMore) {
        this.showEndMessage();
      }
    } catch (error) {
      this.showError();
    } finally {
      this.loading = false;
      this.hideLoading();
    }
  }
  
  appendItems(items) {
    const fragment = document.createDocumentFragment();
    
    items.forEach(item => {
      const element = this.createItemElement(item);
      fragment.appendChild(element);
    });
    
    this.container.insertBefore(fragment, this.sentinel);
  }
  
  createItemElement(item) {
    const div = document.createElement('div');
    div.className = 'item';
    div.innerHTML = `
      <h3>${item.title}</h3>
      <p>${item.content}</p>
    `;
    return div;
  }
  
  showLoading() {
    this.sentinel.innerHTML = '<div class="loading">加载中...</div>';
  }
  
  hideLoading() {
    this.sentinel.innerHTML = '';
  }
  
  showEndMessage() {
    this.sentinel.innerHTML = '<div class="end-message">没有更多内容了</div>';
    this.observer.disconnect();
  }
  
  showError() {
    this.sentinel.innerHTML = `
      <div class="error">
        加载失败 
        <button onclick="this.parentElement.parentElement.infiniteScroll.retry()">
          重试
        </button>
      </div>
    `;
  }
  
  retry() {
    this.loadMore();
  }
  
  reset() {
    this.page = 1;
    this.hasMore = true;
    this.container.innerHTML = '';
    this.container.appendChild(this.sentinel);
    this.observer.observe(this.sentinel);
    this.loadMore();
  }
}

// 使用示例
const container = document.getElementById('itemsContainer');

const infiniteScroll = new InfiniteScroll(
  container,
  async (page) => {
    // 模拟API调用
    const response = await fetch(`/api/items?page=${page}&limit=20`);
    const data = await response.json();
    
    return {
      items: data.items,
      hasMore: data.hasMore
    };
  },
  { threshold: 100 }
);

// 保存引用以便重试
container.infiniteScroll = infiniteScroll;
```

## 文件上传管理器

```javascript
class UploadManager {
  constructor(uploadEndpoint, options = {}) {
    this.uploadEndpoint = uploadEndpoint;
    this.maxConcurrent = options.maxConcurrent || 3;
    this.chunkSize = options.chunkSize || 1024 * 1024; // 1MB
    this.uploads = new Map();
    this.queue = [];
    this.activeUploads = 0;
  }
  
  // 添加文件到上传队列
  addFile(file) {
    const uploadId = this.generateId();
    const upload = {
      id: uploadId,
      file,
      progress: 0,
      status: 'queued',
      error: null,
      cancelController: null
    };
    
    this.uploads.set(uploadId, upload);
    this.queue.push(uploadId);
    this.processQueue();
    
    return uploadId;
  }
  
  // 处理上传队列
  async processQueue() {
    while (this.queue.length > 0 && this.activeUploads < this.maxConcurrent) {
      const uploadId = this.queue.shift();
      this.uploadFile(uploadId);
    }
  }
  
  // 上传单个文件
  async uploadFile(uploadId) {
    const upload = this.uploads.get(uploadId);
    if (!upload) return;
    
    this.activeUploads++;
    upload.status = 'uploading';
    upload.cancelController = new AbortController();
    
    try {
      // 对于大文件，使用分片上传
      if (upload.file.size > this.chunkSize * 5) {
        await this.uploadChunked(upload);
      } else {
        await this.uploadSimple(upload);
      }
      
      upload.status = 'completed';
      upload.progress = 100;
      
    } catch (error) {
      if (error.name === 'AbortError') {
        upload.status = 'canceled';
      } else {
        upload.status = 'failed';
        upload.error = error.message;
      }
    } finally {
      this.activeUploads--;
      this.processQueue();
      this.notifyProgress(upload);
    }
  }
  
  // 简单上传
  async uploadSimple(upload) {
    const formData = new FormData();
    formData.append('file', upload.file);
    
    const xhr = new XMLHttpRequest();
    
    // 监听进度
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        upload.progress = (e.loaded / e.total) * 100;
        this.notifyProgress(upload);
      }
    });
    
    // Promise包装
    return new Promise((resolve, reject) => {
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.responseText));
        } else {
          reject(new Error(`上传失败: ${xhr.status}`));
        }
      });
      
      xhr.addEventListener('error', () => {
        reject(new Error('网络错误'));
      });
      
      xhr.addEventListener('abort', () => {
        reject(new DOMException('Aborted', 'AbortError'));
      });
      
      // 绑定取消信号
      upload.cancelController.signal.addEventListener('abort', () => {
        xhr.abort();
      });
      
      xhr.open('POST', this.uploadEndpoint);
      xhr.send(formData);
    });
  }
  
  // 分片上传
  async uploadChunked(upload) {
    const chunks = Math.ceil(upload.file.size / this.chunkSize);
    
    // 初始化上传会话
    const session = await this.initChunkedUpload(upload.file);
    
    // 上传每个分片
    for (let i = 0; i < chunks; i++) {
      if (upload.cancelController.signal.aborted) {
        throw new DOMException('Aborted', 'AbortError');
      }
      
      const start = i * this.chunkSize;
      const end = Math.min(start + this.chunkSize, upload.file.size);
      const chunk = upload.file.slice(start, end);
      
      await this.uploadChunk(session.id, chunk, i);
      
      upload.progress = ((i + 1) / chunks) * 100;
      this.notifyProgress(upload);
    }
    
    // 完成上传
    await this.completeChunkedUpload(session.id);
  }
  
  // 初始化分片上传
  async initChunkedUpload(file) {
    const response = await fetch(`${this.uploadEndpoint}/chunked/init`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filename: file.name,
        size: file.size,
        type: file.type
      })
    });
    
    return response.json();
  }
  
  // 上传单个分片
  async uploadChunk(sessionId, chunk, index) {
    const formData = new FormData();
    formData.append('chunk', chunk);
    formData.append('index', index);
    formData.append('sessionId', sessionId);
    
    const response = await fetch(`${this.uploadEndpoint}/chunked/upload`, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error('分片上传失败');
    }
  }
  
  // 完成分片上传
  async completeChunkedUpload(sessionId) {
    const response = await fetch(`${this.uploadEndpoint}/chunked/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId })
    });
    
    return response.json();
  }
  
  // 取消上传
  cancelUpload(uploadId) {
    const upload = this.uploads.get(uploadId);
    if (upload && upload.cancelController) {
      upload.cancelController.abort();
    }
  }
  
  // 重试上传
  retryUpload(uploadId) {
    const upload = this.uploads.get(uploadId);
    if (upload && (upload.status === 'failed' || upload.status === 'canceled')) {
      upload.status = 'queued';
      upload.progress = 0;
      upload.error = null;
      this.queue.push(uploadId);
      this.processQueue();
    }
  }
  
  // 获取上传状态
  getUploadStatus(uploadId) {
    return this.uploads.get(uploadId);
  }
  
  // 进度通知
  notifyProgress(upload) {
    // 可以在这里触发自定义事件或调用回调
    window.dispatchEvent(new CustomEvent('uploadProgress', {
      detail: {
        id: upload.id,
        file: upload.file,
        progress: upload.progress,
        status: upload.status,
        error: upload.error
      }
    }));
  }
  
  // 生成唯一ID
  generateId() {
    return `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// 使用示例
const uploadManager = new UploadManager('/api/upload');

// 监听上传进度
window.addEventListener('uploadProgress', (e) => {
  const { id, file, progress, status } = e.detail;
  console.log(`文件 ${file.name} 上传进度: ${progress.toFixed(2)}% (${status})`);
  
  // 更新UI
  const progressBar = document.querySelector(`#upload-${id} .progress-bar`);
  if (progressBar) {
    progressBar.style.width = `${progress}%`;
  }
});

// 处理文件选择
document.getElementById('fileInput').addEventListener('change', (e) => {
  const files = Array.from(e.target.files);
  
  files.forEach(file => {
    const uploadId = uploadManager.addFile(file);
    
    // 创建UI元素
    const uploadElement = document.createElement('div');
    uploadElement.id = `upload-${uploadId}`;
    uploadElement.innerHTML = `
      <div class="upload-item">
        <span class="filename">${file.name}</span>
        <div class="progress">
          <div class="progress-bar" style="width: 0%"></div>
        </div>
        <button onclick="uploadManager.cancelUpload('${uploadId}')">取消</button>
      </div>
    `;
    
    document.getElementById('uploadList').appendChild(uploadElement);
  });
});
```