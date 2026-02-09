// Admin Types
export interface Post {
  id: string
  title: string
  slug: string
  excerpt?: string
  contentHtml: string
  categoryId: string
  status: 'DRAFT' | 'PUBLISHED'
  thumbnailUrl: string
  galleryUrls?: string[]
  createdAt: string
  updatedAt: string
}

export interface PostCategory {
  id: string
  name: string
  slug: string
}

export interface Booking {
  id: string
  customerName: string
  phone: string
  email?: string
  flightDate: string
  location: string
  price: number
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED'
  contactStatus?: 'NOT_CONTACTED' | 'CONTACTED'
  createdAt: string
  note?: string
}

export interface StatsOverview {
  totalCustomers: number
  totalBookings: number
  pendingCount: number
  confirmedCount: number
  completedCount: number
  totalRevenue: number
  avgRevenuePerBooking: number
}

export interface ChartData {
  labels: string[]
  data: number[]
}

export interface StatusDistribution {
  pending: number
  confirmed: number
  completed: number
}

// API Response Types
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

// Filter Types
export interface PostFilters {
  search?: string
  status?: 'DRAFT' | 'PUBLISHED' | ''
  categoryId?: string
  page?: number
  pageSize?: number
}

export interface BookingFilters {
  search?: string
  status?: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | ''
  location?: string
  sort?: 'newest' | 'oldest'
  page?: number
  pageSize?: number
}

export interface StatsFilters {
  from?: string
  to?: string
  groupBy?: 'day' | 'month' | 'year'
}
