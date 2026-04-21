'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const LINES = [
  { t: 'INIT', msg: 'easecity v1.0 · stream control runtime', ms: 180 },
  { t: 'CONNECT', msg: 'DEVICE_A → control.plane .................. OK', ms: 220 },
  { t: 'REGISTER', msg: 'endpoints 5/5 online ..................... OK', ms: 220 },
  { t: 'SYNC', msg: 'bidirectional handshake .................. OK', ms: 220 },
  { t: 'READY', msg: 'system operational — welcome', ms: 260 },
]

const STORAGE_KEY = 'easecity-booted-v1'
const SKIP_BEFORE = 12 * 60 * 60 * 1000

export function BootSequence() {
  const [visible, setVisible] = useState(false)
  const [step, setStep] = useState(0)

  useEffect(() => {
    try {
      const last = localStorage.getItem(STORAGE_KEY)
      const ts = last ? parseInt(last, 10) : 0
      if (!Number.isNaN(ts) && Date.now() - ts < SKIP_BEFORE) {
        return
      }
    } catch {
      /* noop */
    }
    setVisible(true)
  }, [])

  useEffect(() => {
    if (!visible) return
    if (step >= LINES.length) {
      const t = setTimeout(() => {
        setVisible(false)
        try {
          localStorage.setItem(STORAGE_KEY, Date.now().toString())
        } catch {
          /* noop */
        }
      }, 480)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setStep((s) => s + 1), LINES[step].ms)
    return () => clearTimeout(t)
  }, [visible, step])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="boot"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45 }}
          className="fixed inset-0 z-[999] bg-bg-base flex items-center justify-center overflow-hidden"
        >
          <div className="absolute inset-0 bg-rule-grid opacity-20 pointer-events-none" />
          <div className="absolute inset-0 bg-grain opacity-40 pointer-events-none mix-blend-overlay" />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25 }}
            className="relative z-10 w-full max-w-xl px-6"
          >
            <div className="mb-6 flex items-center gap-2 text-[10px] font-mono tracking-[0.25em] text-signal uppercase">
              <span className="relative flex w-1.5 h-1.5">
                <span className="absolute inline-flex w-full h-full rounded-full bg-signal opacity-75 animate-ping" />
                <span className="relative inline-flex rounded-full w-1.5 h-1.5 bg-signal" />
              </span>
              Booting easecity
            </div>
            <div className="font-mono text-[12px] md:text-sm leading-[1.9] text-text-secondary">
              {LINES.slice(0, step).map((l, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.18 }}
                  className="flex items-start gap-3"
                >
                  <span className="text-signal w-[76px] flex-shrink-0">
                    [{l.t}]
                  </span>
                  <span className="text-text-secondary">{l.msg}</span>
                </motion.div>
              ))}
              {step < LINES.length && (
                <div className="flex items-start gap-3">
                  <span className="text-signal w-[76px] flex-shrink-0 animate-pulse">
                    [{LINES[step].t}]
                  </span>
                  <span className="text-text-muted">
                    <span className="terminal-caret" />
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
