'use client'

import { Dialog } from '@/components/ui/Dialog'
import { useState } from 'react'
import { Loader2, AlertTriangle, Trash2 } from 'lucide-react'
import { useCancelEvent } from '@/lib/hooks/queries/useEvents'
import { useRouter } from 'next/navigation'
import { EventStatus } from '@/types'

interface CancelEventModalProps {
  readonly eventId: string
  readonly eventStatus: EventStatus
  readonly isOpen: boolean
  readonly onClose: () => void
}

export function CancelEventModal({ eventId, eventStatus, isOpen, onClose }: CancelEventModalProps) {
  const [reason, setReason] = useState('')
  const cancelEventMutation = useCancelEvent()
  const router = useRouter()

  if (!isOpen) return null

  const isDeleteMode = eventStatus === EventStatus.DRAFT || eventStatus === EventStatus.WAITING

  const handleConfirm = () => {
    if (!isDeleteMode && !reason.trim()) return

    onClose()
    if (isDeleteMode) router.push('/dashboard/events')

    cancelEventMutation.mutate({
      id: eventId,
      data: isDeleteMode ? {} : { reason },
    })
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      className="bg-card w-full max-w-md border border-border p-6 space-y-4"
    >
      <div className="flex items-center gap-3 text-destructive">
        {isDeleteMode ? <Trash2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
        <h2 className="text-lg font-semibold">
          {isDeleteMode ? 'Delete Event' : 'Cancel Event'}
        </h2>
      </div>

      <p className="text-muted-foreground">
        {isDeleteMode
          ? 'Are you sure you want to permanently delete this event? This action cannot be undone.'
          : 'Are you sure you want to cancel this event? This action cannot be undone. Please provide a reason for the cancellation.'}
      </p>

      {!isDeleteMode && (
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason for cancellation (required)..."
          className="w-full min-h-[100px] p-3 rounded-md border border-input bg-background text-sm focus:ring-2 focus:ring-destructive/20 outline-none"
        />
      )}

      <div className="flex justify-end gap-3 pt-2">
        <button
          onClick={onClose}
          disabled={cancelEventMutation.isPending}
          className="px-4 py-2 rounded-md hover:bg-muted font-medium text-sm transition-colors"
        >
          Keep Event
        </button>

        <button
          onClick={handleConfirm}
          disabled={(!isDeleteMode && !reason.trim()) || cancelEventMutation.isPending}
          className="flex items-center gap-2 px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 font-medium text-sm transition-colors disabled:opacity-50"
        >
          {cancelEventMutation.isPending && <Loader2 className="w-3 h-3 animate-spin" />}
          {isDeleteMode ? 'Delete Event' : 'Confirm Cancellation'}
        </button>
      </div>
    </Dialog>
  )
}
