'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Mail, Phone, MapPin, Globe, Linkedin, Instagram, Twitter, Calendar, Shield, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useToast } from '@/components/ui/use-toast'
import { adminApi } from '@/lib/api/admin'
import { membershipApi } from '@/lib/api/membership'
import { formatDate } from '@/lib/utils'
import { User } from '@/types'

export default function MemberProfilePage() {
    const params = useParams()
    const router = useRouter()
    const { toast } = useToast()
    const memberId = params.id as string

    const [member, setMember] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'profile' | 'contact'>('profile')
    const [isSuspendMode, setIsSuspendMode] = useState(false)
    const [suspendReason, setSuspendReason] = useState('')
    const [isUpdating, setIsUpdating] = useState(false)

    console.log(member,"member1")

    useEffect(() => {
        async function fetchMember() {
            try {
                // Fetch full member details
                // We might need to enhance membershipApi to get a single member by ID if getMemberDetails isn't sufficient or exposed
                // Checking membershipApi.getMemberDetails from previous context... it was added!
                const data = await membershipApi.getMemberDetails(memberId)
                // Transform to User type if needed, but getMemberDetails returns { user, profile }
                // We need to merge them to match User interface or handle profile separately
                // User interface usually has profile as optional.

                // Let's assume data.user is the User object and data.profile is the profile object
                // We'll merge them for easier display if User type supports it, or keep profile separate.
                // Looking at MemberProfileModal, it accessed (member as any).profile

                setMember({ ...data.user, profile: data.profile } as User)
            } catch (error) {
                console.error('Failed to fetch member:', error)
                toast({
                    title: 'Error',
                    description: 'Failed to load member details',
                    variant: 'destructive',
                })
                router.push('/dashboard/members')
            } finally {
                setIsLoading(false)
            }
        }

        if (memberId) {
            fetchMember()
        }
    }, [memberId, router, toast])

    const handleStatusUpdate = async (newStatus: 'APPROVED' | 'SUSPENDED') => {
        if (newStatus === 'SUSPENDED' && !suspendReason.trim()) {
            toast({
                title: "Error",
                description: "Please provide a reason for suspension",
                variant: "destructive"
            })
            return
        }

        setIsUpdating(true)
        try {
            await adminApi.updateMemberStatus(memberId, {
                status: newStatus,
                reason: newStatus === 'SUSPENDED' ? suspendReason : undefined
            })

            toast({
                title: "Success",
                description: `Member ${newStatus === 'SUSPENDED' ? 'suspended' : 'reinstated'} successfully`,
                variant: "default"
            })

            // Refresh member data
            const data = await membershipApi.getMemberDetails(memberId)
            setMember({ ...data.user, profile: data.profile } as User)

            setIsSuspendMode(false)
            setSuspendReason('')
        } catch (error: any) {
            console.error('Failed to update status:', error)
            toast({
                title: "Error",
                description: error.message || 'Failed to update member status',
                variant: "destructive"
            })
        } finally {
            setIsUpdating(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (!member) return null

    const profile = (member as any).profile

    return (
        <div className="max-w-6xl mx-auto">
            {/* Back Button */}
            <Button
                variant="ghost"
                className="mb-6 gap-2 pl-0 hover:pl-2 transition-all"
                onClick={() => router.back()}
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Members
            </Button>

            {/* Header Card */}
            <div className="bg-card rounded-lg border border-border p-6 mb-6">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                    {/* Profile Photo */}
                    <div className="relative w-24 h-24 rounded-full overflow-hidden bg-muted flex-shrink-0">
                        {member.profilePhoto ? (
                            <Image
                                src={member.profilePhoto}
                                alt={`${member.firstName} ${member.lastName}`}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary text-3xl font-bold">
                                {member.firstName?.[0]}{member.lastName?.[0]}
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-2xl font-bold text-foreground">
                                    {member.firstName} {member.lastName}
                                </h1>
                                <p className="text-muted-foreground">{member.email}</p>
                            </div>

                            <div className="flex gap-2">
                                {member.membershipStatus === 'SUSPENDED' ? (
                                    <Button
                                        variant="outline"
                                        className="text-green-600 border-green-600 hover:bg-green-50"
                                        onClick={() => handleStatusUpdate('APPROVED')}
                                        disabled={isUpdating}
                                    >
                                        Reinstate Member
                                    </Button>
                                ) : (
                                    <Button
                                        variant="destructive"
                                        onClick={() => setIsSuspendMode(true)}
                                        disabled={member.accountType === 'SUPER_ADMIN' || isSuspendMode}
                                    >
                                        Suspend Member
                                    </Button>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-4">
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

                {/* Suspension Form */}
                {isSuspendMode && (
                    <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-200 dark:border-red-900/50 animate-in slide-in-from-top-2">
                        <h3 className="text-sm font-semibold text-destructive flex items-center gap-2 mb-3">
                            <AlertTriangle className="w-4 h-4" />
                            Suspend Member
                        </h3>
                        <textarea
                            className="w-full px-3 py-2 border border-input rounded-lg bg-background min-h-[100px] mb-4"
                            placeholder="Reason for suspension..."
                            value={suspendReason}
                            onChange={(e) => setSuspendReason(e.target.value)}
                        />
                        <div className="flex gap-2 justify-end">
                            <Button variant="ghost" size="sm" onClick={() => setIsSuspendMode(false)}>Cancel</Button>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleStatusUpdate('SUSPENDED')}
                                disabled={!suspendReason.trim() || isUpdating}
                            >
                                Confirm Suspension
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Tabs */}
            <div className="bg-card rounded-lg border border-border overflow-hidden">
                <div className="flex border-b border-border">
                    <button
                        className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'profile'
                            ? 'border-primary text-primary bg-primary/5'
                            : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-accent/50'
                            }`}
                        onClick={() => setActiveTab('profile')}
                    >
                        Profile Details
                    </button>
                    <button
                        className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'contact'
                            ? 'border-primary text-primary bg-primary/5'
                            : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-accent/50'
                            }`}
                        onClick={() => setActiveTab('contact')}
                    >
                        Contact Information
                    </button>
                </div>

                <div className="p-6">
                    {activeTab === 'profile' ? (
                        <div className="space-y-8">
                            {/* Bio & Headline */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <h3 className="text-lg font-semibold text-foreground mb-4">About</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="text-sm font-medium text-muted-foreground mb-1">Headline</h4>
                                            <p className="text-base">{profile?.headline || 'No headline provided'}</p>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-medium text-muted-foreground mb-1">Bio</h4>
                                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{profile?.bio || 'No bio provided'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Roles */}
                                <div>
                                    <h3 className="text-lg font-semibold text-foreground mb-4">Roles & Specializations</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="text-sm font-medium text-muted-foreground mb-2">Primary Role</h4>
                                            {profile?.primaryRole ? <Badge>{profile.primaryRole}</Badge> : <p className="text-sm text-muted-foreground">Not specified</p>}
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-medium text-muted-foreground mb-2">Other Roles</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {profile?.roles && profile.roles.length > 0 ? (
                                                    profile.roles.map((role: string) => (
                                                        role !== profile?.primaryRole && <Badge key={role} variant="outline">{role}</Badge>
                                                    ))
                                                ) : (
                                                    <p className="text-sm text-muted-foreground">No other roles</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* System Info */}
                            <div className="pt-6 border-t border-border">
                                <h3 className="text-lg font-semibold text-foreground mb-4">System Information</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div>
                                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Joined Date</h4>
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
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Contact Info */}
                            <div>
                                <h3 className="text-lg font-semibold text-foreground mb-4">Contact Details</h3>
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Email Address</h4>
                                        <div className="flex items-center gap-2">
                                            <Mail className="w-4 h-4 text-muted-foreground" />
                                            <a href={`mailto:${member.email}`} className="text-primary hover:underline">{member.email}</a>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Phone Number</h4>
                                        <div className="flex items-center gap-2">
                                            <Phone className="w-4 h-4 text-muted-foreground" />
                                            {profile?.phone ? (
                                                <a href={`tel:${profile.phone}`} className="text-primary hover:underline">{profile.phone}</a>
                                            ) : (
                                                <span className="text-muted-foreground">Not provided</span>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Location</h4>
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-muted-foreground" />
                                            <span>{profile?.location || 'Not provided'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Social Links */}
                            <div>
                                <h3 className="text-lg font-semibold text-foreground mb-4">Social Media</h3>
                                <div className="space-y-4">
                                    <div className="flex flex-col gap-3">
                                        {profile?.website ? (
                                            <a href={profile.website} target="_blank" rel="noopener" className="flex items-center gap-2 text-primary hover:underline">
                                                <Globe className="w-4 h-4" /> Website
                                            </a>
                                        ) : (
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Globe className="w-4 h-4" /> Website not provided
                                            </div>
                                        )}

                                        {profile?.linkedinUrl ? (
                                            <a href={profile.linkedinUrl} target="_blank" rel="noopener" className="flex items-center gap-2 text-primary hover:underline">
                                                <Linkedin className="w-4 h-4" /> LinkedIn
                                            </a>
                                        ) : (
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Linkedin className="w-4 h-4" /> LinkedIn not provided
                                            </div>
                                        )}

                                        {profile?.twitterHandle ? (
                                            <a href={`https://twitter.com/${profile.twitterHandle.replace('@', '')}`} target="_blank" rel="noopener" className="flex items-center gap-2 text-primary hover:underline">
                                                <Twitter className="w-4 h-4" /> Twitter
                                            </a>
                                        ) : (
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Twitter className="w-4 h-4" /> Twitter not provided
                                            </div>
                                        )}

                                        {profile?.instagramHandle ? (
                                            <a href={`https://instagram.com/${profile.instagramHandle.replace('@', '')}`} target="_blank" rel="noopener" className="flex items-center gap-2 text-primary hover:underline">
                                                <Instagram className="w-4 h-4" /> Instagram
                                            </a>
                                        ) : (
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Instagram className="w-4 h-4" /> Instagram not provided
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
