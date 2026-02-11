import TelegramBotAPI from 'node-telegram-bot-api'

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

export class TelegramBot {
    private bot: TelegramBotAPI

    constructor(botToken: string) {
        this.bot = new TelegramBotAPI(botToken)
    }

/**
 * Format booking message for customer (ngắn gọn, đủ ý)
 */
private formatCustomerMessage(booking: BookingData): string {
  const discountPercent = Math.round(booking.discount * 100)
  const total = booking.totalPrice.toLocaleString('vi-VN')
  const base = booking.servicePrice.toLocaleString('vi-VN')
  const optionMap: Record<string, string> = {
    'hotel-transfer': '🚐 Đón từ khách sạn',
    'drone': '🚁 Quay video bằng drone',
    'camera360': '📷 Máy ảnh 360°'
  }
  const selectedOptionsText =
    booking.selectedOptions?.length
      ? booking.selectedOptions.map(opt => optionMap[opt] || opt).join('\n')
      : 'Không có'
  return `
✅ <b>XÁC NHẬN ĐẶT CHỖ</b>
🎫 Mã: <b>${booking.bookingId}</b>
👤 Tên: <b>${booking.contactName}</b>
🆔 Dịch vụ ID: <b>${booking.serviceId}</b>
✈️ <b>Dịch vụ</b>: ${booking.serviceName}
👥 <b>Số khách</b>: ${booking.numberOfPassengers}
📅 <b>Ngày</b>: ${booking.preferredDate}
🕐 <b>Giờ</b>: ${booking.preferredTime || 'Linh hoạt'}
🎁 <b>Dịch vụ thêm</b>:
${selectedOptionsText}

📍 <b>Đón tại</b>: ${booking.pickupLocation || 'Không có'}

💰 <b>Giá</b>:
• Cơ bản: ${base} VND
• Giảm: ${discountPercent}%
• <b>Tổng: ${total} VND</b>

📞 <b>Liên hệ</b>:
• Email: ${booking.email}
• SĐT: ${booking.phone}

📝 <b>Yêu cầu</b>: ${booking.specialRequests || 'Không có'}

📌 <b>Tiếp theo</b>: Chúng tôi liên hệ trong 24h • Đến sớm 30’ • Thanh toán tại chỗ
⚠️ <b>Lưu ý</b>: Giày kín • Đồ thoải mái • Trống 4GB bộ nhớ • Phụ thuộc thời tiết

Cảm ơn bạn! 🪂
  `.trim()
}

/**
 * Format booking message for admin (theo format mới)
 */
private formatAdminMessage(booking: BookingData): string {
  const discountPercent = Math.round(booking.discount * 100)
  const totalFormatted = (booking.totalPrice / 1000).toFixed(0) + 'k'
  const baseFormatted = (booking.servicePrice / 1000).toFixed(0) + 'k'
  const now = new Date().toLocaleString('vi-VN', { 
    timeZone: 'Asia/Ho_Chi_Minh',
    hour12: false,
    hour: '2-digit',
    minute: '2-digit', 
    second: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
  // Check options
  const hasDrone = booking.selectedOptions.includes('drone') ? 1 : 0
  const hasCamera360 = booking.selectedOptions.includes('camera360') ? 1 : 0
  const hasTransfer = booking.selectedOptions.includes('hotel-transfer') ? 1 : 0
  // Passenger details
  const passengerDetails = booking.passengers?.length
    ? booking.passengers
        .map((p, i) => 
          `${i + 1}. ${p.fullName} | DOB: ${p.dateOfBirth} | ${p.gender} | ${p.nationality} | ${p.weight}kg | ID: ${p.passportOrId}`
        )
        .join('\n')
    : 'Không có'
  // Price calculation
  const dronePrice = hasDrone ? '300k x 1' : '300k x 0'
  const cam360Price = hasCamera360 ? '500k x 1' : '500k x 0'
  const transferPrice = hasTransfer ? '100k x 1' : '100k x 0'
  return `🔔 <b>NEW BOOKING:</b> ${booking.bookingId}
🆔 ${booking.serviceId}	⏰ ${now}
👤 <b>CONTACT</b>
${booking.contactName}
${booking.email}	${booking.phone}
———
Điểm bay: ${booking.serviceName}
Số lượng: ${booking.numberOfPassengers}
Ngày: ${booking.preferredDate}	${booking.preferredTime || 'Linh hoạt'}
🚁 Flycam: ${hasDrone}
Cam360: ${hasCamera360}
📍ĐÓN: ${hasTransfer ? 'Có' : 'Không'}
———
👥 <b>Thông tin khách</b>
${passengerDetails}
———
💰 <b>GIÁ</b>
Giá bay: ${baseFormatted} × ${booking.numberOfPassengers}
Đưa đón: 100k x ${hasTransfer ? booking.numberOfPassengers : 0}
Flycam: ${dronePrice}
Cam360: ${cam360Price}
Giảm giá: ${discountPercent}%
———
<b>Tổng: ${totalFormatted}</b>
📝 <b>Note:</b> ${booking.specialRequests || 'Không'}`
}


    /**
     * Send booking information to customer
     */
    async sendBookingToCustomer(chatId: string | number, booking: BookingData): Promise<any> {
        const message = this.formatCustomerMessage(booking)
        return this.sendMessage(chatId, message)
    }

    /**
     * Send booking information to admin
     */
    async sendBookingToAdmin(chatId: string | number, booking: BookingData): Promise<any> {
        const message = this.formatAdminMessage(booking)
        return this.sendMessage(chatId, message)
    }

    /**
     * Send a text message with HTML formatting
     */
    async sendMessage(chatId: string | number, text: string): Promise<any> {
        try {
            const response = await this.bot.sendMessage(chatId, text, { parse_mode: 'HTML' })
            return response
        } catch (error) {
            console.error('Error sending Telegram message:', error)
            throw error
        }
    }

    /**
     * Send a photo with caption
     */
    async sendPhoto(chatId: string | number, photoUrl: string, caption: string): Promise<any> {
        try {
            const response = await this.bot.sendPhoto(chatId, photoUrl, {
                caption: caption,
                parse_mode: 'HTML'
            })
            return response
        } catch (error) {
            console.error('Error sending Telegram photo:', error)
            throw error
        }
    }

    /**
     * Send inline keyboard with buttons
     */
    async sendMessageWithKeyboard(
        chatId: string | number,
        text: string,
        buttons: Array<Array<{ text: string; url?: string; callback_data?: string }>>
    ): Promise<any> {
        try {
            const response = await this.bot.sendMessage(chatId, text, {
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: buttons
                }
            })
            return response
        } catch (error) {
            console.error('Error sending Telegram message with keyboard:', error)
            throw error
        }
    }

    /**
     * Get bot info
     */
    async getMe(): Promise<any> {
        try {
            const response = await this.bot.getMe()
            return response
        } catch (error) {
            console.error('Error getting bot info:', error)
            throw error
        }
    }

    /**
     * Set bot commands
     */
    async setCommands(commands: Array<{ command: string; description: string }>): Promise<any> {
        try {
            const response = await this.bot.setMyCommands(commands)
            return response
        } catch (error) {
            console.error('Error setting bot commands:', error)
            throw error
        }
    }

    /**
     * Send booking confirmation with action buttons
     */
    async sendBookingWithActions(
        chatId: string | number,
        booking: BookingData,
        isAdmin: boolean = false
    ): Promise<any> {
        const message = isAdmin
            ? this.formatAdminMessage(booking)
            : this.formatCustomerMessage(booking)

        const buttons = isAdmin
            ? [
                [
                    { text: '✅ Xác nhận', callback_data: `confirm_${booking.bookingId}` },
                    { text: '❌ Từ chối', callback_data: `reject_${booking.bookingId}` }
                ],
                [{ text: '📞 Liên hệ khách hàng', url: `tel:${booking.phone}` }]
            ]
            : [
                [{ text: '📧 Hỗ trợ Email', url: 'mailto:sapa.paragliding@gmail.com' }],
                [{ text: '📞 Gọi cho chúng tôi', url: 'tel:+84123456789' }]
            ]

        return this.sendMessageWithKeyboard(chatId, message, buttons)
    }
}

/**
 * Initialize Telegram Bot with token from environment
 */
export function initTelegramBot(): TelegramBot {
    const botToken = process.env.TELEGRAM_BOT_TOKEN
    if (!botToken) {
        throw new Error('TELEGRAM_BOT_TOKEN environment variable is not set')
    }
    return new TelegramBot(botToken)
}
