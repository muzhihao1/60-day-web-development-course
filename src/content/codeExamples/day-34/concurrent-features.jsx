// Day 34: 并发特性实战示例

import React, {
  useState,
  useTransition,
  useDeferredValue,
  useEffect,
  useMemo,
  Suspense,
  lazy,
  useCallback,
  memo
} from 'react';
import { startTransition } from 'react';

// ==========================================
// 1. 实时搜索优化
// ==========================================

// 模拟大量数据
const generateProducts = (count) => {
  const categories = ['电子产品', '图书', '服装', '食品', '家居'];
  const products = [];
  
  for (let i = 0; i < count; i++) {
    products.push({
      id: i,
      name: `产品 ${i}`,
      category: categories[i % categories.length],
      price: Math.floor(Math.random() * 1000),
      description: `这是产品 ${i} 的详细描述信息`,
      inStock: Math.random() > 0.3
    });
  }
  
  return products;
};

const allProducts = generateProducts(10000);

// 产品卡片组件
const ProductCard = memo(function ProductCard({ product }) {
  return (
    <div className="product-card">
      <h4>{product.name}</h4>
      <p className="category">{product.category}</p>
      <p className="price">¥{product.price}</p>
      <span className={`stock ${product.inStock ? 'in-stock' : 'out-stock'}`}>
        {product.inStock ? '有货' : '缺货'}
      </span>
    </div>
  );
});

export function OptimizedSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');
  const [isPending, startTransition] = useTransition();
  
  // 使用deferred value优化搜索
  const deferredSearchTerm = useDeferredValue(searchTerm);
  const deferredCategory = useDeferredValue(category);
  
  // 过滤产品
  const filteredProducts = useMemo(() => {
    console.time('过滤产品');
    
    let results = allProducts;
    
    // 搜索过滤
    if (deferredSearchTerm) {
      results = results.filter(product =>
        product.name.toLowerCase().includes(deferredSearchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(deferredSearchTerm.toLowerCase())
      );
    }
    
    // 分类过滤
    if (deferredCategory !== 'all') {
      results = results.filter(product => product.category === deferredCategory);
    }
    
    console.timeEnd('过滤产品');
    return results;
  }, [deferredSearchTerm, deferredCategory]);
  
  // 处理搜索输入
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };
  
  // 处理分类变化
  const handleCategoryChange = (e) => {
    startTransition(() => {
      setCategory(e.target.value);
    });
  };
  
  const isStale = searchTerm !== deferredSearchTerm || 
                  category !== deferredCategory;
  
  return (
    <div className="optimized-search">
      <div className="search-controls">
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearch}
          placeholder="搜索产品..."
          className="search-input"
        />
        
        <select
          value={category}
          onChange={handleCategoryChange}
          className="category-select"
        >
          <option value="all">所有分类</option>
          <option value="电子产品">电子产品</option>
          <option value="图书">图书</option>
          <option value="服装">服装</option>
          <option value="食品">食品</option>
          <option value="家居">家居</option>
        </select>
        
        <div className="search-stats">
          找到 {filteredProducts.length} 个产品
          {(isStale || isPending) && <span className="updating"> (更新中...)</span>}
        </div>
      </div>
      
      <div className={`products-grid ${isStale || isPending ? 'stale' : ''}`}>
        {filteredProducts.slice(0, 50).map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

// ==========================================
// 2. 标签页切换优化
// ==========================================

// 模拟各标签页的重组件
const TabContent = {
  dashboard: function Dashboard() {
    const data = useMemo(() => {
      // 模拟复杂计算
      const stats = [];
      for (let i = 0; i < 1000; i++) {
        stats.push({
          id: i,
          value: Math.random() * 100,
          label: `Stat ${i}`
        });
      }
      return stats;
    }, []);
    
    return (
      <div className="tab-content dashboard">
        <h3>仪表板</h3>
        <div className="stats-grid">
          {data.slice(0, 20).map(stat => (
            <div key={stat.id} className="stat-card">
              <span className="label">{stat.label}</span>
              <span className="value">{stat.value.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>
    );
  },
  
  analytics: function Analytics() {
    const [timeRange, setTimeRange] = useState('week');
    
    const chartData = useMemo(() => {
      const points = [];
      const count = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 365;
      
      for (let i = 0; i < count; i++) {
        points.push({
          x: i,
          y: Math.random() * 100
        });
      }
      
      return points;
    }, [timeRange]);
    
    return (
      <div className="tab-content analytics">
        <h3>分析数据</h3>
        <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
          <option value="week">最近一周</option>
          <option value="month">最近一月</option>
          <option value="year">最近一年</option>
        </select>
        <div className="chart">
          {chartData.map((point, i) => (
            <div
              key={i}
              className="bar"
              style={{ height: `${point.y}%` }}
            />
          ))}
        </div>
      </div>
    );
  },
  
  reports: function Reports() {
    const reports = useMemo(() => {
      const list = [];
      for (let i = 0; i < 500; i++) {
        list.push({
          id: i,
          title: `报告 ${i}`,
          date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
          status: ['completed', 'pending', 'failed'][Math.floor(Math.random() * 3)]
        });
      }
      return list.sort((a, b) => b.date - a.date);
    }, []);
    
    return (
      <div className="tab-content reports">
        <h3>报告列表</h3>
        <div className="reports-list">
          {reports.slice(0, 50).map(report => (
            <div key={report.id} className="report-item">
              <h4>{report.title}</h4>
              <span className="date">{report.date.toLocaleDateString()}</span>
              <span className={`status ${report.status}`}>{report.status}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
};

export function OptimizedTabs() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isPending, startTransition] = useTransition();
  
  const handleTabChange = (tab) => {
    startTransition(() => {
      setActiveTab(tab);
    });
  };
  
  const ActiveTabContent = TabContent[activeTab];
  
  return (
    <div className="optimized-tabs">
      <div className="tabs-header">
        {Object.keys(TabContent).map(tab => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
            className={`tab-button ${activeTab === tab ? 'active' : ''}`}
            disabled={isPending && activeTab === tab}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            {activeTab === tab && isPending && ' ⏳'}
          </button>
        ))}
      </div>
      
      <div className={`tab-panel ${isPending ? 'transitioning' : ''}`}>
        <ActiveTabContent />
      </div>
    </div>
  );
}

// ==========================================
// 3. 无限滚动列表优化
// ==========================================

function generatePosts(start, count) {
  const posts = [];
  for (let i = start; i < start + count; i++) {
    posts.push({
      id: i,
      title: `文章标题 ${i}`,
      content: `这是文章 ${i} 的内容。`.repeat(10),
      author: `作者 ${i % 10}`,
      date: new Date(Date.now() - i * 60 * 60 * 1000),
      likes: Math.floor(Math.random() * 1000),
      comments: Math.floor(Math.random() * 100)
    });
  }
  return posts;
}

export function OptimizedInfiniteList() {
  const [posts, setPosts] = useState(() => generatePosts(0, 20));
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isPending, startTransition] = useTransition();
  
  // 加载更多
  const loadMore = useCallback(() => {
    if (isLoadingMore || !hasMore) return;
    
    setIsLoadingMore(true);
    
    // 模拟API调用
    setTimeout(() => {
      startTransition(() => {
        const newPosts = generatePosts(posts.length, 20);
        setPosts(prev => [...prev, ...newPosts]);
        setIsLoadingMore(false);
        
        if (posts.length >= 100) {
          setHasMore(false);
        }
      });
    }, 1000);
  }, [posts.length, isLoadingMore, hasMore]);
  
  // 监听滚动
  useEffect(() => {
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
      
      if (scrollTop + clientHeight >= scrollHeight - 100) {
        loadMore();
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadMore]);
  
  return (
    <div className="infinite-list">
      <h2>无限滚动优化</h2>
      
      <div className={`posts-container ${isPending ? 'updating' : ''}`}>
        {posts.map(post => (
          <article key={post.id} className="post">
            <h3>{post.title}</h3>
            <div className="post-meta">
              <span className="author">{post.author}</span>
              <span className="date">{post.date.toLocaleDateString()}</span>
            </div>
            <p className="content">{post.content}</p>
            <div className="post-stats">
              <span>👍 {post.likes}</span>
              <span>💬 {post.comments}</span>
            </div>
          </article>
        ))}
      </div>
      
      {isLoadingMore && (
        <div className="loading-more">
          <span className="spinner">⏳</span> 加载更多...
        </div>
      )}
      
      {!hasMore && (
        <div className="no-more">
          没有更多内容了
        </div>
      )}
    </div>
  );
}

// ==========================================
// 4. 表单验证优化
// ==========================================

const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const validatePassword = (password) => {
  return password.length >= 8 && 
         /[A-Z]/.test(password) && 
         /[a-z]/.test(password) && 
         /[0-9]/.test(password);
};

export function OptimizedForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isPending, startTransition] = useTransition();
  
  // 使用deferred value延迟验证
  const deferredFormData = useDeferredValue(formData);
  
  // 验证表单
  useEffect(() => {
    startTransition(() => {
      const newErrors = {};
      
      // 邮箱验证
      if (deferredFormData.email && !validateEmail(deferredFormData.email)) {
        newErrors.email = '请输入有效的邮箱地址';
      }
      
      // 密码验证
      if (deferredFormData.password) {
        if (!validatePassword(deferredFormData.password)) {
          newErrors.password = '密码必须至少8位，包含大小写字母和数字';
        }
      }
      
      // 确认密码
      if (deferredFormData.confirmPassword && 
          deferredFormData.password !== deferredFormData.confirmPassword) {
        newErrors.confirmPassword = '两次输入的密码不一致';
      }
      
      // 用户名验证
      if (deferredFormData.username && deferredFormData.username.length < 3) {
        newErrors.username = '用户名至少需要3个字符';
      }
      
      setErrors(newErrors);
    });
  }, [deferredFormData]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (Object.keys(errors).length === 0) {
      console.log('表单提交:', formData);
    }
  };
  
  const isValidating = JSON.stringify(formData) !== JSON.stringify(deferredFormData);
  
  return (
    <form className="optimized-form" onSubmit={handleSubmit}>
      <h2>优化的表单验证</h2>
      
      <div className="form-field">
        <label htmlFor="username">用户名</label>
        <input
          id="username"
          name="username"
          type="text"
          value={formData.username}
          onChange={handleInputChange}
          className={errors.username ? 'error' : ''}
        />
        {errors.username && (
          <span className="error-message">{errors.username}</span>
        )}
      </div>
      
      <div className="form-field">
        <label htmlFor="email">邮箱</label>
        <input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleInputChange}
          className={errors.email ? 'error' : ''}
        />
        {errors.email && (
          <span className="error-message">{errors.email}</span>
        )}
      </div>
      
      <div className="form-field">
        <label htmlFor="password">密码</label>
        <input
          id="password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleInputChange}
          className={errors.password ? 'error' : ''}
        />
        {errors.password && (
          <span className="error-message">{errors.password}</span>
        )}
      </div>
      
      <div className="form-field">
        <label htmlFor="confirmPassword">确认密码</label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={handleInputChange}
          className={errors.confirmPassword ? 'error' : ''}
        />
        {errors.confirmPassword && (
          <span className="error-message">{errors.confirmPassword}</span>
        )}
      </div>
      
      <button
        type="submit"
        disabled={Object.keys(errors).length > 0 || isValidating}
        className="submit-button"
      >
        {isValidating ? '验证中...' : '提交'}
      </button>
    </form>
  );
}

// ==========================================
// 5. 数据可视化优化
// ==========================================

function generateChartData(points) {
  const data = [];
  for (let i = 0; i < points; i++) {
    data.push({
      x: i,
      y: Math.sin(i / 10) * 50 + 50 + Math.random() * 20,
      value: Math.random() * 100
    });
  }
  return data;
}

export function OptimizedDataVisualization() {
  const [dataPoints, setDataPoints] = useState(100);
  const [chartType, setChartType] = useState('line');
  const [isPending, startTransition] = useTransition();
  
  const deferredDataPoints = useDeferredValue(dataPoints);
  
  const chartData = useMemo(() => {
    console.time('生成图表数据');
    const data = generateChartData(deferredDataPoints);
    console.timeEnd('生成图表数据');
    return data;
  }, [deferredDataPoints]);
  
  const handleDataPointsChange = (e) => {
    setDataPoints(Number(e.target.value));
  };
  
  const handleChartTypeChange = (type) => {
    startTransition(() => {
      setChartType(type);
    });
  };
  
  const isStale = dataPoints !== deferredDataPoints;
  
  return (
    <div className="data-visualization">
      <h2>数据可视化优化</h2>
      
      <div className="controls">
        <label>
          数据点数量: {dataPoints}
          <input
            type="range"
            min="10"
            max="1000"
            value={dataPoints}
            onChange={handleDataPointsChange}
          />
        </label>
        
        <div className="chart-type-buttons">
          {['line', 'bar', 'scatter'].map(type => (
            <button
              key={type}
              onClick={() => handleChartTypeChange(type)}
              className={`type-button ${chartType === type ? 'active' : ''}`}
              disabled={isPending && chartType === type}
            >
              {type}
            </button>
          ))}
        </div>
      </div>
      
      <div className={`chart-container ${isStale || isPending ? 'updating' : ''}`}>
        {isStale && <div className="updating-overlay">更新中...</div>}
        
        {chartType === 'line' && (
          <svg viewBox="0 0 800 400" className="chart">
            <path
              d={`M ${chartData.map((d, i) => 
                `${(i / chartData.length) * 800} ${400 - d.y * 4}`
              ).join(' L ')}`}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
            />
          </svg>
        )}
        
        {chartType === 'bar' && (
          <div className="bar-chart">
            {chartData.map((d, i) => (
              <div
                key={i}
                className="bar"
                style={{ height: `${d.y}%` }}
              />
            ))}
          </div>
        )}
        
        {chartType === 'scatter' && (
          <svg viewBox="0 0 800 400" className="chart">
            {chartData.map((d, i) => (
              <circle
                key={i}
                cx={(i / chartData.length) * 800}
                cy={400 - d.y * 4}
                r="3"
                fill="#3b82f6"
              />
            ))}
          </svg>
        )}
      </div>
    </div>
  );
}