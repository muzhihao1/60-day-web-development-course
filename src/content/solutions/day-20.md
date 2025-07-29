---
day: 20
title: "错误监控仪表板 - 解决方案"
description: "完整的错误监控系统实现"
---

# 错误监控仪表板解决方案

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>错误监控仪表板</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f5f7fa;
            color: #333;
        }

        .header {
            background: white;
            padding: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .header h1 {
            font-size: 24px;
            color: #2c3e50;
        }

        .controls {
            display: flex;
            gap: 10px;
        }

        .btn {
            padding: 8px 16px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            transition: all 0.3s;
        }

        .btn-primary {
            background: #3498db;
            color: white;
        }

        .btn-danger {
            background: #e74c3c;
            color: white;
        }

        .btn:hover {
            opacity: 0.9;
            transform: translateY(-1px);
        }

        .dashboard {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            padding: 20px;
        }

        .card {
            background: white;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .card h3 {
            margin-bottom: 15px;
            color: #2c3e50;
            font-size: 18px;
        }

        .metrics {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
            text-align: center;
        }

        .metric {
            padding: 15px;
            background: #f8f9fa;
            border-radius: 8px;
        }

        .metric .value {
            font-size: 32px;
            font-weight: bold;
            color: #3498db;
            display: block;
        }

        .metric .label {
            font-size: 12px;
            color: #7f8c8d;
            margin-top: 5px;
        }

        .error-list {
            max-height: 400px;
            overflow-y: auto;
        }

        .error-item {
            padding: 12px;
            border-bottom: 1px solid #eee;
            cursor: pointer;
            transition: background 0.2s;
        }

        .error-item:hover {
            background: #f8f9fa;
        }

        .error-item.selected {
            background: #e3f2fd;
        }

        .error-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 5px;
        }

        .error-message {
            font-weight: 500;
            color: #2c3e50;
        }

        .error-time {
            font-size: 12px;
            color: #95a5a6;
        }

        .severity {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 3px;
            font-size: 11px;
            font-weight: 500;
        }

        .severity-high {
            background: #fee;
            color: #c00;
        }

        .severity-medium {
            background: #fef3cd;
            color: #856404;
        }

        .severity-low {
            background: #d4edda;
            color: #155724;
        }

        .chart-container {
            height: 300px;
            position: relative;
            background: #f8f9fa;
            border-radius: 4px;
            display: flex;
            align-items: flex-end;
            padding: 20px;
            gap: 2px;
        }

        .chart-bar {
            flex: 1;
            background: #3498db;
            border-radius: 2px 2px 0 0;
            position: relative;
            transition: all 0.3s;
            min-height: 5px;
        }

        .chart-bar:hover {
            background: #2980b9;
        }

        .chart-tooltip {
            position: absolute;
            bottom: 100%;
            left: 50%;
            transform: translateX(-50%);
            background: #333;
            color: white;
            padding: 5px 10px;
            border-radius: 4px;
            font-size: 12px;
            white-space: nowrap;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.3s;
        }

        .chart-bar:hover .chart-tooltip {
            opacity: 1;
        }

        .error-detail {
            font-size: 14px;
            line-height: 1.6;
        }

        .detail-section {
            margin-bottom: 20px;
        }

        .detail-section h4 {
            color: #2c3e50;
            margin-bottom: 10px;
            font-size: 16px;
        }

        .stack-trace {
            background: #f8f9fa;
            padding: 10px;
            border-radius: 4px;
            font-family: monospace;
            font-size: 12px;
            overflow-x: auto;
        }

        .alert-banner {
            background: #e74c3c;
            color: white;
            padding: 15px 20px;
            display: none;
            align-items: center;
            gap: 10px;
        }

        .alert-banner.active {
            display: flex;
        }

        .alert-icon {
            font-size: 20px;
        }

        .tabs {
            display: flex;
            gap: 10px;
            margin-bottom: 15px;
            border-bottom: 2px solid #eee;
        }

        .tab {
            padding: 10px 15px;
            cursor: pointer;
            border-bottom: 2px solid transparent;
            transition: all 0.3s;
        }

        .tab:hover {
            background: #f8f9fa;
        }

        .tab.active {
            color: #3498db;
            border-bottom-color: #3498db;
        }

        .search-box {
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            margin-bottom: 15px;
        }

        @media (max-width: 768px) {
            .dashboard {
                grid-template-columns: 1fr;
            }
            
            .metrics {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="alert-banner" id="alertBanner">
        <span class="alert-icon">⚠️</span>
        <span id="alertMessage">错误率异常升高！</span>
        <button class="btn" onclick="dismissAlert()">关闭</button>
    </div>

    <header class="header">
        <h1>🛡️ 错误监控仪表板</h1>
        <div class="controls">
            <button class="btn btn-primary" onclick="exportReport()">导出报告</button>
            <button class="btn btn-danger" onclick="simulateErrors()">模拟错误</button>
        </div>
    </header>

    <main class="dashboard">
        <div class="card">
            <h3>实时指标</h3>
            <div class="metrics">
                <div class="metric">
                    <span class="value" id="totalErrors">0</span>
                    <span class="label">总错误数</span>
                </div>
                <div class="metric">
                    <span class="value" id="errorRate">0</span>
                    <span class="label">错误/分钟</span>
                </div>
                <div class="metric">
                    <span class="value" id="affectedUsers">0</span>
                    <span class="label">影响用户</span>
                </div>
            </div>
        </div>

        <div class="card">
            <h3>错误趋势（最近60分钟）</h3>
            <div class="chart-container" id="trendChart"></div>
        </div>

        <div class="card">
            <h3>最近错误</h3>
            <input type="text" class="search-box" placeholder="搜索错误..." oninput="filterErrors(this.value)">
            <div class="tabs">
                <div class="tab active" onclick="switchTab('all')">全部</div>
                <div class="tab" onclick="switchTab('javascript')">JavaScript</div>
                <div class="tab" onclick="switchTab('network')">网络</div>
                <div class="tab" onclick="switchTab('promise')">Promise</div>
            </div>
            <div class="error-list" id="errorList"></div>
        </div>

        <div class="card">
            <h3>错误详情</h3>
            <div id="errorDetail" class="error-detail">
                <p style="color: #95a5a6;">选择一个错误查看详情</p>
            </div>
        </div>
    </main>

    <script>
        // 错误监控系统
        class ErrorMonitor {
            constructor() {
                this.errors = [];
                this.maxErrors = 1000;
                this.listeners = new Set();
                this.metrics = {
                    total: 0,
                    rate: 0,
                    affectedUsers: new Set()
                };
                this.init();
            }

            init() {
                // 捕获JavaScript错误
                window.addEventListener('error', (event) => {
                    this.captureError({
                        type: 'javascript',
                        message: event.message,
                        filename: event.filename,
                        lineno: event.lineno,
                        colno: event.colno,
                        error: event.error,
                        stack: event.error?.stack
                    });
                });

                // 捕获Promise rejection
                window.addEventListener('unhandledrejection', (event) => {
                    this.captureError({
                        type: 'promise',
                        message: `Unhandled Promise Rejection: ${event.reason}`,
                        reason: event.reason,
                        promise: event.promise
                    });
                });

                // 模拟网络错误监控
                this.interceptFetch();

                // 定期更新指标
                setInterval(() => this.updateMetrics(), 1000);
            }

            interceptFetch() {
                const originalFetch = window.fetch;
                window.fetch = async (...args) => {
                    try {
                        const response = await originalFetch(...args);
                        if (!response.ok) {
                            this.captureError({
                                type: 'network',
                                message: `HTTP ${response.status}: ${response.statusText}`,
                                url: args[0],
                                status: response.status
                            });
                        }
                        return response;
                    } catch (error) {
                        this.captureError({
                            type: 'network',
                            message: error.message,
                            url: args[0],
                            error
                        });
                        throw error;
                    }
                };
            }

            captureError(errorInfo) {
                const error = {
                    id: Date.now() + Math.random(),
                    timestamp: new Date(),
                    severity: this.calculateSeverity(errorInfo),
                    userId: this.getCurrentUserId(),
                    fingerprint: this.generateFingerprint(errorInfo),
                    ...errorInfo
                };

                this.errors.push(error);
                if (this.errors.length > this.maxErrors) {
                    this.errors.shift();
                }

                this.metrics.total++;
                this.metrics.affectedUsers.add(error.userId);

                this.notify(error);
            }

            calculateSeverity(error) {
                if (error.type === 'javascript' && error.message?.includes('TypeError')) {
                    return 'high';
                }
                if (error.type === 'network' && error.status >= 500) {
                    return 'high';
                }
                if (error.type === 'promise') {
                    return 'medium';
                }
                return 'low';
            }

            generateFingerprint(error) {
                const key = `${error.type}-${error.message}-${error.filename}-${error.lineno}`;
                return btoa(key).substring(0, 8);
            }

            getCurrentUserId() {
                return localStorage.getItem('userId') || 'anonymous';
            }

            updateMetrics() {
                const now = Date.now();
                const oneMinuteAgo = now - 60000;
                const recentErrors = this.errors.filter(e => 
                    e.timestamp.getTime() > oneMinuteAgo
                );
                this.metrics.rate = recentErrors.length;

                // 检查告警条件
                if (this.metrics.rate > 10) {
                    this.triggerAlert('错误率超过阈值！当前：' + this.metrics.rate + ' 错误/分钟');
                }
            }

            triggerAlert(message) {
                document.getElementById('alertMessage').textContent = message;
                document.getElementById('alertBanner').classList.add('active');
            }

            subscribe(listener) {
                this.listeners.add(listener);
                return () => this.listeners.delete(listener);
            }

            notify(error) {
                this.listeners.forEach(listener => listener(error));
            }

            getErrors(filter = {}) {
                let filtered = [...this.errors];
                
                if (filter.type) {
                    filtered = filtered.filter(e => e.type === filter.type);
                }
                
                if (filter.search) {
                    const search = filter.search.toLowerCase();
                    filtered = filtered.filter(e => 
                        e.message.toLowerCase().includes(search)
                    );
                }
                
                return filtered.sort((a, b) => b.timestamp - a.timestamp);
            }

            getErrorStats() {
                const stats = {
                    byType: {},
                    bySeverity: {},
                    timeline: []
                };

                this.errors.forEach(error => {
                    stats.byType[error.type] = (stats.byType[error.type] || 0) + 1;
                    stats.bySeverity[error.severity] = (stats.bySeverity[error.severity] || 0) + 1;
                });

                // 生成时间线数据
                const now = Date.now();
                for (let i = 59; i >= 0; i--) {
                    const minute = now - i * 60000;
                    const count = this.errors.filter(e => {
                        const time = e.timestamp.getTime();
                        return time >= minute && time < minute + 60000;
                    }).length;
                    stats.timeline.push(count);
                }

                return stats;
            }
        }

        // UI控制器
        class DashboardUI {
            constructor(monitor) {
                this.monitor = monitor;
                this.selectedError = null;
                this.currentFilter = {};
                this.init();
            }

            init() {
                // 订阅错误更新
                this.monitor.subscribe(() => this.update());
                
                // 初始更新
                this.update();
                
                // 定期更新图表
                setInterval(() => this.updateChart(), 5000);
            }

            update() {
                this.updateMetrics();
                this.updateErrorList();
                this.updateChart();
            }

            updateMetrics() {
                document.getElementById('totalErrors').textContent = this.monitor.metrics.total;
                document.getElementById('errorRate').textContent = this.monitor.metrics.rate;
                document.getElementById('affectedUsers').textContent = this.monitor.metrics.affectedUsers.size;
            }

            updateErrorList() {
                const errors = this.monitor.getErrors(this.currentFilter);
                const listEl = document.getElementById('errorList');
                
                listEl.innerHTML = errors.slice(0, 50).map(error => `
                    <div class="error-item ${this.selectedError?.id === error.id ? 'selected' : ''}" 
                         onclick="selectError('${error.id}')">
                        <div class="error-header">
                            <span class="error-message">${this.escapeHtml(error.message)}</span>
                            <span class="severity severity-${error.severity}">${error.severity.toUpperCase()}</span>
                        </div>
                        <div class="error-time">${this.formatTime(error.timestamp)}</div>
                    </div>
                `).join('');
            }

            updateChart() {
                const stats = this.monitor.getErrorStats();
                const chartEl = document.getElementById('trendChart');
                const max = Math.max(...stats.timeline, 1);
                
                chartEl.innerHTML = stats.timeline.map((count, index) => `
                    <div class="chart-bar" style="height: ${(count / max) * 100}%">
                        <div class="chart-tooltip">${count} 错误</div>
                    </div>
                `).join('');
            }

            selectError(errorId) {
                const error = this.monitor.errors.find(e => e.id === parseFloat(errorId));
                if (!error) return;
                
                this.selectedError = error;
                this.updateErrorList();
                
                const detailEl = document.getElementById('errorDetail');
                detailEl.innerHTML = `
                    <div class="detail-section">
                        <h4>错误信息</h4>
                        <p><strong>类型:</strong> ${error.type}</p>
                        <p><strong>消息:</strong> ${this.escapeHtml(error.message)}</p>
                        <p><strong>时间:</strong> ${error.timestamp.toLocaleString()}</p>
                        <p><strong>严重程度:</strong> <span class="severity severity-${error.severity}">${error.severity.toUpperCase()}</span></p>
                        <p><strong>用户ID:</strong> ${error.userId}</p>
                        <p><strong>指纹:</strong> ${error.fingerprint}</p>
                    </div>
                    
                    ${error.filename ? `
                        <div class="detail-section">
                            <h4>位置信息</h4>
                            <p><strong>文件:</strong> ${error.filename}</p>
                            <p><strong>行号:</strong> ${error.lineno || 'N/A'}</p>
                            <p><strong>列号:</strong> ${error.colno || 'N/A'}</p>
                        </div>
                    ` : ''}
                    
                    ${error.stack ? `
                        <div class="detail-section">
                            <h4>堆栈追踪</h4>
                            <div class="stack-trace">${this.escapeHtml(error.stack)}</div>
                        </div>
                    ` : ''}
                    
                    ${error.url ? `
                        <div class="detail-section">
                            <h4>网络信息</h4>
                            <p><strong>URL:</strong> ${error.url}</p>
                            <p><strong>状态码:</strong> ${error.status || 'N/A'}</p>
                        </div>
                    ` : ''}
                `;
            }

            switchTab(type) {
                document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
                event.target.classList.add('active');
                
                this.currentFilter = type === 'all' ? {} : { type };
                this.updateErrorList();
            }

            filterErrors(search) {
                this.currentFilter = { ...this.currentFilter, search };
                this.updateErrorList();
            }

            formatTime(date) {
                const now = new Date();
                const diff = now - date;
                
                if (diff < 60000) return '刚刚';
                if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`;
                if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`;
                return date.toLocaleDateString();
            }

            escapeHtml(text) {
                const div = document.createElement('div');
                div.textContent = text;
                return div.innerHTML;
            }
        }

        // 初始化
        const monitor = new ErrorMonitor();
        const ui = new DashboardUI(monitor);

        // 全局函数
        function selectError(errorId) {
            ui.selectError(errorId);
        }

        function switchTab(type) {
            ui.switchTab(type);
        }

        function filterErrors(search) {
            ui.filterErrors(search);
        }

        function dismissAlert() {
            document.getElementById('alertBanner').classList.remove('active');
        }

        function exportReport() {
            const stats = monitor.getErrorStats();
            const report = {
                generated: new Date().toISOString(),
                summary: {
                    totalErrors: monitor.metrics.total,
                    affectedUsers: monitor.metrics.affectedUsers.size,
                    errorRate: monitor.metrics.rate
                },
                errors: monitor.getErrors(),
                statistics: stats
            };
            
            const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `error-report-${new Date().toISOString()}.json`;
            a.click();
            URL.revokeObjectURL(url);
        }

        function simulateErrors() {
            // 模拟JavaScript错误
            try {
                null.toString();
            } catch (e) {}
            
            // 模拟Promise rejection
            Promise.reject('模拟的Promise错误');
            
            // 模拟网络错误
            fetch('https://nonexistent-url.com/api/data').catch(() => {});
            
            // 模拟类型错误
            try {
                const obj = undefined;
                obj.property;
            } catch (e) {}
            
            // 模拟范围错误
            try {
                const arr = new Array(-1);
            } catch (e) {}
        }

        // 设置用户ID（模拟）
        if (!localStorage.getItem('userId')) {
            localStorage.setItem('userId', 'user_' + Math.random().toString(36).substr(2, 9));
        }
    </script>
</body>
</html>
```

这个解决方案实现了一个功能完整的错误监控仪表板，包含：

1. **错误捕获** - 自动捕获JavaScript错误、Promise rejection和网络错误
2. **实时监控** - 显示错误总数、错误率和影响用户数
3. **趋势图表** - 展示最近60分钟的错误趋势
4. **错误列表** - 可搜索和过滤的错误列表
5. **错误详情** - 完整的错误信息和堆栈追踪
6. **告警系统** - 错误率超过阈值时自动告警
7. **导出功能** - 导出JSON格式的错误报告

系统设计简洁高效，易于扩展和维护。