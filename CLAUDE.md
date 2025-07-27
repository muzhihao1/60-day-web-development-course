# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an educational web development course repository containing structured learning materials. The project consists of:
- A 60-day beginner course (in development)
- A 28-day intensive course (backup/legacy)
- Static HTML/CSS/JavaScript content served via Docsify

## Commands

### Running the Course Viewer
```bash
# Open the course in a browser (no build process required)
open index.html

# Or use a local web server for better development experience
python3 -m http.server 8000
# Then navigate to http://localhost:8000

# Alternative using Node.js
npx serve .
```

### File Organization Commands
```bash
# Search for specific day content
find . -name "day-*.md" -o -name "day*.md"

# Find all README files for course modules
find . -path "*/node_modules" -prune -o -name "README.md" -print

# Search for specific phase content
find phase-* -name "*.md"
```

## Architecture & Structure

### Course Organization
The course is organized into two main structures:

1. **60-Day Course** (root level)
   - `/phase-1-foundations/` - Days 1-15: Web basics, no coding
   - `/phase-2-html/` - Days 16-25: HTML fundamentals
   - `/phase-3-css/` - Days 26-40: CSS styling
   - `/phase-4-javascript/` - Days 41-55: JavaScript programming
   - `/phase-5-integration/` - Days 56-60: Full projects

2. **28-Day Course** (`/28-day-course-backup/`)
   - `/week1/` - HTML/CSS advanced (Days 1-7)
   - `/week2/` - JavaScript deep dive (Days 8-14)
   - `/week3/` - Backend development (Days 15-21)
   - `/week4/` - Full stack integration (Days 22-28)

### Content Structure
Each day typically contains:
- `README.md` - Main lesson content
- `index.html` - Exercise starter file
- `solution.html` - Complete solution
- `warm-up.html` - Quick practice exercise
- Supporting assets (CSS, JS files)

### Documentation System
- Uses Docsify for course viewer (configured in index.html)
- `/_sidebar.md` - Navigation structure
- `/course-overview.md` - Main course introduction
- No build process - pure static files

### Key Integration Points
- **Docsify Configuration**: Modified via `window.$docsify` in index.html
- **Navigation**: Controlled by _sidebar.md
- **Styling**: Custom CSS embedded in index.html
- **Search**: Enabled via Docsify search plugin

### Development Patterns
- Educational content uses progressive disclosure
- Each lesson builds on previous concepts
- Solutions provided for self-checking
- No automated testing framework
- Manual verification approach for exercises