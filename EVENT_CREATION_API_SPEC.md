# Event Creation API Specification

## Endpoint

**POST** `/api/v1/admin/events`

**Authentication:** Required (Bearer Token)

**Authorization:** Chapter Admin or Super Admin only

---

## Request Body

### Required Fields

```typescript
{
  title: string;              // Max 200 characters
  description: string;        // Max 5000 characters
  type: EventType;           // Enum value
  startDate: string;         // ISO 8601 datetime
  endDate: string;           // ISO 8601 datetime
  timezone: string;          // IANA timezone
  location: LocationObject;  // See below
}
```

### Optional Fields

```typescript
{
  chapterId?: string;        // ObjectId (required for Chapter Admins)
  capacity?: number;         // Min: 1
  coverImage?: string;       // URL or path
  tags?: string[];          // Array of strings
}
```

---

## Field Specifications

### `title` (required)
- **Type:** string
- **Min Length:** 1
- **Max Length:** 200
- **Example:** `"Film Industry Networking Mixer"`

### `description` (required)
- **Type:** string
- **Min Length:** 1
- **Max Length:** 5000
- **Example:** `"Join us for an evening of networking with industry professionals. This event will feature panel discussions, networking sessions, and refreshments."`

### `type` (required)
- **Type:** enum
- **Values:**
  - `WORKSHOP`
  - `SCREENING`
  - `NETWORKING`
  - `MEETUP`
  - `CONFERENCE`
  - `OTHER`
- **Example:** `"NETWORKING"`

### `chapterId` (conditional)
- **Type:** string (MongoDB ObjectId)
- **Required for:** Chapter Admins (must be their own chapter)
- **Optional for:** Super Admins (can create global or chapter-specific events)
- **Validation:**
  - Chapter Admins MUST provide their own chapterId
  - Chapter Admins CANNOT create events for other chapters
  - Super Admins can omit (global event) or specify any chapter
- **Example:** `"507f1f77bcf86cd799439011"`
- **Note:** Empty string `""` is transformed to `undefined`

### `startDate` (required)
- **Type:** string (ISO 8601 datetime)
- **Format:** `YYYY-MM-DDTHH:mm:ssZ` or `YYYY-MM-DDTHH:mm:ss±HH:mm`
- **Validation:** Must be before `endDate`
- **Example:** `"2024-02-15T18:00:00Z"` or `"2024-02-15T18:00:00+01:00"`

### `endDate` (required)
- **Type:** string (ISO 8601 datetime)
- **Format:** `YYYY-MM-DDTHH:mm:ssZ` or `YYYY-MM-DDTHH:mm:ss±HH:mm`
- **Validation:** Must be after `startDate`
- **Example:** `"2024-02-15T21:00:00Z"`

### `timezone` (required)
- **Type:** string (IANA timezone identifier)
- **Examples:**
  - `"Africa/Lagos"`
  - `"Africa/Nairobi"`
  - `"Africa/Johannesburg"`
  - `"America/New_York"`
  - `"Europe/London"`
- **Reference:** [IANA Time Zone Database](https://www.iana.org/time-zones)

### `location` (required)
- **Type:** object
- **Structure:**

```typescript
{
  type: 'PHYSICAL' | 'VIRTUAL' | 'HYBRID';  // Required
  address?: string;                          // Optional
  city?: string;                            // Optional
  country?: string;                         // Optional
  virtualUrl?: string;                      // Optional (must be valid URL)
}
```

**Examples:**

**Physical Event:**
```json
{
  "type": "PHYSICAL",
  "address": "123 Victoria Island",
  "city": "Lagos",
  "country": "Nigeria"
}
```

**Virtual Event:**
```json
{
  "type": "VIRTUAL",
  "virtualUrl": "https://zoom.us/j/123456789"
}
```

**Hybrid Event:**
```json
{
  "type": "HYBRID",
  "address": "456 Westlands Road",
  "city": "Nairobi",
  "country": "Kenya",
  "virtualUrl": "https://meet.google.com/abc-defg-hij"
}
```

### `capacity` (optional)
- **Type:** number (integer)
- **Min Value:** 1
- **Purpose:** Maximum number of attendees
- **Example:** `50`
- **Note:** If omitted, event has unlimited capacity

### `coverImage` (optional)
- **Type:** string (URL or file path)
- **Examples:**
  - `"/uploads/events/event-123.jpg"`
  - `"https://cdn.example.com/images/event-cover.png"`
- **Recommended:** Upload image first, then use returned URL

### `tags` (optional)
- **Type:** array of strings
- **Purpose:** Categorization and search
- **Example:** `["networking", "filmmaking", "industry", "professionals"]`

---

## Complete Request Example

### Chapter Admin Creating Event

```json
{
  "title": "Film Industry Networking Mixer",
  "description": "Join us for an evening of networking with industry professionals. This event will feature panel discussions, networking sessions, and refreshments. Perfect for filmmakers, producers, and industry enthusiasts looking to expand their network.",
  "type": "NETWORKING",
  "chapterId": "507f1f77bcf86cd799439011",
  "startDate": "2024-02-15T18:00:00Z",
  "endDate": "2024-02-15T21:00:00Z",
  "timezone": "Africa/Lagos",
  "location": {
    "type": "PHYSICAL",
    "address": "123 Victoria Island",
    "city": "Lagos",
    "country": "Nigeria"
  },
  "capacity": 50,
  "coverImage": "/uploads/events/networking-mixer-2024.jpg",
  "tags": ["networking", "filmmaking", "industry"]
}
```

### Super Admin Creating Global Event

```json
{
  "title": "WIFT Africa Annual Conference 2024",
  "description": "Join women in film and television from across Africa for our annual conference featuring keynote speakers, workshops, and networking opportunities.",
  "type": "CONFERENCE",
  "startDate": "2024-06-10T09:00:00Z",
  "endDate": "2024-06-12T17:00:00Z",
  "timezone": "Africa/Johannesburg",
  "location": {
    "type": "HYBRID",
    "address": "Sandton Convention Centre",
    "city": "Johannesburg",
    "country": "South Africa",
    "virtualUrl": "https://zoom.us/j/wiftafrica2024"
  },
  "capacity": 500,
  "coverImage": "/uploads/events/conference-2024.jpg",
  "tags": ["conference", "annual", "networking", "workshops"]
}
```

### Virtual Workshop Example

```json
{
  "title": "Screenwriting Masterclass",
  "description": "Learn the fundamentals of screenwriting from award-winning screenwriter Jane Doe. This 3-hour intensive workshop covers story structure, character development, and dialogue.",
  "type": "WORKSHOP",
  "chapterId": "507f1f77bcf86cd799439012",
  "startDate": "2024-03-20T14:00:00Z",
  "endDate": "2024-03-20T17:00:00Z",
  "timezone": "Africa/Nairobi",
  "location": {
    "type": "VIRTUAL",
    "virtualUrl": "https://meet.google.com/screenwriting-workshop"
  },
  "capacity": 30,
  "coverImage": "/uploads/events/screenwriting-workshop.jpg",
  "tags": ["workshop", "screenwriting", "education"]
}
```

---

## Response

### Success Response (201 Created)

```json
{
  "message": "Event created successfully",
  "event": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "title": "Film Industry Networking Mixer",
    "description": "Join us for an evening of networking...",
    "type": "NETWORKING",
    "chapterId": "507f1f77bcf86cd799439011",
    "organizer": "60d5ec49f1b2c72b8c8e4f1a",
    "startDate": "2024-02-15T18:00:00.000Z",
    "endDate": "2024-02-15T21:00:00.000Z",
    "timezone": "Africa/Lagos",
    "location": {
      "type": "PHYSICAL",
      "address": "123 Victoria Island",
      "city": "Lagos",
      "country": "Nigeria"
    },
    "capacity": 50,
    "currentAttendees": 0,
    "coverImage": "/uploads/events/networking-mixer-2024.jpg",
    "tags": ["networking", "filmmaking", "industry"],
    "status": "PUBLISHED",
    "isPublished": true,
    "isCancelled": false,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Error Responses

#### 400 Bad Request - Validation Error
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "endDate",
      "message": "End date must be after start date"
    }
  ]
}
```

#### 400 Bad Request - Missing Chapter ID
```json
{
  "error": "Chapter ID is required for Chapter Admins"
}
```

#### 401 Unauthorized
```json
{
  "error": "Unauthorized"
}
```

#### 403 Forbidden - Not Admin
```json
{
  "error": "Admin privileges required"
}
```

#### 403 Forbidden - Wrong Chapter
```json
{
  "error": "Cannot create event for another chapter"
}
```

---

## Validation Rules

### Business Logic

1. **Chapter Admin Restrictions:**
   - MUST provide `chapterId`
   - `chapterId` MUST match their own chapter
   - CANNOT create events for other chapters
   - CANNOT create global events (no chapterId)

2. **Super Admin Permissions:**
   - CAN create global events (omit `chapterId`)
   - CAN create chapter-specific events (provide any `chapterId`)
   - NO restrictions on chapter selection

3. **Date Validation:**
   - `endDate` MUST be after `startDate`
   - Both dates are converted to Date objects on backend

4. **Location Validation:**
   - `location.type` is REQUIRED
   - `virtualUrl` must be valid URL format if provided
   - For VIRTUAL events, `virtualUrl` is recommended
   - For PHYSICAL events, address fields are recommended
   - For HYBRID events, both physical and virtual info recommended

5. **Capacity:**
   - If provided, must be >= 1
   - If omitted, event has unlimited capacity

### Field Validation

| Field | Required | Min | Max | Format |
|-------|----------|-----|-----|--------|
| title | ✅ | 1 | 200 | string |
| description | ✅ | 1 | 5000 | string |
| type | ✅ | - | - | enum |
| chapterId | Conditional | - | - | ObjectId |
| startDate | ✅ | - | - | ISO 8601 |
| endDate | ✅ | - | - | ISO 8601 |
| timezone | ✅ | - | - | IANA |
| location.type | ✅ | - | - | enum |
| location.virtualUrl | ❌ | - | - | URL |
| capacity | ❌ | 1 | - | number |

---

## Frontend Implementation Guide

### Form Fields

```typescript
interface EventFormData {
  title: string;
  description: string;
  type: 'WORKSHOP' | 'SCREENING' | 'NETWORKING' | 'MEETUP' | 'CONFERENCE' | 'OTHER';
  chapterId?: string;
  startDate: string;  // ISO 8601
  endDate: string;    // ISO 8601
  timezone: string;
  location: {
    type: 'PHYSICAL' | 'VIRTUAL' | 'HYBRID';
    address?: string;
    city?: string;
    country?: string;
    virtualUrl?: string;
  };
  capacity?: number;
  coverImage?: string;
  tags?: string[];
}
```

### Conditional Logic

```typescript
// Show chapterId field based on user role
if (userRole === 'CHAPTER_ADMIN') {
  // Pre-fill with user's chapter (read-only)
  formData.chapterId = userChapterId;
  // Make field required
} else if (userRole === 'SUPER_ADMIN') {
  // Show chapter dropdown (optional)
  // Allow "Global Event" option (no chapter)
}

// Show location fields based on type
if (locationType === 'PHYSICAL') {
  // Show: address, city, country
  // Hide: virtualUrl
} else if (locationType === 'VIRTUAL') {
  // Show: virtualUrl
  // Hide: address, city, country
} else if (locationType === 'HYBRID') {
  // Show: all fields
}
```

### Date Handling

```typescript
// Convert local datetime to ISO 8601
const startDate = new Date(localStartDate).toISOString();
const endDate = new Date(localEndDate).toISOString();

// Validate end date is after start date
if (new Date(endDate) <= new Date(startDate)) {
  showError('End date must be after start date');
}
```

### Example API Call

```typescript
async function createEvent(formData: EventFormData) {
  try {
    const response = await fetch('/api/v1/admin/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(formData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create event');
    }

    const data = await response.json();
    return data.event;
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
}
```

---

## Testing Checklist

- [ ] Chapter Admin can create event for their chapter
- [ ] Chapter Admin cannot create event for another chapter
- [ ] Chapter Admin cannot create global event
- [ ] Super Admin can create global event
- [ ] Super Admin can create chapter-specific event
- [ ] End date validation works
- [ ] Physical location fields work
- [ ] Virtual location with URL works
- [ ] Hybrid location with both works
- [ ] Capacity validation (min 1)
- [ ] Empty string chapterId converts to undefined
- [ ] Tags array is optional
- [ ] Cover image is optional
- [ ] Timezone is required and validated

---

## Notes

1. **Event Status:** All created events are automatically set to `PUBLISHED` status
2. **Organizer:** Automatically set to the authenticated user's ID
3. **Current Attendees:** Starts at 0
4. **Timestamps:** `createdAt` and `updatedAt` are automatically managed
5. **Empty String Handling:** Empty string `""` for `chapterId` is transformed to `undefined`
