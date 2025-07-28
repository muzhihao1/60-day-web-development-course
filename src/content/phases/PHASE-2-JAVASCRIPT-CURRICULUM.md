# Phase 2 Curriculum Plan: JavaScript Mastery (Days 13-24)

## 📋 Phase 2 Overview

**Phase Name**: JavaScript与编程思维 - Modern JavaScript for Web Development
**Duration**: 12 days (Days 13-24)
**Prerequisites**: Completion of Phase 1 (Git, HTML/CSS basics, Tailwind, npm, DevTools)
**Goal**: Master modern JavaScript fundamentals and prepare students for real-world web development

## 🎯 Phase 2 Learning Outcomes

By the end of Phase 2, students will be able to:
1. Write modern ES2022+ JavaScript with confidence
2. Apply functional programming concepts in practical scenarios
3. Handle asynchronous operations professionally
4. Manipulate the DOM and handle events effectively
5. Work with browser APIs and local storage
6. Make API calls and process data
7. Write basic unit tests for their code
8. Use development tools for code quality
9. Build a complete interactive web application

## 📅 Detailed Daily Curriculum

### Day 13: JavaScript基础与ES6+语法
**Learning Objectives**:
- Understand JavaScript's role in modern web development
- Master ES6+ syntax features
- Write clean, modern JavaScript code
- Use const/let appropriately
- Apply destructuring and spread operators

**Topics**:
1. JavaScript Fundamentals Review
   - Variables and scoping (const, let vs var)
   - Data types and type coercion
   - Operators and expressions
   - Control flow structures

2. ES6+ Core Features
   - Arrow functions and lexical this
   - Template literals and string methods
   - Destructuring arrays and objects
   - Spread and rest operators
   - Default parameters

3. Modern JavaScript Patterns
   - Object shorthand and computed properties
   - Optional chaining (?.)
   - Nullish coalescing (??)
   - Logical assignment operators
   - Import/Export basics

**Practical Exercise**: 
Refactor a legacy JavaScript codebase to use modern ES6+ features, focusing on readability and best practices.

**Connection**: Foundation for all subsequent JavaScript learning, especially functional programming on Day 14.

---

### Day 14: 函数式编程基础
**Learning Objectives**:
- Understand functional programming principles
- Master array methods (map, filter, reduce)
- Write pure functions
- Implement function composition
- Avoid mutation and side effects

**Topics**:
1. Functional Programming Concepts
   - Pure functions and immutability
   - First-class functions
   - Higher-order functions
   - Function composition
   - Avoiding side effects

2. Array Methods Mastery
   - map() for transformation
   - filter() for selection
   - reduce() for aggregation
   - find(), some(), every()
   - Chaining methods effectively

3. Practical Functional Patterns
   - Currying and partial application
   - Memoization basics
   - Functional utilities
   - Immutable data updates
   - Error handling in FP

**Practical Exercise**: 
Build a data processing pipeline that transforms, filters, and aggregates a dataset using only functional programming techniques.

**Connection**: Builds on Day 13's syntax, prepares for async handling which often uses FP concepts.

---

### Day 15: 异步编程精通：Promise与async/await
**Learning Objectives**:
- Master asynchronous JavaScript patterns
- Handle Promises effectively
- Use async/await for cleaner code
- Implement error handling strategies
- Manage concurrent operations

**Topics**:
1. Asynchronous JavaScript Evolution
   - Callbacks and callback hell
   - Promise fundamentals
   - Promise chaining and composition
   - Error propagation
   - Promise.all(), Promise.race(), Promise.allSettled()

2. Async/Await Mastery
   - async function syntax
   - await expressions
   - Error handling with try/catch
   - Parallel vs sequential execution
   - Top-level await

3. Advanced Async Patterns
   - Async iteration (for await...of)
   - Debouncing and throttling
   - Race conditions and solutions
   - AbortController for cancellation
   - Async queue implementation

**Practical Exercise**: 
Create an image gallery that loads images asynchronously, handles errors gracefully, and implements loading states and cancellation.

**Connection**: Essential for Day 16's DOM manipulation (event handling) and Day 18's API calls.

---

### Day 16: DOM操作与事件处理
**Learning Objectives**:
- Navigate and manipulate the DOM efficiently
- Handle events with modern patterns
- Implement event delegation
- Create interactive UI components
- Understand performance implications

**Topics**:
1. Modern DOM Manipulation
   - querySelector and querySelectorAll
   - Element creation and modification
   - Class and attribute manipulation
   - Dataset and data attributes
   - DOM traversal methods

2. Event Handling Mastery
   - addEventListener options
   - Event bubbling and capturing
   - Event delegation patterns
   - Custom events
   - Touch and pointer events

3. Interactive Patterns
   - Form handling and validation
   - Drag and drop implementation
   - Keyboard navigation
   - Intersection Observer
   - Mutation Observer basics

**Practical Exercise**: 
Build an interactive todo list with drag-and-drop reordering, keyboard shortcuts, and local storage persistence.

**Connection**: Applies async knowledge from Day 15, prepares for browser APIs on Day 17.

---

### Day 17: 浏览器API与本地存储
**Learning Objectives**:
- Work with Web Storage APIs effectively
- Use modern browser APIs
- Implement client-side data persistence
- Handle browser compatibility
- Build offline-capable features

**Topics**:
1. Storage APIs
   - localStorage advanced patterns
   - sessionStorage use cases
   - IndexedDB fundamentals
   - Cookie handling
   - Storage quota and limits

2. Modern Browser APIs
   - Geolocation API
   - Notification API
   - Clipboard API
   - Web Share API
   - File API basics

3. Performance & State Management
   - Caching strategies
   - State synchronization
   - Cross-tab communication
   - Service Worker basics
   - Background sync introduction

**Practical Exercise**: 
Create a note-taking app with offline support, file attachments, and cross-tab synchronization.

**Connection**: Builds on Day 16's DOM knowledge, essential for Day 18's data fetching and caching.

---

### Day 18: API调用与数据处理
**Learning Objectives**:
- Make HTTP requests with Fetch API
- Handle API responses and errors
- Process and transform data
- Implement loading and error states
- Work with different data formats

**Topics**:
1. Fetch API Mastery
   - GET, POST, PUT, DELETE requests
   - Headers and authentication
   - Request/Response objects
   - Handling different content types
   - CORS and security

2. Data Processing
   - JSON parsing and stringification
   - Working with FormData
   - Stream processing basics
   - Data validation
   - Error response handling

3. Real-world Patterns
   - API wrapper functions
   - Retry logic implementation
   - Caching strategies
   - Pagination handling
   - Rate limiting awareness

**Practical Exercise**: 
Build a weather dashboard that fetches data from multiple APIs, implements caching, and handles errors gracefully.

**Connection**: Combines all previous knowledge, prepares for TypeScript's type safety on Day 19.

---

### Day 19: TypeScript入门：类型安全的JavaScript
**Learning Objectives**:
- Understand TypeScript benefits
- Set up TypeScript environment
- Use basic type annotations
- Define interfaces and types
- Convert JavaScript to TypeScript

**Topics**:
1. TypeScript Fundamentals
   - Installation and configuration
   - Basic types and annotations
   - Type inference
   - Union and intersection types
   - Type aliases vs interfaces

2. Working with Types
   - Object types and interfaces
   - Array and tuple types
   - Function types
   - Optional and readonly properties
   - Type assertions

3. TypeScript in Practice
   - tsconfig.json configuration
   - Strict mode benefits
   - Common compiler options
   - JavaScript interoperability
   - Third-party type definitions

**Practical Exercise**: 
Convert a JavaScript project to TypeScript, adding appropriate types and fixing type errors.

**Connection**: Introduces type safety concepts used extensively in Day 20's advanced features.

---

### Day 20: TypeScript进阶：高级类型与模式
**Learning Objectives**:
- Master advanced TypeScript features
- Use generics effectively
- Implement type guards
- Apply utility types
- Write type-safe code

**Topics**:
1. Advanced Type Features
   - Generic types and functions
   - Conditional types
   - Mapped types
   - Template literal types
   - Type guards and narrowing

2. Utility Types and Patterns
   - Partial, Required, Readonly
   - Pick, Omit, Record
   - ReturnType, Parameters
   - Custom utility types
   - Discriminated unions

3. Real-world TypeScript
   - API response typing
   - React component types (preview)
   - Error handling patterns
   - Module augmentation
   - Declaration files

**Practical Exercise**: 
Build a type-safe API client with full IntelliSense support and runtime validation.

**Connection**: Reinforces type thinking essential for testing on Day 21.

---

### Day 21: 单元测试入门：Jest/Vitest基础
**Learning Objectives**:
- Understand testing fundamentals
- Write basic unit tests
- Use Jest or Vitest effectively
- Mock dependencies
- Achieve good test coverage

**Topics**:
1. Testing Fundamentals
   - Why testing matters
   - Test types (unit, integration, e2e)
   - Test structure (AAA pattern)
   - Jest/Vitest setup
   - Running and debugging tests

2. Writing Effective Tests
   - describe and it blocks
   - Assertions and matchers
   - Setup and teardown
   - Testing async code
   - Snapshot testing basics

3. Mocking and Coverage
   - Mock functions
   - Module mocking
   - Testing DOM manipulation
   - Code coverage metrics
   - Testing best practices

**Practical Exercise**: 
Write comprehensive tests for a utility library, achieving 90%+ code coverage.

**Connection**: Prepares for TDD approach on Day 22.

---

### Day 22: 测试驱动开发(TDD)实践
**Learning Objectives**:
- Apply TDD methodology
- Write tests before code
- Refactor with confidence
- Build testable code
- Implement continuous testing

**Topics**:
1. TDD Fundamentals
   - Red-Green-Refactor cycle
   - Writing failing tests first
   - Minimal implementation
   - Refactoring safely
   - TDD benefits and challenges

2. Practical TDD
   - Feature development with TDD
   - Testing user interactions
   - Testing edge cases
   - Regression prevention
   - Test documentation

3. Advanced Testing Patterns
   - Testing React components (preview)
   - Integration test strategies
   - E2E testing introduction
   - Continuous integration basics
   - Test automation

**Practical Exercise**: 
Develop a calculator app using strict TDD methodology from start to finish.

**Connection**: Reinforces testing discipline needed for quality assurance on Day 23.

---

### Day 23: 代码质量工具：ESLint、Prettier与工程化
**Learning Objectives**:
- Configure code quality tools
- Enforce consistent code style
- Set up pre-commit hooks
- Automate code formatting
- Implement best practices

**Topics**:
1. ESLint Configuration
   - Installation and setup
   - Rule configuration
   - Extending configurations
   - Custom rules
   - Auto-fixing issues

2. Prettier and Formatting
   - Prettier setup
   - Integration with ESLint
   - Format on save
   - Team consistency
   - EditorConfig

3. Development Workflow
   - Git hooks with Husky
   - lint-staged for efficiency
   - Commit message standards
   - CI/CD integration basics
   - Documentation generation

**Practical Exercise**: 
Set up a complete development environment with automated linting, formatting, and pre-commit validation.

**Connection**: Ensures code quality for the final project on Day 24.

---

### Day 24: Phase综合项目：任务管理应用
**Learning Objectives**:
- Apply all learned concepts
- Build a complete application
- Implement best practices
- Deploy the application
- Document the project

**Project Requirements**:
1. **Application Features**:
   - User authentication (localStorage)
   - Task CRUD operations
   - Categories and tags
   - Due dates and reminders
   - Search and filtering
   - Drag-and-drop organization
   - Data persistence
   - Responsive design

2. **Technical Requirements**:
   - Modern ES2022+ JavaScript
   - TypeScript for type safety
   - Functional programming patterns
   - Async/await for all async operations
   - Comprehensive error handling
   - 80%+ test coverage
   - ESLint and Prettier configured
   - Performance optimized

3. **Code Quality Standards**:
   - Clean, documented code
   - Consistent naming conventions
   - SOLID principles applied
   - No console errors
   - Accessibility compliance
   - Cross-browser support

**Deliverables**:
- Source code on GitHub
- Live deployment
- README with setup instructions
- Test suite passing
- Code quality report

**Connection**: Demonstrates readiness for React development in Phase 3.

---

## 🔄 Phase Progression Logic

### Week 1 (Days 13-18): Core JavaScript Mastery
- Modern syntax and features (Day 13)
- Functional programming (Day 14)
- Asynchronous patterns (Day 15)
- DOM and events (Day 16)
- Browser APIs (Day 17)
- API integration (Day 18)

### Week 2 (Days 19-24): Professional Development
- TypeScript basics (Day 19)
- TypeScript advanced (Day 20)
- Testing fundamentals (Day 21)
- TDD practice (Day 22)
- Code quality tools (Day 23)
- Capstone project (Day 24)

## 🎓 Assessment Criteria

### Daily Exercises (40%)
- Code functionality
- Modern syntax usage
- Error handling
- Code organization
- Best practices

### Projects (60%)
- Mini-projects (Days 16, 18, 22): 30%
- Final project (Day 24): 30%

### Key Performance Indicators
- All tests passing
- No ESLint errors
- 80%+ code coverage
- Clean code principles
- Performance metrics

## 🔗 Phase 3 Preparation

This Phase prepares students for React by:
1. **Component Thinking**: Through functional programming and pure functions
2. **State Management**: Via closure and module patterns
3. **Type Safety**: Through TypeScript mastery
4. **Testing Culture**: With Jest/Vitest experience
5. **Modern Tooling**: Via build tools and quality assurance
6. **Async Handling**: Essential for React data fetching

## 📚 Resources

### JavaScript
- [JavaScript.info](https://javascript.info/)
- [MDN Web Docs](https://developer.mozilla.org/)
- [You Don't Know JS](https://github.com/getify/You-Dont-Know-JS)

### TypeScript
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)

### Testing
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Library](https://testing-library.com/)

### Tools
- [ESLint Rules](https://eslint.org/docs/rules/)
- [Prettier Options](https://prettier.io/docs/en/options.html)

## 🚀 Success Metrics

Students completing Phase 2 should be able to:
- ✅ Write production-ready JavaScript
- ✅ Handle async operations confidently
- ✅ Manipulate DOM efficiently
- ✅ Work with APIs professionally
- ✅ Use TypeScript effectively
- ✅ Write and run tests
- ✅ Maintain code quality
- ✅ Build complete web applications
- ✅ Ready for React framework

This curriculum provides a solid JavaScript foundation while building the skills needed for modern web development!