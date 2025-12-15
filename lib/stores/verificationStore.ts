import { create } from 'zustand'
import { verificationApi } from '../api'
import type { DelayedRequestsStats } from '@/types'

interface VerificationState {
  delayedStats: DelayedRequestsStats | null
  isLoading: boolean
  error: string | null
  
  // Actions
  fetchDelayedStats: () => Promise<void>
  triggerDelayCheck: () => Promise<{ processed: number; errors: number }>
  clearError: () => void
}

export const useVerificationStore = create<VerificationState>((set) => ({
  delayedStats: null,
  isLoading: false,
  error: null,

  fetchDelayedStats: async () => {
    set({ isLoading: true, error: null })
    try {
      const stats = await verificationApi.getDelayedStats()
      set({
        delayedStats: stats,
        isLoading: false,
      })
    } catch (error: any) {
      set({
        error: error.message || 'Failed to fetch delayed stats',
        isLoading: false,
      })
    }
  },

  triggerDelayCheck: async () => {
    set({ isLoading: true, error: null })
    try {
      const result = await verificationApi.checkDelays()
      set({ isLoading: false })
      return result
    } catch (error: any) {
      set({
        error: error.message || 'Failed to trigger delay check',
        isLoading: false,
      })
      throw error
    }
  },

  clearError: () => {
    set({ error: null })
  },
}))
