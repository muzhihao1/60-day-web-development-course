# Task Manager Application

## 项目概述
构建一个功能完整的任务管理应用，使用TypeScript来提高代码质量和可维护性。这个项目将帮助你掌握TypeScript的核心概念和最佳实践。

## 项目目标
- 掌握TypeScript基础语法和类型系统
- 实现面向对象编程概念
- 使用接口和类型定义数据结构
- 实现本地存储功能
- 创建可重用的组件和模块

## 功能要求

### 核心功能
1. **任务管理**
   - 创建新任务
   - 编辑现有任务
   - 删除任务
   - 标记任务完成/未完成

2. **任务属性**
   - 标题（必需）
   - 描述（可选）
   - 优先级（高/中/低）
   - 截止日期
   - 标签/分类
   - 创建时间
   - 完成状态

3. **数据持久化**
   - 使用LocalStorage保存任务
   - 自动保存功能
   - 数据导入/导出功能

4. **用户界面**
   - 响应式设计
   - 任务列表视图
   - 任务详情视图
   - 筛选和排序功能

### 高级功能（可选）
- 任务搜索功能
- 任务统计仪表板
- 拖拽排序
- 批量操作
- 主题切换（深色/浅色）
- 任务提醒通知

## 技术要求
- TypeScript 5.0+
- 原生DOM操作（不使用框架）
- ES6+模块系统
- Webpack或Vite构建工具
- 严格的类型检查（tsconfig strict mode）
- 遵循TypeScript最佳实践

## 项目结构
```
task-manager/
├── src/
│   ├── types/          # TypeScript类型定义
│   │   ├── task.ts
│   │   └── index.ts
│   ├── models/         # 数据模型
│   │   ├── Task.ts
│   │   └── TaskManager.ts
│   ├── services/       # 服务层
│   │   ├── StorageService.ts
│   │   └── NotificationService.ts
│   ├── components/     # UI组件
│   │   ├── TaskList.ts
│   │   ├── TaskForm.ts
│   │   └── TaskItem.ts
│   ├── utils/          # 工具函数
│   │   ├── dateUtils.ts
│   │   └── domUtils.ts
│   ├── styles/         # 样式文件
│   │   └── main.css
│   └── main.ts         # 应用入口
├── public/
│   └── index.html
├── tsconfig.json
├── package.json
├── webpack.config.js
└── README.md
```

## TypeScript要求

### 必须使用的TypeScript特性
1. **接口（Interfaces）**
   ```typescript
   interface Task {
     id: string;
     title: string;
     description?: string;
     priority: Priority;
     dueDate?: Date;
     completed: boolean;
   }
   ```

2. **枚举（Enums）**
   ```typescript
   enum Priority {
     LOW = 'low',
     MEDIUM = 'medium',
     HIGH = 'high'
   }
   ```

3. **类（Classes）**
   ```typescript
   class TaskManager {
     private tasks: Task[];
     constructor() { }
     addTask(task: Task): void { }
   }
   ```

4. **泛型（Generics）**
   ```typescript
   function filterTasks<T extends Task>(
     tasks: T[], 
     predicate: (task: T) => boolean
   ): T[] { }
   ```

5. **类型守卫（Type Guards）**
   ```typescript
   function isValidTask(obj: any): obj is Task {
     return 'id' in obj && 'title' in obj;
   }
   ```

## 评分标准
请参考 `evaluation-criteria.md` 文件了解详细的评分标准。

## 开发步骤建议
1. 设置TypeScript开发环境
2. 定义数据类型和接口
3. 实现核心数据模型
4. 创建存储服务
5. 构建UI组件
6. 实现交互功能
7. 添加样式和响应式设计
8. 测试和优化

## 提交要求
1. 所有TypeScript代码必须通过严格模式检查
2. 不能有any类型（除非绝对必要并有注释说明）
3. 代码必须有适当的类型注解
4. 提供详细的README说明如何运行项目
5. 包含构建脚本和开发服务器配置

## 资源和参考
- [TypeScript官方文档](https://www.typescriptlang.org/docs/)
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)
- [TypeScript设计模式](https://www.patterns.dev/posts/classic-design-patterns/)
- [LocalStorage API](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)

## 截止日期
Day 24 结束前提交