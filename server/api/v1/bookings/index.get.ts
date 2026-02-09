/**
 * List Bookings API
 * GET /api/v1/bookings
 * 
 * Returns paginated list of bookings with filters
 */
import { bookingService } from '../../../services'
import { validateQuery } from '../../../validators/common.validator'
import { bookingFilterSchema } from '../../../validators/booking.validator'
import { paginatedResponse } from '../../../utils/response'
import { handleError } from '../../../utils/errors'

export default defineEventHandler(async (event) => {
  try {
    // Validate query parameters
    const filter = validateQuery(bookingFilterSchema, event)
    
    // Get paginated bookings
    const result = await bookingService.getBookings(filter as any)
    
    return paginatedResponse(result)
    
  } catch (error) {
    handleError(error)
  }
})
