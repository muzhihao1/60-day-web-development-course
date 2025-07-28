---
day: 13
exerciseTitle: "代码重构：从传统到现代JavaScript"
approach: "使用ES6+特性完全重构传统JavaScript代码，实现模块化、使用现代语法特性"
files:
  - path: "config.js"
    language: "javascript"
    description: "配置模块"
  - path: "todo.js"
    language: "javascript"
    description: "Todo类定义"
  - path: "storage.js"
    language: "javascript"
    description: "本地存储管理"
  - path: "todoApp.js"
    language: "javascript"
    description: "主应用类"
  - path: "app.js"
    language: "javascript"
    description: "应用入口"
keyTakeaways:
  - "const/let的正确使用取决于变量是否需要重新赋值"
  - "箭头函数适合用作回调，但类方法通常需要普通函数"
  - "解构赋值大大简化了属性提取和参数传递"
  - "数组方法比for循环更简洁且更具表达力"
  - "模块化让代码更易维护和测试"
commonMistakes:
  - "过度使用箭头函数导致this绑定问题"
  - "忘记处理解构时的默认值"
  - "在不合适的地方使用扩展运算符"
  - "模块导出导入语法混淆"
  - "忽略边缘情况的处理"
extensions:
  - title: "添加TypeScript支持"
    description: "为所有模块添加类型定义"
  - title: "实现发布订阅模式"
    description: "添加事件系统支持"
  - title: "使用IndexedDB"
    description: "升级存储方案以支持更大数据量"
---

# 解决方案：代码重构 - 从传统到现代JavaScript

## 实现思路

这个解决方案展示了如何将传统的ES5代码重构为现代ES6+代码。重构的核心原则是：
1. 保持功能不变
2. 提高代码可读性
3. 增强可维护性
4. 遵循现代JavaScript最佳实践

## 完整代码实现

### 配置模块 (config.js)

```javascript
// 导出默认配置
export const DEFAULT_CONFIG = {
    maxTodos: 10,
    defaultCategory: 'personal',
    categories: ['personal', 'work', 'shopping']
};

// 优先级枚举
export const PRIORITY = {
    LOW: 'low',
    NORMAL: 'normal',
    MEDIUM: 'medium',
    HIGH: 'high'
};

// 过滤器类型
export const FILTER_TYPES = {
    ALL: 'all',
    ACTIVE: 'active',
    COMPLETED: 'completed'
};

// 配置管理类
export class ConfigManager {
    constructor(customConfig = {}) {
        // 使用扩展运算符合并配置
        this.config = { ...DEFAULT_CONFIG, ...customConfig };
    }

    get(key) {
        return this.config[key];
    }

    set(key, value) {
        this.config[key] = value;
    }

    // 获取所有配置
    getAll() {
        return { ...this.config };
    }

    // 重置为默认配置
    reset() {
        this.config = { ...DEFAULT_CONFIG };
    }

    // 验证配置
    validate() {
        const { maxTodos, categories } = this.config;
        
        if (maxTodos < 1 || maxTodos > 100) {
            throw new Error(`Invalid maxTodos: ${maxTodos}. Must be between 1 and 100.`);
        }
        
        if (!Array.isArray(categories) || categories.length === 0) {
            throw new Error('Categories must be a non-empty array.');
        }
        
        return true;
    }
}
```

### Todo类定义 (todo.js)

```javascript
import { DEFAULT_CONFIG, PRIORITY } from './config.js';

// Todo类
export class Todo {
    constructor(
        text,
        category = DEFAULT_CONFIG.defaultCategory,
        priority = PRIORITY.NORMAL
    ) {
        // 验证输入
        if (!text?.trim()) {
            throw new Error('Todo text cannot be empty');
        }

        this.id = Date.now();
        this.text = text.trim();
        this.category = category;
        this.priority = priority;
        this.completed = false;
        this.createdAt = new Date().toISOString();
        this.updatedAt = this.createdAt;
    }

    // 切换完成状态
    toggle() {
        this.completed = !this.completed;
        this.updatedAt = new Date().toISOString();
        return this;
    }

    // 更新待办事项
    update({ text, category, priority }) {
        if (text !== undefined) this.text = text.trim();
        if (category !== undefined) this.category = category;
        if (priority !== undefined) this.priority = priority;
        this.updatedAt = new Date().toISOString();
        return this;
    }

    // 转换为普通对象
    toJSON() {
        const { id, text, category, priority, completed, createdAt, updatedAt } = this;
        return { id, text, category, priority, completed, createdAt, updatedAt };
    }

    // 从普通对象创建Todo实例
    static fromJSON(json) {
        const todo = new Todo(json.text, json.category, json.priority);
        Object.assign(todo, json);
        return todo;
    }

    // 验证todo数据
    static validate(data) {
        const { text, category, priority } = data;
        
        if (!text?.trim()) {
            return { valid: false, error: 'Text is required' };
        }
        
        if (category && !DEFAULT_CONFIG.categories.includes(category)) {
            return { valid: false, error: `Invalid category: ${category}` };
        }
        
        if (priority && !Object.values(PRIORITY).includes(priority)) {
            return { valid: false, error: `Invalid priority: ${priority}` };
        }
        
        return { valid: true };
    }
}
```

### 存储管理 (storage.js)

```javascript
// 存储键名
const STORAGE_KEYS = {
    TODOS: 'todos',
    CONFIG: 'todoConfig'
};

// 存储管理类
export class StorageManager {
    constructor(prefix = 'todoApp') {
        this.prefix = prefix;
    }

    // 获取完整的键名
    getKey(key) {
        return `${this.prefix}_${key}`;
    }

    // 保存数据
    save(key, data) {
        try {
            const serialized = JSON.stringify(data);
            localStorage.setItem(this.getKey(key), serialized);
            return true;
        } catch (error) {
            console.error(`Failed to save ${key}:`, error);
            return false;
        }
    }

    // 加载数据
    load(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(this.getKey(key));
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error(`Failed to load ${key}:`, error);
            return defaultValue;
        }
    }

    // 删除数据
    remove(key) {
        try {
            localStorage.removeItem(this.getKey(key));
            return true;
        } catch (error) {
            console.error(`Failed to remove ${key}:`, error);
            return false;
        }
    }

    // 清空所有相关数据
    clear() {
        const keys = Object.keys(localStorage);
        const prefix = this.prefix + '_';
        
        keys.forEach(key => {
            if (key.startsWith(prefix)) {
                localStorage.removeItem(key);
            }
        });
    }

    // 获取存储大小（近似值）
    getSize() {
        let size = 0;
        const prefix = this.prefix + '_';
        
        Object.entries(localStorage).forEach(([key, value]) => {
            if (key.startsWith(prefix)) {
                size += key.length + value.length;
            }
        });
        
        return size;
    }

    // 导出所有数据
    exportAll() {
        const data = {};
        const prefix = this.prefix + '_';
        
        Object.entries(localStorage).forEach(([key, value]) => {
            if (key.startsWith(prefix)) {
                const cleanKey = key.replace(prefix, '');
                try {
                    data[cleanKey] = JSON.parse(value);
                } catch {
                    data[cleanKey] = value;
                }
            }
        });
        
        return data;
    }

    // 导入数据
    importAll(data) {
        Object.entries(data).forEach(([key, value]) => {
            this.save(key, value);
        });
    }
}

// 默认存储实例
export const storage = new StorageManager('todoApp');
```

### 主应用类 (todoApp.js)

```javascript
import { Todo } from './todo.js';
import { ConfigManager } from './config.js';
import { storage } from './storage.js';

export class TodoApp {
    constructor(customConfig = {}) {
        this.configManager = new ConfigManager(customConfig);
        this.todos = [];
        this.listeners = new Map();
    }

    // 初始化应用
    init() {
        console.log('TodoApp initializing...');
        
        // 加载配置
        const savedConfig = storage.load('config');
        if (savedConfig) {
            this.configManager = new ConfigManager(savedConfig);
        }
        
        // 加载待办事项
        const savedTodos = storage.load('todos', []);
        this.todos = savedTodos.map(data => Todo.fromJSON(data));
        
        // 验证配置
        this.configManager.validate();
        
        console.log(`TodoApp initialized with ${this.todos.length} todos`);
        this.emit('initialized', { todos: this.todos.length });
    }

    // 添加待办事项
    addTodo(text, category, priority) {
        // 使用解构获取配置
        const { maxTodos } = this.configManager.getAll();
        
        // 检查限制
        if (this.todos.length >= maxTodos) {
            throw new Error(`Maximum number of todos reached: ${maxTodos}`);
        }
        
        // 创建新的待办事项
        const todo = new Todo(text, category, priority);
        this.todos.push(todo);
        
        // 保存并触发事件
        this.save();
        this.emit('todoAdded', todo);
        
        console.log(`Added todo: ${todo.text} [${todo.category}]`);
        return todo;
    }

    // 切换待办事项状态
    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        
        if (!todo) {
            throw new Error(`Todo not found with id: ${id}`);
        }
        
        todo.toggle();
        this.save();
        this.emit('todoToggled', todo);
        
        return todo;
    }

    // 删除待办事项
    deleteTodo(id) {
        const index = this.todos.findIndex(t => t.id === id);
        
        if (index === -1) {
            throw new Error(`Todo not found with id: ${id}`);
        }
        
        const [deleted] = this.todos.splice(index, 1);
        this.save();
        this.emit('todoDeleted', deleted);
        
        return deleted;
    }

    // 更新待办事项
    updateTodo(id, updates) {
        const todo = this.todos.find(t => t.id === id);
        
        if (!todo) {
            throw new Error(`Todo not found with id: ${id}`);
        }
        
        todo.update(updates);
        this.save();
        this.emit('todoUpdated', todo);
        
        return todo;
    }

    // 获取待办事项列表
    getTodos(filter = {}) {
        const { category, completed, priority, search } = filter;
        
        return this.todos.filter(todo => {
            // 使用逻辑运算符简化条件判断
            if (category && todo.category !== category) return false;
            if (completed !== undefined && todo.completed !== completed) return false;
            if (priority && todo.priority !== priority) return false;
            if (search && !todo.text.toLowerCase().includes(search.toLowerCase())) {
                return false;
            }
            return true;
        });
    }

    // 获取统计信息
    getStats() {
        const stats = {
            total: this.todos.length,
            active: 0,
            completed: 0,
            byCategory: {},
            byPriority: {}
        };
        
        // 使用reduce进行统计
        this.todos.forEach(todo => {
            // 完成状态统计
            todo.completed ? stats.completed++ : stats.active++;
            
            // 分类统计
            stats.byCategory[todo.category] = (stats.byCategory[todo.category] ?? 0) + 1;
            
            // 优先级统计
            stats.byPriority[todo.priority] = (stats.byPriority[todo.priority] ?? 0) + 1;
        });
        
        return stats;
    }

    // 清除已完成的待办事项
    clearCompleted() {
        const completed = this.todos.filter(todo => todo.completed);
        this.todos = this.todos.filter(todo => !todo.completed);
        
        this.save();
        this.emit('completedCleared', completed);
        
        return completed;
    }

    // 批量更新
    batchUpdate(ids, updates) {
        if (!Array.isArray(ids) || ids.length === 0) {
            throw new Error('Invalid ids array');
        }
        
        const updated = ids
            .map(id => this.todos.find(todo => todo.id === id))
            .filter(Boolean)
            .map(todo => {
                todo.update(updates);
                return todo;
            });
        
        if (updated.length > 0) {
            this.save();
            this.emit('batchUpdated', updated);
        }
        
        return updated;
    }

    // 搜索功能
    search(query) {
        if (!query?.trim()) return [];
        
        const lowerQuery = query.toLowerCase();
        return this.todos.filter(todo => 
            todo.text.toLowerCase().includes(lowerQuery)
        );
    }

    // 排序功能
    sortTodos(by = 'createdAt', order = 'asc') {
        const sortFn = {
            createdAt: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
            text: (a, b) => a.text.localeCompare(b.text),
            priority: (a, b) => {
                const priorityOrder = { low: 0, normal: 1, medium: 2, high: 3 };
                return priorityOrder[a.priority] - priorityOrder[b.priority];
            }
        };
        
        const compareFn = sortFn[by] || sortFn.createdAt;
        
        this.todos.sort((a, b) => {
            const result = compareFn(a, b);
            return order === 'desc' ? -result : result;
        });
        
        return this.todos;
    }

    // 保存到存储
    save() {
        storage.save('todos', this.todos);
        storage.save('config', this.configManager.getAll());
    }

    // 导出数据
    exportData() {
        return {
            todos: this.todos,
            config: this.configManager.getAll(),
            stats: this.getStats(),
            exportDate: new Date().toISOString(),
            version: '2.0.0'
        };
    }

    // 导入数据
    importData(data) {
        if (!data?.todos || !Array.isArray(data.todos)) {
            throw new Error('Invalid import data');
        }
        
        this.todos = data.todos.map(todo => Todo.fromJSON(todo));
        
        if (data.config) {
            this.configManager = new ConfigManager(data.config);
        }
        
        this.save();
        this.emit('dataImported', { todosCount: this.todos.length });
    }

    // 事件系统
    on(event, handler) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(handler);
    }

    off(event, handler) {
        if (!this.listeners.has(event)) return;
        
        const handlers = this.listeners.get(event);
        const index = handlers.indexOf(handler);
        
        if (index > -1) {
            handlers.splice(index, 1);
        }
    }

    emit(event, data) {
        if (!this.listeners.has(event)) return;
        
        this.listeners.get(event).forEach(handler => {
            try {
                handler(data);
            } catch (error) {
                console.error(`Error in event handler for ${event}:`, error);
            }
        });
    }

    // 清理资源
    destroy() {
        this.listeners.clear();
        this.todos = [];
        console.log('TodoApp destroyed');
    }
}
```

### 应用入口 (app.js)

```javascript
import { TodoApp } from './todoApp.js';
import { PRIORITY } from './config.js';

// 创建应用实例
const app = new TodoApp({
    maxTodos: 20, // 自定义最大数量
    categories: ['personal', 'work', 'shopping', 'health']
});

// 设置事件监听器
app.on('todoAdded', (todo) => {
    console.log('✅ New todo added:', todo.text);
});

app.on('todoToggled', (todo) => {
    console.log(`✏️ Todo ${todo.completed ? 'completed' : 'uncompleted'}:`, todo.text);
});

app.on('todoDeleted', (todo) => {
    console.log('🗑️ Todo deleted:', todo.text);
});

// 初始化应用
app.init();

// 示例：使用应用
try {
    // 添加待办事项
    app.addTodo('学习ES6+语法', 'work', PRIORITY.HIGH);
    app.addTodo('购买牛奶', 'shopping');
    app.addTodo('跑步30分钟', 'health', PRIORITY.MEDIUM);
    app.addTodo('阅读技术文章', 'personal', PRIORITY.LOW);

    // 获取工作相关的待办事项
    const workTodos = app.getTodos({ category: 'work' });
    console.log('\n📋 Work todos:', workTodos.map(t => t.text));

    // 搜索功能
    const searchResults = app.search('学习');
    console.log('\n🔍 Search results:', searchResults.map(t => t.text));

    // 获取统计信息
    const stats = app.getStats();
    console.log('\n📊 Statistics:', stats);

    // 排序待办事项
    app.sortTodos('priority', 'desc');
    console.log('\n🔢 Sorted by priority:', app.getTodos().map(t => ({
        text: t.text,
        priority: t.priority
    })));

    // 标记完成
    const [firstTodo] = app.getTodos();
    if (firstTodo) {
        app.toggleTodo(firstTodo.id);
    }

    // 批量更新
    const activeTodos = app.getTodos({ completed: false });
    const ids = activeTodos.slice(0, 2).map(t => t.id);
    app.batchUpdate(ids, { priority: PRIORITY.HIGH });

    // 导出数据
    const exportedData = app.exportData();
    console.log('\n💾 Exported data:', {
        todos: exportedData.todos.length,
        exportDate: exportedData.exportDate
    });

} catch (error) {
    console.error('❌ Error:', error.message);
}

// 将应用实例暴露给全局（用于调试）
if (typeof window !== 'undefined') {
    window.todoApp = app;
}

// 导出应用实例
export default app;
```

### 工具函数模块（可选）(utils.js)

```javascript
// 日期格式化
export const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return date.toLocaleDateString('zh-CN', options);
};

// 生成唯一ID（更安全的版本）
export const generateId = () => {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// 防抖函数
export const debounce = (func, wait = 300) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
};

// 深拷贝
export const deepClone = (obj) => {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map(item => deepClone(item));
    
    const clonedObj = {};
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            clonedObj[key] = deepClone(obj[key]);
        }
    }
    return clonedObj;
};

// 颜色生成器（用于分类）
export const generateColor = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const hue = hash % 360;
    return `hsl(${hue}, 70%, 60%)`;
};
```

## 重构亮点

### 1. 现代语法特性

- **const/let替代var**：根据变量是否需要重新赋值选择使用
- **箭头函数**：用于回调和不需要this绑定的场景
- **模板字符串**：所有字符串拼接都使用模板字符串
- **解构赋值**：函数参数、对象属性提取都使用解构

### 2. 数组方法应用

```javascript
// 旧代码
for (var i = 0; i < todos.length; i++) {
    if (todos[i].id === id) {
        todo = todos[i];
        break;
    }
}

// 新代码
const todo = this.todos.find(t => t.id === id);
```

### 3. 对象操作优化

```javascript
// 使用扩展运算符合并对象
this.config = { ...DEFAULT_CONFIG, ...customConfig };

// 对象属性简写
return { id, text, category, priority, completed, createdAt };

// 方法简写
const obj = {
    method() {
        // ...
    }
};
```

### 4. 错误处理改进

```javascript
// 使用可选链
const city = user?.address?.city;

// 使用空值合并
stats.byCategory[todo.category] = (stats.byCategory[todo.category] ?? 0) + 1;
```

### 5. 模块化结构

将单一文件拆分为多个职责明确的模块：
- `config.js` - 配置管理
- `todo.js` - Todo实体
- `storage.js` - 存储逻辑
- `todoApp.js` - 应用逻辑
- `app.js` - 应用入口

## 性能优化

1. **使用Map代替对象查找**（可选优化）
2. **防抖搜索功能**
3. **批量操作减少存储次数**
4. **事件系统避免过度渲染**

## 测试建议

```javascript
// 简单的测试用例
console.assert(app.getTodos().length === 4, 'Should have 4 todos');
console.assert(app.getTodos({ completed: true }).length === 1, 'Should have 1 completed todo');
console.assert(app.getStats().total === 4, 'Stats should show 4 total todos');
```

## 总结

这个重构案例展示了如何将传统JavaScript代码转换为现代ES6+代码。主要改进包括：

1. **更清晰的代码结构**：模块化设计让代码更易理解
2. **更好的错误处理**：使用现代错误处理模式
3. **更强的类型安全**：虽然还是JavaScript，但结构更清晰
4. **更好的可维护性**：每个模块职责单一
5. **更现代的开发体验**：使用最新的语言特性

通过这次重构，代码不仅变得更现代，也变得更加健壮和易于扩展。