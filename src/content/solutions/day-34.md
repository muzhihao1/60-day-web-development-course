---
day: 34
exerciseTitle: "React 18新特性练习"
approach: "使用React 18的并发渲染、新Hooks和Suspense特性构建高性能应用"
keyTakeaways:
  - "useTransition处理非紧急更新"
  - "useDeferredValue优化响应性"
  - "自动批处理提升性能"
  - "Suspense实现流式渲染"
  - "新的服务端渲染API"
commonMistakes:
  - "过度使用并发特性"
  - "忽略向后兼容性"
  - "不当的Suspense边界"
  - "误用flushSync"
extensions:
  - "实现React Server Components"
  - "添加性能监控系统"
  - "集成错误追踪"
  - "优化bundle大小"
files:
  - name: "SearchApp.jsx"
    description: "实时搜索应用展示并发特性"
    code: |
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
          description: `This is a detailed description for item ${i + 1}. It contains various keywords that can be searched.`,
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

  - name: "InteractiveDashboard.jsx"
    description: "交互式数据仪表盘展示批处理"
    code: |
      import React, { 
        useState, 
        useEffect, 
        useTransition, 
        useDeferredValue,
        useCallback,
        useMemo,
        useRef,
        useInsertionEffect
      } from 'react';
      import { flushSync } from 'react-dom';
      import './InteractiveDashboard.css';

      // 主题CSS注入Hook
      const useThemeCSS = (theme) => {
        useInsertionEffect(() => {
          const style = document.createElement('style');
          style.textContent = `
            :root {
              --bg-primary: ${theme === 'dark' ? '#1a1a1a' : '#ffffff'};
              --bg-secondary: ${theme === 'dark' ? '#2d2d2d' : '#f5f5f5'};
              --text-primary: ${theme === 'dark' ? '#ffffff' : '#000000'};
              --text-secondary: ${theme === 'dark' ? '#b0b0b0' : '#666666'};
              --border-color: ${theme === 'dark' ? '#404040' : '#e0e0e0'};
              --chart-color-1: ${theme === 'dark' ? '#60a5fa' : '#3b82f6'};
              --chart-color-2: ${theme === 'dark' ? '#34d399' : '#10b981'};
              --chart-color-3: ${theme === 'dark' ? '#f87171' : '#ef4444'};
              --chart-color-4: ${theme === 'dark' ? '#fbbf24' : '#f59e0b'};
            }
          `;
          document.head.appendChild(style);
          
          return () => {
            document.head.removeChild(style);
          };
        }, [theme]);
      };

      // 生成模拟数据
      const generateRealtimeData = () => ({
        timestamp: Date.now(),
        cpu: Math.random() * 100,
        memory: Math.random() * 100,
        network: Math.random() * 1000,
        disk: Math.random() * 100,
        requests: Math.floor(Math.random() * 1000),
        errors: Math.floor(Math.random() * 50),
        latency: Math.random() * 200,
        users: Math.floor(Math.random() * 5000)
      });

      // 数据聚合器
      const aggregateData = (data, timeRange) => {
        const now = Date.now();
        const ranges = {
          '1h': 60 * 60 * 1000,
          '6h': 6 * 60 * 60 * 1000,
          '24h': 24 * 60 * 60 * 1000,
          '7d': 7 * 24 * 60 * 60 * 1000
        };
        
        const range = ranges[timeRange];
        const filtered = data.filter(item => now - item.timestamp <= range);
        
        // 计算聚合值
        const aggregated = {
          avgCpu: filtered.reduce((sum, item) => sum + item.cpu, 0) / filtered.length,
          avgMemory: filtered.reduce((sum, item) => sum + item.memory, 0) / filtered.length,
          totalRequests: filtered.reduce((sum, item) => sum + item.requests, 0),
          totalErrors: filtered.reduce((sum, item) => sum + item.errors, 0),
          avgLatency: filtered.reduce((sum, item) => sum + item.latency, 0) / filtered.length,
          peakUsers: Math.max(...filtered.map(item => item.users))
        };
        
        return { filtered, aggregated };
      };

      // 图表组件
      const LineChart = React.memo(({ data, dataKey, color, height = 200 }) => {
        const canvasRef = useRef(null);
        const animationRef = useRef(null);
        const progressRef = useRef(0);
        
        useEffect(() => {
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');
          const width = canvas.width;
          
          const animate = () => {
            progressRef.current = Math.min(progressRef.current + 0.05, 1);
            
            ctx.clearRect(0, 0, width, height);
            
            if (!data || data.length === 0) return;
            
            const maxValue = Math.max(...data.map(d => d[dataKey]));
            const points = data.slice(-50); // 显示最近50个点
            
            // 绘制网格
            ctx.strokeStyle = 'rgba(128, 128, 128, 0.2)';
            ctx.lineWidth = 1;
            for (let i = 0; i <= 4; i++) {
              const y = (i / 4) * height;
              ctx.beginPath();
              ctx.moveTo(0, y);
              ctx.lineTo(width, y);
              ctx.stroke();
            }
            
            // 绘制数据线
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            
            points.forEach((point, index) => {
              const x = (index / (points.length - 1)) * width;
              const y = height - (point[dataKey] / maxValue) * height * 0.9;
              const actualY = height - (height - y) * progressRef.current;
              
              if (index === 0) {
                ctx.moveTo(x, actualY);
              } else {
                ctx.lineTo(x, actualY);
              }
            });
            
            ctx.stroke();
            
            // 绘制区域填充
            ctx.fillStyle = color + '20';
            ctx.lineTo(width, height);
            ctx.lineTo(0, height);
            ctx.closePath();
            ctx.fill();
            
            if (progressRef.current < 1) {
              animationRef.current = requestAnimationFrame(animate);
            }
          };
          
          animate();
          
          return () => {
            if (animationRef.current) {
              cancelAnimationFrame(animationRef.current);
            }
          };
        }, [data, dataKey, color, height]);
        
        return <canvas ref={canvasRef} width={400} height={height} />;
      });

      // 度量卡片组件
      const MetricCard = React.memo(({ title, value, unit, change, icon }) => {
        const formattedValue = typeof value === 'number' ? value.toFixed(1) : value;
        const changeColor = change > 0 ? 'increase' : change < 0 ? 'decrease' : 'stable';
        
        return (
          <div className="metric-card">
            <div className="metric-header">
              <span className="metric-icon">{icon}</span>
              <span className="metric-title">{title}</span>
            </div>
            <div className="metric-value">
              {formattedValue}
              {unit && <span className="metric-unit">{unit}</span>}
            </div>
            <div className={`metric-change ${changeColor}`}>
              {change > 0 && '+'}
              {change.toFixed(1)}%
            </div>
          </div>
        );
      });

      // 可拖拽面板
      const DraggablePanel = ({ id, title, children, onDragEnd }) => {
        const [isDragging, setIsDragging] = useState(false);
        const panelRef = useRef(null);
        
        const handleDragStart = (e) => {
          setIsDragging(true);
          e.dataTransfer.setData('panelId', id);
          e.dataTransfer.effectAllowed = 'move';
        };
        
        const handleDragEnd = () => {
          setIsDragging(false);
        };
        
        return (
          <div
            ref={panelRef}
            className={`panel ${isDragging ? 'dragging' : ''}`}
            draggable
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="panel-header">
              <h3>{title}</h3>
              <span className="drag-handle">⋮⋮</span>
            </div>
            <div className="panel-content">
              {children}
            </div>
          </div>
        );
      };

      // 主仪表盘组件
      const InteractiveDashboard = () => {
        const [theme, setTheme] = useState('light');
        const [timeRange, setTimeRange] = useState('1h');
        const [data, setData] = useState([]);
        const [isRealtime, setIsRealtime] = useState(true);
        const [panels, setPanels] = useState([
          { id: 'metrics', order: 0 },
          { id: 'cpu', order: 1 },
          { id: 'memory', order: 2 },
          { id: 'network', order: 3 },
          { id: 'logs', order: 4 }
        ]);
        const [isPending, startTransition] = useTransition();
        const deferredData = useDeferredValue(data);
        const wsRef = useRef(null);
        const updateCountRef = useRef(0);
        const renderCountRef = useRef(0);
        
        // 使用主题CSS
        useThemeCSS(theme);
        
        // 聚合数据
        const { filtered, aggregated } = useMemo(() => 
          aggregateData(deferredData, timeRange),
          [deferredData, timeRange]
        );
        
        // 计算变化率
        const changes = useMemo(() => {
          if (filtered.length < 2) return { cpu: 0, memory: 0, requests: 0, errors: 0 };
          
          const recent = filtered.slice(-10);
          const older = filtered.slice(-20, -10);
          
          const recentAvg = {
            cpu: recent.reduce((sum, item) => sum + item.cpu, 0) / recent.length,
            memory: recent.reduce((sum, item) => sum + item.memory, 0) / recent.length,
            requests: recent.reduce((sum, item) => sum + item.requests, 0) / recent.length,
            errors: recent.reduce((sum, item) => sum + item.errors, 0) / recent.length
          };
          
          const olderAvg = {
            cpu: older.reduce((sum, item) => sum + item.cpu, 0) / older.length,
            memory: older.reduce((sum, item) => sum + item.memory, 0) / older.length,
            requests: older.reduce((sum, item) => sum + item.requests, 0) / older.length,
            errors: older.reduce((sum, item) => sum + item.errors, 0) / older.length
          };
          
          return {
            cpu: ((recentAvg.cpu - olderAvg.cpu) / olderAvg.cpu) * 100,
            memory: ((recentAvg.memory - olderAvg.memory) / olderAvg.memory) * 100,
            requests: ((recentAvg.requests - olderAvg.requests) / olderAvg.requests) * 100,
            errors: ((recentAvg.errors - olderAvg.errors) / olderAvg.errors) * 100
          };
        }, [filtered]);
        
        // 模拟WebSocket连接
        useEffect(() => {
          if (!isRealtime) return;
          
          const interval = setInterval(() => {
            const newData = generateRealtimeData();
            
            // 展示自动批处理
            setData(prev => [...prev, newData].slice(-1000));
            updateCountRef.current += 1;
            
            // 模拟多个状态更新（会被批处理）
            if (Math.random() > 0.8) {
              setData(prev => {
                const updated = [...prev];
                updated[updated.length - 1].errors += 10;
                return updated;
              });
              updateCountRef.current += 1;
            }
          }, 1000);
          
          return () => clearInterval(interval);
        }, [isRealtime]);
        
        // 渲染计数
        useEffect(() => {
          renderCountRef.current += 1;
          console.log(`Render #${renderCountRef.current}, Updates: ${updateCountRef.current}`);
        });
        
        // 处理时间范围变更
        const handleTimeRangeChange = (range) => {
          startTransition(() => {
            setTimeRange(range);
          });
        };
        
        // 处理主题切换
        const handleThemeToggle = () => {
          setTheme(prev => prev === 'light' ? 'dark' : 'light');
        };
        
        // 强制同步更新示例
        const handleUrgentUpdate = () => {
          flushSync(() => {
            setData(prev => [...prev, {
              ...generateRealtimeData(),
              errors: 100,
              latency: 500
            }]);
          });
          
          // DOM已更新，可以立即操作
          alert('紧急数据已更新！');
        };
        
        // 导出数据
        const handleExport = useCallback(() => {
          const exportData = {
            timeRange,
            dataPoints: filtered.length,
            aggregated,
            exportTime: new Date().toISOString()
          };
          
          const blob = new Blob([JSON.stringify(exportData, null, 2)], 
            { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `dashboard-export-${Date.now()}.json`;
          a.click();
          URL.revokeObjectURL(url);
        }, [filtered, aggregated, timeRange]);
        
        const sortedPanels = [...panels].sort((a, b) => a.order - b.order);
        
        return (
          <div className={`dashboard theme-${theme}`}>
            <header className="dashboard-header">
              <h1>React 18 交互式仪表盘</h1>
              <div className="header-controls">
                <div className="time-range-selector">
                  {['1h', '6h', '24h', '7d'].map(range => (
                    <button
                      key={range}
                      className={`range-button ${timeRange === range ? 'active' : ''} ${isPending ? 'pending' : ''}`}
                      onClick={() => handleTimeRangeChange(range)}
                    >
                      {range}
                    </button>
                  ))}
                </div>
                
                <button 
                  className={`realtime-toggle ${isRealtime ? 'active' : ''}`}
                  onClick={() => setIsRealtime(!isRealtime)}
                >
                  {isRealtime ? '⚡ 实时' : '⏸ 暂停'}
                </button>
                
                <button onClick={handleThemeToggle} className="theme-toggle">
                  {theme === 'light' ? '🌙' : '☀️'}
                </button>
                
                <button onClick={handleExport} className="export-button">
                  📊 导出
                </button>
                
                <button onClick={handleUrgentUpdate} className="urgent-button">
                  🚨 紧急更新
                </button>
              </div>
            </header>
            
            <div className="dashboard-stats">
              <span>数据点: {filtered.length}</span>
              <span>更新次数: {updateCountRef.current}</span>
              <span>渲染次数: {renderCountRef.current}</span>
              <span>批处理效率: {(updateCountRef.current / renderCountRef.current).toFixed(2)}</span>
            </div>
            
            <div className={`dashboard-content ${isPending ? 'pending' : ''}`}>
              {sortedPanels.map(panel => {
                switch (panel.id) {
                  case 'metrics':
                    return (
                      <DraggablePanel key={panel.id} id={panel.id} title="关键指标">
                        <div className="metrics-grid">
                          <MetricCard
                            title="CPU使用率"
                            value={aggregated.avgCpu}
                            unit="%"
                            change={changes.cpu}
                            icon="💻"
                          />
                          <MetricCard
                            title="内存使用率"
                            value={aggregated.avgMemory}
                            unit="%"
                            change={changes.memory}
                            icon="🧠"
                          />
                          <MetricCard
                            title="请求总数"
                            value={aggregated.totalRequests}
                            change={changes.requests}
                            icon="📊"
                          />
                          <MetricCard
                            title="错误总数"
                            value={aggregated.totalErrors}
                            change={changes.errors}
                            icon="⚠️"
                          />
                          <MetricCard
                            title="平均延迟"
                            value={aggregated.avgLatency}
                            unit="ms"
                            change={0}
                            icon="⏱️"
                          />
                          <MetricCard
                            title="峰值用户"
                            value={aggregated.peakUsers}
                            change={0}
                            icon="👥"
                          />
                        </div>
                      </DraggablePanel>
                    );
                    
                  case 'cpu':
                    return (
                      <DraggablePanel key={panel.id} id={panel.id} title="CPU 使用率">
                        <LineChart 
                          data={filtered} 
                          dataKey="cpu" 
                          color="var(--chart-color-1)"
                        />
                      </DraggablePanel>
                    );
                    
                  case 'memory':
                    return (
                      <DraggablePanel key={panel.id} id={panel.id} title="内存使用率">
                        <LineChart 
                          data={filtered} 
                          dataKey="memory" 
                          color="var(--chart-color-2)"
                        />
                      </DraggablePanel>
                    );
                    
                  case 'network':
                    return (
                      <DraggablePanel key={panel.id} id={panel.id} title="网络流量">
                        <LineChart 
                          data={filtered} 
                          dataKey="network" 
                          color="var(--chart-color-3)"
                        />
                      </DraggablePanel>
                    );
                    
                  case 'logs':
                    return (
                      <DraggablePanel key={panel.id} id={panel.id} title="实时日志">
                        <div className="logs-container">
                          {filtered.slice(-10).reverse().map((item, index) => (
                            <div key={index} className="log-entry">
                              <span className="log-time">
                                {new Date(item.timestamp).toLocaleTimeString()}
                              </span>
                              <span className={`log-level ${item.errors > 20 ? 'error' : 'info'}`}>
                                {item.errors > 20 ? 'ERROR' : 'INFO'}
                              </span>
                              <span className="log-message">
                                {item.errors > 20 
                                  ? `检测到${item.errors}个错误` 
                                  : `处理了${item.requests}个请求`}
                              </span>
                            </div>
                          ))}
                        </div>
                      </DraggablePanel>
                    );
                    
                  default:
                    return null;
                }
              })}
            </div>
          </div>
        );
      };

      export default InteractiveDashboard;

  - name: "StreamingBlog.jsx"
    description: "流式SSR博客平台"
    code: |
      import React, { Suspense, lazy, useState, useEffect } from 'react';
      import './StreamingBlog.css';

      // 模拟数据获取
      const fetchPost = (id) => {
        let status = 'pending';
        let result;
        
        const suspender = new Promise((resolve) => {
          setTimeout(() => {
            const post = {
              id,
              title: `深入理解React 18并发特性 - Part ${id}`,
              author: { name: 'React专家', avatar: 'https://i.pravatar.cc/150?img=1' },
              date: new Date().toLocaleDateString(),
              readTime: '8分钟',
              content: `
                <h2>引言</h2>
                <p>React 18带来了革命性的并发渲染机制，这是React架构的重大升级。本文将深入探讨这些新特性如何改变我们构建用户界面的方式。</p>
                
                <h2>并发渲染的核心概念</h2>
                <p>并发渲染允许React在渲染过程中暂停、恢复或放弃工作。这意味着React可以同时准备多个版本的UI，而不会阻塞主线程。</p>
                
                <h3>1. 可中断渲染</h3>
                <p>React 18可以中断正在进行的渲染工作，优先处理更紧急的更新。这确保了用户输入等高优先级任务能够快速响应。</p>
                
                <h3>2. 优先级调度</h3>
                <p>不同类型的更新被赋予不同的优先级。用户交互（如点击、输入）具有最高优先级，而数据获取等操作可以延迟。</p>
                
                <h2>实际应用场景</h2>
                <p>让我们看看如何在实际项目中应用这些特性...</p>
              `,
              tags: ['React 18', '并发渲染', '性能优化', 'Web开发'],
              likes: Math.floor(Math.random() * 1000),
              views: Math.floor(Math.random() * 10000)
            };
            
            status = 'success';
            result = post;
            resolve(post);
          }, 1000 + Math.random() * 2000);
        });
        
        return {
          read() {
            if (status === 'pending') throw suspender;
            return result;
          }
        };
      };

      const fetchComments = (postId) => {
        let status = 'pending';
        let result;
        
        const suspender = new Promise((resolve) => {
          setTimeout(() => {
            const comments = Array.from({ length: 5 }, (_, i) => ({
              id: i + 1,
              author: `用户${i + 1}`,
              avatar: `https://i.pravatar.cc/150?img=${i + 10}`,
              date: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
              content: `这是一篇很棒的文章！第${i + 1}个评论展示了React 18的强大功能。`,
              likes: Math.floor(Math.random() * 100)
            }));
            
            status = 'success';
            result = comments;
            resolve(comments);
          }, 2000 + Math.random() * 2000);
        });
        
        return {
          read() {
            if (status === 'pending') throw suspender;
            return result;
          }
        };
      };

      const fetchRelatedPosts = (postId) => {
        let status = 'pending';
        let result;
        
        const suspender = new Promise((resolve) => {
          setTimeout(() => {
            const posts = Array.from({ length: 4 }, (_, i) => ({
              id: postId + i + 1,
              title: `React ${18 + i}相关文章`,
              excerpt: '探索React生态系统的最新发展...',
              thumbnail: `https://picsum.photos/300/200?random=${postId + i}`,
              readTime: `${5 + i}分钟`
            }));
            
            status = 'success';
            result = posts;
            resolve(posts);
          }, 3000 + Math.random() * 2000);
        });
        
        return {
          read() {
            if (status === 'pending') throw suspender;
            return result;
          }
        };
      };

      // 骨架屏组件
      const HeaderSkeleton = () => (
        <div className="skeleton-header">
          <div className="skeleton-title" />
          <div className="skeleton-meta" />
        </div>
      );

      const ContentSkeleton = () => (
        <div className="skeleton-content">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="skeleton-paragraph" />
          ))}
        </div>
      );

      const CommentsSkeleton = () => (
        <div className="skeleton-comments">
          {[1, 2, 3].map(i => (
            <div key={i} className="skeleton-comment" />
          ))}
        </div>
      );

      const RelatedSkeleton = () => (
        <div className="skeleton-related">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="skeleton-card" />
          ))}
        </div>
      );

      // 文章头部组件
      const PostHeader = ({ resource }) => {
        const post = resource.read();
        
        return (
          <header className="post-header">
            <h1>{post.title}</h1>
            <div className="post-meta">
              <img src={post.author.avatar} alt={post.author.name} className="author-avatar" />
              <div className="meta-info">
                <span className="author-name">{post.author.name}</span>
                <span className="post-date">{post.date}</span>
                <span className="read-time">📖 {post.readTime}</span>
              </div>
            </div>
            <div className="post-stats">
              <span>👁️ {post.views.toLocaleString()} 阅读</span>
              <span>❤️ {post.likes} 赞</span>
            </div>
          </header>
        );
      };

      // 文章内容组件
      const PostContent = ({ resource }) => {
        const post = resource.read();
        const [readProgress, setReadProgress] = useState(0);
        
        useEffect(() => {
          const handleScroll = () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = (scrollTop / docHeight) * 100;
            setReadProgress(Math.min(progress, 100));
          };
          
          window.addEventListener('scroll', handleScroll);
          return () => window.removeEventListener('scroll', handleScroll);
        }, []);
        
        // 保存阅读进度
        useEffect(() => {
          if (readProgress > 10) {
            localStorage.setItem(`post-${post.id}-progress`, readProgress.toString());
          }
        }, [readProgress, post.id]);
        
        return (
          <>
            <div className="reading-progress" style={{ width: `${readProgress}%` }} />
            <article className="post-content">
              <div dangerouslySetInnerHTML={{ __html: post.content }} />
              <div className="post-tags">
                {post.tags.map(tag => (
                  <span key={tag} className="tag">{tag}</span>
                ))}
              </div>
            </article>
          </>
        );
      };

      // 评论组件
      const Comments = ({ resource }) => {
        const comments = resource.read();
        const [newComment, setNewComment] = useState('');
        const [localComments, setLocalComments] = useState(comments);
        
        const handleSubmit = (e) => {
          e.preventDefault();
          if (newComment.trim()) {
            const comment = {
              id: Date.now(),
              author: '当前用户',
              avatar: 'https://i.pravatar.cc/150?img=99',
              date: new Date().toLocaleDateString(),
              content: newComment,
              likes: 0
            };
            setLocalComments([comment, ...localComments]);
            setNewComment('');
          }
        };
        
        return (
          <section className="comments-section">
            <h2>评论 ({localComments.length})</h2>
            
            <form onSubmit={handleSubmit} className="comment-form">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="分享你的想法..."
                rows={4}
              />
              <button type="submit">发表评论</button>
            </form>
            
            <div className="comments-list">
              {localComments.map(comment => (
                <div key={comment.id} className="comment">
                  <img src={comment.avatar} alt={comment.author} className="comment-avatar" />
                  <div className="comment-content">
                    <div className="comment-header">
                      <span className="comment-author">{comment.author}</span>
                      <span className="comment-date">{comment.date}</span>
                    </div>
                    <p>{comment.content}</p>
                    <button className="like-button">👍 {comment.likes}</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      };

      // 相关文章组件
      const RelatedPosts = ({ resource }) => {
        const posts = resource.read();
        
        return (
          <section className="related-posts">
            <h2>相关文章</h2>
            <div className="related-grid">
              {posts.map(post => (
                <article key={post.id} className="related-card">
                  <img src={post.thumbnail} alt={post.title} />
                  <h3>{post.title}</h3>
                  <p>{post.excerpt}</p>
                  <span className="read-time">📖 {post.readTime}</span>
                </article>
              ))}
            </div>
          </section>
        );
      };

      // 主博客组件
      const StreamingBlog = () => {
        const [postId, setPostId] = useState(1);
        const [resources, setResources] = useState(() => ({
          post: fetchPost(postId),
          comments: fetchComments(postId),
          related: fetchRelatedPosts(postId)
        }));
        
        // 处理文章切换
        const handlePostChange = (newId) => {
          setPostId(newId);
          setResources({
            post: fetchPost(newId),
            comments: fetchComments(newId),
            related: fetchRelatedPosts(newId)
          });
        };
        
        return (
          <div className="streaming-blog">
            <nav className="blog-nav">
              <h1>React 18 博客</h1>
              <div className="nav-links">
                <a href="#" onClick={() => handlePostChange(1)}>文章1</a>
                <a href="#" onClick={() => handlePostChange(2)}>文章2</a>
                <a href="#" onClick={() => handlePostChange(3)}>文章3</a>
              </div>
            </nav>
            
            <main className="blog-main">
              <Suspense fallback={<HeaderSkeleton />}>
                <PostHeader resource={resources.post} />
              </Suspense>
              
              <Suspense fallback={<ContentSkeleton />}>
                <PostContent resource={resources.post} />
                
                <Suspense fallback={<CommentsSkeleton />}>
                  <Comments resource={resources.comments} />
                </Suspense>
              </Suspense>
              
              <Suspense fallback={<RelatedSkeleton />}>
                <RelatedPosts resource={resources.related} />
              </Suspense>
            </main>
            
            <aside className="blog-sidebar">
              <div className="sidebar-widget">
                <h3>目录</h3>
                <ul className="toc">
                  <li><a href="#intro">引言</a></li>
                  <li><a href="#concepts">核心概念</a></li>
                  <li><a href="#applications">应用场景</a></li>
                </ul>
              </div>
              
              <div className="sidebar-widget">
                <h3>订阅更新</h3>
                <form className="subscribe-form">
                  <input type="email" placeholder="你的邮箱" />
                  <button type="submit">订阅</button>
                </form>
              </div>
            </aside>
          </div>
        );
      };

      // 服务端渲染代码（示例）
      export const serverRender = `
      import { renderToPipeableStream } from 'react-dom/server';
      import { StaticRouter } from 'react-router-dom/server';

      app.get('/blog/:id', (req, res) => {
        const { pipe, abort } = renderToPipeableStream(
          <StaticRouter location={req.url}>
            <StreamingBlog postId={req.params.id} />
          </StaticRouter>,
          {
            bootstrapScripts: ['/client.js'],
            onShellReady() {
              res.statusCode = 200;
              res.setHeader('Content-type', 'text/html; charset=utf-8');
              res.write('<!DOCTYPE html><html><head>');
              res.write('<meta charset="utf-8">');
              res.write('<title>React 18 博客</title>');
              res.write('<link rel="stylesheet" href="/styles.css">');
              res.write('</head><body><div id="root">');
              pipe(res);
            },
            onShellError(error) {
              console.error(error);
              res.statusCode = 500;
              res.send('<!DOCTYPE html><h1>服务器错误</h1>');
            },
            onAllReady() {
              res.end('</div></body></html>');
            },
            onError(error) {
              console.error('流式渲染错误:', error);
            }
          }
        );

        // 设置超时
        setTimeout(() => {
          abort();
        }, 10000);
      });
      `;

      // 客户端hydration代码（示例）
      export const clientHydration = `
      import { hydrateRoot } from 'react-dom/client';
      import { BrowserRouter } from 'react-router-dom';

      const container = document.getElementById('root');

      // 选择性hydration
      const root = hydrateRoot(
        container,
        <BrowserRouter>
          <StreamingBlog />
        </BrowserRouter>,
        {
          onRecoverableError: (error) => {
            console.error('Hydration错误:', error);
          }
        }
      );

      // 记录hydration性能
      if (typeof window !== 'undefined') {
        window.addEventListener('load', () => {
          const perfData = performance.getEntriesByType('navigation')[0];
          console.log('页面加载性能:', {
            domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
            loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
            totalTime: perfData.loadEventEnd - perfData.fetchStart
          });
        });
      }
      `;

      export default StreamingBlog;

  - name: "styles.css"
    description: "样式文件"
    code: |
      /* SearchApp.css */
      .search-app {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }

      .search-header {
        margin-bottom: 2rem;
      }

      .search-header h1 {
        margin: 0 0 1rem 0;
        color: #1a1a1a;
      }

      .status-bar {
        display: flex;
        gap: 2rem;
        font-size: 0.875rem;
      }

      .online-status {
        display: flex;
        align-items: center;
        gap: 0.25rem;
      }

      .online-status.online {
        color: #10b981;
      }

      .online-status.offline {
        color: #ef4444;
      }

      .performance-metrics {
        color: #6b7280;
      }

      .search-form {
        margin-bottom: 2rem;
        position: relative;
      }

      .search-input-wrapper {
        position: relative;
      }

      .search-input {
        width: 100%;
        padding: 1rem;
        font-size: 1.125rem;
        border: 2px solid #e5e7eb;
        border-radius: 8px;
        transition: border-color 0.2s;
      }

      .search-input:focus {
        outline: none;
        border-color: #3b82f6;
      }

      .loading-indicator {
        position: absolute;
        right: 1rem;
        top: 50%;
        transform: translateY(-50%);
        color: #3b82f6;
        font-size: 0.875rem;
      }

      .suggestions {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        margin-top: 0.5rem;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        z-index: 10;
      }

      .suggestion-item {
        display: block;
        width: 100%;
        padding: 0.75rem 1rem;
        text-align: left;
        border: none;
        background: none;
        cursor: pointer;
        transition: background-color 0.2s;
      }

      .suggestion-item:hover {
        background-color: #f3f4f6;
      }

      .filters {
        display: flex;
        gap: 1rem;
        margin-bottom: 2rem;
      }

      .filters select {
        padding: 0.5rem 1rem;
        border: 1px solid #e5e7eb;
        border-radius: 4px;
        background: white;
        cursor: pointer;
      }

      .filters select.pending {
        opacity: 0.6;
        cursor: wait;
      }

      .search-history {
        margin-bottom: 2rem;
        padding: 1rem;
        background: #f9fafb;
        border-radius: 8px;
      }

      .search-history h3 {
        margin: 0 0 0.5rem 0;
        font-size: 1rem;
      }

      .history-items {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
      }

      .history-item {
        padding: 0.25rem 0.75rem;
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 20px;
        font-size: 0.875rem;
        cursor: pointer;
        transition: all 0.2s;
      }

      .history-item:hover {
        background: #3b82f6;
        color: white;
        border-color: #3b82f6;
      }

      .clear-history {
        padding: 0.25rem 0.75rem;
        background: #ef4444;
        color: white;
        border: none;
        border-radius: 20px;
        font-size: 0.875rem;
        cursor: pointer;
      }

      .search-results {
        transition: opacity 0.3s;
      }

      .search-results.stale {
        opacity: 0.6;
      }

      .search-results h2 {
        margin-bottom: 1rem;
      }

      .virtual-list {
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        background: white;
      }

      .search-result-item {
        padding: 1rem;
        border-bottom: 1px solid #f3f4f6;
        transition: background-color 0.2s;
      }

      .search-result-item:hover {
        background-color: #f9fafb;
      }

      .search-result-item h3 {
        margin: 0 0 0.5rem 0;
        color: #1a1a1a;
      }

      .search-result-item p {
        margin: 0 0 0.5rem 0;
        color: #6b7280;
      }

      .search-result-item mark {
        background-color: #fef3c7;
        padding: 0.125rem;
      }

      .item-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        font-size: 0.75rem;
      }

      .item-meta .category {
        padding: 0.125rem 0.5rem;
        background: #dbeafe;
        color: #1e40af;
        border-radius: 4px;
      }

      .item-meta .tag {
        padding: 0.125rem 0.5rem;
        background: #f3f4f6;
        color: #4b5563;
        border-radius: 4px;
      }

      .item-meta .date,
      .item-meta .views,
      .item-meta .rating {
        color: #9ca3af;
      }

      .no-results {
        padding: 4rem;
        text-align: center;
        color: #6b7280;
      }

      /* InteractiveDashboard.css */
      .dashboard {
        min-height: 100vh;
        background: var(--bg-primary);
        color: var(--text-primary);
        transition: background-color 0.3s, color 0.3s;
      }

      .dashboard-header {
        background: var(--bg-secondary);
        border-bottom: 1px solid var(--border-color);
        padding: 1rem 2rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .dashboard-header h1 {
        margin: 0;
      }

      .header-controls {
        display: flex;
        gap: 1rem;
        align-items: center;
      }

      .time-range-selector {
        display: flex;
        background: var(--bg-primary);
        border-radius: 4px;
        overflow: hidden;
      }

      .range-button {
        padding: 0.5rem 1rem;
        border: none;
        background: transparent;
        color: var(--text-primary);
        cursor: pointer;
        transition: all 0.2s;
      }

      .range-button:hover {
        background: var(--border-color);
      }

      .range-button.active {
        background: var(--chart-color-1);
        color: white;
      }

      .range-button.pending {
        opacity: 0.6;
        cursor: wait;
      }

      .realtime-toggle,
      .theme-toggle,
      .export-button,
      .urgent-button {
        padding: 0.5rem 1rem;
        border: 1px solid var(--border-color);
        background: var(--bg-primary);
        color: var(--text-primary);
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.2s;
      }

      .realtime-toggle.active {
        background: var(--chart-color-2);
        color: white;
        border-color: var(--chart-color-2);
      }

      .urgent-button {
        background: var(--chart-color-3);
        color: white;
        border-color: var(--chart-color-3);
      }

      .dashboard-stats {
        padding: 0.5rem 2rem;
        background: var(--bg-secondary);
        border-bottom: 1px solid var(--border-color);
        display: flex;
        gap: 2rem;
        font-size: 0.875rem;
        color: var(--text-secondary);
      }

      .dashboard-content {
        padding: 2rem;
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
        gap: 1.5rem;
        transition: opacity 0.3s;
      }

      .dashboard-content.pending {
        opacity: 0.7;
      }

      .panel {
        background: var(--bg-secondary);
        border: 1px solid var(--border-color);
        border-radius: 8px;
        overflow: hidden;
        transition: transform 0.2s, box-shadow 0.2s;
      }

      .panel:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }

      .panel.dragging {
        opacity: 0.5;
        cursor: move;
      }

      .panel-header {
        padding: 1rem;
        border-bottom: 1px solid var(--border-color);
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .panel-header h3 {
        margin: 0;
        font-size: 1rem;
      }

      .drag-handle {
        cursor: grab;
        color: var(--text-secondary);
      }

      .panel-content {
        padding: 1rem;
      }

      .metrics-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 1rem;
      }

      .metric-card {
        background: var(--bg-primary);
        border: 1px solid var(--border-color);
        border-radius: 8px;
        padding: 1rem;
      }

      .metric-header {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 0.5rem;
      }

      .metric-icon {
        font-size: 1.5rem;
      }

      .metric-title {
        font-size: 0.75rem;
        color: var(--text-secondary);
      }

      .metric-value {
        font-size: 1.5rem;
        font-weight: 600;
        margin-bottom: 0.25rem;
      }

      .metric-unit {
        font-size: 0.875rem;
        color: var(--text-secondary);
        margin-left: 0.25rem;
      }

      .metric-change {
        font-size: 0.75rem;
      }

      .metric-change.increase {
        color: var(--chart-color-2);
      }

      .metric-change.decrease {
        color: var(--chart-color-3);
      }

      .metric-change.stable {
        color: var(--text-secondary);
      }

      .logs-container {
        max-height: 200px;
        overflow-y: auto;
        font-size: 0.875rem;
        font-family: monospace;
      }

      .log-entry {
        padding: 0.5rem;
        border-bottom: 1px solid var(--border-color);
        display: flex;
        gap: 0.5rem;
      }

      .log-time {
        color: var(--text-secondary);
      }

      .log-level {
        font-weight: 600;
      }

      .log-level.info {
        color: var(--chart-color-2);
      }

      .log-level.error {
        color: var(--chart-color-3);
      }

      .log-message {
        flex: 1;
      }

      /* StreamingBlog.css */
      .streaming-blog {
        min-height: 100vh;
        background: #ffffff;
      }

      .blog-nav {
        background: #1a1a1a;
        color: white;
        padding: 1rem 2rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .blog-nav h1 {
        margin: 0;
        font-size: 1.5rem;
      }

      .nav-links {
        display: flex;
        gap: 2rem;
      }

      .nav-links a {
        color: white;
        text-decoration: none;
        transition: opacity 0.2s;
      }

      .nav-links a:hover {
        opacity: 0.8;
      }

      .blog-main {
        max-width: 800px;
        margin: 0 auto;
        padding: 2rem;
        display: flex;
        flex-direction: column;
        gap: 3rem;
      }

      .post-header {
        text-align: center;
        padding-bottom: 2rem;
        border-bottom: 1px solid #e5e7eb;
      }

      .post-header h1 {
        margin: 0 0 1rem 0;
        font-size: 2.5rem;
        line-height: 1.2;
      }

      .post-meta {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 1rem;
        margin-bottom: 1rem;
      }

      .author-avatar {
        width: 48px;
        height: 48px;
        border-radius: 50%;
      }

      .meta-info {
        display: flex;
        flex-direction: column;
        text-align: left;
      }

      .author-name {
        font-weight: 600;
      }

      .post-date,
      .read-time {
        color: #6b7280;
        font-size: 0.875rem;
      }

      .post-stats {
        display: flex;
        gap: 2rem;
        justify-content: center;
        color: #6b7280;
      }

      .reading-progress {
        position: fixed;
        top: 0;
        left: 0;
        height: 4px;
        background: #3b82f6;
        z-index: 100;
        transition: width 0.1s;
      }

      .post-content {
        line-height: 1.8;
        font-size: 1.125rem;
      }

      .post-content h2 {
        margin: 2rem 0 1rem 0;
        font-size: 1.75rem;
      }

      .post-content h3 {
        margin: 1.5rem 0 0.75rem 0;
        font-size: 1.375rem;
      }

      .post-content p {
        margin-bottom: 1.5rem;
      }

      .post-tags {
        display: flex;
        gap: 0.5rem;
        margin-top: 2rem;
      }

      .tag {
        padding: 0.25rem 0.75rem;
        background: #e0e7ff;
        color: #4338ca;
        border-radius: 20px;
        font-size: 0.875rem;
      }

      .comments-section {
        padding-top: 2rem;
        border-top: 1px solid #e5e7eb;
      }

      .comment-form {
        margin-bottom: 2rem;
      }

      .comment-form textarea {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        resize: vertical;
        font-family: inherit;
      }

      .comment-form button {
        margin-top: 0.5rem;
        padding: 0.5rem 1.5rem;
        background: #3b82f6;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      }

      .comments-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .comment {
        display: flex;
        gap: 1rem;
        padding: 1rem;
        background: #f9fafb;
        border-radius: 8px;
      }

      .comment-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
      }

      .comment-content {
        flex: 1;
      }

      .comment-header {
        display: flex;
        gap: 1rem;
        margin-bottom: 0.5rem;
      }

      .comment-author {
        font-weight: 600;
      }

      .comment-date {
        color: #6b7280;
        font-size: 0.875rem;
      }

      .like-button {
        margin-top: 0.5rem;
        padding: 0.25rem 0.75rem;
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.875rem;
      }

      .related-posts {
        padding-top: 2rem;
        border-top: 1px solid #e5e7eb;
      }

      .related-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1.5rem;
        margin-top: 1rem;
      }

      .related-card {
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        overflow: hidden;
        transition: transform 0.2s;
      }

      .related-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }

      .related-card img {
        width: 100%;
        height: 150px;
        object-fit: cover;
      }

      .related-card h3 {
        margin: 1rem;
        font-size: 1.125rem;
      }

      .related-card p {
        margin: 0 1rem 1rem 1rem;
        color: #6b7280;
      }

      .related-card .read-time {
        display: block;
        margin: 0 1rem 1rem 1rem;
        color: #9ca3af;
        font-size: 0.875rem;
      }

      .blog-sidebar {
        position: fixed;
        right: 2rem;
        top: 6rem;
        width: 250px;
      }

      .sidebar-widget {
        background: #f9fafb;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        padding: 1.5rem;
        margin-bottom: 1.5rem;
      }

      .sidebar-widget h3 {
        margin: 0 0 1rem 0;
        font-size: 1rem;
      }

      .toc {
        list-style: none;
        padding: 0;
        margin: 0;
      }

      .toc li {
        margin-bottom: 0.5rem;
      }

      .toc a {
        color: #6b7280;
        text-decoration: none;
      }

      .toc a:hover {
        color: #3b82f6;
      }

      .subscribe-form {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .subscribe-form input {
        padding: 0.5rem;
        border: 1px solid #e5e7eb;
        border-radius: 4px;
      }

      .subscribe-form button {
        padding: 0.5rem;
        background: #3b82f6;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      }

      /* 骨架屏样式 */
      .skeleton-header,
      .skeleton-content,
      .skeleton-comments,
      .skeleton-related {
        animation: pulse 1.5s ease-in-out infinite;
      }

      @keyframes pulse {
        0%, 100% {
          opacity: 1;
        }
        50% {
          opacity: 0.5;
        }
      }

      .skeleton-title {
        height: 3rem;
        background: #e5e7eb;
        border-radius: 4px;
        margin-bottom: 1rem;
      }

      .skeleton-meta {
        height: 2rem;
        background: #e5e7eb;
        border-radius: 4px;
        width: 60%;
        margin: 0 auto;
      }

      .skeleton-paragraph {
        height: 1rem;
        background: #e5e7eb;
        border-radius: 4px;
        margin-bottom: 1rem;
      }

      .skeleton-paragraph:nth-child(odd) {
        width: 90%;
      }

      .skeleton-paragraph:nth-child(even) {
        width: 80%;
      }

      .skeleton-comment {
        height: 4rem;
        background: #e5e7eb;
        border-radius: 8px;
        margin-bottom: 1rem;
      }

      .skeleton-card {
        height: 200px;
        background: #e5e7eb;
        border-radius: 8px;
      }

      @media (max-width: 1200px) {
        .blog-sidebar {
          display: none;
        }
      }

      @media (max-width: 768px) {
        .dashboard-content {
          grid-template-columns: 1fr;
        }
        
        .metrics-grid {
          grid-template-columns: 1fr 1fr;
        }
        
        .related-grid {
          grid-template-columns: 1fr;
        }
      }
---