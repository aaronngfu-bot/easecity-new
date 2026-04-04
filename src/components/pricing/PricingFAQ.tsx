'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SectionTitle } from '@/components/ui/SectionTitle'

const faqs = [
  {
    q: 'What happens after the 14-day trial?',
    a: 'Your account transitions to the plan you selected. No charges are made during the trial period. If you choose not to continue, your account is simply deactivated — no hidden fees.',
  },
  {
    q: 'Can I switch plans later?',
    a: 'Absolutely. Upgrade or downgrade at any time from your dashboard. Changes take effect immediately, and billing is prorated for the remaining cycle.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept all major credit cards (Visa, Mastercard, Amex) via Stripe. Enterprise plans can be invoiced with NET-30 terms.',
  },
  {
    q: 'Is there a setup fee?',
    a: 'No. All standard plans are self-service with zero setup fees. Enterprise plans include complimentary onboarding and integration assistance.',
  },
  {
    q: 'What does "unlimited endpoints" mean?',
    a: 'You can connect as many remote devices as needed to your control hubs. There are no per-endpoint charges on Professional and above plans.',
  },
  {
    q: 'Do you offer annual billing discounts?',
    a: 'Yes. Annual billing saves 20% compared to monthly pricing. Contact our sales team for multi-year commitments with additional discounts.',
  },
]

export function PricingFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section className="section-padding relative">
      <div className="container-max">
        <SectionTitle
          eyebrow="FAQ"
          title="Frequently asked"
          titleHighlight="questions"
          description="Everything you need to know about our plans and pricing."
        />

        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="rounded-xl border border-border bg-bg-surface overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-4 text-left"
              >
                <span className="text-sm font-medium text-text-primary pr-4">
                  {faq.q}
                </span>
                <ChevronDown
                  size={16}
                  className={cn(
                    'shrink-0 text-text-muted transition-transform duration-200',
                    openIndex === i && 'rotate-180 text-accent-cyan'
                  )}
                />
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-5 pt-0">
                      <p className="text-text-secondary text-sm leading-relaxed">
                        {faq.a}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
