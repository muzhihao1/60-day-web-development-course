---
day: 17
title: "构建离线个人财务追踪器"
description: "综合运用Web存储技术构建功能完整的财务管理应用"
difficulty: "advanced"
requirements:
  - "实现多种存储技术的综合应用"
  - "构建离线可用的PWA应用"
  - "实现数据持久化和同步"
  - "创建高效的数据管理系统"
estimatedTime: 240
---

# 构建离线个人财务追踪器 📊

## 项目概述

创建一个功能完整的个人财务追踪应用，支持收支记录、预算管理、数据分析和离线使用。通过这个项目，你将综合运用所有Web存储技术。

## 基础要求

### 1. 用户偏好设置（localStorage）
```javascript
// 需要持久保存的设置
const preferences = {
    theme: 'light/dark',
    currency: 'CNY/USD/EUR',
    language: 'zh-CN/en-US',
    categories: ['食品', '交通', '娱乐', '购物', '其他'],
    monthlyBudget: 10000,
    notifications: true,
    exportFormat: 'json/csv'
};
```

### 2. 会话数据（sessionStorage）
```javascript
// 临时会话数据
const sessionData = {
    currentFilter: { category: null, dateRange: null },
    draftTransaction: { amount: 0, category: '', note: '' },
    calculatorHistory: [],
    unsavedChanges: false
};
```

### 3. 交易记录（IndexedDB）
```javascript
// 数据库结构
const dbSchema = {
    transactions: {
        id: 'auto-increment',
        amount: number,
        type: 'income/expense',
        category: string,
        description: string,
        date: Date,
        tags: Array,
        recurring: boolean
    },
    budgets: {
        category: string,
        amount: number,
        spent: number,
        month: string
    },
    analytics: {
        month: string,
        totalIncome: number,
        totalExpense: number,
        byCategory: Object
    }
};
```

### 4. 离线功能（Service Worker）
- 缓存应用资源
- 离线时队列交易记录
- 恢复连接时自动同步
- 显示离线/在线状态

## 功能需求

### 核心功能

1. **交易管理**
   - 添加收入/支出记录
   - 编辑和删除交易
   - 批量操作
   - 重复交易设置

2. **预算追踪**
   - 设置月度预算
   - 分类别预算
   - 实时追踪支出
   - 预算警告提醒

3. **数据分析**
   - 月度收支统计
   - 分类支出分析
   - 趋势图表
   - 导出报表

4. **搜索与筛选**
   - 按日期范围筛选
   - 按类别筛选
   - 按金额范围筛选
   - 全文搜索

### UI要求

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>个人财务追踪器</title>
    <link rel="manifest" href="manifest.json">
    <style>
        /* 基础样式 */
        :root {
            --primary-color: #4CAF50;
            --expense-color: #f44336;
            --income-color: #2196F3;
            --background: #f5f5f5;
            --card-bg: white;
        }

        [data-theme="dark"] {
            --background: #121212;
            --card-bg: #1e1e1e;
        }

        /* 响应式布局 */
        .dashboard {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            padding: 20px;
        }

        /* 离线指示器 */
        .offline-indicator {
            position: fixed;
            top: 0;
            width: 100%;
            background: #ff9800;
            color: white;
            text-align: center;
            padding: 5px;
            display: none;
        }

        .offline .offline-indicator {
            display: block;
        }
    </style>
</head>
<body>
    <div class="offline-indicator">
        当前处于离线模式 - 数据将在恢复连接后同步
    </div>

    <header>
        <h1>财务追踪器</h1>
        <nav>
            <button id="overview-tab">总览</button>
            <button id="transactions-tab">交易记录</button>
            <button id="budget-tab">预算管理</button>
            <button id="analytics-tab">数据分析</button>
            <button id="settings-tab">设置</button>
        </nav>
    </header>

    <main>
        <!-- 总览面板 -->
        <section id="overview" class="dashboard">
            <div class="card balance-card">
                <h2>本月余额</h2>
                <p class="balance">¥0.00</p>
                <div class="income-expense">
                    <span class="income">收入: ¥0.00</span>
                    <span class="expense">支出: ¥0.00</span>
                </div>
            </div>

            <div class="card quick-add">
                <h2>快速添加</h2>
                <form id="quick-transaction-form">
                    <input type="number" placeholder="金额" required>
                    <select required>
                        <option value="">选择类别</option>
                    </select>
                    <button type="submit" class="income-btn">收入</button>
                    <button type="submit" class="expense-btn">支出</button>
                </form>
            </div>

            <div class="card recent-transactions">
                <h2>最近交易</h2>
                <ul id="recent-list"></ul>
            </div>
        </section>

        <!-- 交易记录面板 -->
        <section id="transactions" class="hidden">
            <div class="filters">
                <input type="date" id="date-from" placeholder="开始日期">
                <input type="date" id="date-to" placeholder="结束日期">
                <select id="category-filter">
                    <option value="">所有类别</option>
                </select>
                <input type="search" id="search" placeholder="搜索...">
                <button id="apply-filters">应用筛选</button>
                <button id="clear-filters">清除</button>
            </div>

            <div class="transaction-list">
                <table id="transaction-table">
                    <thead>
                        <tr>
                            <th>日期</th>
                            <th>类别</th>
                            <th>描述</th>
                            <th>金额</th>
                            <th>操作</th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                </table>
            </div>

            <div class="pagination">
                <button id="prev-page">上一页</button>
                <span id="page-info">1 / 1</span>
                <button id="next-page">下一页</button>
            </div>
        </section>

        <!-- 预算管理面板 -->
        <section id="budget" class="hidden">
            <div class="budget-overview">
                <h2>月度预算</h2>
                <div class="budget-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: 0%"></div>
                    </div>
                    <p>已使用: ¥0 / ¥10000</p>
                </div>
            </div>

            <div class="category-budgets">
                <h2>分类预算</h2>
                <div id="category-budget-list"></div>
                <button id="add-category-budget">添加分类预算</button>
            </div>
        </section>

        <!-- 数据分析面板 -->
        <section id="analytics" class="hidden">
            <div class="chart-container">
                <canvas id="expense-chart"></canvas>
            </div>
            
            <div class="stats-grid">
                <div class="stat-card">
                    <h3>平均日支出</h3>
                    <p id="avg-daily-expense">¥0</p>
                </div>
                <div class="stat-card">
                    <h3>最大支出类别</h3>
                    <p id="top-category">-</p>
                </div>
                <div class="stat-card">
                    <h3>本月节余率</h3>
                    <p id="savings-rate">0%</p>
                </div>
            </div>

            <div class="export-section">
                <h2>导出数据</h2>
                <button id="export-json">导出JSON</button>
                <button id="export-csv">导出CSV</button>
                <button id="backup-data">备份到云端</button>
            </div>
        </section>

        <!-- 设置面板 -->
        <section id="settings" class="hidden">
            <div class="settings-group">
                <h2>外观设置</h2>
                <label>
                    <input type="checkbox" id="dark-mode">
                    深色模式
                </label>
            </div>

            <div class="settings-group">
                <h2>数据管理</h2>
                <button id="import-data">导入数据</button>
                <button id="clear-data">清除所有数据</button>
                <button id="sync-now">立即同步</button>
            </div>

            <div class="settings-group">
                <h2>离线存储</h2>
                <p>缓存大小: <span id="cache-size">计算中...</span></p>
                <button id="clear-cache">清除缓存</button>
            </div>
        </section>
    </main>

    <script src="app.js"></script>
</body>
</html>
```

## 实现提示

### 1. 存储管理类
```javascript
class StorageManager {
    // localStorage管理
    static savePreferences(prefs) {
        localStorage.setItem('preferences', JSON.stringify(prefs));
    }

    // sessionStorage管理
    static saveDraft(transaction) {
        sessionStorage.setItem('draft', JSON.stringify(transaction));
    }

    // Cookie管理（用于跨子域共享）
    static setAnalyticsCookie(data) {
        document.cookie = `analytics=${JSON.stringify(data)}; 
                          max-age=2592000; path=/; domain=.example.com`;
    }
}
```

### 2. IndexedDB操作
```javascript
class FinanceDB {
    async addTransaction(transaction) {
        // 添加交易记录
        // 更新相关统计
        // 触发预算检查
    }

    async getTransactionsByDateRange(start, end) {
        // 使用索引进行范围查询
    }

    async calculateMonthlyStats(year, month) {
        // 聚合计算月度统计
    }
}
```

### 3. 离线同步
```javascript
class OfflineManager {
    async queueTransaction(transaction) {
        // 离线时保存到队列
    }

    async syncPendingTransactions() {
        // 恢复连接时同步
    }
}
```

## 进阶功能

1. **智能提醒**
   - 预算超支警告
   - 账单到期提醒
   - 异常支出检测

2. **数据可视化**
   - 使用Chart.js展示趋势
   - 饼图显示支出分布
   - 时间轴展示收支历史

3. **多设备同步**
   - 使用Service Worker后台同步
   - 冲突解决策略
   - 增量更新

4. **数据安全**
   - 敏感数据加密存储
   - 定期自动备份
   - 导入数据验证

## 评分标准

- **基础功能 (40分)**
  - 正确使用各种存储API
  - 基本CRUD操作完整
  - 数据持久化正常

- **离线功能 (20分)**
  - Service Worker正确注册
  - 离线时功能可用
  - 数据同步机制完善

- **用户体验 (20分)**
  - 界面响应式设计
  - 操作反馈及时
  - 错误处理友好

- **进阶功能 (20分)**
  - 数据分析功能
  - 导入导出功能
  - 性能优化

## 挑战任务

1. 实现数据加密存储
2. 添加多用户支持
3. 集成第三方支付API
4. 实现语音输入记账
5. 添加机器学习预测支出

## 学习资源

- [IndexedDB最佳实践](https://web.dev/indexeddb-best-practices/)
- [PWA离线策略](https://web.dev/offline-cookbook/)
- [Web存储安全指南](https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html#local-storage)

祝你构建出色的财务追踪应用！记住，合理选择存储方案是关键。