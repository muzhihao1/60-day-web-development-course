---
day: 36
phase: "react-development"
title: "环境配置与部署"
description: "学习React应用的环境配置、构建优化和部署策略"
objectives:
  - "理解开发、测试和生产环境的区别"
  - "掌握环境变量管理和配置"
  - "学习构建优化技术"
  - "掌握多种部署平台的使用"
  - "了解CI/CD流程和监控"
estimatedTime: 180
difficulty: "intermediate"
prerequisites: [25, 28, 35]
resources:
  - title: "Create React App部署文档"
    url: "https://create-react-app.dev/docs/deployment/"
    type: "article"
    description: "官方部署指南"
  - title: "Vite生产构建指南"
    url: "https://vitejs.dev/guide/build.html"
    type: "article"
    description: "Vite构建优化"
  - title: "Vercel部署React应用"
    url: "https://vercel.com/guides/deploying-react-with-vercel"
    type: "article"
    description: "Vercel部署教程"
---

# Day 36: 环境配置与部署

## 学习目标

今天我们将学习如何将React应用从开发环境部署到生产环境，包括环境配置、构建优化和多种部署方案。

## 1. 环境管理基础

### 环境的概念

在软件开发中，我们通常有多个环境：

1. **开发环境（Development）**
   - 本地开发服务器
   - 热重载功能
   - 详细的错误信息
   - Source maps

2. **测试环境（Staging）**
   - 类生产环境
   - 用于QA测试
   - 可能使用测试数据库

3. **生产环境（Production）**
   - 优化的代码
   - 压缩和混淆
   - 性能优先
   - 错误追踪

### 环境变量管理

```bash
# .env.development
REACT_APP_API_URL=http://localhost:3001
REACT_APP_ENV=development
REACT_APP_DEBUG=true

# .env.production
REACT_APP_API_URL=https://api.myapp.com
REACT_APP_ENV=production
REACT_APP_DEBUG=false
```

在React中使用：

```javascript
// src/config/environment.js
const config = {
  apiUrl: process.env.REACT_APP_API_URL,
  environment: process.env.REACT_APP_ENV,
  isDebug: process.env.REACT_APP_DEBUG === 'true',
  
  // 根据环境设置不同配置
  features: {
    analytics: process.env.REACT_APP_ENV === 'production',
    debugPanel: process.env.REACT_APP_ENV === 'development'
  }
};

export default config;
```

## 2. 构建优化技术

### 代码分割（Code Splitting）

```javascript
// 路由级别的代码分割
import { lazy, Suspense } from 'react';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Profile = lazy(() => import('./pages/Profile'));
const Settings = lazy(() => import('./pages/Settings'));

function App() {
  return (
    <Router>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Suspense>
    </Router>
  );
}
```

### 生产构建配置

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    visualizer() // 分析bundle大小
  ],
  build: {
    // 分割vendor代码
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          utils: ['lodash', 'date-fns']
        }
      }
    },
    // 压缩选项
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  }
});
```

### 性能优化清单

1. **图片优化**
   ```javascript
   // 使用懒加载
   import { LazyLoadImage } from 'react-lazy-load-image-component';
   
   <LazyLoadImage
     src="large-image.jpg"
     alt="Description"
     effect="blur"
   />
   ```

2. **Bundle分析**
   ```bash
   # 安装分析工具
   npm install --save-dev webpack-bundle-analyzer
   
   # 分析构建
   npm run build -- --analyze
   ```

## 3. 部署平台详解

### Vercel部署

```bash
# 安装Vercel CLI
npm i -g vercel

# 部署
vercel

# 配置文件 vercel.json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "s-maxage=60" }
      ]
    }
  ]
}
```

### Netlify部署

```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"
```

### 传统服务器部署

```nginx
# nginx.conf
server {
    listen 80;
    server_name myapp.com;
    root /var/www/myapp;
    
    location / {
        try_files $uri /index.html;
    }
    
    location /static {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    gzip on;
    gzip_types text/css application/javascript;
}
```

## 4. CI/CD配置

### GitHub Actions示例

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test -- --coverage
    
    - name: Build
      run: npm run build
      env:
        REACT_APP_API_URL: ${{ secrets.PRODUCTION_API_URL }}
    
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v25
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.ORG_ID }}
        vercel-project-id: ${{ secrets.PROJECT_ID }}
        vercel-args: '--prod'
```

## 5. 监控和错误追踪

### Sentry集成

```javascript
// src/index.js
import * as Sentry from "@sentry/react";

if (process.env.REACT_APP_ENV === 'production') {
  Sentry.init({
    dsn: process.env.REACT_APP_SENTRY_DSN,
    integrations: [
      new Sentry.BrowserTracing(),
      new Sentry.Replay()
    ],
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });
}

// 错误边界集成
const App = () => (
  <Sentry.ErrorBoundary fallback={<ErrorFallback />}>
    <Routes />
  </Sentry.ErrorBoundary>
);
```

## 6. 性能监控

```javascript
// src/utils/performance.js
export function reportWebVitals(onPerfEntry) {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry);
      getFID(onPerfEntry);
      getFCP(onPerfEntry);
      getLCP(onPerfEntry);
      getTTFB(onPerfEntry);
    });
  }
}

// 发送到分析服务
reportWebVitals((metric) => {
  // 发送到Google Analytics
  window.gtag('event', metric.name, {
    value: Math.round(metric.value),
    metric_id: metric.id,
    metric_value: metric.value,
    metric_delta: metric.delta,
  });
});
```

## 今日练习

### 练习1：环境配置实战

创建一个支持多环境的React应用：

1. 配置开发、测试、生产环境变量
2. 实现条件功能开关
3. 添加环境指示器组件

### 练习2：优化和部署

1. 实现路由级代码分割
2. 配置构建优化
3. 部署到Vercel或Netlify
4. 设置自定义域名

### 练习3：监控集成

1. 集成错误追踪服务
2. 添加性能监控
3. 创建自定义错误边界
4. 实现用户反馈收集

## 扩展资源

- [React Production Best Practices](https://reactjs.org/docs/optimizing-performance.html)
- [Web Vitals](https://web.dev/vitals/)
- [Deployment Checklist](https://github.com/thedaviddias/Front-End-Checklist)

## 明日预告

明天我们将学习React生态系统的高级工具和库，包括状态管理的更多选择、UI组件库和开发工具。