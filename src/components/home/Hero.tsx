'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ChevronDown, Radio } from 'lucide-react'
import { HKSkyline } from '@/components/shared/HKSkyline'
import { useLanguage } from '@/context/LanguageContext'
import { useIsMobile } from '@/hooks/useIsMobile'
import { ControlPanel } from './ControlPanel'

interface TerminalEntry {
  cmd: string
  res: string
  tone?: 'default' | 'signal'
}

export function Hero() {
  const { t } = useLanguage()
  const isMobile = useIsMobile()
  const heroRef = useRef<HTMLDivElement>(null)

  const [activeId, setActiveId] = useState<string | null>(null)
  const [broadcastTick, setBroadcastTick] = useState(0)
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

  useEffect(() => {
    if (!activeId) return
    const entry: TerminalEntry = {
      cmd: `$ easecity --control endpoint_${activeId}`,
      res: `→ ACK ${(0.6 + Math.random() * 0.6).toFixed(1)}ms · 200 OK · sync OK`,
    }
    setLog((prev) => [...prev.slice(-2), entry])
  }, [activeId])

  const broadcast = useCallback(() => {
    setBroadcastTick((t) => t + 1)
    setLog((prev) => [
      ...prev.slice(-1),
      {
        cmd: '$ easecity --broadcast --all',
        res: '→ BROADCAST_SENT · 5 nodes · ACK 100% · 0 lost',
        tone: 'signal',
      },
    ])
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code !== 'Space') return
      const target = e.target as HTMLElement | null
      if (target && ['INPUT', 'TEXTAREA', 'BUTTON'].includes(target.tagName)) return
      if (target?.isContentEditable) return
      e.preventDefault()
      broadcast()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [broadcast])

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex flex-col justify-between overflow-hidden bg-bg-base"
      style={{
        background: `
          radial-gradient(ellipse 60% 40% at 50% 0%, #22ff8808, transparent),
          radial-gradient(ellipse 50% 30% at 80% 80%, #22d3ee06, transparent),
          #09090b
        `,
      }}
    >
      <div className="absolute inset-0 bg-rule-grid opacity-[0.15] pointer-events-none" />
      <div className="absolute inset-0 bg-grain opacity-[0.35] pointer-events-none mix-blend-overlay" />

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
          <div className="grid grid-cols-12 gap-6 lg:gap-12 items-center">
            {/* Left — editorial typography */}
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
                    href="/services"
                    className="group inline-flex items-center gap-2 px-5 py-3 bg-signal text-bg-base font-semibold text-sm rounded-md hover:bg-signal-light transition-all duration-200 shadow-glow-signal-sm hover:shadow-glow-signal"
                  >
                    <Radio size={14} />
                    {t.hero.cta1}
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    href="/contact"
                    className="group inline-flex items-center gap-2 text-sm font-mono tracking-wider text-text-secondary hover:text-signal transition-colors"
                  >
                    <span className="text-signal">$</span>
                    <span className="border-b border-dashed border-text-muted group-hover:border-signal transition-colors pb-0.5">
                      {t.hero.cta2}
                    </span>
                  </Link>
                </motion.div>
              </div>
            </div>

            {/* Right — Control panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, delay: 0.4, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="col-span-12 lg:col-span-5 flex items-center justify-center lg:justify-end"
            >
              <ControlPanel
                activeId={activeId}
                onActiveChange={setActiveId}
                broadcastTick={broadcastTick}
                isMobile={isMobile}
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
            <TerminalLog log={log} broadcastTick={broadcastTick} />
          </motion.div>

          {/* Broadcast hint + scroll */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.2 }}
            className="mt-6 flex flex-wrap items-center justify-between gap-4 text-[10px] font-mono tracking-[0.2em] uppercase text-text-muted"
          >
            <div className="flex items-center gap-2">
              <kbd className="inline-flex items-center justify-center min-w-[48px] h-6 px-2 rounded border border-border bg-bg-elevated text-text-secondary text-[10px] font-mono">
                SPACE
              </kbd>
              <span>{t.hero.broadcastHint}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>{t.hero.scroll}</span>
              <ChevronDown size={12} className="animate-bounce" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* HK skyline */}
      <div className="relative z-0 pointer-events-none select-none -mb-px">
        <HKSkyline className="opacity-25" />
      </div>

      {/* Broadcast toast */}
      <AnimatePresence>
        {broadcastTick > 0 && <BroadcastToast key={broadcastTick} />}
      </AnimatePresence>
    </section>
  )
}

function TerminalLog({
  log,
  broadcastTick,
}: {
  log: TerminalEntry[]
  broadcastTick: number
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
          pid:{1000 + (broadcastTick % 999)}
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

function BroadcastToast() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35 }}
      className="fixed bottom-16 left-1/2 -translate-x-1/2 z-40 pointer-events-none"
    >
      <div className="inline-flex items-center gap-3 px-4 py-2 rounded-md bg-bg-elevated border border-signal/40 shadow-glow-signal-sm">
        <span className="w-2 h-2 rounded-full bg-signal animate-pulse" />
        <span className="font-mono text-[11px] tracking-widest text-signal uppercase">
          Broadcast sent · 5 nodes · ACK 100%
        </span>
      </div>
    </motion.div>
  )
}
