'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, ChevronDown, Radio } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

interface TerminalEntry {
  cmd: string
  res: string
  tone?: 'default' | 'signal'
}

export function Hero() {
  const { t } = useLanguage()
  const heroRef = useRef<HTMLDivElement>(null)

  const [log, setLog] = useState<TerminalEntry[]>([])

  const seedLog = useMemo<TerminalEntry[]>(
    () => [
      {
        cmd: '$ easecity --connect endpoint_02',
        res: '→ ACK 0.8ms · 200 OK · stream ACTIVE',
      },
      {
        cmd: '$ easecity --status',
        res: '→ 5 nodes connected · 0 errors · uptime 99.99%',
      },
    ],
    []
  )

  useEffect(() => {
    setLog(seedLog)
  }, [seedLog])

  return (
    <section
      ref={heroRef}
      className="relative flex flex-col overflow-hidden bg-bg-base"
      style={{
        background: `
          radial-gradient(ellipse 70% 45% at 50% 105%, rgba(0,229,204,0.06), transparent 62%),
          radial-gradient(ellipse 55% 40% at 15% 20%, rgba(0,229,204,0.04), transparent 60%),
          #07090b
        `,
      }}
    >
      <div className="absolute inset-0 bg-rule-grid opacity-[0.12] pointer-events-none" />
      <div className="absolute inset-0 bg-grain opacity-[0.3] pointer-events-none mix-blend-overlay" />

      {/* The editorial fold — first screen only */}
      <div className="relative min-h-screen flex flex-col">

      {/* Top meta bar — live badge + telemetry */}
      <div className="relative z-20 border-b border-border/60">
        <div className="container-max py-3 flex items-center justify-between gap-4 text-[10px] font-mono tracking-[0.2em] uppercase">
          <div className="flex items-center gap-2 text-signal">
            <span className="relative flex w-1.5 h-1.5">
              <span className="absolute inline-flex w-full h-full rounded-full bg-signal opacity-75 animate-ping" />
              <span className="relative inline-flex rounded-full w-1.5 h-1.5 bg-signal" />
            </span>
            <span>LIVE</span>
            <span className="text-text-muted">·</span>
            <span className="text-text-secondary hidden sm:inline">STREAM CONTROL ONLINE</span>
            <span className="text-text-secondary sm:hidden">ONLINE</span>
          </div>
          <div className="flex items-center gap-3 text-text-muted telemetry-row">
            <span className="hidden md:inline">
              LAT <span className="text-text-primary">0.8ms</span>
            </span>
            <span className="hidden md:inline">·</span>
            <span>
              NODES <span className="text-text-primary">5</span>
            </span>
            <span>·</span>
            <span className="text-signal">SYNC OK</span>
          </div>
        </div>
      </div>

      {/* Main editorial + control panel */}
      <div className="relative z-10 flex-1 flex items-center">
        <div className="container-max w-full py-8 md:py-16">
          <div className="grid grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="col-span-12 lg:col-span-7 relative">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="flex items-center gap-3 mb-6 md:mb-10"
              >
                <span className="label-mono text-signal/70">OBJECTIVE</span>
                <span className="h-px flex-1 bg-border max-w-[80px]" />
                <span className="text-[10px] font-mono text-text-muted tracking-widest">
                  001 / ∞
                </span>
              </motion.div>

              <div className="relative">
                {/* Massive 1 → ∞ */}
                <div className="flex items-baseline gap-4 sm:gap-6 md:gap-10 flex-wrap">
                  <motion.span
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9, delay: 0.15, ease: [0.21, 0.47, 0.32, 0.98] }}
                    className="font-display font-bold leading-[0.85] tracking-tight text-text-primary"
                    style={{ fontSize: 'clamp(6rem, 18vw, 14rem)' }}
                  >
                    1
                  </motion.span>

                  <motion.span
                    initial={{ opacity: 0, scaleX: 0 }}
                    animate={{ opacity: 1, scaleX: 1 }}
                    transition={{ duration: 0.7, delay: 0.5 }}
                    className="hidden sm:inline-flex items-center self-center origin-left"
                    aria-hidden="true"
                  >
                    <svg viewBox="0 0 140 20" className="h-4 md:h-5 w-20 md:w-32 text-signal">
                      <line x1="0" y1="10" x2="120" y2="10" stroke="currentColor" strokeWidth="1" strokeDasharray="3 4" />
                      <path d="M 120 5 L 132 10 L 120 15" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </motion.span>

                  <motion.span
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9, delay: 0.35, ease: [0.21, 0.47, 0.32, 0.98] }}
                    className="font-display font-bold leading-[0.85] tracking-tight text-signal"
                    style={{ fontSize: 'clamp(6rem, 18vw, 14rem)' }}
                  >
                    ∞
                  </motion.span>
                </div>

                {/* Label row */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.55 }}
                  className="mt-4 md:mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] font-mono tracking-[0.2em] uppercase"
                >
                  <span className="text-text-muted">HUB</span>
                  <span className="text-border">/</span>
                  <span className="text-text-muted">ENDPOINTS</span>
                  <span className="text-border">/</span>
                  <span className="text-signal">SYNCHRONISED</span>
                  <span className="text-border">/</span>
                  <span className="text-signal">REAL-TIME</span>
                </motion.div>

                {/* Subhead */}
                <motion.p
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.7 }}
                  className="mt-8 md:mt-10 max-w-xl text-text-secondary text-base md:text-lg leading-relaxed"
                >
                  {t.hero.sub}
                </motion.p>

                {/* CTA row */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.85 }}
                  className="mt-8 md:mt-10 flex flex-wrap items-center gap-5"
                >
                  <Link
                    href="#device-sync-showcase"
                    className="group glass-cta !px-5 !py-3"
                  >
                    <Radio size={14} />
                    {t.hero.cta1}
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    href="/about#contact"
                    className="group glass-ghost !px-5 !py-3"
                  >
                    <span className="text-signal">$</span>
                    <span className="border-b border-dashed border-text-muted group-hover:border-signal transition-colors pb-0.5">
                      {t.hero.cta2}
                    </span>
                  </Link>
                </motion.div>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.45, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="col-span-12 lg:col-span-5"
            >
              <ProductProofCard
                eyebrow={t.hero.productCardEyebrow}
                title={t.hero.productCardTitle}
                desc={t.hero.productCardDesc}
                steps={[t.hero.productStep1, t.hero.productStep2, t.hero.productStep3]}
              />
            </motion.div>
          </div>

          {/* Terminal log — full width below */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1 }}
            className="mt-8 md:mt-12 max-w-3xl"
          >
            <TerminalLog log={log} />
          </motion.div>

          {/* Scroll hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.2 }}
            className="mt-6 flex justify-end gap-4 text-[10px] font-mono tracking-[0.2em] uppercase text-text-muted"
          >
            <div className="flex items-center gap-2">
              <span>{t.hero.scroll}</span>
              <ChevronDown size={12} className="animate-bounce" />
            </div>
          </motion.div>
        </div>
      </div>

      </div>
      {/* /editorial fold */}

      <div className="relative z-[1] h-16 border-t border-border/50 bg-gradient-to-b from-signal/5 to-transparent" />

    </section>
  )
}

function TerminalLog({
  log,
}: {
  log: TerminalEntry[]
}) {
  return (
    <div className="terminal rounded-lg overflow-hidden">
      {/* Terminal chrome header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border/60">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#3f3f46]" />
          <span className="w-2 h-2 rounded-full bg-[#3f3f46]" />
          <span className="w-2 h-2 rounded-full bg-signal/80" />
        </div>
        <span className="text-[10px] font-mono tracking-widest text-text-muted uppercase">
          easecity — control
        </span>
        <span className="text-[10px] font-mono text-text-muted">
          pid:1042
        </span>
      </div>
      <div className="px-4 py-4 text-[12px] md:text-[13px] font-mono leading-[1.7] min-h-[112px]">
        {log.map((entry, i) => (
          <div key={i} className="animate-fade-up">
            <div className="text-text-primary">{entry.cmd}</div>
            <div
              className={
                entry.tone === 'signal' ? 'text-signal' : 'text-text-secondary'
              }
            >
              {entry.res}
            </div>
          </div>
        ))}
        <span className="inline-block h-[14px] w-[7px] bg-signal/80 align-middle animate-blink" />
      </div>
    </div>
  )
}

function ProductProofCard({
  eyebrow,
  title,
  desc,
  steps,
}: {
  eyebrow: string
  title: string
  desc: string
  steps: string[]
}) {
  return (
    <div className="glass-panel p-5 md:p-6 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(0,229,204,0.16),transparent_48%)] pointer-events-none" />
      <div className="relative">
        <p className="label-mono mb-3 text-signal/80">{eyebrow}</p>
        <h2 className="font-display text-2xl font-bold leading-tight text-text-primary">{title}</h2>
        <p className="mt-3 text-sm leading-relaxed text-text-secondary">{desc}</p>

        <div className="mt-5 rounded-2xl border border-border bg-bg-base/70 p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-semibold text-text-primary">EC-Share Desktop</span>
            <span className="rounded-full border border-signal/30 bg-signal/10 px-2 py-0.5 text-[10px] font-mono text-signal">
              LIVE
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {['A', 'B', 'C'].map((id) => (
              <div key={id} className="rounded-xl border border-border bg-bg-surface p-2">
                <div className="mb-2 h-12 rounded-lg border border-signal/20 bg-signal/10" />
                <p className="text-center text-[10px] font-mono text-text-secondary">PHONE {id}</p>
              </div>
            ))}
          </div>
        </div>

        <ul className="mt-5 space-y-2.5">
          {steps.map((step) => (
            <li key={step} className="flex items-start gap-2.5 text-sm text-text-secondary">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-signal" />
              <span>{step}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
