/**
 * Header xác thực cho các lời gọi API admin.
 *
 * Từ khi server chặn /api/admin/* bằng token có chữ ký, mọi lời gọi $fetch
 * tới API admin đều phải kèm header này. services/http.ts đã tự kèm; helper
 * này dành cho các chỗ gọi $fetch trực tiếp (store, trang dashboard).
 */
export function adminAuthHeaders(): Record<string, string> {
  if (typeof window === 'undefined') return {}

  const token = localStorage.getItem('adminToken')
  return token ? { Authorization: `Bearer ${token}` } : {}
}
