---
day: 24
exerciseTitle: "构建TaskFlow Pro任务管理应用"
approach: "使用模块化架构和现代JavaScript特性构建完整应用"
files:
  - filename: "package.json"
    content: |
      {
        "name": "taskflow-pro",
        "version": "1.0.0",
        "type": "module",
        "scripts": {
          "dev": "vite",
          "build": "vite build",
          "preview": "vite preview",
          "lint": "eslint src --ext .js",
          "test": "jest"
        },
        "dependencies": {
          "idb": "^7.1.1",
          "uuid": "^9.0.0",
          "date-fns": "^2.30.0"
        },
        "devDependencies": {
          "vite": "^5.0.0",
          "@vitejs/plugin-legacy": "^5.0.0",
          "eslint": "^8.55.0",
          "prettier": "^3.1.0",
          "jest": "^29.7.0"
        }
      }
  - filename: "src/index.js"
    content: |
      // 应用入口
      import './styles/main.css';
      import { App } from './modules/core/App.js';
      import { bootstrap } from './modules/core/bootstrap.js';
      
      // 初始化应用
      const container = bootstrap();
      const app = new App(container);
      
      // 启动应用
      document.addEventListener('DOMContentLoaded', () => {
          app.mount('#app');
      });
  - filename: "src/modules/core/App.js"
    content: |
      export class App {
          constructor(container) {
              this.container = container;
              this.router = container.get('router');
              this.store = container.get('store');
              this.authService = container.get('authService');
          }
          
          async mount(selector) {
              this.rootElement = document.querySelector(selector);
              
              // 恢复用户会话
              await this.authService.restoreSession();
              
              // 设置路由
              this.setupRoutes();
              
              // 渲染初始视图
              await this.router.handleRoute();
          }
          
          setupRoutes() {
              this.router.register('/', () => this.renderHome());
              this.router.register('/tasks', () => this.renderTasks());
              this.router.register('/login', () => this.renderLogin());
              
              // 路由守卫
              this.router.beforeEach((to, from) => {
                  if (to !== '/login' && !this.authService.isAuthenticated()) {
                      this.router.navigate('/login');
                      return false;
                  }
              });
          }
          
          async renderHome() {
              const { HomePage } = await import('../pages/HomePage.js');
              const page = new HomePage(this.container);
              this.rootElement.innerHTML = '';
              this.rootElement.appendChild(page.render());
          }
          
          async renderTasks() {
              const { TasksPage } = await import('../pages/TasksPage.js');
              const page = new TasksPage(this.container);
              this.rootElement.innerHTML = '';
              this.rootElement.appendChild(page.render());
          }
          
          async renderLogin() {
              const { LoginPage } = await import('../pages/LoginPage.js');
              const page = new LoginPage(this.container);
              this.rootElement.innerHTML = '';
              this.rootElement.appendChild(page.render());
          }
      }
  - filename: "src/models/Task.js"
    content: |
      import { v4 as uuidv4 } from 'uuid';
      
      export class Task {
          constructor(data = {}) {
              this.id = data.id || uuidv4();
              this.title = data.title || '';
              this.description = data.description || '';
              this.status = data.status || 'pending';
              this.priority = data.priority || 'medium';
              this.tags = data.tags || [];
              this.dueDate = data.dueDate ? new Date(data.dueDate) : null;
              this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
              this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();
          }
          
          validate() {
              const errors = [];
              if (!this.title.trim()) {
                  errors.push('标题不能为空');
              }
              if (this.dueDate && this.dueDate < new Date()) {
                  errors.push('截止日期不能是过去');
              }
              return errors;
          }
          
          update(updates) {
              Object.assign(this, updates);
              this.updatedAt = new Date();
              return this;
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
                  updatedAt: this.updatedAt.toISOString()
              };
          }
      }
  - filename: "src/services/TaskService.js"
    content: |
      import { openDB } from 'idb';
      import { Task } from '../models/Task.js';
      
      export class TaskService {
          constructor() {
              this.dbName = 'TaskFlowPro';
              this.storeName = 'tasks';
              this.db = null;
          }
          
          async init() {
              this.db = await openDB(this.dbName, 1, {
                  upgrade(db) {
                      if (!db.objectStoreNames.contains('tasks')) {
                          const store = db.createObjectStore('tasks', { keyPath: 'id' });
                          store.createIndex('status', 'status');
                          store.createIndex('dueDate', 'dueDate');
                      }
                  }
              });
          }
          
          async getAllTasks() {
              if (!this.db) await this.init();
              const tasks = await this.db.getAll(this.storeName);
              return tasks.map(data => new Task(data));
          }
          
          async createTask(taskData) {
              const task = new Task(taskData);
              const errors = task.validate();
              
              if (errors.length > 0) {
                  throw new Error(errors.join(', '));
              }
              
              if (!this.db) await this.init();
              await this.db.put(this.storeName, task.toJSON());
              
              return task;
          }
          
          async updateTask(id, updates) {
              if (!this.db) await this.init();
              const taskData = await this.db.get(this.storeName, id);
              
              if (!taskData) {
                  throw new Error('任务不存在');
              }
              
              const task = new Task(taskData);
              task.update(updates);
              
              const errors = task.validate();
              if (errors.length > 0) {
                  throw new Error(errors.join(', '));
              }
              
              await this.db.put(this.storeName, task.toJSON());
              return task;
          }
          
          async deleteTask(id) {
              if (!this.db) await this.init();
              await this.db.delete(this.storeName, id);
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
      }
  - filename: "src/services/AuthService.js"
    content: |
      export class AuthService {
          constructor(store, eventBus) {
              this.store = store;
              this.eventBus = eventBus;
              this.tokenKey = 'authToken';
              this.userKey = 'currentUser';
          }
          
          async login(username, password) {
              // 简化的登录实现（实际应该调用API）
              if (username && password.length >= 6) {
                  const user = {
                      id: 'user_' + Date.now(),
                      username,
                      email: username + '@example.com'
                  };
                  
                  const token = btoa(JSON.stringify({ user, exp: Date.now() + 86400000 }));
                  
                  localStorage.setItem(this.tokenKey, token);
                  localStorage.setItem(this.userKey, JSON.stringify(user));
                  
                  this.store.setState({ user, isAuthenticated: true });
                  this.eventBus.emit('auth:login', user);
                  
                  return user;
              }
              
              throw new Error('用户名或密码错误');
          }
          
          logout() {
              localStorage.removeItem(this.tokenKey);
              localStorage.removeItem(this.userKey);
              
              this.store.setState({ user: null, isAuthenticated: false });
              this.eventBus.emit('auth:logout');
              
              window.location.href = '/login';
          }
          
          isAuthenticated() {
              const token = localStorage.getItem(this.tokenKey);
              if (!token) return false;
              
              try {
                  const data = JSON.parse(atob(token));
                  return data.exp > Date.now();
              } catch {
                  return false;
              }
          }
          
          async restoreSession() {
              if (this.isAuthenticated()) {
                  const userStr = localStorage.getItem(this.userKey);
                  if (userStr) {
                      const user = JSON.parse(userStr);
                      this.store.setState({ user, isAuthenticated: true });
                      return user;
                  }
              }
              return null;
          }
      }
  - filename: "src/pages/TasksPage.js"
    content: |
      export class TasksPage {
          constructor(container) {
              this.container = container;
              this.taskService = container.get('taskService');
              this.tasks = [];
              this.filters = {
                  status: 'all',
                  search: ''
              };
          }
          
          render() {
              const page = document.createElement('div');
              page.className = 'tasks-page';
              page.innerHTML = `
                  <header class="page-header">
                      <h1>我的任务</h1>
                      <button class="btn-primary" id="newTaskBtn">新建任务</button>
                  </header>
                  
                  <div class="filters">
                      <input type="search" placeholder="搜索任务..." id="searchInput">
                      <select id="statusFilter">
                          <option value="all">全部</option>
                          <option value="pending">待办</option>
                          <option value="in-progress">进行中</option>
                          <option value="completed">已完成</option>
                      </select>
                  </div>
                  
                  <div class="tasks-container" id="tasksList">
                      <div class="loading">加载中...</div>
                  </div>
              `;
              
              this.bindEvents(page);
              this.loadTasks();
              
              return page;
          }
          
          bindEvents(page) {
              page.querySelector('#newTaskBtn').addEventListener('click', () => {
                  this.showTaskModal();
              });
              
              page.querySelector('#searchInput').addEventListener('input', (e) => {
                  this.filters.search = e.target.value;
                  this.renderTasks();
              });
              
              page.querySelector('#statusFilter').addEventListener('change', (e) => {
                  this.filters.status = e.target.value;
                  this.renderTasks();
              });
          }
          
          async loadTasks() {
              try {
                  this.tasks = await this.taskService.getAllTasks();
                  this.renderTasks();
              } catch (error) {
                  console.error('加载任务失败:', error);
                  this.showError('加载任务失败');
              }
          }
          
          renderTasks() {
              const container = document.getElementById('tasksList');
              const filteredTasks = this.getFilteredTasks();
              
              if (filteredTasks.length === 0) {
                  container.innerHTML = '<div class="empty-state">暂无任务</div>';
                  return;
              }
              
              container.innerHTML = filteredTasks.map(task => `
                  <div class="task-card" data-id="${task.id}">
                      <div class="task-header">
                          <h3>${this.escapeHtml(task.title)}</h3>
                          <span class="task-status status-${task.status}">${this.getStatusText(task.status)}</span>
                      </div>
                      <p>${this.escapeHtml(task.description)}</p>
                      <div class="task-meta">
                          ${task.dueDate ? `<span class="due-date">截止: ${new Date(task.dueDate).toLocaleDateString()}</span>` : ''}
                          <span class="priority priority-${task.priority}">${task.priority}</span>
                      </div>
                      <div class="task-actions">
                          <button class="btn-edit" data-id="${task.id}">编辑</button>
                          <button class="btn-delete" data-id="${task.id}">删除</button>
                      </div>
                  </div>
              `).join('');
              
              // 绑定任务卡片事件
              container.querySelectorAll('.btn-edit').forEach(btn => {
                  btn.addEventListener('click', (e) => {
                      const taskId = e.target.dataset.id;
                      const task = this.tasks.find(t => t.id === taskId);
                      this.showTaskModal(task);
                  });
              });
              
              container.querySelectorAll('.btn-delete').forEach(btn => {
                  btn.addEventListener('click', (e) => {
                      const taskId = e.target.dataset.id;
                      this.deleteTask(taskId);
                  });
              });
          }
          
          getFilteredTasks() {
              return this.tasks.filter(task => {
                  if (this.filters.status !== 'all' && task.status !== this.filters.status) {
                      return false;
                  }
                  
                  if (this.filters.search) {
                      const search = this.filters.search.toLowerCase();
                      return task.title.toLowerCase().includes(search) ||
                             task.description.toLowerCase().includes(search);
                  }
                  
                  return true;
              });
          }
          
          async deleteTask(taskId) {
              if (confirm('确定要删除这个任务吗？')) {
                  try {
                      await this.taskService.deleteTask(taskId);
                      await this.loadTasks();
                  } catch (error) {
                      this.showError('删除失败');
                  }
              }
          }
          
          showTaskModal(task = null) {
              // 实现任务编辑模态框
              const modal = document.createElement('div');
              modal.className = 'modal';
              modal.innerHTML = `
                  <div class="modal-content">
                      <h2>${task ? '编辑任务' : '新建任务'}</h2>
                      <form id="taskForm">
                          <input type="text" name="title" placeholder="任务标题" value="${task?.title || ''}" required>
                          <textarea name="description" placeholder="任务描述">${task?.description || ''}</textarea>
                          <select name="status">
                              <option value="pending" ${task?.status === 'pending' ? 'selected' : ''}>待办</option>
                              <option value="in-progress" ${task?.status === 'in-progress' ? 'selected' : ''}>进行中</option>
                              <option value="completed" ${task?.status === 'completed' ? 'selected' : ''}>已完成</option>
                          </select>
                          <input type="date" name="dueDate" value="${task?.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''}">
                          <button type="submit" class="btn-primary">保存</button>
                          <button type="button" class="btn-cancel">取消</button>
                      </form>
                  </div>
              `;
              
              document.body.appendChild(modal);
              
              modal.querySelector('#taskForm').addEventListener('submit', async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target);
                  const taskData = Object.fromEntries(formData);
                  
                  try {
                      if (task) {
                          await this.taskService.updateTask(task.id, taskData);
                      } else {
                          await this.taskService.createTask(taskData);
                      }
                      modal.remove();
                      await this.loadTasks();
                  } catch (error) {
                      alert(error.message);
                  }
              });
              
              modal.querySelector('.btn-cancel').addEventListener('click', () => {
                  modal.remove();
              });
          }
          
          escapeHtml(text) {
              const div = document.createElement('div');
              div.textContent = text;
              return div.innerHTML;
          }
          
          getStatusText(status) {
              const statusMap = {
                  'pending': '待办',
                  'in-progress': '进行中',
                  'completed': '已完成'
              };
              return statusMap[status] || status;
          }
          
          showError(message) {
              const notification = document.createElement('div');
              notification.className = 'notification error';
              notification.textContent = message;
              document.body.appendChild(notification);
              setTimeout(() => notification.remove(), 3000);
          }
      }
  - filename: "src/styles/main.css"
    content: |
      :root {
          --primary-color: #2563eb;
          --secondary-color: #64748b;
          --success-color: #10b981;
          --danger-color: #ef4444;
          --warning-color: #f59e0b;
          --bg-color: #ffffff;
          --text-color: #1e293b;
          --border-color: #e2e8f0;
      }
      
      * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
      }
      
      body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background-color: var(--bg-color);
          color: var(--text-color);
          line-height: 1.6;
      }
      
      #app {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
      }
      
      .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 2rem;
          border-bottom: 1px solid var(--border-color);
      }
      
      .btn-primary {
          background-color: var(--primary-color);
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 0.5rem;
          cursor: pointer;
          font-size: 1rem;
          transition: opacity 0.2s;
      }
      
      .btn-primary:hover {
          opacity: 0.9;
      }
      
      .filters {
          padding: 1.5rem 2rem;
          display: flex;
          gap: 1rem;
          background-color: #f8fafc;
      }
      
      .filters input,
      .filters select {
          padding: 0.5rem 1rem;
          border: 1px solid var(--border-color);
          border-radius: 0.375rem;
          font-size: 1rem;
      }
      
      .filters input {
          flex: 1;
      }
      
      .tasks-container {
          padding: 2rem;
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
      }
      
      .task-card {
          background: white;
          border: 1px solid var(--border-color);
          border-radius: 0.5rem;
          padding: 1.5rem;
          transition: box-shadow 0.2s;
      }
      
      .task-card:hover {
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
      }
      
      .task-header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          margin-bottom: 0.75rem;
      }
      
      .task-header h3 {
          font-size: 1.125rem;
          font-weight: 600;
      }
      
      .task-status {
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.875rem;
          font-weight: 500;
      }
      
      .status-pending {
          background-color: #fef3c7;
          color: #92400e;
      }
      
      .status-in-progress {
          background-color: #dbeafe;
          color: #1e40af;
      }
      
      .status-completed {
          background-color: #d1fae5;
          color: #065f46;
      }
      
      .task-meta {
          margin-top: 1rem;
          display: flex;
          gap: 1rem;
          font-size: 0.875rem;
          color: var(--secondary-color);
      }
      
      .task-actions {
          margin-top: 1rem;
          display: flex;
          gap: 0.5rem;
      }
      
      .modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
      }
      
      .modal-content {
          background: white;
          padding: 2rem;
          border-radius: 0.5rem;
          width: 90%;
          max-width: 500px;
      }
      
      .modal-content form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-top: 1.5rem;
      }
      
      .modal-content input,
      .modal-content textarea,
      .modal-content select {
          padding: 0.75rem;
          border: 1px solid var(--border-color);
          border-radius: 0.375rem;
          font-size: 1rem;
      }
      
      .modal-content textarea {
          min-height: 100px;
          resize: vertical;
      }
      
      .notification {
          position: fixed;
          top: 1rem;
          right: 1rem;
          padding: 1rem 1.5rem;
          border-radius: 0.5rem;
          color: white;
          z-index: 2000;
          animation: slideIn 0.3s ease-out;
      }
      
      .notification.error {
          background-color: var(--danger-color);
      }
      
      @keyframes slideIn {
          from {
              transform: translateX(100%);
              opacity: 0;
          }
          to {
              transform: translateX(0);
              opacity: 1;
          }
      }
      
      @media (max-width: 768px) {
          .tasks-container {
              grid-template-columns: 1fr;
              padding: 1rem;
          }
          
          .filters {
              flex-direction: column;
          }
      }
keyTakeaways:
  - "模块化架构使代码易于维护和扩展"
  - "IndexedDB提供可靠的客户端数据存储"
  - "事件驱动架构实现组件间解耦"
  - "防御性编程确保应用稳定性"
  - "渐进式增强提供更好的用户体验"
---

# TaskFlow Pro完整实现

这个解决方案展示了一个功能完整的任务管理应用，综合运用了Phase 2学到的所有JavaScript高级特性。

## 核心亮点

1. **模块化架构**
   - 清晰的模块划分
   - 依赖注入容器
   - 事件驱动通信

2. **数据持久化**
   - IndexedDB存储
   - 模型验证
   - 离线支持

3. **用户体验**
   - 响应式设计
   - 实时搜索
   - 友好的错误提示

4. **安全实践**
   - 输入清理
   - XSS防护
   - 安全的认证流程

## 运行项目

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 扩展建议

1. 添加更多功能：
   - 任务拖拽排序
   - 批量操作
   - 数据导出

2. 性能优化：
   - 虚拟滚动
   - Service Worker
   - 代码分割

3. 测试覆盖：
   - 单元测试
   - 集成测试
   - E2E测试

恭喜你完成了Phase 2的学习！你已经掌握了现代JavaScript开发的核心技能。