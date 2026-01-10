import { apiClient } from './client'
import { 
  ApiResponse, 
  PaginatedResponse, 
  Post, 
  CreatePostData, 
  HidePostData,
  PostFilters 
} from '@/types'

export const postsApi = {
  // Feed
  getFeed: async (page = 1, limit = 10): Promise<PaginatedResponse<Post>> => {
    const response = await apiClient.get<any>(`/posts/feed?page=${page}&limit=${limit}`)
    // The feed endpoint returns { posts: [], total: number, page: number, pages: number }
    // We map it to our standard PaginatedResponse
    return {
      data: response.posts,
      pagination: {
        page: response.page,
        limit,
        total: response.total,
        totalPages: response.pages
      }
    }
  },

  // Actions
  createAdminPost: async (data: CreatePostData): Promise<Post> => {
    const response = await apiClient.post<ApiResponse<Post>>('/posts/admin', data)
    return response.data!
  },

  // Admin Controls
  pinPost: async (id: string): Promise<void> => {
    await apiClient.post(`/posts/${id}/pin`, {})
  },

  hidePost: async (id: string, data: HidePostData): Promise<void> => {
    await apiClient.patch(`/admin/posts/${id}/hide`, data)
  },

  unhidePost: async (id: string): Promise<void> => {
    await apiClient.patch(`/admin/posts/${id}/unhide`, {})
  },
  
  deletePost: async (id: string): Promise<void> => {
    await apiClient.delete(`/posts/${id}`)
  }
}
