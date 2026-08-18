'use client'

import { Check, ArrowRight, Star, Shield, Cpu, Building2, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/context/LanguageContext'
import type { T } from '@/i18n/translations'
import { useTransition, useState } from 'react'
import { getCheckoutSessionUrl } from '@/actions/stripe'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import {
  publicBusinessAnnualPriceId,
  publicBusinessMonthlyPriceId,
  publicProAnnualPriceId,
  publicProMonthlyPriceId,
} from '@/lib/stripe-public-price-ids'

type BillingInterval = 'monthly' | 'annual'

function getPlans(t: T, billing: BillingInterval) {
  const isAnnual = billing === 'annual'

  return [
    {
      name: t.pricingPage.trialName,
      icon: Cpu,
      tagline: t.pricingPage.trialTag,
      price: t.pricingPage.trialPrice,
      period: '',
      description: t.pricingPage.trialDesc,
      features: [t.pricingPage.trialF1, t.pricingPage.trialF2, t.pricingPage.trialF3, t.pricingPage.trialF4, t.pricingPage.trialF5],
      cta: t.pricingPage.startTrial,
      href: '/register?callbackUrl=/dashboard',
      highlighted: false,
    },
    {
      name: t.pricingPage.proName,
      icon: Star,
      tagline: t.pricingPage.proTag,
      price: isAnnual ? '$190' : '$19',
      period: isAnnual ? t.pricingPage.perYear : t.pricingPage.perMonth,
      description: t.pricingPage.proDesc,
      features: [t.pricingPage.proF1, t.pricingPage.proF2, t.pricingPage.proF3, t.pricingPage.proF4, t.pricingPage.proF5, t.pricingPage.proF6, t.pricingPage.proF7, t.pricingPage.proF8],
      cta: t.pricingPage.subscribeNow,
      priceId: isAnnual ? publicProAnnualPriceId() : publicProMonthlyPriceId(),
      highlighted: true,
      badge: t.pricingPage.mostPopular,
    },
    {
      name: t.pricingPage.bizName,
      icon: Shield,
      tagline: t.pricingPage.bizTag,
      price: isAnnual ? '$490' : '$49',
      period: isAnnual ? t.pricingPage.perYear : t.pricingPage.perMonth,
      description: t.pricingPage.bizDesc,
      features: [t.pricingPage.bizF1, t.pricingPage.bizF2, t.pricingPage.bizF3, t.pricingPage.bizF4, t.pricingPage.bizF5, t.pricingPage.bizF6, t.pricingPage.bizF7, t.pricingPage.bizF8, t.pricingPage.bizF9],
      cta: t.pricingPage.subscribeNow,
      priceId: isAnnual ? publicBusinessAnnualPriceId() : publicBusinessMonthlyPriceId(),
      highlighted: false,
    },
    {
      name: t.pricingPage.entName,
      icon: Building2,
      tagline: t.pricingPage.entTag,
      price: t.pricingPage.entPrice,
      period: '',
      description: t.pricingPage.entDesc,
      features: [t.pricingPage.entF1, t.pricingPage.entF2, t.pricingPage.entF3, t.pricingPage.entF4, t.pricingPage.entF5, t.pricingPage.entF6, t.pricingPage.entF7, t.pricingPage.entF8, t.pricingPage.entF9],
      cta: t.pricingPage.contactSales,
      href: '/about#contact',
      highlighted: false,
      contactCard: true,
    },
  ]
}

interface PlanData {
  name: string
  icon: React.ElementType
  tagline: string
  price: string
  period: string
  description: string
  features: string[]
  cta: string
  priceId?: string
  href?: string
  highlighted: boolean
  badge?: string
  contactCard?: boolean
}

export function PricingCards() {
  const { t } = useLanguage()
  const [billing, setBilling] = useState<BillingInterval>('annual')
  const plans = getPlans(t, billing)

  return (
    <section className="section-padding relative">
      <div className="container-max">
        <div className="mb-10 flex justify-center">
          <div
            className="inline-flex gap-1 rounded-md border border-[var(--border-color)] bg-[var(--bg-surface)] p-1"
            role="radiogroup"
            aria-label="Billing interval"
          >
            {(['monthly', 'annual'] as const).map((value) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={billing === value}
                onClick={() => setBilling(value)}
                className={cn(
                  'rounded-md px-4 py-2 text-sm font-semibold transition-colors',
                  billing === value
                    ? 'bg-[var(--signal)] text-[var(--signal-ink)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                )}
              >
                {value === 'monthly' ? t.pricingPage.monthly : t.pricingPage.annual}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {plans.map((plan, i) => (
            <PricingCard key={i} plan={plan} whatsIncluded={t.pricingPage.whatsIncluded} />
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="mb-6 text-sm text-[var(--text-muted)]">{t.pricingPage.allPlansNote}</p>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-xs text-[var(--text-muted)]">
            {[t.pricingPage.soc2, t.pricingPage.gdpr, t.pricingPage.iso, t.pricingPage.encryption].map((item) => (
              <div key={item} className="flex items-center gap-2 font-mono tracking-wide">
                <Shield size={12} className="text-[var(--signal)]" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function PricingCard({ plan, whatsIncluded }: { plan: PlanData; whatsIncluded: string }) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const { t } = useLanguage()
  const { data: session } = useSession()

  const handleSubscribe = () => {
    if (plan.href) {
      router.push(plan.href)
      return
    }
    if (!plan.priceId) return
    if (!session) {
      router.push('/register?callbackUrl=/pricing')
      return
    }
    startTransition(async () => {
      try {
        const url = await getCheckoutSessionUrl(plan.priceId!)
        window.open(url, '_blank', 'noopener,noreferrer')
      } catch (err) {
        console.error(err)
        alert(t.errors?.unexpectedError || 'An error occurred. Please try again.')
      }
    })
  }

  return (
    <div
      className={cn(
        'relative flex flex-col rounded-xl border transition',
        plan.highlighted
          ? 'border-[var(--signal)] bg-[var(--bg-surface)] shadow-[0_0_0_1px_var(--signal),0_8px_30px_-12px_var(--signal)]'
          : 'border-[var(--border-color)] bg-[var(--bg-surface)] hover:border-[var(--signal)]'
      )}
    >
      {plan.highlighted && (
        <div className="absolute left-1/2 top-4 z-20 -translate-x-1/2">
          <span className="badge bg-[var(--signal)] text-[var(--signal-ink)] border-[var(--signal)]">
            {plan.badge}
          </span>
        </div>
      )}

      <div className={cn('flex flex-1 flex-col p-6 md:p-7', plan.highlighted && 'pt-14')}>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--signal-soft)] text-[var(--signal)]">
            <plan.icon size={18} />
          </div>
        </div>

        <h3 className="font-display text-xl font-semibold text-[var(--text-primary)]">{plan.name}</h3>
        <p className="mb-5 mt-1 text-sm text-[var(--text-muted)]">{plan.tagline}</p>

        <div className="mb-2 flex items-baseline gap-1 min-h-[3rem]">
          {plan.contactCard ? (
            <span className="font-display text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
              {plan.price}
            </span>
          ) : (
            <span className={cn('font-display text-4xl font-semibold tabular-nums tracking-tight', plan.highlighted ? 'text-[var(--signal)]' : 'text-[var(--text-primary)]')}>
              {plan.price}
            </span>
          )}
          {plan.period && <span className="text-sm text-[var(--text-muted)]">{plan.period}</span>}
        </div>
        <p className="mb-6 text-sm leading-relaxed text-[var(--text-secondary)]">{plan.description}</p>

        <button
          onClick={handleSubscribe}
          disabled={isPending}
          className={cn(
            'mb-7 flex min-h-11 w-full items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-70',
            plan.contactCard
              ? 'bg-[var(--signal)] text-[var(--signal-ink)] hover:bg-[var(--signal-light)]'
              : plan.highlighted
                ? 'bg-[var(--signal)] text-[var(--signal-ink)] hover:bg-[var(--signal-light)]'
                : 'border border-[var(--border-color)] bg-[var(--bg-elevated)] text-[var(--text-primary)] hover:border-[var(--signal)] hover:text-[var(--signal)]'
          )}
        >
          {isPending ? <Loader2 size={16} className="animate-spin" /> : (
            <>
              {plan.cta}
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </>
          )}
        </button>

        <div className="flex-1 border-t border-[var(--border-color)] pt-6">
          <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--text-muted)]">{whatsIncluded}</p>
          <ul className="space-y-3">
            {plan.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2.5">
                <Check size={14} className="mt-0.5 shrink-0 text-[var(--signal)]" />
                <span className="text-sm leading-relaxed text-[var(--text-secondary)]">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
