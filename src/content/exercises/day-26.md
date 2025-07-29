---
day: 26
title: "组件与Props深入练习"
description: "掌握React组件设计模式和高级Props用法"
exercises:
  - title: "构建可复用的表单组件系统"
    description: "创建一套完整的表单组件，支持验证和错误处理"
    difficulty: "intermediate"
    requirements:
      - "创建Form容器组件，管理表单状态"
      - "实现Input、Select、Checkbox等表单元素"
      - "支持表单验证（必填、邮箱格式、最小长度等）"
      - "实现错误信息显示"
      - "提供表单提交和重置功能"
    tips:
      - "使用Context共享表单状态"
      - "考虑使用forwardRef传递ref"
      - "实现受控和非受控两种模式"
    
  - title: "创建复合组件：手风琴（Accordion）"
    description: "使用复合组件模式创建一个可展开/收起的手风琴组件"
    difficulty: "intermediate"
    requirements:
      - "支持多个面板的展开和收起"
      - "可配置是否只允许展开一个面板"
      - "支持默认展开的面板"
      - "添加平滑的展开/收起动画"
      - "支持键盘导航（方向键）"
    tips:
      - "使用Context管理展开状态"
      - "考虑无障碍访问（ARIA属性）"
      - "使用CSS transition实现动画"
      
  - title: "实现Modal对话框系统"
    description: "创建一个功能完整的模态对话框组件"
    difficulty: "advanced"
    requirements:
      - "支持命令式调用（Modal.open()）"
      - "实现遮罩层点击关闭"
      - "支持ESC键关闭"
      - "防止背景滚动"
      - "支持自定义页眉、内容和页脚"
      - "实现进入/退出动画"
    tips:
      - "使用React Portal渲染到body"
      - "管理焦点捕获（focus trap）"
      - "处理多个Modal的层级关系"

selfCheckQuestions:
  - "什么时候应该使用复合组件模式？"
  - "forwardRef的使用场景有哪些？"
  - "如何决定组件应该是受控还是非受控的？"
  - "Props drilling问题如何解决？"
  - "组件组合和继承各有什么优缺点？"

resources:
  - title: "React官方文档 - 组件组合"
    url: "https://react.dev/learn/passing-props-to-a-component"
    type: "article"
  - title: "Kent C. Dodds - Compound Components"
    url: "https://kentcdodds.com/blog/compound-components-with-react-hooks"
    type: "article"
  - title: "React Patterns"
    url: "https://reactpatterns.com/"
    type: "article"

estimatedTime: 240
objectives:
  - "掌握组件组合模式"
  - "实现复合组件"
  - "使用高级Props模式"
  - "处理组件间通信"
  - "优化组件性能"
---

# Day 26 练习：组件与Props深入

## 练习概述

今天的练习将帮助你掌握React组件设计的高级模式，包括复合组件、Render Props、高阶组件等，以及如何设计灵活可复用的组件API。

## 准备工作

1. **创建项目结构**
   ```
   src/
   ├── components/
   │   ├── Form/
   │   │   ├── Form.tsx
   │   │   ├── Input.tsx
   │   │   ├── Select.tsx
   │   │   └── index.ts
   │   ├── Accordion/
   │   │   ├── Accordion.tsx
   │   │   ├── AccordionItem.tsx
   │   │   └── index.ts
   │   └── Modal/
   │       ├── Modal.tsx
   │       ├── ModalManager.tsx
   │       └── index.ts
   └── App.tsx
   ```

2. **安装可能需要的依赖**
   ```bash
   # 动画库（可选）
   npm install framer-motion
   # 或
   npm install react-transition-group
   ```

## 练习指导

### 练习1：表单组件系统

期望的使用方式：
```tsx
<Form onSubmit={handleSubmit}>
  <Form.Input
    name="username"
    label="用户名"
    required
    minLength={3}
  />
  <Form.Input
    name="email"
    label="邮箱"
    type="email"
    required
  />
  <Form.Select
    name="country"
    label="国家"
    options={countries}
    required
  />
  <Form.Checkbox
    name="agree"
    label="我同意服务条款"
    required
  />
  <Form.Submit>提交</Form.Submit>
</Form>
```

验证规则接口：
```typescript
interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | undefined;
}
```

### 练习2：手风琴组件

期望的使用方式：
```tsx
<Accordion defaultExpanded={["item1"]} allowMultiple>
  <Accordion.Item value="item1">
    <Accordion.Header>
      <Accordion.Trigger>
        第一部分
      </Accordion.Trigger>
    </Accordion.Header>
    <Accordion.Content>
      这是第一部分的内容
    </Accordion.Content>
  </Accordion.Item>
  
  <Accordion.Item value="item2">
    <Accordion.Header>
      <Accordion.Trigger>
        第二部分
      </Accordion.Trigger>
    </Accordion.Header>
    <Accordion.Content>
      这是第二部分的内容
    </Accordion.Content>
  </Accordion.Item>
</Accordion>
```

无障碍要求：
- `role="region"` 对于内容区域
- `aria-expanded` 表示展开状态
- `aria-controls` 和 `aria-labelledby` 关联

### 练习3：Modal对话框系统

期望的使用方式：
```tsx
// 声明式使用
<Modal isOpen={isOpen} onClose={handleClose}>
  <Modal.Header>
    <h2>对话框标题</h2>
  </Modal.Header>
  <Modal.Body>
    <p>对话框内容</p>
  </Modal.Body>
  <Modal.Footer>
    <Button onClick={handleClose}>取消</Button>
    <Button variant="primary">确认</Button>
  </Modal.Footer>
</Modal>

// 命令式使用
const result = await Modal.confirm({
  title: '确认删除',
  content: '确定要删除这个项目吗？',
});
```

高级功能：
- 支持嵌套Modal
- 键盘焦点管理
- 防止滚动穿透
- 支持不同尺寸（small, medium, large）

## 性能优化建议

1. **避免不必要的渲染**
   - 使用React.memo包装纯展示组件
   - 合理使用useCallback和useMemo

2. **优化大列表**
   - 考虑虚拟滚动
   - 使用key优化列表渲染

3. **代码分割**
   - 对于Modal等组件考虑懒加载
   - 使用动态import

## 测试建议

为你的组件编写测试：
```tsx
describe('Form Component', () => {
  it('should validate required fields', () => {
    // 测试必填字段验证
  });
  
  it('should submit valid form data', () => {
    // 测试表单提交
  });
});
```

## 进阶挑战

1. **表单组件**
   - 添加异步验证支持
   - 实现字段依赖（如：省市联动）
   - 支持动态表单

2. **手风琴组件**
   - 添加图标支持
   - 实现拖拽排序
   - 支持异步加载内容

3. **Modal组件**
   - 实现全屏模式
   - 添加拖拽移动
   - 支持最小化

## 提交要求

1. 所有组件都应该有完整的TypeScript类型定义
2. 提供使用示例和文档
3. 考虑边界情况和错误处理
4. 遵循React最佳实践