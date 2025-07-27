# 练习：JavaScript 现代化改造

## 练习目标

在这个练习中，你将把传统的ES5代码逐步重构为使用ES6+的现代语法。每个任务都专注于特定的ES6特性，帮助你巩固今天学到的知识。

## 任务1：变量声明现代化

将下面的代码改为使用 `let` 和 `const`：

```javascript
// 原始代码
var APP_NAME = 'MyApp';
var version = '1.0.0';
var users = [];

function addUser(name) {
    var user = {
        id: Date.now(),
        name: name
    };
    users.push(user);
    
    for (var i = 0; i < users.length; i++) {
        var currentUser = users[i];
        console.log(currentUser.name);
    }
}

// 你的改写：
```

## 任务2：函数参数优化

使用默认参数和解构改写以下函数：

```javascript
// 原始代码
function createProduct(options) {
    options = options || {};
    var name = options.name || 'Unknown Product';
    var price = options.price !== undefined ? options.price : 0;
    var category = options.category || 'General';
    var inStock = options.inStock !== undefined ? options.inStock : true;
    
    return {
        name: name,
        price: price,
        category: category,
        inStock: inStock,
        createdAt: new Date()
    };
}

// 调用示例
var product1 = createProduct({ name: 'iPhone', price: 999 });
var product2 = createProduct();

// 你的改写：
```

## 任务3：数组操作现代化

使用箭头函数、展开运算符和数组方法改写：

```javascript
// 原始代码
function processOrders(orders) {
    var validOrders = [];
    var totalAmount = 0;
    
    for (var i = 0; i < orders.length; i++) {
        if (orders[i].status === 'completed') {
            validOrders.push(orders[i]);
        }
    }
    
    for (var j = 0; j < validOrders.length; j++) {
        totalAmount += validOrders[j].amount;
    }
    
    var orderIds = [];
    for (var k = 0; k < validOrders.length; k++) {
        orderIds.push(validOrders[k].id);
    }
    
    return {
        orders: validOrders,
        total: totalAmount,
        ids: orderIds,
        count: validOrders.length
    };
}

// 测试数据
var testOrders = [
    { id: 1, amount: 100, status: 'completed' },
    { id: 2, amount: 200, status: 'pending' },
    { id: 3, amount: 150, status: 'completed' }
];

// 你的改写：
```

## 任务4：字符串处理升级

使用模板字符串改写所有字符串拼接：

```javascript
// 原始代码
function generateReport(data) {
    var header = '=== ' + data.title + ' ===\n';
    var date = 'Date: ' + data.date + '\n';
    var author = 'Author: ' + data.author + '\n\n';
    
    var content = 'Summary:\n';
    content += data.summary + '\n\n';
    
    content += 'Details:\n';
    for (var i = 0; i < data.items.length; i++) {
        content += '- Item ' + (i + 1) + ': ' + data.items[i].name + 
                  ' (Value: $' + data.items[i].value + ')\n';
    }
    
    var total = 0;
    for (var j = 0; j < data.items.length; j++) {
        total += data.items[j].value;
    }
    
    content += '\nTotal Value: $' + total.toFixed(2);
    
    return header + date + author + content;
}

// 测试数据
var reportData = {
    title: 'Monthly Sales Report',
    date: '2024-01-15',
    author: 'John Doe',
    summary: 'This month showed strong growth',
    items: [
        { name: 'Product A', value: 1200.50 },
        { name: 'Product B', value: 800.00 }
    ]
};

// 你的改写：
```

## 任务5：对象操作现代化

使用对象解构、属性简写和展开运算符：

```javascript
// 原始代码
function mergeUserData(basicInfo, contactInfo, preferences) {
    var user = {};
    
    // 复制基本信息
    user.id = basicInfo.id;
    user.name = basicInfo.name;
    user.age = basicInfo.age;
    
    // 复制联系信息
    user.email = contactInfo.email;
    user.phone = contactInfo.phone;
    user.address = contactInfo.address;
    
    // 复制偏好设置
    user.theme = preferences.theme;
    user.language = preferences.language;
    user.notifications = preferences.notifications;
    
    // 添加元数据
    user.lastUpdated = new Date();
    user.version = 2;
    
    return user;
}

function updateUser(user, updates) {
    var updatedUser = {};
    
    // 复制原有属性
    for (var key in user) {
        if (user.hasOwnProperty(key)) {
            updatedUser[key] = user[key];
        }
    }
    
    // 应用更新
    for (var updateKey in updates) {
        if (updates.hasOwnProperty(updateKey)) {
            updatedUser[updateKey] = updates[updateKey];
        }
    }
    
    updatedUser.lastUpdated = new Date();
    
    return updatedUser;
}

// 你的改写：
```

## 任务6：异步代码现代化（挑战）

将回调风格的代码改为使用Promise和箭头函数：

```javascript
// 原始代码
function loadUserData(userId, callback) {
    setTimeout(function() {
        var user = { id: userId, name: 'User ' + userId };
        callback(null, user);
    }, 1000);
}

function loadUserPosts(userId, callback) {
    setTimeout(function() {
        var posts = [
            { id: 1, title: 'Post 1', userId: userId },
            { id: 2, title: 'Post 2', userId: userId }
        ];
        callback(null, posts);
    }, 1000);
}

function loadUserComments(userId, callback) {
    setTimeout(function() {
        var comments = [
            { id: 1, text: 'Great post!', userId: userId },
            { id: 2, text: 'Thanks for sharing', userId: userId }
        ];
        callback(null, comments);
    }, 1000);
}

// 使用方式
loadUserData(1, function(err, user) {
    if (err) {
        console.error('Error loading user:', err);
        return;
    }
    
    console.log('User:', user);
    
    loadUserPosts(user.id, function(err, posts) {
        if (err) {
            console.error('Error loading posts:', err);
            return;
        }
        
        console.log('Posts:', posts);
        
        loadUserComments(user.id, function(err, comments) {
            if (err) {
                console.error('Error loading comments:', err);
                return;
            }
            
            console.log('Comments:', comments);
            console.log('All data loaded!');
        });
    });
});

// 你的改写（提示：创建返回Promise的版本）：
```

## 综合练习：完整重构

将这个完整的ES5风格的购物车类改写为使用所有学到的ES6+特性：

```javascript
// 原始代码
function ShoppingCart() {
    this.items = [];
    this.total = 0;
}

ShoppingCart.prototype.addItem = function(product, quantity) {
    quantity = quantity || 1;
    
    var existingItem = null;
    for (var i = 0; i < this.items.length; i++) {
        if (this.items[i].product.id === product.id) {
            existingItem = this.items[i];
            break;
        }
    }
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        this.items.push({
            product: product,
            quantity: quantity
        });
    }
    
    this.updateTotal();
};

ShoppingCart.prototype.removeItem = function(productId) {
    var newItems = [];
    for (var i = 0; i < this.items.length; i++) {
        if (this.items[i].product.id !== productId) {
            newItems.push(this.items[i]);
        }
    }
    this.items = newItems;
    this.updateTotal();
};

ShoppingCart.prototype.updateTotal = function() {
    var sum = 0;
    for (var i = 0; i < this.items.length; i++) {
        sum += this.items[i].product.price * this.items[i].quantity;
    }
    this.total = sum;
};

ShoppingCart.prototype.getItemCount = function() {
    var count = 0;
    for (var i = 0; i < this.items.length; i++) {
        count += this.items[i].quantity;
    }
    return count;
};

ShoppingCart.prototype.getSummary = function() {
    var summary = 'Shopping Cart Summary\n';
    summary += '====================\n';
    
    for (var i = 0; i < this.items.length; i++) {
        var item = this.items[i];
        summary += item.product.name + ' x ' + item.quantity + 
                  ' = $' + (item.product.price * item.quantity).toFixed(2) + '\n';
    }
    
    summary += '--------------------\n';
    summary += 'Total: $' + this.total.toFixed(2) + '\n';
    summary += 'Items: ' + this.getItemCount();
    
    return summary;
};

// 使用示例
var cart = new ShoppingCart();
cart.addItem({ id: 1, name: 'Laptop', price: 999.99 }, 1);
cart.addItem({ id: 2, name: 'Mouse', price: 29.99 }, 2);
console.log(cart.getSummary());

// 你的ES6+改写：
```

## 提交要求

1. 每个任务都应该使用相应的ES6+特性
2. 代码应该保持原有功能不变
3. 添加必要的注释说明你使用了哪些ES6特性
4. 确保所有代码都能正常运行

## 额外挑战

完成以上任务后，尝试：

1. 使用 `Map` 或 `Set` 优化数据存储
2. 使用 `async/await` 重写异步代码（如果你已经了解）
3. 添加更多的ES6+特性，如 `Symbol`、`Proxy` 等
4. 为你的代码编写单元测试

记住：目标不是使用越多特性越好，而是写出更清晰、更易维护的代码！