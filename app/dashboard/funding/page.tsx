'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fundingApi } from '@/lib/api/funding'
import { FundingOpportunity, FundingType, ApplicationType, FundingStatus } from '@/types'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Loader2, Plus, Search, MoreVertical, Edit, Trash2, Banknote, Calendar, Globe, ExternalLink } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import { useDebounce } from '@/lib/hooks/useDebounce'
import { FundingForm } from '@/components/funding/FundingForm'
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
import { format } from 'date-fns'

import { usePermissions } from '@/lib/hooks/usePermissions'

export default function FundingPage() {
    const { isChapterAdmin, userChapterId } = usePermissions()
    const [page, setPage] = useState(1)
    const [search, setSearch] = useState('')
    const debouncedSearch = useDebounce(search, 500)
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [selectedOpportunity, setSelectedOpportunity] = useState<FundingOpportunity | null>(null)
    const [opportunityToDelete, setOpportunityToDelete] = useState<FundingOpportunity | null>(null)

    const queryClient = useQueryClient()
    const { toast } = useToast()

    const { data, isLoading } = useQuery({
        queryKey: ['funding', page, debouncedSearch, isChapterAdmin, userChapterId],
        queryFn: () => fundingApi.getAllOpportunities({
            page,
            limit: 10,
            search: debouncedSearch,
            chapterId: isChapterAdmin ? userChapterId || undefined : undefined
        })
    })

    const deleteMutation = useMutation({
        mutationFn: (id: string) => fundingApi.deleteOpportunity(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['funding'] })
            toast({ title: "Success", description: "Opportunity deleted successfully" })
            setOpportunityToDelete(null)
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: error.message || "Failed to delete opportunity",
                variant: "destructive"
            })
        }
    })

    const handleEdit = (opportunity: FundingOpportunity) => {
        setSelectedOpportunity(opportunity)
        setIsFormOpen(true)
    }

    const handleCreate = () => {
        setSelectedOpportunity(null)
        setIsFormOpen(true)
    }

    const handleDelete = () => {
        if (opportunityToDelete) {
            deleteMutation.mutate(opportunityToDelete._id)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Grants & Funds</h1>
                    <p className="text-muted-foreground mt-1">Manage external and internal funding opportunities</p>
                </div>
                <Button onClick={handleCreate} className="gap-2">
                    <Plus className="w-4 h-4" /> Create Opportunity
                </Button>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search opportunities..."
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
                            <p>No funding opportunities found</p>
                        </div>
                    ) : (
                        data?.data.map((opportunity, index) => (
                            <Card key={opportunity._id || index} className="overflow-hidden hover:shadow-sm transition-shadow">
                                <CardContent className="p-0">
                                    <div className="flex flex-col sm:flex-row p-6 gap-6">
                                        <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-green-500/10 shrink-0 self-start">
                                            <Banknote className="w-8 h-8 text-green-600" />
                                        </div>

                                        <div className="flex-1 min-w-0 space-y-3">
                                            <div className="flex items-start justify-between gap-4">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="text-lg font-semibold text-foreground">{opportunity.name}</h3>
                                                        <div className="flex gap-2">
                                                            <Badge variant="outline" className="text-[10px] h-5">
                                                                {opportunity.fundingType}
                                                            </Badge>
                                                            <Badge variant={opportunity.status === FundingStatus.OPEN ? 'success' : 'secondary'} className="text-[10px] h-5">
                                                                {opportunity.status}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                    <p className="text-sm font-medium text-muted-foreground">For: {opportunity.role}</p>
                                                </div>
                                            </div>

                                            <p className="text-sm text-foreground/80 line-clamp-2">{opportunity.description}</p>

                                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground pt-2 border-t border-border">
                                                <div className="flex items-center gap-2">
                                                    <Globe className="w-4 h-4" />
                                                    {opportunity.region}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4" />
                                                    Deadline: {format(new Date(opportunity.deadline), 'MMM d, yyyy')}
                                                </div>
                                                {opportunity.applicationType === ApplicationType.REDIRECT && opportunity.applicationLink && (
                                                    <a href={opportunity.applicationLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline">
                                                        <ExternalLink className="w-4 h-4" />
                                                        Apply External
                                                    </a>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 border-t sm:border-t-0 sm:border-l border-border pt-4 sm:pt-0 sm:pl-6 mt-2 sm:mt-0">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreVertical className="w-4 h-4 text-muted-foreground" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleEdit(opportunity)}>
                                                        <Edit className="w-4 h-4 mr-2" />
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="text-destructive focus:text-destructive"
                                                        onClick={() => setOpportunityToDelete(opportunity)}
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

            <FundingForm
                opportunity={selectedOpportunity}
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSuccess={() => {
                    queryClient.invalidateQueries({ queryKey: ['funding'] })
                }}
            />

            <AlertDialog open={!!opportunityToDelete} onOpenChange={(open: boolean) => !open && setOpportunityToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the funding opportunity
                            "{opportunityToDelete?.name}".
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setOpportunityToDelete(null)}>Cancel</AlertDialogCancel>
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
