import { apiClient } from './client'
import type { AuthResponse, AuthTokens, User } from '@/types'

// Helper function to transform MongoDB _id to id
const transformUser = (user: any): User => ({
  ...user,
  id: user._id || user.id,
})

export const authApi = {
  // Login - Fetches full user data including accountType after getting tokens
  login: async (email: string, password: string): Promise<AuthResponse> => {
    // Step 1: Get tokens from login endpoint
    const response = await apiClient.post<{ user: any; tokens: AuthTokens }>('/auth/login', {
      email,
      password,
    })
    
    // Backend returns {message, user, tokens} directly, not wrapped in {success, data}
    if (response.user && response.tokens) {
      // Step 2: Store tokens first (needed for subsequent API calls)
      apiClient.setTokens(response.tokens.accessToken, response.tokens.refreshToken)
      
      // Step 3: Fetch full user data (includes accountType, membershipStatus, etc.)
      // The login endpoint doesn't return accountType, so we need to fetch it
      const fullUser = await authApi.getCurrentUser()
      
      // Step 4: Store complete user data
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(fullUser))
      }
      
      return {
        user: fullUser, // Now includes accountType for RBAC
        tokens: response.tokens,
      }
    }
    
    throw new Error('Login failed')
  },

  // Logout
  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout')
    } finally {
      apiClient.clearTokens()
    }
  },

  // Get current user
  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<{ user: any }>('/users/me')
    if (response.user) {
      return transformUser(response.user)
    }
    throw new Error('Failed to get current user')
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    if (typeof window === 'undefined') return false
    const token = localStorage.getItem('accessToken')
    return !!token
  },

  // Get stored user
  getStoredUser: (): User | null => {
    if (typeof window === 'undefined') return null
    const userStr = localStorage.getItem('user')
    if (!userStr) return null
    try {
      return JSON.parse(userStr)
    } catch {
      return null
    }
  },
}
