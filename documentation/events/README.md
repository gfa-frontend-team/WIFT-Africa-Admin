# Events Module - Complete Documentation

## Overview

The Events module manages the complete lifecycle of events in the WIFT Africa platform, including creation, approval workflows, RSVP management, and attendee tracking. It supports physical, virtual, and hybrid events with chapter-specific and global visibility.

---

## Table of Contents

1. [Architecture](#architecture)
2. [Data Models](#data-models)
3. [API Endpoints](#api-endpoints)
4. [Business Logic](#business-logic)
5. [Permissions & Authorization](#permissions--authorization)
6. [Email Notifications](#email-notifications)
7. [Event Lifecycle](#event-lifecycle)
8. [RSVP System](#rsvp-system)

---

## Architecture

### File Structure
```
src/
├── models/
│   ├── Event.ts              # Event data model
│   └── EventRSVP.ts          # RSVP data model
├── modules/events/
│   ├── events.controller.ts  # HTTP request handlers
│   └── events.routes.ts      # Route definitions
└── services/
    └── event.service.ts      # Business logic
```

### Technology Stack
- **Framework**: Express.js with TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Validation**: Zod schemas
- **Authentication**: JWT-based
- **Authorization**: Role-based (RBAC)
- **Email**: Custom API + SMTP2GO
- **Export**: CSV (json2csv) & PDF (pdfkit)

---

## Data Models

### Event Model

**File**: `src/models/Event.ts`

#### Schema Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | String | Yes | Event title (max 200 chars) |
| `description` | String | Yes | Event description (max 5000 chars) |
| `type` | EventType | Yes | Event category |
| `chapterId` | ObjectId | No | Associated chapter (null for global) |
| `organizer` | ObjectId | Yes | User/Admin who created the event |
| `startDate` | Date | Yes | Event start date/time |
| `endDate` | Date | Yes | Event end date/time |
| `timezone` | String | Yes | Timezone (e.g., "Africa/Lagos") |
| `location` | Object | Yes | Location details |
| `capacity` | Number | No | Maximum attendees |
| `currentAttendees` | Number | No | Current RSVP count (GOING) |
| `coverImage` | String | No | Cover image URL |
| `tags` | String[] | No | Event tags |
| `status` | EventStatus | Yes | Current status |
| `isPublished` | Boolean | No | Published flag |
| `isCancelled` | Boolean | No | Cancelled flag |
| `cancellationReason` | String | No | Reason for cancellation |
| `rejectionReason` | String | No | Reason for rejection |
| `approvedBy` | ObjectId | No | Admin who approved |
| `approvedAt` | Date | No | Approval timestamp |
| `submittedAt` | Date | No | Submission timestamp |
| `submitCount` | Number | No | Number of submissions |

#### Event Types (Enum)
```typescript
enum EventType {
  WORKSHOP = "WORKSHOP",
  SCREENING = "SCREENING",
  NETWORKING = "NETWORKING",
  MEETUP = "MEETUP",
  CONFERENCE = "CONFERENCE",
  OTHER = "OTHER"
}
```

#### Event Status (Enum)
```typescript
enum EventStatus {
  DRAFT = "DRAFT",           // Created but not submitted
  WAITING = "WAITING",       // Submitted, awaiting approval
  PUBLISHED = "PUBLISHED",   // Approved and visible
  CANCELLED = "CANCELLED",   // Cancelled by admin
  COMPLETED = "COMPLETED"    // Event has passed
}
```

#### Location Object
```typescript
{
  type: "PHYSICAL" | "VIRTUAL" | "HYBRID",
  address?: string,
  city?: string,
  country?: string,
  virtualUrl?: string
}
```



### EventRSVP Model

**File**: `src/models/EventRSVP.ts`

#### Schema Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `eventId` | ObjectId | Yes | Reference to Event |
| `userId` | ObjectId | Yes | Reference to User |
| `status` | RSVPStatus | Yes | RSVP status |
| `createdAt` | Date | Auto | RSVP timestamp |
| `updatedAt` | Date | Auto | Last update timestamp |

#### RSVP Status (Enum)
```typescript
enum RSVPStatus {
  GOING = "GOING",           // Confirmed attendance
  INTERESTED = "INTERESTED"  // Interested but not confirmed
}
```

#### Indexes
- Compound unique index on `(eventId, userId)` - prevents duplicate RSVPs
- Index on `eventId` for fast lookups
- Index on `userId` for user's RSVP history

---

## API Endpoints

### Public Endpoints

#### 1. List Events
```http
GET /api/v1/events
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `chapterId` | string | No | Filter by chapter |
| `month` | number | No | Filter by month (1-12) |
| `year` | number | No | Filter by year |

**Authentication:** Optional (shows RSVP status if authenticated)

**Response:**
```json
{
  "data": {
    "events": [
      {
        "id": "507f1f77bcf86cd799439011",
        "title": "Film Industry Networking Mixer",
        "description": "Join us for an evening of networking...",
        "type": "NETWORKING",
        "chapter": {
          "id": "507f1f77bcf86cd799439012",
          "name": "Lagos Chapter",
          "code": "LAG"
        },
        "organizer": {
          "id": "507f1f77bcf86cd799439013",
          "firstName": "Jane",
          "lastName": "Doe",
          "profilePhoto": "/uploads/profile.jpg"
        },
        "startDate": "2024-02-15T18:00:00Z",
        "endDate": "2024-02-15T21:00:00Z",
        "timezone": "Africa/Lagos",
        "location": {
          "type": "PHYSICAL",
          "address": "123 Victoria Island",
          "city": "Lagos",
          "country": "Nigeria"
        },
        "capacity": 50,
        "currentAttendees": 23,
        "coverImage": "/uploads/events/event-123.jpg",
        "tags": ["networking", "filmmaking"],
        "myRSVP": "GOING",
        "createdAt": "2024-01-15T10:00:00Z"
      }
    ],
    "total": 15
  }
}
```

**Visibility Rules:**
- **Guest/Regular User**: Only `PUBLISHED` events
- **Chapter Admin**: All events from their chapter + `PUBLISHED` from others
- **Super Admin**: All events regardless of status

---

#### 2. Get Event Details
```http
GET /api/v1/events/:eventId
```

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `eventId` | string | Yes | Event ID |

**Authentication:** Optional

**Response:**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "title": "Film Industry Networking Mixer",
  "description": "Join us for an evening of networking with industry professionals...",
  "type": "NETWORKING",
  "chapter": {
    "id": "507f1f77bcf86cd799439012",
    "name": "Lagos Chapter",
    "code": "LAG",
    "country": "Nigeria"
  },
  "organizer": {
    "id": "507f1f77bcf86cd799439013",
    "firstName": "Jane",
    "lastName": "Doe",
    "username": "janedoe",
    "profileSlug": "jane-doe",
    "profilePhoto": "/uploads/profile.jpg"
  },
  "startDate": "2024-02-15T18:00:00Z",
  "endDate": "2024-02-15T21:00:00Z",
  "timezone": "Africa/Lagos",
  "location": {
    "type": "PHYSICAL",
    "address": "123 Victoria Island, Lagos",
    "city": "Lagos",
    "country": "Nigeria"
  },
  "capacity": 50,
  "currentAttendees": 23,
  "coverImage": "/uploads/events/event-123.jpg",
  "tags": ["networking", "filmmaking", "industry"],
  "status": "PUBLISHED",
  "myRSVP": "GOING",
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-20T14:30:00Z"
}
```

**Error Responses:**
- `404`: Event not found or not visible to user

---

### Authenticated User Endpoints

#### 3. RSVP to Event
```http
POST /api/v1/events/:eventId/rsvp
```

**Authentication:** Required

**Request Body:**
```json
{
  "status": "GOING"
}
```

**Status Options:**
- `GOING` - Confirmed attendance
- `INTERESTED` - Interested but not confirmed

**Response:**
```json
{
  "message": "RSVP recorded successfully",
  "rsvp": {
    "eventId": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439014",
    "status": "GOING"
  }
}
```

**Error Responses:**
- `400`: Event is full or cancelled
- `401`: Unauthorized
- `404`: Event not found

**Business Rules:**
- Updates existing RSVP if user already RSVPd
- Increments `currentAttendees` when status changes to `GOING`
- Decrements `currentAttendees` when status changes from `GOING`
- Prevents RSVP if event is at capacity

---

#### 4. Cancel RSVP
```http
DELETE /api/v1/events/:eventId/rsvp
```

**Authentication:** Required

**Response:**
```json
{
  "message": "RSVP cancelled successfully"
}
```

**Error Responses:**
- `401`: Unauthorized
- `404`: RSVP not found

**Business Rules:**
- Decrements `currentAttendees` if status was `GOING`
- Completely removes RSVP record

---

### Admin Endpoints

#### 5. Create Event
```http
POST /api/v1/admin/events
```

**Authentication:** Required (Chapter Admin or Super Admin)

**Request Body:**
```json
{
  "title": "Film Industry Networking Mixer",
  "description": "Join us for an evening of networking with industry professionals",
  "type": "NETWORKING",
  "chapterId": "507f1f77bcf86cd799439012",
  "startDate": "2024-02-15T18:00:00Z",
  "endDate": "2024-02-15T21:00:00Z",
  "timezone": "Africa/Lagos",
  "location": {
    "type": "PHYSICAL",
    "address": "123 Victoria Island, Lagos",
    "city": "Lagos",
    "country": "Nigeria"
  },
  "capacity": 50,
  "coverImage": "/uploads/events/event-123.jpg",
  "tags": ["networking", "filmmaking", "industry"]
}
```

**Response:**
```json
{
  "message": "Event created successfully",
  "event": {
    "id": "507f1f77bcf86cd799439011",
    "title": "Film Industry Networking Mixer",
    "status": "DRAFT",
    "isPublished": false,
    ...
  }
}
```

**Authorization Rules:**
- **Chapter Admin**: Must specify `chapterId` matching their chapter
- **Super Admin**: Can create for any chapter or leave blank for global events
- **Super Admin**: Events are auto-published (`PUBLISHED` status)
- **Chapter Admin**: Events start as `DRAFT` (require approval)

**Validation:**
- `endDate` must be after `startDate`
- `title` max 200 characters
- `description` max 5000 characters
- `capacity` must be >= 1 if provided

---



#### 6. Update Event
```http
PATCH /api/v1/admin/events/:eventId
```

**Authentication:** Required (Chapter Admin or Super Admin)

**Request Body:** (All fields optional)
```json
{
  "title": "Updated Event Title",
  "description": "Updated description",
  "startDate": "2024-02-16T18:00:00Z",
  "endDate": "2024-02-16T21:00:00Z",
  "location": {
    "type": "HYBRID",
    "address": "123 Victoria Island, Lagos",
    "virtualUrl": "https://zoom.us/j/123456789"
  },
  "capacity": 75
}
```

**Response:**
```json
{
  "message": "Event updated successfully",
  "event": {
    "id": "507f1f77bcf86cd799439011",
    ...
  }
}
```

**Authorization Rules:**
- **Chapter Admin**: Can only update events from their chapter
- **Super Admin**: Can update any event

**Side Effects:**
- If event is `PUBLISHED`, notifies all RSVPd users (GOING + INTERESTED)
- Sends email and in-app notification about the update

---

#### 7. Cancel Event
```http
DELETE /api/v1/admin/events/:eventId
```

**Authentication:** Required (Chapter Admin or Super Admin)

**Request Body:**
```json
{
  "reason": "Due to unforeseen circumstances, we need to reschedule this event"
}
```

**Response (for PUBLISHED events):**
```json
{
  "message": "Event cancelled successfully",
  "event": {
    "id": "507f1f77bcf86cd799439011",
    "status": "CANCELLED",
    "isCancelled": true,
    "cancellationReason": "Due to unforeseen circumstances..."
  },
  "notifiedAttendees": 23
}
```

**Response (for DRAFT/WAITING events):**
```json
{
  "message": "Event deleted"
}
```

**Authorization Rules:**
- **Chapter Admin**: Can only cancel events from their chapter
- **Super Admin**: Can cancel any event

**Business Logic:**
- **DRAFT/WAITING**: Hard delete (event never visible to members)
- **PUBLISHED**: Soft delete (mark as `CANCELLED`, keep record)
- **PUBLISHED**: Requires `reason` field (min 10 characters)
- **PUBLISHED**: Notifies all RSVPd users via email and in-app notification
- **CANCELLED/COMPLETED**: Cannot be cancelled again

---

#### 8. Get Event Attendees
```http
GET /api/v1/admin/events/:eventId/attendees
```

**Authentication:** Required (Chapter Admin or Super Admin)

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `export` | string | No | Export format: `csv` or `pdf` |

**Response (JSON):**
```json
{
  "attendees": [
    {
      "user": {
        "id": "507f1f77bcf86cd799439014",
        "firstName": "John",
        "lastName": "Smith",
        "email": "john@example.com",
        "profilePhoto": "/uploads/profile.jpg"
      },
      "status": "GOING",
      "rsvpDate": "2024-01-20T10:30:00Z"
    }
  ],
  "stats": {
    "going": 15,
    "interested": 8
  }
}
```

**Response (CSV Export):**
```csv
Name,Email,Status,RSVP Date
John Smith,john@example.com,GOING,1/20/2024
Jane Doe,jane@example.com,INTERESTED,1/21/2024
```

**Response (PDF Export):**
- PDF document with formatted attendee list
- Includes event ID, attendee names, emails, status, and RSVP dates

**Authorization Rules:**
- **Chapter Admin**: Can only view attendees for events from their chapter
- **Super Admin**: Can view attendees for any event

**Notes:**
- Only includes `GOING` and `INTERESTED` RSVPs
- Excludes cancelled RSVPs

---

### Approval Workflow Endpoints

#### 9. Submit Event for Approval
```http
PATCH /api/v1/admin/events/:eventId/submit
```

**Authentication:** Required (Chapter Admin)

**Response:**
```json
{
  "message": "Event submitted for approval",
  "event": {
    "id": "507f1f77bcf86cd799439011",
    "status": "WAITING",
    "submittedAt": "2024-01-22T14:00:00Z",
    "submitCount": 1
  },
  "notifiedAdmins": 3
}
```

**Authorization Rules:**
- Only `DRAFT` events can be submitted
- Chapter Admin can only submit events from their chapter

**Side Effects:**
- Changes status from `DRAFT` to `WAITING`
- Notifies all Super Admins via email and in-app notification
- Increments `submitCount`
- Sets `submittedAt` timestamp

---

#### 10. Approve Event
```http
PATCH /api/v1/admin/events/:eventId/approve
```

**Authentication:** Required (Super Admin only)

**Response:**
```json
{
  "message": "Event approved and published",
  "event": {
    "id": "507f1f77bcf86cd799439011",
    "status": "PUBLISHED",
    "isPublished": true,
    "approvedBy": "507f1f77bcf86cd799439015",
    "approvedAt": "2024-01-23T09:00:00Z"
  }
}
```

**Authorization Rules:**
- Only Super Admins can approve events
- Only `WAITING` events can be approved

**Side Effects:**
- Changes status from `WAITING` to `PUBLISHED`
- Sets `isPublished` to `true`
- Records `approvedBy` and `approvedAt`
- Notifies event organizer via email and in-app notification

---

#### 11. Reject Event
```http
PATCH /api/v1/admin/events/:eventId/reject
```

**Authentication:** Required (Super Admin only)

**Request Body:**
```json
{
  "reason": "Event description needs more details about the agenda and speakers"
}
```

**Response:**
```json
{
  "message": "Event rejected and returned to draft",
  "event": {
    "id": "507f1f77bcf86cd799439011",
    "status": "DRAFT",
    "rejectionReason": "Event description needs more details..."
  }
}
```

**Authorization Rules:**
- Only Super Admins can reject events
- Only `WAITING` events can be rejected
- Reason must be at least 10 characters

**Side Effects:**
- Changes status from `WAITING` to `DRAFT`
- Clears `approvedBy` and `approvedAt` fields
- Sets `rejectionReason`
- Notifies event organizer via email and in-app notification

---

## Business Logic

### Event Visibility Logic

The event visibility system is role-based and context-aware:

```typescript
// Visibility Matrix
┌─────────────────┬──────────┬──────────┬──────────────┐
│ User Role       │ Own Ch.  │ Other Ch.│ Global       │
├─────────────────┼──────────┼──────────┼──────────────┤
│ Guest           │ PUBLISHED│ PUBLISHED│ PUBLISHED    │
│ Regular User    │ PUBLISHED│ PUBLISHED│ PUBLISHED    │
│ Chapter Admin   │ ALL      │ PUBLISHED│ PUBLISHED    │
│ Super Admin     │ ALL      │ ALL      │ ALL          │
└─────────────────┴──────────┴──────────┴──────────────┘
```

**Implementation:**
1. Resolve user role (Guest, User, Chapter Admin, Super Admin)
2. Determine user's chapter (if applicable)
3. Apply filters based on role and context
4. Return filtered events with RSVP status (if authenticated)

---

### RSVP Management

**Capacity Tracking:**
- Only `GOING` status counts toward capacity
- `INTERESTED` does not count toward capacity
- Capacity is optional (unlimited if not set)

**Status Changes:**
```
NULL → GOING: currentAttendees + 1
NULL → INTERESTED: currentAttendees + 0
GOING → INTERESTED: currentAttendees - 1
INTERESTED → GOING: currentAttendees + 1
GOING → CANCELLED: currentAttendees - 1
INTERESTED → CANCELLED: currentAttendees + 0
```

**Duplicate Prevention:**
- Compound unique index on `(eventId, userId)`
- Update existing RSVP instead of creating duplicate

---

### Approval Workflow

```
┌──────────┐
│  DRAFT   │ ← Chapter Admin creates event
└────┬─────┘
     │ submit()
     ↓
┌──────────┐
│ WAITING  │ ← Awaiting Super Admin approval
└────┬─────┘
     │
     ├─→ approve() → PUBLISHED
     │
     └─→ reject() → DRAFT (with reason)
```

**Key Points:**
- Super Admin events skip approval (auto-published)
- Chapter Admin events require approval
- Events can be resubmitted after rejection
- `submitCount` tracks number of submissions

---



## Permissions & Authorization

### Role Hierarchy

```
Super Admin (Highest)
    ↓
Chapter Admin
    ↓
Regular User
    ↓
Guest (Lowest)
```

### Permission Matrix

| Action | Guest | User | Chapter Admin | Super Admin |
|--------|-------|------|---------------|-------------|
| View published events | ✅ | ✅ | ✅ | ✅ |
| View draft events (own chapter) | ❌ | ❌ | ✅ | ✅ |
| View draft events (other chapters) | ❌ | ❌ | ❌ | ✅ |
| View waiting events | ❌ | ❌ | ✅ | ✅ |
| RSVP to events | ❌ | ✅ | ✅ | ✅ |
| Create events | ❌ | ❌ | ✅ | ✅ |
| Update events (own chapter) | ❌ | ❌ | ✅ | ✅ |
| Update events (other chapters) | ❌ | ❌ | ❌ | ✅ |
| Cancel events (own chapter) | ❌ | ❌ | ✅ | ✅ |
| Cancel events (other chapters) | ❌ | ❌ | ❌ | ✅ |
| Submit for approval | ❌ | ❌ | ✅ | ❌ |
| Approve events | ❌ | ❌ | ❌ | ✅ |
| Reject events | ❌ | ❌ | ❌ | ✅ |
| View attendees (own chapter) | ❌ | ❌ | ✅ | ✅ |
| View attendees (other chapters) | ❌ | ❌ | ❌ | ✅ |
| Export attendees | ❌ | ❌ | ✅ | ✅ |

### Authorization Implementation

**Middleware Stack:**
```typescript
// Public routes
router.get('/events', optionalAuth, controller.list);
router.get('/events/:id', controller.getEvent);

// Authenticated routes
router.post('/events/:id/rsvp', authenticate, controller.rsvp);

// Admin routes
router.post('/admin/events', authenticate, requireChapterAdmin, controller.create);

// Super Admin routes
router.patch('/admin/events/:id/approve', authenticate, requireSuperAdmin, controller.approve);
```

**User Resolution:**
```typescript
// Checks both User and Administrator collections
async function resolveUser(userId: string): Promise<NormalizedUser | null> {
  const admin = await Administrator.findById(userId);
  if (admin) {
    return {
      id: admin._id.toString(),
      role: admin.role,
      chapterId: admin.chapterId?.toString()
    };
  }
  
  const user = await User.findById(userId);
  if (user) {
    return {
      id: user._id.toString(),
      role: user.accountType,
      chapterId: user.chapterId?.toString()
    };
  }
  
  return null;
}
```

---

## Email Notifications

### Email Types

#### 1. Event Approval Request
**Trigger:** Chapter Admin submits event for approval  
**Recipients:** All Super Admins  
**Template:** `sendEventApprovalRequestEmail()`

```
Subject: New event awaiting your approval: [Event Title]

Hi [Admin Name],

A new event has been submitted and is awaiting your approval.

Event: [Event Title]
Event ID: [Event ID]

Please log in to the admin portal to review and approve or reject this event.
```

---

#### 2. Event Approved
**Trigger:** Super Admin approves event  
**Recipients:** Event organizer  
**Template:** `sendEventApprovedEmail()`

```
Subject: Your event has been approved: [Event Title]

Hi [Organizer Name],

Great news! Your event has been reviewed and approved. It is now live and visible to members.

Event: [Event Title]
Event ID: [Event ID]

Members can now view and RSVP to your event on the platform.
```

---

#### 3. Event Rejected
**Trigger:** Super Admin rejects event  
**Recipients:** Event organizer  
**Template:** `sendEventRejectedEmail()`

```
Subject: Your event requires changes: [Event Title]

Hi [Organizer Name],

Your event has been reviewed and requires some changes before it can be published.

Event: [Event Title]
Reason: [Rejection Reason]

Your event has been returned to draft status. Please make the necessary updates and resubmit for approval.
```

---

#### 4. Event Cancelled
**Trigger:** Admin cancels published event  
**Recipients:** All RSVPd users (GOING + INTERESTED)  
**Template:** `sendEventCancelledEmail()`

```
Subject: Event cancelled: [Event Title]

Hi [Member Name],

We regret to inform you that the following event you RSVPd to has been cancelled.

Event: [Event Title]
Scheduled Date: [Date]

We apologise for any inconvenience this may cause. Keep an eye out for future events on the WIFT Africa platform.
```

---

#### 5. Event Updated
**Trigger:** Admin updates published event  
**Recipients:** All RSVPd users (GOING + INTERESTED)  
**Template:** `sendEventUpdatedEmail()`

```
Subject: Event updated: [Event Title]

Hi [Member Name],

An event you RSVPd to has been updated. Please check the latest details on the platform.

Event: [Event Title]
Scheduled Date: [Date]

Log in to the WIFT Africa platform to view the full updated event details.
```

---

### In-App Notifications

All email notifications are accompanied by in-app notifications:

| Event | Notification Type | Title | Message |
|-------|------------------|-------|---------|
| Approval Request | `EVENT_APPROVAL_REQUIRED` | Event Awaiting Approval | Event "[Title]" has been submitted and requires your approval |
| Approved | `EVENT_APPROVED` | Event Approved | Your event "[Title]" has been approved and is now live |
| Rejected | `EVENT_REJECTED` | Event Requires Changes | Your event "[Title]" was not approved. Reason: [Reason] |
| Cancelled | `EVENT_CANCELLED` | Event Cancelled | The event "[Title]" has been cancelled |
| Updated | `EVENT_UPDATED` | Event Updated | An event you RSVPd to has been updated: "[Title]" |

---

## Event Lifecycle

### Complete Lifecycle Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    EVENT LIFECYCLE                          │
└─────────────────────────────────────────────────────────────┘

Chapter Admin Creates Event
         │
         ↓
    ┌─────────┐
    │  DRAFT  │ ← Initial state for Chapter Admin
    └────┬────┘
         │
         ├─→ Edit/Update (stays DRAFT)
         │
         ├─→ Delete (hard delete)
         │
         ├─→ Submit for Approval
         │        │
         │        ↓
         │   ┌──────────┐
         │   │ WAITING  │ ← Awaiting Super Admin review
         │   └────┬─────┘
         │        │
         │        ├─→ Approve → PUBLISHED
         │        │
         │        └─→ Reject → DRAFT (with reason)
         │
         ↓
    ┌───────────┐
    │ PUBLISHED │ ← Visible to all users
    └─────┬─────┘
          │
          ├─→ Update (notifies RSVPd users)
          │
          ├─→ Cancel → CANCELLED
          │
          └─→ Event Date Passes → COMPLETED

Super Admin Creates Event
         │
         ↓
    ┌───────────┐
    │ PUBLISHED │ ← Auto-published (skips approval)
    └───────────┘
```

### Status Transitions

| From | To | Trigger | Who |
|------|----|---------| ----|
| - | DRAFT | Create event | Chapter Admin |
| - | PUBLISHED | Create event | Super Admin |
| DRAFT | WAITING | Submit for approval | Chapter Admin |
| DRAFT | DRAFT | Edit event | Chapter Admin |
| DRAFT | (deleted) | Delete event | Chapter Admin |
| WAITING | PUBLISHED | Approve | Super Admin |
| WAITING | DRAFT | Reject | Super Admin |
| WAITING | (deleted) | Delete event | Admin |
| PUBLISHED | CANCELLED | Cancel event | Admin |
| PUBLISHED | COMPLETED | Event date passes | System |
| CANCELLED | - | (terminal state) | - |
| COMPLETED | - | (terminal state) | - |

---

## RSVP System

### RSVP Flow

```
User views event
     │
     ↓
User clicks RSVP
     │
     ├─→ Select "GOING"
     │        │
     │        ↓
     │   Check capacity
     │        │
     │        ├─→ Has space → Create/Update RSVP
     │        │                currentAttendees++
     │        │
     │        └─→ Full → Error 400
     │
     └─→ Select "INTERESTED"
              │
              ↓
         Create/Update RSVP
         (no capacity check)
```

### RSVP Statistics

**Tracked Metrics:**
- Total RSVPs (GOING + INTERESTED)
- Going count
- Interested count
- Capacity utilization (if capacity set)
- RSVP timeline

**Export Formats:**
- JSON (default)
- CSV (for spreadsheets)
- PDF (for printing)

---

## Database Indexes

### Event Collection

```typescript
// Compound indexes for common queries
eventSchema.index({ chapterId: 1, startDate: 1 });
eventSchema.index({ chapterId: 1, status: 1, startDate: -1 });
eventSchema.index({ startDate: 1, isPublished: 1 });
eventSchema.index({ type: 1 });

// Single field indexes
eventSchema.index({ chapterId: 1 });
eventSchema.index({ organizer: 1 });
eventSchema.index({ startDate: 1 });
```

### EventRSVP Collection

```typescript
// Unique compound index (prevents duplicates)
eventRSVPSchema.index({ eventId: 1, userId: 1 }, { unique: true });

// Single field indexes
eventRSVPSchema.index({ eventId: 1 });
eventRSVPSchema.index({ userId: 1 });
```

---

## Error Handling

### Common Error Codes

| Code | Message | Cause |
|------|---------|-------|
| 400 | End date must be after start date | Invalid date range |
| 400 | Event is full | Capacity reached |
| 400 | Event is cancelled | Trying to RSVP to cancelled event |
| 400 | Only DRAFT events can be submitted | Invalid status transition |
| 400 | Only WAITING events can be approved | Invalid status transition |
| 400 | Cancellation reason is required | Missing required field |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Admin privileges required | Insufficient permissions |
| 403 | Cannot create event for another chapter | Chapter mismatch |
| 403 | Cannot update event from another chapter | Chapter mismatch |
| 404 | Event not found | Invalid event ID or not visible |
| 404 | RSVP not found | No RSVP exists for user |

---

## Testing

### Test Scenarios

#### Event Creation
- ✅ Chapter Admin creates event for their chapter
- ✅ Super Admin creates event for any chapter
- ✅ Super Admin creates global event (no chapter)
- ❌ Chapter Admin creates event for another chapter
- ❌ Regular user creates event
- ❌ End date before start date

#### Event Visibility
- ✅ Guest sees only PUBLISHED events
- ✅ User sees only PUBLISHED events
- ✅ Chapter Admin sees all events from their chapter
- ✅ Chapter Admin sees only PUBLISHED from other chapters
- ✅ Super Admin sees all events

#### RSVP Management
- ✅ User RSVPs to event (GOING)
- ✅ User RSVPs to event (INTERESTED)
- ✅ User updates RSVP status
- ✅ User cancels RSVP
- ❌ User RSVPs to full event
- ❌ User RSVPs to cancelled event
- ❌ Guest RSVPs to event

#### Approval Workflow
- ✅ Chapter Admin submits event for approval
- ✅ Super Admin approves event
- ✅ Super Admin rejects event with reason
- ✅ Organizer receives notification
- ❌ Chapter Admin approves event
- ❌ Submit already published event

---

## Performance Considerations

### Optimization Strategies

1. **Database Indexes**: Compound indexes on frequently queried fields
2. **Lean Queries**: Use `.lean()` for read-only operations
3. **Selective Population**: Only populate needed fields
4. **Pagination**: Limit results per page
5. **Caching**: Cache frequently accessed events (future enhancement)

### Query Performance

```typescript
// Optimized query example
const events = await Event.find(filter)
  .populate('chapterId', 'name code')  // Only needed fields
  .populate('organizer', 'firstName lastName profilePhoto')
  .sort({ startDate: 1 })
  .limit(20)
  .lean();  // Returns plain objects (faster)
```

---

## Future Enhancements

### Planned Features

1. **Recurring Events**: Support for weekly/monthly recurring events
2. **Event Categories**: Additional categorization beyond types
3. **Waitlist**: Automatic waitlist when event is full
4. **Check-in System**: QR code-based event check-in
5. **Event Analytics**: Attendance tracking and reporting
6. **Calendar Integration**: iCal/Google Calendar export
7. **Event Reminders**: Automated reminders before event
8. **Co-organizers**: Multiple organizers per event
9. **Event Templates**: Reusable event templates
10. **Social Sharing**: Share events on social media

---

## API Usage Examples

### Example 1: List Upcoming Events for User's Chapter

```bash
curl -X GET "https://api.wiftafrica.org/api/v1/events?chapterId=507f1f77bcf86cd799439012&month=2&year=2024" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Example 2: RSVP to Event

```bash
curl -X POST "https://api.wiftafrica.org/api/v1/events/507f1f77bcf86cd799439011/rsvp" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "GOING"}'
```

### Example 3: Create Event (Chapter Admin)

```bash
curl -X POST "https://api.wiftafrica.org/api/v1/admin/events" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Film Industry Networking Mixer",
    "description": "Join us for networking",
    "type": "NETWORKING",
    "chapterId": "507f1f77bcf86cd799439012",
    "startDate": "2024-02-15T18:00:00Z",
    "endDate": "2024-02-15T21:00:00Z",
    "timezone": "Africa/Lagos",
    "location": {
      "type": "PHYSICAL",
      "address": "123 Victoria Island",
      "city": "Lagos",
      "country": "Nigeria"
    },
    "capacity": 50
  }'
```

### Example 4: Export Attendees as CSV

```bash
curl -X GET "https://api.wiftafrica.org/api/v1/admin/events/507f1f77bcf86cd799439011/attendees?export=csv" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -o attendees.csv
```

---

## Support & Maintenance

### Monitoring

**Key Metrics to Monitor:**
- Event creation rate
- RSVP conversion rate
- Approval workflow duration
- Cancellation rate
- Capacity utilization
- Email delivery success rate

### Logs

**Important Log Events:**
- Event creation/update/deletion
- RSVP changes
- Approval workflow transitions
- Email notification failures
- Authorization failures

### Troubleshooting

**Common Issues:**
1. **Events not visible**: Check status and user role
2. **RSVP fails**: Check capacity and event status
3. **Email not received**: Check email service logs
4. **Permission denied**: Verify user role and chapter assignment

---

## Conclusion

The Events module provides a comprehensive event management system with:
- ✅ Role-based access control
- ✅ Approval workflow for quality control
- ✅ RSVP management with capacity tracking
- ✅ Email and in-app notifications
- ✅ Export capabilities (CSV/PDF)
- ✅ Chapter-specific and global events
- ✅ Complete audit trail

For questions or issues, contact the development team or refer to the main API documentation.

---

**Last Updated:** February 23, 2026  
**Version:** 1.0  
**Maintainer:** WIFT Africa Development Team
