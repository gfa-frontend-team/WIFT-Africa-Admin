'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { Chapter } from '@/types'
import { useUpdateChapter } from '@/lib/hooks/queries/useChapters'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface ChapterEditModalProps {
  chapter: Chapter
  isOpen: boolean
  onClose: () => void
}

export function ChapterEditModal({ chapter, isOpen, onClose }: ChapterEditModalProps) {
  const { mutateAsync: updateChapter, isPending: isUpdating } = useUpdateChapter(false) // isAdminView=false
  
  const [formData, setFormData] = useState({
    description: '',
    missionStatement: '',
    email: '',
    phone: '',
    address: '',
    website: '',
    facebookUrl: '',
    twitterHandle: '',
    instagramHandle: '',
    linkedinUrl: '',
  })

  // Initialize form data when chapter changes or modal opens
  useEffect(() => {
    if (chapter) {
      setFormData({
        description: chapter.description || '',
        missionStatement: chapter.missionStatement || '',
        email: chapter.email || '',
        phone: chapter.phone || '',
        address: chapter.address || '',
        website: chapter.website || '',
        facebookUrl: chapter.facebookUrl || '',
        twitterHandle: chapter.twitterHandle || '',
        instagramHandle: chapter.instagramHandle || '',
        linkedinUrl: chapter.linkedinUrl || '',
      })
    }
  }, [chapter, isOpen])

  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      await updateChapter({ id: chapter.id, data: formData })
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to update chapter')
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div 
        className="bg-background rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-background z-10">
          <h2 className="text-xl font-semibold text-foreground">Edit Chapter Details</h2>
          <button 
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
            type="button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-destructive text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={3}
                maxLength={1000}
                className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="Brief description of the chapter"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Mission Statement
              </label>
              <textarea
                value={formData.missionStatement}
                onChange={(e) => handleChange('missionStatement', e.target.value)}
                rows={3}
                maxLength={2000}
                className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="Chapter's mission statement"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Chapter Email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="chapter@wiftafrica.org"
              />
              <Input
                label="Chapter Phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="+1234567890"
              />
            </div>

            <Input
              label="Address"
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="Physical address"
            />

            <Input
              label="Website"
              type="url"
              value={formData.website}
              onChange={(e) => handleChange('website', e.target.value)}
              placeholder="https://chapter.wiftafrica.org"
            />

            <div className="space-y-4 pt-4 border-t border-border">
              <h3 className="text-sm font-medium text-foreground">Social Media</h3>
              <Input
                label="Facebook URL"
                type="url"
                value={formData.facebookUrl}
                onChange={(e) => handleChange('facebookUrl', e.target.value)}
                placeholder="https://facebook.com/..."
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Twitter Handle"
                  value={formData.twitterHandle}
                  onChange={(e) => handleChange('twitterHandle', e.target.value)}
                  placeholder="@handle"
                  maxLength={50}
                />
                <Input
                  label="Instagram Handle"
                  value={formData.instagramHandle}
                  onChange={(e) => handleChange('instagramHandle', e.target.value)}
                  placeholder="@handle"
                  maxLength={50}
                />
              </div>
              <Input
                label="LinkedIn URL"
                type="url"
                value={formData.linkedinUrl}
                onChange={(e) => handleChange('linkedinUrl', e.target.value)}
                placeholder="https://linkedin.com/..."
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isUpdating}>
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
