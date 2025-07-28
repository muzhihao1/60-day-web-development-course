// async/await实战模式 - Day 15

// ============================================
// 1. 基础async/await模式
// ============================================

console.log('=== Async/Await实战模式 ===\n');

// 辅助函数
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 模拟API调用
const api = {
    async getUser(id) {
        await delay(500);
        if (id <= 0) throw new Error('无效的用户ID');
        return { id, name: `用户${id}`, role: 'user' };
    },
    
    async getUserPosts(userId) {
        await delay(600);
        return [
            { id: 1, userId, title: '第一篇文章', views: 100 },
            { id: 2, userId, title: '第二篇文章', views: 200 }
        ];
    },
    
    async getPostComments(postId) {
        await delay(400);
        return [
            { id: 1, postId, text: '很棒！', author: '读者A' },
            { id: 2, postId, text: '学到了', author: '读者B' }
        ];
    },
    
    async searchUsers(query) {
        await delay(800);
        return [
            { id: 1, name: '张三', match: 0.9 },
            { id: 2, name: '李四', match: 0.7 }
        ];
    }
};

// ============================================
// 2. 错误处理模式
// ============================================

// 模式1: Try-Catch
async function errorHandlingPattern1() {
    console.log('1. Try-Catch错误处理：');
    
    try {
        const user = await api.getUser(1);
        console.log('成功获取用户:', user);
        
        // 测试错误情况
        const invalidUser = await api.getUser(-1);
    } catch (error) {
        console.error('捕获错误:', error.message);
    }
}

// 模式2: 错误优先返回（Go风格）
async function toResult(promise) {
    try {
        const data = await promise;
        return [null, data];
    } catch (error) {
        return [error, null];
    }
}

async function errorHandlingPattern2() {
    console.log('\n2. 错误优先返回模式：');
    
    const [error1, user] = await toResult(api.getUser(1));
    if (error1) {
        console.error('获取用户失败:', error1.message);
        return;
    }
    console.log('成功获取用户:', user);
    
    const [error2, invalidUser] = await toResult(api.getUser(-1));
    if (error2) {
        console.error('预期的错误:', error2.message);
    }
}

// 模式3: 链式错误处理
async function errorHandlingPattern3() {
    console.log('\n3. 链式错误处理：');
    
    const result = await api.getUser(1)
        .then(user => api.getUserPosts(user.id))
        .then(posts => ({ success: true, posts }))
        .catch(error => ({ success: false, error: error.message }));
    
    if (result.success) {
        console.log('获取文章成功:', result.posts);
    } else {
        console.error('操作失败:', result.error);
    }
}

// ============================================
// 3. 并发控制模式
// ============================================

// 并发执行
async function concurrentExecution() {
    console.log('\n4. 并发执行模式：');
    
    console.time('并发执行');
    const [user1, user2, user3] = await Promise.all([
        api.getUser(1),
        api.getUser(2),
        api.getUser(3)
    ]);
    console.timeEnd('并发执行');
    
    console.log('并发获取的用户:', [user1.name, user2.name, user3.name]);
}

// 限制并发数
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
            const resolve = this.queue.shift();
            if (resolve) resolve();
        }
    }
}

async function limitedConcurrency() {
    console.log('\n5. 限制并发数：');
    
    const pool = new ConcurrencyPool(2); // 最多2个并发
    const userIds = [1, 2, 3, 4, 5];
    
    console.log('开始获取5个用户（最多2个并发）...');
    console.time('限制并发执行');
    
    const users = await Promise.all(
        userIds.map(id => 
            pool.run(async () => {
                console.log(`开始获取用户${id}`);
                const user = await api.getUser(id);
                console.log(`完成获取用户${id}`);
                return user;
            })
        )
    );
    
    console.timeEnd('限制并发执行');
    console.log('获取到的用户:', users.map(u => u.name));
}

// ============================================
// 4. 循环中的异步操作
// ============================================

async function asyncInLoops() {
    console.log('\n6. 循环中的异步操作：');
    
    const userIds = [1, 2, 3];
    
    // ❌ 错误方式：forEach不等待
    console.log('错误方式（forEach）：');
    console.time('forEach');
    userIds.forEach(async (id) => {
        const user = await api.getUser(id);
        console.log('forEach获取:', user.name);
    });
    console.timeEnd('forEach'); // 立即结束，不等待
    
    await delay(2000); // 等待forEach完成
    
    // ✅ 正确方式1：for...of（顺序执行）
    console.log('\n正确方式1（for...of顺序执行）：');
    console.time('for...of');
    for (const id of userIds) {
        const user = await api.getUser(id);
        console.log('for...of获取:', user.name);
    }
    console.timeEnd('for...of');
    
    // ✅ 正确方式2：map + Promise.all（并发执行）
    console.log('\n正确方式2（map + Promise.all并发执行）：');
    console.time('map + Promise.all');
    const users = await Promise.all(
        userIds.map(async (id) => {
            const user = await api.getUser(id);
            console.log('map获取:', user.name);
            return user;
        })
    );
    console.timeEnd('map + Promise.all');
}

// ============================================
// 5. 超时控制
// ============================================

async function withTimeout(promise, ms) {
    let timeoutId;
    
    const timeout = new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
            reject(new Error(`操作超时（${ms}ms）`));
        }, ms);
    });
    
    try {
        const result = await Promise.race([promise, timeout]);
        clearTimeout(timeoutId);
        return result;
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
}

async function timeoutControl() {
    console.log('\n7. 超时控制：');
    
    try {
        // 正常情况
        const user = await withTimeout(api.getUser(1), 1000);
        console.log('获取成功:', user);
        
        // 超时情况
        const slowOperation = delay(2000).then(() => '慢操作结果');
        const result = await withTimeout(slowOperation, 1000);
    } catch (error) {
        console.error('捕获超时:', error.message);
    }
}

// ============================================
// 6. 重试机制
// ============================================

async function retry(fn, options = {}) {
    const { 
        retries = 3, 
        delay: retryDelay = 1000, 
        backoff = 2,
        onRetry = () => {} 
    } = options;
    
    let lastError;
    
    for (let i = 0; i < retries; i++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;
            
            if (i < retries - 1) {
                const waitTime = retryDelay * Math.pow(backoff, i);
                onRetry(i + 1, waitTime, error);
                await delay(waitTime);
            }
        }
    }
    
    throw lastError;
}

async function retryMechanism() {
    console.log('\n8. 重试机制：');
    
    let attempts = 0;
    const unreliableOperation = async () => {
        attempts++;
        if (attempts < 3) {
            throw new Error(`第${attempts}次尝试失败`);
        }
        return '终于成功了！';
    };
    
    try {
        const result = await retry(unreliableOperation, {
            retries: 5,
            delay: 500,
            backoff: 1.5,
            onRetry: (attempt, waitTime, error) => {
                console.log(`重试 ${attempt}/5，等待 ${waitTime}ms - ${error.message}`);
            }
        });
        console.log('重试结果:', result);
    } catch (error) {
        console.error('重试失败:', error.message);
    }
}

// ============================================
// 7. 防抖和节流
// ============================================

function debounce(fn, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        return new Promise((resolve) => {
            timeoutId = setTimeout(async () => {
                const result = await fn.apply(this, args);
                resolve(result);
            }, delay);
        });
    };
}

function throttle(fn, limit) {
    let inThrottle;
    let lastResult;
    return async function(...args) {
        if (!inThrottle) {
            inThrottle = true;
            lastResult = await fn.apply(this, args);
            setTimeout(() => inThrottle = false, limit);
            return lastResult;
        }
        return lastResult;
    };
}

async function debounceThrottle() {
    console.log('\n9. 防抖和节流：');
    
    // 防抖示例
    const debouncedSearch = debounce(api.searchUsers, 500);
    
    console.log('防抖示例（快速调用3次）：');
    debouncedSearch('张');
    debouncedSearch('张三');
    const searchResult = await debouncedSearch('张三丰'); // 只有这个会执行
    console.log('搜索结果:', searchResult);
    
    // 节流示例
    const throttledUpdate = throttle(async (value) => {
        console.log('更新值:', value);
        return value;
    }, 1000);
    
    console.log('\n节流示例：');
    for (let i = 1; i <= 5; i++) {
        throttledUpdate(i);
        await delay(300);
    }
}

// ============================================
// 8. 异步迭代器
// ============================================

async function* asyncGenerator() {
    const items = [1, 2, 3, 4, 5];
    
    for (const item of items) {
        await delay(500);
        yield item * 2;
    }
}

async function* paginatedFetch(url, pageSize = 10) {
    let page = 1;
    let hasMore = true;
    
    while (hasMore) {
        console.log(`获取第${page}页...`);
        await delay(1000);
        
        // 模拟分页数据
        const data = {
            items: Array.from({ length: pageSize }, (_, i) => ({
                id: (page - 1) * pageSize + i + 1,
                name: `项目${(page - 1) * pageSize + i + 1}`
            })),
            hasNextPage: page < 3 // 模拟只有3页
        };
        
        yield data.items;
        hasMore = data.hasNextPage;
        page++;
    }
}

async function asyncIterators() {
    console.log('\n10. 异步迭代器：');
    
    // 使用异步生成器
    console.log('异步生成器：');
    for await (const value of asyncGenerator()) {
        console.log('生成值:', value);
    }
    
    // 分页数据迭代
    console.log('\n分页数据迭代：');
    let totalItems = 0;
    for await (const items of paginatedFetch('/api/items', 5)) {
        console.log(`获取到 ${items.length} 个项目`);
        totalItems += items.length;
    }
    console.log(`总共获取 ${totalItems} 个项目`);
}

// ============================================
// 9. 取消操作
// ============================================

class CancelableOperation {
    constructor() {
        this.abortController = new AbortController();
    }
    
    async run(fn) {
        try {
            return await fn(this.abortController.signal);
        } catch (error) {
            if (error.name === 'AbortError') {
                console.log('操作被取消');
            } else {
                throw error;
            }
        }
    }
    
    cancel() {
        this.abortController.abort();
    }
}

async function cancelableOperations() {
    console.log('\n11. 可取消操作：');
    
    const operation = new CancelableOperation();
    
    // 启动长时间操作
    const promise = operation.run(async (signal) => {
        for (let i = 0; i < 10; i++) {
            if (signal.aborted) {
                throw new Error('AbortError');
            }
            console.log(`步骤 ${i + 1}/10`);
            await delay(500);
        }
        return '操作完成';
    });
    
    // 2秒后取消
    setTimeout(() => {
        console.log('取消操作...');
        operation.cancel();
    }, 2000);
    
    try {
        const result = await promise;
        console.log('结果:', result);
    } catch (error) {
        console.error('操作终止:', error.message);
    }
}

// ============================================
// 10. 实战案例：数据加载器
// ============================================

class DataLoader {
    constructor(options = {}) {
        this.cache = new Map();
        this.pending = new Map();
        this.options = {
            cacheTime: 60000,
            retries: 3,
            timeout: 5000,
            ...options
        };
    }
    
    async load(key, fetcher) {
        // 检查缓存
        const cached = this.cache.get(key);
        if (cached && Date.now() - cached.time < this.options.cacheTime) {
            console.log(`缓存命中: ${key}`);
            return cached.data;
        }
        
        // 检查是否正在加载
        if (this.pending.has(key)) {
            console.log(`等待进行中的请求: ${key}`);
            return this.pending.get(key);
        }
        
        // 创建新的加载任务
        const loadPromise = this._loadWithRetry(key, fetcher);
        this.pending.set(key, loadPromise);
        
        try {
            const data = await loadPromise;
            this.cache.set(key, { data, time: Date.now() });
            return data;
        } finally {
            this.pending.delete(key);
        }
    }
    
    async _loadWithRetry(key, fetcher) {
        return retry(
            () => withTimeout(fetcher(), this.options.timeout),
            {
                retries: this.options.retries,
                onRetry: (attempt) => {
                    console.log(`重试加载 ${key}: ${attempt}/${this.options.retries}`);
                }
            }
        );
    }
    
    invalidate(key) {
        this.cache.delete(key);
        this.pending.delete(key);
    }
}

async function dataLoaderExample() {
    console.log('\n12. 数据加载器实战：');
    
    const loader = new DataLoader({
        cacheTime: 5000,
        retries: 2,
        timeout: 3000
    });
    
    // 第一次加载
    const user1 = await loader.load('user:1', () => api.getUser(1));
    console.log('第一次加载:', user1);
    
    // 第二次加载（使用缓存）
    const user2 = await loader.load('user:1', () => api.getUser(1));
    console.log('第二次加载:', user2);
    
    // 并发加载不同资源
    const [userData, posts] = await Promise.all([
        loader.load('user:2', () => api.getUser(2)),
        loader.load('posts:2', () => api.getUserPosts(2))
    ]);
    console.log('并发加载结果:', { userData, posts });
}

// ============================================
// 运行所有示例
// ============================================

async function runAllExamples() {
    await errorHandlingPattern1();
    await errorHandlingPattern2();
    await errorHandlingPattern3();
    await concurrentExecution();
    await limitedConcurrency();
    await asyncInLoops();
    await timeoutControl();
    await retryMechanism();
    await debounceThrottle();
    await asyncIterators();
    await cancelableOperations();
    await dataLoaderExample();
    
    console.log('\n\n🎉 Async/Await实战模式演示完成！');
}

// 启动演示
console.log('🚀 Async/Await实战模式演示\n');
console.log('本演示展示了async/await在实际开发中的各种应用模式。\n');

runAllExamples().catch(console.error);

// 导出实用工具
module.exports = {
    delay,
    toResult,
    withTimeout,
    retry,
    debounce,
    throttle,
    ConcurrencyPool,
    CancelableOperation,
    DataLoader
};