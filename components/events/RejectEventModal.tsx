'use client'

import { Dialog } from '@/components/ui/Dialog'
import { useState } from 'react'
import { Loader2, XCircle } from 'lucide-react'
import { useRejectEvent } from '@/lib/hooks/queries/useEvents'
import { useRouter } from 'next/navigation'

interface RejectEventModalProps {
  readonly eventId: string
  readonly isOpen: boolean
  readonly onClose: () => void
}

export function RejectEventModal({ eventId, isOpen, onClose }: RejectEventModalProps) {
  const [reason, setReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const rejectEventMutation = useRejectEvent()
  const router = useRouter()

  if (!isOpen) return null

  const handleReject = async () => {
    if (reason.trim().length < 10) return

    try {
      setIsSubmitting(true)
      await rejectEventMutation.mutateAsync({ id: eventId, reason: reason.trim() })
      onClose()
      setReason('') // Clear reason on success
      router.refresh()
    } catch (error) {
      console.error('Failed to reject event:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setReason('') // Clear reason on close
      onClose()
    }
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !open && handleClose()}
      className="bg-card w-full max-w-md border border-border p-6 space-y-4"
    >
      <div className="flex items-center gap-3 text-destructive">
        <XCircle className="w-6 h-6" />
        <h2 className="text-lg font-semibold">Reject Event</h2>
      </div>

      <p className="text-muted-foreground">
        Provide a reason for rejecting this event. The organizer will receive this feedback and can make changes before resubmitting.
      </p>

      <div className="space-y-2">
        <label htmlFor="rejection-reason" className="text-sm font-medium">
          Rejection Reason <span className="text-destructive">*</span>
        </label>
        <textarea
          id="rejection-reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g., Event description needs more details about the agenda and speakers..."
          className="w-full min-h-[120px] p-3 rounded-md border border-input bg-background text-sm focus:ring-2 focus:ring-destructive/20 outline-none resize-y"
          disabled={isSubmitting}
        />
        <p className="text-xs text-muted-foreground">
          Minimum 10 characters ({reason.trim().length}/10)
        </p>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          onClick={handleClose}
          disabled={isSubmitting}
          className="px-4 py-2 rounded-md hover:bg-muted font-medium text-sm transition-colors disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          onClick={handleReject}
          disabled={reason.trim().length < 10 || isSubmitting}
          className="flex items-center gap-2 px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 font-medium text-sm transition-colors disabled:opacity-50"
        >
          {isSubmitting && <Loader2 className="w-3 h-3 animate-spin" />}
          Reject Event
        </button>
      </div>
    </Dialog>
  )
}
