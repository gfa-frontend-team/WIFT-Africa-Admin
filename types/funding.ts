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

// ============================================
// INTERFACES
// ============================================

export interface FundingOpportunity {
    _id: string
    name: string
    description: string
    role: string
    fundingType: FundingType
    applicationType: ApplicationType
    applicationLink?: string
    deadline: string                // ISO Date string
    region: string

    // Optional Fields (NEW)
    amount?: string                 // Funding amount or range (e.g., "$10,000 - $50,000")
    eligibility?: string            // Eligibility criteria

    // Metadata
    chapterId?: string | null
    status: FundingStatus
    createdBy: string
    viewCount: number               // Engagement tracking (NEW)

    // Timestamps
    createdAt: string
    updatedAt: string

    // User-specific (only when authenticated) (NEW)
    isSaved?: boolean               // Has current user saved this?
    hasApplied?: boolean            // Has current user applied?
}

export interface CreateFundingData {
    name: string
    description: string
    role: string
    fundingType: FundingType
    applicationType: ApplicationType
    applicationLink?: string
    deadline: string                // ISO Date string
    region: string

    // Optional (NEW)
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
    sortBy?: 'newest' | 'oldest' | 'popular' | 'deadline'
}
