import { sendBookingEmailToCustomer, sendBookingEmailToAdmins } from '../utils/emailer'
import { resolveEmailLocale } from '../utils/email-i18n'

export default defineEventHandler(async (event) => {
  try {
    const rawBody = await readBody(event)
    const body = rawBody.booking || rawBody

    if (!body?.bookingId || !body?.email || !body?.contactName) {
      throw createError({ statusCode: 400, statusMessage: 'Missing bookingId/email/contactName' })
    }

    // Ngôn ngữ khách đang xem web lúc đặt. Thiếu hoặc lạ thì về tiếng Anh.
    const locale = resolveEmailLocale(rawBody.locale ?? body.locale)

    // ✅ Gửi email cho khách (không đính kèm ảnh vé — xem sendBookingEmailToCustomer)
    await sendBookingEmailToCustomer(body, locale)

    // ✅ Gửi cho quản lý nội bộ (không kèm vé)
    await sendBookingEmailToAdmins(body)

    return { success: true, message: 'Email sent', bookingId: body.bookingId }
  } catch (error) {
    console.error('send-booking-email error:', error)
    return { success: false, message: error instanceof Error ? error.message : 'Unknown error' }
  }
})