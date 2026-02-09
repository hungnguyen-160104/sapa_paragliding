/**
 * Create Booking API
 * POST /api/v1/bookings
 * 
 * Creates a new booking with transaction support
 * Handles customer creation/lookup and notification dispatch
 */
import { bookingService } from '../../../services'
import { validateBody } from '../../../validators/common.validator'
import { createBookingSchema } from '../../../validators/booking.validator'
import { createdResponse } from '../../../utils/response'
import { handleError } from '../../../utils/errors'

export default defineEventHandler(async (event) => {
  try {
    // Validate request body with Zod
    const validatedData = await validateBody(createBookingSchema, event)
    
    // Create booking via service
    const result = await bookingService.createBooking(validatedData)
    
    console.log(`✅ Booking created: ${result.bookingId}`)
    console.log(`👤 Customer: ${result.customer.isNew ? 'New' : 'Existing'} (${result.customer.id})`)
    
    // Return created response (201)
    setResponseStatus(event, 201)
    
    return createdResponse({
      bookingId: result.bookingId,
      customerId: result.customer.id,
      isNewCustomer: result.customer.isNew,
    }, 'Booking created successfully')
    
  } catch (error) {
    handleError(error)
  }
})
