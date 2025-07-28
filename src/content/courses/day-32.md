---
day: 32
phase: "react-development"
title: "Redux和Redux Toolkit"
description: "学习现代Redux开发，掌握Redux Toolkit的使用，处理异步操作，构建可扩展的状态管理架构"
objectives:
  - "理解Redux的核心概念和设计理念"
  - "掌握Redux Toolkit的现代开发方式"
  - "学习处理异步操作和副作用"
  - "使用Redux DevTools进行调试"
  - "构建生产级的Redux应用架构"
estimatedTime: 150
difficulty: "advanced"
prerequisites: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 25, 26, 27, 28, 29, 30, 31]
tags:
  - "Redux"
  - "Redux Toolkit"
  - "状态管理"
  - "异步操作"
  - "中间件"
resources:
  - title: "Redux官方文档"
    url: "https://redux.js.org/"
    type: "documentation"
  - title: "Redux Toolkit官方文档"
    url: "https://redux-toolkit.js.org/"
    type: "documentation"
  - title: "Redux最佳实践"
    url: "https://redux.js.org/style-guide/style-guide"
    type: "article"
  - title: "Redux DevTools扩展"
    url: "https://github.com/reduxjs/redux-devtools"
    type: "tool"
codeExamples:
  - title: "Redux Toolkit实战"
    language: "javascript"
    path: "/code-examples/day-32/redux-toolkit.js"
  - title: "异步操作处理"
    language: "javascript"
    path: "/code-examples/day-32/async-actions.js"
---

# Day 32: Redux和Redux Toolkit

## 📋 学习目标

Redux是JavaScript应用的可预测状态容器，它帮助我们管理复杂的应用状态。今天我们将学习现代Redux开发方式——Redux Toolkit（RTK），它大大简化了Redux的使用，提供了最佳实践和强大的工具。

## 🌟 Redux核心概念

### 1. 为什么需要Redux？

```jsx
// 没有Redux时的问题：
// 1. 状态分散在各个组件中
// 2. 组件间通信困难
// 3. 状态变化难以追踪
// 4. 难以实现时间旅行调试

// Redux解决方案：
// 1. 单一数据源（Single Source of Truth）
// 2. State是只读的
// 3. 使用纯函数进行修改

// Redux数据流：
// View -> Action -> Reducer -> Store -> View
```

### 2. Redux三大原则

```javascript
// 原则1：单一数据源
// 整个应用的state存储在一个object tree中
const appState = {
  user: { id: 1, name: '张三' },
  posts: [{ id: 1, title: '文章1' }],
  ui: { theme: 'dark', sidebarOpen: true }
};

// 原则2：State是只读的
// 唯一改变state的方法是触发action
const action = {
  type: 'user/login',
  payload: { id: 1, name: '张三' }
};

// 原则3：使用纯函数执行修改
// Reducer必须是纯函数
function userReducer(state = null, action) {
  switch (action.type) {
    case 'user/login':
      return action.payload;
    case 'user/logout':
      return null;
    default:
      return state;
  }
}
```

### 3. 传统Redux vs Redux Toolkit

```javascript
// ❌ 传统Redux：繁琐的样板代码
// actions/types.js
export const ADD_TODO = 'ADD_TODO';
export const TOGGLE_TODO = 'TOGGLE_TODO';

// actions/creators.js
export const addTodo = (text) => ({
  type: ADD_TODO,
  payload: { id: Date.now(), text, completed: false }
});

// reducers/todos.js
const initialState = [];

export default function todosReducer(state = initialState, action) {
  switch (action.type) {
    case ADD_TODO:
      return [...state, action.payload];
    case TOGGLE_TODO:
      return state.map(todo =>
        todo.id === action.payload
          ? { ...todo, completed: !todo.completed }
          : todo
      );
    default:
      return state;
  }
}

// ✅ Redux Toolkit：简洁高效
import { createSlice } from '@reduxjs/toolkit';

const todosSlice = createSlice({
  name: 'todos',
  initialState: [],
  reducers: {
    addTodo: (state, action) => {
      // 可以"直接修改"（实际使用Immer）
      state.push({
        id: Date.now(),
        text: action.payload,
        completed: false
      });
    },
    toggleTodo: (state, action) => {
      const todo = state.find(t => t.id === action.payload);
      if (todo) {
        todo.completed = !todo.completed;
      }
    }
  }
});

export const { addTodo, toggleTodo } = todosSlice.actions;
export default todosSlice.reducer;
```

## 📊 Redux Toolkit快速入门

### 1. 安装和设置

```bash
npm install @reduxjs/toolkit react-redux
```

```javascript
// store/index.js
import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import postsReducer from './postsSlice';
import uiReducer from './uiSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    posts: postsReducer,
    ui: uiReducer
  }
});

// TypeScript类型
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// App.jsx
import { Provider } from 'react-redux';
import { store } from './store';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          {/* 你的路由 */}
        </Routes>
      </Router>
    </Provider>
  );
}
```

### 2. 创建Slice

```javascript
// store/userSlice.js
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// 定义初始状态
const initialState = {
  currentUser: null,
  isLoading: false,
  error: null
};

// 创建slice
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // 登录开始
    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    
    // 登录成功
    loginSuccess: (state, action) => {
      state.isLoading = false;
      state.currentUser = action.payload;
      state.error = null;
    },
    
    // 登录失败
    loginFailure: (state, action) => {
      state.isLoading = false;
      state.currentUser = null;
      state.error = action.payload;
    },
    
    // 登出
    logout: (state) => {
      state.currentUser = null;
    },
    
    // 更新用户信息
    updateUser: (state, action) => {
      if (state.currentUser) {
        Object.assign(state.currentUser, action.payload);
      }
    }
  }
});

// 导出actions和reducer
export const { 
  loginStart, 
  loginSuccess, 
  loginFailure, 
  logout, 
  updateUser 
} = userSlice.actions;

export default userSlice.reducer;

// 选择器
export const selectCurrentUser = (state) => state.user.currentUser;
export const selectIsAuthenticated = (state) => !!state.user.currentUser;
export const selectUserLoading = (state) => state.user.isLoading;
```

### 3. 在组件中使用

```jsx
import { useSelector, useDispatch } from 'react-redux';
import { 
  selectCurrentUser, 
  selectIsAuthenticated,
  logout,
  updateUser 
} from './store/userSlice';

// 基础使用
function UserProfile() {
  const user = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const dispatch = useDispatch();
  
  const handleLogout = () => {
    dispatch(logout());
  };
  
  const handleUpdateProfile = (updates) => {
    dispatch(updateUser(updates));
  };
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return (
    <div>
      <h1>欢迎，{user.name}!</h1>
      <button onClick={handleLogout}>退出</button>
    </div>
  );
}

// 使用TypeScript的类型安全hooks
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './store';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
```

## 🔄 处理异步操作

### 1. createAsyncThunk

```javascript
// store/postsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { postsAPI } from '../api/posts';

// 创建异步thunk
export const fetchPosts = createAsyncThunk(
  'posts/fetchPosts',
  async (params, { rejectWithValue }) => {
    try {
      const response = await postsAPI.getPosts(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const createPost = createAsyncThunk(
  'posts/createPost',
  async (postData, { dispatch, getState }) => {
    const response = await postsAPI.createPost(postData);
    
    // 可以dispatch其他actions
    dispatch(showNotification({ message: '文章创建成功！' }));
    
    // 可以访问当前state
    const state = getState();
    console.log('当前用户：', state.user.currentUser);
    
    return response.data;
  }
);

export const updatePost = createAsyncThunk(
  'posts/updatePost',
  async ({ id, updates }, { rejectWithValue }) => {
    try {
      const response = await postsAPI.updatePost(id, updates);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Slice定义
const postsSlice = createSlice({
  name: 'posts',
  initialState: {
    items: [],
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
    currentPage: 1,
    totalPages: 1
  },
  reducers: {
    // 同步actions
    clearPosts: (state) => {
      state.items = [];
      state.status = 'idle';
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // 处理fetchPosts
      .addCase(fetchPosts.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.posts;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || '获取文章失败';
      })
      
      // 处理createPost
      .addCase(createPost.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      
      // 处理updatePost
      .addCase(updatePost.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          post => post.id === action.payload.id
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      });
  }
});

export const { clearPosts, setCurrentPage } = postsSlice.actions;
export default postsSlice.reducer;
```

### 2. 高级异步模式

```javascript
// 条件执行
export const fetchUserIfNeeded = createAsyncThunk(
  'user/fetchIfNeeded',
  async (userId, { getState, dispatch }) => {
    const state = getState();
    const cachedUser = state.users.byId[userId];
    
    // 如果已有缓存且未过期，直接返回
    if (cachedUser && !isExpired(cachedUser.fetchedAt)) {
      return cachedUser;
    }
    
    // 否则获取新数据
    const response = await api.getUser(userId);
    return response.data;
  },
  {
    // 条件函数：决定是否执行
    condition: (userId, { getState }) => {
      const state = getState();
      const user = state.users.byId[userId];
      
      // 如果正在加载，取消执行
      if (user?.loading) {
        return false;
      }
      
      return true;
    }
  }
);

// 取消请求
export const searchPosts = createAsyncThunk(
  'posts/search',
  async (query, { signal }) => {
    const response = await fetch(`/api/posts/search?q=${query}`, {
      signal // 传递AbortSignal
    });
    return response.json();
  }
);

// 在组件中使用
function SearchComponent() {
  const dispatch = useAppDispatch();
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    const promise = dispatch(searchPosts(searchTerm));
    
    return () => {
      // 组件卸载时取消请求
      promise.abort();
    };
  }, [searchTerm, dispatch]);
}
```

### 3. RTK Query（数据获取）

```javascript
// api/apiSlice.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    }
  }),
  tagTypes: ['Post', 'User'],
  endpoints: (builder) => ({
    // 查询端点
    getPosts: builder.query({
      query: (params) => ({
        url: '/posts',
        params
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Post', id })),
              { type: 'Post', id: 'LIST' }
            ]
          : [{ type: 'Post', id: 'LIST' }]
    }),
    
    getPost: builder.query({
      query: (id) => `/posts/${id}`,
      providesTags: (result, error, id) => [{ type: 'Post', id }]
    }),
    
    // 变更端点
    createPost: builder.mutation({
      query: (post) => ({
        url: '/posts',
        method: 'POST',
        body: post
      }),
      invalidatesTags: [{ type: 'Post', id: 'LIST' }]
    }),
    
    updatePost: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/posts/${id}`,
        method: 'PATCH',
        body: patch
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Post', id }]
    }),
    
    deletePost: builder.mutation({
      query: (id) => ({
        url: `/posts/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Post', id },
        { type: 'Post', id: 'LIST' }
      ]
    })
  })
});

// 导出hooks
export const {
  useGetPostsQuery,
  useGetPostQuery,
  useCreatePostMutation,
  useUpdatePostMutation,
  useDeletePostMutation
} = apiSlice;

// 在store中配置
export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    // 其他reducers
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware)
});

// 在组件中使用
function PostsList() {
  const { data: posts, isLoading, error } = useGetPostsQuery({
    page: 1,
    limit: 10
  });
  
  const [createPost] = useCreatePostMutation();
  const [deletePost] = useDeletePostMutation();
  
  const handleCreate = async (postData) => {
    try {
      await createPost(postData).unwrap();
      // 成功后，列表会自动更新（通过invalidatesTags）
    } catch (error) {
      console.error('创建失败：', error);
    }
  };
  
  if (isLoading) return <Loading />;
  if (error) return <Error error={error} />;
  
  return (
    <div>
      {posts.map(post => (
        <PostItem key={post.id} post={post} onDelete={deletePost} />
      ))}
    </div>
  );
}
```

## 🛠️ Redux中间件和增强器

### 1. 中间件原理和使用

```javascript
// 自定义中间件
const loggerMiddleware = (store) => (next) => (action) => {
  console.group(action.type);
  console.info('dispatching', action);
  console.log('prev state', store.getState());
  
  const result = next(action);
  
  console.log('next state', store.getState());
  console.groupEnd();
  
  return result;
};

// 错误报告中间件
const crashReporter = (store) => (next) => (action) => {
  try {
    return next(action);
  } catch (err) {
    console.error('Caught an exception!', err);
    
    // 发送错误报告
    window.errorReporting.report({
      error: err,
      action,
      state: store.getState()
    });
    
    throw err;
  }
};

// API中间件
const apiMiddleware = ({ dispatch, getState }) => (next) => async (action) => {
  // 处理API调用
  if (action.type === 'API_CALL') {
    const { endpoint, method, body, onSuccess, onError } = action.payload;
    
    dispatch({ type: `${action.meta.type}_REQUEST` });
    
    try {
      const response = await fetch(endpoint, {
        method,
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getState().auth.token}`
        }
      });
      
      const data = await response.json();
      
      dispatch({ 
        type: `${action.meta.type}_SUCCESS`, 
        payload: data 
      });
      
      if (onSuccess) dispatch(onSuccess(data));
    } catch (error) {
      dispatch({ 
        type: `${action.meta.type}_FAILURE`, 
        payload: error.message 
      });
      
      if (onError) dispatch(onError(error));
    }
    
    return;
  }
  
  return next(action);
};

// 配置store
const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // 忽略某些action的序列化检查
        ignoredActions: ['persist/PERSIST'],
        ignoredPaths: ['api.queries']
      }
    })
    .concat(loggerMiddleware)
    .concat(crashReporter)
    .concat(apiMiddleware)
});
```

### 2. Redux DevTools集成

```javascript
// 基础配置（RTK默认已集成）
const store = configureStore({
  reducer: rootReducer,
  devTools: process.env.NODE_ENV !== 'production'
});

// 高级配置
const store = configureStore({
  reducer: rootReducer,
  devTools: {
    name: 'MyApp',
    trace: true, // 捕获调用栈
    traceLimit: 25,
    features: {
      pause: true, // 启用暂停功能
      lock: true, // 启用锁定功能
      persist: true, // 启用持久化功能
      export: true, // 启用导出功能
      import: 'custom', // 自定义导入功能
      jump: true, // 启用跳转功能
      skip: true, // 启用跳过功能
      reorder: true, // 启用重排序功能
      dispatch: true, // 启用dispatch功能
      test: true // 启用测试功能
    }
  }
});

// 自定义action显示
const store = configureStore({
  reducer: rootReducer,
  devTools: {
    actionSanitizer: (action) => {
      // 隐藏敏感数据
      if (action.type === 'auth/login' && action.payload.password) {
        return {
          ...action,
          payload: {
            ...action.payload,
            password: '***'
          }
        };
      }
      return action;
    },
    stateSanitizer: (state) => {
      // 隐藏state中的敏感数据
      return {
        ...state,
        auth: {
          ...state.auth,
          token: state.auth.token ? '***' : null
        }
      };
    }
  }
});
```

## 🏗️ Redux架构模式

### 1. Feature文件夹结构

```
src/
├── app/
│   ├── store.js
│   └── hooks.js
├── features/
│   ├── auth/
│   │   ├── authSlice.js
│   │   ├── authAPI.js
│   │   ├── authSelectors.js
│   │   ├── Login.jsx
│   │   └── authSlice.test.js
│   ├── posts/
│   │   ├── postsSlice.js
│   │   ├── postsAPI.js
│   │   ├── PostsList.jsx
│   │   ├── PostDetail.jsx
│   │   └── postsSlice.test.js
│   └── cart/
│       ├── cartSlice.js
│       ├── Cart.jsx
│       └── CartItem.jsx
├── common/
│   ├── components/
│   └── utils/
└── App.jsx
```

### 2. 规范化State结构

```javascript
// 规范化数据结构
const normalizedState = {
  users: {
    byId: {
      '1': { id: '1', name: '张三', email: 'zhang@example.com' },
      '2': { id: '2', name: '李四', email: 'li@example.com' }
    },
    allIds: ['1', '2']
  },
  posts: {
    byId: {
      '101': { 
        id: '101', 
        title: '文章1', 
        content: '...', 
        authorId: '1',
        commentIds: ['201', '202']
      }
    },
    allIds: ['101']
  },
  comments: {
    byId: {
      '201': { id: '201', text: '评论1', postId: '101', authorId: '2' },
      '202': { id: '202', text: '评论2', postId: '101', authorId: '1' }
    },
    allIds: ['201', '202']
  }
};

// 使用createEntityAdapter
import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';

const postsAdapter = createEntityAdapter({
  selectId: (post) => post.id,
  sortComparer: (a, b) => b.createdAt.localeCompare(a.createdAt)
});

const postsSlice = createSlice({
  name: 'posts',
  initialState: postsAdapter.getInitialState({
    loading: false,
    error: null
  }),
  reducers: {
    postAdded: postsAdapter.addOne,
    postsReceived: postsAdapter.setAll,
    postUpdated: postsAdapter.updateOne,
    postDeleted: postsAdapter.removeOne
  }
});

// 生成的选择器
export const {
  selectAll: selectAllPosts,
  selectById: selectPostById,
  selectIds: selectPostIds,
  selectEntities: selectPostEntities,
  selectTotal: selectTotalPosts
} = postsAdapter.getSelectors((state) => state.posts);
```

### 3. 高级选择器模式

```javascript
import { createSelector } from '@reduxjs/toolkit';

// 基础选择器
const selectPosts = (state) => state.posts.items;
const selectUsers = (state) => state.users.byId;
const selectCurrentUserId = (state) => state.auth.currentUserId;
const selectSearchTerm = (state) => state.ui.searchTerm;
const selectSortBy = (state) => state.ui.sortBy;

// 记忆化选择器
export const selectCurrentUser = createSelector(
  [selectUsers, selectCurrentUserId],
  (users, userId) => userId ? users[userId] : null
);

export const selectFilteredPosts = createSelector(
  [selectPosts, selectSearchTerm],
  (posts, searchTerm) => {
    if (!searchTerm) return posts;
    
    return posts.filter(post =>
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
);

export const selectSortedPosts = createSelector(
  [selectFilteredPosts, selectSortBy],
  (posts, sortBy) => {
    const sorted = [...posts];
    
    switch (sortBy) {
      case 'date':
        return sorted.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
      case 'title':
        return sorted.sort((a, b) => 
          a.title.localeCompare(b.title)
        );
      default:
        return sorted;
    }
  }
);

// 参数化选择器
export const makeSelectPostWithAuthor = () => createSelector(
  [
    (state, postId) => selectPostById(state, postId),
    selectUsers
  ],
  (post, users) => {
    if (!post) return null;
    
    return {
      ...post,
      author: users[post.authorId]
    };
  }
);

// 在组件中使用
function PostDetail({ postId }) {
  const selectPostWithAuthor = useMemo(makeSelectPostWithAuthor, []);
  const post = useSelector(state => selectPostWithAuthor(state, postId));
  
  if (!post) return <NotFound />;
  
  return (
    <article>
      <h1>{post.title}</h1>
      <p>作者：{post.author.name}</p>
      <div>{post.content}</div>
    </article>
  );
}
```

## 💼 实战项目：电商应用状态管理

### 完整的购物车功能实现

```javascript
// features/cart/cartSlice.js
import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';

// 异步actions
export const loadCart = createAsyncThunk(
  'cart/load',
  async (_, { getState }) => {
    const { auth } = getState();
    if (auth.user) {
      // 登录用户从服务器加载
      const response = await api.getCart();
      return response.data;
    } else {
      // 未登录用户从localStorage加载
      const saved = localStorage.getItem('cart');
      return saved ? JSON.parse(saved) : { items: [] };
    }
  }
);

export const addToCart = createAsyncThunk(
  'cart/addItem',
  async ({ productId, quantity = 1 }, { getState, dispatch }) => {
    const { auth } = getState();
    
    if (auth.user) {
      const response = await api.addToCart(productId, quantity);
      return response.data;
    } else {
      // 本地处理
      return { productId, quantity };
    }
  }
);

export const syncCart = createAsyncThunk(
  'cart/sync',
  async (_, { getState }) => {
    const { cart, auth } = getState();
    if (auth.user && cart.items.length > 0) {
      const response = await api.syncCart(cart.items);
      return response.data;
    }
    return null;
  }
);

// Slice定义
const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    voucher: null,
    loading: false,
    error: null,
    lastUpdated: null
  },
  reducers: {
    updateQuantity: (state, action) => {
      const { productId, quantity } = action.payload;
      const item = state.items.find(item => item.productId === productId);
      
      if (item) {
        if (quantity <= 0) {
          state.items = state.items.filter(item => 
            item.productId !== productId
          );
        } else {
          item.quantity = quantity;
        }
        state.lastUpdated = new Date().toISOString();
      }
    },
    
    removeItem: (state, action) => {
      state.items = state.items.filter(
        item => item.productId !== action.payload
      );
      state.lastUpdated = new Date().toISOString();
    },
    
    clearCart: (state) => {
      state.items = [];
      state.voucher = null;
      state.lastUpdated = new Date().toISOString();
    },
    
    applyVoucher: (state, action) => {
      state.voucher = action.payload;
    },
    
    removeVoucher: (state) => {
      state.voucher = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // loadCart
      .addCase(loadCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.voucher = action.payload.voucher;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(loadCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      
      // addToCart
      .addCase(addToCart.fulfilled, (state, action) => {
        const { productId, quantity } = action.payload;
        const existingItem = state.items.find(
          item => item.productId === productId
        );
        
        if (existingItem) {
          existingItem.quantity += quantity;
        } else {
          state.items.push({ productId, quantity });
        }
        
        state.lastUpdated = new Date().toISOString();
      });
  }
});

export const {
  updateQuantity,
  removeItem,
  clearCart,
  applyVoucher,
  removeVoucher
} = cartSlice.actions;

export default cartSlice.reducer;

// 选择器
export const selectCartItems = (state) => state.cart.items;
export const selectCartVoucher = (state) => state.cart.voucher;

// 需要产品信息的选择器
export const selectCartItemsWithDetails = createSelector(
  [selectCartItems, (state) => state.products.byId],
  (items, products) => {
    return items.map(item => ({
      ...item,
      product: products[item.productId]
    })).filter(item => item.product); // 过滤掉找不到产品的项
  }
);

export const selectCartTotal = createSelector(
  [selectCartItemsWithDetails, selectCartVoucher],
  (items, voucher) => {
    const subtotal = items.reduce((sum, item) => {
      return sum + (item.product.price * item.quantity);
    }, 0);
    
    let discount = 0;
    if (voucher) {
      if (voucher.type === 'percentage') {
        discount = subtotal * (voucher.value / 100);
      } else {
        discount = voucher.value;
      }
    }
    
    return {
      subtotal,
      discount,
      total: Math.max(0, subtotal - discount)
    };
  }
);

// 在组件中使用
function ShoppingCart() {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectCartItemsWithDetails);
  const { subtotal, discount, total } = useAppSelector(selectCartTotal);
  const voucher = useAppSelector(selectCartVoucher);
  
  const handleQuantityChange = (productId, quantity) => {
    dispatch(updateQuantity({ productId, quantity }));
  };
  
  const handleRemove = (productId) => {
    dispatch(removeItem(productId));
  };
  
  const handleCheckout = async () => {
    // 结账逻辑
  };
  
  return (
    <div className="shopping-cart">
      <h2>购物车</h2>
      
      {items.length === 0 ? (
        <EmptyCart />
      ) : (
        <>
          <div className="cart-items">
            {items.map(item => (
              <CartItem
                key={item.productId}
                item={item}
                onQuantityChange={handleQuantityChange}
                onRemove={handleRemove}
              />
            ))}
          </div>
          
          <VoucherInput />
          
          <div className="cart-summary">
            <div>小计：¥{subtotal.toFixed(2)}</div>
            {discount > 0 && (
              <div>优惠：-¥{discount.toFixed(2)}</div>
            )}
            <div className="total">
              总计：¥{total.toFixed(2)}
            </div>
          </div>
          
          <button 
            className="checkout-btn"
            onClick={handleCheckout}
          >
            去结算
          </button>
        </>
      )}
    </div>
  );
}
```

### 持久化和同步

```javascript
// store/middleware/persistMiddleware.js
const persistMiddleware = (store) => (next) => (action) => {
  const result = next(action);
  
  // 需要持久化的actions
  const persistActions = [
    'cart/updateQuantity',
    'cart/removeItem',
    'cart/clearCart',
    'user/updatePreferences'
  ];
  
  if (persistActions.includes(action.type)) {
    const state = store.getState();
    
    // 持久化购物车
    if (action.type.startsWith('cart/')) {
      localStorage.setItem('cart', JSON.stringify(state.cart));
    }
    
    // 持久化用户偏好
    if (action.type.startsWith('user/')) {
      localStorage.setItem('preferences', JSON.stringify(state.user.preferences));
    }
  }
  
  return result;
};

// store/middleware/syncMiddleware.js
const syncMiddleware = ({ dispatch, getState }) => (next) => (action) => {
  const result = next(action);
  
  // 登录成功后同步本地数据到服务器
  if (action.type === 'auth/loginSuccess') {
    const { cart } = getState();
    if (cart.items.length > 0) {
      dispatch(syncCart());
    }
  }
  
  return result;
};

// 离线支持
const offlineMiddleware = (store) => (next) => (action) => {
  // 检查网络状态
  if (!navigator.onLine && action.type.endsWith('/pending')) {
    // 离线时将action加入队列
    const queue = JSON.parse(localStorage.getItem('actionQueue') || '[]');
    queue.push(action);
    localStorage.setItem('actionQueue', JSON.stringify(queue));
    
    return next({
      type: `${action.type}_OFFLINE`,
      payload: action.payload
    });
  }
  
  return next(action);
};

// 网络恢复时处理队列
window.addEventListener('online', () => {
  const queue = JSON.parse(localStorage.getItem('actionQueue') || '[]');
  queue.forEach(action => store.dispatch(action));
  localStorage.removeItem('actionQueue');
});
```

## 🎯 Redux最佳实践

### 1. 性能优化

```javascript
// 1. 使用Reselect避免不必要的计算
import { createSelector } from 'reselect';

// 2. 规范化数据结构减少嵌套更新
// 3. 使用React.memo和合适的比较函数
const PostItem = React.memo(({ post, onUpdate }) => {
  // 组件实现
}, (prevProps, nextProps) => {
  return prevProps.post.id === nextProps.post.id &&
         prevProps.post.updatedAt === nextProps.post.updatedAt;
});

// 4. 批量actions
const batchActions = (...actions) => ({
  type: 'BATCH_ACTIONS',
  payload: actions
});

const batchMiddleware = store => next => action => {
  if (action.type === 'BATCH_ACTIONS') {
    action.payload.forEach(a => store.dispatch(a));
    return;
  }
  return next(action);
};

// 5. 延迟非关键更新
const deferredUpdates = createSlice({
  name: 'deferred',
  initialState: { updates: [] },
  reducers: {
    scheduleUpdate: (state, action) => {
      state.updates.push(action.payload);
    },
    flushUpdates: (state) => {
      // 处理累积的更新
      state.updates = [];
    }
  }
});
```

### 2. 测试策略

```javascript
// reducers测试
import cartReducer, { addItem, removeItem } from './cartSlice';

describe('cart reducer', () => {
  const initialState = {
    items: [],
    loading: false,
    error: null
  };
  
  it('should handle initial state', () => {
    expect(cartReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });
  
  it('should handle addItem', () => {
    const actual = cartReducer(initialState, addItem({ id: 1, quantity: 2 }));
    expect(actual.items).toHaveLength(1);
    expect(actual.items[0]).toEqual({ id: 1, quantity: 2 });
  });
});

// 异步actions测试
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { fetchPosts } from './postsSlice';

const mockStore = configureMockStore([thunk]);

describe('async actions', () => {
  it('creates FETCH_POSTS_SUCCESS when fetching posts', async () => {
    const store = mockStore({ posts: [] });
    
    await store.dispatch(fetchPosts());
    
    const actions = store.getActions();
    expect(actions[0].type).toBe('posts/fetchPosts/pending');
    expect(actions[1].type).toBe('posts/fetchPosts/fulfilled');
  });
});
```

## 🎯 今日练习

1. **基础练习**：使用Redux Toolkit创建一个待办事项应用，支持增删改查和筛选功能
2. **进阶练习**：实现一个博客系统，包含文章管理、评论系统、用户认证等功能
3. **挑战练习**：构建一个实时协作应用，使用Redux管理状态，WebSocket同步数据

## 🚀 下一步

明天我们将学习：
- React性能优化策略
- React.memo和PureComponent
- useMemo和useCallback深入
- 代码分割和懒加载
- 性能监控和分析

## 💭 思考题

1. Redux和Context API各自的使用场景是什么？
2. 如何设计一个可扩展的Redux状态结构？
3. Redux Toolkit解决了传统Redux的哪些痛点？
4. 如何处理Redux中的副作用和异步操作？
5. 在大型应用中如何组织Redux代码？

记住：**Redux不是必需的，但当你需要它时，Redux Toolkit让一切变得简单。理解Redux的核心理念，选择合适的工具，构建可维护的应用！**