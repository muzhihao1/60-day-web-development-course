# Day 02: HTML5语义化与可访问性

## 📋 学习目标

今天我们将深入学习HTML5的语义化标签和Web可访问性，这是构建现代、专业网站的基础。

- 理解语义化HTML的重要性
- 掌握HTML5新增的语义化标签
- 学习Web可访问性(a11y)的核心原则
- 使用ARIA属性增强可访问性
- 通过屏幕阅读器测试网页可访问性

## ⏱️ 复习Git命令（5分钟）

### 快速复习

开始今天的学习前，让我们快速复习昨天学习的Git命令：

```bash
# 查看当前仓库状态
git status

# 添加文件到暂存区
git add .

# 提交更改
git commit -m "Day 2: 学习HTML5语义化"

# 推送到远程仓库
git push origin main
```

### 今日Git技巧：查看差异

```bash
# 查看工作区与暂存区的差异
git diff

# 查看暂存区与仓库的差异
git diff --staged

# 查看某个文件的修改
git diff index.html
```

## 💡 HTML5语义化标签详解（15分钟）

### 什么是语义化HTML？

语义化HTML是指使用恰当的HTML标签来描述内容的含义，而不仅仅是外观。这带来以下好处：

1. **提高可访问性**：屏幕阅读器能更好地理解页面结构
2. **改善SEO**：搜索引擎更容易理解内容
3. **增强可维护性**：代码更易读、易理解
4. **跨设备兼容**：在不同设备上有更好的表现

### HTML5语义化标签详解

#### 1. 文档结构标签

**`<header>`** - 页眉
```html
<header>
  <h1>网站标题</h1>
  <nav>
    <!-- 导航菜单 -->
  </nav>
</header>
```

**`<nav>`** - 导航
```html
<nav aria-label="主导航">
  <ul>
    <li><a href="#home">首页</a></li>
    <li><a href="#about">关于</a></li>
    <li><a href="#contact">联系</a></li>
  </ul>
</nav>
```

**`<main>`** - 主要内容
```html
<main>
  <h1>页面主标题</h1>
  <p>主要内容区域，每个页面只能有一个main标签</p>
</main>
```

**`<section>`** - 章节
```html
<section>
  <h2>章节标题</h2>
  <p>相关内容的独立部分</p>
</section>
```

**`<article>`** - 文章
```html
<article>
  <header>
    <h2>文章标题</h2>
    <time datetime="2024-01-27">2024年1月27日</time>
  </header>
  <p>独立的内容，如博客文章、新闻报道等</p>
</article>
```

**`<aside>`** - 侧边栏
```html
<aside>
  <h3>相关链接</h3>
  <ul>
    <li><a href="#">链接1</a></li>
    <li><a href="#">链接2</a></li>
  </ul>
</aside>
```

**`<footer>`** - 页脚
```html
<footer>
  <p>&copy; 2024 我的网站</p>
  <address>
    联系邮箱：<a href="mailto:info@example.com">info@example.com</a>
  </address>
</footer>
```

#### 2. 内容标签

**`<figure>` 和 `<figcaption>`** - 图表和说明
```html
<figure>
  <img src="chart.png" alt="2023年销售数据图表">
  <figcaption>图1：2023年各季度销售数据对比</figcaption>
</figure>
```

**`<time>`** - 时间
```html
<time datetime="2024-01-27T10:00">1月27日上午10点</time>
```

**`<mark>`** - 高亮
```html
<p>搜索结果：找到 <mark>HTML5</mark> 相关内容</p>
```

**`<details>` 和 `<summary>`** - 折叠内容
```html
<details>
  <summary>点击查看更多信息</summary>
  <p>这里是详细内容，默认是折叠的</p>
</details>
```

### 语义化标签 vs DIV

❌ **不好的做法：**
```html
<div class="header">
  <div class="nav">
    <div class="nav-item">首页</div>
  </div>
</div>
```

✅ **好的做法：**
```html
<header>
  <nav>
    <a href="/">首页</a>
  </nav>
</header>
```

## 🦾 构建可访问的网页结构（30分钟）

### Web可访问性（a11y）基础

Web可访问性确保所有人都能使用你的网站，包括：
- 视觉障碍用户（使用屏幕阅读器）
- 听觉障碍用户
- 运动障碍用户（使用键盘导航）
- 认知障碍用户

### WCAG 2.1 核心原则

1. **可感知（Perceivable）**
   - 提供文本替代
   - 适应性展示
   - 足够的对比度

2. **可操作（Operable）**
   - 键盘可访问
   - 充足的时间
   - 避免癫痫诱因

3. **可理解（Understandable）**
   - 可读性
   - 可预测性
   - 输入协助

4. **健壮性（Robust）**
   - 兼容辅助技术
   - 标准化代码

### 实践：构建可访问的页面结构

让我们创建一个完整的、语义化的、可访问的网页结构：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="学习HTML5语义化和可访问性的示例页面">
  <title>我的博客 - 分享Web开发经验</title>
</head>
<body>
  <!-- 跳转到主内容的链接（键盘用户友好） -->
  <a href="#main-content" class="skip-link">跳转到主要内容</a>
  
  <!-- 页眉 -->
  <header role="banner">
    <h1>我的技术博客</h1>
    
    <!-- 主导航 -->
    <nav role="navigation" aria-label="主导航">
      <ul>
        <li><a href="/" aria-current="page">首页</a></li>
        <li><a href="/articles">文章</a></li>
        <li><a href="/about">关于我</a></li>
        <li><a href="/contact">联系方式</a></li>
      </ul>
    </nav>
  </header>
  
  <!-- 主要内容区 -->
  <main id="main-content" role="main">
    <section aria-labelledby="recent-posts">
      <h2 id="recent-posts">最新文章</h2>
      
      <!-- 文章列表 -->
      <article>
        <header>
          <h3>
            <a href="/article/semantic-html">
              掌握HTML5语义化：构建更好的Web
            </a>
          </h3>
          <p>
            <time datetime="2024-01-27">2024年1月27日</time>
            <span>作者：<a href="/author/zhangsan" rel="author">张三</a></span>
          </p>
        </header>
        
        <p>语义化HTML不仅让你的代码更清晰，还能提升网站的可访问性和SEO表现...</p>
        
        <footer>
          <a href="/article/semantic-html" aria-label="阅读完整文章：掌握HTML5语义化">
            继续阅读 <span aria-hidden="true">→</span>
          </a>
        </footer>
      </article>
      
      <!-- 更多文章... -->
    </section>
    
    <!-- 侧边栏 -->
    <aside aria-labelledby="sidebar-title">
      <h2 id="sidebar-title">相关资源</h2>
      
      <section>
        <h3>标签云</h3>
        <ul role="list">
          <li><a href="/tag/html5" rel="tag">HTML5</a></li>
          <li><a href="/tag/css3" rel="tag">CSS3</a></li>
          <li><a href="/tag/javascript" rel="tag">JavaScript</a></li>
        </ul>
      </section>
      
      <section>
        <h3>友情链接</h3>
        <ul role="list">
          <li><a href="https://developer.mozilla.org" rel="external">MDN文档</a></li>
          <li><a href="https://www.w3.org/WAI/" rel="external">W3C可访问性指南</a></li>
        </ul>
      </section>
    </aside>
  </main>
  
  <!-- 页脚 -->
  <footer role="contentinfo">
    <h2 class="visually-hidden">网站信息</h2>
    
    <section>
      <h3>联系方式</h3>
      <address>
        <p>邮箱：<a href="mailto:contact@example.com">contact@example.com</a></p>
        <p>GitHub：<a href="https://github.com/username" rel="external">@username</a></p>
      </address>
    </section>
    
    <p>
      <small>&copy; 2024 我的技术博客. 保留所有权利.</small>
    </p>
  </footer>
</body>
</html>
```

### ARIA属性详解

ARIA (Accessible Rich Internet Applications) 属性帮助辅助技术理解页面内容：

#### 常用ARIA属性

1. **role** - 定义元素的角色
```html
<div role="navigation">...</div>
<div role="main">...</div>
<div role="banner">...</div>
```

2. **aria-label** - 提供可访问的名称
```html
<button aria-label="关闭对话框">×</button>
<nav aria-label="面包屑导航">...</nav>
```

3. **aria-labelledby** - 关联标签
```html
<section aria-labelledby="section-title">
  <h2 id="section-title">章节标题</h2>
</section>
```

4. **aria-describedby** - 提供描述
```html
<input type="password" aria-describedby="pwd-help">
<p id="pwd-help">密码必须包含至少8个字符</p>
```

5. **aria-hidden** - 隐藏装饰性内容
```html
<span aria-hidden="true">👉</span> <!-- 装饰性图标 -->
```

6. **aria-current** - 当前项
```html
<a href="/" aria-current="page">首页</a>
```

7. **aria-expanded** - 展开状态
```html
<button aria-expanded="false" aria-controls="menu">菜单</button>
<ul id="menu" hidden>...</ul>
```

### 表单可访问性

```html
<form>
  <fieldset>
    <legend>个人信息</legend>
    
    <div>
      <label for="name">姓名：<span aria-label="必填">*</span></label>
      <input 
        type="text" 
        id="name" 
        name="name" 
        required
        aria-required="true"
        aria-describedby="name-error"
      >
      <span id="name-error" role="alert" aria-live="polite"></span>
    </div>
    
    <div>
      <label for="email">邮箱：</label>
      <input 
        type="email" 
        id="email" 
        name="email"
        aria-describedby="email-hint"
      >
      <small id="email-hint">我们不会分享您的邮箱地址</small>
    </div>
  </fieldset>
  
  <button type="submit">提交</button>
</form>
```

## 🔍 使用屏幕阅读器测试（10分钟）

### 常用屏幕阅读器

1. **Windows**: NVDA (免费) 或 JAWS
2. **macOS**: VoiceOver (内置)
3. **Linux**: Orca
4. **浏览器插件**: ChromeVox

### macOS VoiceOver 快速指南

1. **开启VoiceOver**: `Cmd + F5`
2. **基本导航**:
   - `Control + Option + 右箭头`: 下一个元素
   - `Control + Option + 左箭头`: 上一个元素
   - `Control + Option + A`: 开始阅读
   - `Control`: 停止阅读

### 测试要点

1. **页面结构**
   - 标题层级是否正确
   - 地标(landmarks)是否清晰
   - 导航是否可理解

2. **链接和按钮**
   - 链接文本是否有意义
   - 按钮功能是否清楚
   - 避免"点击这里"等无意义文本

3. **图片**
   - 所有图片是否有合适的alt文本
   - 装饰性图片是否标记为`alt=""`

4. **表单**
   - 所有输入框是否有标签
   - 错误信息是否能被读取
   - 必填字段是否标识清楚

### 实践练习

创建一个测试页面，包含：
- 清晰的页面结构
- 带有适当ARIA标签的导航
- 可访问的表单
- 有意义的链接文本

然后使用屏幕阅读器测试，确保：
- 可以理解页面结构
- 可以顺利导航
- 表单可以正确填写
- 所有功能都可以通过键盘访问

## 📚 学习资源

### 官方文档
- [MDN: HTML语义化](https://developer.mozilla.org/zh-CN/docs/Glossary/Semantics)
- [W3C WAI-ARIA](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM: 可访问性介绍](https://webaim.org/intro/)

### 工具和检查器
- [WAVE: 在线可访问性检查](https://wave.webaim.org/)
- [axe DevTools: 浏览器插件](https://www.deque.com/axe/devtools/)
- [Lighthouse: Chrome内置审计工具](https://developers.google.com/web/tools/lighthouse)

### 推荐阅读
- [《无障碍Web设计》](https://www.amazon.cn/dp/B07D3BH7TF)
- [A11y Project](https://www.a11yproject.com/)
- [Inclusive Components](https://inclusive-components.design/)

## ✅ 今日检查清单

- [ ] 理解语义化HTML的重要性
- [ ] 掌握所有HTML5语义化标签的用法
- [ ] 了解WCAG 2.1的四个核心原则
- [ ] 能够正确使用ARIA属性
- [ ] 创建了一个语义化的网页结构
- [ ] 使用屏幕阅读器测试了网页
- [ ] 理解键盘导航的重要性
- [ ] 为所有图片添加了合适的alt文本

## 🤔 自测问题

1. **为什么要使用语义化HTML？列举至少4个好处。**

2. **`<section>`和`<article>`的区别是什么？各举一个使用场景。**

3. **什么是ARIA？它的作用是什么？**

4. **如何让一个自定义的按钮对屏幕阅读器友好？**

5. **什么是"跳转到主内容"链接？为什么需要它？**

## 🎯 拓展练习

1. **创建一个新闻网站首页**
   - 使用所有学到的语义化标签
   - 确保完全可访问
   - 通过键盘可以访问所有功能

2. **改造旧代码**
   - 找一个使用大量div的网页
   - 用语义化标签重构
   - 对比前后的可访问性

3. **ARIA实践**
   - 创建一个可访问的下拉菜单
   - 实现一个模态对话框
   - 确保键盘导航正常工作

## 💡 今日总结

今天我们学习了HTML5语义化和Web可访问性的核心概念。记住：

- **语义化不是可选的**：它是专业Web开发的基础
- **可访问性惠及所有人**：不仅是残障用户
- **从一开始就考虑可访问性**：后期改造成本更高
- **测试是关键**：使用真实的辅助技术测试

明天我们将学习HTML5的表单和多媒体元素，继续深入HTML的世界！

**记住：** 构建一个所有人都能访问的Web，是每个开发者的责任！ ♿️✨