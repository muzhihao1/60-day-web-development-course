---
title: "多平台部署完整指南"
description: "部署到Vercel、Netlify、GitHub Pages等平台"
---

## 现代Web应用部署指南

### 1. Vercel部署

#### 方法一：通过Vercel CLI

```bash
# 安装Vercel CLI
npm i -g vercel

# 登录Vercel账号
vercel login

# 在项目根目录执行部署
vercel

# 首次部署会询问配置
# ? Set up and deploy "~/portfolio"? [Y/n] Y
# ? Which scope do you want to deploy to? Your Name
# ? Link to existing project? [y/N] N
# ? What's your project's name? developer-portfolio
# ? In which directory is your code located? ./
# ? Want to override the settings? [y/N] N

# 部署到生产环境
vercel --prod
```

#### 方法二：通过Git集成

```json
// vercel.json 配置文件
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/assets/(.*)",
      "headers": {
        "cache-control": "max-age=31536000, immutable"
      }
    },
    {
      "src": "/service-worker.js",
      "headers": {
        "cache-control": "max-age=0, must-revalidate"
      }
    },
    {
      "handle": "filesystem"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "env": {
    "NODE_VERSION": "18"
  },
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "framework": null,
  "regions": ["sin1"],
  "functions": {
    "api/contact.js": {
      "maxDuration": 10
    }
  }
}
```

#### 环境变量配置

```bash
# 设置环境变量
vercel env add VITE_API_URL
vercel env add VITE_ANALYTICS_ID

# .env.production
VITE_API_URL=https://api.yourportfolio.com
VITE_ANALYTICS_ID=G-XXXXXXXXXX
VITE_PUBLIC_URL=https://yourportfolio.vercel.app
```

#### 自定义域名

```bash
# 添加自定义域名
vercel domains add yourportfolio.com

# 验证DNS配置
vercel domains inspect yourportfolio.com

# DNS记录示例
# A记录: @ -> 76.76.21.21
# CNAME记录: www -> cname.vercel-dns.com
```

### 2. Netlify部署

#### 方法一：通过Netlify CLI

```bash
# 安装Netlify CLI
npm i -g netlify-cli

# 登录Netlify
netlify login

# 初始化站点
netlify init

# 手动部署
netlify deploy

# 部署到生产环境
netlify deploy --prod
```

#### 方法二：配置文件部署

```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"
  functions = "netlify/functions"

[build.environment]
  NODE_VERSION = "18"
  NPM_VERSION = "9"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.js"
  [headers.values]
    Cache-Control = "public, max-age=86400"

[[headers]]
  for = "/*.css"
  [headers.values]
    Cache-Control = "public, max-age=86400"

[[headers]]
  for = "/service-worker.js"
  [headers.values]
    Cache-Control = "max-age=0, must-revalidate"

[functions]
  directory = "netlify/functions"
  node_bundler = "esbuild"

[[plugins]]
  package = "@netlify/plugin-lighthouse"
  [plugins.inputs]
    output_path = "reports/lighthouse.html"
    
[[plugins]]
  package = "netlify-plugin-minify-html"
  [plugins.inputs]
    contexts = ["production"]
```

#### Netlify Functions (Serverless)

```javascript
// netlify/functions/contact.js
exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    const { name, email, message } = JSON.parse(event.body);
    
    // 发送邮件逻辑
    const response = await sendEmail({ name, email, message });
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ success: true, message: '邮件发送成功' })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: '服务器错误' })
    };
  }
};
```

### 3. GitHub Pages部署

#### 自动化部署脚本

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3
        
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        run: npm run build
        env:
          VITE_PUBLIC_URL: https://${{ github.repository_owner }}.github.io/${{ github.event.repository.name }}
          
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v2
        with:
          path: ./dist
          
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v2
```

#### 配置基础路径

```javascript
// vite.config.js
export default defineConfig({
  base: process.env.GITHUB_PAGES 
    ? `/${process.env.GITHUB_REPOSITORY.split('/')[1]}/`
    : '/',
  // ... 其他配置
});
```

### 4. 云服务器部署 (VPS/云主机)

#### Docker容器化部署

```dockerfile
# Dockerfile
FROM node:18-alpine as builder

WORKDIR /app

# 复制package文件
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 生产环境镜像
FROM nginx:alpine

# 复制nginx配置
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /app/dist /usr/share/nginx/html

# 暴露端口
EXPOSE 80

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
```

#### Nginx配置

```nginx
# nginx.conf
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    # 日志格式
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';
    
    access_log /var/log/nginx/access.log main;
    
    # 性能优化
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript 
               application/json application/javascript application/xml+rss 
               application/rss+xml application/atom+xml image/svg+xml;
    
    server {
        listen 80;
        server_name yourportfolio.com www.yourportfolio.com;
        root /usr/share/nginx/html;
        
        # 安全头
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Referrer-Policy "no-referrer-when-downgrade" always;
        add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
        
        # 缓存策略
        location ~* \.(jpg|jpeg|png|gif|ico|css|js|webp|woff2)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
        
        location / {
            try_files $uri $uri/ /index.html;
        }
        
        # Service Worker
        location /service-worker.js {
            add_header Cache-Control "max-age=0, must-revalidate";
        }
        
        # API代理
        location /api {
            proxy_pass http://backend:3000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
    }
    
    # HTTPS配置
    server {
        listen 443 ssl http2;
        server_name yourportfolio.com www.yourportfolio.com;
        
        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;
        ssl_prefer_server_ciphers on;
        
        # HSTS
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
        
        # 其他配置同上...
    }
}
```

#### Docker Compose编排

```yaml
# docker-compose.yml
version: '3.8'

services:
  portfolio:
    build: .
    container_name: portfolio-app
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./ssl:/etc/nginx/ssl:ro
      - ./logs:/var/log/nginx
    environment:
      - NODE_ENV=production
    networks:
      - portfolio-network
    depends_on:
      - backend

  backend:
    image: node:18-alpine
    container_name: portfolio-api
    restart: unless-stopped
    working_dir: /app
    volumes:
      - ./api:/app
    command: npm start
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
    networks:
      - portfolio-network

  redis:
    image: redis:alpine
    container_name: portfolio-redis
    restart: unless-stopped
    volumes:
      - redis-data:/data
    networks:
      - portfolio-network

networks:
  portfolio-network:
    driver: bridge

volumes:
  redis-data:
```

### 5. CDN配置

```javascript
// CDN资源替换脚本
const fs = require('fs');
const path = require('path');

const CDN_URL = 'https://cdn.yourportfolio.com';

function replaceCDNUrls(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      replaceCDNUrls(filePath);
    } else if (file.endsWith('.html') || file.endsWith('.css') || file.endsWith('.js')) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // 替换资源URL
      content = content.replace(/\/assets\//g, `${CDN_URL}/assets/`);
      content = content.replace(/\/images\//g, `${CDN_URL}/images/`);
      content = content.replace(/\/fonts\//g, `${CDN_URL}/fonts/`);
      
      fs.writeFileSync(filePath, content);
    }
  });
}

// 执行替换
replaceCDNUrls('./dist');
```

### 6. 部署前检查清单

```bash
#!/bin/bash
# deploy-checklist.sh

echo "=== 部署前检查清单 ==="

# 1. 构建检查
echo "1. 检查生产构建..."
npm run build || exit 1

# 2. 文件大小检查
echo "2. 检查文件大小..."
find dist -type f -name "*.js" -size +100k -exec ls -lh {} \;

# 3. 环境变量检查
echo "3. 检查环境变量..."
required_vars=("VITE_API_URL" "VITE_PUBLIC_URL")
for var in "${required_vars[@]}"; do
  if [ -z "${!var}" ]; then
    echo "错误: $var 未设置"
    exit 1
  fi
done

# 4. Lighthouse检查
echo "4. 运行Lighthouse检查..."
npx lighthouse https://localhost:3000 --output=json --output-path=./lighthouse-report.json
node -e "
const report = require('./lighthouse-report.json');
const scores = report.categories;
console.log('性能:', scores.performance.score * 100);
console.log('可访问性:', scores.accessibility.score * 100);
console.log('最佳实践:', scores['best-practices'].score * 100);
console.log('SEO:', scores.seo.score * 100);
"

# 5. 安全检查
echo "5. 安全检查..."
npm audit

# 6. 版本标记
echo "6. 创建版本标记..."
git tag -a "v$(node -p "require('./package.json').version")" -m "Release version $(node -p "require('./package.json').version")"

echo "=== 检查完成！准备部署 ==="
```

### 7. 监控和维护

```javascript
// 部署后监控脚本
const https = require('https');
const nodemailer = require('nodemailer');

// 健康检查
function healthCheck(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 200) {
        resolve(true);
      } else {
        reject(new Error(`状态码: ${res.statusCode}`));
      }
    }).on('error', reject);
  });
}

// 性能监控
async function checkPerformance(url) {
  const lighthouse = require('lighthouse');
  const chromeLauncher = require('chrome-launcher');
  
  const chrome = await chromeLauncher.launch({chromeFlags: ['--headless']});
  const options = {
    logLevel: 'info',
    output: 'json',
    onlyCategories: ['performance'],
    port: chrome.port
  };
  
  const runnerResult = await lighthouse(url, options);
  await chrome.kill();
  
  return runnerResult.lhr.categories.performance.score * 100;
}

// 监控任务
async function monitor() {
  const sites = [
    'https://yourportfolio.com',
    'https://www.yourportfolio.com'
  ];
  
  for (const site of sites) {
    try {
      // 健康检查
      await healthCheck(site);
      console.log(`✅ ${site} 正常运行`);
      
      // 性能检查
      const score = await checkPerformance(site);
      console.log(`📊 ${site} 性能分数: ${score}`);
      
      if (score < 90) {
        sendAlert(`性能警告: ${site} 分数低于90 (${score})`);
      }
    } catch (error) {
      console.error(`❌ ${site} 检查失败:`, error);
      sendAlert(`站点故障: ${site} - ${error.message}`);
    }
  }
}

// 发送警报
function sendAlert(message) {
  // 配置邮件发送
  const transporter = nodemailer.createTransport({
    // 邮件服务配置
  });
  
  transporter.sendMail({
    from: 'monitor@yourportfolio.com',
    to: 'admin@yourportfolio.com',
    subject: '站点监控警报',
    text: message
  });
}

// 每5分钟运行一次
setInterval(monitor, 5 * 60 * 1000);
monitor(); // 立即运行一次
```

这个部署指南涵盖了将作品集网站部署到各种平台的完整流程，包括Vercel、Netlify、GitHub Pages、云服务器，以及CDN配置和监控维护。