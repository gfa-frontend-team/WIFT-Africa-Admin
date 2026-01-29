export enum MentorshipFormat {
    VIRTUAL = 'Virtual',
    PHYSICAL = 'Physical',
    HYBRID = 'Hybrid'
}

export enum MentorshipStatus {
    OPEN = 'Open',
    CLOSED = 'Closed'
}

export interface Mentorship {
    _id: string
    mentorName: string
    mentorRole: string
    areasOfExpertise: string[]
    mentorshipFormat: MentorshipFormat
    availability: string
    duration: string
    description: string
    eligibility: string
    status: MentorshipStatus
    chapterId?: string
    createdAt: string
    updatedAt: string
}

export interface CreateMentorshipData {
    mentorName: string
    mentorRole: string
    areasOfExpertise: string[]
    mentorshipFormat: MentorshipFormat
    availability: string
    duration: string
    description: string
    eligibility: string
    status: MentorshipStatus
    chapterId?: string
}

export interface UpdateMentorshipData extends Partial<CreateMentorshipData> { }

export interface MentorshipFilters {
    page?: number
    limit?: number
    chapterId?: string
    search?: string
}
