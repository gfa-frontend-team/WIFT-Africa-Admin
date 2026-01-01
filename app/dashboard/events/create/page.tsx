'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { EventForm } from '@/components/events/EventForm'
import { useCreateEvent } from '@/lib/hooks/queries/useEvents'
import { CreateEventData, UpdateEventData } from '@/types'

export default function CreateEventPage() {
  const router = useRouter()
  const createEventMutation = useCreateEvent()

  const handleSubmit = async (data: CreateEventData | UpdateEventData) => {
    try {
      await createEventMutation.mutateAsync(data as CreateEventData)
      router.push('/dashboard/events')
    } catch (error) {
      console.error('Failed to create event:', error)
      // Error handling is usually done via toast notification in the mutation onError
      // or we can handle it here if we want to show specific form errors not caught by Zod
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/events" className="p-2 hover:bg-muted rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Create Event</h1>
          <p className="text-muted-foreground">Add a new event to the calendar</p>
        </div>
      </div>

      <EventForm 
        mode="create" 
        onSubmit={handleSubmit} 
        isSubmitting={createEventMutation.isPending} 
      />
    </div>
  )
}