import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Label } from '@/components/ui/Label'
import { Textarea } from '@/components/ui/Textarea'
import { useUpdateApplicationStatus } from '@/lib/hooks/queries/useJobs'
import { JobApplication, ApplicationStatus } from '@/types'
import { Loader2 } from 'lucide-react'

interface ApplicationStatusModalProps {
  application: JobApplication | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function ApplicationStatusModal({ application, isOpen, onClose, onSuccess }: ApplicationStatusModalProps) {
  const { mutateAsync: updateStatus, isPending: loading } = useUpdateApplicationStatus()
  const [status, setStatus] = useState<ApplicationStatus>('RECEIVED')
  const [rejectionReason, setRejectionReason] = useState('')

  if (!application) return null

  const handleUpdate = async () => {
    try {
      await updateStatus({ 
        id: application.id, 
        status, 
        rejectionReason: status === 'REJECTED' ? rejectionReason : undefined 
      })
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Failed to update status', error)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Application Status</DialogTitle>
          <DialogDescription>
            Change the status for {application.user?.firstName}'s application.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Status</Label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
              className="w-full px-3 py-2 border border-input rounded-md bg-transparent"
            >
              <option value="RECEIVED">Received</option>
              <option value="SHORTLISTED">Shortlisted</option>
              <option value="HIRED">Hired</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          {status === 'REJECTED' && (
            <div className="space-y-2">
              <Label>Rejection Reason</Label>
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Optional feedback for the candidate..."
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleUpdate} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update Status
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
