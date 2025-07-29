---
day: 30
title: "CSS-in-JS与样式系统练习"
description: "通过实际项目掌握styled-components、主题系统、响应式设计等现代React样式解决方案"
difficulty: "intermediate"
estimatedTime: 180
requirements:
  - "主题切换系统"
  - "响应式组件库"
  - "设计系统仪表板"
---

# Day 30: CSS-in-JS与样式系统练习

## 🎯 练习目标

今天的练习将帮助你掌握现代React样式解决方案。通过构建实际的项目，你将学会如何使用CSS-in-JS创建可维护、可扩展的样式系统，实现主题切换、响应式设计等高级功能。

## 📝 练习说明

### 练习 1：主题切换系统

创建一个功能完整的主题系统，要求实现：

**设计令牌结构**：
```javascript
const tokens = {
  colors: {
    // 基础色板
    primary: { /* 50-900 */ },
    gray: { /* 50-900 */ },
    // 语义颜色
    background: {},
    text: {},
    border: {}
  },
  spacing: { /* xs-3xl */ },
  typography: { /* 字体系统 */ },
  shadows: { /* 阴影系统 */ },
  transitions: { /* 动画系统 */ }
};
```

**核心功能要求**：
- 主题上下文和Provider实现
- 主题切换UI组件
- 实时预览效果
- 主题编辑器（调整主色调）
- 导出主题配置

### 练习 2：响应式组件库

构建一套专业的UI组件库，包含：

**组件清单**：
1. **Button组件**
   - 变体：primary, secondary, outline, ghost, danger
   - 大小：small, medium, large
   - 状态：loading, disabled
   - 特性：图标支持、全宽选项

2. **Input组件系统**
   - 类型：text, password, email, number
   - 变体：outline, filled, flushed
   - 特性：前后缀、清除按钮、字符计数

3. **Card组件**
   - 布局：垂直、水平
   - 特性：可点击、阴影效果、动画

4. **Modal组件**
   - 大小：small, medium, large, full
   - 动画：淡入淡出、滑入
   - 特性：关闭按钮、遮罩点击关闭

**响应式要求**：
- 移动优先设计
- 断点系统：mobile, tablet, desktop, wide
- 容器查询支持
- 触摸友好的交互

### 练习 3：设计系统仪表板

创建一个交互式的设计系统展示平台：

**页面结构**：
```
/                      # 概览页面
/colors               # 颜色系统
/typography           # 排版系统
/spacing              # 间距系统
/components           # 组件展示
/components/:name     # 单个组件详情
/playground           # 实时编辑器
/themes               # 主题管理
```

**功能要求**：
- 组件实时预览和交互
- 属性面板（调整props）
- 代码生成和复制
- 主题实时编辑
- 响应式预览（手机/平板/桌面）
- 搜索和筛选功能

## 💡 实现提示

### styled-components技巧

```jsx
// 创建可复用的样式mixins
export const flexCenter = css`
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const visuallyHidden = css`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`;

// 响应式工具
export const media = {
  mobile: (...args) => css`
    @media (min-width: 640px) {
      ${css(...args)}
    }
  `,
  tablet: (...args) => css`
    @media (min-width: 768px) {
      ${css(...args)}
    }
  `
};

// 主题类型定义
interface Theme {
  colors: ColorSystem;
  spacing: SpacingScale;
  typography: TypographySystem;
  // ...
}
```

### 性能优化

```jsx
// 1. 使用attrs减少重新渲染
const Input = styled.input.attrs(props => ({
  type: props.type || 'text',
  'aria-invalid': props.error ? 'true' : 'false'
}))`
  /* 样式 */
`;

// 2. 避免在渲染中创建组件
// ❌ 不好
function Component() {
  const StyledDiv = styled.div`...`;
  return <StyledDiv />;
}

// ✅ 好
const StyledDiv = styled.div`...`;
function Component() {
  return <StyledDiv />;
}

// 3. 使用CSS变量优化主题切换
const GlobalStyle = createGlobalStyle`
  :root {
    --color-primary: ${props => props.theme.colors.primary};
    --transition-theme: color 0.3s ease, background-color 0.3s ease;
  }
  
  * {
    transition: var(--transition-theme);
  }
`;
```

### 组件组织结构

```
src/
  components/
    Button/
      Button.jsx          # 组件逻辑
      Button.styled.js    # 样式定义
      Button.types.ts     # 类型定义
      Button.stories.js   # Storybook故事
      Button.test.js      # 单元测试
      index.js           # 导出
    
  styles/
    theme/
      tokens.js          # 设计令牌
      lightTheme.js      # 亮色主题
      darkTheme.js       # 暗色主题
    
    utils/
      media.js           # 响应式工具
      mixins.js          # 样式mixins
      animations.js      # 动画定义
```

## 🎨 样式建议

为你的组件库添加专业的视觉效果：

```css
/* 微交互动画 */
@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(33, 150, 243, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(33, 150, 243, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(33, 150, 243, 0);
  }
}

/* 骨架屏加载效果 */
@keyframes skeleton {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.skeleton {
  background: linear-gradient(
    90deg,
    #f0f0f0 25%,
    #e0e0e0 50%,
    #f0f0f0 75%
  );
  background-size: 200% 100%;
  animation: skeleton 1.5s ease-in-out infinite;
}
```

## 🚀 扩展挑战

如果你完成了基础练习，可以尝试以下扩展：

1. **高级主题功能**：
   - 实现主题生成器（基于主色自动生成）
   - 添加色盲模式支持
   - 创建主题市场功能

2. **性能优化**：
   - 实现CSS-in-JS的服务端渲染
   - 添加关键CSS提取
   - 实现样式代码分割

3. **开发工具**：
   - 创建VSCode插件支持
   - 实现设计令牌自动同步
   - 添加Figma集成

## 📤 提交要求

完成练习后，请确保你的代码包含：

1. 完整的样式系统实现
2. 主题切换功能演示
3. 响应式组件示例
4. 组件使用文档
5. 性能优化说明

创建一个README文件，说明：
- 样式系统的设计理念
- 主题系统的使用方法
- 组件库的使用示例
- 性能考虑和优化措施

祝你编码愉快！🎉