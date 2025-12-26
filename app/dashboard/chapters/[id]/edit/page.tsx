'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { useChapter } from '@/lib/hooks/queries/useChapters'
import { Button } from '@/components/ui/Button'
import { ChapterForm } from '@/components/chapters/ChapterForm'
import { RoleGuard } from '@/lib/guards/RoleGuard'
import { Permission } from '@/lib/constants/permissions'

import { PermissionGuard } from '@/lib/guards/PermissionGuard'
import { usePermissions } from '@/lib/hooks/usePermissions'

export default function EditChapterPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string
  const { isSuperAdmin } = usePermissions()

  // Use Admin View for Super Admins, otherwise Standard View
  const { data: currentChapter, isLoading } = useChapter(id, { isAdminView: isSuperAdmin })

  // No effect needed for fetching

  if (isLoading || !currentChapter) {
    return (
      <RoleGuard requiredPermission={Permission.EDIT_CHAPTER}>
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
    <RoleGuard requiredPermission={Permission.EDIT_CHAPTER}>
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">Edit Chapter</h1>
          <p className="text-muted-foreground">
            Update information for {currentChapter.name}
          </p>
        </div>

        <ChapterForm chapter={currentChapter} isEdit isAdminView={isSuperAdmin} />
      </div>
    </RoleGuard>
  )
}
