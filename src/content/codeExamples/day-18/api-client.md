---
title: "高级API客户端实现"
description: "学习和掌握高级API客户端实现的实际应用"
category: "advanced"
language: "javascript"
---

# 高级API客户端实现

## 完整的API客户端类

```javascript
class APIClient {
  constructor(config = {}) {
    this.baseURL = config.baseURL || '';
    this.timeout = config.timeout || 30000;
    this.headers = config.headers || {};
    this.interceptors = {
      request: [],
      response: []
    };
    
    // 请求队列管理
    this.requestQueue = new Map();
    
    // 缓存管理
    this.cache = new Map();
    this.cacheTime = config.cacheTime || 5 * 60 * 1000; // 5分钟
  }
  
  // 添加请求拦截器
  addRequestInterceptor(interceptor) {
    this.interceptors.request.push(interceptor);
    return this;
  }
  
  // 添加响应拦截器
  addResponseInterceptor(interceptor) {
    this.interceptors.response.push(interceptor);
    return this;
  }
  
  // 创建带超时的fetch
  fetchWithTimeout(url, options = {}) {
    const controller = new AbortController();
    const timeout = options.timeout || this.timeout;
    
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, timeout);
    
    return fetch(url, {
      ...options,
      signal: controller.signal
    }).finally(() => {
      clearTimeout(timeoutId);
    });
  }
  
  // 生成缓存键
  getCacheKey(url, options = {}) {
    return `${options.method || 'GET'}:${url}:${JSON.stringify(options.params || {})}`;
  }
  
  // 核心请求方法
  async request(endpoint, options = {}) {
    const url = this.baseURL + endpoint;
    
    // 合并默认配置
    let config = {
      ...options,
      headers: {
        ...this.headers,
        ...options.headers
      }
    };
    
    // 应用请求拦截器
    for (const interceptor of this.interceptors.request) {
      config = await interceptor(config);
    }
    
    // 处理查询参数
    let finalUrl = url;
    if (config.params) {
      const params = new URLSearchParams(config.params);
      finalUrl += `?${params.toString()}`;
      delete config.params;
    }
    
    // 检查缓存（仅GET请求）
    const cacheKey = this.getCacheKey(finalUrl, config);
    if (config.method === 'GET' || !config.method) {
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.cacheTime) {
        return cached.data;
      }
    }
    
    try {
      // 发送请求
      let response = await this.fetchWithTimeout(finalUrl, config);
      
      // 应用响应拦截器
      for (const interceptor of this.interceptors.response) {
        response = await interceptor(response);
      }
      
      // 检查响应状态
      if (!response.ok) {
        const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
        error.response = response;
        throw error;
      }
      
      // 解析响应
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else if (contentType && contentType.includes('text/')) {
        data = await response.text();
      } else {
        data = await response.blob();
      }
      
      // 缓存GET请求的响应
      if (config.method === 'GET' || !config.method) {
        this.cache.set(cacheKey, {
          data,
          timestamp: Date.now()
        });
      }
      
      return data;
      
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('请求超时');
      }
      throw error;
    }
  }
  
  // 便捷方法
  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }
  
  post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
  }
  
  put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
  }
  
  patch(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
  }
  
  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
  
  // 上传文件
  upload(endpoint, file, options = {}) {
    const formData = new FormData();
    formData.append('file', file);
    
    // 添加其他字段
    if (options.data) {
      Object.keys(options.data).forEach(key => {
        formData.append(key, options.data[key]);
      });
    }
    
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: formData
      // 不设置Content-Type，让浏览器自动设置
    });
  }
  
  // 清除缓存
  clearCache() {
    this.cache.clear();
  }
  
  // 取消所有请求
  cancelAll() {
    this.requestQueue.forEach(controller => {
      controller.abort();
    });
    this.requestQueue.clear();
  }
}

// 使用示例
const api = new APIClient({
  baseURL: 'https://api.example.com',
  timeout: 10000,
  headers: {
    'X-API-Version': '1.0'
  }
});

// 添加认证拦截器
api.addRequestInterceptor(async (config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 添加错误处理拦截器
api.addResponseInterceptor(async (response) => {
  if (response.status === 401) {
    // 处理认证失败
    localStorage.removeItem('authToken');
    window.location.href = '/login';
  }
  return response;
});

// 使用API客户端
async function fetchUserData() {
  try {
    // GET请求
    const users = await api.get('/users', {
      params: { page: 1, limit: 10 }
    });
    
    // POST请求
    const newUser = await api.post('/users', {
      name: 'John Doe',
      email: 'john@example.com'
    });
    
    // 上传文件
    const fileInput = document.getElementById('file');
    const uploadResult = await api.upload('/upload', fileInput.files[0], {
      data: { description: '用户头像' }
    });
    
    console.log({ users, newUser, uploadResult });
  } catch (error) {
    console.error('API调用失败:', error);
  }
}
```

## 请求重试和断点续传

```javascript
class RetryableAPIClient extends APIClient {
  constructor(config = {}) {
    super(config);
    this.maxRetries = config.maxRetries || 3;
    this.retryDelay = config.retryDelay || 1000;
  }
  
  // 带重试的请求
  async requestWithRetry(endpoint, options = {}, retries = this.maxRetries) {
    try {
      return await this.request(endpoint, options);
    } catch (error) {
      if (retries > 0 && this.shouldRetry(error)) {
        console.log(`请求失败，${this.retryDelay}ms后重试... (剩余${retries}次)`);
        await this.delay(this.retryDelay);
        return this.requestWithRetry(endpoint, options, retries - 1);
      }
      throw error;
    }
  }
  
  // 判断是否应该重试
  shouldRetry(error) {
    // 网络错误或5xx错误可以重试
    return error.name === 'TypeError' || 
           (error.response && error.response.status >= 500);
  }
  
  // 延迟函数
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  // 断点续传上传
  async uploadResumable(endpoint, file, options = {}) {
    const chunkSize = options.chunkSize || 1024 * 1024; // 1MB
    const totalChunks = Math.ceil(file.size / chunkSize);
    
    // 获取上传会话
    const session = await this.post(`${endpoint}/session`, {
      filename: file.name,
      filesize: file.size,
      totalChunks
    });
    
    // 上传进度回调
    const onProgress = options.onProgress || (() => {});
    
    // 逐块上传
    for (let i = 0; i < totalChunks; i++) {
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, file.size);
      const chunk = file.slice(start, end);
      
      const formData = new FormData();
      formData.append('chunk', chunk);
      formData.append('chunkNumber', i);
      formData.append('sessionId', session.id);
      
      try {
        await this.requestWithRetry(`${endpoint}/chunk`, {
          method: 'POST',
          body: formData
        });
        
        onProgress({
          loaded: end,
          total: file.size,
          percentage: (end / file.size) * 100
        });
      } catch (error) {
        console.error(`上传第${i + 1}块失败:`, error);
        throw error;
      }
    }
    
    // 完成上传
    return this.post(`${endpoint}/complete`, {
      sessionId: session.id
    });
  }
}
```

## 并发请求控制

```javascript
class ConcurrentAPIClient extends APIClient {
  constructor(config = {}) {
    super(config);
    this.maxConcurrent = config.maxConcurrent || 5;
    this.queue = [];
    this.running = 0;
  }
  
  // 添加请求到队列
  async enqueue(fn) {
    return new Promise((resolve, reject) => {
      this.queue.push({ fn, resolve, reject });
      this.processQueue();
    });
  }
  
  // 处理队列
  async processQueue() {
    if (this.running >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }
    
    this.running++;
    const { fn, resolve, reject } = this.queue.shift();
    
    try {
      const result = await fn();
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      this.running--;
      this.processQueue();
    }
  }
  
  // 批量请求
  async batchRequest(requests) {
    const promises = requests.map(({ endpoint, options }) => 
      this.enqueue(() => this.request(endpoint, options))
    );
    
    return Promise.all(promises);
  }
  
  // 限流请求
  async requestThrottled(endpoint, options = {}) {
    return this.enqueue(() => this.request(endpoint, options));
  }
}

// 使用示例
const concurrentAPI = new ConcurrentAPIClient({
  baseURL: 'https://api.example.com',
  maxConcurrent: 3
});

// 批量获取用户数据
async function fetchMultipleUsers(userIds) {
  const requests = userIds.map(id => ({
    endpoint: `/users/${id}`,
    options: { method: 'GET' }
  }));
  
  const users = await concurrentAPI.batchRequest(requests);
  return users;
}

// 并发但受限的请求
async function fetchManyResources() {
  const promises = [];
  
  for (let i = 1; i <= 100; i++) {
    promises.push(
      concurrentAPI.requestThrottled(`/resources/${i}`)
    );
  }
  
  const results = await Promise.all(promises);
  console.log('所有资源获取完成:', results.length);
}
```