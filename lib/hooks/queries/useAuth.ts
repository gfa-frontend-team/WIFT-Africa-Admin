import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { authApi } from '@/lib/api'
import { useAuthStore } from '@/lib/stores'
import { useRouter } from 'next/navigation'

export const AUTH_KEYS = {
  user: ['auth', 'user'] as const,
}

export function useUser() {
  const { isAuthenticated, setUser } = useAuthStore()

  const query = useQuery({
    queryKey: AUTH_KEYS.user,
    queryFn: authApi.getCurrentUser,
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
  })

  // Sync with store
  useEffect(() => {
    if (query.data) {
      setUser(query.data)
    }
  }, [query.data, setUser])

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
      storeLogin(data.user)
      
      // Update query cache
      queryClient.setQueryData(AUTH_KEYS.user, data.user)
    },
  })
}

export function useGoogleLogin() {
  const queryClient = useQueryClient()
  const { login: storeLogin } = useAuthStore()

  return useMutation({
    mutationFn: (idToken: string) => authApi.googleLogin(idToken),
    onSuccess: (data) => {
      // Update store state
      storeLogin(data.user)
      
      // Update query cache
      queryClient.setQueryData(AUTH_KEYS.user, data.user)
    },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()
  const { logout: storeLogout } = useAuthStore()
  const router = useRouter()

  return useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      // Always cleanup local state even if server logout fails
      storeLogout()
      queryClient.removeQueries({ queryKey: AUTH_KEYS.user })
      queryClient.clear() // Clear all cache on logout
      router.push('/login')
    },
  })
}
