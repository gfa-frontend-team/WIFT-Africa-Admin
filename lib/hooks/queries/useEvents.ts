import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { eventsApi } from '@/lib/api/events'
import type { EventFilters, CreateEventData, UpdateEventData, RSVPEventData, CancelEventData } from '@/types'

export const EVENT_KEYS = {
  all: ['events'] as const,
  lists: () => [...EVENT_KEYS.all, 'list'] as const,
  list: (filters: EventFilters = {}) => [...EVENT_KEYS.lists(), filters] as const,
  details: () => [...EVENT_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...EVENT_KEYS.details(), id] as const,
  attendees: (id: string) => [...EVENT_KEYS.all, 'attendees', id] as const,
}

// ============================================
// QUERY HOOKS
// ============================================

export function useEvents(filters: EventFilters = {}, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: EVENT_KEYS.list(filters),
    queryFn: () => eventsApi.getEvents(filters),
    placeholderData: (previousData) => previousData,
    enabled: options.enabled,
  })
}

export function useEvent(eventId: string, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: EVENT_KEYS.detail(eventId),
    queryFn: () => eventsApi.getEvent(eventId),
    enabled: !!eventId && options.enabled,
  })
}

export function useEventAttendees(eventId: string, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: EVENT_KEYS.attendees(eventId),
    queryFn: () => eventsApi.getEventAttendees(eventId),
    enabled: !!eventId && options.enabled,
  })
}

// ============================================
// MUTATION HOOKS
// ============================================

export function useCreateEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateEventData) => eventsApi.createEvent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EVENT_KEYS.lists() })
    },
  })
}

export function useUpdateEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ eventId, data }: { eventId: string; data: UpdateEventData }) =>
      eventsApi.updateEvent(eventId, data),
    onSuccess: (updatedEvent) => {
      queryClient.setQueryData(EVENT_KEYS.detail(updatedEvent.id), updatedEvent)
      queryClient.invalidateQueries({ queryKey: EVENT_KEYS.lists() })
    },
  })
}

export function useCancelEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ eventId, data }: { eventId: string; data: CancelEventData }) =>
      eventsApi.cancelEvent(eventId, data),
    onSuccess: (_, { eventId }) => {
      queryClient.invalidateQueries({ queryKey: EVENT_KEYS.lists() })
      queryClient.invalidateQueries({ queryKey: EVENT_KEYS.detail(eventId) })
    },
  })
}

export function useRSVPToEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ eventId, data }: { eventId: string; data: RSVPEventData }) =>
      eventsApi.rsvpToEvent(eventId, data),
    onSuccess: (_, { eventId }) => {
      // Invalidate event details to refresh myRSVP status
      queryClient.invalidateQueries({ queryKey: EVENT_KEYS.detail(eventId) })
      queryClient.invalidateQueries({ queryKey: EVENT_KEYS.attendees(eventId) })
    },
  })
}

export function useCancelRSVP() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (eventId: string) => eventsApi.cancelRSVP(eventId),
    onSuccess: (_, eventId) => {
      // Invalidate event details to refresh myRSVP status
      queryClient.invalidateQueries({ queryKey: EVENT_KEYS.detail(eventId) })
      queryClient.invalidateQueries({ queryKey: EVENT_KEYS.attendees(eventId) })
    },
  })
}