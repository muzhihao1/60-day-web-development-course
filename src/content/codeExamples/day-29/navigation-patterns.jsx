---
title: "导航模式与最佳实践"
description: "React Router v6的常见导航模式实现，包括面包屑、多步表单、标签页等"
category: "patterns"
language: "javascript"
day: 29
concepts:
  - "导航模式"
  - "面包屑导航"
  - "多步表单"
  - "标签页导航"
  - "移动端导航"
relatedTopics:
  - "UI/UX"
  - "响应式设计"
  - "状态管理"
---

# React Router v6 导航模式与最佳实践

## 面包屑导航

### 动态面包屑实现

```jsx
import React from 'react';
import { Link, useLocation, useMatches } from 'react-router-dom';

// 面包屑配置
const breadcrumbNameMap = {
  '/': '首页',
  '/products': '产品',
  '/products/electronics': '电子产品',
  '/products/clothing': '服装',
  '/users': '用户管理',
  '/settings': '设置',
  '/settings/profile': '个人资料',
  '/settings/security': '安全设置'
};

// 基础面包屑组件
function Breadcrumbs() {
  const location = useLocation();
  const pathSnippets = location.pathname.split('/').filter(i => i);
  
  // 构建面包屑路径
  const breadcrumbItems = pathSnippets.map((_, index) => {
    const url = `/${pathSnippets.slice(0, index + 1).join('/')}`;
    const breadcrumbName = breadcrumbNameMap[url];
    const isLast = index === pathSnippets.length - 1;
    
    return (
      <li key={url} className={`breadcrumb-item ${isLast ? 'active' : ''}`}>
        {isLast ? (
          <span>{breadcrumbName || pathSnippets[index]}</span>
        ) : (
          <Link to={url}>{breadcrumbName || pathSnippets[index]}</Link>
        )}
      </li>
    );
  });
  
  return (
    <nav aria-label="breadcrumb">
      <ol className="breadcrumb">
        <li className="breadcrumb-item">
          <Link to="/">
            <i className="fas fa-home"></i>
          </Link>
        </li>
        {breadcrumbItems}
      </ol>
    </nav>
  );
}

// 高级面包屑（使用路由匹配）
function AdvancedBreadcrumbs() {
  const matches = useMatches();
  
  // 过滤出有面包屑数据的路由
  const crumbs = matches
    .filter((match) => Boolean(match.handle?.crumb))
    .map((match) => ({
      label: match.handle.crumb(match.data),
      path: match.pathname,
      isDynamic: match.handle.isDynamic
    }));
  
  return (
    <nav aria-label="breadcrumb">
      <ol className="breadcrumb">
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;
          
          return (
            <li 
              key={crumb.path}
              className={`breadcrumb-item ${isLast ? 'active' : ''}`}
              aria-current={isLast ? 'page' : undefined}
            >
              {isLast ? (
                <span>{crumb.label}</span>
              ) : (
                <Link to={crumb.path}>{crumb.label}</Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// 路由配置带面包屑
const routesWithBreadcrumbs = [
  {
    path: '/',
    element: <Layout />,
    handle: { crumb: () => '首页' },
    children: [
      {
        path: 'products',
        element: <ProductsLayout />,
        handle: { crumb: () => '产品' },
        children: [
          {
            path: ':productId',
            element: <ProductDetail />,
            loader: async ({ params }) => {
              const product = await getProduct(params.productId);
              return { product };
            },
            handle: { 
              crumb: (data) => data?.product?.name || '产品详情',
              isDynamic: true
            }
          }
        ]
      }
    ]
  }
];
```

## 多步表单导航（向导模式）

### 表单向导实现

```jsx
import { useState, createContext, useContext } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';

// 表单上下文
const FormWizardContext = createContext();

export function useFormWizard() {
  const context = useContext(FormWizardContext);
  if (!context) {
    throw new Error('useFormWizard must be used within FormWizardProvider');
  }
  return context;
}

// 表单向导Provider
function FormWizardProvider({ children }) {
  const [formData, setFormData] = useState({
    // 个人信息
    personalInfo: {
      firstName: '',
      lastName: '',
      email: '',
      phone: ''
    },
    // 地址信息
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    },
    // 支付信息
    payment: {
      cardNumber: '',
      cardName: '',
      expiryDate: '',
      cvv: ''
    },
    // 确认信息
    confirmation: {
      termsAccepted: false,
      newsletterSubscribed: false
    }
  });
  
  const updateFormData = (section, data) => {
    setFormData(prev => ({
      ...prev,
      [section]: { ...prev[section], ...data }
    }));
  };
  
  const resetForm = () => {
    setFormData({
      personalInfo: {},
      address: {},
      payment: {},
      confirmation: {}
    });
  };
  
  return (
    <FormWizardContext.Provider value={{ formData, updateFormData, resetForm }}>
      {children}
    </FormWizardContext.Provider>
  );
}

// 步骤导航组件
function StepNavigation({ steps, currentStep }) {
  return (
    <div className="step-navigation">
      {steps.map((step, index) => {
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;
        
        return (
          <div 
            key={step.path}
            className={`step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
          >
            <div className="step-number">
              {isCompleted ? <i className="fas fa-check"></i> : index + 1}
            </div>
            <div className="step-label">{step.label}</div>
            {index < steps.length - 1 && <div className="step-connector" />}
          </div>
        );
      })}
    </div>
  );
}

// 向导布局
function WizardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const steps = [
    { path: '/wizard/personal', label: '个人信息' },
    { path: '/wizard/address', label: '地址信息' },
    { path: '/wizard/payment', label: '支付方式' },
    { path: '/wizard/review', label: '确认信息' },
    { path: '/wizard/complete', label: '完成' }
  ];
  
  const currentStepIndex = steps.findIndex(step => 
    location.pathname.startsWith(step.path)
  );
  
  const canGoBack = currentStepIndex > 0;
  const canGoNext = currentStepIndex < steps.length - 1;
  
  const goToStep = (stepIndex) => {
    if (stepIndex >= 0 && stepIndex < steps.length) {
      navigate(steps[stepIndex].path);
    }
  };
  
  const goBack = () => {
    if (canGoBack) {
      goToStep(currentStepIndex - 1);
    }
  };
  
  const goNext = () => {
    if (canGoNext) {
      goToStep(currentStepIndex + 1);
    }
  };
  
  return (
    <div className="wizard-container">
      <h1>账户注册</h1>
      <StepNavigation steps={steps} currentStep={currentStepIndex} />
      
      <div className="wizard-content">
        <Outlet context={{ goBack, goNext, canGoBack, canGoNext }} />
      </div>
    </div>
  );
}

// 个人信息步骤
function PersonalInfoStep() {
  const { formData, updateFormData } = useFormWizard();
  const { goNext } = useOutletContext();
  const [errors, setErrors] = useState({});
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // 验证表单
    const newErrors = {};
    if (!formData.personalInfo.firstName) {
      newErrors.firstName = '请输入名字';
    }
    if (!formData.personalInfo.email) {
      newErrors.email = '请输入邮箱';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    goNext();
  };
  
  const handleChange = (field, value) => {
    updateFormData('personalInfo', { [field]: value });
    // 清除错误
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="wizard-form">
      <h2>个人信息</h2>
      
      <div className="form-group">
        <label htmlFor="firstName">名字 *</label>
        <input
          id="firstName"
          type="text"
          value={formData.personalInfo.firstName || ''}
          onChange={(e) => handleChange('firstName', e.target.value)}
          className={errors.firstName ? 'error' : ''}
        />
        {errors.firstName && <span className="error-message">{errors.firstName}</span>}
      </div>
      
      <div className="form-group">
        <label htmlFor="lastName">姓氏</label>
        <input
          id="lastName"
          type="text"
          value={formData.personalInfo.lastName || ''}
          onChange={(e) => handleChange('lastName', e.target.value)}
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="email">邮箱 *</label>
        <input
          id="email"
          type="email"
          value={formData.personalInfo.email || ''}
          onChange={(e) => handleChange('email', e.target.value)}
          className={errors.email ? 'error' : ''}
        />
        {errors.email && <span className="error-message">{errors.email}</span>}
      </div>
      
      <div className="form-group">
        <label htmlFor="phone">电话</label>
        <input
          id="phone"
          type="tel"
          value={formData.personalInfo.phone || ''}
          onChange={(e) => handleChange('phone', e.target.value)}
        />
      </div>
      
      <div className="wizard-actions">
        <button type="submit" className="btn btn-primary">
          下一步
        </button>
      </div>
    </form>
  );
}

// 完整的向导应用
function FormWizardApp() {
  return (
    <FormWizardProvider>
      <Routes>
        <Route path="/wizard" element={<WizardLayout />}>
          <Route index element={<Navigate to="personal" replace />} />
          <Route path="personal" element={<PersonalInfoStep />} />
          <Route path="address" element={<AddressStep />} />
          <Route path="payment" element={<PaymentStep />} />
          <Route path="review" element={<ReviewStep />} />
          <Route path="complete" element={<CompleteStep />} />
        </Route>
      </Routes>
    </FormWizardProvider>
  );
}
```

## 标签页导航

### 标签页组件实现

```jsx
import { NavLink, Outlet, useLocation } from 'react-router-dom';

// 基础标签页导航
function TabNavigation({ tabs }) {
  return (
    <div className="tab-navigation">
      <nav className="tabs">
        {tabs.map(tab => (
          <NavLink
            key={tab.path}
            to={tab.path}
            className={({ isActive }) => `tab ${isActive ? 'active' : ''}`}
          >
            {tab.icon && <i className={tab.icon}></i>}
            <span>{tab.label}</span>
            {tab.badge && <span className="badge">{tab.badge}</span>}
          </NavLink>
        ))}
      </nav>
      <div className="tab-content">
        <Outlet />
      </div>
    </div>
  );
}

// 设置页面的标签导航
function SettingsPage() {
  const tabs = [
    { path: 'profile', label: '个人资料', icon: 'fas fa-user' },
    { path: 'account', label: '账户设置', icon: 'fas fa-cog' },
    { path: 'security', label: '安全设置', icon: 'fas fa-shield-alt' },
    { path: 'notifications', label: '通知设置', icon: 'fas fa-bell', badge: 3 },
    { path: 'privacy', label: '隐私设置', icon: 'fas fa-lock' }
  ];
  
  return (
    <div className="settings-page">
      <h1>设置</h1>
      <TabNavigation tabs={tabs} />
    </div>
  );
}

// 可滚动标签页
function ScrollableTabs({ tabs }) {
  const location = useLocation();
  const tabsRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  
  const checkScroll = () => {
    if (tabsRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tabsRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };
  
  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);
  
  const scroll = (direction) => {
    if (tabsRef.current) {
      const scrollAmount = direction === 'left' ? -200 : 200;
      tabsRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      setTimeout(checkScroll, 300);
    }
  };
  
  return (
    <div className="scrollable-tabs-container">
      {showLeftArrow && (
        <button 
          className="scroll-arrow left" 
          onClick={() => scroll('left')}
          aria-label="向左滚动"
        >
          <i className="fas fa-chevron-left"></i>
        </button>
      )}
      
      <nav 
        ref={tabsRef}
        className="scrollable-tabs"
        onScroll={checkScroll}
      >
        {tabs.map(tab => (
          <NavLink
            key={tab.path}
            to={tab.path}
            className={({ isActive }) => `tab ${isActive ? 'active' : ''}`}
          >
            {tab.label}
          </NavLink>
        ))}
      </nav>
      
      {showRightArrow && (
        <button 
          className="scroll-arrow right" 
          onClick={() => scroll('right')}
          aria-label="向右滚动"
        >
          <i className="fas fa-chevron-right"></i>
        </button>
      )}
    </div>
  );
}
```

## 移动端导航模式

### 底部导航栏

```jsx
import { NavLink } from 'react-router-dom';
import { useState, useEffect } from 'react';

// 底部导航组件
function BottomNavigation() {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // 向下滚动隐藏，向上滚动显示
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);
  
  const navItems = [
    { path: '/', label: '首页', icon: 'fas fa-home' },
    { path: '/search', label: '搜索', icon: 'fas fa-search' },
    { path: '/cart', label: '购物车', icon: 'fas fa-shopping-cart', badge: 3 },
    { path: '/profile', label: '我的', icon: 'fas fa-user' }
  ];
  
  return (
    <nav className={`bottom-navigation ${isVisible ? 'visible' : 'hidden'}`}>
      {navItems.map(item => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <i className={item.icon}></i>
          {item.badge && <span className="badge">{item.badge}</span>}
          <span className="label">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

// 抽屉式导航
function DrawerNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  
  // 路由变化时关闭抽屉
  useEffect(() => {
    setIsOpen(false);
  }, [location]);
  
  const menuItems = [
    { 
      category: '商品分类',
      items: [
        { path: '/electronics', label: '电子产品', icon: 'fas fa-laptop' },
        { path: '/clothing', label: '服装', icon: 'fas fa-tshirt' },
        { path: '/home', label: '家居', icon: 'fas fa-home' }
      ]
    },
    {
      category: '用户中心',
      items: [
        { path: '/orders', label: '我的订单', icon: 'fas fa-box' },
        { path: '/favorites', label: '收藏夹', icon: 'fas fa-heart' },
        { path: '/addresses', label: '地址管理', icon: 'fas fa-map-marker-alt' }
      ]
    }
  ];
  
  return (
    <>
      {/* 菜单按钮 */}
      <button 
        className="drawer-toggle"
        onClick={() => setIsOpen(true)}
        aria-label="打开菜单"
      >
        <i className="fas fa-bars"></i>
      </button>
      
      {/* 遮罩层 */}
      {isOpen && (
        <div 
          className="drawer-overlay"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* 抽屉内容 */}
      <div className={`drawer ${isOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <h2>菜单</h2>
          <button 
            onClick={() => setIsOpen(false)}
            aria-label="关闭菜单"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="drawer-content">
          {menuItems.map((category, index) => (
            <div key={index} className="menu-category">
              <h3>{category.category}</h3>
              <ul>
                {category.items.map(item => (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      className={({ isActive }) => 
                        `menu-item ${isActive ? 'active' : ''}`
                      }
                    >
                      <i className={item.icon}></i>
                      <span>{item.label}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// 响应式导航
function ResponsiveNavigation() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return (
    <>
      {isMobile ? (
        <>
          <DrawerNavigation />
          <BottomNavigation />
        </>
      ) : (
        <DesktopNavigation />
      )}
    </>
  );
}
```

## 导航与状态管理集成

### 导航状态管理

```jsx
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 导航历史store
const useNavigationStore = create(
  persist(
    (set, get) => ({
      history: [],
      currentIndex: -1,
      maxHistorySize: 50,
      
      // 添加导航记录
      addToHistory: (path, meta = {}) => {
        const { history, currentIndex, maxHistorySize } = get();
        
        // 如果不是最新位置，删除后面的历史
        const newHistory = history.slice(0, currentIndex + 1);
        
        // 添加新记录
        newHistory.push({
          path,
          timestamp: Date.now(),
          ...meta
        });
        
        // 限制历史大小
        if (newHistory.length > maxHistorySize) {
          newHistory.shift();
        }
        
        set({
          history: newHistory,
          currentIndex: newHistory.length - 1
        });
      },
      
      // 后退
      goBack: () => {
        const { currentIndex } = get();
        if (currentIndex > 0) {
          set({ currentIndex: currentIndex - 1 });
          return get().history[currentIndex - 1];
        }
        return null;
      },
      
      // 前进
      goForward: () => {
        const { history, currentIndex } = get();
        if (currentIndex < history.length - 1) {
          set({ currentIndex: currentIndex + 1 });
          return history[currentIndex + 1];
        }
        return null;
      },
      
      // 清除历史
      clearHistory: () => {
        set({ history: [], currentIndex: -1 });
      },
      
      // 获取可后退/前进状态
      canGoBack: () => get().currentIndex > 0,
      canGoForward: () => {
        const { history, currentIndex } = get();
        return currentIndex < history.length - 1;
      }
    }),
    {
      name: 'navigation-history'
    }
  )
);

// 导航历史Hook
function useNavigationHistory() {
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    addToHistory, 
    goBack, 
    goForward, 
    canGoBack, 
    canGoForward 
  } = useNavigationStore();
  
  // 记录导航
  useEffect(() => {
    addToHistory(location.pathname, {
      search: location.search,
      state: location.state
    });
  }, [location]);
  
  const handleGoBack = () => {
    const previousLocation = goBack();
    if (previousLocation) {
      navigate(previousLocation.path + (previousLocation.search || ''), {
        state: previousLocation.state
      });
    }
  };
  
  const handleGoForward = () => {
    const nextLocation = goForward();
    if (nextLocation) {
      navigate(nextLocation.path + (nextLocation.search || ''), {
        state: nextLocation.state
      });
    }
  };
  
  return {
    goBack: handleGoBack,
    goForward: handleGoForward,
    canGoBack: canGoBack(),
    canGoForward: canGoForward()
  };
}

// 导航控制组件
function NavigationControls() {
  const { goBack, goForward, canGoBack, canGoForward } = useNavigationHistory();
  
  return (
    <div className="navigation-controls">
      <button
        onClick={goBack}
        disabled={!canGoBack}
        aria-label="后退"
      >
        <i className="fas fa-arrow-left"></i>
      </button>
      
      <button
        onClick={goForward}
        disabled={!canGoForward}
        aria-label="前进"
      >
        <i className="fas fa-arrow-right"></i>
      </button>
    </div>
  );
}

// 最近访问
function RecentlyVisited() {
  const history = useNavigationStore(state => state.history);
  const recentPages = history
    .slice(-10)
    .reverse()
    .filter((item, index, self) => 
      index === self.findIndex(t => t.path === item.path)
    );
  
  return (
    <div className="recently-visited">
      <h3>最近访问</h3>
      <ul>
        {recentPages.map((page, index) => (
          <li key={index}>
            <Link to={page.path}>
              {breadcrumbNameMap[page.path] || page.path}
            </Link>
            <span className="timestamp">
              {new Date(page.timestamp).toLocaleTimeString()}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## 高级导航组件

### 智能导航菜单

```jsx
// 多级导航菜单
function MultiLevelMenu({ items }) {
  const [expandedItems, setExpandedItems] = useState(new Set());
  const location = useLocation();
  
  const toggleExpand = (itemId) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };
  
  const renderMenuItem = (item, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.id);
    const isActive = location.pathname === item.path;
    const isParentActive = location.pathname.startsWith(item.path);
    
    return (
      <li key={item.id} className={`menu-item level-${level}`}>
        {hasChildren ? (
          <div
            className={`menu-item-content ${isParentActive ? 'active-parent' : ''}`}
            onClick={() => toggleExpand(item.id)}
          >
            <span className="menu-item-text">
              {item.icon && <i className={item.icon}></i>}
              {item.label}
            </span>
            <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'}`}></i>
          </div>
        ) : (
          <NavLink
            to={item.path}
            className={({ isActive }) => 
              `menu-item-content ${isActive ? 'active' : ''}`
            }
          >
            <span className="menu-item-text">
              {item.icon && <i className={item.icon}></i>}
              {item.label}
            </span>
          </NavLink>
        )}
        
        {hasChildren && isExpanded && (
          <ul className="submenu">
            {item.children.map(child => renderMenuItem(child, level + 1))}
          </ul>
        )}
      </li>
    );
  };
  
  return (
    <nav className="multi-level-menu">
      <ul>
        {items.map(item => renderMenuItem(item))}
      </ul>
    </nav>
  );
}

// 搜索导航
function SearchableNavigation({ items }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const navigate = useNavigate();
  
  // 搜索逻辑
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setSearchResults([]);
      return;
    }
    
    const results = [];
    const searchInItems = (items, parent = '') => {
      items.forEach(item => {
        if (item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.keywords?.some(k => k.toLowerCase().includes(searchTerm.toLowerCase()))) {
          results.push({
            ...item,
            parent
          });
        }
        if (item.children) {
          searchInItems(item.children, item.label);
        }
      });
    };
    
    searchInItems(items);
    setSearchResults(results);
  }, [searchTerm, items]);
  
  const handleSelect = (item) => {
    navigate(item.path);
    setSearchTerm('');
    setSearchResults([]);
  };
  
  return (
    <div className="searchable-navigation">
      <div className="search-box">
        <i className="fas fa-search"></i>
        <input
          type="text"
          placeholder="搜索菜单..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button onClick={() => setSearchTerm('')}>
            <i className="fas fa-times"></i>
          </button>
        )}
      </div>
      
      {searchResults.length > 0 && (
        <div className="search-results">
          {searchResults.map((result, index) => (
            <div
              key={index}
              className="search-result-item"
              onClick={() => handleSelect(result)}
            >
              <div className="result-label">
                {result.icon && <i className={result.icon}></i>}
                {result.label}
              </div>
              {result.parent && (
                <div className="result-parent">{result.parent}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// 键盘导航
function KeyboardNavigableMenu({ items }) {
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!menuRef.current) return;
      
      const menuItems = menuRef.current.querySelectorAll('.menu-item');
      const itemCount = menuItems.length;
      
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex(prev => (prev + 1) % itemCount);
          break;
          
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex(prev => (prev - 1 + itemCount) % itemCount);
          break;
          
        case 'Enter':
          if (focusedIndex >= 0 && focusedIndex < itemCount) {
            const item = items[focusedIndex];
            if (item.path) {
              navigate(item.path);
            }
          }
          break;
          
        case 'Escape':
          setFocusedIndex(-1);
          menuRef.current.blur();
          break;
      }
    };
    
    const menu = menuRef.current;
    if (menu) {
      menu.addEventListener('keydown', handleKeyDown);
      return () => menu.removeEventListener('keydown', handleKeyDown);
    }
  }, [focusedIndex, items, navigate]);
  
  return (
    <nav 
      ref={menuRef}
      className="keyboard-navigable-menu"
      tabIndex={0}
      role="menu"
    >
      {items.map((item, index) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) => 
            `menu-item ${isActive ? 'active' : ''} ${
              index === focusedIndex ? 'focused' : ''
            }`
          }
          role="menuitem"
          tabIndex={-1}
        >
          {item.icon && <i className={item.icon}></i>}
          <span>{item.label}</span>
          {item.shortcut && (
            <kbd className="shortcut">{item.shortcut}</kbd>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

// 导出所有组件
export {
  Breadcrumbs,
  AdvancedBreadcrumbs,
  FormWizardApp,
  TabNavigation,
  BottomNavigation,
  DrawerNavigation,
  ResponsiveNavigation,
  NavigationControls,
  RecentlyVisited,
  MultiLevelMenu,
  SearchableNavigation,
  KeyboardNavigableMenu
};
```

这个文件展示了React Router v6中常见的导航模式和最佳实践，包括面包屑、多步表单、标签页、移动端导航等。