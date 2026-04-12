/**
 * DEPRECATED: This REST endpoint is no longer used.
 * Billing portal is handled via the `createPortalSession` server action
 * in src/actions/stripe.ts, called directly from dashboard/settings/SettingsClient.tsx.
 *
 * Kept as a 410 stub to prevent accidental usage.
 */
import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json(
    { error: 'This endpoint is deprecated. Use the createPortalSession server action.' },
    { status: 410 }
  )
}
