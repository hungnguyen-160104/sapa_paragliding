import { connectToDatabase } from '../../../../utils/db'

const VALID_CONTACT_STATUSES = ['NOT_CONTACTED', 'CONTACTED'] as const

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')
    const body = await readBody(event)
    const contactStatus = body.contactStatus as string

    if (!id || !contactStatus || !VALID_CONTACT_STATUSES.includes(contactStatus as (typeof VALID_CONTACT_STATUSES)[number])) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid contact status update'
      })
    }

    const { db } = await connectToDatabase()
    const bookingsCollection = db.collection('bookings')

    const result = await bookingsCollection.updateOne(
      { id },
      {
        $set: {
          contactStatus,
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
    console.error('Failed to update booking contact status:', error)
    throw createError({
      statusCode: error?.statusCode || 500,
      statusMessage: error?.statusMessage || 'Failed to update booking contact status'
    })
  }
})
