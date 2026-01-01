'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useEvent, useUpdateEvent } from '@/lib/hooks/queries/useEvents'
import { usePermissions } from '@/lib/hooks'
import { Permission } from '@/lib/constants/permissions'
import { EventForm } from '@/components/events/EventForm'
import { UpdateEventData } from '@/types'

export default function EditEventPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.eventId as string
  
  const { hasPermission } = usePermissions()
  const { data: event, isLoading, error } = useEvent(eventId)
  const updateEventMutation = useUpdateEvent()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const canEditEvent = hasPermission(Permission.EDIT_EVENT)

  if (!canEditEvent) {
    return (
      <div className="p-6">
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <p className="text-destructive">Access denied. You don't have permission to edit events.</p>
        </div>
      </div>
    )
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
                <div className="space-y-4">
                  <div className="h-10 bg-muted rounded"></div>
                  <div className="h-24 bg-muted rounded"></div>
                </div>
              </div>
            </div>
            <div>
              <div className="bg-card rounded-lg border border-border p-6">
                <div className="h-6 bg-muted rounded w-32 mb-4"></div>
                <div className="space-y-3">
                  <div className="h-10 bg-muted rounded"></div>
                  <div className="h-10 bg-muted rounded"></div>
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

  const handleSubmit = async (data: UpdateEventData) => {
    setIsSubmitting(true)
    try {
      await updateEventMutation.mutateAsync({
        eventId,
        data
      })
      router.push(`/dashboard/events/${eventId}`)
    } catch (error) {
      console.error('Failed to update event:', error)
      throw error // Re-throw to let form handle the error
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.push(`/dashboard/events/${eventId}`)
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
          <h1 className="text-3xl font-bold text-foreground">Edit Event</h1>
          <p className="text-muted-foreground">
            Update event details
          </p>
        </div>
      </div>

      {/* Form */}
      <EventForm
        mode="edit"
        initialData={event}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
      />
    </div>
  )
}