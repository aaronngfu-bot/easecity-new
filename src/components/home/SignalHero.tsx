'use client'

import Link from 'next/link'
import { ArrowRight, Radio } from 'lucide-react'
import { motion } from 'framer-motion'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { useLanguage } from '@/context/LanguageContext'

export function SignalHero() {
  const { t } = useLanguage()

  return (
    <section className="relative min-h-screen overflow-hidden pt-28">
      <div className="absolute inset-0 control-grid opacity-25" />
      <div className="absolute right-[-16%] top-[-18%] h-[640px] w-[640px] rounded-full bg-signal/12 blur-[160px]" />

      <div className="container-max relative z-10 flex min-h-[calc(100vh-7rem)] items-center py-16">
        <div className="grid w-full grid-cols-12 items-center gap-8 lg:gap-12">
          <div className="col-span-12 lg:col-span-6">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55 }}
              className="mb-7 flex flex-wrap items-center gap-3"
            >
              <StatusBadge tone="signal" pulse>
                {t.hero.badge}
              </StatusBadge>
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-muted">
                LAT 0.8MS / NODES 5 / SYNC OK
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="font-display text-display-hero font-semibold text-text-primary"
            >
              1<span className="mx-2 text-text-faint">-&gt;</span>
              <span className="text-signal">N</span>
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.18 }}
              className="mt-6 max-w-2xl"
            >
              <p className="font-mono text-[11px] uppercase tracking-[0.20em] text-signal">
                {t.hero.headline1} {t.hero.headline2}
              </p>
              <p className="mt-5 text-lg leading-8 text-text-secondary">{t.hero.sub}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.28 }}
              className="mt-8 flex flex-wrap gap-3"
            >
              <Link href="#device-sync-showcase" className="signal-cta">
                <Radio size={16} />
                {t.hero.cta1}
                <ArrowRight size={15} />
              </Link>
              <Link href="/about#contact" className="signal-secondary">
                {t.hero.cta2}
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
