'use client'

import { useEffect, useState } from 'react'
import { AlertCircle, RefreshCw, CheckCircle } from 'lucide-react'
import { useVerificationStore } from '@/lib/stores'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { StatCard } from '@/components/dashboard/StatCard'
import { RoleGuard } from '@/lib/guards/RoleGuard'
import { Permission } from '@/lib/constants/permissions'

export default function VerificationPage() {
  const { delayedStats, isLoading, fetchDelayedStats, triggerDelayCheck } = useVerificationStore()
  const [checkResult, setCheckResult] = useState<{ processed: number; errors: number } | null>(null)

  useEffect(() => {
    fetchDelayedStats()
  }, [fetchDelayedStats])

  const handleTriggerCheck = async () => {
    try {
      const result = await triggerDelayCheck()
      setCheckResult(result)
      // Refresh stats after check
      setTimeout(() => fetchDelayedStats(), 1000)
    } catch (error) {
      console.error('Failed to trigger delay check:', error)
    }
  }

  return (
    <RoleGuard requiredPermission={Permission.MANAGE_VERIFICATION}>
      <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Verification Delays
        </h1>
        <p className="text-muted-foreground">
          Monitor and manage delayed membership verification requests
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <StatCard
          title="Total Delayed"
          value={delayedStats?.total || 0}
          icon={AlertCircle}
        />
        <StatCard
          title="Notified"
          value={delayedStats?.notified || 0}
          icon={CheckCircle}
        />
        <StatCard
          title="Not Notified"
          value={delayedStats?.notNotified || 0}
          icon={AlertCircle}
        />
      </div>

      {/* Manual Trigger */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Manual Delay Check</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Manually trigger the verification delay checker. This will send notification emails
            to users whose membership requests have been pending for more than 7 days.
          </p>
          <Button
            onClick={handleTriggerCheck}
            isLoading={isLoading}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Trigger Delay Check
          </Button>

          {checkResult && (
            <div className="mt-4 p-4 bg-accent rounded-lg">
              <p className="text-sm font-medium text-foreground">
                Check completed successfully
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Processed: {checkResult.processed} requests
              </p>
              {checkResult.errors > 0 && (
                <p className="text-sm text-destructive mt-1">
                  Errors: {checkResult.errors}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Information */}
      <Card>
        <CardHeader>
          <CardTitle>About Verification Delays</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            Membership requests are expected to be reviewed within 7 days. When a request
            exceeds this timeframe, it's marked as delayed.
          </p>
          <p>
            The system automatically checks for delayed requests daily at 9:00 AM and sends
            notification emails to affected users.
          </p>
          <p>
            You can also manually trigger the delay check using the button above to immediately
            process any pending notifications.
          </p>
        </CardContent>
      </Card>
      </div>
    </RoleGuard>
  )
}
