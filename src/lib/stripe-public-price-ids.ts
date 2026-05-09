/**
 * Client-safe helpers for `NEXT_PUBLIC_*` Stripe Price IDs used by the pricing page.
 *
 * When the EC-Share monthly/annual env vars are unset, we fall back to legacy
 * `NEXT_PUBLIC_STRIPE_*_PRICE_ID` values so existing three-price Stripe configs keep working.
 *
 * If a fallback maps the wrong Stripe Price for your catalog, set the explicit
 * `NEXT_PUBLIC_STRIPE_PRO_*` / `BUSINESS_*` variables in `.env.local`.
 */
function pick(...candidates: (string | undefined)[]): string | undefined {
  for (const id of candidates) {
    if (typeof id === 'string' && id.startsWith('price_')) return id
  }
  return undefined
}

export function publicProMonthlyPriceId(): string | undefined {
  return pick(
    process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID,
    process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID
  )
}

export function publicProAnnualPriceId(): string | undefined {
  return pick(
    process.env.NEXT_PUBLIC_STRIPE_PRO_ANNUAL_PRICE_ID,
    process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID,
    process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID
  )
}

export function publicBusinessMonthlyPriceId(): string | undefined {
  return pick(
    process.env.NEXT_PUBLIC_STRIPE_BUSINESS_MONTHLY_PRICE_ID,
    process.env.NEXT_PUBLIC_STRIPE_BIZ_PRICE_ID
  )
}

export function publicBusinessAnnualPriceId(): string | undefined {
  return pick(
    process.env.NEXT_PUBLIC_STRIPE_BUSINESS_ANNUAL_PRICE_ID,
    process.env.NEXT_PUBLIC_STRIPE_BIZ_PRICE_ID
  )
}
