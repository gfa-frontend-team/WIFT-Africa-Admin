# Mentorship System - Admin API Documentation

## 🔍 Critical Finding: Access Control Implementation

### ✅ CONFIRMED: Chapter Admins CAN Create Mentorships

**Authorization Middleware:** `requireChapterAdmin`
- **Location:** `src/middleware/authorize.ts`
- **Allowed Roles:**
  - `CHAPTER_ADMIN` (from User model)
  - `SUPER_ADMIN` (from User model)
  - `CHAPTER_ADMIN` (from Administrator model)
  - `SUPER_ADMIN` (from Administrator model)

**Routes Protected:**
- `POST /api/v1/mentorships` ✅ Uses `requireChapterAdmin`
- `PATCH /api/v1/mentorships/:mentorshipId` ✅ Uses `requireChapterAdmin`
- `DELETE /api/v1/mentorships/:mentorshipId` ✅ Uses `requireChapterAdmin`

---

## API Endpoints Overview

### Base URL
```
/api/v1/mentorships
```

### Authentication
All endpoints require Bearer token authentication.

---

## 1. Create Mentorship

### Endpoint
**POST** `/api/v1/mentorships`

### Authorization
- ✅ Chapter Admin
- ✅ Super Admin

### Request Body

```typescript
{
  mentorName: string;              // Required
  mentorRole: string;              // Required
  areasOfExpertise: string[];      // Required, min 1 item
  mentorshipFormat: MentorshipFormat;  // Required
  mentorshipLink?: string;         // Optional (URL)
  startPeriod: string | Date;      // Required
  endPeriod: string | Date;        // Required
  days: DayOfWeek[];              // Required, min 1 item
  timeFrame: string;              // Required
  description: string;            // Required
  eligibility?: string;           // Optional
  chapterId?: string;             // Optional (ObjectId)
}
```

### Enums

**MentorshipFormat:**
- `"Virtual"`
- `"Physical"`
- `"Hybrid"`

**DayOfWeek:**
- `"Monday"`
- `"Tuesday"`
- `"Wednesday"`
- `"Thursday"`
- `"Friday"`
- `"Saturday"`
- `"Sunday"`

### Field Specifications

| Field | Type | Required | Validation | Example |
|-------|------|----------|------------|---------|
| mentorName | string | ✅ | - | "Jane Doe" |
| mentorRole | string | ✅ | - | "Director" |
| areasOfExpertise | string[] | ✅ | Min 1 item | ["Script Development", "Career Growth"] |
| mentorshipFormat | enum | ✅ | Virtual/Physical/Hybrid | "Virtual" |
| mentorshipLink | string | ❌ | Must be valid URL (http/https) | "https://meet.google.com/abc-defg-hij" |
| startPeriod | string/Date | ✅ | Must be before endPeriod | "2026-03-01" or Date object |
| endPeriod | string/Date | ✅ | Must be after startPeriod | "2026-06-01" or Date object |
| days | string[] | ✅ | Min 1 day, valid DayOfWeek | ["Monday", "Wednesday", "Friday"] |
| timeFrame | string | ✅ | - | "12:30pm - 3:00pm" |
| description | string | ✅ | - | "This mentorship focuses on..." |
| eligibility | string | ❌ | - | "Open to all members" |
| chapterId | string | ❌ | Valid ObjectId | "507f1f77bcf86cd799439011" |

### Validation Rules

1. **Date Validation:**
   - `endPeriod` MUST be after `startPeriod`
   - Validated at schema level

2. **URL Validation:**
   - `mentorshipLink` must start with `http://` or `https://`
   - Optional field

3. **Array Validation:**
   - `areasOfExpertise` must have at least 1 item
   - `days` must have at least 1 item

4. **Chapter Scope:**
   - If `chapterId` is provided, mentorship is chapter-specific
   - If omitted or `null`, mentorship is global (all members)

### Request Example

```json
{
  "mentorName": "Jane Doe",
  "mentorRole": "Director",
  "areasOfExpertise": [
    "Script Development",
    "Career Growth",
    "Networking"
  ],
  "mentorshipFormat": "Virtual",
  "mentorshipLink": "https://meet.google.com/abc-defg-hij",
  "startPeriod": "2026-03-01",
  "endPeriod": "2026-06-01",
  "days": ["Monday", "Wednesday", "Friday"],
  "timeFrame": "12:30pm - 3:00pm",
  "description": "This mentorship program focuses on helping emerging filmmakers develop their scripts and navigate the industry. We'll cover story structure, character development, and practical career advice.",
  "eligibility": "Open to all WIFT members with at least one completed script",
  "chapterId": "507f1f77bcf86cd799439011"
}
```

### Success Response (201 Created)

```json
{
  "message": "Mentorship created successfully",
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "mentorName": "Jane Doe",
    "mentorRole": "Director",
    "areasOfExpertise": [
      "Script Development",
      "Career Growth",
      "Networking"
    ],
    "mentorshipFormat": "Virtual",
    "mentorshipLink": "https://meet.google.com/abc-defg-hij",
    "startPeriod": "2026-03-01T00:00:00.000Z",
    "endPeriod": "2026-06-01T00:00:00.000Z",
    "days": ["Monday", "Wednesday", "Friday"],
    "timeFrame": "12:30pm - 3:00pm",
    "description": "This mentorship program focuses on...",
    "eligibility": "Open to all WIFT members with at least one completed script",
    "chapterId": "507f1f77bcf86cd799439011",
    "createdBy": "60d5ec49f1b2c72b8c8e4f1a",
    "status": "Open",
    "viewCount": 0,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Error Responses

#### 400 Bad Request - Validation Error
```json
{
  "error": "Validation failed: End period must be after start period"
}
```

#### 400 Bad Request - Invalid URL
```json
{
  "error": "Invalid URL format. Must start with http:// or https://"
}
```

#### 401 Unauthorized
```json
{
  "error": "Unauthorized"
}
```

#### 403 Forbidden
```json
{
  "error": "Access denied. Chapter admin privileges required."
}
```

---

## 2. List Mentorships

### Endpoint
**GET** `/api/v1/mentorships`

### Authorization
- ✅ Any authenticated user

### Query Parameters

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| chapterId | string | ❌ | Filter by chapter | `507f1f77bcf86cd799439011` |
| format | string | ❌ | Filter by format | `Virtual` |
| role | string | ❌ | Filter by mentor role (regex) | `Director` |
| expertise | string | ❌ | Filter by area of expertise | `Script Development` |
| days | string | ❌ | Filter by day | `Monday` |
| search | string | ❌ | Search in name, description, expertise | `script` |
| status | string | ❌ | Filter by status (default: Open) | `Open` or `Closed` |
| sortBy | string | ❌ | Sort order | `oldest`, `popular`, `startDate` |

### Request Example

```
GET /api/v1/mentorships?chapterId=507f1f77bcf86cd799439011&format=Virtual&sortBy=popular
```

### Success Response (200 OK)

```json
{
  "data": [
    {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
      "mentorName": "Jane Doe",
      "mentorRole": "Director",
      "areasOfExpertise": ["Script Development", "Career Growth"],
      "mentorshipFormat": "Virtual",
      "mentorshipLink": "https://meet.google.com/abc-defg-hij",
      "startPeriod": "2026-03-01T00:00:00.000Z",
      "endPeriod": "2026-06-01T00:00:00.000Z",
      "days": ["Monday", "Wednesday", "Friday"],
      "timeFrame": "12:30pm - 3:00pm",
      "description": "This mentorship program focuses on...",
      "eligibility": "Open to all WIFT members",
      "chapterId": "507f1f77bcf86cd799439011",
      "createdBy": "60d5ec49f1b2c72b8c8e4f1a",
      "status": "Open",
      "viewCount": 45,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z",
      "isSaved": false,
      "hasApplied": false
    }
  ]
}
```

### Response Fields (When userId provided)

- `isSaved` (boolean): Whether current user has saved this mentorship
- `hasApplied` (boolean): Whether current user has applied

---

## 3. Get Mentorship Details

### Endpoint
**GET** `/api/v1/mentorships/:mentorshipId`

### Authorization
- ✅ Any authenticated user

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| mentorshipId | string | ✅ | Mentorship ID |

### Request Example

```
GET /api/v1/mentorships/65a1b2c3d4e5f6g7h8i9j0k1
```

### Success Response (200 OK)

```json
{
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "mentorName": "Jane Doe",
    "mentorRole": "Director",
    "areasOfExpertise": ["Script Development", "Career Growth"],
    "mentorshipFormat": "Virtual",
    "mentorshipLink": "https://meet.google.com/abc-defg-hij",
    "startPeriod": "2026-03-01T00:00:00.000Z",
    "endPeriod": "2026-06-01T00:00:00.000Z",
    "days": ["Monday", "Wednesday", "Friday"],
    "timeFrame": "12:30pm - 3:00pm",
    "description": "This mentorship program focuses on...",
    "eligibility": "Open to all WIFT members",
    "chapterId": "507f1f77bcf86cd799439011",
    "createdBy": "60d5ec49f1b2c72b8c8e4f1a",
    "status": "Open",
    "viewCount": 46,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z",
    "isSaved": false,
    "hasApplied": true
  }
}
```

### Notes
- View count is automatically incremented on each request
- `isSaved` and `hasApplied` are included when user is authenticated

### Error Responses

#### 404 Not Found
```json
{
  "error": "Mentorship not found"
}
```

---

## 4. Update Mentorship

### Endpoint
**PATCH** `/api/v1/mentorships/:mentorshipId`

### Authorization
- ✅ Chapter Admin
- ✅ Super Admin

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| mentorshipId | string | ✅ | Mentorship ID |

### Request Body

All fields are optional. Only include fields you want to update.

```typescript
{
  mentorName?: string;
  mentorRole?: string;
  areasOfExpertise?: string[];
  mentorshipFormat?: MentorshipFormat;
  mentorshipLink?: string;
  startPeriod?: string | Date;
  endPeriod?: string | Date;
  days?: DayOfWeek[];
  timeFrame?: string;
  description?: string;
  eligibility?: string;
  status?: MentorshipStatus;  // "Open" or "Closed"
}
```

### Request Example

```json
{
  "status": "Closed",
  "description": "Updated description for the mentorship program."
}
```

### Success Response (200 OK)

```json
{
  "message": "Mentorship updated successfully",
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "mentorName": "Jane Doe",
    "mentorRole": "Director",
    "areasOfExpertise": ["Script Development", "Career Growth"],
    "mentorshipFormat": "Virtual",
    "mentorshipLink": "https://meet.google.com/abc-defg-hij",
    "startPeriod": "2026-03-01T00:00:00.000Z",
    "endPeriod": "2026-06-01T00:00:00.000Z",
    "days": ["Monday", "Wednesday", "Friday"],
    "timeFrame": "12:30pm - 3:00pm",
    "description": "Updated description for the mentorship program.",
    "eligibility": "Open to all WIFT members",
    "chapterId": "507f1f77bcf86cd799439011",
    "createdBy": "60d5ec49f1b2c72b8c8e4f1a",
    "status": "Closed",
    "viewCount": 46,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-16T14:20:00.000Z"
  }
}
```

### Error Responses

#### 403 Forbidden
```json
{
  "error": "Access denied. Chapter admin privileges required."
}
```

#### 404 Not Found
```json
{
  "error": "Mentorship not found"
}
```

---

## 5. Delete Mentorship

### Endpoint
**DELETE** `/api/v1/mentorships/:mentorshipId`

### Authorization
- ✅ Chapter Admin
- ✅ Super Admin

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| mentorshipId | string | ✅ | Mentorship ID |

### Request Example

```
DELETE /api/v1/mentorships/65a1b2c3d4e5f6g7h8i9j0k1
```

### Success Response (200 OK)

```json
{
  "message": "Mentorship deleted successfully"
}
```

### Error Responses

#### 403 Forbidden
```json
{
  "error": "Access denied. Chapter admin privileges required."
}
```

#### 404 Not Found
```json
{
  "error": "Mentorship not found"
}
```

---

## 6. Get Applications for Mentorship

### Endpoint
**GET** `/api/v1/mentorships/:mentorshipId/applications`

### Authorization
- ✅ Chapter Admin
- ✅ Super Admin

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| mentorshipId | string | ✅ | Mentorship ID |

### Query Parameters

| Parameter | Type | Required | Description | Values |
|-----------|------|----------|-------------|--------|
| status | string | ❌ | Filter by application status | `Pending`, `Accepted`, `Rejected`, `Withdrawn` |

### Request Example

```
GET /api/v1/mentorships/65a1b2c3d4e5f6g7h8i9j0k1/applications?status=Pending
```

### Success Response (200 OK)

```json
{
  "data": [
    {
      "_id": "65b2c3d4e5f6g7h8i9j0k1l2",
      "mentorshipId": "65a1b2c3d4e5f6g7h8i9j0k1",
      "applicantId": {
        "_id": "60d5ec49f1b2c72b8c8e4f1b",
        "firstName": "John",
        "lastName": "Smith",
        "email": "john.smith@example.com",
        "profilePhoto": "https://..."
      },
      "status": "Pending",
      "message": "I am very interested in this mentorship because...",
      "adminResponse": null,
      "reviewedBy": null,
      "reviewedAt": null,
      "createdAt": "2024-01-16T09:15:00.000Z",
      "updatedAt": "2024-01-16T09:15:00.000Z"
    }
  ]
}
```

---

## 7. Accept Application

### Endpoint
**PATCH** `/api/v1/mentorships/applications/:applicationId/accept`

### Authorization
- ✅ Chapter Admin
- ✅ Super Admin

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| applicationId | string | ✅ | Application ID |

### Request Body

```typescript
{
  adminResponse?: string;  // Optional, max 500 characters
}
```

### Request Example

```json
{
  "adminResponse": "Congratulations! We're excited to have you in the program."
}
```

### Success Response (200 OK)

```json
{
  "message": "Application accepted",
  "data": {
    "_id": "65b2c3d4e5f6g7h8i9j0k1l2",
    "mentorshipId": "65a1b2c3d4e5f6g7h8i9j0k1",
    "applicantId": "60d5ec49f1b2c72b8c8e4f1b",
    "status": "Accepted",
    "message": "I am very interested in this mentorship because...",
    "adminResponse": "Congratulations! We're excited to have you in the program.",
    "reviewedBy": "60d5ec49f1b2c72b8c8e4f1a",
    "reviewedAt": "2024-01-16T14:30:00.000Z",
    "createdAt": "2024-01-16T09:15:00.000Z",
    "updatedAt": "2024-01-16T14:30:00.000Z"
  }
}
```

### Side Effects
- Applicant receives notification: "Mentorship Application Accepted"
- Application status changes to "Accepted"
- `reviewedBy` and `reviewedAt` are set

### Error Responses

#### 400 Bad Request
```json
{
  "error": "Application has already been reviewed"
}
```

#### 404 Not Found
```json
{
  "error": "Application not found"
}
```

---

## 8. Reject Application

### Endpoint
**PATCH** `/api/v1/mentorships/applications/:applicationId/reject`

### Authorization
- ✅ Chapter Admin
- ✅ Super Admin

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| applicationId | string | ✅ | Application ID |

### Request Body

```typescript
{
  adminResponse?: string;  // Optional, max 500 characters
}
```

### Request Example

```json
{
  "adminResponse": "Thank you for your interest. Unfortunately, we cannot accept your application at this time."
}
```

### Success Response (200 OK)

```json
{
  "message": "Application rejected",
  "data": {
    "_id": "65b2c3d4e5f6g7h8i9j0k1l2",
    "mentorshipId": "65a1b2c3d4e5f6g7h8i9j0k1",
    "applicantId": "60d5ec49f1b2c72b8c8e4f1b",
    "status": "Rejected",
    "message": "I am very interested in this mentorship because...",
    "adminResponse": "Thank you for your interest. Unfortunately, we cannot accept your application at this time.",
    "reviewedBy": "60d5ec49f1b2c72b8c8e4f1a",
    "reviewedAt": "2024-01-16T14:30:00.000Z",
    "createdAt": "2024-01-16T09:15:00.000Z",
    "updatedAt": "2024-01-16T14:30:00.000Z"
  }
}
```

### Side Effects
- Applicant receives notification: "Mentorship Application Update"
- Application status changes to "Rejected"
- `reviewedBy` and `reviewedAt` are set

---

## Data Models

### Mentorship Model

```typescript
{
  _id: ObjectId;
  mentorName: string;
  mentorRole: string;
  areasOfExpertise: string[];
  mentorshipFormat: "Virtual" | "Physical" | "Hybrid";
  mentorshipLink?: string;
  startPeriod: Date;
  endPeriod: Date;
  days: DayOfWeek[];
  timeFrame: string;
  description: string;
  eligibility?: string;
  chapterId?: ObjectId | null;
  createdBy: ObjectId;
  status: "Open" | "Closed";
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### MentorshipApplication Model

```typescript
{
  _id: ObjectId;
  mentorshipId: ObjectId;
  applicantId: ObjectId;
  status: "Pending" | "Accepted" | "Rejected" | "Withdrawn";
  message: string;  // Max 1000 chars
  adminResponse?: string;  // Max 500 chars
  reviewedBy?: ObjectId;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## Business Logic

### Mentorship Creation
1. Admin creates mentorship with required fields
2. `createdBy` is automatically set to admin's user ID
3. `status` defaults to "Open"
4. `viewCount` starts at 0
5. If `chapterId` is provided, mentorship is chapter-specific
6. If `chapterId` is null/omitted, mentorship is global

### Application Review
1. Only admins can accept/reject applications
2. Only "Pending" applications can be reviewed
3. Once reviewed, status cannot be changed back to "Pending"
4. Applicant receives notification on accept/reject
5. `reviewedBy` and `reviewedAt` are automatically set

### Notifications
- **Application Submitted:** Mentor (creator) receives notification
- **Application Accepted:** Applicant receives notification
- **Application Rejected:** Applicant receives notification

---

## Frontend Implementation Guide

### TypeScript Interfaces

```typescript
interface CreateMentorshipData {
  mentorName: string;
  mentorRole: string;
  areasOfExpertise: string[];
  mentorshipFormat: 'Virtual' | 'Physical' | 'Hybrid';
  mentorshipLink?: string;
  startPeriod: string;  // ISO date string
  endPeriod: string;    // ISO date string
  days: string[];       // Array of day names
  timeFrame: string;
  description: string;
  eligibility?: string;
  chapterId?: string;
}

interface MentorshipResponse {
  _id: string;
  mentorName: string;
  mentorRole: string;
  areasOfExpertise: string[];
  mentorshipFormat: string;
  mentorshipLink?: string;
  startPeriod: string;
  endPeriod: string;
  days: string[];
  timeFrame: string;
  description: string;
  eligibility?: string;
  chapterId?: string;
  createdBy: string;
  status: string;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  isSaved?: boolean;
  hasApplied?: boolean;
}
```

### Example API Call

```typescript
async function createMentorship(data: CreateMentorshipData) {
  try {
    const response = await fetch('/api/v1/mentorships', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create mentorship');
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error creating mentorship:', error);
    throw error;
  }
}
```

---

## Testing Checklist

- [ ] Chapter Admin can create mentorship
- [ ] Super Admin can create mentorship
- [ ] Regular user cannot create mentorship (403)
- [ ] Validation works for required fields
- [ ] Date validation (endPeriod > startPeriod)
- [ ] URL validation for mentorshipLink
- [ ] Chapter-specific mentorship creation
- [ ] Global mentorship creation (no chapterId)
- [ ] List mentorships with filters
- [ ] Get mentorship details (view count increments)
- [ ] Update mentorship (admin only)
- [ ] Delete mentorship (admin only)
- [ ] Get applications for mentorship (admin only)
- [ ] Accept application (admin only)
- [ ] Reject application (admin only)
- [ ] Notifications sent on accept/reject

---

## Summary

### ✅ What IS Implemented

1. **Authorization:** Chapter Admins and Super Admins CAN create, update, and delete mentorships
2. **CRUD Operations:** Full create, read, update, delete functionality
3. **Application Management:** Admins can view, accept, and reject applications
4. **Filtering:** Comprehensive filtering by chapter, format, role, expertise, days, search
5. **Notifications:** Automatic notifications on application submission and review
6. **User Context:** `isSaved` and `hasApplied` flags when user is authenticated
7. **View Tracking:** Automatic view count increment

### ❌ What is NOT Implemented

- No additional permission checks beyond `requireChapterAdmin`
- No chapter-specific restrictions (Chapter Admin can manage any mentorship)
- No ownership validation (any admin can update/delete any mentorship)

### 🔧 Recommendation

The backend IS correctly configured to allow Chapter Admins to create mentorships. If the frontend is showing "Access Denied", the issue is likely:

1. **Token Issue:** The JWT token doesn't have the correct `accountType`
2. **User Model Issue:** The user's `accountType` in the database is not set to `CHAPTER_ADMIN`
3. **Frontend Error Handling:** The frontend is misinterpreting a different error as 403

**Next Steps:**
1. Verify the user's `accountType` in the database
2. Check the JWT token payload
3. Test the API endpoint directly with Postman/Thunder Client
4. Check browser network tab for actual API response
