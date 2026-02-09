/**
 * Standardized API Response Utilities
 * Consistent response format across all endpoints
 */
import type { ApiResponse, PaginatedResponse } from '../types'

/**
 * Success response wrapper
 */
export function successResponse<T>(data: T, message?: string): ApiResponse<T> {
  return {
    success: true,
    data,
    ...(message && { message }),
  }
}

/**
 * Paginated response wrapper
 */
export function paginatedResponse<T>(result: PaginatedResponse<T>): ApiResponse<PaginatedResponse<T>> {
  return {
    success: true,
    data: result,
  }
}

/**
 * Error response wrapper
 */
export function errorResponse(
  code: string,
  message: string,
  details?: unknown
): ApiResponse<never> {
  const error: { code: string; message: string; details?: unknown } = {
    code,
    message,
  }
  
  if (details !== undefined) {
    error.details = details
  }
  
  return {
    success: false,
    error,
  }
}

/**
 * Created response (201)
 */
export function createdResponse<T>(data: T, message: string = 'Created successfully'): ApiResponse<T> {
  return {
    success: true,
    data,
    message,
  }
}

/**
 * No content response (for deletes)
 */
export function deletedResponse(message: string = 'Deleted successfully'): ApiResponse<null> {
  return {
    success: true,
    data: null,
    message,
  }
}
