---
title: "Context API设计模式"
description: "React Context API的高级设计模式和最佳实践"
category: "advanced"
language: "javascript"
---

# Context API设计模式

## Provider模式

### 1. 基础Provider模式

```jsx
import { createContext, useContext, useState, useCallback, useMemo } from 'react';

// 创建Context
const UserContext = createContext(undefined);

// 自定义Hook，提供类型安全和错误处理
export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser必须在UserProvider内部使用');
  }
  return context;
};

// Provider组件
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // 使用useCallback避免不必要的重渲染
  const login = useCallback(async (credentials) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.login(credentials);
      setUser(response.data.user);
      localStorage.setItem('token', response.data.token);
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);
  
  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('token');
  }, []);
  
  const updateProfile = useCallback(async (updates) => {
    setLoading(true);
    try {
      const response = await api.updateUser(user.id, updates);
      setUser(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);
  
  // 使用useMemo缓存context值
  const value = useMemo(() => ({
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    logout,
    updateProfile
  }), [user, loading, error, login, logout, updateProfile]);
  
  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
```

### 2. 分离State和Dispatch Context

```jsx
// 分离读取和更新逻辑，优化性能
const UserStateContext = createContext();
const UserDispatchContext = createContext();

export const useUserState = () => {
  const context = useContext(UserStateContext);
  if (!context) {
    throw new Error('useUserState必须在UserProvider内部使用');
  }
  return context;
};

export const useUserDispatch = () => {
  const context = useContext(UserDispatchContext);
  if (!context) {
    throw new Error('useUserDispatch必须在UserProvider内部使用');
  }
  return context;
};

// 使用useReducer管理复杂状态
const userReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, loading: true, error: null };
    case 'LOGIN_SUCCESS':
      return { ...state, loading: false, user: action.payload };
    case 'LOGIN_FAILURE':
      return { ...state, loading: false, error: action.payload };
    case 'LOGOUT':
      return { ...state, user: null };
    case 'UPDATE_USER':
      return { ...state, user: { ...state.user, ...action.payload } };
    default:
      throw new Error(`未知的action类型: ${action.type}`);
  }
};

export const UserProvider = ({ children }) => {
  const [state, dispatch] = useReducer(userReducer, {
    user: null,
    loading: false,
    error: null
  });
  
  // Actions永远不会改变，不会触发重渲染
  const actions = useMemo(() => ({
    login: async (credentials) => {
      dispatch({ type: 'LOGIN_START' });
      try {
        const user = await api.login(credentials);
        dispatch({ type: 'LOGIN_SUCCESS', payload: user });
      } catch (error) {
        dispatch({ type: 'LOGIN_FAILURE', payload: error.message });
      }
    },
    logout: () => dispatch({ type: 'LOGOUT' }),
    updateUser: (updates) => dispatch({ type: 'UPDATE_USER', payload: updates })
  }), []);
  
  return (
    <UserStateContext.Provider value={state}>
      <UserDispatchContext.Provider value={actions}>
        {children}
      </UserDispatchContext.Provider>
    </UserStateContext.Provider>
  );
};
```

### 3. Context工厂模式

```jsx
// 创建通用的Context工厂
function createGenericContext(name) {
  const StateContext = createContext();
  const DispatchContext = createContext();
  
  const useState = () => {
    const context = useContext(StateContext);
    if (!context) {
      throw new Error(`use${name}State必须在${name}Provider内部使用`);
    }
    return context;
  };
  
  const useDispatch = () => {
    const context = useContext(DispatchContext);
    if (!context) {
      throw new Error(`use${name}Dispatch必须在${name}Provider内部使用`);
    }
    return context;
  };
  
  return {
    StateContext,
    DispatchContext,
    useState,
    useDispatch
  };
}

// 使用工厂创建多个Context
const Cart = createGenericContext('Cart');
const Theme = createGenericContext('Theme');
const Notification = createGenericContext('Notification');

// 创建Provider
export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialCartState);
  
  return (
    <Cart.StateContext.Provider value={state}>
      <Cart.DispatchContext.Provider value={dispatch}>
        {children}
      </Cart.DispatchContext.Provider>
    </Cart.StateContext.Provider>
  );
};

export const useCartState = Cart.useState;
export const useCartDispatch = Cart.useDispatch;
```

## 高级模式

### 1. 选择器模式（Selector Pattern）

```jsx
// 创建支持选择器的Context
function createSelectableContext() {
  const StateContext = createContext();
  const SubscribeContext = createContext();
  
  const Provider = ({ children, initialState }) => {
    const [state, setState] = useState(initialState);
    const subscribers = useRef(new Map());
    const subscriberIdRef = useRef(0);
    
    // 订阅机制
    const subscribe = useCallback((selector, callback) => {
      const id = subscriberIdRef.current++;
      subscribers.current.set(id, { selector, callback });
      
      // 返回取消订阅函数
      return () => subscribers.current.delete(id);
    }, []);
    
    // 更新状态并通知订阅者
    const updateState = useCallback((updater) => {
      setState(prevState => {
        const nextState = typeof updater === 'function' 
          ? updater(prevState) 
          : updater;
        
        // 检查每个订阅者的选择器结果是否变化
        subscribers.current.forEach(({ selector, callback }) => {
          const prevSelected = selector(prevState);
          const nextSelected = selector(nextState);
          
          if (!Object.is(prevSelected, nextSelected)) {
            callback(nextSelected);
          }
        });
        
        return nextState;
      });
    }, []);
    
    return (
      <StateContext.Provider value={[state, updateState]}>
        <SubscribeContext.Provider value={subscribe}>
          {children}
        </SubscribeContext.Provider>
      </StateContext.Provider>
    );
  };
  
  // 使用选择器的Hook
  const useSelector = (selector) => {
    const [state] = useContext(StateContext);
    const subscribe = useContext(SubscribeContext);
    const [selectedState, setSelectedState] = useState(() => selector(state));
    
    useEffect(() => {
      // 订阅选择器的变化
      const unsubscribe = subscribe(selector, setSelectedState);
      
      // 立即同步当前值
      setSelectedState(selector(state));
      
      return unsubscribe;
    }, [selector, subscribe, state]);
    
    return selectedState;
  };
  
  const useDispatch = () => {
    const [, updateState] = useContext(StateContext);
    return updateState;
  };
  
  return { Provider, useSelector, useDispatch };
}

// 使用示例
const AppContext = createSelectableContext();

function App() {
  return (
    <AppContext.Provider initialState={{ 
      user: null, 
      posts: [], 
      theme: 'light' 
    }}>
      <UserInfo />
      <PostList />
      <ThemeToggle />
    </AppContext.Provider>
  );
}

function UserInfo() {
  // 只在user变化时重渲染
  const user = AppContext.useSelector(state => state.user);
  return <div>{user?.name || '未登录'}</div>;
}

function PostList() {
  // 只在posts变化时重渲染
  const posts = AppContext.useSelector(state => state.posts);
  return <div>{posts.map(post => <div key={post.id}>{post.title}</div>)}</div>;
}
```

### 2. 组合Provider模式

```jsx
// 方法1: 嵌套Provider
export const AppProviders = ({ children }) => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

// 方法2: 使用compose函数
const compose = (...providers) => ({ children }) =>
  providers.reduceRight(
    (acc, Provider) => <Provider>{acc}</Provider>,
    children
  );

export const AppProviders = compose(
  ThemeProvider,
  AuthProvider,
  NotificationProvider,
  CartProvider
);

// 方法3: Provider组件配置
const providers = [
  { component: ThemeProvider, props: { defaultTheme: 'light' } },
  { component: AuthProvider },
  { component: NotificationProvider, props: { position: 'top-right' } },
  { component: CartProvider }
];

export const AppProviders = ({ children }) => {
  return providers.reduceRight(
    (acc, { component: Provider, props = {} }) => (
      <Provider {...props}>{acc}</Provider>
    ),
    children
  );
};
```

### 3. Context中间件模式

```jsx
// 创建支持中间件的Context
function createEnhancedContext(reducer, middlewares = []) {
  const StateContext = createContext();
  const DispatchContext = createContext();
  
  const Provider = ({ children, initialState }) => {
    const [state, baseDispatch] = useReducer(reducer, initialState);
    
    // 应用中间件
    const dispatch = useMemo(() => {
      let dispatch = baseDispatch;
      
      // 从右到左应用中间件
      const chain = middlewares.map(middleware => 
        middleware({ getState: () => state, dispatch: baseDispatch })
      );
      
      return chain.reduceRight(
        (next, middleware) => middleware(next),
        baseDispatch
      );
    }, [state]);
    
    return (
      <StateContext.Provider value={state}>
        <DispatchContext.Provider value={dispatch}>
          {children}
        </DispatchContext.Provider>
      </StateContext.Provider>
    );
  };
  
  return { Provider, StateContext, DispatchContext };
}

// 日志中间件
const logger = ({ getState }) => next => action => {
  console.log('dispatching:', action);
  console.log('prev state:', getState());
  const result = next(action);
  console.log('next state:', getState());
  return result;
};

// 异步中间件
const thunk = ({ dispatch, getState }) => next => action => {
  if (typeof action === 'function') {
    return action(dispatch, getState);
  }
  return next(action);
};

// 使用中间件
const AppContext = createEnhancedContext(appReducer, [logger, thunk]);
```

## 性能优化模式

### 1. Context分割模式

```jsx
// 将频繁更新的数据和静态数据分离
const ThemeContext = createContext(); // 很少改变
const UserDataContext = createContext(); // 用户信息，偶尔改变
const NotificationContext = createContext(); // 频繁更新

// 避免将所有数据放在一个Context中
// ❌ 不好的做法
const AppContext = createContext({
  theme: 'light',
  user: null,
  notifications: []
});

// ✅ 好的做法：分离不同更新频率的数据
export const Providers = ({ children }) => (
  <ThemeProvider>
    <UserProvider>
      <NotificationProvider>
        {children}
      </NotificationProvider>
    </UserProvider>
  </ThemeProvider>
);
```

### 2. Memo和优化模式

```jsx
// 使用memo优化Consumer组件
const ExpensiveComponent = React.memo(({ data }) => {
  console.log('ExpensiveComponent render');
  return <div>{/* 复杂的渲染逻辑 */}</div>;
});

// Context值优化
const OptimizedProvider = ({ children }) => {
  const [state, setState] = useState(initialState);
  
  // 分离不会改变的函数
  const staticActions = useMemo(() => ({
    updateUser: (data) => setState(prev => ({ ...prev, user: data })),
    updateTheme: (theme) => setState(prev => ({ ...prev, theme }))
  }), []);
  
  // 只包含会变化的数据
  const dynamicValue = useMemo(() => ({
    user: state.user,
    theme: state.theme
  }), [state.user, state.theme]);
  
  return (
    <StaticContext.Provider value={staticActions}>
      <DynamicContext.Provider value={dynamicValue}>
        {children}
      </DynamicContext.Provider>
    </StaticContext.Provider>
  );
};
```

### 3. 订阅优化模式

```jsx
// 创建可订阅的Context，只更新订阅的组件
class SubscribableState {
  constructor(initialState) {
    this.state = initialState;
    this.listeners = new Set();
  }
  
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  
  setState(updater) {
    this.state = typeof updater === 'function' 
      ? updater(this.state) 
      : updater;
    this.listeners.forEach(listener => listener(this.state));
  }
  
  getState() {
    return this.state;
  }
}

const StateContext = createContext();

export const SubscribableProvider = ({ children, initialState }) => {
  const storeRef = useRef();
  if (!storeRef.current) {
    storeRef.current = new SubscribableState(initialState);
  }
  
  return (
    <StateContext.Provider value={storeRef.current}>
      {children}
    </StateContext.Provider>
  );
};

// 选择性订阅Hook
export const useSubscribableState = (selector) => {
  const store = useContext(StateContext);
  const [state, setState] = useState(() => selector(store.getState()));
  
  useEffect(() => {
    const updateState = (newState) => {
      const selected = selector(newState);
      setState(prev => Object.is(prev, selected) ? prev : selected);
    };
    
    // 初始同步
    updateState(store.getState());
    
    // 订阅变化
    return store.subscribe(updateState);
  }, [store, selector]);
  
  return state;
};
```

## 实际应用示例

### 完整的购物车Context实现

```jsx
// cartContext.js
const CartStateContext = createContext();
const CartDispatchContext = createContext();

// Action Types
const CartActionTypes = {
  ADD_ITEM: 'ADD_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  UPDATE_QUANTITY: 'UPDATE_QUANTITY',
  CLEAR_CART: 'CLEAR_CART',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR'
};

// Reducer
const cartReducer = (state, action) => {
  switch (action.type) {
    case CartActionTypes.ADD_ITEM: {
      const existingItem = state.items.find(
        item => item.id === action.payload.id
      );
      
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item
          )
        };
      }
      
      return {
        ...state,
        items: [...state.items, action.payload]
      };
    }
    
    case CartActionTypes.UPDATE_QUANTITY:
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        ).filter(item => item.quantity > 0)
      };
      
    case CartActionTypes.REMOVE_ITEM:
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload)
      };
      
    case CartActionTypes.CLEAR_CART:
      return {
        ...state,
        items: []
      };
      
    default:
      return state;
  }
};

// Provider
export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    loading: false,
    error: null
  });
  
  // 持久化到localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      const items = JSON.parse(savedCart);
      items.forEach(item => {
        dispatch({ type: CartActionTypes.ADD_ITEM, payload: item });
      });
    }
  }, []);
  
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(state.items));
  }, [state.items]);
  
  // Actions
  const actions = useMemo(() => ({
    addItem: (product, quantity = 1) => {
      dispatch({
        type: CartActionTypes.ADD_ITEM,
        payload: { ...product, quantity }
      });
    },
    
    removeItem: (productId) => {
      dispatch({
        type: CartActionTypes.REMOVE_ITEM,
        payload: productId
      });
    },
    
    updateQuantity: (productId, quantity) => {
      dispatch({
        type: CartActionTypes.UPDATE_QUANTITY,
        payload: { id: productId, quantity }
      });
    },
    
    clearCart: () => {
      dispatch({ type: CartActionTypes.CLEAR_CART });
    },
    
    checkout: async () => {
      dispatch({ type: CartActionTypes.SET_LOADING, payload: true });
      try {
        await api.checkout(state.items);
        dispatch({ type: CartActionTypes.CLEAR_CART });
        return { success: true };
      } catch (error) {
        dispatch({ 
          type: CartActionTypes.SET_ERROR, 
          payload: error.message 
        });
        return { success: false, error: error.message };
      } finally {
        dispatch({ type: CartActionTypes.SET_LOADING, payload: false });
      }
    }
  }), [state.items]);
  
  return (
    <CartStateContext.Provider value={state}>
      <CartDispatchContext.Provider value={actions}>
        {children}
      </CartDispatchContext.Provider>
    </CartStateContext.Provider>
  );
};

// Hooks
export const useCartState = () => {
  const context = useContext(CartStateContext);
  if (!context) {
    throw new Error('useCartState必须在CartProvider内部使用');
  }
  return context;
};

export const useCartActions = () => {
  const context = useContext(CartDispatchContext);
  if (!context) {
    throw new Error('useCartActions必须在CartProvider内部使用');
  }
  return context;
};

// 选择器Hooks
export const useCartTotal = () => {
  const { items } = useCartState();
  
  return useMemo(() => {
    return items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  }, [items]);
};

export const useCartItemCount = () => {
  const { items } = useCartState();
  
  return useMemo(() => {
    return items.reduce((count, item) => count + item.quantity, 0);
  }, [items]);
};

// 使用示例
function ShoppingCart() {
  const { items, loading } = useCartState();
  const { removeItem, updateQuantity, checkout } = useCartActions();
  const total = useCartTotal();
  
  if (loading) return <LoadingSpinner />;
  
  return (
    <div>
      {items.map(item => (
        <CartItem
          key={item.id}
          item={item}
          onRemove={() => removeItem(item.id)}
          onUpdateQuantity={(qty) => updateQuantity(item.id, qty)}
        />
      ))}
      <div>总计: ¥{total.toFixed(2)}</div>
      <button onClick={checkout}>结账</button>
    </div>
  );
}
```

这些Context设计模式展示了如何构建高性能、可维护的React应用状态管理系统。