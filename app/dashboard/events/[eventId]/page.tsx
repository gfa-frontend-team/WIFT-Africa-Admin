'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Calendar, MapPin, Users, Clock, Edit, Trash2, UserCheck, MoreVertical } from 'lucide-react'
import Link from 'next/link'
import { useEvent, useCancelEvent } from '@/lib/hooks/queries/useEvents'
import { usePermissions } from '@/lib/hooks'
import { Permission } from '@/lib/constants/permissions'
import { RSVPButton } from '@/components/events/RSVPButton'
import { EventType, LocationType, RSVPStatus } from '@/types'

const eventTypeColors = {
  [EventType.WORKSHOP]: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  [EventType.SCREENING]: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  [EventType.NETWORKING]: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  [EventType.MEETUP]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  [EventType.CONFERENCE]: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  [EventType.OTHER]: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
}

const rsvpStatusColors = {
  [RSVPStatus.GOING]: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  [RSVPStatus.INTERESTED]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  [RSVPStatus.NOT_GOING]: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
}

export default function EventDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.eventId as string
  
  const { hasPermission } = usePermissions()
  const { data: event, isLoading, error } = useEvent(eventId)
  const cancelEventMutation = useCancelEvent()
  
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [isCancelling, setIsCancelling] = useState(false)

  const canEdit = hasPermission(Permission.EDIT_EVENT)
  const canDelete = hasPermission(Permission.DELETE_EVENT)
  const canViewAttendees = hasPermission(Permission.VIEW_EVENT_ATTENDEES)

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

  const handleCancelEvent = async () => {
    if (!cancelReason.trim()) return
    
    setIsCancelling(true)
    try {
      await cancelEventMutation.mutateAsync({
        eventId,
        data: { reason: cancelReason }
      })
      router.push('/dashboard/events')
    } catch (error) {
      console.error('Failed to cancel event:', error)
    } finally {
      setIsCancelling(false)
    }
  }

  if (isLoading) {
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-card rounded-lg border border-border p-6">
                <div className="h-6 bg-muted rounded w-48 mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            </div>
            <div>
              <div className="bg-card rounded-lg border border-border p-6">
                <div className="h-6 bg-muted rounded w-32 mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="p-6">
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <p className="text-destructive">Failed to load event details. Please try again.</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/events"
            className="p-2 hover:bg-accent rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{event.title}</h1>
            <p className="text-muted-foreground">
              Event Details
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {canViewAttendees && (
            <Link
              href={`/dashboard/events/${eventId}/attendees`}
              className="inline-flex items-center px-3 py-2 text-sm bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors"
            >
              <UserCheck className="w-4 h-4 mr-2" />
              Attendees
            </Link>
          )}
          
          {canEdit && (
            <Link
              href={`/dashboard/events/${eventId}/edit`}
              className="inline-flex items-center px-3 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Link>
          )}
          
          {canDelete && (
            <button
              onClick={() => setShowCancelDialog(true)}
              className="inline-flex items-center px-3 py-2 text-sm bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Cancel Event
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Cover Image */}
          {event.coverImage && (
            <div className="bg-card rounded-lg border border-border overflow-hidden">
              <img
                src={event.coverImage}
                alt={event.title}
                className="w-full h-64 object-cover"
              />
            </div>
          )}

          {/* Event Details */}
          <div className="bg-card rounded-lg border border-border p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${eventTypeColors[event.type]}`}>
                {event.type.replace('_', ' ')}
              </span>
              {event.myRSVP && (
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${rsvpStatusColors[event.myRSVP]}`}>
                  My RSVP: {event.myRSVP.replace('_', ' ')}
                </span>
              )}
              {!event.isActive && (
                <span className="px-3 py-1 text-sm font-medium rounded-full bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400">
                  Cancelled
                </span>
              )}
            </div>

            <h2 className="text-xl font-semibold text-foreground mb-4">Description</h2>
            <div className="prose prose-sm max-w-none text-muted-foreground">
              <p className="whitespace-pre-wrap">{event.description}</p>
            </div>

            {/* Tags */}
            {event.tags.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-foreground mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {event.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 text-xs bg-muted text-muted-foreground rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Location Details */}
          <div className="bg-card rounded-lg border border-border p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Location
            </h2>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">Type:</span>
                <span className="text-sm text-muted-foreground">{event.location.type}</span>
              </div>

              {event.location.type === LocationType.PHYSICAL && (
                <>
                  {event.location.address && (
                    <div className="flex items-start gap-2">
                      <span className="text-sm font-medium text-foreground">Address:</span>
                      <span className="text-sm text-muted-foreground">{event.location.address}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">Location:</span>
                    <span className="text-sm text-muted-foreground">{getLocationDisplay()}</span>
                  </div>
                </>
              )}

              {(event.location.type === LocationType.VIRTUAL || event.location.type === LocationType.HYBRID) && (
                <>
                  {event.location.virtualPlatform && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">Platform:</span>
                      <span className="text-sm text-muted-foreground">{event.location.virtualPlatform}</span>
                    </div>
                  )}
                  {event.location.virtualUrl && (
                    <div className="flex items-start gap-2">
                      <span className="text-sm font-medium text-foreground">Link:</span>
                      <a
                        href={event.location.virtualUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline break-all"
                      >
                        {event.location.virtualUrl}
                      </a>
                    </div>
                  )}
                </>
              )}

              {event.location.type === LocationType.HYBRID && event.location.address && (
                <div className="flex items-start gap-2">
                  <span className="text-sm font-medium text-foreground">Physical Address:</span>
                  <span className="text-sm text-muted-foreground">{event.location.address}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Date & Time */}
          <div className="bg-card rounded-lg border border-border p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Date & Time
            </h3>
            
            <div className="space-y-3">
              <div>
                <div className="text-sm font-medium text-foreground">Start</div>
                <div className="text-sm text-muted-foreground">
                  {formatDate(event.startDate)}
                </div>
                <div className="text-sm text-muted-foreground">
                  {formatTime(event.startDate)}
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-foreground">End</div>
                <div className="text-sm text-muted-foreground">
                  {formatDate(event.endDate)}
                </div>
                <div className="text-sm text-muted-foreground">
                  {formatTime(event.endDate)}
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-foreground">Timezone</div>
                <div className="text-sm text-muted-foreground">{event.timezone}</div>
              </div>
            </div>
          </div>

          {/* Attendance */}
          <div className="bg-card rounded-lg border border-border p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Attendance
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Current Attendees</span>
                <span className="text-sm font-medium text-foreground">{event.currentAttendees}</span>
              </div>
              
              {event.capacity && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Capacity</span>
                  <span className="text-sm font-medium text-foreground">{event.capacity}</span>
                </div>
              )}

              {event.capacity && (
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                    <span>Filled</span>
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
            </div>
          </div>

          {/* RSVP Section */}
          <div className="bg-card rounded-lg border border-border p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">RSVP</h3>
            <RSVPButton
              eventId={eventId}
              currentRSVP={event.myRSVP}
              isEventFull={event.capacity ? event.currentAttendees >= event.capacity : false}
              isEventCancelled={!event.isActive}
              isEventPast={new Date(event.endDate) < new Date()}
            />
          </div>

          {/* Organizer */}
          {event.chapter && (
            <div className="bg-card rounded-lg border border-border p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Organizer</h3>
              
              <div className="space-y-2">
                <div className="text-sm font-medium text-foreground">{event.chapter.name}</div>
                {event.organizer && (
                  <div className="text-sm text-muted-foreground">
                    by {event.organizer.firstName} {event.organizer.lastName}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cancel Event Dialog */}
      {showCancelDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg border border-border p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-foreground mb-4">Cancel Event</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Are you sure you want to cancel this event? All attendees will be notified.
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-foreground mb-2">
                Reason for cancellation *
              </label>
              <textarea
                rows={3}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-ring text-foreground resize-none"
                placeholder="Please provide a reason for cancelling this event"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelDialog(false)}
                className="flex-1 px-4 py-2 text-sm bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors"
              >
                Keep Event
              </button>
              <button
                onClick={handleCancelEvent}
                disabled={!cancelReason.trim() || isCancelling}
                className="flex-1 px-4 py-2 text-sm bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isCancelling ? 'Cancelling...' : 'Cancel Event'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}