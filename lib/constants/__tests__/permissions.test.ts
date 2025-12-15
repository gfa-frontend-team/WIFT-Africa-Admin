import { Permission, ROLE_PERMISSIONS, roleHasPermission, getRolePermissions } from '../permissions'

describe('Permission System', () => {
  describe('SUPER_ADMIN permissions', () => {
    it('should have all chapter management permissions', () => {
      const permissions = ROLE_PERMISSIONS.SUPER_ADMIN
      
      expect(permissions).toContain(Permission.VIEW_ALL_CHAPTERS)
      expect(permissions).toContain(Permission.CREATE_CHAPTER)
      expect(permissions).toContain(Permission.EDIT_CHAPTER)
      expect(permissions).toContain(Permission.DELETE_CHAPTER)
      expect(permissions).toContain(Permission.MANAGE_CHAPTER_ADMINS)
    })
    
    it('should have all system permissions', () => {
      const permissions = ROLE_PERMISSIONS.SUPER_ADMIN
      
      expect(permissions).toContain(Permission.VIEW_PLATFORM_STATS)
      expect(permissions).toContain(Permission.MANAGE_VERIFICATION)
      expect(permissions).toContain(Permission.VIEW_VERIFICATION_STATS)
    })
    
    it('should have all request and member permissions', () => {
      const permissions = ROLE_PERMISSIONS.SUPER_ADMIN
      
      expect(permissions).toContain(Permission.VIEW_ALL_REQUESTS)
      expect(permissions).toContain(Permission.VIEW_ALL_MEMBERS)
      expect(permissions).toContain(Permission.APPROVE_REJECT_REQUESTS)
    })
  })
  
  describe('CHAPTER_ADMIN permissions', () => {
    it('should only have own chapter permissions', () => {
      const permissions = ROLE_PERMISSIONS.CHAPTER_ADMIN
      
      expect(permissions).toContain(Permission.VIEW_OWN_CHAPTER_REQUESTS)
      expect(permissions).toContain(Permission.VIEW_OWN_CHAPTER_MEMBERS)
      expect(permissions).toContain(Permission.APPROVE_REJECT_REQUESTS)
    })
    
    it('should NOT have chapter management permissions', () => {
      const permissions = ROLE_PERMISSIONS.CHAPTER_ADMIN
      
      expect(permissions).not.toContain(Permission.VIEW_ALL_CHAPTERS)
      expect(permissions).not.toContain(Permission.CREATE_CHAPTER)
      expect(permissions).not.toContain(Permission.EDIT_CHAPTER)
      expect(permissions).not.toContain(Permission.DELETE_CHAPTER)
      expect(permissions).not.toContain(Permission.MANAGE_CHAPTER_ADMINS)
    })
    
    it('should NOT have system permissions', () => {
      const permissions = ROLE_PERMISSIONS.CHAPTER_ADMIN
      
      expect(permissions).not.toContain(Permission.VIEW_PLATFORM_STATS)
      expect(permissions).not.toContain(Permission.MANAGE_VERIFICATION)
      expect(permissions).not.toContain(Permission.VIEW_VERIFICATION_STATS)
    })
  })
  
  describe('roleHasPermission helper', () => {
    it('should return true for Super Admin with any permission', () => {
      expect(roleHasPermission('SUPER_ADMIN', Permission.VIEW_ALL_CHAPTERS)).toBe(true)
      expect(roleHasPermission('SUPER_ADMIN', Permission.MANAGE_VERIFICATION)).toBe(true)
    })
    
    it('should return false for Chapter Admin with Super Admin permissions', () => {
      expect(roleHasPermission('CHAPTER_ADMIN', Permission.VIEW_ALL_CHAPTERS)).toBe(false)
      expect(roleHasPermission('CHAPTER_ADMIN', Permission.CREATE_CHAPTER)).toBe(false)
      expect(roleHasPermission('CHAPTER_ADMIN', Permission.MANAGE_VERIFICATION)).toBe(false)
    })
    
    it('should return true for Chapter Admin with own chapter permissions', () => {
      expect(roleHasPermission('CHAPTER_ADMIN', Permission.VIEW_OWN_CHAPTER_REQUESTS)).toBe(true)
      expect(roleHasPermission('CHAPTER_ADMIN', Permission.APPROVE_REJECT_REQUESTS)).toBe(true)
    })
    
    it('should return false for unknown roles', () => {
      expect(roleHasPermission('UNKNOWN_ROLE', Permission.VIEW_ALL_CHAPTERS)).toBe(false)
    })
  })
  
  describe('getRolePermissions helper', () => {
    it('should return all permissions for Super Admin', () => {
      const permissions = getRolePermissions('SUPER_ADMIN')
      expect(permissions.length).toBeGreaterThan(10)
    })
    
    it('should return limited permissions for Chapter Admin', () => {
      const permissions = getRolePermissions('CHAPTER_ADMIN')
      expect(permissions.length).toBe(3)
    })
    
    it('should return empty array for regular members', () => {
      expect(getRolePermissions('CHAPTER_MEMBER')).toEqual([])
      expect(getRolePermissions('HQ_MEMBER')).toEqual([])
    })
  })
})
