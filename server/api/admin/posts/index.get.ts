import { defineEventHandler, getQuery } from 'h3'
import { connectToDatabase } from '../../../utils/db'

function normalizeCategory(value: unknown): string {
  const raw = String(value || '').trim().toLowerCase()

  if (!raw) return ''

  const map: Record<string, string> = {
    adventure: 'adventure',
    safety: 'safety',
    tips: 'tips',
    tip: 'tips',
    guide: 'guide',
    news: 'news',
    experience: 'experience',
    promotion: 'promotion',
    'khuyen-mai': 'promotion'
  }

  return map[raw] || raw
}

function normalizeStatus(post: Record<string, any>): 'DRAFT' | 'PUBLISHED' | 'SCHEDULED' {
  if (post.status === 'PUBLISHED' || post.status === 'SCHEDULED' || post.status === 'DRAFT') {
    return post.status
  }

  return post.published ? 'PUBLISHED' : 'DRAFT'
}

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const page = Number(query.page || 1)
    const pageSize = Number(query.pageSize || 10)
    const search = (query.search as string) || ''
    const status = (query.status as string) || ''
    const categoryId = (query.categoryId as string) || ''

    const { db } = await connectToDatabase()
    const postsCollection = db.collection('posts')

    const filter: Record<string, any> = {}

    if (search) {
      filter.title = { $regex: search, $options: 'i' }
    }

    if (status) {
      filter.status = status
    }

    if (categoryId) {
      filter.categoryId = categoryId
    }

    const total = await postsCollection.countDocuments(filter)

    const posts = await postsCollection
      .find(filter)
      .sort({ updatedAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .toArray()

    return {
      success: true,
      data: posts.map(post => ({
        id: post.id || post._id?.toString(),
        title: post.title || post.titleVi || '',
        slug: post.slug,
        excerpt: post.excerpt || post.excerptVi || '',
        categoryId: normalizeCategory(post.categoryId || post.category),
        status: normalizeStatus(post),
        updatedAt: post.updatedAt,
        thumbnailUrl: post.thumbnailUrl || post.coverImage || post.image || ''
      })),
      total
    }
  } catch (error) {
    console.error('Error fetching posts:', error)
    return {
      success: false,
      error: 'Failed to fetch posts'
    }
  }
})
