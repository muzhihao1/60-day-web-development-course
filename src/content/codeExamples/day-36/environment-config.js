// Day 36: 环境配置实战

// ==========================================
// 1. 环境配置管理
// ==========================================

// config/constants.js
export const ENVIRONMENTS = {
  DEVELOPMENT: 'development',
  STAGING: 'staging',
  PRODUCTION: 'production'
};

// config/environment.js
class EnvironmentConfig {
  constructor() {
    this.env = process.env.REACT_APP_ENV || ENVIRONMENTS.DEVELOPMENT;
    this.configs = this.loadConfigs();
  }

  loadConfigs() {
    const baseConfig = {
      appName: 'My React App',
      version: process.env.REACT_APP_VERSION || '1.0.0',
      environment: this.env
    };

    const envConfigs = {
      [ENVIRONMENTS.DEVELOPMENT]: {
        apiUrl: 'http://localhost:3001',
        apiTimeout: 30000,
        enableDebug: true,
        enableDevTools: true,
        logLevel: 'debug',
        features: {
          analytics: false,
          errorReporting: false,
          performanceMonitoring: false,
          newFeature: true // 开发环境测试新功能
        }
      },
      
      [ENVIRONMENTS.STAGING]: {
        apiUrl: process.env.REACT_APP_STAGING_API_URL || 'https://staging-api.myapp.com',
        apiTimeout: 15000,
        enableDebug: true,
        enableDevTools: false,
        logLevel: 'info',
        features: {
          analytics: true,
          errorReporting: true,
          performanceMonitoring: true,
          newFeature: true
        }
      },
      
      [ENVIRONMENTS.PRODUCTION]: {
        apiUrl: process.env.REACT_APP_API_URL || 'https://api.myapp.com',
        apiTimeout: 10000,
        enableDebug: false,
        enableDevTools: false,
        logLevel: 'error',
        features: {
          analytics: true,
          errorReporting: true,
          performanceMonitoring: true,
          newFeature: false // 生产环境关闭实验性功能
        }
      }
    };

    return {
      ...baseConfig,
      ...envConfigs[this.env]
    };
  }

  get(key) {
    return this.configs[key];
  }

  isProduction() {
    return this.env === ENVIRONMENTS.PRODUCTION;
  }

  isDevelopment() {
    return this.env === ENVIRONMENTS.DEVELOPMENT;
  }

  isStaging() {
    return this.env === ENVIRONMENTS.STAGING;
  }

  isFeatureEnabled(featureName) {
    return this.configs.features?.[featureName] || false;
  }
}

export const config = new EnvironmentConfig();

// ==========================================
// 2. API配置管理
// ==========================================

// services/api.config.js
import axios from 'axios';
import { config } from '../config/environment';

// 创建axios实例
const apiClient = axios.create({
  baseURL: config.get('apiUrl'),
  timeout: config.get('apiTimeout'),
  headers: {
    'Content-Type': 'application/json',
    'X-App-Version': config.get('version'),
    'X-Environment': config.get('environment')
  }
});

// 请求拦截器
apiClient.interceptors.request.use(
  (request) => {
    // 开发环境打印请求信息
    if (config.isDevelopment()) {
      console.log(`[API Request] ${request.method?.toUpperCase()} ${request.url}`, request.data);
    }

    // 添加认证token
    const token = localStorage.getItem('authToken');
    if (token) {
      request.headers.Authorization = `Bearer ${token}`;
    }

    return request;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => {
    if (config.isDevelopment()) {
      console.log(`[API Response] ${response.config.url}`, response.data);
    }
    return response;
  },
  (error) => {
    // 错误处理
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // 未授权，清除token并重定向到登录
          localStorage.removeItem('authToken');
          window.location.href = '/login';
          break;
        
        case 403:
          console.error('Access forbidden');
          break;
        
        case 500:
          console.error('Server error');
          break;
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;

// ==========================================
// 3. 功能开关（Feature Flags）
// ==========================================

// utils/featureFlags.js
import { config } from '../config/environment';

export class FeatureFlags {
  static isEnabled(featureName) {
    // 首先检查URL参数（用于测试）
    const urlParams = new URLSearchParams(window.location.search);
    const urlFlag = urlParams.get(`feature_${featureName}`);
    if (urlFlag !== null) {
      return urlFlag === 'true';
    }

    // 检查localStorage（用于本地覆盖）
    const localFlag = localStorage.getItem(`feature_${featureName}`);
    if (localFlag !== null) {
      return localFlag === 'true';
    }

    // 最后使用配置文件中的设置
    return config.isFeatureEnabled(featureName);
  }

  static enableFeature(featureName) {
    localStorage.setItem(`feature_${featureName}`, 'true');
  }

  static disableFeature(featureName) {
    localStorage.setItem(`feature_${featureName}`, 'false');
  }

  static resetFeature(featureName) {
    localStorage.removeItem(`feature_${featureName}`);
  }
}

// React Hook for feature flags
import { useState, useEffect } from 'react';

export function useFeatureFlag(featureName) {
  const [isEnabled, setIsEnabled] = useState(() => 
    FeatureFlags.isEnabled(featureName)
  );

  useEffect(() => {
    // 监听storage事件以响应其他标签页的更改
    const handleStorageChange = (e) => {
      if (e.key === `feature_${featureName}`) {
        setIsEnabled(e.newValue === 'true');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [featureName]);

  return isEnabled;
}

// ==========================================
// 4. 日志管理
// ==========================================

// utils/logger.js
const LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
};

class Logger {
  constructor() {
    this.logLevel = LOG_LEVELS[config.get('logLevel')] || LOG_LEVELS.info;
  }

  debug(...args) {
    if (this.logLevel <= LOG_LEVELS.debug) {
      console.log('[DEBUG]', new Date().toISOString(), ...args);
    }
  }

  info(...args) {
    if (this.logLevel <= LOG_LEVELS.info) {
      console.info('[INFO]', new Date().toISOString(), ...args);
    }
  }

  warn(...args) {
    if (this.logLevel <= LOG_LEVELS.warn) {
      console.warn('[WARN]', new Date().toISOString(), ...args);
    }
  }

  error(...args) {
    if (this.logLevel <= LOG_LEVELS.error) {
      console.error('[ERROR]', new Date().toISOString(), ...args);
      
      // 生产环境发送错误到监控服务
      if (config.isProduction() && window.Sentry) {
        window.Sentry.captureException(new Error(args.join(' ')));
      }
    }
  }

  // 性能日志
  time(label) {
    if (config.isDevelopment()) {
      console.time(label);
    }
  }

  timeEnd(label) {
    if (config.isDevelopment()) {
      console.timeEnd(label);
    }
  }
}

export const logger = new Logger();

// ==========================================
// 5. 环境指示器组件
// ==========================================

import React from 'react';

export function EnvironmentIndicator() {
  if (config.isProduction()) {
    return null; // 生产环境不显示
  }

  const styles = {
    indicator: {
      position: 'fixed',
      bottom: 10,
      right: 10,
      padding: '5px 10px',
      borderRadius: '4px',
      fontSize: '12px',
      fontWeight: 'bold',
      color: 'white',
      zIndex: 9999,
      pointerEvents: 'none'
    },
    development: {
      backgroundColor: '#22c55e'
    },
    staging: {
      backgroundColor: '#f59e0b'
    }
  };

  const envStyle = config.isDevelopment() ? styles.development : styles.staging;

  return (
    <div style={{ ...styles.indicator, ...envStyle }}>
      {config.get('environment').toUpperCase()}
    </div>
  );
}

// ==========================================
// 6. 配置验证
// ==========================================

// utils/configValidator.js
export function validateConfig() {
  const requiredEnvVars = [
    'REACT_APP_ENV',
    'REACT_APP_API_URL',
    'REACT_APP_VERSION'
  ];

  const missingVars = requiredEnvVars.filter(
    varName => !process.env[varName]
  );

  if (missingVars.length > 0) {
    console.warn('Missing environment variables:', missingVars);
    
    if (config.isProduction()) {
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }
  }

  // 验证API URL格式
  try {
    new URL(config.get('apiUrl'));
  } catch (error) {
    throw new Error(`Invalid API URL: ${config.get('apiUrl')}`);
  }

  logger.info('Configuration validated successfully');
}

// ==========================================
// 7. 使用示例
// ==========================================

// App.js
import React from 'react';
import { config } from './config/environment';
import { logger } from './utils/logger';
import { useFeatureFlag } from './utils/featureFlags';
import { EnvironmentIndicator } from './components/EnvironmentIndicator';
import { validateConfig } from './utils/configValidator';

// 应用启动时验证配置
validateConfig();

function App() {
  const isNewFeatureEnabled = useFeatureFlag('newFeature');
  
  React.useEffect(() => {
    logger.info('App initialized', {
      environment: config.get('environment'),
      version: config.get('version'),
      apiUrl: config.get('apiUrl')
    });
  }, []);

  return (
    <div className="app">
      <h1>My React App</h1>
      
      {isNewFeatureEnabled && (
        <div className="new-feature">
          This is a new experimental feature!
        </div>
      )}
      
      {/* 开发工具面板 */}
      {config.get('enableDevTools') && <DevToolsPanel />}
      
      {/* 环境指示器 */}
      <EnvironmentIndicator />
    </div>
  );
}

// 开发工具面板
function DevToolsPanel() {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="dev-tools">
      <button onClick={() => setIsOpen(!isOpen)}>
        Dev Tools
      </button>
      
      {isOpen && (
        <div className="dev-tools-panel">
          <h3>Environment: {config.get('environment')}</h3>
          <p>API URL: {config.get('apiUrl')}</p>
          <p>Version: {config.get('version')}</p>
          
          <h4>Feature Flags</h4>
          <ul>
            {Object.entries(config.get('features')).map(([key, value]) => (
              <li key={key}>
                {key}: {value ? '✓' : '✗'}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;