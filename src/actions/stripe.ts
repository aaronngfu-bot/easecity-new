'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getStripe } from '@/lib/stripe'
import { redirect } from 'next/navigation'

export async function createCheckoutSession(priceId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  const userId = session.user.id
  const stripe = getStripe()

  // 1. Get or create Stripe Customer
  let user = await prisma.user.findUnique({
    where: { id: userId },
    include: { subscriptions: true },
  })

  if (!user) {
    throw new Error('User not found')
  }

  let stripeCustomerId = user.stripeCustomerId

  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name || undefined,
      metadata: {
        userId,
      },
    })
    stripeCustomerId = customer.id
    await prisma.user.update({
      where: { id: userId },
      data: { stripeCustomerId },
    })
  }

  // 2. Check if eligible for trial (only for Starter plan & never had a subscription)
  const isStarterPlan = priceId === process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID
  const hasHadSubscription = user.subscriptions && user.subscriptions.length > 0
  const isEligibleForTrial = isStarterPlan && !hasHadSubscription

  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'

  // 3. Create Checkout Session
  const checkoutSession = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: stripeCustomerId,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: `${baseUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/payment/cancel`,
    subscription_data: {
      metadata: {
        userId,
      },
      ...(isEligibleForTrial && {
        trial_period_days: 3,
      }),
    },
    metadata: {
      userId,
    },
  })

  if (!checkoutSession.url) {
    throw new Error('Could not create checkout session')
  }

  // Redirect to Stripe Checkout
  redirect(checkoutSession.url)
}

export async function createPortalSession() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  const userId = session.user.id
  const stripe = getStripe()

  const user = await prisma.user.findUnique({
    where: { id: userId },
  })

  if (!user || !user.stripeCustomerId) {
    throw new Error('User has no active subscriptions')
  }

  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${baseUrl}/dashboard/settings`,
  })

  redirect(portalSession.url)
}
