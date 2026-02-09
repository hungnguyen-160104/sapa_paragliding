import { connectToDatabase } from '../../../../utils/db'

const VALID_STATUSES = ['PENDING', 'CONFIRMED', 'COMPLETED'] as const

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')
    const body = await readBody(event)
    const status = body.status as string

    if (!id || !status || !VALID_STATUSES.includes(status as (typeof VALID_STATUSES)[number])) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid booking status update'
      })
    }

    const { db } = await connectToDatabase()
    const bookingsCollection = db.collection('bookings')

    const result = await bookingsCollection.updateOne(
      { id },
      {
        $set: {
          status,
          updatedAt: new Date()
        }
      }
    )

    if (result.matchedCount === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Booking not found'
      })
    }

    return {
      success: true
    }
  } catch (error: any) {
    console.error('Failed to update booking status:', error)
    throw createError({
      statusCode: error?.statusCode || 500,
      statusMessage: error?.statusMessage || 'Failed to update booking status'
    })
  }
})
