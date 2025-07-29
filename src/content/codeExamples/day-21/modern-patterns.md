---
title: "现代开发模式"
category: "advanced"
language: "javascript"
---

# 现代开发模式

## SOLID原则实践

```javascript
// 1. 单一职责原则 (SRP)
// ❌ 违反SRP的例子
class UserManager {
    constructor() {
        this.users = [];
    }
    
    addUser(user) {
        this.users.push(user);
        this.saveToDatabase(user);      // 数据持久化职责
        this.sendWelcomeEmail(user);    // 邮件发送职责
        this.logActivity(user, 'signup'); // 日志记录职责
    }
    
    saveToDatabase(user) { /* ... */ }
    sendWelcomeEmail(user) { /* ... */ }
    logActivity(user, action) { /* ... */ }
}

// ✅ 遵循SRP的例子
class User {
    constructor(id, name, email) {
        this.id = id;
        this.name = name;
        this.email = email;
    }
}

class UserRepository {
    async save(user) {
        // 只负责数据持久化
        return await db.users.insert(user);
    }
    
    async findById(id) {
        return await db.users.findOne({ id });
    }
}

class EmailService {
    async sendWelcomeEmail(user) {
        // 只负责发送邮件
        const template = this.getWelcomeTemplate();
        return await this.send(user.email, 'Welcome!', template);
    }
}

class ActivityLogger {
    log(user, action) {
        // 只负责记录活动
        const entry = {
            userId: user.id,
            action,
            timestamp: new Date()
        };
        return logger.info(entry);
    }
}

class UserService {
    constructor(repository, emailService, logger) {
        this.repository = repository;
        this.emailService = emailService;
        this.logger = logger;
    }
    
    async createUser(userData) {
        const user = new User(generateId(), userData.name, userData.email);
        
        await this.repository.save(user);
        await this.emailService.sendWelcomeEmail(user);
        this.logger.log(user, 'signup');
        
        return user;
    }
}

// 2. 开闭原则 (OCP)
// 基础折扣策略
class DiscountStrategy {
    calculate(order) {
        throw new Error('Must implement calculate method');
    }
}

class RegularDiscount extends DiscountStrategy {
    calculate(order) {
        return order.total * 0.05; // 5% 折扣
    }
}

class PremiumDiscount extends DiscountStrategy {
    calculate(order) {
        return order.total * 0.15; // 15% 折扣
    }
}

class SeasonalDiscount extends DiscountStrategy {
    calculate(order) {
        const month = new Date().getMonth();
        const isHolidaySeason = month === 11 || month === 0; // 12月或1月
        return isHolidaySeason ? order.total * 0.20 : 0;
    }
}

// 可以轻松添加新的折扣策略而无需修改现有代码
class OrderCalculator {
    constructor(discountStrategies = []) {
        this.discountStrategies = discountStrategies;
    }
    
    addDiscountStrategy(strategy) {
        this.discountStrategies.push(strategy);
    }
    
    calculateTotal(order) {
        let totalDiscount = 0;
        
        // 应用所有折扣策略
        this.discountStrategies.forEach(strategy => {
            totalDiscount += strategy.calculate(order);
        });
        
        return {
            subtotal: order.total,
            discount: totalDiscount,
            total: order.total - totalDiscount
        };
    }
}

// 3. 里氏替换原则 (LSP)
class Shape {
    area() {
        throw new Error('Must implement area method');
    }
    
    perimeter() {
        throw new Error('Must implement perimeter method');
    }
}

class Rectangle extends Shape {
    constructor(width, height) {
        super();
        this.width = width;
        this.height = height;
    }
    
    area() {
        return this.width * this.height;
    }
    
    perimeter() {
        return 2 * (this.width + this.height);
    }
}

class Square extends Shape {
    constructor(side) {
        super();
        this.side = side;
    }
    
    area() {
        return this.side * this.side;
    }
    
    perimeter() {
        return 4 * this.side;
    }
}

// 4. 接口隔离原则 (ISP)
// ❌ 违反ISP - 过于庞大的接口
class AllInOneInterface {
    read() {}
    write() {}
    delete() {}
    copy() {}
    move() {}
    compress() {}
    encrypt() {}
}

// ✅ 遵循ISP - 细粒度接口
class Readable {
    read() {
        throw new Error('Must implement read');
    }
}

class Writable {
    write(data) {
        throw new Error('Must implement write');
    }
}

class Deletable {
    delete() {
        throw new Error('Must implement delete');
    }
}

class Compressible {
    compress() {
        throw new Error('Must implement compress');
    }
}

// 实现类只需要实现它需要的接口
class FileHandler extends Readable {
    read() {
        // 实现读取
    }
}

class CompressedFileHandler extends Readable {
    read() {
        // 实现读取
    }
    
    compress() {
        // 实现压缩
    }
}

// 5. 依赖倒置原则 (DIP)
// 高层策略
class NotificationService {
    constructor(notifiers) {
        this.notifiers = notifiers; // 依赖抽象，而非具体实现
    }
    
    async notify(user, message) {
        const promises = this.notifiers.map(notifier => 
            notifier.send(user, message)
        );
        
        return await Promise.allSettled(promises);
    }
}

// 抽象接口
class Notifier {
    async send(user, message) {
        throw new Error('Must implement send method');
    }
}

// 具体实现
class EmailNotifier extends Notifier {
    async send(user, message) {
        console.log(`Sending email to ${user.email}: ${message}`);
        // 实际的邮件发送逻辑
    }
}

class SMSNotifier extends Notifier {
    async send(user, message) {
        console.log(`Sending SMS to ${user.phone}: ${message}`);
        // 实际的短信发送逻辑
    }
}

class PushNotifier extends Notifier {
    async send(user, message) {
        console.log(`Sending push to ${user.deviceId}: ${message}`);
        // 实际的推送通知逻辑
    }
}

// 使用
const notificationService = new NotificationService([
    new EmailNotifier(),
    new SMSNotifier(),
    new PushNotifier()
]);
```

## 设计模式实践

```javascript
// 1. 策略模式 - 支付处理
class PaymentProcessor {
    constructor() {
        this.strategies = new Map();
    }
    
    registerStrategy(type, strategy) {
        this.strategies.set(type, strategy);
    }
    
    async process(type, amount, details) {
        const strategy = this.strategies.get(type);
        
        if (!strategy) {
            throw new Error(`Unsupported payment type: ${type}`);
        }
        
        return await strategy.process(amount, details);
    }
}

class CreditCardPayment {
    async process(amount, details) {
        // 验证信用卡
        if (!this.validateCard(details.cardNumber)) {
            throw new Error('Invalid card number');
        }
        
        // 处理支付
        console.log(`Processing ${amount} via credit card`);
        
        return {
            success: true,
            transactionId: generateTransactionId(),
            method: 'credit_card'
        };
    }
    
    validateCard(number) {
        // Luhn算法验证
        return /^\d{16}$/.test(number);
    }
}

class PayPalPayment {
    async process(amount, details) {
        // PayPal处理逻辑
        console.log(`Processing ${amount} via PayPal`);
        
        return {
            success: true,
            transactionId: generateTransactionId(),
            method: 'paypal'
        };
    }
}

// 2. 观察者模式 - 事件系统
class EventEmitter {
    constructor() {
        this.events = new Map();
        this.onceEvents = new Map();
    }
    
    on(event, listener, context = null) {
        if (!this.events.has(event)) {
            this.events.set(event, []);
        }
        
        this.events.get(event).push({ listener, context });
        return this;
    }
    
    once(event, listener, context = null) {
        if (!this.onceEvents.has(event)) {
            this.onceEvents.set(event, []);
        }
        
        this.onceEvents.get(event).push({ listener, context });
        return this;
    }
    
    off(event, listener) {
        if (this.events.has(event)) {
            const listeners = this.events.get(event);
            const index = listeners.findIndex(l => l.listener === listener);
            
            if (index !== -1) {
                listeners.splice(index, 1);
            }
        }
        
        return this;
    }
    
    emit(event, ...args) {
        // 触发常规事件
        if (this.events.has(event)) {
            this.events.get(event).forEach(({ listener, context }) => {
                listener.apply(context, args);
            });
        }
        
        // 触发一次性事件
        if (this.onceEvents.has(event)) {
            const listeners = this.onceEvents.get(event);
            this.onceEvents.delete(event);
            
            listeners.forEach(({ listener, context }) => {
                listener.apply(context, args);
            });
        }
        
        return this;
    }
}

// 3. 装饰器模式 - 功能增强
function withLogging(target, propertyKey, descriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function(...args) {
        console.log(`Calling ${propertyKey} with args:`, args);
        const start = performance.now();
        
        try {
            const result = await originalMethod.apply(this, args);
            const duration = performance.now() - start;
            
            console.log(`${propertyKey} completed in ${duration.toFixed(2)}ms`);
            return result;
        } catch (error) {
            console.error(`${propertyKey} failed:`, error);
            throw error;
        }
    };
    
    return descriptor;
}

function withCache(ttl = 60000) {
    const cache = new Map();
    
    return function(target, propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        
        descriptor.value = async function(...args) {
            const key = JSON.stringify(args);
            const cached = cache.get(key);
            
            if (cached && Date.now() - cached.timestamp < ttl) {
                console.log(`Cache hit for ${propertyKey}`);
                return cached.value;
            }
            
            const result = await originalMethod.apply(this, args);
            
            cache.set(key, {
                value: result,
                timestamp: Date.now()
            });
            
            return result;
        };
        
        return descriptor;
    };
}

class DataService {
    @withLogging
    @withCache(30000)
    async fetchUserData(userId) {
        const response = await fetch(`/api/users/${userId}`);
        return response.json();
    }
}

// 4. 工厂模式 - 对象创建
class ComponentFactory {
    constructor() {
        this.components = new Map();
    }
    
    register(type, componentClass) {
        this.components.set(type, componentClass);
    }
    
    create(type, props = {}) {
        const ComponentClass = this.components.get(type);
        
        if (!ComponentClass) {
            throw new Error(`Unknown component type: ${type}`);
        }
        
        return new ComponentClass(props);
    }
}

// 5. 单例模式 - 全局实例
class ConfigManager {
    constructor() {
        if (ConfigManager.instance) {
            return ConfigManager.instance;
        }
        
        this.config = new Map();
        this.loadConfig();
        
        ConfigManager.instance = this;
    }
    
    loadConfig() {
        // 加载配置
        this.config.set('apiUrl', process.env.API_URL);
        this.config.set('debug', process.env.NODE_ENV === 'development');
    }
    
    get(key) {
        return this.config.get(key);
    }
    
    set(key, value) {
        this.config.set(key, value);
    }
    
    static getInstance() {
        if (!ConfigManager.instance) {
            ConfigManager.instance = new ConfigManager();
        }
        
        return ConfigManager.instance;
    }
}
```

## 响应式编程模式

```javascript
// 响应式状态管理
class ReactiveState {
    constructor(initialState = {}) {
        this.state = initialState;
        this.observers = new Map();
        this.computedCache = new Map();
        this.makeReactive();
    }
    
    makeReactive() {
        const handler = {
            get: (target, property) => {
                this.track(property);
                return target[property];
            },
            set: (target, property, value) => {
                const oldValue = target[property];
                
                if (oldValue === value) return true;
                
                target[property] = value;
                this.trigger(property, oldValue, value);
                
                return true;
            }
        };
        
        this.state = new Proxy(this.state, handler);
    }
    
    track(property) {
        if (ReactiveState.currentEffect) {
            if (!this.observers.has(property)) {
                this.observers.set(property, new Set());
            }
            
            this.observers.get(property).add(ReactiveState.currentEffect);
        }
    }
    
    trigger(property, oldValue, newValue) {
        const observers = this.observers.get(property);
        
        if (observers) {
            observers.forEach(effect => {
                effect(property, oldValue, newValue);
            });
        }
        
        // 清除相关的计算缓存
        this.computedCache.forEach((value, key) => {
            if (value.dependencies.has(property)) {
                this.computedCache.delete(key);
            }
        });
    }
    
    watch(getter, callback) {
        const effect = () => {
            ReactiveState.currentEffect = effect;
            const value = getter(this.state);
            ReactiveState.currentEffect = null;
            
            callback(value);
        };
        
        effect();
        
        return () => {
            this.observers.forEach(observers => {
                observers.delete(effect);
            });
        };
    }
    
    computed(key, getter) {
        if (this.computedCache.has(key)) {
            return this.computedCache.get(key).value;
        }
        
        const dependencies = new Set();
        ReactiveState.currentEffect = (property) => {
            dependencies.add(property);
        };
        
        const value = getter(this.state);
        ReactiveState.currentEffect = null;
        
        this.computedCache.set(key, { value, dependencies });
        
        return value;
    }
}

ReactiveState.currentEffect = null;

// 使用示例
const store = new ReactiveState({
    count: 0,
    multiplier: 2
});

// 监听变化
const unwatch = store.watch(
    state => state.count * state.multiplier,
    value => console.log('Computed value:', value)
);

// 修改状态
store.state.count = 5; // 触发: Computed value: 10
store.state.multiplier = 3; // 触发: Computed value: 15

// 计算属性
const doubled = store.computed('doubled', state => state.count * 2);
```

## 函数式编程模式

```javascript
// 1. 函数组合
const compose = (...fns) => x => fns.reduceRight((v, f) => f(v), x);
const pipe = (...fns) => x => fns.reduce((v, f) => f(v), x);

// 2. 柯里化
const curry = (fn) => {
    return function curried(...args) {
        if (args.length >= fn.length) {
            return fn.apply(this, args);
        }
        
        return function(...nextArgs) {
            return curried.apply(this, args.concat(nextArgs));
        };
    };
};

// 3. 函数式工具
const FP = {
    // 映射
    map: curry((fn, functor) => functor.map(fn)),
    
    // 过滤
    filter: curry((predicate, functor) => functor.filter(predicate)),
    
    // 折叠
    reduce: curry((fn, initial, functor) => functor.reduce(fn, initial)),
    
    // 偏应用
    partial: (fn, ...args) => (...restArgs) => fn(...args, ...restArgs),
    
    // 记忆化
    memoize: (fn) => {
        const cache = new Map();
        
        return (...args) => {
            const key = JSON.stringify(args);
            
            if (cache.has(key)) {
                return cache.get(key);
            }
            
            const result = fn(...args);
            cache.set(key, result);
            
            return result;
        };
    },
    
    // Maybe Monad
    Maybe: {
        of: (value) => ({
            map: (fn) => value == null ? FP.Maybe.of(null) : FP.Maybe.of(fn(value)),
            flatMap: (fn) => value == null ? FP.Maybe.of(null) : fn(value),
            getOrElse: (defaultValue) => value == null ? defaultValue : value,
            isNothing: () => value == null,
            value
        })
    },
    
    // Either Monad
    Either: {
        left: (value) => ({
            map: () => FP.Either.left(value),
            flatMap: () => FP.Either.left(value),
            fold: (leftFn, rightFn) => leftFn(value),
            isLeft: true,
            isRight: false,
            value
        }),
        
        right: (value) => ({
            map: (fn) => FP.Either.right(fn(value)),
            flatMap: (fn) => fn(value),
            fold: (leftFn, rightFn) => rightFn(value),
            isLeft: false,
            isRight: true,
            value
        })
    }
};

// 使用示例
// 数据处理管道
const processData = pipe(
    FP.filter(x => x > 0),
    FP.map(x => x * 2),
    FP.reduce((acc, x) => acc + x, 0)
);

const result = processData([1, -2, 3, -4, 5]); // 18

// 错误处理
const safeDivide = (a, b) => {
    return b === 0
        ? FP.Either.left('Division by zero')
        : FP.Either.right(a / b);
};

const calculate = (x, y) => {
    return safeDivide(x, y)
        .map(result => result * 2)
        .fold(
            error => console.error(error),
            value => console.log('Result:', value)
        );
};

// 异步组合
const asyncPipe = (...fns) => async (x) => {
    return fns.reduce(async (v, f) => f(await v), x);
};

const fetchAndProcess = asyncPipe(
    userId => fetch(`/api/users/${userId}`),
    response => response.json(),
    data => ({ ...data, processed: true })
);
```

## 性能最佳实践集成

```javascript
// 综合性能优化框架
class PerformanceFramework {
    constructor() {
        this.optimizers = new Map();
        this.monitors = new Map();
        this.reports = [];
    }
    
    // 注册优化器
    registerOptimizer(name, optimizer) {
        this.optimizers.set(name, optimizer);
    }
    
    // 注册监控器
    registerMonitor(name, monitor) {
        this.monitors.set(name, monitor);
    }
    
    // 启动框架
    async start() {
        // 启动所有监控器
        for (const [name, monitor] of this.monitors) {
            await monitor.start();
        }
        
        // 应用优化器
        for (const [name, optimizer] of this.optimizers) {
            await optimizer.apply();
        }
        
        // 定期生成报告
        setInterval(() => this.generateReport(), 60000);
    }
    
    // 生成性能报告
    generateReport() {
        const report = {
            timestamp: new Date(),
            metrics: {},
            recommendations: []
        };
        
        // 收集指标
        for (const [name, monitor] of this.monitors) {
            report.metrics[name] = monitor.getMetrics();
        }
        
        // 分析并生成建议
        this.analyzeAndRecommend(report);
        
        this.reports.push(report);
        
        // 限制报告数量
        if (this.reports.length > 100) {
            this.reports.shift();
        }
        
        return report;
    }
    
    analyzeAndRecommend(report) {
        // 分析内存使用
        if (report.metrics.memory && report.metrics.memory.usageRatio > 0.8) {
            report.recommendations.push({
                type: 'memory',
                severity: 'high',
                message: 'Memory usage is high. Consider optimizing memory allocation.'
            });
        }
        
        // 分析加载时间
        if (report.metrics.loading && report.metrics.loading.LCP > 2500) {
            report.recommendations.push({
                type: 'loading',
                severity: 'medium',
                message: 'Largest Contentful Paint is slow. Optimize critical rendering path.'
            });
        }
        
        // 更多分析...
    }
}

// 创建并配置框架
const performanceFramework = new PerformanceFramework();

// 注册优化器
performanceFramework.registerOptimizer('lazyLoading', new ImageLazyLoader());
performanceFramework.registerOptimizer('codeSpitting', new CodeSplitter());
performanceFramework.registerOptimizer('caching', new CacheOptimizer());

// 注册监控器
performanceFramework.registerMonitor('vitals', new WebVitalsMonitor());
performanceFramework.registerMonitor('memory', new MemoryMonitor());
performanceFramework.registerMonitor('resources', new ResourceAnalyzer());

// 启动
performanceFramework.start();

// 辅助函数
function generateTransactionId() {
    return `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
```