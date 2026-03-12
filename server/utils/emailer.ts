import nodemailer from 'nodemailer'
import { useRuntimeConfig, createError } from '#imports'

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

function getOptionLabel(option: string, lang: 'en' | 'vi'): string {
  const optionMap: Record<string, { en: string; vi: string }> = {
    'hotel-transfer': {
      en: '🚐 Hotel transfer',
      vi: '🚐 Đón từ khách sạn'
    },
    drone: {
      en: '🚁 Drone video',
      vi: '🚁 Quay video bằng drone'
    },
    camera360: {
      en: '📷 360° camera',
      vi: '📷 Máy ảnh 360°'
    }
  }

  return optionMap[option]?.[lang] || escapeHtml(option)
}

function buildPickupBlock(booking: BookingData, lang: 'en' | 'vi'): string {
  const selected = safeSelectedOptions(booking)
  const hasTransfer = selected.includes('hotel-transfer')
  const pickupText = (booking.pickupLocation || '').trim()
  const url = extractFirstUrl(pickupText)
  const cleanText = pickupText.replace(/https?:\/\/[^\s]+/gi, '').trim()

  if (lang === 'en') {
    if (!hasTransfer) {
      return `📍 <b>PICKUP</b>: No`
    }

    if (url && cleanText) {
      return `📍 <b>PICKUP</b>: Yes<br/>
📍 <b>Pickup location</b>: ${escapeHtml(cleanText)}<br/>
🗺️ <b>Google Maps</b>: <a href="${escapeHtml(url)}">Open map</a>`
    }

    if (url && !cleanText) {
      return `📍 <b>PICKUP</b>: Yes<br/>
🗺️ <b>Google Maps</b>: <a href="${escapeHtml(url)}">Open map</a>`
    }

    return `📍 <b>PICKUP</b>: Yes<br/>
📍 <b>Pickup location</b>: ${escapeHtml(pickupText || 'Not provided')}`
  }

  if (!hasTransfer) {
    return `📍 <b>ĐÓN</b>: Không`
  }

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
 * Email gửi KHÁCH HÀNG - English
 */
export function formatCustomerEmailHtml(booking: BookingData): string {
  const selected = safeSelectedOptions(booking)

  const discountPerPerson = Number(booking.discount) || 0
  const discountTotal = discountPerPerson * (Number(booking.numberOfPassengers) || 0)
  const discountText =
    discountPerPerson > 0
      ? `-${toVND(discountTotal)} VND (${toVND(discountPerPerson)}/person × ${booking.numberOfPassengers})`
      : 'None'

  const total = toVND(booking.totalPrice)
  const base = toVND(booking.servicePrice)

  const selectedOptionsText =
    selected.length > 0 ? selected.map((opt) => getOptionLabel(opt, 'en')).join('<br/>') : 'None'

  const pickupBlock = buildPickupBlock(booking, 'en')

  const html = `
<div style="font-family:Arial,sans-serif;line-height:1.5;font-size:14px">
  <h2>✅ BOOKING CONFIRMATION</h2>
  <div>🎫 Booking ID: <b>${escapeHtml(booking.bookingId)}</b></div>
  <div>👤 Name: <b>${escapeHtml(booking.contactName)}</b></div>
  <div>✈️ <b>Service</b>: ${escapeHtml(booking.serviceName)}</div>
  <div>👥 <b>Passengers</b>: ${escapeHtml(booking.numberOfPassengers)}</div>
  <div>📅 <b>Date</b>: ${escapeHtml(booking.preferredDate)}</div>
  <div>🕐 <b>Time</b>: ${escapeHtml(booking.preferredTime || 'Flexible')}</div>

  <hr/>

  <div><b>🎁 Extra services</b>:</div>
  <div>${selectedOptionsText}</div>

  <br/>
  <div>${pickupBlock}</div>

  <hr/>

  <div><b>💰 Price</b>:</div>
  <div>• Base price: ${base} VND × ${escapeHtml(booking.numberOfPassengers)}</div>
  <div>• Discount: ${escapeHtml(discountText)}</div>
  <div>• <b>Total: ${total} VND</b></div>

  <hr/>

  <div><b>📞 Contact</b>:</div>
  <div>• Email: ${escapeHtml(booking.email)}</div>
  <div>• Phone: ${escapeHtml(booking.phone)}</div>

  <hr/>

  <div><b>📝 Special requests</b>: ${escapeHtml(booking.specialRequests || 'None')}</div>

  <hr/>

  <div>📌 <b>What happens next</b>: We will contact you within 24 hours • Please arrive 30 minutes early • Payment on site</div>
  <div>⚠️ <b>Notes</b>: Closed-toe shoes • Comfortable clothes • At least 4GB free storage • Subject to weather conditions</div>

  <p>Thank you! 🪂</p>
</div>`.trim()

  return `<!doctype html><html><body style="margin:0;padding:16px">${html}</body></html>`
}

/**
 * Email gửi ADMIN - Tiếng Việt
 */
export function formatAdminEmailHtml(booking: BookingData): string {
  const selected = safeSelectedOptions(booking)

  const discountPerPerson = Number(booking.discount) || 0
  const discountTotal = discountPerPerson * (Number(booking.numberOfPassengers) || 0)
  const discountText =
    discountPerPerson > 0
      ? `-${toVND(discountTotal)} VND (${toVND(discountPerPerson)}/người × ${booking.numberOfPassengers})`
      : 'Không'

  const total = toVND(booking.totalPrice)
  const base = toVND(booking.servicePrice)

  const selectedOptionsText =
    selected.length > 0 ? selected.map((opt) => getOptionLabel(opt, 'vi')).join('<br/>') : 'Không có'

  const pickupBlock = buildPickupBlock(booking, 'vi')

  const passengersHtml =
    booking.passengers?.length > 0
      ? booking.passengers
          .map((p, index) => {
            return `
<div style="margin-bottom:12px;padding:10px;border:1px solid #ddd;border-radius:6px">
  <div><b>Hành khách ${index + 1}</b></div>
  <div>• Họ tên: ${escapeHtml(p.fullName)}</div>
  <div>• Ngày sinh: ${escapeHtml(p.dateOfBirth)}</div>
  <div>• Giới tính: ${escapeHtml(p.gender)}</div>
  <div>• Quốc tịch: ${escapeHtml(p.nationality)}</div>
  <div>• Cân nặng: ${escapeHtml(p.weight)} kg</div>
  <div>• Passport/CCCD: ${escapeHtml(p.passportOrId)}</div>
</div>`.trim()
          })
          .join('')
      : '<div>Không có danh sách hành khách</div>'

  const html = `
<div style="font-family:Arial,sans-serif;line-height:1.5;font-size:14px">
  <h2>📩 ĐƠN ĐẶT CHỖ MỚI</h2>
  <div>🎫 Mã booking: <b>${escapeHtml(booking.bookingId)}</b></div>
  <div>🆔 Service ID: <b>${escapeHtml(booking.serviceId)}</b></div>
  <div>✈️ <b>Dịch vụ</b>: ${escapeHtml(booking.serviceName)}</div>
  <div>👤 <b>Người liên hệ</b>: ${escapeHtml(booking.contactName)}</div>
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
  <div>• Giá cơ bản: ${base} VND × ${escapeHtml(booking.numberOfPassengers)}</div>
  <div>• Giảm giá: ${escapeHtml(discountText)}</div>
  <div>• <b>Tổng tiền: ${total} VND</b></div>

  <hr/>

  <div><b>📞 Thông tin liên hệ</b>:</div>
  <div>• Email: ${escapeHtml(booking.email)}</div>
  <div>• SĐT: ${escapeHtml(booking.phone)}</div>

  <hr/>

  <div><b>📝 Yêu cầu đặc biệt</b>: ${escapeHtml(booking.specialRequests || 'Không có')}</div>

  <hr/>

  <div><b>🧍 Danh sách hành khách</b>:</div>
  <div style="margin-top:8px">${passengersHtml}</div>
</div>`.trim()

  return `<!doctype html><html><body style="margin:0;padding:16px">${html}</body></html>`
}

export async function sendMail(opts: {
  to: string | string[]
  subject: string
  html: string
  text?: string
}) {
  const config = useRuntimeConfig()
  const user = String(config.emailUser || '')
  const pass = String(config.emailPass || '')
  const from = String(config.mailFrom || user)

  if (!user || !pass) {
    throw createError({
      statusCode: 500,
      statusMessage: 'EMAIL_USER/EMAIL_PASS not configured'
    })
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
 * Gửi email xác nhận cho KHÁCH - English
 */
export async function sendBookingEmailToCustomer(booking: BookingData) {
  const html = formatCustomerEmailHtml(booking)

  await sendMail({
    to: booking.email,
    subject: `Booking Confirmation: ${booking.bookingId}`,
    html
  })
}

/**
 * Gửi email thông báo cho ADMIN - Tiếng Việt
 */
export async function sendBookingEmailToAdmins(booking: BookingData) {
  const config = useRuntimeConfig()
  const adminList = parseEmailList(config.adminEmails)

  if (!adminList.length) return

  const html = formatAdminEmailHtml(booking)

  await sendMail({
    to: adminList,
    subject: `ĐƠN ĐẶT CHỖ MỚI: ${booking.bookingId}`,
    html
  })
}