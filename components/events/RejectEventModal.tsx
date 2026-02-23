'use client'

import { Dialog } from '@/components/ui/Dialog'
import { useState } from 'react'
import { Loader2, XCircle } from 'lucide-react'
import { useRejectEvent } from '@/lib/hooks/queries/useEvents'

interface RejectEventModalProps {
  readonly eventId: string
  readonly isOpen: boolean
  readonly onClose: () => void
}

export function RejectEventModal({ eventId, isOpen, onClose }: RejectEventModalProps) {
  const [reason, setReason] = useState('')
  const rejectEventMutation = useRejectEvent()

  if (!isOpen) return null

  const handleReject = () => {
    if (reason.trim().length < 10) return

    rejectEventMutation.mutate({ id: eventId, reason: reason.trim() })
    onClose()
    setReason('')
  }

  const handleClose = () => {
    if (!rejectEventMutation.isPending) {
      setReason('')
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
          disabled={rejectEventMutation.isPending}
        />
        <p className="text-xs text-muted-foreground">
          Minimum 10 characters ({reason.trim().length}/10)
        </p>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          onClick={handleClose}
          disabled={rejectEventMutation.isPending}
          className="px-4 py-2 rounded-md hover:bg-muted font-medium text-sm transition-colors disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          onClick={handleReject}
          disabled={reason.trim().length < 10 || rejectEventMutation.isPending}
          className="flex items-center gap-2 px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 font-medium text-sm transition-colors disabled:opacity-50"
        >
          {rejectEventMutation.isPending && <Loader2 className="w-3 h-3 animate-spin" />}
          Reject Event
        </button>
      </div>
    </Dialog>
  )
}
