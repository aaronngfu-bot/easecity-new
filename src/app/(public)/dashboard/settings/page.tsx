import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import SettingsClient from './SettingsClient'

function getPlanName(priceId: string): string {
  if (
    priceId === process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID ||
    priceId === process.env.NEXT_PUBLIC_STRIPE_PRO_ANNUAL_PRICE_ID ||
    priceId === process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID ||
    priceId === process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID
  ) return 'Pro'
  if (
    priceId === process.env.NEXT_PUBLIC_STRIPE_BUSINESS_MONTHLY_PRICE_ID ||
    priceId === process.env.NEXT_PUBLIC_STRIPE_BUSINESS_ANNUAL_PRICE_ID ||
    priceId === process.env.NEXT_PUBLIC_STRIPE_BIZ_PRICE_ID
  ) return 'Business'
  if (priceId === process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_ANNUAL_PRICE_ID) return 'Enterprise'
  return '訂閱方案'
}

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/login?callbackUrl=/dashboard/settings')

  const subscription = await prisma.subscription.findFirst({
    where: { userId: session.user.id, product: 'ec_share' },
    orderBy: { updatedAt: 'desc' },
  })

  const subscriptionInfo = subscription
    ? {
        status: subscription.status,
        planName: getPlanName(subscription.stripePriceId),
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        trialEnd: subscription.trialEnd?.toISOString() ?? null,
        currentPeriodEnd: subscription.currentPeriodEnd?.toISOString() ?? null,
      }
    : null

  return (
    <SettingsClient
      user={{
        name: session.user.name ?? null,
        email: session.user.email ?? null,
        role: session.user.role,
      }}
      subscription={subscriptionInfo}
    />
  )
}
