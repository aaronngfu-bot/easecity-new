import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import Stripe from 'stripe'
import { prisma } from '@/lib/db'
import { captureException } from '@/lib/error-tracking'
import { getStripe } from '@/lib/stripe'
import {
  EC_SHARE_PRODUCT,
  getTierForCheckoutPriceId,
  isCheckoutTier,
  normalizeSeatsForTier,
} from '@/lib/stripe-catalog'

interface CustomerOwner {
  userId?: string
  orgId?: string
}

interface SubscriptionEntitlement {
  product: string
  tier: 'pro' | 'business' | 'enterprise'
  seats: number
  priceId: string
}

export async function handleStripeWebhook(req: Request) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: 'Payment system is not configured' },
      { status: 503 }
    )
  }

  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[Stripe Webhook] Signature verification failed:', message)
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    )
  }

  const dedupeResult = await startWebhookEvent(event)
  if (dedupeResult) {
    return dedupeResult
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpsert(event.data.object as Stripe.Subscription)
        break
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice)
        break
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice)
        break
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break
      case 'checkout.session.expired':
        await handleCheckoutExpired(event.data.object as Stripe.Checkout.Session)
        break
      case 'charge.refunded':
        await handleChargeRefunded(event.data.object as Stripe.Charge)
        break
      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`)
    }

    await markWebhookEventProcessed(event)
  } catch (err) {
    await markWebhookEventFailed(event, err)
    captureException(err, { action: `webhook.${event.type}` })
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }

  return NextResponse.json({ received: true, event_id: event.id })
}

async function startWebhookEvent(event: Stripe.Event): Promise<NextResponse | null> {
  const existing = await prisma.stripeWebhookEvent.findUnique({
    where: { eventId: event.id },
    select: { status: true },
  })

  if (existing?.status === 'processed') {
    console.log(`[Stripe Webhook] Duplicate event ignored: ${event.id}`)
    return NextResponse.json({
      received: true,
      duplicate: true,
      event_id: event.id,
    })
  }

  if (existing?.status === 'processing') {
    return NextResponse.json(
      { error: 'Webhook event is already processing', event_id: event.id },
      { status: 409 }
    )
  }

  try {
    if (existing?.status === 'failed') {
      await prisma.stripeWebhookEvent.update({
        where: { eventId: event.id },
        data: {
          type: event.type,
          status: 'processing',
          error: null,
          processedAt: null,
        },
      })
      return null
    }

    await prisma.stripeWebhookEvent.create({
      data: {
        eventId: event.id,
        type: event.type,
        status: 'processing',
      },
    })
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === 'P2002'
    ) {
      return NextResponse.json(
        { error: 'Webhook event is already recorded', event_id: event.id },
        { status: 409 }
      )
    }
    throw err
  }

  return null
}

async function markWebhookEventProcessed(event: Stripe.Event) {
  await prisma.stripeWebhookEvent.update({
    where: { eventId: event.id },
    data: {
      type: event.type,
      status: 'processed',
      error: null,
      processedAt: new Date(),
    },
  })
}

async function markWebhookEventFailed(event: Stripe.Event, err: unknown) {
  const message = err instanceof Error ? err.message : 'Unknown webhook error'

  await prisma.stripeWebhookEvent.update({
    where: { eventId: event.id },
    data: {
      type: event.type,
      status: 'failed',
      error: message.slice(0, 1000),
      processedAt: null,
    },
  })
}

async function handleSubscriptionUpsert(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string
  const owner = await findCustomerOwner(customerId)

  if (!owner) {
    console.error(`[Stripe Webhook] Owner not found for customer: ${customerId}`)
    return
  }

  const entitlement = resolveSubscriptionEntitlement(subscription)
  const trialEnd = subscription.trial_end
    ? new Date(subscription.trial_end * 1000)
    : null
  const currentPeriodEnd = getSubscriptionPeriodEnd(subscription) ?? trialEnd
  const cancelAtPeriodEnd = getCancelAtPeriodEnd(subscription)

  await prisma.subscription.upsert({
    where: { stripeSubscriptionId: subscription.id },
    create: {
      ...owner,
      product: entitlement.product,
      stripeSubscriptionId: subscription.id,
      stripePriceId: entitlement.priceId,
      tier: entitlement.tier,
      seats: entitlement.seats,
      status: subscription.status,
      cancelAtPeriodEnd,
      trialEnd,
      currentPeriodEnd,
    },
    update: {
      ...owner,
      stripePriceId: entitlement.priceId,
      product: entitlement.product,
      tier: entitlement.tier,
      seats: entitlement.seats,
      status: subscription.status,
      cancelAtPeriodEnd,
      trialEnd,
      currentPeriodEnd,
    },
  })
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  await prisma.subscription.updateMany({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      status: subscription.status,
      cancelAtPeriodEnd: getCancelAtPeriodEnd(subscription),
    },
  })
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const subscriptionId = getInvoiceSubscriptionId(invoice)

  if (!subscriptionId) {
    return
  }

  await prisma.subscription.updateMany({
    where: { stripeSubscriptionId: subscriptionId },
    data: { status: 'past_due' },
  })
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  const subscriptionId = getInvoiceSubscriptionId(invoice)

  if (subscriptionId) {
    await prisma.subscription.updateMany({
      where: { stripeSubscriptionId: subscriptionId },
      data: { status: 'active' },
    })
  }

  await updateLegacyOrderForPaidInvoice(invoice, subscriptionId)
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.orderId
  if (!orderId) return

  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: 'paid',
      stripePaymentIntentId:
        (session.payment_intent as string) ?? (session.subscription as string) ?? null,
      amount: session.amount_total ?? 0,
      currency: session.currency ?? 'usd',
    },
  })
}

async function handleCheckoutExpired(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.orderId
  if (!orderId) return

  await prisma.order.update({
    where: { id: orderId },
    data: { status: 'expired' },
  })
}

async function handleChargeRefunded(charge: Stripe.Charge) {
  const paymentIntentId = charge.payment_intent as string | null
  if (!paymentIntentId) return

  const order = await prisma.order.findFirst({
    where: { stripePaymentIntentId: paymentIntentId },
  })

  if (order) {
    await prisma.order.update({
      where: { id: order.id },
      data: { status: 'refunded' },
    })
  }
}

async function updateLegacyOrderForPaidInvoice(
  invoice: Stripe.Invoice,
  subscriptionId: string | null
) {
  if (!subscriptionId) {
    return
  }

  const order = await prisma.order.findFirst({
    where: { stripePaymentIntentId: subscriptionId },
  })

  if (order) {
    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: 'paid',
        amount: invoice.amount_paid,
        metadata: JSON.stringify({
          invoiceId: invoice.id,
        }),
      },
    })
  }
}

async function findCustomerOwner(customerId: string): Promise<CustomerOwner | null> {
  const user = await prisma.user.findUnique({
    where: { stripeCustomerId: customerId },
    select: { id: true },
  })

  if (user) {
    return { userId: user.id }
  }

  const organization = await prisma.organization.findUnique({
    where: { stripeCustomerId: customerId },
    select: { id: true },
  })

  if (organization) {
    return { orgId: organization.id }
  }

  return null
}

function resolveSubscriptionEntitlement(
  subscription: Stripe.Subscription
): SubscriptionEntitlement {
  const item = subscription.items.data[0]

  if (!item) {
    throw new Error(`Subscription ${subscription.id} has no items`)
  }

  const price = item.price
  const product =
    getMetadataValue(price.metadata, 'product') ??
    getMetadataValue(subscription.metadata, 'product') ??
    EC_SHARE_PRODUCT
  const metadataTier =
    getMetadataValue(price.metadata, 'tier') ??
    getMetadataValue(subscription.metadata, 'tier')
  const tier =
    metadataTier && isCheckoutTier(metadataTier)
      ? metadataTier
      : getTierForCheckoutPriceId(price.id)

  if (product !== EC_SHARE_PRODUCT) {
    throw new Error(`Unsupported Stripe product metadata: ${product}`)
  }

  return {
    product,
    tier,
    seats: normalizeSeatsForTier(tier, item.quantity),
    priceId: price.id,
  }
}

function getSubscriptionPeriodEnd(subscription: Stripe.Subscription): Date | null {
  const itemPeriodEnd = subscription.items?.data?.[0]?.current_period_end

  if (typeof itemPeriodEnd === 'number' && itemPeriodEnd > 0) {
    return new Date(itemPeriodEnd * 1000)
  }

  const sub = subscription as unknown as Record<string, unknown>
  const subscriptionPeriodEnd = sub.current_period_end

  if (typeof subscriptionPeriodEnd === 'number' && subscriptionPeriodEnd > 0) {
    return new Date(subscriptionPeriodEnd * 1000)
  }

  return null
}

function getCancelAtPeriodEnd(subscription: Stripe.Subscription): boolean {
  const sub = subscription as unknown as Record<string, unknown>
  const hasCancelAt = typeof sub.cancel_at === 'number' && sub.cancel_at > 0
  return subscription.cancel_at_period_end || hasCancelAt
}

function getInvoiceSubscriptionId(invoice: Stripe.Invoice): string | null {
  const invoiceRecord = invoice as unknown as {
    subscription?: string | null
    parent?: {
      subscription_details?: {
        subscription?: string | null
      } | null
    } | null
  }
  const directSubscription = invoiceRecord.subscription
  const parentSubscription =
    invoiceRecord.parent?.subscription_details?.subscription

  return directSubscription ?? parentSubscription ?? null
}

function getMetadataValue(
  metadata: Stripe.Metadata | null | undefined,
  key: string
): string | null {
  const value = metadata?.[key]
  return typeof value === 'string' && value.length > 0 ? value : null
}
