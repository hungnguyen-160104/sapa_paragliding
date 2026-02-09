import { TelegramBot } from '../utils/telegram-bot'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const config = useRuntimeConfig()

    // Validate required fields
    if (!body.bookingId || !body.contactName || !body.email) {
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
    const adminChatId = config.telegramAdminChatId // Admin's Telegram chat ID

    // Send to customer if chat ID provided
    if (customerChatId) {
      try {
        await telegramBot.sendBookingToCustomer(customerChatId, body)
        console.log(`Booking notification sent to customer: ${customerChatId}`)
      } catch (error) {
        console.error('Failed to send customer notification:', error)
      }
    }

    // Send to admin
    if (adminChatId) {
      try {
        await telegramBot.sendBookingToAdmin(adminChatId, body)
        console.log(`Booking notification sent to admin: ${adminChatId}`)
      } catch (error) {
        console.error('Failed to send admin notification:', error)
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
