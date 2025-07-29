# Code Style and Conventions

## TypeScript Configuration
- Strict mode enabled
- Path aliases configured:
  - `@components/*` → `src/components/*`
  - `@layouts/*` → `src/layouts/*`
  - `@lib/*` → `src/lib/*`
  - `@types/*` → `src/types/*`
  - `@content/*` → `src/content/*`

## File Organization
- Components: `.astro` format in `src/components/`
- Layouts: Page layouts in `src/layouts/`
- Pages: File-based routing in `src/pages/`
- Content: MDX files in `src/content/` organized by type
- Utilities: Helper functions in `src/lib/`
- Types: TypeScript definitions in `src/types/`

## Content Schema Requirements

### Courses Collection
Required: day, phase, title, description, objectives, difficulty
Optional: prerequisites, tags, resources, codeExamples

### Phases
- "modern-web" (Phase 1)
- "javascript-mastery" (Phase 2)
- "react-development" (Phase 3)
- "backend-development" (Phase 4)
- "fullstack-deployment" (Phase 5)

### Difficulty Levels
- "beginner"
- "intermediate"
- "advanced"

## Naming Conventions
- File names: kebab-case (e.g., `day-1.md`, `course-card.astro`)
- Component names: PascalCase (e.g., `CourseCard.astro`)
- CSS variables: kebab-case with `--` prefix
- TypeScript interfaces: PascalCase with `I` prefix or descriptive names

## Best Practices
- Use CSS variables for theming consistency
- Follow mobile-first responsive design
- Implement proper TypeScript types for all data
- Use Astro's built-in image optimization for assets
- Content files use MDX format for component integration