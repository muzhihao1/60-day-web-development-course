---
title: "CSS选择器完整指南"
description: "CSS选择器的全面示例，从基础到高级选择器的实际应用"
category: "css"
language: "css"
day: 4
concepts:
  - "CSS选择器"
  - "伪类选择器"
  - "组合选择器"
relatedTopics:
  - "CSS特异性"
  - "选择器性能"
---

# CSS选择器完整示例

## 基础选择器

```css
/* 元素选择器 */
p {
    color: #333;
    line-height: 1.6;
}

h1, h2, h3, h4, h5, h6 {
    font-family: 'Arial', sans-serif;
    margin-bottom: 1rem;
}

/* 类选择器 */
.highlight {
    background-color: yellow;
    padding: 2px 4px;
}

.text-primary {
    color: #007bff;
}

.text-danger {
    color: #dc3545;
}

/* ID选择器 */
#header {
    background-color: #f8f9fa;
    padding: 1rem;
    position: sticky;
    top: 0;
    z-index: 1000;
}

#main-navigation {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

/* 通用选择器 */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

/* 限定范围的通用选择器 */
.reset-children * {
    all: unset;
    display: revert;
}
```

## 属性选择器

```css
/* 存在属性 */
a[target] {
    padding-right: 20px;
    background: url('external-link.svg') no-repeat right center;
    background-size: 16px;
}

/* 精确匹配属性值 */
input[type="text"] {
    border: 1px solid #ced4da;
    padding: 0.375rem 0.75rem;
    border-radius: 0.25rem;
}

input[type="email"] {
    border-left: 3px solid #17a2b8;
}

input[type="password"] {
    border-left: 3px solid #ffc107;
}

/* 包含特定值 */
a[href*="example.com"] {
    color: #28a745;
    font-weight: bold;
}

/* 以特定值开头 */
a[href^="https://"] {
    padding-left: 20px;
    background: url('secure.svg') no-repeat left center;
    background-size: 16px;
}

a[href^="mailto:"] {
    padding-left: 20px;
    background: url('email.svg') no-repeat left center;
    background-size: 16px;
}

/* 以特定值结尾 */
a[href$=".pdf"] {
    padding-right: 20px;
    background: url('pdf.svg') no-repeat right center;
    background-size: 16px;
}

a[href$=".doc"],
a[href$=".docx"] {
    padding-right: 20px;
    background: url('word.svg') no-repeat right center;
    background-size: 16px;
}

/* 空格分隔的值 */
div[class~="card"] {
    border: 1px solid #dee2e6;
    border-radius: 0.25rem;
    padding: 1rem;
}

/* 连字符分隔的值 */
p[lang|="en"] {
    font-family: 'Times New Roman', serif;
}

p[lang|="zh"] {
    font-family: 'SimSun', serif;
}
```

## 组合选择器

```css
/* 后代选择器 */
article p {
    text-indent: 2em;
    margin-bottom: 1em;
}

nav ul li a {
    text-decoration: none;
    color: #495057;
    padding: 0.5rem 1rem;
    display: block;
}

/* 子选择器 */
ul > li {
    list-style-position: inside;
    padding: 0.5rem;
}

.card > .card-header {
    background-color: #f8f9fa;
    padding: 0.75rem 1.25rem;
    border-bottom: 1px solid #dee2e6;
}

/* 相邻兄弟选择器 */
h2 + p {
    font-size: 1.1em;
    font-weight: 500;
    color: #6c757d;
}

/* 列表项间距 */
li + li {
    margin-top: 0.5rem;
}

/* 一般兄弟选择器 */
h2 ~ p {
    line-height: 1.8;
}

.error ~ .form-text {
    color: #dc3545;
}
```

## 伪类选择器 - 结构

```css
/* 第一个和最后一个子元素 */
li:first-child {
    border-top-left-radius: 0.25rem;
    border-top-right-radius: 0.25rem;
}

li:last-child {
    border-bottom-left-radius: 0.25rem;
    border-bottom-right-radius: 0.25rem;
    margin-bottom: 0;
}

/* 第n个子元素 */
tr:nth-child(even) {
    background-color: #f8f9fa;
}

tr:nth-child(odd) {
    background-color: white;
}

/* 每3个元素 */
.grid-item:nth-child(3n) {
    margin-right: 0;
}

/* 前3个元素 */
li:nth-child(-n+3) {
    font-weight: bold;
}

/* 从第4个开始的所有元素 */
li:nth-child(n+4) {
    opacity: 0.7;
}

/* 倒数第n个 */
li:nth-last-child(1) {
    border-bottom: none;
}

/* 特定类型的第n个 */
article:nth-of-type(1) {
    padding-top: 2rem;
}

p:nth-of-type(2n) {
    background-color: #f8f9fa;
    padding: 1rem;
}

/* 唯一子元素 */
p:only-child {
    font-size: 1.2em;
    text-align: center;
}

/* 特定类型的唯一元素 */
h1:only-of-type {
    text-align: center;
    margin: 2rem 0;
}

/* 空元素 */
p:empty {
    display: none;
}

.placeholder:empty::before {
    content: "暂无内容";
    color: #6c757d;
    font-style: italic;
}

/* 非选择器 */
li:not(:last-child) {
    border-bottom: 1px solid #dee2e6;
}

input:not([type="submit"]):not([type="button"]) {
    width: 100%;
}

/* 根元素 */
:root {
    --primary-color: #007bff;
    --secondary-color: #6c757d;
    --success-color: #28a745;
    --danger-color: #dc3545;
    --warning-color: #ffc107;
}
```

## 伪类选择器 - 状态

```css
/* 链接状态 */
a:link {
    color: #007bff;
}

a:visited {
    color: #6f42c1;
}

a:hover {
    color: #0056b3;
    text-decoration: underline;
}

a:active {
    color: #004085;
}

/* 表单状态 */
input:focus,
textarea:focus,
select:focus {
    outline: none;
    border-color: #80bdff;
    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

input:disabled,
button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

input:checked + label {
    font-weight: bold;
    color: #007bff;
}

/* 验证状态 */
input:valid {
    border-color: #28a745;
    background-image: url('check.svg');
    background-repeat: no-repeat;
    background-position: right 0.75rem center;
    background-size: 1rem;
}

input:invalid {
    border-color: #dc3545;
    background-image: url('error.svg');
    background-repeat: no-repeat;
    background-position: right 0.75rem center;
    background-size: 1rem;
}

input:required {
    border-left: 3px solid #dc3545;
}

input:optional {
    border-left: 3px solid #6c757d;
}

/* 范围状态 */
input:in-range {
    background-color: #d4edda;
}

input:out-of-range {
    background-color: #f8d7da;
}

/* 只读和读写 */
input:read-only {
    background-color: #e9ecef;
}

input:read-write {
    background-color: white;
}

/* 目标伪类 */
section:target {
    background-color: #fff3cd;
    padding: 1rem;
    border-left: 4px solid #ffc107;
}

/* 语言伪类 */
:lang(en) {
    quotes: '\201C' '\201D' '\2018' '\2019';
}

:lang(zh) {
    quotes: '"' '"' ''' ''';
}
```

## 伪元素选择器

```css
/* 首字母和首行 */
p::first-letter {
    font-size: 3em;
    float: left;
    line-height: 1;
    margin-right: 0.1em;
    font-weight: bold;
    color: #007bff;
}

p::first-line {
    font-weight: 500;
    font-variant: small-caps;
}

/* 前后插入内容 */
.required::after {
    content: " *";
    color: #dc3545;
    font-weight: bold;
}

blockquote::before {
    content: """;
    font-size: 3em;
    line-height: 0;
    vertical-align: -0.4em;
    color: #6c757d;
}

blockquote::after {
    content: """;
    font-size: 3em;
    line-height: 0;
    vertical-align: -0.4em;
    color: #6c757d;
}

/* 面包屑导航 */
.breadcrumb li:not(:last-child)::after {
    content: " / ";
    padding: 0 0.5rem;
    color: #6c757d;
}

/* 外部链接标识 */
a[href^="http"]:not([href*="mysite.com"])::after {
    content: " ↗";
    font-size: 0.8em;
    vertical-align: super;
}

/* 选中文本样式 */
::selection {
    background-color: #007bff;
    color: white;
}

::-moz-selection {
    background-color: #007bff;
    color: white;
}

/* 占位符样式 */
::placeholder {
    color: #6c757d;
    opacity: 0.7;
    font-style: italic;
}

/* Webkit滚动条 */
::-webkit-scrollbar {
    width: 12px;
    height: 12px;
}

::-webkit-scrollbar-track {
    background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 6px;
}

::-webkit-scrollbar-thumb:hover {
    background: #555;
}
```

## 高级选择器组合示例

```css
/* 复杂组合 */
.card:hover > .card-body > .card-title {
    color: #007bff;
}

/* 表格样式 */
table tbody tr:hover td:not(:first-child) {
    background-color: #f8f9fa;
}

/* 导航激活状态 */
nav li:has(> a.active) {
    background-color: #e9ecef;
}

/* 表单组 */
.form-group:has(input:invalid) label {
    color: #dc3545;
}

/* 响应式断点内的选择器 */
@media (min-width: 768px) {
    .container > .row > [class*="col-"]:nth-child(odd) {
        padding-right: 30px;
    }
}

/* 打印样式 */
@media print {
    a[href]::after {
        content: " (" attr(href) ")";
    }
    
    abbr[title]::after {
        content: " (" attr(title) ")";
    }
}

/* 特异性示例 */
/* 特异性: 0,0,1,0 */
.button { background: gray; }

/* 特异性: 0,0,1,1 */
input.button { background: blue; }

/* 特异性: 0,0,2,1 */
.form input.button { background: green; }

/* 特异性: 0,1,1,1 */
#contact .form input.button { background: red; }

/* 特异性: 1,0,0,0 */
/* <button style="background: yellow;"> */

/* !important 最高优先级 */
.button { background: black !important; }
```

这些示例涵盖了CSS选择器的所有主要类型和常见用法，可以作为参考和学习材料。