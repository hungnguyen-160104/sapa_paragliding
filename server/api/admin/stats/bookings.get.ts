import { connectToDatabase } from '../../../utils/db'
import { buildDateRangeMatch } from '../../../utils/stats'

const GROUP_BY_FORMAT: Record<string, string> = {
  day: '%Y-%m-%d',
  month: '%Y-%m',
  year: '%Y'
}

const normalizeGroupBy = (value?: string) => {
  if (!value) return 'day'
  return ['day', 'month', 'year'].includes(value) ? value : 'day'
}

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const groupBy = normalizeGroupBy(query.groupBy as string)
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
          _id: {
            $dateToString: {
              format: GROUP_BY_FORMAT[groupBy],
              date: {
                $ifNull: ['$flightDateUtc', '$createdAt']
              }
            }
          },
          value: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    )

    const results = await bookingsCollection.aggregate(pipeline).toArray()

    return {
      success: true,
      labels: results.map((item: any) => item._id),
      values: results.map((item: any) => item.value)
    }
  } catch (error) {
    console.error('Failed to load booking trends:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to load booking trends'
    })
  }
})
