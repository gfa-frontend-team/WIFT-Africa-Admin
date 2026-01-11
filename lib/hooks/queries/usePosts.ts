import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { postsApi } from '@/lib/api/posts'
import { Post, CreatePostData, HidePostData, PostFilters, Comment } from '@/types'

export const postsKeys = {
  all: ['posts'] as const,
  lists: () => [...postsKeys.all, 'list'] as const,
  list: (page: number, limit: number) => [...postsKeys.lists(), { page, limit }] as const,
  details: () => [...postsKeys.all, 'detail'] as const,
  detail: (id: string) => [...postsKeys.details(), id] as const,
  comments: (postId: string) => [...postsKeys.detail(postId), 'comments'] as const,
  analytics: (postId: string) => [...postsKeys.detail(postId), 'analytics'] as const,
}

// Queries
export function usePosts(page = 1, limit = 10) {
  return useQuery({
    queryKey: postsKeys.list(page, limit),
    queryFn: () => postsApi.getFeed(page, limit),
  })
}

export function usePost(id: string) {
  return useQuery({
    queryKey: postsKeys.detail(id),
    queryFn: () => postsApi.getPost(id),
    enabled: !!id,
  })
}

export function usePostComments(postId: string) {
  return useQuery({
    queryKey: postsKeys.comments(postId),
    queryFn: () => postsApi.getComments(postId),
    enabled: !!postId,
  })
}

export function usePostAnalytics(postId: string) {
  return useQuery({
    queryKey: postsKeys.analytics(postId),
    queryFn: () => postsApi.getPostAnalytics(postId),
    enabled: !!postId,
  })
}

// Mutations
export function useCreatePost() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: CreatePostData) => postsApi.createAdminPost(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postsKeys.lists() })
    },
  })
}

export function usePinPost() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => postsApi.pinPost(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: postsKeys.lists() })
      queryClient.invalidateQueries({ queryKey: postsKeys.detail(id) })
    },
  })
}

export function useHidePost() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => 
      postsApi.hidePost(id, { reason }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: postsKeys.lists() })
      queryClient.invalidateQueries({ queryKey: postsKeys.detail(id) })
    },
  })
}

export function useUnhidePost() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => postsApi.unhidePost(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: postsKeys.lists() })
      queryClient.invalidateQueries({ queryKey: postsKeys.detail(id) })
    },
  })
}

export function useDeletePost() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => postsApi.deletePost(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: postsKeys.lists() })
      queryClient.invalidateQueries({ queryKey: postsKeys.detail(id) })
    },
  })
}

export function useDeleteComment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ commentId }: { commentId: string }) => postsApi.deleteComment(commentId),
    onSuccess: (_, { commentId }) => {
      // We don't have easy access to postId here from args without passing it
      // But we can invalidate all comments or pass postId in mutation
      queryClient.invalidateQueries({ queryKey: postsKeys.all }) 
    }
  })
}
