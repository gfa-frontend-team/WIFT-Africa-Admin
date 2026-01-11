import { apiClient } from './client'
import { 
  ApiResponse, 
  PaginatedResponse, 
  Post, 
  CreatePostData, 
  HidePostData,
  PostFilters,
  Comment,
  PostAnalytics
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
    const response = await apiClient.get<any>(`/posts/${id}`)
    const postData = response.data || response
    return mapPost(postData)
  },

  // Interactions (Comments)
  getComments: async (postId: string): Promise<Comment[]> => {
    const response = await apiClient.get<any>(`/posts/${postId}/comments`)
    // Response might be array directly or { comments: [...] }
    const comments = Array.isArray(response) ? response : (response.comments || response.data || [])
    
    return comments.map((c: any) => ({
      ...c,
      id: c._id || c.id,
      author: c.author ? {
        ...c.author,
        id: c.author._id || c.author.id
      } : undefined
    }))
  },

  deleteComment: async (commentId: string): Promise<void> => {
    await apiClient.delete(`/posts/comments/${commentId}`)
  },

  // Analytics
  getPostAnalytics: async (postId: string): Promise<PostAnalytics> => {
    const response = await apiClient.get<any>(`/posts/${postId}/analytics`)
    return response.data || response // Assuming structure matches interface
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
