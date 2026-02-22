import { sendBookingEmailToCustomer, sendBookingEmailToAdmins } from '../utils/emailer'

export default defineEventHandler(async (event) => {
  try {
    const rawBody = await readBody(event)
    const body = rawBody.booking || rawBody

    if (!body?.bookingId || !body?.email || !body?.contactName) {
      throw createError({ statusCode: 400, statusMessage: 'Missing bookingId/email/contactName' })
    }

    // ✅ Gửi email cho khách
    await sendBookingEmailToCustomer(body)

    // ✅ (Tuỳ chọn) gửi cho admin
    await sendBookingEmailToAdmins(body)

    return { success: true, message: 'Email sent', bookingId: body.bookingId }
  } catch (error) {
    console.error('send-booking-email error:', error)
    return { success: false, message: error instanceof Error ? error.message : 'Unknown error' }
  }
})