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

    pipeline.push({
      $group: {
        _id: null,
        totalBookings: { $sum: 1 },
        totalCustomers: { $sum: { $ifNull: ['$numberOfPassengers', 0] } },
        pending: {
          $sum: {
            $cond: [{ $eq: ['$status', 'PENDING'] }, 1, 0]
          }
        },
        revenue: { $sum: { $ifNull: ['$price', 0] } }
      }
    })

    const [stats] = await bookingsCollection.aggregate(pipeline).toArray()

    return {
      success: true,
      totalBookings: stats?.totalBookings || 0,
      totalCustomers: stats?.totalCustomers || 0,
      pending: stats?.pending || 0,
      revenue: stats?.revenue || 0
    }
  } catch (error) {
    console.error('Failed to load overview stats:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to load overview statistics'
    })
  }
})
