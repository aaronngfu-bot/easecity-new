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
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionCancelled(subscription)
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

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.orderId
  if (!orderId) {
    console.error('[Stripe Webhook] No orderId in session metadata')
    return
  }

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

async function handleSubscriptionCancelled(subscription: Stripe.Subscription) {
  const order = await prisma.order.findFirst({
    where: { stripePaymentIntentId: subscription.id },
  })

  if (order) {
    await prisma.order.update({
      where: { id: order.id },
      data: { status: 'cancelled' },
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
