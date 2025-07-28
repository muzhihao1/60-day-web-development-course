---
day: 16
title: "交互式任务管理器：DOM操作与事件处理实战"
description: "构建一个功能丰富的任务管理器，实践DOM操作、事件处理、拖拽排序和性能优化"
difficulty: "intermediate"
estimatedTime: 90
requirements:
  - "实现任务的增删改查功能"
  - "支持拖拽排序"
  - "实现键盘快捷键"
  - "添加自定义右键菜单"
  - "实现撤销/重做功能"
  - "使用localStorage持久化数据"
  - "优化大量任务的渲染性能"
hints:
  - "使用事件委托处理动态创建的元素"
  - "使用DocumentFragment批量插入DOM"
  - "实现命令模式来支持撤销/重做"
  - "使用Drag and Drop API实现拖拽"
  - "考虑使用虚拟滚动处理大量任务"
checkpoints:
  - task: "创建基础UI结构"
    completed: false
  - task: "实现任务的添加和删除"
    completed: false
  - task: "添加编辑功能"
    completed: false
  - task: "实现拖拽排序"
    completed: false
  - task: "添加键盘快捷键"
    completed: false
  - task: "实现右键菜单"
    completed: false
  - task: "添加撤销/重做功能"
    completed: false
  - task: "实现本地存储"
    completed: false
  - task: "优化性能"
    completed: false
starterCode:
  language: "javascript"
  path: "/exercises/day-16/task-manager.html"
---

# 练习：交互式任务管理器

## 🎯 任务目标

创建一个功能完整的任务管理器，展示你对DOM操作和事件处理的掌握。这个应用不仅要有基本的CRUD功能，还要提供丰富的交互体验，包括拖拽、快捷键、右键菜单等高级功能。

## 📋 功能需求

### 1. 基础功能
- **任务管理**：添加、删除、编辑任务
- **任务状态**：标记完成/未完成
- **任务详情**：标题、描述、优先级、截止日期
- **分类管理**：按类别组织任务

### 2. 交互功能
- **拖拽排序**：拖动任务改变顺序
- **键盘快捷键**：
  - `Ctrl/Cmd + N`：新建任务
  - `Delete`：删除选中任务
  - `Ctrl/Cmd + Z`：撤销
  - `Ctrl/Cmd + Y`：重做
  - `Esc`：取消编辑
- **右键菜单**：编辑、删除、复制、设置优先级
- **批量操作**：全选、批量删除、批量标记

### 3. 高级功能
- **撤销/重做**：支持最近10个操作
- **搜索过滤**：实时搜索任务
- **排序功能**：按日期、优先级、状态排序
- **数据持久化**：使用localStorage保存

### 4. 性能要求
- 支持1000+任务的流畅操作
- 使用事件委托减少内存占用
- 批量DOM操作优化
- 虚拟滚动（可选）

## 🔧 技术要求

1. **DOM操作**
   - 使用现代DOM API（querySelector、classList等）
   - 批量操作使用DocumentFragment
   - 合理使用innerHTML和createElement

2. **事件处理**
   - 使用事件委托处理动态元素
   - 正确处理事件冒泡和捕获
   - 实现自定义事件系统

3. **性能优化**
   - 防抖搜索输入
   - 节流滚动事件
   - 懒加载任务详情

4. **设计模式**
   - MVC或类似架构
   - 命令模式（撤销/重做）
   - 发布订阅模式（组件通信）

## 📝 初始代码

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>交互式任务管理器</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: #f5f7fa;
            color: #333;
        }
        
        .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        
        header {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            margin-bottom: 20px;
        }
        
        .header-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 15px;
        }
        
        h1 {
            color: #2c3e50;
            font-size: 24px;
        }
        
        .controls {
            display: flex;
            gap: 10px;
            align-items: center;
        }
        
        button {
            padding: 8px 16px;
            border: none;
            border-radius: 4px;
            background: #3498db;
            color: white;
            cursor: pointer;
            font-size: 14px;
            transition: background 0.3s;
        }
        
        button:hover {
            background: #2980b9;
        }
        
        button:disabled {
            background: #bdc3c7;
            cursor: not-allowed;
        }
        
        .search-box {
            position: relative;
            flex: 1;
            max-width: 300px;
        }
        
        .search-box input {
            width: 100%;
            padding: 8px 12px 8px 36px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 14px;
        }
        
        .search-box::before {
            content: "🔍";
            position: absolute;
            left: 10px;
            top: 50%;
            transform: translateY(-50%);
        }
        
        .task-filters {
            background: white;
            padding: 15px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            margin-bottom: 20px;
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
        }
        
        .filter-btn {
            padding: 6px 12px;
            border: 1px solid #ddd;
            background: white;
            border-radius: 20px;
            font-size: 12px;
            cursor: pointer;
            transition: all 0.3s;
        }
        
        .filter-btn.active {
            background: #3498db;
            color: white;
            border-color: #3498db;
        }
        
        .task-list {
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            min-height: 400px;
            padding: 20px;
        }
        
        .task-item {
            padding: 15px;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            margin-bottom: 10px;
            background: white;
            cursor: move;
            transition: all 0.3s;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .task-item:hover {
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            transform: translateY(-2px);
        }
        
        .task-item.dragging {
            opacity: 0.5;
            cursor: grabbing;
        }
        
        .task-item.drag-over {
            border-color: #3498db;
            background: #f0f8ff;
        }
        
        .task-item.completed {
            opacity: 0.7;
        }
        
        .task-item.completed .task-title {
            text-decoration: line-through;
        }
        
        .task-checkbox {
            width: 20px;
            height: 20px;
            cursor: pointer;
        }
        
        .task-content {
            flex: 1;
        }
        
        .task-title {
            font-weight: 500;
            margin-bottom: 4px;
        }
        
        .task-meta {
            font-size: 12px;
            color: #666;
            display: flex;
            gap: 15px;
        }
        
        .task-priority {
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 500;
        }
        
        .priority-high {
            background: #ffebee;
            color: #c62828;
        }
        
        .priority-medium {
            background: #fff3e0;
            color: #ef6c00;
        }
        
        .priority-low {
            background: #e8f5e9;
            color: #2e7d32;
        }
        
        .task-actions {
            display: flex;
            gap: 5px;
        }
        
        .task-actions button {
            padding: 4px 8px;
            font-size: 12px;
            background: transparent;
            color: #666;
            border: 1px solid #ddd;
        }
        
        .task-actions button:hover {
            background: #f5f5f5;
            color: #333;
        }
        
        .empty-state {
            text-align: center;
            padding: 60px 20px;
            color: #999;
        }
        
        .modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            z-index: 1000;
        }
        
        .modal.active {
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .modal-content {
            background: white;
            padding: 30px;
            border-radius: 8px;
            width: 90%;
            max-width: 500px;
        }
        
        .form-group {
            margin-bottom: 15px;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 5px;
            font-weight: 500;
        }
        
        .form-group input,
        .form-group textarea,
        .form-group select {
            width: 100%;
            padding: 8px 12px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 14px;
        }
        
        .form-group textarea {
            resize: vertical;
            min-height: 80px;
        }
        
        .form-actions {
            display: flex;
            gap: 10px;
            justify-content: flex-end;
            margin-top: 20px;
        }
        
        .context-menu {
            position: fixed;
            background: white;
            border: 1px solid #ddd;
            border-radius: 4px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
            z-index: 1001;
            display: none;
            min-width: 150px;
        }
        
        .context-menu.active {
            display: block;
        }
        
        .context-menu-item {
            padding: 8px 16px;
            cursor: pointer;
            font-size: 14px;
            border-bottom: 1px solid #f0f0f0;
        }
        
        .context-menu-item:last-child {
            border-bottom: none;
        }
        
        .context-menu-item:hover {
            background: #f5f5f5;
        }
        
        .stats {
            background: white;
            padding: 15px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            margin-bottom: 20px;
            display: flex;
            justify-content: space-around;
            text-align: center;
        }
        
        .stat-item {
            flex: 1;
        }
        
        .stat-value {
            font-size: 24px;
            font-weight: bold;
            color: #3498db;
        }
        
        .stat-label {
            font-size: 12px;
            color: #666;
            margin-top: 4px;
        }
        
        .shortcuts-help {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #333;
            color: white;
            padding: 10px 15px;
            border-radius: 4px;
            font-size: 12px;
            cursor: pointer;
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <div class="header-content">
                <h1>任务管理器</h1>
                <div class="controls">
                    <button id="addTaskBtn">➕ 新建任务</button>
                    <button id="undoBtn" disabled>↶ 撤销</button>
                    <button id="redoBtn" disabled>↷ 重做</button>
                </div>
            </div>
            <div class="search-box">
                <input type="text" id="searchInput" placeholder="搜索任务...">
            </div>
        </header>
        
        <div class="stats">
            <div class="stat-item">
                <div class="stat-value" id="totalTasks">0</div>
                <div class="stat-label">总任务</div>
            </div>
            <div class="stat-item">
                <div class="stat-value" id="completedTasks">0</div>
                <div class="stat-label">已完成</div>
            </div>
            <div class="stat-item">
                <div class="stat-value" id="pendingTasks">0</div>
                <div class="stat-label">待完成</div>
            </div>
        </div>
        
        <div class="task-filters">
            <button class="filter-btn active" data-filter="all">全部</button>
            <button class="filter-btn" data-filter="pending">待完成</button>
            <button class="filter-btn" data-filter="completed">已完成</button>
            <button class="filter-btn" data-filter="high">高优先级</button>
            <button class="filter-btn" data-filter="today">今日到期</button>
        </div>
        
        <div class="task-list" id="taskList">
            <div class="empty-state">
                <p>暂无任务</p>
                <p>点击"新建任务"开始添加</p>
            </div>
        </div>
    </div>
    
    <!-- 任务编辑模态框 -->
    <div class="modal" id="taskModal">
        <div class="modal-content">
            <h2 id="modalTitle">新建任务</h2>
            <form id="taskForm">
                <div class="form-group">
                    <label for="taskTitle">标题 *</label>
                    <input type="text" id="taskTitle" required>
                </div>
                <div class="form-group">
                    <label for="taskDescription">描述</label>
                    <textarea id="taskDescription"></textarea>
                </div>
                <div class="form-group">
                    <label for="taskPriority">优先级</label>
                    <select id="taskPriority">
                        <option value="low">低</option>
                        <option value="medium" selected>中</option>
                        <option value="high">高</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="taskDueDate">截止日期</label>
                    <input type="date" id="taskDueDate">
                </div>
                <div class="form-group">
                    <label for="taskCategory">分类</label>
                    <input type="text" id="taskCategory" placeholder="工作、个人、学习...">
                </div>
                <div class="form-actions">
                    <button type="button" id="cancelBtn">取消</button>
                    <button type="submit">保存</button>
                </div>
            </form>
        </div>
    </div>
    
    <!-- 右键菜单 -->
    <div class="context-menu" id="contextMenu">
        <div class="context-menu-item" data-action="edit">编辑</div>
        <div class="context-menu-item" data-action="duplicate">复制</div>
        <div class="context-menu-item" data-action="priority-high">设为高优先级</div>
        <div class="context-menu-item" data-action="priority-medium">设为中优先级</div>
        <div class="context-menu-item" data-action="priority-low">设为低优先级</div>
        <div class="context-menu-item" data-action="delete">删除</div>
    </div>
    
    <div class="shortcuts-help">
        按 ? 查看快捷键
    </div>

    <script>
        // TODO: 实现任务管理器
        
        // 1. 数据模型
        class Task {
            constructor(data) {
                this.id = data.id || Date.now().toString();
                this.title = data.title;
                this.description = data.description || '';
                this.priority = data.priority || 'medium';
                this.dueDate = data.dueDate || null;
                this.category = data.category || '';
                this.completed = data.completed || false;
                this.createdAt = data.createdAt || new Date().toISOString();
                this.updatedAt = data.updatedAt || new Date().toISOString();
            }
        }
        
        // 2. 任务管理器类
        class TaskManager {
            constructor() {
                this.tasks = [];
                this.currentFilter = 'all';
                this.searchQuery = '';
                this.init();
            }
            
            init() {
                // 从localStorage加载任务
                // 初始化事件监听
                // 渲染初始界面
            }
            
            addTask(taskData) {
                // 添加新任务
                // 触发UI更新
                // 保存到localStorage
            }
            
            updateTask(id, updates) {
                // 更新任务
                // 触发UI更新
                // 保存到localStorage
            }
            
            deleteTask(id) {
                // 删除任务
                // 触发UI更新
                // 保存到localStorage
            }
            
            toggleTask(id) {
                // 切换任务完成状态
            }
            
            filterTasks(filter) {
                // 过滤任务
            }
            
            searchTasks(query) {
                // 搜索任务
            }
            
            sortTasks(sortBy) {
                // 排序任务
            }
        }
        
        // 3. UI控制器
        class UIController {
            constructor(taskManager) {
                this.taskManager = taskManager;
                this.initEventListeners();
            }
            
            initEventListeners() {
                // 绑定所有事件
            }
            
            renderTasks(tasks) {
                // 渲染任务列表
            }
            
            renderTaskItem(task) {
                // 渲染单个任务
            }
            
            updateStats() {
                // 更新统计信息
            }
        }
        
        // 4. 拖拽控制器
        class DragDropController {
            constructor(container) {
                this.container = container;
                this.init();
            }
            
            init() {
                // 初始化拖拽事件
            }
        }
        
        // 5. 撤销/重做管理器
        class UndoRedoManager {
            constructor(maxHistory = 10) {
                this.history = [];
                this.currentIndex = -1;
                this.maxHistory = maxHistory;
            }
            
            execute(command) {
                // 执行命令并添加到历史
            }
            
            undo() {
                // 撤销操作
            }
            
            redo() {
                // 重做操作
            }
        }
        
        // 6. 快捷键管理器
        class ShortcutManager {
            constructor() {
                this.shortcuts = new Map();
                this.init();
            }
            
            init() {
                // 注册快捷键
            }
            
            register(key, handler) {
                // 注册快捷键处理器
            }
        }
        
        // 初始化应用
        const app = new TaskManager();
    </script>
</body>
</html>
```

## 🎨 期望效果

1. **流畅的交互体验**
   - 所有操作都有即时反馈
   - 动画过渡平滑自然
   - 拖拽操作响应灵敏

2. **完整的功能实现**
   - CRUD操作完整可靠
   - 撤销/重做功能正常
   - 数据持久化稳定

3. **优秀的用户体验**
   - 界面简洁直观
   - 操作逻辑清晰
   - 错误处理友好

4. **高性能表现**
   - 大量任务下依然流畅
   - 内存使用合理
   - 响应时间快速

## 💡 实现提示

### 事件委托示例
```javascript
taskList.addEventListener('click', (event) => {
    const taskItem = event.target.closest('.task-item');
    if (!taskItem) return;
    
    if (event.target.matches('.task-checkbox')) {
        toggleTask(taskItem.dataset.id);
    } else if (event.target.matches('.edit-btn')) {
        editTask(taskItem.dataset.id);
    } else if (event.target.matches('.delete-btn')) {
        deleteTask(taskItem.dataset.id);
    }
});
```

### 拖拽实现
```javascript
let draggedElement = null;

taskItem.addEventListener('dragstart', (e) => {
    draggedElement = e.target;
    e.target.classList.add('dragging');
});

taskItem.addEventListener('dragend', (e) => {
    e.target.classList.remove('dragging');
});

taskList.addEventListener('dragover', (e) => {
    e.preventDefault();
    const afterElement = getDragAfterElement(taskList, e.clientY);
    if (afterElement == null) {
        taskList.appendChild(draggedElement);
    } else {
        taskList.insertBefore(draggedElement, afterElement);
    }
});
```

### 命令模式
```javascript
class Command {
    execute() { throw new Error('必须实现execute方法'); }
    undo() { throw new Error('必须实现undo方法'); }
}

class AddTaskCommand extends Command {
    constructor(taskManager, task) {
        super();
        this.taskManager = taskManager;
        this.task = task;
    }
    
    execute() {
        this.taskManager.addTask(this.task);
    }
    
    undo() {
        this.taskManager.deleteTask(this.task.id);
    }
}
```

## 🚀 额外挑战

1. **高级搜索**
   - 支持多条件搜索
   - 搜索建议和自动完成
   - 搜索历史记录

2. **批量操作**
   - 多选模式
   - 批量编辑
   - 批量导入/导出

3. **数据可视化**
   - 任务完成趋势图
   - 分类统计图表
   - 时间分布图

4. **协作功能**
   - 任务分配
   - 评论系统
   - 实时同步（使用WebSocket）

5. **性能优化**
   - 虚拟滚动
   - Web Worker处理
   - IndexedDB存储

## 📚 参考资源

- [MDN - Drag and Drop API](https://developer.mozilla.org/zh-CN/docs/Web/API/HTML_Drag_and_Drop_API)
- [MDN - Keyboard Events](https://developer.mozilla.org/zh-CN/docs/Web/API/KeyboardEvent)
- [MDN - Context Menu](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Global_attributes/contextmenu)
- [MDN - LocalStorage](https://developer.mozilla.org/zh-CN/docs/Web/API/Window/localStorage)

记住：**优秀的交互应用不仅功能完整，更要注重用户体验的每一个细节！**