import { ObjectId } from 'mongodb'
import { connectToDatabase } from '../../../../utils/db'

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')

    if (!id) {
      return { success: false, error: 'Missing post ID' }
    }

    const { db } = await connectToDatabase()
    const postsCollection = db.collection('posts')

    // Find original post
    const filters: Array<Record<string, any>> = [{ id }]
    if (ObjectId.isValid(id)) {
      filters.push({ _id: new ObjectId(id) })
    }

    const query = (filters.length > 1 ? { $or: filters } : filters[0]) as Record<string, any>
    const originalPost = await postsCollection.findOne(query)

    if (!originalPost) {
      return { success: false, error: 'Post not found' }
    }

    // Create duplicate
    const now = new Date()
    const newId = Date.now().toString()
    
    const duplicatedPost = {
      ...originalPost,
      _id: undefined,
      id: newId,
      title: `Bản sao - ${originalPost.title}`,
      slug: `${originalPost.slug}-copy-${newId}`,
      status: 'DRAFT',
      views: 0,
      publishedAt: null,
      createdAt: now,
      updatedAt: now
    }

    // Remove the old _id
    delete duplicatedPost._id

    await postsCollection.insertOne(duplicatedPost)

    return {
      success: true,
      message: 'Post duplicated successfully',
      post: {
        id: newId,
        title: duplicatedPost.title,
        slug: duplicatedPost.slug
      }
    }
  } catch (error) {
    console.error('Error duplicating post:', error)
    return { success: false, error: 'Failed to duplicate post' }
  }
})
