import { ObjectId } from 'mongodb'
import { defineEventHandler, getRouterParam, readBody } from 'h3'
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

type SeoPayload = {
  title?: string
  titleVi?: string
  description?: string
  descriptionVi?: string
  ogImage?: string
}

const ALLOWED_STATUS = ['PUBLISHED', 'DRAFT', 'SCHEDULED'] as const

function normalizeSlug(value: string): string {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

function normalizeBlocks(value: unknown): ContentBlock[] {
  if (!Array.isArray(value)) return []

  const output: ContentBlock[] = []

  for (const item of value) {
    if (!item || typeof item !== 'object') continue
    const raw = item as Record<string, any>

    output.push({
      id: raw.id || `${Date.now()}-${output.length}`,
      type: String(raw.type || 'paragraph'),
      data: raw.data && typeof raw.data === 'object' ? raw.data : {}
    })
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
  const seo = value && typeof value === 'object' ? (value as SeoPayload) : {}

  return {
    title: typeof seo.title === 'string' ? seo.title : '',
    titleVi: typeof seo.titleVi === 'string' ? seo.titleVi : '',
    description: typeof seo.description === 'string' ? seo.description : '',
    descriptionVi: typeof seo.descriptionVi === 'string' ? seo.descriptionVi : '',
    ogImage: typeof seo.ogImage === 'string' && seo.ogImage ? seo.ogImage : fallback.ogImage
  }
}

function normalizeDate(value: unknown): Date | null {
  if (!value) return null
  const date = new Date(String(value))
  return Number.isNaN(date.getTime()) ? null : date
}

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')
    const body = await readBody(event)

    if (!id) {
      return {
        success: false,
        error: 'Invalid post ID'
      }
    }

    const title = typeof body?.title === 'string' ? body.title.trim() : ''
    const titleVi = typeof body?.titleVi === 'string' ? body.titleVi.trim() : ''
    const excerpt = typeof body?.excerpt === 'string' ? body.excerpt.trim() : ''
    const excerptVi = typeof body?.excerptVi === 'string' ? body.excerptVi.trim() : ''
    const contentHtml = typeof body?.contentHtml === 'string' ? body.contentHtml : ''
    const contentHtmlVi = typeof body?.contentHtmlVi === 'string' ? body.contentHtmlVi : ''
    const categoryId = typeof body?.categoryId === 'string' ? body.categoryId.trim() : ''
    const status = ALLOWED_STATUS.includes(body?.status) ? body.status : 'DRAFT'
    const thumbnailUrl = typeof body?.thumbnailUrl === 'string' ? body.thumbnailUrl.trim() : ''
    const slugBase = typeof body?.slug === 'string' && body.slug.trim() ? body.slug : title || titleVi
    const slug = normalizeSlug(slugBase)
    const contentBlocks = normalizeBlocks(body?.contentBlocks)
    const contentBlocksViRaw = normalizeBlocks(body?.contentBlocksVi)
    const contentBlocksVi = contentBlocksViRaw.length ? contentBlocksViRaw : contentBlocks
    const galleryUrls = normalizeGallery(body?.galleryUrls)
    const tags = Array.isArray(body?.tags)
      ? body.tags.filter((tag: unknown): tag is string => typeof tag === 'string' && tag.trim().length > 0)
      : []
    const seo = normalizeSeo(body?.seo, {
      title,
      titleVi,
      excerpt,
      excerptVi,
      ogImage: thumbnailUrl
    })
    const scheduledAt = normalizeDate(body?.scheduledAt)

    if (!title && !titleVi) {
      return {
        success: false,
        error: 'At least one title is required'
      }
    }

    if (!categoryId) {
      return {
        success: false,
        error: 'Category is required'
      }
    }

    if ((status === 'PUBLISHED' || status === 'SCHEDULED') && (!title || !titleVi)) {
      return {
        success: false,
        error: 'Both Vietnamese and English titles are required to publish'
      }
    }

    if (status === 'PUBLISHED' && !thumbnailUrl) {
      return {
        success: false,
        error: 'Thumbnail is required to publish'
      }
    }

    if (status === 'SCHEDULED' && !scheduledAt) {
      return {
        success: false,
        error: 'Scheduled time is required'
      }
    }

    const { db } = await connectToDatabase()
    const postsCollection = db.collection('posts')

    const filters: Array<Record<string, any>> = [{ id }]
    if (ObjectId.isValid(id)) {
      filters.push({ _id: new ObjectId(id) })
    }
    const query = filters.length > 1 ? { $or: filters } : filters[0]

    const existingPost = await postsCollection.findOne(query as Record<string, any>)

    if (!existingPost) {
      return {
        success: false,
        error: 'Post not found'
      }
    }

    // Check for duplicate slug
    const existingWithSlug = await postsCollection.findOne({
      slug,
      _id: { $ne: existingPost._id }
    })

    if (existingWithSlug) {
      return {
        success: false,
        error: `Đường dẫn (slug) "${slug}" đã tồn tại trên một bài viết khác. Vui lòng thay đổi tiêu đề hoặc tuỳ chỉnh lại slug.`
      }
    }

    const updateData: Record<string, any> = {
      title,
      titleVi,
      slug,
      excerpt,
      excerptVi,
      contentHtml,
      contentHtmlVi,
      contentBlocks,
      contentBlocksVi,
      categoryId,
      status,
      thumbnailUrl,
      galleryUrls,
      tags,
      seo,
      updatedAt: new Date()
    }

    if (status === 'SCHEDULED' && scheduledAt) {
      updateData.scheduledAt = scheduledAt
    } else {
      updateData.scheduledAt = null
    }

    if (status === 'PUBLISHED') {
      updateData.publishedAt = existingPost.publishedAt || new Date()
    } else {
      updateData.publishedAt = existingPost.publishedAt || null
    }

    const result = await postsCollection.updateOne(query as Record<string, any>, {
      $set: updateData
    })

    if (result.matchedCount === 0) {
      return {
        success: false,
        error: 'Post not found'
      }
    }

    return {
      success: true,
      message: 'Post updated successfully',
      post: {
        id: existingPost.id || existingPost._id?.toString(),
        ...updateData
      }
    }
  } catch (error: any) {
    console.error('Error updating post:', error)
    return {
      success: false,
      error: error?.message ? `Lỗi hệ thống: ${error.message}` : 'Failed to update post'
    }
  }
})