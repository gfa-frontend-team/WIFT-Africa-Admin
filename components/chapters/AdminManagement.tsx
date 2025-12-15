'use client'

import { useState } from 'react'
import { Chapter, User } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { UserPlus, UserMinus, Shield } from 'lucide-react'
import { useChapterStore } from '@/lib/stores'

interface AdminManagementProps {
  chapter: Chapter
}

export function AdminManagement({ chapter }: AdminManagementProps) {
  const { addChapterAdmin, removeChapterAdmin, fetchChapter } = useChapterStore()
  const [isLoading, setIsLoading] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)

  const admins = Array.isArray(chapter.adminIds) && typeof chapter.adminIds[0] === 'object'
    ? (chapter.adminIds as User[])
    : []

  const handleRemoveAdmin = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this admin?')) return
    
    setIsLoading(true)
    try {
      await removeChapterAdmin(chapter.id, userId)
      await fetchChapter(chapter.id)
    } catch (error) {
      console.error('Failed to remove admin:', error)
    } finally {
      setIsLoading(false)
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

      {/* Add Admin Modal - Placeholder */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Add Chapter Admin</h3>
            <p className="text-sm text-muted-foreground mb-4">
              This feature requires selecting from approved chapter members.
              Implementation coming soon.
            </p>
            <Button onClick={() => setShowAddModal(false)}>
              Close
            </Button>
          </div>
        </div>
      )}
    </Card>
  )
}
