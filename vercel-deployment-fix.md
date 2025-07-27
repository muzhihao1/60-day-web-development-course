# Vercel 部署问题解决方案

## 问题分析

当前遇到的 404 错误是因为：
- 项目的主要内容在 `60-day-modern-course/` 子目录中
- Docsify 的 `index.html` 文件位于 `60-day-modern-course/index.html`
- Vercel 默认在项目根目录寻找 `index.html`

## 解决方案

我已经为您创建了两个解决方案，您可以选择其中一个：

### 方案 1：使用 vercel.json 配置（推荐）

已创建 `vercel.json` 文件，配置了 URL 重写规则：

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/60-day-modern-course/$1"
    },
    {
      "source": "/",
      "destination": "/60-day-modern-course/index.html"
    }
  ]
}
```

**优点：**
- 保持原有项目结构不变
- URL 看起来更简洁（不显示子目录）
- 所有静态资源路径自动正确映射

### 方案 2：根目录重定向

已创建根目录的 `index.html`，自动重定向到子目录：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="refresh" content="0; url=/60-day-modern-course/">
    <title>重定向中...</title>
    <script>
        window.location.href = '/60-day-modern-course/';
    </script>
</head>
<body>
    <p>正在重定向到课程页面...</p>
    <p>如果没有自动跳转，请<a href="/60-day-modern-course/">点击这里</a>。</p>
</body>
</html>
```

**优点：**
- 简单直接
- 不需要 Vercel 特定配置

**缺点：**
- URL 会显示子目录路径
- 用户会看到短暂的重定向页面

### 方案 3：在 Vercel 仪表板修改设置

如果您不想修改代码，可以在 Vercel 仪表板中：

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 找到您的项目
3. 进入 Settings → General
4. 找到 "Root Directory" 设置
5. 将其改为 `60-day-modern-course`
6. 重新部署

**优点：**
- 不需要修改任何代码
- 设置简单

**缺点：**
- 配置不在代码中，其他人克隆项目时需要知道这个设置

## 推荐步骤

1. **使用方案 1**（vercel.json）- 这是最优雅的解决方案

2. **提交并推送更改：**
   ```bash
   git add vercel.json
   git commit -m "fix: Add Vercel configuration for proper routing"
   git push origin main
   ```

3. **Vercel 会自动重新部署**，几分钟后您的网站应该可以正常访问

## 验证部署

部署完成后，访问：
- https://60-day-web-development-course.vercel.app

应该能看到您的课程主页。

## 需要帮助？

如果仍有问题，请检查：
1. Vercel 部署日志是否有错误
2. 浏览器控制台是否有 JavaScript 错误
3. 网络请求是否正确加载了资源文件