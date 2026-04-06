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

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages, isLoading])

  const sendMessage = useCallback(async (text: string) => {
    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: 'user', content: text }
    setMessages(prev => [...prev, userMsg])
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to get response')
      }

      const data = await res.json()
      const assistantMsg: ChatMessage = {
        id: data.id || `a-${Date.now()}`,
        role: 'assistant',
        content: data.content,
      }
      setMessages(prev => [...prev, assistantMsg])
    } catch (err) {
      setError(err instanceof Error ? err.message : t.chat.error)
    } finally {
      setIsLoading(false)
    }
  }, [messages, t.chat.error])

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
            className="fixed bottom-24 right-6 z-50 w-[380px] max-h-[520px] flex flex-col rounded-2xl border border-border bg-bg-surface shadow-2xl overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-border bg-bg-elevated flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-accent-cyan/15 flex items-center justify-center">
                  <Bot size={14} className="text-accent-cyan" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-primary">{t.chat.title}</p>
                  <p className="text-xs text-accent-cyan">{t.chat.online}</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-surface transition-colors">
                <X size={16} />
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px]">
              {allMessages.map((msg) => (
                <div key={msg.id} className={cn('flex gap-2.5', msg.role === 'user' ? 'flex-row-reverse' : 'flex-row')}>
                  <div className={cn('w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5', msg.role === 'user' ? 'bg-accent-purple/15' : 'bg-accent-cyan/15')}>
                    {msg.role === 'user' ? <User size={12} className="text-accent-purple" /> : <Bot size={12} className="text-accent-cyan" />}
                  </div>
                  <div className={cn('max-w-[80%] px-3 py-2 rounded-xl text-sm leading-relaxed', msg.role === 'user' ? 'bg-accent-purple/10 text-text-primary rounded-br-sm' : 'bg-bg-elevated text-text-secondary rounded-bl-sm')}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-accent-cyan/15 flex items-center justify-center">
                    <Bot size={12} className="text-accent-cyan" />
                  </div>
                  <div className="bg-bg-elevated px-3 py-2 rounded-xl rounded-bl-sm">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              {error && <div className="text-xs text-red-400 text-center py-2">{error}</div>}
            </div>

            <form onSubmit={handleSubmit} className="p-3 border-t border-border bg-bg-elevated flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t.chat.placeholder}
                className="flex-1 px-3 py-2 bg-bg-surface border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-cyan/50 focus:ring-1 focus:ring-accent-cyan/30"
              />
              <button type="submit" disabled={isLoading || !input.trim()} className="p-2 rounded-lg bg-accent-cyan text-bg-base hover:bg-accent-cyan-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                <Send size={16} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          'fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center',
          'shadow-glow-cyan transition-colors',
          isOpen ? 'bg-bg-elevated border border-border text-text-secondary' : 'bg-accent-cyan text-bg-base'
        )}
      >
        {isOpen ? <X size={22} /> : <MessageCircle size={22} />}
      </motion.button>
    </>
  )
}
