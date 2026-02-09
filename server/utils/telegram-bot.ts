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
     * Format booking message for customer
     */
    private formatCustomerMessage(booking: BookingData): string {
        const discountPercent = Math.round(booking.discount * 100)
        const priceFormatted = booking.totalPrice.toLocaleString('vi-VN')
        const basePriceFormatted = booking.servicePrice.toLocaleString('vi-VN')
        const selectedOptionsText = booking.selectedOptions.length > 0 
            ? booking.selectedOptions.map((opt: string) => {
                const optionMap: { [key: string]: string } = {
                    'hotel-transfer': '🚐 Đón từ khách sạn',
                    'drone': '🚁 Quay video bằng drone',
                    'camera360': '📷 Máy ảnh 360°'
                }
                return optionMap[opt] || opt
            }).join('\n') 
            : 'Không có'

        return `
📋 <b>XÁC NHẬN ĐẶT CHỖ</b>

🎫 <b>Mã Đặt Chỗ:</b> ${booking.bookingId}
👤 <b>Tên:</b> ${booking.contactName}
🆔 <b>ID Dịch vụ:</b> ${booking.serviceId}

✈️ <b>CHI TIẾT DỊCH VỤ</b>
━━━━━━━━━━━━━━━━━━━━━━━━
📌 Dịch vụ: ${booking.serviceName}
👥 Số hành khách: ${booking.numberOfPassengers}
📅 Ngày: ${booking.preferredDate}
🕐 Giờ: ${booking.preferredTime || 'Linh hoạt'}

🎁 <b>DỊCH VỤ THÊM</b>
━━━━━━━━━━━━━━━━━━━━━━━━
${selectedOptionsText}

📍 <b>ĐỊA ĐIỂM ĐÓN</b>
━━━━━━━━━━━━━━━━━━━━━━━━
${booking.pickupLocation || 'Không có'}

💰 <b>GIÁ CẢ</b>
━━━━━━━━━━━━━━━━━━━━━━━━
Giá cơ bản: ${basePriceFormatted} VND
Giảm giá: ${discountPercent}%
<b>Tổng cộng: ${priceFormatted} VND</b>

📞 <b>THÔNG TIN LIÊN HỆ</b>
━━━━━━━━━━━━━━━━━━━━━━━━
Email: ${booking.email}
Điện thoại: ${booking.phone}

📝 <b>YÊU CẦU ĐẶC BIỆT</b>
━━━━━━━━━━━━━━━━━━━━━━━━
${booking.specialRequests || 'Không có'}

✅ <b>BƯỚC TIẾP THEO</b>
━━━━━━━━━━━━━━━━━━━━━━━━
1️⃣ Chúng tôi sẽ liên hệ trong 24 giờ
2️⃣ Kiểm tra thời tiết 24 giờ trước chuyến bay
3️⃣ Đến sớm 30 phút
4️⃣ Thanh toán tại chỗ trước chuyến bay

⚠️ <b>LƯU Ý</b>
━━━━━━━━━━━━━━━━━━━━━━━━
• Mặc quần áo thể thao thoải mái
• Bắt buộc đi giày kín
• Dung lượng điện thoại trống 4GB cho ảnh
• Chuyến bay phụ thuộc vào thời tiết

Cảm ơn bạn đã đặt chỗ tại Dù Lượn Sapa! 🪂
    `.trim()
    }

    /**
     * Format booking message for admin
     */
    private formatAdminMessage(booking: BookingData): string {
        const discountPercent = Math.round(booking.discount * 100)
        const priceFormatted = booking.totalPrice.toLocaleString('vi-VN')
        const basePriceFormatted = booking.servicePrice.toLocaleString('vi-VN')
        const selectedOptionsText = booking.selectedOptions.length > 0 
            ? booking.selectedOptions.map((opt: string) => {
                const optionMap: { [key: string]: string } = {
                    'hotel-transfer': '🚐 Đón từ khách sạn',
                    'drone': '🚁 Quay video bằng drone',
                    'camera360': '📷 Máy ảnh 360°'
                }
                return optionMap[opt] || opt
            }).join('\n') 
            : 'Không có'

        const passengerDetails = booking.passengers
            .map((p, i) => `
${i + 1}. ${p.fullName}
   Ngày sinh: ${p.dateOfBirth} | Giới tính: ${p.gender}
   Quốc tịch: ${p.nationality} | Cân nặng: ${p.weight}kg
   ID: ${p.passportOrId}`)
            .join('\n')

        return `
🔔 <b>ĐẶT CHỖ MỚI NHẬN ĐƯỢC</b>

🎫 <b>Mã Đặt Chỗ:</b> ${booking.bookingId}
🆔 <b>ID Dịch vụ:</b> ${booking.serviceId}
⏰ <b>Thời gian:</b> ${new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}

👤 <b>THÔNG TIN KHÁCH HÀNG</b>
━━━━━━━━━━━━━━━━━━━━━━━━
Tên: ${booking.contactName}
Email: ${booking.email}
Điện thoại: ${booking.phone}

✈️ <b>CHI TIẾT DỊCH VỤ</b>
━━━━━━━━━━━━━━━━━━━━━━━━
Dịch vụ: ${booking.serviceName}
Số hành khách: ${booking.numberOfPassengers}
Ngày ưa thích: ${booking.preferredDate}
Giờ ưa thích: ${booking.preferredTime || 'Linh hoạt'}

🎁 <b>DỊCH VỤ THÊM</b>
━━━━━━━━━━━━━━━━━━━━━━━━
${selectedOptionsText}

📍 <b>ĐỊA ĐIỂM ĐÓN</b>
━━━━━━━━━━━━━━━━━━━━━━━━
${booking.pickupLocation || 'Không có'}

👥 <b>CHI TIẾT HÀNH KHÁCH</b>
━━━━━━━━━━━━━━━━━━━━━━━━
${passengerDetails}

💰 <b>GIÁ CẢ</b>
━━━━━━━━━━━━━━━━━━━━━━━━
Giá cơ bản: ${basePriceFormatted} VND × ${booking.numberOfPassengers}
Giảm giá: ${discountPercent}%
<b>Tổng cộng: ${priceFormatted} VND</b>

📝 <b>YÊU CẦU ĐẶC BIỆT</b>
━━━━━━━━━━━━━━━━━━━━━━━━
${booking.specialRequests || 'Không có'}

⚡ <b>CẦN HÀNH ĐỘNG</b>
Liên hệ khách hàng trong 24 giờ để xác nhận!
    `.trim()
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
