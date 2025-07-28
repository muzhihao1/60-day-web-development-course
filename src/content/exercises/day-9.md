---
day: 9
title: "构建工具实战：创建多环境构建配置"
description: "通过实际项目对比Webpack和Vite，配置完整的开发和生产环境"
difficulty: "intermediate"
estimatedTime: 45
requirements:
  - "使用Webpack和Vite分别搭建相同的项目"
  - "配置CSS预处理器（Sass）和PostCSS"
  - "实现图片优化和压缩"
  - "配置开发服务器和代理"
  - "设置环境变量和不同环境配置"
  - "实现代码分割和懒加载"
  - "配置生产环境优化"
  - "对比两种工具的构建结果"
---

# Day 09 练习：构建工具实战

## 🎯 练习目标

通过创建一个实际的前端应用，深入理解Webpack和Vite的配置和使用。你将为同一个应用创建两套构建配置，并对比它们的差异。

## 📋 项目需求

### 应用功能

创建一个简单的图片画廊应用，包含以下功能：

1. **首页**
   - 显示图片网格
   - 支持图片懒加载
   - 响应式布局

2. **图片详情页**
   - 大图查看
   - 图片信息展示
   - 返回列表功能

3. **关于页面**
   - 应用介绍
   - 技术栈说明
   - 性能统计

### 技术要求

1. **样式处理**
   - 使用Sass编写样式
   - 配置PostCSS自动添加前缀
   - 支持CSS Modules
   - 提取独立CSS文件（生产环境）

2. **图片处理**
   - 小图片转base64
   - 大图片压缩优化
   - 支持WebP格式
   - 图片懒加载

3. **代码优化**
   - 代码分割
   - Tree Shaking
   - 路由懒加载
   - 公共库提取

4. **开发体验**
   - 热模块替换
   - Source Map
   - 错误提示优化
   - 自动打开浏览器

## 🏗️ 项目结构

```
build-tools-gallery/
├── webpack-version/
│   ├── src/
│   │   ├── index.js          # 入口文件
│   │   ├── router.js         # 路由配置
│   │   ├── pages/
│   │   │   ├── Home.js       # 首页
│   │   │   ├── Gallery.js    # 画廊页
│   │   │   └── About.js      # 关于页
│   │   ├── components/
│   │   │   ├── ImageCard.js  # 图片卡片
│   │   │   ├── LazyImage.js  # 懒加载图片
│   │   │   └── Header.js     # 页头
│   │   ├── styles/
│   │   │   ├── main.scss     # 主样式
│   │   │   ├── variables.scss # 变量
│   │   │   └── components/   # 组件样式
│   │   ├── assets/
│   │   │   └── images/       # 图片资源
│   │   └── utils/
│   │       └── image.js      # 图片处理工具
│   ├── public/
│   │   └── index.html
│   ├── webpack.common.js     # 公共配置
│   ├── webpack.dev.js        # 开发配置
│   ├── webpack.prod.js       # 生产配置
│   ├── .env
│   ├── .env.production
│   └── package.json
│
└── vite-version/
    ├── src/
    │   └── ... (相同结构)
    ├── public/
    ├── index.html
    ├── vite.config.js
    ├── .env
    ├── .env.production
    └── package.json
```

## 📝 实现步骤

### 第一步：创建项目基础结构

```bash
# 创建项目目录
mkdir build-tools-gallery
cd build-tools-gallery

# 创建两个版本的目录
mkdir webpack-version vite-version

# 复制基础文件结构到两个目录
# ... (创建上述目录结构)
```

### 第二步：Webpack版本配置

#### 1. 初始化项目

```bash
cd webpack-version
npm init -y

# 安装Webpack相关依赖
npm i -D webpack webpack-cli webpack-dev-server webpack-merge
npm i -D html-webpack-plugin clean-webpack-plugin copy-webpack-plugin
npm i -D mini-css-extract-plugin css-minimizer-webpack-plugin
npm i -D terser-webpack-plugin compression-webpack-plugin
npm i -D webpack-bundle-analyzer

# 安装加载器
npm i -D babel-loader @babel/core @babel/preset-env
npm i -D css-loader sass-loader sass postcss-loader postcss postcss-preset-env
npm i -D file-loader url-loader image-webpack-loader

# 安装工具库
npm i -D cross-env dotenv-webpack
```

#### 2. 创建Webpack配置

**webpack.common.js** - 公共配置：
```javascript
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const Dotenv = require('dotenv-webpack');

module.exports = {
  entry: './src/index.js',
  
  output: {
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/'
  },
  
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            cacheDirectory: true
          }
        }
      }
    ]
  },
  
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: './public/index.html',
      favicon: './public/favicon.ico'
    }),
    new Dotenv({
      systemvars: true
    })
  ],
  
  resolve: {
    extensions: ['.js', '.json'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@pages': path.resolve(__dirname, 'src/pages'),
      '@styles': path.resolve(__dirname, 'src/styles'),
      '@utils': path.resolve(__dirname, 'src/utils')
    }
  }
};
```

**webpack.dev.js** - 开发配置：
```javascript
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const webpack = require('webpack');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'eval-source-map',
  
  output: {
    filename: '[name].js'
  },
  
  devServer: {
    static: './dist',
    hot: true,
    port: 8080,
    open: true,
    historyApiFallback: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  },
  
  module: {
    rules: [
      {
        test: /\.s?css$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: {
                auto: true,
                localIdentName: '[name]__[local]--[hash:base64:5]'
              }
            }
          },
          'postcss-loader',
          'sass-loader'
        ]
      },
      {
        test: /\.(png|jpg|gif|svg|webp)$/,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 8 * 1024
          }
        }
      }
    ]
  },
  
  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ]
});
```

**webpack.prod.js** - 生产配置：
```javascript
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');

module.exports = merge(common, {
  mode: 'production',
  devtool: 'source-map',
  
  output: {
    filename: 'js/[name].[contenthash].js',
    chunkFilename: 'js/[name].[contenthash].chunk.js'
  },
  
  module: {
    rules: [
      {
        test: /\.s?css$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              modules: {
                auto: true,
                localIdentName: '[hash:base64:8]'
              }
            }
          },
          'postcss-loader',
          'sass-loader'
        ]
      },
      {
        test: /\.(png|jpg|gif|svg|webp)$/,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 4 * 1024
          }
        },
        generator: {
          filename: 'images/[name].[hash][ext]'
        }
      }
    ]
  },
  
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'css/[name].[contenthash].css',
      chunkFilename: 'css/[name].[contenthash].chunk.css'
    }),
    new CompressionPlugin({
      test: /\.(js|css|html|svg)$/,
      algorithm: 'gzip'
    }),
    process.env.ANALYZE && new BundleAnalyzerPlugin()
  ].filter(Boolean),
  
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true
          }
        }
      }),
      new CssMinimizerPlugin(),
      new ImageMinimizerPlugin({
        minimizer: {
          implementation: ImageMinimizerPlugin.imageminMinify,
          options: {
            plugins: [
              ['imagemin-gifsicle', { interlaced: true }],
              ['imagemin-mozjpeg', { progressive: true }],
              ['imagemin-pngquant', { quality: [0.6, 0.8] }],
              ['imagemin-svgo', { plugins: [{ name: 'preset-default' }] }]
            ]
          }
        }
      })
    ],
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
    runtimeChunk: 'single'
  }
});
```

### 第三步：Vite版本配置

#### 1. 初始化项目

```bash
cd ../vite-version
npm init -y

# 安装Vite相关依赖
npm i -D vite
npm i -D @vitejs/plugin-legacy
npm i -D vite-plugin-compression
npm i -D vite-plugin-imagemin
npm i -D rollup-plugin-visualizer

# 安装样式相关
npm i -D sass postcss autoprefixer
```

#### 2. 创建Vite配置

**vite.config.js**：
```javascript
import { defineConfig, loadEnv } from 'vite';
import legacy from '@vitejs/plugin-legacy';
import compression from 'vite-plugin-compression';
import imagemin from 'vite-plugin-imagemin';
import { visualizer } from 'rollup-plugin-visualizer';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  
  return {
    base: '/',
    
    plugins: [
      legacy({
        targets: ['defaults', 'not IE 11']
      }),
      compression({
        algorithm: 'gzip',
        ext: '.gz'
      }),
      imagemin({
        gifsicle: {
          optimizationLevel: 7,
          interlaced: false
        },
        optipng: {
          optimizationLevel: 7
        },
        mozjpeg: {
          quality: 80
        },
        pngquant: {
          quality: [0.6, 0.8],
          speed: 4
        },
        svgo: {
          plugins: [
            {
              name: 'removeViewBox'
            },
            {
              name: 'removeEmptyAttrs',
              active: false
            }
          ]
        }
      }),
      env.ANALYZE && visualizer({
        open: true,
        filename: 'dist/stats.html'
      })
    ].filter(Boolean),
    
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        '@components': resolve(__dirname, 'src/components'),
        '@pages': resolve(__dirname, 'src/pages'),
        '@styles': resolve(__dirname, 'src/styles'),
        '@utils': resolve(__dirname, 'src/utils')
      }
    },
    
    css: {
      modules: {
        localsConvention: 'camelCase'
      },
      preprocessorOptions: {
        scss: {
          additionalData: `@import "@styles/variables.scss";`
        }
      }
    },
    
    server: {
      port: 3000,
      open: true,
      proxy: {
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      }
    },
    
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            utils: ['lodash-es', 'axios']
          },
          chunkFileNames: 'js/[name]-[hash].js',
          entryFileNames: 'js/[name]-[hash].js',
          assetFileNames: ({ name }) => {
            if (/\.(gif|jpe?g|png|svg|webp)$/.test(name ?? '')) {
              return 'images/[name]-[hash][extname]';
            }
            if (/\.css$/.test(name ?? '')) {
              return 'css/[name]-[hash][extname]';
            }
            return 'assets/[name]-[hash][extname]';
          }
        }
      },
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true
        }
      }
    },
    
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom']
    }
  };
});
```

### 第四步：创建共享的应用代码

#### 1. 入口文件

```javascript
// src/index.js
import './styles/main.scss';
import { createApp } from './app';
import { router } from './router';

// 创建应用
const app = createApp();

// 初始化路由
router.init(app);

// 挂载应用
app.mount('#app');

// 热模块替换
if (module.hot) {
  module.hot.accept('./app', () => {
    console.log('App module updated!');
    app.update();
  });
}

// Vite HMR
if (import.meta.hot) {
  import.meta.hot.accept('./app', (newApp) => {
    console.log('App module updated in Vite!');
    app.update(newApp);
  });
}
```

#### 2. 路由配置

```javascript
// src/router.js
export const routes = [
  {
    path: '/',
    component: () => import('./pages/Home'),
    exact: true
  },
  {
    path: '/gallery/:id',
    component: () => import('./pages/Gallery'),
    exact: true
  },
  {
    path: '/about',
    component: () => import('./pages/About'),
    exact: true
  }
];

export const router = {
  init(app) {
    // 简单的路由实现
    window.addEventListener('popstate', () => {
      this.navigate(window.location.pathname);
    });
    
    // 初始导航
    this.navigate(window.location.pathname);
  },
  
  async navigate(path) {
    const route = routes.find(r => {
      if (r.exact) {
        return r.path === path;
      }
      return path.startsWith(r.path);
    });
    
    if (route) {
      const module = await route.component();
      const Component = module.default;
      const app = document.getElementById('app');
      app.innerHTML = Component();
    }
  },
  
  push(path) {
    window.history.pushState({}, '', path);
    this.navigate(path);
  }
};
```

#### 3. 页面组件

```javascript
// src/pages/Home.js
import { ImageCard } from '@components/ImageCard';
import { images } from '@utils/images';

export default function Home() {
  const imageCards = images.map(img => 
    ImageCard({
      id: img.id,
      src: img.thumbnail,
      title: img.title,
      onClick: () => router.push(`/gallery/${img.id}`)
    })
  ).join('');
  
  return `
    <div class="home">
      <h1>图片画廊</h1>
      <div class="image-grid">
        ${imageCards}
      </div>
    </div>
  `;
}

// src/components/ImageCard.js
import styles from './ImageCard.module.scss';

export function ImageCard({ id, src, title, onClick }) {
  return `
    <div class="${styles.imageCard}" data-id="${id}">
      <img 
        data-src="${src}" 
        alt="${title}"
        class="${styles.image} lazyload"
      >
      <h3 class="${styles.title}">${title}</h3>
    </div>
  `;
}

// src/components/LazyImage.js
export class LazyImageLoader {
  constructor() {
    this.imageObserver = null;
    this.init();
  }
  
  init() {
    if ('IntersectionObserver' in window) {
      this.imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.remove('lazyload');
            img.classList.add('lazyloaded');
            this.imageObserver.unobserve(img);
          }
        });
      });
      
      this.observeImages();
    } else {
      // 降级方案
      this.loadAllImages();
    }
  }
  
  observeImages() {
    const images = document.querySelectorAll('img.lazyload');
    images.forEach(img => this.imageObserver.observe(img));
  }
  
  loadAllImages() {
    const images = document.querySelectorAll('img.lazyload');
    images.forEach(img => {
      img.src = img.dataset.src;
      img.classList.remove('lazyload');
      img.classList.add('lazyloaded');
    });
  }
}
```

### 第五步：配置环境变量

**.env**:
```bash
# 开发环境变量
APP_TITLE=图片画廊
API_URL=http://localhost:3000/api
IMAGE_CDN=http://localhost:8080/images
```

**.env.production**:
```bash
# 生产环境变量
APP_TITLE=图片画廊
API_URL=https://api.example.com
IMAGE_CDN=https://cdn.example.com/images
```

### 第六步：样式配置

**postcss.config.js**:
```javascript
module.exports = {
  plugins: [
    require('autoprefixer'),
    require('postcss-preset-env')({
      stage: 3,
      features: {
        'nesting-rules': true
      }
    })
  ]
};
```

**src/styles/variables.scss**:
```scss
// 颜色变量
$primary-color: #3498db;
$secondary-color: #2ecc71;
$danger-color: #e74c3c;
$warning-color: #f39c12;
$gray-light: #ecf0f1;
$gray-dark: #34495e;

// 布局变量
$container-width: 1200px;
$grid-gap: 20px;
$header-height: 60px;

// 响应式断点
$breakpoint-mobile: 480px;
$breakpoint-tablet: 768px;
$breakpoint-desktop: 1024px;

// 动画
$transition-speed: 0.3s;
```

### 第七步：添加npm scripts

**package.json** (两个版本都需要):
```json
{
  "scripts": {
    "dev": "webpack serve --config webpack.dev.js",
    "build": "cross-env NODE_ENV=production webpack --config webpack.prod.js",
    "analyze": "cross-env ANALYZE=true npm run build",
    "preview": "serve -s dist"
  }
}
```

**package.json** (Vite版本):
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "analyze": "cross-env ANALYZE=true vite build"
  }
}
```

## 💡 实现提示

### 性能优化技巧

1. **图片优化**
   - 使用WebP格式（需要降级方案）
   - 响应式图片（srcset）
   - 图片懒加载
   - 适当的压缩率

2. **代码分割**
   - 路由级别的代码分割
   - 第三方库单独打包
   - 按需加载组件

3. **缓存策略**
   - 使用contenthash
   - 长期缓存静态资源
   - Service Worker缓存

4. **构建优化**
   - Tree Shaking
   - Scope Hoisting
   - 压缩代码和资源
   - 移除console.log

### 测试要点

1. **开发环境测试**
   - HMR是否正常工作
   - 代理是否正确转发
   - Source Map是否可用
   - 错误提示是否清晰

2. **生产构建测试**
   - 文件是否正确压缩
   - 路径是否正确
   - 懒加载是否生效
   - 性能是否达标

3. **对比测试**
   - 构建速度对比
   - 产物大小对比
   - 首屏加载时间
   - 运行性能对比

## 🔍 评估标准

### 基础要求（60分）

- [ ] 两个版本都能正常运行
- [ ] 实现所有页面功能
- [ ] 样式正确显示
- [ ] 图片正常加载

### 进阶要求（30分）

- [ ] 实现代码分割
- [ ] 配置环境变量
- [ ] 图片优化处理
- [ ] 生产构建优化

### 加分项（10分）

- [ ] PWA支持
- [ ] 构建分析报告
- [ ] 性能监控
- [ ] CI/CD配置

## 🎯 挑战任务

### 挑战1：实现构建缓存

配置持久化缓存，加速二次构建：
- Webpack使用cache配置
- Vite默认支持

### 挑战2：实现多页应用

将单页应用改造为多页应用：
- 多个入口点
- 共享代码提取
- 独立的HTML模板

### 挑战3：集成TypeScript

添加TypeScript支持：
- 配置类型检查
- 添加类型定义
- 保持构建性能

## 📊 交付要求

完成练习后，你应该有：

1. **两个完整的项目**
   - Webpack版本
   - Vite版本
   - 相同的功能实现

2. **配置文件**
   - 完善的构建配置
   - 环境变量配置
   - 优化配置

3. **性能报告**
   - 构建时间对比
   - 产物大小对比
   - 加载性能对比

4. **文档说明**
   - 配置说明
   - 使用指南
   - 优化建议

## 🚀 提交方式

1. 创建GitHub仓库
2. 分别提交两个版本
3. 添加README对比说明
4. 提供在线演示链接

## 📚 参考资源

- [Webpack配置最佳实践](https://webpack.js.org/guides/production/)
- [Vite配置指南](https://cn.vitejs.dev/config/)
- [图片优化指南](https://web.dev/fast/#optimize-your-images)
- [代码分割策略](https://web.dev/code-splitting-libraries/)

记住：构建工具的目标是提高开发效率和应用性能。选择合适的工具和配置比追求完美配置更重要！