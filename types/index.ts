// Core types matching backend models
export * from './reports'
export * from './analytics'
export * from './messages'
export * from './posts'
export * from './jobs'


// ============================================
// USER & AUTH TYPES
// ============================================

export enum AccountType {
  CHAPTER_MEMBER = 'CHAPTER_MEMBER',
  HQ_MEMBER = 'HQ_MEMBER',
  CHAPTER_ADMIN = 'CHAPTER_ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

export enum MembershipStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  SUSPENDED = 'SUSPENDED',
}

export enum AuthProvider {
  LOCAL = 'LOCAL',
  GOOGLE = 'GOOGLE',
  LINKEDIN = 'LINKEDIN',
}

export enum MemberType {
  NEW = 'NEW',
  EXISTING = 'EXISTING',
}

// ============================================
// EVENT TYPES
// ============================================

export enum EventType {
  WORKSHOP = 'WORKSHOP',
  SCREENING = 'SCREENING',
  NETWORKING = 'NETWORKING',
  MEETUP = 'MEETUP',
  CONFERENCE = 'CONFERENCE',
  OTHER = 'OTHER',
}

export enum LocationType {
  PHYSICAL = 'PHYSICAL',
  VIRTUAL = 'VIRTUAL',
  HYBRID = 'HYBRID',
}

export enum RSVPStatus {
  GOING = 'GOING',
  INTERESTED = 'INTERESTED',
  NOT_GOING = 'NOT_GOING',
}

export enum EventStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  profilePhoto?: string
  authProvider: AuthProvider
  emailVerified: boolean
  accountType: AccountType
  membershipStatus: MembershipStatus
  onboardingComplete: boolean
  onboardingStep: number
  termsAccepted: boolean
  termsAcceptedAt?: Date
  chapterId?: string
  memberType?: MemberType
  lastLoginAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface AuthResponse {
  user: User
  tokens: AuthTokens
}

// ============================================
// PROFILE & ROLES
// ============================================

export enum Role {
  PRODUCER = 'PRODUCER',
  DIRECTOR = 'DIRECTOR',
  WRITER = 'WRITER',
  ACTRESS = 'ACTRESS',
  CREW = 'CREW',
  BUSINESS = 'BUSINESS',
}

export enum WriterSpecialization {
  TV = 'TV',
  FILM = 'FILM',
  BOTH = 'BOTH',
}

export enum CrewSpecialization {
  CINEMATOGRAPHER = 'CINEMATOGRAPHER',
  EDITOR = 'EDITOR',
  COMPOSER = 'COMPOSER',
  SOUND_DESIGNER = 'SOUND_DESIGNER',
  PRODUCTION_DESIGNER = 'PRODUCTION_DESIGNER',
  COSTUME_DESIGNER = 'COSTUME_DESIGNER',
  MAKEUP_ARTIST = 'MAKEUP_ARTIST',
  GAFFER = 'GAFFER',
}

export enum BusinessSpecialization {
  ENTERTAINMENT_LAW = 'ENTERTAINMENT_LAW',
  DISTRIBUTION = 'DISTRIBUTION',
  FINANCE = 'FINANCE',
  MARKETING = 'MARKETING',
  REPRESENTATION = 'REPRESENTATION',
  PUBLIC_RELATIONS = 'PUBLIC_RELATIONS',
}

export interface Profile {
  id: string
  userId: string
  roles: Role[]
  primaryRole: Role
  isMultihyphenate: boolean
  writerSpecialization?: WriterSpecialization
  crewSpecialization?: CrewSpecialization
  businessSpecialization?: BusinessSpecialization
  headline?: string
  bio?: string
  skills: string[]
  location?: string
  portfolioLinks: string[]
  website?: string
  imdbUrl?: string
  linkedinUrl?: string
  instagramHandle?: string
  twitterHandle?: string
  createdAt: Date
  updatedAt: Date
}

// ============================================
// CHAPTER
// ============================================

export interface Chapter {
  id: string
  name: string
  code: string
  country: string
  city?: string
  description?: string
  missionStatement?: string
  memberCount: number
  isActive: boolean
  adminIds: string[] | User[]
  
  // Leadership
  currentPresident?: string
  presidentEmail?: string
  presidentPhone?: string
  
  // Contact
  email?: string
  phone?: string
  address?: string
  website?: string
  
  // Social Media
  facebookUrl?: string
  twitterHandle?: string
  instagramHandle?: string
  linkedinUrl?: string
  
  // Metadata
  foundedDate?: Date
  
  createdAt: Date
  updatedAt: Date
  
  // Stats (only in detail view)
  stats?: ChapterDetailStats
}

// ============================================
// MEMBERSHIP REQUEST
// ============================================

export interface MembershipRequest {
  id: string
  userId: string
  chapterId: string
  status: MembershipStatus
  requestMessage?: string
  reviewedAt?: Date
  reviewedBy?: string
  reviewNotes?: string
  memberType: MemberType
  membershipId?: string
  phoneNumber?: string
  additionalInfo?: string
  expectedReviewDate: Date
  isDelayed: boolean
  delayNotificationSent: boolean
  daysWaiting: number
  canReapply?: boolean
  reapplicationAllowedAt?: Date
  createdAt: Date
  updatedAt: Date
  
  // Populated fields
  user?: User
  profile?: Profile
  chapter?: Chapter
  reviewer?: User
}

// ============================================
// API REQUEST/RESPONSE TYPES
// ============================================

export interface ApiError {
  error: string
  message: string
  statusCode: number
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// ============================================
// ADMIN DASHBOARD TYPES
// ============================================

export interface DashboardStats {
  totalMembers: number
  pendingRequests: number
  totalChapters: number
  activeChapters: number
  newMembersThisMonth: number
  approvalRate: number
}

export interface ChapterStats {
  chapterId: string
  chapterName: string
  totalMembers: number
  pendingRequests: number
  approvedThisMonth: number
  rejectedThisMonth: number
}

// ============================================
// PLATFORM STATISTICS
// ============================================

export interface PlatformStatistics {
  totalChapters: number
  activeChapters: number
  inactiveChapters: number
  totalMembers: number
  totalCountries: number
}

export interface DelayedRequestsStats {
  total: number
  notified: number
  notNotified: number
}

export interface ChapterDetailStats {
  total: number
  approved: number
  pending: number
  rejected: number
}

// ============================================
// EVENT INTERFACES
// ============================================

export interface EventLocation {
  type: LocationType
  address?: string
  city?: string
  country?: string
  virtualUrl?: string
  virtualPlatform?: string
}

export interface Event {
  id: string
  title: string
  description: string
  type: EventType
  chapterId?: string
  chapter?: Chapter
  organizerId: string
  organizer?: User
  startDate: string
  endDate: string
  timezone: string
  location: EventLocation
  coverImage?: string
  capacity?: number
  currentAttendees: number
  tags: string[]
  status: EventStatus
  isPublished: boolean
  isCancelled: boolean
  myRSVP?: RSVPStatus | null
  createdAt: Date
  updatedAt: Date
}

export interface EventRSVP {
  id: string
  eventId: string
  userId: string
  status: RSVPStatus
  rsvpDate: Date
  user?: User
}

export interface EventAttendee {
  user: User
  status: RSVPStatus
  rsvpDate: string
}

export interface EventAttendeesResponse {
  attendees: EventAttendee[]
  stats: {
    going: number
    interested: number
    notGoing: number
  }
}

// Event API Request/Response Types
export interface EventFilters {
  page?: number
  limit?: number
  chapterId?: string
  type?: EventType
  startDate?: string
  endDate?: string
  status?: EventStatus
}

export interface CreateEventData {
  title: string
  description: string
  type: EventType
  chapterId?: string
  startDate: string
  endDate: string
  timezone: string
  location: EventLocation
  capacity?: number
  coverImage?: string
  tags?: string[]
  status?: EventStatus
}

export interface UpdateEventData extends Partial<CreateEventData> {}

export interface RSVPEventData {
  status: RSVPStatus
}

export interface CancelEventData {
  reason: string
}
