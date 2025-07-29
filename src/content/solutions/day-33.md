---
day: 33
exerciseTitle: "React性能优化练习"
approach: "使用React性能优化技巧构建高性能应用，包括虚拟滚动、缓存策略、懒加载和Web Workers"
keyTakeaways:
  - "虚拟滚动处理大数据集"
  - "React.memo和自定义比较函数"
  - "useMemo缓存昂贵计算"
  - "useCallback稳定函数引用"
  - "Web Workers处理复杂计算"
commonMistakes:
  - "过度使用React.memo"
  - "忘记处理边界情况"
  - "不当的依赖数组"
  - "内存泄漏风险"
extensions:
  - "添加移动端优化"
  - "实现服务端渲染"
  - "集成性能监控"
  - "添加PWA功能"
files:
  - name: "DataTable.jsx"
    description: "高性能虚拟滚动数据表格"
    code: |
      import React, { useState, useMemo, useCallback, useRef, useEffect, memo } from 'react';
      import './DataTable.css';

      // 生成测试数据
      const generateData = (count) => {
        return Array.from({ length: count }, (_, i) => ({
          id: i + 1,
          name: `User ${i + 1}`,
          email: `user${i + 1}@example.com`,
          age: Math.floor(Math.random() * 50) + 20,
          department: ['Engineering', 'Sales', 'Marketing', 'HR'][Math.floor(Math.random() * 4)],
          salary: Math.floor(Math.random() * 100000) + 50000,
          joinDate: new Date(2020 + Math.floor(Math.random() * 4), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28))
        }));
      };

      // 虚拟滚动Hook
      const useVirtualScroll = (items, rowHeight, containerHeight, overscan = 5) => {
        const [scrollTop, setScrollTop] = useState(0);
        
        const visibleRange = useMemo(() => {
          const start = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
          const end = Math.min(
            items.length,
            Math.ceil((scrollTop + containerHeight) / rowHeight) + overscan
          );
          return { start, end };
        }, [scrollTop, items.length, rowHeight, containerHeight, overscan]);

        const visibleItems = useMemo(
          () => items.slice(visibleRange.start, visibleRange.end),
          [items, visibleRange]
        );

        const totalHeight = items.length * rowHeight;
        const offsetY = visibleRange.start * rowHeight;

        return {
          visibleItems,
          totalHeight,
          offsetY,
          onScroll: (e) => setScrollTop(e.target.scrollTop),
          startIndex: visibleRange.start
        };
      };

      // 表格行组件（使用React.memo优化）
      const TableRow = memo(({ data, columns, isSelected, onSelect, style }) => {
        return (
          <tr style={style} className={isSelected ? 'selected' : ''}>
            <td>
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onSelect(data.id)}
              />
            </td>
            {columns.map(col => (
              <td key={col.key}>{col.render ? col.render(data[col.key], data) : data[col.key]}</td>
            ))}
          </tr>
        );
      }, (prevProps, nextProps) => {
        return (
          prevProps.data.id === nextProps.data.id &&
          prevProps.isSelected === nextProps.isSelected &&
          prevProps.style.transform === nextProps.style.transform
        );
      });

      const DataTable = () => {
        const [data] = useState(() => generateData(10000));
        const [filters, setFilters] = useState({});
        const [sortConfig, setSortConfig] = useState(null);
        const [selectedRows, setSelectedRows] = useState(new Set());
        const containerRef = useRef(null);
        const [containerHeight, setContainerHeight] = useState(600);

        const columns = [
          { key: 'id', label: 'ID', sortable: true },
          { key: 'name', label: 'Name', sortable: true, filterable: true },
          { key: 'email', label: 'Email', sortable: true, filterable: true },
          { key: 'age', label: 'Age', sortable: true, filterable: true },
          { key: 'department', label: 'Department', sortable: true, filterable: true },
          {
            key: 'salary',
            label: 'Salary',
            sortable: true,
            render: (value) => `$${value.toLocaleString()}`
          },
          {
            key: 'joinDate',
            label: 'Join Date',
            sortable: true,
            render: (value) => value.toLocaleDateString()
          }
        ];

        // 过滤数据
        const filteredData = useMemo(() => {
          return data.filter(row => {
            return Object.entries(filters).every(([key, value]) => {
              if (!value) return true;
              const cellValue = String(row[key]).toLowerCase();
              return cellValue.includes(value.toLowerCase());
            });
          });
        }, [data, filters]);

        // 排序数据
        const sortedData = useMemo(() => {
          if (!sortConfig) return filteredData;

          return [...filteredData].sort((a, b) => {
            const aValue = a[sortConfig.key];
            const bValue = b[sortConfig.key];

            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
          });
        }, [filteredData, sortConfig]);

        // 虚拟滚动
        const {
          visibleItems,
          totalHeight,
          offsetY,
          onScroll,
          startIndex
        } = useVirtualScroll(sortedData, 40, containerHeight);

        // 处理排序
        const handleSort = useCallback((key) => {
          setSortConfig(prev => ({
            key,
            direction: prev?.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
          }));
        }, []);

        // 处理过滤
        const handleFilter = useCallback((key, value) => {
          setFilters(prev => ({ ...prev, [key]: value }));
        }, []);

        // 处理行选择
        const handleSelectRow = useCallback((id) => {
          setSelectedRows(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
              newSet.delete(id);
            } else {
              newSet.add(id);
            }
            return newSet;
          });
        }, []);

        // 全选/取消全选
        const handleSelectAll = useCallback(() => {
          if (selectedRows.size === sortedData.length) {
            setSelectedRows(new Set());
          } else {
            setSelectedRows(new Set(sortedData.map(row => row.id)));
          }
        }, [selectedRows.size, sortedData]);

        // 导出数据
        const exportData = useCallback((format) => {
          const exportRows = selectedRows.size > 0
            ? sortedData.filter(row => selectedRows.has(row.id))
            : sortedData;

          if (format === 'csv') {
            const headers = columns.map(col => col.label).join(',');
            const rows = exportRows.map(row =>
              columns.map(col => row[col.key]).join(',')
            ).join('\n');
            const csv = `${headers}\n${rows}`;
            
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'data.csv';
            a.click();
            URL.revokeObjectURL(url);
          } else if (format === 'json') {
            const json = JSON.stringify(exportRows, null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'data.json';
            a.click();
            URL.revokeObjectURL(url);
          }
        }, [selectedRows, sortedData, columns]);

        // 监听容器大小变化
        useEffect(() => {
          const observer = new ResizeObserver(entries => {
            const entry = entries[0];
            if (entry) {
              setContainerHeight(entry.contentRect.height);
            }
          });

          if (containerRef.current) {
            observer.observe(containerRef.current);
          }

          return () => observer.disconnect();
        }, []);

        return (
          <div className="data-table-container">
            <div className="table-controls">
              <div className="filters">
                {columns.filter(col => col.filterable).map(col => (
                  <input
                    key={col.key}
                    type="text"
                    placeholder={`Filter ${col.label}`}
                    onChange={(e) => handleFilter(col.key, e.target.value)}
                  />
                ))}
              </div>
              <div className="actions">
                <button onClick={() => exportData('csv')}>Export CSV</button>
                <button onClick={() => exportData('json')}>Export JSON</button>
                <span>{selectedRows.size} selected</span>
              </div>
            </div>

            <div 
              ref={containerRef}
              className="table-scroll-container" 
              onScroll={onScroll}
              style={{ height: '600px', overflow: 'auto' }}
            >
              <table className="data-table">
                <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                  <tr>
                    <th>
                      <input
                        type="checkbox"
                        checked={selectedRows.size === sortedData.length && sortedData.length > 0}
                        onChange={handleSelectAll}
                      />
                    </th>
                    {columns.map(col => (
                      <th
                        key={col.key}
                        onClick={() => col.sortable && handleSort(col.key)}
                        style={{ cursor: col.sortable ? 'pointer' : 'default' }}
                      >
                        {col.label}
                        {sortConfig?.key === col.key && (
                          <span>{sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}</span>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody style={{ height: `${totalHeight}px`, position: 'relative' }}>
                  {visibleItems.map((row, index) => (
                    <TableRow
                      key={row.id}
                      data={row}
                      columns={columns}
                      isSelected={selectedRows.has(row.id)}
                      onSelect={handleSelectRow}
                      style={{
                        position: 'absolute',
                        top: 0,
                        transform: `translateY(${(startIndex + index) * 40}px)`,
                        width: '100%'
                      }}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            <div className="table-info">
              Showing {visibleItems.length} of {sortedData.length} rows
            </div>
          </div>
        );
      };

      export default DataTable;

  - name: "SocialMediaFeed.jsx"
    description: "优化的社交媒体信息流"
    code: |
      import React, { useState, useCallback, useRef, useEffect, memo, useMemo } from 'react';
      import './SocialMediaFeed.css';

      // 生成模拟帖子数据
      const generatePost = (id) => ({
        id,
        author: {
          id: Math.floor(Math.random() * 1000),
          name: `User ${Math.floor(Math.random() * 1000)}`,
          avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`
        },
        content: `This is post #${id}. ${Array(Math.floor(Math.random() * 3) + 1).fill('Lorem ipsum dolor sit amet, consectetur adipiscing elit.').join(' ')}`,
        image: Math.random() > 0.5 ? `https://picsum.photos/600/400?random=${id}` : null,
        likes: Math.floor(Math.random() * 1000),
        comments: Math.floor(Math.random() * 100),
        shares: Math.floor(Math.random() * 50),
        timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        isLiked: false
      });

      // Intersection Observer Hook
      const useIntersectionObserver = (ref, options) => {
        const [isIntersecting, setIsIntersecting] = useState(false);
        
        useEffect(() => {
          const observer = new IntersectionObserver(([entry]) => {
            setIsIntersecting(entry.isIntersecting);
          }, options);
          
          const currentRef = ref.current;
          if (currentRef) {
            observer.observe(currentRef);
          }
          
          return () => {
            if (currentRef) {
              observer.unobserve(currentRef);
            }
          };
        }, [ref, options]);
        
        return isIntersecting;
      };

      // 批量更新Hook
      const useBatchUpdate = () => {
        const [updates, setUpdates] = useState([]);
        const timeoutRef = useRef(null);
        
        const batchUpdate = useCallback((update) => {
          setUpdates(prev => [...prev, update]);
        }, []);
        
        useEffect(() => {
          if (updates.length > 0) {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            
            timeoutRef.current = setTimeout(() => {
              // 批量处理所有更新
              console.log('Processing batch updates:', updates.length);
              setUpdates([]);
            }, 16); // 一帧的时间
          }
        }, [updates]);
        
        return batchUpdate;
      };

      // 懒加载图片组件
      const LazyImage = memo(({ src, alt }) => {
        const imgRef = useRef(null);
        const isVisible = useIntersectionObserver(imgRef, {
          threshold: 0.1,
          rootMargin: '50px'
        });
        const [loaded, setLoaded] = useState(false);
        
        return (
          <div ref={imgRef} className="lazy-image-container">
            {isVisible && (
              <img
                src={src}
                alt={alt}
                onLoad={() => setLoaded(true)}
                className={`lazy-image ${loaded ? 'loaded' : ''}`}
              />
            )}
            {!loaded && isVisible && <div className="image-placeholder">Loading...</div>}
          </div>
        );
      });

      // 帖子组件
      const Post = memo(({ post, onLike, onComment, onShare }) => {
        const [isExpanded, setIsExpanded] = useState(false);
        const postRef = useRef(null);
        const isVisible = useIntersectionObserver(postRef, {
          threshold: 0.5
        });
        
        // 格式化时间
        const formatTime = useCallback((date) => {
          const now = new Date();
          const diff = now - date;
          const seconds = Math.floor(diff / 1000);
          const minutes = Math.floor(seconds / 60);
          const hours = Math.floor(minutes / 60);
          const days = Math.floor(hours / 24);
          
          if (days > 0) return `${days}d ago`;
          if (hours > 0) return `${hours}h ago`;
          if (minutes > 0) return `${minutes}m ago`;
          return 'Just now';
        }, []);
        
        // 只在可见时记录展示
        useEffect(() => {
          if (isVisible) {
            console.log('Post visible:', post.id);
          }
        }, [isVisible, post.id]);
        
        return (
          <article ref={postRef} className="post">
            <header className="post-header">
              <img src={post.author.avatar} alt={post.author.name} className="author-avatar" />
              <div className="author-info">
                <h3>{post.author.name}</h3>
                <time>{formatTime(post.timestamp)}</time>
              </div>
            </header>
            
            <div className="post-content">
              <p className={isExpanded ? 'expanded' : 'collapsed'}>
                {post.content}
              </p>
              {post.content.length > 200 && (
                <button 
                  className="expand-button"
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  {isExpanded ? 'Show less' : 'Show more'}
                </button>
              )}
            </div>
            
            {post.image && <LazyImage src={post.image} alt="Post image" />}
            
            <div className="post-stats">
              <span>{post.likes} likes</span>
              <span>{post.comments} comments</span>
              <span>{post.shares} shares</span>
            </div>
            
            <div className="post-actions">
              <button 
                className={`action-button ${post.isLiked ? 'liked' : ''}`}
                onClick={() => onLike(post.id)}
              >
                ❤️ Like
              </button>
              <button className="action-button" onClick={() => onComment(post.id)}>
                💬 Comment
              </button>
              <button className="action-button" onClick={() => onShare(post.id)}>
                🔄 Share
              </button>
            </div>
          </article>
        );
      }, (prevProps, nextProps) => {
        return (
          prevProps.post.id === nextProps.post.id &&
          prevProps.post.isLiked === nextProps.post.isLiked &&
          prevProps.post.likes === nextProps.post.likes
        );
      });

      const SocialMediaFeed = () => {
        const [posts, setPosts] = useState(() => 
          Array.from({ length: 20 }, (_, i) => generatePost(i + 1))
        );
        const [isLoading, setIsLoading] = useState(false);
        const [searchTerm, setSearchTerm] = useState('');
        const [hasMore, setHasMore] = useState(true);
        const loadMoreRef = useRef(null);
        const batchUpdate = useBatchUpdate();
        
        // 无限滚动检测
        const shouldLoadMore = useIntersectionObserver(loadMoreRef, {
          threshold: 0.1,
          rootMargin: '100px'
        });
        
        // 加载更多帖子
        useEffect(() => {
          if (shouldLoadMore && hasMore && !isLoading) {
            setIsLoading(true);
            
            // 模拟API调用
            setTimeout(() => {
              const newPosts = Array.from(
                { length: 10 }, 
                (_, i) => generatePost(posts.length + i + 1)
              );
              
              setPosts(prev => [...prev, ...newPosts]);
              setIsLoading(false);
              
              // 模拟没有更多数据
              if (posts.length + newPosts.length > 100) {
                setHasMore(false);
              }
            }, 1000);
          }
        }, [shouldLoadMore, hasMore, isLoading, posts.length]);
        
        // 搜索过滤
        const filteredPosts = useMemo(() => {
          if (!searchTerm) return posts;
          
          return posts.filter(post => 
            post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
            post.author.name.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }, [posts, searchTerm]);
        
        // 处理点赞（优化版）
        const handleLike = useCallback((postId) => {
          setPosts(prevPosts => 
            prevPosts.map(post => 
              post.id === postId 
                ? { 
                    ...post, 
                    isLiked: !post.isLiked,
                    likes: post.isLiked ? post.likes - 1 : post.likes + 1
                  }
                : post
            )
          );
          
          // 批量更新分析数据
          batchUpdate({ type: 'like', postId });
        }, [batchUpdate]);
        
        // 处理评论
        const handleComment = useCallback((postId) => {
          console.log('Comment on post:', postId);
          batchUpdate({ type: 'comment', postId });
        }, [batchUpdate]);
        
        // 处理分享
        const handleShare = useCallback((postId) => {
          console.log('Share post:', postId);
          batchUpdate({ type: 'share', postId });
        }, [batchUpdate]);
        
        // 模拟实时更新
        useEffect(() => {
          const interval = setInterval(() => {
            if (Math.random() > 0.7) {
              const newPost = generatePost(Date.now());
              setPosts(prev => [newPost, ...prev]);
              console.log('New post added');
            }
          }, 10000);
          
          return () => clearInterval(interval);
        }, []);
        
        return (
          <div className="social-media-feed">
            <header className="feed-header">
              <h1>Social Feed</h1>
              <input
                type="search"
                placeholder="Search posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </header>
            
            <div className="posts-container">
              {filteredPosts.map(post => (
                <Post
                  key={post.id}
                  post={post}
                  onLike={handleLike}
                  onComment={handleComment}
                  onShare={handleShare}
                />
              ))}
              
              {hasMore && (
                <div ref={loadMoreRef} className="load-more">
                  {isLoading ? 'Loading more posts...' : 'Scroll for more'}
                </div>
              )}
              
              {!hasMore && (
                <div className="end-message">
                  You've reached the end!
                </div>
              )}
            </div>
          </div>
        );
      };

      export default SocialMediaFeed;

  - name: "AnalyticsDashboard.jsx"
    description: "实时数据分析仪表盘"
    code: |
      import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
      import './AnalyticsDashboard.css';

      // Web Worker用于复杂计算
      const workerCode = `
        self.onmessage = function(e) {
          const { type, data } = e.data;
          
          switch(type) {
            case 'aggregate':
              const result = aggregateData(data);
              self.postMessage({ type: 'aggregate', result });
              break;
              
            case 'calculate':
              const calculations = performCalculations(data);
              self.postMessage({ type: 'calculate', result: calculations });
              break;
          }
        };
        
        function aggregateData(data) {
          const aggregated = {};
          
          data.forEach(item => {
            const date = new Date(item.timestamp).toDateString();
            if (!aggregated[date]) {
              aggregated[date] = {
                revenue: 0,
                users: 0,
                pageViews: 0,
                conversions: 0
              };
            }
            
            aggregated[date].revenue += item.revenue;
            aggregated[date].users += item.users;
            aggregated[date].pageViews += item.pageViews;
            aggregated[date].conversions += item.conversions;
          });
          
          return Object.entries(aggregated).map(([date, values]) => ({
            date,
            ...values
          }));
        }
        
        function performCalculations(data) {
          const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
          const totalUsers = data.reduce((sum, item) => sum + item.users, 0);
          const avgRevenue = totalRevenue / data.length;
          const conversionRate = data.reduce((sum, item) => 
            sum + (item.conversions / item.users), 0) / data.length;
          
          return {
            totalRevenue,
            totalUsers,
            avgRevenue,
            conversionRate: conversionRate * 100
          };
        }
      `;

      // Web Worker Hook
      const useWebWorker = () => {
        const workerRef = useRef(null);
        const [result, setResult] = useState(null);
        const [loading, setLoading] = useState(false);
        
        useEffect(() => {
          const blob = new Blob([workerCode], { type: 'application/javascript' });
          const workerUrl = URL.createObjectURL(blob);
          workerRef.current = new Worker(workerUrl);
          
          workerRef.current.onmessage = (e) => {
            setResult(e.data.result);
            setLoading(false);
          };
          
          return () => {
            workerRef.current.terminate();
            URL.revokeObjectURL(workerUrl);
          };
        }, []);
        
        const runTask = useCallback((type, data) => {
          setLoading(true);
          workerRef.current.postMessage({ type, data });
        }, []);
        
        return { result, loading, runTask };
      };

      // 动画帧Hook
      const useAnimationFrame = (callback) => {
        const requestRef = useRef();
        const previousTimeRef = useRef();
        
        const animate = (time) => {
          if (previousTimeRef.current !== undefined) {
            const deltaTime = time - previousTimeRef.current;
            callback(deltaTime);
          }
          previousTimeRef.current = time;
          requestRef.current = requestAnimationFrame(animate);
        };
        
        useEffect(() => {
          requestRef.current = requestAnimationFrame(animate);
          return () => cancelAnimationFrame(requestRef.current);
        }, [callback]);
      };

      // 图表组件（简化版）
      const LineChart = React.memo(({ data, width, height }) => {
        const canvasRef = useRef(null);
        
        useEffect(() => {
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');
          
          // 清除画布
          ctx.clearRect(0, 0, width, height);
          
          if (!data || data.length === 0) return;
          
          // 找出最大值
          const maxValue = Math.max(...data.map(d => d.value));
          const padding = 40;
          
          // 绘制坐标轴
          ctx.strokeStyle = '#e0e0e0';
          ctx.beginPath();
          ctx.moveTo(padding, padding);
          ctx.lineTo(padding, height - padding);
          ctx.lineTo(width - padding, height - padding);
          ctx.stroke();
          
          // 绘制数据点和线
          ctx.strokeStyle = '#3b82f6';
          ctx.fillStyle = '#3b82f6';
          ctx.lineWidth = 2;
          
          ctx.beginPath();
          data.forEach((point, index) => {
            const x = padding + (index / (data.length - 1)) * (width - 2 * padding);
            const y = height - padding - (point.value / maxValue) * (height - 2 * padding);
            
            if (index === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
            
            // 绘制数据点
            ctx.fillRect(x - 3, y - 3, 6, 6);
          });
          ctx.stroke();
          
          // 绘制标签
          ctx.fillStyle = '#666';
          ctx.font = '12px Arial';
          data.forEach((point, index) => {
            if (index % Math.ceil(data.length / 5) === 0) {
              const x = padding + (index / (data.length - 1)) * (width - 2 * padding);
              ctx.fillText(point.label, x - 20, height - padding + 20);
            }
          });
        }, [data, width, height]);
        
        return <canvas ref={canvasRef} width={width} height={height} />;
      });

      // 实时数据卡片
      const MetricCard = React.memo(({ title, value, change, format = 'number' }) => {
        const formattedValue = useMemo(() => {
          if (format === 'currency') {
            return `$${value.toLocaleString()}`;
          } else if (format === 'percent') {
            return `${value.toFixed(2)}%`;
          }
          return value.toLocaleString();
        }, [value, format]);
        
        const changeColor = change > 0 ? 'positive' : change < 0 ? 'negative' : 'neutral';
        
        return (
          <div className="metric-card">
            <h3>{title}</h3>
            <div className="metric-value">{formattedValue}</div>
            <div className={`metric-change ${changeColor}`}>
              {change > 0 && '+'}
              {change.toFixed(2)}%
            </div>
          </div>
        );
      });

      const AnalyticsDashboard = () => {
        const [rawData, setRawData] = useState([]);
        const [timeRange, setTimeRange] = useState('7d');
        const [metrics, setMetrics] = useState({
          revenue: { value: 0, change: 0 },
          users: { value: 0, change: 0 },
          pageViews: { value: 0, change: 0 },
          conversionRate: { value: 0, change: 0 }
        });
        const [chartData, setChartData] = useState([]);
        const [isRealtime, setIsRealtime] = useState(true);
        const wsRef = useRef(null);
        
        const { result: aggregatedData, loading: aggregating, runTask: runAggregation } = useWebWorker();
        const { result: calculations, runTask: runCalculations } = useWebWorker();
        
        // 生成模拟数据
        const generateData = useCallback((days) => {
          const data = [];
          const now = Date.now();
          
          for (let i = 0; i < days * 24; i++) {
            data.push({
              timestamp: now - i * 60 * 60 * 1000,
              revenue: Math.random() * 10000 + 5000,
              users: Math.floor(Math.random() * 1000) + 500,
              pageViews: Math.floor(Math.random() * 5000) + 2000,
              conversions: Math.floor(Math.random() * 100) + 20
            });
          }
          
          return data;
        }, []);
        
        // 初始化数据
        useEffect(() => {
          const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
          const data = generateData(days);
          setRawData(data);
          runAggregation('aggregate', data);
          runCalculations('calculate', data);
        }, [timeRange, generateData, runAggregation, runCalculations]);
        
        // 处理聚合数据
        useEffect(() => {
          if (aggregatedData) {
            // 转换为图表数据
            const chartPoints = aggregatedData.slice(-7).map(item => ({
              label: new Date(item.date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
              value: item.revenue
            }));
            setChartData(chartPoints);
          }
        }, [aggregatedData]);
        
        // 处理计算结果
        useEffect(() => {
          if (calculations) {
            setMetrics({
              revenue: {
                value: calculations.totalRevenue,
                change: Math.random() * 20 - 10
              },
              users: {
                value: calculations.totalUsers,
                change: Math.random() * 15 - 5
              },
              pageViews: {
                value: Math.floor(calculations.totalUsers * 4.5),
                change: Math.random() * 10 - 5
              },
              conversionRate: {
                value: calculations.conversionRate,
                change: Math.random() * 5 - 2.5
              }
            });
          }
        }, [calculations]);
        
        // 模拟实时数据更新
        useEffect(() => {
          if (!isRealtime) return;
          
          const interval = setInterval(() => {
            setRawData(prev => {
              const newData = [...prev];
              newData.unshift({
                timestamp: Date.now(),
                revenue: Math.random() * 1000 + 500,
                users: Math.floor(Math.random() * 100) + 50,
                pageViews: Math.floor(Math.random() * 500) + 200,
                conversions: Math.floor(Math.random() * 10) + 2
              });
              
              // 保持数据量合理
              if (newData.length > 1000) {
                newData.pop();
              }
              
              // 重新计算
              runAggregation('aggregate', newData.slice(0, 168)); // 最近7天
              runCalculations('calculate', newData.slice(0, 24)); // 最近24小时
              
              return newData;
            });
          }, 2000);
          
          return () => clearInterval(interval);
        }, [isRealtime, runAggregation, runCalculations]);
        
        // 动画更新
        useAnimationFrame((deltaTime) => {
          // 这里可以添加平滑的动画效果
        });
        
        // 导出报告
        const exportReport = useCallback(() => {
          const report = {
            generatedAt: new Date().toISOString(),
            timeRange,
            metrics,
            chartData,
            aggregatedData
          };
          
          const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `analytics-report-${new Date().toISOString()}.json`;
          a.click();
          URL.revokeObjectURL(url);
        }, [timeRange, metrics, chartData, aggregatedData]);
        
        return (
          <div className="analytics-dashboard">
            <header className="dashboard-header">
              <h1>Analytics Dashboard</h1>
              <div className="header-controls">
                <select 
                  value={timeRange} 
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="time-range-select"
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                </select>
                <button 
                  className={`realtime-toggle ${isRealtime ? 'active' : ''}`}
                  onClick={() => setIsRealtime(!isRealtime)}
                >
                  {isRealtime ? '⚡ Real-time' : '⏸️ Paused'}
                </button>
                <button onClick={exportReport} className="export-button">
                  📊 Export Report
                </button>
              </div>
            </header>
            
            <div className="metrics-grid">
              <MetricCard
                title="Total Revenue"
                value={metrics.revenue.value}
                change={metrics.revenue.change}
                format="currency"
              />
              <MetricCard
                title="Active Users"
                value={metrics.users.value}
                change={metrics.users.change}
              />
              <MetricCard
                title="Page Views"
                value={metrics.pageViews.value}
                change={metrics.pageViews.change}
              />
              <MetricCard
                title="Conversion Rate"
                value={metrics.conversionRate.value}
                change={metrics.conversionRate.change}
                format="percent"
              />
            </div>
            
            <div className="charts-section">
              <div className="chart-container">
                <h2>Revenue Trend</h2>
                {aggregating ? (
                  <div className="loading">Processing data...</div>
                ) : (
                  <LineChart data={chartData} width={800} height={400} />
                )}
              </div>
            </div>
            
            <div className="data-table">
              <h2>Recent Activity</h2>
              <table>
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Revenue</th>
                    <th>Users</th>
                    <th>Page Views</th>
                    <th>Conversions</th>
                  </tr>
                </thead>
                <tbody>
                  {rawData.slice(0, 10).map((item, index) => (
                    <tr key={index}>
                      <td>{new Date(item.timestamp).toLocaleTimeString()}</td>
                      <td>${item.revenue.toFixed(2)}</td>
                      <td>{item.users}</td>
                      <td>{item.pageViews}</td>
                      <td>{item.conversions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      };

      export default AnalyticsDashboard;

  - name: "styles.css"
    description: "样式文件"
    code: |
      /* DataTable.css */
      .data-table-container {
        width: 100%;
        max-width: 1200px;
        margin: 0 auto;
        font-family: -apple-system, sans-serif;
      }

      .table-controls {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
        gap: 1rem;
      }

      .filters {
        display: flex;
        gap: 0.5rem;
      }

      .filters input {
        padding: 0.5rem;
        border: 1px solid #ddd;
        border-radius: 4px;
      }

      .actions {
        display: flex;
        gap: 0.5rem;
        align-items: center;
      }

      .actions button {
        padding: 0.5rem 1rem;
        background: #3b82f6;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      }

      .table-scroll-container {
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        overflow: auto;
        position: relative;
      }

      .data-table {
        width: 100%;
        border-collapse: collapse;
      }

      .data-table thead {
        background: #f9fafb;
        border-bottom: 2px solid #e5e7eb;
      }

      .data-table th {
        padding: 0.75rem;
        text-align: left;
        font-weight: 600;
        user-select: none;
      }

      .data-table tbody tr {
        border-bottom: 1px solid #f3f4f6;
        height: 40px;
      }

      .data-table tbody tr.selected {
        background: #eff6ff;
      }

      .data-table td {
        padding: 0.75rem;
      }

      /* SocialMediaFeed.css */
      .social-media-feed {
        max-width: 600px;
        margin: 0 auto;
        font-family: -apple-system, sans-serif;
      }

      .feed-header {
        position: sticky;
        top: 0;
        background: white;
        z-index: 10;
        padding: 1rem;
        border-bottom: 1px solid #e5e7eb;
      }

      .search-input {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid #ddd;
        border-radius: 8px;
        margin-top: 1rem;
      }

      .post {
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        margin-bottom: 1rem;
        padding: 1rem;
      }

      .post-header {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin-bottom: 1rem;
      }

      .author-avatar {
        width: 48px;
        height: 48px;
        border-radius: 50%;
      }

      .author-info h3 {
        margin: 0;
        font-size: 1rem;
      }

      .author-info time {
        color: #6b7280;
        font-size: 0.875rem;
      }

      .post-content p {
        margin: 0;
        line-height: 1.5;
      }

      .post-content p.collapsed {
        max-height: 4.5rem;
        overflow: hidden;
      }

      .expand-button {
        background: none;
        border: none;
        color: #3b82f6;
        cursor: pointer;
        padding: 0;
        margin-top: 0.5rem;
      }

      .lazy-image-container {
        width: 100%;
        margin: 1rem 0;
        background: #f3f4f6;
        border-radius: 8px;
        overflow: hidden;
      }

      .lazy-image {
        width: 100%;
        height: auto;
        display: block;
        opacity: 0;
        transition: opacity 0.3s;
      }

      .lazy-image.loaded {
        opacity: 1;
      }

      .image-placeholder {
        width: 100%;
        height: 300px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #9ca3af;
      }

      .post-stats {
        display: flex;
        gap: 1rem;
        margin: 1rem 0;
        color: #6b7280;
        font-size: 0.875rem;
      }

      .post-actions {
        display: flex;
        gap: 1rem;
        border-top: 1px solid #f3f4f6;
        padding-top: 0.5rem;
      }

      .action-button {
        flex: 1;
        padding: 0.5rem;
        background: none;
        border: 1px solid #e5e7eb;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.2s;
      }

      .action-button:hover {
        background: #f9fafb;
      }

      .action-button.liked {
        color: #ef4444;
        border-color: #ef4444;
      }

      .load-more {
        text-align: center;
        padding: 2rem;
        color: #6b7280;
      }

      /* AnalyticsDashboard.css */
      .analytics-dashboard {
        max-width: 1400px;
        margin: 0 auto;
        padding: 2rem;
        font-family: -apple-system, sans-serif;
      }

      .dashboard-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
      }

      .header-controls {
        display: flex;
        gap: 1rem;
        align-items: center;
      }

      .time-range-select {
        padding: 0.5rem;
        border: 1px solid #ddd;
        border-radius: 4px;
      }

      .realtime-toggle {
        padding: 0.5rem 1rem;
        border: 1px solid #ddd;
        border-radius: 4px;
        background: white;
        cursor: pointer;
      }

      .realtime-toggle.active {
        background: #10b981;
        color: white;
        border-color: #10b981;
      }

      .export-button {
        padding: 0.5rem 1rem;
        background: #3b82f6;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      }

      .metrics-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1rem;
        margin-bottom: 2rem;
      }

      .metric-card {
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        padding: 1.5rem;
      }

      .metric-card h3 {
        margin: 0;
        color: #6b7280;
        font-size: 0.875rem;
        font-weight: 500;
      }

      .metric-value {
        font-size: 2rem;
        font-weight: 700;
        margin: 0.5rem 0;
      }

      .metric-change {
        font-size: 0.875rem;
      }

      .metric-change.positive {
        color: #10b981;
      }

      .metric-change.negative {
        color: #ef4444;
      }

      .charts-section {
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        padding: 1.5rem;
        margin-bottom: 2rem;
      }

      .chart-container h2 {
        margin-top: 0;
      }

      .data-table {
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        padding: 1.5rem;
      }

      .data-table table {
        width: 100%;
        border-collapse: collapse;
      }

      .data-table th {
        text-align: left;
        padding: 0.5rem;
        border-bottom: 2px solid #e5e7eb;
      }

      .data-table td {
        padding: 0.5rem;
        border-bottom: 1px solid #f3f4f6;
      }

      .loading {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 400px;
        color: #6b7280;
      }
---