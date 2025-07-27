# E-commerce Frontend Project

## 项目概述
使用React构建一个现代的电子商务前端应用。这个项目将帮助你掌握React的核心概念、状态管理、路由和现代前端开发最佳实践。

## 项目目标
- 掌握React组件化开发
- 实现复杂的状态管理
- 使用React Router进行路由管理
- 集成第三方API
- 实现响应式设计
- 优化性能和用户体验

## 功能要求

### 核心功能
1. **产品展示**
   - 产品列表页面
   - 产品详情页面
   - 产品搜索功能
   - 产品分类筛选
   - 产品排序（价格、评分等）

2. **购物车功能**
   - 添加商品到购物车
   - 修改商品数量
   - 删除购物车商品
   - 购物车持久化
   - 价格计算

3. **用户系统**
   - 用户注册/登录（模拟）
   - 用户资料页面
   - 订单历史
   - 收藏夹功能

4. **结账流程**
   - 收货地址管理
   - 支付方式选择（模拟）
   - 订单确认
   - 订单成功页面

### 高级功能（可选）
- 产品评价系统
- 推荐系统
- 实时库存更新
- 优惠券功能
- 多语言支持
- PWA功能

## 技术要求
- React 18+
- React Router v6
- 状态管理（Context API 或 Redux Toolkit）
- Axios 或 Fetch API
- CSS Modules 或 Styled Components
- React Hook Form（表单处理）
- 使用TypeScript（推荐）

## 项目结构
```
ecommerce-frontend/
├── public/
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── components/        # 可重用组件
│   │   ├── common/       # 通用组件
│   │   ├── layout/       # 布局组件
│   │   └── product/      # 产品相关组件
│   ├── pages/            # 页面组件
│   │   ├── Home/
│   │   ├── Products/
│   │   ├── Cart/
│   │   └── Checkout/
│   ├── services/         # API服务
│   ├── hooks/            # 自定义Hooks
│   ├── context/          # Context providers
│   ├── utils/            # 工具函数
│   ├── styles/           # 全局样式
│   ├── types/            # TypeScript类型
│   ├── App.tsx
│   └── index.tsx
├── package.json
├── tsconfig.json
└── README.md
```

## API要求
使用以下模拟API之一：
- [Fake Store API](https://fakestoreapi.com/)
- [DummyJSON](https://dummyjson.com/)
- 或创建自己的模拟数据

## 设计要求
- 现代、清晰的UI设计
- 响应式布局（移动端优先）
- 良好的加载状态和错误处理
- 平滑的动画和过渡效果
- 符合电商网站的用户体验标准

## 性能要求
- 代码分割和懒加载
- 图片优化和懒加载
- 合理的缓存策略
- 优化的重新渲染
- 良好的Lighthouse评分

## 评分标准
请参考 `evaluation-criteria.md` 文件了解详细的评分标准。

## 开发步骤建议
1. 设置React项目环境
2. 设计组件结构和路由
3. 实现基础布局和导航
4. 集成API并展示产品
5. 实现购物车功能
6. 添加用户认证流程
7. 完成结账流程
8. 优化性能和用户体验

## 提交要求
1. 功能完整且无明显bug
2. 代码结构清晰、组件职责单一
3. 有适当的错误处理和加载状态
4. README包含项目运行说明
5. 部署到Vercel或Netlify（可选）

## 资源和参考
- [React官方文档](https://react.dev/)
- [React Router文档](https://reactrouter.com/)
- [React Hook Form](https://react-hook-form.com/)
- [React性能优化](https://react.dev/learn/render-and-commit)
- [电商UX最佳实践](https://baymard.com/ecommerce-ux)

## 截止日期
Day 40 结束前提交