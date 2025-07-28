---
day: 13
title: "构建语义化新闻门户首页"
description: "创建一个完全语义化、可访问且SEO友好的新闻网站首页，综合运用HTML5语义标签、ARIA属性和结构化数据"
difficulty: "intermediate"
estimatedTime: 120
requirements:
  - "使用正确的HTML5语义标签构建页面结构"
  - "实现ARIA增强的导航系统和地标"
  - "创建可访问的搜索表单和订阅表单"
  - "添加Schema.org结构化数据标记"
  - "确保页面通过WAVE或axe DevTools的可访问性检查"
hints:
  - "使用语义标签时思考内容的含义，而不是外观"
  - "为所有交互元素提供键盘访问支持"
  - "使用适当的ARIA标签和属性增强屏幕阅读器体验"
  - "测试时关闭CSS查看页面结构是否仍然有意义"
checkpoints:
  - task: "创建语义化的页面头部，包含站点标识和主导航"
    completed: false
  - task: "实现带ARIA增强的响应式导航菜单"
    completed: false
  - task: "构建主要内容区域，包含特色文章和分类文章"
    completed: false
  - task: "添加侧边栏，包含热门文章和标签云"
    completed: false
  - task: "创建可访问的搜索和订阅表单"
    completed: false
  - task: "实现页脚，包含网站地图和版权信息"
    completed: false
  - task: "添加结构化数据标记"
    completed: false
  - task: "通过可访问性验证工具测试"
    completed: false
---

# 练习：构建语义化新闻门户首页

## 🎯 任务目标

你被聘请为一家新闻媒体公司重构他们的网站首页。当前的网站全部使用`<div>`标签构建，导致可访问性极差，SEO表现不佳。你的任务是创建一个完全语义化、符合WCAG 2.1 AA标准的新首页。

## 📋 需求详情

### 1. 页面结构要求

创建包含以下部分的新闻门户首页：

#### 页面头部
- 网站Logo和名称
- 主导航菜单（包含：首页、国内、国际、财经、科技、体育、娱乐）
- 搜索功能
- 用户账户入口（登录/注册）

#### 主要内容区
- 头条新闻（1篇特色文章）
- 今日要闻（3-4篇重要新闻）
- 分类新闻展示（至少2个分类，每个分类3篇文章）

#### 侧边栏
- 热门文章排行（前5篇）
- 标签云
- 新闻订阅表单

#### 页脚
- 网站地图（分类链接）
- 关于我们、联系方式、隐私政策等链接
- 版权信息
- 社交媒体链接

### 2. 语义化要求

#### 必须使用的语义标签：
```html
<header>, <nav>, <main>, <article>, <section>, 
<aside>, <footer>, <h1>-<h6>, <time>, <figure>, 
<figcaption>, <mark>, <address>
```

#### 示例结构：
```html
<body>
  <header>
    <!-- 站点头部 -->
  </header>
  
  <nav aria-label="面包屑">
    <!-- 面包屑导航 -->
  </nav>
  
  <main>
    <section>
      <!-- 头条新闻 -->
    </section>
    <section>
      <!-- 分类新闻 -->
    </section>
  </main>
  
  <aside>
    <!-- 侧边栏 -->
  </aside>
  
  <footer>
    <!-- 页脚 -->
  </footer>
</body>
```

### 3. ARIA增强要求

#### 导航系统
```html
<!-- 主导航 -->
<nav role="navigation" aria-label="主导航">
  <ul>
    <li><a href="/" aria-current="page">首页</a></li>
    <li>
      <a href="/domestic" 
         aria-haspopup="true" 
         aria-expanded="false">
        国内
      </a>
      <!-- 子菜单 -->
    </li>
  </ul>
</nav>
```

#### 实时更新区域
```html
<!-- 突发新闻提示 -->
<div role="region" 
     aria-live="polite" 
     aria-label="突发新闻">
  <!-- 动态更新的突发新闻 -->
</div>
```

#### 表单增强
```html
<form role="search" aria-label="站内搜索">
  <input type="search" 
         aria-label="搜索新闻"
         aria-describedby="search-hint">
  <span id="search-hint" class="visually-hidden">
    输入关键词搜索新闻
  </span>
</form>
```

### 4. 文章卡片模板

每篇文章应该使用以下结构：

```html
<article>
  <header>
    <h2><a href="/article-url">文章标题</a></h2>
    <p class="meta">
      <time datetime="2025-07-29T10:00:00+08:00">
        2025年7月29日 10:00
      </time>
      <span>作者：<a rel="author" href="/author/zhangsan">张三</a></span>
      <span>分类：<a href="/category/tech">科技</a></span>
    </p>
  </header>
  
  <figure>
    <img src="article-image.jpg" 
         alt="详细的图片描述">
    <figcaption>图片说明文字</figcaption>
  </figure>
  
  <p>文章摘要内容...</p>
  
  <footer>
    <a href="/article-url" aria-label="阅读完整文章：文章标题">
      继续阅读 <span aria-hidden="true">→</span>
    </a>
  </footer>
</article>
```

### 5. 结构化数据要求

为首页添加以下结构化数据：

#### 组织信息
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "NewsMediaOrganization",
  "name": "新闻门户网",
  "url": "https://example.com",
  "logo": "https://example.com/logo.png",
  "sameAs": [
    "https://twitter.com/newsportal",
    "https://facebook.com/newsportal"
  ]
}
</script>
```

#### 文章数据（每篇文章）
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "NewsArticle",
  "headline": "文章标题",
  "datePublished": "2025-07-29T10:00:00+08:00",
  "author": {
    "@type": "Person",
    "name": "作者名"
  },
  "publisher": {
    "@type": "Organization",
    "name": "新闻门户网"
  },
  "image": "https://example.com/image.jpg",
  "description": "文章摘要"
}
</script>
```

### 6. 可访问性检查清单

完成后，确保页面满足以下要求：

- [ ] 所有图片都有描述性的alt文本
- [ ] 标题层级正确（h1→h2→h3，不跳级）
- [ ] 表单控件都有关联的label
- [ ] 颜色对比度符合WCAG AA标准（4.5:1）
- [ ] 所有交互元素可通过键盘访问
- [ ] 提供跳转到主要内容的链接
- [ ] 链接文本有意义（避免"点击这里"）
- [ ] 使用适当的ARIA标签但不过度使用

## 🎨 设计指南

### 布局建议
- 使用网格系统组织内容
- 保持视觉层次清晰
- 确保触摸目标至少44×44像素
- 在不同断点保持良好的响应式效果

### 样式原则
- 使用系统字体栈提高性能
- 保持充足的行高（至少1.5）
- 使用相对单位（rem/em）
- 为交互状态提供清晰的视觉反馈

## 📝 提交要求

1. **HTML文件**：`news-portal.html`
   - 完整的语义化HTML结构
   - 包含所有必需的ARIA属性
   - 嵌入结构化数据

2. **CSS文件**：`styles.css`（可选）
   - 基础样式以验证视觉效果
   - 确保打印样式正常

3. **测试报告**：`accessibility-report.md`
   - WAVE或axe DevTools的测试结果截图
   - 发现并修复的问题列表
   - 键盘导航测试结果

## 🔍 评估标准

你的作品将根据以下标准评分：

1. **语义化正确性（40%）**
   - 正确使用HTML5语义标签
   - 文档结构逻辑清晰
   - 内容组织合理

2. **可访问性实现（30%）**
   - ARIA属性使用恰当
   - 键盘导航完善
   - 屏幕阅读器友好

3. **SEO优化（20%）**
   - 结构化数据正确
   - 元数据完整
   - URL结构友好

4. **代码质量（10%）**
   - HTML验证通过
   - 代码组织清晰
   - 注释恰当

## 💡 额外挑战

如果你完成了基础要求，可以尝试：

1. **多语言支持**
   - 使用`lang`属性标记不同语言内容
   - 实现语言切换功能的语义化结构

2. **高级ARIA模式**
   - 实现选项卡界面（tabs）
   - 创建可访问的轮播图
   - 添加实时搜索建议

3. **性能优化**
   - 实现关键CSS内联
   - 添加资源预加载提示
   - 优化图片加载策略

## 🚀 开始创建

现在开始创建你的语义化新闻门户首页吧！记住：
- 先构建HTML结构，再添加样式
- 经常测试可访问性
- 从用户角度思考信息架构

祝你成功！🎉