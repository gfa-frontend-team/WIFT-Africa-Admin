'use client'

import { useEffect } from 'react'
import { Building2, Users, UserCheck, Globe } from 'lucide-react'
import { useAuthStore } from '@/lib/stores'
import { useChapterStatistics, useChapter } from '@/lib/hooks/queries/useChapters'
import { useVerificationStats } from '@/lib/hooks/queries/useVerification'
import { StatCard } from '@/components/dashboard/StatCard'

export default function DashboardPage() {
  const { user } = useAuthStore()
  
  const isSuperAdmin = user?.accountType === 'SUPER_ADMIN'
  const isChapterAdmin = user?.accountType === 'CHAPTER_ADMIN'

  // Super Admin Stats
  const { data: statistics, isLoading: isStatsLoading } = useChapterStatistics({
    enabled: isSuperAdmin
  })
  
  // Chapter Admin Stats
  const { data: currentChapter, isLoading: isChapterLoading } = useChapter(
    isChapterAdmin ? (user?.chapterId || '') : ''
  )
  
  const isLoading = (isSuperAdmin && isStatsLoading) || (isChapterAdmin && isChapterLoading)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Super Admin Dashboard
  if (isSuperAdmin) {
    return (
      <div>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Platform Dashboard
          </h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.firstName} {user?.lastName}!
          </p>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Chapters"
            value={statistics?.totalChapters || 0}
            icon={Building2}
          />
          <StatCard
            title="Active Chapters"
            value={statistics?.activeChapters || 0}
            icon={Building2}
          />
          <StatCard
            title="Total Members"
            value={statistics?.totalMembers || 0}
            icon={Users}
          />
          <StatCard
            title="Countries"
            value={statistics?.totalCountries || 0}
            icon={Globe}
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card rounded-lg border border-border p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Quick Actions
            </h2>
            <div className="space-y-3">
              <a
                href="/dashboard/chapters/new"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors"
              >
                <Building2 className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium text-foreground">Create New Chapter</p>
                  <p className="text-sm text-muted-foreground">Add a new regional chapter</p>
                </div>
              </a>
              <a
                href="/dashboard/requests"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors"
              >
                <UserCheck className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium text-foreground">Review Requests</p>
                  <p className="text-sm text-muted-foreground">Approve or reject membership requests</p>
                </div>
              </a>
            </div>
          </div>

          <div className="bg-card rounded-lg border border-border p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Platform Overview
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Active Chapters</span>
                <span className="text-sm font-medium text-foreground">
                  {statistics?.activeChapters || 0} / {statistics?.totalChapters || 0}
                </span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{
                    width: `${statistics?.totalChapters ? (statistics.activeChapters / statistics.totalChapters) * 100 : 0}%`
                  }}
                />
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-sm text-muted-foreground">Inactive Chapters</span>
                <span className="text-sm font-medium text-foreground">
                  {statistics?.inactiveChapters || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Chapter Admin Dashboard
  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Chapter Dashboard
        </h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.firstName} {user?.lastName}!
        </p>
        {currentChapter && (
          <p className="text-lg font-semibold text-primary mt-2">
            {currentChapter.name}
          </p>
        )}
      </div>

      {/* Chapter Statistics */}
      {currentChapter?.stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Members"
            value={currentChapter.stats.total}
            icon={Users}
          />
          <StatCard
            title="Approved"
            value={currentChapter.stats.approved}
            icon={UserCheck}
          />
          <StatCard
            title="Pending Requests"
            value={currentChapter.stats.pending}
            icon={UserCheck}
          />
          <StatCard
            title="Rejected"
            value={currentChapter.stats.rejected}
            icon={UserCheck}
          />
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-lg border border-border p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Quick Actions
          </h2>
          <div className="space-y-3">
            <a
              href="/dashboard/requests"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors"
            >
              <UserCheck className="w-5 h-5 text-primary" />
              <div>
                <p className="font-medium text-foreground">Review Requests</p>
                <p className="text-sm text-muted-foreground">Approve or reject membership requests</p>
              </div>
            </a>
            <a
              href="/dashboard/members"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors"
            >
              <Users className="w-5 h-5 text-primary" />
              <div>
                <p className="font-medium text-foreground">View Members</p>
                <p className="text-sm text-muted-foreground">See all approved chapter members</p>
              </div>
            </a>
            <a
              href="/dashboard/my-chapter"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors"
            >
              <Building2 className="w-5 h-5 text-primary" />
              <div>
                <p className="font-medium text-foreground">View Chapter Details</p>
                <p className="text-sm text-muted-foreground">See your chapter information</p>
              </div>
            </a>
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Chapter Information
          </h2>
          {currentChapter ? (
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Chapter Name</p>
                <p className="font-medium text-foreground">{currentChapter.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="font-medium text-foreground">
                  {currentChapter.city ? `${currentChapter.city}, ` : ''}{currentChapter.country}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  currentChapter.isActive 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                }`}>
                  {currentChapter.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Loading chapter information...</p>
          )}
        </div>
      </div>
    </div>
  )
}
