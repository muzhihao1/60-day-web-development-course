---
day: 35
exerciseTitle: "测试React应用练习"
approach: "使用Jest和React Testing Library编写全面的测试套件，涵盖单元测试、集成测试和E2E测试，确保代码质量和可维护性"
keyTakeaways:
  - "测试用户行为而非实现"
  - "合理使用Mock和测试隔离"
  - "编写可读可维护的测试"
  - "达到合理的测试覆盖率"
  - "集成到CI/CD流程"
commonMistakes:
  - "过度Mock导致测试脆弱"
  - "测试实现细节而非行为"
  - "忽略异步测试处理"
  - "测试之间相互依赖"
extensions:
  - "添加视觉回归测试"
  - "实现性能测试基准"
  - "创建测试报告仪表板"
  - "集成代码质量工具"
files:
  - name: "ShoppingCart.test.jsx"
    description: "购物车组件完整单元测试"
    code: |
      import React from 'react';
      import { render, screen, waitFor } from '@testing-library/react';
      import userEvent from '@testing-library/user-event';
      import { renderHook, act } from '@testing-library/react';
      import ShoppingCart, { useCart, useLocalStorage, CartProvider } from './ShoppingCart';

      // Mock localStorage
      const localStorageMock = {
        getItem: jest.fn(),
        setItem: jest.fn(),
        clear: jest.fn(),
        removeItem: jest.fn()
      };
      global.localStorage = localStorageMock;

      // 测试数据
      const mockProducts = [
        {
          id: 1,
          name: 'React课程',
          price: 99.99,
          stock: 10,
          maxPerCustomer: 3,
          category: 'course'
        },
        {
          id: 2,
          name: 'TypeScript教程',
          price: 79.99,
          stock: 5,
          maxPerCustomer: 2,
          category: 'course'
        },
        {
          id: 3,
          name: '测试指南',
          price: 49.99,
          stock: 0,
          category: 'book'
        }
      ];

      describe('ShoppingCart Component', () => {
        beforeEach(() => {
          localStorageMock.getItem.mockClear();
          localStorageMock.setItem.mockClear();
        });

        describe('商品管理功能', () => {
          test('应该正确渲染空购物车', () => {
            render(
              <CartProvider>
                <ShoppingCart products={mockProducts} />
              </CartProvider>
            );

            expect(screen.getByText(/购物车为空/i)).toBeInTheDocument();
            expect(screen.getByText(/开始购物/i)).toBeInTheDocument();
          });

          test('应该添加商品到购物车', async () => {
            const user = userEvent.setup();
            
            render(
              <CartProvider>
                <ShoppingCart products={mockProducts} />
              </CartProvider>
            );

            const addButton = screen.getByRole('button', { 
              name: /添加React课程/i 
            });
            await user.click(addButton);

            expect(screen.getByText('React课程')).toBeInTheDocument();
            expect(screen.getByText('$99.99')).toBeInTheDocument();
            expect(screen.getByLabelText(/数量/i)).toHaveValue(1);
          });

          test('应该更新商品数量', async () => {
            const user = userEvent.setup();
            
            render(
              <CartProvider>
                <ShoppingCart products={mockProducts} />
              </CartProvider>
            );

            // 添加商品
            await user.click(screen.getByRole('button', { 
              name: /添加React课程/i 
            }));

            // 增加数量
            const quantityInput = screen.getByLabelText(/数量/i);
            await user.clear(quantityInput);
            await user.type(quantityInput, '2');

            expect(quantityInput).toHaveValue(2);
            expect(screen.getByText('$199.98')).toBeInTheDocument();
          });

          test('应该删除商品', async () => {
            const user = userEvent.setup();
            
            render(
              <CartProvider>
                <ShoppingCart products={mockProducts} />
              </CartProvider>
            );

            // 添加商品
            await user.click(screen.getByRole('button', { 
              name: /添加React课程/i 
            }));

            // 删除商品
            await user.click(screen.getByRole('button', { 
              name: /删除/i 
            }));

            expect(screen.getByText(/购物车为空/i)).toBeInTheDocument();
          });

          test('应该处理重复添加商品', async () => {
            const user = userEvent.setup();
            
            render(
              <CartProvider>
                <ShoppingCart products={mockProducts} />
              </CartProvider>
            );

            const addButton = screen.getByRole('button', { 
              name: /添加React课程/i 
            });
            
            // 添加两次
            await user.click(addButton);
            await user.click(addButton);

            // 应该增加数量而不是重复项
            const quantityInputs = screen.getAllByLabelText(/数量/i);
            expect(quantityInputs).toHaveLength(1);
            expect(quantityInputs[0]).toHaveValue(2);
          });
        });

        describe('价格计算功能', () => {
          test('应该正确计算商品小计', async () => {
            const user = userEvent.setup();
            
            render(
              <CartProvider>
                <ShoppingCart products={mockProducts} />
              </CartProvider>
            );

            // 添加多个商品
            await user.click(screen.getByRole('button', { 
              name: /添加React课程/i 
            }));
            await user.click(screen.getByRole('button', { 
              name: /添加TypeScript教程/i 
            }));

            expect(screen.getByText(/小计.*\$179\.98/)).toBeInTheDocument();
          });

          test('应该正确应用税费', async () => {
            const user = userEvent.setup();
            
            render(
              <CartProvider>
                <ShoppingCart products={mockProducts} taxRate={0.08} />
              </CartProvider>
            );

            await user.click(screen.getByRole('button', { 
              name: /添加React课程/i 
            }));

            expect(screen.getByText(/税费.*\$8\.00/)).toBeInTheDocument();
            expect(screen.getByText(/总计.*\$107\.99/)).toBeInTheDocument();
          });

          test('应该应用优惠券折扣', async () => {
            const user = userEvent.setup();
            
            render(
              <CartProvider>
                <ShoppingCart products={mockProducts} />
              </CartProvider>
            );

            // 添加商品
            await user.click(screen.getByRole('button', { 
              name: /添加React课程/i 
            }));

            // 输入优惠券
            const couponInput = screen.getByPlaceholderText(/优惠券代码/i);
            await user.type(couponInput, 'SAVE20');
            await user.click(screen.getByRole('button', { name: /应用/i }));

            expect(screen.getByText(/折扣.*-\$20\.00/)).toBeInTheDocument();
            expect(screen.getByText(/节省了.*\$20\.00/)).toBeInTheDocument();
          });

          test('应该验证无效优惠券', async () => {
            const user = userEvent.setup();
            
            render(
              <CartProvider>
                <ShoppingCart products={mockProducts} />
              </CartProvider>
            );

            await user.click(screen.getByRole('button', { 
              name: /添加React课程/i 
            }));

            const couponInput = screen.getByPlaceholderText(/优惠券代码/i);
            await user.type(couponInput, 'INVALID');
            await user.click(screen.getByRole('button', { name: /应用/i }));

            expect(screen.getByText(/无效的优惠券/i)).toBeInTheDocument();
          });
        });

        describe('库存验证功能', () => {
          test('应该禁用缺货商品的添加按钮', () => {
            render(
              <CartProvider>
                <ShoppingCart products={mockProducts} />
              </CartProvider>
            );

            const outOfStockButton = screen.getByRole('button', { 
              name: /添加测试指南/i 
            });
            
            expect(outOfStockButton).toBeDisabled();
            expect(screen.getByText(/缺货/i)).toBeInTheDocument();
          });

          test('应该限制最大购买数量', async () => {
            const user = userEvent.setup();
            
            render(
              <CartProvider>
                <ShoppingCart products={mockProducts} />
              </CartProvider>
            );

            await user.click(screen.getByRole('button', { 
              name: /添加React课程/i 
            }));

            const quantityInput = screen.getByLabelText(/数量/i);
            await user.clear(quantityInput);
            await user.type(quantityInput, '5'); // 超过限制

            expect(screen.getByText(/最多购买3件/i)).toBeInTheDocument();
            expect(quantityInput).toHaveValue(3);
          });

          test('应该检查库存可用性', async () => {
            const user = userEvent.setup();
            
            render(
              <CartProvider>
                <ShoppingCart products={mockProducts} />
              </CartProvider>
            );

            await user.click(screen.getByRole('button', { 
              name: /添加TypeScript教程/i 
            }));

            const quantityInput = screen.getByLabelText(/数量/i);
            await user.clear(quantityInput);
            await user.type(quantityInput, '10'); // 超过库存

            expect(screen.getByText(/库存不足/i)).toBeInTheDocument();
          });
        });

        describe('批量操作功能', () => {
          test('应该全选所有商品', async () => {
            const user = userEvent.setup();
            
            render(
              <CartProvider>
                <ShoppingCart products={mockProducts} />
              </CartProvider>
            );

            // 添加多个商品
            await user.click(screen.getByRole('button', { 
              name: /添加React课程/i 
            }));
            await user.click(screen.getByRole('button', { 
              name: /添加TypeScript教程/i 
            }));

            // 全选
            await user.click(screen.getByRole('checkbox', { 
              name: /全选/i 
            }));

            const checkboxes = screen.getAllByRole('checkbox', { 
              name: /选择商品/i 
            });
            checkboxes.forEach(checkbox => {
              expect(checkbox).toBeChecked();
            });
          });

          test('应该批量删除选中商品', async () => {
            const user = userEvent.setup();
            
            render(
              <CartProvider>
                <ShoppingCart products={mockProducts} />
              </CartProvider>
            );

            // 添加商品
            await user.click(screen.getByRole('button', { 
              name: /添加React课程/i 
            }));
            await user.click(screen.getByRole('button', { 
              name: /添加TypeScript教程/i 
            }));

            // 选择并删除
            await user.click(screen.getByRole('checkbox', { 
              name: /全选/i 
            }));
            await user.click(screen.getByRole('button', { 
              name: /批量删除/i 
            }));

            expect(screen.getByText(/购物车为空/i)).toBeInTheDocument();
          });
        });

        describe('本地存储功能', () => {
          test('应该保存购物车到localStorage', async () => {
            const user = userEvent.setup();
            
            render(
              <CartProvider>
                <ShoppingCart products={mockProducts} />
              </CartProvider>
            );

            await user.click(screen.getByRole('button', { 
              name: /添加React课程/i 
            }));

            expect(localStorageMock.setItem).toHaveBeenCalledWith(
              'shopping-cart',
              expect.stringContaining('React课程')
            );
          });

          test('应该从localStorage恢复购物车', () => {
            const savedCart = {
              items: [{
                product: mockProducts[0],
                quantity: 2
              }],
              coupon: null
            };

            localStorageMock.getItem.mockReturnValue(
              JSON.stringify(savedCart)
            );

            render(
              <CartProvider>
                <ShoppingCart products={mockProducts} />
              </CartProvider>
            );

            expect(screen.getByText('React课程')).toBeInTheDocument();
            expect(screen.getByLabelText(/数量/i)).toHaveValue(2);
          });

          test('应该处理损坏的localStorage数据', () => {
            localStorageMock.getItem.mockReturnValue('invalid json');

            render(
              <CartProvider>
                <ShoppingCart products={mockProducts} />
              </CartProvider>
            );

            expect(screen.getByText(/购物车为空/i)).toBeInTheDocument();
          });
        });

        describe('商品推荐功能', () => {
          test('应该基于购物车显示推荐商品', async () => {
            const user = userEvent.setup();
            
            render(
              <CartProvider>
                <ShoppingCart products={mockProducts} />
              </CartProvider>
            );

            await user.click(screen.getByRole('button', { 
              name: /添加React课程/i 
            }));

            expect(screen.getByText(/推荐商品/i)).toBeInTheDocument();
            expect(screen.getByText(/TypeScript教程/i)).toBeInTheDocument();
          });
        });
      });

      describe('useCart Hook', () => {
        test('应该初始化空购物车', () => {
          const { result } = renderHook(() => useCart(), {
            wrapper: CartProvider
          });

          expect(result.current.items).toEqual([]);
          expect(result.current.total).toBe(0);
          expect(result.current.itemCount).toBe(0);
        });

        test('应该添加商品到购物车', () => {
          const { result } = renderHook(() => useCart(), {
            wrapper: CartProvider
          });

          act(() => {
            result.current.addItem(mockProducts[0]);
          });

          expect(result.current.items).toHaveLength(1);
          expect(result.current.items[0].product.id).toBe(1);
          expect(result.current.items[0].quantity).toBe(1);
        });

        test('应该更新商品数量', () => {
          const { result } = renderHook(() => useCart(), {
            wrapper: CartProvider
          });

          act(() => {
            result.current.addItem(mockProducts[0]);
            result.current.updateQuantity(1, 3);
          });

          expect(result.current.items[0].quantity).toBe(3);
          expect(result.current.total).toBe(299.97);
        });

        test('应该删除商品', () => {
          const { result } = renderHook(() => useCart(), {
            wrapper: CartProvider
          });

          act(() => {
            result.current.addItem(mockProducts[0]);
            result.current.removeItem(1);
          });

          expect(result.current.items).toHaveLength(0);
        });

        test('应该应用优惠券', () => {
          const { result } = renderHook(() => useCart(), {
            wrapper: CartProvider
          });

          act(() => {
            result.current.addItem(mockProducts[0]);
            result.current.applyCoupon('SAVE20');
          });

          expect(result.current.discount).toBe(20);
          expect(result.current.total).toBe(79.99);
        });

        test('应该清空购物车', () => {
          const { result } = renderHook(() => useCart(), {
            wrapper: CartProvider
          });

          act(() => {
            result.current.addItem(mockProducts[0]);
            result.current.addItem(mockProducts[1]);
            result.current.clearCart();
          });

          expect(result.current.items).toHaveLength(0);
          expect(result.current.total).toBe(0);
        });

        test('应该计算正确的商品数量', () => {
          const { result } = renderHook(() => useCart(), {
            wrapper: CartProvider
          });

          act(() => {
            result.current.addItem(mockProducts[0]);
            result.current.updateQuantity(1, 3);
            result.current.addItem(mockProducts[1]);
            result.current.updateQuantity(2, 2);
          });

          expect(result.current.itemCount).toBe(5);
        });
      });

      describe('useLocalStorage Hook', () => {
        beforeEach(() => {
          localStorageMock.getItem.mockClear();
          localStorageMock.setItem.mockClear();
        });

        test('应该使用初始值', () => {
          localStorageMock.getItem.mockReturnValue(null);

          const { result } = renderHook(() => 
            useLocalStorage('test-key', 'initial value')
          );

          expect(result.current[0]).toBe('initial value');
        });

        test('应该读取存储的值', () => {
          localStorageMock.getItem.mockReturnValue('"stored value"');

          const { result } = renderHook(() => 
            useLocalStorage('test-key', 'initial value')
          );

          expect(result.current[0]).toBe('stored value');
        });

        test('应该保存新值到localStorage', () => {
          const { result } = renderHook(() => 
            useLocalStorage('test-key', 'initial')
          );

          act(() => {
            result.current[1]('new value');
          });

          expect(localStorageMock.setItem).toHaveBeenCalledWith(
            'test-key',
            '"new value"'
          );
          expect(result.current[0]).toBe('new value');
        });

        test('应该处理复杂对象', () => {
          const complexObject = {
            user: 'john',
            cart: ['item1', 'item2']
          };

          const { result } = renderHook(() => 
            useLocalStorage('test-key', {})
          );

          act(() => {
            result.current[1](complexObject);
          });

          expect(localStorageMock.setItem).toHaveBeenCalledWith(
            'test-key',
            JSON.stringify(complexObject)
          );
        });

        test('应该处理JSON解析错误', () => {
          localStorageMock.getItem.mockReturnValue('invalid json');
          const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

          const { result } = renderHook(() => 
            useLocalStorage('test-key', 'fallback')
          );

          expect(result.current[0]).toBe('fallback');
          expect(consoleSpy).toHaveBeenCalled();

          consoleSpy.mockRestore();
        });
      });

      describe('无障碍性测试', () => {
        test('应该有正确的ARIA标签', () => {
          render(
            <CartProvider>
              <ShoppingCart products={mockProducts} />
            </CartProvider>
          );

          expect(screen.getByRole('region', { 
            name: /购物车/i 
          })).toBeInTheDocument();
          
          expect(screen.getByRole('list', { 
            name: /商品列表/i 
          })).toBeInTheDocument();
        });

        test('应该支持键盘导航', async () => {
          const user = userEvent.setup();
          
          render(
            <CartProvider>
              <ShoppingCart products={mockProducts} />
            </CartProvider>
          );

          await user.tab();
          expect(screen.getByRole('button', { 
            name: /添加React课程/i 
          })).toHaveFocus();

          await user.keyboard('{Enter}');
          expect(screen.getByText('React课程')).toBeInTheDocument();
        });
      });

  - name: "AuthFlow.test.jsx"
    description: "用户认证流程集成测试"
    code: |
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

  - name: "TaskManager.e2e.test.js"
    description: "任务管理应用E2E测试"
    code: |
      // cypress/e2e/task-manager.cy.js
      describe('任务管理应用E2E测试', () => {
        // 测试数据
        const testUser = {
          email: 'e2e@example.com',
          password: 'e2ePassword123!',
          name: 'E2E Test User'
        };

        const testProject = {
          name: 'E2E测试项目',
          description: '用于E2E测试的项目'
        };

        beforeEach(() => {
          // 重置数据库
          cy.task('db:reset');
          
          // 创建测试用户
          cy.task('db:seed', { users: [testUser] });
          
          // 访问应用
          cy.visit('/');
        });

        describe('用户认证', () => {
          it('应该完成注册-登录-登出流程', () => {
            // 注册新用户
            cy.get('[data-testid="register-link"]').click();
            cy.get('[data-testid="name-input"]').type('New User');
            cy.get('[data-testid="email-input"]').type('newuser@example.com');
            cy.get('[data-testid="password-input"]').type('NewPassword123!');
            cy.get('[data-testid="confirm-password-input"]').type('NewPassword123!');
            cy.get('[data-testid="register-button"]').click();

            // 验证注册成功
            cy.url().should('include', '/dashboard');
            cy.contains('欢迎, New User').should('be.visible');

            // 登出
            cy.get('[data-testid="user-menu"]').click();
            cy.get('[data-testid="logout-button"]').click();
            cy.url().should('include', '/login');

            // 重新登录
            cy.get('[data-testid="email-input"]').type('newuser@example.com');
            cy.get('[data-testid="password-input"]').type('NewPassword123!');
            cy.get('[data-testid="login-button"]').click();

            cy.url().should('include', '/dashboard');
          });

          it('应该记住用户登录状态', () => {
            cy.login(testUser.email, testUser.password);
            
            // 刷新页面
            cy.reload();
            
            // 应该仍然登录
            cy.url().should('include', '/dashboard');
            cy.contains(testUser.name).should('be.visible');
          });
        });

        describe('项目管理', () => {
          beforeEach(() => {
            cy.login(testUser.email, testUser.password);
          });

          it('应该创建新项目', () => {
            cy.get('[data-testid="create-project-button"]').click();
            
            // 填写项目信息
            cy.get('[data-testid="project-name-input"]').type(testProject.name);
            cy.get('[data-testid="project-description-input"]').type(testProject.description);
            cy.get('[data-testid="project-color-picker"]').click();
            cy.get('[data-color="#3b82f6"]').click();
            
            // 提交
            cy.get('[data-testid="save-project-button"]').click();
            
            // 验证项目创建
            cy.contains(testProject.name).should('be.visible');
            cy.get('[data-testid="project-card"]').should('have.length', 1);
          });

          it('应该邀请团队成员', () => {
            // 创建项目
            cy.createProject(testProject);
            
            // 进入项目
            cy.contains(testProject.name).click();
            
            // 打开成员管理
            cy.get('[data-testid="project-settings"]').click();
            cy.get('[data-testid="members-tab"]').click();
            
            // 邀请成员
            cy.get('[data-testid="invite-member-input"]').type('member@example.com');
            cy.get('[data-testid="role-select"]').select('编辑者');
            cy.get('[data-testid="invite-button"]').click();
            
            // 验证邀请发送
            cy.contains('邀请已发送').should('be.visible');
            cy.get('[data-testid="pending-invite"]').should('contain', 'member@example.com');
          });
        });

        describe('任务工作流', () => {
          beforeEach(() => {
            cy.login(testUser.email, testUser.password);
            cy.createProject(testProject);
          });

          it('应该完成创建-分配-完成任务流程', () => {
            // 进入项目
            cy.contains(testProject.name).click();
            
            // 创建任务
            cy.get('[data-testid="add-task-button"]').click();
            cy.get('[data-testid="task-title-input"]').type('E2E测试任务');
            cy.get('[data-testid="task-description-input"]').type('这是一个E2E测试任务');
            cy.get('[data-testid="priority-select"]').select('高');
            cy.get('[data-testid="due-date-input"]').type('2024-12-31');
            cy.get('[data-testid="save-task-button"]').click();
            
            // 验证任务创建
            cy.get('[data-testid="task-card"]').should('contain', 'E2E测试任务');
            
            // 分配任务
            cy.get('[data-testid="task-card"]').first().click();
            cy.get('[data-testid="assignee-select"]').click();
            cy.get('[data-testid="assignee-option"]').first().click();
            
            // 添加标签
            cy.get('[data-testid="add-tag-button"]').click();
            cy.get('[data-testid="tag-input"]').type('测试{enter}');
            
            // 更新状态
            cy.get('[data-testid="status-select"]').select('进行中');
            cy.contains('任务已更新').should('be.visible');
            
            // 添加评论
            cy.get('[data-testid="comment-input"]').type('开始处理这个任务');
            cy.get('[data-testid="add-comment-button"]').click();
            
            // 完成任务
            cy.get('[data-testid="status-select"]').select('已完成');
            cy.get('[data-testid="task-completed-badge"]').should('be.visible');
          });

          it('应该支持拖拽排序任务', () => {
            // 创建多个任务
            const tasks = ['任务1', '任务2', '任务3'];
            tasks.forEach(task => {
              cy.createTask({ title: task, projectId: testProject.id });
            });
            
            // 刷新以加载任务
            cy.reload();
            
            // 拖拽第三个任务到第一位
            cy.get('[data-testid="task-card"]').eq(2).as('draggedTask');
            cy.get('[data-testid="task-card"]').eq(0).as('targetTask');
            
            cy.get('@draggedTask').drag('@targetTask', {
              source: { x: 10, y: 10 },
              target: { position: 'top' }
            });
            
            // 验证新顺序
            cy.get('[data-testid="task-card"]').first().should('contain', '任务3');
          });
        });

        describe('实时协作', () => {
          it('应该实时同步任务更新', () => {
            cy.login(testUser.email, testUser.password);
            cy.createProject(testProject);
            cy.contains(testProject.name).click();
            
            // 在第一个标签页创建任务
            cy.createTask({ 
              title: '实时同步测试', 
              projectId: testProject.id 
            });
            
            // 打开第二个标签页
            cy.window().then(win => {
              cy.stub(win, 'open').as('newWindow');
            });
            
            cy.visit(`/projects/${testProject.id}`, { 
              onBeforeLoad(win) {
                // 模拟第二个用户
                win.sessionStorage.setItem('userId', 'user2');
              }
            });
            
            // 验证任务在第二个标签页可见
            cy.contains('实时同步测试').should('be.visible');
            
            // 在原标签页更新任务
            cy.window().then(win => {
              win.sessionStorage.setItem('userId', 'user1');
            });
            
            cy.get('[data-testid="task-card"]').first().click();
            cy.get('[data-testid="status-select"]').select('进行中');
            
            // 切换到第二个标签页验证更新
            cy.window().then(win => {
              win.sessionStorage.setItem('userId', 'user2');
            });
            cy.reload();
            
            cy.get('[data-testid="task-status"]').should('contain', '进行中');
          });

          it('应该显示其他用户的实时光标', () => {
            // 模拟多用户环境
            cy.login(testUser.email, testUser.password);
            cy.visit('/projects/shared-board');
            
            // 模拟其他用户的光标移动
            cy.window().then(win => {
              win.dispatchEvent(new CustomEvent('remote-cursor', {
                detail: {
                  userId: 'other-user',
                  x: 200,
                  y: 300,
                  name: 'Other User'
                }
              }));
            });
            
            // 验证远程光标显示
            cy.get('[data-testid="remote-cursor-other-user"]').should('be.visible');
            cy.get('[data-testid="remote-cursor-other-user"]').should(
              'have.css', 
              'transform', 
              'matrix(1, 0, 0, 1, 200, 300)'
            );
          });
        });

        describe('文件管理', () => {
          beforeEach(() => {
            cy.login(testUser.email, testUser.password);
            cy.createProject(testProject);
            cy.createTask({ 
              title: '文件测试任务', 
              projectId: testProject.id 
            });
          });

          it('应该上传和预览文件', () => {
            cy.contains('文件测试任务').click();
            
            // 上传文件
            const fileName = 'test-document.pdf';
            cy.fixture(fileName).then(fileContent => {
              cy.get('[data-testid="file-upload"]').attachFile({
                fileContent: fileContent.toString(),
                fileName: fileName,
                mimeType: 'application/pdf'
              });
            });
            
            // 验证上传成功
            cy.contains(fileName).should('be.visible');
            cy.get('[data-testid="file-size"]').should('contain', 'KB');
            
            // 预览文件
            cy.get('[data-testid="preview-button"]').click();
            cy.get('[data-testid="file-preview-modal"]').should('be.visible');
            
            // 下载文件
            cy.get('[data-testid="download-button"]').click();
            cy.readFile(`cypress/downloads/${fileName}`).should('exist');
          });

          it('应该支持拖拽上传多个文件', () => {
            cy.contains('文件测试任务').click();
            
            const files = ['image1.png', 'image2.jpg', 'document.txt'];
            
            cy.get('[data-testid="dropzone"]').selectFiles(
              files.map(f => `cypress/fixtures/${f}`),
              { action: 'drag-drop' }
            );
            
            // 验证所有文件上传
            files.forEach(file => {
              cy.contains(file).should('be.visible');
            });
            
            // 验证文件数量
            cy.get('[data-testid="file-list-item"]').should('have.length', 3);
          });
        });

        describe('搜索和过滤', () => {
          beforeEach(() => {
            cy.login(testUser.email, testUser.password);
            cy.createProject(testProject);
            
            // 创建多个任务用于测试
            const tasks = [
              { title: '紧急Bug修复', priority: '高', status: '进行中' },
              { title: '新功能开发', priority: '中', status: '待办' },
              { title: '代码重构', priority: '低', status: '待办' },
              { title: '文档更新', priority: '低', status: '已完成' }
            ];
            
            tasks.forEach(task => {
              cy.createTask({ ...task, projectId: testProject.id });
            });
          });

          it('应该搜索任务', () => {
            cy.visit(`/projects/${testProject.id}`);
            
            // 搜索关键词
            cy.get('[data-testid="search-input"]').type('Bug');
            
            // 验证搜索结果
            cy.get('[data-testid="task-card"]').should('have.length', 1);
            cy.contains('紧急Bug修复').should('be.visible');
            
            // 清空搜索
            cy.get('[data-testid="search-clear"]').click();
            cy.get('[data-testid="task-card"]').should('have.length', 4);
          });

          it('应该按多个条件过滤', () => {
            cy.visit(`/projects/${testProject.id}`);
            
            // 按优先级过滤
            cy.get('[data-testid="priority-filter"]').click();
            cy.get('[data-testid="priority-high"]').click();
            cy.get('[data-testid="task-card"]').should('have.length', 1);
            
            // 添加状态过滤
            cy.get('[data-testid="status-filter"]').click();
            cy.get('[data-testid="status-in-progress"]').click();
            cy.get('[data-testid="task-card"]').should('have.length', 1);
            cy.contains('紧急Bug修复').should('be.visible');
            
            // 保存过滤器
            cy.get('[data-testid="save-filter-button"]').click();
            cy.get('[data-testid="filter-name-input"]').type('高优先级进行中');
            cy.get('[data-testid="confirm-save-filter"]').click();
            
            // 验证保存的过滤器
            cy.get('[data-testid="saved-filters"]').click();
            cy.contains('高优先级进行中').should('be.visible');
          });
        });

        describe('批量操作', () => {
          beforeEach(() => {
            cy.login(testUser.email, testUser.password);
            cy.createProject(testProject);
            
            // 创建多个任务
            for (let i = 1; i <= 5; i++) {
              cy.createTask({ 
                title: `批量测试任务 ${i}`, 
                projectId: testProject.id 
              });
            }
          });

          it('应该批量更新任务状态', () => {
            cy.visit(`/projects/${testProject.id}`);
            
            // 进入批量选择模式
            cy.get('[data-testid="bulk-select-toggle"]').click();
            
            // 选择前三个任务
            cy.get('[data-testid="task-checkbox"]').eq(0).click();
            cy.get('[data-testid="task-checkbox"]').eq(1).click();
            cy.get('[data-testid="task-checkbox"]').eq(2).click();
            
            // 批量更新状态
            cy.get('[data-testid="bulk-actions-menu"]').click();
            cy.get('[data-testid="bulk-update-status"]').click();
            cy.get('[data-testid="status-select-bulk"]').select('进行中');
            cy.get('[data-testid="apply-bulk-update"]').click();
            
            // 验证更新
            cy.get('[data-testid="task-status"]').then($statuses => {
              expect($statuses.eq(0).text()).to.contain('进行中');
              expect($statuses.eq(1).text()).to.contain('进行中');
              expect($statuses.eq(2).text()).to.contain('进行中');
            });
          });

          it('应该批量分配任务', () => {
            // 添加团队成员
            cy.addTeamMember('member@example.com', testProject.id);
            
            cy.visit(`/projects/${testProject.id}`);
            
            // 选择所有任务
            cy.get('[data-testid="select-all-checkbox"]').click();
            
            // 批量分配
            cy.get('[data-testid="bulk-actions-menu"]').click();
            cy.get('[data-testid="bulk-assign"]').click();
            cy.get('[data-testid="assignee-select-bulk"]').select('member@example.com');
            cy.get('[data-testid="apply-bulk-assign"]').click();
            
            // 验证分配
            cy.get('[data-testid="task-assignee"]').each($el => {
              expect($el.text()).to.contain('member@example.com');
            });
          });
        });

        describe('通知系统', () => {
          it('应该接收实时通知', () => {
            cy.login(testUser.email, testUser.password);
            
            // 模拟接收通知
            cy.window().then(win => {
              win.postMessage({
                type: 'notification',
                data: {
                  id: 'notif-1',
                  title: '新任务分配',
                  message: '您被分配了一个新任务',
                  type: 'task_assigned'
                }
              }, '*');
            });
            
            // 验证通知显示
            cy.get('[data-testid="notification-toast"]').should('be.visible');
            cy.contains('新任务分配').should('be.visible');
            
            // 点击通知
            cy.get('[data-testid="notification-toast"]').click();
            cy.url().should('include', '/tasks');
          });

          it('应该管理通知偏好', () => {
            cy.login(testUser.email, testUser.password);
            cy.visit('/settings/notifications');
            
            // 配置通知偏好
            cy.get('[data-testid="email-notifications"]').uncheck();
            cy.get('[data-testid="push-notifications"]').check();
            cy.get('[data-testid="notification-sound"]').uncheck();
            
            // 选择特定通知类型
            cy.get('[data-testid="notify-task-assigned"]').check();
            cy.get('[data-testid="notify-comment-mention"]').check();
            cy.get('[data-testid="notify-due-date"]').uncheck();
            
            // 保存设置
            cy.get('[data-testid="save-notification-settings"]').click();
            cy.contains('设置已保存').should('be.visible');
            
            // 验证设置持久化
            cy.reload();
            cy.get('[data-testid="email-notifications"]').should('not.be.checked');
            cy.get('[data-testid="push-notifications"]').should('be.checked');
          });
        });

        describe('性能测试', () => {
          it('应该快速加载大量任务', () => {
            cy.login(testUser.email, testUser.password);
            
            // 创建包含大量任务的项目
            cy.task('db:seed', {
              projects: [{ ...testProject, taskCount: 1000 }]
            });
            
            // 测量加载时间
            cy.visit(`/projects/${testProject.id}`, {
              onBeforeLoad: (win) => {
                win.performance.mark('tasks-load-start');
              }
            });
            
            // 等待任务加载
            cy.get('[data-testid="task-card"]').should('have.length.at.least', 20);
            
            cy.window().then(win => {
              win.performance.mark('tasks-load-end');
              win.performance.measure(
                'tasks-load-time',
                'tasks-load-start',
                'tasks-load-end'
              );
              
              const measure = win.performance.getEntriesByName('tasks-load-time')[0];
              expect(measure.duration).to.be.lessThan(2000); // 小于2秒
            });
          });

          it('应该流畅处理实时更新', () => {
            cy.login(testUser.email, testUser.password);
            cy.visit(`/projects/${testProject.id}`);
            
            // 监控帧率
            let frameCount = 0;
            cy.window().then(win => {
              const countFrames = () => {
                frameCount++;
                win.requestAnimationFrame(countFrames);
              };
              win.requestAnimationFrame(countFrames);
            });
            
            // 模拟高频更新
            for (let i = 0; i < 50; i++) {
              cy.window().then(win => {
                win.postMessage({
                  type: 'task-update',
                  data: {
                    id: `task-${i}`,
                    status: ['待办', '进行中', '已完成'][i % 3]
                  }
                }, '*');
              });
              cy.wait(20); // 50fps
            }
            
            // 检查帧率
            cy.wait(1000).then(() => {
              expect(frameCount).to.be.greaterThan(45); // 至少45fps
            });
          });
        });

        describe('错误处理', () => {
          it('应该优雅处理网络错误', () => {
            cy.login(testUser.email, testUser.password);
            
            // 模拟网络断开
            cy.intercept('GET', '/api/tasks', { forceNetworkError: true });
            
            cy.visit(`/projects/${testProject.id}`);
            
            // 验证错误提示
            cy.contains('网络连接失败').should('be.visible');
            cy.get('[data-testid="retry-button"]').should('be.visible');
            
            // 恢复网络并重试
            cy.intercept('GET', '/api/tasks', { 
              body: { tasks: [] } 
            });
            cy.get('[data-testid="retry-button"]').click();
            
            cy.contains('网络连接失败').should('not.exist');
          });

          it('应该处理并发编辑冲突', () => {
            cy.login(testUser.email, testUser.password);
            cy.createTask({ 
              title: '冲突测试任务', 
              projectId: testProject.id 
            });
            
            // 打开任务编辑
            cy.contains('冲突测试任务').click();
            cy.get('[data-testid="edit-task-button"]').click();
            
            // 模拟其他用户的更新
            cy.intercept('PUT', '/api/tasks/*', {
              statusCode: 409,
              body: {
                error: 'Conflict',
                message: '任务已被其他用户更新',
                latestVersion: {
                  title: '冲突测试任务 - 已更新',
                  version: 2
                }
              }
            });
            
            // 尝试保存
            cy.get('[data-testid="task-title-input"]').clear().type('我的更新');
            cy.get('[data-testid="save-task-button"]').click();
            
            // 验证冲突处理
            cy.contains('任务已被其他用户更新').should('be.visible');
            cy.get('[data-testid="merge-changes-button"]').click();
            
            // 验证合并界面
            cy.get('[data-testid="conflict-resolver"]').should('be.visible');
            cy.get('[data-testid="their-version"]').should('contain', '已更新');
            cy.get('[data-testid="your-version"]').should('contain', '我的更新');
          });
        });
      });

      // Cypress命令扩展
      Cypress.Commands.add('login', (email, password) => {
        cy.visit('/login');
        cy.get('[data-testid="email-input"]').type(email);
        cy.get('[data-testid="password-input"]').type(password);
        cy.get('[data-testid="login-button"]').click();
        cy.url().should('include', '/dashboard');
      });

      Cypress.Commands.add('createProject', (project) => {
        cy.request('POST', '/api/projects', project).then(response => {
          expect(response.status).to.eq(201);
          return response.body;
        });
      });

      Cypress.Commands.add('createTask', (task) => {
        cy.request('POST', '/api/tasks', task).then(response => {
          expect(response.status).to.eq(201);
          return response.body;
        });
      });

      Cypress.Commands.add('addTeamMember', (email, projectId) => {
        cy.request('POST', `/api/projects/${projectId}/members`, {
          email,
          role: 'member'
        });
      });

      // 拖拽支持
      Cypress.Commands.add('drag', { prevSubject: 'element' }, 
        (subject, target, options) => {
          cy.wrap(subject)
            .trigger('dragstart', options.source)
            .then(() => {
              cy.get(target)
                .trigger('dragenter', options.target)
                .trigger('dragover', options.target)
                .trigger('drop', options.target);
            });
          
          cy.wrap(subject).trigger('dragend');
        }
      );

  - name: "test-setup.js"
    description: "测试环境配置"
    code: |
      // jest.config.js
      module.exports = {
        testEnvironment: 'jsdom',
        setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
        moduleNameMapper: {
          '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
          '^@/(.*)$': '<rootDir>/src/$1'
        },
        collectCoverageFrom: [
          'src/**/*.{js,jsx}',
          '!src/index.js',
          '!src/reportWebVitals.js',
          '!**/*.stories.js'
        ],
        coverageThreshold: {
          global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80
          }
        },
        testMatch: [
          '<rootDir>/src/**/__tests__/**/*.{js,jsx}',
          '<rootDir>/src/**/*.{spec,test}.{js,jsx}'
        ],
        transform: {
          '^.+\\.(js|jsx)$': 'babel-jest'
        }
      };

      // src/setupTests.js
      import '@testing-library/jest-dom';
      import { cleanup } from '@testing-library/react';
      import { server } from './mocks/server';

      // 启用MSW
      beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
      afterEach(() => {
        cleanup();
        server.resetHandlers();
        jest.clearAllMocks();
        localStorage.clear();
        sessionStorage.clear();
      });
      afterAll(() => server.close());

      // 全局Mock
      global.matchMedia = global.matchMedia || function() {
        return {
          matches: false,
          addListener: jest.fn(),
          removeListener: jest.fn()
        };
      };

      global.ResizeObserver = jest.fn().mockImplementation(() => ({
        observe: jest.fn(),
        unobserve: jest.fn(),
        disconnect: jest.fn()
      }));

      global.IntersectionObserver = jest.fn().mockImplementation(() => ({
        observe: jest.fn(),
        unobserve: jest.fn(),
        disconnect: jest.fn()
      }));

      // src/test-utils.js
      import React from 'react';
      import { render } from '@testing-library/react';
      import { BrowserRouter } from 'react-router-dom';
      import { Provider } from 'react-redux';
      import { configureStore } from '@reduxjs/toolkit';
      import rootReducer from './store/rootReducer';

      export function renderWithProviders(
        ui,
        {
          preloadedState = {},
          store = configureStore({ 
            reducer: rootReducer, 
            preloadedState 
          }),
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
        
        return { 
          store, 
          ...render(ui, { wrapper: Wrapper, ...renderOptions }) 
        };
      }

      // 测试数据生成器
      export const testDataFactory = {
        user: (overrides = {}) => ({
          id: Math.random().toString(36).substr(2, 9),
          email: `test${Date.now()}@example.com`,
          name: 'Test User',
          role: 'user',
          ...overrides
        }),

        project: (overrides = {}) => ({
          id: Math.random().toString(36).substr(2, 9),
          name: 'Test Project',
          description: 'Test project description',
          members: [],
          createdAt: new Date().toISOString(),
          ...overrides
        }),

        task: (overrides = {}) => ({
          id: Math.random().toString(36).substr(2, 9),
          title: 'Test Task',
          description: 'Test task description',
          status: 'todo',
          priority: 'medium',
          assignee: null,
          dueDate: null,
          createdAt: new Date().toISOString(),
          ...overrides
        })
      };

      // cypress.config.js
      const { defineConfig } = require('cypress');

      module.exports = defineConfig({
        e2e: {
          baseUrl: 'http://localhost:3000',
          viewportWidth: 1280,
          viewportHeight: 720,
          video: true,
          screenshotOnRunFailure: true,
          setupNodeEvents(on, config) {
            // 数据库任务
            on('task', {
              'db:reset': () => {
                // 重置测试数据库
                return null;
              },
              'db:seed': (data) => {
                // 填充测试数据
                return null;
              }
            });
          }
        }
      });

      // package.json scripts
      {
        "scripts": {
          "test": "jest",
          "test:watch": "jest --watch",
          "test:coverage": "jest --coverage",
          "test:ci": "jest --ci --coverage --maxWorkers=2",
          "test:e2e": "cypress run",
          "test:e2e:open": "cypress open",
          "test:all": "npm run test:ci && npm run test:e2e"
        }
      }
---