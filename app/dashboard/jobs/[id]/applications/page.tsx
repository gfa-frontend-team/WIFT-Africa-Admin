'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useJob, useJobApplications } from '@/lib/hooks/queries/useJobs'
import { Job, JobApplication } from '@/types'
import { Button } from '@/components/ui/Button'
import { ArrowLeft, Download, Mail, Calendar, User as UserIcon } from 'lucide-react'
import { ApplicationStatusModal } from '@/components/jobs/application-status-modal'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar'

export default function JobApplicationsPage() {
  const params = useParams()
  const router = useRouter()
  const jobId = params.id as string

  // Queries
  const { data: job, isLoading: isJobLoading } = useJob(jobId)
  const { data: applicationsResponse, isLoading: isAppsLoading } = useJobApplications(jobId)
  const applications = applicationsResponse?.data || []
  
  const loading = isJobLoading || isAppsLoading

  // Modals
  const [isStatusOpen, setIsStatusOpen] = useState(false)
  const [selectedApp, setSelectedApp] = useState<JobApplication | null>(null)

  const handleUpdateStatus = (app: JobApplication) => {
    setSelectedApp(app)
    setIsStatusOpen(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'HIRED': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'SHORTLISTED': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'REJECTED': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
    }
  }

  if (loading) return <div className="text-center py-12">Loading applications...</div>
  if (!job) return <div className="text-center py-12">Job not found</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Jobs
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Applications</h1>
          <p className="text-muted-foreground">
            For role: <span className="font-semibold text-foreground">{job.title}</span> at {job.companyName}
          </p>
        </div>
        <div className="text-sm text-muted-foreground bg-muted px-4 py-2 rounded-md">
          Total Applications: {applications.length}
        </div>
      </div>

      {applications.length === 0 ? (
        <div className="text-center py-12 bg-muted/10 rounded-lg border border-dashed">
          <UserIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">No applications yet</h3>
          <p className="text-muted-foreground">Candidates currently applying will appear here.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {applications.map((app) => (
            <Card key={app.id}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  <div className="flex gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={app.user?.profilePhoto} />
                      <AvatarFallback>{app.user?.firstName?.[0]}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                       <h3 className="font-semibold text-lg hover:underline cursor-pointer">
                         {app.user?.firstName} {app.user?.lastName}
                       </h3>
                       <div className="flex items-center gap-4 text-sm text-muted-foreground">
                         <div className="flex items-center gap-1">
                           <Mail className="h-3 w-3" /> {app.user?.email}
                         </div>
                         <div className="flex items-center gap-1">
                           <Calendar className="h-3 w-3" /> Applied: {new Date(app.createdAt).toLocaleDateString()}
                         </div>
                       </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-3">
                    <Badge className={getStatusColor(app.status)} variant="outline">
                      {app.status}
                    </Badge>
                    <div className="flex gap-2">
                      {app.resumeUrl && (
                        <a href={app.resumeUrl} target="_blank" rel="noopener noreferrer">
                          <Button size="sm" variant="outline">
                            <Download className="h-4 w-4 mr-2" /> Resume
                          </Button>
                        </a>
                      )}
                      <Button size="sm" onClick={() => handleUpdateStatus(app)}>
                         Update Status
                      </Button>
                    </div>
                  </div>
                </div>
                
                {app.coverLetter && (
                  <div className="mt-4 p-4 bg-muted rounded-md text-sm">
                    <h4 className="font-semibold mb-1 text-xs uppercase text-muted-foreground">Cover Letter</h4>
                    <p>{app.coverLetter}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ApplicationStatusModal 
        isOpen={isStatusOpen}
        onClose={() => setIsStatusOpen(false)}
        onSuccess={() => {}} // Query invalidation handles refresh
        application={selectedApp}
      />
    </div>
  )
}
