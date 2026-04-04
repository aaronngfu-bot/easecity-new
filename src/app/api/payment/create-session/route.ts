import { z } from 'zod'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getStripe } from '@/lib/stripe'
import { withErrorHandler, AuthError } from '@/lib/api-handler'
import { apiSuccess, apiError } from '@/lib/api-response'
import { prisma } from '@/lib/db'

const createSessionSchema = z.object({
  priceId: z.string().min(1),
  quantity: z.number().int().positive().default(1),
  mode: z.enum(['payment', 'subscription']).default('payment'),
})

export const POST = withErrorHandler(async (req) => {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new AuthError()

  if (!process.env.STRIPE_SECRET_KEY) {
    return apiError('CONFIG_ERROR', 'Payment system is not configured', 503)
  }

  const body = await req.json()
  const data = createSessionSchema.parse(body)
  const stripe = getStripe()

  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'

  const order = await prisma.order.create({
    data: {
      userId: session.user.id,
      status: 'created',
      amount: 0,
      currency: 'usd',
      items: JSON.stringify([{ priceId: data.priceId, quantity: data.quantity }]),
      metadata: JSON.stringify({ mode: data.mode }),
    },
  })

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: data.mode,
    line_items: [{ price: data.priceId, quantity: data.quantity }],
    success_url: `${baseUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/payment/cancel?order_id=${order.id}`,
    customer_email: session.user.email ?? undefined,
    metadata: {
      orderId: order.id,
      userId: session.user.id,
    },
    ...(data.mode === 'subscription' && {
      subscription_data: {
        metadata: {
          orderId: order.id,
          userId: session.user.id,
        },
      },
    }),
  })

  await prisma.order.update({
    where: { id: order.id },
    data: {
      stripeSessionId: checkoutSession.id,
      status: 'pending_payment',
    },
  })

  return apiSuccess({ sessionUrl: checkoutSession.url })
})
