import { defineEventHandler } from 'h3'
import { connectToDatabase } from '../../../utils/db'

export default defineEventHandler(async () => {
  try {
    const { db } = await connectToDatabase()
    const postsCollection = db.collection('posts')

    const [total, published, draft, scheduled, categoriesResult] = await Promise.all([
      postsCollection.countDocuments(),
      postsCollection.countDocuments({ status: 'PUBLISHED' }),
      postsCollection.countDocuments({ status: 'DRAFT' }),
      postsCollection.countDocuments({ status: 'SCHEDULED' }),
      postsCollection.distinct('categoryId')
    ])

    return {
      success: true,
      data: {
        total,
        published,
        draft,
        scheduled,
        categories: categoriesResult.filter(Boolean).length
      }
    }
  } catch (error) {
    console.error('Error fetching stats:', error)
    return {
      success: false,
      error: 'Failed to fetch stats'
    }
  }
})
