---
day: 30
phase: "react-development"
title: "CSS-in-JS与样式系统"
description: "探索React中的现代样式解决方案，掌握CSS-in-JS、styled-components、emotion等工具，构建可维护的样式系统"
objectives:
  - "理解CSS-in-JS的概念和优势"
  - "掌握styled-components的使用"
  - "学习emotion和CSS Modules"
  - "构建主题系统和设计令牌"
  - "实现响应式设计和动态样式"
estimatedTime: 120
difficulty: "intermediate"
prerequisites: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 25, 26, 27, 28, 29]
tags:
  - "React"
  - "CSS-in-JS"
  - "styled-components"
  - "样式系统"
  - "主题"
resources:
  - title: "styled-components官方文档"
    url: "https://styled-components.com/"
    type: "documentation"
  - title: "emotion官方文档"
    url: "https://emotion.sh/"
    type: "documentation"
  - title: "CSS Modules文档"
    url: "https://github.com/css-modules/css-modules"
    type: "documentation"
  - title: "React样式最佳实践"
    url: "https://www.robinwieruch.de/react-css-styling/"
    type: "article"
codeExamples:
  - title: "样式系统实现"
    language: "javascript"
    path: "/code-examples/day-30/style-system.jsx"
  - title: "主题切换示例"
    language: "javascript"
    path: "/code-examples/day-30/theme-switcher.jsx"
---

# Day 30: CSS-in-JS与样式系统

## 📋 学习目标

今天我们将探索React中的现代样式解决方案。CSS-in-JS改变了我们编写样式的方式，它将样式与组件紧密结合，提供了类型安全、动态样式、主题支持等强大功能。通过本课程，你将掌握构建可扩展、可维护的样式系统。

## 🌟 CSS-in-JS概览

### 1. 传统CSS的挑战

```css
/* 传统CSS的问题 */

/* 1. 全局命名空间 */
.button { } /* 可能与其他.button冲突 */

/* 2. 依赖管理困难 */
/* 哪个组件使用了这个样式？可以安全删除吗？ */
.unused-class { }

/* 3. 死代码消除困难 */
/* 构建工具很难判断哪些CSS是未使用的 */

/* 4. 样式和状态隔离 */
.button:hover { }
.button.active { } /* 需要手动管理类名 */

/* 5. 代码共享困难 */
/* 如何共享颜色、间距等设计令牌？ */
```

### 2. CSS-in-JS的优势

```jsx
// CSS-in-JS解决的问题

// 1. 组件作用域的样式
const Button = styled.button`
  color: blue; // 只影响这个按钮组件
`;

// 2. 动态样式
const Button = styled.button`
  color: ${props => props.primary ? 'white' : 'black'};
  background: ${props => props.primary ? 'blue' : 'gray'};
`;

// 3. 自动前缀和优化
const Box = styled.div`
  display: flex; // 自动添加-webkit-flex等前缀
  user-select: none; // 自动处理浏览器兼容性
`;

// 4. 消除死代码
// 未使用的组件样式会被tree-shaking移除

// 5. TypeScript支持
interface ButtonProps {
  primary?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const Button = styled.button<ButtonProps>`
  // 类型安全的props
`;
```

### 3. CSS-in-JS方案对比

```jsx
// 1. Runtime CSS-in-JS (styled-components, emotion)
// 优点：功能强大，动态性好
// 缺点：运行时性能开销

// 2. Zero-runtime CSS-in-JS (linaria, vanilla-extract)
// 优点：无运行时开销，性能好
// 缺点：动态能力受限

// 3. CSS Modules
// 优点：简单，与现有工具链兼容好
// 缺点：仍然是独立的CSS文件

// 4. Utility-first CSS (Tailwind CSS)
// 优点：开发速度快，样式一致
// 缺点：HTML较冗长，学习曲线
```

## 📊 styled-components深入

### 1. 安装和基础使用

```bash
npm install styled-components
npm install -D @types/styled-components
```

```jsx
import styled from 'styled-components';

// 基础样式组件
const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 1rem;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

// 使用样式组件
function App() {
  return (
    <div>
      <Title>Hello styled-components!</Title>
      <Button>Click me</Button>
    </div>
  );
}
```

### 2. 动态样式和props

```jsx
// 基于props的样式
const Button = styled.button<{
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
}>`
  /* 基础样式 */
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  
  /* 大小变体 */
  ${props => {
    switch (props.size) {
      case 'small':
        return `
          padding: 0.25rem 0.5rem;
          font-size: 0.875rem;
        `;
      case 'large':
        return `
          padding: 0.75rem 1.5rem;
          font-size: 1.125rem;
        `;
      default:
        return `
          padding: 0.5rem 1rem;
          font-size: 1rem;
        `;
    }
  }}
  
  /* 颜色变体 */
  ${props => {
    const colors = {
      primary: { bg: '#007bff', color: 'white', hover: '#0056b3' },
      secondary: { bg: '#6c757d', color: 'white', hover: '#545b62' },
      danger: { bg: '#dc3545', color: 'white', hover: '#c82333' }
    };
    
    const { bg, color, hover } = colors[props.variant || 'primary'];
    
    return `
      background-color: ${bg};
      color: ${color};
      
      &:hover {
        background-color: ${hover};
      }
    `;
  }}
  
  /* 全宽样式 */
  ${props => props.fullWidth && `
    display: block;
    width: 100%;
  `}
  
  /* 禁用状态 */
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

// 条件样式的另一种写法
const Card = styled.div<{ highlighted?: boolean }>`
  padding: 1rem;
  border-radius: 8px;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  
  ${({ highlighted }) => highlighted && `
    border: 2px solid #007bff;
    box-shadow: 0 4px 12px rgba(0, 123, 255, 0.15);
  `}
`;

// 使用css helper
import { css } from 'styled-components';

const truncate = css`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Text = styled.p<{ truncated?: boolean }>`
  ${props => props.truncated && truncate}
`;
```

### 3. 扩展和组合样式

```jsx
// 扩展现有组件
const Button = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  background: #007bff;
  color: white;
`;

const PrimaryButton = styled(Button)`
  background: #28a745;
  font-weight: bold;
`;

const IconButton = styled(Button)`
  padding: 0.5rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  
  svg {
    width: 1.2em;
    height: 1.2em;
  }
`;

// 扩展第三方组件
import { Link } from 'react-router-dom';

const StyledLink = styled(Link)`
  color: #007bff;
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
`;

// 使用as prop改变渲染元素
function Example() {
  return (
    <>
      <Button>普通按钮</Button>
      <Button as="a" href="/somewhere">链接按钮</Button>
      <Button as={Link} to="/somewhere">路由按钮</Button>
    </>
  );
}

// attrs方法添加默认属性
const Input = styled.input.attrs(props => ({
  type: props.type || 'text',
  size: props.size || '1rem'
}))`
  padding: 0.5rem;
  font-size: ${props => props.size};
  border: 1px solid #ddd;
  border-radius: 4px;
  
  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const PasswordInput = styled(Input).attrs({
  type: 'password'
})`
  letter-spacing: 0.1em;
`;
```

### 4. 全局样式和主题

```jsx
import { createGlobalStyle, ThemeProvider } from 'styled-components';

// 全局样式
const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: ${props => props.theme.colors.text};
    background: ${props => props.theme.colors.background};
    line-height: 1.6;
  }
  
  a {
    color: ${props => props.theme.colors.primary};
    text-decoration: none;
  }
  
  ::selection {
    background: ${props => props.theme.colors.primary};
    color: white;
  }
`;

// 主题定义
const lightTheme = {
  colors: {
    primary: '#007bff',
    secondary: '#6c757d',
    success: '#28a745',
    danger: '#dc3545',
    text: '#333',
    background: '#fff',
    gray: {
      100: '#f8f9fa',
      200: '#e9ecef',
      300: '#dee2e6',
      400: '#ced4da',
      500: '#adb5bd',
      600: '#6c757d',
      700: '#495057',
      800: '#343a40',
      900: '#212529'
    }
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '3rem'
  },
  breakpoints: {
    mobile: '576px',
    tablet: '768px',
    desktop: '992px',
    wide: '1200px'
  },
  transitions: {
    fast: '0.15s ease',
    normal: '0.3s ease',
    slow: '0.5s ease'
  }
};

const darkTheme = {
  ...lightTheme,
  colors: {
    ...lightTheme.colors,
    text: '#f8f9fa',
    background: '#212529',
    gray: {
      ...lightTheme.colors.gray,
      // 反转灰度
      100: '#212529',
      900: '#f8f9fa'
    }
  }
};

// 使用主题
function App() {
  const [isDark, setIsDark] = useState(false);
  
  return (
    <ThemeProvider theme={isDark ? darkTheme : lightTheme}>
      <GlobalStyle />
      <AppContent />
    </ThemeProvider>
  );
}

// 在组件中使用主题
const Container = styled.div`
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.background};
  
  @media (min-width: ${props => props.theme.breakpoints.tablet}) {
    padding: ${props => props.theme.spacing.lg};
  }
`;

// 使用主题Hook
import { useTheme } from 'styled-components';

function ThemedComponent() {
  const theme = useTheme();
  
  return (
    <div style={{ color: theme.colors.primary }}>
      Current theme: {theme.name}
    </div>
  );
}
```

## 🎨 emotion使用

### 1. 基础设置

```bash
npm install @emotion/react @emotion/styled
```

```jsx
/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import styled from '@emotion/styled';

// 对象样式
const buttonStyle = css({
  padding: '0.5rem 1rem',
  border: 'none',
  borderRadius: '4px',
  backgroundColor: '#007bff',
  color: 'white',
  cursor: 'pointer',
  
  '&:hover': {
    backgroundColor: '#0056b3'
  }
});

// 模板字符串样式
const titleStyle = css`
  font-size: 2rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 1rem;
`;

// 使用css prop
function Component() {
  return (
    <>
      <h1 css={titleStyle}>标题</h1>
      <button css={buttonStyle}>按钮</button>
      
      {/* 内联样式 */}
      <div
        css={css`
          padding: 1rem;
          background: #f0f0f0;
          border-radius: 8px;
        `}
      >
        内容
      </div>
      
      {/* 对象语法 */}
      <span
        css={{
          color: 'red',
          fontWeight: 'bold',
          '&:hover': {
            textDecoration: 'underline'
          }
        }}
      >
        悬停文本
      </span>
    </>
  );
}
```

### 2. styled组件

```jsx
import styled from '@emotion/styled';

// 基础样式组件
const Button = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  background-color: ${props => props.primary ? '#007bff' : '#6c757d'};
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    opacity: 0.9;
  }
`;

// 动态样式函数
const Box = styled.div(
  {
    display: 'flex',
    padding: '1rem'
  },
  props => ({
    flexDirection: props.column ? 'column' : 'row',
    backgroundColor: props.bg || 'white',
    gap: props.gap || '1rem'
  })
);

// 组合样式
const baseButton = css`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
`;

const PrimaryButton = styled.button`
  ${baseButton}
  background: #007bff;
  color: white;
`;

const SecondaryButton = styled.button`
  ${baseButton}
  background: #6c757d;
  color: white;
`;
```

### 3. 主题系统

```jsx
import { ThemeProvider } from '@emotion/react';

// 定义主题类型
declare module '@emotion/react' {
  export interface Theme {
    colors: {
      primary: string;
      secondary: string;
      background: string;
      text: string;
    };
    spacing: (n: number) => string;
  }
}

// 创建主题
const theme = {
  colors: {
    primary: '#007bff',
    secondary: '#6c757d',
    background: '#ffffff',
    text: '#333333'
  },
  spacing: (n: number) => `${n * 0.25}rem`
};

// 使用主题
function App() {
  return (
    <ThemeProvider theme={theme}>
      <ThemedComponent />
    </ThemeProvider>
  );
}

// 在样式中使用主题
const ThemedButton = styled.button`
  background: ${props => props.theme.colors.primary};
  color: white;
  padding: ${props => props.theme.spacing(2)} ${props => props.theme.spacing(4)};
`;

// 使用useTheme Hook
import { useTheme } from '@emotion/react';

function Component() {
  const theme = useTheme();
  
  return (
    <div css={{ color: theme.colors.primary }}>
      主题颜色
    </div>
  );
}
```

## 🏗️ CSS Modules

### 1. 基础使用

```css
/* Button.module.css */
.button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.primary {
  background: #007bff;
  color: white;
}

.primary:hover {
  background: #0056b3;
}

.secondary {
  background: #6c757d;
  color: white;
}

.large {
  padding: 0.75rem 1.5rem;
  font-size: 1.125rem;
}

.small {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}
```

```jsx
// Button.jsx
import styles from './Button.module.css';
import clsx from 'clsx'; // 或使用 classnames

function Button({ 
  variant = 'primary', 
  size = 'medium', 
  children, 
  className,
  ...props 
}) {
  return (
    <button
      className={clsx(
        styles.button,
        styles[variant],
        size !== 'medium' && styles[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

// 使用组件
<Button variant="primary" size="large">
  大号主按钮
</Button>
```

### 2. 组合和继承

```css
/* base.module.css */
.card {
  padding: 1rem;
  border-radius: 8px;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.title {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

/* ProductCard.module.css */
.productCard {
  composes: card from './base.module.css';
  transition: transform 0.3s ease;
}

.productCard:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.productTitle {
  composes: title from './base.module.css';
  color: #333;
}

.price {
  font-size: 1.25rem;
  font-weight: bold;
  color: #28a745;
}
```

### 3. 与TypeScript使用

```typescript
// 类型声明文件 
// Button.module.css.d.ts
declare const styles: {
  readonly button: string;
  readonly primary: string;
  readonly secondary: string;
  readonly large: string;
  readonly small: string;
};

export default styles;

// 或使用typed-css-modules自动生成

// 组件中使用
import styles from './Button.module.css';

interface ButtonProps {
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
}

const Button: React.FC<ButtonProps> = ({ variant = 'primary', size, children }) => {
  return (
    <button className={`${styles.button} ${styles[variant]} ${size ? styles[size] : ''}`}>
      {children}
    </button>
  );
};
```

## 💅 主题系统设计

### 1. 设计令牌系统

```jsx
// tokens.js - 设计令牌
export const tokens = {
  // 颜色系统
  colors: {
    // 基础颜色
    blue: {
      50: '#e3f2fd',
      100: '#bbdefb',
      200: '#90caf9',
      300: '#64b5f6',
      400: '#42a5f5',
      500: '#2196f3',
      600: '#1e88e5',
      700: '#1976d2',
      800: '#1565c0',
      900: '#0d47a1'
    },
    gray: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#eeeeee',
      300: '#e0e0e0',
      400: '#bdbdbd',
      500: '#9e9e9e',
      600: '#757575',
      700: '#616161',
      800: '#424242',
      900: '#212121'
    },
    // 语义颜色
    semantic: {
      primary: '#2196f3',
      secondary: '#9c27b0',
      success: '#4caf50',
      warning: '#ff9800',
      error: '#f44336',
      info: '#00bcd4'
    }
  },
  
  // 排版系统
  typography: {
    fontFamily: {
      sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      mono: 'Monaco, Consolas, "Lucida Console", monospace'
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem'
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75
    }
  },
  
  // 间距系统
  spacing: {
    0: '0',
    1: '0.25rem',
    2: '0.5rem',
    3: '0.75rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    8: '2rem',
    10: '2.5rem',
    12: '3rem',
    16: '4rem',
    20: '5rem',
    24: '6rem'
  },
  
  // 边框半径
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    base: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    '3xl': '1.5rem',
    full: '9999px'
  },
  
  // 阴影
  shadows: {
    xs: '0 0 0 1px rgba(0, 0, 0, 0.05)',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    none: 'none'
  },
  
  // 过渡
  transitions: {
    duration: {
      fast: '150ms',
      base: '300ms',
      slow: '500ms'
    },
    timing: {
      ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)'
    }
  },
  
  // 断点
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
  }
};
```

### 2. 主题实现

```jsx
// theme.js
import { tokens } from './tokens';

// 创建主题
export const createTheme = (mode = 'light') => {
  const isDark = mode === 'dark';
  
  return {
    mode,
    ...tokens,
    
    // 覆盖语义颜色
    colors: {
      ...tokens.colors,
      background: {
        primary: isDark ? tokens.colors.gray[900] : tokens.colors.gray[50],
        secondary: isDark ? tokens.colors.gray[800] : tokens.colors.gray[100],
        tertiary: isDark ? tokens.colors.gray[700] : tokens.colors.gray[200]
      },
      text: {
        primary: isDark ? tokens.colors.gray[50] : tokens.colors.gray[900],
        secondary: isDark ? tokens.colors.gray[200] : tokens.colors.gray[700],
        tertiary: isDark ? tokens.colors.gray[400] : tokens.colors.gray[500]
      },
      border: {
        light: isDark ? tokens.colors.gray[700] : tokens.colors.gray[200],
        medium: isDark ? tokens.colors.gray[600] : tokens.colors.gray[300],
        heavy: isDark ? tokens.colors.gray[500] : tokens.colors.gray[400]
      }
    }
  };
};

// ThemeProvider组件
import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState(() => {
    // 从localStorage读取主题偏好
    const saved = localStorage.getItem('theme-mode');
    return saved || 'light';
  });
  
  const theme = createTheme(mode);
  
  const toggleTheme = () => {
    setMode(prev => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme-mode', next);
      return next;
    });
  };
  
  // 同步系统主题
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e) => {
      if (!localStorage.getItem('theme-mode')) {
        setMode(e.matches ? 'dark' : 'light');
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
  
  // 应用主题到根元素
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode);
  }, [mode]);
  
  return (
    <ThemeContext.Provider value={{ theme, mode, toggleTheme }}>
      <ThemeProvider theme={theme}>
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};
```

### 3. 样式工具函数

```jsx
// styleUtils.js
import { css } from 'styled-components';

// 响应式断点
export const media = {
  mobile: (styles) => css`
    @media (min-width: ${props => props.theme.breakpoints.sm}) {
      ${styles}
    }
  `,
  tablet: (styles) => css`
    @media (min-width: ${props => props.theme.breakpoints.md}) {
      ${styles}
    }
  `,
  desktop: (styles) => css`
    @media (min-width: ${props => props.theme.breakpoints.lg}) {
      ${styles}
    }
  `,
  wide: (styles) => css`
    @media (min-width: ${props => props.theme.breakpoints.xl}) {
      ${styles}
    }
  `
};

// 截断文本
export const truncate = (lines = 1) => css`
  display: -webkit-box;
  -webkit-line-clamp: ${lines};
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
`;

// 绝对定位
export const absolute = (top, right, bottom, left) => css`
  position: absolute;
  ${top !== undefined && `top: ${top};`}
  ${right !== undefined && `right: ${right};`}
  ${bottom !== undefined && `bottom: ${bottom};`}
  ${left !== undefined && `left: ${left};`}
`;

// Flex布局
export const flex = ({
  direction = 'row',
  justify = 'flex-start',
  align = 'stretch',
  wrap = 'nowrap',
  gap
}) => css`
  display: flex;
  flex-direction: ${direction};
  justify-content: ${justify};
  align-items: ${align};
  flex-wrap: ${wrap};
  ${gap && `gap: ${gap};`}
`;

// Grid布局
export const grid = ({
  columns = 'auto',
  rows = 'auto',
  gap,
  columnGap,
  rowGap,
  areas
}) => css`
  display: grid;
  grid-template-columns: ${columns};
  grid-template-rows: ${rows};
  ${gap && `gap: ${gap};`}
  ${columnGap && `column-gap: ${columnGap};`}
  ${rowGap && `row-gap: ${rowGap};`}
  ${areas && `grid-template-areas: ${areas};`}
`;

// 动画
export const animate = (animation, duration = '0.3s', timing = 'ease') => css`
  animation: ${animation} ${duration} ${timing};
`;

// 渐变
export const gradient = (direction, ...colors) => css`
  background: linear-gradient(${direction}, ${colors.join(', ')});
`;
```

## 🎯 响应式设计系统

### 1. 响应式组件

```jsx
// ResponsiveBox.jsx
const ResponsiveBox = styled.div`
  /* 移动优先设计 */
  padding: ${props => props.theme.spacing[4]};
  background: ${props => props.theme.colors.background.primary};
  
  /* 平板断点 */
  ${props => props.theme.media.tablet`
    padding: ${props.theme.spacing[6]};
  `}
  
  /* 桌面断点 */
  ${props => props.theme.media.desktop`
    padding: ${props.theme.spacing[8]};
    max-width: 1200px;
    margin: 0 auto;
  `}
`;

// 响应式Grid
const Grid = styled.div`
  display: grid;
  gap: ${props => props.theme.spacing[4]};
  
  /* 默认单列 */
  grid-template-columns: 1fr;
  
  /* 平板: 两列 */
  @media (min-width: ${props => props.theme.breakpoints.md}) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  /* 桌面: 三列 */
  @media (min-width: ${props => props.theme.breakpoints.lg}) {
    grid-template-columns: repeat(3, 1fr);
  }
  
  /* 宽屏: 四列 */
  @media (min-width: ${props => props.theme.breakpoints.xl}) {
    grid-template-columns: repeat(4, 1fr);
  }
`;

// 响应式Typography
const Heading = styled.h1`
  font-size: ${props => props.theme.typography.fontSize['2xl']};
  line-height: ${props => props.theme.typography.lineHeight.tight};
  
  @media (min-width: ${props => props.theme.breakpoints.md}) {
    font-size: ${props => props.theme.typography.fontSize['3xl']};
  }
  
  @media (min-width: ${props => props.theme.breakpoints.lg}) {
    font-size: ${props => props.theme.typography.fontSize['4xl']};
  }
`;
```

### 2. 容器查询

```jsx
// 使用Container Queries (新特性)
const Card = styled.div`
  container-type: inline-size;
  container-name: card;
`;

const CardContent = styled.div`
  padding: 1rem;
  
  @container card (min-width: 400px) {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 1rem;
  }
  
  @container card (min-width: 600px) {
    grid-template-columns: 1fr 3fr;
    padding: 2rem;
  }
`;

// Polyfill支持
import 'container-query-polyfill';
```

## 💼 实战项目：设计系统

### 完整的组件库实现

```jsx
// components/Button/Button.styled.js
import styled, { css } from 'styled-components';

const sizes = {
  small: css`
    padding: ${props => props.theme.spacing[2]} ${props => props.theme.spacing[3]};
    font-size: ${props => props.theme.typography.fontSize.sm};
  `,
  medium: css`
    padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[4]};
    font-size: ${props => props.theme.typography.fontSize.base};
  `,
  large: css`
    padding: ${props => props.theme.spacing[4]} ${props => props.theme.spacing[6]};
    font-size: ${props => props.theme.typography.fontSize.lg};
  `
};

const variants = {
  primary: css`
    background: ${props => props.theme.colors.semantic.primary};
    color: white;
    
    &:hover:not(:disabled) {
      background: ${props => props.theme.colors.blue[600]};
    }
    
    &:active:not(:disabled) {
      background: ${props => props.theme.colors.blue[700]};
    }
  `,
  secondary: css`
    background: ${props => props.theme.colors.gray[200]};
    color: ${props => props.theme.colors.text.primary};
    
    &:hover:not(:disabled) {
      background: ${props => props.theme.colors.gray[300]};
    }
  `,
  outline: css`
    background: transparent;
    color: ${props => props.theme.colors.semantic.primary};
    border: 2px solid ${props => props.theme.colors.semantic.primary};
    
    &:hover:not(:disabled) {
      background: ${props => props.theme.colors.blue[50]};
    }
  `,
  ghost: css`
    background: transparent;
    color: ${props => props.theme.colors.text.primary};
    
    &:hover:not(:disabled) {
      background: ${props => props.theme.colors.gray[100]};
    }
  `,
  danger: css`
    background: ${props => props.theme.colors.semantic.error};
    color: white;
    
    &:hover:not(:disabled) {
      background: ${props => props.theme.colors.red[700]};
    }
  `
};

export const StyledButton = styled.button`
  /* 基础样式 */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing[2]};
  
  border: none;
  border-radius: ${props => props.theme.borderRadius.md};
  font-family: ${props => props.theme.typography.fontFamily.sans};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  line-height: ${props => props.theme.typography.lineHeight.normal};
  
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
  text-decoration: none;
  
  transition: all ${props => props.theme.transitions.duration.fast} ${props => props.theme.transitions.timing.ease};
  
  /* 大小变体 */
  ${props => sizes[props.size || 'medium']}
  
  /* 样式变体 */
  ${props => variants[props.variant || 'primary']}
  
  /* 全宽 */
  ${props => props.fullWidth && css`
    width: 100%;
  `}
  
  /* 圆角 */
  ${props => props.rounded && css`
    border-radius: ${props.theme.borderRadius.full};
  `}
  
  /* 加载状态 */
  ${props => props.loading && css`
    color: transparent;
    pointer-events: none;
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      width: 1em;
      height: 1em;
      top: 50%;
      left: 50%;
      margin-left: -0.5em;
      margin-top: -0.5em;
      border: 2px solid currentColor;
      border-radius: 50%;
      border-top-color: transparent;
      animation: spin 0.6s linear infinite;
    }
  `}
  
  /* 禁用状态 */
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  /* 焦点样式 */
  &:focus-visible {
    outline: 2px solid ${props => props.theme.colors.semantic.primary};
    outline-offset: 2px;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

// components/Button/Button.jsx
import { StyledButton } from './Button.styled';

export const Button = ({
  children,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  fullWidth = false,
  rounded = false,
  leftIcon,
  rightIcon,
  as,
  ...props
}) => {
  return (
    <StyledButton
      variant={variant}
      size={size}
      loading={loading}
      disabled={disabled || loading}
      fullWidth={fullWidth}
      rounded={rounded}
      as={as}
      {...props}
    >
      {leftIcon && <span className="button-icon">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="button-icon">{rightIcon}</span>}
    </StyledButton>
  );
};

// 使用示例
function App() {
  return (
    <>
      <Button>默认按钮</Button>
      <Button variant="secondary">次要按钮</Button>
      <Button variant="outline" size="large">轮廓按钮</Button>
      <Button variant="ghost" rounded>幽灵按钮</Button>
      <Button variant="danger" loading>删除</Button>
      <Button fullWidth leftIcon={<SaveIcon />}>
        保存更改
      </Button>
    </>
  );
}
```

### 高级样式模式

```jsx
// 复合组件样式
const Card = styled.div`
  background: ${props => props.theme.colors.background.secondary};
  border-radius: ${props => props.theme.borderRadius.lg};
  overflow: hidden;
  box-shadow: ${props => props.theme.shadows.base};
  transition: all ${props => props.theme.transitions.duration.base} ${props => props.theme.transitions.timing.ease};
  
  &:hover {
    box-shadow: ${props => props.theme.shadows.md};
    transform: translateY(-2px);
  }
`;

const CardHeader = styled.div`
  padding: ${props => props.theme.spacing[4]};
  border-bottom: 1px solid ${props => props.theme.colors.border.light};
`;

const CardBody = styled.div`
  padding: ${props => props.theme.spacing[4]};
`;

const CardFooter = styled.div`
  padding: ${props => props.theme.spacing[4]};
  border-top: 1px solid ${props => props.theme.colors.border.light};
  background: ${props => props.theme.colors.background.tertiary};
`;

// 使用CSS Grid的复杂布局
const Dashboard = styled.div`
  display: grid;
  gap: ${props => props.theme.spacing[6]};
  padding: ${props => props.theme.spacing[6]};
  
  grid-template-columns: 1fr;
  
  @media (min-width: ${props => props.theme.breakpoints.md}) {
    grid-template-columns: 250px 1fr;
    grid-template-areas:
      "sidebar header"
      "sidebar main";
  }
  
  @media (min-width: ${props => props.theme.breakpoints.lg}) {
    grid-template-columns: 250px 1fr 300px;
    grid-template-areas:
      "sidebar header header"
      "sidebar main aside";
  }
`;

const Sidebar = styled.aside`
  grid-area: sidebar;
  background: ${props => props.theme.colors.background.secondary};
  padding: ${props => props.theme.spacing[4]};
  border-radius: ${props => props.theme.borderRadius.lg};
`;

const Header = styled.header`
  grid-area: header;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${props => props.theme.spacing[4]};
  background: ${props => props.theme.colors.background.primary};
  border-radius: ${props => props.theme.borderRadius.lg};
`;

const Main = styled.main`
  grid-area: main;
  min-height: 0;
`;

const Aside = styled.aside`
  grid-area: aside;
  display: none;
  
  @media (min-width: ${props => props.theme.breakpoints.lg}) {
    display: block;
  }
`;

// 动态样式生成
const createVariantStyles = (variants) => {
  return Object.entries(variants).reduce((acc, [key, value]) => {
    acc[key] = css`${value}`;
    return acc;
  }, {});
};

// 性能优化的动画组件
const AnimatedBox = styled.div`
  will-change: transform;
  transform: translateZ(0); /* 开启硬件加速 */
  
  ${props => props.animate && css`
    animation: ${props.animation} ${props.duration || '0.3s'} ${props.timing || 'ease'};
  `}
`;
```

## 🎯 今日练习

1. **基础练习**：使用styled-components创建一个完整的表单组件系统
2. **进阶练习**：实现一个支持多主题切换的应用，包含亮色、暗色和高对比度主题
3. **挑战练习**：构建一个响应式的仪表板布局，使用CSS Grid和styled-components

## 🚀 下一步

明天我们将学习：
- 状态管理进阶（Context API深入）
- Redux和Redux Toolkit
- Zustand和其他状态管理方案
- 状态管理最佳实践
- 性能优化策略

## 💭 思考题

1. CSS-in-JS相比传统CSS有哪些优势？什么场景下传统CSS更合适？
2. 如何在styled-components中实现高效的主题切换？
3. CSS Modules和CSS-in-JS各自的使用场景是什么？
4. 如何设计一个可扩展的设计令牌系统？
5. 在大型应用中，如何组织和管理样式代码？

记住：**样式系统是用户体验的基础。一个well-designed的样式系统不仅能提升开发效率，还能确保视觉一致性和可维护性！**