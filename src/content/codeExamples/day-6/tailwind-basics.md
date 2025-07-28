---
title: "Tailwind CSS 基础工具类"
description: "展示Tailwind CSS的核心工具类使用方法"
---

# Tailwind CSS 基础工具类示例

## 完整示例代码

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tailwind CSS 基础示例</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50">
    <div class="container mx-auto px-4 py-8 max-w-6xl">
        <h1 class="text-4xl font-bold text-center mb-12 text-gray-800">
            Tailwind CSS 基础工具类示例
        </h1>
        
        <!-- 1. 布局 (Layout) -->
        <section class="mb-12">
            <h2 class="text-2xl font-semibold mb-6 text-gray-700">1. 布局 (Layout)</h2>
            
            <!-- Flexbox -->
            <div class="mb-8">
                <h3 class="text-lg font-medium mb-4 text-gray-600">Flexbox 布局</h3>
                <div class="bg-white p-6 rounded-lg shadow">
                    <!-- 等分布局 -->
                    <div class="flex gap-4 mb-4">
                        <div class="flex-1 bg-blue-200 p-4 rounded text-center">flex-1</div>
                        <div class="flex-1 bg-blue-300 p-4 rounded text-center">flex-1</div>
                        <div class="flex-1 bg-blue-400 p-4 rounded text-center">flex-1</div>
                    </div>
                    <!-- 对齐方式 -->
                    <div class="flex justify-between items-center gap-4">
                        <div class="bg-green-200 p-4 rounded">左对齐</div>
                        <div class="bg-green-300 p-4 rounded">居中</div>
                        <div class="bg-green-400 p-4 rounded">右对齐</div>
                    </div>
                </div>
            </div>
            
            <!-- Grid -->
            <div class="mb-8">
                <h3 class="text-lg font-medium mb-4 text-gray-600">Grid 布局</h3>
                <div class="bg-white p-6 rounded-lg shadow">
                    <div class="grid grid-cols-3 gap-4">
                        <div class="bg-purple-200 p-4 rounded text-center">1</div>
                        <div class="bg-purple-300 p-4 rounded text-center">2</div>
                        <div class="bg-purple-400 p-4 rounded text-center">3</div>
                        <div class="bg-purple-200 p-4 rounded text-center col-span-2">跨2列</div>
                        <div class="bg-purple-300 p-4 rounded text-center">6</div>
                    </div>
                </div>
            </div>
        </section>
        
        <!-- 2. 间距 (Spacing) -->
        <section class="mb-12">
            <h2 class="text-2xl font-semibold mb-6 text-gray-700">2. 间距 (Spacing)</h2>
            <div class="bg-white p-6 rounded-lg shadow">
                <!-- Padding 示例 -->
                <div class="mb-6">
                    <h3 class="text-lg font-medium mb-4 text-gray-600">Padding 示例</h3>
                    <div class="space-y-4">
                        <div class="bg-indigo-100 p-2 rounded">p-2 (0.5rem)</div>
                        <div class="bg-indigo-200 p-4 rounded">p-4 (1rem)</div>
                        <div class="bg-indigo-300 p-6 rounded">p-6 (1.5rem)</div>
                        <div class="bg-indigo-400 px-8 py-2 rounded text-white">px-8 py-2</div>
                    </div>
                </div>
                
                <!-- Margin 示例 -->
                <div>
                    <h3 class="text-lg font-medium mb-4 text-gray-600">Margin 示例</h3>
                    <div class="bg-gray-100 p-4 rounded">
                        <div class="bg-pink-200 p-4 mb-2 rounded">mb-2</div>
                        <div class="bg-pink-300 p-4 mb-4 rounded">mb-4</div>
                        <div class="bg-pink-400 p-4 rounded">最后一个元素</div>
                    </div>
                </div>
            </div>
        </section>
        
        <!-- 3. 颜色 (Colors) -->
        <section class="mb-12">
            <h2 class="text-2xl font-semibold mb-6 text-gray-700">3. 颜色 (Colors)</h2>
            <div class="bg-white p-6 rounded-lg shadow">
                <!-- 背景颜色 -->
                <div class="mb-6">
                    <h3 class="text-lg font-medium mb-4 text-gray-600">背景颜色</h3>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div class="bg-red-500 text-white p-4 rounded text-center">bg-red-500</div>
                        <div class="bg-blue-500 text-white p-4 rounded text-center">bg-blue-500</div>
                        <div class="bg-green-500 text-white p-4 rounded text-center">bg-green-500</div>
                        <div class="bg-yellow-500 text-white p-4 rounded text-center">bg-yellow-500</div>
                    </div>
                </div>
                
                <!-- 文字颜色 -->
                <div class="mb-6">
                    <h3 class="text-lg font-medium mb-4 text-gray-600">文字颜色</h3>
                    <div class="space-y-2">
                        <p class="text-red-600 font-medium">text-red-600 - 红色文字</p>
                        <p class="text-blue-600 font-medium">text-blue-600 - 蓝色文字</p>
                        <p class="text-green-600 font-medium">text-green-600 - 绿色文字</p>
                        <p class="text-gray-600 font-medium">text-gray-600 - 灰色文字</p>
                    </div>
                </div>
                
                <!-- 渐变背景 -->
                <div>
                    <h3 class="text-lg font-medium mb-4 text-gray-600">渐变背景</h3>
                    <div class="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 
                                text-white p-8 rounded-lg text-center font-bold text-xl">
                        渐变背景示例
                    </div>
                </div>
            </div>
        </section>
        
        <!-- 4. 文字样式 (Typography) -->
        <section class="mb-12">
            <h2 class="text-2xl font-semibold mb-6 text-gray-700">4. 文字样式 (Typography)</h2>
            <div class="bg-white p-6 rounded-lg shadow">
                <!-- 字体大小 -->
                <div class="mb-6">
                    <h3 class="text-lg font-medium mb-4 text-gray-600">字体大小</h3>
                    <div class="space-y-2">
                        <p class="text-xs">text-xs - 极小文字 (0.75rem)</p>
                        <p class="text-sm">text-sm - 小号文字 (0.875rem)</p>
                        <p class="text-base">text-base - 基础大小 (1rem)</p>
                        <p class="text-lg">text-lg - 大号文字 (1.125rem)</p>
                        <p class="text-xl">text-xl - 加大文字 (1.25rem)</p>
                        <p class="text-2xl">text-2xl - 2倍大小 (1.5rem)</p>
                        <p class="text-3xl">text-3xl - 3倍大小 (1.875rem)</p>
                    </div>
                </div>
                
                <!-- 字体粗细 -->
                <div class="mb-6">
                    <h3 class="text-lg font-medium mb-4 text-gray-600">字体粗细</h3>
                    <div class="space-y-2">
                        <p class="font-thin">font-thin - 极细体</p>
                        <p class="font-light">font-light - 细体</p>
                        <p class="font-normal">font-normal - 正常</p>
                        <p class="font-medium">font-medium - 中等</p>
                        <p class="font-semibold">font-semibold - 半粗体</p>
                        <p class="font-bold">font-bold - 粗体</p>
                        <p class="font-extrabold">font-extrabold - 特粗体</p>
                    </div>
                </div>
                
                <!-- 文字装饰 -->
                <div>
                    <h3 class="text-lg font-medium mb-4 text-gray-600">文字装饰</h3>
                    <div class="space-y-2">
                        <p class="italic">italic - 斜体文字</p>
                        <p class="underline">underline - 下划线文字</p>
                        <p class="line-through">line-through - 删除线文字</p>
                        <p class="uppercase">uppercase - 大写转换</p>
                        <p class="lowercase">LOWERCASE - 小写转换</p>
                        <p class="capitalize">capitalize - 首字母大写</p>
                    </div>
                </div>
            </div>
        </section>
        
        <!-- 5. 边框和圆角 (Borders) -->
        <section class="mb-12">
            <h2 class="text-2xl font-semibold mb-6 text-gray-700">5. 边框和圆角 (Borders)</h2>
            <div class="bg-white p-6 rounded-lg shadow">
                <!-- 边框宽度 -->
                <div class="mb-6">
                    <h3 class="text-lg font-medium mb-4 text-gray-600">边框宽度</h3>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div class="border border-gray-400 p-4 text-center">border</div>
                        <div class="border-2 border-gray-400 p-4 text-center">border-2</div>
                        <div class="border-4 border-gray-400 p-4 text-center">border-4</div>
                        <div class="border-8 border-gray-400 p-4 text-center">border-8</div>
                    </div>
                </div>
                
                <!-- 圆角 -->
                <div class="mb-6">
                    <h3 class="text-lg font-medium mb-4 text-gray-600">圆角</h3>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div class="bg-blue-200 p-4 rounded-none text-center">rounded-none</div>
                        <div class="bg-blue-300 p-4 rounded text-center">rounded</div>
                        <div class="bg-blue-400 p-4 rounded-lg text-center">rounded-lg</div>
                        <div class="bg-blue-500 p-4 rounded-full text-center text-white">
                            rounded-full
                        </div>
                    </div>
                </div>
                
                <!-- 边框样式 -->
                <div>
                    <h3 class="text-lg font-medium mb-4 text-gray-600">边框样式</h3>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div class="border-2 border-solid border-gray-400 p-4 text-center">
                            border-solid
                        </div>
                        <div class="border-2 border-dashed border-gray-400 p-4 text-center">
                            border-dashed
                        </div>
                        <div class="border-2 border-dotted border-gray-400 p-4 text-center">
                            border-dotted
                        </div>
                    </div>
                </div>
            </div>
        </section>
        
        <!-- 6. 效果 (Effects) -->
        <section class="mb-12">
            <h2 class="text-2xl font-semibold mb-6 text-gray-700">6. 效果 (Effects)</h2>
            <div class="bg-white p-6 rounded-lg shadow">
                <!-- 阴影 -->
                <div class="mb-6">
                    <h3 class="text-lg font-medium mb-4 text-gray-600">阴影</h3>
                    <div class="grid grid-cols-2 md:grid-cols-3 gap-6">
                        <div class="bg-white p-6 rounded shadow-sm">shadow-sm</div>
                        <div class="bg-white p-6 rounded shadow">shadow</div>
                        <div class="bg-white p-6 rounded shadow-md">shadow-md</div>
                        <div class="bg-white p-6 rounded shadow-lg">shadow-lg</div>
                        <div class="bg-white p-6 rounded shadow-xl">shadow-xl</div>
                        <div class="bg-white p-6 rounded shadow-2xl">shadow-2xl</div>
                    </div>
                </div>
                
                <!-- 透明度 -->
                <div>
                    <h3 class="text-lg font-medium mb-4 text-gray-600">透明度</h3>
                    <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div class="bg-blue-500 p-4 rounded text-white text-center opacity-100">
                            100%
                        </div>
                        <div class="bg-blue-500 p-4 rounded text-white text-center opacity-75">
                            75%
                        </div>
                        <div class="bg-blue-500 p-4 rounded text-white text-center opacity-50">
                            50%
                        </div>
                        <div class="bg-blue-500 p-4 rounded text-white text-center opacity-25">
                            25%
                        </div>
                        <div class="bg-blue-500 p-4 rounded text-white text-center opacity-0">
                            0%
                        </div>
                    </div>
                </div>
            </div>
        </section>
        
        <!-- 7. 交互状态 (Interactive States) -->
        <section class="mb-12">
            <h2 class="text-2xl font-semibold mb-6 text-gray-700">
                7. 交互状态 (Interactive States)
            </h2>
            <div class="bg-white p-6 rounded-lg shadow">
                <div class="space-y-4">
                    <!-- Hover 效果 -->
                    <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold 
                                   py-2 px-4 rounded transition duration-300">
                        Hover效果按钮
                    </button>
                    
                    <!-- Active 效果 -->
                    <button class="bg-green-500 active:bg-green-700 text-white font-bold 
                                   py-2 px-4 rounded">
                        Active效果按钮（点击试试）
                    </button>
                    
                    <!-- Focus 效果 -->
                    <input type="text" placeholder="Focus效果输入框" 
                           class="border border-gray-300 focus:border-blue-500 
                                  focus:outline-none px-4 py-2 rounded w-full max-w-sm">
                    
                    <!-- Disabled 状态 -->
                    <button class="bg-gray-500 text-white font-bold py-2 px-4 rounded 
                                   opacity-50 cursor-not-allowed" disabled>
                        禁用状态按钮
                    </button>
                    
                    <!-- Group 状态 -->
                    <div class="group bg-gray-100 p-4 rounded hover:bg-gray-200 cursor-pointer">
                        <p class="group-hover:text-blue-600 font-medium">
                            鼠标悬停父元素，子元素变色
                        </p>
                        <p class="text-sm text-gray-600 group-hover:text-gray-800">
                            子元素也会响应
                        </p>
                    </div>
                </div>
            </div>
        </section>
        
        <!-- 8. 动画 (Animations) -->
        <section class="mb-12">
            <h2 class="text-2xl font-semibold mb-6 text-gray-700">8. 动画 (Animations)</h2>
            <div class="bg-white p-6 rounded-lg shadow">
                <div class="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                    <!-- 旋转动画 -->
                    <div>
                        <div class="animate-spin bg-blue-500 text-white p-4 rounded-lg 
                                    inline-block mb-2">
                            旋转
                        </div>
                        <p class="text-sm text-gray-600">animate-spin</p>
                    </div>
                    <!-- 脉冲动画 -->
                    <div>
                        <div class="animate-ping bg-green-500 text-white p-4 rounded-lg 
                                    inline-block mb-2">
                            脉冲
                        </div>
                        <p class="text-sm text-gray-600">animate-ping</p>
                    </div>
                    <!-- 呼吸动画 -->
                    <div>
                        <div class="animate-pulse bg-purple-500 text-white p-4 rounded-lg 
                                    inline-block mb-2">
                            呼吸
                        </div>
                        <p class="text-sm text-gray-600">animate-pulse</p>
                    </div>
                    <!-- 弹跳动画 -->
                    <div>
                        <div class="animate-bounce bg-red-500 text-white p-4 rounded-lg 
                                    inline-block mb-2">
                            弹跳
                        </div>
                        <p class="text-sm text-gray-600">animate-bounce</p>
                    </div>
                </div>
            </div>
        </section>
    </div>
</body>
</html>
```

## 关键概念说明

### 1. 布局工具类
- `flex` - 创建 Flex 容器
- `grid` - 创建 Grid 容器
- `flex-1` - 让元素占据剩余空间
- `grid-cols-3` - 创建3列网格
- `col-span-2` - 跨越2列

### 2. 间距系统
- 数字对应rem值：`1 = 0.25rem`, `4 = 1rem`, `8 = 2rem`
- `p-` 设置padding，`m-` 设置margin
- 方向：`t`(top), `r`(right), `b`(bottom), `l`(left), `x`(水平), `y`(垂直)

### 3. 颜色系统
- 颜色名-数字：`blue-500`, `gray-700`
- 数字越大颜色越深（50-900）
- 支持所有CSS颜色属性：`bg-`, `text-`, `border-`

### 4. 响应式前缀
- `sm:` - 640px及以上
- `md:` - 768px及以上
- `lg:` - 1024px及以上
- `xl:` - 1280px及以上
- `2xl:` - 1536px及以上

### 5. 状态变体
- `hover:` - 鼠标悬停时
- `focus:` - 获得焦点时
- `active:` - 激活状态时
- `disabled:` - 禁用状态时
- `group-hover:` - 父元素悬停时