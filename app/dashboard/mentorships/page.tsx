'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { mentorshipApi } from '@/lib/api/mentorship'
import { Mentorship, MentorshipStatus } from '@/types'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Loader2, Plus, Search, MoreVertical, Edit, Trash2, GraduationCap, Clock, MapPin } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import { useDebounce } from '@/lib/hooks/useDebounce'
import { MentorshipForm } from '@/components/mentorship/MentorshipForm'
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

import { usePermissions } from '@/lib/hooks/usePermissions'

export default function MentorshipsPage() {
    const { isChapterAdmin, userChapterId } = usePermissions()
    const [page, setPage] = useState(1)
    const [search, setSearch] = useState('')
    const debouncedSearch = useDebounce(search, 500)
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [selectedMentorship, setSelectedMentorship] = useState<Mentorship | null>(null)
    const [mentorshipToDelete, setMentorshipToDelete] = useState<Mentorship | null>(null)

    const queryClient = useQueryClient()
    const { toast } = useToast()

    const { data, isLoading } = useQuery({
        queryKey: ['mentorships', page, debouncedSearch, isChapterAdmin, userChapterId],
        queryFn: () => mentorshipApi.getAllMentorships({
            page,
            limit: 10,
            search: debouncedSearch,
            chapterId: isChapterAdmin ? userChapterId || undefined : undefined
        })
    })

    const deleteMutation = useMutation({
        mutationFn: (id: string) => mentorshipApi.deleteMentorship(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['mentorships'] })
            toast({ title: "Success", description: "Mentorship deleted successfully" })
            setMentorshipToDelete(null)
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: error.message || "Failed to delete mentorship",
                variant: "destructive"
            })
        }
    })

    const handleEdit = (mentorship: Mentorship) => {
        setSelectedMentorship(mentorship)
        setIsFormOpen(true)
    }

    const handleCreate = () => {
        setSelectedMentorship(null)
        setIsFormOpen(true)
    }

    const handleDelete = () => {
        if (mentorshipToDelete) {
            deleteMutation.mutate(mentorshipToDelete._id)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Mentorships</h1>
                    <p className="text-muted-foreground mt-1">Manage mentorship opportunities and programs</p>
                </div>
                <Button onClick={handleCreate} className="gap-2">
                    <Plus className="w-4 h-4" /> Create Offer
                </Button>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search mentorships..."
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
                            <p>No mentorship offers found</p>
                        </div>
                    ) : (
                        data?.data.map((mentorship, index) => (
                            <Card key={mentorship._id || index} className="overflow-hidden hover:shadow-sm transition-shadow">
                                <CardContent className="p-0">
                                    <div className="flex flex-col sm:flex-row p-6 gap-6">
                                        <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-primary/10 shrink-0 self-start">
                                            <GraduationCap className="w-8 h-8 text-primary" />
                                        </div>

                                        <div className="flex-1 min-w-0 space-y-3">
                                            <div className="flex items-start justify-between gap-4">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="text-lg font-semibold text-foreground">{mentorship.mentorName}</h3>
                                                        <Badge variant={mentorship.status === MentorshipStatus.OPEN ? 'success' : 'secondary'}>
                                                            {mentorship.status}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm font-medium text-muted-foreground">{mentorship.mentorRole}</p>
                                                </div>
                                            </div>

                                            <p className="text-sm text-foreground/80 line-clamp-2">{mentorship.description}</p>

                                            <div className="flex flex-wrap gap-2">
                                                {mentorship.areasOfExpertise.map((area, i) => (
                                                    <Badge key={i} variant="outline" className="text-xs bg-accent/50">
                                                        {area}
                                                    </Badge>
                                                ))}
                                            </div>

                                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground pt-2 border-t border-border">
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-4 h-4" />
                                                    {mentorship.mentorshipFormat}
                                                </div>
                                                {mentorship.startPeriod && mentorship.endPeriod && (
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="w-4 h-4" />
                                                        {new Date(mentorship.startPeriod).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(mentorship.endPeriod).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </div>
                                                )}
                                                {mentorship.days && mentorship.days.length > 0 && (
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium">{mentorship.days.join(', ')}</span>
                                                    </div>
                                                )}
                                                {mentorship.timeFrame && (
                                                    <div className="flex items-center gap-2">
                                                        <span>{mentorship.timeFrame}</span>
                                                    </div>
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
                                                    <DropdownMenuItem onClick={() => handleEdit(mentorship)}>
                                                        <Edit className="w-4 h-4 mr-2" />
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="text-destructive focus:text-destructive"
                                                        onClick={() => setMentorshipToDelete(mentorship)}
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

            <MentorshipForm
                mentorship={selectedMentorship}
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSuccess={() => {
                    queryClient.invalidateQueries({ queryKey: ['mentorships'] })
                }}
            />

            <AlertDialog open={!!mentorshipToDelete} onOpenChange={(open: boolean) => !open && setMentorshipToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the mentorship offer
                            from "{mentorshipToDelete?.mentorName}".
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setMentorshipToDelete(null)}>Cancel</AlertDialogCancel>
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
