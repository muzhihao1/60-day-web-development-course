---
day: 18
title: "构建实时天气应用"
description: "使用Fetch API和现代JavaScript技术构建一个功能完整的天气应用"
difficulty: "advanced"
requirements:
  - "使用Fetch API获取天气数据"
  - "实现地理位置定位"
  - "添加城市搜索功能"
  - "实现数据缓存机制"
  - "处理各种错误情况"
estimatedTime: 240
---

# 构建实时天气应用 🌤️

## 项目概述

创建一个现代化的天气应用，支持当前位置天气、城市搜索、天气预报和历史记录功能。通过这个项目，你将综合运用Fetch API的各种特性。

## 基础要求

### 1. 核心功能

- 获取当前位置的天气信息
- 支持城市名称搜索
- 显示7天天气预报
- 保存搜索历史
- 支持多个城市收藏

### 2. API集成

使用OpenWeatherMap API（或类似服务）：
```javascript
const API_KEY = 'your-api-key';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// 当前天气
// GET /weather?q={city}&appid={API_KEY}&units=metric&lang=zh_cn

// 天气预报
// GET /forecast?q={city}&appid={API_KEY}&units=metric&lang=zh_cn

// 地理编码
// GET /geo/1.0/direct?q={city}&limit=5&appid={API_KEY}
```

### 3. 数据结构

```javascript
// 天气数据
const weatherData = {
  city: {
    name: '北京',
    country: 'CN',
    coordinates: { lat: 39.9042, lon: 116.4074 }
  },
  current: {
    temp: 25,
    feels_like: 27,
    humidity: 60,
    pressure: 1013,
    wind_speed: 3.5,
    wind_deg: 180,
    weather: {
      main: 'Clouds',
      description: '多云',
      icon: '03d'
    }
  },
  forecast: [
    {
      date: '2024-01-20',
      temp_min: 18,
      temp_max: 28,
      weather: { main: 'Clear', description: '晴', icon: '01d' }
    }
    // ... 更多天数
  ]
};

// 收藏城市
const favoriteCities = [
  { id: '1', name: '北京', country: 'CN', lat: 39.9042, lon: 116.4074 },
  { id: '2', name: '上海', country: 'CN', lat: 31.2304, lon: 121.4737 }
];

// 搜索历史
const searchHistory = ['北京', '上海', '广州', '深圳'];
```

## UI要求

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>实时天气应用</title>
    <style>
        :root {
            --primary-color: #1e88e5;
            --secondary-color: #ffa726;
            --background: #f5f5f5;
            --card-bg: white;
            --text-primary: #212121;
            --text-secondary: #757575;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: var(--background);
            color: var(--text-primary);
            min-height: 100vh;
        }
        
        .app-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        
        header {
            text-align: center;
            margin-bottom: 30px;
        }
        
        .search-section {
            background: var(--card-bg);
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            margin-bottom: 30px;
        }
        
        .search-box {
            display: flex;
            gap: 10px;
            margin-bottom: 15px;
        }
        
        .search-input {
            flex: 1;
            padding: 12px 20px;
            border: 2px solid #e0e0e0;
            border-radius: 25px;
            font-size: 16px;
            transition: border-color 0.3s;
        }
        
        .search-input:focus {
            outline: none;
            border-color: var(--primary-color);
        }
        
        .search-btn, .location-btn {
            padding: 12px 24px;
            border: none;
            border-radius: 25px;
            background: var(--primary-color);
            color: white;
            font-size: 16px;
            cursor: pointer;
            transition: background 0.3s;
        }
        
        .search-btn:hover, .location-btn:hover {
            background: #1976d2;
        }
        
        .suggestions {
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            margin-top: 5px;
            max-height: 200px;
            overflow-y: auto;
            display: none;
        }
        
        .suggestion-item {
            padding: 10px 20px;
            cursor: pointer;
            transition: background 0.2s;
        }
        
        .suggestion-item:hover {
            background: #f5f5f5;
        }
        
        .weather-display {
            background: var(--card-bg);
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            margin-bottom: 30px;
        }
        
        .current-weather {
            text-align: center;
            margin-bottom: 30px;
        }
        
        .city-name {
            font-size: 32px;
            font-weight: 300;
            margin-bottom: 10px;
        }
        
        .temperature {
            font-size: 72px;
            font-weight: 200;
            line-height: 1;
        }
        
        .weather-description {
            font-size: 20px;
            color: var(--text-secondary);
            margin: 10px 0;
        }
        
        .weather-details {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 20px;
            margin-top: 30px;
        }
        
        .detail-item {
            text-align: center;
            padding: 15px;
            background: #f5f5f5;
            border-radius: 8px;
        }
        
        .detail-label {
            font-size: 14px;
            color: var(--text-secondary);
        }
        
        .detail-value {
            font-size: 24px;
            font-weight: 500;
            margin-top: 5px;
        }
        
        .forecast-section {
            background: var(--card-bg);
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .forecast-title {
            font-size: 20px;
            margin-bottom: 20px;
        }
        
        .forecast-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
            gap: 15px;
        }
        
        .forecast-day {
            text-align: center;
            padding: 15px;
            background: #f5f5f5;
            border-radius: 8px;
            transition: transform 0.2s;
        }
        
        .forecast-day:hover {
            transform: translateY(-2px);
        }
        
        .forecast-date {
            font-size: 14px;
            color: var(--text-secondary);
        }
        
        .forecast-icon {
            font-size: 36px;
            margin: 10px 0;
        }
        
        .forecast-temp {
            font-size: 16px;
        }
        
        .favorites-section {
            background: var(--card-bg);
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            margin-top: 30px;
        }
        
        .favorites-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            gap: 15px;
            margin-top: 15px;
        }
        
        .favorite-city {
            padding: 15px;
            background: #f5f5f5;
            border-radius: 8px;
            text-align: center;
            cursor: pointer;
            transition: all 0.3s;
        }
        
        .favorite-city:hover {
            background: #e0e0e0;
            transform: translateY(-2px);
        }
        
        .loading {
            text-align: center;
            padding: 40px;
            font-size: 18px;
            color: var(--text-secondary);
        }
        
        .error {
            background: #ffebee;
            color: #c62828;
            padding: 15px;
            border-radius: 8px;
            margin: 10px 0;
        }
        
        .offline-indicator {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: #ff9800;
            color: white;
            padding: 10px;
            text-align: center;
            display: none;
        }
        
        body.offline .offline-indicator {
            display: block;
        }
        
        @media (max-width: 600px) {
            .weather-details {
                grid-template-columns: repeat(2, 1fr);
            }
            
            .forecast-grid {
                grid-template-columns: repeat(3, 1fr);
            }
        }
    </style>
</head>
<body>
    <div class="offline-indicator">
        当前处于离线状态，显示缓存数据
    </div>
    
    <div class="app-container">
        <header>
            <h1>🌤️ 实时天气</h1>
        </header>
        
        <div class="search-section">
            <div class="search-box">
                <input 
                    type="text" 
                    class="search-input" 
                    id="searchInput" 
                    placeholder="搜索城市..."
                    autocomplete="off"
                >
                <button class="search-btn" id="searchBtn">搜索</button>
                <button class="location-btn" id="locationBtn">📍 当前位置</button>
            </div>
            <div class="suggestions" id="suggestions"></div>
        </div>
        
        <div id="weatherDisplay" class="weather-display" style="display: none;">
            <div class="current-weather">
                <h2 class="city-name" id="cityName">-</h2>
                <div class="temperature" id="temperature">-°</div>
                <div class="weather-description" id="weatherDescription">-</div>
                <button id="addToFavorites" style="margin-top: 10px;">
                    ⭐ 添加到收藏
                </button>
            </div>
            
            <div class="weather-details">
                <div class="detail-item">
                    <div class="detail-label">体感温度</div>
                    <div class="detail-value" id="feelsLike">-°</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">湿度</div>
                    <div class="detail-value" id="humidity">-%</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">风速</div>
                    <div class="detail-value" id="windSpeed">- m/s</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">气压</div>
                    <div class="detail-value" id="pressure">- hPa</div>
                </div>
            </div>
        </div>
        
        <div class="forecast-section" id="forecastSection" style="display: none;">
            <h3 class="forecast-title">7天预报</h3>
            <div class="forecast-grid" id="forecastGrid"></div>
        </div>
        
        <div class="favorites-section">
            <h3>收藏城市</h3>
            <div class="favorites-grid" id="favoritesGrid"></div>
        </div>
        
        <div id="loading" class="loading" style="display: none;">
            加载中...
        </div>
        
        <div id="error" class="error" style="display: none;"></div>
    </div>
    
    <script src="weather-app.js"></script>
</body>
</html>
```

## 实现提示

### 1. API客户端

```javascript
class WeatherAPI {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseURL = 'https://api.openweathermap.org/data/2.5';
    this.cache = new Map();
    this.cacheTime = 10 * 60 * 1000; // 10分钟缓存
  }
  
  async getCurrentWeather(city) {
    const cacheKey = `weather_${city}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;
    
    const response = await fetch(
      `${this.baseURL}/weather?q=${city}&appid=${this.apiKey}&units=metric&lang=zh_cn`
    );
    
    if (!response.ok) {
      throw new Error('获取天气数据失败');
    }
    
    const data = await response.json();
    this.setCache(cacheKey, data);
    return data;
  }
  
  async getForecast(city) {
    // 实现7天预报
  }
  
  async getWeatherByCoords(lat, lon) {
    // 根据坐标获取天气
  }
  
  getFromCache(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() - item.timestamp > this.cacheTime) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }
  
  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }
}
```

### 2. 地理位置

```javascript
async function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('浏览器不支持地理位置'));
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      position => resolve({
        lat: position.coords.latitude,
        lon: position.coords.longitude
      }),
      error => reject(error),
      { timeout: 10000 }
    );
  });
}
```

### 3. 搜索建议

```javascript
class SearchSuggestions {
  constructor() {
    this.debounceTime = 300;
    this.minLength = 2;
  }
  
  async getSuggestions(query) {
    if (query.length < this.minLength) {
      return [];
    }
    
    // 从历史记录和预定义城市列表中搜索
    const history = this.getSearchHistory();
    const cities = this.getCityList();
    
    return [...history, ...cities]
      .filter(city => 
        city.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, 5);
  }
  
  getSearchHistory() {
    return JSON.parse(localStorage.getItem('searchHistory') || '[]');
  }
  
  addToHistory(city) {
    const history = this.getSearchHistory();
    const updated = [city, ...history.filter(c => c !== city)].slice(0, 10);
    localStorage.setItem('searchHistory', JSON.stringify(updated));
  }
}
```

### 4. 离线支持

```javascript
// 注册Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js');
}

// 监听在线/离线状态
window.addEventListener('online', () => {
  document.body.classList.remove('offline');
  // 刷新数据
});

window.addEventListener('offline', () => {
  document.body.classList.add('offline');
});
```

## 进阶功能

1. **天气图标和动画**
   - 根据天气状况显示相应图标
   - 添加天气动画效果

2. **多语言支持**
   - 支持中英文切换
   - 自动检测用户语言

3. **天气地图**
   - 集成地图显示天气分布
   - 支持地图选点查看天气

4. **天气通知**
   - 恶劣天气预警
   - 每日天气提醒

5. **数据可视化**
   - 温度趋势图表
   - 降水概率图表

## 评分标准

- **基础功能 (40分)**
  - 成功获取并显示天气数据
  - 城市搜索功能正常
  - 错误处理完善

- **高级功能 (30分)**
  - 实现数据缓存
  - 地理位置定位
  - 收藏城市功能

- **用户体验 (20分)**
  - 界面美观响应式
  - 加载状态提示
  - 离线功能支持

- **代码质量 (10分)**
  - 代码结构清晰
  - 适当的注释
  - 错误处理完善

## 学习资源

- [OpenWeatherMap API文档](https://openweathermap.org/api)
- [Geolocation API](https://developer.mozilla.org/zh-CN/docs/Web/API/Geolocation_API)
- [Service Worker API](https://developer.mozilla.org/zh-CN/docs/Web/API/Service_Worker_API)

祝你构建出色的天气应用！记住，良好的用户体验和错误处理是关键。