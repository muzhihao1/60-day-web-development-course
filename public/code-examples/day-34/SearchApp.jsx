import React, { 
  useState, 
  useTransition, 
  useDeferredValue, 
  useId,
  useSyncExternalStore,
  useEffect,
  useMemo,
  useCallback,
  memo
} from 'react';
import './SearchApp.css';
// 生成大量测试数据
const generateData = (count) => {
  const categories = ['Technology', 'Science', 'Business', 'Health', 'Sports'];
  const tags = ['trending', 'featured', 'new', 'popular', 'hot'];
  
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    title: `Item ${i + 1}: ${['Amazing', 'Incredible', 'Fascinating', 'Important'][Math.floor(Math.random() * 4)]} ${['Discovery', 'Innovation', 'Breakthrough', 'Development'][Math.floor(Math.random() * 4)]}`,
    category: categories[Math.floor(Math.random() * categories.length)],
    tags: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, 
      () => tags[Math.floor(Math.random() * tags.length)]),
    date: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
    views: Math.floor(Math.random() * 100000),
    rating: (Math.random() * 5).toFixed(1)
  }));
};
// 网络状态Hook
const useOnlineStatus = () => {
  return useSyncExternalStore(
    (callback) => {
      window.addEventListener('online', callback);
      window.addEventListener('offline', callback);
      return () => {
        window.removeEventListener('online', callback);
        window.removeEventListener('offline', callback);
      };
    },
    () => navigator.onLine,
    () => true
  );
};
// 搜索历史Hook
const useSearchHistory = () => {
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('searchHistory');
    return saved ? JSON.parse(saved) : [];
  });
  
  const addToHistory = useCallback((query) => {
    if (!query.trim()) return;
    
    setHistory(prev => {
      const filtered = prev.filter(item => item.query !== query);
      const updated = [{ query, timestamp: Date.now() }, ...filtered].slice(0, 10);
      localStorage.setItem('searchHistory', JSON.stringify(updated));
      return updated;
    });
  }, []);
  
  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem('searchHistory');
  }, []);
  
  return { history, addToHistory, clearHistory };
};
// 高亮组件
const HighlightText = memo(({ text, query }) => {
  if (!query) return <span>{text}</span>;
  
  const parts = text.split(new RegExp(`(${query})`, 'gi'));
  
  return (
    <span>
      {parts.map((part, index) => 
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={index}>{part}</mark>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </span>
  );
});
// 搜索结果项
const SearchResultItem = memo(({ item, query }) => {
  return (
    <div className="search-result-item">
      <h3>
        <HighlightText text={item.title} query={query} />
      </h3>
      <p>
        <HighlightText text={item.description} query={query} />
      </p>
      <div className="item-meta">
        <span className="category">{item.category}</span>
        {item.tags.map(tag => (
          <span key={tag} className="tag">{tag}</span>
        ))}
        <span className="date">{item.date.toLocaleDateString()}</span>
        <span className="views">{item.views.toLocaleString()} views</span>
        <span className="rating">★ {item.rating}</span>
      </div>
    </div>
  );
});
// 虚拟滚动组件
const VirtualList = memo(({ items, query, height = 600, itemHeight = 120 }) => {
  const [scrollTop, setScrollTop] = useState(0);
  
  const visibleItems = useMemo(() => {
    const start = Math.floor(scrollTop / itemHeight);
    const end = Math.ceil((scrollTop + height) / itemHeight);
    return items.slice(start, end + 1);
  }, [items, scrollTop, height, itemHeight]);
  
  const totalHeight = items.length * itemHeight;
  const offsetY = Math.floor(scrollTop / itemHeight) * itemHeight;
  
  return (
    <div 
      className="virtual-list"
      style={{ height, overflow: 'auto' }}
      onScroll={(e) => setScrollTop(e.target.scrollTop)}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map(item => (
            <SearchResultItem key={item.id} item={item} query={query} />
          ))}
        </div>
      </div>
    </div>
  );
});
// 主搜索应用
const SearchApp = () => {
  const [data] = useState(() => generateData(100000));
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    dateRange: 'all',
    sortBy: 'relevance'
  });
  const [isPending, startTransition] = useTransition();
  const deferredQuery = useDeferredValue(query);
  const deferredFilters = useDeferredValue(filters);
  const isOnline = useOnlineStatus();
  const { history, addToHistory, clearHistory } = useSearchHistory();
  const searchInputId = useId();
  
  // 性能监控
  const [performanceMetrics, setPerformanceMetrics] = useState({
    searchTime: 0,
    renderTime: 0
  });
  
  // 搜索逻辑
  const searchResults = useMemo(() => {
    const startTime = performance.now();
    
    let results = data;
    
    // 查询过滤
    if (deferredQuery) {
      const lowerQuery = deferredQuery.toLowerCase();
      results = results.filter(item => 
        item.title.toLowerCase().includes(lowerQuery) ||
        item.description.toLowerCase().includes(lowerQuery) ||
        item.category.toLowerCase().includes(lowerQuery) ||
        item.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
      );
    }
    
    // 类别过滤
    if (deferredFilters.category) {
      results = results.filter(item => item.category === deferredFilters.category);
    }
    
    // 日期范围过滤
    if (deferredFilters.dateRange !== 'all') {
      const now = Date.now();
      const ranges = {
        'week': 7 * 24 * 60 * 60 * 1000,
        'month': 30 * 24 * 60 * 60 * 1000,
        'year': 365 * 24 * 60 * 60 * 1000
      };
      const range = ranges[deferredFilters.dateRange];
      results = results.filter(item => now - item.date.getTime() <= range);
    }
    
    // 排序
    results = [...results].sort((a, b) => {
      switch (deferredFilters.sortBy) {
        case 'date':
          return b.date - a.date;
        case 'views':
          return b.views - a.views;
        case 'rating':
          return b.rating - a.rating;
        default:
          return 0;
      }
    });
    
    const searchTime = performance.now() - startTime;
    setPerformanceMetrics(prev => ({ ...prev, searchTime }));
    
    return results;
  }, [data, deferredQuery, deferredFilters]);
  
  // 搜索建议
  const suggestions = useMemo(() => {
    if (!query || query.length < 2) return [];
    
    const seen = new Set();
    return data
      .filter(item => {
        const lowerQuery = query.toLowerCase();
        return item.title.toLowerCase().includes(lowerQuery) && !seen.has(item.title);
      })
      .slice(0, 5)
      .map(item => {
        seen.add(item.title);
        return item.title;
      });
  }, [query, data]);
  
  // 处理搜索输入
  const handleSearch = (e) => {
    const value = e.target.value;
    setQuery(value);
  };
  
  // 处理搜索提交
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      addToHistory(query);
    }
  };
  
  // 处理过滤器变更
  const handleFilterChange = (filterType, value) => {
    startTransition(() => {
      setFilters(prev => ({ ...prev, [filterType]: value }));
    });
  };
  
  // 性能渲染监控
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const renderTime = performance.now() - startTime;
      setPerformanceMetrics(prev => ({ ...prev, renderTime }));
    };
  });
  
  const isStale = query !== deferredQuery || filters !== deferredFilters;
  
  return (
    <div className="search-app">
      <header className="search-header">
        <h1>React 18 实时搜索</h1>
        <div className="status-bar">
          <span className={`online-status ${isOnline ? 'online' : 'offline'}`}>
            {isOnline ? '🟢 在线' : '🔴 离线'}
          </span>
          <span className="performance-metrics">
            搜索: {performanceMetrics.searchTime.toFixed(2)}ms | 
            渲染: {performanceMetrics.renderTime.toFixed(2)}ms
          </span>
        </div>
      </header>
      
      <form onSubmit={handleSearchSubmit} className="search-form">
        <div className="search-input-wrapper">
          <input
            id={searchInputId}
            type="search"
            value={query}
            onChange={handleSearch}
            placeholder="搜索100,000+条数据..."
            className="search-input"
            autoComplete="off"
          />
          {isStale && <span className="loading-indicator">更新中...</span>}
        </div>
        
        {suggestions.length > 0 && (
          <div className="suggestions">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setQuery(suggestion)}
                className="suggestion-item"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </form>
      
      <div className="filters">
        <select 
          value={filters.category}
          onChange={(e) => handleFilterChange('category', e.target.value)}
          className={isPending ? 'pending' : ''}
        >
          <option value="">所有类别</option>
          <option value="Technology">Technology</option>
          <option value="Science">Science</option>
          <option value="Business">Business</option>
          <option value="Health">Health</option>
          <option value="Sports">Sports</option>
        </select>
        
        <select 
          value={filters.dateRange}
          onChange={(e) => handleFilterChange('dateRange', e.target.value)}
          className={isPending ? 'pending' : ''}
        >
          <option value="all">所有时间</option>
          <option value="week">最近一周</option>
          <option value="month">最近一月</option>
          <option value="year">最近一年</option>
        </select>
        
        <select 
          value={filters.sortBy}
          onChange={(e) => handleFilterChange('sortBy', e.target.value)}
          className={isPending ? 'pending' : ''}
        >
          <option value="relevance">相关性</option>
          <option value="date">最新</option>
          <option value="views">最多浏览</option>
          <option value="rating">最高评分</option>
        </select>
      </div>
      
      {history.length > 0 && (
        <div className="search-history">
          <h3>搜索历史</h3>
          <div className="history-items">
            {history.map((item, index) => (
              <button
                key={index}
                onClick={() => setQuery(item.query)}
                className="history-item"
              >
                {item.query}
              </button>
            ))}
            <button onClick={clearHistory} className="clear-history">
              清除历史
            </button>
          </div>
        </div>
      )}
      
      <div className={`search-results ${isStale ? 'stale' : ''}`}>
        <h2>
          搜索结果 ({searchResults.length.toLocaleString()} 条)
        </h2>
        
        {searchResults.length > 0 ? (
          <VirtualList 
            items={searchResults} 
            query={deferredQuery}
            height={600}
            itemHeight={120}
          />
        ) : (
          <div className="no-results">
            没有找到匹配的结果
          </div>
        )}
      </div>
    </div>
  );
};
export default SearchApp;