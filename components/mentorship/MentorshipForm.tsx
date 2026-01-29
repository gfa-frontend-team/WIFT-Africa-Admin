import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog'
import { NativeSelect } from '@/components/ui/NativeSelect'
import { useToast } from '@/components/ui/use-toast'
import { Mentorship, MentorshipFormat, MentorshipStatus } from '@/types'
import { mentorshipApi } from '@/lib/api/mentorship'

const mentorshipSchema = z.object({
    mentorName: z.string().min(2, 'Mentor name is required'),
    mentorRole: z.string().min(2, 'Mentor role is required'),
    areasOfExpertise: z.string().min(3, 'Areas of expertise are required (comma separated)'),
    mentorshipFormat: z.nativeEnum(MentorshipFormat),
    availability: z.string().min(2, 'Availability is required'),
    duration: z.string().min(2, 'Duration is required'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    eligibility: z.string().min(5, 'Eligibility criteria is required'),
    status: z.nativeEnum(MentorshipStatus),
    chapterId: z.string().optional()
})

type MentorshipFormValues = z.infer<typeof mentorshipSchema>

interface MentorshipFormProps {
    mentorship?: Mentorship | null
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

export function MentorshipForm({ mentorship, isOpen, onClose, onSuccess }: MentorshipFormProps) {
    const { toast } = useToast()
    const [isLoading, setIsLoading] = useState(false)

    const { register, handleSubmit, reset, formState: { errors }, setValue } = useForm<MentorshipFormValues>({
        resolver: zodResolver(mentorshipSchema),
        defaultValues: {
            mentorName: '',
            mentorRole: '',
            areasOfExpertise: '',
            mentorshipFormat: MentorshipFormat.VIRTUAL,
            availability: '',
            duration: '',
            description: '',
            eligibility: '',
            status: MentorshipStatus.OPEN,
            chapterId: ''
        }
    })

    useEffect(() => {
        if (mentorship) {
            reset({
                mentorName: mentorship.mentorName,
                mentorRole: mentorship.mentorRole,
                areasOfExpertise: mentorship.areasOfExpertise.join(', '),
                mentorshipFormat: mentorship.mentorshipFormat,
                availability: mentorship.availability,
                duration: mentorship.duration,
                description: mentorship.description,
                eligibility: mentorship.eligibility,
                status: mentorship.status,
                chapterId: mentorship.chapterId || ''
            })
        } else {
            reset({
                mentorName: '',
                mentorRole: '',
                areasOfExpertise: '',
                mentorshipFormat: MentorshipFormat.VIRTUAL,
                availability: '',
                duration: '',
                description: '',
                eligibility: '',
                status: MentorshipStatus.OPEN,
                chapterId: ''
            })
        }
    }, [mentorship, reset, isOpen])

    const onSubmit = async (data: MentorshipFormValues) => {
        setIsLoading(true)
        try {
            // Convert comma separated string to array
            const formattedData = {
                ...data,
                areasOfExpertise: data.areasOfExpertise.split(',').map(s => s.trim()).filter(Boolean)
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
            console.error('Failed to save mentorship:', error)
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to save mentorship",
                variant: "destructive"
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{mentorship ? 'Edit Mentorship' : 'Create Mentorship'}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Mentor Name</label>
                            <Input {...register('mentorName')} placeholder="e.g. John Doe" />
                            {errors.mentorName && <p className="text-xs text-destructive">{errors.mentorName.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Role</label>
                            <Input {...register('mentorRole')} placeholder="e.g. Director" />
                            {errors.mentorRole && <p className="text-xs text-destructive">{errors.mentorRole.message}</p>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Areas of Expertise</label>
                        <Input {...register('areasOfExpertise')} placeholder="e.g. Scripting, Directing (comma separated)" />
                        {errors.areasOfExpertise && <p className="text-xs text-destructive">{errors.areasOfExpertise.message}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Format</label>
                            <NativeSelect {...register('mentorshipFormat')}>
                                <option value={MentorshipFormat.VIRTUAL}>Virtual</option>
                                <option value={MentorshipFormat.PHYSICAL}>Physical</option>
                                <option value={MentorshipFormat.HYBRID}>Hybrid</option>
                            </NativeSelect>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Status</label>
                            <NativeSelect {...register('status')}>
                                <option value={MentorshipStatus.OPEN}>Open</option>
                                <option value={MentorshipStatus.CLOSED}>Closed</option>
                            </NativeSelect>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Availability</label>
                            <Input {...register('availability')} placeholder="e.g. Weekly" />
                            {errors.availability && <p className="text-xs text-destructive">{errors.availability.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Duration</label>
                            <Input {...register('duration')} placeholder="e.g. 3 months" />
                            {errors.duration && <p className="text-xs text-destructive">{errors.duration.message}</p>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Eligibility</label>
                        <Input {...register('eligibility')} placeholder="e.g. Must have 1 short film credit" />
                        {errors.eligibility && <p className="text-xs text-destructive">{errors.eligibility.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Description</label>
                        <Textarea {...register('description')} placeholder="Detailed description of the mentorship..." className="h-24" />
                        {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Chapter ID (Optional)</label>
                        <Input {...register('chapterId')} placeholder="Specific Chapter ID" />
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
