'use client'

import { useState } from 'react'
import { jobsApi } from '@/lib/api/jobs'
import { useJobs, useDeleteJob } from '@/lib/hooks/queries/useJobs'
import { Job, JobFilters } from '@/types'
import { Button } from '@/components/ui/Button'
import { Plus, Search, MapPin, Briefcase, DollarSign, Calendar, Eye, Edit, Trash2 } from 'lucide-react'
import { usePermissions } from '@/lib/hooks/usePermissions'
import { JobFormModal } from '@/components/jobs/job-form-modal'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/Card'
import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import { useToast } from '@/components/ui/use-toast'

export default function JobsPage() {
  const { isChapterAdmin, isSuperAdmin, userChapterId } = usePermissions()
  const canManage = isChapterAdmin || isSuperAdmin
  const { toast } = useToast()

  const [filters, setFilters] = useState<JobFilters>({
    page: 1,
    limit: 10,
    chapterId: isChapterAdmin ? userChapterId || undefined : undefined
  })

  // Data Fetching
  const { data: jobsResponse, isLoading } = useJobs(filters)
  const jobs = jobsResponse?.data || []

  console.log(jobs,'jobs')

  // Mutations
  const { mutateAsync: deleteJob } = useDeleteJob()

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this job?')) {
      try {
        await deleteJob(id)
        toast({ title: 'Success', description: 'Job deleted successfully' })
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error?.response?.data?.message || 'Failed to delete job',
          variant: 'destructive'
        })
      }
    }
  }

  const handleEdit = (job: Job) => {
    setSelectedJob(job)
    setIsFormOpen(true)
  }

  const handleCreate = () => {
    setSelectedJob(null)
    setIsFormOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isChapterAdmin ? 'My Posted Jobs' : 'Jobs Board'}
          </h1>
          <p className="text-muted-foreground">Manage job postings and opportunities.</p>
        </div>
        {canManage && (
          <Button onClick={handleCreate} className='text-white'>
            <Plus className="mr-2 h-4 w-4" /> Post a Job
          </Button>
        )}
      </div>

      {/* Filters (MVP: Just search) */}
      <div className="bg-card p-4 rounded-lg border flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            className="w-full bg-background border px-9 py-2 rounded-md"
            placeholder="Search by role or location..."
            onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">Loading jobs...</div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">No active job postings found.</div>
      ) : (
        <div className="grid gap-6">
          {jobs.map((job) => (
            <Card key={job.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl text-primary">{job.title}</CardTitle>
                    <h3 className="font-semibold text-lg">{job.companyName}</h3>
                  </div>
                  <Badge variant={job.status === 'ACTIVE' ? 'default' : 'secondary'}>
                    {job.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 p-5">
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Briefcase className="h-4 w-4" /> <span className="capitalize">{job.employmentType}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" /> {job.location} {job.isRemote && '(Remote)'}
                  </div>
                  {job.salaryRange && (
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      {job.salaryRange.currency} {job.salaryRange.min.toLocaleString()} - {job.salaryRange.max.toLocaleString()}
                    </div>
                  )}
                </div>
                <p className="line-clamp-2 text-sm">{job.description}</p>
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-4">
                <div className="text-xs text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-3 w-3" /> Posted: {new Date(job.createdAt).toLocaleDateString()}
                </div>
                <div className="flex gap-2">
                  {canManage && (
                    <>
                      <Button size="sm" variant="outline" onClick={() => handleEdit(job)}>
                        <Edit className="h-4 w-4 mr-1" /> Edit
                      </Button>
                      <Link href={`/dashboard/jobs/${job.id}/applications`}>
                        <Button size="sm" variant="secondary">
                          <Eye className="h-4 w-4 mr-1" /> Applications
                        </Button>
                      </Link>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(job.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <JobFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={() => { }} // Query invalidation handles refresh
        job={selectedJob}
      />
    </div>
  )
}
