---
day: 26
title: "组件与Props深入练习"
description: "掌握React组件设计模式和高级Props用法"
difficulty: "intermediate"
estimatedTime: 240
requirements:
  - "构建可复用的表单组件系统"
  - "创建复合组件：手风琴（Accordion）"
  - "实现Modal对话框系统"
  - "掌握组件组合和复用模式"
  - "实现高级交互和动画效果"
hints:
  - "使用Context共享表单状态"
  - "考虑使用forwardRef传递ref"
  - "使用React Portal渲染Modal"
  - "管理焦点捕获（focus trap）"
  - "使用CSS transition实现动画"
---

# 组件与Props深入练习 🧩

## 练习概述

今天我们将深入学习React组件的高级设计模式，包括复合组件、渲染属性、高阶组件等模式的实际应用。

## 练习1：构建可复用的表单组件系统

### 要求

创建一套完整的表单组件，支持验证和错误处理：

1. **组件结构**
```typescript
// Form容器组件
interface FormProps {
  onSubmit: (values: any) => void;
  initialValues?: Record<string, any>;
  validationSchema?: ValidationSchema;
}

// 表单字段组件
interface FieldProps {
  name: string;
  label?: string;
  required?: boolean;
  validate?: (value: any) => string | undefined;
}
```

2. **实现组件**
   - Form：表单容器，管理表单状态
   - Input：文本输入组件
   - Select：下拉选择组件
   - Checkbox：复选框组件
   - Radio：单选框组组件
   - FormError：错误信息显示组件

3. **验证功能**
```typescript
const validationRules = {
  required: (value: any) => !value ? '此字段必填' : undefined,
  email: (value: string) => 
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? '请输入有效的邮箱' : undefined,
  minLength: (min: number) => (value: string) => 
    value.length < min ? `最少需要${min}个字符` : undefined,
  maxLength: (max: number) => (value: string) => 
    value.length > max ? `最多允许${max}个字符` : undefined
};
```

4. **使用示例**
```tsx
<Form onSubmit={handleSubmit} validationSchema={schema}>
  <Form.Field name="username" label="用户名" required />
  <Form.Field name="email" label="邮箱" validate={validationRules.email} />
  <Form.Select name="role" label="角色" options={roleOptions} />
  <Form.Checkbox name="agree" label="同意服务条款" />
  <Form.Submit>提交</Form.Submit>
</Form>
```

## 练习2：创建复合组件：手风琴（Accordion）

### 要求

使用复合组件模式创建一个可展开/收起的手风琴组件：

1. **组件API设计**
```tsx
<Accordion defaultExpanded={[0]} allowMultiple>
  <Accordion.Item>
    <Accordion.Header>第一部分</Accordion.Header>
    <Accordion.Panel>
      这是第一部分的内容...
    </Accordion.Panel>
  </Accordion.Item>
  <Accordion.Item>
    <Accordion.Header>第二部分</Accordion.Header>
    <Accordion.Panel>
      这是第二部分的内容...
    </Accordion.Panel>
  </Accordion.Item>
</Accordion>
```

2. **功能要求**
   - 支持多个面板的展开和收起
   - 可配置是否只允许展开一个面板
   - 支持默认展开的面板
   - 添加平滑的展开/收起动画
   - 支持键盘导航（方向键）

3. **Context设计**
```typescript
interface AccordionContextValue {
  expandedItems: number[];
  toggleItem: (index: number) => void;
  allowMultiple: boolean;
}
```

4. **无障碍支持**
   - 使用正确的ARIA属性
   - 支持键盘导航
   - 焦点管理

## 练习3：实现Modal对话框系统

### 要求

创建一个功能完整的模态对话框组件：

1. **API设计**
```typescript
// 声明式API
<Modal 
  isOpen={isOpen} 
  onClose={handleClose}
  title="确认删除"
  size="medium"
>
  <Modal.Body>
    确定要删除这条记录吗？
  </Modal.Body>
  <Modal.Footer>
    <Button onClick={handleClose}>取消</Button>
    <Button variant="danger" onClick={handleDelete}>删除</Button>
  </Modal.Footer>
</Modal>

// 命令式API
const modal = Modal.open({
  title: '确认删除',
  content: '确定要删除这条记录吗？',
  onConfirm: () => console.log('已删除'),
  onCancel: () => console.log('已取消')
});
```

2. **核心功能**
   - 支持命令式调用（Modal.open()）
   - 实现遮罩层点击关闭
   - 支持ESC键关闭
   - 防止背景滚动
   - 支持自定义页眉、内容和页脚
   - 实现进入/退出动画

3. **Portal实现**
```typescript
import { createPortal } from 'react-dom';

const Modal: React.FC<ModalProps> = ({ children, isOpen }) => {
  if (!isOpen) return null;
  
  return createPortal(
    <div className="modal-overlay">
      <div className="modal-content">
        {children}
      </div>
    </div>,
    document.body
  );
};
```

4. **高级功能**
   - 焦点管理（focus trap）
   - 多个Modal的层级管理
   - 动画过渡效果
   - 支持不同尺寸和位置

## 额外练习：高阶组件（HOC）

### 创建withLoading HOC

```typescript
interface WithLoadingProps {
  loading: boolean;
}

function withLoading<P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P & WithLoadingProps> {
  return ({ loading, ...props }: P & WithLoadingProps) => {
    if (loading) {
      return <div className="loading-spinner">加载中...</div>;
    }
    return <Component {...props as P} />;
  };
}

// 使用示例
const UserListWithLoading = withLoading(UserList);
```

## 评分标准

1. **功能完整性 (35%)**
   - 所有要求的功能正常工作
   - 边界情况处理得当
   - 无明显bug

2. **代码质量 (25%)**
   - 组件设计合理
   - TypeScript类型完整
   - 代码复用性高

3. **用户体验 (20%)**
   - 交互流畅自然
   - 动画效果平滑
   - 错误提示友好

4. **最佳实践 (20%)**
   - 正确使用React模式
   - 性能优化恰当
   - 无障碍支持完善

## 提交要求

1. 所有组件都应该有TypeScript类型定义
2. 提供组件使用示例和文档
3. 包含单元测试（可选加分项）
4. 代码格式整洁，注释清晰

## 参考资源

- [React Patterns](https://reactpatterns.com/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)

祝你在组件设计的道路上越走越远！💪