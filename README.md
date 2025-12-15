# WIFT Africa - Admin Dashboard

Admin dashboard for managing WIFT Africa chapters, membership requests, and platform administration.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **State Management:** Zustand
- **API Client:** Axios
- **Icons:** Lucide React
- **Validation:** Zod

## Project Structure

```
app/
├── (auth)/            # Auth pages (login)
├── (dashboard)/       # Protected dashboard pages
│   ├── chapters/      # Chapter management
│   ├── requests/      # Membership requests
│   ├── members/       # Member management
│   └── settings/      # Admin settings
└── layout.tsx         # Root layout

lib/
├── api/               # API client and endpoints
│   ├── client.ts      # Axios client with interceptors
│   ├── auth.ts        # Auth API calls
│   ├── chapters.ts    # Chapter API calls
│   └── membership.ts  # Membership API calls
├── stores/            # Zustand stores
│   ├── authStore.ts   # Auth state
│   ├── chapterStore.ts # Chapter state
│   └── membershipStore.ts # Membership state
├── utils.ts           # Utility functions
└── env.ts             # Environment variables

types/
└── index.ts           # TypeScript type definitions
```

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Copy `.env.example` to `.env.local` and update the values:

```bash
cp .env.example .env.local
```

Required environment variables:
- `NEXT_PUBLIC_API_URL` - Backend API URL (default: http://localhost:5000/api/v1)
- `NEXT_PUBLIC_API_VERSION` - API version (default: v1)
- `NEXT_PUBLIC_APP_NAME` - App name (default: WIFT Africa Admin)
- `NEXT_PUBLIC_APP_URL` - App URL (default: http://localhost:3002)

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3002](http://localhost:3002) (or the port specified in your config)

### 4. Build for Production

```bash
npm run build
npm start
```

## Backend Integration

This admin dashboard connects to the WIFT Africa backend API:
- **Backend Repo:** `wift-africa-backend`
- **API Base URL:** `http://localhost:5000/api/v1`
- **Documentation:** See backend Swagger docs at `http://localhost:5000/api-docs`

### API Client Features

- **Automatic Token Management:** Access and refresh tokens stored in localStorage
- **Request Interceptors:** Automatically adds auth token to requests
- **Response Interceptors:** Handles 401 errors and token refresh
- **Error Handling:** Consistent error handling across all API calls
- **TypeScript Support:** Fully typed API responses

### Authentication Flow

1. User logs in with email/password
2. Backend returns access token (15min) and refresh token (7 days)
3. Tokens stored in localStorage
4. Access token added to all API requests via Authorization header
5. On 401 error, automatically attempts to refresh token
6. If refresh fails, user is logged out and redirected to login

## State Management

Using Zustand for global state management:

### Auth Store (`useAuthStore`)
- User authentication state
- Login/logout actions
- Token management

### Chapter Store (`useChapterStore`)
- Chapter list and details
- CRUD operations for chapters
- Chapter admin management

### Membership Store (`useMembershipStore`)
- Membership requests
- Approve/reject actions
- Request filtering

## Key Features

### For Chapter Admins
- View pending membership requests
- Approve/reject members with notes
- View chapter member list
- Chapter statistics

### For Super Admins
- All chapter admin features +
- Create/edit/delete chapters
- Assign/remove chapter admins
- Platform-wide analytics
- User management

## Development Guidelines

### Adding New API Endpoints

1. Add types to `types/index.ts`
2. Create API functions in `lib/api/[module].ts`
3. Update store in `lib/stores/[module]Store.ts`
4. Use in components

Example:
```typescript
// types/index.ts
export interface NewFeature {
  id: string
  name: string
}

// lib/api/features.ts
export const featuresApi = {
  getFeatures: async () => {
    const response = await apiClient.get<NewFeature[]>('/features')
    return response.data
  }
}

// lib/stores/featureStore.ts
export const useFeatureStore = create<FeatureState>((set) => ({
  features: [],
  fetchFeatures: async () => {
    const features = await featuresApi.getFeatures()
    set({ features })
  }
}))

// In component
const { features, fetchFeatures } = useFeatureStore()
```

### Error Handling

All API calls should handle errors:

```typescript
try {
  await someApiCall()
} catch (error: any) {
  // Error is automatically handled by API client
  // Display error message to user
  toast.error(error.message)
}
```

## Deployment

- **Platform:** Vercel (recommended)
- **Domain:** admin.wiftafrica.org
- **Environment:** Production

### Environment Variables for Production

Set these in your deployment platform:
- `NEXT_PUBLIC_API_URL` - Production API URL
- `NEXT_PUBLIC_APP_URL` - Production app URL

## License

Private - WIFT Africa
