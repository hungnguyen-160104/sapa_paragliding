import TelegramBotAPI from 'node-telegram-bot-api'

/**
 * Initialize Telegram Bot with message handlers
 */
export function initTelegramBotHandler(botToken: string): TelegramBotAPI {
    const bot = new TelegramBotAPI(botToken, { polling: true })

    // Handle /start command
    bot.onText(/\/start/, (msg) => {
        const chatId = msg.chat.id
        const firstName = msg.from?.first_name || 'Bạn'

        const welcomeMessage = `
👋 <b>Chào mừng đến Bot Dù Lượn Sapa!</b>

Xin chào ${firstName}! 🪂

Chat ID của bạn: <code>${chatId}</code>

Bot này sẽ gửi cho bạn xác nhận đặt chỗ và cập nhật về các chuyến bay dù lượn của bạn.

<b>Các lệnh có sẵn:</b>
/start - Hiển thị tin nhắn chào mừng
/help - Nhận trợ giúp
/booking - Kiểm tra trạng thái đặt chỗ

Để kiểm tra bot, sử dụng Chat ID của bạn:
<code>node scripts/telegram-bot-test.js ${chatId}</code>
        `.trim()

        bot.sendMessage(chatId, welcomeMessage, { parse_mode: 'HTML' })
            .then(() => {
                console.log(`✅ Welcome message sent to ${firstName} (Chat ID: ${chatId})`)
            })
            .catch((error) => {
                console.error('Error sending welcome message:', error)
            })
    })

    // Handle /help command
    bot.onText(/\/help/, (msg) => {
        const chatId = msg.chat.id

        const helpMessage = `
❓ <b>Trợ Giúp & Thông Tin</b>

<b>Về Bot Này:</b>
Bot này được thiết kế để gửi cho bạn xác nhận đặt chỗ và cập nhật cho Dù Lượn Sapa.

<b>Chat ID của bạn:</b>
<code>${chatId}</code>

<b>Cách Sử Dụng:</b>
1. Đặt chỗ trên trang web của chúng tôi
2. Cung cấp Chat ID Telegram của bạn
3. Bạn sẽ nhận được xác nhận đặt chỗ ở đây

<b>Các Lệnh:</b>
/start - Tin nhắn chào mừng
/help - Tin nhắn trợ giúp này
/booking - Kiểm tra thông tin đặt chỗ

<b>Hỗ Trợ:</b>
Email: sapa.paragliding@gmail.com
Điện thoại: +84 123 456 789
        `.trim()

        bot.sendMessage(chatId, helpMessage, { parse_mode: 'HTML' })
            .catch((error) => {
                console.error('Error sending help message:', error)
            })
    })

    // Handle /booking command
    bot.onText(/\/booking/, (msg) => {
        const chatId = msg.chat.id

        const bookingMessage = `
📋 <b>Thông Tin Đặt Chỗ</b>

Để kiểm tra trạng thái đặt chỗ của bạn, vui lòng cung cấp ID Đặt Chỗ của bạn.

Bạn có thể tìm ID Đặt Chỗ của bạn trong:
- Email xác nhận của bạn
- Tin nhắn xác nhận đặt chỗ của bạn

Khi bạn có ID Đặt Chỗ, vui lòng chia sẻ ở đây và chúng tôi sẽ cung cấp cho bạn trạng thái mới nhất.

<b>Cần Trợ Giúp?</b>
Liên hệ chúng tôi: sapa.paragliding@gmail.com
        `.trim()

        bot.sendMessage(chatId, bookingMessage, { parse_mode: 'HTML' })
            .catch((error) => {
                console.error('Error sending booking message:', error)
            })
    })

    // Handle any other message
    bot.on('message', (msg) => {
        const chatId = msg.chat.id
        const text = msg.text

        // Skip if it's a command (already handled above)
        if (text?.startsWith('/')) {
            return
        }

        const replyMessage = `
👋 <b>Xin chào!</b>

Tôi là Bot Dù Lượn Sapa. Tôi có thể giúp bạn với:

<b>Các Lệnh Có Sẵn:</b>
/start - Tin nhắn chào mừng
/help - Nhận trợ giúp
/booking - Kiểm tra trạng thái đặt chỗ

Vui lòng sử dụng bất kỳ lệnh nào trong số này!
        `.trim()

        bot.sendMessage(chatId, replyMessage, { parse_mode: 'HTML' })
            .catch((error) => {
                console.error('Error sending reply:', error)
            })
    })

    // Handle errors
    bot.on('error', (error) => {
        console.error('❌ Telegram Bot Error:', error)
    })

    // Handle polling errors
    bot.on('polling_error', (error) => {
        console.error('❌ Telegram Polling Error:', error)
    })

    console.log('✅ Telegram Bot Handler initialized with polling')
    return bot
}

/**
 * Stop the bot
 */
export function stopTelegramBot(bot: TelegramBotAPI): void {
    bot.stopPolling()
    console.log('🛑 Telegram Bot stopped')
}
