---
day: 27
phase: "react-development"
title: "State与事件处理"
description: "深入理解React的State管理机制，掌握事件处理系统，学习受控组件模式，构建交互式用户界面"
objectives:
  - "理解State的本质和更新机制"
  - "掌握React事件系统和合成事件"
  - "学习受控组件vs非受控组件"
  - "实现复杂的表单处理"
  - "理解状态提升和管理策略"
estimatedTime: 120
difficulty: "intermediate"
prerequisites: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 25, 26]
tags:
  - "React"
  - "State"
  - "事件处理"
  - "表单"
  - "受控组件"
resources:
  - title: "React State管理"
    url: "https://react.dev/learn/state-a-components-memory"
    type: "documentation"
  - title: "React事件处理"
    url: "https://react.dev/learn/responding-to-events"
    type: "documentation"
  - title: "表单处理最佳实践"
    url: "https://react.dev/reference/react-dom/components/form"
    type: "documentation"
  - title: "React Hook Form"
    url: "https://react-hook-form.com/"
    type: "tool"
codeExamples:
  - title: "State管理模式"
    language: "javascript"
    path: "/code-examples/day-27/state-patterns.jsx"
  - title: "表单处理实战"
    language: "javascript"
    path: "/code-examples/day-27/form-handling.jsx"
---

# Day 27: State与事件处理

## 📋 学习目标

今天我们将深入探索React的核心特性之一：State管理和事件处理。State让组件能够"记住"信息，而事件处理让组件能够响应用户交互。掌握这两个概念，你就能构建出真正的交互式应用。

## 🌟 State的本质

### 1. 什么是State？

State是组件的私有数据，当State改变时，组件会重新渲染。

```jsx
import { useState } from 'react';

function Counter() {
  // useState返回一个数组：[当前值, 更新函数]
  const [count, setCount] = useState(0);
  
  console.log('组件渲染了，count =', count);
  
  return (
    <div>
      <p>当前计数：{count}</p>
      <button onClick={() => setCount(count + 1)}>
        增加
      </button>
    </div>
  );
}

// State的特点：
// 1. 组件私有 - 每个组件实例都有自己的state
// 2. 可变 - 可以通过setState更新
// 3. 触发重渲染 - state改变会导致组件重新渲染
// 4. 异步更新 - setState是异步的
```

### 2. State更新机制

```jsx
function StateUpdates() {
  const [count, setCount] = useState(0);
  const [user, setUser] = useState({ name: '张三', age: 25 });
  
  // ❌ 错误：直接修改state
  const wrongUpdate = () => {
    count++; // 不会触发重渲染
    user.age = 26; // 不会触发重渲染
  };
  
  // ✅ 正确：使用setState
  const correctUpdate = () => {
    setCount(count + 1);
    setUser({ ...user, age: 26 });
  };
  
  // 批量更新
  const batchUpdate = () => {
    // React会批量处理这些更新，只触发一次重渲染
    setCount(count + 1);
    setUser({ ...user, age: user.age + 1 });
  };
  
  // 基于前一个state更新（推荐）
  const safeUpdate = () => {
    setCount(prevCount => prevCount + 1);
    setUser(prevUser => ({ ...prevUser, age: prevUser.age + 1 }));
  };
  
  // 多次更新同一个state
  const multipleUpdates = () => {
    // ❌ 只会增加1（因为count值被闭包捕获）
    setCount(count + 1);
    setCount(count + 1);
    setCount(count + 1);
    
    // ✅ 会增加3（使用函数式更新）
    setCount(prev => prev + 1);
    setCount(prev => prev + 1);
    setCount(prev => prev + 1);
  };
  
  return (
    <div>
      <p>Count: {count}</p>
      <p>User: {user.name}, {user.age}岁</p>
      <button onClick={safeUpdate}>安全更新</button>
    </div>
  );
}
```

### 3. State的惰性初始化

```jsx
// 当初始state需要复杂计算时，使用惰性初始化
function ExpensiveComponent() {
  // ❌ 每次渲染都会执行
  const [data, setData] = useState(expensiveComputation());
  
  // ✅ 只在首次渲染时执行
  const [data, setData] = useState(() => expensiveComputation());
  
  // 实际例子：从localStorage读取
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved || 'light';
  });
  
  return <div>...</div>;
}

// 复杂state的初始化
function TodoApp() {
  const [todos, setTodos] = useState(() => {
    try {
      const saved = localStorage.getItem('todos');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  
  // 保存到localStorage
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);
  
  return <div>...</div>;
}
```

## 🎯 React事件系统

### 1. 合成事件（SyntheticEvent）

React使用合成事件系统，提供跨浏览器的一致性。

```jsx
function EventDemo() {
  // React事件处理
  const handleClick = (e) => {
    // e是合成事件对象
    console.log('合成事件', e);
    console.log('事件类型', e.type);
    console.log('目标元素', e.target);
    console.log('当前元素', e.currentTarget);
    
    // 阻止默认行为
    e.preventDefault();
    
    // 阻止事件冒泡
    e.stopPropagation();
    
    // 访问原生事件
    console.log('原生事件', e.nativeEvent);
  };
  
  // 事件命名：驼峰式
  return (
    <div 
      onClick={handleClick}
      onMouseEnter={() => console.log('鼠标进入')}
      onMouseLeave={() => console.log('鼠标离开')}
    >
      <button onClick={handleClick}>点击我</button>
    </div>
  );
}
```

### 2. 常用事件类型

```jsx
function EventTypes() {
  return (
    <div>
      {/* 鼠标事件 */}
      <button
        onClick={(e) => console.log('点击')}
        onDoubleClick={(e) => console.log('双击')}
        onMouseDown={(e) => console.log('鼠标按下')}
        onMouseUp={(e) => console.log('鼠标抬起')}
        onMouseEnter={(e) => console.log('鼠标进入')}
        onMouseLeave={(e) => console.log('鼠标离开')}
        onMouseMove={(e) => console.log('鼠标移动')}
        onContextMenu={(e) => {
          e.preventDefault();
          console.log('右键菜单');
        }}
      >
        鼠标事件测试
      </button>
      
      {/* 键盘事件 */}
      <input
        onKeyDown={(e) => console.log('键盘按下', e.key)}
        onKeyUp={(e) => console.log('键盘抬起', e.key)}
        onKeyPress={(e) => console.log('键盘按键', e.key)}
      />
      
      {/* 表单事件 */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          console.log('表单提交');
        }}
      >
        <input
          onChange={(e) => console.log('输入改变', e.target.value)}
          onFocus={(e) => console.log('获得焦点')}
          onBlur={(e) => console.log('失去焦点')}
        />
        
        <select onChange={(e) => console.log('选择改变', e.target.value)}>
          <option value="1">选项1</option>
          <option value="2">选项2</option>
        </select>
      </form>
      
      {/* 触摸事件（移动端） */}
      <div
        onTouchStart={(e) => console.log('触摸开始')}
        onTouchMove={(e) => console.log('触摸移动')}
        onTouchEnd={(e) => console.log('触摸结束')}
      >
        触摸区域
      </div>
      
      {/* 其他事件 */}
      <div
        onScroll={(e) => console.log('滚动')}
        onWheel={(e) => console.log('滚轮')}
      >
        <img
          src="image.jpg"
          onLoad={(e) => console.log('图片加载完成')}
          onError={(e) => console.log('图片加载失败')}
        />
      </div>
    </div>
  );
}
```

### 3. 事件处理最佳实践

```jsx
function EventBestPractices() {
  const [items, setItems] = useState([1, 2, 3, 4, 5]);
  
  // ❌ 避免在渲染时创建新函数
  const BadExample = () => (
    <div>
      {items.map(item => (
        <button key={item} onClick={() => console.log(item)}>
          Item {item}
        </button>
      ))}
    </div>
  );
  
  // ✅ 使用事件委托
  const GoodExample = () => {
    const handleClick = (e) => {
      const item = e.target.dataset.item;
      if (item) {
        console.log('点击了', item);
      }
    };
    
    return (
      <div onClick={handleClick}>
        {items.map(item => (
          <button key={item} data-item={item}>
            Item {item}
          </button>
        ))}
      </div>
    );
  };
  
  // ✅ 使用柯里化函数
  const handleItemClick = (item) => (e) => {
    console.log('点击了', item);
  };
  
  // ✅ 传递参数的正确方式
  const handleDelete = (id, e) => {
    e.stopPropagation();
    setItems(items.filter(item => item !== id));
  };
  
  return (
    <div>
      {items.map(item => (
        <div key={item} onClick={() => console.log('容器被点击')}>
          <span>Item {item}</span>
          <button onClick={(e) => handleDelete(item, e)}>
            删除
          </button>
        </div>
      ))}
    </div>
  );
}
```

## 📝 受控组件 vs 非受控组件

### 1. 受控组件

受控组件的值由React State控制。

```jsx
// 受控输入框
function ControlledInput() {
  const [value, setValue] = useState('');
  
  const handleChange = (e) => {
    // 可以在这里添加验证逻辑
    const newValue = e.target.value;
    
    // 只允许数字
    if (/^\d*$/.test(newValue)) {
      setValue(newValue);
    }
  };
  
  return (
    <div>
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder="只能输入数字"
      />
      <p>当前值：{value}</p>
    </div>
  );
}

// 受控表单完整示例
function ControlledForm() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    gender: '',
    hobbies: [],
    agreement: false
  });
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleHobbyChange = (hobby) => {
    setFormData(prev => ({
      ...prev,
      hobbies: prev.hobbies.includes(hobby)
        ? prev.hobbies.filter(h => h !== hobby)
        : [...prev.hobbies, hobby]
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('提交的数据：', formData);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input
        name="username"
        value={formData.username}
        onChange={handleInputChange}
        placeholder="用户名"
        required
      />
      
      <input
        name="email"
        type="email"
        value={formData.email}
        onChange={handleInputChange}
        placeholder="邮箱"
        required
      />
      
      <input
        name="password"
        type="password"
        value={formData.password}
        onChange={handleInputChange}
        placeholder="密码"
        required
      />
      
      <select name="gender" value={formData.gender} onChange={handleInputChange}>
        <option value="">请选择性别</option>
        <option value="male">男</option>
        <option value="female">女</option>
      </select>
      
      <div>
        <label>
          <input
            type="checkbox"
            checked={formData.hobbies.includes('reading')}
            onChange={() => handleHobbyChange('reading')}
          />
          阅读
        </label>
        <label>
          <input
            type="checkbox"
            checked={formData.hobbies.includes('sports')}
            onChange={() => handleHobbyChange('sports')}
          />
          运动
        </label>
      </div>
      
      <label>
        <input
          name="agreement"
          type="checkbox"
          checked={formData.agreement}
          onChange={handleInputChange}
        />
        同意用户协议
      </label>
      
      <button type="submit" disabled={!formData.agreement}>
        提交
      </button>
    </form>
  );
}
```

### 2. 非受控组件

非受控组件使用ref来获取表单值。

```jsx
import { useRef } from 'react';

// 非受控输入框
function UncontrolledInput() {
  const inputRef = useRef(null);
  
  const handleSubmit = () => {
    console.log('输入值：', inputRef.current.value);
  };
  
  return (
    <div>
      <input ref={inputRef} type="text" defaultValue="初始值" />
      <button onClick={handleSubmit}>获取值</button>
    </div>
  );
}

// 非受控表单
function UncontrolledForm() {
  const formRef = useRef(null);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // 使用FormData API获取表单数据
    const formData = new FormData(formRef.current);
    const data = Object.fromEntries(formData.entries());
    
    console.log('表单数据：', data);
  };
  
  return (
    <form ref={formRef} onSubmit={handleSubmit}>
      <input name="username" defaultValue="" placeholder="用户名" />
      <input name="email" type="email" placeholder="邮箱" />
      
      <select name="category" defaultValue="general">
        <option value="general">普通</option>
        <option value="premium">高级</option>
      </select>
      
      <textarea name="message" defaultValue="" placeholder="留言" />
      
      <button type="submit">提交</button>
    </form>
  );
}

// 文件上传（必须使用非受控组件）
function FileUpload() {
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleUpload = () => {
    const file = fileInputRef.current.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('image', file);
      
      // 上传文件
      fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
    }
  };
  
  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
      />
      
      {preview && (
        <div>
          <img src={preview} alt="预览" style={{ maxWidth: '200px' }} />
        </div>
      )}
      
      <button onClick={handleUpload}>上传</button>
    </div>
  );
}
```

### 3. 何时使用哪种？

```jsx
// 使用受控组件的场景：
// 1. 需要实时验证
// 2. 条件性地禁用提交按钮
// 3. 强制输入格式
// 4. 多个输入联动

function ControlledScenario() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const passwordsMatch = password === confirmPassword && password.length > 0;
  
  return (
    <div>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="密码"
      />
      
      <input
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        placeholder="确认密码"
        style={{ 
          borderColor: confirmPassword && !passwordsMatch ? 'red' : 'initial' 
        }}
      />
      
      {confirmPassword && !passwordsMatch && (
        <p style={{ color: 'red' }}>密码不匹配</p>
      )}
      
      <button disabled={!passwordsMatch}>提交</button>
    </div>
  );
}

// 使用非受控组件的场景：
// 1. 集成第三方库
// 2. 文件上传
// 3. 一次性获取值（如表单提交）
// 4. 不需要实时响应的表单
```

## 🔄 状态提升和管理

### 1. 状态提升（Lifting State Up）

当多个组件需要共享状态时，将状态提升到共同的父组件。

```jsx
// 温度转换器示例
function TemperatureInput({ scale, temperature, onTemperatureChange }) {
  const scaleNames = {
    c: '摄氏度',
    f: '华氏度'
  };
  
  const handleChange = (e) => {
    onTemperatureChange(e.target.value);
  };
  
  return (
    <fieldset>
      <legend>输入{scaleNames[scale]}：</legend>
      <input value={temperature} onChange={handleChange} />
    </fieldset>
  );
}

function TemperatureCalculator() {
  const [temperature, setTemperature] = useState('');
  const [scale, setScale] = useState('c');
  
  const handleCelsiusChange = (temperature) => {
    setScale('c');
    setTemperature(temperature);
  };
  
  const handleFahrenheitChange = (temperature) => {
    setScale('f');
    setTemperature(temperature);
  };
  
  const celsius = scale === 'f' ? tryConvert(temperature, toCelsius) : temperature;
  const fahrenheit = scale === 'c' ? tryConvert(temperature, toFahrenheit) : temperature;
  
  return (
    <div>
      <TemperatureInput
        scale="c"
        temperature={celsius}
        onTemperatureChange={handleCelsiusChange}
      />
      
      <TemperatureInput
        scale="f"
        temperature={fahrenheit}
        onTemperatureChange={handleFahrenheitChange}
      />
      
      <BoilingVerdict celsius={parseFloat(celsius)} />
    </div>
  );
}

// 转换函数
function toCelsius(fahrenheit) {
  return (fahrenheit - 32) * 5 / 9;
}

function toFahrenheit(celsius) {
  return (celsius * 9 / 5) + 32;
}

function tryConvert(temperature, convert) {
  const input = parseFloat(temperature);
  if (Number.isNaN(input)) {
    return '';
  }
  const output = convert(input);
  const rounded = Math.round(output * 1000) / 1000;
  return rounded.toString();
}
```

### 2. 状态管理策略

```jsx
// 1. 单一数据源原则
function TodoApp() {
  // 所有待办事项的状态集中管理
  const [todos, setTodos] = useState([]);
  const [filter, setFilter] = useState('all'); // all, active, completed
  
  // 派生状态（不需要单独的state）
  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });
  
  const stats = {
    total: todos.length,
    active: todos.filter(t => !t.completed).length,
    completed: todos.filter(t => t.completed).length
  };
  
  // 所有修改都通过这些函数
  const addTodo = (text) => {
    setTodos([...todos, { id: Date.now(), text, completed: false }]);
  };
  
  const toggleTodo = (id) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };
  
  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };
  
  return (
    <div>
      <TodoInput onAdd={addTodo} />
      <TodoFilter filter={filter} onFilterChange={setFilter} />
      <TodoList 
        todos={filteredTodos} 
        onToggle={toggleTodo}
        onDelete={deleteTodo}
      />
      <TodoStats stats={stats} />
    </div>
  );
}

// 2. 状态分离策略
function ComplexForm() {
  // 将相关的状态分组
  const [personalInfo, setPersonalInfo] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });
  
  const [addressInfo, setAddressInfo] = useState({
    street: '',
    city: '',
    zipCode: ''
  });
  
  const [preferences, setPreferences] = useState({
    newsletter: false,
    notifications: true,
    theme: 'light'
  });
  
  // 分别处理不同部分的更新
  const updatePersonalInfo = (field, value) => {
    setPersonalInfo(prev => ({ ...prev, [field]: value }));
  };
  
  const updateAddressInfo = (field, value) => {
    setAddressInfo(prev => ({ ...prev, [field]: value }));
  };
  
  const updatePreferences = (field, value) => {
    setPreferences(prev => ({ ...prev, [field]: value }));
  };
  
  return (
    <form>
      <PersonalInfoSection 
        data={personalInfo} 
        onChange={updatePersonalInfo} 
      />
      <AddressSection 
        data={addressInfo} 
        onChange={updateAddressInfo} 
      />
      <PreferencesSection 
        data={preferences} 
        onChange={updatePreferences} 
      />
    </form>
  );
}
```

## 💼 实战项目：任务管理应用

### 完整的任务管理应用示例

```jsx
// 主应用组件
function TaskManager() {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('tasks');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  
  // 保存到localStorage
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);
  
  // 过滤和排序任务
  const processedTasks = useMemo(() => {
    let result = [...tasks];
    
    // 搜索过滤
    if (searchTerm) {
      result = result.filter(task => 
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // 状态过滤
    if (filter !== 'all') {
      result = result.filter(task => {
        if (filter === 'active') return !task.completed;
        if (filter === 'completed') return task.completed;
        if (filter === 'urgent') return task.priority === 'high' && !task.completed;
        return true;
      });
    }
    
    // 排序
    result.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'priority':
          const priorityOrder = { high: 0, medium: 1, low: 2 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        case 'dueDate':
          return new Date(a.dueDate || '9999-12-31') - new Date(b.dueDate || '9999-12-31');
        default: // createdAt
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });
    
    return result;
  }, [tasks, filter, searchTerm, sortBy]);
  
  // 任务操作
  const addTask = (taskData) => {
    const newTask = {
      id: Date.now().toString(),
      ...taskData,
      completed: false,
      createdAt: new Date().toISOString()
    };
    setTasks([newTask, ...tasks]);
  };
  
  const updateTask = (id, updates) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, ...updates } : task
    ));
  };
  
  const deleteTask = (id) => {
    if (window.confirm('确定要删除这个任务吗？')) {
      setTasks(tasks.filter(task => task.id !== id));
    }
  };
  
  const toggleTask = (id) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };
  
  // 批量操作
  const markAllComplete = () => {
    setTasks(tasks.map(task => ({ ...task, completed: true })));
  };
  
  const clearCompleted = () => {
    setTasks(tasks.filter(task => !task.completed));
  };
  
  // 统计信息
  const stats = {
    total: tasks.length,
    active: tasks.filter(t => !t.completed).length,
    completed: tasks.filter(t => t.completed).length,
    urgent: tasks.filter(t => t.priority === 'high' && !t.completed).length
  };
  
  return (
    <div className="task-manager">
      <h1>任务管理器</h1>
      
      <TaskStats stats={stats} />
      
      <div className="controls">
        <SearchBar value={searchTerm} onChange={setSearchTerm} />
        <FilterBar filter={filter} onChange={setFilter} />
        <SortControl sortBy={sortBy} onChange={setSortBy} />
      </div>
      
      <TaskForm onSubmit={addTask} />
      
      <TaskList
        tasks={processedTasks}
        onToggle={toggleTask}
        onUpdate={updateTask}
        onDelete={deleteTask}
      />
      
      <div className="bulk-actions">
        <button onClick={markAllComplete}>全部完成</button>
        <button onClick={clearCompleted}>清除已完成</button>
      </div>
    </div>
  );
}

// 任务表单组件
function TaskForm({ onSubmit }) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    tags: []
  });
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.title.trim()) {
      onSubmit(formData);
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        dueDate: '',
        tags: []
      });
      setIsOpen(false);
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  if (!isOpen) {
    return (
      <button className="add-task-btn" onClick={() => setIsOpen(true)}>
        + 添加新任务
      </button>
    );
  }
  
  return (
    <form onSubmit={handleSubmit} className="task-form">
      <input
        name="title"
        value={formData.title}
        onChange={handleChange}
        placeholder="任务标题"
        autoFocus
        required
      />
      
      <textarea
        name="description"
        value={formData.description}
        onChange={handleChange}
        placeholder="任务描述（可选）"
        rows="3"
      />
      
      <div className="form-row">
        <select name="priority" value={formData.priority} onChange={handleChange}>
          <option value="low">低优先级</option>
          <option value="medium">中优先级</option>
          <option value="high">高优先级</option>
        </select>
        
        <input
          type="date"
          name="dueDate"
          value={formData.dueDate}
          onChange={handleChange}
          min={new Date().toISOString().split('T')[0]}
        />
      </div>
      
      <div className="form-actions">
        <button type="submit">创建任务</button>
        <button type="button" onClick={() => setIsOpen(false)}>
          取消
        </button>
      </div>
    </form>
  );
}
```

## 🎯 今日练习

1. **基础练习**：创建一个购物车组件，实现添加、删除、修改数量功能
2. **进阶练习**：实现一个多步骤表单，包含数据验证和步骤导航
3. **挑战练习**：构建一个实时搜索组件，支持防抖和搜索历史

## 🚀 下一步

明天我们将学习：
- React Hooks深入（useEffect、useContext等）
- 副作用处理和清理
- 自定义Hooks开发
- Hook使用规则和最佳实践

## 💭 思考题

1. State更新为什么是异步的？这带来了什么好处？
2. 什么时候应该使用受控组件，什么时候使用非受控组件？
3. 如何避免不必要的组件重渲染？
4. 状态应该放在哪个组件？如何决定状态的位置？

记住：**State和事件处理是React交互的核心。理解它们的工作原理，才能构建出流畅的用户体验！**