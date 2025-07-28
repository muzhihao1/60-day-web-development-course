---
day: 38
title: "服务端渲染SSR - 解决方案"
phase: "react-development"
exercises:
  - id: "blog-platform"
    title: "博客平台开发"
    solution:
      code: |
        // pages/index.js - 博客首页
        import { useState } from 'react';
        import Layout from '../components/Layout';
        import PostCard from '../components/PostCard';
        import { getAllPosts } from '../lib/posts';
        import SEO from '../components/SEO';

        export default function HomePage({ posts, categories }) {
          const [selectedCategory, setSelectedCategory] = useState('all');
          
          const filteredPosts = selectedCategory === 'all' 
            ? posts 
            : posts.filter(post => post.category === selectedCategory);
          
          return (
            <Layout>
              <SEO 
                title="我的技术博客"
                description="分享前端开发、React和Next.js的最佳实践"
              />
              
              <section className="hero">
                <h1>欢迎来到我的技术博客</h1>
                <p>探索前端开发的无限可能</p>
              </section>
              
              <div className="categories">
                <button 
                  className={selectedCategory === 'all' ? 'active' : ''}
                  onClick={() => setSelectedCategory('all')}
                >
                  全部文章
                </button>
                {categories.map(cat => (
                  <button
                    key={cat}
                    className={selectedCategory === cat ? 'active' : ''}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              
              <div className="posts-grid">
                {filteredPosts.map(post => (
                  <PostCard key={post.slug} post={post} />
                ))}
              </div>
            </Layout>
          );
        }

        export async function getStaticProps() {
          const posts = await getAllPosts();
          const categories = [...new Set(posts.map(p => p.category))];
          
          return {
            props: {
              posts,
              categories,
            },
            revalidate: 3600, // 1小时更新
          };
        }

        // pages/posts/[slug].js - 文章详情页
        import { useRouter } from 'next/router';
        import ErrorPage from 'next/error';
        import Layout from '../../components/Layout';
        import SEO from '../../components/SEO';
        import TableOfContents from '../../components/TableOfContents';
        import Comments from '../../components/Comments';
        import { getPostBySlug, getAllPosts } from '../../lib/posts';
        import styles from '../../styles/Post.module.css';

        export default function PostPage({ post }) {
          const router = useRouter();
          
          if (!router.isFallback && !post?.slug) {
            return <ErrorPage statusCode={404} />;
          }
          
          if (router.isFallback) {
            return (
              <Layout>
                <div>Loading...</div>
              </Layout>
            );
          }
          
          return (
            <Layout>
              <SEO
                title={post.title}
                description={post.excerpt}
                image={post.coverImage}
                article={true}
                publishedTime={post.date}
                modifiedTime={post.updatedAt}
              />
              
              <article className={styles.article}>
                <header className={styles.header}>
                  <h1>{post.title}</h1>
                  <div className={styles.meta}>
                    <time>{new Date(post.date).toLocaleDateString('zh-CN')}</time>
                    <span className={styles.readTime}>{post.readTime} 分钟阅读</span>
                  </div>
                  <div className={styles.tags}>
                    {post.tags.map(tag => (
                      <Link key={tag} href={`/tags/${tag}`}>
                        #{tag}
                      </Link>
                    ))}
                  </div>
                </header>
                
                <div className={styles.content}>
                  <TableOfContents content={post.content} />
                  <div 
                    className={styles.markdown}
                    dangerouslySetInnerHTML={{ __html: post.content }} 
                  />
                </div>
                
                <footer className={styles.footer}>
                  <div className={styles.author}>
                    <img src={post.author.avatar} alt={post.author.name} />
                    <div>
                      <h3>{post.author.name}</h3>
                      <p>{post.author.bio}</p>
                    </div>
                  </div>
                  
                  <nav className={styles.postNav}>
                    {post.prevPost && (
                      <Link href={`/posts/${post.prevPost.slug}`}>
                        ← {post.prevPost.title}
                      </Link>
                    )}
                    {post.nextPost && (
                      <Link href={`/posts/${post.nextPost.slug}`}>
                        {post.nextPost.title} →
                      </Link>
                    )}
                  </nav>
                </footer>
                
                <Comments postSlug={post.slug} />
              </article>
            </Layout>
          );
        }

        export async function getStaticProps({ params }) {
          const post = await getPostBySlug(params.slug);
          
          if (!post) {
            return {
              notFound: true,
            };
          }
          
          return {
            props: {
              post,
            },
            revalidate: 3600,
          };
        }

        export async function getStaticPaths() {
          const posts = await getAllPosts();
          
          return {
            paths: posts.map(post => ({
              params: { slug: post.slug },
            })),
            fallback: true,
          };
        }

        // lib/posts.js - 文章数据处理
        import fs from 'fs';
        import path from 'path';
        import matter from 'gray-matter';
        import { unified } from 'unified';
        import remarkParse from 'remark-parse';
        import remarkHtml from 'remark-html';
        import remarkPrism from 'remark-prism';
        import readingTime from 'reading-time';

        const postsDirectory = path.join(process.cwd(), 'content/posts');

        export async function getPostBySlug(slug) {
          const realSlug = slug.replace(/\.md$/, '');
          const fullPath = path.join(postsDirectory, `${realSlug}.md`);
          const fileContents = fs.readFileSync(fullPath, 'utf8');
          
          const { data, content } = matter(fileContents);
          
          const processedContent = await unified()
            .use(remarkParse)
            .use(remarkPrism)
            .use(remarkHtml, { sanitize: false })
            .process(content);
          
          const contentHtml = processedContent.toString();
          const stats = readingTime(content);
          
          // 获取前后文章
          const allPosts = await getAllPosts();
          const currentIndex = allPosts.findIndex(p => p.slug === realSlug);
          
          return {
            slug: realSlug,
            content: contentHtml,
            readTime: Math.ceil(stats.minutes),
            prevPost: currentIndex > 0 ? allPosts[currentIndex - 1] : null,
            nextPost: currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null,
            ...data,
          };
        }

        export async function getAllPosts() {
          const fileNames = fs.readdirSync(postsDirectory);
          
          const posts = await Promise.all(
            fileNames
              .filter(name => name.endsWith('.md'))
              .map(async fileName => {
                const slug = fileName.replace(/\.md$/, '');
                const fullPath = path.join(postsDirectory, fileName);
                const fileContents = fs.readFileSync(fullPath, 'utf8');
                const { data, content } = matter(fileContents);
                const stats = readingTime(content);
                
                return {
                  slug,
                  readTime: Math.ceil(stats.minutes),
                  ...data,
                };
              })
          );
          
          return posts.sort((a, b) => (a.date > b.date ? -1 : 1));
        }

        // components/SEO.js - SEO组件
        import Head from 'next/head';
        import { useRouter } from 'next/router';

        export default function SEO({ 
          title, 
          description, 
          image = '/default-og.png',
          article = false,
          publishedTime,
          modifiedTime,
        }) {
          const router = useRouter();
          const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';
          const canonical = `${siteUrl}${router.asPath}`;
          const fullImageUrl = image.startsWith('http') ? image : `${siteUrl}${image}`;
          
          return (
            <Head>
              <title>{title} | 我的技术博客</title>
              <meta name="description" content={description} />
              <link rel="canonical" href={canonical} />
              
              {/* Open Graph */}
              <meta property="og:site_name" content="我的技术博客" />
              <meta property="og:type" content={article ? 'article' : 'website'} />
              <meta property="og:title" content={title} />
              <meta property="og:description" content={description} />
              <meta property="og:url" content={canonical} />
              <meta property="og:image" content={fullImageUrl} />
              
              {/* Twitter Card */}
              <meta name="twitter:card" content="summary_large_image" />
              <meta name="twitter:site" content="@yourusername" />
              <meta name="twitter:title" content={title} />
              <meta name="twitter:description" content={description} />
              <meta name="twitter:image" content={fullImageUrl} />
              
              {/* Article metadata */}
              {article && publishedTime && (
                <meta property="article:published_time" content={publishedTime} />
              )}
              {article && modifiedTime && (
                <meta property="article:modified_time" content={modifiedTime} />
              )}
              
              {/* JSON-LD */}
              <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                  __html: JSON.stringify({
                    '@context': 'https://schema.org',
                    '@type': article ? 'BlogPosting' : 'WebSite',
                    headline: title,
                    description: description,
                    image: fullImageUrl,
                    url: canonical,
                    ...(article && {
                      datePublished: publishedTime,
                      dateModified: modifiedTime || publishedTime,
                      author: {
                        '@type': 'Person',
                        name: 'Your Name',
                      },
                    }),
                  }),
                }}
              />
            </Head>
          );
        }
      explanation: |
        这个博客平台实现了以下关键功能：

        1. **静态生成与ISR**：
           - 使用getStaticProps和getStaticPaths实现静态生成
           - 设置revalidate实现增量静态再生
           - 使用fallback: true支持动态路由

        2. **SEO优化**：
           - 完整的meta标签支持
           - Open Graph和Twitter Card
           - JSON-LD结构化数据
           - 自动生成的站点地图

        3. **性能优化**：
           - Markdown内容预处理
           - 代码高亮使用remark-prism
           - 阅读时间计算
           - 图片懒加载

        4. **用户体验**：
           - 文章目录自动生成
           - 前后文章导航
           - 分类和标签筛选
           - 响应式设计

  - id: "ecommerce-product"
    title: "电商产品页"
    solution:
      code: |
        // pages/products/[id].js - 产品详情页
        import { useState } from 'react';
        import Image from 'next/image';
        import dynamic from 'next/dynamic';
        import Layout from '../../components/Layout';
        import SEO from '../../components/SEO';
        import { useCart } from '../../hooks/useCart';
        import { formatPrice } from '../../utils/format';
        import styles from '../../styles/Product.module.css';

        // 动态导入评论组件
        const ProductReviews = dynamic(
          () => import('../../components/ProductReviews'),
          { 
            loading: () => <div>加载评论中...</div>,
            ssr: false 
          }
        );

        export default function ProductPage({ product, recommendations }) {
          const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
          const [selectedColor, setSelectedColor] = useState(product.colors[0]);
          const [quantity, setQuantity] = useState(1);
          const [selectedImage, setSelectedImage] = useState(0);
          
          const { addToCart, isLoading } = useCart();
          
          const handleAddToCart = async () => {
            await addToCart({
              productId: product.id,
              name: product.name,
              price: product.price,
              size: selectedSize,
              color: selectedColor,
              quantity,
              image: product.images[0],
            });
          };
          
          const currentPrice = product.onSale 
            ? product.price * (1 - product.discount / 100)
            : product.price;
          
          return (
            <Layout>
              <SEO
                title={product.name}
                description={product.description}
                image={product.images[0]}
                article={false}
              />
              
              <div className={styles.container}>
                <div className={styles.imageGallery}>
                  <div className={styles.mainImage}>
                    <Image
                      src={product.images[selectedImage]}
                      alt={product.name}
                      width={600}
                      height={600}
                      priority
                      quality={90}
                    />
                  </div>
                  <div className={styles.thumbnails}>
                    {product.images.map((image, index) => (
                      <button
                        key={index}
                        className={selectedImage === index ? styles.active : ''}
                        onClick={() => setSelectedImage(index)}
                      >
                        <Image
                          src={image}
                          alt={`${product.name} ${index + 1}`}
                          width={100}
                          height={100}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className={styles.productInfo}>
                  <h1>{product.name}</h1>
                  <div className={styles.rating}>
                    <span>★★★★☆</span>
                    <span>{product.reviewCount} 评价</span>
                  </div>
                  
                  <div className={styles.price}>
                    {product.onSale && (
                      <span className={styles.originalPrice}>
                        {formatPrice(product.price)}
                      </span>
                    )}
                    <span className={styles.currentPrice}>
                      {formatPrice(currentPrice)}
                    </span>
                    {product.onSale && (
                      <span className={styles.discount}>
                        -{product.discount}%
                      </span>
                    )}
                  </div>
                  
                  <p className={styles.description}>{product.description}</p>
                  
                  <div className={styles.options}>
                    <div className={styles.sizeSelector}>
                      <label>尺寸</label>
                      <div className={styles.sizes}>
                        {product.sizes.map(size => (
                          <button
                            key={size}
                            className={selectedSize === size ? styles.selected : ''}
                            onClick={() => setSelectedSize(size)}
                            disabled={!product.inventory[size]}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className={styles.colorSelector}>
                      <label>颜色</label>
                      <div className={styles.colors}>
                        {product.colors.map(color => (
                          <button
                            key={color.name}
                            className={selectedColor.name === color.name ? styles.selected : ''}
                            onClick={() => setSelectedColor(color)}
                            style={{ backgroundColor: color.hex }}
                            title={color.name}
                          />
                        ))}
                      </div>
                    </div>
                    
                    <div className={styles.quantity}>
                      <label>数量</label>
                      <div className={styles.quantityControl}>
                        <button 
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        >
                          -
                        </button>
                        <input
                          type="number"
                          value={quantity}
                          onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                          min="1"
                          max="10"
                        />
                        <button 
                          onClick={() => setQuantity(Math.min(10, quantity + 1))}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className={styles.actions}>
                    <button
                      className={styles.addToCart}
                      onClick={handleAddToCart}
                      disabled={isLoading || !product.inventory[selectedSize]}
                    >
                      {isLoading ? '添加中...' : '加入购物车'}
                    </button>
                    <button className={styles.favorite}>
                      ♡ 收藏
                    </button>
                  </div>
                  
                  <div className={styles.features}>
                    <h3>产品特点</h3>
                    <ul>
                      {product.features.map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              
              <ProductReviews productId={product.id} />
              
              <section className={styles.recommendations}>
                <h2>推荐产品</h2>
                <div className={styles.productGrid}>
                  {recommendations.map(item => (
                    <Link key={item.id} href={`/products/${item.id}`}>
                      <div className={styles.productCard}>
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={300}
                          height={300}
                        />
                        <h3>{item.name}</h3>
                        <p>{formatPrice(item.price)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            </Layout>
          );
        }

        export async function getStaticProps({ params }) {
          try {
            const [product, recommendations] = await Promise.all([
              fetchProduct(params.id),
              fetchRecommendations(params.id),
            ]);
            
            if (!product) {
              return { notFound: true };
            }
            
            return {
              props: {
                product,
                recommendations,
              },
              revalidate: product.isPopular ? 300 : 3600, // 5分钟或1小时
            };
          } catch (error) {
            return { notFound: true };
          }
        }

        export async function getStaticPaths() {
          // 预渲染前50个热门产品
          const products = await fetchPopularProducts(50);
          
          const paths = products.map(product => ({
            params: { id: product.id.toString() },
          }));
          
          return {
            paths,
            fallback: 'blocking',
          };
        }

        // hooks/useCart.js - 购物车Hook
        import { useContext, useCallback } from 'react';
        import { CartContext } from '../contexts/CartContext';

        export function useCart() {
          const context = useContext(CartContext);
          
          if (!context) {
            throw new Error('useCart must be used within CartProvider');
          }
          
          const { state, dispatch } = context;
          
          const addToCart = useCallback(async (item) => {
            dispatch({ type: 'ADD_LOADING', payload: true });
            
            try {
              // 可以在这里调用API
              await new Promise(resolve => setTimeout(resolve, 500));
              
              dispatch({
                type: 'ADD_ITEM',
                payload: {
                  ...item,
                  id: `${item.productId}-${item.size}-${item.color.name}`,
                },
              });
              
              // 显示成功提示
              toast.success('已添加到购物车');
            } catch (error) {
              toast.error('添加失败，请重试');
            } finally {
              dispatch({ type: 'ADD_LOADING', payload: false });
            }
          }, [dispatch]);
          
          return {
            items: state.items,
            totalAmount: state.totalAmount,
            itemCount: state.itemCount,
            isLoading: state.isLoading,
            addToCart,
            removeFromCart: (id) => dispatch({ type: 'REMOVE_ITEM', payload: id }),
            updateQuantity: (id, quantity) => 
              dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } }),
            clearCart: () => dispatch({ type: 'CLEAR_CART' }),
          };
        }
      explanation: |
        电商产品页实现要点：

        1. **混合渲染策略**：
           - 热门产品使用较短的revalidate时间
           - 使用fallback: 'blocking'确保SEO友好
           - 动态导入评论组件减少初始加载

        2. **性能优化**：
           - Image组件自动优化图片
           - 并行数据获取
           - 客户端状态管理购物车

        3. **用户体验**：
           - 响应式图片画廊
           - 实时库存检查
           - 加载状态反馈
           - Toast通知

        4. **购物车功能**：
           - Context API管理状态
           - localStorage持久化
           - 乐观更新UI

  - id: "performance-optimization"
    title: "性能优化实战"
    solution:
      code: |
        // next.config.js - 优化配置
        const withBundleAnalyzer = require('@next/bundle-analyzer')({
          enabled: process.env.ANALYZE === 'true',
        });

        module.exports = withBundleAnalyzer({
          reactStrictMode: true,
          swcMinify: true,
          
          images: {
            domains: ['cdn.example.com'],
            formats: ['image/avif', 'image/webp'],
            deviceSizes: [640, 750, 828, 1080, 1200, 1920],
            imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
          },
          
          experimental: {
            optimizeCss: true,
          },
          
          webpack: (config, { isServer }) => {
            // 优化chunk分割
            if (!isServer) {
              config.optimization.splitChunks = {
                chunks: 'all',
                cacheGroups: {
                  default: false,
                  vendors: false,
                  vendor: {
                    name: 'vendor',
                    chunks: 'all',
                    test: /node_modules/,
                    priority: 20,
                  },
                  common: {
                    name: 'common',
                    minChunks: 2,
                    chunks: 'async',
                    priority: 10,
                    reuseExistingChunk: true,
                    enforce: true,
                  },
                },
              };
            }
            
            return config;
          },
          
          headers: async () => [
            {
              source: '/:path*',
              headers: [
                {
                  key: 'X-DNS-Prefetch-Control',
                  value: 'on',
                },
                {
                  key: 'X-Frame-Options',
                  value: 'SAMEORIGIN',
                },
              ],
            },
            {
              source: '/static/:path*',
              headers: [
                {
                  key: 'Cache-Control',
                  value: 'public, max-age=31536000, immutable',
                },
              ],
            },
          ],
        });

        // components/PerformanceMonitor.js - 性能监控
        import { useEffect } from 'react';
        import { getCLS, getFID, getLCP, getFCP, getTTFB } from 'web-vitals';

        export function PerformanceMonitor() {
          useEffect(() => {
            function sendToAnalytics({ name, delta, value, id }) {
              // 发送到分析服务
              if (window.gtag) {
                window.gtag('event', name, {
                  event_category: 'Web Vitals',
                  event_label: id,
                  value: Math.round(name === 'CLS' ? delta * 1000 : delta),
                  non_interaction: true,
                });
              }
              
              // 发送到自定义监控服务
              fetch('/api/metrics', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  metric: name,
                  value,
                  delta,
                  id,
                  page: window.location.pathname,
                }),
              });
            }
            
            // 监控所有Web Vitals指标
            getCLS(sendToAnalytics);
            getFID(sendToAnalytics);
            getLCP(sendToAnalytics);
            getFCP(sendToAnalytics);
            getTTFB(sendToAnalytics);
          }, []);
          
          return null;
        }

        // pages/_app.js - 优化后的App组件
        import { lazy, Suspense } from 'react';
        import dynamic from 'next/dynamic';
        import { Inter } from 'next/font/google';
        import { PerformanceMonitor } from '../components/PerformanceMonitor';

        // 字体优化
        const inter = Inter({
          subsets: ['latin'],
          display: 'swap',
          preload: true,
        });

        // 动态导入第三方组件
        const Analytics = dynamic(
          () => import('../components/Analytics'),
          { ssr: false }
        );

        function MyApp({ Component, pageProps }) {
          return (
            <>
              <style jsx global>{`
                html {
                  font-family: ${inter.style.fontFamily};
                }
              `}</style>
              
              <Component {...pageProps} />
              
              <PerformanceMonitor />
              <Suspense fallback={null}>
                <Analytics />
              </Suspense>
            </>
          );
        }

        export default MyApp;

        // pages/_document.js - 优化的Document
        import Document, { Html, Head, Main, NextScript } from 'next/document';

        class MyDocument extends Document {
          render() {
            return (
              <Html lang="zh">
                <Head>
                  {/* 预连接 */}
                  <link rel="preconnect" href="https://fonts.googleapis.com" />
                  <link rel="dns-prefetch" href="https://cdn.example.com" />
                  
                  {/* 关键CSS内联 */}
                  <style
                    dangerouslySetInnerHTML={{
                      __html: `
                        /* 关键CSS */
                        body { margin: 0; font-family: -apple-system, sans-serif; }
                        .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
                      `,
                    }}
                  />
                </Head>
                <body>
                  <Main />
                  <NextScript />
                  
                  {/* 延迟加载第三方脚本 */}
                  <script
                    async
                    src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"
                  />
                </body>
              </Html>
            );
          }
        }

        export default MyDocument;

        // utils/image-optimization.js - 图片优化工具
        export function generateBlurDataURL(src) {
          // 生成模糊占位符
          const blurSvg = `
            <svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
              <filter id="b" color-interpolation-filters="sRGB">
                <feGaussianBlur stdDeviation="20" />
              </filter>
              <image filter="url(#b)" x="0" y="0" height="100%" width="100%" href="${src}" />
            </svg>
          `;
          
          const toBase64 = (str) =>
            typeof window === 'undefined'
              ? Buffer.from(str).toString('base64')
              : window.btoa(str);
          
          return `data:image/svg+xml;base64,${toBase64(blurSvg)}`;
        }

        // middleware.js - 边缘优化
        import { NextResponse } from 'next/server';

        export function middleware(request) {
          const response = NextResponse.next();
          
          // 安全头
          response.headers.set('X-Content-Type-Options', 'nosniff');
          response.headers.set('X-Frame-Options', 'DENY');
          response.headers.set('X-XSS-Protection', '1; mode=block');
          
          // 根据用户设备优化
          const userAgent = request.headers.get('user-agent') || '';
          const isMobile = /mobile/i.test(userAgent);
          
          if (isMobile) {
            response.headers.set('x-device-type', 'mobile');
          }
          
          return response;
        }

        export const config = {
          matcher: '/:path*',
        };
      explanation: |
        性能优化实施要点：

        1. **构建优化**：
           - SWC压缩代替Terser
           - 智能代码分割策略
           - CSS优化
           - Bundle分析

        2. **运行时优化**：
           - Web Vitals监控
           - 字体优化加载
           - 关键CSS内联
           - 图片格式自动选择

        3. **缓存策略**：
           - 静态资源永久缓存
           - API响应缓存
           - 边缘中间件优化

        4. **监控方案**：
           - 实时性能指标收集
           - 自定义指标上报
           - 错误追踪集成
           - 用户体验监控
---