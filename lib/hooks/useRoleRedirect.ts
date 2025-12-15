import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { usePermissions } from './usePermissions'
import { Permission } from '@/lib/constants/permissions'

/**
 * Hook to automatically redirect users who don't have required permissions
 * 
 * @param requiredPermission - Single permission or array of permissions (user needs ANY)
 * @param redirectTo - Where to redirect unauthorized users (default: /unauthorized)
 * 
 * @example
 * // Redirect if user doesn't have permission
 * useRoleRedirect(Permission.VIEW_ALL_CHAPTERS)
 * 
 * @example
 * // Redirect if user doesn't have ANY of these permissions
 * useRoleRedirect([Permission.VIEW_ALL_CHAPTERS, Permission.EDIT_CHAPTER])
 * 
 * @example
 * // Custom redirect location
 * useRoleRedirect(Permission.MANAGE_VERIFICATION, '/dashboard')
 */
export function useRoleRedirect(
  requiredPermission: Permission | Permission[],
  redirectTo: string = '/unauthorized'
) {
  const router = useRouter()
  const { hasPermission, hasAnyPermission } = usePermissions()
  
  useEffect(() => {
    // Convert to array if single permission
    const permissions = Array.isArray(requiredPermission) 
      ? requiredPermission 
      : [requiredPermission]
    
    // Check if user has any of the required permissions
    const hasAccess = hasAnyPermission(permissions)
    
    // Redirect if no access
    if (!hasAccess) {
      router.push(redirectTo)
    }
  }, [requiredPermission, redirectTo, router, hasAnyPermission])
}
