import { User } from './index'

export type JobType = 'full-time' | 'part-time' | 'contract' | 'internship' | 'volunteer'
export type JobStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED' | 'CLOSED'
export type ApplicationStatus = 'RECEIVED' | 'SHORTLISTED' | 'REJECTED' | 'HIRED' | 'WITHDRAWN'

export interface SalaryRange {
  min: number
  max: number
  currency: string
}

export interface Job {
  id: string
  title: string
  description: string
  companyName: string
  role: string
  location: string
  isRemote: boolean
  employmentType: JobType
  salaryRange?: SalaryRange
  applicationLink?: string
  status: JobStatus
  expiresAt?: string
  createdAt: string
  updatedAt: string

  // Stats (if available from backend)
  applicationCount?: number

  // Metadata
  chapterId?: string
}

export interface CreateJobData {
  title: string
  description: string
  role: string
  location: string
  isRemote: boolean
  employmentType: JobType
  companyName: string
  salaryRange?: SalaryRange
  applicationLink?: string
  chapterId?: string
}

export interface UpdateJobData extends Partial<CreateJobData> {
  status?: JobStatus
  expiresAt?: string
}

export interface JobApplication {
  id: string
  status: ApplicationStatus
  resumeUrl?: string
  coverLetter?: string
  createdAt: string
  updatedAt: string
  jobId: string
  userId: string

  // Expanded data
  user?: User
  job?: Job
  rejectionReason?: string
}

export interface JobFilters {
  page?: number
  limit?: number
  location?: string
  role?: string
  remote?: boolean
  chapterId?: string
}

export interface ApplicationFilters {
  page?: number
  limit?: number
  status?: ApplicationStatus
}
