// jsx-basics.tsx - JSX语法基础

import React from 'react';

// 1. JSX表达式
function Expressions() {
  const name = 'React';
  const version = 18;
  const isAwesome = true;
  
  return (
    <div>
      <h1>欢迎来到{name} {version}</h1>
      <p>{name}很{isAwesome ? '棒' : '一般'}</p>
      <p>2 + 2 = {2 + 2}</p>
      <p>当前时间：{new Date().toLocaleTimeString()}</p>
    </div>
  );
}

// 2. JSX属性
function Attributes() {
  const imageUrl = 'https://via.placeholder.com/150';
  const linkProps = {
    href: 'https://react.dev',
    target: '_blank',
    rel: 'noopener noreferrer',
  };
  
  return (
    <div>
      {/* 字符串属性 */}
      <img src={imageUrl} alt="示例图片" />
      
      {/* 表达式属性 */}
      <div className={`box ${isActive ? 'active' : ''}`}>
        动态类名
      </div>
      
      {/* 展开属性 */}
      <a {...linkProps}>访问React官网</a>
      
      {/* 布尔属性 */}
      <button disabled>禁用按钮</button>
      <input type="checkbox" checked readOnly />
    </div>
  );
}

// 3. JSX子元素
function Children() {
  return (
    <div>
      {/* 字符串字面量 */}
      <p>这是一段文本</p>
      
      {/* JSX元素 */}
      <div>
        <span>嵌套的</span>
        <strong>JSX元素</strong>
      </div>
      
      {/* 表达式作为子元素 */}
      <ul>
        {[1, 2, 3].map(num => (
          <li key={num}>项目 {num}</li>
        ))}
      </ul>
      
      {/* 函数作为子元素 */}
      <div>
        {(() => {
          const hour = new Date().getHours();
          if (hour < 12) return <p>早上好！</p>;
          if (hour < 18) return <p>下午好！</p>;
          return <p>晚上好！</p>;
        })()}
      </div>
    </div>
  );
}

// 4. JSX中的注释
function Comments() {
  return (
    <div>
      {/* 这是单行注释 */}
      
      {/* 
        这是
        多行注释
      */}
      
      <p>
        {/* 行内注释 */}
        这里有一些文本
      </p>
    </div>
  );
}

// 5. Fragment的使用
function FragmentDemo() {
  return (
    <>
      <h1>标题</h1>
      <p>段落1</p>
      <p>段落2</p>
    </>
  );
}

// 带key的Fragment
function KeyedFragment() {
  const items = [
    { id: 1, title: '标题1', content: '内容1' },
    { id: 2, title: '标题2', content: '内容2' },
  ];
  
  return (
    <div>
      {items.map(item => (
        <React.Fragment key={item.id}>
          <h3>{item.title}</h3>
          <p>{item.content}</p>
        </React.Fragment>
      ))}
    </div>
  );
}

// 6. 防止XSS攻击
function SafeContent() {
  const userInput = '<script>alert("XSS")</script>';
  const safeHtml = { __html: '<b>安全的HTML内容</b>' };
  
  return (
    <div>
      {/* React会自动转义 */}
      <p>{userInput}</p>
      
      {/* 危险地设置HTML（谨慎使用） */}
      <div dangerouslySetInnerHTML={safeHtml} />
    </div>
  );
}

// 7. JSX中的样式
function Styling() {
  const dynamicColor = 'blue';
  
  return (
    <div>
      {/* 内联样式对象 */}
      <p style={{ 
        color: 'red', 
        fontSize: '18px',
        backgroundColor: '#f0f0f0',
        padding: '10px',
      }}>
        内联样式
      </p>
      
      {/* 动态样式 */}
      <p style={{ color: dynamicColor }}>
        动态颜色
      </p>
      
      {/* CSS类 */}
      <div className="card">
        使用CSS类
      </div>
    </div>
  );
}

// 8. 事件处理
function EventHandling() {
  const handleClick = (e: React.MouseEvent) => {
    console.log('按钮被点击了！', e.currentTarget);
  };
  
  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('输入值：', e.target.value);
  };
  
  return (
    <div>
      <button onClick={handleClick}>点击我</button>
      <button onClick={() => console.log('内联处理')}>
        内联事件处理
      </button>
      <input 
        type="text" 
        onChange={handleInput}
        placeholder="输入一些内容"
      />
    </div>
  );
}

// 9. JSX的限制和规则
function JSXRules() {
  return (
    <div>
      {/* 必须有一个根元素 */}
      
      {/* class -> className */}
      <div className="container">
        
        {/* for -> htmlFor */}
        <label htmlFor="input">标签</label>
        <input id="input" type="text" />
        
        {/* 所有标签必须闭合 */}
        <br />
        <img src="" alt="" />
        <input type="text" />
        
        {/* 驼峰命名属性 */}
        <div 
          tabIndex={0}
          onClick={() => {}}
          onMouseOver={() => {}}
        >
          驼峰命名
        </div>
      </div>
    </div>
  );
}

// 导出所有示例
export {
  Expressions,
  Attributes,
  Children,
  Comments,
  FragmentDemo,
  KeyedFragment,
  SafeContent,
  Styling,
  EventHandling,
  JSXRules,
};