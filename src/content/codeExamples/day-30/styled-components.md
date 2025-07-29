---
title: "styled-components完整示例"
description: "使用styled-components创建样式化组件的完整示例"
category: "advanced"
language: "javascript"
---

# styled-components完整示例

## 基础使用

### 1. 创建基础样式组件

```jsx
import styled from 'styled-components';

// 基础按钮组件
const Button = styled.button`
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 500;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

// 标题组件
const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 1.5rem;
  text-align: center;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

// 容器组件
const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;
```

### 2. 动态样式和Props

```jsx
// 带变体的按钮
const StyledButton = styled.button`
  padding: ${props => props.size === 'large' ? '16px 32px' : '12px 24px'};
  font-size: ${props => props.size === 'large' ? '18px' : '16px'};
  background-color: ${props => {
    switch (props.variant) {
      case 'primary':
        return '#007bff';
      case 'danger':
        return '#dc3545';
      case 'success':
        return '#28a745';
      default:
        return '#6c757d';
    }
  }};
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  opacity: ${props => props.disabled ? 0.6 : 1};
  pointer-events: ${props => props.disabled ? 'none' : 'auto'};
  
  &:hover {
    background-color: ${props => {
      switch (props.variant) {
        case 'primary':
          return '#0056b3';
        case 'danger':
          return '#c82333';
        case 'success':
          return '#218838';
        default:
          return '#5a6268';
      }
    }};
  }
`;

// 使用TypeScript定义Props
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
}

const TypedButton = styled.button<ButtonProps>`
  display: ${props => props.fullWidth ? 'block' : 'inline-block'};
  width: ${props => props.fullWidth ? '100%' : 'auto'};
  /* 其他样式... */
`;
```

### 3. 扩展和组合样式

```jsx
// 扩展现有组件
const PrimaryButton = styled(Button)`
  background-color: #007bff;
  color: white;
  
  &:hover {
    background-color: #0056b3;
  }
`;

const IconButton = styled(Button)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

// 使用attrs添加默认属性
const Input = styled.input.attrs(props => ({
  type: props.type || 'text',
  placeholder: props.placeholder || '请输入...'
}))`
  padding: 10px 15px;
  font-size: 16px;
  border: 2px solid #e0e0e0;
  border-radius: 4px;
  outline: none;
  transition: border-color 0.3s;
  
  &:focus {
    border-color: #007bff;
  }
  
  &::placeholder {
    color: #999;
  }
`;
```

## 高级特性

### 1. 主题系统

```jsx
import { ThemeProvider, createGlobalStyle } from 'styled-components';

// 定义主题
const lightTheme = {
  colors: {
    primary: '#007bff',
    secondary: '#6c757d',
    background: '#ffffff',
    text: '#333333',
    border: '#e0e0e0'
  },
  spacing: {
    small: '8px',
    medium: '16px',
    large: '24px'
  },
  breakpoints: {
    mobile: '576px',
    tablet: '768px',
    desktop: '1024px'
  }
};

const darkTheme = {
  ...lightTheme,
  colors: {
    primary: '#0d6efd',
    secondary: '#6c757d',
    background: '#1a1a1a',
    text: '#ffffff',
    border: '#333333'
  }
};

// 全局样式
const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background-color: ${props => props.theme.colors.background};
    color: ${props => props.theme.colors.text};
    line-height: 1.6;
  }
  
  a {
    color: ${props => props.theme.colors.primary};
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

// 使用主题的组件
const ThemedCard = styled.div`
  background-color: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  padding: ${props => props.theme.spacing.large};
  margin-bottom: ${props => props.theme.spacing.medium};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  
  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    padding: ${props => props.theme.spacing.medium};
  }
`;

// 应用主题
function App() {
  const [isDark, setIsDark] = useState(false);
  
  return (
    <ThemeProvider theme={isDark ? darkTheme : lightTheme}>
      <GlobalStyle />
      <Container>
        <ThemedCard>
          <Title>主题化应用</Title>
          <Button onClick={() => setIsDark(!isDark)}>
            切换{isDark ? '浅色' : '深色'}主题
          </Button>
        </ThemedCard>
      </Container>
    </ThemeProvider>
  );
}
```

### 2. 动画和关键帧

```jsx
import styled, { keyframes } from 'styled-components';

// 定义动画
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const pulse = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
`;

// 应用动画的组件
const AnimatedCard = styled.div`
  animation: ${fadeIn} 0.5s ease-out;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: ${rotate} 1s linear infinite;
`;

const PulseButton = styled.button`
  padding: 12px 24px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  
  &:hover {
    animation: ${pulse} 0.5s ease-in-out infinite;
  }
`;
```

### 3. CSS助手函数

```jsx
import { css } from 'styled-components';

// 可复用的CSS片段
const flexCenter = css`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const truncate = css`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const buttonBase = css`
  padding: 12px 24px;
  font-size: 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

// 使用CSS助手
const CenteredBox = styled.div`
  ${flexCenter}
  width: 200px;
  height: 200px;
  background: #f0f0f0;
`;

const TruncatedText = styled.p`
  ${truncate}
  max-width: 300px;
`;

const CustomButton = styled.button`
  ${buttonBase}
  background: ${props => props.primary ? '#007bff' : '#6c757d'};
  color: white;
`;
```

## 实际应用示例

### 完整的卡片组件系统

```jsx
// 卡片组件系统
const Card = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  }
`;

const CardHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
  
  h3 {
    margin: 0;
    font-size: 1.25rem;
    color: #333;
  }
`;

const CardBody = styled.div`
  padding: 20px;
  
  p {
    margin: 0 0 16px;
    color: #666;
    line-height: 1.6;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
`;

const CardFooter = styled.div`
  padding: 16px 20px;
  background: #f8f9fa;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

// 使用卡片组件
function ProductCard({ product }) {
  return (
    <Card>
      <CardHeader>
        <h3>{product.name}</h3>
      </CardHeader>
      <CardBody>
        <p>{product.description}</p>
        <p><strong>价格：</strong>¥{product.price}</p>
      </CardBody>
      <CardFooter>
        <span>库存: {product.stock}</span>
        <PrimaryButton>添加到购物车</PrimaryButton>
      </CardFooter>
    </Card>
  );
}
```

### 响应式网格系统

```jsx
// 响应式网格
const Grid = styled.div`
  display: grid;
  gap: ${props => props.gap || '20px'};
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const GridItem = styled.div`
  grid-column: span ${props => props.span || 1};
  
  @media (max-width: 768px) {
    grid-column: span 1;
  }
`;

// 使用网格系统
function ProductGrid({ products }) {
  return (
    <Grid gap="24px">
      {products.map(product => (
        <GridItem key={product.id}>
          <ProductCard product={product} />
        </GridItem>
      ))}
    </Grid>
  );
}
```

这个文件展示了styled-components的核心功能和最佳实践，包括基础用法、动态样式、主题系统、动画和实际应用示例。