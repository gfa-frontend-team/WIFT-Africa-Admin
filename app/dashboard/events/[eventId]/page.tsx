'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, MapPin, Users, Edit, Trash2, Globe, Video, Clock } from 'lucide-react'
import { useEvent } from '@/lib/hooks/queries/useEvents'
import { EventStatus, LocationType } from '@/types'
import { AttendeesList } from '@/components/events/AttendeesList'
import { CancelEventModal } from '@/components/events/CancelEventModal'
import { useState } from 'react'

export default function EventDetailsPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = use(params)
  const router = useRouter()
  const { data: event, isLoading, error } = useEvent(eventId)
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)

  if (isLoading) return <div className="p-12 text-center text-muted-foreground">Loading event details...</div>
  
  if (error) return (
    <div className="p-12 text-center">
      <p className="text-destructive mb-4">Error loading event</p>
      <Link href="/dashboard/events" className="text-primary hover:underline">Return to Events</Link>
    </div>
  )

  if (!event) return (
    <div className="p-12 text-center">
      <p className="text-muted-foreground mb-4">Event not found</p>
      <Link href="/dashboard/events" className="text-primary hover:underline">Return to Events</Link>
    </div>
  )

  const isPhysical = event.location.type === LocationType.PHYSICAL || event.location.type === LocationType.HYBRID
  const isVirtual = event.location.type === LocationType.VIRTUAL || event.location.type === LocationType.HYBRID

  return (
    <div className="p-6 pb-20 max-w-5xl mx-auto space-y-8">
      {/* Header & Nav */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/events" className="p-2 hover:bg-muted rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{event.title}</h1>
              <StatusBadge status={event.status} />
            </div>
            <p className="text-muted-foreground text-sm mt-1">ID: {event.id}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
           <Link 
            href={`/dashboard/events/${event.id}/edit`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors font-medium"
          >
            <Edit className="w-4 h-4" />
            Edit Event
          </Link>
          
          {event.status !== EventStatus.CANCELLED && (
            <button
              onClick={() => setIsCancelModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-destructive/10 text-destructive rounded-lg hover:bg-destructive/20 transition-colors font-medium border border-destructive/20"
            >
              <Trash2 className="w-4 h-4" />
              Cancel Event
            </button>
          )}
        </div>
      </div>
      
      <CancelEventModal 
        eventId={event.id}
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
      />

      {/* Cover Image */}
      {event.coverImage && (
        <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-border bg-muted">
           {/* In a real app, uses Image component. Using img for simplicity if domains not configured. */}
           <img src={event.coverImage} alt={event.title} className="object-cover w-full h-full" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Description */}
          <section className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">About Event</h2>
            <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap text-muted-foreground">
              {event.description}
            </div>
            
            {event.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-border">
                {event.tags.map(tag => (
                  <span key={tag} className="px-2 py-1 bg-muted rounded text-xs font-medium text-muted-foreground">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </section>

          {/* Attendees Section */}
          <section className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Users className="w-5 h-5" />
                Attendees via RSVP
              </h2>
              <span className="text-sm text-muted-foreground">
                Total: {event.currentAttendees} / {event.capacity || '∞'}
              </span>
            </div>
            <AttendeesList eventId={event.id} />
          </section>

        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          
          {/* Date & Time */}
          <div className="bg-card border border-border rounded-lg p-6 space-y-4">
             <div className="flex items-start gap-3">
               <Calendar className="w-5 h-5 text-primary mt-0.5" />
               <div>
                 <h3 className="font-medium">Date & Time</h3>
                 <div className="text-sm text-muted-foreground mt-1 space-y-1">
                   <p>Start: {new Date(event.startDate).toLocaleString()}</p>
                   <p>End: {new Date(event.endDate).toLocaleString()}</p>
                   <p className="flex items-center gap-1 mt-2 text-xs bg-muted px-2 py-1 rounded w-fit">
                     <Clock className="w-3 h-3" />
                     {event.timezone}
                   </p>
                 </div>
               </div>
             </div>
          </div>

          {/* Location */}
          <div className="bg-card border border-border rounded-lg p-6 space-y-4">
             <div className="flex items-start gap-3">
               <MapPin className="w-5 h-5 text-primary mt-0.5" />
               <div className="w-full">
                 <h3 className="font-medium">Location</h3>
                 
                 <div className="mt-2 text-sm text-muted-foreground space-y-3">
                   {isPhysical && (
                     <div>
                       <p className="font-medium text-foreground mb-1">Physical Address</p>
                       <p>{event.location.address}</p>
                       <p>{event.location.city}, {event.location.country}</p>
                     </div>
                   )}
                   
                   {isVirtual && (
                     <div>
                       <p className="font-medium text-foreground mb-1 flex items-center gap-2">
                         <Video className="w-3 h-3" /> Virtual Link
                       </p>
                       {event.location.virtualUrl ? (
                         <a href={event.location.virtualUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all">
                           {event.location.virtualUrl}
                         </a>
                       ) : <span className="italic">Link TBD</span>}
                       {event.location.virtualPlatform && (
                         <p className="text-xs mt-1">Platform: {event.location.virtualPlatform}</p>
                       )}
                     </div>
                   )}
                 </div>
               </div>
             </div>
          </div>

          {/* Organizer / Chapter */}
          <div className="bg-card border border-border rounded-lg p-6 space-y-4">
            <div className="flex items-start gap-3">
               <Globe className="w-5 h-5 text-primary mt-0.5" />
               <div>
                 <h3 className="font-medium">Context</h3>
                 <div className="text-sm text-muted-foreground mt-2 space-y-2">
                   <div>
                     <span className="block text-xs font-semibold text-foreground">TYPE</span>
                     {event.type.replace('_', ' ')}
                   </div>
                   <div>
                     <span className="block text-xs font-semibold text-foreground">CHAPTER</span>
                     {event.chapter?.name || 'Global Event'}
                   </div>
                 </div>
               </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: EventStatus }) {
  const styles = {
    [EventStatus.PUBLISHED]: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    [EventStatus.DRAFT]: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    [EventStatus.CANCELLED]: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    [EventStatus.COMPLETED]: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
      {status}
    </span>
  )
}