---
day: 26
phase: "react-development"
title: "组件与Props深入"
description: "深入理解React组件系统，掌握Props的高级用法，学习组件间通信模式，构建可复用的组件库"
objectives:
  - "深入理解Props的传递机制和最佳实践"
  - "掌握PropTypes进行类型检查"
  - "学习组件组合和高阶组件模式"
  - "理解组件间的通信策略"
  - "构建可复用的组件系统"
estimatedTime: 120
difficulty: "intermediate"
prerequisites: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 25]
tags:
  - "React"
  - "组件"
  - "Props"
  - "PropTypes"
  - "组件通信"
resources:
  - title: "React组件和Props"
    url: "https://react.dev/learn/passing-props-to-a-component"
    type: "documentation"
  - title: "组件组合vs继承"
    url: "https://react.dev/learn/composition-vs-inheritance"
    type: "documentation"
  - title: "PropTypes文档"
    url: "https://github.com/facebook/prop-types"
    type: "documentation"
  - title: "React设计模式"
    url: "https://www.patterns.dev/react"
    type: "article"
codeExamples:
  - title: "Props高级模式"
    language: "javascript"
    path: "/code-examples/day-26/props-patterns.jsx"
  - title: "可复用组件系统"
    language: "javascript"
    path: "/code-examples/day-26/component-system.jsx"
---

# Day 26: 组件与Props深入

## 📋 学习目标

昨天我们初步了解了React组件和Props的基础概念。今天，我们将深入探索组件系统的强大功能，学习如何构建灵活、可复用的组件，以及组件间的高效通信模式。

## 🌟 Props的本质与传递机制

### 1. Props是什么？

Props（properties的缩写）是React组件的输入，类似于函数的参数。

```jsx
// Props的本质：只读的数据对象
function Welcome(props) {
  console.log(typeof props); // "object"
  console.log(Object.isFrozen(props)); // true in development
  
  // ❌ 错误：Props是只读的
  // props.name = "新名字";
  
  // ✅ 正确：使用Props的值
  return <h1>Hello, {props.name}!</h1>;
}

// Props传递的过程
const element = <Welcome name="张三" age={25} />;
// 相当于：
const element = React.createElement(Welcome, { name: "张三", age: 25 });
```

### 2. Props的传递方式

```jsx
// 1. 单个属性传递
<UserCard name="张三" age={25} isVip={true} />

// 2. 使用扩展运算符传递所有属性
const userProps = {
  name: "张三",
  age: 25,
  email: "zhang@example.com",
  city: "北京"
};
<UserCard {...userProps} />

// 3. 传递和转发Props
function UserWrapper(props) {
  // 提取特定props，传递剩余的
  const { className, ...restProps } = props;
  
  return (
    <div className={`user-wrapper ${className || ''}`}>
      <UserCard {...restProps} />
    </div>
  );
}

// 4. 深层Props传递（Props Drilling）
function App() {
  const user = { name: "张三", theme: "dark" };
  
  return <Dashboard user={user} />;
}

function Dashboard({ user }) {
  return <UserPanel user={user} />;
}

function UserPanel({ user }) {
  return <UserInfo user={user} />;
}

function UserInfo({ user }) {
  return <div>Welcome, {user.name}!</div>;
}
```

### 3. 特殊的Props

```jsx
// children prop - 组件的子内容
function Card({ title, children, footer }) {
  return (
    <div className="card">
      <div className="card-header">{title}</div>
      <div className="card-body">{children}</div>
      {footer && <div className="card-footer">{footer}</div>}
    </div>
  );
}

// 使用children
<Card title="用户信息" footer="最后更新：今天">
  <p>这是卡片的内容</p>
  <UserDetails user={user} />
</Card>

// key prop - 列表渲染的特殊标识
function TodoList({ todos }) {
  return (
    <ul>
      {todos.map(todo => (
        <TodoItem 
          key={todo.id}  // key不会传递给组件
          {...todo}      // 其他props会传递
        />
      ))}
    </ul>
  );
}

// ref prop - 获取DOM引用或组件实例
function TextInput({ label, inputRef }) {
  return (
    <label>
      {label}
      <input ref={inputRef} type="text" />
    </label>
  );
}
```

## 📊 PropTypes类型检查

### 1. 安装和基本使用

```bash
npm install prop-types
```

```jsx
import PropTypes from 'prop-types';

// 函数组件的PropTypes
function UserCard({ name, age, email, isVip, onUpdate }) {
  return (
    <div className="user-card">
      <h3>{name}</h3>
      <p>年龄：{age}</p>
      <p>邮箱：{email}</p>
      {isVip && <span className="vip-badge">VIP</span>}
      <button onClick={onUpdate}>更新</button>
    </div>
  );
}

// 定义PropTypes
UserCard.propTypes = {
  name: PropTypes.string.isRequired,
  age: PropTypes.number.isRequired,
  email: PropTypes.string.isRequired,
  isVip: PropTypes.bool,
  onUpdate: PropTypes.func.isRequired
};

// 定义默认值
UserCard.defaultProps = {
  isVip: false
};
```

### 2. 高级PropTypes验证

```jsx
// 复杂类型验证
Component.propTypes = {
  // 基本类型
  optionalString: PropTypes.string,
  optionalNumber: PropTypes.number,
  optionalBool: PropTypes.bool,
  optionalFunc: PropTypes.func,
  optionalObject: PropTypes.object,
  optionalArray: PropTypes.array,
  optionalSymbol: PropTypes.symbol,
  
  // 枚举类型
  status: PropTypes.oneOf(['active', 'inactive', 'pending']),
  
  // 多种类型之一
  id: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),
  
  // 特定类型的数组
  scores: PropTypes.arrayOf(PropTypes.number),
  
  // 特定形状的对象
  user: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    email: PropTypes.string,
    address: PropTypes.shape({
      city: PropTypes.string,
      zipCode: PropTypes.string
    })
  }),
  
  // 特定类型的对象
  settings: PropTypes.objectOf(PropTypes.bool),
  
  // React元素
  header: PropTypes.element,
  
  // 任何可渲染的内容
  content: PropTypes.node,
  
  // 组件实例
  component: PropTypes.elementType,
  
  // 自定义验证器
  customProp: function(props, propName, componentName) {
    if (!/^[0-9]{6}$/.test(props[propName])) {
      return new Error(
        `Invalid prop ${propName} supplied to ${componentName}. ` +
        `Validation failed. Expected 6-digit number.`
      );
    }
  },
  
  // 必需的任意类型
  requiredAny: PropTypes.any.isRequired
};
```

### 3. 实际应用示例

```jsx
// 表单组件的PropTypes
function Form({ 
  fields, 
  onSubmit, 
  onCancel, 
  submitText = "提交", 
  cancelText = "取消",
  layout = "vertical" 
}) {
  // 组件实现...
}

Form.propTypes = {
  fields: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    type: PropTypes.oneOf(['text', 'email', 'password', 'number']),
    placeholder: PropTypes.string,
    required: PropTypes.bool,
    validator: PropTypes.func
  })).isRequired,
  
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func,
  submitText: PropTypes.string,
  cancelText: PropTypes.string,
  layout: PropTypes.oneOf(['vertical', 'horizontal', 'inline'])
};
```

## 🏗️ 组件组合模式

### 1. 组合 vs 继承

React推荐使用组合而非继承来实现组件间的代码复用。

```jsx
// ❌ 不推荐：使用继承
class SpecialButton extends Button {
  // 继承会导致耦合过紧
}

// ✅ 推荐：使用组合
function SpecialButton({ variant, ...props }) {
  return (
    <Button 
      className={`special-btn special-btn-${variant}`}
      {...props}
    />
  );
}

// 包含关系 - 使用children
function Dialog({ title, children }) {
  return (
    <div className="dialog">
      <div className="dialog-header">
        <h2>{title}</h2>
      </div>
      <div className="dialog-body">
        {children}
      </div>
    </div>
  );
}

// 特殊化 - 通过props配置
function WarningDialog({ onConfirm, onCancel }) {
  return (
    <Dialog title="警告">
      <p>确定要执行此操作吗？</p>
      <div className="dialog-actions">
        <Button onClick={onCancel} variant="secondary">取消</Button>
        <Button onClick={onConfirm} variant="danger">确定</Button>
      </div>
    </Dialog>
  );
}
```

### 2. 插槽模式（Slots Pattern）

```jsx
// 多个插槽的布局组件
function Layout({ header, sidebar, content, footer }) {
  return (
    <div className="layout">
      {header && (
        <header className="layout-header">
          {header}
        </header>
      )}
      
      <div className="layout-body">
        {sidebar && (
          <aside className="layout-sidebar">
            {sidebar}
          </aside>
        )}
        
        <main className="layout-content">
          {content}
        </main>
      </div>
      
      {footer && (
        <footer className="layout-footer">
          {footer}
        </footer>
      )}
    </div>
  );
}

// 使用插槽模式
function App() {
  return (
    <Layout
      header={<NavigationBar />}
      sidebar={<SideMenu />}
      content={<MainContent />}
      footer={<Copyright />}
    />
  );
}
```

### 3. 复合组件模式（Compound Components）

```jsx
// 复合组件 - 多个组件协同工作
const Tabs = ({ children, defaultTab = 0 }) => {
  const [activeTab, setActiveTab] = useState(defaultTab);
  
  return (
    <div className="tabs">
      {React.Children.map(children, (child, index) => 
        React.cloneElement(child, { activeTab, setActiveTab, index })
      )}
    </div>
  );
};

Tabs.List = ({ children, activeTab, setActiveTab }) => (
  <div className="tabs-list">
    {React.Children.map(children, (child, index) => 
      React.cloneElement(child, { 
        isActive: activeTab === index,
        onClick: () => setActiveTab(index)
      })
    )}
  </div>
);

Tabs.Tab = ({ children, isActive, onClick }) => (
  <button 
    className={`tab ${isActive ? 'active' : ''}`}
    onClick={onClick}
  >
    {children}
  </button>
);

Tabs.Panels = ({ children, activeTab }) => (
  <div className="tabs-panels">
    {React.Children.toArray(children)[activeTab]}
  </div>
);

Tabs.Panel = ({ children }) => (
  <div className="tab-panel">{children}</div>
);

// 使用复合组件
function Example() {
  return (
    <Tabs defaultTab={0}>
      <Tabs.List>
        <Tabs.Tab>个人信息</Tabs.Tab>
        <Tabs.Tab>账户设置</Tabs.Tab>
        <Tabs.Tab>通知偏好</Tabs.Tab>
      </Tabs.List>
      
      <Tabs.Panels>
        <Tabs.Panel>
          <UserProfile />
        </Tabs.Panel>
        <Tabs.Panel>
          <AccountSettings />
        </Tabs.Panel>
        <Tabs.Panel>
          <NotificationPreferences />
        </Tabs.Panel>
      </Tabs.Panels>
    </Tabs>
  );
}
```

## 🔄 组件间通信策略

### 1. 父子组件通信

```jsx
// 父组件向子组件传递数据（Props）
function Parent() {
  const [user, setUser] = useState({ name: "张三", age: 25 });
  
  return <Child user={user} />;
}

// 子组件向父组件传递数据（回调函数）
function Parent() {
  const [message, setMessage] = useState('');
  
  const handleChildMessage = (msg) => {
    setMessage(msg);
  };
  
  return (
    <div>
      <p>来自子组件的消息：{message}</p>
      <Child onMessage={handleChildMessage} />
    </div>
  );
}

function Child({ onMessage }) {
  return (
    <button onClick={() => onMessage('Hello from child!')}>
      发送消息
    </button>
  );
}
```

### 2. 兄弟组件通信

```jsx
// 通过共同的父组件进行通信（状态提升）
function Parent() {
  const [sharedData, setSharedData] = useState('');
  
  return (
    <div>
      <SiblingA onDataChange={setSharedData} />
      <SiblingB data={sharedData} />
    </div>
  );
}

function SiblingA({ onDataChange }) {
  return (
    <input 
      type="text" 
      onChange={(e) => onDataChange(e.target.value)}
      placeholder="输入要分享的数据"
    />
  );
}

function SiblingB({ data }) {
  return <p>接收到的数据：{data}</p>;
}
```

### 3. 跨层级组件通信（Context）

```jsx
// 创建Context
const ThemeContext = React.createContext('light');
const UserContext = React.createContext(null);

// Provider组件
function App() {
  const [theme, setTheme] = useState('light');
  const [user, setUser] = useState({ name: '张三', role: 'admin' });
  
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <UserContext.Provider value={user}>
        <Layout />
      </UserContext.Provider>
    </ThemeContext.Provider>
  );
}

// 深层子组件消费Context
function DeepChild() {
  const { theme, setTheme } = useContext(ThemeContext);
  const user = useContext(UserContext);
  
  return (
    <div className={`deep-child theme-${theme}`}>
      <p>当前用户：{user.name}</p>
      <p>当前主题：{theme}</p>
      <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
        切换主题
      </button>
    </div>
  );
}
```

## 🎨 构建可复用组件系统

### 1. 设计原则

```jsx
// 1. 单一职责原则
// ❌ 不好：组件职责过多
function UserCardBad({ user, onEdit, onDelete, showStats, theme }) {
  // 太多功能耦合在一起
}

// ✅ 好：职责单一
function UserCard({ user }) {
  return (
    <div className="user-card">
      <UserAvatar user={user} />
      <UserInfo user={user} />
    </div>
  );
}

function UserActions({ userId, onEdit, onDelete }) {
  return (
    <div className="user-actions">
      <Button onClick={() => onEdit(userId)}>编辑</Button>
      <Button onClick={() => onDelete(userId)} variant="danger">删除</Button>
    </div>
  );
}

// 2. 开闭原则
// 组件应该对扩展开放，对修改关闭
function Button({ 
  children, 
  variant = 'primary',
  size = 'medium',
  icon,
  iconPosition = 'left',
  className = '',
  ...restProps 
}) {
  const classes = `
    btn 
    btn-${variant} 
    btn-${size}
    ${icon ? 'btn-with-icon' : ''}
    ${className}
  `.trim();
  
  return (
    <button className={classes} {...restProps}>
      {icon && iconPosition === 'left' && <Icon name={icon} />}
      {children}
      {icon && iconPosition === 'right' && <Icon name={icon} />}
    </button>
  );
}
```

### 2. 组件库示例

```jsx
// 基础组件系统
// components/ui/index.js

// Button组件
export const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'medium',
  fullWidth = false,
  loading = false,
  disabled = false,
  ...props 
}) => {
  const baseClasses = 'btn transition-all duration-200';
  const variantClasses = {
    primary: 'bg-blue-500 hover:bg-blue-600 text-white',
    secondary: 'bg-gray-500 hover:bg-gray-600 text-white',
    danger: 'bg-red-500 hover:bg-red-600 text-white',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-700'
  };
  const sizeClasses = {
    small: 'px-3 py-1 text-sm',
    medium: 'px-4 py-2',
    large: 'px-6 py-3 text-lg'
  };
  
  const classes = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${fullWidth ? 'w-full' : ''}
    ${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''}
  `.trim();
  
  return (
    <button 
      className={classes} 
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Spinner size="small" /> : children}
    </button>
  );
};

// Input组件
export const Input = React.forwardRef(({ 
  label,
  error,
  helperText,
  prefix,
  suffix,
  ...props 
}, ref) => {
  const inputId = useId();
  
  return (
    <div className="form-group">
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label}
          {props.required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <div className="input-wrapper">
        {prefix && <span className="input-prefix">{prefix}</span>}
        
        <input
          ref={ref}
          id={inputId}
          className={`form-input ${error ? 'input-error' : ''}`}
          {...props}
        />
        
        {suffix && <span className="input-suffix">{suffix}</span>}
      </div>
      
      {(error || helperText) && (
        <p className={`form-text ${error ? 'text-red-500' : 'text-gray-500'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
});

// Card组件
export const Card = ({ 
  children, 
  title,
  subtitle,
  actions,
  hoverable = false,
  className = '',
  ...props 
}) => {
  return (
    <div 
      className={`
        card 
        ${hoverable ? 'card-hoverable' : ''} 
        ${className}
      `.trim()}
      {...props}
    >
      {(title || subtitle) && (
        <div className="card-header">
          {title && <h3 className="card-title">{title}</h3>}
          {subtitle && <p className="card-subtitle">{subtitle}</p>}
        </div>
      )}
      
      <div className="card-body">
        {children}
      </div>
      
      {actions && (
        <div className="card-actions">
          {actions}
        </div>
      )}
    </div>
  );
};
```

### 3. 高阶组件（HOC）模式

```jsx
// withAuth HOC - 添加认证功能
function withAuth(WrappedComponent) {
  return function AuthenticatedComponent(props) {
    const { user } = useAuth();
    
    if (!user) {
      return <Navigate to="/login" />;
    }
    
    return <WrappedComponent {...props} user={user} />;
  };
}

// 使用HOC
const ProtectedProfile = withAuth(UserProfile);

// withLoading HOC - 添加加载状态
function withLoading(WrappedComponent) {
  return function LoadingComponent({ isLoading, ...props }) {
    if (isLoading) {
      return (
        <div className="loading-container">
          <Spinner size="large" />
        </div>
      );
    }
    
    return <WrappedComponent {...props} />;
  };
}

// 组合多个HOC
const EnhancedComponent = withAuth(withLoading(UserProfile));
```

## 💼 实战项目：组件库开发

### 项目结构

```
src/
├── components/
│   ├── ui/
│   │   ├── Button/
│   │   │   ├── Button.jsx
│   │   │   ├── Button.css
│   │   │   └── index.js
│   │   ├── Input/
│   │   ├── Card/
│   │   ├── Modal/
│   │   └── index.js
│   ├── layout/
│   │   ├── Header/
│   │   ├── Footer/
│   │   └── Layout/
│   └── features/
│       ├── UserCard/
│       └── ProductCard/
├── hooks/
├── utils/
└── App.jsx
```

### 完整的Modal组件示例

```jsx
// Modal组件实现
const Modal = ({ 
  isOpen, 
  onClose, 
  title,
  children,
  size = 'medium',
  closeOnOverlayClick = true,
  showCloseButton = true,
  footer
}) => {
  useEffect(() => {
    // 处理ESC键关闭
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);
  
  if (!isOpen) return null;
  
  const sizeClasses = {
    small: 'max-w-sm',
    medium: 'max-w-lg',
    large: 'max-w-2xl',
    fullscreen: 'max-w-full h-full'
  };
  
  return ReactDOM.createPortal(
    <div className="modal-overlay" onClick={closeOnOverlayClick ? onClose : undefined}>
      <div 
        className={`modal-content ${sizeClasses[size]}`}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || showCloseButton) && (
          <div className="modal-header">
            {title && <h2 className="modal-title">{title}</h2>}
            {showCloseButton && (
              <button 
                className="modal-close"
                onClick={onClose}
                aria-label="关闭"
              >
                ×
              </button>
            )}
          </div>
        )}
        
        <div className="modal-body">
          {children}
        </div>
        
        {footer && (
          <div className="modal-footer">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

// 使用Modal
function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  return (
    <>
      <Button onClick={() => setIsModalOpen(true)}>
        打开Modal
      </Button>
      
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="确认操作"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              取消
            </Button>
            <Button onClick={() => {
              // 执行操作
              setIsModalOpen(false);
            }}>
              确认
            </Button>
          </>
        }
      >
        <p>确定要执行此操作吗？</p>
      </Modal>
    </>
  );
}
```

## 🎯 今日练习

1. **基础练习**：创建一个表单组件系统，包含Input、Select、Checkbox等
2. **进阶练习**：实现一个数据表格组件，支持排序、筛选和分页
3. **挑战练习**：构建一个通知系统，支持多种类型和位置的通知提示

## 🚀 下一步

明天我们将学习：
- React的State管理
- 事件处理系统
- 受控组件vs非受控组件
- 表单处理最佳实践
- 状态提升和管理策略

## 💭 思考题

1. 为什么React选择单向数据流（Props向下传递）？
2. 什么时候应该使用PropTypes，什么时候应该使用TypeScript？
3. 组件的粒度应该如何把握？什么时候应该拆分组件？
4. Context和Props各有什么优缺点？何时使用哪种方案？

记住：**好的组件设计是React应用成功的关键。花时间思考组件的接口和职责，将帮助你构建出更加可维护的应用！**