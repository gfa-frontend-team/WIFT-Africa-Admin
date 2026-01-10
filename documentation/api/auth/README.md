# Auth Module API

## Overview
The Auth module handles user registration, authentication (including Google OAuth), session management via JWTs (Access & Refresh tokens), and account security features like password reset and email verification.

## Base URL
`/api/v1/auth`

## Authentication
Most endpoints in this module are public.
Endpoints requiring authentication are marked below.
- **Type:** Bearer Token (JWT)
- **Header:** `Authorization: Bearer <access_token>`

---

## Endpoints

### 1. Register User
**Method:** `POST`
**Path:** `/api/v1/auth/register`
**Description:** Creates a new user account and sends a verification email.

#### Authentication
- Required: No

#### Request

##### Headers
- `Content-Type`: `application/json`

##### Body
```typescript
{
  email: string;      // Valid email, required
  password: string;   // Min 8 chars, required
  firstName: string;  // Min 2 chars, max 50, required
  lastName: string;   // Min 2 chars, max 50, required
}
```

#### Response

##### Success (201 Created)
```typescript
{
  message: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}
```

##### Errors
- `400`: Validation error (e.g. password too short, invalid email)
- `409`: Email already registered

#### Example
```bash
curl -X POST https://api.example.com/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jane@example.com",
    "password": "SecurePassword123!",
    "firstName": "Jane",
    "lastName": "Doe"
  }'
```

---

### 2. Login
**Method:** `POST`
**Path:** `/api/v1/auth/login`
**Description:** Authenticates a user using email and password. Returns access and refresh tokens. Requires email to be verified.

#### Authentication
- Required: No

#### Request

##### Headers
- `Content-Type`: `application/json`

##### Body
```typescript
{
  email: string;      // Required
  password: string;   // Required
}
```

#### Response

##### Success (200 OK)
```typescript
{
  message: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    emailVerified: boolean;
    onboardingComplete: boolean;
    onboardingStep: number;
    // ...other user fields
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}
```

##### Errors
- `400`: Validation error
- `401`: Invalid email or password
- `403`: Email not verified

---

### 3. Google Social Login
**Method:** `POST`
**Path:** `/api/v1/auth/google`
**Description:** Authenticates or registers a user using a Google ID token.

#### Authentication
- Required: No

#### Request

##### Headers
- `Content-Type`: `application/json`

##### Body
```typescript
{
  idToken: string; // Google Identity Token received from client SDK
}
```

#### Response

##### Success (200 OK)
Same structure as **Login** response.

##### Errors
- `401`: Invalid Google token

---

### 4. Verify Email
**Method:** `POST`
**Path:** `/api/v1/auth/verify-email`
**Description:** Verifies a user's email address using the token sent via email.

#### Authentication
- Required: No

#### Request

##### Headers
- `Content-Type`: `application/json`

##### Body
```typescript
{
  token: string; // Verification token from email link
}
```

#### Response

##### Success (200 OK)
```typescript
{
  message: string;
  user: {
    id: string;
    email: string;
    emailVerified: boolean;
  };
}
```

##### Errors
- `400`: Invalid or expired token / Token is required

---

### 5. Check Email Availability
**Method:** `GET`
**Path:** `/api/v1/auth/check-email`
**Description:** Checks if an email address is already registered. Useful for frontend validation forms.

#### Authentication
- Required: No

#### Request

##### Query Parameters
```typescript
{
  email: string; // The email to check
}
```

#### Response

##### Success (200 OK)
```typescript
{
  exists: boolean;
}
```

##### Errors
- `400`: Invalid email format

---

### 6. Refresh Tokens
**Method:** `POST`
**Path:** `/api/v1/auth/refresh`
**Description:** Generates a new access token using a valid refresh token.

#### Authentication
- Required: No

#### Request

##### Headers
- `Content-Type`: `application/json`

##### Body
```typescript
{
  refreshToken: string; // The refresh token to use
}
```

#### Response

##### Success (200 OK)
```typescript
{
  message: string;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}
```

##### Errors
- `401`: Invalid or expired refresh token

---

### 7. Request Password Reset
**Method:** `POST`
**Path:** `/api/v1/auth/forgot-password`
**Description:** Initiates the password reset process by sending an email with a reset token.

#### Authentication
- Required: No

#### Request

##### Headers
- `Content-Type`: `application/json`

##### Body
```typescript
{
  email: string;
}
```

#### Response

##### Success (200 OK)
```typescript
{
  message: string; // "If the email exists, a password reset link has been sent"
}
```

##### Errors
- `400`: Validation error

---

### 8. Reset Password
**Method:** `POST`
**Path:** `/api/v1/auth/reset-password`
**Description:** Completes the password reset process using the token and a new password.

#### Authentication
- Required: No

#### Request

##### Headers
- `Content-Type`: `application/json`

##### Body
```typescript
{
  token: string;      // Reset token from email
  newPassword: string; // New password (min 8 chars)
}
```

#### Response

##### Success (200 OK)
```typescript
{
  message: string;
}
```

##### Errors
- `400`: Invalid/expired token or password too weak

---

### 9. Change Password
**Method:** `POST`
**Path:** `/api/v1/auth/change-password`
**Description:** Allows a logged-in user to change their password.

#### Authentication
- **Required:** Yes
- **Type:** Bearer Token

#### Request

##### Headers
- `Authorization`: `Bearer <token>`
- `Content-Type`: `application/json`

##### Body
```typescript
{
  currentPassword: string;
  newPassword: string; // Min 8 chars
}
```

#### Response

##### Success (200 OK)
```typescript
{
  message: string;
}
```

##### Errors
- `401`: Unauthorized or current password incorrect
- `400`: New password same as old / weak password

---

### 10. Logout
**Method:** `POST`
**Path:** `/api/v1/auth/logout`
**Description:** Logs out the user by invalidating the refresh token.

#### Authentication
- **Required:** Yes (technically checks `userId` from token)

#### Request

##### Headers
- `Authorization`: `Bearer <token>`
- `Content-Type`: `application/json`

##### Body
```typescript
{
  refreshToken: string;
}
```

#### Response

##### Success (200 OK)
```typescript
{
  message: string;
}
```

##### Errors
- `401`: Unauthorized

---

### Usage Notes
- **Tokens**: Access tokens are short-lived. Use the `refresh` endpoint when you receive a 401 error to get a new access token seamlessly.
- **Verification**: New users must verify their email before logging in.
- **Passwords**: Enforce strong passwords (min 8 characters) on the frontend as well for better UX.

