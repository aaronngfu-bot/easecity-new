'use client'

import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home, LayoutGrid, Tag, Info, Mail, Zap, ShieldCheck, Cpu, Building2,
  Languages, Mail as MailIcon, Keyboard, Signal, CornerDownLeft, Search,
  LogIn, LayoutDashboard,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/context/LanguageContext'

type CommandItem = {
  id: string
  label: string
  sub?: string
  group: string
  icon: React.ElementType
  keywords?: string
  kbd?: string
  action: () => void
}

/** Utility to fire global custom events for easter-egg triggers */
function fire(name: string, detail?: unknown) {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(name, { detail }))
}

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIdx, setActiveIdx] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { language, setLanguage } = useLanguage()

  const items: CommandItem[] = useMemo(() => {
    const nav = (href: string, label: string, sub: string, icon: React.ElementType, kbd?: string): CommandItem => ({
      id: `nav:${href}`,
      label,
      sub,
      group: 'NAVIGATE',
      icon,
      keywords: `${label} ${sub} ${href}`,
      kbd,
      action: () => {
        router.push(href)
      },
    })
    const plan = (href: string, label: string, sub: string, icon: React.ElementType): CommandItem => ({
      id: `plan:${label}`,
      label,
      sub,
      group: 'PLANS',
      icon,
      keywords: `plan pricing ${label}`,
      action: () => {
        router.push(href)
      },
    })
    const action = (id: string, label: string, sub: string, icon: React.ElementType, fn: () => void, kbd?: string): CommandItem => ({
      id,
      label,
      sub,
      group: 'ACTIONS',
      icon,
      kbd,
      action: fn,
    })
    const secret = (id: string, label: string, sub: string, icon: React.ElementType, fn: () => void): CommandItem => ({
      id,
      label,
      sub,
      group: 'SYSTEM',
      icon,
      action: fn,
    })

    return [
      nav('/', 'Home', 'Editorial hero + live control', Home, 'G H'),
      nav('/services', 'Services', 'Stream control + use cases + roadmap', LayoutGrid, 'G S'),
      nav('/pricing', 'Pricing', '4 plans — starter to enterprise', Tag, 'G P'),
      nav('/about', 'About', 'Philosophy + tech vision', Info, 'G A'),
      nav('/contact', 'Contact', 'Reach the team', Mail, 'G C'),
      nav('/dashboard', 'Dashboard', 'Control deck', LayoutDashboard),
      nav('/login', 'Sign in', 'Auth entry', LogIn),

      plan('/pricing#starter', 'Starter — $49/mo', 'Small devices, basic control', Cpu),
      plan('/pricing#pro', 'Pro — $149/mo', 'Most popular, full stream control', Zap),
      plan('/pricing#business', 'Business — $399/mo', 'Advanced SLA + analytics', ShieldCheck),
      plan('/pricing#enterprise', 'Enterprise — Custom', 'Tailored, dedicated infra', Building2),

      action('copy-email', 'Copy contact email', 'hello@easecity.com → clipboard', MailIcon, async () => {
        try {
          await navigator.clipboard.writeText('hello@easecity.com')
          fire('easecity:toast', { message: 'hello@easecity.com copied' })
        } catch {
          fire('easecity:toast', { message: 'Copy failed — try again' })
        }
      }),
      action('toggle-lang', `Switch language → ${language === 'en' ? 'zh' : 'en'}`, 'Toggle UI language', Languages, () => {
        setLanguage(language === 'en' ? 'zh' : 'en')
      }, 'EN/ZH'),
      action('show-shortcuts', 'Show all shortcuts', 'Full keyboard cheatsheet', Keyboard, () => {
        fire('easecity:cheatsheet')
      }, '?'),
      action('broadcast', 'Broadcast signal ping', 'Emit a signal wave from cursor', Signal, () => {
        fire('easecity:ping')
      }, 'P'),

      secret('konami', '⌃ Unlock system privilege', 'Enter the Konami code to reveal', Signal, () => {
        fire('easecity:privilege')
      }),
    ]
  }, [router, language, setLanguage])

  /** Filtered items (fuzzy) */
  const filtered = useMemo(() => {
    if (!query.trim()) return items
    const q = query.toLowerCase()
    return items.filter((it) => {
      const hay = `${it.label} ${it.sub ?? ''} ${it.keywords ?? ''} ${it.group}`.toLowerCase()
      return hay.includes(q)
    })
  }, [items, query])

  /** Group filtered items */
  const grouped = useMemo(() => {
    const map = new Map<string, CommandItem[]>()
    for (const it of filtered) {
      if (!map.has(it.group)) map.set(it.group, [])
      map.get(it.group)!.push(it)
    }
    return Array.from(map.entries())
  }, [filtered])

  /** Flat list for arrow-key navigation */
  const flat = useMemo(() => filtered, [filtered])

  useEffect(() => {
    setActiveIdx(0)
  }, [query, open])

  // Listen for global open triggers
  useEffect(() => {
    const toggle = () => setOpen((v) => !v)
    const openIt = () => setOpen(true)
    const closeIt = () => setOpen(false)
    window.addEventListener('easecity:palette:toggle', toggle)
    window.addEventListener('easecity:palette:open', openIt)
    window.addEventListener('easecity:palette:close', closeIt)
    return () => {
      window.removeEventListener('easecity:palette:toggle', toggle)
      window.removeEventListener('easecity:palette:open', openIt)
      window.removeEventListener('easecity:palette:close', closeIt)
    }
  }, [])

  // Keyboard shortcut: Cmd/Ctrl+K or `/` (when not in input)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isModK = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k'
      const isSlash = e.key === '/' && !isTypingTarget(e.target)
      if (isModK || isSlash) {
        e.preventDefault()
        setOpen((v) => !v)
      }
      if (e.key === 'Escape') {
        setOpen(false)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // Focus input on open
  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => inputRef.current?.focus())
    } else {
      setQuery('')
    }
  }, [open])

  const runItem = useCallback((it: CommandItem) => {
    setOpen(false)
    // let palette close first
    requestAnimationFrame(() => it.action())
  }, [])

  const onInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIdx((i) => Math.min(i + 1, flat.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIdx((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const it = flat[activeIdx]
      if (it) runItem(it)
    }
  }

  // Scroll active item into view
  useEffect(() => {
    if (!listRef.current) return
    const el = listRef.current.querySelector<HTMLElement>(`[data-idx="${activeIdx}"]`)
    el?.scrollIntoView({ block: 'nearest' })
  }, [activeIdx])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] md:pt-[18vh] px-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setOpen(false)
          }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-bg-base/60 backdrop-blur-sm" aria-hidden="true" />

          <motion.div
            initial={{ y: -12, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -8, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.2, 0.8, 0.25, 1] }}
            className="relative w-full max-w-xl glass-panel !rounded-2xl overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
          >
            {/* Search input */}
            <div className="relative flex items-center gap-3 px-4 py-3.5 border-b border-border/60">
              <Search size={16} className="text-text-muted flex-shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onInputKeyDown}
                placeholder="Type a command or search…"
                className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none"
                spellCheck={false}
              />
              <span className="kbd">ESC</span>
            </div>

            {/* Results */}
            <div ref={listRef} className="max-h-[52vh] overflow-y-auto py-2">
              {flat.length === 0 ? (
                <div className="px-5 py-12 text-center">
                  <p className="font-mono text-[10px] tracking-[0.25em] text-text-muted mb-2">NO.MATCHES</p>
                  <p className="text-sm text-text-secondary">Try a different query.</p>
                </div>
              ) : (
                grouped.map(([group, list]) => (
                  <div key={group} className="pb-2">
                    <div className="px-4 py-2 label-mono text-text-muted/70">
                      {group}
                    </div>
                    {list.map((it) => {
                      const idx = flat.findIndex((x) => x.id === it.id)
                      const active = idx === activeIdx
                      const Icon = it.icon
                      return (
                        <button
                          key={it.id}
                          data-idx={idx}
                          onMouseEnter={() => setActiveIdx(idx)}
                          onClick={() => runItem(it)}
                          className={cn(
                            'relative w-full text-left flex items-center gap-3 px-4 py-2.5 transition-colors',
                            active ? 'bg-signal/8' : 'hover:bg-bg-base/40'
                          )}
                        >
                          {active && (
                            <span className="absolute left-0 top-0 bottom-0 w-[2px] bg-signal" />
                          )}
                          <div
                            className={cn(
                              'w-8 h-8 rounded-lg border flex items-center justify-center flex-shrink-0 transition-colors',
                              active
                                ? 'bg-signal/12 border-signal/30 text-signal'
                                : 'bg-bg-base/60 border-border text-text-muted'
                            )}
                          >
                            <Icon size={14} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={cn('text-sm truncate', active ? 'text-text-primary' : 'text-text-secondary')}>
                              {it.label}
                            </p>
                            {it.sub && (
                              <p className="text-xs text-text-muted truncate">{it.sub}</p>
                            )}
                          </div>
                          {it.kbd && (
                            <span className="flex items-center gap-1">
                              {it.kbd.split(' ').map((k, i) => (
                                <span key={i} className="kbd">
                                  {k}
                                </span>
                              ))}
                            </span>
                          )}
                          {active && (
                            <CornerDownLeft size={13} className="text-signal ml-1" />
                          )}
                        </button>
                      )
                    })}
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between gap-4 px-4 py-2.5 border-t border-border/60 bg-bg-base/40 text-[11px] text-text-muted font-mono tracking-wider">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5">
                  <span className="kbd">↑</span>
                  <span className="kbd">↓</span>
                  navigate
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="kbd">↵</span>
                  select
                </span>
                <span className="hidden sm:flex items-center gap-1.5">
                  <span className="kbd">?</span>
                  shortcuts
                </span>
              </div>
              <span className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-signal animate-signal-pulse" />
                <span className="text-signal">LIVE</span>
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function isTypingTarget(t: EventTarget | null): boolean {
  if (!(t instanceof HTMLElement)) return false
  const tag = t.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true
  if (t.isContentEditable) return true
  return false
}
