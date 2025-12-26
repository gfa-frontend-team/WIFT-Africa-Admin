import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { membershipApi, MembershipFilters } from '@/lib/api/membership'

export const MEMBERSHIP_KEYS = {
  all: ['membership'] as const,
  requests: (chapterId: string, filters: MembershipFilters = {}) => 
    [...MEMBERSHIP_KEYS.all, 'requests', chapterId, filters] as const,
  members: (chapterId: string, page: number = 1, limit: number = 20) => 
    [...MEMBERSHIP_KEYS.all, 'members', chapterId, page, limit] as const,
}

export function useMembershipRequests(chapterId: string, filters: MembershipFilters = {}) {
  return useQuery({
    queryKey: MEMBERSHIP_KEYS.requests(chapterId, filters),
    queryFn: () => membershipApi.getRequests(chapterId, filters),
    enabled: !!chapterId,
  })
}

export function useChapterMembers(chapterId: string, page = 1, limit = 20) {
  return useQuery({
    queryKey: MEMBERSHIP_KEYS.members(chapterId, page, limit),
    queryFn: () => membershipApi.getMembers(chapterId, page, limit),
    enabled: !!chapterId,
    placeholderData: (previousData) => previousData,
  })
}

export function useApproveRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ chapterId, requestId, notes }: { chapterId: string; requestId: string; notes?: string }) =>
      membershipApi.approveRequest(chapterId, requestId, notes),
    onSuccess: (_, { chapterId }) => {
      queryClient.invalidateQueries({ queryKey: [...MEMBERSHIP_KEYS.all, 'requests', chapterId] })
      queryClient.invalidateQueries({ queryKey: [...MEMBERSHIP_KEYS.all, 'members', chapterId] })
    },
  })
}

export function useRejectRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ 
      chapterId, 
      requestId, 
      reason, 
      canReapply 
    }: { 
      chapterId: string; 
      requestId: string; 
      reason: string; 
      canReapply?: boolean 
    }) => membershipApi.rejectRequest(chapterId, requestId, reason, canReapply),
    onSuccess: (_, { chapterId }) => {
      queryClient.invalidateQueries({ queryKey: [...MEMBERSHIP_KEYS.all, 'requests', chapterId] })
    },
  })
}
