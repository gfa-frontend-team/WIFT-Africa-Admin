import { apiClient } from './client'
import { Resource, CreateResourceData, UpdateResourceData, ResourceFilters, PaginatedResponse } from '@/types'

export const resourcesApi = {
    // Get all resources with pagination and filters
    getAllResources: async (filters?: ResourceFilters): Promise<PaginatedResponse<Resource>> => {
        return await apiClient.get('/resources', { params: filters })
    },

    // Get a single resource by ID
    getResource: async (id: string): Promise<Resource> => {
        const data = await apiClient.get<{ data: Resource }>(`/resources/${id}`)
        return data.data
    },

    // Create a new resource
    createResource: async (data: CreateResourceData): Promise<Resource> => {
        const formData = new FormData()
        formData.append('title', data.title)
        formData.append('resourceType', data.resourceType)

        if (data.file) formData.append('file', data.file)
        if (data.externalLink) formData.append('externalLink', data.externalLink)
        if (data.thumbnail) formData.append('thumbnail', data.thumbnail)
        if (data.description) formData.append('description', data.description)
        if (data.status) formData.append('status', data.status)

        // Note: apiClient automatically handles Content-Type for FormData? 
        // Usually axios does, but let's be safe or check client implementation.
        // Our client wrapper separates data and config.
        return await apiClient.post('/resources', formData, {
            headers: {
                'Content-Type': undefined
            }
        })
    },

    // Update a resource
    updateResource: async (id: string, data: UpdateResourceData): Promise<Resource> => {
        const formData = new FormData()
        if (data.title) formData.append('title', data.title)
        if (data.description) formData.append('description', data.description)
        if (data.resourceType) formData.append('resourceType', data.resourceType)
        if (data.status) formData.append('status', data.status)
        if (data.file) formData.append('file', data.file)
        if (data.externalLink) formData.append('externalLink', data.externalLink)
        if (data.thumbnail) formData.append('thumbnail', data.thumbnail)

        return await apiClient.patch(`/resources/${id}`, formData, {
            headers: {
                'Content-Type': undefined
            }
        })
    },

    // Delete a resource
    deleteResource: async (id: string): Promise<void> => {
        await apiClient.delete(`/resources/${id}`)
    },
}
