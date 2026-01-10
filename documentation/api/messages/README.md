# Messages Module API

## Overview
The Messages module facilitates real-time communication between users (Direct Messages) and allows Admins to send bulk announcements (Broadcast Messages).

## Base URL
`/api/v1/messages`

## Authentication
- **Required**: Yes (all endpoints).
- **Type**: Bearer Token (JWT).
- **Header**: `Authorization: Bearer <access_token>`

---

## 1. Sending Messages

### 1.1 Send Direct Message
**Method:** `POST`
**Path:** `/api/v1/messages`
**Description:** Send a private message to another user.

#### Body
```typescript
{
  receiverId: string;
  content: string; // Max 10000 chars
  media?: Array<{
    type: 'image' | 'video' | 'document';
    url: string;
    filename?: string;
  }>;
}
```

### 1.2 Send Broadcast Message (Admin Only)
**Method:** `POST`
**Path:** `/api/v1/messages/broadcast`
**Description:** Send a message to multiple recipients or chapters.

#### Body
```typescript
{
  title?: string; // Max 100 chars
  description?: string; // Max 500 chars
  content: string; // Required, Max 10000 chars
  recipientType: 'ALL' | 'CHAPTER' | 'CUSTOM';
  chapterId?: string; // Required if recipientType is CHAPTER
  recipientIds?: string[]; // Required if recipientType is CUSTOM
  media?: Media[];
}
```

---

## 2. Conversations

### 2.1 Get Conversations
**Method:** `GET`
**Path:** `/api/v1/messages/conversations`
**Description:** Retrieve a paginated list of conversations.

#### Query Parameters
- `page`: number (default: 1)
- `limit`: number (default: 20)
- `type`: 'DIRECT' | 'BROADCAST' (Optional filtering)

#### Response (200 OK)
```typescript
{
  conversations: Array<{
    id: string;
    type: 'DIRECT' | 'BROADCAST';
    participants: User[]; // For direct
    lastMessage: Message;
    unreadCount: number;
    // ...
  }>;
  total: number;
}
```

### 2.2 Archive Conversation
**Method:** `POST`
**Path:** `/api/v1/messages/conversations/:conversationId/archive`

---

## 3. Messages in Conversation

### 3.1 Get Messages
**Method:** `GET`
**Path:** `/api/v1/messages/conversations/:conversationId`
**Description:** Fetch messages within a specific conversation.

#### Query Parameters
- `page`: number (default: 1)
- `limit`: number (default: 50)

### 3.2 Mark as Read
**Method:** `POST`
**Path:** `/api/v1/messages/conversations/:conversationId/read`
**Description:** Marks all messages in the conversation as read for the current user.

### 3.3 Delete Message
**Method:** `DELETE`
**Path:** `/api/v1/messages/:messageId`

---

## 4. Statistics & Counts

### 4.1 Get Unread Counts
**Method:** `GET`
**Path:** `/api/v1/messages/unread-count`

#### Response (200 OK)
```typescript
{
  direct: number;
  broadcast: number;
  total: number;
}
```

### 4.2 Broadcast Stats (Admin Only)
**Method:** `GET`
**Path:** `/api/v1/messages/broadcast/:conversationId/stats`
**Description:** Analytics for sent broadcasts (read rates).

#### Response (200 OK)
```typescript
{
  conversation: any;
  stats: Array<{
    messageId: string;
    recipientCount: number;
    readCount: number;
    readPercentage: string;
  }>;
}
```
