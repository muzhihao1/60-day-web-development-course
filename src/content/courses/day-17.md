---
day: 17
phase: "javascript-mastery"
title: "Web存储与数据持久化：构建离线可用的应用"
description: "深入学习Web存储技术，掌握localStorage、sessionStorage、Cookie和IndexedDB，构建离线优先的Web应用"
objectives:
  - "掌握localStorage和sessionStorage的使用"
  - "理解Cookie的工作原理和应用场景"
  - "学习IndexedDB处理大量结构化数据"
  - "实现缓存策略和离线功能"
  - "构建离线优先的Web应用"
estimatedTime: 90
difficulty: "intermediate"
prerequisites: [13, 14, 15, 16]
tags:
  - "Web存储"
  - "localStorage"
  - "IndexedDB"
  - "离线应用"
  - "缓存策略"
resources:
  - title: "MDN Web Storage API"
    url: "https://developer.mozilla.org/zh-CN/docs/Web/API/Web_Storage_API"
    type: "documentation"
  - title: "IndexedDB教程"
    url: "https://developer.mozilla.org/zh-CN/docs/Web/API/IndexedDB_API"
    type: "documentation"
  - title: "HTTP Cookie详解"
    url: "https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Cookies"
    type: "article"
  - title: "离线Web应用"
    url: "https://web.dev/offline-cookbook/"
    type: "article"
codeExamples:
  - title: "Web存储技术对比"
    language: "javascript"
    path: "/code-examples/day-17/storage-comparison.js"
  - title: "IndexedDB实战"
    language: "javascript"
    path: "/code-examples/day-17/indexeddb-example.js"
  - title: "离线缓存策略"
    language: "javascript"
    path: "/code-examples/day-17/offline-strategies.js"
---

# Day 17: Web存储与数据持久化：构建离线可用的应用

## 📋 学习目标

在现代Web应用中，数据持久化是提供优秀用户体验的关键。今天我们将深入学习各种Web存储技术，理解它们的特点和应用场景，并学会构建离线优先的应用。

## 🎯 为什么Web存储如此重要？

1. **提升用户体验**：保存用户偏好、表单数据，避免重复输入
2. **离线功能**：即使没有网络也能使用应用
3. **性能优化**：减少网络请求，加快加载速度
4. **跨页面通信**：在不同标签页间共享数据
5. **渐进式Web应用**：PWA的基础技术

## 🔧 Web存储技术概览

### 1. 存储方式对比

| 特性 | localStorage | sessionStorage | Cookie | IndexedDB |
|------|--------------|----------------|---------|-----------|
| 容量 | 5-10MB | 5-10MB | 4KB | 无限制* |
| 生命周期 | 永久 | 会话期间 | 可设置 | 永久 |
| 作用域 | 同源 | 同源同窗口 | 同源/路径 | 同源 |
| 同步/异步 | 同步 | 同步 | 同步 | 异步 |
| 复杂度 | 简单 | 简单 | 中等 | 复杂 |
| 传输 | 不传输 | 不传输 | 每次请求 | 不传输 |

\* IndexedDB容量受磁盘空间限制

## 📦 localStorage和sessionStorage

### 1. 基础操作

```javascript
// ============================================
// localStorage基础
// ============================================

// 存储数据
localStorage.setItem('username', 'Alice');
localStorage.setItem('theme', 'dark');

// 读取数据
const username = localStorage.getItem('username');
console.log(username); // "Alice"

// 删除数据
localStorage.removeItem('theme');

// 清空所有数据
localStorage.clear();

// 获取键名
const key = localStorage.key(0);

// 获取存储项数量
const count = localStorage.length;

// ============================================
// sessionStorage基础（API相同）
// ============================================

// 仅在当前会话有效
sessionStorage.setItem('tempData', 'temporary');

// 关闭标签页后数据消失
window.addEventListener('beforeunload', () => {
    sessionStorage.setItem('lastVisit', new Date().toISOString());
});
```

### 2. 存储复杂数据

```javascript
// 存储对象和数组
const user = {
    id: 1,
    name: 'Alice',
    preferences: {
        theme: 'dark',
        language: 'zh-CN'
    }
};

// 序列化存储
localStorage.setItem('user', JSON.stringify(user));

// 反序列化读取
const savedUser = JSON.parse(localStorage.getItem('user'));

// 封装存储类
class LocalStorage {
    static set(key, value) {
        try {
            const serialized = JSON.stringify(value);
            localStorage.setItem(key, serialized);
            return true;
        } catch (error) {
            console.error('存储失败:', error);
            return false;
        }
    }
    
    static get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('读取失败:', error);
            return defaultValue;
        }
    }
    
    static remove(key) {
        localStorage.removeItem(key);
    }
    
    static clear() {
        localStorage.clear();
    }
    
    // 设置过期时间
    static setWithExpiry(key, value, ttl) {
        const now = new Date();
        const item = {
            value: value,
            expiry: now.getTime() + ttl
        };
        this.set(key, item);
    }
    
    static getWithExpiry(key) {
        const item = this.get(key);
        if (!item) return null;
        
        const now = new Date();
        if (now.getTime() > item.expiry) {
            this.remove(key);
            return null;
        }
        return item.value;
    }
}

// 使用示例
LocalStorage.set('settings', { theme: 'dark', lang: 'zh' });
LocalStorage.setWithExpiry('token', 'abc123', 3600000); // 1小时后过期
```

### 3. 存储事件监听

```javascript
// 监听其他窗口的存储变化
window.addEventListener('storage', (event) => {
    console.log('存储变化:', {
        key: event.key,
        oldValue: event.oldValue,
        newValue: event.newValue,
        url: event.url,
        storageArea: event.storageArea
    });
    
    // 同步UI更新
    if (event.key === 'theme') {
        updateTheme(event.newValue);
    }
});

// 跨标签页通信
class TabCommunicator {
    constructor() {
        this.listeners = new Map();
        window.addEventListener('storage', this.handleStorage.bind(this));
    }
    
    send(channel, data) {
        const message = {
            channel,
            data,
            timestamp: Date.now(),
            tabId: this.getTabId()
        };
        localStorage.setItem('tab_message', JSON.stringify(message));
        localStorage.removeItem('tab_message'); // 触发事件后立即删除
    }
    
    on(channel, callback) {
        if (!this.listeners.has(channel)) {
            this.listeners.set(channel, new Set());
        }
        this.listeners.get(channel).add(callback);
    }
    
    handleStorage(event) {
        if (event.key === 'tab_message' && event.newValue) {
            try {
                const message = JSON.parse(event.newValue);
                if (message.tabId !== this.getTabId()) {
                    const listeners = this.listeners.get(message.channel);
                    if (listeners) {
                        listeners.forEach(callback => callback(message.data));
                    }
                }
            } catch (error) {
                console.error('消息解析失败:', error);
            }
        }
    }
    
    getTabId() {
        if (!sessionStorage.getItem('tabId')) {
            sessionStorage.setItem('tabId', Date.now().toString());
        }
        return sessionStorage.getItem('tabId');
    }
}

// 使用跨标签页通信
const communicator = new TabCommunicator();

communicator.on('theme-change', (theme) => {
    console.log('收到主题变更:', theme);
    document.body.className = theme;
});

// 在另一个标签页发送
communicator.send('theme-change', 'dark');
```

## 🍪 Cookie操作

### 1. Cookie基础

```javascript
// ============================================
// Cookie操作封装
// ============================================

class CookieManager {
    // 设置Cookie
    static set(name, value, options = {}) {
        let cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
        
        // 过期时间
        if (options.expires) {
            if (options.expires instanceof Date) {
                cookie += `; expires=${options.expires.toUTCString()}`;
            } else {
                // 天数
                const date = new Date();
                date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
                cookie += `; expires=${date.toUTCString()}`;
            }
        }
        
        // 其他选项
        if (options.path) cookie += `; path=${options.path}`;
        if (options.domain) cookie += `; domain=${options.domain}`;
        if (options.secure) cookie += '; secure';
        if (options.sameSite) cookie += `; samesite=${options.sameSite}`;
        
        document.cookie = cookie;
    }
    
    // 获取Cookie
    static get(name) {
        const nameEQ = encodeURIComponent(name) + '=';
        const cookies = document.cookie.split(';');
        
        for (let cookie of cookies) {
            cookie = cookie.trim();
            if (cookie.indexOf(nameEQ) === 0) {
                return decodeURIComponent(cookie.substring(nameEQ.length));
            }
        }
        return null;
    }
    
    // 删除Cookie
    static delete(name, options = {}) {
        this.set(name, '', {
            ...options,
            expires: new Date(0)
        });
    }
    
    // 获取所有Cookie
    static getAll() {
        const cookies = {};
        document.cookie.split(';').forEach(cookie => {
            const [name, value] = cookie.trim().split('=');
            if (name) {
                cookies[decodeURIComponent(name)] = decodeURIComponent(value || '');
            }
        });
        return cookies;
    }
}

// 使用示例
CookieManager.set('sessionId', 'abc123', {
    expires: 7, // 7天
    path: '/',
    secure: true,
    sameSite: 'strict'
});

const sessionId = CookieManager.get('sessionId');
console.log('Session ID:', sessionId);

// 用户偏好设置
class UserPreferences {
    static save(preferences) {
        CookieManager.set('user_prefs', JSON.stringify(preferences), {
            expires: 365,
            path: '/'
        });
    }
    
    static load() {
        const prefs = CookieManager.get('user_prefs');
        return prefs ? JSON.parse(prefs) : this.getDefaults();
    }
    
    static getDefaults() {
        return {
            theme: 'light',
            language: 'zh-CN',
            fontSize: 'medium'
        };
    }
}
```

### 2. Cookie安全最佳实践

```javascript
// 安全的会话管理
class SecureSession {
    static create(userId, rememberMe = false) {
        const sessionData = {
            userId,
            createdAt: Date.now(),
            fingerprint: this.generateFingerprint()
        };
        
        // 加密会话数据（实际应用中使用真实加密）
        const encrypted = btoa(JSON.stringify(sessionData));
        
        CookieManager.set('session', encrypted, {
            expires: rememberMe ? 30 : null, // 30天或会话结束
            path: '/',
            secure: true, // 仅HTTPS
            sameSite: 'strict', // 防止CSRF
            httpOnly: true // 防止XSS（仅服务器端设置）
        });
    }
    
    static verify() {
        const session = CookieManager.get('session');
        if (!session) return null;
        
        try {
            const decrypted = JSON.parse(atob(session));
            
            // 验证指纹
            if (decrypted.fingerprint !== this.generateFingerprint()) {
                this.destroy();
                return null;
            }
            
            // 检查过期
            const age = Date.now() - decrypted.createdAt;
            if (age > 24 * 60 * 60 * 1000) { // 24小时
                this.destroy();
                return null;
            }
            
            return decrypted;
        } catch (error) {
            this.destroy();
            return null;
        }
    }
    
    static generateFingerprint() {
        // 简单的浏览器指纹（实际应用中使用更复杂的方法）
        return btoa([
            navigator.userAgent,
            navigator.language,
            new Date().getTimezoneOffset(),
            screen.width + 'x' + screen.height
        ].join('|'));
    }
    
    static destroy() {
        CookieManager.delete('session', { path: '/' });
    }
}
```

## 🗄️ IndexedDB深入

### 1. IndexedDB基础操作

```javascript
// ============================================
// IndexedDB封装类
// ============================================

class IndexedDBManager {
    constructor(dbName, version = 1) {
        this.dbName = dbName;
        this.version = version;
        this.db = null;
    }
    
    // 打开数据库
    async open() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };
            
            request.onupgradeneeded = (event) => {
                this.db = event.target.result;
                this.onUpgrade(event);
            };
        });
    }
    
    // 数据库升级
    onUpgrade(event) {
        // 子类重写此方法
    }
    
    // 添加数据
    async add(storeName, data) {
        const transaction = this.db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        return this.promisify(store.add(data));
    }
    
    // 获取数据
    async get(storeName, key) {
        const transaction = this.db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        return this.promisify(store.get(key));
    }
    
    // 更新数据
    async put(storeName, data) {
        const transaction = this.db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        return this.promisify(store.put(data));
    }
    
    // 删除数据
    async delete(storeName, key) {
        const transaction = this.db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        return this.promisify(store.delete(key));
    }
    
    // 获取所有数据
    async getAll(storeName) {
        const transaction = this.db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        return this.promisify(store.getAll());
    }
    
    // 清空存储
    async clear(storeName) {
        const transaction = this.db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        return this.promisify(store.clear());
    }
    
    // Promise封装
    promisify(request) {
        return new Promise((resolve, reject) => {
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
}

// 实际应用示例：任务管理数据库
class TaskDatabase extends IndexedDBManager {
    constructor() {
        super('TaskDB', 1);
    }
    
    onUpgrade(event) {
        const db = event.target.result;
        
        // 创建任务存储
        if (!db.objectStoreNames.contains('tasks')) {
            const taskStore = db.createObjectStore('tasks', {
                keyPath: 'id',
                autoIncrement: true
            });
            
            // 创建索引
            taskStore.createIndex('status', 'status', { unique: false });
            taskStore.createIndex('priority', 'priority', { unique: false });
            taskStore.createIndex('dueDate', 'dueDate', { unique: false });
            taskStore.createIndex('category', 'category', { unique: false });
        }
        
        // 创建分类存储
        if (!db.objectStoreNames.contains('categories')) {
            db.createObjectStore('categories', {
                keyPath: 'id',
                autoIncrement: true
            });
        }
    }
    
    // 高级查询方法
    async getTasksByStatus(status) {
        const transaction = this.db.transaction(['tasks'], 'readonly');
        const store = transaction.objectStore('tasks');
        const index = store.index('status');
        return this.promisify(index.getAll(status));
    }
    
    async getTasksByDateRange(startDate, endDate) {
        const transaction = this.db.transaction(['tasks'], 'readonly');
        const store = transaction.objectStore('tasks');
        const index = store.index('dueDate');
        const range = IDBKeyRange.bound(startDate, endDate);
        return this.promisify(index.getAll(range));
    }
    
    async searchTasks(query) {
        const allTasks = await this.getAll('tasks');
        return allTasks.filter(task => 
            task.title.toLowerCase().includes(query.toLowerCase()) ||
            task.description.toLowerCase().includes(query.toLowerCase())
        );
    }
}

// 使用示例
async function demoIndexedDB() {
    const taskDB = new TaskDatabase();
    await taskDB.open();
    
    // 添加任务
    await taskDB.add('tasks', {
        title: '学习IndexedDB',
        description: '深入理解IndexedDB的使用',
        status: 'pending',
        priority: 'high',
        dueDate: new Date('2024-12-31'),
        category: '学习'
    });
    
    // 获取所有待处理任务
    const pendingTasks = await taskDB.getTasksByStatus('pending');
    console.log('待处理任务:', pendingTasks);
    
    // 搜索任务
    const searchResults = await taskDB.searchTasks('IndexedDB');
    console.log('搜索结果:', searchResults);
}
```

### 2. IndexedDB高级功能

```javascript
// 批量操作和事务管理
class BatchOperations {
    constructor(db) {
        this.db = db;
    }
    
    // 批量插入
    async batchInsert(storeName, items) {
        const transaction = this.db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        
        const promises = items.map(item => {
            return new Promise((resolve, reject) => {
                const request = store.add(item);
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });
        });
        
        return Promise.all(promises);
    }
    
    // 带游标的复杂查询
    async queryWithCursor(storeName, filter) {
        return new Promise((resolve, reject) => {
            const results = [];
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.openCursor();
            
            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    if (filter(cursor.value)) {
                        results.push(cursor.value);
                    }
                    cursor.continue();
                } else {
                    resolve(results);
                }
            };
            
            request.onerror = () => reject(request.error);
        });
    }
    
    // 分页查询
    async paginate(storeName, page = 1, pageSize = 10) {
        return new Promise((resolve, reject) => {
            const results = [];
            const skip = (page - 1) * pageSize;
            let count = 0;
            
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.openCursor();
            
            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    if (count >= skip && results.length < pageSize) {
                        results.push(cursor.value);
                    }
                    count++;
                    
                    if (results.length < pageSize) {
                        cursor.continue();
                    } else {
                        resolve({
                            data: results,
                            page,
                            pageSize,
                            total: count
                        });
                    }
                } else {
                    resolve({
                        data: results,
                        page,
                        pageSize,
                        total: count
                    });
                }
            };
            
            request.onerror = () => reject(request.error);
        });
    }
}

// 数据同步管理
class SyncManager {
    constructor(db) {
        this.db = db;
        this.syncQueue = [];
        this.isSyncing = false;
    }
    
    // 添加到同步队列
    async addToSyncQueue(action, data) {
        await this.db.add('sync_queue', {
            action,
            data,
            timestamp: Date.now(),
            status: 'pending'
        });
    }
    
    // 执行同步
    async sync() {
        if (this.isSyncing || !navigator.onLine) return;
        
        this.isSyncing = true;
        
        try {
            const pendingItems = await this.db.getAll('sync_queue');
            
            for (const item of pendingItems) {
                try {
                    await this.syncItem(item);
                    await this.db.delete('sync_queue', item.id);
                } catch (error) {
                    console.error('同步失败:', error);
                    await this.db.put('sync_queue', {
                        ...item,
                        status: 'failed',
                        error: error.message
                    });
                }
            }
        } finally {
            this.isSyncing = false;
        }
    }
    
    async syncItem(item) {
        // 模拟API调用
        const response = await fetch('/api/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item)
        });
        
        if (!response.ok) {
            throw new Error('同步失败');
        }
        
        return response.json();
    }
}
```

## 🌐 离线应用策略

### 1. 缓存策略实现

```javascript
// ============================================
// 离线缓存管理器
// ============================================

class OfflineCacheManager {
    constructor() {
        this.CACHE_NAME = 'app-cache-v1';
        this.urlsToCache = [
            '/',
            '/styles/main.css',
            '/scripts/main.js',
            '/offline.html'
        ];
    }
    
    // Service Worker注册
    async register() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                console.log('Service Worker注册成功:', registration);
                
                // 监听更新
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed') {
                            if (navigator.serviceWorker.controller) {
                                // 新版本可用
                                this.notifyUpdate();
                            }
                        }
                    });
                });
            } catch (error) {
                console.error('Service Worker注册失败:', error);
            }
        }
    }
    
    notifyUpdate() {
        // 通知用户有更新
        if (confirm('应用有新版本，是否刷新？')) {
            window.location.reload();
        }
    }
}

// Service Worker文件 (sw.js)
const CACHE_NAME = 'app-cache-v1';
const urlsToCache = [
    '/',
    '/styles/main.css',
    '/scripts/main.js',
    '/offline.html'
];

// 安装事件
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

// 激活事件
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// 拦截请求
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // 缓存优先
                if (response) {
                    return response;
                }
                
                // 网络请求
                return fetch(event.request).then(response => {
                    // 缓存新资源
                    if (!response || response.status !== 200) {
                        return response;
                    }
                    
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, responseToCache);
                    });
                    
                    return response;
                });
            })
            .catch(() => {
                // 离线回退
                return caches.match('/offline.html');
            })
    );
});
```

### 2. 智能同步策略

```javascript
// 后台同步管理
class BackgroundSync {
    constructor() {
        this.syncTag = 'data-sync';
    }
    
    // 注册后台同步
    async register() {
        if ('serviceWorker' in navigator && 'SyncManager' in window) {
            const registration = await navigator.serviceWorker.ready;
            
            try {
                await registration.sync.register(this.syncTag);
                console.log('后台同步已注册');
            } catch (error) {
                console.error('后台同步注册失败:', error);
            }
        }
    }
    
    // 监听同步事件（Service Worker中）
    static handleSync(event) {
        if (event.tag === 'data-sync') {
            event.waitUntil(this.syncData());
        }
    }
    
    static async syncData() {
        // 从IndexedDB获取待同步数据
        const db = await openDB();
        const pendingData = await db.getAll('pending_sync');
        
        for (const data of pendingData) {
            try {
                await fetch('/api/sync', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                
                // 同步成功，删除记录
                await db.delete('pending_sync', data.id);
            } catch (error) {
                console.error('同步失败:', error);
                // 保留记录，下次重试
            }
        }
    }
}

// 网络状态管理
class NetworkStatus {
    constructor() {
        this.online = navigator.onLine;
        this.listeners = new Set();
        
        window.addEventListener('online', this.handleOnline.bind(this));
        window.addEventListener('offline', this.handleOffline.bind(this));
    }
    
    handleOnline() {
        this.online = true;
        this.notify('online');
        
        // 触发数据同步
        const sync = new BackgroundSync();
        sync.register();
    }
    
    handleOffline() {
        this.online = false;
        this.notify('offline');
    }
    
    onChange(callback) {
        this.listeners.add(callback);
        return () => this.listeners.delete(callback);
    }
    
    notify(status) {
        this.listeners.forEach(callback => callback(status));
    }
    
    // 检测真实连接（不仅仅是navigator.onLine）
    async checkConnection() {
        try {
            const response = await fetch('/api/ping', {
                method: 'HEAD',
                cache: 'no-store'
            });
            return response.ok;
        } catch {
            return false;
        }
    }
}

// 使用网络状态
const networkStatus = new NetworkStatus();

networkStatus.onChange(status => {
    const indicator = document.getElementById('network-indicator');
    indicator.textContent = status === 'online' ? '在线' : '离线';
    indicator.className = status === 'online' ? 'online' : 'offline';
});
```

### 3. 渐进式Web应用(PWA)

```javascript
// PWA配置管理
class PWAManager {
    constructor() {
        this.deferredPrompt = null;
        this.setupInstallPrompt();
    }
    
    setupInstallPrompt() {
        // 捕获安装提示
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallButton();
        });
        
        // 监听安装状态
        window.addEventListener('appinstalled', () => {
            console.log('PWA已安装');
            this.hideInstallButton();
        });
    }
    
    showInstallButton() {
        const installBtn = document.getElementById('install-btn');
        if (installBtn) {
            installBtn.style.display = 'block';
            installBtn.addEventListener('click', () => this.install());
        }
    }
    
    hideInstallButton() {
        const installBtn = document.getElementById('install-btn');
        if (installBtn) {
            installBtn.style.display = 'none';
        }
    }
    
    async install() {
        if (!this.deferredPrompt) return;
        
        this.deferredPrompt.prompt();
        const result = await this.deferredPrompt.userChoice;
        
        console.log(`用户选择: ${result.outcome}`);
        this.deferredPrompt = null;
    }
    
    // 检查是否已安装
    static isInstalled() {
        return window.matchMedia('(display-mode: standalone)').matches ||
               window.navigator.standalone ||
               document.referrer.includes('android-app://');
    }
}

// Web App Manifest
const manifest = {
    name: '离线任务管理器',
    short_name: '任务管理',
    description: '支持离线使用的任务管理应用',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#3498db',
    orientation: 'portrait',
    icons: [
        {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
        },
        {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
        }
    ]
};
```

## 🛠️ 实战：离线笔记应用

```javascript
// 完整的离线笔记应用
class OfflineNotesApp {
    constructor() {
        this.db = null;
        this.currentNote = null;
        this.syncManager = null;
        this.init();
    }
    
    async init() {
        // 初始化数据库
        this.db = new NotesDatabase();
        await this.db.open();
        
        // 初始化同步
        this.syncManager = new SyncManager(this.db);
        
        // 注册Service Worker
        const cache = new OfflineCacheManager();
        await cache.register();
        
        // 初始化UI
        this.setupUI();
        this.loadNotes();
        
        // 监听网络状态
        this.setupNetworkHandling();
    }
    
    setupUI() {
        // 保存按钮
        document.getElementById('save-btn').addEventListener('click', () => {
            this.saveNote();
        });
        
        // 自动保存
        let autoSaveTimer;
        document.getElementById('note-content').addEventListener('input', () => {
            clearTimeout(autoSaveTimer);
            autoSaveTimer = setTimeout(() => this.autoSave(), 1000);
        });
    }
    
    async saveNote() {
        const title = document.getElementById('note-title').value;
        const content = document.getElementById('note-content').value;
        
        const note = {
            id: this.currentNote?.id || Date.now(),
            title,
            content,
            updatedAt: new Date().toISOString(),
            synced: false
        };
        
        // 保存到IndexedDB
        if (this.currentNote) {
            await this.db.put('notes', note);
        } else {
            await this.db.add('notes', note);
        }
        
        // 添加到同步队列
        await this.syncManager.addToSyncQueue('save', note);
        
        // 尝试立即同步
        if (navigator.onLine) {
            this.syncManager.sync();
        }
        
        this.showStatus('笔记已保存');
        this.loadNotes();
    }
    
    async autoSave() {
        // 保存到localStorage作为草稿
        const draft = {
            title: document.getElementById('note-title').value,
            content: document.getElementById('note-content').value,
            timestamp: Date.now()
        };
        
        localStorage.setItem('note-draft', JSON.stringify(draft));
        this.showStatus('自动保存', 'info');
    }
    
    async loadNotes() {
        const notes = await this.db.getAll('notes');
        const notesList = document.getElementById('notes-list');
        
        notesList.innerHTML = notes.map(note => `
            <div class="note-item ${!note.synced ? 'unsynced' : ''}" 
                 data-id="${note.id}">
                <h3>${this.escapeHtml(note.title)}</h3>
                <p>${new Date(note.updatedAt).toLocaleString()}</p>
                ${!note.synced ? '<span class="sync-badge">待同步</span>' : ''}
            </div>
        `).join('');
        
        // 绑定点击事件
        notesList.querySelectorAll('.note-item').forEach(item => {
            item.addEventListener('click', () => this.loadNote(item.dataset.id));
        });
    }
    
    async loadNote(id) {
        const note = await this.db.get('notes', parseInt(id));
        if (note) {
            this.currentNote = note;
            document.getElementById('note-title').value = note.title;
            document.getElementById('note-content').value = note.content;
        }
    }
    
    setupNetworkHandling() {
        const networkStatus = new NetworkStatus();
        
        networkStatus.onChange(status => {
            if (status === 'online') {
                this.syncManager.sync();
                this.showStatus('已连接到网络，正在同步...', 'success');
            } else {
                this.showStatus('离线模式 - 数据将在恢复连接后同步', 'warning');
            }
        });
    }
    
    showStatus(message, type = 'success') {
        const status = document.getElementById('status');
        status.textContent = message;
        status.className = `status ${type}`;
        
        setTimeout(() => {
            status.textContent = '';
            status.className = 'status';
        }, 3000);
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// 笔记数据库
class NotesDatabase extends IndexedDBManager {
    constructor() {
        super('NotesDB', 1);
    }
    
    onUpgrade(event) {
        const db = event.target.result;
        
        if (!db.objectStoreNames.contains('notes')) {
            const notesStore = db.createObjectStore('notes', {
                keyPath: 'id'
            });
            
            notesStore.createIndex('updatedAt', 'updatedAt');
            notesStore.createIndex('synced', 'synced');
        }
        
        if (!db.objectStoreNames.contains('sync_queue')) {
            db.createObjectStore('sync_queue', {
                keyPath: 'id',
                autoIncrement: true
            });
        }
    }
}

// 初始化应用
const app = new OfflineNotesApp();
```

## 🎯 最佳实践总结

### 1. 存储选择指南

```javascript
// 根据需求选择合适的存储方案
class StorageSelector {
    static select(requirements) {
        const { size, persistence, complexity, sharing } = requirements;
        
        if (size < 4 && !complexity && sharing === 'server') {
            return 'cookie';
        } else if (size < 10 && !complexity && persistence) {
            return 'localStorage';
        } else if (size < 10 && !complexity && !persistence) {
            return 'sessionStorage';
        } else {
            return 'IndexedDB';
        }
    }
}
```

### 2. 安全注意事项

- 不要在客户端存储敏感信息
- 使用HTTPS传输Cookie
- 设置适当的Cookie属性（Secure, HttpOnly, SameSite）
- 验证存储的数据完整性
- 实现适当的访问控制

### 3. 性能优化

- 批量操作减少I/O
- 使用索引加速查询
- 实现数据分页
- 定期清理过期数据
- 合理使用缓存策略

## 🎯 今日练习预览

今天的练习中，你将构建一个功能完整的离线笔记应用，包括：

1. 多种存储方式的综合运用
2. 离线数据同步
3. PWA功能实现
4. 性能优化
5. 用户体验提升

## 🚀 下一步

明天我们将学习模块化编程和构建工具：
- ES6模块系统
- CommonJS和AMD
- Webpack基础
- 模块打包优化
- 代码分割

## 💭 思考题

1. localStorage和sessionStorage的本质区别是什么？
2. 什么时候应该使用IndexedDB而不是localStorage？
3. 如何设计一个可靠的离线同步策略？
4. PWA相比传统Web应用有哪些优势？
5. 如何在保证安全的前提下实现"记住我"功能？

记住：**数据持久化是提升用户体验的关键，合理使用存储技术能让你的应用更加强大！**