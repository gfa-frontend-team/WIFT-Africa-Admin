'use client'

import { useState, useEffect } from 'react'
import { Calendar, MapPin, Users, Clock, X } from 'lucide-react'
import { useChapters } from '@/lib/hooks/queries/useChapters'
import { usePermissions } from '@/lib/hooks'
import { EventType, LocationType, CreateEventData, UpdateEventData, Event } from '@/types'

interface EventFormProps {
  initialData?: Event
  onSubmit: (data: CreateEventData | UpdateEventData) => Promise<void>
  onCancel: () => void
  isSubmitting?: boolean
  mode: 'create' | 'edit'
}

export function EventForm({ initialData, onSubmit, onCancel, isSubmitting = false, mode }: EventFormProps) {
  const { isSuperAdmin, userChapterId } = usePermissions()
  
  // Only fetch chapters if user is super admin
  const { data: chaptersData } = useChapters(
    { page: 1, limit: 100 }, 
    { enabled: isSuperAdmin }
  )

  const [formData, setFormData] = useState<CreateEventData>(() => {
    if (initialData) {
      // Convert ISO dates to datetime-local format (YYYY-MM-DDTHH:mm)
      const formatDateForInput = (isoDate: string) => {
        const date = new Date(isoDate)
        return date.toISOString().slice(0, 16)
      }
      
      return {
        title: initialData.title,
        description: initialData.description,
        type: initialData.type,
        chapterId: initialData.chapterId,
        startDate: formatDateForInput(initialData.startDate),
        endDate: formatDateForInput(initialData.endDate),
        timezone: initialData.timezone,
        location: initialData.location,
        capacity: initialData.capacity,
        tags: initialData.tags,
      }
    }
    
    return {
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
    }
  })

  const [tagInput, setTagInput] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    }

    if (!formData.chapterId) {
      newErrors.chapterId = 'Chapter is required'
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required'
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required'
    }

    if (formData.startDate && formData.endDate) {
      const startDate = new Date(formData.startDate)
      const endDate = new Date(formData.endDate)
      
      if (startDate >= endDate) {
        newErrors.endDate = 'End date must be after start date'
      }

      if (startDate < new Date()) {
        newErrors.startDate = 'Start date cannot be in the past'
      }
    }

    if (formData.location.type === LocationType.VIRTUAL && !formData.location.virtualUrl) {
      newErrors.virtualUrl = 'Virtual link is required for virtual events'
    }

    if (formData.capacity && formData.capacity < 1) {
      newErrors.capacity = 'Capacity must be at least 1'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof CreateEventData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }))
    }
  }

  const handleLocationChange = (field: keyof CreateEventData['location'], value: string) => {
    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        [field]: value,
      },
    }))

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }))
    }
  }

  const addTag = () => {
    const trimmedTag = tagInput.trim()
    if (trimmedTag && !formData.tags.includes(trimmedTag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, trimmedTag],
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
    
    if (!validateForm()) {
      return
    }

    try {
      // Convert datetime-local format to ISO format
      const submitData = {
        ...formData,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
      }
      
      console.log('Submitting event data:', submitData)
      await onSubmit(submitData)
    } catch (error) {
      console.error('Form submission error:', error)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.target === e.currentTarget) {
      e.preventDefault()
      addTag()
    }
  }

  return (
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
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className={`w-full px-3 py-2 bg-background border rounded-lg focus:ring-2 focus:ring-ring focus:border-ring text-foreground ${
                    errors.title ? 'border-destructive' : 'border-input'
                  }`}
                  placeholder="Enter event title"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-destructive">{errors.title}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Description *
                </label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className={`w-full px-3 py-2 bg-background border rounded-lg focus:ring-2 focus:ring-ring focus:border-ring text-foreground resize-none ${
                    errors.description ? 'border-destructive' : 'border-input'
                  }`}
                  placeholder="Describe your event"
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-destructive">{errors.description}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Event Type *
                  </label>
                  <select
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
                      value={formData.chapterId}
                      onChange={(e) => handleInputChange('chapterId', e.target.value)}
                      className={`w-full px-3 py-2 bg-background border rounded-lg focus:ring-2 focus:ring-ring focus:border-ring text-foreground ${
                        errors.chapterId ? 'border-destructive' : 'border-input'
                      }`}
                    >
                      <option value="">Select Chapter</option>
                      {chaptersData?.data.map((chapter) => (
                        <option key={chapter.id} value={chapter.id}>
                          {chapter.name}
                        </option>
                      ))}
                    </select>
                    {errors.chapterId && (
                      <p className="mt-1 text-sm text-destructive">{errors.chapterId}</p>
                    )}
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
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  className={`w-full px-3 py-2 bg-background border rounded-lg focus:ring-2 focus:ring-ring focus:border-ring text-foreground ${
                    errors.startDate ? 'border-destructive' : 'border-input'
                  }`}
                />
                {errors.startDate && (
                  <p className="mt-1 text-sm text-destructive">{errors.startDate}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  End Date & Time *
                </label>
                <input
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                  className={`w-full px-3 py-2 bg-background border rounded-lg focus:ring-2 focus:ring-ring focus:border-ring text-foreground ${
                    errors.endDate ? 'border-destructive' : 'border-input'
                  }`}
                />
                {errors.endDate && (
                  <p className="mt-1 text-sm text-destructive">{errors.endDate}</p>
                )}
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

              {(formData.location.type === LocationType.VIRTUAL || formData.location.type === LocationType.HYBRID) && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Virtual Link {formData.location.type === LocationType.VIRTUAL ? '*' : ''}
                    </label>
                    <input
                      type="url"
                      value={formData.location.virtualUrl || ''}
                      onChange={(e) => handleLocationChange('virtualUrl', e.target.value)}
                      className={`w-full px-3 py-2 bg-background border rounded-lg focus:ring-2 focus:ring-ring focus:border-ring text-foreground ${
                        errors.virtualUrl ? 'border-destructive' : 'border-input'
                      }`}
                      placeholder="https://zoom.us/j/..."
                    />
                    {errors.virtualUrl && (
                      <p className="mt-1 text-sm text-destructive">{errors.virtualUrl}</p>
                    )}
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

              {formData.location.type === LocationType.HYBRID && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Physical Address
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
                className={`w-full px-3 py-2 bg-background border rounded-lg focus:ring-2 focus:ring-ring focus:border-ring text-foreground ${
                  errors.capacity ? 'border-destructive' : 'border-input'
                }`}
                placeholder="Leave empty for unlimited"
              />
              {errors.capacity && (
                <p className="mt-1 text-sm text-destructive">{errors.capacity}</p>
              )}
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
                  onKeyPress={handleKeyPress}
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
                        <X className="w-3 h-3" />
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
                {isSubmitting ? (mode === 'create' ? 'Creating...' : 'Updating...') : (mode === 'create' ? 'Create Event' : 'Update Event')}
              </button>
              
              <button
                type="button"
                onClick={onCancel}
                className="w-full px-4 py-2 text-center bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}