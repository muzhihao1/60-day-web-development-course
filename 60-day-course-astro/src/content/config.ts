import { z, defineCollection } from 'astro:content';

// 阶段（Phase）集合定义
const phaseSchema = z.object({
  title: z.string(),
  description: z.string(),
  order: z.number(),
  duration: z.string(),
  badge: z.enum(['new', 'hot', 'pro']).optional(),
  objectives: z.array(z.string()),
  prerequisites: z.array(z.string()).optional(),
});

// 课程（Lesson）集合定义
const lessonSchema = z.object({
  title: z.string(),
  description: z.string(),
  phase: z.number(),
  day: z.number(),
  duration: z.string().default('1-2小时'),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  tags: z.array(z.string()),
  objectives: z.array(z.string()),
  prerequisites: z.array(z.string()).optional(),
  resources: z.array(z.object({
    title: z.string(),
    url: z.string(),
    type: z.enum(['article', 'video', 'documentation', 'tool'])
  })).optional(),
});

// 练习（Exercise）集合定义
const exerciseSchema = z.object({
  title: z.string(),
  description: z.string(),
  day: z.number(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  estimatedTime: z.string(),
  points: z.number().optional(),
  hints: z.array(z.string()).optional(),
  solution: z.string().optional(),
});

// 项目（Project）集合定义
const projectSchema = z.object({
  title: z.string(),
  description: z.string(),
  phase: z.number(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  duration: z.string(),
  technologies: z.array(z.string()),
  features: z.array(z.string()),
  learningOutcomes: z.array(z.string()),
  repository: z.string().optional(),
  liveDemo: z.string().optional(),
});

// 导出集合
export const collections = {
  phases: defineCollection({
    type: 'data',
    schema: phaseSchema,
  }),
  lessons: defineCollection({
    type: 'content',
    schema: lessonSchema,
  }),
  exercises: defineCollection({
    type: 'content',
    schema: exerciseSchema,
  }),
  projects: defineCollection({
    type: 'content',
    schema: projectSchema,
  }),
};