---
day: 25
title: "React基础实践练习"
description: "通过实际练习掌握React组件创建和JSX语法"
difficulty: "beginner"
estimatedTime: 180
requirements:
  - "创建个人名片组件展示个人信息"
  - "构建天气信息显示组件"
  - "开发产品列表展示组件"
  - "实现组件props传递和状态管理"
  - "使用TypeScript定义组件类型"
hints:
  - "使用函数组件和TypeScript接口定义props"
  - "考虑使用可选属性处理缺失数据"
  - "使用条件渲染显示可选信息"
  - "温度转换公式：F = C × 9/5 + 32"
  - "使用数组的map方法渲染列表"
  - "为列表项添加唯一的key属性"
---

# React基础实践练习 ⚛️

## 练习概述

今天我们将通过三个实际的小项目来练习React的基础知识，包括组件创建、JSX语法、props传递和基本的事件处理。

## 练习1：创建个人名片组件

### 要求

使用React创建一个展示个人信息的名片组件：

1. **创建ProfileCard组件**
   - 显示姓名、职位、邮箱和个人简介
   - 使用props传递个人信息
   - 添加头像图片（使用占位图片服务）
   - 使用内联样式美化名片

2. **TypeScript类型定义**
```typescript
interface ProfileCardProps {
  name: string;
  title: string;
  email: string;
  bio?: string;
  avatar?: string;
}
```

3. **样式要求**
   - 卡片宽度：320px
   - 内边距：20px
   - 圆角：8px
   - 阴影效果
   - 头像圆形显示

### 期望效果

```tsx
// 使用示例
<ProfileCard 
  name="张三"
  title="前端开发工程师"
  email="zhangsan@example.com"
  bio="热爱编程，专注于React开发"
  avatar="https://placeholder.com/150"
/>
```

## 练习2：天气信息显示组件

### 要求

创建一个显示天气信息的React组件：

1. **创建WeatherWidget组件**
   - 显示城市名、温度、天气状况
   - 根据天气状况显示不同的图标或emoji
   - 实现摄氏度和华氏度切换
   - 添加刷新按钮（模拟数据更新）

2. **天气状况映射**
```typescript
const weatherIcons = {
  sunny: '☀️',
  cloudy: '☁️',
  rainy: '🌧️',
  snowy: '❄️',
  stormy: '⛈️'
};
```

3. **功能实现**
   - 温度单位切换按钮
   - 刷新按钮点击更新随机数据
   - 根据天气改变背景色

## 练习3：产品列表展示

### 要求

构建一个电商产品列表组件：

1. **组件结构**
   - ProductList（容器组件）
   - ProductItem（单个产品组件）
   - CategoryFilter（分类筛选组件）

2. **产品数据结构**
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

3. **功能要求**
   - 展示产品列表
   - 实现分类筛选
   - 添加"加入购物车"按钮
   - 显示库存状态
   - 价格格式化显示

### 示例数据

```typescript
const products = [
  {
    id: 1,
    name: "无线耳机",
    price: 299,
    description: "高音质蓝牙耳机",
    category: "电子产品",
    image: "https://placeholder.com/200",
    inStock: true
  },
  // 更多产品...
];
```

## 代码结构建议

```
src/
├── components/
│   ├── ProfileCard/
│   │   ├── ProfileCard.tsx
│   │   └── ProfileCard.css
│   ├── WeatherWidget/
│   │   ├── WeatherWidget.tsx
│   │   └── WeatherWidget.css
│   └── ProductList/
│       ├── ProductList.tsx
│       ├── ProductItem.tsx
│       ├── CategoryFilter.tsx
│       └── ProductList.css
└── App.tsx
```

## 评分标准

1. **功能实现 (40%)**
   - 所有组件正常渲染
   - props正确传递
   - 事件处理正常

2. **代码质量 (30%)**
   - TypeScript类型正确
   - 组件结构合理
   - 代码可读性好

3. **样式设计 (20%)**
   - 界面美观
   - 响应式布局
   - 用户体验良好

4. **最佳实践 (10%)**
   - 使用函数组件
   - 合理的组件拆分
   - 正确的key使用

## 挑战任务

如果完成了基础练习，可以尝试：

1. **ProfileCard增强**
   - 添加社交媒体链接
   - 实现编辑模式
   - 添加技能标签

2. **WeatherWidget增强**
   - 添加未来天气预报
   - 实现地理定位
   - 添加天气动画

3. **ProductList增强**
   - 实现搜索功能
   - 添加排序选项
   - 实现分页功能
   - 添加购物车计数

## 提示

1. 使用`useState`管理组件状态
2. 使用`map`方法渲染列表
3. 使用条件渲染处理可选数据
4. 注意为列表项添加key
5. 使用CSS模块或styled-components管理样式

加油！通过这些练习，你将掌握React的基础概念！🚀