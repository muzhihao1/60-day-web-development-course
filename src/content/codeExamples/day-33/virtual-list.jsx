// Day 33: 虚拟列表实现示例

import React, { useState, useRef, useCallback, useEffect, memo } from 'react';
import { FixedSizeList, VariableSizeList } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';

// ==========================================
// 1. 基础虚拟列表实现
// ==========================================

export function BasicVirtualList({ items }) {
  const Row = ({ index, style }) => (
    <div style={style} className="list-row">
      <div className="row-content">
        <strong>Item {index}</strong>
        <p>{items[index].description}</p>
      </div>
    </div>
  );

  return (
    <div style={{ height: '400px', width: '100%' }}>
      <FixedSizeList
        height={400}
        itemCount={items.length}
        itemSize={80}
        width="100%"
      >
        {Row}
      </FixedSizeList>
    </div>
  );
}

// ==========================================
// 2. 自定义虚拟列表实现
// ==========================================

export function CustomVirtualList({ items, itemHeight = 50, containerHeight = 400 }) {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollElementRef = useRef(null);

  // 计算可见范围
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight)
  );

  // 缓冲区，提前渲染一些项目
  const overscan = 3;
  const displayStartIndex = Math.max(0, startIndex - overscan);
  const displayEndIndex = Math.min(items.length - 1, endIndex + overscan);

  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop);
  }, []);

  const visibleItems = [];
  for (let i = displayStartIndex; i <= displayEndIndex; i++) {
    visibleItems.push(
      <div
        key={items[i].id}
        style={{
          position: 'absolute',
          top: i * itemHeight,
          height: itemHeight,
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          borderBottom: '1px solid #eee'
        }}
      >
        <div>
          <strong>{items[i].title}</strong>
          <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
            {items[i].description}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={scrollElementRef}
      style={{
        height: containerHeight,
        overflow: 'auto',
        position: 'relative',
        border: '1px solid #ddd'
      }}
      onScroll={handleScroll}
    >
      {/* 占位元素，撑开滚动区域 */}
      <div style={{ height: items.length * itemHeight }} />
      
      {/* 可见项目 */}
      {visibleItems}

      {/* 滚动信息 */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '4px 8px',
          fontSize: '12px',
          zIndex: 10
        }}
      >
        Showing items {displayStartIndex + 1} - {displayEndIndex + 1} of {items.length}
      </div>
    </div>
  );
}

// ==========================================
// 3. 动态高度虚拟列表
// ==========================================

export function DynamicHeightVirtualList({ items }) {
  const itemSizes = useRef({});
  const listRef = useRef();
  const rowRefs = useRef({});

  // 获取或估算项目高度
  const getItemSize = useCallback((index) => {
    return itemSizes.current[index] || 100; // 默认高度100px
  }, []);

  // 设置项目高度
  const setItemSize = useCallback((index, size) => {
    if (itemSizes.current[index] !== size) {
      itemSizes.current[index] = size;
      if (listRef.current) {
        listRef.current.resetAfterIndex(index);
      }
    }
  }, []);

  const Row = ({ index, style }) => {
    const item = items[index];
    const rowRef = useRef();

    useEffect(() => {
      if (rowRef.current) {
        const height = rowRef.current.getBoundingClientRect().height;
        setItemSize(index, height);
      }
    }, [index, item, setItemSize]);

    return (
      <div style={style}>
        <div
          ref={rowRef}
          className="dynamic-row"
          style={{
            padding: '16px',
            borderBottom: '1px solid #eee'
          }}
        >
          <h3>{item.title}</h3>
          <p>{item.content}</p>
          {item.hasImage && (
            <img
              src={item.imageUrl}
              alt={item.title}
              style={{ maxWidth: '100%', height: 'auto' }}
            />
          )}
        </div>
      </div>
    );
  };

  return (
    <AutoSizer>
      {({ height, width }) => (
        <VariableSizeList
          ref={listRef}
          height={height}
          itemCount={items.length}
          itemSize={getItemSize}
          width={width}
          overscanCount={3}
        >
          {Row}
        </VariableSizeList>
      )}
    </AutoSizer>
  );
}

// ==========================================
// 4. 高性能无限滚动列表
// ==========================================

export function InfiniteVirtualList({ loadMoreItems }) {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const listRef = useRef();

  // 加载更多数据
  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      const newItems = await loadMoreItems(items.length);
      if (newItems.length === 0) {
        setHasMore(false);
      } else {
        setItems(prev => [...prev, ...newItems]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [items.length, isLoading, hasMore, loadMoreItems]);

  // 检查是否需要加载更多
  const isItemLoaded = useCallback((index) => {
    return index < items.length;
  }, [items.length]);

  // 渲染行
  const Row = memo(({ index, style }) => {
    if (!isItemLoaded(index)) {
      return (
        <div style={style} className="loading-row">
          <div className="loader">Loading...</div>
        </div>
      );
    }

    const item = items[index];
    return (
      <div style={style} className="item-row">
        <div className="item-content">
          <h4>{item.title}</h4>
          <p>{item.description}</p>
          <span className="item-meta">#{index + 1}</span>
        </div>
      </div>
    );
  });

  return (
    <AutoSizer>
      {({ height, width }) => (
        <FixedSizeList
          ref={listRef}
          height={height}
          itemCount={hasMore ? items.length + 1 : items.length}
          itemSize={100}
          width={width}
          onItemsRendered={({ visibleStopIndex }) => {
            if (visibleStopIndex >= items.length - 5) {
              loadMore();
            }
          }}
        >
          {Row}
        </FixedSizeList>
      )}
    </AutoSizer>
  );
}

// ==========================================
// 5. 网格虚拟化
// ==========================================

import { FixedSizeGrid } from 'react-window';

export function VirtualGrid({ items, columnCount = 3 }) {
  const Cell = ({ columnIndex, rowIndex, style }) => {
    const index = rowIndex * columnCount + columnIndex;
    if (index >= items.length) return null;

    const item = items[index];
    return (
      <div
        style={{
          ...style,
          padding: '8px'
        }}
      >
        <div
          style={{
            height: '100%',
            background: '#f0f0f0',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column'
          }}
        >
          <img
            src={item.thumbnail}
            alt={item.title}
            style={{
              width: '80%',
              height: '60%',
              objectFit: 'cover',
              borderRadius: '4px'
            }}
          />
          <h5 style={{ margin: '8px 0 0 0' }}>{item.title}</h5>
        </div>
      </div>
    );
  };

  const rowCount = Math.ceil(items.length / columnCount);

  return (
    <AutoSizer>
      {({ height, width }) => (
        <FixedSizeGrid
          columnCount={columnCount}
          columnWidth={width / columnCount}
          height={height}
          rowCount={rowCount}
          rowHeight={200}
          width={width}
        >
          {Cell}
        </FixedSizeGrid>
      )}
    </AutoSizer>
  );
}

// ==========================================
// 6. 带搜索和过滤的虚拟列表
// ==========================================

export function FilterableVirtualList({ items: initialItems }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  // 过滤和排序
  const filteredItems = useMemo(() => {
    let result = initialItems;

    // 搜索过滤
    if (searchTerm) {
      result = result.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 分类过滤
    if (category !== 'all') {
      result = result.filter(item => item.category === category);
    }

    // 排序
    result = [...result].sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'date') {
        return new Date(b.date) - new Date(a.date);
      }
      return 0;
    });

    return result;
  }, [initialItems, searchTerm, category, sortBy]);

  const Row = memo(({ index, style }) => {
    const item = filteredItems[index];
    return (
      <div style={style} className="filtered-row">
        <div className="row-content">
          <div className="row-header">
            <h4>{item.name}</h4>
            <span className="category-badge">{item.category}</span>
          </div>
          <p>{item.description}</p>
          <small>{new Date(item.date).toLocaleDateString()}</small>
        </div>
      </div>
    );
  });

  return (
    <div style={{ height: '600px', display: 'flex', flexDirection: 'column' }}>
      <div className="filters" style={{ padding: '16px', borderBottom: '1px solid #ddd' }}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search..."
          style={{ marginRight: '8px' }}
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{ marginRight: '8px' }}
        >
          <option value="all">All Categories</option>
          <option value="electronics">Electronics</option>
          <option value="books">Books</option>
          <option value="clothing">Clothing</option>
        </select>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="name">Sort by Name</option>
          <option value="date">Sort by Date</option>
        </select>
      </div>

      <div style={{ flex: 1 }}>
        <AutoSizer>
          {({ height, width }) => (
            <FixedSizeList
              height={height}
              itemCount={filteredItems.length}
              itemSize={80}
              width={width}
            >
              {Row}
            </FixedSizeList>
          )}
        </AutoSizer>
      </div>

      <div style={{ padding: '8px', textAlign: 'center', borderTop: '1px solid #ddd' }}>
        Showing {filteredItems.length} of {initialItems.length} items
      </div>
    </div>
  );
}

// ==========================================
// 7. 性能监控的虚拟列表
// ==========================================

export function MonitoredVirtualList({ items }) {
  const [renderMetrics, setRenderMetrics] = useState({
    visibleStart: 0,
    visibleEnd: 0,
    renderTime: 0,
    scrollFPS: 60
  });

  const lastScrollTime = useRef(Date.now());
  const frameCount = useRef(0);

  const Row = memo(({ index, style }) => {
    const renderStart = performance.now();
    
    const item = items[index];
    const content = (
      <div style={style} className="monitored-row">
        <div>
          <strong>{item.title}</strong>
          <p>{item.description}</p>
        </div>
      </div>
    );

    const renderEnd = performance.now();
    if (renderEnd - renderStart > 16) {
      console.warn(`Slow render for item ${index}: ${renderEnd - renderStart}ms`);
    }

    return content;
  });

  const handleItemsRendered = useCallback(({ visibleStartIndex, visibleStopIndex }) => {
    setRenderMetrics(prev => ({
      ...prev,
      visibleStart: visibleStartIndex,
      visibleEnd: visibleStopIndex
    }));
  }, []);

  const handleScroll = useCallback(() => {
    const now = Date.now();
    const delta = now - lastScrollTime.current;
    
    if (delta > 1000) {
      const fps = Math.round((frameCount.current * 1000) / delta);
      setRenderMetrics(prev => ({ ...prev, scrollFPS: fps }));
      frameCount.current = 0;
      lastScrollTime.current = now;
    } else {
      frameCount.current++;
    }
  }, []);

  return (
    <div style={{ height: '600px' }}>
      <div
        style={{
          padding: '8px',
          background: '#f0f0f0',
          borderBottom: '1px solid #ddd',
          fontSize: '12px',
          fontFamily: 'monospace'
        }}
      >
        <span>Visible: {renderMetrics.visibleStart}-{renderMetrics.visibleEnd}</span>
        {' | '}
        <span>FPS: {renderMetrics.scrollFPS}</span>
        {' | '}
        <span>Total: {items.length} items</span>
      </div>

      <div style={{ height: 'calc(100% - 40px)' }}>
        <FixedSizeList
          height={560}
          itemCount={items.length}
          itemSize={80}
          width="100%"
          onItemsRendered={handleItemsRendered}
          onScroll={handleScroll}
        >
          {Row}
        </FixedSizeList>
      </div>
    </div>
  );
}