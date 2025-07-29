---
day: 39
title: "React Native实战练习"
description: "创建功能完整的移动应用"
difficulty: "intermediate"
estimatedTime: 180
requirements:
  - "创建跨平台移动应用"
  - "实现原生组件和手势交互"
  - "集成设备API（相机、位置等）"
  - "实现导航和状态管理"
  - "构建和发布应用"
---

# Day 39 练习：React Native应用开发

## 练习1：待办事项应用

创建一个功能完整的待办事项应用，支持数据持久化和手势操作。

### 功能要求：

1. **基础功能**
   - 添加新的待办事项
   - 标记完成/未完成
   - 编辑待办事项
   - 删除待办事项

2. **数据持久化**
   - 使用AsyncStorage保存数据
   - 应用启动时加载保存的数据
   - 每次修改后自动保存

3. **UI/UX增强**
   - 滑动删除功能
   - 长按编辑
   - 完成动画效果
   - 键盘优化处理

4. **高级功能**
   - 分类管理（工作、生活、学习）
   - 优先级设置
   - 截止日期提醒
   - 搜索和筛选

### 实现提示：

```jsx
// 数据结构设计
const todoItem = {
  id: 'unique-id',
  text: '待办事项内容',
  completed: false,
  category: 'work', // work, life, study
  priority: 'medium', // low, medium, high
  dueDate: '2024-12-31',
  createdAt: '2024-01-01T10:00:00',
  updatedAt: '2024-01-01T10:00:00'
};

// 使用React Native Gesture Handler实现滑动
import Swipeable from 'react-native-gesture-handler/Swipeable';

<Swipeable
  renderRightActions={renderRightActions}
  onSwipeableOpen={() => handleDelete(item.id)}
>
  <TodoItem item={item} />
</Swipeable>
```

### 界面设计建议：

- 使用Tab导航切换不同分类
- 悬浮添加按钮
- 优先级用颜色标识
- 过期任务特殊显示

## 练习2：天气预报应用

创建一个集成真实天气API的天气预报应用。

### 功能要求：

1. **天气数据展示**
   - 当前天气状况
   - 温度、湿度、风速
   - 未来5天预报
   - 每小时预报

2. **位置功能**
   - 获取当前位置
   - 搜索城市
   - 保存常用城市
   - 切换城市

3. **UI设计**
   - 天气动画背景
   - 下拉刷新
   - 温度单位切换
   - 深色/浅色主题

4. **数据缓存**
   - 缓存天气数据
   - 离线查看
   - 自动更新策略

### API集成示例：

```jsx
// 使用OpenWeatherMap API
const API_KEY = 'your-api-key';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// 获取当前天气
async function getCurrentWeather(lat, lon) {
  try {
    const response = await fetch(
      `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=zh_cn`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('获取天气失败:', error);
    throw error;
  }
}

// 获取位置权限
import * as Location from 'expo-location';

async function getLocation() {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('错误', '需要位置权限才能获取当地天气');
    return null;
  }
  
  const location = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });
  
  return {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
  };
}
```

### UI组件设计：

```jsx
// 天气卡片组件
function WeatherCard({ weather }) {
  return (
    <LinearGradient
      colors={getGradientColors(weather.main)}
      style={styles.card}
    >
      <Text style={styles.temperature}>
        {Math.round(weather.temp)}°
      </Text>
      <Image
        source={{ uri: getWeatherIcon(weather.icon) }}
        style={styles.weatherIcon}
      />
      <Text style={styles.description}>
        {weather.description}
      </Text>
    </LinearGradient>
  );
}

// 动态背景色
function getGradientColors(weatherType) {
  const gradients = {
    Clear: ['#56CCF2', '#2F80ED'],
    Clouds: ['#757F9A', '#D7DDE8'],
    Rain: ['#4B79A1', '#283E51'],
    Snow: ['#E6DADA', '#274046'],
  };
  return gradients[weatherType] || gradients.Clear;
}
```

## 练习3：图片浏览器

创建一个支持手势操作的图片浏览应用。

### 功能要求：

1. **图片展示**
   - 网格布局展示
   - 全屏查看模式
   - 图片详情信息
   - 加载占位图

2. **手势操作**
   - 双击放大
   - 捏合缩放
   - 滑动切换
   - 下拉关闭

3. **性能优化**
   - 图片懒加载
   - 缓存策略
   - 内存管理
   - 预加载邻近图片

4. **附加功能**
   - 图片下载
   - 分享功能
   - 收藏管理
   - 相册分类

### 手势实现示例：

```jsx
import {
  PinchGestureHandler,
  TapGestureHandler,
  State,
} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

function ZoomableImage({ source }) {
  const scale = useSharedValue(1);
  const focalX = useSharedValue(0);
  const focalY = useSharedValue(0);

  const pinchHandler = useAnimatedGestureHandler({
    onActive: (event) => {
      scale.value = event.scale;
      focalX.value = event.focalX;
      focalY.value = event.focalY;
    },
    onEnd: () => {
      scale.value = withSpring(1);
    },
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: focalX.value },
      { translateY: focalY.value },
      { scale: scale.value },
      { translateX: -focalX.value },
      { translateY: -focalY.value },
    ],
  }));

  return (
    <PinchGestureHandler onGestureEvent={pinchHandler}>
      <Animated.View style={styles.container}>
        <TapGestureHandler numberOfTaps={2}>
          <Animated.Image
            source={source}
            style={[styles.image, animatedStyle]}
          />
        </TapGestureHandler>
      </Animated.View>
    </PinchGestureHandler>
  );
}
```

### 性能优化建议：

```jsx
// 使用FastImage优化图片加载
import FastImage from 'react-native-fast-image';

<FlatList
  data={images}
  renderItem={({ item }) => (
    <FastImage
      source={{
        uri: item.thumbnail,
        priority: FastImage.priority.normal,
      }}
      style={styles.thumbnail}
      resizeMode={FastImage.resizeMode.cover}
    />
  )}
  keyExtractor={item => item.id}
  numColumns={3}
  getItemLayout={(data, index) => ({
    length: ITEM_SIZE,
    offset: ITEM_SIZE * index,
    index,
  })}
  removeClippedSubviews={true}
  maxToRenderPerBatch={10}
  windowSize={10}
/>
```

## 额外挑战

### 1. 整合所有功能

创建一个"生活助手"应用，整合待办事项、天气和图片功能：

- 主页显示今日待办和天气
- 可以为待办事项添加照片
- 根据天气推荐今日活动

### 2. 添加动画效果

使用Lottie或React Native Animated API：

- 页面过渡动画
- 列表项动画
- 加载动画
- 交互反馈动画

### 3. 实现离线功能

- 使用Redux Persist保存应用状态
- 实现离线数据同步
- 网络状态检测和提示

## 提交要求

1. 完整的React Native项目代码
2. 在iOS/Android模拟器上的演示视频
3. 项目说明文档（包含安装和运行步骤）
4. 性能优化报告

## 评分标准

- 功能完整性（30%）
- 代码质量和组织（25%）
- UI/UX设计（20%）
- 性能优化（15%）
- 创新性（10%）

## 学习资源

- [React Native性能优化](https://reactnative.dev/docs/performance)
- [React Native手势处理](https://docs.swmansion.com/react-native-gesture-handler/)
- [React Native动画](https://docs.swmansion.com/react-native-reanimated/)

## 截止时间

请在下一节课开始前完成并提交所有练习。