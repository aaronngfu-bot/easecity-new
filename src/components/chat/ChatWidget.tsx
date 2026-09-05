'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { MessageCircle, X, Send, Bot, User, Headset, UserRound, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/context/LanguageContext'
import { EASE_OUT } from '@/lib/motion'

type Mode = 'ai' | 'human-form' | 'human-chat'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
}

const POLL_MS = 4000
/** Fake "thinking" window so EC feels deliberate instead of instant. */
const THINK_MIN_MS = 900
const THINK_MAX_MS = 1800
const thinkDelay = () => THINK_MIN_MS + Math.random() * (THINK_MAX_MS - THINK_MIN_MS)

/** Common questions surfaced as one-tap chips above the input. */
function useFaqs(): { q: string; a: string }[] {
  const { language } = useLanguage()
  return language === 'zh-CN'
    ? [
        { q: 'EC-Share 是什么？', a: 'EC-Share 是一款 Windows 桌面应用，通过 USB 把多部 Android 设备实时镜像到电脑，用键盘鼠标集中控制，并支持把画面分享给团队。' },
        { q: '价格是多少？', a: '14 天免费试用。Pro US$19/月（或 $190/年）适合个人镜像；Business US$49/月（或 $490/年）加入桌对桌分享、座位与审计记录；企业版按需求报价。' },
        { q: '支持哪些设备？', a: '桌面端支持 Windows 10/11；设备端支持 Android（USB 调试开启即可）。' },
        { q: '你们提供哪些服务？', a: '系统开发（实时/低延迟）、网页平台（全栈，含验证、账单、文档）、UI/UX 设计、广告投放与技术咨询。' },
        { q: '项目一般多久完成？', a: '需求探索 1–3 天，之后每周演示迭代。聚焦的网页平台通常 4–8 周出 MVP；更大的系统在探索后给出时程。' },
      ]
    : language === 'zh'
      ? [
          { q: 'EC-Share 是什麼？', a: 'EC-Share 是一款 Windows 桌面應用，透過 USB 把多部 Android 裝置即時鏡像到電腦，用鍵盤滑鼠集中控制，並支持把畫面分享給團隊。' },
          { q: '價格是多少？', a: '14 天免費試用。Pro US$19／月（或 $190／年）適合個人鏡像；Business US$49／月（或 $490／年）加入桌對桌分享、座位與審計紀錄；企業版按需求報價。' },
          { q: '支援哪些裝置？', a: '桌面端支援 Windows 10/11；裝置端支援 Android（開啟 USB 偵錯即可）。' },
          { q: '你們提供哪些服務？', a: '系統開發（即時／低延遲）、網頁平台（全端，含驗證、帳單、文檔）、UI/UX 設計、廣告投放與技術諮詢。' },
          { q: '項目一般多久完成？', a: '需求探索 1–3 天，之後每週演示迭代。聚焦的網頁平台通常 4–8 週出 MVP；更大的系統在探索後給出時程。' },
        ]
      : [
          { q: 'What is EC-Share?', a: 'EC-Share is a Windows desktop app that mirrors multiple Android devices to your computer over USB in real time — control them with keyboard and mouse, and share screens with your team.' },
          { q: 'How much does it cost?', a: '14-day free trial. Pro is US$19/mo (or $190/yr) for personal mirroring; Business is US$49/mo (or $490/yr) with desktop-to-desktop sharing, seats and audit history; Enterprise is custom-quoted.' },
          { q: 'Which devices are supported?', a: 'Desktop: Windows 10/11. Devices: Android with USB debugging enabled.' },
          { q: 'What services do you offer?', a: 'System development (real-time/low-latency), web platforms (full-stack with auth, billing, docs), UI/UX design, advertising, and consulting.' },
          { q: 'How long does a project take?', a: 'Discovery takes 1–3 days, then weekly demo cycles. A focused web platform usually ships an MVP in 4–8 weeks; larger systems are scoped after discovery.' },
        ]
}

/**
 * Support chat widget for "EC" — the site's AI persona. Two layers:
 *  - AI mode: OpenRouter-backed assistant with one-tap FAQ chips and a short
 *    deliberate "thinking" pause before each answer.
 *  - Human mode: the visitor escalates (optional email), the team gets a
 *    magic-link email, and agent replies are polled into the same bubble
 *    stream. Sessions live in SupportSession/SupportMessage.
 * A noticeable invitation bubble pops once per visitor per day.
 */
export function ChatWidget() {
  const { t, language } = useLanguage()
  const reduce = useReducedMotion()
  const [isOpen, setIsOpen] = useState(false)
  const [noticeOpen, setNoticeOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mode, setMode] = useState<Mode>('ai')
  const [humanForm, setHumanForm] = useState({ name: '', email: '', question: '' })
  const [escalating, setEscalating] = useState(false)
  const [sessionToken, setSessionToken] = useState<string | null>(null)
  const [sessionEnded, setSessionEnded] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)
  const faqs = useFaqs()

  const c = t.chat

  /* Auto-open the invitation bubble once per day (localStorage-gated). */
  useEffect(() => {
    try {
      const key = 'ec-chat-notice'
      const last = Number(localStorage.getItem(key) || 0)
      if (Date.now() - last > 1000 * 60 * 60 * 24) {
        const show = setTimeout(() => {
          setNoticeOpen(true)
          localStorage.setItem(key, String(Date.now()))
        }, 2500)
        const hide = setTimeout(() => setNoticeOpen(false), 18_000)
        return () => { clearTimeout(show); clearTimeout(hide) }
      }
    } catch { /* storage unavailable */ }
  }, [])

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages, isLoading])

  useEffect(() => () => { abortRef.current?.abort() }, [])

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen])

  /* ── AI reply (with a deliberate thinking pause) ── */
  const askAi = useCallback((text: string) => {
    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: 'user', content: text }
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setMessages(prev => {
      const updated = [...prev, userMsg]
      const started = Date.now()
      fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          messages: [
            { id: 'welcome', role: 'assistant' as const, content: c.welcome },
            ...updated,
          ].map(m => ({ role: m.role === 'system' ? 'assistant' : m.role, content: m.content })),
        }),
      }).then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data.error || c.error)
        }
        const data = await res.json()
        // Keep the typing indicator up for at least one think-window so the
        // pause reads as "EC is thinking", not a network round-trip.
        const elapsed = Date.now() - started
        const wait = Math.max(0, thinkDelay() - elapsed)
        if (wait > 0) await new Promise(r => setTimeout(r, wait))
        if (controller.signal.aborted) return
        setMessages(prev2 => [...prev2, { id: data.id || `a-${Date.now()}`, role: 'assistant', content: data.content }])
      }).catch((err) => {
        if (err instanceof DOMException && err.name === 'AbortError') return
        setError(err instanceof Error ? err.message : c.error)
      }).finally(() => {
        if (!controller.signal.aborted) setIsLoading(false)
      })
      return updated
    })
    setIsLoading(true)
    setError(null)
  }, [c.welcome, c.error])

  /* ── Human session polling ── */
  useEffect(() => {
    if (mode !== 'human-chat' || !sessionToken || sessionEnded) return
    let alive = true
    let lastIso: string | undefined

    const poll = async () => {
      try {
        const res = await fetch(`/api/support/messages?token=${encodeURIComponent(sessionToken)}${lastIso ? `&after=${encodeURIComponent(lastIso)}` : ''}`)
        if (!res.ok) return
        const d = await res.json()
        if (!alive || !d.success) return
        if (d.data.status === 'closed') {
          setSessionEnded(true)
          setMessages(prev => [...prev, { id: `sys-${Date.now()}`, role: 'system', content: c.ended }])
          return
        }
        const fresh: ChatMessage[] = (d.data.messages || [])
          .filter((m: { role: string }) => m.role === 'agent' || m.role === 'system')
          .map((m: { id: string; role: string; content: string }) => ({
            id: m.id, role: m.role === 'system' ? 'system' : 'assistant', content: m.content,
          }))
        const all = d.data.messages || []
        if (all.length > 0) lastIso = all[all.length - 1].createdAt
        if (fresh.length > 0) setMessages(prev => {
          const seen = new Set(prev.map(p => p.id))
          return [...prev, ...fresh.filter(f => !seen.has(f.id))]
        })
      } catch { /* transient */ }
    }

    poll()
    const timer = setInterval(poll, POLL_MS)
    return () => { alive = false; clearInterval(timer) }
  }, [mode, sessionToken, sessionEnded, c.ended])

  /* ── Escalate to human ── */
  const escalate = async () => {
    if (!humanForm.question.trim() || escalating) return
    setEscalating(true)
    setError(null)
    try {
      const res = await fetch('/api/support/escalate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: humanForm.question,
          name: humanForm.name || undefined,
          email: humanForm.email || undefined,
          language,
          pageUrl: typeof window !== 'undefined' ? window.location.pathname : undefined,
        }),
      })
      const d = await res.json()
      if (!res.ok || !d.success) throw new Error(d.error?.message || c.error)
      setSessionToken(d.data.visitorToken)
      setMode('human-chat')
      setMessages([{ id: 'q', role: 'user', content: humanForm.question }])
      setHumanForm({ name: '', email: '', question: '' })
    } catch (err) {
      setError(err instanceof Error ? err.message : c.error)
    } finally { setEscalating(false) }
  }

  const sendHumanMessage = async () => {
    if (!input.trim() || !sessionToken) return
    const text = input.trim()
    setInput('')
    setMessages(prev => [...prev, { id: `u-${Date.now()}`, role: 'user', content: text }])
    try {
      await fetch('/api/support/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sessionToken, content: text }),
      })
    } catch { setError(c.error) }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    const text = input.trim()
    setInput('')
    if (mode === 'ai') { if (!isLoading) askAi(text) }
    else if (mode === 'human-chat') sendHumanMessage()
  }

  const openChat = () => { setIsOpen(true); setNoticeOpen(false) }

  const allMessages: ChatMessage[] = mode === 'ai'
    ? [{ id: 'welcome', role: 'assistant', content: c.welcome }, ...messages]
    : messages

  const showFaqChips = mode === 'ai' && messages.length === 0

  /* message bubble enter animation */
  const bubbleAnim = reduce
    ? {}
    : {
        initial: { opacity: 0, y: 8, scale: 0.98 },
        animate: { opacity: 1, y: 0, scale: 1 },
        transition: { duration: 0.25, ease: EASE_OUT },
      }

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.24, ease: EASE_OUT }}
            style={{ transformOrigin: 'bottom right' }}
            className="glass-panel !rounded-2xl fixed bottom-24 left-4 right-4 z-50 flex max-h-[min(580px,calc(100dvh-7rem))] flex-col overflow-hidden shadow-[0_16px_48px_-12px_rgba(0,0,0,0.35)] sm:left-auto sm:right-6 sm:w-[390px]"
            role="dialog"
            aria-modal="false"
            aria-label={c.title}
          >
            {/* header */}
            <div className="flex items-center justify-between gap-2 border-b border-border/60 bg-bg-base/40 px-4 py-3">
              <div className="flex min-w-0 items-center gap-2.5">
                <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-signal/25 bg-signal/15">
                  {mode === 'human-chat' ? <Headset size={15} className="text-signal" aria-hidden="true" /> : <Bot size={15} className="text-signal" aria-hidden="true" />}
                  <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-bg-base bg-emerald-400 motion-safe:animate-pulse" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-text-primary">
                    {mode === 'human-chat' ? c.human : c.title}
                    {mode !== 'human-chat' && <span className="ml-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-text-muted">AI</span>}
                  </p>
                  <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-signal">
                    <span className="h-1 w-1 animate-signal-pulse rounded-full bg-signal" aria-hidden="true" />
                    {mode === 'human-chat' ? (isLoading || escalating ? c.agentTyping : c.online) : c.online}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                {mode === 'ai' && (
                  <button
                    type="button"
                    onClick={() => setMode('human-form')}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-signal/25 bg-signal/10 px-2.5 py-1.5 text-xs font-medium text-signal transition-colors hover:bg-signal/15"
                    title={c.human}
                  >
                    <UserRound size={13} aria-hidden="true" />
                    <span className="hidden sm:inline">{c.human}</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-signal/5 hover:text-signal"
                  aria-label={c.close}
                >
                  <X size={16} aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* human escalation form */}
            {mode === 'human-form' ? (
              <div className="flex-1 space-y-3 overflow-y-auto p-4">
                <p className="text-sm leading-relaxed text-text-secondary">{c.humanIntro}</p>
                <input
                  value={humanForm.name}
                  onChange={(e) => setHumanForm(f => ({ ...f, name: e.target.value }))}
                  placeholder={c.humanName}
                  maxLength={120}
                  className="glass-input !py-2 !text-sm"
                  aria-label={c.humanName}
                />
                <input
                  value={humanForm.email}
                  onChange={(e) => setHumanForm(f => ({ ...f, email: e.target.value }))}
                  placeholder={c.humanEmail}
                  type="email"
                  maxLength={255}
                  className="glass-input !py-2 !text-sm"
                  aria-label={c.humanEmail}
                />
                <textarea
                  value={humanForm.question}
                  onChange={(e) => setHumanForm(f => ({ ...f, question: e.target.value }))}
                  placeholder={c.humanQuestion}
                  rows={4}
                  maxLength={4000}
                  className="glass-input resize-none !text-sm"
                  aria-label={c.humanQuestion}
                />
                <button
                  type="button"
                  onClick={escalate}
                  disabled={escalating || !humanForm.question.trim()}
                  className="glass-cta inline-flex w-full items-center justify-center gap-2 !py-2.5 !text-sm disabled:opacity-40"
                >
                  <Headset size={15} aria-hidden="true" />
                  {c.humanSend}
                </button>
                <p className="text-center text-[11px] leading-relaxed text-text-muted">{c.humanEmailHint}</p>
                <button
                  type="button"
                  onClick={() => setMode('ai')}
                  className="w-full text-center text-xs text-text-muted underline-offset-2 hover:text-signal hover:underline"
                >
                  ← {c.title}
                </button>
              </div>
            ) : (
              <>
                {/* messages */}
                <div ref={scrollRef} className="min-h-[280px] flex-1 space-y-3.5 overflow-y-auto px-4 py-4">
                  {allMessages.map((msg, i) => (
                    msg.role === 'system' ? (
                      <motion.div key={msg.id} {...bubbleAnim} className="flex justify-center">
                        <span className="rounded-full border border-border bg-bg-elevated px-3 py-1 text-center font-mono text-[10px] uppercase tracking-[0.12em] text-text-muted">
                          {msg.content}
                        </span>
                      </motion.div>
                    ) : (
                      <motion.div
                        key={msg.id}
                        {...(i >= allMessages.length - 3 ? bubbleAnim : {})}
                        className={cn('flex gap-2.5', msg.role === 'user' ? 'flex-row-reverse' : 'flex-row')}
                      >
                        <div className={cn(
                          'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border',
                          msg.role === 'user'
                            ? 'border-border bg-bg-elevated'
                            : mode === 'human-chat' ? 'border-signal/30 bg-signal/20' : 'border-signal/25 bg-signal/15'
                        )}>
                          {msg.role === 'user'
                            ? <User size={12} className="text-text-secondary" aria-hidden="true" />
                            : mode === 'human-chat' ? <Headset size={12} className="text-signal" aria-hidden="true" /> : <Bot size={12} className="text-signal" aria-hidden="true" />}
                        </div>
                        <div className={cn(
                          'max-w-[82%] min-w-0 break-words px-3.5 py-2.5 text-sm leading-relaxed',
                          msg.role === 'user'
                            ? 'rounded-2xl rounded-br-md border border-border bg-bg-elevated text-text-primary'
                            : 'rounded-2xl rounded-bl-md border border-border/50 bg-bg-base/70 text-text-secondary'
                        )}>
                          {msg.content}
                        </div>
                      </motion.div>
                    )
                  ))}
                  {isLoading && (
                    <motion.div
                      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2.5"
                      role="status"
                      aria-live="polite"
                    >
                      <span className="sr-only">{c.typing}</span>
                      <div className="flex h-6 w-6 items-center justify-center rounded-full border border-signal/25 bg-signal/15">
                        <Bot size={12} className="text-signal" aria-hidden="true" />
                      </div>
                      <div className="flex items-center gap-2.5 rounded-2xl rounded-bl-md border border-border/50 bg-bg-base/70 px-3.5 py-2.5">
                        <span className="flex gap-1" aria-hidden="true">
                          <span className="h-1.5 w-1.5 rounded-full bg-signal/70 motion-safe:animate-bounce" />
                          <span className="h-1.5 w-1.5 rounded-full bg-signal/70 motion-safe:animate-bounce [animation-delay:150ms]" />
                          <span className="h-1.5 w-1.5 rounded-full bg-signal/70 motion-safe:animate-bounce [animation-delay:300ms]" />
                        </span>
                        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted">
                          {mode === 'human-chat' ? c.agentTyping : c.typing}
                        </span>
                      </div>
                    </motion.div>
                  )}
                  {error && (
                    <div role="alert" className="break-words py-2 text-center text-xs text-status-danger">
                      {error}
                    </div>
                  )}
                </div>

                {/* FAQ chips */}
                <AnimatePresence>
                  {showFaqChips && (
                    <motion.div
                      initial={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
                      transition={{ duration: 0.25, ease: EASE_OUT }}
                      className="overflow-hidden border-t border-border/60 bg-bg-base/30 px-3 pb-1 pt-2.5"
                    >
                      <p className="mb-2 flex items-center gap-1 font-mono text-[9px] uppercase tracking-[0.16em] text-text-muted">
                        <Sparkles size={9} className="text-signal" /> {c.faqTitle}
                      </p>
                      <div className="flex flex-wrap gap-1.5 pb-1.5">
                        {faqs.map((f, i) => (
                          <motion.button
                            key={f.q}
                            type="button"
                            initial={reduce ? {} : { opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.22, ease: EASE_OUT, delay: 0.05 * i }}
                            onClick={() => {
                              setMessages(prev => [
                                ...prev,
                                { id: `u-${f.q}`, role: 'user', content: f.q },
                                { id: `a-${f.q}`, role: 'assistant', content: f.a },
                              ])
                            }}
                            className="rounded-full border border-signal/25 bg-signal/5 px-3 py-1.5 text-xs text-signal transition-all hover:border-signal/50 hover:bg-signal/15 motion-safe:hover:-translate-y-px"
                          >
                            {f.q}
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* input */}
                <form onSubmit={handleSubmit} className={cn('flex gap-2 border-t border-border/60 bg-bg-base/40 p-3', !showFaqChips && 'border-t-0')}>
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={mode === 'human-chat' ? c.humanQuestion : c.placeholder}
                    maxLength={2000}
                    className="glass-input min-w-0 flex-1 !py-2 !text-sm"
                    aria-label={c.placeholder}
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className="glass-cta inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg !px-3 disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label={c.send}
                  >
                    <Send size={16} aria-hidden="true" />
                  </button>
                </form>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* invitation bubble — prominent: avatar, brand ring, gentle bounce-in */}
      <AnimatePresence>
        {noticeOpen && !isOpen && (
          <motion.div
            initial={reduce ? { opacity: 0, y: 10 } : { opacity: 0, y: 16, scale: 0.85 }}
            animate={
              reduce
                ? { opacity: 1, y: 0 }
                : { opacity: 1, y: [0, -6, 0], scale: 1, transition: { y: { repeat: 2, duration: 0.9, ease: 'easeInOut', delay: 0.35 }, scale: { duration: 0.35, ease: EASE_OUT }, opacity: { duration: 0.3 } } }
            }
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.3, ease: EASE_OUT }}
            className="fixed bottom-[5.5rem] right-4 z-50 sm:right-6"
            role="status"
          >
            <div className="relative max-w-[300px] rounded-2xl border border-signal/30 bg-bg-surface p-4 pr-9 shadow-[0_12px_40px_-8px_rgba(0,0,0,0.3)]">
              {/* brand ring */}
              <span aria-hidden className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-signal/20 motion-safe:animate-pulse" />
              <button
                type="button"
                onClick={() => setNoticeOpen(false)}
                className="absolute right-2 top-2 rounded-md p-1 text-text-muted transition-colors hover:text-text-primary"
                aria-label={c.close}
              >
                <X size={13} aria-hidden="true" />
              </button>
              <div className="flex items-start gap-3">
                <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-signal/30 bg-signal/15">
                  <Bot size={19} className="text-signal" aria-hidden="true" />
                  <span className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-bg-surface bg-emerald-400 motion-safe:animate-pulse" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <p className="mb-1 text-sm font-semibold text-text-primary">
                    {c.title}
                    <span className="ml-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-signal">AI</span>
                  </p>
                  <p className="text-[13px] leading-relaxed text-text-secondary">{c.notice}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={openChat}
                className="glass-cta mt-3 inline-flex w-full items-center justify-center gap-1.5 !py-2 !text-xs"
              >
                <MessageCircle size={13} aria-hidden="true" />
                {c.noticeCta}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* launcher */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full',
          'shadow-none transition-[transform,background-color,color,border-color] duration-150 ease-out',
          'motion-safe:active:scale-[0.97]',
          isOpen ? 'glass-panel !rounded-full text-text-secondary' : 'border border-signal/40 bg-signal text-bg-base motion-safe:hover:scale-105'
        )}
        aria-label={isOpen ? c.close : c.open}
        aria-expanded={isOpen}
      >
        {isOpen ? <X size={22} aria-hidden="true" /> : <MessageCircle size={22} aria-hidden="true" />}
      </button>
    </>
  )
}
