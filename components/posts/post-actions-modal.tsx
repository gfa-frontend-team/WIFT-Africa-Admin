'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Label } from '@/components/ui/Label'
import { Textarea } from '@/components/ui/Textarea'
import { useToast } from '@/components/ui/use-toast'
import { Loader2, AlertTriangle } from 'lucide-react'
import { Post } from '@/types'
import { useHidePost, useUnhidePost, useDeletePost, usePinPost } from '@/lib/hooks/queries/usePosts'

export type PostActionType = 'HIDE' | 'UNHIDE' | 'DELETE' | 'PIN' | 'UNPIN' | null

interface PostActionsModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  post: Post | null
  action: PostActionType
}
export function PostActionsModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  post, 
  action 
}: PostActionsModalProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [reason, setReason] = useState('')

  const { mutateAsync: hidePost, isPending: hiding } = useHidePost()
  const { mutateAsync: unhidePost, isPending: unhiding } = useUnhidePost()
  const { mutateAsync: deletePost, isPending: deleting } = useDeletePost()
  const { mutateAsync: pinPost, isPending: pinning } = usePinPost()

  const loading = hiding || unhiding || deleting || pinning

  if (!post || !action) return null

  const getTitle = () => {
    switch (action) {
      case 'HIDE': return 'Hide Post'
      case 'UNHIDE': return 'Unhide Post'
      case 'DELETE': return 'Delete Post'
      case 'PIN': return 'Pin Post'
      case 'UNPIN': return 'Unpin Post'
      default: return ''
    }
  }

  const getDescription = () => {
    switch (action) {
      case 'HIDE': return 'This post will be hidden from the public feed. Please provide a reason.'
      case 'UNHIDE': return 'This post will be visible to the public again.'
      case 'DELETE': return 'Are you sure you want to permanently delete this post? This action cannot be undone.'
      case 'PIN': return 'This post will be pinned to the top of the feed.'
      case 'UNPIN': return 'This post will no longer be pinned.'
      default: return ''
    }
  }

  const handleSubmit = async () => {
    if (action === 'HIDE' && !reason.trim()) {
      toast({ title: 'Error', description: 'Please provide a reason for hiding the post.', variant: 'destructive' })
      return
    }

    try {
      if (action === 'HIDE') {
        await hidePost({ id: post!.id, reason })
      } else if (action === 'UNHIDE') {
        await unhidePost(post!.id)
      } else if (action === 'DELETE') {
        await deletePost(post!.id)
      } else if (action === 'PIN' || action === 'UNPIN') {
        await pinPost(post!.id)
      }

      toast({ title: 'Success', description: `Post ${action!.toLowerCase()}d successfully.` }) // Fix text later if needed
      setReason('')
      onSuccess()
      onClose()
    } catch (error: any) {
      toast({ 
        title: 'Error', 
        description: error?.response?.data?.message || 'Failed to perform action', 
        variant: 'destructive' 
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
          <DialogDescription>{getDescription()}</DialogDescription>
        </DialogHeader>

        {action === 'HIDE' && (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Reason (Required)</Label>
              <Textarea
                id="reason"
                placeholder="Why is this post being hidden?"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>
        )}

        {action === 'DELETE' && (
           <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm flex items-center gap-2 dark:bg-red-900/30 dark:text-red-400 my-4">
             <AlertTriangle className="w-4 h-4" />
             Warning: This is a destructive action.
           </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button 
            variant={action === 'DELETE' || action === 'HIDE' ? 'destructive' : 'primary'}
            onClick={handleSubmit} 
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
