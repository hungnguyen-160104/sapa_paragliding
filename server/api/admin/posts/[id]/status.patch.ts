import { ObjectId } from 'mongodb'
import { readBody } from 'h3'
import { connectToDatabase } from '../../../../utils/db'

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')
    const body = await readBody(event)
    const { status } = body

    if (!id) {
      return { success: false, error: 'Missing post ID' }
    }

    if (!status || !['DRAFT', 'PUBLISHED', 'SCHEDULED'].includes(status)) {
      return { success: false, error: 'Invalid status' }
    }

    const { db } = await connectToDatabase()
    const postsCollection = db.collection('posts')

    const filters: Array<Record<string, any>> = [{ id }]
    if (ObjectId.isValid(id)) {
      filters.push({ _id: new ObjectId(id) })
    }

    const query = (filters.length > 1 ? { $or: filters } : filters[0]) as Record<string, any>

    const updateData: Record<string, any> = {
      status,
      updatedAt: new Date()
    }

    // Set publishedAt when publishing
    if (status === 'PUBLISHED') {
      updateData.publishedAt = new Date()
    }

    const result = await postsCollection.updateOne(query, { $set: updateData })

    if (result.matchedCount === 0) {
      return { success: false, error: 'Post not found' }
    }

    return {
      success: true,
      message: `Post status updated to ${status}`
    }
  } catch (error) {
    console.error('Error updating post status:', error)
    return { success: false, error: 'Failed to update status' }
  }
})
