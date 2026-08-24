'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, Bot, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/context/LanguageContext'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export function ChatWidget() {
  const { t } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages, isLoading])

  useEffect(() => {
    return () => {
      abortRef.current?.abort()
    }
  }, [])

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen])

  const sendMessage = useCallback(async (text: string) => {
    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: 'user', content: text }
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setMessages(prev => {
      const updated = [...prev, userMsg]
      fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          messages: [
            { id: 'welcome', role: 'assistant' as const, content: t.chat.welcome },
            ...updated,
          ].map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
      }).then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data.error || t.chat.error)
        }
        const data = await res.json()
        const assistantMsg: ChatMessage = {
          id: data.id || `a-${Date.now()}`,
          role: 'assistant',
          content: data.content,
        }
        setMessages(prev2 => [...prev2, assistantMsg])
      }).catch((err) => {
        if (err instanceof DOMException && err.name === 'AbortError') return
        setError(err instanceof Error ? err.message : t.chat.error)
      }).finally(() => {
        if (!controller.signal.aborted) setIsLoading(false)
      })
      return updated
    })
    setIsLoading(true)
    setError(null)
  }, [t.chat.welcome, t.chat.error])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    const text = input.trim()
    setInput('')
    sendMessage(text)
  }

  const allMessages: ChatMessage[] = [
    { id: 'welcome', role: 'assistant', content: t.chat.welcome },
    ...messages,
  ]

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="glass-panel !rounded-2xl fixed bottom-24 left-4 right-4 z-50 max-h-[min(520px,calc(100dvh-7rem))] flex flex-col shadow-2xl overflow-hidden sm:left-auto sm:right-6 sm:w-[380px]"
            role="dialog"
            aria-modal="false"
            aria-label={t.chat.title}
          >
            <div className="px-4 py-3 border-b border-border/60 bg-bg-base/40 flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-signal/15 border border-signal/25 flex items-center justify-center shrink-0">
                  <Bot size={14} className="text-signal" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-text-primary">{t.chat.title}</p>
                  <p className="text-[10px] text-signal font-mono tracking-wider uppercase flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-signal animate-signal-pulse" aria-hidden="true" />
                    {t.chat.online}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-lg text-text-muted hover:text-signal hover:bg-signal/5 transition-colors"
                aria-label={t.chat.close}
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px]">
              {allMessages.map((msg) => (
                <div key={msg.id} className={cn('flex gap-2.5', msg.role === 'user' ? 'flex-row-reverse' : 'flex-row')}>
                  <div className={cn('w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 border', msg.role === 'user' ? 'bg-bg-elevated border-border' : 'bg-signal/15 border-signal/25')}>
                    {msg.role === 'user' ? <User size={12} className="text-text-secondary" aria-hidden="true" /> : <Bot size={12} className="text-signal" aria-hidden="true" />}
                  </div>
                  <div className={cn('max-w-[80%] min-w-0 px-3 py-2 rounded-xl text-sm leading-relaxed break-words', msg.role === 'user' ? 'bg-bg-elevated text-text-primary rounded-br-sm border border-border' : 'bg-bg-base/60 text-text-secondary rounded-bl-sm border border-border/60')}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-2.5" role="status" aria-live="polite">
                  <span className="sr-only">{t.chat.typing}</span>
                  <div className="w-6 h-6 rounded-full bg-signal/15 border border-signal/25 flex items-center justify-center">
                    <Bot size={12} className="text-signal" aria-hidden="true" />
                  </div>
                  <div className="bg-bg-base/60 border border-border/60 px-3 py-2 rounded-xl rounded-bl-sm">
                    <div className="flex gap-1" aria-hidden="true">
                      <span className="w-1.5 h-1.5 rounded-full bg-signal/60 motion-safe:animate-pulse" />
                      <span className="w-1.5 h-1.5 rounded-full bg-signal/60 motion-safe:animate-pulse [animation-delay:150ms]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-signal/60 motion-safe:animate-pulse [animation-delay:300ms]" />
                    </div>
                  </div>
                </div>
              )}
              {error && (
                <div role="alert" className="text-xs text-status-danger text-center py-2 break-words">
                  {error}
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="p-3 border-t border-border/60 bg-bg-base/40 flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t.chat.placeholder}
                maxLength={2000}
                className="flex-1 min-w-0 glass-input !py-2 !text-sm"
                aria-label={t.chat.placeholder}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg glass-cta !px-3 disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label={t.chat.send}
              >
                <Send size={16} aria-hidden="true" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          'fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center',
          'transition-colors shadow-none',
          isOpen ? 'glass-panel !rounded-full text-text-secondary' : 'bg-signal text-bg-base border border-signal/40'
        )}
        aria-label={isOpen ? t.chat.close : t.chat.open}
        aria-expanded={isOpen}
      >
        {isOpen ? <X size={22} aria-hidden="true" /> : <MessageCircle size={22} aria-hidden="true" />}
      </motion.button>
    </>
  )
}
