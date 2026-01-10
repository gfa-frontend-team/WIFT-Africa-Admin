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

## 1. Chapter Management

### 1.1 List Chapters
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

---

### 1.2 Create Chapter
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

#### Response (201 Created)
Returns created chapter object.

---

### 1.3 Update Chapter
**Method:** `PATCH`
**Path:** `/api/v1/admin/chapters/:id`

#### Body
Any field from Create Chapter (all optional).

---

### 1.4 Deactivate/Reactivate Chapter
- **Deactivate**: `DELETE /api/v1/admin/chapters/:id` (Soft delete)
- **Reactivate**: `POST /api/v1/admin/chapters/:id/reactivate`

---

### 1.5 Manage Chapter Admins
- **Add Admin**: `POST /api/v1/admin/chapters/:id/admins`
  - Body: `{ userId: string }`
- **Remove Admin**: `DELETE /api/v1/admin/chapters/:id/admins/:userId`

---

## 2. Verification & Analytics

### 2.1 Chapter Statistics
**Method:** `GET`
**Path:** `/api/v1/admin/chapters/statistics`
**Description:** Aggregate stats for the platform.

#### Response (200 OK)
```typescript
{
  totalChapters: number;
  activeChapters: number;
  totalMembers: number;
  totalCountries: number;
}
```

### 2.2 Verification Delays
- **Check Delays**: `POST /api/v1/admin/verification/check-delays` (Trigger manual check)
- **Get Stats**: `GET /api/v1/admin/verification/delayed-stats`

---

## 3. Content Moderation

### 3.1 Hide Post
**Method:** `PATCH`
**Path:** `/api/v1/admin/posts/:postId/hide`
**Description:** Hides a post from public view due to violations.

#### Body
```typescript
{
  reason: string; // Required, min 10 chars
}
```

### 3.2 Unhide Post
**Method:** `PATCH`
**Path:** `/api/v1/admin/posts/:postId/unhide`

---

## 4. Reports (Moderation)

### 4.1 List Reports
**Method:** `GET`
**Path:** `/api/v1/admin/reports`

#### Query Parameters
- `status`: 'OPEN' | 'RESOLVED'
- `targetType`: 'POST' | 'COMMENT' | 'USER' | 'JOB'
- `page`: number
- `limit`: number

### 4.2 Get Single Report
**Method:** `GET`
**Path:** `/api/v1/admin/reports/:reportId`
**Description:** detailed report info including the reported content (target).

### 4.3 Resolve Report
**Method:** `PATCH`
**Path:** `/api/v1/admin/reports/:reportId/resolve`

#### Body
```typescript
{
  resolutionNote?: string;
}
```

---

## 5. System Monitoring

### 5.1 Real-time Dashboard
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
