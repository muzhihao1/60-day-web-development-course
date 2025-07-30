// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/index.js',
    '!src/reportWebVitals.js',
    '!**/*.stories.js'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx}',
    '<rootDir>/src/**/*.{spec,test}.{js,jsx}'
  ],
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest'
  }
};
// src/setupTests.js
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { server } from './mocks/server';
// 启用MSW
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  cleanup();
  server.resetHandlers();
  jest.clearAllMocks();
  localStorage.clear();
  sessionStorage.clear();
});
afterAll(() => server.close());
// 全局Mock
global.matchMedia = global.matchMedia || function() {
  return {
    matches: false,
    addListener: jest.fn(),
    removeListener: jest.fn()
  };
};
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn()
}));
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn()
}));
// src/test-utils.js
import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './store/rootReducer';
export function renderWithProviders(
  ui,
  {
    preloadedState = {},
    store = configureStore({ 
      reducer: rootReducer, 
      preloadedState 
    }),
    ...renderOptions
  } = {}
) {
  function Wrapper({ children }) {
    return (
      <Provider store={store}>
        <BrowserRouter>
          {children}
        </BrowserRouter>
      </Provider>
    );
  }
  
  return { 
    store, 
    ...render(ui, { wrapper: Wrapper, ...renderOptions }) 
  };
}
// 测试数据生成器
export const testDataFactory = {
  user: (overrides = {}) => ({
    id: Math.random().toString(36).substr(2, 9),
    email: `test${Date.now()}@example.com`,
    name: 'Test User',
    role: 'user',
    ...overrides
  }),
  project: (overrides = {}) => ({
    id: Math.random().toString(36).substr(2, 9),
    name: 'Test Project',
    members: [],
    createdAt: new Date().toISOString(),
    ...overrides
  }),
  task: (overrides = {}) => ({
    id: Math.random().toString(36).substr(2, 9),
    title: 'Test Task',
    status: 'todo',
    priority: 'medium',
    assignee: null,
    dueDate: null,
    createdAt: new Date().toISOString(),
    ...overrides
  })
};
// cypress.config.js
const { defineConfig } = require('cypress');
module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    setupNodeEvents(on, config) {
      // 数据库任务
      on('task', {
        'db:reset': () => {
          // 重置测试数据库
          return null;
        },
        'db:seed': (data) => {
          // 填充测试数据
          return null;
        }
      });
    }
  }
});
// package.json scripts
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --ci --coverage --maxWorkers=2",
    "test:e2e": "cypress run",
    "test:e2e:open": "cypress open",
    "test:all": "npm run test:ci && npm run test:e2e"
  }
}