'use client'

import { usePermissions } from '@/lib/hooks/usePermissions'
import { Permission } from '@/lib/constants/permissions'

interface PermissionGuardProps {
  children: React.ReactNode
  permission: Permission | Permission[]
  fallback?: React.ReactNode
  requireAll?: boolean
}

/**
 * Component to conditionally render UI elements based on permissions
 * Hides content if user doesn't have required permissions
 * 
 * @example
 * // Hide button if no permission
 * <PermissionGuard permission={Permission.EDIT_CHAPTER}>
 *   <Button>Edit Chapter</Button>
 * </PermissionGuard>
 * 
 * @example
 * // Require ANY of multiple permissions
 * <PermissionGuard permission={[Permission.EDIT_CHAPTER, Permission.DELETE_CHAPTER]}>
 *   <ActionButtons />
 * </PermissionGuard>
 * 
 * @example
 * // Require ALL permissions
 * <PermissionGuard 
 *   permission={[Permission.VIEW_ALL_CHAPTERS, Permission.EDIT_CHAPTER]}
 *   requireAll={true}
 * >
 *   <AdvancedFeature />
 * </PermissionGuard>
 * 
 * @example
 * // Show fallback for unauthorized users
 * <PermissionGuard 
 *   permission={Permission.MANAGE_VERIFICATION}
 *   fallback={<p>Contact Super Admin for access</p>}
 * >
 *   <VerificationTools />
 * </PermissionGuard>
 */
export function PermissionGuard({ 
  children, 
  permission, 
  fallback = null,
  requireAll = false 
}: PermissionGuardProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions()
  
  // Convert to array if single permission
  const permissions = Array.isArray(permission) ? permission : [permission]
  
  // Check access based on requireAll flag
  const hasAccess = requireAll 
    ? hasAllPermissions(permissions)
    : hasAnyPermission(permissions)
  
  // Show fallback if no access
  if (!hasAccess) {
    return <>{fallback}</>
  }
  
  // User has access, render children
  return <>{children}</>
}
