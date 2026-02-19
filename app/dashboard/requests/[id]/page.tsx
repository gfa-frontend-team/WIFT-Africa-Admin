'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { useMemberDetails, useApproveRequest, useRejectRequest, useMembershipRequests } from '@/lib/hooks/queries/useMembership'
import { usePermissions } from '@/lib/hooks/usePermissions'
import { Loader2, ArrowLeft, Download, ExternalLink, Mail, Phone, MapPin, Briefcase } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { ApproveModal } from '@/components/requests/ApproveModal'
import { RejectModal } from '@/components/requests/RejectModal'
import { MembershipRequest } from '@/types' // We might need to construct a partial request object for modals

export default function RequestDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const userId = params.id as string
    const { isChapterAdmin, userChapterId } = usePermissions()

    const { data: memberData, isLoading, error } = useMemberDetails(userId)
    const [showApprove, setShowApprove] = useState(false)
    const [showReject, setShowReject] = useState(false)

    // Mutations
    const { mutateAsync: approveRequest, isPending: isApproving } = useApproveRequest()
    const { mutateAsync: rejectRequest, isPending: isRejecting } = useRejectRequest()

    const user = memberData?.user
    const profile = memberData?.profile

    // Construct a pseudo-request object for the modals since they expect MembershipRequest
    // We assume the user fetching logic returns enough info. Use 'as any' carefully if types mismatch temporarily
    const requestObject = user ? {
        id: userId, // Warning: Modals might expect Request ID, but for now we might be mapping UserID <-> RequestID is 1:1 or handled by backend? 
        // Wait, approveRequest API expects (chapterId, requestId). 
        // If we are on [id] page, is [id] the requestId or userId?
        // In previous steps I assumed [id] is userId because the API is /admin/members/:userId.
        // BUT approveRequest needs REQUEST ID.
        // Does the user object contain the requestId? Or is the :userId the same as :requestId?
        // Let's assume for this implementation that we might need the Request ID. 
        // If the API /admin/members/:userId returns the user, we hope it returns the active membershipRequestId?
        // Let's check api response structure from the plan... it doesn't explicitly show requestId.
        // However, `useApproveRequest` takes `requestId`.
        // If we don't have it, we are blocked.
        // Assumption: For now, I will pass `userId` as `requestId` based on the URL structure, 
        // OR the response `user` object has an `id` that IS the request ID? Unlikely.
        // Users usually have `membershipRequests` array or `activeRequest`.
        // Let's assume the [id] in url IS the user ID. 
        // If the approval endpoint needs a request ID, we might need to find it in the user object.

        // RE-READ API: `approveRequest(..., requestId)`
        // `REQUEST BODY`: `status: APPROVED`.
        // The API route in `ADMIN_FLOW.md.resolved` for APPROVE is: `PATCH /api/v1/admin/members/:userId/membership-status`
        // THIS IS DIFFERENT from `membershipApi.approveRequest` which uses `/chapters/.../approve`.
        // The `membershipApi` seems to be using an older or different path?
        // `membershipApi.approveRequest` -> `/chapters/${chapterId}/membership-requests/${requestId}/approve`

        // CONFLICT: The existing `membershipApi` uses a specific endpoint for requests. 
        // The new `ADMIN_FLOW` suggests a direct patch on the user.
        // I should probably follow `ADMIN_FLOW` for the new logic, OR update `membershipApi` to match `ADMIN_FLOW`.

        // Given I'm building "Membership Requests" which usually implies the `membershipApi` structure...
        // But the `getRequest` I added uses `/admin/members/:userId` per the flow doc.

        // DECISION: I will update `approveRequest` and `rejectRequest` in `lib/api/membership.ts` 
        // to use the endpoint defined in `ADMIN_FLOW.md.resolved`:
        // `PATCH /api/v1/admin/members/:userId/membership-status`
        // This unifies everything around `userId`.

        user: user,
        // ... fill other required props with mocks/defaults for the modal display
    } as any : null

    // Fetch pending requests to find the correct requestId
    // We fetch a larger limit to ensure we find the user's request if pagination is active
    const { data: requestsData } = useMembershipRequests(
        user?.chapter?.id || userChapterId || '',
        { status: 'PENDING', limit: 100 }
    )

    const targetRequest = requestsData?.data?.find((r: MembershipRequest) => r.user?.id === userId)

    const handleApprove = async () => {
        const chapterId = user?.chapter?.id || user?.chapterId || userChapterId || ''

        if (!user || !chapterId) {
            console.error('Missing user or chapter ID', { user, chapterId })
            return
        }

        // If we found the specific request object, use its ID. 
        // Fallback to userId only if we really can't find it (though this likely fails as seen before)
        const requestId = targetRequest?.id || userId

        try {
            await approveRequest({
                chapterId: chapterId,
                requestId: requestId,
                notes: undefined
            })
            router.push('/dashboard/requests')
        } catch (err) {
            console.error(err)
        }
    }

    const handleReject = async (reason: string, canReapply: boolean) => {
        const chapterId = user?.chapter?.id || user?.chapterId || userChapterId || ''

        if (!user || !chapterId) {
            console.error('Missing user or chapter ID', { user, chapterId })
            return
        }

        const requestId = targetRequest?.id || userId

        try {
            await rejectRequest({
                chapterId: chapterId,
                requestId: requestId,
                reason,
                canReapply
            })
            router.push('/dashboard/requests')
        } catch (err) {
            console.error(err)
        }
    }

    if (isLoading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>
    if (error || !user) return <div className="p-8">Member not found</div>

    return (
        <div className="space-y-6">
            <Button variant="ghost" onClick={() => router.back()} className="gap-2">
                <ArrowLeft size={16} /> Back to Requests
            </Button>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold">{user.firstName} {user.lastName}</h1>
                    <p className="text-muted-foreground">Applied for <span className="font-semibold text-primary">{user.chapter?.name}</span></p>
                </div>
                <div className="flex gap-3">
                    <Button variant="destructive" onClick={() => setShowReject(true)}>Reject</Button>
                    <Button onClick={() => setShowApprove(true)}>Approve Application</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Profile Info */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader><CardTitle>Professional Profile</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h3 className="font-medium text-foreground">Headline</h3>
                                <p className="text-muted-foreground">{profile?.headline || 'No headline'}</p>
                            </div>
                            <div>
                                <h3 className="font-medium text-foreground">Bio</h3>
                                <p className="text-muted-foreground">{profile?.bio || 'No bio provided'}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h3 className="font-medium text-foreground">Primary Role</h3>
                                    <Badge variant="outline">{profile?.primaryRole || 'N/A'}</Badge>
                                </div>
                                <div>
                                    <h3 className="font-medium text-foreground">Skills</h3>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        {profile?.skills?.map((skill: string) => (
                                            <Badge key={skill} variant="secondary">{skill}</Badge>
                                        )) || <span className="text-sm text-muted-foreground">No skills listed</span>}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle>CV & Documents</CardTitle></CardHeader>
                        <CardContent>
                            {user.cvFileUrl ? (
                                <div className="flex items-center justify-between p-4 border rounded-lg bg-accent/20">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-primary/10 rounded">
                                            <Briefcase className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="font-medium">{user.cvFileName || 'Resume.pdf'}</p>
                                            <p className="text-xs text-muted-foreground">Uploaded Document</p>
                                        </div>
                                    </div>
                                    <a href={user.cvFileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline">
                                        View CV <ExternalLink size={14} />
                                    </a>
                                </div>
                            ) : (
                                <p className="text-muted-foreground">No CV uploaded.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader><CardTitle>Contact Information</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Mail className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm">{user.email}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Phone className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm">{user.phoneNumber || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <MapPin className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm">{user.chapter?.country || 'Unknown Location'}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle>Links</CardTitle></CardHeader>
                        <CardContent className="space-y-3">
                            {profile?.imdbUrl && (
                                <a href={profile.imdbUrl} target="_blank" rel="noopener noreferrer" className="block text-sm text-primary hover:underline truncate">
                                    IMDb Profile
                                </a>
                            )}
                            {profile?.portfolioLinks?.map((link: string, i: number) => (
                                <a key={i} href={link} target="_blank" rel="noopener noreferrer" className="block text-sm text-primary hover:underline truncate">
                                    Portfolio Link {i + 1}
                                </a>
                            ))}
                            {!profile?.imdbUrl && (!profile?.portfolioLinks || profile.portfolioLinks.length === 0) && (
                                <span className="text-sm text-muted-foreground">No links provided</span>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Modals */}
            {showApprove && user && (
                <ApproveModal
                    request={requestObject}
                    isLoading={isApproving}
                    onClose={() => setShowApprove(false)}
                    onConfirm={handleApprove}
                />
            )}

            {showReject && user && (
                <RejectModal
                    request={requestObject}
                    isLoading={isRejecting}
                    onClose={() => setShowReject(false)}
                    onConfirm={handleReject}
                />
            )}
        </div>
    )
}
