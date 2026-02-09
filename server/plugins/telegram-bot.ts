import { initTelegramBotHandler } from '../utils/telegram-bot-handler'

export default defineNitroPlugin(() => {
    const config = useRuntimeConfig()
    const botToken = config.telegramBotToken

    if (!botToken) {
        console.warn('⚠️  TELEGRAM_BOT_TOKEN not configured. Bot will not start.')
        return
    }

    try {
        // Note: Polling mode is disabled in development due to network constraints
        // The bot will only respond to API calls from the booking system
        // To enable polling, use: const bot = initTelegramBotHandler(botToken)
        
        console.log('✅ Telegram Bot API ready (polling disabled in dev mode)')
        console.log('📱 Bot will send messages via API when bookings are submitted')
    } catch (error) {
        console.error('❌ Failed to initialize Telegram Bot:', error)
    }
})
