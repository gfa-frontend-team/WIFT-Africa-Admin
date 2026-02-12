export enum AdminRole {
    SUPER_ADMIN = 'SUPER_ADMIN',
    HQ_STAFF = 'HQ_STAFF',
    CHAPTER_ADMIN = 'CHAPTER_ADMIN',
    CHAPTER_STAFF = 'CHAPTER_STAFF',
}

export interface Admin {
    id: string
    adminId?: string // To handle both _id and adminId potential responses
    email: string
    firstName: string
    lastName: string
    role: AdminRole
    chapterId?: string | null
    isActive?: boolean
    createdAt?: string
    updatedAt?: string
}

export interface AdminAuthResponse {
    status: string
    token: string
    admin: Admin
}
