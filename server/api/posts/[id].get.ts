import { ObjectId } from 'mongodb'
import { createError, defineEventHandler, getRouterParam } from 'h3'
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

    let post = await postsCollection.findOne({ id })

    if (!post) {
      post = await postsCollection.findOne({ slug: id })
    }

    if (!post && ObjectId.isValid(id)) {
      post = await postsCollection.findOne({ _id: new ObjectId(id) })
    }

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
    const contentHtml = post.contentHtml || post.content || ''
    const contentHtmlVi = post.contentHtmlVi || post.contentVi || post.contentHtml || post.content || ''
    const contentBlocks = normalizeBlocks(post.contentBlocks)
    const contentBlocksVi = normalizeBlocks(post.contentBlocksVi?.length ? post.contentBlocksVi : post.contentBlocks)
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
      seo: normalizeSeo(post.seo, {
        title,
        titleVi,
        excerpt,
        excerptVi,
        ogImage: image
      })
    }

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