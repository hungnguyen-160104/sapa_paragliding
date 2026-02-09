/**
 * Revenue Monthly API
 * GET /api/v1/analytics/revenue/monthly
 * 
 * Returns monthly revenue for a specific year
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
    
    const monthly = await analyticsService.getMonthlyRevenue(year)
    
    return successResponse({
      year: year || new Date().getFullYear(),
      data: monthly,
      total: monthly.reduce((sum, m) => sum + m.revenue, 0),
    })
    
  } catch (error) {
    handleError(error)
  }
})
