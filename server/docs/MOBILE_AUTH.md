# Mobile App Authentication System

## Overview

The mobile app uses a JWT-based authentication system with token expiration and refresh tokens for enhanced security. Access tokens expire after 15 minutes, while refresh tokens can be configured to expire after 6 months or never expire.

## Token Types

### Access Token
- **Expiration**: 15 minutes
- **Purpose**: Used for API requests
- **Format**: JWT token with user information and permissions
- **Storage**: Should be stored in memory or secure storage on mobile device

### Refresh Token
- **Expiration**: 6 months (configurable) or never expire
- **Purpose**: Used to obtain new access tokens when they expire
- **Format**: Random 40-character hex string
- **Storage**: Should be stored securely on mobile device (keychain, encrypted storage)

## Configuration

Token behavior is controlled by the `mobileRefreshTokenExpires` setting in `server/config/config.js`:

```javascript
auth: {
  secret: 'your_jwt_secret',
  mobileRefreshTokenExpires: 'false' // 'true' for 6 months, 'false' for never expire
}
```

## API Endpoints

### Authentication Endpoints

#### POST `/mobileapp/auth/login`
Login and receive access token and refresh token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "ok": true,
  "message": "Login successful",
  "accessToken": "jwt_token_here",
  "refreshToken": "refresh_token_here",
  "expiresIn": 900
}
```

#### POST `/mobileapp/auth/refresh`
Refresh an expired access token using a valid refresh token.

**Request Body:**
```json
{
  "refreshToken": "refresh_token_here",
}
```

**Response:**
```json
{
  "ok": true,
  "message": "Token refreshed successfully",
  "accessToken": "new_jwt_token_here",
  "userInfo": {object with permissions},
  "expiresIn": 900
}
```

#### POST `/mobileapp/auth/revoke`
Revoke a refresh token (logout).

**Request Body:**
```json
{
  "refreshToken": "refresh_token_here"
}
```

**Response:**
```json
{
  "ok": true,
  "message": "Token revoked successfully"
}
```

## Error Responses

### No Token (401)
```json
{
  "ok": false,
  "message": "no token",
  "code": "NO_TOKEN"
}
```

### Invalid Token (401)
```json
{
  "ok": false,
  "message": "bad token",
  "code": "INVALID_TOKEN"
}
```

### Token Expired (401)
```json
{
  "ok": false,
  "message": "token expired",
  "code": "TOKEN_EXPIRED",
  "expiredAt": 1640995200000,
  "currentTime": 1640995300000
}
```

### Invalid Refresh Token (403)
```json
{
  "ok": false,
  "message": "Invalid refresh token"
}
```

### Refresh Token Expired (403)
```json
{
  "ok": false,
  "message": "Refresh token expired"
}
```

## Mobile App Implementation

### Token Management
1. Store refresh token securely (keychain, encrypted storage)
2. Store access token in memory or secure storage
3. Monitor access token expiration using the `expiresIn` value
4. Use refresh token to get new access token when needed

### Request Flow
1. Make API request with access token in Authorization header
2. If request returns 401 with "TOKEN_EXPIRED" code:
   - Use refresh token to get new access token
   - Retry original request with new access token
3. If refresh token is invalid/expired:
   - Redirect user to login screen

## Security Considerations

1. **Access tokens expire quickly** (15 minutes) to minimize exposure
2. **Refresh tokens are stored securely** in the database with expiration tracking
3. **Tokens can be revoked** by marking them as revoked in the database
4. **Expired tokens are automatically cleaned up** during login operations
5. **Flexible expiration** - refresh tokens can be set to never expire for special cases
6. **Proper error handling** - different error codes for different failure scenarios

## Implementation Notes

- **Time units**: Access token expiry is stored in milliseconds internally but converted to seconds for JWT
- **Token revocation**: Uses `isRevoked` flag instead of deletion for audit trail and security
- **Automatic cleanup**: Expired refresh tokens are cleaned up during login operations
- **Error codes**: Specific error codes help mobile apps handle different authentication scenarios 