/**
 * 箭头函数对比演示
 * 详细展示箭头函数与传统函数的区别和使用场景
 */

// ========================================
// 1. 语法对比
// ========================================

console.log('=== 语法对比 ===');

// 传统函数声明
function traditionalFunction(x) {
    return x * 2;
}

// 函数表达式
const traditionalExpression = function(x) {
    return x * 2;
};

// 箭头函数 - 完整形式
const arrowFull = (x) => {
    return x * 2;
};

// 箭头函数 - 简化形式（单参数可省略括号）
const arrowSimple = x => x * 2;

// 箭头函数 - 多参数
const arrowMultiple = (x, y) => x + y;

// 箭头函数 - 无参数
const arrowNoParams = () => console.log('无参数箭头函数');

// 测试所有函数
console.log('传统函数:', traditionalFunction(5));
console.log('传统表达式:', traditionalExpression(5));
console.log('箭头函数（完整）:', arrowFull(5));
console.log('箭头函数（简化）:', arrowSimple(5));
console.log('箭头函数（多参数）:', arrowMultiple(3, 4));
arrowNoParams();

// ========================================
// 2. 返回值的不同写法
// ========================================

console.log('\n=== 返回值写法 ===');

// 隐式返回（单行表达式）
const implicit = x => x * 2;
console.log('隐式返回:', implicit(5));

// 显式返回（多行需要花括号和return）
const explicit = x => {
    const doubled = x * 2;
    return doubled;
};
console.log('显式返回:', explicit(5));

// 返回对象字面量（需要括号）
const returnObject = (name, age) => ({ name, age });
console.log('返回对象:', returnObject('Alice', 30));

// 错误示例（没有括号会被解析为代码块）
// const wrongObject = (name, age) => { name, age }; // 语法错误！

// 返回数组
const returnArray = (...args) => [...args];
console.log('返回数组:', returnArray(1, 2, 3));

// ========================================
// 3. this 绑定差异（最重要的区别）
// ========================================

console.log('\n=== this 绑定差异 ===');

// 示例对象
const obj = {
    name: 'MyObject',
    
    // 传统函数方法
    traditionalMethod: function() {
        console.log('传统方法 this.name:', this.name);
        
        // 嵌套函数中的 this 问题
        function nestedTraditional() {
            console.log('传统嵌套 this.name:', this.name); // undefined
        }
        nestedTraditional();
        
        // 传统解决方案1：保存 this
        const self = this;
        function nestedWithSelf() {
            console.log('使用 self.name:', self.name);
        }
        nestedWithSelf();
        
        // 传统解决方案2：bind
        function nestedWithBind() {
            console.log('使用 bind this.name:', this.name);
        }
        nestedWithBind.bind(this)();
    },
    
    // 箭头函数方法（注意：通常不推荐）
    arrowMethod: () => {
        console.log('箭头方法 this.name:', this.name); // undefined
    },
    
    // 混合使用（推荐方式）
    mixedMethod: function() {
        console.log('混合方法 this.name:', this.name);
        
        // 箭头函数继承外层 this
        const nestedArrow = () => {
            console.log('箭头嵌套 this.name:', this.name); // MyObject
        };
        nestedArrow();
        
        // 在回调中特别有用
        setTimeout(() => {
            console.log('setTimeout 箭头 this.name:', this.name); // MyObject
        }, 10);
        
        // 对比传统函数回调
        setTimeout(function() {
            console.log('setTimeout 传统 this.name:', this.name); // undefined
        }, 20);
    }
};

// 测试不同的方法
console.log('--- 传统方法 ---');
obj.traditionalMethod();

console.log('\n--- 箭头方法 ---');
obj.arrowMethod();

console.log('\n--- 混合方法 ---');
obj.mixedMethod();

// ========================================
// 4. 不能使用的场景
// ========================================

console.log('\n=== 箭头函数的限制 ===');

// 1. 不能作为构造函数
console.log('1. 构造函数限制:');
function TraditionalConstructor(name) {
    this.name = name;
}
const ArrowConstructor = (name) => {
    this.name = name;
};

const traditional = new TraditionalConstructor('传统');
console.log('传统构造函数:', traditional.name);

try {
    const arrow = new ArrowConstructor('箭头');
} catch (e) {
    console.log('箭头构造函数错误:', e.message);
}

// 2. 没有 arguments 对象
console.log('\n2. arguments 对象:');
function traditionalArgs() {
    console.log('传统函数 arguments:', Array.from(arguments));
}

const arrowArgs = () => {
    try {
        console.log(arguments);
    } catch (e) {
        console.log('箭头函数无 arguments');
    }
};

// 使用剩余参数代替
const arrowRest = (...args) => {
    console.log('箭头函数剩余参数:', args);
};

traditionalArgs(1, 2, 3);
arrowArgs(1, 2, 3);
arrowRest(1, 2, 3);

// 3. 没有 prototype 属性
console.log('\n3. prototype 属性:');
console.log('传统函数 prototype:', typeof TraditionalConstructor.prototype);
console.log('箭头函数 prototype:', ArrowConstructor.prototype);

// 4. 不能使用 yield（不能作为生成器函数）
console.log('\n4. 生成器函数:');
function* traditionalGenerator() {
    yield 1;
    yield 2;
}

// const arrowGenerator = * () => { yield 1; }; // 语法错误！

// ========================================
// 5. 实际应用场景
// ========================================

console.log('\n=== 实际应用场景 ===');

// 场景1：数组方法
console.log('场景1：数组方法');
const numbers = [1, 2, 3, 4, 5];

// 传统写法
const doubled1 = numbers.map(function(n) {
    return n * 2;
});

// 箭头函数
const doubled2 = numbers.map(n => n * 2);

console.log('传统 map:', doubled1);
console.log('箭头 map:', doubled2);

// 链式调用
const result = numbers
    .filter(n => n % 2 === 0)
    .map(n => n * n)
    .reduce((sum, n) => sum + n, 0);
console.log('链式调用结果:', result);

// 场景2：事件处理和回调
console.log('\n场景2：事件处理和回调');

class Button {
    constructor(label) {
        this.label = label;
        this.clickCount = 0;
    }
    
    // 使用箭头函数作为事件处理器
    handleClickArrow = () => {
        this.clickCount++;
        console.log(`${this.label} 被点击 ${this.clickCount} 次`);
    }
    
    // 传统方法需要 bind
    handleClickTraditional() {
        this.clickCount++;
        console.log(`${this.label} 被点击 ${this.clickCount} 次`);
    }
    
    simulateClick() {
        // 箭头函数自动绑定 this
        this.handleClickArrow();
        
        // 传统函数需要 bind
        const boundHandler = this.handleClickTraditional.bind(this);
        boundHandler();
    }
}

const button = new Button('测试按钮');
button.simulateClick();

// 场景3：Promise 和异步操作
console.log('\n场景3：Promise 链');

const fetchData = () => Promise.resolve({ data: 'Hello' });
const processData = data => data.toUpperCase();
const logData = result => console.log('处理结果:', result);

// 使用箭头函数的 Promise 链
fetchData()
    .then(response => response.data)
    .then(processData)
    .then(logData)
    .catch(error => console.error('错误:', error));

// 场景4：函数式编程
console.log('\n场景4：函数式编程');

// 柯里化
const multiply = x => y => x * y;
const double = multiply(2);
const triple = multiply(3);

console.log('double(5):', double(5));
console.log('triple(5):', triple(5));

// 函数组合
const compose = (...fns) => x => fns.reduceRight((v, f) => f(v), x);

const addOne = x => x + 1;
const square = x => x * x;
const composed = compose(square, addOne);

console.log('composed(5):', composed(5)); // (5 + 1)² = 36

// ========================================
// 6. 性能考虑
// ========================================

console.log('\n=== 性能考虑 ===');

// 创建大量函数时的性能测试
console.time('传统函数创建');
const traditionalFunctions = [];
for (let i = 0; i < 100000; i++) {
    traditionalFunctions.push(function(x) { return x * 2; });
}
console.timeEnd('传统函数创建');

console.time('箭头函数创建');
const arrowFunctions = [];
for (let i = 0; i < 100000; i++) {
    arrowFunctions.push(x => x * 2);
}
console.timeEnd('箭头函数创建');

// ========================================
// 7. 最佳实践
// ========================================

console.log('\n=== 最佳实践 ===');

// 1. 使用箭头函数的场景
const bestPractices = {
    // ✅ 数组方法回调
    goodArrayCallback: () => {
        return [1, 2, 3].map(x => x * 2);
    },
    
    // ✅ Promise 回调
    goodPromiseCallback: () => {
        return Promise.resolve(1).then(x => x + 1);
    },
    
    // ✅ 需要保持外层 this 的回调
    goodThisPreservation: function() {
        setTimeout(() => {
            console.log('保持 this:', this);
        }, 0);
    }
};

// 2. 避免使用箭头函数的场景
const avoidArrows = {
    // ❌ 对象方法（需要动态 this）
    // badMethod: () => this.property,
    
    // ✅ 使用普通函数
    goodMethod: function() {
        return this.property;
    },
    
    // ❌ 原型方法
    // MyClass.prototype.method = () => this.value;
    
    // ✅ 使用普通函数
    prototypeMethod: function() {
        return this.value;
    }
};

// 3. 混合使用示例
class DataProcessor {
    constructor(data) {
        this.data = data;
    }
    
    // 普通方法（需要 this）
    process() {
        return this.data
            // 箭头函数用于回调（不需要自己的 this）
            .filter(item => item.active)
            .map(item => ({
                ...item,
                processed: true,
                // 箭头函数保持外层 this
                processedBy: this.getName()
            }));
    }
    
    getName() {
        return 'DataProcessor';
    }
}

const processor = new DataProcessor([
    { id: 1, active: true },
    { id: 2, active: false },
    { id: 3, active: true }
]);

console.log('处理结果:', processor.process());

console.log('\n=== 箭头函数演示完成 ===');