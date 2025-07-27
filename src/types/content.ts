/**
 * 课程内容相关的类型定义
 * 用于定义课程内容的数据结构，确保内容系统与导航系统的数据一致性
 */

/**
 * 课程阶段枚举
 */
export enum Phase {
  ModernWeb = 'modern-web',
  JavaScriptMastery = 'javascript-mastery',
  ReactDevelopment = 'react-development',
  BackendDevelopment = 'backend-development',
  FullstackDeployment = 'fullstack-deployment'
}

/**
 * 课程阶段信息
 */
export interface PhaseInfo {
  id: Phase
  number: number
  name: string
  description: string
  days: number[]
}

/**
 * 单个章节内容
 */
export interface Section {
  id: string
  title: string
  content: string
  order: number
}

/**
 * 练习定义
 */
export interface Exercise {
  id: string
  title: string
  description: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedTime: number // 分钟
  requirements: string[]
  hints?: string[]
}

/**
 * 解决方案定义
 */
export interface Solution {
  exerciseId: string
  files: {
    path: string
    content: string
    language: string
  }[]
  explanation?: string
}

/**
 * 每日课程内容
 */
export interface DayContent {
  day: number
  phase: Phase
  title: string
  description: string
  objectives: string[]
  sections: Section[]
  exercises: Exercise[]
  solution: Solution
  codeExamples?: {
    title: string
    path: string
    language: string
  }[]
  resources?: {
    title: string
    url: string
    type: 'article' | 'video' | 'documentation' | 'tool'
  }[]
  estimatedTime: number // 分钟
  prerequisites?: number[] // 前置课程的day数组
}

/**
 * 内容元数据
 */
export interface ContentMeta {
  lastUpdated: Date
  author?: string
  tags?: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
}

/**
 * 完整的课程内容结构
 */
export interface CourseContent {
  day: DayContent
  meta: ContentMeta
}