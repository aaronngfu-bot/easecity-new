'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { useLanguage } from '@/context/LanguageContext'

export function PricingFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const { t } = useLanguage()

  const faqs = [
    { q: t.pricingPage.faq1Q, a: t.pricingPage.faq1A },
    { q: t.pricingPage.faq2Q, a: t.pricingPage.faq2A },
    { q: t.pricingPage.faq3Q, a: t.pricingPage.faq3A },
    { q: t.pricingPage.faq4Q, a: t.pricingPage.faq4A },
    { q: t.pricingPage.faq5Q, a: t.pricingPage.faq5A },
    { q: t.pricingPage.faq6Q, a: t.pricingPage.faq6A },
  ]

  return (
    <section className="section-padding relative border-t border-border">
      <div className="container-max">
        <SectionTitle
          eyebrow={t.pricingPage.faqEyebrow}
          title={t.pricingPage.faqTitle}
          titleHighlight={t.pricingPage.faqHighlight}
          description={t.pricingPage.faqDesc}
        />

        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className={cn(
                'glass-panel overflow-hidden !rounded-xl transition-all duration-300',
                openIndex === i && 'border-signal/25'
              )}
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between px-5 md:px-6 py-4 md:py-5 text-left"
              >
                <span className="flex items-center gap-3 text-sm font-medium text-text-primary pr-4">
                  <span className="font-mono text-[10px] text-text-muted tracking-wider w-6">
                    Q{String(i + 1).padStart(2, '0')}
                  </span>
                  {faq.q}
                </span>
                <ChevronDown
                  size={16}
                  className={cn(
                    'shrink-0 text-text-muted transition-all duration-200',
                    openIndex === i && 'rotate-180 text-signal'
                  )}
                />
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 md:px-6 pb-5 pt-0 pl-[3.25rem]">
                      <p className="text-text-secondary text-sm leading-relaxed">{faq.a}</p>
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
