import { defineEventHandler, getQuery } from 'h3'
import { connectToDatabase } from '../../../utils/db'

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
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        categoryId: post.categoryId,
        status: post.status,
        updatedAt: post.updatedAt,
        thumbnailUrl: post.thumbnailUrl
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
