// React Hooks 模式和最佳实践

import React, { useState, useEffect, useCallback, useMemo, useRef, useReducer } from 'react';

// ========== 1. useState 高级模式 ==========

// 函数式更新避免闭包陷阱
function CounterWithFunctionalUpdate() {
  const [count, setCount] = useState(0);
  
  // ❌ 错误：闭包陷阱
  const incrementThreeTimesBad = () => {
    setCount(count + 1); // count = 0
    setCount(count + 1); // count = 0
    setCount(count + 1); // count = 0
    // 结果：count = 1
  };
  
  // ✅ 正确：函数式更新
  const incrementThreeTimesGood = () => {
    setCount(prev => prev + 1);
    setCount(prev => prev + 1);
    setCount(prev => prev + 1);
    // 结果：count = 3
  };
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={incrementThreeTimesGood}>+3</button>
    </div>
  );
}

// 惰性初始化模式
function ExpensiveInitialization() {
  // ❌ 每次渲染都执行
  const [data] = useState(calculateExpensiveData());
  
  // ✅ 只在首次渲染时执行
  const [lazyData] = useState(() => calculateExpensiveData());
  
  // 实际应用示例
  const [settings] = useState(() => {
    const saved = localStorage.getItem('settings');
    return saved ? JSON.parse(saved) : defaultSettings;
  });
  
  return <div>{/* 使用data */}</div>;
}

// State拆分模式
function FormWithSplitState() {
  // ✅ 合理拆分state
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  
  const [validation, setValidation] = useState({
    errors: {},
    touched: {}
  });
  
  const [ui, setUI] = useState({
    isSubmitting: false,
    showPassword: false
  });
  
  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // 清除错误
    if (validation.errors[field]) {
      setValidation(prev => ({
        ...prev,
        errors: { ...prev.errors, [field]: undefined }
      }));
    }
  };
  
  return <form>{/* 表单内容 */}</form>;
}

// ========== 2. useEffect 最佳实践 ==========

// 正确的依赖管理
function EffectDependencies() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  
  // ✅ 正确的依赖数组
  useEffect(() => {
    if (!query) return;
    
    const searchTimer = setTimeout(() => {
      performSearch(query).then(setResults);
    }, 300);
    
    return () => clearTimeout(searchTimer);
  }, [query]); // query变化时触发
  
  // 处理对象/数组依赖
  const filters = { category: 'tech', sort: 'date' };
  
  // ❌ 对象每次都是新的
  useEffect(() => {
    fetchData(filters);
  }, [filters]); // 每次渲染都触发！
  
  // ✅ 使用具体值或useMemo
  useEffect(() => {
    fetchData({ category: 'tech', sort: 'date' });
  }, []); // 只执行一次
  
  return <div>{/* UI */}</div>;
}

// Effect清理模式
function EffectCleanup() {
  const [userId, setUserId] = useState(1);
  
  useEffect(() => {
    let cancelled = false;
    
    async function fetchUser() {
      try {
        const user = await api.getUser(userId);
        if (!cancelled) {
          setUser(user);
        }
      } catch (error) {
        if (!cancelled) {
          setError(error);
        }
      }
    }
    
    fetchUser();
    
    // 清理函数
    return () => {
      cancelled = true;
    };
  }, [userId]);
  
  // 事件监听器清理
  useEffect(() => {
    const handleResize = () => {
      console.log('窗口大小改变');
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // WebSocket清理
  useEffect(() => {
    const ws = new WebSocket('wss://api.example.com');
    
    ws.onmessage = (event) => {
      console.log('收到消息:', event.data);
    };
    
    return () => {
      ws.close();
    };
  }, []);
}

// ========== 3. 性能优化模式 ==========

// useMemo优化计算
function MemoizationPattern({ items, filter }: { items: any[], filter: string }) {
  // ✅ 缓存昂贵的计算
  const filteredItems = useMemo(() => {
    console.log('过滤项目...');
    return items.filter(item => 
      item.name.toLowerCase().includes(filter.toLowerCase())
    );
  }, [items, filter]);
  
  // ✅ 缓存对象引用
  const chartConfig = useMemo(() => ({
    type: 'bar',
    data: filteredItems,
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  }), [filteredItems]);
  
  return <Chart config={chartConfig} />;
}

// useCallback优化函数
function CallbackPattern({ onUpdate }: { onUpdate: (id: number) => void }) {
  const [items, setItems] = useState([]);
  
  // ✅ 稳定的回调函数
  const handleDelete = useCallback((id: number) => {
    setItems(prev => prev.filter(item => item.id !== id));
    onUpdate(id);
  }, [onUpdate]);
  
  // ✅ 配合React.memo使用
  return (
    <div>
      {items.map(item => (
        <MemoizedItem
          key={item.id}
          item={item}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}

const MemoizedItem = React.memo(({ item, onDelete }) => {
  console.log('Item渲染:', item.id);
  return (
    <div>
      {item.name}
      <button onClick={() => onDelete(item.id)}>删除</button>
    </div>
  );
});

// ========== 4. useReducer 复杂状态管理 ==========

// 复杂状态的reducer
type State = {
  data: any[];
  loading: boolean;
  error: Error | null;
  filter: string;
  page: number;
};

type Action = 
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: any[] }
  | { type: 'FETCH_ERROR'; payload: Error }
  | { type: 'SET_FILTER'; payload: string }
  | { type: 'NEXT_PAGE' }
  | { type: 'RESET' };

function dataReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: null };
    
    case 'FETCH_SUCCESS':
      return { 
        ...state, 
        loading: false, 
        data: action.payload,
        error: null 
      };
    
    case 'FETCH_ERROR':
      return { 
        ...state, 
        loading: false, 
        error: action.payload 
      };
    
    case 'SET_FILTER':
      return { ...state, filter: action.payload, page: 1 };
    
    case 'NEXT_PAGE':
      return { ...state, page: state.page + 1 };
    
    case 'RESET':
      return initialState;
    
    default:
      return state;
  }
}

const initialState: State = {
  data: [],
  loading: false,
  error: null,
  filter: '',
  page: 1
};

function ComplexStateComponent() {
  const [state, dispatch] = useReducer(dataReducer, initialState);
  
  const fetchData = useCallback(async () => {
    dispatch({ type: 'FETCH_START' });
    try {
      const data = await api.getData(state.filter, state.page);
      dispatch({ type: 'FETCH_SUCCESS', payload: data });
    } catch (error) {
      dispatch({ type: 'FETCH_ERROR', payload: error as Error });
    }
  }, [state.filter, state.page]);
  
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  return (
    <div>
      <input
        value={state.filter}
        onChange={(e) => dispatch({ 
          type: 'SET_FILTER', 
          payload: e.target.value 
        })}
      />
      
      {state.loading && <p>加载中...</p>}
      {state.error && <p>错误: {state.error.message}</p>}
      
      <ul>
        {state.data.map((item, index) => (
          <li key={index}>{item.name}</li>
        ))}
      </ul>
      
      <button onClick={() => dispatch({ type: 'NEXT_PAGE' })}>
        下一页
      </button>
    </div>
  );
}

// ========== 5. useRef 高级应用 ==========

// 存储可变值
function MutableRefPattern() {
  const [count, setCount] = useState(0);
  const countRef = useRef(count);
  
  // 保持最新值的引用
  useEffect(() => {
    countRef.current = count;
  });
  
  // 在异步操作中使用最新值
  const handleAsyncOperation = useCallback(() => {
    setTimeout(() => {
      console.log('当前count:', countRef.current); // 总是最新值
    }, 3000);
  }, []);
  
  // 存储前一个值
  const prevCountRef = useRef<number>();
  useEffect(() => {
    prevCountRef.current = count;
  });
  const prevCount = prevCountRef.current;
  
  return (
    <div>
      <p>当前: {count}, 之前: {prevCount ?? 'N/A'}</p>
      <button onClick={() => setCount(count + 1)}>增加</button>
      <button onClick={handleAsyncOperation}>异步操作</button>
    </div>
  );
}

// DOM引用和命令式操作
function ImperativeRefPattern() {
  const inputRefs = useRef<Map<string, HTMLInputElement>>(new Map());
  
  const focusInput = (name: string) => {
    inputRefs.current.get(name)?.focus();
  };
  
  const validateAndFocus = () => {
    const inputs = Array.from(inputRefs.current.entries());
    for (const [name, input] of inputs) {
      if (!input.value) {
        input.focus();
        input.style.borderColor = 'red';
        return false;
      }
    }
    return true;
  };
  
  return (
    <form>
      <input
        ref={(el) => el && inputRefs.current.set('username', el)}
        placeholder="用户名"
      />
      <input
        ref={(el) => el && inputRefs.current.set('email', el)}
        placeholder="邮箱"
      />
      <button type="button" onClick={validateAndFocus}>
        验证
      </button>
    </form>
  );
}

// ========== 6. Hooks组合模式 ==========

// 组合多个hooks创建复杂功能
function useAsyncData<T>(url: string, dependencies: any[] = []) {
  const [state, setState] = useState<{
    data: T | null;
    loading: boolean;
    error: Error | null;
  }>({
    data: null,
    loading: true,
    error: null
  });
  
  const abortControllerRef = useRef<AbortController>();
  
  const fetchData = useCallback(async () => {
    // 取消之前的请求
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();
    
    setState({ data: null, loading: true, error: null });
    
    try {
      const response = await fetch(url, {
        signal: abortControllerRef.current.signal
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setState({ data, loading: false, error: null });
    } catch (error) {
      if (error.name !== 'AbortError') {
        setState({ 
          data: null, 
          loading: false, 
          error: error as Error 
        });
      }
    }
  }, [url]);
  
  useEffect(() => {
    fetchData();
    
    return () => {
      abortControllerRef.current?.abort();
    };
  }, [...dependencies, fetchData]);
  
  return { ...state, refetch: fetchData };
}

// 使用组合的Hook
function DataComponent() {
  const [filter, setFilter] = useState('');
  const debouncedFilter = useDebounce(filter, 300);
  
  const { data, loading, error, refetch } = useAsyncData(
    `/api/items?filter=${debouncedFilter}`,
    [debouncedFilter]
  );
  
  return (
    <div>
      <input
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="搜索..."
      />
      
      {loading && <p>加载中...</p>}
      {error && <p>错误: {error.message}</p>}
      {data && <ItemList items={data} />}
      
      <button onClick={refetch}>刷新</button>
    </div>
  );
}

// ========== 7. Context最佳实践 ==========

// 分离state和dispatch避免不必要的重渲染
const StateContext = React.createContext<State | undefined>(undefined);
const DispatchContext = React.createContext<React.Dispatch<Action> | undefined>(undefined);

function StateProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(dataReducer, initialState);
  
  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        {children}
      </DispatchContext.Provider>
    </StateContext.Provider>
  );
}

// 自定义hooks访问context
function useAppState() {
  const context = useContext(StateContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within StateProvider');
  }
  return context;
}

function useAppDispatch() {
  const context = useContext(DispatchContext);
  if (context === undefined) {
    throw new Error('useAppDispatch must be used within StateProvider');
  }
  return context;
}

// 只订阅需要的state部分
function FilteredList() {
  const { data, filter } = useAppState(); // 只在data或filter变化时重渲染
  const dispatch = useAppDispatch(); // dispatch永不变化
  
  const filteredData = useMemo(() => 
    data.filter(item => item.name.includes(filter)),
    [data, filter]
  );
  
  return (
    <ul>
      {filteredData.map(item => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  );
}

// ========== 工具函数 ==========

function calculateExpensiveData() {
  console.log('执行昂贵的计算...');
  return Array.from({ length: 1000 }, (_, i) => ({
    id: i,
    value: Math.random()
  }));
}

const defaultSettings = {
  theme: 'light',
  language: 'zh-CN',
  notifications: true
};

async function performSearch(query: string) {
  // 模拟API调用
  await new Promise(resolve => setTimeout(resolve, 500));
  return [
    { id: 1, name: `Result for ${query}` },
    { id: 2, name: `Another result for ${query}` }
  ];
}

async function fetchData(filters: any) {
  console.log('Fetching with filters:', filters);
  // 模拟数据获取
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => clearTimeout(timer);
  }, [value, delay]);
  
  return debouncedValue;
}

// 模拟组件
function Chart({ config }: { config: any }) {
  return <div>图表组件</div>;
}

function ItemList({ items }: { items: any[] }) {
  return <ul>{items.map(item => <li key={item.id}>{item.name}</li>)}</ul>;
}

// 模拟API
const api = {
  getUser: async (id: number) => ({ id, name: `User ${id}` }),
  getData: async (filter: string, page: number) => []
};

export {
  CounterWithFunctionalUpdate,
  ExpensiveInitialization,
  FormWithSplitState,
  EffectDependencies,
  EffectCleanup,
  MemoizationPattern,
  CallbackPattern,
  ComplexStateComponent,
  MutableRefPattern,
  ImperativeRefPattern,
  DataComponent,
  StateProvider,
  FilteredList,
  useAppState,
  useAppDispatch,
  useAsyncData,
  useDebounce
};