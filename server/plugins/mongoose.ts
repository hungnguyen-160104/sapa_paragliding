/**
 * Mongoose Connection Plugin
 * Khởi động kết nối MongoDB ngay khi server (hoặc một instance serverless mới)
 * bắt đầu chạy, để request đầu tiên không phải trả giá cho việc bắt tay TLS.
 *
 * BẮT BUỘC đi qua ensureConnection() của server/utils/db.ts chứ không được tự
 * gọi mongoose.connect(). Nitro KHÔNG await plugin bất đồng bộ, nên request có
 * thể ập tới lúc kết nối còn dở. Nếu promise ở đây không dùng chung với
 * utils/db.ts thì request đó thấy readyState 2 nhưng connectionPromise null và
 * mở thêm một kết nối thứ hai chồng lên — đúng nguyên nhân làm /api/posts trả
 * 500 lúc cold start, khiến /posts và trang chủ render ra HTML không bài nào.
 */
import mongoose from 'mongoose'
import { ensureConnection } from '../utils/db'

export default defineNitroPlugin(async () => {
  const config = useRuntimeConfig()

  const mongoUri = String(config.mongodbUri || process.env.MONGODB_URI || 'mongodb://localhost:27017/sapa_paragliding')

  // Skip connection if using placeholder URI
  if (mongoUri.includes('USERNAME:PASSWORD') || mongoUri.includes('<password>')) {
    console.warn('⚠️ MongoDB URI not configured. Please set MONGODB_URI in .env file.')
    console.warn('📝 Admin features requiring database will not work until configured.')
    return
  }

  // Đăng ký trước khi await: ensureConnection() gán promise một cách đồng bộ,
  // nên mọi request tới trong lúc đang kết nối đều bám vào đúng promise này.
  const connecting = ensureConnection()

  // Connection event handlers — gắn ngay, không chờ kết nối xong, để không bỏ
  // sót sự kiện 'error' phát ra trong chính lần kết nối đầu tiên.
  mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB connection error:', err)
  })

  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️ MongoDB disconnected. Attempting to reconnect...')
  })

  mongoose.connection.on('reconnected', () => {
    console.log('✅ MongoDB reconnected')
  })

  try {
    await connecting
    console.log('✅ MongoDB connected successfully via Mongoose')
  } catch (error) {
    // ensureConnection() đã log chi tiết và tự xoá promise hỏng, nên request
    // sau sẽ thử kết nối lại. Không throw: để app còn phục vụ trang tĩnh.
    console.warn('⚠️ App will continue without database. Admin features may not work.', error)
  }
})
