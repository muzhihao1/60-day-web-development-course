---
title: "Redux Toolkit现代化实践"
description: "使用Redux Toolkit简化Redux开发，包括createSlice、createAsyncThunk和RTK Query"
category: "advanced"
language: "javascript"
---

# Redux Toolkit现代化实践

## 为什么使用Redux Toolkit

Redux Toolkit是官方推荐的编写Redux逻辑的方式，它解决了传统Redux的以下问题：
- 配置复杂
- 需要大量样板代码
- 需要手动配置常用中间件
- 不可变更新逻辑容易出错

## 基础配置

### 1. Store配置

```javascript
// store/index.js
import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import cartReducer from './slices/cartSlice';
import productsReducer from './slices/productsSlice';
import notificationReducer from './slices/notificationSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    cart: cartReducer,
    products: productsReducer,
    notification: notificationReducer
  },
  // 自动包含redux-thunk和Redux DevTools
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // 忽略特定的action types
        ignoredActions: ['cart/addItem'],
        // 忽略state中的特定路径
        ignoredPaths: ['user.lastLogin']
      }
    }),
  devTools: process.env.NODE_ENV !== 'production'
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

### 2. 使用createSlice

```javascript
// store/slices/cartSlice.js
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  total: 0,
  isLoading: false,
  error: null
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // Redux Toolkit使用Immer，可以直接修改state
    addItem: (state, action) => {
      const existingItem = state.items.find(
        item => item.id === action.payload.id
      );
      
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.items.push({
          ...action.payload,
          quantity: 1
        });
      }
      
      // 重新计算总价
      state.total = state.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
    },
    
    removeItem: (state, action) => {
      state.items = state.items.filter(
        item => item.id !== action.payload
      );
      
      state.total = state.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
    },
    
    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const item = state.items.find(item => item.id === id);
      
      if (item) {
        if (quantity <= 0) {
          state.items = state.items.filter(item => item.id !== id);
        } else {
          item.quantity = quantity;
        }
        
        state.total = state.items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
      }
    },
    
    clearCart: (state) => {
      state.items = [];
      state.total = 0;
    },
    
    // 准备函数，用于预处理payload
    addItemWithMetadata: {
      reducer: (state, action) => {
        state.items.push(action.payload);
      },
      prepare: (item) => {
        return {
          payload: {
            ...item,
            addedAt: new Date().toISOString(),
            id: `${item.id}_${Date.now()}`
          }
        };
      }
    }
  }
});

// 导出actions
export const {
  addItem,
  removeItem,
  updateQuantity,
  clearCart,
  addItemWithMetadata
} = cartSlice.actions;

// 导出reducer
export default cartSlice.reducer;

// Selectors
export const selectCartItems = (state) => state.cart.items;
export const selectCartTotal = (state) => state.cart.total;
export const selectCartItemCount = (state) => 
  state.cart.items.reduce((count, item) => count + item.quantity, 0);
```

### 3. 使用createAsyncThunk

```javascript
// store/slices/userSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../services/api';

// 创建异步thunk
export const loginUser = createAsyncThunk(
  'user/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/login', credentials);
      // 保存token
      localStorage.setItem('token', response.data.token);
      return response.data.user;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchUserProfile = createAsyncThunk(
  'user/fetchProfile',
  async (userId, { getState, dispatch }) => {
    // 可以访问当前state
    const state = getState();
    const token = state.user.token;
    
    const response = await api.get(`/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    // 可以dispatch其他actions
    dispatch(updateLastFetch());
    
    return response.data;
  }
);

export const updateUserProfile = createAsyncThunk(
  'user/updateProfile',
  async (updates, { getState, rejectWithValue }) => {
    try {
      const userId = getState().user.data.id;
      const response = await api.patch(`/users/${userId}`, updates);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState: {
    data: null,
    token: localStorage.getItem('token'),
    isLoading: false,
    error: null,
    lastFetch: null
  },
  reducers: {
    logout: (state) => {
      state.data = null;
      state.token = null;
      localStorage.removeItem('token');
    },
    
    updateLastFetch: (state) => {
      state.lastFetch = new Date().toISOString();
    },
    
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // 登录
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
        state.token = action.payload.token;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || '登录失败';
      })
      
      // 获取用户资料
      .addCase(fetchUserProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      
      // 更新用户资料
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.data = { ...state.data, ...action.payload };
      });
  }
});

export const { logout, updateLastFetch, clearError } = userSlice.actions;
export default userSlice.reducer;
```

## RTK Query数据获取

### 1. 创建API Service

```javascript
// store/api/apiSlice.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    prepareHeaders: (headers, { getState }) => {
      const token = getState().user.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    }
  }),
  tagTypes: ['Product', 'User', 'Order'],
  endpoints: (builder) => ({
    // 获取产品列表
    getProducts: builder.query({
      query: (params) => ({
        url: 'products',
        params
      }),
      providesTags: (result = [], error, arg) => [
        'Product',
        ...result.map(({ id }) => ({ type: 'Product', id }))
      ]
    }),
    
    // 获取单个产品
    getProduct: builder.query({
      query: (id) => `products/${id}`,
      providesTags: (result, error, id) => [{ type: 'Product', id }]
    }),
    
    // 创建产品
    createProduct: builder.mutation({
      query: (product) => ({
        url: 'products',
        method: 'POST',
        body: product
      }),
      invalidatesTags: ['Product']
    }),
    
    // 更新产品
    updateProduct: builder.mutation({
      query: ({ id, ...updates }) => ({
        url: `products/${id}`,
        method: 'PATCH',
        body: updates
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Product', id }
      ]
    }),
    
    // 删除产品
    deleteProduct: builder.mutation({
      query: (id) => ({
        url: `products/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Product', id }
      ]
    })
  })
});

// 导出hooks
export const {
  useGetProductsQuery,
  useGetProductQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation
} = apiSlice;
```

### 2. 高级RTK Query特性

```javascript
// store/api/enhancedApiSlice.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({
  baseUrl: '/api',
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  }
});

// 带有自动重试的baseQuery
const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);
  
  if (result.error && result.error.status === 401) {
    // 尝试刷新token
    const refreshResult = await baseQuery('/auth/refresh', api, extraOptions);
    
    if (refreshResult.data) {
      // 存储新token
      api.dispatch(setCredentials(refreshResult.data));
      // 重试原始请求
      result = await baseQuery(args, api, extraOptions);
    } else {
      api.dispatch(logout());
    }
  }
  
  return result;
};

export const enhancedApi = createApi({
  reducerPath: 'enhancedApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Order', 'Cart'],
  endpoints: (builder) => ({
    // 订单相关
    getOrders: builder.query({
      query: ({ page = 1, limit = 10, status }) => ({
        url: 'orders',
        params: { page, limit, status }
      }),
      providesTags: (result = { orders: [] }) => [
        'Order',
        ...result.orders.map(({ id }) => ({ type: 'Order', id }))
      ],
      // 转换响应数据
      transformResponse: (response) => ({
        orders: response.data,
        totalPages: response.totalPages,
        currentPage: response.currentPage
      }),
      // 保持未使用数据60秒
      keepUnusedDataFor: 60
    }),
    
    // 创建订单（乐观更新）
    createOrder: builder.mutation({
      query: (orderData) => ({
        url: 'orders',
        method: 'POST',
        body: orderData
      }),
      // 乐观更新
      async onQueryStarted(orderData, { dispatch, queryFulfilled }) {
        // 立即更新缓存
        const patchResult = dispatch(
          enhancedApi.util.updateQueryData(
            'getOrders',
            { page: 1, limit: 10 },
            (draft) => {
              draft.orders.unshift({
                ...orderData,
                id: Date.now(),
                status: 'pending',
                createdAt: new Date().toISOString()
              });
            }
          )
        );
        
        try {
          await queryFulfilled;
        } catch {
          // 如果请求失败，撤销更新
          patchResult.undo();
        }
      },
      invalidatesTags: ['Order']
    }),
    
    // 轮询订单状态
    getOrderStatus: builder.query({
      query: (orderId) => `orders/${orderId}/status`,
      // 每5秒轮询一次
      pollingInterval: 5000
    }),
    
    // 无限滚动加载
    getInfiniteProducts: builder.query({
      query: ({ page = 1, limit = 20 }) => ({
        url: 'products',
        params: { page, limit }
      }),
      // 合并分页结果
      serializeQueryArgs: ({ endpointName }) => {
        return endpointName;
      },
      merge: (currentCache, newItems) => {
        currentCache.push(...newItems);
      },
      forceRefetch({ currentArg, previousArg }) {
        return currentArg !== previousArg;
      }
    })
  })
});

export const {
  useGetOrdersQuery,
  useCreateOrderMutation,
  useGetOrderStatusQuery,
  useGetInfiniteProductsQuery
} = enhancedApi;
```

## 组件集成

### 1. 使用RTK Query Hooks

```jsx
import { 
  useGetProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation
} from './store/api/apiSlice';

function ProductManager() {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('all');
  
  // 查询产品
  const {
    data: products,
    error,
    isLoading,
    isFetching,
    refetch
  } = useGetProductsQuery({ page, category: filter });
  
  // Mutations
  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [updateProduct] = useUpdateProductMutation();
  
  const handleCreateProduct = async (productData) => {
    try {
      const result = await createProduct(productData).unwrap();
      console.log('产品创建成功:', result);
    } catch (error) {
      console.error('创建失败:', error);
    }
  };
  
  const handleUpdateProduct = async (id, updates) => {
    try {
      await updateProduct({ id, ...updates }).unwrap();
    } catch (error) {
      console.error('更新失败:', error);
    }
  };
  
  if (isLoading) return <div>加载中...</div>;
  if (error) return <div>错误: {error.message}</div>;
  
  return (
    <div>
      <div>
        <button onClick={() => setFilter('all')}>全部</button>
        <button onClick={() => setFilter('electronics')}>电子产品</button>
        <button onClick={() => setFilter('clothing')}>服装</button>
      </div>
      
      {isFetching && <div>更新中...</div>}
      
      <ProductList 
        products={products}
        onUpdate={handleUpdateProduct}
      />
      
      <Pagination
        currentPage={page}
        onPageChange={setPage}
      />
      
      <button onClick={refetch}>刷新</button>
    </div>
  );
}
```

### 2. 预取和缓存管理

```jsx
import { apiSlice } from './store/api/apiSlice';

function ProductDetail({ productId }) {
  const dispatch = useDispatch();
  
  // 预取相关产品
  useEffect(() => {
    // 预取下一个产品
    const nextProductId = productId + 1;
    dispatch(
      apiSlice.endpoints.getProduct.initiate(nextProductId)
    );
    
    // 预取相关产品
    dispatch(
      apiSlice.endpoints.getProducts.initiate({ 
        category: 'related',
        productId 
      })
    );
  }, [productId, dispatch]);
  
  const { data: product } = useGetProductQuery(productId);
  
  return (
    <div>
      {/* 产品详情 */}
    </div>
  );
}

// 手动缓存管理
function CacheManager() {
  const dispatch = useDispatch();
  
  const handleClearCache = () => {
    dispatch(apiSlice.util.resetApiState());
  };
  
  const handleInvalidateProducts = () => {
    dispatch(
      apiSlice.util.invalidateTags(['Product'])
    );
  };
  
  return (
    <div>
      <button onClick={handleClearCache}>清除所有缓存</button>
      <button onClick={handleInvalidateProducts}>刷新产品数据</button>
    </div>
  );
}
```

## TypeScript集成

```typescript
// types.ts
export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
}

// hooks.ts
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from './store';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// 使用类型化的hooks
function TypedComponent() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(state => state.user.data);
  const cart = useAppSelector(state => state.cart);
  
  const handleLogin = () => {
    dispatch(loginUser({ email: 'user@example.com', password: '123456' }));
  };
  
  return <div>{/* 组件内容 */}</div>;
}
```

Redux Toolkit极大地简化了Redux的使用，提供了更好的开发体验和更少的样板代码。