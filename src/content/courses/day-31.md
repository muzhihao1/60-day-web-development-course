---
day: 31
phase: "react-development"
title: "状态管理进阶（Context API深入）"
description: "深入掌握React Context API，学习高级模式和性能优化技巧，构建可扩展的状态管理系统"
objectives:
  - "理解Context API的设计理念和适用场景"
  - "掌握多Context组合和嵌套模式"
  - "学习Context性能优化技巧"
  - "实现Context与useReducer的结合使用"
  - "构建生产级的状态管理解决方案"
estimatedTime: 150
difficulty: "advanced"
prerequisites: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 25, 26, 27, 28, 29, 30]
tags:
  - "React"
  - "Context API"
  - "状态管理"
  - "性能优化"
  - "设计模式"
resources:
  - title: "React Context官方文档"
    url: "https://react.dev/reference/react/createContext"
    type: "documentation"
  - title: "Context性能优化"
    url: "https://blog.isquaredsoftware.com/2021/01/context-redux-differences/"
    type: "article"
  - title: "React状态管理模式"
    url: "https://kentcdodds.com/blog/application-state-management-with-react"
    type: "article"
  - title: "避免Context陷阱"
    url: "https://leerob.io/blog/react-state-management"
    type: "article"
codeExamples:
  - title: "Context高级模式"
    language: "javascript"
    path: "/code-examples/day-31/context-patterns.jsx"
  - title: "状态管理系统"
    language: "javascript"
    path: "/code-examples/day-31/state-management.jsx"
---

# Day 31: 状态管理进阶（Context API深入）

## 📋 学习目标

Context API是React提供的内置状态管理方案，它解决了"prop drilling"问题，让我们能够在组件树中高效地共享数据。今天我们将深入探索Context的高级用法，学习如何构建高性能、可扩展的状态管理系统。

## 🌟 Context API核心概念回顾

### 1. 为什么需要Context？

```jsx
// ❌ Prop Drilling问题
function App() {
  const [user, setUser] = useState({ name: '张三', theme: 'dark' });
  
  return <Dashboard user={user} setUser={setUser} />;
}

function Dashboard({ user, setUser }) {
  return <UserPanel user={user} setUser={setUser} />;
}

function UserPanel({ user, setUser }) {
  return <UserInfo user={user} setUser={setUser} />;
}

function UserInfo({ user, setUser }) {
  // 终于用到了user
  return <div>欢迎，{user.name}!</div>;
}

// ✅ 使用Context解决
const UserContext = createContext();

function App() {
  const [user, setUser] = useState({ name: '张三', theme: 'dark' });
  
  return (
    <UserContext.Provider value={{ user, setUser }}>
      <Dashboard />
    </UserContext.Provider>
  );
}

function UserInfo() {
  const { user } = useContext(UserContext);
  return <div>欢迎，{user.name}!</div>;
}
```

### 2. Context的适用场景

```jsx
// ✅ 适合使用Context的场景
// 1. 全局共享的数据
const ThemeContext = createContext(); // 主题
const AuthContext = createContext();  // 用户认证
const LocaleContext = createContext(); // 国际化

// 2. 跨越多层的数据传递
const FormContext = createContext(); // 表单状态
const ModalContext = createContext(); // 模态框控制

// ❌ 不适合使用Context的场景
// 1. 频繁变化的数据
const MousePositionContext = createContext(); // 鼠标位置

// 2. 局部组件的状态
const TodoItemContext = createContext(); // 单个待办事项

// 3. 可以通过组合解决的问题
// 使用children而不是Context
function Card({ children }) {
  return <div className="card">{children}</div>;
}
```

## 📊 Context设计模式

### 1. Provider模式

```jsx
// 创建一个功能完整的Context Provider
import { createContext, useContext, useState, useCallback, useMemo } from 'react';

// 1. 创建Context
const ThemeContext = createContext(undefined);

// 2. 自定义Hook，提供类型安全和错误处理
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme必须在ThemeProvider内部使用');
  }
  return context;
};

// 3. Provider组件
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // 从localStorage读取初始主题
    const savedTheme = localStorage.getItem('app-theme');
    return savedTheme || 'light';
  });

  // 使用useCallback避免不必要的重渲染
  const toggleTheme = useCallback(() => {
    setTheme(prevTheme => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      localStorage.setItem('app-theme', newTheme);
      return newTheme;
    });
  }, []);

  const changeTheme = useCallback((newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('app-theme', newTheme);
  }, []);

  // 使用useMemo缓存context值
  const value = useMemo(() => ({
    theme,
    toggleTheme,
    changeTheme,
    isLight: theme === 'light',
    isDark: theme === 'dark'
  }), [theme, toggleTheme, changeTheme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// 4. 使用示例
function App() {
  return (
    <ThemeProvider>
      <Layout />
    </ThemeProvider>
  );
}

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button onClick={toggleTheme}>
      当前主题：{theme}
    </button>
  );
}
```

### 2. 多Context组合

```jsx
// 认证Context
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 初始化时检查token
    const token = localStorage.getItem('auth-token');
    if (token) {
      // 验证token并获取用户信息
      verifyToken(token)
        .then(user => setUser(user))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (credentials) => {
    const { user, token } = await api.login(credentials);
    localStorage.setItem('auth-token', token);
    setUser(user);
    return user;
  };

  const logout = () => {
    localStorage.removeItem('auth-token');
    setUser(null);
  };

  const value = { user, login, logout, loading, isAuthenticated: !!user };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 国际化Context
const I18nContext = createContext();

export const I18nProvider = ({ children }) => {
  const [locale, setLocale] = useState('zh-CN');
  const [messages, setMessages] = useState({});

  useEffect(() => {
    // 动态加载语言包
    import(`./locales/${locale}.json`)
      .then(module => setMessages(module.default));
  }, [locale]);

  const t = useCallback((key, params = {}) => {
    let message = messages[key] || key;
    
    // 简单的参数替换
    Object.entries(params).forEach(([key, value]) => {
      message = message.replace(`{${key}}`, value);
    });
    
    return message;
  }, [messages]);

  const value = { locale, setLocale, t };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

// 组合多个Provider
export const AppProviders = ({ children }) => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <I18nProvider>
            <NotificationProvider>
              {children}
            </NotificationProvider>
          </I18nProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

// 使用compose模式优化嵌套
const compose = (...providers) => ({ children }) =>
  providers.reduceRight((acc, Provider) => 
    <Provider>{acc}</Provider>, 
    children
  );

export const AppProviders = compose(
  ThemeProvider,
  AuthProvider,
  I18nProvider,
  NotificationProvider
);
```

### 3. Context工厂模式

```jsx
// 创建通用的Context工厂
function createGenericContext(name) {
  const Context = createContext(undefined);

  const Provider = ({ children, ...props }) => {
    return <Context.Provider value={props}>{children}</Context.Provider>;
  };

  const useGenericContext = () => {
    const context = useContext(Context);
    if (context === undefined) {
      throw new Error(`use${name}必须在${name}Provider内部使用`);
    }
    return context;
  };

  return [Provider, useGenericContext];
}

// 使用工厂创建Context
const [ModalProvider, useModal] = createGenericContext('Modal');
const [TooltipProvider, useTooltip] = createGenericContext('Tooltip');

// 更高级的工厂模式
function createStateContext(name, defaultValue) {
  const StateContext = createContext(undefined);
  const DispatchContext = createContext(undefined);

  const Provider = ({ children, initialValue = defaultValue }) => {
    const [state, dispatch] = useReducer(reducer, initialValue);

    return (
      <StateContext.Provider value={state}>
        <DispatchContext.Provider value={dispatch}>
          {children}
        </DispatchContext.Provider>
      </StateContext.Provider>
    );
  };

  const useState = () => {
    const context = useContext(StateContext);
    if (context === undefined) {
      throw new Error(`use${name}State必须在${name}Provider内部使用`);
    }
    return context;
  };

  const useDispatch = () => {
    const context = useContext(DispatchContext);
    if (context === undefined) {
      throw new Error(`use${name}Dispatch必须在${name}Provider内部使用`);
    }
    return context;
  };

  return { Provider, useState, useDispatch };
}
```

## 🔄 Context性能优化

### 1. 拆分Context避免不必要的重渲染

```jsx
// ❌ 不好的实践：所有数据在一个Context中
const AppContext = createContext();

const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState('light');
  const [notifications, setNotifications] = useState([]);
  
  // 任何状态更新都会导致所有消费者重渲染
  const value = {
    user, setUser,
    theme, setTheme,
    notifications, setNotifications
  };
  
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// ✅ 好的实践：拆分成多个Context
const UserContext = createContext();
const ThemeContext = createContext();
const NotificationContext = createContext();

// 分离静态和动态数据
const ConfigContext = createContext(); // 静态配置
const StateContext = createContext();  // 动态状态

// 更细粒度的拆分
const UserDataContext = createContext();    // 用户数据（较少变化）
const UserActionsContext = createContext(); // 用户操作（不变）

const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  
  // actions永远不变，不会触发重渲染
  const actions = useMemo(() => ({
    login: async (credentials) => { /* ... */ },
    logout: () => { /* ... */ },
    updateProfile: (data) => { /* ... */ }
  }), []);
  
  return (
    <UserDataContext.Provider value={user}>
      <UserActionsContext.Provider value={actions}>
        {children}
      </UserActionsContext.Provider>
    </UserDataContext.Provider>
  );
};
```

### 2. 使用useMemo优化Context值

```jsx
// Context值优化示例
const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [coupon, setCoupon] = useState(null);
  
  // ❌ 每次渲染都创建新对象
  const value = {
    items,
    coupon,
    total: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    addItem: (item) => setItems([...items, item]),
    removeItem: (id) => setItems(items.filter(item => item.id !== id))
  };
  
  // ✅ 使用useMemo缓存值
  const total = useMemo(() => 
    items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  );
  
  const addItem = useCallback((item) => {
    setItems(prev => [...prev, item]);
  }, []);
  
  const removeItem = useCallback((id) => {
    setItems(prev => prev.filter(item => item.id !== id));
  }, []);
  
  const value = useMemo(() => ({
    items,
    coupon,
    total,
    addItem,
    removeItem
  }), [items, coupon, total, addItem, removeItem]);
  
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// 选择性订阅模式
const CartContext = createContext();
const CartSubscribeContext = createContext();

const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const subscribers = useRef(new Set());
  
  const subscribe = useCallback((callback) => {
    subscribers.current.add(callback);
    return () => subscribers.current.delete(callback);
  }, []);
  
  const notify = useCallback((changes) => {
    subscribers.current.forEach(callback => callback(changes));
  }, []);
  
  const enhancedDispatch = useCallback((action) => {
    dispatch(action);
    notify({ type: action.type, payload: action.payload });
  }, [notify]);
  
  return (
    <CartContext.Provider value={{ state, dispatch: enhancedDispatch }}>
      <CartSubscribeContext.Provider value={subscribe}>
        {children}
      </CartSubscribeContext.Provider>
    </CartContext.Provider>
  );
};
```

### 3. Context选择器模式

```jsx
// 实现类似Redux的useSelector
function createSelectableContext(name) {
  const StateContext = createContext();
  const SubscribeContext = createContext();
  
  const Provider = ({ children, initialState }) => {
    const [state, setState] = useState(initialState);
    const subscribers = useRef(new Map());
    
    const subscribe = useCallback((selector, callback) => {
      const id = Math.random();
      subscribers.current.set(id, { selector, callback });
      
      return () => {
        subscribers.current.delete(id);
      };
    }, []);
    
    const updateState = useCallback((updater) => {
      setState(prevState => {
        const nextState = typeof updater === 'function' 
          ? updater(prevState) 
          : updater;
        
        // 通知相关订阅者
        subscribers.current.forEach(({ selector, callback }) => {
          const prevSelected = selector(prevState);
          const nextSelected = selector(nextState);
          
          if (!Object.is(prevSelected, nextSelected)) {
            callback(nextSelected);
          }
        });
        
        return nextState;
      });
    }, []);
    
    return (
      <StateContext.Provider value={[state, updateState]}>
        <SubscribeContext.Provider value={subscribe}>
          {children}
        </SubscribeContext.Provider>
      </StateContext.Provider>
    );
  };
  
  const useSelector = (selector) => {
    const [state] = useContext(StateContext);
    const subscribe = useContext(SubscribeContext);
    const [selectedState, setSelectedState] = useState(() => selector(state));
    
    useEffect(() => {
      const unsubscribe = subscribe(selector, setSelectedState);
      return unsubscribe;
    }, [selector, subscribe]);
    
    return selectedState;
  };
  
  const useDispatch = () => {
    const [, updateState] = useContext(StateContext);
    return updateState;
  };
  
  return { Provider, useSelector, useDispatch };
}

// 使用示例
const { Provider: AppProvider, useSelector, useDispatch } = createSelectableContext('App');

function UserName() {
  // 只在user.name变化时重渲染
  const userName = useSelector(state => state.user?.name);
  return <div>{userName}</div>;
}

function ThemeToggle() {
  // 只在theme变化时重渲染
  const theme = useSelector(state => state.theme);
  const dispatch = useDispatch();
  
  return (
    <button onClick={() => dispatch(state => ({ ...state, theme: theme === 'light' ? 'dark' : 'light' }))}>
      切换主题
    </button>
  );
}
```

## 🎨 Context与useReducer结合

### 1. 构建小型状态管理系统

```jsx
// 定义状态和动作类型
const initialState = {
  user: null,
  isLoading: false,
  error: null,
  notifications: [],
  preferences: {
    theme: 'light',
    language: 'zh-CN',
    notifications: true
  }
};

// Action Types
const ActionTypes = {
  // 用户相关
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  UPDATE_PROFILE: 'UPDATE_PROFILE',
  
  // 通知相关
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
  CLEAR_NOTIFICATIONS: 'CLEAR_NOTIFICATIONS',
  
  // 偏好设置
  UPDATE_PREFERENCES: 'UPDATE_PREFERENCES',
  RESET_PREFERENCES: 'RESET_PREFERENCES'
};

// Reducer
function appReducer(state, action) {
  switch (action.type) {
    case ActionTypes.LOGIN_START:
      return {
        ...state,
        isLoading: true,
        error: null
      };
      
    case ActionTypes.LOGIN_SUCCESS:
      return {
        ...state,
        isLoading: false,
        user: action.payload,
        error: null
      };
      
    case ActionTypes.LOGIN_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload
      };
      
    case ActionTypes.LOGOUT:
      return {
        ...state,
        user: null
      };
      
    case ActionTypes.ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [...state.notifications, {
          id: Date.now(),
          ...action.payload
        }]
      };
      
    case ActionTypes.REMOVE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter(
          notif => notif.id !== action.payload
        )
      };
      
    case ActionTypes.UPDATE_PREFERENCES:
      return {
        ...state,
        preferences: {
          ...state.preferences,
          ...action.payload
        }
      };
      
    default:
      return state;
  }
}

// Context和Provider
const StateContext = createContext();
const DispatchContext = createContext();

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  
  // 添加中间件支持
  const enhancedDispatch = useCallback(async (action) => {
    // 日志中间件
    console.log('Dispatching:', action);
    
    // 异步action支持
    if (typeof action === 'function') {
      return action(dispatch, state);
    }
    
    dispatch(action);
  }, [state]);
  
  // 持久化中间件
  useEffect(() => {
    const preferences = state.preferences;
    localStorage.setItem('app-preferences', JSON.stringify(preferences));
  }, [state.preferences]);
  
  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={enhancedDispatch}>
        {children}
      </DispatchContext.Provider>
    </StateContext.Provider>
  );
};

// 自定义Hooks
export const useAppState = () => {
  const context = useContext(StateContext);
  if (!context) {
    throw new Error('useAppState必须在AppProvider内部使用');
  }
  return context;
};

export const useAppDispatch = () => {
  const context = useContext(DispatchContext);
  if (!context) {
    throw new Error('useAppDispatch必须在AppProvider内部使用');
  }
  return context;
};

// Action Creators
export const actions = {
  login: (credentials) => async (dispatch) => {
    dispatch({ type: ActionTypes.LOGIN_START });
    
    try {
      const user = await api.login(credentials);
      dispatch({ type: ActionTypes.LOGIN_SUCCESS, payload: user });
      return { success: true };
    } catch (error) {
      dispatch({ type: ActionTypes.LOGIN_FAILURE, payload: error.message });
      return { success: false, error: error.message };
    }
  },
  
  logout: () => ({ type: ActionTypes.LOGOUT }),
  
  addNotification: (notification) => ({
    type: ActionTypes.ADD_NOTIFICATION,
    payload: notification
  }),
  
  updatePreferences: (preferences) => ({
    type: ActionTypes.UPDATE_PREFERENCES,
    payload: preferences
  })
};

// 使用示例
function LoginButton() {
  const dispatch = useAppDispatch();
  const { isLoading } = useAppState();
  
  const handleLogin = async () => {
    const result = await dispatch(actions.login({ 
      username: 'user', 
      password: 'pass' 
    }));
    
    if (result.success) {
      dispatch(actions.addNotification({
        type: 'success',
        message: '登录成功！'
      }));
    }
  };
  
  return (
    <button onClick={handleLogin} disabled={isLoading}>
      {isLoading ? '登录中...' : '登录'}
    </button>
  );
}
```

### 2. 模块化的Context系统

```jsx
// 创建模块化的store
const createStore = (name, reducer, initialState) => {
  const StateContext = createContext();
  const DispatchContext = createContext();
  
  const Provider = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, initialState);
    
    return (
      <StateContext.Provider value={state}>
        <DispatchContext.Provider value={dispatch}>
          {children}
        </DispatchContext.Provider>
      </StateContext.Provider>
    );
  };
  
  const useState = () => {
    const context = useContext(StateContext);
    if (!context) {
      throw new Error(`use${name}State必须在${name}Provider内部使用`);
    }
    return context;
  };
  
  const useDispatch = () => {
    const context = useContext(DispatchContext);
    if (!context) {
      throw new Error(`use${name}Dispatch必须在${name}Provider内部使用`);
    }
    return context;
  };
  
  return {
    Provider,
    useState,
    useDispatch
  };
};

// 创建不同的store模块
const authStore = createStore('Auth', authReducer, { user: null, token: null });
const cartStore = createStore('Cart', cartReducer, { items: [], total: 0 });
const uiStore = createStore('UI', uiReducer, { 
  modal: null, 
  sidebar: false,
  theme: 'light' 
});

// 组合stores
export const StoreProvider = ({ children }) => {
  return (
    <authStore.Provider>
      <cartStore.Provider>
        <uiStore.Provider>
          {children}
        </uiStore.Provider>
      </cartStore.Provider>
    </authStore.Provider>
  );
};

// 导出hooks
export const useAuth = authStore.useState;
export const useAuthDispatch = authStore.useDispatch;
export const useCart = cartStore.useState;
export const useCartDispatch = cartStore.useDispatch;
export const useUI = uiStore.useState;
export const useUIDispatch = uiStore.useDispatch;
```

## 💼 实战项目：完整的应用状态管理

### 构建一个任务管理应用

```jsx
// types.js
export const TaskStatus = {
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  DONE: 'done'
};

export const TaskPriority = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
};

// contexts/TaskContext.jsx
const TaskStateContext = createContext();
const TaskDispatchContext = createContext();

const taskReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TASK':
      return {
        ...state,
        tasks: [...state.tasks, {
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          status: TaskStatus.TODO,
          ...action.payload
        }]
      };
      
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.id
            ? { ...task, ...action.payload.updates }
            : task
        )
      };
      
    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload)
      };
      
    case 'SET_FILTER':
      return {
        ...state,
        filter: action.payload
      };
      
    case 'SET_SORT':
      return {
        ...state,
        sort: action.payload
      };
      
    default:
      return state;
  }
};

export const TaskProvider = ({ children }) => {
  const [state, dispatch] = useReducer(taskReducer, {
    tasks: [],
    filter: 'all',
    sort: 'createdAt'
  });
  
  // 派生状态
  const filteredTasks = useMemo(() => {
    let filtered = [...state.tasks];
    
    // 应用过滤
    if (state.filter !== 'all') {
      filtered = filtered.filter(task => {
        if (state.filter === 'active') return task.status !== TaskStatus.DONE;
        if (state.filter === 'completed') return task.status === TaskStatus.DONE;
        return task.status === state.filter;
      });
    }
    
    // 应用排序
    filtered.sort((a, b) => {
      switch (state.sort) {
        case 'priority':
          const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        case 'dueDate':
          return new Date(a.dueDate || '9999') - new Date(b.dueDate || '9999');
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });
    
    return filtered;
  }, [state.tasks, state.filter, state.sort]);
  
  const value = useMemo(() => ({
    ...state,
    filteredTasks,
    taskCounts: {
      total: state.tasks.length,
      todo: state.tasks.filter(t => t.status === TaskStatus.TODO).length,
      inProgress: state.tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length,
      done: state.tasks.filter(t => t.status === TaskStatus.DONE).length
    }
  }), [state, filteredTasks]);
  
  return (
    <TaskStateContext.Provider value={value}>
      <TaskDispatchContext.Provider value={dispatch}>
        {children}
      </TaskDispatchContext.Provider>
    </TaskStateContext.Provider>
  );
};

// contexts/NotificationContext.jsx
const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  
  const addNotification = useCallback((notification) => {
    const id = Date.now().toString();
    const newNotification = {
      id,
      ...notification
    };
    
    setNotifications(prev => [...prev, newNotification]);
    
    // 自动移除
    if (notification.autoClose !== false) {
      setTimeout(() => {
        removeNotification(id);
      }, notification.duration || 3000);
    }
    
    return id;
  }, []);
  
  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);
  
  const value = useMemo(() => ({
    notifications,
    addNotification,
    removeNotification
  }), [notifications, addNotification, removeNotification]);
  
  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationContainer notifications={notifications} />
    </NotificationContext.Provider>
  );
};

// App.jsx
export const App = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <TaskProvider>
              <Router>
                <Routes>
                  <Route path="/" element={<TaskBoard />} />
                  <Route path="/task/:id" element={<TaskDetail />} />
                  <Route path="/settings" element={<Settings />} />
                </Routes>
              </Router>
            </TaskProvider>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

// components/TaskBoard.jsx
function TaskBoard() {
  const { filteredTasks, taskCounts, filter } = useTaskState();
  const dispatch = useTaskDispatch();
  const { addNotification } = useNotifications();
  
  const handleTaskComplete = (taskId) => {
    dispatch({
      type: 'UPDATE_TASK',
      payload: {
        id: taskId,
        updates: { status: TaskStatus.DONE }
      }
    });
    
    addNotification({
      type: 'success',
      message: '任务已完成！',
      icon: '✅'
    });
  };
  
  return (
    <div className="task-board">
      <TaskFilters 
        filter={filter}
        counts={taskCounts}
        onFilterChange={(newFilter) => 
          dispatch({ type: 'SET_FILTER', payload: newFilter })
        }
      />
      
      <div className="task-columns">
        {Object.values(TaskStatus).map(status => (
          <TaskColumn
            key={status}
            status={status}
            tasks={filteredTasks.filter(t => t.status === status)}
            onTaskUpdate={(id, updates) =>
              dispatch({ type: 'UPDATE_TASK', payload: { id, updates } })
            }
            onTaskComplete={handleTaskComplete}
          />
        ))}
      </div>
      
      <AddTaskButton />
    </div>
  );
}
```

### 性能监控和调试

```jsx
// 开发环境下的Context调试工具
const ContextDevTools = ({ name, context }) => {
  const value = useContext(context);
  const [isOpen, setIsOpen] = useState(false);
  
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  return (
    <div className="context-devtools">
      <button onClick={() => setIsOpen(!isOpen)}>
        {name} Context {isOpen ? '▼' : '▶'}
      </button>
      {isOpen && (
        <pre>{JSON.stringify(value, null, 2)}</pre>
      )}
    </div>
  );
};

// 性能追踪Provider
const PerformanceProvider = ({ children, name }) => {
  const renderCount = useRef(0);
  const renderTime = useRef(Date.now());
  
  useEffect(() => {
    renderCount.current++;
    const now = Date.now();
    const timeSinceLastRender = now - renderTime.current;
    renderTime.current = now;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`${name} Provider rendered:`, {
        count: renderCount.current,
        timeSinceLastRender: `${timeSinceLastRender}ms`
      });
    }
  });
  
  return children;
};

// Context使用追踪
const useTrackedContext = (context, name) => {
  const value = useContext(context);
  
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`${name} context consumed in ${Component.name}`);
    }
  });
  
  return value;
};
```

## 🎯 Context最佳实践

### 1. 何时使用Context

```jsx
// ✅ 适合使用Context的场景
// 1. 跨组件共享的全局状态
const themes = { light: {}, dark: {} };
const ThemeContext = createContext(themes.light);

// 2. 避免prop drilling
const UserContext = createContext();
const PermissionsContext = createContext();

// 3. 注入依赖
const ApiContext = createContext();
const ConfigContext = createContext();

// ❌ 不适合使用Context的场景
// 1. 可以通过组合解决的问题
// 不要这样：
<FormContext.Provider value={formData}>
  <Form />
</FormContext.Provider>

// 而是这样：
<Form data={formData} />

// 2. 频繁更新的状态
// 不要把鼠标位置、滚动位置等放在Context中

// 3. 只有少数组件需要的数据
// 直接传props更简单
```

### 2. Context设计原则

```jsx
// 1. 单一职责原则
// ❌ 错误：一个Context管理所有状态
const AppContext = createContext({ 
  user: null, 
  theme: 'light', 
  cart: [], 
  notifications: [] 
});

// ✅ 正确：每个Context负责一个领域
const AuthContext = createContext();
const ThemeContext = createContext();
const CartContext = createContext();

// 2. 提供明确的API
// ✅ 好的设计
const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth必须在AuthProvider内部使用');
  }
  return context;
};

// 3. 避免过度嵌套
// 使用组合模式或工具函数来管理多个Provider

// 4. 考虑性能影响
// 拆分频繁更新和静态的数据
const ConfigContext = createContext(); // 静态配置
const StateContext = createContext();  // 动态状态
```

### 3. 错误处理和边界情况

```jsx
// Context错误边界
class ContextErrorBoundary extends Component {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error, errorInfo) {
    console.error('Context error:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback">
          <h2>状态管理出错</h2>
          <p>{this.state.error?.message}</p>
          <button onClick={() => window.location.reload()}>
            重新加载
          </button>
        </div>
      );
    }
    
    return this.props.children;
  }
}

// 在Provider中使用
export const AppProviders = ({ children }) => {
  return (
    <ContextErrorBoundary>
      <AuthProvider>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </AuthProvider>
    </ContextErrorBoundary>
  );
};
```

## 🎯 今日练习

1. **基础练习**：创建一个多语言切换系统，支持动态加载语言包
2. **进阶练习**：实现一个购物车Context，包含商品管理、优惠券、价格计算等功能
3. **挑战练习**：构建一个类似Redux的状态管理库，支持中间件、时间旅行调试等功能

## 🚀 下一步

明天我们将学习：
- Redux和Redux Toolkit入门
- 现代Redux开发模式
- 异步操作处理
- Redux DevTools使用
- 与React的集成

## 💭 思考题

1. Context API和Redux各自的优缺点是什么？如何选择？
2. 如何避免Context导致的性能问题？
3. 什么时候应该将状态提升到Context，什么时候保持在组件内部？
4. 如何设计一个可扩展的Context架构？
5. Context的未来发展方向是什么？（如React 18的并发特性）

记住：**Context API是React的强大特性，合理使用可以让状态管理变得简单优雅。关键是要理解它的适用场景和限制，避免过度使用！**