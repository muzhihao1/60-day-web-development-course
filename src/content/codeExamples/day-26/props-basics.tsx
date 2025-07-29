// props-basics.tsx - Props基础和高级用法

import React, { ReactNode } from 'react';

// 1. 基础Props类型
interface BasicProps {
  name: string;
  age: number;
  isActive: boolean;
}

function BasicComponent({ name, age, isActive }: BasicProps) {
  return (
    <div>
      <h3>{name}</h3>
      <p>年龄: {age}</p>
      <p>状态: {isActive ? '活跃' : '非活跃'}</p>
    </div>
  );
}

// 2. 可选Props和默认值
interface OptionalProps {
  title: string;
  subtitle?: string;
  count?: number;
  showIcon?: boolean;
}

function OptionalComponent({ 
  title, 
  subtitle = '默认副标题', 
  count = 0,
  showIcon = true 
}: OptionalProps) {
  return (
    <div>
      {showIcon && <span>🌟</span>}
      <h2>{title}</h2>
      <p>{subtitle}</p>
      <span>计数: {count}</span>
    </div>
  );
}

// 3. 对象和数组Props
interface User {
  id: number;
  name: string;
  email: string;
}

interface ComplexProps {
  user: User;
  tags: string[];
  metadata: Record<string, any>;
}

function ComplexComponent({ user, tags, metadata }: ComplexProps) {
  return (
    <div>
      <h3>{user.name}</h3>
      <p>{user.email}</p>
      
      <div>
        标签: {tags.map((tag, index) => (
          <span key={index} style={{ marginRight: '8px' }}>
            #{tag}
          </span>
        ))}
      </div>
      
      <pre>{JSON.stringify(metadata, null, 2)}</pre>
    </div>
  );
}

// 4. 函数Props（回调）
interface CallbackProps {
  onButtonClick: () => void;
  onInputChange: (value: string) => void;
  onItemSelect: (item: { id: number; name: string }) => void;
}

function CallbackComponent({ onButtonClick, onInputChange, onItemSelect }: CallbackProps) {
  const items = [
    { id: 1, name: '项目1' },
    { id: 2, name: '项目2' },
  ];
  
  return (
    <div>
      <button onClick={onButtonClick}>点击我</button>
      
      <input 
        type="text" 
        onChange={(e) => onInputChange(e.target.value)}
        placeholder="输入一些内容"
      />
      
      <ul>
        {items.map(item => (
          <li key={item.id} onClick={() => onItemSelect(item)}>
            {item.name}
          </li>
        ))}
      </ul>
    </div>
  );
}

// 5. Children Props
interface ChildrenProps {
  title: string;
  children: ReactNode;
}

function ContainerComponent({ title, children }: ChildrenProps) {
  return (
    <div style={{ border: '1px solid #ddd', padding: '20px' }}>
      <h2>{title}</h2>
      <div>{children}</div>
    </div>
  );
}

// 6. Render Props模式
interface RenderProps {
  data: any[];
  renderItem: (item: any, index: number) => ReactNode;
  renderEmpty?: () => ReactNode;
}

function ListComponent({ data, renderItem, renderEmpty }: RenderProps) {
  if (data.length === 0 && renderEmpty) {
    return <>{renderEmpty()}</>;
  }
  
  return (
    <ul>
      {data.map((item, index) => (
        <li key={index}>{renderItem(item, index)}</li>
      ))}
    </ul>
  );
}

// 7. Props展开和剩余属性
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
}

function CustomButton({ variant = 'primary', size = 'medium', children, ...rest }: ButtonProps) {
  const styles = {
    primary: { backgroundColor: 'blue', color: 'white' },
    secondary: { backgroundColor: 'gray', color: 'white' },
  };
  
  const sizes = {
    small: { padding: '5px 10px', fontSize: '12px' },
    medium: { padding: '10px 20px', fontSize: '16px' },
    large: { padding: '15px 30px', fontSize: '20px' },
  };
  
  return (
    <button
      style={{ ...styles[variant], ...sizes[size], border: 'none', borderRadius: '4px' }}
      {...rest}
    >
      {children}
    </button>
  );
}

// 8. 联合类型Props
type Status = 'loading' | 'success' | 'error';

interface StatusProps {
  status: Status;
  message?: string;
}

function StatusComponent({ status, message }: StatusProps) {
  const statusConfig = {
    loading: { icon: '⏳', color: 'orange' },
    success: { icon: '✅', color: 'green' },
    error: { icon: '❌', color: 'red' },
  };
  
  const config = statusConfig[status];
  
  return (
    <div style={{ color: config.color }}>
      <span>{config.icon}</span>
      <span>{message || `状态: ${status}`}</span>
    </div>
  );
}

// 9. 泛型Props
interface GenericListProps<T> {
  items: T[];
  renderItem: (item: T) => ReactNode;
  keyExtractor: (item: T) => string | number;
}

function GenericList<T>({ items, renderItem, keyExtractor }: GenericListProps<T>) {
  return (
    <div>
      {items.map(item => (
        <div key={keyExtractor(item)}>
          {renderItem(item)}
        </div>
      ))}
    </div>
  );
}

// 10. Props验证和类型守卫
interface SafeProps {
  data: unknown;
  onValidData: (data: string) => void;
}

function SafeComponent({ data, onValidData }: SafeProps) {
  // 类型守卫
  const isString = (value: unknown): value is string => {
    return typeof value === 'string';
  };
  
  if (isString(data)) {
    return (
      <div>
        <p>有效的字符串数据: {data}</p>
        <button onClick={() => onValidData(data)}>处理数据</button>
      </div>
    );
  }
  
  return <div>无效的数据类型</div>;
}

// 导出所有组件
export {
  BasicComponent,
  OptionalComponent,
  ComplexComponent,
  CallbackComponent,
  ContainerComponent,
  ListComponent,
  CustomButton,
  StatusComponent,
  GenericList,
  SafeComponent,
};