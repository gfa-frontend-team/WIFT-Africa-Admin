import { useAuthStore } from '@/lib/stores'
import { Permission, ROLE_PERMISSIONS } from '@/lib/constants/permissions'

/**
 * Hook for checking user permissions
 * 
 * @example
 * const { hasPermission, isSuperAdmin, userChapterId } = usePermissions()
 * 
 * if (hasPermission(Permission.EDIT_CHAPTER)) {
 *   // Show edit UI
 * }
 */
export function usePermissions() {
  const { admin } = useAuthStore()

  /**
   * Check if user has a specific permission
   */
  const hasPermission = (permission: Permission): boolean => {
    if (!admin?.role) return false
    const rolePermissions = ROLE_PERMISSIONS[admin.role] || []
    return rolePermissions.includes(permission)
  }

  /**
   * Check if user has ANY of the provided permissions
   */
  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return permissions.some(p => hasPermission(p))
  }

  /**
   * Check if user has ALL of the provided permissions
   */
  const hasAllPermissions = (permissions: Permission[]): boolean => {
    return permissions.every(p => hasPermission(p))
  }

  /**
   * Check if user is Super Admin
   */
  const isSuperAdmin = admin?.role === 'SUPER_ADMIN'

  /**
   * Check if user is Chapter Admin
   */
  const isChapterAdmin = admin?.role === 'CHAPTER_ADMIN'

  /**
   * Get user's chapter ID (for Chapter Admins)
   */
  const userChapterId = admin?.chapterId

  /**
   * Get user's role
   */
  const userRole = admin?.role

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isSuperAdmin,
    isChapterAdmin,
    userChapterId,
    userRole,
    admin, // Expose admin instead of user
  }
}
