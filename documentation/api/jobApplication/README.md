# Job Applications Module API

## Overview
The Job Applications module allows candidates to track their submitted applications and enables admins (Chapter Admins) to review and manage the status of applications.

**Note on Applying:** Applications are submitted via the **Jobs** module endpoints (`POST /api/v1/jobs/:jobId/apply`). This module primarily handles retrieving and updating existing applications.

## Base URL
`/api/v1/job-applications`

## Authentication
- **Required**: Yes (all endpoints).
- **Type**: Bearer Token (JWT).
- **Header**: `Authorization: Bearer <access_token>`

---

## 1. Candidate Endpoints

### 1.1 Get My Applications
**Method:** `GET`
**Path:** `/api/v1/job-applications/me`
**Description:** Retrieve a paginated list of jobs the authenticated user has applied to.

#### Query Parameters
- `status`: 'RECEIVED' | 'SHORTLISTED' | 'REJECTED' | 'HIRED' | 'WITHDRAWN'
- `page`: number (default: 1)
- `limit`: number (default: 20)

#### Response (200 OK)
```typescript
{
  applications: Array<{
    id: string;
    status: ApplicationStatus;
    resumeUrl?: string; // URL to uploaded resume
    coverLetter?: string;
    createdAt: string; // ISO Date
    job: {
      id: string;
      title: string;
      location: string;
      jobType: string;
    }
  }>;
  total: number;
  pages: number;
}
```

### 1.2 Get Application Details
**Method:** `GET`
**Path:** `/api/v1/job-applications/:applicationId`
**Description:** Get detailed information about a specific application submitted by the user.

#### Response (200 OK)
```typescript
{
  application: {
    id: string;
    status: ApplicationStatus;
    resumeUrl?: string;
    coverLetter?: string;
    createdAt: string;
    job: JobDetails; // Full job details
  }
}
```

---

## 2. Admin Management (Chapter Admin)

### 2.1 List Applications for a Job
**Method:** `GET`
**Path:** `/api/v1/job-applications/admin/jobs/:jobId/applications`
**Description:** Retrieve all applications for a specific job posting.

#### Query Parameters
- `status`: 'RECEIVED' | 'SHORTLISTED' | 'REJECTED' | 'HIRED'
- `page`: number
- `limit`: number

#### Response (200 OK)
```typescript
{
  applications: Array<{
    // Application details + Candidate User info
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      profilePhoto?: string;
    };
    // ... application fields
  }>;
  total: number;
  pages: number;
}
```

### 2.2 Update Application Status
**Method:** `PATCH`
**Path:** `/api/v1/job-applications/admin/:applicationId/status`

#### Body
```typescript
{
  status: 'RECEIVED' | 'SHORTLISTED' | 'REJECTED' | 'HIRED';
  rejectionReason?: string; // Optional, useful if status is REJECTED
}
```

#### Response (200 OK)
```typescript
{
  id: string;
  status: string;
  updatedAt: string;
}
```
