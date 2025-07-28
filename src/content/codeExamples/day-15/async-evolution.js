// 异步模式演进 - Day 15

// ============================================
// 1. 回调函数时代
// ============================================

console.log('=== 1. 回调函数模式 ===\n');

// 模拟异步操作
function fetchUserCallback(userId, callback) {
    console.log(`[回调] 开始获取用户 ${userId}...`);
    setTimeout(() => {
        if (userId <= 0) {
            callback(new Error('无效的用户ID'), null);
            return;
        }
        const user = { 
            id: userId, 
            name: `用户${userId}`, 
            email: `user${userId}@example.com` 
        };
        callback(null, user);
    }, 1000);
}

function fetchUserPostsCallback(user, callback) {
    console.log(`[回调] 获取 ${user.name} 的文章...`);
    setTimeout(() => {
        const posts = [
            { id: 1, title: `${user.name}的第一篇文章`, views: 100 },
            { id: 2, title: `${user.name}的第二篇文章`, views: 200 }
        ];
        callback(null, posts);
    }, 800);
}

function fetchPostCommentsCallback(post, callback) {
    console.log(`[回调] 获取文章 "${post.title}" 的评论...`);
    setTimeout(() => {
        const comments = [
            { id: 1, text: '很棒的文章！', author: '读者A' },
            { id: 2, text: '学到了很多', author: '读者B' }
        ];
        callback(null, comments);
    }, 600);
}

// 回调地狱示例
function demonstrateCallbackHell() {
    console.log('演示回调地狱：');
    
    fetchUserCallback(1, (err, user) => {
        if (err) {
            console.error('获取用户失败:', err.message);
            return;
        }
        console.log('获取到用户:', user);
        
        fetchUserPostsCallback(user, (err, posts) => {
            if (err) {
                console.error('获取文章失败:', err.message);
                return;
            }
            console.log('获取到文章:', posts);
            
            fetchPostCommentsCallback(posts[0], (err, comments) => {
                if (err) {
                    console.error('获取评论失败:', err.message);
                    return;
                }
                console.log('获取到评论:', comments);
                console.log('回调地狱完成！\n');
                
                // 继续演示Promise模式
                demonstratePromises();
            });
        });
    });
}

// ============================================
// 2. Promise时代
// ============================================

// Promise版本的函数
function fetchUserPromise(userId) {
    console.log(`[Promise] 开始获取用户 ${userId}...`);
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (userId <= 0) {
                reject(new Error('无效的用户ID'));
                return;
            }
            const user = { 
                id: userId, 
                name: `用户${userId}`, 
                email: `user${userId}@example.com` 
            };
            resolve(user);
        }, 1000);
    });
}

function fetchUserPostsPromise(user) {
    console.log(`[Promise] 获取 ${user.name} 的文章...`);
    return new Promise((resolve) => {
        setTimeout(() => {
            const posts = [
                { id: 1, title: `${user.name}的第一篇文章`, views: 100 },
                { id: 2, title: `${user.name}的第二篇文章`, views: 200 }
            ];
            resolve(posts);
        }, 800);
    });
}

function fetchPostCommentsPromise(post) {
    console.log(`[Promise] 获取文章 "${post.title}" 的评论...`);
    return new Promise((resolve) => {
        setTimeout(() => {
            const comments = [
                { id: 1, text: '很棒的文章！', author: '读者A' },
                { id: 2, text: '学到了很多', author: '读者B' }
            ];
            resolve(comments);
        }, 600);
    });
}

// Promise链式调用
function demonstratePromises() {
    console.log('\n=== 2. Promise链式调用 ===\n');
    
    fetchUserPromise(2)
        .then(user => {
            console.log('获取到用户:', user);
            return fetchUserPostsPromise(user);
        })
        .then(posts => {
            console.log('获取到文章:', posts);
            return fetchPostCommentsPromise(posts[0]);
        })
        .then(comments => {
            console.log('获取到评论:', comments);
            console.log('Promise链完成！\n');
            
            // 继续演示async/await
            demonstrateAsyncAwait();
        })
        .catch(error => {
            console.error('Promise链错误:', error.message);
        });
}

// ============================================
// 3. Async/Await时代
// ============================================

// async/await方式
async function demonstrateAsyncAwait() {
    console.log('\n=== 3. Async/Await模式 ===\n');
    
    try {
        console.log('使用async/await获取数据...');
        
        const user = await fetchUserPromise(3);
        console.log('获取到用户:', user);
        
        const posts = await fetchUserPostsPromise(user);
        console.log('获取到文章:', posts);
        
        const comments = await fetchPostCommentsPromise(posts[0]);
        console.log('获取到评论:', comments);
        
        console.log('Async/await完成！\n');
        
        // 继续演示并发处理
        demonstrateConcurrency();
    } catch (error) {
        console.error('Async/await错误:', error.message);
    }
}

// ============================================
// 4. 并发处理对比
// ============================================

async function demonstrateConcurrency() {
    console.log('\n=== 4. 并发处理对比 ===\n');
    
    // 顺序执行（慢）
    console.log('顺序执行多个用户请求：');
    console.time('顺序执行');
    
    const user1 = await fetchUserPromise(1);
    const user2 = await fetchUserPromise(2);
    const user3 = await fetchUserPromise(3);
    
    console.timeEnd('顺序执行');
    console.log('顺序获取的用户:', [user1.name, user2.name, user3.name]);
    
    // 并发执行（快）
    console.log('\n并发执行多个用户请求：');
    console.time('并发执行');
    
    const [user4, user5, user6] = await Promise.all([
        fetchUserPromise(4),
        fetchUserPromise(5),
        fetchUserPromise(6)
    ]);
    
    console.timeEnd('并发执行');
    console.log('并发获取的用户:', [user4.name, user5.name, user6.name]);
    
    // 继续演示错误处理
    demonstrateErrorHandling();
}

// ============================================
// 5. 错误处理对比
// ============================================

async function demonstrateErrorHandling() {
    console.log('\n\n=== 5. 错误处理对比 ===\n');
    
    // 回调错误处理
    console.log('回调错误处理：');
    fetchUserCallback(-1, (err, user) => {
        if (err) {
            console.log('✓ 回调捕获错误:', err.message);
        }
    });
    
    // Promise错误处理
    setTimeout(() => {
        console.log('\nPromise错误处理：');
        fetchUserPromise(-1)
            .then(user => console.log('不会执行'))
            .catch(err => console.log('✓ Promise捕获错误:', err.message));
    }, 1500);
    
    // Async/await错误处理
    setTimeout(async () => {
        console.log('\nAsync/await错误处理：');
        try {
            const user = await fetchUserPromise(-1);
            console.log('不会执行');
        } catch (err) {
            console.log('✓ Async/await捕获错误:', err.message);
        }
        
        // 继续演示实际应用
        demonstrateRealWorldExample();
    }, 3000);
}

// ============================================
// 6. 实际应用示例
// ============================================

// 模拟真实的API调用
class UserAPI {
    static async getUser(id) {
        await this._delay(500);
        return { id, name: `用户${id}`, role: 'user' };
    }
    
    static async getUserProfile(userId) {
        await this._delay(600);
        return { userId, bio: '这是个人简介', avatar: 'avatar.jpg' };
    }
    
    static async getUserActivities(userId) {
        await this._delay(700);
        return [
            { type: 'post', title: '发布了文章' },
            { type: 'comment', title: '评论了文章' }
        ];
    }
    
    static _delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

async function demonstrateRealWorldExample() {
    console.log('\n\n=== 6. 实际应用示例 ===\n');
    
    // 加载用户完整信息
    async function loadUserData(userId) {
        console.log(`加载用户 ${userId} 的完整数据...`);
        console.time('加载时间');
        
        try {
            // 方式1：顺序加载（慢）
            // const user = await UserAPI.getUser(userId);
            // const profile = await UserAPI.getUserProfile(userId);
            // const activities = await UserAPI.getUserActivities(userId);
            
            // 方式2：并发加载（快）
            const [user, profile, activities] = await Promise.all([
                UserAPI.getUser(userId),
                UserAPI.getUserProfile(userId),
                UserAPI.getUserActivities(userId)
            ]);
            
            console.timeEnd('加载时间');
            
            return {
                ...user,
                ...profile,
                activities
            };
        } catch (error) {
            console.error('加载用户数据失败:', error);
            throw error;
        }
    }
    
    // 批量加载多个用户
    async function loadMultipleUsers(userIds) {
        console.log('\n批量加载多个用户...');
        
        // 使用Promise.allSettled处理部分失败
        const results = await Promise.allSettled(
            userIds.map(id => loadUserData(id))
        );
        
        const successful = results
            .filter(r => r.status === 'fulfilled')
            .map(r => r.value);
        
        const failed = results
            .filter(r => r.status === 'rejected')
            .map((r, i) => ({ userId: userIds[i], error: r.reason }));
        
        return { successful, failed };
    }
    
    // 执行示例
    const userData = await loadUserData(1);
    console.log('用户完整数据:', userData);
    
    const { successful, failed } = await loadMultipleUsers([2, 3, 4]);
    console.log(`\n成功加载 ${successful.length} 个用户`);
    console.log(`失败 ${failed.length} 个`);
    
    console.log('\n\n🎉 异步模式演进演示完成！');
}

// ============================================
// 7. 高级模式：Promise工具函数
// ============================================

// Promise.race示例 - 超时控制
function withTimeout(promise, timeout) {
    return Promise.race([
        promise,
        new Promise((_, reject) => 
            setTimeout(() => reject(new Error('操作超时')), timeout)
        )
    ]);
}

// 重试机制
async function retry(fn, retries = 3, delay = 1000) {
    try {
        return await fn();
    } catch (error) {
        if (retries <= 0) throw error;
        
        console.log(`操作失败，${delay}ms后重试... (剩余${retries}次)`);
        await new Promise(r => setTimeout(r, delay));
        return retry(fn, retries - 1, delay * 2);
    }
}

// 并发限制
class ConcurrencyLimit {
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
            const next = this.queue.shift();
            if (next) next();
        }
    }
}

// ============================================
// 启动演示
// ============================================

console.log('🚀 异步编程模式演进演示\n');
console.log('本演示将展示JavaScript异步编程从回调到async/await的演进过程。\n');

// 开始演示
demonstrateCallbackHell();

// 导出工具函数供其他模块使用
module.exports = {
    withTimeout,
    retry,
    ConcurrencyLimit,
    UserAPI
};