/**
 * Booking Validation Schemas
 * Zod schemas for booking-related requests
 */
import { z } from 'zod'
import { phoneSchema, emailSchema, dateStringSchema } from './common.validator'

// ============================================
// PASSENGER SCHEMA
// ============================================

export const passengerSchema = z.object({
  name: z.string().min(2, 'Tên hành khách phải có ít nhất 2 ký tự').max(100),
  weight: z.coerce.number().min(20).max(150).optional(),
  age: z.coerce.number().int().min(3).max(100).optional(),
  nationality: z.string().max(50).optional(),
})

// ============================================
// CREATE BOOKING SCHEMA
// ============================================

export const createBookingSchema = z.object({
  // Contact Information
  contactName: z
    .string()
    .min(2, 'Họ tên phải có ít nhất 2 ký tự')
    .max(100, 'Họ tên không được quá 100 ký tự')
    .trim(),
  
  email: emailSchema,
  
  phone: phoneSchema,
  
  nationality: z.string().max(50).optional(),
  
  // Service Information
  serviceId: z.string().min(1, 'Vui lòng chọn dịch vụ'),
  
  serviceName: z.string().min(1),
  
  servicePrice: z.coerce.number().min(0, 'Giá dịch vụ không hợp lệ'),
  
  // Passengers
  numberOfPassengers: z.coerce
    .number()
    .int()
    .min(1, 'Phải có ít nhất 1 hành khách')
    .max(20, 'Tối đa 20 hành khách'),
  
  passengers: z.array(passengerSchema).min(1, 'Phải có ít nhất 1 hành khách'),
  
  // Schedule
  preferredDate: dateStringSchema.refine((val) => {
    const date = new Date(val)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date >= today
  }, 'Ngày bay phải từ hôm nay trở đi'),
  
  preferredTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Giờ không hợp lệ (HH:MM)')
    .optional()
    .default('09:00'),
  
  // Location
  pickupLocation: z.string().max(500).optional(),
  
  // Optional services
  selectedOptions: z.array(z.string()).optional().default([]),
  
  optionalServicesTotal: z.coerce.number().min(0).optional().default(0),
  
  // Discount
  discount: z.coerce.number().min(0).optional().default(0),
  
  // Notes
  specialRequests: z.string().max(1000).optional(),
  
  // Telegram integration
  telegramChatId: z.string().optional(),
}).refine((data) => {
  // Validate passengers count matches numberOfPassengers
  return data.passengers.length === data.numberOfPassengers
}, {
  message: 'Số lượng thông tin hành khách phải khớp với số hành khách đã chọn',
  path: ['passengers'],
})

// ============================================
// UPDATE BOOKING SCHEMA
// ============================================

export const updateBookingSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'REFUNDED']).optional(),
  contactStatus: z.enum(['NOT_CONTACTED', 'CONTACTED', 'CONFIRMED', 'NO_RESPONSE']).optional(),
  flightDate: dateStringSchema.optional(),
  flightTime: z.string().optional(),
  pickupLocation: z.string().max(500).optional(),
  specialRequests: z.string().max(1000).optional(),
  internalNotes: z.string().max(2000).optional(),
  discount: z.coerce.number().min(0).optional(),
}).partial()

// ============================================
// BOOKING FILTER SCHEMA
// ============================================

export const bookingFilterSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'REFUNDED']).optional(),
  contactStatus: z.enum(['NOT_CONTACTED', 'CONTACTED', 'CONFIRMED', 'NO_RESPONSE']).optional(),
  source: z.enum(['website', 'telegram', 'phone', 'walk-in', 'partner']).optional(),
  from: dateStringSchema.optional(),
  to: dateStringSchema.optional(),
  search: z.string().max(100).optional(),
  sortBy: z.enum(['createdAt', 'flightDate', 'totalPrice', 'status']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

// ============================================
// TYPE EXPORTS
// ============================================

export type CreateBookingInput = z.infer<typeof createBookingSchema>
export type UpdateBookingInput = z.infer<typeof updateBookingSchema>
export type BookingFilterInput = z.infer<typeof bookingFilterSchema>
