import React, { useState, useCallback, useRef, useEffect, memo, useMemo } from 'react';
import './SocialMediaFeed.css';
// 生成模拟帖子数据
const generatePost = (id) => ({
  id,
  author: {
    id: Math.floor(Math.random() * 1000),
    name: `User ${Math.floor(Math.random() * 1000)}`,
    avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`
  },
  content: `This is post #${id}. ${Array(Math.floor(Math.random() * 3) + 1).fill('Lorem ipsum dolor sit amet, consectetur adipiscing elit.').join(' ')}`,
  image: Math.random() > 0.5 ? `https://picsum.photos/600/400?random=${id}` : null,
  likes: Math.floor(Math.random() * 1000),
  comments: Math.floor(Math.random() * 100),
  shares: Math.floor(Math.random() * 50),
  timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
  isLiked: false
});
// Intersection Observer Hook
const useIntersectionObserver = (ref, options) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);
    
    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }
    
    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [ref, options]);
  
  return isIntersecting;
};
// 批量更新Hook
const useBatchUpdate = () => {
  const [updates, setUpdates] = useState([]);
  const timeoutRef = useRef(null);
  
  const batchUpdate = useCallback((update) => {
    setUpdates(prev => [...prev, update]);
  }, []);
  
  useEffect(() => {
    if (updates.length > 0) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      
      timeoutRef.current = setTimeout(() => {
        // 批量处理所有更新
        console.log('Processing batch updates:', updates.length);
        setUpdates([]);
      }, 16); // 一帧的时间
    }
  }, [updates]);
  
  return batchUpdate;
};
// 懒加载图片组件
const LazyImage = memo(({ src, alt }) => {
  const imgRef = useRef(null);
  const isVisible = useIntersectionObserver(imgRef, {
    threshold: 0.1,
    rootMargin: '50px'
  });
  const [loaded, setLoaded] = useState(false);
  
  return (
    <div ref={imgRef} className="lazy-image-container">
      {isVisible && (
        <img
          src={src}
          alt={alt}
          onLoad={() => setLoaded(true)}
          className={`lazy-image ${loaded ? 'loaded' : ''}`}
        />
      )}
      {!loaded && isVisible && <div className="image-placeholder">Loading...</div>}
    </div>
  );
});
// 帖子组件
const Post = memo(({ post, onLike, onComment, onShare }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const postRef = useRef(null);
  const isVisible = useIntersectionObserver(postRef, {
    threshold: 0.5
  });
  
  // 格式化时间
  const formatTime = useCallback((date) => {
    const now = new Date();
    const diff = now - date;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  }, []);
  
  // 只在可见时记录展示
  useEffect(() => {
    if (isVisible) {
      console.log('Post visible:', post.id);
    }
  }, [isVisible, post.id]);
  
  return (
    <article ref={postRef} className="post">
      <header className="post-header">
        <img src={post.author.avatar} alt={post.author.name} className="author-avatar" />
        <div className="author-info">
          <h3>{post.author.name}</h3>
          <time>{formatTime(post.timestamp)}</time>
        </div>
      </header>
      
      <div className="post-content">
        <p className={isExpanded ? 'expanded' : 'collapsed'}>
          {post.content}
        </p>
        {post.content.length > 200 && (
          <button 
            className="expand-button"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Show less' : 'Show more'}
          </button>
        )}
      </div>
      
      {post.image && <LazyImage src={post.image} alt="Post image" />}
      
      <div className="post-stats">
        <span>{post.likes} likes</span>
        <span>{post.comments} comments</span>
        <span>{post.shares} shares</span>
      </div>
      
      <div className="post-actions">
        <button 
          className={`action-button ${post.isLiked ? 'liked' : ''}`}
          onClick={() => onLike(post.id)}
        >
          ❤️ Like
        </button>
        <button className="action-button" onClick={() => onComment(post.id)}>
          💬 Comment
        </button>
        <button className="action-button" onClick={() => onShare(post.id)}>
          🔄 Share
        </button>
      </div>
    </article>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.post.id === nextProps.post.id &&
    prevProps.post.isLiked === nextProps.post.isLiked &&
    prevProps.post.likes === nextProps.post.likes
  );
});
const SocialMediaFeed = () => {
  const [posts, setPosts] = useState(() => 
    Array.from({ length: 20 }, (_, i) => generatePost(i + 1))
  );
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [hasMore, setHasMore] = useState(true);
  const loadMoreRef = useRef(null);
  const batchUpdate = useBatchUpdate();
  
  // 无限滚动检测
  const shouldLoadMore = useIntersectionObserver(loadMoreRef, {
    threshold: 0.1,
    rootMargin: '100px'
  });
  
  // 加载更多帖子
  useEffect(() => {
    if (shouldLoadMore && hasMore && !isLoading) {
      setIsLoading(true);
      
      // 模拟API调用
      setTimeout(() => {
        const newPosts = Array.from(
          { length: 10 }, 
          (_, i) => generatePost(posts.length + i + 1)
        );
        
        setPosts(prev => [...prev, ...newPosts]);
        setIsLoading(false);
        
        // 模拟没有更多数据
        if (posts.length + newPosts.length > 100) {
          setHasMore(false);
        }
      }, 1000);
    }
  }, [shouldLoadMore, hasMore, isLoading, posts.length]);
  
  // 搜索过滤
  const filteredPosts = useMemo(() => {
    if (!searchTerm) return posts;
    
    return posts.filter(post => 
      post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.author.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [posts, searchTerm]);
  
  // 处理点赞（优化版）
  const handleLike = useCallback((postId) => {
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              isLiked: !post.isLiked,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1
            }
          : post
      )
    );
    
    // 批量更新分析数据
    batchUpdate({ type: 'like', postId });
  }, [batchUpdate]);
  
  // 处理评论
  const handleComment = useCallback((postId) => {
    console.log('Comment on post:', postId);
    batchUpdate({ type: 'comment', postId });
  }, [batchUpdate]);
  
  // 处理分享
  const handleShare = useCallback((postId) => {
    console.log('Share post:', postId);
    batchUpdate({ type: 'share', postId });
  }, [batchUpdate]);
  
  // 模拟实时更新
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const newPost = generatePost(Date.now());
        setPosts(prev => [newPost, ...prev]);
        console.log('New post added');
      }
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="social-media-feed">
      <header className="feed-header">
        <h1>Social Feed</h1>
        <input
          type="search"
          placeholder="Search posts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </header>
      
      <div className="posts-container">
        {filteredPosts.map(post => (
          <Post
            key={post.id}
            post={post}
            onLike={handleLike}
            onComment={handleComment}
            onShare={handleShare}
          />
        ))}
        
        {hasMore && (
          <div ref={loadMoreRef} className="load-more">
            {isLoading ? 'Loading more posts...' : 'Scroll for more'}
          </div>
        )}
        
        {!hasMore && (
          <div className="end-message">
            You've reached the end!
          </div>
        )}
      </div>
    </div>
  );
};
export default SocialMediaFeed;