'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckCheck, Send, LogOut, RefreshCw, MessageSquareText } from 'lucide-react'
import { cn } from '@/lib/utils'

interface QueueItem {
  id: string
  name: string | null
  email: string | null
  language: string
  status: string
  pageUrl: string | null
  updatedAt: string
  lastMessage: string
  /** Signed magic-link token minted for THIS session — tokens are HMAC-bound
   * to the session id, so each queue entry needs its own. */
  token: string
}

interface Msg {
  id: string
  role: string
  content: string
  templateId?: string | null
  createdAt: string
}

/**
 * Live-support console for the human agent. Reached through the signed magic
 * link emailed on escalation — token in the URL is the only credential. Shows
 * the waiting/active queue, the conversation, and canned reply templates in
 * the visitor's language. Polls every 4s while open.
 */

interface Template {
  id: string
  label: Record<string, string>
  body: Record<string, string>
}

export function SupportConsole({
  templates,
  sessionOverride,
  sessionToken,
}: {
  templates: Template[]
  /** Admin-embedded mode: session id + signed token come from the server
   * component instead of the magic-link URL. */
  sessionOverride?: string
  sessionToken?: string
}) {
  const params = useSearchParams()
  const sessionId = sessionOverride || params.get('session') || ''
  const token = sessionToken || params.get('token') || ''

  const [session, setSession] = useState<{
    name?: string | null; email?: string | null; language: string; status: string; pageUrl?: string | null
  } | null>(null)
  const [messages, setMessages] = useState<Msg[]>([])
  const [queue, setQueue] = useState<QueueItem[]>([])
  const [input, setInput] = useState('')
  const [showTemplates, setShowTemplates] = useState(false)
  const [sending, setSending] = useState(false)
  const [authed, setAuthed] = useState<boolean | null>(null)
  const [visitorTyping, setVisitorTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const lastTypingPing = useRef(0)

  const authQuery = `session=${encodeURIComponent(sessionId)}&token=${encodeURIComponent(token)}`

  const load = useCallback(async () => {
    if (!sessionId || !token) { setAuthed(false); return }
    try {
      // no-store: the 4s poll repeats the same URL — never let HTTP cache
      // serve a stale session (typing flags, new messages).
      const res = await fetch(`/api/support/agent?${authQuery}`, { cache: 'no-store' })
      if (res.status === 401) { setAuthed(false); return }
      const d = await res.json()
      if (d.success) {
        setAuthed(true)
        setSession(d.data)
        setMessages(d.data.messages)
        setVisitorTyping(!!d.data.visitorTyping)
      } else setAuthed(false)
    } catch { setAuthed(false) }
  }, [authQuery, sessionId, token])

  const loadQueue = useCallback(async () => {
    if (!sessionId || !token) return
    try {
      const res = await fetch(`/api/support/agent?${authQuery}&list=1&_=${Date.now()}`, { cache: 'no-store' })
      const d = await res.json()
      if (d.success) setQueue(d.data.sessions)
    } catch { /* ignore */ }
  }, [authQuery, sessionId, token])

  useEffect(() => { load(); loadQueue() }, [load, loadQueue])

  useEffect(() => {
    const t = setInterval(() => { load(); loadQueue() }, 4000)
    return () => clearInterval(t)
  }, [load, loadQueue])

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages])

  const send = async (content: string, templateId?: string) => {
    if (!content.trim() || sending) return
    setSending(true)
    try {
      await fetch('/api/support/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session: sessionId, token, content, templateId }),
      })
      setInput('')
      setShowTemplates(false)
      await load()
    } finally { setSending(false) }
  }

  /* Agent typing ping — throttled to one PATCH per ~3s while keys flow. The
     flag self-expires in ~6s on the server, so no explicit "stopped" signal
     is needed: pings stop when the input empties and it quietly lapses. */
  const pingAgentTyping = useCallback(() => {
    const now = Date.now()
    if (now - lastTypingPing.current < 3000) return
    lastTypingPing.current = now
    fetch('/api/support/agent', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session: sessionId, token, side: 'agent', typing: true }),
    }).catch(() => { /* transient */ })
  }, [sessionId, token])

  const close = async () => {
    await fetch(`/api/support/agent?${authQuery}`, { method: 'DELETE' })
    await load()
  }

  const lang = (session?.language || 'en') as 'en' | 'zh' | 'zh-CN'

  if (authed === false) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <div className="rounded-xl border border-status-danger/25 bg-status-danger/5 p-6 text-center text-sm text-status-danger max-w-md">
          This support link is invalid or has expired. Request a new link by escalating a chat again.
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-text-muted">
        Loading session…
      </div>
    )
  }

  const ended = session.status === 'closed'

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="label-mono mb-1 text-signal">SUPPORT.CONSOLE</p>
          <h1 className="font-display text-2xl font-semibold text-text-primary">
            {session.name || 'Visitor'}
            <span className="ml-2 rounded-sm border border-signal/25 bg-signal/10 px-1.5 py-0.5 align-middle font-mono text-[10px] uppercase tracking-[0.14em] text-signal">
              {session.status}
            </span>
            <span className="ml-2 rounded-sm border border-border bg-bg-elevated px-1.5 py-0.5 align-middle font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted">
              {session.language}
            </span>
          </h1>
          {session.email && <p className="mt-1 font-mono text-xs text-text-muted">{session.email}</p>}
          {session.pageUrl && <p className="mt-0.5 font-mono text-[10px] text-text-muted/70">{session.pageUrl}</p>}
        </div>
        <div className="flex gap-2">
          <button onClick={() => { load(); loadQueue() }} className="signal-secondary !px-3" aria-label="Refresh">
            <RefreshCw size={15} />
          </button>
          {!ended && (
            <button onClick={close} className="signal-secondary !px-3 !text-status-danger" aria-label="Close conversation">
              <LogOut size={15} />
            </button>
          )}
        </div>
      </div>

      {queue.length > 1 && (
        <div className="mb-5 rounded-lg border border-border bg-bg-surface p-3">
          <p className="label-mono mb-2 text-text-muted">OPEN SESSIONS ({queue.length})</p>
          <ul className="space-y-1">
            {queue.filter((q) => q.id !== sessionId).map((q) => (
              <li key={q.id} className="flex items-center justify-between gap-3 text-xs">
                <span className="truncate text-text-secondary">
                  <span className={cn('mr-2 rounded-sm px-1.5 py-0.5 font-mono text-[10px] uppercase', q.status === 'waiting' ? 'bg-status-warning/10 text-status-warning' : 'bg-signal/10 text-signal')}>
                    {q.status}
                  </span>
                  {q.name || 'Visitor'} · {q.lastMessage.slice(0, 40)}
                </span>
                <a
                  href={`/support/console?session=${q.id}&token=${encodeURIComponent(q.token)}`}
                  className="shrink-0 font-mono text-[11px] text-signal hover:underline"
                >
                  open →
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="rounded-xl border border-border bg-bg-surface">
        <div ref={scrollRef} className="max-h-[46vh] space-y-3 overflow-y-auto p-4">
          {messages.map((m) => (
            <div key={m.id} className={cn('flex', m.role === 'visitor' ? 'justify-start' : m.role === 'agent' ? 'justify-end' : 'justify-center')}>
              {m.role === 'system' ? (
                <span className="rounded-full border border-border bg-bg-elevated px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted">
                  conversation ended
                </span>
              ) : (
                <div className={cn(
                  'max-w-[80%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed break-words',
                  m.role === 'visitor'
                    ? 'rounded-bl-sm border border-border/60 bg-bg-base/60 text-text-secondary'
                    : 'rounded-br-sm border border-signal/25 bg-signal/10 text-text-primary'
                )}>
                  {m.role === 'agent' && m.templateId && (
                    <span className="mb-1 flex items-center gap-1 font-mono text-[9px] uppercase tracking-[0.14em] text-signal/70">
                      <MessageSquareText size={9} /> template
                    </span>
                  )}
                  {m.content}
                </div>
              )}
            </div>
          ))}
          {visitorTyping && !ended && (
            <div className="flex justify-start" role="status" aria-live="polite">
              <div className="flex items-center gap-1 rounded-xl rounded-bl-sm border border-border/60 bg-bg-base/60 px-4 py-3">
                <span className="flex gap-1.5" aria-hidden="true">
                  <span className="h-2 w-2 rounded-full bg-text-muted motion-safe:animate-bounce" />
                  <span className="h-2 w-2 rounded-full bg-text-muted motion-safe:animate-bounce [animation-delay:150ms]" />
                  <span className="h-2 w-2 rounded-full bg-text-muted motion-safe:animate-bounce [animation-delay:300ms]" />
                </span>
                <span className="sr-only">Visitor is typing</span>
              </div>
            </div>
          )}
          {ended && messages[messages.length - 1]?.role !== 'system' && (
            <div className="flex justify-center">
              <span className="rounded-full border border-border bg-bg-elevated px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted">
                conversation ended
              </span>
            </div>
          )}
        </div>

        {!ended && (
          <div className="border-t border-border/60">
            {showTemplates && (
              <div className="max-h-52 space-y-1 overflow-y-auto border-b border-border/60 bg-bg-base/40 p-3">
                {templates.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => send(t.body[lang] || t.body.en, t.id)}
                    className="w-full rounded-lg border border-border bg-bg-surface px-3 py-2 text-left text-xs text-text-secondary transition-colors hover:border-signal/40 hover:text-text-primary"
                  >
                    <span className="mb-0.5 block font-mono text-[10px] uppercase tracking-[0.14em] text-signal">{t.label[lang] || t.label.en}</span>
                    {(t.body[lang] || t.body.en).slice(0, 90)}…
                  </button>
                ))}
              </div>
            )}
            <div className="flex gap-2 p-3">
              <button
                type="button"
                onClick={() => setShowTemplates((v) => !v)}
                className={cn('inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border transition-colors',
                  showTemplates ? 'border-signal/40 bg-signal/10 text-signal' : 'border-border text-text-muted hover:text-signal')}
                aria-label="Canned templates"
                title="Canned templates"
              >
                <MessageSquareText size={16} />
              </button>
              <input
                value={input}
                onChange={(e) => { setInput(e.target.value); pingAgentTyping() }}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input) } }}
                placeholder={`Reply in ${lang === 'en' ? 'English' : lang === 'zh' ? '繁體中文' : '简体中文'}…`}
                maxLength={4000}
                className="glass-input flex-1 !py-2 !text-sm"
              />
              <button
                type="button"
                onClick={() => send(input)}
                disabled={sending || !input.trim()}
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg glass-cta !px-3 disabled:opacity-40"
                aria-label="Send reply"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      <p className="mt-4 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted">
        <CheckCheck size={12} className="text-signal" />
        replies appear in the visitor&apos;s chat within ~4s
      </p>
    </div>
  )
}
