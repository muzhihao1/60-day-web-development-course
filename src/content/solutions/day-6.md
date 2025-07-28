---
day: 6
exerciseTitle: "Tailwind CSS仪表板重构"
approach: "使用Tailwind CSS工具类完全重构仪表板，添加暗色模式和交互效果"
files:
  - path: "/phase-1-modern-web/day-06/solution/dashboard-tailwind.html"
    language: "html"
    description: "完整的Tailwind CSS仪表板解决方案"
keyTakeaways:
  - "掌握Tailwind CSS的核心工具类"
  - "实现响应式设计和暗色模式"
  - "使用@apply创建可复用组件"
  - "添加平滑的过渡和动画效果"
commonMistakes:
  - "过度使用@apply，失去了Tailwind的灵活性"
  - "忘记添加响应式前缀导致移动端显示问题"
  - "暗色模式下颜色对比度不够"
  - "没有正确配置Tailwind的purge选项"
---

# Day 6 解决方案：使用Tailwind CSS构建现代仪表板

这是使用Tailwind CSS重构的完整仪表板解决方案，包含响应式设计、暗色模式和交互效果。

## 完整代码

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tailwind CSS 仪表板</title>
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
    <style type="text/tailwindcss">
        @layer components {
            .btn-primary {
                @apply px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors;
            }
            .card {
                @apply bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow;
            }
            .stat-card {
                @apply card p-6 border border-gray-200 dark:border-gray-700;
            }
        }
    </style>
</head>
<body class="bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
    <!-- 通知横幅 -->
    <div id="notification" class="bg-blue-500 text-white px-4 py-3 animate-slide-down">
        <div class="container mx-auto flex justify-between items-center">
            <p class="text-sm">🎉 欢迎使用新版Tailwind CSS仪表板！</p>
            <button onclick="closeNotification()" class="text-white hover:text-gray-200">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </button>
        </div>
    </div>

    <!-- 导航栏 -->
    <nav class="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-40">
        <div class="container mx-auto px-4">
            <div class="flex justify-between items-center h-16">
                <!-- Logo和菜单按钮 -->
                <div class="flex items-center">
                    <button onclick="toggleSidebar()" class="lg:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                        <svg class="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                        </svg>
                    </button>
                    <h1 class="ml-4 text-xl font-semibold text-gray-800 dark:text-white">仪表板</h1>
                </div>

                <!-- 右侧工具栏 -->
                <div class="flex items-center space-x-4">
                    <!-- 搜索框 -->
                    <div class="hidden md:block">
                        <input type="search" placeholder="搜索..." 
                               class="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                    </div>

                    <!-- 暗色模式切换 -->
                    <button onclick="toggleDarkMode()" 
                            class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <svg class="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
                        </svg>
                    </button>

                    <!-- 通知图标 -->
                    <button class="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <svg class="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                        </svg>
                        <span class="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
                    </button>

                    <!-- 用户菜单 -->
                    <div class="relative">
                        <button onclick="toggleUserMenu()" 
                                class="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                            <img src="https://ui-avatars.com/api/?name=Admin&background=3B82F6&color=fff" 
                                 alt="用户头像" class="w-8 h-8 rounded-full">
                            <span class="hidden md:block text-sm text-gray-700 dark:text-gray-300">管理员</span>
                            <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                            </svg>
                        </button>
                        
                        <!-- 下拉菜单 -->
                        <div id="userMenu" class="hidden absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-2 animate-slide-down">
                            <a href="#" class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">个人资料</a>
                            <a href="#" class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">设置</a>
                            <hr class="my-2 border-gray-200 dark:border-gray-700">
                            <a href="#" class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">退出登录</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </nav>

    <!-- 主要内容区域 -->
    <div class="flex">
        <!-- 侧边栏 -->
        <aside id="sidebar" class="fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white dark:bg-gray-800 shadow-lg transform -translate-x-full lg:translate-x-0 transition-transform duration-200 mt-16 lg:mt-0">
            <div class="h-full overflow-y-auto">
                <nav class="p-4 space-y-2">
                    <a href="#" class="flex items-center space-x-3 px-4 py-3 text-gray-700 dark:text-gray-300 bg-blue-50 dark:bg-gray-700 rounded-lg">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                        </svg>
                        <span>仪表板</span>
                    </a>
                    <a href="#" class="flex items-center space-x-3 px-4 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                        </svg>
                        <span>用户管理</span>
                    </a>
                    <a href="#" class="flex items-center space-x-3 px-4 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                        </svg>
                        <span>数据分析</span>
                    </a>
                    <a href="#" class="flex items-center space-x-3 px-4 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        </svg>
                        <span>设置</span>
                    </a>
                </nav>
            </div>
        </aside>

        <!-- 内容区域 -->
        <main class="flex-1 p-4 lg:p-8">
            <!-- 页面标题 -->
            <div class="mb-8 animate-fade-in">
                <h2 class="text-2xl font-bold text-gray-800 dark:text-white">仪表板概览</h2>
                <p class="text-gray-600 dark:text-gray-400 mt-1">欢迎回来，这是您的数据概览</p>
            </div>

            <!-- 统计卡片 -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <!-- 用户总数 -->
                <div class="stat-card transform hover:scale-105 transition-transform duration-200">
                    <div class="flex items-center justify-between mb-4">
                        <div class="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                            <svg class="w-6 h-6 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                            </svg>
                        </div>
                        <span class="text-sm text-green-600 dark:text-green-400 flex items-center">
                            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                            </svg>
                            12%
                        </span>
                    </div>
                    <h3 class="text-gray-600 dark:text-gray-400 text-sm">用户总数</h3>
                    <p class="text-2xl font-bold text-gray-800 dark:text-white">8,282</p>
                </div>

                <!-- 收入 -->
                <div class="stat-card transform hover:scale-105 transition-transform duration-200">
                    <div class="flex items-center justify-between mb-4">
                        <div class="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                            <svg class="w-6 h-6 text-green-600 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        </div>
                        <span class="text-sm text-green-600 dark:text-green-400 flex items-center">
                            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                            </svg>
                            23%
                        </span>
                    </div>
                    <h3 class="text-gray-600 dark:text-gray-400 text-sm">总收入</h3>
                    <p class="text-2xl font-bold text-gray-800 dark:text-white">¥128,430</p>
                </div>

                <!-- 订单 -->
                <div class="stat-card transform hover:scale-105 transition-transform duration-200">
                    <div class="flex items-center justify-between mb-4">
                        <div class="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                            <svg class="w-6 h-6 text-purple-600 dark:text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                            </svg>
                        </div>
                        <span class="text-sm text-red-600 dark:text-red-400 flex items-center">
                            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"></path>
                            </svg>
                            -5%
                        </span>
                    </div>
                    <h3 class="text-gray-600 dark:text-gray-400 text-sm">订单数</h3>
                    <p class="text-2xl font-bold text-gray-800 dark:text-white">1,352</p>
                </div>

                <!-- 转化率 -->
                <div class="stat-card transform hover:scale-105 transition-transform duration-200">
                    <div class="flex items-center justify-between mb-4">
                        <div class="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                            <svg class="w-6 h-6 text-yellow-600 dark:text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                            </svg>
                        </div>
                        <span class="text-sm text-green-600 dark:text-green-400 flex items-center">
                            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                            </svg>
                            8%
                        </span>
                    </div>
                    <h3 class="text-gray-600 dark:text-gray-400 text-sm">转化率</h3>
                    <p class="text-2xl font-bold text-gray-800 dark:text-white">3.2%</p>
                </div>
            </div>

            <!-- 图表和表格区域 -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <!-- 销售图表 -->
                <div class="lg:col-span-2 card p-6">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-lg font-semibold text-gray-800 dark:text-white">销售趋势</h3>
                        <select class="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option>最近7天</option>
                            <option>最近30天</option>
                            <option>最近3个月</option>
                        </select>
                    </div>
                    <div class="h-64 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                        <p class="text-gray-500 dark:text-gray-400">图表区域（需要Chart.js）</p>
                    </div>
                </div>

                <!-- 最新订单 -->
                <div class="card p-6">
                    <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-4">最新订单</h3>
                    <div class="space-y-4">
                        <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div>
                                <p class="font-medium text-gray-800 dark:text-white">#12345</p>
                                <p class="text-sm text-gray-600 dark:text-gray-400">2分钟前</p>
                            </div>
                            <span class="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 dark:bg-green-900 dark:text-green-300 rounded-full">已完成</span>
                        </div>
                        <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div>
                                <p class="font-medium text-gray-800 dark:text-white">#12344</p>
                                <p class="text-sm text-gray-600 dark:text-gray-400">15分钟前</p>
                            </div>
                            <span class="px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 dark:bg-blue-900 dark:text-blue-300 rounded-full">处理中</span>
                        </div>
                        <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div>
                                <p class="font-medium text-gray-800 dark:text-white">#12343</p>
                                <p class="text-sm text-gray-600 dark:text-gray-400">1小时前</p>
                            </div>
                            <span class="px-2 py-1 text-xs font-medium text-yellow-700 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300 rounded-full">待发货</span>
                        </div>
                    </div>
                    <button class="mt-4 w-full btn-primary">查看全部订单</button>
                </div>
            </div>

            <!-- 数据表格 -->
            <div class="mt-8 card p-6">
                <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4">
                    <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-2 sm:mb-0">用户列表</h3>
                    <div class="flex space-x-2">
                        <button class="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            筛选
                        </button>
                        <button class="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            导出
                        </button>
                    </div>
                </div>
                
                <!-- 响应式表格容器 -->
                <div class="overflow-x-auto">
                    <table class="w-full min-w-[600px]">
                        <thead>
                            <tr class="border-b border-gray-200 dark:border-gray-700">
                                <th class="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">用户</th>
                                <th class="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">邮箱</th>
                                <th class="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">状态</th>
                                <th class="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">注册时间</th>
                                <th class="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr class="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                <td class="py-3 px-4">
                                    <div class="flex items-center">
                                        <img src="https://ui-avatars.com/api/?name=张三&background=3B82F6&color=fff" alt="用户头像" class="w-8 h-8 rounded-full mr-3">
                                        <span class="text-gray-800 dark:text-white">张三</span>
                                    </div>
                                </td>
                                <td class="py-3 px-4 text-gray-600 dark:text-gray-400">zhangsan@example.com</td>
                                <td class="py-3 px-4">
                                    <span class="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 dark:bg-green-900 dark:text-green-300 rounded-full">活跃</span>
                                </td>
                                <td class="py-3 px-4 text-gray-600 dark:text-gray-400">2024-01-15</td>
                                <td class="py-3 px-4">
                                    <button class="text-blue-600 dark:text-blue-400 hover:underline text-sm">编辑</button>
                                </td>
                            </tr>
                            <tr class="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                <td class="py-3 px-4">
                                    <div class="flex items-center">
                                        <img src="https://ui-avatars.com/api/?name=李四&background=10B981&color=fff" alt="用户头像" class="w-8 h-8 rounded-full mr-3">
                                        <span class="text-gray-800 dark:text-white">李四</span>
                                    </div>
                                </td>
                                <td class="py-3 px-4 text-gray-600 dark:text-gray-400">lisi@example.com</td>
                                <td class="py-3 px-4">
                                    <span class="px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 dark:bg-gray-600 dark:text-gray-300 rounded-full">未激活</span>
                                </td>
                                <td class="py-3 px-4 text-gray-600 dark:text-gray-400">2024-01-20</td>
                                <td class="py-3 px-4">
                                    <button class="text-blue-600 dark:text-blue-400 hover:underline text-sm">编辑</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- 分页 -->
                <div class="mt-4 flex flex-col sm:flex-row sm:justify-between sm:items-center">
                    <p class="text-sm text-gray-600 dark:text-gray-400 mb-2 sm:mb-0">显示 1-10 条，共 100 条</p>
                    <div class="flex space-x-1">
                        <button class="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">上一页</button>
                        <button class="px-3 py-1 text-sm bg-blue-500 text-white rounded-lg">1</button>
                        <button class="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">2</button>
                        <button class="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">3</button>
                        <button class="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">下一页</button>
                    </div>
                </div>
            </div>
        </main>
    </div>

    <!-- 侧边栏遮罩 -->
    <div id="sidebarOverlay" class="fixed inset-0 bg-black bg-opacity-50 z-20 hidden lg:hidden" onclick="toggleSidebar()"></div>

    <script>
        // 暗色模式切换
        function toggleDarkMode() {
            document.documentElement.classList.toggle('dark');
            localStorage.setItem('darkMode', document.documentElement.classList.contains('dark'));
        }

        // 初始化暗色模式
        if (localStorage.getItem('darkMode') === 'true') {
            document.documentElement.classList.add('dark');
        }

        // 关闭通知
        function closeNotification() {
            document.getElementById('notification').style.display = 'none';
        }

        // 切换用户菜单
        function toggleUserMenu() {
            const menu = document.getElementById('userMenu');
            menu.classList.toggle('hidden');
        }

        // 切换侧边栏
        function toggleSidebar() {
            const sidebar = document.getElementById('sidebar');
            const overlay = document.getElementById('sidebarOverlay');
            
            sidebar.classList.toggle('-translate-x-full');
            overlay.classList.toggle('hidden');
        }

        // 点击外部关闭下拉菜单
        document.addEventListener('click', function(event) {
            const userMenu = document.getElementById('userMenu');
            const userButton = event.target.closest('button[onclick="toggleUserMenu()"]');
            
            if (!userButton && !userMenu.contains(event.target)) {
                userMenu.classList.add('hidden');
            }
        });

        // 页面加载动画
        document.addEventListener('DOMContentLoaded', function() {
            const elements = document.querySelectorAll('.animate-fade-in');
            elements.forEach((el, index) => {
                setTimeout(() => {
                    el.style.opacity = '1';
                }, index * 100);
            });
        });
    </script>
</body>
</html>
```

## 关键实现说明

### 1. 响应式设计
- 使用 `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` 实现自适应网格
- 侧边栏在移动端可折叠，使用 `transform` 和 `transition` 实现平滑动画
- 表格使用 `overflow-x-auto` 确保移动端可横向滚动

### 2. 暗色模式
- 使用 `dark:` 前缀为所有元素添加暗色模式样式
- 通过 `localStorage` 保存用户偏好
- 使用 `transition-colors` 实现平滑的颜色过渡

### 3. 组件化思维
- 使用 `@apply` 创建可复用的组件类（如 `.btn-primary`, `.card`）
- 保持样式的一致性和可维护性

### 4. 交互效果
- 悬停效果：`hover:scale-105`, `hover:shadow-md`
- 过渡动画：`transition-all`, `transition-shadow`
- 自定义动画：`animate-fade-in`, `animate-slide-down`

### 5. 最佳实践
- 使用语义化的HTML结构
- 合理的颜色对比度确保可访问性
- 移动优先的响应式设计
- 状态管理使用原生JavaScript保持轻量级

## 性能优化建议

1. **生产环境优化**
   - 使用 Tailwind CLI 或 PostCSS 进行构建
   - 启用 PurgeCSS 移除未使用的样式
   - 压缩最终的CSS文件

2. **图片优化**
   - 使用适当的图片格式（WebP）
   - 实现懒加载
   - 使用响应式图片

3. **代码分割**
   - 将JavaScript功能模块化
   - 按需加载组件

这个解决方案展示了如何充分利用Tailwind CSS的强大功能，创建一个现代、响应式且用户友好的仪表板界面。