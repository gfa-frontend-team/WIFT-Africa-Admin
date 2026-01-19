import { apiClient } from './client'
import type { User } from '@/types'

export interface UpdateMemberStatusData {
  status: 'APPROVED' | 'SUSPENDED'
  reason?: string
}

export const adminApi = {
  // Update member status (Suspend/Reinstate)
  updateMemberStatus: async (userId: string, data: UpdateMemberStatusData): Promise<User> => {
    const response = await apiClient.patch<{ message: string; user: any }>(
      `/admin/${userId}/membership-status`,
      data
    )
    
    // Transform _id to id if necessary, though User type usually handles it via generic transform in other files
    // Assuming backend returns standard user object structure
    const user = response.user
    return {
      ...user,
      id: user._id || user.id,
    }
  },
}
