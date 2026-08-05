import { useAdminAuthStore } from '~/stores/adminAuth'

/**
 * Guard khu admin.
 *
 * Trước đây chỉ kiểm token CÓ TỒN TẠI trong localStorage — token cũ (bản
 * base64 trước nâng cấp HMAC ngày 02/08, hoặc quá hạn 7 ngày) vẫn lọt qua,
 * vào được editor rồi mọi nút chức năng đều 401 "Token không hợp lệ" mà
 * không được đưa về trang đăng nhập.
 *
 * Giờ thêm bước xác minh với server qua /api/admin/me: gọi MỘT lần cho mỗi
 * giá trị token (nhớ kết quả), token hỏng thì xoá và đẩy về trang đăng nhập.
 * Việc xác minh chạy nền — không chặn điều hướng để khu admin không bị chậm.
 */
export default defineNuxtPlugin(() => {
  const router = useRouter()

  /** Token đã xác minh OK trong phiên này — tránh gọi lại mỗi lần chuyển trang. */
  let verifiedToken: string | null = null

  const clearAndGoLogin = (prefix: string) => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminUsername')
    router.push(`${prefix}/admin/login`)
  }

  const verifyInBackground = (token: string, prefix: string) => {
    if (token === verifiedToken) return

    $fetch('/api/admin/me', { headers: { authorization: `Bearer ${token}` } })
      .then(() => {
        verifiedToken = token
      })
      .catch((error: any) => {
        if (error?.statusCode === 401 || error?.response?.status === 401) {
          clearAndGoLogin(prefix)
        }
        // Lỗi mạng/5xx: không đăng xuất — có thể server đang khởi động lạnh.
      })
  }

  router.beforeEach((to) => {
    // Only run on client
    if (typeof window === 'undefined') return

    // Skip non-admin routes
    if (!to.path.includes('/admin')) return

    const authStore = useAdminAuthStore()
    authStore.hydrate()

    const token = localStorage.getItem('adminToken')
    const hasToken = authStore.isAuthenticated || !!token

    // Get locale from path
    const parts = to.path.split('/')
    const locales = ['en', 'fr', 'ru', 'vi']
    const locale = parts[1] && locales.includes(parts[1]) ? parts[1] : 'vi'
    const prefix = `/${locale}`

    // If on login page and has token, redirect to dashboard
    if (to.path.includes('/admin/login')) {
      if (hasToken) {
        return `${prefix}/admin/dashboard`
      }
      return // Allow access to login page
    }

    // If not on login page and no token, redirect to login
    if (!hasToken) {
      return `${prefix}/admin/login`
    }

    if (token) {
      verifyInBackground(token, prefix)
    }
  })
})
