# Day 03: HTML5表单与多媒体

## 📋 学习目标

今天我们将深入学习HTML5的现代表单元素和多媒体功能，构建更加丰富和交互性强的网页。

- 掌握HTML5新增的表单输入类型
- 学习表单验证和用户体验优化
- 理解音频和视频的嵌入方法
- 实现响应式图片和性能优化
- 创建可访问的多媒体内容

## ⏱️ Git分支基础（5分钟）

### 创建功能分支

在开始今天的项目前，让我们学习使用Git分支来组织代码：

```bash
# 查看当前分支
git branch

# 创建新分支
git branch feature/contact-form

# 切换到新分支
git checkout feature/contact-form

# 或者一步完成：创建并切换
git checkout -b feature/contact-form

# 查看所有分支（包括远程）
git branch -a
```

### 分支工作流

```bash
# 在功能分支上工作
git add .
git commit -m "添加联系表单"

# 切换回主分支
git checkout main

# 合并功能分支
git merge feature/contact-form

# 删除已合并的分支
git branch -d feature/contact-form
```

## 📝 现代表单元素与验证（15分钟）

### HTML5新增输入类型

HTML5引入了许多新的输入类型，提供更好的用户体验和内置验证：

#### 1. 文本类输入

```html
<!-- 邮箱输入 -->
<input type="email" 
       name="email" 
       placeholder="your@email.com"
       required>

<!-- URL输入 -->
<input type="url" 
       name="website" 
       placeholder="https://example.com"
       pattern="https?://.+">

<!-- 电话输入 -->
<input type="tel" 
       name="phone" 
       placeholder="123-456-7890"
       pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}">

<!-- 搜索框 -->
<input type="search" 
       name="search" 
       placeholder="搜索..."
       aria-label="搜索网站内容">
```

#### 2. 数字和范围输入

```html
<!-- 数字输入 -->
<input type="number" 
       name="age" 
       min="1" 
       max="120" 
       step="1"
       value="25">

<!-- 范围滑块 -->
<label for="volume">音量：<span id="volume-value">50</span>%</label>
<input type="range" 
       id="volume"
       name="volume" 
       min="0" 
       max="100" 
       value="50"
       oninput="document.getElementById('volume-value').textContent = this.value">
```

#### 3. 日期和时间输入

```html
<!-- 日期选择 -->
<input type="date" 
       name="birthday" 
       min="1900-01-01" 
       max="2024-12-31"
       required>

<!-- 时间选择 -->
<input type="time" 
       name="appointment-time" 
       min="09:00" 
       max="18:00"
       step="900"> <!-- 15分钟间隔 -->

<!-- 日期时间选择 -->
<input type="datetime-local" 
       name="meeting" 
       min="2024-01-01T00:00" 
       max="2024-12-31T23:59">

<!-- 月份选择 -->
<input type="month" 
       name="start-month" 
       min="2024-01" 
       value="2024-01">

<!-- 周选择 -->
<input type="week" 
       name="week" 
       min="2024-W01" 
       max="2024-W52">
```

#### 4. 颜色选择器

```html
<label for="theme-color">选择主题颜色：</label>
<input type="color" 
       id="theme-color"
       name="color" 
       value="#3498db">
```

### 表单验证属性

#### 1. 基本验证属性

```html
<!-- 必填字段 -->
<input type="text" required>

<!-- 模式匹配 -->
<input type="text" 
       pattern="[A-Za-z]{3,}" 
       title="至少3个字母">

<!-- 长度限制 -->
<input type="text" 
       minlength="5" 
       maxlength="20">

<!-- 数值范围 -->
<input type="number" 
       min="0" 
       max="100" 
       step="5">

<!-- 禁用自动完成 -->
<input type="password" 
       autocomplete="off">

<!-- 只读和禁用 -->
<input type="text" readonly value="不可编辑">
<input type="text" disabled value="已禁用">
```

#### 2. 自定义验证消息

```html
<form>
    <label for="username">用户名：</label>
    <input type="text" 
           id="username"
           name="username" 
           required
           pattern="[a-z0-9]{4,12}"
           oninvalid="this.setCustomValidity('用户名必须是4-12位小写字母或数字')"
           oninput="this.setCustomValidity('')">
    
    <button type="submit">提交</button>
</form>
```

### 高级表单元素

#### 1. 数据列表（自动完成）

```html
<label for="browser">选择浏览器：</label>
<input list="browsers" 
       id="browser" 
       name="browser" 
       placeholder="输入或选择...">

<datalist id="browsers">
    <option value="Chrome">
    <option value="Firefox">
    <option value="Safari">
    <option value="Edge">
    <option value="Opera">
</datalist>
```

#### 2. 输出元素

```html
<form oninput="result.value=parseInt(a.value)+parseInt(b.value)">
    <input type="number" id="a" value="50"> +
    <input type="number" id="b" value="50"> =
    <output name="result" for="a b">100</output>
</form>
```

#### 3. 进度和计量

```html
<!-- 进度条 -->
<label for="file-progress">文件上传进度：</label>
<progress id="file-progress" value="32" max="100">32%</progress>

<!-- 计量器 -->
<label for="disk-usage">磁盘使用率：</label>
<meter id="disk-usage" 
       value="6" 
       min="0" 
       max="10" 
       low="3" 
       high="7" 
       optimum="2">
    6/10
</meter>
```

### 表单设计最佳实践

#### 1. 完整的表单示例

```html
<form action="/submit" method="POST" novalidate>
    <fieldset>
        <legend>个人信息</legend>
        
        <div class="form-group">
            <label for="fullname">
                姓名 <span class="required" aria-label="必填">*</span>
            </label>
            <input type="text" 
                   id="fullname" 
                   name="fullname" 
                   required
                   aria-describedby="fullname-help">
            <small id="fullname-help">请输入您的真实姓名</small>
        </div>
        
        <div class="form-group">
            <label for="email">
                邮箱 <span class="required" aria-label="必填">*</span>
            </label>
            <input type="email" 
                   id="email" 
                   name="email" 
                   required
                   aria-describedby="email-error"
                   aria-invalid="false">
            <span id="email-error" class="error" role="alert"></span>
        </div>
        
        <div class="form-group">
            <label for="birthdate">出生日期</label>
            <input type="date" 
                   id="birthdate" 
                   name="birthdate"
                   max="2024-01-01">
        </div>
    </fieldset>
    
    <fieldset>
        <legend>偏好设置</legend>
        
        <div class="form-group">
            <label>通知方式：</label>
            <label>
                <input type="checkbox" name="notifications" value="email">
                电子邮件
            </label>
            <label>
                <input type="checkbox" name="notifications" value="sms">
                短信
            </label>
            <label>
                <input type="checkbox" name="notifications" value="push">
                推送通知
            </label>
        </div>
        
        <div class="form-group">
            <label>订阅频率：</label>
            <label>
                <input type="radio" name="frequency" value="daily" checked>
                每日
            </label>
            <label>
                <input type="radio" name="frequency" value="weekly">
                每周
            </label>
            <label>
                <input type="radio" name="frequency" value="monthly">
                每月
            </label>
        </div>
    </fieldset>
    
    <div class="form-actions">
        <button type="submit">提交</button>
        <button type="reset">重置</button>
    </div>
</form>
```

## 🎬 响应式图片与视频嵌入（30分钟）

### 响应式图片

#### 1. srcset和sizes属性

```html
<!-- 根据屏幕密度选择图片 -->
<img src="photo-320w.jpg"
     srcset="photo-320w.jpg 320w,
             photo-640w.jpg 640w,
             photo-1280w.jpg 1280w"
     sizes="(max-width: 320px) 280px,
            (max-width: 640px) 600px,
            1200px"
     alt="响应式图片示例">

<!-- 根据像素密度选择 -->
<img src="logo.png"
     srcset="logo.png 1x,
             logo@2x.png 2x,
             logo@3x.png 3x"
     alt="公司标志">
```

#### 2. picture元素（艺术指导）

```html
<picture>
    <!-- WebP格式（更好的压缩） -->
    <source type="image/webp" 
            srcset="hero-small.webp 480w,
                    hero-medium.webp 800w,
                    hero-large.webp 1200w">
    
    <!-- 不同视口的不同图片 -->
    <source media="(max-width: 799px)" 
            srcset="hero-mobile.jpg">
    
    <source media="(min-width: 800px)" 
            srcset="hero-desktop.jpg">
    
    <!-- 后备图片 -->
    <img src="hero-fallback.jpg" 
         alt="主页横幅图片"
         loading="lazy">
</picture>
```

#### 3. 延迟加载

```html
<!-- 原生延迟加载 -->
<img src="image.jpg" 
     alt="描述" 
     loading="lazy"
     width="800"
     height="600">

<!-- iframe延迟加载 -->
<iframe src="https://example.com" 
        loading="lazy"
        width="600"
        height="400"
        title="嵌入内容描述">
</iframe>
```

### 视频嵌入

#### 1. 基本视频元素

```html
<video controls 
       width="640" 
       height="360"
       poster="video-poster.jpg"
       preload="metadata">
    
    <!-- 多格式支持 -->
    <source src="video.webm" type="video/webm">
    <source src="video.mp4" type="video/mp4">
    <source src="video.ogv" type="video/ogg">
    
    <!-- 字幕轨道 -->
    <track kind="subtitles" 
           src="subtitles-zh.vtt" 
           srclang="zh" 
           label="中文" 
           default>
    
    <track kind="subtitles" 
           src="subtitles-en.vtt" 
           srclang="en" 
           label="English">
    
    <!-- 后备内容 -->
    <p>您的浏览器不支持HTML5视频。
       <a href="video.mp4">下载视频</a>。</p>
</video>
```

#### 2. 视频属性详解

```html
<video 
    controls           <!-- 显示控制条 -->
    autoplay          <!-- 自动播放（需要静音） -->
    muted             <!-- 静音 -->
    loop              <!-- 循环播放 -->
    playsinline       <!-- 内联播放（移动端） -->
    poster="cover.jpg" <!-- 视频封面 -->
    preload="auto"     <!-- 预加载：none/metadata/auto -->
    width="1280"
    height="720">
</video>
```

#### 3. 响应式视频容器

```html
<div class="video-container" style="position: relative; padding-bottom: 56.25%; height: 0;">
    <video style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
           controls>
        <source src="video.mp4" type="video/mp4">
    </video>
</div>
```

### 音频嵌入

```html
<audio controls>
    <!-- 多格式支持 -->
    <source src="audio.mp3" type="audio/mpeg">
    <source src="audio.ogg" type="audio/ogg">
    <source src="audio.wav" type="audio/wav">
    
    <!-- 后备内容 -->
    <p>您的浏览器不支持HTML5音频。
       <a href="audio.mp3">下载音频</a>。</p>
</audio>

<!-- 背景音乐（慎用） -->
<audio autoplay loop muted>
    <source src="background-music.mp3" type="audio/mpeg">
</audio>
```

### 多媒体可访问性

#### 1. 视频可访问性最佳实践

```html
<figure>
    <video controls 
           aria-label="产品演示视频"
           aria-describedby="video-description">
        <source src="demo.mp4" type="video/mp4">
        
        <!-- 字幕（听障用户） -->
        <track kind="captions" 
               src="captions-zh.vtt" 
               srclang="zh" 
               label="中文字幕">
        
        <!-- 音频描述（视障用户） -->
        <track kind="descriptions" 
               src="descriptions-zh.vtt" 
               srclang="zh" 
               label="音频描述">
        
        <!-- 章节标记 -->
        <track kind="chapters" 
               src="chapters.vtt" 
               srclang="zh" 
               label="章节">
    </video>
    
    <figcaption id="video-description">
        <h3>产品功能演示</h3>
        <p>本视频展示了我们产品的主要功能，时长3分钟。</p>
        <details>
            <summary>视频文字记录</summary>
            <p>完整的视频内容文字版本...</p>
        </details>
    </figcaption>
</figure>
```

#### 2. WebVTT字幕文件示例

```vtt
WEBVTT

00:00:00.000 --> 00:00:03.000
欢迎观看我们的产品演示

00:00:03.500 --> 00:00:07.000
今天我们将介绍三个主要功能

00:00:07.500 --> 00:00:12.000
首先是智能搜索功能
[屏幕显示搜索界面]

00:00:12.500 --> 00:00:16.000
您可以使用自然语言进行搜索
```

### 性能优化技巧

#### 1. 图片优化

```html
<!-- 1. 指定尺寸避免布局偏移 -->
<img src="photo.jpg" 
     width="800" 
     height="600" 
     alt="描述">

<!-- 2. 使用现代格式 -->
<picture>
    <source type="image/avif" srcset="photo.avif">
    <source type="image/webp" srcset="photo.webp">
    <img src="photo.jpg" alt="描述">
</picture>

<!-- 3. 响应式和延迟加载结合 -->
<img src="placeholder.jpg"
     data-src="photo.jpg"
     data-srcset="photo-480w.jpg 480w,
                  photo-800w.jpg 800w"
     sizes="(max-width: 600px) 480px, 800px"
     loading="lazy"
     alt="描述">
```

#### 2. 视频优化

```html
<!-- 移动端优化 -->
<video controls
       playsinline
       muted
       preload="none"
       poster="video-poster-low.jpg">
    
    <!-- 提供多种质量选项 -->
    <source src="video-1080p.mp4" 
            type="video/mp4" 
            media="(min-width: 1920px)">
    
    <source src="video-720p.mp4" 
            type="video/mp4" 
            media="(min-width: 1280px)">
    
    <source src="video-480p.mp4" 
            type="video/mp4">
</video>
```

## 🏗️ 创建联系表单（10分钟）

### 实践项目：现代联系表单

让我们创建一个综合运用今天所学知识的联系表单：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>联系我们 - 现代表单示例</title>
    <style>
        * {
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            background: #f4f4f4;
        }
        
        .form-container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            padding: 2rem;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        h1 {
            color: #333;
            margin-bottom: 2rem;
        }
        
        .form-group {
            margin-bottom: 1.5rem;
        }
        
        label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: bold;
            color: #555;
        }
        
        input[type="text"],
        input[type="email"],
        input[type="tel"],
        input[type="date"],
        select,
        textarea {
            width: 100%;
            padding: 0.75rem;
            border: 2px solid #ddd;
            border-radius: 4px;
            font-size: 1rem;
            transition: border-color 0.3s;
        }
        
        input:focus,
        select:focus,
        textarea:focus {
            outline: none;
            border-color: #3498db;
        }
        
        input:invalid {
            border-color: #e74c3c;
        }
        
        input:valid {
            border-color: #27ae60;
        }
        
        .checkbox-group,
        .radio-group {
            display: flex;
            gap: 1rem;
            flex-wrap: wrap;
        }
        
        .checkbox-group label,
        .radio-group label {
            font-weight: normal;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .required {
            color: #e74c3c;
        }
        
        .help-text {
            font-size: 0.875rem;
            color: #666;
            margin-top: 0.25rem;
        }
        
        .error-message {
            color: #e74c3c;
            font-size: 0.875rem;
            margin-top: 0.25rem;
            display: none;
        }
        
        .form-actions {
            display: flex;
            gap: 1rem;
            margin-top: 2rem;
        }
        
        button {
            padding: 0.75rem 1.5rem;
            border: none;
            border-radius: 4px;
            font-size: 1rem;
            cursor: pointer;
            transition: all 0.3s;
        }
        
        button[type="submit"] {
            background: #3498db;
            color: white;
            flex: 1;
        }
        
        button[type="submit"]:hover {
            background: #2980b9;
        }
        
        button[type="reset"] {
            background: #95a5a6;
            color: white;
        }
        
        button[type="reset"]:hover {
            background: #7f8c8d;
        }
        
        @media (max-width: 600px) {
            .form-container {
                padding: 1rem;
            }
            
            .checkbox-group,
            .radio-group {
                flex-direction: column;
            }
        }
    </style>
</head>
<body>
    <div class="form-container">
        <h1>联系我们</h1>
        
        <form action="/submit-contact" method="POST" enctype="multipart/form-data">
            <!-- 基本信息 -->
            <fieldset>
                <legend>基本信息</legend>
                
                <div class="form-group">
                    <label for="name">
                        姓名 <span class="required" aria-label="必填">*</span>
                    </label>
                    <input type="text" 
                           id="name" 
                           name="name" 
                           required
                           minlength="2"
                           maxlength="50"
                           placeholder="请输入您的姓名"
                           aria-describedby="name-help">
                    <small id="name-help" class="help-text">
                        请输入2-50个字符
                    </small>
                    <span class="error-message" role="alert"></span>
                </div>
                
                <div class="form-group">
                    <label for="email">
                        电子邮箱 <span class="required" aria-label="必填">*</span>
                    </label>
                    <input type="email" 
                           id="email" 
                           name="email" 
                           required
                           placeholder="your@email.com"
                           aria-describedby="email-help">
                    <small id="email-help" class="help-text">
                        我们会通过邮箱回复您
                    </small>
                </div>
                
                <div class="form-group">
                    <label for="phone">电话号码</label>
                    <input type="tel" 
                           id="phone" 
                           name="phone"
                           pattern="[0-9]{3}-[0-9]{4}-[0-9]{4}"
                           placeholder="123-4567-8900">
                </div>
                
                <div class="form-group">
                    <label for="company">公司名称</label>
                    <input type="text" 
                           id="company" 
                           name="company"
                           list="companies">
                    <datalist id="companies">
                        <option value="科技有限公司">
                        <option value="互联网公司">
                        <option value="创业公司">
                        <option value="其他">
                    </datalist>
                </div>
            </fieldset>
            
            <!-- 咨询内容 -->
            <fieldset>
                <legend>咨询内容</legend>
                
                <div class="form-group">
                    <label for="subject">咨询类型</label>
                    <select id="subject" name="subject" required>
                        <option value="">请选择...</option>
                        <option value="general">一般咨询</option>
                        <option value="support">技术支持</option>
                        <option value="sales">销售咨询</option>
                        <option value="partnership">合作洽谈</option>
                        <option value="other">其他</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="priority">优先级</label>
                    <div class="radio-group">
                        <label>
                            <input type="radio" 
                                   name="priority" 
                                   value="low">
                            低
                        </label>
                        <label>
                            <input type="radio" 
                                   name="priority" 
                                   value="medium" 
                                   checked>
                            中
                        </label>
                        <label>
                            <input type="radio" 
                                   name="priority" 
                                   value="high">
                            高
                        </label>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="message">
                        留言内容 <span class="required" aria-label="必填">*</span>
                    </label>
                    <textarea id="message" 
                              name="message" 
                              rows="5" 
                              required
                              minlength="10"
                              maxlength="1000"
                              placeholder="请详细描述您的需求..."
                              aria-describedby="message-help"></textarea>
                    <small id="message-help" class="help-text">
                        请输入10-1000个字符
                    </small>
                </div>
                
                <div class="form-group">
                    <label for="attachment">附件上传</label>
                    <input type="file" 
                           id="attachment" 
                           name="attachment"
                           accept=".pdf,.doc,.docx,.jpg,.png"
                           aria-describedby="file-help">
                    <small id="file-help" class="help-text">
                        支持PDF、Word文档和图片，最大5MB
                    </small>
                </div>
            </fieldset>
            
            <!-- 其他选项 -->
            <fieldset>
                <legend>其他选项</legend>
                
                <div class="form-group">
                    <label>希望联系方式：</label>
                    <div class="checkbox-group">
                        <label>
                            <input type="checkbox" 
                                   name="contact-method" 
                                   value="email" 
                                   checked>
                            电子邮件
                        </label>
                        <label>
                            <input type="checkbox" 
                                   name="contact-method" 
                                   value="phone">
                            电话
                        </label>
                        <label>
                            <input type="checkbox" 
                                   name="contact-method" 
                                   value="wechat">
                            微信
                        </label>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="contact-time">方便联系时间</label>
                    <input type="time" 
                           id="contact-time" 
                           name="contact-time"
                           min="09:00" 
                           max="18:00">
                </div>
                
                <div class="form-group">
                    <label>
                        <input type="checkbox" 
                               name="newsletter" 
                               value="yes">
                        订阅我们的新闻通讯
                    </label>
                </div>
            </fieldset>
            
            <div class="form-actions">
                <button type="submit">提交表单</button>
                <button type="reset">重置</button>
            </div>
        </form>
    </div>
    
    <script>
        // 表单验证增强
        const form = document.querySelector('form');
        const emailInput = document.getElementById('email');
        
        // 实时邮箱验证
        emailInput.addEventListener('blur', function() {
            const errorSpan = this.nextElementSibling.nextElementSibling;
            
            if (!this.validity.valid) {
                if (this.validity.valueMissing) {
                    errorSpan.textContent = '请输入邮箱地址';
                } else if (this.validity.typeMismatch) {
                    errorSpan.textContent = '请输入有效的邮箱地址';
                }
                errorSpan.style.display = 'block';
            } else {
                errorSpan.style.display = 'none';
            }
        });
        
        // 表单提交前验证
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (this.checkValidity()) {
                alert('表单验证通过！（这是演示，实际应提交到服务器）');
            } else {
                alert('请检查表单中的错误');
            }
        });
    </script>
</body>
</html>
```

## 📚 学习资源

### 官方文档
- [MDN: HTML表单指南](https://developer.mozilla.org/zh-CN/docs/Learn/Forms)
- [MDN: HTML5输入类型](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/input)
- [MDN: 使用HTML5音频和视频](https://developer.mozilla.org/zh-CN/docs/Web/Guide/Audio_and_video_delivery)

### 工具和资源
- [Can I Use: 浏览器兼容性查询](https://caniuse.com/)
- [WebVTT验证器](https://quuz.org/webvtt/)
- [图片压缩工具](https://squoosh.app/)

### 推荐阅读
- [响应式图片完全指南](https://www.smashingmagazine.com/2014/05/responsive-images-done-right-guide-picture-srcset/)
- [表单设计最佳实践](https://www.nngroup.com/articles/web-form-design/)
- [Web视频编码指南](https://developer.mozilla.org/zh-CN/docs/Web/Media/Formats/Video_codecs)

## ✅ 今日检查清单

- [ ] 掌握HTML5所有新的输入类型
- [ ] 理解表单验证的各种方法
- [ ] 能够创建响应式图片
- [ ] 掌握视频和音频的嵌入方法
- [ ] 理解多媒体的可访问性要求
- [ ] 完成一个功能完整的联系表单
- [ ] 使用Git分支管理代码
- [ ] 测试表单在不同设备上的表现

## 🤔 自测问题

1. **HTML5新增了哪些输入类型？各自的用途是什么？**

2. **如何实现表单的客户端验证？有哪些验证属性？**

3. **srcset和sizes属性是如何工作的？**

4. **视频元素应该提供哪些格式？为什么？**

5. **如何确保多媒体内容的可访问性？**

## 🎯 拓展练习

1. **创建一个注册表单**
   - 包含所有常见的注册字段
   - 实现完整的验证
   - 添加密码强度指示器

2. **构建媒体画廊**
   - 混合展示图片和视频
   - 实现懒加载
   - 支持全屏查看

3. **制作视频播放器**
   - 自定义控制条
   - 添加播放速度控制
   - 实现画中画功能

## 💡 今日总结

今天我们学习了HTML5的现代表单元素和多媒体功能：

- **表单增强**：新的输入类型让用户体验更好
- **验证机制**：内置验证减少了JavaScript需求
- **响应式媒体**：适配各种设备和网络条件
- **可访问性**：确保所有用户都能使用

记住：**好的表单设计能显著提升用户体验，而优化的多媒体能让内容更生动！**

明天我们将开始学习CSS3的核心概念，为网页添加样式和布局。准备好让你的网页变得更美观了吗？🎨