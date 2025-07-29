// event-handling.tsx - React事件处理完全指南

import React, { useState, useCallback, FormEvent, ChangeEvent, MouseEvent } from 'react';

// 1. 基础事件处理
function BasicEventHandling() {
  const [clickCount, setClickCount] = useState(0);
  const [lastEvent, setLastEvent] = useState('');
  
  // 直接内联处理
  const handleClick = () => {
    setClickCount(prev => prev + 1);
    setLastEvent('点击事件');
  };
  
  // 带参数的事件处理
  const handleClickWithParam = (message: string) => {
    setLastEvent(`点击: ${message}`);
  };
  
  // 访问原生事件对象
  const handleClickWithEvent = (e: MouseEvent<HTMLButtonElement>) => {
    console.log('按钮信息:', {
      x: e.clientX,
      y: e.clientY,
      target: e.currentTarget.textContent,
      shiftKey: e.shiftKey,
      ctrlKey: e.ctrlKey,
    });
    setLastEvent(`点击位置: (${e.clientX}, ${e.clientY})`);
  };
  
  return (
    <div style={{ padding: '20px' }}>
      <h3>基础事件处理</h3>
      <p>点击次数: {clickCount}</p>
      <p>最后事件: {lastEvent}</p>
      
      <button onClick={handleClick}>
        简单点击
      </button>
      
      <button onClick={() => handleClickWithParam('带参数')}>
        带参数点击
      </button>
      
      <button onClick={handleClickWithEvent}>
        访问事件对象
      </button>
    </div>
  );
}

// 2. 表单事件处理
function FormEventHandling() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    remember: false,
    country: '',
    comments: '',
  });
  
  // 通用输入处理器
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  // 表单提交
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // 阻止默认提交行为
    console.log('表单数据:', formData);
  };
  
  // 表单重置
  const handleReset = () => {
    setFormData({
      username: '',
      password: '',
      remember: false,
      country: '',
      comments: '',
    });
  };
  
  return (
    <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
      <h3>表单事件处理</h3>
      
      <div>
        <input
          type="text"
          name="username"
          placeholder="用户名"
          value={formData.username}
          onChange={handleInputChange}
        />
      </div>
      
      <div>
        <input
          type="password"
          name="password"
          placeholder="密码"
          value={formData.password}
          onChange={handleInputChange}
        />
      </div>
      
      <div>
        <label>
          <input
            type="checkbox"
            name="remember"
            checked={formData.remember}
            onChange={handleInputChange}
          />
          记住我
        </label>
      </div>
      
      <div>
        <select
          name="country"
          value={formData.country}
          onChange={handleInputChange}
        >
          <option value="">选择国家</option>
          <option value="cn">中国</option>
          <option value="us">美国</option>
          <option value="uk">英国</option>
        </select>
      </div>
      
      <div>
        <textarea
          name="comments"
          placeholder="评论"
          value={formData.comments}
          onChange={handleInputChange}
        />
      </div>
      
      <div>
        <button type="submit">提交</button>
        <button type="button" onClick={handleReset}>重置</button>
      </div>
    </form>
  );
}

// 3. 鼠标事件处理
function MouseEventHandling() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [hoverStatus, setHoverStatus] = useState('');
  
  // 鼠标移动
  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    setMousePosition({
      x: e.nativeEvent.offsetX,
      y: e.nativeEvent.offsetY,
    });
  };
  
  // 鼠标进入/离开
  const handleMouseEnter = () => setHoverStatus('鼠标进入');
  const handleMouseLeave = () => setHoverStatus('鼠标离开');
  
  // 拖拽相关
  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);
  
  // 右键菜单
  const handleContextMenu = (e: MouseEvent) => {
    e.preventDefault(); // 阻止默认右键菜单
    alert('自定义右键菜单');
  };
  
  // 双击
  const handleDoubleClick = () => {
    alert('双击事件触发！');
  };
  
  return (
    <div style={{ padding: '20px' }}>
      <h3>鼠标事件处理</h3>
      <div
        style={{
          width: '300px',
          height: '200px',
          border: '2px solid #ccc',
          position: 'relative',
          cursor: isDragging ? 'grabbing' : 'grab',
          backgroundColor: hoverStatus ? '#f0f0f0' : 'white',
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onContextMenu={handleContextMenu}
        onDoubleClick={handleDoubleClick}
      >
        <p>鼠标位置: ({mousePosition.x}, {mousePosition.y})</p>
        <p>状态: {hoverStatus}</p>
        <p>拖拽中: {isDragging ? '是' : '否'}</p>
      </div>
    </div>
  );
}

// 4. 键盘事件处理
function KeyboardEventHandling() {
  const [keys, setKeys] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [shortcuts, setShortcuts] = useState<string[]>([]);
  
  // 键盘按下
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    setKeys(prev => [...prev, e.key]);
    
    // 快捷键检测
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      setShortcuts(prev => [...prev, 'Ctrl+S (保存)']);
    }
    
    if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault();
      setShortcuts(prev => [...prev, 'Shift+Enter (新行)']);
    }
    
    if (e.key === 'Escape') {
      setInputValue('');
      e.currentTarget.blur();
    }
  };
  
  // 键盘释放
  const handleKeyUp = (e: React.KeyboardEvent) => {
    console.log('键盘释放:', e.key);
  };
  
  // 输入事件（IME兼容）
  const handleInput = (e: FormEvent<HTMLInputElement>) => {
    console.log('输入事件:', e.currentTarget.value);
  };
  
  return (
    <div style={{ padding: '20px' }}>
      <h3>键盘事件处理</h3>
      <input
        type="text"
        placeholder="在这里输入测试键盘事件"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        onInput={handleInput}
        style={{ width: '300px', padding: '8px' }}
      />
      
      <div>
        <h4>按键历史:</h4>
        <div style={{ maxHeight: '100px', overflow: 'auto' }}>
          {keys.map((key, index) => (
            <span key={index} style={{ marginRight: '5px' }}>
              [{key}]
            </span>
          ))}
        </div>
      </div>
      
      <div>
        <h4>检测到的快捷键:</h4>
        {shortcuts.map((shortcut, index) => (
          <div key={index}>{shortcut}</div>
        ))}
      </div>
    </div>
  );
}

// 5. 焦点事件处理
function FocusEventHandling() {
  const [focusedField, setFocusedField] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  // 获得焦点
  const handleFocus = (fieldName: string) => {
    setFocusedField(fieldName);
    // 清除该字段的错误
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  };
  
  // 失去焦点（验证）
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFocusedField('');
    
    // 简单验证
    if (!value.trim()) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: '此字段不能为空',
      }));
    }
  };
  
  return (
    <div style={{ padding: '20px' }}>
      <h3>焦点事件处理</h3>
      <p>当前聚焦: {focusedField || '无'}</p>
      
      <div style={{ marginBottom: '10px' }}>
        <input
          name="email"
          type="email"
          placeholder="邮箱"
          onFocus={() => handleFocus('email')}
          onBlur={handleBlur}
          style={{
            border: focusedField === 'email' ? '2px solid blue' : '1px solid #ccc',
            padding: '8px',
          }}
        />
        {validationErrors.email && (
          <span style={{ color: 'red', fontSize: '12px' }}>
            {validationErrors.email}
          </span>
        )}
      </div>
      
      <div>
        <input
          name="phone"
          type="tel"
          placeholder="电话"
          onFocus={() => handleFocus('phone')}
          onBlur={handleBlur}
          style={{
            border: focusedField === 'phone' ? '2px solid blue' : '1px solid #ccc',
            padding: '8px',
          }}
        />
        {validationErrors.phone && (
          <span style={{ color: 'red', fontSize: '12px' }}>
            {validationErrors.phone}
          </span>
        )}
      </div>
    </div>
  );
}

// 6. 触摸事件处理（移动端）
function TouchEventHandling() {
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });
  const [touchEnd, setTouchEnd] = useState({ x: 0, y: 0 });
  const [swipeDirection, setSwipeDirection] = useState('');
  
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchEnd({ x: touch.clientX, y: touch.clientY });
  };
  
  const handleTouchEnd = () => {
    const deltaX = touchEnd.x - touchStart.x;
    const deltaY = touchEnd.y - touchStart.y;
    
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // 水平滑动
      setSwipeDirection(deltaX > 0 ? '右滑' : '左滑');
    } else {
      // 垂直滑动
      setSwipeDirection(deltaY > 0 ? '下滑' : '上滑');
    }
  };
  
  return (
    <div style={{ padding: '20px' }}>
      <h3>触摸事件处理</h3>
      <div
        style={{
          width: '300px',
          height: '200px',
          border: '2px solid #ccc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f0f0f0',
          userSelect: 'none',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div style={{ textAlign: 'center' }}>
          <p>在移动设备上滑动</p>
          <p>滑动方向: {swipeDirection}</p>
        </div>
      </div>
    </div>
  );
}

// 7. 高级事件处理模式
function AdvancedEventPatterns() {
  const [events, setEvents] = useState<string[]>([]);
  
  // 事件委托
  const handleListClick = (e: MouseEvent<HTMLUListElement>) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'LI') {
      setEvents(prev => [...prev, `点击了: ${target.textContent}`]);
    }
  };
  
  // 防抖处理
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');
  
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchTerm]);
  
  // 节流处理
  const [scrollCount, setScrollCount] = useState(0);
  const [isThrottled, setIsThrottled] = useState(false);
  
  const handleScroll = useCallback(() => {
    if (isThrottled) return;
    
    setIsThrottled(true);
    setScrollCount(prev => prev + 1);
    
    setTimeout(() => {
      setIsThrottled(false);
    }, 100);
  }, [isThrottled]);
  
  return (
    <div style={{ padding: '20px' }}>
      <h3>高级事件处理模式</h3>
      
      {/* 事件委托示例 */}
      <div>
        <h4>事件委托</h4>
        <ul onClick={handleListClick} style={{ cursor: 'pointer' }}>
          <li>项目 1</li>
          <li>项目 2</li>
          <li>项目 3</li>
        </ul>
      </div>
      
      {/* 防抖示例 */}
      <div>
        <h4>防抖输入</h4>
        <input
          type="text"
          placeholder="输入搜索内容"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <p>防抖后的值: {debouncedTerm}</p>
      </div>
      
      {/* 节流示例 */}
      <div>
        <h4>节流滚动</h4>
        <div
          style={{
            height: '100px',
            overflow: 'auto',
            border: '1px solid #ccc',
            padding: '10px',
          }}
          onScroll={handleScroll}
        >
          <div style={{ height: '300px' }}>
            滚动此区域
            <br />
            滚动触发次数: {scrollCount}
          </div>
        </div>
      </div>
      
      {/* 事件日志 */}
      <div>
        <h4>事件日志</h4>
        <div style={{ maxHeight: '100px', overflow: 'auto' }}>
          {events.map((event, index) => (
            <div key={index}>{event}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 8. 自定义事件和事件冒泡
function EventPropagation() {
  const [log, setLog] = useState<string[]>([]);
  
  const logEvent = (message: string, e?: MouseEvent) => {
    setLog(prev => [...prev, message]);
    if (e) {
      console.log(`${message} - 事件阶段: ${e.eventPhase}`);
    }
  };
  
  // 阻止冒泡
  const handleInnerClick = (e: MouseEvent<HTMLDivElement>) => {
    logEvent('内层点击');
    e.stopPropagation(); // 阻止事件冒泡
  };
  
  // 阻止默认行为
  const handleLinkClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault(); // 阻止链接跳转
    logEvent('链接点击但阻止了跳转');
  };
  
  return (
    <div style={{ padding: '20px' }}>
      <h3>事件传播和控制</h3>
      
      {/* 事件冒泡示例 */}
      <div
        style={{
          padding: '20px',
          backgroundColor: '#f0f0f0',
          cursor: 'pointer',
        }}
        onClick={() => logEvent('外层点击')}
      >
        外层容器
        <div
          style={{
            padding: '20px',
            backgroundColor: '#d0d0d0',
            margin: '10px',
            cursor: 'pointer',
          }}
          onClick={handleInnerClick}
        >
          内层容器（点击不会冒泡）
        </div>
      </div>
      
      {/* 阻止默认行为 */}
      <div style={{ marginTop: '20px' }}>
        <a href="https://example.com" onClick={handleLinkClick}>
          点击这个链接（不会跳转）
        </a>
      </div>
      
      {/* 事件日志 */}
      <div style={{ marginTop: '20px' }}>
        <h4>事件日志</h4>
        <button onClick={() => setLog([])}>清空日志</button>
        <div style={{ maxHeight: '150px', overflow: 'auto' }}>
          {log.map((entry, index) => (
            <div key={index}>{entry}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 导出所有组件
export {
  BasicEventHandling,
  FormEventHandling,
  MouseEventHandling,
  KeyboardEventHandling,
  FocusEventHandling,
  TouchEventHandling,
  AdvancedEventPatterns,
  EventPropagation,
};