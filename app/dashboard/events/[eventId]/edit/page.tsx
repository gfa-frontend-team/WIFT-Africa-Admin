'use client'

import { use, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { EventForm } from '@/components/events/EventForm'
import { useEvent, useUpdateEvent } from '@/lib/hooks/queries/useEvents'
import { CreateEventData, UpdateEventData } from '@/types'

export default function EditEventPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = use(params)
  const router = useRouter()
  const { data: event, isLoading, error } = useEvent(eventId)
  const updateEventMutation = useUpdateEvent()

  const handleSubmit = async (data: CreateEventData | UpdateEventData) => {
    try {
      await updateEventMutation.mutateAsync({ id: eventId, data: data as UpdateEventData })
      router.push('/dashboard/events')
    } catch (error) {
      console.error('Failed to update event:', error)
    }
  }

  if (isLoading) return <div className="p-8 text-center">Loading event details...</div>
  if (error) return <div className="p-8 text-center text-destructive">Error loading event: {(error as Error).message}</div>
  if (!event) return <div className="p-8 text-center">Event not found</div>

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/events" className="p-2 hover:bg-muted rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Edit Event</h1>
          <p className="text-muted-foreground">Update event details</p>
        </div>
      </div>

      <EventForm 
        mode="edit" 
        initialData={{
          ...event,
          // Handle specific transformations if necessary (e.g. date strings to input value format)
          startDate: new Date(event.startDate).toISOString().slice(0, 16), // Format for datetime-local
          endDate: new Date(event.endDate).toISOString().slice(0, 16),
          chapterId: typeof event.chapterId === 'object' ? (event.chapterId as any)._id : event.chapterId, // Handle populated chapter field
        }}
        onSubmit={handleSubmit} 
        isSubmitting={updateEventMutation.isPending} 
      />
    </div>
  )
}