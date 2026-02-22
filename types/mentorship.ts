// ============================================
// ENUMS
// ============================================

export enum MentorshipFormat {
    VIRTUAL = 'Virtual',
    PHYSICAL = 'Physical',
    HYBRID = 'Hybrid'
}

export enum MentorshipStatus {
    OPEN = 'Open',
    CLOSED = 'Closed'
}

export enum DayOfWeek {
    MONDAY = 'Monday',
    TUESDAY = 'Tuesday',
    WEDNESDAY = 'Wednesday',
    THURSDAY = 'Thursday',
    FRIDAY = 'Friday',
    SATURDAY = 'Saturday',
    SUNDAY = 'Sunday'
}

// ============================================
// INTERFACES
// ============================================

export interface Mentorship {
    _id: string
    mentorName: string
    mentorRole: string
    areasOfExpertise: string[]
    mentorshipFormat: MentorshipFormat

    // Schedule Information (NEW)
    startPeriod: string             // ISO date string
    endPeriod: string               // ISO date string
    days: DayOfWeek[]               // e.g., ["Monday", "Wednesday", "Friday"]
    timeFrame: string               // e.g., "12:30pm - 3:00pm"
    timezone?: string               // e.g., "Africa/Lagos"

    // Optional Fields
    mentorshipLink?: string         // URL for virtual meetings
    description: string
    eligibility?: string            // Now optional

    // Metadata
    chapterId?: string | null       // null = global mentorship
    createdBy: string               // Admin who created it
    status: MentorshipStatus
    viewCount: number               // Engagement tracking

    // Timestamps
    createdAt: string
    updatedAt: string

    // User-specific (only when authenticated)
    isSaved?: boolean               // Has current user saved this?
    hasApplied?: boolean            // Has current user applied?
}

export interface CreateMentorshipData {
    mentorName: string
    mentorRole: string
    areasOfExpertise: string[]
    mentorshipFormat: MentorshipFormat

    // Schedule (NEW)
    startPeriod: string
    endPeriod: string
    days: DayOfWeek[]
    timeFrame: string
    timezone?: string

    // Optional
    mentorshipLink?: string
    description: string
    eligibility?: string

    // Metadata
    chapterId?: string
    status?: MentorshipStatus       // Optional, defaults to "Open"
}

export interface UpdateMentorshipData extends Partial<CreateMentorshipData> { }

export interface MentorshipFilters {
    page?: number
    limit?: number
    chapterId?: string
    search?: string
    format?: MentorshipFormat
    role?: string
    expertise?: string
    days?: DayOfWeek
    status?: MentorshipStatus
    sortBy?: 'newest' | 'oldest' | 'popular' | 'startDate'
}
