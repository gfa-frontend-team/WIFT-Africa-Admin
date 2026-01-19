# Admin Endpoints Documentation Audit

**Date:** January 18, 2026  
**Purpose:** Comprehensive breakdown of all documented admin endpoints (Super Admin & Chapter Admin)

---

## Module 1: Chapter Management

### Super Admin Endpoints

#### 1.1 List Chapters
- **Endpoint:** `GET /api/v1/admin/chapters`
- **Role:** Super Admin
- **Description:** Retrieves paginated list of chapters with filtering
- **Query Parameters:**
  - `page`, `limit`, `search`, `country`, `isActive`, `sortBy`, `sortOrder`
- **Response:** `{ chapters: [], pagination: {} }`

#### 1.2 Create Chapter
- **Endpoint:** `POST /api/v1/admin/chapters`
- **Role:** Super Admin
- **Description:** Creates a new WIFT chapter
- **Body:** `{ name, code, country, city?, description?, email?, ... }`

#### 1.3 Update Chapter
- **Endpoint:** `PATCH /api/v1/admin/chapters/:id`
- **Role:** Super Admin
- **Description:** Updates chapter details (all fields)
- **Body:** Any field from Create Chapter (all optional)

#### 1.4 Get Chapter Details (Admin View)
- **Endpoint:** `GET /api/v1/admin/chapters/:id`
- **Role:** Super Admin
- **Description:** Get detailed chapter info with stats
- **Response:** `{ chapter: {}, stats: {} }`

#### 1.5 Deactivate Chapter
- **Endpoint:** `DELETE /api/v1/admin/chapters/:id`
- **Role:** Super Admin
- **Description:** Soft delete/deactivate a chapter

#### 1.6 Reactivate Chapter
- **Endpoint:** `POST /api/v1/admin/chapters/:id/reactivate`
- **Role:** Super Admin
- **Description:** Reactivate a deactivated chapter

#### 1.7 Add Chapter Admin
- **Endpoint:** `POST /api/v1/admin/chapters/:id/admins`
- **Role:** Super Admin
- **Description:** Assign a user as chapter admin
- **Body:** `{ userId: string }`

#### 1.8 Remove Chapter Admin
- **Endpoint:** `DELETE /api/v1/admin/chapters/:id/admins/:userId`
- **Role:** Super Admin
- **Description:** Remove chapter admin privileges

#### 1.9 Get Chapter Countries
- **Endpoint:** `GET /api/v1/admin/chapters/countries`
- **Role:** Super Admin
- **Description:** List unique countries with chapters
- **Response:** `{ countries: string[] }`

#### 1.10 Get Chapter Analytics
- **Endpoint:** `GET /api/v1/admin/chapters/:chapterId/analytics`
- **Role:** Super Admin
- **Description:** Detailed analytics for a specific chapter

#### 1.11 Get Platform Statistics
- **Endpoint:** `GET /api/v1/admin/chapters/statistics`
- **Role:** Super Admin
- **Description:** Aggregate platform stats
- **Response:** `{ totalChapters, activeChapters, totalMembers, totalCountries }`

### Chapter Admin Endpoints

#### 1.12 Get Chapter Details (Limited)
- **Endpoint:** `GET /api/v1/chapters/:chapterId`
- **Role:** Chapter Admin
- **Description:** Get public chapter details (own chapter only)

#### 1.13 Update Chapter Details (Limited)
- **Endpoint:** `PATCH /api/v1/chapters/:chapterId`
- **Role:** Chapter Admin
- **Description:** Update limited fields (description, mission, contacts, social links)
- **Restricted Fields:** Cannot change name, code, country, city, foundedDate

---

## Module 2: Membership Management

### Chapter Admin & Super Admin Endpoints

#### 2.1 Get Pending Requests
- **Endpoint:** `GET /api/v1/chapters/:chapterId/membership-requests`
- **Role:** Chapter Admin (own chapter), Super Admin (any chapter)
- **Description:** List pending membership requests
- **Response:** `{ requests: [] }`

#### 2.2 Approve Request
- **Endpoint:** `POST /api/v1/chapters/:chapterId/membership-requests/:requestId/approve`
- **Role:** Chapter Admin (own chapter), Super Admin (any chapter)
- **Body:** `{ notes?: string }`

#### 2.3 Reject Request
- **Endpoint:** `POST /api/v1/chapters/:chapterId/membership-requests/:requestId/reject`
- **Role:** Chapter Admin (own chapter), Super Admin (any chapter)
- **Body:** `{ reason: string, canReapply?: boolean }`

#### 2.4 Get Chapter Members
- **Endpoint:** `GET /api/v1/chapters/:chapterId/members`
- **Role:** Chapter Admin (own chapter), Super Admin (any chapter)
- **Description:** List approved chapter members

#### 2.5 Update Member Status
- **Endpoint:** `PATCH /api/v1/admin/:userId/membership-status`
- **Role:** Chapter Admin
- **Description:** Suspend or reinstate a user
- **Body:** `{ status: 'APPROVED' | 'SUSPENDED', reason?: string }`

---

## Module 3: Event Management

### Admin Event Endpoints

#### 3.1 Create Event
- **Endpoint:** `POST /api/v1/admin/events`
- **Role:** Chapter Admin, Super Admin
- **Description:** Create a new event
- **Body:** `{ title, description, type, chapterId?, startDate, endDate, location, capacity?, ... }`
- **Note:** Chapter Admin events auto-scoped to their chapter

#### 3.2 Update Event
- **Endpoint:** `PATCH /api/v1/admin/events/:eventId`
- **Role:** Chapter Admin (own chapter events), Super Admin (any event)
- **Description:** Update event details

#### 3.3 Cancel Event
- **Endpoint:** `DELETE /api/v1/admin/events/:eventId`
- **Role:** Chapter Admin (own chapter events), Super Admin (any event)
- **Body:** `{ reason: string }`

#### 3.4 Get Event Attendees
- **Endpoint:** `GET /api/v1/admin/events/:eventId/attendees`
- **Role:** Chapter Admin (own chapter events), Super Admin (any event)
- **Query:** `export=true` (optional for CSV export)
- **Response:** `{ attendees: [], stats: { going, interested, notGoing } }`

### Public Event Endpoints (Used by Admins)

#### 3.5 List Events
- **Endpoint:** `GET /api/v1/events`
- **Description:** Browse events with filters
- **Query:** `page, limit, chapterId, type, startDate, endDate`

#### 3.6 Get Event Details
- **Endpoint:** `GET /api/v1/events/:eventId`
- **Description:** View single event details

---

## Module 4: Content Moderation

### Super Admin Endpoints

#### 4.1 Hide Post
- **Endpoint:** `PATCH /api/v1/admin/posts/:postId/hide`
- **Role:** Super Admin
- **Description:** Hide a post from public view
- **Body:** `{ reason: string }`

#### 4.2 Unhide Post
- **Endpoint:** `PATCH /api/v1/admin/posts/:postId/unhide`
- **Role:** Super Admin
- **Description:** Restore a hidden post

#### 4.3 Get Moderation Log
- **Endpoint:** `GET /api/v1/admin/posts/moderation-log`
- **Role:** Super Admin
- **Query:** `page, limit, action` (hidden/unhidden)

---

## Module 5: Reports & Safety

### Super Admin Endpoints

#### 5.1 List Reports
- **Endpoint:** `GET /api/v1/admin/reports`
- **Role:** Super Admin
- **Query:** `status, targetType, page, limit`
- **Response:** `{ reports: [], total, pages }`

#### 5.2 Get Single Report
- **Endpoint:** `GET /api/v1/admin/reports/:reportId`
- **Role:** Super Admin
- **Description:** Detailed report info including reported content

#### 5.3 Resolve Report
- **Endpoint:** `PATCH /api/v1/admin/reports/:reportId/resolve`
- **Role:** Super Admin
- **Body:** `{ resolutionNote?: string }`

---

## Module 6: Job Management

### Chapter Admin & Super Admin Endpoints

#### 6.1 Create Job
- **Endpoint:** `POST /api/v1/jobs`
- **Role:** Chapter Admin
- **Body:** `{ title, description, role, location, isRemote?, employmentType?, ... }`

#### 6.2 Update Job
- **Endpoint:** `PATCH /api/v1/jobs/:jobId`
- **Role:** Chapter Admin
- **Body:** Any job field + `status, expiresAt`

#### 6.3 Archive Job
- **Endpoint:** `DELETE /api/v1/jobs/:jobId`
- **Role:** Chapter Admin
- **Description:** Soft-delete/archive job posting

#### 6.4 Get Job Applications
- **Endpoint:** `GET /api/v1/job-applications/admin/jobs/:jobId/applications`
- **Role:** Chapter Admin
- **Query:** `page, limit, status`
- **Response:** `{ applications: [], total, pages }`

#### 6.5 Update Application Status
- **Endpoint:** `PATCH /api/v1/job-applications/admin/:applicationId/status`
- **Role:** Chapter Admin
- **Body:** `{ status: string, rejectionReason?: string }`

---

## Module 7: Messaging & Broadcasts

### Admin Broadcast Endpoints

#### 7.1 Send Broadcast Message
- **Endpoint:** `POST /api/v1/messages/broadcast`
- **Role:** Chapter Admin, Super Admin
- **Body:** `{ title?, description?, content, recipientType, chapterId?, recipientIds?, media? }`
- **Recipient Types:**
  - `ALL` - Super Admin only
  - `CHAPTER` - Both (Chapter Admin locked to own chapter)
  - `CUSTOM` - Super Admin only

#### 7.2 Get Broadcast Conversations
- **Endpoint:** `GET /api/v1/messages/conversations?type=BROADCAST`
- **Role:** Chapter Admin, Super Admin
- **Query:** `page, limit`

#### 7.3 Get Broadcast Stats
- **Endpoint:** `GET /api/v1/messages/broadcast/:conversationId/stats`
- **Role:** Chapter Admin, Super Admin
- **Description:** Read rates and analytics for sent broadcasts
- **Response:** `{ conversation, stats: [{ messageId, recipientCount, readCount, readPercentage }] }`

---

## Module 8: Verification Management

### Super Admin Endpoints

#### 8.1 Check Verification Delays
- **Endpoint:** `POST /api/v1/admin/verification/check-delays`
- **Role:** Super Admin
- **Description:** Manually trigger delay check (sends notifications for requests > 7 days)

#### 8.2 Get Delayed Stats
- **Endpoint:** `GET /api/v1/admin/verification/delayed-stats`
- **Role:** Super Admin
- **Response:** `{ total, notified, notNotified }`

---

## Module 9: Analytics

### Super Admin Endpoints

#### 9.1 Member Analytics Dashboard
- **Endpoint:** `GET /api/v1/admin/analytics/members`
- **Role:** Super Admin
- **Query:** `chapterId, startDate, endDate`

#### 9.2 Connection Analytics (Detailed)
- **Endpoint:** `GET /api/v1/analytics/connections`
- **Role:** Super Admin
- **Description:** Platform-wide connection analytics

#### 9.3 Inter-Chapter Analytics
- **Endpoint:** `GET /api/v1/analytics/connections/chapters/:chapter1Id/:chapter2Id`
- **Role:** Super Admin
- **Description:** Connection flows between specific chapters

### Shared Analytics Endpoints

#### 9.4 Get Total Connections
- **Endpoint:** `GET /api/v1/analytics/connections/total`
- **Role:** All authenticated users
- **Response:** `{ totalConnections: number }`

#### 9.5 Post Analytics Summary
- **Endpoint:** `GET /api/v1/analytics/posts/summary`
- **Role:** All authenticated users (own posts)

#### 9.6 Post Analytics List
- **Endpoint:** `GET /api/v1/analytics/posts`
- **Role:** All authenticated users (own posts)
- **Query:** `page, limit`

---

## Module 10: System Monitoring

### Super Admin Endpoints

#### 10.1 Real-time Dashboard
- **Endpoint:** `GET /api/v1/admin/monitoring/realtime`
- **Role:** Super Admin
- **Description:** Live system metrics
- **Response:** `{ websocket: { activeConnections, activeUsers }, system: { uptime, memoryUsage } }`

---

## Summary by Role

### Super Admin Permissions (Total: ~40 endpoints)
- Full chapter management (CRUD, admins, analytics)
- All membership requests across chapters
- All members across chapters
- All events management
- Content moderation (hide/unhide posts)
- Reports management
- Job management (all chapters)
- Broadcast to all/chapter/custom
- Verification management
- Platform analytics
- System monitoring

### Chapter Admin Permissions (Total: ~20 endpoints)
- Limited chapter updates (own chapter)
- Membership requests (own chapter)
- Members list (own chapter)
- Event management (own chapter)
- Job management (own chapter)
- Broadcast to own chapter
- Basic analytics (own posts)

---

## Endpoint Count by Module

| Module | Super Admin | Chapter Admin | Shared |
|--------|-------------|---------------|--------|
| Chapter Management | 11 | 2 | 0 |
| Membership | 1 | 4 | 0 |
| Events | 4 | 4 | 2 |
| Content Moderation | 3 | 0 | 0 |
| Reports | 3 | 0 | 0 |
| Jobs | 5 | 5 | 0 |
| Messaging | 3 | 2 | 0 |
| Verification | 2 | 0 | 0 |
| Analytics | 3 | 0 | 3 |
| Monitoring | 1 | 0 | 0 |
| **Total** | **36** | **17** | **5** |

