// Day 36: 部署优化实战

import React, { lazy, Suspense, useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';

// ==========================================
// 1. 代码分割和懒加载
// ==========================================

// 路由级别的代码分割
const Home = lazy(() => import('./pages/Home'));
const Dashboard = lazy(() => 
  import(/* webpackChunkName: "dashboard" */ './pages/Dashboard')
);
const Profile = lazy(() => 
  import(/* webpackChunkName: "profile" */ './pages/Profile')
);
const Analytics = lazy(() => 
  import(/* webpackChunkName: "analytics" */ './pages/Analytics')
);

// 加载组件
function LazyLoadingSpinner() {
  return (
    <div className="loading-spinner">
      <div className="spinner"></div>
      <p>Loading...</p>
    </div>
  );
}

// 错误边界
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    
    // 生产环境发送错误报告
    if (process.env.NODE_ENV === 'production' && window.Sentry) {
      window.Sentry.captureException(error, {
        contexts: { react: { componentStack: errorInfo.componentStack } }
      });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback">
          <h2>Something went wrong</h2>
          <button onClick={() => window.location.reload()}>
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// 应用路由配置
export function OptimizedApp() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LazyLoadingSpinner />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard/*" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/analytics" element={<Analytics />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}

// ==========================================
// 2. 组件级别的懒加载
// ==========================================

// 条件加载重组件
function ConditionalHeavyComponent() {
  const [showChart, setShowChart] = useState(false);
  
  // 懒加载图表组件
  const Chart = lazy(() => 
    import(/* webpackChunkName: "charts" */ './components/Chart')
  );

  return (
    <div>
      <button onClick={() => setShowChart(true)}>
        Load Chart
      </button>
      
      {showChart && (
        <Suspense fallback={<div>Loading chart...</div>}>
          <Chart />
        </Suspense>
      )}
    </div>
  );
}

// 基于IntersectionObserver的懒加载
function LazyImage({ src, alt, placeholder }) {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [imageRef, setImageRef] = useState();

  useEffect(() => {
    let observer;
    
    if (imageRef && imageSrc === placeholder) {
      observer = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              setImageSrc(src);
              observer.unobserve(imageRef);
            }
          });
        },
        { threshold: 0.1 }
      );
      
      observer.observe(imageRef);
    }
    
    return () => {
      if (observer && observer.unobserve) {
        observer.unobserve(imageRef);
      }
    };
  }, [imageRef, imageSrc, placeholder, src]);

  return (
    <img
      ref={setImageRef}
      src={imageSrc}
      alt={alt}
      loading="lazy"
    />
  );
}

// ==========================================
// 3. 性能优化配置
// ==========================================

// webpack配置示例（webpack.config.js）
const productionConfig = {
  mode: 'production',
  
  optimization: {
    // 代码分割配置
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: 10
        },
        common: {
          minChunks: 2,
          priority: 5,
          reuseExistingChunk: true
        }
      }
    },
    
    // 模块ID优化
    moduleIds: 'deterministic',
    
    // Runtime chunk
    runtimeChunk: 'single',
    
    // Tree shaking
    usedExports: true,
    
    // 压缩
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true,
            drop_debugger: true
          },
          mangle: true
        }
      }),
      new CssMinimizerPlugin()
    ]
  },
  
  // 性能提示
  performance: {
    hints: 'warning',
    maxEntrypointSize: 512000,
    maxAssetSize: 512000
  }
};

// ==========================================
// 4. Service Worker配置（PWA）
// ==========================================

// serviceWorkerRegistration.js
export function register() {
  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    window.addEventListener('load', () => {
      const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;
      
      navigator.serviceWorker
        .register(swUrl)
        .then(registration => {
          registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            if (installingWorker == null) {
              return;
            }
            
            installingWorker.onstatechange = () => {
              if (installingWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  // 新内容可用，提示用户刷新
                  console.log('New content available');
                  showUpdateNotification();
                } else {
                  // 首次安装完成
                  console.log('Content cached for offline use');
                }
              }
            };
          };
        })
        .catch(error => {
          console.error('Service Worker registration failed:', error);
        });
    });
  }
}

function showUpdateNotification() {
  // 显示更新提示
  const notification = document.createElement('div');
  notification.className = 'update-notification';
  notification.innerHTML = `
    <p>New version available!</p>
    <button onclick="window.location.reload()">Refresh</button>
  `;
  document.body.appendChild(notification);
}

// ==========================================
// 5. 预加载和预获取
// ==========================================

// 资源预加载组件
function ResourcePreloader() {
  useEffect(() => {
    // 预加载关键路由
    const routesToPreload = [
      () => import('./pages/Dashboard'),
      () => import('./pages/Profile')
    ];
    
    // 空闲时预加载
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        routesToPreload.forEach(load => load());
      });
    } else {
      // 降级方案
      setTimeout(() => {
        routesToPreload.forEach(load => load());
      }, 2000);
    }
  }, []);
  
  return null;
}

// 预获取链接组件
function PrefetchLink({ to, children }) {
  const handleMouseEnter = () => {
    // 动态导入对应的页面组件
    switch (to) {
      case '/dashboard':
        import('./pages/Dashboard');
        break;
      case '/profile':
        import('./pages/Profile');
        break;
      default:
        break;
    }
  };
  
  return (
    <Link to={to} onMouseEnter={handleMouseEnter}>
      {children}
    </Link>
  );
}

// ==========================================
// 6. 构建时优化
// ==========================================

// 环境变量替换（build时执行）
const buildTimeConfig = {
  // 移除开发时代码
  'process.env.NODE_ENV': JSON.stringify('production'),
  
  // 功能开关
  'process.env.REACT_APP_FEATURE_FLAG': JSON.stringify(false),
  
  // API端点
  'process.env.REACT_APP_API_URL': JSON.stringify('https://api.production.com')
};

// Webpack DefinePlugin配置
new webpack.DefinePlugin(buildTimeConfig);

// ==========================================
// 7. 监控和分析
// ==========================================

// 性能监控
export function PerformanceMonitor() {
  useEffect(() => {
    // Web Vitals监控
    if ('PerformanceObserver' in window) {
      // LCP (Largest Contentful Paint)
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        console.log('LCP:', lastEntry.renderTime || lastEntry.loadTime);
        
        // 发送到分析服务
        sendToAnalytics('LCP', lastEntry.renderTime || lastEntry.loadTime);
      }).observe({ type: 'largest-contentful-paint', buffered: true });
      
      // FID (First Input Delay)
      new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          console.log('FID:', entry.processingStart - entry.startTime);
          sendToAnalytics('FID', entry.processingStart - entry.startTime);
        });
      }).observe({ type: 'first-input', buffered: true });
      
      // CLS (Cumulative Layout Shift)
      let clsValue = 0;
      new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            console.log('CLS:', clsValue);
            sendToAnalytics('CLS', clsValue);
          }
        });
      }).observe({ type: 'layout-shift', buffered: true });
    }
    
    // 资源加载性能
    window.addEventListener('load', () => {
      const perfData = window.performance.timing;
      const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
      console.log('Page Load Time:', pageLoadTime);
      
      sendToAnalytics('PageLoadTime', pageLoadTime);
    });
  }, []);
  
  return null;
}

function sendToAnalytics(metric, value) {
  // Google Analytics
  if (window.gtag) {
    window.gtag('event', metric, {
      value: Math.round(value),
      event_category: 'Web Vitals'
    });
  }
  
  // 自定义分析端点
  fetch('/api/analytics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      metric,
      value,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href
    })
  }).catch(console.error);
}

// ==========================================
// 8. 部署脚本示例
// ==========================================

// deploy.sh
const deployScript = `
#!/bin/bash

# 构建优化
echo "Building optimized production bundle..."
npm run build

# 分析bundle大小
echo "Analyzing bundle size..."
npm run analyze

# 运行测试
echo "Running tests..."
npm test -- --coverage

# 检查构建产物
if [ ! -d "build" ]; then
  echo "Build failed!"
  exit 1
fi

# 部署到CDN
echo "Deploying to CDN..."
aws s3 sync build/ s3://my-app-bucket --delete
aws cloudfront create-invalidation --distribution-id ABCD1234 --paths "/*"

# 部署到Vercel
echo "Deploying to Vercel..."
vercel --prod

# 健康检查
echo "Running health check..."
curl -f https://myapp.com/health || exit 1

echo "Deployment successful!"
`;

// ==========================================
// 9. Docker配置示例
// ==========================================

// Dockerfile
const dockerfile = `
# 构建阶段
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# 生产阶段
FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
`;

// nginx.conf
const nginxConfig = `
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    
    # gzip压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    # 缓存策略
    location /static {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    location / {
        try_files $uri /index.html;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }
    
    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' https:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; style-src 'self' 'unsafe-inline' https:;" always;
}
`;

export { deployScript, dockerfile, nginxConfig };