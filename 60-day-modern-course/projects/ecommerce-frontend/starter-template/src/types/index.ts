// 产品类型定义
export interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating: {
    rate: number;
    count: number;
  };
}

// 购物车项类型
export interface CartItem {
  product: Product;
  quantity: number;
}

// 用户类型
export interface User {
  id: number;
  email: string;
  username: string;
  name: {
    firstname: string;
    lastname: string;
  };
}

// TODO: 添加更多类型定义