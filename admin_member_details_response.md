# Admin Member Details Response

**Endpoint**: `GET /api/v1/admin/members/:userId`
**Access**: Authenticated Admins (with RBAC checks)

## Response Structure

When an admin fetches member details, the response contains two main sections: `user` and `profile`.

### Success Response (200 OK)

```json
{
  "user": {
    "id": "65abc123...",
    "email": "member@example.com",
    "firstName": "Jane",
    "lastName": "Doe",
    "username": "janedoe",
    "profilePhoto": "https://...",
    "emailVerified": true,
    "accountType": "CHAPTER_MEMBER",
    "membershipStatus": "APPROVED",
    "suspensionReason": null,
    "onboardingComplete": true,
    "chapter": {
      "_id": "65xyz...",
      "name": "Lagos Chapter",
      "code": "NG-LAG",
      "country": "Nigeria"
    },
    "memberType": "NEW",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "lastLoginAt": "2024-02-12T08:15:00.000Z",
    "cvFileUrl": "https://storage.../cv.pdf",
    "cvFileName": "jane_doe_cv.pdf"
  },
  "profile": {
    "roles": ["Director", "Producer"],
    "primaryRole": "Director",
    "isMultihyphenate": true,
    "writerSpecialization": null,
    "crewSpecializations": [],
    "businessSpecializations": ["Distribution"],
    "bannerUrl": "https://...",
    "headline": "Award-winning filmmaker",
    "bio": "Passionate about storytelling...",
    "location": "Lagos, Nigeria",
    "skills": ["Cinematography", "Editing"],
    "availabilityStatus": "Available",
    "website": "https://janedoe.com",
    "imdbUrl": "https://imdb.com/name/...",
    "linkedinUrl": "https://linkedin.com/in/janedoe",
    "instagramHandle": "@janedoe",
    "twitterHandle": "@janedoe",
    "portfolioLinks": ["https://vimeo.com/..."]
  }
}
```

### Field Descriptions

#### User Object
| Field | Type | Description |
|:---|:---|:---|
| [id](file:///Users/khalidsalman-yusuf/Documents/Unleashified/Active/WIFT-Africa-Backend/src/modules/admin/admin.controller.ts#299-317) | String | User's unique identifier |
| `email` | String | User's email address |
| `firstName` | String | First name |
| `lastName` | String | Last name |
| `username` | String | Unique username (optional) |
| `profilePhoto` | String | URL to profile photo |
| `emailVerified` | Boolean | Email verification status |
| `accountType` | Enum | `CHAPTER_MEMBER`, `HQ_MEMBER`, etc. |
| `membershipStatus` | Enum | `PENDING`, `APPROVED`, `REJECTED`, `SUSPENDED` |
| `suspensionReason` | String/null | Reason if suspended |
| `onboardingComplete` | Boolean | Onboarding completion status |
| `chapter` | Object | Populated chapter details |
| `memberType` | Enum | `NEW` or `EXISTING` |
| `createdAt` | Date | Account creation timestamp |
| `lastLoginAt` | Date | Last login timestamp |
| `cvFileUrl` | String | URL to uploaded CV/resume |
| `cvFileName` | String | Original CV filename |

#### Profile Object
Returns `null` if no profile exists. Otherwise contains:

| Field | Type | Description |
|:---|:---|:---|
| `roles` | Array<String> | All roles the member has |
| `primaryRole` | String | Main professional role |
| `isMultihyphenate` | Boolean | Has multiple roles |
| `writerSpecialization` | String | If writer, their specialization |
| `crewSpecializations` | Array<String> | Crew-specific skills |
| `businessSpecializations` | Array<String> | Business-related skills |
| `bannerUrl` | String | Profile banner image |
| `headline` | String | Professional headline |
| `bio` | String | Biography/about section |
| `location` | String | Current location |
| `skills` | Array<String> | Professional skills |
| `availabilityStatus` | String | Current availability |
| `website` | String | Personal website |
| `imdbUrl` | String | IMDb profile link |
| `linkedinUrl` | String | LinkedIn profile |
| `instagramHandle` | String | Instagram handle |
| `twitterHandle` | String | Twitter handle |
| `portfolioLinks` | Array<String> | Portfolio/work samples |

### RBAC Notes
- **Chapter Admins**: Can only view members from their assigned chapter
- **Super Admins**: Can view any member
- **HQ Staff**: Can view any member
