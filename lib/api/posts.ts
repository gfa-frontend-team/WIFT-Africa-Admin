import { apiClient } from './client'
import { 
  ApiResponse, 
  PaginatedResponse, 
  Post, 
  CreatePostData, 
  HidePostData,
  PostFilters 
} from '@/types'

// Helper to map backend _id to frontend id
const mapPost = (data: any): Post => {
  return {
    ...data,
    id: data._id || data.id,
    author: data.author ? {
      ...data.author,
      id: data.author._id || data.author.id
    } : undefined,
    media: data.media?.map((m: any) => ({
      ...m,
      id: m._id || m.id
    }))
  }
}

export const postsApi = {
  // Feed
  getFeed: async (page = 1, limit = 10): Promise<PaginatedResponse<Post>> => {
    const response = await apiClient.get<any>(`/posts/feed?page=${page}&limit=${limit}`)
    
    return {
      data: (response.posts || []).map(mapPost),
      pagination: {
        page: response.page,
        limit,
        total: response.total,
        totalPages: response.pages
      }
    }
  },

  getPost: async (id: string): Promise<Post> => {
    // Ideally the backend should return the post directly or wrapped in data
    // The user error suggested "Invalid post ID", likely because we sent "undefined"
    // But also check if the single endpoint returns _id
    const response = await apiClient.get<any>(`/posts/${id}`)
    // Check if response.data is the post or response is the post
    const postData = response.data || response
    return mapPost(postData)
  },

  // Actions
  createAdminPost: async (data: CreatePostData): Promise<Post> => {
    const response = await apiClient.post<any>('/posts/admin', data)
    return mapPost(response.data || response)
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
