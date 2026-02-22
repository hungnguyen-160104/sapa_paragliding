import nodemailer from 'nodemailer'
import { useRuntimeConfig } from '#imports'

export interface PassengerInfo {
  fullName: string
  dateOfBirth: string
  gender: string
  nationality: string
  weight: number
  passportOrId: string
}

export interface BookingData {
  bookingId: string
  serviceId: string
  serviceName: string
  numberOfPassengers: number
  preferredDate: string
  preferredTime: string
  contactName: string
  email: string
  phone: string
  servicePrice: number
  discount: number
  totalPrice: number
  passengers: PassengerInfo[]
  specialRequests?: string
  selectedOptions: string[]
  pickupLocation?: string
}

function escapeHtml(s: unknown): string {
  return String(s ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function parseEmailList(input: unknown): string[] {
  if (!input) return []
  return String(input)
    .split(/[,\n;]/g)
    .map((s) => s.trim())
    .filter(Boolean)
}

function toVND(n: number): string {
  return (Number(n) || 0).toLocaleString('vi-VN')
}

function safeSelectedOptions(booking: BookingData): string[] {
  return Array.isArray(booking.selectedOptions) ? booking.selectedOptions : []
}

function extractFirstUrl(text?: string): string | null {
  if (!text) return null
  const match = text.match(/https?:\/\/[^\s]+/i)
  return match ? match[0] : null
}

function buildPickupBlock(booking: BookingData): string {
  const selected = safeSelectedOptions(booking)
  const hasTransfer = selected.includes('hotel-transfer')
  const pickupText = (booking.pickupLocation || '').trim()

  if (!hasTransfer) {
    return `📍 <b>ĐÓN</b>: Không`
  }

  const url = extractFirstUrl(pickupText)
  const cleanText = pickupText.replace(/https?:\/\/[^\s]+/gi, '').trim()

  if (url && cleanText) {
    return `📍 <b>ĐÓN</b>: Có<br/>
📍 <b>Địa điểm đón</b>: ${escapeHtml(cleanText)}<br/>
🗺️ <b>Google Maps</b>: <a href="${escapeHtml(url)}">Mở bản đồ</a>`
  }

  if (url && !cleanText) {
    return `📍 <b>ĐÓN</b>: Có<br/>
🗺️ <b>Google Maps</b>: <a href="${escapeHtml(url)}">Mở bản đồ</a>`
  }

  return `📍 <b>ĐÓN</b>: Có<br/>
📍 <b>Địa điểm đón</b>: ${escapeHtml(pickupText || 'Chưa nhập')}`
}

/**
 * ✅ Email gửi KHÁCH: format giống Telegram customer (HTML)
 */
export function formatCustomerEmailHtml(booking: BookingData): string {
  const selected = safeSelectedOptions(booking)

  const discountPerPerson = Number(booking.discount) || 0
  const discountTotal = discountPerPerson * (Number(booking.numberOfPassengers) || 0)
  const discountText =
    discountPerPerson > 0
      ? `-${toVND(discountTotal)} VND (${toVND(discountPerPerson)}/người × ${booking.numberOfPassengers})`
      : 'Không'

  const total = toVND(booking.totalPrice)
  const base = toVND(booking.servicePrice)

  const optionMap: Record<string, string> = {
    'hotel-transfer': '🚐 Đón từ khách sạn',
    drone: '🚁 Quay video bằng drone',
    camera360: '📷 Máy ảnh 360°'
  }

  const selectedOptionsText =
    selected.length > 0 ? selected.map((opt) => optionMap[opt] || opt).join('<br/>') : 'Không có'

  const pickupBlock = buildPickupBlock(booking)

  const html = `
<div style="font-family:Arial,sans-serif;line-height:1.5;font-size:14px">
  <h2>✅ XÁC NHẬN ĐẶT CHỖ</h2>
  <div>🎫 Mã: <b>${escapeHtml(booking.bookingId)}</b></div>
  <div>👤 Tên: <b>${escapeHtml(booking.contactName)}</b></div>
  <div>✈️ <b>Dịch vụ</b>: ${escapeHtml(booking.serviceName)}</div>
  <div>👥 <b>Số khách</b>: ${escapeHtml(booking.numberOfPassengers)}</div>
  <div>📅 <b>Ngày</b>: ${escapeHtml(booking.preferredDate)}</div>
  <div>🕐 <b>Giờ</b>: ${escapeHtml(booking.preferredTime || 'Linh hoạt')}</div>

  <hr/>

  <div><b>🎁 Dịch vụ thêm</b>:</div>
  <div>${selectedOptionsText}</div>

  <br/>
  <div>${pickupBlock}</div>

  <hr/>

  <div><b>💰 Giá</b>:</div>
  <div>• Cơ bản: ${base} VND × ${escapeHtml(booking.numberOfPassengers)}</div>
  <div>• Giảm: ${escapeHtml(discountText)}</div>
  <div>• <b>Tổng: ${total} VND</b></div>

  <hr/>

  <div><b>📞 Liên hệ</b>:</div>
  <div>• Email: ${escapeHtml(booking.email)}</div>
  <div>• SĐT: ${escapeHtml(booking.phone)}</div>

  <hr/>

  <div><b>📝 Yêu cầu</b>: ${escapeHtml(booking.specialRequests || 'Không có')}</div>

  <hr/>

  <div>📌 <b>Tiếp theo</b>: Chúng tôi liên hệ trong 24h • Đến sớm 30’ • Thanh toán tại chỗ</div>
  <div>⚠️ <b>Lưu ý</b>: Giày kín • Đồ thoải mái • Trống 4GB bộ nhớ • Phụ thuộc thời tiết</div>

  <p>Cảm ơn bạn! 🪂</p>
</div>`.trim()

  return `<!doctype html><html><body style="margin:0;padding:16px">${html}</body></html>`
}

export async function sendMail(opts: { to: string | string[]; subject: string; html: string; text?: string }) {
  const config = useRuntimeConfig()
  const user = String(config.emailUser || '')
  const pass = String(config.emailPass || '')
  const from = String(config.mailFrom || user)

  if (!user || !pass) {
    throw createError({ statusCode: 500, statusMessage: 'EMAIL_USER/EMAIL_PASS not configured' })
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: { user, pass }
  })

  await transporter.sendMail({
    from,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
    text: opts.text
  })
}

/**
 * ✅ Gửi email xác nhận cho KHÁCH
 */
export async function sendBookingEmailToCustomer(booking: BookingData) {
  const html = formatCustomerEmailHtml(booking)
  await sendMail({
    to: booking.email,
    subject: `Xác nhận đặt chỗ: ${booking.bookingId}`,
    html
  })
}

/**
 * (Tuỳ chọn) Gửi email thông báo cho ADMIN nhiều gmail
 */
export async function sendBookingEmailToAdmins(booking: BookingData) {
  const config = useRuntimeConfig()
  const adminList = parseEmailList(config.adminEmails)
  if (!adminList.length) return

  const html = formatCustomerEmailHtml(booking) // hoặc bạn tạo formatAdminEmailHtml riêng
  await sendMail({
    to: adminList,
    subject: `NEW BOOKING: ${booking.bookingId}`,
    html
  })
}