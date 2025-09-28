// Application Constants
// This file contains all application-wide constants

export const APP_CONFIG = {
  name: 'Annlin Gemeente Webwerf',
  description: 'Gereformeerde Kerk Pretoria-Annlin',
  url: 'https://annlin.co.za',
  email: 'info@annlin.co.za',
  phone: '+27 12 xxx xxxx',
} as const

export const ROUTES = {
  HOME: '/',
  ABOUT: '/oor-annlin-gemeente',
  CALENDAR: '/jaarprogram',
  NEWS: '/nuus',
  READING_MATERIALS: '/leesstof',
  CONTACT: '/kontakbesonderhede',
  ADMIN: '/admin',
} as const

export const API_ROUTES = {
  DIENSGROEPE: '/api/diensgroepe',
  EVENTS: '/api/events',
  ARTICLES: '/api/articles',
  READING_MATERIALS: '/api/reading-materials',
  CONTACT: '/api/contact',
  UPLOAD: '/api/upload',
} as const

export const DEFAULT_ARTICLE_CATEGORIES = [
  'Sosiaal',
  'Jeug',
  'Sinode',
  'Algemeen',
  'Eredienste',
] as const

export const DEFAULT_EVENT_CATEGORIES = [
  { name: 'Eredienste', color: '#3B82F6' },
  { name: 'Spesiale Geleenthede', color: '#10B981' },
  { name: 'Vergaderings', color: '#F59E0B' },
  { name: 'Jeugaktiwiteite', color: '#EF4444' },
  { name: 'Sosiaal', color: '#8B5CF6' },
] as const

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 50,
} as const

export const FILE_UPLOAD = {
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
} as const
