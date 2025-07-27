import './styles/main.css';
import { Task, TaskPriority, TaskStatus } from './types';

// 应用入口点
class App {
  constructor() {
    this.init();
  }

  private init(): void {
    console.log('Task Manager Application Started');
    
    // TODO: 初始化应用
    // 1. 加载存储的任务
    // 2. 设置事件监听器
    // 3. 渲染初始UI
    
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // TODO: 设置表单提交事件
    const form = document.getElementById('task-form');
    if (form) {
      form.addEventListener('submit', this.handleFormSubmit.bind(this));
    }
  }

  private handleFormSubmit(event: Event): void {
    event.preventDefault();
    
    // TODO: 处理表单提交
    console.log('Form submitted');
  }
}

// 当DOM加载完成后启动应用
document.addEventListener('DOMContentLoaded', () => {
  new App();
});