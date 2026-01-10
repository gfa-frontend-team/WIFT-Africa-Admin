# Connections Module API

## Overview
The Connections module manages professional networking features, allowing users to send requests, connect, and block other users.

## Base URL
`/api/v1/connections`

## Authentication
- **Required**: Yes (all endpoints).
- **Type**: Bearer Token (JWT).
- **Header**: `Authorization: Bearer <access_token>`

---

## 1. Connection Requests

### 1.1 Send Request
**Method:** `POST`
**Path:** `/api/v1/connections/requests`
**Description:** Send a connection request to another user.

#### Body
```typescript
{
  receiverId: string;
  message?: string; // Max 300 chars
}
```

### 1.2 Get Requests
**Method:** `GET`
**Path:** `/api/v1/connections/requests`
**Description:** Retrieve pending requests.

#### Query Parameters
- `type`: 'incoming' | 'outgoing' | 'all' (default: 'all')
- `page`: number (default: 1)
- `limit`: number (default: 20)

### 1.3 Manage Requests
- **Accept**: `PATCH /api/v1/connections/requests/:requestId/accept`
- **Decline**: `PATCH /api/v1/connections/requests/:requestId/decline`
  - Body: `{ reason?: string }`
- **Cancel**: `PATCH /api/v1/connections/requests/:requestId/cancel`

---

## 2. Connections Management

### 2.1 Get My Connections
**Method:** `GET`
**Path:** `/api/v1/connections`
**Description:** List of accepted connections.

#### Query Parameters
- `page`: number
- `limit`: number

### 2.2 Remove Connection
**Method:** `DELETE`
**Path:** `/api/v1/connections/:connectionId`

### 2.3 Check Connection Status
**Method:** `GET`
**Path:** `/api/v1/connections/check/:targetUserId`
**Response:** `{ connected: boolean }`

### 2.4 Get Stats
**Method:** `GET`
**Path:** `/api/v1/connections/stats`
**Response:**
```typescript
{
  connectionsCount: number;
  pendingIncoming: number;
  pendingOutgoing: number;
}
```

---

## 3. Blocking

### 3.1 Block User
**Method:** `POST`
**Path:** `/api/v1/connections/block`

#### Body
```typescript
{
  userId: string;
  reason?: string;
}
```

### 3.2 Unblock User
**Method:** `DELETE`
**Path:** `/api/v1/connections/block/:blockedUserId`

### 3.3 Get Blocked Users
**Method:** `GET`
**Path:** `/api/v1/connections/blocked`
