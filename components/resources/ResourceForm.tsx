import { useState, useRef, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog'
import { NativeSelect } from '@/components/ui/NativeSelect'
import { useToast } from '@/components/ui/use-toast'
import { Resource, ResourceType, ResourceStatus } from '@/types'
import { resourcesApi } from '@/lib/api/resources'
import { Upload, X, FileText, Video } from 'lucide-react'

const resourceSchema = z.object({
    title: z.string().min(3, 'Title must be at least 3 characters'),
    description: z.string().optional(),
    resourceType: z.nativeEnum(ResourceType),
    status: z.nativeEnum(ResourceStatus)
})

type ResourceFormValues = z.infer<typeof resourceSchema>

interface ResourceFormProps {
    resource?: Resource | null
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

export function ResourceForm({ resource, isOpen, onClose, onSuccess }: ResourceFormProps) {
    const { toast } = useToast()
    const [file, setFile] = useState<File | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<ResourceFormValues>({
        resolver: zodResolver(resourceSchema),
        defaultValues: {
            title: resource?.title || '',
            description: resource?.description || '',
            resourceType: resource?.resourceType || ResourceType.PDF,
            status: resource?.status || ResourceStatus.DRAFT
        }
    })

    // Reset form when modal opens/closes or resource changes
    useEffect(() => {
        if (resource) {
            reset({
                title: resource.title,
                description: resource.description || '',
                resourceType: resource.resourceType,
                status: resource.status
            })
        } else {
            reset({
                title: '',
                description: '',
                resourceType: ResourceType.PDF,
                status: ResourceStatus.DRAFT
            })
            setFile(null)
        }
    }, [resource, reset, isOpen])

    const onSubmit = async (data: ResourceFormValues) => {
        if (!resource && !file) {
            toast({
                title: "Error",
                description: "Please select a file to upload",
                variant: "destructive"
            })
            return
        }

        setIsLoading(true)
        try {
            if (resource) {
                // Update
                await resourcesApi.updateResource(resource._id, {
                    ...data,
                    file: file || undefined
                })
                toast({ title: "Success", description: "Resource updated successfully" })
            } else {
                // Create
                if (!file) return // Should be caught above
                await resourcesApi.createResource({
                    ...data,
                    file: file
                })
                toast({ title: "Success", description: "Resource created successfully" })
            }
            onSuccess()
            onClose()
        } catch (error: any) {
            console.error('Failed to save resource:', error)
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to save resource",
                variant: "destructive"
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0])
        }
    }

    const resourceType = watch('resourceType')

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{resource ? 'Edit Resource' : 'Create Resource'}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Title</label>
                        <Input {...register('title')} placeholder="Resource title" />
                        {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Description</label>
                        <Input {...register('description')} placeholder="Brief description (optional)" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Type</label>
                            <NativeSelect {...register('resourceType')}>
                                <option value={ResourceType.PDF}>PDF Document</option>
                                <option value={ResourceType.VIDEO}>Video</option>
                            </NativeSelect>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Status</label>
                            <NativeSelect {...register('status')}>
                                <option value={ResourceStatus.DRAFT}>Draft</option>
                                <option value={ResourceStatus.PUBLISHED}>Published</option>
                            </NativeSelect>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">File</label>
                        <div
                            className="border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-accent/50 transition-colors"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                onChange={handleFileChange}
                                accept={resourceType === ResourceType.VIDEO ? "video/*" : "application/pdf"}
                            />

                            {file ? (
                                <div className="flex items-center gap-2 text-primary">
                                    {resourceType === ResourceType.VIDEO ? <Video className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                                    <span className="text-sm font-medium truncate max-w-[200px]">{file.name}</span>
                                    <Button type="button" variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={(e) => { e.stopPropagation(); setFile(null); }}>
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                                    <p className="text-sm text-muted-foreground text-center">
                                        Click to upload {resourceType === ResourceType.VIDEO ? 'video' : 'PDF'}
                                    </p>
                                    {resource && <p className="text-xs text-muted-foreground mt-1">(Leave empty to keep existing file)</p>}
                                </>
                            )}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                        <Button type="submit" isLoading={isLoading}>
                            {resource ? 'Update Resource' : 'Create Resource'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
