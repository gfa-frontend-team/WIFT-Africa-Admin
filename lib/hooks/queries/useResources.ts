import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { resourcesApi } from '@/lib/api/resources'
import { ResourceFilters, CreateResourceData, UpdateResourceData } from '@/types'

// Keys
export const resourceKeys = {
    all: ['resources'] as const,
    lists: () => [...resourceKeys.all, 'list'] as const,
    list: (filters: ResourceFilters) => [...resourceKeys.lists(), { ...filters }] as const,
    details: () => [...resourceKeys.all, 'detail'] as const,
    detail: (id: string) => [...resourceKeys.details(), id] as const,
}

// Queries
export function useResources(filters: ResourceFilters = {}) {
    return useQuery({
        queryKey: resourceKeys.list(filters),
        queryFn: () => resourcesApi.getAllResources(filters),
    })
}

export function useResource(id: string) {
    return useQuery({
        queryKey: resourceKeys.detail(id),
        queryFn: () => resourcesApi.getResource(id),
        enabled: !!id,
    })
}

// Mutations
export function useCreateResource() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateResourceData) => resourcesApi.createResource(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: resourceKeys.lists() })
        },
    })
}

export function useUpdateResource() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateResourceData }) =>
            resourcesApi.updateResource(id, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: resourceKeys.detail(data._id) })
            queryClient.invalidateQueries({ queryKey: resourceKeys.lists() })
        },
    })
}

export function useDeleteResource() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) => resourcesApi.deleteResource(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: resourceKeys.detail(id) })
            queryClient.invalidateQueries({ queryKey: resourceKeys.lists() })
        },
    })
}
