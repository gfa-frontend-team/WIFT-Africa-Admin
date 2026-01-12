'use client'

import { Dialog } from '@/components/ui/Dialog'
import { useState, FormEvent } from 'react'
import { MembershipRequest } from '@/types'
import { Button } from '@/components/ui/Button'
import { X, CheckCircle } from 'lucide-react'

interface ApproveModalProps {
  request: MembershipRequest
  onConfirm: (notes?: string) => Promise<void>
  onClose: () => void
  isLoading: boolean
}

export function ApproveModal({ request, onConfirm, onClose, isLoading }: ApproveModalProps) {
  const [notes, setNotes] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    await onConfirm(notes || undefined)
  }

  return (
    <Dialog 
      open={true} 
      onOpenChange={(open) => !open && onClose()}
      className="bg-card w-full max-w-md shadow-xl p-0 overflow-hidden"
    >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">Approve Request</h2>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                You are about to approve the membership request for:
              </p>
              <p className="font-medium text-foreground">
                {request.user?.firstName} {request.user?.lastName}
              </p>
              <p className="text-sm text-muted-foreground">{request.user?.email}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Add any notes about this approval..."
                disabled={isLoading}
              />
            </div>

            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-sm text-green-800 dark:text-green-400">
                The user will receive an approval email and gain full access to the platform.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
            >
              Approve Request
            </Button>
          </div>
        </form>
    </Dialog>
  )
}
