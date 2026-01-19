# Backend Module Inventory

## 1. Core User Management

### Auth Module
- **Purpose**: Handles user authentication, registration, password management, and token operations.
- **Entry Point**: `/api/v1/auth` (controller: `auth.controller.ts`)
- **Key Features**: 
    - **Registration**: Email/Password registration with validation.
    - **Login**: Email/Password login, Google OAuth login.
    - **Verification**: Email verification token handling.
    - **Password Management**: Forgot password, reset password with token, change password.
    - **Token Management**: Refresh access tokens.

### Users Module
- **Purpose**: Manages user data, profiles, and account settings.
- **Entry Point**: `/api/v1/users` (controller: `users.controller.ts`)
- **Key Features**:
    - **Profile Management**: Get/Update current user profile (`/me`), bio, headline, location, social links.
    - **Photos**: Upload/Delete profile photo.
    - **Username**: Update username, check availability, get suggestions.
    - **Privacy**: Get/Update privacy settings.
    - **CV/Resume**: Upload, delete, and download CV.
    - **Analytics**: Get user's post analytics.

### Profiles Module
- **Purpose**: Handles public profile viewing and profile view analytics.
- **Entry Point**: `/api/v1/profiles` (controller: `profileViewController`, `userController`)
- **Key Features**:
    - **Public Profile**: Get public profile by username or ID (`/:identifier`).
    - **Profile Views**: Record profile view, get view statistics and list of viewers.
    - **Experience**: detailed professional history (CRUD).
    - **Localization**: user language preferences and supported languages.

### Admin Module
- **Purpose**: Administrative functions for managing the platform.
- **Entry Point**: `/api/v1/admin` (controller: `admin.controller.ts`)
- **Key Features**:
    - **Chapters**: Statistics, CRUD operations, Deactivate/Reactivate, Manage admins.
    - **Verification**: Check delays, get delayed stats.
    - **Moderation**: Hide/Unhide posts, Moderation log.
    - **Monitoring**: Real-time system monitoring (WebSocket/Socket.io).

### Onboarding Module
- **Purpose**: Handles the multi-step user onboarding process.
- **Entry Point**: `/api/v1/onboarding` (controller: `onboarding.controller.ts`)
- **Key Features**:
    - **Progress**: Track current step and completion status.
    - **Steps**:
        1. Role Selection (Producer, Director, etc.)
        2. Specializations (Conditional based on role)
        3. Chapter Selection
        4. Profile Setup (Bio, Location, etc., optional CV)
        5. Terms Acceptance


## 2. Social Features

### Posts Module
- **Purpose**: Manages content creation, feed, and interactions.
- **Entry Point**: `/api/v1/posts` (controller: `posts.controller.ts`)
- **Key Features**:
    - **CRUD**: Create, Read, Update, Delete posts (Text, Image, Video).
    - **Feed**: Main feed with pagination.
    - **Interactions**: Like, Share, Save.
    - **Comments**: Threaded comments (replies).
    - **Admin**: Pinned posts, Admin announcements.
    - **Analytics**: Single post analytics, User's overall post analytics.

### Messages Module
- **Purpose**: Real-time communication between users.
- **Entry Point**: `/api/v1/messages` (controller: `messages.controller.ts`)
- **Key Features**:
    - **Direct Messages**: 1-on-1 messaging with media support.
    - **Broadcasts**: Admin-only broadcasts to all users, chapters, or custom lists.
    - **Conversations**: List, read, archive, unread counts.
    - **Stats**: Broadcast read statistics (Admin only).

### Connections Module
- **Purpose**: Manages professional network connections.
- **Entry Point**: `/api/v1/connections` (controller: `connections.controller.ts`)
- **Key Features**:
    - **Requests**: Send, Accept, Decline, Cancel.
    - **Management**: List connections, Remove connection.
    - **Blocking**: Block/Unblock users.
    - **Stats**: Connection counts and pending requests.

### Search Module
- **Purpose**: Discovery of users and content.
- **Entry Point**: `/api/v1/search` (controller: `search.controller.ts`)
- **Key Features**:
    - **User Search**: Advanced filtering (Role, Chapter, Skills, Location).
    - **Recommendations**: Suggested users to connect with.
    - **Metadata**: Popular skills, Available filters.


## 3. Platform Features

### Events Module
- **Purpose**: Management of physical, virtual, and hybrid events.
- **Entry Point**: `/api/v1/events` (controller: `events.controller.ts`)
- **Key Features**:
    - **Listing**: Calendar view with filters (date, type, chapter).
    - **Interactions**: RSVP (Going, Interested, Not Going).
    - **Admin**: Create/Update/Cancel events (Chapter Admin).
    - **Attendees**: List and export attendees (CSV).

### Chapters Module
- **Purpose**: Decentralized chapter management.
- **Entry Point**: `/api/v1/chapters` (controller: `chapters.controller.ts`)
- **Key Features**:
    - **Membership**: Request membership, Admin approve/reject.
    - **Management**: Update chapter details (mission, contacts).
    - **Members**: List chapter members.
    - **Discovery**: List all chapters with filtering.

### Notifications Module
- **Purpose**: system-wide user notifications.
- **Entry Point**: `/api/v1/notifications` (controller: `notifications.controller.ts`)
- **Key Features**:
    - **Inbox**: List notifications, Mark read (single/all).
    - **Preferences**: Fine-grained control (Email, Push, In-App types).
    - **Push**: Register/Unregister device tokens (FCM/APNS).

### Upload Module
- **Purpose**: Centralized file handling.
- **Entry Point**: `/api/v1/uploads` (controller: `upload.controller.ts`)
- **Key Features**:
    - **General Upload**: Images/Documents for posts, profiles, CVs.
    - **Video**: Generates SAS tokens for direct cloud upload (e.g., Azure/AWS).

## 4. Specialized Features

### Jobs Module
- **Purpose**: Job board and career opportunities.
- **Entry Point**: `/api/v1/jobs` (controller: `job.controller.ts`)
- **Key Features**:
    - **Listing**: Browsing jobs with filters (location, role, remote).
    - **Management**: Admin CRUD for job postings.
    - **Application**: Direct application handling.

### Job Applications Module
- **Purpose**: Managing job applications.
- **Entry Point**: `/api/v1/job-applications` (Note: inferred from [app.ts](file:///Users/khalidsalman-yusuf/Documents/Unleashified/Active/WIFT-Africa-Backend/src/app.ts) registration, file has `router` for `/me` and `/:applicationId`)
  - *Correction*: [app.ts](file:///Users/khalidsalman-yusuf/Documents/Unleashified/Active/WIFT-Africa-Backend/src/app.ts) mounts it at `/api/v1/job-applications`.
- **Key Features**:
    - **User**: View my applications, Application details.
    - **Admin**: View applications for a job, Update application status.

### Reports Module
- **Purpose**: Content moderation and reporting.
- **Entry Point**: `/api/v1/reports` (controller: `report.controller.ts`)
- **Key Features**:
    - **Reporting**: Report Posts, Comments, Users, or Jobs with reasons.

### Portfolio Module
- **Purpose**: Showcasing user creative work.
- **Entry Point**: `/api/v1/portfolios` (controller: `portfolio.controller.ts`)
- **Key Features**:
    - **CRUD**: Manage portfolio items (Video, Image, External Link).
    - **Visibility**: Control item visibility (Public/Connections).

### Analytics Module
- **Purpose**: System-wide and feature-specific data analysis.
- **Entry Point**: `/api/v1/analytics` (controller: `analytics.controller.ts`)
- **Key Features**:
    - **Posts**: Aggregated summary, detailed post analytics, demographic breakdown.
    - **Connections**: Platform-wide connection stats, inter-chapter/region flows (Super Admin).

