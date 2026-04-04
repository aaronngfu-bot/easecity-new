import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getStripe } from '@/lib/stripe'
import { withErrorHandler, AuthError } from '@/lib/api-handler'
import { apiSuccess, apiError } from '@/lib/api-response'

export const POST = withErrorHandler(async () => {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new AuthError()

  if (!process.env.STRIPE_SECRET_KEY) {
    return apiError('CONFIG_ERROR', 'Payment system is not configured', 503)
  }

  const stripe = getStripe()
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'

  const customers = await stripe.customers.list({
    email: session.user.email ?? undefined,
    limit: 1,
  })

  if (customers.data.length === 0) {
    return apiError('NOT_FOUND', 'No billing account found', 404)
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: customers.data[0].id,
    return_url: `${baseUrl}/dashboard`,
  })

  return apiSuccess({ portalUrl: portalSession.url })
})
