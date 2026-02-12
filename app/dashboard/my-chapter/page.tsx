'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/stores'
import { useChapter } from '@/lib/hooks/queries/useChapters'
import { Users, MapPin, Mail, Phone, Globe, Calendar, UserCheck, LayoutDashboard, Edit } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatDate } from '@/lib/utils'
import { ChapterEditModal } from '@/components/chapters/ChapterEditModal'

export default function MyChapterPage() {
  const router = useRouter()
  const { admin } = useAuthStore() // Changed user to admin
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  // Fetch chapter details using the safe endpoint (defaults to isAdminView: false)
  const { data: currentChapter, isLoading } = useChapter(
    (admin?.chapterId) ? admin.chapterId : '',
    { enabled: !!admin?.chapterId }
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading chapter...</p>
        </div>
      </div>
    )
  }

  // If after loading we still don't have a chapter (and not loading), show empty state
  if (!currentChapter) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">No Chapter Assigned</h1>
        <p className="text-muted-foreground">You are not currently assigned to manage any chapter.</p>
      </div>
    )
  }

  return (
    <div>
      <ChapterEditModal
        chapter={currentChapter}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">My Chapter</h1>
            <p className="text-muted-foreground">View and manage your chapter information</p>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={() => setIsEditModalOpen(true)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Chapter
            </Button>
          </div>
        </div>

        {/* Chapter Name and Status */}
        <div className="flex items-center gap-3 mb-2">
          <h2 className="text-2xl font-semibold text-foreground">{currentChapter.name}</h2>
          <Badge variant={currentChapter.isActive ? 'success' : 'default'}>
            {currentChapter.isActive ? 'Active' : 'Inactive'}
          </Badge>
        </div>
        <p className="text-muted-foreground">{currentChapter.code}</p>
      </div>

      {/* Stats */}
      {currentChapter.stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Total Members</p>
              <p className="text-2xl font-bold text-foreground">{currentChapter.stats.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Approved</p>
              <p className="text-2xl font-bold text-green-600">{currentChapter.stats.approved}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{currentChapter.stats.pending}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Rejected</p>
              <p className="text-2xl font-bold text-red-600">{currentChapter.stats.rejected}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/dashboard/requests"
              className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border hover:bg-accent transition-colors"
            >
              <UserCheck className="w-8 h-8 text-primary" />
              <p className="font-medium text-foreground text-center">Review Requests</p>
              <p className="text-xs text-muted-foreground text-center">
                Approve or reject membership requests
              </p>
            </a>
            <a
              href="/dashboard/members"
              className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border hover:bg-accent transition-colors"
            >
              <Users className="w-8 h-8 text-primary" />
              <p className="font-medium text-foreground text-center">View Members</p>
              <p className="text-xs text-muted-foreground text-center">
                See all approved chapter members
              </p>
            </a>
            <a
              href="/dashboard"
              className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border hover:bg-accent transition-colors"
            >
              <LayoutDashboard className="w-8 h-8 text-primary" />
              <p className="font-medium text-foreground text-center">Dashboard</p>
              <p className="text-xs text-muted-foreground text-center">
                View chapter statistics
              </p>
            </a>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="text-foreground">
                  {currentChapter.city ? `${currentChapter.city}, ` : ''}{currentChapter.country}
                </p>
              </div>
            </div>

            {currentChapter.description && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Description</p>
                <p className="text-foreground">{currentChapter.description}</p>
              </div>
            )}

            {currentChapter.missionStatement && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Mission Statement</p>
                <p className="text-foreground">{currentChapter.missionStatement}</p>
              </div>
            )}

            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-muted-foreground" />
              <div className="space-y-1">
                <div>
                  <p className="text-sm text-muted-foreground">System Member Count</p>
                  <p className="text-foreground font-medium">{currentChapter.memberCount}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Public Display Count</p>
                  <p className="text-foreground font-medium">
                    {currentChapter.fixedMemberCount && currentChapter.fixedMemberCount > 0
                      ? currentChapter.fixedMemberCount
                      : <span className="text-muted-foreground italic">Not Set (Uses System Count)</span>
                    }
                  </p>
                </div>
              </div>
            </div>

            {currentChapter.foundedDate && (
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Founded</p>
                  <p className="text-foreground">{formatDate(currentChapter.foundedDate)}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentChapter.currentPresident && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">President</p>
                <p className="text-foreground font-medium">{currentChapter.currentPresident}</p>
                {currentChapter.presidentEmail && (
                  <p className="text-sm text-muted-foreground">{currentChapter.presidentEmail}</p>
                )}
                {currentChapter.presidentPhone && (
                  <p className="text-sm text-muted-foreground">{currentChapter.presidentPhone}</p>
                )}
              </div>
            )}

            {currentChapter.email && (
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-muted-foreground" />
                <a href={`mailto:${currentChapter.email}`} className="text-primary hover:underline">
                  {currentChapter.email}
                </a>
              </div>
            )}

            {currentChapter.phone && (
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-muted-foreground" />
                <a href={`tel:${currentChapter.phone}`} className="text-primary hover:underline">
                  {currentChapter.phone}
                </a>
              </div>
            )}

            {currentChapter.website && (
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-muted-foreground" />
                <a
                  href={currentChapter.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px] block"
                >
                  {currentChapter.website}
                </a>
              </div>
            )}

            {currentChapter.address && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Address</p>
                <p className="text-foreground">{currentChapter.address}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
