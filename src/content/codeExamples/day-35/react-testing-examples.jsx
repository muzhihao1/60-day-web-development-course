// Day 35: React测试示例

import React, { useState, useEffect } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

// ==========================================
// 1. 基础组件测试
// ==========================================

// 简单按钮组件
export function Button({ children, onClick, variant = 'primary', disabled = false }) {
  return (
    <button
      className={`btn btn-${variant}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

// 按钮组件测试
describe('Button组件', () => {
  test('应该正确渲染', () => {
    render(<Button>Click me</Button>);
    
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('btn', 'btn-primary');
    expect(button).not.toBeDisabled();
  });
  
  test('应该应用不同的variant', () => {
    const { rerender } = render(<Button variant="secondary">Test</Button>);
    
    expect(screen.getByRole('button')).toHaveClass('btn-secondary');
    
    rerender(<Button variant="danger">Test</Button>);
    expect(screen.getByRole('button')).toHaveClass('btn-danger');
  });
  
  test('应该处理点击事件', async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();
    
    render(<Button onClick={handleClick}>Click me</Button>);
    
    await user.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
  
  test('禁用时不应该触发点击', async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();
    
    render(<Button onClick={handleClick} disabled>Click me</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    
    await user.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });
});

// ==========================================
// 2. 表单组件测试
// ==========================================

// 登录表单组件
export function LoginForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const validate = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    return newErrors;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validate();
    setErrors(validationErrors);
    
    if (Object.keys(validationErrors).length === 0) {
      setIsSubmitting(true);
      try {
        await onSubmit(formData);
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // 清除对应字段的错误
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  return (
    <form onSubmit={handleSubmit} aria-label="Login form">
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          aria-invalid={errors.email ? 'true' : 'false'}
          aria-describedby={errors.email ? 'email-error' : undefined}
        />
        {errors.email && (
          <span id="email-error" role="alert" className="error">
            {errors.email}
          </span>
        )}
      </div>
      
      <div>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          aria-invalid={errors.password ? 'true' : 'false'}
          aria-describedby={errors.password ? 'password-error' : undefined}
        />
        {errors.password && (
          <span id="password-error" role="alert" className="error">
            {errors.password}
          </span>
        )}
      </div>
      
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}

// 登录表单测试
describe('LoginForm组件', () => {
  test('应该渲染所有表单元素', () => {
    render(<LoginForm onSubmit={jest.fn()} />);
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });
  
  test('应该验证必填字段', async () => {
    const user = userEvent.setup();
    const handleSubmit = jest.fn();
    
    render(<LoginForm onSubmit={handleSubmit} />);
    
    // 直接提交空表单
    await user.click(screen.getByRole('button', { name: /login/i }));
    
    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    expect(handleSubmit).not.toHaveBeenCalled();
  });
  
  test('应该验证邮箱格式', async () => {
    const user = userEvent.setup();
    
    render(<LoginForm onSubmit={jest.fn()} />);
    
    const emailInput = screen.getByLabelText(/email/i);
    await user.type(emailInput, 'invalid-email');
    await user.click(screen.getByRole('button', { name: /login/i }));
    
    expect(screen.getByText(/email is invalid/i)).toBeInTheDocument();
  });
  
  test('应该验证密码长度', async () => {
    const user = userEvent.setup();
    
    render(<LoginForm onSubmit={jest.fn()} />);
    
    const passwordInput = screen.getByLabelText(/password/i);
    await user.type(passwordInput, '123');
    await user.click(screen.getByRole('button', { name: /login/i }));
    
    expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument();
  });
  
  test('应该成功提交有效表单', async () => {
    const user = userEvent.setup();
    const handleSubmit = jest.fn();
    
    render(<LoginForm onSubmit={handleSubmit} />);
    
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /login/i }));
    
    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
    });
  });
  
  test('应该在提交时禁用按钮', async () => {
    const user = userEvent.setup();
    const handleSubmit = jest.fn(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    render(<LoginForm onSubmit={handleSubmit} />);
    
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    
    const submitButton = screen.getByRole('button', { name: /login/i });
    await user.click(submitButton);
    
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveTextContent('Logging in...');
    
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
      expect(submitButton).toHaveTextContent('Login');
    });
  });
});

// ==========================================
// 3. 列表组件测试
// ==========================================

// 待办事项列表组件
export function TodoList({ todos = [], onToggle, onDelete }) {
  const [filter, setFilter] = useState('all');
  
  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });
  
  const stats = {
    total: todos.length,
    active: todos.filter(t => !t.completed).length,
    completed: todos.filter(t => t.completed).length
  };
  
  return (
    <div className="todo-list">
      <div className="stats">
        <span>Total: {stats.total}</span>
        <span>Active: {stats.active}</span>
        <span>Completed: {stats.completed}</span>
      </div>
      
      <div className="filters">
        <button
          onClick={() => setFilter('all')}
          className={filter === 'all' ? 'active' : ''}
        >
          All
        </button>
        <button
          onClick={() => setFilter('active')}
          className={filter === 'active' ? 'active' : ''}
        >
          Active
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={filter === 'completed' ? 'active' : ''}
        >
          Completed
        </button>
      </div>
      
      {filteredTodos.length === 0 ? (
        <p className="empty-message">
          {filter === 'all' ? 'No todos yet' : `No ${filter} todos`}
        </p>
      ) : (
        <ul>
          {filteredTodos.map(todo => (
            <li key={todo.id} className={todo.completed ? 'completed' : ''}>
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => onToggle(todo.id)}
                aria-label={`Mark "${todo.text}" as ${todo.completed ? 'incomplete' : 'complete'}`}
              />
              <span>{todo.text}</span>
              <button
                onClick={() => onDelete(todo.id)}
                aria-label={`Delete "${todo.text}"`}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// 待办事项列表测试
describe('TodoList组件', () => {
  const mockTodos = [
    { id: 1, text: 'Learn React', completed: false },
    { id: 2, text: 'Write tests', completed: true },
    { id: 3, text: 'Deploy app', completed: false }
  ];
  
  test('应该显示所有待办事项', () => {
    render(
      <TodoList
        todos={mockTodos}
        onToggle={jest.fn()}
        onDelete={jest.fn()}
      />
    );
    
    expect(screen.getByText('Learn React')).toBeInTheDocument();
    expect(screen.getByText('Write tests')).toBeInTheDocument();
    expect(screen.getByText('Deploy app')).toBeInTheDocument();
  });
  
  test('应该显示正确的统计信息', () => {
    render(
      <TodoList
        todos={mockTodos}
        onToggle={jest.fn()}
        onDelete={jest.fn()}
      />
    );
    
    expect(screen.getByText('Total: 3')).toBeInTheDocument();
    expect(screen.getByText('Active: 2')).toBeInTheDocument();
    expect(screen.getByText('Completed: 1')).toBeInTheDocument();
  });
  
  test('应该过滤待办事项', async () => {
    const user = userEvent.setup();
    
    render(
      <TodoList
        todos={mockTodos}
        onToggle={jest.fn()}
        onDelete={jest.fn()}
      />
    );
    
    // 点击Active过滤器
    await user.click(screen.getByRole('button', { name: /active/i }));
    
    expect(screen.getByText('Learn React')).toBeInTheDocument();
    expect(screen.queryByText('Write tests')).not.toBeInTheDocument();
    expect(screen.getByText('Deploy app')).toBeInTheDocument();
    
    // 点击Completed过滤器
    await user.click(screen.getByRole('button', { name: /completed/i }));
    
    expect(screen.queryByText('Learn React')).not.toBeInTheDocument();
    expect(screen.getByText('Write tests')).toBeInTheDocument();
    expect(screen.queryByText('Deploy app')).not.toBeInTheDocument();
  });
  
  test('应该切换待办事项状态', async () => {
    const user = userEvent.setup();
    const handleToggle = jest.fn();
    
    render(
      <TodoList
        todos={mockTodos}
        onToggle={handleToggle}
        onDelete={jest.fn()}
      />
    );
    
    const firstCheckbox = screen.getByRole('checkbox', {
      name: /mark "learn react" as complete/i
    });
    
    await user.click(firstCheckbox);
    expect(handleToggle).toHaveBeenCalledWith(1);
  });
  
  test('应该删除待办事项', async () => {
    const user = userEvent.setup();
    const handleDelete = jest.fn();
    
    render(
      <TodoList
        todos={mockTodos}
        onToggle={jest.fn()}
        onDelete={handleDelete}
      />
    );
    
    const deleteButton = screen.getByRole('button', {
      name: /delete "learn react"/i
    });
    
    await user.click(deleteButton);
    expect(handleDelete).toHaveBeenCalledWith(1);
  });
  
  test('应该显示空状态信息', () => {
    render(
      <TodoList
        todos={[]}
        onToggle={jest.fn()}
        onDelete={jest.fn()}
      />
    );
    
    expect(screen.getByText('No todos yet')).toBeInTheDocument();
  });
});

// ==========================================
// 4. 异步组件测试
// ==========================================

// 用户资料组件
export function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/users/${userId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch user');
        }
        
        const data = await response.json();
        setUser(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUser();
  }, [userId]);
  
  if (loading) {
    return <div role="status" aria-live="polite">Loading user...</div>;
  }
  
  if (error) {
    return (
      <div role="alert" className="error">
        Error: {error}
      </div>
    );
  }
  
  if (!user) {
    return <div>User not found</div>;
  }
  
  return (
    <div className="user-profile">
      <h2>{user.name}</h2>
      <p>Email: {user.email}</p>
      <p>Role: {user.role}</p>
      <p>Joined: {new Date(user.joinedAt).toLocaleDateString()}</p>
    </div>
  );
}

// 用户资料测试
describe('UserProfile组件', () => {
  beforeEach(() => {
    // Mock fetch
    global.fetch = jest.fn();
  });
  
  afterEach(() => {
    jest.restoreAllMocks();
  });
  
  test('应该显示加载状态', () => {
    fetch.mockImplementation(() => new Promise(() => {})); // 永不resolve
    
    render(<UserProfile userId={1} />);
    
    expect(screen.getByRole('status')).toHaveTextContent('Loading user...');
  });
  
  test('应该显示用户信息', async () => {
    const mockUser = {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      role: 'admin',
      joinedAt: '2023-01-01'
    };
    
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUser
    });
    
    render(<UserProfile userId={1} />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Email: john@example.com')).toBeInTheDocument();
    expect(screen.getByText('Role: admin')).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledWith('/api/users/1');
  });
  
  test('应该处理错误', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 404
    });
    
    render(<UserProfile userId={999} />);
    
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Error: Failed to fetch user');
    });
  });
  
  test('应该处理网络错误', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'));
    
    render(<UserProfile userId={1} />);
    
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Error: Network error');
    });
  });
  
  test('应该在userId改变时重新获取数据', async () => {
    const mockUser1 = { id: 1, name: 'User 1', email: 'user1@example.com' };
    const mockUser2 = { id: 2, name: 'User 2', email: 'user2@example.com' };
    
    fetch
      .mockResolvedValueOnce({ ok: true, json: async () => mockUser1 })
      .mockResolvedValueOnce({ ok: true, json: async () => mockUser2 });
    
    const { rerender } = render(<UserProfile userId={1} />);
    
    await waitFor(() => {
      expect(screen.getByText('User 1')).toBeInTheDocument();
    });
    
    rerender(<UserProfile userId={2} />);
    
    await waitFor(() => {
      expect(screen.getByText('User 2')).toBeInTheDocument();
    });
    
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(fetch).toHaveBeenCalledWith('/api/users/1');
    expect(fetch).toHaveBeenCalledWith('/api/users/2');
  });
});

// ==========================================
// 5. 定时器组件测试
// ==========================================

// 倒计时组件
export function Countdown({ seconds, onComplete }) {
  const [timeLeft, setTimeLeft] = useState(seconds);
  
  useEffect(() => {
    if (timeLeft <= 0) {
      onComplete?.();
      return;
    }
    
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timeLeft, onComplete]);
  
  const minutes = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  
  return (
    <div className="countdown">
      <span className="time">
        {String(minutes).padStart(2, '0')}:{String(secs).padStart(2, '0')}
      </span>
      {timeLeft === 0 && <span className="complete">Time's up!</span>}
    </div>
  );
}

// 倒计时测试
describe('Countdown组件', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  
  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });
  
  test('应该显示初始时间', () => {
    render(<Countdown seconds={125} onComplete={jest.fn()} />);
    
    expect(screen.getByText('02:05')).toBeInTheDocument();
  });
  
  test('应该每秒递减', () => {
    render(<Countdown seconds={10} onComplete={jest.fn()} />);
    
    expect(screen.getByText('00:10')).toBeInTheDocument();
    
    jest.advanceTimersByTime(1000);
    expect(screen.getByText('00:09')).toBeInTheDocument();
    
    jest.advanceTimersByTime(1000);
    expect(screen.getByText('00:08')).toBeInTheDocument();
  });
  
  test('应该在倒计时结束时调用onComplete', () => {
    const handleComplete = jest.fn();
    render(<Countdown seconds={3} onComplete={handleComplete} />);
    
    expect(handleComplete).not.toHaveBeenCalled();
    
    jest.advanceTimersByTime(3000);
    
    expect(screen.getByText('00:00')).toBeInTheDocument();
    expect(screen.getByText("Time's up!")).toBeInTheDocument();
    expect(handleComplete).toHaveBeenCalledTimes(1);
  });
  
  test('应该清理定时器', () => {
    const { unmount } = render(<Countdown seconds={10} onComplete={jest.fn()} />);
    
    const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
    
    unmount();
    
    expect(clearIntervalSpy).toHaveBeenCalled();
  });
});