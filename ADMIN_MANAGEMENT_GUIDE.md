# WIFT Africa - Admin Management Guide

This guide details the functionality and usage of the Admin Management module, including creating, updating, and managing administrator accounts.

## 1. Overview
The Admin Management module allows Global Admins (Super Admin, HQ Staff) to manage the entire admin hierarchy, and Chapter Admins to manage staff within their own chapters.

### Role Hierarchy
1.  **SUPER_ADMIN**: Full access to the entire system.
2.  **HQ_STAFF**: Global access but restricted from high-level system config (similar to Super Admin for user management).
3.  **CHAPTER_ADMIN**: Admin for a specific Chapter. Can manage members and staff *only* within their chapter.
4.  **CHAPTER_STAFF**: Operational staff for a specific Chapter. Cannot manage other admins.

---

## 2. Password Handling & Security

### Creation
When a new administrator is created:
1.  **Auto-Generation:** If no password is provided in the `POST` request, the system **automatically generates** a secure random password (e.g., `8f2A9!b2`).
2.  **Email Notification:** The system sends a **Welcome Email** to the new admin containing their temporary password and a login link.

### Reset / Update
*   Admins can change their own password via the profile settings (if implemented).
*   Super Admins can reset passwords for others by updating the admin record.

---

## 3. RBAC (Role-Based Access Control) Rules

The system enforces strict RBAC to ensure data security and organizational hierarchy.

| Actor | Target | Action | Permission |
| :--- | :--- | :--- | :--- |
| **Super Admin** | Any Admin | Any CRUD | ✅ **Allowed** |
| **Chapter Admin** | Chapter Staff (Own Chapter) | Create/Update | ✅ **Allowed** |
| **Chapter Admin** | Chapter Admin (Own Chapter) | Update | ⚠️ **Restricted** (Cannot change role/chapter) |
| **Chapter Admin** | Global Admin | Any | ❌ **Denied** |
| **Chapter Admin** | Other Chapter Staff | Any | ❌ **Denied** |

---

## 4. API Reference (Detailed)

**Base URL**: `/api/v1/admin/staff`
**Authentication**: Requires `Authorization: Bearer <token>`

### 1. List Administrators
Retrieves a list of all administrators.

- **URL**: `/`
- **Method**: `GET`
- **Query Parameters**:
    - `role` (optional): Filter to a specific role (e.g., `CHAPTER_STAFF`).
    - `chapterId` (optional): Filter to a specific chapter.
- **Access**: Global Admins see all; Chapter Admins see only their chapter's staff.

**Success Response (200 OK)**
```json
{
  "count": 2,
  "admins": [
    {
      "_id": "651f...",
      "email": "jane@chapter.org",
      "firstName": "Jane",
      "lastName": "Doe",
      "role": "CHAPTER_STAFF",
      "chapterId": "651a...",
      "isActive": true,
      "createdBy": "650b...",
      "createdAt": "2023-10-05T12:00:00.000Z",
      "updatedAt": "2023-10-05T12:00:00.000Z"
    },
    {
      "_id": "652a...",
      "email": "john@chapter.org",
      "firstName": "John",
      "lastName": "Smith",
      "role": "CHAPTER_ADMIN",
      "chapterId": "651a...",
      "isActive": true,
      "createdBy": "650b...",
      "createdAt": "2023-10-06T09:30:00.000Z",
      "updatedAt": "2023-10-06T09:30:00.000Z"
    }
  ]
}
```

### 2. Create Administrator
Creates a new administrator account and sends a welcome email.

- **URL**: `/`
- **Method**: `POST`
- **Body Parameters**:
    - `email` (string, required): Unique email address.
    - `firstName` (string, required): First name.
    - `lastName` (string, required): Last name.
    - `role` (enum, required): One of `SUPER_ADMIN`, `HQ_STAFF`, `CHAPTER_ADMIN`, `CHAPTER_STAFF`.
    - `chapterId` (string, required for Chapter roles): The ID of the chapter they belong to.
    - `password` (string, optional): Initial password. If omitted, one is auto-generated.

**Success Response (201 Created)**
```json
{
  "message": "Administrator created successfully",
  "admin": {
    "id": "653b...",
    "email": "new.admin@example.com",
    "firstName": "Alice",
    "lastName": "Wonder",
    "role": "CHAPTER_STAFF"
  }
}
```

**Error Responses**
- `400 Bad Request`: Missing fields or invalid data (e.g., missing `chapterId` for `CHAPTER_STAFF`).
- `403 Forbidden`: Insufficient permissions (e.g., Chapter Admin creating a valid role but for a different chapter).
- `409 Conflict`: Admin with this email already exists.

### 3. Get Administrator Details
Retrieves detailed information for a single administrator.

- **URL**: `/:id`
- **Method**: `GET`
- **Access**: Global Admins can view anyone; Chapter Admins can only view staff in their chapter.

**Success Response (200 OK)**
```json
{
  "_id": "651f...",
  "email": "jane@chapter.org",
  "firstName": "Jane",
  "lastName": "Doe",
  "role": "CHAPTER_STAFF",
  "chapterId": "651a...",
  "isActive": true,
  "createdBy": "650b...",
  "createdAt": "2023-10-05T12:00:00.000Z",
  "updatedAt": "2023-10-05T12:00:00.000Z"
}
```

**Error Responses**
- `404 Not Found`: Admin ID does not exist.
- `403 Forbidden`: Access denied (e.g., trying to view an admin from another chapter).

### 4. Update Administrator
Updates specific fields of an administrator.

- **URL**: `/:id`
- **Method**: `PATCH`
- **Body Parameters** (all optional):
    - `firstName` (string)
    - `lastName` (string)
    - `role` (enum): Notes: Chapter Admins cannot promote/demote to Global roles.
    - `chapterId` (string): Notes: Chapter Admins cannot change this.
    - `isActive` (boolean): `true` to enable, `false` to disable account.

**Success Response (200 OK)**
```json
{
  "message": "Administrator updated successfully",
  "admin": {
    "_id": "651f...",
    "email": "jane@chapter.org",
    "firstName": "Janet", 
    "lastName": "Doe",
    "role": "CHAPTER_STAFF",
    "chapterId": "651a...",
    "isActive": false,
    ...
  }
}
```

### 5. Delete Administrator
Permanently removes an administrator account.

- **URL**: `/:id`
- **Method**: `DELETE`
- **Access**: Global Admins can delete anyone; Chapter Admins can only delete staff in their chapter.

**Success Response (200 OK)**
```json
{
  "message": "Administrator deleted successfully"
}
```


---

## 5. Troubleshooting

**"Unauthorized" (401)**
*   Ensure you are sending a valid Bearer Token in the `Authorization` header.

**"Forbidden" (403)**
*   You are trying to perform an action outside your permission scope (e.g., Chapter Admin trying to create a Super Admin or access another chapter's data).

**"Conflict" (409)**
*   An admin with that email already exists.
