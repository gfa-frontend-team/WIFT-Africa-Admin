# Chapters Module API

## Overview
The Chapters module manages regional chapters, including their details, member lists, and membership request processing.

## Base URL
`/api/v1/chapters`

## Authentication
- **Required**: Yes (all endpoints).
- **Type**: Bearer Token (JWT).
- **Header**: `Authorization: Bearer <access_token>`

---

## 1. Chapter Discovery

### 1.1 List Chapters
**Method:** `GET`
**Path:** `/api/v1/chapters`
**Description:** Retrieve a list of chapters with optional filtering.

#### Query Parameters
- `country`: string (optional)
- `city`: string (optional)

#### Response (200 OK)
```typescript
{
  status: "success";
  results: number;
  data: {
    chapters: Array<{
      id: string;
      name: string;
      country: string;
      city: string;
      coverPhoto: string;
      memberCount: number;
      // ...
    }>;
  };
}
```

### 1.2 Get Chapter Details
**Method:** `GET`
**Path:** `/api/v1/chapters/:chapterId`
**Description:** Get public details of a specific chapter.

---

## 2. Membership Management (Admin Only)

**Note:** These endpoints require `ChapterAdmin` privileges.

### 2.1 Get Pending Requests
**Method:** `GET`
**Path:** `/api/v1/chapters/:chapterId/membership-requests`

#### Response (200 OK)
```typescript
{
  requests: Array<{
    id: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      profilePhoto: string;
    };
    status: 'PENDING';
    createdAt: string;
  }>;
}
```

### 2.2 Approve Request
**Method:** `POST`
**Path:** `/api/v1/chapters/:chapterId/membership-requests/:requestId/approve`

#### Body
```typescript
{
  notes?: string; // Max 500 chars
}
```

### 2.3 Reject Request
**Method:** `POST`
**Path:** `/api/v1/chapters/:chapterId/membership-requests/:requestId/reject`

#### Body
```typescript
{
  reason: string; // Min 10, Max 500 chars
  canReapply?: boolean; // Default true
}
```

### 2.4 Get Members
**Method:** `GET`
**Path:** `/api/v1/chapters/:chapterId/members`

---

## 3. Chapter Administration (Admin Only)

### 3.1 Update Chapter Details
**Method:** `PATCH`
**Path:** `/api/v1/chapters/:chapterId`

#### Body
```typescript
{
  description?: string;
  missionStatement?: string;
  email?: string;
  phone?: string;
  address?: string;
  website?: string;
  facebookUrl?: string;
  twitterHandle?: string;
  instagramHandle?: string;
  linkedinUrl?: string;
}
```
