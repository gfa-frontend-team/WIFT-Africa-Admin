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
import { Upload, X, FileText, Video, ImageIcon, Link as LinkIcon } from 'lucide-react'

const resourceSchema = z.object({
    title: z.string().min(3, 'Title must be at least 3 characters'),
    description: z.string().optional(),
    resourceType: z.nativeEnum(ResourceType),
    status: z.nativeEnum(ResourceStatus),
    externalLink: z.string().url('Must be a valid URL').optional().or(z.literal(''))
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
    const [thumbnail, setThumbnail] = useState<File | null>(null)
    const [uploadMethod, setUploadMethod] = useState<'file' | 'link'>('file')
    const [isLoading, setIsLoading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const thumbnailInputRef = useRef<HTMLInputElement>(null)

    const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<ResourceFormValues>({
        resolver: zodResolver(resourceSchema),
        defaultValues: {
            title: resource?.title || '',
            description: resource?.description || '',
            resourceType: resource?.resourceType || ResourceType.PDF,
            status: resource?.status || ResourceStatus.DRAFT,
            externalLink: resource?.externalLink || ''
        }
    })

    // Reset form when modal opens/closes or resource changes
    useEffect(() => {
        if (resource) {
            reset({
                title: resource.title,
                description: resource.description || '',
                resourceType: resource.resourceType,
                status: resource.status,
                externalLink: resource.externalLink || ''
            })
            setUploadMethod(resource.externalLink ? 'link' : 'file')
            setFile(null)
            setThumbnail(null)
        } else {
            reset({
                title: '',
                description: '',
                resourceType: ResourceType.PDF,
                status: ResourceStatus.DRAFT,
                externalLink: ''
            })
            setUploadMethod('file')
            setFile(null)
            setThumbnail(null)
        }
    }, [resource, reset, isOpen])

    const onSubmit = async (data: ResourceFormValues) => {
        if (!resource && uploadMethod === 'file' && !file) {
            toast({
                title: "Error",
                description: "Please select a file to upload or link to an external source.",
                variant: "destructive"
            })
            return
        }

        if (uploadMethod === 'link' && !data.externalLink) {
            toast({
                title: "Error",
                description: "Please provide a valid external URL.",
                variant: "destructive"
            })
            return
        }

        setIsLoading(true)
        try {
            const payloadData = {
                ...data,
                externalLink: uploadMethod === 'link' ? data.externalLink : undefined,
                file: uploadMethod === 'file' ? (file || undefined) : undefined,
                thumbnail: thumbnail || undefined
            }

            if (resource) {
                // Update
                await resourcesApi.updateResource(resource._id, payloadData)
                toast({ title: "Success", description: "Resource updated successfully" })
            } else {
                // Create
                await resourcesApi.createResource(payloadData as any)
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

    const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setThumbnail(e.target.files[0])
        }
    }

    const resourceType = watch('resourceType')

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{resource ? 'Edit Resource' : 'Create Resource'}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-4">
                    <div className="space-y-4">
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
                    </div>

                    <div className="space-y-4 pt-4 border-t border-border">
                        <h3 className="font-semibold text-sm">Media Source</h3>

                        <div className="flex gap-4 mb-4">
                            <label className="flex items-center gap-2 text-sm cursor-pointer">
                                <input
                                    type="radio"
                                    name="uploadMethod"
                                    value="file"
                                    checked={uploadMethod === 'file'}
                                    onChange={() => setUploadMethod('file')}
                                    className="accent-primary"
                                />
                                Upload File
                            </label>
                            <label className="flex items-center gap-2 text-sm cursor-pointer">
                                <input
                                    type="radio"
                                    name="uploadMethod"
                                    value="link"
                                    checked={uploadMethod === 'link'}
                                    onChange={() => setUploadMethod('link')}
                                    className="accent-primary"
                                />
                                External Link
                            </label>
                        </div>

                        {uploadMethod === 'link' ? (
                            <div className="space-y-2">
                                <label className="text-sm font-medium">External URL</label>
                                <div className="relative">
                                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input {...register('externalLink')} placeholder="https://youtube.com/..." className="pl-9" />
                                </div>
                                {errors.externalLink && <p className="text-xs text-destructive">{errors.externalLink.message}</p>}
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <label className="text-sm font-medium">File Upload</label>
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
                                            {resourceType === ResourceType.VIDEO ? <Video className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                                            <span className="text-sm font-medium truncate max-w-[200px]">{file.name}</span>
                                            <Button type="button" variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={(e) => { e.stopPropagation(); setFile(null); }}>
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <>
                                            <Upload className="w-6 h-6 text-muted-foreground mb-2" />
                                            <p className="text-sm text-muted-foreground text-center">
                                                Click to upload {resourceType === ResourceType.VIDEO ? 'video' : 'PDF'}
                                            </p>
                                            {resource && !resource.externalLink && <p className="text-xs text-muted-foreground mt-1">(Leave empty to keep existing file)</p>}
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-4 pt-4 border-t border-border">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Thumbnail Image (Optional)</label>
                            <div
                                className="border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-accent/50 transition-colors"
                                onClick={() => thumbnailInputRef.current?.click()}
                            >
                                <input
                                    type="file"
                                    ref={thumbnailInputRef}
                                    className="hidden"
                                    onChange={handleThumbnailChange}
                                    accept="image/*"
                                />

                                {thumbnail ? (
                                    <div className="flex items-center gap-2 text-primary">
                                        <ImageIcon className="w-5 h-5" />
                                        <span className="text-sm font-medium truncate max-w-[200px]">{thumbnail.name}</span>
                                        <Button type="button" variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={(e) => { e.stopPropagation(); setThumbnail(null); }}>
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ) : (
                                    <>
                                        <ImageIcon className="w-6 h-6 text-muted-foreground mb-2" />
                                        <p className="text-sm text-muted-foreground text-center">
                                            Click to upload a cover image
                                        </p>
                                        {resource?.thumbnailUrl && <p className="text-xs text-muted-foreground mt-1">(Leave empty to keep existing thumbnail)</p>}
                                    </>
                                )}
                            </div>
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
