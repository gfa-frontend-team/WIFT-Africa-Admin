import { apiClient } from './client'
import { 
  ApiResponse, 
  PaginatedResponse, 
  BroadcastConversation, 
  CreateBroadcastData,
  MessageFilters
} from '@/types'

export const messagesApi = {
  getBroadcasts: async (page = 1, limit = 20): Promise<PaginatedResponse<BroadcastConversation>> => {
    // Docs say use /messages/conversations with type=BROADCAST
    // Response has { conversations: [], total: number }
    const response = await apiClient.get<any>(`/messages/conversations?type=BROADCAST&page=${page}&limit=${limit}`)
    
    // Map backend response to PaginatedResponse
    return {
      data: response.conversations,
      pagination: {
        page,
        limit,
        total: response.total,
        totalPages: Math.ceil(response.total / limit)
      }
    }
  },

  sendBroadcast: async (data: CreateBroadcastData): Promise<void> => {
    await apiClient.post<ApiResponse<void>>('/messages/broadcast', data)
  }
}
