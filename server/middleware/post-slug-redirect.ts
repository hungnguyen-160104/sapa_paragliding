import { defineEventHandler, getRequestURL, sendRedirect } from 'h3'
import { connectToDatabase } from '../utils/db'

/**
 * Chuyển hướng 301 từ URL bài viết dạng ID số sang URL dạng slug.
 *
 * Mỗi bài viết trước đây truy cập được bằng CẢ HAI đường dẫn, cùng trả 200
 * với nội dung y hệt:
 *   /en/posts/1785720547486
 *   /en/posts/sapa-paragliding-price-2026-what-the-package-includes
 * Với 40 bài là 80 URL trùng nội dung. Thẻ canonical chỉ là gợi ý cho Google
 * chứ không phải lệnh, nên cách sạch là 301 hẳn về bản slug.
 *
 * Chỉ bắt ID toàn chữ số — slug luôn có chữ cái nên không bao giờ khớp nhầm.
 */

/** /vi/posts/123 hoặc /posts/123 — bắt cả hai dạng, có hoặc không tiền tố locale. */
const POST_ID_PATH = /^(\/[a-z]{2})?\/posts\/(\d+)\/?$/

/** /vi/posts/<slug> — dùng để bắt các slug cũ đã đổi tên. */
const POST_SLUG_PATH = /^(\/[a-z]{2})?\/posts\/([^/]+)\/?$/

/**
 * Slug cũ -> slug mới, 301 vĩnh viễn.
 *
 * Năm bài dưới đây có slug hỏng do lỗi sinh slug tự động: một bài mất chữ cái
 * đầu ("apa-" thay vì "sapa-"), một bài sinh slug từ NGUYÊN VĂN nội dung nên
 * dài 1815 ký tự, ba bài bị cắt cụt giữa chừng ("...-may-to", "...-viet-nam-va",
 * "so-tay").
 *
 * Đổi slug mà không có chuyển hướng thì mọi liên kết Google đã lập chỉ mục sẽ
 * thành 404 và bài mất sạch thứ hạng đã tích luỹ. 301 chuyển toàn bộ giá trị
 * đó sang URL mới.
 *
 * Chỉ giữ 5 mục này; khi Google đã cập nhật hết (kiểm tra ở Search Console,
 * thường vài tuần) thì có thể xoá bảng đi.
 */
const RENAMED_SLUGS: Record<string, string> = {
  'apa-paragliding-du-luon-sa-pa-chuyen-nghiep-an-toan':
    'sapa-paragliding-du-luon-sa-pa-chuyen-nghiep-an-toan',
  'hang-gliding-europeans-2026-31-may-to':
    'hang-gliding-europeans-2026-31-may-to-13-june',
  'lich-su-phat-trien-bo-mon-du-luon-viet-nam-va':
    'lich-su-du-luon-viet-nam-tu-the-thao-mao-hiem-den-trai-nghiem-pho-bien',
  'so-tay':
    'so-tay-hoc-vien-du-luon-thong-tin-co-ban-cho-phi-cong-tap-luyen'
}

/**
 * Slug 1815 ký tự không đưa vào bảng trên được (quá dài để đọc, và bản thân
 * nó bắt đầu bằng tiền tố của slug mới). Bắt bằng tiền tố thay vì so khớp
 * nguyên chuỗi.
 */
const LONG_SLUG_PREFIX = 'so-tay-hoc-vien-du-luon-8-gom-ca-day-lai'
const LONG_SLUG_TARGET = 'so-tay-hoc-vien-du-luon-kiem-tra-truoc-khi-bay'

/**
 * Cache slug theo ID trong bộ nhớ tiến trình. Redirect chạy trên mọi request
 * tới URL số, không cache thì mỗi lượt lại một truy vấn database.
 */
const slugCache = new Map<string, string | null>()

export default defineEventHandler(async (event) => {
  const url = getRequestURL(event)

  // 1) Slug cũ đã đổi tên -> 301 sang slug mới. Kiểm tra trước vì rẻ hơn
  //    (không chạm database) và slug không bao giờ toàn chữ số nên không
  //    xung đột với nhánh ID phía dưới.
  const slugMatch = url.pathname.match(POST_SLUG_PATH)

  if (slugMatch) {
    const prefix = slugMatch[1] ?? ''
    const oldSlug = slugMatch[2]!

    const renamed = RENAMED_SLUGS[oldSlug]
      ?? (oldSlug.startsWith(LONG_SLUG_PREFIX) ? LONG_SLUG_TARGET : undefined)

    if (renamed) {
      return sendRedirect(event, `${prefix}/posts/${renamed}${url.search}`, 301)
    }
  }

  // 2) URL dạng ID số -> 301 sang slug.
  const match = url.pathname.match(POST_ID_PATH)

  if (!match) return

  const localePrefix = match[1] ?? ''
  const postId = match[2]!

  let slug = slugCache.get(postId)

  if (slug === undefined) {
    try {
      const { db } = await connectToDatabase()
      const post = await db
        .collection('posts')
        .findOne({ id: postId }, { projection: { slug: 1 } })

      slug = typeof post?.slug === 'string' && post.slug.length > 0 ? post.slug : null
      slugCache.set(postId, slug)
    } catch {
      // Database lỗi thì để trang tự xử lý, không chặn người dùng
      return
    }
  }

  // Không tìm thấy slug thì giữ nguyên URL số để trang vẫn mở được
  if (!slug) return

  return sendRedirect(event, `${localePrefix}/posts/${slug}${url.search}`, 301)
})
