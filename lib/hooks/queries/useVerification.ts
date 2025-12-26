import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { verificationApi } from '@/lib/api/verification'

export const VERIFICATION_KEYS = {
  stats: ['verification', 'stats'] as const,
}

export function useVerificationStats() {
  return useQuery({
    queryKey: VERIFICATION_KEYS.stats,
    queryFn: verificationApi.getDelayedStats,
  })
}

export function useTriggerDelayCheck() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: verificationApi.checkDelays,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VERIFICATION_KEYS.stats })
      // We might also want to invalidate requests list if they are related
      queryClient.invalidateQueries({ queryKey: ['membership', 'requests'] })
    },
  })
}
