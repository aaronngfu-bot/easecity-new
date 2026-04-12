import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getStripe } from '@/lib/stripe'
import { prisma } from '@/lib/db'
import { captureException } from '@/lib/error-tracking'

export async function POST(req: Request) {
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
    const stripe = getStripe()
    event = stripe.webhooks.constructEvent(
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

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionUpsert(subscription)
        break
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionDeleted(subscription)
        break
      }
      // Preserve old checkout handling for backward compatibility if needed temporarily
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutCompleted(session)
        break
      }
      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutExpired(session)
        break
      }
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        await handleInvoicePaid(invoice)
        break
      }
      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge
        await handleChargeRefunded(charge)
        break
      }
      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`)
    }
  } catch (err) {
    captureException(err, { action: `webhook.${event.type}` })
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }

  return NextResponse.json({ received: true })
}

// --- NEW SUBSCRIPTION LOGIC ---

async function handleSubscriptionUpsert(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string
  const user = await prisma.user.findUnique({
    where: { stripeCustomerId: customerId },
  })

  if (!user) {
    console.error(`[Stripe Webhook] User not found for customer: ${customerId}`)
    return
  }

  const priceId = subscription.items.data[0].price.id

  const trialEnd = subscription.trial_end
    ? new Date(subscription.trial_end * 1000)
    : null

  // In Stripe API 2026-03-25.dahlia, current_period_end moved to items.data[0]
  const itemPeriodEnd = subscription.items?.data?.[0]?.current_period_end
  const currentPeriodEnd =
    typeof itemPeriodEnd === 'number' && itemPeriodEnd > 0
      ? new Date(itemPeriodEnd * 1000)
      : trialEnd

  // In newer Stripe API, scheduled cancellation uses cancel_at instead of cancel_at_period_end
  const sub = subscription as unknown as Record<string, unknown>
  const hasCancelAt = typeof sub.cancel_at === 'number' && sub.cancel_at > 0
  const cancelAtPeriodEnd = subscription.cancel_at_period_end || hasCancelAt

  await prisma.subscription.upsert({
    where: { stripeSubscriptionId: subscription.id },
    create: {
      userId: user.id,
      stripeSubscriptionId: subscription.id,
      stripePriceId: priceId,
      status: subscription.status,
      cancelAtPeriodEnd,
      trialEnd,
      currentPeriodEnd,
    },
    update: {
      stripePriceId: priceId,
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
      status: subscription.status, // will be 'canceled'
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
  })
}

// --- LEGACY ORDER LOGIC (Kept for backward compatibility) ---

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.orderId
  if (!orderId) return

  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: 'paid',
      stripePaymentIntentId: (session.payment_intent as string) ?? (session.subscription as string) ?? null,
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

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const subField = (invoice as unknown as { subscription?: string | null }).subscription
  const subscriptionId = typeof subField === 'string' ? subField : null
  if (!subscriptionId) return

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
