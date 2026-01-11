import { apiClient } from './client'
import { 
  ApiResponse, 
  PaginatedResponse, 
  Job, 
  CreateJobData, 
  UpdateJobData,
  JobFilters,
  JobApplication,
  ApplicationFilters
} from '@/types'

// Helper to map backend _id to frontend id
const mapJob = (data: any): Job => ({
  ...data,
  id: data._id || data.id,
})

const mapApplication = (data: any): JobApplication => {
  const user = data.applicant || data.user
  return {
    ...data,
    id: data._id || data.id,
    status: data.status?.toUpperCase(), // Normalize to uppercase
    user: user ? {
      ...user,
      id: user._id || user.id
    } : undefined,
    job: data.job ? (typeof data.job === 'string' ? { id: data.job } : {
      ...data.job,
      id: data.job._id || data.job.id
    }) : undefined
  }
}

export const jobsApi = {
  // Jobs
  getJobs: async (filters: JobFilters = {}): Promise<PaginatedResponse<Job>> => {
    const params = new URLSearchParams()
    if (filters.page) params.append('page', filters.page.toString())
    if (filters.limit) params.append('limit', filters.limit.toString())
    if (filters.location) params.append('location', filters.location)
    if (filters.role) params.append('role', filters.role)
    if (filters.remote !== undefined) params.append('remote', filters.remote.toString())

    const response = await apiClient.get<any>(`/jobs?${params.toString()}`)
    
    return {
      data: (response.data || []).map(mapJob),
      pagination: {
        page: response.page || 1,
        limit: filters.limit || 10,
        total: response.results || 0, // backend uses 'results' for total count in list endpoint
        totalPages: Math.ceil((response.results || 0) / (filters.limit || 10))
      }
    }
  },

  getJob: async (id: string): Promise<Job> => {
    const response = await apiClient.get<any>(`/jobs/${id}`)
    const data = response.data || response
    return mapJob(data)
  },

  createJob: async (data: CreateJobData): Promise<Job> => {
    const response = await apiClient.post<any>('/jobs', data)
    return mapJob(response.data || response)
  },

  updateJob: async (id: string, data: UpdateJobData): Promise<Job> => {
    const response = await apiClient.patch<any>(`/jobs/${id}`, data)
    return mapJob(response.data || response)
  },

  deleteJob: async (id: string): Promise<void> => {
    await apiClient.delete(`/jobs/${id}`)
  },

  // Applications
  getJobApplications: async (jobId: string, filters: ApplicationFilters = {}): Promise<PaginatedResponse<JobApplication>> => {
    const params = new URLSearchParams()
    if (filters.page) params.append('page', filters.page.toString())
    if (filters.limit) params.append('limit', filters.limit.toString())
    if (filters.status) params.append('status', filters.status)

    const response = await apiClient.get<any>(`/job-applications/admin/jobs/${jobId}/applications?${params.toString()}`)
    
    return {
      data: (response.applications || []).map(mapApplication),
      pagination: {
        page: response.page || 1,
        limit: filters.limit || 20,
        total: response.total || 0,
        totalPages: response.pages || 1
      }
    }
  },

  updateApplicationStatus: async (applicationId: string, status: string, rejectionReason?: string): Promise<JobApplication> => {
    const response = await apiClient.patch<any>(`/job-applications/admin/${applicationId}/status`, {
      status,
      rejectionReason
    })
    return mapApplication(response.data || response) // API might return partial object, check docs
  }
}
