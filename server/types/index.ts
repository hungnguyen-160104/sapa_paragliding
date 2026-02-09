/**
 * Core Type Definitions
 * Enterprise-grade TypeScript interfaces
 */
import { Types } from 'mongoose'

// ============================================
// COMMON TYPES
// ============================================

export type ObjectId = string | Types.ObjectId

export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface DateRangeFilter {
  from?: Date | string
  to?: Date | string
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  error?: {
    code: string
    message: string
    details?: unknown
  }
}

// ============================================
// CUSTOMER TYPES
// ============================================

export interface ICustomer {
  _id?: ObjectId
  email: string
  phone: string
  fullName: string
  nationality?: string
  totalBookings: number
  totalSpent: number
  isReturningCustomer: boolean
  firstBookingAt: Date
  lastBookingAt: Date
  createdAt: Date
  updatedAt: Date
}

export interface CreateCustomerDTO {
  email: string
  phone: string
  fullName: string
  nationality?: string
}

// ============================================
// BOOKING TYPES
// ============================================

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED'
export type ContactStatus = 'NOT_CONTACTED' | 'CONTACTED' | 'CONFIRMED' | 'NO_RESPONSE'
export type BookingSource = 'website' | 'telegram' | 'phone' | 'walk-in' | 'partner'

export interface PassengerInfo {
  name: string
  weight?: number
  age?: number
  nationality?: string
}

export interface IBooking {
  _id?: ObjectId
  bookingId: string
  customerId: ObjectId
  
  // Service info
  serviceId: string
  serviceName: string
  servicePrice: number
  
  // Passengers
  numberOfPassengers: number
  passengers: PassengerInfo[]
  
  // Pricing
  totalPrice: number
  discountAmount: number
  optionalServicesTotal: number
  
  // Schedule
  flightDate: Date
  flightTime: string
  
  // Location
  pickupLocation?: string
  
  // Status
  status: BookingStatus
  contactStatus: ContactStatus
  
  // Notes
  specialRequests?: string
  internalNotes?: string
  
  // Metadata
  source: BookingSource
  telegramChatId?: string
  
  createdAt: Date
  updatedAt: Date
}

export interface CreateBookingDTO {
  // Contact info
  contactName: string
  email: string
  phone: string
  nationality?: string
  
  // Service
  serviceId: string
  serviceName: string
  servicePrice: number
  
  // Passengers
  numberOfPassengers: number
  passengers: PassengerInfo[]
  
  // Schedule
  preferredDate: string
  preferredTime?: string
  
  // Location
  pickupLocation?: string
  
  // Optional
  selectedOptions?: string[]
  specialRequests?: string
  telegramChatId?: string
  
  // Pricing
  discount?: number
  optionalServicesTotal?: number
}

// ============================================
// POST/BLOG TYPES
// ============================================

export type PostStatus = 'draft' | 'published' | 'archived'
export type PostCategory = 'news' | 'guide' | 'experience' | 'promotion'

export interface IPost {
  _id?: ObjectId
  slug: string
  title: Record<string, string> // { vi, en, fr, ru }
  excerpt: Record<string, string>
  content: Record<string, string>
  featuredImage?: string
  category: PostCategory
  tags: string[]
  status: PostStatus
  author: string
  views: number
  seoTitle?: Record<string, string>
  seoDescription?: Record<string, string>
  publishedAt?: Date
  createdAt: Date
  updatedAt: Date
}

// ============================================
// ANALYTICS TYPES
// ============================================

export type TimeGranularity = 'day' | 'week' | 'month' | 'quarter' | 'year'

export interface AnalyticsOverview {
  totalBookings: number
  totalCustomers: number
  totalRevenue: number
  pendingBookings: number
  completedBookings: number
  cancelledBookings: number
  averageBookingValue: number
  
  // Comparisons (vs previous period)
  bookingsGrowth: number
  revenueGrowth: number
  customersGrowth: number
}

export interface RevenueAnalytics {
  labels: string[]
  values: number[]
  total: number
  average: number
  highest: { period: string; value: number }
  lowest: { period: string; value: number }
}

export interface CustomerAnalytics {
  totalCustomers: number
  newCustomers: number
  returningCustomers: number
  newCustomerRate: number
  returningCustomerRate: number
  customerRetentionRate: number
  averageBookingsPerCustomer: number
  topCustomers: Array<{
    customerId: string
    name: string
    totalBookings: number
    totalSpent: number
  }>
}

export interface BookingStatusAnalytics {
  byStatus: Array<{
    status: BookingStatus
    count: number
    percentage: number
    revenue: number
  }>
  bySource: Array<{
    source: BookingSource
    count: number
    percentage: number
  }>
  byService: Array<{
    serviceId: string
    serviceName: string
    count: number
    revenue: number
  }>
  peakDays: Array<{
    dayOfWeek: number
    dayName: string
    averageBookings: number
  }>
  peakHours: Array<{
    hour: number
    averageBookings: number
  }>
}

export interface AnalyticsFilter extends DateRangeFilter {
  granularity?: TimeGranularity
  serviceId?: string
  status?: BookingStatus
}
