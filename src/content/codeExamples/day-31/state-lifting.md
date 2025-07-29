---
title: "状态提升策略"
description: "React中的状态提升模式、共享状态管理和组件通信最佳实践"
category: "advanced"
language: "javascript"
---

# 状态提升策略

## 什么是状态提升

状态提升是React中一种常见的模式，当多个组件需要共享同一状态时，将状态提升到它们最近的共同父组件中。

## 基础示例

### 1. 温度转换器示例

```jsx
// 温度输入组件
function TemperatureInput({ temperature, scale, onTemperatureChange }) {
  const scaleNames = {
    c: '摄氏度',
    f: '华氏度'
  };
  
  const handleChange = (e) => {
    onTemperatureChange(e.target.value, scale);
  };
  
  return (
    <fieldset>
      <legend>输入{scaleNames[scale]}:</legend>
      <input
        value={temperature}
        onChange={handleChange}
        type="number"
      />
    </fieldset>
  );
}

// 转换函数
function toCelsius(fahrenheit) {
  return (fahrenheit - 32) * 5 / 9;
}

function toFahrenheit(celsius) {
  return (celsius * 9 / 5) + 32;
}

function tryConvert(temperature, convert) {
  const input = parseFloat(temperature);
  if (Number.isNaN(input)) {
    return '';
  }
  const output = convert(input);
  const rounded = Math.round(output * 1000) / 1000;
  return rounded.toString();
}

// 父组件管理共享状态
function TemperatureCalculator() {
  const [temperature, setTemperature] = useState('');
  const [scale, setScale] = useState('c');
  
  const handleTemperatureChange = (temp, newScale) => {
    setTemperature(temp);
    setScale(newScale);
  };
  
  const celsius = scale === 'f' 
    ? tryConvert(temperature, toCelsius) 
    : temperature;
  
  const fahrenheit = scale === 'c' 
    ? tryConvert(temperature, toFahrenheit) 
    : temperature;
  
  return (
    <div>
      <TemperatureInput
        temperature={celsius}
        scale="c"
        onTemperatureChange={handleTemperatureChange}
      />
      <TemperatureInput
        temperature={fahrenheit}
        scale="f"
        onTemperatureChange={handleTemperatureChange}
      />
      {temperature && (
        <BoilingVerdict celsius={parseFloat(celsius)} />
      )}
    </div>
  );
}

function BoilingVerdict({ celsius }) {
  if (celsius >= 100) {
    return <p>水会沸腾！</p>;
  }
  return <p>水不会沸腾。</p>;
}
```

### 2. 表单数据共享

```jsx
// 共享表单状态
function UserForm() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });
  
  const updateField = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  return (
    <div>
      <PersonalInfo 
        data={formData} 
        onUpdate={updateField} 
      />
      <ContactInfo 
        data={formData} 
        onUpdate={updateField} 
      />
      <FormPreview data={formData} />
    </div>
  );
}

function PersonalInfo({ data, onUpdate }) {
  return (
    <div>
      <h3>个人信息</h3>
      <input
        value={data.firstName}
        onChange={(e) => onUpdate('firstName', e.target.value)}
        placeholder="名字"
      />
      <input
        value={data.lastName}
        onChange={(e) => onUpdate('lastName', e.target.value)}
        placeholder="姓氏"
      />
    </div>
  );
}

function ContactInfo({ data, onUpdate }) {
  return (
    <div>
      <h3>联系方式</h3>
      <input
        value={data.email}
        onChange={(e) => onUpdate('email', e.target.value)}
        placeholder="邮箱"
        type="email"
      />
      <input
        value={data.phone}
        onChange={(e) => onUpdate('phone', e.target.value)}
        placeholder="电话"
        type="tel"
      />
    </div>
  );
}

function FormPreview({ data }) {
  return (
    <div>
      <h3>预览</h3>
      <p>姓名: {data.firstName} {data.lastName}</p>
      <p>邮箱: {data.email}</p>
      <p>电话: {data.phone}</p>
    </div>
  );
}
```

## 高级状态提升模式

### 1. 多级状态提升

```jsx
// 购物车示例
function ShoppingApp() {
  const [cart, setCart] = useState([]);
  const [products] = useState([
    { id: 1, name: 'iPhone 13', price: 5999 },
    { id: 2, name: 'MacBook Pro', price: 14999 },
    { id: 3, name: 'AirPods', price: 1299 }
  ]);
  
  const addToCart = (product) => {
    setCart(prevCart => {
      const existing = prevCart.find(item => item.id === product.id);
      if (existing) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };
  
  const removeFromCart = (productId) => {
    setCart(prevCart => 
      prevCart.filter(item => item.id !== productId)
    );
  };
  
  const updateQuantity = (productId, quantity) => {
    if (quantity === 0) {
      removeFromCart(productId);
      return;
    }
    
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productId
          ? { ...item, quantity }
          : item
      )
    );
  };
  
  const getTotalPrice = () => {
    return cart.reduce(
      (total, item) => total + item.price * item.quantity, 
      0
    );
  };
  
  return (
    <div>
      <ProductList 
        products={products} 
        onAddToCart={addToCart} 
      />
      <Cart 
        items={cart}
        onRemove={removeFromCart}
        onUpdateQuantity={updateQuantity}
        totalPrice={getTotalPrice()}
      />
    </div>
  );
}

function ProductList({ products, onAddToCart }) {
  return (
    <div>
      <h2>商品列表</h2>
      {products.map(product => (
        <ProductItem 
          key={product.id}
          product={product}
          onAddToCart={onAddToCart}
        />
      ))}
    </div>
  );
}

function ProductItem({ product, onAddToCart }) {
  return (
    <div className="product-item">
      <h3>{product.name}</h3>
      <p>¥{product.price}</p>
      <button onClick={() => onAddToCart(product)}>
        添加到购物车
      </button>
    </div>
  );
}

function Cart({ items, onRemove, onUpdateQuantity, totalPrice }) {
  if (items.length === 0) {
    return <div>购物车是空的</div>;
  }
  
  return (
    <div>
      <h2>购物车</h2>
      {items.map(item => (
        <CartItem
          key={item.id}
          item={item}
          onRemove={onRemove}
          onUpdateQuantity={onUpdateQuantity}
        />
      ))}
      <div className="total">
        总计: ¥{totalPrice.toFixed(2)}
      </div>
    </div>
  );
}

function CartItem({ item, onRemove, onUpdateQuantity }) {
  return (
    <div className="cart-item">
      <span>{item.name}</span>
      <input
        type="number"
        value={item.quantity}
        onChange={(e) => onUpdateQuantity(item.id, parseInt(e.target.value) || 0)}
        min="0"
      />
      <span>¥{(item.price * item.quantity).toFixed(2)}</span>
      <button onClick={() => onRemove(item.id)}>
        删除
      </button>
    </div>
  );
}
```

### 2. 状态提升与组合

```jsx
// 复杂的过滤和排序系统
function ProductCatalog() {
  const [products] = useState(generateProducts());
  const [filters, setFilters] = useState({
    category: 'all',
    priceRange: { min: 0, max: Infinity },
    inStock: false,
    searchTerm: ''
  });
  const [sortBy, setSortBy] = useState('name');
  
  // 应用过滤和排序
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products.filter(product => {
      // 分类过滤
      if (filters.category !== 'all' && product.category !== filters.category) {
        return false;
      }
      
      // 价格过滤
      if (product.price < filters.priceRange.min || 
          product.price > filters.priceRange.max) {
        return false;
      }
      
      // 库存过滤
      if (filters.inStock && product.stock === 0) {
        return false;
      }
      
      // 搜索过滤
      if (filters.searchTerm && 
          !product.name.toLowerCase().includes(filters.searchTerm.toLowerCase())) {
        return false;
      }
      
      return true;
    });
    
    // 排序
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'stock':
          return b.stock - a.stock;
        default:
          return 0;
      }
    });
  }, [products, filters, sortBy]);
  
  const updateFilter = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  return (
    <div className="catalog">
      <FilterPanel 
        filters={filters}
        onFilterChange={updateFilter}
      />
      <div className="main-content">
        <SortingControls 
          sortBy={sortBy}
          onSortChange={setSortBy}
        />
        <ProductGrid products={filteredAndSortedProducts} />
      </div>
    </div>
  );
}

function FilterPanel({ filters, onFilterChange }) {
  return (
    <aside className="filter-panel">
      <h3>筛选</h3>
      
      <div className="filter-group">
        <label>分类</label>
        <select 
          value={filters.category}
          onChange={(e) => onFilterChange('category', e.target.value)}
        >
          <option value="all">全部</option>
          <option value="electronics">电子产品</option>
          <option value="clothing">服装</option>
          <option value="books">图书</option>
        </select>
      </div>
      
      <div className="filter-group">
        <label>价格范围</label>
        <PriceRangeSlider
          min={filters.priceRange.min}
          max={filters.priceRange.max}
          onChange={(range) => onFilterChange('priceRange', range)}
        />
      </div>
      
      <div className="filter-group">
        <label>
          <input
            type="checkbox"
            checked={filters.inStock}
            onChange={(e) => onFilterChange('inStock', e.target.checked)}
          />
          仅显示有货商品
        </label>
      </div>
      
      <div className="filter-group">
        <input
          type="search"
          placeholder="搜索商品..."
          value={filters.searchTerm}
          onChange={(e) => onFilterChange('searchTerm', e.target.value)}
        />
      </div>
    </aside>
  );
}
```

## 状态提升的最佳实践

### 1. 使用自定义Hook管理复杂状态

```jsx
// 自定义Hook封装状态逻辑
function useFormState(initialState) {
  const [values, setValues] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  
  const setValue = useCallback((name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
    // 清除该字段的错误
    setErrors(prev => ({ ...prev, [name]: '' }));
  }, []);
  
  const setFieldTouched = useCallback((name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
  }, []);
  
  const validateField = useCallback((name, value) => {
    // 验证逻辑
    if (!value) {
      return '此字段为必填项';
    }
    if (name === 'email' && !value.includes('@')) {
      return '请输入有效的邮箱地址';
    }
    return '';
  }, []);
  
  const validateForm = useCallback(() => {
    const newErrors = {};
    Object.keys(values).forEach(key => {
      const error = validateField(key, values[key]);
      if (error) {
        newErrors[key] = error;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [values, validateField]);
  
  const resetForm = useCallback(() => {
    setValues(initialState);
    setErrors({});
    setTouched({});
  }, [initialState]);
  
  return {
    values,
    errors,
    touched,
    setValue,
    setFieldTouched,
    validateForm,
    resetForm
  };
}

// 使用自定义Hook
function RegistrationForm() {
  const form = useFormState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.validateForm()) {
      console.log('提交表单:', form.values);
      // 提交逻辑...
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <FormField
        label="用户名"
        name="username"
        value={form.values.username}
        error={form.touched.username && form.errors.username}
        onChange={(value) => form.setValue('username', value)}
        onBlur={() => form.setFieldTouched('username')}
      />
      
      <FormField
        label="邮箱"
        name="email"
        type="email"
        value={form.values.email}
        error={form.touched.email && form.errors.email}
        onChange={(value) => form.setValue('email', value)}
        onBlur={() => form.setFieldTouched('email')}
      />
      
      <button type="submit">注册</button>
      <button type="button" onClick={form.resetForm}>
        重置
      </button>
    </form>
  );
}
```

### 2. 状态提升的决策原则

```jsx
// 何时提升状态的示例

// ❌ 不必要的状态提升
function BadExample() {
  // 这个状态只在Header中使用，不应该提升
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  return (
    <div>
      <Header 
        isMenuOpen={isMenuOpen} 
        setIsMenuOpen={setIsMenuOpen} 
      />
      <MainContent />
    </div>
  );
}

// ✅ 保持状态局部化
function GoodExample() {
  return (
    <div>
      <Header /> {/* Header内部管理自己的菜单状态 */}
      <MainContent />
    </div>
  );
}

// ✅ 必要的状态提升
function NecessaryLifting() {
  // 多个组件需要这个状态
  const [selectedUser, setSelectedUser] = useState(null);
  
  return (
    <div>
      <UserList 
        selectedUser={selectedUser}
        onSelectUser={setSelectedUser} 
      />
      <UserDetails user={selectedUser} />
      <UserActions 
        user={selectedUser}
        onUserUpdate={setSelectedUser}
      />
    </div>
  );
}
```

### 3. 状态提升与性能优化

```jsx
// 使用React.memo和useCallback优化
const ExpensiveChild = React.memo(({ data, onUpdate }) => {
  console.log('ExpensiveChild渲染');
  
  return (
    <div>
      {/* 复杂的渲染逻辑 */}
      <button onClick={() => onUpdate(data.id)}>
        更新
      </button>
    </div>
  );
});

function OptimizedParent() {
  const [items, setItems] = useState(generateLargeList());
  const [selectedId, setSelectedId] = useState(null);
  
  // 使用useCallback避免子组件不必要的重渲染
  const handleUpdate = useCallback((id) => {
    setItems(prevItems => 
      prevItems.map(item =>
        item.id === id
          ? { ...item, updated: true }
          : item
      )
    );
  }, []);
  
  const handleSelect = useCallback((id) => {
    setSelectedId(id);
  }, []);
  
  return (
    <div>
      {items.map(item => (
        <ExpensiveChild
          key={item.id}
          data={item}
          onUpdate={handleUpdate}
          isSelected={item.id === selectedId}
          onSelect={handleSelect}
        />
      ))}
    </div>
  );
}
```

## 状态提升的替代方案

### 组件组合 vs 状态提升

```jsx
// 使用组件组合避免不必要的状态提升
function Layout({ sidebar, content }) {
  return (
    <div className="layout">
      <aside className="sidebar">{sidebar}</aside>
      <main className="content">{content}</main>
    </div>
  );
}

// 使用组合而不是状态提升
function App() {
  return (
    <Layout
      sidebar={<Sidebar />}
      content={<Content />}
    />
  );
}

// 而不是
function AppWithLifting() {
  const [sharedState, setSharedState] = useState();
  
  return (
    <div className="layout">
      <Sidebar state={sharedState} setState={setSharedState} />
      <Content state={sharedState} setState={setSharedState} />
    </div>
  );
}
```

状态提升是React中管理共享状态的基础模式，但要谨慎使用，避免过度提升导致的性能问题和代码复杂性。