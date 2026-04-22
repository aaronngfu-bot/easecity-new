'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Quote } from 'lucide-react'
import { AnimatedSection } from '@/components/ui/AnimatedSection'
import { useLanguage } from '@/context/LanguageContext'

export function Philosophy() {
  const { t } = useLanguage()
  const [openId, setOpenId] = useState<number | null>(null)

  const principles = [
    { number: t.philosophy.p1Num, title: t.philosophy.p1Title, body: t.philosophy.p1Body, note: t.philosophy.p1Note },
    { number: t.philosophy.p2Num, title: t.philosophy.p2Title, body: t.philosophy.p2Body, note: t.philosophy.p2Note },
    { number: t.philosophy.p3Num, title: t.philosophy.p3Title, body: t.philosophy.p3Body, note: t.philosophy.p3Note },
    { number: t.philosophy.p4Num, title: t.philosophy.p4Title, body: t.philosophy.p4Body, note: t.philosophy.p4Note },
  ]

  return (
    <section className="section-padding border-t border-border">
      <div className="container-max">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          <AnimatedSection direction="left">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-signal shadow-glow-signal-sm" />
              <p className="label-mono text-signal/80">{t.philosophy.eyebrow}</p>
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-text-primary leading-[1.05] tracking-tight mb-6">
              {t.philosophy.heading}{' '}
              <span className="text-gradient-signal">{t.philosophy.headingHighlight}</span>
            </h2>
            <p className="text-text-secondary text-lg leading-relaxed mb-6">{t.philosophy.body1}</p>
            <p className="text-text-secondary text-base leading-relaxed mb-8">{t.philosophy.body2}</p>

            <div className="glass-panel p-5">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 flex-shrink-0 rounded-lg bg-signal/8 border border-signal/20 flex items-center justify-center">
                  <span className="text-signal text-sm font-display">香</span>
                </div>
                <div>
                  <p className="text-text-primary text-sm font-medium mb-1">{t.philosophy.hkTitle}</p>
                  <p className="text-text-secondary text-xs leading-relaxed">{t.philosophy.hkDesc}</p>
                </div>
              </div>
            </div>

            {/* Subtle reveal hint */}
            <p className="mt-6 text-[11px] text-text-muted font-mono tracking-wider flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-signal/60" />
              {t.philosophy.noteHint} — <Quote size={10} className="text-signal/60 ml-0.5" />
            </p>
          </AnimatedSection>

          <AnimatedSection direction="right">
            <div className="space-y-4">
              {principles.map((p, i) => (
                <PrincipleCard
                  key={p.number}
                  index={i}
                  principle={p}
                  noteLabel={t.philosophy.noteLabel}
                  isOpen={openId === i}
                  onOpen={() => setOpenId(i)}
                  onClose={() => setOpenId(null)}
                />
              ))}
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  )
}

interface PrincipleProps {
  index: number
  principle: { number: string; title: string; body: string; note: string }
  noteLabel: string
  isOpen: boolean
  onOpen: () => void
  onClose: () => void
}

function PrincipleCard({ index, principle, noteLabel, isOpen, onOpen, onClose }: PrincipleProps) {
  const [dwellTimer, setDwellTimer] = useState<ReturnType<typeof setTimeout> | null>(null)

  const handleEnter = () => {
    if (dwellTimer) clearTimeout(dwellTimer)
    const timer = setTimeout(onOpen, 520)
    setDwellTimer(timer)
  }

  const handleLeave = () => {
    if (dwellTimer) {
      clearTimeout(dwellTimer)
      setDwellTimer(null)
    }
    onClose()
  }

  const handleClick = () => {
    if (dwellTimer) clearTimeout(dwellTimer)
    isOpen ? onClose() : onOpen()
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onClick={handleClick}
      className="group glass-panel glass-panel-interactive p-5 cursor-pointer select-none"
    >
      <div className="flex gap-5">
        <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-signal/8 border border-signal/15 flex items-center justify-center group-hover:bg-signal/12 transition-colors">
          <span className="text-signal text-xs font-mono font-bold">{principle.number}</span>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-text-primary text-sm mb-1.5 group-hover:text-white transition-colors">
            {principle.title}
          </h3>
          <p className="text-text-secondary text-sm leading-relaxed">{principle.body}</p>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 14 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                transition={{ duration: 0.28, ease: [0.2, 0.8, 0.25, 1] }}
                className="overflow-hidden"
              >
                <div className="pt-3 border-t border-signal/20 relative">
                  <div className="flex items-center gap-2 mb-2">
                    <Quote size={10} className="text-signal/70" />
                    <span className="label-mono text-signal/70">{noteLabel}</span>
                    <span className="h-px flex-1 bg-signal/15" />
                  </div>
                  <p className="text-text-secondary text-[13px] leading-relaxed italic">
                    “{principle.note}”
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}
