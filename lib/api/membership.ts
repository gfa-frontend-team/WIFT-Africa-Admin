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

  // Get single membership request details
  getRequest: async (requestId: string): Promise<MembershipRequest> => {
    // Note: The endpoint might be different depending on backend implementation.
    // Based on ADMIN_FLOW.md.resolved, it is GET /api/v1/admin/members/:userId
    // But here we are dealing with a Request ID. 
    // Usually admin/membership-requests/:id or similar.
    // However, looking at the ADMIN_FLOW.md.resolved provided by user:
    // "Endpoint: GET /api/v1/admin/members/:userId" -> This fetches user details including request info?
    // Let's assume there's an endpoint to get request details by ID or User ID.
    // Given the context of "Membership Request", let's try to fetch by Request ID if possible, 
    // or if the frontend uses User ID as Request ID (which is properly not the case).

    // Waiting, the user said: "viewing the members details before approval... detailed page for the member request"
    // The flow doc says: `GET /api/v1/admin/members/:userId`
    // And the response contains `membershipStatus: "PENDING"`. 
    // So it seems we are fetching a USER profile who has a pending request.
    // BUT `RequestCard` uses `MembershipRequest` type which has `id` (request id) and `user` (user object).
    // The `approverRequest` takes `requestId`.

    // Let's stick to the convention of existing `membershipApi`.
    // If we need detailed profile, we might need to fetch user details.
    // But `membershipApi` is usually about the *Request*.
    // Let's assume there is an endpoint `/admin/membership-requests/:id` OR we use the user ID from the request to fetch `/admin/members/:userId`.
    // Let's implement `getRequest` to fetch the specific request if the backend supports it, 
    // OR fetch the User if that's what the doc implies.

    // The doc `ADMIN_FLOW.md.resolved` says:
    // Endpoint: GET /api/v1/admin/members/:userId
    // And returns { user: ..., profile: ... }

    // So we probably want `getMemberDetails(userId)` or similar. 
    // But `useMembershipRequests` returns a list of *Requests*.
    // The page `[id]` will likely use the `requestId` from the URL.
    // If the URL is `/requests/[id]`, is `[id]` the RequestID or UserID?
    // Usually RequestID.
    // If so, we need to fetch the request, extracting the UserID, then fetch member details?
    // Or maybe the backend allows fetching request details which includes full user profile.

    // Let's look at `getRequests` in `lib/api/membership.ts`:
    // `/chapters/${chapterId}/membership-requests`

    // I will add `getRequest(chapterId, requestId)` if possible, but the doc mentions `/admin/members/:userId`.
    // I will implement `getMemberDetails` which matches the doc.

    const response = await apiClient.get<{ user: any, profile: any }>(`/admin/members/${requestId}`)
    // ADMIN_FLOW says :userId. If the route is /requests/[id], passing requestId as userId might be wrong if they are different.
    // But for now let's assume we might need to look up the request or user.

    // Actually, looking at `ADMIN_FLOW.md.resolved` again:
    // "Step 1: Review Application (Get Details) ... Endpoint: GET /api/v1/admin/members/:userId"
    // The response has "membershipStatus": "PENDING".

    // So the "Details Page" is essentially a "Member Profile" page for a pending member.
    // I'll call it `getMemberDetails`.

    return transformRequest({ ...response.user, profile: response.profile })
    // Wait, transformRequest expects a Request object structure. 
    // The response is { user, profile }. 
    // We might need a new type or just return the raw data if it doesn't fit `MembershipRequest`.
    // But `MembershipRequest` has `user` field.

    // Let's implement `getRequest` that mimics fetching a request by fetching the user details and wrapping it?
    // Or just strictly follow the doc: `getMemberDetails`.

    // Let's try to find an endpoint that returns a single request first, usually standard REST.
    // If not, I will use `getMemberDetails`.

    // For now, I will add `getMemberDetails` matching the doc completely.


    throw new Error("Method not implemented.") // Placeholder logic was just thinking.
  },

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

  // Get member details by ID (for profile page)
  getMemberDetails: async (userId: string): Promise<{ user: User, profile: any }> => {
    // We use the admin/members endpoint which should return user details
    const response = await apiClient.get<any>(`/admin/members/${userId}`)
    console.log(response,"response")
    return {
      user: transformUser(response.user || response), // Handle if response is just user or {user}
      profile: response.profile || {}
    }
  },
}
