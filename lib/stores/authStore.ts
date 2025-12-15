import { create } from 'zustand'
import { authApi } from '../api'
import type { User } from '@/types'

interface AuthState {
  user: User | null
  isLoading: boolean
  error: string | null
  isAuthenticated: boolean
  
  // Actions
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  checkAuth: () => void
  refreshUser: () => Promise<void>
  setUser: (user: User | null) => void
  clearError: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: authApi.getStoredUser(),
  isLoading: false,
  error: null,
  isAuthenticated: authApi.isAuthenticated(),

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await authApi.login(email, password)
      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      })
    } catch (error: any) {
      set({
        error: error.message || 'Login failed',
        isLoading: false,
        isAuthenticated: false,
      })
      throw error
    }
  },

  logout: async () => {
    set({ isLoading: true })
    try {
      await authApi.logout()
    } finally {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      })
    }
  },

  checkAuth: () => {
    const isAuth = authApi.isAuthenticated()
    const user = authApi.getStoredUser()
    set({
      isAuthenticated: isAuth,
      user: user,
    })
  },

  refreshUser: async () => {
    try {
      const user = await authApi.getCurrentUser()
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(user))
      }
      set({ user })
    } catch (error) {
      console.error('Failed to refresh user:', error)
      // If refresh fails, user might need to re-login
      set({
        user: null,
        isAuthenticated: false,
      })
    }
  },

  setUser: (user: User | null) => {
    set({ user, isAuthenticated: !!user })
  },

  clearError: () => {
    set({ error: null })
  },
}))
