---
day: 15
phase: "javascript-mastery"
title: "异步编程精通：Promise与async/await"
description: "深入理解JavaScript异步编程，掌握Promise和async/await的高级用法，学会处理并发操作和错误"
objectives:
  - "理解JavaScript异步编程的演进历程"
  - "精通Promise的创建和使用"
  - "掌握async/await语法和最佳实践"
  - "学会处理并发操作和竞态条件"
  - "实现优雅的错误处理和重试机制"
estimatedTime: 90
difficulty: "intermediate"
prerequisites: [13, 14]
tags:
  - "异步编程"
  - "Promise"
  - "async/await"
  - "并发控制"
  - "错误处理"
resources:
  - title: "MDN Promise文档"
    url: "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise"
    type: "documentation"
  - title: "JavaScript异步编程指南"
    url: "https://javascript.info/async"
    type: "article"
  - title: "Async/Await完全指南"
    url: "https://blog.bitsrc.io/understanding-javascript-async-and-await-with-examples-a010b03926ea"
    type: "article"
  - title: "并发模式与Promise"
    url: "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Using_promises"
    type: "article"
codeExamples:
  - title: "异步模式演进"
    language: "javascript"
    path: "/code-examples/day-15/async-evolution.js"
  - title: "Promise高级用法"
    language: "javascript"
    path: "/code-examples/day-15/promise-advanced.js"
  - title: "async/await实战"
    language: "javascript"
    path: "/code-examples/day-15/async-await-patterns.js"
---

# Day 15: 异步编程精通：Promise与async/await

## 📋 学习目标

异步编程是JavaScript的核心特性之一。今天我们将深入探讨异步编程的各种模式，从传统的回调函数到现代的async/await，掌握如何优雅地处理异步操作、并发控制和错误处理。

## 🎯 为什么异步编程如此重要？

在Web开发中，几乎所有与外部世界的交互都是异步的：
- 网络请求（API调用）
- 文件操作
- 定时器
- 用户交互
- 动画效果

掌握异步编程是成为优秀JavaScript开发者的必经之路。

## 📚 异步编程的演进

### 1. 回调函数时代

```javascript
// 传统的回调模式
function loadUser(userId, callback) {
    setTimeout(() => {
        const user = { id: userId, name: '张三' };
        callback(user);
    }, 1000);
}

function loadUserPosts(user, callback) {
    setTimeout(() => {
        const posts = [`${user.name}的文章1`, `${user.name}的文章2`];
        callback(posts);
    }, 1000);
}

function loadPostComments(post, callback) {
    setTimeout(() => {
        const comments = [`评论1: ${post}`, `评论2: ${post}`];
        callback(comments);
    }, 1000);
}

// 回调地狱（Callback Hell）
loadUser(1, (user) => {
    console.log('用户:', user);
    loadUserPosts(user, (posts) => {
        console.log('文章:', posts);
        loadPostComments(posts[0], (comments) => {
            console.log('评论:', comments);
            // 继续嵌套...😱
        });
    });
});

// 回调的问题：
// 1. 代码难以阅读和维护
// 2. 错误处理困难
// 3. 无法并行处理
// 4. 难以组合和重用
```

### 2. Promise的革命

```javascript
// Promise解决了回调地狱
function loadUser(userId) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (userId > 0) {
                resolve({ id: userId, name: '张三' });
            } else {
                reject(new Error('Invalid user ID'));
            }
        }, 1000);
    });
}

function loadUserPosts(user) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([`${user.name}的文章1`, `${user.name}的文章2`]);
        }, 1000);
    });
}

// Promise链式调用
loadUser(1)
    .then(user => {
        console.log('用户:', user);
        return loadUserPosts(user);
    })
    .then(posts => {
        console.log('文章:', posts);
        return loadPostComments(posts[0]);
    })
    .then(comments => {
        console.log('评论:', comments);
    })
    .catch(error => {
        console.error('错误:', error);
    });

// Promise的优势：
// 1. 扁平化的代码结构
// 2. 统一的错误处理
// 3. 可以组合和链式调用
// 4. 支持并发操作
```

### 3. Async/Await的优雅

```javascript
// async/await让异步代码看起来像同步代码
async function loadUserData(userId) {
    try {
        const user = await loadUser(userId);
        console.log('用户:', user);
        
        const posts = await loadUserPosts(user);
        console.log('文章:', posts);
        
        const comments = await loadPostComments(posts[0]);
        console.log('评论:', comments);
        
        return { user, posts, comments };
    } catch (error) {
        console.error('错误:', error);
        throw error;
    }
}

// 使用
loadUserData(1)
    .then(data => console.log('完整数据:', data))
    .catch(error => console.error('处理失败:', error));
```

## 🔑 Promise深入理解

### Promise的三种状态

```javascript
// Promise只能处于以下三种状态之一：
// 1. Pending（待定）- 初始状态
// 2. Fulfilled（已兑现）- 操作成功完成
// 3. Rejected（已拒绝）- 操作失败

// 创建Promise
const promise = new Promise((resolve, reject) => {
    // 异步操作
    const success = Math.random() > 0.5;
    
    setTimeout(() => {
        if (success) {
            resolve('操作成功！'); // 状态变为fulfilled
        } else {
            reject(new Error('操作失败！')); // 状态变为rejected
        }
    }, 1000);
});

// Promise状态一旦改变就不能再变
promise
    .then(result => {
        console.log('成功:', result);
        return result;
    })
    .catch(error => {
        console.error('失败:', error);
        throw error;
    })
    .finally(() => {
        console.log('操作完成（无论成功或失败）');
    });
```

### Promise链式调用和值传递

```javascript
// Promise链中的值传递
fetch('/api/user/1')
    .then(response => {
        console.log('响应状态:', response.status);
        return response.json(); // 返回新的Promise
    })
    .then(user => {
        console.log('用户数据:', user);
        return user.id; // 返回普通值
    })
    .then(userId => {
        console.log('用户ID:', userId);
        return fetch(`/api/posts?userId=${userId}`);
    })
    .then(response => response.json())
    .then(posts => {
        console.log('用户文章:', posts);
    })
    .catch(error => {
        // 捕获链中任何位置的错误
        console.error('请求失败:', error);
    });

// Promise链的规则：
// 1. then返回一个新的Promise
// 2. 返回值会传递给下一个then
// 3. 返回Promise会等待其完成
// 4. 抛出错误会被catch捕获
```

### Promise错误处理

```javascript
// 错误传播
Promise.resolve('开始')
    .then(value => {
        console.log(value);
        throw new Error('第一步出错');
    })
    .then(value => {
        // 这个不会执行
        console.log('第二步:', value);
    })
    .catch(error => {
        console.error('捕获错误:', error.message);
        return '错误已处理'; // 可以恢复链
    })
    .then(value => {
        console.log('继续执行:', value);
    });

// 多个catch
fetchUserData()
    .then(processData)
    .catch(error => {
        // 处理网络错误
        if (error instanceof NetworkError) {
            return fetchFromCache();
        }
        throw error; // 继续传播其他错误
    })
    .then(displayData)
    .catch(error => {
        // 处理所有其他错误
        showErrorMessage(error);
    });
```

## 🚀 Promise并发控制

### Promise.all - 等待所有完成

```javascript
// 并行执行多个异步操作
const loadAllData = async () => {
    try {
        const [users, posts, comments] = await Promise.all([
            fetch('/api/users').then(r => r.json()),
            fetch('/api/posts').then(r => r.json()),
            fetch('/api/comments').then(r => r.json())
        ]);
        
        console.log('所有数据加载完成');
        return { users, posts, comments };
    } catch (error) {
        // 如果任何一个失败，整个操作失败
        console.error('加载失败:', error);
    }
};

// 批量处理
const imageUrls = [
    'https://example.com/image1.jpg',
    'https://example.com/image2.jpg',
    'https://example.com/image3.jpg'
];

const preloadImages = (urls) => {
    const promises = urls.map(url => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(url);
            img.onerror = () => reject(new Error(`Failed to load ${url}`));
            img.src = url;
        });
    });
    
    return Promise.all(promises);
};
```

### Promise.race - 竞速，最快的获胜

```javascript
// 超时控制
const fetchWithTimeout = (url, timeout = 5000) => {
    return Promise.race([
        fetch(url),
        new Promise((_, reject) => 
            setTimeout(() => reject(new Error('请求超时')), timeout)
        )
    ]);
};

// 使用最快的数据源
const fetchFromMultipleSources = async (resource) => {
    try {
        const data = await Promise.race([
            fetch(`https://api1.example.com/${resource}`),
            fetch(`https://api2.example.com/${resource}`),
            fetch(`https://api3.example.com/${resource}`)
        ]);
        
        return await data.json();
    } catch (error) {
        console.error('所有源都失败:', error);
    }
};
```

### Promise.allSettled - 等待所有结束（无论成功或失败）

```javascript
// 获取所有结果，包括失败的
const loadUserProfiles = async (userIds) => {
    const promises = userIds.map(id => 
        fetch(`/api/users/${id}`)
            .then(r => r.json())
            .catch(error => ({ error: error.message, userId: id }))
    );
    
    const results = await Promise.allSettled(promises);
    
    results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
            console.log(`用户 ${userIds[index]} 加载成功:`, result.value);
        } else {
            console.log(`用户 ${userIds[index]} 加载失败:`, result.reason);
        }
    });
    
    // 分离成功和失败的结果
    const successful = results
        .filter(r => r.status === 'fulfilled')
        .map(r => r.value);
    
    const failed = results
        .filter(r => r.status === 'rejected')
        .map(r => r.reason);
    
    return { successful, failed };
};
```

### Promise.any - 任意一个成功即可

```javascript
// 只要有一个成功就返回（ES2021）
const fetchFromAnySource = async () => {
    try {
        const data = await Promise.any([
            fetch('https://primary-api.com/data').then(r => r.json()),
            fetch('https://backup-api.com/data').then(r => r.json()),
            fetch('https://fallback-api.com/data').then(r => r.json())
        ]);
        
        console.log('成功获取数据:', data);
        return data;
    } catch (error) {
        // AggregateError: 所有Promise都失败
        console.error('所有请求都失败:', error.errors);
    }
};
```

## 🎨 Async/Await最佳实践

### 基础语法

```javascript
// async函数总是返回Promise
async function getValue() {
    return 42; // 相当于 Promise.resolve(42)
}

// await只能在async函数中使用
async function main() {
    const value = await getValue();
    console.log(value); // 42
    
    // await会暂停函数执行，等待Promise解决
    const result = await new Promise(resolve => {
        setTimeout(() => resolve('完成！'), 1000);
    });
    
    console.log(result); // '完成！'
}
```

### 错误处理模式

```javascript
// 1. try-catch模式
async function method1() {
    try {
        const data = await fetchData();
        return processData(data);
    } catch (error) {
        console.error('操作失败:', error);
        throw error; // 可选：继续传播错误
    }
}

// 2. 混合模式
async function method2() {
    const data = await fetchData().catch(error => {
        console.error('获取数据失败:', error);
        return defaultData;
    });
    
    return processData(data);
}

// 3. 错误优先模式（类似Go语言）
async function method3() {
    const [error, data] = await fetchData()
        .then(data => [null, data])
        .catch(error => [error, null]);
    
    if (error) {
        console.error('操作失败:', error);
        return;
    }
    
    return processData(data);
}

// 工具函数：统一错误处理
const asyncHandler = (fn) => async (...args) => {
    try {
        return [null, await fn(...args)];
    } catch (error) {
        return [error, null];
    }
};

// 使用工具函数
const safeeFetch = asyncHandler(fetch);
const [error, response] = await safeFetch('/api/data');
```

### 并发vs顺序执行

```javascript
// ❌ 错误：顺序执行（慢）
async function loadSequential() {
    const user = await fetchUser(); // 等待1秒
    const posts = await fetchPosts(); // 再等待1秒
    const comments = await fetchComments(); // 再等待1秒
    // 总共3秒
}

// ✅ 正确：并发执行（快）
async function loadConcurrent() {
    const [user, posts, comments] = await Promise.all([
        fetchUser(),
        fetchPosts(),
        fetchComments()
    ]);
    // 总共1秒（假设每个操作1秒）
}

// ✅ 混合模式：部分并发
async function loadMixed() {
    // 先获取用户
    const user = await fetchUser();
    
    // 然后并发获取该用户的数据
    const [posts, profile] = await Promise.all([
        fetchUserPosts(user.id),
        fetchUserProfile(user.id)
    ]);
    
    return { user, posts, profile };
}
```

### 循环中的异步操作

```javascript
// ❌ 错误：forEach不支持async/await
const processItems = async (items) => {
    items.forEach(async (item) => {
        await processItem(item); // 不会等待！
    });
    console.log('完成'); // 会立即执行
};

// ✅ 正确：使用for...of
const processItemsSequential = async (items) => {
    for (const item of items) {
        await processItem(item); // 顺序处理
    }
    console.log('完成');
};

// ✅ 正确：使用map + Promise.all（并发）
const processItemsConcurrent = async (items) => {
    await Promise.all(
        items.map(item => processItem(item))
    );
    console.log('完成');
};

// ✅ 限制并发数量
const pLimit = (concurrency) => {
    const queue = [];
    let activeCount = 0;
    
    const run = async (fn, resolve) => {
        activeCount++;
        const result = await fn();
        activeCount--;
        
        if (queue.length > 0) {
            const next = queue.shift();
            run(next.fn, next.resolve);
        }
        
        resolve(result);
    };
    
    return (fn) => new Promise(resolve => {
        if (activeCount < concurrency) {
            run(fn, resolve);
        } else {
            queue.push({ fn, resolve });
        }
    });
};

// 使用限制并发
const limit = pLimit(3); // 最多3个并发
const limitedPromises = items.map(item => 
    limit(() => processItem(item))
);
await Promise.all(limitedPromises);
```

## 🔧 高级异步模式

### 1. 重试机制

```javascript
const retry = async (fn, retries = 3, delay = 1000) => {
    try {
        return await fn();
    } catch (error) {
        if (retries <= 0) {
            throw error;
        }
        
        console.log(`重试中... 剩余次数: ${retries}`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return retry(fn, retries - 1, delay * 2); // 指数退避
    }
};

// 使用重试
const fetchWithRetry = () => retry(
    () => fetch('/api/data').then(r => r.json()),
    3,
    1000
);
```

### 2. 防抖和节流

```javascript
// 防抖（Debounce）- 延迟执行
const debounce = (fn, delay) => {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        return new Promise(resolve => {
            timeoutId = setTimeout(() => {
                resolve(fn(...args));
            }, delay);
        });
    };
};

// 节流（Throttle）- 限制频率
const throttle = (fn, limit) => {
    let inThrottle;
    return (...args) => {
        if (!inThrottle) {
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
            return fn(...args);
        }
        return Promise.resolve();
    };
};

// 使用示例
const debouncedSearch = debounce(async (query) => {
    const results = await fetch(`/api/search?q=${query}`);
    return results.json();
}, 500);

const throttledScroll = throttle(async () => {
    const scrollPosition = window.scrollY;
    await updateScrollIndicator(scrollPosition);
}, 100);
```

### 3. 取消异步操作

```javascript
// 使用AbortController
const fetchWithCancel = (url) => {
    const controller = new AbortController();
    
    const promise = fetch(url, {
        signal: controller.signal
    }).then(r => r.json());
    
    // 返回promise和取消函数
    return {
        promise,
        cancel: () => controller.abort()
    };
};

// 使用
const { promise, cancel } = fetchWithCancel('/api/large-data');

// 5秒后取消
setTimeout(cancel, 5000);

try {
    const data = await promise;
    console.log('数据:', data);
} catch (error) {
    if (error.name === 'AbortError') {
        console.log('请求被取消');
    } else {
        console.error('请求失败:', error);
    }
}

// 可取消的Promise包装器
class CancelablePromise {
    constructor(executor) {
        let cancel;
        
        this.promise = new Promise((resolve, reject) => {
            cancel = () => reject(new Error('Cancelled'));
            executor(resolve, reject);
        });
        
        this.cancel = cancel;
    }
    
    then(onFulfilled, onRejected) {
        return this.promise.then(onFulfilled, onRejected);
    }
    
    catch(onRejected) {
        return this.promise.catch(onRejected);
    }
}
```

### 4. 异步队列

```javascript
class AsyncQueue {
    constructor(concurrency = 1) {
        this.concurrency = concurrency;
        this.running = 0;
        this.queue = [];
    }
    
    async run(task) {
        while (this.running >= this.concurrency) {
            await new Promise(resolve => this.queue.push(resolve));
        }
        
        this.running++;
        try {
            return await task();
        } finally {
            this.running--;
            const resolve = this.queue.shift();
            if (resolve) resolve();
        }
    }
}

// 使用队列
const queue = new AsyncQueue(2); // 最多2个并发任务

const tasks = Array.from({ length: 10 }, (_, i) => async () => {
    console.log(`开始任务 ${i}`);
    await new Promise(r => setTimeout(r, 1000));
    console.log(`完成任务 ${i}`);
    return i;
});

const results = await Promise.all(
    tasks.map(task => queue.run(task))
);
```

### 5. 异步迭代器

```javascript
// 异步生成器
async function* asyncGenerator() {
    const items = [1, 2, 3, 4, 5];
    
    for (const item of items) {
        // 模拟异步操作
        await new Promise(r => setTimeout(r, 1000));
        yield item * 2;
    }
}

// 使用for await...of
async function consumeAsyncIterator() {
    for await (const value of asyncGenerator()) {
        console.log('值:', value);
    }
}

// 分页API的异步迭代器
async function* fetchPages(baseUrl) {
    let page = 1;
    let hasMore = true;
    
    while (hasMore) {
        const response = await fetch(`${baseUrl}?page=${page}`);
        const data = await response.json();
        
        yield data.items;
        
        hasMore = data.hasNextPage;
        page++;
    }
}

// 使用
async function processAllItems() {
    for await (const items of fetchPages('/api/items')) {
        for (const item of items) {
            await processItem(item);
        }
    }
}
```

## 💡 实战案例：构建健壮的数据加载系统

```javascript
// 综合应用：带缓存、重试、取消的数据加载器
class DataLoader {
    constructor(options = {}) {
        this.cache = new Map();
        this.pending = new Map();
        this.retries = options.retries || 3;
        this.cacheTime = options.cacheTime || 60000; // 1分钟
    }
    
    async load(key, fetcher) {
        // 检查缓存
        const cached = this.cache.get(key);
        if (cached && Date.now() - cached.time < this.cacheTime) {
            return cached.data;
        }
        
        // 检查是否正在加载
        if (this.pending.has(key)) {
            return this.pending.get(key);
        }
        
        // 创建新的加载Promise
        const promise = this._loadWithRetry(key, fetcher);
        this.pending.set(key, promise);
        
        try {
            const data = await promise;
            this.cache.set(key, { data, time: Date.now() });
            return data;
        } finally {
            this.pending.delete(key);
        }
    }
    
    async _loadWithRetry(key, fetcher, retriesLeft = this.retries) {
        try {
            return await fetcher();
        } catch (error) {
            if (retriesLeft <= 0) throw error;
            
            await new Promise(r => setTimeout(r, 1000 * (this.retries - retriesLeft + 1)));
            return this._loadWithRetry(key, fetcher, retriesLeft - 1);
        }
    }
    
    invalidate(key) {
        this.cache.delete(key);
        this.pending.delete(key);
    }
    
    invalidateAll() {
        this.cache.clear();
        this.pending.clear();
    }
}

// 使用数据加载器
const loader = new DataLoader({ retries: 3, cacheTime: 300000 });

// 加载用户数据（自动缓存和重试）
const user = await loader.load(
    `user-${userId}`,
    () => fetch(`/api/users/${userId}`).then(r => r.json())
);

// 并发加载多个资源
const [profile, posts, friends] = await Promise.all([
    loader.load(`profile-${userId}`, () => fetchProfile(userId)),
    loader.load(`posts-${userId}`, () => fetchPosts(userId)),
    loader.load(`friends-${userId}`, () => fetchFriends(userId))
]);
```

## 🎯 今日练习预览

今天的练习中，你将构建一个异步图片画廊，需要实现：

1. 异步加载图片列表
2. 显示加载进度
3. 错误处理和重试
4. 取消加载功能
5. 图片懒加载
6. 并发控制

## 🚀 下一步

明天我们将学习DOM操作与事件处理：
- 现代DOM操作方法
- 事件委托和事件冒泡
- 自定义事件
- 性能优化技巧
- 实战：构建交互式UI组件

## 💭 思考题

1. Promise.all和Promise.allSettled的区别是什么？什么时候用哪个？
2. 为什么说async/await是Promise的语法糖？
3. 如何实现一个Promise.all的polyfill？
4. 在什么情况下顺序执行比并发执行更好？
5. 如何避免async/await的常见陷阱？

记住：**异步编程是JavaScript的精髓，掌握它将让你能够构建流畅、响应迅速的Web应用！**