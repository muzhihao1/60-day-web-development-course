---
day: 18
phase: "phase-2"
title: "网络请求与Fetch API"
description: "掌握现代JavaScript中的网络请求处理，深入理解Fetch API及其高级用法"
objectives:
  - "理解HTTP请求的基本概念和方法"
  - "掌握Fetch API的使用方法"
  - "学习处理不同类型的响应数据"
  - "实现错误处理和请求拦截"
  - "掌握并发请求和请求取消"
prerequisites:
  - "JavaScript Promise和异步编程"
  - "基本的HTTP知识"
  - "JSON数据格式"
estimatedTime: 180
resources:
  - title: "MDN Fetch API指南"
    url: "https://developer.mozilla.org/zh-CN/docs/Web/API/Fetch_API"
    type: "article"
    description: "官方Fetch API完整文档"
  - title: "使用Fetch"
    url: "https://developer.mozilla.org/zh-CN/docs/Web/API/Fetch_API/Using_Fetch"
    type: "article"
    description: "Fetch API使用指南"
  - title: "REST API设计最佳实践"
    url: "https://www.freecodecamp.org/news/rest-api-design-best-practices/"
    type: "article"
    description: "了解RESTful API设计原则"
---

# 网络请求与Fetch API 🌐

在现代Web开发中，与服务器进行数据交互是必不可少的。今天我们将深入学习Fetch API，这是处理网络请求的现代标准。

## 学习目标 🎯

通过本课程，你将能够：
- 使用Fetch API发送各种类型的HTTP请求
- 处理不同格式的响应数据
- 实现完善的错误处理机制
- 优化网络请求性能
- 构建可复用的请求工具

## 1. Fetch API基础 📡

### 什么是Fetch API？

Fetch API提供了一个更强大、更灵活的方式来发起网络请求，它基于Promise设计，替代了传统的XMLHttpRequest。

### 基本语法

```javascript
// 最简单的GET请求
fetch('https://api.example.com/data')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));

// 使用async/await
async function getData() {
  try {
    const response = await fetch('https://api.example.com/data');
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error('Error:', error);
  }
}
```

### HTTP方法

```javascript
// GET请求（默认）
fetch('/api/users');

// POST请求
fetch('/api/users', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com'
  })
});

// PUT请求
fetch('/api/users/123', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'John Updated'
  })
});

// DELETE请求
fetch('/api/users/123', {
  method: 'DELETE'
});
```

## 2. 请求配置详解 ⚙️

### 请求选项

```javascript
const options = {
  method: 'POST',                    // HTTP方法
  headers: {                         // 请求头
    'Content-Type': 'application/json',
    'Authorization': 'Bearer token123',
    'X-Custom-Header': 'value'
  },
  body: JSON.stringify(data),        // 请求体
  mode: 'cors',                      // 请求模式: cors, no-cors, same-origin
  credentials: 'include',            // 发送cookies: omit, same-origin, include
  cache: 'no-cache',                 // 缓存模式
  redirect: 'follow',                // 重定向处理: follow, error, manual
  referrer: 'no-referrer',          // referrer信息
  signal: abortController.signal     // 用于取消请求
};

fetch(url, options);
```

### 不同类型的请求体

```javascript
// JSON数据
fetch('/api/data', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ key: 'value' })
});

// FormData（表单数据）
const formData = new FormData();
formData.append('username', 'john');
formData.append('avatar', fileInput.files[0]);

fetch('/api/upload', {
  method: 'POST',
  body: formData  // 不需要设置Content-Type
});

// URLSearchParams（URL编码）
const params = new URLSearchParams();
params.append('name', 'John');
params.append('age', '30');

fetch('/api/form', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: params
});

// 原始文本
fetch('/api/text', {
  method: 'POST',
  headers: { 'Content-Type': 'text/plain' },
  body: 'Hello, World!'
});
```

## 3. 响应处理 📥

### Response对象

```javascript
fetch('/api/data')
  .then(response => {
    // Response属性
    console.log(response.status);       // 状态码 (200, 404, etc.)
    console.log(response.statusText);   // 状态文本
    console.log(response.ok);           // 是否成功 (status 200-299)
    console.log(response.headers);      // 响应头
    console.log(response.url);          // 最终URL（重定向后）
    
    return response.json();
  });
```

### 处理不同类型的响应

```javascript
// JSON响应
async function getJSON(url) {
  const response = await fetch(url);
  return response.json();
}

// 文本响应
async function getText(url) {
  const response = await fetch(url);
  return response.text();
}

// Blob响应（二进制数据）
async function getImage(url) {
  const response = await fetch(url);
  const blob = await response.blob();
  const imageUrl = URL.createObjectURL(blob);
  return imageUrl;
}

// ArrayBuffer响应
async function getBinary(url) {
  const response = await fetch(url);
  return response.arrayBuffer();
}

// FormData响应
async function getFormData(url) {
  const response = await fetch(url);
  return response.formData();
}
```

## 4. 错误处理 🚨

### 完善的错误处理

```javascript
class HTTPError extends Error {
  constructor(response) {
    super(`HTTP Error ${response.status}: ${response.statusText}`);
    this.response = response;
  }
}

async function fetchWithErrorHandling(url, options = {}) {
  try {
    const response = await fetch(url, options);
    
    // Fetch不会因为HTTP错误状态而拒绝Promise
    if (!response.ok) {
      throw new HTTPError(response);
    }
    
    // 检查响应是否有内容
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    } else {
      return await response.text();
    }
  } catch (error) {
    if (error instanceof TypeError) {
      // 网络错误或CORS问题
      console.error('Network error:', error.message);
      throw new Error('网络连接失败，请检查您的网络连接');
    } else if (error instanceof HTTPError) {
      // HTTP错误
      console.error('HTTP error:', error.message);
      
      // 尝试获取错误详情
      try {
        const errorData = await error.response.json();
        throw new Error(errorData.message || error.message);
      } catch {
        throw error;
      }
    } else {
      // 其他错误
      console.error('Unexpected error:', error);
      throw error;
    }
  }
}
```

### 重试机制

```javascript
async function fetchWithRetry(url, options = {}, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (!response.ok && i < retries - 1) {
        // 如果不是最后一次尝试，且响应不成功，继续重试
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
        continue;
      }
      return response;
    } catch (error) {
      if (i === retries - 1) throw error;
      // 指数退避
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
  }
}
```

## 5. 高级用法 🚀

### 请求拦截器

```javascript
class FetchInterceptor {
  constructor() {
    this.interceptors = {
      request: [],
      response: []
    };
  }
  
  addRequestInterceptor(interceptor) {
    this.interceptors.request.push(interceptor);
  }
  
  addResponseInterceptor(interceptor) {
    this.interceptors.response.push(interceptor);
  }
  
  async fetch(url, options = {}) {
    // 请求拦截
    let modifiedOptions = options;
    for (const interceptor of this.interceptors.request) {
      modifiedOptions = await interceptor(url, modifiedOptions);
    }
    
    // 发送请求
    let response = await fetch(url, modifiedOptions);
    
    // 响应拦截
    for (const interceptor of this.interceptors.response) {
      response = await interceptor(response);
    }
    
    return response;
  }
}

// 使用示例
const api = new FetchInterceptor();

// 添加认证拦截器
api.addRequestInterceptor(async (url, options) => {
  const token = localStorage.getItem('token');
  if (token) {
    options.headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`
    };
  }
  return options;
});

// 添加日志拦截器
api.addResponseInterceptor(async (response) => {
  console.log(`${response.url}: ${response.status}`);
  return response;
});
```

### 取消请求

```javascript
// 使用AbortController
const controller = new AbortController();
const signal = controller.signal;

// 设置超时取消
setTimeout(() => controller.abort(), 5000);

fetch('/api/data', { signal })
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => {
    if (error.name === 'AbortError') {
      console.log('请求被取消');
    } else {
      console.error('其他错误:', error);
    }
  });

// 创建可取消的fetch函数
function createCancelableFetch(url, options = {}) {
  const controller = new AbortController();
  
  const promise = fetch(url, {
    ...options,
    signal: controller.signal
  });
  
  return {
    promise,
    cancel: () => controller.abort()
  };
}
```

### 并发请求处理

```javascript
// 并发多个请求
async function fetchMultiple(urls) {
  const promises = urls.map(url => fetch(url).then(r => r.json()));
  return Promise.all(promises);
}

// 限制并发数量
async function fetchWithConcurrencyLimit(urls, limit = 3) {
  const results = [];
  const executing = [];
  
  for (const url of urls) {
    const promise = fetch(url).then(r => r.json());
    results.push(promise);
    
    if (urls.length >= limit) {
      executing.push(promise);
      
      if (executing.length >= limit) {
        await Promise.race(executing);
        executing.splice(executing.findIndex(p => p === promise), 1);
      }
    }
  }
  
  return Promise.all(results);
}

// 顺序请求
async function fetchSequentially(urls) {
  const results = [];
  for (const url of urls) {
    const response = await fetch(url);
    const data = await response.json();
    results.push(data);
  }
  return results;
}
```

## 6. 实用工具函数 🛠️

### API客户端封装

```javascript
class APIClient {
  constructor(baseURL, defaultOptions = {}) {
    this.baseURL = baseURL;
    this.defaultOptions = defaultOptions;
  }
  
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      ...this.defaultOptions,
      ...options,
      headers: {
        ...this.defaultOptions.headers,
        ...options.headers
      }
    };
    
    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    return response.json();
  }
  
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
  
  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
}

// 使用示例
const api = new APIClient('https://api.example.com', {
  headers: {
    'X-API-Key': 'your-api-key'
  }
});

// 使用API客户端
api.get('/users')
  .then(users => console.log(users));

api.post('/users', { name: 'John', email: 'john@example.com' })
  .then(user => console.log('Created:', user));
```

## 7. 实际应用案例 💼

### 搜索功能（带防抖）

```javascript
function debounce(func, delay) {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

class SearchComponent {
  constructor() {
    this.searchInput = document.getElementById('search');
    this.resultsContainer = document.getElementById('results');
    this.currentRequest = null;
    
    // 使用防抖包装搜索函数
    this.debouncedSearch = debounce(this.search.bind(this), 300);
    
    this.init();
  }
  
  init() {
    this.searchInput.addEventListener('input', (e) => {
      this.debouncedSearch(e.target.value);
    });
  }
  
  async search(query) {
    if (!query.trim()) {
      this.resultsContainer.innerHTML = '';
      return;
    }
    
    // 取消之前的请求
    if (this.currentRequest) {
      this.currentRequest.cancel();
    }
    
    try {
      this.showLoading();
      
      const { promise, cancel } = createCancelableFetch(
        `/api/search?q=${encodeURIComponent(query)}`
      );
      
      this.currentRequest = { promise, cancel };
      
      const response = await promise;
      const results = await response.json();
      
      this.displayResults(results);
    } catch (error) {
      if (error.name !== 'AbortError') {
        this.showError('搜索失败，请重试');
      }
    } finally {
      this.currentRequest = null;
    }
  }
  
  showLoading() {
    this.resultsContainer.innerHTML = '<div class="loading">搜索中...</div>';
  }
  
  showError(message) {
    this.resultsContainer.innerHTML = `<div class="error">${message}</div>`;
  }
  
  displayResults(results) {
    if (results.length === 0) {
      this.resultsContainer.innerHTML = '<div class="empty">没有找到结果</div>';
      return;
    }
    
    this.resultsContainer.innerHTML = results
      .map(item => `
        <div class="result-item">
          <h3>${item.title}</h3>
          <p>${item.description}</p>
        </div>
      `)
      .join('');
  }
}
```

### 文件上传（带进度）

```javascript
class FileUploader {
  constructor(uploadUrl) {
    this.uploadUrl = uploadUrl;
  }
  
  async upload(file, onProgress) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      formData.append('file', file);
      
      // 监听上传进度
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          onProgress(percentComplete);
        }
      });
      
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.responseText));
        } else {
          reject(new Error(`Upload failed: ${xhr.status}`));
        }
      });
      
      xhr.addEventListener('error', () => {
        reject(new Error('Network error'));
      });
      
      xhr.open('POST', this.uploadUrl);
      xhr.send(formData);
    });
  }
  
  // 使用Fetch API的替代方案（不支持进度）
  async uploadWithFetch(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(this.uploadUrl, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status}`);
    }
    
    return response.json();
  }
}
```

## 今日练习 🏋️‍♂️

1. 创建一个通用的API客户端类
2. 实现请求缓存机制
3. 构建一个实时数据同步系统
4. 开发一个带进度显示的文件上传组件

## 最佳实践建议 💡

1. **错误处理**：始终处理网络错误和HTTP错误
2. **超时设置**：为请求设置合理的超时时间
3. **取消机制**：提供取消请求的能力
4. **缓存策略**：合理使用缓存减少不必要的请求
5. **安全考虑**：注意CORS、CSRF等安全问题

## 总结 📝

Fetch API是现代Web开发中处理网络请求的标准方式。通过今天的学习，你已经掌握了：

- 使用Fetch API发送各种类型的请求
- 处理不同格式的响应数据
- 实现完善的错误处理
- 高级功能如请求拦截、取消和并发控制
- 构建可复用的网络请求工具

明天我们将学习现代JavaScript模块系统，了解如何组织和管理大型应用的代码结构！