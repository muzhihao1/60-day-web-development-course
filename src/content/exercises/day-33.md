---
day: 33
title: "React性能优化练习"
description: "通过实战项目掌握React性能优化技巧，包括React.memo、useMemo、useCallback、虚拟列表和性能分析"
difficulty: "intermediate"
estimatedTime: 180
requirements:
  - "数据表格"
  - "社交媒体信息流"
  - "数据分析仪表盘"
hints:
  - "使用React.memo包装不需要频繁更新的组件"
  - "用useMemo缓存昂贵的计算结果"
  - "用useCallback稳定回调函数引用"
  - "实现虚拟滚动来处理大量数据"
  - "使用React DevTools Profiler分析性能"
---

# Day 33 - React性能优化

今天的练习将帮助你掌握React性能优化的核心技巧。通过构建真实场景的应用，你将学会如何识别和解决性能瓶颈。

## 练习1：高性能数据表格

创建一个支持大量数据的数据表格组件：

### 功能要求：
1. **数据展示** - 支持10000+行数据
2. **虚拟滚动** - 只渲染可见区域的行
3. **列排序** - 支持多列排序（保持排序状态）
4. **过滤器** - 支持多列过滤（文本、数字、日期）
5. **行选择** - 支持全选/单选/多选
6. **固定列** - 支持左右列固定
7. **调整列宽** - 拖拽调整列宽度
8. **导出功能** - 导出CSV/JSON（大数据分批处理）

### 性能要求：
- 初始渲染 < 100ms
- 滚动帧率 > 30fps
- 排序响应 < 200ms
- 过滤响应 < 300ms

### 技术提示：
```javascript
// 虚拟滚动核心逻辑
const visibleRange = calculateVisibleRange(scrollTop, rowHeight, containerHeight);
const visibleData = data.slice(visibleRange.start, visibleRange.end);

// 使用React.memo优化行组件
const TableRow = React.memo(({ data, columns }) => {
  // 行渲染逻辑
}, (prevProps, nextProps) => {
  // 自定义比较函数
});

// 使用useMemo缓存过滤和排序结果
const processedData = useMemo(() => {
  let result = [...data];
  if (filters) result = applyFilters(result, filters);
  if (sorts) result = applySorts(result, sorts);
  return result;
}, [data, filters, sorts]);
```

## 练习2：社交媒体信息流

构建一个类似Twitter/Instagram的信息流：

### 功能要求：
1. **无限滚动** - 滚动到底部自动加载更多
2. **媒体预览** - 图片/视频懒加载
3. **互动功能** - 点赞、评论、分享（优化状态更新）
4. **实时更新** - 新帖子实时推送
5. **草稿保存** - 自动保存正在编辑的内容
6. **搜索高亮** - 搜索结果关键词高亮
7. **用户提及** - @用户自动完成
8. **主题标签** - #标签自动识别和链接

### 性能优化点：
- 图片懒加载和预加载
- 虚拟列表实现
- 批量状态更新
- 防抖搜索输入
- Web Worker处理数据

### 实现建议：
```javascript
// 使用Intersection Observer实现懒加载
const useIntersectionObserver = (ref, options) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);
    
    if (ref.current) {
      observer.observe(ref.current);
    }
    
    return () => observer.disconnect();
  }, [ref, options]);
  
  return isIntersecting;
};

// 优化频繁的状态更新
const useBatchUpdate = () => {
  const [updates, setUpdates] = useState([]);
  
  const batchUpdate = useCallback((update) => {
    setUpdates(prev => [...prev, update]);
  }, []);
  
  useEffect(() => {
    if (updates.length > 0) {
      const timer = setTimeout(() => {
        // 批量处理更新
        processUpdates(updates);
        setUpdates([]);
      }, 16); // 一帧的时间
      
      return () => clearTimeout(timer);
    }
  }, [updates]);
  
  return batchUpdate;
};
```

## 练习3：数据分析仪表盘

创建一个复杂的数据可视化仪表盘：

### 功能要求：
1. **多图表展示** - 折线图、柱状图、饼图、热力图
2. **实时数据** - WebSocket推送实时更新
3. **数据聚合** - 客户端数据聚合计算
4. **时间筛选** - 日期范围选择器
5. **数据下钻** - 点击图表查看详情
6. **自定义布局** - 拖拽调整图表位置
7. **数据对比** - 多时间段对比
8. **导出报告** - 生成PDF报告

### 性能挑战：
- 处理大量实时数据点
- 复杂计算的缓存策略
- 图表渲染优化
- 内存管理

### 优化策略：
```javascript
// 使用Web Worker处理复杂计算
const useWebWorker = (workerFunction) => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const workerRef = useRef(null);
  
  useEffect(() => {
    const blob = new Blob([`(${workerFunction.toString()})()`]);
    const workerUrl = URL.createObjectURL(blob);
    workerRef.current = new Worker(workerUrl);
    
    workerRef.current.onmessage = (e) => {
      setResult(e.data);
      setLoading(false);
    };
    
    return () => {
      workerRef.current.terminate();
      URL.revokeObjectURL(workerUrl);
    };
  }, []);
  
  const runCalculation = useCallback((data) => {
    setLoading(true);
    workerRef.current.postMessage(data);
  }, []);
  
  return { result, loading, runCalculation };
};

// 数据采样减少渲染点数
const sampleData = (data, maxPoints) => {
  if (data.length <= maxPoints) return data;
  
  const step = Math.ceil(data.length / maxPoints);
  return data.filter((_, index) => index % step === 0);
};

// 使用requestAnimationFrame优化动画
const useAnimationFrame = (callback) => {
  const requestRef = useRef();
  const previousTimeRef = useRef();
  
  const animate = (time) => {
    if (previousTimeRef.current != undefined) {
      const deltaTime = time - previousTimeRef.current;
      callback(deltaTime);
    }
    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  };
  
  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, []);
};
```

## 性能测试要点

### 使用React DevTools Profiler：
1. 记录组件渲染时间
2. 识别不必要的重渲染
3. 分析组件渲染原因
4. 测量交互响应时间

### 性能指标监控：
```javascript
// 自定义性能监控Hook
const usePerformanceMonitor = (componentName) => {
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // 发送到分析服务
      if (renderTime > 16) { // 超过一帧
        console.warn(`${componentName} render time: ${renderTime}ms`);
      }
    };
  });
};

// 监控内存使用
const useMemoryMonitor = () => {
  useEffect(() => {
    if (performance.memory) {
      const checkMemory = () => {
        const used = performance.memory.usedJSHeapSize;
        const total = performance.memory.totalJSHeapSize;
        const percent = (used / total) * 100;
        
        if (percent > 90) {
          console.warn('High memory usage:', percent.toFixed(2) + '%');
        }
      };
      
      const interval = setInterval(checkMemory, 5000);
      return () => clearInterval(interval);
    }
  }, []);
};
```

## 提交要求

1. 每个练习创建独立的组件文件
2. 包含性能测试结果截图
3. 提供优化前后的对比数据
4. 使用Chrome DevTools生成性能报告
5. 记录关键性能指标（FCP、TTI、FID）

## 加分项

- 实现骨架屏加载效果
- 添加错误边界处理
- 实现离线缓存策略
- 使用Service Worker优化资源加载
- 实现渐进式图片加载

记住：性能优化是一个持续的过程，先测量，再优化，避免过早优化！