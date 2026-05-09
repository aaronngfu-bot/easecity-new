-- Existing Neon databases were created before Prisma migrations were baselined.
-- Keep this migration additive/idempotent so it can safely patch those databases
-- after marking the foundation migration as already applied.

-- Patch EmailOtpChallenge from the pre-migration schema shape.
ALTER TABLE "EmailOtpChallenge"
ADD COLUMN IF NOT EXISTS "purpose" TEXT NOT NULL DEFAULT 'login';

-- CreateIndex
CREATE INDEX IF NOT EXISTS "EmailOtpChallenge_email_purpose_createdAt_idx"
ON "EmailOtpChallenge"("email", "purpose", "createdAt");

-- CreateTable
CREATE TABLE IF NOT EXISTS "StripeWebhookEvent" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'processing',
    "error" TEXT,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StripeWebhookEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "StripeWebhookEvent_eventId_key" ON "StripeWebhookEvent"("eventId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "StripeWebhookEvent_status_idx" ON "StripeWebhookEvent"("status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "StripeWebhookEvent_type_idx" ON "StripeWebhookEvent"("type");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "StripeWebhookEvent_createdAt_idx" ON "StripeWebhookEvent"("createdAt");
