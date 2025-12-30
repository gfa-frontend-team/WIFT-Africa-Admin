import { apiClient } from './client'
import type { 
  Event, 
  EventFilters, 
  CreateEventData, 
  UpdateEventData, 
  RSVPEventData, 
  CancelEventData,
  EventAttendeesResponse,
  PaginatedResponse 
} from '@/types'

// Helper function to transform MongoDB _id to id
const transformEvent = (event: any): Event => ({
  ...event,
  id: event._id || event.id,
  chapter: event.chapter ? {
    ...event.chapter,
    id: event.chapter._id || event.chapter.id,
  } : undefined,
  organizer: event.organizer ? {
    ...event.organizer,
    id: event.organizer._id || event.organizer.id,
  } : undefined,
})

export const eventsApi = {
  // ============================================
  // PUBLIC ENDPOINTS
  // ============================================
  
  // Get all events with filters (Public)
  getEvents: async (filters?: EventFilters): Promise<PaginatedResponse<Event>> => {
    const params = new URLSearchParams()
    if (filters?.page) params.append('page', String(filters.page))
    if (filters?.limit) params.append('limit', String(filters.limit))
    if (filters?.chapterId) params.append('chapterId', filters.chapterId)
    if (filters?.type) params.append('type', filters.type)
    if (filters?.startDate) params.append('startDate', filters.startDate)
    if (filters?.endDate) params.append('endDate', filters.endDate)

    const response = await apiClient.get<{ events: any[]; total: number; pages: number }>(
      `/events?${params.toString()}`
    )
    
    return {
      data: response.events.map(transformEvent),
      pagination: {
        page: filters?.page || 1,
        limit: filters?.limit || 20,
        total: response.total,
        totalPages: response.pages,
      },
    }
  },

  // Get single event details (Public)
  getEvent: async (eventId: string): Promise<Event> => {
    const response = await apiClient.get<any>(`/events/${eventId}`)
    return transformEvent(response)
  },

  // ============================================
  // USER ENDPOINTS (Authentication Required)
  // ============================================
  
  // RSVP to event
  rsvpToEvent: async (eventId: string, data: RSVPEventData): Promise<void> => {
    await apiClient.post<{ message: string; rsvp: any }>(
      `/events/${eventId}/rsvp`,
      data
    )
  },

  // Cancel RSVP
  cancelRSVP: async (eventId: string): Promise<void> => {
    await apiClient.delete<{ message: string }>(`/events/${eventId}/rsvp`)
  },

  // ============================================
  // ADMIN ENDPOINTS (Chapter Admin Required)
  // ============================================
  
  // Create event
  createEvent: async (data: CreateEventData): Promise<Event> => {
    const response = await apiClient.post<{ message: string; event: any }>(
      '/admin/events',
      data
    )
    if (response.event) {
      return transformEvent(response.event)
    }
    throw new Error('Failed to create event')
  },

  // Update event
  updateEvent: async (eventId: string, data: UpdateEventData): Promise<Event> => {
    const response = await apiClient.patch<{ message: string; event: any }>(
      `/admin/events/${eventId}`,
      data
    )
    if (response.event) {
      return transformEvent(response.event)
    }
    throw new Error('Failed to update event')
  },

  // Cancel/Archive event
  cancelEvent: async (eventId: string, data: CancelEventData): Promise<void> => {
    await apiClient.delete<{ message: string; notifiedAttendees: number }>(
      `/admin/events/${eventId}`,
      data
    )
  },

  // Get event attendees
  getEventAttendees: async (eventId: string, exportCsv = false): Promise<EventAttendeesResponse> => {
    const params = exportCsv ? '?export=true' : ''
    const response = await apiClient.get<EventAttendeesResponse>(
      `/admin/events/${eventId}/attendees${params}`
    )
    return response
  },
}