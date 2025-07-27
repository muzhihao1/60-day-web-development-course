/**
 * 额外挑战题解答
 * 使用更高级的 ES6+ 特性
 */

// ========================================
// 挑战1：使用 Map 和 Set 优化数据存储
// ========================================

console.log('=== 挑战1：Map 和 Set 的应用 ===');

// 用户权限管理系统
class PermissionManager {
    constructor() {
        // 使用 Map 存储用户权限，键是用户ID，值是权限 Set
        this.userPermissions = new Map();
        // 使用 Set 存储所有可用权限
        this.availablePermissions = new Set([
            'read', 'write', 'delete', 'admin'
        ]);
    }
    
    // 添加用户
    addUser(userId) {
        if (!this.userPermissions.has(userId)) {
            this.userPermissions.set(userId, new Set());
        }
    }
    
    // 授予权限
    grantPermission(userId, permission) {
        if (!this.availablePermissions.has(permission)) {
            throw new Error(`Invalid permission: ${permission}`);
        }
        
        if (!this.userPermissions.has(userId)) {
            this.addUser(userId);
        }
        
        this.userPermissions.get(userId).add(permission);
    }
    
    // 撤销权限
    revokePermission(userId, permission) {
        this.userPermissions.get(userId)?.delete(permission);
    }
    
    // 检查权限
    hasPermission(userId, permission) {
        return this.userPermissions.get(userId)?.has(permission) || false;
    }
    
    // 获取用户所有权限
    getUserPermissions(userId) {
        return [...(this.userPermissions.get(userId) || [])];
    }
    
    // 获取拥有特定权限的所有用户
    getUsersWithPermission(permission) {
        const users = [];
        for (const [userId, permissions] of this.userPermissions) {
            if (permissions.has(permission)) {
                users.push(userId);
            }
        }
        return users;
    }
}

// 测试
const pm = new PermissionManager();
pm.grantPermission('user1', 'read');
pm.grantPermission('user1', 'write');
pm.grantPermission('user2', 'read');
pm.grantPermission('admin1', 'admin');

console.log('User1 权限:', pm.getUserPermissions('user1'));
console.log('有 read 权限的用户:', pm.getUsersWithPermission('read'));
console.log('User1 有 admin 权限吗?', pm.hasPermission('user1', 'admin'));

// 缓存系统使用 Map
class LRUCache {
    constructor(capacity) {
        this.capacity = capacity;
        this.cache = new Map();
    }
    
    get(key) {
        if (!this.cache.has(key)) return undefined;
        
        // 将访问的项移到最后（最近使用）
        const value = this.cache.get(key);
        this.cache.delete(key);
        this.cache.set(key, value);
        return value;
    }
    
    put(key, value) {
        // 如果已存在，先删除
        if (this.cache.has(key)) {
            this.cache.delete(key);
        }
        
        // 如果达到容量上限，删除最早的项
        if (this.cache.size >= this.capacity) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        
        this.cache.set(key, value);
    }
    
    // 查看缓存内容
    display() {
        console.log('缓存内容:', [...this.cache.entries()]);
    }
}

// 测试 LRU 缓存
const lru = new LRUCache(3);
lru.put('a', 1);
lru.put('b', 2);
lru.put('c', 3);
lru.display(); // [['a', 1], ['b', 2], ['c', 3]]

lru.get('a'); // 访问 'a'
lru.display(); // [['b', 2], ['c', 3], ['a', 1]]

lru.put('d', 4); // 添加新项，'b' 被移除
lru.display(); // [['c', 3], ['a', 1], ['d', 4]]

// ========================================
// 挑战2：使用 async/await 重写异步代码
// ========================================

console.log('\n=== 挑战2：高级异步处理 ===');

// 模拟 API 调用
const api = {
    fetchUser: id => 
        new Promise(resolve => 
            setTimeout(() => resolve({ id, name: `User${id}` }), 100)
        ),
    
    fetchPosts: userId => 
        new Promise(resolve => 
            setTimeout(() => resolve([
                { id: 1, userId, title: 'Post 1' },
                { id: 2, userId, title: 'Post 2' }
            ]), 100)
        ),
    
    fetchComments: postId => 
        new Promise(resolve => 
            setTimeout(() => resolve([
                { id: 1, postId, text: 'Comment 1' },
                { id: 2, postId, text: 'Comment 2' }
            ]), 100)
        )
};

// 串行处理
async function fetchUserDataSerial(userId) {
    console.time('串行处理');
    
    const user = await api.fetchUser(userId);
    const posts = await api.fetchPosts(user.id);
    
    // 串行获取每个帖子的评论
    const postsWithComments = [];
    for (const post of posts) {
        const comments = await api.fetchComments(post.id);
        postsWithComments.push({ ...post, comments });
    }
    
    console.timeEnd('串行处理');
    return { user, posts: postsWithComments };
}

// 并行处理优化
async function fetchUserDataParallel(userId) {
    console.time('并行处理');
    
    const user = await api.fetchUser(userId);
    const posts = await api.fetchPosts(user.id);
    
    // 并行获取所有评论
    const postsWithComments = await Promise.all(
        posts.map(async post => {
            const comments = await api.fetchComments(post.id);
            return { ...post, comments };
        })
    );
    
    console.timeEnd('并行处理');
    return { user, posts: postsWithComments };
}

// 错误处理和重试机制
async function fetchWithRetry(fn, retries = 3, delay = 1000) {
    for (let i = 0; i < retries; i++) {
        try {
            return await fn();
        } catch (error) {
            if (i === retries - 1) throw error;
            console.log(`重试 ${i + 1}/${retries}...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

// 超时控制
function withTimeout(promise, timeoutMs) {
    return Promise.race([
        promise,
        new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), timeoutMs)
        )
    ]);
}

// 批量处理
async function batchProcess(items, batchSize, processFn) {
    const results = [];
    
    for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        const batchResults = await Promise.all(
            batch.map(item => processFn(item))
        );
        results.push(...batchResults);
        
        console.log(`处理进度: ${Math.min(i + batchSize, items.length)}/${items.length}`);
    }
    
    return results;
}

// 测试异步处理
(async () => {
    console.log('开始异步处理测试...');
    
    // 比较串行和并行
    // await fetchUserDataSerial(1);
    // await fetchUserDataParallel(1);
    
    // 批量处理示例
    const userIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const users = await batchProcess(userIds, 3, api.fetchUser);
    console.log('批量获取的用户数:', users.length);
})();

// ========================================
// 挑战3：Symbol 和 Proxy 的应用
// ========================================

console.log('\n=== 挑战3：Symbol 和 Proxy ===');

// 使用 Symbol 创建私有属性
const privateData = Symbol('privateData');
const validateData = Symbol('validateData');

class SecureModel {
    constructor() {
        this[privateData] = {
            id: Math.random(),
            createdAt: new Date()
        };
    }
    
    [validateData](data) {
        if (!data || typeof data !== 'object') {
            throw new Error('Invalid data');
        }
    }
    
    getData() {
        return { ...this[privateData] };
    }
    
    updateData(updates) {
        this[validateData](updates);
        Object.assign(this[privateData], updates);
    }
}

// 使用 Proxy 创建观察者模式
function createObservable(target) {
    const observers = new Map();
    
    const proxy = new Proxy(target, {
        get(obj, prop) {
            return obj[prop];
        },
        
        set(obj, prop, value) {
            const oldValue = obj[prop];
            obj[prop] = value;
            
            // 通知观察者
            if (observers.has(prop)) {
                observers.get(prop).forEach(callback => {
                    callback(value, oldValue, prop);
                });
            }
            
            return true;
        }
    });
    
    // 添加观察方法
    proxy.observe = (prop, callback) => {
        if (!observers.has(prop)) {
            observers.set(prop, new Set());
        }
        observers.get(prop).add(callback);
    };
    
    proxy.unobserve = (prop, callback) => {
        observers.get(prop)?.delete(callback);
    };
    
    return proxy;
}

// 测试观察者模式
const state = createObservable({
    count: 0,
    name: 'Test'
});

state.observe('count', (newVal, oldVal) => {
    console.log(`count 变化: ${oldVal} -> ${newVal}`);
});

state.observe('name', (newVal, oldVal) => {
    console.log(`name 变化: ${oldVal} -> ${newVal}`);
});

state.count = 1;
state.count = 2;
state.name = 'Updated';

// 使用 Proxy 创建验证器
function createValidator(schema) {
    return new Proxy({}, {
        set(obj, prop, value) {
            const validator = schema[prop];
            
            if (!validator) {
                throw new Error(`Unknown property: ${prop}`);
            }
            
            if (validator.type && typeof value !== validator.type) {
                throw new Error(`${prop} must be of type ${validator.type}`);
            }
            
            if (validator.validate && !validator.validate(value)) {
                throw new Error(`Invalid value for ${prop}`);
            }
            
            obj[prop] = value;
            return true;
        }
    });
}

// 测试验证器
const userSchema = {
    name: {
        type: 'string',
        validate: v => v.length > 0
    },
    age: {
        type: 'number',
        validate: v => v >= 0 && v <= 150
    },
    email: {
        type: 'string',
        validate: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
    }
};

const validatedUser = createValidator(userSchema);

try {
    validatedUser.name = 'Alice';
    validatedUser.age = 30;
    validatedUser.email = 'alice@example.com';
    console.log('验证通过:', validatedUser);
} catch (e) {
    console.error('验证失败:', e.message);
}

// ========================================
// 挑战4：高级迭代器和生成器
// ========================================

console.log('\n=== 挑战4：迭代器和生成器 ===');

// 自定义可迭代对象
class Range {
    constructor(start, end, step = 1) {
        this.start = start;
        this.end = end;
        this.step = step;
    }
    
    *[Symbol.iterator]() {
        for (let i = this.start; i <= this.end; i += this.step) {
            yield i;
        }
    }
    
    // 反向迭代
    *reverse() {
        for (let i = this.end; i >= this.start; i -= this.step) {
            yield i;
        }
    }
    
    // 映射生成器
    *map(fn) {
        for (const value of this) {
            yield fn(value);
        }
    }
    
    // 过滤生成器
    *filter(fn) {
        for (const value of this) {
            if (fn(value)) yield value;
        }
    }
}

// 测试自定义迭代器
const range = new Range(1, 10);
console.log('范围 1-10:', [...range]);
console.log('反向:', [...range.reverse()]);
console.log('平方:', [...range.map(x => x * x)]);
console.log('偶数:', [...range.filter(x => x % 2 === 0)]);

// 无限序列生成器
function* fibonacci() {
    let [a, b] = [0, 1];
    while (true) {
        yield a;
        [a, b] = [b, a + b];
    }
}

// 从无限序列中取前 n 个
function* take(iterable, n) {
    let count = 0;
    for (const value of iterable) {
        if (count >= n) return;
        yield value;
        count++;
    }
}

console.log('斐波那契前10个:', [...take(fibonacci(), 10)]);

// 异步生成器
async function* asyncNumberGenerator() {
    for (let i = 1; i <= 5; i++) {
        await new Promise(resolve => setTimeout(resolve, 100));
        yield i;
    }
}

// 使用异步生成器
(async () => {
    console.log('异步生成器:');
    for await (const num of asyncNumberGenerator()) {
        console.log(`异步数字: ${num}`);
    }
})();

// ========================================
// 挑战5：装饰器模式（使用高阶函数）
// ========================================

console.log('\n=== 挑战5：装饰器模式 ===');

// 性能测量装饰器
function measureTime(fn) {
    return async function(...args) {
        const start = performance.now();
        try {
            const result = await fn.apply(this, args);
            const end = performance.now();
            console.log(`${fn.name} 执行时间: ${(end - start).toFixed(2)}ms`);
            return result;
        } catch (error) {
            const end = performance.now();
            console.log(`${fn.name} 失败，执行时间: ${(end - start).toFixed(2)}ms`);
            throw error;
        }
    };
}

// 缓存装饰器
function memoize(fn) {
    const cache = new Map();
    
    return function(...args) {
        const key = JSON.stringify(args);
        
        if (cache.has(key)) {
            console.log(`缓存命中: ${fn.name}(${args})`);
            return cache.get(key);
        }
        
        const result = fn.apply(this, args);
        cache.set(key, result);
        return result;
    };
}

// 重试装饰器
function retry(times = 3, delay = 1000) {
    return function(target, propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        
        descriptor.value = async function(...args) {
            for (let i = 0; i < times; i++) {
                try {
                    return await originalMethod.apply(this, args);
                } catch (error) {
                    if (i === times - 1) throw error;
                    console.log(`重试 ${i + 1}/${times}...`);
                    await new Promise(r => setTimeout(r, delay));
                }
            }
        };
        
        return descriptor;
    };
}

// 测试装饰器
const expensiveOperation = measureTime(memoize(function fibonacci(n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}));

console.log('第一次调用 fibonacci(10):', expensiveOperation(10));
console.log('第二次调用 fibonacci(10):', expensiveOperation(10));

// ========================================
// 挑战6：函数式编程工具
// ========================================

console.log('\n=== 挑战6：函数式编程工具 ===');

// 函数组合
const compose = (...fns) => x => fns.reduceRight((v, f) => f(v), x);
const pipe = (...fns) => x => fns.reduce((v, f) => f(v), x);

// 柯里化
const curry = (fn) => {
    return function curried(...args) {
        if (args.length >= fn.length) {
            return fn.apply(this, args);
        }
        return (...nextArgs) => curried(...args, ...nextArgs);
    };
};

// 部分应用
const partial = (fn, ...presetArgs) => 
    (...laterArgs) => fn(...presetArgs, ...laterArgs);

// Maybe Monad
class Maybe {
    constructor(value) {
        this.value = value;
    }
    
    static of(value) {
        return new Maybe(value);
    }
    
    isNothing() {
        return this.value === null || this.value === undefined;
    }
    
    map(fn) {
        return this.isNothing() ? Maybe.of(null) : Maybe.of(fn(this.value));
    }
    
    flatMap(fn) {
        return this.isNothing() ? Maybe.of(null) : fn(this.value);
    }
    
    getOrElse(defaultValue) {
        return this.isNothing() ? defaultValue : this.value;
    }
}

// 测试函数式工具
const add = curry((a, b, c) => a + b + c);
console.log('柯里化 add(1)(2)(3):', add(1)(2)(3));
console.log('部分应用 add(1, 2):', add(1, 2)(3));

const addTen = partial(add, 10);
console.log('预设参数 addTen(5, 5):', addTen(5, 5));

// Maybe 使用示例
const safeDivide = curry((a, b) => 
    b === 0 ? Maybe.of(null) : Maybe.of(a / b)
);

const result = Maybe.of(20)
    .flatMap(x => safeDivide(x, 2))
    .map(x => x * 3)
    .getOrElse('计算失败');

console.log('Maybe 链式计算:', result);

console.log('\n=== 所有挑战完成！===');