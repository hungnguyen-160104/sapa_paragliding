/**
 * Analytics Overview API
 * GET /api/v1/analytics/overview
 * 
 * Returns comprehensive dashboard statistics with growth metrics
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
    const overview = await analyticsService.getOverview(filter)
    
    return successResponse(overview)
    
  } catch (error) {
    handleError(error)
  }
})
