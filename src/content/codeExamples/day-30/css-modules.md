---
title: "CSS Modules使用指南"
description: "CSS Modules的完整使用示例，包括基础用法、组合样式和最佳实践"
category: "advanced"
language: "css"
---

# CSS Modules完整使用指南

## 基础概念

CSS Modules是一种CSS的模块化和组合系统，它通过构建工具将CSS类名局部化，避免全局命名冲突。

## 基础使用

### 1. 创建CSS Module文件

```css
/* Button.module.css */
.button {
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 500;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: #6c757d;
  color: white;
}

.button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.button:active {
  transform: translateY(0);
}

/* 变体样式 */
.primary {
  background-color: #007bff;
}

.primary:hover {
  background-color: #0056b3;
}

.danger {
  background-color: #dc3545;
}

.danger:hover {
  background-color: #c82333;
}

.success {
  background-color: #28a745;
}

.success:hover {
  background-color: #218838;
}

/* 尺寸变体 */
.small {
  padding: 8px 16px;
  font-size: 14px;
}

.large {
  padding: 16px 32px;
  font-size: 18px;
}

.fullWidth {
  display: block;
  width: 100%;
}

.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
```

### 2. 在React组件中使用

```jsx
// Button.jsx
import styles from './Button.module.css';
import clsx from 'clsx'; // 或使用 classnames 库

function Button({ 
  children, 
  variant = 'default', 
  size = 'medium', 
  fullWidth = false,
  disabled = false,
  className,
  ...props 
}) {
  return (
    <button
      className={clsx(
        styles.button,
        styles[variant],
        size !== 'medium' && styles[size],
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

// 使用组件
function App() {
  return (
    <div>
      <Button variant="primary" size="large">
        主要按钮
      </Button>
      <Button variant="danger" fullWidth>
        删除
      </Button>
      <Button disabled>
        禁用按钮
      </Button>
    </div>
  );
}
```

## 高级特性

### 1. 组合（Composition）

```css
/* base.module.css */
.card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.title {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 16px;
  color: #333;
}

.flex {
  display: flex;
}

.flexCenter {
  composes: flex;
  justify-content: center;
  align-items: center;
}

.mb-2 {
  margin-bottom: 16px;
}

.mb-3 {
  margin-bottom: 24px;
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
  composes: mb-2 from './base.module.css';
}

.productPrice {
  font-size: 1.25rem;
  font-weight: bold;
  color: #28a745;
}

.productActions {
  composes: flexCenter from './base.module.css';
  gap: 12px;
  margin-top: 20px;
}
```

### 2. 全局样式和局部样式混合

```css
/* Layout.module.css */

/* 局部样式 */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.header {
  background-color: #f8f9fa;
  padding: 20px 0;
  border-bottom: 1px solid #e0e0e0;
}

/* 全局样式 */
:global(.text-center) {
  text-align: center;
}

:global(.mt-4) {
  margin-top: 2rem;
}

/* 混合使用 */
.navbar :global(.nav-link) {
  color: #333;
  text-decoration: none;
  padding: 8px 16px;
}

.navbar :global(.nav-link:hover) {
  color: #007bff;
}

/* 全局选择器中的局部类 */
:global(.dark-mode) .container {
  background-color: #1a1a1a;
  color: white;
}
```

### 3. CSS变量和动态样式

```css
/* Theme.module.css */
.root {
  --primary-color: #007bff;
  --secondary-color: #6c757d;
  --success-color: #28a745;
  --danger-color: #dc3545;
  --spacing-unit: 8px;
  --border-radius: 6px;
}

.button {
  padding: calc(var(--spacing-unit) * 1.5) calc(var(--spacing-unit) * 3);
  border-radius: var(--border-radius);
  background-color: var(--primary-color);
  color: white;
  border: none;
  cursor: pointer;
}

.card {
  padding: calc(var(--spacing-unit) * 2.5);
  border-radius: var(--border-radius);
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .root {
    --spacing-unit: 6px;
  }
  
  .container {
    padding: 0 var(--spacing-unit);
  }
}
```

```jsx
// 在React中使用CSS变量
function ThemedComponent({ primaryColor }) {
  return (
    <div 
      className={styles.root}
      style={{ '--primary-color': primaryColor }}
    >
      <button className={styles.button}>
        自定义主题按钮
      </button>
    </div>
  );
}
```

## 实际应用示例

### 1. 表单组件系统

```css
/* Form.module.css */
.form {
  max-width: 500px;
  margin: 0 auto;
}

.formGroup {
  margin-bottom: 20px;
}

.label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}

.input {
  width: 100%;
  padding: 10px 15px;
  font-size: 16px;
  border: 2px solid #e0e0e0;
  border-radius: 4px;
  transition: border-color 0.3s;
}

.input:focus {
  outline: none;
  border-color: #007bff;
}

.inputError {
  composes: input;
  border-color: #dc3545;
}

.errorMessage {
  margin-top: 4px;
  font-size: 14px;
  color: #dc3545;
}

.textarea {
  composes: input;
  min-height: 120px;
  resize: vertical;
}

.select {
  composes: input;
  appearance: none;
  background-image: url("data:image/svg+xml,...");
  background-repeat: no-repeat;
  background-position: right 10px center;
  padding-right: 40px;
}

.checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
}

.checkboxInput {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.submitButton {
  composes: button primary large from './Button.module.css';
  margin-top: 24px;
}
```

```jsx
// Form.jsx
import styles from './Form.module.css';

function ContactForm() {
  const [errors, setErrors] = useState({});
  
  return (
    <form className={styles.form}>
      <div className={styles.formGroup}>
        <label className={styles.label} htmlFor="name">
          姓名
        </label>
        <input
          id="name"
          type="text"
          className={errors.name ? styles.inputError : styles.input}
          placeholder="请输入您的姓名"
        />
        {errors.name && (
          <div className={styles.errorMessage}>{errors.name}</div>
        )}
      </div>
      
      <div className={styles.formGroup}>
        <label className={styles.label} htmlFor="email">
          邮箱
        </label>
        <input
          id="email"
          type="email"
          className={errors.email ? styles.inputError : styles.input}
          placeholder="your@email.com"
        />
      </div>
      
      <div className={styles.formGroup}>
        <label className={styles.label} htmlFor="message">
          留言
        </label>
        <textarea
          id="message"
          className={styles.textarea}
          placeholder="请输入您的留言..."
        />
      </div>
      
      <div className={styles.formGroup}>
        <label className={styles.checkbox}>
          <input
            type="checkbox"
            className={styles.checkboxInput}
          />
          <span>我同意服务条款</span>
        </label>
      </div>
      
      <button type="submit" className={styles.submitButton}>
        提交
      </button>
    </form>
  );
}
```

### 2. 响应式网格布局

```css
/* Grid.module.css */
.grid {
  display: grid;
  gap: 20px;
  grid-template-columns: repeat(12, 1fr);
}

.col {
  grid-column: span 12;
}

/* 列宽度 */
.col1 { grid-column: span 1; }
.col2 { grid-column: span 2; }
.col3 { grid-column: span 3; }
.col4 { grid-column: span 4; }
.col6 { grid-column: span 6; }
.col8 { grid-column: span 8; }
.col9 { grid-column: span 9; }

/* 平板断点 */
@media (min-width: 768px) {
  .mdCol1 { grid-column: span 1; }
  .mdCol2 { grid-column: span 2; }
  .mdCol3 { grid-column: span 3; }
  .mdCol4 { grid-column: span 4; }
  .mdCol6 { grid-column: span 6; }
  .mdCol8 { grid-column: span 8; }
  .mdCol9 { grid-column: span 9; }
  .mdCol12 { grid-column: span 12; }
}

/* 桌面断点 */
@media (min-width: 1024px) {
  .lgCol1 { grid-column: span 1; }
  .lgCol2 { grid-column: span 2; }
  .lgCol3 { grid-column: span 3; }
  .lgCol4 { grid-column: span 4; }
  .lgCol6 { grid-column: span 6; }
  .lgCol8 { grid-column: span 8; }
  .lgCol9 { grid-column: span 9; }
  .lgCol12 { grid-column: span 12; }
}

/* 间距工具类 */
.gapSmall { gap: 12px; }
.gapLarge { gap: 32px; }
```

```jsx
// Grid.jsx
import styles from './Grid.module.css';
import clsx from 'clsx';

function Grid({ children, gap = 'medium', className }) {
  return (
    <div className={clsx(
      styles.grid,
      gap === 'small' && styles.gapSmall,
      gap === 'large' && styles.gapLarge,
      className
    )}>
      {children}
    </div>
  );
}

function Col({ children, span = 12, md, lg, className }) {
  return (
    <div className={clsx(
      styles.col,
      styles[`col${span}`],
      md && styles[`mdCol${md}`],
      lg && styles[`lgCol${lg}`],
      className
    )}>
      {children}
    </div>
  );
}

// 使用示例
function Layout() {
  return (
    <Grid gap="large">
      <Col span={12} md={8} lg={9}>
        <MainContent />
      </Col>
      <Col span={12} md={4} lg={3}>
        <Sidebar />
      </Col>
    </Grid>
  );
}
```

### 3. TypeScript支持

```typescript
// Button.module.css.d.ts
declare const styles: {
  readonly button: string;
  readonly primary: string;
  readonly danger: string;
  readonly success: string;
  readonly small: string;
  readonly large: string;
  readonly fullWidth: string;
  readonly disabled: string;
};

export default styles;

// 或使用 typed-css-modules 自动生成
```

```tsx
// Button.tsx
import styles from './Button.module.css';
import clsx from 'clsx';

interface ButtonProps {
  variant?: 'primary' | 'danger' | 'success';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

const Button: React.FC<ButtonProps> = ({
  variant,
  size = 'medium',
  fullWidth = false,
  disabled = false,
  children,
  onClick
}) => {
  return (
    <button
      className={clsx(
        styles.button,
        variant && styles[variant],
        size !== 'medium' && styles[size],
        fullWidth && styles.fullWidth,
        disabled && styles.disabled
      )}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default Button;
```

## 最佳实践

### 1. 命名约定

```css
/* 使用有意义的类名 */
.productCard { } /* 好 */
.pd-crd { } /* 避免过度缩写 */

/* 使用一致的命名模式 */
.card { }
.cardHeader { }
.cardBody { }
.cardFooter { }

/* 状态类 */
.isActive { }
.isDisabled { }
.hasError { }
```

### 2. 组织结构

```
src/
├── components/
│   ├── Button/
│   │   ├── Button.jsx
│   │   ├── Button.module.css
│   │   └── index.js
│   └── Card/
│       ├── Card.jsx
│       ├── Card.module.css
│       └── index.js
├── styles/
│   ├── variables.css
│   ├── base.module.css
│   └── utilities.module.css
```

### 3. 性能优化

```css
/* 避免过度嵌套 */
/* 不好 */
.card .header .title .text { }

/* 好 */
.cardTitle { }

/* 使用CSS变量提高可维护性 */
.theme {
  --spacing-unit: 8px;
  --primary-color: #007bff;
}

.container {
  padding: calc(var(--spacing-unit) * 2);
}
```

CSS Modules提供了一种优雅的方式来编写模块化、可维护的CSS代码，特别适合中大型React应用。