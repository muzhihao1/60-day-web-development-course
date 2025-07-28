---
day: 10
title: "性能优化实战：让慢网站飞起来"
description: "通过实际优化一个性能较差的网站，掌握各种性能优化技术"
difficulty: "intermediate"
estimatedTime: 90
requirements:
  - "分析并记录优化前的性能指标"
  - "优化图片加载（格式转换、懒加载、响应式）"
  - "优化CSS和JavaScript（压缩、代码分割、异步加载）"
  - "实现资源预加载和缓存策略"
  - "优化字体加载和渲染"
  - "减少布局偏移(CLS)"
  - "提升交互响应速度(FID)"
  - "记录优化后的性能提升"
---

# Day 10 练习：性能优化实战

## 🎯 练习目标

你接到了一个紧急任务：公司的产品展示网站加载太慢，移动端用户大量流失。你的任务是通过各种性能优化技术，将网站的 Lighthouse 性能分数从当前的 **35分** 提升到 **90分以上**。

## 📋 初始项目分析

### 项目结构

```
slow-gallery/
├── index.html
├── styles.css           # 未压缩，200KB
├── script.js           # 未压缩，500KB
├── jquery.min.js       # 85KB
├── bootstrap.css       # 150KB
├── images/
│   ├── hero-bg.jpg     # 3MB
│   ├── product-1.jpg   # 2MB
│   ├── product-2.jpg   # 2.5MB
│   └── ... (20个产品图片，每个2-3MB)
└── fonts/
    ├── custom-font.ttf # 200KB
    └── icon-font.ttf   # 150KB
```

### 初始代码

**index.html:**
```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>极速产品展示</title>
    
    <!-- 外部CSS -->
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;700&display=block" rel="stylesheet">
    <link rel="stylesheet" href="bootstrap.css">
    <link rel="stylesheet" href="styles.css">
    
    <!-- JavaScript在头部 -->
    <script src="jquery.min.js"></script>
    <script src="script.js"></script>
</head>
<body>
    <!-- Hero区域 -->
    <div class="hero" style="background-image: url('images/hero-bg.jpg')">
        <h1 class="hero-title">欢迎来到极速产品展示</h1>
        <p class="hero-subtitle">发现最新最酷的产品</p>
    </div>
    
    <!-- 产品网格 -->
    <div class="products">
        <div class="product-card">
            <img src="images/product-1.jpg" alt="产品1">
            <h3>超级产品 1</h3>
            <p>这是一个很棒的产品描述...</p>
            <button onclick="showDetails(1)">查看详情</button>
        </div>
        <!-- 重复20个类似的产品卡片 -->
    </div>
    
    <!-- 底部加载更多第三方脚本 -->
    <script src="https://cdn.example.com/analytics.js"></script>
    <script src="https://cdn.example.com/chat-widget.js"></script>
    <script src="https://cdn.example.com/social-share.js"></script>
</body>
</html>
```

**styles.css (部分):**
```css
/* 大量未使用的CSS规则 */
@import url('animations.css');
@import url('old-styles.css');

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

/* 自定义字体 */
@font-face {
    font-family: 'CustomFont';
    src: url('fonts/custom-font.ttf');
}

body {
    font-family: 'CustomFont', sans-serif;
}

.hero {
    height: 100vh;
    background-size: cover;
    background-position: center;
}

/* 产品卡片动画 */
.product-card {
    animation: fadeIn 2s ease-in-out;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(50px); }
    to { opacity: 1; transform: translateY(0); }
}
```

**script.js (部分):**
```javascript
// 大量的jQuery代码
$(document).ready(function() {
    // 复杂的初始化逻辑
    initializeEverything();
    
    // 每个产品卡片都绑定事件
    $('.product-card').each(function() {
        $(this).on('click', function() {
            // 复杂的动画
            $(this).animate({
                transform: 'scale(1.1)'
            }, 500);
        });
    });
    
    // 滚动监听
    $(window).scroll(function() {
        // 每次滚动都执行复杂计算
        updateParallax();
        checkVisibility();
        updateProgressBar();
    });
});

function initializeEverything() {
    // 500行初始化代码...
}
```

### 初始性能问题

运行 Lighthouse 分析后，发现以下问题：

1. **Performance: 35/100**
   - FCP: 4.2s
   - LCP: 8.5s
   - CLS: 0.25
   - TBT: 2500ms

2. **主要问题：**
   - 巨大的图片文件（总计50MB+）
   - 阻塞渲染的CSS和JS
   - 没有使用缓存
   - 大量未使用的CSS
   - 主线程被长时间阻塞
   - 没有懒加载
   - 字体加载导致文本闪烁

## 🔧 优化任务

### 任务1：图片优化（30分）

1. **转换图片格式**
   - 将所有JPG图片转换为WebP格式
   - 为不支持WebP的浏览器提供降级方案
   - 创建多个尺寸版本（small: 400w, medium: 800w, large: 1200w）

2. **实现图片懒加载**
   - 使用Intersection Observer API
   - 添加加载占位符
   - 实现渐进式图片加载

3. **优化Hero背景图**
   - 创建低质量占位图（LQIP）
   - 实现渐进式加载效果

### 任务2：关键渲染路径优化（20分）

1. **优化CSS加载**
   - 提取并内联关键CSS
   - 异步加载非关键CSS
   - 移除未使用的CSS规则

2. **优化JavaScript加载**
   - 将script标签移到底部
   - 添加async/defer属性
   - 实现按需加载

3. **优化字体加载**
   - 使用font-display: swap
   - 预加载关键字体
   - 使用系统字体作为后备

### 任务3：代码优化（20分）

1. **JavaScript优化**
   - 移除jQuery依赖，使用原生JS
   - 实现防抖和节流
   - 分离关键和非关键功能

2. **CSS优化**
   - 使用CSS containment
   - 优化动画性能
   - 减少重排和重绘

3. **HTML优化**
   - 添加资源提示（preload、prefetch）
   - 优化DOM结构
   - 减少DOM节点数量

### 任务4：缓存和压缩（15分）

1. **实现Service Worker**
   - 缓存静态资源
   - 实现离线优先策略
   - 更新缓存版本

2. **配置资源压缩**
   - 启用Gzip/Brotli压缩
   - 压缩HTML、CSS、JS
   - 优化压缩级别

### 任务5：性能监控（15分）

1. **添加性能监控**
   - 实现RUM（真实用户监控）
   - 记录Core Web Vitals
   - 设置性能预算

2. **创建性能报告**
   - 对比优化前后的指标
   - 分析各项优化的效果
   - 提供进一步优化建议

## 📁 期望的优化结果

### 文件结构
```
optimized-gallery/
├── index.html          # 优化后的HTML
├── css/
│   ├── critical.css    # 内联的关键CSS（<2KB）
│   ├── main.css       # 主CSS（压缩后20KB）
│   └── lazy.css       # 延迟加载的CSS
├── js/
│   ├── main.js        # 主要功能（压缩后10KB）
│   ├── lazy-load.js   # 懒加载模块
│   └── analytics.js   # 分析模块（异步）
├── images/
│   ├── hero-bg-lqip.jpg     # 低质量占位图（5KB）
│   ├── hero-bg.webp          # 优化后的hero图（200KB）
│   ├── products/
│   │   ├── thumbs/          # 缩略图（每个10KB）
│   │   ├── small/           # 小图（每个50KB）
│   │   ├── medium/          # 中图（每个100KB）
│   │   └── large/           # 大图（每个200KB）
├── fonts/
│   └── subset-font.woff2    # 子集化字体（30KB）
├── service-worker.js         # Service Worker
└── manifest.json            # Web App Manifest
```

### 优化后的核心代码示例

**index.html:**
```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>极速产品展示</title>
    
    <!-- 内联关键CSS -->
    <style>
        /* 关键CSS内容 */
    </style>
    
    <!-- 预加载关键资源 -->
    <link rel="preload" href="fonts/subset-font.woff2" as="font" crossorigin>
    <link rel="preload" href="js/main.js" as="script">
    
    <!-- 异步加载非关键CSS -->
    <link rel="preload" href="css/main.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
</head>
<body>
    <!-- 优化后的内容 -->
    
    <!-- 延迟加载的脚本 -->
    <script src="js/main.js" defer></script>
</body>
</html>
```

## 🎯 评分标准

### 基础要求（60分）
- [ ] Lighthouse性能分数达到90+
- [ ] FCP < 1.8秒
- [ ] LCP < 2.5秒
- [ ] CLS < 0.1
- [ ] FID < 100ms

### 优化实现（30分）
- [ ] 正确实现图片懒加载
- [ ] 实现有效的缓存策略
- [ ] 代码分割和按需加载
- [ ] 资源压缩和优化

### 加分项（10分）
- [ ] 实现PWA功能
- [ ] 添加骨架屏
- [ ] 实现预测性预加载
- [ ] 优化无障碍性能

## 🛠️ 开发建议

### 工具推荐
- **图片优化**: Squoosh, ImageOptim
- **CSS优化**: PurgeCSS, CSSNano
- **JS优化**: Terser, Rollup
- **性能分析**: Lighthouse, WebPageTest

### 测试方法
```bash
# 1. 启动本地服务器
python -m http.server 8000

# 2. 运行Lighthouse
lighthouse http://localhost:8000 --view

# 3. 使用Chrome DevTools
# - Performance面板记录加载过程
# - Network面板分析资源加载
# - Coverage面板找出未使用的代码
```

### 优化顺序建议
1. 先优化最大的性能瓶颈（通常是图片）
2. 优化关键渲染路径
3. 实现资源的异步加载
4. 添加缓存策略
5. 微调和性能监控

## 📊 提交要求

1. **优化后的完整代码**
2. **性能优化报告**，包含：
   - 优化前后的Lighthouse截图
   - 各项指标的对比数据
   - 采用的优化技术说明
   - 遇到的挑战和解决方案

3. **README文档**，说明：
   - 如何运行项目
   - 优化技术清单
   - 浏览器兼容性
   - 未来优化建议

## 💡 提示

1. **渐进式优化**：不要试图一次性优化所有内容，逐步改进并测试每个优化的效果

2. **测量为先**：每次优化后都要测量效果，确保优化确实带来了改善

3. **用户体验**：性能优化不应该牺牲用户体验，确保优化后的网站仍然美观且功能完整

4. **真机测试**：在真实的移动设备上测试，不要只依赖Chrome DevTools的模拟

5. **版本控制**：使用Git记录每个优化步骤，方便回滚和对比

## 🚀 挑战任务

如果你完成了基础优化，可以尝试这些高级挑战：

1. **实现自适应加载**：根据用户的网络状况和设备性能动态调整资源质量

2. **实现资源优先级提示**：使用Priority Hints API优化资源加载顺序

3. **实现PRPL模式**：Push、Render、Pre-cache、Lazy-load

4. **添加性能预算监控**：在CI/CD中集成性能预算检查

记住：性能优化是一门艺术，需要在性能、功能和开发效率之间找到平衡。祝你优化顺利！