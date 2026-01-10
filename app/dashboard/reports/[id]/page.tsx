'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { reportsApi } from '@/lib/api/reports'
import { Report, ReportStatus } from '@/types'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Separator } from '@/components/ui/Separator'
import { ArrowLeft, User, ShieldAlert, CheckCircle } from 'lucide-react'
import { ReportResolutionModal } from '@/components/reports/report-resolution-modal'

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric' }).format(new Date(dateStr))
}

export default function ReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  // React 19 introduced `use` for consuming promises
  const { id } = use(params)
  
  const [report, setReport] = useState<Report | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false)

  const fetchReport = async () => {
    try {
      setLoading(true)
      const data = await reportsApi.getReport(id)
      setReport(data)
    } catch (err) {
      setError('Failed to load report details.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReport()
  }, [id])

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Loading report details...</div>
  }

  if (error || !report) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-semibold mb-2">Error</h2>
        <p className="text-muted-foreground mb-4">{error || 'Report not found'}</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Report Details</h1>
          <p className="text-muted-foreground text-sm">ID: {report.id}</p>
        </div>
        <div className="ml-auto">
          {report.status === ReportStatus.OPEN ? (
            <Button onClick={() => setIsResolveModalOpen(true)}>
              Resolve Report
            </Button>
          ) : (
             <Badge variant="secondary" className="px-3 py-1">
               Resolved
             </Badge>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Report Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
               <ShieldAlert className="h-5 w-5 text-destructive" />
               Violation Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">Reason</div>
              <div className="text-lg font-medium">{report.reason}</div>
            </div>
            {report.description && (
              <div>
                 <div className="text-sm font-medium text-muted-foreground mb-1">Description</div>
                 <p className="text-sm leading-relaxed">{report.description}</p>
              </div>
            )}
            <Separator />
            <div className="grid grid-cols-2 gap-4">
               <div>
                 <div className="text-sm font-medium text-muted-foreground">Type</div>
                 <Badge variant="outline" className="mt-1">{report.targetType}</Badge>
               </div>
               <div>
                 <div className="text-sm font-medium text-muted-foreground">Submitted</div>
                 <div className="text-sm mt-1">{formatDate(report.createdAt)}</div>
               </div>
            </div>
          </CardContent>
        </Card>

        {/* Reporter Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Reporter Information
            </CardTitle>
          </CardHeader>
          <CardContent>
             {report.reporter ? (
               <div className="flex items-center gap-4">
                 {report.reporter.profilePhoto ? (
                    <img src={report.reporter.profilePhoto} alt="Reporter" className="w-12 h-12 rounded-full object-cover" />
                 ) : (
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                       <User className="h-6 w-6 text-slate-400" />
                    </div>
                 )}
                 <div>
                    <div className="font-medium">{report.reporter.firstName} {report.reporter.lastName}</div>
                    <div className="text-sm text-muted-foreground">{report.reporter.email}</div>
                 </div>
               </div>
             ) : (
               <div className="text-sm text-muted-foreground italic">Anonymous or User ID: {report.reporterId}</div>
             )}
          </CardContent>
        </Card>

        {/* Target Content Snapshot (Placeholder for now) */}
        <Card className="md:col-span-2">
          <CardHeader>
             <CardTitle>Reported Content</CardTitle>
             <CardDescription>Target ID: {report.targetId}</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="bg-slate-50 p-6 rounded-md border flex flex-col items-center justify-center text-muted-foreground min-h-[150px]">
                <ShieldAlert className="h-8 w-8 mb-2 opacity-50" />
                <p>Preview for {report.targetType} content is not yet implemented.</p>
                <p className="text-xs">Target ID: {report.targetId}</p>
             </div>
          </CardContent>
        </Card>

        {/* Resolution Info (if resolved) */}
        {report.status === ReportStatus.RESOLVED && (
           <Card className="md:col-span-2 border-green-200 bg-green-50/50">
             <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-800">
                   <CheckCircle className="h-5 w-5" />
                   Resolution Details
                </CardTitle>
             </CardHeader>
             <CardContent>
               {report.resolutionNote && (
                 <div className="mb-2">
                    <span className="font-medium text-green-900">Note: </span>
                    <span className="text-green-800">{report.resolutionNote}</span>
                 </div>
               )}
               <div className="text-xs text-green-700 mt-2">
                 Resolved at: {report.resolvedAt ? formatDate(report.resolvedAt) : 'N/A'}
               </div>
             </CardContent>
           </Card>
        )}
      </div>

      <ReportResolutionModal
        reportId={report.id}
        isOpen={isResolveModalOpen}
        onClose={() => setIsResolveModalOpen(false)}
        onResolved={() => {
           fetchReport()
           setIsResolveModalOpen(false)
        }}
      />
    </div>
  )
}
