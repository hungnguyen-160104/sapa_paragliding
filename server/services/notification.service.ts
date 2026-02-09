/**
 * Notification Service
 * Handles all outbound notifications (Telegram, Email)
 */
import nodemailer from 'nodemailer'

// ============================================
// TYPES
// ============================================

interface TelegramBookingData {
  bookingId: string
  customerName: string
  email: string
  phone: string
  serviceName: string
  flightDate: Date
  flightTime: string
  numberOfPassengers: number
  totalPrice: number
  pickupLocation?: string
  specialRequests?: string
}

interface EmailBookingData {
  to: string
  customerName: string
  bookingId: string
  serviceName: string
  flightDate: Date
  flightTime: string
  totalPrice: number
}

// ============================================
// NOTIFICATION SERVICE CLASS
// ============================================

export class NotificationService {
  private telegramBotToken: string
  private telegramChatId: string
  private emailTransporter: nodemailer.Transporter | null = null
  
  constructor() {
    this.telegramBotToken = process.env.TELEGRAM_BOT_TOKEN || ''
    this.telegramChatId = process.env.TELEGRAM_CHAT_ID || ''
    
    // Initialize email transporter if config exists
    if (process.env.SMTP_HOST) {
      this.emailTransporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      })
    }
  }
  
  // ==========================================
  // TELEGRAM NOTIFICATIONS
  // ==========================================
  
  /**
   * Send booking notification to Telegram
   */
  async sendTelegramBookingNotification(data: TelegramBookingData): Promise<boolean> {
    if (!this.telegramBotToken || !this.telegramChatId) {
      console.warn('Telegram not configured, skipping notification')
      return false
    }
    
    const message = this.formatTelegramBookingMessage(data)
    
    try {
      const response = await fetch(
        `https://api.telegram.org/bot${this.telegramBotToken}/sendMessage`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: this.telegramChatId,
            text: message,
            parse_mode: 'HTML',
          }),
        }
      )
      
      if (!response.ok) {
        throw new Error(`Telegram API error: ${response.statusText}`)
      }
      
      console.log(`✅ Telegram notification sent for booking: ${data.bookingId}`)
      return true
      
    } catch (error) {
      console.error('❌ Failed to send Telegram notification:', error)
      return false
    }
  }
  
  /**
   * Send custom Telegram message
   */
  async sendTelegramMessage(message: string, chatId?: string): Promise<boolean> {
    const targetChatId = chatId || this.telegramChatId
    
    if (!this.telegramBotToken || !targetChatId) {
      return false
    }
    
    try {
      const response = await fetch(
        `https://api.telegram.org/bot${this.telegramBotToken}/sendMessage`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: targetChatId,
            text: message,
            parse_mode: 'HTML',
          }),
        }
      )
      
      return response.ok
    } catch {
      return false
    }
  }
  
  // ==========================================
  // EMAIL NOTIFICATIONS
  // ==========================================
  
  /**
   * Send booking confirmation email
   */
  async sendBookingConfirmationEmail(data: EmailBookingData): Promise<boolean> {
    if (!this.emailTransporter) {
      console.warn('Email not configured, skipping confirmation email')
      return false
    }
    
    try {
      const html = this.formatBookingConfirmationEmail(data)
      
      await this.emailTransporter.sendMail({
        from: process.env.EMAIL_FROM || 'noreply@sapaparagliding.com',
        to: data.to,
        subject: `Booking Confirmation - ${data.bookingId}`,
        html,
      })
      
      console.log(`✅ Confirmation email sent to: ${data.to}`)
      return true
      
    } catch (error) {
      console.error('❌ Failed to send confirmation email:', error)
      return false
    }
  }
  
  /**
   * Send custom email
   */
  async sendEmail(
    to: string,
    subject: string,
    html: string
  ): Promise<boolean> {
    if (!this.emailTransporter) {
      return false
    }
    
    try {
      await this.emailTransporter.sendMail({
        from: process.env.EMAIL_FROM || 'noreply@sapaparagliding.com',
        to,
        subject,
        html,
      })
      return true
    } catch {
      return false
    }
  }
  
  // ==========================================
  // MESSAGE FORMATTERS
  // ==========================================
  
  private formatTelegramBookingMessage(data: TelegramBookingData): string {
    const flightDate = new Date(data.flightDate).toLocaleDateString('vi-VN')
    const priceFormatted = new Intl.NumberFormat('vi-VN').format(data.totalPrice)
    
    return `
🪂 <b>BOOKING MỚI</b> 🪂

📋 <b>Mã đặt chỗ:</b> <code>${data.bookingId}</code>

👤 <b>Khách hàng:</b>
• Tên: ${data.customerName}
• Email: ${data.email}
• SĐT: ${data.phone}

✈️ <b>Chi tiết chuyến bay:</b>
• Dịch vụ: ${data.serviceName}
• Ngày bay: ${flightDate}
• Giờ bay: ${data.flightTime}
• Số khách: ${data.numberOfPassengers} người

💰 <b>Tổng tiền:</b> ${priceFormatted} VNĐ

${data.pickupLocation ? `📍 <b>Điểm đón:</b> ${data.pickupLocation}` : ''}
${data.specialRequests ? `📝 <b>Yêu cầu đặc biệt:</b> ${data.specialRequests}` : ''}

⏰ ${new Date().toLocaleString('vi-VN')}
    `.trim()
  }
  
  private formatBookingConfirmationEmail(data: EmailBookingData): string {
    const flightDate = new Date(data.flightDate).toLocaleDateString('vi-VN')
    const priceFormatted = new Intl.NumberFormat('vi-VN').format(data.totalPrice)
    
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .booking-id { background: #fff; padding: 15px; border-left: 4px solid #667eea; margin: 20px 0; }
    .details { background: #fff; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🪂 Xác nhận đặt chỗ</h1>
      <p>Sapa Paragliding</p>
    </div>
    <div class="content">
      <p>Xin chào <strong>${data.customerName}</strong>,</p>
      <p>Cảm ơn bạn đã đặt chỗ với Sapa Paragliding. Dưới đây là thông tin đặt chỗ của bạn:</p>
      
      <div class="booking-id">
        <strong>Mã đặt chỗ:</strong> ${data.bookingId}
      </div>
      
      <div class="details">
        <h3>Chi tiết chuyến bay</h3>
        <p><strong>Dịch vụ:</strong> ${data.serviceName}</p>
        <p><strong>Ngày bay:</strong> ${flightDate}</p>
        <p><strong>Giờ bay:</strong> ${data.flightTime}</p>
        <p><strong>Tổng tiền:</strong> ${priceFormatted} VNĐ</p>
      </div>
      
      <p>Chúng tôi sẽ liên hệ với bạn để xác nhận chi tiết.</p>
      <p>Nếu có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi.</p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Sapa Paragliding. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `.trim()
  }
}

// ============================================
// SINGLETON EXPORT
// ============================================

export const notificationService = new NotificationService()
