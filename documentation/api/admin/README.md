# Admin Module API

## Overview
The Admin module enables Super Admins to manage chapters, verify members, moderate content, view system analytics, and handle reports.

## Base URL
`/api/v1/admin`

## Authentication
- **Required**: Yes
- **Role**: `Super Admin` (Most endpoints) or `Chapter Admin` (Specific endpoints where noted).
- **Type**: Bearer Token (JWT)
- **Header**: `Authorization: Bearer <access_token>`

---

## 1. Member Management

### 1.1 Update Member Status
**Method:** `PATCH`
**Path:** `/api/v1/admin/:userId/membership-status`
**Description:** Suspend or reinstate a user. Requires `Chapter Admin` role.

#### Body
```typescript
{
  status: 'APPROVED' | 'SUSPENDED';
  reason?: string;
}
```

---

## 2. Chapter Management

### 2.1 List Chapters
**Method:** `GET`
**Path:** `/api/v1/admin/chapters`
**Description:** Retrieves a paginated list of chapters with filtering.

#### Query Parameters
- `page`: number (default: 1)
- `limit`: number (default: 20)
- `search`: string (Name, code, or city)
- `country`: string
- `isActive`: boolean
- `sortBy`: string (default: 'name')
- `sortOrder`: 'asc' | 'desc' (default: 'asc')

#### Response (200 OK)
```typescript
{
  chapters: Array<{
    id: string;
    name: string;
    code: string;
    country: string;
    isActive: boolean;
    // ... chapter details
  }>;
  total: number;
  pages: number;
}
```

### 2.2 Create Chapter
**Method:** `POST`
**Path:** `/api/v1/admin/chapters`
**Description:** Creates a new WIFT chapter.

#### Body
```typescript
{
  name: string;       // Required
  code: string;       // Required, Unique (e.g. NG-LAG)
  country: string;    // Required
  city?: string;
  description?: string;
  email?: string;     // Contact email
  // ... other optional fields like social links
}
```

### 2.3 Update Chapter
**Method:** `PATCH`
**Path:** `/api/v1/admin/chapters/:id`

#### Body
Any field from Create Chapter (all optional).
- `fixedMemberCount`: number (Optional) - Set a fixed number of members for public display.

### 2.4 Deactivate/Reactivate Chapter
- **Deactivate**: `DELETE /api/v1/admin/chapters/:id` (Soft delete)
- **Reactivate**: `POST /api/v1/admin/chapters/:id/reactivate`

### 2.5 Manage Chapter Admins
- **Add Admin**: `POST /api/v1/admin/chapters/:id/admins`
  - Body: `{ userId: string }`
- **Remove Admin**: `DELETE /api/v1/admin/chapters/:id/admins/:userId`

### 2.6 Get Chapter Countries
**Method:** `GET`
**Path:** `/api/v1/admin/chapters/countries`
**Description:** List unique countries with chapters.

### 2.7 Get Chapter Analytics
**Method:** `GET`
**Path:** `/api/v1/admin/chapters/:chapterId/analytics`
**Description:** Detailed analytics for a specific chapter.

---

## 3. Verification & Analytics

### 3.1 Chapter Statistics
**Method:** `GET`
**Path:** `/api/v1/admin/chapters/statistics`
**Description:** Aggregate stats for the platform (total chapters, members, countries).

#### Response (200 OK)
```typescript
{
  totalChapters: number;
  activeChapters: number;
  totalMembers: number;
  totalCountries: number;
}
```

### 3.2 Member Analytics Dashboard
**Method:** `GET`
**Path:** `/api/v1/admin/analytics/members`
**Query Params:** `chapterId`, `startDate`, `endDate`.

### 3.3 Verification Delays
- **Check Delays**: `POST /api/v1/admin/verification/check-delays` (Trigger manual check)
- **Get Stats**: `GET /api/v1/admin/verification/delayed-stats`

---

## 4. Content Moderation

### 4.1 Hide Post
**Method:** `PATCH`
**Path:** `/api/v1/admin/posts/:postId/hide`
**Description:** Hides a post from public view due to violations.

#### Body
```typescript
{
  reason: string; // Required, min 10 chars
}
```

### 4.2 Unhide Post
**Method:** `PATCH`
**Path:** `/api/v1/admin/posts/:postId/unhide`

### 4.3 Moderation Log
**Method:** `GET`
**Path:** `/api/v1/admin/posts/moderation-log`
**Query Params:** `page`, `limit`, `action` (hidden/unhidden).

---

## 5. Reports (Moderation)

### 5.1 List Reports
**Method:** `GET`
**Path:** `/api/v1/admin/reports`

#### Query Parameters
- `status`: 'OPEN' | 'RESOLVED'
- `targetType`: 'POST' | 'COMMENT' | 'USER' | 'JOB'
- `page`: number
- `limit`: number

### 5.2 Get Single Report
**Method:** `GET`
**Path:** `/api/v1/admin/reports/:reportId`
**Description:** detailed report info including the reported content (target).

### 5.3 Resolve Report
**Method:** `PATCH`
**Path:** `/api/v1/admin/reports/:reportId/resolve`

#### Body
```typescript
{
  resolutionNote?: string;
}
```

---

## 6. System Monitoring

### 6.1 Real-time Dashboard
**Method:** `GET`
**Path:** `/api/v1/admin/monitoring/realtime`
**Description:** Returns live system metrics (WebSocket connections, memory usage, etc.).

#### Response (200 OK)
```typescript
{
  websocket: {
    activeConnections: number;
    activeUsers: number;
  };
  system: {
    uptime: number; // Seconds
    memoryUsage: {
      heapUsed: string;
      heapTotal: string;
    };
  };
}
```
