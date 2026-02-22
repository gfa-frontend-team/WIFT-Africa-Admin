'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Edit, Trash2, Calendar, FileText, Video, ExternalLink, Download } from 'lucide-react'
import { useResource, useDeleteResource } from '@/lib/hooks/queries/useResources'
import { ResourceStatus, ResourceType } from '@/types'
import { format } from 'date-fns'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ResourceForm } from '@/components/resources/ResourceForm'
import { useState } from 'react'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/AlertDialog'
import { useToast } from '@/components/ui/use-toast'

export default function ResourceDetailsPage({ params }: { params: Promise<{ resourceId: string }> }) {
    const { resourceId } = use(params)
    const router = useRouter()
    const { toast } = useToast()

    const { data: resource, isLoading, error } = useResource(resourceId)
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

    const deleteMutation = useDeleteResource()

    const handleDelete = async () => {
        try {
            await deleteMutation.mutateAsync(resourceId)
            toast({ title: "Success", description: "Resource deleted successfully" })
            router.push('/dashboard/resources')
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to delete resource",
                variant: "destructive"
            })
        }
    }

    if (isLoading) return <div className="p-12 text-center text-muted-foreground">Loading resource details...</div>

    if (error || !resource) return (
        <div className="p-12 text-center">
            <p className="text-destructive mb-4">Error loading resource</p>
            <Link href="/dashboard/resources" className="text-primary hover:underline">Return to Resources</Link>
        </div>
    )

    const isVideo = resource.resourceType === ResourceType.VIDEO
    const mediaLink = resource.externalLink || resource.fileUrl

    return (
        <div className="p-6 pb-20 max-w-5xl mx-auto space-y-8">
            {/* Header & Nav */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/resources" className="p-2 hover:bg-muted rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold">{resource.title}</h1>
                            <Badge variant={resource.status === ResourceStatus.PUBLISHED ? 'success' : 'secondary'}>
                                {resource.status}
                            </Badge>
                            <Badge variant="outline" className="flex items-center gap-1">
                                {isVideo ? <Video className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                                {resource.resourceType}
                            </Badge>
                        </div>
                        <p className="text-muted-foreground text-sm mt-1">Added {format(new Date(resource.createdAt), 'MMMM d, yyyy')}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="secondary" onClick={() => setIsFormOpen(true)} className="gap-2">
                        <Edit className="w-4 h-4" /> Edit
                    </Button>
                    <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)} className="gap-2">
                        <Trash2 className="w-4 h-4" /> Delete
                    </Button>
                </div>
            </div>

            {/* Thumbnail / Cover */}
            <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-border bg-muted flex items-center justify-center">
                {resource.thumbnailUrl ? (
                    <img src={resource.thumbnailUrl} alt={resource.title} className="object-cover w-full h-full" />
                ) : (
                    <div className="text-center text-muted-foreground p-12">
                        {isVideo ? <Video className="w-16 h-16 mx-auto mb-4 opacity-20" /> : <FileText className="w-16 h-16 mx-auto mb-4 opacity-20" />}
                        <p>No thumbnail provided</p>
                    </div>
                )}

                {/* Visual Overlay Trigger if they want to quickly access it */}
                {mediaLink && (
                    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                        <a
                            href={mediaLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-primary text-primary-foreground px-6 py-3 rounded-full font-medium flex items-center gap-2 hover:bg-primary/90 transition-transform hover:scale-105"
                        >
                            {isVideo ? <ExternalLink className="w-5 h-5" /> : <Download className="w-5 h-5" />}
                            {isVideo ? 'Watch Video' : 'View Document'}
                        </a>
                    </div>
                )}
            </div>

            {/* Main Content Info */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Description Space */}
                <div className="lg:col-span-2 space-y-8">
                    <section className="bg-card border border-border rounded-lg p-6">
                        <h2 className="text-lg font-semibold mb-4">About Resource</h2>
                        <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap text-muted-foreground">
                            {resource.description || <span className="italic">No description provided.</span>}
                        </div>
                    </section>
                </div>

                {/* Sidebar Metrics/Details */}
                <div className="space-y-6">
                    <div className="bg-card border border-border rounded-lg p-6 space-y-4">
                        <h3 className="font-medium flex items-center gap-2">
                            <span className="p-1.5 bg-primary/10 text-primary rounded-md">
                                {isVideo ? <Video className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                            </span>
                            Access Link
                        </h3>
                        <div className="bg-muted p-3 rounded-md break-all text-sm">
                            {mediaLink ? (
                                <a href={mediaLink} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-2">
                                    {mediaLink} <ExternalLink className="w-3 h-3 shrink-0" />
                                </a>
                            ) : (
                                <span className="text-muted-foreground italic">No link or file available.</span>
                            )}
                        </div>
                        {resource.externalLink && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <ExternalLink className="w-3 h-3" /> Hosted externally
                            </p>
                        )}
                        {resource.fileUrl && !resource.externalLink && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Download className="w-3 h-3" /> Hosted internally
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Modals */}
            <ResourceForm
                resource={resource}
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSuccess={() => { /* Data gets invalidated by hook automatically */ }}
            />

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete "{resource.title}" and remove its assets from the servers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete Resource
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
