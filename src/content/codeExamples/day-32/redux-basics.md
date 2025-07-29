---
title: "Redux基础概念"
description: "Redux核心概念详解，包括Store、Action、Reducer和中间件"
category: "advanced"
language: "javascript"
---

# Redux基础概念

## Redux核心原理

Redux是一个可预测的状态容器，遵循三个基本原则：
1. 单一数据源（Single Source of Truth）
2. State是只读的（State is Read-Only）
3. 使用纯函数来执行修改（Changes are Made with Pure Functions）

## 基础概念实现

### 1. Action和Action Creator

```javascript
// Action Types
const ActionTypes = {
  // 用户相关
  USER_LOGIN_REQUEST: 'USER_LOGIN_REQUEST',
  USER_LOGIN_SUCCESS: 'USER_LOGIN_SUCCESS',
  USER_LOGIN_FAILURE: 'USER_LOGIN_FAILURE',
  USER_LOGOUT: 'USER_LOGOUT',
  
  // 购物车相关
  CART_ADD_ITEM: 'CART_ADD_ITEM',
  CART_REMOVE_ITEM: 'CART_REMOVE_ITEM',
  CART_UPDATE_QUANTITY: 'CART_UPDATE_QUANTITY',
  CART_CLEAR: 'CART_CLEAR',
  
  // 产品相关
  FETCH_PRODUCTS_REQUEST: 'FETCH_PRODUCTS_REQUEST',
  FETCH_PRODUCTS_SUCCESS: 'FETCH_PRODUCTS_SUCCESS',
  FETCH_PRODUCTS_FAILURE: 'FETCH_PRODUCTS_FAILURE'
};

// Action Creators
const userActions = {
  loginRequest: () => ({
    type: ActionTypes.USER_LOGIN_REQUEST
  }),
  
  loginSuccess: (user) => ({
    type: ActionTypes.USER_LOGIN_SUCCESS,
    payload: user
  }),
  
  loginFailure: (error) => ({
    type: ActionTypes.USER_LOGIN_FAILURE,
    payload: error
  }),
  
  logout: () => ({
    type: ActionTypes.USER_LOGOUT
  })
};

const cartActions = {
  addItem: (product) => ({
    type: ActionTypes.CART_ADD_ITEM,
    payload: product
  }),
  
  removeItem: (productId) => ({
    type: ActionTypes.CART_REMOVE_ITEM,
    payload: productId
  }),
  
  updateQuantity: (productId, quantity) => ({
    type: ActionTypes.CART_UPDATE_QUANTITY,
    payload: { productId, quantity }
  }),
  
  clearCart: () => ({
    type: ActionTypes.CART_CLEAR
  })
};

// 带有副作用的Action Creator（需要中间件）
const fetchProducts = () => {
  return async (dispatch) => {
    dispatch({ type: ActionTypes.FETCH_PRODUCTS_REQUEST });
    
    try {
      const response = await fetch('/api/products');
      const products = await response.json();
      
      dispatch({
        type: ActionTypes.FETCH_PRODUCTS_SUCCESS,
        payload: products
      });
    } catch (error) {
      dispatch({
        type: ActionTypes.FETCH_PRODUCTS_FAILURE,
        payload: error.message
      });
    }
  };
};
```

### 2. Reducer实现

```javascript
// 初始状态
const initialState = {
  user: {
    data: null,
    isLoading: false,
    error: null
  },
  cart: {
    items: [],
    total: 0
  },
  products: {
    data: [],
    isLoading: false,
    error: null
  }
};

// User Reducer
function userReducer(state = initialState.user, action) {
  switch (action.type) {
    case ActionTypes.USER_LOGIN_REQUEST:
      return {
        ...state,
        isLoading: true,
        error: null
      };
    
    case ActionTypes.USER_LOGIN_SUCCESS:
      return {
        ...state,
        data: action.payload,
        isLoading: false,
        error: null
      };
    
    case ActionTypes.USER_LOGIN_FAILURE:
      return {
        ...state,
        data: null,
        isLoading: false,
        error: action.payload
      };
    
    case ActionTypes.USER_LOGOUT:
      return initialState.user;
    
    default:
      return state;
  }
}

// Cart Reducer
function cartReducer(state = initialState.cart, action) {
  switch (action.type) {
    case ActionTypes.CART_ADD_ITEM: {
      const existingItem = state.items.find(
        item => item.id === action.payload.id
      );
      
      let newItems;
      if (existingItem) {
        newItems = state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        newItems = [...state.items, { ...action.payload, quantity: 1 }];
      }
      
      return {
        ...state,
        items: newItems,
        total: calculateTotal(newItems)
      };
    }
    
    case ActionTypes.CART_REMOVE_ITEM:
      const filteredItems = state.items.filter(
        item => item.id !== action.payload
      );
      
      return {
        ...state,
        items: filteredItems,
        total: calculateTotal(filteredItems)
      };
    
    case ActionTypes.CART_UPDATE_QUANTITY: {
      const { productId, quantity } = action.payload;
      
      if (quantity <= 0) {
        return cartReducer(state, cartActions.removeItem(productId));
      }
      
      const updatedItems = state.items.map(item =>
        item.id === productId
          ? { ...item, quantity }
          : item
      );
      
      return {
        ...state,
        items: updatedItems,
        total: calculateTotal(updatedItems)
      };
    }
    
    case ActionTypes.CART_CLEAR:
      return initialState.cart;
    
    default:
      return state;
  }
}

// 辅助函数
function calculateTotal(items) {
  return items.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);
}

// Products Reducer
function productsReducer(state = initialState.products, action) {
  switch (action.type) {
    case ActionTypes.FETCH_PRODUCTS_REQUEST:
      return {
        ...state,
        isLoading: true,
        error: null
      };
    
    case ActionTypes.FETCH_PRODUCTS_SUCCESS:
      return {
        ...state,
        data: action.payload,
        isLoading: false,
        error: null
      };
    
    case ActionTypes.FETCH_PRODUCTS_FAILURE:
      return {
        ...state,
        data: [],
        isLoading: false,
        error: action.payload
      };
    
    default:
      return state;
  }
}

// 组合Reducers
import { combineReducers } from 'redux';

const rootReducer = combineReducers({
  user: userReducer,
  cart: cartReducer,
  products: productsReducer
});
```

### 3. Store配置

```javascript
import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';

// 自定义日志中间件
const logger = store => next => action => {
  console.group(action.type);
  console.info('dispatching', action);
  const result = next(action);
  console.log('next state', store.getState());
  console.groupEnd();
  return result;
};

// 错误处理中间件
const crashReporter = store => next => action => {
  try {
    return next(action);
  } catch (err) {
    console.error('Caught an exception!', err);
    // 发送错误报告
    Sentry.captureException(err, {
      extra: {
        action,
        state: store.getState()
      }
    });
    throw err;
  }
};

// 配置Store
const configureStore = (preloadedState) => {
  const middlewares = [thunk, logger];
  
  if (process.env.NODE_ENV === 'production') {
    middlewares.push(crashReporter);
  }
  
  const composeEnhancers = 
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
  
  const store = createStore(
    rootReducer,
    preloadedState,
    composeEnhancers(
      applyMiddleware(...middlewares)
    )
  );
  
  // 热模块替换
  if (module.hot) {
    module.hot.accept('./reducers', () => {
      store.replaceReducer(rootReducer);
    });
  }
  
  return store;
};

export default configureStore;
```

## React-Redux集成

### 1. Provider设置

```jsx
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import configureStore from './store';
import App from './App';

const store = configureStore();

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);
```

### 2. 使用connect高阶组件

```jsx
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

// 组件
class ProductList extends React.Component {
  componentDidMount() {
    this.props.fetchProducts();
  }
  
  handleAddToCart = (product) => {
    this.props.addToCart(product);
    this.showNotification('商品已添加到购物车');
  };
  
  render() {
    const { products, isLoading, error } = this.props;
    
    if (isLoading) return <div>加载中...</div>;
    if (error) return <div>错误: {error}</div>;
    
    return (
      <div className="product-list">
        {products.map(product => (
          <div key={product.id} className="product-item">
            <h3>{product.name}</h3>
            <p>¥{product.price}</p>
            <button onClick={() => this.handleAddToCart(product)}>
              添加到购物车
            </button>
          </div>
        ))}
      </div>
    );
  }
}

// mapStateToProps
const mapStateToProps = (state) => ({
  products: state.products.data,
  isLoading: state.products.isLoading,
  error: state.products.error
});

// mapDispatchToProps
const mapDispatchToProps = (dispatch) => ({
  fetchProducts: () => dispatch(fetchProducts()),
  addToCart: (product) => dispatch(cartActions.addItem(product))
});

// 或使用bindActionCreators
const mapDispatchToProps = (dispatch) => 
  bindActionCreators({
    fetchProducts,
    addToCart: cartActions.addItem
  }, dispatch);

// 连接组件
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ProductList);
```

### 3. 使用Hooks

```jsx
import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';

function ProductList() {
  const dispatch = useDispatch();
  
  // 使用selector获取state
  const products = useSelector(state => state.products.data);
  const isLoading = useSelector(state => state.products.isLoading);
  const error = useSelector(state => state.products.error);
  
  // 使用shallowEqual避免不必要的重渲染
  const { user, theme } = useSelector(
    state => ({
      user: state.user.data,
      theme: state.ui.theme
    }),
    shallowEqual
  );
  
  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);
  
  const handleAddToCart = (product) => {
    dispatch(cartActions.addItem(product));
  };
  
  if (isLoading) return <div>加载中...</div>;
  if (error) return <div>错误: {error}</div>;
  
  return (
    <div className="product-list">
      {products.map(product => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={handleAddToCart}
        />
      ))}
    </div>
  );
}

// 购物车组件
function ShoppingCart() {
  const dispatch = useDispatch();
  const { items, total } = useSelector(state => state.cart);
  
  const handleRemoveItem = (productId) => {
    dispatch(cartActions.removeItem(productId));
  };
  
  const handleUpdateQuantity = (productId, quantity) => {
    dispatch(cartActions.updateQuantity(productId, quantity));
  };
  
  const handleClearCart = () => {
    if (window.confirm('确定要清空购物车吗？')) {
      dispatch(cartActions.clearCart());
    }
  };
  
  return (
    <div className="shopping-cart">
      <h2>购物车</h2>
      {items.length === 0 ? (
        <p>购物车是空的</p>
      ) : (
        <>
          {items.map(item => (
            <CartItem
              key={item.id}
              item={item}
              onRemove={handleRemoveItem}
              onUpdateQuantity={handleUpdateQuantity}
            />
          ))}
          <div className="cart-total">
            总计: ¥{total.toFixed(2)}
          </div>
          <button onClick={handleClearCart}>
            清空购物车
          </button>
        </>
      )}
    </div>
  );
}
```

## 高级模式

### 1. Selector模式和Reselect

```javascript
import { createSelector } from 'reselect';

// 基础selectors
const getProducts = state => state.products.data;
const getCartItems = state => state.cart.items;
const getSearchTerm = state => state.ui.searchTerm;
const getSelectedCategory = state => state.ui.selectedCategory;

// 记忆化selector
export const getFilteredProducts = createSelector(
  [getProducts, getSearchTerm, getSelectedCategory],
  (products, searchTerm, category) => {
    return products.filter(product => {
      const matchesSearch = product.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      
      const matchesCategory = category === 'all' || 
        product.category === category;
      
      return matchesSearch && matchesCategory;
    });
  }
);

// 计算购物车统计信息
export const getCartStats = createSelector(
  [getCartItems],
  (items) => {
    return items.reduce((stats, item) => {
      return {
        totalItems: stats.totalItems + item.quantity,
        totalPrice: stats.totalPrice + (item.price * item.quantity),
        uniqueItems: stats.uniqueItems + 1
      };
    }, {
      totalItems: 0,
      totalPrice: 0,
      uniqueItems: 0
    });
  }
);

// 获取购物车中的产品详情
export const getCartItemsWithDetails = createSelector(
  [getCartItems, getProducts],
  (cartItems, products) => {
    return cartItems.map(cartItem => {
      const product = products.find(p => p.id === cartItem.id);
      return {
        ...cartItem,
        ...product,
        subtotal: cartItem.quantity * product.price
      };
    });
  }
);

// 在组件中使用
function ProductsContainer() {
  const filteredProducts = useSelector(getFilteredProducts);
  const cartStats = useSelector(getCartStats);
  
  return (
    <div>
      <div>购物车: {cartStats.totalItems} 件商品</div>
      <ProductList products={filteredProducts} />
    </div>
  );
}
```

### 2. 中间件开发

```javascript
// 自定义中间件：API调用中间件
const apiMiddleware = ({ dispatch, getState }) => next => action => {
  if (action.type !== 'API_CALL') {
    return next(action);
  }
  
  const {
    endpoint,
    method = 'GET',
    data,
    headers = {},
    onSuccess,
    onFailure
  } = action.payload;
  
  const dataOrParams = ['GET', 'DELETE'].includes(method) 
    ? { params: data } 
    : { data };
  
  dispatch({ type: `${action.payload.type}_REQUEST` });
  
  return fetch(endpoint, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    },
    body: method !== 'GET' ? JSON.stringify(data) : undefined
  })
    .then(response => response.json())
    .then(response => {
      dispatch({
        type: `${action.payload.type}_SUCCESS`,
        payload: response
      });
      
      if (onSuccess) {
        dispatch(onSuccess(response));
      }
    })
    .catch(error => {
      dispatch({
        type: `${action.payload.type}_FAILURE`,
        payload: error.message
      });
      
      if (onFailure) {
        dispatch(onFailure(error));
      }
    });
};

// 使用API中间件
const fetchUserProfile = (userId) => ({
  type: 'API_CALL',
  payload: {
    type: 'FETCH_USER_PROFILE',
    endpoint: `/api/users/${userId}`,
    method: 'GET',
    onSuccess: (user) => ({
      type: 'SET_CURRENT_USER',
      payload: user
    })
  }
});
```

这些Redux基础概念展示了如何构建可预测的状态管理系统，为大型应用提供了坚实的架构基础。