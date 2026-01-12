'use client'

import { Dialog } from '@/components/ui/Dialog'
import { useState } from 'react'
import { Loader2, AlertTriangle } from 'lucide-react'
import { useCancelEvent } from '@/lib/hooks/queries/useEvents'
import { useRouter } from 'next/navigation'

interface CancelEventModalProps {
  eventId: string
  isOpen: boolean
  onClose: () => void
}

export function CancelEventModal({ eventId, isOpen, onClose }: CancelEventModalProps) {
  const [reason, setReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const cancelEventMutation = useCancelEvent()
  const router = useRouter()

  if (!isOpen) return null

  const handleCancel = async () => {
    if (!reason.trim()) return

    try {
      setIsSubmitting(true)
      await cancelEventMutation.mutateAsync({ 
        id: eventId, 
        data: { reason } 
      })
      onClose()
      router.refresh()
    } catch (error) {
      console.error('Failed to cancel event:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => !open && onClose()}
      className="bg-card w-full max-w-md border border-border p-6 space-y-4"
    >
        <div className="flex items-center gap-3 text-destructive">
          <AlertTriangle className="w-6 h-6" />
          <h2 className="text-lg font-semibold">Cancel Event</h2>
        </div>
        
        <p className="text-muted-foreground">
          Are you sure you want to cancel this event? This action cannot be undone. 
          Please provide a reason for the cancellation.
        </p>

        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason for cancellation (required)..."
          className="w-full min-h-[100px] p-3 rounded-md border border-input bg-background text-sm focus:ring-2 focus:ring-destructive/20 outline-none"
        />

        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-md hover:bg-muted font-medium text-sm transition-colors"
          >
            Keep Event
          </button>
          
          <button
            onClick={handleCancel}
            disabled={!reason.trim() || isSubmitting}
            className="flex items-center gap-2 px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 font-medium text-sm transition-colors disabled:opacity-50"
          >
            {isSubmitting && <Loader2 className="w-3 h-3 animate-spin" />}
            Confirm Cancellation
          </button>
        </div>
    </Dialog>
  )
}
