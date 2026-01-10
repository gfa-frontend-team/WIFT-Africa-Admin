'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { Label } from '@/components/ui/Label'
import { reportsApi } from '@/lib/api/reports'
import { useToast } from '@/components/ui/use-toast'

interface ReportResolutionModalProps {
  reportId: string
  isOpen: boolean
  onClose: () => void
  onResolved: () => void
}

export function ReportResolutionModal({ reportId, isOpen, onClose, onResolved }: ReportResolutionModalProps) {
  const [note, setNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async () => {
    if (!note.trim()) {
      toast({
        title: 'Error',
        description: 'Please provide a resolution note',
        variant: 'destructive',
      })
      return
    }

    try {
      setIsSubmitting(true)
      await reportsApi.resolveReport(reportId, { resolutionNote: note })
      toast({
        title: 'Report Resolved',
        description: 'The report has been successfully resolved.',
      })
      onResolved()
      onClose()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to resolve report. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Resolve Report</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="note">Resolution Note</Label>
            <Textarea
              id="note"
              placeholder="Explain how this report was resolved (e.g., 'Removing content', 'Warning user', 'False alarm')..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Resolving...' : 'Confirm Resolution'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
