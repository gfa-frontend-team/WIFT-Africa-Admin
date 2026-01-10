# Reports Module API

## Overview
The Reports module allows users to report content (posts, comments, jobs) or other users for violations of platform rules.

## Base URL
`/api/v1/reports`

## Authentication
- **Required**: Yes.
- **Type**: Bearer Token (JWT).
- **Header**: `Authorization: Bearer <access_token>`

---

## 1. Safety & Moderation

### 1.1 Submit a Report
**Method:** `POST`
**Path:** `/api/v1/reports`
**Description:** Submit a report against a user, post, comment, or job.

#### Body
```typescript
{
  targetType: 'POST' | 'COMMENT' | 'USER' | 'JOB';
  targetId: string; // ID of the entity being reported
  reason: string;   // e.g., 'Spam', 'Harassment', 'Inappropriate Content'
  description?: string; // Optional detailed explanation
}
```

#### Response (201 Created)
```typescript
{
  message: "Report submitted successfully";
  report: {
    id: string;
    reporterId: string;
    targetType: string;
    targetId: string;
    reason: string;
    description?: string;
    status: 'PENDING';
    createdAt: string;
  };
}
```
