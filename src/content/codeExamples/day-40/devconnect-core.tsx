// devconnect-core.tsx - DevConnect社交平台核心代码

// 1. 类型定义
export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  bio?: string;
  followers: string[];
  following: string[];
  createdAt: Date;
}

export interface Post {
  id: string;
  authorId: string;
  author?: User;
  content: string;
  images?: string[];
  likes: string[];
  comments: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  author?: User;
  content: string;
  likes: string[];
  createdAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'like' | 'comment' | 'follow';
  message: string;
  read: boolean;
  relatedId?: string;
  createdAt: Date;
}

// 2. Firebase服务层
import { 
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  DocumentSnapshot,
} from 'firebase/firestore';
import { db, storage } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export class PostService {
  static async createPost(
    authorId: string,
    content: string,
    images?: File[]
  ): Promise<Post> {
    // 上传图片
    const imageUrls = await this.uploadImages(images);
    
    // 创建帖子
    const postData = {
      authorId,
      content,
      images: imageUrls,
      likes: [],
      comments: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    const docRef = await addDoc(collection(db, 'posts'), postData);
    return {
      id: docRef.id,
      ...postData,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Post;
  }
  
  static async uploadImages(files?: File[]): Promise<string[]> {
    if (!files || files.length === 0) return [];
    
    const uploadPromises = files.map(async (file) => {
      const fileName = `posts/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, fileName);
      await uploadBytes(storageRef, file);
      return getDownloadURL(storageRef);
    });
    
    return Promise.all(uploadPromises);
  }
  
  static async getPosts(
    lastDoc?: DocumentSnapshot,
    pageSize: number = 10
  ) {
    let q = query(
      collection(db, 'posts'),
      orderBy('createdAt', 'desc'),
      limit(pageSize)
    );
    
    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }
    
    const snapshot = await getDocs(q);
    const posts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Post[];
    
    // 获取作者信息
    const authorIds = [...new Set(posts.map(p => p.authorId))];
    const authors = await UserService.getUsersByIds(authorIds);
    const authorMap = new Map(authors.map(a => [a.uid, a]));
    
    return {
      posts: posts.map(post => ({
        ...post,
        author: authorMap.get(post.authorId),
      })),
      lastDoc: snapshot.docs[snapshot.docs.length - 1],
      hasMore: snapshot.docs.length === pageSize,
    };
  }
  
  static async likePost(postId: string, userId: string): Promise<void> {
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      likes: arrayUnion(userId),
    });
    
    // 创建通知
    const post = await getDoc(postRef);
    if (post.exists() && post.data().authorId !== userId) {
      await NotificationService.createNotification({
        userId: post.data().authorId,
        type: 'like',
        message: '有人赞了你的帖子',
        relatedId: postId,
      });
    }
  }
  
  static async unlikePost(postId: string, userId: string): Promise<void> {
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      likes: arrayRemove(userId),
    });
  }
}

// 3. Redux状态管理
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';

interface PostsState {
  posts: Post[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  lastDoc: any;
}

const initialState: PostsState = {
  posts: [],
  loading: false,
  error: null,
  hasMore: true,
  lastDoc: null,
};

export const fetchPosts = createAsyncThunk(
  'posts/fetch',
  async (_, { getState }) => {
    const state = getState() as RootState;
    const { lastDoc } = state.posts;
    const result = await PostService.getPosts(lastDoc);
    return result;
  }
);

export const createPost = createAsyncThunk(
  'posts/create',
  async ({ content, images }: { content: string; images?: File[] }) => {
    const userId = getCurrentUserId();
    const post = await PostService.createPost(userId, content, images);
    return post;
  }
);

export const toggleLike = createAsyncThunk(
  'posts/toggleLike',
  async (postId: string) => {
    const userId = getCurrentUserId();
    const post = await getPostById(postId);
    
    if (post.likes.includes(userId)) {
      await PostService.unlikePost(postId, userId);
      return { postId, userId, action: 'unlike' };
    } else {
      await PostService.likePost(postId, userId);
      return { postId, userId, action: 'like' };
    }
  }
);

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    resetPosts: (state) => {
      state.posts = [];
      state.lastDoc = null;
      state.hasMore = true;
    },
    updatePost: (state, action: PayloadAction<Post>) => {
      const index = state.posts.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.posts[index] = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch posts
      .addCase(fetchPosts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = [...state.posts, ...action.payload.posts];
        state.lastDoc = action.payload.lastDoc;
        state.hasMore = action.payload.hasMore;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '加载失败';
      })
      // Create post
      .addCase(createPost.fulfilled, (state, action) => {
        state.posts.unshift(action.payload);
      })
      // Toggle like
      .addCase(toggleLike.fulfilled, (state, action) => {
        const { postId, userId, action: likeAction } = action.payload;
        const post = state.posts.find(p => p.id === postId);
        if (post) {
          if (likeAction === 'like') {
            post.likes.push(userId);
          } else {
            post.likes = post.likes.filter(id => id !== userId);
          }
        }
      });
  },
});

export const { resetPosts, updatePost } = postsSlice.actions;
export default postsSlice.reducer;

// 4. 自定义Hooks
import { useEffect, useCallback, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { useInView } from 'react-intersection-observer';

export function useInfinitePosts() {
  const dispatch = useAppDispatch();
  const { posts, loading, hasMore } = useAppSelector((state) => state.posts);
  const { ref, inView } = useInView();
  const loadingRef = useRef(false);
  
  useEffect(() => {
    if (inView && hasMore && !loading && !loadingRef.current) {
      loadingRef.current = true;
      dispatch(fetchPosts()).finally(() => {
        loadingRef.current = false;
      });
    }
  }, [inView, hasMore, loading, dispatch]);
  
  const refresh = useCallback(() => {
    dispatch(resetPosts());
    dispatch(fetchPosts());
  }, [dispatch]);
  
  return {
    posts,
    loading,
    hasMore,
    loadMoreRef: ref,
    refresh,
  };
}

// 5. 创建帖子组件
import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAppDispatch } from '../../app/hooks';
import { createPost } from './postsSlice';

const Container = styled(motion.div)`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 120px;
  padding: 12px;
  border: 1px solid #e1e8ed;
  border-radius: 8px;
  resize: vertical;
  font-size: 16px;
  font-family: inherit;
  
  &:focus {
    outline: none;
    border-color: #1da1f2;
  }
`;

const ImagePreview = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 10px;
  margin-top: 10px;
`;

const PreviewImage = styled.div`
  position: relative;
  width: 100%;
  padding-bottom: 100%;
  
  img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 8px;
  }
  
  button {
    position: absolute;
    top: 5px;
    right: 5px;
    background: rgba(0, 0, 0, 0.5);
    color: white;
    border: none;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    cursor: pointer;
  }
`;

const Actions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Button = styled.button`
  padding: 8px 16px;
  background: #1da1f2;
  color: white;
  border: none;
  border-radius: 20px;
  font-weight: 600;
  cursor: pointer;
  
  &:hover {
    background: #1a91da;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const schema = yup.object({
  content: yup.string().required('内容不能为空').max(500, '内容不能超过500字'),
});

export function CreatePost() {
  const dispatch = useAppDispatch();
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length > 4) {
      alert('最多只能上传4张图片');
      return;
    }
    
    setImages([...images, ...files]);
    
    // 生成预览
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };
  
  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
    setPreviews(previews.filter((_, i) => i !== index));
  };
  
  const onSubmit = async (data: { content: string }) => {
    setIsSubmitting(true);
    try {
      await dispatch(createPost({ content: data.content, images })).unwrap();
      reset();
      setImages([]);
      setPreviews([]);
    } catch (error) {
      console.error('Failed to create post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Container
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Form onSubmit={handleSubmit(onSubmit)}>
        <TextArea
          {...register('content')}
          placeholder="分享你的想法..."
          disabled={isSubmitting}
        />
        {errors.content && (
          <span style={{ color: 'red', fontSize: '14px' }}>
            {errors.content.message}
          </span>
        )}
        
        {previews.length > 0 && (
          <ImagePreview>
            {previews.map((preview, index) => (
              <PreviewImage key={index}>
                <img src={preview} alt={`Preview ${index + 1}`} />
                <button onClick={() => removeImage(index)}>×</button>
              </PreviewImage>
            ))}
          </ImagePreview>
        )}
        
        <Actions>
          <label style={{ cursor: 'pointer' }}>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: 'none' }}
              disabled={isSubmitting}
            />
            <span>📷 添加图片</span>
          </label>
          
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? '发布中...' : '发布'}
          </Button>
        </Actions>
      </Form>
    </Container>
  );
}

// 6. 帖子卡片组件
const PostCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const PostHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 12px;
`;

const Avatar = styled.img`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  margin-right: 12px;
`;

const PostContent = styled.div`
  font-size: 16px;
  line-height: 1.5;
  margin-bottom: 12px;
  white-space: pre-wrap;
`;

const PostImages = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  margin-bottom: 12px;
  
  img {
    width: 100%;
    height: 200px;
    object-fit: cover;
    border-radius: 8px;
    cursor: pointer;
  }
`;

const PostActions = styled.div`
  display: flex;
  justify-content: space-around;
  padding-top: 12px;
  border-top: 1px solid #e1e8ed;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: #536471;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.2s;
  
  &:hover {
    background: #f7f9fa;
    color: #1da1f2;
  }
  
  &.liked {
    color: #e0245e;
  }
`;

export function PostCardComponent({ post }: { post: Post }) {
  const dispatch = useAppDispatch();
  const currentUserId = useAppSelector(state => state.auth.user?.uid);
  const isLiked = post.likes.includes(currentUserId || '');
  
  const handleLike = () => {
    dispatch(toggleLike(post.id));
  };
  
  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    return date.toLocaleDateString();
  };
  
  return (
    <PostCard>
      <PostHeader>
        <Avatar 
          src={post.author?.photoURL || '/default-avatar.png'} 
          alt={post.author?.displayName} 
        />
        <div>
          <div style={{ fontWeight: 600 }}>{post.author?.displayName}</div>
          <div style={{ color: '#536471', fontSize: '14px' }}>
            {formatDate(post.createdAt)}
          </div>
        </div>
      </PostHeader>
      
      <PostContent>{post.content}</PostContent>
      
      {post.images && post.images.length > 0 && (
        <PostImages>
          {post.images.map((image, index) => (
            <img key={index} src={image} alt={`Post image ${index + 1}`} />
          ))}
        </PostImages>
      )}
      
      <PostActions>
        <ActionButton onClick={handleLike} className={isLiked ? 'liked' : ''}>
          <span>{isLiked ? '❤️' : '🤍'}</span>
          <span>{post.likes.length}</span>
        </ActionButton>
        
        <ActionButton>
          <span>💬</span>
          <span>{post.comments}</span>
        </ActionButton>
        
        <ActionButton>
          <span>🔗</span>
          <span>分享</span>
        </ActionButton>
      </PostActions>
    </PostCard>
  );
}