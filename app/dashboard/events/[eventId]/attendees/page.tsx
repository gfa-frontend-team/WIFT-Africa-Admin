'use client'

import { useParams } from 'next/navigation'
import { ArrowLeft, Users, Calendar, MapPin } from 'lucide-react'
import Link from 'next/link'
import { useEvent, useEventAttendees } from '@/lib/hooks/queries/useEvents'
import { usePermissions } from '@/lib/hooks'
import { Permission } from '@/lib/constants/permissions'
import { AttendeesTable } from '@/components/events/AttendeesTable'
import { eventsApi } from '@/lib/api/events'
import { EventType, LocationType } from '@/types'

const eventTypeColors = {
  [EventType.WORKSHOP]: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  [EventType.SCREENING]: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  [EventType.NETWORKING]: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  [EventType.MEETUP]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  [EventType.CONFERENCE]: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  [EventType.OTHER]: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
}

export default function EventAttendeesPage() {
  const params = useParams()
  const eventId = params.eventId as string
  
  const { hasPermission } = usePermissions()
  const { data: event, isLoading: eventLoading, error: eventError } = useEvent(eventId)
  const { data: attendeesData, isLoading: attendeesLoading, error: attendeesError } = useEventAttendees(eventId)

  const canViewAttendees = hasPermission(Permission.VIEW_EVENT_ATTENDEES)
  const canExportAttendees = hasPermission(Permission.EXPORT_EVENT_ATTENDEES)

  if (!canViewAttendees) {
    return (
      <div className="p-6">
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <p className="text-destructive">Access denied. You don't have permission to view event attendees.</p>
        </div>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  const getLocationDisplay = () => {
    if (!event) return ''
    
    const { location } = event
    if (location.type === LocationType.VIRTUAL) {
      return `Virtual${location.virtualPlatform ? ` • ${location.virtualPlatform}` : ''}`
    }
    if (location.type === LocationType.HYBRID) {
      return `Hybrid Event`
    }
    return `${location.city || ''}${location.country ? `, ${location.country}` : ''}`
  }

  const handleExportAttendees = async () => {
    try {
      // Call the API with export flag
      await eventsApi.getEventAttendees(eventId, true)
      // The backend should handle the CSV download
      // This might trigger a file download or return CSV data
    } catch (error) {
      console.error('Failed to export attendees:', error)
    }
  }

  if (eventLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 bg-muted rounded-lg"></div>
            <div>
              <div className="h-8 bg-muted rounded w-64 mb-2"></div>
              <div className="h-4 bg-muted rounded w-48"></div>
            </div>
          </div>
          <div className="bg-card rounded-lg border border-border p-6">
            <div className="h-6 bg-muted rounded w-48 mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (eventError || !event) {
    return (
      <div className="p-6">
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <p className="text-destructive">Failed to load event details. Please try again.</p>
        </div>
      </div>
    )
  }

  if (attendeesError) {
    return (
      <div>
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link
            href={`/dashboard/events/${eventId}`}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Event Attendees</h1>
            <p className="text-muted-foreground">
              {event.title}
            </p>
          </div>
        </div>

        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <p className="text-destructive">Failed to load attendees data. Please try again.</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href={`/dashboard/events/${eventId}`}
          className="p-2 hover:bg-accent rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Event Attendees</h1>
          <p className="text-muted-foreground">
            Manage RSVPs for {event.title}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Event Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-card rounded-lg border border-border p-6 sticky top-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Event Summary</h2>
            
            <div className="space-y-4">
              {/* Event Type */}
              <div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${eventTypeColors[event.type]}`}>
                  {event.type.replace('_', ' ')}
                </span>
              </div>

              {/* Title */}
              <div>
                <h3 className="font-medium text-foreground line-clamp-2">{event.title}</h3>
              </div>

              {/* Date & Time */}
              <div className="flex items-start gap-2 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-foreground">{formatDate(event.startDate)}</div>
                  <div className="text-muted-foreground">
                    {formatTime(event.startDate)} - {formatTime(event.endDate)}
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="text-muted-foreground">{getLocationDisplay()}</div>
              </div>

              {/* Capacity */}
              <div className="flex items-start gap-2 text-sm">
                <Users className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-foreground">{event.currentAttendees} attending</div>
                  {event.capacity && (
                    <div className="text-muted-foreground">of {event.capacity} capacity</div>
                  )}
                </div>
              </div>

              {/* Capacity Progress */}
              {event.capacity && (
                <div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                    <span>Capacity</span>
                    <span>{Math.round((event.currentAttendees / event.capacity) * 100)}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{
                        width: `${Math.min((event.currentAttendees / event.capacity) * 100, 100)}%`
                      }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Organizer */}
              {event.chapter && (
                <div className="pt-4 border-t border-border">
                  <div className="text-xs text-muted-foreground mb-1">Organized by</div>
                  <div className="text-sm font-medium text-foreground">{event.chapter.name}</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Attendees Table */}
        <div className="lg:col-span-3">
          <AttendeesTable
            data={attendeesData || { attendees: [], stats: { going: 0, interested: 0, notGoing: 0 } }}
            onExport={canExportAttendees ? handleExportAttendees : undefined}
            isLoading={attendeesLoading}
          />
        </div>
      </div>
    </div>
  )
}