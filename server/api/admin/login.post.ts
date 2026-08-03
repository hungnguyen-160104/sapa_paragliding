import { connectToDatabase } from '../../utils/db'
import { issueAdminToken } from '../../utils/adminAuth'

// Get admin credentials from env
const defaultAdminUsername = process.env.DEFAULT_ADMIN_USERNAME || 'admin'
const defaultAdminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const username = body?.username?.trim() || ''
    const password = body?.password || ''

    // Không log chi tiết đăng nhập — log cũ in cả độ dài mật khẩu ra console

    // Validate input
    if (!username || !password) {
      return {
        success: false,
        error: 'Username and password are required'
      }
    }

    // Check against env credentials (simple auth)
    if (username === defaultAdminUsername && password === defaultAdminPassword) {
      // Token có chữ ký HMAC + hạn dùng 7 ngày, thay cho base64 thuần
      // (base64 thuần: ai đoán được tên đăng nhập là giả mạo được)
      const token = issueAdminToken(username)
      return {
        success: true,
        message: 'Login successful',
        token,
        admin: {
          username: username,
          role: 'admin'
        }
      }
    }

    // Try database as fallback
    try {
      const { db } = await connectToDatabase()
      const adminsCollection = db.collection('admins')

      // Find admin user in database
      const admin = await adminsCollection.findOne({ username })

      if (admin && admin.password === password) {
        const token = issueAdminToken(username)
        return {
          success: true,
          message: 'Login successful',
          token,
          admin: {
            username: admin.username,
            role: admin.role || 'admin'
          }
        }
      }
    } catch (dbError) {
      console.error('Database error during login:', dbError)
      // Continue to return invalid credentials
    }

    // Invalid credentials
    return {
      success: false,
      error: 'Invalid username or password'
    }

  } catch (error: any) {
    console.error('Login error:', error?.message || error)
    return {
      success: false,
      error: 'Login failed. Please try again.'
    }
  }
})
