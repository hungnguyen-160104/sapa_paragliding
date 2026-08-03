import { defineEventHandler, getMethod, getRequestURL } from 'h3'
import { requireAdmin } from '../utils/adminAuth'

/**
 * Chặn toàn bộ API quản trị bằng một middleware server duy nhất.
 *
 * Trước đây không endpoint nào kiểm tra xác thực:
 *   - /api/admin/*  : ai biết URL đều tạo/sửa/xoá được bài viết.
 *   - /api/v1/*     : trả công khai danh sách đơn đặt chỗ kèm tên, email,
 *                     số điện thoại khách, và toàn bộ số liệu doanh thu.
 * Middleware admin.global.ts phía client chỉ ẩn giao diện, không chặn được
 * request gọi thẳng vào API.
 *
 * Đặt ở middleware server nên chạy cho MỌI request — endpoint thêm sau này
 * cũng tự động được bảo vệ, không ai phải nhớ gắn guard thủ công.
 */

const PROTECTED_PREFIXES = ['/api/admin/', '/api/v1/']

/** Đăng nhập là nơi lấy token nên phải mở. */
const PUBLIC_PATHS = new Set(['/api/admin/login'])

/**
 * Tạo đơn đặt chỗ vốn là hành động công khai (khách chưa đăng nhập bao giờ).
 * Chỉ mở đúng POST tới đúng đường dẫn này; mọi thứ khác đều phải có token.
 */
function isPublicBookingCreate(path: string, method: string): boolean {
  return method === 'POST' && (path === '/api/v1/bookings' || path === '/api/v1/bookings/')
}

export default defineEventHandler((event) => {
  const path = getRequestURL(event).pathname
  const method = getMethod(event)

  const isProtected =
    PROTECTED_PREFIXES.some((prefix) => path.startsWith(prefix)) ||
    path === '/api/admin' ||
    path === '/api/v1'

  if (!isProtected) return
  if (PUBLIC_PATHS.has(path)) return
  if (isPublicBookingCreate(path, method)) return

  // Ném 401 nếu không có token hợp lệ; kết quả xác minh đặt vào context
  // cho handler nào cần biết ai đang gọi.
  event.context.admin = requireAdmin(event)
})
