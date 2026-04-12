/**
 * DEPRECATED: This REST endpoint is no longer used.
 * Checkout is handled via the `createCheckoutSession` server action
 * in src/actions/stripe.ts, called directly from PricingCards.tsx.
 *
 * Kept as a 410 stub to prevent accidental usage.
 */
import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json(
    { error: 'This endpoint is deprecated. Use the createCheckoutSession server action.' },
    { status: 410 }
  )
}
