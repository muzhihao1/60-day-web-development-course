// advanced-patterns.tsx - 高级Props模式和最佳实践

import React, { 
  ReactNode, 
  ComponentType, 
  forwardRef, 
  useImperativeHandle,
  memo,
  ReactElement,
  isValidElement,
  cloneElement,
} from 'react';

// 1. Forward Ref模式
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, ...props }, ref) => {
    return (
      <div style={{ marginBottom: '16px' }}>
        {label && (
          <label style={{ display: 'block', marginBottom: '4px' }}>
            {label}
          </label>
        )}
        <input
          ref={ref}
          style={{
            width: '100%',
            padding: '8px',
            border: error ? '1px solid red' : '1px solid #ddd',
            borderRadius: '4px',
          }}
          {...props}
        />
        {error && (
          <span style={{ color: 'red', fontSize: '14px', marginTop: '4px' }}>
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

// 2. Imperative Handle模式
interface FormHandle {
  submit: () => void;
  reset: () => void;
  validate: () => boolean;
}

interface FormProps {
  onSubmit: (data: any) => void;
  children: ReactNode;
}

const Form = forwardRef<FormHandle, FormProps>(({ onSubmit, children }, ref) => {
  const [formData, setFormData] = React.useState<Record<string, any>>({});
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  
  useImperativeHandle(ref, () => ({
    submit: () => {
      if (validate()) {
        onSubmit(formData);
      }
    },
    reset: () => {
      setFormData({});
      setErrors({});
    },
    validate: () => {
      // 简单验证逻辑
      const newErrors: Record<string, string> = {};
      
      if (!formData.name) {
        newErrors.name = '姓名是必填项';
      }
      
      if (!formData.email) {
        newErrors.email = '邮箱是必填项';
      }
      
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    },
  }));
  
  const handleChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    // 清除对应的错误
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  // 克隆子元素并注入props
  const enhancedChildren = React.Children.map(children, (child) => {
    if (isValidElement(child) && child.type === Input) {
      return cloneElement(child, {
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
          handleChange(child.props.name || '', e.target.value);
        },
        value: formData[child.props.name || ''] || '',
        error: errors[child.props.name || ''],
      });
    }
    return child;
  });
  
  return (
    <form onSubmit={(e) => e.preventDefault()}>
      {enhancedChildren}
    </form>
  );
});

Form.displayName = 'Form';

// 3. 受控和非受控Props模式
interface ToggleProps {
  defaultValue?: boolean;
  value?: boolean;
  onChange?: (value: boolean) => void;
  label: string;
}

function Toggle({ defaultValue = false, value, onChange, label }: ToggleProps) {
  // 判断是受控还是非受控
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  
  const currentValue = isControlled ? value : internalValue;
  
  const handleToggle = () => {
    const newValue = !currentValue;
    
    if (!isControlled) {
      setInternalValue(newValue);
    }
    
    onChange?.(newValue);
  };
  
  return (
    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
      <input
        type="checkbox"
        checked={currentValue}
        onChange={handleToggle}
        style={{ marginRight: '8px' }}
      />
      {label}
    </label>
  );
}

// 4. Polymorphic组件（多态组件）
type PolymorphicProps<C extends React.ElementType> = {
  as?: C;
  children?: ReactNode;
} & React.ComponentPropsWithoutRef<C>;

function Box<C extends React.ElementType = 'div'>({
  as,
  children,
  ...props
}: PolymorphicProps<C>) {
  const Component = as || 'div';
  
  return (
    <Component
      style={{
        padding: '16px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        ...props.style,
      }}
      {...props}
    >
      {children}
    </Component>
  );
}

// 5. Compound Components with TypeScript
interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps {
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  renderOption?: (option: SelectOption) => ReactNode;
}

const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  placeholder = '请选择',
  renderOption,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedValue, setSelectedValue] = React.useState(value || '');
  
  const selectedOption = options.find(opt => opt.value === selectedValue);
  
  const handleSelect = (option: SelectOption) => {
    if (option.disabled) return;
    
    setSelectedValue(option.value);
    onChange?.(option.value);
    setIsOpen(false);
  };
  
  return (
    <div style={{ position: 'relative', width: '200px' }}>
      <div
        style={{
          padding: '8px 12px',
          border: '1px solid #ddd',
          borderRadius: '4px',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{selectedOption?.label || placeholder}</span>
        <span>{isOpen ? '▲' : '▼'}</span>
      </div>
      
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: '4px',
            backgroundColor: 'white',
            border: '1px solid #ddd',
            borderRadius: '4px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            zIndex: 1000,
          }}
        >
          {options.map(option => (
            <div
              key={option.value}
              style={{
                padding: '8px 12px',
                cursor: option.disabled ? 'not-allowed' : 'pointer',
                backgroundColor: selectedValue === option.value ? '#f0f0f0' : 'white',
                opacity: option.disabled ? 0.5 : 1,
              }}
              onClick={() => handleSelect(option)}
              onMouseEnter={(e) => {
                if (!option.disabled) {
                  e.currentTarget.style.backgroundColor = '#f8f8f8';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedValue !== option.value) {
                  e.currentTarget.style.backgroundColor = 'white';
                }
              }}
            >
              {renderOption ? renderOption(option) : option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// 6. Props Getter模式
interface UseToggleReturn {
  on: boolean;
  toggle: () => void;
  getTogglerProps: (props?: any) => any;
}

function useToggle(initialValue = false): UseToggleReturn {
  const [on, setOn] = React.useState(initialValue);
  
  const toggle = React.useCallback(() => {
    setOn(prev => !prev);
  }, []);
  
  const getTogglerProps = React.useCallback(
    (props = {}) => ({
      ...props,
      onClick: (e: React.MouseEvent) => {
        props.onClick?.(e);
        toggle();
      },
      'aria-pressed': on,
      role: 'button',
    }),
    [on, toggle]
  );
  
  return { on, toggle, getTogglerProps };
}

// 使用Props Getter的组件
function ToggleButton() {
  const { on, getTogglerProps } = useToggle(false);
  
  return (
    <button
      {...getTogglerProps({
        style: {
          padding: '10px 20px',
          backgroundColor: on ? '#4CAF50' : '#f44336',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        },
      })}
    >
      {on ? '开启' : '关闭'}
    </button>
  );
}

// 7. State Reducer模式
type CounterState = { count: number };
type CounterAction = 
  | { type: 'increment' }
  | { type: 'decrement' }
  | { type: 'reset' }
  | { type: 'set'; payload: number };

interface UseCounterProps {
  initialCount?: number;
  reducer?: (state: CounterState, action: CounterAction) => CounterState;
}

function useCounter({ initialCount = 0, reducer }: UseCounterProps = {}) {
  const defaultReducer = (state: CounterState, action: CounterAction): CounterState => {
    switch (action.type) {
      case 'increment':
        return { count: state.count + 1 };
      case 'decrement':
        return { count: state.count - 1 };
      case 'reset':
        return { count: initialCount };
      case 'set':
        return { count: action.payload };
      default:
        return state;
    }
  };
  
  const [state, dispatch] = React.useReducer(
    reducer || defaultReducer,
    { count: initialCount }
  );
  
  const increment = () => dispatch({ type: 'increment' });
  const decrement = () => dispatch({ type: 'decrement' });
  const reset = () => dispatch({ type: 'reset' });
  const set = (value: number) => dispatch({ type: 'set', payload: value });
  
  return { count: state.count, increment, decrement, reset, set };
}

// 8. 性能优化的Props模式
interface ExpensiveComponentProps {
  data: any[];
  onItemClick: (item: any) => void;
  renderItem?: (item: any) => ReactNode;
}

const ExpensiveComponent = memo<ExpensiveComponentProps>(
  ({ data, onItemClick, renderItem }) => {
    console.log('ExpensiveComponent rendered');
    
    // 使用useCallback缓存事件处理器
    const handleClick = React.useCallback(
      (item: any) => {
        onItemClick(item);
      },
      [onItemClick]
    );
    
    return (
      <div>
        {data.map((item, index) => (
          <div
            key={index}
            onClick={() => handleClick(item)}
            style={{
              padding: '8px',
              cursor: 'pointer',
              borderBottom: '1px solid #eee',
            }}
          >
            {renderItem ? renderItem(item) : JSON.stringify(item)}
          </div>
        ))}
      </div>
    );
  },
  // 自定义比较函数
  (prevProps, nextProps) => {
    return (
      prevProps.data === nextProps.data &&
      prevProps.onItemClick === nextProps.onItemClick &&
      prevProps.renderItem === nextProps.renderItem
    );
  }
);

ExpensiveComponent.displayName = 'ExpensiveComponent';

// 导出所有组件和hooks
export {
  Input,
  Form,
  Toggle,
  Box,
  Select,
  useToggle,
  ToggleButton,
  useCounter,
  ExpensiveComponent,
};

// 导出类型
export type { FormHandle, SelectOption, UseToggleReturn };