import Link from 'next/link'
import { User } from '@/types'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Mail, Calendar, Shield } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { useRouter } from 'next/navigation'

interface MemberCardProps {
  member: User
  onClick?: () => void
}

export function MemberCard({ member, onClick }: MemberCardProps) {
  const getAccountTypeBadge = (accountType: string) => {
    switch (accountType) {
      case 'SUPER_ADMIN':
        return <Badge variant="danger">Super Admin</Badge>
      case 'CHAPTER_ADMIN':
        return <Badge variant="warning">Chapter Admin</Badge>
      case 'HQ_MEMBER':
        return <Badge variant="info">HQ Member</Badge>
      default:
        return <Badge variant="default">Member</Badge>
    }
  }

  const router = useRouter()

  const handleCardClick = (e: React.MouseEvent) => {
  
    onClick?.();
      router.push(`/dashboard/members/${member.id}`)
    
  }

  return (
    <Card
      className={`relative hover:shadow-md transition-shadow ${onClick ? 'cursor-pointer hover:border-primary/50' : ''}`}
      onClick={handleCardClick}
    >
      <Link href={`/dashboard/members/${member.id}`} className="absolute inset-0 z-10" />
      <CardContent className="p-6 relative">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full text-primary font-semibold overflow-hidden">
              {member.profilePhoto ? (
                <img src={member.profilePhoto} alt="" className="w-full h-full object-cover" />
              ) : (
                <span>{member.firstName?.[0]}{member.lastName?.[0]}</span>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-foreground">
                {member.firstName} {member.lastName}
              </h3>
              <p className="text-sm text-muted-foreground">{member.email}</p>
            </div>
          </div>
        </div>

        {/* Account Type */}
        <div className="mb-4">
          {getAccountTypeBadge(member.accountType)}
        </div>

        {/* Details */}
        <div className="space-y-2 text-sm">


          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>Joined {formatDate(member.createdAt)}</span>
          </div>

          {member.lastLoginAt && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Shield className="w-4 h-4" />
              <span>Last login {formatDate(member.lastLoginAt)}</span>
            </div>
          )}
        </div>

        {/* Status */}
        <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
          <Badge variant={
            member.membershipStatus === 'APPROVED' ? 'success' :
              member.membershipStatus === 'SUSPENDED' ? 'destructive' :
                'warning'
          }>
            {member.membershipStatus}
          </Badge>

          {onClick && (
            <span className="text-xs text-primary font-medium hover:underline">
              View Profile
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
