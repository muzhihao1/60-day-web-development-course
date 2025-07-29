---
day: 32
title: "Redux和Redux Toolkit实战练习"
description: "通过构建任务管理系统和实时协作应用，深入掌握Redux Toolkit的现代开发方式"
difficulty: "advanced"
estimatedTime: 300
requirements:
  - "使用Redux Toolkit构建功能完整的任务管理应用"
  - "实现项目和任务的CRUD操作"
  - "支持任务状态流转和优先级管理"
  - "添加任务分配和团队成员管理功能"
  - "使用createAsyncThunk处理异步API调用"
  - "实现乐观更新和错误回滚机制"
hints:
  - "使用createEntityAdapter管理规范化数据"
  - "设计合理的state结构，避免深层嵌套"
  - "使用RTK Query处理服务器状态"
  - "考虑使用Immer简化不可变更新"
  - "利用Redux DevTools进行调试"
---

# Redux和Redux Toolkit实战练习 🚀

## 练习概述

今天我们将通过两个综合项目深入掌握Redux Toolkit的现代开发方式，学习如何构建可扩展、高性能的状态管理解决方案。

## 练习1：任务管理系统

### 项目要求

使用Redux Toolkit构建一个功能完整的任务管理应用：

1. **核心功能**
   - 项目管理（创建、编辑、删除、归档）
   - 任务CRUD操作
   - 任务状态流转（待办→进行中→已完成→已归档）
   - 标签系统和优先级管理
   - 任务分配和团队成员管理
   - 评论和活动日志
   - 搜索和过滤功能

2. **State设计**
```typescript
interface AppState {
  auth: AuthState;
  projects: EntityState<Project>;
  tasks: EntityState<Task>;
  users: EntityState<User>;
  tags: EntityState<Tag>;
  activities: ActivityState;
  ui: UIState;
}

interface Project {
  id: string;
  name: string;
  description: string;
  color: string;
  ownerId: string;
  memberIds: string[];
  taskIds: string[];
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'archived';
}

interface Task {
  id: string;
  title: string;
  description: string;
  projectId: string;
  assigneeId: string | null;
  status: 'todo' | 'in-progress' | 'done' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  tagIds: string[];
  dueDate: string | null;
  attachments: Attachment[];
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
}
```

3. **Slice实现要求**
```typescript
// projectsSlice.ts
const projectsAdapter = createEntityAdapter<Project>({
  sortComparer: (a, b) => b.updatedAt.localeCompare(a.updatedAt)
});

const projectsSlice = createSlice({
  name: 'projects',
  initialState: projectsAdapter.getInitialState({
    loading: false,
    error: null
  }),
  reducers: {
    // 同步actions
  },
  extraReducers: (builder) => {
    // 处理异步thunks
  }
});

// 使用createAsyncThunk处理API调用
export const fetchProjects = createAsyncThunk(
  'projects/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.getProjects(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
```

4. **高级功能**
   - 乐观更新（先更新UI，失败则回滚）
   - 批量操作（批量删除、批量更新状态）
   - 撤销/重做功能
   - 实时同步（WebSocket集成）
   - 离线支持（缓存和同步队列）

## 练习2：实时协作看板

### 项目要求

创建一个类似Trello的看板应用，支持实时协作：

1. **功能需求**
   - 看板、列表、卡片的三层结构
   - 拖拽排序功能
   - 实时协作（多人同时编辑）
   - 权限管理（查看者、编辑者、管理员）
   - 活动流和通知
   - 模板系统

2. **RTK Query集成**
```typescript
// apiSlice.ts
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    }
  }),
  tagTypes: ['Board', 'List', 'Card'],
  endpoints: (builder) => ({
    getBoards: builder.query<Board[], void>({
      query: () => 'boards',
      providesTags: ['Board']
    }),
    updateCard: builder.mutation<Card, UpdateCardDto>({
      query: ({ id, ...patch }) => ({
        url: `cards/${id}`,
        method: 'PATCH',
        body: patch
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Card', id }
      ]
    })
  })
});
```

3. **拖拽功能实现**
```typescript
// 使用Redux Toolkit处理拖拽状态
const dragSlice = createSlice({
  name: 'drag',
  initialState: {
    draggingCard: null,
    dragOverList: null,
    placeholder: null
  },
  reducers: {
    startDrag: (state, action) => {
      state.draggingCard = action.payload;
    },
    updateDragOver: (state, action) => {
      state.dragOverList = action.payload.listId;
      state.placeholder = action.payload.position;
    },
    endDrag: (state) => {
      state.draggingCard = null;
      state.dragOverList = null;
      state.placeholder = null;
    }
  }
});

// 处理拖拽完成的复杂逻辑
export const handleDrop = createAsyncThunk(
  'boards/handleDrop',
  async ({ cardId, sourceListId, targetListId, position }, { dispatch }) => {
    // 乐观更新
    dispatch(moveCard({ cardId, sourceListId, targetListId, position }));
    
    try {
      // API调用
      await api.moveCard({ cardId, targetListId, position });
    } catch (error) {
      // 失败回滚
      dispatch(revertMove());
      throw error;
    }
  }
);
```

4. **实时同步**
```typescript
// WebSocket中间件
const websocketMiddleware: Middleware = (store) => {
  let socket: WebSocket;

  return (next) => (action) => {
    if (connectWebSocket.match(action)) {
      socket = new WebSocket(action.payload);
      
      socket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        
        switch (message.type) {
          case 'CARD_UPDATED':
            store.dispatch(updateCardFromServer(message.payload));
            break;
          case 'USER_JOINED':
            store.dispatch(addActiveUser(message.payload));
            break;
          // 更多消息类型...
        }
      };
    }
    
    return next(action);
  };
};
```

## 评分标准

1. **功能完整性 (35%)**
   - 所有CRUD操作正常工作
   - 异步操作处理正确
   - 实时功能稳定

2. **Redux最佳实践 (30%)**
   - 合理的state设计
   - 正确使用RTK APIs
   - 性能优化得当

3. **代码质量 (20%)**
   - TypeScript类型完整
   - 错误处理完善
   - 代码组织清晰

4. **用户体验 (15%)**
   - 界面响应快速
   - 操作反馈及时
   - 错误提示友好

## 额外挑战

1. **性能优化**
   - 实现虚拟滚动处理大量数据
   - 使用reselect优化选择器
   - 实现请求去重和缓存

2. **高级功能**
   - 添加快捷键支持
   - 实现复杂的筛选器
   - 集成第三方服务（GitHub、Slack等）

3. **测试覆盖**
   - 为reducers编写单元测试
   - 测试异步thunks
   - 集成测试关键流程

## 资源和提示

1. 使用Redux DevTools进行调试
2. 利用RTK Query的缓存机制
3. 考虑使用redux-persist持久化部分状态
4. 实现良好的错误边界
5. 注意防止内存泄漏

祝你在Redux Toolkit的学习道路上取得成功！🎯