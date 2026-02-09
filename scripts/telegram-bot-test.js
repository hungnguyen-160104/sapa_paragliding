/**
 * Telegram Bot Test Script
 * 
 * Usage: node scripts/telegram-bot-test.js YOUR_CHAT_ID
 */

import TelegramBotAPI from 'node-telegram-bot-api'

// Your bot token
const BOT_TOKEN = '8521544567:AAHDVR3dVpV89jZVwIuNinIkyh4bQG0bjD4'
const bot = new TelegramBotAPI(BOT_TOKEN)

/**
 * Get bot information
 */
async function getBotInfo() {
  try {
    console.log('🤖 Getting bot information...')
    const response = await bot.getMe()
    console.log('✅ Bot Info:', response)
    return response
  } catch (error) {
    console.error('❌ Error getting bot info:', error.message)
  }
}

/**
 * Send a test message
 */
async function sendTestMessage(chatId, message) {
  try {
    console.log(`📤 Sending message to chat ${chatId}...`)
    const response = await bot.sendMessage(chatId, message, { parse_mode: 'HTML' })
    console.log('✅ Message sent successfully!')
    return response
  } catch (error) {
    console.error('❌ Error sending message:', error.message)
  }
}

/**
 * Send a test booking message
 */
async function sendTestBooking(chatId) {
  const bookingMessage = `
📋 <b>BOOKING CONFIRMATION</b>

🎫 <b>Booking ID:</b> SAPA-TEST-001
👤 <b>Name:</b> Test Customer

✈️ <b>SERVICE DETAILS</b>
━━━━━━━━━━━━━━━━━━━━━━━━
📌 Service: Experience the Thrill of Paragliding in Sapa
👥 Passengers: 2
📅 Date: 2024-11-15
🕐 Time: 08:00 AM

💰 <b>PRICING</b>
━━━━━━━━━━━━━━━━━━━━━━━━
Base Price: 1,500,000 VND
Discount: 5%
<b>Total: 2,850,000 VND</b>

📞 <b>CONTACT INFO</b>
━━━━━━━━━━━━━━━━━━━━━━━━
Email: test@example.com
Phone: +84 123 456 789

✅ <b>NEXT STEPS</b>
━━━━━━━━━━━━━━━━━━━━━━━━
1️⃣ We will contact you within 24 hours
2️⃣ Weather check 24 hours before flight
3️⃣ Arrive 30 minutes early
4️⃣ Payment on-site before flight

Thank you for booking with Sapa Paragliding! 🪂
  `.trim()

  await sendTestMessage(chatId, bookingMessage)
}

/**
 * Send message with inline buttons
 */
async function sendMessageWithButtons(chatId) {
  try {
    console.log(`📤 Sending message with buttons to chat ${chatId}...`)
    const response = await bot.sendMessage(chatId, '🎉 <b>Test Message with Buttons</b>\n\nClick a button below:', {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [
            { text: '✅ Confirm', callback_data: 'confirm_test' },
            { text: '❌ Reject', callback_data: 'reject_test' }
          ],
          [
            { text: '📧 Email', url: 'mailto:test@example.com' },
            { text: '📞 Call', url: 'tel:+84123456789' }
          ]
        ]
      }
    })
    console.log('✅ Message with buttons sent successfully!')
    return response
  } catch (error) {
    console.error('❌ Error sending message with buttons:', error.message)
  }
}

/**
 * Main test function
 */
async function main() {
  console.log('🚀 Telegram Bot Test Script\n')
  console.log('Bot Token:', BOT_TOKEN)
  console.log('Bot URL: https://t.me/Sapa_booking_bot\n')

  // Get bot info
  await getBotInfo()
  console.log()

  // Get chat ID from command line arguments
  const chatId = process.argv[2]

  if (!chatId) {
    console.log('\n📋 HOW TO GET YOUR CHAT ID:')
    console.log('1. Open Telegram and search for: @Sapa_booking_bot')
    console.log('2. Click "Start" button or send /start command')
    console.log('3. The bot will respond with your Chat ID')
    console.log('4. Copy that Chat ID and run:\n')
    console.log('   node scripts/telegram-bot-test.js YOUR_CHAT_ID\n')
    console.log('⚠️  Example: node scripts/telegram-bot-test.js 987654321')
    console.log('⚠️  Note: Do NOT use the bot token ID (8521544567)\n')
    return
  }

  if (chatId === '8521544567') {
    console.log('\n❌ ERROR: You used the bot token ID, not your chat ID!')
    console.log('📋 Please follow these steps:')
    console.log('1. Open Telegram and search for: @Sapa_booking_bot')
    console.log('2. Click "Start" button or send /start command')
    console.log('3. The bot will respond with YOUR Chat ID (different number)')
    console.log('4. Copy that Chat ID and run:\n')
    console.log('   node scripts/telegram-bot-test.js YOUR_CHAT_ID\n')
    return
  }

  console.log(`\n📤 Testing with Chat ID: ${chatId}\n`)

  // Send test messages
  await sendTestMessage(chatId, '👋 <b>Hello!</b> This is a test message from Sapa Paragliding Bot.')
  console.log()

  await sendTestBooking(chatId)
  console.log()

  await sendMessageWithButtons(chatId)
  console.log()

  console.log('✅ All tests completed!')
  console.log('\n💡 Next steps:')
  console.log('1. Check your Telegram for the messages')
  console.log('2. Update .env.local with your chat ID as TELEGRAM_ADMIN_CHAT_ID')
  console.log('3. Integrate the bot into your booking system')
}

// Run the script
main().catch(console.error)
