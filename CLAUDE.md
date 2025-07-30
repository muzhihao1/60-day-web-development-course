# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a modern web development course built with Astro 5.12.3. The project provides a 60-day structured learning path covering web development from fundamentals to full-stack deployment. It features a responsive, performant learning platform with progress tracking and theme switching.

## Commands

### Development & Build Commands
```bash
# Install dependencies
npm install

# Run development server (port 4321)
npm run dev

# Build for production
npm run build

# Build with type checking
npm run build:check

# Preview production build locally
npm run preview

# Run content migration script
npm run migrate
```

### Content Management Commands
```bash
# Find specific day content
find src/content -name "day-*.md" -o -name "day-*.mdx"

# Search for phase-specific content
find src/content/courses -name "*.md" | grep "day-"

# Check TypeScript types
npx astro check

```

## Architecture & Structure

### Technology Stack
- **Framework**: Astro 5.12.3 with SSG (Static Site Generation)
- **Language**: TypeScript with strict mode
- **Content**: MDX for rich content with components
- **Styling**: CSS Variables with responsive design system
- **Deployment**: Vercel (https://60-day-web-course.vercel.app)

### Project Structure
```
/
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── CourseCard.astro
│   │   ├── CourseNavigation.astro
│   │   ├── PhaseOverview.astro
│   │   └── ProgressTracker.astro
│   ├── layouts/           # Page layouts
│   │   ├── BaseLayout.astro
│   │   └── CourseLayout.astro
│   ├── pages/             # File-based routing
│   │   ├── index.astro
│   │   └── course/
│   │       ├── day-[day].astro          # Dynamic day pages
│   │       ├── day-[day]/exercise.astro  # Exercise pages
│   │       ├── day-[day]/solution.astro  # Solution pages
│   │       └── phase-[phase].astro      # Phase overview pages
│   ├── content/           # Content collections
│   │   ├── config.ts      # Collection schemas
│   │   ├── courses/       # Daily lesson content
│   │   ├── exercises/     # Exercise definitions
│   │   ├── solutions/     # Exercise solutions
│   │   ├── codeExamples/  # Code snippets
│   │   └── phases/        # Phase metadata
│   ├── lib/              # Utility functions
│   │   ├── progress.ts    # Progress tracking
│   │   └── utils.ts       # General utilities
│   └── types/            # TypeScript type definitions
├── public/               # Static assets
├── scripts/              # Build/migration scripts
└── astro.config.mjs      # Astro configuration
```

### Content Collections Schema

The project uses Astro's content collections with strict TypeScript schemas:

1. **courses**: Daily lesson content
   - Required: day, phase, title, description, objectives, difficulty
   - Optional: prerequisites, tags, resources, codeExamples

2. **exercises**: Practice exercises
   - Required: day, title, description, difficulty, requirements
   - Optional: hints, checkpoints, starterCode

3. **solutions**: Exercise solutions
   - Required: day, exerciseTitle, approach, files, keyTakeaways
   - Optional: commonMistakes, extensions

4. **phases**: Course phase metadata
   - Required: number, name, description, startDay, endDay, objectives

### Course Structure

The 60-day course is divided into 5 phases:

1. **Modern Web Foundations** (Days 1-12)
   - Git version control, HTML5/CSS3, responsive design

2. **JavaScript Mastery** (Days 13-24)
   - ES6+ syntax, async programming, DOM manipulation

3. **React Development** (Days 25-40)
   - Component architecture, state management, performance

4. **Backend Development** (Days 41-52)
   - Node.js, databases, API development

5. **Full-Stack Deployment** (Days 53-60)
   - Docker, CI/CD, cloud deployment

### Key Features & Implementation

- **Progress Tracking**: LocalStorage-based progress saved per user
- **Theme Switching**: CSS variables for light/dark mode
- **Responsive Design**: Mobile-first approach with breakpoints
- **Code Highlighting**: Shiki with GitHub Dark theme
- **Dynamic Routing**: File-based routing with dynamic segments
- **Type Safety**: Full TypeScript coverage with strict mode

### Path Aliases

TypeScript path aliases configured for cleaner imports:
- `@components/*` → `src/components/*`
- `@layouts/*` → `src/layouts/*`
- `@lib/*` → `src/lib/*`
- `@types/*` → `src/types/*`
- `@content/*` → `src/content/*`

### Development Guidelines

- Content files use MDX format for component integration
- All new components should be in `.astro` format
- Use CSS variables for theming consistency
- Follow mobile-first responsive design
- Implement proper TypeScript types for all data
- Use Astro's built-in image optimization for assets

### MCP Serena Tools

When working with this codebase using MCP Serena tools:
```bash
# Initialize Serena for the project
/mcp__serena__initial_instructions
```