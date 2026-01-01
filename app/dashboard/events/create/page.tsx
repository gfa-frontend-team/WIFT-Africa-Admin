'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useCreateEvent } from '@/lib/hooks/queries/useEvents'
import { usePermissions } from '@/lib/hooks'
import { Permission } from '@/lib/constants/permissions'
import { EventForm } from '@/components/events/EventForm'
import { CreateEventData, UpdateEventData } from '@/types'

export default function CreateEventPage() {
  const router = useRouter()
  const { hasPermission } = usePermissions()
  const createEventMutation = useCreateEvent()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const canCreateEvent = hasPermission(Permission.CREATE_EVENT)

  if (!canCreateEvent) {
    return (
      <div className="p-6">
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <p className="text-destructive">Access denied. You don't have permission to create events.</p>
        </div>
      </div>
    )
  }

  const handleSubmit = async (data: CreateEventData | UpdateEventData) => {
    setIsSubmitting(true)
    try {
      await createEventMutation.mutateAsync(data as CreateEventData)
      router.push('/dashboard/events')
    } catch (error) {
      console.error('Failed to create event:', error)
      throw error // Re-throw to let form handle the error
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.push('/dashboard/events')
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/dashboard/events"
          className="p-2 hover:bg-accent rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Create Event</h1>
          <p className="text-muted-foreground">
            Create a new event for your chapter
          </p>
        </div>
      </div>

      {/* Form */}
      <EventForm
        mode="create"
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
      />
    </div>
  )
}