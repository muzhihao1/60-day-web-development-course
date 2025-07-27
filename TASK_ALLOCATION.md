# 60天Web开发课程 Astro重构 - 任务分配文档

## 项目概述
将现有的Docsify课程网站迁移到Astro框架，重点解决以下问题：
- 侧边栏信息架构混乱
- 学习路径不清晰
- 内容组织方式需要优化

## 任务分配

### 终端A任务（基础架构与导航系统）

#### 1. Astro项目初始化与基础配置 ✅
- [x] 创建新的Astro项目
- [x] 配置项目基础结构
- [x] 设置TypeScript支持
- [x] 配置构建和开发脚本

#### 2. 导航系统设计与实现 🚀 [进行中]
- [x] 设计新的侧边栏组件结构
- [ ] 实现多级导航组件
- [ ] 创建面包屑导航
- [ ] 实现进度跟踪系统

#### 3. 共享组件开发 🚀 [进行中]
- [x] Layout组件（整体布局）
- [ ] Navigation组件（导航栏）
- [ ] ProgressTracker组件（学习进度）
- [ ] CodeBlock组件（代码展示）

#### 4. 路由系统配置
- [ ] 设计URL结构
- [ ] 配置动态路由
- [ ] 实现页面间导航逻辑

**工作目录：**
- `/src/components/` - 组件开发
- `/src/layouts/` - 布局文件
- `/astro.config.mjs` - 配置文件
- `/src/lib/` - 工具函数

---

### 终端B任务（内容系统与样式）

#### 1. 内容迁移策略
- [x] 分析现有内容结构
- [x] 设计新的内容组织方案
- [x] 创建内容迁移脚本
- [x] 建立内容模板

#### 2. 页面模板设计 ✅
- [x] Day页面模板（每日课程）
- [x] Exercise页面模板（练习）
- [x] Solution页面模板（解决方案）
- [x] Overview页面模板（总览）

#### 3. 样式系统
- [ ] 设计主题系统（亮色/暗色）
- [x] 创建全局样式
- [x] 设计响应式布局
- [x] 优化移动端体验

#### 4. 内容增强功能
- [ ] 代码高亮配置
- [ ] 图片优化方案
- [ ] SEO优化
- [ ] 搜索功能集成

**工作目录：**
- `/src/pages/` - 页面文件
- `/src/styles/` - 样式文件
- `/src/content/` - 内容文件
- `/public/` - 静态资源

---

## 协作规范

### 文件命名约定
- 组件：PascalCase（如 `NavigationBar.astro`）
- 页面：kebab-case（如 `day-01.astro`）
- 样式：kebab-case（如 `global-styles.css`）

### Git分支策略
- 终端A分支：`feature/infrastructure-navigation`
- 终端B分支：`feature/content-styling`
- 主分支：`main`

### 接口约定
两个终端需要协商的接口：

1. **内容数据结构**
```typescript
interface DayContent {
  day: number
  title: string
  description: string
  objectives: string[]
  sections: Section[]
  exercises: Exercise[]
  solution: Solution
}
```

2. **导航数据结构**
```typescript
interface NavItem {
  label: string
  href: string
  children?: NavItem[]
  type: 'theory' | 'practice' | 'solution'
  completed?: boolean
}
```

### 避免冲突的措施
1. 严格按照分配的目录工作
2. 共享接口定义文件位于 `/src/types/`
3. 定期同步进度，避免重复工作
4. 使用明确的文件命名避免冲突

## 时间线
- Day 1-2: 项目初始化和基础架构
- Day 3-4: 核心功能开发
- Day 5: 集成测试和优化

## 沟通机制
- 每完成一个主要功能模块后更新此文档
- 遇到需要协调的问题及时沟通
- 保持代码提交信息清晰明确

## 进度更新

### 终端B进度（最后更新：2025-07-27）

**已完成：**
1. ✅ 分析现有内容结构
   - 理解了60天课程的5个phase结构
   - 每个day包含：README.md、exercise.md、code/、solution/
   
2. ✅ 创建共享接口定义
   - `/src/types/content.ts` - 内容相关类型定义
   - `/src/types/navigation.ts` - 导航相关类型定义
   - `/src/types/index.ts` - 统一导出

3. ✅ 设计内容组织方案
   - 配置了Astro content collections (`/src/content/config.ts`)
   - 创建了5个集合：phases、courses、exercises、solutions、codeExamples
   - 创建了所有phase的数据文件

**已完成（续）：**
4. ✅ 创建页面模板
   - Day页面模板 (`/src/pages/course/day-[day].astro`)
   - Exercise页面模板 (`/src/pages/course/day-[day]/exercise.astro`)
   - Solution页面模板 (`/src/pages/course/day-[day]/solution.astro`)

5. ✅ 创建全局样式
   - 完整的CSS变量系统
   - 响应式设计基础
   - 组件样式（按钮、卡片、徽章等）
   - 课程页面专用样式

**已完成（续）：**
6. ✅ 创建Overview页面模板
   - 课程总览页面 (`/src/pages/course/index.astro`)
   - 学习进度追踪
   - 阶段卡片展示

7. ✅ 响应式布局实现
   - 移动优先设计
   - 媒体查询断点
   - 灵活的网格系统

8. ✅ 内容迁移脚本
   - 自动化迁移工具 (`/scripts/migrate-content.js`)
   - 支持frontmatter转换
   - 批量处理所有课程内容

9. ✅ 创建示例内容
   - Day 1 课程内容示例
   - 展示content collection格式

**待办：**
- 主题系统（亮色/暗色模式切换）
- 代码高亮插件集成
- 图片优化配置
- SEO优化实现
- 搜索功能集成

**总体完成度：** 主要任务已完成约80%，核心功能已就绪

### 终端A进度（最后更新：2024-07-27）

**已完成：**
1. ✅ 项目初始化与基础配置
   - 创建了Astro项目结构
   - 配置了TypeScript、MDX、Sitemap支持
   - 设置了astro.config.mjs和tsconfig.json
   - 创建了项目目录结构

2. ✅ 导航系统设计
   - 创建了navigation.ts，定义了清晰的学习路径
   - 设计了5个学习阶段的导航结构
   - 实现了getDayNavigation、getPhaseNavigation等工具函数
   - 定义了面包屑导航生成逻辑

3. ✅ 类型定义
   - 创建了完整的TypeScript类型定义（course.ts）
   - 定义了DayContent、NavItem、Phase等核心接口

4. ✅ BaseLayout组件
   - 创建了响应式布局框架
   - 实现了主题切换功能（亮色/暗色）
   - 集成了顶部导航栏和侧边栏占位

**进行中：**
- 🚀 Navigation组件实现
- 🚀 Breadcrumbs组件开发
- 🚀 ProgressBar组件开发

**待办：**
- CodeBlock组件
- 路由系统配置
- 动态页面生成