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
    // The backend returns a list of posts at this endpoint instead of a summary object
    // So we need to aggregate the data client-side
    const response = await apiClient.get<ApiResponse<{ posts: PostAnalyticsDetail[] }>>('/analytics/posts/summary')
    const posts = response.data?.posts || []

    const summary: PostAnalyticsSummary = {
      totalImpressions: 0,
      totalMembersReached: 0,
      totalEngagement: 0,
      totalProfileViews: 0,
      topPerformingPost: null
    }

    let maxEngagement = -1

    posts.forEach(post => {
      summary.totalImpressions += post.discovery.impressions || 0
      summary.totalMembersReached += post.discovery.membersReached || 0
      
      const engagement = (post.engagement.likes || 0) + 
                        (post.engagement.comments || 0) + 
                        (post.engagement.saves || 0) + 
                        (post.engagement.shares || 0)
      
      summary.totalEngagement += engagement
      summary.totalProfileViews += post.profileActivity?.profileViewsFromPost || 0

      if (engagement > maxEngagement) {
        maxEngagement = engagement
        summary.topPerformingPost = post.postId
      }
    })

    return summary
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

  getTotalConnections: async (): Promise<ConnectionAnalytics> => {
    const response = await apiClient.get<ApiResponse<ConnectionAnalytics>>('/analytics/connections/total')
    return response.data!
  },

  // Chapter Admin Dashboard
  getChapterDashboardStats: async (): Promise<import('@/types').ChapterDashboardStats> => {
    const response = await apiClient.get<ApiResponse<import('@/types').ChapterDashboardStats>>('/analytics/chapter-dashboard')
    return response.data!
  }
}
