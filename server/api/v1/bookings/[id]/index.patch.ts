/**
 * Update Booking API
 * PATCH /api/v1/bookings/:id
 * 
 * Updates booking details
 */
import { bookingService } from '../../../../services'
import { validateBody } from '../../../../validators/common.validator'
import { updateBookingSchema } from '../../../../validators/booking.validator'
import { successResponse } from '../../../../utils/response'
import { handleError, NotFoundError } from '../../../../utils/errors'

export default defineEventHandler(async (event) => {
  try {
    const bookingId = getRouterParam(event, 'id')
    
    if (!bookingId) {
      throw new NotFoundError('Booking')
    }
    
    // Validate request body
    const updates = await validateBody(updateBookingSchema, event)
    
    // Update booking
    const booking = await bookingService.updateBooking(bookingId, updates as any)
    
    if (!booking) {
      throw new NotFoundError('Booking')
    }
    
    return successResponse(booking, 'Booking updated successfully')
    
  } catch (error) {
    handleError(error)
  }
})
