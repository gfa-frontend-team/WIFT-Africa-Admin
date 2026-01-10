export enum ReportStatus {
  OPEN = 'OPEN',
  RESOLVED = 'RESOLVED',
}

export enum ReportTargetType {
  POST = 'POST',
  COMMENT = 'COMMENT',
  USER = 'USER',
  JOB = 'JOB',
}

export interface Report {
  id: string
  reporterId: string
  targetType: ReportTargetType
  targetId: string
  reason: string
  description?: string
  status: ReportStatus
  resolutionNote?: string
  resolvedBy?: string
  resolvedAt?: string
  createdAt: string
  updatedAt: string
  
  // Optional populated fields depending on backend response
  reporter?: {
    id: string
    firstName: string
    lastName: string
    email: string
    profilePhoto?: string
  }
}

export interface ReportFilters {
  status?: ReportStatus
  targetType?: ReportTargetType
  page?: number
  limit?: number
}

export interface ResolveReportData {
  resolutionNote?: string
}
