---
title: "构建工具配置"
description: "学习和掌握构建工具配置的实际应用"
category: "tools"
language: "javascript"
---

# 构建工具配置

## 现代Webpack配置

```javascript
// webpack.config.js - 完整的生产级配置
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const CopyPlugin = require('copy-webpack-plugin');
const WorkboxPlugin = require('workbox-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');

const isDevelopment = process.env.NODE_ENV !== 'production';

module.exports = {
    mode: isDevelopment ? 'development' : 'production',
    
    entry: {
        main: './src/index.js',
        // 多入口配置
        vendor: ['react', 'react-dom', 'react-router-dom']
    },
    
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: isDevelopment 
            ? '[name].bundle.js' 
            : '[name].[contenthash:8].bundle.js',
        chunkFilename: isDevelopment 
            ? '[name].chunk.js' 
            : '[name].[contenthash:8].chunk.js',
        publicPath: '/',
        clean: true, // 清理输出目录
        
        // 资源模块输出
        assetModuleFilename: 'assets/[hash][ext][query]'
    },
    
    module: {
        rules: [
            // JavaScript/TypeScript
            {
                test: /\.(js|jsx|ts|tsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            ['@babel/preset-env', {
                                targets: {
                                    browsers: ['> 1%', 'last 2 versions']
                                },
                                useBuiltIns: 'usage',
                                corejs: 3
                            }],
                            '@babel/preset-react',
                            '@babel/preset-typescript'
                        ],
                        plugins: [
                            '@babel/plugin-proposal-class-properties',
                            isDevelopment && 'react-refresh/babel'
                        ].filter(Boolean),
                        cacheDirectory: true
                    }
                }
            },
            
            // CSS/SASS
            {
                test: /\.(css|scss|sass)$/,
                use: [
                    isDevelopment 
                        ? 'style-loader' 
                        : MiniCssExtractPlugin.loader,
                    {
                        loader: 'css-loader',
                        options: {
                            sourceMap: isDevelopment,
                            modules: {
                                auto: true,
                                localIdentName: isDevelopment
                                    ? '[path][name]__[local]--[hash:base64:5]'
                                    : '[hash:base64:8]'
                            }
                        }
                    },
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
                    },
                    'sass-loader'
                ]
            },
            
            // 图片资源
            {
                test: /\.(png|jpg|jpeg|gif|webp|avif)$/i,
                type: 'asset',
                parser: {
                    dataUrlCondition: {
                        maxSize: 8 * 1024 // 8kb
                    }
                },
                generator: {
                    filename: 'images/[name].[hash:8][ext]'
                }
            },
            
            // 字体资源
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/i,
                type: 'asset/resource',
                generator: {
                    filename: 'fonts/[name].[hash:8][ext]'
                }
            },
            
            // SVG处理
            {
                test: /\.svg$/,
                use: ['@svgr/webpack', 'url-loader']
            }
        ]
    },
    
    plugins: [
        // HTML生成
        new HtmlWebpackPlugin({
            template: './public/index.html',
            favicon: './public/favicon.ico',
            minify: !isDevelopment && {
                removeComments: true,
                collapseWhitespace: true,
                removeRedundantAttributes: true,
                useShortDoctype: true,
                removeEmptyAttributes: true,
                removeStyleLinkTypeAttributes: true,
                keepClosingSlash: true,
                minifyJS: true,
                minifyCSS: true,
                minifyURLs: true
            }
        }),
        
        // CSS提取
        !isDevelopment && new MiniCssExtractPlugin({
            filename: 'css/[name].[contenthash:8].css',
            chunkFilename: 'css/[name].[contenthash:8].chunk.css'
        }),
        
        // 环境变量
        new webpack.DefinePlugin({
            'process.env': JSON.stringify(process.env)
        }),
        
        // 复制静态资源
        new CopyPlugin({
            patterns: [
                {
                    from: 'public',
                    to: '',
                    globOptions: {
                        ignore: ['**/index.html']
                    }
                }
            ]
        }),
        
        // 进度显示
        new webpack.ProgressPlugin(),
        
        // Bundle分析
        process.env.ANALYZE && new BundleAnalyzerPlugin(),
        
        // PWA支持
        !isDevelopment && new WorkboxPlugin.GenerateSW({
            clientsClaim: true,
            skipWaiting: true,
            runtimeCaching: [{
                urlPattern: /^https:\/\/api\./,
                handler: 'NetworkFirst',
                options: {
                    cacheName: 'api-cache',
                    expiration: {
                        maxEntries: 50,
                        maxAgeSeconds: 300 // 5分钟
                    }
                }
            }]
        }),
        
        // Gzip压缩
        !isDevelopment && new CompressionPlugin({
            algorithm: 'gzip',
            test: /\.(js|css|html|svg)$/,
            threshold: 8192,
            minRatio: 0.8
        })
    ].filter(Boolean),
    
    optimization: {
        minimize: !isDevelopment,
        minimizer: [
            // JS压缩
            new TerserPlugin({
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
                },
                parallel: true
            }),
            
            // CSS压缩
            new CssMinimizerPlugin()
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
                    reuseExistingChunk: true
                }
            }
        },
        
        // 运行时chunk
        runtimeChunk: 'single',
        
        // 模块ID
        moduleIds: 'deterministic'
    },
    
    resolve: {
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
        alias: {
            '@': path.resolve(__dirname, 'src'),
            '@components': path.resolve(__dirname, 'src/components'),
            '@utils': path.resolve(__dirname, 'src/utils'),
            '@assets': path.resolve(__dirname, 'src/assets')
        }
    },
    
    devServer: {
        static: {
            directory: path.join(__dirname, 'public')
        },
        historyApiFallback: true,
        hot: true,
        port: 3000,
        open: true,
        compress: true,
        
        // 代理配置
        proxy: {
            '/api': {
                target: 'http://localhost:5000',
                changeOrigin: true,
                pathRewrite: { '^/api': '' }
            }
        },
        
        // 错误覆盖
        client: {
            overlay: {
                errors: true,
                warnings: false
            }
        }
    },
    
    // 性能提示
    performance: {
        hints: !isDevelopment && 'warning',
        maxEntrypointSize: 512000,
        maxAssetSize: 512000
    },
    
    // Source Map
    devtool: isDevelopment 
        ? 'eval-cheap-module-source-map' 
        : 'source-map'
};
```

## Vite高级配置

```javascript
// vite.config.ts - TypeScript配置
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import legacy from '@vitejs/plugin-legacy';
import { VitePWA } from 'vite-plugin-pwa';
import viteCompression from 'vite-plugin-compression';
import visualizer from 'rollup-plugin-visualizer';
import { createHtmlPlugin } from 'vite-plugin-html';
import viteImagemin from 'vite-plugin-imagemin';
import path from 'path';

export default defineConfig(({ command, mode }) => {
    // 加载环境变量
    const env = loadEnv(mode, process.cwd(), '');
    
    return {
        // 基础路径
        base: env.VITE_PUBLIC_PATH || '/',
        
        // 插件配置
        plugins: [
            // React支持
            react({
                fastRefresh: true,
                // Babel配置
                babel: {
                    plugins: [
                        ['@babel/plugin-proposal-decorators', { legacy: true }],
                        '@babel/plugin-proposal-class-properties'
                    ]
                }
            }),
            
            // 旧浏览器兼容
            legacy({
                targets: ['defaults', 'not IE 11']
            }),
            
            // PWA支持
            VitePWA({
                registerType: 'autoUpdate',
                includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
                manifest: {
                    name: 'My App',
                    short_name: 'MyApp',
                    theme_color: '#ffffff',
                    icons: [
                        {
                            src: '/android-chrome-192x192.png',
                            sizes: '192x192',
                            type: 'image/png'
                        },
                        {
                            src: '/android-chrome-512x512.png',
                            sizes: '512x512',
                            type: 'image/png'
                        }
                    ]
                },
                workbox: {
                    globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,webp}'],
                    runtimeCaching: [
                        {
                            urlPattern: /^https:\/\/api\./,
                            handler: 'NetworkFirst',
                            options: {
                                cacheName: 'api-cache',
                                expiration: {
                                    maxEntries: 50,
                                    maxAgeSeconds: 300
                                }
                            }
                        }
                    ]
                }
            }),
            
            // Gzip压缩
            viteCompression({
                verbose: true,
                disable: false,
                threshold: 10240,
                algorithm: 'gzip',
                ext: '.gz'
            }),
            
            // Brotli压缩
            viteCompression({
                verbose: true,
                disable: false,
                threshold: 10240,
                algorithm: 'brotliCompress',
                ext: '.br'
            }),
            
            // HTML处理
            createHtmlPlugin({
                minify: true,
                inject: {
                    data: {
                        title: env.VITE_APP_TITLE,
                        injectScript: `<script src="./inject.js"></script>`
                    }
                }
            }),
            
            // 图片优化
            viteImagemin({
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
                    quality: [0.8, 0.9],
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
            
            // Bundle分析
            visualizer({
                open: true,
                gzipSize: true,
                brotliSize: true
            })
        ],
        
        // 解析配置
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src'),
                '@components': path.resolve(__dirname, './src/components'),
                '@utils': path.resolve(__dirname, './src/utils'),
                '@assets': path.resolve(__dirname, './src/assets'),
                '@hooks': path.resolve(__dirname, './src/hooks'),
                '@services': path.resolve(__dirname, './src/services')
            },
            extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json']
        },
        
        // CSS配置
        css: {
            preprocessorOptions: {
                scss: {
                    additionalData: `@import "@/styles/variables.scss";`
                },
                less: {
                    javascriptEnabled: true,
                    modifyVars: {
                        '@primary-color': '#1890ff'
                    }
                }
            },
            modules: {
                localsConvention: 'camelCase'
            },
            postcss: {
                plugins: [
                    require('postcss-preset-env')({
                        autoprefixer: {
                            flexbox: 'no-2009'
                        },
                        stage: 3
                    })
                ]
            }
        },
        
        // 服务器配置
        server: {
            host: true,
            port: Number(env.VITE_PORT) || 3000,
            open: true,
            cors: true,
            
            // 代理配置
            proxy: {
                '/api': {
                    target: env.VITE_API_URL || 'http://localhost:5000',
                    changeOrigin: true,
                    rewrite: (path) => path.replace(/^\/api/, ''),
                    
                    // WebSocket代理
                    ws: true
                },
                '/socket.io': {
                    target: env.VITE_WS_URL || 'http://localhost:5000',
                    ws: true
                }
            },
            
            // HTTPS配置
            https: {
                cert: './cert.pem',
                key: './key.pem'
            },
            
            // HMR配置
            hmr: {
                overlay: true
            }
        },
        
        // 构建配置
        build: {
            target: 'es2015',
            outDir: 'dist',
            assetsDir: 'assets',
            sourcemap: command === 'serve',
            
            // Rollup配置
            rollupOptions: {
                input: {
                    main: path.resolve(__dirname, 'index.html'),
                    // 多页面应用
                    admin: path.resolve(__dirname, 'admin.html')
                },
                output: {
                    chunkFileNames: 'js/[name]-[hash].js',
                    entryFileNames: 'js/[name]-[hash].js',
                    assetFileNames: ({ name }) => {
                        if (/\.(gif|jpe?g|png|svg)$/.test(name ?? '')) {
                            return 'images/[name]-[hash][extname]';
                        }
                        if (/\.css$/.test(name ?? '')) {
                            return 'css/[name]-[hash][extname]';
                        }
                        return 'assets/[name]-[hash][extname]';
                    },
                    manualChunks: {
                        'react-vendor': ['react', 'react-dom', 'react-router-dom'],
                        'ui-vendor': ['antd', '@ant-design/icons'],
                        'utils': ['lodash-es', 'dayjs', 'axios']
                    }
                }
            },
            
            // 压缩配置
            minify: 'terser',
            terserOptions: {
                compress: {
                    drop_console: true,
                    drop_debugger: true
                }
            },
            
            // 块大小警告
            chunkSizeWarningLimit: 1500,
            
            // CSS代码分割
            cssCodeSplit: true,
            
            // 资源内联限制
            assetsInlineLimit: 4096
        },
        
        // 预构建依赖
        optimizeDeps: {
            include: [
                'react',
                'react-dom',
                'react-router-dom',
                'axios',
                'lodash-es'
            ],
            exclude: ['@vicons/ionicons5']
        },
        
        // 环境变量前缀
        envPrefix: 'VITE_',
        
        // 日志级别
        logLevel: 'info',
        
        // 清屏
        clearScreen: true
    };
});
```

## Rollup库打包配置

```javascript
// rollup.config.js - 多格式输出配置
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import babel from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';
import json from '@rollup/plugin-json';
import replace from '@rollup/plugin-replace';
import alias from '@rollup/plugin-alias';
import { visualizer } from 'rollup-plugin-visualizer';
import dts from 'rollup-plugin-dts';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import postcss from 'rollup-plugin-postcss';
import image from '@rollup/plugin-image';
import copy from 'rollup-plugin-copy';
import del from 'rollup-plugin-delete';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pkg = require('./package.json');
const isProd = process.env.NODE_ENV === 'production';

// 基础插件配置
const basePlugins = [
    // 清理输出目录
    del({ targets: 'dist/*' }),
    
    // 外部依赖
    peerDepsExternal(),
    
    // 路径别名
    alias({
        entries: [
            { find: '@', replacement: path.resolve(__dirname, 'src') },
            { find: '@utils', replacement: path.resolve(__dirname, 'src/utils') },
            { find: '@components', replacement: path.resolve(__dirname, 'src/components') }
        ]
    }),
    
    // Node模块解析
    resolve({
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
        preferBuiltins: true,
        browser: true
    }),
    
    // CommonJS转换
    commonjs({
        include: /node_modules/
    }),
    
    // JSON支持
    json(),
    
    // 图片处理
    image(),
    
    // CSS处理
    postcss({
        extract: true,
        minimize: isProd,
        modules: true,
        use: ['sass'],
        plugins: [
            require('autoprefixer'),
            require('postcss-preset-env')()
        ]
    }),
    
    // TypeScript编译
    typescript({
        tsconfig: './tsconfig.json',
        declaration: true,
        declarationDir: './dist/types',
        exclude: ['**/__tests__/**', '**/*.test.ts', '**/*.spec.ts']
    }),
    
    // Babel转换
    babel({
        babelHelpers: 'bundled',
        exclude: 'node_modules/**',
        presets: [
            ['@babel/preset-env', {
                targets: {
                    browsers: ['> 1%', 'last 2 versions', 'not dead']
                }
            }],
            '@babel/preset-react'
        ],
        plugins: [
            '@babel/plugin-proposal-class-properties',
            '@babel/plugin-proposal-optional-chaining',
            '@babel/plugin-proposal-nullish-coalescing-operator'
        ]
    }),
    
    // 环境变量替换
    replace({
        preventAssignment: true,
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
        __VERSION__: JSON.stringify(pkg.version)
    }),
    
    // 复制静态资源
    copy({
        targets: [
            { src: 'src/assets/*', dest: 'dist/assets' },
            { src: 'README.md', dest: 'dist' },
            { src: 'LICENSE', dest: 'dist' }
        ]
    })
];

// 主构建配置
const mainConfig = {
    input: 'src/index.ts',
    
    external: [
        ...Object.keys(pkg.dependencies || {}),
        ...Object.keys(pkg.peerDependencies || {})
    ],
    
    plugins: [
        ...basePlugins,
        
        // 生产环境压缩
        isProd && terser({
            compress: {
                drop_console: true,
                drop_debugger: true,
                pure_funcs: ['console.log']
            },
            format: {
                comments: false
            }
        }),
        
        // Bundle分析
        isProd && visualizer({
            filename: 'dist/stats.html',
            open: true,
            gzipSize: true,
            brotliSize: true
        })
    ].filter(Boolean),
    
    output: [
        // CommonJS
        {
            file: pkg.main,
            format: 'cjs',
            sourcemap: true,
            exports: 'named'
        },
        // ES Module
        {
            file: pkg.module,
            format: 'esm',
            sourcemap: true
        },
        // UMD
        {
            file: pkg.unpkg,
            format: 'umd',
            name: 'MyLibrary',
            sourcemap: true,
            globals: {
                react: 'React',
                'react-dom': 'ReactDOM'
            }
        }
    ]
};

// TypeScript声明文件配置
const dtsConfig = {
    input: 'dist/types/index.d.ts',
    output: [{ file: 'dist/index.d.ts', format: 'es' }],
    plugins: [dts()],
    external: [/\.css$/, /\.scss$/, /\.sass$/]
};

export default [mainConfig, dtsConfig];
```

## 多环境构建配置

```javascript
// build/webpack.common.js - 共享配置
const path = require('path');
const webpack = require('webpack');
const { merge } = require('webpack-merge');

const commonConfig = {
    entry: {
        app: './src/index.js'
    },
    
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: 'babel-loader'
            }
        ]
    },
    
    resolve: {
        extensions: ['.js', '.jsx', '.json'],
        alias: {
            '@': path.resolve(__dirname, '../src')
        }
    }
};

// build/webpack.dev.js - 开发环境
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

module.exports = merge(common, {
    mode: 'development',
    devtool: 'eval-cheap-module-source-map',
    
    devServer: {
        hot: true,
        port: 3000
    },
    
    plugins: [
        new ReactRefreshWebpackPlugin()
    ]
});

// build/webpack.prod.js - 生产环境
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = merge(common, {
    mode: 'production',
    devtool: 'source-map',
    
    output: {
        filename: '[name].[contenthash].js',
        chunkFilename: '[name].[contenthash].chunk.js',
        path: path.resolve(__dirname, '../dist'),
        clean: true
    },
    
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    'postcss-loader'
                ]
            }
        ]
    },
    
    plugins: [
        new MiniCssExtractPlugin({
            filename: '[name].[contenthash].css',
            chunkFilename: '[name].[contenthash].chunk.css'
        })
    ],
    
    optimization: {
        minimize: true,
        minimizer: [
            new TerserPlugin({
                parallel: true
            }),
            new CssMinimizerPlugin()
        ],
        splitChunks: {
            chunks: 'all',
            cacheGroups: {
                vendor: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendors',
                    priority: -10
                }
            }
        }
    }
});

// build/webpack.analyze.js - 分析构建
const { merge } = require('webpack-merge');
const prodConfig = require('./webpack.prod.js');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const SpeedMeasurePlugin = require('speed-measure-webpack-plugin');

const smp = new SpeedMeasurePlugin();

module.exports = smp.wrap(merge(prodConfig, {
    plugins: [
        new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            reportFilename: '../report.html',
            openAnalyzer: true
        })
    ]
}));
```