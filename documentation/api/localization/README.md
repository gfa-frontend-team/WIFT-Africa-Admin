# Localization Module API

## Overview
The Localization module handles language preferences for the application and supported platform languages.

## Base URL
The localization endpoints are currently mounted under the profiles namespace:
`/api/v1/profiles`

## Authentication
- **Public**: Getting supported languages.
- **Protected**: Getting or updating user-specific language preferences (Bearer Token).

---

## 1. Supported Languages

### 1.1 Get Supported Languages
**Method:** `GET`
**Path:** `/api/v1/profiles/languages`
**Description:** Get list of languages supported by the platform.

#### Response (200 OK)
```typescript
{
  data: Array<{
    code: string;    // e.g. "en"
    name: string;    // e.g. "English"
    default: boolean;
  }>
}
```

---

## 2. User Language Preferences

### 2.1 Get My Language
**Method:** `GET`
**Path:** `/api/v1/profiles/languages/me`
**Authentication:** Required

#### Response (200 OK)
```typescript
{
  language_code: string; // e.g. "en"
  language_name: string; // e.g. "English"
}
```

### 2.2 Update My Language
**Method:** `PATCH`
**Path:** `/api/v1/profiles/languages/me`
**Authentication:** Required

#### Body
```typescript
{
  language_code: string; // e.g. "fr"
}
```

#### Response (200 OK)
```typescript
{
  message: string;
  language_code: string;
}
```
