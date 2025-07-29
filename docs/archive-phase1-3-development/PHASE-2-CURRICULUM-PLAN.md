# Phase 2 Curriculum Plan: HTML深入 (Days 13-25)

## 📋 Phase 2 Overview

**Phase Name**: HTML Mastery - 深入掌握现代Web标记语言
**Duration**: 13 days (Days 13-25)
**Prerequisites**: Completion of Phase 1 (Git, HTML/CSS basics, Tailwind, npm, DevTools)
**Goal**: Master advanced HTML features and prepare students for JavaScript in Phase 3

## 🎯 Phase 2 Learning Outcomes

By the end of Phase 2, students will be able to:
1. Build fully semantic and accessible web applications
2. Create complex forms with advanced validation
3. Work with multimedia content professionally
4. Create data visualizations with Canvas and SVG
5. Understand Web Components fundamentals
6. Implement offline functionality and PWA basics
7. Use HTML5 APIs effectively
8. Optimize media for responsive designs

## 📅 Detailed Daily Curriculum

### Day 13: HTML语义化深入：构建可访问的Web ✅
**Status**: Already Created
**Focus**: Deep dive into semantic HTML and accessibility
**Topics**:
- HTML5 semantic elements mastery
- ARIA attributes and roles
- WCAG compliance
- Structured data and SEO
- Accessibility testing tools

**Key Takeaway**: Foundation for building inclusive web experiences

---

### Day 14: 表单进阶：HTML5输入类型与验证
**Learning Objectives**:
- Master all HTML5 input types
- Implement client-side validation
- Create custom validation messages
- Build accessible form layouts
- Handle form data effectively

**Topics**:
1. HTML5 Input Types Deep Dive
   - date, time, datetime-local
   - range, color, file
   - tel, url, email enhancements
   - search and datalist

2. Constraint Validation API
   - Built-in validation attributes
   - Custom validation with setCustomValidity()
   - Validation styling with CSS pseudo-classes
   - Real-time validation feedback

3. Form Design Patterns
   - Multi-step forms
   - Progressive disclosure
   - Inline validation
   - Error summary patterns

**Practical Exercise**: 
Build a comprehensive user registration form with real-time validation, custom error messages, and accessibility features.

**Connection**: Builds on Day 13's accessibility concepts, prepares for Day 15's advanced form features.

---

### Day 15: 表单高级特性：自定义控件与数据处理
**Learning Objectives**:
- Create custom form controls
- Handle file uploads effectively
- Implement form data serialization
- Build autocomplete functionality
- Master FormData API

**Topics**:
1. Custom Form Controls
   - Custom checkboxes/radio buttons
   - Toggle switches
   - Star ratings
   - Tag inputs

2. File Handling
   - Multiple file uploads
   - Drag-and-drop interfaces
   - File preview functionality
   - Progress indicators

3. FormData API
   - Serializing form data
   - AJAX form submission
   - Handling binary data
   - Working with multipart forms

**Practical Exercise**: 
Create a job application form with file upload, custom controls, and AJAX submission.

**Connection**: Extends Day 14's form knowledge, introduces concepts useful for Day 16's multimedia handling.

---

### Day 16: 多媒体基础：音频、视频与字幕
**Learning Objectives**:
- Embed and control media elements
- Create custom media players
- Implement closed captions
- Optimize media delivery
- Handle media events

**Topics**:
1. HTML5 Media Elements
   - `<video>` and `<audio>` attributes
   - Source elements and formats
   - Poster images and preloading
   - Track elements for captions

2. Media JavaScript API
   - Play, pause, seek controls
   - Volume and playback rate
   - Full-screen API
   - Media events handling

3. Accessibility Features
   - WebVTT subtitles
   - Audio descriptions
   - Keyboard controls
   - Screen reader compatibility

**Practical Exercise**: 
Build a custom video player with subtitles, custom controls, and keyboard navigation.

**Connection**: Introduces media concepts that will be enhanced in Day 17's responsive media topic.

---

### Day 17: 响应式媒体：图片优化与适配
**Learning Objectives**:
- Implement responsive images
- Optimize image loading
- Use modern image formats
- Create image galleries
- Implement lazy loading

**Topics**:
1. Responsive Images
   - srcset and sizes attributes
   - `<picture>` element
   - Art direction
   - Resolution switching

2. Image Optimization
   - WebP and AVIF formats
   - Image compression strategies
   - Loading strategies
   - Intersection Observer for lazy loading

3. Advanced Techniques
   - CSS aspect-ratio
   - Object-fit and object-position
   - Image filters and effects
   - Performance monitoring

**Practical Exercise**: 
Create a responsive image gallery with lazy loading, multiple formats, and optimal performance.

**Connection**: Builds on Day 16's media foundation, prepares for Day 18's visual programming.

---

### Day 18: Canvas基础：2D图形编程
**Learning Objectives**:
- Understand Canvas API basics
- Draw shapes and paths
- Work with colors and gradients
- Implement animations
- Handle user interactions

**Topics**:
1. Canvas Fundamentals
   - Context and coordinates
   - Basic shapes (rect, arc, path)
   - Stroke and fill styles
   - Transformations

2. Drawing Techniques
   - Complex paths
   - Gradients and patterns
   - Text rendering
   - Image manipulation

3. Animation Basics
   - requestAnimationFrame
   - Sprite animation
   - Particle systems
   - Basic physics

**Practical Exercise**: 
Create an interactive drawing application with tools, colors, and export functionality.

**Connection**: Introduces programmatic drawing, complemented by Day 19's SVG approach.

---

### Day 19: SVG深入：可缩放矢量图形
**Learning Objectives**:
- Master SVG syntax and structure
- Create complex graphics
- Implement SVG animations
- Build interactive visualizations
- Optimize SVG performance

**Topics**:
1. SVG Fundamentals
   - Viewport and viewBox
   - Basic shapes and paths
   - Groups and reusability
   - Styling with CSS

2. Advanced SVG
   - Path commands mastery
   - Filters and effects
   - Masks and clipping
   - Gradients and patterns

3. SVG Animation
   - SMIL animations
   - CSS animations for SVG
   - JavaScript manipulation
   - Interactive graphics

**Practical Exercise**: 
Build an interactive data visualization dashboard with animated charts.

**Connection**: Complements Day 18's Canvas knowledge, both prepare for Day 20's visualization project.

---

### Day 20: 项目实战：数据可视化仪表板
**Learning Objectives**:
- Combine Canvas and SVG effectively
- Create real-world visualizations
- Implement interactive features
- Optimize performance
- Handle real data

**Topics**:
1. Project Planning
   - Choosing Canvas vs SVG
   - Data structure design
   - Performance considerations
   - Accessibility planning

2. Implementation
   - Chart components
   - Interactive legends
   - Tooltips and overlays
   - Responsive design

3. Polish and Optimization
   - Animation refinement
   - Performance profiling
   - Cross-browser testing
   - Documentation

**Practical Exercise**: 
Complete a full data visualization dashboard combining multiple chart types with real-time updates.

**Connection**: Synthesizes Days 18-19 learning, introduces component thinking for Day 21.

---

### Day 21: Web Components入门：创建可复用组件
**Learning Objectives**:
- Understand Web Components APIs
- Create custom elements
- Work with Shadow DOM
- Use HTML templates
- Build reusable components

**Topics**:
1. Custom Elements
   - Define custom elements
   - Lifecycle callbacks
   - Extending built-in elements
   - Best practices

2. Shadow DOM
   - Encapsulation benefits
   - Shadow root creation
   - Styling shadow DOM
   - Slot elements

3. Templates and Slots
   - HTML templates
   - Named slots
   - Slot fallback content
   - Dynamic content

**Practical Exercise**: 
Create a component library with card, modal, and tooltip components.

**Connection**: Introduces component architecture, useful for Day 22's practical applications.

---

### Day 22: HTML5 APIs：本地存储与地理定位
**Learning Objectives**:
- Master Web Storage APIs
- Implement geolocation features
- Use other browser APIs
- Handle API permissions
- Build location-aware features

**Topics**:
1. Storage APIs
   - localStorage vs sessionStorage
   - Storage events
   - IndexedDB basics
   - Cache API introduction

2. Geolocation API
   - Getting user location
   - Watching position changes
   - Handling errors
   - Privacy considerations

3. Other HTML5 APIs
   - Notification API
   - Clipboard API
   - Share API
   - Battery API

**Practical Exercise**: 
Build a location-based note-taking app with offline storage.

**Connection**: Introduces offline concepts expanded in Day 23's PWA content.

---

### Day 23: 离线应用与PWA基础
**Learning Objectives**:
- Understand PWA principles
- Implement service workers
- Create app manifests
- Handle offline functionality
- Build installable web apps

**Topics**:
1. PWA Fundamentals
   - Progressive enhancement
   - App manifest configuration
   - Install prompts
   - App icons and splash screens

2. Service Workers
   - Registration and lifecycle
   - Caching strategies
   - Offline fallbacks
   - Background sync basics

3. Performance & UX
   - App shell architecture
   - Offline UI patterns
   - Update notifications
   - Testing offline functionality

**Practical Exercise**: 
Convert a web application into a fully functional PWA with offline support.

**Connection**: Builds on Day 22's storage concepts, prepares for Day 24's performance focus.

---

### Day 24: 性能优化：资源加载与渲染优化
**Learning Objectives**:
- Optimize resource loading
- Implement performance best practices
- Use Performance APIs
- Minimize render blocking
- Achieve optimal Core Web Vitals

**Topics**:
1. Resource Loading
   - Preload, prefetch, preconnect
   - Resource hints
   - Critical CSS
   - JavaScript loading strategies

2. Rendering Performance
   - Layout thrashing
   - Composite layers
   - Will-change property
   - Animation optimization

3. Measurement & Monitoring
   - Performance Observer API
   - User Timing API
   - Real User Monitoring
   - Performance budgets

**Practical Exercise**: 
Optimize a media-heavy website to achieve 95+ Lighthouse scores.

**Connection**: Applies optimization to all previous topics, prepares for final project.

---

### Day 25: Phase 2 综合项目：现代Web应用
**Learning Objectives**:
- Synthesize all Phase 2 knowledge
- Build a complete application
- Implement best practices
- Deploy a production app
- Document the project

**Project Requirements**:
1. **Application Type**: Interactive Media Portfolio
   - Semantic HTML structure
   - Advanced forms for contact
   - Media gallery with video/audio
   - Canvas/SVG visualizations
   - Custom web components
   - Offline functionality
   - Responsive design

2. **Technical Requirements**:
   - 95+ Lighthouse score
   - WCAG AA compliance
   - PWA features
   - Custom components
   - Data visualization
   - Offline support

3. **Deliverables**:
   - Source code with Git history
   - Live deployment
   - Documentation
   - Performance report
   - Accessibility audit

**Connection**: Demonstrates readiness for Phase 3 JavaScript learning.

---

## 🔄 Phase Progression Logic

### Week 1 (Days 13-17): Foundation Enhancement
- Semantic HTML mastery (Day 13)
- Form expertise (Days 14-15)
- Media handling (Days 16-17)

### Week 2 (Days 18-22): Visual & Component Programming
- Graphics programming (Days 18-19)
- Visualization project (Day 20)
- Component architecture (Day 21)
- Browser APIs (Day 22)

### Week 3 (Days 23-25): Modern Web Apps
- Offline capabilities (Day 23)
- Performance mastery (Day 24)
- Capstone project (Day 25)

## 🎓 Assessment Criteria

### Daily Exercises (40%)
- Code quality and organization
- Feature completeness
- Accessibility compliance
- Performance metrics

### Projects (60%)
- Day 20: Data Visualization (25%)
- Day 25: Capstone Project (35%)

### Key Performance Indicators
- HTML validation passing
- WCAG AA compliance
- Lighthouse scores > 90
- Cross-browser compatibility
- Mobile responsiveness

## 🔗 Phase 3 Preparation

Phase 2 prepares students for JavaScript by:
1. **DOM Understanding**: Through semantic HTML and accessibility
2. **Event Concepts**: Via form handling and media controls
3. **API Familiarity**: Through HTML5 APIs and Canvas/SVG
4. **Component Thinking**: Via Web Components
5. **Performance Awareness**: Through optimization practices
6. **Modern Development**: Via PWA concepts

## 📚 Resources by Topic

### Accessibility
- [WebAIM Resources](https://webaim.org/resources/)
- [A11y Project](https://www.a11yproject.com/)
- [ARIA Authoring Practices](https://www.w3.org/TR/wai-aria-practices-1.1/)

### Forms
- [MDN Form Guide](https://developer.mozilla.org/en-US/docs/Learn/Forms)
- [Form Design Best Practices](https://www.nngroup.com/articles/web-form-design/)

### Media
- [Web.dev Media Guide](https://web.dev/fast/#optimize-your-images)
- [Video.js Documentation](https://docs.videojs.com/)

### Graphics
- [MDN Canvas Tutorial](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial)
- [SVG Tutorial](https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial)

### Web Components
- [Web Components Guide](https://developers.google.com/web/fundamentals/web-components)
- [Open Web Components](https://open-wc.org/)

### PWA
- [PWA Builder](https://www.pwabuilder.com/)
- [Workbox](https://developers.google.com/web/tools/workbox)

## 🚀 Success Metrics

Students completing Phase 2 should be able to:
- ✅ Build production-ready HTML applications
- ✅ Implement comprehensive accessibility
- ✅ Create custom form controls
- ✅ Handle media professionally
- ✅ Create data visualizations
- ✅ Build reusable components
- ✅ Implement offline functionality
- ✅ Optimize for performance
- ✅ Ready for JavaScript learning

This curriculum provides a solid foundation in advanced HTML while building excitement for the JavaScript phase to come!