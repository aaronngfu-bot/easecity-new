'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, ChevronDown } from 'lucide-react'
import { HKSkyline } from '@/components/shared/HKSkyline'
import { useLanguage } from '@/context/LanguageContext'

function NetworkDiagram() {
  return (
    <svg
      viewBox="0 0 480 380"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      aria-hidden="true"
    >
      <defs>
        <filter id="nodeGlow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <linearGradient id="lineGrad1" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.1" />
        </linearGradient>
        <linearGradient id="lineGrad2" x1="1" y1="0" x2="0" y2="0">
          <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.1" />
        </linearGradient>
        <linearGradient id="hubGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
        <radialGradient id="hubGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
        </radialGradient>
      </defs>

      {Array.from({ length: 8 }).map((_, i) =>
        Array.from({ length: 6 }).map((_, j) => (
          <circle key={`dot-${i}-${j}`} cx={40 + i * 60} cy={30 + j * 60} r="1" fill="#22d3ee" fillOpacity="0.08" />
        ))
      )}

      {/* Connection lines */}
      {[
        { x2: 100, y2: 80, dur: '2s', grad: 'lineGrad2' },
        { x2: 380, y2: 80, dur: '2.4s', grad: 'lineGrad1' },
        { x2: 100, y2: 300, dur: '1.8s', grad: 'lineGrad2' },
        { x2: 380, y2: 300, dur: '2.2s', grad: 'lineGrad1' },
        { x2: 440, y2: 190, dur: '2.6s', grad: 'lineGrad1' },
      ].map((line, i) => (
        <g key={i}>
          <line x1="240" y1="190" x2={line.x2} y2={line.y2} stroke="#22d3ee" strokeWidth="1" strokeOpacity="0.3" />
          <line x1="240" y1="190" x2={line.x2} y2={line.y2} stroke={`url(#${line.grad})`} strokeWidth="1.5" strokeDasharray="8 4">
            <animate attributeName="stroke-dashoffset" from="0" to="-48" dur={line.dur} repeatCount="indefinite" />
          </line>
        </g>
      ))}

      {/* Hub */}
      <circle cx="240" cy="190" r="50" fill="url(#hubGlow)" />
      <circle cx="240" cy="190" r="36" fill="#09090b" stroke="#22d3ee" strokeWidth="1" strokeOpacity="0.3" />
      <circle cx="240" cy="190" r="28" fill="#0d1117" stroke="url(#hubGrad)" strokeWidth="1.5" />
      <circle cx="240" cy="190" r="18" fill="url(#hubGrad)" fillOpacity="0.15" />
      <circle cx="240" cy="190" r="6" fill="url(#hubGrad)" filter="url(#nodeGlow)" />
      <text x="240" y="235" textAnchor="middle" fill="#22d3ee" fontSize="11" fontFamily="monospace" opacity="0.9">DEVICE A</text>
      <text x="240" y="248" textAnchor="middle" fill="#22d3ee" fontSize="9" fontFamily="monospace" opacity="0.5">Control Hub</text>

      {/* Endpoint nodes */}
      {[
        { cx: 100, cy: 80 }, { cx: 380, cy: 80 }, { cx: 100, cy: 300 },
        { cx: 380, cy: 300 }, { cx: 440, cy: 190 },
      ].map((node, i) => (
        <g key={i} filter="url(#nodeGlow)">
          <circle cx={node.cx} cy={node.cy} r="20" fill="#09090b" stroke="#22d3ee" strokeWidth="1" strokeOpacity="0.5" />
          <circle cx={node.cx} cy={node.cy} r="14" fill="#111116" stroke="#22d3ee" strokeWidth="0.8" strokeOpacity="0.7" />
          <circle cx={node.cx} cy={node.cy} r="4" fill="#22d3ee" fillOpacity="0.9">
            <animate attributeName="r" values="3;5;3" dur={`${2 + i * 0.3}s`} repeatCount="indefinite" />
            <animate attributeName="fill-opacity" values="0.9;0.5;0.9" dur={`${2 + i * 0.3}s`} repeatCount="indefinite" />
          </circle>
          <text x={node.cx} y={node.cy + 34} textAnchor="middle" fill="#a1a1aa" fontSize="9" fontFamily="monospace">
            Device {i + 1}
          </text>
        </g>
      ))}

      <circle cx="240" cy="190" r="44" fill="none" stroke="#22d3ee" strokeWidth="0.5" strokeOpacity="0.2" strokeDasharray="4 4">
        <animateTransform attributeName="transform" type="rotate" from="0 240 190" to="360 240 190" dur="20s" repeatCount="indefinite" />
      </circle>
    </svg>
  )
}

export function Hero() {
  const { t } = useLanguage()
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!heroRef.current) return
      const rect = heroRef.current.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100
      heroRef.current.style.setProperty('--mouse-x', `${x}%`)
      heroRef.current.style.setProperty('--mouse-y', `${y}%`)
    }
    const el = heroRef.current
    el?.addEventListener('mousemove', handleMouseMove)
    return () => el?.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-bg-base"
      style={{
        background: `
          radial-gradient(ellipse 80% 50% at 50% -5%, #22d3ee12, transparent),
          radial-gradient(ellipse 40% 40% at 80% 60%, #a855f708, transparent),
          #09090b
        `,
      }}
    >
      <div className="absolute inset-0 bg-dot-grid opacity-40 pointer-events-none" />

      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.25, 0.15] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="hero-orb w-[600px] h-[400px] bg-accent-cyan top-[-10%] left-[-10%]"
        style={{ opacity: 0.08 }}
      />
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.1, 0.18, 0.1] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
        className="hero-orb w-[500px] h-[300px] bg-accent-purple bottom-[-5%] right-[-5%]"
        style={{ opacity: 0.06 }}
      />

      <div className="container-max relative z-10 pt-24 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center min-h-[calc(100vh-160px)]">
          {/* Left: Text */}
          <div className="flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-flex items-center gap-2 w-fit px-3 py-1.5 rounded-full border border-accent-cyan/25 bg-accent-cyan/8 mb-8"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan animate-pulse-slow" />
              <span className="text-accent-cyan text-xs font-mono tracking-wider">{t.hero.badge}</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight mb-6"
            >
              <span className="text-text-primary">{t.hero.headline1}</span>
              <br />
              <span className="text-gradient-primary">{t.hero.headline2}</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.35, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="text-text-secondary text-lg md:text-xl leading-relaxed mb-10 max-w-lg"
            >
              {t.hero.sub}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="flex flex-wrap gap-4"
            >
              <Link
                href="/services"
                className="group inline-flex items-center gap-2 px-6 py-3.5 bg-accent-cyan text-bg-base font-semibold text-sm rounded-xl hover:bg-accent-cyan-light transition-all duration-200 shadow-glow-cyan-sm hover:shadow-glow-cyan"
              >
                {t.hero.cta1}
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3.5 border border-border text-text-primary font-semibold text-sm rounded-xl hover:border-accent-cyan/40 hover:bg-accent-cyan/5 transition-all duration-200"
              >
                {t.hero.cta2}
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.7 }}
              className="mt-12 flex gap-8 pt-8 border-t border-border"
            >
              {[
                { value: t.hero.stat1Value, label: t.hero.stat1Label },
                { value: t.hero.stat2Value, label: t.hero.stat2Label },
                { value: t.hero.stat3Value, label: t.hero.stat3Label },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="font-display text-xl font-bold text-text-primary">{stat.value}</p>
                  <p className="text-text-muted text-xs mt-0.5">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right: Network diagram */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.4, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="relative flex items-center justify-center lg:justify-end"
          >
            <div className="relative w-full max-w-[480px] aspect-[480/380]">
              <div className="absolute inset-0 bg-gradient-radial from-accent-cyan/8 via-transparent to-transparent rounded-3xl" />
              <NetworkDiagram />
            </div>
          </motion.div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 pointer-events-none select-none">
        <HKSkyline className="opacity-30" />
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-text-muted"
      >
        <span className="text-xs font-mono tracking-widest uppercase">{t.hero.scroll}</span>
        <ChevronDown size={16} className="animate-bounce" />
      </motion.div>
    </section>
  )
}
