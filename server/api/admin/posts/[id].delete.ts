import { ObjectId } from 'mongodb'
import { getRouterParam } from 'h3'
import { connectToDatabase } from '../../../utils/db'
import { defineEventHandler, getQuery } from 'h3'


export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')

    // Validate ID
    if (!id) {
      return {
        success: false,
        error: 'Invalid post ID'
      }
    }

    const { db } = await connectToDatabase()
    const postsCollection = db.collection('posts')

    const filters: Array<Record<string, any>> = [{ id }]
    if (ObjectId.isValid(id)) {
      filters.push({ _id: new ObjectId(id) })
    }

    const query = filters.length > 1 ? { $or: filters } : filters[0]

    const result = await postsCollection.deleteOne(query)

    if (result.deletedCount === 0) {
      return {
        success: false,
        error: 'Post not found'
      }
    }

    return {
      success: true,
      message: 'Post deleted successfully'
    }
  } catch (error) {
    console.error('Error deleting post:', error)
    return {
      success: false,
      error: 'Failed to delete post'
    }
  }
})
