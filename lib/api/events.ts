import { apiClient } from './client'
import {
  Event,
  EventFilters,
  CreateEventData,
  UpdateEventData,
  CancelEventData,
  EventAttendeesResponse,
  RSVPEventData,
  EventRSVP
} from '@/types'

const BASE_URL = '/events'
const ADMIN_BASE_URL = '/events/admin/events'

interface GetEventsResponse {

  data: {

    events: Event[]
    total: number
  }
  // pages: number
}

interface CreateEventResponse {
  message: string
  event: Event
}

interface UpdateEventResponse {
  message: string
  event: Event
}

interface CancelEventResponse {
  message: string
  event: Event
}

interface RSVPResponse {
  message: string
  rsvp: EventRSVP
}

// Helper to normalize backend _id to frontend id
const transformEvent = (event: any): Event => {
  if (!event) return event
  const transformed = {
    ...event,
    id: event.id || event._id,
  }
  // Handle nested chapter if strictly needed, though usually just ID is enough for basics
  if (event.chapter && (event.chapter._id || event.chapter.id)) {
    transformed.chapter = {
      ...event.chapter,
      id: event.chapter.id || event.chapter._id
    }
  }
  return transformed
}

export const eventsApi = {
  // Public/Shared Endpoints
  getEvents: async (params?: EventFilters) => {
    const data = await apiClient.get<GetEventsResponse>(BASE_URL, { params })

    if (data.data.events) {
      data.data.events = data.data.events.map(transformEvent)
    }
    return data.data
  },

  getEvent: async (id: string) => {
    const data = await apiClient.get<Event>(`${BASE_URL}/${id}`)
    return transformEvent(data)
  },

  rsvpEvent: async (id: string, rsvpData: RSVPEventData) => {
    const data = await apiClient.post<RSVPResponse>(`${BASE_URL}/${id}/rsvp`, rsvpData)
    // RSVP returns the RSVP object, not the full event usually, but checking types
    return data
  },

  cancelRSVP: async (id: string) => {
    const data = await apiClient.delete<{ message: string }>(`${BASE_URL}/${id}/rsvp`)
    return data
  },

  // Admin Endpoints
  createEvent: async (eventData: CreateEventData) => {
    const data = await apiClient.post<CreateEventResponse>(ADMIN_BASE_URL, eventData)
    if (data.event) {
      data.event = transformEvent(data.event)
    }
    return data
  },

  updateEvent: async (id: string, eventData: UpdateEventData) => {
    const data = await apiClient.patch<UpdateEventResponse>(`${ADMIN_BASE_URL}/${id}`, eventData)
    if (data.event) {
      data.event = transformEvent(data.event)
    }
    return data
  },

  cancelEvent: async (id: string, cancelData: CancelEventData) => {
    const data = await apiClient.delete<CancelEventResponse>(`${ADMIN_BASE_URL}/${id}`, {
      data: cancelData
    })
    if (data.event) {
      data.event = transformEvent(data.event)
    }
    return data
  },

  getEventAttendees: async (id: string) => {
    const data = await apiClient.get<EventAttendeesResponse>(`${ADMIN_BASE_URL}/${id}/attendees`)
    return data
  },

  exportEventAttendees: async (id: string, format: 'csv' | 'pdf') => {
    const data = await apiClient.get<Blob>(`${ADMIN_BASE_URL}/${id}/attendees`, {
      params: { export: format },
      responseType: 'blob',
    })
    return data
  }
}