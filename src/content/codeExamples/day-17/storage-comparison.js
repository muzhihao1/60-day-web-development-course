// Web存储技术对比 - Day 17

// ============================================
// 1. 存储能力测试
// ============================================

console.log('=== Web存储技术对比 ===\n');

// 存储大小测试工具
class StorageSizeTest {
    // 测试存储容量
    static async testCapacity(storageType) {
        console.log(`\n测试 ${storageType} 存储容量...`);
        
        const testData = 'a'.repeat(1024); // 1KB数据
        let totalSize = 0;
        
        try {
            switch (storageType) {
                case 'localStorage':
                    return this.testLocalStorageCapacity(testData);
                case 'sessionStorage':
                    return this.testSessionStorageCapacity(testData);
                case 'cookie':
                    return this.testCookieCapacity(testData);
                case 'IndexedDB':
                    return await this.testIndexedDBCapacity(testData);
            }
        } catch (error) {
            console.error(`${storageType} 容量测试失败:`, error);
            return totalSize;
        }
    }
    
    static testLocalStorageCapacity(testData) {
        localStorage.clear();
        let count = 0;
        
        try {
            while (true) {
                localStorage.setItem(`test_${count}`, testData);
                count++;
            }
        } catch (e) {
            const totalMB = (count * testData.length / 1024 / 1024).toFixed(2);
            console.log(`localStorage 最大容量约: ${totalMB} MB`);
            localStorage.clear();
            return totalMB;
        }
    }
    
    static testSessionStorageCapacity(testData) {
        sessionStorage.clear();
        let count = 0;
        
        try {
            while (true) {
                sessionStorage.setItem(`test_${count}`, testData);
                count++;
            }
        } catch (e) {
            const totalMB = (count * testData.length / 1024 / 1024).toFixed(2);
            console.log(`sessionStorage 最大容量约: ${totalMB} MB`);
            sessionStorage.clear();
            return totalMB;
        }
    }
    
    static testCookieCapacity(testData) {
        // Cookie单个最大4KB，测试总容量
        let count = 0;
        const maxCookieSize = 4096;
        const cookieData = testData.substring(0, maxCookieSize - 100); // 留出空间给名称等
        
        try {
            while (count < 50) { // 限制测试数量
                document.cookie = `test_${count}=${cookieData}; path=/`;
                count++;
            }
        } catch (e) {
            console.log(`Cookie 数量限制约: ${count} 个`);
        }
        
        // 清理测试cookie
        for (let i = 0; i < count; i++) {
            document.cookie = `test_${i}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
        }
        
        return count;
    }
    
    static async testIndexedDBCapacity(testData) {
        const dbName = 'CapacityTestDB';
        const db = await this.openTestDB(dbName);
        let totalSize = 0;
        
        try {
            const transaction = db.transaction(['test'], 'readwrite');
            const store = transaction.objectStore('test');
            
            // IndexedDB通常有很大容量，只测试100MB
            for (let i = 0; i < 100; i++) {
                await store.add({
                    id: i,
                    data: testData.repeat(1024) // 1MB per record
                });
                totalSize += 1;
            }
            
            console.log(`IndexedDB 测试存储: ${totalSize} MB (实际容量更大)`);
        } catch (e) {
            console.log(`IndexedDB 存储失败于: ${totalSize} MB`);
        }
        
        // 清理测试数据库
        db.close();
        await indexedDB.deleteDatabase(dbName);
        
        return totalSize;
    }
    
    static openTestDB(name) {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(name, 1);
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('test')) {
                    db.createObjectStore('test', { keyPath: 'id' });
                }
            };
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
}

// ============================================
// 2. 性能对比测试
// ============================================

class PerformanceTest {
    static async runAllTests() {
        console.log('\n=== 性能对比测试 ===');
        
        const testData = {
            id: 1,
            name: 'Test User',
            email: 'test@example.com',
            preferences: {
                theme: 'dark',
                language: 'zh-CN',
                notifications: true
            },
            data: new Array(100).fill('test data')
        };
        
        // 测试各种存储方式
        await this.testLocalStorage(testData);
        await this.testSessionStorage(testData);
        await this.testCookie(testData);
        await this.testIndexedDB(testData);
    }
    
    static async testLocalStorage(data) {
        const iterations = 1000;
        const serialized = JSON.stringify(data);
        
        // 写入性能
        console.time('localStorage 写入');
        for (let i = 0; i < iterations; i++) {
            localStorage.setItem(`perf_test_${i}`, serialized);
        }
        console.timeEnd('localStorage 写入');
        
        // 读取性能
        console.time('localStorage 读取');
        for (let i = 0; i < iterations; i++) {
            const item = localStorage.getItem(`perf_test_${i}`);
            JSON.parse(item);
        }
        console.timeEnd('localStorage 读取');
        
        // 清理
        for (let i = 0; i < iterations; i++) {
            localStorage.removeItem(`perf_test_${i}`);
        }
    }
    
    static async testSessionStorage(data) {
        const iterations = 1000;
        const serialized = JSON.stringify(data);
        
        console.time('sessionStorage 写入');
        for (let i = 0; i < iterations; i++) {
            sessionStorage.setItem(`perf_test_${i}`, serialized);
        }
        console.timeEnd('sessionStorage 写入');
        
        console.time('sessionStorage 读取');
        for (let i = 0; i < iterations; i++) {
            const item = sessionStorage.getItem(`perf_test_${i}`);
            JSON.parse(item);
        }
        console.timeEnd('sessionStorage 读取');
        
        sessionStorage.clear();
    }
    
    static async testCookie(data) {
        const iterations = 50; // Cookie数量有限
        // Cookie大小限制，只存储简单数据
        const simpleData = JSON.stringify({ id: data.id, name: data.name });
        
        console.time('Cookie 写入');
        for (let i = 0; i < iterations; i++) {
            document.cookie = `perf_test_${i}=${encodeURIComponent(simpleData)}; path=/`;
        }
        console.timeEnd('Cookie 写入');
        
        console.time('Cookie 读取');
        for (let i = 0; i < iterations; i++) {
            const cookies = document.cookie.split(';');
            const cookie = cookies.find(c => c.trim().startsWith(`perf_test_${i}=`));
            if (cookie) {
                const value = decodeURIComponent(cookie.split('=')[1]);
                JSON.parse(value);
            }
        }
        console.timeEnd('Cookie 读取');
        
        // 清理
        for (let i = 0; i < iterations; i++) {
            document.cookie = `perf_test_${i}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
        }
    }
    
    static async testIndexedDB(data) {
        const dbName = 'PerfTestDB';
        const db = await this.openDB(dbName);
        const iterations = 1000;
        
        console.time('IndexedDB 写入');
        const writeTransaction = db.transaction(['data'], 'readwrite');
        const writeStore = writeTransaction.objectStore('data');
        
        for (let i = 0; i < iterations; i++) {
            await writeStore.add({ ...data, id: i });
        }
        console.timeEnd('IndexedDB 写入');
        
        console.time('IndexedDB 读取');
        const readTransaction = db.transaction(['data'], 'readonly');
        const readStore = readTransaction.objectStore('data');
        
        for (let i = 0; i < iterations; i++) {
            await readStore.get(i);
        }
        console.timeEnd('IndexedDB 读取');
        
        // 清理
        db.close();
        await indexedDB.deleteDatabase(dbName);
    }
    
    static openDB(name) {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(name, 1);
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('data')) {
                    db.createObjectStore('data', { keyPath: 'id' });
                }
            };
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
}

// ============================================
// 3. 功能对比实现
// ============================================

class StorageComparison {
    static compareFeatures() {
        console.log('\n=== 功能特性对比 ===\n');
        
        // 数据持久性测试
        this.testPersistence();
        
        // 作用域测试
        this.testScope();
        
        // 数据类型支持
        this.testDataTypes();
        
        // 同步/异步特性
        this.testSyncAsync();
    }
    
    static testPersistence() {
        console.log('持久性测试:');
        
        // localStorage - 永久存储
        localStorage.setItem('persistent_test', '永久保存的数据');
        console.log('✓ localStorage: 数据永久保存，除非手动删除');
        
        // sessionStorage - 会话存储
        sessionStorage.setItem('session_test', '会话期间的数据');
        console.log('✓ sessionStorage: 数据仅在会话期间有效');
        
        // Cookie - 可设置过期时间
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 7);
        document.cookie = `cookie_test=可设置过期时间; expires=${expiryDate.toUTCString()}`;
        console.log('✓ Cookie: 可设置具体过期时间');
        
        // IndexedDB - 永久存储
        console.log('✓ IndexedDB: 数据永久保存，支持版本管理');
    }
    
    static testScope() {
        console.log('\n作用域测试:');
        
        // 同源策略
        console.log('✓ localStorage/sessionStorage: 严格同源（协议+域名+端口）');
        console.log('✓ Cookie: 可设置domain和path控制作用域');
        console.log('✓ IndexedDB: 严格同源策略');
        
        // 标签页共享
        console.log('\n跨标签页共享:');
        console.log('✓ localStorage: 同源标签页共享');
        console.log('✗ sessionStorage: 仅当前标签页');
        console.log('✓ Cookie: 同源共享');
        console.log('✓ IndexedDB: 同源共享');
    }
    
    static testDataTypes() {
        console.log('\n数据类型支持:');
        
        const testData = {
            string: 'Hello',
            number: 42,
            boolean: true,
            array: [1, 2, 3],
            object: { name: 'Test' },
            date: new Date(),
            regexp: /test/gi,
            func: function() { return 'test'; },
            undefined: undefined,
            null: null,
            blob: new Blob(['test'], { type: 'text/plain' })
        };
        
        // localStorage/sessionStorage
        console.log('\nlocalStorage/sessionStorage:');
        const stored = JSON.stringify(testData);
        const parsed = JSON.parse(stored);
        console.log('✓ 支持: 字符串、数字、布尔、数组、对象');
        console.log('✗ 不支持: 函数、undefined、Blob等');
        console.log('✗ 日期需要特殊处理');
        
        // Cookie
        console.log('\nCookie:');
        console.log('✓ 仅支持字符串');
        console.log('✗ 需要序列化其他类型');
        
        // IndexedDB
        console.log('\nIndexedDB:');
        console.log('✓ 支持: 几乎所有JavaScript类型');
        console.log('✓ 包括: Blob、File、ArrayBuffer等');
        console.log('✓ 支持索引和查询');
    }
    
    static testSyncAsync() {
        console.log('\n同步/异步特性:');
        
        // 同步操作
        console.log('\n同步操作:');
        console.time('localStorage同步操作');
        localStorage.setItem('sync_test', 'data');
        localStorage.getItem('sync_test');
        console.timeEnd('localStorage同步操作');
        console.log('✗ localStorage/sessionStorage/Cookie: 同步操作，可能阻塞');
        
        // 异步操作
        console.log('\n异步操作:');
        console.log('✓ IndexedDB: 完全异步，不阻塞主线程');
    }
}

// ============================================
// 4. 实际应用场景示例
// ============================================

class UseCaseExamples {
    static demonstrateUseCases() {
        console.log('\n=== 实际应用场景 ===\n');
        
        // 用户偏好设置
        this.userPreferences();
        
        // 表单数据暂存
        this.formDraft();
        
        // 购物车功能
        this.shoppingCart();
        
        // 离线数据缓存
        this.offlineCache();
    }
    
    static userPreferences() {
        console.log('1. 用户偏好设置:');
        
        // 使用localStorage保存长期偏好
        const preferences = {
            theme: 'dark',
            language: 'zh-CN',
            fontSize: 16,
            autoSave: true
        };
        
        localStorage.setItem('user_preferences', JSON.stringify(preferences));
        console.log('✓ 使用localStorage保存用户偏好（永久保存）');
        
        // 读取并应用
        const saved = JSON.parse(localStorage.getItem('user_preferences') || '{}');
        console.log('已保存的偏好:', saved);
    }
    
    static formDraft() {
        console.log('\n2. 表单自动保存:');
        
        // 使用sessionStorage保存表单草稿
        const formData = {
            title: '未完成的文章',
            content: '这是自动保存的内容...',
            savedAt: new Date().toISOString()
        };
        
        sessionStorage.setItem('form_draft', JSON.stringify(formData));
        console.log('✓ 使用sessionStorage保存表单草稿（防止意外丢失）');
        
        // 恢复草稿
        const draft = JSON.parse(sessionStorage.getItem('form_draft') || '{}');
        console.log('恢复的草稿:', draft);
    }
    
    static shoppingCart() {
        console.log('\n3. 购物车数据:');
        
        // 使用localStorage保存购物车
        const cartItems = [
            { id: 1, name: '商品A', price: 99, quantity: 2 },
            { id: 2, name: '商品B', price: 199, quantity: 1 }
        ];
        
        // 保存购物车
        localStorage.setItem('shopping_cart', JSON.stringify(cartItems));
        
        // 计算总价
        const cart = JSON.parse(localStorage.getItem('shopping_cart') || '[]');
        const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        console.log(`✓ 购物车商品数: ${cart.length}, 总价: ¥${total}`);
        
        // 跨页面同步
        window.addEventListener('storage', (e) => {
            if (e.key === 'shopping_cart') {
                console.log('购物车在其他页面被更新');
            }
        });
    }
    
    static async offlineCache() {
        console.log('\n4. 离线数据缓存:');
        
        // 模拟API数据
        const apiData = {
            users: [
                { id: 1, name: '张三', role: 'admin' },
                { id: 2, name: '李四', role: 'user' }
            ],
            posts: [
                { id: 1, title: '文章1', author: 1 },
                { id: 2, title: '文章2', author: 2 }
            ],
            cachedAt: Date.now()
        };
        
        // 小数据用localStorage
        if (JSON.stringify(apiData).length < 5000) {
            localStorage.setItem('api_cache', JSON.stringify(apiData));
            console.log('✓ 小数据使用localStorage缓存');
        } else {
            // 大数据用IndexedDB
            console.log('✓ 大数据建议使用IndexedDB缓存');
        }
        
        // 缓存过期检查
        const checkCache = () => {
            const cache = JSON.parse(localStorage.getItem('api_cache') || '{}');
            const age = Date.now() - (cache.cachedAt || 0);
            const maxAge = 5 * 60 * 1000; // 5分钟
            
            if (age > maxAge) {
                console.log('缓存已过期，需要重新获取');
                localStorage.removeItem('api_cache');
                return null;
            }
            
            return cache;
        };
        
        const validCache = checkCache();
        console.log('缓存状态:', validCache ? '有效' : '已过期');
    }
}

// ============================================
// 5. 存储配额管理
// ============================================

class StorageQuotaManager {
    static async checkQuota() {
        console.log('\n=== 存储配额管理 ===\n');
        
        if ('storage' in navigator && 'estimate' in navigator.storage) {
            try {
                const estimate = await navigator.storage.estimate();
                const usage = (estimate.usage / 1024 / 1024).toFixed(2);
                const quota = (estimate.quota / 1024 / 1024).toFixed(2);
                const percent = ((estimate.usage / estimate.quota) * 100).toFixed(2);
                
                console.log(`存储使用情况:`);
                console.log(`- 已使用: ${usage} MB`);
                console.log(`- 总配额: ${quota} MB`);
                console.log(`- 使用率: ${percent}%`);
                
                // 检查是否需要清理
                if (percent > 80) {
                    console.warn('存储空间使用超过80%，建议清理');
                    this.suggestCleanup();
                }
            } catch (error) {
                console.error('无法获取存储配额信息:', error);
            }
        } else {
            console.log('当前浏览器不支持Storage API');
        }
    }
    
    static suggestCleanup() {
        console.log('\n清理建议:');
        
        // 检查localStorage
        const localStorageSize = new Blob(Object.values(localStorage)).size;
        console.log(`localStorage 使用: ${(localStorageSize / 1024).toFixed(2)} KB`);
        
        // 查找过期数据
        const expiredKeys = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            try {
                const item = JSON.parse(localStorage.getItem(key));
                if (item.expiry && new Date(item.expiry) < new Date()) {
                    expiredKeys.push(key);
                }
            } catch (e) {
                // 不是JSON格式，跳过
            }
        }
        
        if (expiredKeys.length > 0) {
            console.log(`发现 ${expiredKeys.length} 个过期项目`);
            expiredKeys.forEach(key => {
                localStorage.removeItem(key);
                console.log(`已清理: ${key}`);
            });
        }
    }
    
    static async cleanupOldData() {
        console.log('\n执行深度清理...');
        
        // 清理超过30天的缓存数据
        const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
        
        // 清理localStorage
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('cache_') || key.startsWith('temp_')) {
                try {
                    const data = JSON.parse(localStorage.getItem(key));
                    if (data.timestamp && data.timestamp < thirtyDaysAgo) {
                        keysToRemove.push(key);
                    }
                } catch (e) {
                    // 解析失败，可能需要清理
                    keysToRemove.push(key);
                }
            }
        }
        
        keysToRemove.forEach(key => localStorage.removeItem(key));
        console.log(`已清理 ${keysToRemove.length} 个过期缓存项`);
        
        // 清理IndexedDB（如果需要）
        const databases = await indexedDB.databases();
        for (const db of databases) {
            if (db.name.startsWith('temp_') || db.name.startsWith('cache_')) {
                await indexedDB.deleteDatabase(db.name);
                console.log(`已删除数据库: ${db.name}`);
            }
        }
    }
}

// ============================================
// 6. 跨浏览器兼容性
// ============================================

class BrowserCompatibility {
    static checkSupport() {
        console.log('\n=== 浏览器兼容性检查 ===\n');
        
        const features = {
            localStorage: typeof(Storage) !== 'undefined' && localStorage,
            sessionStorage: typeof(Storage) !== 'undefined' && sessionStorage,
            cookies: navigator.cookieEnabled,
            indexedDB: 'indexedDB' in window,
            storageManager: 'storage' in navigator,
            storageEstimate: 'storage' in navigator && 'estimate' in navigator.storage,
            persist: 'storage' in navigator && 'persist' in navigator.storage
        };
        
        console.log('功能支持情况:');
        Object.entries(features).forEach(([feature, supported]) => {
            console.log(`${supported ? '✓' : '✗'} ${feature}`);
        });
        
        // 检查存储是否被禁用（隐私模式等）
        this.checkPrivateMode();
    }
    
    static checkPrivateMode() {
        console.log('\n隐私模式检测:');
        
        try {
            // 测试localStorage
            localStorage.setItem('test', 'test');
            localStorage.removeItem('test');
            console.log('✓ localStorage 可用');
        } catch (e) {
            console.log('✗ localStorage 不可用（可能是隐私模式）');
        }
        
        // 检测Safari隐私模式
        try {
            const testDB = indexedDB.open('test');
            testDB.onsuccess = () => {
                console.log('✓ IndexedDB 可用');
                indexedDB.deleteDatabase('test');
            };
            testDB.onerror = () => {
                console.log('✗ IndexedDB 不可用');
            };
        } catch (e) {
            console.log('✗ IndexedDB 不可用');
        }
    }
    
    // Polyfill示例
    static addPolyfills() {
        // localStorage polyfill (使用cookie)
        if (!window.localStorage) {
            window.localStorage = {
                getItem: function(key) {
                    const cookies = document.cookie.split(';');
                    const cookie = cookies.find(c => c.trim().startsWith(`ls_${key}=`));
                    return cookie ? decodeURIComponent(cookie.split('=')[1]) : null;
                },
                setItem: function(key, value) {
                    document.cookie = `ls_${key}=${encodeURIComponent(value)}; path=/; max-age=31536000`;
                },
                removeItem: function(key) {
                    document.cookie = `ls_${key}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
                },
                clear: function() {
                    document.cookie.split(';').forEach(cookie => {
                        if (cookie.trim().startsWith('ls_')) {
                            const key = cookie.split('=')[0].trim();
                            this.removeItem(key.substring(3));
                        }
                    });
                }
            };
            console.log('已添加 localStorage polyfill');
        }
    }
}

// ============================================
// 7. 最佳实践示例
// ============================================

class StorageBestPractices {
    static demonstrate() {
        console.log('\n=== 存储最佳实践 ===\n');
        
        // 1. 数据验证和错误处理
        this.safeStorage();
        
        // 2. 数据加密
        this.encryptedStorage();
        
        // 3. 版本管理
        this.versionedStorage();
        
        // 4. 命名空间
        this.namespacedStorage();
    }
    
    static safeStorage() {
        console.log('1. 安全的存储操作:');
        
        class SafeStorage {
            static set(key, value, options = {}) {
                try {
                    const data = {
                        value,
                        timestamp: Date.now(),
                        version: options.version || 1
                    };
                    
                    if (options.expiry) {
                        data.expiry = Date.now() + options.expiry;
                    }
                    
                    const serialized = JSON.stringify(data);
                    
                    // 检查大小
                    if (serialized.length > 5 * 1024 * 1024) {
                        console.warn('数据超过5MB，建议使用IndexedDB');
                        return false;
                    }
                    
                    localStorage.setItem(key, serialized);
                    return true;
                } catch (error) {
                    if (error.name === 'QuotaExceededError') {
                        console.error('存储空间不足');
                        // 尝试清理
                        this.cleanup();
                        // 重试一次
                        try {
                            localStorage.setItem(key, serialized);
                            return true;
                        } catch (e) {
                            return false;
                        }
                    }
                    console.error('存储失败:', error);
                    return false;
                }
            }
            
            static get(key, defaultValue = null) {
                try {
                    const item = localStorage.getItem(key);
                    if (!item) return defaultValue;
                    
                    const data = JSON.parse(item);
                    
                    // 检查过期
                    if (data.expiry && Date.now() > data.expiry) {
                        localStorage.removeItem(key);
                        return defaultValue;
                    }
                    
                    return data.value;
                } catch (error) {
                    console.error('读取失败:', error);
                    return defaultValue;
                }
            }
            
            static cleanup() {
                // 清理过期数据
                const keys = Object.keys(localStorage);
                let cleaned = 0;
                
                keys.forEach(key => {
                    try {
                        const data = JSON.parse(localStorage.getItem(key));
                        if (data.expiry && Date.now() > data.expiry) {
                            localStorage.removeItem(key);
                            cleaned++;
                        }
                    } catch (e) {
                        // 忽略解析错误
                    }
                });
                
                console.log(`清理了 ${cleaned} 个过期项`);
            }
        }
        
        // 使用示例
        SafeStorage.set('user', { name: 'Alice' }, { expiry: 3600000 }); // 1小时后过期
        console.log('安全存储的数据:', SafeStorage.get('user'));
    }
    
    static encryptedStorage() {
        console.log('\n2. 加密存储（简单示例）:');
        
        class EncryptedStorage {
            // 简单的加密（实际应用中使用真实加密库）
            static encrypt(text, key = 'secret') {
                return btoa(encodeURIComponent(text + key));
            }
            
            static decrypt(encrypted, key = 'secret') {
                try {
                    const decrypted = decodeURIComponent(atob(encrypted));
                    return decrypted.replace(key, '');
                } catch (e) {
                    return null;
                }
            }
            
            static setSecure(key, value) {
                const encrypted = this.encrypt(JSON.stringify(value));
                localStorage.setItem(`secure_${key}`, encrypted);
            }
            
            static getSecure(key) {
                const encrypted = localStorage.getItem(`secure_${key}`);
                if (!encrypted) return null;
                
                const decrypted = this.decrypt(encrypted);
                return decrypted ? JSON.parse(decrypted) : null;
            }
        }
        
        // 使用示例
        const sensitiveData = { token: 'abc123', userId: 42 };
        EncryptedStorage.setSecure('auth', sensitiveData);
        console.log('加密存储的数据:', EncryptedStorage.getSecure('auth'));
    }
    
    static versionedStorage() {
        console.log('\n3. 版本化存储:');
        
        class VersionedStorage {
            static CURRENT_VERSION = 2;
            
            static migrate(data, fromVersion, toVersion) {
                let migrated = { ...data };
                
                // 版本1到版本2的迁移
                if (fromVersion === 1 && toVersion >= 2) {
                    migrated.preferences = {
                        theme: data.theme || 'light',
                        language: data.lang || 'en'
                    };
                    delete migrated.theme;
                    delete migrated.lang;
                }
                
                return migrated;
            }
            
            static set(key, value) {
                const versionedData = {
                    version: this.CURRENT_VERSION,
                    data: value
                };
                localStorage.setItem(key, JSON.stringify(versionedData));
            }
            
            static get(key) {
                const stored = localStorage.getItem(key);
                if (!stored) return null;
                
                try {
                    const parsed = JSON.parse(stored);
                    
                    // 检查版本
                    if (parsed.version < this.CURRENT_VERSION) {
                        console.log(`迁移数据从版本 ${parsed.version} 到 ${this.CURRENT_VERSION}`);
                        parsed.data = this.migrate(
                            parsed.data,
                            parsed.version,
                            this.CURRENT_VERSION
                        );
                        parsed.version = this.CURRENT_VERSION;
                        
                        // 保存迁移后的数据
                        this.set(key, parsed.data);
                    }
                    
                    return parsed.data;
                } catch (error) {
                    console.error('版本化存储读取失败:', error);
                    return null;
                }
            }
        }
        
        // 模拟旧版本数据
        localStorage.setItem('app_settings', JSON.stringify({
            version: 1,
            data: { theme: 'dark', lang: 'zh-CN', username: 'Alice' }
        }));
        
        // 读取并自动迁移
        const settings = VersionedStorage.get('app_settings');
        console.log('迁移后的数据:', settings);
    }
    
    static namespacedStorage() {
        console.log('\n4. 命名空间存储:');
        
        class NamespacedStorage {
            constructor(namespace) {
                this.namespace = namespace;
            }
            
            _getKey(key) {
                return `${this.namespace}:${key}`;
            }
            
            set(key, value) {
                localStorage.setItem(this._getKey(key), JSON.stringify(value));
            }
            
            get(key) {
                const item = localStorage.getItem(this._getKey(key));
                return item ? JSON.parse(item) : null;
            }
            
            remove(key) {
                localStorage.removeItem(this._getKey(key));
            }
            
            clear() {
                const keys = Object.keys(localStorage);
                keys.forEach(key => {
                    if (key.startsWith(`${this.namespace}:`)) {
                        localStorage.removeItem(key);
                    }
                });
            }
            
            keys() {
                const allKeys = Object.keys(localStorage);
                const prefix = `${this.namespace}:`;
                return allKeys
                    .filter(key => key.startsWith(prefix))
                    .map(key => key.substring(prefix.length));
            }
        }
        
        // 使用示例
        const userStorage = new NamespacedStorage('user_123');
        const appStorage = new NamespacedStorage('app');
        
        userStorage.set('preferences', { theme: 'dark' });
        appStorage.set('config', { version: '1.0.0' });
        
        console.log('用户存储键:', userStorage.keys());
        console.log('应用存储键:', appStorage.keys());
    }
}

// ============================================
// 执行所有测试
// ============================================

async function runAllComparisons() {
    console.log('开始Web存储技术对比测试...\n');
    
    // 浏览器兼容性检查
    BrowserCompatibility.checkSupport();
    
    // 功能对比
    StorageComparison.compareFeatures();
    
    // 性能测试
    await PerformanceTest.runAllTests();
    
    // 实际应用场景
    UseCaseExamples.demonstrateUseCases();
    
    // 配额管理
    await StorageQuotaManager.checkQuota();
    
    // 最佳实践
    StorageBestPractices.demonstrate();
    
    console.log('\n测试完成！查看控制台了解各种存储技术的特点和应用场景。');
}

// 运行测试
runAllComparisons();