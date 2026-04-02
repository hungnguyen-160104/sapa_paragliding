import { createError, defineEventHandler } from 'h3'
import { connectToDatabase } from '../../utils/db'

export default defineEventHandler(async () => {
  try {
    const { db } = await connectToDatabase()
    const postsCollection = db.collection('posts')

    const posts = await postsCollection
      .find({ status: 'PUBLISHED' })
      .sort({ publishedAt: -1, updatedAt: -1 })
      .toArray()

    const transformedPosts = posts.map((post) => {
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

    return {
      success: true,
      data: transformedPosts,
      total: transformedPosts.length
    }
  } catch (error) {
    console.error('Error fetching posts:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch posts'
    })
  }
})