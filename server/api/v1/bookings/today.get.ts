/**
 * Today's Bookings API
 * GET /api/v1/bookings/today
 * 
 * Returns all bookings scheduled for today (for operations)
 */
import { bookingService } from '../../../services'
import { successResponse } from '../../../utils/response'
import { handleError } from '../../../utils/errors'

export default defineEventHandler(async (event) => {
  try {
    const bookings = await bookingService.getTodayBookings()
    
    return successResponse({
      date: new Date().toISOString().split('T')[0],
      count: bookings.length,
      bookings,
    })
    
  } catch (error) {
    handleError(error)
  }
})
