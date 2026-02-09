import { connectToDatabase } from '../../../utils/db'
import { buildDateRangeMatch } from '../../../utils/stats'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const from = (query.from as string) || undefined
    const to = (query.to as string) || undefined

    const { db } = await connectToDatabase()
    const bookingsCollection = db.collection('bookings')

    const match = buildDateRangeMatch('flightDateUtc', from, to)
    const pipeline: any[] = []

    if (Object.keys(match).length > 0) {
      pipeline.push({ $match: match })
    }

    pipeline.push(
      {
        $group: {
          _id: '$status',
          value: { $sum: 1 }
        }
      },
      { $sort: { value: -1 } }
    )

    const results = await bookingsCollection.aggregate(pipeline).toArray()

    return {
      success: true,
      labels: results.map((item: any) => item._id || 'UNKNOWN'),
      values: results.map((item: any) => item.value)
    }
  } catch (error) {
    console.error('Failed to load status distribution:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to load booking status distribution'
    })
  }
})
