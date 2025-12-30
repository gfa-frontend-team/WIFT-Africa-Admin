# Events Feature Implementation Plan

## Overview
This document outlines the complete implementation plan for the Events feature in the WIFT Africa Admin Dashboard, based on the API documentation in `docs/api-v1/events/endpoints.md`.

## API Analysis Summary

### Public Endpoints (No Authentication)
- `GET /api/v1/events` - List events with filtering
- `GET /api/v1/events/:eventId` - Get event details

### User Endpoints (Authentication Required)
- `POST /api/v1/events/:eventId/rsvp` - RSVP to event
- `DELETE /api/v1/events/:eventId/rsvp` - Cancel RSVP

### Admin Endpoints (Chapter Admin Authentication)
- `POST /api/v1/admin/events` - Create event
- `PATCH /api/v1/admin/events/:eventId` - Update event
- `DELETE /api/v1/admin/events/:eventId` - Cancel/Archive event
- `GET /api/v1/admin/events/:eventId/attendees` - Get attendees list

## 1. Type Definitions

### New Types to Add to `types/index.ts`

```typescript
// ============================================
// EVENT TYPES
// ============================================

export enum EventType {
  WORKSHOP = 'WORKSHOP',
  SCREENING = 'SCREENING',
  NETWORKING = 'NETWORKING',
  MEETUP = 'MEETUP',
  CONFERENCE = 'CONFERENCE',
  OTHER = 'OTHER',
}

export enum LocationType {
  PHYSICAL = 'PHYSICAL',
  VIRTUAL = 'VIRTUAL',
  HYBRID = 'HYBRID',
}

export enum RSVPStatus {
  GOING = 'GOING',
  INTERESTED = 'INTERESTED',
  NOT_GOING = 'NOT_GOING',
}

export interface EventLocation {
  type: LocationType
  address?: string
  city?: string
  country?: string
  virtualLink?: string
  virtualPlatform?: string
}

export interface Event {
  id: string
  title: string
  description: string
  type: EventType
  chapterId: string
  chapter?: Chapter
  organizerId: string
  organizer?: User
  startDate: string
  endDate: string
  timezone: string
  location: EventLocation
  coverImage?: string
  capacity?: number
  currentAttendees: number
  tags: string[]
  isActive: boolean
  myRSVP?: RSVPStatus | null
  createdAt: Date
  updatedAt: Date
}

export interface EventRSVP {
  id: string
  eventId: string
  userId: string
  status: RSVPStatus
  rsvpDate: Date
  user?: User
}

export interface EventAttendee {
  user: User
  status: RSVPStatus
  rsvpDate: string
}

export interface EventAttendeesResponse {
  attendees: EventAttendee[]
  stats: {
    going: number
    interested: number
    notGoing: number
  }
}

// API Request/Response Types
export interface EventFilters {
  page?: number
  limit?: number
  chapterId?: string
  type?: EventType
  startDate?: string
  endDate?: string
}

export interface CreateEventData {
  title: string
  description: string
  type: EventType
  chapterId: string
  startDate: string
  endDate: string
  timezone: string
  location: EventLocation
  capacity?: number
  tags?: string[]
}

export interface UpdateEventData extends Partial<CreateEventData> {}

export interface RSVPEventData {
  status: RSVPStatus
}

export interface CancelEventData {
  reason: string
}
```

### Permissions to Add to `lib/constants/permissions.ts`

```typescript
// Add to Permission enum
export enum Permission {
  // ... existing permissions ...
  
  // Event Management
  VIEW_ALL_EVENTS = 'view_all_events',
  VIEW_OWN_CHAPTER_EVENTS = 'view_own_chapter_events',
  CREATE_EVENT = 'create_event',
  EDIT_EVENT = 'edit_event',
  DELETE_EVENT = 'delete_event',
  VIEW_EVENT_ATTENDEES = 'view_event_attendees',
  EXPORT_EVENT_ATTENDEES = 'export_event_attendees',
}

// Update ROLE_PERMISSIONS
export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  SUPER_ADMIN: [
    // ... existing permissions ...
    
    // Event Management - Full access
    Permission.VIEW_ALL_EVENTS,
    Permission.CREATE_EVENT,
    Permission.EDIT_EVENT,
    Permission.DELETE_EVENT,
    Permission.VIEW_EVENT_ATTENDEES,
    Permission.EXPORT_EVENT_ATTENDEES,
  ],
  
  CHAPTER_ADMIN: [
    // ... existing permissions ...
    
    // Event Management - Own chapter only
    Permission.VIEW_OWN_CHAPTER_EVENTS,
    Permission.CREATE_EVENT,
    Permission.EDIT_EVENT,
    Permission.DELETE_EVENT,
    Permission.VIEW_EVENT_ATTENDEES,
    Permission.EXPORT_EVENT_ATTENDEES,
  ],
  
  // Regular members can view and RSVP to events (no admin permissions)
  CHAPTER_MEMBER: [],
  HQ_MEMBER: [],
}
```

## 2. API Layer

### Create `lib/api/events.ts`

```typescript
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
```

## 3. React Query Hooks

### Create `lib/hooks/queries/useEvents.ts`

```typescript
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
```

## 4. Page Structure

### Admin Flow Pages to Create

```
app/dashboard/events/
├── page.tsx                    # Events list (admin view)
├── create/
│   └── page.tsx               # Create new event
├── [eventId]/
│   ├── page.tsx               # Event details (admin view)
│   ├── edit/
│   │   └── page.tsx           # Edit event
│   └── attendees/
│       └── page.tsx           # Attendees management
└── layout.tsx                 # Events section layout (optional)
```

### Public/Member Flow Pages (Optional - if needed)

```
app/events/
├── page.tsx                    # Public events calendar
└── [eventId]/
    └── page.tsx               # Public event details with RSVP
```

## 5. Component Structure

### Create `components/events/` Directory

```
components/events/
├── EventCard.tsx              # Event card for lists
├── EventDetails.tsx           # Event details display
├── EventForm.tsx              # Create/Edit event form
├── EventFilters.tsx           # Filter controls
├── EventCalendar.tsx          # Calendar view (optional)
├── RSVPButton.tsx             # RSVP action button
├── AttendeesTable.tsx         # Attendees list table
├── EventStats.tsx             # Event statistics
└── index.ts                   # Barrel exports
```

### Key Components to Implement

#### 1. `EventCard.tsx`
- Display event summary
- Show RSVP status
- Quick actions (Edit, Delete for admins)
- Event type badge
- Date/time display
- Location info
- Attendee count

#### 2. `EventForm.tsx`
- Create/Edit event form
- Form validation with Zod
- Date/time pickers
- Location type selection
- Chapter selection (for Super Admins)
- Image upload for cover
- Tags input
- Capacity setting

#### 3. `RSVPButton.tsx`
- RSVP status display
- RSVP action buttons
- Loading states
- Authentication check

#### 4. `AttendeesTable.tsx`
- Attendees list with pagination
- Filter by RSVP status
- Export to CSV functionality
- User profile links
- RSVP date display

## 6. Navigation Updates

### Update Sidebar Navigation

Add to `components/layout/Sidebar.tsx`:

```typescript
// Add to navigation items
{
  name: 'Events',
  href: '/dashboard/events',
  icon: CalendarIcon, // from lucide-react
  permission: Permission.VIEW_OWN_CHAPTER_EVENTS,
  children: [
    {
      name: 'All Events',
      href: '/dashboard/events',
      permission: Permission.VIEW_OWN_CHAPTER_EVENTS,
    },
    {
      name: 'Create Event',
      href: '/dashboard/events/create',
      permission: Permission.CREATE_EVENT,
    },
  ],
}
```

## 7. Implementation Priority

### Phase 1: Core Functionality
1. ✅ Add types to `types/index.ts`
2. ✅ Add permissions to `lib/constants/permissions.ts`
3. ✅ Create `lib/api/events.ts`
4. ✅ Create `lib/hooks/queries/useEvents.ts`
5. ✅ Create basic `EventCard` component
6. ✅ Create events list page (`app/dashboard/events/page.tsx`)

### Phase 2: Admin Management
1. ✅ Create `EventForm` component
2. ✅ Create event creation page (`app/dashboard/events/create/page.tsx`)
3. ✅ Create event details page (`app/dashboard/events/[eventId]/page.tsx`)
4. ✅ Create event edit page (`app/dashboard/events/[eventId]/edit/page.tsx`)

### Phase 3: Attendee Management
1. ✅ Create `AttendeesTable` component
2. ✅ Create attendees page (`app/dashboard/events/[eventId]/attendees/page.tsx`)
3. ✅ Add CSV export functionality

### Phase 4: User Experience
1. ✅ Create `RSVPButton` component
2. ✅ Add RSVP functionality to event details
3. ✅ Create public events calendar (optional)
4. ✅ Add event filters and search

### Phase 5: Enhancements
1. ✅ Add event calendar view
2. ✅ Add event statistics dashboard
3. ✅ Add email notifications (backend integration)
4. ✅ Add event reminders
5. ✅ Add recurring events (if needed)

## 8. Key Features Summary

### For Super Admins
- View all events across all chapters
- Create events for any chapter
- Edit/cancel any event
- View attendees for any event
- Export attendee lists
- Event statistics across platform

### For Chapter Admins
- View events for their chapter only
- Create events for their chapter
- Edit/cancel their chapter's events
- View attendees for their events
- Export attendee lists for their events

### For Members
- View all public events
- RSVP to events
- View their RSVP history
- Receive event notifications

### Key Business Rules
1. Only Chapter Admins and Super Admins can create events
2. Chapter Admins can only manage events for their chapter
3. Super Admins can manage events for any chapter
4. Events can have capacity limits
5. RSVP status affects attendee counts
6. Cancelled events notify all attendees
7. Past events are archived but viewable

## 9. Technical Considerations

### State Management
- Use React Query for server state (events, attendees)
- Use Zustand for UI state (filters, selected events)
- Cache event lists with proper invalidation

### Performance
- Implement pagination for event lists
- Use placeholder data for smooth transitions
- Optimize image loading for event covers
- Implement virtual scrolling for large attendee lists

### Security
- Validate permissions on all admin actions
- Sanitize event descriptions (XSS prevention)
- Rate limit RSVP actions
- Validate file uploads for event covers

### Accessibility
- Proper ARIA labels for all interactive elements
- Keyboard navigation support
- Screen reader friendly date/time displays
- High contrast mode support

This implementation plan provides a comprehensive roadmap for building the Events feature while maintaining consistency with the existing codebase architecture and patterns.