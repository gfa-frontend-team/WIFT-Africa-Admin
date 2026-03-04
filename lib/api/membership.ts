/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiClient } from './client'
import type { MembershipRequest, PaginatedResponse, User } from '@/types'

export type MembershipRequestStatus = 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED'

export interface MembershipFilters {
  status?: MembershipRequestStatus
  memberType?: 'NEW' | 'EXISTING'
  page?: number
  limit?: number
}

export interface AdminMembershipFilters {
  status?: MembershipRequestStatus
  chapterId?: string
  page?: number
  limit?: number
}

// Helper function to transform MongoDB _id to id
const transformUser = (user: any): User => ({
  ...user,
  id: user._id || user.id,
  chapter:
    user.chapter && typeof user.chapter === 'object'
      ? {
          ...user.chapter,
          id: user.chapter._id || user.chapter.id,
        }
      : user.chapter,
})

const transformRequest = (request: any): MembershipRequest => ({
  ...request,
  id: request._id || request.id,
  user: request.user ? transformUser(request.user) : undefined,
  chapter: request.chapter
    ? {
        ...request.chapter,
        id: request.chapter._id || request.chapter.id,
      }
    : undefined,
  reviewer: request.reviewer ? transformUser(request.reviewer) : undefined,
})

export const membershipApi = {
  // Get membership requests for a chapter with pagination
  getRequests: async (chapterId: string, filters?: MembershipFilters): Promise<PaginatedResponse<MembershipRequest>> => {
    const params = new URLSearchParams()
    if (filters?.status) params.append('status', filters.status)
    if (filters?.memberType) params.append('memberType', filters.memberType)
    if (filters?.page) params.append('page', String(filters.page))
    if (filters?.limit) params.append('limit', String(filters.limit))

    const response = await apiClient.get<{
      requests: any[]
      pagination?: {
        page: number
        limit: number
        total: number
        pages: number
      }
    }>(`/chapters/${chapterId}/membership-requests?${params.toString()}`)

    // Transform _id to id for all requests
    return {
      data: response.requests.map(transformRequest),
      pagination: response.pagination || {
        page: filters?.page || 1,
        limit: filters?.limit || 20,
        total: response.requests.length,
        pages: 1,
      },
    }
  },

  // Get all membership requests (Super Admin — paginated, global)
  getAdminRequests: async (filters?: AdminMembershipFilters): Promise<PaginatedResponse<MembershipRequest>> => {
    const params = new URLSearchParams()
    if (filters?.status && filters.status !== 'ALL') params.append('status', filters.status)
    if (filters?.chapterId) params.append('chapterId', filters.chapterId)
    if (filters?.page) params.append('page', String(filters.page))
    if (filters?.limit) params.append('limit', String(filters.limit))

    const response = await apiClient.get<{
      requests: any[]
      pagination?: {
        page: number
        limit: number
        total: number
        pages: number
      }
    }>(`/admin/membership-requests?${params.toString()}`)

    return {
      data: response.requests.map(transformRequest),
      pagination: response.pagination || {
        page: filters?.page || 1,
        limit: filters?.limit || 20,
        total: response.requests.length,
        pages: 1,
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
  rejectRequest: async (
    chapterId: string,
    requestId: string,
    reason: string,
    canReapply = true
  ): Promise<void> => {
    await apiClient.post<{ message: string; request: any }>(
      `/chapters/${chapterId}/membership-requests/${requestId}/reject`,
      { reason, canReapply }
    )
  },

  // Get chapter members with pagination
  getMembers: async (chapterId: string, page = 1, limit = 20): Promise<PaginatedResponse<User>> => {
    const response = await apiClient.get<{
      members: any[]
      pagination?: {
        page: number
        limit: number
        total: number
        pages: number
      }
    }>(`/chapters/${chapterId}/members?page=${page}&limit=${limit}`)

    // Transform _id to id for all members
    return {
      data: response.members.map(transformUser),
      pagination: response.pagination || {
        page: 1,
        limit: response.members.length,
        total: response.members.length,
        pages: 1,
      },
    }
  },

  // Get member details by ID (for profile page)
  getMemberDetails: async (userId: string): Promise<{ user: User; profile: any }> => {
    const response = await apiClient.get<any>(`/admin/members/${userId}`)
    console.log(response, 'response')
    return {
      user: transformUser(response.user || response), // Handle if response is just user or {user}
      profile: response.profile || {},
    }
  },
}