/**
 * Real-time Dashboard Metrics API
 * GET /api/v1/analytics/realtime
 * 
 * Returns real-time metrics for dashboard widgets
 */
import { analyticsService } from '../../../services'
import { successResponse } from '../../../utils/response'
import { handleError } from '../../../utils/errors'

export default defineEventHandler(async (event) => {
  try {
    // Get real-time metrics
    const metrics = await analyticsService.getRealTimeMetrics()
    
    return successResponse({
      ...metrics,
      timestamp: new Date().toISOString(),
    })
    
  } catch (error) {
    handleError(error)
  }
})
