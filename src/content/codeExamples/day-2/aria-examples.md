---
day: 2
title: "ARIA属性使用示例"
description: "展示常见ARIA属性的正确使用方法，包括标签、描述、状态管理等可访问性增强技术"
category: "accessibility"
language: "html"
---

# ARIA属性使用示例

本示例展示了如何正确使用ARIA（Accessible Rich Internet Applications）属性来增强Web应用的可访问性。

## 完整示例代码

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ARIA属性使用示例</title>
    <style>
        /* 基础样式 */
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .example {
            border: 1px solid #ddd;
            padding: 20px;
            margin-bottom: 30px;
            border-radius: 8px;
            background: #f9f9f9;
        }
        
        /* 焦点管理 */
        :focus {
            outline: 3px solid #3498db;
            outline-offset: 2px;
        }
        
        .visually-hidden {
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0,0,0,0);
            white-space: nowrap;
            border: 0;
        }
    </style>
</head>
<body>
    <h1>ARIA属性使用示例</h1>
    <p>本页面展示了常见的ARIA属性及其正确使用方法。</p>
    
    <!-- 示例内容 -->
</body>
</html>
```

## 1. aria-label - 提供可访问的名称

当视觉元素没有文本内容时，使用`aria-label`提供描述。

```html
<!-- 图标按钮 -->
<button aria-label="关闭对话框" class="close-button">&times;</button>
<button aria-label="搜索">🔍</button>
<button aria-label="添加到收藏夹">⭐</button>

<!-- 链接示例 -->
<a href="/profile" aria-label="查看个人资料">
    <img src="avatar.jpg" alt="">
</a>
```

## 2. aria-labelledby - 关联已有标签

使用`aria-labelledby`关联已存在的文本作为标签。

```html
<h3 id="billing">账单地址</h3>
<div role="group" aria-labelledby="billing">
    <label for="billing-name">姓名：</label>
    <input type="text" id="billing-name">
    <br>
    <label for="billing-address">地址：</label>
    <input type="text" id="billing-address">
</div>

<!-- 多个标签关联 -->
<h2 id="news">新闻</h2>
<h3 id="tech">科技</h3>
<ul aria-labelledby="news tech">
    <li>最新科技新闻项目...</li>
</ul>
```

## 3. aria-describedby - 提供额外描述

关联帮助文本或错误信息。

```html
<label for="password">密码：</label>
<input type="password" 
       id="password" 
       aria-describedby="pwd-help pwd-error">
<span id="pwd-help" style="font-size: 0.9em; color: #666;">
    密码必须包含至少8个字符，包括大小写字母和数字
</span>
<span id="pwd-error" role="alert" style="color: red;">
    <!-- 错误信息将在这里显示 -->
</span>
```

## 4. aria-expanded 和 aria-controls

用于控制可展开/折叠的组件。

```html
<!-- 下拉菜单 -->
<div class="dropdown">
    <button id="dropdown-button" 
            aria-expanded="false" 
            aria-controls="dropdown-menu"
            aria-haspopup="true">
        选择选项 ▼
    </button>
    <div id="dropdown-menu" 
         class="dropdown-menu" 
         aria-hidden="true"
         role="menu"
         aria-labelledby="dropdown-button">
        <ul>
            <li role="none"><a href="#" role="menuitem">选项 1</a></li>
            <li role="none"><a href="#" role="menuitem">选项 2</a></li>
            <li role="none"><a href="#" role="menuitem">选项 3</a></li>
        </ul>
    </div>
</div>

<!-- 手风琴组件 -->
<h3>
    <button aria-expanded="false" 
            aria-controls="section1">
        第一节内容
    </button>
</h3>
<div id="section1" aria-hidden="true">
    <p>这里是可折叠的内容...</p>
</div>
```

## 5. aria-current - 标识当前项

标识导航或列表中的当前项。

```html
<!-- 面包屑导航 -->
<nav aria-label="面包屑">
    <ol>
        <li><a href="/">首页</a></li>
        <li><a href="/products">产品</a></li>
        <li><a href="/products/laptops" aria-current="page">笔记本电脑</a></li>
    </ol>
</nav>

<!-- 分页导航 -->
<nav aria-label="分页">
    <a href="?page=1">1</a>
    <a href="?page=2" aria-current="page">2</a>
    <a href="?page=3">3</a>
</nav>
```

## 6. aria-live - 动态内容通知

通知屏幕阅读器内容的动态变化。

```html
<!-- 礼貌通知（等当前朗读完成） -->
<div aria-live="polite" aria-atomic="true">
    <p>表单已成功保存</p>
</div>

<!-- 紧急通知（立即朗读） -->
<div role="alert" aria-live="assertive">
    <p>错误：网络连接已断开</p>
</div>

<!-- 状态区域 -->
<div role="status" aria-live="polite">
    <p>已加载10个项目</p>
</div>
```

## 7. 表格可访问性

增强表格的可访问性。

```html
<table role="table" aria-label="2024年销售数据">
    <caption>2024年第一季度销售报告</caption>
    <thead>
        <tr>
            <th scope="col">月份</th>
            <th scope="col">销售额</th>
            <th scope="col">增长率</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <th scope="row">一月</th>
            <td>¥50,000</td>
            <td>+15%</td>
        </tr>
        <tr>
            <th scope="row">二月</th>
            <td>¥45,000</td>
            <td>+10%</td>
        </tr>
    </tbody>
</table>
```

## 8. 标签页（Tabs）组件

创建可访问的标签页界面。

```html
<div class="tabs">
    <div role="tablist" aria-label="账户信息">
        <button role="tab" 
                aria-selected="true" 
                aria-controls="panel-1" 
                id="tab-1">
            个人信息
        </button>
        <button role="tab" 
                aria-selected="false" 
                aria-controls="panel-2" 
                id="tab-2">
            安全设置
        </button>
    </div>
    
    <div role="tabpanel" 
         id="panel-1" 
         aria-labelledby="tab-1">
        <h3>个人信息</h3>
        <p>在这里管理你的个人资料信息。</p>
    </div>
    
    <div role="tabpanel" 
         id="panel-2" 
         aria-labelledby="tab-2" 
         aria-hidden="true">
        <h3>安全设置</h3>
        <p>管理密码和两步验证设置。</p>
    </div>
</div>
```

## 9. 进度和加载状态

表示进度和加载状态。

```html
<!-- 进度条 -->
<div role="progressbar" 
     aria-valuenow="60" 
     aria-valuemin="0" 
     aria-valuemax="100"
     aria-label="上传进度">
    <div style="width: 60%; background: #3498db; height: 20px;"></div>
</div>

<!-- 加载状态 -->
<div aria-busy="true" aria-label="加载中">
    <p>正在加载数据，请稍候...</p>
</div>

<!-- 无限加载 -->
<div role="progressbar" aria-label="加载中">
    <span class="spinner"></span>
</div>
```

## 10. 表单验证和错误处理

正确标记必填字段和错误信息。

```html
<form>
    <div>
        <label for="email">
            邮箱地址 <span aria-label="必填">*</span>
        </label>
        <input type="email" 
               id="email" 
               aria-required="true"
               aria-invalid="false"
               aria-describedby="email-error">
        <span id="email-error" 
              role="alert" 
              aria-live="assertive"
              style="color: red; display: none;">
            请输入有效的邮箱地址
        </span>
    </div>
    
    <div>
        <label for="phone">电话号码（可选）</label>
        <input type="tel" 
               id="phone" 
               aria-required="false">
    </div>
</form>
```

## JavaScript 交互示例

```javascript
// 下拉菜单切换
function toggleDropdown() {
    const button = document.getElementById('dropdown-button');
    const menu = document.getElementById('dropdown-menu');
    const isExpanded = button.getAttribute('aria-expanded') === 'true';
    
    button.setAttribute('aria-expanded', !isExpanded);
    menu.setAttribute('aria-hidden', isExpanded);
}

// 标签页切换
function switchTab(tabNumber) {
    // 更新所有标签状态
    for (let i = 1; i <= 3; i++) {
        const tab = document.getElementById(`tab-${i}`);
        const panel = document.getElementById(`panel-${i}`);
        
        if (i === tabNumber) {
            tab.setAttribute('aria-selected', 'true');
            panel.setAttribute('aria-hidden', 'false');
            tab.focus(); // 将焦点移到选中的标签
        } else {
            tab.setAttribute('aria-selected', 'false');
            panel.setAttribute('aria-hidden', 'true');
        }
    }
}

// 表单验证
function validateEmail(input) {
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value);
    const errorMsg = document.getElementById('email-error');
    
    input.setAttribute('aria-invalid', !isValid);
    
    if (!isValid) {
        errorMsg.style.display = 'block';
        errorMsg.textContent = '请输入有效的邮箱地址';
    } else {
        errorMsg.style.display = 'none';
        errorMsg.textContent = '';
    }
}
```

## 最佳实践总结

1. **不要过度使用ARIA** - 优先使用语义化HTML
2. **第一规则** - 如果可以使用原生HTML元素或属性，就不要使用ARIA
3. **保持同步** - 确保ARIA属性与视觉状态保持同步
4. **提供键盘支持** - 所有交互元素都应该可以通过键盘访问
5. **测试可访问性** - 使用屏幕阅读器测试你的ARIA实现

## 常见错误示例

```html
<!-- ❌ 错误：冗余的role -->
<nav role="navigation">

<!-- ✅ 正确：nav元素已经有导航语义 -->
<nav aria-label="主导航">

<!-- ❌ 错误：按钮没有可访问的名称 -->
<button><img src="save.png"></button>

<!-- ✅ 正确：提供可访问的名称 -->
<button aria-label="保存"><img src="save.png" alt=""></button>

<!-- ❌ 错误：aria-hidden内容包含交互元素 -->
<div aria-hidden="true">
    <button>点击我</button>
</div>

<!-- ✅ 正确：交互元素不应该被隐藏 -->
<div>
    <button>点击我</button>
</div>
```