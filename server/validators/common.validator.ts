/**
 * Common Zod Validators
 * Reusable validation schemas
 */
import { z } from 'zod'

// ============================================
// PRIMITIVE VALIDATORS
// ============================================

export const phoneSchema = z
  .string()
  .min(9, 'Số điện thoại phải có ít nhất 9 ký tự')
  .max(15, 'Số điện thoại không được quá 15 ký tự')
  .regex(/^[+]?[\d\s-]+$/, 'Số điện thoại không hợp lệ')

export const emailSchema = z
  .string()
  .email('Email không hợp lệ')
  .toLowerCase()
  .trim()

export const dateStringSchema = z
  .string()
  .refine((val) => {
    const date = new Date(val)
    return !isNaN(date.getTime())
  }, 'Ngày không hợp lệ')

export const objectIdSchema = z
  .string()
  .regex(/^[a-fA-F0-9]{24}$/, 'ObjectId không hợp lệ')

export const slugSchema = z
  .string()
  .min(3)
  .max(200)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug không hợp lệ')

// ============================================
// PAGINATION VALIDATORS
// ============================================

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

// ============================================
// DATE RANGE VALIDATORS
// ============================================

export const dateRangeSchema = z.object({
  from: dateStringSchema.optional(),
  to: dateStringSchema.optional(),
}).refine((data) => {
  if (data.from && data.to) {
    return new Date(data.from) <= new Date(data.to)
  }
  return true
}, 'Ngày bắt đầu phải trước ngày kết thúc')

// ============================================
// ANALYTICS VALIDATORS
// ============================================

export const timeGranularitySchema = z.enum(['day', 'week', 'month', 'quarter', 'year']).default('day')

export const analyticsFilterSchema = z.object({
  from: dateStringSchema.optional(),
  to: dateStringSchema.optional(),
  granularity: timeGranularitySchema.optional(),
  serviceId: z.string().optional(),
  status: z.enum(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'REFUNDED']).optional(),
})

// ============================================
// MULTILINGUAL CONTENT VALIDATORS
// ============================================

export const multilingualTextSchema = z.object({
  vi: z.string().min(1, 'Bắt buộc nhập tiếng Việt'),
  en: z.string().optional().default(''),
  fr: z.string().optional().default(''),
  ru: z.string().optional().default(''),
})

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Validate data with Zod schema and throw formatted error
 */
export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data)
  
  if (!result.success) {
    const errors = result.error.errors.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    }))
    
    throw createError({
      statusCode: 400,
      statusMessage: 'Validation Error',
      data: { errors },
    })
  }
  
  return result.data
}

/**
 * Validate query parameters
 */
export function validateQuery<T>(schema: z.ZodSchema<T>, event: any): T {
  const query = getQuery(event)
  return validateRequest(schema, query)
}

/**
 * Validate request body
 */
export async function validateBody<T>(schema: z.ZodSchema<T>, event: any): Promise<T> {
  const body = await readBody(event)
  return validateRequest(schema, body)
}
