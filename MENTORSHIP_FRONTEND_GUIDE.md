# Mentorship System - Complete Frontend Development Guide

**Version:** 1.0  
**Last Updated:** February 10, 2026  
**Base URL:** `/api/v1/mentorships`

---

## Table of Contents

1. [Overview](#overview)
2. [Data Models](#data-models)
3. [Admin Features](#admin-features)
4. [Member Features](#member-features)
5. [API Reference](#api-reference)
6. [UI/UX Guidelines](#uiux-guidelines)
7. [State Management](#state-management)
8. [Error Handling](#error-handling)

---

## Overview

The Mentorship System enables chapter admins to create mentorship opportunities and manage applications from members. Members can browse, search, apply for, and save mentorships.

### User Roles

| Role | Permissions |
|------|-------------|
| **Super Admin** | Full access - create, edit, delete any mentorship, manage all applications |
| **Chapter Admin** | Create/edit/delete mentorships for their chapter, manage applications for their mentorships |
| **Member** | View, search, apply, save mentorships |

---

## Data Models

### Mentorship

```typescript
interface Mentorship {
  _id: string;
  mentorName: string;              // Name of the mentor
  mentorRole: string;              // e.g., "Director", "Producer"
  areasOfExpertise: string[];      // e.g., ["Script Development", "Career Growth"]
  mentorshipFormat: "Virtual" | "Physical" | "Hybrid";
  
  // Schedule Information
  startPeriod: string;             // ISO date string
  endPeriod: string;               // ISO date string
  days: DayOfWeek[];               // ["Monday", "Wednesday", "Friday"]
  timeFrame: string;               // e.g., "12:30pm - 3:00pm"
  
  // Optional Fields
  mentorshipLink?: string;         // URL for virtual meetings
  description: string;             // Details about the mentorship
  eligibility?: string;            // Eligibility criteria
  
  // Metadata
  chapterId?: string | null;       // null = global mentorship
  createdBy: string;               // Admin who created it
  status: "Open" | "Closed";
  viewCount: number;               // Engagement tracking
  
  // Timestamps
  createdAt: string;               // ISO date string
  updatedAt: string;               // ISO date string
  
  // User-specific (only when authenticated)
  isSaved?: boolean;               // Has current user saved this?
  hasApplied?: boolean;            // Has current user applied?
}

enum DayOfWeek {
  Monday = "Monday",
  Tuesday = "Tuesday",
  Wednesday = "Wednesday",
  Thursday = "Thursday",
  Friday = "Friday",
  Saturday = "Saturday",
  Sunday = "Sunday"
}
```

### MentorshipApplication

```typescript
interface MentorshipApplication {
  _id: string;
  mentorshipId: string;
  applicantId: string | UserProfile;  // Populated with user details
  status: ApplicationStatus;
  message: string;                    // Application message from user
  
  // Admin Review
  adminResponse?: string;             // Optional response from admin
  reviewedBy?: string;                // Admin who reviewed
  reviewedAt?: string;                // ISO date string
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

enum ApplicationStatus {
  Pending = "Pending",
  Accepted = "Accepted",
  Rejected = "Rejected",
  Withdrawn = "Withdrawn"
}

interface UserProfile {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePhoto?: string;
}
```

### SavedMentorship

```typescript
interface SavedMentorship {
  _id: string;
  userId: string;
  mentorshipId: string | Mentorship;  // Populated with full mentorship
  createdAt: string;
}
```

---

## Admin Features

### 1. Create Mentorship

**Endpoint:** `POST /api/v1/mentorships`  
**Auth Required:** Yes (Chapter Admin or Super Admin)

#### Request Body

```typescript
interface CreateMentorshipDTO {
  mentorName: string;              // Required, max 200 chars
  mentorRole: string;              // Required, max 100 chars
  areasOfExpertise: string[];      // Required, min 1 item
  mentorshipFormat: "Virtual" | "Physical" | "Hybrid";  // Required
  
  // Schedule
  startPeriod: string;             // Required, ISO date, must be future
  endPeriod: string;               // Required, ISO date, must be after startPeriod
  days: DayOfWeek[];               // Required, min 1 day
  timeFrame: string;               // Required, e.g., "12:30pm - 3:00pm"
  
  // Optional
  mentorshipLink?: string;         // Optional, valid URL
  description: string;             // Required, max 2000 chars
  eligibility?: string;            // Optional, max 500 chars
  
  // Metadata
  chapterId?: string;              // Optional, defaults to admin's chapter
  status?: "Open" | "Closed";     // Optional, defaults to "Open"
}
```

#### Validation Rules

| Field | Rules |
|-------|-------|
| `mentorName` | Required, 1-200 characters |
| `mentorRole` | Required, 1-100 characters |
| `areasOfExpertise` | Required, array with at least 1 item |
| `mentorshipFormat` | Required, must be "Virtual", "Physical", or "Hybrid" |
| `startPeriod` | Required, must be a future date |
| `endPeriod` | Required, must be after `startPeriod` |
| `days` | Required, array with at least 1 valid day |
| `timeFrame` | Required, string |
| `mentorshipLink` | Optional, must be valid URL if provided |
| `description` | Required, 1-2000 characters |
| `eligibility` | Optional, max 500 characters |

#### Example Request

```bash
POST /api/v1/mentorships
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json

{
  "mentorName": "Jane Doe",
  "mentorRole": "Award-Winning Director",
  "areasOfExpertise": ["Script Development", "Career Growth", "Networking"],
  "mentorshipFormat": "Virtual",
  "startPeriod": "2026-03-01T00:00:00.000Z",
  "endPeriod": "2026-06-01T00:00:00.000Z",
  "days": ["Monday", "Wednesday", "Friday"],
  "timeFrame": "12:30pm - 3:00pm",
  "mentorshipLink": "https://zoom.us/j/123456789",
  "description": "Join me for a 3-month mentorship program focused on script development and career growth in the film industry. We'll have weekly sessions covering story structure, character development, and industry networking.",
  "eligibility": "Open to all WIFT Africa members with at least 1 year of experience in screenwriting",
  "status": "Open"
}
```

#### Success Response

```json
{
  "message": "Mentorship created successfully",
  "data": {
    "_id": "65f1a2b3c4d5e6f7g8h9i0j1",
    "mentorName": "Jane Doe",
    "mentorRole": "Award-Winning Director",
    "areasOfExpertise": ["Script Development", "Career Growth", "Networking"],
    "mentorshipFormat": "Virtual",
    "startPeriod": "2026-03-01T00:00:00.000Z",
    "endPeriod": "2026-06-01T00:00:00.000Z",
    "days": ["Monday", "Wednesday", "Friday"],
    "timeFrame": "12:30pm - 3:00pm",
    "mentorshipLink": "https://zoom.us/j/123456789",
    "description": "Join me for a 3-month mentorship program...",
    "eligibility": "Open to all WIFT Africa members...",
    "chapterId": "65f1a2b3c4d5e6f7g8h9i0j0",
    "createdBy": "65f1a2b3c4d5e6f7g8h9i0j2",
    "status": "Open",
    "viewCount": 0,
    "createdAt": "2026-02-10T11:00:00.000Z",
    "updatedAt": "2026-02-10T11:00:00.000Z"
  }
}
```

#### UI Implementation Guide

**Form Fields:**

1. **Mentor Information Section**
   - Mentor Name (text input)
   - Mentor Role (text input)
   - Areas of Expertise (multi-select or tag input)

2. **Format & Schedule Section**
   - Format (radio buttons: Virtual, Physical, Hybrid)
   - Start Date (date picker)
   - End Date (date picker)
   - Available Days (checkbox group for days of week)
   - Time Frame (time range picker or text input)
   - Meeting Link (text input, show only if Virtual or Hybrid)

3. **Details Section**
   - Description (rich text editor or textarea)
   - Eligibility Criteria (textarea, optional)

4. **Settings Section**
   - Chapter (dropdown, pre-filled with admin's chapter)
   - Status (toggle: Open/Closed)

**Validation Messages:**

```typescript
const validationMessages = {
  mentorName: {
    required: "Mentor name is required",
    maxLength: "Mentor name must be less than 200 characters"
  },
  startPeriod: {
    required: "Start date is required",
    future: "Start date must be in the future"
  },
  endPeriod: {
    required: "End date is required",
    afterStart: "End date must be after start date"
  },
  days: {
    required: "Please select at least one day"
  },
  mentorshipLink: {
    invalidUrl: "Please enter a valid URL"
  }
};
```

---

### 2. Update Mentorship

**Endpoint:** `PATCH /api/v1/mentorships/:mentorshipId`  
**Auth Required:** Yes (Chapter Admin or Super Admin)

#### Request Body

Same as Create, but all fields are optional. Only include fields you want to update.

#### Example Request

```bash
PATCH /api/v1/mentorships/65f1a2b3c4d5e6f7g8h9i0j1
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json

{
  "status": "Closed",
  "description": "Updated description with new information"
}
```

#### Success Response

```json
{
  "message": "Mentorship updated successfully",
  "data": {
    "_id": "65f1a2b3c4d5e6f7g8h9i0j1",
    // ... full mentorship object with updates
  }
}
```

---

### 3. Delete Mentorship

**Endpoint:** `DELETE /api/v1/mentorships/:mentorshipId`  
**Auth Required:** Yes (Chapter Admin or Super Admin)

#### Example Request

```bash
DELETE /api/v1/mentorships/65f1a2b3c4d5e6f7g8h9i0j1
Authorization: Bearer <ADMIN_TOKEN>
```

#### Success Response

```json
{
  "message": "Mentorship deleted successfully"
}
```

#### UI Implementation

**Confirmation Dialog:**
```
Title: Delete Mentorship?
Message: Are you sure you want to delete this mentorship? This action cannot be undone. All applications will also be deleted.
Actions: [Cancel] [Delete]
```

---

### 4. View Applications for Mentorship

**Endpoint:** `GET /api/v1/mentorships/:mentorshipId/applications`  
**Auth Required:** Yes (Chapter Admin or Super Admin)  
**Query Parameters:** `?status=Pending` (optional)

#### Example Request

```bash
GET /api/v1/mentorships/65f1a2b3c4d5e6f7g8h9i0j1/applications?status=Pending
Authorization: Bearer <ADMIN_TOKEN>
```

#### Success Response

```json
{
  "data": [
    {
      "_id": "65f1a2b3c4d5e6f7g8h9i0j3",
      "mentorshipId": "65f1a2b3c4d5e6f7g8h9i0j1",
      "applicantId": {
        "_id": "65f1a2b3c4d5e6f7g8h9i0j4",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com",
        "profilePhoto": "https://..."
      },
      "status": "Pending",
      "message": "I am very interested in this mentorship because I want to improve my scriptwriting skills and learn from an experienced director. I have been working on my first feature film script for the past 6 months.",
      "createdAt": "2026-02-10T10:00:00.000Z",
      "updatedAt": "2026-02-10T10:00:00.000Z"
    }
  ]
}
```

#### UI Implementation - Applications Management Page

**Layout:**

```
┌─────────────────────────────────────────────────────┐
│ Mentorship: Jane Doe - Script Development          │
│ Applications (12 total)                             │
├─────────────────────────────────────────────────────┤
│ Filters: [All] [Pending (5)] [Accepted (4)]        │
│          [Rejected (2)] [Withdrawn (1)]             │
├─────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────┐ │
│ │ 👤 John Doe                    Status: Pending  │ │
│ │ john@example.com                                │ │
│ │ Applied: Feb 10, 2026                           │ │
│ │                                                 │ │
│ │ Message:                                        │ │
│ │ "I am very interested in this mentorship..."    │ │
│ │                                                 │ │
│ │ [View Profile] [Accept] [Reject]                │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ ┌─────────────────────────────────────────────────┐ │
│ │ 👤 Jane Smith                  Status: Pending  │ │
│ │ ...                                             │ │
│ └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

**Status Badge Colors:**
- Pending: Yellow/Orange
- Accepted: Green
- Rejected: Red
- Withdrawn: Gray

---

### 5. Accept Application

**Endpoint:** `PATCH /api/v1/mentorships/applications/:applicationId/accept`  
**Auth Required:** Yes (Chapter Admin or Super Admin)

#### Request Body

```typescript
interface AcceptApplicationDTO {
  adminResponse?: string;  // Optional message to applicant
}
```

#### Example Request

```bash
PATCH /api/v1/mentorships/applications/65f1a2b3c4d5e6f7g8h9i0j3/accept
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json

{
  "adminResponse": "Congratulations! Looking forward to working with you. Please check your email for the meeting link and schedule."
}
```

#### Success Response

```json
{
  "message": "Application accepted",
  "data": {
    "_id": "65f1a2b3c4d5e6f7g8h9i0j3",
    "status": "Accepted",
    "adminResponse": "Congratulations! Looking forward to working with you...",
    "reviewedBy": "65f1a2b3c4d5e6f7g8h9i0j2",
    "reviewedAt": "2026-02-10T11:30:00.000Z",
    // ... rest of application data
  }
}
```

#### UI Implementation

**Accept Dialog:**
```
Title: Accept Application
Message: You are about to accept John Doe's application.

[Optional Message to Applicant]
┌─────────────────────────────────────────────┐
│ Congratulations! Looking forward to...     │
│                                             │
└─────────────────────────────────────────────┘

Actions: [Cancel] [Accept & Notify]
```

**What Happens:**
1. Application status changes to "Accepted"
2. Applicant receives notification
3. Admin response is saved and sent to applicant
4. Application card updates in real-time

---

### 6. Reject Application

**Endpoint:** `PATCH /api/v1/mentorships/applications/:applicationId/reject`  
**Auth Required:** Yes (Chapter Admin or Super Admin)

#### Request Body

```typescript
interface RejectApplicationDTO {
  adminResponse?: string;  // Optional feedback to applicant
}
```

#### Example Request

```bash
PATCH /api/v1/mentorships/applications/65f1a2b3c4d5e6f7g8h9i0j3/reject
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json

{
  "adminResponse": "Thank you for your interest. Unfortunately, we have reached our capacity for this mentorship program. We encourage you to apply for future opportunities."
}
```

#### Success Response

```json
{
  "message": "Application rejected",
  "data": {
    "_id": "65f1a2b3c4d5e6f7g8h9i0j3",
    "status": "Rejected",
    "adminResponse": "Thank you for your interest...",
    "reviewedBy": "65f1a2b3c4d5e6f7g8h9i0j2",
    "reviewedAt": "2026-02-10T11:30:00.000Z",
    // ... rest of application data
  }
}
```

#### UI Implementation

**Reject Dialog:**
```
Title: Reject Application
Message: You are about to reject John Doe's application.

[Optional Feedback to Applicant]
┌─────────────────────────────────────────────┐
│ Thank you for your interest...             │
│                                             │
└─────────────────────────────────────────────┘

Actions: [Cancel] [Reject & Notify]
```

---

### 7. Admin Dashboard - Mentorship Management

**Recommended Page Structure:**

```
┌─────────────────────────────────────────────────────┐
│ My Mentorships                    [+ Create New]    │
├─────────────────────────────────────────────────────┤
│ Filters: [All] [Open] [Closed]                     │
│ Sort by: [Newest] [Oldest] [Most Applications]     │
├─────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────┐ │
│ │ 📚 Script Development Mentorship                │ │
│ │ Jane Doe • Virtual • Open                       │ │
│ │ Mar 1 - Jun 1, 2026                             │ │
│ │                                                 │ │
│ │ 👥 12 Applications (5 Pending, 4 Accepted)      │ │
│ │ 👁️ 145 views                                    │ │
│ │                                                 │ │
│ │ [View Applications] [Edit] [Close] [Delete]     │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ ┌─────────────────────────────────────────────────┐ │
│ │ 🎬 Film Production Mentorship                   │ │
│ │ ...                                             │ │
│ └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

**Key Metrics to Display:**
- Total applications count
- Pending applications count (highlighted)
- Accepted applications count
- View count
- Status (Open/Closed)
- Date range

---

## Member Features

### 1. Browse Mentorships

**Endpoint:** `GET /api/v1/mentorships`  
**Auth Required:** Yes (for user-specific data like `isSaved`, `hasApplied`)

#### Query Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `search` | string | Search in mentor name, description, expertise | `?search=script` |
| `chapterId` | string | Filter by chapter | `?chapterId=65f1...` |
| `format` | string | Filter by format | `?format=Virtual` |
| `role` | string | Filter by mentor role | `?role=Director` |
| `expertise` | string | Filter by area of expertise | `?expertise=Script Development` |
| `days` | string | Filter by available day | `?days=Monday` |
| `status` | string | Filter by status (default: Open) | `?status=Open` |
| `sortBy` | string | Sort order | `?sortBy=popular` |

**Sort Options:**
- `newest` - Newest first (default)
- `oldest` - Oldest first
- `popular` - Most viewed first
- `startDate` - Earliest start date first

#### Example Request

```bash
GET /api/v1/mentorships?search=script&format=Virtual&sortBy=popular
Authorization: Bearer <USER_TOKEN>
```

#### Success Response

```json
{
  "data": [
    {
      "_id": "65f1a2b3c4d5e6f7g8h9i0j1",
      "mentorName": "Jane Doe",
      "mentorRole": "Award-Winning Director",
      "areasOfExpertise": ["Script Development", "Career Growth"],
      "mentorshipFormat": "Virtual",
      "startPeriod": "2026-03-01T00:00:00.000Z",
      "endPeriod": "2026-06-01T00:00:00.000Z",
      "days": ["Monday", "Wednesday", "Friday"],
      "timeFrame": "12:30pm - 3:00pm",
      "description": "Join me for a 3-month mentorship program...",
      "viewCount": 145,
      "status": "Open",
      "isSaved": false,
      "hasApplied": false,
      "createdAt": "2026-02-10T11:00:00.000Z"
    }
  ]
}
```

#### UI Implementation - Browse Page

**Layout:**

```
┌─────────────────────────────────────────────────────┐
│ Mentorship Opportunities                            │
├─────────────────────────────────────────────────────┤
│ 🔍 [Search mentorships...]                          │
├─────────────────────────────────────────────────────┤
│ Filters:                                            │
│ Format: [All] [Virtual] [Physical] [Hybrid]         │
│ Days: [Mon] [Tue] [Wed] [Thu] [Fri] [Sat] [Sun]    │
│ Expertise: [Dropdown with all expertise areas]      │
│                                                     │
│ Sort: [Most Popular ▼]                              │
├─────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────┐ │
│ │ 📚 Script Development Mentorship      ⭐ [Save] │ │
│ │ Jane Doe • Award-Winning Director               │ │
│ │                                                 │ │
│ │ 🌐 Virtual • Mon, Wed, Fri • 12:30pm - 3:00pm  │ │
│ │ 📅 Mar 1 - Jun 1, 2026                          │ │
│ │                                                 │ │
│ │ 🎯 Script Development, Career Growth            │ │
│ │                                                 │ │
│ │ Join me for a 3-month mentorship program...     │ │
│ │                                                 │ │
│ │ 👁️ 145 views                                    │ │
│ │                                                 │ │
│ │ [View Details] [Apply Now]                      │ │
│ └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

**Card States:**
- Default: White background, "Apply Now" button
- Saved: Star icon filled, "Saved" badge
- Applied: "Applied" badge, "View Application" button
- Closed: Grayed out, "Closed" badge

---

### 2. View Mentorship Details

**Endpoint:** `GET /api/v1/mentorships/:mentorshipId`  
**Auth Required:** Yes

**Note:** This endpoint automatically increments the view count.

#### Example Request

```bash
GET /api/v1/mentorships/65f1a2b3c4d5e6f7g8h9i0j1
Authorization: Bearer <USER_TOKEN>
```

#### Success Response

```json
{
  "data": {
    "_id": "65f1a2b3c4d5e6f7g8h9i0j1",
    "mentorName": "Jane Doe",
    "mentorRole": "Award-Winning Director",
    "areasOfExpertise": ["Script Development", "Career Growth", "Networking"],
    "mentorshipFormat": "Virtual",
    "startPeriod": "2026-03-01T00:00:00.000Z",
    "endPeriod": "2026-06-01T00:00:00.000Z",
    "days": ["Monday", "Wednesday", "Friday"],
    "timeFrame": "12:30pm - 3:00pm",
    "mentorshipLink": "https://zoom.us/j/123456789",
    "description": "Join me for a 3-month mentorship program...",
    "eligibility": "Open to all WIFT Africa members...",
    "viewCount": 146,
    "status": "Open",
    "isSaved": false,
    "hasApplied": false,
    "createdAt": "2026-02-10T11:00:00.000Z"
  }
}
```

#### UI Implementation - Details Page

```
┌─────────────────────────────────────────────────────┐
│ ← Back to Mentorships                    ⭐ [Save]  │
├─────────────────────────────────────────────────────┤
│ 📚 Script Development Mentorship                    │
│ Jane Doe • Award-Winning Director                   │
│                                                     │
│ Status: 🟢 Open                                     │
├─────────────────────────────────────────────────────┤
│ 📋 Details                                          │
│                                                     │
│ Format: 🌐 Virtual                                  │
│ Schedule: Mon, Wed, Fri • 12:30pm - 3:00pm         │
│ Duration: Mar 1 - Jun 1, 2026 (3 months)           │
│ Meeting Link: https://zoom.us/j/123456789          │
│                                                     │
│ Areas of Expertise:                                 │
│ • Script Development                                │
│ • Career Growth                                     │
│ • Networking                                        │
├─────────────────────────────────────────────────────┤
│ 📝 About This Mentorship                            │
│                                                     │
│ Join me for a 3-month mentorship program focused    │
│ on script development and career growth in the      │
│ film industry. We'll have weekly sessions...        │
├─────────────────────────────────────────────────────┤
│ ✅ Eligibility                                      │
│                                                     │
│ Open to all WIFT Africa members with at least      │
│ 1 year of experience in screenwriting              │
├─────────────────────────────────────────────────────┤
│ 👁️ 146 views                                        │
│                                                     │
│ [Apply for This Mentorship]                         │
└─────────────────────────────────────────────────────┘
```

---

### 3. Apply for Mentorship

**Endpoint:** `POST /api/v1/mentorships/:mentorshipId/apply`  
**Auth Required:** Yes

#### Request Body

```typescript
interface ApplyForMentorshipDTO {
  message: string;  // Required, max 1000 chars
}
```

#### Example Request

```bash
POST /api/v1/mentorships/65f1a2b3c4d5e6f7g8h9i0j1/apply
Authorization: Bearer <USER_TOKEN>
Content-Type: application/json

{
  "message": "I am very interested in this mentorship because I want to improve my scriptwriting skills and learn from an experienced director. I have been working on my first feature film script for the past 6 months and would love guidance on story structure and character development."
}
```

#### Success Response

```json
{
  "message": "Application submitted successfully",
  "data": {
    "_id": "65f1a2b3c4d5e6f7g8h9i0j3",
    "mentorshipId": "65f1a2b3c4d5e6f7g8h9i0j1",
    "applicantId": "65f1a2b3c4d5e6f7g8h9i0j4",
    "status": "Pending",
    "message": "I am very interested in this mentorship...",
    "createdAt": "2026-02-10T12:00:00.000Z"
  }
}
```

#### Error Responses

```json
// Already applied
{
  "error": "You have already applied for this mentorship"
}

// Mentorship closed
{
  "error": "This mentorship is no longer accepting applications"
}
```

#### UI Implementation - Application Form

```
┌─────────────────────────────────────────────────────┐
│ Apply for Script Development Mentorship             │
├─────────────────────────────────────────────────────┤
│ Tell us why you're interested in this mentorship    │
│ and what you hope to gain from it.                  │
│                                                     │
│ ┌─────────────────────────────────────────────────┐ │
│ │ I am very interested in this mentorship         │ │
│ │ because...                                      │ │
│ │                                                 │ │
│ │                                                 │ │
│ │                                                 │ │
│ └─────────────────────────────────────────────────┘ │
│ 0 / 1000 characters                                 │
│                                                     │
│ [Cancel] [Submit Application]                       │
└─────────────────────────────────────────────────────┘
```

**Success Message:**
```
✅ Application Submitted!
Your application has been sent to the mentor. You'll receive a notification when it's reviewed.
```

---

### 4. View My Applications

**Endpoint:** `GET /api/v1/mentorships/applications/my`  
**Auth Required:** Yes  
**Query Parameters:** `?status=Pending` (optional)

#### Example Request

```bash
GET /api/v1/mentorships/applications/my?status=Pending
Authorization: Bearer <USER_TOKEN>
```

#### Success Response

```json
{
  "data": [
    {
      "_id": "65f1a2b3c4d5e6f7g8h9i0j3",
      "mentorshipId": {
        "_id": "65f1a2b3c4d5e6f7g8h9i0j1",
        "mentorName": "Jane Doe",
        "mentorRole": "Award-Winning Director",
        "mentorshipFormat": "Virtual",
        "startPeriod": "2026-03-01T00:00:00.000Z",
        "status": "Open"
      },
      "status": "Pending",
      "message": "I am very interested in this mentorship...",
      "createdAt": "2026-02-10T12:00:00.000Z"
    }
  ]
}
```

#### UI Implementation - My Applications Page

```
┌─────────────────────────────────────────────────────┐
│ My Applications                                     │
├─────────────────────────────────────────────────────┤
│ Filters: [All (12)] [Pending (5)] [Accepted (4)]   │
│          [Rejected (2)] [Withdrawn (1)]             │
├─────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────┐ │
│ │ 📚 Script Development Mentorship                │ │
│ │ Jane Doe • Virtual                              │ │
│ │                                                 │ │
│ │ Status: ⏳ Pending Review                       │ │
│ │ Applied: Feb 10, 2026                           │ │
│ │                                                 │ │
│ │ Your Message:                                   │ │
│ │ "I am very interested in this mentorship..."    │ │
│ │                                                 │ │
│ │ [View Mentorship] [Withdraw Application]        │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ ┌─────────────────────────────────────────────────┐ │
│ │ 🎬 Film Production Mentorship                   │ │
│ │ John Smith • Physical                           │ │
│ │                                                 │ │
│ │ Status: ✅ Accepted                             │ │
│ │ Applied: Feb 5, 2026 • Reviewed: Feb 7, 2026   │ │
│ │                                                 │ │
│ │ Admin Response:                                 │ │
│ │ "Congratulations! Looking forward to..."        │ │
│ │                                                 │ │
│ │ [View Mentorship] [View Details]                │ │
│ └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

---

### 5. Withdraw Application

**Endpoint:** `PATCH /api/v1/mentorships/applications/:applicationId/withdraw`  
**Auth Required:** Yes

**Note:** Can only withdraw pending applications.

#### Example Request

```bash
PATCH /api/v1/mentorships/applications/65f1a2b3c4d5e6f7g8h9i0j3/withdraw
Authorization: Bearer <USER_TOKEN>
```

#### Success Response

```json
{
  "message": "Application withdrawn",
  "data": {
    "_id": "65f1a2b3c4d5e6f7g8h9i0j3",
    "status": "Withdrawn",
    // ... rest of application data
  }
}
```

#### UI Implementation

**Confirmation Dialog:**
```
Title: Withdraw Application?
Message: Are you sure you want to withdraw your application for "Script Development Mentorship"? This action cannot be undone.
Actions: [Cancel] [Withdraw]
```

---

### 6. Save/Favorite Mentorship

**Endpoint:** `POST /api/v1/mentorships/:mentorshipId/save`  
**Auth Required:** Yes

#### Example Request

```bash
POST /api/v1/mentorships/65f1a2b3c4d5e6f7g8h9i0j1/save
Authorization: Bearer <USER_TOKEN>
```

#### Success Response

```json
{
  "message": "Mentorship saved"
}
```

#### UI Implementation

**Save Button States:**
- Unsaved: ⭐ (outline star) "Save"
- Saved: ⭐ (filled star) "Saved"
- Hover: Show tooltip "Save for later"

---

### 7. Unsave Mentorship

**Endpoint:** `DELETE /api/v1/mentorships/:mentorshipId/unsave`  
**Auth Required:** Yes

#### Example Request

```bash
DELETE /api/v1/mentorships/65f1a2b3c4d5e6f7g8h9i0j1/unsave
Authorization: Bearer <USER_TOKEN>
```

#### Success Response

```json
{
  "message": "Mentorship unsaved"
}
```

---

### 8. View Saved Mentorships

**Endpoint:** `GET /api/v1/mentorships/saved`  
**Auth Required:** Yes

#### Example Request

```bash
GET /api/v1/mentorships/saved
Authorization: Bearer <USER_TOKEN>
```

#### Success Response

```json
{
  "data": [
    {
      "_id": "65f1a2b3c4d5e6f7g8h9i0j5",
      "mentorshipId": {
        "_id": "65f1a2b3c4d5e6f7g8h9i0j1",
        "mentorName": "Jane Doe",
        "mentorRole": "Award-Winning Director",
        // ... full mentorship data
      },
      "createdAt": "2026-02-10T11:00:00.000Z"
    }
  ]
}
```

#### UI Implementation - Saved Mentorships Page

```
┌─────────────────────────────────────────────────────┐
│ Saved Mentorships (5)                               │
├─────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────┐ │
│ │ 📚 Script Development Mentorship      ⭐ Saved  │ │
│ │ Jane Doe • Virtual                              │ │
│ │ Saved on: Feb 10, 2026                          │ │
│ │                                                 │ │
│ │ [View Details] [Apply Now] [Remove]             │ │
│ └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

---

## API Reference Summary

### Admin Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/v1/mentorships` | Create mentorship | Admin |
| `PATCH` | `/api/v1/mentorships/:id` | Update mentorship | Admin |
| `DELETE` | `/api/v1/mentorships/:id` | Delete mentorship | Admin |
| `GET` | `/api/v1/mentorships/:id/applications` | Get applications | Admin |
| `PATCH` | `/api/v1/mentorships/applications/:id/accept` | Accept application | Admin |
| `PATCH` | `/api/v1/mentorships/applications/:id/reject` | Reject application | Admin |

### Member Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/v1/mentorships` | List mentorships | Member |
| `GET` | `/api/v1/mentorships/:id` | Get mentorship details | Member |
| `POST` | `/api/v1/mentorships/:id/apply` | Apply for mentorship | Member |
| `GET` | `/api/v1/mentorships/applications/my` | Get my applications | Member |
| `PATCH` | `/api/v1/mentorships/applications/:id/withdraw` | Withdraw application | Member |
| `POST` | `/api/v1/mentorships/:id/save` | Save mentorship | Member |
| `DELETE` | `/api/v1/mentorships/:id/unsave` | Unsave mentorship | Member |
| `GET` | `/api/v1/mentorships/saved` | Get saved mentorships | Member |

---

## UI/UX Guidelines

### Design Principles

1. **Clear Status Indicators**
   - Use color-coded badges for application statuses
   - Show mentorship availability (Open/Closed) prominently
   - Display user-specific states (saved, applied)

2. **Responsive Feedback**
   - Show loading states during API calls
   - Display success/error messages
   - Update UI optimistically where appropriate

3. **Accessibility**
   - Use semantic HTML
   - Provide ARIA labels
   - Ensure keyboard navigation
   - Maintain color contrast ratios

4. **Mobile-First**
   - Design for mobile screens first
   - Use responsive layouts
   - Optimize touch targets (min 44x44px)

### Color Scheme Recommendations

```css
/* Status Colors */
--status-open: #10B981;      /* Green */
--status-closed: #6B7280;    /* Gray */
--status-pending: #F59E0B;   /* Amber */
--status-accepted: #10B981;  /* Green */
--status-rejected: #EF4444;  /* Red */
--status-withdrawn: #6B7280; /* Gray */

/* Format Icons */
--format-virtual: #3B82F6;   /* Blue */
--format-physical: #8B5CF6;  /* Purple */
--format-hybrid: #EC4899;    /* Pink */
```

### Icon Recommendations

- 📚 Mentorship/Learning
- 🌐 Virtual format
- 📍 Physical format
- 🔄 Hybrid format
- ⭐ Save/Favorite
- 👁️ View count
- 👥 Applications count
- ✅ Accepted
- ⏳ Pending
- ❌ Rejected
- 🔙 Withdrawn

---

## State Management

### Recommended State Structure

```typescript
interface MentorshipState {
  // Lists
  mentorships: Mentorship[];
  savedMentorships: SavedMentorship[];
  myApplications: MentorshipApplication[];
  
  // Admin-specific
  adminMentorships: Mentorship[];
  mentorshipApplications: Record<string, MentorshipApplication[]>;
  
  // UI State
  loading: boolean;
  error: string | null;
  filters: {
    search: string;
    format: string;
    days: string[];
    expertise: string;
    status: string;
    sortBy: string;
  };
  
  // Pagination
  currentPage: number;
  totalPages: number;
}
```

### Actions

```typescript
// Fetch Actions
fetchMentorships(filters)
fetchMentorshipDetails(id)
fetchMyApplications(status?)
fetchSavedMentorships()

// Admin Actions
createMentorship(data)
updateMentorship(id, data)
deleteMentorship(id)
fetchApplications(mentorshipId, status?)
acceptApplication(applicationId, adminResponse?)
rejectApplication(applicationId, adminResponse?)

// Member Actions
applyForMentorship(mentorshipId, message)
withdrawApplication(applicationId)
saveMentorship(mentorshipId)
unsaveMentorship(mentorshipId)
```

---

## Error Handling

### Common Error Codes

| Status Code | Meaning | User Message |
|-------------|---------|--------------|
| 400 | Bad Request | "Please check your input and try again" |
| 401 | Unauthorized | "Please log in to continue" |
| 403 | Forbidden | "You don't have permission to perform this action" |
| 404 | Not Found | "Mentorship not found" |
| 409 | Conflict | "You have already applied for this mentorship" |
| 500 | Server Error | "Something went wrong. Please try again later" |

### Error Display

```typescript
interface ErrorDisplay {
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Example
const errorDisplay: ErrorDisplay = {
  title: "Application Failed",
  message: "You have already applied for this mentorship",
  action: {
    label: "View My Applications",
    onClick: () => navigate('/applications')
  }
};
```

---

## Notifications

### Real-Time Updates

The system sends real-time notifications via Socket.IO for:

1. **New Application** (to admin)
   - Type: `MENTORSHIP_APPLICATION`
   - Triggers when member applies

2. **Application Accepted** (to member)
   - Type: `MENTORSHIP_ACCEPTED`
   - Triggers when admin accepts

3. **Application Rejected** (to member)
   - Type: `MENTORSHIP_REJECTED`
   - Triggers when admin rejects

### Notification Handling

```typescript
// Listen for notifications
socket.on('notification:new', (notification) => {
  if (notification.type === 'MENTORSHIP_APPLICATION') {
    // Show toast notification
    // Update applications count
    // Optionally refresh applications list
  }
});
```

---

## Testing Checklist

### Admin Flow
- [ ] Create mentorship with all fields
- [ ] Create mentorship with minimal fields
- [ ] Update mentorship
- [ ] Delete mentorship
- [ ] View applications
- [ ] Filter applications by status
- [ ] Accept application with message
- [ ] Accept application without message
- [ ] Reject application with feedback
- [ ] Reject application without feedback

### Member Flow
- [ ] Browse mentorships
- [ ] Search mentorships
- [ ] Filter by format
- [ ] Filter by days
- [ ] Sort by popularity
- [ ] View mentorship details
- [ ] Apply for mentorship
- [ ] View my applications
- [ ] Withdraw application
- [ ] Save mentorship
- [ ] Unsave mentorship
- [ ] View saved mentorships

### Edge Cases
- [ ] Apply to closed mentorship (should fail)
- [ ] Apply twice (should fail)
- [ ] Withdraw accepted application (should fail)
- [ ] Non-admin creates mentorship (should fail)
- [ ] View count increments correctly
- [ ] Notifications sent correctly

---

## Performance Optimization

### Recommendations

1. **Pagination**
   - Implement infinite scroll or pagination for mentorship lists
   - Load 20 items per page

2. **Caching**
   - Cache mentorship list with filters
   - Invalidate cache on create/update/delete
   - Cache user's applications and saved mentorships

3. **Optimistic Updates**
   - Update UI immediately for save/unsave
   - Revert on error

4. **Debouncing**
   - Debounce search input (300ms)
   - Debounce filter changes (200ms)

5. **Image Optimization**
   - Use lazy loading for mentor photos
   - Serve appropriately sized images

---

## Appendix

### Sample Data

```json
{
  "mentorName": "Jane Doe",
  "mentorRole": "Award-Winning Director",
  "areasOfExpertise": ["Script Development", "Career Growth", "Networking"],
  "mentorshipFormat": "Virtual",
  "startPeriod": "2026-03-01T00:00:00.000Z",
  "endPeriod": "2026-06-01T00:00:00.000Z",
  "days": ["Monday", "Wednesday", "Friday"],
  "timeFrame": "12:30pm - 3:00pm",
  "mentorshipLink": "https://zoom.us/j/123456789",
  "description": "Join me for a 3-month mentorship program focused on script development and career growth in the film industry.",
  "eligibility": "Open to all WIFT Africa members with at least 1 year of experience in screenwriting"
}
```

### Useful Resources

- [Swagger Documentation](http://localhost:5000/api-docs) - Interactive API documentation
- Backend Repository: `/src/modules/mentorship/`
- Models: `/src/models/Mentorship.ts`, `/src/models/MentorshipApplication.ts`

---

**End of Documentation**

For questions or clarifications, please contact the backend team.
