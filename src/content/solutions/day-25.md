---
day: 25
exerciseTitle: "React基础组件实现"
approach: "使用函数组件、TypeScript接口和JSX创建可复用的React组件，实现数据展示和基本交互功能"
files:
  - filename: "ProfileCard.tsx"
    content: |
      // ProfileCard.tsx - 个人名片组件
      import React from 'react';
      
      interface ProfileData {
        name: string;
        title: string;
        email: string;
        bio?: string;
        avatar?: string;
        skills?: string[];
      }
      
      interface ProfileCardProps {
        profile: ProfileData;
      }
      
      const ProfileCard: React.FC<ProfileCardProps> = ({ profile }) => {
        const { name, title, email, bio, avatar, skills } = profile;
        
        const cardStyles: React.CSSProperties = {
          width: '350px',
          padding: '30px',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          backgroundColor: '#ffffff',
          textAlign: 'center',
          fontFamily: 'Arial, sans-serif',
        };
        
        const avatarStyles: React.CSSProperties = {
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          objectFit: 'cover',
          marginBottom: '20px',
          border: '4px solid #e0e0e0',
        };
        
        const nameStyles: React.CSSProperties = {
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#333',
          margin: '10px 0',
        };
        
        const titleStyles: React.CSSProperties = {
          fontSize: '16px',
          color: '#666',
          marginBottom: '15px',
        };
        
        const emailStyles: React.CSSProperties = {
          fontSize: '14px',
          color: '#0066cc',
          textDecoration: 'none',
          display: 'inline-block',
          marginBottom: '20px',
        };
        
        const bioStyles: React.CSSProperties = {
          fontSize: '14px',
          color: '#555',
          lineHeight: '1.6',
          marginBottom: '20px',
          textAlign: 'left',
        };
        
        const skillsContainerStyles: React.CSSProperties = {
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          justifyContent: 'center',
        };
        
        const skillTagStyles: React.CSSProperties = {
          padding: '4px 12px',
          backgroundColor: '#e3f2fd',
          color: '#1976d2',
          borderRadius: '16px',
          fontSize: '12px',
          fontWeight: '500',
        };
        
        return (
          <div style={cardStyles}>
            <img 
              src={avatar || `https://ui-avatars.com/api/?name=${name}&size=120`}
              alt={`${name}'s avatar`}
              style={avatarStyles}
            />
            
            <h2 style={nameStyles}>{name}</h2>
            <p style={titleStyles}>{title}</p>
            
            <a href={`mailto:${email}`} style={emailStyles}>
              {email}
            </a>
            
            {bio && (
              <p style={bioStyles}>{bio}</p>
            )}
            
            {skills && skills.length > 0 && (
              <div style={skillsContainerStyles}>
                {skills.map((skill, index) => (
                  <span key={index} style={skillTagStyles}>
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>
        );
      };
      
      export default ProfileCard;
      
  - filename: "WeatherWidget.tsx"
    content: |
      // WeatherWidget.tsx - 天气信息组件
      import React, { useState } from 'react';
      
      interface WeatherData {
        city: string;
        temperature: number; // 摄氏度
        condition: 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'stormy';
        humidity: number;
        windSpeed: number;
      }
      
      interface WeatherWidgetProps {
        weather: WeatherData;
        onRefresh?: () => void;
      }
      
      const WeatherWidget: React.FC<WeatherWidgetProps> = ({ weather, onRefresh }) => {
        const [isCelsius, setIsCelsius] = useState(true);
        const [isRefreshing, setIsRefreshing] = useState(false);
        
        const weatherIcons = {
          sunny: '☀️',
          cloudy: '☁️',
          rainy: '🌧️',
          snowy: '❄️',
          stormy: '⛈️',
        };
        
        const weatherColors = {
          sunny: '#FFD700',
          cloudy: '#B0C4DE',
          rainy: '#4682B4',
          snowy: '#87CEEB',
          stormy: '#483D8B',
        };
        
        const convertToFahrenheit = (celsius: number): number => {
          return Math.round(celsius * 9/5 + 32);
        };
        
        const displayTemp = isCelsius 
          ? weather.temperature 
          : convertToFahrenheit(weather.temperature);
        
        const tempUnit = isCelsius ? '°C' : '°F';
        
        const handleRefresh = async () => {
          setIsRefreshing(true);
          if (onRefresh) {
            await onRefresh();
          }
          setTimeout(() => setIsRefreshing(false), 1000);
        };
        
        const widgetStyles: React.CSSProperties = {
          width: '300px',
          padding: '25px',
          borderRadius: '16px',
          background: `linear-gradient(135deg, ${weatherColors[weather.condition]}22, ${weatherColors[weather.condition]}44)`,
          border: `2px solid ${weatherColors[weather.condition]}`,
          fontFamily: 'Arial, sans-serif',
        };
        
        const headerStyles: React.CSSProperties = {
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        };
        
        const cityStyles: React.CSSProperties = {
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#333',
        };
        
        const refreshButtonStyles: React.CSSProperties = {
          background: 'none',
          border: 'none',
          fontSize: '20px',
          cursor: 'pointer',
          transition: 'transform 0.3s',
          transform: isRefreshing ? 'rotate(360deg)' : 'rotate(0deg)',
        };
        
        const mainInfoStyles: React.CSSProperties = {
          textAlign: 'center',
          marginBottom: '20px',
        };
        
        const iconStyles: React.CSSProperties = {
          fontSize: '64px',
          marginBottom: '10px',
        };
        
        const tempStyles: React.CSSProperties = {
          fontSize: '48px',
          fontWeight: 'bold',
          color: weather.temperature < 10 ? '#4169E1' : 
                 weather.temperature > 25 ? '#FF6347' : '#333',
          cursor: 'pointer',
          userSelect: 'none',
        };
        
        const conditionStyles: React.CSSProperties = {
          fontSize: '18px',
          color: '#666',
          textTransform: 'capitalize',
          marginTop: '5px',
        };
        
        const detailsStyles: React.CSSProperties = {
          display: 'flex',
          justifyContent: 'space-around',
          paddingTop: '20px',
          borderTop: '1px solid #ddd',
        };
        
        const detailItemStyles: React.CSSProperties = {
          textAlign: 'center',
        };
        
        const detailLabelStyles: React.CSSProperties = {
          fontSize: '12px',
          color: '#888',
          marginBottom: '4px',
        };
        
        const detailValueStyles: React.CSSProperties = {
          fontSize: '16px',
          fontWeight: 'bold',
          color: '#333',
        };
        
        return (
          <div style={widgetStyles}>
            <div style={headerStyles}>
              <h3 style={cityStyles}>{weather.city}</h3>
              <button 
                style={refreshButtonStyles}
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                🔄
              </button>
            </div>
            
            <div style={mainInfoStyles}>
              <div style={iconStyles}>
                {weatherIcons[weather.condition]}
              </div>
              
              <div 
                style={tempStyles}
                onClick={() => setIsCelsius(!isCelsius)}
                title="点击切换温度单位"
              >
                {displayTemp}{tempUnit}
              </div>
              
              <div style={conditionStyles}>
                {weather.condition}
              </div>
            </div>
            
            <div style={detailsStyles}>
              <div style={detailItemStyles}>
                <div style={detailLabelStyles}>湿度</div>
                <div style={detailValueStyles}>{weather.humidity}%</div>
              </div>
              
              <div style={detailItemStyles}>
                <div style={detailLabelStyles}>风速</div>
                <div style={detailValueStyles}>{weather.windSpeed} km/h</div>
              </div>
            </div>
          </div>
        );
      };
      
      export default WeatherWidget;
      
  - filename: "ProductList.tsx"
    content: |
      // ProductList.tsx - 产品列表组件
      import React, { useState } from 'react';
      
      interface Product {
        id: number;
        name: string;
        price: number;
        description: string;
        category: string;
        image: string;
        inStock: boolean;
      }
      
      interface ProductListProps {
        products: Product[];
        onAddToCart?: (productId: number) => void;
      }
      
      const ProductList: React.FC<ProductListProps> = ({ products, onAddToCart }) => {
        const [selectedCategory, setSelectedCategory] = useState<string>('all');
        const [sortBy, setSortBy] = useState<'name' | 'price'>('name');
        
        // 获取所有类别
        const categories = ['all', ...new Set(products.map(p => p.category))];
        
        // 过滤和排序产品
        const filteredProducts = products
          .filter(product => selectedCategory === 'all' || product.category === selectedCategory)
          .sort((a, b) => {
            if (sortBy === 'name') {
              return a.name.localeCompare(b.name);
            }
            return a.price - b.price;
          });
        
        const containerStyles: React.CSSProperties = {
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '20px',
          fontFamily: 'Arial, sans-serif',
        };
        
        const controlsStyles: React.CSSProperties = {
          marginBottom: '30px',
          display: 'flex',
          gap: '20px',
          flexWrap: 'wrap',
          alignItems: 'center',
        };
        
        const selectStyles: React.CSSProperties = {
          padding: '8px 12px',
          borderRadius: '6px',
          border: '1px solid #ddd',
          fontSize: '14px',
          cursor: 'pointer',
        };
        
        const gridStyles: React.CSSProperties = {
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '20px',
        };
        
        return (
          <div style={containerStyles}>
            <h2 style={{ marginBottom: '20px' }}>产品列表</h2>
            
            <div style={controlsStyles}>
              <div>
                <label style={{ marginRight: '10px' }}>分类：</label>
                <select 
                  style={selectStyles}
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat === 'all' ? '全部' : cat}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label style={{ marginRight: '10px' }}>排序：</label>
                <select 
                  style={selectStyles}
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'name' | 'price')}
                >
                  <option value="name">按名称</option>
                  <option value="price">按价格</option>
                </select>
              </div>
            </div>
            
            <div style={gridStyles}>
              {filteredProducts.map(product => (
                <ProductItem 
                  key={product.id} 
                  product={product} 
                  onAddToCart={onAddToCart}
                />
              ))}
            </div>
          </div>
        );
      };
      
      // 产品项组件
      const ProductItem: React.FC<{ 
        product: Product; 
        onAddToCart?: (productId: number) => void;
      }> = ({ product, onAddToCart }) => {
        const [isHovered, setIsHovered] = useState(false);
        
        const cardStyles: React.CSSProperties = {
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
          overflow: 'hidden',
          transition: 'transform 0.3s, box-shadow 0.3s',
          transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
          boxShadow: isHovered ? '0 8px 16px rgba(0,0,0,0.1)' : '0 2px 4px rgba(0,0,0,0.05)',
          opacity: product.inStock ? 1 : 0.6,
          position: 'relative',
        };
        
        const imageStyles: React.CSSProperties = {
          width: '100%',
          height: '200px',
          objectFit: 'cover',
        };
        
        const contentStyles: React.CSSProperties = {
          padding: '16px',
        };
        
        const nameStyles: React.CSSProperties = {
          fontSize: '18px',
          fontWeight: 'bold',
          marginBottom: '8px',
          color: '#333',
        };
        
        const priceStyles: React.CSSProperties = {
          fontSize: '20px',
          color: '#e91e63',
          fontWeight: 'bold',
          marginBottom: '8px',
        };
        
        const descriptionStyles: React.CSSProperties = {
          fontSize: '14px',
          color: '#666',
          marginBottom: '12px',
          height: isHovered ? 'auto' : '40px',
          overflow: 'hidden',
          transition: 'height 0.3s',
        };
        
        const buttonStyles: React.CSSProperties = {
          width: '100%',
          padding: '10px',
          backgroundColor: product.inStock ? '#4caf50' : '#ccc',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          fontSize: '16px',
          fontWeight: 'bold',
          cursor: product.inStock ? 'pointer' : 'not-allowed',
          transition: 'background-color 0.3s',
        };
        
        const outOfStockStyles: React.CSSProperties = {
          position: 'absolute',
          top: '10px',
          right: '10px',
          backgroundColor: '#f44336',
          color: 'white',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: 'bold',
        };
        
        return (
          <div 
            style={cardStyles}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <img 
              src={product.image || `https://via.placeholder.com/280x200?text=${product.name}`}
              alt={product.name}
              style={imageStyles}
            />
            
            {!product.inStock && (
              <div style={outOfStockStyles}>缺货</div>
            )}
            
            <div style={contentStyles}>
              <h3 style={nameStyles}>{product.name}</h3>
              <p style={priceStyles}>¥{product.price.toFixed(2)}</p>
              <p style={descriptionStyles}>{product.description}</p>
              
              <button 
                style={buttonStyles}
                disabled={!product.inStock}
                onClick={() => onAddToCart && onAddToCart(product.id)}
                onMouseEnter={(e) => {
                  if (product.inStock) {
                    e.currentTarget.style.backgroundColor = '#45a049';
                  }
                }}
                onMouseLeave={(e) => {
                  if (product.inStock) {
                    e.currentTarget.style.backgroundColor = '#4caf50';
                  }
                }}
              >
                {product.inStock ? '加入购物车' : '暂时缺货'}
              </button>
            </div>
          </div>
        );
      };
      
      export default ProductList;
      
  - filename: "App.tsx"
    content: |
      // App.tsx - 展示所有组件
      import React from 'react';
      import ProfileCard from './components/ProfileCard';
      import WeatherWidget from './components/WeatherWidget';
      import ProductList from './components/ProductList';
      
      // 模拟数据
      const profileData = {
        name: '张三',
        title: '前端开发工程师',
        email: 'zhangsan@example.com',
        bio: '热爱编程，专注于React和TypeScript开发。有5年的前端开发经验，擅长构建高性能的Web应用。',
        skills: ['React', 'TypeScript', 'Node.js', 'GraphQL', 'Docker'],
      };
      
      const weatherData = {
        city: '北京',
        temperature: 28,
        condition: 'sunny' as const,
        humidity: 65,
        windSpeed: 12,
      };
      
      const productsData = [
        {
          id: 1,
          name: 'MacBook Pro 16"',
          price: 19999,
          description: '强大的性能，出色的显示效果，专为专业人士打造的笔记本电脑。',
          category: '电脑',
          image: '',
          inStock: true,
        },
        {
          id: 2,
          name: 'iPhone 15 Pro',
          price: 9999,
          description: '最新款iPhone，搭载A17 Pro芯片，支持钛金属设计。',
          category: '手机',
          image: '',
          inStock: true,
        },
        {
          id: 3,
          name: 'AirPods Pro',
          price: 1999,
          description: '主动降噪，透明模式，带来沉浸式的音频体验。',
          category: '配件',
          image: '',
          inStock: false,
        },
        {
          id: 4,
          name: 'iPad Air',
          price: 4999,
          description: '轻薄设计，强大性能，完美的创作工具。',
          category: '平板',
          image: '',
          inStock: true,
        },
      ];
      
      function App() {
        const appStyles: React.CSSProperties = {
          minHeight: '100vh',
          backgroundColor: '#f5f5f5',
          padding: '40px 20px',
        };
        
        const sectionStyles: React.CSSProperties = {
          marginBottom: '60px',
        };
        
        const titleStyles: React.CSSProperties = {
          fontSize: '32px',
          textAlign: 'center',
          marginBottom: '40px',
          color: '#333',
        };
        
        const flexContainerStyles: React.CSSProperties = {
          display: 'flex',
          gap: '40px',
          flexWrap: 'wrap',
          justifyContent: 'center',
          marginBottom: '60px',
        };
        
        const handleAddToCart = (productId: number) => {
          console.log(`产品 ${productId} 已添加到购物车`);
          alert(`产品已添加到购物车！`);
        };
        
        const handleWeatherRefresh = () => {
          console.log('刷新天气数据...');
          // 这里可以实现真实的API调用
        };
        
        return (
          <div style={appStyles}>
            <h1 style={titleStyles}>React 基础组件展示</h1>
            
            <div style={flexContainerStyles}>
              <section style={sectionStyles}>
                <ProfileCard profile={profileData} />
              </section>
              
              <section style={sectionStyles}>
                <WeatherWidget 
                  weather={weatherData} 
                  onRefresh={handleWeatherRefresh}
                />
              </section>
            </div>
            
            <section>
              <ProductList 
                products={productsData}
                onAddToCart={handleAddToCart}
              />
            </section>
          </div>
        );
      }
      
      export default App;
      
keyTakeaways:
  - "React组件使用函数和JSX创建可复用的UI元素"
  - "TypeScript接口定义确保了props类型安全"
  - "条件渲染使用三元运算符和逻辑与运算符实现"
  - "列表渲染需要使用map方法并提供唯一的key"
  - "内联样式通过JavaScript对象定义，属性名使用驼峰命名"
---