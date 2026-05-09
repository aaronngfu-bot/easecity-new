# Prisma migrations

## 20260427172000_ec_share_m2_foundation

Baseline migration for the current EaseCity web schema after the EC-Share M2 backend work.

It includes:

- Existing NextAuth, order, contact, chat, and audit-log tables.
- EC-Share M2 account/licensing tables: `Organization`, `OrgMember`, `EmailOtpChallenge`, `Trial`, and `Device`.
- Product-scoped subscriptions with `product`, `tier`, `seats`, optional `userId`, and optional `orgId`.

This migration is generated from the current Prisma schema as a baseline for new databases.
If a local database was already created with `prisma db push`, use Prisma's baseline/resolve workflow before applying migrations to that database.

## 20260505041000_stripe_webhook_events

Adds `StripeWebhookEvent`, a small persistent idempotency table keyed by Stripe `eventId`.

It is required before enabling Stripe webhooks in staging/production because the webhook handler records every processed event and ignores duplicate successful retries.

This migration is intentionally additive/idempotent for the existing Neon database:

- Adds `EmailOtpChallenge.purpose` if missing from a pre-baseline schema.
- Adds the `EmailOtpChallenge_email_purpose_createdAt_idx` index if missing.
- Creates `StripeWebhookEvent` and indexes if missing.
