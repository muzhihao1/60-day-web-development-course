---
day: 16
exerciseTitle: "交互式任务管理器：DOM操作与事件处理实战"
approach: "使用MVC架构、事件委托、命令模式和性能优化技术构建功能完整的任务管理器"
files:
  - path: "task-manager.html"
    language: "html"
    description: "完整的任务管理器实现，包含所有高级交互功能"
keyTakeaways:
  - "事件委托能显著减少内存占用并简化动态元素的事件处理"
  - "命令模式是实现撤销/重做功能的最佳选择"
  - "使用DocumentFragment和批量操作可以大幅提升DOM操作性能"
  - "拖拽API配合适当的视觉反馈能创造流畅的用户体验"
  - "合理的架构设计让代码更易维护和扩展"
commonMistakes:
  - "在循环中直接操作DOM导致性能问题"
  - "没有正确清理事件监听器导致内存泄漏"
  - "拖拽时没有处理边界情况"
  - "撤销/重做没有考虑数据一致性"
  - "过度使用全局变量影响代码可维护性"
extensions:
  - title: "添加任务分组功能"
    description: "按项目或标签组织任务，支持折叠/展开"
  - title: "实现任务依赖关系"
    description: "设置任务之间的依赖，自动调整顺序"
  - title: "添加时间追踪"
    description: "记录任务耗时，生成时间报告"
---

# 解决方案：交互式任务管理器

## 实现思路

这个解决方案展示了如何构建一个生产级的任务管理应用，综合运用了：
1. **MVC架构**：清晰的职责分离，便于维护和测试
2. **事件委托**：高效处理动态元素的事件
3. **命令模式**：优雅实现撤销/重做功能
4. **拖拽排序**：流畅的交互体验
5. **性能优化**：批量DOM操作和防抖节流

## 完整实现

### task-manager.html

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>交互式任务管理器 - 完整解决方案</title>
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
            line-height: 1.6;
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
            margin-bottom: 15px;
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
            transition: all 0.3s;
            display: inline-flex;
            align-items: center;
            gap: 5px;
        }
        
        button:hover:not(:disabled) {
            background: #2980b9;
            transform: translateY(-1px);
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        button:active:not(:disabled) {
            transform: translateY(0);
            box-shadow: none;
        }
        
        button:disabled {
            background: #bdc3c7;
            cursor: not-allowed;
            opacity: 0.6;
        }
        
        button.secondary {
            background: #95a5a6;
        }
        
        button.secondary:hover:not(:disabled) {
            background: #7f8c8d;
        }
        
        button.danger {
            background: #e74c3c;
        }
        
        button.danger:hover:not(:disabled) {
            background: #c0392b;
        }
        
        .search-box {
            position: relative;
            width: 100%;
        }
        
        .search-box input {
            width: 100%;
            padding: 10px 12px 10px 40px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 14px;
            transition: border-color 0.3s;
        }
        
        .search-box input:focus {
            outline: none;
            border-color: #3498db;
        }
        
        .search-icon {
            position: absolute;
            left: 12px;
            top: 50%;
            transform: translateY(-50%);
            color: #7f8c8d;
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
            align-items: center;
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
        
        .filter-btn:hover {
            border-color: #3498db;
        }
        
        .filter-btn.active {
            background: #3498db;
            color: white;
            border-color: #3498db;
        }
        
        .sort-select {
            margin-left: auto;
            padding: 6px 12px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 12px;
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
            align-items: flex-start;
            gap: 12px;
            position: relative;
        }
        
        .task-item:hover {
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            transform: translateY(-2px);
        }
        
        .task-item.dragging {
            opacity: 0.5;
            cursor: grabbing;
            transform: rotate(2deg);
        }
        
        .task-item.drag-over {
            border-color: #3498db;
            background: #f0f8ff;
        }
        
        .task-item.completed {
            opacity: 0.7;
            background: #f8f9fa;
        }
        
        .task-item.completed .task-title {
            text-decoration: line-through;
            color: #7f8c8d;
        }
        
        .task-checkbox {
            width: 20px;
            height: 20px;
            cursor: pointer;
            flex-shrink: 0;
            margin-top: 2px;
        }
        
        .task-content {
            flex: 1;
        }
        
        .task-title {
            font-weight: 500;
            margin-bottom: 4px;
            word-break: break-word;
        }
        
        .task-description {
            font-size: 13px;
            color: #666;
            margin-bottom: 8px;
            line-height: 1.4;
        }
        
        .task-meta {
            font-size: 12px;
            color: #666;
            display: flex;
            gap: 15px;
            flex-wrap: wrap;
        }
        
        .task-meta-item {
            display: flex;
            align-items: center;
            gap: 4px;
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
            opacity: 0;
            transition: opacity 0.3s;
        }
        
        .task-item:hover .task-actions {
            opacity: 1;
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
            border-color: #bbb;
        }
        
        .empty-state {
            text-align: center;
            padding: 60px 20px;
            color: #999;
        }
        
        .empty-state-icon {
            font-size: 48px;
            margin-bottom: 10px;
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
        
        .modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            z-index: 1000;
            animation: fadeIn 0.3s;
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
            animation: slideUp 0.3s;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        @keyframes slideUp {
            from {
                transform: translateY(20px);
                opacity: 0;
            }
            to {
                transform: translateY(0);
                opacity: 1;
            }
        }
        
        .modal-header {
            margin-bottom: 20px;
        }
        
        .modal-header h2 {
            font-size: 20px;
            color: #2c3e50;
        }
        
        .form-group {
            margin-bottom: 15px;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 5px;
            font-weight: 500;
            font-size: 14px;
        }
        
        .form-group input,
        .form-group textarea,
        .form-group select {
            width: 100%;
            padding: 8px 12px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 14px;
            transition: border-color 0.3s;
        }
        
        .form-group input:focus,
        .form-group textarea:focus,
        .form-group select:focus {
            outline: none;
            border-color: #3498db;
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
            padding: 5px 0;
        }
        
        .context-menu.active {
            display: block;
        }
        
        .context-menu-item {
            padding: 8px 16px;
            cursor: pointer;
            font-size: 14px;
            transition: background 0.3s;
        }
        
        .context-menu-item:hover {
            background: #f5f5f5;
        }
        
        .context-menu-separator {
            height: 1px;
            background: #e0e0e0;
            margin: 5px 0;
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
            transition: background 0.3s;
        }
        
        .shortcuts-help:hover {
            background: #555;
        }
        
        .shortcuts-modal {
            background: white;
            padding: 20px;
            border-radius: 8px;
            max-width: 400px;
            color: #333;
        }
        
        .shortcuts-modal h3 {
            margin-bottom: 15px;
            color: #2c3e50;
        }
        
        .shortcut-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            font-size: 14px;
        }
        
        .shortcut-key {
            background: #f0f0f0;
            padding: 2px 8px;
            border-radius: 4px;
            font-family: monospace;
        }
        
        .toast {
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #333;
            color: white;
            padding: 12px 24px;
            border-radius: 4px;
            font-size: 14px;
            z-index: 2000;
            display: none;
            animation: slideUpToast 0.3s;
        }
        
        .toast.active {
            display: block;
        }
        
        @keyframes slideUpToast {
            from {
                transform: translateX(-50%) translateY(20px);
                opacity: 0;
            }
            to {
                transform: translateX(-50%) translateY(0);
                opacity: 1;
            }
        }
        
        @media (max-width: 600px) {
            .header-content {
                flex-direction: column;
                align-items: stretch;
            }
            
            .controls {
                width: 100%;
                justify-content: space-between;
            }
            
            .task-filters {
                justify-content: center;
            }
            
            .sort-select {
                margin-left: 0;
                margin-top: 10px;
                width: 100%;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <div class="header-content">
                <h1>📋 任务管理器</h1>
                <div class="controls">
                    <button id="addTaskBtn">➕ 新建任务</button>
                    <button id="undoBtn" class="secondary" disabled>↶ 撤销</button>
                    <button id="redoBtn" class="secondary" disabled>↷ 重做</button>
                </div>
            </div>
            <div class="search-box">
                <span class="search-icon">🔍</span>
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
            <select class="sort-select" id="sortSelect">
                <option value="created">按创建时间</option>
                <option value="dueDate">按截止日期</option>
                <option value="priority">按优先级</option>
                <option value="title">按标题</option>
            </select>
        </div>
        
        <div class="task-list" id="taskList">
            <div class="empty-state">
                <div class="empty-state-icon">📝</div>
                <p>暂无任务</p>
                <p>点击"新建任务"开始添加</p>
            </div>
        </div>
    </div>
    
    <!-- 任务编辑模态框 -->
    <div class="modal" id="taskModal">
        <div class="modal-content">
            <div class="modal-header">
                <h2 id="modalTitle">新建任务</h2>
            </div>
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
                    <button type="button" class="secondary" id="cancelBtn">取消</button>
                    <button type="submit">保存</button>
                </div>
            </form>
        </div>
    </div>
    
    <!-- 右键菜单 -->
    <div class="context-menu" id="contextMenu">
        <div class="context-menu-item" data-action="edit">✏️ 编辑</div>
        <div class="context-menu-item" data-action="duplicate">📋 复制</div>
        <div class="context-menu-separator"></div>
        <div class="context-menu-item" data-action="priority-high">🔴 设为高优先级</div>
        <div class="context-menu-item" data-action="priority-medium">🟡 设为中优先级</div>
        <div class="context-menu-item" data-action="priority-low">🟢 设为低优先级</div>
        <div class="context-menu-separator"></div>
        <div class="context-menu-item" data-action="delete">🗑️ 删除</div>
    </div>
    
    <!-- 快捷键帮助 -->
    <div class="shortcuts-help" id="shortcutsHelp">
        按 ? 查看快捷键
    </div>
    
    <!-- 快捷键模态框 -->
    <div class="modal" id="shortcutsModal">
        <div class="shortcuts-modal">
            <h3>键盘快捷键</h3>
            <div class="shortcut-item">
                <span>新建任务</span>
                <span class="shortcut-key">Ctrl/Cmd + N</span>
            </div>
            <div class="shortcut-item">
                <span>删除选中任务</span>
                <span class="shortcut-key">Delete</span>
            </div>
            <div class="shortcut-item">
                <span>撤销</span>
                <span class="shortcut-key">Ctrl/Cmd + Z</span>
            </div>
            <div class="shortcut-item">
                <span>重做</span>
                <span class="shortcut-key">Ctrl/Cmd + Y</span>
            </div>
            <div class="shortcut-item">
                <span>搜索</span>
                <span class="shortcut-key">Ctrl/Cmd + F</span>
            </div>
            <div class="shortcut-item">
                <span>全选</span>
                <span class="shortcut-key">Ctrl/Cmd + A</span>
            </div>
            <div class="shortcut-item">
                <span>取消/关闭</span>
                <span class="shortcut-key">Esc</span>
            </div>
            <div class="shortcut-item">
                <span>显示快捷键</span>
                <span class="shortcut-key">?</span>
            </div>
        </div>
    </div>
    
    <!-- Toast 提示 -->
    <div class="toast" id="toast"></div>

    <script>
        // ============================================
        // 1. 数据模型
        // ============================================
        
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
                this.order = data.order || 0;
            }
            
            update(updates) {
                Object.assign(this, updates);
                this.updatedAt = new Date().toISOString();
                return this;
            }
            
            clone() {
                return new Task({
                    ...this,
                    id: Date.now().toString(),
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                });
            }
        }
        
        // ============================================
        // 2. 命令模式 - 撤销/重做
        // ============================================
        
        class Command {
            execute() {
                throw new Error('必须实现execute方法');
            }
            
            undo() {
                throw new Error('必须实现undo方法');
            }
        }
        
        class AddTaskCommand extends Command {
            constructor(taskManager, task) {
                super();
                this.taskManager = taskManager;
                this.task = task;
            }
            
            execute() {
                this.taskManager.addTaskDirect(this.task);
            }
            
            undo() {
                this.taskManager.removeTaskDirect(this.task.id);
            }
        }
        
        class RemoveTaskCommand extends Command {
            constructor(taskManager, task) {
                super();
                this.taskManager = taskManager;
                this.task = task;
            }
            
            execute() {
                this.taskManager.removeTaskDirect(this.task.id);
            }
            
            undo() {
                this.taskManager.addTaskDirect(this.task);
            }
        }
        
        class UpdateTaskCommand extends Command {
            constructor(taskManager, taskId, oldData, newData) {
                super();
                this.taskManager = taskManager;
                this.taskId = taskId;
                this.oldData = oldData;
                this.newData = newData;
            }
            
            execute() {
                this.taskManager.updateTaskDirect(this.taskId, this.newData);
            }
            
            undo() {
                this.taskManager.updateTaskDirect(this.taskId, this.oldData);
            }
        }
        
        class ReorderTasksCommand extends Command {
            constructor(taskManager, oldOrder, newOrder) {
                super();
                this.taskManager = taskManager;
                this.oldOrder = oldOrder;
                this.newOrder = newOrder;
            }
            
            execute() {
                this.taskManager.setTaskOrder(this.newOrder);
            }
            
            undo() {
                this.taskManager.setTaskOrder(this.oldOrder);
            }
        }
        
        // ============================================
        // 3. 撤销/重做管理器
        // ============================================
        
        class UndoRedoManager {
            constructor(maxHistory = 20) {
                this.history = [];
                this.currentIndex = -1;
                this.maxHistory = maxHistory;
            }
            
            execute(command) {
                // 删除当前索引之后的所有历史
                this.history = this.history.slice(0, this.currentIndex + 1);
                
                // 执行命令
                command.execute();
                
                // 添加到历史
                this.history.push(command);
                
                // 限制历史长度
                if (this.history.length > this.maxHistory) {
                    this.history.shift();
                } else {
                    this.currentIndex++;
                }
                
                this.updateButtons();
            }
            
            undo() {
                if (this.canUndo()) {
                    const command = this.history[this.currentIndex];
                    command.undo();
                    this.currentIndex--;
                    this.updateButtons();
                    return true;
                }
                return false;
            }
            
            redo() {
                if (this.canRedo()) {
                    this.currentIndex++;
                    const command = this.history[this.currentIndex];
                    command.execute();
                    this.updateButtons();
                    return true;
                }
                return false;
            }
            
            canUndo() {
                return this.currentIndex >= 0;
            }
            
            canRedo() {
                return this.currentIndex < this.history.length - 1;
            }
            
            updateButtons() {
                document.getElementById('undoBtn').disabled = !this.canUndo();
                document.getElementById('redoBtn').disabled = !this.canRedo();
            }
            
            clear() {
                this.history = [];
                this.currentIndex = -1;
                this.updateButtons();
            }
        }
        
        // ============================================
        // 4. 任务管理器
        // ============================================
        
        class TaskManager {
            constructor() {
                this.tasks = [];
                this.listeners = [];
                this.undoRedoManager = new UndoRedoManager();
                this.loadFromStorage();
            }
            
            // 直接操作方法（不记录历史）
            addTaskDirect(task) {
                this.tasks.push(task);
                this.saveToStorage();
                this.notifyListeners('add', task);
            }
            
            removeTaskDirect(taskId) {
                const index = this.tasks.findIndex(t => t.id === taskId);
                if (index !== -1) {
                    const task = this.tasks[index];
                    this.tasks.splice(index, 1);
                    this.saveToStorage();
                    this.notifyListeners('remove', task);
                }
            }
            
            updateTaskDirect(taskId, updates) {
                const task = this.tasks.find(t => t.id === taskId);
                if (task) {
                    task.update(updates);
                    this.saveToStorage();
                    this.notifyListeners('update', task);
                }
            }
            
            // 带历史记录的操作方法
            addTask(taskData) {
                const task = new Task(taskData);
                const command = new AddTaskCommand(this, task);
                this.undoRedoManager.execute(command);
                return task;
            }
            
            removeTask(taskId) {
                const task = this.tasks.find(t => t.id === taskId);
                if (task) {
                    const command = new RemoveTaskCommand(this, task);
                    this.undoRedoManager.execute(command);
                }
            }
            
            updateTask(taskId, updates) {
                const task = this.tasks.find(t => t.id === taskId);
                if (task) {
                    const oldData = { ...task };
                    const command = new UpdateTaskCommand(this, taskId, oldData, updates);
                    this.undoRedoManager.execute(command);
                }
            }
            
            toggleTask(taskId) {
                const task = this.tasks.find(t => t.id === taskId);
                if (task) {
                    this.updateTask(taskId, { completed: !task.completed });
                }
            }
            
            reorderTasks(newOrder) {
                const oldOrder = this.tasks.map(t => t.id);
                const command = new ReorderTasksCommand(this, oldOrder, newOrder);
                this.undoRedoManager.execute(command);
            }
            
            setTaskOrder(taskIds) {
                const taskMap = new Map(this.tasks.map(t => [t.id, t]));
                this.tasks = taskIds.map(id => taskMap.get(id)).filter(Boolean);
                this.saveToStorage();
                this.notifyListeners('reorder', this.tasks);
            }
            
            getTasks(filter = 'all', searchQuery = '') {
                let filtered = this.tasks;
                
                // 应用过滤器
                switch (filter) {
                    case 'pending':
                        filtered = filtered.filter(t => !t.completed);
                        break;
                    case 'completed':
                        filtered = filtered.filter(t => t.completed);
                        break;
                    case 'high':
                        filtered = filtered.filter(t => t.priority === 'high');
                        break;
                    case 'today':
                        const today = new Date().toDateString();
                        filtered = filtered.filter(t => {
                            return t.dueDate && new Date(t.dueDate).toDateString() === today;
                        });
                        break;
                }
                
                // 应用搜索
                if (searchQuery) {
                    const query = searchQuery.toLowerCase();
                    filtered = filtered.filter(t => 
                        t.title.toLowerCase().includes(query) ||
                        t.description.toLowerCase().includes(query) ||
                        t.category.toLowerCase().includes(query)
                    );
                }
                
                return filtered;
            }
            
            sortTasks(sortBy) {
                const sortFunctions = {
                    created: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
                    dueDate: (a, b) => {
                        if (!a.dueDate) return 1;
                        if (!b.dueDate) return -1;
                        return new Date(a.dueDate) - new Date(b.dueDate);
                    },
                    priority: (a, b) => {
                        const priorities = { high: 0, medium: 1, low: 2 };
                        return priorities[a.priority] - priorities[b.priority];
                    },
                    title: (a, b) => a.title.localeCompare(b.title)
                };
                
                if (sortFunctions[sortBy]) {
                    this.tasks.sort(sortFunctions[sortBy]);
                    this.saveToStorage();
                    this.notifyListeners('sort', this.tasks);
                }
            }
            
            duplicateTask(taskId) {
                const task = this.tasks.find(t => t.id === taskId);
                if (task) {
                    const clone = task.clone();
                    clone.title = `${task.title} (副本)`;
                    this.addTask(clone);
                    return clone;
                }
            }
            
            getStats() {
                const total = this.tasks.length;
                const completed = this.tasks.filter(t => t.completed).length;
                const pending = total - completed;
                return { total, completed, pending };
            }
            
            // 观察者模式
            addListener(listener) {
                this.listeners.push(listener);
            }
            
            notifyListeners(action, data) {
                this.listeners.forEach(listener => listener(action, data));
            }
            
            // 本地存储
            saveToStorage() {
                localStorage.setItem('tasks', JSON.stringify(this.tasks));
            }
            
            loadFromStorage() {
                const stored = localStorage.getItem('tasks');
                if (stored) {
                    try {
                        const data = JSON.parse(stored);
                        this.tasks = data.map(t => new Task(t));
                    } catch (e) {
                        console.error('加载任务失败:', e);
                        this.tasks = [];
                    }
                }
            }
            
            clearAllTasks() {
                if (confirm('确定要删除所有任务吗？此操作不可撤销。')) {
                    this.tasks = [];
                    this.saveToStorage();
                    this.undoRedoManager.clear();
                    this.notifyListeners('clear', null);
                }
            }
        }
        
        // ============================================
        // 5. UI控制器
        // ============================================
        
        class UIController {
            constructor(taskManager) {
                this.taskManager = taskManager;
                this.currentFilter = 'all';
                this.currentSort = 'created';
                this.searchQuery = '';
                this.selectedTaskId = null;
                this.draggedElement = null;
                
                this.initElements();
                this.initEventListeners();
                this.initDragDrop();
                this.initShortcuts();
                
                // 监听任务变化
                this.taskManager.addListener(this.handleTaskChange.bind(this));
                
                // 初始渲染
                this.render();
            }
            
            initElements() {
                this.elements = {
                    taskList: document.getElementById('taskList'),
                    searchInput: document.getElementById('searchInput'),
                    addTaskBtn: document.getElementById('addTaskBtn'),
                    undoBtn: document.getElementById('undoBtn'),
                    redoBtn: document.getElementById('redoBtn'),
                    taskModal: document.getElementById('taskModal'),
                    taskForm: document.getElementById('taskForm'),
                    cancelBtn: document.getElementById('cancelBtn'),
                    modalTitle: document.getElementById('modalTitle'),
                    contextMenu: document.getElementById('contextMenu'),
                    sortSelect: document.getElementById('sortSelect'),
                    filterBtns: document.querySelectorAll('.filter-btn'),
                    totalTasks: document.getElementById('totalTasks'),
                    completedTasks: document.getElementById('completedTasks'),
                    pendingTasks: document.getElementById('pendingTasks'),
                    shortcutsHelp: document.getElementById('shortcutsHelp'),
                    shortcutsModal: document.getElementById('shortcutsModal'),
                    toast: document.getElementById('toast')
                };
            }
            
            initEventListeners() {
                // 搜索
                this.elements.searchInput.addEventListener('input', 
                    this.debounce((e) => {
                        this.searchQuery = e.target.value;
                        this.render();
                    }, 300)
                );
                
                // 添加任务
                this.elements.addTaskBtn.addEventListener('click', () => {
                    this.showTaskModal();
                });
                
                // 撤销/重做
                this.elements.undoBtn.addEventListener('click', () => {
                    if (this.taskManager.undoRedoManager.undo()) {
                        this.showToast('已撤销');
                    }
                });
                
                this.elements.redoBtn.addEventListener('click', () => {
                    if (this.taskManager.undoRedoManager.redo()) {
                        this.showToast('已重做');
                    }
                });
                
                // 表单处理
                this.elements.taskForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.handleTaskSubmit();
                });
                
                this.elements.cancelBtn.addEventListener('click', () => {
                    this.hideTaskModal();
                });
                
                // 模态框背景点击关闭
                this.elements.taskModal.addEventListener('click', (e) => {
                    if (e.target === this.elements.taskModal) {
                        this.hideTaskModal();
                    }
                });
                
                this.elements.shortcutsModal.addEventListener('click', (e) => {
                    if (e.target === this.elements.shortcutsModal) {
                        this.hideShortcutsModal();
                    }
                });
                
                // 过滤器
                this.elements.filterBtns.forEach(btn => {
                    btn.addEventListener('click', () => {
                        this.currentFilter = btn.dataset.filter;
                        this.updateFilterButtons();
                        this.render();
                    });
                });
                
                // 排序
                this.elements.sortSelect.addEventListener('change', (e) => {
                    this.currentSort = e.target.value;
                    this.taskManager.sortTasks(this.currentSort);
                });
                
                // 任务列表事件委托
                this.elements.taskList.addEventListener('click', (e) => {
                    const taskItem = e.target.closest('.task-item');
                    if (!taskItem) return;
                    
                    const taskId = taskItem.dataset.taskId;
                    
                    if (e.target.matches('.task-checkbox')) {
                        this.taskManager.toggleTask(taskId);
                    } else if (e.target.matches('.edit-btn')) {
                        this.editTask(taskId);
                    } else if (e.target.matches('.delete-btn')) {
                        this.deleteTask(taskId);
                    } else {
                        this.selectTask(taskId);
                    }
                });
                
                // 右键菜单
                this.elements.taskList.addEventListener('contextmenu', (e) => {
                    const taskItem = e.target.closest('.task-item');
                    if (taskItem) {
                        e.preventDefault();
                        this.showContextMenu(e.pageX, e.pageY, taskItem.dataset.taskId);
                    }
                });
                
                // 隐藏右键菜单
                document.addEventListener('click', () => {
                    this.hideContextMenu();
                });
                
                // 右键菜单项点击
                this.elements.contextMenu.addEventListener('click', (e) => {
                    const action = e.target.dataset.action;
                    if (action && this.selectedTaskId) {
                        this.handleContextMenuAction(action);
                    }
                });
                
                // 快捷键帮助
                this.elements.shortcutsHelp.addEventListener('click', () => {
                    this.showShortcutsModal();
                });
            }
            
            initDragDrop() {
                this.elements.taskList.addEventListener('dragstart', (e) => {
                    const taskItem = e.target.closest('.task-item');
                    if (!taskItem) return;
                    
                    this.draggedElement = taskItem;
                    taskItem.classList.add('dragging');
                    e.dataTransfer.effectAllowed = 'move';
                });
                
                this.elements.taskList.addEventListener('dragend', (e) => {
                    if (this.draggedElement) {
                        this.draggedElement.classList.remove('dragging');
                        this.draggedElement = null;
                    }
                });
                
                this.elements.taskList.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                    
                    const afterElement = this.getDragAfterElement(e.clientY);
                    if (afterElement == null) {
                        this.elements.taskList.appendChild(this.draggedElement);
                    } else {
                        this.elements.taskList.insertBefore(this.draggedElement, afterElement);
                    }
                });
                
                this.elements.taskList.addEventListener('drop', (e) => {
                    e.preventDefault();
                    
                    // 获取新的顺序
                    const taskItems = [...this.elements.taskList.querySelectorAll('.task-item')];
                    const newOrder = taskItems.map(item => item.dataset.taskId);
                    
                    // 保存新顺序
                    this.taskManager.reorderTasks(newOrder);
                    this.showToast('任务顺序已更新');
                });
            }
            
            initShortcuts() {
                const shortcuts = new ShortcutManager();
                
                // Ctrl/Cmd + N：新建任务
                shortcuts.register('n', (e) => {
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.showTaskModal();
                    }
                });
                
                // Delete：删除选中任务
                shortcuts.register('Delete', () => {
                    if (this.selectedTaskId) {
                        this.deleteTask(this.selectedTaskId);
                    }
                });
                
                // Ctrl/Cmd + Z：撤销
                shortcuts.register('z', (e) => {
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.elements.undoBtn.click();
                    }
                });
                
                // Ctrl/Cmd + Y：重做
                shortcuts.register('y', (e) => {
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.elements.redoBtn.click();
                    }
                });
                
                // Ctrl/Cmd + F：搜索
                shortcuts.register('f', (e) => {
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.elements.searchInput.focus();
                    }
                });
                
                // Esc：取消
                shortcuts.register('Escape', () => {
                    if (this.elements.taskModal.classList.contains('active')) {
                        this.hideTaskModal();
                    } else if (this.elements.shortcutsModal.classList.contains('active')) {
                        this.hideShortcutsModal();
                    } else if (this.elements.contextMenu.classList.contains('active')) {
                        this.hideContextMenu();
                    }
                });
                
                // ?：显示快捷键
                shortcuts.register('?', () => {
                    this.showShortcutsModal();
                });
            }
            
            render() {
                const tasks = this.taskManager.getTasks(this.currentFilter, this.searchQuery);
                this.renderTasks(tasks);
                this.updateStats();
            }
            
            renderTasks(tasks) {
                if (tasks.length === 0) {
                    this.elements.taskList.innerHTML = `
                        <div class="empty-state">
                            <div class="empty-state-icon">📝</div>
                            <p>${this.searchQuery ? '没有找到匹配的任务' : '暂无任务'}</p>
                            <p>${this.searchQuery ? '尝试其他搜索词' : '点击"新建任务"开始添加'}</p>
                        </div>
                    `;
                    return;
                }
                
                // 使用DocumentFragment批量渲染
                const fragment = document.createDocumentFragment();
                
                tasks.forEach(task => {
                    const taskElement = this.createTaskElement(task);
                    fragment.appendChild(taskElement);
                });
                
                this.elements.taskList.innerHTML = '';
                this.elements.taskList.appendChild(fragment);
            }
            
            createTaskElement(task) {
                const div = document.createElement('div');
                div.className = `task-item ${task.completed ? 'completed' : ''}`;
                div.dataset.taskId = task.id;
                div.draggable = true;
                
                const priorityClass = `priority-${task.priority}`;
                const dueDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '';
                
                div.innerHTML = `
                    <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                    <div class="task-content">
                        <div class="task-title">${this.escapeHtml(task.title)}</div>
                        ${task.description ? `<div class="task-description">${this.escapeHtml(task.description)}</div>` : ''}
                        <div class="task-meta">
                            <span class="task-meta-item">
                                <span class="task-priority ${priorityClass}">
                                    ${this.getPriorityLabel(task.priority)}
                                </span>
                            </span>
                            ${dueDate ? `<span class="task-meta-item">📅 ${dueDate}</span>` : ''}
                            ${task.category ? `<span class="task-meta-item">🏷️ ${this.escapeHtml(task.category)}</span>` : ''}
                        </div>
                    </div>
                    <div class="task-actions">
                        <button class="edit-btn">编辑</button>
                        <button class="delete-btn">删除</button>
                    </div>
                `;
                
                return div;
            }
            
            showTaskModal(task = null) {
                this.elements.taskModal.classList.add('active');
                this.elements.modalTitle.textContent = task ? '编辑任务' : '新建任务';
                
                if (task) {
                    document.getElementById('taskTitle').value = task.title;
                    document.getElementById('taskDescription').value = task.description;
                    document.getElementById('taskPriority').value = task.priority;
                    document.getElementById('taskDueDate').value = task.dueDate || '';
                    document.getElementById('taskCategory').value = task.category;
                    this.editingTaskId = task.id;
                } else {
                    this.elements.taskForm.reset();
                    this.editingTaskId = null;
                }
                
                // 聚焦到标题输入框
                setTimeout(() => {
                    document.getElementById('taskTitle').focus();
                }, 100);
            }
            
            hideTaskModal() {
                this.elements.taskModal.classList.remove('active');
                this.editingTaskId = null;
            }
            
            handleTaskSubmit() {
                const formData = {
                    title: document.getElementById('taskTitle').value.trim(),
                    description: document.getElementById('taskDescription').value.trim(),
                    priority: document.getElementById('taskPriority').value,
                    dueDate: document.getElementById('taskDueDate').value,
                    category: document.getElementById('taskCategory').value.trim()
                };
                
                if (!formData.title) {
                    this.showToast('请输入任务标题', 'error');
                    return;
                }
                
                if (this.editingTaskId) {
                    this.taskManager.updateTask(this.editingTaskId, formData);
                    this.showToast('任务已更新');
                } else {
                    this.taskManager.addTask(formData);
                    this.showToast('任务已添加');
                }
                
                this.hideTaskModal();
            }
            
            editTask(taskId) {
                const task = this.taskManager.tasks.find(t => t.id === taskId);
                if (task) {
                    this.showTaskModal(task);
                }
            }
            
            deleteTask(taskId) {
                if (confirm('确定要删除这个任务吗？')) {
                    this.taskManager.removeTask(taskId);
                    this.showToast('任务已删除');
                }
            }
            
            selectTask(taskId) {
                // 取消之前的选中
                document.querySelectorAll('.task-item').forEach(item => {
                    item.classList.remove('selected');
                });
                
                // 选中当前任务
                const taskItem = document.querySelector(`[data-task-id="${taskId}"]`);
                if (taskItem) {
                    taskItem.classList.add('selected');
                    this.selectedTaskId = taskId;
                }
            }
            
            showContextMenu(x, y, taskId) {
                this.selectedTaskId = taskId;
                this.elements.contextMenu.style.left = `${x}px`;
                this.elements.contextMenu.style.top = `${y}px`;
                this.elements.contextMenu.classList.add('active');
            }
            
            hideContextMenu() {
                this.elements.contextMenu.classList.remove('active');
            }
            
            handleContextMenuAction(action) {
                switch (action) {
                    case 'edit':
                        this.editTask(this.selectedTaskId);
                        break;
                    case 'duplicate':
                        this.taskManager.duplicateTask(this.selectedTaskId);
                        this.showToast('任务已复制');
                        break;
                    case 'priority-high':
                    case 'priority-medium':
                    case 'priority-low':
                        const priority = action.split('-')[1];
                        this.taskManager.updateTask(this.selectedTaskId, { priority });
                        this.showToast(`优先级已设为${this.getPriorityLabel(priority)}`);
                        break;
                    case 'delete':
                        this.deleteTask(this.selectedTaskId);
                        break;
                }
                this.hideContextMenu();
            }
            
            updateStats() {
                const stats = this.taskManager.getStats();
                this.elements.totalTasks.textContent = stats.total;
                this.elements.completedTasks.textContent = stats.completed;
                this.elements.pendingTasks.textContent = stats.pending;
            }
            
            updateFilterButtons() {
                this.elements.filterBtns.forEach(btn => {
                    btn.classList.toggle('active', btn.dataset.filter === this.currentFilter);
                });
            }
            
            showShortcutsModal() {
                this.elements.shortcutsModal.classList.add('active');
            }
            
            hideShortcutsModal() {
                this.elements.shortcutsModal.classList.remove('active');
            }
            
            showToast(message, type = 'success') {
                this.elements.toast.textContent = message;
                this.elements.toast.classList.add('active');
                
                setTimeout(() => {
                    this.elements.toast.classList.remove('active');
                }, 3000);
            }
            
            handleTaskChange(action, data) {
                this.render();
            }
            
            getDragAfterElement(y) {
                const draggableElements = [...this.elements.taskList.querySelectorAll('.task-item:not(.dragging)')];
                
                return draggableElements.reduce((closest, child) => {
                    const box = child.getBoundingClientRect();
                    const offset = y - box.top - box.height / 2;
                    
                    if (offset < 0 && offset > closest.offset) {
                        return { offset: offset, element: child };
                    } else {
                        return closest;
                    }
                }, { offset: Number.NEGATIVE_INFINITY }).element;
            }
            
            // 工具方法
            escapeHtml(text) {
                const div = document.createElement('div');
                div.textContent = text;
                return div.innerHTML;
            }
            
            getPriorityLabel(priority) {
                const labels = {
                    high: '高',
                    medium: '中',
                    low: '低'
                };
                return labels[priority] || priority;
            }
            
            debounce(func, wait) {
                let timeout;
                return function executedFunction(...args) {
                    const later = () => {
                        clearTimeout(timeout);
                        func(...args);
                    };
                    clearTimeout(timeout);
                    timeout = setTimeout(later, wait);
                };
            }
        }
        
        // ============================================
        // 6. 快捷键管理器
        // ============================================
        
        class ShortcutManager {
            constructor() {
                this.shortcuts = new Map();
                this.init();
            }
            
            init() {
                document.addEventListener('keydown', (e) => {
                    const key = e.key;
                    const handler = this.shortcuts.get(key);
                    
                    if (handler && !this.isInputFocused()) {
                        handler(e);
                    }
                });
            }
            
            register(key, handler) {
                this.shortcuts.set(key, handler);
            }
            
            isInputFocused() {
                const activeElement = document.activeElement;
                return activeElement.tagName === 'INPUT' || 
                       activeElement.tagName === 'TEXTAREA' ||
                       activeElement.tagName === 'SELECT';
            }
        }
        
        // ============================================
        // 7. 初始化应用
        // ============================================
        
        // 创建任务管理器实例
        const taskManager = new TaskManager();
        
        // 创建UI控制器
        const ui = new UIController(taskManager);
        
        // 添加一些示例任务（如果没有任务）
        if (taskManager.tasks.length === 0) {
            const sampleTasks = [
                {
                    title: '学习DOM操作',
                    description: '掌握现代DOM API和事件处理',
                    priority: 'high',
                    category: '学习',
                    dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0]
                },
                {
                    title: '完成任务管理器项目',
                    description: '实现所有功能：拖拽、撤销/重做、本地存储等',
                    priority: 'high',
                    category: '项目'
                },
                {
                    title: '优化应用性能',
                    description: '使用虚拟滚动和Web Workers处理大量数据',
                    priority: 'medium',
                    category: '优化'
                }
            ];
            
            sampleTasks.forEach(task => taskManager.addTask(task));
        }
        
        // 全局访问（用于调试）
        window.taskManager = taskManager;
        window.ui = ui;
        
        console.log('任务管理器已初始化！');
        console.log('可以使用 window.taskManager 和 window.ui 访问实例');
    </script>
</body>
</html>
```

## 关键实现细节

### 1. MVC架构设计

```javascript
// Model：任务数据管理
class TaskManager {
    // 负责数据的增删改查
    // 实现观察者模式通知UI更新
}

// View：UI渲染和交互
class UIController {
    // 负责DOM操作和事件处理
    // 监听Model变化并更新视图
}

// Controller：业务逻辑
// 命令模式实现撤销/重做
// 快捷键管理等
```

### 2. 事件委托优化

```javascript
// 一个监听器处理所有任务操作
taskList.addEventListener('click', (e) => {
    const taskItem = e.target.closest('.task-item');
    if (!taskItem) return;
    
    // 根据目标元素分发处理
    if (e.target.matches('.task-checkbox')) {
        toggleTask(taskItem.dataset.id);
    } else if (e.target.matches('.edit-btn')) {
        editTask(taskItem.dataset.id);
    }
    // ...
});
```

### 3. 拖拽排序实现

```javascript
// 计算拖拽后的位置
getDragAfterElement(y) {
    const elements = [...this.elements.taskList.querySelectorAll('.task-item:not(.dragging)')];
    
    return elements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}
```

### 4. 命令模式实现撤销/重做

```javascript
class Command {
    execute() { /* 执行操作 */ }
    undo() { /* 撤销操作 */ }
}

class UndoRedoManager {
    execute(command) {
        // 执行命令并记录历史
        command.execute();
        this.history.push(command);
    }
    
    undo() {
        // 撤销最近的命令
        const command = this.history[this.currentIndex];
        command.undo();
    }
}
```

### 5. 性能优化技巧

- **批量DOM操作**：使用DocumentFragment
- **防抖搜索**：避免频繁触发
- **事件委托**：减少事件监听器数量
- **本地存储**：避免数据丢失

## 扩展建议

1. **虚拟滚动**：处理数千个任务
2. **Web Workers**：后台处理复杂操作
3. **IndexedDB**：存储更多数据和附件
4. **PWA支持**：离线使用和安装
5. **数据同步**：云端备份和多设备同步

这个解决方案展示了如何构建一个功能完整、性能优秀的现代Web应用！