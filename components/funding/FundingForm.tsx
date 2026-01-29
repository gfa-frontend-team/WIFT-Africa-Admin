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
import { FundingOpportunity, FundingType, ApplicationType, FundingStatus } from '@/types'
import { fundingApi } from '@/lib/api/funding'

const fundingSchema = z.object({
    name: z.string().min(3, 'Name must be at least 3 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    role: z.string().min(2, 'Target role is required'),
    fundingType: z.nativeEnum(FundingType),
    applicationType: z.nativeEnum(ApplicationType),
    applicationLink: z.string().url('Must be a valid URL').optional().or(z.literal('')),
    deadline: z.string().min(1, 'Deadline is required'),
    region: z.string().min(2, 'Region is required'),
    chapterId: z.string().optional(),
    status: z.nativeEnum(FundingStatus)
}).refine(data => {
    if (data.applicationType === ApplicationType.REDIRECT && !data.applicationLink) {
        return false
    }
    return true
}, {
    message: "Application link is required for Redirect type",
    path: ["applicationLink"]
})

type FundingFormValues = z.infer<typeof fundingSchema>

interface FundingFormProps {
    opportunity?: FundingOpportunity | null
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

export function FundingForm({ opportunity, isOpen, onClose, onSuccess }: FundingFormProps) {
    const { toast } = useToast()
    const [isLoading, setIsLoading] = useState(false)

    const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<FundingFormValues>({
        resolver: zodResolver(fundingSchema),
        defaultValues: {
            name: '',
            description: '',
            role: '',
            fundingType: FundingType.GRANT,
            applicationType: ApplicationType.REDIRECT,
            applicationLink: '',
            deadline: '',
            region: '',
            chapterId: '',
            status: FundingStatus.OPEN
        }
    })

    const applicationType = watch('applicationType')

    useEffect(() => {
        if (opportunity) {
            // Format date for input type="date"
            const formattedDeadline = opportunity.deadline ? new Date(opportunity.deadline).toISOString().split('T')[0] : ''

            reset({
                name: opportunity.name,
                description: opportunity.description,
                role: opportunity.role,
                fundingType: opportunity.fundingType,
                applicationType: opportunity.applicationType,
                applicationLink: opportunity.applicationLink || '',
                deadline: formattedDeadline,
                region: opportunity.region,
                chapterId: opportunity.chapterId || '',
                status: opportunity.status
            })
        } else {
            reset({
                name: '',
                description: '',
                role: '',
                fundingType: FundingType.GRANT,
                applicationType: ApplicationType.REDIRECT,
                applicationLink: '',
                deadline: '',
                region: '',
                chapterId: '',
                status: FundingStatus.OPEN
            })
        }
    }, [opportunity, reset, isOpen])

    const onSubmit = async (data: FundingFormValues) => {
        setIsLoading(true)
        try {
            const deadlineIso = new Date(data.deadline).toISOString()

            const formattedData = {
                ...data,
                deadline: deadlineIso
            }

            if (opportunity) {
                await fundingApi.updateOpportunity(opportunity._id, formattedData)
                toast({ title: "Success", description: "Funding opportunity updated successfully" })
            } else {
                await fundingApi.createOpportunity(formattedData)
                toast({ title: "Success", description: "Funding opportunity created successfully" })
            }
            onSuccess()
            onClose()
        } catch (error: any) {
            console.error('Failed to save opportunity:', error)
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to save oppotunity",
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
                    <DialogTitle>{opportunity ? 'Edit Funding Opportunity' : 'Create Funding Opportunity'}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Name</label>
                        <Input {...register('name')} placeholder="e.g. Film Grant 2024" />
                        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Description</label>
                        <Textarea {...register('description')} placeholder="Detailed description..." className="h-24" />
                        {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Target Role</label>
                            <Input {...register('role')} placeholder="e.g. Director" />
                            {errors.role && <p className="text-xs text-destructive">{errors.role.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Funding Type</label>
                            <NativeSelect {...register('fundingType')}>
                                <option value={FundingType.GRANT}>Grant</option>
                                <option value={FundingType.FUND}>Fund</option>
                                <option value={FundingType.LOAN}>Loan</option>
                                <option value={FundingType.OTHER}>Other</option>
                            </NativeSelect>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Application Type</label>
                            <NativeSelect {...register('applicationType')}>
                                <option value={ApplicationType.REDIRECT}>External Link (Redirect)</option>
                                <option value={ApplicationType.INTERNAL}>Internal Application</option>
                            </NativeSelect>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Status</label>
                            <NativeSelect {...register('status')}>
                                <option value={FundingStatus.OPEN}>Open</option>
                                <option value={FundingStatus.CLOSED}>Closed</option>
                            </NativeSelect>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Deadline</label>
                            <Input type="date" {...register('deadline')} />
                            {errors.deadline && <p className="text-xs text-destructive">{errors.deadline.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Region</label>
                            <Input {...register('region')} placeholder="e.g. West Africa" />
                            {errors.region && <p className="text-xs text-destructive">{errors.region.message}</p>}
                        </div>
                    </div>

                    {applicationType === ApplicationType.REDIRECT && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Application Link</label>
                            <Input {...register('applicationLink')} placeholder="https://external.com/apply" />
                            {errors.applicationLink && <p className="text-xs text-destructive">{errors.applicationLink.message}</p>}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Chapter ID (Optional)</label>
                        <Input {...register('chapterId')} placeholder="Specific Chapter ID" />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                        <Button type="submit" isLoading={isLoading}>
                            {opportunity ? 'Update' : 'Create'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
