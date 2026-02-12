import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Textarea } from '@/components/ui/Textarea'
import { CreateJobData, Job, UpdateJobData, AdminRole } from '@/types'
import { Loader2 } from 'lucide-react'
import { useCreateJob, useUpdateJob } from '@/lib/hooks/queries/useJobs'
import { useToast } from '@/components/ui/use-toast'
import { useAuthStore } from '@/lib/stores/authStore'
import { ChapterSelect } from '@/components/shared/ChapterSelect'

// Zod schema
const jobSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  description: z.string().min(10, 'Description is required'),
  role: z.string().min(2, 'Role is required'),
  location: z.string().min(2, 'Location is required'),
  isRemote: z.boolean(),
  employmentType: z.enum(['full-time', 'part-time', 'contract', 'internship', 'volunteer']),
  companyName: z.string().min(2, 'Company name is required'),
  salaryMin: z.string().optional(),
  salaryMax: z.string().optional(),
  currency: z.string().min(1, 'Currency is required'),
  applicationLink: z.string().optional().or(z.literal('')),
  chapterId: z.string().optional(),
})

type JobFormData = z.infer<typeof jobSchema>

interface JobFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  job?: Job | null // If present, edit mode
}

export function JobFormModal({ isOpen, onClose, onSuccess, job }: JobFormModalProps) {
  const { mutateAsync: createJob, isPending: isCreating } = useCreateJob()
  const { mutateAsync: updateJob, isPending: isUpdating } = useUpdateJob()
  const { toast } = useToast()
  const { admin } = useAuthStore()
  const isLoading = isCreating || isUpdating

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<JobFormData>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      isRemote: false,
      currency: 'NGN',
      employmentType: 'full-time',
      chapterId: admin?.role === AdminRole.CHAPTER_ADMIN ? (admin.chapterId || '') : ''
    }
  })

  useEffect(() => {
    if (isOpen) {
      if (job) {
        // Edit mode prepopulation
        setValue('title', job.title)
        setValue('description', job.description)
        setValue('role', job.role)
        setValue('location', job.location)
        setValue('isRemote', job.isRemote)
        setValue('employmentType', job.employmentType)
        setValue('companyName', job.companyName)
        if (job.salaryRange) {
          setValue('salaryMin', job.salaryRange.min.toString())
          setValue('salaryMax', job.salaryRange.max.toString())
          setValue('currency', job.salaryRange.currency)
        }
        setValue('applicationLink', job.applicationLink || '')
        setValue('chapterId', job.chapterId || '')
      } else {
        reset({
          title: '',
          description: '',
          role: '',
          location: '',
          isRemote: false,
          employmentType: 'full-time',
          companyName: '',
          salaryMin: '',
          salaryMax: '',
          currency: 'NGN',
          applicationLink: '',
          chapterId: admin?.role === AdminRole.CHAPTER_ADMIN ? (admin.chapterId || '') : ''
        })
      }
    }
  }, [isOpen, job, setValue, reset, admin])

  const onSubmit = async (data: JobFormData) => {
    try {
      const payload: CreateJobData = {
        title: data.title,
        description: data.description,
        role: data.role,
        location: data.location,
        isRemote: data.isRemote,
        employmentType: data.employmentType,
        companyName: data.companyName,
        applicationLink: data.applicationLink || undefined,
        chapterId: data.chapterId || undefined,
        salaryRange: (data.salaryMin && data.salaryMax) ? {
          min: Number(data.salaryMin),
          max: Number(data.salaryMax),
          currency: data.currency
        } : undefined
      }

      if (job) {
        await updateJob({ id: job.id, data: payload as UpdateJobData })
      } else {
        await createJob(payload)
      }

      onSuccess()
      onClose()
    } catch (error: any) {
      console.error('Failed to save job:', error)
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to save job details',
        variant: 'destructive'
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{job ? 'Edit Job' : 'Post a Job'}</DialogTitle>
          <DialogDescription>
            Fill in the details below to {job ? 'update the' : 'create a new'} job posting.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Job Title</Label>
              <Input id="title" {...register('title')} placeholder="e.g. Senior Frontend Engineer" />
              {errors.title && <p className="text-red-500 text-xs">{errors.title.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input id="companyName" {...register('companyName')} placeholder="e.g. Acme Corp" />
              {errors.companyName && <p className="text-red-500 text-xs">{errors.companyName.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Detailed job description..."
              className="h-32"
            />
            {errors.description && <p className="text-red-500 text-xs">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role">Role / Category</Label>
              <Input id="role" {...register('role')} placeholder="e.g. Engineering" />
              {errors.role && <p className="text-red-500 text-xs">{errors.role.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="employmentType">Employment Type</Label>
              <select
                id="employmentType"
                {...register('employmentType')}
                className="w-full px-3 py-2 border border-input rounded-md bg-transparent text-sm"
              >
                <option value="full-time">Full Time</option>
                <option value="part-time">Part Time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
                <option value="volunteer">Volunteer</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" {...register('location')} placeholder="e.g. Lagos, Nigeria" />
              {errors.location && <p className="text-red-500 text-xs">{errors.location.message}</p>}
            </div>
            <div className="flex items-center space-x-2 pt-8">
              <input
                type="checkbox"
                id="isRemote"
                {...register('isRemote')}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="isRemote">Remote Position?</Label>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Input id="currency" {...register('currency')} placeholder="NGN" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="salaryMin">Min Salary</Label>
              <Input id="salaryMin" type="number" {...register('salaryMin')} placeholder="0" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="salaryMax">Max Salary</Label>
              <Input id="salaryMax" type="number" {...register('salaryMax')} placeholder="0" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="applicationLink">External Application Link (Optional)</Label>
            <Input id="applicationLink" {...register('applicationLink')} placeholder="https://..." />
            <p className="text-xs text-muted-foreground">Leave empty if you want users to apply within the platform.</p>
            {errors.applicationLink && <p className="text-red-500 text-xs">{errors.applicationLink.message}</p>}
          </div>

          {/* Chapter Selection */}
          <div className="space-y-2">
            <Label>Post to Chapter (Optional)</Label>
            <Controller
              name="chapterId"
              control={control}
              render={({ field }) => (
                <ChapterSelect
                  value={field.value}
                  onChange={field.onChange}
                  error={undefined} // Optional field
                />
              )}
            />
            <p className="text-xs text-muted-foreground">Leave empty for Global/HQ post</p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {job ? 'Update Job' : 'Post Job'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
