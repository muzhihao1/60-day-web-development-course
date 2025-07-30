# 60天Web开发课程网站优化需求文档

## 1. 项目背景

当前60天Web开发课程网站已上线运行，但用户反馈了多个影响学习体验的问题。这些问题在所有60天的课程内容中普遍存在，需要系统性解决。

## 2. 问题分析

### 2.1 正文排版问题
- **当前状况**: 文字间距不够，段落过于拥挤，影响阅读体验
- **影响范围**: 所有课程页面（day-1 到 day-60）
- **用户痛点**: 长时间阅读容易疲劳，难以聚焦重点内容

### 2.2 代码块样式问题
- **当前状况**: 代码块左边距不足，内容太靠近边缘
- **影响范围**: 所有包含代码示例的页面
- **用户痛点**: 代码阅读体验差，特别是在移动端设备上

### 2.3 检查清单交互问题
- **当前状况**: "今日检查清单"使用Markdown语法渲染，checkbox无法交互
- **影响范围**: 包含检查清单的课程页面（至少day-1到day-10）
- **用户痛点**: 无法追踪任务完成状态，影响学习进度管理

### 2.4 练习页面布局问题
- **当前状况**: 练习页面布局混乱，信息层次不清晰
- **影响范围**: 所有练习页面（/course/day-[day]/exercise）
- **用户痛点**: 难以快速理解练习要求，影响练习效率

### 2.5 文件查看功能缺失
- **当前状况**: "查看完整文件"链接指向不存在的路由，返回404错误
- **影响范围**: 所有解决方案页面（/course/day-[day]/solution）
- **用户痛点**: 无法查看完整代码文件，影响学习效果

### 2.6 代码展示优化问题
- **当前状况**: 解决方案页面显示完整代码文件（如800+行HTML），信息过载
- **影响范围**: 所有解决方案页面
- **用户痛点**: 代码太长，难以找到关键部分，容易让学习者感到困惑

## 3. 功能需求（使用EARS语法）

### 3.1 排版优化需求

**REQ-001**: The system SHALL increase the line-height of course content paragraphs to at least 1.8.

**REQ-002**: The system SHALL add a minimum margin-bottom of 1.5rem between paragraphs.

**REQ-003**: The system SHALL limit the maximum width of text content to 75 characters for optimal readability.

**REQ-004**: WHEN the viewport width is less than 768px, THEN the system SHALL adjust margins and padding for mobile readability.

### 3.2 代码块样式需求

**REQ-005**: The system SHALL add a minimum padding of 1.5rem to all code blocks.

**REQ-006**: The system SHALL ensure code blocks have a distinct background color with sufficient contrast.

**REQ-007**: WHEN code content exceeds the viewport width, THEN the system SHALL enable horizontal scrolling with visual indicators.

**REQ-008**: The system SHALL display line numbers for code blocks longer than 5 lines.

### 3.3 交互式检查清单需求

**REQ-009**: The system SHALL convert static markdown checkboxes to interactive HTML checkboxes.

**REQ-010**: WHEN a user clicks a checkbox, THEN the system SHALL save the state to localStorage.

**REQ-011**: WHEN a page loads, THEN the system SHALL restore checkbox states from localStorage.

**REQ-012**: The system SHALL display a progress indicator showing completed vs total tasks.

**REQ-013**: IF all checkboxes are checked, THEN the system SHALL display a completion celebration message.

### 3.4 练习页面布局需求

**REQ-014**: The system SHALL implement a clear visual hierarchy for exercise pages with distinct sections.

**REQ-015**: The system SHALL display exercise requirements in a numbered list with clear typography.

**REQ-016**: WHEN hints are available, THEN the system SHALL display them in a collapsible section.

**REQ-017**: The system SHALL provide clear navigation between exercise, solution, and lesson pages.

### 3.5 文件查看功能需求

**REQ-018**: WHEN a user clicks "查看完整文件", THEN the system SHALL display the file content in a modal or new tab.

**REQ-019**: The system SHALL provide syntax highlighting for displayed file content.

**REQ-020**: IF the file is too large (>500 lines), THEN the system SHALL provide a download option instead.

**REQ-021**: The system SHALL display file metadata (filename, size, language) in the viewer.

### 3.6 代码展示优化需求

**REQ-022**: The system SHALL display code in collapsible sections with meaningful labels.

**REQ-023**: WHEN displaying long code files, THEN the system SHALL show only key sections by default.

**REQ-024**: The system SHALL provide a "View Full Code" toggle for each code section.

**REQ-025**: The system SHALL highlight important code sections with visual indicators.

**REQ-026**: IF code contains comments marked as "KEY" or "IMPORTANT", THEN the system SHALL emphasize these sections.

## 4. 非功能需求

**NFR-001**: All optimizations SHALL maintain or improve the current page load performance (under 3 seconds).

**NFR-002**: All interactive features SHALL work across Chrome, Firefox, Safari, and Edge browsers.

**NFR-003**: The system SHALL maintain accessibility standards (WCAG 2.1 Level AA).

**NFR-004**: All changes SHALL be backward compatible with existing content structure.

**NFR-005**: Interactive features SHALL work without JavaScript for basic functionality.

## 5. 约束条件

1. **技术栈限制**: 必须使用现有的Astro 5.12.3框架，不能引入重大架构变更
2. **内容兼容性**: 不能破坏现有的MDX内容结构
3. **部署环境**: 必须兼容Vercel部署环境
4. **开发时间**: 需要在2周内完成所有优化

## 6. 成功标准

1. 用户反馈的6个主要问题全部得到解决
2. 页面加载性能不低于当前水平
3. 所有交互功能在主流浏览器上正常工作
4. 代码可维护性得到提升，有清晰的文档
5. 用户满意度调查显示90%以上的正面反馈