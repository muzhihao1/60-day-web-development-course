---
title: "错误处理模式与策略"
description: "学习和掌握错误处理模式与策略的实际应用"
category: "advanced"
language: "javascript"
---

# 错误处理模式与策略

## 错误处理基础模式

```javascript
// 1. 防御性编程
function divide(a, b) {
  // 参数验证
  if (typeof a !== 'number' || typeof b !== 'number') {
    throw new TypeError('参数必须是数字');
  }
  
  if (b === 0) {
    throw new Error('除数不能为零');
  }
  
  return a / b;
}

// 2. 早期返回模式
function processUser(user) {
  // 验证并早期返回
  if (!user) {
    console.error('用户对象为空');
    return null;
  }
  
  if (!user.id) {
    console.error('用户ID缺失');
    return null;
  }
  
  if (!user.email) {
    console.warn('用户邮箱缺失，使用默认值');
    user.email = 'noemail@example.com';
  }
  
  // 正常处理逻辑
  return {
    ...user,
    processed: true,
    timestamp: new Date()
  };
}

// 3. 结果包装模式
class Result {
  constructor(value, error = null) {
    this.value = value;
    this.error = error;
    this.isSuccess = error === null;
  }
  
  static success(value) {
    return new Result(value);
  }
  
  static failure(error) {
    return new Result(null, error);
  }
  
  map(fn) {
    if (this.isSuccess) {
      try {
        return Result.success(fn(this.value));
      } catch (error) {
        return Result.failure(error);
      }
    }
    return this;
  }
  
  flatMap(fn) {
    if (this.isSuccess) {
      try {
        return fn(this.value);
      } catch (error) {
        return Result.failure(error);
      }
    }
    return this;
  }
  
  getOrElse(defaultValue) {
    return this.isSuccess ? this.value : defaultValue;
  }
}

// 使用Result模式
function parseJSON(jsonString) {
  try {
    const data = JSON.parse(jsonString);
    return Result.success(data);
  } catch (error) {
    return Result.failure(error);
  }
}

const result = parseJSON('{"name": "John"}')
  .map(data => ({ ...data, parsed: true }))
  .map(data => data.name.toUpperCase());

console.log(result.getOrElse('DEFAULT'));
```

## 高级错误处理策略

```javascript
// 1. 错误恢复策略
class RetryableOperation {
  constructor(operation, options = {}) {
    this.operation = operation;
    this.maxRetries = options.maxRetries || 3;
    this.retryDelay = options.retryDelay || 1000;
    this.backoffMultiplier = options.backoffMultiplier || 2;
    this.onRetry = options.onRetry || (() => {});
  }
  
  async execute() {
    let lastError;
    let delay = this.retryDelay;
    
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        return await this.operation();
      } catch (error) {
        lastError = error;
        
        if (attempt < this.maxRetries) {
          this.onRetry(error, attempt + 1);
          await this.sleep(delay);
          delay *= this.backoffMultiplier;
        }
      }
    }
    
    throw lastError;
  }
  
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 使用重试策略
const fetchWithRetry = new RetryableOperation(
  () => fetch('/api/data').then(r => r.json()),
  {
    maxRetries: 3,
    retryDelay: 1000,
    onRetry: (error, attempt) => {
      console.log(`重试第 ${attempt} 次，错误: ${error.message}`);
    }
  }
);

// 2. 断路器模式
class CircuitBreaker {
  constructor(operation, options = {}) {
    this.operation = operation;
    this.failureThreshold = options.failureThreshold || 5;
    this.resetTimeout = options.resetTimeout || 60000;
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.failureCount = 0;
    this.lastFailureTime = null;
  }
  
  async execute(...args) {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.resetTimeout) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }
    
    try {
      const result = await this.operation(...args);
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
  
  onSuccess() {
    this.failureCount = 0;
    this.state = 'CLOSED';
  }
  
  onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    
    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
      console.error('Circuit breaker opened due to failures');
    }
  }
}

// 3. 降级处理
class ServiceWithFallback {
  constructor(primaryService, fallbackService) {
    this.primary = primaryService;
    this.fallback = fallbackService;
  }
  
  async getData(id) {
    try {
      // 尝试主服务
      return await this.primary.getData(id);
    } catch (primaryError) {
      console.warn('主服务失败，尝试降级服务:', primaryError.message);
      
      try {
        // 使用降级服务
        return await this.fallback.getData(id);
      } catch (fallbackError) {
        console.error('降级服务也失败:', fallbackError.message);
        // 返回缓存或默认数据
        return this.getCachedData(id) || this.getDefaultData();
      }
    }
  }
  
  getCachedData(id) {
    // 从缓存获取数据
    return localStorage.getItem(`cache_${id}`);
  }
  
  getDefaultData() {
    return {
      id: 'default',
      data: [],
      message: '服务暂时不可用'
    };
  }
}
```

## 异步错误处理模式

```javascript
// 1. Promise链错误处理
class AsyncPipeline {
  constructor() {
    this.steps = [];
  }
  
  addStep(name, operation, errorHandler = null) {
    this.steps.push({ name, operation, errorHandler });
    return this;
  }
  
  async execute(input) {
    let result = input;
    const errors = [];
    
    for (const step of this.steps) {
      try {
        console.log(`执行步骤: ${step.name}`);
        result = await step.operation(result);
      } catch (error) {
        console.error(`步骤 ${step.name} 失败:`, error);
        
        if (step.errorHandler) {
          try {
            result = await step.errorHandler(error, result);
          } catch (handlerError) {
            errors.push({
              step: step.name,
              error: handlerError,
              originalError: error
            });
            throw new Error(`Pipeline failed at ${step.name}`);
          }
        } else {
          errors.push({ step: step.name, error });
          throw new Error(`Pipeline failed at ${step.name}`);
        }
      }
    }
    
    return { result, errors };
  }
}

// 使用管道
const dataPipeline = new AsyncPipeline()
  .addStep('fetch', 
    async (url) => {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response;
    },
    async (error, url) => {
      // 错误处理：使用备用URL
      console.log('使用备用URL');
      return fetch(url.replace('api', 'backup-api'));
    }
  )
  .addStep('parse', 
    async (response) => response.json()
  )
  .addStep('validate',
    async (data) => {
      if (!data || !Array.isArray(data)) {
        throw new Error('Invalid data format');
      }
      return data;
    },
    async (error, data) => {
      // 返回空数组作为默认值
      return [];
    }
  );

// 2. 并发错误处理
class ConcurrentExecutor {
  constructor(options = {}) {
    this.concurrency = options.concurrency || 5;
    this.stopOnError = options.stopOnError || false;
  }
  
  async executeAll(tasks) {
    const results = [];
    const errors = [];
    const executing = [];
    
    for (const [index, task] of tasks.entries()) {
      const promise = this.executeTask(task, index)
        .then(result => {
          results[index] = { success: true, value: result };
        })
        .catch(error => {
          errors.push({ index, error });
          results[index] = { success: false, error };
          
          if (this.stopOnError) {
            throw error;
          }
        });
      
      executing.push(promise);
      
      if (executing.length >= this.concurrency) {
        await Promise.race(executing);
        executing.splice(executing.findIndex(p => 
          p === Promise.resolve(p).catch(() => {})), 1);
      }
    }
    
    await Promise.allSettled(executing);
    
    return {
      results,
      errors,
      successCount: results.filter(r => r.success).length,
      errorCount: errors.length
    };
  }
  
  async executeTask(task, index) {
    console.log(`开始任务 ${index}`);
    const result = await task();
    console.log(`完成任务 ${index}`);
    return result;
  }
}

// 3. 错误聚合
class ErrorAggregator {
  constructor() {
    this.errors = [];
  }
  
  add(error, context = {}) {
    this.errors.push({
      error,
      context,
      timestamp: new Date()
    });
  }
  
  hasErrors() {
    return this.errors.length > 0;
  }
  
  getErrors() {
    return this.errors;
  }
  
  throwIfHasErrors(message = 'Multiple errors occurred') {
    if (this.hasErrors()) {
      const aggregateError = new Error(message);
      aggregateError.errors = this.errors;
      throw aggregateError;
    }
  }
  
  clear() {
    this.errors = [];
  }
  
  async executeWithAggregation(operations) {
    const results = [];
    
    for (const [name, operation] of Object.entries(operations)) {
      try {
        results.push({
          name,
          result: await operation()
        });
      } catch (error) {
        this.add(error, { operation: name });
      }
    }
    
    return {
      results,
      hasErrors: this.hasErrors(),
      errors: this.getErrors()
    };
  }
}
```

## 错误边界和隔离

```javascript
// 1. 错误隔离容器
class ErrorBoundary {
  constructor(name) {
    this.name = name;
    this.errorCount = 0;
    this.lastError = null;
    this.errorHandlers = [];
  }
  
  onError(handler) {
    this.errorHandlers.push(handler);
    return () => {
      const index = this.errorHandlers.indexOf(handler);
      if (index > -1) {
        this.errorHandlers.splice(index, 1);
      }
    };
  }
  
  async execute(fn, context = {}) {
    try {
      return await fn();
    } catch (error) {
      this.errorCount++;
      this.lastError = error;
      
      const errorInfo = {
        boundary: this.name,
        error,
        context,
        errorCount: this.errorCount,
        timestamp: new Date()
      };
      
      // 通知所有错误处理器
      this.errorHandlers.forEach(handler => {
        try {
          handler(errorInfo);
        } catch (handlerError) {
          console.error('Error handler failed:', handlerError);
        }
      });
      
      // 重新抛出错误或返回默认值
      if (context.rethrow !== false) {
        throw error;
      }
      
      return context.defaultValue;
    }
  }
  
  reset() {
    this.errorCount = 0;
    this.lastError = null;
  }
}

// 2. 沙箱执行
class Sandbox {
  constructor() {
    this.globals = new Map();
  }
  
  execute(code, context = {}) {
    // 创建隔离的执行环境
    const sandboxContext = {
      console: {
        log: (...args) => console.log('[Sandbox]', ...args),
        error: (...args) => console.error('[Sandbox]', ...args)
      },
      ...context
    };
    
    try {
      // 使用Function构造函数创建隔离函数
      const keys = Object.keys(sandboxContext);
      const values = Object.values(sandboxContext);
      const fn = new Function(...keys, code);
      
      return fn.apply(null, values);
    } catch (error) {
      console.error('Sandbox execution failed:', error);
      throw new Error(`Sandbox error: ${error.message}`);
    }
  }
  
  async executeAsync(asyncCode, context = {}) {
    const wrappedCode = `
      return (async () => {
        ${asyncCode}
      })();
    `;
    
    return this.execute(wrappedCode, context);
  }
}

// 3. 错误上下文管理
class ErrorContext {
  constructor() {
    this.stack = [];
  }
  
  push(context) {
    this.stack.push({
      ...context,
      timestamp: new Date()
    });
  }
  
  pop() {
    return this.stack.pop();
  }
  
  async withContext(context, fn) {
    this.push(context);
    
    try {
      return await fn();
    } catch (error) {
      // 增强错误信息
      error.context = this.getFullContext();
      throw error;
    } finally {
      this.pop();
    }
  }
  
  getFullContext() {
    return this.stack.map(item => ({
      ...item,
      depth: this.stack.indexOf(item)
    }));
  }
  
  getCurrentContext() {
    return this.stack[this.stack.length - 1] || null;
  }
}

// 使用示例
const errorContext = new ErrorContext();

async function processOrder(orderId) {
  return errorContext.withContext(
    { operation: 'processOrder', orderId },
    async () => {
      const order = await fetchOrder(orderId);
      
      return errorContext.withContext(
        { operation: 'validateOrder', orderStatus: order.status },
        async () => {
          if (!order.items || order.items.length === 0) {
            throw new Error('Order has no items');
          }
          
          return processOrderItems(order.items);
        }
      );
    }
  );
}
```

## 智能错误处理

```javascript
// 错误分类和智能处理
class SmartErrorHandler {
  constructor() {
    this.strategies = new Map();
    this.metrics = {
      handled: 0,
      unhandled: 0,
      byType: new Map()
    };
  }
  
  // 注册错误处理策略
  register(errorType, strategy) {
    this.strategies.set(errorType, strategy);
  }
  
  // 智能处理错误
  async handle(error) {
    this.metrics.handled++;
    
    // 记录错误类型
    const typeName = error.constructor.name;
    this.metrics.byType.set(
      typeName, 
      (this.metrics.byType.get(typeName) || 0) + 1
    );
    
    // 查找匹配的策略
    for (const [ErrorType, strategy] of this.strategies) {
      if (error instanceof ErrorType) {
        return await this.executeStrategy(strategy, error);
      }
    }
    
    // 没有匹配策略
    this.metrics.unhandled++;
    console.error('No strategy found for error:', error);
    throw error;
  }
  
  async executeStrategy(strategy, error) {
    if (typeof strategy === 'function') {
      return strategy(error);
    }
    
    // 策略对象
    const { 
      shouldRetry = () => false,
      maxRetries = 0,
      transform = e => e,
      fallback = null,
      notify = () => {}
    } = strategy;
    
    // 通知
    notify(error);
    
    // 重试逻辑
    if (shouldRetry(error) && maxRetries > 0) {
      console.log(`Retrying operation, attempts left: ${maxRetries}`);
      // 实际重试逻辑...
    }
    
    // 转换错误
    const transformedError = transform(error);
    
    // 降级处理
    if (fallback) {
      return fallback(transformedError);
    }
    
    throw transformedError;
  }
  
  getMetrics() {
    return {
      ...this.metrics,
      errorTypes: Array.from(this.metrics.byType.entries())
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count)
    };
  }
}

// 配置智能错误处理
const smartHandler = new SmartErrorHandler();

// 网络错误策略
smartHandler.register(NetworkError, {
  shouldRetry: (error) => error.status >= 500,
  maxRetries: 3,
  transform: (error) => {
    error.userMessage = '网络连接出现问题，请稍后再试';
    return error;
  },
  fallback: async (error) => {
    // 从缓存获取数据
    return getCachedData(error.url);
  },
  notify: (error) => {
    console.warn(`Network error on ${error.url}: ${error.status}`);
  }
});

// 验证错误策略
smartHandler.register(ValidationError, {
  transform: (error) => {
    error.userMessage = `输入错误: ${error.field} - ${error.message}`;
    error.isUserError = true;
    return error;
  },
  notify: (error) => {
    // 显示用户友好的错误提示
    showToast(error.userMessage, 'error');
  }
});
```