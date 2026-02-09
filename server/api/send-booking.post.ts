import { getBookingsCollection } from '../utils/db'

const normalizeDate = (value?: string | null) => {
  if (!value) return null
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return null
  }
  return parsed
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)

    // Generate booking ID: DDMM.SDT (flight date + phone number)
    // Example: 0802.0386887489 = ngày 08/02, SDT 0386887489
    const now = new Date()
    const phone = body.phone ? body.phone.replace(/\D/g, '') : '0000000000' // Remove non-digits
    const phoneForId = phone.slice(-10).padStart(10, '0') // Last 10 digits
    
    // Use flight date if available, otherwise use current date
    let flightDateForId = now
    if (body.preferredDate) {
      const parsed = new Date(body.preferredDate)
      if (!Number.isNaN(parsed.getTime())) {
        flightDateForId = parsed
      }
    }
    const dd = String(flightDateForId.getDate()).padStart(2, '0')
    const mm = String(flightDateForId.getMonth() + 1).padStart(2, '0')
    const yy = String(flightDateForId.getFullYear()).slice(-2)
    const timestamp = Date.now().toString(36).toUpperCase()
    const random = Math.random().toString(36).substring(2, 5).toUpperCase()
    const bookingId = `BK${yy}${mm}${dd}${phoneForId.slice(-4)}${timestamp}${random}`

    const passengers = Array.isArray(body.passengers) ? body.passengers : []
    const numberOfPassengers = Number(body.numberOfPassengers || passengers.length || 1)

    const servicePrice = Number(body.servicePrice) || 0
    const totalPrice = Number(body.totalPrice) || servicePrice * numberOfPassengers

    const flightDateUtc = normalizeDate(body.preferredDate) || now

    const bookings = await getBookingsCollection()

    await bookings.insertOne({
      id: bookingId,
      bookingId,
      customerName: body.contactName,
      email: body.email,
      phone: body.phone,
      location: body.pickupLocation || body.location || 'Sapa',
      status: 'PENDING',
      contactStatus: 'NOT_CONTACTED',
      serviceId: body.serviceId,
      serviceName: body.serviceName,
      servicePrice,
      numberOfPassengers,
      passengers,
      selectedOptions: body.selectedOptions || [],
      serviceQuantities: body.serviceQuantities || {},
      optionalServicesTotal: body.optionalServicesTotal || 0,
      notes: body.specialRequests || '',
      telegramChatId: body.telegramChatId,
      price: totalPrice,
      discountPerPerson: Number(body.discount) || 0,
      pickupLocation: body.pickupLocation,
      preferredTime: body.preferredTime,
      flightDate: body.preferredDate || flightDateUtc.toISOString().split('T')[0],
      flightTime: body.preferredTime || '',
      flightDateUtc,
      source: 'website',
      createdAt: now,
      updatedAt: now
    })

    console.log(`✅ Booking received: ${bookingId}`)
    console.log(`📱 Telegram Chat ID: ${body.telegramChatId || 'Not provided'}`)

    return {
      success: true,
      bookingId,
      message: 'Booking submitted successfully. Telegram notification will be sent.'
    }
  } catch (error) {
    console.error('Booking error:', error)
    
    return {
      success: false,
      error: 'Failed to process booking',
      message: error instanceof Error ? error.message : 'Unknown error'
    }
  }
})
