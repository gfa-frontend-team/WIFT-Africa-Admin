import { create } from 'zustand'
import { authApi } from '../api'
import type { User } from '@/types'

interface AuthState {
  user: User | null
  isLoading: boolean
  error: string | null
  isAuthenticated: boolean
  
  // Actions
  login: (user: User) => void
  logout: () => void
  checkAuth: () => void
  refreshUser: () => Promise<void>
  setUser: (user: User | null) => void
  clearError: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: authApi.getStoredUser(),
  isAuthenticated: authApi.isAuthenticated(),
  isLoading: false, // Keep for backward compatibility mostly, or remove if fully migrated
  error: null,

  // Synchronous actions only
  login: (user: User) => {
    set({
      user,
      isAuthenticated: true,
      error: null,
    })
  },

  logout: () => {
    set({
      user: null,
      isAuthenticated: false,
      error: null,
    })
  },

  setUser: (user: User | null) => {
    set({ user, isAuthenticated: !!user })
  },
  
  // Deprecated/No-op actions to prevent breaking other components immediately
  checkAuth: () => {
     const isAuth = authApi.isAuthenticated()
     const user = authApi.getStoredUser()
     set({ isAuthenticated: isAuth, user })
  },
  refreshUser: async () => {}, 
  clearError: () => set({ error: null }),
}))
