// 数组方法链式调用 - Day 14

// ============================================
// 1. 基础数组方法
// ============================================

const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// map - 转换每个元素
const doubled = numbers.map(n => n * 2);
console.log('Doubled:', doubled);

// filter - 过滤元素
const evens = numbers.filter(n => n % 2 === 0);
console.log('Evens:', evens);

// reduce - 聚合元素
const sum = numbers.reduce((acc, n) => acc + n, 0);
console.log('Sum:', sum);

// ============================================
// 2. 链式调用
// ============================================

// 获取所有偶数，翻倍，然后求和
const result = numbers
    .filter(n => n % 2 === 0)    // [2, 4, 6, 8, 10]
    .map(n => n * 2)              // [4, 8, 12, 16, 20]
    .reduce((acc, n) => acc + n, 0); // 60

console.log('\n链式调用结果:', result);

// ============================================
// 3. 实战示例：处理用户数据
// ============================================

const users = [
    { id: 1, name: '张三', age: 25, city: '北京', salary: 10000, active: true },
    { id: 2, name: '李四', age: 30, city: '上海', salary: 15000, active: true },
    { id: 3, name: '王五', age: 28, city: '北京', salary: 12000, active: false },
    { id: 4, name: '赵六', age: 22, city: '深圳', salary: 8000, active: true },
    { id: 5, name: '钱七', age: 35, city: '上海', salary: 20000, active: true },
    { id: 6, name: '孙八', age: 19, city: '北京', salary: 6000, active: false }
];

// 复杂的数据处理管道
const processedUsers = users
    // 1. 过滤活跃用户
    .filter(user => user.active)
    // 2. 过滤成年人
    .filter(user => user.age >= 20)
    // 3. 添加计算字段
    .map(user => ({
        ...user,
        monthlyTax: user.salary * 0.1,
        netSalary: user.salary * 0.9,
        category: user.salary > 12000 ? '高收入' : '普通收入'
    }))
    // 4. 按城市分组
    .reduce((groups, user) => {
        const city = user.city;
        if (!groups[city]) {
            groups[city] = [];
        }
        groups[city].push(user);
        return groups;
    }, {});

console.log('\n按城市分组的用户:', processedUsers);

// ============================================
// 4. 自定义数组方法实现
// ============================================

// 实现自己的map
Array.prototype.myMap = function(fn) {
    const result = [];
    for (let i = 0; i < this.length; i++) {
        result.push(fn(this[i], i, this));
    }
    return result;
};

// 实现自己的filter
Array.prototype.myFilter = function(predicate) {
    const result = [];
    for (let i = 0; i < this.length; i++) {
        if (predicate(this[i], i, this)) {
            result.push(this[i]);
        }
    }
    return result;
};

// 实现自己的reduce
Array.prototype.myReduce = function(fn, initial) {
    let acc = initial;
    let startIndex = 0;
    
    if (initial === undefined) {
        acc = this[0];
        startIndex = 1;
    }
    
    for (let i = startIndex; i < this.length; i++) {
        acc = fn(acc, this[i], i, this);
    }
    
    return acc;
};

// 测试自定义方法
console.log('\n自定义方法测试:');
const testNumbers = [1, 2, 3, 4, 5];
console.log('myMap:', testNumbers.myMap(x => x * 2));
console.log('myFilter:', testNumbers.myFilter(x => x > 2));
console.log('myReduce:', testNumbers.myReduce((a, b) => a + b, 0));

// ============================================
// 5. 高级数组方法
// ============================================

// find - 找到第一个满足条件的元素
const firstHighEarner = users.find(user => user.salary > 15000);
console.log('\n第一个高收入者:', firstHighEarner);

// findIndex - 找到第一个满足条件的索引
const index = users.findIndex(user => user.name === '王五');
console.log('王五的索引:', index);

// some - 检查是否有元素满足条件
const hasMinor = users.some(user => user.age < 18);
console.log('是否有未成年人:', hasMinor);

// every - 检查是否所有元素都满足条件
const allActive = users.every(user => user.active);
console.log('是否所有用户都活跃:', allActive);

// flatMap - map + flatten
const departments = [
    {
        name: '技术部',
        teams: [
            { name: '前端组', members: ['张三', '李四'] },
            { name: '后端组', members: ['王五', '赵六'] }
        ]
    },
    {
        name: '产品部',
        teams: [
            { name: '设计组', members: ['钱七', '孙八'] }
        ]
    }
];

const allMembers = departments.flatMap(dept => 
    dept.teams.flatMap(team => 
        team.members.map(member => ({
            name: member,
            department: dept.name,
            team: team.name
        }))
    )
);

console.log('\n所有成员:', allMembers);

// ============================================
// 6. 实战案例：订单数据分析
// ============================================

const orders = [
    {
        orderId: 'ORD001',
        customer: '张三',
        date: '2024-01-15',
        items: [
            { product: '笔记本', category: '电子产品', price: 5000, quantity: 1 },
            { product: '鼠标', category: '电子产品', price: 100, quantity: 2 }
        ]
    },
    {
        orderId: 'ORD002',
        customer: '李四',
        date: '2024-01-16',
        items: [
            { product: '书籍', category: '图书', price: 50, quantity: 3 },
            { product: '笔', category: '文具', price: 10, quantity: 5 }
        ]
    },
    {
        orderId: 'ORD003',
        customer: '王五',
        date: '2024-01-17',
        items: [
            { product: '键盘', category: '电子产品', price: 300, quantity: 1 },
            { product: '显示器', category: '电子产品', price: 2000, quantity: 1 }
        ]
    }
];

// 分析订单数据
const orderAnalysis = orders
    // 1. 添加订单总额
    .map(order => ({
        ...order,
        total: order.items.reduce((sum, item) => 
            sum + (item.price * item.quantity), 0
        ),
        itemCount: order.items.reduce((count, item) => 
            count + item.quantity, 0
        )
    }))
    // 2. 过滤大额订单
    .filter(order => order.total > 1000)
    // 3. 提取关键信息
    .map(order => ({
        orderId: order.orderId,
        customer: order.customer,
        total: order.total,
        itemCount: order.itemCount,
        avgItemPrice: order.total / order.itemCount
    }))
    // 4. 按总额排序
    .sort((a, b) => b.total - a.total);

console.log('\n订单分析结果:', orderAnalysis);

// 按类别统计销售额
const salesByCategory = orders
    .flatMap(order => order.items)
    .reduce((stats, item) => {
        const category = item.category;
        const revenue = item.price * item.quantity;
        
        if (!stats[category]) {
            stats[category] = {
                totalRevenue: 0,
                totalQuantity: 0,
                products: new Set()
            };
        }
        
        stats[category].totalRevenue += revenue;
        stats[category].totalQuantity += item.quantity;
        stats[category].products.add(item.product);
        
        return stats;
    }, {});

// 转换为数组并排序
const categoryStats = Object.entries(salesByCategory)
    .map(([category, stats]) => ({
        category,
        revenue: stats.totalRevenue,
        quantity: stats.totalQuantity,
        productCount: stats.products.size,
        avgPrice: stats.totalRevenue / stats.totalQuantity
    }))
    .sort((a, b) => b.revenue - a.revenue);

console.log('\n按类别统计:', categoryStats);

// ============================================
// 7. 性能优化：避免中间数组
// ============================================

// 传统链式调用（创建多个中间数组）
const traditionalResult = numbers
    .filter(n => n > 5)
    .map(n => n * 2)
    .reduce((sum, n) => sum + n, 0);

// 使用reduce一次完成（避免中间数组）
const optimizedResult = numbers.reduce((sum, n) => {
    if (n > 5) {
        return sum + (n * 2);
    }
    return sum;
}, 0);

console.log('\n性能优化:');
console.log('传统方式:', traditionalResult);
console.log('优化方式:', optimizedResult);

// 使用transducer模式
const compose = (...fns) => x => fns.reduceRight((acc, fn) => fn(acc), x);

const mapping = (mapper) => (reducer) => (acc, val) => 
    reducer(acc, mapper(val));

const filtering = (predicate) => (reducer) => (acc, val) => 
    predicate(val) ? reducer(acc, val) : acc;

const sumReducer = (acc, val) => acc + val;

const transducer = compose(
    filtering(n => n > 5),
    mapping(n => n * 2)
);

const transducerResult = numbers.reduce(transducer(sumReducer), 0);
console.log('Transducer方式:', transducerResult);

// ============================================
// 8. 实用工具函数
// ============================================

// 分块处理大数组
const chunk = (array, size) => {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
};

// 去重
const unique = (array) => [...new Set(array)];

// 按属性分组
const groupBy = (array, key) => {
    return array.reduce((groups, item) => {
        const group = item[key];
        groups[group] = groups[group] || [];
        groups[group].push(item);
        return groups;
    }, {});
};

// 扁平化嵌套数组
const flatten = (array) => {
    return array.reduce((flat, item) => {
        return flat.concat(Array.isArray(item) ? flatten(item) : item);
    }, []);
};

console.log('\n工具函数示例:');
console.log('分块:', chunk([1,2,3,4,5,6,7,8,9], 3));
console.log('去重:', unique([1,2,2,3,3,3,4]));
console.log('按城市分组:', groupBy(users.slice(0, 3), 'city'));
console.log('扁平化:', flatten([1, [2, 3], [4, [5, 6]]]));

// ============================================
// 导出工具函数
// ============================================

module.exports = {
    chunk,
    unique,
    groupBy,
    flatten,
    compose
};