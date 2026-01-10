# Users Module API

## Overview
The Users module manages user profiles, settings, and public profile visibility. It handles sensitive user data like CVs and private contact info, as well as public-facing profile pages and analytics.

This documentation covers two main route prefixes:
1. `/api/v1/users` - Authenticated user self-management.
2. `/api/v1/profiles` - Public profile viewing and interactions.

## Base URLs
- User Management: `/api/v1/users`
- Profile Access: `/api/v1/profiles`

## Authentication
- **Permissions**:
  - `users/*`: Strictly authenticated (User manages their own data).
  - `profiles/*`: Public access (with optional auth for tracking) or Authenticated.
- **Type**: Bearer Token (JWT)
- **Header**: `Authorization: Bearer <access_token>`

---

## 1. User Management Endpoints

### 1.1 Get Current User Info
**Method:** `GET`
**Path:** `/api/v1/users/me`
**Description:** Retrieves basic information about the currently logged-in user.

#### Response (200 OK)
```typescript
{
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    profilePhoto?: string;
    // ... basic info
  }
}
```

---

### 1.2 Get Complete Profile
**Method:** `GET`
**Path:** `/api/v1/users/me/profile`
**Description:** Retrieves the user's full profile including roles, specializations, and detailed bio.

#### Response (200 OK)
```typescript
{
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    // ...
  },
  profile: {
    bio?: string;
    headline?: string;
    location?: string;
    website?: string;
    linkedinUrl?: string;
    // ...
  }
}
```

---

### 1.3 Update Profile
**Method:** `PATCH`
**Path:** `/api/v1/users/me/profile`
**Description:** Updates the user's profile details.

#### Body
```typescript
{
  bio?: string;             // Max 1000 chars
  headline?: string;        // Max 255 chars
  location?: string;        // Max 100 chars
  website?: string;         // URL
  imdbUrl?: string;         // URL
  linkedinUrl?: string;     // URL
  instagramHandle?: string; // Max 50 chars
  twitterHandle?: string;   // Max 50 chars
  availabilityStatus?: 'AVAILABLE' | 'BUSY' | 'NOT_LOOKING';
}
```

#### Response (200 OK)
Returns the updated profile object.

---

### 1.4 Upload Profile Photo
**Method:** `POST`
**Path:** `/api/v1/users/me/profile-photo`
**Description:** Uploads a new profile photo. Max 5MB, image files only.

#### Header
`Content-Type: multipart/form-data`

#### Body (FormData)
- `photo`: File (Required)

#### Response (200 OK)
```typescript
{
  message: string;
  photoUrl: string;
}
```

---

### 1.5 Update Username
**Method:** `PUT`
**Path:** `/api/v1/users/me/username`
**Description:** Changes the user's unique username (slug). Rate limited to 3 changes per month.

#### Body
```typescript
{
  username: string; // 3-30 chars, lowercase alphanumeric + hyphens
}
```

#### Response (200 OK)
Returns updated user object.

---

### 1.6 Check Username Availability
**Method:** `GET`
**Path:** `/api/v1/users/me/username/check`

#### Query Params
- `username`: string (Required)

#### Response (200 OK)
```typescript
{
  available: boolean;
  username: string;
  error?: string; // If unavailable, reason why
}
```

---

### 1.7 Privacy Settings
**Method:** `GET` | `PATCH`
**Path:** `/api/v1/users/me/privacy`

#### GET Response
```typescript
{
  privacySettings: {
    profileVisibility: 'PUBLIC' | 'CHAPTER_ONLY' | 'CONNECTIONS_ONLY' | 'PRIVATE';
    showEmail: boolean;
    showPhone: boolean;
    showSocialLinks: boolean;
    showChapter: boolean; // default: true
    showRoles: boolean;   // default: true
  }
}
```

#### PATCH Body
Same fields as GET response (all optional).

---

### 1.8 CV/Resume Management

#### Upload CV
**Method:** `POST`
**Path:** `/api/v1/users/me/cv`
**Header:** `multipart/form-data`
**Body:** `cv` (File, PDF/DOC, Max 10MB)

#### Download CV
**Method:** `GET`
**Path:** `/api/v1/users/me/cv/download`
**Description:** Redirects to a temporary, secure download URL for the user's CV.

#### Delete CV
**Method:** `DELETE`
**Path:** `/api/v1/users/me/cv`

---

## 2. Public Profile Endpoints

### 2.1 Get Public Profile
**Method:** `GET`
**Path:** `/api/v1/profiles/:identifier`
**Description:** Fetches a user's public profile.
- `:identifier` can be a **username** (e.g. `jane-doe`) or **User ID**.
- The response is filtered based on the target user's privacy settings and the viewer's relationship (logged in, connection, same chapter).

#### Authentication
- **Optional**: If authenticated, passing the token allows seeing more details (e.g. "Chapter Only" visibility).

#### Response (200 OK)
```typescript
{
  profile: {
    id: string;
    firstName: string;
    lastName: string;
    username: string;
    profilePhoto?: string;
    headline?: string;
    bio?: string;
    // ... limited fields based on privacy
  }
}
```
**Errors:**
- `404`: Profile not found
- `403`: Profile is private and viewer doesn't have access.

---

### 2.2 Record Profile View
**Method:** `POST`
**Path:** `/api/v1/profiles/views/:profileOwnerId`
**Description:** Records that the current user viewed `profileOwnerId`'s profile.

#### Authentication
- Required: Yes (Anonymous views are not recorded in this endpoint)

#### Response (200 OK)
```typescript
{
  message: "View recorded"
}
```

---

### 2.3 Get Profile Views (Analytics)
**Method:** `GET`
**Path:** `/api/v1/profiles/views/:profileOwnerId`
**Description:** Returns who viewed the profile. Users can only fetch analytics for their **own** profile (checked in business logic).

#### Query Params
- `lastMonth`: `boolean` (default: false, returns 90 days)

#### Response (200 OK)
```typescript
{
  count: number;
  viewers: Array<{
    viewerId: string;
    firstName: string;
    lastName: string;
    viewedAt: string; // ISO Date
    // ...
  }>;
}
```
