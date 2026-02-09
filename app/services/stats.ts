import { apiFetch } from './http'

export interface DateRangeFilters {
  from?: string
  to?: string
}

export type GroupBy = 'day' | 'month' | 'year'

export interface OverviewStatsResponse {
  success: boolean
  totalBookings: number
  totalCustomers: number
  pending: number
  revenue: number
}

export interface TrendResponse {
  success: boolean
  labels: string[]
  values: number[]
}

export const fetchOverviewStats = (params: DateRangeFilters = {}) => {
  return apiFetch<OverviewStatsResponse>(`/admin/stats/overview`, {
    method: 'GET',
    params
  })
}

export const fetchBookingTrends = (params: DateRangeFilters & { groupBy: GroupBy }) => {
  return apiFetch<TrendResponse>(`/admin/stats/bookings`, {
    method: 'GET',
    params
  })
}

export const fetchRevenueTrends = (params: DateRangeFilters & { groupBy: GroupBy }) => {
  return apiFetch<TrendResponse>(`/admin/stats/revenue`, {
    method: 'GET',
    params
  })
}

export const fetchStatusDistribution = (params: DateRangeFilters = {}) => {
  return apiFetch<TrendResponse>(`/admin/stats/status`, {
    method: 'GET',
    params
  })
}
