/**
 * ES6+ 现代化改造练习 - 完整解决方案
 */

// ========================================
// 任务1：变量声明现代化
// ========================================

console.log('=== 任务1：变量声明现代化 ===');

// ES6+ 改写
const APP_NAME = 'MyApp';  // 使用 const 声明常量
let version = '1.0.0';     // 使用 let 声明可能变化的变量
const users = [];          // 数组引用不变，内容可变，使用 const

function addUser(name) {
    const user = {         // 局部常量使用 const
        id: Date.now(),
        name: name         // 或使用简写：name
    };
    users.push(user);
    
    // 使用 for...of 更简洁
    for (const currentUser of users) {  // const 因为不修改 currentUser
        console.log(currentUser.name);
    }
}

// 测试
addUser('Alice');
addUser('Bob');

// ========================================
// 任务2：函数参数优化
// ========================================

console.log('\n=== 任务2：函数参数优化 ===');

// ES6+ 改写 - 使用解构和默认参数
function createProduct({ 
    name = 'Unknown Product', 
    price = 0, 
    category = 'General', 
    inStock = true 
} = {}) {  // 整个参数的默认值是空对象
    return {
        name,      // 属性简写
        price,
        category,
        inStock,
        createdAt: new Date()
    };
}

// 调用示例
const product1 = createProduct({ name: 'iPhone', price: 999 });
const product2 = createProduct();

console.log('产品1:', product1);
console.log('产品2:', product2);

// ========================================
// 任务3：数组操作现代化
// ========================================

console.log('\n=== 任务3：数组操作现代化 ===');

// ES6+ 改写 - 使用箭头函数和数组方法
const processOrders = orders => {
    // 使用 filter 筛选完成的订单
    const validOrders = orders.filter(order => order.status === 'completed');
    
    // 使用 reduce 计算总金额
    const totalAmount = validOrders.reduce((sum, order) => sum + order.amount, 0);
    
    // 使用 map 提取 ID
    const ids = validOrders.map(order => order.id);
    
    return {
        orders: validOrders,
        total: totalAmount,
        ids,  // 属性简写
        count: validOrders.length
    };
};

// 或者更简洁的写法（一次遍历）
const processOrdersOptimized = orders => {
    const result = orders.reduce((acc, order) => {
        if (order.status === 'completed') {
            acc.orders.push(order);
            acc.total += order.amount;
            acc.ids.push(order.id);
            acc.count++;
        }
        return acc;
    }, { orders: [], total: 0, ids: [], count: 0 });
    
    return result;
};

// 测试数据
const testOrders = [
    { id: 1, amount: 100, status: 'completed' },
    { id: 2, amount: 200, status: 'pending' },
    { id: 3, amount: 150, status: 'completed' }
];

console.log('处理结果:', processOrders(testOrders));

// ========================================
// 任务4：字符串处理升级
// ========================================

console.log('\n=== 任务4：字符串处理升级 ===');

// ES6+ 改写 - 使用模板字符串
const generateReport = data => {
    // 解构参数
    const { title, date, author, summary, items } = data;
    
    // 使用模板字符串构建报告
    const header = `=== ${title} ===\n`;
    const meta = `Date: ${date}\nAuthor: ${author}\n\n`;
    
    // 使用 map 和 reduce 处理项目
    const itemsText = items
        .map((item, index) => `- Item ${index + 1}: ${item.name} (Value: $${item.value})`)
        .join('\n');
    
    const total = items.reduce((sum, item) => sum + item.value, 0);
    
    // 使用模板字符串组合所有部分
    return `${header}${meta}Summary:\n${summary}\n\nDetails:\n${itemsText}\n\nTotal Value: $${total.toFixed(2)}`;
};

// 测试数据
const reportData = {
    title: 'Monthly Sales Report',
    date: '2024-01-15',
    author: 'John Doe',
    summary: 'This month showed strong growth',
    items: [
        { name: 'Product A', value: 1200.50 },
        { name: 'Product B', value: 800.00 }
    ]
};

console.log(generateReport(reportData));

// ========================================
// 任务5：对象操作现代化
// ========================================

console.log('\n=== 任务5：对象操作现代化 ===');

// ES6+ 改写 - 使用展开运算符
const mergeUserData = (basicInfo, contactInfo, preferences) => ({
    ...basicInfo,
    ...contactInfo,
    ...preferences,
    lastUpdated: new Date(),
    version: 2
});

const updateUser = (user, updates) => ({
    ...user,
    ...updates,
    lastUpdated: new Date()
});

// 更高级的版本，支持深度合并
const deepMerge = (...objects) => {
    const isObject = obj => obj && typeof obj === 'object';
    
    return objects.reduce((prev, obj) => {
        Object.keys(obj).forEach(key => {
            const pVal = prev[key];
            const oVal = obj[key];
            
            if (Array.isArray(pVal) && Array.isArray(oVal)) {
                prev[key] = pVal.concat(...oVal);
            } else if (isObject(pVal) && isObject(oVal)) {
                prev[key] = deepMerge(pVal, oVal);
            } else {
                prev[key] = oVal;
            }
        });
        
        return prev;
    }, {});
};

// 测试
const basicInfo = { id: 1, name: 'Alice', age: 30 };
const contactInfo = { email: 'alice@example.com', phone: '123-456' };
const preferences = { theme: 'dark', language: 'en' };

console.log('合并结果:', mergeUserData(basicInfo, contactInfo, preferences));

// ========================================
// 任务6：异步代码现代化
// ========================================

console.log('\n=== 任务6：异步代码现代化 ===');

// ES6+ 改写 - 返回 Promise 的版本
const loadUserData = userId => 
    new Promise(resolve => {
        setTimeout(() => {
            resolve({ id: userId, name: `User ${userId}` });
        }, 1000);
    });

const loadUserPosts = userId => 
    new Promise(resolve => {
        setTimeout(() => {
            resolve([
                { id: 1, title: 'Post 1', userId },
                { id: 2, title: 'Post 2', userId }
            ]);
        }, 1000);
    });

const loadUserComments = userId => 
    new Promise(resolve => {
        setTimeout(() => {
            resolve([
                { id: 1, text: 'Great post!', userId },
                { id: 2, text: 'Thanks for sharing', userId }
            ]);
        }, 1000);
    });

// 使用 Promise 链
const loadAllDataPromise = userId => {
    return loadUserData(userId)
        .then(user => {
            console.log('User:', user);
            return loadUserPosts(user.id);
        })
        .then(posts => {
            console.log('Posts:', posts);
            return loadUserComments(posts[0].userId);
        })
        .then(comments => {
            console.log('Comments:', comments);
            console.log('All data loaded!');
        })
        .catch(error => {
            console.error('Error:', error);
        });
};

// 使用 async/await（更推荐）
const loadAllDataAsync = async userId => {
    try {
        const user = await loadUserData(userId);
        console.log('User:', user);
        
        const posts = await loadUserPosts(user.id);
        console.log('Posts:', posts);
        
        const comments = await loadUserComments(user.id);
        console.log('Comments:', comments);
        
        console.log('All data loaded!');
        
        return { user, posts, comments };
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
};

// 并行加载优化版本
const loadAllDataParallel = async userId => {
    try {
        const user = await loadUserData(userId);
        console.log('User:', user);
        
        // 并行加载帖子和评论
        const [posts, comments] = await Promise.all([
            loadUserPosts(user.id),
            loadUserComments(user.id)
        ]);
        
        console.log('Posts:', posts);
        console.log('Comments:', comments);
        console.log('All data loaded!');
        
        return { user, posts, comments };
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
};

// 测试异步代码
console.log('开始加载数据...');
// loadAllDataAsync(1);

// ========================================
// 综合练习：完整重构 - ES6+ 购物车类
// ========================================

console.log('\n=== 综合练习：ES6+ 购物车类 ===');

class ShoppingCart {
    constructor() {
        this.items = [];
    }
    
    // 使用默认参数
    addItem(product, quantity = 1) {
        // 使用 find 查找已存在的商品
        const existingItem = this.items.find(item => item.product.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            // 使用对象简写
            this.items.push({ product, quantity });
        }
    }
    
    removeItem(productId) {
        // 使用 filter 创建新数组
        this.items = this.items.filter(item => item.product.id !== productId);
    }
    
    // 使用 getter 自动计算总价
    get total() {
        return this.items.reduce(
            (sum, { product, quantity }) => sum + product.price * quantity, 
            0
        );
    }
    
    getItemCount() {
        // 使用 reduce 计算总数量
        return this.items.reduce((count, { quantity }) => count + quantity, 0);
    }
    
    getSummary() {
        // 使用模板字符串和数组方法
        const itemsText = this.items
            .map(({ product, quantity }) => 
                `${product.name} x ${quantity} = $${(product.price * quantity).toFixed(2)}`
            )
            .join('\n');
        
        return `Shopping Cart Summary
====================
${itemsText}
--------------------
Total: $${this.total.toFixed(2)}
Items: ${this.getItemCount()}`;
    }
    
    // 额外功能：清空购物车
    clear() {
        this.items = [];
    }
    
    // 额外功能：查找商品
    findItem(productId) {
        return this.items.find(item => item.product.id === productId);
    }
    
    // 额外功能：更新数量
    updateQuantity(productId, newQuantity) {
        const item = this.findItem(productId);
        if (item) {
            if (newQuantity <= 0) {
                this.removeItem(productId);
            } else {
                item.quantity = newQuantity;
            }
        }
    }
    
    // 额外功能：获取购物车数据（用于保存）
    toJSON() {
        return {
            items: this.items,
            total: this.total,
            itemCount: this.getItemCount()
        };
    }
    
    // 额外功能：从数据恢复购物车
    static fromJSON(data) {
        const cart = new ShoppingCart();
        data.items.forEach(({ product, quantity }) => {
            cart.addItem(product, quantity);
        });
        return cart;
    }
}

// 使用示例
const cart = new ShoppingCart();
cart.addItem({ id: 1, name: 'Laptop', price: 999.99 }, 1);
cart.addItem({ id: 2, name: 'Mouse', price: 29.99 }, 2);
cart.addItem({ id: 1, name: 'Laptop', price: 999.99 }, 1); // 添加相同商品

console.log(cart.getSummary());

// 更新数量
cart.updateQuantity(2, 3);
console.log('\n更新后的购物车:');
console.log(cart.getSummary());

// 导出为 JSON
const cartData = cart.toJSON();
console.log('\n购物车数据:', cartData);

// ========================================
// 额外示例：使用 Map 优化的购物车
// ========================================

console.log('\n=== 使用 Map 优化的购物车 ===');

class ModernShoppingCart {
    constructor() {
        // 使用 Map 存储，以产品 ID 为键
        this.items = new Map();
    }
    
    addItem(product, quantity = 1) {
        const currentQuantity = this.items.get(product.id)?.quantity || 0;
        this.items.set(product.id, {
            product,
            quantity: currentQuantity + quantity
        });
    }
    
    removeItem(productId) {
        this.items.delete(productId);
    }
    
    get total() {
        // 使用 Array.from 或展开运算符遍历 Map
        return [...this.items.values()].reduce(
            (sum, { product, quantity }) => sum + product.price * quantity,
            0
        );
    }
    
    getItemCount() {
        return [...this.items.values()].reduce(
            (count, { quantity }) => count + quantity,
            0
        );
    }
    
    getSummary() {
        const itemsText = [...this.items.values()]
            .map(({ product, quantity }) => 
                `${product.name} x ${quantity} = $${(product.price * quantity).toFixed(2)}`
            )
            .join('\n');
        
        return `Modern Shopping Cart Summary
============================
${itemsText}
----------------------------
Total: $${this.total.toFixed(2)}
Items: ${this.getItemCount()}
Unique Products: ${this.items.size}`;
    }
}

// 使用示例
const modernCart = new ModernShoppingCart();
modernCart.addItem({ id: 1, name: 'iPad', price: 799.99 }, 1);
modernCart.addItem({ id: 2, name: 'Apple Pencil', price: 129.99 }, 1);
modernCart.addItem({ id: 1, name: 'iPad', price: 799.99 }, 1);

console.log(modernCart.getSummary());

console.log('\n=== ES6+ 重构完成！===');