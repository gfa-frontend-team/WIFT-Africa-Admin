'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Edit, Trash2, Users, MapPin, Mail, Phone, Globe, Calendar } from 'lucide-react'
import { useAuthStore } from '@/lib/stores'
import { useChapter, useDeactivateChapter, useReactivateChapter } from '@/lib/hooks/queries/useChapters'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { AdminManagement } from '@/components/chapters/AdminManagement'
import { formatDate } from '@/lib/utils'
import { RoleGuard } from '@/lib/guards/RoleGuard'
import { PermissionGuard } from '@/lib/guards/PermissionGuard'
import { Permission } from '@/lib/constants/permissions'

export default function ChapterDetailPage() {
  const params = useParams()
  const router = useRouter()
  // React Query hooks
  const { id: chapterId } = useParams() as { id: string }
  // Force Admin View for this page since it's under /admin/chapters
  const { data: currentChapter, isLoading } = useChapter(chapterId, { isAdminView: true })
  const { mutateAsync: deactivateChapter } = useDeactivateChapter()
  const { mutateAsync: reactivateChapter } = useReactivateChapter()

  // No useEffect needed for fetching!

  const handleToggleStatus = async () => {
    if (!currentChapter) return
    
    try {
      if (currentChapter.isActive) {
        await deactivateChapter(chapterId)
      } else {
        await reactivateChapter(chapterId)
      }
      // Invalidation happens in the hook, so no need to manually fetch
    } catch (error) {
      console.error('Failed to toggle chapter status:', error)
    }
  }

  if (isLoading || !currentChapter) {
    return (
      <RoleGuard requiredPermission={Permission.VIEW_ALL_CHAPTERS}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading chapter...</p>
          </div>
        </div>
      </RoleGuard>
    )
  }

  return (
    <RoleGuard requiredPermission={Permission.VIEW_ALL_CHAPTERS}>
      <div>
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-foreground">{currentChapter.name}</h1>
              <Badge variant={currentChapter.isActive ? 'success' : 'default'}>
                {currentChapter.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <p className="text-muted-foreground">{currentChapter.code}</p>
          </div>

          <PermissionGuard permission={[Permission.EDIT_CHAPTER, Permission.DELETE_CHAPTER]}>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => router.push(`/dashboard/chapters/${chapterId}/edit`)}
              >
                <Edit className="w-4 h-4" />
                Edit
              </Button>
              <Button
                variant={currentChapter.isActive ? 'destructive' : 'primary'}
                onClick={handleToggleStatus}
              >
                {currentChapter.isActive ? (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Deactivate
                  </>
                ) : (
                  'Reactivate'
                )}
              </Button>
            </div>
          </PermissionGuard>
        </div>
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

            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Members</p>
                <p className="text-foreground font-medium">{currentChapter.memberCount}</p>
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
                  className="text-primary hover:underline"
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

        {/* Admin Management - Super Admin Only */}
        <PermissionGuard permission={Permission.MANAGE_CHAPTER_ADMINS}>
          <AdminManagement chapter={currentChapter} />
        </PermissionGuard>
      </div>
      </div>
    </RoleGuard>
  )
}
