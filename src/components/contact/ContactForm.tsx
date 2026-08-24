'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { Send, CheckCircle2, AlertCircle, ArrowLeft, ArrowRight, Phone } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/context/LanguageContext'

type FormState = 'idle' | 'loading' | 'success' | 'error'

interface FormData {
  name: string
  email: string
  phone: string
  company: string
  subject: string
  message: string
}

const TOTAL_STEPS = 3

export function ContactForm() {
  const { t } = useLanguage()
  const searchParams = useSearchParams()
  const presetSubject = searchParams.get('subject')
  const initialSubject = presetSubject || t.contactForm.subjects[0]

  const [formState, setFormState] = useState<FormState>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [step, setStep] = useState(1)
  const [data, setData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    company: '',
    subject: initialSubject,
    message: '',
  })

  const c = t.contactForm

  const set = (patch: Partial<FormData>) => setData((prev) => ({ ...prev, ...patch }))

  const step1Valid = data.subject.trim().length > 0
  const step2Valid = data.message.trim().length >= 10
  const step3Valid = data.name.trim().length >= 2 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)

  const next = () => {
    if (step === 1 && step1Valid) setStep(2)
    else if (step === 2 && step2Valid) setStep(3)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormState('loading')
    setErrorMessage('')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, company: data.company || undefined, phone: data.phone || undefined }),
      })
      const result = await res.json()
      if (!res.ok || !result.success) throw new Error(result.error?.message || 'Something went wrong')
      setFormState('success')
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'An unexpected error occurred')
      setFormState('error')
    }
  }

  if (formState === 'success') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
        className="signal-panel-highlight flex h-full min-h-[480px] flex-col items-center justify-center p-10 text-center"
        role="status"
      >
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-md border border-signal/30 bg-signal/10">
          <CheckCircle2 size={30} className="text-signal" />
        </div>
        <div className="label-mono text-signal/70 mb-3">TRANSMISSION.COMPLETE</div>
        <h3 className="font-display text-2xl font-bold text-text-primary mb-3">{c.successTitle}</h3>
        <p className="text-text-secondary text-sm leading-relaxed max-w-sm mb-6">{c.successDesc}</p>
        <button
          onClick={() => {
            setFormState('idle')
            setStep(1)
            setData({ name: '', email: '', phone: '', company: '', subject: t.contactForm.subjects[0], message: '' })
          }}
          className="signal-secondary"
        >
          {c.successReset}
        </button>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
      className="signal-panel p-6 md:p-8"
    >
      {/* progress header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <span className="label-mono text-signal/80">QUOTE.REQUEST</span>
          <span className="label-mono text-text-muted">
            {c.stepOf.replace('{n}', String(step)).replace('{total}', String(TOTAL_STEPS))}
          </span>
        </div>
        {/* progress bar */}
        <div className="mt-3 flex gap-1.5">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div
              key={i}
              className={cn(
                'h-1 flex-1 rounded-full transition-colors',
                i + 1 <= step ? 'bg-[var(--signal)]' : 'bg-[var(--border-color)]'
              )}
            />
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
            >
              <h3 className="font-display text-xl font-semibold text-text-primary">{c.step1Title}</h3>
              <p className="mt-1 text-sm text-text-secondary">{c.step1Desc}</p>

              <div className="mt-5 grid gap-2">
                {t.contactForm.subjects.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => set({ subject: opt })}
                    className={cn(
                      'flex items-center justify-between rounded-lg border px-4 py-3 text-left text-sm transition-colors',
                      data.subject === opt
                        ? 'border-[var(--signal)] bg-[var(--signal-soft)] text-[var(--text-primary)]'
                        : 'border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:border-[var(--signal)]'
                    )}
                  >
                    {opt}
                    {data.subject === opt && <CheckCircle2 size={16} className="text-[var(--signal)]" />}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
            >
              <h3 className="font-display text-xl font-semibold text-text-primary">{c.step2Title}</h3>
              <p className="mt-1 text-sm text-text-secondary">{c.step2Desc}</p>

              <div className="mt-5 space-y-4">
                <div>
                  <label htmlFor="company" className="mb-1.5 block text-sm font-medium text-text-secondary">
                    {c.companyLabel}
                  </label>
                  <input
                    id="company" name="company" type="text"
                    value={data.company} onChange={(e) => set({ company: e.target.value })}
                    placeholder={c.companyPlaceholder} className="glass-input"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-text-secondary">
                    {c.messageLabel} <span className="text-signal">{c.required}</span>
                  </label>
                  <textarea
                    id="message" name="message" required rows={6}
                    value={data.message} onChange={(e) => set({ message: e.target.value })}
                    placeholder={c.messagePlaceholder}
                    className="glass-input resize-none"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
            >
              <h3 className="font-display text-xl font-semibold text-text-primary">{c.step3Title}</h3>
              <p className="mt-1 text-sm text-text-secondary">{c.step3Desc}</p>

              <div className="mt-5 space-y-4">
                <div>
                  <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-text-secondary">
                    {c.nameLabel} <span className="text-signal">{c.required}</span>
                  </label>
                  <input
                    id="name" name="name" type="text" required
                    value={data.name} onChange={(e) => set({ name: e.target.value })}
                    placeholder={c.namePlaceholder} className="glass-input"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-text-secondary">
                    {c.emailLabel} <span className="text-signal">{c.required}</span>
                  </label>
                  <input
                    id="email" name="email" type="email" required
                    value={data.email} onChange={(e) => set({ email: e.target.value })}
                    placeholder={c.emailPlaceholder} className="glass-input"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-text-secondary">
                    {c.phoneLabel}
                  </label>
                  <div className="relative">
                    <Phone size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-faint)]" />
                    <input
                      id="phone" name="phone" type="tel"
                      value={data.phone} onChange={(e) => set({ phone: e.target.value })}
                      placeholder={c.phonePlaceholder} className="glass-input pl-9"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {formState === 'error' && (
          <div role="alert" className="mt-4 flex items-center gap-2.5 rounded-md border border-status-danger/25 bg-status-danger/10 p-3 text-sm text-status-danger">
            <AlertCircle size={15} className="flex-shrink-0" />
            {errorMessage || c.errorMsg}
          </div>
        )}

        {/* nav buttons */}
        <div className="mt-6 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            disabled={step === 1}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors',
              step === 1 ? 'invisible' : 'text-[var(--text-secondary)] hover:text-[var(--signal)]'
            )}
          >
            <ArrowLeft size={15} />
            {c.back}
          </button>

          {step < 3 ? (
            <button
              type="button"
              onClick={next}
              disabled={step === 1 ? !step1Valid : !step2Valid}
              className="signal-cta disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {c.next}
              <ArrowRight size={15} />
            </button>
          ) : (
            <button type="submit" disabled={formState === 'loading' || !step3Valid} className="signal-cta disabled:opacity-50 disabled:cursor-not-allowed">
              {formState === 'loading' ? (
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <Send size={15} />
              )}
              {formState === 'loading' ? c.sending : c.done}
            </button>
          )}
        </div>

        <p className="mt-4 text-center text-xs font-mono text-text-muted">{c.footerNote}</p>
      </form>
    </motion.div>
  )
}