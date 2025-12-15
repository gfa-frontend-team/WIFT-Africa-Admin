import { User } from '@/types'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Mail, Calendar, Shield } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface MemberCardProps {
  member: User
}

export function MemberCard({ member }: MemberCardProps) {
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

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full text-primary font-semibold">
              {member.firstName?.[0]}{member.lastName?.[0]}
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
            <Mail className="w-4 h-4" />
            <span className={member.emailVerified ? 'text-green-600' : 'text-yellow-600'}>
              {member.emailVerified ? 'Email Verified' : 'Email Not Verified'}
            </span>
          </div>

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
        <div className="mt-4 pt-4 border-t border-border">
          <Badge variant={member.membershipStatus === 'APPROVED' ? 'success' : 'warning'}>
            {member.membershipStatus}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
