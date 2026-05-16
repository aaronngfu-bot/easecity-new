'use client'

import { motion } from 'framer-motion'
import { Check, ArrowRight, Star, Shield, Cpu, Building2, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/context/LanguageContext'
import type { T } from '@/i18n/translations'
import { useTransition, useState } from 'react'
import { getCheckoutSessionUrl } from '@/actions/stripe'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { CountUp } from '@/components/ui/CountUp'
import { MagneticButton } from '@/components/ui/MagneticButton'
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
      href: '/contact',
      highlighted: false,
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
}

export function PricingCards() {
  const { t } = useLanguage()
  const [billing, setBilling] = useState<BillingInterval>('annual')
  const plans = getPlans(t, billing)

  return (
    <section className="section-padding paper-section relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_70%_0%,rgba(0,229,204,0.16),transparent_46%)]" />

      <div className="container-max relative z-10">
        <div className="mb-10 flex justify-center">
          <div
            className="inline-flex gap-1 rounded-md border border-paper-border bg-paper-card p-1 shadow-paper"
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
                    ? 'bg-signal text-[#03100f]'
                    : 'text-paper-muted hover:text-paper-ink'
                )}
              >
                {value === 'monthly' ? t.pricingPage.monthly : t.pricingPage.annual}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          {plans.map((plan, i) => (
            <PricingCard key={i} plan={plan} index={i} whatsIncluded={t.pricingPage.whatsIncluded} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 text-center"
        >
          <p className="mb-6 text-sm text-paper-muted">{t.pricingPage.allPlansNote}</p>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-xs text-paper-muted">
            {[t.pricingPage.soc2, t.pricingPage.gdpr, t.pricingPage.iso, t.pricingPage.encryption].map((item) => (
              <div key={item} className="flex items-center gap-2 font-mono tracking-wide">
                <Shield size={12} className="text-signal" />
                {item}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function PricingCard({ plan, index, whatsIncluded }: { plan: PlanData; index: number; whatsIncluded: string }) {
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

  const CtaInner = (
    <>
      {isPending ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <>
          {plan.cta}
          <ArrowRight size={14} className="group-hover/cta:translate-x-1 transition-transform duration-200" />
        </>
      )}
    </>
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={cn(
        'relative group flex flex-col overflow-hidden rounded-lg border transition duration-200',
        plan.highlighted
          ? 'z-10 border-signal/40 bg-bg-surface text-text-primary shadow-panel xl:scale-105'
          : 'border-paper-border bg-paper-card text-paper-ink shadow-paper hover:border-signal/40'
      )}
    >
      {plan.highlighted && (
        <>
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-signal to-transparent z-10" />
          <div className="absolute right-4 top-4 z-10">
            <span className="signal-badge">{plan.badge}</span>
          </div>
        </>
      )}

      <div className="relative z-10 flex flex-1 flex-col p-6 md:p-7">
        <div className="mb-5 flex items-center justify-between">
          <span className={cn('font-mono text-[10px] uppercase tracking-[0.20em]', plan.highlighted ? 'text-text-muted' : 'text-paper-muted')}>
            PLAN.{String(index + 1).padStart(2, '0')}
          </span>
          <div
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-md border transition-colors',
              plan.highlighted
                ? 'border-signal/30 bg-signal/15 text-signal'
                : 'border-paper-border bg-paper-soft text-paper-muted group-hover:text-paper-ink'
            )}
          >
            <plan.icon size={18} />
          </div>
        </div>

        <h3 className={cn('font-display text-xl font-semibold tracking-[-0.03em]', plan.highlighted ? 'text-text-primary' : 'text-paper-ink')}>{plan.name}</h3>
        <p className={cn('mb-5 mt-1 font-mono text-xs tracking-wide', plan.highlighted ? 'text-text-muted' : 'text-paper-muted')}>{plan.tagline}</p>

        <div className="flex items-baseline gap-1 mb-2">
          <CountUp
            value={plan.price}
            duration={plan.highlighted ? 1100 : 900}
            trigger="key"
            triggerKey={plan.price}
            className={cn(
              'font-display text-4xl font-semibold tabular-nums tracking-[-0.04em]',
              plan.highlighted ? 'text-signal' : 'text-paper-ink'
            )}
          />
          {plan.period && <span className={cn('text-sm', plan.highlighted ? 'text-text-muted' : 'text-paper-muted')}>{plan.period}</span>}
        </div>
        <p className={cn('mb-6 text-sm leading-relaxed', plan.highlighted ? 'text-text-secondary' : 'text-paper-muted')}>{plan.description}</p>

        {plan.highlighted ? (
          <MagneticButton
            onClick={handleSubscribe}
            disabled={isPending}
            className="group/cta signal-cta mb-7 w-full disabled:cursor-not-allowed disabled:opacity-70"
            strength={10}
            radius={160}
          >
            {CtaInner}
          </MagneticButton>
        ) : (
          <button
            onClick={handleSubscribe}
            disabled={isPending}
            className="group/cta mb-7 flex min-h-11 w-full items-center justify-center gap-2 rounded-md border border-paper-border bg-paper-soft px-4 text-sm font-semibold text-paper-ink transition-colors hover:border-signal/40 hover:bg-paper-card disabled:cursor-not-allowed disabled:opacity-70"
          >
            {CtaInner}
          </button>
        )}

        <div className={cn('flex-1 border-t pt-6', plan.highlighted ? 'border-border/50' : 'border-paper-border')}>
          <p className={cn('mb-4 font-mono text-[10px] uppercase tracking-[0.16em]', plan.highlighted ? 'text-text-muted' : 'text-paper-muted')}>{whatsIncluded}</p>
          <ul className="space-y-3">
            {plan.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2.5">
                <Check
                  size={14}
                  className={cn(
                    'mt-0.5 shrink-0',
                    plan.highlighted ? 'text-signal' : 'text-signal'
                  )}
                />
                <span className={cn('text-sm leading-relaxed', plan.highlighted ? 'text-text-secondary' : 'text-paper-muted')}>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  )
}
