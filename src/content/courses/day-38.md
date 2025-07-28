---
day: 38
phase: "react-development"
title: "服务端渲染SSR"
description: "学习Next.js框架和服务端渲染技术"
objectives:
  - "理解SSR与CSR的区别和应用场景"
  - "掌握Next.js核心概念和API"
  - "学习数据获取策略"
  - "实现SEO优化"
  - "掌握性能优化技巧"
estimatedTime: 240
difficulty: "advanced"
prerequisites: [25, 29, 36]
resources:
  - title: "Next.js官方文档"
    url: "https://nextjs.org/docs"
    type: "article"
    description: "最权威的Next.js学习资源"
  - title: "React Server Components"
    url: "https://react.dev/blog/2023/03/22/react-labs-what-we-have-been-working-on-march-2023"
    type: "article"
    description: "React服务器组件介绍"
  - title: "Web Vitals"
    url: "https://web.dev/vitals/"
    type: "article"
    description: "核心Web性能指标"
---

# Day 38: 服务端渲染SSR

## 学习目标

今天我们将深入学习服务端渲染技术，重点掌握Next.js框架的使用，构建高性能、SEO友好的React应用。

## 1. SSR vs CSR对比

### 客户端渲染（CSR）

传统React应用的渲染流程：

1. 浏览器下载HTML（几乎是空的）
2. 下载JavaScript bundle
3. 执行JavaScript
4. React渲染页面
5. 页面可交互

```jsx
// 传统React应用
// public/index.html
<!DOCTYPE html>
<html>
  <head>
    <title>React App</title>
  </head>
  <body>
    <div id="root"></div>
    <script src="bundle.js"></script>
  </body>
</html>
```

### 服务端渲染（SSR）

SSR的渲染流程：

1. 服务器接收请求
2. 服务器渲染React组件为HTML
3. 发送完整的HTML给浏览器
4. 浏览器显示页面（已有内容）
5. 下载JavaScript进行hydration
6. 页面可交互

### 对比分析

| 特性 | CSR | SSR |
|-----|-----|-----|
| 首屏加载 | 慢 | 快 |
| SEO | 差 | 好 |
| 服务器负载 | 低 | 高 |
| 开发复杂度 | 简单 | 复杂 |
| 用户体验 | SPA体验好 | 首屏快 |

## 2. Next.js基础

### 安装和项目结构

```bash
# 创建Next.js项目
npx create-next-app@latest my-app
cd my-app

# 项目结构
my-app/
├── pages/           # 页面路由
├── public/          # 静态资源
├── styles/          # 样式文件
├── components/      # React组件
├── lib/            # 工具函数
├── api/            # API路由
└── next.config.js  # 配置文件
```

### 页面和路由

Next.js使用基于文件系统的路由：

```jsx
// pages/index.js - 对应路由 /
export default function Home() {
  return <h1>Welcome to Next.js!</h1>;
}

// pages/about.js - 对应路由 /about
export default function About() {
  return <h1>About Us</h1>;
}

// pages/blog/[slug].js - 动态路由 /blog/:slug
import { useRouter } from 'next/router';

export default function BlogPost() {
  const router = useRouter();
  const { slug } = router.query;
  
  return <h1>Blog Post: {slug}</h1>;
}

// pages/products/[...params].js - 捕获所有路由
export default function Product() {
  const router = useRouter();
  const { params } = router.query;
  // /products/category/subcategory/item
  // params = ['category', 'subcategory', 'item']
  
  return <h1>Product Path: {params?.join('/')}</h1>;
}
```

### 链接和导航

```jsx
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Navigation() {
  const router = useRouter();
  
  const handleClick = () => {
    router.push('/dashboard');
  };
  
  return (
    <nav>
      {/* 客户端导航 */}
      <Link href="/">Home</Link>
      <Link href="/about">About</Link>
      
      {/* 动态路由 */}
      <Link href="/blog/my-first-post">
        First Post
      </Link>
      
      {/* 带查询参数 */}
      <Link 
        href={{
          pathname: '/search',
          query: { keyword: 'react' }
        }}
      >
        Search
      </Link>
      
      {/* 编程式导航 */}
      <button onClick={handleClick}>
        Go to Dashboard
      </button>
    </nav>
  );
}
```

## 3. 数据获取方法

### getServerSideProps（服务端渲染）

每次请求时在服务器端运行：

```jsx
// pages/posts.js
export default function Posts({ posts }) {
  return (
    <div>
      <h1>Posts</h1>
      <ul>
        {posts.map(post => (
          <li key={post.id}>{post.title}</li>
        ))}
      </ul>
    </div>
  );
}

export async function getServerSideProps(context) {
  // context包含请求信息
  const { req, res, query, params } = context;
  
  // 获取数据
  const response = await fetch('https://api.example.com/posts');
  const posts = await response.json();
  
  // 返回props
  return {
    props: {
      posts,
    },
  };
  
  // 或者重定向
  // return {
  //   redirect: {
  //     destination: '/login',
  //     permanent: false,
  //   },
  // };
  
  // 或者404
  // return {
  //   notFound: true,
  // };
}
```

### getStaticProps（静态生成）

构建时生成静态页面：

```jsx
// pages/products.js
export default function Products({ products }) {
  return (
    <div>
      <h1>Products</h1>
      {products.map(product => (
        <div key={product.id}>
          <h2>{product.name}</h2>
          <p>${product.price}</p>
        </div>
      ))}
    </div>
  );
}

export async function getStaticProps() {
  const res = await fetch('https://api.example.com/products');
  const products = await res.json();
  
  return {
    props: {
      products,
    },
    // 增量静态再生（ISR）
    revalidate: 60, // 60秒后重新生成页面
  };
}
```

### getStaticPaths（静态路径）

为动态路由生成静态页面：

```jsx
// pages/posts/[id].js
export default function Post({ post }) {
  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
    </article>
  );
}

export async function getStaticPaths() {
  const res = await fetch('https://api.example.com/posts');
  const posts = await res.json();
  
  const paths = posts.map(post => ({
    params: { id: post.id.toString() },
  }));
  
  return {
    paths,
    fallback: false, // false: 404, true: 加载中, 'blocking': SSR
  };
}

export async function getStaticProps({ params }) {
  const res = await fetch(`https://api.example.com/posts/${params.id}`);
  const post = await res.json();
  
  return {
    props: { post },
    revalidate: 3600, // 1小时
  };
}
```

## 4. API路由

Next.js允许在同一项目中创建API端点：

```jsx
// pages/api/users.js
export default function handler(req, res) {
  if (req.method === 'GET') {
    res.status(200).json({ users: [] });
  } else if (req.method === 'POST') {
    const { name, email } = req.body;
    // 创建用户
    res.status(201).json({ user: { name, email } });
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

// pages/api/users/[id].js
export default function handler(req, res) {
  const { id } = req.query;
  
  switch (req.method) {
    case 'GET':
      // 获取用户
      res.status(200).json({ id, name: 'John Doe' });
      break;
    case 'PUT':
      // 更新用户
      res.status(200).json({ id, ...req.body });
      break;
    case 'DELETE':
      // 删除用户
      res.status(204).end();
      break;
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
```

## 5. SEO优化

### 使用Head组件

```jsx
import Head from 'next/head';

export default function SEOPage() {
  return (
    <>
      <Head>
        <title>我的网站 - 首页</title>
        <meta name="description" content="这是一个使用Next.js构建的网站" />
        <meta name="keywords" content="Next.js, React, SSR" />
        <meta name="author" content="Your Name" />
        
        {/* Open Graph */}
        <meta property="og:title" content="我的网站" />
        <meta property="og:description" content="网站描述" />
        <meta property="og:image" content="https://example.com/og-image.jpg" />
        <meta property="og:url" content="https://example.com" />
        <meta property="og:type" content="website" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="我的网站" />
        <meta name="twitter:description" content="网站描述" />
        <meta name="twitter:image" content="https://example.com/twitter-image.jpg" />
        
        {/* 其他 */}
        <link rel="canonical" href="https://example.com" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <h1>SEO优化的页面</h1>
    </>
  );
}
```

### 动态SEO

```jsx
// pages/products/[id].js
import Head from 'next/head';

export default function Product({ product }) {
  return (
    <>
      <Head>
        <title>{product.name} - 我的商店</title>
        <meta name="description" content={product.description} />
        <meta property="og:title" content={product.name} />
        <meta property="og:description" content={product.description} />
        <meta property="og:image" content={product.image} />
        <meta property="og:price:amount" content={product.price} />
        <meta property="og:price:currency" content="USD" />
      </Head>
      
      <div>
        <h1>{product.name}</h1>
        <img src={product.image} alt={product.name} />
        <p>{product.description}</p>
        <p>${product.price}</p>
      </div>
    </>
  );
}
```

## 6. 性能优化

### 图片优化

```jsx
import Image from 'next/image';

export default function OptimizedImages() {
  return (
    <div>
      {/* 自动优化的图片 */}
      <Image
        src="/hero.jpg"
        alt="Hero image"
        width={1200}
        height={600}
        priority // 优先加载
      />
      
      {/* 响应式图片 */}
      <Image
        src="/product.jpg"
        alt="Product"
        width={500}
        height={500}
        sizes="(max-width: 768px) 100vw,
               (max-width: 1200px) 50vw,
               33vw"
      />
      
      {/* 占位符 */}
      <Image
        src="/feature.jpg"
        alt="Feature"
        width={400}
        height={300}
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,..."
      />
    </div>
  );
}
```

### 字体优化

```jsx
// pages/_document.js
import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html>
      <Head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

// 或使用 next/font
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default function App({ Component, pageProps }) {
  return (
    <main className={inter.className}>
      <Component {...pageProps} />
    </main>
  );
}
```

### 代码分割和预加载

```jsx
import dynamic from 'next/dynamic';

// 动态导入
const DynamicComponent = dynamic(() => import('../components/Heavy'), {
  loading: () => <p>Loading...</p>,
  ssr: false, // 禁用SSR
});

// 预加载组件
const PreloadableComponent = dynamic(
  () => import('../components/Feature'),
  { loading: () => <p>Loading...</p> }
);

export default function OptimizedPage() {
  // 手动预加载
  const handleMouseEnter = () => {
    PreloadableComponent.preload();
  };
  
  return (
    <div>
      <button onMouseEnter={handleMouseEnter}>
        Hover to preload
      </button>
      <DynamicComponent />
    </div>
  );
}
```

## 7. 高级特性

### 中间件

```jsx
// middleware.js
import { NextResponse } from 'next/server';

export function middleware(request) {
  // 获取请求信息
  const { pathname } = request.nextUrl;
  
  // 认证检查
  const token = request.cookies.get('token');
  
  if (pathname.startsWith('/admin') && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // 添加自定义头
  const response = NextResponse.next();
  response.headers.set('x-custom-header', 'value');
  
  return response;
}

export const config = {
  matcher: ['/admin/:path*', '/api/:path*'],
};
```

### 国际化（i18n）

```jsx
// next.config.js
module.exports = {
  i18n: {
    locales: ['en', 'zh', 'ja'],
    defaultLocale: 'en',
    localeDetection: true,
  },
};

// pages/index.js
import { useRouter } from 'next/router';

export default function Home({ message }) {
  const router = useRouter();
  const { locale } = router;
  
  return (
    <div>
      <h1>{message}</h1>
      <select
        value={locale}
        onChange={(e) => {
          router.push(router.pathname, router.asPath, {
            locale: e.target.value,
          });
        }}
      >
        <option value="en">English</option>
        <option value="zh">中文</option>
        <option value="ja">日本語</option>
      </select>
    </div>
  );
}

export async function getStaticProps({ locale }) {
  const messages = {
    en: 'Hello World',
    zh: '你好世界',
    ja: 'こんにちは世界',
  };
  
  return {
    props: {
      message: messages[locale],
    },
  };
}
```

## 今日练习

### 练习1：构建博客系统

使用Next.js创建一个完整的博客系统，包含：

1. 首页（文章列表）
2. 文章详情页
3. 分类页面
4. 搜索功能
5. SEO优化

### 练习2：电商产品页

创建一个支持SSR的电商产品展示页面：

1. 产品列表（带分页）
2. 产品详情（动态路由）
3. 购物车功能
4. API路由处理

### 练习3：性能优化实践

优化现有Next.js应用：

1. 实现图片懒加载
2. 添加PWA支持
3. 优化Core Web Vitals
4. 实现缓存策略

## 扩展资源

- [Next.js Examples](https://github.com/vercel/next.js/tree/canary/examples)
- [Vercel Edge Functions](https://vercel.com/docs/concepts/functions/edge-functions)
- [React 18 Streaming SSR](https://nextjs.org/docs/advanced-features/react-18/streaming)

## 明日预告

明天我们将初步了解React Native，学习如何使用React技术栈开发移动应用。