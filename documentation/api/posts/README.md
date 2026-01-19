# Posts Module API

## Overview
The Posts module powers the main social feed. It handles content creation (text, image, video), interactions (likes, comments, replies), sharing, saving posts, and detailed analytics.

## Base URL
`/api/v1/posts`

## Authentication
- **Required**: Yes (all endpoints).
- **Type**: Bearer Token (JWT).
- **Header**: `Authorization: Bearer <access_token>`

---

## 1. Feed & Posts

### 1.1 Get Feed
**Method:** `GET`
**Path:** `/api/v1/posts/feed`
**Description:** Retrieves a paginated feed of posts from the user's network and chapters.

#### Query Parameters
- `page`: number (default: 1)
- `limit`: number (default: 10)

#### Response (200 OK)
```typescript
{
  posts: Array<Post & { isSaved: boolean }>;
  total: number;
  page: number;
  pages: number;
}
```

> **Note:** The `isSaved` boolean is dynamically computed for the current user.

---

### 1.2 Create Post
**Method:** `POST`
**Path:** `/api/v1/posts`

#### Body
```typescript
{
  content: string; // Max 5000 chars
  visibility?: 'PUBLIC' | 'CHAPTER_ONLY' | 'CONNECTIONS_ONLY';
  media?: Array<{
    type: 'image' | 'video';
    url: string;
  }>; // Max 10 items
}
```

#### Response (201 Created)
Returns created `Post` object.

---

### 1.3 Get Single Post
**Method:** `GET`
**Path:** `/api/v1/posts/:id`

---

### 1.4 Update Post
**Method:** `PATCH`
**Path:** `/api/v1/posts/:id`

#### Body
```typescript
{
  content?: string;
  visibility?: string;
}
```

---

### 1.5 Delete Post
**Method:** `DELETE`
**Path:** `/api/v1/posts/:id`

---

## 2. Interactions

### 2.1 Like/Unlike
**Method:** `POST`
**Path:** `/api/v1/posts/:id/like`
**Response:** `{ liked: boolean, count: number }`

---

### 2.2 Comments
- **Get Comments**: `GET /api/v1/posts/:id/comments`
- **Add Comment**: `POST /api/v1/posts/:id/comments`
  - Body: `{ content: string, parentCommentId?: string }`
- **Delete Comment**: `DELETE /api/v1/posts/comments/:commentId`
- **Get Replies**: `GET /api/v1/posts/comments/:commentId/replies`

---

### 2.3 Share Post
**Method:** `POST`
**Path:** `/api/v1/posts/:id/share`

#### Body
```typescript
{
  shareComment?: string;
  visibility?: 'PUBLIC' | 'CHAPTER_ONLY' | 'CONNECTIONS_ONLY';
}
```

### 2.4 Get Post Shares
**Method:** `GET`
**Path:** `/api/v1/posts/:id/shares`
**Description:** List of users who shared the post.

---

### 2.5 Save Post
**Method:** `POST`
**Path:** `/api/v1/posts/:id/save`

#### Body
```typescript
{
  collection?: string; // e.g. "Favorites"
}
```
**Response:** `{ saved: boolean }`

### 2.6 Check Saved Status
**Method:** `GET`
**Path:** `/api/v1/posts/:id/is-saved`
**Response:** `{ saved: boolean }`

### 2.7 Get Saved Collections
**Method:** `GET`
**Path:** `/api/v1/posts/saved/collections`
**Description:** Returns a list of the user's saved post collections with counts.

#### Response (200 OK)
```typescript
{
  collections: Array<{
    name: string;
    count: number;
  }>;
}
```

---

## 3. Impressions & Tracking

### 3.1 Record Impression
**Method:** `POST`
**Path:** `/api/v1/posts/:postId/impression`
**Description:** Records that a user viewed a post (useful for video watch time etc).

#### Body
```typescript
{
  watchTime?: number; // Seconds (for videos)
}
```

### 3.2 Track Profile View from Post
**Method:** `PATCH`
**Path:** `/api/v1/posts/:postId/impression/profile-view`
**Description:** Attributes a profile view to a specific post.

### 3.3 Track Follow from Post
**Method:** `PATCH`
**Path:** `/api/v1/posts/:postId/impression/follow`
**Description:** Attributes a follow action to a specific post.

---

## 4. Admin & Moderation

### 4.1 Create Admin Announcement
**Method:** `POST`
**Path:** `/api/v1/posts/admin`
**Permission:** Admin only.

#### Body
```typescript
{
  content: string;
  targetChapters?: string[]; // Empty for all
  isPinned?: boolean;
  media?: Media[];
}
```

### 4.2 Pin Post
**Method:** `POST`
**Path:** `/api/v1/posts/:id/pin`

---

## 5. Analytics

### 5.1 Post Analytics
**Method:** `GET`
**Path:** `/api/v1/posts/:postId/analytics`
**Description:** Detailed metrics for a specific post.

#### Response
```typescript
{
  discovery: {
    impressions: number;
    membersReached: number;
  },
  engagement: {
    likes: number;
    comments: number;
    shares: number;
    saves: number;
    totalWatchTime: number; // Seconds
  },
  viewerDemography: {
    byLocation: Array<{ location: string, count: number }>;
    byRole: Array<{ role: string, count: number }>;
  }
}
```

### 5.2 User Analytics Overview
**Method:** `GET`
**Path:** `/api/v1/posts/analytics/overview`
**Description:** Aggregated stats across all user's posts.
