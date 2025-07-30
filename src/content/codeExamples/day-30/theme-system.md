---
day: 30
title: "主题系统设计实战"
description: "构建灵活可扩展的主题系统，支持多主题切换、CSS变量和设计令牌"
category: "advanced"
language: "javascript"
---

# 主题系统设计实战

## 设计令牌（Design Tokens）

### 1. 基础设计令牌定义

```javascript
// tokens.js - 设计令牌系统
export const tokens = {
  // 颜色系统
  colors: {
    // 基础色板
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
    green: {
      50: '#e8f5e9',
      100: '#c8e6c9',
      200: '#a5d6a7',
      300: '#81c784',
      400: '#66bb6a',
      500: '#4caf50',
      600: '#43a047',
      700: '#388e3c',
      800: '#2e7d32',
      900: '#1b5e20'
    },
    red: {
      50: '#ffebee',
      100: '#ffcdd2',
      200: '#ef9a9a',
      300: '#e57373',
      400: '#ef5350',
      500: '#f44336',
      600: '#e53935',
      700: '#d32f2f',
      800: '#c62828',
      900: '#b71c1c'
    },
    // 语义颜色
    semantic: {
      primary: '#2196f3',
      secondary: '#9e9e9e',
      success: '#4caf50',
      warning: '#ff9800',
      error: '#f44336',
      info: '#00bcd4'
    }
  },
  
  // 排版系统
  typography: {
    // 字体家族
    fontFamily: {
      sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      serif: 'Georgia, Cambria, "Times New Roman", Times, serif',
      mono: 'Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
    },
    // 字体大小
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem',// 30px
      '4xl': '2.25rem', // 36px
      '5xl': '3rem'     // 48px
    },
    // 字重
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    },
    // 行高
    lineHeight: {
      none: 1,
      tight: 1.25,
      snug: 1.375,
      normal: 1.5,
      relaxed: 1.625,
      loose: 2
    }
  },
  
  // 间距系统
  spacing: {
    0: '0',
    1: '0.25rem',   // 4px
    2: '0.5rem',    // 8px
    3: '0.75rem',   // 12px
    4: '1rem',      // 16px
    5: '1.25rem',   // 20px
    6: '1.5rem',    // 24px
    8: '2rem',      // 32px
    10: '2.5rem',   // 40px
    12: '3rem',     // 48px
    16: '4rem',     // 64px
    20: '5rem',     // 80px
    24: '6rem'      // 96px
  },
  
  // 边框半径
  borderRadius: {
    none: '0',
    sm: '0.125rem',  // 2px
    base: '0.25rem', // 4px
    md: '0.375rem',  // 6px
    lg: '0.5rem',    // 8px
    xl: '0.75rem',   // 12px
    '2xl': '1rem',   // 16px
    '3xl': '1.5rem', // 24px
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
  
  // 过渡动画
  transitions: {
    duration: {
      fast: '150ms',
      base: '300ms',
      slow: '500ms',
      slower: '750ms'
    },
    timing: {
      ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      linear: 'linear'
    }
  },
  
  // 断点
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
  },
  
  // Z-index层级
  zIndex: {
    0: 0,
    10: 10,
    20: 20,
    30: 30,
    40: 40,
    50: 50,
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070
  }
};
```

### 2. 主题创建函数

```javascript
// themes.js - 主题定义
import { tokens } from './tokens';

// 创建主题的工厂函数
export const createTheme = (mode = 'light') => {
  const isDark = mode === 'dark';
  
  return {
    mode,
    // 继承所有设计令牌
    ...tokens,
    
    // 覆盖特定于主题的颜色
    colors: {
      ...tokens.colors,
      // 背景色
      background: {
        primary: isDark ? tokens.colors.gray[900] : tokens.colors.gray[50],
        secondary: isDark ? tokens.colors.gray[800] : tokens.colors.gray[100],
        tertiary: isDark ? tokens.colors.gray[700] : tokens.colors.gray[200],
        paper: isDark ? tokens.colors.gray[800] : '#ffffff',
        default: isDark ? tokens.colors.gray[900] : '#ffffff'
      },
      // 文本颜色
      text: {
        primary: isDark ? tokens.colors.gray[50] : tokens.colors.gray[900],
        secondary: isDark ? tokens.colors.gray[200] : tokens.colors.gray[700],
        tertiary: isDark ? tokens.colors.gray[400] : tokens.colors.gray[500],
        disabled: isDark ? tokens.colors.gray[600] : tokens.colors.gray[400],
        inverse: isDark ? tokens.colors.gray[900] : tokens.colors.gray[50]
      },
      // 边框颜色
      border: {
        primary: isDark ? tokens.colors.gray[700] : tokens.colors.gray[300],
        secondary: isDark ? tokens.colors.gray[600] : tokens.colors.gray[200],
        focus: tokens.colors.blue[500]
      },
      // 语义颜色（可能需要在暗色主题中调整）
      semantic: {
        ...tokens.colors.semantic,
        primary: isDark ? tokens.colors.blue[400] : tokens.colors.blue[600],
        error: isDark ? tokens.colors.red[400] : tokens.colors.red[600],
        warning: isDark ? tokens.colors.orange[400] : tokens.colors.orange[600],
        success: isDark ? tokens.colors.green[400] : tokens.colors.green[600]
      }
    },
    
    // 特定于主题的阴影
    shadows: {
      ...tokens.shadows,
      // 暗色主题中的阴影可能需要不同的处理
      ...(isDark && {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.4)',
        base: '0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px 0 rgba(0, 0, 0, 0.3)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3)'
      })
    }
  };
};

// 预定义主题
export const lightTheme = createTheme('light');
export const darkTheme = createTheme('dark');

// 高对比度主题
export const highContrastTheme = {
  ...darkTheme,
  colors: {
    ...darkTheme.colors,
    background: {
      primary: '#000000',
      secondary: '#1a1a1a',
      tertiary: '#2a2a2a',
      paper: '#0a0a0a',
      default: '#000000'
    },
    text: {
      primary: '#ffffff',
      secondary: '#f0f0f0',
      tertiary: '#e0e0e0',
      disabled: '#808080',
      inverse: '#000000'
    },
    border: {
      primary: '#ffffff',
      secondary: '#808080',
      focus: '#ffff00'
    }
  }
};
```

## React主题系统实现

### 1. 主题Context和Provider

```jsx
// ThemeContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { lightTheme, darkTheme, highContrastTheme } from './themes';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme必须在ThemeProvider内部使用');
  }
  return context;
};

export const ThemeProvider = ({ children, defaultTheme = 'light' }) => {
  const [themeName, setThemeName] = useState(() => {
    // 从localStorage读取保存的主题
    const saved = localStorage.getItem('app-theme');
    return saved || defaultTheme;
  });
  
  // 获取对应的主题对象
  const getTheme = (name) => {
    switch (name) {
      case 'dark':
        return darkTheme;
      case 'high-contrast':
        return highContrastTheme;
      default:
        return lightTheme;
    }
  };
  
  const [theme, setTheme] = useState(() => getTheme(themeName));
  
  // 切换主题
  const changeTheme = (newThemeName) => {
    setThemeName(newThemeName);
    const newTheme = getTheme(newThemeName);
    setTheme(newTheme);
    localStorage.setItem('app-theme', newThemeName);
    
    // 更新document属性，便于CSS使用
    document.documentElement.setAttribute('data-theme', newThemeName);
    
    // 更新meta主题色
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.content = newTheme.colors.background.primary;
    }
  };
  
  // 监听系统主题变化
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e) => {
      // 如果用户没有手动设置主题，则跟随系统
      if (!localStorage.getItem('app-theme')) {
        changeTheme(e.matches ? 'dark' : 'light');
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
  
  // 初始化
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeName);
    
    // 应用CSS变量
    const root = document.documentElement;
    
    // 颜色变量
    Object.entries(theme.colors.background).forEach(([key, value]) => {
      root.style.setProperty(`--color-bg-${key}`, value);
    });
    
    Object.entries(theme.colors.text).forEach(([key, value]) => {
      root.style.setProperty(`--color-text-${key}`, value);
    });
    
    Object.entries(theme.colors.semantic).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
    
    // 间距变量
    Object.entries(theme.spacing).forEach(([key, value]) => {
      root.style.setProperty(`--spacing-${key}`, value);
    });
    
    // 字体大小变量
    Object.entries(theme.typography.fontSize).forEach(([key, value]) => {
      root.style.setProperty(`--font-size-${key}`, value);
    });
    
    // 边框半径变量
    Object.entries(theme.borderRadius).forEach(([key, value]) => {
      root.style.setProperty(`--radius-${key}`, value);
    });
  }, [theme, themeName]);
  
  const value = {
    theme,
    themeName,
    changeTheme,
    isDark: themeName === 'dark',
    isHighContrast: themeName === 'high-contrast'
  };
  
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
```

### 2. 主题切换组件

```jsx
// ThemeToggle.jsx
import { useTheme } from './ThemeContext';
import styles from './ThemeToggle.module.css';

function ThemeToggle() {
  const { themeName, changeTheme } = useTheme();
  
  const themes = [
    { value: 'light', label: '浅色', icon: '☀️' },
    { value: 'dark', label: '深色', icon: '🌙' },
    { value: 'high-contrast', label: '高对比度', icon: '⚡' }
  ];
  
  return (
    <div className={styles.themeToggle}>
      {themes.map(({ value, label, icon }) => (
        <button
          key={value}
          className={`${styles.themeButton} ${
            themeName === value ? styles.active : ''
          }`}
          onClick={() => changeTheme(value)}
          aria-label={`切换到${label}主题`}
        >
          <span className={styles.icon}>{icon}</span>
          <span className={styles.label}>{label}</span>
        </button>
      ))}
    </div>
  );
}

// 简单的开关式主题切换
function SimpleThemeToggle() {
  const { isDark, changeTheme } = useTheme();
  
  return (
    <button
      className={styles.simpleToggle}
      onClick={() => changeTheme(isDark ? 'light' : 'dark')}
      aria-label="切换主题"
    >
      <span className={styles.toggleIcon}>
        {isDark ? '🌙' : '☀️'}
      </span>
    </button>
  );
}
```

## 在styled-components中使用主题

```jsx
// 使用styled-components的主题系统
import styled, { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { useTheme } from './ThemeContext';

// 全局样式
const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  
  body {
    font-family: ${props => props.theme.typography.fontFamily.sans};
    font-size: ${props => props.theme.typography.fontSize.base};
    line-height: ${props => props.theme.typography.lineHeight.normal};
    color: ${props => props.theme.colors.text.primary};
    background-color: ${props => props.theme.colors.background.default};
    transition: background-color ${props => props.theme.transitions.duration.base} ${props => props.theme.transitions.timing.ease},
                color ${props => props.theme.transitions.duration.base} ${props => props.theme.transitions.timing.ease};
  }
  
  /* 使用CSS变量作为后备 */
  :root {
    --color-primary: ${props => props.theme.colors.semantic.primary};
    --color-text-primary: ${props => props.theme.colors.text.primary};
    --color-bg-primary: ${props => props.theme.colors.background.primary};
  }
`;

// 主题化组件
const Card = styled.div`
  background-color: ${props => props.theme.colors.background.paper};
  color: ${props => props.theme.colors.text.primary};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing[6]};
  box-shadow: ${props => props.theme.shadows.md};
  transition: all ${props => props.theme.transitions.duration.base} ${props => props.theme.transitions.timing.ease};
  
  &:hover {
    box-shadow: ${props => props.theme.shadows.lg};
    transform: translateY(-2px);
  }
`;

const Button = styled.button`
  /* 基础样式 */
  padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[6]};
  font-size: ${props => props.theme.typography.fontSize.base};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  border-radius: ${props => props.theme.borderRadius.md};
  border: none;
  cursor: pointer;
  transition: all ${props => props.theme.transitions.duration.fast} ${props => props.theme.transitions.timing.ease};
  
  /* 变体样式 */
  ${props => props.variant === 'primary' && `
    background-color: ${props.theme.colors.semantic.primary};
    color: white;
    
    &:hover {
      background-color: ${props.theme.colors.blue[700]};
    }
    
    &:active {
      background-color: ${props.theme.colors.blue[800]};
    }
  `}
  
  ${props => props.variant === 'outline' && `
    background-color: transparent;
    color: ${props.theme.colors.semantic.primary};
    border: 2px solid ${props.theme.colors.semantic.primary};
    
    &:hover {
      background-color: ${props.theme.colors.semantic.primary};
      color: white;
    }
  `}
  
  /* 尺寸变体 */
  ${props => props.size === 'small' && `
    padding: ${props.theme.spacing[2]} ${props.theme.spacing[4]};
    font-size: ${props.theme.typography.fontSize.sm};
  `}
  
  ${props => props.size === 'large' && `
    padding: ${props.theme.spacing[4]} ${props.theme.spacing[8]};
    font-size: ${props.theme.typography.fontSize.lg};
  `}
`;

// 应用组件
function App() {
  const { theme } = useTheme();
  
  return (
    <StyledThemeProvider theme={theme}>
      <GlobalStyle />
      <Container>
        <Card>
          <h1>主题化应用</h1>
          <p>这是一个支持多主题的应用示例</p>
          <Button variant="primary" size="large">
            主要按钮
          </Button>
          <Button variant="outline">
            轮廓按钮
          </Button>
        </Card>
      </Container>
    </StyledThemeProvider>
  );
}
```

## CSS变量主题系统

```css
/* theme.css */
/* 浅色主题（默认） */
:root {
  /* 颜色 */
  --color-primary: #2196f3;
  --color-secondary: #9e9e9e;
  --color-success: #4caf50;
  --color-warning: #ff9800;
  --color-error: #f44336;
  
  /* 背景 */
  --color-bg-primary: #fafafa;
  --color-bg-secondary: #f5f5f5;
  --color-bg-paper: #ffffff;
  
  /* 文本 */
  --color-text-primary: #212121;
  --color-text-secondary: #757575;
  --color-text-disabled: #bdbdbd;
  
  /* 边框 */
  --color-border: #e0e0e0;
  
  /* 间距 */
  --spacing-unit: 8px;
  
  /* 阴影 */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

/* 深色主题 */
[data-theme="dark"] {
  --color-primary: #42a5f5;
  --color-secondary: #bdbdbd;
  --color-success: #66bb6a;
  --color-warning: #ffa726;
  --color-error: #ef5350;
  
  --color-bg-primary: #212121;
  --color-bg-secondary: #424242;
  --color-bg-paper: #1e1e1e;
  
  --color-text-primary: #fafafa;
  --color-text-secondary: #bdbdbd;
  --color-text-disabled: #757575;
  
  --color-border: #616161;
  
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.4);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.4);
}

/* 高对比度主题 */
[data-theme="high-contrast"] {
  --color-primary: #ffffff;
  --color-secondary: #ffffff;
  --color-success: #00ff00;
  --color-warning: #ffff00;
  --color-error: #ff0000;
  
  --color-bg-primary: #000000;
  --color-bg-secondary: #1a1a1a;
  --color-bg-paper: #000000;
  
  --color-text-primary: #ffffff;
  --color-text-secondary: #f0f0f0;
  --color-text-disabled: #808080;
  
  --color-border: #ffffff;
}

/* 使用CSS变量的组件 */
.card {
  background-color: var(--color-bg-paper);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: calc(var(--spacing-unit) * 3);
  box-shadow: var(--shadow-md);
  transition: all 0.3s ease;
}

.button {
  background-color: var(--color-primary);
  color: white;
  border: none;
  padding: calc(var(--spacing-unit) * 1.5) calc(var(--spacing-unit) * 3);
  border-radius: 4px;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.button:hover {
  opacity: 0.9;
}
```

## 实际应用示例

### 完整的主题化仪表板

```jsx
// Dashboard.jsx
import { useTheme } from './ThemeContext';
import styled from 'styled-components';

const DashboardContainer = styled.div`
  min-height: 100vh;
  background-color: ${props => props.theme.colors.background.primary};
  display: grid;
  grid-template-columns: 250px 1fr;
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    grid-template-columns: 1fr;
  }
`;

const Sidebar = styled.aside`
  background-color: ${props => props.theme.colors.background.secondary};
  border-right: 1px solid ${props => props.theme.colors.border.primary};
  padding: ${props => props.theme.spacing[6]};
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    display: none;
  }
`;

const MainContent = styled.main`
  padding: ${props => props.theme.spacing[8]};
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    padding: ${props => props.theme.spacing[4]};
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${props => props.theme.spacing[6]};
  margin-bottom: ${props => props.theme.spacing[8]};
`;

const StatCard = styled.div`
  background-color: ${props => props.theme.colors.background.paper};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing[6]};
  box-shadow: ${props => props.theme.shadows.sm};
  
  h3 {
    font-size: ${props => props.theme.typography.fontSize.sm};
    font-weight: ${props => props.theme.typography.fontWeight.medium};
    color: ${props => props.theme.colors.text.secondary};
    margin-bottom: ${props => props.theme.spacing[2]};
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  
  .value {
    font-size: ${props => props.theme.typography.fontSize['3xl']};
    font-weight: ${props => props.theme.typography.fontWeight.bold};
    color: ${props => props.theme.colors.text.primary};
    margin-bottom: ${props => props.theme.spacing[1]};
  }
  
  .change {
    font-size: ${props => props.theme.typography.fontSize.sm};
    color: ${props => props.positive 
      ? props.theme.colors.semantic.success 
      : props.theme.colors.semantic.error};
  }
`;

function Dashboard() {
  const { theme, themeName } = useTheme();
  
  const stats = [
    { title: '总用户', value: '12,543', change: '+12%', positive: true },
    { title: '活跃用户', value: '8,721', change: '+5%', positive: true },
    { title: '收入', value: '¥89,543', change: '-3%', positive: false },
    { title: '转化率', value: '3.2%', change: '+0.5%', positive: true }
  ];
  
  return (
    <DashboardContainer>
      <Sidebar>
        <h2>仪表板</h2>
        <nav>
          {/* 导航菜单 */}
        </nav>
      </Sidebar>
      
      <MainContent>
        <h1>数据概览</h1>
        <p>当前主题：{themeName}</p>
        
        <StatsGrid>
          {stats.map((stat, index) => (
            <StatCard key={index} positive={stat.positive}>
              <h3>{stat.title}</h3>
              <div className="value">{stat.value}</div>
              <div className="change">{stat.change}</div>
            </StatCard>
          ))}
        </StatsGrid>
        
        {/* 其他仪表板内容 */}
      </MainContent>
    </DashboardContainer>
  );
}
```

这个主题系统设计提供了一个完整的、可扩展的解决方案，支持多主题切换、设计令牌、CSS变量集成等现代化特性。