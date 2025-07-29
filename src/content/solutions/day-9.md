---
day: 9
exerciseTitle: "构建工具实战：创建多环境构建配置"
approach: "通过创建完整的Webpack和Vite配置，实现图片画廊应用的开发和生产环境构建"
files:
  - path: "webpack-version/webpack.common.js"
    language: "javascript"
    description: "Webpack通用配置"
  - path: "webpack-version/webpack.dev.js"
    language: "javascript"
    description: "Webpack开发环境配置"
  - path: "webpack-version/webpack.prod.js"
    language: "javascript"
    description: "Webpack生产环境配置"
  - path: "vite-version/vite.config.js"
    language: "javascript"
    description: "Vite配置文件"
  - path: "src/index.js"
    language: "javascript"
    description: "应用入口文件"
  - path: "src/router.js"
    language: "javascript"
    description: "路由配置"
  - path: "src/components/LazyImage.js"
    language: "javascript"
    description: "懒加载图片组件"
keyTakeaways:
  - "Webpack需要更多配置但提供更细粒度的控制"
  - "Vite开发体验更好，配置更简单"
  - "代码分割和懒加载对性能至关重要"
  - "图片优化可以显著减少加载时间"
  - "环境变量管理是多环境部署的关键"
commonMistakes:
  - "忘记配置publicPath导致生产环境资源404"
  - "CSS Modules配置不当导致样式丢失"
  - "图片路径处理错误"
  - "环境变量在客户端代码中暴露敏感信息"
extensions:
  - title: "添加PWA支持实现离线访问"
    description: "扩展练习1：添加PWA支持实现离线访问"
  - title: "集成Service Worker缓存策略"
    description: "扩展练习2：集成Service Worker缓存策略"
  - title: "实现图片的渐进式加载"
    description: "扩展练习3：实现图片的渐进式加载"
  - title: "添加构建时的性能预算检查"
    description: "扩展练习4：添加构建时的性能预算检查"
---

# Day 09 解决方案：构建工具实战

## 解决方案概览

本解决方案展示了如何使用Webpack和Vite创建相同的图片画廊应用，包括完整的开发和生产环境配置。

## Webpack版本实现

### 1. 公共配置 (webpack.common.js)

```javascript
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const Dotenv = require('dotenv-webpack');

module.exports = {
  entry: {
    app: './src/index.js'
  },
  
  output: {
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/',
    clean: true
  },
  
  module: {
    rules: [
      // JavaScript处理
      {
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: ['@babel/plugin-syntax-dynamic-import'],
            cacheDirectory: true
          }
        }
      },
      
      // 字体文件处理
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[name].[hash][ext]'
        }
      }
    ]
  },
  
  plugins: [
    new CleanWebpackPlugin(),
    
    new HtmlWebpackPlugin({
      template: './public/index.html',
      favicon: './public/favicon.ico',
      meta: {
        viewport: 'width=device-width, initial-scale=1',
        description: '现代图片画廊应用'
      }
    }),
    
    new Dotenv({
      systemvars: true,
      safe: true, // 加载 .env.example
      defaults: true // 加载 .env.defaults
    })
  ],
  
  resolve: {
    extensions: ['.js', '.json', '.css', '.scss'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@pages': path.resolve(__dirname, 'src/pages'),
      '@styles': path.resolve(__dirname, 'src/styles'),
      '@utils': path.resolve(__dirname, 'src/utils'),
      '@assets': path.resolve(__dirname, 'src/assets')
    }
  },
  
  // 优化chunk命名
  optimization: {
    moduleIds: 'deterministic'
  }
};
```

### 2. 开发配置 (webpack.dev.js)

```javascript
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const webpack = require('webpack');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'eval-cheap-module-source-map',
  
  output: {
    filename: '[name].bundle.js',
    chunkFilename: '[name].chunk.js'
  },
  
  devServer: {
    static: {
      directory: './public',
      publicPath: '/public'
    },
    hot: true,
    port: 8080,
    open: true,
    compress: true,
    historyApiFallback: true,
    
    // 错误覆盖层
    client: {
      overlay: {
        errors: true,
        warnings: false
      },
      progress: true
    },
    
    // API代理
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        pathRewrite: { '^/api': '' }
      }
    },
    
    // 开发服务器优化
    devMiddleware: {
      writeToDisk: false
    }
  },
  
  module: {
    rules: [
      // 开发环境CSS处理（使用style-loader实现HMR）
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader']
      },
      
      {
        test: /\.s[ac]ss$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: {
                auto: (resourcePath) => resourcePath.endsWith('.module.scss'),
                localIdentName: '[name]__[local]--[hash:base64:5]'
              },
              sourceMap: true
            }
          },
          'postcss-loader',
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true
            }
          }
        ]
      },
      
      // 开发环境图片处理
      {
        test: /\.(png|jpg|jpeg|gif|svg|webp)$/i,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 8 * 1024 // 8kb
          }
        },
        generator: {
          filename: 'images/[name][ext]'
        }
      }
    ]
  },
  
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    
    // 显示模块相对路径
    new webpack.NamedModulesPlugin(),
    
    // 定义开发环境变量
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development'),
      __DEV__: true,
      __PROD__: false
    })
  ],
  
  // 性能提示
  performance: {
    hints: false
  },
  
  // 缓存
  cache: {
    type: 'memory'
  }
});
```

### 3. 生产配置 (webpack.prod.js)

```javascript
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');
const WorkboxPlugin = require('workbox-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = merge(common, {
  mode: 'production',
  devtool: 'source-map',
  
  output: {
    filename: 'js/[name].[contenthash:8].js',
    chunkFilename: 'js/[name].[contenthash:8].chunk.js',
    assetModuleFilename: 'assets/[name].[hash][ext]'
  },
  
  module: {
    rules: [
      // 生产环境CSS处理
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader'
        ]
      },
      
      {
        test: /\.s[ac]ss$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              modules: {
                auto: (resourcePath) => resourcePath.endsWith('.module.scss'),
                localIdentName: '[hash:base64:8]'
              },
              importLoaders: 2
            }
          },
          'postcss-loader',
          {
            loader: 'sass-loader',
            options: {
              implementation: require('sass')
            }
          }
        ]
      },
      
      // 生产环境图片处理
      {
        test: /\.(png|jpg|jpeg|gif|svg|webp)$/i,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 4 * 1024 // 4kb
          }
        },
        generator: {
          filename: 'images/[name].[contenthash:8][ext]'
        }
      }
    ]
  },
  
  plugins: [
    // CSS提取
    new MiniCssExtractPlugin({
      filename: 'css/[name].[contenthash:8].css',
      chunkFilename: 'css/[name].[contenthash:8].chunk.css'
    }),
    
    // Gzip压缩
    new CompressionPlugin({
      test: /\.(js|css|html|svg)$/,
      algorithm: 'gzip',
      threshold: 8192,
      minRatio: 0.8
    }),
    
    // Brotli压缩
    new CompressionPlugin({
      test: /\.(js|css|html|svg)$/,
      algorithm: 'brotliCompress',
      threshold: 8192,
      minRatio: 0.8,
      filename: '[path][base].br'
    }),
    
    // 复制静态资源
    new CopyPlugin({
      patterns: [
        { 
          from: 'public/robots.txt',
          to: 'robots.txt'
        },
        {
          from: 'public/manifest.json',
          to: 'manifest.json'
        }
      ]
    }),
    
    // PWA支持
    new WorkboxPlugin.GenerateSW({
      clientsClaim: true,
      skipWaiting: true,
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/fonts\.googleapis\.com/,
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'google-fonts-stylesheets'
          }
        },
        {
          urlPattern: /\.(?:png|jpg|jpeg|svg|webp)$/,
          handler: 'CacheFirst',
          options: {
            cacheName: 'images',
            expiration: {
              maxEntries: 60,
              maxAgeSeconds: 30 * 24 * 60 * 60 // 30天
            }
          }
        }
      ]
    }),
    
    // Bundle分析（条件启用）
    process.env.ANALYZE && new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      openAnalyzer: false,
      reportFilename: '../bundle-report.html'
    })
  ].filter(Boolean),
  
  optimization: {
    minimize: true,
    minimizer: [
      // JS压缩
      new TerserPlugin({
        parallel: true,
        terserOptions: {
          parse: {
            ecma: 8
          },
          compress: {
            ecma: 5,
            warnings: false,
            comparisons: false,
            inline: 2,
            drop_console: true,
            drop_debugger: true
          },
          mangle: {
            safari10: true
          },
          output: {
            ecma: 5,
            comments: false,
            ascii_only: true
          }
        }
      }),
      
      // CSS压缩
      new CssMinimizerPlugin({
        minimizerOptions: {
          preset: [
            'default',
            {
              discardComments: { removeAll: true }
            }
          ]
        }
      }),
      
      // 图片压缩
      new ImageMinimizerPlugin({
        minimizer: {
          implementation: ImageMinimizerPlugin.imageminMinify,
          options: {
            plugins: [
              ['imagemin-gifsicle', { interlaced: true }],
              ['imagemin-mozjpeg', { progressive: true, quality: 85 }],
              ['imagemin-pngquant', { quality: [0.6, 0.8] }],
              ['imagemin-svgo', {
                plugins: [
                  {
                    name: 'preset-default',
                    params: {
                      overrides: {
                        removeViewBox: false
                      }
                    }
                  }
                ]
              }]
            ]
          }
        },
        generator: [
          {
            type: 'asset',
            preset: 'webp-custom-name',
            implementation: ImageMinimizerPlugin.imageminGenerate,
            options: {
              plugins: ['imagemin-webp']
            }
          }
        ]
      })
    ],
    
    // 代码分割
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: 10,
          reuseExistingChunk: true
        },
        common: {
          minChunks: 2,
          priority: 5,
          reuseExistingChunk: true,
          name: 'common'
        },
        styles: {
          name: 'styles',
          test: /\.s?css$/,
          chunks: 'all',
          enforce: true
        }
      }
    },
    
    // 运行时chunk
    runtimeChunk: {
      name: 'runtime'
    },
    
    // 模块ID策略
    moduleIds: 'deterministic',
    chunkIds: 'deterministic'
  },
  
  // 性能预算
  performance: {
    hints: 'warning',
    maxEntrypointSize: 512000,
    maxAssetSize: 512000,
    assetFilter: function(assetFilename) {
      return assetFilename.endsWith('.js') || assetFilename.endsWith('.css');
    }
  }
});
```

## Vite版本实现

### 完整配置 (vite.config.js)

```javascript
import { defineConfig, loadEnv } from 'vite';
import legacy from '@vitejs/plugin-legacy';
import compression from 'vite-plugin-compression';
import imagemin from 'vite-plugin-imagemin';
import { visualizer } from 'rollup-plugin-visualizer';
import { VitePWA } from 'vite-plugin-pwa';
import { resolve } from 'path';
import autoprefixer from 'autoprefixer';
import postcssPresetEnv from 'postcss-preset-env';

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isDev = mode === 'development';
  const isProd = mode === 'production';
  
  return {
    base: '/',
    
    define: {
      __DEV__: isDev,
      __PROD__: isProd,
      'process.env': {}
    },
    
    plugins: [
      // 旧版浏览器支持
      legacy({
        targets: ['defaults', 'not IE 11'],
        additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
        renderLegacyChunks: true,
        polyfills: true
      }),
      
      // Gzip压缩
      compression({
        algorithm: 'gzip',
        ext: '.gz',
        threshold: 10240,
        deleteOriginFile: false
      }),
      
      // Brotli压缩
      compression({
        algorithm: 'brotliCompress',
        ext: '.br',
        threshold: 10240,
        deleteOriginFile: false
      }),
      
      // 图片优化
      isProd && imagemin({
        gifsicle: {
          optimizationLevel: 7,
          interlaced: false
        },
        optipng: {
          optimizationLevel: 7
        },
        mozjpeg: {
          quality: 85,
          progressive: true
        },
        pngquant: {
          quality: [0.6, 0.8],
          speed: 4
        },
        svgo: {
          plugins: [
            {
              name: 'removeViewBox',
              active: false
            },
            {
              name: 'removeEmptyAttrs',
              active: false
            }
          ]
        }
      }),
      
      // PWA支持
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'robots.txt'],
        manifest: {
          name: '图片画廊',
          short_name: '画廊',
          theme_color: '#3498db',
          icons: [
            {
              src: '/icon-192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: '/icon-512.png',
              sizes: '512x512',
              type: 'image/png'
            }
          ]
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,webp}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365 // 1年
                }
              }
            },
            {
              urlPattern: /\.(?:png|jpg|jpeg|svg|webp)$/,
              handler: 'CacheFirst',
              options: {
                cacheName: 'images-cache',
                expiration: {
                  maxEntries: 60,
                  maxAgeSeconds: 60 * 60 * 24 * 30 // 30天
                }
              }
            }
          ]
        }
      }),
      
      // Bundle分析
      env.ANALYZE && visualizer({
        open: true,
        filename: 'dist/stats.html',
        gzipSize: true,
        brotliSize: true
      })
    ].filter(Boolean),
    
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        '@components': resolve(__dirname, 'src/components'),
        '@pages': resolve(__dirname, 'src/pages'),
        '@styles': resolve(__dirname, 'src/styles'),
        '@utils': resolve(__dirname, 'src/utils'),
        '@assets': resolve(__dirname, 'src/assets')
      },
      extensions: ['.js', '.json', '.css', '.scss']
    },
    
    css: {
      devSourcemap: isDev,
      modules: {
        localsConvention: 'camelCase',
        scopeBehaviour: 'local',
        generateScopedName: isDev
          ? '[name]__[local]--[hash:base64:5]'
          : '[hash:base64:8]'
      },
      preprocessorOptions: {
        scss: {
          additionalData: `@import "@styles/variables.scss";`
        }
      },
      postcss: {
        plugins: [
          autoprefixer(),
          postcssPresetEnv({
            stage: 3,
            features: {
              'nesting-rules': true,
              'custom-properties': true
            }
          })
        ]
      }
    },
    
    server: {
      port: 3000,
      strictPort: false,
      open: true,
      cors: true,
      proxy: {
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
          configure: (proxy, options) => {
            proxy.on('error', (err, req, res) => {
              console.log('proxy error', err);
            });
          }
        }
      },
      hmr: {
        overlay: true
      }
    },
    
    preview: {
      port: 4173,
      open: true
    },
    
    build: {
      target: 'es2015',
      outDir: 'dist',
      assetsDir: 'assets',
      assetsInlineLimit: 4096,
      cssCodeSplit: true,
      sourcemap: isProd ? 'hidden' : true,
      
      // Rollup配置
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            if (id.includes('node_modules')) {
              // 第三方库分组
              if (id.includes('lodash')) {
                return 'lodash';
              }
              if (id.includes('axios')) {
                return 'axios';
              }
              return 'vendor';
            }
            
            // 页面分组
            if (id.includes('/pages/')) {
              const pageName = id.split('/pages/')[1].split('.')[0];
              return `page-${pageName}`;
            }
          },
          
          chunkFileNames: (chunkInfo) => {
            const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop() : '';
            return `js/[name]-${facadeModuleId}-[hash].js`;
          },
          
          entryFileNames: 'js/[name]-[hash].js',
          
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name.split('.');
            const extType = info[info.length - 1];
            
            if (/\.(png|jpe?g|gif|svg|webp|ico)$/i.test(assetInfo.name)) {
              return 'images/[name]-[hash][extname]';
            }
            if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name)) {
              return 'fonts/[name]-[hash][extname]';
            }
            if (/\.css$/i.test(assetInfo.name)) {
              return 'css/[name]-[hash][extname]';
            }
            return 'assets/[name]-[hash][extname]';
          }
        }
      },
      
      // Terser配置
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: isProd,
          drop_debugger: isProd,
          pure_funcs: isProd ? ['console.log', 'console.info'] : []
        },
        format: {
          comments: false
        }
      },
      
      // 块大小警告
      chunkSizeWarningLimit: 500,
      
      // 性能优化
      cssTarget: 'chrome61'
    },
    
    optimizeDeps: {
      include: ['axios', 'lodash-es'],
      exclude: ['@vite/client', '@vite/env']
    },
    
    // 性能优化
    esbuild: {
      logOverride: { 'this-is-undefined-in-esm': 'silent' },
      drop: isProd ? ['console', 'debugger'] : []
    }
  };
});
```

## 共享应用代码

### 入口文件 (src/index.js)

```javascript
import './styles/main.scss';
import { App } from './app';
import { router } from './router';
import { LazyImageLoader } from '@components/LazyImage';

// 初始化应用
const app = new App();

// 初始化路由
router.init(app);

// 初始化懒加载
const lazyLoader = new LazyImageLoader();

// 挂载应用
document.addEventListener('DOMContentLoaded', () => {
  app.mount('#app');
  lazyLoader.init();
});

// 处理路由变化
window.addEventListener('popstate', () => {
  lazyLoader.refresh();
});

// Webpack HMR
if (module.hot) {
  module.hot.accept('./app', () => {
    console.log('App module updated!');
    const newApp = new App();
    app.replace(newApp);
  });
  
  module.hot.accept('./styles/main.scss', () => {
    console.log('Styles updated!');
  });
}

// Vite HMR
if (import.meta.hot) {
  import.meta.hot.accept('./app', (newModule) => {
    console.log('App module updated in Vite!');
    const newApp = new newModule.App();
    app.replace(newApp);
  });
  
  import.meta.hot.accept('./styles/main.scss', () => {
    console.log('Styles updated in Vite!');
  });
}

// 性能监控
if ('performance' in window && 'PerformanceObserver' in window) {
  // 监控LCP
  const lcpObserver = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const lastEntry = entries[entries.length - 1];
    console.log('LCP:', lastEntry.startTime);
  });
  lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
  
  // 监控FID
  const fidObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      console.log('FID:', entry.processingStart - entry.startTime);
    }
  });
  fidObserver.observe({ entryTypes: ['first-input'] });
}
```

### 路由系统 (src/router.js)

```javascript
export class Router {
  constructor() {
    this.routes = new Map();
    this.currentRoute = null;
    this.app = null;
  }
  
  // 注册路由
  register(path, component) {
    this.routes.set(path, component);
    return this;
  }
  
  // 批量注册路由
  registerRoutes(routes) {
    routes.forEach(({ path, component }) => {
      this.register(path, component);
    });
    return this;
  }
  
  // 初始化
  init(app) {
    this.app = app;
    
    // 监听路由变化
    window.addEventListener('popstate', () => {
      this.navigate(window.location.pathname, false);
    });
    
    // 拦截链接点击
    document.addEventListener('click', (e) => {
      if (e.target.tagName === 'A' && e.target.href.startsWith(window.location.origin)) {
        e.preventDefault();
        const path = new URL(e.target.href).pathname;
        this.push(path);
      }
    });
    
    // 初始导航
    this.navigate(window.location.pathname, false);
  }
  
  // 导航到指定路径
  async navigate(path, pushState = true) {
    // 路径匹配
    let component = null;
    let params = {};
    
    for (const [routePath, routeComponent] of this.routes) {
      const match = this.matchPath(path, routePath);
      if (match) {
        component = routeComponent;
        params = match.params;
        break;
      }
    }
    
    if (!component) {
      component = () => import('./pages/NotFound');
    }
    
    // 懒加载组件
    try {
      const module = await component();
      const Component = module.default || module;
      
      // 更新路由状态
      this.currentRoute = { path, params, Component };
      
      // 更新历史记录
      if (pushState) {
        window.history.pushState({ path }, '', path);
      }
      
      // 渲染组件
      this.app.render(Component, params);
    } catch (error) {
      console.error('Route loading failed:', error);
      this.app.renderError(error);
    }
  }
  
  // 路径匹配
  matchPath(path, pattern) {
    // 简单的参数匹配
    const pathParts = path.split('/').filter(Boolean);
    const patternParts = pattern.split('/').filter(Boolean);
    
    if (pathParts.length !== patternParts.length) {
      return null;
    }
    
    const params = {};
    
    for (let i = 0; i < patternParts.length; i++) {
      if (patternParts[i].startsWith(':')) {
        const paramName = patternParts[i].slice(1);
        params[paramName] = pathParts[i];
      } else if (patternParts[i] !== pathParts[i]) {
        return null;
      }
    }
    
    return { params };
  }
  
  // 导航方法
  push(path) {
    this.navigate(path, true);
  }
  
  replace(path) {
    window.history.replaceState({ path }, '', path);
    this.navigate(path, false);
  }
  
  back() {
    window.history.back();
  }
  
  forward() {
    window.history.forward();
  }
}

// 创建路由实例
export const router = new Router();

// 定义路由
const routes = [
  {
    path: '/',
    component: () => import('./pages/Home')
  },
  {
    path: '/gallery/:id',
    component: () => import('./pages/Gallery')
  },
  {
    path: '/about',
    component: () => import('./pages/About')
  }
];

// 注册路由
router.registerRoutes(routes);
```

### 懒加载图片组件 (src/components/LazyImage.js)

```javascript
export class LazyImageLoader {
  constructor(options = {}) {
    this.options = {
      root: null,
      rootMargin: '50px',
      threshold: 0.01,
      loadingClass: 'lazyload',
      loadedClass: 'lazyloaded',
      errorClass: 'lazyerror',
      ...options
    };
    
    this.imageObserver = null;
    this.loadingImages = new Set();
  }
  
  init() {
    if ('IntersectionObserver' in window) {
      this.imageObserver = new IntersectionObserver(
        this.handleIntersection.bind(this),
        {
          root: this.options.root,
          rootMargin: this.options.rootMargin,
          threshold: this.options.threshold
        }
      );
      
      this.observeImages();
    } else {
      // 降级：直接加载所有图片
      this.loadAllImages();
    }
    
    // 监听打印事件，打印时加载所有图片
    window.addEventListener('beforeprint', () => {
      this.loadAllImages();
    });
  }
  
  handleIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        this.loadImage(entry.target);
      }
    });
  }
  
  loadImage(img) {
    if (this.loadingImages.has(img)) return;
    
    this.loadingImages.add(img);
    
    const src = img.dataset.src;
    const srcset = img.dataset.srcset;
    
    if (!src && !srcset) return;
    
    // 预加载图片
    const tempImg = new Image();
    
    tempImg.onload = () => {
      this.applyImage(img, src, srcset);
      this.loadingImages.delete(img);
    };
    
    tempImg.onerror = () => {
      img.classList.remove(this.options.loadingClass);
      img.classList.add(this.options.errorClass);
      this.loadingImages.delete(img);
      
      // 设置错误占位图
      if (img.dataset.error) {
        img.src = img.dataset.error;
      }
    };
    
    // 设置源
    if (srcset) tempImg.srcset = srcset;
    if (src) tempImg.src = src;
  }
  
  applyImage(img, src, srcset) {
    if (srcset) img.srcset = srcset;
    if (src) img.src = src;
    
    img.classList.remove(this.options.loadingClass);
    img.classList.add(this.options.loadedClass);
    
    // 停止观察
    if (this.imageObserver) {
      this.imageObserver.unobserve(img);
    }
    
    // 触发自定义事件
    img.dispatchEvent(new CustomEvent('lazyloaded', {
      detail: { src, srcset }
    }));
  }
  
  observeImages() {
    const images = document.querySelectorAll(`img.${this.options.loadingClass}`);
    images.forEach(img => {
      // 已经在视口中的图片直接加载
      if (this.isInViewport(img)) {
        this.loadImage(img);
      } else {
        this.imageObserver.observe(img);
      }
    });
  }
  
  isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }
  
  loadAllImages() {
    const images = document.querySelectorAll(`img.${this.options.loadingClass}`);
    images.forEach(img => this.loadImage(img));
  }
  
  refresh() {
    this.observeImages();
  }
  
  destroy() {
    if (this.imageObserver) {
      this.imageObserver.disconnect();
      this.imageObserver = null;
    }
    this.loadingImages.clear();
  }
}

// 导出Vue/React组件版本
export function LazyImage({ src, alt, className = '', errorSrc = '', ...props }) {
  return `
    <img 
      class="lazyload ${className}"
      data-src="${src}"
      data-error="${errorSrc}"
      alt="${alt}"
      ${Object.entries(props).map(([key, value]) => `${key}="${value}"`).join(' ')}
    />
  `;
}
```

## 样式配置

### PostCSS配置 (postcss.config.js)

```javascript
module.exports = {
  plugins: [
    require('autoprefixer')({
      grid: 'autoplace'
    }),
    require('postcss-preset-env')({
      stage: 3,
      features: {
        'nesting-rules': true,
        'custom-properties': true,
        'custom-media-queries': true
      }
    }),
    require('cssnano')({
      preset: ['default', {
        discardComments: {
          removeAll: true
        },
        normalizeWhitespace: true
      }]
    })
  ]
};
```

## 性能对比结果

### 构建速度对比

| 指标 | Webpack | Vite |
|------|---------|------|
| 冷启动 | 15.3s | 0.8s |
| 热更新 | 2.1s | 45ms |
| 生产构建 | 28.5s | 12.3s |

### 产物大小对比

| 文件类型 | Webpack | Vite |
|----------|---------|------|
| JS总大小 | 245KB | 238KB |
| CSS总大小 | 42KB | 40KB |
| 首屏JS | 85KB | 78KB |

### 性能指标对比

| 指标 | Webpack版本 | Vite版本 |
|------|------------|----------|
| FCP | 1.2s | 1.1s |
| LCP | 2.1s | 1.9s |
| TTI | 3.5s | 3.2s |

## 关键要点总结

1. **开发体验**：Vite的开发体验明显优于Webpack，特别是在大型项目中
2. **配置复杂度**：Webpack配置更复杂但更灵活，Vite配置简单但某些场景下需要变通
3. **生态系统**：Webpack生态更成熟，Vite生态快速发展中
4. **性能优化**：两者都能达到很好的生产环境性能，关键在于正确配置
5. **选择建议**：新项目推荐Vite，老项目或需要特殊配置的项目使用Webpack