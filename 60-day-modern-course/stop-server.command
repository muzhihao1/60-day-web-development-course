#!/bin/bash

# 停止服务器脚本

echo "🛑 正在查找并停止Python HTTP服务器..."
echo "================================"
echo ""

# 查找Python HTTP服务器进程
PIDS=$(ps aux | grep -E "python.*http.server|python.*start-server.py" | grep -v grep | awk '{print $2}')

if [ -z "$PIDS" ]; then
    echo "✅ 没有找到正在运行的Python HTTP服务器"
else
    echo "找到以下服务器进程:"
    ps aux | grep -E "python.*http.server|python.*start-server.py" | grep -v grep
    echo ""
    
    # 停止所有找到的进程
    for PID in $PIDS; do
        echo "停止进程 $PID..."
        kill $PID 2>/dev/null
    done
    
    echo ""
    echo "✅ 所有服务器进程已停止"
fi

echo ""
echo "按回车键退出..."
read