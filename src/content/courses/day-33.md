---
day: 33
phase: "react-development"
title: "性能优化与React.memo"
description: "深入学习React性能优化技术，掌握React.memo、useMemo、useCallback的使用时机，学习性能分析工具和优化策略"
objectives:
  - "识别和分析React应用的性能瓶颈"
  - "掌握React.memo的原理和最佳实践"
  - "正确使用useMemo和useCallback"
  - "学习虚拟列表和懒加载技术"
  - "避免过度优化和常见陷阱"
estimatedTime: 180
difficulty: "advanced"
prerequisites: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 25, 26, 27, 28, 29, 30, 31, 32]
tags:
  - "React"
  - "性能优化"
  - "React.memo"
  - "useMemo"
  - "useCallback"
resources:
  - title: "React性能优化官方文档"
    url: "https://react.dev/learn/render-and-commit"
    type: "documentation"
  - title: "React DevTools Profiler指南"
    url: "https://react.dev/learn/react-developer-tools"
    type: "article"
  - title: "Web性能优化最佳实践"
    url: "https://web.dev/vitals/"
    type: "article"
  - title: "React性能优化技巧"
    url: "https://kentcdodds.com/blog/optimize-react-re-renders"
    type: "article"
codeExamples:
  - title: "性能优化示例"
    language: "javascript"
    path: "/code-examples/day-33/performance-optimization.jsx"
  - title: "虚拟列表实现"
    language: "javascript"
    path: "/code-examples/day-33/virtual-list.jsx"
---

# Day 33: 性能优化与React.memo

## 📋 学习目标

今天我们将深入探讨React性能优化的核心技术。性能优化是构建大型React应用的关键技能，但记住：**过早优化是万恶之源**。我们需要先识别问题，再针对性地优化。

## 🔍 识别性能问题

### 1. 性能问题的常见症状

```jsx
// 性能问题的典型场景
function SlowApp() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // ❌ 问题1：每次渲染都创建新数组
  const categories = ['all', 'electronics', 'books', 'clothing'];
  
  // ❌ 问题2：每次渲染都重新计算
  const filteredProducts = products
    .filter(p => p.name.includes(searchTerm))
    .filter(p => selectedCategory === 'all' || p.category === selectedCategory)
    .sort((a, b) => b.price - a.price);
  
  // ❌ 问题3：每次渲染都创建新函数
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };
  
  return (
    <div>
      <SearchBar onSearch={handleSearch} />
      <CategoryFilter 
        categories={categories}
        selected={selectedCategory}
        onChange={setSelectedCategory}
      />
      <ProductList products={filteredProducts} />
    </div>
  );
}

// 性能问题症状：
// 1. 输入延迟 - 在搜索框输入时有明显卡顿
// 2. 滚动卡顿 - 列表滚动不流畅
// 3. 交互延迟 - 点击响应慢
// 4. 内存泄漏 - 页面越用越卡
```

### 2. 使用React DevTools Profiler

```jsx
// 性能分析步骤
// 1. 安装React DevTools浏览器扩展
// 2. 打开Profiler面板
// 3. 点击录制按钮
// 4. 执行要分析的操作
// 5. 停止录制，查看火焰图

// 使用Profiler API进行程序化分析
import { Profiler } from 'react';

function onRenderCallback(
  id, // 发生提交的Profiler树的id
  phase, // "mount" | "update"
  actualDuration, // 本次更新花费的时间
  baseDuration, // 未使用memo的情况下完整渲染的估计时间
  startTime, // 本次更新开始的时间
  commitTime, // 本次更新提交的时间
  interactions // 本次更新涉及的交互集合
) {
  console.log(`${id} (${phase}) took ${actualDuration}ms`);
}

function ProfiledApp() {
  return (
    <Profiler id="App" onRender={onRenderCallback}>
      <App />
    </Profiler>
  );
}

// 自定义性能监控Hook
function useRenderCount(componentName) {
  const renderCount = useRef(0);
  
  useEffect(() => {
    renderCount.current += 1;
    console.log(`${componentName} rendered ${renderCount.current} times`);
  });
  
  return renderCount.current;
}
```

### 3. Chrome DevTools Performance

```jsx
// 使用Performance API测量关键指标
function measurePerformance(markName, fn) {
  performance.mark(`${markName}-start`);
  
  const result = fn();
  
  performance.mark(`${markName}-end`);
  performance.measure(
    markName,
    `${markName}-start`,
    `${markName}-end`
  );
  
  const measure = performance.getEntriesByName(markName)[0];
  console.log(`${markName} took ${measure.duration}ms`);
  
  return result;
}

// 使用示例
const expensiveResult = measurePerformance('expensive-calculation', () => {
  return calculateExpensiveValue(data);
});

// 监控长任务
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (entry.duration > 50) { // 超过50ms的任务
      console.warn('Long task detected:', entry);
    }
  }
});

observer.observe({ entryTypes: ['longtask'] });
```

## 🎯 React.memo深入解析

### 1. React.memo基础

```jsx
// React.memo的工作原理
const MyComponent = React.memo(function MyComponent(props) {
  console.log('MyComponent rendered');
  return <div>{props.value}</div>;
});

// 等价于类组件的PureComponent
class MyPureComponent extends React.PureComponent {
  render() {
    console.log('MyPureComponent rendered');
    return <div>{this.props.value}</div>;
  }
}

// React.memo只对props进行浅比较
const User = React.memo(({ user }) => {
  return (
    <div>
      <h3>{user.name}</h3>
      <p>{user.email}</p>
    </div>
  );
});

// ❌ 这样会导致每次都重新渲染
function Parent() {
  const [count, setCount] = useState(0);
  
  // 每次渲染都创建新对象
  const user = { name: 'John', email: 'john@example.com' };
  
  return (
    <>
      <button onClick={() => setCount(count + 1)}>Count: {count}</button>
      <User user={user} />
    </>
  );
}

// ✅ 正确的做法
function Parent() {
  const [count, setCount] = useState(0);
  
  // 使用useMemo保持引用稳定
  const user = useMemo(() => ({
    name: 'John',
    email: 'john@example.com'
  }), []);
  
  return (
    <>
      <button onClick={() => setCount(count + 1)}>Count: {count}</button>
      <User user={user} />
    </>
  );
}
```

### 2. 自定义比较函数

```jsx
// 自定义比较逻辑
const ExpensiveList = React.memo(
  function ExpensiveList({ items, filter }) {
    console.log('ExpensiveList rendered');
    
    const filteredItems = items.filter(item => 
      item.name.toLowerCase().includes(filter.toLowerCase())
    );
    
    return (
      <ul>
        {filteredItems.map(item => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    );
  },
  // 自定义比较函数
  (prevProps, nextProps) => {
    // 返回true表示相等（不重新渲染）
    // 返回false表示不相等（重新渲染）
    
    // 只在filter改变时重新渲染
    if (prevProps.filter !== nextProps.filter) {
      return false;
    }
    
    // 检查items数组的内容是否真的改变了
    if (prevProps.items.length !== nextProps.items.length) {
      return false;
    }
    
    // 深度比较items（注意性能影响）
    return prevProps.items.every((item, index) => 
      item.id === nextProps.items[index].id
    );
  }
);

// 使用第三方库进行深度比较
import isEqual from 'lodash/isEqual';

const DeepCompareComponent = React.memo(
  MyComponent,
  (prevProps, nextProps) => isEqual(prevProps, nextProps)
);

// 选择性memo化
const SelectiveMemo = React.memo(
  function SelectiveMemo({ data, config, onUpdate }) {
    return (
      <div>
        <DataDisplay data={data} />
        <ConfigPanel config={config} />
        <button onClick={onUpdate}>Update</button>
      </div>
    );
  },
  (prevProps, nextProps) => {
    // 只比较data和config，忽略onUpdate
    return (
      prevProps.data === nextProps.data &&
      prevProps.config === nextProps.config
    );
  }
);
```

### 3. 何时使用React.memo

```jsx
// ✅ 适合使用React.memo的场景

// 1. 组件接收复杂props且渲染开销大
const ComplexChart = React.memo(({ data, options }) => {
  // 复杂的图表渲染逻辑
  return <Chart data={data} options={options} />;
});

// 2. 组件在列表中频繁渲染
const TodoItem = React.memo(({ todo, onToggle, onDelete }) => {
  return (
    <li>
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
      />
      <span>{todo.text}</span>
      <button onClick={() => onDelete(todo.id)}>删除</button>
    </li>
  );
});

// 3. 父组件频繁更新但子组件props很少变化
const Header = React.memo(({ user, onLogout }) => {
  return (
    <header>
      <h1>Welcome, {user.name}</h1>
      <button onClick={onLogout}>Logout</button>
    </header>
  );
});

// ❌ 不适合使用React.memo的场景

// 1. 组件很简单，渲染开销小
const SimpleText = ({ text }) => <span>{text}</span>;

// 2. 组件几乎每次都会更新
const Timer = ({ time }) => <div>Current time: {time}</div>;

// 3. 组件使用了children prop
const Container = React.memo(({ children }) => {
  // children几乎总是新的引用
  return <div className="container">{children}</div>;
});
```

## 💡 useMemo和useCallback最佳实践

### 1. useMemo的正确使用

```jsx
// useMemo用于缓存计算结果
function ExpensiveComponent({ data, filter }) {
  // ✅ 好的使用场景：计算开销大
  const processedData = useMemo(() => {
    console.log('Processing data...');
    return data
      .filter(item => item.active)
      .map(item => ({
        ...item,
        displayName: item.firstName + ' ' + item.lastName,
        score: calculateComplexScore(item)
      }))
      .sort((a, b) => b.score - a.score);
  }, [data]); // 只在data变化时重新计算
  
  // ❌ 不好的使用场景：简单计算
  const total = useMemo(() => {
    return items.length;
  }, [items]); // 过度优化，直接 items.length 即可
  
  // ✅ 创建稳定的对象引用
  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: { beginAtZero: true }
    }
  }), []); // 空依赖，只创建一次
  
  return (
    <div>
      <Chart data={processedData} options={chartOptions} />
    </div>
  );
}

// 条件性使用useMemo
function ConditionalMemo({ items, enableSort }) {
  const displayItems = useMemo(() => {
    if (!enableSort) return items;
    
    // 只在需要排序时才执行昂贵操作
    return [...items].sort((a, b) => b.priority - a.priority);
  }, [items, enableSort]);
  
  return <ItemList items={displayItems} />;
}

// 使用useMemo优化Context value
function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  
  // ✅ 避免每次渲染创建新对象
  const value = useMemo(() => ({
    theme,
    toggleTheme: () => setTheme(t => t === 'light' ? 'dark' : 'light')
  }), [theme]);
  
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}
```

### 2. useCallback的正确使用

```jsx
// useCallback用于缓存函数引用
function SearchableList({ items }) {
  const [searchTerm, setSearchTerm] = useState('');
  
  // ✅ 好的使用场景：传递给memo化的子组件
  const handleSearch = useCallback((term) => {
    setSearchTerm(term);
  }, []); // 空依赖，函数永不改变
  
  // ✅ 依赖外部值的回调
  const handleItemClick = useCallback((itemId) => {
    console.log(`Clicked item ${itemId} with search: ${searchTerm}`);
    // 处理点击逻辑
  }, [searchTerm]); // 依赖searchTerm
  
  // ❌ 不必要的useCallback
  const simpleHandler = useCallback(() => {
    console.log('clicked');
  }, []); // 如果没有传给子组件或作为依赖，则不需要
  
  return (
    <div>
      <SearchBar onSearch={handleSearch} />
      <ItemList 
        items={items}
        searchTerm={searchTerm}
        onItemClick={handleItemClick}
      />
    </div>
  );
}

// 配合React.memo使用
const ExpensiveChild = React.memo(({ onClick, data }) => {
  console.log('ExpensiveChild rendered');
  return (
    <div onClick={onClick}>
      {/* 复杂渲染 */}
    </div>
  );
});

function Parent() {
  const [count, setCount] = useState(0);
  const [data, setData] = useState([]);
  
  // ✅ 使用useCallback防止子组件不必要的渲染
  const handleClick = useCallback(() => {
    console.log('Current data length:', data.length);
  }, [data.length]);
  
  return (
    <div>
      <button onClick={() => setCount(count + 1)}>
        Count: {count}
      </button>
      <ExpensiveChild onClick={handleClick} data={data} />
    </div>
  );
}

// 自定义Hook中的useCallback
function useDebounce(callback, delay) {
  const [debounceTimer, setDebounceTimer] = useState(null);
  
  const debouncedCallback = useCallback((...args) => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    
    const newTimer = setTimeout(() => {
      callback(...args);
    }, delay);
    
    setDebounceTimer(newTimer);
  }, [callback, delay, debounceTimer]);
  
  // 清理定时器
  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);
  
  return debouncedCallback;
}
```

### 3. 避免过度优化

```jsx
// ❌ 过度优化的例子
function OverOptimized({ name, age }) {
  // 不需要memo化简单计算
  const displayName = useMemo(() => name.toUpperCase(), [name]);
  
  // 不需要缓存没有传递给子组件的函数
  const logInfo = useCallback(() => {
    console.log(name, age);
  }, [name, age]);
  
  // 不需要memo化原始值
  const doubleAge = useMemo(() => age * 2, [age]);
  
  return (
    <div onClick={logInfo}>
      {displayName} is {doubleAge / 2} years old
    </div>
  );
}

// ✅ 适度优化
function ProperlyOptimized({ users, onUserSelect }) {
  const [sortBy, setSortBy] = useState('name');
  const [filter, setFilter] = useState('');
  
  // 只优化真正昂贵的计算
  const processedUsers = useMemo(() => {
    let result = users;
    
    // 过滤
    if (filter) {
      result = result.filter(user => 
        user.name.toLowerCase().includes(filter.toLowerCase())
      );
    }
    
    // 排序
    result = [...result].sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      return b.score - a.score;
    });
    
    return result;
  }, [users, sortBy, filter]);
  
  // 只缓存传递给memo组件的回调
  const handleUserClick = useCallback((userId) => {
    const user = users.find(u => u.id === userId);
    onUserSelect(user);
  }, [users, onUserSelect]);
  
  return (
    <div>
      <FilterBar value={filter} onChange={setFilter} />
      <SortSelector value={sortBy} onChange={setSortBy} />
      <UserList 
        users={processedUsers}
        onUserClick={handleUserClick}
      />
    </div>
  );
}
```

## 🚀 高级优化技术

### 1. 虚拟列表（Virtual Scrolling）

```jsx
// 使用react-window实现虚拟列表
import { FixedSizeList } from 'react-window';

function VirtualList({ items }) {
  const Row = ({ index, style }) => (
    <div style={style}>
      <div className="list-item">
        <h4>{items[index].title}</h4>
        <p>{items[index].description}</p>
      </div>
    </div>
  );
  
  return (
    <FixedSizeList
      height={600} // 容器高度
      itemCount={items.length}
      itemSize={100} // 每项高度
      width="100%"
    >
      {Row}
    </FixedSizeList>
  );
}

// 自定义虚拟列表实现
function CustomVirtualList({ items, itemHeight, containerHeight }) {
  const [scrollTop, setScrollTop] = useState(0);
  
  // 计算可见范围
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(
    items.length - 1,
    Math.floor((scrollTop + containerHeight) / itemHeight)
  );
  
  // 只渲染可见项
  const visibleItems = [];
  for (let i = startIndex; i <= endIndex; i++) {
    visibleItems.push(
      <div
        key={items[i].id}
        style={{
          position: 'absolute',
          top: i * itemHeight,
          height: itemHeight,
          width: '100%'
        }}
      >
        {items[i].content}
      </div>
    );
  }
  
  const handleScroll = (e) => {
    setScrollTop(e.target.scrollTop);
  };
  
  return (
    <div
      style={{
        height: containerHeight,
        overflow: 'auto',
        position: 'relative'
      }}
      onScroll={handleScroll}
    >
      {/* 占位元素，撑开滚动区域 */}
      <div style={{ height: items.length * itemHeight }} />
      {/* 只渲染可见项 */}
      {visibleItems}
    </div>
  );
}

// 动态高度虚拟列表
import { VariableSizeList } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';

function DynamicVirtualList({ items }) {
  const itemSizes = useRef({});
  const listRef = useRef();
  
  const getItemSize = (index) => {
    return itemSizes.current[index] || 100; // 默认高度
  };
  
  const Row = ({ index, style }) => {
    const rowRef = useRef();
    
    useEffect(() => {
      if (rowRef.current) {
        const height = rowRef.current.getBoundingClientRect().height;
        if (itemSizes.current[index] !== height) {
          itemSizes.current[index] = height;
          listRef.current.resetAfterIndex(index);
        }
      }
    }, [index]);
    
    return (
      <div style={style}>
        <div ref={rowRef} className="dynamic-item">
          {items[index].content}
        </div>
      </div>
    );
  };
  
  return (
    <AutoSizer>
      {({ height, width }) => (
        <VariableSizeList
          ref={listRef}
          height={height}
          itemCount={items.length}
          itemSize={getItemSize}
          width={width}
        >
          {Row}
        </VariableSizeList>
      )}
    </AutoSizer>
  );
}
```

### 2. 懒加载和代码分割

```jsx
// 组件懒加载
const HeavyComponent = lazy(() => import('./HeavyComponent'));

function App() {
  const [showHeavy, setShowHeavy] = useState(false);
  
  return (
    <div>
      <button onClick={() => setShowHeavy(true)}>
        加载重型组件
      </button>
      
      {showHeavy && (
        <Suspense fallback={<Loading />}>
          <HeavyComponent />
        </Suspense>
      )}
    </div>
  );
}

// 路由级懒加载
const routes = [
  {
    path: '/dashboard',
    component: lazy(() => import('./pages/Dashboard'))
  },
  {
    path: '/analytics',
    component: lazy(() => import('./pages/Analytics'))
  }
];

// 条件懒加载
function ConditionalLazyLoad({ userRole }) {
  const AdminPanel = useMemo(() => {
    if (userRole === 'admin') {
      return lazy(() => import('./AdminPanel'));
    }
    return null;
  }, [userRole]);
  
  if (!AdminPanel) return null;
  
  return (
    <Suspense fallback={<Loading />}>
      <AdminPanel />
    </Suspense>
  );
}

// 预加载组件
const preloadComponent = (componentPath) => {
  import(componentPath);
};

// 在用户可能需要之前预加载
<Link 
  to="/heavy-page"
  onMouseEnter={() => preloadComponent('./pages/HeavyPage')}
>
  Heavy Page
</Link>

// 图片懒加载
function LazyImage({ src, alt, placeholder }) {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [imageRef, setImageRef] = useState();
  
  const onIntersection = (entries) => {
    const [entry] = entries;
    if (entry.isIntersecting) {
      setImageSrc(src);
    }
  };
  
  useEffect(() => {
    if (!imageRef) return;
    
    const observer = new IntersectionObserver(onIntersection, {
      threshold: 0.1,
      rootMargin: '50px'
    });
    
    observer.observe(imageRef);
    
    return () => observer.disconnect();
  }, [imageRef, src]);
  
  return (
    <img
      ref={setImageRef}
      src={imageSrc}
      alt={alt}
      loading="lazy" // 原生懒加载
    />
  );
}
```

### 3. 状态优化策略

```jsx
// 状态下沉 - 将状态移到最近的共同父组件
function OptimizedForm() {
  // ❌ 状态提升过高
  // const [formData, setFormData] = useState({
  //   name: '', email: '', address: '', phone: ''
  // });
  
  // ✅ 状态下沉到各个字段
  return (
    <form>
      <NameField />
      <EmailField />
      <AddressField />
      <PhoneField />
    </form>
  );
}

function NameField() {
  const [name, setName] = useState('');
  
  return (
    <input
      value={name}
      onChange={(e) => setName(e.target.value)}
      placeholder="Name"
    />
  );
}

// 状态分离 - 分离频繁更新和稳定的状态
function SplitState() {
  // 频繁更新的状态
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  // 稳定的状态
  const [userProfile, setUserProfile] = useState(null);
  
  // 将频繁更新的部分隔离
  return (
    <div>
      <MouseTracker position={mousePosition} onChange={setMousePosition} />
      <UserProfileDisplay profile={userProfile} />
    </div>
  );
}

// 使用多个state而非单个对象
function MultipleStates() {
  // ❌ 单个对象状态
  // const [state, setState] = useState({
  //   loading: false,
  //   data: null,
  //   error: null,
  //   filter: ''
  // });
  
  // ✅ 分离的状态
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('');
  
  // 只有相关状态改变时才重新渲染
}

// 使用useReducer优化复杂状态更新
function ComplexStateComponent() {
  const [state, dispatch] = useReducer(reducer, initialState);
  
  // 批量更新，只触发一次渲染
  const handleComplexUpdate = useCallback(() => {
    dispatch({ type: 'BATCH_UPDATE', payload: { /* ... */ } });
  }, []);
  
  return <ComplexUI state={state} onUpdate={handleComplexUpdate} />;
}
```

## 💼 实战项目：性能优化实践

### 优化一个产品列表应用

```jsx
// 优化前的代码
function SlowProductList() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // 问题：每次渲染都过滤和排序
  const displayProducts = products
    .filter(p => p.name.includes(searchTerm))
    .filter(p => selectedCategory === 'all' || p.category === selectedCategory)
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'price') return a.price - b.price;
      return 0;
    });
  
  return (
    <div>
      <input 
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <select onChange={(e) => setSortBy(e.target.value)}>
        <option value="name">Name</option>
        <option value="price">Price</option>
      </select>
      <div>
        {displayProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

// 优化后的代码
const ProductCard = React.memo(({ product, onAddToCart }) => {
  console.log(`Rendering ProductCard: ${product.id}`);
  
  return (
    <div className="product-card">
      <img src={product.image} alt={product.name} loading="lazy" />
      <h3>{product.name}</h3>
      <p>${product.price}</p>
      <button onClick={() => onAddToCart(product.id)}>
        Add to Cart
      </button>
    </div>
  );
});

function OptimizedProductList() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // 使用useMemo缓存过滤和排序结果
  const displayProducts = useMemo(() => {
    console.log('Recalculating products...');
    
    let result = products;
    
    // 过滤
    if (searchTerm) {
      result = result.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedCategory !== 'all') {
      result = result.filter(p => p.category === selectedCategory);
    }
    
    // 排序
    result = [...result].sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'price') return a.price - b.price;
      return 0;
    });
    
    return result;
  }, [products, searchTerm, sortBy, selectedCategory]);
  
  // 使用useCallback缓存事件处理器
  const handleAddToCart = useCallback((productId) => {
    console.log('Adding to cart:', productId);
    // 添加到购物车的逻辑
  }, []);
  
  // 防抖搜索输入
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(debouncedSearchTerm);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [debouncedSearchTerm]);
  
  return (
    <div>
      <div className="filters">
        <input 
          value={debouncedSearchTerm}
          onChange={(e) => setDebouncedSearchTerm(e.target.value)}
          placeholder="Search products..."
        />
        <select 
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="name">Sort by Name</option>
          <option value="price">Sort by Price</option>
        </select>
        <CategoryFilter 
          value={selectedCategory}
          onChange={setSelectedCategory}
        />
      </div>
      
      {/* 使用虚拟列表处理大量数据 */}
      {displayProducts.length > 100 ? (
        <FixedSizeList
          height={600}
          itemCount={displayProducts.length}
          itemSize={120}
          width="100%"
        >
          {({ index, style }) => (
            <div style={style}>
              <ProductCard 
                product={displayProducts[index]}
                onAddToCart={handleAddToCart}
              />
            </div>
          )}
        </FixedSizeList>
      ) : (
        <div className="product-grid">
          {displayProducts.map(product => (
            <ProductCard 
              key={product.id}
              product={product}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// 性能监控组件
function PerformanceMonitor({ children }) {
  const [metrics, setMetrics] = useState({
    renderCount: 0,
    lastRenderTime: 0,
    averageRenderTime: 0
  });
  
  const measureRender = useCallback((id, phase, actualDuration) => {
    setMetrics(prev => ({
      renderCount: prev.renderCount + 1,
      lastRenderTime: actualDuration,
      averageRenderTime: 
        (prev.averageRenderTime * prev.renderCount + actualDuration) / 
        (prev.renderCount + 1)
    }));
  }, []);
  
  return (
    <>
      <div className="performance-metrics">
        <span>Renders: {metrics.renderCount}</span>
        <span>Last: {metrics.lastRenderTime.toFixed(2)}ms</span>
        <span>Avg: {metrics.averageRenderTime.toFixed(2)}ms</span>
      </div>
      <Profiler id="monitored-app" onRender={measureRender}>
        {children}
      </Profiler>
    </>
  );
}

// 完整的优化示例应用
function OptimizedApp() {
  return (
    <PerformanceMonitor>
      <ErrorBoundary>
        <Suspense fallback={<Loading />}>
          <OptimizedProductList />
        </Suspense>
      </ErrorBoundary>
    </PerformanceMonitor>
  );
}
```

## 🔍 性能优化检查清单

```jsx
// 性能优化检查清单组件
function PerformanceChecklist() {
  const checks = [
    {
      title: '识别性能瓶颈',
      items: [
        '使用React DevTools Profiler分析',
        '检查不必要的重新渲染',
        '识别渲染时间长的组件',
        '监控内存使用'
      ]
    },
    {
      title: '优化渲染',
      items: [
        '使用React.memo包装昂贵组件',
        '实现合适的shouldComponentUpdate',
        '避免在渲染中创建新对象/函数',
        '使用key属性优化列表渲染'
      ]
    },
    {
      title: '优化状态管理',
      items: [
        '将状态放在合适的层级',
        '分离频繁更新的状态',
        '使用useReducer管理复杂状态',
        '避免不必要的状态提升'
      ]
    },
    {
      title: '优化计算和副作用',
      items: [
        '使用useMemo缓存昂贵计算',
        '使用useCallback缓存回调函数',
        '实现防抖和节流',
        '避免在effect中进行昂贵操作'
      ]
    },
    {
      title: '优化资源加载',
      items: [
        '实现代码分割',
        '使用懒加载',
        '优化图片加载',
        '使用Web Workers处理繁重任务'
      ]
    }
  ];
  
  return (
    <div className="performance-checklist">
      {checks.map((section, index) => (
        <div key={index} className="checklist-section">
          <h3>{section.title}</h3>
          <ul>
            {section.items.map((item, itemIndex) => (
              <li key={itemIndex}>
                <input type="checkbox" id={`check-${index}-${itemIndex}`} />
                <label htmlFor={`check-${index}-${itemIndex}`}>{item}</label>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
```

## 🎯 今日练习

1. **基础练习**：优化一个包含搜索、过滤和排序功能的待办事项列表
2. **进阶练习**：实现一个高性能的数据表格组件，支持虚拟滚动和列排序
3. **挑战练习**：构建一个图片画廊应用，实现懒加载、预加载和虚拟滚动

## 🚀 下一步

明天我们将学习：
- React 18新特性深入
- Concurrent Features（并发特性）
- Suspense和错误边界
- Server Components初探
- 自动批处理和Transitions

## 💭 思考题

1. 什么时候应该使用React.memo？什么时候不应该使用？
2. useMemo和useCallback的本质是什么？它们解决了什么问题？
3. 如何平衡性能优化和代码可读性？
4. 虚拟列表的原理是什么？适用于哪些场景？
5. 如何识别和避免React应用中的内存泄漏？

记住：**性能优化应该基于实际测量，而不是猜测。先让代码正确运行，再让它运行得更快！**