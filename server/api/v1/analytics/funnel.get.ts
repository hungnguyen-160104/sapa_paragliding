/**
 * Conversion Funnel Analytics API
 * GET /api/v1/analytics/funnel
 * 
 * Returns booking conversion funnel with dropoff rates
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
    const funnel = await analyticsService.getConversionFunnel(filter)
    
    return successResponse({
      stages: funnel,
      overallConversionRate: funnel.length > 0
        ? (funnel[funnel.length - 1]?.percentage ?? 0)
        : 0,
    })
    
  } catch (error) {
    handleError(error)
  }
})
