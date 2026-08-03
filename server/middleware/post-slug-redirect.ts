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

/**
 * Cache slug theo ID trong bộ nhớ tiến trình. Redirect chạy trên mọi request
 * tới URL số, không cache thì mỗi lượt lại một truy vấn database.
 */
const slugCache = new Map<string, string | null>()

export default defineEventHandler(async (event) => {
  const url = getRequestURL(event)
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
