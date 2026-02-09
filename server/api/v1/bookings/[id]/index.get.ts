/**
 * Get Booking by ID API
 * GET /api/v1/bookings/:id
 * 
 * Returns booking details with customer information
 */
import { bookingService } from '../../../../services'
import { successResponse } from '../../../../utils/response'
import { handleError, NotFoundError } from '../../../../utils/errors'

export default defineEventHandler(async (event) => {
  try {
    const bookingId = getRouterParam(event, 'id')
    
    if (!bookingId) {
      throw new NotFoundError('Booking')
    }
    
    const booking = await bookingService.getBookingById(bookingId)
    
    if (!booking) {
      throw new NotFoundError('Booking')
    }
    
    return successResponse(booking)
    
  } catch (error) {
    handleError(error)
  }
})
