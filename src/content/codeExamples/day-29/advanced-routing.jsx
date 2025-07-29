---
title: "高级路由特性"
description: "React Router v6的高级功能，包括代码分割、懒加载、路由动画等"
category: "advanced"
language: "javascript"
day: 29
concepts:
  - "代码分割"
  - "懒加载"
  - "路由过渡动画"
  - "滚动恢复"
  - "路由预取"
relatedTopics:
  - "React.lazy"
  - "Suspense"
  - "性能优化"
---

# React Router v6 高级路由特性

## 代码分割和懒加载

### 基础懒加载设置

```jsx
import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// 懒加载组件
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Products = lazy(() => import('./pages/Products'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Profile = lazy(() => import('./pages/Profile'));

// 加载指示器
function LoadingFallback() {
  return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p>加载中...</p>
    </div>
  );
}

// 主应用
function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/products/*" element={<Products />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
```

### 带重试的懒加载

```jsx
// 带重试机制的懒加载函数
function lazyWithRetry(componentImport) {
  return lazy(async () => {
    const pageHasAlreadyBeenForceRefreshed = JSON.parse(
      window.sessionStorage.getItem('page-has-been-force-refreshed') || 'false'
    );

    try {
      const component = await componentImport();
      window.sessionStorage.setItem('page-has-been-force-refreshed', 'false');
      return component;
    } catch (error) {
      if (!pageHasAlreadyBeenForceRefreshed) {
        // 刷新页面以获取最新代码
        window.sessionStorage.setItem('page-has-been-force-refreshed', 'true');
        window.location.reload();
      }
      throw error;
    }
  });
}

// 使用带重试的懒加载
const Dashboard = lazyWithRetry(() => import('./pages/Dashboard'));
const Analytics = lazyWithRetry(() => import('./pages/Analytics'));
const Settings = lazyWithRetry(() => import('./pages/Settings'));

// 错误边界组件
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Route loading error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback">
          <h2>加载失败</h2>
          <p>无法加载页面，请刷新重试</p>
          <button onClick={() => window.location.reload()}>
            刷新页面
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// 带错误处理的应用
function AppWithErrorBoundary() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  );
}
```

### 细粒度的代码分割

```jsx
// 为不同路由组设置不同的Suspense边界
function AppWithGranularSuspense() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* 公开页面使用一个Suspense */}
          <Route
            path="public/*"
            element={
              <Suspense fallback={<PublicLoadingFallback />}>
                <PublicRoutes />
              </Suspense>
            }
          />
          
          {/* 管理后台使用另一个Suspense */}
          <Route
            path="admin/*"
            element={
              <RequireAuth>
                <Suspense fallback={<AdminLoadingFallback />}>
                  <AdminRoutes />
                </Suspense>
              </RequireAuth>
            }
          />
          
          {/* 用户仪表板使用单独的Suspense */}
          <Route
            path="dashboard/*"
            element={
              <RequireAuth>
                <Suspense fallback={<DashboardLoadingFallback />}>
                  <DashboardRoutes />
                </Suspense>
              </RequireAuth>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

// 分组路由组件
const PublicRoutes = lazy(() => import('./routes/PublicRoutes'));
const AdminRoutes = lazy(() => import('./routes/AdminRoutes'));
const DashboardRoutes = lazy(() => import('./routes/DashboardRoutes'));

// 不同的加载指示器
function PublicLoadingFallback() {
  return <div className="public-loading">正在加载页面...</div>;
}

function AdminLoadingFallback() {
  return (
    <div className="admin-loading">
      <div className="admin-spinner"></div>
      <p>正在加载管理后台...</p>
    </div>
  );
}

function DashboardLoadingFallback() {
  return (
    <div className="dashboard-loading">
      <div className="skeleton-loader">
        <div className="skeleton-header"></div>
        <div className="skeleton-content"></div>
      </div>
    </div>
  );
}
```

## 路由预加载

### 智能预加载组件

```jsx
import { Link, useNavigate } from 'react-router-dom';

// 预加载管理器
const preloadManager = {
  cache: new Map(),
  
  preload(path, importFn) {
    if (!this.cache.has(path)) {
      const promise = importFn();
      this.cache.set(path, promise);
      return promise;
    }
    return this.cache.get(path);
  },
  
  clear(path) {
    if (path) {
      this.cache.delete(path);
    } else {
      this.cache.clear();
    }
  }
};

// 路由配置与预加载
const routeConfig = [
  {
    path: '/',
    component: lazy(() => import('./pages/Home')),
    preload: () => import('./pages/Home')
  },
  {
    path: '/products',
    component: lazy(() => import('./pages/Products')),
    preload: () => import('./pages/Products')
  },
  {
    path: '/dashboard',
    component: lazy(() => import('./pages/Dashboard')),
    preload: () => import('./pages/Dashboard')
  }
];

// 智能链接组件（悬停时预加载）
function SmartLink({ to, children, preloadDelay = 200, ...props }) {
  const timeoutRef = useRef(null);
  
  const handleMouseEnter = () => {
    // 延迟预加载，避免快速滑过
    timeoutRef.current = setTimeout(() => {
      const route = routeConfig.find(r => r.path === to);
      if (route && route.preload) {
        preloadManager.preload(to, route.preload);
      }
    }, preloadDelay);
  };
  
  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };
  
  return (
    <Link
      to={to}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {children}
    </Link>
  );
}

// 基于交叉观察器的预加载
function PreloadLink({ to, children, ...props }) {
  const linkRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { rootMargin: '50px' } // 提前50px开始预加载
    );
    
    if (linkRef.current) {
      observer.observe(linkRef.current);
    }
    
    return () => {
      if (linkRef.current) {
        observer.unobserve(linkRef.current);
      }
    };
  }, []);
  
  useEffect(() => {
    if (isVisible) {
      const route = routeConfig.find(r => r.path === to);
      if (route && route.preload) {
        preloadManager.preload(to, route.preload);
      }
    }
  }, [isVisible, to]);
  
  return (
    <Link ref={linkRef} to={to} {...props}>
      {children}
    </Link>
  );
}

// 编程式预加载
function NavigationWithPreload() {
  const navigate = useNavigate();
  
  const navigateWithPreload = async (to, options) => {
    const route = routeConfig.find(r => r.path === to);
    if (route && route.preload) {
      // 先预加载，再导航
      await preloadManager.preload(to, route.preload);
    }
    navigate(to, options);
  };
  
  return (
    <div>
      <button onClick={() => navigateWithPreload('/dashboard')}>
        前往仪表板
      </button>
    </div>
  );
}
```

## 路由过渡动画

### 使用CSS Transition

```jsx
import { useLocation, useOutlet } from 'react-router-dom';
import { CSSTransition, SwitchTransition } from 'react-transition-group';
import { useRef } from 'react';

// CSS过渡动画路由
function AnimatedRoutes() {
  const location = useLocation();
  const currentOutlet = useOutlet();
  const nodeRef = useRef(null);
  
  return (
    <SwitchTransition mode="out-in">
      <CSSTransition
        key={location.pathname}
        nodeRef={nodeRef}
        timeout={300}
        classNames="page"
        unmountOnExit
      >
        <div ref={nodeRef} className="page-wrapper">
          {currentOutlet}
        </div>
      </CSSTransition>
    </SwitchTransition>
  );
}

// CSS样式
const styles = `
/* 页面进入动画 */
.page-enter {
  opacity: 0;
  transform: translateX(100%);
}

.page-enter-active {
  opacity: 1;
  transform: translateX(0);
  transition: opacity 300ms, transform 300ms;
}

/* 页面退出动画 */
.page-exit {
  opacity: 1;
  transform: translateX(0);
}

.page-exit-active {
  opacity: 0;
  transform: translateX(-100%);
  transition: opacity 300ms, transform 300ms;
}

/* 淡入淡出效果 */
.fade-enter {
  opacity: 0;
}

.fade-enter-active {
  opacity: 1;
  transition: opacity 500ms;
}

.fade-exit {
  opacity: 1;
}

.fade-exit-active {
  opacity: 0;
  transition: opacity 500ms;
}
`;

// 应用主组件
function AppWithTransitions() {
  return (
    <BrowserRouter>
      <div className="app">
        <Navigation />
        <AnimatedRoutes />
      </div>
    </BrowserRouter>
  );
}
```

### 使用Framer Motion

```jsx
import { motion, AnimatePresence } from 'framer-motion';
import { Routes, Route, useLocation } from 'react-router-dom';

// 页面过渡动画配置
const pageVariants = {
  initial: {
    opacity: 0,
    x: '-100vw',
    scale: 0.8
  },
  in: {
    opacity: 1,
    x: 0,
    scale: 1
  },
  out: {
    opacity: 0,
    x: '100vw',
    scale: 1.2
  }
};

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.5
};

// 动画页面容器
function AnimatedPage({ children }) {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
    >
      {children}
    </motion.div>
  );
}

// 使用Framer Motion的路由
function AnimatedRoutesWithFramer() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={
          <AnimatedPage>
            <Home />
          </AnimatedPage>
        } />
        <Route path="/about" element={
          <AnimatedPage>
            <About />
          </AnimatedPage>
        } />
        <Route path="/products" element={
          <AnimatedPage>
            <Products />
          </AnimatedPage>
        } />
      </Routes>
    </AnimatePresence>
  );
}

// 不同路由使用不同动画
const routeAnimations = {
  '/': {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  },
  '/about': {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.1 }
  },
  '/products': {
    initial: { opacity: 0, rotateY: -90 },
    animate: { opacity: 1, rotateY: 0 },
    exit: { opacity: 0, rotateY: 90 }
  }
};

// 自定义动画钩子
function useRouteAnimation(path) {
  return routeAnimations[path] || routeAnimations['/'];
}

// 动态动画页面
function DynamicAnimatedPage({ children, path }) {
  const animation = useRouteAnimation(path);
  
  return (
    <motion.div
      initial={animation.initial}
      animate={animation.animate}
      exit={animation.exit}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}
```

## 滚动恢复和管理

### 基础滚动恢复

```jsx
import { ScrollRestoration } from 'react-router-dom';

// 基础滚动恢复
function AppWithScrollRestoration() {
  return (
    <BrowserRouter>
      <ScrollRestoration />
      <Routes>
        {/* 路由配置 */}
      </Routes>
    </BrowserRouter>
  );
}

// 自定义滚动恢复行为
function CustomScrollRestoration() {
  return (
    <ScrollRestoration
      getKey={(location, matches) => {
        // 为不同路由设置不同的key
        const paths = ["/", "/products", "/search"];
        return paths.includes(location.pathname)
          ? location.pathname // 这些路由保存滚动位置
          : location.key; // 其他路由使用默认行为
      }}
    />
  );
}

// 手动滚动管理
function useScrollToTop() {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
}

// 滑动到锁点
function useScrollToHash() {
  const location = useLocation();
  
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.substring(1);
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [location]);
}

// 保存和恢复滚动位置
function useScrollPosition() {
  const location = useLocation();
  const scrollPositions = useRef(new Map());
  
  useEffect(() => {
    const handleScroll = () => {
      scrollPositions.current.set(
        location.key,
        window.scrollY
      );
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [location]);
  
  useEffect(() => {
    const savedPosition = scrollPositions.current.get(location.key);
    if (savedPosition !== undefined) {
      window.scrollTo(0, savedPosition);
    } else {
      window.scrollTo(0, 0);
    }
  }, [location]);
}

// 带滚动管理的页面组件
function PageWithScroll({ children }) {
  useScrollToTop();
  useScrollToHash();
  
  return (
    <div className="page-container">
      {children}
    </div>
  );
}
```

## 路由性能监控

### 路由性能跟踪

```jsx
import { useEffect, useRef } from 'react';
import { useLocation, useNavigation } from 'react-router-dom';

// 路由性能监控Hook
function useRoutePerformance() {
  const location = useLocation();
  const navigation = useNavigation();
  const startTime = useRef(null);
  
  useEffect(() => {
    // 记录路由开始时间
    startTime.current = performance.now();
  }, [location.pathname]);
  
  useEffect(() => {
    if (navigation.state === 'idle' && startTime.current) {
      // 计算路由加载时间
      const loadTime = performance.now() - startTime.current;
      
      // 发送性能数据
      if (window.gtag) {
        window.gtag('event', 'route_load', {
          event_category: 'performance',
          event_label: location.pathname,
          value: Math.round(loadTime)
        });
      }
      
      console.log(`Route ${location.pathname} loaded in ${loadTime}ms`);
      
      // 性能警告
      if (loadTime > 3000) {
        console.warn(`Slow route load: ${location.pathname} took ${loadTime}ms`);
      }
    }
  }, [navigation.state, location.pathname]);
}

// Web Vitals监控
function useWebVitals() {
  useEffect(() => {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(console.log);
      getFID(console.log);
      getFCP(console.log);
      getLCP(console.log);
      getTTFB(console.log);
    });
  }, []);
}

// 路由加载进度指示器
function RouteLoadingIndicator() {
  const navigation = useNavigation();
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef(null);
  
  useEffect(() => {
    if (navigation.state === 'loading') {
      setProgress(0);
      intervalRef.current = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) return prev;
          return prev + 10;
        });
      }, 100);
    } else {
      setProgress(100);
      setTimeout(() => setProgress(0), 300);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  }, [navigation.state]);
  
  if (progress === 0) return null;
  
  return (
    <div className="route-loading-bar">
      <div 
        className="route-loading-progress"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
```

## 路由预取和数据预加载

### 数据预取策略

```jsx
import { useFetcher } from 'react-router-dom';

// 产品卡片与预取
function ProductCard({ product }) {
  const fetcher = useFetcher();
  const [isPrefetching, setIsPrefetching] = useState(false);
  
  const handleMouseEnter = () => {
    if (!isPrefetching) {
      setIsPrefetching(true);
      // 预取产品详情数据
      fetcher.load(`/api/products/${product.id}`);
    }
  };
  
  return (
    <div 
      className="product-card"
      onMouseEnter={handleMouseEnter}
    >
      <Link to={`/products/${product.id}`}>
        <img src={product.thumbnail} alt={product.name} />
        <h3>{product.name}</h3>
        <p>{product.price}</p>
      </Link>
      {isPrefetching && (
        <div className="prefetch-indicator">
          <span className="sr-only">预加载中...</span>
        </div>
      )}
    </div>
  );
}

// 路由数据缓存
const routeCache = {
  cache: new Map(),
  maxAge: 5 * 60 * 1000, // 5分钟
  
  set(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  },
  
  get(key) {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() - entry.timestamp > this.maxAge) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  },
  
  clear() {
    this.cache.clear();
  }
};

// 带缓存的路由加载器
export async function cachedLoader({ request, params }) {
  const cacheKey = `${request.url}`;
  
  // 检查缓存
  const cached = routeCache.get(cacheKey);
  if (cached) {
    return cached;
  }
  
  // 获取数据
  const data = await fetchData(params);
  
  // 缓存数据
  routeCache.set(cacheKey, data);
  
  return data;
}

// 预加载管理器
class PreloadManager {
  constructor() {
    this.queue = [];
    this.loading = new Set();
    this.loaded = new Set();
  }
  
  async preload(path, loader) {
    // 已加载或正在加载中
    if (this.loaded.has(path) || this.loading.has(path)) {
      return;
    }
    
    this.loading.add(path);
    
    try {
      await loader();
      this.loaded.add(path);
    } catch (error) {
      console.error(`Failed to preload ${path}:`, error);
    } finally {
      this.loading.delete(path);
    }
  }
  
  // 批量预加载
  async preloadBatch(routes) {
    const promises = routes.map(({ path, loader }) => 
      this.preload(path, loader)
    );
    await Promise.allSettled(promises);
  }
}

const preloadManager = new PreloadManager();

// 使用预加载管理器
function NavigationMenu() {
  const mainRoutes = [
    { path: '/dashboard', loader: () => import('./pages/Dashboard') },
    { path: '/analytics', loader: () => import('./pages/Analytics') },
    { path: '/reports', loader: () => import('./pages/Reports') }
  ];
  
  // 在组件挂载后预加载主要路由
  useEffect(() => {
    // 延迟预加载，避免影响初始加载
    const timer = setTimeout(() => {
      preloadManager.preloadBatch(mainRoutes);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <nav>
      {mainRoutes.map(({ path }) => (
        <SmartLink key={path} to={path}>
          {path.substring(1)}
        </SmartLink>
      ))}
    </nav>
  );
}
```

## 路由确认和导航拦截

### 离开页面确认

```jsx
import { useBlocker } from 'react-router-dom';

// 表单离开确认
function FormWithPrompt() {
  const [formData, setFormData] = useState({});
  const [isDirty, setIsDirty] = useState(false);
  
  // 使用blocker拦截导航
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      isDirty && currentLocation.pathname !== nextLocation.pathname
  );
  
  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setIsDirty(true);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    await saveForm(formData);
    setIsDirty(false);
  };
  
  return (
    <>
      <form onSubmit={handleSubmit}>
        <input
          name="name"
          value={formData.name || ''}
          onChange={handleChange}
          placeholder="姓名"
        />
        <textarea
          name="description"
          value={formData.description || ''}
          onChange={handleChange}
          placeholder="描述"
        />
        <button type="submit">保存</button>
      </form>
      
      {/* 确认对话框 */}
      {blocker.state === "blocked" && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>确认离开？</h3>
            <p>您有未保存的更改，确定要离开吗？</p>
            <div className="modal-actions">
              <button onClick={() => blocker.proceed()}>
                离开
              </button>
              <button onClick={() => blocker.reset()}>
                继续编辑
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// 自定义确认Hook
function useNavigationPrompt(message, when = true) {
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      when && currentLocation.pathname !== nextLocation.pathname
  );
  
  const [showPrompt, setShowPrompt] = useState(false);
  
  useEffect(() => {
    if (blocker.state === 'blocked') {
      setShowPrompt(true);
    }
  }, [blocker.state]);
  
  const confirm = () => {
    blocker.proceed();
    setShowPrompt(false);
  };
  
  const cancel = () => {
    blocker.reset();
    setShowPrompt(false);
  };
  
  return {
    showPrompt,
    confirm,
    cancel,
    message
  };
}

// 使用自定义Hook
function EditPage() {
  const [hasChanges, setHasChanges] = useState(false);
  
  const prompt = useNavigationPrompt(
    '您有未保存的更改，确定要离开吗？',
    hasChanges
  );
  
  return (
    <>
      <div className="edit-page">
        {/* 编辑内容 */}
      </div>
      
      {prompt.showPrompt && (
        <ConfirmDialog
          message={prompt.message}
          onConfirm={prompt.confirm}
          onCancel={prompt.cancel}
        />
      )}
    </>
  );
}
```

## 高级路由模式

### 路由中间件系统

```jsx
// 路由中间件系统
class RouteMiddleware {
  constructor() {
    this.middlewares = [];
  }
  
  use(middleware) {
    this.middlewares.push(middleware);
  }
  
  async run(context) {
    let index = 0;
    
    const next = async () => {
      if (index >= this.middlewares.length) return;
      
      const middleware = this.middlewares[index++];
      await middleware(context, next);
    };
    
    await next();
  }
}

// 中间件示例
const authMiddleware = async (context, next) => {
  const { location, navigate } = context;
  const token = localStorage.getItem('token');
  
  if (!token && location.pathname.startsWith('/admin')) {
    navigate('/login');
    return;
  }
  
  await next();
};

const analyticsMiddleware = async (context, next) => {
  const { location } = context;
  
  // 发送分析数据
  if (window.gtag) {
    window.gtag('event', 'page_view', {
      page_path: location.pathname
    });
  }
  
  await next();
};

const permissionMiddleware = async (context, next) => {
  const { location, user } = context;
  const requiredPermission = getRequiredPermission(location.pathname);
  
  if (requiredPermission && !user?.permissions?.includes(requiredPermission)) {
    context.navigate('/403');
    return;
  }
  
  await next();
};

// 使用中间件的路由组件
function MiddlewareRouter({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const middleware = useRef(new RouteMiddleware());
  
  // 注册中间件
  useEffect(() => {
    middleware.current.use(authMiddleware);
    middleware.current.use(analyticsMiddleware);
    middleware.current.use(permissionMiddleware);
  }, []);
  
  // 运行中间件
  useEffect(() => {
    const context = { location, navigate, user };
    middleware.current.run(context);
  }, [location, user]);
  
  return children;
}

// 路由配置与元数据
const routeConfig = [
  {
    path: '/',
    element: <Home />,
    meta: {
      title: '首页',
      requiresAuth: false
    }
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    meta: {
      title: '管理后台',
      requiresAuth: true,
      permission: 'admin:access'
    },
    children: [
      {
        path: 'users',
        element: <UserManagement />,
        meta: {
          title: '用户管理',
          permission: 'admin:users:read'
        }
      }
    ]
  }
];

// 根据路由配置生成路由
function generateRoutes(config) {
  return config.map(route => {
    const RouteElement = route.meta?.requiresAuth 
      ? <RequireAuth>{route.element}</RequireAuth>
      : route.element;
    
    return (
      <Route
        key={route.path}
        path={route.path}
        element={<RouteWrapper meta={route.meta}>{RouteElement}</RouteWrapper>}
      >
        {route.children && generateRoutes(route.children)}
      </Route>
    );
  });
}

// 路由包装器
function RouteWrapper({ meta, children }) {
  // 设置页面标题
  useEffect(() => {
    if (meta?.title) {
      document.title = `${meta.title} - 我的应用`;
    }
  }, [meta]);
  
  // 检查权限
  const { user } = useAuth();
  if (meta?.permission && !user?.permissions?.includes(meta.permission)) {
    return <AccessDenied />;
  }
  
  return children;
}
```

## 工具函数和组件

```jsx
// 路由工具函数
const routeUtils = {
  // 获取路由参数
  getParams(pathname, pattern) {
    const regex = new RegExp(
      pattern.replace(/:([^\/]+)/g, '(?<$1>[^\\/]+)')
    );
    const match = pathname.match(regex);
    return match?.groups || {};
  },
  
  // 生成路由路径
  generatePath(pattern, params = {}) {
    return pattern.replace(/:([^\/]+)/g, (match, key) => {
      if (params[key] == null) {
        throw new Error(`Missing parameter: ${key}`);
      }
      return params[key];
    });
  },
  
  // 匹配路由
  matchPath(pathname, pattern) {
    if (pattern === '*') return true;
    
    const regex = new RegExp(
      '^' + pattern
        .replace(/:[^\s/]+/g, '([^/]+)')
        .replace(/\*/g, '.*') + '$'
    );
    
    return regex.test(pathname);
  }
};

// 路由面包屑组件
function RouteBreadcrumbs() {
  const location = useLocation();
  const matches = location.pathname.split('/').filter(Boolean);
  
  const breadcrumbs = matches.map((match, index) => {
    const path = '/' + matches.slice(0, index + 1).join('/');
    const isLast = index === matches.length - 1;
    
    return {
      path,
      label: match.charAt(0).toUpperCase() + match.slice(1),
      isLast
    };
  });
  
  return (
    <nav aria-label="breadcrumb">
      <ol className="breadcrumb">
        <li className="breadcrumb-item">
          <Link to="/">首页</Link>
        </li>
        {breadcrumbs.map((crumb) => (
          <li
            key={crumb.path}
            className={`breadcrumb-item ${crumb.isLast ? 'active' : ''}`}
          >
            {crumb.isLast ? (
              crumb.label
            ) : (
              <Link to={crumb.path}>{crumb.label}</Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

// 活动路由指示器
function ActiveRoute({ children, to, className = '', activeClassName = 'active' }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <div className={`${className} ${isActive ? activeClassName : ''}`}>
      {children}
    </div>
  );
}

// 路由跨度组件
function RouteProgress() {
  const navigation = useNavigation();
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    let interval;
    
    if (navigation.state === 'loading') {
      setProgress(10);
      interval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 200);
    } else if (navigation.state === 'idle') {
      setProgress(100);
      setTimeout(() => setProgress(0), 300);
    }
    
    return () => clearInterval(interval);
  }, [navigation.state]);
  
  if (progress === 0) return null;
  
  return (
    <div className="route-progress">
      <div
        className="route-progress-bar"
        style={{
          width: `${progress}%`,
          transition: 'width 200ms ease-out'
        }}
      />
    </div>
  );
}

// 导出所有组件和工具
export {
  SmartLink,
  PreloadLink,
  AnimatedRoutes,
  AnimatedRoutesWithFramer,
  RouteLoadingIndicator,
  FormWithPrompt,
  MiddlewareRouter,
  RouteBreadcrumbs,
  ActiveRoute,
  RouteProgress,
  routeUtils,
  preloadManager,
  routeCache
};
```

这个高级路由特性示例展示了React Router v6的各种高级功能，包括代码分割、路由动画、性能优化等。