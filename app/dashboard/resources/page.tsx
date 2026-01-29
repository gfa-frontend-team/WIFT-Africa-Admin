'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { resourcesApi } from '@/lib/api/resources'
import { Resource, ResourceType, ResourceStatus } from '@/types'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Loader2, Plus, Search, FileText, Video, MoreVertical, Edit, Trash2, ExternalLink } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import { useDebounce } from '@/lib/hooks/useDebounce'
import { format } from 'date-fns'
import { ResourceForm } from '@/components/resources/ResourceForm'
import { useToast } from '@/components/ui/use-toast'
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
import { RoleGuard } from '@/lib/guards/RoleGuard'
import { Permission } from '@/lib/constants/permissions'

export default function ResourcesPage() {
    const [page, setPage] = useState(1)
    const [search, setSearch] = useState('')
    const debouncedSearch = useDebounce(search, 500)
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [selectedResource, setSelectedResource] = useState<Resource | null>(null)
    const [resourceToDelete, setResourceToDelete] = useState<Resource | null>(null)

    const queryClient = useQueryClient()
    const { toast } = useToast()

    // Fetch Resources
    const { data, isLoading } = useQuery({
        queryKey: ['resources', page, debouncedSearch],
        queryFn: () => resourcesApi.getAllResources({
            page,
            limit: 10,
            search: debouncedSearch
        })
    })

    // Delete Mutation
    const deleteMutation = useMutation({
        mutationFn: (id: string) => resourcesApi.deleteResource(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['resources'] })
            toast({ title: "Success", description: "Resource deleted successfully" })
            setResourceToDelete(null)
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: error.message || "Failed to delete resource",
                variant: "destructive"
            })
        }
    })

    const handleEdit = (resource: Resource) => {
        setSelectedResource(resource)
        setIsFormOpen(true)
    }

    const handleCreate = () => {
        setSelectedResource(null)
        setIsFormOpen(true)
    }

    const handleDelete = () => {
        if (resourceToDelete) {
            deleteMutation.mutate(resourceToDelete._id)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Resources</h1>
                    <p className="text-muted-foreground mt-1">Manage learning resources and materials</p>
                </div>
                <Button onClick={handleCreate} className="gap-2">
                    <Plus className="w-4 h-4" /> Add Resource
                </Button>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search resources..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {data?.data.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground bg-accent/20 rounded-lg border border-dashed">
                            <p>No resources found</p>
                        </div>
                    ) : (
                        data?.data.map((resource, index) => (
                            <Card key={resource._id || index} className="overflow-hidden hover:shadow-sm transition-shadow">
                                <CardContent className="p-0">
                                    <div className="flex items-center p-4 gap-4">
                                        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 shrink-0">
                                            {resource.resourceType === ResourceType.VIDEO ? (
                                                <Video className="w-6 h-6 text-primary" />
                                            ) : (
                                                <FileText className="w-6 h-6 text-primary" />
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-semibold text-foreground truncate">{resource.title}</h3>
                                                <Badge variant={resource.status === ResourceStatus.PUBLISHED ? 'success' : 'secondary'} className="text-[10px] h-5">
                                                    {resource.status}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground truncate">{resource.description || 'No description'}</p>
                                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                                <span>Added {format(new Date(resource.createdAt), 'MMM d, yyyy')}</span>
                                                {resource.resourceType === ResourceType.PDF && <span>PDF Document</span>}
                                                {resource.resourceType === ResourceType.VIDEO && <span>Video Content</span>}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => window.open(resource.fileUrl, '_blank')}
                                            >
                                                <ExternalLink className="w-4 h-4 text-muted-foreground" />
                                            </Button>

                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreVertical className="w-4 h-4 text-muted-foreground" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleEdit(resource)}>
                                                        <Edit className="w-4 h-4 mr-2" />
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="text-destructive focus:text-destructive"
                                                        onClick={() => setResourceToDelete(resource)}
                                                    >
                                                        <Trash2 className="w-4 h-4 mr-2" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            )}

            {/* Pagination controls could go here if needed, utilizing data.pagination */}

            <ResourceForm
                resource={selectedResource}
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSuccess={() => {
                    queryClient.invalidateQueries({ queryKey: ['resources'] })
                }}
            />

            <AlertDialog open={!!resourceToDelete} onOpenChange={(open: boolean) => !open && setResourceToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the resource
                            "{resourceToDelete?.title}".
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setResourceToDelete(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
