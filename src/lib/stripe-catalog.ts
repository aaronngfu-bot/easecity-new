/**
 * Server-side allowlist for Checkout line_items. Public env vars only identify
 * which Stripe Price IDs are valid — never trust client-sent price IDs alone.
 */
export function getAllowedCheckoutPriceIds(): Set<string> {
  const ids = [
    process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID,
    process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID,
    process.env.NEXT_PUBLIC_STRIPE_BIZ_PRICE_ID,
  ].filter((id): id is string => typeof id === 'string' && id.length > 0 && id.startsWith('price_'))
  return new Set(ids)
}

export function assertCheckoutPriceIdAllowed(priceId: string): void {
  if (!getAllowedCheckoutPriceIds().has(priceId)) {
    throw new Error('Invalid plan selection')
  }
}
