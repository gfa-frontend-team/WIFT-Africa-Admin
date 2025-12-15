'use client'

import { useEffect, useState } from 'react'
import { useAuthStore, useChapterStore, useMembershipStore } from '@/lib/stores'
import { User } from '@/types'
import { MemberCard } from '@/components/members/MemberCard'
import { Search, Users as UsersIcon, Info } from 'lucide-react'
import { usePermissions } from '@/lib/hooks/usePermissions'
import { PermissionGuard } from '@/lib/guards/PermissionGuard'
import { Permission } from '@/lib/constants/permissions'

export default function MembersPage() {
  const { user } = useAuthStore()
  const { isSuperAdmin, isChapterAdmin, userChapterId } = usePermissions()
  const { chapters, currentChapter, fetchChapters, fetchChapter } = useChapterStore()
  const { isLoading } = useMembershipStore()
  
  // Auto-scope to user's chapter for Chapter Admins
  const [selectedChapter, setSelectedChapter] = useState<string>('')
  const [members, setMembers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState('')

  // Fetch chapters on mount (Super Admin only)
  useEffect(() => {
    if (isSuperAdmin) {
      fetchChapters({ isActive: true })
    }
  }, [isSuperAdmin, fetchChapters])

  // Auto-select chapter for Chapter Admin and fetch chapter details
  useEffect(() => {
    if (isChapterAdmin && userChapterId) {
      setSelectedChapter(userChapterId)
      fetchChapter(userChapterId)
    }
  }, [isChapterAdmin, userChapterId, fetchChapter])

  // Fetch members when chapter is selected
  useEffect(() => {
    if (selectedChapter) {
      // TODO: Implement fetchMembers from membershipStore
      // For now, using empty array
      setMembers([])
    }
  }, [selectedChapter])

  // Filter members by search term
  const filteredMembers = members.filter(member => {
    if (!searchTerm) return true
    const search = searchTerm.toLowerCase()
    return (
      member.firstName?.toLowerCase().includes(search) ||
      member.lastName?.toLowerCase().includes(search) ||
      member.email?.toLowerCase().includes(search)
    )
  })

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Members
          {isChapterAdmin && currentChapter && (
            <span className="text-primary"> - {currentChapter.name}</span>
          )}
        </h1>
        <p className="text-muted-foreground">
          View and manage chapter members
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
                You are viewing members for <strong>{currentChapter.name}</strong> only. 
                You cannot access members from other chapters.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-card rounded-lg border border-border p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Chapter Selection - Super Admin Only */}
          <PermissionGuard permission={Permission.VIEW_ALL_MEMBERS}>
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
          <UsersIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            Please select a chapter to view members
          </p>
        </div>
      ) : isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading members...</p>
          </div>
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="bg-card rounded-lg border border-border p-12 text-center">
          <UsersIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            No members found
          </p>
          {searchTerm && (
            <p className="text-sm text-muted-foreground mt-2">
              Try adjusting your search
            </p>
          )}
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="mb-4">
            <p className="text-sm text-muted-foreground">
              Showing {filteredMembers.length} member{filteredMembers.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Members Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMembers.map((member) => (
              <MemberCard key={member.id} member={member} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
