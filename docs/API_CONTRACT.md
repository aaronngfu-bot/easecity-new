# EC-Share ↔ EaseCity Backend — API Contract (v0.1)

> **Audience**: EaseCity web/backend team (who owns `easecity.hk` stack, Stripe integration, Postgres DB).
> **Source**: EC-Share Windows desktop client (Flutter + C++), which consumes this API.
> **Status**: DRAFT v0.1 — all endpoints and schemas below are the desktop client's requirement; backend team may propose changes, but the JWT shape (§6) is load-bearing for the desktop entitlements system.
> **Last updated**: 2026-04-23

---

## 0. Scope

This doc covers **licensing + identity + subscription** APIs between the EaseCity backend and the EC-Share desktop client. It does **not** cover:
- WebRTC signaling — see `SHARE_ARCHITECTURE.md` (separate service on `share.easecity.hk`)
- Server ↔ device (scrcpy) protocol — internal to desktop client
- Marketing site / pricing page — frontend only

### Multi-product readiness (per `COMPANY_ARCHITECTURE.md`)

All endpoints follow two path conventions:
- **Shared endpoints** (cross-product): `/auth/*`, `/account/*`, `/license/*`, `/org/*`, `/billing/*`
- **Product-specific endpoints**: `/ec-share/*` for EC-Share, `/<future-product>/*` for later products

JWTs include a `product` claim so shared endpoints can return product-specific data (features list, max devices, etc.) without client needing to parse the URL.

---

## 1. Deployment map

```
Desktop client                     EaseCity web/backend                     3rd parties
────────────────                   ──────────────────────                    ──────────

ec-share.exe          ─── HTTPS ──►   api.easecity.hk        ◄── webhooks ──  Stripe
(Flutter + C++)                        (Node/Python/etc.)
                                           │
                                           ├── issues JWT (Ed25519 signed)
                                           ├── Postgres: users, licenses,
                                           │             trials, subscriptions
                                           └── optional: SendGrid/Postmark
                                                       (email OTP delivery)

easecity.hk           ─── static site, landing, docs, pricing, download CTAs
ecshare.easecity.hk   ─── product landing (optional subdomain)
dl.easecity.hk        ─── installer hosting + auto-update channel manifest
```

---

## 2. Conventions

- **Base URL**: `https://api.easecity.hk`
- **Auth**: Bearer JWT in `Authorization: Bearer <token>` for user-authenticated endpoints.
- **Content-Type**: `application/json` both ways.
- **Errors**: use standard HTTP codes + JSON `{ "error": { "code": "...", "message": "..." } }`.
- **Idempotency**: for POST endpoints that create resources, accept `Idempotency-Key: <uuid>` header to prevent duplicate side effects.
- **Rate limits**: 60 requests / minute / IP for unauthenticated endpoints; 600 / minute / user for authenticated.
- **Timestamps**: Unix epoch seconds, UTC.
- **Versioning**: add `/v1/` prefix if breaking changes needed; until then no prefix.

---

## 3. Identity & Auth endpoints

### 3.1 `POST /auth/email/request-otp`
Start email-OTP login. Also used for trial signup.

**Request**:
```json
{
  "email": "user@example.com",
  "device_fingerprint": "sha256_hex_64chars",
  "app_version": "1.0.0",
  "platform": "windows"
}
```

**Response 200**:
```json
{ "challenge_id": "chal_abc123", "expires_in_seconds": 600 }
```

**Response 429**: too many requests for this email (max 5 / hour).

### 3.2 `POST /auth/email/verify-otp`
Complete email-OTP login.

**Request**:
```json
{
  "challenge_id": "chal_abc123",
  "otp": "482951"
}
```

**Response 200**:
```json
{
  "user_id": "usr_xyz",
  "email": "user@example.com",
  "license_jwt": "eyJhbG...",   // see §6 for JWT shape
  "is_new_user": true            // true if this email had no prior record
}
```

- On success: creates user if new, starts 14-day trial if no prior trial on this `device_fingerprint` or `email`.
- **Trial-fraud guard**: if `device_fingerprint` has already consumed a trial within 365 days, `is_new_user: false` and the returned JWT has `tier: "expired_trial"`.

### 3.3 `POST /auth/oauth/google/callback` *(optional, M2.5)*
Google OAuth flow for users who prefer it. Deferred past M2 MVP.

### 3.4 `POST /auth/logout`
**Request**: Bearer token in header.
**Response 204**: no content; client discards local JWT.

Server-side: optionally adds user to deny-list for unexpired JWTs (stateless JWTs mean we can't revoke, so use a short deny-list TTL = max(current JWT exp)).

---

## 4. License & trial endpoints

### 4.1 `POST /license/refresh`
Called by desktop client every 24 hours while online. Renews JWT with latest tier/expiry.

**Request**: Bearer token (can be expired up to 44 days, server is lenient within grace window).
```json
{
  "product": "ec_share",           // which product's license to refresh
  "device_fingerprint": "sha256_hex",
  "app_version": "1.0.0"
}
```

**Response 200**:
```json
{
  "license_jwt": "eyJhbG...",
  "product": "ec_share",
  "expires_at": 1738195200,
  "next_refresh_at": 1735689600
}
```

A user with subscriptions to multiple products calls `/license/refresh` once per product. Backend returns a JWT scoped to that product.

**Response 401**: token fully expired beyond 44-day grace OR user revoked / refunded → client shows login screen.

### 4.2 `GET /account/me`
**Response 200**:
```json
{
  "user_id": "usr_xyz",
  "email": "user@example.com",
  "tier": "pro",
  "seats": 1,
  "subscription": {
    "stripe_subscription_id": "sub_...",
    "status": "active",
    "cancel_at_period_end": false,
    "current_period_end": 1738195200
  },
  "trial": null,
  "devices": [
    { "fingerprint": "sha256_hex", "nickname": "My Thinkpad", "last_seen_at": 1735603200 }
  ]
}
```

### 4.3 `POST /account/change-email`
Requires fresh re-auth (OTP challenge) to prevent session hijack.

### 4.4 `POST /account/devices/rename`
**Request**: `{ "fingerprint": "...", "nickname": "..." }`
**Response 204**.

### 4.5 `DELETE /account/devices/{fingerprint}`
Remove a device from the user's account. Server invalidates cached JWTs for that fingerprint.

---

## 5. Stripe webhook handler (backend-only, not called by desktop)

Listens to Stripe events at `POST /webhooks/stripe`:

| Stripe event | Server action |
|--------------|--------------|
| `customer.subscription.created` | Upsert `subscriptions` row; set user's tier to the one in Stripe price metadata; reissue JWT on next refresh |
| `customer.subscription.updated` | Update `subscriptions` row (new tier, seat count, status); reissue JWT on next refresh |
| `customer.subscription.deleted` | Mark subscription canceled; user falls back to `tier: "expired"` after period end; JWT refresh returns that tier |
| `invoice.payment_failed` | Mark subscription `past_due`; email customer; allow 7-day retry |
| `invoice.payment_succeeded` | Reset any `past_due` flags |

**Signature verification**: always verify `Stripe-Signature` header using webhook secret before acting. Reject any request that fails verification.

**Stripe price metadata (multi-product ready, per D-27)**:

Rather than a lookup table that drifts out of date, set metadata on each Stripe price directly:

```
Stripe Product: "EC-Share Pro"
  price_ec_share_pro_monthly  metadata { product: "ec_share", tier: "pro" }
  price_ec_share_pro_annual   metadata { product: "ec_share", tier: "pro" }

Stripe Product: "EC-Share Business"
  price_ec_share_business_monthly  metadata { product: "ec_share", tier: "business" }
  price_ec_share_business_annual   metadata { product: "ec_share", tier: "business" }

Stripe Product: "EC-Share Enterprise"
  price_ec_share_enterprise_annual metadata { product: "ec_share", tier: "enterprise" }

(future)
Stripe Product: "<Next Product> Pro"
  price_<future>_pro_monthly  metadata { product: "<slug>", tier: "pro" }
```

Webhook handler reads `event.data.object.price.metadata.product` and `.tier` directly — no registry to maintain as new products/prices land.

Store in DB: `subscriptions.stripe_price_id`, `subscriptions.product`, `subscriptions.tier` (the latter two denormalized from Stripe metadata for query efficiency).

---

## 6. License JWT shape (load-bearing)

This is the **contract** between backend issuer and desktop verifier. Changing shape requires desktop client update.

### Signing
- **Algorithm**: `EdDSA` (Ed25519)
- **Key rotation**: generate new keypair yearly; embed current + last year's public keys in desktop client; allow 90-day transition.
- **Public key distribution**: embedded in `ec-share.exe` at build time. Rotation requires auto-update release.

### JWT header
```json
{ "alg": "EdDSA", "typ": "JWT", "kid": "2026a" }
```
`kid` = key ID, lets client choose which embedded pubkey verifies this token.

### JWT payload
```json
{
  "sub": "usr_xyz",
  "email": "user@example.com",
  "iss": "https://api.easecity.hk",
  "aud": "ec-share-desktop",
  "iat": 1735603200,
  "exp": 1735689600,

  "product": "ec_share",           ← product this JWT is scoped to (D-26)
  "tier": "pro",
  "seats": 1,
  "features": ["grid", "focus", "codec_h265", "screenshot", "record"],
  "max_devices": 5,

  "trial_expires_at": null,
  "subscription_status": "active",
  "cancel_at_period_end": false,
  "period_ends_at": 1738195200,

  "device_fingerprint": "sha256_hex",

  "org_id": null,                  ← null for individual Pro; populated for Business/Enterprise members
  "org_role": null                 ← "org_owner" | "org_admin" | "org_operator" | "org_viewer" | "org_auditor"
}
```

### Field definitions
| Field | Type | Description |
|-------|------|-------------|
| `sub` | string | Stable user ID; format `usr_<random>` |
| `email` | string | User's login email (may change; use `sub` as FK) |
| `iss` | string | `https://api.easecity.hk` — client checks |
| `aud` | string | `ec-share-desktop` — client checks |
| `iat` | int | JWT issuance time, epoch seconds |
| `exp` | int | JWT expiration; 24-hour window from issuance |
| `tier` | enum | `"trial"` / `"pro"` / `"business"` / `"enterprise"` / `"expired_trial"` / `"expired"` |
| `seats` | int | Allowed concurrent device count |
| `features` | string[] | Feature flags — see `SUBSCRIPTION_TIERS.md` for tier-to-features mapping |
| `max_devices` | int | Hard cap on concurrent devices |
| `trial_expires_at` | int or null | Epoch seconds, set only for `tier="trial"` |
| `subscription_status` | enum | `"active"` / `"past_due"` / `"canceled"` / `"trialing"` |
| `cancel_at_period_end` | bool | User initiated cancellation; entitlements run until `period_ends_at` |
| `period_ends_at` | int | Current subscription period end |
| `device_fingerprint` | string | Bound to this JWT; prevents JWT replay across machines |
| `product` | enum | `"ec_share"` today; future `"<slug>"` — see `COMPANY_ARCHITECTURE.md` §1 |
| `org_id` | string or null | Organization ID if user's subscription is org-scoped (Business/Enterprise) |
| `org_role` | enum or null | User's role within that org; see `DASHBOARDS_SPEC.md` §3 |

### Host-endpoint format convention (D-40 — updated 2026-04-24)

When a JWT, dashboard API response, or `ec-share://` deep link (D-37) contains a "host" string pointing to an Alice machine, it is **always a single `host:port` string**:

```
"192.168.0.113:28100"         ← LAN
"ec-share-eric.tailnet:28100" ← Tailscale / VPN
"203.0.113.42:28100"          ← public IP with router port forward
```

- Port **28100 is the canonical entry point** (video). Control channel at `+1` is auto-derived by the desktop client; web backend **never** emits a second port to the user.
- Future (M1 per D-44): desktop ships true single-socket protocol — port model collapses to truly one port. This won't require API schema change, just desktop client update. Any `host:port` strings from before can still be interpreted correctly.
- Web backend must therefore **always persist and emit `host:port`** (the video port), never write assumptions like "control port = video port + 1" into any document or UI. That's a desktop implementation detail.

### Features list (use as enum, don't add ad-hoc strings)
```
"grid"          grid view of multiple devices
"focus"         single-device focus mode
"codec_h265"    allow H.265 codec in probe
"screenshot"   screen capture
"record"        screen recording
"share_1"       1 concurrent share viewer (Business trial)
"share_5"       5 concurrent share viewers (Business)
"share_unlimited"  (Enterprise)
"audit_30d"     30-day audit log
"audit_unlimited" unlimited audit (Enterprise)
"sso_saml"      SAML SSO
"sso_oidc"      OIDC SSO
"rbac_basic"    3-role RBAC
"rbac_full"     4-role + custom RBAC
"onprem"        on-prem deployment allowed
```

---

## 7. Database schema (reference only — web team may adjust)

Multi-product readiness: tables that are **cross-product** have no `product` column; tables that are **product-specific** carry a `product` column from day 1 (D-28).

```sql
-- ═════════════════════════════════════════════
-- CROSS-PRODUCT (shared identity layer)
-- ═════════════════════════════════════════════

-- users: EaseCity accounts (cross-product per COMPANY_ARCHITECTURE D-24)
CREATE TABLE users (
  id                 TEXT PRIMARY KEY,              -- "usr_<random>"
  email              TEXT UNIQUE NOT NULL,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  stripe_customer_id TEXT UNIQUE                   -- set after first Stripe checkout (shared across all products)
);

-- organizations (cross-product; one org can subscribe to multiple products)
CREATE TABLE organizations (
  id         TEXT PRIMARY KEY,              -- "org_<random>"
  slug       TEXT UNIQUE NOT NULL,          -- human-readable URL slug
  name       TEXT NOT NULL,
  stripe_customer_id TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- org_members (cross-product membership)
CREATE TABLE org_members (
  org_id   TEXT REFERENCES organizations(id),
  user_id  TEXT REFERENCES users(id),
  role     TEXT NOT NULL,                    -- "org_owner" | "org_admin" | "org_operator" | "org_viewer" | "org_auditor"
  invited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (org_id, user_id)
);

-- email_otp_challenges (cross-product auth)
CREATE TABLE email_otp_challenges (
  id                 TEXT PRIMARY KEY,              -- "chal_<random>"
  email              TEXT NOT NULL,
  otp_hash           TEXT NOT NULL,                 -- bcrypt of 6-digit OTP
  device_fingerprint TEXT NOT NULL,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at         TIMESTAMPTZ NOT NULL,
  verified_at        TIMESTAMPTZ,
  attempts           INT NOT NULL DEFAULT 0         -- lock at 5
);

-- ═════════════════════════════════════════════
-- PRODUCT-SPECIFIC (carry `product` column)
-- ═════════════════════════════════════════════

-- trials (product-specific; user can trial multiple products independently)
CREATE TABLE trials (
  id                 TEXT PRIMARY KEY,
  product            TEXT NOT NULL,                 -- "ec_share" | future
  user_id            TEXT REFERENCES users(id),
  device_fingerprint TEXT NOT NULL,
  started_at         TIMESTAMPTZ NOT NULL,
  expires_at         TIMESTAMPTZ NOT NULL,
  UNIQUE (product, device_fingerprint)              -- prevents reset abuse per product
);

-- subscriptions (product-specific; 1-to-1 with Stripe subscription)
CREATE TABLE subscriptions (
  id                       TEXT PRIMARY KEY,        -- Stripe subscription_id
  product                  TEXT NOT NULL,           -- "ec_share" | future
  user_id                  TEXT REFERENCES users(id),    -- nullable if org-scoped
  org_id                   TEXT REFERENCES organizations(id), -- nullable if user-scoped
  stripe_price_id          TEXT NOT NULL,
  tier                     TEXT NOT NULL,           -- denormalized from Stripe price metadata
  seats                    INT NOT NULL,
  status                   TEXT NOT NULL,
  cancel_at_period_end     BOOLEAN NOT NULL DEFAULT FALSE,
  current_period_end       TIMESTAMPTZ NOT NULL,
  created_at               TIMESTAMPTZ NOT NULL,
  updated_at               TIMESTAMPTZ NOT NULL,
  CHECK (user_id IS NOT NULL OR org_id IS NOT NULL) -- exactly one must be set
);

-- devices (product-specific; tracks each machine the user has activated)
CREATE TABLE devices (
  fingerprint  TEXT NOT NULL,
  product      TEXT NOT NULL,                       -- "ec_share" | future
  user_id      TEXT REFERENCES users(id),
  nickname     TEXT,
  last_seen_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (product, fingerprint)                -- same machine can hold licenses for multiple products
);
```

---

## 8. Observability & logging requirements

- Every auth/license endpoint should emit structured logs with `user_id`, `endpoint`, `outcome`, `duration_ms`, `client_ip`, `app_version`.
- Stripe webhook handler logs `event_id` for dedup; ignore duplicates.
- Anomaly alerts: >10 failed OTP attempts for single email in 1h → email founder.
- Monthly aggregate dashboard (can be a spreadsheet at first): DAU, WAU, trial starts, paid conversions, churn, MRR.

---

## 9. Security requirements

- **Never log JWTs or OTPs.** Log only their hashes or last 4 chars.
- **Private signing key**: store in Fly.io secrets, AWS SSM Parameter Store, or HashiCorp Vault. NOT in repo, NOT in `.env` committed to git.
- **OTP**: 6 numeric digits, bcrypt hash with cost 10, 10-minute expiry, 5-attempt lockout, rate-limited to 1 OTP per email per 60 seconds.
- **CORS**: allow `https://easecity.hk`, `https://ecshare.easecity.hk`, `https://share.easecity.hk`; deny `*` explicitly. Desktop client doesn't need CORS.
- **TLS**: Let's Encrypt via Caddy / Traefik / Fly's auto-cert. TLS 1.3 preferred, 1.2 minimum.
- **GDPR**: user can request all data export (JSON) + full delete (cascade all above tables). Respond within 30 days.

---

## 10. Open decisions (for web team to confirm)

- [ ] Email delivery provider: SendGrid vs Postmark vs SES?
- [ ] JWT key rotation schedule: annual (recommended) vs semi-annual?
- [ ] Deny list for revoked JWTs: Redis TTL vs Postgres with cleanup cron?
- [ ] Multi-device seat enforcement: optimistic (count concurrent JWT refreshes) vs pessimistic (heartbeat registration)? Recommendation: optimistic for v1, revisit if seat abuse seen.
- [ ] Rate limit storage: in-process / Redis / Cloudflare?
- [ ] Hosting decision: Fly.io Go / Node / Python FastAPI / other? (Desktop client is agnostic; just needs a stable HTTPS endpoint.)
