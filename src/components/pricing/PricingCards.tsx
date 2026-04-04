'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Check, ArrowRight, Star, Shield, Cpu, Building2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Plan {
  name: string
  icon: React.ElementType
  tagline: string
  price: string
  period: string
  description: string
  features: string[]
  cta: string
  href: string
  highlighted: boolean
  badge?: string
  glowColor: string
}

const plans: Plan[] = [
  {
    name: 'Starter',
    icon: Cpu,
    tagline: 'For small teams getting started',
    price: '$49',
    period: '/month',
    description:
      'Essential stream control for up to 5 endpoints. Ideal for small-scale deployments and proof-of-concept setups.',
    features: [
      '1 control hub',
      'Up to 5 endpoints',
      '720p stream quality',
      'Basic monitoring dashboard',
      'Email support',
      'Community access',
      '99.5% uptime SLA',
    ],
    cta: 'Start Free Trial',
    href: '/contact',
    highlighted: false,
    glowColor: 'from-text-muted/5 to-transparent',
  },
  {
    name: 'Professional',
    icon: Star,
    tagline: 'Most popular for growing teams',
    price: '$149',
    period: '/month',
    description:
      'Advanced control with unlimited endpoints, 4K streaming, and priority support for production environments.',
    features: [
      '3 control hubs',
      'Unlimited endpoints',
      '4K stream quality',
      'Advanced analytics',
      'Priority support (12h)',
      'API access',
      'Custom alerts',
      '99.9% uptime SLA',
    ],
    cta: 'Start Free Trial',
    href: '/contact',
    highlighted: true,
    badge: 'Most Popular',
    glowColor: 'from-accent-cyan/10 to-transparent',
  },
  {
    name: 'Business',
    icon: Shield,
    tagline: 'For mission-critical operations',
    price: '$399',
    period: '/month',
    description:
      'Full-featured platform with dedicated infrastructure, SSO, audit logs, and 24/7 on-call engineering support.',
    features: [
      '10 control hubs',
      'Unlimited endpoints',
      '4K HDR streaming',
      'Dedicated infrastructure',
      '24/7 on-call support',
      'SSO / SAML',
      'Full audit trail',
      'Custom integrations',
      '99.99% uptime SLA',
    ],
    cta: 'Start Free Trial',
    href: '/contact',
    highlighted: false,
    glowColor: 'from-accent-purple/8 to-transparent',
  },
  {
    name: 'Enterprise',
    icon: Building2,
    tagline: 'Tailored for your organization',
    price: 'Custom',
    period: '',
    description:
      'White-glove onboarding, dedicated account team, custom SLA, and bespoke infrastructure designed for your specific requirements.',
    features: [
      'Unlimited everything',
      'On-premise deployment',
      '8K / custom codecs',
      'Dedicated account manager',
      'Custom SLA',
      'MSA / DPA / BAA',
      'Professional services',
      'Training & workshops',
      'Source code escrow',
    ],
    cta: 'Contact Sales',
    href: '/contact',
    highlighted: false,
    glowColor: 'from-text-muted/5 to-transparent',
  },
]

export function PricingCards() {
  return (
    <section className="section-padding relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-bg-surface/30 to-bg-base pointer-events-none" />

      <div className="container-max relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {plans.map((plan, i) => (
            <PricingCard key={plan.name} plan={plan} index={i} />
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
            All plans include SSL encryption, automated backups, and global CDN.
          </p>
          <div className="flex flex-wrap justify-center gap-8 text-xs text-text-muted">
            {[
              'SOC 2 Compliant',
              'GDPR Ready',
              'ISO 27001',
              '256-bit Encryption',
            ].map((item) => (
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

function PricingCard({ plan, index }: { plan: Plan; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: [0.21, 0.47, 0.32, 0.98],
      }}
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

      <div
        className={cn(
          'absolute inset-0 bg-gradient-to-b pointer-events-none',
          plan.glowColor
        )}
      />

      <div className="relative z-10 p-7 flex flex-col flex-1">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div
            className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center transition-colors',
              plan.highlighted
                ? 'bg-accent-cyan/15 text-accent-cyan'
                : 'bg-bg-elevated text-text-muted group-hover:text-text-secondary'
            )}
          >
            <plan.icon size={20} />
          </div>
          {plan.badge && (
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/25">
              {plan.badge}
            </span>
          )}
        </div>

        <h3 className="font-display text-xl font-bold text-text-primary">
          {plan.name}
        </h3>
        <p className="text-text-muted text-xs mt-1 mb-5">{plan.tagline}</p>

        {/* Price */}
        <div className="flex items-baseline gap-1 mb-2">
          <span
            className={cn(
              'font-display text-4xl font-bold',
              plan.highlighted ? 'text-accent-cyan' : 'text-text-primary'
            )}
          >
            {plan.price}
          </span>
          {plan.period && (
            <span className="text-text-muted text-sm">{plan.period}</span>
          )}
        </div>
        <p className="text-text-secondary text-sm leading-relaxed mb-6">
          {plan.description}
        </p>

        {/* CTA */}
        <Link
          href={plan.href}
          className={cn(
            'group/cta w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold rounded-xl transition-all duration-200 mb-7',
            plan.highlighted
              ? 'bg-accent-cyan text-bg-base hover:bg-accent-cyan-light shadow-glow-cyan-sm hover:shadow-glow-cyan'
              : 'border border-border text-text-primary hover:border-accent-cyan/40 hover:bg-accent-cyan/5'
          )}
        >
          {plan.cta}
          <ArrowRight
            size={14}
            className="group-hover/cta:translate-x-1 transition-transform duration-200"
          />
        </Link>

        {/* Features */}
        <div className="border-t border-border pt-6 flex-1">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-4">
            What&apos;s included
          </p>
          <ul className="space-y-3">
            {plan.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2.5">
                <Check
                  size={14}
                  className={cn(
                    'mt-0.5 shrink-0',
                    plan.highlighted
                      ? 'text-accent-cyan'
                      : 'text-text-muted'
                  )}
                />
                <span className="text-text-secondary text-sm leading-relaxed">
                  {feature}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  )
}
