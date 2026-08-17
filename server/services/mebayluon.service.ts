/**
 * Đẩy đơn sang SỔ ĐIỀU HÀNH mebayluon.com (khu /baocao).
 *
 * Vì sao cần: đội trực ở điểm bay Sa Pa làm việc trên sổ điều hành của
 * mebayluon (biết hôm nay ai bay, ai huỷ, ai dời). Trước đây đơn từ web này
 * phải gõ tay sang bên đó — vừa mất công vừa sai tên, sai giờ đón.
 *
 * Cách nối: mỗi khi có đơn mới hoặc đơn đổi thông tin, gọi một cú POST sang cửa
 * `/api/baocao/booking/inbound-sapa` kèm mã bí mật dùng chung. Bên đó KHOÁ THEO
 * MÃ ĐƠN của web này, nên gửi lại bao nhiêu lần cũng chỉ có một booking — gửi
 * lại là SỬA, không sinh bản trùng.
 *
 * KHÔNG BAO GIỜ làm đơn thất bại vì lỗi đẩy: hàm này tự nuốt lỗi và chỉ ghi log.
 * Khách đã trả tiền trên web thì đơn phải lưu được, còn việc đồng bộ sang sổ
 * điều hành là chuyện nội bộ, hỏng thì đội trực nhập tay như trước.
 *
 * Hai biến môi trường cần khai (Vercel → Settings → Environment Variables):
 *   MEBAYLUON_INBOUND_URL     mặc định https://www.mebayluon.com/api/baocao/booking/inbound-sapa
 *   MEBAYLUON_INBOUND_SECRET  phải GIỐNG HỆT SAPA_INBOUND_SECRET bên mebayluon
 * Chưa khai secret thì bỏ qua im lặng — không gọi cửa lạ, không log ầm ĩ.
 */

const DEFAULT_URL = 'https://www.mebayluon.com/api/baocao/booking/inbound-sapa'

export interface MebayluonBookingPayload {
  /** Mã đơn của web này — bên kia dùng làm khoá chống trùng. */
  ref: string
  /** Ngày bay dạng YYYY-MM-DD. */
  flightDate: string
  /** Giờ đón HH:MM. */
  pickupTime: string
  /** Điểm đón — chữ tự do (khách sạn, bến xe…). */
  pickupPoint: string
  name: string
  phone: string
  guests: number
  source: string
  note: string
}

/** "2026-08-22" từ Date hoặc chuỗi — giờ Việt Nam. */
function dateKeyVN(value: Date | string): string {
  const d = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d)
}

/**
 * Dựng ghi chú cho đội trực: gói bay, cân nặng từng khách, yêu cầu riêng.
 * Sổ Sa Pa bên mebayluon chưa quản tiền nên KHÔNG gửi giá — gửi sang cũng không
 * có ô nào nhận, chỉ làm dòng ghi chú dài thêm.
 */
function noteOf(booking: any): string {
  const parts: string[] = []
  if (booking?.serviceName) parts.push(String(booking.serviceName))

  const weights = (booking?.passengers ?? [])
    .map((p: any) => {
      const name = String(p?.fullName ?? '').trim()
      const weight = p?.weight ? `${p.weight}kg` : ''
      return [name, weight].filter(Boolean).join(' ')
    })
    .filter(Boolean)
  if (weights.length) parts.push(weights.join(', '))

  /** Đơn thật lưu yêu cầu riêng ở `notes`; bản cũ hơn dùng `specialRequests`. */
  const request = booking?.specialRequests || booking?.notes
  if (request) parts.push(String(request).replace(/\s*\n+\s*/g, ' · '))
  return parts.join(' · ').slice(0, 900)
}

/** Đổi một bản ghi đơn của web này thành đúng 9 ô sổ Sa Pa bên mebayluon. */
export function toMebayluonPayload(booking: any, customer?: any): MebayluonBookingPayload {
  return {
    ref: String(booking?.bookingId ?? ''),
    flightDate: dateKeyVN(booking?.flightDate),
    pickupTime: String(booking?.flightTime || booking?.preferredTime || ''),
    /**
     * Điểm đón: ô `pickupLocation` hay bị để trống, khi đó `location` mới là chỗ
     * khách ghi (tên homestay, "Sapa"…). Lấy cái nào có chữ.
     */
    pickupPoint: String(booking?.pickupLocation || booking?.location || ''),
    name: String(customer?.fullName || booking?.customerName || booking?.contactName || ''),
    phone: String(customer?.phone || booking?.phone || ''),
    guests: Number(booking?.numberOfPassengers ?? 0),
    source: booking?.source === 'website' ? 'Website Sa Pa' : String(booking?.source ?? 'Website Sa Pa'),
    note: noteOf(booking),
  }
}

/**
 * Gửi một đơn sang sổ điều hành. Trả về true nếu bên kia nhận.
 * Không ném lỗi ra ngoài trong mọi trường hợp.
 */
export async function pushBookingToMebayluon(booking: any, customer?: any): Promise<boolean> {
  const secret = process.env.MEBAYLUON_INBOUND_SECRET
  if (!secret) return false

  const payload = toMebayluonPayload(booking, customer)
  if (!payload.ref || !payload.flightDate || payload.guests <= 0) {
    console.warn('[mebayluon] bỏ qua đơn thiếu mã / ngày bay / số khách:', payload.ref)
    return false
  }

  const url = process.env.MEBAYLUON_INBOUND_URL || DEFAULT_URL
  try {
    /** Chờ tối đa 8 giây: đồng bộ chậm thì thôi, không giữ luồng gửi thư của khách. */
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 8_000)
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-sapa-secret': secret },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })
    clearTimeout(timer)

    if (!res.ok) {
      console.error(`[mebayluon] đẩy đơn ${payload.ref} thất bại: HTTP ${res.status} ${await res.text()}`)
      return false
    }
    const data = (await res.json().catch(() => ({}))) as { action?: string }
    console.log(`[mebayluon] đơn ${payload.ref} → sổ điều hành: ${data.action ?? 'ok'}`)
    return true
  } catch (err) {
    console.error(`[mebayluon] không đẩy được đơn ${payload.ref}:`, err)
    return false
  }
}
