# Environment Variables

This document lists environment variables referenced by the legacy backend.

No real values are included. Use `backend-handoff/.env.example` as the blank migration template.

## Required For Core Backend

| Variable | Required | Used by | Purpose |
| --- | --- | --- | --- |
| `DATABASE_URL` | Yes | Prisma / `prisma/schema.prisma` | PostgreSQL pooled/runtime connection URL |
| `DIRECT_URL` | Yes | Prisma / `prisma/schema.prisma` | Direct PostgreSQL connection URL for Prisma |
| `NEXTAUTH_SECRET` | Yes | NextAuth | Session/JWT signing secret for web auth |
| `NEXTAUTH_URL` | Yes | NextAuth, Stripe return URLs, sitemap, robots | Canonical app origin |

## Optional Web Auth

| Variable | Required | Used by | Purpose |
| --- | --- | --- | --- |
| `GOOGLE_CLIENT_ID` | Optional | `src/lib/auth.ts` | Enables Google OAuth provider |
| `GOOGLE_CLIENT_SECRET` | Optional | `src/lib/auth.ts` | Enables Google OAuth provider |
| `NEXT_PUBLIC_GOOGLE_AUTH_ENABLED` | Optional | login/register pages | Controls whether Google auth UI appears |

## EC-Share License JWT

| Variable | Required | Used by | Purpose |
| --- | --- | --- | --- |
| `LICENSE_JWT_PRIVATE_KEY_PEM` | Yes | `src/lib/license-jwt.ts`, `src/app/api/v1/license/jwks/route.ts` | Ed25519 private key for license JWT signing and public JWKS derivation |
| `LICENSE_JWT_KEY_ID` | Yes | `src/lib/license-jwt.ts`, JWKS route | JWT/JWKS key ID |
| `LICENSE_JWT_ISSUER` | Yes | `src/lib/license-jwt.ts` | Expected JWT issuer |
| `LICENSE_JWT_AUDIENCE` | Yes | `src/lib/license-jwt.ts` | Expected JWT audience |

## Downloads

| Variable | Required | Used by | Purpose |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_EC_SHARE_WINDOWS_DOWNLOAD_URL` | Optional | download page | Browser-facing installer URL |
| `NEXT_PUBLIC_EC_SHARE_DOWNLOAD_MANIFEST_URL` | Optional | download page and manifest API | Browser-facing updater manifest URL |
| `EC_SHARE_DOWNLOAD_MANIFEST_URL` | Optional | `GET /api/v1/download/latest-manifest` | Server override for manifest URL |
| `EC_SHARE_DOWNLOAD_CHANNEL` | Optional | `GET /api/v1/download/latest-manifest` | Release channel, defaults to `stable` |

## Email

| Variable | Required | Used by | Purpose |
| --- | --- | --- | --- |
| `RESEND_API_KEY` | Required in production for OTP/email | `src/lib/email/send.ts`, OTP/contact routes | Resend API key |
| `AUTH_EMAIL_FROM` | Recommended | `src/lib/email/send.ts` | From address for OTP emails |
| `CONTACT_EMAIL_TO` | Optional | `src/lib/email/send.ts` | Contact form recipient |

## Rate Limiting And JWT Revocation

| Variable | Required | Used by | Purpose |
| --- | --- | --- | --- |
| `UPSTASH_REDIS_REST_URL` | Recommended in production | `src/lib/rate-limit.ts`, `src/lib/license-jwt-revocation.ts` | Upstash Redis REST URL |
| `UPSTASH_REDIS_REST_TOKEN` | Recommended in production | `src/lib/rate-limit.ts`, `src/lib/license-jwt-revocation.ts` | Upstash Redis REST token |

If Redis is not configured, rate limits use in-memory storage and JWT revocation is not enforced across instances.

## Stripe

| Variable | Required | Used by | Purpose |
| --- | --- | --- | --- |
| `STRIPE_SECRET_KEY` | Yes | `src/lib/stripe.ts`, Stripe actions/webhooks | Stripe server secret key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Yes | `src/lib/stripe-client.ts` | Stripe browser publishable key |
| `STRIPE_WEBHOOK_SECRET` | Yes | `src/lib/stripe-webhook.ts` | Stripe webhook signing secret |
| `NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID` | Yes for canonical catalog | `src/lib/stripe-catalog.ts` | Pro monthly Price ID |
| `NEXT_PUBLIC_STRIPE_PRO_ANNUAL_PRICE_ID` | Yes for canonical catalog | `src/lib/stripe-catalog.ts` | Pro annual Price ID |
| `NEXT_PUBLIC_STRIPE_BUSINESS_MONTHLY_PRICE_ID` | Yes for canonical catalog | `src/lib/stripe-catalog.ts` | Business monthly Price ID |
| `NEXT_PUBLIC_STRIPE_BUSINESS_ANNUAL_PRICE_ID` | Yes for canonical catalog | `src/lib/stripe-catalog.ts` | Business annual Price ID |
| `NEXT_PUBLIC_STRIPE_ENTERPRISE_ANNUAL_PRICE_ID` | Recommended | `src/lib/stripe-catalog.ts` | Enterprise annual Price ID |
| `NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID` | Legacy fallback | `src/lib/stripe-catalog.ts` | Legacy/fallback Price ID |
| `NEXT_PUBLIC_STRIPE_PRO_PRICE_ID` | Legacy fallback | `src/lib/stripe-catalog.ts` | Legacy/fallback Pro Price ID |
| `NEXT_PUBLIC_STRIPE_BIZ_PRICE_ID` | Legacy fallback | `src/lib/stripe-catalog.ts` | Legacy/fallback Business Price ID |

## Bot Protection

| Variable | Required | Used by | Purpose |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Recommended if web registration is enabled | register page | Cloudflare Turnstile site key |
| `TURNSTILE_SECRET_KEY` | Recommended if web registration is enabled | `POST /api/auth/register` | Cloudflare Turnstile verification secret |
| `RECAPTCHA_SECRET_KEY` | Not used by discovered backend code | legacy `.env.example` only | Legacy/unused candidate |
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | Not used by discovered backend code | legacy `.env.example` only | Legacy/unused candidate |

## AI Chat

| Variable | Required | Used by | Purpose |
| --- | --- | --- | --- |
| `OPENROUTER_API_KEY` | Optional unless `/api/chat` is enabled | `src/app/api/chat/route.ts` | OpenRouter API key |

## Runtime / CI

| Variable | Required | Used by | Purpose |
| --- | --- | --- | --- |
| `NODE_ENV` | Runtime-provided | multiple files | Production/dev branching |
| `CI` | CI-provided | Playwright config | Test behavior |

## Notes For Migration

- Do not commit real values.
- Do not copy legacy `.env.local`.
- Keep public `NEXT_PUBLIC_*` values limited to non-secret identifiers.
- Treat `LICENSE_JWT_PRIVATE_KEY_PEM`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `RESEND_API_KEY`, Upstash tokens, Google secrets, and `NEXTAUTH_SECRET` as sensitive.
- Confirm whether `RECAPTCHA_*` should be deleted or replaced by Turnstile-only configuration.
