---
day: 35
phase: "react-development"
title: "测试React应用"
description: "学习使用Jest和React Testing Library编写高质量的测试，掌握单元测试、集成测试和端到端测试的最佳实践"
objectives:
  - "理解React测试的基本概念和策略"
  - "掌握Jest测试框架的使用"
  - "精通React Testing Library的API"
  - "学习测试组件、Hooks和异步代码"
  - "了解测试覆盖率和CI/CD集成"
estimatedTime: 180
difficulty: "advanced"
prerequisites: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34]
tags:
  - "React"
  - "测试"
  - "Jest"
  - "React Testing Library"
  - "TDD"
resources:
  - title: "React Testing Library官方文档"
    url: "https://testing-library.com/docs/react-testing-library/intro/"
    type: "documentation"
  - title: "Jest官方文档"
    url: "https://jestjs.io/docs/getting-started"
    type: "documentation"
  - title: "测试最佳实践"
    url: "https://kentcdodds.com/blog/common-mistakes-with-react-testing-library"
    type: "article"
  - title: "React测试教程"
    url: "https://www.robinwieruch.de/react-testing-library"
    type: "article"
codeExamples:
  - title: "React测试示例"
    language: "javascript"
    path: "/code-examples/day-35/react-testing-examples.jsx"
  - title: "高级测试技术"
    language: "javascript"
    path: "/code-examples/day-35/advanced-testing.jsx"
---

# Day 35: 测试React应用

## 📋 学习目标

今天我们将深入学习如何为React应用编写高质量的测试。好的测试不仅能捕获bug，还能作为文档，帮助我们重构代码并提高开发效率。

## 🏗️ 测试基础概念

### 1. 测试金字塔

```jsx
// 测试类型分布
//        /\
//       /E2E\      <- 少量：测试完整用户流程
//      /------\    
//     /集成测试\    <- 适中：测试组件交互
//    /----------\  
//   /  单元测试  \  <- 大量：测试独立单元
//  /--------------\

// 单元测试示例
test('add函数应该返回两数之和', () => {
  expect(add(2, 3)).toBe(5);
  expect(add(-1, 1)).toBe(0);
  expect(add(0, 0)).toBe(0);
});

// 集成测试示例
test('登录表单应该处理用户输入并提交', async () => {
  render(<LoginForm onSubmit={mockSubmit} />);
  
  const emailInput = screen.getByLabelText(/email/i);
  const passwordInput = screen.getByLabelText(/password/i);
  const submitButton = screen.getByRole('button', { name: /login/i });
  
  await userEvent.type(emailInput, 'test@example.com');
  await userEvent.type(passwordInput, 'password123');
  await userEvent.click(submitButton);
  
  expect(mockSubmit).toHaveBeenCalledWith({
    email: 'test@example.com',
    password: 'password123'
  });
});

// E2E测试示例（使用Cypress）
describe('用户注册流程', () => {
  it('新用户应该能够成功注册并登录', () => {
    cy.visit('/register');
    cy.get('[data-testid="email-input"]').type('newuser@example.com');
    cy.get('[data-testid="password-input"]').type('securepassword');
    cy.get('[data-testid="submit-button"]').click();
    
    cy.url().should('include', '/dashboard');
    cy.contains('Welcome, newuser@example.com');
  });
});
```

### 2. TDD（测试驱动开发）

```jsx
// TDD流程：红-绿-重构

// 步骤1：写一个失败的测试（红）
test('TodoList应该添加新的待办事项', () => {
  const { getByText, getByPlaceholderText } = render(<TodoList />);
  const input = getByPlaceholderText('添加待办事项');
  const button = getByText('添加');
  
  fireEvent.change(input, { target: { value: '学习React测试' } });
  fireEvent.click(button);
  
  expect(getByText('学习React测试')).toBeInTheDocument();
});

// 步骤2：写最少的代码让测试通过（绿）
function TodoList() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState('');
  
  const handleAdd = () => {
    setTodos([...todos, input]);
    setInput('');
  };
  
  return (
    <div>
      <input 
        placeholder="添加待办事项"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <button onClick={handleAdd}>添加</button>
      <ul>
        {todos.map((todo, index) => (
          <li key={index}>{todo}</li>
        ))}
      </ul>
    </div>
  );
}

// 步骤3：重构代码，保持测试通过
function TodoList() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState('');
  
  const handleAdd = () => {
    if (input.trim()) {
      setTodos(prev => [...prev, { id: Date.now(), text: input }]);
      setInput('');
    }
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAdd();
    }
  };
  
  return (
    <div>
      <input 
        placeholder="添加待办事项"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={handleKeyPress}
      />
      <button onClick={handleAdd}>添加</button>
      <ul>
        {todos.map(todo => (
          <li key={todo.id}>{todo.text}</li>
        ))}
      </ul>
    </div>
  );
}
```

## 🧪 Jest基础

### 1. Jest配置和基本语法

```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/index.js',
    '!src/serviceWorker.js',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  }
};

// setupTests.js
import '@testing-library/jest-dom';
import 'jest-canvas-mock';

// 全局Mock
global.matchMedia = global.matchMedia || function() {
  return {
    matches: false,
    addListener: jest.fn(),
    removeListener: jest.fn(),
  };
};
```

### 2. Jest匹配器

```javascript
// 基础匹配器
test('基础匹配器示例', () => {
  // 精确相等
  expect(2 + 2).toBe(4);
  
  // 对象相等
  expect({ name: 'John' }).toEqual({ name: 'John' });
  
  // 真值检查
  expect('Hello').toBeTruthy();
  expect('').toBeFalsy();
  expect(null).toBeNull();
  expect(undefined).toBeUndefined();
  expect(5).toBeDefined();
  
  // 数字比较
  expect(4).toBeGreaterThan(3);
  expect(3).toBeGreaterThanOrEqual(3);
  expect(2).toBeLessThan(3);
  expect(2).toBeLessThanOrEqual(2);
  
  // 浮点数比较
  expect(0.1 + 0.2).toBeCloseTo(0.3);
  
  // 字符串匹配
  expect('Hello World').toMatch(/World/);
  expect('Hello World').toContain('World');
  
  // 数组和可迭代对象
  expect(['apple', 'banana', 'orange']).toContain('banana');
  expect(new Set(['apple', 'banana'])).toContain('apple');
  
  // 异常
  expect(() => {
    throw new Error('Something went wrong');
  }).toThrow();
  expect(() => {
    throw new Error('Something went wrong');
  }).toThrow('Something went wrong');
});

// 异步测试
test('异步测试示例', async () => {
  // Promise
  await expect(fetchData()).resolves.toBe('data');
  await expect(fetchError()).rejects.toThrow('error');
  
  // Callback
  function fetchCallback(callback) {
    setTimeout(() => callback('data'), 100);
  }
  
  await new Promise(resolve => {
    fetchCallback((data) => {
      expect(data).toBe('data');
      resolve();
    });
  });
});
```

### 3. Mock函数

```javascript
// Mock函数基础
test('Mock函数示例', () => {
  const mockFn = jest.fn();
  
  // 调用mock函数
  mockFn('arg1', 'arg2');
  mockFn('arg3');
  
  // 检查调用
  expect(mockFn).toHaveBeenCalled();
  expect(mockFn).toHaveBeenCalledTimes(2);
  expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
  expect(mockFn).toHaveBeenLastCalledWith('arg3');
  
  // Mock返回值
  const mockReturn = jest.fn();
  mockReturn.mockReturnValue(42);
  expect(mockReturn()).toBe(42);
  
  // Mock实现
  const mockImpl = jest.fn((x) => x * 2);
  expect(mockImpl(5)).toBe(10);
  
  // Mock Promise
  const mockAsync = jest.fn();
  mockAsync.mockResolvedValue('success');
  await expect(mockAsync()).resolves.toBe('success');
});

// Mock模块
jest.mock('./api', () => ({
  fetchUser: jest.fn(),
  updateUser: jest.fn()
}));

import { fetchUser, updateUser } from './api';

test('使用Mock模块', async () => {
  fetchUser.mockResolvedValue({ id: 1, name: 'John' });
  
  const user = await fetchUser(1);
  expect(user).toEqual({ id: 1, name: 'John' });
  expect(fetchUser).toHaveBeenCalledWith(1);
});
```

## 🎨 React Testing Library

### 1. 查询方法

```jsx
import { render, screen } from '@testing-library/react';

// 查询方法对比
test('查询方法示例', () => {
  render(
    <div>
      <button>Submit</button>
      <input placeholder="Enter email" />
      <div role="alert">Error message</div>
      <label htmlFor="username">Username</label>
      <input id="username" />
      <img alt="Profile" src="profile.jpg" />
      <h1>Welcome</h1>
      <div data-testid="custom-element">Custom</div>
    </div>
  );
  
  // getBy - 元素必须存在，否则抛出错误
  const submitButton = screen.getByRole('button', { name: /submit/i });
  const emailInput = screen.getByPlaceholderText(/enter email/i);
  const errorMessage = screen.getByRole('alert');
  const usernameInput = screen.getByLabelText(/username/i);
  const profileImage = screen.getByAltText(/profile/i);
  const heading = screen.getByText(/welcome/i);
  const customElement = screen.getByTestId('custom-element');
  
  // queryBy - 元素可能不存在，返回null
  const missingElement = screen.queryByText(/not found/i);
  expect(missingElement).toBeNull();
  
  // findBy - 异步查询，返回Promise
  const asyncElement = await screen.findByText(/loading complete/i);
});

// 查询优先级（推荐顺序）
test('查询优先级', () => {
  render(<MyComponent />);
  
  // 1. 可访问性查询（最推荐）
  screen.getByRole('button', { name: /submit/i });
  screen.getByLabelText(/email/i);
  screen.getByPlaceholderText(/search/i);
  screen.getByText(/hello world/i);
  
  // 2. 语义查询
  screen.getByAltText(/profile picture/i);
  screen.getByTitle(/close/i);
  
  // 3. Test ID（最后的选择）
  screen.getByTestId('custom-element');
});
```

### 2. 用户交互测试

```jsx
import userEvent from '@testing-library/user-event';

test('用户交互测试', async () => {
  const user = userEvent.setup();
  
  render(
    <form onSubmit={handleSubmit}>
      <input name="email" type="email" />
      <input name="password" type="password" />
      <input name="remember" type="checkbox" />
      <select name="country">
        <option value="">选择国家</option>
        <option value="cn">中国</option>
        <option value="us">美国</option>
      </select>
      <button type="submit">登录</button>
    </form>
  );
  
  // 输入文本
  const emailInput = screen.getByRole('textbox', { name: /email/i });
  await user.type(emailInput, 'test@example.com');
  expect(emailInput).toHaveValue('test@example.com');
  
  // 清空输入
  await user.clear(emailInput);
  expect(emailInput).toHaveValue('');
  
  // 点击
  const checkbox = screen.getByRole('checkbox');
  await user.click(checkbox);
  expect(checkbox).toBeChecked();
  
  // 双击
  await user.dblClick(submitButton);
  
  // 选择下拉选项
  const select = screen.getByRole('combobox');
  await user.selectOptions(select, 'cn');
  expect(select).toHaveValue('cn');
  
  // 键盘事件
  await user.keyboard('{Enter}');
  await user.keyboard('{Escape}');
  await user.keyboard('{ArrowDown}');
  
  // 复制粘贴
  await user.type(emailInput, 'test@example.com');
  await user.keyboard('{Control>}a{/Control}');
  await user.keyboard('{Control>}c{/Control}');
  
  // 上传文件
  const file = new File(['hello'], 'hello.png', { type: 'image/png' });
  const input = screen.getByLabelText(/upload/i);
  await user.upload(input, file);
  expect(input.files[0]).toBe(file);
});
```

### 3. 测试组件

```jsx
// 测试简单组件
test('Button组件应该正确渲染和响应点击', () => {
  const handleClick = jest.fn();
  
  render(
    <Button onClick={handleClick} variant="primary">
      Click me
    </Button>
  );
  
  const button = screen.getByRole('button', { name: /click me/i });
  
  // 检查渲染
  expect(button).toBeInTheDocument();
  expect(button).toHaveClass('btn-primary');
  
  // 测试交互
  fireEvent.click(button);
  expect(handleClick).toHaveBeenCalledTimes(1);
});

// 测试状态组件
test('Counter组件应该增加和减少计数', async () => {
  const user = userEvent.setup();
  render(<Counter initialCount={0} />);
  
  const count = screen.getByRole('heading');
  const incrementBtn = screen.getByRole('button', { name: /increment/i });
  const decrementBtn = screen.getByRole('button', { name: /decrement/i });
  
  // 初始状态
  expect(count).toHaveTextContent('0');
  
  // 增加
  await user.click(incrementBtn);
  expect(count).toHaveTextContent('1');
  
  // 减少
  await user.click(decrementBtn);
  expect(count).toHaveTextContent('0');
});

// 测试表单组件
test('LoginForm应该验证输入并提交', async () => {
  const user = userEvent.setup();
  const mockSubmit = jest.fn();
  
  render(<LoginForm onSubmit={mockSubmit} />);
  
  const emailInput = screen.getByLabelText(/email/i);
  const passwordInput = screen.getByLabelText(/password/i);
  const submitButton = screen.getByRole('button', { name: /login/i });
  
  // 测试验证
  await user.click(submitButton);
  expect(screen.getByText(/email is required/i)).toBeInTheDocument();
  expect(screen.getByText(/password is required/i)).toBeInTheDocument();
  expect(mockSubmit).not.toHaveBeenCalled();
  
  // 填写表单
  await user.type(emailInput, 'invalid-email');
  await user.type(passwordInput, '123');
  await user.click(submitButton);
  
  expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
  expect(screen.getByText(/password too short/i)).toBeInTheDocument();
  
  // 正确填写
  await user.clear(emailInput);
  await user.clear(passwordInput);
  await user.type(emailInput, 'test@example.com');
  await user.type(passwordInput, 'password123');
  await user.click(submitButton);
  
  expect(mockSubmit).toHaveBeenCalledWith({
    email: 'test@example.com',
    password: 'password123'
  });
});
```

## 🔄 测试异步代码

### 1. 测试API调用

```jsx
// Mock API
import * as api from './api';
jest.mock('./api');

test('UserProfile应该加载并显示用户数据', async () => {
  const userData = {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com'
  };
  
  api.fetchUser.mockResolvedValue(userData);
  
  render(<UserProfile userId={1} />);
  
  // 加载状态
  expect(screen.getByText(/loading/i)).toBeInTheDocument();
  
  // 等待数据加载
  const userName = await screen.findByText(userData.name);
  expect(userName).toBeInTheDocument();
  expect(screen.getByText(userData.email)).toBeInTheDocument();
  
  // 验证API调用
  expect(api.fetchUser).toHaveBeenCalledWith(1);
});

test('UserProfile应该处理加载错误', async () => {
  api.fetchUser.mockRejectedValue(new Error('Network error'));
  
  render(<UserProfile userId={1} />);
  
  // 等待错误信息
  const errorMessage = await screen.findByText(/error loading user/i);
  expect(errorMessage).toBeInTheDocument();
});

// 测试异步状态更新
test('异步搜索功能', async () => {
  const user = userEvent.setup();
  const mockSearch = jest.fn();
  
  mockSearch.mockImplementation((term) => {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve([
          { id: 1, title: `Result for ${term}` }
        ]);
      }, 100);
    });
  });
  
  render(<SearchComponent onSearch={mockSearch} />);
  
  const input = screen.getByRole('searchbox');
  await user.type(input, 'React');
  
  // 检查loading状态
  expect(screen.getByText(/searching/i)).toBeInTheDocument();
  
  // 等待结果
  const result = await screen.findByText(/Result for React/i);
  expect(result).toBeInTheDocument();
  expect(mockSearch).toHaveBeenCalledWith('React');
});
```

### 2. 测试定时器

```jsx
// 使用假定时器
beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});

test('Notification应该在3秒后自动消失', () => {
  render(<Notification message="Success!" duration={3000} />);
  
  // 初始状态
  expect(screen.getByText(/success/i)).toBeInTheDocument();
  
  // 快进2秒
  jest.advanceTimersByTime(2000);
  expect(screen.getByText(/success/i)).toBeInTheDocument();
  
  // 再快进1秒
  jest.advanceTimersByTime(1000);
  expect(screen.queryByText(/success/i)).not.toBeInTheDocument();
});

test('Debounced搜索', async () => {
  const user = userEvent.setup({ delay: null });
  const mockSearch = jest.fn();
  
  render(<DebouncedSearch onSearch={mockSearch} delay={500} />);
  
  const input = screen.getByRole('searchbox');
  
  // 快速输入
  await user.type(input, 'React');
  
  // 还没有触发搜索
  expect(mockSearch).not.toHaveBeenCalled();
  
  // 快进500ms
  jest.advanceTimersByTime(500);
  
  // 现在应该触发搜索
  expect(mockSearch).toHaveBeenCalledWith('React');
  expect(mockSearch).toHaveBeenCalledTimes(1);
});
```

## 🎯 测试Hooks

### 1. 测试自定义Hooks

```jsx
import { renderHook, act } from '@testing-library/react';

// 测试简单Hook
function useCounter(initialValue = 0) {
  const [count, setCount] = useState(initialValue);
  
  const increment = () => setCount(c => c + 1);
  const decrement = () => setCount(c => c - 1);
  const reset = () => setCount(initialValue);
  
  return { count, increment, decrement, reset };
}

test('useCounter Hook', () => {
  const { result } = renderHook(() => useCounter(10));
  
  // 初始状态
  expect(result.current.count).toBe(10);
  
  // 增加
  act(() => {
    result.current.increment();
  });
  expect(result.current.count).toBe(11);
  
  // 减少
  act(() => {
    result.current.decrement();
  });
  expect(result.current.count).toBe(10);
  
  // 重置
  act(() => {
    result.current.reset();
  });
  expect(result.current.count).toBe(10);
});

// 测试带依赖的Hook
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });
  
  const setValue = (value) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(error);
    }
  };
  
  return [storedValue, setValue];
}

test('useLocalStorage Hook', () => {
  const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));
  
  // 初始值
  expect(result.current[0]).toBe('initial');
  
  // 更新值
  act(() => {
    result.current[1]('updated');
  });
  
  expect(result.current[0]).toBe('updated');
  expect(localStorage.getItem('test-key')).toBe('"updated"');
});

// 测试异步Hook
function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(url);
        const json = await response.json();
        setData(json);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [url]);
  
  return { data, loading, error };
}

test('useFetch Hook', async () => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      json: () => Promise.resolve({ id: 1, name: 'Test' })
    })
  );
  
  const { result } = renderHook(() => useFetch('/api/data'));
  
  // 初始加载状态
  expect(result.current.loading).toBe(true);
  expect(result.current.data).toBe(null);
  
  // 等待加载完成
  await waitFor(() => {
    expect(result.current.loading).toBe(false);
  });
  
  expect(result.current.data).toEqual({ id: 1, name: 'Test' });
  expect(result.current.error).toBe(null);
});
```

### 2. 测试Context

```jsx
// Context和Provider
const ThemeContext = createContext();

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };
  
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

// 测试Context
test('ThemeContext提供主题切换功能', async () => {
  const user = userEvent.setup();
  
  function TestComponent() {
    const { theme, toggleTheme } = useTheme();
    return (
      <div>
        <p>Current theme: {theme}</p>
        <button onClick={toggleTheme}>Toggle</button>
      </div>
    );
  }
  
  render(
    <ThemeProvider>
      <TestComponent />
    </ThemeProvider>
  );
  
  // 初始主题
  expect(screen.getByText(/current theme: light/i)).toBeInTheDocument();
  
  // 切换主题
  await user.click(screen.getByRole('button', { name: /toggle/i }));
  expect(screen.getByText(/current theme: dark/i)).toBeInTheDocument();
});

// 测试Context错误
test('useTheme在Provider外使用应该抛出错误', () => {
  function TestComponent() {
    useTheme();
    return null;
  }
  
  // 捕获错误
  const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
  
  expect(() => {
    render(<TestComponent />);
  }).toThrow('useTheme must be used within ThemeProvider');
  
  spy.mockRestore();
});
```

## 🎭 Mock和测试隔离

### 1. Mock外部依赖

```jsx
// Mock模块
jest.mock('axios');
import axios from 'axios';

// Mock React Router
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  useParams: () => ({ id: '123' }),
}));

// Mock自定义Hook
jest.mock('./hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 1, name: 'Test User' },
    login: jest.fn(),
    logout: jest.fn(),
  })
}));

// Mock window对象
beforeEach(() => {
  delete window.location;
  window.location = { href: jest.fn() };
  
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
});

// Mock Intersection Observer
class MockIntersectionObserver {
  constructor(callback) {
    this.callback = callback;
  }
  
  observe() {
    this.callback([{ isIntersecting: true }]);
  }
  
  unobserve() {}
  disconnect() {}
}

window.IntersectionObserver = MockIntersectionObserver;
```

### 2. 测试隔离

```jsx
// 清理和重置
afterEach(() => {
  // 清理DOM
  cleanup();
  
  // 重置所有Mock
  jest.clearAllMocks();
  
  // 清理localStorage
  localStorage.clear();
  
  // 清理定时器
  jest.clearAllTimers();
});

// 测试数据工厂
const createUser = (overrides = {}) => ({
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
  role: 'user',
  ...overrides
});

const createPost = (overrides = {}) => ({
  id: 1,
  title: 'Test Post',
  content: 'This is a test post',
  author: createUser(),
  createdAt: new Date().toISOString(),
  ...overrides
});

test('使用测试数据工厂', () => {
  const adminUser = createUser({ role: 'admin' });
  const post = createPost({ author: adminUser });
  
  render(<Post post={post} />);
  
  expect(screen.getByText(post.title)).toBeInTheDocument();
  expect(screen.getByText(adminUser.name)).toBeInTheDocument();
});
```

## 📊 测试覆盖率

### 1. 配置覆盖率

```json
// package.json
{
  "scripts": {
    "test": "jest",
    "test:coverage": "jest --coverage",
    "test:watch": "jest --watch"
  }
}

// jest.config.js
module.exports = {
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/index.js',
    '!src/serviceWorker.js',
    '!src/**/*.stories.js',
    '!src/**/*.test.js'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    },
    './src/components/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    }
  },
  coverageReporters: ['text', 'lcov', 'html']
};
```

### 2. 提高覆盖率的策略

```jsx
// 测试所有分支
function processUser(user) {
  if (!user) {
    return null;
  }
  
  if (user.age < 18) {
    return { ...user, category: 'minor' };
  } else if (user.age >= 65) {
    return { ...user, category: 'senior' };
  } else {
    return { ...user, category: 'adult' };
  }
}

test('processUser应该处理所有情况', () => {
  // 测试null情况
  expect(processUser(null)).toBeNull();
  
  // 测试未成年人
  expect(processUser({ age: 16 })).toEqual({
    age: 16,
    category: 'minor'
  });
  
  // 测试成年人
  expect(processUser({ age: 30 })).toEqual({
    age: 30,
    category: 'adult'
  });
  
  // 测试老年人
  expect(processUser({ age: 70 })).toEqual({
    age: 70,
    category: 'senior'
  });
  
  // 边界情况
  expect(processUser({ age: 18 })).toEqual({
    age: 18,
    category: 'adult'
  });
  
  expect(processUser({ age: 65 })).toEqual({
    age: 65,
    category: 'senior'
  });
});
```

## 💼 实战项目：测试TodoApp

### 完整的测试套件

```jsx
// TodoApp.test.jsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import TodoApp from './TodoApp';

// 设置Mock服务器
const server = setupServer(
  rest.get('/api/todos', (req, res, ctx) => {
    return res(ctx.json([
      { id: 1, text: '学习React', completed: false },
      { id: 2, text: '写测试', completed: true }
    ]));
  }),
  
  rest.post('/api/todos', (req, res, ctx) => {
    const { text } = req.body;
    return res(ctx.json({
      id: Date.now(),
      text,
      completed: false
    }));
  }),
  
  rest.put('/api/todos/:id', (req, res, ctx) => {
    const { id } = req.params;
    const { completed } = req.body;
    return res(ctx.json({ id, completed }));
  }),
  
  rest.delete('/api/todos/:id', (req, res, ctx) => {
    return res(ctx.status(204));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('TodoApp', () => {
  test('应该加载并显示待办事项', async () => {
    render(<TodoApp />);
    
    // 检查加载状态
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    
    // 等待数据加载
    await waitFor(() => {
      expect(screen.getByText('学习React')).toBeInTheDocument();
    });
    
    expect(screen.getByText('写测试')).toBeInTheDocument();
  });
  
  test('应该添加新的待办事项', async () => {
    const user = userEvent.setup();
    render(<TodoApp />);
    
    // 等待初始加载
    await screen.findByText('学习React');
    
    // 添加新项
    const input = screen.getByPlaceholderText(/add todo/i);
    const addButton = screen.getByRole('button', { name: /add/i });
    
    await user.type(input, '部署应用');
    await user.click(addButton);
    
    // 验证新项出现
    await waitFor(() => {
      expect(screen.getByText('部署应用')).toBeInTheDocument();
    });
    
    // 输入框应该被清空
    expect(input).toHaveValue('');
  });
  
  test('应该切换待办事项状态', async () => {
    const user = userEvent.setup();
    render(<TodoApp />);
    
    // 等待加载
    const todoItem = await screen.findByText('学习React');
    const checkbox = todoItem.closest('li').querySelector('input[type="checkbox"]');
    
    expect(checkbox).not.toBeChecked();
    
    // 点击切换
    await user.click(checkbox);
    
    await waitFor(() => {
      expect(checkbox).toBeChecked();
    });
  });
  
  test('应该删除待办事项', async () => {
    const user = userEvent.setup();
    render(<TodoApp />);
    
    // 等待加载
    const todoItem = await screen.findByText('学习React');
    const deleteButton = todoItem.closest('li').querySelector('button[aria-label="delete"]');
    
    // 删除
    await user.click(deleteButton);
    
    await waitFor(() => {
      expect(screen.queryByText('学习React')).not.toBeInTheDocument();
    });
  });
  
  test('应该过滤待办事项', async () => {
    const user = userEvent.setup();
    render(<TodoApp />);
    
    // 等待加载
    await screen.findByText('学习React');
    
    // 点击"已完成"过滤器
    const completedFilter = screen.getByRole('button', { name: /completed/i });
    await user.click(completedFilter);
    
    // 只显示已完成项
    expect(screen.queryByText('学习React')).not.toBeInTheDocument();
    expect(screen.getByText('写测试')).toBeInTheDocument();
    
    // 点击"未完成"过滤器
    const activeFilter = screen.getByRole('button', { name: /active/i });
    await user.click(activeFilter);
    
    // 只显示未完成项
    expect(screen.getByText('学习React')).toBeInTheDocument();
    expect(screen.queryByText('写测试')).not.toBeInTheDocument();
  });
  
  test('应该处理API错误', async () => {
    // 模拟错误
    server.use(
      rest.get('/api/todos', (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ error: 'Server error' }));
      })
    );
    
    render(<TodoApp />);
    
    // 等待错误信息
    await waitFor(() => {
      expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
    });
  });
  
  test('应该显示空状态', async () => {
    // 返回空列表
    server.use(
      rest.get('/api/todos', (req, res, ctx) => {
        return res(ctx.json([]));
      })
    );
    
    render(<TodoApp />);
    
    // 等待空状态信息
    await waitFor(() => {
      expect(screen.getByText(/no todos yet/i)).toBeInTheDocument();
    });
  });
});

// 集成测试
describe('TodoApp集成测试', () => {
  test('完整的用户流程', async () => {
    const user = userEvent.setup();
    render(<TodoApp />);
    
    // 1. 等待初始加载
    await screen.findByText('学习React');
    
    // 2. 添加新项
    const input = screen.getByPlaceholderText(/add todo/i);
    await user.type(input, '准备面试');
    await user.keyboard('{Enter}');
    
    await screen.findByText('准备面试');
    
    // 3. 标记完成
    const newTodo = screen.getByText('准备面试');
    const checkbox = newTodo.closest('li').querySelector('input[type="checkbox"]');
    await user.click(checkbox);
    
    // 4. 过滤查看
    const completedFilter = screen.getByRole('button', { name: /completed/i });
    await user.click(completedFilter);
    
    expect(screen.getByText('准备面试')).toBeInTheDocument();
    expect(screen.queryByText('学习React')).not.toBeInTheDocument();
    
    // 5. 删除
    const deleteButton = screen.getByText('准备面试')
      .closest('li')
      .querySelector('button[aria-label="delete"]');
    await user.click(deleteButton);
    
    await waitFor(() => {
      expect(screen.queryByText('准备面试')).not.toBeInTheDocument();
    });
  });
});

// 性能测试
test('TodoApp应该在合理时间内渲染大量数据', async () => {
  // Mock大量数据
  const largeTodoList = Array.from({ length: 1000 }, (_, i) => ({
    id: i,
    text: `Todo item ${i}`,
    completed: i % 2 === 0
  }));
  
  server.use(
    rest.get('/api/todos', (req, res, ctx) => {
      return res(ctx.json(largeTodoList));
    })
  );
  
  const startTime = performance.now();
  render(<TodoApp />);
  
  // 等待渲染完成
  await screen.findByText('Todo item 0');
  const endTime = performance.now();
  
  // 应该在2秒内完成
  expect(endTime - startTime).toBeLessThan(2000);
});
```

## 🎯 今日练习

1. **基础练习**：为一个简单的计数器组件编写完整的测试套件
2. **进阶练习**：测试一个包含表单验证、API调用和错误处理的用户注册组件
3. **挑战练习**：为一个使用Context、自定义Hooks和异步数据的复杂应用编写集成测试

## 🚀 下一步

明天我们将学习：
- 开发环境配置最佳实践
- 生产构建优化
- 部署到各种平台
- CI/CD流程设置
- 监控和错误追踪

## 💭 思考题

1. 单元测试、集成测试和E2E测试各自的优缺点是什么？
2. 如何在测试覆盖率和开发效率之间找到平衡？
3. 什么情况下应该使用Mock？什么时候不应该？
4. 如何测试组件的可访问性？
5. TDD（测试驱动开发）适合什么场景？有什么局限性？

记住：**好的测试不仅能捕获bug，还能作为活文档，让代码更容易理解和维护。测试是投资，不是成本！**