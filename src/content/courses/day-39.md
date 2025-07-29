---
day: 39
phase: "react-development"
title: "React Native入门"
description: "使用React技术栈开发原生移动应用"
objectives:
  - "理解React Native的工作原理"
  - "掌握React Native核心组件"
  - "学习移动应用的样式和布局"
  - "实现基础的导航功能"
  - "了解平台差异化开发"
estimatedTime: 180
difficulty: "intermediate"
prerequisites: [25, 27, 28]
resources:
  - title: "React Native官方文档"
    url: "https://reactnative.dev/docs/getting-started"
    type: "article"
    description: "最权威的React Native学习资源"
  - title: "Expo文档"
    url: "https://docs.expo.dev/"
    type: "article"
    description: "快速开发React Native应用"
  - title: "React Navigation"
    url: "https://reactnavigation.org/"
    type: "article"
    description: "React Native导航解决方案"
---

# Day 39: React Native入门

## 学习目标

今天我们将学习React Native，探索如何使用React技术栈开发原生移动应用，为你的技能树添加移动开发能力。

## 1. React Native简介

### 什么是React Native？

React Native是Facebook开发的开源框架，让你能够使用React和JavaScript构建原生移动应用。

**核心特性：**
- 真正的原生应用，不是Web应用
- 使用JavaScript和React
- 跨平台（iOS和Android）
- 热重载开发体验
- 访问原生API和组件

### React Native vs React

| 特性 | React | React Native |
|-----|-------|--------------|
| 平台 | Web浏览器 | iOS/Android |
| 基础元素 | HTML元素 | 原生组件 |
| 样式 | CSS | StyleSheet API |
| 导航 | React Router | React Navigation |
| 开发工具 | 浏览器DevTools | React Native Debugger |

## 2. 环境搭建

### 方式一：Expo（推荐初学者）

Expo是一套工具和服务，简化React Native开发：

```bash
# 安装Expo CLI
npm install -g expo-cli

# 创建新项目
expo init MyFirstApp
cd MyFirstApp

# 启动开发服务器
expo start
```

### 方式二：React Native CLI

更灵活但配置更复杂：

```bash
# 安装React Native CLI
npm install -g react-native-cli

# 创建新项目
npx react-native init MyApp
cd MyApp

# iOS开发（需要Mac）
npx react-native run-ios

# Android开发
npx react-native run-android
```

### 开发工具设置

1. **手机应用**：下载Expo Go（用于Expo项目）
2. **模拟器**：iOS Simulator（Mac）或Android Emulator
3. **调试工具**：React Native Debugger
4. **VS Code扩展**：React Native Tools

## 3. 第一个React Native应用

### 基本结构

```jsx
// App.js
import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  StatusBar,
} from 'react-native';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.content}>
        <Text style={styles.title}>
          Hello React Native!
        </Text>
        <Text style={styles.subtitle}>
          我的第一个移动应用
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
});
```

## 4. 核心组件详解

### 布局组件

```jsx
import {
  View,
  ScrollView,
  SafeAreaView,
} from 'react-native';

// View - 相当于div
<View style={styles.container}>
  <View style={styles.box} />
</View>

// ScrollView - 可滚动容器
<ScrollView 
  horizontal={false}
  showsVerticalScrollIndicator={false}
>
  <Content />
</ScrollView>

// SafeAreaView - 适配刘海屏
<SafeAreaView style={styles.container}>
  <App />
</SafeAreaView>
```

### 文本和输入

```jsx
import {
  Text,
  TextInput,
  KeyboardAvoidingView,
} from 'react-native';

// 文本组件
<Text style={styles.text}>
  普通文本
  <Text style={styles.bold}>加粗文本</Text>
</Text>

// 输入框
function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TextInput
        style={styles.input}
        placeholder="邮箱"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <TextInput
        style={styles.input}
        placeholder="密码"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
    </KeyboardAvoidingView>
  );
}
```

### 触摸组件

```jsx
import {
  TouchableOpacity,
  TouchableHighlight,
  TouchableWithoutFeedback,
  Pressable,
} from 'react-native';

// TouchableOpacity - 点击时透明度变化
<TouchableOpacity
  style={styles.button}
  onPress={() => console.log('Pressed!')}
  activeOpacity={0.7}
>
  <Text style={styles.buttonText}>点击我</Text>
</TouchableOpacity>

// Pressable - 更灵活的触摸组件（推荐）
<Pressable
  style={({ pressed }) => [
    styles.button,
    pressed && styles.buttonPressed
  ]}
  onPress={() => {}}
  onLongPress={() => {}}
>
  {({ pressed }) => (
    <Text style={styles.buttonText}>
      {pressed ? '按下中' : '点击'}
    </Text>
  )}
</Pressable>
```

### 列表组件

```jsx
import { FlatList, SectionList } from 'react-native';

// FlatList - 高性能列表
function TodoList({ todos }) {
  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Text>{item.title}</Text>
    </View>
  );
  
  return (
    <FlatList
      data={todos}
      renderItem={renderItem}
      keyExtractor={item => item.id}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      ListEmptyComponent={<Text>暂无数据</Text>}
      refreshing={refreshing}
      onRefresh={handleRefresh}
      onEndReached={loadMore}
      onEndReachedThreshold={0.1}
    />
  );
}

// SectionList - 分组列表
<SectionList
  sections={[
    { title: '待办', data: pending },
    { title: '已完成', data: completed },
  ]}
  renderItem={renderItem}
  renderSectionHeader={({ section }) => (
    <Text style={styles.header}>{section.title}</Text>
  )}
  keyExtractor={(item, index) => item + index}
/>
```

### 图片和图标

```jsx
import { Image, ImageBackground } from 'react-native';

// 本地图片
<Image
  source={require('./assets/logo.png')}
  style={styles.logo}
  resizeMode="contain"
/>

// 网络图片
<Image
  source={{ uri: 'https://example.com/image.jpg' }}
  style={styles.image}
  onLoad={() => console.log('图片加载完成')}
  onError={() => console.log('图片加载失败')}
/>

// 背景图片
<ImageBackground
  source={require('./assets/background.jpg')}
  style={styles.container}
>
  <Content />
</ImageBackground>
```

## 5. 样式系统

### StyleSheet API

```jsx
import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  
  // Flexbox布局
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  // 绝对定位
  absolute: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  
  // 阴影（iOS）
  shadowIOS: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  
  // 阴影（Android）
  elevation: {
    elevation: 5,
  },
  
  // 响应式
  responsive: {
    width: width * 0.9,
    height: height * 0.5,
  },
});
```

### 平台特定样式

```jsx
import { Platform, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    marginTop: Platform.OS === 'ios' ? 20 : 0,
    ...Platform.select({
      ios: {
        backgroundColor: '#f0f0f0',
      },
      android: {
        backgroundColor: '#e0e0e0',
      },
    }),
  },
});

// 或使用独立文件
// Button.ios.js - iOS版本
// Button.android.js - Android版本
```

### 动态样式

```jsx
function DynamicComponent({ isActive, theme }) {
  return (
    <View
      style={[
        styles.base,
        isActive && styles.active,
        { backgroundColor: theme.background }
      ]}
    >
      <Text style={[
        styles.text,
        isActive ? styles.activeText : styles.inactiveText
      ]}>
        动态样式示例
      </Text>
    </View>
  );
}
```

## 6. 导航实现

### 安装React Navigation

```bash
npm install @react-navigation/native
npm install react-native-screens react-native-safe-area-context

# Stack Navigator
npm install @react-navigation/stack

# Tab Navigator  
npm install @react-navigation/bottom-tabs

# Drawer Navigator
npm install @react-navigation/drawer
```

### Stack Navigator示例

```jsx
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#f4511e',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          options={{ title: '首页' }}
        />
        <Stack.Screen 
          name="Details" 
          component={DetailsScreen}
          options={({ route }) => ({ 
            title: route.params.title 
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// 页面组件
function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Button
        title="查看详情"
        onPress={() => navigation.navigate('Details', {
          itemId: 86,
          title: '产品详情',
        })}
      />
    </View>
  );
}

function DetailsScreen({ route, navigation }) {
  const { itemId, title } = route.params;
  
  return (
    <View style={styles.container}>
      <Text>Item ID: {itemId}</Text>
      <Button
        title="返回"
        onPress={() => navigation.goBack()}
      />
    </View>
  );
}
```

### Tab Navigator示例

```jsx
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }
          
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: 'tomato',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
```

## 7. 原生功能访问

### 相机和相册

```jsx
import * as ImagePicker from 'expo-image-picker';

async function pickImage() {
  // 请求权限
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  
  if (status !== 'granted') {
    alert('需要相册访问权限！');
    return;
  }
  
  // 选择图片
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [4, 3],
    quality: 1,
  });
  
  if (!result.canceled) {
    setImage(result.assets[0].uri);
  }
}

// 拍照
async function takePhoto() {
  const result = await ImagePicker.launchCameraAsync({
    allowsEditing: true,
    aspect: [4, 3],
  });
  
  if (!result.canceled) {
    setImage(result.assets[0].uri);
  }
}
```

### 地理位置

```jsx
import * as Location from 'expo-location';

async function getLocation() {
  const { status } = await Location.requestForegroundPermissionsAsync();
  
  if (status !== 'granted') {
    setErrorMsg('位置权限被拒绝');
    return;
  }
  
  const location = await Location.getCurrentPositionAsync({});
  setLocation(location);
}
```

### 本地存储

```jsx
import AsyncStorage from '@react-native-async-storage/async-storage';

// 保存数据
const saveData = async (key, value) => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (e) {
    console.error('保存失败', e);
  }
};

// 读取数据
const getData = async (key) => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    console.error('读取失败', e);
  }
};

// 删除数据
const removeData = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (e) {
    console.error('删除失败', e);
  }
};
```

## 8. 调试技巧

### 开发者菜单

- **iOS模拟器**：Cmd + D
- **Android模拟器**：Cmd + M (Mac) / Ctrl + M (Windows)
- **真机**：摇晃设备

### 调试选项

1. **Remote JS Debugging**：在Chrome中调试JavaScript
2. **Live Reload**：文件改变时自动重新加载
3. **Hot Reloading**：保持应用状态的热更新
4. **Show Inspector**：查看元素信息

### 常用调试工具

```jsx
// React Native Debugger
// 下载：https://github.com/jhen0409/react-native-debugger

// Flipper
// Facebook官方调试平台
// 下载：https://fbflipper.com/

// 控制台日志
console.log('普通日志');
console.warn('警告信息');
console.error('错误信息');

// 使用__DEV__标志
if (__DEV__) {
  console.log('仅在开发环境显示');
}
```

## 今日练习

### 练习1：创建待办事项应用

使用React Native创建一个功能完整的待办事项应用。

### 练习2：天气预报应用

集成天气API，创建一个展示当地天气的应用。

### 练习3：图片浏览器

实现一个支持手势操作的图片浏览应用。

## 性能优化建议

1. **使用FlatList代替ScrollView**处理长列表
2. **避免在render中创建函数**
3. **使用PureComponent或React.memo**
4. **优化图片大小和格式**
5. **使用InteractionManager**延迟执行

## 发布准备

### iOS发布

1. 配置应用图标和启动画面
2. 在Xcode中设置Bundle ID
3. 创建发布证书
4. 提交到App Store

### Android发布

1. 生成签名密钥
2. 配置gradle构建
3. 生成APK或AAB文件
4. 上传到Google Play

## 扩展资源

- [React Native中文网](https://reactnative.cn/)
- [Expo SDK文档](https://docs.expo.dev/versions/latest/)
- [React Native Elements](https://reactnativeelements.com/)
- [NativeBase组件库](https://nativebase.io/)

## 明日预告

明天是Phase 3的最后一天，我们将综合运用所学的React知识，完成一个完整的全栈项目实战！