import { createError, defineEventHandler, setHeader } from 'h3'
import { connectToDatabase } from '../../utils/db'
import { clearPostsListCache, getPostsListCache, setPostsListCache } from '../../utils/posts-cache'

/**
 * DANH SÁCH BÀI VIẾT cho trang chủ và /posts.
 *
 * Chỉ lấy đúng những trường bảng danh sách cần (projection): bản đầy đủ kéo cả
 * contentBlocks/gallery của 55 bài — 1,77 MB, ~600 ms trên Atlas — trong khi
 * phần dùng tới chỉ ~50 KB, ~70 ms (đo 16/09). Kèm cache 60 giây trong tiến
 * trình (server/utils/posts-cache.ts) và cache CDN cho lượt gọi từ trình duyệt.
 */
const PROJECTION = {
  id: 1, title: 1, titleVi: 1, excerpt: 1, excerptVi: 1, thumbnailUrl: 1, coverImage: 1,
  categoryId: 1, publishedAt: 1, updatedAt: 1, createdAt: 1, slug: 1
} as const

async function docDanhSach() {
  const { db } = await connectToDatabase()
  const posts = await db
    .collection('posts')
    .find({ status: 'PUBLISHED' }, { projection: PROJECTION })
    .sort({ publishedAt: -1, updatedAt: -1 })
    .limit(100)
    .toArray()

  return posts.map((post) => {
    const title = post.title || ''
    const titleVi = post.titleVi || post.title || ''
    const excerpt = post.excerpt || ''
    const excerptVi = post.excerptVi || post.excerpt || ''
    const categoryId = post.categoryId || 'news'
    return {
      id: post.id || post._id?.toString(),
      title,
      titleVi,
      excerpt,
      excerptVi,
      image: post.thumbnailUrl || post.coverImage || '',
      thumbnailUrl: post.thumbnailUrl || post.coverImage || '',
      author: 'Admin',
      date: post.publishedAt || post.updatedAt || post.createdAt,
      category: categoryId,
      categoryId,
      published: true,
      slug: post.slug || post.id || post._id?.toString()
    }
  })
}

/** Nhiều request cùng lúc khi cache hết hạn (SSR trang chủ + /posts) thì chỉ truy vấn MỘT lần. */
let dangDoc: Promise<Record<string, unknown>[]> | null = null

export default defineEventHandler(async (event) => {
  // Trình duyệt gọi thẳng (chuyển trang phía client) thì CDN Vercel giữ 60 giây,
  // hết hạn vẫn trả bản cũ ngay rồi mới lấy mới — khách không phải chờ database.
  setHeader(event, 'Cache-Control', 'public, s-maxage=60, stale-while-revalidate=600')

  const cu = getPostsListCache()
  if (cu?.fresh) {
    return { success: true, data: cu.data, total: cu.data.length, cached: true }
  }

  try {
    if (!dangDoc) dangDoc = docDanhSach().finally(() => { dangDoc = null })
    const data = await dangDoc
    if (data.length === 0) {
      // Database trả rỗng là chuyện bất thường (site có 50+ bài): đừng cache bản rỗng,
      // và nếu còn bản cũ thì dùng bản cũ.
      clearPostsListCache()
      if (cu) return { success: true, data: cu.data, total: cu.data.length, cached: true, stale: true }
    } else {
      setPostsListCache(data)
    }
    return { success: true, data, total: data.length }
  } catch (error) {
    console.error('Error fetching posts:', error)
    if (cu) {
      setHeader(event, 'Cache-Control', 'public, s-maxage=30')
      return { success: true, data: cu.data, total: cu.data.length, cached: true, stale: true }
    }
    throw createError({ statusCode: 500, statusMessage: 'Failed to fetch posts' })
  }
})
