---
day: 3
title: "HTML5表单元素参考手册"
description: "完整的HTML5表单元素参考，包括所有输入类型、属性、验证规则和最佳实践示例"
category: "advanced"
language: "html"
---

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HTML5表单元素参考手册</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background: #f5f5f5;
        }
        
        h1, h2, h3 {
            color: #2c3e50;
        }
        
        .section {
            background: white;
            padding: 20px;
            margin-bottom: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        
        .form-group {
            margin-bottom: 20px;
            padding: 15px;
            border: 1px solid #e0e0e0;
            border-radius: 5px;
        }
        
        .form-group h3 {
            margin-top: 0;
            color: #3498db;
        }
        
        label {
            display: block;
            font-weight: bold;
            margin-bottom: 5px;
            color: #555;
        }
        
        input, select, textarea {
            width: 100%;
            padding: 8px 12px;
            border: 2px solid #ddd;
            border-radius: 4px;
            font-size: 16px;
            transition: border-color 0.3s;
        }
        
        input:focus, select:focus, textarea:focus {
            outline: none;
            border-color: #3498db;
        }
        
        input:valid {
            border-color: #27ae60;
        }
        
        input:invalid {
            border-color: #e74c3c;
        }
        
        code {
            background: #f4f4f4;
            padding: 2px 4px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
        }
        
        pre {
            background: #2c3e50;
            color: white;
            padding: 15px;
            border-radius: 5px;
            overflow-x: auto;
        }
        
        .demo-output {
            background: #ecf0f1;
            padding: 10px;
            margin-top: 10px;
            border-radius: 4px;
            font-family: monospace;
        }
        
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
        }
        
        .note {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            padding: 10px;
            border-radius: 4px;
            margin-top: 10px;
        }
        
        .support {
            font-size: 0.9em;
            color: #7f8c8d;
            margin-top: 5px;
        }
    </style>
</head>
<body>
    <h1>HTML5 表单元素完整参考</h1>
    <p>这是一个交互式的HTML5表单元素参考手册，展示了所有可用的输入类型和属性。</p>
    
    <!-- 文本输入类型 -->
    <section class="section">
        <h2>文本输入类型</h2>
        
        <div class="grid">
            <div class="form-group">
                <h3>文本输入 (text)</h3>
                <label for="text-input">基本文本输入：</label>
                <input type="text" 
                       id="text-input" 
                       placeholder="输入任意文本"
                       maxlength="50"
                       required>
                <pre><code>&lt;input type="text" 
       placeholder="输入任意文本"
       maxlength="50"
       required&gt;</code></pre>
            </div>
            
            <div class="form-group">
                <h3>邮箱输入 (email)</h3>
                <label for="email-input">邮箱地址：</label>
                <input type="email" 
                       id="email-input" 
                       placeholder="user@example.com"
                       required>
                <div class="note">自动验证邮箱格式</div>
                <pre><code>&lt;input type="email" 
       placeholder="user@example.com"
       required&gt;</code></pre>
            </div>
            
            <div class="form-group">
                <h3>密码输入 (password)</h3>
                <label for="password-input">密码：</label>
                <input type="password" 
                       id="password-input" 
                       minlength="8"
                       pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
                       title="必须包含大小写字母和数字，至少8位"
                       required>
                <pre><code>&lt;input type="password" 
       minlength="8"
       pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"&gt;</code></pre>
            </div>
            
            <div class="form-group">
                <h3>URL输入 (url)</h3>
                <label for="url-input">网址：</label>
                <input type="url" 
                       id="url-input" 
                       placeholder="https://example.com"
                       pattern="https?://.+">
                <div class="note">自动验证URL格式</div>
                <pre><code>&lt;input type="url" 
       placeholder="https://example.com"
       pattern="https?://.+"&gt;</code></pre>
            </div>
            
            <div class="form-group">
                <h3>电话输入 (tel)</h3>
                <label for="tel-input">电话号码：</label>
                <input type="tel" 
                       id="tel-input" 
                       placeholder="138-0000-0000"
                       pattern="[0-9]{3}-[0-9]{4}-[0-9]{4}">
                <pre><code>&lt;input type="tel" 
       placeholder="138-0000-0000"
       pattern="[0-9]{3}-[0-9]{4}-[0-9]{4}"&gt;</code></pre>
            </div>
            
            <div class="form-group">
                <h3>搜索框 (search)</h3>
                <label for="search-input">搜索：</label>
                <input type="search" 
                       id="search-input" 
                       placeholder="输入搜索关键词..."
                       aria-label="站内搜索">
                <div class="note">某些浏览器会添加清除按钮</div>
                <pre><code>&lt;input type="search" 
       placeholder="输入搜索关键词..."
       aria-label="站内搜索"&gt;</code></pre>
            </div>
        </div>
    </section>
    
    <!-- 数字输入类型 -->
    <section class="section">
        <h2>数字输入类型</h2>
        
        <div class="grid">
            <div class="form-group">
                <h3>数字输入 (number)</h3>
                <label for="number-input">数量（1-100）：</label>
                <input type="number" 
                       id="number-input" 
                       min="1" 
                       max="100" 
                       step="1"
                       value="10">
                <div class="demo-output">当前值：<span id="number-value">10</span></div>
                <pre><code>&lt;input type="number" 
       min="1" max="100" 
       step="1" value="10"&gt;</code></pre>
            </div>
            
            <div class="form-group">
                <h3>范围滑块 (range)</h3>
                <label for="range-input">音量控制（0-100）：</label>
                <input type="range" 
                       id="range-input" 
                       min="0" 
                       max="100" 
                       value="50"
                       oninput="document.getElementById('range-value').textContent = this.value">
                <div class="demo-output">当前值：<span id="range-value">50</span></div>
                <pre><code>&lt;input type="range" 
       min="0" max="100" 
       value="50"&gt;</code></pre>
            </div>
        </div>
    </section>
    
    <!-- 日期时间输入类型 -->
    <section class="section">
        <h2>日期时间输入类型</h2>
        
        <div class="grid">
            <div class="form-group">
                <h3>日期选择 (date)</h3>
                <label for="date-input">选择日期：</label>
                <input type="date" 
                       id="date-input" 
                       min="2024-01-01" 
                       max="2024-12-31"
                       value="2024-01-27">
                <pre><code>&lt;input type="date" 
       min="2024-01-01" 
       max="2024-12-31"&gt;</code></pre>
            </div>
            
            <div class="form-group">
                <h3>时间选择 (time)</h3>
                <label for="time-input">选择时间：</label>
                <input type="time" 
                       id="time-input" 
                       min="09:00" 
                       max="18:00"
                       step="900">
                <div class="note">step="900" = 15分钟间隔</div>
                <pre><code>&lt;input type="time" 
       min="09:00" max="18:00"
       step="900"&gt;</code></pre>
            </div>
            
            <div class="form-group">
                <h3>日期时间 (datetime-local)</h3>
                <label for="datetime-input">选择日期和时间：</label>
                <input type="datetime-local" 
                       id="datetime-input" 
                       min="2024-01-01T00:00" 
                       max="2024-12-31T23:59">
                <pre><code>&lt;input type="datetime-local" 
       min="2024-01-01T00:00" 
       max="2024-12-31T23:59"&gt;</code></pre>
            </div>
            
            <div class="form-group">
                <h3>月份选择 (month)</h3>
                <label for="month-input">选择月份：</label>
                <input type="month" 
                       id="month-input" 
                       min="2024-01" 
                       value="2024-01">
                <pre><code>&lt;input type="month" 
       min="2024-01" 
       value="2024-01"&gt;</code></pre>
            </div>
            
            <div class="form-group">
                <h3>周选择 (week)</h3>
                <label for="week-input">选择周：</label>
                <input type="week" 
                       id="week-input" 
                       min="2024-W01" 
                       max="2024-W52">
                <pre><code>&lt;input type="week" 
       min="2024-W01" 
       max="2024-W52"&gt;</code></pre>
            </div>
        </div>
    </section>
    
    <!-- 特殊输入类型 -->
    <section class="section">
        <h2>特殊输入类型</h2>
        
        <div class="grid">
            <div class="form-group">
                <h3>颜色选择器 (color)</h3>
                <label for="color-input">选择颜色：</label>
                <input type="color" 
                       id="color-input" 
                       value="#3498db"
                       onchange="document.getElementById('color-value').textContent = this.value">
                <div class="demo-output">选中的颜色：<span id="color-value">#3498db</span></div>
                <pre><code>&lt;input type="color" 
       value="#3498db"&gt;</code></pre>
            </div>
            
            <div class="form-group">
                <h3>文件上传 (file)</h3>
                <label for="file-input">选择文件：</label>
                <input type="file" 
                       id="file-input" 
                       accept="image/*,.pdf"
                       multiple>
                <div class="note">accept限制文件类型，multiple允许多选</div>
                <pre><code>&lt;input type="file" 
       accept="image/*,.pdf"
       multiple&gt;</code></pre>
            </div>
            
            <div class="form-group">
                <h3>隐藏字段 (hidden)</h3>
                <input type="hidden" id="hidden-input" value="secret-value">
                <div class="note">用于存储不显示给用户的数据</div>
                <pre><code>&lt;input type="hidden" 
       value="secret-value"&gt;</code></pre>
            </div>
        </div>
    </section>
    
    <!-- 高级表单元素 -->
    <section class="section">
        <h2>高级表单元素</h2>
        
        <div class="grid">
            <div class="form-group">
                <h3>数据列表 (datalist)</h3>
                <label for="datalist-input">选择或输入浏览器：</label>
                <input list="browsers" 
                       id="datalist-input" 
                       placeholder="输入或选择...">
                <datalist id="browsers">
                    <option value="Chrome">
                    <option value="Firefox">
                    <option value="Safari">
                    <option value="Edge">
                    <option value="Opera">
                </datalist>
                <pre><code>&lt;input list="browsers"&gt;
&lt;datalist id="browsers"&gt;
    &lt;option value="Chrome"&gt;
    &lt;option value="Firefox"&gt;
&lt;/datalist&gt;</code></pre>
            </div>
            
            <div class="form-group">
                <h3>输出元素 (output)</h3>
                <label>计算器：</label>
                <form oninput="result.value=parseInt(a.value)+parseInt(b.value)">
                    <input type="number" id="a" value="50" style="width: 80px; display: inline-block;"> +
                    <input type="number" id="b" value="50" style="width: 80px; display: inline-block;"> =
                    <output name="result" for="a b">100</output>
                </form>
                <pre><code>&lt;form oninput="result.value=parseInt(a.value)+parseInt(b.value)"&gt;
    &lt;input type="number" id="a" value="50"&gt; +
    &lt;input type="number" id="b" value="50"&gt; =
    &lt;output name="result" for="a b"&gt;100&lt;/output&gt;
&lt;/form&gt;</code></pre>
            </div>
            
            <div class="form-group">
                <h3>进度条 (progress)</h3>
                <label for="progress-bar">下载进度：</label>
                <progress id="progress-bar" value="32" max="100">32%</progress>
                <button onclick="updateProgress()" style="margin-top: 10px;">更新进度</button>
                <pre><code>&lt;progress value="32" max="100"&gt;
    32%
&lt;/progress&gt;</code></pre>
            </div>
            
            <div class="form-group">
                <h3>计量器 (meter)</h3>
                <label for="meter-gauge">磁盘使用率：</label>
                <meter id="meter-gauge" 
                       value="6" 
                       min="0" 
                       max="10" 
                       low="3" 
                       high="7" 
                       optimum="2">
                    6/10
                </meter>
                <div class="note">根据值自动变色：绿色(低)、黄色(中)、红色(高)</div>
                <pre><code>&lt;meter value="6" min="0" max="10" 
       low="3" high="7" optimum="2"&gt;
    6/10
&lt;/meter&gt;</code></pre>
            </div>
        </div>
    </section>
    
    <!-- 表单验证属性 -->
    <section class="section">
        <h2>表单验证属性</h2>
        
        <div class="grid">
            <div class="form-group">
                <h3>必填字段 (required)</h3>
                <form>
                    <label for="required-input">必填字段：</label>
                    <input type="text" 
                           id="required-input" 
                           required
                           placeholder="此字段必填">
                    <button type="submit">提交测试</button>
                </form>
            </div>
            
            <div class="form-group">
                <h3>模式匹配 (pattern)</h3>
                <label for="pattern-input">邮政编码（6位数字）：</label>
                <input type="text" 
                       id="pattern-input" 
                       pattern="[0-9]{6}"
                       title="请输入6位数字"
                       placeholder="100000">
                <pre><code>&lt;input type="text" 
       pattern="[0-9]{6}"
       title="请输入6位数字"&gt;</code></pre>
            </div>
            
            <div class="form-group">
                <h3>长度限制</h3>
                <label for="length-input">用户名（3-12个字符）：</label>
                <input type="text" 
                       id="length-input" 
                       minlength="3"
                       maxlength="12"
                       placeholder="3-12个字符">
                <pre><code>&lt;input type="text" 
       minlength="3"
       maxlength="12"&gt;</code></pre>
            </div>
            
            <div class="form-group">
                <h3>自动完成控制</h3>
                <label for="autocomplete-input">信用卡号（关闭自动完成）：</label>
                <input type="text" 
                       id="autocomplete-input" 
                       autocomplete="off"
                       placeholder="输入信用卡号">
                <pre><code>&lt;input type="text" 
       autocomplete="off"&gt;</code></pre>
            </div>
        </div>
    </section>
    
    <!-- 表单分组元素 -->
    <section class="section">
        <h2>表单分组元素</h2>
        
        <div class="form-group">
            <h3>字段集 (fieldset) 和图例 (legend)</h3>
            <fieldset>
                <legend>个人信息</legend>
                <label for="fieldset-name">姓名：</label>
                <input type="text" id="fieldset-name">
                <label for="fieldset-email">邮箱：</label>
                <input type="email" id="fieldset-email">
            </fieldset>
            <pre><code>&lt;fieldset&gt;
    &lt;legend&gt;个人信息&lt;/legend&gt;
    &lt;label for="name"&gt;姓名：&lt;/label&gt;
    &lt;input type="text" id="name"&gt;
&lt;/fieldset&gt;</code></pre>
        </div>
    </section>
    
    <script>
        // 数字输入实时更新
        document.getElementById('number-input').addEventListener('input', function(e) {
            document.getElementById('number-value').textContent = e.target.value;
        });
        
        // 进度条更新
        let progress = 32;
        function updateProgress() {
            progress += 10;
            if (progress > 100) progress = 0;
            document.getElementById('progress-bar').value = progress;
        }
        
        // 阻止表单提交（仅用于演示）
        document.querySelectorAll('form').forEach(form => {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                alert('表单验证演示 - 实际不会提交');
            });
        });
    </script>
</body>
</html>
```

## 使用说明

这个参考手册展示了HTML5中所有主要的表单元素和输入类型，包括：

### 基本输入类型
- text, email, password, url, tel, search

### 数字和范围输入
- number, range

### 日期时间输入
- date, time, datetime-local, month, week

### 特殊输入
- color, file, hidden

### 高级元素
- datalist, output, progress, meter

### 验证属性
- required, pattern, minlength, maxlength

每个示例都包含了实际的HTML代码和可交互的演示，帮助理解各种表单元素的用法和特性。