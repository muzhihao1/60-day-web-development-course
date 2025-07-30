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