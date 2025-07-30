import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { setupServer } from 'msw/node';
import { rest } from 'msw';
import AuthFlow from './AuthFlow';
import { AuthProvider } from './AuthContext';
// 设置MSW服务器
const server = setupServer(
  rest.post('/api/register', async (req, res, ctx) => {
    const { email, password, name } = await req.json();
    // 验证邮箱是否已存在
    if (email === 'existing@example.com') {
      return res(
        ctx.status(409),
        ctx.json({ error: '邮箱已被注册' })
      );
    }
    // 验证密码强度
    if (password.length < 8) {
      return res(
        ctx.status(400),
        ctx.json({ error: '密码至少需要8个字符' })
      );
    }
    return res(
      ctx.status(201),
      ctx.json({
        user: { id: 1, email, name },
        token: 'mock-jwt-token'
      })
    );
  }),
  rest.post('/api/login', async (req, res, ctx) => {
    const { email, password, rememberMe } = await req.json();
    // 模拟登录尝试限制
    const attempts = req.headers.get('X-Login-Attempts');
    if (attempts && parseInt(attempts) > 5) {
      return res(
        ctx.status(429),
        ctx.json({ error: '登录尝试次数过多，请稍后再试' })
      );
    }
    // 验证凭证
    if (email === 'test@example.com' && password === 'password123') {
      return res(
        ctx.json({
          user: { 
            id: 1, 
            email, 
            name: 'Test User',
            role: 'user',
            requires2FA: false
          },
          token: 'mock-jwt-token',
          refreshToken: rememberMe ? 'mock-refresh-token' : null
        })
      );
    }
    // 需要双因素认证的用户
    if (email === '2fa@example.com' && password === 'password123') {
      return res(
        ctx.status(202),
        ctx.json({
          requires2FA: true,
          tempToken: 'temp-2fa-token'
        })
      );
    }
    return res(
      ctx.status(401),
      ctx.json({ error: '邮箱或密码错误' })
    );
  }),
  rest.post('/api/verify-2fa', async (req, res, ctx) => {
    const { code, tempToken } = await req.json();
    if (code === '123456' && tempToken === 'temp-2fa-token') {
      return res(
        ctx.json({
          user: { 
            id: 2, 
            email: '2fa@example.com', 
            name: '2FA User',
            role: 'admin'
          },
          token: 'mock-jwt-token'
        })
      );
    }
    return res(
      ctx.status(401),
      ctx.json({ error: '验证码错误' })
    );
  }),
  rest.post('/api/forgot-password', async (req, res, ctx) => {
    const { email } = await req.json();
    if (email === 'test@example.com') {
      return res(
        ctx.json({ message: '重置链接已发送到您的邮箱' })
      );
    }
    return res(
      ctx.status(404),
      ctx.json({ error: '邮箱未注册' })
    );
  }),
  rest.post('/api/reset-password', async (req, res, ctx) => {
    const { token, password } = await req.json();
    if (token === 'valid-reset-token' && password.length >= 8) {
      return res(
        ctx.json({ message: '密码重置成功' })
      );
    }
    return res(
      ctx.status(400),
      ctx.json({ error: '无效的重置令牌' })
    );
  }),
  rest.post('/api/refresh', (req, res, ctx) => {
    const refreshToken = req.headers.get('X-Refresh-Token');
    if (refreshToken === 'mock-refresh-token') {
      return res(
        ctx.json({
          token: 'new-jwt-token',
          refreshToken: 'new-refresh-token'
        })
      );
    }
    return res(
      ctx.status(401),
      ctx.json({ error: 'Invalid refresh token' })
    );
  }),
  rest.get('/api/user/profile', (req, res, ctx) => {
    const token = req.headers.get('Authorization');
    if (token === 'Bearer mock-jwt-token') {
      return res(
        ctx.json({
          id: 1,
          email: 'test@example.com',
          name: 'Test User',
          role: 'user',
          permissions: ['read', 'write']
        })
      );
    }
    return res(
      ctx.status(401),
      ctx.json({ error: 'Unauthorized' })
    );
  }),
  rest.post('/api/logout', (req, res, ctx) => {
    return res(
      ctx.json({ message: 'Logged out successfully' })
    );
  })
);
beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  localStorage.clear();
  sessionStorage.clear();
});
afterAll(() => server.close());
// 测试工具函数
const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  );
};
describe('用户注册流程', () => {
  test('应该成功完成注册', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AuthFlow />);
    // 切换到注册表单
    await user.click(screen.getByRole('tab', { name: /注册/i }));
    // 填写表单
    await user.type(screen.getByLabelText(/姓名/i), 'New User');
    await user.type(screen.getByLabelText(/邮箱/i), 'new@example.com');
    await user.type(screen.getByLabelText(/密码/i), 'password123');
    await user.type(screen.getByLabelText(/确认密码/i), 'password123');
    
    // 同意条款
    await user.click(screen.getByRole('checkbox', { 
      name: /同意服务条款/i 
    }));
    // 提交
    await user.click(screen.getByRole('button', { name: /注册/i }));
    // 验证成功
    await waitFor(() => {
      expect(screen.getByText(/注册成功/i)).toBeInTheDocument();
    });
    // 验证token存储
    expect(localStorage.getItem('auth-token')).toBe('mock-jwt-token');
  });
  test('应该处理邮箱已存在错误', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AuthFlow />);
    await user.click(screen.getByRole('tab', { name: /注册/i }));
    await user.type(screen.getByLabelText(/姓名/i), 'Existing User');
    await user.type(screen.getByLabelText(/邮箱/i), 'existing@example.com');
    await user.type(screen.getByLabelText(/密码/i), 'password123');
    await user.type(screen.getByLabelText(/确认密码/i), 'password123');
    await user.click(screen.getByRole('checkbox', { 
      name: /同意服务条款/i 
    }));
    await user.click(screen.getByRole('button', { name: /注册/i }));
    await waitFor(() => {
      expect(screen.getByText(/邮箱已被注册/i)).toBeInTheDocument();
    });
  });
  test('应该验证密码强度', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AuthFlow />);
    await user.click(screen.getByRole('tab', { name: /注册/i }));
    await user.type(screen.getByLabelText(/密码/i), '123');
    // 实时验证提示
    expect(screen.getByText(/密码强度：弱/i)).toBeInTheDocument();
    expect(screen.getByText(/至少8个字符/i)).toBeInTheDocument();
  });
  test('应该验证密码匹配', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AuthFlow />);
    await user.click(screen.getByRole('tab', { name: /注册/i }));
    await user.type(screen.getByLabelText(/^密码$/i), 'password123');
    await user.type(screen.getByLabelText(/确认密码/i), 'password456');
    await user.click(screen.getByRole('button', { name: /注册/i }));
    expect(screen.getByText(/密码不匹配/i)).toBeInTheDocument();
  });
});
describe('用户登录流程', () => {
  test('应该成功登录并跳转', async () => {
    const user = userEvent.setup();
    const mockNavigate = jest.fn();
    
    // Mock useNavigate
    jest.mock('react-router-dom', () => ({
      ...jest.requireActual('react-router-dom'),
      useNavigate: () => mockNavigate
    }));
    renderWithProviders(<AuthFlow />);
    await user.type(screen.getByLabelText(/邮箱/i), 'test@example.com');
    await user.type(screen.getByLabelText(/密码/i), 'password123');
    await user.click(screen.getByRole('button', { name: /登录/i }));
    await waitFor(() => {
      expect(localStorage.getItem('auth-token')).toBe('mock-jwt-token');
    });
  });
  test('应该处理错误凭证', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AuthFlow />);
    await user.type(screen.getByLabelText(/邮箱/i), 'wrong@example.com');
    await user.type(screen.getByLabelText(/密码/i), 'wrongpassword');
    await user.click(screen.getByRole('button', { name: /登录/i }));
    await waitFor(() => {
      expect(screen.getByText(/邮箱或密码错误/i)).toBeInTheDocument();
    });
  });
  test('应该处理记住我功能', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AuthFlow />);
    await user.type(screen.getByLabelText(/邮箱/i), 'test@example.com');
    await user.type(screen.getByLabelText(/密码/i), 'password123');
    await user.click(screen.getByRole('checkbox', { name: /记住我/i }));
    await user.click(screen.getByRole('button', { name: /登录/i }));
    await waitFor(() => {
      expect(localStorage.getItem('refresh-token')).toBe('mock-refresh-token');
    });
  });
  test('应该处理双因素认证', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AuthFlow />);
    await user.type(screen.getByLabelText(/邮箱/i), '2fa@example.com');
    await user.type(screen.getByLabelText(/密码/i), 'password123');
    await user.click(screen.getByRole('button', { name: /登录/i }));
    // 显示2FA输入
    await waitFor(() => {
      expect(screen.getByText(/输入验证码/i)).toBeInTheDocument();
    });
    // 输入验证码
    await user.type(screen.getByLabelText(/验证码/i), '123456');
    await user.click(screen.getByRole('button', { name: /验证/i }));
    await waitFor(() => {
      expect(localStorage.getItem('auth-token')).toBe('mock-jwt-token');
    });
  });
  test('应该处理登录尝试限制', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AuthFlow />);
    // 设置请求头模拟多次尝试
    server.use(
      rest.post('/api/login', (req, res, ctx) => {
        return res(
          ctx.status(429),
          ctx.json({ error: '登录尝试次数过多，请稍后再试' })
        );
      })
    );
    await user.type(screen.getByLabelText(/邮箱/i), 'test@example.com');
    await user.type(screen.getByLabelText(/密码/i), 'wrongpassword');
    await user.click(screen.getByRole('button', { name: /登录/i }));
    await waitFor(() => {
      expect(screen.getByText(/登录尝试次数过多/i)).toBeInTheDocument();
    });
  });
});
describe('密码重置流程', () => {
  test('应该发送重置邮件', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AuthFlow />);
    await user.click(screen.getByRole('link', { name: /忘记密码/i }));
    await user.type(screen.getByLabelText(/邮箱/i), 'test@example.com');
    await user.click(screen.getByRole('button', { name: /发送重置链接/i }));
    await waitFor(() => {
      expect(screen.getByText(/重置链接已发送/i)).toBeInTheDocument();
    });
  });
  test('应该处理未注册邮箱', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AuthFlow />);
    await user.click(screen.getByRole('link', { name: /忘记密码/i }));
    await user.type(screen.getByLabelText(/邮箱/i), 'unknown@example.com');
    await user.click(screen.getByRole('button', { name: /发送重置链接/i }));
    await waitFor(() => {
      expect(screen.getByText(/邮箱未注册/i)).toBeInTheDocument();
    });
  });
  test('应该重置密码', async () => {
    const user = userEvent.setup();
    
    // 模拟带有重置令牌的URL
    window.history.pushState({}, '', '/reset-password?token=valid-reset-token');
    
    renderWithProviders(<AuthFlow />);
    await user.type(screen.getByLabelText(/新密码/i), 'newpassword123');
    await user.type(screen.getByLabelText(/确认新密码/i), 'newpassword123');
    await user.click(screen.getByRole('button', { name: /重置密码/i }));
    await waitFor(() => {
      expect(screen.getByText(/密码重置成功/i)).toBeInTheDocument();
    });
  });
});
describe('会话管理', () => {
  test('应该自动刷新Token', async () => {
    jest.useFakeTimers();
    
    // 设置即将过期的token
    const expiredToken = {
      token: 'mock-jwt-token',
      expiresAt: Date.now() + 5 * 60 * 1000 // 5分钟后过期
    };
    localStorage.setItem('auth-token', expiredToken.token);
    localStorage.setItem('refresh-token', 'mock-refresh-token');
    renderWithProviders(<AuthFlow />);
    // 快进到token即将过期
    jest.advanceTimersByTime(4 * 60 * 1000);
    await waitFor(() => {
      expect(localStorage.getItem('auth-token')).toBe('new-jwt-token');
    });
    jest.useRealTimers();
  });
  test('应该处理401错误并重试', async () => {
    let callCount = 0;
    
    server.use(
      rest.get('/api/user/profile', (req, res, ctx) => {
        callCount++;
        
        // 第一次返回401
        if (callCount === 1) {
          return res(
            ctx.status(401),
            ctx.json({ error: 'Token expired' })
          );
        }
        
        // 刷新后成功
        return res(
          ctx.json({
            id: 1,
            email: 'test@example.com',
            name: 'Test User'
          })
        );
      })
    );
    localStorage.setItem('auth-token', 'expired-token');
    localStorage.setItem('refresh-token', 'mock-refresh-token');
    renderWithProviders(<AuthFlow />);
    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });
    expect(callCount).toBe(2); // 原始请求 + 重试
  });
  test('应该处理并发请求的token刷新', async () => {
    const refreshCalls = [];
    
    server.use(
      rest.post('/api/refresh', (req, res, ctx) => {
        refreshCalls.push(Date.now());
        
        return res(
          ctx.delay(100),
          ctx.json({
            token: 'new-jwt-token',
            refreshToken: 'new-refresh-token'
          })
        );
      })
    );
    renderWithProviders(<AuthFlow />);
    // 同时发起多个需要认证的请求
    const promises = Array(5).fill(null).map(() => 
      fetch('/api/user/profile', {
        headers: { Authorization: 'Bearer expired-token' }
      })
    );
    await Promise.all(promises);
    // 应该只刷新一次
    expect(refreshCalls.length).toBe(1);
  });
  test('应该在登出时清理所有数据', async () => {
    const user = userEvent.setup();
    
    localStorage.setItem('auth-token', 'mock-jwt-token');
    localStorage.setItem('refresh-token', 'mock-refresh-token');
    sessionStorage.setItem('temp-data', 'temp');
    renderWithProviders(<AuthFlow />);
    await user.click(screen.getByRole('button', { name: /登出/i }));
    await waitFor(() => {
      expect(localStorage.getItem('auth-token')).toBeNull();
      expect(localStorage.getItem('refresh-token')).toBeNull();
      expect(sessionStorage.getItem('temp-data')).toBeNull();
    });
  });
});
describe('权限控制', () => {
  test('应该阻止未登录用户访问保护路由', () => {
    window.history.pushState({}, '', '/dashboard');
    
    renderWithProviders(<AuthFlow />);
    expect(screen.getByText(/请先登录/i)).toBeInTheDocument();
    expect(window.location.pathname).toBe('/login');
  });
  test('应该验证用户角色权限', async () => {
    localStorage.setItem('auth-token', 'mock-jwt-token');
    
    // Mock用户为普通用户
    server.use(
      rest.get('/api/user/profile', (req, res, ctx) => {
        return res(
          ctx.json({
            id: 1,
            email: 'test@example.com',
            name: 'Test User',
            role: 'user',
            permissions: ['read']
          })
        );
      })
    );
    window.history.pushState({}, '', '/admin');
    
    renderWithProviders(<AuthFlow />);
    await waitFor(() => {
      expect(screen.getByText(/权限不足/i)).toBeInTheDocument();
    });
  });
  test('应该允许有权限的用户访问', async () => {
    localStorage.setItem('auth-token', 'mock-jwt-token');
    
    // Mock用户为管理员
    server.use(
      rest.get('/api/user/profile', (req, res, ctx) => {
        return res(
          ctx.json({
            id: 1,
            email: 'admin@example.com',
            name: 'Admin User',
            role: 'admin',
            permissions: ['read', 'write', 'delete']
          })
        );
      })
    );
    window.history.pushState({}, '', '/admin');
    
    renderWithProviders(<AuthFlow />);
    await waitFor(() => {
      expect(screen.getByText(/管理员面板/i)).toBeInTheDocument();
    });
  });
});
describe('社交登录', () => {
  test('应该处理Google登录', async () => {
    const user = userEvent.setup();
    
    // Mock Google OAuth
    window.google = {
      accounts: {
        id: {
          initialize: jest.fn(),
          prompt: jest.fn()
        }
      }
    };
    renderWithProviders(<AuthFlow />);
    await user.click(screen.getByRole('button', { 
      name: /使用Google登录/i 
    }));
    expect(window.google.accounts.id.initialize).toHaveBeenCalled();
  });
  test('应该处理GitHub登录', async () => {
    const user = userEvent.setup();
    
    // Mock window.open
    const mockOpen = jest.fn();
    window.open = mockOpen;
    renderWithProviders(<AuthFlow />);
    await user.click(screen.getByRole('button', { 
      name: /使用GitHub登录/i 
    }));
    expect(mockOpen).toHaveBeenCalledWith(
      expect.stringContaining('github.com/login/oauth'),
      'github-auth',
      expect.any(String)
    );
  });
});
describe('安全功能', () => {
  test('应该检测异常登录地点', async () => {
    server.use(
      rest.post('/api/login', async (req, res, ctx) => {
        return res(
          ctx.json({
            user: { id: 1, email: 'test@example.com' },
            token: 'mock-jwt-token',
            securityAlert: {
              type: 'unusual_location',
              message: '检测到从新地点登录',
              location: 'Beijing, China',
              ip: '1.2.3.4'
            }
          })
        );
      })
    );
    const user = userEvent.setup();
    renderWithProviders(<AuthFlow />);
    await user.type(screen.getByLabelText(/邮箱/i), 'test@example.com');
    await user.type(screen.getByLabelText(/密码/i), 'password123');
    await user.click(screen.getByRole('button', { name: /登录/i }));
    await waitFor(() => {
      expect(screen.getByText(/检测到从新地点登录/i)).toBeInTheDocument();
      expect(screen.getByText(/Beijing, China/i)).toBeInTheDocument();
    });
  });
  test('应该强制安全密码要求', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AuthFlow />);
    await user.click(screen.getByRole('tab', { name: /注册/i }));
    const passwordInput = screen.getByLabelText(/^密码$/i);
    
    // 测试各种密码强度
    await user.type(passwordInput, '123');
    expect(screen.getByText(/密码强度：弱/i)).toBeInTheDocument();
    await user.clear(passwordInput);
    await user.type(passwordInput, 'password');
    expect(screen.getByText(/密码强度：中/i)).toBeInTheDocument();
    await user.clear(passwordInput);
    await user.type(passwordInput, 'P@ssw0rd123!');
    expect(screen.getByText(/密码强度：强/i)).toBeInTheDocument();
  });
});