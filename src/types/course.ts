// Course content type definitions

export interface DayContent {
  day: number;
  phase: number;
  title: string;
  description: string;
  objectives: string[];
  sections: Section[];
  exercises: Exercise[];
  solution: Solution;
  resources?: Resource[];
  tags?: string[];
}

export interface Section {
  id: string;
  title: string;
  content: string;
  type: 'theory' | 'example' | 'explanation';
  codeExamples?: CodeExample[];
}

export interface CodeExample {
  id: string;
  title: string;
  language: string;
  code: string;
  filename?: string;
  description?: string;
}

export interface Exercise {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  requirements: string[];
  hints?: string[];
  startingCode?: string;
}

export interface Solution {
  id: string;
  exerciseId: string;
  code: string;
  explanation: string;
  alternativeApproaches?: string[];
}

export interface Resource {
  title: string;
  url: string;
  type: 'documentation' | 'tutorial' | 'video' | 'article';
  description?: string;
}

// Navigation types
export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
  type: 'theory' | 'practice' | 'solution' | 'overview';
  completed?: boolean;
  icon?: string;
}

export interface Phase {
  id: number;
  title: string;
  description: string;
  days: number[];
  color: string;
  icon: string;
}

// User progress tracking
export interface UserProgress {
  userId?: string;
  completedDays: number[];
  currentDay: number;
  currentPhase: number;
  lastAccessDate: Date;
  totalTimeSpent: number;
  exercisesCompleted: string[];
}