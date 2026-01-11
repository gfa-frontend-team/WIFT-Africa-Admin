import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { jobsApi } from '@/lib/api/jobs'
import { Job, CreateJobData, UpdateJobData, JobFilters, ApplicationFilters } from '@/types'

export const jobsKeys = {
  all: ['jobs'] as const,
  lists: () => [...jobsKeys.all, 'list'] as const,
  list: (filters: JobFilters) => [...jobsKeys.lists(), filters] as const,
  details: () => [...jobsKeys.all, 'detail'] as const,
  detail: (id: string) => [...jobsKeys.details(), id] as const,
  applications: (jobId: string, filters: ApplicationFilters) => [...jobsKeys.detail(jobId), 'applications', filters] as const,
}

// Queries
export function useJobs(filters: JobFilters = {}) {
  return useQuery({
    queryKey: jobsKeys.list(filters),
    queryFn: () => jobsApi.getJobs(filters),
  })
}

export function useJob(id: string) {
  return useQuery({
    queryKey: jobsKeys.detail(id),
    queryFn: () => jobsApi.getJob(id),
    enabled: !!id,
  })
}

export function useJobApplications(jobId: string, filters: ApplicationFilters = {}) {
  return useQuery({
    queryKey: jobsKeys.applications(jobId, filters),
    queryFn: () => jobsApi.getJobApplications(jobId, filters),
    enabled: !!jobId,
  })
}

// Mutations
export function useCreateJob() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: CreateJobData) => jobsApi.createJob(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobsKeys.lists() })
    },
  })
}

export function useUpdateJob() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateJobData }) => 
      jobsApi.updateJob(id, data),
    onSuccess: (updatedJob) => {
      queryClient.invalidateQueries({ queryKey: jobsKeys.lists() })
      queryClient.invalidateQueries({ queryKey: jobsKeys.detail(updatedJob.id) })
    },
  })
}

export function useDeleteJob() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => jobsApi.deleteJob(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: jobsKeys.lists() })
      queryClient.invalidateQueries({ queryKey: jobsKeys.detail(id) })
    },
  })
}

export function useUpdateApplicationStatus() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, status, rejectionReason }: { id: string; status: string; rejectionReason?: string }) => 
      jobsApi.updateApplicationStatus(id, status, rejectionReason),
    onSuccess: (updatedApp) => {
       // Invalidate specific job applications
       queryClient.invalidateQueries({ 
         queryKey: jobsKeys.detail(updatedApp.jobId) 
       })
    },
  })
}
