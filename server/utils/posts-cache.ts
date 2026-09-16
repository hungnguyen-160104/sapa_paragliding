/**
 * BỘ NHỚ TẠM DANH SÁCH BÀI VIẾT (trong tiến trình).
 *
 * Trang chủ và /posts đều kết xuất phía máy chủ và cùng gọi /api/posts. Trước
 * đây mỗi lượt là một truy vấn kéo NGUYÊN NỘI DUNG 55 bài (1,77 MB, ~600 ms)
 * chỉ để lấy tiêu đề và ảnh — cộng với khởi động lạnh của Vercel và kết nối
 * Atlas là 4–8 giây, có lúc vượt giới hạn 10 giây và khách nhận trang lỗi;
 * tải lại thì instance đã ấm nên hết. Giữ bản đã biến đổi ở đây 60 giây, và
 * khi database chập chờn thì trả bản cũ (tới 1 giờ) thay vì 503.
 *
 * Vercel chạy nhiều instance, mỗi cái một bộ nhớ riêng — cache này chỉ tiết
 * kiệm trong một instance; CDN cache đặt ở header của route lo phần còn lại.
 * Admin sửa bài thì gọi clearPostsListCache() để instance đó bỏ bản cũ ngay.
 */
export type PostListItem = Record<string, unknown>

const TUOI_MS = 60 * 1000
const TUOI_CU_MS = 60 * 60 * 1000

let cache: { luc: number; data: PostListItem[] } | null = null

export function getPostsListCache(): { data: PostListItem[]; fresh: boolean } | null {
  if (!cache) return null
  const tuoi = Date.now() - cache.luc
  if (tuoi > TUOI_CU_MS) return null
  return { data: cache.data, fresh: tuoi < TUOI_MS }
}

export function setPostsListCache(data: PostListItem[]): void {
  cache = { luc: Date.now(), data }
}

export function clearPostsListCache(): void {
  cache = null
}
