#!/usr/bin/env python3
"""
60天Web开发课程 - 智能启动服务器
自动检测可用端口并启动HTTP服务器
"""

import http.server
import socketserver
import webbrowser
import socket
import time
import os

def find_available_port(start_port=8080, max_port=8090):
    """查找可用端口"""
    for port in range(start_port, max_port + 1):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            try:
                s.bind(('', port))
                return port
            except:
                continue
    return None

def start_server():
    """启动HTTP服务器"""
    print("🚀 正在启动60天Web开发课程...")
    print("=" * 40)
    print()
    
    # 查找可用端口
    port = find_available_port()
    
    if port is None:
        print("❌ 错误: 无法找到可用端口 (8080-8090)")
        print("请关闭其他正在运行的服务器后重试")
        input("\n按回车键退出...")
        return
    
    print(f"✅ 使用端口: {port}")
    print(f"📚 课程地址: http://localhost:{port}")
    print()
    print("👉 浏览器将在3秒后自动打开")
    print("👉 按 Ctrl+C 可以停止服务器")
    print("=" * 40)
    
    # 延迟后打开浏览器
    time.sleep(3)
    webbrowser.open(f'http://localhost:{port}')
    
    # 创建并启动服务器
    Handler = http.server.SimpleHTTPRequestHandler
    with socketserver.TCPServer(("", port), Handler) as httpd:
        print(f"\n📡 服务器正在运行: http://localhost:{port}")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n\n👋 服务器已停止")
            return

if __name__ == "__main__":
    # 切换到脚本所在目录
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    start_server()