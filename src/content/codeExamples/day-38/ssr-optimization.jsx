// ssr-optimization.jsx - SSR优化技术示例

// 1. 增量静态再生(ISR)优化
// pages/blog/[slug].js
export default function BlogPost({ post, relatedPosts }) {
  return (
    <article>
      <h1>{post.title}</h1>
      <time>{new Date(post.publishedAt).toLocaleDateString()}</time>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
      
      <section>
        <h2>相关文章</h2>
        <ul>
          {relatedPosts.map(related => (
            <li key={related.id}>
              <Link href={`/blog/${related.slug}`}>
                {related.title}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}

export async function getStaticProps({ params }) {
  const post = await fetchPost(params.slug);
  const relatedPosts = await fetchRelatedPosts(post.id);
  
  return {
    props: {
      post,
      relatedPosts,
    },
    // ISR: 5分钟后重新验证
    revalidate: 300,
  };
}

export async function getStaticPaths() {
  // 只预渲染最受欢迎的文章
  const popularPosts = await fetchPopularPosts(10);
  
  const paths = popularPosts.map(post => ({
    params: { slug: post.slug },
  }));
  
  return {
    paths,
    // 其他页面按需生成
    fallback: 'blocking',
  };
}

// 2. 流式SSR优化
// pages/dashboard.js
import { Suspense } from 'react';

// 快速加载的头部组件
function DashboardHeader({ user }) {
  return (
    <header>
      <h1>欢迎回来，{user.name}!</h1>
      <nav>
        <Link href="/dashboard">概览</Link>
        <Link href="/dashboard/analytics">分析</Link>
        <Link href="/dashboard/settings">设置</Link>
      </nav>
    </header>
  );
}

// 慢速加载的数据组件
async function DashboardStats() {
  const stats = await fetchUserStats(); // 耗时操作
  
  return (
    <div className="stats-grid">
      <div>访问量: {stats.visits}</div>
      <div>订单数: {stats.orders}</div>
      <div>收入: ${stats.revenue}</div>
    </div>
  );
}

export default function Dashboard({ user }) {
  return (
    <div>
      <DashboardHeader user={user} />
      
      <Suspense fallback={<div>加载统计数据...</div>}>
        <DashboardStats />
      </Suspense>
      
      <Suspense fallback={<div>加载最近活动...</div>}>
        <RecentActivity userId={user.id} />
      </Suspense>
    </div>
  );
}

// 3. 缓存优化策略
// lib/cache.js
import { LRUCache } from 'lru-cache';

const cache = new LRUCache({
  max: 100,
  ttl: 1000 * 60 * 5, // 5分钟
});

export async function getCachedData(key, fetcher) {
  const cached = cache.get(key);
  if (cached) {
    return cached;
  }
  
  const fresh = await fetcher();
  cache.set(key, fresh);
  return fresh;
}

// 使用缓存的页面
export async function getServerSideProps({ params }) {
  const productId = params.id;
  
  // 使用缓存获取产品数据
  const product = await getCachedData(
    `product:${productId}`,
    () => fetchProduct(productId)
  );
  
  // 使用缓存获取评论
  const reviews = await getCachedData(
    `reviews:${productId}`,
    () => fetchReviews(productId)
  );
  
  return {
    props: {
      product,
      reviews,
    },
  };
}

// 4. 边缘中间件优化
// middleware.js
import { NextResponse } from 'next/server';

export function middleware(request) {
  // 地理位置检测
  const country = request.geo?.country || 'US';
  
  // A/B测试
  const bucket = request.cookies.get('ab-test')?.value || 
    (Math.random() > 0.5 ? 'a' : 'b');
  
  // 设置响应头
  const response = NextResponse.next();
  response.headers.set('x-country', country);
  response.headers.set('x-ab-test', bucket);
  
  // 根据地区重定向
  if (country === 'CN' && request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/zh', request.url));
  }
  
  return response;
}

export const config = {
  matcher: ['/', '/products/:path*'],
};

// 5. 并行数据获取
// pages/product/[id].js
export async function getServerSideProps({ params }) {
  const productId = params.id;
  
  // 并行获取所有数据
  const [product, reviews, recommendations, inventory] = await Promise.all([
    fetchProduct(productId),
    fetchReviews(productId),
    fetchRecommendations(productId),
    checkInventory(productId),
  ]);
  
  // 如果产品不存在，返回404
  if (!product) {
    return {
      notFound: true,
    };
  }
  
  return {
    props: {
      product,
      reviews,
      recommendations,
      inventory,
    },
  };
}

// 6. SEO优化组件
// components/SEO.js
import Head from 'next/head';
import { useRouter } from 'next/router';

export function SEO({ 
  title, 
  description, 
  image, 
  article = false,
  publishedTime,
  modifiedTime 
}) {
  const router = useRouter();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const canonical = `${siteUrl}${router.asPath}`;
  
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
      
      {/* Open Graph */}
      <meta property="og:url" content={canonical} />
      <meta property="og:type" content={article ? 'article' : 'website'} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* Article metadata */}
      {article && (
        <>
          <meta property="article:published_time" content={publishedTime} />
          <meta property="article:modified_time" content={modifiedTime} />
        </>
      )}
      
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': article ? 'Article' : 'WebPage',
            headline: title,
            description: description,
            image: image,
            url: canonical,
            ...(article && {
              datePublished: publishedTime,
              dateModified: modifiedTime,
            }),
          }),
        }}
      />
    </Head>
  );
}

// 7. 性能监控集成
// pages/_app.js
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export function reportWebVitals(metric) {
  // 发送到分析服务
  if (metric.label === 'web-vital') {
    window.gtag?.('event', metric.name, {
      event_category: 'Web Vitals',
      event_label: metric.id,
      value: Math.round(metric.value),
      non_interaction: true,
    });
  }
}

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  
  useEffect(() => {
    // 页面浏览追踪
    const handleRouteChange = (url) => {
      window.gtag?.('config', 'GA_MEASUREMENT_ID', {
        page_path: url,
      });
    };
    
    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);
  
  return <Component {...pageProps} />;
}

// 8. 响应式图片加载
// components/ResponsiveImage.js
import Image from 'next/image';
import { useState } from 'react';

export function ResponsiveImage({ src, alt, priority = false }) {
  const [isLoading, setIsLoading] = useState(true);
  
  return (
    <div className="image-container">
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 640px) 100vw,
               (max-width: 1024px) 50vw,
               (max-width: 1536px) 33vw,
               25vw"
        priority={priority}
        quality={90}
        onLoadingComplete={() => setIsLoading(false)}
        className={`
          duration-700 ease-in-out
          ${isLoading ? 'blur-2xl scale-110' : 'blur-0 scale-100'}
        `}
      />
    </div>
  );
}

// 9. API响应缓存
// pages/api/products/index.js
export default async function handler(req, res) {
  // 设置缓存头
  res.setHeader(
    'Cache-Control',
    'public, s-maxage=10, stale-while-revalidate=59'
  );
  
  try {
    const products = await fetchProducts();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
}

// 10. 预加载关键资源
// components/ResourceHints.js
import Head from 'next/head';

export function ResourceHints() {
  return (
    <Head>
      {/* 预连接到API域名 */}
      <link rel="preconnect" href="https://api.example.com" />
      <link rel="dns-prefetch" href="https://api.example.com" />
      
      {/* 预加载关键字体 */}
      <link
        rel="preload"
        href="/fonts/inter-var.woff2"
        as="font"
        type="font/woff2"
        crossOrigin="anonymous"
      />
      
      {/* 预加载关键CSS */}
      <link
        rel="preload"
        href="/_next/static/css/styles.css"
        as="style"
      />
      
      {/* 预获取下一页 */}
      <link
        rel="prefetch"
        href="/products"
        as="document"
      />
    </Head>
  );
}