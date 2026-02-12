# Admin API Reference

**Base URL**: `/api/v1`

## Authentication

### Admin Login
Authenticates an administrator and returns a JWT token. This token is **required** for all other admin endpoints.

- **Method**: `POST`
- **Path**: `/auth/admin/login`
- **Public Access**: Yes

**Request Body**:
```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

**Response (200 OK)**:
```json
{
  "status": "success",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "admin": {
    "adminId": "65c3...",
    "email": "admin@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "SUPER_ADMIN",
    "chapterId": null // or chapter ID string
  }
}
```

---

## Admin Self

### Get Profile
Get details of the currently logged-in administrator.

- **Method**: `GET`
- **Path**: `/admin/me`
- **Auth**: Required

**Response (200 OK)**:
```json
{
  "admin": {
    "adminId": "65c3...",
    "email": "admin@example.com",
    "role": "SUPER_ADMIN",
    // ...other fields
  }
}
```

---

## Admin Management (Staff)

**Base Path**: `/admin/staff`
**Access**: SUPER_ADMIN, HQ_STAFF, CHAPTER_ADMIN (Restricted)

> **Note**: `CHAPTER_ADMIN` can only create/manage `CHAPTER_STAFF` within their own chapter. They cannot view or modify global admins or staff from other chapters.

### List Admins
- **Method**: `GET`
- **Path**: `/`
- **Query Params**:
  - `role` (optional): Filter by role (e.g., `CHAPTER_ADMIN`)
  - `chapterId` (optional): Filter by chapter

**Response (200 OK)**:
```json
{
  "count": 5,
  "admins": [
    {
      "_id": "...",
      "firstName": "Jane",
      "lastName": "Doe",
      "email": "jane@example.com",
      "role": "CHAPTER_ADMIN",
      "chapterId": "...",
      "isActive": true
    }
  ]
}
```

### Create Admin
- **Method**: `POST`
- **Path**: `/`

**Request Body**:
```json
{
  "email": "new.admin@wiftafrica.org",
  "firstName": "Alice",
  "lastName": "Smith",
  "role": "CHAPTER_ADMIN",
  "chapterId": "..." // Required for Chapter roles
}
```

**Response (201 Created)**:
```json
{
  "message": "Administrator created successfully",
  "admin": { ... }
}
```

### Get Admin Details
- **Method**: `GET`
- **Path**: [/:id](file:///Users/khalidsalman-yusuf/Documents/Unleashified/Active/WIFT-Africa-Backend/src/modules/admin/admin.controller.ts#299-317)

**Response (200 OK)**:
```json
{
  "_id": "...",
  "email": "...",
  // ...
}
```

### Update Admin
- **Method**: `PATCH`
- **Path**: [/:id](file:///Users/khalidsalman-yusuf/Documents/Unleashified/Active/WIFT-Africa-Backend/src/modules/admin/admin.controller.ts#299-317)

**Request Body** (Partial):
```json
{
  "firstName": "Alice Updated",
  "isActive": false
}
```

### Delete Admin
- **Method**: `DELETE`
- **Path**: [/:id](file:///Users/khalidsalman-yusuf/Documents/Unleashified/Active/WIFT-Africa-Backend/src/modules/admin/admin.controller.ts#299-317)

**Response (200 OK)**:
```json
{ "message": "Administrator deleted successfully" }
```

---

## Chapters

**Base Path**: `/admin/chapters`

### List Chapters
- **Method**: `GET`
- **Path**: `/`
- **Query Params**: `page`, `limit`, `search`, `country`, `isActive`

### Create Chapter
- **Method**: `POST`
- **Path**: `/`
- **Body**: `{ "name": "...", "code": "...", "country": "..." }`

### Add Chapter Admin
Links an existing Administrator to a Chapter.

- **Method**: `POST`
- **Path**: `/:id/admins`
- **Body**: `{ "adminId": "<admin_id_string>" }` (Note: Param name updated from userId)

### Remove Chapter Admin
- **Method**: `DELETE`
- **Path**: `/:id/admins/:adminId`

---

## Moderation (Posts)

### Hide Post
- **Method**: `PATCH`
- **Path**: `/admin/posts/:postId/hide`
- **Body**: `{ "reason": "Violation of rules..." }`

### Unhide Post
- **Method**: `PATCH`
- **Path**: `/admin/posts/:postId/unhide`

---

## Reports (Moderation)

**Base Path**: `/admin/reports`

### List Reports
- **Method**: `GET`
- **Path**: `/`
- **Query Params**: [status](file:///Users/khalidsalman-yusuf/Documents/Unleashified/Active/WIFT-Africa-Backend/test-chapter-staff-creation.ts#17-21) (OPEN/RESOLVED), `targetType`

### Resolve Report
- **Method**: `PATCH`
- **Path**: `/:reportId/resolve`
- **Body**: `{ "resolutionNote": "Action taken..." }`

---

## Analytics

- `GET /admin/analytics/members`: Member growth stats.
- `GET /admin/chapters/statistics`: General chapter stats.
- `GET /admin/monitoring/realtime`: System health (WebSocket connections).
