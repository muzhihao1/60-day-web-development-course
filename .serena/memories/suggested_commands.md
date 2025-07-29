# Suggested Commands for Web Development Course

## Development Commands
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

## Content Management
```bash
# Find specific day content
find src/content -name "day-*.md" -o -name "day-*.mdx"

# Search for phase-specific content
find src/content/courses -name "*.md" | grep "day-"

# Check TypeScript types
npx astro check
```

## Git Commands (Darwin/macOS)
```bash
# Check status
git status

# Stage changes
git add .

# Commit changes
git commit -m "message"

# View recent commits
git log --oneline -10

# Check differences
git diff
```

## System Commands (Darwin/macOS)
```bash
# List files
ls -la

# Change directory
cd path/to/directory

# Find files
find . -name "*.ts"

# Search in files (macOS)
grep -r "pattern" .

# Open in VS Code
code .
```