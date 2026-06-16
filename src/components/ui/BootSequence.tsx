'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useMotionEnabled } from '@/lib/motion-context'

const STORAGE_KEY = 'easecity-booted-v1' // 保留原 key，唔會打亂現有用戶嘅 gate
const SKIP_BEFORE = 12 * 60 * 60 * 1000

const DEVICES = ['alpha', 'bravo', 'charlie', 'delta', 'echo']

/* 五個端點圍住中心，正五邊形排列 */
const C = 130
const R = 88
const POINTS = DEVICES.map((_, i) => {
  const a = ((-90 + i * 72) * Math.PI) / 180
  return { x: C + Math.cos(a) * R, y: C + Math.sin(a) * R }
})

const LINK_MS = 230  // 每條 link 嘅間隔
const SYNC_MS = 950  // 同步脈衝階段長度

export function BootSequence() {
  const { motionEnabled } = useMotionEnabled()
  const shouldReduce = useReducedMotion() || !motionEnabled
  const reduce = !!shouldReduce
  const [visible, setVisible] = useState(false)
  const [step, setStep] = useState(0)
  const [phase, setPhase] = useState<'link' | 'sync'>('link')

  /* 12 小時 gate — 邏輯照舊 */
  useEffect(() => {
    try {
      const ts = parseInt(localStorage.getItem(STORAGE_KEY) ?? '0', 10)
      if (!Number.isNaN(ts) && Date.now() - ts < SKIP_BEFORE) return
    } catch { /* noop */ }
    setVisible(true)
  }, [])

  /* 流程推進：逐個 link → sync 脈衝 → 收場 */
  useEffect(() => {
    if (!visible) return
    if (phase === 'link') {
      if (step < DEVICES.length) {
        const t = setTimeout(() => setStep((s) => s + 1), reduce ? 60 : LINK_MS)
        return () => clearTimeout(t)
      }
      const t = setTimeout(() => setPhase('sync'), 150)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => {
      setVisible(false)
      try { localStorage.setItem(STORAGE_KEY, Date.now().toString()) } catch { /* noop */ }
    }, reduce ? 300 : SYNC_MS)
    return () => clearTimeout(t)
  }, [visible, phase, step, reduce])

  /* 顯示期間鎖 scroll */
  useEffect(() => {
    if (!visible) return
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [visible])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="boot"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="fixed inset-0 z-[999] bg-bg-base flex items-center justify-center overflow-hidden"
          aria-hidden="true"
        >
          <div className="absolute inset-0 bg-rule-grid opacity-20 pointer-events-none" />
          <div className="absolute inset-0 bg-grain opacity-40 pointer-events-none mix-blend-overlay" />

          <div className="relative z-10 flex flex-col items-center px-6">
            {/* 頂部 badge — 同原版一致嘅 DNA */}
            <div className="mb-2 flex items-center gap-2 text-[10px] font-mono tracking-[0.25em] text-signal uppercase">
              <span className="relative flex w-1.5 h-1.5">
                <span className="absolute inline-flex w-full h-full rounded-full bg-signal opacity-75 animate-ping" />
                <span className="relative inline-flex rounded-full w-1.5 h-1.5 bg-signal" />
              </span>
              easecity · control plane
            </div>

            {/* 網絡圖：裝置逐個連入中央 */}
            <svg width="260" height="260" viewBox="0 0 260 260" className="text-signal">
              {POINTS.map((p, i) => (
                <g key={i}>
                  <motion.line
                    x1={C} y1={C} x2={p.x} y2={p.y}
                    stroke="currentColor" strokeWidth={1}
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={
                      step > i
                        ? { pathLength: 1, opacity: phase === 'sync' ? 0.9 : 0.4 }
                        : {}
                    }
                    transition={{ duration: reduce ? 0 : 0.3, ease: 'easeOut' }}
                  />
                  {/* 未連：暗淡空心；連咗：著燈 */}
                  <circle cx={p.x} cy={p.y} r={4} fill="none"
                    stroke="currentColor" strokeOpacity={0.2} />
                  <motion.circle
                    cx={p.x} cy={p.y} r={4} fill="currentColor"
                    initial={{ opacity: 0 }}
                    animate={step > i ? { opacity: 1 } : {}}
                    transition={{ duration: reduce ? 0 : 0.2 }}
                  />
                </g>
              ))}

              {/* sync 階段：由中心擴散嘅脈衝 */}
              {phase === 'sync' && !reduce && (
                <motion.circle
                  cx={C} cy={C} fill="none"
                  stroke="currentColor" strokeWidth={1}
                  initial={{ r: 8, opacity: 0.8 }}
                  animate={{ r: 120, opacity: 0 }}
                  transition={{ duration: 0.85, ease: 'easeOut' }}
                />
              )}

              <circle cx={C} cy={C} r={5} fill="currentColor" />
            </svg>

            {/* 狀態行 */}
            <div className="mt-1 mb-4 text-[10px] font-mono tracking-[0.3em] uppercase text-text-muted">
              {phase === 'link'
                ? `establishing links · ${step}/${DEVICES.length}`
                : 'signal locked — one screen'}
            </div>

            {/* 終端 log — 同網絡圖同步出現 */}
            <div className="w-[300px] font-mono text-[11px] leading-[1.8] text-text-secondary">
              {DEVICES.slice(0, step).map((d) => (
                <motion.div
                  key={d}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.18 }}
                  className="flex gap-3"
                >
                  <span className="text-signal flex-shrink-0">[LINK]</span>
                  <span>device.{d} → control.plane ··· OK</span>
                </motion.div>
              ))}
              {phase === 'sync' && (
                <motion.div
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex gap-3"
                >
                  <span className="text-signal flex-shrink-0">[SYNC]</span>
                  <span>5 screens → one signal · welcome</span>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
