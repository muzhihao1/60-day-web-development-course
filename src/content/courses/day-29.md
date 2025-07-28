---
day: 29
phase: "react-development"
title: "React Router与导航"
description: "掌握React Router v6的核心概念和高级特性，学习构建单页应用的路由系统，实现动态路由、嵌套路由、路由守卫等功能"
objectives:
  - "理解SPA路由的工作原理"
  - "掌握React Router v6的核心API"
  - "实现嵌套路由和动态路由"
  - "学习路由守卫和权限控制"
  - "掌握代码分割和懒加载技术"
estimatedTime: 120
difficulty: "intermediate"
prerequisites: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 25, 26, 27, 28]
tags:
  - "React"
  - "React Router"
  - "路由"
  - "导航"
  - "SPA"
resources:
  - title: "React Router官方文档"
    url: "https://reactrouter.com/"
    type: "documentation"
  - title: "React Router v6教程"
    url: "https://reactrouter.com/en/main/start/tutorial"
    type: "article"
  - title: "路由原理深入"
    url: "https://medium.com/@marcellamaki/a-brief-overview-of-react-router-and-client-side-routing-70eb420e8cde"
    type: "article"
  - title: "React路由最佳实践"
    url: "https://www.robinwieruch.de/react-router/"
    type: "article"
codeExamples:
  - title: "路由配置示例"
    language: "javascript"
    path: "/code-examples/day-29/router-config.jsx"
  - title: "高级路由特性"
    language: "javascript"
    path: "/code-examples/day-29/advanced-routing.jsx"
---

# Day 29: React Router与导航

## 📋 学习目标

今天我们将深入学习React Router v6，这是React生态系统中最流行的路由解决方案。通过本课程，你将掌握如何在React应用中实现客户端路由，创建多页面的用户体验，同时保持单页应用的性能优势。

## 🌟 理解SPA路由

### 1. 传统路由 vs 客户端路由

```jsx
// 传统多页应用（MPA）
// 每次导航都会：
// 1. 向服务器发送请求
// 2. 服务器返回新的HTML页面
// 3. 浏览器重新加载整个页面
// 缺点：页面闪烁，状态丢失，性能较差

// 单页应用（SPA）客户端路由
// 1. 拦截链接点击和浏览器导航
// 2. 更新URL但不重新加载页面
// 3. 根据URL渲染对应的组件
// 优点：流畅的用户体验，保持应用状态，更快的页面切换
```

### 2. 路由的核心概念

```jsx
// History API - 浏览器提供的接口
window.history.pushState(state, title, url); // 添加历史记录
window.history.replaceState(state, title, url); // 替换当前记录
window.history.back(); // 后退
window.history.forward(); // 前进

// 监听路由变化
window.addEventListener('popstate', (event) => {
  console.log('URL changed to:', window.location.pathname);
});

// React Router的工作原理
// 1. 监听URL变化
// 2. 匹配路由规则
// 3. 渲染对应组件
// 4. 更新浏览器历史
```

## 📊 React Router v6基础

### 1. 安装和基本设置

```bash
npm install react-router-dom
```

```jsx
// App.jsx - 基础路由配置
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

// 其他路由器选项
import { HashRouter, MemoryRouter, StaticRouter } from 'react-router-dom';

// HashRouter - 使用URL的hash部分（#/about）
// 适用于不支持HTML5 History API的环境
<HashRouter>
  <App />
</HashRouter>

// MemoryRouter - 在内存中管理历史记录
// 适用于测试和非浏览器环境
<MemoryRouter initialEntries={['/']}>
  <App />
</MemoryRouter>
```

### 2. 导航组件

```jsx
import { Link, NavLink } from 'react-router-dom';

// Link组件 - 基础导航
function Navigation() {
  return (
    <nav>
      <Link to="/">首页</Link>
      <Link to="/about">关于</Link>
      <Link to="/contact">联系我们</Link>
      
      {/* 带状态的导航 */}
      <Link 
        to="/products" 
        state={{ from: 'navigation' }}
      >
        产品
      </Link>
      
      {/* 相对路径 */}
      <Link to="settings">设置</Link>
      <Link to="../">返回上级</Link>
    </nav>
  );
}

// NavLink组件 - 带激活状态的导航
function MainNav() {
  return (
    <nav>
      <NavLink 
        to="/"
        className={({ isActive }) => 
          isActive ? 'nav-link active' : 'nav-link'
        }
      >
        首页
      </NavLink>
      
      <NavLink 
        to="/about"
        style={({ isActive }) => ({
          color: isActive ? '#007bff' : '#333',
          fontWeight: isActive ? 'bold' : 'normal'
        })}
      >
        关于
      </NavLink>
      
      {/* 自定义激活逻辑 */}
      <NavLink
        to="/messages"
        className={({ isActive, isPending }) => {
          if (isPending) return 'nav-link pending';
          if (isActive) return 'nav-link active';
          return 'nav-link';
        }}
      >
        消息
      </NavLink>
    </nav>
  );
}
```

### 3. 编程式导航

```jsx
import { useNavigate, useLocation } from 'react-router-dom';

function LoginForm() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleLogin = async (credentials) => {
    try {
      await api.login(credentials);
      
      // 导航到之前的页面或默认页面
      const from = location.state?.from || '/dashboard';
      navigate(from, { replace: true });
      
      // 其他导航选项
      navigate('/dashboard'); // 导航到指定路径
      navigate(-1); // 后退
      navigate(1); // 前进
      navigate('/profile', { 
        state: { userId: 123 },
        replace: true // 替换历史记录
      });
    } catch (error) {
      console.error('登录失败', error);
    }
  };
  
  return (
    <form onSubmit={handleLogin}>
      {/* 表单内容 */}
    </form>
  );
}

// 使用Navigate组件进行声明式导航
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ isAuthenticated, children }) {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}
```

## 🔄 嵌套路由和布局

### 1. 嵌套路由配置

```jsx
// 路由配置
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="products" element={<Products />}>
            <Route index element={<ProductList />} />
            <Route path=":productId" element={<ProductDetail />} />
            <Route path="new" element={<NewProduct />} />
          </Route>
          <Route path="users/*" element={<Users />} />
        </Route>
        
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

// Layout组件
import { Outlet } from 'react-router-dom';

function Layout() {
  return (
    <div className="app-layout">
      <Header />
      <nav>
        <MainNavigation />
      </nav>
      <main>
        {/* 子路由会在这里渲染 */}
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

// 带上下文的Outlet
function Products() {
  const [searchTerm, setSearchTerm] = useState('');
  
  return (
    <div className="products-layout">
      <h1>产品中心</h1>
      <SearchBar value={searchTerm} onChange={setSearchTerm} />
      {/* 传递上下文给子路由 */}
      <Outlet context={{ searchTerm }} />
    </div>
  );
}

// 在子组件中使用上下文
import { useOutletContext } from 'react-router-dom';

function ProductList() {
  const { searchTerm } = useOutletContext();
  
  // 使用searchTerm过滤产品
  return <div>产品列表（搜索：{searchTerm}）</div>;
}
```

### 2. 路由配置对象

```jsx
// 使用路由配置对象
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

// 定义路由配置
const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <Home />
      },
      {
        path: "about",
        element: <About />,
        loader: aboutLoader
      },
      {
        path: "contacts",
        element: <Contacts />,
        children: [
          {
            path: ":contactId",
            element: <Contact />,
            loader: contactLoader,
            action: contactAction
          }
        ]
      }
    ]
  },
  {
    path: "/admin",
    element: <AdminRoot />,
    // 路由守卫
    loader: async () => {
      const user = await getUser();
      if (!user.isAdmin) {
        throw new Response("Unauthorized", { status: 403 });
      }
      return user;
    },
    children: [
      {
        path: "dashboard",
        element: <Dashboard />
      }
    ]
  }
]);

// 使用RouterProvider
function App() {
  return <RouterProvider router={router} />;
}
```

## 🎨 动态路由和参数

### 1. URL参数

```jsx
// 路由定义
<Route path="/users/:userId" element={<UserProfile />} />
<Route path="/posts/:year/:month/:slug" element={<BlogPost />} />

// 获取参数
import { useParams } from 'react-router-dom';

function UserProfile() {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    fetchUser(userId).then(setUser);
  }, [userId]);
  
  if (!user) return <Loading />;
  
  return (
    <div>
      <h1>{user.name}的个人主页</h1>
      <p>用户ID: {userId}</p>
    </div>
  );
}

function BlogPost() {
  const { year, month, slug } = useParams();
  
  return (
    <article>
      <p>发布时间：{year}年{month}月</p>
      <p>文章标识：{slug}</p>
    </article>
  );
}

// 可选参数
<Route path="/products/:category/:subcategory?" element={<Products />} />

function Products() {
  const { category, subcategory } = useParams();
  
  return (
    <div>
      <h2>{category}</h2>
      {subcategory && <h3>{subcategory}</h3>}
    </div>
  );
}
```

### 2. 查询参数

```jsx
import { useSearchParams } from 'react-router-dom';

function ProductList() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // 读取查询参数
  const category = searchParams.get('category');
  const sort = searchParams.get('sort') || 'name';
  const page = parseInt(searchParams.get('page') || '1');
  
  // 更新查询参数
  const updateFilter = (newCategory) => {
    setSearchParams(prev => {
      prev.set('category', newCategory);
      prev.set('page', '1'); // 重置页码
      return prev;
    });
  };
  
  const changePage = (newPage) => {
    setSearchParams(prev => {
      prev.set('page', newPage.toString());
      return prev;
    });
  };
  
  // 保留现有参数的更新
  const updateSort = (newSort) => {
    setSearchParams({
      ...Object.fromEntries(searchParams),
      sort: newSort
    });
  };
  
  return (
    <div>
      <FilterBar 
        category={category}
        onCategoryChange={updateFilter}
      />
      <SortSelector 
        value={sort}
        onChange={updateSort}
      />
      <ProductGrid 
        category={category}
        sort={sort}
        page={page}
      />
      <Pagination 
        currentPage={page}
        onPageChange={changePage}
      />
    </div>
  );
}

// 构建带查询参数的链接
function CategoryLink({ category }) {
  const [searchParams] = useSearchParams();
  
  // 保留现有参数
  const newParams = new URLSearchParams(searchParams);
  newParams.set('category', category);
  
  return (
    <Link to={`/products?${newParams.toString()}`}>
      {category}
    </Link>
  );
}
```

## 🔐 路由守卫和权限控制

### 1. 基础路由守卫

```jsx
// 认证守卫组件
function RequireAuth({ children }) {
  const auth = useAuth();
  const location = useLocation();
  
  if (!auth.user) {
    // 重定向到登录页，保存来源路径
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return children;
}

// 使用守卫保护路由
function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* 受保护的路由 */}
      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <Dashboard />
          </RequireAuth>
        }
      />
      
      <Route path="/profile" element={
        <RequireAuth>
          <Profile />
        </RequireAuth>
      } />
      
      {/* 嵌套的受保护路由 */}
      <Route element={<RequireAuth><Outlet /></RequireAuth>}>
        <Route path="/settings" element={<Settings />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/favorites" element={<Favorites />} />
      </Route>
    </Routes>
  );
}

// 角色权限守卫
function RequireRole({ role, children }) {
  const auth = useAuth();
  
  if (!auth.user || !auth.user.roles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return children;
}

// 管理员路由
<Route path="/admin" element={
  <RequireRole role="admin">
    <AdminPanel />
  </RequireRole>
}>
  <Route path="users" element={<UserManagement />} />
  <Route path="settings" element={<SystemSettings />} />
</Route>
```

### 2. 高级权限控制

```jsx
// 权限配置
const routePermissions = {
  '/dashboard': ['user', 'admin'],
  '/admin': ['admin'],
  '/moderator': ['moderator', 'admin'],
  '/profile': ['user', 'moderator', 'admin']
};

// 通用权限守卫
function PermissionGuard({ path, children }) {
  const auth = useAuth();
  const requiredRoles = routePermissions[path] || [];
  
  // 检查用户是否有任一必需角色
  const hasPermission = requiredRoles.some(role => 
    auth.user?.roles?.includes(role)
  );
  
  if (!hasPermission) {
    return <AccessDenied />;
  }
  
  return children;
}

// 条件路由组件
function ConditionalRoute({ condition, element, fallback }) {
  return condition ? element : (fallback || <Navigate to="/" />);
}

// 使用示例
<Route path="/premium" element={
  <ConditionalRoute
    condition={user?.subscription === 'premium'}
    element={<PremiumContent />}
    fallback={<UpgradePage />}
  />
} />

// 路由加载器中的权限检查
const adminLoader = async ({ request }) => {
  const user = await getUser();
  
  if (!user || !user.isAdmin) {
    throw new Response("没有权限", { status: 403 });
  }
  
  const data = await fetchAdminData();
  return { user, data };
};
```

## 🚀 代码分割和懒加载

### 1. 路由级代码分割

```jsx
import { lazy, Suspense } from 'react';

// 懒加载组件
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));

// 带重试的懒加载
const lazyWithRetry = (componentImport) => 
  lazy(async () => {
    try {
      return await componentImport();
    } catch (error) {
      // 刷新页面以获取最新版本
      window.location.reload();
      return componentImport();
    }
  });

const Products = lazyWithRetry(() => import('./pages/Products'));

// 路由配置
function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin/*" element={<AdminPanel />} />
          <Route path="/products/*" element={<Products />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

// 更细粒度的加载状态
function LazyBoundary({ children }) {
  return (
    <Suspense
      fallback={
        <div className="lazy-loading">
          <Spinner />
          <p>加载中...</p>
        </div>
      }
    >
      {children}
    </Suspense>
  );
}

// 预加载路由
const preloadRoute = (path) => {
  switch (path) {
    case '/dashboard':
      import('./pages/Dashboard');
      break;
    case '/products':
      import('./pages/Products');
      break;
  }
};

// 在链接悬停时预加载
function SmartLink({ to, children, ...props }) {
  return (
    <Link
      to={to}
      onMouseEnter={() => preloadRoute(to)}
      {...props}
    >
      {children}
    </Link>
  );
}
```

### 2. 路由过渡动画

```jsx
import { useLocation, useOutlet } from 'react-router-dom';
import { CSSTransition, SwitchTransition } from 'react-transition-group';
import { AnimatePresence, motion } from 'framer-motion';

// 使用React Transition Group
function AnimatedRoutes() {
  const location = useLocation();
  const currentOutlet = useOutlet();
  
  return (
    <SwitchTransition>
      <CSSTransition
        key={location.pathname}
        timeout={300}
        classNames="page"
        unmountOnExit
      >
        <div className="page-wrapper">
          {currentOutlet}
        </div>
      </CSSTransition>
    </SwitchTransition>
  );
}

// CSS样式
/*
.page-enter {
  opacity: 0;
  transform: translateX(100%);
}

.page-enter-active {
  opacity: 1;
  transform: translateX(0);
  transition: opacity 300ms, transform 300ms;
}

.page-exit {
  opacity: 1;
  transform: translateX(0);
}

.page-exit-active {
  opacity: 0;
  transform: translateX(-100%);
  transition: opacity 300ms, transform 300ms;
}
*/

// 使用Framer Motion
function AnimatedApp() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Home />
          </motion.div>
        } />
        {/* 其他路由 */}
      </Routes>
    </AnimatePresence>
  );
}

// 自定义页面过渡Hook
function usePageTransition() {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const navigate = useNavigate();
  
  const transitionTo = useCallback((to) => {
    setIsTransitioning(true);
    
    setTimeout(() => {
      navigate(to);
      setIsTransitioning(false);
    }, 300);
  }, [navigate]);
  
  return { isTransitioning, transitionTo };
}
```

## 💼 实战项目：多页面应用

### 完整的电商应用路由系统

```jsx
// 主应用路由配置
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

// 路由配置
const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        index: true,
        element: <HomePage />,
        loader: homeLoader
      },
      {
        path: 'products',
        element: <ProductsLayout />,
        children: [
          {
            index: true,
            element: <ProductList />,
            loader: productsLoader
          },
          {
            path: ':productId',
            element: <ProductDetail />,
            loader: productLoader,
            errorElement: <ProductNotFound />
          },
          {
            path: 'categories/:category',
            element: <CategoryProducts />,
            loader: categoryLoader
          }
        ]
      },
      {
        path: 'cart',
        element: <ShoppingCart />,
        action: cartAction
      },
      {
        path: 'checkout',
        element: <RequireAuth><CheckoutLayout /></RequireAuth>,
        children: [
          {
            index: true,
            element: <Navigate to="shipping" replace />
          },
          {
            path: 'shipping',
            element: <ShippingForm />,
            action: shippingAction
          },
          {
            path: 'payment',
            element: <PaymentForm />,
            action: paymentAction,
            loader: paymentMethodsLoader
          },
          {
            path: 'review',
            element: <OrderReview />,
            loader: orderSummaryLoader
          },
          {
            path: 'success',
            element: <OrderSuccess />
          }
        ]
      },
      {
        path: 'account',
        element: <RequireAuth><AccountLayout /></RequireAuth>,
        children: [
          {
            index: true,
            element: <AccountDashboard />
          },
          {
            path: 'profile',
            element: <ProfileForm />,
            action: profileAction
          },
          {
            path: 'orders',
            element: <OrderHistory />,
            loader: ordersLoader,
            children: [
              {
                path: ':orderId',
                element: <OrderDetail />,
                loader: orderDetailLoader
              }
            ]
          },
          {
            path: 'addresses',
            element: <AddressBook />,
            action: addressAction
          },
          {
            path: 'wishlist',
            element: <Wishlist />,
            loader: wishlistLoader
          }
        ]
      },
      {
        path: 'admin',
        element: <RequireRole role="admin"><AdminLayout /></RequireRole>,
        children: [
          {
            index: true,
            element: <AdminDashboard />,
            loader: adminStatsLoader
          },
          {
            path: 'products',
            element: <ProductManagement />,
            action: productManagementAction,
            children: [
              {
                path: 'new',
                element: <NewProductForm />,
                action: createProductAction
              },
              {
                path: ':productId/edit',
                element: <EditProductForm />,
                loader: productEditLoader,
                action: updateProductAction
              }
            ]
          },
          {
            path: 'orders',
            element: <OrderManagement />,
            loader: adminOrdersLoader,
            action: orderManagementAction
          },
          {
            path: 'users',
            element: <UserManagement />,
            loader: usersLoader
          },
          {
            path: 'analytics',
            element: <Analytics />,
            loader: analyticsLoader
          }
        ]
      }
    ]
  },
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      {
        path: 'login',
        element: <LoginForm />,
        action: loginAction
      },
      {
        path: 'register',
        element: <RegisterForm />,
        action: registerAction
      },
      {
        path: 'forgot-password',
        element: <ForgotPassword />,
        action: forgotPasswordAction
      },
      {
        path: 'reset-password',
        element: <ResetPassword />,
        action: resetPasswordAction
      }
    ]
  }
]);

// 根布局组件
function RootLayout() {
  const navigation = useNavigation();
  const location = useLocation();
  
  return (
    <div className="app">
      <Header />
      
      {/* 全局加载状态 */}
      {navigation.state === "loading" && (
        <div className="global-loader">
          <LinearProgress />
        </div>
      )}
      
      <main>
        <Outlet />
      </main>
      
      <Footer />
      
      {/* 全局通知 */}
      <NotificationContainer />
    </div>
  );
}

// 面包屑导航组件
function Breadcrumbs() {
  const location = useLocation();
  const matches = useMatches();
  
  const crumbs = matches
    .filter(match => match.handle?.crumb)
    .map(match => ({
      label: match.handle.crumb(match),
      path: match.pathname
    }));
  
  return (
    <nav aria-label="breadcrumb">
      <ol className="breadcrumb">
        <li className="breadcrumb-item">
          <Link to="/">首页</Link>
        </li>
        {crumbs.map((crumb, index) => (
          <li 
            key={crumb.path}
            className={`breadcrumb-item ${
              index === crumbs.length - 1 ? 'active' : ''
            }`}
          >
            {index === crumbs.length - 1 ? (
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

// 路由数据加载器
async function productsLoader({ request }) {
  const url = new URL(request.url);
  const searchParams = Object.fromEntries(url.searchParams);
  
  const { products, totalPages } = await api.getProducts({
    page: searchParams.page || 1,
    category: searchParams.category,
    sort: searchParams.sort || 'popularity',
    search: searchParams.q
  });
  
  return { products, totalPages, filters: searchParams };
}

// 路由动作处理器
async function cartAction({ request }) {
  const formData = await request.formData();
  const action = formData.get('action');
  
  switch (action) {
    case 'add':
      return await api.addToCart({
        productId: formData.get('productId'),
        quantity: formData.get('quantity')
      });
      
    case 'update':
      return await api.updateCartItem({
        itemId: formData.get('itemId'),
        quantity: formData.get('quantity')
      });
      
    case 'remove':
      return await api.removeFromCart(formData.get('itemId'));
      
    default:
      throw new Error('Unknown action');
  }
}
```

### 高级路由功能

```jsx
// 滚动恢复
import { ScrollRestoration } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <ScrollRestoration />
      <Routes>
        {/* 路由配置 */}
      </Routes>
    </BrowserRouter>
  );
}

// 路由预取
function ProductCard({ product }) {
  const fetcher = useFetcher();
  
  const prefetchProduct = () => {
    // 预取产品详情
    fetcher.load(`/products/${product.id}`);
  };
  
  return (
    <div 
      className="product-card"
      onMouseEnter={prefetchProduct}
    >
      <Link to={`/products/${product.id}`}>
        <img src={product.image} alt={product.name} />
        <h3>{product.name}</h3>
        <p>{product.price}</p>
      </Link>
    </div>
  );
}

// 路由确认提示
import { useBlocker } from 'react-router-dom';

function FormWithPrompt() {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      hasUnsavedChanges &&
      currentLocation.pathname !== nextLocation.pathname
  );
  
  return (
    <>
      <Form onChange={() => setHasUnsavedChanges(true)}>
        {/* 表单字段 */}
      </Form>
      
      {blocker.state === "blocked" && (
        <Dialog>
          <p>您有未保存的更改，确定要离开吗？</p>
          <button onClick={() => blocker.proceed()}>
            确定离开
          </button>
          <button onClick={() => blocker.reset()}>
            继续编辑
          </button>
        </Dialog>
      )}
    </>
  );
}

// 路由元数据
const routes = [
  {
    path: "/",
    element: <Home />,
    handle: {
      title: "首页 - 我的商店",
      description: "欢迎来到我的在线商店",
      crumb: () => "首页"
    }
  },
  {
    path: "/products/:productId",
    element: <ProductDetail />,
    loader: productLoader,
    handle: {
      title: (data) => `${data.product.name} - 我的商店`,
      description: (data) => data.product.description,
      crumb: (match) => match.data?.product?.name || "产品详情"
    }
  }
];

// 使用路由元数据更新页面标题
function useRouteMetadata() {
  const matches = useMatches();
  const data = matches[matches.length - 1]?.data;
  const handle = matches[matches.length - 1]?.handle;
  
  useEffect(() => {
    if (handle?.title) {
      document.title = typeof handle.title === 'function' 
        ? handle.title(data) 
        : handle.title;
    }
    
    if (handle?.description) {
      const description = typeof handle.description === 'function'
        ? handle.description(data)
        : handle.description;
      
      document
        .querySelector('meta[name="description"]')
        ?.setAttribute('content', description);
    }
  }, [handle, data]);
}
```

## 🎯 今日练习

1. **基础练习**：创建一个博客应用，包含文章列表、文章详情、分类筛选等功能
2. **进阶练习**：实现一个带有用户认证的任务管理系统，包含公开和私有路由
3. **挑战练习**：构建一个多步骤表单向导，支持步骤间导航和数据保存

## 🚀 下一步

明天我们将学习：
- CSS-in-JS的概念和优势
- styled-components深入使用
- emotion和其他CSS-in-JS库
- 主题系统设计
- 响应式样式最佳实践

## 💭 思考题

1. SPA路由相比传统服务端路由有哪些优势和劣势？
2. 什么时候应该使用代码分割？如何平衡bundle大小和用户体验？
3. 如何设计一个既灵活又安全的路由权限系统？
4. React Router v6相比v5有哪些重要改进？
5. 如何处理复杂的路由状态管理（如多步表单）？

记住：**路由是现代单页应用的骨架。设计良好的路由系统不仅能提供流畅的用户体验，还能让应用更易于维护和扩展！**