---
title: "全局状态管理"
description: "React应用中的全局状态管理方案，包括Context、Zustand、Jotai等现代解决方案"
category: "advanced"
language: "javascript"
---

# 全局状态管理

## 为什么需要全局状态

当应用变得复杂，某些状态需要在多个组件树的不同分支之间共享时，prop drilling变得难以维护。全局状态管理提供了更优雅的解决方案。

## Context API全局状态管理

### 1. 基础全局状态设置

```jsx
// store/GlobalStore.jsx
import { createContext, useContext, useReducer, useEffect } from 'react';

// 初始状态
const initialState = {
  user: null,
  theme: 'light',
  language: 'zh-CN',
  notifications: [],
  isLoading: false,
  error: null
};

// Action类型
const ActionTypes = {
  SET_USER: 'SET_USER',
  LOGOUT: 'LOGOUT',
  SET_THEME: 'SET_THEME',
  SET_LANGUAGE: 'SET_LANGUAGE',
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR'
};

// Reducer
function globalReducer(state, action) {
  switch (action.type) {
    case ActionTypes.SET_USER:
      return { ...state, user: action.payload };
    
    case ActionTypes.LOGOUT:
      return { ...state, user: null };
    
    case ActionTypes.SET_THEME:
      return { ...state, theme: action.payload };
    
    case ActionTypes.SET_LANGUAGE:
      return { ...state, language: action.payload };
    
    case ActionTypes.ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [...state.notifications, action.payload]
      };
    
    case ActionTypes.REMOVE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter(
          notif => notif.id !== action.payload
        )
      };
    
    case ActionTypes.SET_LOADING:
      return { ...state, isLoading: action.payload };
    
    case ActionTypes.SET_ERROR:
      return { ...state, error: action.payload };
    
    default:
      return state;
  }
}

// Context
const GlobalStateContext = createContext();
const GlobalDispatchContext = createContext();

// Provider组件
export function GlobalProvider({ children }) {
  const [state, dispatch] = useReducer(globalReducer, initialState);
  
  // 持久化主题和语言设置
  useEffect(() => {
    const savedTheme = localStorage.getItem('app-theme');
    const savedLanguage = localStorage.getItem('app-language');
    
    if (savedTheme) {
      dispatch({ type: ActionTypes.SET_THEME, payload: savedTheme });
    }
    
    if (savedLanguage) {
      dispatch({ type: ActionTypes.SET_LANGUAGE, payload: savedLanguage });
    }
  }, []);
  
  // 监听状态变化并持久化
  useEffect(() => {
    localStorage.setItem('app-theme', state.theme);
  }, [state.theme]);
  
  useEffect(() => {
    localStorage.setItem('app-language', state.language);
  }, [state.language]);
  
  return (
    <GlobalStateContext.Provider value={state}>
      <GlobalDispatchContext.Provider value={dispatch}>
        {children}
      </GlobalDispatchContext.Provider>
    </GlobalStateContext.Provider>
  );
}

// 自定义Hooks
export function useGlobalState() {
  const context = useContext(GlobalStateContext);
  if (!context) {
    throw new Error('useGlobalState必须在GlobalProvider内部使用');
  }
  return context;
}

export function useGlobalDispatch() {
  const context = useContext(GlobalDispatchContext);
  if (!context) {
    throw new Error('useGlobalDispatch必须在GlobalProvider内部使用');
  }
  return context;
}

// Action创建函数
export const globalActions = {
  setUser: (user) => ({
    type: ActionTypes.SET_USER,
    payload: user
  }),
  
  logout: () => ({
    type: ActionTypes.LOGOUT
  }),
  
  setTheme: (theme) => ({
    type: ActionTypes.SET_THEME,
    payload: theme
  }),
  
  setLanguage: (language) => ({
    type: ActionTypes.SET_LANGUAGE,
    payload: language
  }),
  
  addNotification: (notification) => ({
    type: ActionTypes.ADD_NOTIFICATION,
    payload: {
      id: Date.now(),
      ...notification,
      timestamp: new Date()
    }
  }),
  
  removeNotification: (id) => ({
    type: ActionTypes.REMOVE_NOTIFICATION,
    payload: id
  }),
  
  setLoading: (isLoading) => ({
    type: ActionTypes.SET_LOADING,
    payload: isLoading
  }),
  
  setError: (error) => ({
    type: ActionTypes.SET_ERROR,
    payload: error
  })
};
```

### 2. 使用全局状态

```jsx
// App.jsx
import { GlobalProvider } from './store/GlobalStore';

function App() {
  return (
    <GlobalProvider>
      <Router>
        <Layout>
          <Routes>
            {/* 路由配置 */}
          </Routes>
        </Layout>
      </Router>
    </GlobalProvider>
  );
}

// 组件中使用
import { useGlobalState, useGlobalDispatch, globalActions } from './store/GlobalStore';

function UserProfile() {
  const { user, theme } = useGlobalState();
  const dispatch = useGlobalDispatch();
  
  const handleLogout = () => {
    dispatch(globalActions.logout());
    // 清理其他数据...
  };
  
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    dispatch(globalActions.setTheme(newTheme));
  };
  
  if (!user) {
    return <div>请先登录</div>;
  }
  
  return (
    <div className={`profile ${theme}`}>
      <h2>欢迎, {user.name}!</h2>
      <button onClick={toggleTheme}>
        切换到{theme === 'light' ? '深色' : '浅色'}主题
      </button>
      <button onClick={handleLogout}>退出登录</button>
    </div>
  );
}
```

## Zustand状态管理

### 1. 基础Store设置

```jsx
// store/useStore.js
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

// 创建Store
const useStore = create(
  devtools(
    persist(
      immer((set, get) => ({
        // 用户状态
        user: null,
        isAuthenticated: false,
        
        // UI状态
        theme: 'light',
        sidebarOpen: true,
        
        // 应用数据
        todos: [],
        
        // Actions
        login: async (credentials) => {
          try {
            const user = await api.login(credentials);
            set(state => {
              state.user = user;
              state.isAuthenticated = true;
            });
            return { success: true };
          } catch (error) {
            return { success: false, error: error.message };
          }
        },
        
        logout: () => {
          set(state => {
            state.user = null;
            state.isAuthenticated = false;
            state.todos = [];
          });
        },
        
        toggleTheme: () => {
          set(state => {
            state.theme = state.theme === 'light' ? 'dark' : 'light';
          });
        },
        
        toggleSidebar: () => {
          set(state => {
            state.sidebarOpen = !state.sidebarOpen;
          });
        },
        
        // Todo相关actions
        addTodo: (text) => {
          set(state => {
            state.todos.push({
              id: Date.now(),
              text,
              completed: false,
              createdAt: new Date()
            });
          });
        },
        
        toggleTodo: (id) => {
          set(state => {
            const todo = state.todos.find(t => t.id === id);
            if (todo) {
              todo.completed = !todo.completed;
            }
          });
        },
        
        deleteTodo: (id) => {
          set(state => {
            state.todos = state.todos.filter(t => t.id !== id);
          });
        },
        
        // 计算属性
        get completedTodos() {
          return get().todos.filter(todo => todo.completed);
        },
        
        get activeTodos() {
          return get().todos.filter(todo => !todo.completed);
        }
      })),
      {
        name: 'app-storage', // localStorage的key
        partialize: (state) => ({
          // 只持久化部分状态
          user: state.user,
          theme: state.theme,
          todos: state.todos
        })
      }
    )
  )
);

export default useStore;
```

### 2. 使用Zustand

```jsx
// 组件中使用
import useStore from './store/useStore';

function TodoList() {
  const todos = useStore(state => state.todos);
  const activeTodos = useStore(state => state.activeTodos);
  const addTodo = useStore(state => state.addTodo);
  const toggleTodo = useStore(state => state.toggleTodo);
  const deleteTodo = useStore(state => state.deleteTodo);
  
  const [newTodo, setNewTodo] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (newTodo.trim()) {
      addTodo(newTodo);
      setNewTodo('');
    }
  };
  
  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="添加新任务..."
        />
        <button type="submit">添加</button>
      </form>
      
      <div>剩余任务: {activeTodos.length}</div>
      
      <ul>
        {todos.map(todo => (
          <li key={todo.id}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
            />
            <span className={todo.completed ? 'completed' : ''}>
              {todo.text}
            </span>
            <button onClick={() => deleteTodo(todo.id)}>
              删除
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

// 选择性订阅优化性能
function Header() {
  // 只订阅需要的状态
  const theme = useStore(state => state.theme);
  const toggleTheme = useStore(state => state.toggleTheme);
  const user = useStore(state => state.user);
  
  return (
    <header className={theme}>
      {user && <span>欢迎, {user.name}</span>}
      <button onClick={toggleTheme}>
        {theme === 'light' ? '🌙' : '☀️'}
      </button>
    </header>
  );
}
```

## Jotai原子化状态管理

### 1. 原子(Atom)定义

```jsx
// atoms/index.js
import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

// 基础原子
export const userAtom = atom(null);
export const loadingAtom = atom(false);
export const errorAtom = atom(null);

// 带持久化的原子
export const themeAtom = atomWithStorage('theme', 'light');
export const languageAtom = atomWithStorage('language', 'zh-CN');

// 派生原子（只读）
export const isAuthenticatedAtom = atom(
  (get) => get(userAtom) !== null
);

// 可写派生原子
export const userNameAtom = atom(
  (get) => get(userAtom)?.name || '',
  (get, set, newName) => {
    const user = get(userAtom);
    if (user) {
      set(userAtom, { ...user, name: newName });
    }
  }
);

// 异步原子
export const todosAtom = atom(async () => {
  const response = await fetch('/api/todos');
  return response.json();
});

// 带写入的异步原子
export const todoListAtom = atom(
  async (get) => {
    const response = await fetch('/api/todos');
    return response.json();
  },
  async (get, set, newTodo) => {
    const response = await fetch('/api/todos', {
      method: 'POST',
      body: JSON.stringify(newTodo)
    });
    const created = await response.json();
    const current = await get(todoListAtom);
    set(todoListAtom, [...current, created]);
  }
);

// 原子家族
import { atomFamily } from 'jotai/utils';

export const todoItemFamily = atomFamily((id) => 
  atom(async () => {
    const response = await fetch(`/api/todos/${id}`);
    return response.json();
  })
);
```

### 2. 使用Jotai

```jsx
// App.jsx
import { Provider } from 'jotai';

function App() {
  return (
    <Provider>
      <Router>
        <Layout />
      </Router>
    </Provider>
  );
}

// 组件中使用
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { userAtom, themeAtom, todosAtom } from './atoms';

function UserProfile() {
  const [user, setUser] = useAtom(userAtom);
  const [theme, setTheme] = useAtom(themeAtom);
  
  const handleLogin = async (credentials) => {
    try {
      const userData = await api.login(credentials);
      setUser(userData);
    } catch (error) {
      console.error('登录失败:', error);
    }
  };
  
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };
  
  return (
    <div>
      {user ? (
        <div>
          <h2>欢迎, {user.name}</h2>
          <button onClick={() => setUser(null)}>退出</button>
        </div>
      ) : (
        <LoginForm onLogin={handleLogin} />
      )}
      <button onClick={toggleTheme}>
        当前主题: {theme}
      </button>
    </div>
  );
}

// 只读原子
function TodoCount() {
  const todos = useAtomValue(todosAtom);
  const isAuthenticated = useAtomValue(isAuthenticatedAtom);
  
  if (!isAuthenticated) {
    return null;
  }
  
  return <div>任务数量: {todos.length}</div>;
}

// 只写原子
function AddTodoButton() {
  const addTodo = useSetAtom(todoListAtom);
  
  const handleAdd = () => {
    addTodo({
      text: '新任务',
      completed: false
    });
  };
  
  return <button onClick={handleAdd}>添加任务</button>;
}
```

## 状态管理方案对比

### 1. 选择指南

```jsx
// Context API - 适合小到中型应用
// 优点：内置React、无需额外依赖、TypeScript支持好
// 缺点：需要手动优化性能、代码较冗长

// Zustand - 适合中到大型应用
// 优点：简单易用、性能好、内置中间件
// 缺点：额外依赖、需要学习新API

// Jotai - 适合需要细粒度控制的应用
// 优点：原子化设计、React Suspense支持、性能优秀
// 缺点：概念较新、生态系统较小

// 性能对比示例
function PerformanceComparison() {
  return (
    <div>
      <h2>不同方案的渲染优化</h2>
      
      {/* Context - 需要手动优化 */}
      <ContextExample />
      
      {/* Zustand - 自动优化 */}
      <ZustandExample />
      
      {/* Jotai - 原子级优化 */}
      <JotaiExample />
    </div>
  );
}

// Context示例 - 需要memo和分离context
const ExpensiveContextComponent = React.memo(({ data }) => {
  console.log('Context组件渲染');
  return <div>{data}</div>;
});

// Zustand示例 - 自动选择性订阅
function ZustandComponent() {
  // 只有specificData变化时才重新渲染
  const specificData = useStore(state => state.specificData);
  console.log('Zustand组件渲染');
  return <div>{specificData}</div>;
}

// Jotai示例 - 原子级别的订阅
function JotaiComponent() {
  // 只订阅单个原子
  const value = useAtomValue(specificAtom);
  console.log('Jotai组件渲染');
  return <div>{value}</div>;
}
```

### 2. 混合使用策略

```jsx
// 可以根据不同需求混合使用多种方案

// 全局应用状态 - Zustand
const useAppStore = create((set) => ({
  user: null,
  theme: 'light',
  // ...
}));

// 服务器状态 - React Query + Jotai
const userQueryAtom = atomWithQuery(() => ({
  queryKey: ['user'],
  queryFn: fetchUser,
}));

// 表单状态 - 局部state或React Hook Form
function Form() {
  const { register, handleSubmit } = useForm();
  // ...
}

// UI状态 - Context API
const UIContext = createContext({
  modal: null,
  toast: null,
});
```

## 最佳实践

### 1. 状态分类和组织

```jsx
// store/slices/userSlice.js
export const createUserSlice = (set, get) => ({
  user: null,
  userSettings: {
    notifications: true,
    language: 'zh-CN'
  },
  
  actions: {
    updateUser: (updates) => set(state => ({
      user: { ...state.user, ...updates }
    })),
    
    updateSettings: (settings) => set(state => ({
      userSettings: { ...state.userSettings, ...settings }
    }))
  }
});

// store/slices/uiSlice.js
export const createUISlice = (set, get) => ({
  theme: 'light',
  sidebarCollapsed: false,
  activeModal: null,
  
  actions: {
    toggleTheme: () => set(state => ({
      theme: state.theme === 'light' ? 'dark' : 'light'
    })),
    
    toggleSidebar: () => set(state => ({
      sidebarCollapsed: !state.sidebarCollapsed
    })),
    
    openModal: (modalType, props) => set({
      activeModal: { type: modalType, props }
    }),
    
    closeModal: () => set({ activeModal: null })
  }
});

// store/index.js
const useStore = create((set, get) => ({
  ...createUserSlice(set, get),
  ...createUISlice(set, get)
}));
```

### 2. DevTools集成

```jsx
// Zustand DevTools
const useStore = create(
  devtools(
    (set) => ({
      // store配置
    }),
    {
      name: 'app-store',
    }
  )
);

// React Query DevTools
import { ReactQueryDevtools } from 'react-query/devtools';

function App() {
  return (
    <>
      <AppContent />
      <ReactQueryDevtools initialIsOpen={false} />
    </>
  );
}
```

全局状态管理是现代React应用的核心部分，选择合适的方案并遵循最佳实践能够显著提升应用的可维护性和性能。