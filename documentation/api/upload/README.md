# Upload Module API

## Overview
The Upload module handles file storage operations, including direct file uploads for images/documents and generating SAS tokens for large video uploads to cloud storage (e.g., Azure Blob Storage or AWS S3).

## Base URL
`/api/v1/uploads`

## Authentication
- **Required**: Yes (all endpoints).
- **Type**: Bearer Token (JWT).
- **Header**: `Authorization: Bearer <access_token>`

---

## 1. File Upload

### 1.1 Upload Single File
**Method:** `POST`
**Path:** `/api/v1/uploads`
**Description:** Upload an image or document file (e.g., for posts, profiles, or CVs).

#### Request (Multipart/Form-Data)
- `file`: File binary (Required)
- `type`: 'post' | 'profile' | 'cv' (Optional, defaults to 'post')

#### Response (201 Created)
```typescript
{
  url: string;         // Public URL of the uploaded file
  type: 'image' | 'document';
  originalName: string;
}
```

---

## 2. Video Upload

### 2.1 Get Video SAS Token
**Method:** `POST`
**Path:** `/api/v1/uploads/video/sign`
**Description:** Generate a Shared Access Signature (SAS) token to allow the frontend to upload large video files directly to cloud storage.

#### Body
```typescript
{
  fileName: string; // Required
}
```

#### Response (200 OK)
```typescript
{
  url: string;        // Storage URL including SAS token
  blobName: string;   // Unique name assigned to the blob
  expiresOn: string;  // Expiration timestamp
}
```
