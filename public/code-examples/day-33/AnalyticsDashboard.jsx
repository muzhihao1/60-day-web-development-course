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