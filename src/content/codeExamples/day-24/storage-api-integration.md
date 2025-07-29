---
title: "数据存储与API集成"
category: "advanced"
language: "javascript"
---

# 数据存储与API集成

## IndexedDB高级封装

```javascript
// src/services/StorageService.js - 存储服务
export class StorageService {
    constructor(storeName) {
        this.dbName = 'TaskFlowPro';
        this.dbVersion = 1;
        this.storeName = storeName;
        this.db = null;
    }
    
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // 创建对象存储
                if (!db.objectStoreNames.contains('tasks')) {
                    const tasksStore = db.createObjectStore('tasks', { keyPath: 'id' });
                    tasksStore.createIndex('status', 'status', { unique: false });
                    tasksStore.createIndex('priority', 'priority', { unique: false });
                    tasksStore.createIndex('dueDate', 'dueDate', { unique: false });
                    tasksStore.createIndex('tags', 'tags', { unique: false, multiEntry: true });
                }
                
                if (!db.objectStoreNames.contains('users')) {
                    db.createObjectStore('users', { keyPath: 'id' });
                }
                
                if (!db.objectStoreNames.contains('settings')) {
                    db.createObjectStore('settings', { keyPath: 'key' });
                }
                
                if (!db.objectStoreNames.contains('cache')) {
                    const cacheStore = db.createObjectStore('cache', { keyPath: 'key' });
                    cacheStore.createIndex('expiry', 'expiry', { unique: false });
                }
            };
        });
    }
    
    async ensureDb() {
        if (!this.db) {
            await this.init();
        }
    }
    
    async get(key) {
        await this.ensureDb();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const request = store.get(key);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
    
    async getAll() {
        await this.ensureDb();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const request = store.getAll();
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
    
    async set(key, value) {
        await this.ensureDb();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.put(value);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
    
    async setAll(items) {
        await this.ensureDb();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            
            // 清空现有数据
            store.clear();
            
            // 批量添加
            let addedCount = 0;
            items.forEach(item => {
                const request = store.add(item);
                request.onsuccess = () => {
                    addedCount++;
                    if (addedCount === items.length) {
                        resolve();
                    }
                };
                request.onerror = () => reject(request.error);
            });
        });
    }
    
    async delete(key) {
        await this.ensureDb();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.delete(key);
            
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
    
    async clear() {
        await this.ensureDb();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.clear();
            
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
    
    async query(indexName, value) {
        await this.ensureDb();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const index = store.index(indexName);
            const request = index.getAll(value);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
    
    async queryRange(indexName, lower, upper) {
        await this.ensureDb();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const index = store.index(indexName);
            const range = IDBKeyRange.bound(lower, upper);
            const request = index.getAll(range);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
}

// src/services/CacheService.js - 缓存服务
export class CacheService {
    constructor() {
        this.storage = new StorageService('cache');
        this.memoryCache = new Map();
    }
    
    async get(key) {
        // 检查内存缓存
        if (this.memoryCache.has(key)) {
            const cached = this.memoryCache.get(key);
            if (cached.expiry > Date.now()) {
                return cached.data;
            }
            this.memoryCache.delete(key);
        }
        
        // 检查持久化缓存
        const cached = await this.storage.get(key);
        if (cached && cached.expiry > Date.now()) {
            // 恢复到内存缓存
            this.memoryCache.set(key, cached);
            return cached.data;
        }
        
        // 缓存已过期
        if (cached) {
            await this.storage.delete(key);
        }
        
        return null;
    }
    
    async set(key, data, ttl = 3600000) { // 默认1小时
        const cacheEntry = {
            key,
            data,
            expiry: Date.now() + ttl,
            createdAt: Date.now()
        };
        
        // 存储到内存
        this.memoryCache.set(key, cacheEntry);
        
        // 存储到IndexedDB
        await this.storage.set(key, cacheEntry);
    }
    
    async delete(key) {
        this.memoryCache.delete(key);
        await this.storage.delete(key);
    }
    
    async clear() {
        this.memoryCache.clear();
        await this.storage.clear();
    }
    
    async cleanExpired() {
        const now = Date.now();
        
        // 清理内存缓存
        for (const [key, value] of this.memoryCache) {
            if (value.expiry <= now) {
                this.memoryCache.delete(key);
            }
        }
        
        // 清理持久化缓存
        const allCached = await this.storage.getAll();
        const expired = allCached.filter(item => item.expiry <= now);
        
        for (const item of expired) {
            await this.storage.delete(item.key);
        }
        
        return expired.length;
    }
}
```

## API服务实现

```javascript
// src/services/APIService.js - API服务基类
export class APIService {
    constructor(endpoint) {
        this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
        this.endpoint = endpoint;
        this.token = null;
        this.refreshToken = null;
        this.cache = new CacheService();
        this.requestQueue = [];
        this.isRefreshing = false;
    }
    
    setAuth(token, refreshToken) {
        this.token = token;
        this.refreshToken = refreshToken;
        
        // 保存到本地存储
        localStorage.setItem('authToken', token);
        localStorage.setItem('refreshToken', refreshToken);
    }
    
    clearAuth() {
        this.token = null;
        this.refreshToken = null;
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
    }
    
    loadAuth() {
        this.token = localStorage.getItem('authToken');
        this.refreshToken = localStorage.getItem('refreshToken');
    }
    
    async request(path, options = {}) {
        const url = `${this.baseURL}${this.endpoint}${path}`;
        
        const config = {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        };
        
        // 添加认证头
        if (this.token) {
            config.headers['Authorization'] = `Bearer ${this.token}`;
        }
        
        try {
            const response = await fetch(url, config);
            
            // 处理401错误（未授权）
            if (response.status === 401 && this.refreshToken) {
                return this.handleTokenRefresh(() => this.request(path, options));
            }
            
            // 处理其他错误
            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new APIError(
                    error.message || `HTTP ${response.status}`,
                    response.status,
                    error
                );
            }
            
            // 处理响应
            const data = await response.json();
            return data;
            
        } catch (error) {
            // 网络错误
            if (error instanceof TypeError && error.message === 'Failed to fetch') {
                throw new NetworkError('网络连接失败');
            }
            throw error;
        }
    }
    
    async handleTokenRefresh(retryCallback) {
        // 如果已经在刷新，加入队列等待
        if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
                this.requestQueue.push({ resolve, reject, callback: retryCallback });
            });
        }
        
        this.isRefreshing = true;
        
        try {
            // 刷新token
            const response = await fetch(`${this.baseURL}/auth/refresh`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    refreshToken: this.refreshToken
                })
            });
            
            if (!response.ok) {
                throw new Error('Token refresh failed');
            }
            
            const data = await response.json();
            this.setAuth(data.token, data.refreshToken);
            
            // 处理队列中的请求
            this.requestQueue.forEach(({ resolve, callback }) => {
                resolve(callback());
            });
            this.requestQueue = [];
            
            // 重试原始请求
            return retryCallback();
            
        } catch (error) {
            // 刷新失败，清除认证信息
            this.clearAuth();
            
            // 拒绝所有队列中的请求
            this.requestQueue.forEach(({ reject }) => {
                reject(new Error('Authentication failed'));
            });
            this.requestQueue = [];
            
            throw error;
        } finally {
            this.isRefreshing = false;
        }
    }
    
    async get(path, options = {}) {
        // 尝试从缓存获取
        const cacheKey = `GET:${this.endpoint}${path}`;
        const cached = await this.cache.get(cacheKey);
        
        if (cached && !options.noCache) {
            return cached;
        }
        
        const data = await this.request(path, {
            method: 'GET',
            ...options
        });
        
        // 缓存结果
        if (options.cache !== false) {
            await this.cache.set(cacheKey, data, options.cacheTTL);
        }
        
        return data;
    }
    
    async post(path, body, options = {}) {
        return this.request(path, {
            method: 'POST',
            body: JSON.stringify(body),
            ...options
        });
    }
    
    async put(path, body, options = {}) {
        return this.request(path, {
            method: 'PUT',
            body: JSON.stringify(body),
            ...options
        });
    }
    
    async patch(path, body, options = {}) {
        return this.request(path, {
            method: 'PATCH',
            body: JSON.stringify(body),
            ...options
        });
    }
    
    async delete(path, options = {}) {
        return this.request(path, {
            method: 'DELETE',
            ...options
        });
    }
    
    // 便捷方法
    async getAll(options = {}) {
        return this.get('', options);
    }
    
    async getById(id, options = {}) {
        return this.get(`/${id}`, options);
    }
    
    async create(data, options = {}) {
        return this.post('', data, options);
    }
    
    async update(id, data, options = {}) {
        return this.put(`/${id}`, data, options);
    }
    
    async partialUpdate(id, data, options = {}) {
        return this.patch(`/${id}`, data, options);
    }
    
    async remove(id, options = {}) {
        return this.delete(`/${id}`, options);
    }
}

// 自定义错误类
export class APIError extends Error {
    constructor(message, status, data = {}) {
        super(message);
        this.name = 'APIError';
        this.status = status;
        this.data = data;
    }
}

export class NetworkError extends Error {
    constructor(message) {
        super(message);
        this.name = 'NetworkError';
    }
}
```

## 实时同步与离线支持

```javascript
// src/services/SyncService.js - 同步服务
export class SyncService {
    constructor(taskService, authService) {
        this.taskService = taskService;
        this.authService = authService;
        this.syncInterval = null;
        this.ws = null;
        this.reconnectTimeout = null;
        this.reconnectDelay = 1000;
        this.maxReconnectDelay = 30000;
    }
    
    start() {
        // 启动定期同步
        this.syncInterval = setInterval(() => {
            this.sync();
        }, 30000); // 每30秒同步一次
        
        // 启动WebSocket连接
        this.connectWebSocket();
        
        // 监听网络状态
        window.addEventListener('online', () => {
            console.log('Network online, syncing...');
            this.sync();
            this.connectWebSocket();
        });
        
        window.addEventListener('offline', () => {
            console.log('Network offline');
            this.disconnectWebSocket();
        });
        
        // 监听页面可见性
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.sync();
            }
        });
    }
    
    stop() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
        
        this.disconnectWebSocket();
    }
    
    async sync() {
        if (!navigator.onLine || !this.authService.isAuthenticated()) {
            return;
        }
        
        try {
            // 同步离线更改
            const result = await this.taskService.syncOfflineChanges();
            console.log(`Sync completed: ${result.synced} synced, ${result.failed} failed`);
            
            // 获取最新数据
            await this.taskService.getAllTasks();
            
        } catch (error) {
            console.error('Sync failed:', error);
        }
    }
    
    connectWebSocket() {
        if (!this.authService.isAuthenticated() || !navigator.onLine) {
            return;
        }
        
        const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:3000';
        const token = this.authService.getToken();
        
        this.ws = new WebSocket(`${wsUrl}/ws?token=${token}`);
        
        this.ws.onopen = () => {
            console.log('WebSocket connected');
            this.reconnectDelay = 1000;
            
            // 发送心跳
            this.heartbeatInterval = setInterval(() => {
                if (this.ws.readyState === WebSocket.OPEN) {
                    this.ws.send(JSON.stringify({ type: 'ping' }));
                }
            }, 30000);
        };
        
        this.ws.onmessage = async (event) => {
            try {
                const message = JSON.parse(event.data);
                await this.handleWebSocketMessage(message);
            } catch (error) {
                console.error('Failed to handle WebSocket message:', error);
            }
        };
        
        this.ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
        
        this.ws.onclose = () => {
            console.log('WebSocket disconnected');
            
            if (this.heartbeatInterval) {
                clearInterval(this.heartbeatInterval);
                this.heartbeatInterval = null;
            }
            
            // 尝试重连
            this.scheduleReconnect();
        };
    }
    
    disconnectWebSocket() {
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }
        
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
        
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }
    
    scheduleReconnect() {
        if (this.reconnectTimeout) {
            return;
        }
        
        this.reconnectTimeout = setTimeout(() => {
            this.reconnectTimeout = null;
            this.connectWebSocket();
        }, this.reconnectDelay);
        
        // 指数退避
        this.reconnectDelay = Math.min(
            this.reconnectDelay * 2,
            this.maxReconnectDelay
        );
    }
    
    async handleWebSocketMessage(message) {
        switch (message.type) {
            case 'task:created':
                await this.handleTaskCreated(message.data);
                break;
            case 'task:updated':
                await this.handleTaskUpdated(message.data);
                break;
            case 'task:deleted':
                await this.handleTaskDeleted(message.data);
                break;
            case 'sync:required':
                await this.sync();
                break;
            case 'pong':
                // 心跳响应
                break;
            default:
                console.warn('Unknown WebSocket message type:', message.type);
        }
    }
    
    async handleTaskCreated(taskData) {
        // 检查是否是本地创建的任务
        const localTask = await this.taskService.storage.get(taskData.id);
        if (!localTask) {
            // 保存到本地
            await this.taskService.storage.set(taskData.id, taskData);
            
            // 触发UI更新
            window.dispatchEvent(new CustomEvent('task:created', { detail: taskData }));
        }
    }
    
    async handleTaskUpdated(taskData) {
        // 更新本地数据
        await this.taskService.storage.set(taskData.id, taskData);
        
        // 触发UI更新
        window.dispatchEvent(new CustomEvent('task:updated', { detail: taskData }));
    }
    
    async handleTaskDeleted(taskId) {
        // 删除本地数据
        await this.taskService.storage.delete(taskId);
        
        // 触发UI更新
        window.dispatchEvent(new CustomEvent('task:deleted', { detail: { id: taskId } }));
    }
    
    sendMessage(type, data) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ type, data }));
        }
    }
}

// src/services/OfflineService.js - 离线服务
export class OfflineService {
    constructor() {
        this.isOnline = navigator.onLine;
        this.listeners = new Set();
        
        window.addEventListener('online', () => this.handleOnline());
        window.addEventListener('offline', () => this.handleOffline());
    }
    
    handleOnline() {
        this.isOnline = true;
        this.notifyListeners({ online: true });
        
        // 显示通知
        this.showNotification('已连接到网络', 'success');
    }
    
    handleOffline() {
        this.isOnline = false;
        this.notifyListeners({ online: false });
        
        // 显示通知
        this.showNotification('已离线，更改将在恢复连接后同步', 'warning');
    }
    
    subscribe(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }
    
    notifyListeners(status) {
        this.listeners.forEach(listener => listener(status));
    }
    
    showNotification(message, type = 'info') {
        // 创建通知元素
        const notification = document.createElement('div');
        notification.className = `notification notification--${type}`;
        notification.textContent = message;
        
        // 添加到页面
        document.body.appendChild(notification);
        
        // 3秒后移除
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
    
    async checkConnectivity() {
        if (!navigator.onLine) {
            return false;
        }
        
        try {
            // 尝试访问API
            const response = await fetch('/api/health', {
                method: 'HEAD',
                mode: 'no-cors'
            });
            return true;
        } catch (error) {
            return false;
        }
    }
}
```