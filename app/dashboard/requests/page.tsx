/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useEffect, useState } from 'react'
import { useChapters, useChapter } from '@/lib/hooks/queries/useChapters'
import {
  useMembershipRequests,
  useAdminMembershipRequests,
  useApproveRequest,
  useRejectRequest,
} from '@/lib/hooks/queries/useMembership'
import { MembershipRequest } from '@/types'
import { MembershipRequestStatus } from '@/lib/api/membership'
import { RequestCard } from '@/components/requests/RequestCard'
import { ApproveModal } from '@/components/requests/ApproveModal'
import { RejectModal } from '@/components/requests/RejectModal'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { usePermissions } from '@/lib/hooks/usePermissions'
import { PermissionGuard } from '@/lib/guards/PermissionGuard'
import { Permission } from '@/lib/constants/permissions'
import { cn } from '@/lib/utils'
import { getEmojiFlag } from '@/lib/utils/countryFlags'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/Button'

const STATUS_TABS: { label: string; value: MembershipRequestStatus }[] = [
  { label: 'Pending', value: 'PENDING' },
  { label: 'Rejected', value: 'REJECTED' },
  { label: 'Suspended', value: 'SUSPENDED' },
]

const FRONTEND_LIMIT = 10 // Frontend pagination limit

export default function RequestsPage() {
  const { isSuperAdmin, isChapterAdmin, admin: adminData } = usePermissions()
  const { toast } = useToast()

  const [adminState, setAdminState] = useState(adminData)

  useEffect(() => {
    const storedAdmin = localStorage.getItem('admin')
    if (storedAdmin) {
      setAdminState(JSON.parse(storedAdmin))
    }
  }, [])

  const admin = adminState || adminData

  const userChapterId = admin?.chapterId || ''

  const [selectedChapter, setSelectedChapter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<MembershipRequestStatus>('PENDING')
  const [memberTypeFilter, setMemberTypeFilter] = useState<'NEW' | 'EXISTING' | ''>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const [approveModalRequest, setApproveModalRequest] = useState<MembershipRequest | null>(null)
  const [rejectModalRequest, setRejectModalRequest] = useState<MembershipRequest | null>(null)

  // Fetch chapters for Super Admin
  const { data: chaptersResponse } = useChapters({ isActive: true }, { enabled: isSuperAdmin })
  const chapters = chaptersResponse?.data || []

  const { data: currentChapter } = useChapter(selectedChapter, {
    enabled: isSuperAdmin && !!selectedChapter,
  })

  // ── Chapter Admin: chapter-scoped endpoint
  const chapterFilters = {
    status: statusFilter,
    memberType: memberTypeFilter || undefined,
    page: currentPage,
    limit: FRONTEND_LIMIT,
  }
  const { data: chapterRequestsResponse, isLoading: chapterLoading } = useMembershipRequests(
    selectedChapter,
    chapterFilters
  )

  // ── Super Admin: global paginated endpoint
  const adminFilters = {
    status: statusFilter,
    chapterId: selectedChapter || undefined,
    page: currentPage,
    limit: FRONTEND_LIMIT,
  }
  const { data: adminRequestsResponse, isLoading: adminLoading } = useAdminMembershipRequests(
    isSuperAdmin ? adminFilters : {}
  )

  const isLoading = isChapterAdmin ? chapterLoading : adminLoading
  const requestsData = isChapterAdmin ? chapterRequestsResponse : adminRequestsResponse
  const requests = requestsData?.data || []
  const pagination = requestsData?.pagination

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

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [statusFilter, memberTypeFilter, selectedChapter, searchTerm])

  const handleApprove = async (notes?: string) => {
    if (!approveModalRequest) return

    let chapterId = selectedChapter || userChapterId

    console.log('Approving request for chapter ID:', approveModalRequest, selectedChapter, userChapterId)

    if (isChapterAdmin && !chapterId) {
      console.error('No chapter ID available for approval')
      return
    }

    if (isSuperAdmin && !chapterId) {
      chapterId = approveModalRequest.chapter?.id || ''
    }

    try {
      await approveRequest({ chapterId, requestId: approveModalRequest.id, notes })
      toast({ title: 'Success', description: 'Membership request approved successfully' })
      setApproveModalRequest(null)
    } catch (error) {
      console.error('Failed to approve request:', error)
    }
  }

  const handleReject = async (reason: string, canReapply: boolean) => {
    if (!rejectModalRequest) return

    const chapterId = selectedChapter || userChapterId

    if (!chapterId) {
      console.error('No chapter ID available for rejection')
      return
    }

    try {
      await rejectRequest({ chapterId, requestId: rejectModalRequest.id, reason, canReapply })
      setRejectModalRequest(null)
    } catch (error) {
      console.error('Failed to reject request:', error)
    }
  }

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

  // Calculate pagination info
  const totalPages = pagination?.page || Math.ceil((pagination?.total || 0) / FRONTEND_LIMIT)
  const totalItems = pagination?.total || 0
  const startIndex = (currentPage - 1) * FRONTEND_LIMIT + 1
  const endIndex = Math.min(currentPage * FRONTEND_LIMIT, totalItems)

  const canGoToPrevious = currentPage > 1
  const canGoToNext = currentPage < totalPages

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Membership Requests
          {isSuperAdmin && currentChapter && <span className="text-primary"> - {currentChapter.name}</span>}
        </h1>
        <p className="text-muted-foreground">Review and manage membership requests</p>
      </div>

      {/* Status Tabs */}
      <div className="mb-6 flex flex-wrap gap-2 border-b border-border pb-3">
        {STATUS_TABS.map(tab => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={cn(
              'px-4 py-1.5 rounded-full text-sm font-medium transition-colors',
              statusFilter === tab.value
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-card rounded-lg border border-border p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Chapter Selection - Super Admin Only */}
          <PermissionGuard permission={Permission.VIEW_ALL_REQUESTS}>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Chapter</label>
              <select
                value={selectedChapter}
                onChange={(e) => setSelectedChapter(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-lg bg-background"
              >
                <option value="">🌍 All Chapters</option>
                {chapters.map((chapter) => (
                  <option key={chapter.id} value={chapter.id}>
                    {getEmojiFlag(chapter.code)} {chapter.name}
                  </option>
                ))}
              </select>
            </div>
          </PermissionGuard>

          {/* Member Type Filter — hide for Suspended tab */}
          {statusFilter !== 'SUSPENDED' && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Member Type</label>
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
          )}

          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Search</label>
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
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
            <p className="mt-4 text-muted-foreground">Loading requests...</p>
          </div>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="bg-card rounded-lg border border-border p-12 text-center">
          <p className="text-muted-foreground">No {statusFilter.toLowerCase()} requests found</p>
          {searchTerm && (
            <p className="text-sm text-muted-foreground mt-2">Try adjusting your search or filters</p>
          )}
        </div>
      ) : (
        <>
          {/* Stats and Pagination Info */}
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {totalItems > 0
                ? `Showing ${startIndex}–${endIndex} of ${totalItems} request${totalItems !== 1 ? 's' : ''}`
                : `Showing 0 requests`}
            </p>
            {/* {statusFilter === 'PENDING' && filteredRequests.length > 0 && (
              <div className="flex items-center gap-4 text-sm">
                <span className="text-muted-foreground">
                  Delayed: <span className="font-medium text-warning">
                    {filteredRequests.filter(r => r.isDelayed).length}
                  </span>
                </span>
              </div>
            )} */}


              {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className=" flex items-center gap-3">
              <Button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={!canGoToPrevious || isLoading}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                {/* Previous */}
              </Button>

              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">
                  Page {currentPage} of {totalPages}
                </span>
              </div>

              <Button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={!canGoToNext || isLoading}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                {/* Next */}
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
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