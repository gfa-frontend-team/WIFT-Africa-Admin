'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Chapter } from '@/types'
import { useCreateChapter, useUpdateChapter } from '@/lib/hooks/queries/useChapters'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

interface ChapterFormProps {
  chapter?: Chapter
  isEdit?: boolean
  isAdminView?: boolean
}

export function ChapterForm({ chapter, isEdit = false, isAdminView = false }: ChapterFormProps) {
  const router = useRouter()
  const { mutateAsync: createChapter, isPending: isCreating } = useCreateChapter()
  const { mutateAsync: updateChapter, isPending: isUpdating } = useUpdateChapter(isAdminView)
  
  const isLoading = isCreating || isUpdating

  const [formData, setFormData] = useState({
    name: chapter?.name || '',
    code: chapter?.code || '',
    country: chapter?.country || '',
    city: chapter?.city || '',
    description: chapter?.description || '',
    missionStatement: chapter?.missionStatement || '',
    currentPresident: chapter?.currentPresident || '',
    presidentEmail: chapter?.presidentEmail || '',
    presidentPhone: chapter?.presidentPhone || '',
    email: chapter?.email || '',
    phone: chapter?.phone || '',
    address: chapter?.address || '',
    website: chapter?.website || '',
    facebookUrl: chapter?.facebookUrl || '',
    twitterHandle: chapter?.twitterHandle || '',
    instagramHandle: chapter?.instagramHandle || '',
    linkedinUrl: chapter?.linkedinUrl || '',
  })

  const [error, setError] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      if (isEdit && chapter) {
        await updateChapter({ id: chapter.id, data: formData })
        router.push(`/dashboard/chapters/${chapter.id}`)
      } else {
        const newChapter = await createChapter(formData)
        router.push(`/dashboard/chapters/${newChapter.id}`)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save chapter')
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-destructive">
          {error}
        </div>
      )}

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Chapter Name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              required
              placeholder="e.g., Lagos Chapter"
            />
            <Input
              label="Chapter Code"
              value={formData.code}
              onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
              required
              placeholder="e.g., NG-LAG"
              maxLength={10}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Country"
              value={formData.country}
              onChange={(e) => handleChange('country', e.target.value)}
              required
              placeholder="e.g., Nigeria"
            />
            <Input
              label="City"
              value={formData.city}
              onChange={(e) => handleChange('city', e.target.value)}
              placeholder="e.g., Lagos"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={3}
              maxLength={1000}
              className="w-full px-3 py-2 border border-input rounded-lg bg-background"
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
              rows={4}
              maxLength={2000}
              className="w-full px-3 py-2 border border-input rounded-lg bg-background"
              placeholder="Chapter's mission statement"
            />
          </div>
        </CardContent>
      </Card>

      {/* Leadership */}
      <Card>
        <CardHeader>
          <CardTitle>Leadership</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Current President"
            value={formData.currentPresident}
            onChange={(e) => handleChange('currentPresident', e.target.value)}
            placeholder="President's full name"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="President Email"
              type="email"
              value={formData.presidentEmail}
              onChange={(e) => handleChange('presidentEmail', e.target.value)}
              placeholder="president@example.com"
            />
            <Input
              label="President Phone"
              type="tel"
              value={formData.presidentPhone}
              onChange={(e) => handleChange('presidentPhone', e.target.value)}
              placeholder="+234 123 456 7890"
            />
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
              placeholder="+234 123 456 7890"
            />
          </div>

          <Input
            label="Address"
            value={formData.address}
            onChange={(e) => handleChange('address', e.target.value)}
            placeholder="Physical address"
            maxLength={500}
          />

          <Input
            label="Website"
            type="url"
            value={formData.website}
            onChange={(e) => handleChange('website', e.target.value)}
            placeholder="https://chapter.wiftafrica.org"
          />
        </CardContent>
      </Card>

      {/* Social Media */}
      <Card>
        <CardHeader>
          <CardTitle>Social Media</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Facebook URL"
            type="url"
            value={formData.facebookUrl}
            onChange={(e) => handleChange('facebookUrl', e.target.value)}
            placeholder="https://facebook.com/wiftchapter"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Twitter Handle"
              value={formData.twitterHandle}
              onChange={(e) => handleChange('twitterHandle', e.target.value)}
              placeholder="@wiftchapter"
              maxLength={50}
            />
            <Input
              label="Instagram Handle"
              value={formData.instagramHandle}
              onChange={(e) => handleChange('instagramHandle', e.target.value)}
              placeholder="@wiftchapter"
              maxLength={50}
            />
          </div>
          <Input
            label="LinkedIn URL"
            type="url"
            value={formData.linkedinUrl}
            onChange={(e) => handleChange('linkedinUrl', e.target.value)}
            placeholder="https://linkedin.com/company/wiftchapter"
          />
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {isEdit ? 'Update Chapter' : 'Create Chapter'}
        </Button>
      </div>
    </form>
  )
}
