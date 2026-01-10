export enum MessageRecipientType {
  ALL = 'ALL',
  CHAPTER = 'CHAPTER',
  CUSTOM = 'CUSTOM',
}

export enum MessagePriority {
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

// Based on API Docs for Conversation
export interface BroadcastConversation {
  id: string
  type: 'BROADCAST'
  lastMessage: {
    id: string
    content: string
    senderId: string
    createdAt: string
  }
  unreadCount: number
  // In a real app, we might need to fetch stats separately or they might be included
  // For the list view, we'll try to use what's available. 
  // If the docs don't say title is returned here, we might have to rely on lastMessage content or fetch detail.
  // However, "Broadcast" usually has a title. Let's assume the API might embed it or we rely on content.
  // The 'send' body has title/description.
}

export interface CreateBroadcastData {
  title: string
  description?: string
  content: string
  recipientType: MessageRecipientType
  chapterId?: string
  priority?: MessagePriority // Note: Docs don't show priority, but I'll keep it optional if supported
}

export interface MessageFilters {
  page?: number
  limit?: number
  type?: 'DIRECT' | 'BROADCAST'
}
