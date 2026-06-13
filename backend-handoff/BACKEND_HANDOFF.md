# Backend Handoff

This handoff summarizes the legacy EaseCity / EC-Share backend for migration into a new Next.js / Vercel project.

No secrets are included. Do not copy real `.env`, `.env.local`, build outputs, logs, or dependency folders.

## Source Project

- Framework: Next.js App Router, `next@14.2.35`
- Runtime: Node.js on Next.js route handlers / server actions
- Language: TypeScript
- Database: PostgreSQL through Prisma
- Auth: NextAuth for web sessions; custom Ed25519 license JWT for EC-Share desktop/native API
- Payments: Stripe Checkout, Billing Portal, webhooks
- Email: Resend
- Rate limiting / JWT deny-list: Upstash Redis when configured, in-memory fallback otherwise
- AI chat: OpenRouter through Vercel AI SDK

## Backend Structure

Safe to port:

- `src/app/api/**/route.ts` - API route handlers
- `src/app/webhooks/stripe/route.ts` - alternate Stripe webhook route
- `src/actions/stripe.ts` - Stripe Checkout and Billing Portal server actions
- `src/lib/api-response.ts` - standard JSON envelope helpers
- `src/lib/api-handler.ts` - error wrapper and typed API errors
- `src/lib/auth.ts` - NextAuth options
- `src/lib/db.ts` - Prisma singleton
- `src/lib/rate-limit.ts` - Upstash/in-memory rate limiter
- `src/lib/rate-limit-policy.ts` - shared rate limit constants
- `src/lib/permissions.ts` - admin role helpers
- `src/lib/license-jwt.ts` - EC-Share license JWT signing/verification
- `src/lib/license-jwt-revocation.ts` - Redis JWT deny-list
- `src/lib/ec-share-license.ts` - entitlement resolution and license issuing
- `src/lib/email/send.ts` - Resend contact/OTP email helpers
- `src/lib/stripe.ts` - server Stripe client
- `src/lib/stripe-client.ts` - browser Stripe client
- `src/lib/stripe-catalog.ts` - Stripe price allowlist and tier mapping
- `src/lib/stripe-public-price-ids.ts` - public price ID fallback helpers
- `src/lib/stripe-webhook.ts` - Stripe webhook processing
- `src/lib/audit.ts` - audit log writer
- `src/lib/validations/contact.ts` - contact form Zod schema
- `src/lib/validations/ec-share.ts` - EC-Share API Zod schemas
- `src/types/next-auth.d.ts` - NextAuth session/JWT type augmentation
- `prisma/schema.prisma` - database schema

Needs adaptation before porting:

- `src/middleware.ts` - legacy page redirects target `/login`, `/dashboard`, `/admin`; new UI route strategy differs.
- `next.config.mjs` - global security headers may be reusable, but project-specific package optimizations may not be needed.
- `src/app/(public)/download/page.tsx` - frontend page, not backend; contains legacy download URL assumptions.
- `src/app/sitemap.ts`, `src/app/robots.ts` - SEO defaults assume legacy domains and routes.
- `scripts/dev/*.mjs` - useful developer scripts, not runtime backend files.

Do not port:

- `.env`, `.env.local`, `.env.*` with real values
- `.next/`
- `node_modules/`
- `coverage/`
- `playwright-report/`
- `test-results/`
- logs such as `*.log`
- local terminal/session files
- generated Prisma client output
- any private key files, certificate files, exported Stripe/Resend/Google/Upstash credentials

## Database And Storage

The backend depends on a PostgreSQL database through Prisma.

Models in `prisma/schema.prisma`:

- `User`
- `Organization`
- `OrgMember`
- `EmailOtpChallenge`
- `Account`
- `Session`
- `VerificationToken`
- `Order`
- `Subscription`
- `StripeWebhookEvent`
- `Trial`
- `Device`
- `ContactSubmission`
- `Conversation`
- `Message`
- `AuditLog`

No object storage SDK or bucket integration was found. Download artifacts are assumed to live outside the app, behind `dl.easecity.hk` or a replacement CDN.

## Dependency Check

- Database: yes, PostgreSQL via Prisma.
- Redis: yes for production-safe rate limiting and JWT revocation; in-memory fallback exists but is not multi-instance safe.
- Email provider: yes, Resend.
- File storage: no direct storage integration found.
- Cron: no runtime cron jobs found.
- WebSocket: no implemented backend WebSocket server found. WebSocket/share infrastructure appears in roadmap docs only.
- Long-running server: no custom long-running server found; uses Next.js request handlers/server actions.
- Local filesystem writes: runtime backend does not appear to write local files. Developer scripts may append to `.env` when explicitly run; do not port those as runtime code.

## Core Business Logic

- Auth/session: `src/lib/auth.ts`
- License JWT signing and verification: `src/lib/license-jwt.ts`
- License entitlement/trial/subscription resolution: `src/lib/ec-share-license.ts`
- JWT revocation: `src/lib/license-jwt-revocation.ts`
- Rate limiting: `src/lib/rate-limit.ts`, `src/lib/rate-limit-policy.ts`
- Stripe Checkout/Portal: `src/actions/stripe.ts`
- Stripe webhook subscription/order updates: `src/lib/stripe-webhook.ts`
- Stripe catalog/tiers: `src/lib/stripe-catalog.ts`
- Email delivery: `src/lib/email/send.ts`
- Admin permissions: `src/lib/permissions.ts`
- Audit logging: `src/lib/audit.ts`
- API response/error conventions: `src/lib/api-response.ts`, `src/lib/api-handler.ts`

## Validation / Schema Files

- Runtime request validation:
  - `src/lib/validations/contact.ts`
  - `src/lib/validations/ec-share.ts`
  - Inline Zod schemas in `src/app/api/auth/register/route.ts`
  - Inline Zod schemas in `src/app/api/chat/route.ts`
  - Inline Zod schemas in `src/app/api/admin/users/[id]/route.ts`
- Database schema:
  - `prisma/schema.prisma`

## Hardcoded Domains / Legacy URLs

Replace or confirm before production migration:

- `https://api.easecity.hk` - default license JWT issuer
- `https://dl.easecity.hk/ec-share/windows/stable/latest.json` - default EC-Share updater manifest
- `https://easecity.com` - sitemap/robots/metadata fallback
- `https://easecity.hk/api/auth/callback/google` - documented Google OAuth redirect in `.env.example`
- `https://challenges.cloudflare.com/turnstile/v0/siteverify` - Cloudflare Turnstile API
- `https://openrouter.ai/api/v1` - chat completion provider
- Stripe webhook comments mention `/webhooks/stripe` and `/api/payment/webhook`
- Roadmap/docs mention `share.easecity.hk`, `account.easecity.hk`, and `admin.easecity.hk`; these are not fully implemented backend surfaces in code.

## Migration Notes

1. Start by porting Prisma schema and backend libraries.
2. Port API route handlers after the new project confirms route prefixes and auth/session domain strategy.
3. Choose one canonical Stripe webhook path. Prefer `/webhooks/stripe` if matching the legacy comments, or document a new canonical path.
4. Do not reuse deprecated payment REST routes except as compatibility stubs.
5. Confirm CORS and cookie/session strategy if the new UI and backend are on different domains.
6. Configure Upstash Redis in production before enabling rate-limited public endpoints.
7. Replace all legacy hardcoded domains with new env-driven values where possible.
