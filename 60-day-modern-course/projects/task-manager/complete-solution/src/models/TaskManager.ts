import { Task, TaskFilter, TaskSortOptions, TaskStatistics, TaskEvent, TaskEventType, TaskStatus, TaskPriority, PRIORITY_WEIGHT } from '../types';
import { TaskModel } from './Task';

/**
 * TaskManager类 - 管理所有任务的核心类
 */
export class TaskManager {
  private tasks: Map<string, TaskModel>;
  private listeners: Map<string, ((event: TaskEvent) => void)[]>;

  constructor() {
    this.tasks = new Map();
    this.listeners = new Map();
  }

  /**
   * 添加任务
   */
  addTask(task: TaskModel): void {
    const errors = task.validate();
    if (errors.length > 0) {
      throw new Error(`任务验证失败: ${errors.join(', ')}`);
    }

    this.tasks.set(task.id, task);
    this.emit('added', task);
  }

  /**
   * 获取任务
   */
  getTask(id: string): TaskModel | undefined {
    return this.tasks.get(id);
  }

  /**
   * 获取所有任务
   */
  getAllTasks(): TaskModel[] {
    return Array.from(this.tasks.values());
  }

  /**
   * 更新任务
   */
  updateTask(id: string, updates: Partial<Task>): boolean {
    const task = this.tasks.get(id);
    if (!task) return false;

    task.update(updates);
    const errors = task.validate();
    if (errors.length > 0) {
      throw new Error(`任务验证失败: ${errors.join(', ')}`);
    }

    this.emit('updated', task);
    return true;
  }

  /**
   * 删除任务
   */
  deleteTask(id: string): boolean {
    const task = this.tasks.get(id);
    if (!task) return false;

    this.tasks.delete(id);
    this.emit('deleted', task);
    return true;
  }

  /**
   * 批量删除任务
   */
  deleteTasks(ids: string[]): number {
    let deletedCount = 0;
    const deletedTasks: TaskModel[] = [];

    ids.forEach(id => {
      const task = this.tasks.get(id);
      if (task) {
        this.tasks.delete(id);
        deletedTasks.push(task);
        deletedCount++;
      }
    });

    if (deletedTasks.length > 0) {
      this.emit('bulk-updated', undefined, deletedTasks);
    }

    return deletedCount;
  }

  /**
   * 清空所有任务
   */
  clearAllTasks(): void {
    const allTasks = this.getAllTasks();
    this.tasks.clear();
    this.emit('bulk-updated', undefined, allTasks);
  }

  /**
   * 过滤任务
   */
  filterTasks(filter: TaskFilter): TaskModel[] {
    let tasks = this.getAllTasks();

    // 状态过滤
    if (filter.status && filter.status !== 'all') {
      tasks = tasks.filter(task => task.status === filter.status);
    }

    // 优先级过滤
    if (filter.priority && filter.priority !== 'all') {
      tasks = tasks.filter(task => task.priority === filter.priority);
    }

    // 标签过滤
    if (filter.tags && filter.tags.length > 0) {
      tasks = tasks.filter(task => 
        filter.tags!.some(tag => task.tags.includes(tag))
      );
    }

    // 搜索词过滤
    if (filter.searchTerm) {
      const searchLower = filter.searchTerm.toLowerCase();
      tasks = tasks.filter(task =>
        task.title.toLowerCase().includes(searchLower) ||
        (task.description && task.description.toLowerCase().includes(searchLower)) ||
        task.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // 日期范围过滤
    if (filter.dueDateFrom) {
      tasks = tasks.filter(task => 
        task.dueDate && task.dueDate >= filter.dueDateFrom!
      );
    }

    if (filter.dueDateTo) {
      tasks = tasks.filter(task => 
        task.dueDate && task.dueDate <= filter.dueDateTo!
      );
    }

    return tasks;
  }

  /**
   * 排序任务
   */
  sortTasks(tasks: TaskModel[], options: TaskSortOptions): TaskModel[] {
    const sorted = [...tasks];
    const direction = options.direction === 'asc' ? 1 : -1;

    sorted.sort((a, b) => {
      let comparison = 0;

      switch (options.field) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        
        case 'priority':
          comparison = PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority];
          break;
        
        case 'status':
          const statusOrder = { 
            [TaskStatus.PENDING]: 0, 
            [TaskStatus.IN_PROGRESS]: 1, 
            [TaskStatus.COMPLETED]: 2 
          };
          comparison = statusOrder[a.status] - statusOrder[b.status];
          break;
        
        case 'createdAt':
          comparison = a.createdAt.getTime() - b.createdAt.getTime();
          break;
        
        case 'dueDate':
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          comparison = a.dueDate.getTime() - b.dueDate.getTime();
          break;
      }

      return comparison * direction;
    });

    return sorted;
  }

  /**
   * 获取任务统计信息
   */
  getStatistics(): TaskStatistics {
    const tasks = this.getAllTasks();
    const now = new Date();

    const stats: TaskStatistics = {
      total: tasks.length,
      completed: 0,
      pending: 0,
      inProgress: 0,
      overdue: 0,
      byPriority: {
        [TaskPriority.LOW]: 0,
        [TaskPriority.MEDIUM]: 0,
        [TaskPriority.HIGH]: 0
      }
    };

    tasks.forEach(task => {
      // 状态统计
      switch (task.status) {
        case TaskStatus.COMPLETED:
          stats.completed++;
          break;
        case TaskStatus.PENDING:
          stats.pending++;
          break;
        case TaskStatus.IN_PROGRESS:
          stats.inProgress++;
          break;
      }

      // 优先级统计
      stats.byPriority[task.priority]++;

      // 过期统计
      if (task.isOverdue()) {
        stats.overdue++;
      }
    });

    return stats;
  }

  /**
   * 获取所有标签
   */
  getAllTags(): string[] {
    const tagsSet = new Set<string>();
    this.getAllTasks().forEach(task => {
      task.tags.forEach(tag => tagsSet.add(tag));
    });
    return Array.from(tagsSet).sort();
  }

  /**
   * 批量更新任务状态
   */
  batchUpdateStatus(ids: string[], status: TaskStatus): number {
    let updatedCount = 0;
    const updatedTasks: TaskModel[] = [];

    ids.forEach(id => {
      const task = this.tasks.get(id);
      if (task) {
        task.update({ status });
        updatedTasks.push(task);
        updatedCount++;
      }
    });

    if (updatedTasks.length > 0) {
      this.emit('bulk-updated', undefined, updatedTasks);
    }

    return updatedCount;
  }

  /**
   * 导入任务
   */
  importTasks(tasks: Task[]): number {
    let importedCount = 0;

    tasks.forEach(taskData => {
      try {
        const task = TaskModel.fromJSON(taskData);
        this.tasks.set(task.id, task);
        importedCount++;
      } catch (error) {
        console.error('导入任务失败:', error);
      }
    });

    if (importedCount > 0) {
      this.emit('bulk-updated', undefined, this.getAllTasks());
    }

    return importedCount;
  }

  /**
   * 导出任务
   */
  exportTasks(): Task[] {
    return this.getAllTasks().map(task => task.toJSON());
  }

  /**
   * 订阅事件
   */
  on(event: TaskEventType, listener: (event: TaskEvent) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    
    this.listeners.get(event)!.push(listener);

    // 返回取消订阅函数
    return () => {
      const listeners = this.listeners.get(event);
      if (listeners) {
        const index = listeners.indexOf(listener);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    };
  }

  /**
   * 触发事件
   */
  private emit(type: TaskEventType, task?: TaskModel, tasks?: TaskModel[]): void {
    const event: TaskEvent = {
      type,
      task: task?.toJSON(),
      tasks: tasks?.map(t => t.toJSON()),
      timestamp: new Date()
    };

    const listeners = this.listeners.get(type);
    if (listeners) {
      listeners.forEach(listener => listener(event));
    }
  }

  /**
   * 获取今日任务
   */
  getTodayTasks(): TaskModel[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.getAllTasks().filter(task => {
      if (!task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      return dueDate >= today && dueDate < tomorrow;
    });
  }

  /**
   * 获取本周任务
   */
  getWeekTasks(): TaskModel[] {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    weekStart.setHours(0, 0, 0, 0);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    return this.getAllTasks().filter(task => {
      if (!task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      return dueDate >= weekStart && dueDate < weekEnd;
    });
  }
}