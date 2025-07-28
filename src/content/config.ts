/**
 * Astro Content Collections配置
 * 定义内容的schema和验证规则
 */

import { defineCollection, z } from 'astro:content'

/**
 * 课程阶段集合
 */
const phases = defineCollection({
  type: 'data',
  schema: z.object({
    number: z.number(),
    name: z.string(),
    description: z.string(),
    startDay: z.number(),
    endDay: z.number(),
    icon: z.string().optional(),
    objectives: z.array(z.string()),
    prerequisites: z.array(z.string()).optional()
  })
})

/**
 * 每日课程集合
 */
const courses = defineCollection({
  type: 'content',
  schema: z.object({
    day: z.number(),
    phase: z.enum([
      'modern-web',
      'javascript-mastery', 
      'react-development',
      'backend-development',
      'fullstack-deployment'
    ]),
    title: z.string(),
    description: z.string(),
    objectives: z.array(z.string()),
    estimatedTime: z.number().default(60), // 分钟
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
    prerequisites: z.array(z.number()).optional(),
    tags: z.array(z.string()).optional(),
    resources: z.array(z.object({
      title: z.string(),
      url: z.string(),
      type: z.enum(['article', 'video', 'documentation', 'tool'])
    })).optional(),
    codeExamples: z.array(z.object({
      title: z.string(),
      language: z.string(),
      path: z.string()
    })).optional()
  })
})

/**
 * 练习集合
 */
const exercises = defineCollection({
  type: 'content',
  schema: z.object({
    day: z.number(),
    title: z.string(),
    description: z.string(),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
    estimatedTime: z.number(), // 分钟
    requirements: z.array(z.string()),
    hints: z.array(z.string()).optional(),
    checkpoints: z.array(z.object({
      task: z.string(),
      completed: z.boolean().default(false)
    })).optional(),
    starterCode: z.object({
      language: z.string(),
      path: z.string()
    }).optional()
  })
})

/**
 * 解决方案集合
 */
const solutions = defineCollection({
  type: 'content',
  schema: z.object({
    day: z.number(),
    exerciseTitle: z.string(),
    approach: z.string(),
    files: z.array(z.object({
      path: z.string(),
      language: z.string(),
      description: z.string().optional()
    })),
    keyTakeaways: z.array(z.string()),
    commonMistakes: z.array(z.string()).optional(),
    extensions: z.array(z.object({
      title: z.string(),
      description: z.string()
    })).optional()
  })
})

/**
 * 代码示例集合
 */
const codeExamples = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    category: z.string(),
    language: z.string()
  })
})

/**
 * 项目集合 - 用于存储课程项目（Capstone Projects）
 */
const projects = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    day: z.number(),
    phase: z.enum([
      'modern-web',
      'javascript-mastery', 
      'react-development',
      'backend-development',
      'fullstack-deployment'
    ]),
    description: z.string(),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
    estimatedTime: z.number(), // 小时
    technologies: z.array(z.string()),
    features: z.array(z.string()),
    requirements: z.array(z.string()),
    starterTemplate: z.string().optional(), // 路径到starter template
    completeSolution: z.string().optional(), // 路径到complete solution
    resources: z.array(z.object({
      title: z.string(),
      url: z.string(),
      type: z.enum(['documentation', 'tutorial', 'reference'])
    })).optional()
  })
})

/**
 * 导出集合配置
 */
export const collections = {
  phases,
  courses,
  exercises,
  solutions,
  codeExamples,
  projects
}