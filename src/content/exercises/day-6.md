---
title: "Tailwind CSS仪表板重构"
day: 6
difficulty: "intermediate"
estimatedTime: 45
description: "使用Tailwind CSS重构Day 5创建的仪表板，体验实用优先的开发方式"
requirements:
  - "移除所有自定义CSS类"
  - "使用Tailwind工具类重建所有样式"
  - "实现响应式设计"
  - "添加暗色模式功能"
  - "创建交互效果"
checkpoints:
  - task: "设置Tailwind CSS（CDN或npm）"
    completed: false
  - task: "重构导航栏使用Tailwind类"
    completed: false
  - task: "重构统计卡片布局"
    completed: false
  - task: "实现响应式网格系统"
    completed: false
  - task: "添加暗色模式切换"
    completed: false
  - task: "实现悬停和过渡效果"
    completed: false
  - task: "创建可关闭的通知组件"
    completed: false
  - task: "优化移动端显示"
    completed: false
hints:
  - "使用grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4实现响应式网格"
  - "使用dark:前缀为暗色模式添加样式"
  - "使用hover:和transition类创建平滑的交互效果"
  - "使用@apply创建可复用的组件类"
---

# Day 6 练习：使用Tailwind CSS重构仪表板

## 项目目标

将Day 5创建的CSS Grid仪表板完全使用Tailwind CSS重构，体验实用优先的开发方式，并添加新功能。

## 具体要求

### 1. 基础重构（必做）

- [ ] 移除所有自定义CSS类
- [ ] 使用Tailwind工具类重建所有样式
- [ ] 保持原有的布局和功能
- [ ] 实现响应式设计（移动端、平板、桌面）

### 2. 功能增强（必做）

- [ ] 添加暗色模式切换功能
- [ ] 实现卡片的悬停效果（阴影、缩放）
- [ ] 添加加载动画效果
- [ ] 创建可关闭的通知组件

### 3. 新增组件（选做）

- [ ] 侧边栏导航（可折叠）
- [ ] 用户下拉菜单
- [ ] 数据筛选器
- [ ] 分页组件

## 技术要求

### 1. 只使用Tailwind CSS
- 不编写自定义CSS（除非使用@apply）
- 充分利用Tailwind的工具类

### 2. 响应式设计
- 使用sm:、md:、lg:、xl:前缀
- 移动优先的设计方法

### 3. 交互效果
- 使用hover:、focus:、active:状态
- 添加平滑过渡效果

### 4. 性能优化
- 使用CDN版本进行开发
- 了解生产环境的优化方法

## 起始代码结构

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tailwind仪表板</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            darkMode: 'class',
            // 在这里添加自定义配置
        }
    </script>
</head>
<body>
    <!-- 开始构建你的仪表板 -->
</body>
</html>
```

## 评分标准

### 1. 代码质量（40%）
- 合理使用Tailwind工具类
- HTML结构清晰
- 响应式实现完善

### 2. 功能完整性（30%）
- 所有必做功能正常工作
- 交互流畅自然
- 无明显bug

### 3. 设计美观（20%）
- 视觉效果协调
- 动画过渡流畅
- 暗色模式体验良好

### 4. 创新加分（10%）
- 添加额外功能
- 优秀的用户体验
- 代码组织优秀

## 提示和建议

### 布局技巧
```html
<!-- 响应式网格 -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    <!-- 内容 -->
</div>

<!-- Flex布局 -->
<div class="flex flex-col md:flex-row justify-between items-center">
    <!-- 内容 -->
</div>
```

### 组件示例
```html
<!-- 统计卡片 -->
<div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
    <h3 class="text-sm text-gray-600 dark:text-gray-400">标题</h3>
    <p class="text-2xl font-bold text-gray-900 dark:text-white">数值</p>
</div>

<!-- 按钮 -->
<button class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
    按钮
</button>
```

### 暗色模式实现
```javascript
// 切换暗色模式
function toggleDarkMode() {
    document.documentElement.classList.toggle('dark');
}
```

## 学习资源

- [Tailwind CSS官方文档](https://tailwindcss.com/docs)
- [Tailwind CSS Cheat Sheet](https://nerdcave.com/tailwind-cheat-sheet)
- 参考Day 6课程中的示例代码

## 挑战任务（可选）

1. **组件抽象**：使用@apply创建可复用的组件类
2. **动画增强**：添加自定义动画效果
3. **配置定制**：创建自定义的Tailwind配置
4. **性能对比**：比较原版CSS和Tailwind版本的文件大小

祝你编码愉快！🚀