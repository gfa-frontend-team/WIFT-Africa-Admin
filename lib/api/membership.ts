import { apiClient } from './client'
import type { MembershipRequest, PaginatedResponse, User } from '@/types'

export interface MembershipFilters {
  status?: 'PENDING' | 'APPROVED' | 'REJECTED'
  memberType?: 'NEW' | 'EXISTING'
  page?: number
  limit?: number
}

// Helper function to transform MongoDB _id to id
const transformUser = (user: any): User => ({
  ...user,
  id: user._id || user.id,
})

const transformRequest = (request: any): MembershipRequest => ({
  ...request,
  id: request._id || request.id,
  user: request.user ? transformUser(request.user) : undefined,
  chapter: request.chapter ? {
    ...request.chapter,
    id: request.chapter._id || request.chapter.id,
  } : undefined,
  reviewer: request.reviewer ? transformUser(request.reviewer) : undefined,
})

export const membershipApi = {
  // Get membership requests for a chapter
  getRequests: async (chapterId: string, filters?: MembershipFilters): Promise<PaginatedResponse<MembershipRequest>> => {
    const params = new URLSearchParams()
    if (filters?.status) params.append('status', filters.status)
    if (filters?.memberType) params.append('memberType', filters.memberType)
    if (filters?.page) params.append('page', String(filters.page))
    if (filters?.limit) params.append('limit', String(filters.limit))

    const response = await apiClient.get<{ requests: any[] }>(
      `/chapters/${chapterId}/membership-requests?${params.toString()}`
    )
    
    // Backend returns {requests} array without pagination for pending requests
    // Transform _id to id for all requests
    return {
      data: response.requests.map(transformRequest),
      pagination: {
        page: 1,
        limit: response.requests.length,
        total: response.requests.length,
        totalPages: 1,
      },
    }
  },

  // Approve membership request
  approveRequest: async (chapterId: string, requestId: string, notes?: string): Promise<void> => {
    await apiClient.post<{ message: string; request: any }>(
      `/chapters/${chapterId}/membership-requests/${requestId}/approve`,
      notes ? { notes } : undefined
    )
  },

  // Reject membership request
  rejectRequest: async (chapterId: string, requestId: string, reason: string, canReapply = true): Promise<void> => {
    await apiClient.post<{ message: string; request: any }>(
      `/chapters/${chapterId}/membership-requests/${requestId}/reject`,
      { reason, canReapply }
    )
  },

  // Get chapter members
  getMembers: async (chapterId: string, page = 1, limit = 20): Promise<PaginatedResponse<User>> => {
    const response = await apiClient.get<{ members: any[] }>(
      `/chapters/${chapterId}/members?page=${page}&limit=${limit}`
    )
    
    // Backend returns {members} array
    // Transform _id to id for all members
    return {
      data: response.members.map(transformUser),
      pagination: {
        page: 1,
        limit: response.members.length,
        total: response.members.length,
        totalPages: 1,
      },
    }
  },
}
