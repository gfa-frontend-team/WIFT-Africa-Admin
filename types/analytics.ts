// Analytics Types

export interface PostAnalyticsSummary {
  totalImpressions: number
  totalMembersReached: number
  totalEngagement: number // Likes + Comments + Shares + Saves
  totalProfileViews: number
  topPerformingPost: string | null // Post ID
}

export interface PostAnalyticsDetail {
  postId: string
  postType: 'IMAGE' | 'VIDEO'
  timestamp: string // ISO Date
  discovery: {
    impressions: number
    membersReached: number
  }
  engagement: {
    likes: number
    comments: number
    saves: number
    shares: number
    totalWatchTime?: number // For videos, in seconds
  }
  viewerDemography: {
    byLocation: Array<{ location: string; count: number }>
    byRole: Array<{ role: string; count: number }>
  }
}

export interface ConnectionAnalytics {
  totalConnections: number
}

// Stats for the Chapter Admin dashboard (if different from ChapterStats in index.ts)
// For now, we reuse ChapterStats but can extend here if needed.
