---
day: 29
title: "React Router路由练习"
description: "通过实际项目掌握React Router v6的核心功能，包括动态路由、嵌套路由、路由守卫等"
exercises:
  - title: "博客应用路由系统"
    description: "创建一个完整的博客应用，实现文章列表、详情、分类筛选、搜索等功能"
    difficulty: "intermediate"
    requirements:
      - "使用React Router v6实现完整的路由系统"
      - "实现文章列表页面，支持分页和分类筛选"
      - "创建文章详情页面，使用动态路由参数"
      - "实现面包屑导航，显示当前位置"
      - "添加搜索功能，使用查询参数管理搜索状态"
      - "实现404页面和错误边界"
      - "使用NavLink实现导航菜单的激活状态"
      - "实现代码分割和懒加载优化性能"
    tips:
      - "使用useParams获取文章ID等动态参数"
      - "使用useSearchParams管理分类和搜索参数"
      - "考虑使用Outlet实现嵌套路由布局"
      - "使用Suspense包裹懒加载的组件"
  - title: "多步表单向导"
    description: "构建一个用户注册流程的多步表单，支持步骤导航、数据保存和验证"
    difficulty: "advanced"
    requirements:
      - "创建至少4个步骤：个人信息、联系方式、账户设置、确认提交"
      - "实现步骤导航，显示当前进度"
      - "支持前进后退，保存每步填写的数据"
      - "实现路由守卫，防止跳过必填步骤"
      - "添加离开确认提示（未保存数据时）"
      - "完成后显示成功页面，支持查看和编辑已填信息"
      - "实现表单验证，错误时阻止进入下一步"
      - "支持直接通过URL访问特定步骤（需验证权限）"
    tips:
      - "使用Context或状态管理保存表单数据"
      - "使用useBlocker实现离开确认功能"
      - "考虑将每个步骤作为独立路由"
      - "使用Navigate组件实现条件重定向"
  - title: "受保护的仪表板"
    description: "创建一个需要登录的仪表板应用，实现认证、权限控制和私有路由"
    difficulty: "advanced"
    requirements:
      - "实现登录/注册页面"
      - "创建认证上下文管理用户状态"
      - "实现私有路由组件保护需要登录的页面"
      - "添加角色权限系统（普通用户、管理员）"
      - "实现自动跳转：登录后返回之前页面"
      - "添加token过期处理和自动登出"
      - "创建用户profile页面和设置页面"
      - "实现管理员专属页面（用户管理）"
    tips:
      - "使用location.state保存来源页面"
      - "在RequireAuth组件中检查认证状态"
      - "考虑使用localStorage保存token"
      - "使用嵌套路由组织仪表板布局"
selfCheckQuestions:
  - "如何实现路由级别的代码分割？"
  - "useNavigate和Navigate组件的区别是什么？"
  - "如何在React Router v6中实现路由守卫？"
  - "什么情况下应该使用嵌套路由？"
  - "如何优雅地处理路由加载和错误状态？"
resources:
  - title: "React Router v6迁移指南"
    url: "https://reactrouter.com/docs/en/v6/upgrading/v5"
    type: "article"
  - title: "React Router示例集合"
    url: "https://github.com/remix-run/react-router/tree/dev/examples"
    type: "article"
  - title: "路由最佳实践"
    url: "https://ui.dev/react-router-tutorial"
    type: "article"
estimatedTime: 240
objectives:
  - "掌握React Router v6的所有核心功能"
  - "学会实现复杂的路由场景"
  - "理解路由守卫和权限控制"
  - "掌握路由性能优化技巧"
---

# Day 29: React Router路由练习

## 🎯 练习目标

今天的练习将帮助你掌握React Router v6的实际应用。通过构建真实的项目，你将学会如何设计和实现复杂的路由系统，处理认证授权，以及优化路由性能。

## 📝 练习说明

### 练习 1：博客应用路由系统

创建一个功能完整的博客应用，要求实现：

**路由结构设计**：
```
/                     # 首页（文章列表）
/posts               # 文章列表（同首页）
/posts/:id           # 文章详情
/categories          # 分类列表
/categories/:slug    # 分类下的文章
/search              # 搜索结果页
/about               # 关于页面
/404                 # 404页面
```

**核心功能要求**：
- 文章列表支持分页（使用查询参数 `?page=1`）
- 分类筛选（使用查询参数 `?category=react`）
- 搜索功能（使用查询参数 `?q=keyword`）
- 响应式导航菜单
- 面包屑导航
- 相关文章推荐

### 练习 2：多步表单向导

构建一个用户注册向导，包含以下步骤：

1. **个人信息**：姓名、生日、性别
2. **联系方式**：邮箱、手机、地址
3. **账户设置**：用户名、密码、安全问题
4. **确认提交**：显示所有信息供确认

**技术要求**：
- 每个步骤对应一个路由
- 步骤间可以自由切换（已填写的步骤）
- 未完成的步骤不能跳过
- 刷新页面后保持当前步骤和数据
- 提交成功后清除所有数据

### 练习 3：受保护的仪表板

创建一个企业级仪表板应用：

**用户角色**：
- 访客：只能访问公开页面
- 用户：可以访问个人仪表板
- 管理员：可以访问所有页面

**页面结构**：
```
/                    # 公开首页
/login              # 登录页面
/register           # 注册页面
/dashboard          # 用户仪表板（需要登录）
/profile            # 个人资料（需要登录）
/settings           # 设置页面（需要登录）
/admin              # 管理面板（需要管理员权限）
/admin/users        # 用户管理（需要管理员权限）
/admin/stats        # 统计数据（需要管理员权限）
```

## 💡 实现提示

### 路由配置最佳实践

```jsx
// 集中管理路由配置
const routes = [
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'posts/:id', element: <PostDetail /> },
      // ... 其他路由
    ]
  }
];

// 使用路由配置生成Routes
function renderRoutes(routes) {
  return routes.map(route => (
    <Route key={route.path} {...route}>
      {route.children && renderRoutes(route.children)}
    </Route>
  ));
}
```

### 路由守卫实现

```jsx
function RequireAuth({ children, role }) {
  const { user } = useAuth();
  const location = useLocation();
  
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} />;
  }
  
  if (role && user.role !== role) {
    return <Navigate to="/unauthorized" />;
  }
  
  return children;
}
```

### 面包屑导航实现

```jsx
function useBreadcrumbs() {
  const location = useLocation();
  const matches = useMatches();
  
  return matches
    .filter(match => match.handle?.crumb)
    .map(match => ({
      path: match.pathname,
      label: match.handle.crumb(match.data)
    }));
}
```

## 🎨 样式建议

为你的应用添加专业的样式：

```css
/* 导航激活状态 */
.nav-link {
  padding: 0.5rem 1rem;
  text-decoration: none;
  transition: all 0.3s ease;
}

.nav-link.active {
  color: #007bff;
  border-bottom: 2px solid #007bff;
}

/* 加载状态 */
.route-loading {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #007bff 0%, #0056b3 50%, #007bff 100%);
  animation: loading 1.5s ease-in-out infinite;
}

/* 步骤导航 */
.step-indicator {
  display: flex;
  justify-content: space-between;
  margin-bottom: 2rem;
}

.step {
  flex: 1;
  text-align: center;
  position: relative;
}

.step.completed::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
```

## 🚀 扩展挑战

如果你完成了基础练习，可以尝试以下扩展：

1. **性能优化**：
   - 实现路由预加载
   - 添加页面过渡动画
   - 实现虚拟滚动的文章列表

2. **高级功能**：
   - 实现路由历史记录管理
   - 添加快捷键导航
   - 实现离线缓存支持

3. **用户体验**：
   - 添加骨架屏加载状态
   - 实现平滑的滚动恢复
   - 添加路由切换进度条

## 📤 提交要求

完成练习后，请确保你的代码包含：

1. 完整的路由配置和组件实现
2. 清晰的代码注释
3. 错误处理和加载状态
4. 响应式设计支持
5. 基本的单元测试（可选）

将你的代码提交到GitHub仓库，并在README中说明实现的功能和使用的技术栈。

祝你编码愉快！🎉