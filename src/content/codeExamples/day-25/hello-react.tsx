// hello-react.tsx - 第一个React组件

// 1. 最简单的React组件
function HelloWorld() {
  return <h1>Hello, React!</h1>;
}

// 2. 带Props的组件
interface GreetingProps {
  name: string;
  age?: number;
}

function Greeting({ name, age }: GreetingProps) {
  return (
    <div>
      <h2>你好，{name}！</h2>
      {age && <p>你今年{age}岁了</p>}
    </div>
  );
}

// 3. 使用React.FC类型的组件
const Welcome: React.FC<{ message: string }> = ({ message }) => {
  return (
    <div className="welcome-box">
      <p>{message}</p>
      <p>欢迎来到React的世界！</p>
    </div>
  );
};

// 4. 组件组合
function App() {
  return (
    <div className="app">
      <HelloWorld />
      <Greeting name="小明" age={25} />
      <Greeting name="小红" />
      <Welcome message="让我们开始学习React吧！" />
    </div>
  );
}

// 5. 条件渲染
function ConditionalDemo({ isLoggedIn }: { isLoggedIn: boolean }) {
  return (
    <div>
      {isLoggedIn ? (
        <h3>欢迎回来！</h3>
      ) : (
        <h3>请先登录</h3>
      )}
    </div>
  );
}

// 6. 列表渲染
function TodoList() {
  const todos = [
    { id: 1, text: '学习React基础', done: true },
    { id: 2, text: '理解JSX语法', done: true },
    { id: 3, text: '创建第一个组件', done: false },
  ];

  return (
    <ul>
      {todos.map(todo => (
        <li key={todo.id} style={{ textDecoration: todo.done ? 'line-through' : 'none' }}>
          {todo.text}
        </li>
      ))}
    </ul>
  );
}

// 7. 组件样式
function StyledComponent() {
  const styles = {
    container: {
      padding: '20px',
      backgroundColor: '#f0f0f0',
      borderRadius: '8px',
    },
    title: {
      color: '#333',
      fontSize: '24px',
      marginBottom: '10px',
    },
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>样式化组件</h2>
      <p>这是一个带有内联样式的React组件</p>
    </div>
  );
}

// 导出根组件
export default App;