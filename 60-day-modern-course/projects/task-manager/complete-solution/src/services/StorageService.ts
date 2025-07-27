import { Task, StorageData, UserPreferences, Theme, TaskPriority, TaskStatus } from '../types';

/**
 * 本地存储服务类
 * 负责处理所有与localStorage相关的操作
 */
export class StorageService {
  private static readonly STORAGE_KEY = 'taskManager_data';
  private static readonly PREFERENCES_KEY = 'taskManager_preferences';
  private static readonly VERSION = '1.0.0';

  /**
   * 保存任务数据到localStorage
   */
  static saveTasks(tasks: Task[]): boolean {
    try {
      const data: StorageData = {
        tasks: tasks,
        version: this.VERSION,
        lastSync: new Date()
      };

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('保存任务失败:', error);
      return false;
    }
  }

  /**
   * 从localStorage加载任务数据
   */
  static loadTasks(): Task[] {
    try {
      const dataStr = localStorage.getItem(this.STORAGE_KEY);
      if (!dataStr) return [];

      const data: StorageData = JSON.parse(dataStr);
      
      // 版本兼容性检查
      if (data.version !== this.VERSION) {
        console.warn(`存储版本不匹配: ${data.version} vs ${this.VERSION}`);
        // 这里可以添加数据迁移逻辑
      }

      // 转换日期字符串为Date对象
      return data.tasks.map(task => ({
        ...task,
        createdAt: new Date(task.createdAt),
        updatedAt: new Date(task.updatedAt),
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
        completedAt: task.completedAt ? new Date(task.completedAt) : undefined
      }));
    } catch (error) {
      console.error('加载任务失败:', error);
      return [];
    }
  }

  /**
   * 保存用户偏好设置
   */
  static savePreferences(preferences: UserPreferences): boolean {
    try {
      localStorage.setItem(this.PREFERENCES_KEY, JSON.stringify(preferences));
      return true;
    } catch (error) {
      console.error('保存偏好设置失败:', error);
      return false;
    }
  }

  /**
   * 加载用户偏好设置
   */
  static loadPreferences(): UserPreferences {
    try {
      const prefsStr = localStorage.getItem(this.PREFERENCES_KEY);
      if (!prefsStr) return this.getDefaultPreferences();

      return JSON.parse(prefsStr);
    } catch (error) {
      console.error('加载偏好设置失败:', error);
      return this.getDefaultPreferences();
    }
  }

  /**
   * 获取默认偏好设置
   */
  private static getDefaultPreferences(): UserPreferences {
    return {
      theme: 'light' as Theme,
      defaultPriority: TaskPriority.MEDIUM,
      defaultStatus: TaskStatus.PENDING,
      showCompletedTasks: true,
      enableNotifications: true,
      autoSave: true
    };
  }

  /**
   * 清除所有存储数据
   */
  static clearAll(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.PREFERENCES_KEY);
  }

  /**
   * 导出所有数据（用于备份）
   */
  static exportData(): string {
    const tasks = this.loadTasks();
    const preferences = this.loadPreferences();
    
    const exportData = {
      tasks,
      preferences,
      exportDate: new Date(),
      version: this.VERSION
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * 导入数据（从备份恢复）
   */
  static importData(jsonData: string): { success: boolean; message: string } {
    try {
      const data = JSON.parse(jsonData);
      
      if (!data.tasks || !Array.isArray(data.tasks)) {
        return { success: false, message: '无效的数据格式' };
      }

      // 保存任务
      const tasksSuccess = this.saveTasks(data.tasks);
      
      // 保存偏好设置（如果存在）
      if (data.preferences) {
        this.savePreferences(data.preferences);
      }

      return {
        success: tasksSuccess,
        message: tasksSuccess ? `成功导入 ${data.tasks.length} 个任务` : '导入失败'
      };
    } catch (error) {
      return {
        success: false,
        message: '解析数据失败，请检查文件格式'
      };
    }
  }

  /**
   * 获取存储使用情况
   */
  static getStorageInfo(): {
    used: number;
    available: number;
    percentage: number;
  } {
    let used = 0;
    let available = 5 * 1024 * 1024; // 假设5MB限制

    try {
      // 计算当前使用的存储空间
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          used += localStorage[key].length + key.length;
        }
      }

      return {
        used,
        available,
        percentage: (used / available) * 100
      };
    } catch (error) {
      return { used: 0, available, percentage: 0 };
    }
  }

  /**
   * 检查存储是否可用
   */
  static isStorageAvailable(): boolean {
    try {
      const testKey = '__localStorage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * 自动保存（带防抖）
   */
  private static autoSaveTimeout: NodeJS.Timeout | null = null;

  static autoSave(tasks: Task[], delay: number = 1000): void {
    if (this.autoSaveTimeout) {
      clearTimeout(this.autoSaveTimeout);
    }

    this.autoSaveTimeout = setTimeout(() => {
      this.saveTasks(tasks);
    }, delay);
  }
}