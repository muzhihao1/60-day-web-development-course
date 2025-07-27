/**
 * 导航系统配置和工具函数
 * 设计理念：清晰的学习路径，渐进式内容展示
 */

import type { NavItem, Phase } from '@types/index';

// 课程阶段定义
export const phases: Phase[] = [
  {
    id: 1,
    title: '现代Web基础',
    description: '掌握Git、HTML5、CSS3等现代Web开发基础',
    days: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    color: '#42b883',
    icon: '🌱'
  },
  {
    id: 2,
    title: 'JavaScript精通',
    description: '深入学习ES6+、异步编程、DOM操作等核心技术',
    days: [13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24],
    color: '#f7df1e',
    icon: '⚡'
  },
  {
    id: 3,
    title: 'React现代开发',
    description: '掌握React生态系统，构建现代化应用',
    days: [25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40],
    color: '#61dafb',
    icon: '⚛️'
  },
  {
    id: 4,
    title: '后端开发',
    description: 'Node.js、数据库、API设计等后端技术',
    days: [41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52],
    color: '#539e43',
    icon: '🚀'
  },
  {
    id: 5,
    title: '全栈集成与部署',
    description: '容器化、CI/CD、云服务部署等高级主题',
    days: [53, 54, 55, 56, 57, 58, 59, 60],
    color: '#ff6b6b',
    icon: '🎯'
  }
];

// 获取每日导航结构
export function getDayNavigation(day: number): NavItem[] {
  return [
    {
      label: '📚 学习内容',
      href: `/course/day-${day}`,
      type: 'theory',
      icon: '📚',
      children: [
        {
          label: '今日概览',
          href: `/course/day-${day}#overview`,
          type: 'overview'
        },
        {
          label: '核心概念',
          href: `/course/day-${day}#concepts`,
          type: 'theory'
        },
        {
          label: '详细讲解',
          href: `/course/day-${day}#details`,
          type: 'theory'
        }
      ]
    },
    {
      label: '代码示例',
      href: `/course/day-${day}/code`,
      type: 'practice',
      icon: '💻',
      children: [
        {
          label: '基础示例',
          href: `/course/day-${day}/code#basic`,
          type: 'practice'
        },
        {
          label: '进阶示例',
          href: `/course/day-${day}/code#advanced`,
          type: 'practice'
        },
        {
          label: '实战案例',
          href: `/course/day-${day}/code#real-world`,
          type: 'practice'
        }
      ]
    },
    {
      label: '今日练习',
      href: `/course/day-${day}/exercise`,
      type: 'practice',
      icon: '✍️',
      children: [
        {
          label: '练习说明',
          href: `/course/day-${day}/exercise#instructions`,
          type: 'practice'
        },
        {
          label: '评分标准',
          href: `/course/day-${day}/exercise#criteria`,
          type: 'practice'
        },
        {
          label: '提示',
          href: `/course/day-${day}/exercise#hints`,
          type: 'practice'
        }
      ]
    },
    {
      label: '解决方案',
      href: `/course/day-${day}/solution`,
      type: 'solution',
      icon: '✅',
      children: [
        {
          label: '完整代码',
          href: `/course/day-${day}/solution#code`,
          type: 'solution'
        },
        {
          label: '解题思路',
          href: `/course/day-${day}/solution#approach`,
          type: 'solution'
        },
        {
          label: '优化建议',
          href: `/course/day-${day}/solution#optimization`,
          type: 'solution'
        }
      ]
    }
  ];
}

// 获取阶段导航
export function getPhaseNavigation(phaseId: number): NavItem[] {
  const phase = phases.find(p => p.id === phaseId);
  if (!phase) return [];

  return phase.days.map(day => ({
    label: `Day ${day}`,
    href: `/course/day-${day}`,
    type: 'overview',
    children: getDayNavigation(day)
  }));
}

// 生成面包屑导航
export function generateBreadcrumbs(path: string) {
  const parts = path.split('/').filter(Boolean);
  const breadcrumbs = [
    { label: '首页', href: '/' }
  ];

  if (parts[0] === 'course' && parts[1]?.startsWith('day-')) {
    const day = parseInt(parts[1].replace('day-', ''));
    const phase = phases.find(p => p.days.includes(day));
    
    if (phase) {
      breadcrumbs.push({
        label: phase.title,
        href: `/phase-${phase.id}`
      });
    }

    breadcrumbs.push({
      label: `Day ${day}`,
      href: `/course/day-${day}`
    });

    if (parts[2]) {
      const subPages: Record<string, string> = {
        'code': '代码示例',
        'exercise': '练习',
        'solution': '解决方案'
      };
      
      breadcrumbs.push({
        label: subPages[parts[2]] || parts[2],
        href: `/${parts.join('/')}`
      });
    }
  }

  return breadcrumbs;
}

// 获取学习进度
export function calculateProgress(completedDays: number[]): {
  overall: number;
  phases: { id: number; progress: number }[];
} {
  const overall = (completedDays.length / 60) * 100;
  
  const phasesProgress = phases.map(phase => {
    const completedInPhase = phase.days.filter(day => 
      completedDays.includes(day)
    ).length;
    
    return {
      id: phase.id,
      progress: (completedInPhase / phase.days.length) * 100
    };
  });

  return {
    overall: Math.round(overall),
    phases: phasesProgress
  };
}