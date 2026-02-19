# Admin Authentication API Reference

This document details the API endpoints used for Administrator authentication.

## 1. Admin Login

**Endpoint**: `POST /api/v1/auth/admin/login`

**Description**: Authenticates an administrator and returns access and refresh tokens.

### Request Body
```json
{
  "email": "admin@example.com",
  "password": "securePassword123!"
}
```

### Success Response (200 OK)
```json
{
  "message": "Admin login successful",
  "admin": {
    "id": "65d3a...",
    "email": "admin@example.com",
    "firstName": "Super",
    "lastName": "Admin",
    "role": "SUPER_ADMIN",
    "chapterId": "..." // Optional, present if role is CHAPTER_ADMIN/STAFF
  },
  "tokens": {
    "accessToken": "eyJhbGciOiJIUz...",
    "refreshToken": "eyJhbGciOiJIUz..."
  }
}
```

---

## 2. Refresh Token

**Endpoint**: `POST /api/v1/auth/refresh`

**Description**: Generates a new access token using a valid refresh token. This endpoint is shared with regular users but automatically handles admin tokens correctly.

### Request Body
```json
{
  "refreshToken": "eyJhbGciOiJIUz..."
}
```

### Success Response (200 OK)
```json
{
  "message": "Tokens refreshed successfully",
  "tokens": {
    "accessToken": "eyJhbGciOiJIUz...", // NEW Access Token
    "refreshToken": "eyJhbGciOiJIUz..." // NEW Refresh Token (old one is invalidated)
  }
}
```

### Error Responses
- **401 Unauthorized**: Invalid token, expired token, or admin account is inactive/banned.

---

## 3. Logout

**Endpoint**: `POST /api/v1/auth/logout`

**Description**: Invalidates the refresh token, effectively logging the admin out.

### Request Body
```json
{
  "refreshToken": "eyJhbGciOiJIUz..."
}
```

### Success Response (200 OK)
```json
{
  "message": "Logout successful"
}
```

---

## 4. Implementation Notes for Frontend

1.  **Storage**: Store the `accessToken` in memory or short-lived storage. Store the [refreshToken](file:///Users/khalidsalman-yusuf/Documents/Unleashified/Active/WIFT-Africa-Backend/src/modules/auth/auth.controller.ts#125-139) securely (e.g., HTTPOnly cookie if possible, or LocalStorage if not).
2.  **Interceptor**: Implement an Axios (or fetch) interceptor to catch `401 Unauthorized` errors.
    - If a 401 occurs, attempt to call `/api/v1/auth/refresh` using the stored refresh token.
    - If refresh succeeds, retry the original request with the new access token.
    - If refresh fails, redirect to the login page.
3.  **Role Checks**: Use the `admin.role` field from the login response to determine which UI elements to show (e.g., hiding "Global Settings" for Chapter Admins).
