import { defineEventHandler } from 'h3'

/**
 * Điểm kiểm tra token còn hợp lệ hay không.
 *
 * Middleware admin-api-auth đã xác thực chữ ký + hạn dùng cho mọi request
 * /api/admin/* trước khi vào đây, nên handler chỉ cần trả 200. Client gọi
 * endpoint này lúc vào khu admin: nhận 401 nghĩa là token trong localStorage
 * đã cũ (bản base64 trước nâng cấp HMAC, hoặc quá hạn 7 ngày) — xoá và đưa
 * về trang đăng nhập, thay vì để từng nút chức năng báo lỗi khó hiểu.
 */
export default defineEventHandler(() => ({ success: true }))
