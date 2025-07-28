// Day 35: 高级测试技术

import React, { useState, useEffect, useContext, createContext } from 'react';
import { render, screen, waitFor, renderHook, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter, useNavigate, useLocation } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

// ==========================================
// 1. 测试自定义Hooks
// ==========================================

// useLocalStorage Hook
export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error loading localStorage key "${key}":`, error);
      return initialValue;
    }
  });
  
  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error saving localStorage key "${key}":`, error);
    }
  };
  
  const removeValue = () => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  };
  
  return [storedValue, setValue, removeValue];
}

// useLocalStorage测试
describe('useLocalStorage Hook', () => {
  beforeEach(() => {
    window.localStorage.clear();
    jest.clearAllMocks();
  });
  
  test('应该返回初始值', () => {
    const { result } = renderHook(() => useLocalStorage('test', 'initial'));
    
    expect(result.current[0]).toBe('initial');
  });
  
  test('应该从localStorage读取已存在的值', () => {
    window.localStorage.setItem('existing', JSON.stringify('stored value'));
    
    const { result } = renderHook(() => useLocalStorage('existing', 'default'));
    
    expect(result.current[0]).toBe('stored value');
  });
  
  test('应该更新localStorage', () => {
    const { result } = renderHook(() => useLocalStorage('test', 'initial'));
    
    act(() => {
      result.current[1]('updated');
    });
    
    expect(result.current[0]).toBe('updated');
    expect(localStorage.getItem('test')).toBe('"updated"');
  });
  
  test('应该支持函数式更新', () => {
    const { result } = renderHook(() => useLocalStorage('counter', 0));
    
    act(() => {
      result.current[1](prev => prev + 1);
    });
    
    expect(result.current[0]).toBe(1);
    
    act(() => {
      result.current[1](prev => prev + 1);
    });
    
    expect(result.current[0]).toBe(2);
  });
  
  test('应该删除值', () => {
    const { result } = renderHook(() => useLocalStorage('test', 'initial'));
    
    act(() => {
      result.current[1]('value');
    });
    
    expect(localStorage.getItem('test')).toBe('"value"');
    
    act(() => {
      result.current[2](); // removeValue
    });
    
    expect(result.current[0]).toBe('initial');
    expect(localStorage.getItem('test')).toBeNull();
  });
  
  test('应该处理localStorage错误', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Mock localStorage.setItem to throw
    const setItemSpy = jest.spyOn(Storage.prototype, 'setItem');
    setItemSpy.mockImplementation(() => {
      throw new Error('Storage quota exceeded');
    });
    
    const { result } = renderHook(() => useLocalStorage('test', 'initial'));
    
    act(() => {
      result.current[1]('value');
    });
    
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Error saving localStorage'),
      expect.any(Error)
    );
    
    setItemSpy.mockRestore();
    consoleSpy.mockRestore();
  });
});

// useDebounce Hook
export function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  
  return debouncedValue;
}

// useDebounce测试
describe('useDebounce Hook', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  
  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });
  
  test('应该返回初始值', () => {
    const { result } = renderHook(() => useDebounce('initial', 500));
    
    expect(result.current).toBe('initial');
  });
  
  test('应该延迟更新值', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );
    
    expect(result.current).toBe('initial');
    
    // 更新值
    rerender({ value: 'updated', delay: 500 });
    
    // 值还没有更新
    expect(result.current).toBe('initial');
    
    // 快进300ms
    act(() => {
      jest.advanceTimersByTime(300);
    });
    expect(result.current).toBe('initial');
    
    // 快进剩余200ms
    act(() => {
      jest.advanceTimersByTime(200);
    });
    expect(result.current).toBe('updated');
  });
  
  test('应该取消之前的定时器', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: 'first' } }
    );
    
    rerender({ value: 'second' });
    
    act(() => {
      jest.advanceTimersByTime(300);
    });
    
    rerender({ value: 'third' });
    
    act(() => {
      jest.advanceTimersByTime(300);
    });
    
    // 还没到500ms
    expect(result.current).toBe('first');
    
    act(() => {
      jest.advanceTimersByTime(200);
    });
    
    // 应该是最后的值
    expect(result.current).toBe('third');
  });
});

// ==========================================
// 2. 测试Context
// ==========================================

// Auth Context
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // 模拟检查登录状态
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          // 模拟验证token
          const response = await fetch('/api/me', {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);
  
  const login = async (email, password) => {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    if (!response.ok) {
      throw new Error('Login failed');
    }
    
    const { user, token } = await response.json();
    localStorage.setItem('token', token);
    setUser(user);
    return user;
  };
  
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };
  
  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

// Auth Context测试
describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    global.fetch = jest.fn();
  });
  
  afterEach(() => {
    jest.restoreAllMocks();
  });
  
  const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
  
  test('应该提供初始加载状态', () => {
    fetch.mockImplementation(() => new Promise(() => {})); // 永不resolve
    
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    expect(result.current.loading).toBe(true);
    expect(result.current.user).toBe(null);
    expect(result.current.isAuthenticated).toBe(false);
  });
  
  test('应该自动检查已登录用户', async () => {
    const mockUser = { id: 1, name: 'Test User' };
    localStorage.setItem('token', 'valid-token');
    
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUser
    });
    
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
    expect(fetch).toHaveBeenCalledWith('/api/me', {
      headers: { Authorization: 'Bearer valid-token' }
    });
  });
  
  test('应该处理登录', async () => {
    const mockResponse = {
      user: { id: 1, name: 'Test User' },
      token: 'new-token'
    };
    
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });
    
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    await act(async () => {
      const user = await result.current.login('test@example.com', 'password');
      expect(user).toEqual(mockResponse.user);
    });
    
    expect(result.current.user).toEqual(mockResponse.user);
    expect(result.current.isAuthenticated).toBe(true);
    expect(localStorage.getItem('token')).toBe('new-token');
  });
  
  test('应该处理登录失败', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 401
    });
    
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    await expect(
      act(async () => {
        await result.current.login('wrong@example.com', 'wrong');
      })
    ).rejects.toThrow('Login failed');
  });
  
  test('应该处理登出', async () => {
    localStorage.setItem('token', 'valid-token');
    
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    act(() => {
      result.current.logout();
    });
    
    expect(result.current.user).toBe(null);
    expect(result.current.isAuthenticated).toBe(false);
    expect(localStorage.getItem('token')).toBeNull();
  });
  
  test('在Provider外使用应该抛出错误', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      renderHook(() => useAuth());
    }).toThrow('useAuth must be used within AuthProvider');
    
    consoleSpy.mockRestore();
  });
});

// ==========================================
// 3. Mock外部依赖
// ==========================================

// 测试React Router
export function NavigationComponent() {
  const navigate = useNavigate();
  const location = useLocation();
  
  return (
    <div>
      <p>Current path: {location.pathname}</p>
      <button onClick={() => navigate('/')}>Go Home</button>
      <button onClick={() => navigate('/about')}>Go to About</button>
      <button onClick={() => navigate(-1)}>Go Back</button>
    </div>
  );
}

// React Router测试
describe('NavigationComponent', () => {
  const renderWithRouter = (component, { initialEntries = ['/'] } = {}) => {
    return render(
      <BrowserRouter>
        {component}
      </BrowserRouter>
    );
  };
  
  test('应该显示当前路径', () => {
    renderWithRouter(<NavigationComponent />);
    
    expect(screen.getByText('Current path: /')).toBeInTheDocument();
  });
  
  test('应该导航到不同路由', async () => {
    const user = userEvent.setup();
    
    renderWithRouter(<NavigationComponent />);
    
    await user.click(screen.getByRole('button', { name: /go to about/i }));
    
    expect(screen.getByText('Current path: /about')).toBeInTheDocument();
  });
});

// Mock React Router
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  useParams: () => ({ id: 'mock-id' })
}));

// ==========================================
// 4. 测试Redux集成
// ==========================================

// Redux slice
import { createSlice } from '@reduxjs/toolkit';

const counterSlice = createSlice({
  name: 'counter',
  initialState: { value: 0 },
  reducers: {
    increment: (state) => {
      state.value += 1;
    },
    decrement: (state) => {
      state.value -= 1;
    },
    incrementByAmount: (state, action) => {
      state.value += action.payload;
    }
  }
});

export const { increment, decrement, incrementByAmount } = counterSlice.actions;

// Counter组件
import { useSelector, useDispatch } from 'react-redux';

export function Counter() {
  const count = useSelector(state => state.counter.value);
  const dispatch = useDispatch();
  
  return (
    <div>
      <span role="status">{count}</span>
      <button onClick={() => dispatch(increment())}>+</button>
      <button onClick={() => dispatch(decrement())}>-</button>
      <button onClick={() => dispatch(incrementByAmount(5))}>+5</button>
    </div>
  );
}

// Redux测试
describe('Counter with Redux', () => {
  let store;
  
  beforeEach(() => {
    store = configureStore({
      reducer: {
        counter: counterSlice.reducer
      }
    });
  });
  
  const renderWithRedux = (component) => {
    return render(
      <Provider store={store}>
        {component}
      </Provider>
    );
  };
  
  test('应该显示初始值', () => {
    renderWithRedux(<Counter />);
    
    expect(screen.getByRole('status')).toHaveTextContent('0');
  });
  
  test('应该增加计数', async () => {
    const user = userEvent.setup();
    
    renderWithRedux(<Counter />);
    
    await user.click(screen.getByRole('button', { name: '+' }));
    
    expect(screen.getByRole('status')).toHaveTextContent('1');
  });
  
  test('应该减少计数', async () => {
    const user = userEvent.setup();
    
    renderWithRedux(<Counter />);
    
    await user.click(screen.getByRole('button', { name: '-' }));
    
    expect(screen.getByRole('status')).toHaveTextContent('-1');
  });
  
  test('应该按指定数量增加', async () => {
    const user = userEvent.setup();
    
    renderWithRedux(<Counter />);
    
    await user.click(screen.getByRole('button', { name: '+5' }));
    
    expect(screen.getByRole('status')).toHaveTextContent('5');
  });
});

// ==========================================
// 5. 性能测试
// ==========================================

// 大列表组件
export function LargeList({ items = [] }) {
  const [filter, setFilter] = useState('');
  
  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(filter.toLowerCase())
  );
  
  return (
    <div>
      <input
        type="text"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Filter items..."
      />
      <ul>
        {filteredItems.map(item => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </div>
  );
}

// 性能测试
describe('LargeList性能测试', () => {
  test('应该在合理时间内渲染大量数据', () => {
    const items = Array.from({ length: 10000 }, (_, i) => ({
      id: i,
      name: `Item ${i}`
    }));
    
    const startTime = performance.now();
    
    render(<LargeList items={items} />);
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    // 应该在1秒内完成渲染
    expect(renderTime).toBeLessThan(1000);
    
    // 验证部分元素渲染
    expect(screen.getByText('Item 0')).toBeInTheDocument();
    expect(screen.getByText('Item 9999')).toBeInTheDocument();
  });
  
  test('过滤应该快速响应', async () => {
    const user = userEvent.setup({ delay: null });
    const items = Array.from({ length: 1000 }, (_, i) => ({
      id: i,
      name: `Item ${i}`
    }));
    
    render(<LargeList items={items} />);
    
    const input = screen.getByPlaceholderText(/filter/i);
    
    const startTime = performance.now();
    
    await user.type(input, '999');
    
    const endTime = performance.now();
    const filterTime = endTime - startTime;
    
    // 过滤应该在500ms内完成
    expect(filterTime).toBeLessThan(500);
    
    // 验证过滤结果
    expect(screen.getByText('Item 999')).toBeInTheDocument();
    expect(screen.queryByText('Item 0')).not.toBeInTheDocument();
  });
});

// ==========================================
// 6. 可访问性测试
// ==========================================

import { axe, toHaveNoViolations } from 'jest-axe';
expect.extend(toHaveNoViolations);

// 可访问的表单组件
export function AccessibleForm({ onSubmit }) {
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [errors, setErrors] = useState({});
  
  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    
    if (!formData.name) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    }
    
    if (Object.keys(newErrors).length === 0) {
      onSubmit(formData);
    } else {
      setErrors(newErrors);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} aria-label="Contact form">
      <div>
        <label htmlFor="name">
          Name
          <span aria-label="required">*</span>
        </label>
        <input
          id="name"
          name="name"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          aria-invalid={errors.name ? 'true' : 'false'}
          aria-describedby={errors.name ? 'name-error' : undefined}
          aria-required="true"
        />
        {errors.name && (
          <span id="name-error" role="alert" className="error">
            {errors.name}
          </span>
        )}
      </div>
      
      <div>
        <label htmlFor="email">
          Email
          <span aria-label="required">*</span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          aria-invalid={errors.email ? 'true' : 'false'}
          aria-describedby={errors.email ? 'email-error' : undefined}
          aria-required="true"
        />
        {errors.email && (
          <span id="email-error" role="alert" className="error">
            {errors.email}
          </span>
        )}
      </div>
      
      <button type="submit">Submit</button>
    </form>
  );
}

// 可访问性测试
describe('AccessibleForm可访问性测试', () => {
  test('应该没有可访问性违规', async () => {
    const { container } = render(<AccessibleForm onSubmit={jest.fn()} />);
    
    const results = await axe(container);
    
    expect(results).toHaveNoViolations();
  });
  
  test('应该有正确的ARIA标签', () => {
    render(<AccessibleForm onSubmit={jest.fn()} />);
    
    const form = screen.getByRole('form', { name: /contact form/i });
    expect(form).toBeInTheDocument();
    
    const nameInput = screen.getByLabelText(/name/i);
    expect(nameInput).toHaveAttribute('aria-required', 'true');
    
    const emailInput = screen.getByLabelText(/email/i);
    expect(emailInput).toHaveAttribute('aria-required', 'true');
  });
  
  test('错误消息应该可访问', async () => {
    const user = userEvent.setup();
    
    render(<AccessibleForm onSubmit={jest.fn()} />);
    
    await user.click(screen.getByRole('button', { name: /submit/i }));
    
    const nameError = screen.getByRole('alert', { name: /name is required/i });
    expect(nameError).toBeInTheDocument();
    
    const nameInput = screen.getByLabelText(/name/i);
    expect(nameInput).toHaveAttribute('aria-invalid', 'true');
    expect(nameInput).toHaveAttribute('aria-describedby', 'name-error');
  });
});

// ==========================================
// 7. 快照测试
// ==========================================

// 卡片组件
export function Card({ title, description, image, footer }) {
  return (
    <div className="card">
      {image && <img src={image} alt="" className="card-image" />}
      <div className="card-body">
        <h3 className="card-title">{title}</h3>
        <p className="card-description">{description}</p>
      </div>
      {footer && <div className="card-footer">{footer}</div>}
    </div>
  );
}

// 快照测试
describe('Card组件快照测试', () => {
  test('应该匹配基础快照', () => {
    const { container } = render(
      <Card
        title="Test Card"
        description="This is a test card"
      />
    );
    
    expect(container.firstChild).toMatchSnapshot();
  });
  
  test('应该匹配带图片的快照', () => {
    const { container } = render(
      <Card
        title="Test Card"
        description="This is a test card"
        image="/test-image.jpg"
      />
    );
    
    expect(container.firstChild).toMatchSnapshot();
  });
  
  test('应该匹配完整卡片的快照', () => {
    const { container } = render(
      <Card
        title="Test Card"
        description="This is a test card"
        image="/test-image.jpg"
        footer={<button>Action</button>}
      />
    );
    
    expect(container.firstChild).toMatchSnapshot();
  });
  
  // 使用toMatchInlineSnapshot进行内联快照
  test('应该渲染正确的结构', () => {
    const { container } = render(
      <Card title="Simple" description="Test" />
    );
    
    expect(container.firstChild).toMatchInlineSnapshot(`
      <div
        class="card"
      >
        <div
          class="card-body"
        >
          <h3
            class="card-title"
          >
            Simple
          </h3>
          <p
            class="card-description"
          >
            Test
          </p>
        </div>
      </div>
    `);
  });
});

// ==========================================
// 8. 集成测试示例
// ==========================================

// 购物车应用
export function ShoppingCart() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // 加载购物车数据
    const loadCart = async () => {
      try {
        const response = await fetch('/api/cart');
        const data = await response.json();
        setItems(data.items || []);
      } catch (error) {
        console.error('Failed to load cart:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadCart();
  }, []);
  
  const updateQuantity = async (itemId, quantity) => {
    try {
      const response = await fetch(`/api/cart/items/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity })
      });
      
      if (response.ok) {
        setItems(prev =>
          prev.map(item =>
            item.id === itemId ? { ...item, quantity } : item
          )
        );
      }
    } catch (error) {
      console.error('Failed to update quantity:', error);
    }
  };
  
  const removeItem = async (itemId) => {
    try {
      const response = await fetch(`/api/cart/items/${itemId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setItems(prev => prev.filter(item => item.id !== itemId));
      }
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  };
  
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  if (loading) {
    return <div>Loading cart...</div>;
  }
  
  return (
    <div className="shopping-cart">
      <h2>Shopping Cart</h2>
      
      {items.length === 0 ? (
        <p>Your cart is empty</p>
      ) : (
        <>
          <ul>
            {items.map(item => (
              <li key={item.id}>
                <span>{item.name}</span>
                <span>${item.price}</span>
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                  min="1"
                />
                <button onClick={() => removeItem(item.id)}>Remove</button>
              </li>
            ))}
          </ul>
          
          <div className="total">
            Total: ${total.toFixed(2)}
          </div>
          
          <button className="checkout-btn">Proceed to Checkout</button>
        </>
      )}
    </div>
  );
}

// 集成测试
import { rest } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
  rest.get('/api/cart', (req, res, ctx) => {
    return res(ctx.json({
      items: [
        { id: 1, name: 'Product 1', price: 10.99, quantity: 2 },
        { id: 2, name: 'Product 2', price: 19.99, quantity: 1 }
      ]
    }));
  }),
  
  rest.put('/api/cart/items/:id', (req, res, ctx) => {
    return res(ctx.json({ success: true }));
  }),
  
  rest.delete('/api/cart/items/:id', (req, res, ctx) => {
    return res(ctx.status(204));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('ShoppingCart集成测试', () => {
  test('完整的购物车流程', async () => {
    const user = userEvent.setup();
    
    render(<ShoppingCart />);
    
    // 等待加载
    await waitFor(() => {
      expect(screen.getByText('Product 1')).toBeInTheDocument();
    });
    
    // 验证初始状态
    expect(screen.getByText('Product 2')).toBeInTheDocument();
    expect(screen.getByText('Total: $41.97')).toBeInTheDocument();
    
    // 更新数量
    const quantityInput = screen.getAllByRole('spinbutton')[0];
    await user.clear(quantityInput);
    await user.type(quantityInput, '3');
    
    // 验证总价更新
    expect(screen.getByText('Total: $52.96')).toBeInTheDocument();
    
    // 删除项目
    const removeButtons = screen.getAllByRole('button', { name: /remove/i });
    await user.click(removeButtons[1]);
    
    // 验证项目被删除
    await waitFor(() => {
      expect(screen.queryByText('Product 2')).not.toBeInTheDocument();
    });
    
    expect(screen.getByText('Total: $32.97')).toBeInTheDocument();
  });
  
  test('应该处理空购物车', async () => {
    server.use(
      rest.get('/api/cart', (req, res, ctx) => {
        return res(ctx.json({ items: [] }));
      })
    );
    
    render(<ShoppingCart />);
    
    await waitFor(() => {
      expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
    });
  });
  
  test('应该处理API错误', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    server.use(
      rest.get('/api/cart', (req, res, ctx) => {
        return res(ctx.status(500));
      })
    );
    
    render(<ShoppingCart />);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading cart...')).not.toBeInTheDocument();
    });
    
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Failed to load cart'),
      expect.any(Error)
    );
    
    consoleSpy.mockRestore();
  });
});