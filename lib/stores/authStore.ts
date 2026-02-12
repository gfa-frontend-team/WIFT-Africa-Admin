import { create } from 'zustand'
import { authApi } from '../api'
import type { Admin } from '@/types'

interface AuthState {
  admin: Admin | null
  isLoading: boolean
  error: string | null
  isAuthenticated: boolean

  // Actions
  login: (admin: Admin) => void
  logout: () => void
  checkAuth: () => void
  refreshUser: () => Promise<void>
  setAdmin: (admin: Admin | null) => void
  clearError: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  admin: authApi.getStoredUser(), // authApi.getStoredUser() now returns Admin | null
  isAuthenticated: authApi.isAuthenticated(),
  isLoading: false,
  error: null,

  // Synchronous actions only
  login: (admin: Admin) => {
    set({
      admin,
      isAuthenticated: true,
      error: null,
    })
  },

  logout: () => {
    set({
      admin: null,
      isAuthenticated: false,
      error: null,
    })
  },

  setAdmin: (admin: Admin | null) => {
    set({ admin, isAuthenticated: !!admin })
  },

  checkAuth: () => {
    const isAuth = authApi.isAuthenticated()
    const admin = authApi.getStoredUser()
    set({ isAuthenticated: isAuth, admin })
  },
  refreshUser: async () => { }, // Kept stub for now, maybe remove or implement refreshAdmin later
  clearError: () => set({ error: null }),
}))
