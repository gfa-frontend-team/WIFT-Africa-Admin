import { apiClient } from './client'
import { Report, ReportFilters, PaginatedResponse, ResolveReportData } from '@/types'

export const reportsApi = {
  // Get all reports with optional filters
  getReports: async (filters?: ReportFilters): Promise<PaginatedResponse<Report>> => {
    const params = new URLSearchParams()
    if (filters?.status) params.append('status', filters.status)
    if (filters?.targetType) params.append('targetType', filters.targetType)
    if (filters?.page) params.append('page', String(filters.page))
    if (filters?.limit) params.append('limit', String(filters.limit))

    // Note: The documentation says /api/v1/admin/reports for listing
    const response = await apiClient.get<{ reports: any[]; total: number; pages: number }>(
      `/admin/reports?${params.toString()}`
    )
    
    // Transform backend response to clean Report objects
    // Backend reports array items usually have _id
    const reports = response.reports.map((report: any) => ({
      ...report,
      id: report._id || report.id,
    }))

    return {
      data: reports,
      pagination: {
        page: filters?.page || 1,
        limit: filters?.limit || 20,
        total: response.total,
        totalPages: response.pages,
      },
    }
  },

  // Get single report details
  getReport: async (id: string): Promise<Report> => {
    // Documentation says /api/v1/admin/reports/:reportId
    const response = await apiClient.get<Report>(`/admin/reports/${id}`)
    return {
      ...response,
      id: (response as any)._id || response.id,
    }
  },

  // Resolve a report
  resolveReport: async (id: string, data: ResolveReportData): Promise<void> => {
    // Documentation says PATCH /api/v1/admin/reports/:reportId/resolve
    await apiClient.patch(
      `/admin/reports/${id}/resolve`,
      data
    )
  },
}
