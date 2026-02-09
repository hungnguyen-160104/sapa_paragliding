/**
 * Revenue Analytics API
 * GET /api/v1/analytics/revenue
 * 
 * Returns revenue trends with configurable time granularity
 * Supports: day, week, month, quarter, year grouping
 */
import { analyticsService } from '../../../services'
import { validateQuery, analyticsFilterSchema } from '../../../validators/common.validator'
import { successResponse } from '../../../utils/response'
import { handleError } from '../../../utils/errors'

export default defineEventHandler(async (event) => {
  try {
    // Validate query parameters
    const filter = validateQuery(analyticsFilterSchema, event)
    
    // Call analytics service
    const revenue = await analyticsService.getRevenueTrends(filter)
    
    return successResponse(revenue)
    
  } catch (error) {
    handleError(error)
  }
})
