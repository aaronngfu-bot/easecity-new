#!/usr/bin/env node

import dotenv from 'dotenv'
import Stripe from 'stripe'

dotenv.config({ path: '.env', quiet: true })
dotenv.config({ path: '.env.local', override: true, quiet: true })

const EC_SHARE = 'ec_share'
const TIERS = new Set(['pro', 'business', 'enterprise'])

function collectCheckoutPriceIds() {
  const ids = [
    process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID,
    process.env.NEXT_PUBLIC_STRIPE_PRO_ANNUAL_PRICE_ID,
    process.env.NEXT_PUBLIC_STRIPE_BUSINESS_MONTHLY_PRICE_ID,
    process.env.NEXT_PUBLIC_STRIPE_BUSINESS_ANNUAL_PRICE_ID,
    process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_ANNUAL_PRICE_ID,
    process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID,
    process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID,
    process.env.NEXT_PUBLIC_STRIPE_BIZ_PRICE_ID,
  ].filter((id) => typeof id === 'string' && id.startsWith('price_'))

  return [...new Set(ids)]
}

async function main() {
  const secretKey = process.env.STRIPE_SECRET_KEY

  if (!secretKey) {
    console.error('STRIPE_SECRET_KEY is not set; cannot verify Stripe catalog.')
    process.exit(1)
  }

  const priceIds = collectCheckoutPriceIds()

  if (priceIds.length === 0) {
    console.error('No NEXT_PUBLIC_STRIPE_* price_ IDs found in environment.')
    process.exit(1)
  }

  const stripe = new Stripe(secretKey)
  let failed = false

  console.log(`Stripe catalog verify (${priceIds.length} price ID(s))\n`)

  for (const priceId of priceIds) {
    try {
      const price = await stripe.prices.retrieve(priceId)
      const meta = price.metadata || {}
      const productSlug = meta.product
      const tier = meta.tier

      const issues = []
      if (productSlug !== EC_SHARE) {
        issues.push(`metadata.product="${productSlug ?? ''}" (expected "${EC_SHARE}")`)
      }
      if (!tier || !TIERS.has(tier)) {
        issues.push(`metadata.tier="${tier ?? ''}" (expected pro|business|enterprise)`)
      }

      if (issues.length > 0) {
        failed = true
        console.log(`FAIL ${priceId}`)
        for (const msg of issues) {
          console.log(`       ${msg}`)
        }
      } else {
        console.log(`ok   ${priceId}  product=${productSlug} tier=${tier}`)
      }
    } catch (e) {
      failed = true
      console.log(`FAIL ${priceId}  ${e instanceof Error ? e.message : e}`)
    }
  }

  console.log('')

  if (failed) {
    console.error(
      'Stripe catalog verification failed. Fix Price metadata in Stripe Dashboard (product=ec_share, tier=...).'
    )
    process.exit(1)
  }

  console.log('Stripe catalog verification passed.')
}

await main()
