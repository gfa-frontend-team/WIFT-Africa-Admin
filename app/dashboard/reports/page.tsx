'use client'

import { useEffect, useState } from 'react'
import { reportsApi } from '@/lib/api/reports'
import { Report, ReportStatus, ReportTargetType } from '@/types'
import { ReportResolutionModal } from '@/components/reports/report-resolution-modal'
import { NativeSelect } from '@/components/ui/NativeSelect'
import { Button } from '@/components/ui/Button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import Link from 'next/link'

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(dateStr))
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [statusFilter, setStatusFilter] = useState<ReportStatus | 'ALL'>('ALL')
  const [typeFilter, setTypeFilter] = useState<ReportTargetType | 'ALL'>('ALL')
  
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null)

  const fetchReports = async () => {
    try {
      setLoading(true)
      const filters = {
        page,
        limit: 20,
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        targetType: typeFilter === 'ALL' ? undefined : typeFilter,
      }
      const response = await reportsApi.getReports(filters)
      setReports(response.data)
      setTotalPages(response.pagination.totalPages)
    } catch (error) {
      console.error('Failed to fetch reports:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReports()
  }, [page, statusFilter, typeFilter])

  const handleResolve = (id: string) => {
    setSelectedReportId(id)
  }

  const handleResolutionSuccess = () => {
    fetchReports()
    setSelectedReportId(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports & Moderation</h1>
          <p className="text-muted-foreground">Manage user reports and content moderation.</p>
        </div>
      </div>

      <div className="flex gap-4 items-center">
        <NativeSelect 
          value={statusFilter} 
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatusFilter(e.target.value as any)}
          className="w-[180px]"
        >
            <option value="ALL">All Statuses</option>
            <option value={ReportStatus.OPEN}>Open</option>
            <option value={ReportStatus.RESOLVED}>Resolved</option>
        </NativeSelect>

        <NativeSelect
          value={typeFilter}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTypeFilter(e.target.value as any)}
          className="w-[180px]"
        >
            <option value="ALL">All Types</option>
            <option value={ReportTargetType.POST}>Post</option>
            <option value={ReportTargetType.COMMENT}>Comment</option>
            <option value={ReportTargetType.USER}>User</option>
            <option value={ReportTargetType.JOB}>Job</option>
        </NativeSelect>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10">
                  Loading reports...
                </TableCell>
              </TableRow>
            ) : reports.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10">
                  No reports found matching your filters.
                </TableCell>
              </TableRow>
            ) : (
              reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>{formatDate(report.createdAt)}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{report.targetType}</Badge>
                  </TableCell>
                  <TableCell className="max-w-[300px] truncate" title={report.description}>
                    <div className="font-medium">{report.reason}</div>
                    <div className="text-sm text-muted-foreground truncate">{report.description}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={report.status === ReportStatus.OPEN ? 'destructive' : 'secondary'}>
                      {report.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                       <Link href={`/dashboard/reports/${report.id}`}>
                        <Button variant="ghost" size="sm">View Details</Button>
                      </Link>
                      {report.status === ReportStatus.OPEN && (
                        <Button size="sm" onClick={() => handleResolve(report.id)}>
                          Resolve
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination (Simple implementation) */}
      <div className="flex justify-end gap-2">
        <Button 
          variant="outline" 
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Previous
        </Button>
        <Button 
          variant="outline" 
          onClick={() => setPage(p => p + 1)}
          disabled={page >= totalPages}
        >
          Next
        </Button>
      </div>

      {selectedReportId && (
        <ReportResolutionModal
          reportId={selectedReportId}
          isOpen={!!selectedReportId}
          onClose={() => setSelectedReportId(null)}
          onResolved={handleResolutionSuccess}
        />
      )}
    </div>
  )
}
