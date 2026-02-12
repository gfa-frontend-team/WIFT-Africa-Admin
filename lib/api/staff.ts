import { apiClient } from './client'
import { Admin, AdminRole } from '@/types'

const BASE_PATH = '/admin/staff'

export interface CreateAdminData {
    email: string
    firstName: string
    lastName: string
    role: AdminRole
    chapterId?: string
    password?: string
    isActive?: boolean
}

export interface UpdateAdminData {
    firstName?: string
    lastName?: string
    role?: AdminRole
    chapterId?: string
    isActive?: boolean
}

interface GetAdminsParams {
    role?: AdminRole
    chapterId?: string
    page?: number
    limit?: number
}

interface GetAdminsResponse {
    count: number
    admins: Admin[]
}

export const staffApi = {
    getAdmins: async (params?: GetAdminsParams) => {
        const response = await apiClient.get<GetAdminsResponse>(BASE_PATH, { params })
        // Transform _id to id
        const transformedAdmins = response.admins.map((admin: any) => ({
            ...admin,
            id: admin._id || admin.id || admin.adminId
        }))
        return { ...response, admins: transformedAdmins }
    },

    getAdmin: async (id: string) => {
        const response = await apiClient.get<{ admin: Admin }>(`${BASE_PATH}/${id}`)
        return response.admin
    },

    createAdmin: async (data: CreateAdminData) => {
        const response = await apiClient.post<{ message: string; admin: Admin }>(BASE_PATH, data)
        return response
    },

    updateAdmin: async (id: string, data: UpdateAdminData) => {
        const response = await apiClient.patch<{ message: string; admin: Admin }>(`${BASE_PATH}/${id}`, data)
        return response
    },

    deleteAdmin: async (id: string) => {
        const response = await apiClient.delete<{ message: string }>(`${BASE_PATH}/${id}`)
        return response
    }
}
