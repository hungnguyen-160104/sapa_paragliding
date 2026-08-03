import { createHmac, timingSafeEqual } from 'node:crypto'
import { createError, getHeader, type H3Event } from 'h3'

/**
 * Token admin có chữ ký HMAC-SHA256.
 *
 * Token cũ chỉ là base64(username:timestamp) — ai đoán được tên đăng nhập
 * đều tự tạo được token hợp lệ. Token mới có dạng:
 *
 *   base64url(username.expiry).chữ_ký
 *
 * Chữ ký tính bằng khoá bí mật phía server, nên không thể giả mạo nếu
 * không biết khoá. Có hạn dùng để token bị lộ không sống mãi.
 */

const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000 // 7 ngày

function getSecret(): string {
  // Ưu tiên khoá riêng; không có thì suy từ mật khẩu admin để khỏi bắt buộc
  // thêm biến môi trường mới. Đổi mật khẩu admin sẽ vô hiệu mọi token cũ —
  // đó chính là hành vi mong muốn khi nhân sự nghỉ việc.
  const dedicated = process.env.ADMIN_TOKEN_SECRET
  if (dedicated) return dedicated

  const derived = process.env.DEFAULT_ADMIN_PASSWORD
  if (derived) return `sapa-admin-token::${derived}`

  throw createError({
    statusCode: 500,
    statusMessage: 'Chưa cấu hình ADMIN_TOKEN_SECRET hoặc DEFAULT_ADMIN_PASSWORD'
  })
}

function sign(payload: string): string {
  return createHmac('sha256', getSecret()).update(payload).digest('base64url')
}

export function issueAdminToken(username: string): string {
  const expiry = Date.now() + TOKEN_TTL_MS
  const payload = Buffer.from(`${username}\n${expiry}`, 'utf8').toString('base64url')
  return `${payload}.${sign(payload)}`
}

export function verifyAdminToken(token: string): { username: string } | null {
  const dotIndex = token.lastIndexOf('.')
  if (dotIndex <= 0) return null

  const payload = token.slice(0, dotIndex)
  const signature = token.slice(dotIndex + 1)
  const expected = sign(payload)

  // So sánh thời-gian-cố-định để không bị dò chữ ký từng byte qua đo thời gian
  const sigBuf = Buffer.from(signature)
  const expBuf = Buffer.from(expected)
  if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) return null

  const decoded = Buffer.from(payload, 'base64url').toString('utf8')
  const newlineIndex = decoded.lastIndexOf('\n')
  if (newlineIndex <= 0) return null

  const username = decoded.slice(0, newlineIndex)
  const expiry = Number(decoded.slice(newlineIndex + 1))

  if (!Number.isFinite(expiry) || Date.now() > expiry) return null

  return { username }
}

/** Đọc token từ header Authorization và xác minh; ném 401 nếu không hợp lệ. */
export function requireAdmin(event: H3Event): { username: string } {
  const header = getHeader(event, 'authorization') || ''
  const token = header.replace(/^Bearer\s+/i, '').trim()

  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Thiếu token admin' })
  }

  const verified = verifyAdminToken(token)
  if (!verified) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Token không hợp lệ hoặc đã hết hạn — đăng nhập lại'
    })
  }

  return verified
}
