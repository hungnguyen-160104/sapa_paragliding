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
    const bookingId = `${dd}${mm}.${phone}`

    const passengers = Array.isArray(body.passengers) ? body.passengers : []
    const numberOfPassengers = Number(body.numberOfPassengers || passengers.length || 1)

    const servicePrice = Number(body.servicePrice) || 0
    const totalPrice = Number(body.totalPrice) || servicePrice * numberOfPassengers

    const flightDateUtc = normalizeDate(body.preferredDate) || now

    const bookings = await getBookingsCollection()

    /**
     * UPSERT theo bookingId, không insert.
     *
     * bookingId = ngàybay.sđt và cột này có ràng buộc UNIQUE — cùng một khách
     * đặt lại cùng ngày bay (bấm gửi hai lần, sửa thông tin rồi gửi lại, hay
     * thử lại sau khi mạng chập chờn) là insert bị từ chối, khách thấy
     * "Booking submission failed" và THỬ LẠI BAO NHIÊU LẦN CŨNG THẾ vì mã đã
     * bị đơn đầu chiếm. Giờ lần gửi sau cùng là bản đúng: đè dữ liệu mới lên
     * đơn cũ, trả về thành công với đúng mã đó. Trạng thái quay về PENDING để
     * nhân viên biết đơn vừa đổi mà xác nhận lại; ngày tạo giữ của lần đầu.
     */
    await bookings.updateOne(
      { bookingId },
      {
        $set: {
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
          updatedAt: now
        },
        $setOnInsert: { id: bookingId, createdAt: now }
      },
      { upsert: true }
    )

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
