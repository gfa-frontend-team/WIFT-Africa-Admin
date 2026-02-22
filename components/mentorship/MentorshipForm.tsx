import { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog'
import { NativeSelect } from '@/components/ui/NativeSelect'
import { useToast } from '@/components/ui/use-toast'
import { ChapterSelect } from '@/components/shared/ChapterSelect'
import { DaysCheckboxGroup } from '@/components/shared/DaysCheckboxGroup'
import { Mentorship, MentorshipFormat, MentorshipStatus, DayOfWeek } from '@/types/mentorship'
import { mentorshipApi } from '@/lib/api/mentorship'
import { TimezoneSelect } from '@/components/ui/TimezoneSelect'
import { formatInTimeZone, fromZonedTime } from 'date-fns-tz'
import { useChapters } from '@/lib/hooks/queries/useChapters'
import { useAuthStore } from '@/lib/stores/authStore'
import { AdminRole, AccountType } from '@/types'

const mentorshipSchema = z.object({
    mentorName: z.string().min(1, 'Mentor name is required').max(200, 'Mentor name must be less than 200 characters'),
    mentorRole: z.string().min(1, 'Mentor role is required').max(100, 'Mentor role must be less than 100 characters'),
    areasOfExpertise: z.string().min(3, 'Areas of expertise are required (comma separated)'),
    mentorshipFormat: z.nativeEnum(MentorshipFormat),

    // NEW SCHEDULE FIELDS
    startPeriod: z.string().min(1, 'Start date is required'),
    endPeriod: z.string().min(1, 'End date is required'),
    days: z.array(z.nativeEnum(DayOfWeek)).min(1, 'Please select at least one day'),
    timeFrame: z.string().min(1, 'Time frame is required (e.g., "12:30pm - 3:00pm")'),
    timezone: z.string().min(1, 'Timezone is required'),

    // OPTIONAL FIELDS
    mentorshipLink: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
    description: z.string().min(10, 'Description must be at least 10 characters')
        .refine((val) => (val.trim().split(/\s+/).filter(Boolean).length) <= 500, {
            message: "Description cannot exceed 500 words",
        }),
    eligibility: z.string().max(500, 'Eligibility must be less than 500 characters').optional(),

    // METADATA
    status: z.nativeEnum(MentorshipStatus),
    chapterId: z.string().optional()
}).refine(
    (data) => {
        const start = new Date(data.startPeriod)
        const now = new Date()
        return start > now
    },
    {
        message: 'Start date must be in the future',
        path: ['startPeriod']
    }
).refine(
    (data) => {
        const start = new Date(data.startPeriod)
        const end = new Date(data.endPeriod)
        return end > start
    },
    {
        message: 'End date must be after start date',
        path: ['endPeriod']
    }
).refine(
    (data) => {
        // Meeting link required for Virtual and Hybrid
        if (data.mentorshipFormat !== MentorshipFormat.PHYSICAL && !data.mentorshipLink) {
            return false
        }
        return true
    },
    {
        message: 'Meeting link is required for Virtual and Hybrid mentorships',
        path: ['mentorshipLink']
    }
)

type MentorshipFormValues = z.infer<typeof mentorshipSchema>

interface MentorshipFormProps {
    mentorship?: Mentorship | null
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

export function MentorshipForm({ mentorship, isOpen, onClose, onSuccess }: MentorshipFormProps) {
    const { toast } = useToast()
    const { admin } = useAuthStore() // Changed user to admin
    const [isLoading, setIsLoading] = useState(false)
    const { data: chaptersData } = useChapters({ isActive: true })

    const { register, handleSubmit, reset, control, watch, formState: { errors }, setValue } = useForm<MentorshipFormValues>({
        resolver: zodResolver(mentorshipSchema),
        defaultValues: {
            mentorName: '',
            mentorRole: '',
            areasOfExpertise: '',
            mentorshipFormat: MentorshipFormat.VIRTUAL,
            startPeriod: '',
            endPeriod: '',
            days: [],
            timeFrame: '',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            mentorshipLink: '',
            description: '',
            eligibility: '',
            status: MentorshipStatus.OPEN,
            chapterId: admin?.role === AdminRole.CHAPTER_ADMIN ? (admin.chapterId || '') : ''
        }
    })

    const selectedFormat = watch('mentorshipFormat')
    const descriptionText = watch('description') || ''
    const descriptionWords = descriptionText.trim() === '' ? 0 : descriptionText.trim().split(/\s+/).length

    useEffect(() => {
        if (mentorship) {
            const defaultTimezone = mentorship.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
            // Convert ISO dates to YYYY-MM-DD format for date inputs
            const startDate = mentorship.startPeriod ? formatInTimeZone(new Date(mentorship.startPeriod), defaultTimezone, 'yyyy-MM-dd') : ''
            const endDate = mentorship.endPeriod ? formatInTimeZone(new Date(mentorship.endPeriod), defaultTimezone, 'yyyy-MM-dd') : ''

            reset({
                mentorName: mentorship.mentorName,
                mentorRole: mentorship.mentorRole,
                areasOfExpertise: mentorship.areasOfExpertise.join(', '),
                mentorshipFormat: mentorship.mentorshipFormat,
                startPeriod: startDate,
                endPeriod: endDate,
                days: mentorship.days,
                timeFrame: mentorship.timeFrame,
                timezone: defaultTimezone,
                mentorshipLink: mentorship.mentorshipLink || '',
                description: mentorship.description,
                eligibility: mentorship.eligibility || '',
                status: mentorship.status,
                chapterId: mentorship.chapterId || ''
            })
        } else {
            reset({
                mentorName: '',
                mentorRole: '',
                areasOfExpertise: '',
                mentorshipFormat: MentorshipFormat.VIRTUAL,
                startPeriod: '',
                endPeriod: '',
                days: [],
                timeFrame: '',
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                mentorshipLink: '',
                description: '',
                eligibility: '',
                status: MentorshipStatus.OPEN,
                chapterId: admin?.role === AdminRole.CHAPTER_ADMIN ? (admin.chapterId || '') : ''
            })
        }
    }, [mentorship, reset, isOpen, admin])

    // Auto-fill timezone based on chapter
    const selectedChapterId = watch('chapterId');
    useEffect(() => {
        if (selectedChapterId && chaptersData?.data) {
            const chapter = chaptersData.data.find(c => c.id === selectedChapterId);
            if (chapter && chapter.timezone) {
                setValue('timezone', chapter.timezone, { shouldDirty: true });
            }
        }
    }, [selectedChapterId, chaptersData, setValue]);

    const onSubmit = async (data: MentorshipFormValues) => {
        setIsLoading(true)
        try {
            // Convert date inputs to ISO strings using selected timezone
            const startPeriodISO = fromZonedTime(data.startPeriod, data.timezone).toISOString()
            const endPeriodISO = fromZonedTime(data.endPeriod, data.timezone).toISOString()

            // Convert comma separated string to array
            const formattedData = {
                ...data,
                areasOfExpertise: data.areasOfExpertise.split(',').map(s => s.trim()).filter(Boolean),
                startPeriod: startPeriodISO,
                endPeriod: endPeriodISO,
                mentorshipLink: data.mentorshipLink || undefined,
                eligibility: data.eligibility || undefined,
                chapterId: data.chapterId || undefined
            }

            if (mentorship) {
                await mentorshipApi.updateMentorship(mentorship._id, formattedData)
                toast({ title: "Success", description: "Mentorship updated successfully" })
            } else {
                await mentorshipApi.createMentorship(formattedData)
                toast({ title: "Success", description: "Mentorship created successfully" })
            }
            onSuccess()
            onClose()
        } catch (error: any) {
            console.error('Failed to save mentorship:', {
                status: error.response?.status,
                statusText: error.response?.statusText,
                error: error.response?.data?.error,
                message: error.response?.data?.message,
                data: error.response?.data,
                fullError: error
            })

            const errorMessage = error.response?.data?.error ||
                error.response?.data?.message ||
                "Failed to save mentorship"

            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive"
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{mentorship ? 'Edit Mentorship' : 'Create Mentorship'}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Mentor Information Section */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-foreground/80">Mentor Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Mentor Name *</label>
                                <Input {...register('mentorName')} placeholder="e.g. Jane Doe" />
                                {errors.mentorName && <p className="text-xs text-destructive">{errors.mentorName.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Mentor Role *</label>
                                <Input {...register('mentorRole')} placeholder="e.g. Award-Winning Director" />
                                {errors.mentorRole && <p className="text-xs text-destructive">{errors.mentorRole.message}</p>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Areas of Expertise *</label>
                            <Input {...register('areasOfExpertise')} placeholder="e.g. Script Development, Career Growth, Networking (comma separated)" />
                            {errors.areasOfExpertise && <p className="text-xs text-destructive">{errors.areasOfExpertise.message}</p>}
                        </div>
                    </div>

                    {/* Format & Schedule Section */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-foreground/80">Format & Schedule</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Format *</label>
                                <NativeSelect {...register('mentorshipFormat')}>
                                    <option value={MentorshipFormat.VIRTUAL}>Virtual</option>
                                    <option value={MentorshipFormat.PHYSICAL}>Physical</option>
                                    <option value={MentorshipFormat.HYBRID}>Hybrid</option>
                                </NativeSelect>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Status *</label>
                                <NativeSelect {...register('status')}>
                                    <option value={MentorshipStatus.OPEN}>Open</option>
                                    <option value={MentorshipStatus.CLOSED}>Closed</option>
                                </NativeSelect>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Start Date *</label>
                                <Input type="date" {...register('startPeriod')} />
                                {errors.startPeriod && <p className="text-xs text-destructive">{errors.startPeriod.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">End Date *</label>
                                <Input type="date" {...register('endPeriod')} />
                                {errors.endPeriod && <p className="text-xs text-destructive">{errors.endPeriod.message}</p>}
                            </div>
                        </div>

                        <Controller
                            name="days"
                            control={control}
                            render={({ field }) => (
                                <DaysCheckboxGroup
                                    value={field.value}
                                    onChange={field.onChange}
                                    error={errors.days?.message}
                                />
                            )}
                        />

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Time Frame *</label>
                            <Input {...register('timeFrame')} placeholder="e.g. 12:30pm - 3:00pm" />
                            {errors.timeFrame && <p className="text-xs text-destructive">{errors.timeFrame.message}</p>}
                            <p className="text-xs text-muted-foreground">Specify the time range for sessions</p>
                        </div>

                        <div className="space-y-2">
                            <TimezoneSelect
                                label="Timezone *"
                                {...register('timezone')}
                                error={errors.timezone?.message}
                            />
                        </div>

                        {(selectedFormat === MentorshipFormat.VIRTUAL || selectedFormat === MentorshipFormat.HYBRID) && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Meeting Link *</label>
                                <Input {...register('mentorshipLink')} placeholder="https://zoom.us/j/123456789" type="url" />
                                {errors.mentorshipLink && <p className="text-xs text-destructive">{errors.mentorshipLink.message}</p>}
                                <p className="text-xs text-muted-foreground">Required for Virtual and Hybrid formats</p>
                            </div>
                        )}
                    </div>

                    {/* Details Section */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-foreground/80">Details</h3>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium">Description *</label>
                                <span className={`text-xs ${descriptionWords > 500 ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
                                    {descriptionWords}/500 words
                                </span>
                            </div>
                            <Textarea {...register('description')} placeholder="Detailed description of the mentorship program..." className="h-24" />
                            {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Eligibility (Optional)</label>
                            <Textarea {...register('eligibility')} placeholder="e.g. Open to all WIFT Africa members with at least 1 year of experience in screenwriting" className="h-20" />
                            {errors.eligibility && <p className="text-xs text-destructive">{errors.eligibility.message}</p>}
                        </div>
                    </div>

                    {/* Settings Section */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-foreground/80">Settings</h3>
                        <Controller
                            name="chapterId"
                            control={control}
                            render={({ field }) => (
                                <ChapterSelect
                                    value={field.value}
                                    onChange={field.onChange}
                                    error={errors.chapterId?.message}
                                />
                            )}
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                        <Button type="submit" isLoading={isLoading}>
                            {mentorship ? 'Update Mentorship' : 'Create Mentorship'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
