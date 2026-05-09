/**
 * Server-side allowlist for Checkout line_items. Public env vars only identify
 * which Stripe Price IDs are valid — never trust client-sent price IDs alone.
 */
export type CheckoutTier = 'pro' | 'business' | 'enterprise'

export const EC_SHARE_PRODUCT = 'ec_share'

const CHECKOUT_TIERS = ['pro', 'business', 'enterprise'] as const
const TIER_MINIMUM_SEATS: Record<CheckoutTier, number> = {
  pro: 1,
  business: 3,
  enterprise: 50,
}

export function isCheckoutTier(value: string): value is CheckoutTier {
  return CHECKOUT_TIERS.includes(value as CheckoutTier)
}

export function getAllowedCheckoutPriceIds(): Set<string> {
  const ids = [
    process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID,
    process.env.NEXT_PUBLIC_STRIPE_PRO_ANNUAL_PRICE_ID,
    process.env.NEXT_PUBLIC_STRIPE_BUSINESS_MONTHLY_PRICE_ID,
    process.env.NEXT_PUBLIC_STRIPE_BUSINESS_ANNUAL_PRICE_ID,
    process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_ANNUAL_PRICE_ID,
    // Legacy env names are accepted temporarily so existing local/dev Stripe
    // configs keep working while the dashboard is migrated to EC-Share tiers.
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

export function getTierForCheckoutPriceId(priceId: string): CheckoutTier {
  if (priceId === process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_ANNUAL_PRICE_ID) {
    return 'enterprise'
  }

  if (
    priceId === process.env.NEXT_PUBLIC_STRIPE_BUSINESS_MONTHLY_PRICE_ID ||
    priceId === process.env.NEXT_PUBLIC_STRIPE_BUSINESS_ANNUAL_PRICE_ID ||
    priceId === process.env.NEXT_PUBLIC_STRIPE_BIZ_PRICE_ID
  ) {
    return 'business'
  }

  if (
    priceId === process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID ||
    priceId === process.env.NEXT_PUBLIC_STRIPE_PRO_ANNUAL_PRICE_ID ||
    priceId === process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID ||
    priceId === process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID
  ) {
    return 'pro'
  }

  throw new Error('Unknown checkout price tier')
}

export function getMinimumSeatsForTier(tier: CheckoutTier): number {
  return TIER_MINIMUM_SEATS[tier]
}

export function normalizeSeatsForTier(
  tier: CheckoutTier,
  quantity: number | null | undefined
): number {
  const requestedSeats = typeof quantity === 'number' && quantity > 0 ? quantity : 1
  return Math.max(requestedSeats, getMinimumSeatsForTier(tier))
}
