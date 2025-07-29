// React Hooks 规则和常见错误

import React, { useState, useEffect, useCallback, useMemo } from 'react';

// ========== 1. Hooks 的两个基本规则 ==========

// 规则1: 只在最顶层使用 Hook

// ❌ 错误示例：条件语句中使用Hook
function ConditionalHookBad({ shouldTrack }: { shouldTrack: boolean }) {
  let trackingId;
  
  if (shouldTrack) {
    // ❌ 不要在条件语句中调用Hook！
    trackingId = useState(generateId())[0];
  }
  
  return <div>ID: {trackingId || 'Not tracking'}</div>;
}

// ✅ 正确示例：始终调用Hook，在Hook内部处理条件逻辑
function ConditionalHookGood({ shouldTrack }: { shouldTrack: boolean }) {
  // ✅ 总是调用useState
  const [trackingId] = useState(() => 
    shouldTrack ? generateId() : null
  );
  
  // ✅ 或者使用条件逻辑在effect内部
  useEffect(() => {
    if (shouldTrack) {
      console.log('Tracking started:', trackingId);
    }
  }, [shouldTrack, trackingId]);
  
  return <div>ID: {trackingId || 'Not tracking'}</div>;
}

// ❌ 错误示例：循环中使用Hook
function LoopHookBad({ items }: { items: string[] }) {
  const states = [];
  
  for (let i = 0; i < items.length; i++) {
    // ❌ 不要在循环中调用Hook！
    const [value, setValue] = useState(items[i]);
    states.push({ value, setValue });
  }
  
  return <div>{/* ... */}</div>;
}

// ✅ 正确示例：使用单个state管理所有项
function LoopHookGood({ items }: { items: string[] }) {
  // ✅ 使用对象或数组管理多个值
  const [values, setValues] = useState<Record<string, string>>(() => 
    items.reduce((acc, item, index) => ({
      ...acc,
      [index]: item
    }), {})
  );
  
  const updateValue = (index: number, value: string) => {
    setValues(prev => ({ ...prev, [index]: value }));
  };
  
  return (
    <div>
      {items.map((item, index) => (
        <input
          key={index}
          value={values[index] || ''}
          onChange={(e) => updateValue(index, e.target.value)}
        />
      ))}
    </div>
  );
}

// ❌ 错误示例：嵌套函数中使用Hook
function NestedFunctionBad() {
  function handleClick() {
    // ❌ 不要在嵌套函数中调用Hook！
    const [count, setCount] = useState(0);
    setCount(count + 1);
  }
  
  return <button onClick={handleClick}>Click</button>;
}

// ✅ 正确示例：在组件顶层使用Hook
function NestedFunctionGood() {
  // ✅ 在组件顶层调用Hook
  const [count, setCount] = useState(0);
  
  function handleClick() {
    // ✅ 在事件处理器中使用Hook的值
    setCount(count + 1);
  }
  
  return <button onClick={handleClick}>Count: {count}</button>;
}

// 规则2: 只在 React 函数中调用 Hook

// ❌ 错误示例：普通JavaScript函数中使用Hook
function regularFunction() {
  // ❌ 不能在普通函数中使用Hook！
  const [value, setValue] = useState(0);
  return value;
}

// ✅ 正确示例：自定义Hook（以use开头）
function useCustomValue() {
  // ✅ 可以在自定义Hook中使用其他Hook
  const [value, setValue] = useState(0);
  
  useEffect(() => {
    console.log('Value changed:', value);
  }, [value]);
  
  return [value, setValue] as const;
}

// ========== 2. 依赖数组的常见错误 ==========

// ❌ 错误：缺少依赖
function MissingDependencies() {
  const [count, setCount] = useState(0);
  const [multiplier, setMultiplier] = useState(2);
  
  useEffect(() => {
    // ❌ 使用了multiplier但没有包含在依赖数组中
    console.log('Result:', count * multiplier);
  }, [count]); // 缺少 multiplier
  
  return <div>{/* ... */}</div>;
}

// ✅ 正确：包含所有依赖
function CorrectDependencies() {
  const [count, setCount] = useState(0);
  const [multiplier, setMultiplier] = useState(2);
  
  useEffect(() => {
    // ✅ 所有使用的变量都在依赖数组中
    console.log('Result:', count * multiplier);
  }, [count, multiplier]);
  
  return <div>{/* ... */}</div>;
}

// ❌ 错误：对象/数组作为依赖
function ObjectDependencyBad() {
  const [user, setUser] = useState({ name: 'Alice', age: 25 });
  
  // ❌ config每次渲染都是新对象
  const config = { theme: 'dark', user };
  
  useEffect(() => {
    // 这个effect会在每次渲染时运行！
    console.log('Config changed:', config);
  }, [config]); // config引用每次都不同
  
  return <div>{/* ... */}</div>;
}

// ✅ 正确：使用具体值或memoize对象
function ObjectDependencyGood() {
  const [user, setUser] = useState({ name: 'Alice', age: 25 });
  const theme = 'dark';
  
  // ✅ 方案1：使用具体值作为依赖
  useEffect(() => {
    console.log('User or theme changed:', user.name, theme);
  }, [user.name, theme]);
  
  // ✅ 方案2：使用useMemo缓存对象
  const config = useMemo(() => ({
    theme,
    userName: user.name
  }), [theme, user.name]);
  
  useEffect(() => {
    console.log('Config changed:', config);
  }, [config]);
  
  return <div>{/* ... */}</div>;
}

// ========== 3. 函数作为依赖的问题 ==========

// ❌ 错误：内联函数作为依赖
function InlineFunctionBad() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    // ❌ fetchData每次渲染都是新函数
    const fetchData = async () => {
      const response = await fetch('/api/data');
      const result = await response.json();
      setData(result);
    };
    
    fetchData();
  }, [fetchData]); // 无限循环！
  
  return <div>{/* ... */}</div>;
}

// ✅ 正确：使用useCallback或将函数移到effect内部
function InlineFunctionGood() {
  const [data, setData] = useState(null);
  const [userId, setUserId] = useState(1);
  
  // ✅ 方案1：将函数移到effect内部
  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(`/api/users/${userId}`);
      const result = await response.json();
      setData(result);
    };
    
    fetchData();
  }, [userId]); // 只依赖userId
  
  // ✅ 方案2：使用useCallback
  const fetchUserData = useCallback(async () => {
    const response = await fetch(`/api/users/${userId}`);
    const result = await response.json();
    setData(result);
  }, [userId]);
  
  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);
  
  return <div>{/* ... */}</div>;
}

// ========== 4. 过时闭包问题 ==========

// ❌ 错误：过时的闭包
function StaleClosureBad() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const timer = setInterval(() => {
      // ❌ count始终是0，因为闭包捕获了初始值
      console.log('Count:', count);
      setCount(count + 1); // 始终是 0 + 1
    }, 1000);
    
    return () => clearInterval(timer);
  }, []); // 空依赖数组导致闭包过时
  
  return <div>Count: {count}</div>;
}

// ✅ 正确：使用函数式更新或包含依赖
function StaleClosureGood() {
  const [count, setCount] = useState(0);
  
  // ✅ 方案1：使用函数式更新
  useEffect(() => {
    const timer = setInterval(() => {
      setCount(prev => {
        console.log('Count:', prev);
        return prev + 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, []); // 空依赖数组是安全的
  
  // ✅ 方案2：使用ref保存最新值
  const countRef = useRef(count);
  countRef.current = count;
  
  useEffect(() => {
    const timer = setInterval(() => {
      console.log('Count:', countRef.current);
      setCount(countRef.current + 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  return <div>Count: {count}</div>;
}

// ========== 5. 不必要的重渲染 ==========

// ❌ 错误：没有优化的昂贵计算
function ExpensiveComputationBad({ items }: { items: number[] }) {
  const [filter, setFilter] = useState('');
  
  // ❌ 每次渲染都重新计算
  const expensiveResult = items
    .filter(item => item > 100)
    .map(item => item * 2)
    .reduce((sum, item) => sum + item, 0);
  
  // ❌ 每次渲染都创建新函数
  const handleClick = () => {
    console.log('Clicked');
  };
  
  return (
    <div>
      <input value={filter} onChange={(e) => setFilter(e.target.value)} />
      <ChildComponent onClick={handleClick} />
      <div>Result: {expensiveResult}</div>
    </div>
  );
}

// ✅ 正确：使用useMemo和useCallback优化
function ExpensiveComputationGood({ items }: { items: number[] }) {
  const [filter, setFilter] = useState('');
  
  // ✅ 只在items变化时重新计算
  const expensiveResult = useMemo(() => {
    console.log('Calculating expensive result...');
    return items
      .filter(item => item > 100)
      .map(item => item * 2)
      .reduce((sum, item) => sum + item, 0);
  }, [items]);
  
  // ✅ 稳定的函数引用
  const handleClick = useCallback(() => {
    console.log('Clicked');
  }, []);
  
  return (
    <div>
      <input value={filter} onChange={(e) => setFilter(e.target.value)} />
      <ChildComponent onClick={handleClick} />
      <div>Result: {expensiveResult}</div>
    </div>
  );
}

// ========== 6. Effect清理的常见错误 ==========

// ❌ 错误：忘记清理副作用
function NoCleanupBad() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    let mounted = true;
    
    // ❌ 没有取消请求
    fetch('/api/data')
      .then(res => res.json())
      .then(result => {
        // ❌ 没有检查组件是否仍然挂载
        setData(result);
      });
    
    // ❌ 没有清理函数
  }, []);
  
  return <div>{/* ... */}</div>;
}

// ✅ 正确：正确清理副作用
function CleanupGood() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();
    
    // ✅ 使用AbortController取消请求
    fetch('/api/data', { signal: controller.signal })
      .then(res => res.json())
      .then(result => {
        // ✅ 检查组件是否仍然挂载
        if (mounted) {
          setData(result);
        }
      })
      .catch(error => {
        if (error.name !== 'AbortError' && mounted) {
          console.error('Fetch error:', error);
        }
      });
    
    // ✅ 清理函数
    return () => {
      mounted = false;
      controller.abort();
    };
  }, []);
  
  return <div>{/* ... */}</div>;
}

// ========== 7. 自定义Hook的错误使用 ==========

// ❌ 错误：没有use前缀的"自定义Hook"
function getValue() {
  // ❌ ESLint会警告：不能在普通函数中使用Hook
  const [value, setValue] = useState(0);
  return [value, setValue];
}

// ❌ 错误：条件性调用自定义Hook
function ConditionalCustomHookBad({ enabled }: { enabled: boolean }) {
  if (enabled) {
    // ❌ 不要条件性调用Hook！
    const data = useCustomData();
    return <div>{data}</div>;
  }
  
  return <div>Disabled</div>;
}

// ✅ 正确：正确的自定义Hook
function useValue() {
  // ✅ 以use开头，可以使用其他Hook
  const [value, setValue] = useState(0);
  
  useEffect(() => {
    console.log('Value changed:', value);
  }, [value]);
  
  return [value, setValue] as const;
}

// ✅ 正确：始终调用自定义Hook
function ConditionalCustomHookGood({ enabled }: { enabled: boolean }) {
  // ✅ 始终调用Hook
  const data = useCustomData();
  
  // ✅ 在渲染中处理条件逻辑
  if (!enabled) {
    return <div>Disabled</div>;
  }
  
  return <div>{data}</div>;
}

// ========== 8. useEffect vs useLayoutEffect 的误用 ==========

// ❌ 错误：在useEffect中进行DOM测量
function DomMeasurementBad() {
  const ref = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);
  
  useEffect(() => {
    // ❌ 可能导致闪烁，因为在浏览器绘制后执行
    if (ref.current) {
      setHeight(ref.current.offsetHeight);
    }
  });
  
  return (
    <div ref={ref} style={{ minHeight: height }}>
      Content
    </div>
  );
}

// ✅ 正确：使用useLayoutEffect进行DOM测量
function DomMeasurementGood() {
  const ref = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);
  
  useLayoutEffect(() => {
    // ✅ 在浏览器绘制前同步执行，避免闪烁
    if (ref.current) {
      setHeight(ref.current.offsetHeight);
    }
  });
  
  return (
    <div ref={ref} style={{ minHeight: height }}>
      Content
    </div>
  );
}

// ========== 9. 过度使用useMemo/useCallback ==========

// ❌ 错误：过度优化
function OverOptimizationBad() {
  // ❌ 简单计算不需要memo
  const doubled = useMemo(() => 2 * 2, []);
  
  // ❌ 没有传递给子组件的函数不需要useCallback
  const handleInternalLogic = useCallback(() => {
    console.log('Internal logic');
  }, []);
  
  // ❌ 原始值不需要memo
  const style = useMemo(() => ({ color: 'red' }), []);
  
  return <div style={style}>Result: {doubled}</div>;
}

// ✅ 正确：合理使用优化Hook
function OptimizationGood({ items, onItemClick }: any) {
  // ✅ 昂贵计算使用memo
  const processedItems = useMemo(() => {
    return items
      .filter(item => item.active)
      .sort((a, b) => b.priority - a.priority)
      .map(item => ({
        ...item,
        displayName: `${item.name} (${item.category})`
      }));
  }, [items]);
  
  // ✅ 传递给优化过的子组件的回调使用useCallback
  const handleClick = useCallback((item) => {
    onItemClick(item.id);
  }, [onItemClick]);
  
  return (
    <div>
      {processedItems.map(item => (
        <MemoizedItem
          key={item.id}
          item={item}
          onClick={handleClick}
        />
      ))}
    </div>
  );
}

// ========== 10. useState的常见陷阱 ==========

// ❌ 错误：直接修改state对象
function DirectMutationBad() {
  const [user, setUser] = useState({ name: 'Alice', age: 25 });
  
  const updateAge = () => {
    // ❌ 直接修改对象不会触发重渲染
    user.age = 26;
    setUser(user); // React认为是同一个对象
  };
  
  return (
    <div>
      <p>{user.name}, {user.age}</p>
      <button onClick={updateAge}>Update Age</button>
    </div>
  );
}

// ✅ 正确：创建新对象
function ImmutableUpdateGood() {
  const [user, setUser] = useState({ name: 'Alice', age: 25 });
  
  const updateAge = () => {
    // ✅ 创建新对象触发重渲染
    setUser({ ...user, age: 26 });
    
    // ✅ 或使用函数式更新
    setUser(prev => ({ ...prev, age: prev.age + 1 }));
  };
  
  return (
    <div>
      <p>{user.name}, {user.age}</p>
      <button onClick={updateAge}>Update Age</button>
    </div>
  );
}

// ========== 工具函数 ==========

function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

function ChildComponent({ onClick }: { onClick: () => void }) {
  console.log('ChildComponent rendered');
  return <button onClick={onClick}>Click me</button>;
}

const MemoizedItem = React.memo(({ item, onClick }: any) => {
  return <div onClick={() => onClick(item)}>{item.displayName}</div>;
});

// 自定义Hook示例
function useCustomData() {
  const [data, setData] = useState('Custom data');
  
  useEffect(() => {
    // 模拟数据获取
    setTimeout(() => {
      setData('Updated custom data');
    }, 1000);
  }, []);
  
  return data;
}

export {
  ConditionalHookGood,
  LoopHookGood,
  NestedFunctionGood,
  CorrectDependencies,
  ObjectDependencyGood,
  InlineFunctionGood,
  StaleClosureGood,
  ExpensiveComputationGood,
  CleanupGood,
  useValue,
  ConditionalCustomHookGood,
  DomMeasurementGood,
  OptimizationGood,
  ImmutableUpdateGood
};