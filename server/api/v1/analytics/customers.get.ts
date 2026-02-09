/**
 * Customer Analytics API
 * GET /api/v1/analytics/customers
 * 
 * Returns customer statistics including new vs returning rates
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
    const customers = await analyticsService.getCustomerAnalytics(filter)
    
    return successResponse(customers)
    
  } catch (error) {
    handleError(error)
  }
})
