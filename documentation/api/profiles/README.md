# Profiles Module API

## Overview
The Profiles module handles the public-facing aspects of the platform. It allows users to view other members' profiles (subject to privacy settings) and tracks profile engagement analytics.

## Base URL
`/api/v1/profiles`

## Authentication
- **Public endpoints**: Can be accessed anonymously, but providing an Auth token enriches the response (e.g. seeing "Chapter Only" fields).
- **Public endpoints**: `/api/v1/profiles/:identifier`
- **Protected endpoints**: Analytics endpoints require a valid Bearer Token.

---

## Endpoints

### 1. Get Public Profile
**Method:** `GET`
**Path:** `/api/v1/profiles/:identifier`
**Description:** Fetches a user's public profile info.
- **Privacy Logic**: The backend automatically filters fields based on the viewer's relationship with the profile owner:
  - **Public**: Visible to everyone.
  - **Chapter Only**: Visible if viewer is in the same chapter.
  - **Connections Only**: Visible if viewer is a confirmed connection.
  - **Private**: Profile is hidden.

#### Parameters
- `identifier`: **Username** (e.g. `jane-doe`) or **User ID**.

#### Response (200 OK)
```typescript
{
  profile: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    profilePhoto?: string;
    headline?: string;
    bio?: string;
    location?: string;
    primaryRole?: string;
    roles?: string[];
    availabilityStatus?: 'AVAILABLE' | 'BUSY' | 'NOT_LOOKING';
    profileSlug?: string;
    // ... other fields depending on privacy
  }
}
```

#### Errors
- `404`: Profile not found.
- `403`: Profile is private and viewer does not have permission.

---

### 2. Record Profile View
**Method:** `POST`
**Path:** `/api/v1/profiles/views/:profileOwnerId`
**Description:** Records an analytic event that the current user has viewed a profile.
- **Constraint**: Anonymous views are NOT recorded via this endpoint (requires auth).
- **Usage**: Call this endpoint when the frontend loads a user's profile page.

#### Authentication
- **Required**: Yes
- **Type**: Bearer Token

#### Response (200 OK)
```typescript
{
  message: "Profile view recorded"
}
```

---

### 3. Get Profile Views (Analytics)
**Method:** `GET`
**Path:** `/api/v1/profiles/views/:profileOwnerId`
**Description:** Retrieves the list of users who have viewed a specific profile.
- **Security**: Users can ONLY view analytics for their **own** profile. Accessing another user's analytics returns 403.

#### Authentication
- **Required**: Yes
- **Type**: Bearer Token

#### Query Parameters
- `lastMonth`: `boolean`
  - `true`: Returns views from the last 30 days.
  - `false` (default): Returns views from the last 90 days.

#### Response (200 OK)
```typescript
{
  count: number; // Total number of views in the period
  viewers: Array<{
    viewerId: string;
    firstName: string;
    lastName: string;
    email: string;
    viewedAt: string; // ISO Date String
    chapter?: {
      id: string;
      name: string;
      code: string;
      country: string;
    };
  }>;
}
```

#### Errors
- `403`: Unauthorized (trying to view someone else's analytics).
