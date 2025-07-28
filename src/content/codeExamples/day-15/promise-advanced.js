// Promise高级用法 - Day 15

// ============================================
// 1. Promise基础回顾
// ============================================

console.log('=== Promise高级用法示例 ===\n');

// Promise的三种状态
const demonstratePromiseStates = () => {
    console.log('1. Promise的三种状态：');
    
    // Pending状态
    const pendingPromise = new Promise(() => {});
    console.log('Pending状态:', pendingPromise);
    
    // Fulfilled状态
    const fulfilledPromise = Promise.resolve('成功！');
    fulfilledPromise.then(value => console.log('Fulfilled状态:', value));
    
    // Rejected状态
    const rejectedPromise = Promise.reject(new Error('失败！'));
    rejectedPromise.catch(error => console.log('Rejected状态:', error.message));
};

// ============================================
// 2. Promise链式调用和值传递
// ============================================

const demonstrateChaining = () => {
    console.log('\n2. Promise链式调用：');
    
    Promise.resolve(1)
        .then(value => {
            console.log('第一步:', value);
            return value * 2;
        })
        .then(value => {
            console.log('第二步:', value);
            return Promise.resolve(value * 2); // 返回Promise
        })
        .then(value => {
            console.log('第三步:', value);
            return { result: value, timestamp: Date.now() };
        })
        .then(data => {
            console.log('最终结果:', data);
        });
};

// ============================================
// 3. Promise.all - 并行执行
// ============================================

// 模拟API调用
const fetchData = (endpoint, delay) => {
    return new Promise((resolve) => {
        console.log(`开始获取: ${endpoint}`);
        setTimeout(() => {
            resolve({ endpoint, data: `${endpoint}的数据`, timestamp: Date.now() });
        }, delay);
    });
};

const demonstratePromiseAll = async () => {
    console.log('\n3. Promise.all - 等待所有完成：');
    
    try {
        console.time('Promise.all执行时间');
        
        const results = await Promise.all([
            fetchData('/api/users', 1000),
            fetchData('/api/posts', 1500),
            fetchData('/api/comments', 800)
        ]);
        
        console.timeEnd('Promise.all执行时间');
        console.log('所有结果:', results);
        
        // 处理结果
        const [users, posts, comments] = results;
        console.log('分解结果:', { users, posts, comments });
    } catch (error) {
        console.error('Promise.all失败:', error.message);
    }
};

// ============================================
// 4. Promise.race - 竞速
// ============================================

const demonstratePromiseRace = async () => {
    console.log('\n4. Promise.race - 最快的获胜：');
    
    // 超时控制
    const timeoutPromise = (ms) => new Promise((_, reject) => 
        setTimeout(() => reject(new Error(`超时: ${ms}ms`)), ms)
    );
    
    try {
        const result = await Promise.race([
            fetchData('/api/fast', 500),
            fetchData('/api/slow', 2000),
            timeoutPromise(1000)
        ]);
        
        console.log('最快的结果:', result);
    } catch (error) {
        console.error('Promise.race错误:', error.message);
    }
    
    // 多数据源竞速
    const fetchFromMultipleSources = async (resource) => {
        const sources = [
            `https://api1.example.com${resource}`,
            `https://api2.example.com${resource}`,
            `https://api3.example.com${resource}`
        ];
        
        try {
            const result = await Promise.race(
                sources.map((url, index) => 
                    fetchData(url, Math.random() * 1000 + 500)
                        .then(data => ({ ...data, source: `API${index + 1}` }))
                )
            );
            
            console.log('最快的数据源:', result.source);
            return result;
        } catch (error) {
            console.error('所有数据源都失败:', error);
        }
    };
    
    await fetchFromMultipleSources('/users');
};

// ============================================
// 5. Promise.allSettled - 获取所有结果
// ============================================

const demonstratePromiseAllSettled = async () => {
    console.log('\n5. Promise.allSettled - 等待所有结束：');
    
    const promises = [
        Promise.resolve('成功1'),
        Promise.reject(new Error('失败1')),
        Promise.resolve('成功2'),
        Promise.reject(new Error('失败2')),
        fetchData('/api/data', 1000)
    ];
    
    const results = await Promise.allSettled(promises);
    
    // 分析结果
    const summary = results.reduce((acc, result) => {
        if (result.status === 'fulfilled') {
            acc.successful.push(result.value);
        } else {
            acc.failed.push(result.reason);
        }
        return acc;
    }, { successful: [], failed: [] });
    
    console.log('成功的操作:', summary.successful);
    console.log('失败的操作:', summary.failed.map(e => e.message));
    
    // 批量操作示例
    const batchOperation = async (items) => {
        const operations = items.map(item => 
            // 模拟可能失败的操作
            new Promise((resolve, reject) => {
                const success = Math.random() > 0.3;
                setTimeout(() => {
                    if (success) {
                        resolve({ item, result: `${item}处理成功` });
                    } else {
                        reject(new Error(`${item}处理失败`));
                    }
                }, Math.random() * 1000);
            })
        );
        
        const results = await Promise.allSettled(operations);
        return {
            total: results.length,
            successful: results.filter(r => r.status === 'fulfilled').length,
            failed: results.filter(r => r.status === 'rejected').length,
            details: results
        };
    };
    
    const batchResult = await batchOperation(['任务1', '任务2', '任务3', '任务4', '任务5']);
    console.log('批量操作统计:', batchResult);
};

// ============================================
// 6. Promise.any - 任意成功即可
// ============================================

const demonstratePromiseAny = async () => {
    console.log('\n6. Promise.any - 任意成功即可：');
    
    // 多个备用数据源
    const primaryAPI = () => Promise.reject(new Error('主API失败'));
    const backupAPI = () => new Promise(resolve => 
        setTimeout(() => resolve('备用API数据'), 800)
    );
    const fallbackAPI = () => new Promise(resolve => 
        setTimeout(() => resolve('后备API数据'), 1200)
    );
    
    try {
        const result = await Promise.any([
            primaryAPI(),
            backupAPI(),
            fallbackAPI()
        ]);
        
        console.log('成功获取数据:', result);
    } catch (error) {
        console.error('所有API都失败:', error);
    }
};

// ============================================
// 7. 自定义Promise工具函数
// ============================================

// Promise.map - 限制并发的map
Promise.map = async function(array, mapper, concurrency = Infinity) {
    const results = [];
    const executing = [];
    
    for (const [index, item] of array.entries()) {
        const promise = Promise.resolve().then(() => mapper(item, index, array));
        results.push(promise);
        
        if (concurrency < Infinity) {
            const e = promise.then(() => executing.splice(executing.indexOf(e), 1));
            executing.push(e);
            
            if (executing.length >= concurrency) {
                await Promise.race(executing);
            }
        }
    }
    
    return Promise.all(results);
};

// 延迟Promise
const delay = (ms, value) => new Promise(resolve => 
    setTimeout(() => resolve(value), ms)
);

// Promise超时
const timeout = (promise, ms, message = '操作超时') => {
    return Promise.race([
        promise,
        delay(ms).then(() => Promise.reject(new Error(message)))
    ]);
};

// 重试Promise
const retry = async (promiseFn, options = {}) => {
    const { retries = 3, delay: retryDelay = 1000, backoff = 2 } = options;
    
    for (let i = 0; i <= retries; i++) {
        try {
            return await promiseFn();
        } catch (error) {
            if (i === retries) throw error;
            
            const waitTime = retryDelay * Math.pow(backoff, i);
            console.log(`重试 ${i + 1}/${retries}, 等待 ${waitTime}ms`);
            await delay(waitTime);
        }
    }
};

// 使用自定义工具函数
const demonstrateCustomTools = async () => {
    console.log('\n7. 自定义Promise工具函数：');
    
    // 限制并发
    console.log('限制并发的map（最多2个并发）：');
    const items = [1, 2, 3, 4, 5];
    const results = await Promise.map(
        items,
        async (item) => {
            console.log(`开始处理 ${item}`);
            await delay(1000);
            console.log(`完成处理 ${item}`);
            return item * 2;
        },
        2 // 最多2个并发
    );
    console.log('结果:', results);
    
    // 超时控制
    console.log('\n超时控制：');
    try {
        await timeout(delay(2000, '太慢了'), 1000);
    } catch (error) {
        console.log('✓ 成功捕获超时:', error.message);
    }
    
    // 重试机制
    console.log('\n重试机制：');
    let attempts = 0;
    const unreliableOperation = () => {
        attempts++;
        if (attempts < 3) {
            return Promise.reject(new Error(`第${attempts}次尝试失败`));
        }
        return Promise.resolve('终于成功了！');
    };
    
    const result = await retry(unreliableOperation, {
        retries: 3,
        delay: 500,
        backoff: 1.5
    });
    console.log('重试结果:', result);
};

// ============================================
// 8. Promise缓存模式
// ============================================

class PromiseCache {
    constructor(ttl = 60000) {
        this.cache = new Map();
        this.ttl = ttl;
    }
    
    async get(key, factory) {
        const cached = this.cache.get(key);
        
        if (cached) {
            if (Date.now() - cached.timestamp < this.ttl) {
                console.log(`缓存命中: ${key}`);
                return cached.promise;
            }
            this.cache.delete(key);
        }
        
        console.log(`缓存未命中: ${key}`);
        const promise = factory();
        this.cache.set(key, {
            promise,
            timestamp: Date.now()
        });
        
        // 错误时删除缓存
        promise.catch(() => this.cache.delete(key));
        
        return promise;
    }
    
    clear(key) {
        if (key) {
            this.cache.delete(key);
        } else {
            this.cache.clear();
        }
    }
}

const demonstrateCache = async () => {
    console.log('\n8. Promise缓存模式：');
    
    const cache = new PromiseCache(5000); // 5秒缓存
    
    const expensiveOperation = async (id) => {
        console.log(`执行昂贵操作: ${id}`);
        await delay(1000);
        return `结果${id}`;
    };
    
    // 第一次调用
    const result1 = await cache.get('user:123', () => expensiveOperation(123));
    console.log('第一次结果:', result1);
    
    // 第二次调用（使用缓存）
    const result2 = await cache.get('user:123', () => expensiveOperation(123));
    console.log('第二次结果:', result2);
    
    // 不同的key
    const result3 = await cache.get('user:456', () => expensiveOperation(456));
    console.log('不同key结果:', result3);
};

// ============================================
// 9. Promise队列
// ============================================

class PromiseQueue {
    constructor(concurrency = 1) {
        this.concurrency = concurrency;
        this.running = 0;
        this.queue = [];
    }
    
    add(promiseFactory) {
        return new Promise((resolve, reject) => {
            this.queue.push({ promiseFactory, resolve, reject });
            this.process();
        });
    }
    
    async process() {
        if (this.running >= this.concurrency || this.queue.length === 0) {
            return;
        }
        
        this.running++;
        const { promiseFactory, resolve, reject } = this.queue.shift();
        
        try {
            const result = await promiseFactory();
            resolve(result);
        } catch (error) {
            reject(error);
        } finally {
            this.running--;
            this.process();
        }
    }
}

const demonstrateQueue = async () => {
    console.log('\n9. Promise队列（串行执行）：');
    
    const queue = new PromiseQueue(1); // 串行执行
    const tasks = [];
    
    for (let i = 1; i <= 5; i++) {
        tasks.push(
            queue.add(async () => {
                console.log(`开始任务 ${i}`);
                await delay(500);
                console.log(`完成任务 ${i}`);
                return `任务${i}结果`;
            })
        );
    }
    
    const results = await Promise.all(tasks);
    console.log('所有任务结果:', results);
};

// ============================================
// 10. 执行所有演示
// ============================================

async function runAllDemonstrations() {
    demonstratePromiseStates();
    await delay(100);
    
    demonstrateChaining();
    await delay(1000);
    
    await demonstratePromiseAll();
    await demonstratePromiseRace();
    await demonstratePromiseAllSettled();
    await demonstratePromiseAny();
    await demonstrateCustomTools();
    await demonstrateCache();
    await demonstrateQueue();
    
    console.log('\n\n🎉 Promise高级用法演示完成！');
}

// 启动演示
console.log('🚀 Promise高级用法演示\n');
runAllDemonstrations().catch(console.error);

// 导出工具函数
module.exports = {
    delay,
    timeout,
    retry,
    PromiseCache,
    PromiseQueue
};