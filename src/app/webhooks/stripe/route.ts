import { handleStripeWebhook } from '@/lib/stripe-webhook'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  return handleStripeWebhook(req)
}
