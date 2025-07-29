// react-native-basics.jsx - React Native基础组件示例

// 1. 完整的App组件结构
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
  TouchableWithoutFeedback,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 主应用组件
export default function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [inputText, setInputText] = useState('');
  const [editingId, setEditingId] = useState(null);

  // 加载保存的待办事项
  useEffect(() => {
    loadTodos();
  }, []);

  // 从AsyncStorage加载数据
  const loadTodos = async () => {
    try {
      const savedTodos = await AsyncStorage.getItem('todos');
      if (savedTodos) {
        setTodos(JSON.parse(savedTodos));
      }
    } catch (error) {
      console.error('Failed to load todos:', error);
    }
  };

  // 保存到AsyncStorage
  const saveTodos = async (newTodos) => {
    try {
      await AsyncStorage.setItem('todos', JSON.stringify(newTodos));
    } catch (error) {
      console.error('Failed to save todos:', error);
    }
  };

  // 添加或更新待办事项
  const handleSubmit = () => {
    if (!inputText.trim()) {
      Alert.alert('提示', '请输入待办事项内容');
      return;
    }

    let newTodos;
    if (editingId) {
      // 更新现有项目
      newTodos = todos.map(todo =>
        todo.id === editingId
          ? { ...todo, text: inputText }
          : todo
      );
      setEditingId(null);
    } else {
      // 添加新项目
      const newTodo = {
        id: Date.now().toString(),
        text: inputText,
        completed: false,
        createdAt: new Date().toISOString(),
      };
      newTodos = [...todos, newTodo];
    }

    setTodos(newTodos);
    saveTodos(newTodos);
    setInputText('');
    Keyboard.dismiss();
  };

  // 切换完成状态
  const toggleTodo = (id) => {
    const newTodos = todos.map(todo =>
      todo.id === id
        ? { ...todo, completed: !todo.completed }
        : todo
    );
    setTodos(newTodos);
    saveTodos(newTodos);
  };

  // 删除待办事项
  const deleteTodo = (id) => {
    Alert.alert(
      '确认删除',
      '确定要删除这个待办事项吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: () => {
            const newTodos = todos.filter(todo => todo.id !== id);
            setTodos(newTodos);
            saveTodos(newTodos);
          },
        },
      ]
    );
  };

  // 编辑待办事项
  const editTodo = (todo) => {
    setInputText(todo.text);
    setEditingId(todo.id);
  };

  // 渲染待办事项
  const renderTodo = ({ item }) => (
    <TouchableOpacity
      style={styles.todoItem}
      onPress={() => toggleTodo(item.id)}
      onLongPress={() => editTodo(item)}
    >
      <View style={styles.todoContent}>
        <View style={[
          styles.checkbox,
          item.completed && styles.checkboxChecked
        ]} />
        <Text style={[
          styles.todoText,
          item.completed && styles.todoTextCompleted
        ]}>
          {item.text}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteTodo(item.id)}
      >
        <Text style={styles.deleteButtonText}>删除</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'}
        backgroundColor="#2196F3"
      />
      
      <View style={styles.header}>
        <Text style={styles.title}>待办事项</Text>
        <Text style={styles.subtitle}>
          {todos.filter(t => !t.completed).length} 个未完成
        </Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.inner}>
            <FlatList
              data={todos}
              renderItem={renderTodo}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.listContainer}
              showsVerticalScrollIndicator={false}
            />

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={inputText}
                onChangeText={setInputText}
                placeholder="添加新的待办事项..."
                placeholderTextColor="#999"
                onSubmitEditing={handleSubmit}
                returnKeyType="done"
              />
              <TouchableOpacity
                style={[
                  styles.addButton,
                  editingId && styles.updateButton
                ]}
                onPress={handleSubmit}
              >
                <Text style={styles.addButtonText}>
                  {editingId ? '更新' : '添加'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// 2. 样式定义
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 30,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 16,
    color: '#E3F2FD',
    marginTop: 5,
  },
  content: {
    flex: 1,
  },
  inner: {
    flex: 1,
    paddingHorizontal: 20,
  },
  listContainer: {
    paddingVertical: 20,
  },
  todoItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  todoContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#2196F3',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  todoText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  todoTextCompleted: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  deleteButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  deleteButtonText: {
    color: '#f44336',
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: Platform.OS === 'ios' ? 20 : 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 16,
    marginRight: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  addButton: {
    backgroundColor: '#2196F3',
    borderRadius: 25,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  updateButton: {
    backgroundColor: '#4CAF50',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

// 3. 自定义组件示例
export function CustomButton({ title, onPress, variant = 'primary' }) {
  return (
    <TouchableOpacity
      style={[
        buttonStyles.base,
        buttonStyles[variant]
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={[
        buttonStyles.text,
        buttonStyles[`${variant}Text`]
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const buttonStyles = StyleSheet.create({
  base: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: '#2196F3',
  },
  secondary: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  danger: {
    backgroundColor: '#f44336',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryText: {
    color: '#fff',
  },
  secondaryText: {
    color: '#2196F3',
  },
  dangerText: {
    color: '#fff',
  },
});

// 4. 动画组件示例
import { Animated } from 'react-native';

export function AnimatedCard({ children }) {
  const scaleAnim = new Animated.Value(0);
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.card,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

// 5. 手势处理示例
import { PanGestureHandler, State } from 'react-native-gesture-handler';

export function SwipeableCard({ onSwipe, children }) {
  const translateX = new Animated.Value(0);
  
  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = (event) => {
    if (event.nativeEvent.state === State.END) {
      const { translationX } = event.nativeEvent;
      
      if (Math.abs(translationX) > 120) {
        // 滑动距离足够，触发删除
        Animated.timing(translateX, {
          toValue: translationX > 0 ? 500 : -500,
          duration: 200,
          useNativeDriver: true,
        }).start(() => {
          onSwipe && onSwipe();
        });
      } else {
        // 滑动距离不够，回弹
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    }
  };

  return (
    <PanGestureHandler
      onGestureEvent={onGestureEvent}
      onHandlerStateChange={onHandlerStateChange}
    >
      <Animated.View
        style={{
          transform: [{ translateX }],
        }}
      >
        {children}
      </Animated.View>
    </PanGestureHandler>
  );
}