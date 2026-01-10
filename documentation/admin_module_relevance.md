# Admin Module Relevance Analysis

## Module Relevance Filter for Admin Codebase

### 1. Admin - [Platform Administration]

#### Documentation Location
`documentation/api/admin/README.md`

#### Role Access Analysis

**SuperAdmin Access:**
- ✅ Can access this module
- **Scope:** Global
- **Permissions:** 
  - Read: ✅
  - Create: ✅
  - Update: ✅
  - Delete: ✅
- **Key Endpoints for SuperAdmin:**
  1. `POST /api/v1/admin/chapters` - Create new chapters
  2. `GET /api/v1/admin/monitoring/realtime` - System health
  3. `PATCH /api/v1/admin/posts/:postId/hide` - Content moderation

**Chapter Admin Access:**
- ✅ Can access this module (Limited)
- **Scope:** Limited
- **Permissions:**
  - Read: ✅ (Stats)
  - Create: ❌
  - Update: ❌
  - Delete: ❌
- **Key Endpoints for Chapter Admin:**
  1. `GET /api/v1/admin/chapters/statistics` - View high level stats (maybe restricted)

#### Relevance Assessment

**Admin Codebase Relevance:** ✅ Yes

**Reasoning:**
Central module for all administrative tasks that don't fit into domain resources.

**Use Cases:**
1. Platform Monitoring (SuperAdmin)
2. Moderation Actions (Hide/Unhide)

**Priority Level:** High

**Justification:**
Without this, SuperAdmins cannot perform basic platform governance.

---

### 2. Analytics - [Data Insights]

#### Documentation Location
`documentation/api/analytics/README.md`

#### Role Access Analysis

**SuperAdmin Access:**
- ✅ Can access this module
- **Scope:** Global
- **Permissions:** 
  - Read: ✅
  - Create: N/A
  - Update: N/A
  - Delete: N/A
- **Key Endpoints for SuperAdmin:**
  1. `GET /api/v1/analytics/connections` - Global connection stats
  2. `GET /api/v1/analytics/posts/summary` - Platform content stats

**Chapter Admin Access:**
- ✅ Can access this module
- **Scope:** Chapter-only (Implied by business logic)
- **Permissions:**
  - Read: ✅
- **Key Endpoints for Chapter Admin:**
  1. `GET /api/v1/analytics/connections/chapters/:chapterId` - Chapter-specific stats

#### Relevance Assessment

**Admin Codebase Relevance:** ✅ Yes

**Reasoning:**
Admins need data to make decisions. The dashboard is currently empty/static without this.

**Use Cases:**
1. Dashboard Overview Widgets
2. Reporting on engagement

**Priority Level:** High

**Justification:**
"Dashboard" is the first landing page; needs content.

---

### 3. Auth - [Authentication & Security]

#### Documentation Location
`documentation/api/auth/README.md`

#### Role Access Analysis

**SuperAdmin Access:**
- ✅ Can access this module
- **Scope:** Global (Self)
- **Permissions:** 
  - Read: ✅
  - Update: ✅ (Password)
- **Key Endpoints for SuperAdmin:**
  1. `POST /api/v1/auth/login` - Access Admin Console
  2. `POST /api/v1/auth/forgot-password` - Recovery

**Chapter Admin Access:**
- ✅ Can access this module
- **Scope:** Global (Self)

#### Relevance Assessment

**Admin Codebase Relevance:** ✅ Yes

**Reasoning:**
Entry point for the application. Already well integrated.

**Use Cases:**
1. Logging in
2. Password management

**Priority Level:** High

**Justification:**
Critical path.

---

### 4. Chapters - [Regional Management]

#### Documentation Location
`documentation/api/chapters/README.md`

#### Role Access Analysis

**SuperAdmin Access:**
- ✅ Can access this module
- **Scope:** Global
- **Permissions:** 
  - Read: ✅
  - Create: ✅ (via Admin module)
  - Update: ✅
  - Delete: ✅
- **Key Endpoints for SuperAdmin:**
  1. `GET /api/v1/chapters` - List all
  2. `PATCH /api/v1/admin/chapters/:id` - Edit details

**Chapter Admin Access:**
- ✅ Can access this module
- **Scope:** Chapter-only
- **Permissions:**
  - Read: ✅
  - Update: ✅ (Own chapter details)
- **Key Endpoints for Chapter Admin:**
  1. `GET /api/v1/chapters/:myChapterId`
  2. `GET /api/v1/chapters/:chapterId/membership-requests` - Critical workflow

#### Relevance Assessment

**Admin Codebase Relevance:** ✅ Yes

**Reasoning:**
The core structure of the organization. Chapter Admins live here.

**Use Cases:**
1. Approving new members (Chapter Admin)
2. Updating Chapter Info (Contact, Socials)

**Priority Level:** High

**Justification:**
Membership approval is the daily task of a Chapter Admin.

---

### 5. Connections - [User Networking]

#### Documentation Location
`documentation/api/connections/README.md`

#### Role Access Analysis

**SuperAdmin Access:**
- ❌ No direct admin endpoints
- **Scope:** N/A (User feature)
- **Permissions:** Read-only via Analytics?

**Chapter Admin Access:**
- ❌ No direct admin endpoints

#### Relevance Assessment

**Admin Codebase Relevance:** ❌ No

**Reasoning:**
This is for end-users to "friend" each other. Admins don't manage individual friend requests manually.

**Use Cases:**
N/A

**Priority Level:** N/A

**Justification:**
Member-facing feature.

---

### 6. Events - [Event Management]

#### Documentation Location
`documentation/api/events/README.md`

#### Role Access Analysis

**SuperAdmin Access:**
- ✅ Can access this module
- **Scope:** Global
- **Permissions:** 
  - Read: ✅
  - Create: ✅
  - Update: ✅
  - Delete: ✅
- **Key Endpoints for SuperAdmin:**
  1. `POST /api/v1/admin/events` - Create Global Event

**Chapter Admin Access:**
- ✅ Can access this module
- **Scope:** Chapter-only
- **Permissions:**
  - Create: ✅ (For their chapter)
- **Key Endpoints for Chapter Admin:**
  1. `POST /api/v1/admin/events` (with chapterId)
  2. `GET /api/v1/admin/events/:eventId/attendees` - Export guest list

#### Relevance Assessment

**Admin Codebase Relevance:** ✅ Yes

**Reasoning:**
Events are a primary product. Admins need to create them and export attendee lists.

**Use Cases:**
1. Creating Monthly Meetings
2. Managing Guest Lists

**Priority Level:** High

**Justification:**
Core value prop of the org.

---

### 7. Job - [Job Board]

#### Documentation Location
`documentation/api/job/README.md`

#### Role Access Analysis

**SuperAdmin Access:**
- ✅ Can access this module
- **Scope:** Global
- **Permissions:** 
  - Create: ✅
  - Update: ✅
  - Delete: ✅
- **Key Endpoints for SuperAdmin:**
  1. `POST /api/v1/jobs` - Post a job
  2. `DELETE /api/v1/jobs/:jobId` - Moderation

**Chapter Admin Access:**
- ✅ Can access this module
- **Scope:** Chapter-specific? (Likely can post jobs for their region)
- **Permissions:**
  - Create: ✅

#### Relevance Assessment

**Admin Codebase Relevance:** ✅ Yes

**Reasoning:**
Admins act as recruiters or approve job postings.

**Use Cases:**
1. Posting opportunities
2. Approving/Archiving old jobs

**Priority Level:** Medium

**Justification:**
Important feature but secondary to membership/events.

---

### 8. Job Application - [Hiring Flow]

#### Documentation Location
`documentation/api/jobApplication/README.md`

#### Role Access Analysis

**SuperAdmin Access:**
- ✅ Can access this module
- **Scope:** Global
- **Permissions:** 
  - Read: ✅
  - Update: ✅ (Status)

**Chapter Admin Access:**
- ✅ Can access this module
- **Scope:** Chapter Job Applications
- **Permissions:**
  - Read: ✅
  - Update: ✅
- **Key Endpoints for Chapter Admin:**
  1. `GET /api/v1/job-applications/admin/jobs/:jobId/applications` - Review candidates
  2. `PATCH /api/v1/job-applications/admin/:appId/status` - Hire/Reject

#### Relevance Assessment

**Admin Codebase Relevance:** ✅ Yes

**Reasoning:**
If Admins post jobs, they need to see applications.

**Use Cases:**
1. Reviewing CVs for posted jobs.

**Priority Level:** Medium

**Justification:**
Tied to Job module priority.

---

### 9. Messages - [Communication]

#### Documentation Location
`documentation/api/messages/README.md`

#### Role Access Analysis

**SuperAdmin Access:**
- ✅ Can access this module
- **Scope:** Global
- **Permissions:** 
  - Create: ✅ (Broadcasts)
- **Key Endpoints for SuperAdmin:**
  1. `POST /api/v1/messages/broadcast` - System-wide announcements

**Chapter Admin Access:**
- ✅ Can access this module
- **Scope:** Chapter Broadcasts
- **Permissions:**
  - Create: ✅

#### Relevance Assessment

**Admin Codebase Relevance:** ✅ Yes

**Reasoning:**
Broadcast capability is the main way admins communicate with members.

**Use Cases:**
1. "Meeting cancelling" announcements.
2. "New Policy" blasts.

**Priority Level:** Medium

**Justification:**
High value for engagement, but email might suffice via 3rd party in MVP.

---

### 10. Notifications - [Alerts]

#### Documentation Location
`documentation/api/notifications/README.md`

#### Role Access Analysis

**SuperAdmin Access:**
- ✅ Can access this module
- **Scope:** Self (Receiving admin alerts)
- **Permissions:** 
  - Read: ✅

**Chapter Admin Access:**
- ✅ Can access this module
- **Scope:** Self

#### Relevance Assessment

**Admin Codebase Relevance:** ❌ No (For MVP)

**Reasoning:**
While Admins *receive* notifications, they don't *manage* the notification system itself (templates, etc). The frontend "Bell icon" is helpful but not a "management module".

**Use Cases:**
1. Seeing "New Member Request" (Helpful)

**Priority Level:** Low

**Justification:**
Email alerts usually cover this for admins.

---

### 11. Onboarding - [User Signup Flow]

#### Documentation Location
`documentation/api/onboarding/README.md`

#### Role Access Analysis

**SuperAdmin Access:**
- ❌ No
- **Scope:** User-facing

**Chapter Admin Access:**
- ❌ No

#### Relevance Assessment

**Admin Codebase Relevance:** ❌ No

**Reasoning:**
Admins don't onboard. Users do. Admins see the *result* in Membership Requests.

**Use Cases:**
N/A

**Priority Level:** N/A

**Justification:**
Member-facing.

---

### 12. Posts - [Social Feed]

#### Documentation Location
`documentation/api/posts/README.md`

#### Role Access Analysis

**SuperAdmin Access:**
- ✅ Can access this module
- **Scope:** Global
- **Permissions:** 
  - Update: ✅ (Pin)
- **Key Endpoints for SuperAdmin:**
  1. `POST /api/v1/posts/:id/pin`
  2. `POST /api/v1/posts/admin` - Admin Announcements (Posts)

**Chapter Admin Access:**
- ✅ Can access this module
- **Scope:** Chapter Feed
- **Permissions:**
  - Update: ✅ (Pin in chapter)

#### Relevance Assessment

**Admin Codebase Relevance:** ✅ Yes

**Reasoning:**
Admins need to pin important info and likely remove bad content (via Admin module, but impacts Posts).

**Use Cases:**
1. Pinning "Welcome to the Chapter" post.
2. Content Moderation.

**Priority Level:** High

**Justification:**
Feed control is essential for community management.

---

### 13. Profiles - [User Profiles]

#### Documentation Location
`documentation/api/profiles/README.md`

#### Role Access Analysis

**SuperAdmin Access:**
- ✅ Can access this module
- **Scope:** Global
- **Permissions:** 
  - Read: ✅ (Full view)

**Chapter Admin Access:**
- ✅ Can access this module
- **Scope:** Chapter Members
- **Permissions:**
  - Read: ✅

#### Relevance Assessment

**Admin Codebase Relevance:** ✅ Yes

**Reasoning:**
Admins need to see who they are verifying/managing.

**Use Cases:**
1. Investigating a reported user.
2. Vetting a membership request.

**Priority Level:** High

**Justification:**
Cannot verify members without seeing their profiles.

---

### 14. Report - [Safety & Moderation]

#### Documentation Location
`documentation/api/report/README.md`

#### Role Access Analysis

**SuperAdmin Access:**
- ✅ Can access this module
- **Scope:** Global
- **Permissions:** 
  - Read: ✅ (List reports)
  - Update: ✅ (Resolve)
- **Key Endpoints for SuperAdmin:**
  1. `GET /api/v1/admin/reports`
  2. `PATCH /api/v1/admin/reports/:id/resolve`

**Chapter Admin Access:**
- 🟡 Partial/Unclear (Docs mention Admin generally, SuperAdmin likely owns safety)
- **Scope:** Likely N/A or limited.

#### Relevance Assessment

**Admin Codebase Relevance:** ✅ Yes

**Reasoning:**
The primary interface for handling bad actors.

**Use Cases:**
1. Reviewing harassment complaints.
2. Banning spammers.

**Priority Level:** High

**Justification:**
Safety/Legal requirement.

---

### 15. Search - [Member Discovery]

#### Documentation Location
`documentation/api/search/README.md`

#### Role Access Analysis

**SuperAdmin Access:**
- ✅ Can access this module
- **Scope:** Global
- **Permissions:** 
  - Read: ✅

**Chapter Admin Access:**
- ✅ Can access this module
- **Scope:** Global (Search is usually open)
- **Permissions:**
  - Read: ✅

#### Relevance Assessment

**Admin Codebase Relevance:** ✅ Yes

**Reasoning:**
"Find me that member who called about X".
Admins need a powerful user search separate from the simple list.

**Use Cases:**
1. Finding a specific user to manage/edit/promote.

**Priority Level:** Medium

**Justification:**
Standard User Management usually includes basic search, but this module offers advanced filters (Role, Skills).

---

### 16. Upload - [File Storage]

#### Documentation Location
`documentation/api/upload/README.md`

#### Role Access Analysis

**SuperAdmin Access:**
- ✅ Can access this module
- **Scope:** Global
- **Permissions:** 
  - Create: ✅ (Upload)

**Chapter Admin Access:**
- ✅ Can access this module

#### Relevance Assessment

**Admin Codebase Relevance:** ✅ Yes

**Reasoning:**
Utility for other modules. Admins upload banners, documents, etc.

**Use Cases:**
1. Uploading Event Covers.
2. Uploading Broadcast attachments.

**Priority Level:** Utility (High)

**Justification:**
Implicit dependency.

---

### 17. Users - [User Accounts]

#### Documentation Location
`documentation/api/users/README.md`

#### Role Access Analysis

**SuperAdmin Access:**
- ✅ Can access this module
- **Scope:** Global
- **Permissions:** 
  - Read: ✅
  - Update: ✅ (Promote/Ban - often in Admin endpoints though)

**Chapter Admin Access:**
- 🟡 Partial (View only)

#### Relevance Assessment

**Admin Codebase Relevance:** ✅ Yes

**Reasoning:**
User Management is the bread and butter. Note that `documentation/api/users` focuses on *Self* management, while `documentation/api/admin` focuses on *Admin* management of users. So this is less relevant than `Admin` module but still provides types/structures.

**Use Cases:**
1. "Login as User" (Impersonation - if supported).
2. Viewing user details.

**Priority Level:** High

**Justification:**
Core data entity.

---

# Admin-Relevant Modules - Final List

## ✅ Confirmed Admin Modules: 13

These modules MUST be implemented in Admin frontend:

### High Priority (Core Admin Functions):
1. **Admin**
   - Both roles
   - Current status: Partially Integrated
   - Key capabilities: Platform stats, Moderation actions, Chapter creation.
2. **Auth**
   - All roles
   - Current status: Fully Integrated
   - Key capabilities: Login, Security.
3. **Chapters**
   - Both roles
   - Current status: Fully Integrated
   - Key capabilities: Membership approvals, Chapter settings.
4. **Events**
   - Both roles
   - Current status: Integrated
   - Key capabilities: Create/Edit events, Guest lists.
5. **Reports**
   - SuperAdmin mainly
   - Current status: Not Started
   - Key capabilities: Resolve safety reports.
6. **Analytics**
   - Both roles
   - Current status: Not Started
   - Key capabilities: Dashboard widgets, Engagement stats.
7. **Users**
   - Both roles
   - Current status: Partially Integrated
   - Key capabilities: Member list views.

### Medium Priority (Important but not critical):
1. **Messages**
   - Broadcast tool for communications.
2. **Posts**
   - Pinning important info, Moderating feed content.
3. **Job**
   - Managing the job board.
4. **JobApplication**
   - Reviewing candidates for chapter roles/jobs.
5. **Search**
   - finding specific professionals.

### Utility (Implicitly Required):
1. **Upload**
   - Required for Events/Messages/Profiles.

### Low Priority (Nice to have):
1. **Profiles** (Public view might be sufficient via `Users` module in admin context).

---

## ❌ Not Relevant to Admin: 3

These modules are for Member frontend only:
- **Connections** - Personal networking feature.
- **Onboarding** - User self-registration flow.
- **Notifications** - Admin *receives* them, but doesn't *manage* the system.

---

## 🟡 Needs Clarification: 1

These modules need business/product input:
- **Notifications** - Does the admin need a "Send Push Notification" console separate from "Broadcast Messages"?

---

## Next Steps

Ready to proceed with feature-by-feature audit for these modules:
1. Reports
2. Analytics
3. Messages
4. Posts (Moderation)
5. Jobs & Applications

Would you like to start with module: **Reports**?
