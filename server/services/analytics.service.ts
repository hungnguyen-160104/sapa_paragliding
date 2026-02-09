/**
 * Analytics Service
 * Enterprise-grade analytics using MongoDB Aggregation Pipeline
 * All complex calculations are performed at the database level
 */
import { Booking } from '../models'
import type {
  AnalyticsOverview,
  RevenueAnalytics,
  CustomerAnalytics,
  BookingStatusAnalytics,
  AnalyticsFilter,
  TimeGranularity,
  BookingStatus,
} from '../types'

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Build date match stage for aggregation pipeline
 */
function buildDateMatchStage(filter: AnalyticsFilter): Record<string, any> {
  const match: Record<string, any> = {}
  
  if (filter.from || filter.to) {
    match.flightDate = {}
    if (filter.from) {
      match.flightDate.$gte = new Date(filter.from)
    }
    if (filter.to) {
      const endDate = new Date(filter.to)
      endDate.setHours(23, 59, 59, 999)
      match.flightDate.$lte = endDate
    }
  }
  
  if (filter.status) {
    match.status = filter.status
  }
  
  if (filter.serviceId) {
    match.serviceId = filter.serviceId
  }
  
  return match
}

/**
 * Get date format string for MongoDB $dateToString
 */
function getDateFormat(granularity: TimeGranularity): string {
  const formats: Record<TimeGranularity, string> = {
    day: '%Y-%m-%d',
    week: '%Y-W%V', // ISO week
    month: '%Y-%m',
    quarter: '%Y-Q', // We'll handle quarter separately
    year: '%Y',
  }
  return formats[granularity]
}

/**
 * Build quarter grouping expression
 */
function buildQuarterExpression() {
  return {
    $concat: [
      { $toString: { $year: '$flightDate' } },
      '-Q',
      {
        $toString: {
          $ceil: { $divide: [{ $month: '$flightDate' }, 3] },
        },
      },
    ],
  }
}

/**
 * Get previous period date range for comparison
 */
function getPreviousPeriodRange(filter: AnalyticsFilter): { from: Date; to: Date } {
  const from = filter.from ? new Date(filter.from) : new Date()
  const to = filter.to ? new Date(filter.to) : new Date()
  
  const duration = to.getTime() - from.getTime()
  
  return {
    from: new Date(from.getTime() - duration),
    to: new Date(from.getTime() - 1), // Day before current period starts
  }
}

// ============================================
// ANALYTICS SERVICE CLASS
// ============================================

export class AnalyticsService {
  
  // ==========================================
  // OVERVIEW ANALYTICS
  // ==========================================
  
  /**
   * Get comprehensive overview statistics
   * Uses a single aggregation pipeline for all metrics
   */
  async getOverview(filter: AnalyticsFilter): Promise<AnalyticsOverview> {
    const match = buildDateMatchStage(filter)
    const previousPeriod = getPreviousPeriodRange(filter)
    
    // Main aggregation for current period
    const pipeline = [
      // Stage 1: Match date range
      ...(Object.keys(match).length > 0 ? [{ $match: match }] : []),
      
      // Stage 2: Lookup customer to check if returning
      {
        $lookup: {
          from: 'customers',
          localField: 'customerId',
          foreignField: '_id',
          as: 'customer',
        },
      },
      
      // Stage 3: Unwind customer (optional, may be null for old data)
      {
        $unwind: {
          path: '$customer',
          preserveNullAndEmptyArrays: true,
        },
      },
      
      // Stage 4: Group and calculate all metrics
      {
        $group: {
          _id: null,
          
          // Booking counts
          totalBookings: { $sum: 1 },
          
          // Revenue (only from non-cancelled bookings)
          totalRevenue: {
            $sum: {
              $cond: [
                { $in: ['$status', ['CANCELLED', 'REFUNDED']] },
                0,
                '$totalPrice',
              ],
            },
          },
          
          // Status breakdown
          pendingBookings: {
            $sum: { $cond: [{ $eq: ['$status', 'PENDING'] }, 1, 0] },
          },
          confirmedBookings: {
            $sum: { $cond: [{ $eq: ['$status', 'CONFIRMED'] }, 1, 0] },
          },
          completedBookings: {
            $sum: { $cond: [{ $eq: ['$status', 'COMPLETED'] }, 1, 0] },
          },
          cancelledBookings: {
            $sum: { $cond: [{ $eq: ['$status', 'CANCELLED'] }, 1, 0] },
          },
          
          // Unique customers
          uniqueCustomers: { $addToSet: '$customerId' },
          
          // Total passengers
          totalPassengers: { $sum: '$numberOfPassengers' },
        },
      },
      
      // Stage 5: Project final shape
      {
        $project: {
          _id: 0,
          totalBookings: 1,
          totalRevenue: 1,
          pendingBookings: 1,
          confirmedBookings: 1,
          completedBookings: 1,
          cancelledBookings: 1,
          totalCustomers: { $size: '$uniqueCustomers' },
          totalPassengers: 1,
          averageBookingValue: {
            $cond: [
              { $eq: ['$totalBookings', 0] },
              0,
              { $divide: ['$totalRevenue', '$totalBookings'] },
            ],
          },
        },
      },
    ]
    
    // Previous period aggregation for growth calculation
    const previousMatch = buildDateMatchStage({
      from: previousPeriod.from.toISOString(),
      to: previousPeriod.to.toISOString(),
    })
    
    const previousPipeline = [
      { $match: previousMatch },
      {
        $group: {
          _id: null,
          totalBookings: { $sum: 1 },
          totalRevenue: {
            $sum: {
              $cond: [
                { $in: ['$status', ['CANCELLED', 'REFUNDED']] },
                0,
                '$totalPrice',
              ],
            },
          },
          uniqueCustomers: { $addToSet: '$customerId' },
        },
      },
      {
        $project: {
          _id: 0,
          totalBookings: 1,
          totalRevenue: 1,
          totalCustomers: { $size: '$uniqueCustomers' },
        },
      },
    ]
    
    // Execute both pipelines in parallel
    const [currentResults, previousResults] = await Promise.all([
      Booking.aggregate(pipeline),
      Booking.aggregate(previousPipeline),
    ])
    
    const current = currentResults[0] || {
      totalBookings: 0,
      totalRevenue: 0,
      pendingBookings: 0,
      confirmedBookings: 0,
      completedBookings: 0,
      cancelledBookings: 0,
      totalCustomers: 0,
      averageBookingValue: 0,
    }
    
    const previous = previousResults[0] || {
      totalBookings: 0,
      totalRevenue: 0,
      totalCustomers: 0,
    }
    
    // Calculate growth percentages
    const calculateGrowth = (current: number, previous: number): number => {
      if (previous === 0) return current > 0 ? 100 : 0
      return Math.round(((current - previous) / previous) * 100 * 100) / 100
    }
    
    return {
      ...current,
      bookingsGrowth: calculateGrowth(current.totalBookings, previous.totalBookings),
      revenueGrowth: calculateGrowth(current.totalRevenue, previous.totalRevenue),
      customersGrowth: calculateGrowth(current.totalCustomers, previous.totalCustomers),
    }
  }
  
  // ==========================================
  // REVENUE ANALYTICS
  // ==========================================
  
  /**
   * Get revenue trends with configurable time granularity
   */
  async getRevenueTrends(filter: AnalyticsFilter): Promise<RevenueAnalytics> {
    const match = buildDateMatchStage(filter)
    const granularity = filter.granularity || 'day'
    
    // Build grouping expression based on granularity
    const dateGroupExpr = granularity === 'quarter'
      ? buildQuarterExpression()
      : { $dateToString: { format: getDateFormat(granularity), date: '$flightDate' } }
    
    const pipeline = [
      // Stage 1: Match filter
      ...(Object.keys(match).length > 0 ? [{ $match: match }] : []),
      
      // Stage 2: Exclude cancelled/refunded from revenue
      {
        $match: {
          status: { $nin: ['CANCELLED', 'REFUNDED'] },
        },
      },
      
      // Stage 3: Group by time period
      {
        $group: {
          _id: dateGroupExpr,
          revenue: { $sum: '$totalPrice' },
          bookingCount: { $sum: 1 },
          avgBookingValue: { $avg: '$totalPrice' },
        },
      },
      
      // Stage 4: Sort by period
      { $sort: { _id: 1 as 1 } },
      
      // Stage 5: Calculate running totals and format
      {
        $group: {
          _id: null,
          periods: {
            $push: {
              period: '$_id',
              revenue: '$revenue',
              bookingCount: '$bookingCount',
              avgBookingValue: '$avgBookingValue',
            },
          },
          total: { $sum: '$revenue' },
          average: { $avg: '$revenue' },
          maxRevenue: { $max: '$revenue' },
          minRevenue: { $min: '$revenue' },
        },
      },
    ]
    
    const results = await Booking.aggregate(pipeline)
    
    if (!results.length || !results[0].periods?.length) {
      return {
        labels: [],
        values: [],
        total: 0,
        average: 0,
        highest: { period: '', value: 0 },
        lowest: { period: '', value: 0 },
      }
    }
    
    const data = results[0]
    const periods = data.periods
    
    // Find highest and lowest periods
    const highest = periods.reduce((max: any, p: any) =>
      p.revenue > max.revenue ? p : max
    )
    const lowest = periods.reduce((min: any, p: any) =>
      p.revenue < min.revenue ? p : min
    )
    
    return {
      labels: periods.map((p: any) => p.period),
      values: periods.map((p: any) => p.revenue),
      total: data.total,
      average: Math.round(data.average * 100) / 100,
      highest: { period: highest.period, value: highest.revenue },
      lowest: { period: lowest.period, value: lowest.revenue },
    }
  }
  
  /**
   * Get monthly revenue for the current year
   */
  async getMonthlyRevenue(year?: number): Promise<{ month: string; revenue: number }[]> {
    const targetYear = year || new Date().getFullYear()
    
    const pipeline = [
      // Match year and non-cancelled bookings
      {
        $match: {
          flightDate: {
            $gte: new Date(`${targetYear}-01-01`),
            $lte: new Date(`${targetYear}-12-31T23:59:59.999Z`),
          },
          status: { $nin: ['CANCELLED', 'REFUNDED'] },
        },
      },
      
      // Group by month
      {
        $group: {
          _id: { $month: '$flightDate' },
          revenue: { $sum: '$totalPrice' },
        },
      },
      
      // Sort by month
      { $sort: { _id: 1 as 1 } },
    ]
    
    const results = await Booking.aggregate(pipeline)
    
    // Fill in missing months with 0
    const months = Array.from({ length: 12 }, (_, i) => {
      const monthNum = i + 1
      const found = results.find((r: any) => r._id === monthNum)
      return {
        month: `${targetYear}-${String(monthNum).padStart(2, '0')}`,
        revenue: found?.revenue || 0,
      }
    })
    
    return months
  }
  
  /**
   * Get quarterly revenue with year-over-year comparison
   */
  async getQuarterlyRevenue(year?: number): Promise<{
    quarter: string
    revenue: number
    previousYearRevenue: number
    growth: number
  }[]> {
    const targetYear = year || new Date().getFullYear()
    const previousYear = targetYear - 1
    
    const pipeline = [
      // Match both years
      {
        $match: {
          flightDate: {
            $gte: new Date(`${previousYear}-01-01`),
            $lte: new Date(`${targetYear}-12-31T23:59:59.999Z`),
          },
          status: { $nin: ['CANCELLED', 'REFUNDED'] },
        },
      },
      
      // Group by year and quarter
      {
        $group: {
          _id: {
            year: { $year: '$flightDate' },
            quarter: { $ceil: { $divide: [{ $month: '$flightDate' }, 3] } },
          },
          revenue: { $sum: '$totalPrice' },
        },
      },
      
      // Reshape for comparison
      {
        $group: {
          _id: '$_id.quarter',
          data: {
            $push: {
              year: '$_id.year',
              revenue: '$revenue',
            },
          },
        },
      },
      
      { $sort: { _id: 1 as 1 } },
    ]
    
    const results = await Booking.aggregate(pipeline)
    
    return results.map((r: any) => {
      const current = r.data.find((d: any) => d.year === targetYear)?.revenue || 0
      const previous = r.data.find((d: any) => d.year === previousYear)?.revenue || 0
      const growth = previous > 0 ? ((current - previous) / previous) * 100 : 0
      
      return {
        quarter: `Q${r._id}`,
        revenue: current,
        previousYearRevenue: previous,
        growth: Math.round(growth * 100) / 100,
      }
    })
  }
  
  // ==========================================
  // CUSTOMER ANALYTICS
  // ==========================================
  
  /**
   * Get comprehensive customer analytics
   */
  async getCustomerAnalytics(filter: AnalyticsFilter): Promise<CustomerAnalytics> {
    const match = buildDateMatchStage(filter)
    
    const pipeline = [
      // Stage 1: Match date filter
      ...(Object.keys(match).length > 0 ? [{ $match: match }] : []),
      
      // Stage 2: Lookup customer details
      {
        $lookup: {
          from: 'customers',
          localField: 'customerId',
          foreignField: '_id',
          as: 'customer',
        },
      },
      
      // Stage 3: Unwind customer
      {
        $unwind: {
          path: '$customer',
          preserveNullAndEmptyArrays: true,
        },
      },
      
      // Stage 4: Group by customer to get per-customer stats
      {
        $group: {
          _id: '$customerId',
          customerName: { $first: '$customer.fullName' },
          isReturning: { $first: '$customer.isReturningCustomer' },
          bookingsInPeriod: { $sum: 1 },
          spentInPeriod: {
            $sum: {
              $cond: [
                { $in: ['$status', ['CANCELLED', 'REFUNDED']] },
                0,
                '$totalPrice',
              ],
            },
          },
          firstBookingInPeriod: { $min: '$createdAt' },
        },
      },
      
      // Stage 5: Calculate aggregate customer stats
      {
        $group: {
          _id: null,
          totalCustomers: { $sum: 1 },
          
          // New vs Returning in this period
          newCustomers: {
            $sum: {
              $cond: [{ $eq: ['$isReturning', false] }, 1, 0],
            },
          },
          returningCustomers: {
            $sum: {
              $cond: [{ $eq: ['$isReturning', true] }, 1, 0],
            },
          },
          
          // Totals
          totalBookings: { $sum: '$bookingsInPeriod' },
          totalSpent: { $sum: '$spentInPeriod' },
          
          // For top customers
          allCustomers: {
            $push: {
              customerId: '$_id',
              name: '$customerName',
              totalBookings: '$bookingsInPeriod',
              totalSpent: '$spentInPeriod',
            },
          },
        },
      },
      
      // Stage 6: Calculate rates and format output
      {
        $project: {
          _id: 0,
          totalCustomers: 1,
          newCustomers: 1,
          returningCustomers: 1,
          
          newCustomerRate: {
            $cond: [
              { $eq: ['$totalCustomers', 0] },
              0,
              {
                $multiply: [
                  { $divide: ['$newCustomers', '$totalCustomers'] },
                  100,
                ],
              },
            ],
          },
          
          returningCustomerRate: {
            $cond: [
              { $eq: ['$totalCustomers', 0] },
              0,
              {
                $multiply: [
                  { $divide: ['$returningCustomers', '$totalCustomers'] },
                  100,
                ],
              },
            ],
          },
          
          averageBookingsPerCustomer: {
            $cond: [
              { $eq: ['$totalCustomers', 0] },
              0,
              { $divide: ['$totalBookings', '$totalCustomers'] },
            ],
          },
          
          // Sort and slice top customers
          topCustomers: {
            $slice: [
              {
                $sortArray: {
                  input: '$allCustomers',
                  sortBy: { totalSpent: -1 },
                },
              },
              10,
            ],
          },
        },
      },
    ]
    
    const results = await Booking.aggregate(pipeline)
    
    const data = results[0] || {
      totalCustomers: 0,
      newCustomers: 0,
      returningCustomers: 0,
      newCustomerRate: 0,
      returningCustomerRate: 0,
      averageBookingsPerCustomer: 0,
      topCustomers: [],
    }
    
    // Calculate retention rate (returning / total who could return)
    const customerRetentionRate = data.totalCustomers > 0
      ? (data.returningCustomers / data.totalCustomers) * 100
      : 0
    
    return {
      ...data,
      newCustomerRate: Math.round(data.newCustomerRate * 100) / 100,
      returningCustomerRate: Math.round(data.returningCustomerRate * 100) / 100,
      customerRetentionRate: Math.round(customerRetentionRate * 100) / 100,
      averageBookingsPerCustomer: Math.round(data.averageBookingsPerCustomer * 100) / 100,
    }
  }
  
  // ==========================================
  // BOOKING STATUS ANALYTICS
  // ==========================================
  
  /**
   * Get comprehensive booking status analytics
   */
  async getBookingStatusAnalytics(filter: AnalyticsFilter): Promise<BookingStatusAnalytics> {
    const match = buildDateMatchStage(filter)
    
    // Run multiple aggregations in parallel for efficiency
    const [statusResults, sourceResults, serviceResults, peakDayResults, peakHourResults] = await Promise.all([
      // By Status
      Booking.aggregate([
        ...(Object.keys(match).length > 0 ? [{ $match: match }] : []),
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            revenue: { $sum: '$totalPrice' },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$count' },
            statuses: {
              $push: { status: '$_id', count: '$count', revenue: '$revenue' },
            },
          },
        },
        {
          $unwind: '$statuses',
        },
        {
          $project: {
            _id: 0,
            status: '$statuses.status',
            count: '$statuses.count',
            revenue: '$statuses.revenue',
            percentage: {
              $multiply: [{ $divide: ['$statuses.count', '$total'] }, 100],
            },
          },
        },
        { $sort: { count: -1 } },
      ]),
      
      // By Source
      Booking.aggregate([
        ...(Object.keys(match).length > 0 ? [{ $match: match }] : []),
        {
          $group: {
            _id: '$source',
            count: { $sum: 1 },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$count' },
            sources: { $push: { source: '$_id', count: '$count' } },
          },
        },
        { $unwind: '$sources' },
        {
          $project: {
            _id: 0,
            source: '$sources.source',
            count: '$sources.count',
            percentage: {
              $multiply: [{ $divide: ['$sources.count', '$total'] }, 100],
            },
          },
        },
        { $sort: { count: -1 } },
      ]),
      
      // By Service
      Booking.aggregate([
        ...(Object.keys(match).length > 0 ? [{ $match: match }] : []),
        {
          $group: {
            _id: '$serviceId',
            serviceName: { $first: '$serviceName' },
            count: { $sum: 1 },
            revenue: {
              $sum: {
                $cond: [
                  { $in: ['$status', ['CANCELLED', 'REFUNDED']] },
                  0,
                  '$totalPrice',
                ],
              },
            },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 10 },
        {
          $project: {
            _id: 0,
            serviceId: '$_id',
            serviceName: 1,
            count: 1,
            revenue: 1,
          },
        },
      ]),
      
      // Peak Days (Day of Week)
      Booking.aggregate([
        ...(Object.keys(match).length > 0 ? [{ $match: match }] : []),
        {
          $group: {
            _id: { $dayOfWeek: '$flightDate' }, // 1 = Sunday, 7 = Saturday
            totalBookings: { $sum: 1 },
            uniqueDates: { $addToSet: { $dateToString: { format: '%Y-%m-%d', date: '$flightDate' } } },
          },
        },
        {
          $project: {
            dayOfWeek: '$_id',
            totalBookings: 1,
            daysCount: { $size: '$uniqueDates' },
            averageBookings: {
              $divide: ['$totalBookings', { $size: '$uniqueDates' }],
            },
          },
        },
        { $sort: { averageBookings: -1 } },
      ]),
      
      // Peak Hours
      Booking.aggregate([
        ...(Object.keys(match).length > 0 ? [{ $match: match }] : []),
        {
          $addFields: {
            hour: {
              $cond: [
                { $regexMatch: { input: '$flightTime', regex: /^\d{1,2}:\d{2}$/ } },
                { $toInt: { $arrayElemAt: [{ $split: ['$flightTime', ':'] }, 0] } },
                9, // Default to 9 AM if no valid time
              ],
            },
          },
        },
        {
          $group: {
            _id: '$hour',
            totalBookings: { $sum: 1 },
            uniqueDates: { $addToSet: { $dateToString: { format: '%Y-%m-%d', date: '$flightDate' } } },
          },
        },
        {
          $project: {
            hour: '$_id',
            averageBookings: {
              $divide: ['$totalBookings', { $size: '$uniqueDates' }],
            },
          },
        },
        { $sort: { hour: 1 } },
      ]),
    ])
    
    // Map day numbers to names
    const dayNames = ['', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    
    return {
      byStatus: statusResults.map((s: any) => ({
        status: s.status as BookingStatus,
        count: s.count,
        percentage: Math.round(s.percentage * 100) / 100,
        revenue: s.revenue,
      })),
      
      bySource: sourceResults.map((s: any) => ({
        source: s.source,
        count: s.count,
        percentage: Math.round(s.percentage * 100) / 100,
      })),
      
      byService: serviceResults,
      
      peakDays: peakDayResults.map((d: any) => ({
        dayOfWeek: d.dayOfWeek,
        dayName: dayNames[d.dayOfWeek] || 'Unknown',
        averageBookings: Math.round(d.averageBookings * 100) / 100,
      })),
      
      peakHours: peakHourResults.map((h: any) => ({
        hour: h.hour,
        averageBookings: Math.round(h.averageBookings * 100) / 100,
      })),
    }
  }
  
  // ==========================================
  // ADVANCED ANALYTICS
  // ==========================================
  
  /**
   * Get conversion funnel analytics
   */
  async getConversionFunnel(filter: AnalyticsFilter): Promise<{
    stage: string
    count: number
    percentage: number
    dropoffRate: number
  }[]> {
    const match = buildDateMatchStage(filter)
    
    const pipeline = [
      ...(Object.keys(match).length > 0 ? [{ $match: match }] : []),
      {
        $facet: {
          total: [{ $count: 'count' }],
          pending: [{ $match: { status: 'PENDING' } }, { $count: 'count' }],
          confirmed: [{ $match: { status: 'CONFIRMED' } }, { $count: 'count' }],
          completed: [{ $match: { status: 'COMPLETED' } }, { $count: 'count' }],
          cancelled: [{ $match: { status: 'CANCELLED' } }, { $count: 'count' }],
        },
      },
    ]
    
    const results = await Booking.aggregate(pipeline)
    const data = results[0]
    
    const total = data.total[0]?.count || 0
    const pending = data.pending[0]?.count || 0
    const confirmed = data.confirmed[0]?.count || 0
    const completed = data.completed[0]?.count || 0
    const cancelled = data.cancelled[0]?.count || 0
    
    const stages = [
      { stage: 'Total Bookings', count: total },
      { stage: 'Pending', count: pending },
      { stage: 'Confirmed', count: confirmed },
      { stage: 'Completed', count: completed },
    ]
    
    return stages.map((s, i) => {
      const percentage = total > 0 ? (s.count / total) * 100 : 0
      const previousCount = i > 0 ? (stages[i - 1]?.count ?? total) : total
      const dropoffRate = previousCount > 0
        ? ((previousCount - s.count) / previousCount) * 100
        : 0
      
      return {
        ...s,
        percentage: Math.round(percentage * 100) / 100,
        dropoffRate: Math.round(dropoffRate * 100) / 100,
      }
    })
  }
  
  /**
   * Get real-time dashboard metrics
   */
  async getRealTimeMetrics(): Promise<{
    todayBookings: number
    todayRevenue: number
    upcomingFlights: number
    pendingContacts: number
  }> {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    const nextWeek = new Date(today)
    nextWeek.setDate(nextWeek.getDate() + 7)
    
    const pipeline = [
      {
        $facet: {
          // Today's bookings
          today: [
            {
              $match: {
                createdAt: { $gte: today, $lt: tomorrow },
              },
            },
            {
              $group: {
                _id: null,
                count: { $sum: 1 },
                revenue: { $sum: '$totalPrice' },
              },
            },
          ],
          
          // Upcoming flights (next 7 days)
          upcoming: [
            {
              $match: {
                flightDate: { $gte: today, $lte: nextWeek },
                status: { $in: ['PENDING', 'CONFIRMED'] },
              },
            },
            { $count: 'count' },
          ],
          
          // Pending contacts
          pendingContacts: [
            {
              $match: {
                status: 'PENDING',
                contactStatus: 'NOT_CONTACTED',
              },
            },
            { $count: 'count' },
          ],
        },
      },
    ]
    
    const results = await Booking.aggregate(pipeline)
    const data = results[0]
    
    return {
      todayBookings: data.today[0]?.count || 0,
      todayRevenue: data.today[0]?.revenue || 0,
      upcomingFlights: data.upcoming[0]?.count || 0,
      pendingContacts: data.pendingContacts[0]?.count || 0,
    }
  }
}

// ============================================
// SINGLETON EXPORT
// ============================================

export const analyticsService = new AnalyticsService()
