'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { useLanguage } from '@/context/LanguageContext'
import { PerspectiveMarquee } from '@/components/PerspectiveMarquee'
import { Magnetic } from '@/components/ui/MagneticButton'

export function CTASection() {
  const { t, language } = useLanguage()

  return (
    <section
      id="connect-section"
      className="relative flex min-h-[80vh] items-center justify-center overflow-hidden border-t border-border"
    >
      <PerspectiveMarquee
        className="text-[#008f82]/30 dark:text-[#5eead4]/45"
        items={t.cta.marquee}
        fontSize={language === 'zh' ? 96 : 72}
        fontWeight={800}
        speed={0.8}
      />
      {/* 中央 vignette：襯托文字，theme-aware */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_600px_300px_at_center,rgba(247,250,250,0.88)_0%,rgba(247,250,250,0.5)_50%,transparent_80%)] dark:bg-[radial-gradient(ellipse_600px_300px_at_center,rgba(5,5,5,0.75)_0%,rgba(5,5,5,0.4)_50%,transparent_80%)]"
        aria-hidden
      />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-signal/40 to-transparent" />

      <div className="container-max relative z-10 px-6 py-24 md:py-32">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-center gap-3 mb-10"
          >
            <span className="h-px w-16 bg-border" />
            <span className="label-mono text-signal">§ CONNECT</span>
            <span className="h-px w-16 bg-border" />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="font-display text-4xl md:text-[2.75rem] lg:text-6xl font-bold text-foreground leading-[0.95] tracking-tight text-center mb-6"
          >
            {t.cta.heading}{' '}
            <span className="text-outline-signal">{t.cta.headingHighlight}</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="text-muted-foreground text-base md:text-lg leading-relaxed text-center max-w-2xl mx-auto mb-10"
          >
            {t.cta.desc}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="flex flex-wrap justify-center items-center gap-4"
          >
            <Magnetic>
              <Link
                href="/about#contact"
                className="group inline-flex items-stretch rounded-lg overflow-hidden bg-signal text-bg-base hover:bg-signal-light transition-colors shadow-glow-signal-sm hover:shadow-glow-signal"
              >
                <span className="px-5 py-3 font-semibold text-sm tracking-wide">
                  {t.cta.cta1}
                </span>
              </Link>
            </Magnetic>
            <Link
              href="/product"
              className="group inline-flex items-stretch rounded-lg overflow-hidden border border-border bg-card hover:border-signal/40 hover:bg-signal/5 text-foreground transition-colors"
            >
              <span className="px-5 py-3 font-semibold text-sm tracking-wide">
                {t.cta.cta2}
              </span>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-14 pt-8 border-t border-border flex flex-wrap justify-center gap-6 md:gap-8 text-[10px] md:text-xs font-mono tracking-widest uppercase text-text-muted"
          >
            {[t.cta.trust1, t.cta.trust2, t.cta.trust3].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-signal/60" />
                {item}
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
