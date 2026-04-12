import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import SettingsClient from './SettingsClient'

function getPlanName(priceId: string): string {
  if (priceId === process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID) return 'Starter'
  if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID) return 'Pro'
  if (priceId === process.env.NEXT_PUBLIC_STRIPE_BIZ_PRICE_ID) return 'Business'
  return '訂閱方案'
}

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/login?callbackUrl=/dashboard/settings')

  const subscription = await prisma.subscription.findUnique({
    where: { userId: session.user.id },
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
