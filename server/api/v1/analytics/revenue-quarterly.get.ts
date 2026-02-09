/**
 * Revenue Quarterly API
 * GET /api/v1/analytics/revenue/quarterly
 * 
 * Returns quarterly revenue with year-over-year comparison
 */
import { z } from 'zod'
import { analyticsService } from '../../../services'
import { validateQuery } from '../../../validators/common.validator'
import { successResponse } from '../../../utils/response'
import { handleError } from '../../../utils/errors'

const querySchema = z.object({
  year: z.coerce.number().int().min(2020).max(2100).optional(),
})

export default defineEventHandler(async (event) => {
  try {
    const { year } = validateQuery(querySchema, event)
    
    const quarterly = await analyticsService.getQuarterlyRevenue(year)
    
    const currentYear = year || new Date().getFullYear()
    
    return successResponse({
      currentYear,
      previousYear: currentYear - 1,
      data: quarterly,
      totalCurrentYear: quarterly.reduce((sum, q) => sum + q.revenue, 0),
      totalPreviousYear: quarterly.reduce((sum, q) => sum + q.previousYearRevenue, 0),
    })
    
  } catch (error) {
    handleError(error)
  }
})
