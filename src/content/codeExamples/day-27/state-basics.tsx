// state-basics.tsx - React State基础

import React, { useState } from 'react';

// 1. 基础useState用法
function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>计数: {count}</p>
      <button onClick={() => setCount(count + 1)}>增加</button>
      <button onClick={() => setCount(count - 1)}>减少</button>
      <button onClick={() => setCount(0)}>重置</button>
    </div>
  );
}

// 2. 多个state变量
function UserProfile() {
  const [name, setName] = useState('');
  const [age, setAge] = useState(0);
  const [email, setEmail] = useState('');
  
  return (
    <div>
      <input
        placeholder="姓名"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        type="number"
        placeholder="年龄"
        value={age}
        onChange={(e) => setAge(Number(e.target.value))}
      />
      <input
        type="email"
        placeholder="邮箱"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <div>
        <h3>用户信息：</h3>
        <p>姓名: {name}</p>
        <p>年龄: {age}</p>
        <p>邮箱: {email}</p>
      </div>
    </div>
  );
}

// 3. 对象state
interface User {
  name: string;
  age: number;
  email: string;
  address: {
    city: string;
    country: string;
  };
}

function UserForm() {
  const [user, setUser] = useState<User>({
    name: '',
    age: 0,
    email: '',
    address: {
      city: '',
      country: '',
    },
  });
  
  // 更新嵌套对象的正确方式
  const updateCity = (city: string) => {
    setUser(prevUser => ({
      ...prevUser,
      address: {
        ...prevUser.address,
        city,
      },
    }));
  };
  
  // 使用函数更新
  const updateName = (name: string) => {
    setUser(prev => ({ ...prev, name }));
  };
  
  return (
    <div>
      <input
        placeholder="姓名"
        value={user.name}
        onChange={(e) => updateName(e.target.value)}
      />
      <input
        placeholder="城市"
        value={user.address.city}
        onChange={(e) => updateCity(e.target.value)}
      />
      <pre>{JSON.stringify(user, null, 2)}</pre>
    </div>
  );
}

// 4. 数组state
function TodoList() {
  const [todos, setTodos] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  
  const addTodo = () => {
    if (inputValue.trim()) {
      setTodos([...todos, inputValue]);
      setInputValue('');
    }
  };
  
  const removeTodo = (index: number) => {
    setTodos(todos.filter((_, i) => i !== index));
  };
  
  const updateTodo = (index: number, newValue: string) => {
    setTodos(todos.map((todo, i) => (i === index ? newValue : todo)));
  };
  
  return (
    <div>
      <div>
        <input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addTodo()}
        />
        <button onClick={addTodo}>添加</button>
      </div>
      <ul>
        {todos.map((todo, index) => (
          <li key={index}>
            <input
              value={todo}
              onChange={(e) => updateTodo(index, e.target.value)}
            />
            <button onClick={() => removeTodo(index)}>删除</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

// 5. 惰性初始化state
function ExpensiveComponent() {
  // ❌ 错误：每次渲染都会调用
  // const [data, setData] = useState(expensiveOperation());
  
  // ✅ 正确：只在初始化时调用一次
  const [data, setData] = useState(() => {
    console.log('只执行一次的昂贵操作');
    return Array.from({ length: 1000 }, (_, i) => ({
      id: i,
      value: Math.random(),
    }));
  });
  
  return <div>数据项数量: {data.length}</div>;
}

// 6. 函数式更新
function AsyncCounter() {
  const [count, setCount] = useState(0);
  
  const incrementAsync = () => {
    setTimeout(() => {
      // ❌ 错误：可能使用过时的count值
      // setCount(count + 1);
      
      // ✅ 正确：使用函数式更新
      setCount(prevCount => prevCount + 1);
    }, 1000);
  };
  
  const incrementMultipleTimes = () => {
    // ❌ 错误：只会增加1
    // setCount(count + 1);
    // setCount(count + 1);
    // setCount(count + 1);
    
    // ✅ 正确：会增加3
    setCount(prev => prev + 1);
    setCount(prev => prev + 1);
    setCount(prev => prev + 1);
  };
  
  return (
    <div>
      <p>计数: {count}</p>
      <button onClick={incrementAsync}>异步增加</button>
      <button onClick={incrementMultipleTimes}>增加3次</button>
    </div>
  );
}

// 7. 条件state更新
function ConditionalUpdate() {
  const [value, setValue] = useState(0);
  const [isEnabled, setIsEnabled] = useState(true);
  
  const updateValue = (newValue: number) => {
    // 只在启用时更新
    if (isEnabled) {
      setValue(newValue);
    }
  };
  
  // 或使用函数式更新
  const incrementIfEnabled = () => {
    setValue(prev => isEnabled ? prev + 1 : prev);
  };
  
  return (
    <div>
      <p>值: {value}</p>
      <p>状态: {isEnabled ? '启用' : '禁用'}</p>
      <button onClick={() => updateValue(value + 1)}>增加</button>
      <button onClick={incrementIfEnabled}>条件增加</button>
      <button onClick={() => setIsEnabled(!isEnabled)}>
        切换状态
      </button>
    </div>
  );
}

// 8. State更新的批处理
function BatchingExample() {
  const [count, setCount] = useState(0);
  const [flag, setFlag] = useState(false);
  
  // React 18自动批处理
  const handleClick = () => {
    // 这些更新会被批处理，只触发一次重新渲染
    setCount(c => c + 1);
    setFlag(f => !f);
    // 即使在setTimeout中也会批处理
    setTimeout(() => {
      setCount(c => c + 1);
      setFlag(f => !f);
    }, 100);
  };
  
  console.log('渲染');
  
  return (
    <div>
      <p>Count: {count}</p>
      <p>Flag: {flag.toString()}</p>
      <button onClick={handleClick}>更新</button>
    </div>
  );
}

// 9. State重置技巧
function ResettableForm() {
  const initialState = {
    name: '',
    email: '',
    message: '',
  };
  
  const [formData, setFormData] = useState(initialState);
  
  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleReset = () => {
    setFormData(initialState);
  };
  
  // 使用key重置组件state
  const [key, setKey] = useState(0);
  const forceReset = () => {
    setKey(prev => prev + 1);
  };
  
  return (
    <div key={key}>
      <input
        placeholder="姓名"
        value={formData.name}
        onChange={(e) => handleChange('name', e.target.value)}
      />
      <input
        placeholder="邮箱"
        value={formData.email}
        onChange={(e) => handleChange('email', e.target.value)}
      />
      <textarea
        placeholder="消息"
        value={formData.message}
        onChange={(e) => handleChange('message', e.target.value)}
      />
      <button onClick={handleReset}>重置表单</button>
      <button onClick={forceReset}>强制重置组件</button>
    </div>
  );
}

// 10. State与Props的结合
interface ControlledInputProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
}

function ControlledInput({ 
  value, 
  defaultValue = '', 
  onChange 
}: ControlledInputProps) {
  // 判断是受控还是非受控
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue);
  
  const currentValue = isControlled ? value : internalValue;
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    if (!isControlled) {
      setInternalValue(newValue);
    }
    
    onChange?.(newValue);
  };
  
  return (
    <input 
      value={currentValue} 
      onChange={handleChange} 
    />
  );
}

// 导出所有组件
export {
  Counter,
  UserProfile,
  UserForm,
  TodoList,
  ExpensiveComponent,
  AsyncCounter,
  ConditionalUpdate,
  BatchingExample,
  ResettableForm,
  ControlledInput,
};