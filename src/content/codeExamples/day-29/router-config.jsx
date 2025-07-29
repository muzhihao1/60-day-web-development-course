---
title: "路由配置示例"
description: "React Router v6的基础配置和核心功能展示"
category: "react"
language: "javascript"
day: 29
concepts:
  - "React Router v6"
  - "路由配置"
  - "嵌套路由"
  - "动态路由"
  - "路由守卫"
relatedTopics:
  - "SPA"
  - "导航"
  - "状态管理"
---

# React Router v6 路由配置示例

## 基础路由设置

### 主应用路由配置

```jsx
import React from 'react';
import { 
  BrowserRouter, 
  Routes, 
  Route, 
  Link, 
  NavLink,
  Outlet,
  useNavigate,
  useLocation,
  useParams,
  Navigate
} from 'react-router-dom';

// 页面组件
function Home() {
  return (
    <div className="home">
      <h1>欢迎来到首页</h1>
      <p>这是一个使用React Router v6构建的单页应用</p>
    </div>
  );
}

function About() {
  return (
    <div className="about">
      <h1>关于我们</h1>
      <p>了解更多关于我们公司的信息</p>
    </div>
  );
}

function Contact() {
  const navigate = useNavigate();
  
  const handleSubmit = (e) => {
    e.preventDefault();
    // 处理表单提交
    alert('表单已提交！');
    // 编程式导航
    navigate('/');
  };
  
  return (
    <div className="contact">
      <h1>联系我们</h1>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="姓名" required />
        <input type="email" placeholder="邮箱" required />
        <textarea placeholder="留言" required></textarea>
        <button type="submit">提交</button>
      </form>
    </div>
  );
}

function NotFound() {
  return (
    <div className="not-found">
      <h1>404 - 页面未找到</h1>
      <Link to="/">返回首页</Link>
    </div>
  );
}

// 主应用组件
function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Navigation />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

// 导航组件
function Navigation() {
  return (
    <nav className="main-nav">
      <NavLink 
        to="/"
        className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
      >
        首页
      </NavLink>
      <NavLink 
        to="/about"
        className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
      >
        关于
      </NavLink>
      <NavLink 
        to="/contact"
        className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
      >
        联系
      </NavLink>
    </nav>
  );
}
```

## 嵌套路由和布局

### 带布局的嵌套路由

```jsx
// 主布局组件
function Layout() {
  const location = useLocation();
  
  return (
    <div className="layout">
      <header className="header">
        <h1>我的应用</h1>
        <Navigation />
      </header>
      
      <div className="content-wrapper">
        <aside className="sidebar">
          <SidebarMenu currentPath={location.pathname} />
        </aside>
        
        <main className="main-content">
          {/* 子路由在这里渲染 */}
          <Outlet />
        </main>
      </div>
      
      <footer className="footer">
        <p>&copy; 2024 我的应用. 保留所有权利.</p>
      </footer>
    </div>
  );
}

// 侧边栏菜单
function SidebarMenu({ currentPath }) {
  const menuItems = [
    { path: '/dashboard', label: '仪表板', icon: '📈' },
    { path: '/products', label: '产品', icon: '📦' },
    { path: '/orders', label: '订单', icon: '📄' },
    { path: '/customers', label: '客户', icon: '👥' },
    { path: '/settings', label: '设置', icon: '⚙️' }
  ];
  
  return (
    <ul className="sidebar-menu">
      {menuItems.map(item => (
        <li key={item.path}>
          <NavLink 
            to={item.path}
            className={({ isActive }) => 
              isActive ? 'menu-item active' : 'menu-item'
            }
          >
            <span className="icon">{item.icon}</span>
            <span className="label">{item.label}</span>
          </NavLink>
        </li>
      ))}
    </ul>
  );
}

// 应用路由配置
function AppWithLayout() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="products" element={<ProductsLayout />}>
            <Route index element={<ProductList />} />
            <Route path=":productId" element={<ProductDetail />} />
            <Route path="new" element={<NewProduct />} />
          </Route>
          <Route path="orders" element={<Orders />} />
          <Route path="customers" element={<Customers />} />
          <Route path="settings/*" element={<Settings />} />
        </Route>
        
        {/* 独立布局的页面 */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
```

## 动态路由和参数

### 产品路由示例

```jsx
// 产品布局
function ProductsLayout() {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');
  
  return (
    <div className="products-layout">
      <div className="products-header">
        <h1>产品管理</h1>
        <Link to="/products/new" className="btn btn-primary">
          添加新产品
        </Link>
      </div>
      
      <div className="products-filters">
        <input
          type="text"
          placeholder="搜索产品..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select 
          value={category} 
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="all">所有分类</option>
          <option value="electronics">电子产品</option>
          <option value="clothing">服装</option>
          <option value="food">食品</option>
        </select>
      </div>
      
      {/* 传递上下文给子路由 */}
      <Outlet context={{ searchTerm, category }} />
    </div>
  );
}

// 产品列表
import { useOutletContext, useSearchParams } from 'react-router-dom';

function ProductList() {
  const { searchTerm, category } = useOutletContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // 从 URL 获取分页参数
  const page = parseInt(searchParams.get('page') || '1');
  const sort = searchParams.get('sort') || 'name';
  
  useEffect(() => {
    // 模拟获取产品数据
    fetchProducts({ searchTerm, category, page, sort })
      .then(setProducts)
      .finally(() => setLoading(false));
  }, [searchTerm, category, page, sort]);
  
  const handlePageChange = (newPage) => {
    setSearchParams(prev => {
      prev.set('page', newPage.toString());
      return prev;
    });
  };
  
  const handleSortChange = (newSort) => {
    setSearchParams(prev => {
      prev.set('sort', newSort);
      prev.set('page', '1'); // 重置页码
      return prev;
    });
  };
  
  if (loading) return <div>加载中...</div>;
  
  return (
    <div className="product-list">
      <div className="list-controls">
        <select value={sort} onChange={(e) => handleSortChange(e.target.value)}>
          <option value="name">按名称排序</option>
          <option value="price">按价格排序</option>
          <option value="date">按日期排序</option>
        </select>
      </div>
      
      <div className="products-grid">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      
      <Pagination 
        currentPage={page}
        totalPages={10}
        onPageChange={handlePageChange}
      />
    </div>
  );
}

// 产品卡片
function ProductCard({ product }) {
  return (
    <div className="product-card">
      <img src={product.image} alt={product.name} />
      <h3>{product.name}</h3>
      <p className="price">￥{product.price}</p>
      <div className="actions">
        <Link to={`/products/${product.id}`} className="btn btn-sm">
          查看详情
        </Link>
        <Link to={`/products/${product.id}/edit`} className="btn btn-sm">
          编辑
        </Link>
      </div>
    </div>
  );
}

// 产品详情
function ProductDetail() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // 获取产品详情
    fetchProduct(productId)
      .then(setProduct)
      .catch(() => navigate('/products', { replace: true }))
      .finally(() => setLoading(false));
  }, [productId, navigate]);
  
  if (loading) return <LoadingSpinner />;
  if (!product) return <div>产品未找到</div>;
  
  return (
    <div className="product-detail">
      <button onClick={() => navigate(-1)} className="btn-back">
        ← 返回
      </button>
      
      <div className="detail-content">
        <div className="product-images">
          <img src={product.image} alt={product.name} />
        </div>
        
        <div className="product-info">
          <h1>{product.name}</h1>
          <p className="price">￥{product.price}</p>
          <p className="description">{product.description}</p>
          
          <div className="product-meta">
            <p>分类：{product.category}</p>
            <p>库存：{product.stock}</p>
            <p>SKU：{product.sku}</p>
          </div>
          
          <div className="product-actions">
            <Link 
              to={`/products/${productId}/edit`} 
              className="btn btn-primary"
            >
              编辑产品
            </Link>
            <button className="btn btn-danger" onClick={handleDelete}>
              删除产品
            </button>
          </div>
        </div>
      </div>
    </div>
  );
  
  function handleDelete() {
    if (confirm('确定要删除这个产品吗？')) {
      deleteProduct(productId).then(() => {
        navigate('/products');
      });
    }
  }
}
```

## 路由守卫和认证

### 认证上下文和守卫

```jsx
import { createContext, useContext, useState, useEffect } from 'react';

// 认证上下文
const AuthContext = createContext(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth必须在AuthProvider内使用');
  }
  return context;
}

// 认证Provider
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // 检查用户登录状态
    const token = localStorage.getItem('authToken');
    if (token) {
      // 验证token并获取用户信息
      validateToken(token)
        .then(userData => setUser(userData))
        .catch(() => localStorage.removeItem('authToken'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);
  
  const login = async (credentials) => {
    const { user, token } = await api.login(credentials);
    localStorage.setItem('authToken', token);
    setUser(user);
    return user;
  };
  
  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
  };
  
  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// 认证守卫组件
function RequireAuth({ children }) {
  const auth = useAuth();
  const location = useLocation();
  
  if (auth.loading) {
    return <div className="auth-loading">验证中...</div>;
  }
  
  if (!auth.isAuthenticated) {
    // 保存当前位置，登录后可以返回
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return children;
}

// 角色守卫
function RequireRole({ roles, children }) {
  const { user } = useAuth();
  
  const hasRequiredRole = roles.some(role => 
    user?.roles?.includes(role)
  );
  
  if (!hasRequiredRole) {
    return (
      <div className="access-denied">
        <h1>访问被拒绝</h1>
        <p>您没有权限访问这个页面</p>
        <Link to="/">返回首页</Link>
      </div>
    );
  }
  
  return children;
}

// 已登录重定向
function RedirectIfAuthenticated({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  
  if (isAuthenticated) {
    const from = location.state?.from?.pathname || '/';
    return <Navigate to={from} replace />;
  }
  
  return children;
}

// 登录页面
function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth();
  const [error, setError] = useState('');
  
  const from = location.state?.from?.pathname || '/';
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    try {
      await auth.login({
        email: formData.get('email'),
        password: formData.get('password')
      });
      navigate(from, { replace: true });
    } catch (err) {
      setError('登录失败，请检查用户名和密码');
    }
  };
  
  return (
    <div className="login-page">
      <div className="login-form">
        <h2>登录</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="邮箱"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="密码"
            required
          />
          <button type="submit">登录</button>
        </form>
        <p>
          还没有账号？<Link to="/register">注册</Link>
        </p>
      </div>
    </div>
  );
}

// 带认证的应用路由
function AuthenticatedApp() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* 公开路由 */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="products" element={<ProductsPublic />} />
          </Route>
          
          {/* 认证路由 */}
          <Route path="/login" element={
            <RedirectIfAuthenticated>
              <Login />
            </RedirectIfAuthenticated>
          } />
          <Route path="/register" element={
            <RedirectIfAuthenticated>
              <Register />
            </RedirectIfAuthenticated>
          } />
          
          {/* 受保护的路由 */}
          <Route path="/dashboard" element={
            <RequireAuth>
              <Layout />
            </RequireAuth>
          }>
            <Route index element={<Dashboard />} />
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          
          {/* 管理员路由 */}
          <Route path="/admin" element={
            <RequireAuth>
              <RequireRole roles={['admin']}>
                <AdminLayout />
              </RequireRole>
            </RequireAuth>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
```

## 路由配置对象方式

### 使用createBrowserRouter

```jsx
import { 
  createBrowserRouter, 
  RouterProvider,
  createRoutesFromElements,
  Route 
} from 'react-router-dom';

// 路由配置对象
const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    errorElement: <ErrorBoundary />,
    loader: rootLoader,
    children: [
      {
        index: true,
        element: <Home />,
        loader: homeLoader
      },
      {
        path: 'about',
        element: <About />
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
            action: productAction,
            errorElement: <ProductError />
          },
          {
            path: 'new',
            element: <NewProduct />,
            action: createProductAction
          }
        ]
      },
      {
        path: 'profile',
        element: <Profile />,
        loader: profileLoader,
        action: profileAction
      }
    ]
  },
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      {
        path: 'login',
        element: <Login />,
        action: loginAction
      },
      {
        path: 'register',
        element: <Register />,
        action: registerAction
      }
    ]
  }
]);

// 使用JSX创建路由
const routerFromJSX = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<Root />} errorElement={<ErrorBoundary />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="products" element={<ProductsLayout />}>
          <Route index element={<ProductList />} loader={productsLoader} />
          <Route 
            path=":productId" 
            element={<ProductDetail />} 
            loader={productLoader}
          />
        </Route>
      </Route>
      <Route path="/auth" element={<AuthLayout />}>
        <Route path="login" element={<Login />} action={loginAction} />
        <Route path="register" element={<Register />} action={registerAction} />
      </Route>
    </>
  )
);

// 主应用
function App() {
  return <RouterProvider router={router} />;
}

// Loader函数
async function rootLoader() {
  const user = await getUser();
  return { user };
}

async function productsLoader({ request }) {
  const url = new URL(request.url);
  const searchParams = Object.fromEntries(url.searchParams);
  
  const products = await api.getProducts({
    page: searchParams.page || 1,
    category: searchParams.category,
    sort: searchParams.sort
  });
  
  return { products };
}

async function productLoader({ params }) {
  const product = await api.getProduct(params.productId);
  if (!product) {
    throw new Response('Product not found', { status: 404 });
  }
  return { product };
}

// Action函数
async function loginAction({ request }) {
  const formData = await request.formData();
  const email = formData.get('email');
  const password = formData.get('password');
  
  try {
    const user = await api.login({ email, password });
    return redirect('/');
  } catch (error) {
    return { error: error.message };
  }
}

async function createProductAction({ request }) {
  const formData = await request.formData();
  const product = Object.fromEntries(formData);
  
  try {
    const newProduct = await api.createProduct(product);
    return redirect(`/products/${newProduct.id}`);
  } catch (error) {
    return { error: error.message };
  }
}

// 错误处理组件
function ErrorBoundary() {
  const error = useRouteError();
  
  if (isRouteErrorResponse(error)) {
    return (
      <div className="error-page">
        <h1>{error.status} {error.statusText}</h1>
        <p>{error.data}</p>
      </div>
    );
  }
  
  return (
    <div className="error-page">
      <h1>出错了！</h1>
      <p>{error?.message || '发生了未知错误'}</p>
    </div>
  );
}
```

## 工具函数和辅助组件

```jsx
// 模拟API
const api = {
  login: async (credentials) => {
    // 模拟登录
    await delay(1000);
    if (credentials.email === 'admin@example.com' && credentials.password === 'admin') {
      return {
        user: { id: 1, name: 'Admin', email: credentials.email, roles: ['admin'] },
        token: 'fake-jwt-token'
      };
    }
    throw new Error('用户名或密码错误');
  },
  
  getProducts: async (params) => {
    await delay(500);
    return Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      name: `产品 ${i + 1}`,
      price: Math.floor(Math.random() * 1000) + 100,
      category: ['electronics', 'clothing', 'food'][Math.floor(Math.random() * 3)],
      image: `https://via.placeholder.com/300x200?text=Product+${i + 1}`
    }));
  },
  
  getProduct: async (id) => {
    await delay(300);
    return {
      id,
      name: `产品 ${id}`,
      price: Math.floor(Math.random() * 1000) + 100,
      description: '这是一个优质的产品，拥有出色的性能和设计。',
      category: 'electronics',
      stock: Math.floor(Math.random() * 100),
      sku: `SKU-${id}`,
      image: `https://via.placeholder.com/600x400?text=Product+${id}`
    };
  }
};

// 延迟函数
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 模拟验证Token
async function validateToken(token) {
  await delay(500);
  if (token === 'fake-jwt-token') {
    return { id: 1, name: 'Admin', email: 'admin@example.com', roles: ['admin'] };
  }
  throw new Error('Invalid token');
}

// 加载动画组件
function LoadingSpinner() {
  return (
    <div className="loading-spinner">
      <div className="spinner"></div>
      <p>加载中...</p>
    </div>
  );
}

// 分页组件
function Pagination({ currentPage, totalPages, onPageChange }) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  
  return (
    <div className="pagination">
      <button 
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        上一页
      </button>
      
      {pages.map(page => (
        <button
          key={page}
          className={page === currentPage ? 'active' : ''}
          onClick={() => onPageChange(page)}
        >
          {page}
        </button>
      ))}
      
      <button 
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        下一页
      </button>
    </div>
  );
}

// 面包屑组件
function Breadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(x => x);
  
  return (
    <nav className="breadcrumbs">
      <Link to="/">首页</Link>
      {pathnames.map((value, index) => {
        const to = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        
        return isLast ? (
          <span key={to}> / {value}</span>
        ) : (
          <span key={to}>
            {' / '}
            <Link to={to}>{value}</Link>
          </span>
        );
      })}
    </nav>
  );
}

// 导出所有组件
export {
  App,
  AppWithLayout,
  AuthenticatedApp,
  AuthProvider,
  RequireAuth,
  RequireRole,
  useAuth
};
```

这个示例展示了React Router v6的核心功能，包括基础路由配置、嵌套路由、动态路由、路由守卫等。