# Jobs Module API

## Overview
The Jobs module allows for the creation, management, and retrieval of job opportunities. It includes functionality for listing jobs with filters, viewing job details, and managing job postings (Admin only). It also provides an endpoint for users to apply to specific jobs.

## Base URL
`/api/v1/jobs`

## Authentication
- **Required**: Yes (all endpoints).
- **Type**: Bearer Token (JWT).
- **Header**: `Authorization: Bearer <access_token>`

---

## 1. Job Discovery

### 1.1 List Jobs
**Method:** `GET`
**Path:** `/api/v1/jobs`
**Description:** Retrieve a list of job postings with optional filtering.

#### Query Parameters
- `location`: string (e.g., "Lagos")
- `role`: string (e.g., "Engineer")
- `remote`: boolean (true/false)

#### Response (200 OK)
```typescript
{
  status: 'success';
  message: string;
  results: number;
  data: Array<{
    id: string;
    title: string;
    description: string;
    companyName: string;
    role: string;
    location: string;
    isRemote: boolean;
    employmentType: 'full-time' | 'part-time' | 'contract' | 'internship';
    salaryRange?: {
      min: number;
      max: number;
      currency: string;
    };
    applicationLink?: string;
    createdAt: string;
    // ... other fields
  }>;
}
```

### 1.2 Get Job Details
**Method:** `GET`
**Path:** `/api/v1/jobs/:jobId`
**Description:** Get detailed information about a specific job.

#### Response (200 OK)
```typescript
{
  status: 'success';
  message: string;
  data: Job; // Detailed job object
}
```

---

## 2. Job Application

### 2.1 Apply to Job
**Method:** `POST`
**Path:** `/api/v1/jobs/:jobId/apply`
**Description:** Submit an application for a specific job.

#### Request (Multipart/Form-Data or JSON depending on implementation)
*Note: The implementation uses `jobApplicationController.applyToJob`. Ensure to check `Job Applications` module docs for specific payload requirements if complex (e.g., CV upload).*

---

## 3. Job Management (Admin Only)

**Attributes:** Requires `ChapterAdmin` privileges.

### 3.1 Create Job
**Method:** `POST`
**Path:** `/api/v1/jobs`

#### Body
```typescript
{
  title: string;
  description: string;
  role: string;
  location: string;
  isRemote?: boolean;
  employmentType?: 'full-time' | 'part-time' | 'contract' | 'internship';
  companyName?: string;
  salaryRange?: {
    min: number;
    max: number;
    currency: string;
  };
  applicationLink?: string;
}
```

### 3.2 Update Job
**Method:** `PATCH`
**Path:** `/api/v1/jobs/:jobId`

#### Body
```typescript
{
  // Any subset of Create Job fields
  status?: 'draft' | 'published' | 'archived';
  expiresAt?: string; // ISO Date
}
```

### 3.3 Archive Job
**Method:** `DELETE`
**Path:** `/api/v1/jobs/:jobId`
**Description:** Soft-delete or archive a job posting.
