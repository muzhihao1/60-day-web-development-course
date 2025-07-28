---
title: "缓存策略实现"
description: "Service Worker缓存策略和HTTP缓存的最佳实践"
category: "performance"
language: "javascript"
---

## Service Worker缓存策略

### 缓存优先策略 (Cache First)

```javascript
// 适用于不经常变化的资源（CSS、JS、字体等）
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // 缓存中没有，从网络获取
        return fetch(event.request).then(response => {
          // 检查是否是有效响应
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // 克隆响应
          const responseToCache = response.clone();
          
          caches.open('static-cache-v1').then(cache => {
            cache.put(event.request, responseToCache);
          });
          
          return response;
        });
      })
  );
});
```

### 网络优先策略 (Network First)

```javascript
// 适用于经常更新的内容（API请求、HTML页面等）
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // 网络请求成功，更新缓存
        const responseToCache = response.clone();
        
        caches.open('dynamic-cache-v1').then(cache => {
          cache.put(event.request, responseToCache);
        });
        
        return response;
      })
      .catch(() => {
        // 网络请求失败，尝试从缓存获取
        return caches.match(event.request);
      })
  );
});
```

### 网络优先带超时策略

```javascript
// 网络请求超时后使用缓存
function networkFirstWithTimeout(request, timeout = 3000) {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      // 超时后尝试缓存
      caches.match(request).then(response => {
        if (response) {
          resolve(response);
        } else {
          reject(new Error('No cached response'));
        }
      });
    }, timeout);
    
    fetch(request).then(response => {
      clearTimeout(timeoutId);
      
      // 更新缓存
      const responseToCache = response.clone();
      caches.open('network-first-cache').then(cache => {
        cache.put(request, responseToCache);
      });
      
      resolve(response);
    }).catch(error => {
      clearTimeout(timeoutId);
      
      // 网络失败，尝试缓存
      caches.match(request).then(response => {
        if (response) {
          resolve(response);
        } else {
          reject(error);
        }
      });
    });
  });
}

self.addEventListener('fetch', event => {
  if (event.request.mode === 'navigate') {
    event.respondWith(networkFirstWithTimeout(event.request));
  }
});
```

### 缓存带更新策略 (Stale While Revalidate)

```javascript
// 返回缓存内容，同时更新缓存
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      const fetchPromise = fetch(event.request).then(networkResponse => {
        // 更新缓存
        caches.open('swr-cache').then(cache => {
          cache.put(event.request, networkResponse.clone());
        });
        return networkResponse;
      });
      
      // 立即返回缓存（如果有）或等待网络响应
      return cachedResponse || fetchPromise;
    })
  );
});
```

### 高级缓存管理器

```javascript
class CacheManager {
  constructor() {
    this.cacheNames = {
      static: 'static-v1',
      dynamic: 'dynamic-v1',
      images: 'images-v1',
      api: 'api-cache-v1'
    };
    
    this.cacheStrategies = new Map([
      ['static', this.cacheFirst.bind(this)],
      ['dynamic', this.networkFirst.bind(this)],
      ['images', this.cacheFirst.bind(this)],
      ['api', this.staleWhileRevalidate.bind(this)]
    ]);
    
    this.maxAge = {
      static: 30 * 24 * 60 * 60 * 1000, // 30天
      dynamic: 24 * 60 * 60 * 1000,     // 1天
      images: 7 * 24 * 60 * 60 * 1000,  // 7天
      api: 5 * 60 * 1000                 // 5分钟
    };
  }
  
  async handleFetch(request) {
    const url = new URL(request.url);
    const cacheType = this.getCacheType(url.pathname);
    const strategy = this.cacheStrategies.get(cacheType);
    
    return strategy ? strategy(request, cacheType) : fetch(request);
  }
  
  getCacheType(pathname) {
    if (/\.(js|css)$/.test(pathname)) return 'static';
    if (/\.(png|jpg|jpeg|gif|webp|svg)$/.test(pathname)) return 'images';
    if (pathname.startsWith('/api/')) return 'api';
    return 'dynamic';
  }
  
  async cacheFirst(request, cacheType) {
    const cache = await caches.open(this.cacheNames[cacheType]);
    const cached = await cache.match(request);
    
    if (cached) {
      const age = this.getCacheAge(cached);
      if (age < this.maxAge[cacheType]) {
        return cached;
      }
    }
    
    const response = await fetch(request);
    if (response.status === 200) {
      cache.put(request, response.clone());
    }
    
    return response;
  }
  
  async networkFirst(request, cacheType) {
    try {
      const response = await fetch(request);
      if (response.status === 200) {
        const cache = await caches.open(this.cacheNames[cacheType]);
        cache.put(request, response.clone());
      }
      return response;
    } catch (error) {
      const cached = await caches.match(request);
      if (cached) return cached;
      throw error;
    }
  }
  
  async staleWhileRevalidate(request, cacheType) {
    const cache = await caches.open(this.cacheNames[cacheType]);
    const cached = await cache.match(request);
    
    const fetchPromise = fetch(request).then(response => {
      if (response.status === 200) {
        cache.put(request, response.clone());
      }
      return response;
    });
    
    return cached || fetchPromise;
  }
  
  getCacheAge(response) {
    const cachedDate = new Date(response.headers.get('date'));
    return Date.now() - cachedDate.getTime();
  }
  
  async cleanup() {
    // 清理过期缓存
    for (const [type, cacheName] of Object.entries(this.cacheNames)) {
      const cache = await caches.open(cacheName);
      const requests = await cache.keys();
      
      for (const request of requests) {
        const response = await cache.match(request);
        const age = this.getCacheAge(response);
        
        if (age > this.maxAge[type]) {
          await cache.delete(request);
        }
      }
    }
  }
}

// 使用缓存管理器
const cacheManager = new CacheManager();

self.addEventListener('fetch', event => {
  event.respondWith(cacheManager.handleFetch(event.request));
});

// 定期清理
self.addEventListener('message', event => {
  if (event.data === 'cleanup') {
    cacheManager.cleanup();
  }
});
```

## 缓存版本控制

```javascript
class CacheVersionManager {
  constructor() {
    this.version = 'v1';
    this.caches = {
      assets: `assets-${this.version}`,
      data: `data-${this.version}`,
      pages: `pages-${this.version}`
    };
  }
  
  async install() {
    const cache = await caches.open(this.caches.assets);
    return cache.addAll([
      '/',
      '/css/main.css',
      '/js/app.js',
      '/manifest.json'
    ]);
  }
  
  async activate() {
    // 获取所有缓存名称
    const cacheNames = await caches.keys();
    
    // 删除旧版本缓存
    const deletePromises = cacheNames
      .filter(name => {
        // 保留当前版本的缓存
        return !Object.values(this.caches).includes(name);
      })
      .map(name => caches.delete(name));
    
    await Promise.all(deletePromises);
  }
  
  async update() {
    // 检查更新
    const response = await fetch('/version.json');
    const { version } = await response.json();
    
    if (version !== this.version) {
      // 通知客户端有更新
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'update-available',
            version
          });
        });
      });
    }
  }
}

const versionManager = new CacheVersionManager();

self.addEventListener('install', event => {
  event.waitUntil(versionManager.install());
});

self.addEventListener('activate', event => {
  event.waitUntil(versionManager.activate());
});
```

## HTTP缓存配置

### Express服务器缓存配置

```javascript
const express = require('express');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');

const app = express();

// 生成ETag
function generateETag(content) {
  return crypto.createHash('md5').update(content).digest('hex');
}

// 静态资源缓存中间件
function cacheMiddleware(options = {}) {
  return (req, res, next) => {
    const filePath = path.join(options.root || 'public', req.path);
    
    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
      return next();
    }
    
    const stats = fs.statSync(filePath);
    const content = fs.readFileSync(filePath);
    const etag = generateETag(content);
    const lastModified = stats.mtime.toUTCString();
    
    // 设置缓存头
    res.set({
      'ETag': etag,
      'Last-Modified': lastModified
    });
    
    // 根据文件类型设置缓存策略
    const ext = path.extname(filePath);
    switch (ext) {
      case '.html':
        res.set('Cache-Control', 'no-cache, must-revalidate');
        break;
      case '.css':
      case '.js':
        res.set('Cache-Control', 'public, max-age=31536000, immutable');
        break;
      case '.jpg':
      case '.jpeg':
      case '.png':
      case '.gif':
      case '.webp':
        res.set('Cache-Control', 'public, max-age=86400');
        break;
      default:
        res.set('Cache-Control', 'public, max-age=3600');
    }
    
    // 检查条件请求
    const ifNoneMatch = req.headers['if-none-match'];
    const ifModifiedSince = req.headers['if-modified-since'];
    
    if (ifNoneMatch === etag || ifModifiedSince === lastModified) {
      return res.status(304).end();
    }
    
    // 发送文件
    res.sendFile(filePath);
  };
}

// 使用缓存中间件
app.use(cacheMiddleware({ root: 'public' }));

// API缓存
app.get('/api/data', (req, res) => {
  const data = { timestamp: Date.now() };
  const etag = generateETag(JSON.stringify(data));
  
  res.set({
    'Content-Type': 'application/json',
    'Cache-Control': 'private, max-age=300',
    'ETag': etag
  });
  
  if (req.headers['if-none-match'] === etag) {
    return res.status(304).end();
  }
  
  res.json(data);
});

// 动态内容缓存
const cache = new Map();

app.get('/api/expensive-operation', async (req, res) => {
  const key = req.originalUrl;
  const cached = cache.get(key);
  
  // 检查缓存
  if (cached && Date.now() - cached.timestamp < 60000) {
    res.set('X-Cache', 'HIT');
    return res.json(cached.data);
  }
  
  // 执行昂贵操作
  const result = await performExpensiveOperation();
  
  // 更新缓存
  cache.set(key, {
    data: result,
    timestamp: Date.now()
  });
  
  res.set('X-Cache', 'MISS');
  res.json(result);
});
```

## 浏览器缓存API

### Cache Storage API

```javascript
class BrowserCacheManager {
  constructor() {
    this.cacheName = 'app-cache-v1';
  }
  
  async cacheResources(urls) {
    const cache = await caches.open(this.cacheName);
    
    // 批量缓存资源
    const promises = urls.map(async url => {
      try {
        const response = await fetch(url);
        if (response.ok) {
          await cache.put(url, response);
          return { url, status: 'cached' };
        }
        return { url, status: 'failed', error: response.status };
      } catch (error) {
        return { url, status: 'error', error: error.message };
      }
    });
    
    return Promise.all(promises);
  }
  
  async getCached(url) {
    const cache = await caches.open(this.cacheName);
    const response = await cache.match(url);
    
    if (response) {
      // 检查缓存年龄
      const cachedDate = new Date(response.headers.get('date'));
      const age = Date.now() - cachedDate.getTime();
      
      // 如果缓存太旧，删除它
      if (age > 24 * 60 * 60 * 1000) { // 24小时
        await cache.delete(url);
        return null;
      }
      
      return response;
    }
    
    return null;
  }
  
  async updateCache(url) {
    const cache = await caches.open(this.cacheName);
    
    try {
      const response = await fetch(url);
      if (response.ok) {
        await cache.put(url, response.clone());
        return response;
      }
    } catch (error) {
      // 网络失败，返回缓存
      return this.getCached(url);
    }
  }
  
  async clearCache() {
    await caches.delete(this.cacheName);
  }
  
  async getCacheSize() {
    const cache = await caches.open(this.cacheName);
    const requests = await cache.keys();
    let totalSize = 0;
    
    for (const request of requests) {
      const response = await cache.match(request);
      const blob = await response.blob();
      totalSize += blob.size;
    }
    
    return totalSize;
  }
}

// 使用浏览器缓存管理器
const browserCache = new BrowserCacheManager();

// 预缓存关键资源
browserCache.cacheResources([
  '/api/config',
  '/api/user',
  '/data/products.json'
]).then(results => {
  console.log('缓存结果:', results);
});
```

## IndexedDB缓存

```javascript
class IndexedDBCache {
  constructor(dbName = 'AppCache', version = 1) {
    this.dbName = dbName;
    this.version = version;
    this.db = null;
    this.init();
  }
  
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // 创建对象存储
        if (!db.objectStoreNames.contains('cache')) {
          const store = db.createObjectStore('cache', { keyPath: 'url' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('type', 'type', { unique: false });
        }
      };
    });
  }
  
  async set(url, data, type = 'data') {
    const transaction = this.db.transaction(['cache'], 'readwrite');
    const store = transaction.objectStore('cache');
    
    const entry = {
      url,
      data,
      type,
      timestamp: Date.now()
    };
    
    return new Promise((resolve, reject) => {
      const request = store.put(entry);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
  
  async get(url) {
    const transaction = this.db.transaction(['cache'], 'readonly');
    const store = transaction.objectStore('cache');
    
    return new Promise((resolve, reject) => {
      const request = store.get(url);
      request.onsuccess = () => {
        const result = request.result;
        if (result) {
          // 检查过期
          const age = Date.now() - result.timestamp;
          if (age > 24 * 60 * 60 * 1000) { // 24小时
            this.delete(url);
            resolve(null);
          } else {
            resolve(result.data);
          }
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }
  
  async delete(url) {
    const transaction = this.db.transaction(['cache'], 'readwrite');
    const store = transaction.objectStore('cache');
    
    return new Promise((resolve, reject) => {
      const request = store.delete(url);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
  
  async clear() {
    const transaction = this.db.transaction(['cache'], 'readwrite');
    const store = transaction.objectStore('cache');
    
    return new Promise((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
  
  async cleanup(maxAge = 7 * 24 * 60 * 60 * 1000) {
    const transaction = this.db.transaction(['cache'], 'readwrite');
    const store = transaction.objectStore('cache');
    const index = store.index('timestamp');
    
    const cutoff = Date.now() - maxAge;
    const range = IDBKeyRange.upperBound(cutoff);
    
    return new Promise((resolve, reject) => {
      const request = index.openCursor(range);
      const deleted = [];
      
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          deleted.push(cursor.value.url);
          cursor.delete();
          cursor.continue();
        } else {
          resolve(deleted);
        }
      };
      
      request.onerror = () => reject(request.error);
    });
  }
}

// 使用IndexedDB缓存
const idbCache = new IndexedDBCache();

// 缓存API响应
async function fetchWithCache(url) {
  // 先检查缓存
  const cached = await idbCache.get(url);
  if (cached) {
    console.log('从IndexedDB缓存返回:', url);
    return cached;
  }
  
  // 从网络获取
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    // 存储到缓存
    await idbCache.set(url, data, 'api');
    
    return data;
  } catch (error) {
    console.error('获取失败:', error);
    throw error;
  }
}
```

## 缓存监控和分析

```javascript
class CacheAnalytics {
  constructor() {
    this.metrics = {
      hits: 0,
      misses: 0,
      errors: 0,
      bytesServed: 0,
      bytesFetched: 0
    };
  }
  
  async analyzeCache() {
    const cacheNames = await caches.keys();
    const report = {
      caches: {},
      totalSize: 0,
      totalEntries: 0
    };
    
    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const requests = await cache.keys();
      let cacheSize = 0;
      
      for (const request of requests) {
        const response = await cache.match(request);
        const blob = await response.blob();
        cacheSize += blob.size;
      }
      
      report.caches[cacheName] = {
        entries: requests.length,
        size: cacheSize,
        sizeFormatted: this.formatBytes(cacheSize)
      };
      
      report.totalSize += cacheSize;
      report.totalEntries += requests.length;
    }
    
    report.totalSizeFormatted = this.formatBytes(report.totalSize);
    return report;
  }
  
  recordHit(size = 0) {
    this.metrics.hits++;
    this.metrics.bytesServed += size;
  }
  
  recordMiss(size = 0) {
    this.metrics.misses++;
    this.metrics.bytesFetched += size;
  }
  
  recordError() {
    this.metrics.errors++;
  }
  
  getHitRate() {
    const total = this.metrics.hits + this.metrics.misses;
    return total > 0 ? (this.metrics.hits / total * 100).toFixed(2) : 0;
  }
  
  getReport() {
    return {
      ...this.metrics,
      hitRate: `${this.getHitRate()}%`,
      bytesServedFormatted: this.formatBytes(this.metrics.bytesServed),
      bytesFetchedFormatted: this.formatBytes(this.metrics.bytesFetched),
      bytesSaved: this.formatBytes(this.metrics.bytesServed - this.metrics.bytesFetched)
    };
  }
  
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// 集成到Service Worker
const analytics = new CacheAnalytics();

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) {
        // 缓存命中
        response.blob().then(blob => {
          analytics.recordHit(blob.size);
        });
        return response;
      }
      
      // 缓存未命中
      analytics.recordMiss();
      
      return fetch(event.request).then(response => {
        response.clone().blob().then(blob => {
          analytics.recordMiss(blob.size);
        });
        return response;
      }).catch(error => {
        analytics.recordError();
        throw error;
      });
    })
  );
});

// 定期发送分析报告
setInterval(() => {
  const report = analytics.getReport();
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: 'cache-analytics',
        data: report
      });
    });
  });
}, 30000); // 每30秒
```