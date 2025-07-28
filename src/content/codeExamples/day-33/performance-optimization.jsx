// Day 33: 性能优化示例

import React, { useState, useMemo, useCallback, memo, useRef, useEffect } from 'react';

// ==========================================
// 1. React.memo 基础使用
// ==========================================

// 未优化的组件
function UnoptimizedProductCard({ product, onAddToCart }) {
  console.log(`Rendering product: ${product.id}`);
  
  return (
    <div className="product-card">
      <h3>{product.name}</h3>
      <p>${product.price}</p>
      <button onClick={() => onAddToCart(product.id)}>
        Add to Cart
      </button>
    </div>
  );
}

// 使用React.memo优化
const OptimizedProductCard = memo(function ProductCard({ product, onAddToCart }) {
  console.log(`Rendering product: ${product.id}`);
  
  return (
    <div className="product-card">
      <h3>{product.name}</h3>
      <p>${product.price}</p>
      <button onClick={() => onAddToCart(product.id)}>
        Add to Cart
      </button>
    </div>
  );
});

// 自定义比较函数
const CustomMemoProductCard = memo(
  function ProductCard({ product, onAddToCart, highlight }) {
    return (
      <div className={`product-card ${highlight ? 'highlighted' : ''}`}>
        <h3>{product.name}</h3>
        <p>${product.price}</p>
        <button onClick={() => onAddToCart(product.id)}>
          Add to Cart
        </button>
      </div>
    );
  },
  (prevProps, nextProps) => {
    // 只比较product的id和price，忽略highlight的变化
    return (
      prevProps.product.id === nextProps.product.id &&
      prevProps.product.price === nextProps.product.price
    );
  }
);

// ==========================================
// 2. useMemo 优化昂贵计算
// ==========================================

function ExpensiveComputationExample({ data, filter }) {
  // ❌ 未优化：每次渲染都重新计算
  const unoptimizedResult = data
    .filter(item => item.value > filter)
    .map(item => ({
      ...item,
      computed: Math.sqrt(item.value) * Math.PI
    }))
    .sort((a, b) => b.computed - a.computed);

  // ✅ 优化：只在依赖变化时重新计算
  const optimizedResult = useMemo(() => {
    console.log('Computing expensive result...');
    return data
      .filter(item => item.value > filter)
      .map(item => ({
        ...item,
        computed: Math.sqrt(item.value) * Math.PI
      }))
      .sort((a, b) => b.computed - a.computed);
  }, [data, filter]);

  return (
    <div>
      <h3>Results: {optimizedResult.length} items</h3>
      {optimizedResult.map(item => (
        <div key={item.id}>
          {item.name}: {item.computed.toFixed(2)}
        </div>
      ))}
    </div>
  );
}

// ==========================================
// 3. useCallback 优化事件处理器
// ==========================================

function SearchableList({ items }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState(new Set());

  // ✅ 使用useCallback避免子组件不必要的重新渲染
  const handleToggleItem = useCallback((itemId) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  }, []);

  // ✅ 搜索函数也使用useCallback
  const handleSearch = useCallback((term) => {
    setSearchTerm(term);
  }, []);

  const filteredItems = useMemo(() => {
    return items.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [items, searchTerm]);

  return (
    <div>
      <SearchBar onSearch={handleSearch} />
      <div className="item-list">
        {filteredItems.map(item => (
          <MemoizedItem
            key={item.id}
            item={item}
            isSelected={selectedItems.has(item.id)}
            onToggle={handleToggleItem}
          />
        ))}
      </div>
    </div>
  );
}

const MemoizedItem = memo(function Item({ item, isSelected, onToggle }) {
  console.log(`Rendering item: ${item.id}`);
  
  return (
    <div className="item">
      <input
        type="checkbox"
        checked={isSelected}
        onChange={() => onToggle(item.id)}
      />
      <span>{item.name}</span>
    </div>
  );
});

// ==========================================
// 4. 防抖和节流优化
// ==========================================

// 防抖Hook
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

// 节流Hook
function useThrottle(callback, delay) {
  const lastRun = useRef(Date.now());

  return useCallback((...args) => {
    if (Date.now() - lastRun.current >= delay) {
      callback(...args);
      lastRun.current = Date.now();
    }
  }, [callback, delay]);
}

// 使用防抖优化搜索
function OptimizedSearch({ onSearch }) {
  const [inputValue, setInputValue] = useState('');
  const debouncedSearchTerm = useDebounce(inputValue, 500);

  useEffect(() => {
    if (debouncedSearchTerm) {
      onSearch(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, onSearch]);

  return (
    <input
      type="text"
      value={inputValue}
      onChange={(e) => setInputValue(e.target.value)}
      placeholder="Search (debounced)..."
    />
  );
}

// ==========================================
// 5. 批量更新优化
// ==========================================

function BatchUpdateExample() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ❌ 多次setState导致多次渲染
  const badUpdate = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await fetchData();
      setItems(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  // ✅ 使用函数式更新减少渲染
  const goodUpdate = async () => {
    try {
      const data = await fetchData();
      
      // React 18自动批处理
      setItems(data);
      setLoading(false);
      setError(null);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  // ✅ 或使用useReducer管理复杂状态
  const [state, dispatch] = useReducer(
    (state, action) => {
      switch (action.type) {
        case 'FETCH_START':
          return { ...state, loading: true, error: null };
        case 'FETCH_SUCCESS':
          return { loading: false, items: action.payload, error: null };
        case 'FETCH_ERROR':
          return { ...state, loading: false, error: action.payload };
        default:
          return state;
      }
    },
    { items: [], loading: false, error: null }
  );

  return (
    <div>
      {state.loading && <div>Loading...</div>}
      {state.error && <div>Error: {state.error}</div>}
      {state.items.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  );
}

// ==========================================
// 6. 懒加载组件示例
// ==========================================

const HeavyComponent = lazy(() => import('./HeavyComponent'));

function LazyLoadExample() {
  const [showHeavy, setShowHeavy] = useState(false);

  return (
    <div>
      <button onClick={() => setShowHeavy(!showHeavy)}>
        Toggle Heavy Component
      </button>
      
      {showHeavy && (
        <Suspense fallback={<div>Loading heavy component...</div>}>
          <HeavyComponent />
        </Suspense>
      )}
    </div>
  );
}

// ==========================================
// 7. 完整的优化示例应用
// ==========================================

export function OptimizedProductListApp() {
  const [products] = useState(() => 
    Array.from({ length: 1000 }, (_, i) => ({
      id: i,
      name: `Product ${i}`,
      price: Math.floor(Math.random() * 1000),
      category: ['electronics', 'books', 'clothing'][i % 3]
    }))
  );
  
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  // 防抖搜索词
  const debouncedSearch = useDebounce(searchTerm, 300);

  // 缓存过滤和排序结果
  const displayProducts = useMemo(() => {
    console.log('Recalculating products...');
    
    let result = products;

    // 过滤
    if (debouncedSearch) {
      result = result.filter(p =>
        p.name.toLowerCase().includes(debouncedSearch.toLowerCase())
      );
    }

    if (category !== 'all') {
      result = result.filter(p => p.category === category);
    }

    // 排序
    result = [...result].sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'price') return a.price - b.price;
      return 0;
    });

    return result;
  }, [products, debouncedSearch, category, sortBy]);

  // 缓存事件处理器
  const handleAddToCart = useCallback((productId) => {
    console.log('Adding to cart:', productId);
  }, []);

  return (
    <div className="app">
      <div className="controls">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search products..."
        />
        
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="all">All Categories</option>
          <option value="electronics">Electronics</option>
          <option value="books">Books</option>
          <option value="clothing">Clothing</option>
        </select>
        
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="name">Sort by Name</option>
          <option value="price">Sort by Price</option>
        </select>
      </div>

      <div className="results">
        <p>Showing {displayProducts.length} products</p>
      </div>

      <div className="product-grid">
        {displayProducts.slice(0, 50).map(product => (
          <OptimizedProductCard
            key={product.id}
            product={product}
            onAddToCart={handleAddToCart}
          />
        ))}
      </div>
    </div>
  );
}

// 性能监控HOC
export function withPerformanceMonitoring(Component) {
  return function MonitoredComponent(props) {
    const renderCount = useRef(0);
    const renderTime = useRef(0);

    useEffect(() => {
      renderCount.current += 1;
      console.log(`Component rendered ${renderCount.current} times`);
    });

    return (
      <Profiler
        id={Component.name}
        onRender={(id, phase, actualDuration) => {
          renderTime.current = actualDuration;
          console.log(`${id} (${phase}) took ${actualDuration}ms`);
        }}
      >
        <Component {...props} />
      </Profiler>
    );
  };
}