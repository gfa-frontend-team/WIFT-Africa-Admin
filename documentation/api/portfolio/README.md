# Portfolio Module API

## Overview
The Portfolio module allows users to showcase their creative work. Users can add portfolio items including images, videos, and external links, managing their visibility to the public or connections only.

## Base URL
`/api/v1/portfolios`

## Authentication
- **Required**: Yes (all endpoints).
- **Type**: Bearer Token (JWT).
- **Header**: `Authorization: Bearer <access_token>`

---

## 1. Portfolio Management

### 1.1 Add Portfolio Item
**Method:** `POST`
**Path:** `/api/v1/portfolios`
**Description:** Add a new item to your portfolio.

#### Body (JSON)
```typescript
{
  title: string;          // Required
  year: number;           // Required (e.g., 2024)
  role: string;           // Required (e.g., "Director")
  mediaType: 'IMAGE' | 'VIDEO' | 'EXTERNAL'; // Required
  mediaUrl: string;       // Required
  description?: string;
  thumbnailUrl?: string;
  visibility?: 'PUBLIC' | 'CONNECTIONS';
}
```

#### Response (201 Created)
```typescript
{
  message: "Portfolio item added successfully";
  portfolio: PortfolioItem;
}
```

### 1.2 List User Portfolio
**Method:** `GET`
**Path:** `/api/v1/portfolios/:userId`
**Description:** Get all portfolio items for a specific user.

#### Response (200 OK)
```typescript
{
  items: Array<PortfolioItem>;
  count: number;
}
```

### 1.3 Update Portfolio Item
**Method:** `PUT`
**Path:** `/api/v1/portfolios/:portfolioId`
**Description:** Update an existing portfolio item.

#### Body (JSON)
```typescript
{
  title?: string;
  description?: string;
  year?: number;
  role?: string;
  mediaType?: 'IMAGE' | 'VIDEO' | 'EXTERNAL';
  mediaUrl?: string;
  thumbnailUrl?: string;
  visibility?: 'PUBLIC' | 'CONNECTIONS';
}
```

#### Response (200 OK)
```typescript
{
  message: "Portfolio updated";
  portfolio: PortfolioItem;
}
```

### 1.4 Delete Portfolio Item
**Method:** `DELETE`
**Path:** `/api/v1/portfolios/:portfolioId`
**Description:** Remove an item from your portfolio.

#### Response (204 No Content)
```typescript
{
  message: "Deleted successfully";
}
```
