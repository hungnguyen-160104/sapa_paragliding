/**
 * Booking Status Analytics API
 * GET /api/v1/analytics/bookings
 * 
 * Returns booking breakdown by status, source, service, and peak times
 */
import { analyticsService } from '../../../services'
import { validateQuery, analyticsFilterSchema } from '../../../validators/common.validator'
import { successResponse } from '../../../utils/response'
import { handleError } from '../../../utils/errors'

export default defineEventHandler(async (event) => {
  try {
    // Validate query parameters
    const filter = validateQuery(analyticsFilterSchema, event)
    
    // Call analytics service
    const bookingStats = await analyticsService.getBookingStatusAnalytics(filter)
    
    return successResponse(bookingStats)
    
  } catch (error) {
    handleError(error)
  }
})
