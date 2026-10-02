import { ObjectId } from 'mongodb'
import { createError, defineEventHandler, getRouterParam, setHeader } from 'h3'
import { connectToDatabase } from '../../utils/db'

type ContentBlock = {
  id?: string | number
  type?: string
  data?: Record<string, any>
}

type GalleryItem = {
  url: string
  publicId?: string
  caption?: string
}

function normalizeBlocks(value: unknown): ContentBlock[] {
  if (!Array.isArray(value)) return []

  const output: ContentBlock[] = []

  for (const item of value) {
    if (!item || typeof item !== 'object') continue
    output.push(item as ContentBlock)
  }

  return output
}

function normalizeGallery(value: unknown): GalleryItem[] {
  if (!Array.isArray(value)) return []

  const output: GalleryItem[] = []

  for (const item of value) {
    if (typeof item === 'string') {
      const url = item.trim()
      if (url) output.push({ url, caption: '' })
      continue
    }

    if (item && typeof item === 'object') {
      const raw = item as Record<string, unknown>
      const url = typeof raw.url === 'string' ? raw.url.trim() : ''
      if (!url) continue

      output.push({
        url,
        publicId: typeof raw.publicId === 'string' ? raw.publicId : undefined,
        caption: typeof raw.caption === 'string' ? raw.caption : ''
      })
    }
  }

  return output
}

function normalizeSeo(
  value: unknown,
  fallback: {
    title: string
    titleVi: string
    excerpt: string
    excerptVi: string
    ogImage: string
  }
) {
  const seo = value && typeof value === 'object' ? (value as Record<string, unknown>) : {}

  return {
    title: typeof seo.title === 'string' ? seo.title : '',
    titleVi: typeof seo.titleVi === 'string' ? seo.titleVi : '',
    description: typeof seo.description === 'string' ? seo.description : '',
    descriptionVi: typeof seo.descriptionVi === 'string' ? seo.descriptionVi : '',
    ogImage: typeof seo.ogImage === 'string' && seo.ogImage ? seo.ogImage : fallback.ogImage
  }
}

/**
 * Bản dịch thêm ngoài vi/en, lưu ở post.translations.<fr|ru|zh|hi|ko|de>. Chỉ nhận
 * bản có đủ tiêu đề VÀ nội dung — bản dịch nửa vời mà được khai là trang riêng
 * thì Google lại thấy một trang mỏng/lẫn tiếng Anh.
 */
const TRANSLATION_LOCALES = ['fr', 'ru', 'zh', 'hi', 'ko', 'de'] as const

function normalizeTranslations(value: unknown) {
  const output: Record<string, {
    title: string
    excerpt: string
    contentBlocks: ContentBlock[]
    seo: { title: string; description: string }
  }> = {}
  if (!value || typeof value !== 'object') return output

  for (const lc of TRANSLATION_LOCALES) {
    const raw = (value as Record<string, any>)[lc]
    if (!raw || typeof raw !== 'object') continue
    const title = typeof raw.title === 'string' ? raw.title.trim() : ''
    const contentBlocks = normalizeBlocks(raw.contentBlocks)
    if (!title || contentBlocks.length === 0) continue
    output[lc] = {
      title,
      excerpt: typeof raw.excerpt === 'string' ? raw.excerpt : '',
      contentBlocks,
      seo: {
        title: typeof raw.seo?.title === 'string' ? raw.seo.title : '',
        description: typeof raw.seo?.description === 'string' ? raw.seo.description : ''
      }
    }
  }
  return output
}

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Post ID is required'
    })
  }

  try {
    const { db } = await connectToDatabase()
    const postsCollection = db.collection('posts')

    // MỘT lượt truy vấn thay vì ba lượt nối nhau: link bài dùng slug nên lối cũ
    // (tìm theo id, trượt, rồi mới tìm slug) tốn hai chuyến tới database mỗi lần
    // mở bài. Thứ tự ưu tiên giữ nguyên: id → slug → _id.
    const candidates = await postsCollection
      .find({ $or: [{ id }, { slug: id }, ...(ObjectId.isValid(id) ? [{ _id: new ObjectId(id) }] : [])] })
      .limit(3)
      .toArray()
    const post =
      candidates.find((p) => p.id === id) ??
      candidates.find((p) => p.slug === id) ??
      candidates.find((p) => String(p._id) === id) ??
      null

    if (!post) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Post not found'
      })
    }

    if (post.status !== 'PUBLISHED') {
      throw createError({
        statusCode: 404,
        statusMessage: 'Post not found'
      })
    }

    const title = post.title || ''
    const titleVi = post.titleVi || post.title || ''
    const excerpt = post.excerpt || ''
    const excerptVi = post.excerptVi || post.excerpt || ''
    const contentBlocks = normalizeBlocks(post.contentBlocks)
    const contentBlocksVi = normalizeBlocks(post.contentBlocksVi?.length ? post.contentBlocksVi : post.contentBlocks)
    // HTML chỉ là dự phòng cho bài cũ không có block — trang không dùng tới khi
    // có block. Gửi kèm thì nó nằm trong payload của trang (Google đọc được)
    // và hay lệch với block sau khi sửa bài ngoài trình soạn thảo. Có block
    // thì không gửi.
    const hasBlocks = contentBlocks.length > 0 || contentBlocksVi.length > 0
    const contentHtml = hasBlocks ? '' : post.contentHtml || post.content || ''
    const contentHtmlVi = hasBlocks ? '' : post.contentHtmlVi || post.contentVi || post.contentHtml || post.content || ''
    const image = post.thumbnailUrl || post.coverImage || ''
    const categoryId = post.categoryId || 'news'
    const galleryUrls = normalizeGallery(post.galleryUrls?.length ? post.galleryUrls : post.gallery)

    const transformedPost = {
      id: post.id || post._id?.toString(),
      title,
      titleVi,
      excerpt,
      excerptVi,
      content: contentHtml,
      contentVi: contentHtmlVi,
      contentHtml,
      contentHtmlVi,
      contentBlocks,
      contentBlocksVi,
      image,
      thumbnailUrl: image,
      author: 'Admin',
      date: post.publishedAt || post.updatedAt || post.createdAt,
      category: categoryId,
      categoryId,
      published: true,
      slug: post.slug || post.id || post._id?.toString(),
      gallery: galleryUrls,
      galleryUrls,
      translations: normalizeTranslations(post.translations),
      seo: normalizeSeo(post.seo, {
        title,
        titleVi,
        excerpt,
        excerptVi,
        ogImage: image
      })
    }

    // Chuyển trang phía client gọi thẳng API này: CDN Vercel giữ 60 giây, hết hạn
    // vẫn trả bản cũ ngay rồi mới lấy mới — khách bấm vào bài không phải chờ
    // database (trước đây ~1 giây mỗi lần). Sửa bài trong admin hiện sau ≤ 1 phút.
    setHeader(event, 'Cache-Control', 'public, s-maxage=60, stale-while-revalidate=600')

    return {
      success: true,
      data: transformedPost
    }
  } catch (error: any) {
    if (error?.statusCode === 404) {
      throw error
    }

    console.error('Error fetching post:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch post'
    })
  }
})