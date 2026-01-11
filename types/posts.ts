import { User } from './index'

export interface Media {
  type: 'image' | 'video'
  url: string
  thumbnailUrl?: string
}

export interface PostStats {
  likes: number
  comments: number
  shares: number
  saves: number
}

export interface Post {
  id: string
  content: string
  authorId: string
  author: User
  media: Media[]
  visibility: 'PUBLIC' | 'CHAPTER_ONLY' | 'CONNECTIONS_ONLY'
  isPinned: boolean
  isHidden: boolean
  hiddenReason?: string
  hiddenAt?: string
  hiddenBy?: string
  stats: PostStats
  createdAt: string
  updatedAt: string
  
  // Admin specific
  targetChapters?: string[]
}

export interface Comment {
  id: string
  content: string
  postId: string
  authorId: string
  author: User
  parentCommentId?: string
  replyCount: number
  createdAt: string
  updatedAt: string
}

export interface PostAnalytics {
  discovery: {
    impressions: number
    membersReached: number
  }
  engagement: {
    likes: number
    comments: number
    shares: number
    saves: number
    totalWatchTime: number
  }
  viewerDemography: {
    byLocation: Array<{ location: string; count: number }>
    byRole: Array<{ role: string; count: number }>
  }
}

export interface CreatePostData {
  content: string
  visibility?: 'PUBLIC' | 'CHAPTER_ONLY' | 'CONNECTIONS_ONLY'
  targetChapters?: string[] // For admin announcements
  isPinned?: boolean
  media?: Media[]
}

export interface CreateCommentData {
  content: string
  parentCommentId?: string
}

export interface HidePostData {
  reason: string
}

export interface PostFilters {
  page?: number
  limit?: number
}
