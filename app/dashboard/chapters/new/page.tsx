'use client'

import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { ChapterForm } from '@/components/chapters/ChapterForm'
import { RoleGuard } from '@/lib/guards/RoleGuard'
import { Permission } from '@/lib/constants/permissions'

export default function NewChapterPage() {
  const router = useRouter()

  return (
    <RoleGuard requiredPermission={Permission.CREATE_CHAPTER}>
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
          <h1 className="text-3xl font-bold text-foreground mb-2">Create New Chapter</h1>
          <p className="text-muted-foreground">
            Add a new regional chapter to the WIFT Africa network
          </p>
        </div>

        <ChapterForm />
      </div>
    </RoleGuard>
  )
}
