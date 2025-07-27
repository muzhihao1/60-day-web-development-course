# 🚀 社交媒体应用 - 快速开始指南

## 📋 前置要求

确保你的开发环境已安装：
- Node.js (v16+)
- npm 或 yarn
- MongoDB (本地或使用Docker)
- Git
- 代码编辑器（推荐 VS Code）

## 🛠 项目设置

### 1. 克隆项目
```bash
git clone [your-repo-url]
cd social-media-app/starter-template
```

### 2. 安装依赖

#### 后端依赖安装
```bash
cd backend
npm install
```

#### 前端依赖安装
```bash
cd ../frontend
npm install
```

### 3. 环境变量配置

#### 后端环境变量
在 `backend/` 目录创建 `.env` 文件：

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/social-media-app

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRE=7d

# Cloudinary (用于图片上传)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email (可选，用于邮箱验证)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

#### 前端环境变量
在 `frontend/` 目录创建 `.env.local` 文件：

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

## 🚀 启动开发服务器

### 使用 Docker Compose（推荐）
```bash
# 在根目录运行
docker-compose up -d
```

这将启动：
- MongoDB 数据库（端口 27017）
- 后端服务器（端口 5000）
- 前端开发服务器（端口 3000）

### 手动启动

#### 1. 启动 MongoDB
```bash
mongod
```

#### 2. 启动后端服务器
```bash
cd backend
npm run dev
```

#### 3. 启动前端开发服务器
```bash
cd frontend
npm start
```

## 🌐 访问应用

- 前端应用：http://localhost:3000
- 后端 API：http://localhost:5000/api
- API 文档：http://localhost:5000/api-docs （如果配置了 Swagger）

## 📁 项目结构说明

### 后端结构
```
backend/
├── src/
│   ├── config/         # 配置文件
│   ├── controllers/    # 请求处理器
│   ├── models/        # 数据模型
│   ├── routes/        # API路由
│   ├── middleware/    # 中间件
│   ├── services/      # 业务逻辑
│   ├── utils/         # 工具函数
│   └── validators/    # 数据验证
├── server.js          # 入口文件
└── package.json
```

### 前端结构
```
frontend/
├── public/            # 静态文件
├── src/
│   ├── components/    # React组件
│   ├── pages/        # 页面组件
│   ├── features/     # Redux功能模块
│   ├── services/     # API服务
│   ├── hooks/        # 自定义Hooks
│   ├── utils/        # 工具函数
│   └── types/        # TypeScript类型
├── App.tsx           # 主应用组件
└── package.json
```

## 🧪 测试

### 运行后端测试
```bash
cd backend
npm test
```

### 运行前端测试
```bash
cd frontend
npm test
```

## 📝 开发建议

1. **先实现后端API** - 使用 Postman 测试确保 API 工作正常
2. **逐步构建前端** - 从用户认证开始，然后是核心功能
3. **频繁提交代码** - 使用有意义的提交信息
4. **测试驱动开发** - 为关键功能编写测试
5. **关注安全性** - 始终验证用户输入

## 🆘 常见问题

### MongoDB 连接失败
- 确保 MongoDB 服务正在运行
- 检查连接字符串是否正确
- 如果使用 Docker，确保容器正在运行

### 端口已被占用
- 修改 `.env` 文件中的端口号
- 或者关闭占用端口的程序

### npm 安装失败
- 清除 npm 缓存：`npm cache clean --force`
- 删除 `node_modules` 和 `package-lock.json`，重新安装

## 📚 有用的资源

- [React 文档](https://reactjs.org/)
- [Express 文档](https://expressjs.com/)
- [MongoDB 文档](https://docs.mongodb.com/)
- [Socket.io 文档](https://socket.io/docs/)
- [JWT 介绍](https://jwt.io/introduction)

## 💪 下一步

1. 完成环境设置
2. 阅读项目需求文档
3. 开始实现第一个功能
4. 记得经常保存和提交代码！

祝你编码愉快！🎉