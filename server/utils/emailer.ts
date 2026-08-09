import nodemailer from 'nodemailer'
import { TAKEOFF_MAP_URL, LANDING_MAP_URL, TAKEOFF_NAME } from '../../shared/flying-site'
import { EMAIL_STRINGS, type EmailLocale } from './email-i18n'
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
  /** Số lượng cho dịch vụ tính theo lượt: drone, camera360. */
  serviceQuantities?: Record<string, number>
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

/**
 * Đơn giá dịch vụ tuỳ chọn — khớp với bảng ở
 * components/booking/Step1ServiceSelection.vue.
 *
 * perPerson = true  : tính theo ĐẦU KHÁCH (đón trả khách sạn)
 * perPerson = false : tính theo LƯỢT      (flycam, camera 360)
 * Phân biệt này quyết định nhân với số khách hay với số lượng khách chọn.
 */
export const OPTION_PRICES: Record<
  string,
  { labelVi: string; labelEn: string; price: number; perPerson: boolean }
> = {
  'hotel-transfer': {
    labelVi: '🚐 Đón trả khách sạn',
    labelEn: '🚐 Hotel transfer',
    price: 100000,
    perPerson: true
  },
  drone: { labelVi: '🚁 Quay flycam', labelEn: '🚁 Drone video', price: 300000, perPerson: false },
  camera360: { labelVi: '📷 Camera 360°', labelEn: '📷 360° camera', price: 500000, perPerson: false }
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
/**
 * Bảng màu email khách — lấy từ bộ nhận diện Sapa Paragliding.
 *   blue  #194d9b : màu chữ thương hiệu "DÙ LƯỢN SAPA"
 *   red   #f02424 : màu chủ đạo của logo
 */
const EC = {
  ink: '#1C2930',
  soft: '#5B6B7A',
  line: '#DCE7F3',
  bg: '#F5F7FA',
  blue: '#194d9b',
  blueDark: '#12386f',
  red: '#f02424',
  green: '#16A34A',
  redBg: '#FFF1F1'
}

/** Tiêu đề mục: chữ hoa, giãn chữ, gạch chân — dùng chung mọi mục. */
function emailSectionTitle(text: string): string {
  return `<tr><td style="padding:22px 0 8px;">
    <div style="font-size:13px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:${EC.blueDark};border-bottom:2px solid ${EC.line};padding-bottom:6px;">${escapeHtml(text)}</div>
  </td></tr>`
}

/** Một dòng "nhãn — giá trị" trong bảng thông tin. */
function emailInfoRow(label: string, value: string): string {
  return `<tr>
    <td width="42%" style="padding:7px 0;font-size:14px;color:${EC.soft};border-bottom:1px solid ${EC.line};">${escapeHtml(label)}</td>
    <td style="padding:7px 0;font-size:14px;font-weight:600;color:${EC.ink};border-bottom:1px solid ${EC.line};">${value || '—'}</td>
  </tr>`
}

/** Một dòng tiền trong bảng giá; giảm giá hiển thị màu xanh lá. */
function emailMoneyRow(label: string, amount: string, opts?: { detail?: string; discount?: boolean }): string {
  const color = opts?.discount ? EC.green : EC.ink
  return `<tr>
    <td style="padding:7px 0;font-size:14px;color:${color};border-bottom:1px solid ${EC.line};">
      ${escapeHtml(label)}${opts?.detail ? `<br/><span style="font-size:12px;color:${EC.soft};">${escapeHtml(opts.detail)}</span>` : ''}
    </td>
    <td style="padding:7px 0;font-size:14px;font-weight:700;text-align:right;white-space:nowrap;color:${color};border-bottom:1px solid ${EC.line};">${escapeHtml(amount)}</td>
  </tr>`
}

/**
 * Che bớt số giấy tờ: giữ 3 ký tự cuối, phần còn lại thay bằng dấu chấm.
 * Email đi qua nhiều máy chủ trung gian nên không nên mang số đầy đủ.
 */
function maskIdNumber(raw: unknown): string {
  const value = String(raw ?? '').trim()
  if (value.length <= 3) return value || '—'
  return '•'.repeat(Math.min(value.length - 3, 9)) + value.slice(-3)
}

/**
 * Email xác nhận gửi KHÁCH.
 *
 * Bố cục theo mẫu email xác nhận của mebayluon.com: thẻ trắng bo góc trên nền
 * xám, dải tiêu đề gradient có logo và mã đặt chỗ, rồi từng mục có tiêu đề
 * gạch chân — Thông tin chuyến bay / Danh sách khách bay / Chi tiết giá /
 * Dịch vụ chọn thêm / Chuẩn bị trước khi bay / Yêu cầu đặc biệt / Việc tiếp
 * theo / Liên hệ.
 *
 * Viết bằng bảng HTML và style nội tuyến — bắt buộc với email: Gmail và
 * Outlook loại bỏ thẻ <style>, và không hỗ trợ flexbox/grid.
 */
/**
 * Email xác nhận gửi KHÁCH — viết bằng đúng ngôn ngữ khách đã đặt lịch.
 *
 * Khách đặt trên bản tiếng Nga mà nhận email tiếng Việt thì coi như không nhận
 * được gì: không soát được ngày giờ, không biết phải mang theo gì. Toàn bộ chữ
 * lấy từ EMAIL_STRINGS, mặc định về tiếng Anh nếu ngôn ngữ lạ.
 */
/**
 * Giới tính lưu trong đơn là mã 'male'/'female' cho khỏi phụ thuộc ngôn ngữ.
 * Đưa ra email thì phải dịch, không thì khách Nga mở email tiếng Nga vẫn thấy
 * cột giới tính ghi "male". Mã lạ thì trả nguyên về (dữ liệu đơn cũ).
 */
function genderLabel(raw: unknown, locale: EmailLocale): string {
  const value = String(raw ?? '').trim().toLowerCase()
  if (value === 'male') return EMAIL_STRINGS[locale].genderMale
  if (value === 'female') return EMAIL_STRINGS[locale].genderFemale
  return String(raw ?? '')
}

export function formatCustomerEmailHtml(booking: BookingData, locale: EmailLocale = 'en'): string {
  const s = EMAIL_STRINGS[locale]
  const selected = safeSelectedOptions(booking)
  const passengerCount = Number(booking.numberOfPassengers) || 0

  const discountPerPerson = Number(booking.discount) || 0
  const discountTotal = discountPerPerson * passengerCount

  /** Nhãn dịch vụ thêm theo ngôn ngữ của khách. */
  const optionLabel = (opt: string): string => {
    if (opt === 'hotel-transfer') return s.optHotelTransfer
    if (opt === 'drone') return s.optDrone
    if (opt === 'camera360') return s.optCamera360
    return escapeHtml(opt)
  }

  // ----- Danh sách khách bay -----
  const passengers = Array.isArray(booking.passengers) ? booking.passengers : []
  const th = (label: string) =>
    `<th align="left" style="padding:6px 8px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.4px;color:${EC.soft};border-bottom:1px solid ${EC.line};">${escapeHtml(label)}</th>`
  const td = (value: string, bold = false) =>
    `<td style="padding:7px 8px;font-size:13px;color:${EC.ink};border-bottom:1px solid ${EC.line};${bold ? 'font-weight:600;' : ''}">${value || '—'}</td>`

  const passengerRows = passengers
    .map(
      (p, i) => `<tr>
        <td style="padding:7px 8px;font-size:13px;color:${EC.blue};font-weight:700;border-bottom:1px solid ${EC.line};">${i + 1}</td>
        ${td(escapeHtml(p.fullName), true)}
        ${td(escapeHtml(p.dateOfBirth))}
        ${td(escapeHtml(genderLabel(p.gender, locale)))}
        ${td(p.weight ? `${escapeHtml(p.weight)} kg` : '')}
        ${td(escapeHtml(p.nationality))}
        ${td(escapeHtml(maskIdNumber(p.passportOrId)))}
      </tr>`
    )
    .join('')

  const passengerBlock = passengers.length
    ? `<tr><td style="padding-top:6px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
          <tr><th style="padding:6px 8px;border-bottom:1px solid ${EC.line};"></th>${th(s.thName)}${th(s.thDob)}${th(s.thGender)}${th(s.thWeight)}${th(s.thNationality)}${th(s.thId)}</tr>
          ${passengerRows}
        </table>
        <div style="margin-top:6px;font-size:12px;color:${EC.soft};">${escapeHtml(s.idMasked)}</div>
      </td></tr>`
    : ''

  // ----- Dịch vụ chọn thêm -----
  // Dịch vụ đón khách sạn ghi kèm luôn TÊN khách sạn khách đã nhập —
  // "Đón từ khách sạn Pao's Sapa Leisure" rõ hơn hẳn "Đón từ khách sạn",
  // và khách tự soát lại được địa chỉ mình khai có đúng không.
  const quantities = booking.serviceQuantities || {}

  /** Số lượng của một dịch vụ: theo đầu khách, hoặc theo số lượt khách chọn. */
  const optionQty = (opt: string): number => {
    const info = OPTION_PRICES[opt]
    if (!info) return 1
    return info.perPerson ? passengerCount : Number(quantities[opt]) || 1
  }

  const servicesBlock = selected.length
    ? selected
        .map((opt) => {
          // Số lượng tô đỏ để khách soát lại đúng thứ mình đã chọn.
          const qty = ` <b style="color:${EC.red};">x${optionQty(opt)}</b>`
          const place =
            opt === 'hotel-transfer' && booking.pickupLocation
              ? ` <span style="color:${EC.blueDark};font-weight:600;">${escapeHtml(booking.pickupLocation)}</span>`
              : ''
          return `<tr><td style="padding:5px 0;font-size:14px;color:${EC.ink};">${optionLabel(opt)}${qty}${place}</td></tr>`
        })
        .join('')
    : `<tr><td style="padding:5px 0;font-size:14px;color:${EC.soft};">${escapeHtml(s.noExtras)}</td></tr>`

  // ----- Điểm đón / điểm hẹn -----
  const hasTransfer = selected.includes('hotel-transfer')
  const pickupRow = hasTransfer
    ? emailInfoRow(s.pickupPoint, escapeHtml(booking.pickupLocation || s.pickupDefault))
    : emailInfoRow(s.meetingPoint, `${escapeHtml(TAKEOFF_NAME)} — ${escapeHtml(s.meetingSelfArrive)}`)
  const pickupNote = hasTransfer
    ? `<tr><td colspan="2" style="padding:8px 0 0;">
        <div style="background:${EC.redBg};border-radius:8px;padding:9px 12px;font-size:13px;color:${EC.blueDark};line-height:1.5;">${escapeHtml(s.pickupNote)}</div>
      </td></tr>`
    : ''

  const nextSteps = [s.next1, s.next2, s.next3, s.next4, s.next5]

  const guides: Array<[string, string]> = [
    [s.guideClothingLabel, s.guideClothingText],
    [s.guideBringLabel, s.guideBringText],
    [s.guideAvoidLabel, s.guideAvoidText]
  ]

  const html = `<!doctype html>
<html lang="${locale}">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:${EC.bg};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:${EC.bg};padding:24px 12px;">
<tr><td align="center">

<table width="640" cellpadding="0" cellspacing="0" style="max-width:640px;background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 4px 18px rgba(0,0,0,.06);">

  <tr><td style="background:linear-gradient(135deg,${EC.blue} 0%,${EC.blueDark} 100%);padding:22px 28px;color:#ffffff;">
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      <td width="76" valign="middle" style="padding-right:14px;">
        <img src="https://www.paraglidingsapa.com/images/Sapa_logo_mark.png" alt="Sapa Paragliding" width="72" style="display:block;width:72px;border:0;"/>
      </td>
      <td valign="middle">
        <div style="font-size:11px;letter-spacing:2px;font-weight:700;opacity:.9;">SAPA PARAGLIDING</div>
        <div style="font-size:22px;font-weight:800;margin-top:3px;">${escapeHtml(s.headerTitle)}</div>
        <div style="margin-top:8px;font-size:13px;opacity:.92;">${escapeHtml(s.bookingIdLabel)}
          <span style="font-family:ui-monospace,Menlo,Consolas,monospace;font-size:16px;font-weight:800;letter-spacing:1px;">${escapeHtml(booking.bookingId)}</span>
        </div>
      </td>
    </tr></table>
  </td></tr>

  <tr><td style="padding:24px 28px 28px;">
    <table width="100%" cellpadding="0" cellspacing="0">

      <tr><td style="font-size:16px;color:${EC.ink};line-height:1.6;">
        <strong>${escapeHtml(s.greeting.replace('{name}', String(booking.contactName ?? '')))}</strong><br/>
        ${escapeHtml(s.intro)}
      </td></tr>

      ${emailSectionTitle(s.secFlight)}
      <tr><td>
        <table width="100%" cellpadding="0" cellspacing="0">
          ${emailInfoRow(
            s.takeoffPoint,
            `<a href="${TAKEOFF_MAP_URL}" style="color:${EC.blue};text-decoration:none;font-weight:700;">${TAKEOFF_NAME} 📍</a>`
          )}
          ${emailInfoRow(
            s.landingPoint,
            `<a href="${LANDING_MAP_URL}" style="color:${EC.blue};text-decoration:none;font-weight:700;">${escapeHtml(s.landingName)} 📍</a>`
          )}
          <!--
            Dùng tên gói theo NGÔN NGỮ CỦA EMAIL, không dùng booking.serviceName.
            serviceName bị chốt lại ở bước 1 theo ngôn ngữ khách đang xem lúc
            đó, nên khách bắt đầu đặt bằng tiếng Việt rồi đổi sang tiếng Nga sẽ
            nhận email tiếng Nga mà riêng dòng gói bay lại là tiếng Việt.
          -->
          ${emailInfoRow(s.package, escapeHtml(s.packageName))}
          ${emailInfoRow(s.flightDate, escapeHtml(booking.preferredDate))}
          ${emailInfoRow(s.flightTime, escapeHtml(booking.preferredTime || s.timeFlexible))}
          ${emailInfoRow(s.guestCount, `${escapeHtml(passengerCount)} ${escapeHtml(s.guestUnit)}`)}
          ${pickupRow}
          ${pickupNote}
        </table>
      </td></tr>

      ${passengers.length ? emailSectionTitle(s.secPassengers) : ''}
      ${passengerBlock}

      ${emailSectionTitle(s.secPrice)}
      <tr><td>
        <table width="100%" cellpadding="0" cellspacing="0">
          ${emailMoneyRow(s.priceFlight, `${toVND(Number(booking.servicePrice) * passengerCount)} đ`, {
            detail: `${toVND(booking.servicePrice)} đ × ${passengerCount} ${s.unitGuest}`
          })}
          ${selected
            .map((opt) => {
              const info = OPTION_PRICES[opt]
              if (!info) return ''
              const qty = optionQty(opt)
              const unit = info.perPerson ? s.unitGuest : s.unitTime
              return emailMoneyRow(
                `${optionLabel(opt)} x${qty}`,
                `${toVND(info.price * qty)} đ`,
                { detail: `${toVND(info.price)} đ × ${qty} ${unit}` }
              )
            })
            .join('')}
          ${
            discountPerPerson > 0
              ? emailMoneyRow(s.groupDiscount, `-${toVND(discountTotal)} đ`, {
                  detail: `${toVND(discountPerPerson)} đ × ${passengerCount} ${s.unitGuest}`,
                  discount: true
                })
              : ''
          }
          <tr>
            <td style="padding:12px 0 0;font-size:16px;font-weight:800;color:${EC.ink};">${escapeHtml(s.total)}</td>
            <td style="padding:12px 0 0;font-size:20px;font-weight:800;text-align:right;white-space:nowrap;color:${EC.red};">${toVND(booking.totalPrice)} đ</td>
          </tr>
          <tr><td colspan="2" style="padding:10px 0 0;">
            <div style="background:${EC.redBg};border-radius:8px;padding:9px 12px;font-size:13px;color:${EC.blueDark};line-height:1.5;">${escapeHtml(s.payNote)}</div>
          </td></tr>
        </table>
      </td></tr>

      ${emailSectionTitle(s.secExtras)}
      <tr><td><table width="100%" cellpadding="0" cellspacing="0">${servicesBlock}</table></td></tr>

      ${emailSectionTitle(s.secPrepare)}
      <tr><td>
        <table width="100%" cellpadding="0" cellspacing="0">
          ${guides
            .map(
              ([label, text]) => `<tr>
                <td width="34%" valign="top" style="padding:6px 0;font-size:13px;font-weight:600;color:${EC.ink};">${escapeHtml(label)}</td>
                <td valign="top" style="padding:6px 0;font-size:13px;color:${EC.soft};line-height:1.6;">${escapeHtml(text)}</td>
              </tr>`
            )
            .join('')}
        </table>
      </td></tr>

      ${
        booking.specialRequests
          ? `${emailSectionTitle(s.secRequests)}
             <tr><td style="padding:4px 0;">
               <div style="background:${EC.bg};border-left:3px solid ${EC.blue};border-radius:0 8px 8px 0;padding:10px 14px;font-size:14px;color:${EC.ink};line-height:1.6;">${escapeHtml(booking.specialRequests)}</div>
             </td></tr>`
          : ''
      }

      ${emailSectionTitle(s.secNext)}
      <tr><td>
        <table width="100%" cellpadding="0" cellspacing="0">
          ${nextSteps
            .map(
              (step, i) => `<tr>
                <td width="26" valign="top" style="padding:5px 0;font-size:13px;font-weight:800;color:${EC.blue};">${i + 1}.</td>
                <td style="padding:5px 0;font-size:14px;color:${EC.ink};line-height:1.6;">${escapeHtml(step)}</td>
              </tr>`
            )
            .join('')}
        </table>
      </td></tr>

      ${emailSectionTitle(s.secContact)}
      <tr><td style="font-size:14px;color:${EC.ink};line-height:1.9;">
        ${escapeHtml(s.contactIntro)}<br/>
        📞 Ms. Judy — <a href="tel:+84386887489" style="color:${EC.blue};text-decoration:none;font-weight:600;">+84 386 887 489</a><br/>
        📞 Mr. August — <a href="tel:+84522794999" style="color:${EC.blue};text-decoration:none;font-weight:600;">+84 522 794 999</a><br/>
        ✉️ <a href="mailto:sapa.paragliding@gmail.com" style="color:${EC.blue};text-decoration:none;">sapa.paragliding@gmail.com</a>
      </td></tr>

    </table>
  </td></tr>

  <tr><td style="background:${EC.bg};padding:16px 28px;text-align:center;font-size:12px;color:${EC.soft};line-height:1.7;">
    <a href="https://www.paraglidingsapa.com" style="color:${EC.blue};text-decoration:none;font-weight:600;">www.paraglidingsapa.com</a><br/>
    © ${new Date().getFullYear()} Sapa Paragliding. ${escapeHtml(s.rightsReserved)}
  </td></tr>

</table>

</td></tr>
</table>
</body></html>`

  return html
}

/**
 * Email gửi ADMIN - Tiếng Việt
 */
/**
 * Email gửi QUẢN LÝ NỘI BỘ — tiếng Việt, thiết kế để LƯỚT MẮT LÀ RA THÔNG TIN.
 *
 * Thứ tự sắp theo việc nhân viên cần làm, không theo thứ tự form khách điền:
 *   1. Ngày giờ bay + số khách  — xếp lịch
 *   2. Đón hay không, đón ở đâu — điều xe
 *   3. Liên hệ                  — gọi xác nhận
 *   4. Dịch vụ thêm             — chuẩn bị thiết bị
 *   5. Danh sách khách          — cân nặng để chọn dù
 *   6. Giá                      — thu tiền
 *   7. Yêu cầu đặc biệt         — đọc kỹ, để cuối
 *
 * Quy ước trình bày: nhãn xám nhỏ, giá trị đen đậm — mắt bắt vào giá trị
 * trước. Việc cần làm (điều xe, thiết bị) tô nền màu để nổi khỏi phần còn lại.
 *
 * KHÔNG đính kèm ảnh vé — quản lý cần dữ liệu để xử lý, không cần vé khách.
 */
export function formatAdminEmailHtml(booking: BookingData): string {
  const selected = safeSelectedOptions(booking)
  const quantities = booking.serviceQuantities || {}
  const passengerCount = Number(booking.numberOfPassengers) || 0

  const discountPerPerson = Number(booking.discount) || 0
  const discountTotal = discountPerPerson * passengerCount

  const C = {
    ink: '#111827',
    soft: '#6B7280',
    line: '#E5E7EB',
    blue: '#194d9b',
    red: '#f02424',
    amberBg: '#FFFBEB',
    amberLine: '#FDE68A',
    greenBg: '#F0FDF4',
    greenLine: '#BBF7D0',
    grayBg: '#F9FAFB'
  }

  /** Tiêu đề mục: chữ hoa nhỏ, giãn chữ, gạch chân — mốc để mắt nhảy. */
  const section = (text: string) =>
    `<tr><td style="padding:18px 0 6px;">
      <div style="font-size:11px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:${C.blue};border-bottom:2px solid ${C.line};padding-bottom:5px;">${escapeHtml(text)}</div>
    </td></tr>`

  /** Ô số liệu lớn dùng cho ngày giờ / số khách. */
  const statCell = (label: string, value: string, accent = C.ink) =>
    `<td width="50%" valign="top" style="padding:0 6px;">
      <div style="background:${C.grayBg};border-radius:8px;padding:12px 14px;">
        <div style="font-size:10px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;color:${C.soft};">${escapeHtml(label)}</div>
        <div style="margin-top:3px;font-size:18px;font-weight:800;color:${accent};">${value}</div>
      </div>
    </td>`

  const hasTransfer = selected.includes('hotel-transfer')

  // Điều xe là việc PHẢI làm -> tô nền vàng khi có đón, xanh khi không cần.
  const pickupBox = hasTransfer
    ? `<div style="background:${C.amberBg};border:1px solid ${C.amberLine};border-radius:8px;padding:12px 14px;">
         <div style="font-size:10px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;color:#92400E;">🚐 Cần đón <span style="color:${C.red};font-size:13px;">x${passengerCount}</span></div>
         <div style="margin-top:3px;font-size:15px;font-weight:700;color:${C.ink};">${escapeHtml(
           booking.pickupLocation || '⚠️ CHƯA NHẬP ĐỊA ĐIỂM'
         )}</div>
       </div>`
    : `<div style="background:${C.greenBg};border:1px solid ${C.greenLine};border-radius:8px;padding:12px 14px;">
         <div style="font-size:10px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;color:#166534;">🚐 Đón</div>
         <div style="margin-top:3px;font-size:15px;font-weight:700;color:${C.ink};">Không — khách tự tới điểm bay</div>
       </div>`

  // Dịch vụ thêm: bỏ đón (đã có ô riêng), dịch vụ theo lượt kèm số lượng.
  const extras = selected
    .filter((opt) => opt !== 'hotel-transfer')
    .map((opt) => {
      const qty = Number(quantities[opt]) || 1
      // Số lượng tô ĐỎ ĐẬM: nhân viên đếm thiết bị cần mang theo, đây là
      // con số dễ đọc sót nhất trong email.
      const qtyTag = `<b style="color:${C.red};">x${qty}</b>`
      if (opt === 'drone') return `🚁 Quay flycam ${qtyTag}`
      if (opt === 'camera360') return `📷 Camera 360° ${qtyTag}`
      return getOptionLabel(opt, 'vi')
    })

  const extrasHtml = extras.length
    ? `<div style="background:${C.grayBg};border-radius:8px;padding:10px 14px;font-size:15px;color:${C.ink};line-height:1.9;">${extras.join(
        '<br/>'
      )}</div>`
    : `<div style="font-size:14px;color:${C.soft};">Không có</div>`

  // Mỗi khách một dòng. Cân nặng in đậm màu đỏ vì đó là số phi công cần nhất.
  const passengersHtml = booking.passengers?.length
    ? booking.passengers
        .map(
          (p, i) =>
            `<tr>
               <td width="20" valign="top" style="padding:6px 0;font-size:14px;font-weight:800;color:${C.blue};">${i + 1}.</td>
               <td style="padding:6px 0;font-size:14px;color:${C.ink};border-bottom:1px solid ${C.line};">
                 <b>${escapeHtml(p.fullName)}</b>
                 <span style="color:${C.soft};"> · ${escapeHtml(p.dateOfBirth)} · ${escapeHtml(
                   genderLabel(p.gender, 'vi')
                 )} · ${escapeHtml(p.nationality)} · ${escapeHtml(p.passportOrId)} · </span>
                 <b style="color:${C.red};">${escapeHtml(p.weight)}kg</b>
               </td>
             </tr>`
        )
        .join('')
    : `<tr><td style="font-size:14px;color:${C.soft};">Không có danh sách hành khách</td></tr>`

  /**
   * Chi tiết giá: tách từng khoản y như bước 4 khách nhìn thấy, thay vì chỉ
   * một con số gộp. Nhân viên thu tiền phải đối chiếu được từng dòng, và khi
   * khách thắc mắc thì có cơ sở giải thích ngay.
   *
   * Đơn giá dịch vụ thêm khớp với components/booking/Step1ServiceSelection.vue.
   */
  const priceLines: Array<{ label: string; detail: string; amount: string; discount?: boolean }> = []

  priceLines.push({
    label: '<b>Giá gói bay</b>',
    detail: `${toVND(booking.servicePrice)} đ × ${passengerCount} khách`,
    amount: `${toVND(Number(booking.servicePrice) * passengerCount)} đ`
  })

  for (const opt of selected) {
    const info = OPTION_PRICES[opt]
    if (!info) continue

    const qty = info.perPerson ? passengerCount : Number(quantities[opt]) || 1
    const unitLabel = info.perPerson ? 'khách' : 'lượt'

    priceLines.push({
      label: `${info.labelVi} <b style="color:${C.red};">x${qty}</b>`,
      detail: `${toVND(info.price)} đ × ${qty} ${unitLabel}`,
      amount: `${toVND(info.price * qty)} đ`
    })
  }

  if (discountPerPerson > 0) {
    priceLines.push({
      label: '<b>Giảm giá nhóm</b>',
      detail: `${toVND(discountPerPerson)} đ × ${passengerCount} khách`,
      amount: `-${toVND(discountTotal)} đ`,
      discount: true
    })
  }

  const html = `<!doctype html>
<html lang="vi"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#F3F4F6;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F3F4F6;padding:16px 10px;">
<tr><td align="center">
<table width="620" cellpadding="0" cellspacing="0" style="max-width:620px;background:#ffffff;border-radius:12px;overflow:hidden;">

  <tr><td style="background:${C.blue};padding:16px 20px;color:#ffffff;">
    <div style="font-size:11px;font-weight:700;letter-spacing:1.5px;opacity:.85;">ĐƠN ĐẶT CHỖ MỚI</div>
    <div style="margin-top:4px;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:22px;font-weight:800;letter-spacing:1px;">${escapeHtml(
      booking.bookingId
    )}</div>
    <div style="margin-top:4px;font-size:13px;opacity:.9;">${escapeHtml(EMAIL_STRINGS.vi.packageName)}</div>
  </td></tr>

  <tr><td style="padding:16px 14px 20px;">
    <table width="100%" cellpadding="0" cellspacing="0">

      <tr><td>
        <table width="100%" cellpadding="0" cellspacing="0"><tr>
          ${statCell(
            'Ngày giờ bay',
            `${escapeHtml(booking.preferredDate)} · ${escapeHtml(booking.preferredTime || 'Giờ linh hoạt')}`,
            C.red
          )}
          ${statCell('Số khách', `${passengerCount} người`)}
        </tr></table>
      </td></tr>

      <tr><td style="padding:12px 6px 0;">${pickupBox}</td></tr>

      ${section('Liên hệ')}
      <tr><td style="padding:0 6px;font-size:15px;color:${C.ink};line-height:1.7;">
        <b>${escapeHtml(booking.contactName)}</b>
        <span style="color:${C.soft};"> - </span>
        <a href="tel:${escapeHtml(String(booking.phone).replace(/\s+/g, ''))}" style="color:${C.blue};text-decoration:none;font-weight:700;">${escapeHtml(booking.phone)}</a>
        <span style="color:${C.soft};"> - </span>
        <a href="mailto:${escapeHtml(booking.email)}" style="color:${C.blue};text-decoration:none;">${escapeHtml(booking.email)}</a>
      </td></tr>

      ${section('Dịch vụ thêm')}
      <tr><td style="padding:0 6px;">${extrasHtml}</td></tr>

      ${section(`Danh sách khách bay (${passengerCount})`)}
      <tr><td style="padding:0 6px;">
        <table width="100%" cellpadding="0" cellspacing="0">${passengersHtml}</table>
      </td></tr>

      ${section('Chi tiết giá')}
      <tr><td style="padding:0 6px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          ${priceLines
            .map(
              (line) => `<tr>
                <td style="padding:5px 0;font-size:14px;color:${line.discount ? '#16A34A' : C.ink};border-bottom:1px solid ${C.line};">
                  ${line.label}
                  <br/><span style="font-size:12px;color:${C.soft};">${escapeHtml(line.detail)}</span>
                </td>
                <td style="padding:5px 0;font-size:14px;font-weight:700;text-align:right;white-space:nowrap;color:${line.discount ? '#16A34A' : C.ink};border-bottom:1px solid ${C.line};">${line.amount}</td>
              </tr>`
            )
            .join('')}
          <tr>
            <td style="padding:8px 0 0;font-size:15px;font-weight:800;color:${C.ink};border-top:2px solid ${C.line};">TỔNG THU</td>
            <td style="padding:8px 0 0;font-size:20px;font-weight:800;text-align:right;color:${C.red};border-top:2px solid ${C.line};">${toVND(
              booking.totalPrice
            )} đ</td>
          </tr>
        </table>
      </td></tr>

      ${
        booking.specialRequests
          ? `${section('⚠️ Yêu cầu đặc biệt')}
             <tr><td style="padding:0 6px;">
               <div style="background:${C.amberBg};border-left:4px solid ${C.red};border-radius:0 8px 8px 0;padding:12px 14px;font-size:15px;font-weight:600;color:${C.ink};line-height:1.6;">${escapeHtml(
                 booking.specialRequests
               )}</div>
             </td></tr>`
          : `${section('Yêu cầu đặc biệt')}
             <tr><td style="padding:0 6px;font-size:14px;color:${C.soft};">Không có</td></tr>`
      }

    </table>
  </td></tr>
</table>
</td></tr>
</table>
</body></html>`

  return html
}

/**
 * Đổi data URL ("data:image/png;base64,...") thành tệp đính kèm.
 * Trả null nếu chuỗi rỗng hoặc sai định dạng — email vẫn gửi bình thường,
 * chỉ là không có vé kèm theo. Không để việc trình duyệt khách vẽ hỏng ảnh
 * làm mất luôn email xác nhận.
 */
export function dataUrlToAttachment(
  dataUrl: unknown,
  filename: string
): { filename: string; content: Buffer; contentType: string } | null {
  const raw = String(dataUrl ?? '')
  const match = raw.match(/^data:(image\/[a-z+]+);base64,(.+)$/i)
  if (!match) return null

  try {
    return { filename, content: Buffer.from(match[2]!, 'base64'), contentType: match[1]! }
  } catch {
    return null
  }
}

export async function sendMail(opts: {
  to: string | string[]
  subject: string
  html: string
  text?: string
  attachments?: Array<{ filename: string; content: Buffer; contentType?: string }>
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
    text: opts.text,
    attachments: opts.attachments
  })
}

/**
 * Gửi email xác nhận cho KHÁCH — theo ngôn ngữ khách đã dùng khi đặt.
 */
export async function sendBookingEmailToCustomer(booking: BookingData, locale: EmailLocale = 'en') {
  const html = formatCustomerEmailHtml(booking, locale)

  // KHÔNG đính kèm ảnh vé: ảnh do trình duyệt khách vẽ nên chất lượng phụ
  // thuộc máy khách, dễ hỏng hoặc thiếu. Toàn bộ thông tin vé đã nằm trong
  // nội dung email này, và khách vẫn tải được vé ở trang xác nhận.
  await sendMail({
    to: booking.email,
    subject: `${EMAIL_STRINGS[locale].subject} - ${booking.bookingId}`,
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

  // KHÔNG đính vé: quản lý cần dữ liệu để xử lý đơn, không cần vé của khách.
  await sendMail({
    to: adminList,
    subject: `Đặt bay - ID: ${booking.bookingId}`,
    html
  })
}