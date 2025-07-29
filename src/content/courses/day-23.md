---
day: 23
phase: "javascript-mastery"
title: "现代开发工具链"
description: "掌握现代JavaScript开发必备的工具和流程"
objectives:
  - "理解包管理器的作用和最佳实践"
  - "掌握构建工具的配置和使用"
  - "学习代码质量工具的集成"
  - "了解自动化测试和持续集成"
  - "实践现代开发工作流"
prerequisites:
  - 19
  - 20
estimatedTime: 180
difficulty: "advanced"
resources:
  - title: "npm官方文档"
    url: "https://docs.npmjs.com/"
    type: "documentation"
  - title: "Webpack官方指南"
    url: "https://webpack.js.org/guides/"
    type: "documentation"
---

# Day 23: 现代开发工具链

今天我们将学习现代JavaScript开发中必不可少的工具链。这些工具能够大大提升开发效率、代码质量和团队协作能力。

## 包管理器

### npm (Node Package Manager)

```bash
# 初始化项目
npm init -y

# 安装依赖
npm install express        # 生产依赖
npm install -D webpack    # 开发依赖

# 常用命令
npm list                  # 查看已安装的包
npm outdated             # 检查过时的包
npm update               # 更新包
npm audit                # 安全审计
npm audit fix            # 修复安全问题

# package.json脚本
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "build": "webpack --mode production",
    "test": "jest"
  }
}
```

### Yarn

```bash
# 安装Yarn
npm install -g yarn

# 基本命令
yarn init               # 初始化项目
yarn add package       # 添加依赖
yarn add -D package    # 添加开发依赖
yarn remove package    # 移除依赖
yarn upgrade           # 升级依赖
yarn install           # 安装所有依赖

# 高级特性
yarn workspaces        # 工作区管理
yarn dlx               # 临时执行包
```

### pnpm

```bash
# 安装pnpm
npm install -g pnpm

# 特点：高效的磁盘空间使用
pnpm add package
pnpm install
pnpm run script

# 工作空间
pnpm -w add package    # 添加到工作空间根目录
```

## 构建工具

### Webpack

```javascript
// webpack.config.js
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './src/index.js',
  output: {
    filename: '[name].[contenthash].js',
    path: path.resolve(__dirname, 'dist'),
    clean: true
  },
  
  module: {
    rules: [
      // JavaScript/JSX
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react']
          }
        }
      },
      
      // CSS
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader']
      },
      
      // 图片
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource'
      },
      
      // 字体
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource'
      }
    ]
  },
  
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: './public/index.html',
      minify: {
        removeComments: true,
        collapseWhitespace: true
      }
    })
  ],
  
  devServer: {
    static: './dist',
    hot: true,
    open: true,
    port: 3000
  },
  
  optimization: {
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
};
```

### Vite

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@utils': path.resolve(__dirname, './src/utils')
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
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          utils: ['lodash', 'axios']
        }
      }
    }
  },
  
  optimizeDeps: {
    include: ['react', 'react-dom']
  }
});
```

### Rollup

```javascript
// rollup.config.js
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';
import dts from 'rollup-plugin-dts';

const production = !process.env.ROLLUP_WATCH;

export default [
  // 主构建配置
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/bundle.cjs.js',
        format: 'cjs',
        sourcemap: true
      },
      {
        file: 'dist/bundle.esm.js',
        format: 'esm',
        sourcemap: true
      },
      {
        name: 'MyLibrary',
        file: 'dist/bundle.umd.js',
        format: 'umd',
        sourcemap: true
      }
    ],
    plugins: [
      resolve(),
      commonjs(),
      typescript({ tsconfig: './tsconfig.json' }),
      production && terser()
    ],
    external: ['react', 'react-dom']
  },
  
  // TypeScript声明文件
  {
    input: 'dist/types/index.d.ts',
    output: [{ file: 'dist/index.d.ts', format: 'esm' }],
    plugins: [dts()]
  }
];
```

## 代码转换工具

### Babel

```javascript
// babel.config.js
module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          browsers: ['> 1%', 'last 2 versions', 'not ie <= 8']
        },
        useBuiltIns: 'usage',
        corejs: 3
      }
    ],
    '@babel/preset-react',
    '@babel/preset-typescript'
  ],
  
  plugins: [
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-proposal-optional-chaining',
    '@babel/plugin-proposal-nullish-coalescing-operator',
    [
      '@babel/plugin-transform-runtime',
      {
        corejs: 3,
        helpers: true,
        regenerator: true
      }
    ]
  ],
  
  env: {
    development: {
      plugins: ['react-hot-loader/babel']
    },
    production: {
      plugins: [
        'transform-remove-console',
        'transform-remove-debugger'
      ]
    }
  }
};
```

### TypeScript

```javascript
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    
    // 模块解析
    "moduleResolution": "node",
    "baseUrl": "./",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@utils/*": ["src/utils/*"]
    },
    
    // 严格类型检查
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    
    // 额外检查
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    
    // 输出
    "outDir": "./dist",
    "sourceMap": true,
    "declaration": true,
    "declarationMap": true,
    
    // 其他
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

## 代码质量工具

### ESLint

```javascript
// .eslintrc.js
module.exports = {
  root: true,
  
  env: {
    browser: true,
    es2021: true,
    node: true,
    jest: true
  },
  
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'airbnb',
    'prettier'
  ],
  
  parser: '@typescript-eslint/parser',
  
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 12,
    sourceType: 'module',
    project: './tsconfig.json'
  },
  
  plugins: [
    'react',
    '@typescript-eslint',
    'import',
    'jsx-a11y'
  ],
  
  rules: {
    // TypeScript
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': ['error', { 
      argsIgnorePattern: '^_' 
    }],
    
    // React
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'react/jsx-filename-extension': [1, { 
      extensions: ['.tsx', '.jsx'] 
    }],
    
    // Import
    'import/extensions': ['error', 'ignorePackages', {
      ts: 'never',
      tsx: 'never'
    }],
    'import/prefer-default-export': 'off',
    'import/order': ['error', {
      groups: [
        'builtin',
        'external',
        'internal',
        'parent',
        'sibling',
        'index'
      ],
      'newlines-between': 'always',
      alphabetize: {
        order: 'asc',
        caseInsensitive: true
      }
    }],
    
    // 通用规则
    'no-console': ['warn', { 
      allow: ['warn', 'error'] 
    }],
    'no-debugger': 'error',
    'prefer-const': 'error',
    'no-var': 'error'
  },
  
  settings: {
    'import/resolver': {
      typescript: {},
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx']
      }
    },
    react: {
      version: 'detect'
    }
  }
};
```

### Prettier

```javascript
// .prettierrc.js
module.exports = {
  // 基本格式
  printWidth: 80,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: true,
  quoteProps: 'as-needed',
  
  // JSX
  jsxSingleQuote: false,
  jsxBracketSameLine: false,
  
  // 尾随逗号
  trailingComma: 'es5',
  
  // 括号
  bracketSpacing: true,
  arrowParens: 'always',
  
  // 其他
  endOfLine: 'lf',
  proseWrap: 'preserve',
  htmlWhitespaceSensitivity: 'css',
  
  // 文件特定配置
  overrides: [
    {
      files: '*.md',
      options: {
        printWidth: 100,
        proseWrap: 'always'
      }
    },
    {
      files: ['*.json', '*.yml'],
      options: {
        tabWidth: 2
      }
    }
  ]
};

// .prettierignore
// node_modules
// dist
// coverage
// .next
// .cache
// public
```

### Husky & lint-staged

```javascript
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "commit-msg": "commitlint -E HUSKY_GIT_PARAMS",
      "pre-push": "npm test"
    }
  },
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md,yml,yaml}": [
      "prettier --write"
    ],
    "*.css": [
      "stylelint --fix",
      "prettier --write"
    ]
  }
}

// commitlint.config.js
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // 新功能
        'fix',      // 修复
        'docs',     // 文档
        'style',    // 格式
        'refactor', // 重构
        'perf',     // 性能
        'test',     // 测试
        'chore',    // 构建过程或辅助工具
        'revert'    // 回退
      ]
    ],
    'subject-case': [2, 'never', ['upper-case']],
    'subject-full-stop': [2, 'never', '.']
  }
};
```

## 测试框架

### Jest

```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  
  roots: ['<rootDir>/src'],
  
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/index.tsx',
    '!src/reportWebVitals.ts'
  ],
  
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.{spec,test}.{js,jsx,ts,tsx}'
  ],
  
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
    '^.+\\.css$': '<rootDir>/config/jest/cssTransform.js',
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '<rootDir>/config/jest/fileTransform.js'
  },
  
  transformIgnorePatterns: [
    '[/\\\\]node_modules[/\\\\].+\\.(js|jsx|ts|tsx)$',
    '^.+\\.module\\.(css|sass|scss)$'
  ],
  
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
  },
  
  moduleFileExtensions: [
    'web.js',
    'js',
    'web.ts',
    'ts',
    'web.tsx',
    'tsx',
    'json',
    'web.jsx',
    'jsx',
    'node'
  ],
  
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname'
  ],
  
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

### Testing Library

```javascript
// 组件测试示例
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { LoginForm } from './LoginForm';

describe('LoginForm', () => {
  const mockOnSubmit = jest.fn();
  
  beforeEach(() => {
    mockOnSubmit.mockClear();
  });
  
  test('renders login form', () => {
    render(<LoginForm onSubmit={mockOnSubmit} />);
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });
  
  test('validates required fields', async () => {
    render(<LoginForm onSubmit={mockOnSubmit} />);
    
    const submitButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
    
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });
  
  test('submits form with valid data', async () => {
    const user = userEvent.setup();
    render(<LoginForm onSubmit={mockOnSubmit} />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    
    const submitButton = screen.getByRole('button', { name: /login/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
    });
  });
});
```

## 持续集成/持续部署 (CI/CD)

### GitHub Actions

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  lint:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '16'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run ESLint
        run: npm run lint
      
      - name: Run Prettier check
        run: npm run format:check
  
  test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [14.x, 16.x, 18.x]
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Use Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test -- --coverage
      
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          token: ${{ secrets.CODECOV_TOKEN }}
  
  build:
    needs: [lint, test]
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '16'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build project
        run: npm run build
      
      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: build-files
          path: dist/
  
  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Download build artifacts
        uses: actions/download-artifact@v3
        with:
          name: build-files
          path: dist/
      
      - name: Deploy to production
        env:
          DEPLOY_KEY: ${{ secrets.DEPLOY_KEY }}
        run: |
          # 部署脚本
          echo "Deploying to production..."
```

## 开发环境配置

### VS Code配置

```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[javascriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ],
  
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  
  "files.exclude": {
    "**/.git": true,
    "**/.DS_Store": true,
    "**/node_modules": true,
    "**/dist": true,
    "**/coverage": true
  },
  
  "search.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/coverage": true,
    "**/*.lock": true
  }
}

// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Jest Tests",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["test", "--", "--runInBand", "--watchAll=false"],
      "port": 9229,
      "skipFiles": ["<node_internals>/**"]
    },
    {
      "type": "chrome",
      "request": "launch",
      "name": "Launch Chrome",
      "url": "http://localhost:3000",
      "webRoot": "${workspaceFolder}"
    }
  ]
}
```

### 环境变量管理

```javascript
// .env.example
NODE_ENV=development
PORT=3000
API_URL=http://localhost:5000
PUBLIC_URL=/

# 数据库
DB_HOST=localhost
DB_PORT=5432
DB_NAME=myapp
DB_USER=admin
DB_PASS=password

# 第三方服务
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret

# 密钥
JWT_SECRET=your-jwt-secret
ENCRYPTION_KEY=your-encryption-key

// dotenv配置
require('dotenv').config();

// 或在Webpack中
const dotenv = require('dotenv');
const webpack = require('webpack');

module.exports = {
  plugins: [
    new webpack.DefinePlugin({
      'process.env': JSON.stringify(dotenv.config().parsed)
    })
  ]
};
```

## 最佳实践

### 1. 项目结构

```
my-app/
├── src/
│   ├── components/     # React组件
│   ├── pages/         # 页面组件
│   ├── hooks/         # 自定义Hooks
│   ├── utils/         # 工具函数
│   ├── services/      # API服务
│   ├── store/         # 状态管理
│   ├── styles/        # 全局样式
│   ├── types/         # TypeScript类型
│   └── index.tsx      # 入口文件
├── public/            # 静态资源
├── tests/            # 测试文件
├── scripts/          # 构建脚本
├── .github/          # GitHub配置
├── .vscode/          # VS Code配置
├── package.json
├── tsconfig.json
├── .eslintrc.js
├── .prettierrc.js
└── README.md
```

### 2. npm scripts最佳实践

```json
{
  "scripts": {
    "start": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint src --ext .js,.jsx,.ts,.tsx",
    "lint:fix": "eslint src --ext .js,.jsx,.ts,.tsx --fix",
    "format": "prettier --write \"src/**/*.{js,jsx,ts,tsx,json,css,md}\"",
    "format:check": "prettier --check \"src/**/*.{js,jsx,ts,tsx,json,css,md}\"",
    "type-check": "tsc --noEmit",
    "validate": "npm run type-check && npm run lint && npm run test",
    "prepare": "husky install",
    "pre-commit": "lint-staged",
    "analyze": "source-map-explorer 'dist/**/*.js'",
    "clean": "rimraf dist coverage",
    "release": "standard-version"
  }
}
```

### 3. 依赖管理

```javascript
// 定期更新依赖
npm outdated
npm update

// 使用npm-check-updates
npx npm-check-updates -u
npm install

// 锁定版本
// package-lock.json (npm)
// yarn.lock (yarn)
// pnpm-lock.yaml (pnpm)

// 安全审计
npm audit
npm audit fix
```

### 4. 性能优化

```javascript
// 代码分割
const LazyComponent = React.lazy(() => import('./LazyComponent'));

// Tree Shaking
import { debounce } from 'lodash-es'; // 而不是 import _ from 'lodash'

// 生产构建优化
if (process.env.NODE_ENV === 'production') {
  // 生产环境代码
}
```

## 总结

现代JavaScript开发工具链是提高开发效率和代码质量的关键。通过合理配置和使用这些工具，我们可以：

1. **自动化重复任务** - 构建、测试、部署
2. **保证代码质量** - 类型检查、代码规范、测试覆盖
3. **优化性能** - 代码分割、Tree Shaking、压缩
4. **提升开发体验** - 热更新、智能提示、调试工具
5. **团队协作** - 统一规范、自动化流程、持续集成

明天我们将把所学知识整合到一个完整的项目中，构建一个现代化的Web应用！