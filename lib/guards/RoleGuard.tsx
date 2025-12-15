'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { usePermissions } from '@/lib/hooks/usePermissions'
import { Permission } from '@/lib/constants/permissions'

interface RoleGuardProps {
  children: React.ReactNode
  requiredPermission: Permission | Permission[]
  fallback?: React.ReactNode
  redirectTo?: string
}

/**
 * Component to protect routes based on permissions
 * Automatically redirects users who don't have required permissions
 * 
 * @example
 * // Protect entire page
 * <RoleGuard requiredPermission={Permission.VIEW_ALL_CHAPTERS}>
 *   <ChaptersPage />
 * </RoleGuard>
 * 
 * @example
 * // Require ANY of multiple permissions
 * <RoleGuard requiredPermission={[Permission.VIEW_ALL_CHAPTERS, Permission.EDIT_CHAPTER]}>
 *   <Content />
 * </RoleGuard>
 * 
 * @example
 * // Custom loading fallback
 * <RoleGuard 
 *   requiredPermission={Permission.MANAGE_VERIFICATION}
 *   fallback={<CustomLoader />}
 * >
 *   <Content />
 * </RoleGuard>
 */
export function RoleGuard({ 
  children, 
  requiredPermission, 
  fallback,
  redirectTo = '/unauthorized' 
}: RoleGuardProps) {
  const router = useRouter()
  const { hasAnyPermission } = usePermissions()
  const [isChecking, setIsChecking] = useState(true)
  
  useEffect(() => {
    // Convert to array if single permission
    const permissions = Array.isArray(requiredPermission) 
      ? requiredPermission 
      : [requiredPermission]
    
    // Check if user has any of the required permissions
    const hasAccess = hasAnyPermission(permissions)
    
    if (!hasAccess) {
      // Redirect unauthorized users
      router.push(redirectTo)
    } else {
      // User has access, stop checking
      setIsChecking(false)
    }
  }, [requiredPermission, redirectTo, router, hasAnyPermission])
  
  // Show loading state while checking permissions
  if (isChecking) {
    return fallback || (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Checking permissions...</p>
        </div>
      </div>
    )
  }
  
  // User has access, render children
  return <>{children}</>
}
