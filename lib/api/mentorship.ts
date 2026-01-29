import { apiClient } from './client'
import { Mentorship, CreateMentorshipData, UpdateMentorshipData, MentorshipFilters, PaginatedResponse } from '@/types'

export const mentorshipApi = {
    // Get all mentorships
    getAllMentorships: async (filters?: MentorshipFilters): Promise<PaginatedResponse<Mentorship>> => {
        return await apiClient.get('/mentorships', { params: filters })
    },

    // Get single mentorship
    getMentorshipById: async (id: string): Promise<{ data: Mentorship }> => {
        return await apiClient.get(`/mentorships/${id}`)
    },

    // Create mentorship
    createMentorship: async (data: CreateMentorshipData): Promise<{ message: string, data: Mentorship }> => {
        return await apiClient.post('/mentorships', data)
    },

    // Update mentorship
    updateMentorship: async (id: string, data: UpdateMentorshipData): Promise<{ message: string, data: Mentorship }> => {
        return await apiClient.patch(`/mentorships/${id}`, data)
    },

    // Delete mentorship
    deleteMentorship: async (id: string): Promise<{ message: string }> => {
        return await apiClient.delete(`/mentorships/${id}`)
    },
}
