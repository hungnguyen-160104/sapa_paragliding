import { TelegramBot } from '../utils/telegram-bot'

export default defineEventHandler(async (event) => {
  try {
    const rawBody = await readBody(event)
    const config = useRuntimeConfig()

    // Hỗ trợ cả { booking: {...} } và {...} format
    const body = rawBody.booking || rawBody

    console.log('[Telegram] Received fields:', Object.keys(body).join(', '))

    // Validate required fields
    if (!body.bookingId || !body.contactName || !body.email) {
      console.error('[Telegram] Missing fields - bookingId:', !!body.bookingId, ', contactName:', !!body.contactName, ', email:', !!body.email)
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required booking fields'
      })
    }

    // Initialize Telegram Bot
    const botToken = config.telegramBotToken
    if (!botToken) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Telegram bot token not configured'
      })
    }

    const telegramBot = new TelegramBot(botToken)

    // Get chat IDs from config
    const customerChatId = body.telegramChatId // Customer's Telegram chat ID
    const adminChatIds = config.telegramAdminChatId // Admin's Telegram chat IDs (comma-separated)

    // Send to customer if chat ID provided
    if (customerChatId) {
      try {
        await telegramBot.sendBookingToCustomer(customerChatId, body)
        console.log(`Booking notification sent to customer: ${customerChatId}`)
      } catch (error) {
        console.error('Failed to send customer notification:', error)
      }
    }

    // Send to all admins (supports multiple chat IDs separated by comma)
    if (adminChatIds) {
      const chatIdList = adminChatIds.split(',').map((id: string) => id.trim()).filter((id: string) => id)
      
      for (const chatId of chatIdList) {
        try {
          await telegramBot.sendBookingToAdmin(chatId, body)
          console.log(`Booking notification sent to admin: ${chatId}`)
        } catch (error) {
          console.error(`Failed to send admin notification to ${chatId}:`, error)
        }
      }
    }

    return {
      success: true,
      message: 'Booking notifications sent via Telegram',
      bookingId: body.bookingId
    }
  } catch (error) {
    console.error('Telegram booking error:', error)

    return {
      success: false,
      error: 'Failed to send Telegram notifications',
      message: error instanceof Error ? error.message : 'Unknown error'
    }
  }
})
