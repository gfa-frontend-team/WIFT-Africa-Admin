'use client'

import { Calendar, MapPin, Users, Clock, MoreVertical } from 'lucide-react'
import { Event, EventType, LocationType, RSVPStatus } from '@/types'
import { usePermissions } from '@/lib/hooks'
import { Permission } from '@/lib/constants/permissions'

interface EventCardProps {
  event: Event
  onEdit?: (event: Event) => void
  onDelete?: (event: Event) => void
  onViewAttendees?: (event: Event) => void
}

const eventTypeColors = {
  [EventType.WORKSHOP]: 'bg-blue-100 text-blue-800',
  [EventType.SCREENING]: 'bg-purple-100 text-purple-800',
  [EventType.NETWORKING]: 'bg-green-100 text-green-800',
  [EventType.MEETUP]: 'bg-yellow-100 text-yellow-800',
  [EventType.CONFERENCE]: 'bg-red-100 text-red-800',
  [EventType.OTHER]: 'bg-gray-100 text-gray-800',
}

const rsvpStatusColors = {
  [RSVPStatus.GOING]: 'bg-green-100 text-green-800',
  [RSVPStatus.INTERESTED]: 'bg-yellow-100 text-yellow-800',
  [RSVPStatus.NOT_GOING]: 'bg-red-100 text-red-800',
}

export function EventCard({ event, onEdit, onDelete, onViewAttendees }: EventCardProps) {
  const { hasPermission } = usePermissions()
  
  const canEdit = hasPermission(Permission.EDIT_EVENT)
  const canDelete = hasPermission(Permission.DELETE_EVENT)
  const canViewAttendees = hasPermission(Permission.VIEW_EVENT_ATTENDEES)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
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
    const { location } = event
    if (location.type === LocationType.VIRTUAL) {
      return `Virtual${location.virtualPlatform ? ` • ${location.virtualPlatform}` : ''}`
    }
    if (location.type === LocationType.HYBRID) {
      return `Hybrid • ${location.city || 'Multiple locations'}`
    }
    return `${location.city || ''}${location.country ? `, ${location.country}` : ''}`
  }

  return (
    <div className="bg-card rounded-lg shadow-sm border border-border hover:shadow-md transition-shadow">
      {/* Cover Image */}
      {event.coverImage && (
        <div className="aspect-video w-full overflow-hidden rounded-t-lg">
          <img
            src={event.coverImage}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${eventTypeColors[event.type]}`}>
                {event.type.replace('_', ' ')}
              </span>
              {event.myRSVP && (
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${rsvpStatusColors[event.myRSVP]}`}>
                  {event.myRSVP.replace('_', ' ')}
                </span>
              )}
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">
              {event.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {event.description}
            </p>
          </div>

          {/* Actions Menu */}
          {(canEdit || canDelete || canViewAttendees) && (
            <div className="relative ml-4">
              <button className="p-1 text-muted-foreground hover:text-foreground rounded">
                <MoreVertical className="w-4 h-4" />
              </button>
              {/* TODO: Add dropdown menu */}
            </div>
          )}
        </div>

        {/* Event Details */}
        <div className="space-y-2 mb-4">
          {/* Date & Time */}
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>
              {formatDate(event.startDate)}
              {event.startDate !== event.endDate && ` - ${formatDate(event.endDate)}`}
            </span>
          </div>

          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>
              {formatTime(event.startDate)} - {formatTime(event.endDate)}
            </span>
          </div>

          {/* Location */}
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>{getLocationDisplay()}</span>
          </div>

          {/* Attendees */}
          <div className="flex items-center text-sm text-muted-foreground">
            <Users className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>
              {event.currentAttendees} attending
              {event.capacity && ` • ${event.capacity} capacity`}
            </span>
          </div>
        </div>

        {/* Chapter */}
        {event.chapter && (
          <div className="text-xs text-muted-foreground mb-3">
            Organized by {event.chapter.name}
          </div>
        )}

        {/* Tags */}
        {event.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {event.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 text-xs bg-muted text-muted-foreground rounded"
              >
                {tag}
              </span>
            ))}
            {event.tags.length > 3 && (
              <span className="px-2 py-1 text-xs bg-muted text-muted-foreground rounded">
                +{event.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button className="flex-1 px-4 py-2 text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors">
            View Details
          </button>
          
          {canViewAttendees && (
            <button
              onClick={() => onViewAttendees?.(event)}
              className="px-4 py-2 text-sm font-medium text-muted-foreground bg-muted hover:bg-muted/80 rounded-lg transition-colors"
            >
              Attendees
            </button>
          )}
        </div>
      </div>
    </div>
  )
}