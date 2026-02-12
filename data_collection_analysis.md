# Data Collection Analysis: Grants & Funds and Mentorship

## 1. Grants & Funds (Funding Opportunities)

**Endpoint**: `POST /api/v1/funding-opportunities`
**Access**: Authenticated Users

### Data Collected (Request Body)
| Field | Type | Required | Description/Notes |
| :--- | :--- | :--- | :--- |
| `name` | String | Yes | Name of the grant or fund. |
| `role` | String | Yes | Target role (e.g., "Director", "Producer"). |
| `fundingType` | Enum | Yes | Values: `Grant`, [Fund](file:///Users/khalidsalman-yusuf/Documents/Unleashified/Active/WIFT-Africa-Backend/src/models/FundingOpportunity.ts#18-34). |
| `description` | String | Yes | Detailed description of the opportunity. |
| `deadline` | Date | Yes | Application deadline. |
| `region` | String | Yes | Target region (e.g., "Africa", "Global"). |
| `applicationType` | Enum | Yes | Values: `Redirect` (external), `Internal` (platform). |
| `applicationLink` | String | No | URL for external applications (if `Redirect`). |
| `notes` | String | No | Additional internal notes or info. |
| `chapterId` | ObjectId | No | If specific to a chapter. Defaults to `null`. |

### System-Generated Data
- **`createdBy`**: User ID of the creator (from auth token).
- **`status`**: Defaults to `Open`. (Enum: `Open`, `Closed`).
- **`createdAt` / `updatedAt`**: Automatic timestamps.

### Response Structure (Success - 201 Created)
```json
{
  "message": "Funding opportunity created",
  "data": {
    "_id": "65c...",
    "name": "Film Grant 2024",
    "role": "Director",
    "fundingType": "Grant",
    "description": "...",
    "deadline": "2024-12-31T00:00:00.000Z",
    "region": "West Africa",
    "applicationType": "Redirect",
    "applicationLink": "https://example.com/apply",
    "createdBy": "65a...",
    "status": "Open",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

---

## 2. Mentorship Programs

**Endpoint**: `POST /api/v1/mentorships`
**Access**: Authenticated Users (Mentors)

### Data Collected (Request Body)
| Field | Type | Required | Description/Notes |
| :--- | :--- | :--- | :--- |
| `mentorName` | String | Yes | Name of the mentor. |
| `mentorRole` | String | Yes | Professional role (e.g., "Senior Editor"). |
| `areasOfExpertise` | Array<String> | Yes | List of expertise (e.g., `["Editing", "Sound"]`). |
| `mentorshipFormat` | Enum | Yes | Values: `Virtual`, `Physical`, `Hybrid`. |
| `mentorshipLink` | String | No | Meeting link `http(s)://...` (if Virtual/Hybrid). |
| `startPeriod` | Date | Yes | Start date of the mentorship program. |
| `endPeriod` | Date | Yes | End date (must be after start). |
| `days` | Array<Enum> | Yes | Available days. Values: `Monday`, `Tuesday`, etc. |
| `timeFrame` | String | Yes | Time description (e.g., "2-4 PM GMT"). |
| `description` | String | Yes | Program details. |
| `eligibility` | String | No | Requirements for applicants. |
| `chapterId` | ObjectId | No | If specific to a chapter. Defaults to `null`. |

### System-Generated Data
- **`createdBy`**: User ID of the creator (from auth token).
- **`status`**: Defaults to `Open`. (Enum: `Open`, `Closed`).
- **`viewCount`**: Defaults to 0.
- **`createdAt` / `updatedAt`**: Automatic timestamps.

### Response Structure (Success - 201 Created)
```json
{
  "message": "Mentorship created successfully",
  "data": {
    "_id": "65d...",
    "mentorName": "Jane Doe",
    "mentorRole": "Cinematographer",
    "areasOfExpertise": ["Lighting", "Camera"],
    "mentorshipFormat": "Virtual",
    "startPeriod": "...",
    "endPeriod": "...",
    "days": ["Monday", "Wednesday"],
    "timeFrame": "10am - 12pm",
    "description": "...",
    "status": "Open",
    ...
  }
}
```

---

## 3. Mentorship Applications (Applying for a Mentorship)

**Endpoint**: `POST /api/v1/mentorships/:mentorshipId/apply`
**Access**: Authenticated Users (Mentees)

### Data Collected (Request Body)
| Field | Type | Required | Description/Notes |
| :--- | :--- | :--- | :--- |
| `message` | String | Yes | Applicant's message/pitch (Max 1000 chars). |

### System-Generated Data
- **`mentorshipId`**: From URL parameter.
- **`applicantId`**: User ID of the applicant (from auth token).
- **`status`**: Defaults to `Pending`. (Enum: `Pending`, `Accepted`, `Rejected`, `Withdrawn`).
- **`createdAt` / `updatedAt`**: Automatic timestamps.

### Response Structure (Success - 201 Created)
```json
{
  "message": "Application submitted successfully",
  "data": {
    "_id": "65e...",
    "mentorshipId": "65d...",
    "applicantId": "65a...",
    "message": "I am interested because...",
    "status": "Pending",
    "createdAt": "..."
  }
}
```
