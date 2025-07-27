# 共享组件库

本目录存放可复用的UI组件。

## 组件分类

### 基础组件
- `Button/` - 按钮组件
- `Input/` - 输入框组件
- `Card/` - 卡片组件
- `Modal/` - 模态框组件

### 布局组件
- `Layout/` - 页面布局
- `Header/` - 页头组件
- `Footer/` - 页脚组件
- `Sidebar/` - 侧边栏组件

### 业务组件
- `ProductCard/` - 产品卡片
- `UserProfile/` - 用户资料
- `CommentList/` - 评论列表

## 组件规范

每个组件应包含：
1. `index.tsx` - 组件主文件
2. `styles.css` - 样式文件（或使用Tailwind）
3. `types.ts` - TypeScript类型定义
4. `README.md` - 组件文档
5. `__tests__/` - 测试文件

## 使用示例

```tsx
import { Button } from '@shared/components/Button';

function App() {
  return (
    <Button variant="primary" onClick={() => console.log('clicked')}>
      点击我
    </Button>
  );
}
```