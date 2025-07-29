---
title: "模块打包与优化"
description: "学习和掌握模块打包与优化的实际应用"
category: "tips"
language: "javascript"
---

# 模块打包与优化

## Webpack配置最佳实践

```javascript
// webpack.config.js - 生产环境优化配置
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  
  return {
    entry: {
      main: './src/index.js',
      // 多入口点
      admin: './src/admin.js'
    },
    
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: isProduction 
        ? '[name].[contenthash].js'
        : '[name].js',
      clean: true,
      // 动态导入的chunk命名
      chunkFilename: isProduction
        ? 'chunks/[name].[contenthash].js'
        : 'chunks/[name].js'
    },
    
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                ['@babel/preset-env', {
                  // 按需引入polyfill
                  useBuiltIns: 'usage',
                  corejs: 3,
                  // 指定目标浏览器
                  targets: {
                    browsers: ['> 1%', 'last 2 versions', 'not dead']
                  }
                }]
              ],
              plugins: [
                // 动态导入语法支持
                '@babel/plugin-syntax-dynamic-import',
                // 装饰器支持
                ['@babel/plugin-proposal-decorators', { legacy: true }],
                // 类属性支持
                '@babel/plugin-proposal-class-properties'
              ],
              // 缓存编译结果
              cacheDirectory: true
            }
          }
        },
        {
          test: /\.css$/,
          use: [
            isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
            'css-loader',
            {
              loader: 'postcss-loader',
              options: {
                postcssOptions: {
                  plugins: [
                    'postcss-preset-env',
                    'autoprefixer'
                  ]
                }
              }
            }
          ]
        },
        {
          test: /\.(png|svg|jpg|jpeg|gif)$/i,
          type: 'asset',
          parser: {
            dataUrlCondition: {
              maxSize: 8 * 1024 // 8kb以下转base64
            }
          },
          generator: {
            filename: 'images/[name].[hash][ext]'
          }
        }
      ]
    },
    
    plugins: [
      new HtmlWebpackPlugin({
        template: './src/index.html',
        chunks: ['main'],
        minify: isProduction
      }),
      
      new HtmlWebpackPlugin({
        template: './src/admin.html',
        filename: 'admin.html',
        chunks: ['admin']
      }),
      
      ...(isProduction ? [
        new MiniCssExtractPlugin({
          filename: 'styles/[name].[contenthash].css',
          chunkFilename: 'styles/[id].[contenthash].css'
        }),
        
        // 定义生产环境变量
        new webpack.DefinePlugin({
          'process.env.NODE_ENV': JSON.stringify('production')
        }),
        
        // 分析bundle大小
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          openAnalyzer: false,
          reportFilename: 'bundle-report.html'
        })
      ] : []),
      
      // 进度条
      new webpack.ProgressPlugin()
    ],
    
    optimization: {
      minimize: isProduction,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            compress: {
              drop_console: true,
              drop_debugger: true
            },
            format: {
              comments: false
            }
          },
          extractComments: false
        }),
        new CssMinimizerPlugin()
      ],
      
      // 代码分割
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          // 提取公共依赖
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendor',
            priority: 10,
            reuseExistingChunk: true
          },
          // 提取公共模块
          common: {
            minChunks: 2,
            priority: 5,
            reuseExistingChunk: true
          },
          // 样式文件
          styles: {
            name: 'styles',
            type: 'css/mini-extract',
            chunks: 'all',
            enforce: true
          }
        }
      },
      
      // 运行时代码单独打包
      runtimeChunk: 'single',
      
      // 模块ID固定（长期缓存）
      moduleIds: 'deterministic'
    },
    
    // 解析配置
    resolve: {
      extensions: ['.js', '.json'],
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '@components': path.resolve(__dirname, 'src/components'),
        '@utils': path.resolve(__dirname, 'src/utils'),
        '@services': path.resolve(__dirname, 'src/services')
      }
    },
    
    // 开发服务器
    devServer: {
      static: './dist',
      hot: true,
      open: true,
      port: 3000,
      // 代理API请求
      proxy: {
        '/api': {
          target: 'http://localhost:8080',
          changeOrigin: true
        }
      }
    },
    
    // 性能提示
    performance: {
      hints: isProduction ? 'warning' : false,
      maxEntrypointSize: 512000,
      maxAssetSize: 512000
    }
  };
};
```

## Rollup库打包配置

```javascript
// rollup.config.js - 适合打包JavaScript库
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import { terser } from 'rollup-plugin-terser';
import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';
import pkg from './package.json';

const input = 'src/index.ts';
const external = [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {})
];

export default [
  // ES Module构建
  {
    input,
    external,
    plugins: [
      nodeResolve(),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false
      }),
      babel({
        babelHelpers: 'bundled',
        exclude: 'node_modules/**'
      })
    ],
    output: {
      file: pkg.module,
      format: 'es',
      sourcemap: true
    }
  },
  
  // CommonJS构建
  {
    input,
    external,
    plugins: [
      nodeResolve(),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false
      }),
      babel({
        babelHelpers: 'bundled',
        exclude: 'node_modules/**'
      })
    ],
    output: {
      file: pkg.main,
      format: 'cjs',
      sourcemap: true,
      exports: 'named'
    }
  },
  
  // UMD构建（用于浏览器）
  {
    input,
    external: Object.keys(pkg.peerDependencies || {}),
    plugins: [
      nodeResolve({
        browser: true
      }),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false
      }),
      babel({
        babelHelpers: 'bundled',
        exclude: 'node_modules/**',
        presets: [
          ['@babel/preset-env', {
            targets: '> 0.25%, not dead'
          }]
        ]
      }),
      terser()
    ],
    output: {
      file: pkg.unpkg,
      format: 'umd',
      name: 'MyLibrary',
      sourcemap: true,
      globals: {
        react: 'React',
        'react-dom': 'ReactDOM'
      }
    }
  },
  
  // TypeScript声明文件
  {
    input,
    plugins: [dts()],
    output: {
      file: pkg.types,
      format: 'es'
    }
  }
];
```

## Vite现代化配置

```javascript
// vite.config.js - 下一代前端构建工具
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import viteCompression from 'vite-plugin-compression';
import legacy from '@vitejs/plugin-legacy';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ command, mode }) => {
  return {
    plugins: [
      react(),
      
      // PWA支持
      VitePWA({
        registerType: 'autoUpdate',
        manifest: {
          name: 'My App',
          short_name: 'MyApp',
          theme_color: '#ffffff',
          icons: [
            {
              src: '/icon-192.png',
              sizes: '192x192',
              type: 'image/png'
            }
          ]
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg}']
        }
      }),
      
      // 兼容旧浏览器
      legacy({
        targets: ['defaults', 'not IE 11']
      }),
      
      // gzip压缩
      viteCompression({
        verbose: true,
        disable: false,
        threshold: 10240,
        algorithm: 'gzip',
        ext: '.gz'
      }),
      
      // Bundle分析
      mode === 'analyze' && visualizer({
        open: true,
        gzipSize: true,
        brotliSize: true
      })
    ],
    
    resolve: {
      alias: {
        '@': '/src',
        '@components': '/src/components',
        '@utils': '/src/utils'
      }
    },
    
    css: {
      modules: {
        localsConvention: 'camelCase'
      },
      preprocessorOptions: {
        scss: {
          additionalData: `@import "@/styles/variables.scss";`
        }
      }
    },
    
    build: {
      target: 'es2015',
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: command === 'serve',
      
      rollupOptions: {
        output: {
          manualChunks: {
            // React相关
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            // 工具库
            'lodash': ['lodash-es'],
            // UI库
            'ui': ['antd', '@ant-design/icons']
          },
          // 资源文件命名
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name.split('.');
            const ext = info[info.length - 1];
            if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
              return `assets/images/[name]-[hash][extname]`;
            } else if (/woff|woff2|eot|ttf|otf/i.test(ext)) {
              return `assets/fonts/[name]-[hash][extname]`;
            }
            return `assets/[name]-[hash][extname]`;
          },
          chunkFileNames: 'js/[name]-[hash].js',
          entryFileNames: 'js/[name]-[hash].js'
        }
      },
      
      // 压缩配置
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true
        }
      }
    },
    
    server: {
      port: 3000,
      open: true,
      cors: true,
      proxy: {
        '/api': {
          target: 'http://localhost:8080',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      }
    },
    
    optimizeDeps: {
      include: ['react', 'react-dom'],
      exclude: ['@vueuse/core']
    }
  };
});
```

## 模块懒加载策略

```javascript
// lazy-loading-strategies.js
// 1. 路由级别懒加载
const routes = [
  {
    path: '/',
    component: () => import(
      /* webpackChunkName: "home" */
      /* webpackPrefetch: true */
      './pages/Home'
    )
  },
  {
    path: '/about',
    component: () => import(
      /* webpackChunkName: "about" */
      './pages/About'
    )
  },
  {
    path: '/user/:id',
    component: () => import(
      /* webpackChunkName: "user" */
      './pages/User'
    )
  }
];

// 2. 组件级别懒加载
import { lazy, Suspense } from 'react';

// 带错误边界的懒加载组件
function LazyBoundary({ path, fallback = 'Loading...' }) {
  const Component = lazy(() => import(path));
  
  return (
    <ErrorBoundary>
      <Suspense fallback={<div>{fallback}</div>}>
        <Component />
      </Suspense>
    </ErrorBoundary>
  );
}

// 3. 条件懒加载
class ConditionalLoader {
  constructor() {
    this.modules = new Map();
  }
  
  async load(condition, modulePath) {
    if (!condition) return null;
    
    if (this.modules.has(modulePath)) {
      return this.modules.get(modulePath);
    }
    
    const module = await import(modulePath);
    this.modules.set(modulePath, module);
    return module;
  }
}

// 4. 预加载策略
class PreloadManager {
  constructor() {
    this.preloaded = new Set();
  }
  
  // 基于路由预加载
  preloadRoute(path) {
    if (this.preloaded.has(path)) return;
    
    const route = routes.find(r => r.path === path);
    if (route && typeof route.component === 'function') {
      route.component();
      this.preloaded.add(path);
    }
  }
  
  // 基于用户行为预加载
  setupInteractionPreload() {
    document.addEventListener('mouseover', (e) => {
      const link = e.target.closest('a[href]');
      if (link) {
        const path = new URL(link.href).pathname;
        this.preloadRoute(path);
      }
    });
  }
  
  // 空闲时预加载
  preloadOnIdle(modules) {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        modules.forEach(module => import(module));
      });
    } else {
      setTimeout(() => {
        modules.forEach(module => import(module));
      }, 2000);
    }
  }
}

// 5. 渐进式加载
class ProgressiveLoader {
  async loadWithProgress(modules, onProgress) {
    const total = modules.length;
    let loaded = 0;
    
    const results = await Promise.all(
      modules.map(async (module) => {
        const result = await import(module);
        loaded++;
        onProgress(loaded / total * 100);
        return result;
      })
    );
    
    return results;
  }
}

// 6. 资源提示
// 在HTML中添加
// <link rel="preload" href="/js/critical.js" as="script">
// <link rel="prefetch" href="/js/secondary.js" as="script">
// <link rel="preconnect" href="https://api.example.com">
// <link rel="dns-prefetch" href="https://cdn.example.com">

// 动态添加资源提示
function addResourceHint(href, rel = 'prefetch', as = 'script') {
  const link = document.createElement('link');
  link.rel = rel;
  link.href = href;
  if (as) link.as = as;
  document.head.appendChild(link);
}
```

## Tree Shaking优化

```javascript
// utils/index.js - 支持tree shaking的工具库
// ✅ 好的做法：使用ES6模块和具名导出
export { formatDate } from './date';
export { debounce, throttle } from './function';
export { deepClone } from './object';

// ❌ 避免的做法：使用CommonJS或默认导出对象
// module.exports = {
//   formatDate: require('./date').formatDate,
//   debounce: require('./function').debounce
// };

// date.js
export function formatDate(date, format) {
  // 实现
}

// 标记纯函数（帮助webpack识别副作用）
/*#__PURE__*/ 
export function pureFunction() {
  return 'result';
}

// package.json中标记无副作用
{
  "name": "my-utils",
  "sideEffects": false,
  // 或者指定有副作用的文件
  "sideEffects": [
    "*.css",
    "*.scss",
    "./src/polyfills.js"
  ]
}

// 使用时按需导入
import { formatDate } from 'my-utils'; // ✅ 只打包formatDate
// import * as utils from 'my-utils'; // ❌ 可能打包整个库
```