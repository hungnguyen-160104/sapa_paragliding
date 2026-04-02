import { ObjectId } from 'mongodb'
import { defineEventHandler, getRouterParam } from 'h3'
import { connectToDatabase } from '../../../utils/db'

type GalleryItem = {
  url: string
  publicId?: string
  caption?: string
}

type ContentBlock = {
  id?: string | number
  type?: string
  data?: Record<string, any>
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

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')
    if (!id) {
      return { success: false, error: 'Missing id' }
    }

    const { db } = await connectToDatabase()
    const postsCollection = db.collection('posts')

    const query = ObjectId.isValid(id)
      ? { $or: [{ id }, { _id: new ObjectId(id) }] }
      : { id }

    const post = await postsCollection.findOne(query)

    if (!post) {
      return { success: false, error: 'Post not found' }
    }

    const title = post.title || ''
    const titleVi = post.titleVi || post.title || ''
    const excerpt = post.excerpt || ''
    const excerptVi = post.excerptVi || post.excerpt || ''
    const contentHtml = post.contentHtml || post.content || ''
    const contentHtmlVi = post.contentHtmlVi || post.contentVi || post.contentHtml || post.content || ''
    const contentBlocks = normalizeBlocks(post.contentBlocks)
    const contentBlocksVi = normalizeBlocks(post.contentBlocksVi?.length ? post.contentBlocksVi : post.contentBlocks)
    const thumbnailUrl = post.thumbnailUrl || post.coverImage || ''
    const galleryUrls = normalizeGallery(post.galleryUrls?.length ? post.galleryUrls : post.gallery)

    return {
      success: true,
      data: {
        id: post.id || post._id?.toString(),
        title,
        titleVi,
        slug: post.slug || '',
        excerpt,
        excerptVi,
        contentHtml,
        contentHtmlVi,
        contentBlocks,
        contentBlocksVi,
        categoryId: post.categoryId || '',
        status: post.status || 'DRAFT',
        thumbnailUrl,
        galleryUrls,
        tags: Array.isArray(post.tags) ? post.tags : [],
        seo: normalizeSeo(post.seo, {
          title,
          titleVi,
          excerpt,
          excerptVi,
          ogImage: thumbnailUrl
        }),
        scheduledAt: post.scheduledAt || null,
        views: post.views || 0,
        createdAt: post.createdAt || null,
        updatedAt: post.updatedAt || null,
        publishedAt: post.publishedAt || null
      }
    }
  } catch (error) {
    console.error('Error fetching post by id:', error)
    return { success: false, error: 'Failed to fetch post' }
  }
})