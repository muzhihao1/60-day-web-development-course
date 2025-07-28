---
day: 36
title: "环境配置与部署实战"
description: "练习React应用的环境配置和部署流程"
difficulty: "intermediate"
estimatedTime: 180
requirements:
  - "理解React应用的构建流程"
  - "掌握环境变量配置"
  - "熟悉常见部署平台"
  - "了解性能优化策略"
exercises:
  - id: "env-config"
    title: "多环境配置系统"
    difficulty: "intermediate"
    description: "创建一个完整的多环境配置系统"
    hints:
      - "使用.env文件管理环境变量"
      - "创建环境配置类"
      - "实现功能开关系统"
  - id: "optimization"
    title: "构建优化实践"
    difficulty: "advanced"
    description: "优化React应用的构建和加载性能"
    hints:
      - "实现代码分割"
      - "配置资源压缩"
      - "添加性能监控"
  - id: "deployment"
    title: "自动化部署流程"
    difficulty: "advanced"
    description: "配置CI/CD和自动化部署"
    hints:
      - "编写GitHub Actions配置"
      - "设置环境变量"
      - "配置健康检查"
---

# Day 36 练习：环境配置与部署

## 练习1：多环境配置系统

创建一个支持开发、测试、生产环境的配置管理系统。

### 要求：

1. **环境变量管理**
   - 创建.env.development、.env.staging、.env.production文件
   - 实现环境变量验证
   - 创建环境配置管理器

2. **功能开关系统**
   - 实现基于环境的功能开关
   - 支持运行时切换
   - 创建开发者面板

3. **API配置**
   - 不同环境使用不同API端点
   - 配置请求超时和重试
   - 添加请求/响应拦截器

### 起始代码：

```jsx
// 创建以下文件结构
// .env.development
// .env.staging  
// .env.production
// src/config/environment.js
// src/components/FeatureFlag.jsx
// src/components/DevPanel.jsx

// 实现环境配置系统
```

## 练习2：构建优化实践

优化React应用的构建配置和运行时性能。

### 要求：

1. **代码分割**
   - 实现路由级别代码分割
   - 添加组件懒加载
   - 配置Webpack chunk命名

2. **资源优化**
   - 图片懒加载和优化
   - CSS和JS压缩
   - 实现资源预加载

3. **性能监控**
   - 集成Web Vitals
   - 添加自定义性能指标
   - 创建性能报告组件

### 实现要点：

```jsx
// 1. 路由配置
// 2. 懒加载组件
// 3. 性能监控Hook
// 4. 构建配置文件
```

## 练习3：自动化部署流程

配置完整的CI/CD流程和多平台部署。

### 要求：

1. **CI/CD配置**
   - 创建GitHub Actions workflow
   - 配置自动化测试
   - 实现构建和部署流程

2. **部署配置**
   - Vercel部署配置
   - Docker容器化
   - Nginx配置优化

3. **监控集成**
   - 错误追踪（Sentry）
   - 性能监控
   - 健康检查端点

### 配置文件模板：

```yaml
# .github/workflows/deploy.yml
# vercel.json
# Dockerfile
# nginx.conf
```

## 挑战任务

### 1. 蓝绿部署

实现蓝绿部署策略：

- 配置两个生产环境
- 实现流量切换
- 添加回滚机制

### 2. A/B测试系统

创建A/B测试框架：

- 基于用户的实验分组
- 功能变体管理
- 数据收集和分析

### 3. 多区域部署

实现全球化部署：

- CDN配置
- 区域性故障转移
- 延迟优化

## 提交要求

1. 完整的环境配置系统
2. 优化后的构建配置
3. CI/CD配置文件
4. 部署文档
5. 性能优化报告

## 评分标准

- 环境配置完整性（25%）
- 构建优化效果（25%）
- 部署流程自动化（25%）
- 监控和错误处理（15%）
- 文档完整性（10%）

## 学习资源

- [12-Factor App](https://12factor.net/)
- [Web Performance Optimization](https://web.dev/fast/)
- [CI/CD Best Practices](https://www.atlassian.com/continuous-delivery/principles)

## 截止时间

请在下一节课开始前完成并提交所有练习。