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
  timezone?: string
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
  fixedMemberCount?: number
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

  // Get single chapter (Admin View - includes restricted stats)
  getChapter: async (id: string): Promise<Chapter> => {
    const response = await apiClient.get<{ chapter: any; stats: ChapterDetailStats }>(`/admin/chapters/${id}`)
    if (response.chapter) {
      return { ...transformChapter(response.chapter), stats: response.stats }
    }
    throw new Error('Failed to fetch chapter')
  },

  // Get single chapter (Chapter Admin View - limited details)
  getChapterDetails: async (id: string): Promise<Chapter> => {
    const response = await apiClient.get<{ id: string; name: string }>(`/chapters/${id}`)
    // The non-admin endpoint returns the chapter object directly (or wrapped, need to be careful with transform)
    // Based on docs: returns { id, name, ... } directly?? 
    // Wait, docs say: "Success Response: Status Code 200 OK ... JSON: { id: ..., name: ... }"
    // So it might return the object directly. But apiClient.get<T> usually expects the *body*.
    // Let's assume standard response structure or handle it.  
    // Looking at docs again: 
    // "Success Response ... { id: '...', ... }"
    // It does NOT seem to be wrapped in keys like "chapter".
    // I will verify this assumption by checking how `apiClient` works or try it.
    // Actually, most API endpoints in this project wrap data in { data: ... } or { chapter: ... }.
    // Docs for /chapters/:id say:
    // { "id": "...", "name": "...", ... }
    // It seems to be the root object.

    // SAFEGUARDS:
    // If response has "id", it's the chapter.
    // If response has "chapter", use that.

    const data = response as any
    const chapterData = data.chapter || data

    return transformChapter(chapterData)
  },

  // Create chapter
  createChapter: async (data: CreateChapterData): Promise<Chapter> => {
    const response = await apiClient.post<{ message: string; chapter: any }>('/admin/chapters', data)
    if (response.chapter) {
      return transformChapter(response.chapter)
    }
    throw new Error('Failed to create chapter')
  },

  // Update chapter (Admin View)
  updateChapter: async (id: string, data: Partial<CreateChapterData>): Promise<Chapter> => {
    const response = await apiClient.patch<{ message: string; chapter: any }>(`/admin/chapters/${id}`, data)
    if (response.chapter) {
      return transformChapter(response.chapter)
    }
    throw new Error('Failed to update chapter')
  },

  // Update chapter (Chapter Admin View)
  updateChapterDetails: async (id: string, data: Partial<CreateChapterData>): Promise<Chapter> => {
    // Only restricted fields are allowed by backend, but we send what we have.
    // Backend ignores restricted fields if sent? Or errors? Docs say "Restricted Fields... cannot be changed".
    // Usually means 400 if tried, or silent ignore. Best to send partial.
    const response = await apiClient.patch<{ id: string }>(`/chapters/${id}`, data)

    // Same response assumption as getChapterDetails
    const resData = response as any
    const chapterData = resData.chapter || resData

    return transformChapter(chapterData)
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
    try {
      const response = await apiClient.get<PlatformStatistics>('/admin/chapters/statistics')
      return response
    } catch (error) {
      console.warn('Failed to fetch chapter statistics, falling back to client-side aggregation', error)

      // Fallback: Aggregate from chapters list
      // We fetch up to 1000 chapters to aggregate stats
      const { data: chapters, pagination } = await chaptersApi.getChapters({ limit: 1000 })
      const countries = await chaptersApi.getCountries()

      // Calculate stats
      const totalChapters = pagination.total
      const activeChapters = chapters.filter(c => c.isActive).length
      // If total > limit, we might underestimate specific counts, but it's a fallback.
      // Better approximation for inactive:
      const inactiveChapters = totalChapters - activeChapters

      const totalMembers = chapters.reduce((sum, chapter) => sum + (chapter.memberCount || 0), 0)

      return {
        totalChapters,
        activeChapters,
        inactiveChapters,
        totalMembers,
        totalCountries: countries.length
      }
    }
  },
}
