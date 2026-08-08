import { sendBookingEmailToCustomer, sendBookingEmailToAdmins } from '../utils/emailer'

export default defineEventHandler(async (event) => {
  try {
    const rawBody = await readBody(event)
    const body = rawBody.booking || rawBody

    if (!body?.bookingId || !body?.email || !body?.contactName) {
      throw createError({ statusCode: 400, statusMessage: 'Missing bookingId/email/contactName' })
    }

    // ✅ Gửi email cho khách (không đính kèm ảnh vé — xem sendBookingEmailToCustomer)
    await sendBookingEmailToCustomer(body)

    // ✅ Gửi cho quản lý nội bộ (không kèm vé)
    await sendBookingEmailToAdmins(body)

    return { success: true, message: 'Email sent', bookingId: body.bookingId }
  } catch (error) {
    console.error('send-booking-email error:', error)
    return { success: false, message: error instanceof Error ? error.message : 'Unknown error' }
  }
})