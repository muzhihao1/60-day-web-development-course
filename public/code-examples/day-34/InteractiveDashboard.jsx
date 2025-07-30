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