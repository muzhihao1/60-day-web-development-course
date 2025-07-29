// navigation-platform.jsx - React Navigation和平台特定代码示例

// 1. 完整的导航应用示例
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import {
  View,
  Text,
  Button,
  StyleSheet,
  Platform,
  TouchableOpacity,
} from 'react-native';

// 创建导航器
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

// 主应用组件
export default function NavigationApp() {
  return (
    <NavigationContainer>
      <Drawer.Navigator
        initialRouteName="MainTabs"
        screenOptions={{
          drawerStyle: {
            backgroundColor: '#f5f5f5',
            width: 250,
          },
          drawerActiveTintColor: '#2196F3',
          drawerInactiveTintColor: '#666',
        }}
      >
        <Drawer.Screen
          name="MainTabs"
          component={MainTabNavigator}
          options={{
            drawerLabel: '主页',
            drawerIcon: ({ color, size }) => (
              <Ionicons name="home" size={size} color={color} />
            ),
            headerShown: false,
          }}
        />
        <Drawer.Screen
          name="Settings"
          component={SettingsStack}
          options={{
            drawerLabel: '设置',
            drawerIcon: ({ color, size }) => (
              <Ionicons name="settings" size={size} color={color} />
            ),
            headerShown: false,
          }}
        />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}

// 2. Tab导航器
function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Search':
              iconName = focused ? 'search' : 'search-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          ...Platform.select({
            ios: {
              backgroundColor: '#fff',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: 0.1,
              shadowRadius: 3,
            },
            android: {
              elevation: 8,
              backgroundColor: '#fff',
            },
          }),
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{
          tabBarLabel: '首页',
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          tabBarLabel: '搜索',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: '我的',
          tabBarBadge: 3,
        }}
      />
    </Tab.Navigator>
  );
}

// 3. Stack导航器
function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: Platform.OS === 'ios' ? '#fff' : '#2196F3',
        },
        headerTintColor: Platform.OS === 'ios' ? '#2196F3' : '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        ...Platform.select({
          android: {
            headerTitleAlign: 'center',
          },
        }),
      }}
    >
      <Stack.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{
          title: '首页',
          headerLeft: ({ navigation }) => (
            <TouchableOpacity
              onPress={() => navigation.openDrawer()}
              style={{ marginLeft: 15 }}
            >
              <Ionicons
                name="menu"
                size={24}
                color={Platform.OS === 'ios' ? '#2196F3' : '#fff'}
              />
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen
        name="Details"
        component={DetailsScreen}
        options={({ route }) => ({
          title: route.params?.title || '详情',
          headerBackTitle: '返回',
        })}
      />
    </Stack.Navigator>
  );
}

// 4. 页面组件
function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>欢迎来到首页</Text>
      
      <TouchableOpacity
        style={[styles.button, styles.primaryButton]}
        onPress={() => navigation.navigate('Details', {
          itemId: 1,
          title: '产品详情',
          data: { name: 'React Native', version: '0.70' },
        })}
      >
        <Text style={styles.buttonText}>查看详情</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.secondaryButton]}
        onPress={() => navigation.openDrawer()}
      >
        <Text style={[styles.buttonText, styles.secondaryButtonText]}>
          打开侧边栏
        </Text>
      </TouchableOpacity>
    </View>
  );
}

function DetailsScreen({ route, navigation }) {
  const { itemId, data } = route.params || {};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>详情页面</Text>
      <Text style={styles.subtitle}>ID: {itemId}</Text>
      {data && (
        <View style={styles.dataContainer}>
          <Text style={styles.dataText}>名称: {data.name}</Text>
          <Text style={styles.dataText}>版本: {data.version}</Text>
        </View>
      )}
      
      <TouchableOpacity
        style={[styles.button, styles.primaryButton]}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.buttonText}>返回</Text>
      </TouchableOpacity>
    </View>
  );
}

// 5. 平台特定组件
// Button.ios.js
export function IOSButton({ title, onPress }) {
  return (
    <TouchableOpacity style={iosStyles.button} onPress={onPress}>
      <Text style={iosStyles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
}

const iosStyles = StyleSheet.create({
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
});

// Button.android.js
export function AndroidButton({ title, onPress }) {
  return (
    <TouchableOpacity style={androidStyles.button} onPress={onPress}>
      <Text style={androidStyles.buttonText}>{title.toUpperCase()}</Text>
    </TouchableOpacity>
  );
}

const androidStyles = StyleSheet.create({
  button: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 2,
    elevation: 2,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});

// 6. 平台特定样式和功能
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: Platform.select({
      ios: 34,
      android: 28,
    }),
    fontWeight: Platform.OS === 'ios' ? '700' : '500',
    marginBottom: 20,
    color: '#333',
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 10,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: Platform.OS === 'ios' ? 10 : 5,
    marginVertical: 10,
    width: '100%',
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#2196F3',
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
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#2196F3',
  },
  dataContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginVertical: 20,
    width: '100%',
  },
  dataText: {
    fontSize: 16,
    color: '#333',
    marginVertical: 5,
  },
});

// 7. 设置页面Stack
function SettingsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="SettingsMain"
        component={SettingsScreen}
        options={{ title: '设置' }}
      />
      <Stack.Screen
        name="About"
        component={AboutScreen}
        options={{ title: '关于' }}
      />
    </Stack.Navigator>
  );
}

function SettingsScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <SettingItem
        title="账户设置"
        icon="person-circle"
        onPress={() => {}}
      />
      <SettingItem
        title="通知设置"
        icon="notifications"
        onPress={() => {}}
      />
      <SettingItem
        title="隐私设置"
        icon="lock-closed"
        onPress={() => {}}
      />
      <SettingItem
        title="关于"
        icon="information-circle"
        onPress={() => navigation.navigate('About')}
      />
    </View>
  );
}

// 8. 自定义设置项组件
function SettingItem({ title, icon, onPress }) {
  return (
    <TouchableOpacity style={settingStyles.item} onPress={onPress}>
      <View style={settingStyles.left}>
        <Ionicons name={icon} size={24} color="#666" />
        <Text style={settingStyles.title}>{title}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#999" />
    </TouchableOpacity>
  );
}

const settingStyles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
  },
});

// 9. Hook用于导航
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';

export function useNavigationHelper() {
  const navigation = useNavigation();
  const route = useRoute();

  // 页面聚焦时执行
  useFocusEffect(
    React.useCallback(() => {
      console.log('页面聚焦:', route.name);
      
      return () => {
        console.log('页面失焦:', route.name);
      };
    }, [route.name])
  );

  // 导航辅助函数
  const navigateWithParams = (screen, params = {}) => {
    navigation.navigate(screen, params);
  };

  const goBackWithParams = (params = {}) => {
    navigation.navigate({
      ...route,
      params: {
        ...route.params,
        ...params,
      },
    });
    navigation.goBack();
  };

  return {
    navigation,
    route,
    navigateWithParams,
    goBackWithParams,
  };
}

// 10. 深度链接配置
const linking = {
  prefixes: ['myapp://', 'https://myapp.com'],
  config: {
    screens: {
      MainTabs: {
        screens: {
          Home: {
            screens: {
              HomeScreen: 'home',
              Details: 'details/:itemId',
            },
          },
          Search: 'search',
          Profile: 'profile',
        },
      },
      Settings: {
        screens: {
          SettingsMain: 'settings',
          About: 'about',
        },
      },
    },
  },
};

// 使用深度链接
export function AppWithDeepLinking() {
  return (
    <NavigationContainer linking={linking}>
      <NavigationApp />
    </NavigationContainer>
  );
}