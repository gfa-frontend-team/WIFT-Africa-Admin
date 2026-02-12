'use client'

import { useRouter } from 'next/navigation'
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/lib/stores'
import { AdminRole } from '@/types'

/**
 * Unauthorized Access Page
 * 
 * Shown when users try to access features they don't have permission for.
 * Provides role-specific guidance and navigation options.
 */
export default function UnauthorizedPage() {
  const router = useRouter()
  const { admin } = useAuthStore()

  const isChapterAdmin = admin?.role === AdminRole.CHAPTER_ADMIN
  const isSuperAdmin = admin?.role === AdminRole.SUPER_ADMIN

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            <ShieldAlert className="w-10 h-10 text-red-600 dark:text-red-400" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-foreground mb-4">
          Access Denied
        </h1>

        {/* Message - Role-specific */}
        <p className="text-muted-foreground mb-8">
          {isChapterAdmin && (
            <>
              This feature is only available to Super Admins. You can manage your chapter's
              membership requests and members from your dashboard.
            </>
          )}
          {!isChapterAdmin && !isSuperAdmin && (
            <>
              You don't have permission to access this page. Please contact your administrator
              if you believe this is an error.
            </>
          )}
          {isSuperAdmin && (
            <>
              You don't have permission to access this page. This might be a system error.
            </>
          )}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </Button>

          <Button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            Go to Dashboard
          </Button>
        </div>

        {/* Info Box - Chapter Admin specific */}
        {isChapterAdmin && (
          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-900 dark:text-blue-300">
              <strong>Chapter Admin Access:</strong> You can manage membership requests and
              view members for your chapter from the dashboard. For additional permissions,
              please contact a Super Admin.
            </p>
          </div>
        )}

        {/* Info Box - Regular user */}
        {!isChapterAdmin && !isSuperAdmin && (
          <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg border border-gray-200 dark:border-gray-800">
            <p className="text-sm text-gray-900 dark:text-gray-300">
              <strong>Need Admin Access?</strong> Contact your chapter administrator or
              a Super Admin to request elevated permissions.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
