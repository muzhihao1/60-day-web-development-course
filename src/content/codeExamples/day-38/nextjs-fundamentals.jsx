// nextjs-fundamentals.jsx - Next.js基础示例

// 1. 基本页面路由
// pages/index.js
export function HomePage() {
  return (
    <div>
      <h1>欢迎来到Next.js!</h1>
      <nav>
        <Link href="/about">关于我们</Link>
        <Link href="/products">产品</Link>
        <Link href="/blog">博客</Link>
      </nav>
    </div>
  );
}

// pages/about.js
export function AboutPage() {
  return (
    <div>
      <h1>关于我们</h1>
      <p>我们是一家专注于React开发的公司</p>
      <Link href="/">返回首页</Link>
    </div>
  );
}

// 2. 动态路由示例
// pages/products/[id].js
import { useRouter } from 'next/router';

export function ProductDetailPage({ product }) {
  const router = useRouter();
  
  // 显示加载状态
  if (router.isFallback) {
    return <div>Loading...</div>;
  }
  
  return (
    <div>
      <h1>{product.name}</h1>
      <img src={product.image} alt={product.name} />
      <p>{product.description}</p>
      <p>价格: ${product.price}</p>
      <button onClick={() => router.push('/products')}>
        返回产品列表
      </button>
    </div>
  );
}

// 3. 数据获取方法示例
// pages/posts.js - 服务端渲染
export default function PostsPage({ posts }) {
  return (
    <div>
      <h1>博客文章</h1>
      <ul>
        {posts.map(post => (
          <li key={post.id}>
            <Link href={`/posts/${post.slug}`}>
              <h2>{post.title}</h2>
              <p>{post.excerpt}</p>
              <time>{new Date(post.date).toLocaleDateString()}</time>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

// 每次请求时获取数据
export async function getServerSideProps() {
  const res = await fetch('https://api.example.com/posts');
  const posts = await res.json();
  
  return {
    props: {
      posts,
    },
  };
}

// 4. 静态生成示例
// pages/products/index.js
export default function ProductsPage({ products }) {
  return (
    <div>
      <h1>产品目录</h1>
      <div className="grid">
        {products.map(product => (
          <Link key={product.id} href={`/products/${product.id}`}>
            <div className="product-card">
              <img src={product.thumbnail} alt={product.name} />
              <h3>{product.name}</h3>
              <p>${product.price}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

// 构建时生成静态页面
export async function getStaticProps() {
  const res = await fetch('https://api.example.com/products');
  const products = await res.json();
  
  return {
    props: {
      products,
    },
    // 增量静态再生 - 60秒后重新验证
    revalidate: 60,
  };
}

// 5. API路由示例
// pages/api/products/[id].js
export default async function handler(req, res) {
  const { id } = req.query;
  
  switch (req.method) {
    case 'GET':
      try {
        const product = await getProductById(id);
        res.status(200).json(product);
      } catch (error) {
        res.status(404).json({ error: 'Product not found' });
      }
      break;
      
    case 'PUT':
      try {
        const updatedProduct = await updateProduct(id, req.body);
        res.status(200).json(updatedProduct);
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
      break;
      
    case 'DELETE':
      try {
        await deleteProduct(id);
        res.status(204).end();
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
      break;
      
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

// 6. 自定义App组件
// pages/_app.js
import { ThemeProvider } from 'styled-components';
import { AuthProvider } from '../contexts/AuthContext';
import GlobalStyles from '../styles/GlobalStyles';
import theme from '../styles/theme';

export default function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <GlobalStyles />
        <Component {...pageProps} />
      </ThemeProvider>
    </AuthProvider>
  );
}

// 7. 自定义Document
// pages/_document.js
import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="zh">
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" 
          rel="stylesheet" 
        />
        <meta name="theme-color" content="#000000" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

// 8. 动态导入和代码分割
import dynamic from 'next/dynamic';
import { useState } from 'react';

// 动态导入组件
const DynamicChart = dynamic(() => import('../components/Chart'), {
  loading: () => <p>Loading chart...</p>,
  ssr: false, // 仅在客户端加载
});

export default function AnalyticsPage() {
  const [showChart, setShowChart] = useState(false);
  
  return (
    <div>
      <h1>数据分析</h1>
      <button onClick={() => setShowChart(true)}>
        显示图表
      </button>
      {showChart && <DynamicChart />}
    </div>
  );
}

// 9. 图片优化示例
import Image from 'next/image';

export function OptimizedGallery({ images }) {
  return (
    <div className="gallery">
      {images.map((image, index) => (
        <div key={image.id} className="gallery-item">
          <Image
            src={image.url}
            alt={image.alt}
            width={400}
            height={300}
            placeholder="blur"
            blurDataURL={image.blurDataURL}
            priority={index < 3} // 前3张图片优先加载
            sizes="(max-width: 768px) 100vw,
                   (max-width: 1200px) 50vw,
                   33vw"
          />
          <p>{image.caption}</p>
        </div>
      ))}
    </div>
  );
}

// 10. 环境变量使用
export function ConfigExample() {
  return (
    <div>
      <h2>环境配置</h2>
      <p>API URL: {process.env.NEXT_PUBLIC_API_URL}</p>
      <p>环境: {process.env.NODE_ENV}</p>
      <p>版本: {process.env.NEXT_PUBLIC_APP_VERSION}</p>
    </div>
  );
}

// 使用私有环境变量（仅服务端）
export async function getServerSideProps() {
  // 这些变量只能在服务端访问
  const apiKey = process.env.API_SECRET_KEY;
  const dbUrl = process.env.DATABASE_URL;
  
  const data = await fetchDataWithAuth(apiKey);
  
  return {
    props: {
      data,
    },
  };
}