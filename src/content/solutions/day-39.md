---
day: 39
exerciseTitle: "React Native入门实战"
approach: "使用React Native开发跨平台移动应用，实现待办事项管理、天气查询和音乐播放器功能"
files:
  - path: "App.js"
    language: "javascript"
    description: "主应用入口文件"
  - path: "components/TodoItem.js"
    language: "javascript"
    description: "待办事项组件"
  - path: "components/WeatherCard.js"
    language: "javascript"
    description: "天气卡片组件"
  - path: "components/MusicPlayer.js"
    language: "javascript"
    description: "音乐播放器组件"
  - path: "utils/storage.js"
    language: "javascript"
    description: "本地存储工具函数"
  - path: "utils/api.js"
    language: "javascript"
    description: "API请求工具函数"
keyTakeaways:
  - "React Native使用原生组件而非Web组件"
  - "样式使用StyleSheet API，类似CSS但有区别"
  - "使用AsyncStorage进行本地数据持久化"
  - "通过平台API访问设备功能"
  - "手势处理和动画提升用户体验"
commonMistakes:
  - "忘记在iOS上配置Info.plist权限"
  - "样式单位使用px而非数字"
  - "直接使用Web专有的CSS属性"
  - "忽略平台差异导致崩溃"
  - "未处理键盘遮挡输入框"
extensions:
  - title: "添加推送通知功能"
    description: "集成推送通知，实现任务提醒功能"
  - title: "实现离线同步"
    description: "添加网络状态检测和离线数据同步"
  - title: "集成生物识别认证"
    description: "使用指纹或面部识别保护应用数据"
---

# Day 39 解决方案：React Native入门

## 练习概述

本练习通过三个实战项目学习React Native开发：
1. 待办事项应用 - 基础组件和状态管理
2. 天气查询应用 - 网络请求和地理位置
3. 音乐播放器 - 媒体控制和后台播放

## 练习1：待办事项应用

### 主应用组件

```javascript
// App.js - 完整的待办事项应用
import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  Platform,
  StatusBar,
  KeyboardAvoidingView,
  Keyboard,
  Modal,
  Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { Ionicons } from '@expo/vector-icons';

const STORAGE_KEY = '@TodoApp:todos';
const CATEGORIES = ['work', 'life', 'study'];
const PRIORITIES = ['low', 'medium', 'high'];
const PRIORITY_COLORS = {
  low: '#4CAF50',
  medium: '#FF9800',
  high: '#F44336',
};

export default function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [inputText, setInputText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('medium');
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [editingTodo, setEditingTodo] = useState(null);

  useEffect(() => {
    loadTodos();
  }, []);

  useEffect(() => {
    saveTodos();
  }, [todos]);

  const loadTodos = async () => {
    try {
      const savedTodos = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedTodos) {
        setTodos(JSON.parse(savedTodos));
      }
    } catch (error) {
      Alert.alert('错误', '加载数据失败');
    }
  };

  const saveTodos = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    } catch (error) {
      Alert.alert('错误', '保存数据失败');
    }
  };

  const addTodo = () => {
    if (inputText.trim() === '') {
      Alert.alert('提示', '请输入待办事项内容');
      return;
    }

    const newTodo = {
      id: Date.now().toString(),
      text: inputText,
      completed: false,
      category: selectedCategory === 'all' ? 'life' : selectedCategory,
      priority: selectedPriority,
      createdAt: new Date().toISOString(),
    };

    if (editingTodo) {
      setTodos(todos.map(todo => 
        todo.id === editingTodo.id 
          ? { ...todo, text: inputText, priority: selectedPriority }
          : todo
      ));
      setEditingTodo(null);
    } else {
      setTodos([newTodo, ...todos]);
    }

    setInputText('');
    setShowAddModal(false);
    Keyboard.dismiss();
  };

  const toggleTodo = (id) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id) => {
    Alert.alert(
      '确认删除',
      '确定要删除这个待办事项吗？',
      [
        { text: '取消', style: 'cancel' },
        { 
          text: '删除', 
          style: 'destructive',
          onPress: () => setTodos(todos.filter(todo => todo.id !== id))
        }
      ]
    );
  };

  const filteredTodos = todos.filter(todo => {
    const categoryMatch = selectedCategory === 'all' || todo.category === selectedCategory;
    const searchMatch = todo.text.toLowerCase().includes(searchText.toLowerCase());
    return categoryMatch && searchMatch;
  });

  const renderRightActions = (progress, dragX, todo) => {
    const scale = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });

    return (
      <TouchableOpacity 
        style={styles.deleteButton}
        onPress={() => deleteTodo(todo.id)}
      >
        <Animated.View style={{ transform: [{ scale }] }}>
          <Ionicons name="trash" size={24} color="white" />
        </Animated.View>
      </TouchableOpacity>
    );
  };

  const renderTodoItem = ({ item }) => (
    <Swipeable renderRightActions={(progress, dragX) => renderRightActions(progress, dragX, item)}>
      <TouchableOpacity
        style={[
          styles.todoItem,
          item.completed && styles.completedTodo
        ]}
        onPress={() => toggleTodo(item.id)}
        onLongPress={() => {
          setEditingTodo(item);
          setInputText(item.text);
          setSelectedPriority(item.priority);
          setShowAddModal(true);
        }}
      >
        <View style={styles.todoContent}>
          <View style={[styles.priorityIndicator, { backgroundColor: PRIORITY_COLORS[item.priority] }]} />
          <Text style={[
            styles.todoText,
            item.completed && styles.completedText
          ]}>
            {item.text}
          </Text>
        </View>
        <View style={styles.todoMeta}>
          <Text style={styles.categoryTag}>{item.category}</Text>
          <Ionicons 
            name={item.completed ? "checkmark-circle" : "ellipse-outline"} 
            size={24} 
            color={item.completed ? "#4CAF50" : "#ccc"} 
          />
        </View>
      </TouchableOpacity>
    </Swipeable>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <Text style={styles.title}>我的待办</Text>
        <TouchableOpacity onPress={() => setShowAddModal(true)}>
          <Ionicons name="add-circle" size={36} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="搜索待办事项..."
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      <View style={styles.categories}>
        <TouchableOpacity
          style={[styles.categoryButton, selectedCategory === 'all' && styles.selectedCategory]}
          onPress={() => setSelectedCategory('all')}
        >
          <Text style={[styles.categoryText, selectedCategory === 'all' && styles.selectedCategoryText]}>
            全部
          </Text>
        </TouchableOpacity>
        {CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat}
            style={[styles.categoryButton, selectedCategory === cat && styles.selectedCategory]}
            onPress={() => setSelectedCategory(cat)}
          >
            <Text style={[styles.categoryText, selectedCategory === cat && styles.selectedCategoryText]}>
              {cat === 'work' ? '工作' : cat === 'life' ? '生活' : '学习'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredTodos}
        renderItem={renderTodoItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />

      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingTodo ? '编辑待办' : '添加待办'}
              </Text>
              <TouchableOpacity onPress={() => {
                setShowAddModal(false);
                setEditingTodo(null);
                setInputText('');
              }}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.modalInput}
              placeholder="输入待办事项..."
              value={inputText}
              onChangeText={setInputText}
              multiline
              autoFocus
            />

            <View style={styles.prioritySelector}>
              <Text style={styles.selectorLabel}>优先级</Text>
              <View style={styles.priorityOptions}>
                {PRIORITIES.map(priority => (
                  <TouchableOpacity
                    key={priority}
                    style={[
                      styles.priorityOption,
                      selectedPriority === priority && styles.selectedPriority,
                      { borderColor: PRIORITY_COLORS[priority] }
                    ]}
                    onPress={() => setSelectedPriority(priority)}
                  >
                    <Text style={[
                      styles.priorityText,
                      selectedPriority === priority && { color: PRIORITY_COLORS[priority] }
                    ]}>
                      {priority === 'low' ? '低' : priority === 'medium' ? '中' : '高'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity style={styles.addButton} onPress={addTodo}>
              <Text style={styles.addButtonText}>
                {editingTodo ? '保存' : '添加'}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    margin: 15,
    paddingHorizontal: 15,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  categories: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedCategory: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  categoryText: {
    fontSize: 14,
    color: '#666',
  },
  selectedCategoryText: {
    color: 'white',
  },
  list: {
    paddingHorizontal: 15,
  },
  todoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  completedTodo: {
    opacity: 0.7,
  },
  todoContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityIndicator: {
    width: 4,
    height: '100%',
    borderRadius: 2,
    marginRight: 10,
  },
  todoText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  todoMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryTag: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 10,
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    marginBottom: 10,
    borderRadius: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: 300,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  prioritySelector: {
    marginBottom: 20,
  },
  selectorLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 10,
  },
  priorityOptions: {
    flexDirection: 'row',
  },
  priorityOption: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    marginRight: 10,
  },
  selectedPriority: {
    backgroundColor: '#f0f8ff',
  },
  priorityText: {
    fontSize: 14,
    color: '#666',
  },
  addButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});
```

### 存储工具函数

```javascript
// utils/storage.js - 本地存储工具
import AsyncStorage from '@react-native-async-storage/async-storage';

export const StorageUtils = {
  // 保存数据
  async setItem(key, value) {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
      return true;
    } catch (error) {
      console.error('Storage setItem error:', error);
      return false;
    }
  },

  // 获取数据
  async getItem(key) {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error('Storage getItem error:', error);
      return null;
    }
  },

  // 删除数据
  async removeItem(key) {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Storage removeItem error:', error);
      return false;
    }
  },

  // 清空所有数据
  async clear() {
    try {
      await AsyncStorage.clear();
      return true;
    } catch (error) {
      console.error('Storage clear error:', error);
      return false;
    }
  },

  // 获取所有键
  async getAllKeys() {
    try {
      return await AsyncStorage.getAllKeys();
    } catch (error) {
      console.error('Storage getAllKeys error:', error);
      return [];
    }
  },

  // 批量操作
  async multiGet(keys) {
    try {
      const result = await AsyncStorage.multiGet(keys);
      return result.map(([key, value]) => ({
        key,
        value: value ? JSON.parse(value) : null
      }));
    } catch (error) {
      console.error('Storage multiGet error:', error);
      return [];
    }
  },

  async multiSet(keyValuePairs) {
    try {
      const pairs = keyValuePairs.map(([key, value]) => [
        key,
        JSON.stringify(value)
      ]);
      await AsyncStorage.multiSet(pairs);
      return true;
    } catch (error) {
      console.error('Storage multiSet error:', error);
      return false;
    }
  },
};
```

### 实现要点解析

1. **React Native核心组件**：
   - SafeAreaView处理刘海屏
   - FlatList高性能列表
   - Modal模态框
   - KeyboardAvoidingView键盘处理

2. **手势处理**：
   - Swipeable实现滑动删除
   - TouchableOpacity响应触摸
   - 长按编辑功能

3. **数据持久化**：
   - AsyncStorage本地存储
   - 自动保存和加载
   - 错误处理

4. **样式和动画**：
   - StyleSheet API
   - Animated动画API
   - 平台适配

## 练习2：天气查询应用

### 天气应用主组件

```javascript
// WeatherApp.js - 天气查询应用
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  ImageBackground,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const API_KEY = 'your_weather_api_key';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

export default function WeatherApp() {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    if (Platform.OS === 'ios') {
      getCurrentLocation();
    } else {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: '位置权限',
            message: '应用需要访问您的位置以获取天气信息',
            buttonNeutral: '稍后询问',
            buttonNegative: '取消',
            buttonPositive: '确定',
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          getCurrentLocation();
        } else {
          setError('位置权限被拒绝');
          setLoading(false);
        }
      } catch (err) {
        console.warn(err);
        setError('请求权限失败');
        setLoading(false);
      }
    }
  };

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });
        fetchWeatherData(latitude, longitude);
      },
      (error) => {
        setError('获取位置失败');
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    );
  };

  const fetchWeatherData = async (latitude, longitude) => {
    try {
      // 获取当前天气
      const weatherResponse = await fetch(
        `${BASE_URL}/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric&lang=zh_cn`
      );
      const weatherData = await weatherResponse.json();
      setWeather(weatherData);

      // 获取天气预报
      const forecastResponse = await fetch(
        `${BASE_URL}/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric&lang=zh_cn`
      );
      const forecastData = await forecastResponse.json();
      
      // 处理预报数据，每天取一个
      const dailyForecast = forecastData.list.filter((item, index) => index % 8 === 0).slice(0, 5);
      setForecast(dailyForecast);
      
      setLoading(false);
      setRefreshing(false);
    } catch (error) {
      setError('获取天气数据失败');
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    if (location) {
      fetchWeatherData(location.latitude, location.longitude);
    } else {
      getCurrentLocation();
    }
  };

  const getWeatherIcon = (iconCode) => {
    const iconMap = {
      '01d': 'sunny',
      '01n': 'moon',
      '02d': 'partly-sunny',
      '02n': 'cloudy-night',
      '03d': 'cloudy',
      '03n': 'cloudy',
      '04d': 'cloudy',
      '04n': 'cloudy',
      '09d': 'rainy',
      '09n': 'rainy',
      '10d': 'rainy',
      '10n': 'rainy',
      '11d': 'thunderstorm',
      '11n': 'thunderstorm',
      '13d': 'snow',
      '13n': 'snow',
      '50d': 'partly-sunny',
      '50n': 'cloudy-night',
    };
    return iconMap[iconCode] || 'help-circle';
  };

  const getBackgroundGradient = () => {
    if (!weather) return ['#4A90E2', '#7CB9E8'];
    
    const temp = weather.main.temp;
    if (temp < 0) return ['#0F2027', '#2C5364'];
    if (temp < 10) return ['#134E5E', '#71B280'];
    if (temp < 20) return ['#4A90E2', '#7CB9E8'];
    if (temp < 30) return ['#F7971E', '#FFD200'];
    return ['#FF512F', '#DD2476'];
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>获取天气数据中...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Ionicons name="alert-circle" size={64} color="#FF3B30" />
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={getBackgroundGradient()}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="white"
          />
        }
      >
        {weather && (
          <>
            <View style={styles.currentWeather}>
              <Text style={styles.locationText}>{weather.name}</Text>
              <View style={styles.temperatureContainer}>
                <Ionicons 
                  name={getWeatherIcon(weather.weather[0].icon)} 
                  size={80} 
                  color="white" 
                />
                <Text style={styles.temperature}>{Math.round(weather.main.temp)}°</Text>
              </View>
              <Text style={styles.description}>{weather.weather[0].description}</Text>
              
              <View style={styles.detailsRow}>
                <View style={styles.detailItem}>
                  <Ionicons name="water" size={24} color="white" />
                  <Text style={styles.detailText}>{weather.main.humidity}%</Text>
                  <Text style={styles.detailLabel}>湿度</Text>
                </View>
                <View style={styles.detailItem}>
                  <Ionicons name="speedometer" size={24} color="white" />
                  <Text style={styles.detailText}>{weather.main.pressure} hPa</Text>
                  <Text style={styles.detailLabel}>气压</Text>
                </View>
                <View style={styles.detailItem}>
                  <Ionicons name="flag" size={24} color="white" />
                  <Text style={styles.detailText}>{weather.wind.speed} m/s</Text>
                  <Text style={styles.detailLabel}>风速</Text>
                </View>
              </View>
            </View>

            <View style={styles.forecastContainer}>
              <Text style={styles.forecastTitle}>5日预报</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {forecast.map((item, index) => (
                  <View key={index} style={styles.forecastItem}>
                    <Text style={styles.forecastDay}>
                      {new Date(item.dt * 1000).toLocaleDateString('zh-CN', { weekday: 'short' })}
                    </Text>
                    <Ionicons 
                      name={getWeatherIcon(item.weather[0].icon)} 
                      size={32} 
                      color="white" 
                    />
                    <Text style={styles.forecastTemp}>{Math.round(item.main.temp)}°</Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          </>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: '#FF3B30',
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  currentWeather: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  locationText: {
    fontSize: 32,
    color: 'white',
    fontWeight: '300',
    marginBottom: 20,
  },
  temperatureContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  temperature: {
    fontSize: 72,
    color: 'white',
    fontWeight: '200',
    marginLeft: 20,
  },
  description: {
    fontSize: 24,
    color: 'white',
    textTransform: 'capitalize',
    marginBottom: 40,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  detailItem: {
    alignItems: 'center',
  },
  detailText: {
    fontSize: 18,
    color: 'white',
    fontWeight: '500',
    marginTop: 5,
  },
  detailLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  forecastContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 20,
    paddingHorizontal: 20,
    flex: 1,
  },
  forecastTitle: {
    fontSize: 20,
    color: 'white',
    fontWeight: '500',
    marginBottom: 20,
  },
  forecastItem: {
    alignItems: 'center',
    marginRight: 20,
    padding: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
  },
  forecastDay: {
    fontSize: 16,
    color: 'white',
    marginBottom: 10,
  },
  forecastTemp: {
    fontSize: 18,
    color: 'white',
    fontWeight: '500',
    marginTop: 10,
  },
});
```

## 练习3：音乐播放器

### 音乐播放器组件

```javascript
// MusicPlayer.js - 音乐播放器
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';
import Sound from 'react-native-sound';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const PLAYLIST = [
  {
    id: '1',
    title: '晴天',
    artist: '周杰伦',
    album: '叶惠美',
    cover: 'https://example.com/cover1.jpg',
    url: 'https://example.com/song1.mp3',
    duration: 269,
  },
  {
    id: '2',
    title: '七里香',
    artist: '周杰伦',
    album: '七里香',
    cover: 'https://example.com/cover2.jpg',
    url: 'https://example.com/song2.mp3',
    duration: 299,
  },
  // 更多歌曲...
];

export default function MusicPlayer() {
  const [currentTrack, setCurrentTrack] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);
  
  const sound = useRef(null);
  const animation = useRef(new Animated.Value(0)).current;
  const panResponder = useRef(null);

  useEffect(() => {
    // 设置音频
    Sound.setCategory('Playback');
    
    // 手势处理
    panResponder.current = PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dx) > 5;
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dx > 50) {
          previousTrack();
        } else if (gestureState.dx < -50) {
          nextTrack();
        }
      },
    });

    return () => {
      if (sound.current) {
        sound.current.release();
      }
    };
  }, []);

  useEffect(() => {
    loadTrack(PLAYLIST[currentTrack]);
  }, [currentTrack]);

  useEffect(() => {
    // 旋转动画
    if (isPlaying) {
      Animated.loop(
        Animated.timing(animation, {
          toValue: 1,
          duration: 10000,
          useNativeDriver: true,
        })
      ).start();
    } else {
      animation.stopAnimation();
    }
  }, [isPlaying]);

  const loadTrack = (track) => {
    if (sound.current) {
      sound.current.release();
    }

    sound.current = new Sound(track.url, Sound.MAIN_BUNDLE, (error) => {
      if (error) {
        console.log('Failed to load sound', error);
        return;
      }
      
      setDuration(sound.current.getDuration());
      if (isPlaying) {
        playTrack();
      }
    });
  };

  const playTrack = () => {
    if (sound.current) {
      sound.current.play((success) => {
        if (success) {
          if (isRepeat) {
            playTrack();
          } else {
            nextTrack();
          }
        }
      });
      
      // 更新进度
      const interval = setInterval(() => {
        sound.current.getCurrentTime((seconds) => {
          setCurrentTime(seconds);
        });
      }, 1000);
      
      sound.current.setCurrentTime(currentTime);
    }
  };

  const pauseTrack = () => {
    if (sound.current) {
      sound.current.pause();
    }
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      pauseTrack();
    } else {
      playTrack();
    }
    setIsPlaying(!isPlaying);
  };

  const previousTrack = () => {
    const newIndex = currentTrack === 0 ? PLAYLIST.length - 1 : currentTrack - 1;
    setCurrentTrack(newIndex);
    setCurrentTime(0);
  };

  const nextTrack = () => {
    let newIndex;
    if (isShuffle) {
      newIndex = Math.floor(Math.random() * PLAYLIST.length);
    } else {
      newIndex = currentTrack === PLAYLIST.length - 1 ? 0 : currentTrack + 1;
    }
    setCurrentTrack(newIndex);
    setCurrentTime(0);
  };

  const seekTo = (value) => {
    if (sound.current) {
      sound.current.setCurrentTime(value);
      setCurrentTime(value);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const spin = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const currentSong = PLAYLIST[currentTrack];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => {}}>
          <Ionicons name="chevron-down" size={30} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>正在播放</Text>
        <TouchableOpacity onPress={() => setShowPlaylist(!showPlaylist)}>
          <Ionicons name="list" size={30} color="#333" />
        </TouchableOpacity>
      </View>

      <View style={styles.albumContainer} {...panResponder.current.panHandlers}>
        <Animated.Image
          source={{ uri: currentSong.cover }}
          style={[styles.albumCover, { transform: [{ rotate: spin }] }]}
        />
      </View>

      <View style={styles.songInfo}>
        <Text style={styles.songTitle}>{currentSong.title}</Text>
        <Text style={styles.artistName}>{currentSong.artist}</Text>
      </View>

      <View style={styles.progressContainer}>
        <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={duration}
          value={currentTime}
          onSlidingComplete={seekTo}
          minimumTrackTintColor="#007AFF"
          maximumTrackTintColor="#ccc"
          thumbTintColor="#007AFF"
        />
        <Text style={styles.timeText}>{formatTime(duration)}</Text>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity onPress={() => setIsShuffle(!isShuffle)}>
          <Ionicons 
            name="shuffle" 
            size={24} 
            color={isShuffle ? '#007AFF' : '#666'} 
          />
        </TouchableOpacity>
        
        <TouchableOpacity onPress={previousTrack}>
          <Ionicons name="play-skip-back" size={32} color="#333" />
        </TouchableOpacity>
        
        <TouchableOpacity onPress={togglePlayPause} style={styles.playButton}>
          <Ionicons 
            name={isPlaying ? 'pause' : 'play'} 
            size={40} 
            color="white" 
          />
        </TouchableOpacity>
        
        <TouchableOpacity onPress={nextTrack}>
          <Ionicons name="play-skip-forward" size={32} color="#333" />
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => setIsRepeat(!isRepeat)}>
          <Ionicons 
            name="repeat" 
            size={24} 
            color={isRepeat ? '#007AFF' : '#666'} 
          />
        </TouchableOpacity>
      </View>

      {showPlaylist && (
        <ScrollView style={styles.playlist}>
          {PLAYLIST.map((song, index) => (
            <TouchableOpacity
              key={song.id}
              style={[
                styles.playlistItem,
                index === currentTrack && styles.currentPlaylistItem
              ]}
              onPress={() => {
                setCurrentTrack(index);
                setCurrentTime(0);
              }}
            >
              <Image source={{ uri: song.cover }} style={styles.playlistCover} />
              <View style={styles.playlistInfo}>
                <Text style={[
                  styles.playlistTitle,
                  index === currentTrack && styles.currentPlaylistText
                ]}>
                  {song.title}
                </Text>
                <Text style={styles.playlistArtist}>{song.artist}</Text>
              </View>
              {index === currentTrack && isPlaying && (
                <Ionicons name="volume-high" size={20} color="#007AFF" />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  albumContainer: {
    alignItems: 'center',
    marginVertical: 40,
  },
  albumCover: {
    width: SCREEN_WIDTH * 0.7,
    height: SCREEN_WIDTH * 0.7,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  songInfo: {
    alignItems: 'center',
    marginBottom: 30,
  },
  songTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  artistName: {
    fontSize: 18,
    color: '#666',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 30,
    marginBottom: 30,
  },
  slider: {
    flex: 1,
    height: 40,
    marginHorizontal: 10,
  },
  timeText: {
    fontSize: 14,
    color: '#666',
    width: 50,
    textAlign: 'center',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  playButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  playlist: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -5,
    },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  playlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
  currentPlaylistItem: {
    backgroundColor: '#f0f8ff',
  },
  playlistCover: {
    width: 50,
    height: 50,
    borderRadius: 5,
    marginRight: 15,
  },
  playlistInfo: {
    flex: 1,
  },
  playlistTitle: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  currentPlaylistText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  playlistArtist: {
    fontSize: 14,
    color: '#666',
  },
});
```

## 总结

通过这三个练习，我们学习了React Native开发的核心技能：

1. **基础组件和布局**：
   - 使用View、Text、TouchableOpacity等基础组件
   - FlexBox布局系统
   - StyleSheet样式管理

2. **平台特性**：
   - 平台差异处理
   - 权限请求
   - 原生功能调用

3. **数据和状态管理**：
   - AsyncStorage本地存储
   - 状态管理和生命周期
   - 网络请求和错误处理

4. **用户体验优化**：
   - 手势识别和响应
   - 动画效果
   - 性能优化技巧

这些技能为开发高质量的跨平台移动应用奠定了基础。