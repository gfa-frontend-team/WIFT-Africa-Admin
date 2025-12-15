import { apiClient } from './client'
import type { Chapter, PaginatedResponse, PlatformStatistics, ChapterDetailStats } from '@/types'

export interface ChapterFilters {
  search?: string
  country?: string
  isActive?: boolean
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface CreateChapterData {
  name: string
  code: string
  country: string
  city?: string
  description?: string
  missionStatement?: string
  currentPresident?: string
  presidentEmail?: string
  presidentPhone?: string
  email?: string
  phone?: string
  address?: string
  website?: string
  facebookUrl?: string
  twitterHandle?: string
  instagramHandle?: string
  linkedinUrl?: string
  foundedDate?: string
}

// Helper function to transform MongoDB _id to id
const transformChapter = (chapter: any): Chapter => ({
  ...chapter,
  id: chapter._id || chapter.id,
  adminIds: Array.isArray(chapter.adminIds) 
    ? chapter.adminIds.map((admin: any) => 
        typeof admin === 'object' ? { ...admin, id: admin._id || admin.id } : admin
      )
    : chapter.adminIds,
})

export const chaptersApi = {
  // Get all chapters with filters
  getChapters: async (filters?: ChapterFilters): Promise<PaginatedResponse<Chapter>> => {
    const params = new URLSearchParams()
    if (filters?.search) params.append('search', filters.search)
    if (filters?.country) params.append('country', filters.country)
    if (filters?.isActive !== undefined) params.append('isActive', String(filters.isActive))
    if (filters?.page) params.append('page', String(filters.page))
    if (filters?.limit) params.append('limit', String(filters.limit))
    if (filters?.sortBy) params.append('sortBy', filters.sortBy)
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder)

    const response = await apiClient.get<{ chapters: any[]; pagination: any }>(
      `/admin/chapters?${params.toString()}`
    )
    
    // Backend returns {chapters, pagination} with pagination.pages instead of totalPages
    // Transform _id to id for all chapters
    return {
      data: response.chapters.map(transformChapter),
      pagination: {
        page: response.pagination.page,
        limit: response.pagination.limit,
        total: response.pagination.total,
        totalPages: response.pagination.pages,
      },
    }
  },

  // Get single chapter
  getChapter: async (id: string): Promise<Chapter> => {
    const response = await apiClient.get<{ chapter: any; stats: ChapterDetailStats }>(`/admin/chapters/${id}`)
    if (response.chapter) {
      return { ...transformChapter(response.chapter), stats: response.stats }
    }
    throw new Error('Failed to fetch chapter')
  },

  // Create chapter
  createChapter: async (data: CreateChapterData): Promise<Chapter> => {
    const response = await apiClient.post<{ message: string; chapter: any }>('/admin/chapters', data)
    if (response.chapter) {
      return transformChapter(response.chapter)
    }
    throw new Error('Failed to create chapter')
  },

  // Update chapter
  updateChapter: async (id: string, data: Partial<CreateChapterData>): Promise<Chapter> => {
    const response = await apiClient.patch<{ message: string; chapter: any }>(`/admin/chapters/${id}`, data)
    if (response.chapter) {
      return transformChapter(response.chapter)
    }
    throw new Error('Failed to update chapter')
  },

  // Deactivate chapter
  deactivateChapter: async (id: string): Promise<void> => {
    await apiClient.delete<{ message: string; chapter: any }>(`/admin/chapters/${id}`)
  },

  // Reactivate chapter
  reactivateChapter: async (id: string): Promise<void> => {
    await apiClient.post<{ message: string; chapter: any }>(`/admin/chapters/${id}/reactivate`)
  },

  // Add chapter admin
  addChapterAdmin: async (chapterId: string, userId: string): Promise<void> => {
    await apiClient.post<{ message: string; chapter: any }>(`/admin/chapters/${chapterId}/admins`, { userId })
  },

  // Remove chapter admin
  removeChapterAdmin: async (chapterId: string, userId: string): Promise<void> => {
    await apiClient.delete<{ message: string; chapter: any }>(`/admin/chapters/${chapterId}/admins/${userId}`)
  },

  // Get countries list
  getCountries: async (): Promise<string[]> => {
    const response = await apiClient.get<{ countries: string[] }>('/admin/chapters/countries')
    return response.countries || []
  },

  // Get platform statistics
  getStatistics: async (): Promise<PlatformStatistics> => {
    const response = await apiClient.get<PlatformStatistics>('/admin/chapters/statistics')
    return response
  },
}
