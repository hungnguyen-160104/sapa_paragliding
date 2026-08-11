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

    // Generate booking ID: DDMM + countryCode + phone
    // Example: 021284973783789 = ngày 02, tháng 12, mã quốc gia +84, SDT 973783789
    /**
     * Chuẩn hoá số điện thoại thành chuỗi số dùng cho mã đặt chỗ.
     *
     * Mã quốc gia + số quốc gia, KHÔNG có số 0 đứng đầu phần quốc gia:
     * khách chọn "+84" rồi vẫn gõ "0386887489" là chuyện thường, nếu giữ
     * nguyên thì cùng một người sẽ ra hai mã khác nhau (84386887489 và
     * 840386887489). Mã này là khoá chính của đơn nên phải duy nhất và tra
     * cứu được.
     */
    const normalizePhoneDigits = (raw: unknown): string => {
      const value = String(raw ?? '').trim()
      const withCode = value.match(/^\+(\d{1,4})[\s.-]*(.*)$/)

      if (withCode) {
        const dial = withCode[1]!
        const national = withCode[2]!.replace(/\D/g, '').replace(/^0+/, '')
        return `${dial}${national}`
      }

      return value.replace(/\D/g, '')
    }

    const phone = normalizePhoneDigits(body.phone)
    
    // Use flight date if available, otherwise use current date
    const now = new Date()
    let flightDateForId = now
    if (body.preferredDate) {
      const parsed = new Date(body.preferredDate)
      if (!Number.isNaN(parsed.getTime())) {
        flightDateForId = parsed
      }
    }
    const dd = String(flightDateForId.getDate()).padStart(2, '0')
    const mm = String(flightDateForId.getMonth() + 1).padStart(2, '0')
    // Công thức mã đặt chỗ: NGÀYBAY + THÁNGBAY + "." + SĐT (kèm mã quốc gia).
    // Dấu chấm tách phần ngày với phần số điện thoại — một dãy 15 chữ số liền
    // rất dễ nhìn nhầm và khó đọc qua điện thoại.
    // Ví dụ: bay 29/08, số +84 386 887 489  ->  2908.84386887489
    // Lưu ý: đơn cũ trong database vẫn giữ mã không dấu chấm, không đổi.
    const baseBookingId = `${dd}${mm}.${phone}`

    const passengers = Array.isArray(body.passengers) ? body.passengers : []
    const numberOfPassengers = Number(body.numberOfPassengers || passengers.length || 1)

    const servicePrice = Number(body.servicePrice) || 0
    const totalPrice = Number(body.totalPrice) || servicePrice * numberOfPassengers

    const flightDateUtc = normalizeDate(body.preferredDate) || now

    const bookings = await getBookingsCollection()

    const bookingDoc = {
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
    }

    /**
     * Trùng mã thì thêm đuôi .1 .2 .3 — KHÔNG đè lên đơn cũ.
     *
     * Mã đặt chỗ là ngàybay.sđt và cột này có ràng buộc UNIQUE, nên cùng một
     * số điện thoại đặt lại cùng ngày bay là bị từ chối vĩnh viễn: khách thấy
     * "gửi đặt chỗ thất bại" và thử lại bao nhiêu lần cũng thế.
     *
     * Đè lên đơn cũ thì mất đơn đầu — mà khách đặt hai lần cùng ngày nhiều
     * khi là hai nhóm thật (đặt cho mình rồi đặt thêm cho bạn). Nên giữ cả
     * hai: 2908.84386887489, rồi 2908.84386887489.1, .2...
     *
     * Bắt riêng mã lỗi 11000 của MongoDB: lỗi khác (mất mạng, hết quyền ghi)
     * phải nổ ra ngay chứ không được lặng lẽ thử 20 lần.
     */
    const MAX_ATTEMPTS = 20
    let bookingId = baseBookingId

    for (let attempt = 0; ; attempt++) {
      bookingId = attempt === 0 ? baseBookingId : `${baseBookingId}.${attempt}`

      try {
        await bookings.insertOne({ ...bookingDoc, id: bookingId, bookingId })
        break
      } catch (error: any) {
        const isDuplicate = error?.code === 11000
        if (!isDuplicate || attempt >= MAX_ATTEMPTS) throw error
      }
    }

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
