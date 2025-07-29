---
title: "自定义Hooks库"
description: "常用的自定义React Hooks集合，包含状态管理、数据获取、性能优化等"
category: "react"
language: "javascript"
day: 28
concepts:
  - "自定义Hooks开发"
  - "逻辑复用"
  - "Hooks组合模式"
  - "TypeScript支持"
  - "性能优化"
relatedTopics:
  - "React Hooks"
  - "状态管理"
  - "副作用处理"
---

# 自定义Hooks库

## 状态管理Hooks

### useLocalStorage - 持久化状态

```javascript
import { useState, useEffect, useCallback } from 'react';

/**
 * 将状态同步到localStorage的Hook
 * @param {string} key - localStorage的键名
 * @param {any} initialValue - 初始值
 * @returns {[any, Function]} - [状态值, 设置函数]
 */
export function useLocalStorage(key, initialValue) {
  // 从localStorage读取初始值
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    
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
      
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
        // 触发自定义事件，通知其他标签页
        window.dispatchEvent(new StorageEvent('storage', {
          key,
          newValue: JSON.stringify(valueToStore),
          url: window.location.href,
          storageArea: window.localStorage
        }));
      }
    } catch (error) {
      console.error(`Error saving localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);
  
  // 监听其他标签页的变化
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === key && e.newValue && e.storageArea === localStorage) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          console.error('Error parsing storage value:', error);
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);
  
  return [storedValue, setValue];
}

// 使用示例
function UserSettings() {
  const [settings, setSettings] = useLocalStorage('userSettings', {
    theme: 'light',
    language: 'zh-CN',
    notifications: true
  });
  
  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };
  
  return (
    <div>
      <select 
        value={settings.theme}
        onChange={(e) => updateSetting('theme', e.target.value)}
      >
        <option value="light">浅色</option>
        <option value="dark">深色</option>
      </select>
    </div>
  );
}
```

### useSessionStorage - 会话存储

```javascript
/**
 * 类似useLocalStorage，但使用sessionStorage
 */
export function useSessionStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    
    try {
      const item = window.sessionStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error loading sessionStorage key "${key}":`, error);
      return initialValue;
    }
  });
  
  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      setStoredValue(valueToStore);
      
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error saving sessionStorage key "${key}":`, error);
    }
  }, [key, storedValue]);
  
  return [storedValue, setValue];
}
```

### useToggle - 开关状态

```javascript
/**
 * 管理布尔值状态的Hook
 */
export function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue);
  
  const toggle = useCallback(() => {
    setValue(v => !v);
  }, []);
  
  const setTrue = useCallback(() => {
    setValue(true);
  }, []);
  
  const setFalse = useCallback(() => {
    setValue(false);
  }, []);
  
  return {
    value,
    toggle,
    setTrue,
    setFalse,
    setValue
  };
}

// 使用示例
function Modal() {
  const modal = useToggle();
  
  return (
    <>
      <button onClick={modal.toggle}>打开模态框</button>
      {modal.value && (
        <div className="modal">
          <h2>模态框内容</h2>
          <button onClick={modal.setFalse}>关闭</button>
        </div>
      )}
    </>
  );
}
```

### usePrevious - 获取前一个值

```javascript
import { useRef, useEffect } from 'react';

/**
 * 获取状态的前一个值
 */
export function usePrevious(value) {
  const ref = useRef();
  
  useEffect(() => {
    ref.current = value;
  });
  
  return ref.current;
}

// 使用示例
function PriceTracker({ price }) {
  const prevPrice = usePrevious(price);
  
  const getPriceChange = () => {
    if (prevPrice === undefined) return null;
    const change = price - prevPrice;
    if (change > 0) return `+${change} ↑`;
    if (change < 0) return `${change} ↓`;
    return '0';
  };
  
  return (
    <div>
      <h3>当前价格: {price}</h3>
      <p>价格变化: {getPriceChange()}</p>
    </div>
  );
}
```

## 性能优化Hooks

### useDebounce - 防抖

```javascript
/**
 * 防抖Hook - 延迟更新值
 */
export function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);
  
  return debouncedValue;
}

// 高级版本 - 包含取消和立即执行
export function useDebounceCallback(callback, delay) {
  const timeoutRef = useRef(null);
  const callbackRef = useRef(callback);
  
  // 保持callback最新
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);
  
  const debouncedCallback = useCallback((...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      callbackRef.current(...args);
    }, delay);
  }, [delay]);
  
  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);
  
  const flush = useCallback((...args) => {
    cancel();
    callbackRef.current(...args);
  }, [cancel]);
  
  // 组件卸载时清理
  useEffect(() => {
    return cancel;
  }, [cancel]);
  
  return {
    run: debouncedCallback,
    cancel,
    flush
  };
}

// 使用示例
function SearchBox() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  
  // 防抖搜索词
  const debouncedQuery = useDebounce(query, 500);
  
  // 或使用回调版本
  const { run: debouncedSearch } = useDebounceCallback((searchTerm) => {
    console.log('搜索:', searchTerm);
    performSearch(searchTerm).then(setResults);
  }, 500);
  
  useEffect(() => {
    if (debouncedQuery) {
      performSearch(debouncedQuery).then(setResults);
    }
  }, [debouncedQuery]);
  
  return (
    <div>
      <input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          // debouncedSearch(e.target.value);
        }}
        placeholder="搜索..."
      />
      <ul>
        {results.map(result => (
          <li key={result.id}>{result.title}</li>
        ))}
      </ul>
    </div>
  );
}
```

### useThrottle - 节流

```javascript
/**
 * 节流Hook - 限制更新频率
 */
export function useThrottle(value, limit) {
  const [throttledValue, setThrottledValue] = useState(value);
  const lastRun = useRef(Date.now());
  
  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRun.current >= limit) {
        setThrottledValue(value);
        lastRun.current = Date.now();
      }
    }, limit - (Date.now() - lastRun.current));
    
    return () => {
      clearTimeout(handler);
    };
  }, [value, limit]);
  
  return throttledValue;
}

// 节流回调版本
export function useThrottleCallback(callback, limit) {
  const lastRun = useRef(0);
  const timeout = useRef(null);
  const callbackRef = useRef(callback);
  
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);
  
  const throttledCallback = useCallback((...args) => {
    const now = Date.now();
    const timeSinceLastRun = now - lastRun.current;
    
    if (timeSinceLastRun >= limit) {
      callbackRef.current(...args);
      lastRun.current = now;
    } else {
      if (timeout.current) {
        clearTimeout(timeout.current);
      }
      
      timeout.current = setTimeout(() => {
        callbackRef.current(...args);
        lastRun.current = Date.now();
      }, limit - timeSinceLastRun);
    }
  }, [limit]);
  
  const cancel = useCallback(() => {
    if (timeout.current) {
      clearTimeout(timeout.current);
      timeout.current = null;
    }
  }, []);
  
  useEffect(() => {
    return cancel;
  }, [cancel]);
  
  return {
    run: throttledCallback,
    cancel
  };
}

// 使用示例
function ScrollTracker() {
  const [scrollY, setScrollY] = useState(0);
  
  // 节流滚动位置更新
  const throttledScrollY = useThrottle(scrollY, 100);
  
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return (
    <div style={{ position: 'fixed', top: 0, right: 0 }}>
      实时: {scrollY}px | 节流: {throttledScrollY}px
    </div>
  );
}
```

## 副作用管理Hooks

### useAsync - 异步操作

```javascript
/**
 * 管理异步操作的Hook
 */
export function useAsync(asyncFunction, immediate = true) {
  const [state, setState] = useState({
    data: null,
    loading: false,
    error: null
  });
  
  const execute = useCallback(async (...params) => {
    setState({ data: null, loading: true, error: null });
    
    try {
      const data = await asyncFunction(...params);
      setState({ data, loading: false, error: null });
      return data;
    } catch (error) {
      setState({ data: null, loading: false, error });
      throw error;
    }
  }, [asyncFunction]);
  
  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);
  
  return { ...state, execute };
}

// 带取消功能的版本
export function useAsyncWithCancel(asyncFunction) {
  const [state, setState] = useState({
    data: null,
    loading: false,
    error: null
  });
  const cancelRef = useRef(null);
  
  const execute = useCallback(async (...params) => {
    // 取消之前的请求
    if (cancelRef.current) {
      cancelRef.current();
    }
    
    // 创建新的取消标记
    let isCancelled = false;
    cancelRef.current = () => {
      isCancelled = true;
    };
    
    setState({ data: null, loading: true, error: null });
    
    try {
      const data = await asyncFunction(...params);
      
      if (!isCancelled) {
        setState({ data, loading: false, error: null });
        return data;
      }
    } catch (error) {
      if (!isCancelled) {
        setState({ data: null, loading: false, error });
        throw error;
      }
    }
  }, [asyncFunction]);
  
  const cancel = useCallback(() => {
    if (cancelRef.current) {
      cancelRef.current();
    }
  }, []);
  
  // 组件卸载时取消
  useEffect(() => {
    return cancel;
  }, [cancel]);
  
  return { ...state, execute, cancel };
}

// 使用示例
function UserProfile({ userId }) {
  const { data: user, loading, error, execute: fetchUser } = useAsync(
    useCallback(() => api.getUser(userId), [userId]),
    true // 立即执行
  );
  
  if (loading) return <div>加载中...</div>;
  if (error) return <div>错误: {error.message}</div>;
  if (!user) return null;
  
  return (
    <div>
      <h2>{user.name}</h2>
      <button onClick={() => fetchUser()}>刷新</button>
    </div>
  );
}
```

### useFetch - 数据获取

```javascript
/**
 * 数据获取Hook with缓存
 */
const cache = new Map();

export function useFetch(url, options = {}) {
  const [state, setState] = useState({
    data: null,
    loading: true,
    error: null
  });
  
  const { 
    method = 'GET',
    headers = {},
    body = null,
    cache: useCache = true,
    cacheTime = 5 * 60 * 1000, // 5分钟
    onSuccess,
    onError
  } = options;
  
  const abortControllerRef = useRef(null);
  const cacheKey = `${method}:${url}:${JSON.stringify(body)}`;
  
  const fetchData = useCallback(async () => {
    // 检查缓存
    if (useCache && cache.has(cacheKey)) {
      const cached = cache.get(cacheKey);
      if (Date.now() - cached.timestamp < cacheTime) {
        setState({ data: cached.data, loading: false, error: null });
        return cached.data;
      }
    }
    
    // 取消之前的请求
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // 创建新的AbortController
    abortControllerRef.current = new AbortController();
    
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: body ? JSON.stringify(body) : null,
        signal: abortControllerRef.current.signal
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // 更新缓存
      if (useCache) {
        cache.set(cacheKey, { data, timestamp: Date.now() });
      }
      
      setState({ data, loading: false, error: null });
      onSuccess?.(data);
      
      return data;
    } catch (error) {
      if (error.name !== 'AbortError') {
        setState({ data: null, loading: false, error });
        onError?.(error);
        throw error;
      }
    }
  }, [url, method, headers, body, useCache, cacheTime, cacheKey, onSuccess, onError]);
  
  useEffect(() => {
    fetchData();
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchData]);
  
  const refetch = useCallback(() => {
    // 清除缓存
    if (cache.has(cacheKey)) {
      cache.delete(cacheKey);
    }
    return fetchData();
  }, [fetchData, cacheKey]);
  
  return { ...state, refetch };
}

// 使用示例
function ProductList() {
  const { data: products, loading, error, refetch } = useFetch('/api/products', {
    onSuccess: (data) => console.log('产品加载成功:', data),
    onError: (error) => console.error('产品加载失败:', error)
  });
  
  if (loading) return <div>加载产品中...</div>;
  if (error) return <div>加载失败: {error.message}</div>;
  
  return (
    <div>
      <button onClick={refetch}>刷新</button>
      <ul>
        {products?.map(product => (
          <li key={product.id}>{product.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

### useInterval - 定时器

```javascript
/**
 * 声明式的setInterval
 */
export function useInterval(callback, delay) {
  const savedCallback = useRef();
  const intervalId = useRef();
  
  // 保存最新的callback
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);
  
  // 设置定时器
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    
    if (delay !== null) {
      intervalId.current = setInterval(tick, delay);
      return () => clearInterval(intervalId.current);
    }
  }, [delay]);
  
  // 返回控制函数
  const clear = useCallback(() => {
    if (intervalId.current) {
      clearInterval(intervalId.current);
    }
  }, []);
  
  const restart = useCallback(() => {
    clear();
    if (delay !== null) {
      intervalId.current = setInterval(() => savedCallback.current(), delay);
    }
  }, [delay, clear]);
  
  return { clear, restart };
}

// 使用示例
function Timer() {
  const [count, setCount] = useState(0);
  const [delay, setDelay] = useState(1000);
  const [isRunning, setIsRunning] = useState(true);
  
  const { clear, restart } = useInterval(
    () => setCount(c => c + 1),
    isRunning ? delay : null
  );
  
  return (
    <div>
      <h1>计数: {count}</h1>
      <button onClick={() => setIsRunning(!isRunning)}>
        {isRunning ? '暂停' : '开始'}
      </button>
      <button onClick={() => setCount(0)}>重置</button>
      <input
        type="range"
        min="100"
        max="2000"
        value={delay}
        onChange={(e) => {
          setDelay(Number(e.target.value));
          restart();
        }}
      />
      <span>间隔: {delay}ms</span>
    </div>
  );
}
```

### useTimeout - 延时器

```javascript
/**
 * 声明式的setTimeout
 */
export function useTimeout(callback, delay) {
  const savedCallback = useRef();
  const timeoutId = useRef();
  
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);
  
  const set = useCallback(() => {
    if (timeoutId.current) {
      clearTimeout(timeoutId.current);
    }
    
    if (delay !== null) {
      timeoutId.current = setTimeout(() => {
        savedCallback.current();
      }, delay);
    }
  }, [delay]);
  
  const clear = useCallback(() => {
    if (timeoutId.current) {
      clearTimeout(timeoutId.current);
      timeoutId.current = null;
    }
  }, []);
  
  useEffect(() => {
    set();
    return clear;
  }, [delay, set, clear]);
  
  return { clear, reset: set };
}

// 使用示例
function Toast({ message, duration = 3000, onClose }) {
  useTimeout(onClose, duration);
  
  return (
    <div className="toast">
      {message}
      <button onClick={onClose}>×</button>
    </div>
  );
}
```

## DOM和浏览器Hooks

### useEventListener - 事件监听

```javascript
/**
 * 添加事件监听器的Hook
 */
export function useEventListener(eventName, handler, element = window, options = {}) {
  const savedHandler = useRef();
  
  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);
  
  useEffect(() => {
    // 确保元素支持addEventListener
    const isSupported = element && element.addEventListener;
    if (!isSupported) return;
    
    const eventListener = (event) => savedHandler.current(event);
    
    element.addEventListener(eventName, eventListener, options);
    
    return () => {
      element.removeEventListener(eventName, eventListener, options);
    };
  }, [eventName, element, options]);
}

// 使用示例
function KeyboardShortcuts() {
  const [pressedKeys, setPressedKeys] = useState(new Set());
  
  useEventListener('keydown', (e) => {
    setPressedKeys(prev => new Set(prev).add(e.key));
    
    // Ctrl+S 保存
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      console.log('保存操作');
    }
  });
  
  useEventListener('keyup', (e) => {
    setPressedKeys(prev => {
      const next = new Set(prev);
      next.delete(e.key);
      return next;
    });
  });
  
  return (
    <div>
      <h3>按下的键: {Array.from(pressedKeys).join(', ')}</h3>
    </div>
  );
}
```

### useOnClickOutside - 点击外部

```javascript
/**
 * 检测点击元素外部的Hook
 */
export function useOnClickOutside(ref, handler) {
  useEffect(() => {
    const listener = (event) => {
      // 点击了元素内部，不处理
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      
      handler(event);
    };
    
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}

// 使用示例
function Dropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  useOnClickOutside(dropdownRef, () => {
    setIsOpen(false);
  });
  
  return (
    <div ref={dropdownRef} className="dropdown">
      <button onClick={() => setIsOpen(!isOpen)}>
        下拉菜单
      </button>
      {isOpen && (
        <ul className="dropdown-menu">
          <li>选项 1</li>
          <li>选项 2</li>
          <li>选项 3</li>
        </ul>
      )}
    </div>
  );
}
```

### useWindowSize - 窗口尺寸

```javascript
/**
 * 获取窗口尺寸的Hook
 */
export function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: undefined,
    height: undefined
  });
  
  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    }
    
    // 初始化
    handleResize();
    
    // 防抖处理
    let resizeTimer;
    const debouncedResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(handleResize, 150);
    };
    
    window.addEventListener('resize', debouncedResize);
    
    return () => {
      window.removeEventListener('resize', debouncedResize);
      clearTimeout(resizeTimer);
    };
  }, []);
  
  return windowSize;
}

// 带断点的版本
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  });
  
  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    
    const handleChange = (e) => {
      setMatches(e.matches);
    };
    
    // 旧版浏览器兼容
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      mediaQuery.addListener(handleChange);
    }
    
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, [query]);
  
  return matches;
}

// 使用示例
function ResponsiveLayout() {
  const { width } = useWindowSize();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(min-width: 769px) and (max-width: 1024px)');
  const isDesktop = useMediaQuery('(min-width: 1025px)');
  
  return (
    <div>
      <h2>窗口宽度: {width}px</h2>
      <p>
        设备类型: 
        {isMobile && '手机'}
        {isTablet && '平板'}
        {isDesktop && '桌面'}
      </p>
    </div>
  );
}
```

### useIntersectionObserver - 交叉观察

```javascript
/**
 * Intersection Observer Hook
 */
export function useIntersectionObserver(ref, options = {}) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [entry, setEntry] = useState(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
        setEntry(entry);
      },
      options
    );
    
    const element = ref.current;
    if (element) {
      observer.observe(element);
    }
    
    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [ref, options.root, options.rootMargin, options.threshold]);
  
  return { isIntersecting, entry };
}

// 懒加载图片示例
function LazyImage({ src, alt, placeholder }) {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [imageRef, setImageRef] = useState(null);
  const { isIntersecting } = useIntersectionObserver(
    { current: imageRef },
    { threshold: 0.1 }
  );
  
  useEffect(() => {
    if (isIntersecting && src) {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        setImageSrc(src);
      };
    }
  }, [isIntersecting, src]);
  
  return (
    <img
      ref={setImageRef}
      src={imageSrc}
      alt={alt}
      loading="lazy"
    />
  );
}
```

## 表单处理Hooks

### useForm - 表单管理

```javascript
/**
 * 完整的表单管理Hook
 */
export function useForm(initialValues = {}, validationRules = {}) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 验证单个字段
  const validateField = useCallback((name, value) => {
    const rules = validationRules[name];
    if (!rules) return '';
    
    for (const rule of rules) {
      const error = rule(value, values);
      if (error) return error;
    }
    
    return '';
  }, [validationRules, values]);
  
  // 验证所有字段
  const validate = useCallback(() => {
    const newErrors = {};
    
    Object.keys(validationRules).forEach(name => {
      const error = validateField(name, values[name]);
      if (error) {
        newErrors[name] = error;
      }
    });
    
    return newErrors;
  }, [validateField, values]);
  
  // 处理字段变化
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;
    
    setValues(prev => ({ ...prev, [name]: fieldValue }));
    
    // 如果字段已被触摸，立即验证
    if (touched[name]) {
      const error = validateField(name, fieldValue);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  }, [touched, validateField]);
  
  // 处理字段失焦
  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    
    setTouched(prev => ({ ...prev, [name]: true }));
    
    const error = validateField(name, values[name]);
    setErrors(prev => ({ ...prev, [name]: error }));
  }, [validateField, values]);
  
  // 处理表单提交
  const handleSubmit = useCallback((onSubmit) => async (e) => {
    e.preventDefault();
    
    // 标记所有字段为已触摸
    const allTouched = Object.keys(values).reduce(
      (acc, key) => ({ ...acc, [key]: true }),
      {}
    );
    setTouched(allTouched);
    
    // 验证所有字段
    const validationErrors = validate();
    setErrors(validationErrors);
    
    if (Object.keys(validationErrors).length === 0) {
      setIsSubmitting(true);
      try {
        await onSubmit(values);
      } finally {
        setIsSubmitting(false);
      }
    }
  }, [values, validate]);
  
  // 重置表单
  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);
  
  // 设置字段值
  const setFieldValue = useCallback((name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  }, [touched, validateField]);
  
  // 设置字段错误
  const setFieldError = useCallback((name, error) => {
    setErrors(prev => ({ ...prev, [name]: error }));
  }, []);
  
  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    setFieldValue,
    setFieldError,
    isValid: Object.keys(errors).length === 0
  };
}

// 验证规则
export const validators = {
  required: (message = '此字段必填') => (value) => {
    if (!value || (typeof value === 'string' && !value.trim())) {
      return message;
    }
    return '';
  },
  
  minLength: (min, message) => (value) => {
    if (value && value.length < min) {
      return message || `至少需要${min}个字符`;
    }
    return '';
  },
  
  maxLength: (max, message) => (value) => {
    if (value && value.length > max) {
      return message || `最多${max}个字符`;
    }
    return '';
  },
  
  email: (message = '邮箱格式不正确') => (value) => {
    if (value && !/\S+@\S+\.\S+/.test(value)) {
      return message;
    }
    return '';
  },
  
  pattern: (regex, message = '格式不正确') => (value) => {
    if (value && !regex.test(value)) {
      return message;
    }
    return '';
  },
  
  matches: (fieldName, message) => (value, allValues) => {
    if (value !== allValues[fieldName]) {
      return message || `必须与${fieldName}字段匹配`;
    }
    return '';
  }
};

// 使用示例
function RegistrationForm() {
  const form = useForm(
    {
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    },
    {
      username: [
        validators.required(),
        validators.minLength(3, '用户名至少3个字符'),
        validators.maxLength(20, '用户名最多20个字符')
      ],
      email: [
        validators.required(),
        validators.email()
      ],
      password: [
        validators.required(),
        validators.minLength(6, '密码至少6个字符'),
        validators.pattern(/[A-Z]/, '密码必须包含大写字母'),
        validators.pattern(/[0-9]/, '密码必须包含数字')
      ],
      confirmPassword: [
        validators.required(),
        validators.matches('password', '两次密码输入不一致')
      ]
    }
  );
  
  const handleSubmit = async (values) => {
    console.log('提交表单:', values);
    // 调用API注册
    await api.register(values);
  };
  
  return (
    <form onSubmit={form.handleSubmit(handleSubmit)}>
      <div>
        <input
          name="username"
          value={form.values.username}
          onChange={form.handleChange}
          onBlur={form.handleBlur}
          placeholder="用户名"
        />
        {form.touched.username && form.errors.username && (
          <span className="error">{form.errors.username}</span>
        )}
      </div>
      
      <div>
        <input
          name="email"
          type="email"
          value={form.values.email}
          onChange={form.handleChange}
          onBlur={form.handleBlur}
          placeholder="邮箱"
        />
        {form.touched.email && form.errors.email && (
          <span className="error">{form.errors.email}</span>
        )}
      </div>
      
      <div>
        <input
          name="password"
          type="password"
          value={form.values.password}
          onChange={form.handleChange}
          onBlur={form.handleBlur}
          placeholder="密码"
        />
        {form.touched.password && form.errors.password && (
          <span className="error">{form.errors.password}</span>
        )}
      </div>
      
      <div>
        <input
          name="confirmPassword"
          type="password"
          value={form.values.confirmPassword}
          onChange={form.handleChange}
          onBlur={form.handleBlur}
          placeholder="确认密码"
        />
        {form.touched.confirmPassword && form.errors.confirmPassword && (
          <span className="error">{form.errors.confirmPassword}</span>
        )}
      </div>
      
      <button type="submit" disabled={form.isSubmitting || !form.isValid}>
        {form.isSubmitting ? '提交中...' : '注册'}
      </button>
      
      <button type="button" onClick={form.reset}>
        重置
      </button>
    </form>
  );
}
```

## 工具类Hooks

### useIsMounted - 组件挂载状态

```javascript
/**
 * 检查组件是否已挂载
 */
export function useIsMounted() {
  const isMounted = useRef(true);
  
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  return useCallback(() => isMounted.current, []);
}

// 使用示例
function DataLoader() {
  const [data, setData] = useState(null);
  const isMounted = useIsMounted();
  
  const loadData = async () => {
    const result = await fetchData();
    
    // 只在组件仍然挂载时更新状态
    if (isMounted()) {
      setData(result);
    }
  };
  
  useEffect(() => {
    loadData();
  }, []);
  
  return <div>{data ? `数据: ${data}` : '加载中...'}</div>;
}
```

### useWhyDidYouUpdate - 调试Hook

```javascript
/**
 * 帮助调试组件重渲染原因
 */
export function useWhyDidYouUpdate(name, props) {
  const previousProps = useRef();
  
  useEffect(() => {
    if (previousProps.current) {
      const allKeys = Object.keys({ ...previousProps.current, ...props });
      const changedProps = {};
      
      allKeys.forEach(key => {
        if (previousProps.current[key] !== props[key]) {
          changedProps[key] = {
            from: previousProps.current[key],
            to: props[key]
          };
        }
      });
      
      if (Object.keys(changedProps).length) {
        console.log('[why-did-you-update]', name, changedProps);
      }
    }
    
    previousProps.current = props;
  });
}

// 使用示例
function ExpensiveComponent(props) {
  // 在开发环境中使用
  if (process.env.NODE_ENV === 'development') {
    useWhyDidYouUpdate('ExpensiveComponent', props);
  }
  
  return <div>{/* 组件内容 */}</div>;
}
```

### useLatest - 获取最新值

```javascript
/**
 * 始终获取最新值的ref
 */
export function useLatest(value) {
  const ref = useRef(value);
  ref.current = value;
  return ref;
}

// 使用示例
function DelayedLogger({ message }) {
  const latestMessage = useLatest(message);
  
  const logMessage = useCallback(() => {
    setTimeout(() => {
      // 3秒后打印最新的message，而不是3秒前的
      console.log(latestMessage.current);
    }, 3000);
  }, []); // 注意：没有依赖项
  
  return <button onClick={logMessage}>3秒后打印消息</button>;
}
```

### useLockBodyScroll - 锁定滚动

```javascript
/**
 * 锁定body滚动
 */
export function useLockBodyScroll(lock = true) {
  useLayoutEffect(() => {
    if (!lock) return;
    
    // 保存原始样式
    const originalStyle = window.getComputedStyle(document.body).overflow;
    
    // 锁定滚动
    document.body.style.overflow = 'hidden';
    
    // 恢复滚动
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, [lock]);
}

// 使用示例
function Modal({ isOpen, onClose, children }) {
  // 模态框打开时锁定背景滚动
  useLockBodyScroll(isOpen);
  
  if (!isOpen) return null;
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}
```

## 进阶组合Hooks

### useWebSocket - WebSocket连接

```javascript
/**
 * WebSocket连接管理
 */
export function useWebSocket(url, options = {}) {
  const [readyState, setReadyState] = useState(WebSocket.CONNECTING);
  const [messages, setMessages] = useState([]);
  const [lastMessage, setLastMessage] = useState(null);
  const ws = useRef(null);
  const reconnectTimer = useRef(null);
  const messageQueue = useRef([]);
  
  const {
    onOpen,
    onMessage,
    onError,
    onClose,
    reconnect = true,
    reconnectInterval = 5000,
    reconnectAttempts = 5,
    shouldReconnect = () => true,
    filter,
    retryOnError = true
  } = options;
  
  const reconnectCount = useRef(0);
  
  const sendMessage = useCallback((message) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(
        typeof message === 'string' ? message : JSON.stringify(message)
      );
    } else {
      // 如果连接未打开，将消息加入队列
      messageQueue.current.push(message);
    }
  }, []);
  
  const connect = useCallback(() => {
    try {
      ws.current = new WebSocket(url);
      
      ws.current.onopen = (event) => {
        setReadyState(WebSocket.OPEN);
        reconnectCount.current = 0;
        
        // 发送队列中的消息
        while (messageQueue.current.length > 0) {
          sendMessage(messageQueue.current.shift());
        }
        
        onOpen?.(event);
      };
      
      ws.current.onmessage = (event) => {
        const message = {
          data: event.data,
          timestamp: Date.now(),
          event
        };
        
        // 应用过滤器
        if (filter && !filter(message)) {
          return;
        }
        
        setLastMessage(message);
        setMessages(prev => [...prev, message]);
        onMessage?.(message);
      };
      
      ws.current.onerror = (event) => {
        onError?.(event);
        
        if (retryOnError) {
          ws.current?.close();
        }
      };
      
      ws.current.onclose = (event) => {
        setReadyState(WebSocket.CLOSED);
        onClose?.(event);
        
        // 尝试重连
        if (
          reconnect &&
          reconnectCount.current < reconnectAttempts &&
          shouldReconnect(event)
        ) {
          reconnectTimer.current = setTimeout(() => {
            reconnectCount.current++;
            connect();
          }, reconnectInterval);
        }
      };
    } catch (error) {
      onError?.(error);
    }
  }, [url, onOpen, onMessage, onError, onClose, reconnect, reconnectInterval, reconnectAttempts, shouldReconnect, filter, retryOnError, sendMessage]);
  
  // 初始连接
  useEffect(() => {
    connect();
    
    return () => {
      reconnectCount.current = reconnectAttempts; // 防止重连
      clearTimeout(reconnectTimer.current);
      ws.current?.close();
    };
  }, [connect, reconnectAttempts]);
  
  const disconnect = useCallback(() => {
    reconnectCount.current = reconnectAttempts; // 防止重连
    clearTimeout(reconnectTimer.current);
    ws.current?.close();
  }, [reconnectAttempts]);
  
  const clearMessages = useCallback(() => {
    setMessages([]);
    setLastMessage(null);
  }, []);
  
  return {
    sendMessage,
    lastMessage,
    messages,
    readyState,
    disconnect,
    clearMessages
  };
}

// 使用示例
function ChatApp() {
  const { sendMessage, messages, readyState } = useWebSocket(
    'wss://chat.example.com',
    {
      onOpen: () => console.log('WebSocket连接已建立'),
      onMessage: (message) => console.log('收到消息:', message),
      onError: (error) => console.error('WebSocket错误:', error),
      onClose: () => console.log('WebSocket连接已关闭'),
      reconnect: true,
      filter: (message) => {
        // 过滤心跳消息
        try {
          const data = JSON.parse(message.data);
          return data.type !== 'heartbeat';
        } catch {
          return true;
        }
      }
    }
  );
  
  const [inputMessage, setInputMessage] = useState('');
  
  const handleSend = () => {
    if (inputMessage.trim()) {
      sendMessage({
        type: 'chat',
        text: inputMessage,
        timestamp: Date.now()
      });
      setInputMessage('');
    }
  };
  
  const connectionStatus = {
    [WebSocket.CONNECTING]: '连接中...',
    [WebSocket.OPEN]: '已连接',
    [WebSocket.CLOSING]: '关闭中...',
    [WebSocket.CLOSED]: '已断开'
  };
  
  return (
    <div>
      <div>状态: {connectionStatus[readyState]}</div>
      <div className="messages">
        {messages.map((msg, index) => (
          <div key={index}>
            {JSON.parse(msg.data).text}
          </div>
        ))}
      </div>
      <input
        value={inputMessage}
        onChange={(e) => setInputMessage(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
        disabled={readyState !== WebSocket.OPEN}
      />
      <button onClick={handleSend} disabled={readyState !== WebSocket.OPEN}>
        发送
      </button>
    </div>
  );
}
```

### useInfiniteScroll - 无限滚动

```javascript
/**
 * 无限滚动加载
 */
export function useInfiniteScroll({
  callback,
  hasMore = true,
  loading = false,
  threshold = 100,
  rootMargin = '0px',
  root = null
}) {
  const observer = useRef(null);
  const lastElementRef = useCallback(
    (node) => {
      if (loading) return;
      
      if (observer.current) {
        observer.current.disconnect();
      }
      
      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore && !loading) {
            callback();
          }
        },
        {
          root,
          rootMargin,
          threshold: threshold / 100
        }
      );
      
      if (node) {
        observer.current.observe(node);
      }
    },
    [loading, hasMore, callback, threshold, rootMargin, root]
  );
  
  useEffect(() => {
    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, []);
  
  return lastElementRef;
}

// 使用示例
function InfiniteList() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  
  const loadMore = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/items?page=${page}`);
      const newItems = await response.json();
      
      setItems(prev => [...prev, ...newItems]);
      setPage(prev => prev + 1);
      setHasMore(newItems.length > 0);
    } catch (error) {
      console.error('加载失败:', error);
    } finally {
      setLoading(false);
    }
  }, [page]);
  
  const lastItemRef = useInfiniteScroll({
    callback: loadMore,
    hasMore,
    loading
  });
  
  return (
    <div>
      {items.map((item, index) => {
        if (index === items.length - 1) {
          return (
            <div ref={lastItemRef} key={item.id}>
              {item.title}
            </div>
          );
        }
        return <div key={item.id}>{item.title}</div>;
      })}
      {loading && <div>加载中...</div>}
      {!hasMore && <div>没有更多了</div>}
    </div>
  );
}
```

## 工具函数

```javascript
// 模拟API调用
const api = {
  getUser: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { id, name: `用户${id}`, email: `user${id}@example.com` };
  },
  
  register: async (data) => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    return { success: true, userId: Math.random() };
  },
  
  search: async (query) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [
      { id: 1, title: `结果1 for ${query}` },
      { id: 2, title: `结果2 for ${query}` }
    ];
  }
};

// 辅助函数
async function performSearch(query) {
  // 模拟搜索API
  const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
  return response.json();
}

function fetchData() {
  return new Promise(resolve => {
    setTimeout(() => resolve('数据加载完成'), 1000);
  });
}

// 导出所有Hooks
export default {
  // 状态管理
  useLocalStorage,
  useSessionStorage,
  useToggle,
  usePrevious,
  
  // 性能优化
  useDebounce,
  useDebounceCallback,
  useThrottle,
  useThrottleCallback,
  
  // 副作用管理
  useAsync,
  useAsyncWithCancel,
  useFetch,
  useInterval,
  useTimeout,
  
  // DOM和浏览器
  useEventListener,
  useOnClickOutside,
  useWindowSize,
  useMediaQuery,
  useIntersectionObserver,
  
  // 表单处理
  useForm,
  validators,
  
  // 工具类
  useIsMounted,
  useWhyDidYouUpdate,
  useLatest,
  useLockBodyScroll,
  
  // 进阶
  useWebSocket,
  useInfiniteScroll
};
```

这个自定义Hooks库提供了各种常用的React Hooks，可以大大提高开发效率和代码复用性。每个Hook都包含了详细的注释和使用示例。