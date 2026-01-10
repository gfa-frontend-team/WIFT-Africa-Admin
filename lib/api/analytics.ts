import { apiClient } from './client'
import { 
  ApiResponse, 
  PaginatedResponse, 
  PostAnalyticsSummary, 
  PostAnalyticsDetail, 
  ConnectionAnalytics 
} from '@/types'

export const analyticsApi = {
  // Post Analytics
  getPostSummary: async (): Promise<PostAnalyticsSummary> => {
    const response = await apiClient.get<ApiResponse<PostAnalyticsSummary>>('/analytics/posts/summary')
    return response.data!
  },

  getPostAnalyticsList: async (page = 1, limit = 10): Promise<PaginatedResponse<PostAnalyticsDetail>> => {
    // The backend returns { posts: [], total: number, pages: number } in the data field
    // We need to type this specific raw response
    type PostListResponse = {
        posts: PostAnalyticsDetail[]
        total: number
        pages: number
    }
    
    const response = await apiClient.get<ApiResponse<PostListResponse>>(`/analytics/posts?page=${page}&limit=${limit}`)
    const rawData = response.data!
    
    // Map to standard PaginatedResponse format expected by UI
    return {
        data: rawData.posts,
        pagination: {
            page,
            limit,
            total: rawData.total,
            totalPages: rawData.pages
        }
    }
  },

  getPostAnalyticsDetail: async (postId: string): Promise<PostAnalyticsDetail> => {
    const response = await apiClient.get<ApiResponse<PostAnalyticsDetail>>(`/analytics/posts/${postId}`)
    return response.data!
  },

  // Connection Analytics
  getTotalConnections: async (): Promise<ConnectionAnalytics> => {
    const response = await apiClient.get<ApiResponse<ConnectionAnalytics>>('/analytics/connections/total')
    return response.data!
  },
}
