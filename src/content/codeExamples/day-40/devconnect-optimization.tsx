// devconnect-optimization.tsx - DevConnect性能优化代码

// 1. 代码分割和懒加载
import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import LoadingSpinner from './components/LoadingSpinner';

// 懒加载页面组件
const HomePage = lazy(() => import('./pages/HomePage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const PostDetailPage = lazy(() => import('./pages/PostDetailPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const MessagesPage = lazy(() => import('./pages/MessagesPage'));
const ExplorePage = lazy(() => import('./pages/ExplorePage'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));

// 带预加载的路由配置
export function AppRoutes() {
  // 预加载函数
  const preloadComponent = (component: () => Promise<any>) => {
    component();
  };

  return (
    <Suspense fallback={<LoadingSpinner fullScreen />}>
      <Routes>
        <Route 
          path="/" 
          element={<HomePage />}
          onMouseEnter={() => preloadComponent(() => import('./pages/ProfilePage'))}
        />
        <Route path="/profile/:userId" element={<ProfilePage />} />
        <Route path="/post/:postId" element={<PostDetailPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
      </Routes>
    </Suspense>
  );
}

// 2. 虚拟列表优化
import { VariableSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { useCallback, useRef, useEffect } from 'react';
import { Post } from './types';

interface VirtualPostListProps {
  posts: Post[];
  onLoadMore: () => void;
  hasMore: boolean;
}

export function VirtualPostList({ posts, onLoadMore, hasMore }: VirtualPostListProps) {
  const listRef = useRef<List>(null);
  const rowHeights = useRef<{ [key: string]: number }>({});
  
  // 动态计算行高
  const getItemSize = useCallback((index: number) => {
    return rowHeights.current[index] || 200; // 默认高度
  }, []);
  
  // 设置行高
  const setItemSize = useCallback((index: number, size: number) => {
    rowHeights.current[index] = size;
    if (listRef.current) {
      listRef.current.resetAfterIndex(index);
    }
  }, []);
  
  // 行渲染组件
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const rowRef = useRef<HTMLDivElement>(null);
    const post = posts[index];
    
    useEffect(() => {
      if (rowRef.current) {
        const height = rowRef.current.getBoundingClientRect().height;
        setItemSize(index, height);
      }
    }, [index, post]);
    
    // 检测是否需要加载更多
    useEffect(() => {
      if (index === posts.length - 1 && hasMore) {
        onLoadMore();
      }
    }, [index]);
    
    return (
      <div ref={rowRef} style={style}>
        <PostCard post={post} />
      </div>
    );
  };
  
  return (
    <AutoSizer>
      {({ height, width }) => (
        <List
          ref={listRef}
          height={height}
          itemCount={posts.length}
          itemSize={getItemSize}
          width={width}
          overscanCount={3}
        >
          {Row}
        </List>
      )}
    </AutoSizer>
  );
}

// 3. 图片懒加载和优化
import { useState, useEffect, useRef } from 'react';

interface LazyImageProps {
  src: string;
  alt: string;
  placeholder?: string;
  srcSet?: string;
  sizes?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export function LazyImage({ 
  src, 
  alt, 
  placeholder, 
  srcSet,
  sizes,
  onLoad, 
  onError 
}: LazyImageProps) {
  const [imageSrc, setImageSrc] = useState(placeholder || '');
  const [imageRef, setImageRef] = useState<HTMLImageElement | null>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);
  
  // Intersection Observer
  useEffect(() => {
    if (!imageRef) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );
    
    observer.observe(imageRef);
    
    return () => observer.disconnect();
  }, [imageRef]);
  
  // 加载图片
  useEffect(() => {
    if (!isIntersecting) return;
    
    const img = new Image();
    img.src = src;
    if (srcSet) img.srcset = srcSet;
    
    img.onload = () => {
      setImageSrc(src);
      onLoad?.();
    };
    
    img.onerror = () => {
      onError?.();
    };
  }, [isIntersecting, src, srcSet, onLoad, onError]);
  
  return (
    <img
      ref={setImageRef}
      src={imageSrc}
      alt={alt}
      srcSet={isIntersecting ? srcSet : undefined}
      sizes={sizes}
      loading="lazy"
      style={{
        filter: imageSrc === placeholder ? 'blur(10px)' : 'none',
        transition: 'filter 0.3s',
      }}
    />
  );
}

// 4. 缓存优化和React Query配置
import { QueryClient } from '@tanstack/react-query';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';

// 创建持久化存储
const persister = createSyncStoragePersister({
  storage: window.localStorage,
  throttleTime: 1000,
});

// 优化的查询客户端配置
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 缓存时间
      staleTime: 1000 * 60 * 5, // 5分钟
      cacheTime: 1000 * 60 * 30, // 30分钟
      
      // 重试配置
      retry: (failureCount, error: any) => {
        if (error.status === 404) return false;
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // 后台重新获取
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: false,
    },
  },
});

// 持久化查询客户端
persistQueryClient({
  queryClient,
  persister,
  maxAge: 1000 * 60 * 60 * 24, // 24小时
});

// 5. Memo优化和性能Hooks
import { memo, useMemo, useCallback } from 'react';

// 优化的帖子卡片组件
export const PostCard = memo(({ post }: { post: Post }) => {
  const { currentUser } = useAuth();
  const dispatch = useAppDispatch();
  
  // 缓存计算结果
  const isLiked = useMemo(
    () => post.likes.includes(currentUser?.uid || ''),
    [post.likes, currentUser?.uid]
  );
  
  const likeCount = useMemo(
    () => post.likes.length,
    [post.likes.length]
  );
  
  // 缓存回调函数
  const handleLike = useCallback(() => {
    dispatch(toggleLike(post.id));
  }, [dispatch, post.id]);
  
  const handleShare = useCallback(() => {
    if (navigator.share) {
      navigator.share({
        title: 'DevConnect Post',
        text: post.content.substring(0, 100),
        url: `${window.location.origin}/post/${post.id}`,
      });
    }
  }, [post.id, post.content]);
  
  return (
    <div className="post-card">
      <PostHeader post={post} />
      <PostContent content={post.content} />
      {post.images && <PostImages images={post.images} />}
      <PostActions
        isLiked={isLiked}
        likeCount={likeCount}
        commentCount={post.comments}
        onLike={handleLike}
        onShare={handleShare}
      />
    </div>
  );
}, (prevProps, nextProps) => {
  // 自定义比较函数
  return (
    prevProps.post.id === nextProps.post.id &&
    prevProps.post.likes.length === nextProps.post.likes.length &&
    prevProps.post.comments === nextProps.post.comments &&
    prevProps.post.content === nextProps.post.content
  );
});

// 6. Web Workers for Heavy Computations
// worker.ts
const searchWorker = new Worker(
  new URL('./search.worker.ts', import.meta.url),
  { type: 'module' }
);

export function useSearchWorker() {
  const [results, setResults] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  
  const search = useCallback((query: string, posts: Post[]) => {
    setLoading(true);
    
    searchWorker.postMessage({ type: 'SEARCH', query, posts });
    
    searchWorker.onmessage = (event) => {
      if (event.data.type === 'SEARCH_RESULTS') {
        setResults(event.data.results);
        setLoading(false);
      }
    };
  }, []);
  
  return { search, results, loading };
}

// search.worker.ts
self.addEventListener('message', (event) => {
  if (event.data.type === 'SEARCH') {
    const { query, posts } = event.data;
    const lowerQuery = query.toLowerCase();
    
    // 执行搜索
    const results = posts.filter((post: Post) => {
      return (
        post.content.toLowerCase().includes(lowerQuery) ||
        post.author?.displayName.toLowerCase().includes(lowerQuery)
      );
    });
    
    // 返回结果
    self.postMessage({
      type: 'SEARCH_RESULTS',
      results,
    });
  }
});

// 7. 防抖和节流优化
import { useRef, useCallback, useEffect } from 'react';

export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout>();
  
  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  ) as T;
  
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  return debouncedCallback;
}

export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastRunRef = useRef(Date.now());
  
  const throttledCallback = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastRunRef.current >= delay) {
        lastRunRef.current = now;
        callback(...args);
      }
    },
    [callback, delay]
  ) as T;
  
  return throttledCallback;
}

// 使用示例
export function SearchBar() {
  const [query, setQuery] = useState('');
  const { search, results, loading } = useSearchWorker();
  const posts = useAppSelector(state => state.posts.posts);
  
  // 防抖搜索
  const debouncedSearch = useDebounce((searchQuery: string) => {
    if (searchQuery.trim()) {
      search(searchQuery, posts);
    }
  }, 300);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    debouncedSearch(value);
  };
  
  return (
    <div className="search-bar">
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder="搜索帖子..."
      />
      {loading && <LoadingSpinner />}
      {results.length > 0 && (
        <SearchResults results={results} />
      )}
    </div>
  );
}

// 8. Service Worker和PWA优化
// sw.ts
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst, NetworkFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';

// 预缓存静态资源
precacheAndRoute(self.__WB_MANIFEST);

// 图片缓存策略
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30天
      }),
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);

// API缓存策略
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: 'api-cache',
    networkTimeoutSeconds: 5,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 5 * 60, // 5分钟
      }),
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);

// 离线页面回退
const OFFLINE_URL = '/offline.html';

self.addEventListener('install', (event: any) => {
  event.waitUntil(
    caches.open('offline-cache').then((cache) => {
      return cache.add(OFFLINE_URL);
    })
  );
});

self.addEventListener('fetch', (event: any) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(OFFLINE_URL);
      })
    );
  }
});

// 9. 性能监控和分析
import { getCLS, getFID, getLCP, getFCP, getTTFB } from 'web-vitals';

interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
}

export function usePerformanceMonitoring() {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  
  useEffect(() => {
    const handleMetric = (metric: any) => {
      const newMetric: PerformanceMetric = {
        name: metric.name,
        value: metric.value,
        rating: metric.rating || 'good',
      };
      
      setMetrics(prev => [...prev, newMetric]);
      
      // 发送到分析服务
      if (window.gtag) {
        window.gtag('event', metric.name, {
          event_category: 'Web Vitals',
          event_label: metric.id,
          value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
          non_interaction: true,
        });
      }
    };
    
    // 收集性能指标
    getCLS(handleMetric);
    getFID(handleMetric);
    getLCP(handleMetric);
    getFCP(handleMetric);
    getTTFB(handleMetric);
  }, []);
  
  return metrics;
}

// 10. Bundle分析和优化配置
// vite.config.ts优化示例
export const viteOptimizationConfig = {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'redux-vendor': ['@reduxjs/toolkit', 'react-redux'],
          'firebase-vendor': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          'ui-vendor': ['styled-components', 'framer-motion'],
          'utils-vendor': ['yup', 'react-hook-form', '@hookform/resolvers'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
};