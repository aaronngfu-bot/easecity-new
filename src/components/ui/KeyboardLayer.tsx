'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Keyboard, X, Command, Signal, LayoutGrid, Tag, Info, Mail, Home, Zap } from 'lucide-react'

const KONAMI = [
  'arrowup', 'arrowup', 'arrowdown', 'arrowdown',
  'arrowleft', 'arrowright', 'arrowleft', 'arrowright',
  'b', 'a',
]

const PRIVILEGE_LOG = [
  '$ authenticating session…',
  '  fingerprint = 0x8a3f…c912',
  '$ unlocking privilege map…',
  '  level = DEVELOPER',
  '  tier  = founder',
  '$ injecting hidden telemetry…',
  '  ambient.hum = ON',
  '  broadcast.q = 2 pending',
  '  debug.cursor = enabled',
  '$ granted. welcome back.',
]

/**
 * Global keyboard layer.
 *
 * Handles:
 *   - `?`                            → open the shortcut cheatsheet
 *   - `g h/s/p/a/c`                  → navigate home/services/pricing/about/contact
 *   - `p`                            → emit signal ping at cursor position
 *   - Konami code (↑↑↓↓←→←→ba)      → privilege overlay
 *   - Listens for `easecity:toast`   → tiny bottom toast
 *   - Listens for `easecity:ping`    → signal-ping from cursor
 *   - Listens for `easecity:privilege` → konami overlay
 *   - Listens for `easecity:cheatsheet` → cheatsheet open
 */
export function KeyboardLayer() {
  const router = useRouter()
  const [cheatOpen, setCheatOpen] = useState(false)
  const [privilege, setPrivilege] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [pings, setPings] = useState<{ id: number; x: number; y: number }[]>([])

  const cursorRef = useRef({ x: 0, y: 0 })
  const gTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const awaitingGRef = useRef(false)
  const konamiBufRef = useRef<string[]>([])

  /** Track cursor position for signal pings. */
  useEffect(() => {
    const handle = (e: PointerEvent) => {
      cursorRef.current = { x: e.clientX, y: e.clientY }
    }
    window.addEventListener('pointermove', handle, { passive: true })
    return () => window.removeEventListener('pointermove', handle)
  }, [])

  /** Emit a signal ping at the current cursor location. */
  const emitPing = useCallback((x?: number, y?: number) => {
    const px = x ?? cursorRef.current.x
    const py = y ?? cursorRef.current.y
    const id = Date.now() + Math.random()
    setPings((prev) => [...prev, { id, x: px, y: py }])
    setTimeout(() => {
      setPings((prev) => prev.filter((p) => p.id !== id))
    }, 1000)
  }, [])

  /** Toast listener */
  useEffect(() => {
    const onToast = (e: Event) => {
      const detail = (e as CustomEvent).detail as { message?: string } | undefined
      if (detail?.message) {
        setToast(detail.message)
        setTimeout(() => setToast(null), 2400)
      }
    }
    window.addEventListener('easecity:toast', onToast)
    return () => window.removeEventListener('easecity:toast', onToast)
  }, [])

  /** Palette-triggered events */
  useEffect(() => {
    const onPing = () => emitPing()
    const onPriv = () => {
      setPrivilege(true)
    }
    const onCheat = () => setCheatOpen(true)
    window.addEventListener('easecity:ping', onPing)
    window.addEventListener('easecity:privilege', onPriv)
    window.addEventListener('easecity:cheatsheet', onCheat)
    return () => {
      window.removeEventListener('easecity:ping', onPing)
      window.removeEventListener('easecity:privilege', onPriv)
      window.removeEventListener('easecity:cheatsheet', onCheat)
    }
  }, [emitPing])

  /** Core keyboard handling */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return
      if (e.metaKey || e.ctrlKey || e.altKey) return

      const key = e.key.toLowerCase()

      // Konami buffer
      konamiBufRef.current.push(key)
      if (konamiBufRef.current.length > KONAMI.length) {
        konamiBufRef.current.shift()
      }
      if (
        konamiBufRef.current.length === KONAMI.length &&
        konamiBufRef.current.every((k, i) => k === KONAMI[i])
      ) {
        konamiBufRef.current = []
        setPrivilege(true)
      }

      // `?` — cheatsheet
      if (e.key === '?') {
        e.preventDefault()
        setCheatOpen((v) => !v)
        return
      }

      // `Escape` — close overlays
      if (e.key === 'Escape') {
        setCheatOpen(false)
        setPrivilege(false)
        return
      }

      // `p` — broadcast signal ping
      if (key === 'p' && !awaitingGRef.current) {
        e.preventDefault()
        emitPing()
        return
      }

      // `g` starts a nav sequence
      if (key === 'g' && !awaitingGRef.current) {
        awaitingGRef.current = true
        if (gTimerRef.current) clearTimeout(gTimerRef.current)
        gTimerRef.current = setTimeout(() => {
          awaitingGRef.current = false
        }, 900)
        return
      }

      // sequence resolution
      if (awaitingGRef.current) {
        awaitingGRef.current = false
        if (gTimerRef.current) clearTimeout(gTimerRef.current)

        const routes: Record<string, string> = {
          h: '/',
          s: '/services',
          p: '/pricing',
          a: '/about',
          c: '/contact',
          d: '/dashboard',
        }
        const target = routes[key]
        if (target) {
          e.preventDefault()
          router.push(target)
          return
        }
      }
    }

    window.addEventListener('keydown', handler)
    return () => {
      window.removeEventListener('keydown', handler)
      if (gTimerRef.current) clearTimeout(gTimerRef.current)
    }
  }, [emitPing, router])

  return (
    <>
      {/* Signal pings */}
      {pings.map((p) => (
        <span key={p.id}>
          <span
            className="signal-ping-core"
            style={{ left: `${p.x}px`, top: `${p.y}px` }}
          />
          <span
            className="signal-ping-ring"
            style={{ left: `${p.x}px`, top: `${p.y}px` }}
          />
        </span>
      ))}

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ y: 24, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 12, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed left-1/2 -translate-x-1/2 bottom-20 z-[110] glass-panel px-4 py-2.5 text-sm text-signal flex items-center gap-2 !rounded-full"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-signal animate-signal-pulse" />
            <span className="font-mono tracking-wider">{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cheatsheet */}
      <ShortcutCheatsheet open={cheatOpen} onClose={() => setCheatOpen(false)} />

      {/* Konami privilege overlay */}
      <PrivilegeOverlay open={privilege} onClose={() => setPrivilege(false)} />
    </>
  )
}

function isTypingTarget(t: EventTarget | null): boolean {
  if (!(t instanceof HTMLElement)) return false
  const tag = t.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true
  if (t.isContentEditable) return true
  return false
}

// ────────────────────────────────────────────────────────────────────────────
// Cheatsheet
// ────────────────────────────────────────────────────────────────────────────

function ShortcutCheatsheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const groups = [
    {
      title: 'NAVIGATE',
      items: [
        { keys: ['G', 'H'], label: 'Home', icon: Home },
        { keys: ['G', 'S'], label: 'Services', icon: LayoutGrid },
        { keys: ['G', 'P'], label: 'Pricing', icon: Tag },
        { keys: ['G', 'A'], label: 'About', icon: Info },
        { keys: ['G', 'C'], label: 'Contact', icon: Mail },
      ],
    },
    {
      title: 'SYSTEM',
      items: [
        { keys: ['⌘', 'K'], label: 'Open command palette', icon: Command },
        { keys: ['/'], label: 'Open command palette', icon: Command },
        { keys: ['P'], label: 'Emit signal ping at cursor', icon: Signal },
        { keys: ['?'], label: 'Toggle this cheatsheet', icon: Keyboard },
        { keys: ['ESC'], label: 'Close any overlay', icon: X },
      ],
    },
    {
      title: 'HERO',
      items: [
        { keys: ['SPACE'], label: 'Broadcast on homepage hero', icon: Zap },
      ],
    },
    {
      title: 'SECRETS',
      items: [
        { keys: ['↑', '↑', '↓', '↓', '←', '→', '←', '→', 'B', 'A'], label: 'Unlock system privilege', icon: Signal },
      ],
    },
  ]

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[105] flex items-center justify-center px-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) onClose()
          }}
        >
          <div className="absolute inset-0 bg-bg-base/60 backdrop-blur-sm" />

          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 8 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.2, 0.8, 0.25, 1] }}
            className="relative w-full max-w-lg glass-panel p-6 md:p-7"
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-signal animate-signal-pulse" />
                <span className="label-mono text-signal/80">KEYBOARD.MAP</span>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-text-muted hover:text-signal hover:bg-signal/5 transition-colors"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            <h3 className="font-display text-xl font-bold text-text-primary mb-1">Shortcuts</h3>
            <p className="text-text-secondary text-sm mb-6">Everything this site responds to.</p>

            <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-1">
              {groups.map((g) => (
                <div key={g.title}>
                  <p className="label-mono mb-3">{g.title}</p>
                  <ul className="space-y-2">
                    {g.items.map((it, i) => (
                      <li key={i} className="flex items-center justify-between gap-3 text-sm group">
                        <span className="flex items-center gap-2.5 text-text-secondary group-hover:text-text-primary transition-colors">
                          <it.icon size={14} className="text-text-muted" />
                          {it.label}
                        </span>
                        <span className="flex items-center gap-1">
                          {it.keys.map((k, ki) => (
                            <span key={ki} className="kbd">{k}</span>
                          ))}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-border/60 flex items-center justify-between text-[11px] text-text-muted font-mono tracking-wider">
              <span>DISCOVERED SURFACE: 4 / 5</span>
              <span>v1.0.0</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ────────────────────────────────────────────────────────────────────────────
// Privilege overlay (konami)
// ────────────────────────────────────────────────────────────────────────────

function PrivilegeOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [lines, setLines] = useState<string[]>([])

  useEffect(() => {
    if (!open) {
      setLines([])
      return
    }
    let i = 0
    const iv = setInterval(() => {
      if (i >= PRIVILEGE_LOG.length) {
        clearInterval(iv)
        return
      }
      setLines((prev) => [...prev, PRIVILEGE_LOG[i]])
      i += 1
    }, 140)
    return () => clearInterval(iv)
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[115] flex items-center justify-center px-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) onClose()
          }}
        >
          {/* Vignette */}
          <div className="absolute inset-0 bg-bg-base/70 backdrop-blur-md" />
          <div className="absolute inset-0 scanlines opacity-60 pointer-events-none" />

          <motion.div
            initial={{ scale: 0.96, opacity: 0, y: 8 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.98, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.2, 0.8, 0.25, 1] }}
            className="relative w-full max-w-md glass-prominent p-6 md:p-7 overflow-hidden"
          >
            <div className="privilege-scan" />
            <div className="flex items-center justify-between mb-5 relative z-10">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-signal animate-signal-pulse" />
                <span className="label-mono text-signal/80">SYSTEM.PRIVILEGE</span>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-text-muted hover:text-signal hover:bg-signal/5 transition-colors"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            <h3 className="relative z-10 font-display text-2xl font-bold text-signal mb-2">
              Privilege granted.
            </h3>
            <p className="relative z-10 text-text-secondary text-sm mb-5">
              You found the console. Most people never do.
            </p>

            <div className="relative z-10 glass-panel !rounded-xl p-4 font-mono text-[11px] text-text-secondary leading-relaxed min-h-[12rem]">
              {lines.map((line, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                  className={line.startsWith('$') ? 'text-signal' : 'text-text-muted'}
                >
                  {line}
                </motion.div>
              ))}
              {lines.length < PRIVILEGE_LOG.length && (
                <span className="text-signal">_</span>
              )}
            </div>

            <p className="relative z-10 mt-5 text-[11px] text-text-muted font-mono tracking-wider">
              Tell no one. ESC to close.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
