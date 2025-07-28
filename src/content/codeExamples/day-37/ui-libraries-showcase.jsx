// Day 37: UI组件库展示

import React, { useState } from 'react';

// ==========================================
// 1. Material-UI (MUI) 示例
// ==========================================

import {
  ThemeProvider,
  createTheme,
  styled,
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  TextField,
  Grid,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Avatar,
  Badge,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  LinearProgress,
  Rating,
  Slider,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
  Paper
} from '@mui/material';

import {
  Menu as MenuIcon,
  Home as HomeIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  ShoppingCart as ShoppingCartIcon
} from '@mui/icons-material';

// 自定义主题
const muiTheme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
});

// 自定义样式组件
const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
  },
}));

export function MaterialUIShowcase() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);

  return (
    <ThemeProvider theme={muiTheme}>
      <Box sx={{ flexGrow: 1 }}>
        {/* App Bar */}
        <AppBar position="static">
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={() => setDrawerOpen(true)}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Material-UI Demo
            </Typography>
            <IconButton color="inherit">
              <Badge badgeContent={4} color="secondary">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            <IconButton color="inherit">
              <ShoppingCartIcon />
            </IconButton>
          </Toolbar>
        </AppBar>

        {/* Drawer */}
        <Drawer
          anchor="left"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
        >
          <List sx={{ width: 250 }}>
            {[
              { text: 'Home', icon: <HomeIcon /> },
              { text: 'Profile', icon: <PersonIcon /> },
              { text: 'Settings', icon: <SettingsIcon /> },
            ].map((item) => (
              <ListItem button key={item.text}>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
          </List>
        </Drawer>

        {/* Main Content */}
        <Box sx={{ p: 3 }}>
          {/* Tabs */}
          <Paper sx={{ mb: 3 }}>
            <Tabs
              value={tabValue}
              onChange={(e, newValue) => setTabValue(newValue)}
              indicatorColor="primary"
              textColor="primary"
            >
              <Tab label="Components" />
              <Tab label="Forms" />
              <Tab label="Feedback" />
            </Tabs>
          </Paper>

          {/* Tab Content */}
          {tabValue === 0 && (
            <Grid container spacing={3}>
              {/* Card Example */}
              <Grid item xs={12} md={4}>
                <StyledCard>
                  <CardContent>
                    <Typography variant="h5" gutterBottom>
                      Product Card
                    </Typography>
                    <Rating value={4} readOnly />
                    <Typography variant="body2" color="text.secondary">
                      This is a beautifully styled product card with hover effects.
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Chip label="New" color="primary" size="small" />
                      <Chip label="Popular" color="secondary" size="small" sx={{ ml: 1 }} />
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button size="small" color="primary">
                      Learn More
                    </Button>
                    <Button size="small" variant="contained" color="primary">
                      Buy Now
                    </Button>
                  </CardActions>
                </StyledCard>
              </Grid>

              {/* Avatar and Typography */}
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                        JD
                      </Avatar>
                      <Box>
                        <Typography variant="h6">John Doe</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Premium Member
                        </Typography>
                      </Box>
                    </Box>
                    <LinearProgress variant="determinate" value={70} sx={{ mb: 1 }} />
                    <Typography variant="body2">
                      Profile Completion: 70%
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Loading States */}
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Loading States
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                      <CircularProgress size={30} />
                      <CircularProgress size={30} color="secondary" />
                    </Box>
                    <Button
                      variant="outlined"
                      onClick={() => setLoading(!loading)}
                      disabled={loading}
                    >
                      {loading ? <CircularProgress size={20} /> : 'Click to Load'}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {tabValue === 1 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Form Controls
                    </Typography>
                    <TextField
                      fullWidth
                      label="Email"
                      variant="outlined"
                      margin="normal"
                    />
                    <TextField
                      fullWidth
                      label="Password"
                      type="password"
                      variant="outlined"
                      margin="normal"
                    />
                    <Box sx={{ mt: 2 }}>
                      <Typography gutterBottom>Volume</Typography>
                      <Slider
                        defaultValue={30}
                        valueLabelDisplay="auto"
                        step={10}
                        marks
                        min={0}
                        max={100}
                      />
                    </Box>
                    <FormControlLabel
                      control={<Switch defaultChecked />}
                      label="Enable notifications"
                    />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {tabValue === 2 && (
            <Box>
              <Button
                variant="contained"
                onClick={() => setDialogOpen(true)}
                sx={{ mr: 2 }}
              >
                Open Dialog
              </Button>
              <Button
                variant="outlined"
                onClick={() => setSnackbarOpen(true)}
              >
                Show Snackbar
              </Button>
            </Box>
          )}
        </Box>

        {/* Dialog */}
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
          <DialogTitle>Confirm Action</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to proceed with this action?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => setDialogOpen(false)} variant="contained">
              Confirm
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={() => setSnackbarOpen(false)}
        >
          <Alert
            onClose={() => setSnackbarOpen(false)}
            severity="success"
            sx={{ width: '100%' }}
          >
            Action completed successfully!
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}

// ==========================================
// 2. Ant Design 示例
// ==========================================

import {
  ConfigProvider,
  Layout,
  Menu,
  Button as AntButton,
  Card as AntCard,
  Form,
  Input,
  Select,
  DatePicker,
  TimePicker,
  Checkbox,
  Radio,
  Upload,
  Switch as AntSwitch,
  Slider as AntSlider,
  Rate as AntRate,
  message,
  notification,
  Modal,
  Drawer as AntDrawer,
  Table,
  Tag,
  Badge as AntBadge,
  Avatar as AntAvatar,
  Progress,
  Spin,
  Result,
  Empty,
  Descriptions,
  PageHeader,
  Space,
  Divider,
  Typography as AntTypography
} from 'antd';

import {
  UserOutlined,
  LockOutlined,
  UploadOutlined,
  HomeOutlined,
  AppstoreOutlined,
  SettingOutlined,
  SmileOutlined
} from '@ant-design/icons';

const { Header, Content, Footer, Sider } = Layout;
const { Option } = Select;
const { TextArea } = Input;
const { Title, Paragraph, Text } = AntTypography;

export function AntDesignShowcase() {
  const [form] = Form.useForm();
  const [collapsed, setCollapsed] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Age',
      dataIndex: 'age',
      key: 'age',
      sorter: (a, b) => a.age - b.age,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space>
          <a>Edit</a>
          <a>Delete</a>
        </Space>
      ),
    },
  ];

  const data = [
    { key: '1', name: 'John Brown', age: 32, status: 'active' },
    { key: '2', name: 'Jim Green', age: 42, status: 'inactive' },
    { key: '3', name: 'Joe Black', age: 32, status: 'active' },
  ];

  const onFinish = (values) => {
    console.log('Form values:', values);
    message.success('Form submitted successfully!');
  };

  const openNotification = () => {
    notification.open({
      message: 'Notification Title',
      description: 'This is the content of the notification.',
      icon: <SmileOutlined style={{ color: '#108ee9' }} />,
    });
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#00b96b',
        },
      }}
    >
      <Layout style={{ minHeight: '100vh' }}>
        <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
          <div style={{ height: 32, margin: 16, background: 'rgba(255,255,255,0.2)' }} />
          <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline">
            <Menu.Item key="1" icon={<HomeOutlined />}>
              Home
            </Menu.Item>
            <Menu.Item key="2" icon={<AppstoreOutlined />}>
              Dashboard
            </Menu.Item>
            <Menu.SubMenu key="sub1" icon={<UserOutlined />} title="Users">
              <Menu.Item key="3">List</Menu.Item>
              <Menu.Item key="4">Add New</Menu.Item>
            </Menu.SubMenu>
            <Menu.Item key="5" icon={<SettingOutlined />}>
              Settings
            </Menu.Item>
          </Menu>
        </Sider>

        <Layout>
          <Header style={{ padding: 0, background: '#fff' }}>
            <PageHeader
              title="Ant Design Showcase"
              subTitle="Enterprise-class UI design language"
              extra={[
                <AntButton key="3">Operation</AntButton>,
                <AntButton key="2">Operation</AntButton>,
                <AntButton key="1" type="primary">
                  Primary
                </AntButton>,
              ]}
            />
          </Header>

          <Content style={{ margin: '16px' }}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              {/* Form Example */}
              <AntCard title="Form Example">
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={onFinish}
                  autoComplete="off"
                >
                  <Form.Item
                    label="Username"
                    name="username"
                    rules={[{ required: true, message: 'Please input your username!' }]}
                  >
                    <Input prefix={<UserOutlined />} placeholder="Username" />
                  </Form.Item>

                  <Form.Item
                    label="Password"
                    name="password"
                    rules={[{ required: true, message: 'Please input your password!' }]}
                  >
                    <Input.Password prefix={<LockOutlined />} placeholder="Password" />
                  </Form.Item>

                  <Form.Item label="Select" name="select">
                    <Select placeholder="Select an option">
                      <Option value="option1">Option 1</Option>
                      <Option value="option2">Option 2</Option>
                    </Select>
                  </Form.Item>

                  <Form.Item label="Date" name="date">
                    <DatePicker style={{ width: '100%' }} />
                  </Form.Item>

                  <Form.Item label="Upload" name="upload">
                    <Upload>
                      <AntButton icon={<UploadOutlined />}>Click to Upload</AntButton>
                    </Upload>
                  </Form.Item>

                  <Form.Item>
                    <AntButton type="primary" htmlType="submit">
                      Submit
                    </AntButton>
                  </Form.Item>
                </Form>
              </AntCard>

              {/* Table Example */}
              <AntCard title="Data Table">
                <Table columns={columns} dataSource={data} />
              </AntCard>

              {/* Various Components */}
              <AntCard title="Component Gallery">
                <Space wrap size="large">
                  <AntButton type="primary" onClick={() => setModalVisible(true)}>
                    Open Modal
                  </AntButton>
                  <AntButton onClick={() => setDrawerVisible(true)}>
                    Open Drawer
                  </AntButton>
                  <AntButton onClick={openNotification}>
                    Show Notification
                  </AntButton>
                  <AntBadge count={5}>
                    <AntAvatar shape="square" icon={<UserOutlined />} />
                  </AntBadge>
                  <Progress type="circle" percent={75} width={80} />
                  <AntRate defaultValue={4} />
                </Space>

                <Divider />

                <Descriptions title="User Info">
                  <Descriptions.Item label="UserName">Zhou Maomao</Descriptions.Item>
                  <Descriptions.Item label="Telephone">1810000000</Descriptions.Item>
                  <Descriptions.Item label="Live">Hangzhou, Zhejiang</Descriptions.Item>
                  <Descriptions.Item label="Remark">empty</Descriptions.Item>
                  <Descriptions.Item label="Address">
                    No. 18, Wantang Road, Xihu District, Hangzhou
                  </Descriptions.Item>
                </Descriptions>
              </AntCard>
            </Space>
          </Content>

          <Footer style={{ textAlign: 'center' }}>
            Ant Design ©2023 Created by Ant UED
          </Footer>
        </Layout>

        {/* Modal */}
        <Modal
          title="Basic Modal"
          visible={modalVisible}
          onOk={() => setModalVisible(false)}
          onCancel={() => setModalVisible(false)}
        >
          <p>Some contents...</p>
          <p>Some contents...</p>
          <p>Some contents...</p>
        </Modal>

        {/* Drawer */}
        <AntDrawer
          title="Basic Drawer"
          placement="right"
          onClose={() => setDrawerVisible(false)}
          visible={drawerVisible}
        >
          <p>Some contents...</p>
          <p>Some contents...</p>
          <p>Some contents...</p>
        </AntDrawer>
      </Layout>
    </ConfigProvider>
  );
}

// ==========================================
// 3. Chakra UI 示例
// ==========================================

import {
  ChakraProvider,
  Box as ChakraBox,
  Flex,
  Grid as ChakraGrid,
  GridItem,
  Heading,
  Text as ChakraText,
  Button as ChakraButton,
  Input as ChakraInput,
  Select as ChakraSelect,
  Textarea,
  Checkbox as ChakraCheckbox,
  Radio as ChakraRadio,
  RadioGroup,
  Stack,
  HStack,
  VStack,
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  Card as ChakraCard,
  CardHeader,
  CardBody,
  CardFooter,
  Badge as ChakraBadge,
  Avatar as ChakraAvatar,
  AvatarBadge,
  AvatarGroup,
  Menu as ChakraMenu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuItemOption,
  MenuGroup,
  MenuOptionGroup,
  MenuDivider,
  Drawer as ChakraDrawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Modal as ChakraModal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Alert as ChakraAlert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useToast,
  useDisclosure,
  Progress as ChakraProgress,
  Spinner,
  Skeleton,
  SkeletonText,
  SkeletonCircle,
  Tabs as ChakraTabs,
  TabList,
  TabPanels,
  Tab as ChakraTab,
  TabPanel,
  Tag as ChakraTag,
  TagLabel,
  TagLeftIcon,
  TagRightIcon,
  TagCloseButton,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  StatGroup,
  SimpleGrid,
  Container,
  Center,
  Square,
  Circle,
  Divider as ChakraDivider,
  useColorMode,
  useColorModeValue,
  IconButton,
  extendTheme
} from '@chakra-ui/react';

import {
  FiHome,
  FiTrendingUp,
  FiCompass,
  FiStar,
  FiSettings,
  FiMenu,
  FiBell,
  FiChevronDown,
  FiSun,
  FiMoon
} from 'react-icons/fi';

// Chakra UI 自定义主题
const chakraTheme = extendTheme({
  colors: {
    brand: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9',
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
    },
  },
  fonts: {
    heading: '"Inter", sans-serif',
    body: '"Inter", sans-serif',
  },
});

export function ChakraUIShowcase() {
  const { colorMode, toggleColorMode } = useColorMode();
  const { isOpen: isDrawerOpen, onOpen: onDrawerOpen, onClose: onDrawerClose } = useDisclosure();
  const { isOpen: isModalOpen, onOpen: onModalOpen, onClose: onModalClose } = useDisclosure();
  const toast = useToast();
  const bg = useColorModeValue('white', 'gray.800');
  const color = useColorModeValue('gray.800', 'white');

  return (
    <ChakraProvider theme={chakraTheme}>
      <ChakraBox minH="100vh" bg={useColorModeValue('gray.50', 'gray.900')}>
        {/* Navigation */}
        <Flex
          as="nav"
          align="center"
          justify="space-between"
          wrap="wrap"
          w="100%"
          p={4}
          bg={bg}
          color={color}
          borderBottomWidth="1px"
        >
          <Flex align="center">
            <IconButton
              icon={<FiMenu />}
              variant="ghost"
              onClick={onDrawerOpen}
              mr={4}
            />
            <Heading size="md">Chakra UI Demo</Heading>
          </Flex>

          <HStack spacing={4}>
            <IconButton
              icon={<FiBell />}
              variant="ghost"
              position="relative"
            >
              <Circle
                size="2"
                bg="red.500"
                position="absolute"
                top={1}
                right={1}
              />
            </IconButton>
            
            <ChakraMenu>
              <MenuButton as={ChakraButton} rightIcon={<FiChevronDown />}>
                <ChakraAvatar size="sm" name="Dan Abrahmov" />
              </MenuButton>
              <MenuList>
                <MenuItem>Profile</MenuItem>
                <MenuItem>Settings</MenuItem>
                <MenuDivider />
                <MenuItem>Logout</MenuItem>
              </MenuList>
            </ChakraMenu>

            <IconButton
              icon={colorMode === 'light' ? <FiMoon /> : <FiSun />}
              onClick={toggleColorMode}
              variant="ghost"
            />
          </HStack>
        </Flex>

        {/* Main Content */}
        <Container maxW="container.xl" py={8}>
          <ChakraTabs variant="soft-rounded" colorScheme="brand">
            <TabList mb={4}>
              <ChakraTab>Dashboard</ChakraTab>
              <ChakraTab>Components</ChakraTab>
              <ChakraTab>Forms</ChakraTab>
            </TabList>

            <TabPanels>
              {/* Dashboard Tab */}
              <TabPanel>
                <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
                  <Stat
                    px={4}
                    py={5}
                    bg={bg}
                    borderRadius="lg"
                    boxShadow="sm"
                  >
                    <StatLabel>Revenue</StatLabel>
                    <StatNumber>$345,670</StatNumber>
                    <StatHelpText>
                      <StatArrow type="increase" />
                      23.36%
                    </StatHelpText>
                  </Stat>

                  <Stat
                    px={4}
                    py={5}
                    bg={bg}
                    borderRadius="lg"
                    boxShadow="sm"
                  >
                    <StatLabel>Users</StatLabel>
                    <StatNumber>1,234</StatNumber>
                    <StatHelpText>
                      <StatArrow type="increase" />
                      12.5%
                    </StatHelpText>
                  </Stat>

                  <Stat
                    px={4}
                    py={5}
                    bg={bg}
                    borderRadius="lg"
                    boxShadow="sm"
                  >
                    <StatLabel>Orders</StatLabel>
                    <StatNumber>89</StatNumber>
                    <StatHelpText>
                      <StatArrow type="decrease" />
                      5.2%
                    </StatHelpText>
                  </Stat>

                  <Stat
                    px={4}
                    py={5}
                    bg={bg}
                    borderRadius="lg"
                    boxShadow="sm"
                  >
                    <StatLabel>Conversion</StatLabel>
                    <StatNumber>2.4%</StatNumber>
                    <StatHelpText>
                      <StatArrow type="increase" />
                      0.3%
                    </StatHelpText>
                  </Stat>
                </SimpleGrid>

                <ChakraGrid templateColumns="repeat(12, 1fr)" gap={6}>
                  <GridItem colSpan={{ base: 12, lg: 8 }}>
                    <ChakraCard bg={bg} p={6}>
                      <CardHeader>
                        <Heading size="md">Recent Activity</Heading>
                      </CardHeader>
                      <CardBody>
                        <VStack align="stretch" spacing={4}>
                          {[1, 2, 3].map((i) => (
                            <Flex key={i} align="center" justify="space-between">
                              <HStack>
                                <ChakraAvatar size="sm" name={`User ${i}`} />
                                <ChakraBox>
                                  <ChakraText fontWeight="medium">
                                    User {i} completed action
                                  </ChakraText>
                                  <ChakraText fontSize="sm" color="gray.500">
                                    2 hours ago
                                  </ChakraText>
                                </ChakraBox>
                              </HStack>
                              <ChakraBadge colorScheme="green">Completed</ChakraBadge>
                            </Flex>
                          ))}
                        </VStack>
                      </CardBody>
                    </ChakraCard>
                  </GridItem>

                  <GridItem colSpan={{ base: 12, lg: 4 }}>
                    <ChakraCard bg={bg} p={6}>
                      <CardHeader>
                        <Heading size="md">Quick Actions</Heading>
                      </CardHeader>
                      <CardBody>
                        <VStack spacing={3}>
                          <ChakraButton
                            leftIcon={<FiStar />}
                            colorScheme="brand"
                            variant="solid"
                            w="full"
                          >
                            Create New
                          </ChakraButton>
                          <ChakraButton
                            leftIcon={<FiTrendingUp />}
                            variant="outline"
                            w="full"
                          >
                            View Analytics
                          </ChakraButton>
                          <ChakraButton
                            leftIcon={<FiSettings />}
                            variant="ghost"
                            w="full"
                          >
                            Settings
                          </ChakraButton>
                        </VStack>
                      </CardBody>
                    </ChakraCard>
                  </GridItem>
                </ChakraGrid>
              </TabPanel>

              {/* Components Tab */}
              <TabPanel>
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                  {/* Alerts */}
                  <ChakraCard bg={bg} p={6}>
                    <CardHeader>
                      <Heading size="sm">Alerts</Heading>
                    </CardHeader>
                    <CardBody>
                      <VStack spacing={3}>
                        <ChakraAlert status="success">
                          <AlertIcon />
                          Success alert
                        </ChakraAlert>
                        <ChakraAlert status="error">
                          <AlertIcon />
                          Error alert
                        </ChakraAlert>
                        <ChakraAlert status="warning">
                          <AlertIcon />
                          Warning alert
                        </ChakraAlert>
                      </VStack>
                    </CardBody>
                  </ChakraCard>

                  {/* Progress & Loading */}
                  <ChakraCard bg={bg} p={6}>
                    <CardHeader>
                      <Heading size="sm">Loading States</Heading>
                    </CardHeader>
                    <CardBody>
                      <VStack spacing={4}>
                        <ChakraProgress value={80} size="xs" colorScheme="brand" w="full" />
                        <ChakraProgress size="sm" isIndeterminate w="full" />
                        <HStack>
                          <Spinner size="sm" />
                          <Spinner size="md" color="brand.500" />
                          <Spinner size="lg" thickness="4px" />
                        </HStack>
                      </VStack>
                    </CardBody>
                  </ChakraCard>

                  {/* Tags */}
                  <ChakraCard bg={bg} p={6}>
                    <CardHeader>
                      <Heading size="sm">Tags</Heading>
                    </CardHeader>
                    <CardBody>
                      <HStack wrap="wrap" spacing={2}>
                        <ChakraTag size="sm" variant="solid" colorScheme="teal">
                          Teal
                        </ChakraTag>
                        <ChakraTag size="md" variant="subtle" colorScheme="purple">
                          Purple
                        </ChakraTag>
                        <ChakraTag size="lg" variant="outline" colorScheme="orange">
                          <TagLabel>Orange</TagLabel>
                          <TagCloseButton />
                        </ChakraTag>
                      </HStack>
                    </CardBody>
                  </ChakraCard>
                </SimpleGrid>

                {/* Skeleton Loading */}
                <ChakraCard bg={bg} p={6} mt={6}>
                  <CardHeader>
                    <Heading size="sm">Skeleton Loading</Heading>
                  </CardHeader>
                  <CardBody>
                    <Stack>
                      <Skeleton height="20px" />
                      <Skeleton height="20px" />
                      <Skeleton height="20px" />
                      <SkeletonText mt={4} noOfLines={4} spacing={4} />
                      <HStack mt={4}>
                        <SkeletonCircle size="10" />
                        <SkeletonText noOfLines={2} flex={1} />
                      </HStack>
                    </Stack>
                  </CardBody>
                </ChakraCard>
              </TabPanel>

              {/* Forms Tab */}
              <TabPanel>
                <ChakraCard bg={bg} p={6}>
                  <CardHeader>
                    <Heading size="md">Contact Form</Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={4}>
                      <FormControl isRequired>
                        <FormLabel>Name</FormLabel>
                        <ChakraInput placeholder="Your name" />
                      </FormControl>

                      <FormControl isRequired>
                        <FormLabel>Email</FormLabel>
                        <ChakraInput type="email" placeholder="your@email.com" />
                        <FormHelperText>We'll never share your email.</FormHelperText>
                      </FormControl>

                      <FormControl>
                        <FormLabel>Message</FormLabel>
                        <Textarea placeholder="Your message" />
                      </FormControl>

                      <FormControl>
                        <FormLabel>Priority</FormLabel>
                        <RadioGroup defaultValue="medium">
                          <Stack direction="row">
                            <ChakraRadio value="low">Low</ChakraRadio>
                            <ChakraRadio value="medium">Medium</ChakraRadio>
                            <ChakraRadio value="high">High</ChakraRadio>
                          </Stack>
                        </RadioGroup>
                      </FormControl>

                      <ChakraCheckbox defaultChecked>
                        I agree to the terms and conditions
                      </ChakraCheckbox>

                      <HStack w="full" justify="flex-end" spacing={4}>
                        <ChakraButton variant="ghost">Cancel</ChakraButton>
                        <ChakraButton
                          colorScheme="brand"
                          onClick={() =>
                            toast({
                              title: 'Form submitted.',
                              description: "We've received your message.",
                              status: 'success',
                              duration: 5000,
                              isClosable: true,
                            })
                          }
                        >
                          Submit
                        </ChakraButton>
                      </HStack>
                    </VStack>
                  </CardBody>
                </ChakraCard>
              </TabPanel>
            </TabPanels>
          </ChakraTabs>

          {/* Action Buttons */}
          <HStack mt={8} spacing={4}>
            <ChakraButton onClick={onModalOpen} colorScheme="brand">
              Open Modal
            </ChakraButton>
            <ChakraButton onClick={onDrawerOpen} variant="outline">
              Open Drawer
            </ChakraButton>
          </HStack>
        </Container>

        {/* Drawer */}
        <ChakraDrawer isOpen={isDrawerOpen} placement="left" onClose={onDrawerClose}>
          <DrawerOverlay />
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerHeader>Navigation</DrawerHeader>

            <DrawerBody>
              <VStack align="stretch" spacing={2}>
                {[
                  { icon: FiHome, label: 'Home' },
                  { icon: FiCompass, label: 'Explore' },
                  { icon: FiStar, label: 'Favorites' },
                  { icon: FiSettings, label: 'Settings' },
                ].map((item) => (
                  <ChakraButton
                    key={item.label}
                    leftIcon={<item.icon />}
                    variant="ghost"
                    justifyContent="flex-start"
                  >
                    {item.label}
                  </ChakraButton>
                ))}
              </VStack>
            </DrawerBody>

            <DrawerFooter>
              <ChakraButton variant="outline" mr={3} onClick={onDrawerClose}>
                Cancel
              </ChakraButton>
            </DrawerFooter>
          </DrawerContent>
        </ChakraDrawer>

        {/* Modal */}
        <ChakraModal isOpen={isModalOpen} onClose={onModalClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Modal Title</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <ChakraText>
                This is a beautiful modal with Chakra UI. You can put any content here.
              </ChakraText>
            </ModalBody>

            <ModalFooter>
              <ChakraButton colorScheme="brand" mr={3} onClick={onModalClose}>
                Close
              </ChakraButton>
              <ChakraButton variant="ghost">Secondary Action</ChakraButton>
            </ModalFooter>
          </ModalContent>
        </ChakraModal>
      </ChakraBox>
    </ChakraProvider>
  );
}