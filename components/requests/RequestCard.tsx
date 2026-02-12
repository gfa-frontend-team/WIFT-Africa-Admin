import { MembershipRequest } from '@/types'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { User, Mail, Phone, Calendar, Clock, AlertCircle } from 'lucide-react'
import { formatDate, formatRelativeTime } from '@/lib/utils'

interface RequestCardProps {
  request: MembershipRequest
  onApprove: (request: MembershipRequest) => void
  onReject: (request: MembershipRequest) => void
}

export function RequestCard({ request, onApprove, onReject }: RequestCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full">
              <User className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">
                {request.user?.firstName} {request.user?.lastName}
              </h3>
              <p className="text-sm text-muted-foreground">{request.user?.email}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge variant={request.memberType === 'NEW' ? 'info' : 'default'}>
              {request.memberType}
            </Badge>
            {request.isDelayed && (
              <Badge variant="warning">
                <AlertCircle className="w-3 h-3 mr-1" />
                Delayed
              </Badge>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="space-y-2 mb-4">
          {request.phoneNumber && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="w-4 h-4" />
              <span>{request.phoneNumber}</span>
            </div>
          )}

          {request.membershipId && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Membership ID:</span>
              <span className="font-medium text-foreground">{request.membershipId}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>Requested {formatRelativeTime(request.createdAt)}</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className={request.isDelayed ? 'text-warning font-medium' : 'text-muted-foreground'}>
              Waiting {request.daysWaiting} days
            </span>
          </div>

          {request.delayNotificationSent && (
            <div className="text-sm text-muted-foreground">
              <AlertCircle className="w-4 h-4 inline mr-1" />
              Delay notification sent
            </div>
          )}
        </div>

        {/* Additional Info */}
        {request.additionalInfo && (
          <div className="mb-4 p-3 bg-accent rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Additional Information:</p>
            <p className="text-sm text-foreground">{request.additionalInfo}</p>
          </div>
        )}

        {/* Request Message */}
        {request.requestMessage && (
          <div className="mb-4 p-3 bg-accent rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Message:</p>
            <p className="text-sm text-foreground">{request.requestMessage}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-4 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.href = `/dashboard/requests/${request.user?.id}`}
            className="flex-1"
          >
            View Details
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => onApprove(request)}
            className="flex-1"
          >
            Approve
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onReject(request)}
            className="flex-1"
          >
            Reject
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
