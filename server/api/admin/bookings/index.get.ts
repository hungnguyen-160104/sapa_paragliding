import { connectToDatabase } from '../../../utils/db'
import { buildDateRangeMatch } from '../../../utils/stats'

const toDto = (booking: any) => ({
  id: booking.id || booking._id?.toString(),
  bookingId: booking.bookingId,
  customerName: booking.customerName,
  email: booking.email,
  phone: booking.phone,
  location: booking.location,
  status: booking.status,
  contactStatus: booking.contactStatus || 'NOT_CONTACTED',
  price: booking.price || 0,
  flightDate: booking.flightDateUtc ? booking.flightDateUtc.toISOString() : booking.flightDate,
  flightTime: booking.flightTime || '',
  createdAt: booking.createdAt ? booking.createdAt.toISOString() : undefined,
  numberOfPassengers: booking.numberOfPassengers || 0,
  serviceName: booking.serviceName || '',
  notes: booking.notes || ''
})

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const page = Math.max(Number(query.page || 1), 1)
    const pageSize = Math.min(Number(query.pageSize || 10), 100)
    const search = (query.search as string) || ''
    const status = (query.status as string) || ''
    const location = (query.location as string) || ''
    const sort = (query.sort as string) || 'flightDate_desc'
    const from = (query.from as string) || undefined
    const to = (query.to as string) || undefined

    const { db } = await connectToDatabase()
    const bookingsCollection = db.collection('bookings')

    const filter: Record<string, any> = {}

    if (search) {
      const regex = new RegExp(search, 'i')
      filter.$or = [
        { customerName: regex },
        { phone: regex },
        { email: regex },
        { bookingId: regex }
      ]
    }

    if (status) {
      filter.status = status
    }

    if (location) {
      filter.location = { $regex: location, $options: 'i' }
    }

    Object.assign(filter, buildDateRangeMatch('flightDateUtc', from, to))

    const sortDirection = sort === 'flightDate_asc' ? 1 : -1

    const [records, total] = await Promise.all([
      bookingsCollection
        .find(filter)
        .sort({ flightDateUtc: sortDirection, createdAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .toArray(),
      bookingsCollection.countDocuments(filter)
    ])

    return {
      success: true,
      data: records.map(toDto),
      total
    }
  } catch (error) {
    console.error('Error fetching bookings:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch bookings'
    })
  }
})
