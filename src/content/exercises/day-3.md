---
day: 3
title: "创建多媒体展示页面"
description: "综合运用HTML5表单元素、多媒体内容和响应式设计，创建一个产品咨询页面"
difficulty: "intermediate"
estimatedTime: 60
requirements:
  - "创建产品视频展示区，包含字幕和多格式支持"
  - "实现响应式图片展示，支持现代图片格式"
  - "设计综合咨询表单，使用至少8种HTML5输入类型"
  - "实现完整的客户端表单验证"
  - "确保所有内容的可访问性"
  - "创建响应式布局适配不同设备"
  - "使用Git分支进行版本管理"
hints:
  - "视频使用video标签，提供多种格式和字幕track"
  - "图片使用picture元素和srcset实现响应式"
  - "表单验证使用HTML5内置属性和JavaScript增强"
  - "使用语义化标签组织页面结构"
  - "测试键盘导航和屏幕阅读器兼容性"
checkpoints:
  - task: "Git分支管理设置"
    completed: false
  - task: "创建基础HTML结构"
    completed: false
  - task: "实现产品视频展示"
    completed: false
  - task: "创建响应式图片展示"
    completed: false
  - task: "设计综合咨询表单"
    completed: false
  - task: "实现表单验证"
    completed: false
  - task: "添加样式和响应式设计"
    completed: false
---

# Day 03 练习：创建多媒体展示页面

## 🎯 练习目标

通过本练习，你将：
- 综合运用HTML5表单的各种输入类型
- 实现客户端表单验证
- 创建响应式的图片和视频展示
- 确保多媒体内容的可访问性
- 使用Git分支进行版本管理

## 📝 练习要求

### 项目：公司产品咨询页面

创建一个产品咨询页面，包含：
1. 产品视频介绍
2. 产品图片展示（响应式）
3. 详细的咨询表单
4. 文件上传功能

### 页面结构要求

```
产品咨询页面
├── 页眉
│   └── 公司Logo和导航
├── 主要内容
│   ├── 产品视频区
│   │   ├── 主要产品演示视频
│   │   └── 视频控制和字幕
│   ├── 产品图片展示
│   │   ├── 响应式图片网格
│   │   └── 图片放大查看
│   └── 咨询表单
│       ├── 客户信息
│       ├── 产品选择
│       ├── 需求描述
│       └── 文件上传
└── 页脚
    └── 版权和联系信息
```

## 📋 具体任务

### 任务1：Git分支管理

在开始编码前，创建并切换到功能分支：

```bash
# 创建并切换到新分支
git checkout -b feature/product-consultation

# 确认当前分支
git branch
```

### 任务2：创建基础HTML结构

创建 `consultation.html` 文件：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="产品咨询 - 了解我们的创新解决方案">
    <title>产品咨询 - TechCorp科技公司</title>
    <style>
        /* 基础样式将在这里添加 */
    </style>
</head>
<body>
    <!-- 页面内容将在这里构建 -->
</body>
</html>
```

### 任务3：实现产品视频展示

要求：
- 提供多种视频格式支持
- 添加中英文字幕
- 包含视频描述和文字记录
- 确保键盘可访问

```html
<section class="video-section">
    <h2>产品演示视频</h2>
    <figure>
        <video controls 
               poster="video-poster.jpg"
               width="1280" 
               height="720"
               preload="metadata">
            <!-- 视频源 -->
            <source src="product-demo.webm" type="video/webm">
            <source src="product-demo.mp4" type="video/mp4">
            
            <!-- 字幕轨道 -->
            <track kind="captions" 
                   src="captions-zh.vtt" 
                   srclang="zh" 
                   label="中文字幕" 
                   default>
            <track kind="captions" 
                   src="captions-en.vtt" 
                   srclang="en" 
                   label="English">
            
            <!-- 后备内容 -->
        </video>
        <figcaption>
            <!-- 视频描述 -->
        </figcaption>
    </figure>
</section>
```

### 任务4：创建响应式图片展示

要求：
- 使用srcset实现响应式图片
- 支持WebP等现代格式
- 实现延迟加载
- 提供适当的alt文本

```html
<section class="gallery-section">
    <h2>产品展示</h2>
    <div class="image-grid">
        <figure>
            <picture>
                <source type="image/webp" 
                        srcset="product-1-small.webp 400w,
                                product-1-medium.webp 800w,
                                product-1-large.webp 1200w"
                        sizes="(max-width: 600px) 100vw,
                               (max-width: 1200px) 50vw,
                               33vw">
                <img src="product-1.jpg" 
                     alt="产品特写：展示精密的内部结构"
                     loading="lazy">
            </picture>
            <figcaption>产品内部结构展示</figcaption>
        </figure>
        <!-- 更多图片... -->
    </div>
</section>
```

### 任务5：设计综合咨询表单

创建一个包含所有HTML5新特性的表单：

#### 必须包含的表单元素：

1. **基本信息区**
   - 文本输入（姓名）
   - 邮箱输入（带验证）
   - 电话输入（带格式）
   - 公司名称（带datalist）

2. **产品咨询区**
   - 产品选择（select）
   - 购买数量（number）
   - 预算范围（range）
   - 期望交付日期（date）

3. **详细需求区**
   - 需求描述（textarea）
   - 优先级（radio）
   - 附加服务（checkbox）
   - 文件上传（file）

4. **联系偏好区**
   - 联系方式（checkbox多选）
   - 方便联系时间（time）
   - 时区选择（select）

### 任务6：实现表单验证

要求：
- 使用HTML5内置验证
- 自定义错误消息
- 实时验证反馈
- 友好的用户体验

```javascript
// 表单验证逻辑
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('consultation-form');
    
    // 自定义验证消息
    const inputs = form.querySelectorAll('input[required]');
    inputs.forEach(input => {
        input.addEventListener('invalid', function(e) {
            e.preventDefault();
            // 设置自定义消息
        });
    });
    
    // 实时验证
    // ...
});
```

### 任务7：添加样式和响应式设计

确保：
- 移动端友好
- 触摸目标足够大（至少44x44px）
- 适当的颜色对比度
- 流畅的用户体验

## 🎨 预期效果

### 桌面端（1200px+）
- 视频居中显示，宽度80%
- 图片3列网格布局
- 表单双列布局

### 平板端（768px-1199px）
- 视频全宽显示
- 图片2列网格
- 表单单列，部分元素并排

### 移动端（<768px）
- 所有内容单列堆叠
- 图片单列显示
- 表单元素垂直排列

## 💡 提示

### 视频优化提示
```html
<!-- 移动端优化 -->
<video playsinline muted>
    <!-- 提供不同质量的视频 -->
    <source src="video-hd.mp4" 
            type="video/mp4" 
            media="(min-width: 1200px)">
    <source src="video-sd.mp4" 
            type="video/mp4">
</video>
```

### 表单增强提示
```html
<!-- 自动完成增强 -->
<input type="tel" 
       autocomplete="tel-national"
       placeholder="例：138-0000-0000">

<!-- 日期限制 -->
<input type="date" 
       min="2024-02-01"
       max="2024-12-31"
       value="2024-02-15">
```

### 文件上传提示
```html
<!-- 限制文件类型和大小 -->
<input type="file" 
       accept=".pdf,.doc,.docx,image/*"
       multiple
       aria-describedby="file-requirements">
<small id="file-requirements">
    支持PDF、Word文档和图片，单个文件最大10MB
</small>
```

## 📊 评分标准

| 评分项 | 分值 | 要求 |
|--------|------|------|
| HTML5表单元素使用 | 25分 | 使用至少8种不同的输入类型 |
| 表单验证实现 | 20分 | 完整的客户端验证，自定义错误消息 |
| 多媒体集成 | 20分 | 视频有字幕，图片响应式 |
| 可访问性 | 20分 | 适当的ARIA标签，键盘可访问 |
| 响应式设计 | 15分 | 三种设备完美适配 |

**优秀标准（90分以上）：**
- 表单体验流畅，验证友好
- 多媒体加载性能优化
- 完全符合WCAG 2.1 AA标准
- 代码结构清晰，注释完善

## 🚨 常见问题

### 1. 视频不自动播放
```html
<!-- 自动播放需要静音 -->
<video autoplay muted playsinline>
```

### 2. 日期输入在Safari中显示不正确
```html
<!-- 提供后备方案 -->
<input type="date" 
       placeholder="YYYY-MM-DD"
       pattern="\d{4}-\d{2}-\d{2}">
```

### 3. 文件上传大小限制
```javascript
// 前端检查文件大小
input.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file.size > 10 * 1024 * 1024) {
        alert('文件大小不能超过10MB');
        e.target.value = '';
    }
});
```

## 🎯 进阶挑战

1. **实现视频章节导航**
   - 使用track kind="chapters"
   - JavaScript控制跳转

2. **图片灯箱效果**
   - 点击图片全屏查看
   - 支持键盘导航
   - 触摸手势支持

3. **表单进度指示**
   - 显示填写进度
   - 分步骤表单
   - 保存草稿功能

4. **多语言支持**
   - 中英文切换
   - 表单国际化
   - 日期格式本地化

## 🔍 测试清单

### 功能测试
- [ ] 所有表单字段都能正常输入
- [ ] 验证规则正确触发
- [ ] 文件上传功能正常
- [ ] 视频播放流畅

### 可访问性测试
- [ ] Tab键可以遍历所有交互元素
- [ ] 屏幕阅读器能正确朗读
- [ ] 颜色对比度达标
- [ ] 错误提示清晰

### 响应式测试
- [ ] 320px宽度正常显示
- [ ] 768px断点切换正确
- [ ] 1200px以上优化显示
- [ ] 横竖屏切换流畅

### 性能测试
- [ ] 图片延迟加载工作
- [ ] 视频不阻塞页面加载
- [ ] 表单提交响应快速
- [ ] 无明显的布局偏移

## 📤 提交要求

完成后：

1. **提交代码**
```bash
git add .
git commit -m "完成产品咨询页面"
git push origin feature/product-consultation
```

2. **创建Pull Request**
   - 描述实现的功能
   - 列出使用的HTML5特性
   - 说明遇到的挑战

3. **自我评估**
   - 哪些部分实现得最好？
   - 哪些地方还可以改进？
   - 学到了什么新知识？

祝你编码愉快！记住：**现代化的表单和多媒体能极大提升用户体验！** 🚀