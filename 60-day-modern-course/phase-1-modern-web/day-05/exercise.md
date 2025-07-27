# Day 05 练习：响应式管理仪表板

## 🎯 练习目标

创建一个使用CSS Grid和CSS变量的响应式管理仪表板，包含统计卡片、图表区域、数据表格和侧边栏导航。

## 📝 练习要求

### 1. 基础布局要求

使用CSS Grid创建以下布局结构：
- 固定高度的顶部导航栏
- 可折叠的侧边栏（桌面端固定宽度，移动端隐藏）
- 主内容区域包含：
  - 4个统计卡片（自适应列数）
  - 2个图表区域（大图表占2/3，小图表占1/3）
  - 一个数据表格区域
- 响应式断点：1024px、768px、480px

### 2. CSS Grid 要求

必须使用以下Grid特性：
- `grid-template-areas` 定义布局区域
- `repeat()` 和 `minmax()` 创建响应式网格
- `auto-fit` 或 `auto-fill` 实现自适应列数
- `gap` 属性设置网格间距
- 至少一个跨行或跨列的网格项

### 3. CSS变量要求

创建以下CSS自定义属性系统：
- 颜色系统（主色、次色、背景色、文字色等）
- 间距系统（使用统一的间距变量）
- 尺寸系统（侧边栏宽度、头部高度等）
- 阴影系统（不同层级的阴影）
- 实现浅色/深色主题切换

### 4. 特殊布局要求

- 统计卡片：使用auto-fit实现自适应列数
- 图表区域：大图表跨2列，与小图表并排
- 数据表格：在容器内横向滚动
- 侧边栏：使用sticky定位，可滚动

### 5. 交互要求

- 主题切换按钮（浅色/深色）
- 悬停效果（卡片提升、按钮变色）
- 侧边栏折叠功能（移动端）
- 平滑过渡动画

## 📋 具体任务清单

### HTML结构
- [ ] 创建语义化的HTML结构
- [ ] 使用适当的ARIA标签
- [ ] 添加主题切换按钮
- [ ] 创建侧边栏导航菜单

### CSS Grid布局
- [ ] 定义主网格容器（整体布局）
- [ ] 使用grid-template-areas规划区域
- [ ] 创建响应式统计卡片网格
- [ ] 实现图表区域的不对称布局
- [ ] 设置适当的网格间距

### CSS变量系统
- [ ] 定义颜色变量（支持主题切换）
- [ ] 创建间距和尺寸变量
- [ ] 实现响应式变量（随屏幕尺寸变化）
- [ ] 使用calc()进行动态计算

### 响应式设计
- [ ] 1024px断点：调整侧边栏宽度
- [ ] 768px断点：隐藏侧边栏，单列布局
- [ ] 480px断点：优化移动端显示
- [ ] 测试各断点下的布局表现

### 视觉效果
- [ ] 添加卡片悬停效果
- [ ] 实现平滑的主题切换过渡
- [ ] 创建统一的圆角和阴影系统
- [ ] 优化颜色对比度（可访问性）

## 🎨 设计规范

### 颜色方案

```css
/* 浅色主题 */
--primary: #3b82f6;
--secondary: #10b981;
--warning: #f59e0b;
--danger: #ef4444;
--bg-primary: #f9fafb;
--bg-secondary: #ffffff;
--text-primary: #111827;
--text-secondary: #6b7280;

/* 深色主题 */
[data-theme="dark"] {
    --bg-primary: #111827;
    --bg-secondary: #1f2937;
    --text-primary: #f9fafb;
    --text-secondary: #9ca3af;
}
```

### 间距系统

```css
--space-xs: 0.25rem;
--space-sm: 0.5rem;
--space-md: 1rem;
--space-lg: 1.5rem;
--space-xl: 2rem;
--space-2xl: 3rem;
```

### 布局尺寸

```css
--sidebar-width: 260px;
--sidebar-collapsed: 60px;
--header-height: 64px;
--card-min-width: 250px;
```

## 💡 提示

### Grid布局技巧

1. **主布局结构**：
```css
.dashboard {
    display: grid;
    grid-template-areas:
        "sidebar header"
        "sidebar main";
    grid-template-columns: var(--sidebar-width) 1fr;
    grid-template-rows: var(--header-height) 1fr;
}
```

2. **响应式卡片网格**：
```css
.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(var(--card-min-width), 1fr));
    gap: var(--space-lg);
}
```

3. **不对称图表布局**：
```css
.charts-grid {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: var(--space-lg);
}
```

### CSS变量技巧

1. **响应式变量**：
```css
@media (max-width: 768px) {
    :root {
        --sidebar-width: 0;
        --space-lg: 1rem;
    }
}
```

2. **动态计算**：
```css
.content {
    width: calc(100vw - var(--sidebar-width));
    padding: calc(var(--space-md) * 2);
}
```

3. **主题切换**：
```javascript
document.body.setAttribute('data-theme', 
    document.body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'
);
```

## 📊 预期效果

### 桌面端（>1024px）
- 侧边栏固定在左侧
- 统计卡片每行4个
- 图表区域2:1布局
- 充足的内容间距

### 平板端（768px-1024px）
- 侧边栏宽度减小
- 统计卡片每行2-3个
- 图表区域保持2:1
- 适中的内容间距

### 移动端（<768px）
- 侧边栏隐藏（汉堡菜单）
- 统计卡片单列显示
- 图表区域垂直堆叠
- 紧凑的内容间距

## ⚡ 挑战任务（可选）

1. **高级Grid功能**：
   - 使用subgrid实现嵌套网格对齐
   - 创建masonry风格的内容布局
   - 实现Grid动画效果

2. **高级主题系统**：
   - 添加更多主题选项（蓝色、绿色等）
   - 实现主题色自定义功能
   - 保存用户主题偏好到localStorage

3. **性能优化**：
   - 使用CSS containment优化渲染
   - 实现虚拟滚动的数据表格
   - 添加骨架屏加载效果

## 🎯 评分标准

### 基础要求（60分）
- Grid布局正确实现
- CSS变量系统完整
- 基本响应式适配
- 代码结构清晰

### 进阶要求（30分）
- 主题切换功能流畅
- 动画效果自然
- 可访问性良好
- 性能优化合理

### 卓越表现（10分）
- 创新的布局设计
- 优秀的用户体验
- 代码复用性高
- 完成挑战任务

## 🔍 常见问题

1. **Q: Grid和Flexbox如何选择？**
   A: Grid适合二维布局（整体页面结构），Flexbox适合一维布局（组件内部）。

2. **Q: CSS变量不生效？**
   A: 检查变量定义位置（通常在:root）和使用时的var()语法。

3. **Q: 响应式断点如何确定？**
   A: 基于内容而非设备，在布局开始破坏时添加断点。

4. **Q: 主题切换闪烁？**
   A: 使用CSS过渡，并在切换前预加载主题样式。

5. **Q: Grid布局在IE中不支持？**
   A: 提供Flexbox降级方案，或使用Autoprefixer处理兼容性。

祝你完成一个功能完善、视觉出色的现代仪表板！记住，Grid让复杂布局变简单，CSS变量让维护更轻松。