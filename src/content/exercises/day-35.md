---
day: 35
title: "测试React应用练习"
description: "通过实战练习掌握Jest和React Testing Library，编写单元测试、集成测试和端到端测试"
difficulty: "advanced"
estimatedTime: 180
requirements:
  - "购物车组件测试"
  - "用户认证流程测试"
  - "实时协作应用测试"
hints:
  - "遵循测试金字塔原则"
  - "使用AAA模式组织测试"
  - "优先使用用户视角的查询"
  - "合理使用Mock但不要过度"
  - "测试行为而非实现细节"
---

# Day 35 - 测试React应用

今天的练习将帮助你掌握React应用测试的最佳实践。通过编写不同类型的测试，你将学会如何构建可靠、可维护的测试套件。

## 练习1：购物车组件测试

创建一个购物车组件的完整测试套件：

### 功能要求：
1. **商品管理** - 添加、删除、更新数量
2. **价格计算** - 小计、税费、总价
3. **优惠券** - 应用折扣码
4. **库存检查** - 验证库存限制
5. **持久化** - localStorage保存购物车
6. **错误处理** - 网络错误、无效输入
7. **性能优化** - 大量商品时的渲染
8. **可访问性** - 键盘导航、屏幕阅读器

### 测试要求：
- 单元测试所有工具函数
- 集成测试组件交互
- 测试异步操作和副作用
- Mock外部依赖
- 达到90%以上代码覆盖率

### 测试示例：
```javascript
// 单元测试示例
describe('价格计算工具', () => {
  test('calculateSubtotal应该正确计算小计', () => {
    const items = [
      { id: 1, price: 10, quantity: 2 },
      { id: 2, price: 15, quantity: 1 }
    ];
    expect(calculateSubtotal(items)).toBe(35);
  });
  
  test('applyDiscount应该正确应用折扣', () => {
    expect(applyDiscount(100, 'SAVE20')).toBe(80);
    expect(applyDiscount(100, 'INVALID')).toBe(100);
  });
});

// 组件测试示例
describe('ShoppingCart', () => {
  test('应该添加商品到购物车', async () => {
    const user = userEvent.setup();
    render(<ShoppingCart />);
    
    const addButton = screen.getByRole('button', { name: /add to cart/i });
    await user.click(addButton);
    
    expect(screen.getByText(/1 item in cart/i)).toBeInTheDocument();
  });
});
```

### 关键测试场景：
- 空购物车状态
- 添加重复商品
- 库存不足处理
- 优惠券验证
- 价格变化更新
- 网络请求失败

## 练习2：用户认证流程测试

为完整的用户认证系统编写测试：

### 功能要求：
1. **注册流程** - 表单验证、邮箱确认
2. **登录系统** - 多种登录方式
3. **密码管理** - 重置、修改密码
4. **会话管理** - Token刷新、超时处理
5. **权限控制** - 路由保护、功能权限
6. **社交登录** - OAuth集成
7. **双因素认证** - 2FA设置和验证
8. **安全措施** - 防暴力破解、CSRF保护

### 测试策略：
```javascript
// Mock认证服务
const mockAuthService = {
  login: jest.fn(),
  logout: jest.fn(),
  register: jest.fn(),
  refreshToken: jest.fn()
};

// 测试登录流程
describe('登录流程', () => {
  test('成功登录应该跳转到仪表盘', async () => {
    mockAuthService.login.mockResolvedValue({
      user: { id: 1, email: 'test@example.com' },
      token: 'mock-token'
    });
    
    const { user } = render(<LoginPage />);
    
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /login/i }));
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });
  
  test('登录失败应该显示错误信息', async () => {
    mockAuthService.login.mockRejectedValue(
      new Error('Invalid credentials')
    );
    
    // 测试错误处理...
  });
});
```

### 测试重点：
- 表单验证规则
- 错误信息显示
- Loading状态
- Token存储和刷新
- 路由重定向
- 会话过期处理

### 端到端测试：
```javascript
// 使用Cypress进行E2E测试
describe('用户认证E2E', () => {
  it('新用户完整注册流程', () => {
    cy.visit('/register');
    
    // 填写注册表单
    cy.get('[data-testid="email"]').type('newuser@example.com');
    cy.get('[data-testid="password"]').type('SecurePass123!');
    cy.get('[data-testid="confirm-password"]').type('SecurePass123!');
    
    // 提交并验证
    cy.get('[data-testid="register-button"]').click();
    cy.url().should('include', '/verify-email');
    
    // 模拟邮件验证
    cy.visit('/verify-email?token=mock-token');
    cy.url().should('include', '/dashboard');
  });
});
```

## 练习3：实时协作应用测试

测试一个包含WebSocket的实时协作编辑器：

### 功能要求：
1. **实时同步** - 多用户编辑同步
2. **冲突解决** - 并发编辑处理
3. **离线支持** - 断线重连、本地缓存
4. **协作功能** - 光标位置、选区显示
5. **版本控制** - 历史记录、回滚
6. **权限管理** - 编辑、只读权限
7. **性能优化** - 增量更新、防抖
8. **通知系统** - 用户上下线、编辑提醒

### WebSocket Mock：
```javascript
// Mock WebSocket
class MockWebSocket {
  constructor(url) {
    this.url = url;
    this.readyState = WebSocket.CONNECTING;
    this.onopen = null;
    this.onmessage = null;
    this.onclose = null;
    this.onerror = null;
    
    setTimeout(() => {
      this.readyState = WebSocket.OPEN;
      this.onopen?.({ type: 'open' });
    }, 100);
  }
  
  send(data) {
    // 模拟服务器响应
    setTimeout(() => {
      this.onmessage?.({
        type: 'message',
        data: JSON.stringify({
          type: 'update',
          content: JSON.parse(data).content
        })
      });
    }, 50);
  }
  
  close() {
    this.readyState = WebSocket.CLOSED;
    this.onclose?.({ type: 'close' });
  }
}

global.WebSocket = MockWebSocket;
```

### 测试实时功能：
```javascript
describe('CollaborativeEditor', () => {
  test('应该同步多用户编辑', async () => {
    const { user } = render(<CollaborativeEditor roomId="test-room" />);
    
    // 等待连接
    await screen.findByText(/connected/i);
    
    // 用户1编辑
    const editor = screen.getByRole('textbox');
    await user.type(editor, 'Hello World');
    
    // 验证发送消息
    await waitFor(() => {
      expect(mockWebSocket.send).toHaveBeenCalledWith(
        JSON.stringify({
          type: 'edit',
          content: 'Hello World',
          position: expect.any(Number)
        })
      );
    });
    
    // 模拟其他用户编辑
    act(() => {
      mockWebSocket.onmessage({
        data: JSON.stringify({
          type: 'edit',
          userId: 'user2',
          content: 'Hi there!',
          position: 0
        })
      });
    });
    
    // 验证内容更新
    expect(editor).toHaveValue('Hi there!Hello World');
  });
  
  test('应该处理断线重连', async () => {
    render(<CollaborativeEditor roomId="test-room" />);
    
    // 模拟断线
    act(() => {
      mockWebSocket.close();
    });
    
    expect(screen.getByText(/reconnecting/i)).toBeInTheDocument();
    
    // 验证重连
    await waitFor(() => {
      expect(screen.getByText(/connected/i)).toBeInTheDocument();
    });
  });
});
```

### 性能测试：
```javascript
test('应该高效处理大量并发更新', async () => {
  const { rerender } = render(<CollaborativeEditor roomId="test-room" />);
  
  // 模拟100个快速更新
  const updates = Array.from({ length: 100 }, (_, i) => ({
    type: 'edit',
    content: `Update ${i}`,
    userId: `user${i % 10}`
  }));
  
  const startTime = performance.now();
  
  updates.forEach(update => {
    act(() => {
      mockWebSocket.onmessage({
        data: JSON.stringify(update)
      });
    });
  });
  
  const endTime = performance.now();
  
  // 应该在100ms内处理完所有更新
  expect(endTime - startTime).toBeLessThan(100);
  
  // 验证防抖工作
  expect(screen.getAllByText(/Update/i)).toHaveLength(10); // 应该批量更新
});
```

## 测试最佳实践

### 组织测试文件：
```
src/
  components/
    ShoppingCart/
      ShoppingCart.jsx
      ShoppingCart.test.jsx
      __tests__/
        ShoppingCart.integration.test.jsx
        ShoppingCart.accessibility.test.jsx
      __mocks__/
        cartService.js
```

### 测试工具配置：
```javascript
// setupTests.js
import '@testing-library/jest-dom';
import { server } from './mocks/server';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// 全局Mock
window.matchMedia = jest.fn().mockImplementation(query => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: jest.fn(),
  removeListener: jest.fn(),
}));
```

### 自定义测试工具：
```javascript
// test-utils.js
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';

export function renderWithProviders(
  ui,
  {
    preloadedState = {},
    store = configureStore({ reducer: rootReducer, preloadedState }),
    ...renderOptions
  } = {}
) {
  function Wrapper({ children }) {
    return (
      <Provider store={store}>
        <BrowserRouter>
          {children}
        </BrowserRouter>
      </Provider>
    );
  }
  
  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}
```

## 提交要求

1. 每个练习包含完整的测试套件
2. 达到指定的代码覆盖率
3. 包含测试运行截图
4. 提供测试策略文档
5. 实现CI/CD集成配置

## 测试检查清单

- [ ] 所有happy path测试通过
- [ ] 错误场景充分覆盖
- [ ] 边界条件测试完整
- [ ] 异步操作正确处理
- [ ] Mock使用合理
- [ ] 测试可读性良好
- [ ] 运行速度合理
- [ ] 无测试间依赖

## 加分项

- 实现视觉回归测试
- 添加性能基准测试
- 创建测试数据生成器
- 实现契约测试
- 添加可访问性测试

记住：好的测试应该给你重构代码的信心。测试不是为了达到100%覆盖率，而是为了确保关键功能的可靠性！