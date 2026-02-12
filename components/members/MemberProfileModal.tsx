import { useState } from 'react'
import { User } from '@/types'
import { adminApi } from '@/lib/api/admin'
import { formatDate } from '@/lib/utils'
import {
  X, Mail, Phone, MapPin, Globe, Linkedin,
  Instagram, Twitter, Calendar, Shield, AlertTriangle
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/components/ui/use-toast'
import Image from 'next/image'

interface MemberProfileModalProps {
  member: User | null
  isOpen: boolean
  onClose: () => void
  onStatusChange: () => void
}

export function MemberProfileModal({ member, isOpen, onClose, onStatusChange }: MemberProfileModalProps) {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<'profile' | 'contact'>('profile')
  const [view, setView] = useState<'details' | 'suspend'>('details')
  const [reason, setReason] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  if (!member) return null

  // Reset view when modal opens/closes
  const handleClose = () => {
    setView('details')
    setReason('')
    onClose()
  }

  const handleStatusUpdate = async (newStatus: 'APPROVED' | 'SUSPENDED') => {
    if (newStatus === 'SUSPENDED' && !reason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for suspension",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    try {
      await adminApi.updateMemberStatus(member.id, {
        status: newStatus,
        reason: newStatus === 'SUSPENDED' ? reason : undefined
      })

      toast({
        title: "Success",
        description: `Member ${newStatus === 'SUSPENDED' ? 'suspended' : 'reinstated'} successfully`,
        variant: "default"
      })

      onStatusChange()
      setView('details')
      setReason('')
      if (newStatus === 'SUSPENDED') handleClose()
    } catch (error: any) {
      console.error('Failed to update status:', error)
      toast({
        title: "Error",
        description: error.message || 'Failed to update member status',
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const profile = (member as any).profile // Cast as any if profile prop missing in generic User type usage

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {view === 'details' ? (
          <>
            <DialogHeader>
              <div className="flex justify-between items-start">
                <div className="flex gap-4">
                  <div className="relative w-20 h-20 rounded-full overflow-hidden bg-muted flex-shrink-0">
                    {member.profilePhoto ? (
                      <Image
                        src={member.profilePhoto}
                        alt={`${member.firstName} ${member.lastName}`}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary text-2xl font-bold">
                        {member.firstName?.[0]}{member.lastName?.[0]}
                      </div>
                    )}
                  </div>
                  <div>
                    <DialogTitle>
                      {member.firstName} {member.lastName}
                    </DialogTitle>
                    <p className="text-muted-foreground">{member.email}</p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant={member.membershipStatus === 'APPROVED' ? 'success' : member.membershipStatus === 'SUSPENDED' ? 'destructive' : 'default'}>
                        {member.membershipStatus}
                      </Badge>
                      <Badge variant="outline">{member.accountType}</Badge>
                      {member.chapterId && (
                        <Badge variant="secondary">Chapter Member</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </DialogHeader>

            {/* Tabs */}
            <div className="flex border-b border-border mb-6">
              <button
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'profile'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                onClick={() => setActiveTab('profile')}
              >
                Profile
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'contact'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                onClick={() => setActiveTab('contact')}
              >
                Contact
              </button>
            </div>

            <div className="space-y-6">
              {activeTab === 'profile' ? (
                <div className="space-y-4">
                  {profile?.headline && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Headline</h4>
                      <p>{profile.headline}</p>
                    </div>
                  )}

                  {profile?.bio && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Bio</h4>
                      <p className="text-sm">{profile.bio}</p>
                    </div>
                  )}

                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Roles & Specializations</h4>
                    <div className="flex flex-wrap gap-2">
                      {profile?.primaryRole && <Badge>{profile.primaryRole}</Badge>}
                      {profile?.roles?.map((role: string) => (
                        role !== profile?.primaryRole && <Badge key={role} variant="outline">{role}</Badge>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Joined</h4>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4" />
                        {formatDate(member.createdAt)}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Last Login</h4>
                      <div className="flex items-center gap-2 text-sm">
                        <Shield className="w-4 h-4" />
                        {member.lastLoginAt ? formatDate(member.lastLoginAt) : 'Never'}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Email</h4>
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4" />
                        <a href={`mailto:${member.email}`} className="text-primary hover:underline">{member.email}</a>
                      </div>
                    </div>
                    {profile?.phone && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Phone</h4>
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="w-4 h-4" />
                          <a href={`tel:${profile.phone}`} className="text-primary hover:underline">{profile.phone}</a>
                        </div>
                      </div>
                    )}
                  </div>

                  {profile?.location && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Location</h4>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4" />
                        {profile.location}
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Social Links</h4>
                    <div className="flex flex-wrap gap-4">
                      {profile?.website && (
                        <a href={profile.website} target="_blank" rel="noopener" className="flex items-center gap-1 text-sm text-primary hover:underline">
                          <Globe className="w-4 h-4" /> Website
                        </a>
                      )}
                      {profile?.linkedinUrl && (
                        <a href={profile.linkedinUrl} target="_blank" rel="noopener" className="flex items-center gap-1 text-sm text-primary hover:underline">
                          <Linkedin className="w-4 h-4" /> LinkedIn
                        </a>
                      )}
                      {profile?.twitterHandle && (
                        <a href={`https://twitter.com/${profile.twitterHandle.replace('@', '')}`} target="_blank" rel="noopener" className="flex items-center gap-1 text-sm text-primary hover:underline">
                          <Twitter className="w-4 h-4" /> Twitter
                        </a>
                      )}
                      {profile?.instagramHandle && (
                        <a href={`https://instagram.com/${profile.instagramHandle.replace('@', '')}`} target="_blank" rel="noopener" className="flex items-center gap-1 text-sm text-primary hover:underline">
                          <Instagram className="w-4 h-4" /> Instagram
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="mt-8 pt-4 border-t border-border flex justify-between items-center sm:justify-between">
              <div>
                {/* Left side actions or info could go here */}
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={handleClose}>Close</Button>

                {member.membershipStatus === 'SUSPENDED' ? (
                  <Button
                    variant="outline"
                    className="text-green-600 border-green-600 hover:bg-green-50"
                    onClick={() => handleStatusUpdate('APPROVED')}
                    isLoading={isLoading}
                  >
                    Reinstate Member
                  </Button>
                ) : (
                  <Button
                    variant="destructive"
                    onClick={() => setView('suspend')}
                    disabled={member.accountType === 'SUPER_ADMIN'}
                  >
                    Suspend Member
                  </Button>
                )}
              </div>
            </DialogFooter>
          </>
        ) : (
          /* Suspension View */
          <div className="animate-in fade-in zoom-in-95 duration-200">
            <DialogHeader>
              <DialogTitle>
                <div className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="w-5 h-5" />
                  Suspend Member
                </div>
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to suspend {member.firstName} {member.lastName}?
                This will revoke their access to the platform.
              </DialogDescription>
            </DialogHeader>

            <div className="my-6">
              <label className="block text-sm font-medium text-foreground mb-2">
                Reason for Suspension <span className="text-destructive">*</span>
              </label>
              <textarea
                className="w-full px-3 py-2 border border-input rounded-lg bg-background min-h-[100px] focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                placeholder="Please provide a detailed reason for the suspension..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                autoFocus
              />
            </div>

            <DialogFooter>
              <Button variant="ghost" onClick={() => setView('details')}>Cancel</Button>
              <Button
                variant="destructive"
                onClick={() => handleStatusUpdate('SUSPENDED')}
                isLoading={isLoading}
                disabled={!reason.trim()}
              >
                Confirm Suspension
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
