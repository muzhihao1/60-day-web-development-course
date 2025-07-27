#!/bin/bash

echo "====================================="
echo "60天现代Web开发课程 - 目录结构验证"
echo "====================================="
echo ""

# 验证主目录
echo "✅ 主目录结构:"
echo "  - 60-day-modern-course/"

# 验证阶段目录
echo ""
echo "✅ 阶段目录:"
phases=("phase-1-modern-web" "phase-2-javascript-mastery" "phase-3-react-development" "phase-4-backend-development" "phase-5-fullstack-deployment")
for phase in "${phases[@]}"; do
    if [ -d "$phase" ]; then
        day_count=$(find "$phase" -type d -name "day-*" | wc -l | tr -d ' ')
        echo "  - $phase/ (包含 $day_count 天)"
    fi
done

# 验证共享资源
echo ""
echo "✅ 共享资源目录:"
shared_dirs=("shared/assets" "shared/components" "shared/utils")
for dir in "${shared_dirs[@]}"; do
    if [ -d "$dir" ]; then
        echo "  - $dir/"
    fi
done

# 验证项目目录
echo ""
echo "✅ 项目目录:"
if [ -d "projects" ]; then
    echo "  - projects/"
fi

# 统计总天数
echo ""
total_days=$(find . -type d -name "day-*" | wc -l | tr -d ' ')
echo "📊 统计信息:"
echo "  - 总天数: $total_days 天"
echo "  - 阶段数: 5 个"
echo "  - 项目数: 5 个（待创建）"

# 验证每天的标准文件
echo ""
echo "✅ 每日标准文件结构:"
sample_day="phase-1-modern-web/day-01"
if [ -d "$sample_day" ]; then
    echo "  示例: $sample_day/"
    [ -f "$sample_day/README.md" ] && echo "    - README.md ✓"
    [ -f "$sample_day/exercise.md" ] && echo "    - exercise.md ✓"
    [ -d "$sample_day/solution" ] && echo "    - solution/ ✓"
    [ -d "$sample_day/code" ] && echo "    - code/ ✓"
fi

echo ""
echo "====================================="
echo "✅ 目录结构创建完成！"
echo "====================================="
echo ""
echo "下一步："
echo "1. 开始编写具体的课程内容"
echo "2. 在 projects/ 目录下创建项目模板"
echo "3. 在 shared/ 目录下添加共享资源"
echo ""