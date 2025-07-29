# Task Completion Checklist

## When a Task is Completed

### 1. Type Checking
```bash
# Run TypeScript type checking
npx astro check
```

### 2. Build Verification
```bash
# Build the project to ensure no build errors
npm run build:check
```

### 3. Local Testing
```bash
# Test in development mode
npm run dev
# Then manually verify the changes in browser at http://localhost:4321
```

### 4. Git Status Check
```bash
# Check what files have been modified
git status

# Review changes
git diff
```

### 5. Content Validation
- Ensure all required fields are present in content files
- Verify content follows the schema definitions in `src/content/config.ts`
- Check that phase names match exactly: "modern-web", "javascript-mastery", "react-development", "backend-development", "fullstack-deployment"
- Verify difficulty levels are one of: "beginner", "intermediate", "advanced"

### 6. Common Issues to Check
- MDX syntax is valid (no unclosed tags)
- All imports are properly resolved
- TypeScript types are correctly defined
- No console errors in browser
- Responsive design works on mobile viewport
- Theme switching functionality preserved

## Important Notes
- No automated test suite or linter is configured
- Manual verification is required for all changes
- The project uses Astro's built-in type checking via `astro check`
- Always verify changes don't break existing functionality