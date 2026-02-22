import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { eventsApi } from '@/lib/api/events'
import { EventFilters, CreateEventData, UpdateEventData, CancelEventData, RSVPEventData } from '@/types'

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
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(data.event.id) })
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
      // Ideally we should also invalidate the list if listing shows RSVP status
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
