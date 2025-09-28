// Common types for the Annlin Church Website

export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'editor'
  createdAt: Date
  updatedAt: Date
}

export interface ServiceGroup {
  id: string
  name: string
  description: string
  contactPerson: string
  contactEmail: string
  contactPhone?: string
  thumbnailUrl?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Event {
  id: string
  title: string
  description: string
  startDate: Date
  endDate?: Date
  location?: string
  category: EventCategory
  isRecurring: boolean
  recurringPattern?: RecurringPattern
  sermonUrl?: string
  createdAt: Date
  updatedAt: Date
}

export interface EventCategory {
  id: string
  name: string
  color: string
  description?: string
}

export interface RecurringPattern {
  type: 'weekly' | 'monthly' | 'yearly'
  interval: number
  endDate?: Date
}

export interface Article {
  id: string
  title: string
  slug: string
  content: string
  excerpt?: string
  featuredImageUrl?: string
  categoryId: string
  category: ArticleCategory
  status: 'draft' | 'published'
  publishedAt?: Date
  createdAt: Date
  updatedAt: Date
  authorId: string
  author: User
}

export interface ArticleCategory {
  id: string
  name: string
  slug: string
  description?: string
  color?: string
}

export interface ReadingMaterial {
  id: string
  title: string
  description?: string
  fileUrl?: string
  externalUrl?: string
  categoryId: string
  category: ReadingMaterialCategory
  fileType?: 'pdf' | 'doc' | 'link'
  fileSize?: number
  createdAt: Date
  updatedAt: Date
}

export interface ReadingMaterialCategory {
  id: string
  name: string
  description?: string
}

export interface ContactSubmission {
  id: string
  name: string
  email: string
  phone?: string
  subject: string
  message: string
  type: 'general' | 'service_group' | 'specific'
  serviceGroupId?: string
  status: 'new' | 'read' | 'replied'
  createdAt: Date
  updatedAt: Date
}

export interface AuditLog {
  id: string
  userId: string
  user: User
  action: string
  entityType: string
  entityId: string
  changes: Record<string, unknown>
  createdAt: Date
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T = unknown> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Form types
export interface LoginForm {
  email: string
  password: string
}

export interface ContactForm {
  name: string
  email: string
  phone?: string
  subject: string
  message: string
  type: ContactSubmission['type']
  serviceGroupId?: string
}

// Component prop types
export interface BaseComponentProps {
  className?: string
  children?: React.ReactNode
}

// Utility types
export type Status = 'idle' | 'loading' | 'success' | 'error'

export type SortDirection = 'asc' | 'desc'

export interface SortConfig {
  key: string
  direction: SortDirection
}

export interface FilterConfig {
  [key: string]: string | number | boolean | undefined
}
