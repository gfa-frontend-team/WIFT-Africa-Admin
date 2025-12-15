import { apiClient } from './client'
import type { DelayedRequestsStats } from '@/types'

export const verificationApi = {
  // Manually trigger verification delay check
  checkDelays: async (): Promise<{ processed: number; errors: number }> => {
    const response = await apiClient.post<{ message: string; processed: number; errors: number }>(
      '/admin/verification/check-delays'
    )
    return {
      processed: response.processed,
      errors: response.errors,
    }
  },

  // Get delayed requests statistics
  getDelayedStats: async (): Promise<DelayedRequestsStats> => {
    const response = await apiClient.get<DelayedRequestsStats>('/admin/verification/delayed-stats')
    return response
  },
}
