import { create } from 'zustand'
import { chaptersApi, type ChapterFilters } from '../api'
import type { Chapter, PlatformStatistics } from '@/types'

interface ChapterState {
  chapters: Chapter[]
  currentChapter: Chapter | null
  statistics: PlatformStatistics | null
  countries: string[]
  isLoading: boolean
  error: string | null
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  
  // Actions
  fetchChapters: (filters?: ChapterFilters) => Promise<void>
  fetchChapter: (id: string) => Promise<void>
  fetchStatistics: () => Promise<void>
  fetchCountries: () => Promise<void>
  createChapter: (data: any) => Promise<Chapter>
  updateChapter: (id: string, data: any) => Promise<void>
  deactivateChapter: (id: string) => Promise<void>
  reactivateChapter: (id: string) => Promise<void>
  addChapterAdmin: (chapterId: string, userId: string) => Promise<void>
  removeChapterAdmin: (chapterId: string, userId: string) => Promise<void>
  clearError: () => void
}

export const useChapterStore = create<ChapterState>((set, get) => ({
  chapters: [],
  currentChapter: null,
  statistics: null,
  countries: [],
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },

  fetchChapters: async (filters?: ChapterFilters) => {
    set({ isLoading: true, error: null })
    try {
      const response = await chaptersApi.getChapters(filters)
      set({
        chapters: response.data,
        pagination: response.pagination,
        isLoading: false,
      })
    } catch (error: any) {
      set({
        error: error.message || 'Failed to fetch chapters',
        isLoading: false,
      })
    }
  },

  fetchChapter: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      const chapter = await chaptersApi.getChapter(id)
      set({
        currentChapter: chapter,
        isLoading: false,
      })
    } catch (error: any) {
      set({
        error: error.message || 'Failed to fetch chapter',
        isLoading: false,
      })
    }
  },

  fetchStatistics: async () => {
    set({ isLoading: true, error: null })
    try {
      const statistics = await chaptersApi.getStatistics()
      set({
        statistics,
        isLoading: false,
      })
    } catch (error: any) {
      set({
        error: error.message || 'Failed to fetch statistics',
        isLoading: false,
      })
    }
  },

  fetchCountries: async () => {
    try {
      const countries = await chaptersApi.getCountries()
      set({ countries })
    } catch (error: any) {
      console.error('Failed to fetch countries:', error)
    }
  },

  createChapter: async (data: any) => {
    set({ isLoading: true, error: null })
    try {
      const chapter = await chaptersApi.createChapter(data)
      set((state) => ({
        chapters: [chapter, ...state.chapters],
        isLoading: false,
      }))
      return chapter
    } catch (error: any) {
      set({
        error: error.message || 'Failed to create chapter',
        isLoading: false,
      })
      throw error
    }
  },

  updateChapter: async (id: string, data: any) => {
    set({ isLoading: true, error: null })
    try {
      const updated = await chaptersApi.updateChapter(id, data)
      set((state) => ({
        chapters: state.chapters.map((c) => (c.id === id ? updated : c)),
        currentChapter: state.currentChapter?.id === id ? updated : state.currentChapter,
        isLoading: false,
      }))
    } catch (error: any) {
      set({
        error: error.message || 'Failed to update chapter',
        isLoading: false,
      })
      throw error
    }
  },

  deactivateChapter: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      await chaptersApi.deactivateChapter(id)
      set((state) => ({
        chapters: state.chapters.map((c) =>
          c.id === id ? { ...c, isActive: false } : c
        ),
        isLoading: false,
      }))
    } catch (error: any) {
      set({
        error: error.message || 'Failed to deactivate chapter',
        isLoading: false,
      })
      throw error
    }
  },

  reactivateChapter: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      await chaptersApi.reactivateChapter(id)
      set((state) => ({
        chapters: state.chapters.map((c) =>
          c.id === id ? { ...c, isActive: true } : c
        ),
        isLoading: false,
      }))
    } catch (error: any) {
      set({
        error: error.message || 'Failed to reactivate chapter',
        isLoading: false,
      })
      throw error
    }
  },

  addChapterAdmin: async (chapterId: string, userId: string) => {
    set({ isLoading: true, error: null })
    try {
      await chaptersApi.addChapterAdmin(chapterId, userId)
      set({ isLoading: false })
    } catch (error: any) {
      set({
        error: error.message || 'Failed to add chapter admin',
        isLoading: false,
      })
      throw error
    }
  },

  removeChapterAdmin: async (chapterId: string, userId: string) => {
    set({ isLoading: true, error: null })
    try {
      await chaptersApi.removeChapterAdmin(chapterId, userId)
      set({ isLoading: false })
    } catch (error: any) {
      set({
        error: error.message || 'Failed to remove chapter admin',
        isLoading: false,
      })
      throw error
    }
  },

  clearError: () => {
    set({ error: null })
  },
}))
