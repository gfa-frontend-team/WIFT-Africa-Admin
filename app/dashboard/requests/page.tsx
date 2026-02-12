'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/lib/stores'
import { useChapters, useChapter } from '@/lib/hooks/queries/useChapters'
import { useMembershipRequests, useApproveRequest, useRejectRequest } from '@/lib/hooks/queries/useMembership'
import { MembershipRequest } from '@/types'
import { RequestCard } from '@/components/requests/RequestCard'
import { ApproveModal } from '@/components/requests/ApproveModal'
import { RejectModal } from '@/components/requests/RejectModal'
import { Search, Info } from 'lucide-react'
import { usePermissions } from '@/lib/hooks/usePermissions'
import { PermissionGuard } from '@/lib/guards/PermissionGuard'
import { Permission } from '@/lib/constants/permissions'

export default function RequestsPage() {
  const { isSuperAdmin, isChapterAdmin, userChapterId } = usePermissions()

  // Auto-scope to user's chapter for Chapter Admins
  const [selectedChapter, setSelectedChapter] = useState<string>('')
  const [memberTypeFilter, setMemberTypeFilter] = useState<'NEW' | 'EXISTING' | ''>('')
  const [searchTerm, setSearchTerm] = useState('')

  const [approveModalRequest, setApproveModalRequest] = useState<MembershipRequest | null>(null)
  const [rejectModalRequest, setRejectModalRequest] = useState<MembershipRequest | null>(null)

  // Fetch chapters for Super Admin
  const { data: chaptersResponse } = useChapters({ isActive: true }, { enabled: isSuperAdmin })
  const chapters = chaptersResponse?.data || []

  // Fetch current chapter details
  // Note: Chapter Admins may not have permission to fetch full chapter details via /admin/chapters/:id
  const { data: currentChapter } = useChapter(selectedChapter, { enabled: isSuperAdmin })

  // Fetch requests
  const { data: requestsResponse, isLoading } = useMembershipRequests(
    selectedChapter,
    {
      status: 'PENDING',
      memberType: memberTypeFilter || undefined
    }
  )

  const requests = requestsResponse?.data || []

  // Mutations
  const { mutateAsync: approveRequest, isPending: isApproving } = useApproveRequest()
  const { mutateAsync: rejectRequest, isPending: isRejecting } = useRejectRequest()

  const actionLoading = isApproving || isRejecting

  // Auto-select chapter for Chapter Admin
  useEffect(() => {
    if (isChapterAdmin && userChapterId) {
      setSelectedChapter(userChapterId)
    }
  }, [isChapterAdmin, userChapterId])

  const handleApprove = async (notes?: string) => {
    if (!approveModalRequest || !selectedChapter) return

    try {
      await approveRequest({
        chapterId: selectedChapter,
        requestId: approveModalRequest.id,
        notes
      })
      setApproveModalRequest(null)
    } catch (error) {
      console.error('Failed to approve request:', error)
    }
  }

  const handleReject = async (reason: string, canReapply: boolean) => {
    if (!rejectModalRequest || !selectedChapter) return

    try {
      await rejectRequest({
        chapterId: selectedChapter,
        requestId: rejectModalRequest.id,
        reason,
        canReapply
      })
      setRejectModalRequest(null)
    } catch (error) {
      console.error('Failed to reject request:', error)
    }
  }

  // Filter requests by search term
  const filteredRequests = requests.filter(request => {
    if (!searchTerm) return true
    const search = searchTerm.toLowerCase()
    return (
      request.user?.firstName?.toLowerCase().includes(search) ||
      request.user?.lastName?.toLowerCase().includes(search) ||
      request.user?.email?.toLowerCase().includes(search) ||
      request.membershipId?.toLowerCase().includes(search)
    )
  })

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Membership Requests
          {isChapterAdmin && currentChapter && (
            <span className="text-primary"> - {currentChapter.name}</span>
          )}
        </h1>
        <p className="text-muted-foreground">
          Review and manage pending membership requests
        </p>
      </div>

      {/* Chapter Admin Scope Banner */}
      {isChapterAdmin && currentChapter && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-blue-300 dark:border-blue-700">
          <div className="flex items-start gap-3">
            <Info className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-base font-semibold text-blue-900 dark:text-blue-300">
                Viewing Your Chapter Only
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                You are viewing membership requests for <strong>{currentChapter.name}</strong> only.
                You cannot access requests for other chapters.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-card rounded-lg border border-border p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Chapter Selection - Super Admin Only */}
          <PermissionGuard permission={Permission.VIEW_ALL_REQUESTS}>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Chapter
              </label>
              <select
                value={selectedChapter}
                onChange={(e) => setSelectedChapter(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-lg bg-background"
              >
                <option value="">Select a chapter</option>
                {chapters.map((chapter) => (
                  <option key={chapter.id} value={chapter.id}>
                    {chapter.name}
                  </option>
                ))}
              </select>
            </div>
          </PermissionGuard>

          {/* Member Type Filter */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Member Type
            </label>
            <select
              value={memberTypeFilter}
              onChange={(e) => setMemberTypeFilter(e.target.value as any)}
              className="w-full px-3 py-2 border border-input rounded-lg bg-background"
            >
              <option value="">All Types</option>
              <option value="NEW">New Members</option>
              <option value="EXISTING">Existing Members</option>
            </select>
          </div>

          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-input rounded-lg bg-background"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {!selectedChapter ? (
        <div className="bg-card rounded-lg border border-border p-12 text-center">
          <p className="text-muted-foreground">
            Please select a chapter to view membership requests
          </p>
        </div>
      ) : isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading requests...</p>
          </div>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="bg-card rounded-lg border border-border p-12 text-center">
          <p className="text-muted-foreground">
            No pending requests found
          </p>
          {searchTerm && (
            <p className="text-sm text-muted-foreground mt-2">
              Try adjusting your search or filters
            </p>
          )}
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {filteredRequests.length} request{filteredRequests.length !== 1 ? 's' : ''}
            </p>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-muted-foreground">
                Delayed: <span className="font-medium text-warning">
                  {filteredRequests.filter(r => r.isDelayed).length}
                </span>
              </span>
            </div>
          </div>

          {/* Requests Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredRequests.map((request) => (
              <RequestCard
                key={request.id}
                request={request}
                onApprove={setApproveModalRequest}
                onReject={setRejectModalRequest}
              />
            ))}
          </div>
        </>
      )}

      {/* Modals */}
      {approveModalRequest && (
        <ApproveModal
          request={approveModalRequest}
          onConfirm={handleApprove}
          onClose={() => setApproveModalRequest(null)}
          isLoading={actionLoading}
        />
      )}

      {rejectModalRequest && (
        <RejectModal
          request={rejectModalRequest}
          onConfirm={handleReject}
          onClose={() => setRejectModalRequest(null)}
          isLoading={actionLoading}
        />
      )}
    </div>
  )
}
