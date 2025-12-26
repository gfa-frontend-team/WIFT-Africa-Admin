'use client'

import { useState } from 'react'
import { Chapter, User } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { UserPlus, UserMinus, Shield } from 'lucide-react'
import { useAddChapterAdmin, useRemoveChapterAdmin } from '@/lib/hooks/queries/useChapters'
import { useQueryClient } from '@tanstack/react-query'

import { UserSelector } from './UserSelector'

interface AdminManagementProps {
  chapter: Chapter
}

export function AdminManagement({ chapter }: AdminManagementProps) {
  const { mutateAsync: removeAdmin, isPending: isRemoving } = useRemoveChapterAdmin()
  const { mutateAsync: addAdmin, isPending: isAdding } = useAddChapterAdmin()
  const [showAddModal, setShowAddModal] = useState(false)
  
  const isLoading = isRemoving || isAdding

  const admins = Array.isArray(chapter.adminIds) && typeof chapter.adminIds[0] === 'object'
    ? (chapter.adminIds as User[])
    : []

  const handleRemoveAdmin = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this admin?')) return
    
    try {
      await removeAdmin({ chapterId: chapter.id, userId })
    } catch (error) {
      console.error('Failed to remove admin:', error)
    }
  }

  const handleAddAdmin = async (user: User) => {
    if (!confirm(`Are you sure you want to make ${user.firstName} ${user.lastName} a Chapter Admin?`)) return

    try {
      await addAdmin({ chapterId: chapter.id, userId: user.id })
      setShowAddModal(false)
    } catch (error) {
      console.error('Failed to add admin:', error)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Chapter Admins</CardTitle>
          <Button
            size="sm"
            onClick={() => setShowAddModal(true)}
            disabled={isLoading}
          >
            <UserPlus className="w-4 h-4" />
            Add Admin
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {admins.length === 0 ? (
          <div className="text-center py-8">
            <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              No chapter admins assigned yet
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {admins.map((admin) => (
              <div
                key={admin.id}
                className="flex items-center justify-between p-3 bg-accent rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full text-primary font-semibold text-sm">
                    {admin.firstName?.[0]}{admin.lastName?.[0]}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {admin.firstName} {admin.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">{admin.email}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveAdmin(admin.id)}
                  disabled={isLoading}
                >
                  <UserMinus className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Add Admin Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg shadow-xl max-w-lg w-full p-6 animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-semibold mb-2">Add Chapter Admin</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Select an existing chapter member to promote to Chapter Admin.
            </p>
            
            <div className="mb-6">
              <UserSelector 
                chapterId={chapter.id}
                onSelect={handleAddAdmin}
                excludeIds={admins.map(a => a.id)}
              />
            </div>

            <div className="flex justify-end">
              <Button 
                variant="outline" 
                onClick={() => setShowAddModal(false)}
                disabled={isAdding}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}
