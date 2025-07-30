import React, { Suspense, lazy, useState, useEffect } from 'react';
import './StreamingBlog.css';
// 模拟数据获取
const fetchPost = (id) => {
  let status = 'pending';
  let result;
  
  const suspender = new Promise((resolve) => {
    setTimeout(() => {
      const post = {
        id,
        title: `深入理解React 18并发特性 - Part ${id}`,
        author: { name: 'React专家', avatar: 'https://i.pravatar.cc/150?img=1' },
        date: new Date().toLocaleDateString(),
        readTime: '8分钟',
        content: `
          <h2>引言</h2>
          <p>React 18带来了革命性的并发渲染机制，这是React架构的重大升级。本文将深入探讨这些新特性如何改变我们构建用户界面的方式。</p>
          
          <h2>并发渲染的核心概念</h2>
          <p>并发渲染允许React在渲染过程中暂停、恢复或放弃工作。这意味着React可以同时准备多个版本的UI，而不会阻塞主线程。</p>
          
          <h3>1. 可中断渲染</h3>
          <p>React 18可以中断正在进行的渲染工作，优先处理更紧急的更新。这确保了用户输入等高优先级任务能够快速响应。</p>
          
          <h3>2. 优先级调度</h3>
          <p>不同类型的更新被赋予不同的优先级。用户交互（如点击、输入）具有最高优先级，而数据获取等操作可以延迟。</p>
          
          <h2>实际应用场景</h2>
          <p>让我们看看如何在实际项目中应用这些特性...</p>
        `,
        tags: ['React 18', '并发渲染', '性能优化', 'Web开发'],
        likes: Math.floor(Math.random() * 1000),
        views: Math.floor(Math.random() * 10000)
      };
      
      status = 'success';
      result = post;
      resolve(post);
    }, 1000 + Math.random() * 2000);
  });
  
  return {
    read() {
      if (status === 'pending') throw suspender;
      return result;
    }
  };
};
const fetchComments = (postId) => {
  let status = 'pending';
  let result;
  
  const suspender = new Promise((resolve) => {
    setTimeout(() => {
      const comments = Array.from({ length: 5 }, (_, i) => ({
        id: i + 1,
        author: `用户${i + 1}`,
        avatar: `https://i.pravatar.cc/150?img=${i + 10}`,
        date: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        content: `这是一篇很棒的文章！第${i + 1}个评论展示了React 18的强大功能。`,
        likes: Math.floor(Math.random() * 100)
      }));
      
      status = 'success';
      result = comments;
      resolve(comments);
    }, 2000 + Math.random() * 2000);
  });
  
  return {
    read() {
      if (status === 'pending') throw suspender;
      return result;
    }
  };
};
const fetchRelatedPosts = (postId) => {
  let status = 'pending';
  let result;
  
  const suspender = new Promise((resolve) => {
    setTimeout(() => {
      const posts = Array.from({ length: 4 }, (_, i) => ({
        id: postId + i + 1,
        title: `React ${18 + i}相关文章`,
        excerpt: '探索React生态系统的最新发展...',
        thumbnail: `https://picsum.photos/300/200?random=${postId + i}`,
        readTime: `${5 + i}分钟`
      }));
      
      status = 'success';
      result = posts;
      resolve(posts);
    }, 3000 + Math.random() * 2000);
  });
  
  return {
    read() {
      if (status === 'pending') throw suspender;
      return result;
    }
  };
};
// 骨架屏组件
const HeaderSkeleton = () => (
  <div className="skeleton-header">
    <div className="skeleton-title" />
    <div className="skeleton-meta" />
  </div>
);
const ContentSkeleton = () => (
  <div className="skeleton-content">
    {[1, 2, 3, 4].map(i => (
      <div key={i} className="skeleton-paragraph" />
    ))}
  </div>
);
const CommentsSkeleton = () => (
  <div className="skeleton-comments">
    {[1, 2, 3].map(i => (
      <div key={i} className="skeleton-comment" />
    ))}
  </div>
);
const RelatedSkeleton = () => (
  <div className="skeleton-related">
    {[1, 2, 3, 4].map(i => (
      <div key={i} className="skeleton-card" />
    ))}
  </div>
);
// 文章头部组件
const PostHeader = ({ resource }) => {
  const post = resource.read();
  
  return (
    <header className="post-header">
      <h1>{post.title}</h1>
      <div className="post-meta">
        <img src={post.author.avatar} alt={post.author.name} className="author-avatar" />
        <div className="meta-info">
          <span className="author-name">{post.author.name}</span>
          <span className="post-date">{post.date}</span>
          <span className="read-time">📖 {post.readTime}</span>
        </div>
      </div>
      <div className="post-stats">
        <span>👁️ {post.views.toLocaleString()} 阅读</span>
        <span>❤️ {post.likes} 赞</span>
      </div>
    </header>
  );
};
// 文章内容组件
const PostContent = ({ resource }) => {
  const post = resource.read();
  const [readProgress, setReadProgress] = useState(0);
  
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      setReadProgress(Math.min(progress, 100));
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // 保存阅读进度
  useEffect(() => {
    if (readProgress > 10) {
      localStorage.setItem(`post-${post.id}-progress`, readProgress.toString());
    }
  }, [readProgress, post.id]);
  
  return (
    <>
      <div className="reading-progress" style={{ width: `${readProgress}%` }} />
      <article className="post-content">
        <div dangerouslySetInnerHTML={{ __html: post.content }} />
        <div className="post-tags">
          {post.tags.map(tag => (
            <span key={tag} className="tag">{tag}</span>
          ))}
        </div>
      </article>
    </>
  );
};
// 评论组件
const Comments = ({ resource }) => {
  const comments = resource.read();
  const [newComment, setNewComment] = useState('');
  const [localComments, setLocalComments] = useState(comments);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (newComment.trim()) {
      const comment = {
        id: Date.now(),
        author: '当前用户',
        avatar: 'https://i.pravatar.cc/150?img=99',
        date: new Date().toLocaleDateString(),
        content: newComment,
        likes: 0
      };
      setLocalComments([comment, ...localComments]);
      setNewComment('');
    }
  };
  
  return (
    <section className="comments-section">
      <h2>评论 ({localComments.length})</h2>
      
      <form onSubmit={handleSubmit} className="comment-form">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="分享你的想法..."
          rows={4}
        />
        <button type="submit">发表评论</button>
      </form>
      
      <div className="comments-list">
        {localComments.map(comment => (
          <div key={comment.id} className="comment">
            <img src={comment.avatar} alt={comment.author} className="comment-avatar" />
            <div className="comment-content">
              <div className="comment-header">
                <span className="comment-author">{comment.author}</span>
                <span className="comment-date">{comment.date}</span>
              </div>
              <p>{comment.content}</p>
              <button className="like-button">👍 {comment.likes}</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
// 相关文章组件
const RelatedPosts = ({ resource }) => {
  const posts = resource.read();
  
  return (
    <section className="related-posts">
      <h2>相关文章</h2>
      <div className="related-grid">
        {posts.map(post => (
          <article key={post.id} className="related-card">
            <img src={post.thumbnail} alt={post.title} />
            <h3>{post.title}</h3>
            <p>{post.excerpt}</p>
            <span className="read-time">📖 {post.readTime}</span>
          </article>
        ))}
      </div>
    </section>
  );
};
// 主博客组件
const StreamingBlog = () => {
  const [postId, setPostId] = useState(1);
  const [resources, setResources] = useState(() => ({
    post: fetchPost(postId),
    comments: fetchComments(postId),
    related: fetchRelatedPosts(postId)
  }));
  
  // 处理文章切换
  const handlePostChange = (newId) => {
    setPostId(newId);
    setResources({
      post: fetchPost(newId),
      comments: fetchComments(newId),
      related: fetchRelatedPosts(newId)
    });
  };
  
  return (
    <div className="streaming-blog">
      <nav className="blog-nav">
        <h1>React 18 博客</h1>
        <div className="nav-links">
          <a href="#" onClick={() => handlePostChange(1)}>文章1</a>
          <a href="#" onClick={() => handlePostChange(2)}>文章2</a>
          <a href="#" onClick={() => handlePostChange(3)}>文章3</a>
        </div>
      </nav>
      
      <main className="blog-main">
        <Suspense fallback={<HeaderSkeleton />}>
          <PostHeader resource={resources.post} />
        </Suspense>
        
        <Suspense fallback={<ContentSkeleton />}>
          <PostContent resource={resources.post} />
          
          <Suspense fallback={<CommentsSkeleton />}>
            <Comments resource={resources.comments} />
          </Suspense>
        </Suspense>
        
        <Suspense fallback={<RelatedSkeleton />}>
          <RelatedPosts resource={resources.related} />
        </Suspense>
      </main>
      
      <aside className="blog-sidebar">
        <div className="sidebar-widget">
          <h3>目录</h3>
          <ul className="toc">
            <li><a href="#intro">引言</a></li>
            <li><a href="#concepts">核心概念</a></li>
            <li><a href="#applications">应用场景</a></li>
          </ul>
        </div>
        
        <div className="sidebar-widget">
          <h3>订阅更新</h3>
          <form className="subscribe-form">
            <input type="email" placeholder="你的邮箱" />
            <button type="submit">订阅</button>
          </form>
        </div>
      </aside>
    </div>
  );
};
// 服务端渲染代码（示例）
export const serverRender = `
import { renderToPipeableStream } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
app.get('/blog/:id', (req, res) => {
  const { pipe, abort } = renderToPipeableStream(
    <StaticRouter location={req.url}>
      <StreamingBlog postId={req.params.id} />
    </StaticRouter>,
    {
      bootstrapScripts: ['/client.js'],
      onShellReady() {
        res.statusCode = 200;
        res.setHeader('Content-type', 'text/html; charset=utf-8');
        res.write('<!DOCTYPE html><html><head>');
        res.write('<meta charset="utf-8">');
        res.write('<title>React 18 博客</title>');
        res.write('<link rel="stylesheet" href="/styles.css">');
        res.write('</head><body><div id="root">');
        pipe(res);
      },
      onShellError(error) {
        console.error(error);
        res.statusCode = 500;
        res.send('<!DOCTYPE html><h1>服务器错误</h1>');
      },
      onAllReady() {
        res.end('</div></body></html>');
      },
      onError(error) {
        console.error('流式渲染错误:', error);
      }
    }
  );
  // 设置超时
  setTimeout(() => {
    abort();
  }, 10000);
});
`;
// 客户端hydration代码（示例）
export const clientHydration = `
import { hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
const container = document.getElementById('root');
// 选择性hydration
const root = hydrateRoot(
  container,
  <BrowserRouter>
    <StreamingBlog />
  </BrowserRouter>,
  {
    onRecoverableError: (error) => {
      console.error('Hydration错误:', error);
    }
  }
);
// 记录hydration性能
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    const perfData = performance.getEntriesByType('navigation')[0];
    console.log('页面加载性能:', {
      domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
      loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
      totalTime: perfData.loadEventEnd - perfData.fetchStart
    });
  });
}
`;
export default StreamingBlog;