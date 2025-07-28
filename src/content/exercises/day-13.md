---
day: 13
title: "代码重构：从传统到现代JavaScript"
description: "将一个使用传统JavaScript编写的待办事项应用重构为使用ES6+现代语法，实践今天学习的所有新特性"
difficulty: "intermediate"
estimatedTime: 90
requirements:
  - "使用const/let替代所有var声明"
  - "将传统函数转换为适当的箭头函数"
  - "使用解构赋值简化变量赋值"
  - "应用模板字符串替代字符串拼接"
  - "使用扩展运算符和默认参数优化代码"
  - "实现ES6模块化结构"
hints:
  - "注意箭头函数的this绑定特性"
  - "不是所有函数都适合转换为箭头函数"
  - "解构赋值可以用在函数参数中"
  - "考虑使用对象属性简写语法"
  - "记得处理边缘情况和默认值"
checkpoints:
  - task: "替换所有var为const或let"
    completed: false
  - task: "转换适合的函数为箭头函数"
    completed: false
  - task: "在至少3处使用解构赋值"
    completed: false
  - task: "将所有字符串拼接改为模板字符串"
    completed: false
  - task: "使用扩展运算符优化数组操作"
    completed: false
  - task: "添加函数默认参数"
    completed: false
  - task: "将代码拆分为ES6模块"
    completed: false
  - task: "使用对象属性简写和方法简写"
    completed: false
starterCode:
  language: "javascript"
  path: "/exercises/day-13/legacy-todo-app.js"
---

# 练习：代码重构 - 从传统到现代JavaScript

## 🎯 任务目标

你接手了一个使用传统JavaScript（ES5）编写的待办事项应用。你的任务是将其重构为使用现代ES6+语法，使代码更加简洁、易读和维护。

## 📋 背景说明

这个待办事项应用是5年前编写的，使用了当时的JavaScript最佳实践。虽然功能正常，但代码风格已经过时。你需要在不改变功能的前提下，使用今天学习的ES6+特性对其进行现代化改造。

## 🔍 原始代码

### legacy-todo-app.js

```javascript
// 传统JavaScript代码 - 需要重构
var TodoApp = function() {
    var self = this;
    
    // 配置
    var config = {
        maxTodos: 10,
        defaultCategory: 'personal',
        categories: ['personal', 'work', 'shopping']
    };
    
    // 待办事项列表
    var todos = [];
    var completedCount = 0;
    var activeCount = 0;
    
    // 初始化
    this.init = function() {
        console.log('TodoApp initialized with config:', config);
        self.loadFromStorage();
        self.updateStats();
    };
    
    // 添加待办事项
    this.addTodo = function(text, category, priority) {
        if (!text || text.trim() === '') {
            console.error('Todo text cannot be empty');
            return false;
        }
        
        if (!category) {
            category = config.defaultCategory;
        }
        
        if (!priority) {
            priority = 'normal';
        }
        
        if (todos.length >= config.maxTodos) {
            alert('Maximum number of todos reached: ' + config.maxTodos);
            return false;
        }
        
        var todo = {
            id: Date.now(),
            text: text.trim(),
            category: category,
            priority: priority,
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        todos.push(todo);
        activeCount++;
        self.saveToStorage();
        
        console.log('Added todo: ' + todo.text + ' [' + todo.category + ']');
        return todo;
    };
    
    // 切换完成状态
    this.toggleTodo = function(id) {
        var todo = null;
        for (var i = 0; i < todos.length; i++) {
            if (todos[i].id === id) {
                todo = todos[i];
                break;
            }
        }
        
        if (!todo) {
            console.error('Todo not found with id: ' + id);
            return false;
        }
        
        todo.completed = !todo.completed;
        
        if (todo.completed) {
            completedCount++;
            activeCount--;
        } else {
            completedCount--;
            activeCount++;
        }
        
        self.saveToStorage();
        return todo;
    };
    
    // 删除待办事项
    this.deleteTodo = function(id) {
        var index = -1;
        for (var i = 0; i < todos.length; i++) {
            if (todos[i].id === id) {
                index = i;
                break;
            }
        }
        
        if (index === -1) {
            console.error('Todo not found with id: ' + id);
            return false;
        }
        
        var deleted = todos.splice(index, 1)[0];
        
        if (deleted.completed) {
            completedCount--;
        } else {
            activeCount--;
        }
        
        self.saveToStorage();
        return deleted;
    };
    
    // 获取待办事项列表
    this.getTodos = function(filter) {
        if (!filter) {
            return todos.slice();
        }
        
        var filtered = [];
        for (var i = 0; i < todos.length; i++) {
            var todo = todos[i];
            
            if (filter.category && todo.category !== filter.category) {
                continue;
            }
            
            if (filter.completed !== undefined && todo.completed !== filter.completed) {
                continue;
            }
            
            if (filter.priority && todo.priority !== filter.priority) {
                continue;
            }
            
            filtered.push(todo);
        }
        
        return filtered;
    };
    
    // 获取统计信息
    this.getStats = function() {
        var categoryStats = {};
        
        for (var i = 0; i < config.categories.length; i++) {
            categoryStats[config.categories[i]] = 0;
        }
        
        for (var j = 0; j < todos.length; j++) {
            var category = todos[j].category;
            if (categoryStats[category] !== undefined) {
                categoryStats[category]++;
            }
        }
        
        return {
            total: todos.length,
            active: activeCount,
            completed: completedCount,
            byCategory: categoryStats
        };
    };
    
    // 清除已完成的待办事项
    this.clearCompleted = function() {
        var remaining = [];
        var cleared = [];
        
        for (var i = 0; i < todos.length; i++) {
            if (todos[i].completed) {
                cleared.push(todos[i]);
            } else {
                remaining.push(todos[i]);
            }
        }
        
        todos = remaining;
        completedCount = 0;
        self.saveToStorage();
        
        return cleared;
    };
    
    // 批量操作
    this.batchUpdate = function(ids, updates) {
        if (!Array.isArray(ids) || ids.length === 0) {
            console.error('Invalid ids array');
            return [];
        }
        
        var updated = [];
        
        for (var i = 0; i < ids.length; i++) {
            var id = ids[i];
            var todo = null;
            
            for (var j = 0; j < todos.length; j++) {
                if (todos[j].id === id) {
                    todo = todos[j];
                    break;
                }
            }
            
            if (todo) {
                if (updates.category) {
                    todo.category = updates.category;
                }
                if (updates.priority) {
                    todo.priority = updates.priority;
                }
                if (updates.completed !== undefined) {
                    if (todo.completed !== updates.completed) {
                        todo.completed = updates.completed;
                        if (todo.completed) {
                            completedCount++;
                            activeCount--;
                        } else {
                            completedCount--;
                            activeCount++;
                        }
                    }
                }
                
                updated.push(todo);
            }
        }
        
        if (updated.length > 0) {
            self.saveToStorage();
        }
        
        return updated;
    };
    
    // 更新统计
    this.updateStats = function() {
        activeCount = 0;
        completedCount = 0;
        
        for (var i = 0; i < todos.length; i++) {
            if (todos[i].completed) {
                completedCount++;
            } else {
                activeCount++;
            }
        }
    };
    
    // 保存到localStorage
    this.saveToStorage = function() {
        try {
            localStorage.setItem('todos', JSON.stringify(todos));
            localStorage.setItem('todoConfig', JSON.stringify(config));
        } catch (e) {
            console.error('Failed to save to localStorage:', e);
        }
    };
    
    // 从localStorage加载
    this.loadFromStorage = function() {
        try {
            var savedTodos = localStorage.getItem('todos');
            var savedConfig = localStorage.getItem('todoConfig');
            
            if (savedTodos) {
                todos = JSON.parse(savedTodos);
            }
            
            if (savedConfig) {
                var loadedConfig = JSON.parse(savedConfig);
                for (var key in loadedConfig) {
                    if (config.hasOwnProperty(key)) {
                        config[key] = loadedConfig[key];
                    }
                }
            }
        } catch (e) {
            console.error('Failed to load from localStorage:', e);
        }
    };
    
    // 导出为JSON
    this.exportData = function() {
        return JSON.stringify({
            todos: todos,
            config: config,
            stats: self.getStats(),
            exportDate: new Date().toISOString()
        }, null, 2);
    };
    
    // 搜索功能
    this.search = function(query) {
        if (!query || query.trim() === '') {
            return [];
        }
        
        query = query.toLowerCase();
        var results = [];
        
        for (var i = 0; i < todos.length; i++) {
            var todo = todos[i];
            if (todo.text.toLowerCase().indexOf(query) !== -1) {
                results.push(todo);
            }
        }
        
        return results;
    };
};

// 使用示例
var app = new TodoApp();
app.init();

// 测试代码
app.addTodo('学习ES6+语法', 'work', 'high');
app.addTodo('购买牛奶', 'shopping');
app.addTodo('跑步30分钟', 'personal', 'medium');

var workTodos = app.getTodos({ category: 'work' });
console.log('Work todos:', workTodos);

var stats = app.getStats();
console.log('Stats:', stats);
```

## 📝 重构要求

### 1. 变量声明
- 将所有`var`替换为`const`或`let`
- 对于不会重新赋值的变量使用`const`
- 需要重新赋值的变量使用`let`

### 2. 函数语法
- 将适合的函数转换为箭头函数
- 注意：需要`this`绑定的方法不应使用箭头函数
- 使用函数参数默认值

### 3. 字符串处理
- 将所有字符串拼接改为模板字符串
- 多行字符串使用模板字符串

### 4. 解构赋值
- 在函数参数中使用对象解构
- 在适当的地方使用数组和对象解构
- 使用解构赋值提取属性

### 5. 数组操作
- 使用数组方法（filter、map、find等）替代for循环
- 使用扩展运算符进行数组操作

### 6. 对象操作
- 使用对象属性简写
- 使用方法简写语法
- 使用扩展运算符合并对象

### 7. 模块化
- 将代码拆分为ES6模块
- 使用import/export语法
- 建议的模块结构：
  - `config.js` - 配置
  - `todo.js` - Todo类
  - `storage.js` - 存储相关
  - `app.js` - 主应用

### 8. 其他现代特性
- 使用可选链操作符（?.）
- 使用空值合并运算符（??）
- 使用逻辑赋值运算符（||=、&&=、??=）

## 🎨 期望的代码风格示例

```javascript
// config.js
export const DEFAULT_CONFIG = {
    maxTodos: 10,
    defaultCategory: 'personal',
    categories: ['personal', 'work', 'shopping']
};

// todo.js
export class Todo {
    constructor(text, category = DEFAULT_CONFIG.defaultCategory, priority = 'normal') {
        this.id = Date.now();
        this.text = text.trim();
        this.category = category;
        this.priority = priority;
        this.completed = false;
        this.createdAt = new Date().toISOString();
    }
}

// 使用现代语法的示例
const filterTodos = (todos, { category, completed, priority } = {}) => {
    return todos.filter(todo => {
        if (category && todo.category !== category) return false;
        if (completed !== undefined && todo.completed !== completed) return false;
        if (priority && todo.priority !== priority) return false;
        return true;
    });
};
```

## 🚀 额外挑战

如果你完成了基础重构，可以尝试：

1. **添加TypeScript类型定义**（预览Day 19内容）
2. **实现异步操作**（使用Promise/async-await）
3. **添加事件系统**（使用自定义事件）
4. **优化性能**（使用Map代替数组查找）

## 📊 评估标准

你的重构将根据以下标准评分：

1. **语法现代化（40%）**
   - 正确使用const/let
   - 恰当使用箭头函数
   - 模板字符串应用

2. **代码简洁性（30%）**
   - 使用解构赋值
   - 数组方法替代循环
   - 对象操作优化

3. **模块化（20%）**
   - 合理的模块拆分
   - 清晰的导入导出

4. **功能完整性（10%）**
   - 所有原始功能正常工作
   - 没有引入新的bug

## 💡 提示

- 不要为了使用新特性而使用，要考虑实际的好处
- 保持代码的可读性
- 测试每个功能确保重构没有破坏原有功能
- 可以添加注释说明重构的原因

现在开始你的重构之旅吧！记住，好的重构不仅让代码更现代，更要让代码更易理解和维护。