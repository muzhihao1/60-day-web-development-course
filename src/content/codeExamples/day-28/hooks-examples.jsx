---
title: "React Hooks综合示例"
description: "深入展示React Hooks的各种用法和最佳实践"
category: "react"
language: "javascript"
day: 28
concepts:
  - "useState高级用法"
  - "useEffect深入"
  - "性能优化Hooks"
  - "useContext实战"
  - "useReducer模式"
relatedTopics:
  - "React Hooks"
  - "函数组件"
  - "状态管理"
---

# React Hooks综合示例

## useState深入示例

### 函数式更新和批量更新

```jsx
import React, { useState, useEffect, useCallback, useMemo, useContext, useReducer, useRef, useLayoutEffect } from 'react';

// 1. 函数式更新避免闭包陷阱
function Counter() {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // ❌ 闭包陷阱示例
  const incrementWrong = () => {
    setTimeout(() => {
      // 这里的count是3秒前的值
      setCount(count + 1);
    }, 3000);
  };
  
  // ✅ 使用函数式更新
  const incrementCorrect = () => {
    setTimeout(() => {
      // 始终基于最新值更新
      setCount(prev => prev + 1);
    }, 3000);
  };
  
  // 批量更新示例
  const handleMultipleUpdates = () => {
    setCount(c => c + 1);
    setCount(c => c + 1);
    setCount(c => c + 1);
    // React 18自动批处理，只触发一次重渲染
  };
  
  // 异步批量更新
  const handleAsyncBatch = async () => {
    setLoading(true);
    await fetch('/api/data');
    
    // React 18中也会批处理
    setCount(c => c + 1);
    setLoading(false);
  };
  
  return (
    <div>
      <h3>计数器：{count}</h3>
      <button onClick={incrementCorrect}>延迟+1（正确）</button>
      <button onClick={handleMultipleUpdates}>批量+3</button>
      <button onClick={handleAsyncBatch} disabled={loading}>
        {loading ? '加载中...' : '异步更新'}
      </button>
    </div>
  );
}

// 2. 惰性初始化
function ExpensiveInitExample() {
  // ❌ 每次渲染都会执行
  const [expensiveData] = useState(calculateExpensiveData());
  
  // ✅ 只在首次渲染时执行
  const [lazyData] = useState(() => {
    console.log('计算初始数据...只执行一次');
    return calculateExpensiveData();
  });
  
  // 实际应用：从localStorage读取配置
  const [userPreferences, setUserPreferences] = useState(() => {
    const saved = localStorage.getItem('userPreferences');
    return saved ? JSON.parse(saved) : {
      theme: 'light',
      language: 'zh-CN',
      fontSize: 16,
      autoSave: true
    };
  });
  
  const updatePreference = (key, value) => {
    setUserPreferences(prev => {
      const updated = { ...prev, [key]: value };
      localStorage.setItem('userPreferences', JSON.stringify(updated));
      return updated;
    });
  };
  
  return (
    <div>
      <h3>用户偏好设置</h3>
      <select 
        value={userPreferences.theme}
        onChange={(e) => updatePreference('theme', e.target.value)}
      >
        <option value="light">浅色</option>
        <option value="dark">深色</option>
      </select>
      <input
        type="range"
        min="12"
        max="24"
        value={userPreferences.fontSize}
        onChange={(e) => updatePreference('fontSize', Number(e.target.value))}
      />
      <span>字体大小：{userPreferences.fontSize}px</span>
    </div>
  );
}

// 3. 复杂State管理模式
function ComplexForm() {
  // 拆分相关的state
  const [personalInfo, setPersonalInfo] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });
  
  const [addressInfo, setAddressInfo] = useState({
    street: '',
    city: '',
    zipCode: ''
  });
  
  const [formStatus, setFormStatus] = useState({
    isSubmitting: false,
    errors: {},
    touched: {}
  });
  
  // 通用的字段更新函数
  const updatePersonalField = (field, value) => {
    setPersonalInfo(prev => ({ ...prev, [field]: value }));
    // 清除该字段的错误
    if (formStatus.errors[field]) {
      setFormStatus(prev => ({
        ...prev,
        errors: { ...prev.errors, [field]: undefined }
      }));
    }
  };
  
  const updateAddressField = (field, value) => {
    setAddressInfo(prev => ({ ...prev, [field]: value }));
  };
  
  // 验证函数
  const validateForm = () => {
    const errors = {};
    
    if (!personalInfo.firstName) errors.firstName = '名字必填';
    if (!personalInfo.email) errors.email = '邮箱必填';
    else if (!/\S+@\S+\.\S+/.test(personalInfo.email)) {
      errors.email = '邮箱格式不正确';
    }
    
    return errors;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormStatus(prev => ({ ...prev, errors }));
      return;
    }
    
    setFormStatus(prev => ({ ...prev, isSubmitting: true }));
    
    try {
      await submitForm({ ...personalInfo, ...addressInfo });
      alert('提交成功！');
    } catch (error) {
      console.error('提交失败:', error);
    } finally {
      setFormStatus(prev => ({ ...prev, isSubmitting: false }));
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <h3>复杂表单示例</h3>
      
      <fieldset>
        <legend>个人信息</legend>
        <input
          placeholder="名字"
          value={personalInfo.firstName}
          onChange={(e) => updatePersonalField('firstName', e.target.value)}
        />
        {formStatus.errors.firstName && (
          <span className="error">{formStatus.errors.firstName}</span>
        )}
        
        <input
          placeholder="邮箱"
          value={personalInfo.email}
          onChange={(e) => updatePersonalField('email', e.target.value)}
        />
        {formStatus.errors.email && (
          <span className="error">{formStatus.errors.email}</span>
        )}
      </fieldset>
      
      <fieldset>
        <legend>地址信息</legend>
        <input
          placeholder="街道"
          value={addressInfo.street}
          onChange={(e) => updateAddressField('street', e.target.value)}
        />
        <input
          placeholder="城市"
          value={addressInfo.city}
          onChange={(e) => updateAddressField('city', e.target.value)}
        />
      </fieldset>
      
      <button type="submit" disabled={formStatus.isSubmitting}>
        {formStatus.isSubmitting ? '提交中...' : '提交'}
      </button>
    </form>
  );
}
```

## useEffect精通示例

### 依赖管理和清理模式

```jsx
// 1. 完整的数据获取模式
function DataFetcher({ userId }) {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // 获取用户数据
  useEffect(() => {
    let cancelled = false;
    
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const userResponse = await fetch(`/api/users/${userId}`);
        if (!userResponse.ok) throw new Error('用户获取失败');
        
        const userData = await userResponse.json();
        
        if (!cancelled) {
          setUser(userData);
        }
        
        // 获取用户的帖子
        const postsResponse = await fetch(`/api/users/${userId}/posts`);
        const postsData = await postsResponse.json();
        
        if (!cancelled) {
          setPosts(postsData);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    
    fetchUserData();
    
    // 清理函数
    return () => {
      cancelled = true;
    };
  }, [userId]); // 依赖userId
  
  if (loading) return <div>加载中...</div>;
  if (error) return <div>错误：{error}</div>;
  
  return (
    <div>
      <h3>{user?.name}</h3>
      <ul>
        {posts.map(post => (
          <li key={post.id}>{post.title}</li>
        ))}
      </ul>
    </div>
  );
}

// 2. 事件监听器和定时器管理
function WindowTracker() {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // 窗口大小监听
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    
    // 防抖处理
    let resizeTimer;
    const debouncedResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(handleResize, 200);
    };
    
    window.addEventListener('resize', debouncedResize);
    
    return () => {
      window.removeEventListener('resize', debouncedResize);
      clearTimeout(resizeTimer);
    };
  }, []); // 空依赖，只运行一次
  
  // 滚动位置监听
  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };
    
    // 节流处理
    let scrollTimer;
    let lastScrollTime = 0;
    const throttledScroll = () => {
      const now = Date.now();
      if (now - lastScrollTime >= 100) {
        handleScroll();
        lastScrollTime = now;
      } else {
        clearTimeout(scrollTimer);
        scrollTimer = setTimeout(() => {
          handleScroll();
          lastScrollTime = Date.now();
        }, 100 - (now - lastScrollTime));
      }
    };
    
    window.addEventListener('scroll', throttledScroll);
    
    return () => {
      window.removeEventListener('scroll', throttledScroll);
      clearTimeout(scrollTimer);
    };
  }, []);
  
  // 网络状态监听
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  return (
    <div>
      <h3>窗口信息</h3>
      <p>尺寸：{windowSize.width} x {windowSize.height}</p>
      <p>滚动位置：{scrollPosition}px</p>
      <p>网络状态：{isOnline ? '在线' : '离线'}</p>
    </div>
  );
}

// 3. WebSocket连接管理
function ChatRoom({ roomId }) {
  const [messages, setMessages] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const wsRef = useRef(null);
  
  useEffect(() => {
    // 创建WebSocket连接
    const ws = new WebSocket(`wss://chat.example.com/rooms/${roomId}`);
    wsRef.current = ws;
    
    ws.onopen = () => {
      console.log('WebSocket连接已建立');
      setConnectionStatus('connected');
    };
    
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setMessages(prev => [...prev, message]);
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket错误:', error);
      setConnectionStatus('error');
    };
    
    ws.onclose = () => {
      console.log('WebSocket连接已关闭');
      setConnectionStatus('disconnected');
    };
    
    // 清理：关闭连接
    return () => {
      ws.close();
    };
  }, [roomId]);
  
  const sendMessage = (text) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'message',
        text,
        timestamp: Date.now()
      }));
    }
  };
  
  return (
    <div>
      <h3>聊天室 {roomId}</h3>
      <div className="status">状态：{connectionStatus}</div>
      <div className="messages">
        {messages.map((msg, index) => (
          <div key={index}>{msg.text}</div>
        ))}
      </div>
      <MessageInput onSend={sendMessage} disabled={connectionStatus !== 'connected'} />
    </div>
  );
}

// 4. useLayoutEffect vs useEffect
function LayoutEffectExample() {
  const [show, setShow] = useState(false);
  const [tooltipHeight, setTooltipHeight] = useState(0);
  const tooltipRef = useRef(null);
  
  // useLayoutEffect - 同步执行，避免闪烁
  useLayoutEffect(() => {
    if (show && tooltipRef.current) {
      // 在浏览器绘制前测量和设置位置
      const height = tooltipRef.current.getBoundingClientRect().height;
      setTooltipHeight(height);
    }
  }, [show]);
  
  // useEffect - 异步执行
  useEffect(() => {
    console.log('useEffect: 工具提示高度', tooltipHeight);
    // 这里执行不影响布局的操作
  }, [tooltipHeight]);
  
  return (
    <div>
      <button 
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      >
        悬停显示提示
      </button>
      
      {show && (
        <div 
          ref={tooltipRef}
          style={{
            position: 'absolute',
            bottom: tooltipHeight + 10, // 使用测量的高度
            background: '#333',
            color: 'white',
            padding: '8px',
            borderRadius: '4px'
          }}
        >
          这是一个工具提示
        </div>
      )}
    </div>
  );
}
```

## 性能优化Hooks

### useMemo和useCallback实战

```jsx
// 1. useMemo优化计算密集型操作
function DataAnalytics({ data, filters }) {
  // ❌ 每次渲染都重新计算
  const expensiveStats = calculateStatistics(data);
  
  // ✅ 只在data变化时重新计算
  const statistics = useMemo(() => {
    console.log('计算统计数据...');
    return {
      total: data.length,
      average: data.reduce((sum, item) => sum + item.value, 0) / data.length,
      min: Math.min(...data.map(item => item.value)),
      max: Math.max(...data.map(item => item.value)),
      median: calculateMedian(data.map(item => item.value))
    };
  }, [data]);
  
  // 过滤数据
  const filteredData = useMemo(() => {
    console.log('过滤数据...');
    let result = data;
    
    if (filters.minValue) {
      result = result.filter(item => item.value >= filters.minValue);
    }
    if (filters.maxValue) {
      result = result.filter(item => item.value <= filters.maxValue);
    }
    if (filters.category) {
      result = result.filter(item => item.category === filters.category);
    }
    
    return result;
  }, [data, filters]);
  
  // 图表配置
  const chartConfig = useMemo(() => ({
    type: 'line',
    data: {
      labels: filteredData.map(item => item.date),
      datasets: [{
        label: '数值',
        data: filteredData.map(item => item.value),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: `数据分析 (共${filteredData.length}条)`
        }
      }
    }
  }), [filteredData]);
  
  return (
    <div>
      <h3>数据统计</h3>
      <div className="stats">
        <div>总数：{statistics.total}</div>
        <div>平均值：{statistics.average.toFixed(2)}</div>
        <div>范围：{statistics.min} - {statistics.max}</div>
      </div>
      <Chart config={chartConfig} />
    </div>
  );
}

// 2. useCallback优化事件处理
function TodoList({ initialTodos }) {
  const [todos, setTodos] = useState(initialTodos);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  
  // ✅ 稳定的回调函数
  const addTodo = useCallback((text) => {
    setTodos(prev => [...prev, {
      id: Date.now(),
      text,
      completed: false,
      createdAt: new Date()
    }]);
  }, []); // 没有外部依赖
  
  const toggleTodo = useCallback((id) => {
    setTodos(prev => prev.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  }, []);
  
  const deleteTodo = useCallback((id) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
  }, []);
  
  // 带依赖的回调
  const updateTodoText = useCallback((id, newText) => {
    setTodos(prev => prev.map(todo =>
      todo.id === id ? { ...todo, text: newText } : todo
    ));
  }, []); // 使用函数式更新，不需要todos依赖
  
  // 过滤和排序
  const processedTodos = useMemo(() => {
    let result = [...todos];
    
    // 过滤
    switch (filter) {
      case 'active':
        result = result.filter(todo => !todo.completed);
        break;
      case 'completed':
        result = result.filter(todo => todo.completed);
        break;
    }
    
    // 排序
    result.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return b.createdAt - a.createdAt;
        case 'text':
          return a.text.localeCompare(b.text);
        case 'status':
          return a.completed - b.completed;
        default:
          return 0;
      }
    });
    
    return result;
  }, [todos, filter, sortBy]);
  
  return (
    <div>
      <h3>待办事项</h3>
      <TodoInput onAdd={addTodo} />
      
      <div className="controls">
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">全部</option>
          <option value="active">未完成</option>
          <option value="completed">已完成</option>
        </select>
        
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="date">按日期</option>
          <option value="text">按名称</option>
          <option value="status">按状态</option>
        </select>
      </div>
      
      <ul>
        {processedTodos.map(todo => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onToggle={toggleTodo}
            onDelete={deleteTodo}
            onUpdate={updateTodoText}
          />
        ))}
      </ul>
    </div>
  );
}

// 优化的子组件
const TodoItem = React.memo(({ todo, onToggle, onDelete, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);
  
  console.log('TodoItem render:', todo.id);
  
  const handleSave = () => {
    onUpdate(todo.id, editText);
    setIsEditing(false);
  };
  
  return (
    <li>
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
      />
      
      {isEditing ? (
        <>
          <input
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSave()}
          />
          <button onClick={handleSave}>保存</button>
          <button onClick={() => setIsEditing(false)}>取消</button>
        </>
      ) : (
        <>
          <span 
            style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}
            onDoubleClick={() => setIsEditing(true)}
          >
            {todo.text}
          </span>
          <button onClick={() => onDelete(todo.id)}>删除</button>
        </>
      )}
    </li>
  );
});
```

## useContext实战

### 主题系统和认证管理

```jsx
// 1. 创建Context
const ThemeContext = React.createContext();
const AuthContext = React.createContext();
const NotificationContext = React.createContext();

// 2. 主题Provider
function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    // 从localStorage读取主题
    return localStorage.getItem('theme') || 'light';
  });
  
  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      const newTheme = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', newTheme);
      // 更新CSS变量
      document.documentElement.setAttribute('data-theme', newTheme);
      return newTheme;
    });
  }, []);
  
  const setCustomTheme = useCallback((customTheme) => {
    setTheme(customTheme);
    localStorage.setItem('theme', customTheme);
    document.documentElement.setAttribute('data-theme', customTheme);
  }, []);
  
  // 监听系统主题变化
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e) => {
      if (theme === 'auto') {
        const systemTheme = e.matches ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', systemTheme);
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);
  
  const value = useMemo(() => ({
    theme,
    toggleTheme,
    setCustomTheme,
    themes: ['light', 'dark', 'auto']
  }), [theme, toggleTheme, setCustomTheme]);
  
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// 3. 认证Provider
function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // 检查已登录状态
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (token) {
          const response = await fetch('/api/auth/verify', {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
          } else {
            localStorage.removeItem('authToken');
          }
        }
      } catch (err) {
        console.error('Auth check failed:', err);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);
  
  const login = useCallback(async (credentials) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      
      if (!response.ok) {
        throw new Error('登录失败');
      }
      
      const { user, token } = await response.json();
      localStorage.setItem('authToken', token);
      setUser(user);
      
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);
  
  const logout = useCallback(() => {
    localStorage.removeItem('authToken');
    setUser(null);
    // 可选：调用登出API
    fetch('/api/auth/logout', { method: 'POST' });
  }, []);
  
  const updateProfile = useCallback(async (updates) => {
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(updates)
      });
      
      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
        return { success: true };
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);
  
  const value = useMemo(() => ({
    user,
    loading,
    error,
    login,
    logout,
    updateProfile,
    isAuthenticated: !!user
  }), [user, loading, error, login, logout, updateProfile]);
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// 4. 通知系统Provider
function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  
  const addNotification = useCallback((notification) => {
    const id = Date.now();
    const newNotification = {
      id,
      ...notification,
      createdAt: new Date()
    };
    
    setNotifications(prev => [...prev, newNotification]);
    
    // 自动移除
    if (notification.duration !== 0) {
      setTimeout(() => {
        removeNotification(id);
      }, notification.duration || 5000);
    }
    
    return id;
  }, []);
  
  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);
  
  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);
  
  const value = useMemo(() => ({
    notifications,
    add: addNotification,
    remove: removeNotification,
    clearAll,
    // 便捷方法
    success: (message, options) => addNotification({ type: 'success', message, ...options }),
    error: (message, options) => addNotification({ type: 'error', message, ...options }),
    warning: (message, options) => addNotification({ type: 'warning', message, ...options }),
    info: (message, options) => addNotification({ type: 'info', message, ...options })
  }), [notifications, addNotification, removeNotification, clearAll]);
  
  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationContainer notifications={notifications} onRemove={removeNotification} />
    </NotificationContext.Provider>
  );
}

// 5. 自定义Hooks访问Context
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

function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications必须在NotificationProvider内使用');
  }
  return context;
}

// 6. 使用Context的组件
function Header() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout, isAuthenticated } = useAuth();
  const { info } = useNotifications();
  
  const handleLogout = () => {
    logout();
    info('已成功登出');
  };
  
  return (
    <header className={`header theme-${theme}`}>
      <h1>我的应用</h1>
      
      <nav>
        {isAuthenticated ? (
          <>
            <span>欢迎，{user.name}</span>
            <button onClick={handleLogout}>登出</button>
          </>
        ) : (
          <Link to="/login">登录</Link>
        )}
        
        <button onClick={toggleTheme}>
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
      </nav>
    </header>
  );
}
```

## useReducer处理复杂状态

### 购物车和表单管理

```jsx
// 1. 购物车Reducer
const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM':
      const existingItem = state.items.find(item => item.id === action.payload.id);
      
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
          total: state.total + action.payload.price
        };
      }
      
      return {
        ...state,
        items: [...state.items, { ...action.payload, quantity: 1 }],
        total: state.total + action.payload.price
      };
    
    case 'REMOVE_ITEM':
      const itemToRemove = state.items.find(item => item.id === action.payload);
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload),
        total: state.total - (itemToRemove.price * itemToRemove.quantity)
      };
    
    case 'UPDATE_QUANTITY':
      const item = state.items.find(item => item.id === action.payload.id);
      const quantityDiff = action.payload.quantity - item.quantity;
      
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
        total: state.total + (item.price * quantityDiff)
      };
    
    case 'APPLY_COUPON':
      const discount = calculateDiscount(state.total, action.payload);
      return {
        ...state,
        coupon: action.payload,
        discount,
        finalTotal: state.total - discount
      };
    
    case 'CLEAR_CART':
      return initialCartState;
    
    default:
      return state;
  }
};

const initialCartState = {
  items: [],
  total: 0,
  discount: 0,
  finalTotal: 0,
  coupon: null
};

function ShoppingCart() {
  const [cart, dispatch] = useReducer(cartReducer, initialCartState);
  const [couponCode, setCouponCode] = useState('');
  
  const addToCart = (product) => {
    dispatch({ type: 'ADD_ITEM', payload: product });
  };
  
  const removeFromCart = (productId) => {
    dispatch({ type: 'REMOVE_ITEM', payload: productId });
  };
  
  const updateQuantity = (productId, quantity) => {
    if (quantity > 0) {
      dispatch({ type: 'UPDATE_QUANTITY', payload: { id: productId, quantity } });
    }
  };
  
  const applyCoupon = () => {
    if (couponCode) {
      dispatch({ type: 'APPLY_COUPON', payload: couponCode });
    }
  };
  
  const checkout = async () => {
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cart)
      });
      
      if (response.ok) {
        dispatch({ type: 'CLEAR_CART' });
        alert('订单已提交！');
      }
    } catch (error) {
      console.error('结账失败:', error);
    }
  };
  
  return (
    <div className="shopping-cart">
      <h2>购物车</h2>
      
      {cart.items.length === 0 ? (
        <p>购物车是空的</p>
      ) : (
        <>
          <ul>
            {cart.items.map(item => (
              <li key={item.id}>
                <span>{item.name}</span>
                <span>${item.price}</span>
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                  min="1"
                />
                <span>小计：${item.price * item.quantity}</span>
                <button onClick={() => removeFromCart(item.id)}>删除</button>
              </li>
            ))}
          </ul>
          
          <div className="cart-summary">
            <div>总计：${cart.total.toFixed(2)}</div>
            
            {cart.coupon && (
              <div>折扣：-${cart.discount.toFixed(2)}</div>
            )}
            
            <div>
              <input
                placeholder="优惠码"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
              />
              <button onClick={applyCoupon}>应用</button>
            </div>
            
            <div>应付：${cart.finalTotal.toFixed(2)}</div>
            
            <button onClick={checkout}>结账</button>
          </div>
        </>
      )}
    </div>
  );
}

// 2. 复杂表单Reducer
const formReducer = (state, action) => {
  switch (action.type) {
    case 'UPDATE_FIELD':
      return {
        ...state,
        values: {
          ...state.values,
          [action.payload.name]: action.payload.value
        },
        errors: {
          ...state.errors,
          [action.payload.name]: '' // 清除错误
        },
        touched: {
          ...state.touched,
          [action.payload.name]: true
        }
      };
    
    case 'SET_ERRORS':
      return {
        ...state,
        errors: action.payload
      };
    
    case 'SET_SUBMITTING':
      return {
        ...state,
        isSubmitting: action.payload
      };
    
    case 'RESET':
      return action.payload || initialFormState;
    
    case 'SET_FIELD_ERROR':
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.payload.name]: action.payload.error
        }
      };
    
    default:
      return state;
  }
};

function RegistrationForm() {
  const initialFormState = {
    values: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      agreeToTerms: false
    },
    errors: {},
    touched: {},
    isSubmitting: false
  };
  
  const [form, dispatch] = useReducer(formReducer, initialFormState);
  
  const updateField = (name, value) => {
    dispatch({ type: 'UPDATE_FIELD', payload: { name, value } });
  };
  
  const validate = () => {
    const errors = {};
    
    if (!form.values.username) {
      errors.username = '用户名必填';
    } else if (form.values.username.length < 3) {
      errors.username = '用户名至少3个字符';
    }
    
    if (!form.values.email) {
      errors.email = '邮箱必填';
    } else if (!/\S+@\S+\.\S+/.test(form.values.email)) {
      errors.email = '邮箱格式不正确';
    }
    
    if (!form.values.password) {
      errors.password = '密码必填';
    } else if (form.values.password.length < 6) {
      errors.password = '密码至少6个字符';
    }
    
    if (form.values.password !== form.values.confirmPassword) {
      errors.confirmPassword = '密码不匹配';
    }
    
    if (!form.values.agreeToTerms) {
      errors.agreeToTerms = '请同意服务条款';
    }
    
    return errors;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      dispatch({ type: 'SET_ERRORS', payload: errors });
      return;
    }
    
    dispatch({ type: 'SET_SUBMITTING', payload: true });
    
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form.values)
      });
      
      if (response.ok) {
        alert('注册成功！');
        dispatch({ type: 'RESET' });
      } else {
        const data = await response.json();
        if (data.fieldErrors) {
          Object.entries(data.fieldErrors).forEach(([field, error]) => {
            dispatch({ type: 'SET_FIELD_ERROR', payload: { name: field, error } });
          });
        }
      }
    } catch (error) {
      console.error('提交失败:', error);
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <h2>用户注册</h2>
      
      <div>
        <input
          name="username"
          placeholder="用户名"
          value={form.values.username}
          onChange={(e) => updateField('username', e.target.value)}
        />
        {form.errors.username && <span className="error">{form.errors.username}</span>}
      </div>
      
      <div>
        <input
          name="email"
          type="email"
          placeholder="邮箱"
          value={form.values.email}
          onChange={(e) => updateField('email', e.target.value)}
        />
        {form.errors.email && <span className="error">{form.errors.email}</span>}
      </div>
      
      <div>
        <input
          name="password"
          type="password"
          placeholder="密码"
          value={form.values.password}
          onChange={(e) => updateField('password', e.target.value)}
        />
        {form.errors.password && <span className="error">{form.errors.password}</span>}
      </div>
      
      <div>
        <input
          name="confirmPassword"
          type="password"
          placeholder="确认密码"
          value={form.values.confirmPassword}
          onChange={(e) => updateField('confirmPassword', e.target.value)}
        />
        {form.errors.confirmPassword && <span className="error">{form.errors.confirmPassword}</span>}
      </div>
      
      <div>
        <label>
          <input
            name="agreeToTerms"
            type="checkbox"
            checked={form.values.agreeToTerms}
            onChange={(e) => updateField('agreeToTerms', e.target.checked)}
          />
          我同意服务条款
        </label>
        {form.errors.agreeToTerms && <span className="error">{form.errors.agreeToTerms}</span>}
      </div>
      
      <button type="submit" disabled={form.isSubmitting}>
        {form.isSubmitting ? '提交中...' : '注册'}
      </button>
    </form>
  );
}
```

## useRef高级应用

### DOM操作和值存储

```jsx
// 1. 复杂的DOM引用管理
function VideoPlayer({ src }) {
  const videoRef = useRef(null);
  const progressBarRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  // 播放/暂停
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };
  
  // 跳转到指定时间
  const seek = (time) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };
  
  // 处理进度条点击
  const handleProgressClick = (e) => {
    if (progressBarRef.current && duration) {
      const rect = progressBarRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = x / rect.width;
      const time = percentage * duration;
      seek(time);
    }
  };
  
  // 监听视频事件
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    const updateTime = () => setCurrentTime(video.currentTime);
    const updateDuration = () => setDuration(video.duration);
    const handleEnded = () => setIsPlaying(false);
    
    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', updateDuration);
    video.addEventListener('ended', handleEnded);
    
    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('loadedmetadata', updateDuration);
      video.removeEventListener('ended', handleEnded);
    };
  }, []);
  
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="video-player">
      <video ref={videoRef} src={src} />
      
      <div className="controls">
        <button onClick={togglePlay}>
          {isPlaying ? '暂停' : '播放'}
        </button>
        
        <div 
          ref={progressBarRef}
          className="progress-bar"
          onClick={handleProgressClick}
        >
          <div 
            className="progress"
            style={{ width: `${(currentTime / duration) * 100}%` }}
          />
        </div>
        
        <span>
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
      </div>
    </div>
  );
}

// 2. 使用ref存储可变值
function AnimatedCounter({ target }) {
  const [count, setCount] = useState(0);
  const animationRef = useRef(null);
  const startTimeRef = useRef(null);
  const previousTargetRef = useRef(0);
  
  useEffect(() => {
    // 如果目标值没有改变，不执行动画
    if (target === previousTargetRef.current) return;
    
    const duration = 1000; // 1秒动画
    const start = previousTargetRef.current;
    const change = target - start;
    
    const animate = (timestamp) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }
      
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      
      // 使用缓动函数
      const easeOutQuad = progress * (2 - progress);
      const current = start + change * easeOutQuad;
      
      setCount(Math.round(current));
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        previousTargetRef.current = target;
        startTimeRef.current = null;
      }
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [target]);
  
  return <div className="animated-counter">{count}</div>;
}

// 3. 跨渲染周期保持值
function ChatInput({ onSend }) {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  const lastTypingTimeRef = useRef(null);
  
  const handleChange = (e) => {
    setMessage(e.target.value);
    
    // 发送正在输入状态
    if (!isTyping) {
      setIsTyping(true);
      // 通知服务器开始输入
      sendTypingStatus(true);
    }
    
    // 更新最后输入时间
    lastTypingTimeRef.current = Date.now();
    
    // 清除之前的定时器
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // 3秒后停止输入状态
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      sendTypingStatus(false);
    }, 3000);
  };
  
  const handleSend = () => {
    if (message.trim()) {
      onSend(message);
      setMessage('');
      
      // 清除输入状态
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (isTyping) {
        setIsTyping(false);
        sendTypingStatus(false);
      }
    }
  };
  
  // 组件卸载时清理
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (isTyping) {
        sendTypingStatus(false);
      }
    };
  }, [isTyping]);
  
  return (
    <div className="chat-input">
      <input
        value={message}
        onChange={handleChange}
        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
        placeholder="输入消息..."
      />
      <button onClick={handleSend}>发送</button>
    </div>
  );
}

// 4. forwardRef和useImperativeHandle
const FancyInput = React.forwardRef((props, ref) => {
  const inputRef = useRef(null);
  const [value, setValue] = useState('');
  const [selectionStart, setSelectionStart] = useState(0);
  
  useImperativeHandle(ref, () => ({
    focus: () => {
      inputRef.current?.focus();
    },
    clear: () => {
      setValue('');
    },
    getValue: () => {
      return value;
    },
    insertText: (text) => {
      const newValue = value.slice(0, selectionStart) + text + value.slice(selectionStart);
      setValue(newValue);
      // 移动光标到插入文本后
      setTimeout(() => {
        if (inputRef.current) {
          const newPosition = selectionStart + text.length;
          inputRef.current.setSelectionRange(newPosition, newPosition);
        }
      }, 0);
    }
  }), [value, selectionStart]);
  
  const handleChange = (e) => {
    setValue(e.target.value);
    setSelectionStart(e.target.selectionStart);
  };
  
  return (
    <input
      ref={inputRef}
      value={value}
      onChange={handleChange}
      onSelect={(e) => setSelectionStart(e.target.selectionStart)}
      {...props}
    />
  );
});

// 使用FancyInput
function TextEditor() {
  const editorRef = useRef(null);
  
  const insertEmoji = (emoji) => {
    editorRef.current?.insertText(emoji);
    editorRef.current?.focus();
  };
  
  const handleSave = () => {
    const content = editorRef.current?.getValue();
    console.log('保存内容:', content);
  };
  
  return (
    <div>
      <div className="toolbar">
        <button onClick={() => insertEmoji('😊')}>😊</button>
        <button onClick={() => insertEmoji('👍')}>👍</button>
        <button onClick={() => insertEmoji('❤️')}>❤️</button>
        <button onClick={() => editorRef.current?.clear()}>清空</button>
      </div>
      
      <FancyInput ref={editorRef} placeholder="输入文本..." />
      
      <button onClick={handleSave}>保存</button>
    </div>
  );
}
```

## 工具函数和辅助代码

```jsx
// 辅助函数
function calculateExpensiveData() {
  console.log('执行昂贵的计算...');
  // 模拟耗时计算
  let result = 0;
  for (let i = 0; i < 1000000; i++) {
    result += Math.random();
  }
  return result;
}

function calculateStatistics(data) {
  return {
    count: data.length,
    sum: data.reduce((acc, val) => acc + val, 0),
    average: data.reduce((acc, val) => acc + val, 0) / data.length
  };
}

function calculateMedian(numbers) {
  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function calculateDiscount(total, couponCode) {
  const coupons = {
    'SAVE10': 0.1,
    'SAVE20': 0.2,
    'HALF': 0.5
  };
  return total * (coupons[couponCode] || 0);
}

async function submitForm(data) {
  // 模拟API调用
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log('提交数据:', data);
}

function sendTypingStatus(isTyping) {
  // 模拟发送输入状态
  console.log('输入状态:', isTyping ? '正在输入' : '停止输入');
}

// 模拟组件
function Chart({ config }) {
  return <div className="chart">图表组件 - {config.type}</div>;
}

function TodoInput({ onAdd }) {
  const [text, setText] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) {
      onAdd(text);
      setText('');
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="添加待办事项..."
      />
      <button type="submit">添加</button>
    </form>
  );
}

function MessageInput({ onSend, disabled }) {
  const [text, setText] = useState('');
  
  const handleSend = () => {
    if (text.trim() && !disabled) {
      onSend(text);
      setText('');
    }
  };
  
  return (
    <div>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
        disabled={disabled}
      />
      <button onClick={handleSend} disabled={disabled}>发送</button>
    </div>
  );
}

function NotificationContainer({ notifications, onRemove }) {
  return (
    <div className="notifications">
      {notifications.map(notification => (
        <div key={notification.id} className={`notification ${notification.type}`}>
          <span>{notification.message}</span>
          <button onClick={() => onRemove(notification.id)}>×</button>
        </div>
      ))}
    </div>
  );
}

function Link({ to, children }) {
  return <a href={to}>{children}</a>;
}

// 导出所有示例组件
export {
  Counter,
  ExpensiveInitExample,
  ComplexForm,
  DataFetcher,
  WindowTracker,
  ChatRoom,
  LayoutEffectExample,
  DataAnalytics,
  TodoList,
  ThemeProvider,
  AuthProvider,
  NotificationProvider,
  useTheme,
  useAuth,
  useNotifications,
  Header,
  ShoppingCart,
  RegistrationForm,
  VideoPlayer,
  AnimatedCounter,
  ChatInput,
  TextEditor,
  FancyInput
};
```

这个综合示例展示了React Hooks的各种高级用法和最佳实践，包括状态管理、副作用处理、性能优化、上下文使用等多个方面。