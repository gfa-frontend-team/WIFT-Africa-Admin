# Admin Refresh Token Implementation Guide

This guide details the changes made to the backend to support refresh tokens for administrators and provides instructions for updating the frontend admin application.

## 1. Backend Implementation Summary

We have successfully implemented a polymorphic refresh token system that safeguards admin sessions.

### Key Changes
1.  **Database Model ([RefreshToken](file:///Users/khalidsalman-yusuf/Documents/Unleashified/Active/WIFT-Africa-Backend/src/models/RefreshToken.ts#3-10))**:
    - Added `userType` field (Default: `'User'`).
    - Updated `userId` to support dynamic references to either `User` or [Administrator](file:///Users/khalidsalman-yusuf/Documents/Unleashified/Active/WIFT-Africa-Backend/src/models/Administrator.ts#10-23) models.
2.  **Auth Service ([AuthService](file:///Users/khalidsalman-yusuf/Documents/Unleashified/Active/WIFT-Africa-Backend/src/modules/auth/auth.service.ts#42-469))**:
    - **Admin Login**: Now generates a refresh token, stores it with `userType: 'Administrator'`, and returns it in the response.
    - **Token Refresh**: Updated logic to check `userType` and validate against the correct collection (`User` vs [Administrator](file:///Users/khalidsalman-yusuf/Documents/Unleashified/Active/WIFT-Africa-Backend/src/models/Administrator.ts#10-23)).
3.  **Controllers**:
    - Updated [adminLogin](file:///Users/khalidsalman-yusuf/Documents/Unleashified/Active/WIFT-Africa-Backend/src/modules/auth/auth.service.ts#420-468) response to return the full `tokens` object `{ accessToken, refreshToken }`.

### Verification
A script [src/scripts/verifyAdminRefresh.ts](file:///Users/khalidsalman-yusuf/Documents/Unleashified/Active/WIFT-Africa-Backend/src/scripts/verifyAdminRefresh.ts) was created and run successfully. It confirmed:
- Admin login returns both tokens.
- Refresh token is stored correctly in MongoDB.
- Using the refresh token successfully issues a new access token.

## 2. Frontend Integration Guide (For Admin Dashboard)

To utilize this new feature, the Admin Frontend codebase needs to be updated.

### A. Login Response Handling
The `POST /api/v1/auth/admin/login` endpoint now returns:
```json
{
  "message": "Admin login successful",
  "admin": { ... },
  "tokens": {
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```
**Action:** Update your login logic to store the [refreshToken](file:///Users/khalidsalman-yusuf/Documents/Unleashified/Active/WIFT-Africa-Backend/src/modules/auth/auth.service.ts#176-228) (e.g., in `localStorage` or `cookies`) alongside the `accessToken`.

### B. Axios Interceptor / Token Refresh Logic
You likely already have an interceptor for handling 401 errors. It needs to optionally handle the admin refresh flow.

**Example Implementation:**

```typescript
// api.ts or axios setup

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // specific check for 401 and that we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('adminRefreshToken'); // Adjust storage key
        if (!refreshToken) throw new Error('No refresh token');

        // Call the EXISTING refresh endpoint (it handles both user types now!)
        const { data } = await axios.post('/api/v1/auth/refresh-token', {
          refreshToken,
        });

        // Store new tokens
        localStorage.setItem('adminAccessToken', data.tokens.accessToken);
        localStorage.setItem('adminRefreshToken', data.tokens.refreshToken);

        // Update header and retry
        originalRequest.headers.Authorization = `Bearer ${data.tokens.accessToken}`;
        return axiosInstance(originalRequest);

      } catch (refreshError) {
        // Logout if refresh fails
        localStorage.clear();
        window.location.href = '/admin/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);
```

### C. Logout
Update the logout action to send the refresh token to the server so it can be invalidated.
- **Endpoint**: `POST /api/v1/auth/logout`
- **Body**: `{ "refreshToken": "..." }`

---
**Note**: The backend endpoint for refreshing tokens (`POST /api/v1/auth/refresh-token`) remains the SAME. It automatically detects if the token belongs to an admin or a user.
