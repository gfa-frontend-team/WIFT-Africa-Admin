# Search & Discovery Module API

## Overview
The Search module provides powerful search capabilities for finding members based on roles, skills, location, and availability. It also handles personalized recommendations.

## Base URL
`/api/v1/search`

## Authentication
- **Required**: Yes (all endpoints).
- **Type**: Bearer Token (JWT).
- **Header**: `Authorization: Bearer <access_token>`

---

## 1. User Search

### 1.1 Search Users
**Method:** `GET`
**Path:** `/api/v1/search/users`
**Description:** Advanced search for members with multiple filters.

#### Query Parameters
- `query`: string (Name, username, or headline)
- `role`: string (Enum: PRODUCER, DIRECTOR, etc.) - *Single role filter*
- `roles`: string[] - *Multiple role filter*
- `skills`: string[] - *Skill based filter*
- `location`: string
- `chapter`: string (Chapter ID)
- `availability`: 'AVAILABLE' | 'BUSY' | 'NOT_LOOKING'
- `isMultihyphenate`: boolean
- `excludeConnected`: boolean (default: false)
- `sortBy`: 'relevance' | 'name' | 'recent' | 'connections' (default: relevance)
- `page`: number (default: 1)
- `limit`: number (default: 20)

#### Response (200 OK)
```typescript
{
  users: Array<{
    id: string;
    firstName: string;
    lastName: string;
    username: string;
    profilePhoto: string;
    headline: string;
    primaryRole: string;
    roles: string[];
    location: string;
    availabilityStatus: string;
    chapter: { id: string, name: string };
    isConnected: boolean;
    connectionStatus: 'connected' | 'pending' | 'none';
  }>;
  total: number;
  pages: number;
  filters: {
    availableRoles: string[];
    availableChapters: any[];
    locationSuggestions: string[];
  };
}
```

---

## 2. Recommendations

### 2.1 Get User Recommendations
**Method:** `GET`
**Path:** `/api/v1/search/recommendations/users`
**Description:** Get suggested connections based on user profile and activity.

#### Query Parameters
- `limit`: number (default: 10, max: 20)

#### Response (200 OK)
```typescript
{
  recommendations: Array<{
    id: string;
    firstName: string;
    lastName: string;
    // ... basic user info
    recommendationReason: string; // e.g., "Same chapter", "Shared skills"
    score: number;
  }>;
  total: number;
}
```

---

## 3. Metadata & Utilities

### 3.1 Get Popular Skills
**Method:** `GET`
**Path:** `/api/v1/search/skills`
**Description:** Returns popular skills for autocomplete/suggestions.

#### Query Parameters
- `limit`: number (default: 20)

#### Response
```typescript
{
  skills: string[];
}
```

### 3.2 Get Search Filters
**Method:** `GET`
**Path:** `/api/v1/search/filters`
**Description:** Returns available filter options (roles, chapters, locations) to populate UI dropdowns.

#### Response
```typescript
{
  availableRoles: string[];
  availableChapters: Array<{ id: string, name: string }>;
  locationSuggestions: string[];
}
```
