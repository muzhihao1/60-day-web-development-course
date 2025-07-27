/**
 * 解构赋值示例集
 * 这个文件包含了各种解构赋值的用法和实际应用场景
 */

// ========================================
// 1. 数组解构基础
// ========================================

console.log('=== 数组解构基础 ===');

// 基本解构
const rgb = [255, 128, 0];
const [red, green, blue] = rgb;
console.log(`红: ${red}, 绿: ${green}, 蓝: ${blue}`);

// 交换变量（不需要临时变量）
let a = 1, b = 2;
console.log(`交换前: a = ${a}, b = ${b}`);
[a, b] = [b, a];
console.log(`交换后: a = ${a}, b = ${b}`);

// 跳过不需要的元素
const [first, , third] = ['第一', '第二', '第三'];
console.log(`first: ${first}, third: ${third}`);

// 解构时使用默认值
const [x, y, z = 0] = [1, 2];
console.log(`x: ${x}, y: ${y}, z: ${z}`); // z 使用默认值 0

// 剩余元素
const [head, ...tail] = [1, 2, 3, 4, 5];
console.log(`head: ${head}`);
console.log(`tail: ${tail}`); // [2, 3, 4, 5]

// ========================================
// 2. 对象解构基础
// ========================================

console.log('\n=== 对象解构基础 ===');

// 基本解构
const person = {
    name: '张三',
    age: 25,
    city: '北京'
};

const { name, age, city } = person;
console.log(`姓名: ${name}, 年龄: ${age}, 城市: ${city}`);

// 解构时重命名
const { name: personName, age: personAge } = person;
console.log(`重命名后 - 姓名: ${personName}, 年龄: ${personAge}`);

// 默认值
const { name: userName, gender = '未知' } = person;
console.log(`姓名: ${userName}, 性别: ${gender}`);

// 解构嵌套对象
const user = {
    id: 1,
    profile: {
        username: 'alice123',
        email: 'alice@example.com',
        settings: {
            theme: 'dark',
            language: 'zh-CN'
        }
    }
};

const { 
    profile: { 
        username, 
        settings: { theme } 
    } 
} = user;
console.log(`用户名: ${username}, 主题: ${theme}`);

// ========================================
// 3. 函数参数解构
// ========================================

console.log('\n=== 函数参数解构 ===');

// 数组参数解构
function calculateSum([a, b, c = 0]) {
    return a + b + c;
}

console.log(`求和 [1, 2, 3]: ${calculateSum([1, 2, 3])}`);
console.log(`求和 [5, 10]: ${calculateSum([5, 10])}`); // c 使用默认值 0

// 对象参数解构
function createUser({ 
    name = 'Anonymous', 
    age = 0, 
    role = 'user' 
} = {}) {
    return {
        name,
        age,
        role,
        createdAt: new Date().toISOString()
    };
}

console.log('创建用户（全部参数）:', createUser({ name: 'Bob', age: 30, role: 'admin' }));
console.log('创建用户（部分参数）:', createUser({ name: 'Alice' }));
console.log('创建用户（无参数）:', createUser());

// 复杂的函数参数解构
function processOrder({
    orderId,
    customer: { name, email },
    items = [],
    shipping: { address, method = 'standard' } = {}
}) {
    console.log(`订单 #${orderId}`);
    console.log(`客户: ${name} (${email})`);
    console.log(`商品数量: ${items.length}`);
    console.log(`配送方式: ${method}`);
    if (address) {
        console.log(`配送地址: ${address}`);
    }
}

const order = {
    orderId: 12345,
    customer: {
        name: '李四',
        email: 'lisi@example.com'
    },
    items: ['商品A', '商品B'],
    shipping: {
        address: '北京市朝阳区xxx路'
    }
};

processOrder(order);

// ========================================
// 4. 实际应用场景
// ========================================

console.log('\n=== 实际应用场景 ===');

// 场景1：从API响应中提取数据
const apiResponse = {
    status: 200,
    data: {
        users: [
            { id: 1, name: 'User1', active: true },
            { id: 2, name: 'User2', active: false }
        ],
        pagination: {
            page: 1,
            totalPages: 10,
            totalItems: 100
        }
    },
    message: 'Success'
};

// 提取需要的数据
const {
    status,
    data: {
        users,
        pagination: { totalPages }
    }
} = apiResponse;

console.log(`API状态: ${status}`);
console.log(`用户数: ${users.length}`);
console.log(`总页数: ${totalPages}`);

// 场景2：React组件的props解构（模拟）
function UserCard({ user: { name, avatar, bio = '暂无简介' }, showDetails = true }) {
    console.log('UserCard组件:');
    console.log(`- 姓名: ${name}`);
    console.log(`- 头像: ${avatar || '默认头像'}`);
    console.log(`- 简介: ${bio}`);
    console.log(`- 显示详情: ${showDetails}`);
}

UserCard({
    user: {
        name: '王五',
        avatar: 'avatar.jpg'
    }
});

// 场景3：配置对象的解构
function initializeApp(config = {}) {
    const {
        port = 3000,
        host = 'localhost',
        database: {
            url = 'mongodb://localhost:27017',
            name = 'myapp'
        } = {},
        features: {
            authentication = true,
            logging = true,
            cache = false
        } = {}
    } = config;
    
    console.log('\n应用配置:');
    console.log(`服务器: ${host}:${port}`);
    console.log(`数据库: ${name} at ${url}`);
    console.log(`功能开关: 认证=${authentication}, 日志=${logging}, 缓存=${cache}`);
}

initializeApp({
    port: 8080,
    database: {
        name: 'production'
    }
});

// 场景4：数组方法中的解构
console.log('\n=== 数组方法中的解构 ===');

const inventory = [
    { product: 'iPhone', price: 999, stock: 10 },
    { product: 'iPad', price: 799, stock: 5 },
    { product: 'MacBook', price: 1299, stock: 3 }
];

// 在 map 中使用解构
const priceList = inventory.map(({ product, price }) => `${product}: $${price}`);
console.log('价格列表:', priceList);

// 在 filter 中使用解构
const lowStock = inventory.filter(({ stock }) => stock < 5);
console.log('库存不足的商品:', lowStock);

// 在 reduce 中使用解构
const totalValue = inventory.reduce((sum, { price, stock }) => sum + price * stock, 0);
console.log(`库存总值: $${totalValue}`);

// ========================================
// 5. 高级技巧
// ========================================

console.log('\n=== 高级解构技巧 ===');

// 动态属性解构
const key = 'dynamicKey';
const obj = {
    staticKey: 'static value',
    dynamicKey: 'dynamic value'
};

const { [key]: dynamicValue } = obj;
console.log(`动态属性值: ${dynamicValue}`);

// 深层嵌套解构与重命名
const complexData = {
    level1: {
        level2: {
            level3: {
                target: '找到我了！'
            }
        }
    }
};

const { level1: { level2: { level3: { target: foundValue } } } } = complexData;
console.log(`深层解构结果: ${foundValue}`);

// 解构与展开运算符结合
const fullUser = {
    id: 1,
    name: '赵六',
    email: 'zhaoliu@example.com',
    role: 'admin',
    lastLogin: '2024-01-15',
    preferences: {
        theme: 'dark',
        notifications: true
    }
};

// 提取部分属性，其余的放入一个对象
const { id, name, ...userDetails } = fullUser;
console.log(`用户ID: ${id}, 姓名: ${name}`);
console.log('其他详情:', userDetails);

// 解构时的条件判断
function processData(data) {
    const { 
        items = [], 
        error = null 
    } = data || {};
    
    if (error) {
        console.log(`错误: ${error}`);
        return;
    }
    
    console.log(`处理 ${items.length} 个项目`);
}

processData({ items: [1, 2, 3] });
processData({ error: '网络错误' });
processData(); // 安全处理 undefined

// ========================================
// 6. 常见陷阱和注意事项
// ========================================

console.log('\n=== 常见陷阱和注意事项 ===');

// 陷阱1：解构 null 或 undefined
try {
    const { prop } = null; // TypeError!
} catch (e) {
    console.log('陷阱1 - 不能解构 null:', e.message);
}

// 解决方案：使用默认值
const { prop } = null || {};
console.log('安全解构 null:', prop); // undefined

// 陷阱2：已声明变量的对象解构需要括号
let existingVar;
// { existingVar } = { existingVar: 123 }; // 语法错误！
({ existingVar } = { existingVar: 123 }); // 正确
console.log('已声明变量解构:', existingVar);

// 陷阱3：嵌套解构时的默认值
const data = {
    user: null
};

// 错误方式（如果 user 是 null 会报错）
// const { user: { name } } = data;

// 正确方式
const { user: { name } = {} } = data;
console.log('安全的嵌套解构:', name); // undefined

// ========================================
// 7. 性能考虑
// ========================================

console.log('\n=== 性能考虑 ===');

// 解构 vs 直接访问
const testObj = { a: 1, b: 2, c: 3, d: 4, e: 5 };

console.time('解构赋值');
for (let i = 0; i < 100000; i++) {
    const { a, b, c, d, e } = testObj;
}
console.timeEnd('解构赋值');

console.time('直接访问');
for (let i = 0; i < 100000; i++) {
    const a = testObj.a;
    const b = testObj.b;
    const c = testObj.c;
    const d = testObj.d;
    const e = testObj.e;
}
console.timeEnd('直接访问');

console.log('\n提示: 解构在大多数情况下性能足够好，代码可读性更重要！');

// ========================================
// 8. 实用工具函数
// ========================================

console.log('\n=== 实用工具函数 ===');

// 使用解构实现 pick 函数
function pick(obj, ...keys) {
    return keys.reduce((result, key) => {
        if (key in obj) {
            result[key] = obj[key];
        }
        return result;
    }, {});
}

const original = { a: 1, b: 2, c: 3, d: 4 };
const picked = pick(original, 'a', 'c');
console.log('pick 结果:', picked); // { a: 1, c: 3 }

// 使用解构实现 omit 函数
function omit(obj, ...keys) {
    const { ...copy } = obj;
    keys.forEach(key => delete copy[key]);
    return copy;
}

const omitted = omit(original, 'b', 'd');
console.log('omit 结果:', omitted); // { a: 1, c: 3 }

// 使用解构实现 rename 函数
function renameKeys(obj, keyMap) {
    return Object.entries(obj).reduce((result, [key, value]) => {
        const newKey = keyMap[key] || key;
        result[newKey] = value;
        return result;
    }, {});
}

const renamed = renameKeys(
    { name: 'Alice', age: 30 },
    { name: 'fullName', age: 'years' }
);
console.log('rename 结果:', renamed); // { fullName: 'Alice', years: 30 }

console.log('\n=== 解构赋值示例完成 ===');