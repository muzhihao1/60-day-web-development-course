---
day: 25
title: "React基础实践练习"
description: "通过实际练习掌握React组件创建和JSX语法"
exercises:
  - title: "创建个人名片组件"
    description: "使用React创建一个展示个人信息的名片组件"
    difficulty: "beginner"
    requirements:
      - "创建一个ProfileCard组件"
      - "显示姓名、职位、邮箱和个人简介"
      - "使用props传递个人信息"
      - "添加头像图片（使用占位图片服务）"
      - "使用内联样式美化名片"
    tips:
      - "使用函数组件和TypeScript接口定义props"
      - "考虑使用可选属性处理缺失数据"
      - "使用条件渲染显示可选信息"
    
  - title: "天气信息显示组件"
    description: "创建一个显示天气信息的React组件"
    difficulty: "beginner"
    requirements:
      - "创建WeatherWidget组件"
      - "显示城市名、温度、天气状况"
      - "根据天气状况显示不同的图标或emoji"
      - "实现摄氏度和华氏度切换"
      - "添加刷新按钮（模拟数据更新）"
    tips:
      - "使用条件渲染显示不同天气图标"
      - "温度转换公式：F = C × 9/5 + 32"
      - "使用对象映射天气状况到图标"
      
  - title: "产品列表展示"
    description: "构建一个电商产品列表组件"
    difficulty: "intermediate"
    requirements:
      - "创建ProductList和ProductItem组件"
      - "展示产品名称、价格、描述和图片"
      - "实现产品分类筛选"
      - "添加"加入购物车"按钮"
      - "显示产品是否有货的状态"
    tips:
      - "使用数组的map方法渲染列表"
      - "为列表项添加唯一的key属性"
      - "使用组件组合模式"

selfCheckQuestions:
  - "你能解释JSX和普通JavaScript的区别吗？"
  - "为什么React组件名必须以大写字母开头？"
  - "什么时候应该使用Fragment？"
  - "如何在JSX中安全地渲染用户输入？"
  - "React中的合成事件和原生DOM事件有什么区别？"

resources:
  - title: "React官方文档 - 你的第一个组件"
    url: "https://react.dev/learn/your-first-component"
    type: "article"
  - title: "React官方文档 - JSX介绍"
    url: "https://react.dev/learn/writing-markup-with-jsx"
    type: "article"
  - title: "Vite官方文档"
    url: "https://vitejs.dev/"
    type: "article"

estimatedTime: 180
objectives:
  - "搭建React开发环境"
  - "创建函数组件"
  - "掌握JSX语法"
  - "使用props传递数据"
  - "实现条件渲染和列表渲染"
---

# Day 25 练习：React基础实践

## 练习概述

今天的练习将帮助你掌握React的基础概念，包括组件创建、JSX语法、props使用和基本的渲染技巧。

## 准备工作

在开始练习前，请确保：

1. **创建新的React项目**
   ```bash
   npm create vite@latest day25-practice -- --template react-ts
   cd day25-practice
   npm install
   npm run dev
   ```

2. **安装额外依赖（可选）**
   ```bash
   # 如果需要使用图标
   npm install react-icons
   ```

3. **准备模拟数据**
   创建一个 `src/data/mockData.ts` 文件用于存放练习数据

## 练习指导

### 练习1详细说明：个人名片组件

创建一个展示个人信息的名片组件，要求：

```typescript
interface ProfileData {
  name: string;
  title: string;
  email: string;
  bio?: string;
  avatar?: string;
  skills?: string[];
}
```

期望效果：
- 卡片式设计，有阴影和圆角
- 头像显示在顶部，圆形
- 信息分层展示，有良好的间距
- 技能标签使用不同颜色的小标签展示

### 练习2详细说明：天气信息组件

天气状况映射示例：
```typescript
const weatherIcons = {
  sunny: '☀️',
  cloudy: '☁️',
  rainy: '🌧️',
  snowy: '❄️',
  stormy: '⛈️',
};
```

功能要求：
- 点击温度数值可以切换单位
- 刷新按钮点击时显示加载状态
- 根据温度高低改变显示颜色（冷色调/暖色调）

### 练习3详细说明：产品列表

产品数据结构：
```typescript
interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  category: string;
  image: string;
  inStock: boolean;
}
```

高级要求：
- 实现价格排序功能
- 缺货商品显示灰色遮罩
- 鼠标悬停时显示完整描述

## 调试技巧

1. **使用React Developer Tools**
   - 安装浏览器扩展
   - 查看组件树和props
   - 监控组件重新渲染

2. **常见错误排查**
   - "Objects are not valid as a React child" - 检查是否直接渲染对象
   - "Each child in a list should have a unique key" - 为map渲染的元素添加key
   - "Cannot read property of undefined" - 使用可选链操作符?.

3. **性能优化提示**
   - 避免在render中创建新对象
   - 合理使用key属性
   - 组件拆分要适度

## 提交要求

完成练习后，你应该有：

1. 三个独立的组件文件
2. 一个展示所有组件的App.tsx
3. 相应的样式文件（CSS或内联样式）
4. 类型定义文件（如果使用TypeScript）

## 进阶挑战

如果你完成了基础练习，可以尝试：

1. **响应式设计** - 让组件在移动端也能良好显示
2. **主题切换** - 实现深色/浅色主题切换
3. **动画效果** - 添加组件加载和交互动画
4. **组件组合** - 将多个组件组合成一个复杂的界面

记住，React的学习是一个渐进的过程。先确保基础功能正确实现，再考虑优化和增强功能。