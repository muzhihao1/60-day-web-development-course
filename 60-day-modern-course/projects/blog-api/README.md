# Blog API Project

## 项目概述
构建一个功能完整的RESTful博客API，使用Node.js和Express框架。这个项目将帮助你掌握后端开发的核心概念，包括API设计、数据库操作、认证授权和最佳实践。

## 项目目标
- 设计和实现RESTful API
- 掌握Express.js框架
- 实现用户认证和授权
- 数据库设计和操作
- API安全性实践
- 错误处理和日志记录

## 功能要求

### 核心功能
1. **用户管理**
   - 用户注册
   - 用户登录（JWT认证）
   - 用户资料管理
   - 密码重置功能

2. **文章管理**
   - 创建文章（需要认证）
   - 获取文章列表（分页、筛选、排序）
   - 获取单篇文章
   - 更新文章（仅作者）
   - 删除文章（仅作者）
   - 文章搜索功能

3. **评论系统**
   - 添加评论（需要认证）
   - 获取文章评论
   - 更新评论（仅作者）
   - 删除评论（仅作者）

4. **分类和标签**
   - 分类CRUD操作
   - 标签管理
   - 按分类/标签筛选文章

### 高级功能（可选）
- 文章点赞功能
- 用户关注系统
- 文章草稿功能
- 图片上传（文章封面）
- 邮件通知
- API限流
- 数据缓存（Redis）

## 技术要求
- Node.js 18+
- Express.js 4+
- MongoDB + Mongoose 或 PostgreSQL + Sequelize
- JWT认证
- bcrypt密码加密
- Express验证中间件
- 环境变量管理（dotenv）
- CORS配置
- API文档（Swagger/OpenAPI）

## 项目结构
```
blog-api/
├── src/
│   ├── config/           # 配置文件
│   │   ├── database.js
│   │   └── auth.js
│   ├── controllers/      # 控制器
│   │   ├── authController.js
│   │   ├── postController.js
│   │   └── commentController.js
│   ├── models/           # 数据模型
│   │   ├── User.js
│   │   ├── Post.js
│   │   └── Comment.js
│   ├── routes/           # 路由定义
│   │   ├── auth.js
│   │   ├── posts.js
│   │   └── comments.js
│   ├── middleware/       # 中间件
│   │   ├── auth.js
│   │   ├── validation.js
│   │   └── errorHandler.js
│   ├── utils/            # 工具函数
│   │   ├── validators.js
│   │   └── helpers.js
│   ├── app.js            # Express应用
│   └── server.js         # 服务器入口
├── tests/                # 测试文件
├── .env.example          # 环境变量示例
├── package.json
└── README.md
```

## API端点设计

### 认证相关
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/logout` - 用户登出
- `POST /api/auth/refresh` - 刷新token
- `POST /api/auth/forgot-password` - 忘记密码
- `POST /api/auth/reset-password` - 重置密码

### 用户相关
- `GET /api/users/profile` - 获取当前用户资料
- `PUT /api/users/profile` - 更新用户资料
- `GET /api/users/:id` - 获取指定用户信息
- `DELETE /api/users/account` - 删除账户

### 文章相关
- `GET /api/posts` - 获取文章列表
- `GET /api/posts/:id` - 获取单篇文章
- `POST /api/posts` - 创建文章
- `PUT /api/posts/:id` - 更新文章
- `DELETE /api/posts/:id` - 删除文章
- `GET /api/posts/search` - 搜索文章

### 评论相关
- `GET /api/posts/:postId/comments` - 获取文章评论
- `POST /api/posts/:postId/comments` - 添加评论
- `PUT /api/comments/:id` - 更新评论
- `DELETE /api/comments/:id` - 删除评论

### 分类和标签
- `GET /api/categories` - 获取所有分类
- `POST /api/categories` - 创建分类
- `GET /api/tags` - 获取所有标签
- `GET /api/posts/category/:category` - 按分类获取文章
- `GET /api/posts/tag/:tag` - 按标签获取文章

## 数据库设计

### User Schema
```javascript
{
  username: String (unique, required),
  email: String (unique, required),
  password: String (hashed, required),
  name: String,
  bio: String,
  avatar: String,
  role: String (user/admin),
  createdAt: Date,
  updatedAt: Date
}
```

### Post Schema
```javascript
{
  title: String (required),
  slug: String (unique),
  content: String (required),
  excerpt: String,
  author: ObjectId (ref: User),
  category: String,
  tags: [String],
  status: String (draft/published),
  views: Number,
  likes: Number,
  createdAt: Date,
  updatedAt: Date,
  publishedAt: Date
}
```

### Comment Schema
```javascript
{
  content: String (required),
  author: ObjectId (ref: User),
  post: ObjectId (ref: Post),
  parentComment: ObjectId (ref: Comment),
  createdAt: Date,
  updatedAt: Date
}
```

## 安全要求
- 密码加密存储
- JWT token过期处理
- 输入验证和清理
- SQL注入防护
- XSS防护
- 速率限制
- CORS正确配置
- 环境变量保护敏感信息

## API文档要求
使用Swagger或类似工具生成API文档，包含：
- 所有端点的详细说明
- 请求/响应示例
- 错误码说明
- 认证方式说明

## 评分标准
请参考 `evaluation-criteria.md` 文件了解详细的评分标准。

## 开发步骤建议
1. 初始化项目和安装依赖
2. 设置数据库连接
3. 创建数据模型
4. 实现认证系统
5. 开发CRUD API
6. 添加验证和错误处理
7. 实现高级功能
8. 编写测试
9. 生成API文档

## 提交要求
1. 完整的API功能实现
2. Postman集合或API文档
3. 环境变量示例文件
4. 详细的README说明
5. 基本的单元测试

## 资源和参考
- [Express.js官方文档](https://expressjs.com/)
- [MongoDB文档](https://docs.mongodb.com/)
- [JWT.io](https://jwt.io/)
- [RESTful API设计指南](https://restfulapi.net/)
- [Node.js最佳实践](https://github.com/goldbergyoni/nodebestpractices)

## 截止日期
Day 52 结束前提交