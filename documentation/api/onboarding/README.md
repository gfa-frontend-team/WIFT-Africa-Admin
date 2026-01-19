# Onboarding Module API

## Overview
The Onboarding module manages the multi-step registration process after a user verifies their email. It handles role selection, chapter assignment, profile initialization, and terms acceptance.

## Base URL
`/api/v1/onboarding`

## Authentication
- **Verified Email**: All endpoints require a verified email address.
- **Type**: Bearer Token (JWT)
- **Header**: `Authorization: Bearer <access_token>`

---

## 1. Get Onboarding Progress
**Method:** `GET`
**Path:** `/api/v1/onboarding/progress`
**Description:** Checks the user's current position in the onboarding flow.

#### Response (200 OK)
```typescript
{
  currentStep: number;
  isComplete: boolean;
  emailVerified: boolean;
  steps: {
    roles: boolean;
    specializations: boolean;
    chapter: boolean;
    profile: boolean;
    terms: boolean;
  };
  data: any; // Saved onboarding data if any
}
```

---

## 2. Onboarding Steps

### Step 1: Role Selection
**Method:** `POST`
**Path:** `/api/v1/onboarding/roles`
**Description:** User selects their primary and secondary roles in the industry.

#### Body
```typescript
{
  roles: Array<'PRODUCER' | 'DIRECTOR' | 'WRITER' | 'ACTRESS' | 'CREW' | 'BUSINESS'>;
  primaryRole: 'PRODUCER' | 'DIRECTOR' | 'WRITER' | 'ACTRESS' | 'CREW' | 'BUSINESS';
}
```

---

### Step 2: Specializations
**Method:** `POST`
**Path:** `/api/v1/onboarding/specializations`
**Description:** Captures detailed specializations based on selected roles. This step is conditional (only required for Writer, Crew, or Business roles).

#### Body
```typescript
{
  writerSpecialization?: 'TV' | 'FILM' | 'BOTH';
  crewSpecializations?: Array<'CINEMATOGRAPHER' | 'EDITOR' | 'COMPOSER' | ...>;
  businessSpecializations?: Array<'ENTERTAINMENT_LAW' | 'DISTRIBUTION' | 'FINANCE' | ...>;
}
```

---

### Step 3: Chapter Selection

#### 3.1 Get Available Chapters
**Method:** `GET`
**Path:** `/api/v1/onboarding/chapters`

#### Response (200 OK)
```typescript
{
  chapters: Array<{
    id: string;
    name: string;
    code: string;
    country: string;
    description: string;
    memberCount: number;
    requiresApproval: boolean;
    presidentName: string;
    adminName: string;
  }>;
}
```

#### 3.2 Submit Chapter
**Method:** `POST`
**Path:** `/api/v1/onboarding/chapter`

#### Body
```typescript
{
  chapterId: string;
  memberType: 'NEW' | 'EXISTING';
  membershipId?: string; // Required if EXISTING
  phoneNumber?: string;
  additionalInfo?: string;
}
```

---

### Step 4: Profile Setup
**Method:** `POST`
**Path:** `/api/v1/onboarding/profile`
**Description:** Initializes the public profile and optional initial CV upload.

#### Header
`Content-Type: multipart/form-data`

#### Body (FormData)
- `bio`: string (max 1000 chars)
- `headline`: string (max 255 chars)
- `location`: string
- `website`: string (URL)
- `imdbUrl`: string (URL)
- `linkedinUrl`: string (URL)
- `instagramHandle`: string
- `twitterHandle`: string
- `availabilityStatus`: 'AVAILABLE' | 'BUSY' | 'NOT_LOOKING'
- `cv`: File (Optional, max 10MB, PDF/DOC)

#### Response (200 OK)
```typescript
{
  message: string;
  nextStep: number;
  cvUploaded: boolean;
}
```

---

### Step 5: Terms & Completion
**Method:** `POST`
**Path:** `/api/v1/onboarding/accept-terms`
**Description:** Finalizes onboarding.

#### Response (200 OK)
```typescript
{
  message: "Onboarding completed successfully";
  onboardingComplete: true;
  membershipStatus: "PENDING" | "APPROVED";
}
```
