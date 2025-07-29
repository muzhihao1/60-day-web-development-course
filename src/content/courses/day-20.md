---
day: 20
phase: "javascript-mastery"
title: "错误处理与调试技巧"
description: "掌握JavaScript错误处理机制、调试工具和最佳实践"
objectives:
  - "理解JavaScript的错误类型和错误处理机制"
  - "掌握try-catch-finally和自定义错误的使用"
  - "学习异步代码的错误处理策略"
  - "熟练使用浏览器调试工具"
  - "掌握性能分析和优化技巧"
prerequisites:
  - 15
  - 17
  - 18
estimatedTime: 180
difficulty: "advanced"
resources:
  - title: "MDN JavaScript错误参考"
    url: "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Errors"
    type: "article"
  - title: "Chrome DevTools调试指南"
    url: "https://developer.chrome.com/docs/devtools/"
    type: "documentation"
---

# Day 20: 错误处理与调试技巧 🐛

## 学习目标

今天我们将深入学习JavaScript的错误处理机制和调试技巧：

1. **错误类型与处理**
   - JavaScript错误类型
   - try-catch-finally语句
   - 自定义错误类
   - 错误传播与冒泡

2. **异步错误处理**
   - Promise错误处理
   - async/await错误处理
   - 未捕获的Promise rejection
   - 错误边界模式

3. **调试工具与技巧**
   - 浏览器开发者工具
   - 断点调试
   - 控制台技巧
   - 性能分析工具

4. **错误监控与日志**
   - 错误监控策略
   - 日志级别与管理
   - 错误报告服务
   - 生产环境调试

## 错误类型与分类

### JavaScript内置错误类型

```javascript
// 1. SyntaxError - 语法错误
// let a = ; // SyntaxError: Unexpected token ';'

// 2. ReferenceError - 引用错误
try {
  console.log(undefinedVariable); // ReferenceError
} catch (error) {
  console.error('引用错误:', error.message);
}

// 3. TypeError - 类型错误
try {
  null.toString(); // TypeError
} catch (error) {
  console.error('类型错误:', error.message);
}

// 4. RangeError - 范围错误
try {
  const arr = new Array(-1); // RangeError
} catch (error) {
  console.error('范围错误:', error.message);
}

// 5. URIError - URI错误
try {
  decodeURIComponent('%'); // URIError
} catch (error) {
  console.error('URI错误:', error.message);
}

// 6. EvalError - eval错误（现代JavaScript中很少见）
```

### 错误对象属性

```javascript
try {
  throw new Error('自定义错误消息');
} catch (error) {
  console.log('name:', error.name);           // Error
  console.log('message:', error.message);     // 自定义错误消息
  console.log('stack:', error.stack);         // 错误堆栈追踪
  
  // 某些环境可能有额外属性
  console.log('fileName:', error.fileName);   // 错误发生的文件
  console.log('lineNumber:', error.lineNumber); // 错误发生的行号
}
```

## 错误处理策略

### 基本错误处理

```javascript
// 1. try-catch-finally
function riskyOperation() {
  const resource = acquireResource();
  
  try {
    // 可能出错的代码
    return processResource(resource);
  } catch (error) {
    // 错误处理
    console.error('处理失败:', error);
    // 可以重新抛出或返回默认值
    throw new Error('操作失败: ' + error.message);
  } finally {
    // 清理代码，无论成功或失败都会执行
    releaseResource(resource);
  }
}

// 2. 嵌套try-catch
function complexOperation() {
  try {
    // 外层操作
    const data = loadData();
    
    try {
      // 内层操作
      return processData(data);
    } catch (processingError) {
      // 处理特定错误
      console.warn('处理警告:', processingError);
      return fallbackProcess(data);
    }
  } catch (loadingError) {
    // 处理加载错误
    console.error('加载失败:', loadingError);
    return defaultData();
  }
}
```

### 自定义错误类

```javascript
// 基础自定义错误类
class ApplicationError extends Error {
  constructor(message, code = 'APP_ERROR') {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.timestamp = new Date();
    
    // 维护正确的堆栈追踪
    Error.captureStackTrace(this, this.constructor);
  }
  
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      timestamp: this.timestamp,
      stack: this.stack
    };
  }
}

// 特定错误类
class ValidationError extends ApplicationError {
  constructor(field, value, message) {
    super(message, 'VALIDATION_ERROR');
    this.field = field;
    this.value = value;
  }
}

class NetworkError extends ApplicationError {
  constructor(url, status, message) {
    super(message, 'NETWORK_ERROR');
    this.url = url;
    this.status = status;
  }
}

class AuthenticationError extends ApplicationError {
  constructor(message = '认证失败') {
    super(message, 'AUTH_ERROR');
  }
}

// 使用示例
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ValidationError('email', email, '邮箱格式无效');
  }
}

try {
  validateEmail('invalid-email');
} catch (error) {
  if (error instanceof ValidationError) {
    console.error(`验证失败 - 字段: ${error.field}, 值: ${error.value}`);
  }
}
```

## 异步错误处理

### Promise错误处理

```javascript
// 1. 基本Promise错误处理
function fetchData(url) {
  return fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new NetworkError(url, response.status, '请求失败');
      }
      return response.json();
    })
    .catch(error => {
      // 区分不同类型的错误
      if (error instanceof NetworkError) {
        console.error('网络错误:', error);
      } else if (error instanceof TypeError) {
        console.error('类型错误，可能是网络问题:', error);
      } else {
        console.error('未知错误:', error);
      }
      throw error; // 重新抛出供上层处理
    });
}

// 2. Promise链中的错误处理
fetchData('/api/user')
  .then(user => fetchData(`/api/user/${user.id}/posts`))
  .then(posts => {
    // 处理posts
    return posts.map(post => post.title);
  })
  .catch(error => {
    // 捕获链中任何位置的错误
    console.error('操作失败:', error);
    return []; // 返回默认值
  });

// 3. Promise.all错误处理
const promises = [
  fetchData('/api/users'),
  fetchData('/api/posts'),
  fetchData('/api/comments')
];

Promise.all(promises)
  .then(([users, posts, comments]) => {
    // 所有请求成功
  })
  .catch(error => {
    // 任一请求失败
    console.error('批量请求失败:', error);
  });

// 4. Promise.allSettled - 更安全的批量处理
Promise.allSettled(promises)
  .then(results => {
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        console.log(`请求${index}成功:`, result.value);
      } else {
        console.error(`请求${index}失败:`, result.reason);
      }
    });
  });
```

### async/await错误处理

```javascript
// 1. 基本async/await错误处理
async function getUserData(userId) {
  try {
    const user = await fetchUser(userId);
    const posts = await fetchUserPosts(userId);
    const comments = await fetchUserComments(userId);
    
    return {
      user,
      posts,
      comments
    };
  } catch (error) {
    // 统一错误处理
    console.error('获取用户数据失败:', error);
    throw error;
  }
}

// 2. 细粒度错误处理
async function robustGetUserData(userId) {
  let user, posts, comments;
  
  try {
    user = await fetchUser(userId);
  } catch (error) {
    console.error('获取用户失败:', error);
    return null;
  }
  
  try {
    posts = await fetchUserPosts(userId);
  } catch (error) {
    console.warn('获取用户帖子失败，使用空数组:', error);
    posts = [];
  }
  
  try {
    comments = await fetchUserComments(userId);
  } catch (error) {
    console.warn('获取用户评论失败，使用空数组:', error);
    comments = [];
  }
  
  return { user, posts, comments };
}

// 3. 错误处理工具函数
async function handleAsync(asyncFunc) {
  try {
    const result = await asyncFunc();
    return [null, result];
  } catch (error) {
    return [error, null];
  }
}

// 使用工具函数
async function example() {
  const [error, data] = await handleAsync(() => fetchData('/api/data'));
  
  if (error) {
    console.error('请求失败:', error);
    return;
  }
  
  // 处理数据
  console.log('数据:', data);
}
```

## 全局错误处理

```javascript
// 1. 全局错误处理器
window.addEventListener('error', (event) => {
  console.error('全局错误:', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error
  });
  
  // 发送错误报告
  reportError({
    type: 'javascript-error',
    error: event.error,
    context: {
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString()
    }
  });
});

// 2. 未处理的Promise rejection
window.addEventListener('unhandledrejection', (event) => {
  console.error('未处理的Promise rejection:', event.reason);
  
  // 阻止默认行为（在某些浏览器中会在控制台显示）
  event.preventDefault();
  
  // 报告错误
  reportError({
    type: 'unhandled-promise-rejection',
    reason: event.reason,
    promise: event.promise
  });
});

// 3. 错误边界（React示例概念）
class ErrorBoundary {
  constructor() {
    this.hasError = false;
    this.error = null;
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error, errorInfo) {
    console.error('组件错误:', error, errorInfo);
    reportError({
      type: 'component-error',
      error,
      componentStack: errorInfo.componentStack
    });
  }
}
```

## 调试技巧

### 控制台调试

```javascript
// 1. 不同级别的日志
console.log('普通信息');
console.info('信息提示');
console.warn('警告信息');
console.error('错误信息');

// 2. 分组日志
console.group('用户操作');
console.log('开始操作');
console.log('处理数据');
console.log('完成操作');
console.groupEnd();

// 3. 表格显示
const users = [
  { id: 1, name: 'Alice', age: 30 },
  { id: 2, name: 'Bob', age: 25 },
  { id: 3, name: 'Charlie', age: 35 }
];
console.table(users);

// 4. 计时器
console.time('operation');
// 执行操作
performExpensiveOperation();
console.timeEnd('operation');

// 5. 断言
console.assert(users.length > 0, '用户列表不应为空');

// 6. 堆栈追踪
console.trace('追踪调用堆栈');

// 7. 条件断点技巧
function processItem(item, index) {
  // 在调试器中设置条件断点: index === 10
  debugger; // 仅在特定条件下暂停
  
  // 或使用条件日志
  if (index === 10) {
    console.log('特定项:', item);
  }
}
```

### 高级调试技巧

```javascript
// 1. 性能分析
console.time('total');

console.time('step1');
step1();
console.timeEnd('step1');

console.time('step2');
step2();
console.timeEnd('step2');

console.timeEnd('total');

// 2. 内存分析
class MemoryLeakDemo {
  constructor() {
    this.data = new Array(1000000).fill('data');
    this.listeners = [];
  }
  
  addEventListener(fn) {
    this.listeners.push(fn);
    // 内存泄漏：没有提供removeEventListener
  }
}

// 使用Chrome DevTools的Memory Profiler检测

// 3. 代码覆盖率
// 使用Chrome DevTools的Coverage面板查看未使用的代码

// 4. 网络调试
async function debugNetworkRequest(url) {
  console.group(`Network: ${url}`);
  console.time('request');
  
  try {
    const response = await fetch(url);
    console.log('Status:', response.status);
    console.log('Headers:', [...response.headers]);
    
    const data = await response.json();
    console.log('Response:', data);
  } catch (error) {
    console.error('Request failed:', error);
  } finally {
    console.timeEnd('request');
    console.groupEnd();
  }
}
```

## 错误监控与报告

```javascript
// 错误报告系统
class ErrorReporter {
  constructor(endpoint) {
    this.endpoint = endpoint;
    this.queue = [];
    this.maxRetries = 3;
    
    // 批量发送
    this.batchTimer = null;
    this.batchSize = 10;
    this.batchDelay = 5000;
  }
  
  report(error) {
    const errorReport = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      error: this.serializeError(error),
      context: this.getContext()
    };
    
    this.queue.push(errorReport);
    this.scheduleBatch();
  }
  
  serializeError(error) {
    if (error instanceof Error) {
      return {
        name: error.name,
        message: error.message,
        stack: error.stack,
        code: error.code
      };
    }
    return error;
  }
  
  getContext() {
    return {
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      screen: {
        width: screen.width,
        height: screen.height
      },
      memory: performance.memory ? {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit
      } : null
    };
  }
  
  scheduleBatch() {
    if (this.batchTimer) return;
    
    this.batchTimer = setTimeout(() => {
      this.sendBatch();
      this.batchTimer = null;
    }, this.batchDelay);
  }
  
  async sendBatch() {
    if (this.queue.length === 0) return;
    
    const batch = this.queue.splice(0, this.batchSize);
    
    try {
      await this.send(batch);
    } catch (error) {
      console.error('Failed to send error batch:', error);
      // 将失败的错误放回队列
      this.queue.unshift(...batch);
    }
  }
  
  async send(errors, retries = 0) {
    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ errors })
      });
      
      if (!response.ok && retries < this.maxRetries) {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      if (retries < this.maxRetries) {
        await this.delay(Math.pow(2, retries) * 1000);
        return this.send(errors, retries + 1);
      }
      throw error;
    }
  }
  
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// 初始化错误报告
const errorReporter = new ErrorReporter('/api/errors');

// 集成到全局错误处理
window.addEventListener('error', (event) => {
  errorReporter.report({
    type: 'javascript-error',
    ...event
  });
});
```

## 实战演练

让我们创建一个完整的错误处理示例：

```javascript
// 应用程序错误处理系统
class App {
  constructor() {
    this.errorHandlers = new Map();
    this.setupGlobalHandlers();
  }
  
  // 注册错误处理器
  registerErrorHandler(errorType, handler) {
    this.errorHandlers.set(errorType, handler);
  }
  
  // 处理错误
  handleError(error) {
    // 查找特定错误处理器
    for (const [ErrorType, handler] of this.errorHandlers) {
      if (error instanceof ErrorType) {
        return handler(error);
      }
    }
    
    // 默认处理
    console.error('未处理的错误:', error);
    this.showErrorNotification('发生了一个错误');
  }
  
  // 设置全局处理器
  setupGlobalHandlers() {
    // JavaScript错误
    window.addEventListener('error', (event) => {
      this.handleError(event.error || new Error(event.message));
    });
    
    // Promise rejection
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(new Error(event.reason));
    });
  }
  
  // 显示错误通知
  showErrorNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'error-notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 5000);
  }
  
  // 安全执行函数
  async safeExecute(fn, fallback = null) {
    try {
      return await fn();
    } catch (error) {
      this.handleError(error);
      return fallback;
    }
  }
}

// 初始化应用
const app = new App();

// 注册特定错误处理器
app.registerErrorHandler(ValidationError, (error) => {
  console.warn('验证错误:', error.field, error.message);
  app.showErrorNotification(`验证失败: ${error.message}`);
});

app.registerErrorHandler(NetworkError, (error) => {
  console.error('网络错误:', error.url, error.status);
  app.showErrorNotification('网络连接失败，请检查您的网络');
});

app.registerErrorHandler(AuthenticationError, (error) => {
  console.error('认证错误:', error.message);
  window.location.href = '/login';
});
```

## 最佳实践

1. **预防胜于治疗**
   - 输入验证
   - 类型检查
   - 边界条件处理

2. **错误分类**
   - 区分可恢复和不可恢复错误
   - 为不同错误类型提供不同处理策略

3. **用户体验**
   - 提供有意义的错误消息
   - 避免暴露技术细节
   - 提供恢复或重试选项

4. **监控和分析**
   - 记录所有错误
   - 分析错误模式
   - 及时修复常见错误

## 今日总结

今天我们学习了JavaScript的错误处理和调试技巧。掌握这些技能对于构建健壮的应用程序至关重要。记住，好的错误处理不仅能帮助调试，还能提升用户体验。

## 作业

1. 实现一个完整的错误处理系统
2. 创建自定义错误类层次结构
3. 实现错误报告和监控功能
4. 使用调试工具分析和优化代码

明天我们将学习性能优化与最佳实践！