/**
 * Cancel Booking API
 * POST /api/v1/bookings/:id/cancel
 * 
 * Cancels a booking with optional reason
 */
import { z } from 'zod'
import { bookingService } from '../../../../services'
import { validateBody } from '../../../../validators/common.validator'
import { successResponse } from '../../../../utils/response'
import { handleError, NotFoundError } from '../../../../utils/errors'

const cancelSchema = z.object({
  reason: z.string().max(500).optional(),
})

export default defineEventHandler(async (event) => {
  try {
    const bookingId = getRouterParam(event, 'id')
    
    if (!bookingId) {
      throw new NotFoundError('Booking')
    }
    
    const { reason } = await validateBody(cancelSchema, event)
    
    const booking = await bookingService.cancelBooking(bookingId, reason)
    
    if (!booking) {
      throw new NotFoundError('Booking')
    }
    
    return successResponse(booking, 'Booking cancelled successfully')
    
  } catch (error) {
    handleError(error)
  }
})
