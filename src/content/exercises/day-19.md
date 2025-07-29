---
day: 19
title: "构建模块化组件库"
description: "使用现代JavaScript模块系统构建一个可复用的UI组件库"
difficulty: "advanced"
requirements:
  - "使用ES Modules组织代码"
  - "实现多种导出格式"
  - "配置构建工具"
  - "支持Tree Shaking"
  - "提供TypeScript类型定义"
estimatedTime: 240
---

# 构建模块化组件库 🧩

## 项目概述

创建一个现代化的JavaScript UI组件库，包含常用的UI组件、工具函数和样式系统。通过这个项目，你将深入实践模块化开发的各个方面。

## 基础要求

### 1. 项目结构

```
my-ui-lib/
├── src/
│   ├── components/
│   │   ├── Button/
│   │   │   ├── Button.js
│   │   │   ├── Button.styles.js
│   │   │   ├── Button.test.js
│   │   │   └── index.js
│   │   ├── Modal/
│   │   ├── Form/
│   │   └── index.js
│   ├── utils/
│   │   ├── dom.js
│   │   ├── event.js
│   │   ├── format.js
│   │   └── index.js
│   ├── styles/
│   │   ├── variables.js
│   │   ├── mixins.js
│   │   └── index.js
│   └── index.js
├── dist/
├── examples/
├── docs/
├── package.json
├── rollup.config.js
├── webpack.config.js
└── tsconfig.json
```

### 2. 核心组件

#### Button组件
```javascript
// src/components/Button/Button.js
export class Button {
  constructor(options = {}) {
    this.text = options.text || 'Button';
    this.type = options.type || 'primary';
    this.size = options.size || 'medium';
    this.disabled = options.disabled || false;
    this.onClick = options.onClick || (() => {});
    
    this.element = null;
    this.init();
  }
  
  init() {
    this.element = document.createElement('button');
    this.element.className = this.getClassNames();
    this.element.textContent = this.text;
    this.element.disabled = this.disabled;
    
    this.element.addEventListener('click', (e) => {
      if (!this.disabled) {
        this.onClick(e);
      }
    });
  }
  
  getClassNames() {
    return [
      'ui-button',
      `ui-button--${this.type}`,
      `ui-button--${this.size}`,
      this.disabled && 'ui-button--disabled'
    ].filter(Boolean).join(' ');
  }
  
  render(container) {
    if (typeof container === 'string') {
      container = document.querySelector(container);
    }
    container.appendChild(this.element);
    return this;
  }
  
  // 其他方法...
}
```

#### Modal组件
```javascript
// src/components/Modal/Modal.js
export class Modal {
  constructor(options = {}) {
    this.title = options.title || '';
    this.content = options.content || '';
    this.footer = options.footer || null;
    this.closable = options.closable !== false;
    this.maskClosable = options.maskClosable !== false;
    
    this.visible = false;
    this.element = null;
    this.init();
  }
  
  // 实现...
}
```

### 3. 工具函数

```javascript
// src/utils/dom.js
export function createElement(tag, props = {}, children = []) {
  const element = document.createElement(tag);
  
  Object.entries(props).forEach(([key, value]) => {
    if (key === 'style' && typeof value === 'object') {
      Object.assign(element.style, value);
    } else if (key.startsWith('on')) {
      const event = key.slice(2).toLowerCase();
      element.addEventListener(event, value);
    } else {
      element.setAttribute(key, value);
    }
  });
  
  children.forEach(child => {
    if (typeof child === 'string') {
      element.appendChild(document.createTextNode(child));
    } else {
      element.appendChild(child);
    }
  });
  
  return element;
}

export function addClass(element, className) {
  element.classList.add(className);
}

export function removeClass(element, className) {
  element.classList.remove(className);
}

export function toggleClass(element, className) {
  element.classList.toggle(className);
}
```

### 4. 构建配置

#### Rollup配置
```javascript
// rollup.config.js
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import postcss from 'rollup-plugin-postcss';

export default [
  // ES Module
  {
    input: 'src/index.js',
    output: {
      file: 'dist/my-ui-lib.esm.js',
      format: 'es',
      sourcemap: true
    },
    external: ['react', 'react-dom'],
    plugins: [
      resolve(),
      commonjs(),
      postcss({
        modules: true,
        extract: 'my-ui-lib.css'
      })
    ]
  },
  
  // UMD
  {
    input: 'src/index.js',
    output: {
      file: 'dist/my-ui-lib.umd.js',
      format: 'umd',
      name: 'MyUILib',
      sourcemap: true,
      globals: {
        react: 'React',
        'react-dom': 'ReactDOM'
      }
    },
    external: ['react', 'react-dom'],
    plugins: [
      resolve(),
      commonjs(),
      postcss({
        modules: true,
        extract: false,
        inject: true
      }),
      terser()
    ]
  },
  
  // CommonJS
  {
    input: 'src/index.js',
    output: {
      file: 'dist/my-ui-lib.cjs.js',
      format: 'cjs',
      sourcemap: true
    },
    external: ['react', 'react-dom'],
    plugins: [
      resolve(),
      commonjs(),
      postcss({
        modules: true,
        extract: 'my-ui-lib.css'
      })
    ]
  }
];
```

### 5. 包配置

```json
{
  "name": "my-ui-lib",
  "version": "1.0.0",
  "description": "A modern UI component library",
  "main": "dist/my-ui-lib.cjs.js",
  "module": "dist/my-ui-lib.esm.js",
  "unpkg": "dist/my-ui-lib.umd.min.js",
  "types": "dist/index.d.ts",
  "sideEffects": [
    "*.css",
    "*.scss"
  ],
  "files": [
    "dist",
    "src"
  ],
  "scripts": {
    "build": "rollup -c",
    "dev": "rollup -c -w",
    "test": "jest",
    "lint": "eslint src",
    "prepublishOnly": "npm run build"
  },
  "peerDependencies": {
    "react": ">=16.8.0",
    "react-dom": ">=16.8.0"
  },
  "devDependencies": {
    "@rollup/plugin-commonjs": "^21.0.0",
    "@rollup/plugin-node-resolve": "^13.0.0",
    "rollup": "^2.60.0",
    "rollup-plugin-terser": "^7.0.0"
  }
}
```

## 实现要求

### 1. 组件系统

```javascript
// src/components/index.js
// 统一导出所有组件
export { Button } from './Button';
export { Modal } from './Modal';
export { Form, Input, Select } from './Form';
export { Table } from './Table';
export { Tabs } from './Tabs';
export { Tooltip } from './Tooltip';
export { Notification } from './Notification';

// 也提供默认导出
import * as components from './index';
export default components;
```

### 2. 样式系统

```javascript
// src/styles/variables.js
export const colors = {
  primary: '#1890ff',
  success: '#52c41a',
  warning: '#faad14',
  error: '#f5222d',
  text: '#333333',
  textSecondary: '#666666',
  border: '#d9d9d9',
  background: '#f5f5f5'
};

export const sizes = {
  small: {
    height: '24px',
    padding: '0 8px',
    fontSize: '12px'
  },
  medium: {
    height: '32px',
    padding: '0 16px',
    fontSize: '14px'
  },
  large: {
    height: '40px',
    padding: '0 24px',
    fontSize: '16px'
  }
};

// src/styles/mixins.js
export const buttonStyles = (type, size) => {
  const colorMap = {
    primary: colors.primary,
    success: colors.success,
    warning: colors.warning,
    danger: colors.error
  };
  
  return {
    backgroundColor: colorMap[type] || colors.primary,
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'all 0.3s',
    ...sizes[size]
  };
};
```

### 3. 类型定义

```typescript
// src/types/index.d.ts
export interface ButtonOptions {
  text?: string;
  type?: 'primary' | 'success' | 'warning' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  onClick?: (event: MouseEvent) => void;
}

export class Button {
  constructor(options?: ButtonOptions);
  render(container: string | HTMLElement): Button;
  enable(): void;
  disable(): void;
  destroy(): void;
}

export interface ModalOptions {
  title?: string;
  content?: string | HTMLElement;
  footer?: HTMLElement;
  closable?: boolean;
  maskClosable?: boolean;
  onOk?: () => void | Promise<void>;
  onCancel?: () => void;
}

export class Modal {
  constructor(options?: ModalOptions);
  show(): void;
  hide(): void;
  destroy(): void;
  static confirm(options: ModalOptions): Promise<boolean>;
  static alert(message: string, title?: string): Promise<void>;
}
```

### 4. 插件系统

```javascript
// src/core/Plugin.js
export class PluginSystem {
  constructor() {
    this.plugins = new Map();
  }
  
  use(plugin) {
    if (typeof plugin === 'function') {
      plugin(this);
    } else if (plugin && typeof plugin.install === 'function') {
      plugin.install(this);
    }
    return this;
  }
  
  // 插件可以扩展组件
  extendComponent(name, extension) {
    // 实现组件扩展逻辑
  }
  
  // 插件可以添加全局方法
  addGlobalMethod(name, method) {
    // 实现全局方法添加
  }
}

// 示例插件
export const ThemePlugin = {
  install(lib) {
    lib.extendComponent('Button', {
      setTheme(theme) {
        this.element.dataset.theme = theme;
      }
    });
  }
};
```

## 进阶功能

1. **按需加载支持**
   - 实现babel插件支持按需导入
   - 提供ES模块以支持Tree Shaking

2. **主题定制**
   - CSS变量支持
   - 主题切换功能
   - 动态主题生成

3. **国际化**
   - 多语言支持
   - 语言包动态加载
   - 日期时间格式化

4. **性能优化**
   - 虚拟滚动
   - 懒加载
   - 组件缓存

5. **开发体验**
   - 热更新支持
   - 组件文档生成
   - 在线演示

## 评分标准

- **代码组织 (30分)**
  - 模块结构清晰
  - 导出方式合理
  - 依赖管理正确

- **构建配置 (25分)**
  - 多格式输出
  - Tree Shaking支持
  - 优化配置完善

- **组件质量 (25分)**
  - 功能完整
  - API设计合理
  - 错误处理完善

- **文档和类型 (20分)**
  - TypeScript定义
  - 使用文档
  - 示例代码

## 测试用例

```javascript
// examples/demo.html
<!DOCTYPE html>
<html>
<head>
  <title>My UI Lib Demo</title>
  <link rel="stylesheet" href="../dist/my-ui-lib.css">
</head>
<body>
  <div id="app"></div>
  
  <!-- UMD版本 -->
  <script src="../dist/my-ui-lib.umd.js"></script>
  <script>
    const { Button, Modal } = MyUILib;
    
    const button = new Button({
      text: 'Click Me',
      type: 'primary',
      onClick: () => {
        Modal.alert('Hello World!');
      }
    });
    
    button.render('#app');
  </script>
  
  <!-- ES Module版本 -->
  <script type="module">
    import { Button, Modal } from '../dist/my-ui-lib.esm.js';
    
    // 使用ES模块
  </script>
</body>
</html>
```

## 学习资源

- [Rollup官方文档](https://rollupjs.org/)
- [如何创建JavaScript库](https://github.com/krasimir/webpack-library-starter)
- [npm包最佳实践](https://github.com/wearehive/project-guidelines)

祝你构建出优秀的组件库！记住，良好的模块设计和构建配置是成功的关键。