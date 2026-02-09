/**
 * Application Constants
 * Centralized configuration values
 */

// ============================================
// BOOKING CONSTANTS
// ============================================

export const BOOKING_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  REFUNDED: 'REFUNDED',
} as const

export const CONTACT_STATUS = {
  NOT_CONTACTED: 'NOT_CONTACTED',
  CONTACTED: 'CONTACTED',
  CONFIRMED: 'CONFIRMED',
  NO_RESPONSE: 'NO_RESPONSE',
} as const

export const BOOKING_SOURCE = {
  WEBSITE: 'website',
  TELEGRAM: 'telegram',
  PHONE: 'phone',
  WALK_IN: 'walk-in',
  PARTNER: 'partner',
} as const

// ============================================
// POST CONSTANTS
// ============================================

export const POST_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
} as const

export const POST_CATEGORY = {
  NEWS: 'news',
  GUIDE: 'guide',
  EXPERIENCE: 'experience',
  PROMOTION: 'promotion',
} as const

// ============================================
// PAGINATION DEFAULTS
// ============================================

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const

// ============================================
// ANALYTICS CONSTANTS
// ============================================

export const TIME_GRANULARITY = {
  DAY: 'day',
  WEEK: 'week',
  MONTH: 'month',
  QUARTER: 'quarter',
  YEAR: 'year',
} as const

export const MONGODB_DATE_FORMATS = {
  day: '%Y-%m-%d',
  week: '%Y-W%V',
  month: '%Y-%m',
  year: '%Y',
} as const

// ============================================
// LOCALES
// ============================================

export const SUPPORTED_LOCALES = ['vi', 'en', 'fr', 'ru'] as const
export const DEFAULT_LOCALE = 'vi'

// ============================================
// RATE LIMITS
// ============================================

export const RATE_LIMITS = {
  BOOKING: {
    WINDOW_MS: 60 * 1000, // 1 minute
    MAX_REQUESTS: 5,
  },
  API: {
    WINDOW_MS: 60 * 1000,
    MAX_REQUESTS: 100,
  },
} as const
