# Analytics Module API

## Overview
The Analytics module provides data on post performance (impressions, engagement) and community connections. It enables users to track their content's reach and allows admins to monitor platform growth.

## Base URL
`/api/v1/analytics`

## Authentication
- **Required**: Yes (all endpoints).
- **Type**: Bearer Token (JWT).
- **Header**: `Authorization: Bearer <access_token>`

---

## 1. Post Analytics

### 1.1 Get Account Summary
**Method:** `GET`
**Path:** `/api/v1/analytics/posts/summary`
**Description:** Get aggregated performance metrics for all posts by the authenticated user.

#### Response (200 OK)
```typescript
{
  success: boolean;
  data: {
    totalImpressions: number;
    totalMembersReached: number;
    totalEngagement: number; // Likes + Comments + Shares + Saves
    totalProfileViews: number;
    topPerformingPost: string | null; // Post ID
  }
}
```

### 1.2 Get All Posts Analytics
**Method:** `GET`
**Path:** `/api/v1/analytics/posts`
**Description:** Get paginated analytics for the authenticated user's posts.

#### Query Parameters
- `page`: number (default: 1)
- `limit`: number (default: 10)

### 1.3 Get Single Post Analytics
**Method:** `GET`
**Path:** `/api/v1/analytics/posts/:postId`

#### Response (200 OK)
```typescript
{
  success: boolean;
  data: {
    postId: string;
    postType: 'IMAGE' | 'VIDEO';
    timestamp: string;
    discovery: {
      impressions: number;
      membersReached: number;
    };
    engagement: {
      likes: number;
      comments: number;
      saves: number;
      shares: number;
      totalWatchTime?: number; // For videos
    };
    viewerDemography: {
      byLocation: Array<{ location: string; count: number }>;
      byRole: Array<{ role: string; count: number }>;
    };
  }
}
```

### 1.4 Record Impression
**Method:** `POST`
**Path:** `/api/v1/analytics/posts/:postId/impression`
**Description:** Record a view for a post. Call this when a post becomes visible in the viewport.

#### Body
```typescript
{
  watchTime?: number; // Seconds (for video posts)
}
```

---

## 2. Connections Analytics

### 2.1 Get Total Connections
**Method:** `GET`
**Path:** `/api/v1/analytics/connections/total`
**Description:** Get the total number of connections across the platform.

#### Response (200 OK)
```typescript
{
  success: boolean;
  data: {
    totalConnections: number;
  }
}
```

### 2.2 Detailed Connection Analytics (Super Admin Only)
**Method:** `GET`
**Path:** `/api/v1/analytics/connections`

### 2.3 Inter-Chapter Analytics
**Method:** `GET`
**Path:** `/api/v1/analytics/connections/chapters/:chapter1Id/:chapter2Id`

---

## 3. Chapter Admin Dashboard

**Attributes:** Requires `ChapterAdmin` or `SuperAdmin` privileges.

### 3.1 Get Dashboard Stats
**Method:** `GET`
**Path:** `/api/v1/analytics/chapter-dashboard`
**Description:** Get real-time statistics for the Chapter Admin dashboard, including member counts, pending approvals, growth trends, and network connections.

#### Response (200 OK)
```typescript
{
  success: boolean;
  data: {
    totalMembers: number; // Count of APPROVED members
    pendingApprovals: number; // Count of PENDING requests
    growth: {
      newMembersThisMonth: number;
      percentageChange: number; // e.g. 15.5 for +15.5%
      trend: 'UP' | 'DOWN' | 'STABLE';
    };
    networkConnections: number; // Connections involving chapter members
  }
}
```
