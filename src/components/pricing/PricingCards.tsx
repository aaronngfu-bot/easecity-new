'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Check, ArrowRight, Star, Shield, Cpu, Building2, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/context/LanguageContext'
import type { T } from '@/i18n/translations'
import { useState, useTransition } from 'react'
import { createCheckoutSession } from '@/actions/stripe'
import { useRouter } from 'next/navigation'

function getPlans(t: T) {
  return [
    {
      name: t.pricingPage.starterName,
      icon: Cpu,
      tagline: t.pricingPage.starterTag,
      price: '$49',
      period: t.pricingPage.perMonth,
      description: t.pricingPage.starterDesc,
      features: [t.pricingPage.starterF1, t.pricingPage.starterF2, t.pricingPage.starterF3, t.pricingPage.starterF4, t.pricingPage.starterF5, t.pricingPage.starterF6, t.pricingPage.starterF7],
      cta: t.pricingPage.startTrial,
      priceId: process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID || 'price_starter_mock',
      highlighted: false,
      glowColor: 'from-text-muted/5 to-transparent',
    },
    {
      name: t.pricingPage.proName,
      icon: Star,
      tagline: t.pricingPage.proTag,
      price: '$149',
      period: t.pricingPage.perMonth,
      description: t.pricingPage.proDesc,
      features: [t.pricingPage.proF1, t.pricingPage.proF2, t.pricingPage.proF3, t.pricingPage.proF4, t.pricingPage.proF5, t.pricingPage.proF6, t.pricingPage.proF7, t.pricingPage.proF8],
      cta: t.pricingPage.startTrial,
      priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || 'price_pro_mock',
      highlighted: true,
      badge: t.pricingPage.mostPopular,
      glowColor: 'from-accent-cyan/10 to-transparent',
    },
    {
      name: t.pricingPage.bizName,
      icon: Shield,
      tagline: t.pricingPage.bizTag,
      price: '$399',
      period: t.pricingPage.perMonth,
      description: t.pricingPage.bizDesc,
      features: [t.pricingPage.bizF1, t.pricingPage.bizF2, t.pricingPage.bizF3, t.pricingPage.bizF4, t.pricingPage.bizF5, t.pricingPage.bizF6, t.pricingPage.bizF7, t.pricingPage.bizF8, t.pricingPage.bizF9],
      cta: t.pricingPage.startTrial,
      priceId: process.env.NEXT_PUBLIC_STRIPE_BIZ_PRICE_ID || 'price_biz_mock',
      highlighted: false,
      glowColor: 'from-accent-purple/8 to-transparent',
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
      glowColor: 'from-text-muted/5 to-transparent',
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
  glowColor: string
}

export function PricingCards() {
  const { t } = useLanguage()
  const plans = getPlans(t)

  return (
    <section className="section-padding relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-bg-surface/30 to-bg-base pointer-events-none" />

      <div className="container-max relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
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
          <p className="text-text-muted text-sm mb-6">
            {t.pricingPage.allPlansNote}
          </p>
          <div className="flex flex-wrap justify-center gap-8 text-xs text-text-muted">
            {[t.pricingPage.soc2, t.pricingPage.gdpr, t.pricingPage.iso, t.pricingPage.encryption].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <Shield size={12} className="text-accent-cyan/60" />
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

  const handleSubscribe = () => {
    if (plan.href) {
      router.push(plan.href)
      return
    }

    if (!plan.priceId) return

    startTransition(async () => {
      try {
        await createCheckoutSession(plan.priceId!)
      } catch (err) {
        // If unauthorized, redirect to login
        if (err instanceof Error && err.message === 'Unauthorized') {
          router.push('/login?callbackUrl=/pricing')
        } else {
          console.error(err)
          alert(t.errors?.unexpectedError || 'An error occurred. Please try again.')
        }
      }
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={cn(
        'relative group rounded-2xl border transition-all duration-300 overflow-hidden flex flex-col',
        plan.highlighted
          ? 'border-accent-cyan/40 bg-bg-surface shadow-glow-cyan-sm hover:shadow-glow-cyan hover:border-accent-cyan/60 scale-[1.02] xl:scale-105'
          : 'border-border bg-bg-surface hover:border-border hover:bg-bg-elevated'
      )}
    >
      {plan.highlighted && (
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-cyan to-transparent" />
      )}

      <div className={cn('absolute inset-0 bg-gradient-to-b pointer-events-none', plan.glowColor)} />

      <div className="relative z-10 p-7 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-4">
          <div className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center transition-colors',
            plan.highlighted ? 'bg-accent-cyan/15 text-accent-cyan' : 'bg-bg-elevated text-text-muted group-hover:text-text-secondary'
          )}>
            <plan.icon size={20} />
          </div>
          {plan.badge && (
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/25">
              {plan.badge}
            </span>
          )}
        </div>

        <h3 className="font-display text-xl font-bold text-text-primary">{plan.name}</h3>
        <p className="text-text-muted text-xs mt-1 mb-5">{plan.tagline}</p>

        <div className="flex items-baseline gap-1 mb-2">
          <span className={cn('font-display text-4xl font-bold', plan.highlighted ? 'text-accent-cyan' : 'text-text-primary')}>
            {plan.price}
          </span>
          {plan.period && <span className="text-text-muted text-sm">{plan.period}</span>}
        </div>
        <p className="text-text-secondary text-sm leading-relaxed mb-6">{plan.description}</p>

        <button
          onClick={handleSubscribe}
          disabled={isPending}
          className={cn(
            'group/cta w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold rounded-xl transition-all duration-200 mb-7 disabled:opacity-70 disabled:cursor-not-allowed',
            plan.highlighted
              ? 'bg-accent-cyan text-bg-base hover:bg-accent-cyan-light shadow-glow-cyan-sm hover:shadow-glow-cyan'
              : 'border border-border text-text-primary hover:border-accent-cyan/40 hover:bg-accent-cyan/5'
          )}
        >
          {isPending ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <>
              {plan.cta}
              <ArrowRight size={14} className="group-hover/cta:translate-x-1 transition-transform duration-200" />
            </>
          )}
        </button>

        <div className="border-t border-border pt-6 flex-1">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-4">{whatsIncluded}</p>
          <ul className="space-y-3">
            {plan.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2.5">
                <Check size={14} className={cn('mt-0.5 shrink-0', plan.highlighted ? 'text-accent-cyan' : 'text-text-muted')} />
                <span className="text-text-secondary text-sm leading-relaxed">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  )
}
