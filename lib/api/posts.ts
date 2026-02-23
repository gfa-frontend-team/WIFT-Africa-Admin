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
    isHidden: data.isDeleted || data.isHidden || false, // Map backend isDeleted to frontend isHidden
    author: data.author ? {
      ...data.author,
      id: data.author._id || data.author.id
    } : undefined,
    media: data.media?.map((m: any) => ({
      ...m,
      id: m._id || m.id
    })) || [],
    // Map backend flat stats to nested stats object
    stats: {
      likes: data.likesCount || 0,
      comments: data.commentsCount || 0,
      shares: data.sharesCount || 0,
      saves: data.savesCount || 0
    }
  }
}

export const postsApi = {
  // Feed
  getFeed: async (page = 1, limit = 10, filters?: PostFilters): Promise<PaginatedResponse<Post>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    })
    
    if (filters?.status) params.append('status', filters.status)
    if (filters?.chapterId) params.append('chapterId', filters.chapterId)
    if (filters?.search) params.append('search', filters.search)
    
    const response = await apiClient.get<any>(`/admin/posts?${params.toString()}`)
    
    return {
      data: (response.posts || []).map(mapPost),
      pagination: {
        page: response.page || page,
        limit,
        total: response.total || 0,
        totalPages: response.pages || 0
      }
    }
  },

  getPost: async (id: string): Promise<Post> => {
    const response = await apiClient.get<any>(`/admin/posts/${id}`)
    const postData = response.post || response.data || response
    return mapPost(postData)
  },

  // Interactions (Comments)
  getComments: async (postId: string, page = 1, limit = 50): Promise<Comment[]> => {
    const response = await apiClient.get<any>(`/admin/posts/${postId}/comments?page=${page}&limit=${limit}`)
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
    await apiClient.delete(`/admin/comments/${commentId}`)
  },

  // Analytics
  getPostAnalytics: async (postId: string): Promise<PostAnalytics> => {
    const response = await apiClient.get<any>(`/admin/posts/${postId}/analytics`)
    return response.data || response // Assuming structure matches interface
  },

  // Actions
  createAdminPost: async (data: CreatePostData): Promise<Post> => {
    const response = await apiClient.post<any>('/posts/admin', data)
    return mapPost(response.data || response)
  },

  // Admin Controls
  pinPost: async (id: string): Promise<void> => {
    await apiClient.post(`/admin/posts/${id}/pin`, {})
  },

  hidePost: async (id: string, data: HidePostData): Promise<void> => {
    await apiClient.patch(`/admin/posts/${id}/hide`, data)
  },

  unhidePost: async (id: string): Promise<void> => {
    await apiClient.patch(`/admin/posts/${id}/unhide`, {})
  },
  
  deletePost: async (id: string, reason: string): Promise<void> => {
    await apiClient.delete(`/admin/posts/${id}`, { data: { reason } })
  }
}
