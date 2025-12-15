import { create } from 'zustand'
import { membershipApi, type MembershipFilters } from '../api'
import type { MembershipRequest } from '@/types'

interface MembershipState {
  requests: MembershipRequest[]
  isLoading: boolean
  error: string | null
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  
  // Actions
  fetchRequests: (chapterId: string, filters?: MembershipFilters) => Promise<void>
  approveRequest: (chapterId: string, requestId: string, notes?: string) => Promise<void>
  rejectRequest: (chapterId: string, requestId: string, reason: string, canReapply?: boolean) => Promise<void>
  clearError: () => void
}

export const useMembershipStore = create<MembershipState>((set) => ({
  requests: [],
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },

  fetchRequests: async (chapterId: string, filters?: MembershipFilters) => {
    set({ isLoading: true, error: null })
    try {
      const response = await membershipApi.getRequests(chapterId, filters)
      set({
        requests: response.data,
        pagination: response.pagination,
        isLoading: false,
      })
    } catch (error: any) {
      set({
        error: error.message || 'Failed to fetch requests',
        isLoading: false,
      })
    }
  },

  approveRequest: async (chapterId: string, requestId: string, notes?: string) => {
    set({ isLoading: true, error: null })
    try {
      await membershipApi.approveRequest(chapterId, requestId, notes)
      set((state) => ({
        requests: state.requests.filter((r) => r.id !== requestId),
        isLoading: false,
      }))
    } catch (error: any) {
      set({
        error: error.message || 'Failed to approve request',
        isLoading: false,
      })
      throw error
    }
  },

  rejectRequest: async (chapterId: string, requestId: string, reason: string, canReapply = true) => {
    set({ isLoading: true, error: null })
    try {
      await membershipApi.rejectRequest(chapterId, requestId, reason, canReapply)
      set((state) => ({
        requests: state.requests.filter((r) => r.id !== requestId),
        isLoading: false,
      }))
    } catch (error: any) {
      set({
        error: error.message || 'Failed to reject request',
        isLoading: false,
      })
      throw error
    }
  },

  clearError: () => {
    set({ error: null })
  },
}))
