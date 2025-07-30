import React, { useState, useEffect, useRef, useCallback, useReducer, useMemo } from 'react';
// ========== WebSocket Hook ==========
const useWebSocket = (url, options = {}) => {
  const {
    onOpen,
    onMessage,
    onError,
    onClose,
    reconnectInterval = 5000,
    maxReconnectAttempts = 5,
    heartbeatInterval = 30000
  } = options;
  
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const heartbeatIntervalRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const [readyState, setReadyState] = useState(WebSocket.CONNECTING);
  const [error, setError] = useState(null);
  
  // 连接WebSocket
  const connect = useCallback(() => {
    try {
      wsRef.current = new WebSocket(url);
      
      wsRef.current.onopen = (event) => {
        console.log('WebSocket连接成功');
        setReadyState(WebSocket.OPEN);
        setError(null);
        reconnectAttemptsRef.current = 0;
        
        // 开始心跳
        startHeartbeat();
        
        if (onOpen) onOpen(event);
      };
      
      wsRef.current.onmessage = (event) => {
        if (onMessage) {
          try {
            const data = JSON.parse(event.data);
            onMessage(data);
          } catch (error) {
            console.error('解析消息失败:', error);
            onMessage(event.data);
          }
        }
      };
      
      wsRef.current.onerror = (event) => {
        console.error('WebSocket错误:', event);
        setError('连接错误');
        if (onError) onError(event);
      };
      
      wsRef.current.onclose = (event) => {
        console.log('WebSocket连接关闭');
        setReadyState(WebSocket.CLOSED);
        stopHeartbeat();
        
        if (onClose) onClose(event);
        
        // 尝试重连
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          console.log(`尝试重连 (${reconnectAttemptsRef.current}/${maxReconnectAttempts})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectInterval);
        } else {
          setError('连接失败，已达到最大重连次数');
        }
      };
    } catch (error) {
      console.error('创建WebSocket失败:', error);
      setError('创建连接失败');
    }
  }, [url, onOpen, onMessage, onError, onClose, reconnectInterval, maxReconnectAttempts]);
  
  // 发送消息
  const sendMessage = useCallback((message) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const data = typeof message === 'string' ? message : JSON.stringify(message);
      wsRef.current.send(data);
      return true;
    }
    console.warn('WebSocket未连接，无法发送消息');
    return false;
  }, []);
  
  // 心跳机制
  const startHeartbeat = useCallback(() => {
    heartbeatIntervalRef.current = setInterval(() => {
      sendMessage({ type: 'ping' });
    }, heartbeatInterval);
  }, [heartbeatInterval, sendMessage]);
  
  const stopHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
  }, []);
  
  // 断开连接
  const disconnect = useCallback(() => {
    reconnectAttemptsRef.current = maxReconnectAttempts; // 防止自动重连
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    stopHeartbeat();
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, [maxReconnectAttempts, stopHeartbeat]);
  
  // 手动重连
  const reconnect = useCallback(() => {
    disconnect();
    reconnectAttemptsRef.current = 0;
    connect();
  }, [disconnect, connect]);
  
  // 初始连接
  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, []);
  
  return {
    sendMessage,
    readyState,
    error,
    reconnect,
    disconnect
  };
};
// ========== 聊天状态管理 ==========
const chatReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_MESSAGE':
      return {
        ...state,
        messages: [...state.messages, {
          ...action.payload,
          id: action.payload.id || Date.now().toString(),
          timestamp: action.payload.timestamp || new Date().toISOString()
        }]
      };
      
    case 'ADD_MESSAGES':
      return {
        ...state,
        messages: [...action.payload, ...state.messages]
      };
      
    case 'UPDATE_MESSAGE':
      return {
        ...state,
        messages: state.messages.map(msg =>
          msg.id === action.payload.id
            ? { ...msg, ...action.payload.updates }
            : msg
        )
      };
      
    case 'DELETE_MESSAGE':
      return {
        ...state,
        messages: state.messages.filter(msg => msg.id !== action.payload)
      };
      
    case 'SET_USERS':
      return {
        ...state,
        users: action.payload
      };
      
    case 'ADD_USER':
      return {
        ...state,
        users: [...state.users, action.payload]
      };
      
    case 'REMOVE_USER':
      return {
        ...state,
        users: state.users.filter(user => user.id !== action.payload)
      };
      
    case 'UPDATE_USER':
      return {
        ...state,
        users: state.users.map(user =>
          user.id === action.payload.id
            ? { ...user, ...action.payload.updates }
            : user
        )
      };
      
    case 'SET_TYPING_USERS':
      return {
        ...state,
        typingUsers: action.payload
      };
      
    case 'ADD_TYPING_USER':
      return {
        ...state,
        typingUsers: [...new Set([...state.typingUsers, action.payload])]
      };
      
    case 'REMOVE_TYPING_USER':
      return {
        ...state,
        typingUsers: state.typingUsers.filter(id => id !== action.payload)
      };
      
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };
      
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload
      };
      
    case 'MARK_AS_READ':
      return {
        ...state,
        messages: state.messages.map(msg =>
          msg.id === action.payload
            ? { ...msg, read: true }
            : msg
        )
      };
      
    case 'MARK_ALL_AS_READ':
      return {
        ...state,
        messages: state.messages.map(msg => ({ ...msg, read: true }))
      };
      
    default:
      return state;
  }
};
const initialChatState = {
  messages: [],
  users: [],
  typingUsers: [],
  isLoading: false,
  error: null
};
// ========== 自定义Hooks ==========

// useNotifications - 浏览器通知Hook
const useNotifications = () => {
  const [permission, setPermission] = useState(Notification.permission);
  
  const requestPermission = useCallback(async () => {
    if ('Notification' in window) {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result;
    }
    return 'denied';
  }, []);
  
  const showNotification = useCallback((title, options = {}) => {
    if (permission === 'granted' && document.hidden) {
      const notification = new Notification(title, {
        icon: '/icon.png',
        badge: '/badge.png',
        ...options
      });
      
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
      
      // 自动关闭
      setTimeout(() => notification.close(), 5000);
    }
  }, [permission]);
  
  return {
    permission,
    requestPermission,
    showNotification
  };
};
// useVirtualScroll - 虚拟滚动Hook
const useVirtualScroll = (items, itemHeight, containerHeight) => {
  const [scrollTop, setScrollTop] = useState(0);
  
  const visibleRange = useMemo(() => {
    const start = Math.floor(scrollTop / itemHeight);
    const end = Math.ceil((scrollTop + containerHeight) / itemHeight);
    
    return {
      start: Math.max(0, start - 5), // 缓冲区
      end: Math.min(items.length, end + 5)
    };
  }, [scrollTop, itemHeight, containerHeight, items.length]);
  
  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end);
  }, [items, visibleRange]);
  
  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.start * itemHeight;
  
  return {
    visibleItems,
    totalHeight,
    offsetY,
    onScroll: (e) => setScrollTop(e.target.scrollTop)
  };
};
// useMessageSearch - 消息搜索Hook
const useMessageSearch = (messages) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }
    
    const searchLower = searchTerm.toLowerCase();
    const results = messages.filter(msg =>
      msg.content.toLowerCase().includes(searchLower) ||
      msg.user.name.toLowerCase().includes(searchLower)
    );
    
    setSearchResults(results);
  }, [searchTerm, messages]);
  
  return {
    searchTerm,
    setSearchTerm,
    searchResults
  };
};
// useImageUpload - 图片上传Hook
const useImageUpload = (onUpload) => {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);
  
  const handleFileSelect = useCallback(async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件');
      return;
    }
    
    // 验证文件大小 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('图片大小不能超过5MB');
      return;
    }
    
    // 创建预览
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
    };
    reader.readAsDataURL(file);
    
    // 上传文件
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      // 模拟上传
      await new Promise(resolve => setTimeout(resolve, 1000));
      const imageUrl = URL.createObjectURL(file); // 实际应该是服务器返回的URL
      
      if (onUpload) {
        onUpload(imageUrl);
      }
      
      setPreview(null);
    } catch (error) {
      console.error('上传失败:', error);
      alert('图片上传失败');
    } finally {
      setIsUploading(false);
    }
  }, [onUpload]);
  
  const triggerFileSelect = useCallback(() => {
    fileInputRef.current?.click();
  }, []);
  
  const cancelUpload = useCallback(() => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);
  
  return {
    fileInputRef,
    isUploading,
    preview,
    handleFileSelect,
    triggerFileSelect,
    cancelUpload
  };
};
// ========== 组件 ==========

// 消息组件
const Message = ({ message, currentUserId, onImageClick }) => {
  const isOwn = message.userId === currentUserId;
  const messageRef = useRef(null);
  
  useEffect(() => {
    if (message.isNew) {
      messageRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [message.isNew]);
  
  return (
    <div
      ref={messageRef}
      className={`message ${isOwn ? 'own' : 'other'} ${message.isNew ? 'new' : ''}`}
    >
      {!isOwn && (
        <img
          src={message.user.avatar}
          alt={message.user.name}
          className="user-avatar"
        />
      )}
      
      <div className="message-content">
        {!isOwn && (
          <div className="message-header">
            <span className="user-name">{message.user.name}</span>
            <span className="message-time">
              {new Date(message.timestamp).toLocaleTimeString()}
            </span>
          </div>
        )}
        
        {message.type === 'text' && (
          <div className="message-text">{message.content}</div>
        )}
        
        {message.type === 'image' && (
          <img
            src={message.content}
            alt="分享的图片"
            className="message-image"
            onClick={() => onImageClick(message.content)}
          />
        )}
        
        {message.type === 'system' && (
          <div className="message-system">{message.content}</div>
        )}
        
        <div className="message-status">
          {isOwn && (
            <>
              {message.sending && <span>发送中...</span>}
              {message.error && <span className="error">发送失败</span>}
              {message.read && <span className="read">已读</span>}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
// 用户列表组件
const UserList = ({ users, typingUsers, currentUserId }) => {
  return (
    <div className="user-list">
      <h3>在线用户 ({users.length})</h3>
      <div className="users">
        {users.map(user => (
          <div
            key={user.id}
            className={`user-item ${user.id === currentUserId ? 'current' : ''}`}
          >
            <img src={user.avatar} alt={user.name} />
            <div className="user-info">
              <span className="user-name">{user.name}</span>
              {typingUsers.includes(user.id) && (
                <span className="typing-indicator">正在输入...</span>
              )}
            </div>
            <span className={`status ${user.status}`} />
          </div>
        ))}
      </div>
    </div>
  );
};
// 输入框组件
const MessageInput = ({ onSendMessage, onTyping, disabled }) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  const inputRef = useRef(null);
  
  const imageUpload = useImageUpload((imageUrl) => {
    onSendMessage({
      type: 'image',
      content: imageUrl
    });
  });
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (message.trim() && !disabled) {
      onSendMessage({
        type: 'text',
        content: message.trim()
      });
      setMessage('');
      inputRef.current?.focus();
    }
  };
  
  const handleTyping = (e) => {
    setMessage(e.target.value);
    
    if (!isTyping) {
      setIsTyping(true);
      onTyping(true);
    }
    
    // 重置typing超时
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      onTyping(false);
    }, 1000);
  };
  
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);
  
  return (
    <form onSubmit={handleSubmit} className="message-input-form">
      <input
        ref={imageUpload.fileInputRef}
        type="file"
        accept="image/*"
        onChange={imageUpload.handleFileSelect}
        style={{ display: 'none' }}
      />
      
      {imageUpload.preview && (
        <div className="image-preview">
          <img src={imageUpload.preview} alt="预览" />
          <button
            type="button"
            onClick={imageUpload.cancelUpload}
            disabled={imageUpload.isUploading}
          >
            ×
          </button>
        </div>
      )}
      
      <div className="input-container">
        <button
          type="button"
          onClick={imageUpload.triggerFileSelect}
          disabled={disabled || imageUpload.isUploading}
          className="attach-btn"
        >
          📎
        </button>
        
        <input
          ref={inputRef}
          type="text"
          value={message}
          onChange={handleTyping}
          placeholder="输入消息..."
          disabled={disabled}
          className="message-input"
        />
        
        <button
          type="submit"
          disabled={disabled || !message.trim()}
          className="send-btn"
        >
          发送
        </button>
      </div>
    </form>
  );
};
// 搜索组件
const SearchBar = ({ searchTerm, onSearchChange, resultCount }) => {
  return (
    <div className="search-bar">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="搜索消息..."
        className="search-input"
      />
      {searchTerm && (
        <span className="search-results">
          找到 {resultCount} 条消息
        </span>
      )}
    </div>
  );
};
// 图片查看器组件
const ImageViewer = ({ imageUrl, onClose }) => {
  if (!imageUrl) return null;
  
  return (
    <div className="image-viewer" onClick={onClose}>
      <img
        src={imageUrl}
        alt="查看图片"
        onClick={(e) => e.stopPropagation()}
      />
      <button className="close-btn" onClick={onClose}>
        ×
      </button>
    </div>
  );
};
// ========== 主聊天应用 ==========
function RealtimeChat() {
  // 当前用户信息（实际应该从认证系统获取）
  const currentUser = {
    id: 'user-1',
    name: '我',
    avatar: '/avatars/me.jpg'
  };
  
  // 聊天状态
  const [state, dispatch] = useReducer(chatReducer, initialChatState);
  const messagesEndRef = useRef(null);
  const [viewingImage, setViewingImage] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  // Hooks
  const notifications = useNotifications();
  const { searchTerm, setSearchTerm, searchResults } = useMessageSearch(state.messages);
  
  // WebSocket连接
  const ws = useWebSocket('ws://localhost:8080/chat', {
    onOpen: () => {
      console.log('已连接到聊天服务器');
      // 发送用户信息
      ws.sendMessage({
        type: 'join',
        user: currentUser
      });
    },
    
    onMessage: (data) => {
      switch (data.type) {
        case 'message':
          dispatch({ type: 'ADD_MESSAGE', payload: data.message });
          
          // 显示通知
          if (data.message.userId !== currentUser.id) {
            notifications.showNotification(
              `${data.message.user.name}发来新消息`,
              {
                body: data.message.content,
                tag: 'chat-message'
              }
            );
          }
          break;
          
        case 'users':
          dispatch({ type: 'SET_USERS', payload: data.users });
          break;
          
        case 'user_joined':
          dispatch({ type: 'ADD_USER', payload: data.user });
          dispatch({
            type: 'ADD_MESSAGE',
            payload: {
              type: 'system',
              content: `${data.user.name} 加入了聊天室`
            }
          });
          break;
          
        case 'user_left':
          dispatch({ type: 'REMOVE_USER', payload: data.userId });
          dispatch({
            type: 'ADD_MESSAGE',
            payload: {
              type: 'system',
              content: `${data.userName} 离开了聊天室`
            }
          });
          break;
          
        case 'typing':
          if (data.isTyping) {
            dispatch({ type: 'ADD_TYPING_USER', payload: data.userId });
          } else {
            dispatch({ type: 'REMOVE_TYPING_USER', payload: data.userId });
          }
          break;
          
        case 'message_read':
          dispatch({
            type: 'UPDATE_MESSAGE',
            payload: {
              id: data.messageId,
              updates: { read: true }
            }
          });
          break;
          
        case 'history':
          dispatch({ type: 'ADD_MESSAGES', payload: data.messages });
          setHasMore(data.hasMore);
          break;
          
        case 'error':
          dispatch({ type: 'SET_ERROR', payload: data.message });
          break;
      }
    },
    
    onError: (error) => {
      dispatch({ type: 'SET_ERROR', payload: '连接错误' });
    },
    
    onClose: () => {
      dispatch({ type: 'SET_ERROR', payload: '连接已断开' });
    }
  });
  
  // 发送消息
  const sendMessage = useCallback((messageData) => {
    const message = {
      ...messageData,
      userId: currentUser.id,
      user: currentUser,
      timestamp: new Date().toISOString(),
      sending: true,
      isNew: true
    };
    
    // 乐观更新
    dispatch({ type: 'ADD_MESSAGE', payload: message });
    
    // 发送到服务器
    const sent = ws.sendMessage({
      type: 'message',
      message: messageData
    });
    
    if (!sent) {
      // 标记发送失败
      dispatch({
        type: 'UPDATE_MESSAGE',
        payload: {
          id: message.id,
          updates: { sending: false, error: true }
        }
      });
    }
  }, [ws, currentUser]);
  
  // 处理输入状态
  const handleTyping = useCallback((isTyping) => {
    ws.sendMessage({
      type: 'typing',
      isTyping
    });
  }, [ws]);
  
  // 加载更多消息
  const loadMoreMessages = useCallback(async () => {
    if (!hasMore || isLoadingMore) return;
    
    setIsLoadingMore(true);
    const oldestMessage = state.messages[0];
    
    ws.sendMessage({
      type: 'load_history',
      before: oldestMessage?.timestamp
    });
    
    setTimeout(() => setIsLoadingMore(false), 1000);
  }, [hasMore, isLoadingMore, state.messages, ws]);
  
  // 标记消息已读
  useEffect(() => {
    const unreadMessages = state.messages.filter(
      msg => !msg.read && msg.userId !== currentUser.id
    );
    
    unreadMessages.forEach(msg => {
      ws.sendMessage({
        type: 'mark_read',
        messageId: msg.id
      });
    });
  }, [state.messages, currentUser.id, ws]);
  
  // 自动滚动到底部
  useEffect(() => {
    if (!searchTerm) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [state.messages, searchTerm]);
  
  // 请求通知权限
  useEffect(() => {
    if (notifications.permission === 'default') {
      notifications.requestPermission();
    }
  }, [notifications]);
  
  // 缓存消息到localStorage
  useEffect(() => {
    if (state.messages.length > 0) {
      const recentMessages = state.messages.slice(-100); // 只缓存最近100条
      localStorage.setItem('chat-messages', JSON.stringify(recentMessages));
    }
  }, [state.messages]);
  
  // 从缓存恢复消息
  useEffect(() => {
    const cached = localStorage.getItem('chat-messages');
    if (cached) {
      try {
        const messages = JSON.parse(cached);
        dispatch({ type: 'ADD_MESSAGES', payload: messages });
      } catch (error) {
        console.error('恢复缓存消息失败:', error);
      }
    }
  }, []);
  
  // 处理滚动加载更多
  const handleScroll = useCallback((e) => {
    const { scrollTop } = e.target;
    if (scrollTop === 0 && hasMore && !isLoadingMore) {
      loadMoreMessages();
    }
  }, [hasMore, isLoadingMore, loadMoreMessages]);
  
  const displayMessages = searchTerm ? searchResults : state.messages;
  
  return (
    <div className="realtime-chat">
      <div className="chat-header">
        <h1>实时聊天室</h1>
        <div className="connection-status">
          {ws.readyState === WebSocket.OPEN ? (
            <span className="status online">在线</span>
          ) : ws.readyState === WebSocket.CONNECTING ? (
            <span className="status connecting">连接中...</span>
          ) : (
            <span className="status offline">离线</span>
          )}
        </div>
      </div>
      
      <div className="chat-container">
        <UserList
          users={state.users}
          typingUsers={state.typingUsers}
          currentUserId={currentUser.id}
        />
        
        <div className="chat-main">
          <SearchBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            resultCount={searchResults.length}
          />
          
          <div
            className="messages-container"
            onScroll={handleScroll}
          >
            {isLoadingMore && (
              <div className="loading-more">加载更多消息...</div>
            )}
            
            {displayMessages.map(message => (
              <Message
                key={message.id}
                message={message}
                currentUserId={currentUser.id}
                onImageClick={setViewingImage}
              />
            ))}
            
            <div ref={messagesEndRef} />
          </div>
          
          {state.typingUsers.length > 0 && (
            <div className="typing-users">
              {state.typingUsers.map(userId => {
                const user = state.users.find(u => u.id === userId);
                return user ? `${user.name} ` : '';
              }).join(', ')}
              正在输入...
            </div>
          )}
          
          <MessageInput
            onSendMessage={sendMessage}
            onTyping={handleTyping}
            disabled={ws.readyState !== WebSocket.OPEN}
          />
          
          {state.error && (
            <div className="error-message">
              {state.error}
              <button onClick={ws.reconnect}>重新连接</button>
            </div>
          )}
        </div>
      </div>
      
      <ImageViewer
        imageUrl={viewingImage}
        onClose={() => setViewingImage(null)}
      />
    </div>
  );
}
export default RealtimeChat;