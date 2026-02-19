import { apiClient } from './client'
import type { Admin, AdminAuthResponse, AuthTokens } from '@/types'

// Helper function to transform Admin response if needed
// The backend returns an 'admin' object which should match our interface
const transformAdmin = (admin: any): Admin => {
  return {
    ...admin,
    id: admin._id || admin.id || admin.adminId,
    // Add any other transformations if the backend response differs slightly
  }
}

export const authApi = {
  // Admin Login
  login: async (email: string, password: string): Promise<AdminAuthResponse> => {
    // Step 1: Get tokens from admin login endpoint
    const response = await apiClient.post<AdminAuthResponse>('/auth/admin/login', {
      email,
      password,
    })

    // The response structure from doc: { status: "success", token: "...", admin: { ... } }
    // However, the interface usually expects { success: boolean, data: ... } or direct data depending on client setup.
    // Let's assume apiClient returns the data directly as configured in most axios interceptors,
    // or we handle the specific response structure here.

    // Based on admin_api_reference.md:
    // Response (200 OK):
    // {
    //   "status": "success",
    //   "token": "...", // Legacy? Or just access token alias?
    //   "admin": { ... },
    //   "tokens": {
    //     "accessToken": "...",
    //     "refreshToken": "..."
    //   }
    // }

    // Check for "tokens" object first (new format), fallback to "token" (old format)
    const accessToken = response.tokens?.accessToken || response.token;
    const refreshToken = response.tokens?.refreshToken || response.token; // Fallback to same if only one exists (legacy behavior)

    if (accessToken && response.admin) {
      // Step 2: Store tokens
      apiClient.setTokens(accessToken, refreshToken)

      // Step 3: Store admin data
      const admin = transformAdmin(response.admin)

      if (typeof window !== 'undefined') {
        localStorage.setItem('admin', JSON.stringify(admin))
      }

      return {
        status: response.status,
        token: accessToken,
        admin,
      }
    }

    throw new Error('Login failed')
  },

  // Logout
  logout: async (): Promise<void> => {
    try {
      // Admin might not have a logout endpoint or it might be client-side only clearing
      // If there is one, call it. For now, clear tokens.
      apiClient.clearTokens()
    } finally {
      apiClient.clearTokens()
      if (typeof window !== 'undefined') {
        localStorage.removeItem('admin')
      }
    }
  },

  // Get current admin
  getCurrentUser: async (): Promise<Admin> => {
    const response = await apiClient.get<{ admin: any }>('/admin/me')
    if (response.admin) {
      return transformAdmin(response.admin)
    }
    throw new Error('Failed to get current admin')
  },

  // Check if admin is authenticated
  isAuthenticated: (): boolean => {
    if (typeof window === 'undefined') return false
    const token = localStorage.getItem('accessToken') // client.ts key
    return !!token
  },

  // Get stored admin
  getStoredUser: (): Admin | null => {
    if (typeof window === 'undefined') return null
    const adminStr = localStorage.getItem('admin')
    if (!adminStr) return null
    try {
      return JSON.parse(adminStr)
    } catch {
      return null
    }
  },
}

