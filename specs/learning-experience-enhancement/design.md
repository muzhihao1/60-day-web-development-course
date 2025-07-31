# Learning Experience Enhancement Technical Design

## Overview
This document provides the technical design for implementing the learning experience enhancements defined in the requirements document. The design is organized by implementation phases to support incremental delivery.

## Architecture Overview

```mermaid
graph TB
    subgraph "Frontend Layer"
        UI[UI Components]
        SM[State Management]
        SW[Service Worker]
    end
    
    subgraph "Data Layer"
        LS[LocalStorage]
        IDB[IndexedDB]
        API[REST API]
    end
    
    subgraph "Backend Layer"
        AS[Auth Service]
        DS[Data Service]
        SS[Sync Service]
    end
    
    UI --> SM
    SM --> LS
    SM --> IDB
    SM --> API
    SW --> IDB
    API --> AS
    API --> DS
    API --> SS
```

## Phase 1: Immediate Improvements (1-2 Days)

### 1.1 Enhanced Code Block Copy Functionality

#### Component Structure
```typescript
// src/components/CodeBlock.astro
interface Props {
  code: string;
  lang?: string;
  showLineNumbers?: boolean;
  filename?: string;
}

// src/components/CopyButton.astro
interface Props {
  text: string;
  className?: string;
}
```

#### Implementation Details
```mermaid
sequenceDiagram
    participant User
    participant CopyButton
    participant Clipboard
    participant UI
    
    User->>CopyButton: Click/Tap
    CopyButton->>Clipboard: navigator.clipboard.writeText()
    alt Success
        Clipboard-->>CopyButton: Success
        CopyButton->>UI: Show "Copied!"
        UI-->>UI: Reset after 2s
    else Failure
        Clipboard-->>CopyButton: Error
        CopyButton->>UI: Show error
    end
```

#### CSS Design System
```css
/* Code block enhancements */
:root {
  --code-block-bg: #1e1e1e;
  --code-block-border: #333;
  --copy-btn-bg: #2d2d2d;
  --copy-btn-hover: #3d3d3d;
  --copy-btn-success: #10b981;
  --line-number-color: #858585;
}

.code-block-wrapper {
  position: relative;
  margin: 1rem 0;
}

.copy-button {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  opacity: 0;
  transition: opacity 0.2s;
}

.code-block-wrapper:hover .copy-button,
.copy-button:focus,
.copy-button.always-visible {
  opacity: 1;
}

@media (max-width: 768px) {
  .copy-button {
    opacity: 1; /* Always visible on mobile */
  }
}
```

### 1.2 Mobile Code Block Scrolling

#### Component Enhancement
```typescript
// Enhanced code block with scroll indicators
interface CodeBlockProps {
  code: string;
  lang?: string;
  maxHeight?: string;
  showScrollIndicators?: boolean;
}
```

#### Scroll Indicator Implementation
```mermaid
graph LR
    A[Code Block] --> B{Overflow?}
    B -->|Yes| C[Add Scroll Container]
    B -->|No| D[Regular Display]
    C --> E[Show Indicators]
    E --> F[Update on Scroll]
```

### 1.3 Code Block Line Numbers

#### Line Number Rendering
```typescript
// src/lib/codeHighlight.ts
interface HighlightOptions {
  language: string;
  showLineNumbers: boolean;
  startLine?: number;
  highlightLines?: number[];
}

function renderCodeWithLineNumbers(
  code: string, 
  options: HighlightOptions
): string {
  // Implementation using Shiki with line number support
}
```

## Phase 2: Short-term Optimizations (1-2 Weeks)

### 2.1 Cross-Device Progress Synchronization

#### Data Model
```typescript
// src/types/progress.ts
interface UserProgress {
  userId: string;
  lastSyncedAt: Date;
  devices: DeviceInfo[];
  lessons: LessonProgress[];
}

interface LessonProgress {
  day: number;
  completedAt?: Date;
  timeSpent: number;
  notes?: string;
  exercises?: ExerciseProgress[];
}

interface SyncConflict {
  local: UserProgress;
  remote: UserProgress;
  resolution: 'local' | 'remote' | 'merge';
}
```

#### Sync Architecture
```mermaid
graph TB
    subgraph "Client"
        LC[Local Changes]
        SQ[Sync Queue]
        CR[Conflict Resolver]
    end
    
    subgraph "Server"
        API[Sync API]
        DB[(Database)]
        VR[Version Control]
    end
    
    LC --> SQ
    SQ --> API
    API --> VR
    VR --> DB
    API --> CR
    CR --> LC
```

#### Sync Service Implementation
```typescript
// src/lib/syncService.ts
class SyncService {
  private syncQueue: SyncItem[] = [];
  private syncInterval: number = 30000; // 30 seconds
  
  async syncProgress(): Promise<SyncResult> {
    // 1. Get local changes
    // 2. Send to server
    // 3. Handle conflicts
    // 4. Update local state
  }
  
  async resolveConflict(conflict: SyncConflict): Promise<UserProgress> {
    // Conflict resolution logic
  }
}
```

### 2.2 Basic Note-Taking Functionality

#### Note Storage Schema
```typescript
// IndexedDB schema for notes
interface NoteSchema {
  id: string;
  lessonDay: number;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
  isPublic?: boolean;
}
```

#### Note Editor Component
```mermaid
graph TB
    subgraph "Note Editor"
        TE[Text Editor]
        AS[Auto Save]
        MD[Markdown Preview]
        TB[Toolbar]
    end
    
    subgraph "Storage"
        IDB[IndexedDB]
        API[Sync API]
    end
    
    TE --> AS
    AS --> IDB
    AS --> API
    TE --> MD
    TB --> TE
```

### 2.3 Enhanced Mobile Navigation

#### Navigation Components
```typescript
// src/components/MobileNavigation.astro
interface MobileNavProps {
  currentDay: number;
  currentPhase: number;
  totalDays: number;
}

// src/components/SwipeHandler.astro
interface SwipeHandlerProps {
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  threshold?: number;
}
```

#### Navigation State Machine
```mermaid
stateDiagram-v2
    [*] --> Visible
    Visible --> Hidden: Scroll Down
    Hidden --> Visible: Scroll Up
    Hidden --> Visible: Tap
    Visible --> NavigatingNext: Swipe Left
    Visible --> NavigatingPrev: Swipe Right
    NavigatingNext --> Visible: Complete
    NavigatingPrev --> Visible: Complete
```

### 2.4 Interactive Code Examples

#### Sandbox Architecture
```typescript
// src/lib/codeSandbox.ts
interface SandboxConfig {
  runtime: 'javascript' | 'typescript' | 'react';
  dependencies?: Record<string, string>;
  timeout?: number;
}

class CodeSandbox {
  private worker: Worker;
  
  async execute(code: string, config: SandboxConfig): Promise<ExecutionResult> {
    // Sandbox execution logic
  }
}
```

#### Execution Flow
```mermaid
sequenceDiagram
    participant User
    participant Editor
    participant Sandbox
    participant Worker
    
    User->>Editor: Modify Code
    User->>Editor: Click Run
    Editor->>Sandbox: Execute(code)
    Sandbox->>Worker: PostMessage(code)
    Worker->>Worker: Run in isolation
    Worker-->>Sandbox: Result/Error
    Sandbox-->>Editor: Display Output
```

## Phase 3: Medium-to-Long-term Enhancements (1-2 Months)

### 3.1 Advanced Progress Analytics

#### Analytics Data Model
```typescript
interface LearningAnalytics {
  userId: string;
  metrics: {
    totalTimeSpent: number;
    averageSessionDuration: number;
    completionRate: number;
    streakDays: number;
    strongTopics: string[];
    weakTopics: string[];
  };
  timeline: TimelineEntry[];
  recommendations: Recommendation[];
}

interface TimelineEntry {
  date: Date;
  lessonsCompleted: number[];
  timeSpent: number;
  exercisesAttempted: number;
  successRate: number;
}
```

#### Analytics Dashboard Components
```mermaid
graph TB
    subgraph "Analytics Dashboard"
        PC[Progress Chart]
        TH[Time Heatmap]
        SR[Success Rate]
        RC[Recommendations]
    end
    
    subgraph "Data Processing"
        DP[Data Processor]
        ML[ML Service]
        CA[Cache]
    end
    
    DP --> PC
    DP --> TH
    DP --> SR
    ML --> RC
    CA --> DP
```

### 3.2 Collaborative Learning Features

#### Collaboration Schema
```typescript
interface Discussion {
  id: string;
  lessonDay: number;
  author: UserProfile;
  content: string;
  replies: Reply[];
  votes: number;
  tags: string[];
}

interface SharedNote {
  id: string;
  author: UserProfile;
  lessonDay: number;
  content: string;
  visibility: 'public' | 'friends' | 'private';
  collaborators?: string[];
}
```

#### Real-time Collaboration
```mermaid
graph TB
    subgraph "Clients"
        C1[Client 1]
        C2[Client 2]
        C3[Client N]
    end
    
    subgraph "Server"
        WS[WebSocket Server]
        MS[Message Service]
        PS[Persistence Service]
    end
    
    C1 <--> WS
    C2 <--> WS
    C3 <--> WS
    WS <--> MS
    MS <--> PS
```

### 3.3 Offline Learning Support

#### Service Worker Strategy
```typescript
// src/sw.ts
const CACHE_NAME = 'course-offline-v1';
const CONTENT_CACHE = 'course-content-v1';
const DYNAMIC_CACHE = 'course-dynamic-v1';

interface CacheStrategy {
  networkFirst: string[];
  cacheFirst: string[];
  networkOnly: string[];
}

// Progressive enhancement for offline
class OfflineManager {
  async downloadLesson(day: number): Promise<void> {
    // Download and cache lesson content
  }
  
  async getAvailableOffline(): Promise<number[]> {
    // Return list of available offline lessons
  }
}
```

#### Offline Sync Queue
```mermaid
sequenceDiagram
    participant App
    participant SW as Service Worker
    participant Queue
    participant Network
    
    App->>SW: Save Progress
    SW->>Queue: Add to Sync Queue
    SW-->>App: Saved Locally
    
    Note over SW,Network: When Online
    SW->>Network: Process Queue
    Network-->>SW: Success
    SW->>Queue: Clear Synced Items
```

### 3.4 Personalized Learning Paths

#### Personalization Engine
```typescript
interface LearningProfile {
  userId: string;
  skillLevel: SkillAssessment;
  learningStyle: 'visual' | 'practical' | 'theoretical';
  goals: string[];
  interests: string[];
  completedTopics: string[];
  strugglingTopics: string[];
}

interface PersonalizedPath {
  recommendedOrder: LessonRecommendation[];
  skipSuggestions: number[];
  additionalResources: Resource[];
  estimatedCompletionTime: number;
}

class PersonalizationEngine {
  async generatePath(profile: LearningProfile): Promise<PersonalizedPath> {
    // ML-based path generation
  }
}
```

#### Adaptive Learning Flow
```mermaid
graph TB
    A[Initial Assessment] --> B[Generate Path]
    B --> C[Start Learning]
    C --> D{Check Performance}
    D -->|Good| E[Continue Path]
    D -->|Struggling| F[Add Resources]
    D -->|Excellent| G[Skip Ahead]
    E --> H[Update Profile]
    F --> H
    G --> H
    H --> C
```

## Technical Considerations

### Performance Optimizations
1. **Code Splitting**: Dynamic imports for feature modules
2. **Lazy Loading**: Load interactive features on demand
3. **Caching Strategy**: Aggressive caching for static content
4. **Bundle Optimization**: Separate vendor and app bundles

### Security Measures
1. **Authentication**: JWT with refresh tokens
2. **Data Encryption**: AES-256 for sensitive data
3. **XSS Prevention**: Content Security Policy headers
4. **Rate Limiting**: API throttling per user

### Monitoring & Analytics
1. **Error Tracking**: Sentry integration
2. **Performance Monitoring**: Web Vitals tracking
3. **User Analytics**: Privacy-focused analytics
4. **A/B Testing**: Feature flag system

### Testing Strategy
1. **Unit Tests**: Component and utility testing
2. **Integration Tests**: API and service testing
3. **E2E Tests**: Critical user flows
4. **Performance Tests**: Load and stress testing