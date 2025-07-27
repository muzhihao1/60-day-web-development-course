// Task 相关类型定义

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed'
}

export interface Task {
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
}

export interface TaskFilter {
  status?: TaskStatus;
  priority?: TaskPriority;
  tag?: string;
  searchTerm?: string;
}

export interface TaskSortOptions {
  field: 'createdAt' | 'dueDate' | 'priority' | 'title';
  direction: 'asc' | 'desc';
}

// 用于创建新任务的类型（不包含自动生成的字段）
export type NewTask = Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completedAt'>;

// 用于更新任务的类型（所有字段都是可选的）
export type TaskUpdate = Partial<Omit<Task, 'id' | 'createdAt'>>;

// 事件类型定义
export interface TaskEvent {
  type: 'added' | 'updated' | 'deleted';
  task: Task;
}

// 存储相关类型
export interface StorageData {
  tasks: Task[];
  version: string;
}