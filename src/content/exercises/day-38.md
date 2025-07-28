---
day: 38
title: "服务端渲染SSR实践"
description: "构建高性能的Next.js应用"
difficulty: "advanced"
estimatedTime: 240
requirements:
  - "掌握React基础"
  - "了解路由概念"
  - "熟悉Node.js基础"
exercises:
  - id: "blog-platform"
    title: "博客平台开发"
    difficulty: "advanced"
    description: "使用Next.js创建完整博客系统"
    hints:
      - "实现文章列表和详情页"
      - "添加Markdown支持"
      - "优化SEO和性能"
  - id: "ecommerce-product"
    title: "电商产品页"
    difficulty: "advanced"
    description: "构建高性能产品展示页面"
    hints:
      - "实现SSR和ISR混合策略"
      - "优化图片加载"
      - "添加购物车功能"
  - id: "performance-optimization"
    title: "性能优化实战"
    difficulty: "intermediate"
    description: "优化现有Next.js应用性能"
    hints:
      - "实现缓存策略"
      - "优化Core Web Vitals"
      - "添加性能监控"
---

# Day 38 练习：服务端渲染SSR

## 练习1：博客平台开发

使用Next.js创建一个功能完整的博客平台。

### 要求：

1. **页面结构**
   - 首页（文章列表）
   - 文章详情页
   - 分类页面
   - 标签页面
   - 关于页面
   - 搜索功能

2. **功能实现**
   - Markdown文章支持
   - 代码高亮
   - 目录生成
   - 评论系统
   - RSS订阅
   - 站点地图

3. **性能优化**
   - 静态生成热门文章
   - ISR更新策略
   - 图片懒加载
   - 关键CSS内联

4. **SEO优化**
   - Meta标签管理
   - Open Graph支持
   - JSON-LD结构化数据
   - 自动生成sitemap.xml

### 项目结构：

```
blog-platform/
├── pages/
│   ├── index.js          # 首页
│   ├── posts/
│   │   ├── [slug].js     # 文章详情
│   │   └── index.js      # 文章列表
│   ├── categories/
│   │   └── [category].js # 分类页面
│   ├── tags/
│   │   └── [tag].js      # 标签页面
│   ├── search.js         # 搜索页面
│   ├── about.js          # 关于页面
│   └── api/
│       ├── search.js     # 搜索API
│       └── comments/     # 评论API
├── components/
│   ├── Layout.js         # 布局组件
│   ├── SEO.js           # SEO组件
│   ├── PostCard.js      # 文章卡片
│   ├── TableOfContents.js # 目录组件
│   └── Comments.js       # 评论组件
├── lib/
│   ├── markdown.js       # Markdown处理
│   ├── posts.js         # 文章数据获取
│   └── cache.js         # 缓存工具
└── content/
    └── posts/           # Markdown文章
```

### 实现提示：

```jsx
// lib/posts.js - 文章数据处理
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import prism from 'remark-prism';

const postsDirectory = path.join(process.cwd(), 'content/posts');

export async function getPostBySlug(slug) {
  const fullPath = path.join(postsDirectory, `${slug}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  
  const { data, content } = matter(fileContents);
  
  const processedContent = await remark()
    .use(html)
    .use(prism)
    .process(content);
    
  return {
    slug,
    content: processedContent.toString(),
    ...data,
  };
}

// pages/posts/[slug].js - 文章详情页
export default function PostPage({ post }) {
  return (
    <>
      <SEO
        title={post.title}
        description={post.excerpt}
        article={true}
        publishedTime={post.date}
      />
      <article>
        <h1>{post.title}</h1>
        <time>{formatDate(post.date)}</time>
        <div dangerouslySetInnerHTML={{ __html: post.content }} />
        <Comments postId={post.slug} />
      </article>
    </>
  );
}
```

## 练习2：电商产品页

创建一个高性能的电商产品展示页面。

### 要求：

1. **产品展示**
   - 产品列表（带筛选和排序）
   - 产品详情页
   - 图片画廊
   - 产品评价
   - 相关产品推荐

2. **购物功能**
   - 添加到购物车
   - 收藏产品
   - 库存检查
   - 价格计算（含优惠）

3. **性能策略**
   - 热门产品静态生成
   - 其他产品ISR
   - 购物车数据客户端管理
   - API路由缓存

4. **用户体验**
   - 加载骨架屏
   - 无限滚动
   - 实时搜索
   - 响应式设计

### 关键实现：

```jsx
// 混合渲染策略
export async function getStaticProps({ params }) {
  const product = await fetchProduct(params.id);
  
  // 404处理
  if (!product) {
    return { notFound: true };
  }
  
  // 并行获取相关数据
  const [reviews, recommendations] = await Promise.all([
    fetchReviews(params.id),
    fetchRecommendations(params.id),
  ]);
  
  return {
    props: {
      product,
      reviews,
      recommendations,
    },
    // 热门产品1小时更新，其他24小时
    revalidate: product.isPopular ? 3600 : 86400,
  };
}

export async function getStaticPaths() {
  // 只预渲染热门产品
  const products = await fetchPopularProducts(20);
  
  return {
    paths: products.map(p => ({ params: { id: p.id } })),
    fallback: 'blocking', // 其他产品按需生成
  };
}
```

## 练习3：性能优化实战

优化一个现有的Next.js应用，达到优秀的Core Web Vitals指标。

### 优化目标：

1. **Core Web Vitals**
   - LCP < 2.5s
   - FID < 100ms
   - CLS < 0.1

2. **优化策略**
   - 实现关键CSS内联
   - 优化字体加载
   - 图片优化和懒加载
   - JavaScript代码分割
   - 第三方脚本优化

3. **缓存策略**
   - 实现多级缓存
   - CDN配置
   - Service Worker
   - 浏览器缓存优化

4. **监控方案**
   - 集成Web Vitals监控
   - 错误追踪
   - 用户行为分析
   - 性能报告生成

### 优化清单：

```jsx
// 1. 优化图片加载
const OptimizedImage = ({ src, alt, priority }) => (
  <Image
    src={src}
    alt={alt}
    placeholder="blur"
    blurDataURL={generateBlurDataURL(src)}
    priority={priority}
    quality={85}
    sizes="(max-width: 768px) 100vw, 50vw"
  />
);

// 2. 实现缓存策略
export async function getServerSideProps(context) {
  context.res.setHeader(
    'Cache-Control',
    'public, s-maxage=10, stale-while-revalidate=59'
  );
  
  // 使用缓存获取数据
  const data = await getCachedData('home-page', fetchHomeData);
  
  return { props: { data } };
}

// 3. 优化第三方脚本
import Script from 'next/script';

export function Analytics() {
  return (
    <Script
      src="https://www.googletagmanager.com/gtag/js"
      strategy="afterInteractive"
    />
  );
}
```

## 挑战任务

### 1. 实时协作编辑器

使用Next.js + WebSocket创建实时协作编辑器：

- 多用户同时编辑
- 实时光标位置
- 操作历史记录
- 离线支持

### 2. 社交媒体平台

构建类似Twitter的社交平台：

- 实时信息流
- 无限滚动
- 实时通知
- 媒体上传优化

### 3. 数据可视化平台

创建数据分析仪表板：

- 服务端数据聚合
- 客户端图表渲染
- 实时数据更新
- 导出功能

## 提交要求

1. 完整的项目代码
2. 部署到Vercel或Netlify
3. 性能测试报告（Lighthouse）
4. SEO检查报告
5. 项目文档和使用说明

## 评分标准

- 功能完整性（25%）
- 性能优化效果（25%）
- SEO实施质量（20%）
- 代码组织和质量（20%）
- 创新和用户体验（10%）

## 学习资源

- [Next.js最佳实践](https://nextjs.org/docs/basic-features/pages)
- [Web Vitals优化指南](https://web.dev/vitals/)
- [React服务端渲染原理](https://github.com/reactwg/react-18/discussions/37)

## 截止时间

请在下一节课开始前完成并提交所有练习。