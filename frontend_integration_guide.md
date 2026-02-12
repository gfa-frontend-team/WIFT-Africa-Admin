# Frontend Integration Guide: Admin Hierarchy Migration

This document outlines the changes required for the frontend applications (Admin Portal & Member App) following the migration of the Admin logic to a dedicated hierarchy.

## 🚨 Core Concept: Strict Separation

We have moved from a **Role-Based User Model** (where `User.accountType` determined if someone was an admin) to a **Distinct Entity Model**.

*   **Member App**: Interacts with the [User](file:///Users/khalidsalman-yusuf/Documents/Unleashified/Active/WIFT-Africa-Backend/src/models/User.ts#44-91) collection. Uses `/api/v1/auth/user/*`.
*   **Admin Portal**: Interacts with the [Administrator](file:///Users/khalidsalman-yusuf/Documents/Unleashified/Active/WIFT-Africa-Backend/src/models/Administrator.ts#10-23) collection. Uses `/api/v1/auth/admin/*`.

---

## 🛠️ Admin Portal Changes

The Admin Portal must be updated to use the new Admin-specific endpoints.

### 1. Authentication (NEW)
The Admin Portal **must not** use the standard user login.

*   **Login Endpoint**: `POST /api/v1/auth/admin/login`
    *   **Input**: `{ "email": "...", "password": "..." }`
    *   **Output**: `{ "token": "jwt...", "admin": { ... } }`
    *   **Note**: This token is signed differently from User tokens. It grants access to `/api/v1/admin/*` routes.

*   **Get Profile**: `GET /api/v1/admin/me`
    *   **Header**: `Authorization: Bearer <token>`
    *   **Returns**: Current admin profile (role, chapterId, etc.).

### 2. Admin Management (NEW)
Super Admins and HQ Staff can now manage other admins directly.

*   **List Admins**: `GET /api/v1/admin/staff`
    *   **Query Params**: `?role=CHAPTER_ADMIN&chapterId=...`
    *   **Use Case**: "Team" or "Staff" management page.

*   **Create Admin**: `POST /api/v1/admin/staff`
    *   **Body**:
        ```json
        {
          "email": "new.admin@wiftafrica.org",
          "firstName": "Jane",
          "lastName": "Doe",
          "role": "CHAPTER_ADMIN",
          "chapterId": "..." // Required for Chapter-level roles
        }
        ```
    *   **Note**: Password is auto-generated if not provided (frontend should handle the "invite" flow UI).

*   **Update Admin**: `PATCH /api/v1/admin/staff/:id`
*   **Delete Admin**: `DELETE /api/v1/admin/staff/:id`

### 3. Existing Functionality
All existing admin routes (e.g., managing chapters, moderating posts) have been migrated to accept **only** the new Admin Token.

*   ✅ **Works**: Calling `PATCH /api/v1/admin/posts/:id/hide` with an **Admin Token**.
*   ❌ **Fails**: Calling the same route with a **User Token** (even if that user was previously an "admin").

---

## 📱 Member App Changes

The Member App is for **Users** (Regular Members, Paid Members).

### 1. Removal of Admin Features
If the Member App previously had pages for "Chapter Admin" features (e.g., "Manage Chapter", "Hide Post"), these **must be removed or hidden**.

*   Regular users (even those who were previously "admins") no longer have permissions to access `/api/v1/admin/*` endpoints.
*   The `accountType` field on the [User](file:///Users/khalidsalman-yusuf/Documents/Unleashified/Active/WIFT-Africa-Backend/src/models/User.ts#44-91) object should no longer be used to determine admin privileges. `accountType` will be deprecated.

### 2. Post Creation
*   Users continue to post as normal using `/api/v1/posts`.
*   **Note**: If an *Admin* posts via the Admin Portal, the post will look similar, but the backend handles the authorship differently. The Member App should just display the post as usual.

---

## 🔄 Migration Checklist for Frontend Developers

### Admin Portal
- [ ] **Switch Login**: Update login form to POST to `/api/v1/auth/admin/login`.
- [ ] **Update Auth Store**: Store the Admin Token separately (e.g., `admin_token` vs `token`).
- [ ] **Profile Fetch**: Call `/api/v1/admin/me` on load instead of `/api/v1/auth/me`.
- [ ] **Staff Management**: Build UI for `/api/v1/admin/staff` to list and create new admins.
- [ ] **Error Handling**: Handle `401 Unauthorized` specifically for expired *Admin* tokens.

### Member App
- [ ] **Cleanup**: Remove any "Admin Dashboard" links or routing.
- [ ] **Profile**: Stop displaying "Admin" badges based on `accountType`.
- [ ] **Protection**: Ensure no calls to `/api/v1/admin/*` are made.

---

## 📚 Role Reference

| Role | Scope | Permissions |
|---|---|---|
| **SUPER_ADMIN** | Global | Full Access. Can manage Chapter Admins, HQ Staff, and System Settings. |
| **HQ_STAFF** | Global | Can manage Users, Content, and view global Analytics. Cannot delete Admins. |
| **CHAPTER_ADMIN** | Chapter | Manage their Chapter's Members, Content, and Staff. |
| **CHAPTER_STAFF** | Chapter | Assist with Content and Events in their Chapter. |
