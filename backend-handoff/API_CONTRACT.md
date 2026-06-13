# API Contract

Legacy backend API contract for migration into a new Next.js / Vercel project.

Unless noted otherwise, successful responses use:

```json
{
  "success": true,
  "data": {},
  "meta": { "timestamp": 0 }
}
```

Unless noted otherwise, error responses use:

```json
{
  "success": false,
  "error": { "code": "ERROR_CODE", "message": "Human readable message" },
  "meta": { "timestamp": 0 }
}
```

## Endpoints

### GET `/api/v1/health`

- Auth: none
- Request: none
- Required env: `DATABASE_URL`, `DIRECT_URL`
- External services: PostgreSQL
- Success response:

```json
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "ISO-8601 string",
  "uptime": 0,
  "latency": 0,
  "services": { "database": "ok" }
}
```

- Error response: no standard error response; database failure returns `status: "degraded"` and `services.database: "error"`.

### POST `/api/contact`

- Auth: none
- Rate limit: `3` requests per minute per IP
- Request body:

```json
{
  "name": "string, 2-100 chars",
  "email": "valid email, max 255 chars",
  "company": "optional string, max 200 chars",
  "subject": "string, 1-200 chars",
  "message": "string, 10-5000 chars",
  "recaptchaToken": "optional string"
}
```

- Required env: `DATABASE_URL`, `DIRECT_URL`
- Optional env: `RESEND_API_KEY`, `CONTACT_EMAIL_TO`
- External services: PostgreSQL, optional Resend
- Success response:

```json
{
  "success": true,
  "data": { "message": "Contact form submitted successfully" },
  "meta": { "timestamp": 0 }
}
```

- Error response: standard envelope. Common codes: `RATE_LIMITED`, `VALIDATION_ERROR`, `INTERNAL_ERROR`.

### POST `/api/chat`

- Auth: optional. Required only when `conversationId` is provided.
- Rate limit: `20` requests per minute per IP
- Request body:

```json
{
  "messages": [
    { "role": "user", "content": "string, max 12000 chars" }
  ],
  "conversationId": "optional string, 1-64 chars"
}
```

- Required env: `OPENROUTER_API_KEY`
- Optional env: `DATABASE_URL`, `DIRECT_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
- External services: OpenRouter, optional PostgreSQL, optional NextAuth session
- Success response:

```json
{
  "id": "msg-<timestamp>",
  "role": "assistant",
  "content": "string"
}
```

- Error response: raw JSON, not the standard envelope:

```json
{ "error": "string" }
```

### GET / POST `/api/auth/[...nextauth]`

- Auth: NextAuth handler
- Request: NextAuth-managed OAuth/session/callback requests
- Required env: `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `DATABASE_URL`, `DIRECT_URL`
- Optional env: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- External services: PostgreSQL, optional Google OAuth
- Response: NextAuth-managed responses/cookies
- Error response: NextAuth-managed

### POST `/api/auth/register`

- Auth: none
- Rate limit: `5` requests per 15 minutes per IP
- Request body:

```json
{
  "name": "string, 2-100 chars",
  "email": "valid email",
  "password": "string, 8-100 chars, at least one uppercase letter and one number",
  "turnstileToken": "string"
}
```

- Required env: `DATABASE_URL`, `DIRECT_URL`
- Optional env: `TURNSTILE_SECRET_KEY`
- External services: PostgreSQL, optional Cloudflare Turnstile
- Success response data:

```json
{
  "id": "string",
  "name": "string",
  "email": "string",
  "role": "MEMBER",
  "createdAt": "date"
}
```

- Error response: standard envelope. Common codes: `RATE_LIMITED`, `CAPTCHA_FAILED`, `EMAIL_EXISTS`, `VALIDATION_ERROR`.

### POST `/api/v1/auth/email/request-otp`

- Auth: none
- Rate limit: `20/IP/hour`, `5/email/hour`, one challenge per email per minute
- Request body:

```json
{
  "email": "valid email",
  "device_fingerprint": "64-char SHA-256 hex string",
  "app_version": "string, 1-64 chars",
  "platform": "windows"
}
```

- Required env: `DATABASE_URL`, `DIRECT_URL`
- Required in production: `RESEND_API_KEY`
- External services: PostgreSQL, Resend
- Success response data:

```json
{
  "challenge_id": "string",
  "expires_in_seconds": 600
}
```

- Development-only response may include `dev_otp` when `RESEND_API_KEY` is unset and `NODE_ENV` is not `production`.
- Error response: standard envelope. Common codes: `RATE_LIMITED`, `EMAIL_DELIVERY_FAILED`, `VALIDATION_ERROR`.

### POST `/api/v1/auth/email/verify-otp`

- Auth: none
- Rate limit: `60/IP/hour`, `30/email/hour`, max 5 attempts per challenge
- Request body:

```json
{
  "challenge_id": "string",
  "otp": "6 digit string"
}
```

- Required env: `DATABASE_URL`, `DIRECT_URL`, `LICENSE_JWT_PRIVATE_KEY_PEM`, `LICENSE_JWT_KEY_ID`, `LICENSE_JWT_ISSUER`, `LICENSE_JWT_AUDIENCE`
- External services: PostgreSQL
- Success response data:

```json
{
  "user_id": "string",
  "email": "string",
  "license_jwt": "string",
  "is_new_user": true
}
```

- Error response: standard envelope. Common codes: `INVALID_CHALLENGE`, `EXPIRED_CHALLENGE`, `TOO_MANY_ATTEMPTS`, `INVALID_OTP`, `ACCOUNT_DISABLED`, `RATE_LIMITED`.

### POST `/api/v1/auth/register`

- Auth: none
- Rate limit: `30/IP/hour`, `10/email/hour`
- Request body:

```json
{
  "email": "valid email",
  "password": "string, 8-100 chars, at least one uppercase letter and one number",
  "name": "optional string, 2-100 chars",
  "device_fingerprint": "64-char SHA-256 hex string",
  "app_version": "string, 1-64 chars",
  "platform": "windows"
}
```

- Required env: `DATABASE_URL`, `DIRECT_URL`, `LICENSE_JWT_PRIVATE_KEY_PEM`, `LICENSE_JWT_KEY_ID`, `LICENSE_JWT_ISSUER`, `LICENSE_JWT_AUDIENCE`
- External services: PostgreSQL
- Success response data:

```json
{
  "user_id": "string",
  "email": "string",
  "license_jwt": "string",
  "is_new_user": true
}
```

- Error response: standard envelope. Common codes: `RATE_LIMITED`, `EMAIL_EXISTS`, `VALIDATION_ERROR`.

### POST `/api/v1/auth/login`

- Auth: none
- Rate limit: `30/IP/hour`, `10/email/hour`
- Request body:

```json
{
  "email": "valid email",
  "password": "string",
  "device_fingerprint": "64-char SHA-256 hex string",
  "app_version": "string, 1-64 chars",
  "platform": "windows"
}
```

- Required env: `DATABASE_URL`, `DIRECT_URL`, `LICENSE_JWT_PRIVATE_KEY_PEM`, `LICENSE_JWT_KEY_ID`, `LICENSE_JWT_ISSUER`, `LICENSE_JWT_AUDIENCE`
- External services: PostgreSQL
- Success response data:

```json
{
  "user_id": "string",
  "email": "string",
  "license_jwt": "string",
  "is_new_user": false
}
```

- Error response: standard envelope. Common codes: `RATE_LIMITED`, `INVALID_CREDENTIALS`, `ACCOUNT_DISABLED`.

### POST `/api/v1/auth/logout`

- Auth: Bearer EC-Share license JWT
- Rate limit: `120/IP/hour`
- Request body: none
- Required env: `LICENSE_JWT_PRIVATE_KEY_PEM`, `LICENSE_JWT_ISSUER`, `LICENSE_JWT_AUDIENCE`
- Recommended env: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
- External services: Upstash Redis when configured
- Success response: `204 No Content`
- Error response: standard envelope. Common codes: `RATE_LIMITED`, `UNAUTHORIZED`.

### GET `/api/v1/account/me`

- Auth: Bearer EC-Share license JWT
- Request: none
- Required env: `DATABASE_URL`, `DIRECT_URL`, `LICENSE_JWT_PRIVATE_KEY_PEM`, `LICENSE_JWT_ISSUER`, `LICENSE_JWT_AUDIENCE`
- Recommended env: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
- External services: PostgreSQL, optional Upstash Redis
- Success response data:

```json
{
  "user_id": "string",
  "email": "string",
  "tier": "trial | pro | business | enterprise | expired_trial | expired",
  "seats": 1,
  "subscription": {
    "stripe_subscription_id": "string",
    "status": "string",
    "cancel_at_period_end": false,
    "current_period_end": 0
  },
  "trial": {
    "started_at": 0,
    "expires_at": 0
  },
  "devices": [
    {
      "fingerprint": "string",
      "nickname": "string or null",
      "last_seen_at": 0
    }
  ]
}
```

- Error response: standard envelope. Common codes: `UNAUTHORIZED`.

### POST `/api/v1/account/change-email/request-otp`

- Auth: Bearer EC-Share license JWT
- Rate limit: `5/user+IP/hour`, one challenge per new email per minute
- Request body:

```json
{ "new_email": "valid email" }
```

- Required env: `DATABASE_URL`, `DIRECT_URL`, `LICENSE_JWT_PRIVATE_KEY_PEM`, `LICENSE_JWT_ISSUER`, `LICENSE_JWT_AUDIENCE`
- Required in production: `RESEND_API_KEY`
- External services: PostgreSQL, Resend, optional Upstash Redis
- Success response data:

```json
{
  "challenge_id": "string",
  "expires_in_seconds": 600
}
```

- Development-only response may include `dev_otp` when `RESEND_API_KEY` is unset and `NODE_ENV` is not `production`.
- Error response: standard envelope. Common codes: `UNAUTHORIZED`, `RATE_LIMITED`, `EMAIL_UNCHANGED`, `EMAIL_EXISTS`, `EMAIL_DELIVERY_FAILED`.

### POST `/api/v1/account/change-email`

- Auth: Bearer EC-Share license JWT
- Rate limit: `60/IP/hour`, `30/email/hour`, max 5 attempts per challenge
- Request body:

```json
{
  "new_email": "valid email",
  "challenge_id": "string",
  "otp": "6 digit string"
}
```

- Required env: `DATABASE_URL`, `DIRECT_URL`, `LICENSE_JWT_PRIVATE_KEY_PEM`, `LICENSE_JWT_KEY_ID`, `LICENSE_JWT_ISSUER`, `LICENSE_JWT_AUDIENCE`
- External services: PostgreSQL, optional Upstash Redis
- Success response data:

```json
{
  "user_id": "string",
  "email": "string",
  "license_jwt": "string"
}
```

- Error response: standard envelope. Common codes: `UNAUTHORIZED`, `INVALID_CHALLENGE`, `EXPIRED_CHALLENGE`, `TOO_MANY_ATTEMPTS`, `INVALID_OTP`, `EMAIL_EXISTS`.

### POST `/api/v1/account/devices/rename`

- Auth: Bearer EC-Share license JWT
- Request body:

```json
{
  "fingerprint": "64-char SHA-256 hex string",
  "nickname": "string, 1-80 chars"
}
```

- Required env: `DATABASE_URL`, `DIRECT_URL`, `LICENSE_JWT_PRIVATE_KEY_PEM`, `LICENSE_JWT_ISSUER`, `LICENSE_JWT_AUDIENCE`
- External services: PostgreSQL, optional Upstash Redis
- Success response data:

```json
{
  "fingerprint": "string",
  "nickname": "string"
}
```

- Error response: standard envelope. Common codes: `UNAUTHORIZED`, `DEVICE_NOT_FOUND`, `VALIDATION_ERROR`.

### DELETE `/api/v1/account/devices/[fingerprint]`

- Auth: Bearer EC-Share license JWT
- Path params: `fingerprint` as 64-char SHA-256 hex string
- Required env: `DATABASE_URL`, `DIRECT_URL`, `LICENSE_JWT_PRIVATE_KEY_PEM`, `LICENSE_JWT_ISSUER`, `LICENSE_JWT_AUDIENCE`
- External services: PostgreSQL, optional Upstash Redis
- Success response data:

```json
{ "deleted": true }
```

- Error response: standard envelope. Common codes: `UNAUTHORIZED`, `DEVICE_NOT_FOUND`, `VALIDATION_ERROR`.

### POST `/api/v1/license/activate`

- Auth: Bearer EC-Share license JWT
- Rate limit: `120/IP/hour`, `120/device/hour`
- Request body:

```json
{
  "product": "ec_share",
  "device_fingerprint": "64-char SHA-256 hex string",
  "app_version": "string, 1-64 chars",
  "platform": "windows"
}
```

- Required env: `DATABASE_URL`, `DIRECT_URL`, `LICENSE_JWT_PRIVATE_KEY_PEM`, `LICENSE_JWT_KEY_ID`, `LICENSE_JWT_ISSUER`, `LICENSE_JWT_AUDIENCE`
- External services: PostgreSQL, optional Upstash Redis
- Success response data:

```json
{
  "license_jwt": "string",
  "product": "ec_share",
  "expires_at": 0,
  "next_refresh_at": 0,
  "activated": true
}
```

- Error response: standard envelope. Common codes: `RATE_LIMITED`, `UNAUTHORIZED`, `LICENSE_MISMATCH`.

### POST `/api/v1/license/deactivate`

- Auth: Bearer EC-Share license JWT
- Rate limit: `120/IP/hour`, `120/device/hour`
- Request body: same as `/api/v1/license/activate`
- Required env: `DATABASE_URL`, `DIRECT_URL`, `LICENSE_JWT_PRIVATE_KEY_PEM`, `LICENSE_JWT_ISSUER`, `LICENSE_JWT_AUDIENCE`
- External services: PostgreSQL, optional Upstash Redis
- Success response data:

```json
{
  "product": "ec_share",
  "device_fingerprint": "string",
  "deactivated": true,
  "token_revoked": false,
  "note": "string"
}
```

- Error response: standard envelope. Common codes: `RATE_LIMITED`, `UNAUTHORIZED`, `LICENSE_MISMATCH`.

### POST `/api/v1/license/heartbeat`

- Auth: Bearer EC-Share license JWT
- Rate limit: `120/IP/hour`, `120/device/hour`
- Request body: same as `/api/v1/license/activate`
- Required env: `DATABASE_URL`, `DIRECT_URL`, `LICENSE_JWT_PRIVATE_KEY_PEM`, `LICENSE_JWT_ISSUER`, `LICENSE_JWT_AUDIENCE`
- External services: PostgreSQL, optional Upstash Redis
- Success response data:

```json
{
  "product": "ec_share",
  "device_fingerprint": "string",
  "last_seen_at": 0
}
```

- Error response: standard envelope. Common codes: `RATE_LIMITED`, `UNAUTHORIZED`, `LICENSE_MISMATCH`, `DEVICE_NOT_FOUND`.

### POST `/api/v1/license/refresh`

- Auth: Bearer EC-Share license JWT, accepted up to 44 days after expiry
- Request body:

```json
{
  "product": "ec_share",
  "device_fingerprint": "64-char SHA-256 hex string",
  "app_version": "string, 1-64 chars"
}
```

- Required env: `DATABASE_URL`, `DIRECT_URL`, `LICENSE_JWT_PRIVATE_KEY_PEM`, `LICENSE_JWT_KEY_ID`, `LICENSE_JWT_ISSUER`, `LICENSE_JWT_AUDIENCE`
- External services: PostgreSQL, optional Upstash Redis
- Success response data:

```json
{
  "license_jwt": "string",
  "product": "ec_share",
  "expires_at": 0,
  "next_refresh_at": 0
}
```

- Error response: standard envelope. Common codes: `UNAUTHORIZED`, `LICENSE_MISMATCH`.

### GET `/api/v1/license/jwks`

- Auth: none
- Request: none
- Required env: `LICENSE_JWT_PRIVATE_KEY_PEM`
- Optional env: `LICENSE_JWT_KEY_ID`
- External services: none
- Success response data:

```json
{
  "keys": [
    {
      "kty": "OKP",
      "crv": "Ed25519",
      "x": "base64url public key",
      "kid": "string",
      "use": "sig",
      "alg": "EdDSA"
    }
  ]
}
```

- Error response: standard envelope. Common code: `SERVICE_UNAVAILABLE`.

### GET `/api/v1/download/latest-manifest`

- Auth: none
- Request: none
- Optional env: `EC_SHARE_DOWNLOAD_MANIFEST_URL`, `NEXT_PUBLIC_EC_SHARE_DOWNLOAD_MANIFEST_URL`, `EC_SHARE_DOWNLOAD_CHANNEL`
- External services: none at request time; returns external CDN/manifest URL
- Success response data:

```json
{
  "manifest_url": "string",
  "platform": "windows",
  "channel": "stable",
  "schema": "Opaque JSON hosted at manifest_url; desktop updater owns version/sha256/installer_url fields."
}
```

- Error response: standard envelope from wrapper only.

### GET `/api/admin/stats`

- Auth: NextAuth session with role `ADMIN` or `SUPER_ADMIN`
- Request: none
- Required env: `DATABASE_URL`, `DIRECT_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
- External services: PostgreSQL
- Success response data:

```json
{
  "summary": {
    "totalUsers": 0,
    "totalOrders": 0,
    "totalContacts": 0,
    "totalRevenue": 0,
    "recentUsers": 0,
    "recentOrders": 0
  },
  "dailyRevenue": [
    { "date": "YYYY-MM-DD", "revenue": 0, "orders": 0 }
  ]
}
```

- Error response: standard envelope. Common codes: `UNAUTHORIZED`, `FORBIDDEN`.

### PATCH `/api/admin/users/[id]`

- Auth: NextAuth session with role `ADMIN` or `SUPER_ADMIN`
- Path params: `id`
- Request body:

```json
{
  "role": "MEMBER | ADMIN | SUPER_ADMIN",
  "status": "ACTIVE | SUSPENDED"
}
```

- Required env: `DATABASE_URL`, `DIRECT_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
- External services: PostgreSQL
- Success response data:

```json
{
  "id": "string",
  "name": "string or null",
  "email": "string",
  "role": "string",
  "status": "string"
}
```

- Error response: standard envelope. Common codes: `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `VALIDATION_ERROR`.

### POST `/api/payment/create-session`

- Status: deprecated. Do not port as active integration.
- Auth: none
- Success response: none
- Error response:

```json
{
  "error": "This endpoint is deprecated. Use the createCheckoutSession server action."
}
```

- HTTP status: `410`

### POST `/api/payment/create-portal`

- Status: deprecated. Do not port as active integration.
- Auth: none
- Success response: none
- Error response:

```json
{
  "error": "This endpoint is deprecated. Use the createPortalSession server action."
}
```

- HTTP status: `410`

### POST `/api/payment/webhook`

- Status: legacy-compatible Stripe webhook URL
- Auth: Stripe signature header
- Request: raw Stripe webhook body; `stripe-signature` header required
- Required env: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `DATABASE_URL`, `DIRECT_URL`
- External services: Stripe, PostgreSQL
- Success response:

```json
{
  "received": true,
  "event_id": "string"
}
```

- Duplicate processed event response:

```json
{
  "received": true,
  "duplicate": true,
  "event_id": "string"
}
```

- Error response: raw JSON, not standard envelope. Common statuses: `400`, `409`, `500`, `503`.

### POST `/webhooks/stripe`

- Same behavior as `/api/payment/webhook`.
- Recommended as the canonical production webhook path if preserving legacy comments.

## Server Actions

### `createCheckoutSession(priceId: string)`

- Auth: NextAuth session
- Required env: `STRIPE_SECRET_KEY`, `NEXTAUTH_URL`, Stripe Price ID env vars
- External services: Stripe, PostgreSQL
- Behavior: validates price ID allowlist, creates Stripe customer if needed, creates subscription Checkout Session, redirects to Stripe Checkout.

### `getCheckoutSessionUrl(priceId: string)`

- Same as `createCheckoutSession`, but returns the Checkout URL instead of redirecting.

### `createPortalSession()`

- Auth: NextAuth session
- Required env: `STRIPE_SECRET_KEY`, `NEXTAUTH_URL`
- External services: Stripe, PostgreSQL
- Behavior: creates Stripe Billing Portal session and redirects.

### `getPortalSessionUrl()`

- Same as `createPortalSession`, but returns the portal URL instead of redirecting.
