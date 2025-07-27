/**
 * 导航系统相关的类型定义
 * 用于定义导航结构和学习进度追踪
 */

/**
 * 导航项类型
 */
export type NavItemType = 'theory' | 'practice' | 'solution' | 'overview' | 'phase'

/**
 * 导航项定义
 */
export interface NavItem {
  label: string
  href: string
  children?: NavItem[]
  type: NavItemType
  completed?: boolean
  icon?: string
  badge?: string | number
  isActive?: boolean
  dayNumber?: number
  phaseId?: string
}

/**
 * 面包屑项
 */
export interface BreadcrumbItem {
  label: string
  href: string
  isActive?: boolean
}

/**
 * 学习进度
 */
export interface LearningProgress {
  userId: string
  completedDays: number[]
  currentDay: number
  totalDays: number
  completedExercises: {
    [dayNumber: number]: string[] // exerciseId数组
  }
  lastAccessedDate: Date
  achievements?: Achievement[]
}

/**
 * 成就定义
 */
export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlockedAt?: Date
  criteria: {
    type: 'days_completed' | 'exercises_completed' | 'phase_completed' | 'streak'
    value: number
  }
}

/**
 * 导航配置
 */
export interface NavigationConfig {
  showProgress: boolean
  showBreadcrumbs: boolean
  collapsible: boolean
  defaultExpanded: string[] // 默认展开的phase ids
  enableKeyboardNavigation: boolean
}

/**
 * 侧边栏状态
 */
export interface SidebarState {
  isOpen: boolean
  expandedItems: string[]
  activeItemId?: string
  scrollPosition: number
}

/**
 * 导航上下文
 */
export interface NavigationContext {
  currentPath: string
  previousPath?: string
  nextPath?: string
  breadcrumbs: BreadcrumbItem[]
  currentPhase?: string
  currentDay?: number
}