# Notifications Module API

## Overview
The Notifications module manages user notifications, including fetching, marking as read, managing preferences, and handling push tokens.

## Base URL
`/api/v1/notifications`

## Authentication
- **Required**: Yes (all endpoints).
- **Type**: Bearer Token (JWT).
- **Header**: `Authorization: Bearer <access_token>`

---

## 1. Notification Management

### 1.1 Get Notifications
**Method:** `GET`
**Path:** `/api/v1/notifications`
**Description:** Retrieve user's notifications with optional filtering.

#### Query Parameters
- `page`: number (default: 1)
- `limit`: number (default: 20)
- `unreadOnly`: boolean (default: false)

#### Response (200 OK)
```typescript
{
  notifications: Array<{
    id: string;
    type: string;
    title: string;
    message: string;
    isRead: boolean;
    actionUrl?: string;
    createdAt: string;
    sender?: {
      id: string;
      name: string;
      profilePhoto: string;
    };
  }>;
  total: number;
  unreadCount: number;
  pages: number;
}
```

### 1.2 Get Unread Count
**Method:** `GET`
**Path:** `/api/v1/notifications/unread-count`

#### Response (200 OK)
```typescript
{
  count: number;
}
```

### 1.3 Mark as Read
**Method:** `PATCH`
**Path:** `/api/v1/notifications/:notificationId/read`

### 1.4 Mark All as Read
**Method:** `POST`
**Path:** `/api/v1/notifications/mark-all-read`

#### Response (200 OK)
```typescript
{
  message: string;
  count: number; // Number of notifications updated
}
```

### 1.5 Delete Notification
**Method:** `DELETE`
**Path:** `/api/v1/notifications/:notificationId`

---

## 2. Preferences

### 2.1 Get Preferences
**Method:** `GET`
**Path:** `/api/v1/notifications/preferences`

#### Response (200 OK)
```typescript
{
  preferences: {
    emailEnabled: boolean;
    pushEnabled: boolean;
    inAppEnabled: boolean;
    connectionNotifications: boolean;
    postNotifications: boolean;
    messageNotifications: boolean;
    membershipNotifications: boolean;
    adminNotifications: boolean;
    emailDigestFrequency: 'instant' | 'daily' | 'weekly' | 'never';
  };
}
```

### 2.2 Update Preferences
**Method:** `PUT`
**Path:** `/api/v1/notifications/preferences`

#### Body
```typescript
{
  emailEnabled?: boolean;
  pushEnabled?: boolean;
  inAppEnabled?: boolean;
  connectionNotifications?: boolean;
  // ... any preference field
}
```

---

## 3. Push Tokens

### 3.1 Register Push Token
**Method:** `POST`
**Path:** `/api/v1/notifications/push-tokens`

#### Body
```typescript
{
  token: string;
  deviceType: 'ios' | 'android' | 'web';
  deviceId?: string;
}
```

### 3.2 Unregister Push Token
**Method:** `DELETE`
**Path:** `/api/v1/notifications/push-tokens/:token`
