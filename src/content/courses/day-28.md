---
day: 28
phase: "react-development"
title: "React Hooks深入"
description: "全面掌握React Hooks系统，深入理解useState、useEffect、useContext等核心Hooks，学习性能优化和自定义Hooks开发"
objectives:
  - "深入理解Hooks的设计理念和工作原理"
  - "掌握useEffect的高级用法和最佳实践"
  - "学习Context和性能优化Hooks"
  - "理解useReducer处理复杂状态"
  - "开发可复用的自定义Hooks"
estimatedTime: 150
difficulty: "advanced"
prerequisites: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 25, 26, 27]
tags:
  - "React"
  - "Hooks"
  - "useState"
  - "useEffect"
  - "性能优化"
resources:
  - title: "React Hooks官方文档"
    url: "https://react.dev/reference/react"
    type: "documentation"
  - title: "深入理解React Hooks"
    url: "https://overreacted.io/a-complete-guide-to-useeffect/"
    type: "article"
  - title: "React Hooks最佳实践"
    url: "https://www.patterns.dev/react/hooks-pattern"
    type: "article"
  - title: "自定义Hooks集合"
    url: "https://usehooks.com/"
    type: "tool"
codeExamples:
  - title: "Hooks综合示例"
    language: "javascript"
    path: "/code-examples/day-28/hooks-examples.jsx"
  - title: "自定义Hooks库"
    language: "javascript"
    path: "/code-examples/day-28/custom-hooks.js"
---

# Day 28: React Hooks深入

## 📋 学习目标

Hooks是React 16.8引入的革命性特性，它让我们能够在函数组件中使用state和其他React特性。今天，我们将深入探索Hooks系统，掌握各种内置Hooks的高级用法，并学习如何创建自己的Hooks。

## 🌟 Hooks的设计理念

### 为什么需要Hooks？

```jsx
// 类组件的问题
class UserProfile extends React.Component {
  constructor(props) {
    super(props);
    this.state = { user: null, loading: true };
  }
  
  componentDidMount() {
    this.fetchUser();
    this.subscribeToUpdates();
  }
  
  componentDidUpdate(prevProps) {
    if (prevProps.userId !== this.props.userId) {
      this.fetchUser();
    }
  }
  
  componentWillUnmount() {
    this.unsubscribe();
  }
  
  // 逻辑分散在不同生命周期中...
}

// Hooks解决方案
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // 相关逻辑集中在一起
    const fetchUser = async () => {
      setLoading(true);
      const userData = await api.getUser(userId);
      setUser(userData);
      setLoading(false);
    };
    
    fetchUser();
    
    const unsubscribe = api.subscribeToUpdates(userId, setUser);
    return () => unsubscribe(); // 清理函数
  }, [userId]);
  
  // 更简洁、更易理解
}
```

### Hooks的优势

1. **逻辑复用**：通过自定义Hooks轻松共享逻辑
2. **代码组织**：相关逻辑集中，而非分散在生命周期中
3. **更简洁**：减少模板代码，更易读写
4. **类型推导**：更好的TypeScript支持
5. **测试友好**：纯函数更易测试

## 📊 useState深入

### 1. 函数式更新

```jsx
function Counter() {
  const [count, setCount] = useState(0);
  
  // ❌ 可能的问题：闭包陷阱
  const incrementThreeTimes = () => {
    setCount(count + 1); // count = 0
    setCount(count + 1); // count = 0
    setCount(count + 1); // count = 0
    // 结果：count = 1（不是3）
  };
  
  // ✅ 函数式更新
  const incrementThreeTimesCorrect = () => {
    setCount(prev => prev + 1); // prev = 0, return 1
    setCount(prev => prev + 1); // prev = 1, return 2
    setCount(prev => prev + 1); // prev = 2, return 3
    // 结果：count = 3
  };
  
  // 异步更新场景
  const delayedIncrement = () => {
    setTimeout(() => {
      // ❌ 使用的是3秒前的count值
      setCount(count + 1);
      
      // ✅ 始终基于最新值更新
      setCount(prev => prev + 1);
    }, 3000);
  };
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={incrementThreeTimesCorrect}>+3</button>
    </div>
  );
}
```

### 2. 惰性初始化

```jsx
// ❌ 每次渲染都会执行
function ExpensiveComponent() {
  const [data, setData] = useState(
    computeExpensiveInitialData() // 每次渲染都执行！
  );
  
  return <div>...</div>;
}

// ✅ 只在首次渲染时执行
function ExpensiveComponent() {
  const [data, setData] = useState(() => 
    computeExpensiveInitialData() // 只执行一次
  );
  
  return <div>...</div>;
}

// 实际应用：从localStorage读取
function Settings() {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('settings');
    return saved ? JSON.parse(saved) : defaultSettings;
  });
  
  const updateSettings = (newSettings) => {
    setSettings(newSettings);
    localStorage.setItem('settings', JSON.stringify(newSettings));
  };
  
  return <div>...</div>;
}
```

### 3. State设计模式

```jsx
// 1. 单一state vs 多个state
// ❌ 过度使用单一state
function Form() {
  const [state, setState] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
    newsletter: false,
    errors: {},
    isSubmitting: false
  });
  
  // 更新变得复杂
  const updateField = (field, value) => {
    setState(prev => ({ ...prev, [field]: value }));
  };
}

// ✅ 合理拆分state
function Form() {
  // 表单数据
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  // UI状态
  const [uiState, setUiState] = useState({
    agreeToTerms: false,
    newsletter: false,
    isSubmitting: false
  });
  
  // 验证错误
  const [errors, setErrors] = useState({});
  
  // 更清晰的更新逻辑
  const updateFormField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // 清除对应错误
    if (errors[field]) {
      setErrors(prev => {
        const { [field]: _, ...rest } = prev;
        return rest;
      });
    }
  };
}

// 2. 派生状态（不需要useState）
function PasswordStrength({ password }) {
  // ❌ 不需要的state
  const [strength, setStrength] = useState('weak');
  
  useEffect(() => {
    if (password.length < 6) setStrength('weak');
    else if (password.length < 10) setStrength('medium');
    else setStrength('strong');
  }, [password]);
  
  // ✅ 直接计算
  const strength = password.length < 6 ? 'weak' 
    : password.length < 10 ? 'medium' 
    : 'strong';
  
  return <div>密码强度：{strength}</div>;
}
```

## 🔄 useEffect精通

### 1. 理解依赖数组

```jsx
function SearchResults({ query, filters }) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // 1. 空依赖数组 - 只在挂载时执行
  useEffect(() => {
    console.log('组件挂载了');
    
    return () => {
      console.log('组件卸载了');
    };
  }, []); // 相当于 componentDidMount + componentWillUnmount
  
  // 2. 有依赖的effect
  useEffect(() => {
    // 当query或filters改变时执行
    const searchData = async () => {
      setLoading(true);
      try {
        const data = await api.search(query, filters);
        setResults(data);
      } finally {
        setLoading(false);
      }
    };
    
    if (query) {
      searchData();
    }
  }, [query, filters]); // 依赖项
  
  // 3. 没有依赖数组 - 每次渲染都执行（通常要避免）
  useEffect(() => {
    console.log('每次渲染都会执行');
  }); // 没有第二个参数
  
  // 4. 对象和函数作为依赖
  const searchConfig = { query, filters }; // 每次渲染都是新对象！
  
  useEffect(() => {
    // 这个effect会在每次渲染时执行！
    console.log('搜索配置:', searchConfig);
  }, [searchConfig]); // ❌ 对象引用每次都不同
  
  // ✅ 正确的做法
  useEffect(() => {
    console.log('搜索配置:', { query, filters });
  }, [query, filters]); // 依赖具体的值
}
```

### 2. 清理函数模式

```jsx
function useEventListener(element, event, handler) {
  useEffect(() => {
    // 确保element存在
    if (!element) return;
    
    // 添加事件监听
    element.addEventListener(event, handler);
    
    // 清理函数
    return () => {
      element.removeEventListener(event, handler);
    };
  }, [element, event, handler]);
}

// 使用示例
function ScrollTracker() {
  const [scrollY, setScrollY] = useState(0);
  
  useEventListener(window, 'scroll', () => {
    setScrollY(window.scrollY);
  });
  
  return <div>滚动位置：{scrollY}px</div>;
}

// 定时器清理
function Timer() {
  const [seconds, setSeconds] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);
    
    // 清理定时器
    return () => clearInterval(interval);
  }, []); // 只设置一次
  
  return <div>运行时间：{seconds}秒</div>;
}

// 取消请求
function UserData({ userId }) {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    // 创建AbortController
    const controller = new AbortController();
    
    const fetchUser = async () => {
      try {
        const response = await fetch(`/api/users/${userId}`, {
          signal: controller.signal
        });
        const data = await response.json();
        setUser(data);
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('获取用户失败:', error);
        }
      }
    };
    
    fetchUser();
    
    // 清理：取消请求
    return () => controller.abort();
  }, [userId]);
  
  return <div>{user?.name}</div>;
}
```

### 3. Effect的执行时机

```jsx
function EffectTiming() {
  const [count, setCount] = useState(0);
  
  // useLayoutEffect - 同步执行，阻塞渲染
  useLayoutEffect(() => {
    // 在DOM更新后、浏览器绘制前同步执行
    // 用于需要同步测量DOM的场景
    console.log('useLayoutEffect');
  });
  
  // useEffect - 异步执行，不阻塞渲染
  useEffect(() => {
    // 在浏览器绘制后异步执行
    // 大多数副作用应该使用这个
    console.log('useEffect');
  });
  
  console.log('render');
  
  // 执行顺序：render -> useLayoutEffect -> 浏览器绘制 -> useEffect
}

// useLayoutEffect的使用场景
function Tooltip({ children, text }) {
  const [show, setShow] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const targetRef = useRef(null);
  const tooltipRef = useRef(null);
  
  useLayoutEffect(() => {
    if (show && targetRef.current && tooltipRef.current) {
      // 同步计算位置，避免闪烁
      const targetRect = targetRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      
      setPosition({
        top: targetRect.top - tooltipRect.height - 5,
        left: targetRect.left + (targetRect.width - tooltipRect.width) / 2
      });
    }
  }, [show]);
  
  return (
    <>
      <span 
        ref={targetRef}
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      >
        {children}
      </span>
      {show && (
        <div 
          ref={tooltipRef}
          style={{ position: 'fixed', ...position }}
          className="tooltip"
        >
          {text}
        </div>
      )}
    </>
  );
}
```

## 🌐 useContext实战

### 1. Context基础使用

```jsx
// 创建Context
const ThemeContext = createContext();
const AuthContext = createContext();

// Context Provider组件
function AppProviders({ children }) {
  const [theme, setTheme] = useState('light');
  const [user, setUser] = useState(null);
  
  const themeValue = useMemo(() => ({
    theme,
    toggleTheme: () => setTheme(t => t === 'light' ? 'dark' : 'light')
  }), [theme]);
  
  const authValue = useMemo(() => ({
    user,
    login: async (credentials) => {
      const userData = await api.login(credentials);
      setUser(userData);
    },
    logout: () => {
      setUser(null);
      api.logout();
    }
  }), [user]);
  
  return (
    <ThemeContext.Provider value={themeValue}>
      <AuthContext.Provider value={authValue}>
        {children}
      </AuthContext.Provider>
    </ThemeContext.Provider>
  );
}

// 自定义Hook封装Context使用
function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme必须在ThemeProvider内使用');
  }
  return context;
}

function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth必须在AuthProvider内使用');
  }
  return context;
}

// 使用Context
function Header() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  
  return (
    <header className={`header-${theme}`}>
      {user ? (
        <>
          <span>欢迎，{user.name}</span>
          <button onClick={logout}>退出</button>
        </>
      ) : (
        <Link to="/login">登录</Link>
      )}
      <button onClick={toggleTheme}>
        {theme === 'light' ? '🌙' : '☀️'}
      </button>
    </header>
  );
}
```

### 2. Context性能优化

```jsx
// Context拆分 - 避免不必要的重渲染
const UserContext = createContext();
const UserDispatchContext = createContext();

function UserProvider({ children }) {
  const [user, dispatch] = useReducer(userReducer, null);
  
  // 分离state和dispatch，dispatch不会变化
  return (
    <UserContext.Provider value={user}>
      <UserDispatchContext.Provider value={dispatch}>
        {children}
      </UserDispatchContext.Provider>
    </UserContext.Provider>
  );
}

// 只订阅需要的部分
function UserName() {
  const user = useContext(UserContext); // 只在user变化时重渲染
  return <span>{user?.name}</span>;
}

function UserActions() {
  const dispatch = useContext(UserDispatchContext); // 永不重渲染
  return (
    <button onClick={() => dispatch({ type: 'logout' })}>
      退出
    </button>
  );
}
```

## ⚡ 性能优化Hooks

### 1. useMemo深入

```jsx
// useMemo - 缓存计算结果
function ExpensiveList({ items, filter }) {
  // ❌ 每次渲染都重新计算
  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(filter.toLowerCase())
  );
  
  // ✅ 只在依赖变化时重新计算
  const filteredItems = useMemo(() => 
    items.filter(item => 
      item.name.toLowerCase().includes(filter.toLowerCase())
    ),
    [items, filter]
  );
  
  // 复杂计算示例
  const statistics = useMemo(() => {
    console.log('计算统计数据...');
    return {
      total: items.length,
      completed: items.filter(item => item.completed).length,
      pending: items.filter(item => !item.completed).length,
      averageTime: items.reduce((sum, item) => sum + item.time, 0) / items.length
    };
  }, [items]);
  
  return (
    <div>
      <Stats {...statistics} />
      <ul>
        {filteredItems.map(item => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </div>
  );
}

// 何时使用useMemo
function WhenToUseMemo() {
  const [count, setCount] = useState(0);
  
  // ❌ 不需要memo化简单计算
  const doubled = useMemo(() => count * 2, [count]);
  
  // ✅ 需要memo化的场景
  // 1. 计算成本高
  const primeNumbers = useMemo(() => 
    calculatePrimesUpTo(count * 1000),
    [count]
  );
  
  // 2. 引用相等性很重要
  const chartData = useMemo(() => ({
    labels: ['A', 'B', 'C'],
    values: [count, count * 2, count * 3]
  }), [count]);
  
  return <Chart data={chartData} />; // Chart使用React.memo
}
```

### 2. useCallback深入

```jsx
// useCallback - 缓存函数引用
function TodoList({ todos }) {
  const [filter, setFilter] = useState('all');
  
  // ❌ 每次渲染创建新函数
  const handleToggle = (id) => {
    updateTodo(id, { completed: !todos.find(t => t.id === id).completed });
  };
  
  // ✅ 缓存函数引用
  const handleToggle = useCallback((id) => {
    updateTodo(id, { completed: !todos.find(t => t.id === id).completed });
  }, [todos, updateTodo]);
  
  // 与React.memo配合使用
  const filteredTodos = useMemo(() => {
    switch (filter) {
      case 'active': return todos.filter(t => !t.completed);
      case 'completed': return todos.filter(t => t.completed);
      default: return todos;
    }
  }, [todos, filter]);
  
  return (
    <div>
      <FilterButtons filter={filter} onChange={setFilter} />
      {filteredTodos.map(todo => (
        <TodoItem 
          key={todo.id}
          todo={todo}
          onToggle={handleToggle} // 保持引用稳定
        />
      ))}
    </div>
  );
}

// 优化的子组件
const TodoItem = React.memo(({ todo, onToggle }) => {
  console.log('TodoItem渲染:', todo.id);
  
  return (
    <div>
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
      />
      <span>{todo.text}</span>
    </div>
  );
});

// useCallback的陷阱
function CallbackPitfalls() {
  const [count, setCount] = useState(0);
  const [text, setText] = useState('');
  
  // ⚠️ 过度使用useCallback
  const increment = useCallback(() => {
    setCount(c => c + 1);
  }, []); // 没有外部依赖，可能不需要useCallback
  
  // ❌ 依赖项缺失
  const handleSubmit = useCallback(() => {
    console.log(text); // 会使用旧的text值！
  }, []); // 缺少text依赖
  
  // ✅ 正确的依赖
  const handleSubmit = useCallback(() => {
    console.log(text);
  }, [text]);
}
```

## 🔧 useReducer处理复杂状态

### 1. 基础使用

```jsx
// reducer函数
function todoReducer(state, action) {
  switch (action.type) {
    case 'ADD_TODO':
      return {
        ...state,
        todos: [...state.todos, {
          id: Date.now(),
          text: action.payload,
          completed: false
        }]
      };
    
    case 'TOGGLE_TODO':
      return {
        ...state,
        todos: state.todos.map(todo =>
          todo.id === action.payload
            ? { ...todo, completed: !todo.completed }
            : todo
        )
      };
    
    case 'DELETE_TODO':
      return {
        ...state,
        todos: state.todos.filter(todo => todo.id !== action.payload)
      };
    
    case 'SET_FILTER':
      return {
        ...state,
        filter: action.payload
      };
    
    default:
      return state;
  }
}

// 使用useReducer
function TodoApp() {
  const [state, dispatch] = useReducer(todoReducer, {
    todos: [],
    filter: 'all'
  });
  
  const addTodo = (text) => {
    dispatch({ type: 'ADD_TODO', payload: text });
  };
  
  const toggleTodo = (id) => {
    dispatch({ type: 'TOGGLE_TODO', payload: id });
  };
  
  const filteredTodos = useMemo(() => {
    switch (state.filter) {
      case 'active':
        return state.todos.filter(t => !t.completed);
      case 'completed':
        return state.todos.filter(t => t.completed);
      default:
        return state.todos;
    }
  }, [state.todos, state.filter]);
  
  return (
    <div>
      <TodoInput onAdd={addTodo} />
      <FilterBar 
        filter={state.filter}
        onChange={(filter) => dispatch({ type: 'SET_FILTER', payload: filter })}
      />
      <TodoList todos={filteredTodos} onToggle={toggleTodo} />
    </div>
  );
}
```

### 2. 高级模式

```jsx
// 带有中间件的useReducer
function useReducerWithMiddleware(reducer, initialState, middlewares = []) {
  const [state, dispatch] = useReducer(reducer, initialState);
  
  const enhancedDispatch = useMemo(() => {
    let dispatcher = dispatch;
    
    // 应用中间件
    middlewares.reverse().forEach(middleware => {
      const prevDispatcher = dispatcher;
      dispatcher = (action) => middleware(state, action, prevDispatcher);
    });
    
    return dispatcher;
  }, [state, middlewares]);
  
  return [state, enhancedDispatch];
}

// 日志中间件
const loggerMiddleware = (state, action, next) => {
  console.group(action.type);
  console.log('Previous State:', state);
  console.log('Action:', action);
  next(action);
  console.log('Next State:', state);
  console.groupEnd();
};

// Thunk中间件（支持异步action）
const thunkMiddleware = (state, action, next) => {
  if (typeof action === 'function') {
    return action(next, state);
  }
  return next(action);
};

// 使用增强的reducer
function EnhancedTodoApp() {
  const [state, dispatch] = useReducerWithMiddleware(
    todoReducer,
    initialState,
    [loggerMiddleware, thunkMiddleware]
  );
  
  // 支持异步action
  const fetchTodos = async () => {
    dispatch(async (dispatch, state) => {
      dispatch({ type: 'FETCH_START' });
      try {
        const todos = await api.getTodos();
        dispatch({ type: 'FETCH_SUCCESS', payload: todos });
      } catch (error) {
        dispatch({ type: 'FETCH_ERROR', payload: error.message });
      }
    });
  };
  
  return <div>...</div>;
}
```

## 📌 useRef高级应用

### 1. DOM引用和操作

```jsx
// 基础DOM引用
function TextInput() {
  const inputRef = useRef(null);
  
  const focusInput = () => {
    inputRef.current?.focus();
  };
  
  return (
    <>
      <input ref={inputRef} />
      <button onClick={focusInput}>聚焦输入框</button>
    </>
  );
}

// 多个引用的管理
function FormWithRefs() {
  const formRefs = useRef({});
  
  const registerRef = (name) => (el) => {
    formRefs.current[name] = el;
  };
  
  const focusFirstError = (errors) => {
    const firstErrorField = Object.keys(errors)[0];
    formRefs.current[firstErrorField]?.focus();
  };
  
  return (
    <form>
      <input ref={registerRef('username')} name="username" />
      <input ref={registerRef('email')} name="email" />
      <input ref={registerRef('password')} name="password" />
    </form>
  );
}

// 动态引用列表
function DynamicRefs() {
  const itemRefs = useRef(new Map());
  const [items, setItems] = useState([1, 2, 3]);
  
  const scrollToItem = (id) => {
    const element = itemRefs.current.get(id);
    element?.scrollIntoView({ behavior: 'smooth' });
  };
  
  return (
    <div>
      {items.map(id => (
        <div
          key={id}
          ref={el => {
            if (el) {
              itemRefs.current.set(id, el);
            } else {
              itemRefs.current.delete(id);
            }
          }}
        >
          Item {id}
        </div>
      ))}
    </div>
  );
}
```

### 2. 存储可变值

```jsx
// 存储前一个值
function usePrevious(value) {
  const ref = useRef();
  
  useEffect(() => {
    ref.current = value;
  });
  
  return ref.current;
}

// 使用示例
function Counter() {
  const [count, setCount] = useState(0);
  const prevCount = usePrevious(count);
  
  return (
    <div>
      <p>当前：{count}，之前：{prevCount ?? 'N/A'}</p>
      <button onClick={() => setCount(count + 1)}>增加</button>
    </div>
  );
}

// 存储定时器ID
function useInterval(callback, delay) {
  const savedCallback = useRef();
  const intervalId = useRef();
  
  // 保存最新的callback
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);
  
  // 设置定时器
  useEffect(() => {
    if (delay !== null) {
      const tick = () => savedCallback.current();
      intervalId.current = setInterval(tick, delay);
      
      return () => clearInterval(intervalId.current);
    }
  }, [delay]);
  
  // 返回控制函数
  return {
    clear: () => clearInterval(intervalId.current),
    restart: () => {
      clearInterval(intervalId.current);
      if (delay !== null) {
        intervalId.current = setInterval(() => savedCallback.current(), delay);
      }
    }
  };
}

// 标记组件是否已卸载
function useIsMounted() {
  const isMounted = useRef(true);
  
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  return isMounted;
}

// 安全的异步操作
function SafeAsyncComponent() {
  const [data, setData] = useState(null);
  const isMounted = useIsMounted();
  
  const fetchData = async () => {
    const result = await api.getData();
    
    // 只在组件仍然挂载时更新state
    if (isMounted.current) {
      setData(result);
    }
  };
  
  return <div>...</div>;
}
```

## 🎨 自定义Hooks开发

### 1. 基础自定义Hooks

```jsx
// useLocalStorage - 持久化state
function useLocalStorage(key, initialValue) {
  // 从localStorage读取初始值
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error loading localStorage key "${key}":`, error);
      return initialValue;
    }
  });
  
  // 包装的setter函数
  const setValue = useCallback((value) => {
    try {
      // 允许函数式更新
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
      
      // 触发其他标签页的更新
      window.dispatchEvent(new Event('storage'));
    } catch (error) {
      console.error(`Error saving localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);
  
  // 监听其他标签页的变化
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === key && e.newValue) {
        setStoredValue(JSON.parse(e.newValue));
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);
  
  return [storedValue, setValue];
}

// useDebounce - 防抖值
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => clearTimeout(timer);
  }, [value, delay]);
  
  return debouncedValue;
}

// useThrottle - 节流值
function useThrottle(value, limit) {
  const [throttledValue, setThrottledValue] = useState(value);
  const lastRun = useRef(Date.now());
  
  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRun.current >= limit) {
        setThrottledValue(value);
        lastRun.current = Date.now();
      }
    }, limit - (Date.now() - lastRun.current));
    
    return () => clearTimeout(handler);
  }, [value, limit]);
  
  return throttledValue;
}
```

### 2. 高级自定义Hooks

```jsx
// useFetch - 数据获取Hook
function useFetch(url, options = {}) {
  const [state, setState] = useState({
    data: null,
    loading: true,
    error: null
  });
  
  const cancelRequest = useRef(null);
  
  const fetch = useCallback(async (fetchUrl = url, fetchOptions = options) => {
    // 取消之前的请求
    if (cancelRequest.current) {
      cancelRequest.current();
    }
    
    setState({ data: null, loading: true, error: null });
    
    try {
      const controller = new AbortController();
      cancelRequest.current = () => controller.abort();
      
      const response = await fetch(fetchUrl, {
        ...fetchOptions,
        signal: controller.signal
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      setState({ data, loading: false, error: null });
      return data;
    } catch (error) {
      if (error.name !== 'AbortError') {
        setState({ data: null, loading: false, error });
      }
      throw error;
    }
  }, [url, options]);
  
  useEffect(() => {
    fetch();
    
    return () => {
      if (cancelRequest.current) {
        cancelRequest.current();
      }
    };
  }, [fetch]);
  
  return { ...state, refetch: fetch };
}

// useInfiniteScroll - 无限滚动
function useInfiniteScroll(callback, options = {}) {
  const { threshold = 100, rootMargin = '0px' } = options;
  const [loading, setLoading] = useState(false);
  const observer = useRef(null);
  const lastElementRef = useCallback(node => {
    if (loading) return;
    
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !loading) {
        setLoading(true);
        callback().finally(() => setLoading(false));
      }
    }, { rootMargin, threshold: threshold / 100 });
    
    if (node) observer.current.observe(node);
  }, [loading, callback, rootMargin, threshold]);
  
  return [lastElementRef, loading];
}

// useWebSocket - WebSocket连接
function useWebSocket(url, options = {}) {
  const [messages, setMessages] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const ws = useRef(null);
  
  const sendMessage = useCallback((message) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    }
  }, []);
  
  useEffect(() => {
    ws.current = new WebSocket(url);
    
    ws.current.onopen = () => {
      setConnectionStatus('connected');
      options.onOpen?.();
    };
    
    ws.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setMessages(prev => [...prev, message]);
      options.onMessage?.(message);
    };
    
    ws.current.onclose = () => {
      setConnectionStatus('disconnected');
      options.onClose?.();
    };
    
    ws.current.onerror = (error) => {
      setConnectionStatus('error');
      options.onError?.(error);
    };
    
    return () => {
      ws.current?.close();
    };
  }, [url]);
  
  return {
    messages,
    sendMessage,
    connectionStatus,
    clearMessages: () => setMessages([])
  };
}
```

### 3. 组合Hooks模式

```jsx
// 组合多个Hooks创建复杂功能
function useAuth() {
  const [user, setUser] = useLocalStorage('user', null);
  const [token, setToken] = useLocalStorage('token', null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const login = useCallback(async (credentials) => {
    setLoading(true);
    try {
      const { user, token } = await api.login(credentials);
      setUser(user);
      setToken(token);
      api.setAuthToken(token);
      navigate('/dashboard');
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setUser, setToken, navigate]);
  
  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    api.setAuthToken(null);
    navigate('/login');
  }, [setUser, setToken, navigate]);
  
  // 自动设置token
  useEffect(() => {
    if (token) {
      api.setAuthToken(token);
    }
  }, [token]);
  
  return {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated: !!user
  };
}

// 表单处理Hook
function useForm(initialValues, validate) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setValues(prev => ({ ...prev, [name]: newValue }));
    
    // 清除错误
    if (errors[name]) {
      setErrors(prev => {
        const { [name]: _, ...rest } = prev;
        return rest;
      });
    }
  }, [errors]);
  
  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // 验证单个字段
    if (validate) {
      const fieldError = validate({ [name]: values[name] })[name];
      if (fieldError) {
        setErrors(prev => ({ ...prev, [name]: fieldError }));
      }
    }
  }, [values, validate]);
  
  const handleSubmit = useCallback((onSubmit) => async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // 验证所有字段
    if (validate) {
      const validationErrors = validate(values);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        setTouched(
          Object.keys(values).reduce((acc, key) => ({ ...acc, [key]: true }), {})
        );
        setIsSubmitting(false);
        return;
      }
    }
    
    try {
      await onSubmit(values);
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validate]);
  
  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);
  
  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    setValues,
    setErrors
  };
}
```

## 💼 实战项目：数据仪表板

### 完整的数据仪表板应用

```jsx
// 主应用组件
function DataDashboard() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [metrics, setMetrics] = useState([]);
  
  // 获取数据
  const { data: dashboardData, loading, error, refetch } = useFetch(
    `/api/dashboard?userId=${user.id}`,
    { dependencies: [dateRange] }
  );
  
  // WebSocket实时更新
  const { messages, connectionStatus } = useWebSocket(
    `wss://api.example.com/realtime/${user.id}`
  );
  
  // 处理实时消息
  useEffect(() => {
    if (messages.length > 0) {
      const latestMessage = messages[messages.length - 1];
      if (latestMessage.type === 'metric_update') {
        setMetrics(prev => updateMetric(prev, latestMessage.data));
      }
    }
  }, [messages]);
  
  // 计算统计数据
  const statistics = useMemo(() => {
    if (!dashboardData) return null;
    
    return {
      totalRevenue: dashboardData.transactions.reduce((sum, t) => sum + t.amount, 0),
      totalUsers: dashboardData.users.length,
      activeUsers: dashboardData.users.filter(u => u.lastActive > Date.now() - 86400000).length,
      conversionRate: (dashboardData.conversions / dashboardData.visits * 100).toFixed(2)
    };
  }, [dashboardData]);
  
  // 自动刷新
  useInterval(() => {
    refetch();
  }, 30000); // 每30秒刷新
  
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return (
    <div className={`dashboard theme-${theme}`}>
      <Header 
        user={user} 
        connectionStatus={connectionStatus}
      />
      
      <DateRangePicker 
        value={dateRange}
        onChange={setDateRange}
      />
      
      <div className="dashboard-grid">
        <StatCard 
          title="总收入"
          value={`￥${statistics.totalRevenue.toLocaleString()}`}
          trend={calculateTrend(dashboardData.revenueHistory)}
        />
        
        <StatCard 
          title="活跃用户"
          value={statistics.activeUsers}
          total={statistics.totalUsers}
          percentage={(statistics.activeUsers / statistics.totalUsers * 100).toFixed(1)}
        />
        
        <StatCard 
          title="转化率"
          value={`${statistics.conversionRate}%`}
          target={5.0}
        />
      </div>
      
      <div className="charts-section">
        <RevenueChart data={dashboardData.revenueHistory} />
        <UserActivityChart data={dashboardData.userActivity} />
        <ConversionFunnel data={dashboardData.funnelData} />
      </div>
      
      <RealtimeMetrics metrics={metrics} />
    </div>
  );
}

// 实时指标组件
function RealtimeMetrics({ metrics }) {
  const [displayMetrics, setDisplayMetrics] = useState([]);
  const containerRef = useRef(null);
  
  // 平滑动画更新
  useEffect(() => {
    const newMetrics = metrics.slice(-10); // 只显示最新10个
    setDisplayMetrics(newMetrics);
  }, [metrics]);
  
  // 自动滚动到最新
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [displayMetrics]);
  
  return (
    <div className="realtime-metrics" ref={containerRef}>
      <h3>实时指标</h3>
      <div className="metrics-list">
        {displayMetrics.map((metric, index) => (
          <MetricItem 
            key={metric.id}
            metric={metric}
            isNew={index === displayMetrics.length - 1}
          />
        ))}
      </div>
    </div>
  );
}

// 性能优化的图表组件
const RevenueChart = React.memo(({ data }) => {
  const chartRef = useRef(null);
  const [chart, setChart] = useState(null);
  
  // 初始化图表
  useLayoutEffect(() => {
    if (!chartRef.current) return;
    
    const newChart = new Chart(chartRef.current, {
      type: 'line',
      data: formatChartData(data),
      options: chartOptions
    });
    
    setChart(newChart);
    
    return () => newChart.destroy();
  }, []);
  
  // 更新数据
  useEffect(() => {
    if (chart && data) {
      chart.data = formatChartData(data);
      chart.update('none'); // 无动画更新
    }
  }, [chart, data]);
  
  return <canvas ref={chartRef} />;
});
```

## 🎯 今日练习

1. **基础练习**：创建一个完整的表单系统，使用自定义Hook处理验证和提交
2. **进阶练习**：实现一个音乐播放器，综合使用多种Hooks管理播放状态
3. **挑战练习**：构建一个实时聊天应用，包含WebSocket连接、消息历史和在线状态

## 🚀 下一步

明天我们将学习：
- React Router v6路由系统
- 路由配置和嵌套路由
- 路由守卫和权限控制
- 代码分割和懒加载
- 路由动画和过渡效果

## 💭 思考题

1. Hooks的规则为什么如此严格？违反规则会导致什么问题？
2. useEffect和useLayoutEffect的区别是什么？各适用于什么场景？
3. 什么时候应该使用useReducer而不是useState？
4. 如何避免自定义Hook的过度抽象？
5. React为什么选择Hooks而不是其他状态管理方案？

记住：**Hooks不仅是React的特性，更是一种思维方式。掌握Hooks，就掌握了现代React开发的精髓！**