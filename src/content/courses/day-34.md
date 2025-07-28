---
day: 34
phase: "react-development"
title: "React 18新特性"
description: "深入了解React 18的重大更新，学习并发特性、新Hooks、Suspense改进等，掌握现代React应用的最新开发模式"
objectives:
  - "理解React 18的并发渲染机制"
  - "掌握自动批处理和Transitions API"
  - "学习新的Hooks使用方法"
  - "了解Suspense的改进和新用法"
  - "掌握新的客户端和服务端API"
estimatedTime: 180
difficulty: "advanced"
prerequisites: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 25, 26, 27, 28, 29, 30, 31, 32, 33]
tags:
  - "React"
  - "React 18"
  - "并发渲染"
  - "Suspense"
  - "新特性"
resources:
  - title: "React 18官方发布说明"
    url: "https://react.dev/blog/2022/03/29/react-v18"
    type: "article"
  - title: "React 18升级指南"
    url: "https://react.dev/blog/2022/03/08/react-18-upgrade-guide"
    type: "article"
  - title: "并发特性介绍"
    url: "https://react.dev/reference/react/useDeferredValue"
    type: "documentation"
  - title: "新Hooks文档"
    url: "https://react.dev/reference/react"
    type: "documentation"
codeExamples:
  - title: "React 18新特性示例"
    language: "javascript"
    path: "/code-examples/day-34/react-18-features.jsx"
  - title: "并发特性实战"
    language: "javascript"
    path: "/code-examples/day-34/concurrent-features.jsx"
---

# Day 34: React 18新特性

## 📋 学习目标

今天我们将深入探索React 18带来的革命性更新。React 18引入了并发渲染机制，这是React架构的重大升级，为构建更流畅的用户体验提供了强大工具。

## 🚀 React 18的愿景

### 1. 为什么需要React 18？

```jsx
// React 17及之前的问题
function OldReact() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  
  // 每次输入都会阻塞渲染
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    
    // 耗时的同步操作会阻塞UI
    const filtered = hugeDataset.filter(item => 
      item.name.includes(e.target.value)
    );
    setResults(filtered);
  };
  
  return (
    <div>
      <input onChange={handleSearch} />
      {/* 输入时会卡顿 */}
      <ResultsList results={results} />
    </div>
  );
}

// React 18的解决方案
function NewReact() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [isPending, startTransition] = useTransition();
  
  const handleSearch = (e) => {
    // 紧急更新：立即显示输入
    setSearchTerm(e.target.value);
    
    // 非紧急更新：可以延迟
    startTransition(() => {
      const filtered = hugeDataset.filter(item => 
        item.name.includes(e.target.value)
      );
      setResults(filtered);
    });
  };
  
  return (
    <div>
      <input onChange={handleSearch} />
      {isPending && <div>搜索中...</div>}
      <ResultsList results={results} />
    </div>
  );
}
```

### 2. 升级到React 18

```jsx
// 旧的渲染方式（React 17）
import ReactDOM from 'react-dom';

ReactDOM.render(<App />, document.getElementById('root'));

// 新的渲染方式（React 18）
import { createRoot } from 'react-dom/client';

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);

// 带有严格模式
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);

// 卸载应用
setTimeout(() => {
  root.unmount();
}, 10000);
```

## 🎯 自动批处理（Automatic Batching）

### 1. 理解批处理

```jsx
// React 17：只在React事件处理器中批处理
function React17Component() {
  const [count, setCount] = useState(0);
  const [flag, setFlag] = useState(false);
  
  // React事件：批处理（一次渲染）
  const handleClick = () => {
    setCount(c => c + 1);
    setFlag(f => !f);
    // 只触发一次重新渲染
  };
  
  // 非React事件：不批处理（两次渲染）
  useEffect(() => {
    setTimeout(() => {
      setCount(c => c + 1); // 第一次渲染
      setFlag(f => !f);     // 第二次渲染
    }, 1000);
  }, []);
  
  // Promise中：不批处理（两次渲染）
  const handleAsync = async () => {
    const data = await fetchData();
    setCount(data.count); // 第一次渲染
    setFlag(data.flag);   // 第二次渲染
  };
}

// React 18：自动批处理所有更新
function React18Component() {
  const [count, setCount] = useState(0);
  const [flag, setFlag] = useState(false);
  
  // 所有场景都批处理
  useEffect(() => {
    // setTimeout中也批处理
    setTimeout(() => {
      setCount(c => c + 1);
      setFlag(f => !f);
      // 只触发一次重新渲染！
    }, 1000);
    
    // Promise中也批处理
    fetch('/api/data').then(data => {
      setCount(data.count);
      setFlag(data.flag);
      // 只触发一次重新渲染！
    });
  }, []);
  
  // 原生事件中也批处理
  useEffect(() => {
    const handleScroll = () => {
      setCount(c => c + 1);
      setFlag(f => !f);
      // 只触发一次重新渲染！
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
}

// 选择退出批处理
import { flushSync } from 'react-dom';

function ForceUpdate() {
  const [count, setCount] = useState(0);
  const [flag, setFlag] = useState(false);
  
  const handleClick = () => {
    flushSync(() => {
      setCount(c => c + 1);
    }); // React立即重新渲染
    
    flushSync(() => {
      setFlag(f => !f);
    }); // React再次重新渲染
  };
}
```

### 2. 批处理的性能优势

```jsx
// 性能测试组件
function BatchingPerformanceTest() {
  const [updates, setUpdates] = useState(0);
  const renderCount = useRef(0);
  
  useEffect(() => {
    renderCount.current += 1;
    console.log(`Render #${renderCount.current}`);
  });
  
  // 测试多个状态更新
  const handleMultipleUpdates = () => {
    // 在React 18中，这些都会批处理
    setUpdates(u => u + 1);
    setUpdates(u => u + 1);
    setUpdates(u => u + 1);
    setUpdates(u => u + 1);
    setUpdates(u => u + 1);
    // 只触发一次渲染！
  };
  
  // 测试异步批处理
  const handleAsyncBatch = async () => {
    const data1 = await fetch('/api/1');
    const data2 = await fetch('/api/2');
    
    // 即使在await之后，仍然批处理
    setUpdates(data1.value);
    setUpdates(data2.value);
    // 只触发一次渲染！
  };
  
  return (
    <div>
      <p>Updates: {updates}</p>
      <p>Renders: {renderCount.current}</p>
      <button onClick={handleMultipleUpdates}>同步更新</button>
      <button onClick={handleAsyncBatch}>异步更新</button>
    </div>
  );
}
```

## 💫 Transitions API

### 1. useTransition Hook

```jsx
import { useTransition, useState } from 'react';

function SearchWithTransition() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isPending, startTransition] = useTransition();
  
  const handleSearch = (e) => {
    const value = e.target.value;
    
    // 紧急更新：输入框立即更新
    setQuery(value);
    
    // 非紧急更新：搜索结果可以延迟
    startTransition(() => {
      // 模拟耗时的搜索操作
      const searchResults = performExpensiveSearch(value);
      setResults(searchResults);
    });
  };
  
  return (
    <div>
      <input 
        value={query}
        onChange={handleSearch}
        placeholder="搜索..."
      />
      
      {isPending && (
        <div className="pending-indicator">
          搜索中...
        </div>
      )}
      
      <div style={{ opacity: isPending ? 0.6 : 1 }}>
        <SearchResults results={results} />
      </div>
    </div>
  );
}

// 更复杂的例子：标签页切换
function TabsWithTransition() {
  const [activeTab, setActiveTab] = useState('posts');
  const [isPending, startTransition] = useTransition();
  
  const selectTab = (tab) => {
    startTransition(() => {
      setActiveTab(tab);
    });
  };
  
  return (
    <div>
      <div className="tabs">
        <button 
          onClick={() => selectTab('posts')}
          className={activeTab === 'posts' ? 'active' : ''}
        >
          Posts {activeTab === 'posts' && isPending && '⏳'}
        </button>
        <button 
          onClick={() => selectTab('comments')}
          className={activeTab === 'comments' ? 'active' : ''}
        >
          Comments {activeTab === 'comments' && isPending && '⏳'}
        </button>
        <button 
          onClick={() => selectTab('users')}
          className={activeTab === 'users' ? 'active' : ''}
        >
          Users {activeTab === 'users' && isPending && '⏳'}
        </button>
      </div>
      
      <div className={isPending ? 'loading' : ''}>
        {activeTab === 'posts' && <PostsTab />}
        {activeTab === 'comments' && <CommentsTab />}
        {activeTab === 'users' && <UsersTab />}
      </div>
    </div>
  );
}
```

### 2. startTransition函数

```jsx
import { startTransition } from 'react';

// 不使用Hook的场景
function NonHookComponent({ onNavigate }) {
  const handleClick = () => {
    // 标记为transition
    startTransition(() => {
      onNavigate('/heavy-page');
    });
  };
  
  return <button onClick={handleClick}>导航到重页面</button>;
}

// 条件性使用transition
function ConditionalTransition({ data, urgent }) {
  const [processedData, setProcessedData] = useState([]);
  
  const processData = () => {
    if (urgent) {
      // 紧急更新：立即处理
      setProcessedData(expensiveProcessing(data));
    } else {
      // 非紧急更新：可以延迟
      startTransition(() => {
        setProcessedData(expensiveProcessing(data));
      });
    }
  };
  
  return (
    <div>
      <button onClick={processData}>
        处理数据 {urgent ? '(紧急)' : '(可延迟)'}
      </button>
      <DataDisplay data={processedData} />
    </div>
  );
}
```

## 🎪 useDeferredValue Hook

### 1. 基础使用

```jsx
import { useDeferredValue, useState } from 'react';

function SearchWithDeferredValue() {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  
  // query立即更新，deferredQuery延迟更新
  const isStale = query !== deferredQuery;
  
  return (
    <div>
      <input 
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      
      <div style={{ opacity: isStale ? 0.5 : 1 }}>
        <SearchResults query={deferredQuery} />
      </div>
    </div>
  );
}

// 与useMemo结合使用
function ExpensiveTree({ value }) {
  const deferredValue = useDeferredValue(value);
  
  const expensiveData = useMemo(() => {
    // 只在deferredValue改变时重新计算
    return processExpensiveData(deferredValue);
  }, [deferredValue]);
  
  return <DataVisualization data={expensiveData} />;
}
```

### 2. useDeferredValue vs useTransition

```jsx
// useTransition：控制状态更新的优先级
function WithTransition() {
  const [input, setInput] = useState('');
  const [list, setList] = useState([]);
  const [isPending, startTransition] = useTransition();
  
  const handleChange = (e) => {
    setInput(e.target.value);
    startTransition(() => {
      setList(generateList(e.target.value));
    });
  };
  
  return (
    <>
      <input onChange={handleChange} value={input} />
      {isPending && <div>更新中...</div>}
      <List items={list} />
    </>
  );
}

// useDeferredValue：延迟值的更新
function WithDeferredValue() {
  const [input, setInput] = useState('');
  const deferredInput = useDeferredValue(input);
  
  // 列表基于延迟的值渲染
  const list = useMemo(
    () => generateList(deferredInput),
    [deferredInput]
  );
  
  const isStale = input !== deferredInput;
  
  return (
    <>
      <input onChange={(e) => setInput(e.target.value)} value={input} />
      <div style={{ opacity: isStale ? 0.5 : 1 }}>
        <List items={list} />
      </div>
    </>
  );
}

// 两者结合使用
function CombinedApproach() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const deferredQuery = useDeferredValue(query);
  const [isPending, startTransition] = useTransition();
  
  useEffect(() => {
    if (deferredQuery) {
      startTransition(() => {
        fetchResults(deferredQuery).then(setResults);
      });
    }
  }, [deferredQuery]);
  
  return (
    <div>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      <div className={isPending ? 'loading' : ''}>
        <Results data={results} />
      </div>
    </div>
  );
}
```

## 🆔 其他新Hooks

### 1. useId - 生成唯一ID

```jsx
import { useId } from 'react';

function FormField({ label, type = 'text' }) {
  const id = useId();
  
  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <input id={id} type={type} />
    </div>
  );
}

// 生成多个相关ID
function ComplexForm() {
  const id = useId();
  
  return (
    <form>
      <div>
        <label htmlFor={`${id}-name`}>姓名</label>
        <input id={`${id}-name`} type="text" />
      </div>
      <div>
        <label htmlFor={`${id}-email`}>邮箱</label>
        <input id={`${id}-email`} type="email" />
      </div>
      <fieldset>
        <legend>偏好设置</legend>
        <input id={`${id}-pref-1`} type="checkbox" />
        <label htmlFor={`${id}-pref-1`}>接收通知</label>
      </fieldset>
    </form>
  );
}

// 在列表中使用
function TodoList({ todos }) {
  return (
    <ul>
      {todos.map(todo => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </ul>
  );
}

function TodoItem({ todo }) {
  const checkboxId = useId();
  
  return (
    <li>
      <input 
        id={checkboxId}
        type="checkbox"
        checked={todo.done}
      />
      <label htmlFor={checkboxId}>
        {todo.text}
      </label>
    </li>
  );
}
```

### 2. useSyncExternalStore - 外部状态同步

```jsx
import { useSyncExternalStore } from 'react';

// 订阅浏览器API
function useOnlineStatus() {
  return useSyncExternalStore(
    // 订阅函数
    (callback) => {
      window.addEventListener('online', callback);
      window.addEventListener('offline', callback);
      
      return () => {
        window.removeEventListener('online', callback);
        window.removeEventListener('offline', callback);
      };
    },
    // 获取客户端快照
    () => navigator.onLine,
    // 获取服务端快照（可选）
    () => true
  );
}

function OnlineIndicator() {
  const isOnline = useOnlineStatus();
  
  return (
    <div className={`status ${isOnline ? 'online' : 'offline'}`}>
      {isOnline ? '🟢 在线' : '🔴 离线'}
    </div>
  );
}

// 订阅自定义store
function createStore(initialState) {
  let state = initialState;
  const listeners = new Set();
  
  return {
    getState() {
      return state;
    },
    setState(newState) {
      state = newState;
      listeners.forEach(listener => listener());
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    }
  };
}

const store = createStore({ count: 0 });

function useStore(selector) {
  return useSyncExternalStore(
    store.subscribe,
    () => selector(store.getState()),
    () => selector(store.getState())
  );
}

function Counter() {
  const count = useStore(state => state.count);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => {
        store.setState({ count: count + 1 });
      }}>
        Increment
      </button>
    </div>
  );
}

// 浏览器历史同步
function useBrowserHistory() {
  return useSyncExternalStore(
    (callback) => {
      window.addEventListener('popstate', callback);
      return () => window.removeEventListener('popstate', callback);
    },
    () => window.location.href,
    () => '/'
  );
}
```

### 3. useInsertionEffect - CSS-in-JS库专用

```jsx
import { useInsertionEffect, useLayoutEffect } from 'react';

// 主要用于CSS-in-JS库
function useCSS(rule) {
  useInsertionEffect(() => {
    // 在DOM变更之前插入样式
    // 避免样式闪烁
    const style = document.createElement('style');
    style.textContent = rule;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, [rule]);
}

// 执行顺序对比
function EffectOrderDemo() {
  useInsertionEffect(() => {
    console.log('1. useInsertionEffect');
  });
  
  useLayoutEffect(() => {
    console.log('2. useLayoutEffect');
  });
  
  useEffect(() => {
    console.log('3. useEffect');
  });
  
  return <div>查看控制台了解执行顺序</div>;
}
```

## 🌊 Suspense的改进

### 1. 数据获取的Suspense

```jsx
// 资源获取函数
function fetchData(id) {
  let status = 'pending';
  let result;
  
  const suspender = fetch(`/api/data/${id}`)
    .then(response => response.json())
    .then(data => {
      status = 'success';
      result = data;
    })
    .catch(error => {
      status = 'error';
      result = error;
    });
  
  return {
    read() {
      if (status === 'pending') {
        throw suspender;
      } else if (status === 'error') {
        throw result;
      } else if (status === 'success') {
        return result;
      }
    }
  };
}

// 使用Suspense的组件
function DataComponent({ resource }) {
  const data = resource.read();
  
  return (
    <div>
      <h2>{data.title}</h2>
      <p>{data.content}</p>
    </div>
  );
}

function App() {
  const [resource, setResource] = useState(
    () => fetchData(1)
  );
  
  return (
    <div>
      <Suspense fallback={<Loading />}>
        <DataComponent resource={resource} />
      </Suspense>
      
      <button onClick={() => setResource(fetchData(2))}>
        加载下一个
      </button>
    </div>
  );
}

// 嵌套Suspense
function ComplexApp() {
  return (
    <Suspense fallback={<AppSkeleton />}>
      <Header />
      
      <Suspense fallback={<MainContentSkeleton />}>
        <MainContent />
        
        <Suspense fallback={<CommentsSkeleton />}>
          <Comments />
        </Suspense>
      </Suspense>
      
      <Footer />
    </Suspense>
  );
}
```

### 2. 服务端Suspense

```jsx
// 服务端渲染支持
import { renderToPipeableStream } from 'react-dom/server';

function handleRequest(req, res) {
  const { pipe, abort } = renderToPipeableStream(
    <App />,
    {
      bootstrapScripts: ['/main.js'],
      onShellReady() {
        // HTML骨架准备好了
        res.statusCode = 200;
        res.setHeader('Content-type', 'text/html');
        pipe(res);
      },
      onShellError(error) {
        // 骨架渲染出错
        res.statusCode = 500;
        res.send('<!doctype html><p>加载失败...</p>');
      },
      onAllReady() {
        // 所有内容都准备好了
        // 可以用于静态生成
      },
      onError(error) {
        // 记录错误
        console.error(error);
      }
    }
  );
  
  // 超时处理
  setTimeout(() => {
    abort();
  }, 10000);
}

// 客户端hydration
import { hydrateRoot } from 'react-dom/client';

const container = document.getElementById('root');
hydrateRoot(container, <App />);
```

## 🔧 Strict Mode的新行为

```jsx
// React 18的StrictMode会双重调用
function StrictModeDemo() {
  // 这些会被调用两次（仅在开发环境）
  console.log('Component body');
  
  useState(() => {
    console.log('useState initializer');
    return 0;
  });
  
  useMemo(() => {
    console.log('useMemo calculation');
    return 'value';
  }, []);
  
  useEffect(() => {
    console.log('useEffect setup');
    
    return () => {
      console.log('useEffect cleanup');
    };
  }, []);
  
  return <div>查看控制台</div>;
}

// 正确处理副作用
function CorrectEffectHandling() {
  useEffect(() => {
    const controller = new AbortController();
    
    fetch('/api/data', { signal: controller.signal })
      .then(res => res.json())
      .then(data => {
        // 处理数据
      })
      .catch(err => {
        if (err.name !== 'AbortError') {
          console.error(err);
        }
      });
    
    return () => {
      // 正确清理
      controller.abort();
    };
  }, []);
}
```

## 💼 实战项目：React 18特性展示

### 完整的应用示例

```jsx
// 展示所有React 18特性的应用
import React, { 
  useState, 
  useTransition, 
  useDeferredValue, 
  useId,
  Suspense,
  lazy,
  useEffect,
  useMemo
} from 'react';
import { createRoot } from 'react-dom/client';

// 懒加载组件
const HeavyComponent = lazy(() => import('./HeavyComponent'));

// 主应用
function React18FeaturesApp() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('search');
  const [isPending, startTransition] = useTransition();
  const deferredSearchTerm = useDeferredValue(searchTerm);
  
  // 处理搜索
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };
  
  // 处理标签切换
  const handleTabChange = (tab) => {
    startTransition(() => {
      setSelectedTab(tab);
    });
  };
  
  return (
    <div className="app">
      <header>
        <h1>React 18 特性演示</h1>
        <OnlineStatus />
      </header>
      
      <nav className="tabs">
        <TabButton
          active={selectedTab === 'search'}
          pending={selectedTab === 'search' && isPending}
          onClick={() => handleTabChange('search')}
        >
          搜索演示
        </TabButton>
        <TabButton
          active={selectedTab === 'form'}
          pending={selectedTab === 'form' && isPending}
          onClick={() => handleTabChange('form')}
        >
          表单演示
        </TabButton>
        <TabButton
          active={selectedTab === 'heavy'}
          pending={selectedTab === 'heavy' && isPending}
          onClick={() => handleTabChange('heavy')}
        >
          重组件
        </TabButton>
      </nav>
      
      <main className={isPending ? 'pending' : ''}>
        {selectedTab === 'search' && (
          <SearchDemo
            searchTerm={searchTerm}
            deferredSearchTerm={deferredSearchTerm}
            onSearch={handleSearch}
          />
        )}
        
        {selectedTab === 'form' && <FormDemo />}
        
        {selectedTab === 'heavy' && (
          <Suspense fallback={<LoadingSpinner />}>
            <HeavyComponent />
          </Suspense>
        )}
      </main>
      
      <BatchingDemo />
    </div>
  );
}

// 搜索演示组件
function SearchDemo({ searchTerm, deferredSearchTerm, onSearch }) {
  const isStale = searchTerm !== deferredSearchTerm;
  
  return (
    <div className="search-demo">
      <input
        type="text"
        value={searchTerm}
        onChange={onSearch}
        placeholder="输入搜索词..."
      />
      
      <div className={`results ${isStale ? 'stale' : ''}`}>
        <SearchResults query={deferredSearchTerm} />
      </div>
      
      {isStale && <div className="loading-indicator">更新中...</div>}
    </div>
  );
}

// 搜索结果
const SearchResults = React.memo(function SearchResults({ query }) {
  const results = useMemo(() => {
    if (!query) return [];
    
    // 模拟耗时搜索
    const start = Date.now();
    const data = [];
    
    for (let i = 0; i < 10000; i++) {
      if (`Item ${i}`.toLowerCase().includes(query.toLowerCase())) {
        data.push({ id: i, name: `Item ${i}` });
      }
    }
    
    console.log(`Search took ${Date.now() - start}ms`);
    return data.slice(0, 100);
  }, [query]);
  
  return (
    <ul>
      {results.map(item => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  );
});

// 表单演示
function FormDemo() {
  const formId = useId();
  
  return (
    <form className="form-demo">
      <FormField
        id={`${formId}-name`}
        label="姓名"
        type="text"
      />
      <FormField
        id={`${formId}-email`}
        label="邮箱"
        type="email"
      />
      <FormField
        id={`${formId}-message`}
        label="消息"
        type="textarea"
      />
      <button type="submit">提交</button>
    </form>
  );
}

// 表单字段组件
function FormField({ id, label, type }) {
  const inputId = useId();
  const fieldId = id || inputId;
  
  return (
    <div className="form-field">
      <label htmlFor={fieldId}>{label}</label>
      {type === 'textarea' ? (
        <textarea id={fieldId} />
      ) : (
        <input id={fieldId} type={type} />
      )}
    </div>
  );
}

// 批处理演示
function BatchingDemo() {
  const [count1, setCount1] = useState(0);
  const [count2, setCount2] = useState(0);
  const [count3, setCount3] = useState(0);
  const renderCount = useRef(0);
  
  useEffect(() => {
    renderCount.current += 1;
  });
  
  const handleMultipleUpdates = () => {
    // 这些更新会被批处理
    setCount1(c => c + 1);
    setCount2(c => c + 1);
    setCount3(c => c + 1);
  };
  
  const handleAsyncUpdates = () => {
    setTimeout(() => {
      // React 18中也会批处理
      setCount1(c => c + 1);
      setCount2(c => c + 1);
      setCount3(c => c + 1);
    }, 100);
  };
  
  return (
    <div className="batching-demo">
      <h3>批处理演示</h3>
      <p>Count 1: {count1}</p>
      <p>Count 2: {count2}</p>
      <p>Count 3: {count3}</p>
      <p>渲染次数: {renderCount.current}</p>
      <button onClick={handleMultipleUpdates}>同步更新</button>
      <button onClick={handleAsyncUpdates}>异步更新</button>
    </div>
  );
}

// 在线状态指示器
function OnlineStatus() {
  const isOnline = useSyncExternalStore(
    (callback) => {
      window.addEventListener('online', callback);
      window.addEventListener('offline', callback);
      return () => {
        window.removeEventListener('online', callback);
        window.removeEventListener('offline', callback);
      };
    },
    () => navigator.onLine,
    () => true
  );
  
  return (
    <div className={`online-status ${isOnline ? 'online' : 'offline'}`}>
      {isOnline ? '🟢 在线' : '🔴 离线'}
    </div>
  );
}

// 标签按钮
function TabButton({ active, pending, onClick, children }) {
  return (
    <button
      className={`tab-button ${active ? 'active' : ''} ${pending ? 'pending' : ''}`}
      onClick={onClick}
    >
      {children}
      {pending && ' ⏳'}
    </button>
  );
}

// 加载指示器
function LoadingSpinner() {
  return <div className="loading-spinner">加载中...</div>;
}

// 挂载应用
const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <StrictMode>
    <React18FeaturesApp />
  </StrictMode>
);
```

## 🎯 今日练习

1. **基础练习**：将现有的React 17应用升级到React 18，使用新的渲染API
2. **进阶练习**：实现一个使用useTransition优化的实时搜索功能
3. **挑战练习**：构建一个展示所有React 18新特性的交互式演示应用

## 🚀 下一步

明天我们将学习：
- 测试React应用
- Jest和React Testing Library
- 组件测试最佳实践
- 集成测试和E2E测试
- 测试覆盖率和CI/CD

## 💭 思考题

1. React 18的并发特性如何改善用户体验？
2. 什么时候应该使用useTransition vs useDeferredValue？
3. 自动批处理会对现有代码产生什么影响？
4. Suspense在数据获取中的作用是什么？
5. React 18的这些特性如何影响应用架构设计？

记住：**React 18不仅是一次版本更新，更是React走向并发渲染新时代的重要里程碑。理解并掌握这些新特性，将帮助你构建更流畅、更响应的用户界面！**