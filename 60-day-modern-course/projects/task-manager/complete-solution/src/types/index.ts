/**
 * Task Manager Type Definitions
 * 定义应用中使用的所有TypeScript类型
 */

// 任务优先级枚举
export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

// 任务状态枚举
export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed'
}

// 任务接口定义
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

// 任务过滤器接口
export interface TaskFilter {
  status?: TaskStatus | 'all';
  priority?: TaskPriority | 'all';
  tags?: string[];
  searchTerm?: string;
  dueDateFrom?: Date;
  dueDateTo?: Date;
}

// 任务排序选项
export interface TaskSortOptions {
  field: 'createdAt' | 'dueDate' | 'priority' | 'title' | 'status';
  direction: 'asc' | 'desc';
}

// 用于创建新任务的类型
export type NewTask = Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completedAt'>;

// 用于更新任务的类型
export type TaskUpdate = Partial<Omit<Task, 'id' | 'createdAt'>>;

// 任务统计接口
export interface TaskStatistics {
  total: number;
  completed: number;
  pending: number;
  inProgress: number;
  overdue: number;
  byPriority: {
    [key in TaskPriority]: number;
  };
}

// 事件类型定义
export type TaskEventType = 'added' | 'updated' | 'deleted' | 'bulk-updated';

export interface TaskEvent {
  type: TaskEventType;
  task?: Task;
  tasks?: Task[];
  timestamp: Date;
}

// 存储数据结构
export interface StorageData {
  tasks: Task[];
  version: string;
  lastSync?: Date;
}

// 通知类型
export enum NotificationType {
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info'
}

// 通知接口
export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  duration?: number;
}

// 主题类型
export type Theme = 'light' | 'dark' | 'auto';

// 用户偏好设置
export interface UserPreferences {
  theme: Theme;
  defaultPriority: TaskPriority;
  defaultStatus: TaskStatus;
  showCompletedTasks: boolean;
  enableNotifications: boolean;
  autoSave: boolean;
}

// 验证错误
export interface ValidationError {
  field: string;
  message: string;
}

// 类型守卫函数
export function isTask(obj: any): obj is Task {
  return (
    obj &&
    typeof obj.id === 'string' &&
    typeof obj.title === 'string' &&
    Object.values(TaskPriority).includes(obj.priority) &&
    Object.values(TaskStatus).includes(obj.status) &&
    Array.isArray(obj.tags) &&
    obj.createdAt instanceof Date &&
    obj.updatedAt instanceof Date
  );
}

// 优先级权重映射（用于排序）
export const PRIORITY_WEIGHT: Record<TaskPriority, number> = {
  [TaskPriority.HIGH]: 3,
  [TaskPriority.MEDIUM]: 2,
  [TaskPriority.LOW]: 1
};

// 状态显示文本映射
export const STATUS_LABELS: Record<TaskStatus, string> = {
  [TaskStatus.PENDING]: '待处理',
  [TaskStatus.IN_PROGRESS]: '进行中',
  [TaskStatus.COMPLETED]: '已完成'
};

// 优先级显示文本映射
export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  [TaskPriority.HIGH]: '高',
  [TaskPriority.MEDIUM]: '中',
  [TaskPriority.LOW]: '低'
};