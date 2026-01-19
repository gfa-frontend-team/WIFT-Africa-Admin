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

### 1.4 Profile Photo & Banner Management

#### Upload Profile Photo
**Method:** `POST`
**Path:** `/api/v1/users/me/profile-photo`
**Description:** Uploads a new profile photo. Max 5MB, image files only.

**Header:** `Content-Type: multipart/form-data`
**Body:** `photo` (File)

**Response (200 OK):**
```typescript
{
  message: string;
  photoUrl: string;
}
```

#### Delete Profile Photo
**Method:** `DELETE`
**Path:** `/api/v1/users/me/profile-photo`
**Description:** Removes the current profile photo.

**Response (200 OK):**
```typescript
{
  description: "Photo deleted successfully"
}
```

#### Upload Banner
**Method:** `PATCH`
**Path:** `/api/v1/users/me/banner/upload`
**Description:** Uploads a profile banner image.

**Header:** `Content-Type: multipart/form-data`
**Body:** `photo` (File)

**Response (200 OK):**
```typescript
{
  message: string;
  photoUrl: string;
}
```

---

### 1.5 Username Management

#### Update Username
**Method:** `PUT`
**Path:** `/api/v1/users/me/username`
**Description:** Changes the user's username. Rate limited to 3 changes per month.

**Body:** `{ username: string }`

#### Check Username Availability
**Method:** `GET`
**Path:** `/api/v1/users/me/username/check`
**Query Params:** `username` (string)

**Response (200 OK):**
```typescript
{
  available: boolean;
  username: string;
  error?: string;
}
```

#### Get Username Suggestions
**Method:** `GET`
**Path:** `/api/v1/users/me/username/suggestions`
**Description:** Get a list of available username suggestions.

**Response (200 OK):**
```typescript
{
  suggestions: string[];
}
```

---

### 1.6 Privacy Settings
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

### 1.7 CV/Resume Management

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

### 1.8 Share Profile
**Method:** `GET`
**Path:** `/api/v1/users/me/share-link`
**Description:** Generates a shareable link for the user's profile.

**Response (200 OK):**
```typescript
{
  url: string;
  username: string;
  profileSlug: string;
}
```

---

### 1.9 Post Analytics
**Method:** `GET`
**Path:** `/api/v1/users/me/posts/analytics`
**Description:** Retrieves analytics for the user's posts.

**Response (200 OK):**
```typescript
{
  totalPosts: number;
  posts: Array<{
    postId: string;
    postType: 'TEXT' | 'IMAGE' | 'VIDEO';
    createdAt: string; // ISO Date
    engagement: {
      likes: number;
      comments: number;
      saves: number;
      shares: number;
    };
  }>;
}
```

---

## 2. Public Profile Endpoints

### 2.1 Get Public Profile
**Method:** `GET`
**Path:** `/api/v1/profiles/:identifier`
**Description:** Fetches a user's public profile.
- `:identifier` can be a **username** (e.g. `jane-doe`) or **User ID**.

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

### 2.2 Record Profile View
**Method:** `POST`
**Path:** `/api/v1/profiles/views/:profileOwnerId`
**Description:** Records that the current user viewed `profileOwnerId`'s profile.

### 2.3 Get Profile Views (Analytics)
**Method:** `GET`
**Path:** `/api/v1/profiles/views/:profileOwnerId`
**Description:** Returns who viewed the profile. Users can only fetch analytics for their **own** profile.
