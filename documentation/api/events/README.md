# Events Module API

## Overview
The Events module manages the full lifecycle of events, including creation, listing, RSVP management, and attendee tracking. It supports various event types (Physical, Virtual, Hybrid).

## Base URL
`/api/v1/events`

## Authentication
- **Public/Optional**: some `GET` endpoints (e.g., listing events) allow optional authentication.
- **Required**: Yes (for RSVPs, Admin actions).
- **Type**: Bearer Token (JWT).
- **Header**: `Authorization: Bearer <access_token>`

---

## 1. Event Discovery (Public/Authenticated)

### 1.1 List Events
**Method:** `GET`
**Path:** `/api/v1/events`
**Description:** Retrieve a paginated list of events with filtering options.

#### Query Parameters
- `page`: number (default: 1)
- `limit`: number (default: 20)
- `chapterId`: string (Filter by chapter)
- `type`: 'WORKSHOP' | 'SCREENING' | 'NETWORKING' | 'MEETUP' | 'CONFERENCE' | 'OTHER'
- `startDate`: string (YYYY-MM-DD)
- `endDate`: string (YYYY-MM-DD)

#### Response (200 OK)
```typescript
{
  events: Array<Event>;
  total: number;
  pages: number;
}
```

### 1.2 Get Event Details
**Method:** `GET`
**Path:** `/api/v1/events/:eventId`
**Description:** Get detailed information about a specific event.

#### Response (200 OK)
```typescript
{
  id: string;
  title: string;
  description: string;
  type: EventType;
  startDate: string; // ISO Date
  endDate: string; // ISO Date
  location: {
    type: 'PHYSICAL' | 'VIRTUAL' | 'HYBRID';
    address?: string;
    city?: string;
    country?: string;
    virtualUrl?: string;
  };
  capacity: number;
  currentAttendees: number;
  myRSVP?: 'GOING' | 'INTERESTED' | 'NOT_GOING' | null;
  // ... other fields
}
```

---

## 2. RSVP & Attendance

### 2.1 RSVP to Event
**Method:** `POST`
**Path:** `/api/v1/events/:eventId/rsvp`
**Description:** Register for an event.

#### Body
```typescript
{
  status: 'GOING' | 'INTERESTED' | 'NOT_GOING';
}
```

### 2.2 Cancel RSVP
**Method:** `DELETE`
**Path:** `/api/v1/events/:eventId/rsvp`
**Description:** Remove RSVP reservation.

---

## 3. Event Management (Admin Only)

**Base URL:** `/api/v1/admin/events`

### 3.1 Create Event
**Method:** `POST`
**Path:** `/api/v1/admin/events`
**Attributes:** Requires `ChapterAdmin` role.

#### Body
```typescript
{
  title: string;
  description: string;
  type: EventType;
  chapterId?: string;
  startDate: string; // ISO Date
  endDate: string; // ISO Date
  timezone: string;
  location: {
    type: 'PHYSICAL' | 'VIRTUAL' | 'HYBRID';
    address?: string;
    // ...
  };
  capacity?: number;
  coverImage?: string;
  tags?: string[];
}
```

### 3.2 Update Event
**Method:** `PATCH`
**Path:** `/api/v1/admin/events/:eventId`

### 3.3 Cancel Event
**Method:** `DELETE`
**Path:** `/api/v1/admin/events/:eventId`

#### Body
```typescript
{
  reason: string;
}
```

### 3.4 Get Attendees
**Method:** `GET`
**Path:** `/api/v1/admin/events/:eventId/attendees`
**Query Parameters:** `export=true` (optional)

#### Response (200 OK)
```typescript
{
  attendees: Array<{
    user: { id: string, firstName: string, lastName: string, email: string };
    status: RSVPStatus;
    rsvpDate: string;
  }>;
  stats: {
    going: number;
    interested: number;
    notGoing: number;
  };
}
```
