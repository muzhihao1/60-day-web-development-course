import { Task, TaskPriority, TaskStatus, NewTask, TaskUpdate } from '../types';
import { generateId } from '../utils/helpers';

/**
 * Task类 - 表示单个任务的模型
 */
export class TaskModel implements Task {
  id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: Date;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;

  constructor(data: NewTask) {
    this.id = generateId();
    this.title = data.title;
    this.description = data.description;
    this.priority = data.priority;
    this.status = data.status;
    this.dueDate = data.dueDate;
    this.tags = data.tags || [];
    this.createdAt = new Date();
    this.updatedAt = new Date();
    
    // 如果任务已完成，设置完成时间
    if (this.status === TaskStatus.COMPLETED) {
      this.completedAt = new Date();
    }
  }

  /**
   * 更新任务属性
   */
  update(updates: TaskUpdate): void {
    // 保存旧状态以检查是否需要更新completedAt
    const oldStatus = this.status;

    // 应用更新
    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined && key !== 'id' && key !== 'createdAt') {
        (this as any)[key] = value;
      }
    });

    // 更新updatedAt时间戳
    this.updatedAt = new Date();

    // 处理状态变更
    if (updates.status) {
      if (updates.status === TaskStatus.COMPLETED && oldStatus !== TaskStatus.COMPLETED) {
        this.completedAt = new Date();
      } else if (updates.status !== TaskStatus.COMPLETED) {
        this.completedAt = undefined;
      }
    }
  }

  /**
   * 检查任务是否过期
   */
  isOverdue(): boolean {
    if (!this.dueDate || this.status === TaskStatus.COMPLETED) {
      return false;
    }
    return new Date() > this.dueDate;
  }

  /**
   * 获取任务的剩余天数
   */
  getDaysUntilDue(): number | null {
    if (!this.dueDate) return null;
    
    const now = new Date();
    const due = new Date(this.dueDate);
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  }

  /**
   * 添加标签
   */
  addTag(tag: string): void {
    if (!this.tags.includes(tag)) {
      this.tags.push(tag);
      this.updatedAt = new Date();
    }
  }

  /**
   * 移除标签
   */
  removeTag(tag: string): void {
    const index = this.tags.indexOf(tag);
    if (index > -1) {
      this.tags.splice(index, 1);
      this.updatedAt = new Date();
    }
  }

  /**
   * 切换任务完成状态
   */
  toggleComplete(): void {
    if (this.status === TaskStatus.COMPLETED) {
      this.status = TaskStatus.PENDING;
      this.completedAt = undefined;
    } else {
      this.status = TaskStatus.COMPLETED;
      this.completedAt = new Date();
    }
    this.updatedAt = new Date();
  }

  /**
   * 验证任务数据
   */
  validate(): string[] {
    const errors: string[] = [];

    if (!this.title || this.title.trim().length === 0) {
      errors.push('任务标题不能为空');
    }

    if (this.title && this.title.length > 100) {
      errors.push('任务标题不能超过100个字符');
    }

    if (this.description && this.description.length > 500) {
      errors.push('任务描述不能超过500个字符');
    }

    if (this.dueDate && this.dueDate < new Date()) {
      errors.push('截止日期不能早于当前时间');
    }

    if (this.tags.length > 10) {
      errors.push('标签数量不能超过10个');
    }

    return errors;
  }

  /**
   * 克隆任务
   */
  clone(): TaskModel {
    const clonedData: NewTask = {
      title: `${this.title} (副本)`,
      description: this.description,
      priority: this.priority,
      status: TaskStatus.PENDING,
      dueDate: this.dueDate,
      tags: [...this.tags]
    };
    return new TaskModel(clonedData);
  }

  /**
   * 转换为普通对象
   */
  toJSON(): Task {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      priority: this.priority,
      status: this.status,
      dueDate: this.dueDate,
      tags: [...this.tags],
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      completedAt: this.completedAt
    };
  }

  /**
   * 从普通对象创建TaskModel实例
   */
  static fromJSON(data: Task): TaskModel {
    const task = new TaskModel({
      title: data.title,
      description: data.description,
      priority: data.priority,
      status: data.status,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      tags: data.tags
    });

    // 恢复原始的时间戳和ID
    task.id = data.id;
    task.createdAt = new Date(data.createdAt);
    task.updatedAt = new Date(data.updatedAt);
    task.completedAt = data.completedAt ? new Date(data.completedAt) : undefined;

    return task;
  }
}