'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Calendar, MapPin, Users, Clock } from 'lucide-react'
import Link from 'next/link'
import { useCreateEvent } from '@/lib/hooks/queries/useEvents'
import { useChapters } from '@/lib/hooks/queries/useChapters'
import { usePermissions } from '@/lib/hooks'
import { Permission } from '@/lib/constants/permissions'
import { EventType, LocationType, CreateEventData } from '@/types'

export default function CreateEventPage() {
  const router = useRouter()
  const { hasPermission, isSuperAdmin, userChapterId } = usePermissions()
  const createEventMutation = useCreateEvent()
  
  // Only fetch chapters if user is super admin
  const { data: chaptersData } = useChapters(
    { page: 1, limit: 100 }, 
    { enabled: isSuperAdmin }
  )

  const [formData, setFormData] = useState<CreateEventData>({
    title: '',
    description: '',
    type: EventType.NETWORKING,
    chapterId: userChapterId || '',
    startDate: '',
    endDate: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    location: {
      type: LocationType.PHYSICAL,
      address: '',
      city: '',
      country: '',
    },
    capacity: undefined,
    tags: [],
  })

  const [tagInput, setTagInput] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const canCreateEvent = hasPermission(Permission.CREATE_EVENT)

  if (!canCreateEvent) {
    return (
      <div className="p-6">
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <p className="text-destructive">Access denied. You don't have permission to create events.</p>
        </div>
      </div>
    )
  }

  const handleInputChange = (field: keyof CreateEventData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleLocationChange = (field: keyof CreateEventData['location'], value: string) => {
    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        [field]: value,
      },
    }))
  }

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }))
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await createEventMutation.mutateAsync(formData)
      router.push('/dashboard/events')
    } catch (error) {
      console.error('Failed to create event:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/dashboard/events"
          className="p-2 hover:bg-accent rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Create Event</h1>
          <p className="text-muted-foreground">
            Create a new event for your chapter
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-card rounded-lg border border-border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Basic Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-ring text-foreground"
                    placeholder="Enter event title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Description *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-ring text-foreground resize-none"
                    placeholder="Describe your event"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Event Type *
                    </label>
                    <select
                      required
                      value={formData.type}
                      onChange={(e) => handleInputChange('type', e.target.value as EventType)}
                      className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-ring text-foreground"
                    >
                      {Object.values(EventType).map((type) => (
                        <option key={type} value={type}>
                          {type.replace('_', ' ')}
                        </option>
                      ))}
                    </select>
                  </div>

                  {isSuperAdmin && (
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Chapter *
                      </label>
                      <select
                        required
                        value={formData.chapterId}
                        onChange={(e) => handleInputChange('chapterId', e.target.value)}
                        className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-ring text-foreground"
                      >
                        <option value="">Select Chapter</option>
                        {chaptersData?.data.map((chapter) => (
                          <option key={chapter.id} value={chapter.id}>
                            {chapter.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Date & Time */}
            <div className="bg-card rounded-lg border border-border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Date & Time
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Start Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-ring text-foreground"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    End Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-ring text-foreground"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Timezone
                </label>
                <input
                  type="text"
                  value={formData.timezone}
                  onChange={(e) => handleInputChange('timezone', e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-ring text-foreground"
                  placeholder="e.g., Africa/Lagos"
                />
              </div>
            </div>

            {/* Location */}
            <div className="bg-card rounded-lg border border-border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Location
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Location Type *
                  </label>
                  <select
                    required
                    value={formData.location.type}
                    onChange={(e) => handleLocationChange('type', e.target.value as LocationType)}
                    className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-ring text-foreground"
                  >
                    {Object.values(LocationType).map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                {formData.location.type === LocationType.PHYSICAL && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Address
                      </label>
                      <input
                        type="text"
                        value={formData.location.address || ''}
                        onChange={(e) => handleLocationChange('address', e.target.value)}
                        className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-ring text-foreground"
                        placeholder="Enter venue address"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          City
                        </label>
                        <input
                          type="text"
                          value={formData.location.city || ''}
                          onChange={(e) => handleLocationChange('city', e.target.value)}
                          className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-ring text-foreground"
                          placeholder="Enter city"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Country
                        </label>
                        <input
                          type="text"
                          value={formData.location.country || ''}
                          onChange={(e) => handleLocationChange('country', e.target.value)}
                          className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-ring text-foreground"
                          placeholder="Enter country"
                        />
                      </div>
                    </div>
                  </>
                )}

                {formData.location.type === LocationType.VIRTUAL && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Virtual Link
                      </label>
                      <input
                        type="url"
                        value={formData.location.virtualLink || ''}
                        onChange={(e) => handleLocationChange('virtualLink', e.target.value)}
                        className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-ring text-foreground"
                        placeholder="https://zoom.us/j/..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Platform
                      </label>
                      <input
                        type="text"
                        value={formData.location.virtualPlatform || ''}
                        onChange={(e) => handleLocationChange('virtualPlatform', e.target.value)}
                        className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-ring text-foreground"
                        placeholder="e.g., Zoom, Google Meet"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Capacity */}
            <div className="bg-card rounded-lg border border-border p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Capacity
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Maximum Attendees
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.capacity || ''}
                  onChange={(e) => handleInputChange('capacity', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-ring text-foreground"
                  placeholder="Leave empty for unlimited"
                />
              </div>
            </div>

            {/* Tags */}
            <div className="bg-card rounded-lg border border-border p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Tags</h3>
              
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    className="flex-1 px-3 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-ring text-foreground"
                    placeholder="Add tag"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Add
                  </button>
                </div>

                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-muted text-muted-foreground text-sm rounded"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-card rounded-lg border border-border p-6">
              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? 'Creating...' : 'Create Event'}
                </button>
                
                <Link
                  href="/dashboard/events"
                  className="block w-full px-4 py-2 text-center bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors"
                >
                  Cancel
                </Link>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}