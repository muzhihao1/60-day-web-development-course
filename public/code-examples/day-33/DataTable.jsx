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