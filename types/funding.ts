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

export interface FundingOpportunity {
    _id: string
    name: string
    description: string
    role: string
    fundingType: FundingType
    applicationType: ApplicationType
    applicationLink?: string
    deadline: string // ISO Date string
    region: string
    chapterId?: string | null
    status: FundingStatus
    createdBy: string
    createdAt: string
    updatedAt: string
}

export interface CreateFundingData {
    name: string
    description: string
    role: string
    fundingType: FundingType
    applicationType: ApplicationType
    applicationLink?: string
    deadline: string // ISO Date string
    region: string
    status?: FundingStatus
    chapterId?: string
}

export interface UpdateFundingData extends Partial<CreateFundingData> { }

export interface FundingFilters {
    page?: number
    limit?: number
    chapterId?: string
    search?: string
}
