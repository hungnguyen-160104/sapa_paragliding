import { ObjectId } from 'mongodb'
import { connectToDatabase } from '../../../utils/db'

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')
    if (!id) {
      return { success: false, error: 'Missing id' }
    }

    const { db } = await connectToDatabase()
    const postsCollection = db.collection('posts')

    const query = ObjectId.isValid(id) ? { $or: [{ id }, { _id: new ObjectId(id) }] } : { id }
    const post = await postsCollection.findOne(query)

    if (!post) {
      return { success: false, error: 'Post not found' }
    }

    return {
      success: true,
      data: {
        id: post.id || post._id?.toString(),
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt || '',
        contentHtml: post.contentHtml || '',
        contentBlocks: post.contentBlocks || [],
        categoryId: post.categoryId,
        status: post.status,
        thumbnailUrl: post.thumbnailUrl || '',
        galleryUrls: post.galleryUrls || [],
        tags: post.tags || [],
        seo: post.seo || {},
        scheduledAt: post.scheduledAt,
        views: post.views || 0,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        publishedAt: post.publishedAt
      }
    }
  } catch (error) {
    console.error('Error fetching post by id:', error)
    return { success: false, error: 'Failed to fetch post' }
  }
})
