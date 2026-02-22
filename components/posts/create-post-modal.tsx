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
import { useToast } from '@/components/ui/use-toast'
import { useCreatePost } from '@/lib/hooks/queries/usePosts'
import { useAuthStore } from '@/lib/stores'
import { useChapters } from '@/lib/hooks/queries/useChapters'
import { Loader2 } from 'lucide-react'

interface CreatePostModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function CreatePostModal({ isOpen, onClose, onSuccess }: CreatePostModalProps) {
  const { toast } = useToast()
  const router = useRouter()
  const { admin } = useAuthStore() // Changed user to admin

  const { mutateAsync: createPost, isPending: loading } = useCreatePost()

  const [content, setContent] = useState('')
  const [targetType, setTargetType] = useState<'ALL' | 'CHAPTER'>('ALL')
  const [targetChapterId, setTargetChapterId] = useState('')

  const contentWords = content.trim() === '' ? 0 : content.trim().split(/\s+/).length;

  const { data: chaptersData } = useChapters({}, { enabled: isOpen && admin?.role === 'SUPER_ADMIN' })
  const chapters = chaptersData?.data || []

  // Check Permissions
  const isSuperAdmin = admin?.role === 'SUPER_ADMIN'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!content.trim()) {
      toast({ title: 'Error', description: 'Content is required', variant: 'destructive' })
      return
    }

    if (contentWords > 200) {
      toast({ title: 'Error', description: 'Content cannot exceed 200 words', variant: 'destructive' })
      return
    }

    try {
      const targetChapters = targetType === 'CHAPTER' && targetChapterId ? [targetChapterId] : undefined

      await createPost({
        content,
        targetChapters,
      })

      toast({ title: 'Success', description: 'Announcement posted successfully' })
      setContent('')
      onSuccess()
      onClose()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to create post',
        variant: 'destructive'
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create Admin Announcement</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="content">Content</Label>
              <span className={`text-xs ${contentWords > 200 ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
                {contentWords}/200 words
              </span>
            </div>
            <Textarea
              id="content"
              placeholder="What do you want to announce?"
              className="min-h-[150px]"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label>Target Audience</Label>
            <NativeSelect
              value={targetType}
              onChange={(e) => setTargetType(e.target.value as 'ALL' | 'CHAPTER')}
              disabled={loading || !isSuperAdmin}
            >
              <option value="ALL">Global (All Members)</option>
              <option value="CHAPTER">Specific Chapter</option>
            </NativeSelect>
          </div>

          {targetType === 'CHAPTER' && isSuperAdmin && (
            <div className="space-y-2">
              <Label>Select Chapter</Label>
              <NativeSelect
                value={targetChapterId}
                onChange={(e) => setTargetChapterId(e.target.value)}
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

          <div className="text-xs text-muted-foreground">
            * Media upload is not supported in this version.
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Post Announcement
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
