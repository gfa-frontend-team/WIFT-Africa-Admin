# Broadcast Conversation API - New Response Format

## Implementation Complete ✅

All changes have been successfully implemented to enhance broadcast conversation responses.

---

## API Endpoint

**GET** `/api/v1/messages/conversations`

---

## New Response Format

### 1. ALL Broadcast (Platform-wide)

```json
{
  "id": "conv_789",
  "type": "BROADCAST",
  "title": "Important Platform Update",
  "description": "New features announcement",
  "creator": {
    "_id": "admin_123",
    "firstName": "Admin",
    "lastName": "User",
    "username": "admin",
    "profileSlug": "admin-user",
    "profilePhoto": "https://..."
  },
  "lastMessage": {
    "content": "We're excited to announce...",
    "sender": "admin_123",
    "createdAt": "2024-01-15T09:00:00.000Z",
    "isRead": false,
    "isBroadcast": true,
    "recipientCount": 450
  },
  "lastMessageAt": "2024-01-15T09:00:00.000Z",
  "broadcastType": "ALL",
  "chapter": null,
  "recipientCount": 450
}
```

### 2. CHAPTER Broadcast

```json
{
  "id": "conv_456",
  "type": "BROADCAST",
  "title": "WIFT Kenya Monthly Newsletter",
  "description": "January 2024 updates",
  "creator": {
    "_id": "admin_789",
    "firstName": "Sarah",
    "lastName": "Johnson",
    "username": "sarahj",
    "profileSlug": "sarah-johnson",
    "profilePhoto": "https://..."
  },
  "lastMessage": {
    "content": "Dear WIFT Kenya members...",
    "sender": "admin_789",
    "createdAt": "2024-01-15T08:00:00.000Z",
    "isRead": true,
    "isBroadcast": true,
    "recipientCount": 150
  },
  "lastMessageAt": "2024-01-15T08:00:00.000Z",
  "broadcastType": "CHAPTER",
  "chapter": {
    "_id": "chapter_001",
    "name": "WIFT Kenya",
    "code": "KE",
    "country": "Kenya",
    "city": "Nairobi"
  },
  "recipientCount": 150
}
```

### 3. CUSTOM Broadcast

```json
{
  "id": "conv_321",
  "type": "BROADCAST",
  "title": "Board Meeting Reminder",
  "description": "Quarterly board meeting",
  "creator": {
    "_id": "admin_456",
    "firstName": "Michael",
    "lastName": "Chen",
    "username": "michaelc",
    "profileSlug": "michael-chen",
    "profilePhoto": "https://..."
  },
  "lastMessage": {
    "content": "Reminder: Board meeting tomorrow...",
    "sender": "admin_456",
    "createdAt": "2024-01-14T15:00:00.000Z",
    "isRead": false,
    "isBroadcast": true,
    "recipientCount": 12
  },
  "lastMessageAt": "2024-01-14T15:00:00.000Z",
  "broadcastType": "CUSTOM",
  "chapter": null,
  "recipientCount": 12
}
```

---

## New Fields

### `broadcastType` (string)
- **Values:** `"ALL"` | `"CHAPTER"` | `"CUSTOM"`
- **Purpose:** Indicates broadcast scope
- **Always present** for broadcast conversations

### `chapter` (object | null)
- **Present when:** `broadcastType === "CHAPTER"`
- **Fields:**
  - `_id`: Chapter ID
  - `name`: Chapter name
  - `code`: Chapter code
  - `country`: Country
  - `city`: City (optional)
- **Null for:** ALL and CUSTOM broadcasts

### `recipientCount` (number)
- **Source:** From `lastMessage.recipientCount`
- **Accurate count** of recipients at send time
- **Replaces:** Old `participantCount` (which showed 0)

---

## Changes Summary

### Before
```json
{
  "id": "conv_123",
  "type": "BROADCAST",
  "title": "Broadcast from John Doe",
  "participantCount": 0,  // ❌ Wrong
  // ❌ No broadcast type
  // ❌ No chapter info
}
```

### After
```json
{
  "id": "conv_123",
  "type": "BROADCAST",
  "title": "WIFT Kenya Newsletter",
  "broadcastType": "CHAPTER",  // ✅ NEW
  "chapter": { /* chapter object */ },  // ✅ NEW
  "recipientCount": 150  // ✅ Accurate
}
```

---

## Migration Required

Run this script to convert existing data:

```bash
ts-node scripts/migrate-broadcast-conversations.ts
```

This converts string-based `targetChapterId` to ObjectId references.

---

## Files Modified

1. ✅ `src/models/Conversation.ts` - Schema updated
2. ✅ `src/services/message.service.ts` - Response enhanced
3. ✅ `scripts/migrate-broadcast-conversations.ts` - Migration script

---

## Testing Checklist

- [ ] Test ALL broadcast response
- [ ] Test CHAPTER broadcast with populated chapter
- [ ] Test CUSTOM broadcast response
- [ ] Verify recipientCount is accurate
- [ ] Run migration script on staging
- [ ] Test frontend integration
