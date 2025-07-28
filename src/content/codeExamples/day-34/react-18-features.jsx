// Day 34: React 18新特性示例

import React, { 
  useState, 
  useTransition, 
  useDeferredValue,
  useId,
  useEffect,
  useMemo,
  Suspense,
  useRef
} from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';

// ==========================================
// 1. 新的渲染API
// ==========================================

// React 17方式（已废弃）
// import ReactDOM from 'react-dom';
// ReactDOM.render(<App />, document.getElementById('root'));

// React 18方式
const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// 卸载应用
// root.unmount();

// ==========================================
// 2. 自动批处理示例
// ==========================================

export function AutoBatchingDemo() {
  const [count, setCount] = useState(0);
  const [flag, setFlag] = useState(false);
  const [data, setData] = useState(null);
  const renderCount = useRef(0);

  useEffect(() => {
    renderCount.current += 1;
    console.log(`组件渲染次数: ${renderCount.current}`);
  });

  // React事件处理器中的批处理
  const handleClick = () => {
    console.log('React事件处理器 - 开始');
    setCount(c => c + 1);
    setFlag(f => !f);
    setData({ updated: true });
    console.log('React事件处理器 - 结束');
    // 只触发一次重新渲染
  };

  // setTimeout中的批处理
  const handleTimeout = () => {
    console.log('setTimeout - 开始');
    setTimeout(() => {
      setCount(c => c + 1);
      setFlag(f => !f);
      setData({ timeout: true });
      console.log('setTimeout - 结束');
      // React 18: 只触发一次重新渲染
      // React 17: 会触发三次重新渲染
    }, 100);
  };

  // Promise中的批处理
  const handlePromise = async () => {
    console.log('Promise - 开始');
    const result = await fetch('/api/data').then(r => r.json());
    
    setCount(c => c + 1);
    setFlag(f => !f);
    setData(result);
    console.log('Promise - 结束');
    // React 18: 只触发一次重新渲染
  };

  // 原生事件中的批处理
  useEffect(() => {
    const handleScroll = () => {
      setCount(c => c + 1);
      setFlag(f => !f);
      // React 18: 批处理
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 选择退出批处理
  const handleFlushSync = () => {
    console.log('flushSync - 开始');
    
    flushSync(() => {
      setCount(c => c + 1);
    });
    console.log('第一次更新完成');
    
    flushSync(() => {
      setFlag(f => !f);
    });
    console.log('第二次更新完成');
    // 触发两次重新渲染
  };

  return (
    <div className="batching-demo">
      <h2>自动批处理演示</h2>
      <div className="stats">
        <p>Count: {count}</p>
        <p>Flag: {flag.toString()}</p>
        <p>Data: {JSON.stringify(data)}</p>
        <p>渲染次数: {renderCount.current}</p>
      </div>
      
      <div className="buttons">
        <button onClick={handleClick}>React事件</button>
        <button onClick={handleTimeout}>setTimeout更新</button>
        <button onClick={handlePromise}>Promise更新</button>
        <button onClick={handleFlushSync}>flushSync（退出批处理）</button>
      </div>
    </div>
  );
}

// ==========================================
// 3. useTransition示例
// ==========================================

// 生成大量数据
function generateItems(count) {
  const items = [];
  for (let i = 0; i < count; i++) {
    items.push({
      id: i,
      text: `Item ${i}`,
      value: Math.random()
    });
  }
  return items;
}

export function TransitionDemo() {
  const [inputValue, setInputValue] = useState('');
  const [list, setList] = useState(() => generateItems(100));
  const [isPending, startTransition] = useTransition();

  // 紧急更新
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    
    // 非紧急更新
    startTransition(() => {
      const filtered = generateItems(5000).filter(item =>
        item.text.toLowerCase().includes(e.target.value.toLowerCase())
      );
      setList(filtered);
    });
  };

  return (
    <div className="transition-demo">
      <h2>useTransition演示</h2>
      
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        placeholder="输入搜索..."
      />
      
      {isPending && (
        <div className="pending-indicator">
          🔄 更新列表中...
        </div>
      )}
      
      <div className={`list-container ${isPending ? 'pending' : ''}`}>
        <p>显示 {list.length} 项</p>
        <ul>
          {list.slice(0, 100).map(item => (
            <li key={item.id}>{item.text}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ==========================================
// 4. useDeferredValue示例
// ==========================================

function SlowList({ text }) {
  // 模拟慢组件
  const items = useMemo(() => {
    const list = [];
    for (let i = 0; i < 250; i++) {
      list.push(
        <li key={i}>
          {text} - Item {i}
        </li>
      );
    }
    return list;
  }, [text]);

  return <ul className="slow-list">{items}</ul>;
}

export function DeferredValueDemo() {
  const [text, setText] = useState('');
  const deferredText = useDeferredValue(text);
  
  // 检查是否过时
  const isStale = text !== deferredText;

  return (
    <div className="deferred-demo">
      <h2>useDeferredValue演示</h2>
      
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="输入文本..."
      />
      
      <div className={`content ${isStale ? 'stale' : ''}`}>
        {isStale && <div className="stale-indicator">更新中...</div>}
        <SlowList text={deferredText} />
      </div>
    </div>
  );
}

// ==========================================
// 5. useId示例
// ==========================================

function EmailForm() {
  const id = useId();
  
  return (
    <form className="email-form">
      <div>
        <label htmlFor={`${id}-email`}>邮箱:</label>
        <input
          id={`${id}-email`}
          type="email"
          name="email"
        />
      </div>
      <div>
        <label htmlFor={`${id}-password`}>密码:</label>
        <input
          id={`${id}-password`}
          type="password"
          name="password"
        />
      </div>
      <div>
        <input
          id={`${id}-remember`}
          type="checkbox"
          name="remember"
        />
        <label htmlFor={`${id}-remember`}>记住我</label>
      </div>
    </form>
  );
}

export function UseIdDemo() {
  return (
    <div className="use-id-demo">
      <h2>useId演示</h2>
      <p>多个表单实例，每个都有唯一的ID</p>
      
      <div className="forms-grid">
        <EmailForm />
        <EmailForm />
        <EmailForm />
      </div>
    </div>
  );
}

// ==========================================
// 6. useSyncExternalStore示例
// ==========================================

import { useSyncExternalStore } from 'react';

// 在线状态store
const onlineStatusStore = {
  subscribe(callback) {
    window.addEventListener('online', callback);
    window.addEventListener('offline', callback);
    
    return () => {
      window.removeEventListener('online', callback);
      window.removeEventListener('offline', callback);
    };
  },
  
  getSnapshot() {
    return navigator.onLine;
  },
  
  getServerSnapshot() {
    return true; // 服务端总是返回在线
  }
};

// 窗口尺寸store
const windowSizeStore = {
  subscribe(callback) {
    window.addEventListener('resize', callback);
    return () => window.removeEventListener('resize', callback);
  },
  
  getSnapshot() {
    return {
      width: window.innerWidth,
      height: window.innerHeight
    };
  }
};

export function SyncExternalStoreDemo() {
  const isOnline = useSyncExternalStore(
    onlineStatusStore.subscribe,
    onlineStatusStore.getSnapshot,
    onlineStatusStore.getServerSnapshot
  );
  
  const windowSize = useSyncExternalStore(
    windowSizeStore.subscribe,
    windowSizeStore.getSnapshot
  );
  
  return (
    <div className="sync-store-demo">
      <h2>useSyncExternalStore演示</h2>
      
      <div className="status-cards">
        <div className={`status-card ${isOnline ? 'online' : 'offline'}`}>
          <h3>网络状态</h3>
          <p>{isOnline ? '🟢 在线' : '🔴 离线'}</p>
        </div>
        
        <div className="status-card">
          <h3>窗口尺寸</h3>
          <p>宽度: {windowSize.width}px</p>
          <p>高度: {windowSize.height}px</p>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 7. Suspense改进示例
// ==========================================

// 模拟数据获取
let cache = new Map();

function fetchData(id) {
  if (!cache.has(id)) {
    cache.set(id, createResource(id));
  }
  return cache.get(id);
}

function createResource(id) {
  let status = 'pending';
  let result;
  
  const suspender = new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id,
        name: `User ${id}`,
        email: `user${id}@example.com`,
        bio: `This is user ${id}'s bio.`
      });
    }, 1000 + Math.random() * 1000);
  }).then(
    data => {
      status = 'success';
      result = data;
    },
    error => {
      status = 'error';
      result = error;
    }
  );
  
  return {
    read() {
      if (status === 'pending') throw suspender;
      if (status === 'error') throw result;
      return result;
    }
  };
}

function UserProfile({ resource }) {
  const user = resource.read();
  
  return (
    <div className="user-profile">
      <h3>{user.name}</h3>
      <p>{user.email}</p>
      <p>{user.bio}</p>
    </div>
  );
}

export function SuspenseDemo() {
  const [userId, setUserId] = useState(1);
  const [resource, setResource] = useState(() => fetchData(userId));
  
  const handleUserChange = (id) => {
    setUserId(id);
    setResource(fetchData(id));
  };
  
  return (
    <div className="suspense-demo">
      <h2>Suspense数据获取演示</h2>
      
      <div className="user-selector">
        {[1, 2, 3, 4, 5].map(id => (
          <button
            key={id}
            onClick={() => handleUserChange(id)}
            className={userId === id ? 'active' : ''}
          >
            用户 {id}
          </button>
        ))}
      </div>
      
      <Suspense fallback={<div className="loading">加载用户资料...</div>}>
        <UserProfile resource={resource} />
      </Suspense>
    </div>
  );
}

// ==========================================
// 8. StrictMode双重渲染演示
// ==========================================

export function StrictModeDemo() {
  const [count, setCount] = useState(0);
  const renderCount = useRef(0);
  
  // 这会在StrictMode下执行两次
  console.log('组件函数体执行');
  
  useState(() => {
    console.log('useState初始化器执行');
    return 0;
  });
  
  useMemo(() => {
    console.log('useMemo计算执行');
    return count * 2;
  }, [count]);
  
  useEffect(() => {
    renderCount.current += 1;
    console.log('useEffect执行');
    
    return () => {
      console.log('useEffect清理函数执行');
    };
  }, [count]);
  
  return (
    <div className="strict-mode-demo">
      <h2>StrictMode双重渲染演示</h2>
      <p>打开控制台查看执行日志</p>
      <p>Count: {count}</p>
      <p>实际渲染次数: {renderCount.current}</p>
      <button onClick={() => setCount(c => c + 1)}>增加</button>
    </div>
  );
}

// ==========================================
// 9. 完整应用示例
// ==========================================

export function App() {
  const [activeDemo, setActiveDemo] = useState('batching');
  const [isPending, startTransition] = useTransition();
  
  const handleDemoChange = (demo) => {
    startTransition(() => {
      setActiveDemo(demo);
    });
  };
  
  const demos = {
    batching: { component: AutoBatchingDemo, name: '自动批处理' },
    transition: { component: TransitionDemo, name: 'useTransition' },
    deferred: { component: DeferredValueDemo, name: 'useDeferredValue' },
    useId: { component: UseIdDemo, name: 'useId' },
    syncStore: { component: SyncExternalStoreDemo, name: 'useSyncExternalStore' },
    suspense: { component: SuspenseDemo, name: 'Suspense改进' },
    strictMode: { component: StrictModeDemo, name: 'StrictMode' }
  };
  
  const ActiveComponent = demos[activeDemo].component;
  
  return (
    <div className="react-18-app">
      <header>
        <h1>React 18 新特性演示</h1>
      </header>
      
      <nav className="demo-nav">
        {Object.entries(demos).map(([key, demo]) => (
          <button
            key={key}
            onClick={() => handleDemoChange(key)}
            className={`nav-button ${activeDemo === key ? 'active' : ''} ${
              activeDemo === key && isPending ? 'pending' : ''
            }`}
          >
            {demo.name}
            {activeDemo === key && isPending && ' ⏳'}
          </button>
        ))}
      </nav>
      
      <main className={isPending ? 'transitioning' : ''}>
        <ActiveComponent />
      </main>
    </div>
  );
}