---
title: "Vite基础配置示例"
description: "展示Vite的基本配置和常用功能"
category: "build-tools"
language: "javascript"
---

## 最简单的Vite配置

```javascript
// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig({
  // 配置选项
})
```

## 基础开发配置

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  base: '/',
  server: {
    port: 3000,
    open: true,
    cors: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@utils': path.resolve(__dirname, './src/utils')
    }
  }
})
```

## React项目配置

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react({
      // 启用 Fast Refresh
      fastRefresh: true,
      // Babel 配置
      babel: {
        plugins: [
          ['@babel/plugin-proposal-decorators', { legacy: true }]
        ]
      }
    })
  ],
  server: {
    port: 3000,
    host: true
  },
  build: {
    outDir: 'build',
    sourcemap: true
  }
})
```

## Vue项目配置

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/variables.scss";`
      }
    }
  }
})
```

## 生产环境优化配置

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import legacy from '@vitejs/plugin-legacy'
import { visualizer } from 'rollup-plugin-visualizer'
import viteCompression from 'vite-plugin-compression'
import viteImagemin from 'vite-plugin-imagemin'

export default defineConfig({
  build: {
    target: 'es2015',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'lodash': ['lodash-es'],
          'utils': ['axios', 'dayjs']
        },
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: ({ name }) => {
          if (/\.(gif|jpe?g|png|svg)$/.test(name ?? '')) {
            return 'images/[name]-[hash][extname]'
          }
          if (/\.css$/.test(name ?? '')) {
            return 'css/[name]-[hash][extname]'
          }
          return 'assets/[name]-[hash][extname]'
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  plugins: [
    legacy({
      targets: ['defaults', 'not IE 11']
    }),
    viteCompression({
      verbose: true,
      disable: false,
      threshold: 10240,
      algorithm: 'gzip',
      ext: '.gz'
    }),
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
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true
    })
  ]
})
```

## 库模式配置

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import { resolve } from 'path'
import dts from 'vite-plugin-dts'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.js'),
      name: 'MyLibrary',
      fileName: 'my-library',
      formats: ['es', 'umd', 'cjs']
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM'
        }
      }
    }
  },
  plugins: [
    dts({
      insertTypesEntry: true
    })
  ]
})
```

## 环境变量和模式

```javascript
// vite.config.js
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ command, mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    define: {
      __APP_ENV__: JSON.stringify(env.APP_ENV),
      __API_URL__: JSON.stringify(env.VITE_API_URL)
    },
    server: {
      port: parseInt(env.VITE_PORT) || 3000
    },
    build: {
      outDir: env.VITE_OUT_DIR || 'dist',
      sourcemap: mode === 'development'
    }
  }
})
```

## CSS模块化配置

```javascript
// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig({
  css: {
    modules: {
      localsConvention: 'camelCaseOnly',
      scopeBehaviour: 'local',
      generateScopedName: '[name]__[local]___[hash:base64:8]',
      hashPrefix: 'prefix'
    },
    preprocessorOptions: {
      scss: {
        additionalData: `
          @import "@/styles/variables.scss";
          @import "@/styles/mixins.scss";
        `
      },
      less: {
        javascriptEnabled: true,
        modifyVars: {
          '@primary-color': '#1890ff'
        }
      }
    }
  }
})
```

## 插件开发示例

```javascript
// my-vite-plugin.js
export default function myPlugin() {
  return {
    name: 'my-plugin',
    
    // 在其他钩子之前执行
    enforce: 'pre',
    
    // 开发服务器钩子
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === '/custom-endpoint') {
          res.end('Custom response')
          return
        }
        next()
      })
    },
    
    // 转换钩子
    transform(code, id) {
      if (id.endsWith('.custom')) {
        return {
          code: `export default ${JSON.stringify(code)}`,
          map: null
        }
      }
    },
    
    // 构建钩子
    buildStart() {
      console.log('构建开始')
    },
    
    buildEnd() {
      console.log('构建结束')
    }
  }
}

// 使用插件
import { defineConfig } from 'vite'
import myPlugin from './my-vite-plugin'

export default defineConfig({
  plugins: [myPlugin()]
})
```

## SSR配置

```javascript
// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig({
  ssr: {
    noExternal: ['some-dep'],
    target: 'node',
    format: 'cjs'
  },
  build: {
    ssr: true,
    rollupOptions: {
      input: {
        server: './src/entry-server.js'
      }
    }
  }
})
```