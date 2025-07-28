---
title: "Tailwind CSS 组件示例"
description: "使用Tailwind CSS创建常见UI组件"
---

# Tailwind CSS 组件示例

## 完整示例代码

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tailwind CSS 组件示例</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    animation: {
                        'fade-in': 'fadeIn 0.5s ease-in-out',
                        'slide-down': 'slideDown 0.3s ease-out',
                    },
                    keyframes: {
                        fadeIn: {
                            '0%': { opacity: '0' },
                            '100%': { opacity: '1' },
                        },
                        slideDown: {
                            '0%': { transform: 'translateY(-10px)', opacity: '0' },
                            '100%': { transform: 'translateY(0)', opacity: '1' },
                        }
                    }
                }
            }
        }
    </script>
    <style>
        @layer components {
            .btn {
                @apply px-4 py-2 rounded-lg font-medium transition-all duration-200 
                       focus:outline-none focus:ring-2 focus:ring-offset-2;
            }
            .btn-primary {
                @apply btn bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500;
            }
            .btn-secondary {
                @apply btn bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500;
            }
            .btn-danger {
                @apply btn bg-red-600 text-white hover:bg-red-700 focus:ring-red-500;
            }
        }
    </style>
</head>
<body class="bg-gray-100">
    <div class="container mx-auto px-4 py-8">
        <h1 class="text-3xl font-bold text-center mb-12 text-gray-800">
            Tailwind CSS 组件库
        </h1>

        <!-- 1. 按钮组件 -->
        <section class="mb-12">
            <h2 class="text-2xl font-semibold mb-6 text-gray-700">1. 按钮组件</h2>
            <div class="bg-white p-6 rounded-lg shadow">
                <!-- 基础按钮 -->
                <h3 class="text-lg font-medium mb-4">基础按钮</h3>
                <div class="flex flex-wrap gap-4 mb-6">
                    <button class="btn-primary">主要按钮</button>
                    <button class="btn-secondary">次要按钮</button>
                    <button class="btn-danger">危险按钮</button>
                    <button class="btn bg-green-600 text-white hover:bg-green-700 
                                 focus:ring-green-500">
                        成功按钮
                    </button>
                    <button class="btn bg-yellow-500 text-white hover:bg-yellow-600 
                                 focus:ring-yellow-500">
                        警告按钮
                    </button>
                </div>

                <!-- 按钮尺寸 -->
                <h3 class="text-lg font-medium mb-4">按钮尺寸</h3>
                <div class="flex flex-wrap gap-4 items-center mb-6">
                    <button class="px-2 py-1 text-xs bg-blue-600 text-white rounded 
                                 hover:bg-blue-700">
                        极小按钮
                    </button>
                    <button class="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md 
                                 hover:bg-blue-700">
                        小按钮
                    </button>
                    <button class="btn-primary">默认按钮</button>
                    <button class="px-6 py-3 text-lg bg-blue-600 text-white rounded-lg 
                                 hover:bg-blue-700">
                        大按钮
                    </button>
                </div>

                <!-- 特殊按钮 -->
                <h3 class="text-lg font-medium mb-4">特殊按钮</h3>
                <div class="flex flex-wrap gap-4">
                    <button class="btn border-2 border-blue-600 text-blue-600 
                                 hover:bg-blue-600 hover:text-white">
                        轮廓按钮
                    </button>
                    <button class="btn-primary rounded-full">圆角按钮</button>
                    <button class="btn-primary" disabled 
                          class="opacity-50 cursor-not-allowed">
                        禁用按钮
                    </button>
                    <button class="btn-primary inline-flex items-center">
                        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" 
                             viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" 
                                  stroke-width="2" d="M12 4v16m8-8H4"></path>
                        </svg>
                        图标按钮
                    </button>
                </div>
            </div>
        </section>

        <!-- 2. 卡片组件 -->
        <section class="mb-12">
            <h2 class="text-2xl font-semibold mb-6 text-gray-700">2. 卡片组件</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <!-- 基础卡片 -->
                <div class="bg-white rounded-lg shadow-md p-6">
                    <h3 class="text-xl font-semibold mb-2">基础卡片</h3>
                    <p class="text-gray-600 mb-4">
                        这是一个基础的卡片组件，包含标题和内容。
                    </p>
                    <button class="text-blue-600 hover:text-blue-700 font-medium">
                        了解更多 →
                    </button>
                </div>

                <!-- 图片卡片 -->
                <div class="bg-white rounded-lg shadow-md overflow-hidden">
                    <div class="h-48 bg-gradient-to-r from-blue-400 to-blue-600"></div>
                    <div class="p-6">
                        <h3 class="text-xl font-semibold mb-2">图片卡片</h3>
                        <p class="text-gray-600 mb-4">
                            带有头部图片的卡片组件。
                        </p>
                        <div class="flex justify-between items-center">
                            <span class="text-gray-500 text-sm">2024年1月</span>
                            <button class="btn-primary text-sm">查看</button>
                        </div>
                    </div>
                </div>

                <!-- 悬停效果卡片 -->
                <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-xl 
                          transform hover:-translate-y-1 transition-all duration-300">
                    <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center 
                              justify-center mb-4">
                        <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" 
                             viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" 
                                  stroke-width="2" 
                                  d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                        </svg>
                    </div>
                    <h3 class="text-xl font-semibold mb-2">互动卡片</h3>
                    <p class="text-gray-600">
                        悬停时会有抬起效果和阴影变化。
                    </p>
                </div>
            </div>
        </section>

        <!-- 3. 表单组件 -->
        <section class="mb-12">
            <h2 class="text-2xl font-semibold mb-6 text-gray-700">3. 表单组件</h2>
            <div class="bg-white p-6 rounded-lg shadow">
                <form class="max-w-2xl mx-auto">
                    <!-- 输入框 -->
                    <div class="mb-6">
                        <label class="block text-gray-700 text-sm font-bold mb-2">
                            用户名
                        </label>
                        <input type="text" placeholder="请输入用户名" 
                               class="w-full px-4 py-2 border border-gray-300 rounded-lg 
                                    focus:outline-none focus:ring-2 focus:ring-blue-500 
                                    focus:border-transparent">
                    </div>

                    <!-- 带图标的输入框 -->
                    <div class="mb-6">
                        <label class="block text-gray-700 text-sm font-bold mb-2">
                            邮箱地址
                        </label>
                        <div class="relative">
                            <div class="absolute inset-y-0 left-0 pl-3 flex items-center 
                                      pointer-events-none">
                                <svg class="h-5 w-5 text-gray-400" fill="none" 
                                     stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" 
                                          stroke-width="2" 
                                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z">
                                    </path>
                                </svg>
                            </div>
                            <input type="email" placeholder="your@email.com" 
                                   class="w-full pl-10 pr-4 py-2 border border-gray-300 
                                        rounded-lg focus:outline-none focus:ring-2 
                                        focus:ring-blue-500 focus:border-transparent">
                        </div>
                    </div>

                    <!-- 选择框 -->
                    <div class="mb-6">
                        <label class="block text-gray-700 text-sm font-bold mb-2">
                            选择国家
                        </label>
                        <select class="w-full px-4 py-2 border border-gray-300 rounded-lg 
                                     focus:outline-none focus:ring-2 focus:ring-blue-500 
                                     focus:border-transparent">
                            <option>请选择</option>
                            <option>中国</option>
                            <option>美国</option>
                            <option>日本</option>
                        </select>
                    </div>

                    <!-- 文本域 -->
                    <div class="mb-6">
                        <label class="block text-gray-700 text-sm font-bold mb-2">
                            留言内容
                        </label>
                        <textarea rows="4" placeholder="请输入您的留言..." 
                                  class="w-full px-4 py-2 border border-gray-300 rounded-lg 
                                       focus:outline-none focus:ring-2 focus:ring-blue-500 
                                       focus:border-transparent resize-none"></textarea>
                    </div>

                    <!-- 复选框和单选框 -->
                    <div class="mb-6">
                        <label class="block text-gray-700 text-sm font-bold mb-2">
                            选项
                        </label>
                        <div class="space-y-2">
                            <label class="flex items-center">
                                <input type="checkbox" class="form-checkbox h-4 w-4 
                                                             text-blue-600 rounded">
                                <span class="ml-2 text-gray-700">接收邮件通知</span>
                            </label>
                            <label class="flex items-center">
                                <input type="checkbox" class="form-checkbox h-4 w-4 
                                                             text-blue-600 rounded">
                                <span class="ml-2 text-gray-700">同意服务条款</span>
                            </label>
                        </div>
                    </div>

                    <!-- 提交按钮 -->
                    <div class="flex justify-end">
                        <button type="button" class="btn-secondary mr-4">取消</button>
                        <button type="submit" class="btn-primary">提交</button>
                    </div>
                </form>
            </div>
        </section>

        <!-- 4. 导航组件 -->
        <section class="mb-12">
            <h2 class="text-2xl font-semibold mb-6 text-gray-700">4. 导航组件</h2>
            
            <!-- 标签页 -->
            <div class="bg-white rounded-lg shadow mb-6">
                <div class="border-b border-gray-200">
                    <nav class="flex -mb-px">
                        <a href="#" class="py-4 px-6 border-b-2 border-blue-500 
                                       text-blue-600 font-medium">
                            活动标签
                        </a>
                        <a href="#" class="py-4 px-6 border-b-2 border-transparent 
                                       text-gray-500 hover:text-gray-700 
                                       hover:border-gray-300">
                            标签二
                        </a>
                        <a href="#" class="py-4 px-6 border-b-2 border-transparent 
                                       text-gray-500 hover:text-gray-700 
                                       hover:border-gray-300">
                            标签三
                        </a>
                    </nav>
                </div>
                <div class="p-6">
                    <p class="text-gray-600">标签页内容区域</p>
                </div>
            </div>

            <!-- 面包屑 -->
            <div class="bg-white p-6 rounded-lg shadow">
                <nav class="flex" aria-label="Breadcrumb">
                    <ol class="inline-flex items-center space-x-1 md:space-x-3">
                        <li class="inline-flex items-center">
                            <a href="#" class="text-gray-700 hover:text-blue-600">
                                首页
                            </a>
                        </li>
                        <li>
                            <div class="flex items-center">
                                <svg class="w-6 h-6 text-gray-400" fill="currentColor" 
                                     viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" 
                                          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" 
                                          clip-rule="evenodd"></path>
                                </svg>
                                <a href="#" class="ml-1 text-gray-700 hover:text-blue-600 
                                               md:ml-2">
                                    产品
                                </a>
                            </div>
                        </li>
                        <li aria-current="page">
                            <div class="flex items-center">
                                <svg class="w-6 h-6 text-gray-400" fill="currentColor" 
                                     viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" 
                                          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" 
                                          clip-rule="evenodd"></path>
                                </svg>
                                <span class="ml-1 text-gray-500 md:ml-2">详情</span>
                            </div>
                        </li>
                    </ol>
                </nav>
            </div>
        </section>

        <!-- 5. 弹窗/模态框 -->
        <section class="mb-12">
            <h2 class="text-2xl font-semibold mb-6 text-gray-700">5. 弹窗组件</h2>
            <div class="bg-white p-6 rounded-lg shadow">
                <button onclick="openModal()" class="btn-primary">打开模态框</button>
                
                <!-- 模态框 -->
                <div id="modal" class="hidden fixed inset-0 z-50 overflow-y-auto">
                    <div class="flex items-center justify-center min-h-screen p-4">
                        <!-- 背景遮罩 -->
                        <div class="fixed inset-0 bg-black opacity-50" 
                             onclick="closeModal()"></div>
                        
                        <!-- 模态框内容 -->
                        <div class="relative bg-white rounded-lg shadow-xl max-w-md w-full 
                                  animate-fade-in">
                            <div class="p-6">
                                <h3 class="text-xl font-semibold mb-4">模态框标题</h3>
                                <p class="text-gray-600 mb-6">
                                    这是一个模态框示例，可以用于显示重要信息或获取用户确认。
                                </p>
                                <div class="flex justify-end space-x-4">
                                    <button onclick="closeModal()" 
                                          class="btn-secondary">
                                        取消
                                    </button>
                                    <button onclick="closeModal()" 
                                          class="btn-primary">
                                        确认
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- 6. 警告/通知 -->
        <section class="mb-12">
            <h2 class="text-2xl font-semibold mb-6 text-gray-700">6. 警告和通知</h2>
            <div class="space-y-4">
                <!-- 成功通知 -->
                <div class="bg-green-50 border-l-4 border-green-500 p-4 rounded-md">
                    <div class="flex">
                        <div class="flex-shrink-0">
                            <svg class="h-5 w-5 text-green-400" fill="none" 
                                 stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" 
                                      stroke-width="2" 
                                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z">
                                </path>
                            </svg>
                        </div>
                        <div class="ml-3">
                            <p class="text-sm text-green-800">
                                <strong>成功！</strong> 您的操作已成功完成。
                            </p>
                        </div>
                        <div class="ml-auto pl-3">
                            <button class="text-green-500 hover:text-green-700">
                                <svg class="h-5 w-5" fill="none" stroke="currentColor" 
                                     viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" 
                                          stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- 警告通知 -->
                <div class="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-md">
                    <div class="flex">
                        <div class="flex-shrink-0">
                            <svg class="h-5 w-5 text-yellow-400" fill="none" 
                                 stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" 
                                      stroke-width="2" 
                                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z">
                                </path>
                            </svg>
                        </div>
                        <div class="ml-3">
                            <p class="text-sm text-yellow-800">
                                <strong>警告！</strong> 请注意系统维护时间。
                            </p>
                        </div>
                    </div>
                </div>

                <!-- 错误通知 -->
                <div class="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                    <div class="flex">
                        <div class="flex-shrink-0">
                            <svg class="h-5 w-5 text-red-400" fill="none" 
                                 stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" 
                                      stroke-width="2" 
                                      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z">
                                </path>
                            </svg>
                        </div>
                        <div class="ml-3">
                            <p class="text-sm text-red-800">
                                <strong>错误！</strong> 操作失败，请重试。
                            </p>
                        </div>
                    </div>
                </div>

                <!-- 信息通知 -->
                <div class="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-md">
                    <div class="flex">
                        <div class="flex-shrink-0">
                            <svg class="h-5 w-5 text-blue-400" fill="none" 
                                 stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" 
                                      stroke-width="2" 
                                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z">
                                </path>
                            </svg>
                        </div>
                        <div class="ml-3">
                            <p class="text-sm text-blue-800">
                                <strong>提示：</strong> 新功能已上线，欢迎体验。
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- 7. 徽章和标签 -->
        <section class="mb-12">
            <h2 class="text-2xl font-semibold mb-6 text-gray-700">7. 徽章和标签</h2>
            <div class="bg-white p-6 rounded-lg shadow">
                <!-- 基础徽章 -->
                <h3 class="text-lg font-medium mb-4">状态徽章</h3>
                <div class="flex flex-wrap gap-4 mb-6">
                    <span class="px-3 py-1 text-xs font-semibold text-green-800 
                               bg-green-100 rounded-full">
                        成功
                    </span>
                    <span class="px-3 py-1 text-xs font-semibold text-yellow-800 
                               bg-yellow-100 rounded-full">
                        警告
                    </span>
                    <span class="px-3 py-1 text-xs font-semibold text-red-800 
                               bg-red-100 rounded-full">
                        错误
                    </span>
                    <span class="px-3 py-1 text-xs font-semibold text-blue-800 
                               bg-blue-100 rounded-full">
                        信息
                    </span>
                    <span class="px-3 py-1 text-xs font-semibold text-gray-800 
                               bg-gray-100 rounded-full">
                        默认
                    </span>
                </div>

                <!-- 带图标的徽章 -->
                <h3 class="text-lg font-medium mb-4">带图标徽章</h3>
                <div class="flex flex-wrap gap-4">
                    <span class="inline-flex items-center px-3 py-1 rounded-full 
                               text-xs font-medium bg-green-100 text-green-800">
                        <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" 
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                                  clip-rule="evenodd"></path>
                        </svg>
                        已验证
                    </span>
                    <span class="inline-flex items-center px-3 py-1 rounded-full 
                               text-xs font-medium bg-purple-100 text-purple-800">
                        <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                        </svg>
                        精选
                    </span>
                </div>
            </div>
        </section>
    </div>

    <script>
        function openModal() {
            document.getElementById('modal').classList.remove('hidden');
        }

        function closeModal() {
            document.getElementById('modal').classList.add('hidden');
        }
    </script>
</body>
</html>
```

## 组件设计原则

### 1. 可复用性
- 使用 `@apply` 创建可复用的组件类
- 保持组件样式的一致性
- 避免过度抽象

### 2. 响应式设计
- 所有组件都应考虑移动端适配
- 使用响应式前缀调整不同屏幕的样式
- 测试在各种设备上的表现

### 3. 交互反馈
- 添加 hover、focus、active 状态
- 使用过渡动画提升用户体验
- 提供清晰的视觉反馈

### 4. 可访问性
- 使用语义化的HTML标签
- 添加适当的 ARIA 属性
- 确保键盘导航支持
- 保持足够的颜色对比度

### 5. 性能考虑
- 避免过多的DOM嵌套
- 合理使用动画效果
- 优化图片和资源加载