---
day: 32
title: "Redux异步操作处理"
description: "Redux中处理异步操作的各种模式，包括Thunk、Saga、Observable和最佳实践"
category: "advanced"
language: "javascript"
---

# Redux异步操作处理

## Redux Thunk基础

### 1. Thunk中间件原理

```javascript
// thunk中间件的简化实现
const thunkMiddleware = ({ dispatch, getState }) => next => action => {
  // 如果action是函数，执行它
  if (typeof action === 'function') {
    return action(dispatch, getState);
  }
  
  // 否则，传递给下一个中间件
  return next(action);
};

// 使用示例
const fetchUserData = (userId) => {
  return async (dispatch, getState) => {
    // 可以访问当前state
    const state = getState();
    if (state.users[userId]) {
      return; // 已经有数据，不需要重新获取
    }
    
    dispatch({ type: 'FETCH_USER_REQUEST', payload: userId });
    
    try {
      const response = await api.getUser(userId);
      dispatch({
        type: 'FETCH_USER_SUCCESS',
        payload: response.data
      });
    } catch (error) {
      dispatch({
        type: 'FETCH_USER_FAILURE',
        payload: error.message
      });
    }
  };
};
```

### 2. 高级Thunk模式

```javascript
// actions/userActions.js
// 带有加载状态管理的thunk
export const fetchUserWithPosts = (userId) => {
  return async (dispatch, getState) => {
    dispatch(setLoading(true));
    
    try {
      // 并行获取用户和文章
      const [userResponse, postsResponse] = await Promise.all([
        api.getUser(userId),
        api.getUserPosts(userId)
      ]);
      
      dispatch(setUser(userResponse.data));
      dispatch(setPosts(postsResponse.data));
      
      // 获取文章的评论（可选）
      const postIds = postsResponse.data.map(post => post.id);
      dispatch(fetchCommentsForPosts(postIds));
      
    } catch (error) {
      dispatch(setError(error.message));
      // 显示错误通知
      dispatch(showNotification({
        type: 'error',
        message: '获取用户数据失败'
      }));
    } finally {
      dispatch(setLoading(false));
    }
  };
};

// 条件性获取数据
export const fetchUserIfNeeded = (userId) => {
  return (dispatch, getState) => {
    const state = getState();
    const user = state.users.byId[userId];
    
    if (!user) {
      return dispatch(fetchUser(userId));
    } else if (user.isStale) {
      return dispatch(refreshUser(userId));
    }
    
    return Promise.resolve();
  };
};

// 批量操作
export const batchDeleteItems = (itemIds) => {
  return async (dispatch, getState) => {
    dispatch(startBatchOperation());
    
    const results = await Promise.allSettled(
      itemIds.map(id => api.deleteItem(id))
    );
    
    const succeeded = [];
    const failed = [];
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        succeeded.push(itemIds[index]);
      } else {
        failed.push({
          id: itemIds[index],
          error: result.reason
        });
      }
    });
    
    if (succeeded.length > 0) {
      dispatch(removeItems(succeeded));
    }
    
    if (failed.length > 0) {
      dispatch(showBatchErrors(failed));
    }
    
    dispatch(endBatchOperation());
  };
};
```

### 3. Thunk组合和链式调用

```javascript
// 组合多个thunk
export const initializeApp = () => {
  return async (dispatch) => {
    dispatch(setAppLoading(true));
    
    try {
      // 检查认证状态
      await dispatch(checkAuth());
      
      // 获取用户数据
      const user = await dispatch(fetchCurrentUser());
      
      // 基于用户角色获取不同数据
      if (user.role === 'admin') {
        await dispatch(fetchAdminDashboard());
      } else {
        await dispatch(fetchUserDashboard());
      }
      
      // 获取通用数据
      await Promise.all([
        dispatch(fetchNotifications()),
        dispatch(fetchUserPreferences()),
        dispatch(fetchAppConfig())
      ]);
      
      dispatch(setAppReady(true));
    } catch (error) {
      dispatch(setInitError(error));
    } finally {
      dispatch(setAppLoading(false));
    }
  };
};

// 链式thunk调用
export const createPostWithImages = (postData, images) => {
  return async (dispatch) => {
    try {
      // 1. 上传图片
      const uploadedImages = await dispatch(uploadImages(images));
      
      // 2. 创建带图片URL的文章
      const postWithImages = {
        ...postData,
        images: uploadedImages.map(img => img.url)
      };
      
      const post = await dispatch(createPost(postWithImages));
      
      // 3. 更新本地状态
      dispatch(addPostToFeed(post));
      
      // 4. 显示成功消息
      dispatch(showNotification({
        type: 'success',
        message: '文章发布成功！'
      }));
      
      return post;
    } catch (error) {
      dispatch(showNotification({
        type: 'error',
        message: '发布失败：' + error.message
      }));
      throw error;
    }
  };
};
```

## Redux Saga高级模式

### 1. Saga基础设置

```javascript
// sagas/index.js
import { all, call, put, takeEvery, takeLatest, select, fork } from 'redux-saga/effects';
import { channel, buffers } from 'redux-saga';

// Worker Saga: 执行异步任务
function* fetchUserSaga(action) {
  try {
    yield put({ type: 'FETCH_USER_REQUEST' });
    const user = yield call(api.getUser, action.payload.userId);
    yield put({ type: 'FETCH_USER_SUCCESS', payload: user });
  } catch (error) {
    yield put({ type: 'FETCH_USER_FAILURE', payload: error.message });
  }
}

// Watcher Saga: 监听actions
function* watchFetchUser() {
  yield takeEvery('FETCH_USER', fetchUserSaga);
}

// 使用takeLatest避免重复请求
function* watchSearchSaga() {
  yield takeLatest('SEARCH_REQUEST', handleSearch);
}

function* handleSearch(action) {
  // 延迟执行（防抖）
  yield delay(500);
  
  try {
    const results = yield call(api.search, action.payload.query);
    yield put({ type: 'SEARCH_SUCCESS', payload: results });
  } catch (error) {
    yield put({ type: 'SEARCH_FAILURE', payload: error.message });
  }
}
```

### 2. 复杂流程控制

```javascript
// sagas/authSaga.js
import { 
  take, put, call, fork, cancel, cancelled, 
  race, all, select 
} from 'redux-saga/effects';

// 登录流程
function* loginFlow() {
  while (true) {
    // 等待登录请求
    const { payload: credentials } = yield take('LOGIN_REQUEST');
    
    // 创建可取消的任务
    const task = yield fork(authorize, credentials);
    
    // 等待登出或登录失败
    const action = yield take(['LOGOUT', 'LOGIN_FAILURE']);
    
    if (action.type === 'LOGOUT') {
      yield cancel(task);
    }
  }
}

function* authorize(credentials) {
  try {
    const token = yield call(api.login, credentials);
    yield put({ type: 'LOGIN_SUCCESS', payload: token });
    
    // 保存token
    yield call(localStorage.setItem, 'token', token);
    
    // 获取用户信息
    yield fork(fetchUserInfo);
    
    // 设置token刷新
    yield fork(refreshTokenPeriodically, token);
    
  } catch (error) {
    yield put({ type: 'LOGIN_FAILURE', payload: error.message });
  } finally {
    // 清理逻辑
    if (yield cancelled()) {
      yield put({ type: 'LOGIN_CANCELLED' });
    }
  }
}

// 竞态处理
function* fetchWithTimeout(resource) {
  const { response, timeout } = yield race({
    response: call(api.fetch, resource),
    timeout: delay(5000)
  });
  
  if (timeout) {
    yield put({ type: 'FETCH_TIMEOUT', payload: resource });
    throw new Error('请求超时');
  }
  
  return response;
}

// 并发限制
function* throttledFetch() {
  const tasks = [];
  const maxConcurrent = 3;
  
  while (true) {
    const action = yield take('FETCH_ITEM');
    
    if (tasks.length >= maxConcurrent) {
      // 等待一个任务完成
      yield take('FETCH_ITEM_COMPLETE');
      tasks.shift();
    }
    
    const task = yield fork(fetchItemSaga, action.payload);
    tasks.push(task);
  }
}
```

### 3. 事件通道和WebSocket

```javascript
// sagas/websocketSaga.js
import { eventChannel, END } from 'redux-saga';

function createWebSocketChannel(socket) {
  return eventChannel(emitter => {
    socket.onmessage = (event) => {
      emitter(JSON.parse(event.data));
    };
    
    socket.onerror = (error) => {
      emitter(new Error(error));
    };
    
    socket.onclose = () => {
      emitter(END);
    };
    
    // 取消订阅函数
    return () => {
      socket.close();
    };
  });
}

function* websocketSaga() {
  const socket = new WebSocket('wss://api.example.com/ws');
  const channel = yield call(createWebSocketChannel, socket);
  
  try {
    while (true) {
      const message = yield take(channel);
      
      switch (message.type) {
        case 'USER_UPDATE':
          yield put({ type: 'UPDATE_USER', payload: message.data });
          break;
        case 'NEW_MESSAGE':
          yield put({ type: 'ADD_MESSAGE', payload: message.data });
          // 显示通知
          yield fork(showNotification, message.data);
          break;
        default:
          console.log('Unknown message type:', message.type);
      }
    }
  } finally {
    if (yield cancelled()) {
      channel.close();
    }
  }
}

// 轮询示例
function* pollingSaga() {
  while (true) {
    try {
      const data = yield call(api.fetchData);
      yield put({ type: 'DATA_RECEIVED', payload: data });
      yield delay(10000); // 10秒轮询一次
    } catch (error) {
      yield put({ type: 'POLLING_ERROR', payload: error });
      yield delay(30000); // 错误时等待更长时间
    }
  }
}
```

## Redux Observable (RxJS)

### 1. Epic基础

```javascript
// epics/index.js
import { ofType } from 'redux-observable';
import { 
  map, mergeMap, catchError, 
  debounceTime, switchMap, takeUntil 
} from 'rxjs/operators';
import { of, from } from 'rxjs';
import { ajax } from 'rxjs/ajax';

// 搜索Epic with防抖
const searchEpic = (action$) =>
  action$.pipe(
    ofType('SEARCH'),
    debounceTime(500),
    switchMap(action =>
      ajax.getJSON(`/api/search?q=${action.payload}`).pipe(
        map(results => ({
          type: 'SEARCH_SUCCESS',
          payload: results
        })),
        catchError(error => of({
          type: 'SEARCH_FAILURE',
          payload: error.message
        }))
      )
    )
  );

// 自动完成Epic
const autocompleteEpic = (action$, state$) =>
  action$.pipe(
    ofType('INPUT_CHANGE'),
    debounceTime(300),
    // 只在输入长度大于2时搜索
    filter(action => action.payload.length > 2),
    // 取消之前的请求
    switchMap(action =>
      ajax.getJSON(`/api/autocomplete?q=${action.payload}`).pipe(
        map(suggestions => ({
          type: 'AUTOCOMPLETE_SUCCESS',
          payload: suggestions
        })),
        // 如果有新的输入，取消当前请求
        takeUntil(action$.pipe(ofType('INPUT_CHANGE')))
      )
    )
  );
```

### 2. 复杂流处理

```javascript
// 上传文件Epic with进度
const uploadFileEpic = (action$) =>
  action$.pipe(
    ofType('UPLOAD_FILE'),
    mergeMap(action => {
      const { file, onProgress } = action.payload;
      
      return ajax({
        url: '/api/upload',
        method: 'POST',
        body: file,
        progressSubscriber: {
          next: (event) => {
            const progress = Math.round((event.loaded / event.total) * 100);
            onProgress(progress);
          }
        }
      }).pipe(
        map(response => ({
          type: 'UPLOAD_SUCCESS',
          payload: response.response
        })),
        catchError(error => of({
          type: 'UPLOAD_FAILURE',
          payload: error.message
        }))
      );
    })
  );

// 复杂的异步流程
const checkoutEpic = (action$, state$) =>
  action$.pipe(
    ofType('CHECKOUT_START'),
    switchMap(() => {
      const state = state$.value;
      const { cart, user } = state;
      
      // 验证购物车
      return from(api.validateCart(cart)).pipe(
        mergeMap(validation => {
          if (!validation.isValid) {
            return of({
              type: 'CHECKOUT_VALIDATION_FAILED',
              payload: validation.errors
            });
          }
          
          // 创建订单
          return from(api.createOrder({
            items: cart.items,
            userId: user.id
          }));
        }),
        mergeMap(order => {
          // 处理支付
          return from(api.processPayment({
            orderId: order.id,
            amount: order.total
          })).pipe(
            map(payment => ({
              type: 'CHECKOUT_SUCCESS',
              payload: { order, payment }
            })),
            catchError(error => of({
              type: 'PAYMENT_FAILED',
              payload: error
            }))
          );
        }),
        catchError(error => of({
          type: 'CHECKOUT_FAILED',
          payload: error.message
        }))
      );
    })
  );
```

## 错误处理和重试策略

### 1. 统一错误处理

```javascript
// middleware/errorMiddleware.js
const errorMiddleware = store => next => action => {
  // 捕获所有失败的actions
  if (action.type.endsWith('_FAILURE')) {
    const error = action.payload;
    
    // 记录错误
    console.error('Action failed:', action.type, error);
    
    // 发送错误报告
    if (window.Sentry) {
      window.Sentry.captureException(error, {
        tags: {
          action: action.type
        }
      });
    }
    
    // 显示用户友好的错误消息
    const userMessage = getErrorMessage(error);
    store.dispatch(showErrorNotification(userMessage));
  }
  
  return next(action);
};

// 错误消息映射
function getErrorMessage(error) {
  const errorMap = {
    'Network Error': '网络连接失败，请检查您的网络',
    '401': '认证失败，请重新登录',
    '403': '您没有权限执行此操作',
    '404': '请求的资源不存在',
    '500': '服务器错误，请稍后重试'
  };
  
  return errorMap[error.code] || errorMap[error.status] || '操作失败，请重试';
}
```

### 2. 重试机制

```javascript
// utils/retryableThunk.js
export const createRetryableThunk = (
  asyncFunction,
  options = {}
) => {
  const {
    maxAttempts = 3,
    delay = 1000,
    backoff = 2,
    shouldRetry = (error) => true
  } = options;
  
  return (...args) => async (dispatch, getState) => {
    let lastError;
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        return await asyncFunction(...args)(dispatch, getState);
      } catch (error) {
        lastError = error;
        
        if (!shouldRetry(error) || attempt === maxAttempts - 1) {
          throw error;
        }
        
        // 指数退避
        const waitTime = delay * Math.pow(backoff, attempt);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        
        dispatch({
          type: 'RETRY_ATTEMPT',
          payload: {
            attempt: attempt + 1,
            maxAttempts,
            error: error.message
          }
        });
      }
    }
    
    throw lastError;
  };
};

// 使用示例
export const fetchDataWithRetry = createRetryableThunk(
  fetchData,
  {
    maxAttempts: 3,
    delay: 1000,
    shouldRetry: (error) => error.status >= 500
  }
);
```

### 3. 乐观更新和回滚

```javascript
// actions/optimisticActions.js
export const optimisticUpdate = (itemId, updates) => {
  return async (dispatch, getState) => {
    // 保存原始数据用于回滚
    const originalItem = selectItemById(getState(), itemId);
    
    // 乐观更新
    dispatch({
      type: 'OPTIMISTIC_UPDATE',
      payload: { itemId, updates }
    });
    
    try {
      // 发送请求到服务器
      const updatedItem = await api.updateItem(itemId, updates);
      
      // 用服务器响应替换乐观更新
      dispatch({
        type: 'UPDATE_SUCCESS',
        payload: updatedItem
      });
    } catch (error) {
      // 回滚到原始状态
      dispatch({
        type: 'UPDATE_ROLLBACK',
        payload: originalItem
      });
      
      // 显示错误
      dispatch(showErrorNotification('更新失败'));
      
      throw error;
    }
  };
};

// Saga版本的乐观更新
function* optimisticUpdateSaga(action) {
  const { itemId, updates } = action.payload;
  const originalItem = yield select(selectItemById, itemId);
  
  // 乐观更新
  yield put({ type: 'UPDATE_ITEM', payload: { itemId, updates } });
  
  try {
    const updatedItem = yield call(api.updateItem, itemId, updates);
    yield put({ type: 'UPDATE_CONFIRMED', payload: updatedItem });
  } catch (error) {
    // 回滚
    yield put({ type: 'UPDATE_ITEM', payload: originalItem });
    yield put({ type: 'UPDATE_FAILED', payload: error.message });
  }
}
```

## 性能优化

### 1. 请求去重和缓存

```javascript
// utils/requestCache.js
class RequestCache {
  constructor(ttl = 5 * 60 * 1000) { // 5分钟缓存
    this.cache = new Map();
    this.ttl = ttl;
    this.pending = new Map();
  }
  
  async get(key, fetcher) {
    // 检查缓存
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.ttl) {
      return cached.data;
    }
    
    // 检查是否有正在进行的请求
    if (this.pending.has(key)) {
      return this.pending.get(key);
    }
    
    // 发起新请求
    const promise = fetcher().then(
      data => {
        this.cache.set(key, {
          data,
          timestamp: Date.now()
        });
        this.pending.delete(key);
        return data;
      },
      error => {
        this.pending.delete(key);
        throw error;
      }
    );
    
    this.pending.set(key, promise);
    return promise;
  }
  
  invalidate(key) {
    this.cache.delete(key);
  }
  
  clear() {
    this.cache.clear();
  }
}

const requestCache = new RequestCache();

// 使用缓存的thunk
export const fetchUserWithCache = (userId) => {
  return async (dispatch) => {
    dispatch({ type: 'FETCH_USER_REQUEST' });
    
    try {
      const user = await requestCache.get(
        `user-${userId}`,
        () => api.getUser(userId)
      );
      
      dispatch({
        type: 'FETCH_USER_SUCCESS',
        payload: user
      });
    } catch (error) {
      dispatch({
        type: 'FETCH_USER_FAILURE',
        payload: error.message
      });
    }
  };
};
```

这些异步操作处理模式为Redux应用提供了强大而灵活的解决方案，可以根据具体需求选择合适的方案。