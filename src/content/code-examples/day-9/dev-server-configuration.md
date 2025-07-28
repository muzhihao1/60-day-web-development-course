---
title: "开发服务器配置示例"
description: "Webpack Dev Server和Vite开发服务器的详细配置"
---

## Webpack Dev Server基础配置

```javascript
// webpack.config.js
module.exports = {
  devServer: {
    port: 3000,
    host: 'localhost',
    open: true,                    // 自动打开浏览器
    hot: true,                     // 热模块替换
    compress: true,                // 启用gzip压缩
    historyApiFallback: true,      // 处理HTML5 History API
    static: {
      directory: path.join(__dirname, 'public'),
      publicPath: '/',
      watch: true                  // 监听静态文件变化
    }
  }
};
```

## 代理配置

### Webpack代理

```javascript
// webpack.config.js
module.exports = {
  devServer: {
    proxy: {
      // 简单代理
      '/api': 'http://localhost:3001',
      
      // 详细配置
      '/api': {
        target: 'http://localhost:3001',
        pathRewrite: { '^/api': '' },
        changeOrigin: true,
        secure: false,
        logLevel: 'debug'
      },
      
      // 多个代理
      '/auth': {
        target: 'http://auth-server.com',
        changeOrigin: true,
        cookieDomainRewrite: 'localhost'
      },
      
      // 自定义代理逻辑
      '/custom': {
        target: 'http://localhost:3001',
        bypass: function(req, res, proxyOptions) {
          if (req.headers.accept.indexOf('html') !== -1) {
            console.log('Skipping proxy for browser request.');
            return '/index.html';
          }
        }
      }
    }
  }
};
```

### Vite代理

```javascript
// vite.config.js
export default {
  server: {
    proxy: {
      // 字符串简写
      '/foo': 'http://localhost:4567',
      
      // 选项写法
      '/api': {
        target: 'http://jsonplaceholder.typicode.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        configure: (proxy, options) => {
          // 自定义配置
          proxy.on('error', (err, req, res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('Sending Request:', req.method, req.url);
          });
        }
      },
      
      // 正则表达式
      '^/fallback/.*': {
        target: 'http://jsonplaceholder.typicode.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/fallback/, ''),
        logger: console
      }
    }
  }
};
```

## HTTPS配置

### Webpack HTTPS

```javascript
// webpack.config.js
const fs = require('fs');
const path = require('path');

module.exports = {
  devServer: {
    https: true,  // 使用自签名证书
    
    // 或使用自定义证书
    https: {
      key: fs.readFileSync(path.join(__dirname, 'cert/server.key')),
      cert: fs.readFileSync(path.join(__dirname, 'cert/server.crt')),
      ca: fs.readFileSync(path.join(__dirname, 'cert/ca.pem'))
    },
    
    // HTTP/2
    http2: true,
    
    // 允许无效证书
    allowedHosts: [
      'localhost',
      '.localhost',
      'local.dev'
    ]
  }
};
```

### Vite HTTPS

```javascript
// vite.config.js
import fs from 'fs';

export default {
  server: {
    https: {
      key: fs.readFileSync('./cert/key.pem'),
      cert: fs.readFileSync('./cert/cert.pem')
    },
    // 或使用 mkcert
    https: true
  }
};

// 使用 @vitejs/plugin-basic-ssl
import basicSsl from '@vitejs/plugin-basic-ssl';

export default {
  plugins: [basicSsl()]
};
```

## 热模块替换(HMR)配置

### Webpack HMR

```javascript
// webpack.config.js
const webpack = require('webpack');

module.exports = {
  devServer: {
    hot: true,
    liveReload: true,
    watchFiles: ['src/**/*.php', 'public/**/*']
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ]
};

// 在应用代码中
if (module.hot) {
  module.hot.accept('./App.js', function() {
    console.log('App module updated!');
    renderApp();
  });
  
  // 处理CSS热更新
  module.hot.accept('./styles.css', function() {
    console.log('Styles updated!');
  });
  
  // 保存状态
  module.hot.dispose(function(data) {
    data.appState = getAppState();
  });
  
  // 恢复状态
  if (module.hot.data) {
    restoreAppState(module.hot.data.appState);
  }
}
```

### Vite HMR

```javascript
// vite.config.js
export default {
  server: {
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 5173,
      clientPort: 443,
      overlay: true
    }
  }
};

// 在应用代码中
if (import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    // 模块更新逻辑
    updateModule(newModule);
  });
  
  // 自定义HMR
  import.meta.hot.accept('./foo.js', (newFoo) => {
    // 更新foo模块
    foo = newFoo.foo;
  });
  
  // 清理副作用
  import.meta.hot.dispose(() => {
    // 清理定时器、事件监听器等
    clearInterval(timer);
  });
  
  // 触发自定义事件
  import.meta.hot.on('custom-event', (data) => {
    console.log('Custom event:', data);
  });
}
```

## 中间件配置

### Webpack中间件

```javascript
// webpack.config.js
module.exports = {
  devServer: {
    setupMiddlewares: (middlewares, devServer) => {
      // 在所有中间件之前添加
      middlewares.unshift({
        name: 'first-middleware',
        path: '/api/test',
        middleware: (req, res) => {
          res.json({ message: 'Hello from middleware!' });
        }
      });
      
      // 自定义中间件
      devServer.app.use('/api/auth', (req, res, next) => {
        if (req.headers.authorization) {
          next();
        } else {
          res.status(401).json({ error: 'Unauthorized' });
        }
      });
      
      // 使用express中间件
      const bodyParser = require('body-parser');
      devServer.app.use(bodyParser.json());
      
      return middlewares;
    },
    
    // WebSocket配置
    webSocketServer: 'ws',
    client: {
      webSocketURL: {
        hostname: '0.0.0.0',
        pathname: '/ws',
        port: 8080,
        protocol: 'ws'
      },
      reconnect: true,
      overlay: {
        errors: true,
        warnings: false
      }
    }
  }
};
```

### Vite中间件

```javascript
// vite.config.js
export default {
  server: {
    middlewareMode: false,
  },
  plugins: [
    {
      name: 'configure-server',
      configureServer(server) {
        // 添加自定义中间件
        server.middlewares.use((req, res, next) => {
          if (req.url === '/api/timestamp') {
            res.end(JSON.stringify({ time: Date.now() }));
            return;
          }
          next();
        });
        
        // 使用express风格路由
        server.middlewares.use('/api/users', (req, res) => {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify([
            { id: 1, name: 'Alice' },
            { id: 2, name: 'Bob' }
          ]));
        });
      }
    }
  ]
};
```

## 性能优化配置

### Webpack Dev Server优化

```javascript
// webpack.config.js
module.exports = {
  devServer: {
    // 优化性能
    devMiddleware: {
      writeToDisk: false,  // 不写入磁盘
      publicPath: '/',
      stats: 'minimal'     // 减少日志输出
    },
    
    // 监听优化
    watchFiles: {
      paths: ['src/**/*', 'public/**/*'],
      options: {
        ignored: /node_modules/,
        usePolling: false,  // 使用原生文件系统事件
        poll: false
      }
    },
    
    // 静态资源优化
    static: {
      directory: path.join(__dirname, 'public'),
      serveIndex: true,
      watch: {
        ignored: '**/.git/**',
        usePolling: false,
        interval: 100,
        binaryInterval: 300
      }
    }
  },
  
  // 构建优化
  optimization: {
    removeAvailableModules: false,
    removeEmptyChunks: false,
    splitChunks: false
  },
  
  // 输出优化
  output: {
    pathinfo: false
  }
};
```

### Vite优化配置

```javascript
// vite.config.js
export default {
  server: {
    // 预热常用文件
    warmup: {
      clientFiles: ['./src/main.tsx', './src/App.tsx']
    },
    
    // 文件系统缓存
    fs: {
      strict: true,
      allow: ['..'],
      deny: ['.env', '.env.*', '*.pem']
    }
  },
  
  // 优化依赖预构建
  optimizeDeps: {
    include: ['react', 'react-dom', 'axios'],
    exclude: ['@vicons/ionicons5'],
    esbuildOptions: {
      target: 'es2020'
    }
  },
  
  // 性能提示
  build: {
    reportCompressedSize: false,
    chunkSizeWarningLimit: 1000
  }
};
```

## 错误处理和日志

```javascript
// webpack.config.js
module.exports = {
  devServer: {
    client: {
      logging: 'info',
      progress: true,
      overlay: {
        errors: true,
        warnings: false,
        runtimeErrors: (error) => {
          if (error.message === 'ResizeObserver loop limit exceeded') {
            return false;
          }
          return true;
        }
      }
    },
    
    // 自定义错误页面
    setupMiddlewares: (middlewares, devServer) => {
      devServer.app.use((err, req, res, next) => {
        res.status(500).send(`
          <html>
            <body>
              <h1>Error: ${err.message}</h1>
              <pre>${err.stack}</pre>
            </body>
          </html>
        `);
      });
      return middlewares;
    }
  }
};

// vite.config.js
export default {
  server: {
    hmr: {
      overlay: true
    }
  },
  customLogger: {
    info: (msg) => console.log(`[INFO] ${msg}`),
    warn: (msg) => console.warn(`[WARN] ${msg}`),
    error: (msg) => console.error(`[ERROR] ${msg}`)
  }
};
```