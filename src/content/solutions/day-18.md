---
day: 18
exerciseTitle: "构建REST API客户端"
approach: "通过JavaScript实现完整的应用功能，包含性能优化和最佳实践"
files:
  - path: "index.html"
    language: "html"
    description: "主HTML文件"
  - path: "app.js"
    language: "javascript"
    description: "主应用逻辑"
  - path: "styles.css"
    language: "css"
    description: "样式文件"
keyTakeaways:
  - "理解JavaScript核心概念的实际应用"
  - "掌握代码组织和架构设计"
  - "学习性能优化技巧"
  - "实践安全编码和错误处理"
---
# 解决方案：实时天气应用

## 实现思路

这个解决方案展示了如何构建一个生产级的天气应用：
1. **Fetch API高级用法** - 错误处理、重试、缓存
2. **地理位置集成** - 获取用户位置并显示天气
3. **搜索优化** - 防抖、建议、历史记录
4. **离线支持** - Service Worker缓存策略
5. **状态管理** - 统一的数据流和错误处理

## 完整实现

### weather-app.html

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>实时天气应用</title>
    <style>
        :root {
            --primary: #2196F3;
            --secondary: #FFC107;
            --success: #4CAF50;
            --error: #f44336;
            --background: #f5f5f5;
            --surface: white;
            --text-primary: #212121;
            --text-secondary: #757575;
            --shadow: 0 2px 8px rgba(0,0,0,0.1);
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
        
        .container {
            max-width: 900px;
            margin: 0 auto;
            padding: 20px;
        }
        
        header {
            text-align: center;
            margin-bottom: 30px;
        }
        
        header h1 {
            font-size: 36px;
            font-weight: 300;
            margin-bottom: 10px;
        }
        
        .search-container {
            position: relative;
            background: var(--surface);
            padding: 25px;
            border-radius: 16px;
            box-shadow: var(--shadow);
            margin-bottom: 30px;
        }
        
        .search-form {
            display: flex;
            gap: 12px;
        }
        
        .search-input {
            flex: 1;
            padding: 14px 20px;
            border: 2px solid #e0e0e0;
            border-radius: 30px;
            font-size: 16px;
            transition: all 0.3s;
        }
        
        .search-input:focus {
            outline: none;
            border-color: var(--primary);
            box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1);
        }
        
        .btn {
            padding: 14px 28px;
            border: none;
            border-radius: 30px;
            font-size: 16px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s;
            display: inline-flex;
            align-items: center;
            gap: 8px;
        }
        
        .btn-primary {
            background: var(--primary);
            color: white;
        }
        
        .btn-primary:hover {
            background: #1976D2;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
        }
        
        .btn-secondary {
            background: #f5f5f5;
            color: var(--text-primary);
        }
        
        .btn-secondary:hover {
            background: #e0e0e0;
        }
        
        .suggestions {
            position: absolute;
            top: 100%;
            left: 25px;
            right: 25px;
            background: var(--surface);
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            margin-top: 8px;
            z-index: 100;
            display: none;
            overflow: hidden;
        }
        
        .suggestions.active {
            display: block;
        }
        
        .suggestion-item {
            padding: 12px 20px;
            cursor: pointer;
            display: flex;
            justify-content: space-between;
            align-items: center;
            transition: background 0.2s;
        }
        
        .suggestion-item:hover {
            background: #f5f5f5;
        }
        
        .suggestion-type {
            font-size: 12px;
            color: var(--text-secondary);
            background: #e0e0e0;
            padding: 2px 8px;
            border-radius: 12px;
        }
        
        .weather-card {
            background: var(--surface);
            border-radius: 16px;
            box-shadow: var(--shadow);
            padding: 30px;
            margin-bottom: 30px;
            animation: fadeIn 0.5s ease-out;
        }
        
        @keyframes fadeIn {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .weather-header {
            display: flex;
            justify-content: space-between;
            align-items: start;
            margin-bottom: 30px;
        }
        
        .location-info h2 {
            font-size: 28px;
            font-weight: 400;
            margin-bottom: 5px;
        }
        
        .location-meta {
            color: var(--text-secondary);
            font-size: 14px;
        }
        
        .favorite-btn {
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            transition: transform 0.3s;
        }
        
        .favorite-btn:hover {
            transform: scale(1.2);
        }
        
        .favorite-btn.active {
            color: var(--secondary);
        }
        
        .current-weather {
            display: flex;
            align-items: center;
            gap: 40px;
            margin-bottom: 30px;
        }
        
        .weather-icon {
            font-size: 80px;
        }
        
        .temperature-display {
            flex: 1;
        }
        
        .temperature {
            font-size: 64px;
            font-weight: 200;
            line-height: 1;
        }
        
        .weather-description {
            font-size: 20px;
            color: var(--text-secondary);
            margin-top: 8px;
        }
        
        .weather-details {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 20px;
        }
        
        .detail-card {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 12px;
            text-align: center;
        }
        
        .detail-icon {
            font-size: 24px;
            margin-bottom: 8px;
        }
        
        .detail-label {
            font-size: 13px;
            color: var(--text-secondary);
            margin-bottom: 4px;
        }
        
        .detail-value {
            font-size: 20px;
            font-weight: 500;
        }
        
        .forecast-container {
            background: var(--surface);
            border-radius: 16px;
            box-shadow: var(--shadow);
            padding: 25px;
            margin-bottom: 30px;
        }
        
        .forecast-header {
            font-size: 20px;
            margin-bottom: 20px;
        }
        
        .forecast-scroll {
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
        }
        
        .forecast-list {
            display: flex;
            gap: 15px;
            padding-bottom: 10px;
        }
        
        .forecast-item {
            flex-shrink: 0;
            background: #f8f9fa;
            padding: 20px;
            border-radius: 12px;
            text-align: center;
            min-width: 120px;
            transition: all 0.3s;
        }
        
        .forecast-item:hover {
            transform: translateY(-4px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        
        .forecast-day {
            font-size: 14px;
            color: var(--text-secondary);
            margin-bottom: 8px;
        }
        
        .forecast-icon {
            font-size: 32px;
            margin: 12px 0;
        }
        
        .forecast-temps {
            display: flex;
            justify-content: center;
            gap: 8px;
            font-size: 16px;
        }
        
        .temp-high {
            font-weight: 500;
        }
        
        .temp-low {
            color: var(--text-secondary);
        }
        
        .favorites-container {
            background: var(--surface);
            border-radius: 16px;
            box-shadow: var(--shadow);
            padding: 25px;
        }
        
        .favorites-header {
            font-size: 20px;
            margin-bottom: 20px;
        }
        
        .favorites-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
            gap: 15px;
        }
        
        .favorite-card {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 12px;
            text-align: center;
            cursor: pointer;
            transition: all 0.3s;
            position: relative;
        }
        
        .favorite-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            background: #e8f5e9;
        }
        
        .favorite-name {
            font-weight: 500;
            margin-bottom: 8px;
        }
        
        .favorite-temp {
            font-size: 24px;
            color: var(--primary);
        }
        
        .favorite-weather {
            font-size: 12px;
            color: var(--text-secondary);
            margin-top: 4px;
        }
        
        .remove-favorite {
            position: absolute;
            top: 5px;
            right: 5px;
            background: none;
            border: none;
            color: var(--text-secondary);
            cursor: pointer;
            opacity: 0;
            transition: opacity 0.3s;
        }
        
        .favorite-card:hover .remove-favorite {
            opacity: 1;
        }
        
        .loading {
            text-align: center;
            padding: 60px;
            color: var(--text-secondary);
        }
        
        .loading-spinner {
            display: inline-block;
            width: 40px;
            height: 40px;
            border: 4px solid #f3f3f3;
            border-top: 4px solid var(--primary);
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 20px;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .error-message {
            background: #ffebee;
            color: var(--error);
            padding: 16px 20px;
            border-radius: 12px;
            margin: 20px 0;
            display: flex;
            align-items: center;
            gap: 12px;
        }
        
        .offline-banner {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: var(--secondary);
            color: #333;
            padding: 12px;
            text-align: center;
            font-weight: 500;
            transform: translateY(-100%);
            transition: transform 0.3s;
            z-index: 1000;
        }
        
        body.offline .offline-banner {
            transform: translateY(0);
        }
        
        .empty-state {
            text-align: center;
            padding: 60px 20px;
            color: var(--text-secondary);
        }
        
        .empty-icon {
            font-size: 64px;
            margin-bottom: 16px;
            opacity: 0.5;
        }
        
        @media (max-width: 600px) {
            .container {
                padding: 15px;
            }
            
            .search-form {
                flex-direction: column;
            }
            
            .current-weather {
                flex-direction: column;
                text-align: center;
                gap: 20px;
            }
            
            .weather-details {
                grid-template-columns: repeat(2, 1fr);
            }
        }
    </style>
</head>
<body>
    <div class="offline-banner">
        🔌 当前处于离线状态，显示缓存数据
    </div>
    
    <div class="container">
        <header>
            <h1>🌤️ 实时天气</h1>
            <p style="color: var(--text-secondary);">获取全球任意城市的天气信息</p>
        </header>
        
        <div class="search-container">
            <form class="search-form" id="searchForm">
                <input 
                    type="text" 
                    class="search-input" 
                    id="searchInput" 
                    placeholder="搜索城市（如：北京、Shanghai、London）"
                    autocomplete="off"
                >
                <button type="submit" class="btn btn-primary">
                    🔍 搜索
                </button>
                <button type="button" class="btn btn-secondary" id="locationBtn">
                    📍 当前位置
                </button>
            </form>
            <div class="suggestions" id="suggestions"></div>
        </div>
        
        <div id="content">
            <div class="empty-state">
                <div class="empty-icon">🌍</div>
                <h3>搜索城市查看天气</h3>
                <p>输入城市名称或使用当前位置</p>
            </div>
        </div>
        
        <div class="favorites-container">
            <h3 class="favorites-header">⭐ 收藏城市</h3>
            <div id="favoritesContent">
                <p style="color: var(--text-secondary); text-align: center; padding: 20px;">
                    暂无收藏城市
                </p>
            </div>
        </div>
    </div>
    
    <script>
        // API配置
        const API_KEY = 'YOUR_API_KEY'; // 替换为你的API密钥
        const BASE_URL = 'https://api.openweathermap.org/data/2.5';
        
        // 全局状态
        const state = {
            currentCity: null,
            favorites: JSON.parse(localStorage.getItem('favorites') || '[]'),
            searchHistory: JSON.parse(localStorage.getItem('searchHistory') || '[]'),
            cache: new Map()
        };
        
        // API客户端
        class WeatherAPI {
            constructor(apiKey) {
                this.apiKey = apiKey;
                this.requestQueue = new Map();
            }
            
            async fetchWithRetry(url, retries = 3) {
                for (let i = 0; i < retries; i++) {
                    try {
                        const controller = new AbortController();
                        const timeoutId = setTimeout(() => controller.abort(), 10000);
                        
                        const response = await fetch(url, {
                            signal: controller.signal
                        });
                        
                        clearTimeout(timeoutId);
                        
                        if (!response.ok) {
                            if (response.status === 404) {
                                throw new Error('城市未找到');
                            }
                            throw new Error(`API错误: ${response.status}`);
                        }
                        
                        return await response.json();
                    } catch (error) {
                        if (i === retries - 1) throw error;
                        if (error.name === 'AbortError') {
                            throw new Error('请求超时');
                        }
                        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
                    }
                }
            }
            
            getCacheKey(type, params) {
                return `${type}_${JSON.stringify(params)}`;
            }
            
            getFromCache(key) {
                const item = state.cache.get(key);
                if (!item) return null;
                
                const age = Date.now() - item.timestamp;
                if (age > 10 * 60 * 1000) { // 10分钟过期
                    state.cache.delete(key);
                    return null;
                }
                
                return item.data;
            }
            
            setCache(key, data) {
                state.cache.set(key, {
                    data,
                    timestamp: Date.now()
                });
                
                // 限制缓存大小
                if (state.cache.size > 50) {
                    const firstKey = state.cache.keys().next().value;
                    state.cache.delete(firstKey);
                }
            }
            
            async getCurrentWeather(city) {
                const cacheKey = this.getCacheKey('weather', { city });
                const cached = this.getFromCache(cacheKey);
                if (cached) return cached;
                
                const url = `${BASE_URL}/weather?q=${encodeURIComponent(city)}&appid=${this.apiKey}&units=metric&lang=zh_cn`;
                const data = await this.fetchWithRetry(url);
                
                this.setCache(cacheKey, data);
                return data;
            }
            
            async getWeatherByCoords(lat, lon) {
                const cacheKey = this.getCacheKey('weather', { lat, lon });
                const cached = this.getFromCache(cacheKey);
                if (cached) return cached;
                
                const url = `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric&lang=zh_cn`;
                const data = await this.fetchWithRetry(url);
                
                this.setCache(cacheKey, data);
                return data;
            }
            
            async getForecast(city) {
                const cacheKey = this.getCacheKey('forecast', { city });
                const cached = this.getFromCache(cacheKey);
                if (cached) return cached;
                
                const url = `${BASE_URL}/forecast?q=${encodeURIComponent(city)}&appid=${this.apiKey}&units=metric&lang=zh_cn&cnt=40`;
                const data = await this.fetchWithRetry(url);
                
                // 处理预报数据，按天分组
                const dailyData = this.processForecastData(data);
                this.setCache(cacheKey, dailyData);
                return dailyData;
            }
            
            processForecastData(data) {
                const daily = new Map();
                
                data.list.forEach(item => {
                    const date = new Date(item.dt * 1000).toLocaleDateString();
                    
                    if (!daily.has(date)) {
                        daily.set(date, {
                            date: item.dt,
                            temps: [],
                            weather: item.weather[0],
                            items: []
                        });
                    }
                    
                    const dayData = daily.get(date);
                    dayData.temps.push(item.main.temp);
                    dayData.items.push(item);
                });
                
                return Array.from(daily.values()).slice(0, 7).map(day => ({
                    date: day.date,
                    temp_min: Math.min(...day.temps),
                    temp_max: Math.max(...day.temps),
                    weather: day.weather
                }));
            }
        }
        
        // 初始化API客户端
        const weatherAPI = new WeatherAPI(API_KEY);
        
        // UI控制器
        class UIController {
            constructor() {
                this.elements = {
                    searchForm: document.getElementById('searchForm'),
                    searchInput: document.getElementById('searchInput'),
                    locationBtn: document.getElementById('locationBtn'),
                    suggestions: document.getElementById('suggestions'),
                    content: document.getElementById('content'),
                    favoritesContent: document.getElementById('favoritesContent')
                };
                
                this.setupEventListeners();
                this.loadFavorites();
            }
            
            setupEventListeners() {
                // 搜索表单
                this.elements.searchForm.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const city = this.elements.searchInput.value.trim();
                    if (city) {
                        await this.searchWeather(city);
                        this.addToSearchHistory(city);
                    }
                });
                
                // 搜索建议
                this.elements.searchInput.addEventListener('input', 
                    this.debounce((e) => this.showSuggestions(e.target.value), 300)
                );
                
                // 关闭建议
                document.addEventListener('click', (e) => {
                    if (!e.target.closest('.search-container')) {
                        this.hideSuggestions();
                    }
                });
                
                // 当前位置
                this.elements.locationBtn.addEventListener('click', () => {
                    this.getCurrentLocationWeather();
                });
                
                // 在线/离线状态
                window.addEventListener('online', () => {
                    document.body.classList.remove('offline');
                    this.showMessage('已恢复网络连接', 'success');
                });
                
                window.addEventListener('offline', () => {
                    document.body.classList.add('offline');
                });
            }
            
            async searchWeather(city) {
                try {
                    this.showLoading();
                    
                    const [weather, forecast] = await Promise.all([
                        weatherAPI.getCurrentWeather(city),
                        weatherAPI.getForecast(city)
                    ]);
                    
                    state.currentCity = {
                        name: weather.name,
                        country: weather.sys.country,
                        coord: weather.coord
                    };
                    
                    this.displayWeather(weather, forecast);
                    this.elements.searchInput.value = '';
                    this.hideSuggestions();
                    
                } catch (error) {
                    this.showError(error.message);
                }
            }
            
            async getCurrentLocationWeather() {
                try {
                    this.showLoading();
                    
                    const position = await this.getCurrentPosition();
                    const weather = await weatherAPI.getWeatherByCoords(
                        position.coords.latitude,
                        position.coords.longitude
                    );
                    
                    const forecast = await weatherAPI.getForecast(weather.name);
                    
                    state.currentCity = {
                        name: weather.name,
                        country: weather.sys.country,
                        coord: weather.coord
                    };
                    
                    this.displayWeather(weather, forecast);
                    
                } catch (error) {
                    if (error.code === 1) {
                        this.showError('请允许访问您的位置');
                    } else {
                        this.showError('无法获取位置信息');
                    }
                }
            }
            
            getCurrentPosition() {
                return new Promise((resolve, reject) => {
                    if (!navigator.geolocation) {
                        reject(new Error('浏览器不支持地理位置'));
                        return;
                    }
                    
                    navigator.geolocation.getCurrentPosition(resolve, reject, {
                        timeout: 10000,
                        enableHighAccuracy: true
                    });
                });
            }
            
            displayWeather(weather, forecast) {
                const html = `
                    <div class="weather-card">
                        <div class="weather-header">
                            <div class="location-info">
                                <h2>${weather.name}, ${weather.sys.country}</h2>
                                <div class="location-meta">
                                    ${new Date().toLocaleString('zh-CN')}
                                </div>
                            </div>
                            <button class="favorite-btn ${this.isFavorite(weather.name) ? 'active' : ''}" 
                                    onclick="ui.toggleFavorite('${weather.name}', '${weather.sys.country}', ${weather.coord.lat}, ${weather.coord.lon})">
                                ${this.isFavorite(weather.name) ? '⭐' : '☆'}
                            </button>
                        </div>
                        
                        <div class="current-weather">
                            <div class="weather-icon">${this.getWeatherIcon(weather.weather[0].main)}</div>
                            <div class="temperature-display">
                                <div class="temperature">${Math.round(weather.main.temp)}°</div>
                                <div class="weather-description">${weather.weather[0].description}</div>
                            </div>
                        </div>
                        
                        <div class="weather-details">
                            <div class="detail-card">
                                <div class="detail-icon">🌡️</div>
                                <div class="detail-label">体感温度</div>
                                <div class="detail-value">${Math.round(weather.main.feels_like)}°</div>
                            </div>
                            <div class="detail-card">
                                <div class="detail-icon">💧</div>
                                <div class="detail-label">湿度</div>
                                <div class="detail-value">${weather.main.humidity}%</div>
                            </div>
                            <div class="detail-card">
                                <div class="detail-icon">💨</div>
                                <div class="detail-label">风速</div>
                                <div class="detail-value">${weather.wind.speed} m/s</div>
                            </div>
                            <div class="detail-card">
                                <div class="detail-icon">🔻</div>
                                <div class="detail-label">气压</div>
                                <div class="detail-value">${weather.main.pressure} hPa</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="forecast-container">
                        <h3 class="forecast-header">7天预报</h3>
                        <div class="forecast-scroll">
                            <div class="forecast-list">
                                ${forecast.map(day => this.createForecastItem(day)).join('')}
                            </div>
                        </div>
                    </div>
                `;
                
                this.elements.content.innerHTML = html;
            }
            
            createForecastItem(day) {
                const date = new Date(day.date * 1000);
                const dayName = date.toLocaleDateString('zh-CN', { weekday: 'short' });
                
                return `
                    <div class="forecast-item">
                        <div class="forecast-day">${dayName}</div>
                        <div class="forecast-icon">${this.getWeatherIcon(day.weather.main)}</div>
                        <div class="forecast-temps">
                            <span class="temp-high">${Math.round(day.temp_max)}°</span>
                            <span class="temp-low">${Math.round(day.temp_min)}°</span>
                        </div>
                    </div>
                `;
            }
            
            getWeatherIcon(weatherMain) {
                const icons = {
                    'Clear': '☀️',
                    'Clouds': '☁️',
                    'Rain': '🌧️',
                    'Drizzle': '🌦️',
                    'Thunderstorm': '⛈️',
                    'Snow': '🌨️',
                    'Mist': '🌫️',
                    'Fog': '🌫️',
                    'Haze': '🌫️'
                };
                return icons[weatherMain] || '🌡️';
            }
            
            showSuggestions(query) {
                if (query.length < 2) {
                    this.hideSuggestions();
                    return;
                }
                
                const suggestions = this.getSuggestions(query);
                
                if (suggestions.length === 0) {
                    this.hideSuggestions();
                    return;
                }
                
                const html = suggestions.map(item => `
                    <div class="suggestion-item" onclick="ui.selectSuggestion('${item.name}')">
                        <span>${item.name}</span>
                        <span class="suggestion-type">${item.type}</span>
                    </div>
                `).join('');
                
                this.elements.suggestions.innerHTML = html;
                this.elements.suggestions.classList.add('active');
            }
            
            getSuggestions(query) {
                const q = query.toLowerCase();
                const suggestions = [];
                
                // 从搜索历史
                state.searchHistory.forEach(city => {
                    if (city.toLowerCase().includes(q)) {
                        suggestions.push({ name: city, type: '历史' });
                    }
                });
                
                // 从收藏
                state.favorites.forEach(fav => {
                    if (fav.name.toLowerCase().includes(q) && 
                        !suggestions.find(s => s.name === fav.name)) {
                        suggestions.push({ name: fav.name, type: '收藏' });
                    }
                });
                
                // 预定义城市
                const cities = ['北京', '上海', '广州', '深圳', '成都', '杭州', 
                               'London', 'New York', 'Tokyo', 'Paris'];
                cities.forEach(city => {
                    if (city.toLowerCase().includes(q) && 
                        !suggestions.find(s => s.name === city)) {
                        suggestions.push({ name: city, type: '推荐' });
                    }
                });
                
                return suggestions.slice(0, 5);
            }
            
            selectSuggestion(city) {
                this.elements.searchInput.value = city;
                this.hideSuggestions();
                this.searchWeather(city);
            }
            
            hideSuggestions() {
                this.elements.suggestions.classList.remove('active');
            }
            
            addToSearchHistory(city) {
                const history = state.searchHistory.filter(c => c !== city);
                history.unshift(city);
                state.searchHistory = history.slice(0, 10);
                localStorage.setItem('searchHistory', JSON.stringify(state.searchHistory));
            }
            
            toggleFavorite(name, country, lat, lon) {
                const index = state.favorites.findIndex(f => f.name === name);
                
                if (index > -1) {
                    state.favorites.splice(index, 1);
                    this.showMessage('已从收藏中移除', 'info');
                } else {
                    state.favorites.push({ name, country, lat, lon });
                    this.showMessage('已添加到收藏', 'success');
                }
                
                localStorage.setItem('favorites', JSON.stringify(state.favorites));
                this.loadFavorites();
                
                // 更新按钮状态
                const btn = document.querySelector('.favorite-btn');
                if (btn) {
                    btn.classList.toggle('active');
                    btn.textContent = this.isFavorite(name) ? '⭐' : '☆';
                }
            }
            
            isFavorite(city) {
                return state.favorites.some(f => f.name === city);
            }
            
            async loadFavorites() {
                if (state.favorites.length === 0) {
                    this.elements.favoritesContent.innerHTML = `
                        <p style="color: var(--text-secondary); text-align: center; padding: 20px;">
                            暂无收藏城市
                        </p>
                    `;
                    return;
                }
                
                const html = `
                    <div class="favorites-grid">
                        ${state.favorites.map(fav => this.createFavoriteCard(fav)).join('')}
                    </div>
                `;
                
                this.elements.favoritesContent.innerHTML = html;
                
                // 异步加载收藏城市的天气
                state.favorites.forEach(async (fav) => {
                    try {
                        const weather = await weatherAPI.getWeatherByCoords(fav.lat, fav.lon);
                        this.updateFavoriteCard(fav.name, weather);
                    } catch (error) {
                        console.error(`加载${fav.name}天气失败:`, error);
                    }
                });
            }
            
            createFavoriteCard(fav) {
                return `
                    <div class="favorite-card" onclick="ui.searchWeather('${fav.name}')" data-city="${fav.name}">
                        <button class="remove-favorite" onclick="event.stopPropagation(); ui.removeFavorite('${fav.name}')">
                            ✕
                        </button>
                        <div class="favorite-name">${fav.name}</div>
                        <div class="favorite-temp">--°</div>
                        <div class="favorite-weather">加载中...</div>
                    </div>
                `;
            }
            
            updateFavoriteCard(city, weather) {
                const card = document.querySelector(`[data-city="${city}"]`);
                if (card) {
                    card.querySelector('.favorite-temp').textContent = 
                        `${Math.round(weather.main.temp)}°`;
                    card.querySelector('.favorite-weather').textContent = 
                        weather.weather[0].description;
                }
            }
            
            removeFavorite(city) {
                state.favorites = state.favorites.filter(f => f.name !== city);
                localStorage.setItem('favorites', JSON.stringify(state.favorites));
                this.loadFavorites();
                this.showMessage('已从收藏中移除', 'info');
            }
            
            showLoading() {
                this.elements.content.innerHTML = `
                    <div class="loading">
                        <div class="loading-spinner"></div>
                        <p>加载中...</p>
                    </div>
                `;
            }
            
            showError(message) {
                this.elements.content.innerHTML = `
                    <div class="error-message">
                        <span>⚠️</span>
                        <span>${message}</span>
                    </div>
                `;
            }
            
            showMessage(message, type = 'info') {
                const colors = {
                    success: var(--success),
                    error: var(--error),
                    info: var(--primary)
                };
                
                const toast = document.createElement('div');
                toast.style.cssText = `
                    position: fixed;
                    bottom: 30px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: ${colors[type] || colors.info};
                    color: white;
                    padding: 16px 24px;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                    z-index: 1000;
                    animation: slideUp 0.3s ease-out;
                `;
                toast.textContent = message;
                
                document.body.appendChild(toast);
                
                setTimeout(() => {
                    toast.style.animation = 'slideDown 0.3s ease-out';
                    setTimeout(() => toast.remove(), 300);
                }, 3000);
            }
            
            debounce(func, wait) {
                let timeout;
                return function(...args) {
                    clearTimeout(timeout);
                    timeout = setTimeout(() => func.apply(this, args), wait);
                };
            }
        }
        
        // Service Worker注册
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('sw.js').catch(console.error);
        }
        
        // 初始化UI
        const ui = new UIController();
        
        // 添加动画样式
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideUp {
                from { transform: translate(-50%, 20px); opacity: 0; }
                to { transform: translate(-50%, 0); opacity: 1; }
            }
            @keyframes slideDown {
                from { transform: translate(-50%, 0); opacity: 1; }
                to { transform: translate(-50%, 20px); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
        
        // Service Worker内容（保存为sw.js）
        const SW_CODE = `
const CACHE_NAME = 'weather-app-v1';
const urlsToCache = [
    '/',
    '/weather-app.html',
    '/weather-app.css',
    '/weather-app.js'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }
                return fetch(event.request);
            })
    );
});

self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
`;
        
        // 检查是否需要显示离线状态
        if (!navigator.onLine) {
            document.body.classList.add('offline');
        }
    </script>
</body>
</html>
```

## 关键实现细节

### 1. 错误处理和重试机制

```javascript
async fetchWithRetry(url, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            // 添加超时控制
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);
            
            const response = await fetch(url, { signal: controller.signal });
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`API错误: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            if (i === retries - 1) throw error;
            // 指数退避
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        }
    }
}
```

### 2. 智能缓存策略

- 设置10分钟缓存时间
- 限制缓存大小防止内存溢出
- 为不同类型的请求生成唯一缓存键

### 3. 搜索优化

- 防抖处理减少API调用
- 综合搜索历史、收藏和推荐
- 实时搜索建议

### 4. 离线支持

- Service Worker缓存静态资源
- 显示离线状态提示
- 使用缓存数据保证基本功能

### 5. 用户体验

- 流畅的动画效果
- 加载和错误状态处理
- 响应式设计适配移动端

## 扩展建议

1. **添加更多天气数据** - 如日出日落、能见度、UV指数
2. **天气地图集成** - 使用地图API显示天气分布
3. **多语言支持** - 根据用户偏好切换语言
4. **天气预警** - 使用Notification API推送恶劣天气
5. **数据可视化** - 添加图表展示温度趋势

这个解决方案展示了如何构建一个功能完整、用户体验优秀的现代Web应用！