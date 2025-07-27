# Day 02 练习：构建语义化的博客首页

## 🎯 练习目标

通过本练习，你将：
- 运用HTML5语义化标签构建页面结构
- 实践Web可访问性原则
- 正确使用ARIA属性增强可访问性
- 创建一个可以通过屏幕阅读器和键盘导航的页面

## 📝 练习要求

### 项目：个人技术博客首页

创建一个完整的博客首页，包含以下部分：

1. **页面结构要求**
   - 页眉（包含网站标题和导航菜单）
   - 主要内容区（最新文章列表）
   - 侧边栏（分类、标签云、关于作者）
   - 页脚（版权信息、社交链接）

2. **语义化标签使用**
   - 必须使用：`<header>`, `<nav>`, `<main>`, `<article>`, `<section>`, `<aside>`, `<footer>`
   - 适当使用：`<time>`, `<figure>`, `<figcaption>`, `<address>`

3. **可访问性要求**
   - 所有图片必须有描述性的alt文本
   - 表单元素必须有相关联的label
   - 使用适当的ARIA属性
   - 提供跳转到主内容的链接
   - 确保键盘可以访问所有交互元素

### 页面内容规划

```
个人技术博客
├── 页眉
│   ├── 网站Logo/标题
│   └── 主导航（首页、文章、项目、关于、联系）
├── 主内容区
│   ├── 欢迎语/简介
│   └── 最新文章列表（至少3篇）
│       ├── 文章标题
│       ├── 发布日期
│       ├── 作者
│       ├── 摘要
│       └── 阅读更多链接
├── 侧边栏
│   ├── 关于作者（含头像）
│   ├── 文章分类
│   └── 热门标签
└── 页脚
    ├── 版权信息
    ├── 社交媒体链接
    └── 联系信息
```

## 📋 具体任务

### 任务1：创建基础HTML结构

创建 `index.html` 文件，包含完整的文档结构：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="个人技术博客，分享Web开发经验和技术心得">
    <title>张三的技术博客 - 专注前端开发</title>
    <style>
        /* 基础样式，确保可访问性 */
        .skip-link {
            position: absolute;
            top: -40px;
            left: 0;
            background: #000;
            color: #fff;
            padding: 8px;
            text-decoration: none;
        }
        .skip-link:focus {
            top: 0;
        }
        /* 视觉隐藏但屏幕阅读器可见 */
        .visually-hidden {
            position: absolute;
            width: 1px;
            height: 1px;
            margin: -1px;
            padding: 0;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
            border: 0;
        }
    </style>
</head>
<body>
    <!-- 你的代码 -->
</body>
</html>
```

### 任务2：实现页眉和导航

要求：
- 使用`<header>`包含整个页眉
- 导航使用`<nav>`标签
- 当前页面链接使用`aria-current="page"`
- 导航添加`aria-label`描述

### 任务3：创建主内容区

要求：
- 使用`<main>`标签，并设置`id`用于跳转
- 每篇文章使用`<article>`标签
- 文章内的时间使用`<time>`标签并包含`datetime`属性
- 作者信息使用适当的微数据

### 任务4：设计侧边栏

要求：
- 使用`<aside>`标签
- 每个小节使用`<section>`
- 为每个section提供标题
- 作者头像提供详细的alt描述

### 任务5：完成页脚

要求：
- 使用`<footer>`标签
- 联系信息使用`<address>`标签
- 社交媒体链接使用列表结构
- 外部链接添加`rel="external"`

### 任务6：增强可访问性

完成以下可访问性增强：
1. 添加跳转到主内容的链接
2. 为所有交互元素提供焦点样式
3. 确保颜色对比度符合WCAG标准
4. 为装饰性图标添加`aria-hidden="true"`
5. 测试Tab键导航顺序是否合理

## 🎨 预期效果

完成后的页面应该：

1. **结构清晰**
   - 使用语义化标签构建
   - 层次分明，易于理解

2. **完全可访问**
   - 屏幕阅读器可以正确朗读
   - 键盘可以访问所有功能
   - 提供足够的上下文信息

3. **代码规范**
   - HTML验证无错误
   - 正确使用ARIA属性
   - 注释清晰

## 💡 提示

### HTML结构提示

```html
<!-- 跳转链接示例 -->
<a href="#main-content" class="skip-link">跳转到主要内容</a>

<!-- 导航示例 -->
<nav aria-label="主导航">
    <ul>
        <li><a href="/" aria-current="page">首页</a></li>
        <!-- 更多导航项 -->
    </ul>
</nav>

<!-- 文章示例 -->
<article>
    <header>
        <h2><a href="/article-url">文章标题</a></h2>
        <p>
            <time datetime="2024-01-27">2024年1月27日</time>
            作者：<a href="/author" rel="author">张三</a>
        </p>
    </header>
    <p>文章摘要...</p>
    <a href="/article-url" aria-label="阅读全文：文章标题">
        继续阅读 <span aria-hidden="true">→</span>
    </a>
</article>
```

### 可访问性检查清单

- [ ] 所有`<img>`都有alt属性
- [ ] 表单控件都有对应的`<label>`
- [ ] 颜色不是传达信息的唯一方式
- [ ] 链接文本有意义（避免"点击这里"）
- [ ] 标题层级正确（h1 > h2 > h3）
- [ ] 使用列表标签组织列表内容
- [ ] 提供足够的触摸目标大小（至少44x44像素）

## 📊 评分标准

| 评分项 | 分值 | 要求 |
|--------|------|------|
| 语义化标签使用 | 30分 | 正确使用所有要求的HTML5标签 |
| 页面结构完整性 | 20分 | 包含所有要求的页面部分 |
| ARIA属性应用 | 20分 | 恰当使用ARIA属性增强可访问性 |
| 键盘导航 | 15分 | 所有元素可通过键盘访问 |
| 代码质量 | 15分 | HTML验证通过，注释完整 |

**优秀标准（90分以上）：**
- 完美使用语义化标签
- ARIA属性使用恰当且不过度
- 通过屏幕阅读器测试
- 键盘导航流畅自然
- 代码结构清晰，易于维护

## 🚨 常见错误

1. **过度使用ARIA**
   ```html
   <!-- 错误：语义化标签不需要role -->
   <nav role="navigation">
   
   <!-- 正确：nav标签已经有导航语义 -->
   <nav aria-label="主导航">
   ```

2. **标题层级跳跃**
   ```html
   <!-- 错误：从h1直接到h3 -->
   <h1>网站标题</h1>
   <h3>小节标题</h3>
   
   <!-- 正确：按顺序使用 -->
   <h1>网站标题</h1>
   <h2>章节标题</h2>
   <h3>小节标题</h3>
   ```

3. **空的alt属性误用**
   ```html
   <!-- 错误：信息性图片alt为空 -->
   <img src="author.jpg" alt="">
   
   <!-- 正确：提供描述 -->
   <img src="author.jpg" alt="作者张三的照片">
   
   <!-- 正确：装饰性图片alt为空 -->
   <img src="decoration.png" alt="" role="presentation">
   ```

## 🎯 进阶挑战

如果你完成了基础任务，可以尝试：

1. **添加深色模式切换**
   - 使用语义化的按钮
   - 保存用户偏好
   - 确保两种模式下都有足够的对比度

2. **实现搜索功能**
   - 创建可访问的搜索表单
   - 提供清晰的搜索结果反馈
   - 使用`role="search"`

3. **添加面包屑导航**
   - 使用正确的标记结构
   - 添加结构化数据
   - 使用`aria-label="面包屑"`

## 🔍 测试你的作品

### 使用浏览器工具
1. Chrome DevTools的Lighthouse
2. Firefox的Accessibility Inspector
3. Wave浏览器插件

### 手动测试
1. 拔掉鼠标，只用键盘导航
2. 使用屏幕阅读器测试
3. 关闭CSS查看页面结构

### 验证工具
- [W3C HTML验证器](https://validator.w3.org/)
- [WAVE在线检查](https://wave.webaim.org/)

完成练习后，用这些工具测试你的页面，确保达到专业水准！

祝你编码愉快！记住：**好的可访问性让所有人受益** 🌟