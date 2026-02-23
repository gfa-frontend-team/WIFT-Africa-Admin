import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { eventsApi } from '@/lib/api/events'
import { Event, EventStatus, EventFilters, CreateEventData, UpdateEventData, CancelEventData, RSVPEventData } from '@/types'

// Keys
export const eventKeys = {
  all: ['events'] as const,
  lists: () => [...eventKeys.all, 'list'] as const,
  list: (filters: EventFilters) => [...eventKeys.lists(), { ...filters }] as const,
  details: () => [...eventKeys.all, 'detail'] as const,
  detail: (id: string) => [...eventKeys.details(), id] as const,
  attendees: (id: string) => [...eventKeys.detail(id), 'attendees'] as const,
}

// Queries
export function useEvents(filters: EventFilters = {}) {
  return useQuery({
    queryKey: eventKeys.list(filters),
    queryFn: () => eventsApi.getEvents(filters),
  })
}

export function useEvent(id: string) {
  return useQuery({
    queryKey: eventKeys.detail(id),
    queryFn: () => eventsApi.getEvent(id),
    enabled: !!id,
  })
}

export function useEventAttendees(id: string) {
  return useQuery({
    queryKey: eventKeys.attendees(id),
    queryFn: () => eventsApi.getEventAttendees(id),
    enabled: !!id,
  })
}

// Mutations
export function useCreateEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateEventData) => eventsApi.createEvent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() })
    },
  })
}

export function useUpdateEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEventData }) =>
      eventsApi.updateEvent(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(data.event.id) })
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() })
    },
  })
}

export function useCancelEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CancelEventData }) =>
      eventsApi.cancelEvent(id, data),

    onMutate: async ({ id, data }) => {
      const isDeleteMode = !data.reason

      if (isDeleteMode) {
        // DELETE mode: remove from all list caches optimistically
        queryClient.setQueriesData<{ events: Event[]; total: number }>(
          { queryKey: eventKeys.lists() },
          (old) => old ? {
            ...old,
            events: old.events.filter(e => e.id !== id),
            total: Math.max(0, old.total - 1),
          } : old
        )
        return { isDeleteMode }
      }

      // CANCEL mode: update status + reason in detail and list caches
      await queryClient.cancelQueries({ queryKey: eventKeys.detail(id) })
      const previousEvent = queryClient.getQueryData<Event>(eventKeys.detail(id))

      queryClient.setQueryData(eventKeys.detail(id), (old: Event | undefined) =>
        old ? { ...old, status: EventStatus.CANCELLED, cancellationReason: data.reason } : old
      )
      queryClient.setQueriesData<{ events: Event[]; total: number }>(
        { queryKey: eventKeys.lists() },
        (old) => old ? {
          ...old,
          events: old.events.map(e =>
            e.id === id ? { ...e, status: EventStatus.CANCELLED } : e
          ),
        } : old
      )

      return { previousEvent, isDeleteMode }
    },

    onError: (_err, { id }, context) => {
      if (context?.previousEvent) {
        queryClient.setQueryData(eventKeys.detail(id), context.previousEvent)
      }
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() })
    },

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() })
      if (!data.deleted && data.event) {
        queryClient.setQueryData(eventKeys.detail(data.event.id), data.event)
      }
    },
  })
}

export function useSubmitForApproval() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => eventsApi.submitForApproval(id),

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: eventKeys.detail(id) })
      const previousEvent = queryClient.getQueryData<Event>(eventKeys.detail(id))

      queryClient.setQueryData(eventKeys.detail(id), (old: Event | undefined) =>
        old ? { ...old, status: EventStatus.WAITING, submittedAt: new Date().toISOString() } : old
      )
      queryClient.setQueriesData<{ events: Event[]; total: number }>(
        { queryKey: eventKeys.lists() },
        (old) => old ? {
          ...old,
          events: old.events.map(e =>
            e.id === id ? { ...e, status: EventStatus.WAITING } : e
          ),
        } : old
      )

      return { previousEvent }
    },

    onError: (_err, id, context) => {
      if (context?.previousEvent) {
        queryClient.setQueryData(eventKeys.detail(id), context.previousEvent)
      }
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() })
    },

    onSuccess: (data) => {
      queryClient.setQueryData(eventKeys.detail(data.event.id), data.event)
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() })
    },
  })
}

export function useApproveEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => eventsApi.approveEvent(id),

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: eventKeys.detail(id) })
      const previousEvent = queryClient.getQueryData<Event>(eventKeys.detail(id))

      queryClient.setQueryData(eventKeys.detail(id), (old: Event | undefined) =>
        old ? { ...old, status: EventStatus.PUBLISHED, approvedAt: new Date().toISOString() } : old
      )
      queryClient.setQueriesData<{ events: Event[]; total: number }>(
        { queryKey: eventKeys.lists() },
        (old) => old ? {
          ...old,
          events: old.events.map(e =>
            e.id === id ? { ...e, status: EventStatus.PUBLISHED } : e
          ),
        } : old
      )

      return { previousEvent }
    },

    onError: (_err, id, context) => {
      if (context?.previousEvent) {
        queryClient.setQueryData(eventKeys.detail(id), context.previousEvent)
      }
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() })
    },

    onSuccess: (data) => {
      queryClient.setQueryData(eventKeys.detail(data.event.id), data.event)
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() })
    },
  })
}

export function useRejectEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      eventsApi.rejectEvent(id, { reason }),

    onMutate: async ({ id, reason }) => {
      await queryClient.cancelQueries({ queryKey: eventKeys.detail(id) })
      const previousEvent = queryClient.getQueryData<Event>(eventKeys.detail(id))

      queryClient.setQueryData(eventKeys.detail(id), (old: Event | undefined) =>
        old ? { ...old, status: EventStatus.DRAFT, rejectionReason: reason } : old
      )
      queryClient.setQueriesData<{ events: Event[]; total: number }>(
        { queryKey: eventKeys.lists() },
        (old) => old ? {
          ...old,
          events: old.events.map(e =>
            e.id === id ? { ...e, status: EventStatus.DRAFT } : e
          ),
        } : old
      )

      return { previousEvent }
    },

    onError: (_err, { id }, context) => {
      if (context?.previousEvent) {
        queryClient.setQueryData(eventKeys.detail(id), context.previousEvent)
      }
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() })
    },

    onSuccess: (data) => {
      queryClient.setQueryData(eventKeys.detail(data.event.id), data.event)
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() })
    },
  })
}

export function useRSVPEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RSVPEventData }) =>
      eventsApi.rsvpEvent(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() })
    },
  })
}

export function useCancelRSVP() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => eventsApi.cancelRSVP(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() })
    },
  })
}

export function useExportEventAttendees() {
  return useMutation({
    mutationFn: ({ id, format }: { id: string; format: 'csv' | 'pdf' }) =>
      eventsApi.exportEventAttendees(id, format),
    onSuccess: (data, variables) => {
      // Create a blob URL and trigger download
      const url = window.URL.createObjectURL(new Blob([data as any]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `event-${variables.id}-attendees.${variables.format}`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    },
  })
}
