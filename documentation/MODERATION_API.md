# Admin Moderation API Documentation
**WIFT Africa Backend - Admin Moderation Endpoints**  
Generated: February 23, 2026

---

## Table of Contents
1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Permissions](#permissions)
4. [Endpoints](#endpoints)
5. [Request/Response Examples](#requestresponse-examples)
6. [Error Handling](#error-handling)
7. [Common Workflows](#common-workflows)

---

## Overview

The Admin Moderation API provides endpoints for administrators to manage user-generated content (posts and comments) on the WIFT Africa platform. These endpoints are specifically designed for admin authentication and bypass user-specific visibility restrictions.

**Base URL:** `/api/v1/admin`

**Key Features:**
- View all posts regardless of visibility settings
- Hide/unhide posts with moderation reasons
- Pin/unpin posts to highlight important content
- Delete posts and comments
- View post analytics
- Filter and search posts

---

## Authentication

All moderation endpoints require admin authentication using JWT tokens.

**Header:**
```
Authorization: Bearer <admin_jwt_token>
```

**Token Requirements:**
- Must be issued for an `Administrator` (not regular `User`)
- Must contain valid `adminId` in payload
- Administrator account must be active (`isActive: true`)

**Middleware:** `authenticateAdmin` (from `src/middleware/adminAuth.ts`)

---

## Permissions

### Role-Based Access Control

#### Super Admin
- ✅ Full access to all moderation features globally
- ✅ Can moderate posts from any chapter
- ✅ Can delete any post/comment
- ✅ Can pin/unpin any post
- ✅ Can view analytics for any post

#### Chapter Admin
- ✅ Can moderate posts within their chapter
- ✅ Can delete comments in their chapter
- ✅ Can pin posts in their chapter
- ✅ Can view analytics for their chapter posts
- ❌ Cannot moderate posts from other chapters

#### Chapter Staff
- ✅ Read-only access to moderation dashboard
- ❌ Cannot delete or hide posts
- ❌ Cannot delete comments
- ✅ Can view analytics

---

## Endpoints

### 1. Get All Posts (Moderation Feed)

**Endpoint:** `GET /admin/posts`

**Description:** Retrieve paginated list of all posts for moderation dashboard. Shows all posts regardless of visibility settings, including hidden posts.

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| page | integer | No | 1 | Page number |
| limit | integer | No | 20 | Items per page (max 100) |
| status | string | No | all | Filter by status: `all`, `pinned`, `hidden` |
| chapterId | string | No | - | Filter by chapter ID |
| search | string | No | - | Search in post content |

**Response:**
```json
{
  "posts": [
    {
      "_id": "65f1a2b3c4d5e6f7g8h9i0j1",
      "content": "Post content here...",
      "author": {
        "_id": "65f1a2b3c4d5e6f7g8h9i0j2",
        "firstName": "Jane",
        "lastName": "Doe",
        "username": "janedoe",
        "profilePhoto": "https://..."
      },
      "visibility": "PUBLIC",
      "isPinned": false,
      "isDeleted": false,
      "likesCount": 45,
      "commentsCount": 12,
      "sharesCount": 3,
      "savesCount": 8,
      "createdAt": "2026-02-20T10:30:00.000Z",
      "updatedAt": "2026-02-20T10:30:00.000Z"
    }
  ],
  "total": 150,
  "pages": 8
}
```

**Status Codes:**
- `200 OK` - Success
- `401 Unauthorized` - Invalid or missing admin token
- `403 Forbidden` - Insufficient permissions

---

### 2. Get Single Post

**Endpoint:** `GET /admin/posts/:postId`

**Description:** Get detailed information about a specific post. No visibility restrictions apply.

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| postId | string | Yes | Post ID |

**Response:**
```json
{
  "post": {
    "_id": "65f1a2b3c4d5e6f7g8h9i0j1",
    "content": "Post content here...",
    "author": {
      "_id": "65f1a2b3c4d5e6f7g8h9i0j2",
      "firstName": "Jane",
      "lastName": "Doe",
      "username": "janedoe",
      "profilePhoto": "https://..."
    },
    "visibility": "PUBLIC",
    "isPinned": false,
    "isDeleted": false,
    "metadata": {
      "hiddenBy": "65f1a2b3c4d5e6f7g8h9i0j3",
      "hiddenAt": "2026-02-21T14:20:00.000Z",
      "hideReason": "Violates community guidelines"
    },
    "likesCount": 45,
    "commentsCount": 12,
    "sharesCount": 3,
    "savesCount": 8,
    "createdAt": "2026-02-20T10:30:00.000Z",
    "updatedAt": "2026-02-21T14:20:00.000Z"
  }
}
```

**Status Codes:**
- `200 OK` - Success
- `400 Bad Request` - Invalid post ID format
- `401 Unauthorized` - Invalid or missing admin token
- `404 Not Found` - Post not found

---

### 3. Hide Post

**Endpoint:** `PATCH /admin/posts/:postId/hide`

**Description:** Hide a post from public view with a moderation reason. Sets `isDeleted: true` and stores metadata.

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| postId | string | Yes | Post ID |

**Request Body:**
```json
{
  "reason": "This post violates community guidelines regarding respectful communication"
}
```

**Validation:**
- `reason` is required
- Minimum length: 10 characters
- Maximum length: 500 characters

**Response:**
```json
{
  "message": "Post hidden successfully"
}
```

**Status Codes:**
- `200 OK` - Success
- `400 Bad Request` - Invalid reason or validation error
- `401 Unauthorized` - Invalid or missing admin token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Post not found

**Side Effects:**
- Post author receives notification
- Post becomes invisible to regular users
- Metadata stored: `hiddenBy`, `hiddenAt`, `hideReason`

---

### 4. Unhide Post

**Endpoint:** `PATCH /admin/posts/:postId/unhide`

**Description:** Restore a hidden post to public visibility.

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| postId | string | Yes | Post ID |

**Request Body:** None

**Response:**
```json
{
  "message": "Post unhidden successfully"
}
```

**Status Codes:**
- `200 OK` - Success
- `401 Unauthorized` - Invalid or missing admin token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Post not found

**Side Effects:**
- Post becomes visible again
- Metadata updated: `unhiddenBy`, `unhiddenAt`

---

### 5. Delete Post

**Endpoint:** `DELETE /admin/posts/:postId`

**Description:** Permanently delete a post with a reason. This is a soft delete that marks the post as deleted.

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| postId | string | Yes | Post ID |

**Request Body:**
```json
{
  "reason": "Spam content - repeated promotional posts"
}
```

**Validation:**
- `reason` is required
- Minimum length: 10 characters

**Response:**
```json
{
  "message": "Post deleted successfully",
  "deletedBy": "65f1a2b3c4d5e6f7g8h9i0j3",
  "deletedAt": "2026-02-23T08:15:00.000Z"
}
```

**Status Codes:**
- `200 OK` - Success
- `400 Bad Request` - Invalid reason or validation error
- `401 Unauthorized` - Invalid or missing admin token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Post not found

**Side Effects:**
- Post author receives notification
- Post marked as deleted (`isDeleted: true`)
- Metadata stored: `deletedBy`, `deletedAt`, `deleteReason`

---

### 6. Pin/Unpin Post

**Endpoint:** `POST /admin/posts/:postId/pin`

**Description:** Toggle pin status of a post. Pinned posts appear at the top of feeds.

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| postId | string | Yes | Post ID |

**Request Body:** None (empty object `{}`)

**Response:**
```json
{
  "pinned": true,
  "message": "Post pinned successfully"
}
```

**Status Codes:**
- `200 OK` - Success
- `400 Bad Request` - Invalid post ID format
- `401 Unauthorized` - Invalid or missing admin token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Post not found

**Behavior:**
- If post is unpinned → becomes pinned
- If post is pinned → becomes unpinned

---

### 7. Get Post Comments

**Endpoint:** `GET /admin/posts/:postId/comments`

**Description:** Get all comments for a post, including soft-deleted comments (admin view).

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| postId | string | Yes | Post ID |

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| page | integer | No | 1 | Page number |
| limit | integer | No | 20 | Items per page |

**Response:**
```json
{
  "comments": [
    {
      "_id": "65f1a2b3c4d5e6f7g8h9i0j4",
      "content": "Great post!",
      "author": {
        "_id": "65f1a2b3c4d5e6f7g8h9i0j5",
        "firstName": "John",
        "lastName": "Smith",
        "username": "johnsmith",
        "profilePhoto": "https://..."
      },
      "isDeleted": false,
      "repliesCount": 2,
      "createdAt": "2026-02-20T11:00:00.000Z"
    }
  ],
  "total": 12
}
```

**Status Codes:**
- `200 OK` - Success
- `400 Bad Request` - Invalid post ID format
- `401 Unauthorized` - Invalid or missing admin token
- `404 Not Found` - Post not found

---

### 8. Delete Comment

**Endpoint:** `DELETE /admin/comments/:commentId`

**Description:** Delete a comment (admin action). Soft deletes the comment and updates counts.

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| commentId | string | Yes | Comment ID |

**Request Body:** None

**Response:**
```json
{
  "message": "Comment deleted successfully",
  "deletedBy": "65f1a2b3c4d5e6f7g8h9i0j3",
  "deletedAt": "2026-02-23T08:20:00.000Z"
}
```

**Status Codes:**
- `200 OK` - Success
- `400 Bad Request` - Invalid comment ID format
- `401 Unauthorized` - Invalid or missing admin token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Comment not found

**Side Effects:**
- Comment author receives notification
- Post comment count decremented
- Parent comment reply count decremented (if reply)
- Comment marked as deleted (`isDeleted: true`)

---

### 9. Get Post Analytics

**Endpoint:** `GET /admin/posts/:postId/analytics`

**Description:** Get detailed analytics for a post. Admins can view analytics for any post.

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| postId | string | Yes | Post ID |

**Response:**
```json
{
  "data": {
    "discovery": {
      "impressions": 245,
      "membersReached": 180
    },
    "engagement": {
      "likes": 45,
      "comments": 12,
      "shares": 3,
      "saves": 8,
      "totalWatchTime": 540
    },
    "profileActivity": {
      "profileViewsFromPost": 12,
      "followersGained": 5
    },
    "viewerDemography": {
      "byLocation": [
        { "location": "Nigeria", "count": 85 },
        { "location": "Kenya", "count": 45 },
        { "location": "South Africa", "count": 30 }
      ],
      "byRole": [
        { "role": "MEMBER", "count": 120 },
        { "role": "CHAPTER_ADMIN", "count": 40 },
        { "role": "SUPER_ADMIN", "count": 20 }
      ]
    }
  }
}
```

**Status Codes:**
- `200 OK` - Success
- `400 Bad Request` - Invalid post ID format
- `401 Unauthorized` - Invalid or missing admin token
- `404 Not Found` - Post not found

---

## Request/Response Examples

### Example 1: Get Moderation Feed with Filters

**Request:**
```bash
GET /api/v1/admin/posts?page=1&limit=10&status=hidden&search=spam
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "posts": [
    {
      "_id": "65f1a2b3c4d5e6f7g8h9i0j1",
      "content": "Spam content here...",
      "author": {
        "_id": "65f1a2b3c4d5e6f7g8h9i0j2",
        "firstName": "Spammer",
        "lastName": "User",
        "username": "spammer123"
      },
      "isDeleted": true,
      "metadata": {
        "hiddenBy": "65f1a2b3c4d5e6f7g8h9i0j3",
        "hiddenAt": "2026-02-21T14:20:00.000Z",
        "hideReason": "Spam content"
      },
      "createdAt": "2026-02-20T10:30:00.000Z"
    }
  ],
  "total": 5,
  "pages": 1
}
```

---

### Example 2: Hide a Post

**Request:**
```bash
PATCH /api/v1/admin/posts/65f1a2b3c4d5e6f7g8h9i0j1/hide
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "reason": "This post contains inappropriate language and violates our community guidelines on respectful communication."
}
```

**Response:**
```json
{
  "message": "Post hidden successfully"
}
```

---

### Example 3: Delete Multiple Comments (Batch)

**Request 1:**
```bash
DELETE /api/v1/admin/comments/65f1a2b3c4d5e6f7g8h9i0j4
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request 2:**
```bash
DELETE /api/v1/admin/comments/65f1a2b3c4d5e6f7g8h9i0j5
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (each):**
```json
{
  "message": "Comment deleted successfully",
  "deletedBy": "65f1a2b3c4d5e6f7g8h9i0j3",
  "deletedAt": "2026-02-23T08:20:00.000Z"
}
```

---

### Example 4: Pin a Post

**Request:**
```bash
POST /api/v1/admin/posts/65f1a2b3c4d5e6f7g8h9i0j1/pin
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{}
```

**Response:**
```json
{
  "pinned": true,
  "message": "Post pinned successfully"
}
```

---

## Error Handling

### Standard Error Response Format

```json
{
  "error": "Error message here",
  "statusCode": 400,
  "isOperational": true
}
```

### Common Error Codes

| Status Code | Description | Common Causes |
|-------------|-------------|---------------|
| 400 | Bad Request | Invalid ID format, validation errors, missing required fields |
| 401 | Unauthorized | Missing token, invalid token, expired token |
| 403 | Forbidden | Insufficient permissions, inactive admin account |
| 404 | Not Found | Post/comment not found, deleted resource |
| 500 | Internal Server Error | Database errors, unexpected exceptions |

### Error Examples

**Invalid Post ID:**
```json
{
  "error": "Invalid post ID",
  "statusCode": 400,
  "isOperational": true
}
```

**Insufficient Permissions:**
```json
{
  "error": "Admin privileges required",
  "statusCode": 403,
  "isOperational": true
}
```

**Post Not Found:**
```json
{
  "error": "Post not found",
  "statusCode": 404,
  "isOperational": true
}
```

---

## Common Workflows

### Workflow 1: Moderate a Reported Post

1. **Get post details**
   ```
   GET /admin/posts/:postId
   ```

2. **Review post content and context**
   - Check author history
   - Review comments
   - Assess violation severity

3. **Take action:**
   - **Minor violation:** Hide post
     ```
     PATCH /admin/posts/:postId/hide
     Body: { "reason": "..." }
     ```
   
   - **Severe violation:** Delete post
     ```
     DELETE /admin/posts/:postId
     Body: { "reason": "..." }
     ```

4. **Verify action**
   ```
   GET /admin/posts?status=hidden
   ```

---

### Workflow 2: Clean Up Spam Comments

1. **Get post comments**
   ```
   GET /admin/posts/:postId/comments
   ```

2. **Identify spam comments**
   - Review comment content
   - Check for patterns

3. **Delete spam comments**
   ```
   DELETE /admin/comments/:commentId
   ```
   (Repeat for each spam comment)

4. **Verify cleanup**
   ```
   GET /admin/posts/:postId/comments
   ```

---

### Workflow 3: Feature Important Content

1. **Find high-quality post**
   ```
   GET /admin/posts?search=announcement
   ```

2. **Pin the post**
   ```
   POST /admin/posts/:postId/pin
   ```

3. **Verify pinned status**
   ```
   GET /admin/posts?status=pinned
   ```

4. **Later, unpin when no longer relevant**
   ```
   POST /admin/posts/:postId/pin
   ```

---

### Workflow 4: Review Post Performance

1. **Get post analytics**
   ```
   GET /admin/posts/:postId/analytics
   ```

2. **Analyze metrics:**
   - Discovery: Impressions, reach
   - Engagement: Likes, comments, shares
   - Demographics: Location, role distribution

3. **Make decisions:**
   - High engagement → Consider pinning
   - Low engagement → Review content strategy
   - Unusual patterns → Investigate for issues

---

## Best Practices

### 1. Moderation Reasons
- Always provide clear, specific reasons when hiding/deleting content
- Use professional, objective language
- Reference specific community guidelines violated
- Minimum 10 characters, but aim for 50-100 for clarity

### 2. Batch Operations
- When deleting multiple comments, process them individually
- Consider rate limiting for bulk operations
- Log all moderation actions for audit trail

### 3. Communication
- Notify users when their content is moderated
- Provide clear explanations
- Offer appeal process information

### 4. Analytics Review
- Regularly review post analytics to identify trends
- Use demographics to understand audience
- Monitor engagement patterns for quality assessment

### 5. Permission Checks
- Always verify admin role before sensitive operations
- Chapter Admins should only moderate their chapter
- Log all admin actions for accountability

---

## Rate Limiting

**Current Limits:**
- 100 requests per minute per admin
- 1000 requests per hour per admin

**Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1708675200
```

---

## Changelog

### Version 1.0.0 (February 23, 2026)
- Initial release of admin moderation endpoints
- Added 9 new endpoints for content moderation
- Implemented role-based access control
- Added comprehensive analytics support

---

## Support

For technical support or questions about the moderation API:
- Email: dev@wiftafrica.org
- Documentation: https://docs.wiftafrica.org/api/admin/moderation
- Issue Tracker: https://github.com/wiftafrica/backend/issues

---

**End of Documentation**
