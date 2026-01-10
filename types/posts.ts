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

export interface CreatePostData {
  content: string
  visibility?: 'PUBLIC' | 'CHAPTER_ONLY' | 'CONNECTIONS_ONLY'
  targetChapters?: string[] // For admin announcements
  isPinned?: boolean
  media?: Media[]
}

export interface HidePostData {
  reason: string
}

export interface PostFilters {
  page?: number
  limit?: number
}
