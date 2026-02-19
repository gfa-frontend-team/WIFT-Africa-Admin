'use client'

import { useState } from 'react'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Calendar, MapPin, Loader2, X, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

import { eventSchema, EventFormValues } from '@/lib/validations/events'
import { FileUpload } from '@/components/ui/FileUpload'

import { EventStatus, EventType, LocationType, CreateEventData, UpdateEventData } from '@/types'
import { useChapters } from '@/lib/hooks/queries/useChapters'
import { usePermissions } from '@/lib/hooks/usePermissions'

interface EventFormProps {
  initialData?: Partial<EventFormValues>
  onSubmit: (data: CreateEventData | UpdateEventData) => Promise<void>
  isSubmitting?: boolean
  mode: 'create' | 'edit'
}

export function EventForm({ initialData, onSubmit, isSubmitting, mode }: EventFormProps) {
  const { isSuperAdmin, userChapterId } = usePermissions()

  // Only fetch chapters if Super Admin
  const { data: chaptersData } = useChapters(
    { page: 1, limit: 100 },
    { enabled: isSuperAdmin }
  )

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors }
  } = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema) as any,
    defaultValues: {
      status: EventStatus.DRAFT,
      type: EventType.WORKSHOP,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      tags: [],
      location: {
        type: LocationType.PHYSICAL,
      },
      ...initialData,
      // Pre-fill chapterId for Chapter Admin if not provided
      chapterId: initialData?.chapterId || (!isSuperAdmin ? (userChapterId || '') : ''),
    }
  })

  // Watch location type to conditionally show fields
  const locationType = watch('location.type')
  const [tagInput, setTagInput] = useState('')

  const handleAddTag = (e: React.KeyboardEvent | React.MouseEvent) => {
    if (e.type === 'keydown' && (e as React.KeyboardEvent).key !== 'Enter') return
    e.preventDefault()

    const val = tagInput.trim()
    if (!val) return

    const currentTags = watch('tags')
    if (!currentTags.includes(val)) {
      setValue('tags', [...currentTags, val])
    }
    setTagInput('')
  }

  const removeTag = (tagToRemove: string) => {
    const currentTags = watch('tags')
    setValue('tags', currentTags.filter(t => t !== tagToRemove))
  }

  return (
    <form onSubmit={handleSubmit((data) => {
      // Ensure capacity is undefined if null (or NaN if that happens) to match API types
      const cleanData = {
        ...data,
        capacity: (data.capacity === null || Number.isNaN(data.capacity)) ? undefined : data.capacity,
        // Ensure chapterId is set for Chapter Admins
        chapterId: (!isSuperAdmin ? userChapterId : data.chapterId) || undefined,
        // Transform dates to strict ISO string for backend
        startDate: new Date(data.startDate).toISOString(),
        endDate: new Date(data.endDate).toISOString(),
      }
      return onSubmit(cleanData)
    })} className="space-y-8 max-w-5xl mx-auto pb-20">

      {/* 1. Basic Information */}
      <div className="bg-card border border-border rounded-lg p-6 space-y-6">
        <h2 className="text-xl font-semibold border-b border-border pb-2">Basic Information</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2 col-span-2">
            <label className="text-sm font-medium">Event Title <span className="text-destructive">*</span></label>
            <input
              {...register('title')}
              className="w-full px-3 py-2 bg-background border border-input rounded-md focus:ring-2 focus:ring-ring"
              placeholder="e.g. Annual Film Gala"
            />
            {errors.title && <p className="text-destructive text-xs">{errors.title.message}</p>}
          </div>

          <div className="space-y-2 col-span-2">
            <label className="text-sm font-medium">Description <span className="text-destructive">*</span></label>
            <textarea
              {...register('description')}
              rows={5}
              className="w-full px-3 py-2 bg-background border border-input rounded-md focus:ring-2 focus:ring-ring resize-y"
              placeholder="Detailed description of the event..."
            />
            {errors.description && <p className="text-destructive text-xs">{errors.description.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Event Type <span className="text-destructive">*</span></label>
            <select
              {...register('type')}
              className="w-full px-3 py-2 bg-background border border-input rounded-md"
            >
              {Object.values(EventType).map((t: string) => (
                <option key={t} value={t}>{t.replace('_', ' ')}</option>
              ))}
            </select>
            {errors.type && <p className="text-destructive text-xs">{errors.type.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Chapter {isSuperAdmin ? '(Optional - Leave empty for Global)' : '(Locked)'}</label>
            <select
              {...register('chapterId')}
              disabled={!isSuperAdmin}
              className="w-full px-3 py-2 bg-background border border-input rounded-md disabled:opacity-50 disabled:bg-muted"
            >
              {isSuperAdmin ? (
                <>
                  <option value="">Global Event</option>
                  {chaptersData?.data?.map(chapter => (
                    <option key={chapter.id} value={chapter.id}>{chapter.name}</option>
                  ))}
                </>
              ) : (
                // For Chapter Admin, we can't show "Previous Global" etc, just show "My Chapter" context implicitly
                // Since we don't have the chapter NAME loaded (permissions only gives ID), 
                // we'll just show a generic "My Chapter" or empty option that submits the ID.
                // Actually, if we disable it, the value is what matters.
                <option value={userChapterId || ''}>My Chapter</option>
              )}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <select
              {...register('status')}
              className="w-full px-3 py-2 bg-background border border-input rounded-md"
            >
              {Object.values(EventStatus).map((s: string) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Cover Image</label>
            <Controller
              name="coverImage"
              control={control}
              render={({ field }) => (
                <FileUpload
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.coverImage?.message}
                  label=""
                />
              )}
            />
          </div>
        </div>
      </div>

      {/* 2. Date & Time */}
      <div className="bg-card border border-border rounded-lg p-6 space-y-6">
        <div className="flex items-center gap-2 border-b border-border pb-2">
          <Calendar className="w-5 h-5 text-muted-foreground" />
          <h2 className="text-xl font-semibold">Date & Time</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Start Date & Time <span className="text-destructive">*</span></label>
            <input
              type="datetime-local"
              {...register('startDate')}
              className="w-full px-3 py-2 bg-background border border-input rounded-md"
            />
            {errors.startDate && <p className="text-destructive text-xs">{errors.startDate.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">End Date & Time <span className="text-destructive">*</span></label>
            <input
              type="datetime-local"
              {...register('endDate')}
              className="w-full px-3 py-2 bg-background border border-input rounded-md"
            />
            {errors.endDate && <p className="text-destructive text-xs">{errors.endDate.message}</p>}
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">Timezone <span className="text-destructive">*</span></label>
            <input
              {...register('timezone')}
              className="w-full px-3 py-2 bg-background border border-input rounded-md"
            />
            {errors.timezone && <p className="text-destructive text-xs">{errors.timezone.message}</p>}
          </div>
        </div>
      </div>

      {/* 3. Location */}
      <div className="bg-card border border-border rounded-lg p-6 space-y-6">
        <div className="flex items-center gap-2 border-b border-border pb-2">
          <MapPin className="w-5 h-5 text-muted-foreground" />
          <h2 className="text-xl font-semibold">Location</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">Location Type <span className="text-destructive">*</span></label>
            <select
              {...register('location.type')}
              className="w-full px-3 py-2 bg-background border border-input rounded-md"
            >
              {Object.values(LocationType).map((t: string) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {(locationType === LocationType.PHYSICAL || locationType === LocationType.HYBRID) && (
            <>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Address <span className="text-destructive">*</span></label>
                <input {...register('location.address')} className="w-full px-3 py-2 bg-background border border-input rounded-md" placeholder="Street address" />
                {errors.location?.address && <p className="text-destructive text-xs">{errors.location.address.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">City <span className="text-destructive">*</span></label>
                <input {...register('location.city')} className="w-full px-3 py-2 bg-background border border-input rounded-md" />
                {errors.location?.city && <p className="text-destructive text-xs">{errors.location.city.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Country <span className="text-destructive">*</span></label>
                <input {...register('location.country')} className="w-full px-3 py-2 bg-background border border-input rounded-md" />
                {errors.location?.country && <p className="text-destructive text-xs">{errors.location.country.message}</p>}
              </div>
            </>
          )}

          {(locationType === LocationType.VIRTUAL || locationType === LocationType.HYBRID) && (
            <>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Virtual URL <span className="text-destructive">*</span></label>
                <input {...register('location.virtualUrl')} className="w-full px-3 py-2 bg-background border border-input rounded-md" placeholder="https://zoom.us/..." />
                {errors.location?.virtualUrl && <p className="text-destructive text-xs">{errors.location.virtualUrl.message}</p>}
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Platform</label>
                <input {...register('location.virtualPlatform')} className="w-full px-3 py-2 bg-background border border-input rounded-md" placeholder="Zoom, Google Meet, etc." />
              </div>
            </>
          )}
        </div>
      </div>

      {/* 4. Capacity & Tags */}
      <div className="bg-card border border-border rounded-lg p-6 space-y-6">
        <h2 className="text-xl font-semibold border-b border-border pb-2">Additional Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Capacity (Optional)</label>
            <input
              type="number"
              {...register('capacity', { valueAsNumber: true })}
              className="w-full px-3 py-2 bg-background border border-input rounded-md"
              placeholder="Leave empty for unlimited"
            />
            {errors.capacity && <p className="text-destructive text-xs">{errors.capacity.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Tags</label>
            <div className="flex gap-2">
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                className="flex-1 px-3 py-2 bg-background border border-input rounded-md"
                placeholder="Type and press Enter"
              />
              <button type="button" onClick={handleAddTag} className="px-3 py-2 bg-secondary rounded-md" ><Plus className="w-4 h-4" /></button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {watch('tags').map(tag => (
                <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 bg-muted rounded text-sm">
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)} className="text-muted-foreground hover:text-foreground"><X className="w-3 h-3" /></button>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border flex justify-end gap-3 z-10 md:pl-72">
        <Link href="/dashboard/events" className="px-4 py-2 border rounded-md hover:bg-muted font-medium">Cancel</Link>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 font-medium disabled:opacity-50 inline-flex items-center gap-2"
        >
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {mode === 'create' ? 'Create Event' : 'Save Changes'}
        </button>
      </div>

    </form>
  )
}
