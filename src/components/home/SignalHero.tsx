'use client'

import Link from 'next/link'
import { ArrowRight, Radio } from 'lucide-react'
import { motion } from 'framer-motion'
import { ProductFrame, ProductRow } from '@/components/ui/ProductFrame'
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
              <Link href="/contact" className="signal-secondary">
                {t.hero.cta2}
              </Link>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.22 }}
            className="col-span-12 lg:col-span-6"
          >
            <ProductFrame
              title="EASECITY DESKTOP CONSOLE"
              meta="Control target: Device A / relay region: AP-HK"
              status="STREAM LIVE"
            >
              <div className="grid gap-3 lg:grid-cols-[0.75fr_1.25fr]">
                <div className="rounded-lg border border-border bg-bg-surface p-3">
                  {['Device A', 'Device B', 'Device C'].map((device, index) => (
                    <div
                      key={device}
                      className={`mb-2 rounded-md border p-3 last:mb-0 ${
                        index === 0
                          ? 'border-signal/40 bg-signal/10'
                          : 'border-border bg-bg-void/60'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-text-primary">
                          {device}
                        </span>
                        <span className={index === 0 ? 'text-signal' : 'text-text-muted'}>●</span>
                      </div>
                      <p className="mt-2 text-xs text-text-muted">
                        {index === 0 ? 'CONTROL TARGET' : 'Independent stream'}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="rounded-lg border border-border bg-bg-void p-4">
                  <div className="grid grid-cols-3 gap-2">
                    {[0, 1, 2].map((idx) => (
                      <div
                        key={idx}
                        className={`h-28 rounded-md border ${
                          idx === 0 ? 'border-signal/50 bg-signal/10' : 'border-border bg-bg-surface'
                        }`}
                      >
                        <div className="h-full bg-[linear-gradient(135deg,rgba(0,229,204,0.10),transparent_40%),repeating-linear-gradient(0deg,rgba(255,255,255,0.06)_0_1px,transparent_1px_10px)]" />
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 rounded-md border border-border bg-bg-surface px-4">
                    <ProductRow label="Command" value="tap Device A only" tone="signal" />
                    <ProductRow label="Mirror FPS" value="60" />
                    <ProductRow label="Operator" value="online" tone="signal" />
                  </div>
                </div>
              </div>
            </ProductFrame>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
