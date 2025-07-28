---
day: 37
exerciseTitle: "React生态系统工具实践"
approach: "对比不同UI库实现，使用Zustand状态管理，创建Framer Motion动画"
files:
  - path: "RegisterMUI.jsx"
    language: "jsx"
    description: "Material-UI注册表单"
  - path: "RegisterAntd.jsx"
    language: "jsx"
    description: "Ant Design注册表单"
  - path: "RegisterChakra.jsx"
    language: "jsx"
    description: "Chakra UI注册表单"
  - path: "cartStore.js"
    language: "javascript"
    description: "Zustand购物车状态管理"
  - path: "ProductShowcase.jsx"
    language: "jsx"
    description: "Framer Motion产品展示"
keyTakeaways:
  - "不同UI库各有优势，选择需考虑项目需求"
  - "Zustand提供简洁的状态管理方案"
  - "Framer Motion使动画实现更加声明式"
  - "性能优化需要在功能和体验间平衡"
  - "工具选择影响开发效率和维护成本"
---

# Day 37 解决方案：React生态系统工具

## 练习1：UI组件库对比

### Material-UI实现

```jsx
// RegisterMUI.jsx
import React, { useState } from 'react';
import {
  ThemeProvider,
  createTheme,
  Container,
  Paper,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Typography,
  Box,
  Alert,
  CircularProgress,
  AppBar,
  Toolbar,
  Grid,
  Link,
  FormHelperText
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

const schema = yup.object({
  firstName: yup.string().min(2, '至少2个字符').required('名字是必填项'),
  lastName: yup.string().min(2, '至少2个字符').required('姓氏是必填项'),
  email: yup.string().email('邮箱格式不正确').required('邮箱是必填项'),
  password: yup.string().min(8, '密码至少8位').required('密码是必填项'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password')], '密码不匹配')
    .required('请确认密码'),
  country: yup.string().required('请选择国家'),
  agreeToTerms: yup.boolean().oneOf([true], '请同意用户协议'),
});

export function RegisterMUI() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      country: '',
      agreeToTerms: false,
    },
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('MUI Form Data:', data);
    setIsSubmitting(false);
    setSubmitSuccess(true);
    setTimeout(() => {
      setSubmitSuccess(false);
      reset();
    }, 3000);
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Material-UI 注册
            </Typography>
          </Toolbar>
        </AppBar>

        <Container component="main" maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
          <Paper elevation={3} sx={{ p: 4 }}>
            <Typography component="h1" variant="h4" align="center" gutterBottom>
              创建账户
            </Typography>

            {submitSuccess && (
              <Alert severity="success" sx={{ mb: 2 }}>
                注册成功！欢迎加入我们。
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="firstName"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="名字"
                        error={!!errors.firstName}
                        helperText={errors.firstName?.message}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Controller
                    name="lastName"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="姓氏"
                        error={!!errors.lastName}
                        helperText={errors.lastName?.message}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Controller
                    name="email"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="邮箱地址"
                        type="email"
                        error={!!errors.email}
                        helperText={errors.email?.message}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Controller
                    name="password"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="密码"
                        type="password"
                        error={!!errors.password}
                        helperText={errors.password?.message}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Controller
                    name="confirmPassword"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="确认密码"
                        type="password"
                        error={!!errors.confirmPassword}
                        helperText={errors.confirmPassword?.message}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Controller
                    name="country"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth error={!!errors.country}>
                        <InputLabel>国家</InputLabel>
                        <Select {...field} label="国家">
                          <MenuItem value="">请选择</MenuItem>
                          <MenuItem value="cn">中国</MenuItem>
                          <MenuItem value="us">美国</MenuItem>
                          <MenuItem value="uk">英国</MenuItem>
                          <MenuItem value="jp">日本</MenuItem>
                        </Select>
                        {errors.country && (
                          <FormHelperText>{errors.country.message}</FormHelperText>
                        )}
                      </FormControl>
                    )}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Controller
                    name="agreeToTerms"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={<Checkbox {...field} />}
                        label="我同意用户协议和隐私政策"
                      />
                    )}
                  />
                  {errors.agreeToTerms && (
                    <FormHelperText error>
                      {errors.agreeToTerms.message}
                    </FormHelperText>
                  )}
                </Grid>
              </Grid>

              <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <CircularProgress size={24} /> : '注册'}
                </Button>
                <Button
                  type="button"
                  fullWidth
                  variant="outlined"
                  onClick={() => reset()}
                  disabled={isSubmitting}
                >
                  重置
                </Button>
              </Box>
            </Box>
          </Paper>
        </Container>

        <Box component="footer" sx={{ py: 3, px: 2, mt: 'auto', backgroundColor: 'background.paper' }}>
          <Container maxWidth="sm">
            <Typography variant="body2" color="text.secondary" align="center">
              {'© 2024 Material-UI Demo. '}
              <Link color="inherit" href="#">
                隐私政策
              </Link>
              {' | '}
              <Link color="inherit" href="#">
                使用条款
              </Link>
            </Typography>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
```

### Ant Design实现

```jsx
// RegisterAntd.jsx
import React, { useState } from 'react';
import {
  Form,
  Input,
  Button,
  Select,
  Checkbox,
  Card,
  Layout,
  Typography,
  Space,
  Row,
  Col,
  message,
  Spin,
} from 'antd';
import {
  UserOutlined,
  MailOutlined,
  LockOutlined,
  GlobalOutlined,
} from '@ant-design/icons';

const { Header, Content, Footer } = Layout;
const { Title, Link } = Typography;
const { Option } = Select;

export function RegisterAntd() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('Ant Design Form Data:', values);
    message.success('注册成功！欢迎加入我们。');
    setLoading(false);
    form.resetFields();
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ background: '#fff', padding: 0 }}>
        <div style={{ padding: '0 50px' }}>
          <Title level={3} style={{ margin: '16px 0' }}>
            Ant Design 注册
          </Title>
        </div>
      </Header>

      <Content style={{ padding: '50px' }}>
        <Row justify="center">
          <Col xs={24} sm={20} md={16} lg={12} xl={10}>
            <Card title="创建账户" bordered={false}>
              <Spin spinning={loading}>
                <Form
                  form={form}
                  name="register"
                  onFinish={onFinish}
                  layout="vertical"
                  requiredMark="optional"
                >
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="firstName"
                        label="名字"
                        rules={[
                          { required: true, message: '请输入名字' },
                          { min: 2, message: '至少2个字符' },
                        ]}
                      >
                        <Input
                          prefix={<UserOutlined />}
                          placeholder="请输入名字"
                        />
                      </Form.Item>
                    </Col>

                    <Col span={12}>
                      <Form.Item
                        name="lastName"
                        label="姓氏"
                        rules={[
                          { required: true, message: '请输入姓氏' },
                          { min: 2, message: '至少2个字符' },
                        ]}
                      >
                        <Input
                          prefix={<UserOutlined />}
                          placeholder="请输入姓氏"
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item
                    name="email"
                    label="邮箱"
                    rules={[
                      { required: true, message: '请输入邮箱' },
                      { type: 'email', message: '邮箱格式不正确' },
                    ]}
                  >
                    <Input
                      prefix={<MailOutlined />}
                      placeholder="请输入邮箱地址"
                    />
                  </Form.Item>

                  <Form.Item
                    name="password"
                    label="密码"
                    rules={[
                      { required: true, message: '请输入密码' },
                      { min: 8, message: '密码至少8位' },
                    ]}
                    hasFeedback
                  >
                    <Input.Password
                      prefix={<LockOutlined />}
                      placeholder="请输入密码"
                    />
                  </Form.Item>

                  <Form.Item
                    name="confirmPassword"
                    label="确认密码"
                    dependencies={['password']}
                    hasFeedback
                    rules={[
                      { required: true, message: '请确认密码' },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue('password') === value) {
                            return Promise.resolve();
                          }
                          return Promise.reject(new Error('密码不匹配'));
                        },
                      }),
                    ]}
                  >
                    <Input.Password
                      prefix={<LockOutlined />}
                      placeholder="请再次输入密码"
                    />
                  </Form.Item>

                  <Form.Item
                    name="country"
                    label="国家"
                    rules={[{ required: true, message: '请选择国家' }]}
                  >
                    <Select
                      placeholder="请选择国家"
                      prefix={<GlobalOutlined />}
                    >
                      <Option value="cn">中国</Option>
                      <Option value="us">美国</Option>
                      <Option value="uk">英国</Option>
                      <Option value="jp">日本</Option>
                    </Select>
                  </Form.Item>

                  <Form.Item
                    name="agreeToTerms"
                    valuePropName="checked"
                    rules={[
                      {
                        validator: (_, value) =>
                          value
                            ? Promise.resolve()
                            : Promise.reject(new Error('请同意用户协议')),
                      },
                    ]}
                  >
                    <Checkbox>
                      我已阅读并同意
                      <Link href="#">用户协议</Link>和
                      <Link href="#">隐私政策</Link>
                    </Checkbox>
                  </Form.Item>

                  <Form.Item>
                    <Space style={{ width: '100%' }} size="large">
                      <Button type="primary" htmlType="submit" block>
                        注册
                      </Button>
                      <Button htmlType="button" onClick={() => form.resetFields()} block>
                        重置
                      </Button>
                    </Space>
                  </Form.Item>
                </Form>
              </Spin>
            </Card>
          </Col>
        </Row>
      </Content>

      <Footer style={{ textAlign: 'center' }}>
        <Space split="|">
          <span>© 2024 Ant Design Demo</span>
          <Link href="#">隐私政策</Link>
          <Link href="#">使用条款</Link>
        </Space>
      </Footer>
    </Layout>
  );
}
```

### Chakra UI实现

```jsx
// RegisterChakra.jsx
import React from 'react';
import {
  ChakraProvider,
  Box,
  Container,
  VStack,
  HStack,
  Heading,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Checkbox,
  Button,
  Text,
  Link,
  Alert,
  AlertIcon,
  useToast,
  Flex,
  Spacer,
  extendTheme,
} from '@chakra-ui/react';
import { EmailIcon, LockIcon, AtSignIcon } from '@chakra-ui/icons';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

const theme = extendTheme({
  colors: {
    brand: {
      50: '#e3f2fd',
      100: '#bbdefb',
      200: '#90caf9',
      300: '#64b5f6',
      400: '#42a5f5',
      500: '#2196f3',
      600: '#1e88e5',
      700: '#1976d2',
      800: '#1565c0',
      900: '#0d47a1',
    },
  },
});

const schema = yup.object({
  firstName: yup.string().min(2, '至少2个字符').required('名字是必填项'),
  lastName: yup.string().min(2, '至少2个字符').required('姓氏是必填项'),
  email: yup.string().email('邮箱格式不正确').required('邮箱是必填项'),
  password: yup.string().min(8, '密码至少8位').required('密码是必填项'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password')], '密码不匹配')
    .required('请确认密码'),
  country: yup.string().required('请选择国家'),
  agreeToTerms: yup.boolean().oneOf([true], '请同意用户协议'),
});

export function RegisterChakra() {
  const toast = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('Chakra UI Form Data:', data);
    
    toast({
      title: '注册成功',
      description: '欢迎加入我们！',
      status: 'success',
      duration: 5000,
      isClosable: true,
    });
    
    reset();
  };

  return (
    <ChakraProvider theme={theme}>
      <Box minH="100vh" bg="gray.50">
        {/* Header */}
        <Box bg="white" px={4} boxShadow="sm">
          <Flex h={16} alignItems="center">
            <Heading size="md" color="brand.700">
              Chakra UI 注册
            </Heading>
          </Flex>
        </Box>

        {/* Main Content */}
        <Container maxW="container.sm" py={10}>
          <Box bg="white" p={8} borderRadius="lg" boxShadow="lg">
            <VStack spacing={6} align="stretch">
              <Heading textAlign="center" size="xl" color="gray.700">
                创建账户
              </Heading>

              <form onSubmit={handleSubmit(onSubmit)}>
                <VStack spacing={4}>
                  <HStack spacing={4} w="full">
                    <FormControl isInvalid={errors.firstName}>
                      <FormLabel>名字</FormLabel>
                      <InputGroup>
                        <InputLeftElement pointerEvents="none">
                          <AtSignIcon color="gray.300" />
                        </InputLeftElement>
                        <Input
                          {...register('firstName')}
                          placeholder="请输入名字"
                        />
                      </InputGroup>
                      <FormErrorMessage>
                        {errors.firstName?.message}
                      </FormErrorMessage>
                    </FormControl>

                    <FormControl isInvalid={errors.lastName}>
                      <FormLabel>姓氏</FormLabel>
                      <InputGroup>
                        <InputLeftElement pointerEvents="none">
                          <AtSignIcon color="gray.300" />
                        </InputLeftElement>
                        <Input
                          {...register('lastName')}
                          placeholder="请输入姓氏"
                        />
                      </InputGroup>
                      <FormErrorMessage>
                        {errors.lastName?.message}
                      </FormErrorMessage>
                    </FormControl>
                  </HStack>

                  <FormControl isInvalid={errors.email}>
                    <FormLabel>邮箱地址</FormLabel>
                    <InputGroup>
                      <InputLeftElement pointerEvents="none">
                        <EmailIcon color="gray.300" />
                      </InputLeftElement>
                      <Input
                        {...register('email')}
                        type="email"
                        placeholder="请输入邮箱地址"
                      />
                    </InputGroup>
                    <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
                  </FormControl>

                  <FormControl isInvalid={errors.password}>
                    <FormLabel>密码</FormLabel>
                    <InputGroup>
                      <InputLeftElement pointerEvents="none">
                        <LockIcon color="gray.300" />
                      </InputLeftElement>
                      <Input
                        {...register('password')}
                        type="password"
                        placeholder="请输入密码"
                      />
                    </InputGroup>
                    <FormErrorMessage>
                      {errors.password?.message}
                    </FormErrorMessage>
                  </FormControl>

                  <FormControl isInvalid={errors.confirmPassword}>
                    <FormLabel>确认密码</FormLabel>
                    <InputGroup>
                      <InputLeftElement pointerEvents="none">
                        <LockIcon color="gray.300" />
                      </InputLeftElement>
                      <Input
                        {...register('confirmPassword')}
                        type="password"
                        placeholder="请再次输入密码"
                      />
                    </InputGroup>
                    <FormErrorMessage>
                      {errors.confirmPassword?.message}
                    </FormErrorMessage>
                  </FormControl>

                  <FormControl isInvalid={errors.country}>
                    <FormLabel>国家</FormLabel>
                    <Select {...register('country')} placeholder="请选择国家">
                      <option value="cn">中国</option>
                      <option value="us">美国</option>
                      <option value="uk">英国</option>
                      <option value="jp">日本</option>
                    </Select>
                    <FormErrorMessage>
                      {errors.country?.message}
                    </FormErrorMessage>
                  </FormControl>

                  <FormControl isInvalid={errors.agreeToTerms}>
                    <Checkbox {...register('agreeToTerms')}>
                      我已阅读并同意
                      <Link color="brand.500" href="#">
                        用户协议
                      </Link>
                      和
                      <Link color="brand.500" href="#">
                        隐私政策
                      </Link>
                    </Checkbox>
                    <FormErrorMessage>
                      {errors.agreeToTerms?.message}
                    </FormErrorMessage>
                  </FormControl>

                  <HStack spacing={4} w="full">
                    <Button
                      type="submit"
                      colorScheme="brand"
                      isLoading={isSubmitting}
                      loadingText="注册中..."
                      flex={1}
                    >
                      注册
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => reset()}
                      isDisabled={isSubmitting}
                      flex={1}
                    >
                      重置
                    </Button>
                  </HStack>
                </VStack>
              </form>
            </VStack>
          </Box>
        </Container>

        {/* Footer */}
        <Box as="footer" bg="white" py={6} mt={10}>
          <Container maxW="container.lg">
            <Text textAlign="center" color="gray.600">
              © 2024 Chakra UI Demo |{' '}
              <Link color="brand.500" href="#">
                隐私政策
              </Link>{' '}
              |{' '}
              <Link color="brand.500" href="#">
                使用条款
              </Link>
            </Text>
          </Container>
        </Box>
      </Box>
    </ChakraProvider>
  );
}
```

### UI库对比分析

| 特性 | Material-UI | Ant Design | Chakra UI |
|-----|------------|------------|-----------|
| Bundle大小 | ~130KB | ~340KB | ~100KB |
| 组件丰富度 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| 自定义难度 | 中等 | 较难 | 简单 |
| TypeScript支持 | 优秀 | 优秀 | 优秀 |
| 主题系统 | 强大 | 一般 | 强大 |
| 开发体验 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 文档质量 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 社区活跃度 | 非常高 | 高 | 高 |

## 练习2：Zustand购物车实现

```javascript
// stores/cartStore.js
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

const useCartStore = create(
  devtools(
    persist(
      immer((set, get) => ({
        // 状态
        items: [],
        shipping: 10,
        taxRate: 0.08,
        coupon: null,
        
        // 计算属性
        get subtotal() {
          return get().items.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          );
        },
        
        get tax() {
          return get().subtotal * get().taxRate;
        },
        
        get total() {
          const { subtotal, tax, shipping, coupon } = get();
          let total = subtotal + tax + shipping;
          
          if (coupon) {
            if (coupon.type === 'percentage') {
              total *= (1 - coupon.value / 100);
            } else {
              total -= coupon.value;
            }
          }
          
          return Math.max(0, total);
        },
        
        get itemCount() {
          return get().items.reduce((sum, item) => sum + item.quantity, 0);
        },
        
        // Actions
        addItem: (product) =>
          set((state) => {
            const existingItem = state.items.find(
              item => item.id === product.id
            );
            
            if (existingItem) {
              existingItem.quantity += 1;
            } else {
              state.items.push({
                ...product,
                quantity: 1,
                addedAt: Date.now(),
              });
            }
          }),
        
        removeItem: (productId) =>
          set((state) => {
            state.items = state.items.filter(item => item.id !== productId);
          }),
        
        updateQuantity: (productId, quantity) =>
          set((state) => {
            if (quantity <= 0) {
              state.items = state.items.filter(item => item.id !== productId);
            } else {
              const item = state.items.find(item => item.id === productId);
              if (item) {
                item.quantity = quantity;
              }
            }
          }),
        
        clearCart: () =>
          set((state) => {
            state.items = [];
            state.coupon = null;
          }),
        
        applyCoupon: (couponCode) =>
          set((state) => {
            // 模拟优惠券验证
            const validCoupons = {
              'SAVE10': { type: 'percentage', value: 10 },
              'SAVE20': { type: 'percentage', value: 20 },
              'MINUS5': { type: 'fixed', value: 5 },
            };
            
            const coupon = validCoupons[couponCode];
            if (coupon) {
              state.coupon = { ...coupon, code: couponCode };
              return true;
            }
            return false;
          }),
        
        removeCoupon: () =>
          set((state) => {
            state.coupon = null;
          }),
        
        updateShipping: (method) =>
          set((state) => {
            const shippingRates = {
              standard: 10,
              express: 20,
              overnight: 35,
            };
            state.shipping = shippingRates[method] || 10;
          }),
      })),
      {
        name: 'shopping-cart',
        partialize: (state) => ({
          items: state.items,
          coupon: state.coupon,
        }),
      }
    ),
    {
      name: 'CartStore',
    }
  )
);

// stores/userStore.js
const useUserStore = create(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        addresses: [],
        orders: [],
        favorites: [],
        
        login: async (credentials) => {
          // 模拟登录
          const user = {
            id: 1,
            name: 'John Doe',
            email: credentials.email,
          };
          set({ user });
          return user;
        },
        
        logout: () => {
          set({ user: null });
        },
        
        addAddress: (address) =>
          set((state) => ({
            addresses: [...state.addresses, { ...address, id: Date.now() }],
          })),
        
        updateAddress: (id, updates) =>
          set((state) => ({
            addresses: state.addresses.map(addr =>
              addr.id === id ? { ...addr, ...updates } : addr
            ),
          })),
        
        deleteAddress: (id) =>
          set((state) => ({
            addresses: state.addresses.filter(addr => addr.id !== id),
          })),
        
        toggleFavorite: (productId) =>
          set((state) => {
            const index = state.favorites.indexOf(productId);
            if (index > -1) {
              return {
                favorites: state.favorites.filter(id => id !== productId),
              };
            } else {
              return {
                favorites: [...state.favorites, productId],
              };
            }
          }),
        
        isFavorite: (productId) => {
          return get().favorites.includes(productId);
        },
        
        createOrder: (orderData) =>
          set((state) => {
            const order = {
              id: Date.now(),
              ...orderData,
              status: 'pending',
              createdAt: new Date(),
            };
            return {
              orders: [order, ...state.orders],
            };
          }),
      }),
      {
        name: 'user-data',
      }
    )
  )
);

// stores/productStore.js
const useProductStore = create((set, get) => ({
  products: [],
  loading: false,
  error: null,
  filters: {
    category: '',
    minPrice: 0,
    maxPrice: 1000,
    search: '',
    sortBy: 'name',
  },
  
  fetchProducts: async () => {
    set({ loading: true, error: null });
    try {
      // 模拟API调用
      const products = generateMockProducts(50);
      set({ products, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },
  
  get filteredProducts() {
    const { products, filters } = get();
    
    return products
      .filter(product => {
        if (filters.category && product.category !== filters.category) {
          return false;
        }
        if (product.price < filters.minPrice || product.price > filters.maxPrice) {
          return false;
        }
        if (filters.search && !product.name.toLowerCase().includes(filters.search.toLowerCase())) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        switch (filters.sortBy) {
          case 'price-asc':
            return a.price - b.price;
          case 'price-desc':
            return b.price - a.price;
          case 'name':
          default:
            return a.name.localeCompare(b.name);
        }
      });
  },
  
  updateFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    })),
  
  updateStock: (productId, quantity) =>
    set((state) => ({
      products: state.products.map(product =>
        product.id === productId
          ? { ...product, stock: product.stock - quantity }
          : product
      ),
    })),
}));

function generateMockProducts(count) {
  const categories = ['电子产品', '服装', '图书', '家居', '食品'];
  const products = [];
  
  for (let i = 1; i <= count; i++) {
    products.push({
      id: i,
      name: `产品 ${i}`,
      price: Math.floor(Math.random() * 900) + 100,
      category: categories[Math.floor(Math.random() * categories.length)],
      image: `https://via.placeholder.com/300x200?text=Product+${i}`,
      description: `这是产品 ${i} 的详细描述`,
      stock: Math.floor(Math.random() * 50) + 10,
    });
  }
  
  return products;
}

export { useCartStore, useUserStore, useProductStore };
```

## 练习3：Framer Motion产品展示

```jsx
// ProductShowcase.jsx
import React, { useState, useRef, useEffect } from 'react';
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useSpring,
  useInView,
  useAnimation,
  useDragControls,
} from 'framer-motion';

// Hero Section with Parallax
function HeroSection() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 300], [0, 100]);
  const y2 = useTransform(scrollY, [0, 300], [0, -100]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  
  return (
    <motion.section className="hero-section">
      <motion.div
        className="hero-background"
        style={{ y: y1, opacity }}
      />
      
      <motion.div
        className="hero-content"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.h1
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          创新产品展示
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          探索我们的最新产品系列
        </motion.p>
        
        <motion.button
          className="cta-button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          立即探索
        </motion.button>
      </motion.div>
      
      <motion.div
        className="hero-image"
        style={{ y: y2 }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
      />
    </motion.section>
  );
}

// Product Grid with Stagger Animation
function ProductGrid({ products }) {
  const controls = useAnimation();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  
  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
      },
    },
  };
  
  return (
    <motion.section
      ref={ref}
      className="product-grid"
      variants={containerVariants}
      initial="hidden"
      animate={controls}
    >
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          variants={itemVariants}
        />
      ))}
    </motion.section>
  );
}

// Flippable Product Card
function ProductCard({ product, variants }) {
  const [isFlipped, setIsFlipped] = useState(false);
  
  return (
    <motion.div
      className="product-card-container"
      variants={variants}
      whileHover={{ y: -10 }}
    >
      <motion.div
        className="product-card"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6 }}
        style={{ transformStyle: 'preserve-3d' }}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        {/* Front Side */}
        <motion.div
          className="card-face card-front"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <motion.img
            src={product.image}
            alt={product.name}
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.3 }}
          />
          <h3>{product.name}</h3>
          <p className="price">${product.price}</p>
        </motion.div>
        
        {/* Back Side */}
        <motion.div
          className="card-face card-back"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <h3>{product.name}</h3>
          <p>{product.description}</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation();
              console.log('Add to cart:', product);
            }}
          >
            加入购物车
          </motion.button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

// Feature Section with Scroll Animation
function FeatureSection() {
  const features = [
    { icon: '🚀', title: '快速交付', description: '24小时内发货' },
    { icon: '🔒', title: '安全支付', description: '加密保护您的信息' },
    { icon: '♻️', title: '环保包装', description: '可回收材料' },
    { icon: '🎯', title: '质量保证', description: '30天无理由退换' },
  ];
  
  return (
    <motion.section className="feature-section">
      <motion.h2
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
      >
        为什么选择我们
      </motion.h2>
      
      <div className="features-grid">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            className="feature-card"
            initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true }}
            whileHover={{
              scale: 1.05,
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
            }}
          >
            <motion.div
              className="feature-icon"
              animate={{
                rotate: [0, 10, -10, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: 'reverse',
              }}
            >
              {feature.icon}
            </motion.div>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}

// Draggable Testimonials Carousel
function TestimonialsCarousel() {
  const testimonials = [
    { id: 1, name: '张三', text: '产品质量非常好，服务也很棒！', rating: 5 },
    { id: 2, name: '李四', text: '快递速度超快，包装很用心。', rating: 5 },
    { id: 3, name: '王五', text: '性价比很高，会继续购买。', rating: 4 },
  ];
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const dragControls = useDragControls();
  
  const handleDragEnd = (event, info) => {
    if (info.offset.x < -100 && currentIndex < testimonials.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else if (info.offset.x > 100 && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };
  
  return (
    <motion.section className="testimonials-section">
      <h2>客户评价</h2>
      
      <div className="testimonials-container">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            className="testimonial-card"
            drag="x"
            dragControls={dragControls}
            dragConstraints={{ left: -200, right: 200 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <div className="stars">
              {'⭐'.repeat(testimonials[currentIndex].rating)}
            </div>
            <p>"{testimonials[currentIndex].text}"</p>
            <h4>- {testimonials[currentIndex].name}</h4>
          </motion.div>
        </AnimatePresence>
        
        <div className="testimonial-dots">
          {testimonials.map((_, index) => (
            <motion.button
              key={index}
              className={`dot ${index === currentIndex ? 'active' : ''}`}
              onClick={() => setCurrentIndex(index)}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            />
          ))}
        </div>
      </div>
    </motion.section>
  );
}

// Main Component
export function ProductShowcase() {
  const products = [
    { id: 1, name: '智能手表', price: 299, image: '/watch.jpg', description: '追踪您的健康数据' },
    { id: 2, name: '无线耳机', price: 199, image: '/headphones.jpg', description: '沉浸式音频体验' },
    { id: 3, name: '智能音箱', price: 149, image: '/speaker.jpg', description: '语音控制您的家' },
    { id: 4, name: '平板电脑', price: 599, image: '/tablet.jpg', description: '工作娱乐两不误' },
    { id: 5, name: '智能灯泡', price: 49, image: '/bulb.jpg', description: '个性化照明方案' },
    { id: 6, name: '安全摄像头', price: 129, image: '/camera.jpg', description: '全天候守护' },
  ];
  
  return (
    <motion.div
      className="product-showcase"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <HeroSection />
      <ProductGrid products={products} />
      <FeatureSection />
      <TestimonialsCarousel />
      
      {/* Smooth Scroll Navigation */}
      <motion.nav
        className="floating-nav"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ delay: 1, type: 'spring' }}
      >
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          回到顶部
        </motion.button>
      </motion.nav>
    </motion.div>
  );
}
```

## 关键要点

1. **UI库选择**
   - Material-UI适合需要严格设计规范的企业应用
   - Ant Design提供最丰富的组件，适合快速开发
   - Chakra UI最灵活，适合需要高度自定义的项目

2. **状态管理**
   - Zustand相比Redux更轻量，API更简洁
   - 使用immer中间件简化不可变更新
   - persist中间件实现自动持久化
   - 计算属性通过getter实现

3. **动画实现**
   - Framer Motion的声明式API让复杂动画变简单
   - 合理使用动画variants复用动画配置
   - 注意性能，避免过度动画
   - 手势交互增强用户体验

4. **性能优化**
   - 按需导入减小bundle体积
   - 使用React.memo避免不必要的重渲染
   - 虚拟化长列表提升性能
   - 代码分割延迟加载非关键资源