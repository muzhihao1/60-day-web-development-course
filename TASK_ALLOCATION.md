# Task Allocation Plan - Web Development Course Migration

## Executive Summary

This document outlines the task allocation and collaboration strategy for migrating and developing the 60-day web development course using Astro framework. Three terminals (A, B, C) will work in parallel with clearly defined responsibilities to ensure efficient progress and high-quality output.

**Current Status:**
- Days 1-5: ✅ Migrated to Astro
- Day 6: 📋 Ready for migration (content exists in backup)
- Days 7-60: 🚧 Need development
- Infrastructure: ✅ Sidebar navigation fixed, phase pages created
- Components: ✅ BaseLayout, Navigation, 🔄 Breadcrumbs, ProgressBar

## Terminal Overview & Current Progress

### Terminal A - Coordination & Quality Assurance ✅
**Role:** Project Coordinator and Quality Lead  
**Status:** Navigation system completed, sidebar issue fixed, phase pages created

### Terminal B - Migration Specialist 📋
**Role:** Content Migration Expert  
**Status:** Ready to start Day 6 migration

### Terminal C - Content Developer 🚧
**Role:** New Course Content Creator  
**Status:** Ready to start Day 7+ development

## Task Categories and Detailed Allocation

### Terminal A (Current) - Coordination & Quality Assurance
**Role:** Project Coordinator and Quality Lead

**Primary Responsibilities:**
- Overall project coordination and task allocation
- Maintain and update project documentation
- Quality assurance and code review
- Merge pull requests and resolve conflicts
- Update progress tracking and milestones
- Ensure consistency across all course materials
- Manage the Astro configuration and build process

**Current Tasks (Infrastructure & Navigation):**

#### 1. Astro项目初始化与基础配置 ✅
- [x] 创建新的Astro项目
- [x] 配置项目基础结构
- [x] 设置TypeScript支持
- [x] 配置构建和开发脚本

#### 2. 导航系统设计与实现 ✅ [已完成]
- [x] 设计新的侧边栏组件结构
- [x] 实现多级导航组件
- [x] 修复课程页面缺少侧边栏问题
- [x] 创建阶段概览页面解决404错误
- [ ] 创建面包屑导航
- [ ] 实现进度跟踪系统

#### 3. 共享组件开发 ✅ [已完成]
- [x] BaseLayout组件（整体布局）
- [x] Navigation组件（导航栏）
- [x] Breadcrumbs组件（面包屑导航）
- [x] ProgressBar组件（进度条）
- [x] CodeBlock组件（代码展示）

#### 4. 质量保证与协调
- [ ] Review and merge Day 6 migration
- [ ] Review and approve new course content
- [ ] Maintain coding standards
- [ ] Update documentation

**Key Files:**
- `/TASK_ALLOCATION.md` (this file)
- `/src/content/config.ts`
- `/astro.config.mjs`
- `/src/components/` - 组件开发
- `/src/layouts/` - 布局文件
- `/src/lib/` - 工具函数

---

### Terminal B - Migration Specialist
**Role:** Content Migration Expert

**Primary Responsibilities:**
- Migrate Day 6 course content to Astro format
- Migrate all non-course content (exercises, solutions, code examples)
- Ensure proper formatting and structure compliance
- Test migrated content for functionality
- Update internal links and references
- Validate all migrated content against Astro schemas

#### Category 1: Day 6 Migration 🚀 [HIGH PRIORITY]
**Estimated Time:** 1-2 hours

**Tasks:**
- [ ] Read Day 6 content from `/backup-before-astro/60-day-modern-course/phase-1-modern-web/day-06/`
- [ ] Create `/src/content/courses/day-6.md` with proper frontmatter
- [ ] Migrate main lesson content (README.md)
- [ ] Create `/src/content/exercises/day-6.md` for exercise content
- [ ] Create `/src/content/solutions/day-6.md` for solution
- [ ] Migrate code examples to `/src/content/code-examples/`
- [ ] Test all internal links and references
- [ ] Verify content renders correctly in Astro

**Deliverables:**
```
src/content/
├── courses/
│   └── day-6.md
├── exercises/
│   └── day-6.md
├── solutions/
│   └── day-6.md
└── code-examples/
    └── day-6/
        ├── tailwind-basics.md
        ├── component-examples.md
        └── responsive-demo.md
```

#### Category 2: Non-Course Content Migration 📋 [MEDIUM PRIORITY]
**Estimated Time:** 3-4 hours

**Tasks:**
- [ ] Audit all exercise files in backup directory
- [ ] Audit all solution files in backup directory
- [ ] Audit all code example files
- [ ] Migrate warm-up challenges
- [ ] Migrate project templates
- [ ] Migrate evaluation criteria documents
- [ ] Update all file references and links

**Key Directories:**
```
backup-before-astro/60-day-modern-course/
├── projects/
│   ├── portfolio-website/
│   ├── task-manager/
│   ├── blog-api/
│   ├── ecommerce-frontend/
│   └── social-media-app/
└── shared/
    ├── assets/
    ├── components/
    └── utils/
```

**Previous Work (已完成):**
1. ✅ 分析现有内容结构
2. ✅ 设计新的内容组织方案
3. ✅ 创建内容迁移脚本
4. ✅ 建立内容模板
5. ✅ 页面模板设计
6. ✅ 创建全局样式
7. ✅ 设计响应式布局

---

### Terminal C - Content Developer
**Role:** New Course Content Creator

**Primary Responsibilities:**
- Develop new course content (Day 7 onwards)
- Create exercises and solutions for new days
- Develop code examples and demonstrations
- Ensure content aligns with course progression
- Follow established patterns and templates
- Create supplementary learning materials

#### Phase 1 Completion (Days 7-12) 🚧 [STARTING]
**Estimated Time:** 2-3 hours per day

**Content Development Tasks:**
- [ ] Day 7: Advanced Git Workflow (分支、合并、冲突解决)
- [ ] Day 8: Package Management (npm/yarn深入)
- [ ] Day 9: Build Tools (Webpack/Vite基础)
- [ ] Day 10: Web Performance Optimization
- [ ] Day 11: Browser DevTools Mastery
- [ ] Day 12: Phase 1 Capstone Project

**Content Structure per Day:**
1. Main lesson content (README equivalent)
2. Learning objectives and prerequisites
3. 3-5 code examples with explanations
4. Hands-on exercise with clear requirements
5. Complete solution with best practices
6. Additional resources and reading materials
7. Self-assessment questions

**Template Example (Day 7):**
```markdown
---
day: 7
phase: "modern-web"
title: "Advanced Responsive Design"
description: "深入响应式设计的高级技巧与最佳实践"
objectives:
  - "掌握流体排版和响应式图片"
  - "理解容器查询和现代响应式方案"
  - "实现复杂的响应式布局模式"
estimatedTime: 90
difficulty: "intermediate"
prerequisites: [6]
tags: ["css", "responsive", "mobile-first"]
---

## 今日目标
[Content continues...]
```

---

## Timeline and Milestones

### Week 1 (Current Week)
**Day 1-2:**
- Terminal A: Complete Navigation and Breadcrumbs components
- Terminal B: Complete Day 6 migration
- Terminal C: Begin Day 7 development

**Day 3-5:**
- Terminal A: Review and merge Day 6, implement ProgressBar
- Terminal B: Start non-course content migration
- Terminal C: Complete Days 7-8

### Week 2
- Terminal A: Continuous review and coordination
- Terminal B: Complete all migration tasks
- Terminal C: Complete Days 9-12 (Phase 1 completion)

### Ongoing (Week 3+)
- Terminal A: Weekly planning and review sessions
- Terminal B: Support Terminal C with asset creation
- Terminal C: Continue developing 2-3 days per week

### Milestone Tracking
- [ ] **M1**: Day 6 Migration Complete (Day 2)
- [ ] **M2**: Navigation System Complete (Day 3)
- [ ] **M3**: Phase 1 (Days 1-12) Complete (Week 2)
- [ ] **M4**: All Exercise Files Migrated (Week 2)
- [ ] **M5**: Project Templates Migrated (Week 2)
- [ ] **M6**: Phase 2 Start (Week 3)

## Collaboration Rules

### 1. Communication Protocols
**Daily Standup** (via comments in this file):
```markdown
#### [Date: 2025-07-27]
**Terminal A:**
- ✅ Reviewed progress documentation
- 🔄 Working on Navigation component
- ❌ Blocked on: [issue description]

**Terminal B:**
- 📋 Starting Day 6 migration
- 🔄 Reading source content

**Terminal C:**
- 📋 Planning Day 7 content structure
```

### 2. Git Workflow
```bash
# Branch naming convention
feature/day-6-migration        # Terminal B
feature/day-7-development      # Terminal C
fix/navigation-responsive      # Terminal A

# Commit message format
feat: Add Day 6 course content migration
fix: Update broken links in Day 5 exercises
docs: Update task allocation progress
chore: Clean up unused imports
```

### 3. Code Review Process
1. Create pull request with clear description
2. Terminal A reviews within 2-4 hours
3. Address feedback and update
4. Terminal A merges after approval

### 4. File Naming Conventions
```
# Course files
src/content/courses/day-N.md

# Exercise files
src/content/exercises/day-N.md

# Solution files
src/content/solutions/day-N.md

# Code examples
src/content/code-examples/day-N/example-name.md
```

### 5. Content Standards
- Use Chinese for main content
- English for code and technical terms
- Consistent formatting with existing days
- Include all required frontmatter fields
- Test all code examples before committing

## Information and Resources

### Essential Documentation

#### 1. Astro Content Schema Reference
```typescript
// Course schema (from /src/content/config.ts)
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
    estimatedTime: z.number().default(60),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
    prerequisites: z.array(z.number()).optional(),
    tags: z.array(z.string()).optional(),
    resources: z.array(z.object({
      title: z.string(),
      url: z.string(),
      type: z.enum(['article', 'video', 'documentation', 'tool'])
    })).optional()
  })
})
```

#### 2. Migration Checklist Template
- [ ] Read source content thoroughly
- [ ] Create target file with correct frontmatter
- [ ] Migrate content preserving formatting
- [ ] Update all internal links
- [ ] Add Chinese translations where needed
- [ ] Test in development server
- [ ] Verify schema compliance
- [ ] Check responsive design
- [ ] Submit for review

#### 3. Day 6 Content Overview
**Title:** Tailwind CSS入门  
**Topics:** 
- 原子化CSS理念
- Tailwind核心工具类
- 响应式设计方法
- 配置和自定义
- 项目重构实践

### Shared Resources
- **Design Tokens**: Follow `/src/styles/global.css` variables
- **Component Patterns**: Reference existing Day 1-5 implementations
- **Icon Usage**: Consistent emoji indicators (📚 theory, 💻 practice, ✅ solution)
- **Image Assets**: Store in `/public/images/day-N/`

## Progress Tracking

### Daily Progress Dashboard
```markdown
## Migration Progress
- Days 1-5: ✅ Complete
- Day 6: 🔄 In Progress (Terminal B) - 0%
- Non-course content: 📋 Queued

## Development Progress
- Day 7: 📋 Planning (Terminal C)
- Day 8: 🔮 Future
- Days 9-60: 🔮 Future

## Component Status
- BaseLayout: ✅ Complete
- Navigation: ✅ Complete (including sidebar fix)
- Phase Pages: ✅ Complete
- Breadcrumbs: ✅ Complete
- ProgressBar: ✅ Complete
- CodeBlock: ✅ Complete
```

### Quality Checklist
- [ ] Schema validation passes
- [ ] No broken links
- [ ] Responsive design works
- [ ] Code examples tested
- [ ] Chinese content reviewed
- [ ] Build succeeds

## Dependencies and Prerequisites

### Technical Dependencies
1. **Astro Framework**
   - Content Collections API
   - MDX support
   - Dynamic routing

2. **Development Environment**
   - Node.js 18+
   - VS Code with Astro extension
   - Git for version control

3. **Content Dependencies**
   - Day 6 depends on Days 1-5
   - Day 7+ depends on Day 6
   - Exercises align with lessons
   - Solutions match exercises

## Risk Management

### Identified Risks
1. **Content Quality**: Rushing may reduce quality
   - *Mitigation*: Enforce review process
   
2. **Merge Conflicts**: Multiple terminals editing
   - *Mitigation*: Clear file ownership
   
3. **Schema Changes**: Content structure evolution
   - *Mitigation*: Terminal A manages schema

### Contingency Plans
- If blocked: Flag in daily standup
- If behind schedule: Reassign resources
- If technical issues: Document and escalate

## Quick Reference Commands

### Terminal A - Coordination
```bash
# Review PR
git fetch origin
git checkout feature/day-6-migration
npm run dev
npm run build

# Merge approved changes
git checkout main
git merge feature/day-6-migration
git push origin main
```

### Terminal B - Migration
```bash
# Start Day 6 migration
cd /Users/liasiloam/Vibecoding/web-dev-course
code backup-before-astro/60-day-modern-course/phase-1-modern-web/day-06/

# Test migration
npm run dev
# Navigate to http://localhost:4321/course/day-6
```

### Terminal C - Development
```bash
# Create new day
touch src/content/courses/day-7.md
touch src/content/exercises/day-7.md
touch src/content/solutions/day-7.md

# Development server
npm run dev
```

## 沟通机制

### Sync Points
1. **Daily Standup**: 9:00 AM (async via file comments)
2. **Weekly Review**: Friday 4:00 PM
3. **Emergency**: Update with 🚨 flag

### Status Indicators
- ✅ Complete
- 🔄 In Progress
- 📋 Queued/Planned
- ⏸️ Paused
- ❌ Blocked
- 🚨 Urgent Issue

## Progress History

### Terminal A Progress (Last Updated: 2025-07-28 08:15)

**Completed:**
1. ✅ Project initialization and base configuration
   - Created Astro project structure
   - Configured TypeScript, MDX, Sitemap support
   - Set up astro.config.mjs and tsconfig.json
   - Created project directory structure

2. ✅ Navigation system design
   - Created navigation.ts with clear learning paths
   - Designed navigation structure for 5 learning phases
   - Implemented getDayNavigation, getPhaseNavigation utilities
   - Defined breadcrumb navigation logic

3. ✅ Type definitions
   - Created complete TypeScript type definitions (course.ts)
   - Defined DayContent, NavItem, Phase interfaces

4. ✅ BaseLayout component
   - Created responsive layout framework
   - Implemented theme switching (light/dark)
   - Integrated top navigation and sidebar placeholders

5. ✅ Navigation component and sidebar fix
   - Implemented complete Navigation.astro component
   - Fixed sidebar disappearing on course detail pages
   - Created phase overview pages (/course/phase-[phase].astro)
   - Resolved all navigation 404 errors
   - Ensured consistent navigation experience across all pages

6. ✅ Core components development
   - Completed Breadcrumbs.astro component with full navigation support
   - Completed ProgressBar.astro component with phase progress tracking
   - Completed CodeBlock.astro component with syntax highlighting and copy functionality

7. ✅ UI/UX audit and optimization
   - Conducted comprehensive Playwright-based UI/UX audit
   - Fixed P0 issues: sidebar navigation overlap, mobile header overflow
   - Optimized homepage code block readability with syntax highlighting
   - Increased progress indicator touch targets for accessibility

8. ✅ Build error resolution
   - Fixed Vercel build error caused by content collection name mismatch
   - Resolved schema validation errors for day-7 solution file
   - Updated content config to match folder structure (codeExamples)

**Pending:**
- Review and merge Day 6 migration when Terminal B completes
- Implement breadcrumb navigation interaction functionality
- Optimize large screen content width
- Add skip navigation link for accessibility
- Improve screen reader support

---

### Terminal B Progress History (Last Updated: 2025-07-27)

**Completed:**
1. ✅ Content structure analysis
   - Understood 60-day course with 5 phase structure
   - Each day contains: README.md, exercise.md, code/, solution/

2. ✅ Shared interface definitions
   - `/src/types/content.ts` - Content type definitions
   - `/src/types/navigation.ts` - Navigation type definitions
   - `/src/types/index.ts` - Unified exports

3. ✅ Content organization design
   - Configured Astro content collections (`/src/content/config.ts`)
   - Created 5 collections: phases, courses, exercises, solutions, codeExamples
   - Created all phase data files

4. ✅ Page templates
   - Day page template (`/src/pages/course/day-[day].astro`)
   - Exercise page template (`/src/pages/course/day-[day]/exercise.astro`)
   - Solution page template (`/src/pages/course/day-[day]/solution.astro`)

5. ✅ Global styles
   - Complete CSS variable system
   - Responsive design foundation
   - Component styles (buttons, cards, badges)
   - Course page specific styles

6. ✅ Overview page template
   - Course overview page (`/src/pages/course/index.astro`)
   - Learning progress tracking
   - Phase card displays

7. ✅ Responsive layout
   - Mobile-first design
   - Media query breakpoints
   - Flexible grid system

8. ✅ Content migration script
   - Automated migration tool (`/scripts/migrate-content.js`)
   - Frontmatter conversion support
   - Batch processing for all course content

9. ✅ Sample content
   - Day 1-5 course content examples
   - Demonstrated content collection format

**Current Status:** Ready to migrate Day 6

---

### Terminal C Progress (Starting)

**Planning Phase:**
- 📋 Review existing Day 1-6 content
- 📋 Plan Day 7-12 curriculum
- 📋 Design exercise progression

---

## Daily Standup Log

### [Date: 2025-07-27]

**Terminal A:**
- ✅ Fixed sidebar missing on course pages issue
- ✅ Created phase overview pages to fix 404 errors
- ✅ Updated TASK_ALLOCATION.md with comprehensive plan
- 🔄 Ready to work on Breadcrumbs and ProgressBar components
- 📋 Will review Day 6 migration when Terminal B completes

**Terminal B:**
- 📋 Ready to start Day 6 migration
- 📋 Reviewed migration checklist
- 📋 Estimated 1-2 hours for completion

**Terminal C:**
- 📋 Ready to start Day 7 development
- 📋 Will review Day 1-6 content first
- 📋 Planning Phase 1 completion strategy

### [Date: 2025-07-28]

**Terminal A:**
- ✅ Completed all core components (Breadcrumbs, ProgressBar, CodeBlock)
- ✅ Conducted UI/UX audit using Playwright
- ✅ Fixed 4 P0 issues from audit (navigation overlap, mobile overflow, code readability, touch targets)
- ✅ Fixed Vercel build error (content collection name mismatch)
- 📋 Ready to review Day 6 migration when available
- 📋 Will work on remaining UI/UX improvements (P1/P2 issues)

**Terminal B:**
- 🔄 Day 6 migration in progress (Terminal B should check in)

**Terminal C:**
- 🔄 Day 7-8 content development (Terminal C should check in)

---

## Summary

This comprehensive task allocation plan ensures:
1. **Clear Responsibilities**: Each terminal has distinct, non-overlapping tasks
2. **Efficient Workflow**: Parallel work with minimal dependencies
3. **Quality Assurance**: Terminal A reviews all work before merging
4. **Progress Tracking**: Daily standups and milestone tracking
5. **Risk Mitigation**: Contingency plans for common issues

**Next Steps:**
1. Terminal B: Begin Day 6 migration immediately
2. Terminal C: Start planning Day 7 content
3. Terminal A: Continue Navigation component development

**Document Version:** 2.2  
**Last Updated:** 2025-07-28 08:20  
**Next Review:** End of Day 3

**Recent Updates:**
- ✅ Terminal A: Completed all core components (Breadcrumbs, ProgressBar, CodeBlock)
- ✅ Terminal A: Fixed Vercel build error (content collection configuration)
- ✅ Terminal A: Completed UI/UX audit and fixed P0 issues
- 📋 Terminal B & C: Awaiting status updates on migration and development