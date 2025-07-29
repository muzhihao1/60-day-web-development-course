// devconnect-auth.tsx - DevConnect认证系统代码

// 1. 认证Context和Provider
import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
} from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (data: Partial<User>) => Promise<void>;
  updateUserPassword: (currentPassword: string, newPassword: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithGithub: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 监听认证状态变化
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // 获取用户详细信息
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setCurrentUser({
            uid: user.uid,
            email: user.email!,
            displayName: user.displayName!,
            photoURL: user.photoURL,
            ...userDoc.data(),
          } as User);
        } else {
          // 首次登录，创建用户文档
          const newUser = {
            uid: user.uid,
            email: user.email!,
            displayName: user.displayName || 'Anonymous',
            photoURL: user.photoURL,
            bio: '',
            followers: [],
            following: [],
            createdAt: new Date(),
          };
          await setDoc(doc(db, 'users', user.uid), newUser);
          setCurrentUser(newUser);
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // 邮箱密码登录
  async function login(email: string, password: string) {
    await signInWithEmailAndPassword(auth, email, password);
  }

  // 注册新用户
  async function register(email: string, password: string, displayName: string) {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(user, { displayName });
    
    // 创建用户文档
    const newUser = {
      uid: user.uid,
      email: user.email!,
      displayName,
      photoURL: null,
      bio: '',
      followers: [],
      following: [],
      createdAt: new Date(),
    };
    await setDoc(doc(db, 'users', user.uid), newUser);
  }

  // 登出
  async function logout() {
    await signOut(auth);
  }

  // 重置密码
  async function resetPassword(email: string) {
    await sendPasswordResetEmail(auth, email);
  }

  // 更新用户资料
  async function updateUserProfile(data: Partial<User>) {
    if (!currentUser) throw new Error('No user logged in');
    
    // 更新Firebase Auth
    if (data.displayName) {
      await updateProfile(auth.currentUser!, {
        displayName: data.displayName,
      });
    }
    
    // 更新Firestore
    await setDoc(doc(db, 'users', currentUser.uid), data, { merge: true });
    setCurrentUser({ ...currentUser, ...data });
  }

  // 更新密码
  async function updateUserPassword(currentPassword: string, newPassword: string) {
    if (!auth.currentUser || !auth.currentUser.email) {
      throw new Error('No user logged in');
    }
    
    // 重新认证
    const credential = EmailAuthProvider.credential(
      auth.currentUser.email,
      currentPassword
    );
    await reauthenticateWithCredential(auth.currentUser, credential);
    
    // 更新密码
    await updatePassword(auth.currentUser, newPassword);
  }

  // Google登录
  async function loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    const { user } = await signInWithPopup(auth, provider);
    
    // 检查用户是否存在
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (!userDoc.exists()) {
      // 创建新用户
      const newUser = {
        uid: user.uid,
        email: user.email!,
        displayName: user.displayName || 'Google User',
        photoURL: user.photoURL,
        bio: '',
        followers: [],
        following: [],
        createdAt: new Date(),
      };
      await setDoc(doc(db, 'users', user.uid), newUser);
    }
  }

  // GitHub登录
  async function loginWithGithub() {
    const provider = new GithubAuthProvider();
    const { user } = await signInWithPopup(auth, provider);
    
    // 检查用户是否存在
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (!userDoc.exists()) {
      // 创建新用户
      const newUser = {
        uid: user.uid,
        email: user.email!,
        displayName: user.displayName || 'GitHub User',
        photoURL: user.photoURL,
        bio: '',
        followers: [],
        following: [],
        createdAt: new Date(),
      };
      await setDoc(doc(db, 'users', user.uid), newUser);
    }
  }

  const value = {
    currentUser,
    loading,
    login,
    register,
    logout,
    resetPassword,
    updateUserProfile,
    updateUserPassword,
    loginWithGoogle,
    loginWithGithub,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

// 2. 登录组件
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
`;

const LoginCard = styled(motion.div)`
  background: white;
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
`;

const Title = styled.h1`
  text-align: center;
  margin-bottom: 32px;
  color: #333;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-weight: 500;
  color: #555;
`;

const Input = styled.input`
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s;
  
  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const ErrorMessage = styled.span`
  color: #e53e3e;
  font-size: 14px;
`;

const Button = styled.button`
  padding: 12px 24px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s;
  
  &:hover {
    background: #5a67d8;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  margin: 20px 0;
  
  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: #ddd;
  }
  
  span {
    padding: 0 16px;
    color: #999;
  }
`;

const SocialButton = styled(Button)`
  background: white;
  color: #333;
  border: 1px solid #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  
  &:hover {
    background: #f8f9fa;
  }
`;

const loginSchema = yup.object({
  email: yup.string().email('请输入有效的邮箱').required('邮箱是必填项'),
  password: yup.string().min(6, '密码至少6位').required('密码是必填项'),
});

export function LoginPage() {
  const navigate = useNavigate();
  const { login, loginWithGoogle, loginWithGithub } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(loginSchema),
  });
  
  const onSubmit = async (data: { email: string; password: string }) => {
    try {
      setError('');
      setLoading(true);
      await login(data.email, data.password);
      navigate('/');
    } catch (err: any) {
      setError(getAuthErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };
  
  const handleSocialLogin = async (provider: 'google' | 'github') => {
    try {
      setError('');
      setLoading(true);
      if (provider === 'google') {
        await loginWithGoogle();
      } else {
        await loginWithGithub();
      }
      navigate('/');
    } catch (err: any) {
      setError(getAuthErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Container>
      <LoginCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Title>欢迎回来</Title>
        
        <Form onSubmit={handleSubmit(onSubmit)}>
          {error && <ErrorMessage>{error}</ErrorMessage>}
          
          <InputGroup>
            <Label>邮箱</Label>
            <Input
              type="email"
              {...register('email')}
              placeholder="your@email.com"
            />
            {errors.email && <ErrorMessage>{errors.email.message}</ErrorMessage>}
          </InputGroup>
          
          <InputGroup>
            <Label>密码</Label>
            <Input
              type="password"
              {...register('password')}
              placeholder="••••••••"
            />
            {errors.password && <ErrorMessage>{errors.password.message}</ErrorMessage>}
          </InputGroup>
          
          <Link to="/forgot-password" style={{ textAlign: 'right', fontSize: '14px' }}>
            忘记密码？
          </Link>
          
          <Button type="submit" disabled={loading}>
            {loading ? '登录中...' : '登录'}
          </Button>
        </Form>
        
        <Divider>
          <span>或者</span>
        </Divider>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <SocialButton onClick={() => handleSocialLogin('google')} disabled={loading}>
            <img src="/google-icon.svg" alt="Google" width="20" />
            使用Google登录
          </SocialButton>
          
          <SocialButton onClick={() => handleSocialLogin('github')} disabled={loading}>
            <img src="/github-icon.svg" alt="GitHub" width="20" />
            使用GitHub登录
          </SocialButton>
        </div>
        
        <p style={{ textAlign: 'center', marginTop: '24px', color: '#666' }}>
          还没有账号？ <Link to="/register">立即注册</Link>
        </p>
      </LoginCard>
    </Container>
  );
}

// 3. 注册组件
const registerSchema = yup.object({
  displayName: yup.string().required('用户名是必填项'),
  email: yup.string().email('请输入有效的邮箱').required('邮箱是必填项'),
  password: yup.string().min(6, '密码至少6位').required('密码是必填项'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password')], '两次密码不一致')
    .required('请确认密码'),
});

export function RegisterPage() {
  const navigate = useNavigate();
  const { register: signUp } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(registerSchema),
  });
  
  const onSubmit = async (data: {
    displayName: string;
    email: string;
    password: string;
  }) => {
    try {
      setError('');
      setLoading(true);
      await signUp(data.email, data.password, data.displayName);
      navigate('/');
    } catch (err: any) {
      setError(getAuthErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Container>
      <LoginCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Title>创建账号</Title>
        
        <Form onSubmit={handleSubmit(onSubmit)}>
          {error && <ErrorMessage>{error}</ErrorMessage>}
          
          <InputGroup>
            <Label>用户名</Label>
            <Input
              {...register('displayName')}
              placeholder="选择一个用户名"
            />
            {errors.displayName && <ErrorMessage>{errors.displayName.message}</ErrorMessage>}
          </InputGroup>
          
          <InputGroup>
            <Label>邮箱</Label>
            <Input
              type="email"
              {...register('email')}
              placeholder="your@email.com"
            />
            {errors.email && <ErrorMessage>{errors.email.message}</ErrorMessage>}
          </InputGroup>
          
          <InputGroup>
            <Label>密码</Label>
            <Input
              type="password"
              {...register('password')}
              placeholder="至少6位字符"
            />
            {errors.password && <ErrorMessage>{errors.password.message}</ErrorMessage>}
          </InputGroup>
          
          <InputGroup>
            <Label>确认密码</Label>
            <Input
              type="password"
              {...register('confirmPassword')}
              placeholder="再次输入密码"
            />
            {errors.confirmPassword && <ErrorMessage>{errors.confirmPassword.message}</ErrorMessage>}
          </InputGroup>
          
          <Button type="submit" disabled={loading}>
            {loading ? '注册中...' : '注册'}
          </Button>
        </Form>
        
        <p style={{ textAlign: 'center', marginTop: '24px', color: '#666' }}>
          已有账号？ <Link to="/login">立即登录</Link>
        </p>
      </LoginCard>
    </Container>
  );
}

// 4. 受保护路由组件
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { currentUser } = useAuth();
  const location = useLocation();
  
  if (!currentUser) {
    // 重定向到登录页面，保存当前位置
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return <>{children}</>;
}

// 5. 密码重置组件
const resetPasswordSchema = yup.object({
  email: yup.string().email('请输入有效的邮箱').required('邮箱是必填项'),
});

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { resetPassword } = useAuth();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(resetPasswordSchema),
  });
  
  const onSubmit = async (data: { email: string }) => {
    try {
      setMessage('');
      setError('');
      setLoading(true);
      await resetPassword(data.email);
      setMessage('重置密码邮件已发送，请查收邮箱');
    } catch (err: any) {
      setError(getAuthErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Container>
      <LoginCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Title>重置密码</Title>
        
        <Form onSubmit={handleSubmit(onSubmit)}>
          {error && <ErrorMessage>{error}</ErrorMessage>}
          {message && <div style={{ color: '#48bb78' }}>{message}</div>}
          
          <InputGroup>
            <Label>邮箱</Label>
            <Input
              type="email"
              {...register('email')}
              placeholder="your@email.com"
            />
            {errors.email && <ErrorMessage>{errors.email.message}</ErrorMessage>}
          </InputGroup>
          
          <Button type="submit" disabled={loading}>
            {loading ? '发送中...' : '发送重置邮件'}
          </Button>
        </Form>
        
        <p style={{ textAlign: 'center', marginTop: '24px', color: '#666' }}>
          返回 <Link to="/login">登录</Link>
        </p>
      </LoginCard>
    </Container>
  );
}

// 6. 认证错误处理
function getAuthErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'auth/user-not-found':
      return '用户不存在';
    case 'auth/wrong-password':
      return '密码错误';
    case 'auth/email-already-in-use':
      return '邮箱已被注册';
    case 'auth/weak-password':
      return '密码强度不够';
    case 'auth/invalid-email':
      return '邮箱格式不正确';
    case 'auth/operation-not-allowed':
      return '操作不允许';
    case 'auth/popup-closed-by-user':
      return '登录窗口被关闭';
    case 'auth/account-exists-with-different-credential':
      return '该邮箱已使用其他方式注册';
    case 'auth/network-request-failed':
      return '网络连接失败';
    case 'auth/too-many-requests':
      return '请求过于频繁，请稍后再试';
    default:
      return '发生未知错误，请重试';
  }
}

// 7. 用户设置组件
const settingsSchema = yup.object({
  displayName: yup.string().required('用户名是必填项'),
  bio: yup.string().max(160, '简介不能超过160字'),
});

const passwordSchema = yup.object({
  currentPassword: yup.string().required('请输入当前密码'),
  newPassword: yup.string().min(6, '新密码至少6位').required('请输入新密码'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('newPassword')], '两次密码不一致')
    .required('请确认新密码'),
});

export function SettingsPage() {
  const { currentUser, updateUserProfile, updateUserPassword } = useAuth();
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  const profileForm = useForm({
    resolver: yupResolver(settingsSchema),
    defaultValues: {
      displayName: currentUser?.displayName || '',
      bio: currentUser?.bio || '',
    },
  });
  
  const passwordForm = useForm({
    resolver: yupResolver(passwordSchema),
  });
  
  const handleProfileSubmit = async (data: { displayName: string; bio: string }) => {
    try {
      setError('');
      setMessage('');
      setProfileLoading(true);
      await updateUserProfile(data);
      setMessage('个人资料已更新');
    } catch (err: any) {
      setError('更新失败，请重试');
    } finally {
      setProfileLoading(false);
    }
  };
  
  const handlePasswordSubmit = async (data: {
    currentPassword: string;
    newPassword: string;
  }) => {
    try {
      setError('');
      setMessage('');
      setPasswordLoading(true);
      await updateUserPassword(data.currentPassword, data.newPassword);
      setMessage('密码已更新');
      passwordForm.reset();
    } catch (err: any) {
      setError('当前密码错误');
    } finally {
      setPasswordLoading(false);
    }
  };
  
  return (
    <Container>
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 20px' }}>
        <Title>账号设置</Title>
        
        {message && <div style={{ color: '#48bb78', marginBottom: '20px' }}>{message}</div>}
        {error && <ErrorMessage style={{ marginBottom: '20px' }}>{error}</ErrorMessage>}
        
        <LoginCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ marginBottom: '20px' }}
        >
          <h2 style={{ marginBottom: '20px' }}>个人资料</h2>
          
          <Form onSubmit={profileForm.handleSubmit(handleProfileSubmit)}>
            <InputGroup>
              <Label>用户名</Label>
              <Input {...profileForm.register('displayName')} />
              {profileForm.formState.errors.displayName && (
                <ErrorMessage>{profileForm.formState.errors.displayName.message}</ErrorMessage>
              )}
            </InputGroup>
            
            <InputGroup>
              <Label>个人简介</Label>
              <textarea
                {...profileForm.register('bio')}
                style={{
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  resize: 'vertical',
                  minHeight: '100px',
                  fontFamily: 'inherit',
                }}
                placeholder="介绍一下自己..."
              />
              {profileForm.formState.errors.bio && (
                <ErrorMessage>{profileForm.formState.errors.bio.message}</ErrorMessage>
              )}
            </InputGroup>
            
            <Button type="submit" disabled={profileLoading}>
              {profileLoading ? '保存中...' : '保存资料'}
            </Button>
          </Form>
        </LoginCard>
        
        <LoginCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h2 style={{ marginBottom: '20px' }}>修改密码</h2>
          
          <Form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)}>
            <InputGroup>
              <Label>当前密码</Label>
              <Input type="password" {...passwordForm.register('currentPassword')} />
              {passwordForm.formState.errors.currentPassword && (
                <ErrorMessage>{passwordForm.formState.errors.currentPassword.message}</ErrorMessage>
              )}
            </InputGroup>
            
            <InputGroup>
              <Label>新密码</Label>
              <Input type="password" {...passwordForm.register('newPassword')} />
              {passwordForm.formState.errors.newPassword && (
                <ErrorMessage>{passwordForm.formState.errors.newPassword.message}</ErrorMessage>
              )}
            </InputGroup>
            
            <InputGroup>
              <Label>确认新密码</Label>
              <Input type="password" {...passwordForm.register('confirmPassword')} />
              {passwordForm.formState.errors.confirmPassword && (
                <ErrorMessage>{passwordForm.formState.errors.confirmPassword.message}</ErrorMessage>
              )}
            </InputGroup>
            
            <Button type="submit" disabled={passwordLoading}>
              {passwordLoading ? '更新中...' : '更新密码'}
            </Button>
          </Form>
        </LoginCard>
      </div>
    </Container>
  );
}