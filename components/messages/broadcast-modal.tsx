'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Label } from '@/components/ui/Label'
import { Textarea } from '@/components/ui/Textarea'
import { NativeSelect } from '@/components/ui/NativeSelect'
import { messagesApi } from '@/lib/api/messages'
import { useToast } from '@/components/ui/use-toast'
import { useAuthStore } from '@/lib/stores'
import { useChapters } from '@/lib/hooks/queries/useChapters'
import { MessageRecipientType } from '@/types'
import { AlertCircle, Loader2 } from 'lucide-react'

interface BroadcastModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function BroadcastModal({ isOpen, onClose, onSuccess }: BroadcastModalProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form State
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [recipientType, setRecipientType] = useState<MessageRecipientType>(MessageRecipientType.ALL)
  const [chapterId, setChapterId] = useState('')

  // Fetch chapters for selection
  const { data: chaptersData } = useChapters({}, { enabled: isOpen && user?.accountType === 'SUPER_ADMIN' })
  const chapters = chaptersData?.data || []

  // Check Permissions
  const isSuperAdmin = user?.accountType === 'SUPER_ADMIN'
  const isChapterAdmin = user?.accountType === 'CHAPTER_ADMIN'

  // Set default target for Chapter Admin
  useState(() => {
    if (isChapterAdmin && user?.chapterId) {
      setRecipientType(MessageRecipientType.CHAPTER)
      setChapterId(user.chapterId)
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!title.trim() || !content.trim()) {
      setError('Title and content are required')
      return
    }

    if (recipientType === MessageRecipientType.CHAPTER && !chapterId && isSuperAdmin) {
      setError('Please select a chapter')
      return
    }

    try {
      setLoading(true)
      await messagesApi.sendBroadcast({
        title,
        content,
        recipientType,
        chapterId: recipientType === MessageRecipientType.CHAPTER ? chapterId : undefined,
      })

      toast({
        title: 'Broadcast Sent',
        description: 'Your message has been queued for delivery.',
      })

      setTitle('')
      setContent('')
      if (onSuccess) onSuccess()
      onClose()
      router.refresh()
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to send broadcast')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Send Broadcast Message</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm flex items-center gap-2 dark:bg-red-900/30 dark:text-red-400">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <input
              id="title"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Announcement Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label>Target Audience</Label>
            <NativeSelect
              value={recipientType}
              onChange={(e) => setRecipientType(e.target.value as MessageRecipientType)}
              disabled={loading || isChapterAdmin} // Chapter Admin locked to their chapter
            >
              {isSuperAdmin && (
                <option value={MessageRecipientType.ALL}>Global (All Members)</option>
              )}
              <option value={MessageRecipientType.CHAPTER}>Specific Chapter</option>
            </NativeSelect>
          </div>

          {recipientType === MessageRecipientType.CHAPTER && isSuperAdmin && (
             <div className="space-y-2">
               <Label>Select Chapter</Label>
               <NativeSelect
                 value={chapterId}
                 onChange={(e) => setChapterId(e.target.value)}
                 disabled={loading}
               >
                 <option value="">Select a chapter...</option>
                 {chapters.map((chapter) => (
                   <option key={chapter.id} value={chapter.id}>
                     {chapter.name}
                   </option>
                 ))}
               </NativeSelect>
             </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="content">Message Content</Label>
            <Textarea
              id="content"
              placeholder="Type your announcement here..."
              className="min-h-[150px]"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={loading}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Broadcast
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
