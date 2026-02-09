import { connectToDatabase } from '../../../utils/db'

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing booking ID'
      })
    }

    const { db } = await connectToDatabase()
    const bookingsCollection = db.collection('bookings')

    const result = await bookingsCollection.deleteOne({ id })

    if (result.deletedCount === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Booking not found'
      })
    }

    return {
      success: true
    }
  } catch (error: any) {
    console.error('Failed to delete booking:', error)
    throw createError({
      statusCode: error?.statusCode || 500,
      statusMessage: error?.statusMessage || 'Failed to delete booking'
    })
  }
})
