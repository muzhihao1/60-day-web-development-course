---
title: "应用架构设计"
description: "学习和掌握应用架构设计的实际应用"
category: "advanced"
language: "javascript"
---

# TaskFlow Pro应用架构

## 模块化架构设计

```javascript
// src/modules/core/EventBus.js - 事件总线
export class EventBus {
    constructor() {
        this.events = new Map();
    }
    
    on(event, handler) {
        if (!this.events.has(event)) {
            this.events.set(event, new Set());
        }
        this.events.get(event).add(handler);
        
        // 返回取消订阅函数
        return () => this.off(event, handler);
    }
    
    off(event, handler) {
        if (this.events.has(event)) {
            this.events.get(event).delete(handler);
        }
    }
    
    emit(event, data) {
        if (this.events.has(event)) {
            this.events.get(event).forEach(handler => {
                try {
                    handler(data);
                } catch (error) {
                    console.error(`Error in event handler for ${event}:`, error);
                }
            });
        }
    }
    
    once(event, handler) {
        const wrapper = (data) => {
            handler(data);
            this.off(event, wrapper);
        };
        this.on(event, wrapper);
    }
}

// src/modules/core/Store.js - 状态管理
export class Store {
    constructor(initialState = {}) {
        this.state = initialState;
        this.listeners = new Set();
        this.middleware = [];
    }
    
    getState() {
        return { ...this.state };
    }
    
    setState(updates) {
        const prevState = this.state;
        this.state = { ...this.state, ...updates };
        
        // 执行中间件
        this.middleware.forEach(fn => fn(prevState, this.state));
        
        // 通知监听器
        this.listeners.forEach(listener => listener(this.state, prevState));
    }
    
    subscribe(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }
    
    use(middleware) {
        this.middleware.push(middleware);
    }
}

// src/modules/core/Router.js - 简单路由系统
export class Router {
    constructor() {
        this.routes = new Map();
        this.currentRoute = null;
        this.beforeHooks = [];
        this.afterHooks = [];
        
        window.addEventListener('popstate', () => this.handleRoute());
    }
    
    register(path, handler) {
        this.routes.set(path, handler);
    }
    
    beforeEach(hook) {
        this.beforeHooks.push(hook);
    }
    
    afterEach(hook) {
        this.afterHooks.push(hook);
    }
    
    async navigate(path) {
        // 执行前置守卫
        for (const hook of this.beforeHooks) {
            const result = await hook(path, this.currentRoute);
            if (result === false) return;
        }
        
        window.history.pushState(null, '', path);
        await this.handleRoute();
        
        // 执行后置钩子
        for (const hook of this.afterHooks) {
            await hook(path, this.currentRoute);
        }
    }
    
    async handleRoute() {
        const path = window.location.pathname;
        const handler = this.routes.get(path) || this.routes.get('*');
        
        if (handler) {
            this.currentRoute = path;
            await handler();
        }
    }
}
```

## 数据模型设计

```javascript
// src/models/Task.js - 任务模型
export class Task {
    constructor(data = {}) {
        this.id = data.id || this.generateId();
        this.title = data.title || '';
        this.description = data.description || '';
        this.status = data.status || 'pending'; // pending, in-progress, completed
        this.priority = data.priority || 'medium'; // low, medium, high
        this.tags = data.tags || [];
        this.dueDate = data.dueDate ? new Date(data.dueDate) : null;
        this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
        this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();
        this.completedAt = data.completedAt ? new Date(data.completedAt) : null;
        this.subtasks = data.subtasks || [];
        this.attachments = data.attachments || [];
    }
    
    generateId() {
        return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    validate() {
        const errors = [];
        
        if (!this.title || this.title.trim().length === 0) {
            errors.push('Title is required');
        }
        
        if (this.title.length > 200) {
            errors.push('Title must be less than 200 characters');
        }
        
        if (!['pending', 'in-progress', 'completed'].includes(this.status)) {
            errors.push('Invalid status');
        }
        
        if (!['low', 'medium', 'high'].includes(this.priority)) {
            errors.push('Invalid priority');
        }
        
        if (this.dueDate && this.dueDate < new Date()) {
            errors.push('Due date cannot be in the past');
        }
        
        return errors;
    }
    
    toJSON() {
        return {
            id: this.id,
            title: this.title,
            description: this.description,
            status: this.status,
            priority: this.priority,
            tags: this.tags,
            dueDate: this.dueDate?.toISOString(),
            createdAt: this.createdAt.toISOString(),
            updatedAt: this.updatedAt.toISOString(),
            completedAt: this.completedAt?.toISOString(),
            subtasks: this.subtasks,
            attachments: this.attachments
        };
    }
    
    static fromJSON(json) {
        return new Task(json);
    }
    
    update(updates) {
        Object.assign(this, updates);
        this.updatedAt = new Date();
        
        if (updates.status === 'completed' && !this.completedAt) {
            this.completedAt = new Date();
        }
        
        return this;
    }
    
    addSubtask(subtask) {
        this.subtasks.push({
            id: this.generateId(),
            title: subtask,
            completed: false
        });
        this.updatedAt = new Date();
    }
    
    toggleSubtask(subtaskId) {
        const subtask = this.subtasks.find(st => st.id === subtaskId);
        if (subtask) {
            subtask.completed = !subtask.completed;
            this.updatedAt = new Date();
        }
    }
    
    addTag(tag) {
        if (!this.tags.includes(tag)) {
            this.tags.push(tag);
            this.updatedAt = new Date();
        }
    }
    
    removeTag(tag) {
        const index = this.tags.indexOf(tag);
        if (index > -1) {
            this.tags.splice(index, 1);
            this.updatedAt = new Date();
        }
    }
}

// src/models/User.js - 用户模型
export class User {
    constructor(data = {}) {
        this.id = data.id || this.generateId();
        this.username = data.username || '';
        this.email = data.email || '';
        this.preferences = data.preferences || {
            theme: 'light',
            notifications: true,
            language: 'zh-CN'
        };
        this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
    }
    
    generateId() {
        return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    validate() {
        const errors = [];
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (!this.username || this.username.length < 3) {
            errors.push('Username must be at least 3 characters');
        }
        
        if (!this.email || !emailRegex.test(this.email)) {
            errors.push('Invalid email address');
        }
        
        return errors;
    }
    
    toJSON() {
        return {
            id: this.id,
            username: this.username,
            email: this.email,
            preferences: this.preferences,
            createdAt: this.createdAt.toISOString()
        };
    }
}
```

## 服务层实现

```javascript
// src/services/TaskService.js - 任务服务
import { Task } from '../models/Task.js';
import { StorageService } from './StorageService.js';
import { APIService } from './APIService.js';

export class TaskService {
    constructor() {
        this.storage = new StorageService('tasks');
        this.api = new APIService('/api/tasks');
        this.cache = new Map();
    }
    
    async getAllTasks() {
        try {
            // 尝试从API获取
            const tasks = await this.api.getAll();
            
            // 更新本地存储
            await this.storage.setAll(tasks);
            
            // 更新缓存
            tasks.forEach(task => {
                this.cache.set(task.id, new Task(task));
            });
            
            return tasks.map(task => new Task(task));
        } catch (error) {
            console.warn('API unavailable, falling back to local storage:', error);
            
            // 从本地存储获取
            const localTasks = await this.storage.getAll();
            return localTasks.map(task => new Task(task));
        }
    }
    
    async getTaskById(id) {
        // 检查缓存
        if (this.cache.has(id)) {
            return this.cache.get(id);
        }
        
        try {
            const task = await this.api.getById(id);
            const taskInstance = new Task(task);
            this.cache.set(id, taskInstance);
            return taskInstance;
        } catch (error) {
            const task = await this.storage.get(id);
            return task ? new Task(task) : null;
        }
    }
    
    async createTask(taskData) {
        const task = new Task(taskData);
        const errors = task.validate();
        
        if (errors.length > 0) {
            throw new Error(errors.join(', '));
        }
        
        try {
            // 保存到API
            const savedTask = await this.api.create(task.toJSON());
            const taskInstance = new Task(savedTask);
            
            // 更新本地存储
            await this.storage.set(taskInstance.id, savedTask);
            
            // 更新缓存
            this.cache.set(taskInstance.id, taskInstance);
            
            return taskInstance;
        } catch (error) {
            console.warn('Failed to save to API, saving locally:', error);
            
            // 保存到本地
            await this.storage.set(task.id, task.toJSON());
            this.cache.set(task.id, task);
            
            // 标记为需要同步
            await this.markForSync(task.id, 'create');
            
            return task;
        }
    }
    
    async updateTask(id, updates) {
        const task = await this.getTaskById(id);
        if (!task) {
            throw new Error('Task not found');
        }
        
        task.update(updates);
        const errors = task.validate();
        
        if (errors.length > 0) {
            throw new Error(errors.join(', '));
        }
        
        try {
            // 更新到API
            const updatedTask = await this.api.update(id, task.toJSON());
            const taskInstance = new Task(updatedTask);
            
            // 更新本地存储
            await this.storage.set(id, updatedTask);
            
            // 更新缓存
            this.cache.set(id, taskInstance);
            
            return taskInstance;
        } catch (error) {
            console.warn('Failed to update on API, updating locally:', error);
            
            // 更新本地
            await this.storage.set(id, task.toJSON());
            
            // 标记为需要同步
            await this.markForSync(id, 'update');
            
            return task;
        }
    }
    
    async deleteTask(id) {
        try {
            await this.api.delete(id);
        } catch (error) {
            console.warn('Failed to delete from API:', error);
            await this.markForSync(id, 'delete');
        }
        
        // 删除本地数据
        await this.storage.delete(id);
        this.cache.delete(id);
    }
    
    async searchTasks(query) {
        const allTasks = await this.getAllTasks();
        const searchTerm = query.toLowerCase();
        
        return allTasks.filter(task => 
            task.title.toLowerCase().includes(searchTerm) ||
            task.description.toLowerCase().includes(searchTerm) ||
            task.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        );
    }
    
    async getTasksByStatus(status) {
        const allTasks = await this.getAllTasks();
        return allTasks.filter(task => task.status === status);
    }
    
    async getTasksByTag(tag) {
        const allTasks = await this.getAllTasks();
        return allTasks.filter(task => task.tags.includes(tag));
    }
    
    async getUpcomingTasks(days = 7) {
        const allTasks = await this.getAllTasks();
        const now = new Date();
        const future = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
        
        return allTasks.filter(task => 
            task.dueDate && 
            task.dueDate >= now && 
            task.dueDate <= future &&
            task.status !== 'completed'
        ).sort((a, b) => a.dueDate - b.dueDate);
    }
    
    async getOverdueTasks() {
        const allTasks = await this.getAllTasks();
        const now = new Date();
        
        return allTasks.filter(task => 
            task.dueDate && 
            task.dueDate < now && 
            task.status !== 'completed'
        );
    }
    
    async markForSync(id, action) {
        const syncQueue = await this.storage.get('_syncQueue') || [];
        syncQueue.push({ id, action, timestamp: new Date().toISOString() });
        await this.storage.set('_syncQueue', syncQueue);
    }
    
    async syncOfflineChanges() {
        const syncQueue = await this.storage.get('_syncQueue') || [];
        const failedSync = [];
        
        for (const item of syncQueue) {
            try {
                switch (item.action) {
                    case 'create':
                        const task = await this.storage.get(item.id);
                        if (task) {
                            await this.api.create(task);
                        }
                        break;
                    case 'update':
                        const updatedTask = await this.storage.get(item.id);
                        if (updatedTask) {
                            await this.api.update(item.id, updatedTask);
                        }
                        break;
                    case 'delete':
                        await this.api.delete(item.id);
                        break;
                }
            } catch (error) {
                console.error(`Failed to sync ${item.action} for ${item.id}:`, error);
                failedSync.push(item);
            }
        }
        
        // 更新同步队列，只保留失败的项目
        await this.storage.set('_syncQueue', failedSync);
        
        return {
            synced: syncQueue.length - failedSync.length,
            failed: failedSync.length
        };
    }
}
```

## 依赖注入容器

```javascript
// src/core/Container.js - 依赖注入容器
export class Container {
    constructor() {
        this.services = new Map();
        this.singletons = new Map();
    }
    
    register(name, factory, options = {}) {
        this.services.set(name, {
            factory,
            singleton: options.singleton || false
        });
    }
    
    get(name) {
        const service = this.services.get(name);
        
        if (!service) {
            throw new Error(`Service "${name}" not found`);
        }
        
        if (service.singleton) {
            if (!this.singletons.has(name)) {
                this.singletons.set(name, service.factory(this));
            }
            return this.singletons.get(name);
        }
        
        return service.factory(this);
    }
    
    has(name) {
        return this.services.has(name);
    }
}

// src/core/bootstrap.js - 应用启动
import { Container } from './Container.js';
import { EventBus } from '../modules/core/EventBus.js';
import { Store } from '../modules/core/Store.js';
import { Router } from '../modules/core/Router.js';
import { TaskService } from '../services/TaskService.js';
import { AuthService } from '../services/AuthService.js';
import { UIService } from '../services/UIService.js';

export function bootstrap() {
    const container = new Container();
    
    // 注册核心服务
    container.register('eventBus', () => new EventBus(), { singleton: true });
    container.register('store', () => new Store({
        user: null,
        tasks: [],
        theme: 'light',
        loading: false
    }), { singleton: true });
    container.register('router', () => new Router(), { singleton: true });
    
    // 注册业务服务
    container.register('taskService', (container) => {
        return new TaskService();
    }, { singleton: true });
    
    container.register('authService', (container) => {
        return new AuthService(
            container.get('store'),
            container.get('eventBus')
        );
    }, { singleton: true });
    
    container.register('uiService', (container) => {
        return new UIService(
            container.get('store'),
            container.get('eventBus')
        );
    }, { singleton: true });
    
    // 设置路由
    const router = container.get('router');
    
    router.register('/', () => import('../pages/HomePage.js'));
    router.register('/tasks', () => import('../pages/TasksPage.js'));
    router.register('/tasks/:id', () => import('../pages/TaskDetailPage.js'));
    router.register('/login', () => import('../pages/LoginPage.js'));
    router.register('/settings', () => import('../pages/SettingsPage.js'));
    router.register('*', () => import('../pages/NotFoundPage.js'));
    
    // 路由守卫
    router.beforeEach(async (to, from) => {
        const authService = container.get('authService');
        const publicRoutes = ['/login', '/register'];
        
        if (!publicRoutes.includes(to) && !authService.isAuthenticated()) {
            router.navigate('/login');
            return false;
        }
    });
    
    // 初始化应用
    window.addEventListener('DOMContentLoaded', async () => {
        // 恢复用户会话
        const authService = container.get('authService');
        await authService.restoreSession();
        
        // 启动路由
        router.handleRoute();
        
        // 设置全局错误处理
        window.addEventListener('error', (event) => {
            console.error('Global error:', event.error);
            const uiService = container.get('uiService');
            uiService.showError('发生了一个错误，请刷新页面重试');
        });
        
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            const uiService = container.get('uiService');
            uiService.showError('操作失败，请重试');
        });
    });
    
    return container;
}

// 启动应用
export const app = bootstrap();
```