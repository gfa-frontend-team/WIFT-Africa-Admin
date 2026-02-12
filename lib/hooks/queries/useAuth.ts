import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { authApi } from '@/lib/api'
import { useAuthStore } from '@/lib/stores'
import { useRouter } from 'next/navigation'

export const AUTH_KEYS = {
  admin: ['auth', 'admin'] as const,
}

export function useAdmin() {
  const { isAuthenticated, setAdmin } = useAuthStore()

  const query = useQuery({
    queryKey: AUTH_KEYS.admin,
    queryFn: authApi.getCurrentUser,
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
  })

  // Sync with store
  useEffect(() => {
    if (query.data) {
      setAdmin(query.data)
    }
  }, [query.data, setAdmin])

  return query
}

export function useLogin() {
  const queryClient = useQueryClient()
  const { login: storeLogin } = useAuthStore()

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.login(email, password),
    onSuccess: (data) => {
      // Update store state
      storeLogin(data.admin)

      // Update query cache
      queryClient.setQueryData(AUTH_KEYS.admin, data.admin)
    },
  })
}

// Google Login removed as per Admin Migration Logic

export function useLogout() {
  const queryClient = useQueryClient()
  const { logout: storeLogout } = useAuthStore()
  const router = useRouter()

  return useMutation({
    mutationFn: async () => {
      await authApi.logout()
    },
    onSettled: () => {
      // Always cleanup local state even if server logout fails
      storeLogout()
      queryClient.removeQueries({ queryKey: AUTH_KEYS.admin })
      queryClient.clear() // Clear all cache on logout
      router.push('/login')
    },
  })
}
