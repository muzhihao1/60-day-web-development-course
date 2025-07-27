#!/bin/bash

# 60天Web开发课程启动脚本

# 进入课程目录
cd "$(dirname "$0")"

# 检查Python版本
if command -v python3 &> /dev/null; then
    # 使用Python脚本启动服务器（自动处理端口）
    python3 start-server.py
else
    echo "❌ 未找到 Python 3"
    echo "请先安装 Python 3: https://www.python.org/downloads/"
    echo ""
    echo "按回车键退出..."
    read
fi