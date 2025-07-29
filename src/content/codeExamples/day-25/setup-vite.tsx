// setup-vite.tsx - 使用Vite创建React项目

// 1. 创建项目命令
/*
npm create vite@latest my-react-app -- --template react-ts
cd my-react-app
npm install
npm run dev
*/

// 2. 项目结构
/*
my-react-app/
├── node_modules/
├── public/
│   └── vite.svg
├── src/
│   ├── assets/
│   ├── App.css
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── .eslintrc.cjs
├── .gitignore
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
*/

// 3. main.tsx - 应用入口
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// 4. vite.config.ts - Vite配置
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});

// 5. tsconfig.json配置
const tsConfig = {
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
};

// 6. 环境变量配置
// .env.development
/*
VITE_API_URL=http://localhost:8080
VITE_APP_TITLE=My React App
*/

// 使用环境变量
function EnvDemo() {
  return (
    <div>
      <h1>{import.meta.env.VITE_APP_TITLE}</h1>
      <p>API URL: {import.meta.env.VITE_API_URL}</p>
    </div>
  );
}

// 7. 路径别名配置
// vite.config.ts
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@utils': path.resolve(__dirname, './src/utils'),
    },
  },
});

// 8. 热模块替换(HMR)示例
if (import.meta.hot) {
  import.meta.hot.accept(() => {
    console.log('模块已更新！');
  });
}

// 9. 生产构建优化
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'utils': ['lodash', 'axios'],
        },
      },
    },
    chunkSizeWarningLimit: 500,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
});

export { EnvDemo };