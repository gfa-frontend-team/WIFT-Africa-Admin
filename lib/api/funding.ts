import { apiClient } from './client'
import { FundingOpportunity, CreateFundingData, UpdateFundingData, FundingFilters, PaginatedResponse } from '@/types'

export const fundingApi = {
    // Get all opportunities
    getAllOpportunities: async (filters?: FundingFilters): Promise<PaginatedResponse<FundingOpportunity>> => {
        return await apiClient.get('/funding-opportunities', { params: filters })
    },

    // Get single opportunity
    getOpportunityById: async (id: string): Promise<{ data: FundingOpportunity }> => {
        return await apiClient.get(`/funding-opportunities/${id}`)
    },

    // Create opportunity
    createOpportunity: async (data: CreateFundingData): Promise<{ message: string, data: FundingOpportunity }> => {
        return await apiClient.post('/funding-opportunities', data)
    },

    // Update opportunity
    updateOpportunity: async (id: string, data: UpdateFundingData): Promise<{ message: string, data: FundingOpportunity }> => {
        return await apiClient.patch(`/funding-opportunities/${id}`, data)
    },

    // Delete opportunity
    deleteOpportunity: async (id: string): Promise<{ message: string }> => {
        return await apiClient.delete(`/funding-opportunities/${id}`)
    },
}
