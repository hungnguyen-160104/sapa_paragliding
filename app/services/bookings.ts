import { apiFetch } from './http'

export interface BookingRecord {
  id: string
  bookingId?: string
  customerName: string
  email?: string
  phone?: string
  location?: string
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED'
  contactStatus?: 'NOT_CONTACTED' | 'CONTACTED'
  price?: number
  flightDate?: string
  flightTime?: string
  createdAt?: string
  numberOfPassengers?: number
  serviceName?: string
  notes?: string
}

export interface BookingListResponse {
  success: boolean
  data: BookingRecord[]
  total: number
}

export interface BookingFilters {
  search?: string
  status?: string
  location?: string
  from?: string
  to?: string
  sort?: 'flightDate_desc' | 'flightDate_asc'
  page?: number
  pageSize?: number
}

export const fetchBookings = (params: BookingFilters = {}) => {
  return apiFetch<BookingListResponse>(`/admin/bookings`, {
    method: 'GET',
    params
  })
}

export const updateBookingStatus = (id: string, status: 'PENDING' | 'CONFIRMED' | 'COMPLETED') => {
  return apiFetch(`/admin/bookings/${id}/status`, {
    method: 'PATCH',
    body: { status }
  })
}

export const updateBookingContact = (id: string, contactStatus: 'NOT_CONTACTED' | 'CONTACTED') => {
  return apiFetch(`/admin/bookings/${id}/contact`, {
    method: 'PATCH',
    body: { contactStatus }
  })
}

export const deleteBooking = (id: string) => {
  return apiFetch(`/admin/bookings/${id}`, {
    method: 'DELETE'
  })
}
