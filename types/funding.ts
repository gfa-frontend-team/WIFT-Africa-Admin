// ============================================
// ENUMS
// ============================================

export enum FundingType {
    GRANT = 'Grant',
    FUND = 'Fund',
    LOAN = 'Loan',
    OTHER = 'Other'
}

export enum ApplicationType {
    REDIRECT = 'Redirect',
    INTERNAL = 'Internal'
}

export enum FundingStatus {
    OPEN = 'Open',
    CLOSED = 'Closed'
}

export enum TargetRole {
    PRODUCER = 'PRODUCER',
    DIRECTOR = 'DIRECTOR',
    WRITER = 'WRITER',
    ACTRESS = 'ACTRESS',
    CREW = 'CREW',
    BUSINESS = 'BUSINESS',
    ALL = 'ALL'
}

// ============================================
// INTERFACES
// ============================================

export interface FundingOpportunity {
    _id: string
    name: string
    description: string
    targetRoles: TargetRole[]       // Array of predefined roles
    customRoles?: string[]          // Optional custom roles
    fundingType: FundingType
    applicationType: ApplicationType
    applicationLink?: string
    deadline: string                // ISO Date string
    region: string

    // Optional Fields
    amount?: string                 // Funding amount or range (e.g., "$10,000 - $50,000")
    eligibility?: string            // Eligibility criteria

    // Metadata
    chapterId?: string | null
    status: FundingStatus
    createdBy: string
    viewCount: number               // Engagement tracking

    // Timestamps
    createdAt: string
    updatedAt: string

    // User-specific (only when authenticated)
    isSaved?: boolean               // Has current user saved this?
    hasApplied?: boolean            // Has current user applied?
}

export interface CreateFundingData {
    name: string
    description: string
    targetRoles: TargetRole[]       // Array of predefined roles
    customRoles?: string[]          // Optional custom roles
    fundingType: FundingType
    applicationType: ApplicationType
    applicationLink?: string
    deadline: string                // ISO Date string
    region: string

    // Optional
    amount?: string
    eligibility?: string

    // Metadata
    status?: FundingStatus
    chapterId?: string
}

export interface UpdateFundingData extends Partial<CreateFundingData> { }

export interface FundingFilters {
    page?: number
    limit?: number
    chapterId?: string
    search?: string
    fundingType?: FundingType
    status?: FundingStatus
    region?: string
    targetRole?: TargetRole         // Filter by target role
    sortBy?: 'newest' | 'oldest' | 'popular' | 'deadline'
}
