// 离线策略与PWA实现 - Day 17
// 构建可离线使用的渐进式Web应用

console.log('=== 离线策略与PWA实现 ===\n');

// ============================================
// 1. Service Worker 管理器
// ============================================

class ServiceWorkerManager {
    constructor() {
        this.registration = null;
        this.updateFound = false;
    }
    
    // 注册Service Worker
    async register(swPath = '/sw.js', scope = '/') {
        if (!('serviceWorker' in navigator)) {
            console.warn('浏览器不支持Service Worker');
            return null;
        }
        
        try {
            // 注册Service Worker
            this.registration = await navigator.serviceWorker.register(swPath, {
                scope: scope
            });
            
            console.log('Service Worker注册成功:', this.registration);
            
            // 监听更新
            this.setupUpdateHandlers();
            
            // 检查当前状态
            this.checkCurrentState();
            
            return this.registration;
        } catch (error) {
            console.error('Service Worker注册失败:', error);
            throw error;
        }
    }
    
    // 设置更新处理器
    setupUpdateHandlers() {
        this.registration.addEventListener('updatefound', () => {
            console.log('发现Service Worker更新');
            this.updateFound = true;
            
            const newWorker = this.registration.installing;
            
            newWorker.addEventListener('statechange', () => {
                console.log('Service Worker状态变化:', newWorker.state);
                
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    // 新的Service Worker已安装，等待激活
                    this.notifyUserAboutUpdate();
                }
            });
        });
    }
    
    // 检查当前状态
    checkCurrentState() {
        if (this.registration.installing) {
            console.log('Service Worker正在安装');
        } else if (this.registration.waiting) {
            console.log('新的Service Worker等待激活');
            this.notifyUserAboutUpdate();
        } else if (this.registration.active) {
            console.log('Service Worker已激活');
        }
    }
    
    // 通知用户有更新
    notifyUserAboutUpdate() {
        console.log('应用有新版本可用');
        
        // 实际应用中显示更新提示UI
        if (confirm('发现新版本，是否立即更新？')) {
            this.skipWaiting();
        }
    }
    
    // 跳过等待，立即激活
    async skipWaiting() {
        const worker = this.registration.waiting;
        if (!worker) return;
        
        // 发送消息给Service Worker
        worker.postMessage({ type: 'SKIP_WAITING' });
        
        // 监听控制器变化
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            console.log('新的Service Worker已激活，刷新页面');
            window.location.reload();
        });
    }
    
    // 注销Service Worker
    async unregister() {
        if (!this.registration) return;
        
        const success = await this.registration.unregister();
        if (success) {
            console.log('Service Worker已注销');
            this.registration = null;
        }
        return success;
    }
    
    // 清理所有缓存
    async clearAllCaches() {
        const cacheNames = await caches.keys();
        
        await Promise.all(
            cacheNames.map(cacheName => {
                console.log('删除缓存:', cacheName);
                return caches.delete(cacheName);
            })
        );
        
        console.log('所有缓存已清理');
    }
}

// ============================================
// 2. 缓存管理器
// ============================================

class CacheManager {
    constructor(cacheName = 'app-v1') {
        this.cacheName = cacheName;
        this.maxAge = 24 * 60 * 60 * 1000; // 24小时
        this.maxItems = 50; // 最大缓存项数
    }
    
    // 预缓存关键资源
    async precache(urls) {
        const cache = await caches.open(this.cacheName);
        
        console.log('预缓存资源:', urls.length);
        
        // 批量添加，忽略失败的请求
        await Promise.all(
            urls.map(async url => {
                try {
                    const response = await fetch(url);
                    if (response.ok) {
                        await cache.put(url, response);
                        console.log('✓ 缓存成功:', url);
                    }
                } catch (error) {
                    console.warn('✗ 缓存失败:', url, error.message);
                }
            })
        );
    }
    
    // 缓存优先策略
    async cacheFirst(request) {
        const cache = await caches.open(this.cacheName);
        
        // 尝试从缓存获取
        const cachedResponse = await cache.match(request);
        if (cachedResponse) {
            console.log('[Cache First] 从缓存返回:', request.url);
            
            // 后台更新缓存
            this.refreshCache(request);
            
            return cachedResponse;
        }
        
        // 缓存未命中，从网络获取
        console.log('[Cache First] 从网络获取:', request.url);
        const networkResponse = await fetch(request);
        
        // 缓存响应副本
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    }
    
    // 网络优先策略
    async networkFirst(request, timeout = 3000) {
        const cache = await caches.open(this.cacheName);
        
        try {
            // 尝试从网络获取（带超时）
            const networkResponse = await this.fetchWithTimeout(request, timeout);
            
            console.log('[Network First] 从网络返回:', request.url);
            
            // 缓存响应副本
            if (networkResponse.ok) {
                cache.put(request, networkResponse.clone());
            }
            
            return networkResponse;
        } catch (error) {
            // 网络失败，尝试缓存
            console.log('[Network First] 网络失败，尝试缓存:', request.url);
            
            const cachedResponse = await cache.match(request);
            if (cachedResponse) {
                return cachedResponse;
            }
            
            throw error;
        }
    }
    
    // 边缓存边刷新策略
    async staleWhileRevalidate(request) {
        const cache = await caches.open(this.cacheName);
        
        // 立即返回缓存版本
        const cachedResponse = await cache.match(request);
        
        // 同时从网络获取新版本
        const fetchPromise = fetch(request).then(networkResponse => {
            if (networkResponse.ok) {
                cache.put(request, networkResponse.clone());
                console.log('[Stale While Revalidate] 缓存已更新:', request.url);
            }
            return networkResponse;
        });
        
        // 如果有缓存，立即返回；否则等待网络响应
        return cachedResponse || fetchPromise;
    }
    
    // 仅网络策略
    async networkOnly(request) {
        console.log('[Network Only] 仅从网络获取:', request.url);
        return fetch(request);
    }
    
    // 仅缓存策略
    async cacheOnly(request) {
        const cache = await caches.open(this.cacheName);
        const cachedResponse = await cache.match(request);
        
        if (!cachedResponse) {
            throw new Error('缓存未找到: ' + request.url);
        }
        
        console.log('[Cache Only] 仅从缓存返回:', request.url);
        return cachedResponse;
    }
    
    // 带超时的fetch
    fetchWithTimeout(request, timeout) {
        return Promise.race([
            fetch(request),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('请求超时')), timeout)
            )
        ]);
    }
    
    // 后台刷新缓存
    async refreshCache(request) {
        try {
            const cache = await caches.open(this.cacheName);
            const networkResponse = await fetch(request);
            
            if (networkResponse.ok) {
                await cache.put(request, networkResponse);
                console.log('后台缓存更新成功:', request.url);
            }
        } catch (error) {
            // 静默失败，不影响用户体验
        }
    }
    
    // 清理过期缓存
    async cleanupCache() {
        const cache = await caches.open(this.cacheName);
        const requests = await cache.keys();
        const now = Date.now();
        let deleted = 0;
        
        for (const request of requests) {
            const response = await cache.match(request);
            if (!response) continue;
            
            // 检查缓存时间
            const cachedTime = response.headers.get('sw-cached-time');
            if (cachedTime && now - parseInt(cachedTime) > this.maxAge) {
                await cache.delete(request);
                deleted++;
            }
        }
        
        console.log(`清理了 ${deleted} 个过期缓存项`);
        
        // 限制缓存数量
        if (requests.length > this.maxItems) {
            const itemsToDelete = requests.slice(0, requests.length - this.maxItems);
            for (const request of itemsToDelete) {
                await cache.delete(request);
            }
            console.log(`删除了 ${itemsToDelete.length} 个旧缓存项`);
        }
    }
    
    // 获取缓存统计
    async getCacheStats() {
        const cache = await caches.open(this.cacheName);
        const requests = await cache.keys();
        let totalSize = 0;
        
        for (const request of requests) {
            const response = await cache.match(request);
            if (response) {
                const blob = await response.blob();
                totalSize += blob.size;
            }
        }
        
        return {
            count: requests.length,
            size: (totalSize / 1024 / 1024).toFixed(2) + ' MB',
            urls: requests.map(r => r.url)
        };
    }
}

// ============================================
// 3. 离线同步管理器
// ============================================

class OfflineSync {
    constructor() {
        this.queue = [];
        this.syncTag = 'offline-sync';
        this.db = null;
        this.initDB();
    }
    
    // 初始化IndexedDB存储队列
    async initDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('OfflineSyncDB', 1);
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('requests')) {
                    const store = db.createObjectStore('requests', { 
                        keyPath: 'id', 
                        autoIncrement: true 
                    });
                    store.createIndex('timestamp', 'timestamp', { unique: false });
                }
            };
            
            request.onsuccess = (event) => {
                this.db = event.target.result;
                resolve();
            };
            
            request.onerror = () => reject(request.error);
        });
    }
    
    // 添加请求到队列
    async queueRequest(request) {
        const requestData = {
            url: request.url,
            method: request.method,
            headers: Object.fromEntries(request.headers.entries()),
            body: await this.serializeBody(request),
            timestamp: Date.now()
        };
        
        // 保存到IndexedDB
        const transaction = this.db.transaction(['requests'], 'readwrite');
        const store = transaction.objectStore('requests');
        
        return new Promise((resolve, reject) => {
            const addRequest = store.add(requestData);
            
            addRequest.onsuccess = () => {
                console.log('请求已加入离线队列:', requestData.url);
                
                // 注册后台同步
                if ('sync' in self.registration) {
                    self.registration.sync.register(this.syncTag);
                }
                
                resolve(addRequest.result);
            };
            
            addRequest.onerror = () => reject(addRequest.error);
        });
    }
    
    // 序列化请求体
    async serializeBody(request) {
        if (!request.body) return null;
        
        try {
            const clonedRequest = request.clone();
            const formData = await clonedRequest.formData();
            
            // 转换FormData为普通对象
            const body = {};
            for (const [key, value] of formData.entries()) {
                if (value instanceof File) {
                    // 处理文件上传
                    body[key] = {
                        type: 'file',
                        name: value.name,
                        size: value.size,
                        lastModified: value.lastModified
                    };
                } else {
                    body[key] = value;
                }
            }
            
            return JSON.stringify(body);
        } catch (error) {
            // 尝试其他格式
            try {
                const clonedRequest = request.clone();
                return await clonedRequest.text();
            } catch (e) {
                return null;
            }
        }
    }
    
    // 执行同步
    async sync() {
        console.log('开始执行离线同步...');
        
        const transaction = this.db.transaction(['requests'], 'readonly');
        const store = transaction.objectStore('requests');
        const getAllRequest = store.getAll();
        
        return new Promise((resolve, reject) => {
            getAllRequest.onsuccess = async () => {
                const requests = getAllRequest.result;
                console.log(`发现 ${requests.length} 个待同步请求`);
                
                const results = {
                    success: 0,
                    failed: 0,
                    errors: []
                };
                
                for (const requestData of requests) {
                    try {
                        // 重建请求
                        const init = {
                            method: requestData.method,
                            headers: requestData.headers
                        };
                        
                        if (requestData.body && requestData.method !== 'GET') {
                            init.body = requestData.body;
                        }
                        
                        const response = await fetch(requestData.url, init);
                        
                        if (response.ok) {
                            // 成功，从队列删除
                            await this.removeFromQueue(requestData.id);
                            results.success++;
                            console.log('✓ 同步成功:', requestData.url);
                        } else {
                            results.failed++;
                            results.errors.push({
                                url: requestData.url,
                                status: response.status
                            });
                            console.warn('✗ 同步失败:', requestData.url, response.status);
                        }
                    } catch (error) {
                        results.failed++;
                        results.errors.push({
                            url: requestData.url,
                            error: error.message
                        });
                        console.error('✗ 同步错误:', requestData.url, error);
                    }
                }
                
                console.log('离线同步完成:', results);
                resolve(results);
            };
            
            getAllRequest.onerror = () => reject(getAllRequest.error);
        });
    }
    
    // 从队列删除
    async removeFromQueue(id) {
        const transaction = this.db.transaction(['requests'], 'readwrite');
        const store = transaction.objectStore('requests');
        store.delete(id);
    }
    
    // 获取队列状态
    async getQueueStatus() {
        const transaction = this.db.transaction(['requests'], 'readonly');
        const store = transaction.objectStore('requests');
        const countRequest = store.count();
        
        return new Promise((resolve, reject) => {
            countRequest.onsuccess = () => {
                resolve({
                    count: countRequest.result,
                    hasItems: countRequest.result > 0
                });
            };
            
            countRequest.onerror = () => reject(countRequest.error);
        });
    }
}

// ============================================
// 4. 网络状态监控
// ============================================

class NetworkStatus {
    constructor() {
        this.online = navigator.onLine;
        this.connectionType = this.getConnectionType();
        this.listeners = new Map();
        this.setupEventListeners();
    }
    
    // 获取连接类型
    getConnectionType() {
        const connection = navigator.connection || 
                         navigator.mozConnection || 
                         navigator.webkitConnection;
        
        if (!connection) return 'unknown';
        
        return {
            type: connection.effectiveType || connection.type,
            downlink: connection.downlink,
            rtt: connection.rtt,
            saveData: connection.saveData || false
        };
    }
    
    // 设置事件监听
    setupEventListeners() {
        // 在线/离线事件
        window.addEventListener('online', () => {
            this.online = true;
            this.notifyListeners('online');
            console.log('✓ 网络已连接');
        });
        
        window.addEventListener('offline', () => {
            this.online = false;
            this.notifyListeners('offline');
            console.log('✗ 网络已断开');
        });
        
        // 连接变化事件
        if ('connection' in navigator) {
            navigator.connection.addEventListener('change', () => {
                const oldType = this.connectionType;
                this.connectionType = this.getConnectionType();
                
                console.log('网络类型变化:', oldType, '→', this.connectionType);
                this.notifyListeners('connectionChange', this.connectionType);
            });
        }
    }
    
    // 添加监听器
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event).add(callback);
    }
    
    // 移除监听器
    off(event, callback) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).delete(callback);
        }
    }
    
    // 通知监听器
    notifyListeners(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(callback => {
                callback(data);
            });
        }
    }
    
    // 检查是否应该下载
    shouldDownload() {
        if (!this.online) return false;
        
        const connection = this.connectionType;
        
        // 用户开启了流量节省模式
        if (connection.saveData) return false;
        
        // 慢速连接
        if (connection.type === 'slow-2g' || connection.type === '2g') {
            return false;
        }
        
        // 高延迟
        if (connection.rtt > 500) return false;
        
        return true;
    }
    
    // 获取网络质量评分
    getNetworkQuality() {
        if (!this.online) return 0;
        
        const connection = this.connectionType;
        
        switch (connection.type) {
            case '4g': return 100;
            case '3g': return 70;
            case '2g': return 30;
            case 'slow-2g': return 10;
            default: return 50;
        }
    }
    
    // 自适应内容策略
    getContentStrategy() {
        const quality = this.getNetworkQuality();
        
        if (quality >= 70) {
            return {
                images: 'high',
                videos: 'auto',
                prefetch: true
            };
        } else if (quality >= 30) {
            return {
                images: 'medium',
                videos: 'thumbnail',
                prefetch: false
            };
        } else {
            return {
                images: 'low',
                videos: 'none',
                prefetch: false
            };
        }
    }
}

// ============================================
// 5. PWA安装管理器
// ============================================

class PWAInstaller {
    constructor() {
        this.deferredPrompt = null;
        this.isInstalled = this.checkIfInstalled();
        this.setupEventListeners();
    }
    
    // 检查是否已安装
    checkIfInstalled() {
        // 检查是否在独立模式运行
        if (window.matchMedia('(display-mode: standalone)').matches) {
            return true;
        }
        
        // iOS检查
        if (window.navigator.standalone === true) {
            return true;
        }
        
        return false;
    }
    
    // 设置事件监听
    setupEventListeners() {
        // 监听安装提示事件
        window.addEventListener('beforeinstallprompt', (e) => {
            // 阻止默认安装提示
            e.preventDefault();
            
            // 保存事件供后续使用
            this.deferredPrompt = e;
            
            console.log('PWA可以安装');
            this.showInstallButton();
        });
        
        // 监听安装成功
        window.addEventListener('appinstalled', () => {
            console.log('PWA安装成功');
            this.isInstalled = true;
            this.hideInstallButton();
        });
    }
    
    // 显示安装按钮
    showInstallButton() {
        // 实际应用中显示自定义安装UI
        console.log('显示安装按钮');
        
        // 示例：创建安装横幅
        const banner = document.createElement('div');
        banner.id = 'pwa-install-banner';
        banner.innerHTML = `
            <div style="position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); 
                        background: #4CAF50; color: white; padding: 15px 30px; 
                        border-radius: 5px; box-shadow: 0 2px 10px rgba(0,0,0,0.2);
                        display: flex; align-items: center; gap: 10px; z-index: 1000;">
                <span>安装应用以获得更好体验</span>
                <button onclick="pwaInstaller.install()" 
                        style="background: white; color: #4CAF50; border: none; 
                               padding: 5px 15px; border-radius: 3px; cursor: pointer;">
                    安装
                </button>
                <button onclick="this.parentElement.remove()" 
                        style="background: transparent; color: white; border: 1px solid white; 
                               padding: 5px 15px; border-radius: 3px; cursor: pointer;">
                    稍后
                </button>
            </div>
        `;
        
        document.body.appendChild(banner);
    }
    
    // 隐藏安装按钮
    hideInstallButton() {
        const banner = document.getElementById('pwa-install-banner');
        if (banner) {
            banner.remove();
        }
    }
    
    // 触发安装
    async install() {
        if (!this.deferredPrompt) {
            console.log('安装提示不可用');
            return false;
        }
        
        // 显示安装提示
        this.deferredPrompt.prompt();
        
        // 等待用户响应
        const { outcome } = await this.deferredPrompt.userChoice;
        
        console.log(`用户选择: ${outcome}`);
        
        // 清理
        this.deferredPrompt = null;
        
        return outcome === 'accepted';
    }
    
    // 获取安装说明
    getInstallInstructions() {
        const ua = navigator.userAgent.toLowerCase();
        
        if (/iphone|ipad|ipod/.test(ua)) {
            return {
                platform: 'iOS',
                steps: [
                    '点击Safari浏览器底部的分享按钮',
                    '向下滑动并点击"添加到主屏幕"',
                    '点击右上角的"添加"'
                ]
            };
        } else if (/android/.test(ua)) {
            if (/chrome/.test(ua)) {
                return {
                    platform: 'Android Chrome',
                    steps: [
                        '点击浏览器右上角的菜单按钮（三个点）',
                        '选择"添加到主屏幕"',
                        '输入应用名称并点击"添加"'
                    ]
                };
            }
        } else if (/windows/.test(ua)) {
            return {
                platform: 'Windows',
                steps: [
                    '点击地址栏右侧的安装按钮',
                    '或者点击浏览器菜单中的"安装应用"'
                ]
            };
        }
        
        return {
            platform: 'Desktop',
            steps: [
                '点击地址栏右侧的安装按钮',
                '或者使用浏览器菜单中的安装选项'
            ]
        };
    }
}

// ============================================
// 6. Service Worker 模板
// ============================================

const serviceWorkerTemplate = `
// Service Worker - 处理离线功能

const CACHE_NAME = 'app-v1';
const urlsToCache = [
    '/',
    '/styles/main.css',
    '/scripts/main.js',
    '/offline.html'
];

// 安装事件 - 预缓存资源
self.addEventListener('install', event => {
    console.log('[SW] 安装中...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[SW] 预缓存资源');
                return cache.addAll(urlsToCache);
            })
            .then(() => self.skipWaiting())
    );
});

// 激活事件 - 清理旧缓存
self.addEventListener('activate', event => {
    console.log('[SW] 激活中...');
    
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[SW] 删除旧缓存:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// 获取事件 - 处理请求
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);
    
    // 只处理同源请求
    if (url.origin !== location.origin) {
        return;
    }
    
    // 根据资源类型选择策略
    if (request.destination === 'image') {
        // 图片使用缓存优先
        event.respondWith(cacheFirst(request));
    } else if (request.mode === 'navigate') {
        // 导航请求使用网络优先
        event.respondWith(networkFirst(request));
    } else {
        // 其他资源使用缓存优先
        event.respondWith(cacheFirst(request));
    }
});

// 缓存优先策略
async function cacheFirst(request) {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);
    
    if (cached) {
        return cached;
    }
    
    try {
        const response = await fetch(request);
        if (response.ok) {
            cache.put(request, response.clone());
        }
        return response;
    } catch (error) {
        // 返回离线页面
        return caches.match('/offline.html');
    }
}

// 网络优先策略
async function networkFirst(request) {
    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, response.clone());
        }
        return response;
    } catch (error) {
        const cached = await caches.match(request);
        return cached || caches.match('/offline.html');
    }
}

// 后台同步
self.addEventListener('sync', event => {
    console.log('[SW] 后台同步:', event.tag);
    
    if (event.tag === 'offline-sync') {
        event.waitUntil(syncOfflineRequests());
    }
});

// 推送通知
self.addEventListener('push', event => {
    console.log('[SW] 收到推送通知');
    
    const options = {
        body: event.data ? event.data.text() : '有新的更新',
        icon: '/images/icon-192.png',
        badge: '/images/badge-72.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        }
    };
    
    event.waitUntil(
        self.registration.showNotification('应用通知', options)
    );
});

// 通知点击
self.addEventListener('notificationclick', event => {
    console.log('[SW] 通知被点击');
    
    event.notification.close();
    
    event.waitUntil(
        clients.openWindow('/')
    );
});

// 消息处理
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
`;

// ============================================
// 7. 实际应用示例
// ============================================

class OfflineNewsApp {
    constructor() {
        this.swManager = new ServiceWorkerManager();
        this.cacheManager = new CacheManager('news-v1');
        this.offlineSync = new OfflineSync();
        this.networkStatus = new NetworkStatus();
        this.pwaInstaller = new PWAInstaller();
        
        this.init();
    }
    
    async init() {
        console.log('\n=== 离线新闻应用示例 ===\n');
        
        // 1. 注册Service Worker
        await this.registerServiceWorker();
        
        // 2. 预缓存关键资源
        await this.precacheResources();
        
        // 3. 设置网络监听
        this.setupNetworkListeners();
        
        // 4. 初始化UI
        this.initializeUI();
    }
    
    async registerServiceWorker() {
        // 创建Service Worker文件
        const blob = new Blob([serviceWorkerTemplate], { 
            type: 'application/javascript' 
        });
        const swUrl = URL.createObjectURL(blob);
        
        // 注册（实际应用中使用真实文件路径）
        console.log('注册Service Worker...');
        // await this.swManager.register(swUrl);
    }
    
    async precacheResources() {
        const criticalResources = [
            '/',
            '/index.html',
            '/styles/app.css',
            '/scripts/app.js',
            '/offline.html',
            '/images/logo.png'
        ];
        
        console.log('预缓存关键资源...');
        // await this.cacheManager.precache(criticalResources);
    }
    
    setupNetworkListeners() {
        // 网络状态变化
        this.networkStatus.on('online', () => {
            console.log('应用已上线，开始同步...');
            this.syncOfflineData();
            this.updateUI('online');
        });
        
        this.networkStatus.on('offline', () => {
            console.log('应用已离线');
            this.updateUI('offline');
        });
        
        // 连接类型变化
        this.networkStatus.on('connectionChange', (connection) => {
            console.log('连接类型变化:', connection);
            this.adjustContentQuality();
        });
    }
    
    async syncOfflineData() {
        // 同步离线队列中的请求
        const status = await this.offlineSync.getQueueStatus();
        
        if (status.hasItems) {
            console.log(`同步 ${status.count} 个离线请求...`);
            const results = await this.offlineSync.sync();
            console.log('同步结果:', results);
        }
    }
    
    adjustContentQuality() {
        const strategy = this.networkStatus.getContentStrategy();
        console.log('内容策略调整:', strategy);
        
        // 根据网络质量调整图片质量
        document.querySelectorAll('img[data-src-high]').forEach(img => {
            switch (strategy.images) {
                case 'high':
                    img.src = img.dataset.srcHigh;
                    break;
                case 'medium':
                    img.src = img.dataset.srcMedium || img.dataset.srcHigh;
                    break;
                case 'low':
                    img.src = img.dataset.srcLow || img.dataset.srcMedium;
                    break;
            }
        });
    }
    
    updateUI(status) {
        // 更新UI显示网络状态
        const indicator = document.getElementById('network-indicator');
        if (indicator) {
            indicator.className = status;
            indicator.textContent = status === 'online' ? '在线' : '离线';
        }
    }
    
    initializeUI() {
        console.log('初始化离线UI...');
        
        // 创建网络状态指示器
        const indicator = document.createElement('div');
        indicator.id = 'network-indicator';
        indicator.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            z-index: 1000;
            transition: all 0.3s ease;
        `;
        
        // 设置初始状态
        if (this.networkStatus.online) {
            indicator.className = 'online';
            indicator.textContent = '在线';
            indicator.style.background = '#4CAF50';
            indicator.style.color = 'white';
        } else {
            indicator.className = 'offline';
            indicator.textContent = '离线';
            indicator.style.background = '#f44336';
            indicator.style.color = 'white';
        }
        
        document.body.appendChild(indicator);
    }
    
    // 获取文章（演示不同缓存策略）
    async getArticle(articleId, strategy = 'networkFirst') {
        const request = new Request(`/api/articles/${articleId}`);
        
        try {
            let response;
            
            switch (strategy) {
                case 'cacheFirst':
                    response = await this.cacheManager.cacheFirst(request);
                    break;
                case 'networkFirst':
                    response = await this.cacheManager.networkFirst(request);
                    break;
                case 'staleWhileRevalidate':
                    response = await this.cacheManager.staleWhileRevalidate(request);
                    break;
                default:
                    response = await fetch(request);
            }
            
            return await response.json();
        } catch (error) {
            console.error('获取文章失败:', error);
            
            // 返回离线占位内容
            return {
                id: articleId,
                title: '离线内容',
                content: '当前处于离线状态，无法获取最新内容。',
                offline: true
            };
        }
    }
    
    // 保存离线阅读
    async saveForOffline(articleId) {
        const article = await this.getArticle(articleId);
        
        // 缓存文章内容
        const cache = await caches.open('offline-articles');
        const response = new Response(JSON.stringify(article));
        await cache.put(`/offline/articles/${articleId}`, response);
        
        console.log('文章已保存供离线阅读:', articleId);
        
        // 显示通知
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('离线保存成功', {
                body: `文章"${article.title}"已保存`,
                icon: '/images/icon-192.png'
            });
        }
    }
    
    // 提交评论（支持离线）
    async submitComment(articleId, comment) {
        const request = new Request('/api/comments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                articleId,
                comment,
                timestamp: Date.now()
            })
        });
        
        if (!this.networkStatus.online) {
            // 离线时加入队列
            await this.offlineSync.queueRequest(request);
            
            console.log('评论已加入离线队列，将在恢复连接后提交');
            
            return {
                queued: true,
                message: '评论将在恢复网络连接后自动提交'
            };
        }
        
        // 在线时直接提交
        try {
            const response = await fetch(request);
            return await response.json();
        } catch (error) {
            // 网络错误，加入离线队列
            await this.offlineSync.queueRequest(request);
            throw error;
        }
    }
}

// ============================================
// 8. Web App Manifest 生成器
// ============================================

class ManifestGenerator {
    static generate(config) {
        const manifest = {
            name: config.name || 'My Progressive Web App',
            short_name: config.shortName || config.name || 'My PWA',
            description: config.description || 'A progressive web application',
            start_url: config.startUrl || '/',
            display: config.display || 'standalone',
            background_color: config.backgroundColor || '#ffffff',
            theme_color: config.themeColor || '#000000',
            orientation: config.orientation || 'portrait',
            icons: config.icons || [
                {
                    src: '/images/icon-192.png',
                    sizes: '192x192',
                    type: 'image/png',
                    purpose: 'any maskable'
                },
                {
                    src: '/images/icon-512.png',
                    sizes: '512x512',
                    type: 'image/png',
                    purpose: 'any maskable'
                }
            ],
            screenshots: config.screenshots || [],
            categories: config.categories || ['productivity'],
            lang: config.lang || 'zh-CN',
            dir: config.dir || 'ltr',
            prefer_related_applications: false,
            related_applications: config.relatedApps || []
        };
        
        // 可选功能
        if (config.shortcuts) {
            manifest.shortcuts = config.shortcuts;
        }
        
        if (config.share_target) {
            manifest.share_target = config.share_target;
        }
        
        return manifest;
    }
    
    static inject(manifest) {
        // 创建manifest链接
        const link = document.createElement('link');
        link.rel = 'manifest';
        
        // 创建Blob URL
        const blob = new Blob([JSON.stringify(manifest, null, 2)], {
            type: 'application/manifest+json'
        });
        link.href = URL.createObjectURL(blob);
        
        document.head.appendChild(link);
        
        console.log('Web App Manifest已注入');
    }
}

// ============================================
// 9. 运行演示
// ============================================

// 创建全局实例供演示使用
let pwaInstaller, offlineNewsApp;

async function demonstrateOfflineStrategies() {
    console.log('开始离线策略演示...\n');
    
    // 1. 检查浏览器支持
    console.log('1. 浏览器功能检查:');
    console.log('Service Worker:', 'serviceWorker' in navigator ? '✓' : '✗');
    console.log('Cache API:', 'caches' in window ? '✓' : '✗');
    console.log('IndexedDB:', 'indexedDB' in window ? '✓' : '✗');
    console.log('Background Sync:', 'sync' in ServiceWorkerRegistration.prototype ? '✓' : '✗');
    console.log('Push API:', 'PushManager' in window ? '✓' : '✗');
    
    // 2. 生成并注入Manifest
    console.log('\n2. 生成Web App Manifest:');
    const manifest = ManifestGenerator.generate({
        name: '离线新闻阅读器',
        shortName: '新闻',
        description: '支持离线阅读的新闻应用',
        themeColor: '#2196F3',
        backgroundColor: '#ffffff',
        display: 'standalone',
        categories: ['news', 'magazines']
    });
    console.log('Manifest配置:', manifest);
    ManifestGenerator.inject(manifest);
    
    // 3. 网络状态监控
    console.log('\n3. 网络状态:');
    const networkStatus = new NetworkStatus();
    console.log('当前状态:', networkStatus.online ? '在线' : '离线');
    console.log('连接类型:', networkStatus.connectionType);
    console.log('内容策略:', networkStatus.getContentStrategy());
    
    // 4. PWA安装检测
    console.log('\n4. PWA安装状态:');
    pwaInstaller = new PWAInstaller();
    console.log('已安装:', pwaInstaller.isInstalled);
    console.log('安装说明:', pwaInstaller.getInstallInstructions());
    
    // 5. 缓存管理演示
    console.log('\n5. 缓存策略演示:');
    const cacheManager = new CacheManager('demo-v1');
    
    // 模拟不同策略的请求
    console.log('\n测试不同缓存策略的响应时间...');
    
    // 注意：以下是模拟代码，实际环境中需要真实的Service Worker
    console.log('- Cache First: 优先返回缓存，适合静态资源');
    console.log('- Network First: 优先网络，适合API请求');
    console.log('- Stale While Revalidate: 返回缓存同时更新，平衡体验');
    
    // 6. 创建离线应用实例
    console.log('\n6. 初始化离线新闻应用...');
    offlineNewsApp = new OfflineNewsApp();
    
    // 7. 离线同步演示
    console.log('\n7. 离线同步队列:');
    const offlineSync = new OfflineSync();
    setTimeout(async () => {
        const status = await offlineSync.getQueueStatus();
        console.log('队列状态:', status);
    }, 1000);
    
    console.log('\n演示完成！');
    console.log('提示：');
    console.log('- 打开开发者工具 > Application 查看Service Worker状态');
    console.log('- 切换网络状态查看离线功能');
    console.log('- 在控制台输入 pwaInstaller.install() 触发安装');
}

// 自动运行演示
console.log('离线策略与PWA实现模块已加载');
console.log('运行 demonstrateOfflineStrategies() 查看完整演示');

// 导出供外部使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ServiceWorkerManager,
        CacheManager,
        OfflineSync,
        NetworkStatus,
        PWAInstaller,
        ManifestGenerator,
        OfflineNewsApp
    };
}