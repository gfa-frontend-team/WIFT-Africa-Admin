// Permission definitions for RBAC system
// Based on ADMIN_ENDPOINTS_REFERENCE.md

export enum Permission {
  // Chapter Management
  VIEW_ALL_CHAPTERS = 'view_all_chapters',
  CREATE_CHAPTER = 'create_chapter',
  EDIT_CHAPTER = 'edit_chapter',
  DELETE_CHAPTER = 'delete_chapter',
  REACTIVATE_CHAPTER = 'reactivate_chapter',
  MANAGE_CHAPTER_ADMINS = 'manage_chapter_admins',
  
  // Membership Requests
  VIEW_ALL_REQUESTS = 'view_all_requests',
  VIEW_OWN_CHAPTER_REQUESTS = 'view_own_chapter_requests',
  APPROVE_REJECT_REQUESTS = 'approve_reject_requests',
  
  // Members
  VIEW_ALL_MEMBERS = 'view_all_members',
  VIEW_OWN_CHAPTER_MEMBERS = 'view_own_chapter_members',
  
  // Event Management
  VIEW_ALL_EVENTS = 'view_all_events',
  VIEW_OWN_CHAPTER_EVENTS = 'view_own_chapter_events',
  CREATE_EVENT = 'create_event',
  EDIT_EVENT = 'edit_event',
  DELETE_EVENT = 'delete_event',
  VIEW_EVENT_ATTENDEES = 'view_event_attendees',
  EXPORT_EVENT_ATTENDEES = 'export_event_attendees',
  
  // System & Statistics
  VIEW_PLATFORM_STATS = 'view_platform_stats',
  VIEW_COUNTRIES_LIST = 'view_countries_list',
  MANAGE_VERIFICATION = 'manage_verification',
  VIEW_VERIFICATION_STATS = 'view_verification_stats',
}

// Map roles to their permissions
export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  SUPER_ADMIN: [
    // Chapter Management - Full access
    Permission.VIEW_ALL_CHAPTERS,
    Permission.CREATE_CHAPTER,
    Permission.EDIT_CHAPTER,
    Permission.DELETE_CHAPTER,
    Permission.REACTIVATE_CHAPTER,
    Permission.MANAGE_CHAPTER_ADMINS,
    
    // Membership Requests - All chapters
    Permission.VIEW_ALL_REQUESTS,
    Permission.APPROVE_REJECT_REQUESTS,
    
    // Members - All chapters
    Permission.VIEW_ALL_MEMBERS,
    
    // Event Management - Full access
    Permission.VIEW_ALL_EVENTS,
    Permission.CREATE_EVENT,
    Permission.EDIT_EVENT,
    Permission.DELETE_EVENT,
    Permission.VIEW_EVENT_ATTENDEES,
    Permission.EXPORT_EVENT_ATTENDEES,
    
    // System & Statistics - Full access
    Permission.VIEW_PLATFORM_STATS,
    Permission.VIEW_COUNTRIES_LIST,
    Permission.MANAGE_VERIFICATION,
    Permission.VIEW_VERIFICATION_STATS,
  ],
  
  CHAPTER_ADMIN: [
    // Membership Requests - Own chapter only
    Permission.VIEW_OWN_CHAPTER_REQUESTS,
    Permission.APPROVE_REJECT_REQUESTS,
    
    // Members - Own chapter only
    Permission.VIEW_OWN_CHAPTER_MEMBERS,
    
    // Event Management - Own chapter only
    Permission.VIEW_OWN_CHAPTER_EVENTS,
    Permission.CREATE_EVENT,
    Permission.EDIT_EVENT,
    Permission.DELETE_EVENT,
    Permission.VIEW_EVENT_ATTENDEES,
    Permission.EXPORT_EVENT_ATTENDEES,
  ],
  
  // Regular members have no admin permissions
  CHAPTER_MEMBER: [],
  HQ_MEMBER: [],
}

// Helper function to check if a role has a permission
export function roleHasPermission(role: string, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role] || []
  return permissions.includes(permission)
}

// Helper function to get all permissions for a role
export function getRolePermissions(role: string): Permission[] {
  return ROLE_PERMISSIONS[role] || []
}
